#!/usr/bin/env python3
"""
companion/test_ortho_floorplan.py

Unit tests for top-down orthographic 3D asset rendering, room-scale 2D map
composition, image diffusion layout prompt formatting, and spatial adherence metrics.
"""

from __future__ import annotations

import json
import math
import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.ortho_floorplan import (
    OrthoCamera,
    build_flux3_layout_prompt,
    compose_room_map,
    evaluate_diffusion_control,
    load_room_scene,
    place_vertices,
    render_asset_topdown,
)


class TestOrthoFloorPlan(unittest.TestCase):
    def test_ortho_camera_roundtrip(self):
        cam = OrthoCamera.fit_room(10.0, 10.0, res=(1024, 1024), margin_m=0.8)
        self.assertAlmostEqual(cam.px_per_m, 1024.0 / 11.6, places=3)

        # Center (0, 0) maps to (512, 512)
        px, py = cam.world_to_pixel(0.0, 0.0)
        self.assertAlmostEqual(px, 512.0, places=4)
        self.assertAlmostEqual(py, 512.0, places=4)

        # Round-trip arbitrary world coordinates
        for wx, wz in [(-3.5, -4.2), (2.75, 1.8), (0.0, 5.0)]:
            sx, sy = cam.world_to_pixel(wx, wz)
            rx, rz = cam.pixel_to_world(sx, sy)
            self.assertAlmostEqual(wx, rx, places=5)
            self.assertAlmostEqual(wz, rz, places=5)

    def test_place_vertices_rules(self):
        # Unit cube [0..2] x [1..3] x [-1..1]
        verts = np.array([
            [0.0, 1.0, -1.0],
            [2.0, 3.0,  1.0],
        ], dtype=np.float64)
        placed = place_vertices(verts, at=(3.0, 0.5, -2.0), yaw_deg=90.0, scale=2.0)
        # Min Y should land exactly on at[1] = 0.5, max Y = 0.5 + 2.0 * 2.0 = 4.5
        self.assertAlmostEqual(float(placed[:, 1].min()), 0.5, places=5)
        self.assertAlmostEqual(float(placed[:, 1].max()), 4.5, places=5)
        # BBox center in X, Z should be (3.0, -2.0)
        cx = 0.5 * (placed[:, 0].min() + placed[:, 0].max())
        cz = 0.5 * (placed[:, 2].min() + placed[:, 2].max())
        self.assertAlmostEqual(float(cx), 3.0, places=5)
        self.assertAlmostEqual(float(cz), -2.0, places=5)

    def test_render_asset_topdown_glb(self):
        sprite = render_asset_topdown(
            "scenes/asset-store/props/common-furniture/common-table/mesh/00002-lowpoly.glb",
            prop_id="table",
            yaw_deg=14.0,
            scale=1.0,
            px_per_m=64.0,
            supersample=1,
        )
        self.assertEqual(sprite.rgba.ndim, 3)
        self.assertEqual(sprite.rgba.shape[2], 4)
        self.assertGreater(float(sprite.alpha_matte.max()), 0.9)
        self.assertGreater(float(sprite.height_map.max()), 0.5)
        self.assertGreater(sprite.size_m[0], 0.5)
        self.assertGreater(sprite.size_m[2], 0.5)

    def test_compose_furniture_room_and_flux3_layout(self):
        scene_path = REPO_ROOT / "library" / "floorplans" / "furniture-room.json"
        scene = load_room_scene(scene_path)
        self.assertEqual(len(scene.props), 16)

        res = compose_room_map(scene, supersample=1)
        self.assertEqual(len(res["props"]), 16)
        self.assertEqual(res["composite_map"].size, (1024, 1024))

        for rec in res["props"]:
            x0, y0, x1, y1 = rec["bbox_norm"]
            self.assertGreaterEqual(x0, 0.0)
            self.assertGreaterEqual(y0, 0.0)
            self.assertLessEqual(x1, 1.0)
            self.assertLessEqual(y1, 1.0)
            self.assertLess(x0, x1)
            self.assertLess(y0, y1)
            self.assertGreater(rec["pixel_area"], 50)

        prompt = build_flux3_layout_prompt("Top-down room floor plan.", res["props"])
        self.assertIn("<obj_1>", prompt)
        self.assertIn("<obj_16>", prompt)
        json_start = prompt.index("[{")
        table = json.loads(prompt[json_start:])
        self.assertEqual(len(table), 16)
        self.assertEqual(table[0]["id"], "obj_1")
        self.assertEqual(len(table[0]["bbox"]), 4)

        # Evaluate ground-truth composite against itself -> high recall
        gt_metrics = evaluate_diffusion_control(res["composite_map"], res)
        self.assertGreater(gt_metrics["mean_footprint_recall"], 0.65)
        self.assertGreaterEqual(gt_metrics["props_detected_pct"], 85.0)

        # Evaluate blank uniform canvas -> zero recall
        blank = Image.new("RGB", (1024, 1024), (230, 222, 208))
        blank_metrics = evaluate_diffusion_control(blank, res)
        self.assertEqual(blank_metrics["mean_footprint_recall"], 0.0)
        self.assertEqual(blank_metrics["props_detected_pct"], 0.0)


if __name__ == "__main__":
    unittest.main()
