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
    obstacle_type: str  # "physics_object" | "destructible_physics_object" | "solid_furniture" | "wall" | "passable"
    mass_kg: float
    world_x: float
    world_y: float
    world_z: float
    bounds: dict[str, float]  # width, depth, height
    visual_template: str  # "r6_crate", "balance_scale", "ledger_desk", "glass_coffin", "warrant_pedestal", "unmodelled_slab", "cairn", etc.
    interactive_verbs: list[str] = field(default_factory=list)
    lore_snippet: str = ""
    destructible: bool = False
    is_smashed: bool = False
    smash_threshold_kg: float = 80.0
    image_url: str | None = None
    diffusion_prompt: str = ""


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
                image_url=None,
                diffusion_prompt="orthographic top-down game asset, standardized rectangular wooden bounding crate with stencil lettering 'R6-SHIP', black iron reinforcement corner brackets, arithmetic customs clearance seal stamped on pine slats, pure white background, pixel-perfect isometric asset, 1024x1024",
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
                image_url="../../floorplans/furniture-room/ortho_gt/mattes/table.png",
                diffusion_prompt="heavy oak customs quartermaster desk with open two-column vellum ledger folio, brass inkwell, and goose quill",
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
                image_url=None,
                diffusion_prompt="heavy timber inspection weigh table bearing large twin-pan brass balance scale, counterweights, and stamped lead calibration marks",
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
                image_url="../../floorplans/furniture-room/ortho_gt/mattes/wardrobe.png",
                diffusion_prompt="heavy iron customs impounded wardrobe with heavy padlock and confiscation seal",
            )
        )

        # 5. Borosilicate Glass Stasis Coffin (Space-Vampires impounded artifact awaiting quarantine)
        coffin_frag_path = REPO_ROOT / "library" / "fragments" / "space-vampires" / "glass-stasis-coffin.json"
        coffin_desc = ""
        if coffin_frag_path.exists():
            c_data = json.loads(coffin_frag_path.read_text(encoding="utf-8"))
            coffin_desc = c_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="glass_stasis_coffin",
                fragment_id="space-vampires/glass-stasis-coffin",
                label="Hexagonal Borosilicate Glass Stasis Coffin",
                salience="major",
                obstacle_type="destructible_physics_object",
                mass_kg=280.0,
                world_x=44.0,
                world_y=84.0,
                world_z=anc_z,
                bounds={"width": 0.8, "depth": 2.3, "height": 0.9},
                visual_template="glass_coffin",
                interactive_verbs=["inspect_cryo_gauge", "tap_glass", "push", "smash"],
                lore_snippet=coffin_desc,
                destructible=True,
                is_smashed=False,
                smash_threshold_kg=80.0,
                image_url=None,
                diffusion_prompt="hexagonal borosilicate glass stasis coffin, pressurized cryo-chamber with luminescent teal liquid coolant and sealed carbon-composite rim, Flux 3 Klein isometric render",
            )
        )

        # 6. Canon Warrant Pedestal (Cartographers' certified seal & surveyor folio)
        warrant_frag_path = REPO_ROOT / "library" / "fragments" / "cartographers" / "canon-warrant.json"
        warrant_desc = ""
        if warrant_frag_path.exists():
            w_data = json.loads(warrant_frag_path.read_text(encoding="utf-8"))
            warrant_desc = w_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="canon_warrant_pedestal",
                fragment_id="cartographers/canon-warrant",
                label="Bureau of the Unwritten Atlas Canon Warrant Pedestal",
                salience="moderate",
                obstacle_type="solid_furniture",
                mass_kg=65.0,
                world_x=67.0,
                world_y=63.0,
                world_z=anc_z,
                bounds={"width": 1.0, "depth": 1.0, "height": 1.4},
                visual_template="warrant_pedestal",
                interactive_verbs=["audit_warrant", "read_seal"],
                lore_snippet=warrant_desc,
                image_url=None,
                diffusion_prompt="carved stone pedestal displaying a polished brass surveyor warrant disc with stamped imperial wax ribbon, Flux 3 Klein render",
            )
        )

        # 7. Unmodelled Placeholder Slab (4th-wall standing translation of prompt underdetermination)
        unmod_frag_path = REPO_ROOT / "library" / "fragments" / "shared" / "unmodelled-prop.json"
        unmod_desc = ""
        if unmod_frag_path.exists():
            u_data = json.loads(unmod_frag_path.read_text(encoding="utf-8"))
            unmod_desc = u_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="unmodelled_placeholder_slab",
                fragment_id="shared/unmodelled-prop",
                label="Unmodelled Generative Slab (Awaiting Prompt Specification)",
                salience="minor",
                obstacle_type="physics_object",
                mass_kg=15.0,
                world_x=42.0,
                world_y=74.0,
                world_z=anc_z,
                bounds={"width": 0.9, "depth": 0.9, "height": 0.8},
                visual_template="unmodelled_slab",
                interactive_verbs=["inspect_wireframe", "push", "author_prompt"],
                lore_snippet=unmod_desc,
                image_url=None,
                diffusion_prompt="untextured digital clay wireframe bounding slab awaiting text prompt specification, orthographic bounding box",
            )
        )

        # 8. Imperial Clearance Statutes Board (Customs entrance law & tariff proclamation)
        statute_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "statutes.json"
        statute_desc = ""
        if statute_frag_path.exists():
            s_data = json.loads(statute_frag_path.read_text(encoding="utf-8"))
            statute_desc = s_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="imperial_statute_board",
                fragment_id="customs-house/statutes",
                label="Imperial Clearance Statutes & Tariff Board",
                salience="moderate",
                obstacle_type="solid_furniture",
                mass_kg=85.0,
                world_x=45.0,
                world_y=42.0,
                world_z=anc_z,
                bounds={"width": 1.4, "depth": 0.5, "height": 2.2},
                visual_template="statute_board",
                interactive_verbs=["read_statutes", "audit_tariffs", "inspect_seal"],
                lore_snippet=statute_desc or "Posted Imperial clearance decrees, weights, and tariff schedules.",
                image_url=None,
                diffusion_prompt="weathered timber noticeboard with posted imperial clearance decrees, red wax seals, and tariff schedule placards",
            )
        )

        # 9. Ancient Chained Grimoire on Lectern (Wizard-Tower mystical archive)
        grimoire_frag_path = REPO_ROOT / "library" / "fragments" / "wizard-tower" / "the-grimoire.json"
        grimoire_desc = ""
        if grimoire_frag_path.exists():
            g_data = json.loads(grimoire_frag_path.read_text(encoding="utf-8"))
            grimoire_desc = g_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="ancient_grimoire_lectern",
                fragment_id="wizard-tower/the-grimoire",
                label="Ancient Chained Grimoire on Carved Oak Lectern",
                salience="major",
                obstacle_type="solid_furniture",
                mass_kg=48.0,
                world_x=68.0,
                world_y=73.0,
                world_z=anc_z,
                bounds={"width": 1.1, "depth": 1.0, "height": 1.6},
                visual_template="grimoire_lectern",
                interactive_verbs=["consult_arcana", "turn_page", "read_runes"],
                lore_snippet=grimoire_desc or "Vellum grimoire inscribed with glyphs of structural generation.",
                image_url=None,
                diffusion_prompt="ancient chained vellum grimoire open on a carved dark oak lectern with glowing cyan arcane glyphs, Flux 3 Klein render",
            )
        )

        # 10. Monumental Living Atlas on Granite Pedestal (Cartographers Guild certified truth)
        atlas_frag_path = REPO_ROOT / "library" / "fragments" / "cartographers" / "the-living-atlas.json"
        atlas_desc = ""
        if atlas_frag_path.exists():
            a_data = json.loads(atlas_frag_path.read_text(encoding="utf-8"))
            atlas_desc = a_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="monumental_living_atlas",
                fragment_id="cartographers/the-living-atlas",
                label="Monumental Counterweighted Living Atlas Folio",
                salience="monumental",
                obstacle_type="solid_furniture",
                mass_kg=450.0,
                world_x=66.0,
                world_y=64.0,
                world_z=anc_z + 0.6,
                bounds={"width": 2.5, "depth": 1.6, "height": 1.4},
                visual_template="living_atlas",
                interactive_verbs=["inspect_cartography", "verify_warrant", "turn_brass_crank"],
                lore_snippet=atlas_desc or "Colossal pigskin-and-brass folio illuminating certified terrain and physical constants.",
                image_url=None,
                diffusion_prompt="monumental counterweighted living atlas folio bound in pigskin and brass mesh, colossal open vellum leaves on a canted granite pedestal illuminating certified terrain and cartographic warrants",
            )
        )

        # 11. Uninstalled Matte Backdrop Flat (Shared prompt/seam physical prop)
        matte_frag_path = REPO_ROOT / "library" / "fragments" / "shared" / "matte-backdrop-uninstalled.json"
        matte_desc = ""
        if matte_frag_path.exists():
            m_data = json.loads(matte_frag_path.read_text(encoding="utf-8"))
            matte_desc = m_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="uninstalled_matte_flat",
                fragment_id="shared/matte-backdrop-uninstalled",
                label="Uninstalled Painted Scenic Flat (Primed Canvas)",
                salience="minor",
                obstacle_type="physics_object",
                mass_kg=22.0,
                world_x=39.0,
                world_y=44.0,
                world_z=anc_z,
                bounds={"width": 1.0, "depth": 0.4, "height": 2.6},
                visual_template="matte_flat",
                interactive_verbs=["push", "unroll_canvas", "inspect_cut_edge"],
                lore_snippet=matte_desc or "Large primed canvas flat leaning in corner as physical object rather than scenery.",
                image_url=None,
                diffusion_prompt="large rolled heavy primed canvas flat leaning as a physical object against a wall, cut canvas edge and painted scenic face visible with pine dowel rods",
            )
        )

        # 12. Impounded Forfeit Chest (Customs-house forfeiture yard-stock)
        forfeit_frag_path = REPO_ROOT / "library" / "fragments" / "customs-house" / "forfeit-corridor.json"
        forfeit_desc = ""
        if forfeit_frag_path.exists():
            f_data = json.loads(forfeit_frag_path.read_text(encoding="utf-8"))
            forfeit_desc = f_data.get("detail", "")

        self.fragment_assets.append(
            FragmentAsset(
                id="impounded_forfeit_chest",
                fragment_id="customs-house/forfeit-corridor",
                label="Impounded Forfeit Consignment Chest",
                salience="moderate",
                obstacle_type="physics_object",
                mass_kg=95.0,
                world_x=56.0,
                world_y=46.0,
                world_z=anc_z,
                bounds={"width": 1.4, "depth": 1.0, "height": 1.0},
                visual_template="forfeit_chest",
                interactive_verbs=["audit_impound", "inspect_forfeiture_lock", "push"],
                lore_snippet=forfeit_desc or "Failed consignment cage impounded under draft flags: rough, waiting, absorbing.",
                image_url=None,
                diffusion_prompt="iron-banded forfeiture consignment lockbox with heavy lead padlock and yellow draft inspection tag reading DRAFT/ROUGH",
            )
        )

        # 13. Outdoor Frontier Props
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
                        diffusion_prompt="rough stone survey cairn marking threshold between mountain territories, weathered lichen and carved survey glyphs",
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
                        diffusion_prompt="cast iron hearth brazier with glowing amber charcoal embers",
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
                        diffusion_prompt="weathered timber signpost pointing toward the border march",
                    )
                )

    def export_fragment_assets(self) -> list[dict[str, Any]]:
        """Export list of fragment assets for JSON serialization."""
        return [asdict(fa) for fa in self.fragment_assets]
