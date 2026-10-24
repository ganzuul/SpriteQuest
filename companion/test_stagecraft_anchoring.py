#!/usr/bin/env python3
"""
companion/test_stagecraft_anchoring.py

TDD unit test suite for the Robotics-Grounded Stagecraft & Acting Engine:
  1. Coradeschi & Saffiotti Semantic Anchoring (continuous pose -> symbolic stagecraft predicates).
  2. Hart & Hambuchen NASA Affordance Templates (object-centric workspace & action verb activation).
  3. Standing Gate Verification (Hollis Ledger standing vs. Upstage Authority Marks).
  4. Guy Hoffman Theatrical Joint-Action Framing (deterministic stage direction composition).
  5. Lattice Stagecraft Director Workflow validation.
"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.stagecraft_anchoring import (
    AffordanceTemplate,
    SemanticAnchor,
    StagecraftAnchoringEngine,
    load_stagecraft_engine,
)


class TestStagecraftAnchoring(unittest.TestCase):
    def setUp(self):
        self.map_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        self.engine = load_stagecraft_engine(self.map_path)

    def test_stagecraft_world_projection(self):
        """
        Verify that floorplan stagecraft primitives (proscenium, playing areas, cue marks, sightlines)
        are projected accurately onto the build plate at (55.0, 65.0, +6.0m).
        """
        self.assertIsNotNone(self.engine.proscenium_line)
        # Local start [-16, 0, 16], end [16, 0, 16] with center_xz [0, 30] -> world (39, 51) to (71, 51)
        self.assertAlmostEqual(self.engine.proscenium_line["start"][0], 39.0, places=2)
        self.assertAlmostEqual(self.engine.proscenium_line["start"][1], 51.0, places=2)
        self.assertAlmostEqual(self.engine.proscenium_line["end"][0], 71.0, places=2)
        self.assertAlmostEqual(self.engine.proscenium_line["end"][1], 51.0, places=2)

        # Verify cue marks in world space
        mark_h = next(m for m in self.engine.cue_marks if m["id"] == "mark_hollis")
        self.assertAlmostEqual(mark_h["world_x"], 63.0, places=2)
        self.assertAlmostEqual(mark_h["world_y"], 69.0, places=2)
        self.assertAlmostEqual(mark_h["world_z"], 6.6, places=2)

        mark_s = next(m for m in self.engine.cue_marks if m["id"] == "mark_supplicant")
        self.assertAlmostEqual(mark_s["world_x"], 48.0, places=2)
        self.assertAlmostEqual(mark_s["world_y"], 59.0, places=2)
        self.assertAlmostEqual(mark_s["world_z"], 6.0, places=2)

    def test_semantic_anchor_wilderness_vs_on_stage(self):
        """
        Test Coradeschi & Saffiotti Semantic Anchoring:
          - At spawn (35.0, 65.0), actor is in 'wilderness' outside the proscenium.
          - At (48.0, 59.0), actor has crossed the proscenium onto 'downstage_entrant' and anchored to 'mark_supplicant'.
        """
        anchor_wild = self.engine.anchor_actor(
            actor_id="player", x=35.0, y=65.0, written=False, disposition="unreliable"
        )
        self.assertEqual(anchor_wild.proscenium_state, "wilderness")
        self.assertIsNone(anchor_wild.anchored_cue_mark)
        self.assertEqual(anchor_wild.active_camera_vantage, "macro_exploration")

        anchor_stage = self.engine.anchor_actor(
            actor_id="player", x=48.0, y=59.0, written=False, disposition="unreliable"
        )
        self.assertEqual(anchor_stage.proscenium_state, "on_stage")
        self.assertIsNotNone(anchor_stage.playing_area)
        self.assertEqual(anchor_stage.playing_area["id"], "downstage_entrant")
        self.assertIsNotNone(anchor_stage.anchored_cue_mark)
        self.assertEqual(anchor_stage.anchored_cue_mark["id"], "mark_supplicant")
        self.assertEqual(anchor_stage.anchored_cue_mark["standing_verdict"], "authorized")
        self.assertEqual(anchor_stage.active_camera_vantage, "cam_proscenium_dialogue")

    def test_standing_gate_on_upstage_authority_mark(self):
        """
        Test the 4th-wall standing rule on Cue Marks:
          - Hollis (written=True, disposition='helps') at mark_hollis (63.0, 69.0) is 'authorized'.
          - Pell (written=False, disposition='unreliable') at mark_hollis (63.0, 69.0) triggers 'unwritten_usurpation'.
        """
        hollis_anchor = self.engine.anchor_actor(
            actor_id="npc/hollis", x=63.0, y=69.0, written=True, disposition="helps"
        )
        self.assertIsNotNone(hollis_anchor.anchored_cue_mark)
        self.assertEqual(hollis_anchor.anchored_cue_mark["id"], "mark_hollis")
        self.assertEqual(hollis_anchor.anchored_cue_mark["standing_verdict"], "authorized")

        pell_anchor = self.engine.anchor_actor(
            actor_id="npc/pell-the-underwritten", x=63.0, y=69.0, written=False, disposition="unreliable"
        )
        self.assertIsNotNone(pell_anchor.anchored_cue_mark)
        self.assertEqual(pell_anchor.anchored_cue_mark["id"], "mark_hollis")
        self.assertEqual(pell_anchor.anchored_cue_mark["standing_verdict"], "unwritten_usurpation")

    def test_nasa_affordance_templates_activation(self):
        """
        Test Hart & Hambuchen Affordance Templates:
          - At weigh table / center counter (48.0, 63.0), the weigh scale affordance template activates.
          - At mark_hollis (63.0, 69.0):
            - Written actor unlocks ledger inscription verbs ('inscribe_ledger', 'strike_seal').
            - Unwritten actor is denied ledger inscription verbs due to standing requirement.
        """
        # Supplicant near weigh table (48.0, 63.0)
        at_counter = self.engine.evaluate_affordances(
            x=48.0, y=63.0, written=False, disposition="unreliable"
        )
        active_ids = [a["id"] for a in at_counter if a["status"] == "available"]
        self.assertIn("at-weigh-scale", active_ids)

        # Written Hollis at desk (63.0, 69.0)
        at_desk_written = self.engine.evaluate_affordances(
            x=63.0, y=69.0, written=True, disposition="helps"
        )
        desk_written = next(a for a in at_desk_written if a["id"] == "at-quartermaster-desk")
        self.assertEqual(desk_written["status"], "available")
        verbs = [v["verb"] for v in desk_written["verbs"]]
        self.assertIn("inscribe_ledger", verbs)

        # Unwritten Pell at desk (63.0, 69.0) -> blocked by standing gate!
        at_desk_unwritten = self.engine.evaluate_affordances(
            x=63.0, y=69.0, written=False, disposition="unreliable"
        )
        desk_unwritten = next(a for a in at_desk_unwritten if a["id"] == "at-quartermaster-desk")
        self.assertEqual(desk_unwritten["status"], "standing_refused")

    def test_prop_standing_gate_on_monumental_living_atlas(self):
        """
        Verify that Monumental Living Atlas requires warranted prop standing:
          - If prop standing is provisional or unwritten -> prop_standing_refused.
          - If prop standing is warranted -> available.
        """
        # Unwarranted / provisional atlas
        at_atlas_unwarranted = self.engine.evaluate_affordances(
            x=66.0, y=64.0, written=True, disposition="helps",
            prop_standings={"monumental_living_atlas": "provisional"}
        )
        atlas_unwarranted = next(a for a in at_atlas_unwarranted if a["id"] == "at-living-atlas")
        self.assertEqual(atlas_unwarranted["status"], "prop_standing_refused")
        self.assertIn("Requires prop standing 'warranted'", atlas_unwarranted["reason"])

        # Warranted atlas
        at_atlas_warranted = self.engine.evaluate_affordances(
            x=66.0, y=64.0, written=True, disposition="helps",
            prop_standings={"monumental_living_atlas": "warranted"}
        )
        atlas_warranted = next(a for a in at_atlas_warranted if a["id"] == "at-living-atlas")
        self.assertEqual(atlas_warranted["status"], "available")
        verbs = [v["verb"] for v in atlas_warranted["verbs"]]
        self.assertIn("inspect_cartography", verbs)
        self.assertIn("verify_warrant", verbs)

    def test_hoffman_theatrical_stage_direction_composition(self):
        """
        Verify that the Blackboard snapshot produces a deterministic, injectable
        [STAGE DIRECTION] block combining spatial anchor, co-actor blocking, and affordances.
        """
        blackboard = self.engine.build_blackboard(
            actor_id="player",
            x=48.0,
            y=59.0,
            written=False,
            disposition="unreliable",
        )
        self.assertIn("anchor", blackboard)
        self.assertIn("affordances", blackboard)
        self.assertIn("stage_direction", blackboard)

        direction = blackboard["stage_direction"]
        self.assertIn("[STAGE DIRECTION", direction)
        self.assertIn("Downstage Left", direction)
        self.assertIn("Mark S", direction)
        self.assertIn("Hollis", direction)

    def test_lattice_stagecraft_director_workflow(self):
        """
        Verify that workflows/stagecraft-director.lattice.json cleanly separates the
        Robotics Stagecraft Layer (Semantic Anchoring & Affordances) from the Theatrical
        Acting Layer (Hollis Ledger Standing) and wires both into Generate Reply.
        """
        wf_path = REPO_ROOT / "workflows" / "stagecraft-director.lattice.json"
        self.assertTrue(wf_path.exists(), "stagecraft-director.lattice.json must exist")
        wf = json.loads(wf_path.read_text(encoding="utf-8"))
        self.assertEqual(wf.get("kind"), "lattice-workflow")
        graph = wf.get("graph", {})
        self.assertEqual(graph.get("mode"), "native-unified")

        nodes = graph.get("nodes", {})
        groups = graph.get("groups", {})
        wires = graph.get("wires", {})

        # Verify distinct stagecraft and acting groups
        self.assertIn("stagecraft-anchoring-layer", groups)
        self.assertIn("acting-standing-layer", groups)
        self.assertIn("processing-records", groups)

        # Verify stagecraft blackboard read -> decode -> compose pipeline
        self.assertEqual(nodes["read-stagecraft"]["targetId"], "stagecraft-blackboard")
        self.assertEqual(nodes["journal"]["targetId"], "character-standing")
        self.assertEqual(nodes["compose-stage-blocking"]["outputKind"], "guidance")
        self.assertEqual(nodes["compose-guidance"]["outputKind"], "guidance")

        # Verify both guidance wires feed into generate-reply
        guidance_sources = [
            w["from"]
            for w in wires.values()
            if w["to"] == "generate" and w["toPort"] == "guidance"
        ]
        self.assertIn("compose-stage-blocking", guidance_sources)
        self.assertIn("compose-guidance", guidance_sources)


if __name__ == "__main__":
    unittest.main()
