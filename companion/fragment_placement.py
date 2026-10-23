#!/usr/bin/env python3
"""
companion/fragment_placement.py

Fragment-to-Asset Derivation & Placement Engine for SpriteQuest.

Translates semantic lore fragments from `library/fragments/` into concrete,
visually meaningful scene assets with physical parameters (mass in kg,
collision bounds, obstacle types, and semantic salience).

Following the SpriteQuest standing rule:
  - Major fragments produce prominent, interactive, physically reactive assets.
  - Minor fragments produce nuanced decorative or contextual details.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class FragmentAsset:
    id: str
    fragment_id: str
    label: str
    salience: str  # "major" | "moderate" | "minor"
    obstacle_type: str  # "physics_object" | "solid_furniture" | "wall" | "passable"
    mass_kg: float
    world_x: float
    world_y: float
    world_z: float
    bounds: dict[str, float]  # width, depth, height
    visual_template: str  # "r6_crate", "balance_scale", "ledger_desk", "cairn", etc.
    interactive_verbs: list[str] = field(default_factory=list)
    lore_snippet: str = ""


class FragmentPlacementEngine:
    """Resolves library fragments into placed physical scene assets."""

    def __init__(self, scene_engine: Any):
        self.scene_engine = scene_engine
        self.fragment_assets: list[FragmentAsset] = []
        self._derive_fragment_assets()

    def _derive_fragment_assets(self) -> None:
        """Derive concrete assets from active scene fragments."""
        # Find plate anchor for customs house
        anc_x, anc_y, anc_z = 55.0, 65.0, 6.0
        for plate in self.scene_engine.build_plates:
            anchor = plate.get("anchor", {})
            if "center_x" in anchor:
                anc_x = float(anchor["center_x"])
                anc_y = float(anchor["center_y"])
                anc_z = float(anchor.get("elevation", 6.0))
                break

        # 1. R6 SHIP Crate (Major physics object, crate demanded by arithmetic)
        # Placed near Mark S downstage in clearance hall
        r6_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "r6-ship.json"
        r6_desc = ""
        if r6_frag_path.exists():
            r6_data = json.loads(r6_frag_path.read_text(encoding="utf-8"))
            r6_desc = r6_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="r6_ship_crate_standard",
                fragment_id="customs-house/r6-ship",
                label="R6-SHIP Standardized Bounding Crate",
                salience="major",
                obstacle_type="physics_object",
                mass_kg=42.5,
                world_x=46.0,
                world_y=56.0,
                world_z=anc_z,
                bounds={"width": 1.2, "depth": 1.2, "height": 1.0},
                visual_template="r6_crate",
                interactive_verbs=["push", "heft", "weigh_cargo", "inspect"],
                lore_snippet=r6_desc,
            )
        )

        # 2. Hollis's Ledger Desk & Two-Column Folio
        hollis_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "hollis-ledger.json"
        hollis_desc = ""
        if hollis_frag_path.exists():
            h_data = json.loads(hollis_frag_path.read_text(encoding="utf-8"))
            hollis_desc = h_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="quartermaster_desk",
                fragment_id="customs-house/hollis-ledger",
                label="Hollis's Quartermaster Ledger Desk",
                salience="major",
                obstacle_type="solid_furniture",
                mass_kg=180.0,
                world_x=63.0,
                world_y=69.0,
                world_z=anc_z + 0.6,
                bounds={"width": 2.4, "depth": 1.4, "height": 1.1},
                visual_template="ledger_desk",
                interactive_verbs=["inscribe_ledger", "strike_seal", "read_columns"],
                lore_snippet=hollis_desc,
            )
        )

        # 3. Two-Pan Balance Scale & Inspection Weigh Table
        beats_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "first-clearance-beats.json"
        beats_desc = ""
        if beats_frag_path.exists():
            b_data = json.loads(beats_frag_path.read_text(encoding="utf-8"))
            beats_desc = b_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="weigh_table",
                fragment_id="customs-house/first-clearance-beats",
                label="Inspection Zinc Counter & 1588 Balance Scale",
                salience="major",
                obstacle_type="solid_furniture",
                mass_kg=120.0,
                world_x=48.0,
                world_y=63.0,
                world_z=anc_z,
                bounds={"width": 1.8, "depth": 1.0, "height": 1.0},
                visual_template="weigh_scale",
                interactive_verbs=["weigh_cargo", "present_manifest", "strike_level"],
                lore_snippet=beats_desc,
            )
        )

        # 4. Impounded Goods Locker & Forfeit Crate
        forfeit_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "forfeit-corridor.json"
        forfeit_desc = ""
        if forfeit_frag_path.exists():
            f_data = json.loads(forfeit_frag_path.read_text(encoding="utf-8"))
            forfeit_desc = f_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="forfeit_wardrobe",
                fragment_id="customs-house/forfeit-corridor",
                label="Impounded Goods Heavy Iron Locker",
                salience="moderate",
                obstacle_type="solid_furniture",
                mass_kg=150.0,
                world_x=41.2,
                world_y=87.0,
                world_z=anc_z,
                bounds={"width": 1.4, "depth": 0.8, "height": 2.0},
                visual_template="heavy_locker",
                interactive_verbs=["inspect_seizures"],
                lore_snippet=forfeit_desc,
            )
        )

        # 5. Outdoor Frontier Props
        for op in self.scene_engine.get_outdoor_props():
            if "cairn" in op.id:
                self.fragment_assets.append(
                    FragmentAsset(
                        id=op.id,
                        fragment_id="grey-wind/mountain-passage",
                        label=op.label,
                        salience="moderate",
                        obstacle_type="solid_furniture",
                        mass_kg=400.0,
                        world_x=op.world_x,
                        world_y=op.world_y,
                        world_z=op.world_z,
                        bounds={"width": 1.6, "depth": 1.6, "height": 1.8},
                        visual_template="cairn",
                        interactive_verbs=["read_cairn_mark"],
                        lore_snippet="Survey cairn marking the threshold between territory chunks.",
                    )
                )
            elif "brazier" in op.id:
                self.fragment_assets.append(
                    FragmentAsset(
                        id=op.id,
                        fragment_id="customs-house/the-site",
                        label=op.label,
                        salience="minor",
                        obstacle_type="solid_furniture",
                        mass_kg=75.0,
                        world_x=op.world_x,
                        world_y=op.world_y,
                        world_z=op.world_z,
                        bounds={"width": 1.0, "depth": 1.0, "height": 1.2},
                        visual_template="brazier",
                        interactive_verbs=["warm_hands"],
                        lore_snippet="Hearth brazier keeping watch over the customs approach.",
                    )
                )
            elif "signpost" in op.id:
                self.fragment_assets.append(
                    FragmentAsset(
                        id=op.id,
                        fragment_id="cartographers/unwritten-borders",
                        label=op.label,
                        salience="minor",
                        obstacle_type="solid_furniture",
                        mass_kg=30.0,
                        world_x=op.world_x,
                        world_y=op.world_y,
                        world_z=op.world_z,
                        bounds={"width": 0.8, "depth": 0.8, "height": 2.2},
                        visual_template="signpost",
                        interactive_verbs=["read_sign"],
                        lore_snippet="Weathered timber signpost pointing toward the border march.",
                    )
                )

    def export_fragment_assets(self) -> list[dict[str, Any]]:
        """Export list of fragment assets for JSON serialization."""
        return [asdict(fa) for fa in self.fragment_assets]
