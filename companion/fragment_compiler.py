#!/usr/bin/env python3
"""
companion/fragment_compiler.py

SpriteQuest Fragment Compiler & Prompt Rewriter Engine.

Gathers, validates, and compiles semantic lore fragments from `library/fragments/`
under explicit asset recipes. Rejects unprescribed fragments and grab-bag pollution.
Derives structural construction, fasteners, and affordance mechanics deterministically
from physical parameters (mass, dimensions, obstacle types, affordances) and world context,
enforcing the strict separation between rewriter doctrine (`for: gemma4-orion`) and
sampler details (`for: diffusion`) for Black Forest Labs Flux 3 Klein.

Follows the QWEN.md 4th-wall translation rule and the library/README.md specification:
    fragment ──compose (recipe)──> compiled brief ──rewrite──> diffusion prompt ──render──> asset
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
FRAGMENTS_DIR = REPO_ROOT / "library" / "fragments"
PLANS_DIR = REPO_ROOT / "library" / "plans"

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


# Explicit Compilation Recipes
# Selection is an explicit authored recipe per archetype: no indiscriminate dumping.
ASSET_RECIPES: dict[str, dict[str, Any]] = {
    "crate_freight": {
        "archetype": "crate_freight",
        "description": "Standardized freight shipping crate demanding arithmetic clearance",
        "allowed_fragments": {
            "customs-house/r6-ship",
            "shared/glyph-customs-seal",
            "shared/seam-lines",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_crate_physics(mass_kg, bounds, verbs),
    },
    "station_desk": {
        "archetype": "station_desk",
        "description": "Administrative ledger workstation and customs counter",
        "allowed_fragments": {
            "customs-house/hollis-ledger",
            "customs-house/two-questions",
            "shared/glyph-customs-seal",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_desk_physics(mass_kg, bounds, verbs),
    },
    "weigh_scale": {
        "archetype": "weigh_scale",
        "description": "Inspection counter and counterbalanced balance scale",
        "allowed_fragments": {
            "customs-house/first-clearance-beats",
            "shared/glyph-customs-seal",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_weigh_table_physics(mass_kg, bounds, verbs),
    },
    "containment_relic": {
        "archetype": "containment_relic",
        "description": "Hermetic pressurized cryo-containment casket",
        "allowed_fragments": {
            "space-vampires/glass-stasis-coffin",
            "space-vampires/glyph-entropy-matrix",
            "space-vampires/technological-instrumentation",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_cryo_physics(mass_kg, bounds, verbs),
    },
    "monumental_document": {
        "archetype": "monumental_document",
        "description": "Monumental codex, proclamation board, arcane grimoire, or certified warrant",
        "allowed_fragments": {
            "cartographers/the-living-atlas",
            "cartographers/canon-warrant",
            "cartographers/glyph-surveyor-rose",
            "wizard-tower/the-grimoire",
            "shared/glyph-grimoire-sigil",
            "customs-house/statutes",
            "shared/glyph-customs-seal",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
            "shared/brief-faces-are-themes",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_document_physics(mass_kg, bounds, verbs),
    },
    "barrier_gate": {
        "archetype": "barrier_gate",
        "description": "Transit boom gate or riveted iron forfeit wicket",
        "allowed_fragments": {
            "customs-house/forfeit-corridor",
            "shared/seam-lines",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_gate_physics(mass_kg, bounds, verbs),
    },
    "waypoint_marker": {
        "archetype": "waypoint_marker",
        "description": "Mountain cairn, border signpost, or iron brazier fixture",
        "allowed_fragments": {
            "grey-wind/mountain-passage",
            "grey-wind/glyph-stone-horizon",
            "customs-house/the-site",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_marker_physics(mass_kg, bounds, verbs),
    },
    "unmodelled_slab": {
        "archetype": "unmodelled_slab",
        "description": "Underwritten wireframe placeholder slab awaiting prompt specification",
        "allowed_fragments": {
            "shared/unmodelled-prop",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_unmodelled_physics(mass_kg, bounds, verbs),
    },
}


# --- Physics and Structural Derivations ---

def _derive_crate_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 45.0
    dims = f"{bounds.get('width', 1.2):.1f}m x {bounds.get('depth', 1.2):.1f}m x {bounds.get('height', 1.0):.1f}m"
    details = [f"bounding dimensions {dims}, physical mass {mass:.1f}kg"]
    if mass < 50.0:
        details.append("man-portable Baltic pine shipping container with recessed hemp rope grab handles")
        details.append("fastened with cold-rolled black iron corner caps and proud slotted steel screws")
    elif mass <= 150.0:
        details.append("standardized freight crate built from thick rough-sawn Baltic pine slats with bottom timber skid battens")
        details.append("heavy black cold-rolled iron corner brackets fastened with slotted steel screws and cross-strapping")
    else:
        details.append("structural heavy cargo chest with double-thickness iron reinforcement straps and through-bolted forged plates")
        details.append("forged iron hoist lifting lugs at top corners")

    if any(v in ("push", "heft") for v in verbs):
        details.append("clear exterior clearance faces for pushing and manual hefting")
    if "weigh_cargo" in verbs:
        details.append("flat level bottom battens engineered to rest squarely upon zinc weigh scale pans")
    return details


def _derive_desk_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 180.0
    dims = f"{bounds.get('width', 2.4):.1f}m x {bounds.get('depth', 1.4):.1f}m x {bounds.get('height', 1.1):.1f}m"
    details = [
        f"workstation bounding box {dims}, static mass {mass:.1f}kg",
        "massive dark seasoned oak timber construction with heavy mortise-and-tenon joints, immovable administrative anchor",
        "deeply scarred varnished desktop, inset lead inkwell receptacles, tallow candle drippings, perimeter gallery rail",
    ]
    if "inscribe_ledger" in verbs:
        details.append("canted writing riser holding open brass-bound two-column ledger folio with ruled bistre ink ledger lines")
    if "strike_seal" in verbs:
        details.append("cast brass clearance seal stamp resting beside an open reservoir of crimson beeswax")
    return details


def _derive_weigh_table_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 120.0
    dims = f"{bounds.get('width', 1.8):.1f}m x {bounds.get('depth', 1.0):.1f}m x {bounds.get('height', 1.0):.1f}m"
    return [
        f"inspection station bounding box {dims}, static mass {mass:.1f}kg",
        "heavy timber inspection weigh table with hand-beaten zinc counter cladding, riveted zinc sheet perimeter with hammered copper nails",
        "forged iron central pillar supporting counterbalanced brass balance beam, dual suspended zinc weigh pans, stamped lead tare weights",
        "calibrated clearance level indicator and sliding deck for counter-signed slips",
    ]


def _derive_cryo_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 280.0
    dims = f"{bounds.get('width', 0.8):.1f}m x {bounds.get('depth', 2.3):.1f}m x {bounds.get('height', 0.9):.1f}m"
    details = [
        f"containment envelope {dims}, reinforced mass {mass:.1f}kg",
        "hexagonal cryogenic stasis casket of heavy leaded borosilicate glass reinforced with dark bismuth-alloy struts",
        "chilled frosted glass face with internal condensation droplets, glowing cyan runic coolant tubes running through reinforced side manifolds",
        "suspension chamber reliquary mounted on heavy damp-iron footings with hermetic compression clamps",
    ]
    if "inspect_cryo_gauge" in verbs:
        details.append("precision analog mercury-xenon pressure manometer mounted on manifold rim")
    if "smash" in verbs:
        details.append("brittle tempered crystalline glass envelope rated for high impact fracture")
    return details


def _derive_document_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 65.0
    dims = f"{bounds.get('width', 1.2):.1f}m x {bounds.get('depth', 1.0):.1f}m x {bounds.get('height', 1.4):.1f}m"
    details = [f"monumental display dimensions {dims}, mass {mass:.1f}kg"]
    if mass > 200.0:
        details.append("colossal multi-leaved cartographic codex open upon an articulated oak trestle")
        details.append("illuminated heavy vellum leaves depicting shifting contour terrain topography in bistre ink, gold-leaf coordinate cartouches, surveyor rose compass star, and stamped wax canon seals")
        details.append("brass binding clasps and leather indexing tabs")
    elif any(v in ("turn_page", "consult_arcana") for v in verbs):
        details.append("ancient carved walnut reading lectern with iron book-rest brackets")
        details.append("massive grimoire bound in dark calfskin with embossed silver arcane sigils, brass fore-edge closure clasps securing aged parchment pages")
    elif "read_statutes" in verbs:
        details.append("heavy timber-framed proclamation board mounted on sturdy granite footing")
        details.append("layered yellowed legal parchment sheets nailed to cork backing with copper tacks, formal imperial statute text in tight blackletter calligraphy with red rubrication")
    else:
        details.append("carved granite pedestal displaying a polished brass surveyor warrant disc with stamped imperial wax ribbon")
    return details


def _derive_gate_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 150.0
    dims = f"{bounds.get('width', 1.4):.1f}m x {bounds.get('depth', 0.8):.1f}m x {bounds.get('height', 2.0):.1f}m"
    return [
        f"barrier threshold dimensions {dims}, static mass {mass:.1f}kg",
        "counterbalanced striped timber boom gate or riveted iron door on heavy pivot hinges, cast iron counterweight box, brass clearance clamp",
    ]


def _derive_marker_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 400.0
    dims = f"{bounds.get('width', 1.6):.1f}m x {bounds.get('depth', 1.6):.1f}m x {bounds.get('height', 1.8):.1f}m"
    if mass > 250.0:
        return [
            f"marker dimensions {dims}, dry-stack stone mass {mass:.1f}kg",
            "conical wayfinding stone cairn of flat weathered mountain slate blocks, lichens clinging to crevices, chisel-cut waypoint glyph on central marker stone",
        ]
    elif mass < 50.0:
        return [
            f"marker dimensions {dims}, mass {mass:.1f}kg",
            "weathered timber signpost pointing toward the border march with hand-carved arrow placards notched into rock base",
        ]
    else:
        return [
            f"fixture dimensions {dims}, forged iron mass {mass:.1f}kg",
            "heavy three-legged forged iron fire brazier with riveted bowl and glowing peat and birch embers",
        ]


def _derive_unmodelled_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 15.0
    dims = f"{bounds.get('width', 0.9):.1f}m x {bounds.get('depth', 0.9):.1f}m x {bounds.get('height', 0.8):.1f}m"
    return [
        f"bounding volume {dims}, unmodelled mass {mass:.1f}kg",
        "untextured digital clay wireframe bounding slab awaiting text prompt specification, orthographic bounding box, chamfered edges, neutral calibration plane",
    ]


def select_asset_recipe(asset: Any) -> tuple[str, dict[str, Any]]:
    """Determine the explicit compilation recipe for an asset."""
    asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "")
    label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else "")
    template = getattr(asset, "visual_template", None) or (asset.get("visual_template") if isinstance(asset, dict) else "")
    fragment_id = getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "")

    combined = f"{template} {asset_id} {label} {fragment_id}".lower()

    if "r6_crate" in template or "crate" in combined:
        return "crate_freight", ASSET_RECIPES["crate_freight"]
    if "ledger_desk" in template or "desk" in combined or "quartermaster" in combined:
        return "station_desk", ASSET_RECIPES["station_desk"]
    if "weigh_scale" in template or "weigh" in combined or "balance_scale" in combined:
        return "weigh_scale", ASSET_RECIPES["weigh_scale"]
    if "glass_coffin" in template or "coffin" in combined or "stasis" in combined or "cryo" in combined:
        return "containment_relic", ASSET_RECIPES["containment_relic"]
    if any(k in template or k in combined for k in ("living_atlas", "atlas", "grimoire", "statute", "warrant", "lectern", "pedestal", "shelf")):
        return "monumental_document", ASSET_RECIPES["monumental_document"]
    if any(k in template or k in combined for k in ("boom_gate", "barrier", "wicket", "gate")):
        return "barrier_gate", ASSET_RECIPES["barrier_gate"]
    if any(k in template or k in combined for k in ("cairn", "signpost", "brazier")):
        return "waypoint_marker", ASSET_RECIPES["waypoint_marker"]
    if "unmodelled" in template or "unmodelled" in combined or "slab" in combined:
        return "unmodelled_slab", ASSET_RECIPES["unmodelled_slab"]

    # Fallback to unmodelled slab recipe
    return "unmodelled_slab", ASSET_RECIPES["unmodelled_slab"]


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


def resolve_asset_fragments(
    fragment_id: str,
    recipe: dict[str, Any],
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[str]]:
    """
    Compiler admission gate:
    Validates requested fragments against the recipe's allowed fragment set.
    Separates into:
      - diffusion_fragments (`for: diffusion`): concrete visual observations
      - doctrine_fragments (`for: gemma4-orion`): rewriter constraints
      - quarantined_fragments: rejected/unprescribed fragments
    """
    allowed = recipe.get("allowed_fragments", set())
    doctrine_fids = recipe.get("doctrine_fragments", [])

    diffusion_fragments = []
    doctrine_fragments = []
    quarantined = []
    seen = set()

    # 1. Validate primary fragment
    if fragment_id:
        if fragment_id in allowed:
            frag = load_fragment(fragment_id)
            if frag:
                seen.add(fragment_id)
                if frag.get("for") == "gemma4-orion":
                    doctrine_fragments.append(frag)
                else:
                    diffusion_fragments.append(frag)
        else:
            quarantined.append(fragment_id)

    # 2. Add recipe rewriter doctrine fragments
    for dfid in doctrine_fids:
        if dfid not in seen:
            frag = load_fragment(dfid)
            if frag:
                seen.add(dfid)
                doctrine_fragments.append(frag)

    return diffusion_fragments, doctrine_fragments, quarantined


@dataclass
class CompiledAssetBrief:
    asset_id: str
    label: str
    recipe_archetype: str
    fragment_id: str
    scene_id: str
    physical_specs: str
    world_look: dict[str, str]
    fragments_used: list[str]
    quarantined_fragments: list[str]
    doctrine_rules: list[str]
    diffusion_details: list[str]
    compiled_brief: str
    rewritten_prompt: str
    negative_prompt: str


def compile_asset_brief(asset: Any, scene_id: str = "customs-house") -> CompiledAssetBrief:
    """
    Explicit Recipe-based Compilation Engine:
    Selects the asset recipe, validates and admits fragments, derives physical properties,
    and synthesizes an intermediate compiled brief and refined Flux 3 Klein prompt.
    """
    asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "unknown_asset")
    label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else asset_id)
    fragment_id = getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "")
    mass_kg = getattr(asset, "mass_kg", None) if not isinstance(asset, dict) else asset.get("mass_kg")
    bounds = getattr(asset, "bounds", None) if not isinstance(asset, dict) else asset.get("bounds", {})
    verbs = getattr(asset, "interactive_verbs", None) if not isinstance(asset, dict) else asset.get("interactive_verbs", [])
    if verbs is None:
        verbs = []
    obstacle_type = getattr(asset, "obstacle_type", None) if not isinstance(asset, dict) else asset.get("obstacle_type", "physics_object")
    lore_snippet = getattr(asset, "lore_snippet", None) if not isinstance(asset, dict) else asset.get("lore_snippet", "")
    base_prompt = getattr(asset, "diffusion_prompt", "") if not isinstance(asset, dict) else asset.get("diffusion_prompt", "")

    # Step 1: Select Recipe
    recipe_name, recipe = select_asset_recipe(asset)

    # Step 2: Resolve and Gate Fragments (Admission Control)
    diff_frags, doct_frags, quarantined = resolve_asset_fragments(fragment_id, recipe)
    fragments_used = [f.get("id", "") for f in diff_frags + doct_frags if f.get("id")]

    # Step 3: Deterministic Physical Derivations
    derive_fn = recipe.get("derive_physics", lambda m, b, v: [])
    physical_derivations = derive_fn(mass_kg, bounds, verbs)
    physical_specs = ", ".join(physical_derivations)

    # Step 4: Resolve World Aesthetic Palette
    world_look = WORLD_LOOK_DESCRIPTIONS.get(scene_id, WORLD_LOOK_DESCRIPTIONS["customs-house"])

    # Step 5: Separate Rewriter Doctrine from Diffusion Details
    doctrine_rules = [f.get("detail", "").strip() for f in doct_frags if f.get("detail")]
    diffusion_details = [f.get("detail", "").strip() for f in diff_frags if f.get("detail")]

    # Assemble Structured Intermediate Representation (Compiled Brief)
    brief_lines = [
        f"Subject: {label} (asset ID: {asset_id}, recipe: {recipe_name}).",
        f"World Context: {world_look['setting']}.",
        f"Physical Derivations: {physical_specs}.",
        f"Material Construction: {world_look['materials']}.",
    ]
    if lore_snippet:
        brief_lines.append(f"Provenance: {lore_snippet}")

    if diffusion_details:
        brief_lines.append("Admitted Visual Fragments (for: diffusion):")
        for detail in diffusion_details:
            brief_lines.append(f"  - {detail}")

    if doctrine_rules:
        brief_lines.append("Rewriter Constraints (for: gemma4-orion):")
        for rule in doctrine_rules:
            brief_lines.append(f"  - {rule}")

    if quarantined:
        brief_lines.append(f"Quarantined Inadmissible Fragments: {', '.join(quarantined)}")

    compiled_brief = "\n".join(brief_lines)

    # Step 6: Execute Prompt Rewriting Pass adhering to doctrine
    rewritten_prompt = rewrite_prompt(
        label=label,
        asset_id=asset_id,
        recipe_name=recipe_name,
        physical_derivations=physical_derivations,
        world_look=world_look,
        diffusion_details=diffusion_details,
        doctrine_rules=doctrine_rules,
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
        recipe_archetype=recipe_name,
        fragment_id=fragment_id,
        scene_id=scene_id,
        physical_specs=physical_specs,
        world_look=world_look,
        fragments_used=fragments_used,
        quarantined_fragments=quarantined,
        doctrine_rules=doctrine_rules,
        diffusion_details=diffusion_details,
        compiled_brief=compiled_brief,
        rewritten_prompt=rewritten_prompt,
        negative_prompt=negative_prompt,
    )


def rewrite_prompt(
    label: str,
    asset_id: str,
    recipe_name: str,
    physical_derivations: list[str],
    world_look: dict[str, str],
    diffusion_details: list[str],
    doctrine_rules: list[str],
    base_prompt: str = "",
) -> str:
    """
    Prompt Rewriter Pass:
    Enforces the single-face orthographic doctrine (`for: gemma4-orion`) without
    leaking raw rewriter rules into diffusion tokens, while weaving tactile physical
    derivations and admitted fragment details into a vivid Flux 3 Klein prompt.
    """
    # Key visual description tailored directly from the recipe derivations
    clauses = [f"{label}"]
    for deriv in physical_derivations:
        if not deriv.startswith("bounding") and not deriv.startswith("inspection") and not deriv.startswith("marker") and not deriv.startswith("barrier") and not deriv.startswith("workstation") and not deriv.startswith("containment"):
            clauses.append(deriv)

    for detail in diffusion_details:
        if detail not in clauses:
            clauses.append(detail)

    subject_clause = ", ".join(clauses)
    materials_clause = world_look["materials"]

    prompt_parts = [
        "orthographic top-down 2.5D isometric game asset cutout",
        subject_clause,
        f"crafted with {materials_clause}",
        "isolated on neutral solid grey background (#707070), no background walls, no room floors, perfectly clean silhouette, ready for alpha matting",
        "subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath base",
        "crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024",
    ]

    return ", ".join(prompt_parts)
