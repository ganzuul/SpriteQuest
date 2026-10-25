#!/usr/bin/env python3
"""
companion/fragment_compiler.py

SpriteQuest Hardened Fragment Compiler, Scene-Coherence Backpressure Engine,
and Cartographers' Epistemic Governor.

Implements:
1. Explicit Recipe Admission Control (`ASSET_RECIPES`) — no grab-bag fragment dumping.
2. Scene-to-Asset Coherence Backpressure — resolves each asset's host floorplan zone
   (substrate material, acoustic reverb, interior/exterior framing) and audits for
   cross-domain anomalies, substrate overloads, and underdetermined placeholders.
3. Dynamic Library Growth & Parsimonious LLM Synthesis (`EpistemicGovernor`) —
   powered by the 4th-wall Cartographers faction ("The Bureau of the Unwritten Atlas").
   Mints atomic Schema v1 `field_note` fragments only when forced by a coherence conflict
   and permitted by four parsimony gates (conflict necessity, single pending field note cap,
   criticism tombstone memory, and epistemic saturation lock).
4. Human Filtering as Diegetic Intent (`CartographersLedger`) —
   - Deleting an LLM-generated fragment from disk records a permanent `criticized` tombstone
     (negative backpressure constraint), never an error to be reverted or re-synthesized.
   - Editing an LLM-generated fragment on disk promotes its maturity from `field_note` to
     `curated`, issues a Canon Warrant, and elevates the asset's provenance/standing.

Follows the QWEN.md 4th-wall translation rule and the library/README.md specification:
    fragment ──compose (recipe + scene backpressure)──> compiled brief ──rewrite──> diffusion prompt
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Callable

REPO_ROOT = Path(__file__).resolve().parent.parent
FRAGMENTS_DIR = REPO_ROOT / "library" / "fragments"
PLANS_DIR = REPO_ROOT / "library" / "plans"
FLOORPLANS_DIR = REPO_ROOT / "library" / "floorplans"
DEFAULT_LEDGER_PATH = REPO_ROOT / "library" / "cartographers_ledger.json"

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
    "border-march": {
        "setting": "The Cold Border March & Ancient Overhang Bastion Ridge",
        "materials": "cracked cyclopean limestone masonry, 45-degree cantilever granite blocks, dry-stone cairn slate, weathered brass theodolite brackets, alpine scree",
        "lighting": "stark high-altitude alpine sun, sharp directional top-left rim lighting, deep cast occlusion shadows beneath stone overhangs",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated subject on neutral solid grey background (#707070), perfectly clean silhouette, ready for alpha matting",
    },
    "consignment-overhang-bastion": {
        "setting": "The 45° Bastion & Relic Cairn Summit at the Border March",
        "materials": "cyclopean First-Epoch masonry, dry-stone cairn rings, calibrated surveyor vellum plaques, unwritten boundary markers, lichen-encrusted granite",
        "lighting": "dramatic alpine rim light from northwest, crisp silhouette against solid neutral grey background (#707070), deep contact ground shadow",
        "framing": "orthographic top-down 2.5D isometric game asset cutout, isolated subject on neutral solid grey background (#707070), perfectly clean silhouette, ready for alpha matting",
    },
}


# Explicit Compilation Recipes
# Selection is an explicit authored recipe per archetype: no indiscriminate dumping.
ASSET_RECIPES: dict[str, dict[str, Any]] = {
    "ancient_ruin": {
        "archetype": "ancient_ruin",
        "description": "Cyclopean stone bastion, ruined watchtower, or stepped overhang terrace",
        "allowed_fragments": {
            "grey-wind/named-ruins",
            "grey-wind/mountain-passage",
            "grey-wind/wish-granting",
            "cartographers/epistemic-survey",
            "cartographers/the-living-atlas",
            "shared/single-face-reading",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "target_capacity": 5,
        "derive_physics": lambda mass_kg, bounds, verbs: [
            "cyclopean masonry blocks",
            "conforming to the 45-degree cantilever overhang rule",
            "stratified ancient stone foundations",
            "weathered mineral fractures and lichen patina",
            "grounded firmly upon bedrock",
        ],
    },
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
        "target_capacity": 4,
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
        "target_capacity": 4,
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
        "target_capacity": 4,
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
        "target_capacity": 4,
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
        "target_capacity": 5,
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
        "target_capacity": 3,
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
        "target_capacity": 4,
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
        "target_capacity": 3,
        "derive_physics": lambda mass_kg, bounds, verbs: _derive_unmodelled_physics(mass_kg, bounds, verbs),
    },
    # NPC Facet Recipes
    "npc_portrait": {
        "archetype": "npc_portrait",
        "description": "Character portrait bust with expression and role framing",
        "allowed_fragments": {
            "scaffolded-kingdom/quartermaster-ledger",
            "neighboring-kingdom/blank-script",
            "cartographers/canon-warrant",
            "shared/brief-faces-are-themes",
        },
        "doctrine_fragments": [
            "shared/brief-faces-are-themes",
        ],
        "target_capacity": 4,
        "derive_physics": lambda mass_kg, bounds, verbs: ["character portrait bust", "three-quarter perspective", "expressive facial rendering"],
    },
    "npc_cutout": {
        "archetype": "npc_cutout",
        "description": "Full-figure 2.5D game sprite cutout isolated on neutral background",
        "allowed_fragments": {
            "scaffolded-kingdom/quartermaster-ledger",
            "neighboring-kingdom/blank-script",
            "shared/single-face-reading",
            "shared/seam-lines",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "target_capacity": 4,
        "derive_physics": lambda mass_kg, bounds, verbs: ["full standing figure", "ground contact occlusion shadow", "clean sprite silhouette"],
    },
    "npc_home": {
        "archetype": "npc_home",
        "description": "Environmental stationing or residence with atmospheric perspective",
        "allowed_fragments": {
            "customs-house/the-site",
            "customs-house/forfeit-corridor",
            "grey-wind/mountain-passage",
            "shared/brief-faces-are-themes",
        },
        "doctrine_fragments": [
            "shared/brief-faces-are-themes",
        ],
        "target_capacity": 4,
        "derive_physics": lambda mass_kg, bounds, verbs: ["architectural interior", "volumetric atmospheric perspective", "environmental narrative props"],
    },
    "npc_favored_item": {
        "archetype": "npc_favored_item",
        "description": "Tactile inventory relic or personal artifact",
        "allowed_fragments": {
            "shared/glyph-customs-seal",
            "shared/single-face-reading",
            "cartographers/canon-warrant",
        },
        "doctrine_fragments": [
            "shared/single-face-reading",
        ],
        "target_capacity": 4,
        "derive_physics": lambda mass_kg, bounds, verbs: ["tactile inventory relic", "hand-held scale", "material wear and provenance"],
    },
    "npc_aspirations": {
        "archetype": "npc_aspirations",
        "description": "Theatrical narrative wide tableau illustrating character yearning",
        "allowed_fragments": {
            "shared/brief-faces-are-themes",
        },
        "doctrine_fragments": [
            "shared/brief-faces-are-themes",
        ],
        "target_capacity": 3,
        "derive_physics": lambda mass_kg, bounds, verbs: ["wide cinematic composition", "theatrical lighting contrast", "dramatic narrative tableau"],
    },
}


# --- Physics and Structural Derivations ---

def _norm_bounds(bounds: dict[str, float] | None, default_w: float, default_d: float, default_h: float) -> tuple[float, float, float]:
    if not bounds or not isinstance(bounds, dict):
        return default_w, default_d, default_h
    w = float(bounds.get("width") or bounds.get("w") or default_w)
    d = float(bounds.get("depth") or bounds.get("d") or bounds.get("length") or default_d)
    h = float(bounds.get("height") or bounds.get("h") or default_h)
    return w, d, h


def _derive_crate_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 45.0
    w, d, h = _norm_bounds(bounds, 1.2, 1.2, 1.0)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
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
    w, d, h = _norm_bounds(bounds, 2.4, 1.4, 1.1)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
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
    w, d, h = _norm_bounds(bounds, 1.8, 1.0, 1.0)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
    return [
        f"inspection station bounding box {dims}, static mass {mass:.1f}kg",
        "heavy timber inspection weigh table with hand-beaten zinc counter cladding, riveted zinc sheet perimeter with hammered copper nails",
        "forged iron central pillar supporting counterbalanced brass balance beam, dual suspended zinc weigh pans, stamped lead tare weights",
        "calibrated clearance level indicator and sliding deck for counter-signed slips",
    ]


def _derive_cryo_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 280.0
    w, d, h = _norm_bounds(bounds, 0.8, 2.3, 0.9)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
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
    w, d, h = _norm_bounds(bounds, 1.2, 1.0, 1.4)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
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
    w, d, h = _norm_bounds(bounds, 1.4, 0.8, 2.0)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
    return [
        f"barrier threshold dimensions {dims}, static mass {mass:.1f}kg",
        "counterbalanced striped timber boom gate or riveted iron door on heavy pivot hinges, cast iron counterweight box, brass clearance clamp",
    ]


def _derive_marker_physics(mass_kg: float | None, bounds: dict[str, float], verbs: list[str]) -> list[str]:
    mass = mass_kg if mass_kg is not None else 400.0
    w, d, h = _norm_bounds(bounds, 1.6, 1.6, 1.8)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
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
    w, d, h = _norm_bounds(bounds, 0.9, 0.9, 0.8)
    dims = f"{w:.1f}m x {d:.1f}m x {h:.1f}m"
    return [
        f"bounding volume {dims}, unmodelled mass {mass:.1f}kg",
        "untextured digital clay wireframe bounding slab awaiting text prompt specification, orthographic bounding box, chamfered edges, neutral calibration plane",
    ]


# --- Scene Coherence & Floorplan Backpressure ---

_FLOORPLAN_CACHE: dict[str, dict[str, Any]] = {}


def _load_floorplan(scene_id: str) -> dict[str, Any] | None:
    if scene_id in _FLOORPLAN_CACHE:
        return _FLOORPLAN_CACHE[scene_id]
    fp_path = FLOORPLANS_DIR / f"{scene_id}.json"
    if not fp_path.is_file():
        return None
    try:
        data = json.loads(fp_path.read_text(encoding="utf-8"))
        _FLOORPLAN_CACHE[scene_id] = data
        return data
    except (OSError, json.JSONDecodeError):
        return None


@dataclass
class SceneZoneContext:
    scene_id: str
    zone_id: str
    zone_name: str
    substrate_material: str
    acoustic_reverb: str
    elevation: float
    is_interior: bool


def resolve_scene_zone_context(asset: Any, scene_id: str = "customs-house") -> SceneZoneContext:
    """
    Resolve which physical floorplan zone hosts the asset, extracting substrate material,
    elevation, and acoustic reverberation to apply scene backpressure onto the asset.
    """
    wx = getattr(asset, "world_x", None) if not isinstance(asset, dict) else asset.get("world_x")
    wy = getattr(asset, "world_y", None) if not isinstance(asset, dict) else asset.get("world_y")
    wz = getattr(asset, "world_z", None) if not isinstance(asset, dict) else asset.get("world_z")

    fp = _load_floorplan(scene_id)
    if fp and wx is not None and wy is not None:
        x, y = float(wx), float(wy)
        # In border-march, customs-house local (x in -18..18, z in 0..60) is anchored at (55.0, 35.0)
        x_local = x - 55.0 if x >= 20.0 and scene_id == "customs-house" else x
        z_local = y - 35.0 if y >= 20.0 and scene_id == "customs-house" else y
        zones = fp.get("zones", [])
        matching_zones: list[tuple[float, dict[str, Any]]] = []
        for z in zones:
            b = z.get("bounds", {})
            xmin = float(b.get("x_min", 0.0))
            xmax = float(b.get("x_max", 0.0))
            ymin = float(b.get("y_min", b.get("z_min", 0.0)))
            ymax = float(b.get("y_max", b.get("z_max", 0.0)))
            if xmin <= x_local <= xmax and ymin <= z_local <= ymax:
                area = max(0.01, (xmax - xmin) * (ymax - ymin))
                matching_zones.append((area, z))
        if matching_zones:
            # Select most specific (smallest area) containing zone (e.g. quartermaster-office inside inspection-hall)
            matching_zones.sort(key=lambda item: item[0])
            best_z = matching_zones[0][1]
            return SceneZoneContext(
                scene_id=scene_id,
                zone_id=best_z.get("id", "interior-zone"),
                zone_name=best_z.get("name", "Interior Zone"),
                substrate_material=best_z.get("material", "scarred timber planking over iron joists"),
                acoustic_reverb=best_z.get("acoustic_reverb", "damp"),
                elevation=float(wz if wz is not None else best_z.get("elevation", 6.0)),
                is_interior=True,
            )
        # Outside building bounds -> outdoor frontier threshold
        return SceneZoneContext(
            scene_id=scene_id,
            zone_id="outdoor-frontier",
            zone_name="The Border March Approach",
            substrate_material="weathered mountain slate, frost-heaved scree, and packed alpine earth",
            acoustic_reverb="open mountain wind",
            elevation=float(wz if wz is not None else 4.0),
            is_interior=False,
        )

    # Default zone context per scene when no coordinates are provided
    defaults = {
        "customs-house": SceneZoneContext(
            scene_id="customs-house",
            zone_id="inspection-hall",
            zone_name="Weigh & Inspection Hall",
            substrate_material="scarred timber planking over iron joists",
            acoustic_reverb="clattering",
            elevation=6.0,
            is_interior=True,
        ),
        "space-vampires": SceneZoneContext(
            scene_id="space-vampires",
            zone_id="cryo-reliquary-vault",
            zone_name="Cryo-Reliquary Vault",
            substrate_material="machined black basalt deck plating with superfluid drainage channels",
            acoustic_reverb="hermetic silence",
            elevation=0.0,
            is_interior=True,
        ),
        "cartographers": SceneZoneContext(
            scene_id="cartographers",
            zone_id="epistemic-scriptorium",
            zone_name="Tiered Scriptorium of the Unwritten Atlas",
            substrate_material="polished dark oak gallery flooring with brass datum inlays",
            acoustic_reverb="whispering gallery",
            elevation=0.0,
            is_interior=True,
        ),
        "wizard-tower": SceneZoneContext(
            scene_id="wizard-tower",
            zone_id="grimoire-sanctum",
            zone_name="High Wizard's Grimoire Sanctum",
            substrate_material="flagstone hearth stones inscribed with chalk containment circles",
            acoustic_reverb="resonant",
            elevation=12.0,
            is_interior=True,
        ),
    }
    return defaults.get(
        scene_id,
        SceneZoneContext(
            scene_id=scene_id,
            zone_id="default-zone",
            zone_name=f"{scene_id.title()} Hall",
            substrate_material="weathered stone and timber subfloor",
            acoustic_reverb="neutral",
            elevation=0.0,
            is_interior=True,
        ),
    )


@dataclass
class CoherenceConflict:
    conflict_id: str
    kind: str  # "cross_domain_anomaly" | "substrate_overload" | "underdetermined_slab"
    severity: str  # "high" | "moderate"
    description: str
    proposed_fragment_id: str
    proposed_detail: str
    proposed_facts: dict[str, Any]


def audit_scene_coherence(
    asset: Any,
    recipe_name: str,
    primary_frag: dict[str, Any] | None,
    zone_ctx: SceneZoneContext,
) -> tuple[list[str], list[CoherenceConflict]]:
    """
    Cartographers' Scene Coherence Audit:
    1. Produces scene backpressure clauses (grounding the asset's footing, contact shadow,
       and material transition into `zone_ctx.substrate_material`).
    2. Detects concrete coherence conflicts between the asset and the host scene/zone.
    """
    asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "unknown_asset")
    label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else asset_id)
    mass_kg = getattr(asset, "mass_kg", None) if not isinstance(asset, dict) else asset.get("mass_kg")
    fragment_id = getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "") or ""

    backpressure_clauses = [
        f"grounded upon {zone_ctx.substrate_material} in {zone_ctx.zone_name}",
    ]

    conflicts: list[CoherenceConflict] = []
    safe_slug = asset_id.lower().replace("_", "-")
    zone_slug = zone_ctx.zone_id.lower().replace("_", "-")

    # 1. Cross-Domain Placement Conflict (e.g. space-vampires stasis coffin inside customs-house)
    frag_world = primary_frag.get("world_id") if primary_frag else (fragment_id.split("/")[0] if "/" in fragment_id else zone_ctx.scene_id)
    if frag_world and frag_world not in (zone_ctx.scene_id, "shared", "cartographers"):
        # Outdoor grey-wind markers on the outdoor-frontier are natural, not a conflict
        if not (frag_world == "grey-wind" and not zone_ctx.is_interior):
            cid = f"{zone_ctx.scene_id}:{zone_ctx.zone_id}:{asset_id}:cross_domain_anomaly"
            prop_fid = f"cartographers/bridge-{safe_slug}-{zone_slug}"
            if frag_world == "space-vampires":
                detail = (
                    f"heavy forged-iron {zone_ctx.scene_id.replace('-', ' ')} forfeiture chains and a stamped lead quarantine tag "
                    f"binding the cryogenic manifold to the {zone_ctx.substrate_material}, with condensed rime frost pooling across the floor joints"
                )
                facts = {
                    "extent": "perimeter base chains and frost halo 30 cm wide",
                    "scale_ref": "wraps around the lower manifold footings against the floor",
                    "material": f"forged iron chain, stamped lead seal, condensed frost on {zone_ctx.substrate_material}",
                    "state": "impounded under active customs quarantine",
                }
            elif frag_world == "wizard-tower":
                detail = (
                    f"a riveted brass registry plaque and iron audit chain anchoring the arcane base to the "
                    f"{zone_ctx.substrate_material} beside a tallow inspection lantern"
                )
                facts = {
                    "extent": "40 cm iron anchor chain and stamped brass plate at footing",
                    "scale_ref": "bolted directly into the floor substrate at the base of the prop",
                    "material": f"riveted yellow brass, forged iron links on {zone_ctx.substrate_material}",
                    "state": "cataloged and tethered for inspection",
                }
            else:
                detail = (
                    f"stamped brass surveyor brackets and customs transit chalk marks securing the {label.lower()} "
                    f"directly onto the {zone_ctx.substrate_material}"
                )
                facts = {
                    "extent": "base mounting brackets 25 cm across",
                    "scale_ref": "fastened along the bottom contact perimeter",
                    "material": f"weathered brass and surveyor chalk on {zone_ctx.substrate_material}",
                    "state": "surveyed in transit",
                }
            conflicts.append(
                CoherenceConflict(
                    conflict_id=cid,
                    kind="cross_domain_anomaly",
                    severity="high",
                    description=(
                        f"Foreign domain asset ({frag_world!r}) placed in {zone_ctx.scene_id!r} zone "
                        f"{zone_ctx.zone_id!r} ({zone_ctx.substrate_material}) without bridging fixture."
                    ),
                    proposed_fragment_id=prop_fid,
                    proposed_detail=detail,
                    proposed_facts=facts,
                )
            )

    # 2. Substrate Structural Overload (ultra-heavy asset >= 250kg on interior timber/elevated floor)
    if mass_kg is not None and float(mass_kg) >= 250.0 and zone_ctx.is_interior:
        if any(k in zone_ctx.substrate_material.lower() for k in ("timber", "oak", "planking", "wood", "desktop")):
            cid = f"{zone_ctx.scene_id}:{zone_ctx.zone_id}:{asset_id}:substrate_overload"
            prop_fid = f"cartographers/plinth-{safe_slug}-{zone_slug}"
            detail = (
                f"wide cast-iron load-spreader plates and timber shoring wedges bolted across the "
                f"{zone_ctx.substrate_material} beneath the heavy footing, stamped with the Bureau's structural survey mark"
            )
            facts = {
                "extent": "1.5 m wide load-distribution iron baseplate",
                "scale_ref": "sits flush between the heavy prop base and the timber subfloor",
                "material": "cast grey iron plates, oak shoring wedges, iron lag bolts",
                "state": "bearing heavy static load without floor deflection",
            }
            conflicts.append(
                CoherenceConflict(
                    conflict_id=cid,
                    kind="substrate_overload",
                    severity="moderate",
                    description=(
                        f"Asset mass ({float(mass_kg):.1f}kg) concentrated on interior timber substrate "
                        f"({zone_ctx.substrate_material}) without load-spreading plinth."
                    ),
                    proposed_fragment_id=prop_fid,
                    proposed_detail=detail,
                    proposed_facts=facts,
                )
            )

    # 3. Epistemic Underdetermination (unmodelled placeholder slab awaiting survey)
    if recipe_name == "unmodelled_slab" or fragment_id == "shared/unmodelled-prop":
        cid = f"{zone_ctx.scene_id}:{zone_ctx.zone_id}:{asset_id}:underdetermined_slab"
        prop_fid = f"cartographers/survey-{safe_slug}-{zone_slug}"
        detail = (
            f"chalked surveyor triangulation lines and four brass plumb-bob corner stakes driven around the "
            f"unmodelled grey slab upon the {zone_ctx.substrate_material}"
        )
        facts = {
            "extent": "1.0 m square chalked survey perimeter with corner stakes",
            "scale_ref": "frames the base of the unmodelled slab on the floor",
            "material": f"white surveyor chalk, turned brass stakes, linen twine on {zone_ctx.substrate_material}",
            "state": "marked for epistemic survey by the Bureau of the Unwritten Atlas",
        }
        conflicts.append(
            CoherenceConflict(
                conflict_id=cid,
                kind="underdetermined_slab",
                severity="moderate",
                description=(
                    f"Underwritten placeholder slab in {zone_ctx.zone_id!r} lacks surveyed boundary markers "
                    f"anchoring it to {zone_ctx.substrate_material}."
                ),
                proposed_fragment_id=prop_fid,
                proposed_detail=detail,
                proposed_facts=facts,
            )
        )

    return backpressure_clauses, conflicts


# --- Cartographers' Ledger & Epistemic Governor ---

def compute_fragment_content_hash(frag_data: dict[str, Any]) -> str:
    """Compute a deterministic SHA-256 hash over a fragment's semantic payload (`detail` + `facts`)."""
    payload = {
        "detail": frag_data.get("detail", "").strip(),
        "facts": frag_data.get("facts", {}),
        "for": frag_data.get("for", "diffusion"),
    }
    raw = json.dumps(payload, sort_keys=True, ensure_ascii=True).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


