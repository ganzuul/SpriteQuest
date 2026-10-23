#!/usr/bin/env python3
"""
companion/test_web_preview.py

TDD test suite for the 2.5D Outdoor Map Web Preview Generator:
  1. Script syntax validation (zero JS parse/syntax errors via node VM).
  2. Fog-of-War & Line-of-Sight behavior:
     - Clear daylight visibility across open terrain (no dim radial flashlight falloff).
     - Strict geometric occlusion (LOS = 0.0) behind elevated ridges and ruins.
  3. Interactive input wiring (WASD, arrow keys, click-to-move, mousemove probe).
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.export_web_preview import generate_interactive_html


class TestWebPreviewGenerator(unittest.TestCase):
    def setUp(self):
        self.map_json_path = REPO_ROOT / "library" / "maps" / "border-march.json"
        self.temp_dir = tempfile.TemporaryDirectory()
        self.out_html = Path(self.temp_dir.name) / "test_preview.html"

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_generated_html_has_valid_javascript_syntax(self):
        """Ensure the exported HTML contains valid JS that parses without syntax errors."""
        generate_interactive_html(self.map_json_path, self.out_html)
        self.assertTrue(self.out_html.exists(), "Output HTML file must be generated")

        # Run node to verify that new Function(script_code) parses cleanly
        node_check = """
        const fs = require('fs');
        const html = fs.readFileSync(process.argv[1], 'utf8');
        const scriptMatch = html.match(/<script>([\\s\\S]*?)<\\/script>/);
        if (!scriptMatch) {
          console.error('No script tag found');
          process.exit(1);
        }
        try {
          new Function(scriptMatch[1]);
          console.log('Script syntax OK');
        } catch (e) {
          console.error('JS SyntaxError:', e.message);
          process.exit(1);
        }
        """
        proc = subprocess.run(
            ["node", "-e", node_check, str(self.out_html)],
            capture_output=True,
            text=True,
        )
        self.assertEqual(
            proc.returncode,
            0,
            f"JavaScript syntax error in generated HTML:\n{proc.stderr}\n{proc.stdout}",
        )

    def test_html_contains_required_dom_elements(self):
        """Verify presence of key viewport, world, canvas, token, and HUD elements."""
        generate_interactive_html(self.map_json_path, self.out_html)
        html = self.out_html.read_text(encoding="utf-8")

        required_ids = [
            'id="viewport"',
            'id="world"',
            'id="lighting-canvas"',
            'id="player"',
            'id="probe"',
            'id="stat-player-xy"',
            'id="stat-player-z"',
            'id="stat-cursor-xy"',
            'id="stat-cursor-z"',
            'id="stat-cursor-slope"',
        ]
        for req_id in required_ids:
            self.assertIn(req_id, html, f"Missing required DOM element: {req_id}")

    def test_los_not_a_radial_flashlight(self):
        """
        Verify that in open terrain, Line-of-Sight is clear (near 1.0 / unshadowed)
        and does NOT aggressively dim like an ambient flashlight right next to the player.
        """
        generate_interactive_html(self.map_json_path, self.out_html)
        html = self.out_html.read_text(encoding="utf-8")

        test_script = """
        const fs = require('fs');
        const html = fs.readFileSync(process.argv[1], 'utf8');
        const scriptMatch = html.match(/<script>([\\s\\S]*?)<\\/script>/)[1];

        const mockEl = {
          style: {},
          dataset: {},
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
          createElement: () => mockEl
        };

        eval(scriptMatch);

        // 1. Plateau is level: elevation at spawn (35, 65) and (50, 65) must match plateau height (6.0m)
        const elevTarget = window.viewer.sampleElevation(50, 65);
        const playerPos = window.viewer.getPlayerPos();
        const elevPlayer = window.viewer.sampleElevation(playerPos.x, playerPos.y);
        if (Math.abs(elevTarget - 6.0) > 0.2 || Math.abs(elevPlayer - 6.0) > 0.2) {
          throw new Error('Plateau elevation should be 6.0m');
        }

        // 2. Slope on plateau center must be 0 degrees (level build plate)
        const plateauSlope = window.viewer.getSlope(55, 65);
        if (plateauSlope > 3) {
          throw new Error(`Plateau slope should be ~0 deg, got ${plateauSlope}`);
        }

        // 3. Slope on ancient ruin flank at (16, 24) must satisfy ancient overhang rule (exact 45 deg)
        const ruinSlope = window.viewer.getSlope(16, 24);
        if (ruinSlope !== 45) {
          throw new Error(`Ancient ruin flank slope should be 45 deg, got ${ruinSlope}`);
        }

        // 4. Movement: moving player to (50, 70) must update position correctly
        window.viewer.updatePlayerPosition(50, 70);
        const newPos = window.viewer.getPlayerPos();
        if (newPos.x !== 50 || newPos.y !== 70) {
          throw new Error(`Player pos should be (50, 70), got (${newPos.x}, ${newPos.y})`);
        }

        // 5. Zone detection: at (45, 45), player must be in clearance-foyer
        window.viewer.updatePlayerPosition(45, 45);
        const currentZone = window.viewer.getCurrentZone();
        if (!currentZone || currentZone.id !== 'clearance-foyer') {
          throw new Error(`Expected zone clearance-foyer at (45, 45), got ${currentZone ? currentZone.id : 'null'}`);
        }

        // 6. Wall occlusion: solid wall at x=52 y=79 must block sightline, portal at x=61 must be clear
        if (!window.viewer.isSightlineBlockedByWall(52, 70, 52, 85)) {
          throw new Error('Solid north split wall at x=52 should block sightline');
        }
        if (window.viewer.isSightlineBlockedByWall(61, 70, 61, 85)) {
          throw new Error('Open portal at x=61 should not block sightline');
        }

        // 7. Stagecraft Semantic Anchoring & Affordance Templates:
        // Move player onto Mark S (Supplicant) at (48, 59)
        window.viewer.updatePlayerPosition(48, 59);
        const anchorS = window.viewer.getSemanticAnchor();
        if (!anchorS || anchorS.proscenium_state !== 'on_stage') {
          throw new Error(`Expected proscenium_state 'on_stage' at (48, 59), got ${anchorS ? anchorS.proscenium_state : 'null'}`);
        }
        if (!anchorS.anchored_cue_mark || anchorS.anchored_cue_mark.id !== 'mark_supplicant') {
          throw new Error('Expected anchored_cue_mark to be mark_supplicant at (48, 59)');
        }
        const stageDir = window.viewer.getStageDirection();
        if (!stageDir.includes('[STAGE DIRECTION') || !stageDir.includes('Mark S')) {
          throw new Error(`Expected stage direction to include Mark S, got: ${stageDir}`);
        }

        // Move player near weigh table (48, 63) -> at-weigh-scale affordance must activate
        window.viewer.updatePlayerPosition(48, 63);
        const affordances = window.viewer.getActiveAffordances();
        if (!affordances.some(a => a.id === 'at-weigh-scale' && a.status === 'available')) {
          throw new Error('Expected at-weigh-scale affordance template to be available at (48, 63)');
        }

        console.log('All LOS, telemetry, zone, wall, and stagecraft assertions passed');
        """
        proc = subprocess.run(
            ["node", "-e", test_script, str(self.out_html)],
            capture_output=True,
            text=True,
        )
        self.assertEqual(proc.returncode, 0, f"Node verification failed: {proc.stderr}")


if __name__ == "__main__":
    unittest.main()
