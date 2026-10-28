#!/usr/bin/env python3
"""
companion/test_map_art.py

Unit tests for Z-depth map extraction, stylized cartography rendering,
and ComfyUI map art workflow generation.
Offline, stdlib + numpy + Pillow only.
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from PIL import Image
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion import comfy_models
from companion.comfy_models import ModelNotInstalled
from companion.render_map_art import (
    DEFAULT_MAP_PROMPT,
    build_map_art_workflow,
    build_map_layout_prompt,
    compile_moss_layout_prompt,
    export_map_layout_workflow,
    render_map_bundle_art,
    render_stylized_cartography,
)
from companion.terrain_mesh import TerrainMesh, load_outdoor_map_scene


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
            unet_name="moss_image_sft_bf16.safetensors",
            clip_name="qwen3.5_9b_bf16.safetensors",
            vae_name="flux2-vae.safetensors",
        )
        self.assertIn("1", wf)
        self.assertIn("2", wf)
        self.assertIn("3", wf)
        self.assertIn("7", wf)  # KSampler
        self.assertIn("10", wf)  # LoadImage
        self.assertIn("11", wf)  # VAEEncode
        self.assertEqual(wf["2"]["inputs"]["device"], "cpu")
        self.assertIn("12", wf)  # ReferenceLatent

        # Verify LoadImage inputs
        self.assertEqual(wf["10"]["inputs"]["image"], "test_depth.png")
        # Verify ReferenceLatent conditioning on positive prompt
        self.assertEqual(wf["12"]["inputs"]["conditioning"], ["4", 0])
        self.assertEqual(wf["12"]["inputs"]["latent"], ["11", 0])

    def test_build_map_layout_prompt_projects_geographic_features(self):
        layout = build_map_layout_prompt(self.map_data, width=1024, height=1024)

        self.assertEqual(layout["bbox_coord_space"], "abs")
        self.assertEqual(layout["bbox_format"], "xyxy")
        self.assertEqual((layout["width"], layout["height"]), (1024, 1024))
        self.assertIn("Border March", layout["summary"]["caption"])
        self.assertGreaterEqual(len(layout["items"]), 8)
        for item in layout["items"]:
            x0, y0, x1, y1 = item["bbox"]
            self.assertGreaterEqual(x0, 0)
            self.assertGreaterEqual(y0, 0)
            self.assertLessEqual(x1, 1024)
            self.assertLessEqual(y1, 1024)
            self.assertLess(x0, x1)
            self.assertLess(y0, y1)

        pass_item = next(item for item in layout["items"] if "east-pass" in item["caption"])
        self.assertGreater(pass_item["bbox"][3] - pass_item["bbox"][1], pass_item["bbox"][2] - pass_item["bbox"][0])

    def test_build_map_layout_prompt_rejects_non_moss_dimensions(self):
        with self.assertRaisesRegex(ValueError, "multiples of 16"):
            build_map_layout_prompt(self.map_data, width=1000, height=1024)

    def test_compile_moss_layout_prompt_converts_xyxy_to_centered_yxyx(self):
        layout = {
            "width": 1024,
            "height": 1024,
            "bbox_coord_space": "abs",
            "bbox_format": "xyxy",
            "summary": {"caption": "A test map."},
            "items": [{"label": "object", "caption": "A pass.", "bbox": [100, 200, 300, 400]}],
        }

        compiled = json.loads(compile_moss_layout_prompt(layout))

        self.assertEqual(compiled["bbox_coord_space"], "abs_centralized")
        self.assertEqual(compiled["bbox_format"], "yxyx")
        self.assertEqual(compiled["items"][0]["bbox"], [-312, -412, -112, -212])
        self.assertNotIn("width", compiled)
        self.assertNotIn("height", compiled)

    def test_compile_moss_layout_prompt_rejects_out_of_canvas_boxes(self):
        layout = {
            "width": 1024,
            "height": 1024,
            "bbox_coord_space": "abs",
            "bbox_format": "xyxy",
            "summary": {"caption": "A test map."},
            "items": [{"label": "object", "caption": "A pass.", "bbox": [-1, 200, 300, 400]}],
        }

        with self.assertRaisesRegex(ValueError, "exceeds"):
            compile_moss_layout_prompt(layout)

    def test_export_map_layout_workflow_includes_editable_layout_and_reference(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            workflow_path = root / "cartography.json"
            comfy_input = root / "input"
            result = export_map_layout_workflow(
                self.map_path,
                workflow_path=workflow_path,
                comfy_input_dir=comfy_input,
                width=512,
                height=512,
                seed=42,
                steps=12,
                denoise=0.65,
                unet_name="moss_image_sft_bf16.safetensors",
                clip_name="qwen3.5_9b_bf16.safetensors",
                vae_name="flux2-vae.safetensors",
            )

            workflow = json.loads(workflow_path.read_text(encoding="utf-8"))
            layout = json.loads(Path(result["layout_path"]).read_text(encoding="utf-8"))
            prompt = json.loads(workflow["4"]["inputs"]["text"])
            self.assertEqual(prompt["bbox_coord_space"], "abs_centralized")
            self.assertEqual(prompt["bbox_format"], "yxyx")
            self.assertEqual(len(prompt["items"]), len(layout["items"]))
            self.assertIn("moss", workflow["1"]["inputs"]["unet_name"].lower())
            self.assertEqual(workflow["2"]["inputs"]["type"], "moss_image")
            self.assertEqual(workflow["2"]["inputs"]["device"], "cpu")
            self.assertEqual(workflow["10"]["inputs"]["image"], result["reference_name"])
            self.assertEqual(workflow["7"]["inputs"]["seed"], 42)
            self.assertEqual(workflow["7"]["inputs"]["steps"], 12)
            self.assertEqual(workflow["7"]["inputs"]["denoise"], 0.65)
            self.assertTrue(Path(result["reference_image"]).is_file())
            with Image.open(result["reference_image"]) as reference:
                self.assertEqual(reference.size, (512, 512))

            layout["summary"]["caption"] = "Edited cartographic style for tuning."
            Path(result["layout_path"]).write_text(json.dumps(layout), encoding="utf-8")
            export_map_layout_workflow(
                self.map_path,
                workflow_path=workflow_path,
                comfy_input_dir=comfy_input,
                width=512,
                height=512,
                seed=43,
                steps=13,
                denoise=0.6,
                unet_name="moss_image_sft_bf16.safetensors",
                clip_name="qwen3.5_9b_bf16.safetensors",
                vae_name="flux2-vae.safetensors",
            )
            updated_workflow = json.loads(workflow_path.read_text(encoding="utf-8"))
            updated_prompt = json.loads(updated_workflow["4"]["inputs"]["text"])
            self.assertEqual(updated_prompt["summary"]["caption"], "Edited cartographic style for tuning.")

    def test_export_map_layout_workflow_defaults_to_memory_safe_canvas(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            result = export_map_layout_workflow(
                self.map_path,
                workflow_path=root / "cartography.json",
                comfy_input_dir=root / "input",
                unet_name="moss_image_sft_int8_convrot.safetensors",
                clip_name="qwen3.5_9b_w4a8_gptq.safetensors",
                vae_name="flux2-vae.safetensors",
            )
            workflow = json.loads(Path(result["workflow_path"]).read_text(encoding="utf-8"))
            layout = json.loads(Path(result["layout_path"]).read_text(encoding="utf-8"))

            self.assertEqual(workflow["6"]["inputs"]["width"], 768)
            self.assertEqual(workflow["6"]["inputs"]["height"], 768)
            self.assertEqual(workflow["2"]["inputs"]["device"], "cpu")
            self.assertEqual((layout["width"], layout["height"]), (768, 768))
            with Image.open(result["reference_image"]) as reference:
                self.assertEqual(reference.size, (768, 768))

    def test_export_map_layout_workflow_rejects_non_moss_override(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            with self.assertRaisesRegex(ValueError, "requires a MOSS"):
                export_map_layout_workflow(
                    self.map_path,
                    workflow_path=root / "cartography.json",
                    comfy_input_dir=root / "input",
                    unet_name="flux3_image_klein.safetensors",
                )

    def test_gguf_text_encoder_uses_gguf_clip_loader(self):
        wf = build_map_art_workflow(
            depth_image_name="test_depth.png",
            unet_name="moss_image_sft_bf16.safetensors",
            clip_name="Qwen3.5-9B-ComfyUI-Q8_0.gguf",
            vae_name="flux2-vae.safetensors",
        )
        clip_node = wf["2"]
        self.assertEqual(clip_node["class_type"], "CLIPLoaderGGUF")
        self.assertEqual(clip_node["inputs"]["clip_name"], "Qwen3.5-9B-ComfyUI-Q8_0.gguf")
        self.assertEqual(clip_node["inputs"]["type"], "moss_image")
        # The GGUF node builds on the offload device itself and exposes no device input.
        self.assertNotIn("device", clip_node["inputs"])

    def test_export_rejects_uninstalled_auto_selection(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            root = Path(tmp_dir)
            empty = root / "models"
            empty.mkdir()
            with mock.patch.object(comfy_models, "COMFY_MODELS", empty):
                with self.assertRaises(ModelNotInstalled):
                    export_map_layout_workflow(
                        self.map_path,
                        workflow_path=root / "cartography.json",
                        comfy_input_dir=root / "input",
                        server="http://127.0.0.1:9",
                    )

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