class CartographersLedger:
    """
    Manages the lifecycle of dynamically synthesized fragments and human curation events:
      - `field_note`: Minted by the compiler/LLM to resolve a scene coherence conflict.
      - `curated`: Edited on disk by the dev/player -> promoted standing & Canon Warrant issued.
      - `criticized`: Deleted from disk by the dev/player -> recorded as a permanent negative
        constraint tombstone; never reverted or re-synthesized.
    """

    def __init__(self, ledger_path: Path | None = None, fragments_dir: Path | None = None):
        self.ledger_path = ledger_path or DEFAULT_LEDGER_PATH
        self.fragments_dir = fragments_dir or FRAGMENTS_DIR
        self.data: dict[str, Any] = {
            "schema_version": 1,
            "faction": "cartographers",
            "title": "The Bureau of the Unwritten Atlas — Epistemic Survey & Curation Ledger",
            "parsimony_config": {
                "max_pending_field_notes_per_archetype": 1,
                "saturation_threshold": 0.80,
                "default_target_capacity": 4,
            },
            "entries": {},
        }
        self._load()

    def _load(self) -> None:
        if self.ledger_path.is_file():
            try:
                loaded = json.loads(self.ledger_path.read_text(encoding="utf-8"))
                if isinstance(loaded, dict) and "entries" in loaded:
                    self.data = loaded
            except (OSError, json.JSONDecodeError):
                pass

    def save(self) -> None:
        self.ledger_path.parent.mkdir(parents=True, exist_ok=True)
        self.ledger_path.write_text(json.dumps(self.data, indent=2) + "\n", encoding="utf-8")

    @property
    def entries(self) -> dict[str, dict[str, Any]]:
        return self.data.setdefault("entries", {})

    def sync_with_filesystem(self, persist: bool = False) -> dict[str, str]:
        """
        Inspect all tracked dynamic fragments against disk:
        - If a tracked fragment file was DELETED by the dev/player:
          transition to `criticized` (authorial rejection / negative backpressure tombstone).
        - If a tracked fragment file was EDITED by the dev/player (`current_sha256 != initial_sha256`):
          transition from `field_note` to `curated` and issue a Canon Warrant!
        """
        transitions: dict[str, str] = {}
        changed = False

        for fid, entry in list(self.entries.items()):
            fpath = self.fragments_dir / f"{fid}.json"
            prev_maturity = entry.get("maturity", "field_note")

            if not fpath.is_file():
                # Dev or player deleted the LLM-generated fragment file!
                if prev_maturity != "criticized":
                    entry["maturity"] = "criticized"
                    rejected_detail = entry.get("current_detail") or entry.get("initial_detail", "")
                    entry["criticism_constraint"] = (
                        f"Author rejected and deleted fragment {fid!r} ({rejected_detail!r}); "
                        f"do not re-propose this visual framing or fixture."
                    )
                    entry["warrant_id"] = None
                    transitions[fid] = "criticized"
                    changed = True
            else:
                try:
                    frag_json = json.loads(fpath.read_text(encoding="utf-8"))
                except (OSError, json.JSONDecodeError):
                    continue
                curr_hash = compute_fragment_content_hash(frag_json)
                init_hash = entry.get("initial_sha256", curr_hash)

                if curr_hash != init_hash:
                    # Dev or player manually edited the fragment -> promote to `curated`!
                    if prev_maturity != "curated" or entry.get("current_sha256") != curr_hash:
                        entry["maturity"] = "curated"
                        entry["current_sha256"] = curr_hash
                        entry["current_detail"] = frag_json.get("detail", "").strip()
                        entry["curation_edits"] = int(entry.get("curation_edits", 0)) + 1
                        slug_part = fid.split("/")[-1].upper().replace("-", "")[:12]
                        entry["warrant_id"] = f"WARRANT-{slug_part}-{curr_hash[:6].upper()}"
                        transitions[fid] = "curated"
                        changed = True
                else:
                    # Unedited file present on disk (if previously deleted and restored by user, restore field_note)
                    if prev_maturity == "criticized":
                        entry["maturity"] = "field_note"
                        entry.pop("criticism_constraint", None)
                        transitions[fid] = "field_note"
                        changed = True

        if changed and persist:
            self.save()
        return transitions

    def compute_archetype_saturation(self, recipe_name: str, recipe: dict[str, Any]) -> dict[str, Any]:
        """
        Compute the Epistemic Saturation Index for an archetype:
        Measures how evolved the library is for this archetype so the LLM stays parsimonious
        and stops minting new fragments once the archetype reaches saturation.
        """
        allowed = recipe.get("allowed_fragments", set())
        canon_count = 0
        for fid in allowed:
            if (self.fragments_dir / f"{fid}.json").is_file():
                canon_count += 1

        pending_notes = 0
        curated_count = 0
        criticized_count = 0

        for fid, entry in self.entries.items():
            if entry.get("recipe_archetype") == recipe_name:
                mat = entry.get("maturity")
                if mat == "field_note":
                    pending_notes += 1
                elif mat == "curated":
                    curated_count += 1
                elif mat == "criticized":
                    criticized_count += 1

        target_cap = float(
            recipe.get("target_capacity")
            or self.data.get("parsimony_config", {}).get("default_target_capacity", 4)
        )
        threshold = float(self.data.get("parsimony_config", {}).get("saturation_threshold", 0.80))
        max_pending = int(self.data.get("parsimony_config", {}).get("max_pending_field_notes_per_archetype", 1))

        # Weighted maturity contributions:
        # Base canon fragments provide foundational coverage (0.20 each), while human curation (0.45)
        # and explicit authorial criticisms (0.35) rapidly advance epistemic lock.
        weighted_sum = (0.20 * canon_count) + (0.45 * curated_count) + (0.35 * criticized_count)
        saturation_score = min(1.0, round(weighted_sum / max(1.0, target_cap * 0.25), 3))
        is_locked = saturation_score >= threshold

        return {
            "recipe_archetype": recipe_name,
            "canon_count": canon_count,
            "pending_field_notes": pending_notes,
            "curated_count": curated_count,
            "criticized_count": criticized_count,
            "saturation_score": saturation_score,
            "saturation_threshold": threshold,
            "saturation_locked": is_locked,
            "max_pending_field_notes": max_pending,
        }

    def can_mint_fragment(
        self,
        conflict: CoherenceConflict,
        recipe_name: str,
        recipe: dict[str, Any],
    ) -> tuple[bool, str, dict[str, Any]]:
        """
        The 4 Parsimony Gates of the Bureau of the Unwritten Atlas:
        1. Criticized Tombstone Gate: Never re-mint a fragment the human deleted.
        2. Existing Resolution Gate: Do not duplicate an already-minted fragment.
        3. Saturation Lock Gate: Stop adding fragments once the domain reaches saturation_threshold.
        4. Single Pending Field Note Cap: Allow at most 1 uncurated field_note per archetype at a time.
        """
        sat = self.compute_archetype_saturation(recipe_name, recipe)

        # Check existing entries by proposed_fragment_id or conflict_id
        for fid, entry in self.entries.items():
            if fid == conflict.proposed_fragment_id or entry.get("conflict_id") == conflict.conflict_id:
                if entry.get("maturity") == "criticized":
                    return False, "criticized_by_author", sat
                if (self.fragments_dir / f"{fid}.json").is_file():
                    return False, "already_synthesized", sat

        if sat["saturation_locked"]:
            return False, "saturation_locked", sat

        if sat["pending_field_notes"] >= sat["max_pending_field_notes"]:
            return False, "pending_field_note_cap", sat

        return True, "permitted_by_cartographer", sat

    def synthesize_field_note_fragment(
        self,
        conflict: CoherenceConflict,
        asset: Any,
        recipe_name: str,
        recipe: dict[str, Any],
        zone_ctx: SceneZoneContext,
        llm_callback: Callable[[dict[str, Any]], str] | None = None,
    ) -> dict[str, Any] | None:
        """
        Mint a new Schema v1 fragment in `library/fragments/` to resolve `conflict`,
        if and only if all 4 parsimony gates pass.
        """
        allowed, reason, _ = self.can_mint_fragment(conflict, recipe_name, recipe)
        if not allowed:
            return None

        asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "unknown_asset")
        fid = conflict.proposed_fragment_id
        world_id = fid.split("/")[0] if "/" in fid else "cartographers"

        # Collect any active criticisms for this asset/archetype so the LLM never repeats rejected ideas
        criticisms = [
            e.get("criticism_constraint", "")
            for e in self.entries.values()
            if e.get("maturity") == "criticized" and e.get("criticism_constraint")
        ]

        detail_text = conflict.proposed_detail
        if llm_callback is not None:
            try:
                candidate = llm_callback({
                    "asset_id": asset_id,
                    "conflict": asdict(conflict),
                    "zone_context": asdict(zone_ctx),
                    "criticisms_to_avoid": criticisms,
                })
                if candidate and isinstance(candidate, str) and len(candidate.strip()) >= 12:
                    detail_text = candidate.strip()
            except Exception:
                pass

        frag_doc = {
            "schema_version": 1,
            "id": fid,
            "version": 1,
            "world_id": world_id,
            "for": "diffusion",
            "facets": ["home", "favored_items"],
            "detail": detail_text,
            "evidence": {
                "kind": "directed",
                "source": "library/cartographers_ledger.json",
                "quote": conflict.description,
            },
            "facts": conflict.proposed_facts,
            "note": (
                f"Synthesized as a Provisional Field Note by the Bureau of the Unwritten Atlas "
                f"to resolve {conflict.kind} ({conflict.conflict_id}). Edit to curate and grant "
                f"a Canon Warrant; delete to record an authorial criticism tombstone."
            ),
        }

        # Write fragment JSON to disk
        fpath = self.fragments_dir / f"{fid}.json"
        fpath.parent.mkdir(parents=True, exist_ok=True)
        fpath.write_text(json.dumps(frag_doc, indent=2) + "\n", encoding="utf-8")

        init_hash = compute_fragment_content_hash(frag_doc)
        self.entries[fid] = {
            "fragment_id": fid,
            "conflict_id": conflict.conflict_id,
            "conflict_kind": conflict.kind,
            "asset_id": asset_id,
            "recipe_archetype": recipe_name,
            "scene_id": zone_ctx.scene_id,
            "zone_id": zone_ctx.zone_id,
            "origin": "cartographer_llm",
            "maturity": "field_note",
            "initial_sha256": init_hash,
            "current_sha256": init_hash,
            "initial_detail": detail_text,
            "current_detail": detail_text,
            "curation_edits": 0,
            "warrant_id": None,
        }
        self.save()
        return frag_doc


