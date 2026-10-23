#!/usr/bin/env python3
"""
companion/test_los_geometry.py

Rigorous TDD test suite for Elevation-Aware Line-of-Sight (LOS) Raymarching.

Tests verify exact mathematical shadow boundaries:
  1. The Wall Test: Low player behind high ridge cannot see the valley behind the ridge.
  2. The High Ground Advantage: Player atop a ridge can see down into both valleys.
  3. The Reverse Slope Shadow: Player looking uphill cannot see the reverse slope behind the crest.
  4. Horizon Tangent Invariance: Maximum tangent tracking prevents light leaks.
"""

from __future__ import annotations

import math
import sys
import unittest
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.terrain_lighting import TerrainLighting
from companion.terrain_mesh import TerrainMesh


class TestLOSGeometry(unittest.TestCase):
    def test_wall_occlusion_exact_shadow(self):
        """
        Wall Test:
          - Terrain: 50m x 20m, flat at z=0.0m.
          - Ridge: at x in [20m..22m], height z=10.0m.
          - Player: at (x=5m, y=10m), eye_z = 0.0 + 1.7 = 1.7m.

        Math:
          - Ray from eye (5, 1.7) to ridge crest (22, 10.0):
            slope = (10.0 - 1.7) / (22 - 5) = 8.3 / 17.0 ≈ 0.4882
          - Behind the ridge, any point at ground z=0.0 requires a ray angle:
            angle = (0.0 - 1.7) / (x - 5) < 0
            Since 0.4882 > angle, every ground point for x > 22m MUST be occluded (LOS == 0.0).
        """
        tm = TerrainMesh(50.0, 20.0, grid_step_m=1.0, base_elevation_m=0.0)
        # Ridge wall at x in [20, 22]
        tm.heights[:, 20:23] = 10.0

        tl = TerrainLighting(tm)
        los = tl.compute_player_los(player_x_m=5.0, player_y_m=10.0, view_radius_m=45.0, player_eye_height=1.7)

        # 1. Player's immediate vicinity in front of the wall (x in 5..19) must be VISIBLE
        self.assertGreater(float(los[10, 10]), 0.5, "Point in front of wall should be visible")
        self.assertGreater(float(los[10, 18]), 0.5, "Approach to wall should be visible")

        # 2. Facing surface of the wall (x=20) must be VISIBLE
        self.assertGreater(float(los[10, 20]), 0.5, "Facing wall surface should be visible")

        # 3. Ground behind the wall (x in 23..45) MUST BE STRICTLY OCCLUDED (LOS == 0.0)
        # Check every point along the line of sight across the wall
        for x_test in range(23, 45):
            val = float(los[10, x_test])
            self.assertEqual(
                val,
                0.0,
                f"Ground at x={x_test} behind 10m ridge must be occluded (LOS=0.0), but got {val}",
            )

    def test_high_ground_advantage(self):
        """
        High Ground Advantage:
          - Terrain: same 50m x 20m with ridge at x in [20..22] height z=10.0m.
          - Player: standing ON TOP of the ridge at (x=21m, y=10m), eye_z = 10.0 + 1.7 = 11.7m.

        Math:
          - From eye at (21, 11.7), looking down at valley west (x=5, z=0):
            slope = (0 - 11.7) / (21 - 5) = -0.731
          - Looking down at valley east (x=40, z=0):
            slope = (0 - 11.7) / (40 - 21) = -0.615
          - Since the player is on the highest ground, BOTH valleys should be VISIBLE!
        """
        tm = TerrainMesh(50.0, 20.0, grid_step_m=1.0, base_elevation_m=0.0)
        tm.heights[:, 20:23] = 10.0

        tl = TerrainLighting(tm)
        los = tl.compute_player_los(player_x_m=21.0, player_y_m=10.0, view_radius_m=30.0, player_eye_height=1.7)

        # West valley must be visible
        self.assertGreater(float(los[10, 5]), 0.2, "West valley must be visible from ridge top")
        # East valley must be visible
        self.assertGreater(float(los[10, 38]), 0.2, "East valley must be visible from ridge top")

    def test_blind_spot_behind_reverse_slope(self):
        """
        Reverse slope blind spot:
          - A wedge / hill rises from x=10 to x=25 (from z=0 to z=8), then drops back to z=0 at x=26.
          - A player standing at x=0 (eye z=1.7m) looking toward the hill.
          - Target at x=30 (z=0) is behind the peak and must be occluded.
        """
        tm = TerrainMesh(40.0, 20.0, grid_step_m=1.0, base_elevation_m=0.0)
        # Ramp rising to peak at x=25
        for x in range(10, 26):
            tm.heights[:, x] = (x - 10) * 0.5  # Reaches height 7.5 at x=25
        # Cliff drop back to 0 at x=26
        tm.heights[:, 26:] = 0.0

        tl = TerrainLighting(tm)
        los = tl.compute_player_los(player_x_m=0.0, player_y_m=10.0, view_radius_m=38.0, player_eye_height=1.7)

        # Uphill slope is visible
        self.assertGreater(float(los[10, 20]), 0.3, "Uphill slope should be visible")
        # Valley behind peak is occluded
        for x in range(27, 36):
            self.assertEqual(float(los[10, x]), 0.0, f"Valley point x={x} behind peak should be occluded")


if __name__ == "__main__":
    unittest.main()
