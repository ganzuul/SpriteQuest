/**
 * test/test_enhanced_stagecraft.test.mjs
 *
 * TDD Test Suite for Enhanced 2.5D Stagecraft, Atmospheric Lighting,
 * Particle Physics, Audio Synthesis, and Dynamic Portals:
 *   1. Dynamic 2.5D Isometric Y-Depth Sorting
 *   2. Atmospheric Lighting Engine (Day / Golden Hour / Night / Cryo)
 *   3. Particle Dynamics System (Glass Shatter & Embers)
 *   4. Web Audio Diegetic Sound Synthesizer
 *   5. Interactive Barrier Gate State & Clearance Unlock
 *   6. Additional Fragment-Derived Relics (Statutes & Grimoire)
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const REPO_ROOT = path.resolve('.');

describe('Enhanced Stagecraft & Atmospheric Engine (TDD)', () => {
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

  test('1. Dynamic 2.5D Isometric Y-Depth Sorting', () => {
    assert.ok(typeof viewer.updateDepthSorting === 'function', 'viewer.updateDepthSorting must be exported');

    // Quartermaster desk is located at Y = 69.0m
    const desk = viewer.getPhysicalProps().find((p) => p.id === 'quartermaster_desk');
    assert.ok(desk, 'Desk must exist');

    // Position player north of desk at Y = 67.0m (behind desk)
    viewer.setActorPosition('player', 63.0, 67.0);
    viewer.updateDepthSorting();

    const playerEl = document.getElementById('player');
    assert.ok(playerEl, 'Player DOM element must exist');
    const playerBehindZIndex = parseInt(playerEl.style.zIndex, 10);

    const deskEl = desk.tokenEl || document.querySelector('.prop-ledger-desk');
    assert.ok(deskEl, 'Desk DOM element must exist');
    const deskZIndex = parseInt(deskEl.style.zIndex, 10);

    // Player behind desk should have a lower z-index than the desk
    assert.ok(
      playerBehindZIndex < deskZIndex,
      `Player behind desk must have lower z-index: player=${playerBehindZIndex}, desk=${deskZIndex}`
    );

    // Position player south of desk at Y = 71.0m (in front of desk)
    viewer.setActorPosition('player', 63.0, 71.0);
    viewer.updateDepthSorting();

    const playerInFrontZIndex = parseInt(playerEl.style.zIndex, 10);
    assert.ok(
      playerInFrontZIndex > deskZIndex,
      `Player in front of desk must have higher z-index: player=${playerInFrontZIndex}, desk=${deskZIndex}`
    );
  });

  test('2. Atmospheric Lighting Engine (Day / Golden Hour / Night / Cryo)', () => {
    assert.ok(typeof viewer.setAtmosphereMode === 'function', 'viewer.setAtmosphereMode must be exported');
    assert.ok(typeof viewer.getAtmosphereMode === 'function', 'viewer.getAtmosphereMode must be exported');

    assert.equal(viewer.getAtmosphereMode(), 'day', 'Default atmosphere should be day');

    // Switch to night mode
    viewer.setAtmosphereMode('night');
    assert.equal(viewer.getAtmosphereMode(), 'night');

    const lightingState = viewer.getLightingState();
    assert.ok(lightingState, 'Lighting state must be available');
    assert.ok(lightingState.ambientDarkness > 0.6, 'Night mode must have high ambient darkness');
    assert.ok(Array.isArray(lightingState.pointLights), 'Point lights array must exist');

    // Point lights should include the braziers and cryo-coffin
    const brazierLight = lightingState.pointLights.find((pl) => pl.sourceId.includes('brazier'));
    assert.ok(brazierLight, 'Brazier warm light source must be active');
    assert.equal(brazierLight.color, 'amber');

    // Switch to golden hour
    viewer.setAtmosphereMode('golden_hour');
    assert.equal(viewer.getAtmosphereMode(), 'golden_hour');

    // Reset back to day
    viewer.setAtmosphereMode('day');
  });

  test('3. Particle Dynamics System (Glass Shatter & Embers)', () => {
    assert.ok(typeof viewer.spawnParticles === 'function', 'viewer.spawnParticles must be exported');
    assert.ok(typeof viewer.stepParticles === 'function', 'viewer.stepParticles must be exported');
    assert.ok(typeof viewer.getParticles === 'function', 'viewer.getParticles must be exported');

    // Clear existing particles
    viewer.clearParticles();
    assert.equal(viewer.getParticles().length, 0);

    // Spawn glass shards at (44.0, 84.0)
    viewer.spawnParticles(44.0, 84.0, 16, 'glass_shards');
    const particles = viewer.getParticles();
    assert.equal(particles.length, 16, 'Must spawn 16 glass shard particles');
    assert.equal(particles[0].type, 'glass_shards');
    const initialLife = particles[0].life;
    assert.ok(initialLife > 0.0);

    // Step particles forward by 16ms
    viewer.stepParticles(0.016);
    const stepped = viewer.getParticles();
    assert.ok(stepped[0].life < initialLife, 'Particle life must decay over time');

    // Smashing a destructible prop should automatically trigger particle burst
    viewer.clearParticles();
    viewer.smashProp('glass_stasis_coffin');
    assert.ok(viewer.getParticles().length > 0, 'Smashing coffin must auto-spawn glass shards');
  });

  test('4. Web Audio Diegetic Sound Synthesizer', () => {
    assert.ok(typeof viewer.playAudioCue === 'function', 'viewer.playAudioCue must be exported');
    assert.ok(typeof viewer.setAudioMuted === 'function', 'viewer.setAudioMuted must be exported');
    assert.ok(typeof viewer.isAudioMuted === 'function', 'viewer.isAudioMuted must be exported');

    // Muted by default in headless/test environments
    assert.equal(viewer.isAudioMuted(), true);

    // Verify audio cue triggers safely without thrown exceptions
    assert.doesNotThrow(() => {
      viewer.playAudioCue('footstep');
      viewer.playAudioCue('push');
      viewer.playAudioCue('smash');
      viewer.playAudioCue('seal_stamp');
      viewer.playAudioCue('gate_open');
    });

    viewer.setAudioMuted(false);
    assert.equal(viewer.isAudioMuted(), false);
    viewer.setAudioMuted(true);
  });

  test('5. Interactive Barrier Gate State & Clearance Unlock', () => {
    assert.ok(typeof viewer.setPortalState === 'function', 'viewer.setPortalState must be exported');
    assert.ok(typeof viewer.getPortalState === 'function', 'viewer.getPortalState must be exported');

    const portalId = 'gate-cleared-barrier';
    const initialPortal = viewer.getPortalState(portalId);
    assert.ok(initialPortal, 'Cleared barrier gate portal must exist');

    // Toggle barrier closed
    viewer.setPortalState(portalId, false);
    assert.equal(viewer.getPortalState(portalId).passable, false);

    // Attempt to move through closed barrier gate -> blocked!
    viewer.setActorPosition('player', 61.0, 78.0);
    const moveClosed = viewer.tryMoveActor('player', 61.0, 81.0);
    assert.equal(moveClosed.success, false, 'Closed barrier gate must block player movement');

    // Trigger administrative clearance opening
    viewer.setPortalState(portalId, true);
    assert.equal(viewer.getPortalState(portalId).passable, true);

    // Now movement through open barrier succeeds!
    const moveOpen = viewer.tryMoveActor('player', 61.0, 81.0);
    assert.equal(moveOpen.success, true, 'Opened barrier gate must allow player passage');
    assert.ok(moveOpen.actualY >= 80.5);
  });

  test('6. Extended Fragment Relics (Imperial Statutes & Grimoire Lectern)', () => {
    const props = viewer.getPhysicalProps();

    // 6.1 Imperial Statutes Noticeboard from library/fragments/customs-house/statutes.json
    const statutes = props.find((p) => p.id === 'imperial_statute_board');
    assert.ok(statutes, 'Imperial statute noticeboard must be placed in scene');
    assert.equal(statutes.fragment_id, 'customs-house/statutes');
    assert.equal(statutes.salience, 'moderate');
    assert.ok(statutes.interactive_verbs.includes('read_statutes'));

    // 6.2 Ancient Grimoire on Oak Lectern from library/fragments/wizard-tower/the-grimoire.json
    const grimoire = props.find((p) => p.id === 'ancient_grimoire_lectern');
    assert.ok(grimoire, 'Ancient grimoire lectern must be placed in scene');
    assert.equal(grimoire.fragment_id, 'wizard-tower/the-grimoire');
    assert.equal(grimoire.salience, 'major');
    assert.ok(grimoire.interactive_verbs.includes('consult_arcana'));
  });

  test('7. Monumental Living Atlas, Uninstalled Matte Flat, and Forfeit Chest Derivation & Physicality', () => {
    const props = viewer.getPhysicalProps();

    // 7.1 Monumental Living Atlas (Cartographers Guild certified truth)
    const atlas = props.find((p) => p.id === 'monumental_living_atlas');
    assert.ok(atlas, 'Monumental Living Atlas must be derived and placed');
    assert.equal(atlas.fragment_id, 'cartographers/the-living-atlas');
    assert.equal(atlas.obstacle_type, 'solid_furniture');
    assert.equal(atlas.mass_kg, 450.0);
    assert.ok(atlas.interactive_verbs.includes('inspect_cartography'));

    // 7.2 Uninstalled Primed Matte Flat (Shared seam prop)
    const flat = props.find((p) => p.id === 'uninstalled_matte_flat');
    assert.ok(flat, 'Uninstalled Matte Flat must be derived and placed');
    assert.equal(flat.fragment_id, 'shared/matte-backdrop-uninstalled');
    assert.equal(flat.obstacle_type, 'physics_object');
    assert.equal(flat.mass_kg, 22.0);
    assert.ok(flat.interactive_verbs.includes('unroll_canvas'));

    // Player with default strength (60kg) can push the 22kg flat
    viewer.setPlayerStrength(60.0);
    viewer.setPropPosition('uninstalled_matte_flat', 39.0, 44.0);
    viewer.setActorPosition('player', 39.0, 42.0);
    const pushFlat = viewer.tryMoveActor('player', 39.0, 45.0);
    assert.equal(pushFlat.success, true, 'Player strength 60kg must push 22kg flat');
    const flatPos = viewer.getPropPosition('uninstalled_matte_flat');
    assert.ok(flatPos.y > 44.0, 'Matte flat position must advance when pushed');

    // 7.3 Impounded Forfeit Consignment Chest
    const chest = props.find((p) => p.id === 'impounded_forfeit_chest');
    assert.ok(chest, 'Impounded forfeit chest must be derived and placed');
    assert.equal(chest.fragment_id, 'customs-house/forfeit-corridor');
    assert.equal(chest.obstacle_type, 'physics_object');
    assert.equal(chest.mass_kg, 95.0);

    // Player at base 60kg cannot push 95kg chest
    viewer.setPlayerStrength(60.0);
    viewer.setPropPosition('impounded_forfeit_chest', 56.0, 46.0);
    viewer.setActorPosition('player', 56.0, 44.0);
    const pushFail = viewer.tryMoveActor('player', 56.0, 47.0);
    assert.equal(pushFail.success, false, 'Player at 60kg must not be able to push 95kg chest');

    // Player with boosted strength (100kg) CAN push 95kg chest
    viewer.setPlayerStrength(100.0);
    const pushSuccess = viewer.tryMoveActor('player', 56.0, 47.0);
    assert.equal(pushSuccess.success, true, 'Player at 100kg must successfully push 95kg chest');
  });

  test('8. Diegetic Cutscene Sequence with Gate Clearance, Vantage Swapping, and Audio Cues', async () => {
    // Reset gate to closed
    viewer.setPortalState('gate-cleared-barrier', false);
    assert.equal(viewer.getPortalState('gate-cleared-barrier').passable, false);

    // Execute full cutscene at high speed for rapid testing
    const log = await viewer.playBorderClearanceCutscene({ speedMultiplier: 50.0 });
    assert.ok(Array.isArray(log), 'Cutscene must return execution log');

    // Verify gate beat was executed and opened
    const gateBeat = log.find((b) => b.type === 'portal');
    assert.ok(gateBeat, 'Portal gate beat must be present in cutscene log');
    assert.equal(gateBeat.portalId, 'gate-cleared-barrier');
    assert.equal(gateBeat.state, true);
    assert.equal(viewer.getPortalState('gate-cleared-barrier').passable, true);

    // Verify camera vantage was set to cam_barrier_gate
    const camBeat = log.find((b) => b.vantage === 'cam_barrier_gate');
    assert.ok(camBeat, 'Barrier gate camera vantage beat must be present');

    // Verify Pell successfully moved through open gate to frontier road [61.0, 85.0]
    const pellActor = viewer.getActor('pell');
    assert.ok(pellActor, 'Pell actor must exist');
    assert.ok(Math.abs(pellActor.x - 61.0) < 1.0, `Pell X should be near 61.0, got ${pellActor.x}`);
    assert.ok(pellActor.y >= 84.0, `Pell Y should have advanced past gate to >= 84.0, got ${pellActor.y}`);
  });

  test('9. Standing-Scaled Physical Resistance & Cartographer Cutscene Beats', async () => {
    // 9.1 Prop Standing Gate on Affordance Execution
    // By default, monumental_living_atlas has verified standing (0.65), below 'warranted' (0.90)
    viewer.setActorPosition('player', 66.0, 64.0);
    const affordanceBefore = viewer.executeAffordance('player', 'at-living-atlas', 'inspect_cartography');
    assert.equal(affordanceBefore.success, false, 'Unwarranted living atlas must refuse cartography affordance');
    assert.equal(affordanceBefore.status, 'prop_standing_refused');

    // Curate the living atlas -> promotes standing to WARRANTED (0.90)
    viewer.curateAssetFragment('monumental_living_atlas');
    const affordanceAfter = viewer.executeAffordance('player', 'at-living-atlas', 'inspect_cartography');
    assert.equal(affordanceAfter.success, true, 'Warranted living atlas must allow cartography affordance');

    // 9.2 Cartographer Survey Cutscene Beat
    const customScript = {
      id: 'cartographer-survey-scene',
      title: 'Cartographer Epistemic Survey',
      beats: [
        { type: 'cartographer_survey', propId: 'monumental_living_atlas', actor: 'hollis', durationMs: 100 },
      ],
    };
    const cutsceneLog = await viewer.playCutscene(customScript, { speedMultiplier: 50.0 });
    const surveyBeat = cutsceneLog.find((b) => b.type === 'cartographer_survey');
    assert.ok(surveyBeat, 'Cartographer survey beat must be executed');
    assert.equal(surveyBeat.status, 'surveyed');
    assert.equal(surveyBeat.standing_tier, 'warranted');
    assert.ok(surveyBeat.dialogue.includes('warranted') || surveyBeat.dialogue.includes('Warrant'));
  });
});
