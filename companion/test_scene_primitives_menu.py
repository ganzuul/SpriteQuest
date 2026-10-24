#!/usr/bin/env python3
"""
companion/test_scene_primitives_menu.py

Automated unit & integration test suite for:
  - Scene definitions in library/scenes/*.json
  - Scene primitive linkage and 2D blueprint asset rendering
  - HTML viewer Scene Selector & Primitives Inspection Menu wiring
  - Lightbox inspection and category filtering.
"""

from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.export_web_preview import generate_interactive_html
from companion.render_primitive_2d import PRIMITIVE_VECTOR_SCHEMAS, render_primitive_svg
from companion.scene_definitions import export_scenes_manifest, load_all_scenes, load_scene_definition


class TestSceneDefinitionsAndPrimitivesMenu(unittest.TestCase):
    def test_all_campaign_scenes_exist_and_load(self):
        scenes = load_all_scenes()
        expected_scenes = ["border-march", "customs-house", "unwritten-ascent", "glass-cathedral"]
        for sid in expected_scenes:
            self.assertIn(sid, scenes, f"Scene '{sid}' must exist in library/scenes/")
            scene = scenes[sid]
            self.assertEqual(scene.id, sid)
            self.assertTrue(len(scene.name) > 0)
            self.assertTrue(len(scene.act) > 0)
            self.assertGreater(len(scene.primitives), 0, f"Scene '{sid}' must declare primitives")

    def test_primitives_source_fragments_and_2d_images_exist(self):
        scenes = load_all_scenes()
        for sid, scene in scenes.items():
            for p in scene.primitives:
                # 1. Fragment must exist on disk
                frag_file = REPO_ROOT / "library" / "fragments" / f"{p.fragment_id}.json"
                self.assertTrue(
                    frag_file.is_file(),
                    f"Primitive '{p.id}' in scene '{sid}' references missing fragment: {p.fragment_id}"
                )

                # 2. 2D image must be a valid data URL or path
                self.assertTrue(
                    p.image_2d.startswith("data:image/svg+xml") or p.image_2d.endswith(".png"),
                    f"Primitive '{p.id}' must provide a 2D image data URL"
                )

                # 3. Valid dimensions and triangles
                self.assertEqual(len(p.dimensions), 3, f"Primitive '{p.id}' dimensions must be [w, l, h]")
                self.assertGreater(p.triangle_count, 0)
                self.assertTrue(len(p.description) > 5)

    def test_vector_blueprints_generated_for_catalog(self):
        for pid in PRIMITIVE_VECTOR_SCHEMAS.keys():
            svg = render_primitive_svg(pid)
            self.assertTrue(svg.startswith("<svg"))
            self.assertTrue(svg.endswith("</svg>"))
            self.assertIn("FLUX 3 KLEIN READY", svg)
            self.assertIn(pid, svg)

    def test_viewer_runtime_scene_primitives_menu_api(self):
        """Verify viewer.js scene selection, primitives menu, and lightbox in node runtime."""
        map_json_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        with tempfile.TemporaryDirectory() as tmp_dir:
            out_html = Path(tmp_dir) / "test_preview.html"
            generate_interactive_html(map_json_path, out_html)

            test_script = """
            const fs = require('fs');
            const html = fs.readFileSync(process.argv[1], 'utf8');
            const scriptMatch = html.match(/<script>([\\s\\S]*?)<\\/script>/)[1];

            const mockEl = {
              style: {},
              dataset: {},
              classList: {
                _classes: new Set(),
                add: function(c) { this._classes.add(c); },
                remove: function(c) { this._classes.delete(c); },
                contains: function(c) { return this._classes.has(c); }
              },
              innerHTML: '',
              innerText: '',
              textContent: '',
              querySelector: () => mockEl,
              querySelectorAll: () => [],
              setAttribute: () => {},
              clientWidth: 600,
              clientHeight: 700,
              addEventListener: () => {},
              appendChild: () => {},
              getContext: () => ({
                createImageData: () => ({ data: new Uint8ClampedArray(120*140*4) }),
                putImageData: () => {},
                clearRect: () => {},
                drawImage: () => {},
                createRadialGradient: () => ({ addColorStop: () => {} }),
                save: () => {},
                restore: () => {},
                beginPath: () => {},
                arc: () => {},
                fill: () => {}
              }),
              getBoundingClientRect: () => ({ left: 0, top: 0, width: 600, height: 700 })
            };
            const window = { addEventListener: () => {} };
            const document = {
              getElementById: () => mockEl,
              createElement: () => mockEl,
              querySelectorAll: () => []
            };

            eval(scriptMatch);

            // 1. Scene registry inspection
            const scenes = window.viewer.getScenes();
            if (!Array.isArray(scenes) || scenes.length < 4) {
              throw new Error(`Expected at least 4 scenes, got ${scenes ? scenes.length : 'none'}`);
            }

            // 2. Initial active scene is border-march
            const curScene = window.viewer.getCurrentScene();
            if (!curScene || curScene.id !== 'border-march') {
              throw new Error(`Expected active scene 'border-march', got ${curScene ? curScene.id : 'null'}`);
            }

            // 3. Inspect primitives of border-march
            const bmPrims = window.viewer.getScenePrimitives('border-march');
            if (bmPrims.length !== 6) {
              throw new Error(`Expected 6 primitives for border-march, got ${bmPrims.length}`);
            }
            if (!bmPrims.some(p => p.id === 'ancient-bastion')) {
              throw new Error('Expected ancient-bastion in border-march primitives');
            }

            // 4. Switch scene to customs-house
            const chScene = window.viewer.selectScene('customs-house');
            if (!chScene || chScene.id !== 'customs-house') {
              throw new Error('Failed to switch to customs-house');
            }
            const chPrims = window.viewer.getScenePrimitives();
            if (chPrims.length !== 9) {
              throw new Error(`Expected 9 primitives for customs-house, got ${chPrims.length}`);
            }
            if (!chPrims.some(p => p.id === 'glass-stasis-coffin')) {
              throw new Error('Expected glass-stasis-coffin in customs-house primitives');
            }

            // 5. Switch scene to glass-cathedral
            const gcScene = window.viewer.selectScene('glass-cathedral');
            if (!gcScene || gcScene.id !== 'glass-cathedral') {
              throw new Error('Failed to switch to glass-cathedral');
            }
            const gcPrims = window.viewer.getScenePrimitives();
            if (!gcPrims.some(p => p.id === 'glass-column-fluted')) {
              throw new Error('Expected glass-column-fluted in glass-cathedral primitives');
            }

            // 6. Test menu toggle & lightbox controls
            window.viewer.togglePrimitivesMenu(true);
            window.viewer.filterPrimitives('architecture');
            window.viewer.openPrimitiveLightbox('glass-column-fluted');
            window.viewer.closePrimitiveLightbox();
            window.viewer.closePrimitivesMenu();

            console.log('All scene primitives menu API tests passed successfully');
            """
            proc = subprocess.run(
                ["node", "-e", test_script, str(out_html)],
                capture_output=True,
                text=True,
            )
            self.assertEqual(proc.returncode, 0, f"Node verification failed: {proc.stderr}")


if __name__ == "__main__":
    unittest.main()
