#!/usr/bin/env python3
"""
companion/test_scene_placement.py

TDD unit test suite for outdoor scene and prop placement on topological maps:
  1. Coordinate transformation from scene floorplans to world build plates.
  2. Wall occlusion and portal passability for Line-of-Sight.
  3. Zone containment query (determining current player zone in world space).
  4. Outdoor prop placement, elevation snapping, and collision footprints.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.scene_placement import (
    PlacedProp,
    PlacedWall,
    PlacedZone,
    ScenePlacementEngine,
    load_and_place_map_scenes,
)
from companion.terrain_mesh import load_outdoor_map_scene


class TestScenePlacement(unittest.TestCase):
    def setUp(self):
        self.map_json_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        self.tm, self.map_data = load_outdoor_map_scene(self.map_json_path)
        self.engine = ScenePlacementEngine(self.tm, self.map_data)

    def test_build_plate_floorplan_resolution(self):
        """Verify Customs House floorplan is loaded and transformed onto the build plate."""
        self.assertEqual(len(self.engine.build_plates), 1)
        plate = self.engine.build_plates[0]
        self.assertEqual(plate["id"], "plate-customs-house")
        self.assertEqual(plate["anchor"]["center_x"], 55.0)
        self.assertEqual(plate["anchor"]["center_y"], 65.0)
        self.assertEqual(plate["anchor"]["elevation"], 6.0)

        # Verify zones are placed in world coordinates
        zone_ids = [z.id for z in self.engine.zones]
        self.assertIn("clearance-foyer", zone_ids)
        self.assertIn("inspection-hall", zone_ids)
        self.assertIn("quartermaster-office", zone_ids)

    def test_zone_world_bounds_and_elevation(self):
        """
        Verify world coordinates for zones:
          Floorplan center is at [0, 30]. Build plate anchor is at (55, 65) with elevation +6.0m.
          Clearance foyer has local x in [-16, 0], local z in [0, 24].
          World X should be [55 - 16, 55 - 0] = [39.0, 55.0].
          World Y should be [65 + (0 - 30), 65 + (24 - 30)] = [35.0, 59.0].
        """
        foyer = next(z for z in self.engine.zones if z.id == "clearance-foyer")
        self.assertAlmostEqual(foyer.bounds["x_min"], 39.0, places=2)
        self.assertAlmostEqual(foyer.bounds["x_max"], 55.0, places=2)
        self.assertAlmostEqual(foyer.bounds["y_min"], 35.0, places=2)
        self.assertAlmostEqual(foyer.bounds["y_max"], 59.0, places=2)
        self.assertAlmostEqual(foyer.elevation, 6.0, places=2)

        # Quartermaster office has local elevation +0.6m -> world elevation 6.6m
        qm = next(z for z in self.engine.zones if z.id == "quartermaster-office")
        self.assertAlmostEqual(qm.elevation, 6.6, places=2)

    def test_zone_containment_lookup(self):
        """Test resolving zone from world coordinates."""
        # Player at (45.0, 45.0) -> inside clearance foyer
        zone = self.engine.get_zone_at(45.0, 45.0)
        self.assertIsNotNone(zone)
        self.assertEqual(zone.id, "clearance-foyer")

        # Player at (55.0, 70.0) -> inside inspection hall
        zone_hall = self.engine.get_zone_at(55.0, 70.0)
        self.assertIsNotNone(zone_hall)
        self.assertEqual(zone_hall.id, "inspection-hall")

        # Player outside at spawn (35.0, 65.0) -> None or wilderness / approach road
        zone_out = self.engine.get_zone_at(35.0, 65.0)
        self.assertIsNone(zone_out)

    def test_prop_world_placement_and_elevation(self):
        """
        Verify props have correct world coordinates and elevation:
          Hollis's desk is at local [8.0, 0.6, 34.0].
          World X = 55.0 + 8.0 = 63.0.
          World Y = 65.0 + (34.0 - 30.0) = 69.0.
          World Z = 6.0 + 0.6 = 6.6m.
        """
        desk = next(p for p in self.engine.props if p.id == "quartermaster_desk")
        self.assertAlmostEqual(desk.world_x, 63.0, places=2)
        self.assertAlmostEqual(desk.world_y, 69.0, places=2)
        self.assertAlmostEqual(desk.world_z, 6.6, places=2)
        self.assertEqual(desk.label, "Hollis's quartermaster ledger desk")

    def test_wall_occlusion_and_portals(self):
        """
        Verify wall ray-casting occlusion:
          North hall split wall divides inspection hall from forfeit/cleared corridors.
          Local start [-16, 44] -> world [39.0, 79.0].
          Local end [16, 44] -> world [71.0, 79.0].
          A ray from (50, 70) to (50, 85) crosses this wall at y=79.0.
          Without a portal, it is occluded.
          A ray passing through the open portal at gate-cleared-barrier (x=61.0, y=79.0) is clear.
        """
        # Ray crossing solid wall segment at x=52, y from 70 to 85 (midway between the two portals)
        blocked, hit_pos = self.engine.test_wall_sightline(52.0, 70.0, 52.0, 85.0)
        self.assertTrue(blocked, "Ray crossing solid wall should be blocked")
        self.assertIsNotNone(hit_pos)
        self.assertAlmostEqual(hit_pos[1], 79.0, places=1)

        # Ray passing through open gate-cleared-barrier at x=61.0 (local x=6.0, world x=61.0)
        # Gate width is 4.0m (x from 59.0 to 63.0)
        blocked_gate, _ = self.engine.test_wall_sightline(61.0, 70.0, 61.0, 85.0)
        self.assertFalse(blocked_gate, "Ray passing through open portal should be clear")

    def test_outdoor_wilderness_props(self):
        """Verify outdoor props defined in map (or added by scene engine) are resolved."""
        outdoor_props = self.engine.get_outdoor_props()
        self.assertIsInstance(outdoor_props, list)
        self.assertGreaterEqual(len(outdoor_props), 1)

        # Check spawn approach marker / border signpost
        signpost = next((p for p in outdoor_props if "signpost" in p.id or "marker" in p.id), None)
        self.assertIsNotNone(signpost)
        self.assertTrue(signpost.world_x > 0 and signpost.world_y > 0)


if __name__ == "__main__":
    unittest.main()
