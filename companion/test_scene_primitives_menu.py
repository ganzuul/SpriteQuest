#!/usr/bin/env python3
"""
companion/test_scene_primitives_menu.py

Automated unit & integration test suite for:
  - Scene definitions in library/scenes/*.json
  - 3D STL to 2D multi-view image rendering (companion/render_primitive_2d.py)
  - Left Sidebar Asset Navigation Panel (#asset-nav-sidebar):
      1. Top: Scene Picker (#sidebar-scene-picker, #scene-selector)
      2. Middle: Hierarchical Tree View (#sidebar-asset-tree)
      3. Bottom: Asset Preview Panel (#sidebar-asset-preview, #sidebar-preview-img)
  - Bidirectional selection synchronization and map focus wiring.
"""

from __future__ import annotations

import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.export_web_preview import generate_interactive_html
from companion.render_primitive_2d import PRIMITIVE_STYLES, get_primitive_2d_data_url, render_primitive_svg
from companion.scene_definitions import load_all_scenes


class TestSceneDefinitionsAndLeftSidebar(unittest.TestCase):
    def test_all_campaign_scenes_exist_and_load(self):
        scenes = load_all_scenes()
        expected_scenes = ["customs-house", "border-march", "unwritten-ascent", "glass-cathedral"]
        for sid in expected_scenes:
            self.assertIn(sid, scenes, f"Scene '{sid}' must exist in library/scenes/")
            scene = scenes[sid]
            self.assertEqual(scene.id, sid)
            self.assertTrue(len(scene.name) > 0)
            self.assertTrue(len(scene.act) > 0)
            self.assertGreater(len(scene.primitives), 0, f"Scene '{sid}' must declare primitives")
            self.assertGreater(len(scene.cast), 0, f"Scene '{sid}' must declare cast members")

    def test_primitives_source_fragments_and_2d_stl_images_exist(self):
        scenes = load_all_scenes()
        for sid, scene in scenes.items():
            for p in scene.primitives:
                # 1. Fragment must exist on disk
                frag_file = REPO_ROOT / "library" / "fragments" / f"{p.fragment_id}.json"
                self.assertTrue(
                    frag_file.is_file(),
                    f"Primitive '{p.id}' in scene '{sid}' references missing fragment: {p.fragment_id}"
                )

                # 2. 2D image must be a valid PNG/SVG data URL rendered from the 3D STL
                self.assertTrue(
                    p.image_2d.startswith("data:image/png;base64,") or p.image_2d.startswith("data:image/svg+xml"),
                    f"Primitive '{p.id}' must provide a 2D image data URL"
                )

                # 3. Valid dimensions, triangles, tree_group, and stage_role
                self.assertEqual(len(p.dimensions), 3, f"Primitive '{p.id}' dimensions must be [w, l, h]")
                self.assertGreater(p.triangle_count, 0)
                self.assertTrue(len(p.tree_group) > 0)
                self.assertTrue(len(p.stage_role) > 0)
                self.assertTrue(len(p.description) > 5)

    def test_2d_multi_view_sheets_generated_for_catalog(self):
        for pid in PRIMITIVE_STYLES.keys():
            url = get_primitive_2d_data_url(pid)
            self.assertTrue(url.startswith("data:image/png;base64,"))
            svg = render_primitive_svg(pid)
            self.assertTrue(svg.startswith("<svg"))
            self.assertTrue(svg.endswith("</svg>"))

    def test_left_sidebar_dom_and_runtime_wiring(self):
        """Verify Left Sidebar (Scene Picker -> Tree View -> Asset Preview) in generated HTML and runtime."""
        map_json_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        with tempfile.TemporaryDirectory() as tmp_dir:
            out_html = Path(tmp_dir) / "test_preview.html"
            generate_interactive_html(map_json_path, out_html)
            html_text = out_html.read_text(encoding="utf-8")

            for req_id in [
                'id="asset-nav-sidebar"',
                'id="sidebar-scene-picker"',
                'id="btn-sidebar-collapse"',
                'id="sidebar-resizer"',
                'id="sidebar-expand-tab"',
                'id="scene-selector"',
                'id="sidebar-asset-tree"',
                'id="sidebar-asset-preview"',
                'id="sidebar-preview-img"',
                'id="sidebar-preview-title"',
                'id="sidebar-preview-role"',
                'id="sidebar-preview-meta"',
            ]:
                self.assertIn(req_id, html_text, f"Missing Left Sidebar DOM element: {req_id}")

            test_script = """
            const fs = require('fs');
            const html = fs.readFileSync(process.argv[1], 'utf8');
            const scriptMatch = html.match(/<script>([\\s\\S]*?)<\\/script>/)[1];

            const elements = {};
            function makeEl(id) {
              return {
                id,
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
                src: '',
                alt: '',
                value: 'border-march',
                querySelector: () => makeEl('sub'),
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
            }
            const window = { addEventListener: () => {} };
            const document = {
              getElementById: (id) => {
                if (!elements[id]) elements[id] = makeEl(id);
                return elements[id];
              },
              createElement: (tag) => makeEl(tag),
              querySelectorAll: () => []
            };

            eval(scriptMatch);

            // 1. Scene registry has all 4 acts
            const scenes = window.viewer.getScenes();
            if (!Array.isArray(scenes) || scenes.length < 4) {
              throw new Error(`Expected 4 scenes, got ${scenes ? scenes.length : 'none'}`);
            }

            // 2. Switch to Act I (customs-house) -> Tree View & Preview update automatically
            const chScene = window.viewer.selectScene('customs-house');
            if (!chScene || chScene.id !== 'customs-house') {
              throw new Error('Failed to switch to customs-house');
            }
            const treeHtml = elements['sidebar-asset-tree'].innerHTML;
            if (!treeHtml.includes('Quest Relics &amp; Cargo') || !treeHtml.includes('Crate #00-NULL')) {
              throw new Error('Tree view did not render grouped folders for Customs House');
            }

            // 3. Select a specific tree node -> updates bottom preview AND syncs right-hand Asset Viewer
            const item = window.viewer.selectScenePrimitive('common-table');
            if (!item || item.id !== 'common-table') {
              throw new Error('Failed to select common-table in sidebar tree');
            }
            if (!elements['sidebar-preview-title'].textContent.includes('Ledger Desk')) {
              throw new Error(`Preview title mismatch: ${elements['sidebar-preview-title'].textContent}`);
            }
            if (!elements['sidebar-preview-img'].src.startsWith('data:image/png;base64,')) {
              throw new Error('Preview image src was not updated with 2D STL render');
            }
            const rightAsset = window.viewer.getSelectedAsset();
            if (!rightAsset || rightAsset.id !== 'quartermaster_desk') {
              throw new Error(`Expected right-hand viewer to sync to 'quartermaster_desk', got ${rightAsset ? rightAsset.id : 'null'}`);
            }

            // 4. Focus on map moves player/viewport to asset coordinates
            const focusRes = window.viewer.focusSceneAssetOnMap('common-table');
            if (!focusRes || focusRes.x !== 63 || focusRes.y !== 69) {
              throw new Error(`Expected focusSceneAssetOnMap to move to (63, 69), got ${JSON.stringify(focusRes)}`);
            }

            // 5. Switch to Act IV (glass-cathedral)
            const gcScene = window.viewer.selectScene('glass-cathedral');
            if (!gcScene || gcScene.id !== 'glass-cathedral') {
              throw new Error('Failed to switch to glass-cathedral');
            }
            const lens = window.viewer.selectScenePrimitive('solar-focus-lens');
            if (!lens || !elements['sidebar-preview-title'].textContent.includes('Solar Focus Lens')) {
              throw new Error('Failed to preview solar-focus-lens in Act IV');
            }

            // 6. Resizable & Collapsible Sidebar state checks
            window.viewer.toggleSidebar(true);
            if (!elements['asset-nav-sidebar'].classList.contains('collapsed')) {
              throw new Error('toggleSidebar(true) failed to collapse asset-nav-sidebar');
            }
            if (!window.viewer.isSidebarCollapsed()) {
              throw new Error('isSidebarCollapsed() returned false when sidebar was collapsed');
            }

            window.viewer.toggleSidebar(false);
            if (elements['asset-nav-sidebar'].classList.contains('collapsed')) {
              throw new Error('toggleSidebar(false) failed to expand asset-nav-sidebar');
            }
            if (window.viewer.isSidebarCollapsed()) {
              throw new Error('isSidebarCollapsed() returned true when sidebar was expanded');
            }

            // Toggle without args flips state
            window.viewer.toggleSidebar();
            if (!window.viewer.isSidebarCollapsed()) {
              throw new Error('toggleSidebar() failed to flip state to collapsed');
            }
            window.viewer.toggleSidebar();
            if (window.viewer.isSidebarCollapsed()) {
              throw new Error('toggleSidebar() failed to flip state back to expanded');
            }

            console.log('All Left Sidebar Asset Navigation Panel tests passed');
            """
            proc = subprocess.run(
                ["node", "-e", test_script, str(out_html)],
                capture_output=True,
                text=True,
            )
            self.assertEqual(proc.returncode, 0, f"Node verification failed: {proc.stderr}")


if __name__ == "__main__":
    unittest.main()