def select_asset_recipe(asset: Any) -> tuple[str, dict[str, Any]]:
    """Determine the explicit compilation recipe for an asset."""
    recipe_override = getattr(asset, "recipe_archetype", None) or (asset.get("recipe_archetype") if isinstance(asset, dict) else "")
    if recipe_override and recipe_override in ASSET_RECIPES:
        return recipe_override, ASSET_RECIPES[recipe_override]

    asset_id = str(getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "") or "")
    label = str(getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else "") or "")
    template = str(getattr(asset, "visual_template", None) or (asset.get("visual_template") if isinstance(asset, dict) else "") or "")
    fragment_id = str(getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "") or "")

    combined = f"{template} {asset_id} {label} {fragment_id}".lower()

    if any(k in template or k in combined for k in ("living_atlas", "atlas", "grimoire", "statute", "warrant", "lectern", "pedestal", "shelf")):
        return "monumental_document", ASSET_RECIPES["monumental_document"]
    if "r6_crate" in template or "crate" in combined:
        return "crate_freight", ASSET_RECIPES["crate_freight"]
    if "ledger_desk" in template or "desk" in combined or "quartermaster" in combined:
        return "station_desk", ASSET_RECIPES["station_desk"]
    if "weigh_scale" in template or re.search(r"\b(weigh|weight|scale|balance)\b", combined):
        return "weigh_scale", ASSET_RECIPES["weigh_scale"]
    if "glass_coffin" in template or "coffin" in combined or "stasis" in combined or "cryo" in combined:
        return "containment_relic", ASSET_RECIPES["containment_relic"]
    if any(k in template or k in combined for k in ("boom_gate", "barrier", "wicket", "gate")):
        return "barrier_gate", ASSET_RECIPES["barrier_gate"]
    if any(k in template or k in combined for k in ("bastion", "ruin", "watchtower", "terrace", "colonnade", "overhang", "wish", "monolith")):
        return "ancient_ruin", ASSET_RECIPES["ancient_ruin"]
    if any(k in template or k in combined for k in ("cairn", "signpost", "brazier")):
        return "waypoint_marker", ASSET_RECIPES["waypoint_marker"]
    if "unmodelled" in template or "unmodelled" in combined or "placeholder" in combined:
        return "unmodelled_slab", ASSET_RECIPES["unmodelled_slab"]

    return "unmodelled_slab", ASSET_RECIPES["unmodelled_slab"]


