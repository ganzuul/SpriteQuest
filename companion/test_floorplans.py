#!/usr/bin/env python3
"""
companion/test_floorplans.py

Automated unit tests for Scene Floor Plans and companion/floorplan.py.
Offline, stdlib only.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.floorplan import (
    compute_path_metrics,
    list_floorplans,
    load_json,
    render_ascii_plan,
    validate_floorplan,
    FLOORPLANS_DIR,
)


class TestFloorPlans(unittest.TestCase):
    def test_registered_floorplans_exist(self):
        """All floor plan files in library/floorplans/ are discovered."""
        plans = list_floorplans()
        plan_ids = [p["id"] for p in plans]
        self.assertIn("wizard-tower/glass-cathedral", plan_ids)
        self.assertIn("customs-house/customs-house", plan_ids)
        self.assertIn("common-quarters/furniture-room", plan_ids)

    def test_furniture_room_schema_and_3d_props(self):
        """Furniture Room 16-asset floor plan is compliant and declares 16 3D GLB props."""
        path = FLOORPLANS_DIR / "furniture-room.json"
        data = load_json(path)
        errors = validate_floorplan(data)
        self.assertEqual(errors, [], f"Validation errors in {path.name}: {errors}")
        self.assertEqual(len(data.get("props", [])), 16)

    def test_glass_cathedral_schema_and_metrics(self):
        """Glass Cathedral floor plan is fully compliant and has valid metrics."""
        path = FLOORPLANS_DIR / "glass-cathedral.json"
        data = load_json(path)
        errors = validate_floorplan(data)
        self.assertEqual(errors, [], f"Validation errors in {path.name}: {errors}")

        # Check scale and bounding box
        bbox = data["scale"]["bounding_box"]
        self.assertEqual(bbox["width"], 120.0)
        self.assertEqual(bbox["length"], 240.0)

        # Check movement metrics
        metrics = compute_path_metrics(data)
        self.assertGreaterEqual(len(metrics), 2)
        proc_way = [m for m in metrics if m["id"] == "processional-way"][0]
        self.assertGreater(proc_way["total_length_m"], 150.0)
        self.assertEqual(proc_way["elevation_delta_m"], 3.0)

        # Check stagecraft components
        stagecraft = data["stagecraft"]
        self.assertIn("proscenium_line", stagecraft)
        self.assertIn("downstage_center", stagecraft["playing_areas"])
        self.assertTrue(len(stagecraft["cue_marks"]) >= 2)
        self.assertTrue(len(stagecraft["sightlines"]) >= 2)

        # Check ASCII render produces output
        ascii_map = render_ascii_plan(data)
        self.assertIn("central-na", ascii_map)
        self.assertIn("★", ascii_map)

    def test_customs_house_schema_and_metrics(self):
        """Customs House floor plan is fully compliant and has valid paths."""
        path = FLOORPLANS_DIR / "customs-house.json"
        data = load_json(path)
        errors = validate_floorplan(data)
        self.assertEqual(errors, [], f"Validation errors in {path.name}: {errors}")

        # Check paths
        metrics = compute_path_metrics(data)
        path_ids = [m["id"] for m in metrics]
        self.assertIn("path-clearance-flow", path_ids)
        self.assertIn("path-forfeit-flow", path_ids)

        clearance = [m for m in metrics if m["id"] == "path-clearance-flow"][0]
        self.assertAlmostEqual(clearance["total_length_m"], 52.32, places=1)

        # Check stagecraft
        cue_marks = {m["id"]: m for m in data["stagecraft"]["cue_marks"]}
        self.assertIn("mark_hollis", cue_marks)
        self.assertIn("mark_supplicant", cue_marks)
        self.assertEqual(cue_marks["mark_hollis"]["y"], 0.6)

    def test_invalid_plan_rejection(self):
        """Corrupted or incomplete floor plan data is rejected with specific errors."""
        bad_plan = {
            "schema_version": 1,
            "id": "broken-plan",
            "refinement_level": "wrong_level",
            "scale": {"bounding_box": {"width": -10, "length": 50, "height": 10}},
            "zones": [],
            "movement_paths": [
                {"id": "broken-path", "waypoints": [{"id": "wp1"}]}
            ]
        }
        errors = validate_floorplan(bad_plan)
        self.assertTrue(any("refinement_level" in e for e in errors))
        self.assertTrue(any("bounding box" in e for e in errors))
        self.assertTrue(any("at least one zone" in e for e in errors))
        self.assertTrue(any("at least 2 waypoints" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
