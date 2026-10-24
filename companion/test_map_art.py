#!/usr/bin/env python3
"""
companion/test_map_art.py

Unit tests for Z-depth map extraction, stylized cartography rendering,
and ComfyUI map art workflow generation.
Offline, stdlib + numpy + Pillow only.
"""

from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.render_map_art import (
    DEFAULT_MAP_PROMPT,
    build_map_art_workflow,
    render_map_bundle_art,
    render_stylized_cartography,
)
from companion.terrain_mesh import TerrainMesh, load_outdoor_map_scene, rasterize_stl_depth


class TestMapArtPipeline(unittest.TestCase):
    def setUp(self):
        self.map_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        self.tm, self.map_data = load_outdoor_map_scene(self.map_path)

    def test_render_stylized_cartography(self):
        art = render_stylized_cartography(self.tm, width=512, height=512)
        self.assertEqual(art.size, (512, 512))
        self.assertEqual(art.mode, "RGB")

        arr = np.asarray(art)
        # Verify warm parchment color palette (R > B, G > B on average)
        mean_r = arr[:, :, 0].mean()
        mean_g = arr[:, :, 1].mean()
        mean_b = arr[:, :, 2].mean()
        self.assertGreater(mean_r, mean_b)
        self.assertGreater(mean_g, mean_b)
        # High dynamic range across canvas
        self.assertGreater(arr.max(), 200)
        self.assertLess(arr.min(), 50)

    def test_render_stylized_cartography_with_map_data(self):
        art = render_stylized_cartography(self.tm, width=512, height=512, map_data=self.map_data)
        self.assertEqual(art.size, (512, 512))
        self.assertEqual(art.mode, "RGB")
        arr = np.asarray(art)
        self.assertGreater(arr.max(), 200)
        self.assertLess(arr.min(), 50)

    def test_build_map_art_workflow(self):
        wf = build_map_art_workflow(
            depth_image_name="test_depth.png",
            prompt_text="Test antique fantasy map",
            width=1024,
            height=1024,
            seed=42,
            steps=8,
        )
        self.assertIn("1", wf)
        self.assertIn("2", wf)
        self.assertIn("3", wf)
        self.assertIn("7", wf)  # KSampler
        self.assertIn("10", wf)  # LoadImage
        self.assertIn("11", wf)  # VAEEncode
        self.assertIn("12", wf)  # ReferenceLatent

        # Verify LoadImage inputs
        self.assertEqual(wf["10"]["inputs"]["image"], "test_depth.png")
        # Verify ReferenceLatent conditioning on positive prompt
        self.assertEqual(wf["12"]["inputs"]["conditioning"], ["4", 0])
        self.assertEqual(wf["12"]["inputs"]["latent"], ["11", 0])

    def test_render_map_bundle_art_offline(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            out_dir = Path(tmp_dir) / "test_map_bundle"
            # Force stylized fallback (offline deterministic)
            res = render_map_bundle_art(
                map_id_or_path=self.map_path,
                out_dir=out_dir,
                force_stylized=True,
            )
            self.assertEqual(res["rendered_via"], "stylized_fallback")
            self.assertTrue(Path(res["depth_path"]).is_file())
            self.assertTrue(Path(res["art_path"]).is_file())
            self.assertTrue(Path(res["relief_path"]).is_file())

            with Image.open(res["depth_path"]) as depth_img:
                self.assertEqual(depth_img.size, (1024, 1024))
                self.assertEqual(depth_img.mode, "L")
            with Image.open(res["art_path"]) as art_img:
                self.assertEqual(art_img.size, (1024, 1024))
                self.assertEqual(art_img.mode, "RGB")


if __name__ == "__main__":
    unittest.main()
