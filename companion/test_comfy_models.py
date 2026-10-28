#!/usr/bin/env python3
"""
companion/test_comfy_models.py

Tests for the shared ComfyUI model registry, budget guard, and workflow
validator. Offline and stdlib only.
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion import comfy_models
from companion.comfy_models import (
    BudgetError,
    ModelNotInstalled,
    ROLES,
    installed_names,
    model_path,
    require_budget,
    resolve,
)
from companion.validate_workflows import check_workflow


class TestModelRegistry(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        patcher = mock.patch.object(comfy_models, "COMFY_MODELS", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)
        # Keep the developer's real extra_model_paths.yaml out of the test.
        paths = mock.patch.object(comfy_models, "COMFY_EXTRA_PATHS", self.root / "none.yaml")
        paths.start()
        self.addCleanup(paths.stop)

    def _install(self, folder: str, name: str, payload: bytes = b"x") -> Path:
        path = self.root / folder / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
        return path

    def test_resolve_returns_installed_candidate(self):
        self._install("text_encoders", "qwen3.5_9b_w4a8_gptq.safetensors")
        self.assertEqual(resolve("moss_clip", server=None), "qwen3.5_9b_w4a8_gptq.safetensors")

    def test_resolve_prefers_verified_safetensors_over_gguf(self):
        self._install("text_encoders", "qwen3.5_9b_w4a8_gptq.safetensors")
        self._install("text_encoders", "Qwen3.5-9B-ComfyUI-Q8_0.gguf")
        self.assertEqual(resolve("moss_clip", server=None), "qwen3.5_9b_w4a8_gptq.safetensors")

    def test_gguf_encoder_still_resolvable_when_it_is_the_only_one(self):
        self._install("text_encoders", "Qwen3.5-9B-ComfyUI-Q8_0.gguf")
        self.assertEqual(resolve("moss_clip", server=None), "Qwen3.5-9B-ComfyUI-Q8_0.gguf")

    def test_resolve_raises_instead_of_inventing_a_file(self):
        with self.assertRaises(ModelNotInstalled) as caught:
            resolve("moss_clip", server=None)
        self.assertIn("moss_clip", str(caught.exception))

    def test_resolve_non_strict_returns_top_candidate(self):
        self.assertEqual(
            resolve("moss_clip", server=None, strict=False),
            ROLES["moss_clip"].candidates[0],
        )

    def test_resolve_accepts_comfy_reported_names(self):
        with mock.patch.object(comfy_models, "comfy_model_names", return_value=["moss_image_sft_int8_convrot.safetensors"]):
            self.assertEqual(resolve("moss_unet", server="http://x"), "moss_image_sft_int8_convrot.safetensors")

    def test_installed_names_merges_server_and_disk(self):
        self._install("diffusion_models", "moss_image_sft_bf16.safetensors")
        with mock.patch.object(comfy_models, "comfy_model_names", return_value=["other.gguf"]):
            names = installed_names("image_unet", server="http://x")
        self.assertIn("moss_image_sft_bf16.safetensors", names)
        self.assertIn("other.gguf", names)

    def test_model_path_finds_nested_file(self):
        self._install("text_encoders/nested", "deep.safetensors")
        self.assertIsNotNone(model_path("image_clip", "deep.safetensors"))

    def test_roles_only_expose_moss_models_for_map_work(self):
        self.assertTrue(all("moss" in name for name in ROLES["moss_unet"].candidates))
        self.assertTrue(ROLES["moss_clip"].candidates[-1].endswith(".gguf"))
        self.assertTrue(all("qwen3.5_9b" in name for name in ROLES["moss_clip"].candidates[:-1]))

    def test_hunyuan_role_only_exposes_hunyuan_checkpoints(self):
        self.assertEqual(ROLES["hunyuan_ckpt"].folder, "checkpoints")
        self.assertTrue(all("hunyuan" in name.lower() for name in ROLES["hunyuan_ckpt"].candidates))

    def test_resolve_hunyuan_ckpt_from_checkpoints_folder(self):
        self._install("checkpoints", "hunyuan_3d_v2.1-fp16.safetensors")
        self.assertEqual(resolve("hunyuan_ckpt", server=None), "hunyuan_3d_v2.1-fp16.safetensors")


class TestBudgetGuard(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        patcher = mock.patch.object(comfy_models, "COMFY_MODELS", self.root)
        patcher.start()
        self.addCleanup(patcher.stop)

    @staticmethod
    def _stats(free_ram_gib: float, free_vram_gib: float) -> dict:
        return {
            "system": {"ram_free": int(free_ram_gib * 1024 ** 3)},
            "devices": [{"vram_free": int(free_vram_gib * 1024 ** 3)}],
        }

    def test_refuses_when_ram_is_short(self):
        encoder = self.root / "text_encoders" / "big.safetensors"
        encoder.parent.mkdir(parents=True)
        with encoder.open("wb") as handle:
            handle.truncate(6 * 1024 ** 3)  # sparse: no RAM or disk cost
        with self.assertRaises(BudgetError):
            require_budget("big.safetensors", 768, 768, stats=self._stats(4.0, 8.0))

    def test_refuses_when_vram_is_short(self):
        with self.assertRaises(BudgetError) as caught:
            require_budget("missing.safetensors", 1024, 1024, stats=self._stats(64.0, 2.0))
        self.assertIn("VRAM", str(caught.exception))

    def test_passes_with_headroom(self):
        report = require_budget("missing.safetensors", 768, 768, stats=self._stats(32.0, 8.0))
        self.assertTrue(report["checked"])

    def test_unreachable_server_is_not_a_refusal(self):
        self.assertFalse(require_budget("missing.safetensors", 768, 768, stats={})["checked"])


class TestExtraModelPaths(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_parses_base_path_blocks_and_single_values(self):
        shared = self.root / "shared"
        (shared / "vae").mkdir(parents=True)
        config = self.root / "extra.yaml"
        config.write_text(
            "section:\n"
            "  base_path: shared\n"
            "  diffusion_models: |\n"
            "    weights/unet\n"
            "  vae: vae\n"
            "  is_default: true\n",
            encoding="utf-8",
        )
        parsed = comfy_models.extra_model_paths(config)
        self.assertEqual(parsed["diffusion_models"], [(shared / "weights/unet").resolve()])
        self.assertEqual(parsed["vae"], [(shared / "vae").resolve()])

    def test_missing_file_returns_empty(self):
        self.assertEqual(comfy_models.extra_model_paths(self.root / "absent.yaml"), {})

    def test_absolute_paths_are_kept(self):
        target = self.root / "absolute"
        config = self.root / "extra.yaml"
        config.write_text(f"section:\n  loras: {target}\n", encoding="utf-8")
        self.assertEqual(comfy_models.extra_model_paths(config)["loras"], [target.resolve()])


class TestWorkflowValidator(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)
        patcher = mock.patch.object(comfy_models, "COMFY_MODELS", self.root / "models")
        patcher.start()
        self.addCleanup(patcher.stop)
        paths = mock.patch.object(comfy_models, "COMFY_EXTRA_PATHS", self.root / "none.yaml")
        paths.start()
        self.addCleanup(paths.stop)
        (self.root / "models" / "diffusion_models").mkdir(parents=True)

    def _write(self, workflow: dict) -> Path:
        path = self.root / "graph.json"
        path.write_text(json.dumps(workflow), encoding="utf-8")
        return path

    def test_flags_missing_model_and_broken_link(self):
        path = self._write(
            {
                "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "absent.safetensors"}},
                "2": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["9", 0], "text": "x"}},
            }
        )
        problems = check_workflow(path, server=None, input_dir=self.root / "input")
        joined = " ".join(problems)
        self.assertIn("absent.safetensors", joined)
        self.assertIn("missing node 9", joined)

    def test_flags_missing_input_image(self):
        path = self._write(
            {"1": {"class_type": "LoadImage", "inputs": {"image": "not-there.png"}}}
        )
        problems = check_workflow(path, server=None, input_dir=self.root / "input")
        self.assertTrue(any("not-there.png" in problem for problem in problems))

    def test_clean_graph_passes(self):
        (self.root / "models" / "diffusion_models" / "moss_image_sft_int8_convrot.safetensors").write_bytes(b"x")
        path = self._write(
            {"1": {"class_type": "UNETLoader", "inputs": {"unet_name": "moss_image_sft_int8_convrot.safetensors"}}}
        )
        self.assertEqual(check_workflow(path, server=None, input_dir=self.root / "input"), [])

    def test_hunyuan_checkpoint_resolves_from_checkpoints_folder(self):
        checkpoint = self.root / "models" / "checkpoints" / "hunyuan_3d_v2.1-fp16.safetensors"
        checkpoint.parent.mkdir(parents=True)
        checkpoint.write_bytes(b"x")
        path = self._write(
            {
                "1": {
                    "class_type": "ImageOnlyCheckpointLoader",
                    "inputs": {"ckpt_name": "hunyuan_3d_v2.1-fp16.safetensors"},
                }
            }
        )
        self.assertEqual(check_workflow(path, server=None, input_dir=self.root / "input"), [])

    def test_hunyuan_checkpoint_missing_from_checkpoints_folder(self):
        path = self._write(
            {
                "1": {
                    "class_type": "ImageOnlyCheckpointLoader",
                    "inputs": {"ckpt_name": "hunyuan_3d_v2.1-fp16.safetensors"},
                }
            }
        )
        problems = check_workflow(path, server=None, input_dir=self.root / "input")
        self.assertTrue(any("hunyuan_3d_v2.1-fp16.safetensors" in problem for problem in problems))

    def test_ui_format_is_skipped_not_failed(self):
        path = self._write({"nodes": [{"id": 1}], "links": []})
        problems = check_workflow(path, server=None, input_dir=self.root / "input")
        self.assertTrue(all(problem.startswith("skipped:") for problem in problems))


if __name__ == "__main__":
    unittest.main()