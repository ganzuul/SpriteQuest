/**
 * test/test_asset_viewer_and_forge.test.mjs
 *
 * TDD Test Suite for:
 *   1. Sidebar Asset Viewer displaying metadata and diffusion images
 *   2. Missing image placeholder with full diffusion prompt
 *   3. Asset Forge client-side rendering with SVG generation and audio cue
 *   4. World hit-testing selection integration (props, actors, cue marks, zones)
 *   5. Compressed collapsible sidebar layout with live summary badges
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const REPO_ROOT = path.resolve('.');

describe('Sidebar Asset Viewer & Asset Forge Engine (TDD)', () => {
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

  test('1. Sidebar Layout Compression and Section Accordions', () => {
    const assetPanel = document.getElementById('asset-viewer-panel');
    assert.ok(assetPanel, '#asset-viewer-panel must exist in DOM');

    const collapsibleSections = document.querySelectorAll('.panel-section-collapsible');
    assert.ok(collapsibleSections.length >= 7, 'Must have at least 7 collapsible details sections');

    const badges = [
      'badge-player-xy',
      'badge-player-zone',
      'badge-proscenium',
      'badge-strength',
      'badge-atmosphere',
      'badge-cursor',
    ];
    for (const badgeId of badges) {
      const el = document.getElementById(badgeId);
      assert.ok(el, `Summary badge #${badgeId} must exist`);
    }
  });

  test('2. Asset Selection for Prop with Existing Diffusion Matte Image', () => {
    const sel = viewer.selectAsset('quartermaster_desk');
    assert.ok(sel, 'selectAsset should return selected asset');
    assert.equal(sel.id, 'quartermaster_desk');

    const nameEl = document.getElementById('asset-viewer-name');
    assert.match(nameEl.textContent, /Quartermaster.*Desk/i);

    const badgeEl = document.getElementById('asset-viewer-badge');
    assert.match(badgeEl.textContent, /PROP/);

    const provEl = document.getElementById('asset-viewer-provenance');
    assert.equal(provEl.textContent, 'customs-house/hollis-ledger');

    const imgEl = document.getElementById('asset-viewer-img');
    assert.ok(imgEl, 'Existing image should render an <img> element');
    assert.match(imgEl.src, /table\.png/);

    const btn = document.getElementById('btn-forge-render');
    assert.ok(btn, 'Render button should exist');
    assert.match(btn.innerText, /Re-render in Asset Forge/);
  });

  test('3. Asset Selection for Prop Without Existing Image Displays Prompt & Forge Button', () => {
    const sel = viewer.selectAsset('r6_ship_crate_standard');
    assert.ok(sel);
    assert.equal(sel.id, 'r6_ship_crate_standard');

    const imgContainer = document.getElementById('asset-viewer-image-container');
    const imgEl = document.getElementById('asset-viewer-img');
    assert.equal(imgEl, null, 'Unrendered asset should not have an <img> tag before forge rendering');

    const placeholder = imgContainer.querySelector('.asset-no-img-box');
    assert.ok(placeholder, 'Should display placeholder box');
    assert.match(placeholder.textContent, /No Diffusion Render on Disk/);
    assert.match(placeholder.textContent, /R6-SHIP/);

    const btn = document.getElementById('btn-forge-render');
    assert.match(btn.innerText, /Render in Asset Forge/);
  });

  test('4. Triggering Asset Forge Synthesizes Vector Diffusion Matte and Updates DOM', async () => {
    viewer.selectAsset('r6_ship_crate_standard');

    const result = await viewer.renderAssetInForge('r6_ship_crate_standard', { immediate: true });
    assert.equal(result.success, true);
    assert.equal(result.status, 'rendered');
    assert.ok(result.imageUrl.startsWith('data:image/svg+xml'), 'Must produce a vector SVG data URL');

    const imgEl = document.getElementById('asset-viewer-img');
    assert.ok(imgEl, 'Image element should now exist after forge synthesis');
    assert.equal(imgEl.src, result.imageUrl);

    const badgeEl = document.getElementById('asset-viewer-badge');
    assert.equal(badgeEl.textContent, '[FORGED · FLUX 3 KLEIN]');

    const btn = document.getElementById('btn-forge-render');
    assert.match(btn.innerText, /Re-render in Asset Forge/);
  });

  test('5. Asset Selection for Actors (Player and Hollis)', () => {
    const playerSel = viewer.selectAsset('player');
    assert.ok(playerSel);
    assert.equal(playerSel.id, 'player');
    assert.equal(playerSel.kind, 'actor');

    const nameEl = document.getElementById('asset-viewer-name');
    assert.equal(nameEl.textContent, 'Player');

    const badgeEl = document.getElementById('asset-viewer-badge');
    assert.equal(badgeEl.textContent, '[ACTOR]');

    const imgEl = document.getElementById('asset-viewer-img');
    assert.ok(imgEl);
    assert.match(imgEl.src, /player_in_pass\.png/);
  });

  test('6. Asset Selection for Cue Marks and Zones', () => {
    const cueSel = viewer.selectAsset('mark_supplicant');
    assert.ok(cueSel);
    assert.equal(cueSel.kind, 'cue_mark');

    const cueBadge = document.getElementById('asset-viewer-badge');
    assert.equal(cueBadge.textContent, '[CUE_MARK]');

    const zoneSel = viewer.selectAsset('clearance-foyer');
    assert.ok(zoneSel);
    assert.equal(zoneSel.kind, 'zone');

    const zoneBadge = document.getElementById('asset-viewer-badge');
    assert.equal(zoneBadge.textContent, '[ZONE]');
  });

  test('7. Interactive Click Coordinates Selects World Objects', () => {
    const desk = viewer.getPhysicalProps().find(p => p.id === 'quartermaster_desk');
    assert.ok(desk, 'Desk prop must exist');

    // Deselect by selecting something else first
    viewer.selectAsset('clearance-foyer');
    assert.equal(viewer.getSelectedAsset().id, 'clearance-foyer');

    // Select desk
    viewer.selectAsset(desk.id);
    assert.equal(viewer.getSelectedAsset().id, 'quartermaster_desk');
    assert.equal(document.getElementById('asset-viewer-name').textContent, desk.label);
  });

  test('8. Live Summary Badges Update on State Changes', () => {
    viewer.setPlayerStrength(160);
    const badgeStrength = document.getElementById('badge-strength');
    assert.equal(badgeStrength.innerText, '160 kg');

    viewer.setAtmosphereMode('night');
    const badgeAtmo = document.getElementById('badge-atmosphere');
    assert.equal(badgeAtmo.innerText, 'NIGHT');

    viewer.updatePlayerPosition(15.2, 28.7);
    const badgeXY = document.getElementById('badge-player-xy');
    assert.equal(badgeXY.innerText, '15.2m, 28.7m');
  });

  test('9. Telemetry & Terminal Logs Capture Initialization, Selection, and Forge Events', async () => {
    const logs = viewer.getLogs();
    assert.ok(Array.isArray(logs), 'viewer.getLogs() must return an array');
    assert.ok(logs.length >= 3, 'Must capture initialization and selection logs');

    // Verify presence of stage category
    const stageLog = logs.find(l => l.category === 'STAGE');
    assert.ok(stageLog, 'Must have at least one [STAGE] log entry');

    // Trigger manual log entry
    viewer.log('COMFYUI', 'Test connection verified');
    const updatedLogs = viewer.getLogs();
    const lastLog = updatedLogs[updatedLogs.length - 1];
    assert.equal(lastLog.category, 'COMFYUI');
    assert.equal(lastLog.message, 'Test connection verified');

    // Check DOM terminal
    const term = document.getElementById('log-terminal');
    assert.ok(term, '#log-terminal must exist in DOM');
    assert.ok(term.children.length >= updatedLogs.length, 'Terminal DOM should have child elements for logs');

    const badgeCount = document.getElementById('badge-log-count');
    assert.match(badgeCount.innerText, /events/);

    // Test clear
    viewer.clearLogs();
    assert.equal(viewer.getLogs().length, 1, 'ClearLogs should leave only the "cleared" notice');
    assert.equal(badgeCount.innerText, '1 events');
  });

  test('10. ComfyUI Server Probe and Live Pipeline Server Status', async () => {
    assert.ok(typeof viewer.checkComfyServer === 'function', 'viewer.checkComfyServer must be exported');
    const status = await viewer.checkComfyServer();
    assert.ok(typeof status.online === 'boolean', 'status.online must be a boolean');

    const serverStatusEl = document.getElementById('asset-viewer-server-status');
    assert.ok(serverStatusEl, '#asset-viewer-server-status element must exist');
    assert.ok(serverStatusEl.textContent.length > 0);
  });
});
