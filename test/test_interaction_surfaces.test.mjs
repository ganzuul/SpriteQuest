/**
 * test/test_interaction_surfaces.test.mjs
 *
 * TDD Test Suite for Input Handling, Interaction Surfaces & Cursor Tooltips:
 *   1. Screen to World Coordinate Mapping (Raycast Surface)
 *   2. Probe Cursor Alignment (Zero 3D perspective drift)
 *   3. Hit-Testing for Fragment Props (Accurate bounds detection)
 *   4. Hit-Testing for Stagecraft Cue Marks & Zones
 *   5. Floating Cursor Tooltip Lifecycle & Semantic Formatting
 *   6. Click-to-Interact Targeting on Surfaces
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const REPO_ROOT = path.resolve('.');

describe('Inputs & Interaction Surfaces Engine (TDD)', () => {
  let dom;
  let window;
  let document;
  let viewer;

  before(async () => {
    const htmlPath = path.join(REPO_ROOT, 'renders/maps/border-march/index.html');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(rawHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
    });
    window = dom.window;
    document = window.document;

    window.HTMLCanvasElement.prototype.getContext = () => ({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {},
      clearRect: () => {},
      drawImage: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
    });

    const scriptMatch = rawHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    window.eval(scriptMatch);
    viewer = window.viewer;
  });

  test('1. Screen to World Coordinate Mapping (Raycast Surface)', () => {
    assert.ok(typeof viewer.screenToWorld === 'function', 'viewer.screenToWorld must be exported');

    // World element is 600px wide (120m map width) and 700px high (140m map length)
    // Center point (300px, 350px) maps to (60.0m, 70.0m)
    const centerWorld = viewer.screenToWorld(300, 350, 600, 700);
    assert.ok(Math.abs(centerWorld.x - 60.0) < 0.1, `Center X must be 60.0m: got ${centerWorld.x}`);
    assert.ok(Math.abs(centerWorld.y - 70.0) < 0.1, `Center Y must be 70.0m: got ${centerWorld.y}`);

    // Origin (0px, 0px) maps to (0m, 0m)
    const originWorld = viewer.screenToWorld(0, 0, 600, 700);
    assert.equal(originWorld.x, 0);
    assert.equal(originWorld.y, 0);
  });

  test('2. Probe Cursor Alignment (Zero 3D perspective drift)', () => {
    const probeEl = document.getElementById('probe');
    assert.ok(probeEl, '#probe element must exist in DOM');

    // Simulate mouse move to (230px, 280px) corresponding to (46.0m, 56.0m)
    viewer.handleMouseMove(230, 280, 600, 700);

    // Verify probe element is positioned exactly at cursor pixel coordinates
    assert.equal(probeEl.style.left, '230px');
    assert.equal(probeEl.style.top, '280px');
    assert.equal(probeEl.style.display, 'block');

    // Probe transform must NOT include translateZ that offsets the cursor ring radially
    const computedStyle = window.getComputedStyle(probeEl);
    assert.ok(
      !computedStyle.transform.includes('145px') && !probeEl.style.transform.includes('145px'),
      'Probe cursor must not have 145px translateZ offset causing parallax shift'
    );
  });

  test('3. Hit-Testing for Physical Props under Cursor', () => {
    assert.ok(typeof viewer.getInteractableAt === 'function', 'viewer.getInteractableAt must be exported');

    // 3.1 R6 SHIP Crate at (46.0, 56.0)
    const hitCrate = viewer.getInteractableAt(46.0, 56.0);
    assert.ok(hitCrate, 'Should detect R6 crate at (46.0, 56.0)');
    assert.equal(hitCrate.kind, 'prop');
    assert.equal(hitCrate.id, 'r6_ship_crate_standard');
    assert.equal(hitCrate.mass_kg, 42.5);
    assert.ok(hitCrate.label.includes('R6-SHIP'));

    // 3.2 Glass Stasis Coffin at (44.0, 84.0)
    const hitCoffin = viewer.getInteractableAt(44.0, 84.0);
    assert.ok(hitCoffin, 'Should detect glass coffin at (44.0, 84.0)');
    assert.equal(hitCoffin.id, 'glass_stasis_coffin');
    assert.equal(hitCoffin.mass_kg, 280.0);
    assert.equal(hitCoffin.destructible, true);
  });

  test('4. Hit-Testing for Stagecraft Cue Marks & Zones', () => {
    // 4.1 Cue Mark S at (47.0, 58.0)
    const hitCue = viewer.getInteractableAt(47.0, 58.0);
    assert.ok(hitCue, 'Should detect interactable at Mark S');
    // Can be cue mark or nearby prop
    assert.ok(hitCue.kind === 'cue_mark' || hitCue.kind === 'prop');

    // 4.2 Empty wilderness zone at (25.0, 30.0)
    const hitWilderness = viewer.getInteractableAt(25.0, 30.0);
    assert.ok(hitWilderness, 'Should detect wilderness zone at (25.0, 30.0)');
    assert.equal(hitWilderness.kind, 'zone');
    assert.ok(hitWilderness.label.includes('Wilderness') || hitWilderness.label.includes('Approach'));
  });

  test('5. Floating Cursor Tooltip Lifecycle & Semantic Formatting', () => {
    const tooltipEl = document.getElementById('cursor-tooltip');
    assert.ok(tooltipEl, '#cursor-tooltip must exist in the preview DOM');

    // 5.1 Hover over R6 Crate at (230px, 280px) -> (46.0m, 56.0m)
    viewer.handleMouseMove(230, 280, 600, 700);

    assert.equal(tooltipEl.style.display, 'block');
    assert.ok(tooltipEl.innerHTML.includes('R6-SHIP'), 'Tooltip must display R6-SHIP label');
    assert.ok(tooltipEl.innerHTML.includes('42.5kg') || tooltipEl.innerHTML.includes('42.5 kg'), 'Tooltip must display mass');

    // Tooltip should be positioned close to mouse coordinates without massive offset
    const ttLeft = parseFloat(tooltipEl.style.left);
    const ttTop = parseFloat(tooltipEl.style.top);
    assert.ok(Math.abs(ttLeft - 230) <= 40, `Tooltip left should be near 230px: got ${ttLeft}`);
    assert.ok(Math.abs(ttTop - 280) <= 60, `Tooltip top should be near 280px: got ${ttTop}`);

    // 5.2 Move mouse out to empty space -> tooltip updates to zone or hides
    viewer.handleMouseMove(50, 50, 600, 700);
    assert.ok(!tooltipEl.innerHTML.includes('R6-SHIP'), 'Tooltip must not retain old prop data');
  });

  test('6. Click-to-Interact Targeting on Surfaces', () => {
    assert.ok(typeof viewer.handleClick === 'function', 'viewer.handleClick must be exported');

    // Click on R6 Crate at (46.0, 56.0) -> (230px, 280px)
    const clickResult = viewer.handleClick(230, 280, 600, 700);
    assert.ok(clickResult, 'Click result must be returned');
    assert.equal(clickResult.hitKind, 'prop');
    assert.equal(clickResult.targetId, 'r6_ship_crate_standard');
  });
});
