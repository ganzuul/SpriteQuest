#!/usr/bin/env python3
"""
companion/test_fragment_compiler.py

Unit tests for the SpriteQuest Fragment Compiler, Recipe Admission Gates,
Deterministic Physicality Derivations, and Lattice Workflow Integration.
"""

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.fragment_compiler import (
    ASSET_RECIPES,
    compile_asset_brief,
    load_fragment,
    resolve_asset_fragments,
    rewrite_prompt,
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
        # The user deleted fasteners-on-their-own-face as an anti-pattern.
        # It must no longer exist as a loose grab-bag fragment.
        frag = load_fragment("shared/fasteners-on-their-own-face")
        self.assertIsNone(frag, "Anti-pattern fragment shared/fasteners-on-their-own-face must not exist")

    def test_recipe_selection_by_template_and_archetype(self):
        crate_asset = {"id": "box_01", "visual_template": "r6_crate", "label": "Freight Box"}
        name, recipe = select_asset_recipe(crate_asset)
        self.assertEqual(name, "crate_freight")

        desk_asset = {"id": "quartermaster_desk", "visual_template": "ledger_desk", "label": "Desk"}
        name, recipe = select_asset_recipe(desk_asset)
        self.assertEqual(name, "station_desk")

        coffin_asset = {"id": "cryo_01", "visual_template": "glass_coffin", "label": "Stasis Coffin"}
        name, recipe = select_asset_recipe(coffin_asset)
        self.assertEqual(name, "containment_relic")

        atlas_asset = {"id": "atlas_01", "visual_template": "living_atlas", "label": "Living Atlas"}
        name, recipe = select_asset_recipe(atlas_asset)
        self.assertEqual(name, "monumental_document")

    def test_admission_control_quarantines_inadmissible_fragments(self):
        recipe = ASSET_RECIPES["crate_freight"]

        # 1. Admissible fragment
        diff, doct, quar = resolve_asset_fragments("customs-house/r6-ship", recipe)
        self.assertEqual(len(diff), 1)
        self.assertEqual(diff[0]["id"], "customs-house/r6-ship")
        self.assertEqual(quar, [])

        # 2. Inadmissible fragment (e.g. grimoire on a shipping crate)
        diff, doct, quar = resolve_asset_fragments("wizard-tower/the-grimoire", recipe)
        self.assertEqual(diff, [], "Inadmissible fragment must not be admitted to diffusion details")
        self.assertIn("wizard-tower/the-grimoire", quar, "Inadmissible fragment must be quarantined")

    def test_compile_asset_brief_r6_crate_with_physical_derivations(self):
        asset = {
            "id": "r6_ship_crate_standard",
            "visual_template": "r6_crate",
            "label": "R6-SHIP Standard Bounding Crate",
            "fragment_id": "customs-house/r6-ship",
            "mass_kg": 42.5,
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

        # Derived physical facts based on mass < 50kg and verbs
        self.assertIn("man-portable Baltic pine shipping container", compiled.compiled_brief)
        self.assertIn("recessed hemp rope grab handles", compiled.compiled_brief)
        self.assertIn("slotted steel screws", compiled.compiled_brief)
        self.assertIn("weigh scale pans", compiled.compiled_brief)

        # Admitted fragments must be isolated: only r6-ship and single-face-reading
        self.assertIn("customs-house/r6-ship", compiled.fragments_used)
        self.assertIn("shared/single-face-reading", compiled.fragments_used)
        self.assertNotIn("wizard-tower/the-grimoire", compiled.fragments_used)
        self.assertNotIn("space-vampires/glass-stasis-coffin", compiled.fragments_used)

        # Seam separation: doctrine rule must be in doctrine_rules, not raw token in rewritten_prompt
        self.assertTrue(len(compiled.doctrine_rules) > 0)
        self.assertNotIn("describe the object from one face", compiled.rewritten_prompt)

        # Prompt must be rich, tactile, and conditioned for Flux 3 Klein
        prompt = compiled.rewritten_prompt
        self.assertIn("orthographic top-down 2.5D isometric game asset cutout", prompt)
        self.assertIn("R6-SHIP Standard Bounding Crate", prompt)
        self.assertIn("recessed hemp rope grab handles", prompt)
        self.assertIn("Baltic pine slats", prompt)
        self.assertIn("isolated on neutral solid grey background", prompt)
        self.assertIn("Black Forest Labs Flux 3 Klein render", prompt)

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
            "bounds": {"width": 2.4, "depth": 1.4, "height": 1.1},
            "interactive_verbs": ["inscribe_ledger", "strike_seal"],
        }
        compiled = compile_asset_brief(asset, scene_id="customs-house")
        self.assertEqual(compiled.recipe_archetype, "station_desk")
        self.assertIn("two-column ledger folio", compiled.compiled_brief)
        self.assertIn("crimson beeswax", compiled.compiled_brief)
        self.assertIn("Hollis's Quartermaster Ledger Desk", compiled.rewritten_prompt)

    def test_compile_asset_brief_cryo_coffin(self):
        asset = {
            "id": "glass_stasis_coffin",
            "visual_template": "glass_coffin",
            "label": "Stasis Cryo-Casket",
            "fragment_id": "space-vampires/glass-stasis-coffin",
            "mass_kg": 280.0,
            "bounds": {"width": 0.8, "depth": 2.3, "height": 0.9},
            "interactive_verbs": ["inspect_cryo_gauge", "tap_glass", "smash"],
            "obstacle_type": "destructible_physics_object",
        }
        compiled = compile_asset_brief(asset, scene_id="space-vampires")
        self.assertEqual(compiled.recipe_archetype, "containment_relic")
        self.assertIn("280.0kg", compiled.physical_specs)
        self.assertIn("hexagonal cryogenic stasis casket", compiled.rewritten_prompt)
        self.assertIn("bismuth-alloy", compiled.rewritten_prompt)
        self.assertIn("cyan runic coolant", compiled.rewritten_prompt)
        self.assertIn("mercury-xenon pressure manometer", compiled.rewritten_prompt)

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
        self.assertIn("compile-world-brief", nodes)
        self.assertIn("rewrite-prompt", nodes)
        self.assertIn("format-flux3-conditioning", nodes)
        self.assertIn("forge-dispatch", nodes)

        wires = graph.get("wires", {})
        self.assertTrue(len(wires) >= 5, "Workflow must wire all pipeline stages together")


if __name__ == "__main__":
    unittest.main()
