#!/usr/bin/env python3
"""
companion/test_terrain.py

Automated unit tests for 2.5D Terrain Mesh, Slope & Overhang Analysis,
Binary STL Exporter, and Directional / Probe Shadow Caster.
Offline, stdlib only.
"""

from __future__ import annotations

import json
import math
import struct
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.terrain_lighting import TerrainLighting
from companion.terrain_mesh import (
    OVERHANG_ANCIENT_DEG,
    SLOPE_SCRAMBLE_MAX_DEG,
    SLOPE_WALKABLE_MAX_DEG,
    TAG_ANCIENT_RUIN,
    TAG_BUILD_PLATE,
    TAG_CANYON_GORGE,
    TAG_ROAD_PASS,
    TerrainMesh,
)


class TestTerrainMesh(unittest.TestCase):
    def setUp(self):
        self.tm = TerrainMesh(40.0, 40.0, grid_step_m=1.0, base_elevation_m=0.0, name="Test-Mesh")

    def test_grid_dimensions_and_sampling(self):
        self.assertEqual(self.tm.cols, 41)
        self.assertEqual(self.tm.rows, 41)

        # Coordinate round trip
        c, r = self.tm.world_to_grid(10.0, 25.0)
        wx, wy = self.tm.grid_to_world(c, r)
        self.assertAlmostEqual(wx, 10.0)
        self.assertAlmostEqual(wy, 25.0)

        # Flat elevation sample
        elev = self.tm.sample_elevation(10.5, 25.5)
        self.assertAlmostEqual(elev, 0.0)

    def test_flat_build_plate(self):
        # Place flat 10x10 build plate at (20, 20) with elevation 8.0m
        self.tm.add_flat_build_plate(20.0, 20.0, width=10.0, length=10.0, elevation=8.0, blend_margin=2.0)
        # Center should be exactly 8.0m
        self.assertAlmostEqual(self.tm.sample_elevation(20.0, 20.0), 8.0)
        self.assertAlmostEqual(self.tm.sample_elevation(17.0, 23.0), 8.0)

        # Far outside should still be 0.0m
        self.assertAlmostEqual(self.tm.sample_elevation(2.0, 2.0), 0.0)

    def test_slope_and_traversability(self):
        # Stamping a hill creates sloped terrain
        self.tm.add_hill(center_x=20.0, center_y=20.0, height=12.0, radius=10.0)
        stats = self.tm.analyze_traversability()

        self.assertGreater(stats["elevation_max_m"], 11.5)
        self.assertGreater(stats["walkable_pct"], 0.0)
        self.assertGreater(stats["scramble_pct"] + stats["cliff_pct"], 0.0)

    def test_ancient_overhang_compliance(self):
        # Build ancient ruin buttress adhering to 45° overhang constraint
        self.tm.add_ancient_overhang_ruin(
            center_x=20.0, center_y=20.0, base_width=16.0, base_length=16.0, top_elevation=6.0, overhang_angle_deg=45.0
        )
        stats = self.tm.analyze_traversability()
        # Should be compliant with the ancient overhang rule
        self.assertGreaterEqual(stats["ancient_ruin_compliance_pct"], 90.0)

    def test_canyon_gorge_primitive(self):
        # Create an elevated plateau first (elevation 8.0m)
        self.tm.add_flat_build_plate(20.0, 20.0, width=30.0, length=30.0, elevation=8.0, blend_margin=1.0)
        # Carve a canyon gorge through it down to 2.0m
        self.tm.add_canyon_gorge(
            start_x=5.0,
            start_y=20.0,
            end_x=35.0,
            end_y=20.0,
            bed_elevation=2.0,
            bed_width=4.0,
            wall_slope_width=4.0,
        )
        # Check center of gorge bed
        elev_bed = self.tm.sample_elevation(20.0, 20.0)
        self.assertAlmostEqual(elev_bed, 2.0, places=1)
        # Tag bit 8 should be present
        c, r = self.tm.world_to_grid(20.0, 20.0)
        self.assertTrue(bool(self.tm.tags[r, c] & TAG_CANYON_GORGE))

    def test_slice_strata(self):
        self.tm.add_hill(20.0, 20.0, height=16.0, radius=12.0)
        strata = self.tm.slice_strata(num_strata=4)
        self.assertEqual(len(strata), 4)
        self.assertEqual(strata[0].id, "stratum_0")
        self.assertEqual(strata[3].id, "stratum_3")
        self.assertLess(strata[0].z_min, strata[3].z_max)

    def test_stratum_layer_alpha_clipping(self):
        self.tm.add_hill(20.0, 20.0, height=16.0, radius=12.0)
        # Layer 0 (lowest) should not have pixels at top of the hill (z > 12)
        img_0 = self.tm.render_stratum_layer(0, num_strata=4)
        arr_0 = np.asarray(img_0)
        self.assertEqual(arr_0.shape[2], 4, "Must be RGBA image")

        # Top of the hill is at center (20, 20) -> col=20, row=20
        # In layer 0, the top of the hill should be transparent (alpha == 0)
        self.assertEqual(arr_0[20, 20, 3], 0, "Top of the hill must be transparent in stratum 0")

        # Layer 3 (highest) should have non-zero alpha at the peak
        img_3 = self.tm.render_stratum_layer(3, num_strata=4)
        arr_3 = np.asarray(img_3)
        self.assertGreater(arr_3[20, 20, 3], 200, "Top of the hill must be opaque in stratum 3")
        # And the flat valley (0, 0) must be transparent in stratum 3
        self.assertEqual(arr_3[0, 0, 3], 0, "Valley floor must be transparent in top stratum 3")

    def test_binary_stl_export(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            stl_path = Path(tmp_dir) / "test.stl"
            tri_count = self.tm.export_stl(stl_path, solid_base=True)

            self.assertTrue(stl_path.is_file())
            # Binary STL file size formula: 84 + 50 * num_triangles
            expected_size = 84 + 50 * tri_count
            self.assertEqual(stl_path.stat().st_size, expected_size)

            with open(stl_path, "rb") as f:
                header = f.read(80)
                self.assertTrue(header.startswith(b"SpriteQuest Terrain"))
                count_bytes = f.read(4)
                stored_count = struct.unpack("<I", count_bytes)[0]
                self.assertEqual(stored_count, tri_count)

    def test_render_z_depth_map(self):
        self.tm.add_hill(20.0, 20.0, height=16.0, radius=12.0)
        depth_img = self.tm.render_z_depth_map(width=256, height=256, invert=False)
        self.assertEqual(depth_img.size, (256, 256))
        self.assertEqual(depth_img.mode, "L")

        arr = np.asarray(depth_img)
        # Peak at center (20m, 20m) should be bright white (close to 255)
        # Valley at corners should be dark (0)
        center_val = int(arr[128, 128])
        corner_val = int(arr[0, 0])
        self.assertGreater(center_val, 200)
        self.assertEqual(corner_val, 0)

        # Inverted depth map
        inv_depth = self.tm.render_z_depth_map(width=256, height=256, invert=True)
        inv_arr = np.asarray(inv_depth)
        self.assertLess(int(inv_arr[128, 128]), 50)
        self.assertEqual(int(inv_arr[0, 0]), 255)

    def test_render_stratum_layer_with_base_art(self):
        self.tm.add_hill(20.0, 20.0, height=16.0, radius=12.0)
        # Create solid red base art
        base_art = Image.new("RGB", (256, 256), (255, 0, 0))

        # Stratum 3 (peak)
        stratum_3 = self.tm.render_stratum_layer(3, num_strata=4, base_art=base_art)
        self.assertEqual(stratum_3.size, (256, 256))
        self.assertEqual(stratum_3.mode, "RGBA")
        arr = np.asarray(stratum_3)
        # Red channel should be 255
        self.assertEqual(arr[128, 128, 0], 255)
        # Alpha at peak should be opaque
        self.assertGreater(arr[128, 128, 3], 200)
        # Alpha at corner should be 0
        self.assertEqual(arr[0, 0, 3], 0)


class TestTerrainLighting(unittest.TestCase):
    def setUp(self):
        self.tm = TerrainMesh(30.0, 30.0, grid_step_m=1.0, base_elevation_m=0.0)
        # Create a ridge wall in the center at x = 15m, elevation 10m
        for r in range(self.tm.rows):
            self.tm.heights[r, 14:17] = 10.0
        self.tl = TerrainLighting(self.tm)

    def test_directional_shadow(self):
        # Light from West (Azimuth 270 deg)
        # East side of the 10m ridge (x > 17) should be in shadow
        shadows = self.tl.compute_directional_shadows(light_azimuth_deg=270.0, light_elevation_deg=30.0)
        self.assertEqual(shadows.shape, (self.tm.rows, self.tm.cols))

        # West side (facing light) should be lit
        self.assertGreater(float(shadows[15, 8]), 0.8)
        # East side (immediately behind ridge) should be in shadow
        self.assertLess(float(shadows[15, 18]), 0.5)

    def test_player_los_blocked_by_ridge(self):
        # Player at x = 5m, eye_z = 1.7m
        los = self.tl.compute_player_los(player_x_m=5.0, player_y_m=15.0, view_radius_m=20.0)

        # West of ridge is visible
        self.assertGreater(float(los[15, 8]), 0.5)
        # East of 10m ridge is occluded (0.0)
        self.assertEqual(float(los[15, 22]), 0.0)

    def test_cursor_depth_probe(self):
        probe = self.tl.compute_cursor_depth_probe(cursor_x_m=5.0, cursor_y_m=15.0, probe_radius_m=10.0)
        # Center of probe is bright
        self.assertAlmostEqual(float(probe[15, 5]), 1.0, places=1)
        # Beyond radius is zero
        self.assertAlmostEqual(float(probe[15, 25]), 0.0)


if __name__ == "__main__":
    unittest.main()
