/**
 * test/test_cutscene_engine.test.mjs
 *
 * TDD Unit & Integration Test Suite for the SpriteQuest Theatrical Cutscene Engine:
 *   1. Multi-Actor Registration & DOM Tokens
 *   2. Actor Movement & Elevation Heightfield Sampling
 *   3. Dynamic Line-of-Sight (LOS) & Explored Visibility during Movement
 *   4. Stagecraft Cue Mark Capture & Hollis Ledger Standing Gates
 *   5. Physical Weight & Scale Affordance Interaction (weigh_cargo)
 *   6. Theatrical Speech Balloons & Dialogue Delivery
 *   7. Cutscene Sequencer (Timeline Runner) Execution
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const REPO_ROOT = path.resolve('.');
const MAP_JSON = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'library/maps/border-march.json'), 'utf8'));

describe('SpriteQuest Cutscene & Stagecraft Engine (TDD)', () => {
  let dom;
  let window;
  let document;
  let viewer;

  before(async () => {
    // Read rendered index.html which contains full inline config, elev, strata, and features
    const htmlPath = path.join(REPO_ROOT, 'renders/maps/border-march/index.html');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(rawHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
    });
    window = dom.window;
    document = window.document;

    // Provide mock 2D canvas context on prototype for both main and offscreen canvases in JSDOM
    window.HTMLCanvasElement.prototype.getContext = function () {
      return {
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
      };
    };

    // Re-initialize viewer with mock canvas
    const scriptMatch = rawHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    window.eval(scriptMatch);
    viewer = window.viewer;
  });

  test('1. Multi-Actor Registration & Visual Tokens', () => {
    assert.ok(typeof viewer.addActor === 'function', 'viewer.addActor must be a function');
    assert.ok(typeof viewer.getActor === 'function', 'viewer.getActor must be a function');

    // Register Hollis (Written Quartermaster) at Mark H (63.0, 69.0)
    const hollis = viewer.addActor('hollis', {
      name: 'Hollis the Twice-Written',
      role: 'Quartermaster',
      x: 63.0,
      y: 69.0,
      color: '#f59e0b',
      written: true,
    });
    assert.equal(hollis.id, 'hollis');
    assert.equal(hollis.written, true);
    assert.equal(hollis.x, 63.0);
    assert.equal(hollis.y, 69.0);
    assert.ok(hollis.tokenEl, 'Hollis must have a visual token element in the DOM');

    // Register Pell (Understudy) downstage outside proscenium (35.0, 45.0)
    const pell = viewer.addActor('pell', {
      name: 'Pell the Underwritten',
      role: 'Understudy',
      x: 35.0,
      y: 45.0,
      color: '#60a5fa',
      written: false,
    });
    assert.equal(pell.id, 'pell');
    assert.equal(pell.written, false);
    assert.ok(pell.tokenEl, 'Pell must have a visual token element in the DOM');

    // Tokens must be rendered in the world container
    const worldEl = document.getElementById('world');
    assert.ok(worldEl.querySelector('.actor-token[data-actor-id="hollis"]'));
    assert.ok(worldEl.querySelector('.actor-token[data-actor-id="pell"]'));
  });

  test('2. Actor Movement & Elevation Sampling Along Path', async () => {
    assert.ok(typeof viewer.moveActor === 'function', 'viewer.moveActor must be a function');

    // Move Pell from (35.0, 45.0) to (48.0, 59.0) (Mark S)
    const sampledElevations = [];
    const moveResult = await viewer.moveActor('pell', 48.0, 59.0, {
      durationMs: 50,
      stepCallback: (actor) => {
        sampledElevations.push(actor.z);
      },
    });

    assert.equal(moveResult.x, 48.0);
    assert.equal(moveResult.y, 59.0);
    assert.ok(sampledElevations.length > 0, 'Movement must sample elevation at multiple path points');

    // Plateau elevation at Mark S is +6.0m
    assert.ok(Math.abs(moveResult.z - 6.0) < 0.2, `Mark S elevation should be ~6.0m, got ${moveResult.z}`);

    // Pell token position in DOM must match world coordinates
    const pell = viewer.getActor('pell');
    assert.equal(pell.x, 48.0);
    assert.equal(pell.y, 59.0);
  });

  test('3. Dynamic Line-of-Sight (LOS) & Fog Unveiling on Movement', async () => {
    // Reset explored grid
    const exploredBefore = viewer.getExploredGrid();
    let exploredCountBefore = 0;
    for (let i = 0; i < exploredBefore.length; i++) {
      if (exploredBefore[i] === 1) exploredCountBefore++;
    }

    // Move player from (35, 65) deep into customs house at (55, 75)
    await viewer.moveActor('player', 55.0, 75.0, { durationMs: 50 });

    const exploredAfter = viewer.getExploredGrid();
    let exploredCountAfter = 0;
    for (let i = 0; i < exploredAfter.length; i++) {
      if (exploredAfter[i] === 1) exploredCountAfter++;
    }

    assert.ok(
      exploredCountAfter > exploredCountBefore,
      `Moving into customs house must uncover new cells: before=${exploredCountBefore}, after=${exploredCountAfter}`
    );
  });

  test('4. Stagecraft Cue Mark Capture & Hollis Ledger Standing Gates', () => {
    // Evaluate Pell at Mark S (48.0, 59.0)
    const pellAnchor = viewer.getSemanticAnchor(48.0, 59.0, false);
    assert.equal(pellAnchor.proscenium_state, 'on_stage');
    assert.ok(pellAnchor.anchored_cue_mark, 'Pell at (48, 59) must be anchored to cue mark');
    assert.equal(pellAnchor.anchored_cue_mark.id, 'mark_supplicant');
    assert.equal(pellAnchor.anchored_cue_mark.standing_verdict, 'authorized');

    // Evaluate Pell at Mark H (63.0, 69.0) -> Unwritten usurpation!
    const pellAtHollisMark = viewer.getSemanticAnchor(63.0, 69.0, false);
    assert.equal(pellAtHollisMark.anchored_cue_mark.id, 'mark_hollis');
    assert.equal(pellAtHollisMark.anchored_cue_mark.standing_verdict, 'unwritten_usurpation');

    // Evaluate Hollis at Mark H (63.0, 69.0) -> Authorized authority at dais
    const hollisAnchor = viewer.getSemanticAnchor(63.0, 69.0, true);
    assert.equal(hollisAnchor.anchored_cue_mark.id, 'mark_hollis');
    assert.equal(hollisAnchor.anchored_cue_mark.standing_verdict, 'authorized');
    assert.equal(hollisAnchor.status_differential, 'authority_at_dais');
  });

  test('5. Physical Weight & Scale Affordance Interaction', () => {
    assert.ok(typeof viewer.executeAffordance === 'function', 'viewer.executeAffordance must be a function');

    // Pell is at Mark S (48.0, 59.0), near weigh table (48.0, 63.0)
    const result = viewer.executeAffordance('pell', 'at-weigh-scale', 'weigh_cargo', {
      weightKg: 42.5,
    });

    assert.equal(result.success, true);
    assert.equal(result.verb, 'weigh_cargo');
    assert.equal(result.affordanceId, 'at-weigh-scale');
    assert.equal(result.params.weightKg, 42.5);
    assert.ok(result.stage_beat.includes('zinc weigh pan'), 'Should return authentic stagecraft beat description');

    // Prop state on weigh scale should reflect cargo weight
    const scaleProp = viewer.getPropState('weigh_table');
    assert.ok(scaleProp, 'weigh_table prop state must exist');
    assert.equal(scaleProp.weightKg, 42.5);
    assert.ok(scaleProp.balanceAngleDeg !== 0, 'Scale balance pan must tilt when cargo is weighed');
  });

  test('6. Theatrical Speech Balloons & Dialogue Delivery', async () => {
    assert.ok(typeof viewer.speak === 'function', 'viewer.speak must be a function');

    const bubblePromise = viewer.speak('pell', 'I present forty-two stone on the balance.', {
      durationMs: 80,
    });

    // Check DOM for speech bubble attached to Pell
    const pell = viewer.getActor('pell');
    const bubbleEl = pell.tokenEl.querySelector('.actor-speech-bubble');
    assert.ok(bubbleEl, 'Speech bubble element must be spawned inside actor token');
    assert.ok(bubbleEl.textContent.includes('forty-two stone'));

    await bubblePromise;
    // Bubble should be cleaned up or hidden after duration
    assert.ok(!bubbleEl.classList.contains('visible') || bubbleEl.style.display === 'none' || !bubbleEl.parentElement);
  });

  test('7. Cutscene Sequencer (Timeline Runner) Execution', async () => {
    assert.ok(typeof viewer.playCutscene === 'function', 'viewer.playCutscene must be a function');

    const testScript = {
      id: 'border-clearance-test',
      title: 'Act I: The Clearance at the Border March',
      beats: [
        { type: 'camera', vantage: 'macro_exploration' },
        { type: 'move', actor: 'pell', to: [48.0, 59.0], durationMs: 40 },
        { type: 'cue_check', actor: 'pell', expectedMark: 'mark_supplicant', expectedVerdict: 'authorized' },
        { type: 'camera', vantage: 'cam_proscenium_dialogue' },
        { type: 'affordance', actor: 'pell', affordance: 'at-weigh-scale', verb: 'weigh_cargo', params: { weightKg: 42.5 } },
        { type: 'speak', actor: 'pell', text: 'Quartermaster! Forty-two stone on the balance.', durationMs: 40 },
        { type: 'camera', vantage: 'cam_hollis_over_shoulder' },
        { type: 'affordance', actor: 'hollis', affordance: 'at-quartermaster-desk', verb: 'strike_seal' },
        { type: 'speak', actor: 'hollis', text: 'I strike a provisional clearance mark.', durationMs: 40 },
      ],
    };

    const executionLog = await viewer.playCutscene(testScript, { speedMultiplier: 10.0 });
    assert.ok(Array.isArray(executionLog), 'Execution log must be an array of completed beats');
    assert.equal(executionLog.length, testScript.beats.length, 'All cutscene beats must execute');

    // Verify individual beat outcomes
    const cueBeat = executionLog.find((b) => b.type === 'cue_check');
    assert.equal(cueBeat.status, 'pass');
    assert.equal(cueBeat.markId, 'mark_supplicant');

    const affordanceBeat = executionLog.find((b) => b.verb === 'weigh_cargo');
    assert.equal(affordanceBeat.status, 'executed');
    assert.equal(affordanceBeat.params.weightKg, 42.5);

    const sealBeat = executionLog.find((b) => b.verb === 'strike_seal');
    assert.equal(sealBeat.status, 'executed');
  });
});