def load_fragment(fragment_id: str, fragments_dir: Path | None = None) -> dict[str, Any] | None:
    """Load and parse a fragment JSON from library/fragments."""
    if not fragment_id:
        return None
    base_dir = fragments_dir or FRAGMENTS_DIR
    path = base_dir / f"{fragment_id}.json"
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
    fragments_dir: Path | None = None,
    dynamic_allowed: set[str] | None = None,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[str]]:
    """
    Compiler admission gate:
    Validates requested fragments against the recipe's allowed fragment set
    plus any active Cartographer bridging fragments (`dynamic_allowed`).
    Separates into:
      - diffusion_fragments (`for: diffusion`): concrete visual observations
      - doctrine_fragments (`for: gemma4-orion`): rewriter constraints
      - quarantined_fragments: rejected/unprescribed fragments
    """
    allowed = set(recipe.get("allowed_fragments", set()))
    if dynamic_allowed:
        allowed |= set(dynamic_allowed)
    doctrine_fids = recipe.get("doctrine_fragments", [])

    diffusion_fragments = []
    doctrine_fragments = []
    quarantined = []
    seen = set()

    # 1. Validate primary fragment
    if fragment_id:
        if fragment_id in allowed:
            frag = load_fragment(fragment_id, fragments_dir=fragments_dir)
            if frag:
                seen.add(fragment_id)
                if frag.get("for") == "gemma4-orion":
                    doctrine_fragments.append(frag)
                else:
                    diffusion_fragments.append(frag)
        else:
            quarantined.append(fragment_id)

    # 2. Load any dynamic Cartographer bridging fragments for this asset
    if dynamic_allowed:
        for dfid in sorted(dynamic_allowed):
            if dfid not in seen:
                frag = load_fragment(dfid, fragments_dir=fragments_dir)
                if frag:
                    seen.add(dfid)
                    if frag.get("for") == "gemma4-orion":
                        doctrine_fragments.append(frag)
                    else:
                        diffusion_fragments.append(frag)

    # 3. Add recipe rewriter doctrine fragments
    for dfid in doctrine_fids:
        if dfid not in seen:
            frag = load_fragment(dfid, fragments_dir=fragments_dir)
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
    # Cartographers Scene Coherence & Epistemic Provenance Telemetry
    zone_context: dict[str, Any] = field(default_factory=dict)
    scene_backpressure: list[str] = field(default_factory=list)
    coherence_conflicts: list[dict[str, Any]] = field(default_factory=list)
    active_criticisms: list[str] = field(default_factory=list)
    standing_tier: str = "verified"
    standing_score: float = 0.65
    warrant_id: str | None = None
    saturation_score: float = 0.0
    saturation_locked: bool = False
    fragment_maturities: dict[str, str] = field(default_factory=dict)


