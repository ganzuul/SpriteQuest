#!/usr/bin/env python3
"""
companion/test_fragment_compiler.py

Unit tests for the SpriteQuest Hardened Fragment Compiler, Scene-Coherence Backpressure,
Cartographers' Epistemic Governor (Parsimony & Saturation), and Human Curation Lifecycle
(Create -> Edit/Warrant -> Delete/Criticism Tombstone).
"""

import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.fragment_compiler import (
    ASSET_RECIPES,
    CartographersLedger,
    audit_scene_coherence,
    compile_asset_brief,
    load_fragment,
    resolve_asset_fragments,
    resolve_scene_zone_context,
    select_asset_recipe,
)


class TestFragmentCompiler(unittest.TestCase):
    def test_load_existing_fragment(self):
        frag = load_fragment("customs-house/r6-ship")
        self.assertIsNotNone(frag)
        self.assertEqual(frag.get("id"), "customs-house/r6-ship")
        self.assertEqual(frag.get("for"), "diffusion")
        self.assertIn("R6 SHIP", frag.get("detail", ""))

    def test_fastener_anti_pattern_is_quarantined_and_removed(self):
        frag = load_fragment("shared/fasteners-on-their-own-face")
        self.assertIsNone(frag, "Anti-pattern fragment shared/fasteners-on-their-own-face must not exist")

    def test_recipe_selection_by_template_and_archetype(self):
        crate_asset = {"id": "box_01", "visual_template": "r6_crate", "label": "Freight Box"}
        name, _ = select_asset_recipe(crate_asset)
        self.assertEqual(name, "crate_freight")

        desk_asset = {"id": "quartermaster_desk", "visual_template": "ledger_desk", "label": "Desk"}
        name, _ = select_asset_recipe(desk_asset)
        self.assertEqual(name, "station_desk")

        coffin_asset = {"id": "cryo_01", "visual_template": "glass_coffin", "label": "Stasis Coffin"}
        name, _ = select_asset_recipe(coffin_asset)
        self.assertEqual(name, "containment_relic")

        atlas_asset = {"id": "atlas_01", "visual_template": "living_atlas", "label": "Living Atlas"}
        name, _ = select_asset_recipe(atlas_asset)
        self.assertEqual(name, "monumental_document")

    def test_admission_control_quarantines_inadmissible_fragments(self):
        recipe = ASSET_RECIPES["crate_freight"]

        diff, _, quar = resolve_asset_fragments("customs-house/r6-ship", recipe)
        self.assertEqual(len(diff), 1)
        self.assertEqual(diff[0]["id"], "customs-house/r6-ship")
        self.assertEqual(quar, [])

        diff, _, quar = resolve_asset_fragments("wizard-tower/the-grimoire", recipe)
        self.assertEqual(diff, [], "Inadmissible fragment must not be admitted to diffusion details")
        self.assertIn("wizard-tower/the-grimoire", quar, "Inadmissible fragment must be quarantined")

    def test_compile_asset_brief_r6_crate_with_physical_derivations_and_scene_backpressure(self):
        asset = {
            "id": "r6_ship_crate_standard",
            "visual_template": "r6_crate",
            "label": "R6-SHIP Standard Bounding Crate",
            "fragment_id": "customs-house/r6-ship",
            "mass_kg": 42.5,
            "world_x": 46.0,
            "world_y": 56.0,
            "world_z": 6.0,
            "bounds": {"width": 1.2, "depth": 0.8, "height": 0.9},
            "interactive_verbs": ["push", "heft", "weigh_cargo"],
            "obstacle_type": "physics_object",
            "lore_snippet": "Demanded by arithmetic clearance.",
        }
        compiled = compile_asset_brief(asset, scene_id="customs-house")
        self.assertEqual(compiled.asset_id, "r6_ship_crate_standard")
        self.assertEqual(compiled.recipe_archetype, "crate_freight")
        self.assertIn("42.5kg", compiled.physical_specs)
        self.assertIn("1.2m x 0.8m x 0.9m", compiled.physical_specs)

        # Scene zone resolution & substrate backpressure
        self.assertEqual(compiled.zone_context["zone_id"], "clearance-foyer")
        self.assertIn("uneven cobblestone", compiled.zone_context["substrate_material"])
        self.assertIn("grounded upon uneven cobblestone", compiled.rewritten_prompt)

        # Coherent native asset in customs-house has zero conflicts
        self.assertEqual(compiled.coherence_conflicts, [])
        self.assertEqual(compiled.standing_tier, "verified")

        # Admitted fragments must be isolated: only r6-ship and single-face-reading
        self.assertIn("customs-house/r6-ship", compiled.fragments_used)
        self.assertIn("shared/single-face-reading", compiled.fragments_used)
        self.assertNotIn("wizard-tower/the-grimoire", compiled.fragments_used)

        # Seam separation
        self.assertTrue(len(compiled.doctrine_rules) > 0)
        self.assertNotIn("describe the object from one face", compiled.rewritten_prompt)

    def test_compile_heavy_freight_crate_derives_reinforcements(self):
        asset = {
            "id": "heavy_iron_crate",
            "visual_template": "r6_crate",
            "label": "Armored Consignment Crate",
            "fragment_id": "customs-house/r6-ship",
            "mass_kg": 220.0,
            "bounds": {"width": 2.0, "depth": 1.5, "height": 1.5},
            "interactive_verbs": ["push"],
        }
        compiled = compile_asset_brief(asset, scene_id="customs-house")
        self.assertIn("structural heavy cargo chest", compiled.compiled_brief)
        self.assertIn("through-bolted forged plates", compiled.compiled_brief)
        self.assertIn("hoist lifting lugs", compiled.compiled_brief)

    def test_compile_desk_derives_quartermaster_mechanics(self):
        asset = {
            "id": "quartermaster_desk",
            "visual_template": "ledger_desk",
            "label": "Hollis's Quartermaster Ledger Desk",
            "fragment_id": "customs-house/hollis-ledger",
            "mass_kg": 180.0,
            "world_x": 63.0,
            "world_y": 69.0,
            "world_z": 6.6,
            "bounds": {"width": 2.4, "depth": 1.4, "height": 1.1},
            "interactive_verbs": ["inscribe_ledger", "strike_seal"],
        }
        compiled = compile_asset_brief(asset, scene_id="customs-house")
        self.assertEqual(compiled.recipe_archetype, "station_desk")
        self.assertEqual(compiled.zone_context["zone_id"], "quartermaster-office")
        self.assertIn("two-column ledger folio", compiled.compiled_brief)
        self.assertIn("crimson beeswax", compiled.compiled_brief)

    def test_compile_asset_brief_cryo_coffin_in_native_vs_foreign_scene(self):
        coffin = {
            "id": "glass_stasis_coffin",
            "visual_template": "glass_coffin",
            "label": "Stasis Cryo-Casket",
            "fragment_id": "space-vampires/glass-stasis-coffin",
            "mass_kg": 280.0,
            "world_x": 44.0,
            "world_y": 84.0,
            "world_z": 6.0,
            "bounds": {"width": 0.8, "depth": 2.3, "height": 0.9},
            "interactive_verbs": ["inspect_cryo_gauge", "tap_glass", "smash"],
            "obstacle_type": "destructible_physics_object",
        }
        # 1. In native space-vampires scene: no cross-domain conflict
        native_compiled = compile_asset_brief(coffin, scene_id="space-vampires")
        self.assertEqual(native_compiled.coherence_conflicts, [])

        # 2. Placed inside customs-house forfeit-corridor: detects cross-domain coherence conflict!
        foreign_compiled = compile_asset_brief(coffin, scene_id="customs-house")
        self.assertEqual(foreign_compiled.zone_context["zone_id"], "forfeit-corridor")
        self.assertEqual(len(foreign_compiled.coherence_conflicts), 1)
        conflict = foreign_compiled.coherence_conflicts[0]
        self.assertEqual(conflict["kind"], "cross_domain_anomaly")
        self.assertEqual(conflict["resolution_status"], "unresolved")

    def test_cartographers_dynamic_lifecycle_synthesize_edit_warrant_delete_criticism(self):
        """
        End-to-end TDD verification of the Cartographers' Epistemic Lifecycle:
        1. Coherence conflict triggers parsimonious synthesis of a `field_note` fragment (`provisional` standing).
        2. Editing the generated fragment on disk promotes it to `curated`, issues a Canon Warrant,
           and elevates asset standing to `warranted` (0.90).
        3. Deleting the generated fragment from disk is recorded as an authorial `criticized` tombstone
           (negative backpressure), never an error to be reverted or re-synthesized.
        """
        with tempfile.TemporaryDirectory() as tmp:
            tmp_root = Path(tmp)
            tmp_frags = tmp_root / "fragments"
            shutil.copytree(REPO_ROOT / "library" / "fragments", tmp_frags)
            tmp_ledger = tmp_root / "cartographers_ledger.json"

            coffin = {
                "id": "glass_stasis_coffin",
                "visual_template": "glass_coffin",
                "label": "Hexagonal Borosilicate Glass Stasis Coffin",
                "fragment_id": "space-vampires/glass-stasis-coffin",
                "mass_kg": 280.0,
                "world_x": 44.0,
                "world_y": 84.0,
                "world_z": 6.0,
                "bounds": {"width": 0.8, "depth": 2.3, "height": 0.9},
                "interactive_verbs": ["inspect_cryo_gauge", "tap_glass", "smash"],
            }

            # Beat 1: Resolve conflict dynamically -> mints `field_note` on disk
            c1 = compile_asset_brief(
                coffin,
                scene_id="customs-house",
                resolve_conflicts=True,
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            bridging_fid = "cartographers/bridge-glass-stasis-coffin-forfeit-corridor"
            bridging_path = tmp_frags / f"{bridging_fid}.json"
            self.assertTrue(bridging_path.is_file(), "Cartographer must write new bridging fragment to disk")
            self.assertIn(bridging_fid, c1.fragments_used)
            self.assertEqual(c1.standing_tier, "provisional")
            self.assertAlmostEqual(c1.standing_score, 0.40)
            self.assertIsNone(c1.warrant_id)
            self.assertEqual(c1.fragment_maturities[bridging_fid], "field_note")

            # Beat 2: Human developer/player EDITS the fragment on disk -> promotes standing & grants Canon Warrant!
            frag_data = json.loads(bridging_path.read_text(encoding="utf-8"))
            frag_data["detail"] = (
                "twin padlocked customs forfeiture chains and a crimson wax quarantine warrant "
                "anchoring the frosted borosilicate casket to the iron-studded flagstones"
            )
            bridging_path.write_text(json.dumps(frag_data, indent=2) + "\n", encoding="utf-8")

            c2 = compile_asset_brief(
                coffin,
                scene_id="customs-house",
                resolve_conflicts=False,
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            self.assertEqual(c2.standing_tier, "warranted")
            self.assertAlmostEqual(c2.standing_score, 0.90)
            self.assertIsNotNone(c2.warrant_id)
            self.assertTrue(c2.warrant_id.startswith("WARRANT-"))
            self.assertEqual(c2.fragment_maturities[bridging_fid], "curated")
            self.assertIn("twin padlocked customs forfeiture chains", c2.rewritten_prompt)

            # Beat 3: Human developer/player DELETES the LLM-generated fragment from disk ->
            # Recorded as a `criticized` tombstone, NOT recreated even when resolve_conflicts=True!
            bridging_path.unlink()
            self.assertFalse(bridging_path.is_file())

            c3 = compile_asset_brief(
                coffin,
                scene_id="customs-house",
                resolve_conflicts=True,  # Even with resolve_conflicts=True, deletion must be respected!
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            self.assertFalse(
                bridging_path.is_file(),
                "Deleted LLM fragment must NEVER be re-synthesized; deletion is an authorial criticism",
            )
            self.assertEqual(c3.standing_tier, "refined_by_criticism")
            self.assertAlmostEqual(c3.standing_score, 0.55)
            self.assertEqual(len(c3.active_criticisms), 1)
            self.assertIn("Author rejected and deleted fragment", c3.active_criticisms[0])
            self.assertIn("rejected framing", c3.negative_prompt)
            self.assertEqual(c3.coherence_conflicts[0]["resolution_status"], "criticized_by_author")

    def test_parsimony_governor_pending_cap_and_saturation_lock(self):
        """
        Verifies the two parsimony governors:
        1. Single Pending Field Note Cap: While 1 unreviewed `field_note` is pending for an
           archetype, the LLM cannot mint a second fragment for that archetype.
        2. Epistemic Saturation Lock: Once curated/criticized entries push archetype saturation
           above threshold (0.80), the archetype locks (`saturation_locked=True`) and refuses
           further additions.
        """
        with tempfile.TemporaryDirectory() as tmp:
            tmp_root = Path(tmp)
            tmp_frags = tmp_root / "fragments"
            shutil.copytree(REPO_ROOT / "library" / "fragments", tmp_frags)
            tmp_ledger = tmp_root / "cartographers_ledger.json"

            coffin_a = {
                "id": "stasis_coffin_alpha",
                "visual_template": "glass_coffin",
                "label": "Alpha Stasis Casket",
                "fragment_id": "space-vampires/glass-stasis-coffin",
                "mass_kg": 280.0,
                "world_x": 44.0,
                "world_y": 84.0,
                "world_z": 6.0,
            }
            coffin_b = {
                "id": "stasis_coffin_beta",
                "visual_template": "glass_coffin",
                "label": "Beta Stasis Casket",
                "fragment_id": "space-vampires/glass-stasis-coffin",
                "mass_kg": 280.0,
                "world_x": 48.0,
                "world_y": 63.0,
                "world_z": 6.0,
            }

            # 1. Mint first field_note on coffin_a -> succeeds
            res_a = compile_asset_brief(
                coffin_a,
                scene_id="customs-house",
                resolve_conflicts=True,
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            fid_a = "cartographers/bridge-stasis-coffin-alpha-forfeit-corridor"
            self.assertIn(fid_a, res_a.fragments_used)

            # 2. Attempt to mint a second field_note on coffin_b (same archetype `containment_relic`)
            # while coffin_a's field_note is still unreviewed -> blocked by `pending_field_note_cap`!
            res_b = compile_asset_brief(
                coffin_b,
                scene_id="customs-house",
                resolve_conflicts=True,
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            fid_b = "cartographers/bridge-stasis-coffin-beta-inspection-hall"
            self.assertNotIn(fid_b, res_b.fragments_used)
            self.assertFalse((tmp_frags / f"{fid_b}.json").is_file())
            self.assertEqual(res_b.coherence_conflicts[0]["parsimony_gate"], "pending_field_note_cap")

            # 3. Now curate coffin_a's fragment on disk -> unlocks pending cap AND increases saturation!
            fpath_a = tmp_frags / f"{fid_a}.json"
            data_a = json.loads(fpath_a.read_text(encoding="utf-8"))
            data_a["detail"] = "curated iron quarantine shackle bolted to the flagstone floor"
            fpath_a.write_text(json.dumps(data_a, indent=2) + "\n", encoding="utf-8")

            # With 3 canon fragments (3 * 0.20 = 0.60) + 1 curated fragment (0.45) = 1.05 >= 0.80 threshold,
            # the `containment_relic` archetype is now SATURATION LOCKED!
            res_b_after = compile_asset_brief(
                coffin_b,
                scene_id="customs-house",
                resolve_conflicts=True,
                fragments_dir=tmp_frags,
                ledger_path=tmp_ledger,
            )
            self.assertTrue(res_b_after.saturation_locked)
            self.assertGreaterEqual(res_b_after.saturation_score, 0.80)
            self.assertEqual(res_b_after.coherence_conflicts[0]["parsimony_gate"], "saturation_locked")
            self.assertFalse(
                (tmp_frags / f"{fid_b}.json").is_file(),
                "Saturated archetype must refuse further LLM fragment additions",
            )

    def test_asset_forge_lattice_workflow_validity(self):
        wf_path = REPO_ROOT / "workflows" / "asset-forge.lattice.json"
        self.assertTrue(wf_path.exists(), "workflows/asset-forge.lattice.json must exist")
        data = json.loads(wf_path.read_text(encoding="utf-8"))
        self.assertEqual(data.get("kind"), "lattice-workflow")
        self.assertEqual(data.get("schema"), 2)

        graph = data.get("graph", {})
        self.assertEqual(graph.get("id"), "asset-forge")
        nodes = graph.get("nodes", {})
        self.assertIn("select-asset", nodes)
        self.assertIn("read-world-fragments", nodes)
        self.assertIn("cartographer-coherence-gate", nodes)
        self.assertIn("compile-world-brief", nodes)
        self.assertIn("rewrite-prompt", nodes)
        self.assertIn("format-flux3-conditioning", nodes)
        self.assertIn("forge-dispatch", nodes)

        roles = graph.get("roles", {})
        self.assertIn("rewriter", roles)
        self.assertIn("cartographer", roles)

        wires = graph.get("wires", {})
        self.assertTrue(len(wires) >= 5, "Workflow must wire all pipeline stages together")


if __name__ == "__main__":
    unittest.main()
