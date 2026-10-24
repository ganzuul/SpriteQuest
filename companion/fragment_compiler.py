#!/usr/bin/env python3
"""
companion/fragment_compiler.py

SpriteQuest Fragment Compiler & Prompt Rewriter Engine.

Gathers and compiles semantic lore fragments from `library/fragments/`,
combining the look of the world, architectural materials, physical specs
(mass, dimensions, obstacle types, affordances), and stylistic doctrine
into an enriched, non-bland diffusion prompt for Black Forest Labs Flux 3 Klein.

Follows the QWEN.md 4th-wall translation rule and the library/README.md specification:
    fragment ──compose──> compiled brief ──rewrite──> diffusion prompt ──render──> asset
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
FRAGMENTS_DIR = REPO_ROOT / "library" / "fragments"
PLANS_DIR = REPO_ROOT / "library" / "plans"

# Doctrine fragments loaded for all orthographic game asset batches
CORE_DOCTRINE_FRAGMENTS = [
    "shared/single-face-reading",
    "shared/fasteners-on-their-own-face",
    "shared/seam-lines",
]

# Scene-to-fragments mapping for world setting context
SCENE_WORLD_FRAGMENTS = {
    "customs-house": [
        "customs-house/the-site",
        "customs-house/two-questions",
    ],
    "border-march": [
        "customs-house/the-site",
        "grey-wind/mountain-passage",
    ],
    "cartographers": [
        "cartographers/unwritten-borders",
        "cartographers/epistemic-survey",
    ],
    "space-vampires": [
        "space-vampires/technological-instrumentation",
        "space-vampires/anti-life-entropy",
    ],
    "wizard-tower": [
        "wizard-tower/the-shelf",
        "wizard-tower/the-grimoire",
    ],
}

# World architectural style descriptions
WORLD_LOOK_DESCRIPTIONS = {
    "customs-house": {
        "setting": "Imperial Frontier Customs House in the bitter mountain pass",
        "materials": "weathered Baltic pine slats, rough-cut salt-frosted granite, black forged iron corner brackets, hammered copper rivets, bistre ink, official red wax clearance seals",
        "lighting": "chilly alpine daylight with warm interior hearth spill, soft key light from top-left, contact ground occlusion shadow",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated subject on neutral solid grey background, sharp silhouette, crisp alpha-ready edges",
    },
    "cartographers": {
        "setting": "Bureau of the Unwritten Atlas Cartographic Archive",
        "materials": "heavy vellum parchment, brass cartouche corner brackets, gold-leaf contour topography lines, ink-stamped surveyor rose compasses, polished mahogany trestles",
        "lighting": "neutral archival daylight, soft studio illumination from top-left, subtle contact shadow",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated subject on neutral solid grey background, crisp silhouette",
    },
    "space-vampires": {
        "setting": "Cryo-Reliquary Vault of the Stasis Merchant House",
        "materials": "thick leaded glass, dark bismuth-alloy structural struts, frosted interior condensation, glowing cyan runic coolant conduits, damp iron brackets",
        "lighting": "chilled cyan bioluminescent underglow with soft top-down ambient light, subtle ground reflection",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated on flat neutral grey background",
    },
    "wizard-tower": {
        "setting": "The High Wizard's Chamber and Grimoire Shelf",
        "materials": "blackened oak timber, iron book clasps, ancient calfskin bindings with silver sigil inlays, tallow candle drippings",
        "lighting": "warm directional lantern light, sharp silhouette, soft contact shadow",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated on neutral grey background",
    },
    "grey-wind": {
        "setting": "The High Pass of the Grey Wind",
        "materials": "glacial shale, lichens, weathered fieldstone, hammered iron spikes, weathered ash wood",
        "lighting": "cold overcast mountain light, crisp shadows",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated on neutral grey background",
    },
}


def load_fragment(fragment_id: str) -> dict[str, Any] | None:
    """Load and parse a fragment JSON from library/fragments."""
    if not fragment_id:
        return None
    path = FRAGMENTS_DIR / f"{fragment_id}.json"
    if not path.is_file():
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError):
        return None


def resolve_asset_fragments(fragment_id: str, scene_id: str = "customs-house") -> list[dict[str, Any]]:
    """Gather primary asset fragment, scene fragments, and doctrine fragments."""
    fragments = []
    seen = set()

    # 1. Primary fragment of the asset
    primary = load_fragment(fragment_id)
    if primary:
        fragments.append(primary)
        seen.add(primary.get("id"))

    # 2. Scene / world fragments
    for fid in SCENE_WORLD_FRAGMENTS.get(scene_id, SCENE_WORLD_FRAGMENTS["customs-house"]):
        if fid not in seen:
            frag = load_fragment(fid)
            if frag:
                fragments.append(frag)
                seen.add(fid)

    # 3. Core doctrine fragments (fasteners, single-face, seam-lines)
    for fid in CORE_DOCTRINE_FRAGMENTS:
        if fid not in seen:
            frag = load_fragment(fid)
            if frag:
                fragments.append(frag)
                seen.add(fid)

    return fragments


@dataclass
class CompiledAssetBrief:
    asset_id: str
    label: str
    fragment_id: str
    scene_id: str
    physical_specs: str
    world_look: dict[str, str]
    fragments_used: list[str]
    compiled_brief: str
    rewritten_prompt: str
    negative_prompt: str


def compile_asset_brief(asset: Any, scene_id: str = "customs-house") -> CompiledAssetBrief:
    """
    Compile asset specifications and lore fragments into a rich, world-anchored brief.
    Handles both dicts and FragmentAsset dataclass instances.
    """
    asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "unknown_asset")
    label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else asset_id)
    fragment_id = getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "customs-house/the-site")
    mass_kg = getattr(asset, "mass_kg", None) if not isinstance(asset, dict) else asset.get("mass_kg")
    bounds = getattr(asset, "bounds", None) if not isinstance(asset, dict) else asset.get("bounds", {})
    obstacle_type = getattr(asset, "obstacle_type", None) if not isinstance(asset, dict) else asset.get("obstacle_type", "physics_object")
    lore_snippet = getattr(asset, "lore_snippet", None) if not isinstance(asset, dict) else asset.get("lore_snippet", "")
    base_prompt = getattr(asset, "diffusion_prompt", "") if not isinstance(asset, dict) else asset.get("diffusion_prompt", "")

    # Resolve world look
    world_look = WORLD_LOOK_DESCRIPTIONS.get(scene_id, WORLD_LOOK_DESCRIPTIONS["customs-house"])

    # Gather fragments
    fragments = resolve_asset_fragments(fragment_id, scene_id)
    fragments_used = [f.get("id", "") for f in fragments if f.get("id")]

    # Build physical specifications string
    phys_parts = []
    if bounds and isinstance(bounds, dict):
        w = bounds.get("width") or bounds.get("w")
        d = bounds.get("depth") or bounds.get("d") or bounds.get("length")
        h = bounds.get("height") or bounds.get("h")
        if w and d and h:
            phys_parts.append(f"{w:.1f}m x {d:.1f}m x {h:.1f}m bounding box")
    if mass_kg is not None:
        phys_parts.append(f"mass: {mass_kg:.1f}kg")
    if obstacle_type:
        phys_parts.append(f"type: {obstacle_type.replace('_', ' ')}")
    physical_specs = ", ".join(phys_parts) if phys_parts else "standard bounding specification"

    # Assemble compiled world brief
    brief_lines = [
        f"Subject: {label} (asset ID: {asset_id}).",
        f"World Context: {world_look['setting']}.",
        f"Physicality: {physical_specs}.",
        f"Material Properties: {world_look['materials']}.",
    ]
    if lore_snippet:
        brief_lines.append(f"Lore & Provenance: {lore_snippet}")

    # Extract specific fragment details
    for f in fragments:
        detail = f.get("detail", "").strip()
        if detail:
            brief_lines.append(f"- [{f.get('id')}]: {detail}")

    compiled_brief = "\n".join(brief_lines)

    # Execute prompt rewriter step (synthesizing the final Black Forest Labs Flux 3 Klein prompt)
    rewritten_prompt = rewrite_prompt(
        label=label,
        asset_id=asset_id,
        physical_specs=physical_specs,
        world_look=world_look,
        fragments=fragments,
        base_prompt=base_prompt,
    )

    negative_prompt = (
        "ugly, blurry, low quality, artifacts, watermark, signature, distorted geometry, "
        "photographic full-room background, busy wall environment, camera perspective distortion, "
        "cutoff silhouette, extra floating items, chaotic composition"
    )

    return CompiledAssetBrief(
        asset_id=asset_id,
        label=label,
        fragment_id=fragment_id,
        scene_id=scene_id,
        physical_specs=physical_specs,
        world_look=world_look,
        fragments_used=fragments_used,
        compiled_brief=compiled_brief,
        rewritten_prompt=rewritten_prompt,
        negative_prompt=negative_prompt,
    )


def rewrite_prompt(
    label: str,
    asset_id: str,
    physical_specs: str,
    world_look: dict[str, str],
    fragments: list[dict[str, Any]],
    base_prompt: str = "",
) -> str:
    """
    Prompt Rewriter Step:
    Applies the SpriteQuest prompt-refinement rules (material construction,
    fasteners on their own face, seam lines, clean silhouette, 2.5D orthographic
    elevation) to transform the compiled brief into a vivid, non-bland diffusion prompt.
    """
    # Key visual qualities tailored to archetype
    archetype_modifiers = []

    if "crate" in asset_id or "crate" in label.lower():
        archetype_modifiers.extend([
            "standardized rectangular shipping crate demanding arithmetic clearance",
            "constructed from thick rough-sawn Baltic pine slats with coarse timber grain",
            "heavy black cold-rolled iron corner brackets fastened with proud slotted screws",
            "stark black industrial stencil lettering 'R6-SHIP' across center slats",
            "official imperial customs clearance seal stamped in crimson wax and bistre ink on pine",
        ])
    elif "desk" in asset_id or "ledger" in asset_id:
        archetype_modifiers.extend([
            "elevated quartermaster high desk crafted from dark seasoned timber",
            "deeply scarred work surface stained with ink wells and tallow drips",
            "massive brass-bound two-column ledger open on desk face with ruled bistre lines",
            "heavy counterbalanced brass balance scale and cast bronze clearance seal stamp",
            "iron reinforcement brackets and perimeter gallery rail",
        ])
    elif "coffin" in asset_id or "stasis" in asset_id or "cryo" in asset_id:
        archetype_modifiers.extend([
            "hexagonal cryogenic stasis casket of heavy leaded glass reinforced with dark bismuth-alloy struts",
            "chilled frosted glass face with internal condensation droplets",
            "glowing cyan runic coolant tubes running through reinforced side manifolds",
            "suspension chamber reliquary on heavy damp-iron footings",
        ])
    elif "atlas" in asset_id or "living_atlas" in asset_id:
        archetype_modifiers.extend([
            "monumental multi-leaved cartographic codex open upon an articulated oak trestle",
            "illuminated heavy vellum leaves depicting shifting contour terrain topography in bistre ink",
            "gold-leaf coordinate cartouches, surveyor rose compass star, and stamped wax canon seals",
            "brass binding clasps and leather indexing tabs",
        ])
    elif "table" in asset_id or "weigh" in asset_id:
        archetype_modifiers.extend([
            "heavy timber inspection weigh table with hand-beaten zinc counter cladding",
            "riveted zinc sheet perimeter with hammered copper nails",
            "cast iron counterweight scale beam with brass pan clattering on zinc face",
        ])
    elif "wardrobe" in asset_id or "forfeit" in asset_id:
        archetype_modifiers.extend([
            "tall impounded forfeit wardrobe constructed from dark split-pine timbers",
            "black iron strap hinges spanning full door width with hand-peened rivets",
            "forged padlock hasp stamped with customs house forfeiture mark",
        ])
    elif "statute" in asset_id:
        archetype_modifiers.extend([
            "heavy timber-framed proclamation board mounted on sturdy granite footing",
            "layered yellowed legal parchment sheets nailed to cork backing with copper tacks",
            "formal imperial statute text in tight blackletter calligraphy with red rubrication",
        ])
    elif "grimoire" in asset_id or "lectern" in asset_id:
        archetype_modifiers.extend([
            "ancient carved walnut reading lectern with iron book-rest brackets",
            "massive grimoire bound in dark calfskin with embossed silver arcane sigils",
            "clasps fastened at the fore-edge reaching across to cover with aged parchment pages",
        ])
    elif "cairn" in asset_id:
        archetype_modifiers.extend([
            "conical wayfinding stone cairn of flat weathered mountain slate blocks",
            "lichens clinging to crevices, chisel-cut waypoint glyph on central marker stone",
        ])
    else:
        # Default enricher
        clean_base = base_prompt.replace("orthographic top-down game asset, ", "").replace(", pure white background, pixel-perfect isometric asset, 1024x1024", "")
        if clean_base:
            archetype_modifiers.append(clean_base)
        else:
            archetype_modifiers.append(f"{label}, tactile pre-industrial construction with visible joints and weathered timber grain")

    # Combine into prompt clauses
    subject_clause = ", ".join(archetype_modifiers)
    materials_clause = world_look["materials"]
    framing_clause = world_look["framing"]
    lighting_clause = world_look["lighting"]

    prompt_parts = [
        "orthographic top-down 2.5D isometric game asset cutout",
        f"{subject_clause}",
        f"crafted with {materials_clause}",
        f"isolated on neutral solid grey background (#707070), no background walls, no room floors, perfectly clean silhouette, ready for alpha matting",
        f"subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath base",
        "crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024",
    ]

    return ", ".join(prompt_parts)