def compile_asset_brief(
    asset: Any,
    scene_id: str = "customs-house",
    resolve_conflicts: bool = False,
    fragments_dir: Path | None = None,
    ledger_path: Path | None = None,
    llm_callback: Callable[[dict[str, Any]], str] | None = None,
) -> CompiledAssetBrief:
    """
    Hardened Recipe-based Compilation Engine with Scene Coherence Backpressure
    and Cartographers' Epistemic Governance.

    - Synchronizes with `CartographersLedger` to detect human edits (`curated` -> Canon Warrant)
      and human deletions (`criticized` -> negative backpressure tombstone).
    - Audits scene coherence against the host floorplan zone (`resolve_scene_zone_context`).
    - When `resolve_conflicts=True`, invokes the parsimonious Cartographer synthesizer to
      mint atomic bridging fragments for unresolved coherence conflicts (unless blocked by
      authorial criticism, pending field note cap, or epistemic saturation lock).
    """
    active_fragments_dir = fragments_dir or FRAGMENTS_DIR
    ledger = CartographersLedger(ledger_path=ledger_path, fragments_dir=active_fragments_dir)
    ledger.sync_with_filesystem(persist=(ledger_path is not None or DEFAULT_LEDGER_PATH.is_file()))

    asset_id = getattr(asset, "id", None) or (asset.get("id") if isinstance(asset, dict) else "unknown_asset")
    label = getattr(asset, "label", None) or (asset.get("label") if isinstance(asset, dict) else asset_id)
    fragment_id = getattr(asset, "fragment_id", None) or (asset.get("fragment_id") if isinstance(asset, dict) else "") or ""
    mass_kg = getattr(asset, "mass_kg", None) if not isinstance(asset, dict) else asset.get("mass_kg")
    bounds = getattr(asset, "bounds", None) if not isinstance(asset, dict) else asset.get("bounds", {})
    verbs = getattr(asset, "interactive_verbs", None) if not isinstance(asset, dict) else asset.get("interactive_verbs", [])
    if verbs is None:
        verbs = []
    lore_snippet = getattr(asset, "lore_snippet", None) if not isinstance(asset, dict) else asset.get("lore_snippet", "")
    base_prompt = getattr(asset, "diffusion_prompt", "") if not isinstance(asset, dict) else asset.get("diffusion_prompt", "")

    # Step 1: Select Recipe
    recipe_name, recipe = select_asset_recipe(asset)

    # Step 2: Resolve Scene Zone Context & Audit Coherence Backpressure
    zone_ctx = resolve_scene_zone_context(asset, scene_id=scene_id)
    primary_frag = load_fragment(fragment_id, fragments_dir=active_fragments_dir) if fragment_id in recipe.get("allowed_fragments", set()) else None
    scene_backpressure, raw_conflicts = audit_scene_coherence(asset, recipe_name, primary_frag, zone_ctx)

    # Step 3: Check Cartographers Ledger for existing bridging fragments, criticisms, or new synthesis
    dynamic_admitted: set[str] = set()
    active_criticisms: list[str] = []
    conflict_reports: list[dict[str, Any]] = []

    for conflict in raw_conflicts:
        prop_fid = conflict.proposed_fragment_id
        existing_entry = ledger.entries.get(prop_fid)

        # If not yet in ledger and resolve_conflicts=True, attempt parsimonious synthesis
        if existing_entry is None and resolve_conflicts:
            ledger.synthesize_field_note_fragment(
                conflict=conflict,
                asset=asset,
                recipe_name=recipe_name,
                recipe=recipe,
                zone_ctx=zone_ctx,
                llm_callback=llm_callback,
            )
            existing_entry = ledger.entries.get(prop_fid)

        if existing_entry is not None:
            mat = existing_entry.get("maturity", "field_note")
            if mat == "criticized":
                crit_text = existing_entry.get("criticism_constraint", "")
                if crit_text:
                    active_criticisms.append(crit_text)
                conflict_reports.append({
                    **asdict(conflict),
                    "resolution_status": "criticized_by_author",
                    "bridging_fragment_id": prop_fid,
                })
            elif (active_fragments_dir / f"{prop_fid}.json").is_file():
                dynamic_admitted.add(prop_fid)
                conflict_reports.append({
                    **asdict(conflict),
                    "resolution_status": f"resolved_by_{mat}",
                    "bridging_fragment_id": prop_fid,
                    "warrant_id": existing_entry.get("warrant_id"),
                })
        else:
            can_mint, gate_reason, _ = ledger.can_mint_fragment(conflict, recipe_name, recipe)
            conflict_reports.append({
                **asdict(conflict),
                "resolution_status": "unresolved",
                "parsimony_gate": gate_reason,
                "can_mint": can_mint,
            })

    # Also gather any other ledger entries targeting this asset_id directly
    for fid, entry in ledger.entries.items():
        if entry.get("asset_id") == asset_id:
            mat = entry.get("maturity")
            if mat == "criticized":
                crit = entry.get("criticism_constraint", "")
                if crit and crit not in active_criticisms:
                    active_criticisms.append(crit)
            elif (active_fragments_dir / f"{fid}.json").is_file():
                dynamic_admitted.add(fid)

    # Step 4: Resolve and Gate Fragments (Admission Control)
    diff_frags, doct_frags, quarantined = resolve_asset_fragments(
        fragment_id,
        recipe,
        fragments_dir=active_fragments_dir,
        dynamic_allowed=dynamic_admitted,
    )
    fragments_used = [f.get("id", "") for f in diff_frags + doct_frags if f.get("id")]

    # Step 5: Compute Epistemic Provenance, Standing & Saturation
    sat_info = ledger.compute_archetype_saturation(recipe_name, recipe)
    fragment_maturities: dict[str, str] = {}
    warrant_id: str | None = None
    has_curated = False
    has_field_note = False

    for fid in fragments_used:
        if fid in ledger.entries:
            mat = ledger.entries[fid].get("maturity", "field_note")
            fragment_maturities[fid] = mat
            if mat == "curated":
                has_curated = True
                warrant_id = ledger.entries[fid].get("warrant_id") or warrant_id
            elif mat == "field_note":
                has_field_note = True
        else:
            fragment_maturities[fid] = "canon"

    explicit_tier = getattr(asset, "standing_tier", None) or (asset.get("standing_tier") if isinstance(asset, dict) else None)
    if explicit_tier == "canon_locked":
        standing_tier = "canon_locked"
        standing_score = 1.00
    elif has_curated:
        standing_tier = "warranted"
        standing_score = 0.90
    elif has_field_note:
        standing_tier = "provisional"
        standing_score = 0.40
    elif active_criticisms:
        standing_tier = "refined_by_criticism"
        standing_score = 0.55
    elif recipe_name == "unmodelled_slab":
        standing_tier = "unwritten"
        standing_score = 0.15
    else:
        standing_tier = "verified"
        standing_score = 0.65

    # Step 6: Deterministic Physical Derivations + Scene Backpressure
    derive_fn = recipe.get("derive_physics", lambda m, b, v: [])
    physical_derivations = derive_fn(mass_kg, bounds, verbs)
    physical_specs = ", ".join(physical_derivations)

    # Step 7: Resolve World Aesthetic Palette
    world_look = WORLD_LOOK_DESCRIPTIONS.get(scene_id, WORLD_LOOK_DESCRIPTIONS["customs-house"])

    # Step 8: Separate Rewriter Doctrine from Diffusion Details
    doctrine_rules = [f.get("detail", "").strip() for f in doct_frags if f.get("detail")]
    diffusion_details = [f.get("detail", "").strip() for f in diff_frags if f.get("detail")]

    # Assemble Structured Intermediate Representation (Compiled Brief)
    brief_lines = [
        f"Subject: {label} (asset ID: {asset_id}, recipe: {recipe_name}).",
        f"World Context: {world_look['setting']}.",
        f"Host Zone & Substrate Backpressure: {zone_ctx.zone_name} ({zone_ctx.zone_id}) — {zone_ctx.substrate_material} (reverb: {zone_ctx.acoustic_reverb}).",
        f"Epistemic Standing: {standing_tier.upper()} (score: {standing_score:.2f}, archetype saturation: {sat_info['saturation_score']:.2f}).",
        f"Physical Derivations: {physical_specs}.",
        f"Material Construction: {world_look['materials']}.",
    ]
    if warrant_id:
        brief_lines.append(f"Canon Warrant: {warrant_id} (Certified by the Bureau of the Unwritten Atlas).")
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

    if active_criticisms:
        brief_lines.append("Authorial Criticisms (Deleted Fragment Tombstones — Do Not Repeat):")
        for crit in active_criticisms:
            brief_lines.append(f"  - {crit}")

    if quarantined:
        brief_lines.append(f"Quarantined Inadmissible Fragments: {', '.join(quarantined)}")

    compiled_brief = "\n".join(brief_lines)

    # Step 9: Execute Prompt Rewriting Pass adhering to doctrine, scene backpressure & criticisms
    rewritten_prompt = rewrite_prompt(
        label=label,
        asset_id=asset_id,
        recipe_name=recipe_name,
        physical_derivations=physical_derivations,
        world_look=world_look,
        diffusion_details=diffusion_details,
        doctrine_rules=doctrine_rules,
        scene_backpressure=scene_backpressure,
        active_criticisms=active_criticisms,
        base_prompt=base_prompt,
        llm_callback=llm_callback,
    )

    negative_clauses = [
        "ugly, blurry, low quality, artifacts, watermark, signature, distorted geometry, "
        "photographic full-room background, busy wall environment, camera perspective distortion, "
        "cutoff silhouette, extra floating items, chaotic composition"
    ]
    for fid, entry in ledger.entries.items():
        if entry.get("asset_id") == asset_id and entry.get("maturity") == "criticized":
            rejected = entry.get("current_detail") or entry.get("initial_detail", "")
            if rejected:
                negative_clauses.append(f"rejected framing ({rejected[:90]})")

    negative_prompt = ", ".join(negative_clauses)

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
        zone_context=asdict(zone_ctx),
        scene_backpressure=scene_backpressure,
        coherence_conflicts=conflict_reports,
        active_criticisms=active_criticisms,
        standing_tier=standing_tier,
        standing_score=standing_score,
        warrant_id=warrant_id,
        saturation_score=sat_info["saturation_score"],
        saturation_locked=sat_info["saturation_locked"],
        fragment_maturities=fragment_maturities,
    )


