#!/usr/bin/env python3
"""
companion/test_comfy_depth.py

Offline tests for the ComfyUI depth-render template and its framing helpers.
No ComfyUI server is required; nothing here queues a render.
"""

from __future__ import annotations

import json
import re
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_depth import (
    DEPTH_TEMPLATE,
    load_depth_template,
    mesh_frame,
    side_by_side_depth,
)


class TestDepthTemplate(unittest.TestCase):
    """The graph has to stay Z-up, or every depth template comes out tipped."""

    def setUp(self):
        self.wf = load_depth_template()

    def test_template_does_not_rotate_the_mesh(self):
        class_types = {node["class_type"] for node in self.wf.values()}
        self.assertNotIn(
            "RotateMesh",
            class_types,
            "Get 3D Components already hands Render Mesh a Z-up mesh; rotating it tips the depth 90 degrees",
        )

    def test_render_mesh_nodes_read_the_mesh_directly(self):
        sources = [
            node["inputs"]["mesh"]
            for node in self.wf.values()
            if node["class_type"] == "RenderMesh"
        ]
        self.assertEqual(len(sources), 2, "template should have two depth panes")
        self.assertEqual(sources[0], sources[1], "both panes should render the same mesh")
        self.assertEqual(len(sources[0]), 2, "mesh input should be a [node_id, slot] link")

    def test_plan_camera_is_nadir_above_positive_z(self):
        plan = self._camera_feeding("topdown")
        self.assertEqual(plan["inputs"]["mode"], "look_at")
        # Nadir means the camera sits on the target's vertical axis.
        self.assertEqual(plan["inputs"]["mode.position_x"], "{{TOP_CAM_X}}")
        self.assertEqual(plan["inputs"]["mode.position_y"], "{{TOP_CAM_Y}}")
        self.assertEqual(plan["inputs"]["target_x"], "{{TARGET_X}}")
        self.assertEqual(plan["inputs"]["target_y"], "{{TARGET_Y}}")

    def test_three_quarter_camera_is_orbit(self):
        camera = self._camera_feeding("three_quarter")
        self.assertEqual(camera["inputs"]["mode"], "orbit")

    def test_save_image_nodes_are_distinguishable_by_prefix(self):
        prefixes = {
            node["inputs"]["filename_prefix"]
            for node in self.wf.values()
            if node["class_type"] == "SaveImage"
        }
        self.assertEqual(len(prefixes), 2)
        joined = " ".join(prefixes)
        self.assertIn("topdown", joined)
        self.assertIn("three_quarter", joined)

    def _camera_feeding(self, view: str) -> dict:
        """Return the CreateCameraInfo node wired into the SaveImage for `view`."""
        save = next(
            node
            for node in self.wf.values()
            if node["class_type"] == "SaveImage" and view in node["inputs"]["filename_prefix"]
        )
        render_id = save["inputs"]["images"][0]
        render = self.wf[render_id]
        self.assertEqual(render["class_type"], "RenderMesh")
        self.assertEqual(render["inputs"]["mode"], "depth")
        return self.wf[render["inputs"]["camera_info"][0]]


class TestDepthFraming(unittest.TestCase):
    def setUp(self):
        self.mesh = REPO_ROOT / "library" / "mesh" / "ancient-bastion-source.glb"
        if not self.mesh.is_file():
            self.skipTest(f"mesh fixture missing: {self.mesh}")

    def test_plan_camera_sits_above_the_target(self):
        frame = mesh_frame(self.mesh)
        self.assertGreater(frame["TOP_CAM_Z"], frame["TARGET_Z"])
        self.assertEqual(frame["TOP_CAM_X"], frame["TARGET_X"])
        self.assertEqual(frame["TOP_CAM_Y"], frame["TARGET_Y"])

    def test_plan_distance_covers_the_footprint_diagonal(self):
        frame = mesh_frame(self.mesh)
        distance = frame["TOP_CAM_Z"] - frame["TARGET_Z"]
        # 22 m footprint at 35 degrees vertical FOV needs ~35 m; allow the margin.
        self.assertGreater(distance, 30.0)
        self.assertLess(distance, 70.0)

    def test_plan_distance_is_tighter_than_the_sphere_fit(self):
        frame = mesh_frame(self.mesh)
        top = frame["TOP_CAM_Z"] - frame["TARGET_Z"]
        self.assertLess(top, frame["DISTANCE_34"], "a plan view does not need the full 3D diagonal")

    def test_three_quarter_distance_covers_the_bounding_sphere(self):
        frame = mesh_frame(self.mesh)
        self.assertGreater(frame["DISTANCE_34"], frame["TOP_CAM_Z"] - frame["TARGET_Z"])

    def test_framing_fills_every_camera_placeholder(self):
        frame = mesh_frame(self.mesh)
        template = DEPTH_TEMPLATE.read_text(encoding="utf-8")
        names = set(re.findall(r"\{\{([A-Z0-9_]+)\}\}", template))
        # MESH_FILE / PREFIX / WIDTH / HEIGHT come from the caller, not the framing.
        camera_names = {name for name in names if name.startswith(("TARGET", "TOP_CAM", "DISTANCE"))
                        or name == "FOV"}
        self.assertTrue(camera_names, "template should declare camera placeholders")
        missing = camera_names - set(frame)
        self.assertEqual(missing, set(), f"mesh_frame does not supply {sorted(missing)}")


class TestSideBySideComposition(unittest.TestCase):
    def test_plan_pane_goes_on_the_left(self):
        from PIL import Image

        left = Image.new("L", (16, 16), 10)
        right = Image.new("L", (16, 16), 200)
        composed = side_by_side_depth(left, right)
        self.assertEqual(composed.size, (32, 16))
        self.assertEqual(composed.getpixel((4, 8)), 10)
        self.assertEqual(composed.getpixel((28, 8)), 200)

    def test_mismatched_pane_height_is_resized(self):
        from PIL import Image

        composed = side_by_side_depth(Image.new("L", (16, 16), 0), Image.new("L", (32, 32), 0))
        self.assertEqual(composed.size, (48, 16))


if __name__ == "__main__":
    unittest.main()