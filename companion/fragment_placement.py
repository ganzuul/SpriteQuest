#!/usr/bin/env python3
"""
companion/fragment_placement.py

Fragment-to-Asset Derivation & Placement Engine for SpriteQuest.

Translates declarative floorplan sockets (`library/floorplans/*.json`) and outdoor map props
into concrete, visually meaningful scene assets with physical parameters (mass in kg,
collision bounds, obstacle types, and semantic salience) compiled through `compile_asset_brief`.

Following the SpriteQuest standing rule:
  - Major fragments produce prominent, interactive, physically reactive assets.
  - Minor fragments produce nuanced decorative or contextual details.
  - Floorplan sockets drive scene composition declaratively, retiring hardcoded prop sketches.
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
    salience: str  # "major" | "moderate" | "minor" | "monumental"
    obstacle_type: str  # "physics_object" | "destructible_physics_object" | "solid_furniture" | "wall" | "passable"
    mass_kg: float
    world_x: float
    world_y: float
    world_z: float
    bounds: dict[str, float]  # width, depth, height
    visual_template: str  # "r6_crate", "ledger_desk", "weigh_scale", "glass_coffin", "warrant_pedestal", etc.
    interactive_verbs: list[str] = field(default_factory=list)
    lore_snippet: str = ""
    destructible: bool = False
    is_smashed: bool = False
    smash_threshold_kg: float = 80.0
    image_url: str | None = None
    diffusion_prompt: str = ""
    compiled_brief: str = ""
    fragments_used: list[str] = field(default_factory=list)
    world_setting: str = ""
    zone_context: dict[str, Any] = field(default_factory=dict)
    coherence_conflicts: list[dict[str, Any]] = field(default_factory=list)
    active_criticisms: list[str] = field(default_factory=list)
    standing_tier: str = "verified"
    standing_score: float = 0.65
    warrant_id: str | None = None
    saturation_score: float = 0.0
    saturation_locked: bool = False


class FragmentPlacementEngine:
    """Resolves declarative floorplan sockets and outdoor map props into placed physical scene assets."""

    def __init__(self, scene_engine: Any):
        self.scene_engine = scene_engine
        self.fragment_assets: list[FragmentAsset] = []
        self._derive_fragment_assets()

    def _derive_fragment_assets(self) -> None:
        """Derive concrete assets from declarative scene sockets and outdoor map props."""
        from companion.fragment_compiler import compile_asset_brief

        # 1. Resolve declarative sockets from floorplans assigned to build plates
        build_plates = getattr(self.scene_engine, "build_plates", [])
        primary_scene_id = "customs-house"

        for plate in build_plates:
            fp_rel = plate.get("scene_floorplan")
            if not fp_rel:
                continue

            fp_path = REPO_ROOT / fp_rel
            if not fp_path.exists():
                continue

            try:
                fp_data = json.loads(fp_path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                continue

            scene_id = fp_data.get("scene_id", plate.get("id", "customs-house"))
            primary_scene_id = scene_id
            anchor = plate.get("anchor", {})
            anc_x = float(anchor.get("center_x", 0.0))
            anc_y = float(anchor.get("center_y", 0.0))
            anc_z = float(anchor.get("elevation", 0.0))

            scale_info = fp_data.get("scale", {})
            center_xz = scale_info.get("center_xz", [0.0, 30.0])
            cx, cz = float(center_xz[0]), float(center_xz[1])

            sockets = fp_data.get("prop_sockets", [])
            for sock in sockets:
                sock_id = sock.get("id") or sock.get("socket_id")
                if not sock_id:
                    continue

                frag_id = sock.get("fragment_id", "")
                label = sock.get("label", sock_id)
                salience = sock.get("salience", "moderate")
                obstacle_type = sock.get("obstacle_type", "solid_furniture")
                mass_kg = float(sock.get("mass_kg", 50.0))

                # Local position [x, elevation, z] -> world [x, y, z]
                at = sock.get("at", [0.0, 0.0, 0.0])
                wx = round(anc_x + (float(at[0]) - cx), 2)
                wy = round(anc_y + (float(at[2]) - cz), 2)
                wz = round(anc_z + float(at[1]), 2)

                bounds = sock.get("bounds", {"width": 1.0, "depth": 1.0, "height": 1.0})
                v_temp = sock.get("visual_template", "generic_prop")
                verbs = sock.get("interactive_verbs", ["inspect"])
                destructible = bool(sock.get("destructible", False))
                smash_th = float(sock.get("smash_threshold_kg", 80.0))
                image_url = sock.get("image_url")

                # Resolve lore snippet from fragment detail if not explicitly specified
                lore = sock.get("lore_snippet", "")
                if not lore and frag_id:
                    frag_file = REPO_ROOT / "library" / "fragments" / f"{frag_id}.json"
                    if frag_file.is_file():
                        try:
                            f_data = json.loads(frag_file.read_text(encoding="utf-8"))
                            lore = f_data.get("detail", "")
                        except Exception:
                            pass

                asset = FragmentAsset(
                    id=sock_id,
                    fragment_id=frag_id,
                    label=label,
                    salience=salience,
                    obstacle_type=obstacle_type,
                    mass_kg=mass_kg,
                    world_x=wx,
                    world_y=wy,
                    world_z=wz,
                    bounds=bounds,
                    visual_template=v_temp,
                    interactive_verbs=verbs,
                    lore_snippet=lore,
                    destructible=destructible,
                    is_smashed=False,
                    smash_threshold_kg=smash_th,
                    image_url=image_url,
                )
                self.fragment_assets.append(asset)

        # 2. Resolve Outdoor Frontier Props from scene engine
        if hasattr(self.scene_engine, "get_outdoor_props"):
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
                            image_url="../../terrain/demo-plateau/terrain_relief.png",
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
                            image_url=None,
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
                            image_url=None,
                        )
                    )

        # 3. Compile world look, recipe selection, scene backpressure, and prompt rewriting
        for fa in self.fragment_assets:
            cb = compile_asset_brief(fa, scene_id=primary_scene_id)
            fa.compiled_brief = cb.compiled_brief
            fa.diffusion_prompt = cb.rewritten_prompt
            fa.fragments_used = cb.fragments_used
            fa.world_setting = cb.world_look.get("setting", "")
            fa.zone_context = cb.zone_context
            fa.coherence_conflicts = cb.coherence_conflicts
            fa.active_criticisms = cb.active_criticisms
            fa.standing_tier = cb.standing_tier
            fa.standing_score = cb.standing_score
            fa.warrant_id = cb.warrant_id
            fa.saturation_score = cb.saturation_score
            fa.saturation_locked = cb.saturation_locked

    def export_fragment_assets(self) -> list[dict[str, Any]]:
        """Export list of fragment assets for JSON serialization."""
        return [asdict(fa) for fa in self.fragment_assets]