def query_gemma4_orion_rewriter(
    prompt_context: dict[str, Any],
    endpoint_url: str = "http://127.0.0.1:8080/v1/chat/completions",
    model: str = "gemma4-orion",
    timeout: float = 1.0,
) -> str | None:
    """
    HTTP adapter querying local OpenAI-compatible inference servers (e.g. llama-swap, llama.cpp, vLLM)
    running the gemma4-orion model to rewrite a game asset brief.
    Returns the rewritten diffusion prompt, or None if the server is offline or fails.
    """
    label = prompt_context.get("label", "prop")
    asset_id = prompt_context.get("asset_id", "asset")
    recipe_name = prompt_context.get("recipe_name", "generic")
    world_look = prompt_context.get("world_look", {})
    physical_derivations = prompt_context.get("physical_derivations", [])
    diffusion_details = prompt_context.get("diffusion_details", [])
    doctrine_rules = prompt_context.get("doctrine_rules", [])
    scene_backpressure = prompt_context.get("scene_backpressure", [])
    active_criticisms = prompt_context.get("active_criticisms", [])

    system_prompt = (
        "You are gemma4-orion, the prompt rewriter for the Cartographers of the Bureau of the Unwritten Atlas in SpriteQuest. "
        "You rewrite structured game asset briefs into coherent, single-face orthographic 2.5D visual prompts conditioned for Black Forest Labs Flux 3 Klein diffusion."
    )
    user_prompt = (
        f"Rewrite this game asset brief into a refined, single-sentence Flux 3 Klein diffusion prompt:\n"
        f"- Subject: {label} ({asset_id}, recipe: {recipe_name})\n"
        f"- Setting & Atmosphere: {world_look.get('setting', 'ancient ruins')}\n"
        f"- Materials: {world_look.get('materials', 'weathered stone')}\n"
        f"- Physical Specifications: {', '.join(physical_derivations)}\n"
        f"- Admitted Visual Fragments (for: diffusion): {', '.join(diffusion_details)}\n"
        f"- Doctrine Rewriter Rules (for: gemma4-orion): {'; '.join(doctrine_rules)}\n"
    )
    if scene_backpressure:
        user_prompt += f"- Scene Substrate & Backpressure: {'; '.join(scene_backpressure)}\n"
    if active_criticisms:
        user_prompt += f"- Authorial Criticisms to Avoid: {'; '.join(active_criticisms)}\n"
    user_prompt += (
        "\nRules:\n"
        "1. Depict strictly one visible front isometric three-quarter face (single-face reading doctrine).\n"
        "2. Do not relocate hidden or interior features onto the exterior.\n"
        "3. Frame as orthographic top-down 2.5D isometric game asset cutout on neutral grey background (#707070).\n"
        "4. Output ONLY the refined prompt string."
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 250,
    }
    try:
        req = urllib.request.Request(
            endpoint_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            choices = data.get("choices", [])
            if choices:
                content = choices[0].get("message", {}).get("content", "")
                if content and len(content.strip()) >= 30:
                    return content.strip().strip('"')
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
        return None
    return None


def rewrite_prompt(
    label: str,
    asset_id: str,
    recipe_name: str,
    physical_derivations: list[str],
    world_look: dict[str, str],
    diffusion_details: list[str],
    doctrine_rules: list[str],
    scene_backpressure: list[str] | None = None,
    active_criticisms: list[str] | None = None,
    base_prompt: str = "",
    llm_callback: Callable[[dict[str, Any]], str] | None = None,
    endpoint_url: str = "http://127.0.0.1:8080/v1/chat/completions",
) -> str:
    """
    Lattice Fragment Compiler Prompt Rewriter Pass:
    Gathers doctrine rules (`for: gemma4-orion`), visual sensory fragments (`for: diffusion`),
    physical derivations, and scene substrate backpressure, invoking gemma4-orion
    (via local LLM inference endpoint or callback) with deterministic authentic fallback.
    """
    context = {
        "label": label,
        "asset_id": asset_id,
        "recipe_name": recipe_name,
        "physical_derivations": physical_derivations,
        "world_look": world_look,
        "diffusion_details": diffusion_details,
        "doctrine_rules": doctrine_rules,
        "scene_backpressure": scene_backpressure or [],
        "active_criticisms": active_criticisms or [],
        "base_prompt": base_prompt,
    }

    # 1. Custom LLM callback if provided
    if llm_callback is not None:
        try:
            custom_result = llm_callback(context)
            if custom_result and len(custom_result.strip()) >= 30:
                return custom_result.strip()
        except Exception:
            pass

    # 2. Live local inference server with model gemma4-orion
    live_result = query_gemma4_orion_rewriter(context, endpoint_url=endpoint_url, model="gemma4-orion")
    if live_result:
        return live_result

    # 3. Authentic deterministic gemma4-orion doctrine rewrite pass
    clauses = [f"{label}"]
    for deriv in physical_derivations:
        if not any(deriv.startswith(prefix) for prefix in ("bounding", "inspection", "marker", "barrier", "workstation", "containment", "monumental", "fixture")):
            clauses.append(deriv)

    if scene_backpressure:
        for bp in scene_backpressure:
            if bp not in clauses:
                clauses.append(bp)

    for detail in diffusion_details:
        if detail not in clauses:
            clauses.append(detail)

    subject_clause = ", ".join(clauses)
    materials_clause = world_look.get("materials", "weathered stone, rough timber")

    prompt_parts = [
        "orthographic top-down 2.5D isometric game asset cutout, single front isometric elevation displaying primary visible face",
        subject_clause,
        f"crafted with {materials_clause}",
        "isolated on neutral solid grey background (#707070), no background walls, no room floors, perfectly clean silhouette, ready for alpha matting",
        "subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath base",
        "crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024",
    ]

    return ", ".join(prompt_parts)


def compile_npc_facet_brief(
    sheet: dict[str, Any],
    facet: str,
    fragment_text: str = "",
    scene_id: str = "customs-house",
    fragments_dir: Path | None = None,
    ledger_path: Path | None = None,
    llm_callback: Callable[[dict[str, Any]], str] | None = None,
) -> CompiledAssetBrief:
    """
    Compile an NPC sheet facet (portrait, cutout, home, favored_items, aspirations)
    through explicit facet recipes, applying scene substrate backpressure,
    CartographersLedger provenance, and single-face orthographic doctrine.
    """
    active_fragments_dir = fragments_dir or FRAGMENTS_DIR
    ledger = CartographersLedger(ledger_path=ledger_path, fragments_dir=active_fragments_dir)
    ledger.sync_with_filesystem(persist=(ledger_path is not None or DEFAULT_LEDGER_PATH.is_file()))

    name = sheet.get("name", "Unnamed Character")
    role = sheet.get("role", "")
    style = sheet.get("style", "")
    world_id = sheet.get("world_id") or sheet.get("world", "scaffolded-kingdom")
    written = sheet.get("written", False)

    # Normalize facet text
    raw_content = fragment_text or sheet.get(facet, "")
    if isinstance(raw_content, list):
        facet_detail = raw_content[0] if raw_content else ""
    else:
        facet_detail = str(raw_content)

    recipe_name = f"npc_{facet}"
    if recipe_name not in ASSET_RECIPES:
        recipe_name = "npc_portrait"
    recipe = ASSET_RECIPES[recipe_name]

    # Resolve scene context
    zone_ctx = resolve_scene_zone_context(sheet, scene_id=scene_id)
    scene_backpressure = [
        f"grounded in {zone_ctx.zone_name}",
        f"grounded upon {zone_ctx.substrate_material}",
    ]

    # Check for cross-domain tension
    coherence_conflicts = []
    if "space-vampires" in world_id and "customs-house" in scene_id:
        scene_backpressure.append("thermoelectric conduits frosted with border ice amidst customs pine")
    elif "grey-wind" in world_id and "customs-house" in scene_id:
        scene_backpressure.append("slate-grey mountain chill cutting through customs intake drafts")

    # Physical derivations
    deriv_fn = recipe.get("derive_physics", lambda m, b, v: [])
    physical_derivations = deriv_fn(None, {}, [])

    # Check ledger for NPC/facet warrants or criticisms
    active_criticisms = []
    warrant_id = None
    npc_slug = name.lower().replace(" ", "_").replace("-", "_")
    for fid, entry in ledger.entries.items():
        if entry.get("asset_id") in (npc_slug, f"{npc_slug}_{facet}"):
            if entry.get("maturity") == "criticized":
                crit = entry.get("criticism_constraint")
                if crit:
                    active_criticisms.append(crit)
            elif entry.get("maturity") == "curated":
                warrant_id = entry.get("warrant_id") or warrant_id

    if warrant_id:
        standing_tier = "warranted"
        standing_score = 0.90
    elif written:
        standing_tier = "verified"
        standing_score = 0.65
    else:
        standing_tier = "provisional"
        standing_score = 0.40

    # Assemble prompt
    subject_str = f"{name}, {role}" if role else name
    core_body = f"{subject_str}. {facet_detail}" if facet_detail else subject_str

    if facet == "cutout":
        prompt_parts = [
            style if style else "Retro JRPG character art, sword and sorcery, 16-bit pixel aesthetic with painterly shading",
            "orthographic top-down 2.5D isometric game character sprite cutout",
            core_body,
            scene_backpressure[0],
            "full-figure standing character from head to boots, front three-quarter view, perfectly clean silhouette, ready for alpha matting",
            "isolated on neutral solid grey background (#707070), no background walls, no room floors",
            "subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath feet",
            "crisp 16-bit painterly texture, highly detailed tactile character sprite, Black Forest Labs Flux 3 Klein render, 1024x1024",
        ]
    elif facet == "portrait":
        prompt_parts = [
            style if style else "Retro JRPG character art, sword and sorcery, 16-bit pixel aesthetic with painterly shading",
            "character portrait bust, front three-quarter angle",
            core_body,
            "expressive character visage, fine facial details, atmospheric cinematic rim lighting, 16-bit painterly texture, Black Forest Labs Flux 3 Klein render, 1024x1024",
        ]
    elif facet == "home":
        prompt_parts = [
            style if style else "Retro JRPG environmental concept art, painterly shading",
            "wide environmental interior perspective",
            core_body,
            f"constructed with {zone_ctx.substrate_material}, atmospheric depth, volumetric light shafts",
            "rich narrative environmental details, level transition threshold, Black Forest Labs Flux 3 Klein render, 1024x1024",
        ]
    elif facet == "favored_items":
        prompt_parts = [
            style if style else "Retro JRPG inventory icon art, painterly shading",
            "tactile inventory item prop cutout on neutral background",
            core_body,
            "hand-held tactile physical relic, material wear and verified provenance, clean isolated silhouette, subtle drop shadow, Black Forest Labs Flux 3 Klein render, 1024x1024",
        ]
    else:  # aspirations
        prompt_parts = [
            style if style else "Theatrical cinematic narrative art, painterly shading",
            "wide narrative tableau",
            core_body,
            "dramatic theatrical lighting contrast, chiaroscuro, poetic environmental scale, Black Forest Labs Flux 3 Klein render, 1024x1024",
        ]

    rewritten_prompt = ". ".join(p.strip().rstrip(".") for p in prompt_parts if p) + "."

    negative_clauses = ["blurry", "photorealistic human photo", "deformed limbs", "modern CGI"]
    if active_criticisms:
        negative_clauses.extend(active_criticisms)
    negative_prompt = ", ".join(negative_clauses)

    return CompiledAssetBrief(
        asset_id=f"{npc_slug}_{facet}",
        label=f"{name} ({facet})",
        recipe_archetype=recipe_name,
        fragment_id=facet,
        scene_id=scene_id,
        physical_specs=", ".join(physical_derivations),
        world_look={"materials": zone_ctx.substrate_material, "reverb": zone_ctx.acoustic_reverb},
        fragments_used=list(recipe.get("allowed_fragments", [])),
        quarantined_fragments=[],
        doctrine_rules=recipe.get("doctrine_fragments", []),
        diffusion_details=[facet_detail] if facet_detail else [],
        compiled_brief=core_body,
        rewritten_prompt=rewritten_prompt,
        negative_prompt=negative_prompt,
        zone_context=asdict(zone_ctx),
        scene_backpressure=scene_backpressure,
        coherence_conflicts=coherence_conflicts,
        active_criticisms=active_criticisms,
        standing_tier=standing_tier,
        standing_score=standing_score,
        warrant_id=warrant_id,
        saturation_score=0.5,
        saturation_locked=False,
        fragment_maturities={},
    )


def query_live_local_llm(
    context: dict[str, Any],
    endpoint_url: str = "http://127.0.0.1:8080/v1/chat/completions",
    model: str = "gemma4-orion",
    timeout: float = 3.0,
) -> str | None:
    """
    HTTP adapter for local OpenAI-compatible inference servers (e.g. llama-swap, llama.cpp, vLLM).
    Calls /v1/chat/completions with the Cartographer's epistemic governance prompt.
    Returns the generated field note string, or None if the server is offline or fails.
    """
    conflict = context.get("conflict", {})
    zone_ctx = context.get("zone_context", {})
    criticisms = context.get("criticisms_to_avoid", [])

    prompt = (
        f"You are the Cartographer of the Bureau of the Unwritten Atlas in SpriteQuest.\n"
        f"Resolve this coherence conflict with a concise, single-sentence Schema v1 sensory detail:\n"
        f"- Conflict kind: {conflict.get('kind', 'cross_domain_anomaly')}\n"
        f"- Description: {conflict.get('description', '')}\n"
        f"- Substrate: {zone_ctx.get('substrate_material', 'stone')}\n"
        f"- Lighting: {zone_ctx.get('lighting_profile', 'ambient')}\n"
    )
    if criticisms:
        prompt += f"- Rejected constraints to avoid: {'; '.join(criticisms)}\n"
    prompt += "Provide ONLY the descriptive detail clause."

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a concise fantasy worldbuilder creating sensory prop descriptions."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": 120,
    }
    try:
        req = urllib.request.Request(
            endpoint_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            choices = data.get("choices", [])
            if choices:
                content = choices[0].get("message", {}).get("content", "")
                if content and len(content.strip()) >= 10:
                    return content.strip().strip('"')
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError):
        return None
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="SpriteQuest Fragment Compiler & Cartographers Epistemic Governor")
    parser.add_argument("--scene", default="customs-house", help="Host scene ID (default: customs-house)")
    parser.add_argument("--live-llm", action="store_true", help="Enable live local LLM synthesis adapter")
    parser.add_argument("--llm-url", default="http://127.0.0.1:8080/v1/chat/completions", help="Local LLM endpoint URL")
    args = parser.parse_args()

    print(f"SpriteQuest Fragment Compiler: scene='{args.scene}', live_llm={args.live_llm}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
