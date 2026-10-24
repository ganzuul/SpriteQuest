#!/usr/bin/env python3
"""
companion/test_fragment_compiler.py

Unit tests for the Fragment Compiler, Prompt Rewriter, and Lattice workflow integration.
"""

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.fragment_compiler import (
    compile_asset_brief,
    load_fragment,
    resolve_asset_fragments,
    rewrite_prompt,
)


class TestFragmentCompiler(unittest.TestCase):
    def test_load_existing_fragment(self):
        frag = load_fragment("customs-house/r6-ship")
        self.assertIsNotNone(frag)
        self.assertEqual(frag.get("id"), "customs-house/r6-ship")
        self.assertIn("R6 SHIP", frag.get("detail", ""))

    def test_resolve_asset_fragments_includes_doctrine_and_scene(self):
        fragments = resolve_asset_fragments("customs-house/r6-ship", scene_id="customs-house")
        frag_ids = [f.get("id") for f in fragments]
        self.assertIn("customs-house/r6-ship", frag_ids)
        self.assertIn("customs-house/the-site", frag_ids)
        self.assertIn("shared/fasteners-on-their-own-face", frag_ids)
        self.assertIn("shared/single-face-reading", frag_ids)

    def test_compile_asset_brief_r6_crate(self):
        asset = {
            "id": "r6_ship_crate_standard",
            "label": "R6-SHIP Standard Bounding Crate",
            "fragment_id": "customs-house/r6-ship",
            "mass_kg": 42.5,
            "bounds": {"w": 1.2, "d": 0.8, "h": 0.9},
            "obstacle_type": "physics_object",
            "lore_snippet": "Demanded by arithmetic clearance.",
        }
        compiled = compile_asset_brief(asset, scene_id="customs-house")
        self.assertEqual(compiled.asset_id, "r6_ship_crate_standard")
        self.assertIn("42.5kg", compiled.physical_specs)
        self.assertIn("1.2m x 0.8m x 0.9m", compiled.physical_specs)
        self.assertIn("Baltic pine", compiled.compiled_brief)
        self.assertIn("customs-house/r6-ship", compiled.fragments_used)

        # Prompt must be rich and non-bland
        prompt = compiled.rewritten_prompt
        self.assertIn("orthographic top-down", prompt)
        self.assertIn("R6-SHIP", prompt)
        self.assertIn("slotted screws", prompt)
        self.assertIn("isolated on neutral solid grey background", prompt)
        self.assertIn("Flux 3 Klein", prompt)

    def test_compile_asset_brief_cryo_coffin(self):
        asset = {
            "id": "glass_stasis_coffin",
            "label": "Stasis Cryo-Casket",
            "fragment_id": "space-vampires/glass-stasis-coffin",
            "mass_kg": 240.0,
            "bounds": {"w": 2.2, "d": 1.0, "h": 0.8},
            "obstacle_type": "solid_furniture",
        }
        compiled = compile_asset_brief(asset, scene_id="space-vampires")
        self.assertIn("240.0kg", compiled.physical_specs)
        self.assertIn("hexagonal cryogenic stasis casket", compiled.rewritten_prompt)
        self.assertIn("bismuth-alloy", compiled.rewritten_prompt)
        self.assertIn("cyan runic coolant", compiled.rewritten_prompt)

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
