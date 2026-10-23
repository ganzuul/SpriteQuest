/**
 * test/test_collision_and_fragments.test.mjs
 *
 * TDD Test Suite for Fragment Placement, Collision, and Object Physicality:
 *   1. Fragment-to-Asset Derivation (Semantic Salience, Bounds, Physical Mass)
 *   2. Wall Navigation Collision (Blocks player except through open portals)
 *   3. Solid Furniture Impassability (Prevents walking through heavy desks/tables)
 *   4. Object Physicality & Push Mechanics (Pushes objects lighter than player strength)
 *   5. Weigh Scale Physical Response (Weighs pushed cargo on the balance pan)
 *   6. Visually Meaningful Fragment DOM Rendering
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const REPO_ROOT = path.resolve('.');

describe('Fragment Assets, Navigation Collision & Physicality (TDD)', () => {
  let dom;
  let window;
  let document;
  let viewer;

  before(async () => {
    // Generate fresh preview HTML
    const htmlPath = path.join(REPO_ROOT, 'renders/maps/border-march/index.html');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(rawHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
    });
    window = dom.window;
    document = window.document;

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

    const scriptMatch = rawHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    window.eval(scriptMatch);
    viewer = window.viewer;
  });

  test('1. Fragment-to-Asset Derivation & Physical Specs', () => {
    assert.ok(typeof viewer.getPhysicalProps === 'function', 'viewer.getPhysicalProps must be a function');
    const physicalProps = viewer.getPhysicalProps();
    assert.ok(Array.isArray(physicalProps), 'Physical props must be an array');

    // 1.1 R6 SHIP Crate derived from library/fragments/customs-house/r6-ship.json
    const r6Crate = physicalProps.find((p) => p.id === 'r6_ship_crate_standard');
    assert.ok(r6Crate, 'R6 SHIP crate must be derived and placed in the scene');
    assert.equal(r6Crate.fragment_id, 'customs-house/r6-ship');
    assert.equal(r6Crate.salience, 'major');
    assert.equal(r6Crate.obstacle_type, 'physics_object');
    assert.equal(r6Crate.mass_kg, 42.5);
    assert.ok(r6Crate.bounds && r6Crate.bounds.width >= 1.0);

    // 1.2 Hollis Ledger Desk derived from library/fragments/customs-house/hollis-ledger.json
    const desk = physicalProps.find((p) => p.id === 'quartermaster_desk');
    assert.ok(desk, 'Hollis ledger desk must exist');
    assert.equal(desk.obstacle_type, 'solid_furniture');
    assert.ok(desk.mass_kg >= 120.0, 'Desk must be heavy static furniture');

    // 1.3 Inspection Weigh Table & Scale from library/fragments/customs-house/first-clearance-beats.json
    const scale = physicalProps.find((p) => p.id === 'weigh_table');
    assert.ok(scale, 'Weigh table must exist');
    assert.equal(scale.salience, 'major');
  });

  test('2. Wall Navigation Collision Blocks Player Movement', () => {
    // Spawn player in inspection hall at (52.0, 70.0)
    viewer.setActorPosition('player', 52.0, 70.0);

    // Attempt to move north directly through solid wall at x=52.0, y=79.0 -> blocked!
    const blockedMove = viewer.tryMoveActor('player', 52.0, 85.0);
    assert.equal(blockedMove.success, false, 'Movement through solid masonry wall must be blocked');
    assert.ok(blockedMove.actualY < 79.0, 'Player y-coordinate must be stopped before wall');

    // Now attempt to move through open portal at x=61.0, y=79.0 (portal is open) -> succeeds!
    viewer.setActorPosition('player', 61.0, 70.0);
    const portalMove = viewer.tryMoveActor('player', 61.0, 85.0);
    assert.equal(portalMove.success, true, 'Movement through open portal must succeed');
    assert.ok(portalMove.actualY >= 84.0, 'Player must have passed through the open portal');
  });

  test('3. Solid Furniture Impassability', () => {
    // Attempt to walk directly into the quartermaster desk at (63.0, 69.0)
    viewer.setActorPosition('player', 63.0, 66.0); // 3 meters south
    const moveIntoDesk = viewer.tryMoveActor('player', 63.0, 69.0);

    assert.equal(moveIntoDesk.success, false, 'Walking into solid quartermaster desk must be blocked');
    assert.ok(moveIntoDesk.actualY < 68.0, 'Player must be stopped at the front boundary of the desk');
  });

  test('4. Physical Pushing Mechanics (Player Strength vs Prop Mass)', () => {
    // Default player strength is 60.0 kg
    assert.equal(viewer.getPlayerStrength(), 60.0);

    // Locate R6 crate (mass = 42.5 kg). Place it at (46.0, 56.0)
    viewer.setPropPosition('r6_ship_crate_standard', 46.0, 56.0);
    const initialCratePos = viewer.getPropPosition('r6_ship_crate_standard');

    // Position player just behind crate at (46.0, 54.5) and walk north into crate
    viewer.setActorPosition('player', 46.0, 54.5);
    const pushResult = viewer.tryMoveActor('player', 46.0, 57.0);

    // Because crate mass (42.5 kg) <= player strength (60.0 kg), the crate should be pushed forward!
    assert.equal(pushResult.pushedProp, 'r6_ship_crate_standard');
    const newCratePos = viewer.getPropPosition('r6_ship_crate_standard');
    assert.ok(
      newCratePos.y > initialCratePos.y,
      `Crate should be pushed north: initial=${initialCratePos.y}, new=${newCratePos.y}`
    );

    // Now test a heavy object: impounded iron safe (mass = 150 kg > 60 kg strength)
    // Place at distinct test coordinate (50.0, 60.0) so it does not overlap the previously pushed crate
    viewer.setPropPosition('forfeit_wardrobe', 50.0, 60.0);
    viewer.setActorPosition('player', 50.0, 58.5);
    const heavyPush = viewer.tryMoveActor('player', 50.0, 61.0);
    assert.equal(heavyPush.success, false, 'Heavy furniture (150kg) cannot be pushed by 60kg strength');
  });

  test('5. Weigh Scale Physical Response to Pushed Cargo', () => {
    // Push or place the R6 crate (42.5 kg) directly onto the weigh table trigger at (48.0, 63.0)
    viewer.setPropPosition('r6_ship_crate_standard', 48.0, 63.0);
    viewer.evaluatePhysicalInteractions();

    const scaleState = viewer.getPropState('weigh_table');
    assert.ok(scaleState, 'Weigh table state must exist');
    assert.equal(scaleState.weightKg, 42.5, 'Weigh table must register the physical cargo weight');
    assert.ok(scaleState.balanceAngleDeg > 0, 'Balance beam must tilt under cargo weight');
  });

  test('6. Visually Meaningful Fragment DOM Rendering', () => {
    const worldEl = document.getElementById('world');
    assert.ok(worldEl, 'World DOM element must exist');

    // Verify rich visual elements rendered for major fragments
    const crateEl = worldEl.querySelector('.prop-r6-crate');
    assert.ok(crateEl, 'DOM must render custom .prop-r6-crate element for R6 SHIP fragment');
    assert.ok(crateEl.querySelector('.crate-stencil'), 'Crate must render authentic R6 stencil label');

    const scaleEl = worldEl.querySelector('.prop-weigh-scale');
    assert.ok(scaleEl, 'DOM must render .prop-weigh-scale with visual brass pans');

    const deskEl = worldEl.querySelector('.prop-ledger-desk');
    assert.ok(deskEl, 'DOM must render .prop-ledger-desk with open ledger folio');
  });

  test('7. Doorway Navigation & Wall Sliding (No Rubber-Banding)', () => {
    // 1. Move player smoothly through the portal at (61.0, 79.0)
    viewer.setActorPosition('player', 61.0, 78.0);
    const enterPortal = viewer.tryMoveActor('player', 61.0, 80.0);
    assert.equal(enterPortal.success, true, 'Moving through portal must succeed');
    assert.equal(enterPortal.actualY, 80.0);

    // 2. From inside the doorway at (61.0, 80.0), step along/against the wall
    // Wall sliding should cleanly preserve allowed movement without rubber-banding backwards
    const moveAgainstWall = viewer.tryMoveActor('player', 56.0, 80.0);
    assert.ok(moveAgainstWall.actualY >= 79.5, 'Player must not rubber-band back across the doorway threshold');
  });

  test('8. Extended Fragment Derivation (Glass Stasis Coffin, Warrant Pedestal, Unmodelled Slab)', () => {
    const physicalProps = viewer.getPhysicalProps();

    // 8.1 Borosilicate Glass Stasis Coffin from library/fragments/space-vampires/glass-stasis-coffin.json
    const coffin = physicalProps.find((p) => p.id === 'glass_stasis_coffin');
    assert.ok(coffin, 'Glass stasis coffin must be derived and placed in the scene');
    assert.equal(coffin.salience, 'major');
    assert.equal(coffin.destructible, true);
    assert.equal(coffin.mass_kg, 280.0);
    assert.equal(coffin.bounds.depth, 2.3);
    assert.equal(coffin.bounds.width, 0.8);

    // 8.2 Canon Warrant Pedestal from library/fragments/cartographers/canon-warrant.json
    const warrant = physicalProps.find((p) => p.id === 'canon_warrant_pedestal');
    assert.ok(warrant, 'Canon warrant pedestal must be derived');
    assert.equal(warrant.salience, 'moderate');
    assert.equal(warrant.mass_kg, 65.0);

    // 8.3 Unmodelled Placeholder Slab from library/fragments/shared/unmodelled-prop.json
    const placeholder = physicalProps.find((p) => p.id === 'unmodelled_placeholder_slab');
    assert.ok(placeholder, 'Unmodelled placeholder slab must be derived');
    assert.equal(placeholder.salience, 'minor');
    assert.equal(placeholder.mass_kg, 15.0);
    assert.equal(placeholder.visual_template, 'unmodelled_slab');
  });

  test('9. Player Strength Scaling & Dynamic Physical Pushing', () => {
    // Coffin is at (44.0, 84.0) with mass 280.0 kg
    viewer.setPropPosition('glass_stasis_coffin', 44.0, 84.0);
    viewer.setActorPosition('player', 44.0, 82.5);

    // With default player strength 60 kg, pushing 280 kg object must fail
    viewer.setPlayerStrength(60.0);
    assert.equal(viewer.getPlayerStrength(), 60.0);
    const weakPush = viewer.tryMoveActor('player', 44.0, 85.0);
    assert.equal(weakPush.success, false, 'Default strength (60kg) cannot push 280kg stasis coffin');

    // Scale player strength to superhuman 320 kg (via HUD / ability)
    viewer.setPlayerStrength(320.0);
    assert.equal(viewer.getPlayerStrength(), 320.0);
    const strongPush = viewer.tryMoveActor('player', 44.0, 84.5);
    assert.equal(strongPush.pushedProp, 'glass_stasis_coffin', 'Superhuman strength pushes the stasis coffin');

    // Reset player strength back to standard
    viewer.setPlayerStrength(60.0);
  });

  test('10. Impact Smashing Mechanic for Destructible Props', () => {
    // Position glass stasis coffin against a solid obstacle
    viewer.setPropPosition('glass_stasis_coffin', 44.0, 84.0);
    const initialProps = viewer.getPhysicalProps();
    const coffin = initialProps.find((p) => p.id === 'glass_stasis_coffin');
    assert.equal(coffin.is_smashed, false, 'Coffin should start intact');

    // Trigger smashing through direct impact / smashing action
    viewer.smashProp('glass_stasis_coffin');

    const smashedProps = viewer.getPhysicalProps();
    const smashedCoffin = smashedProps.find((p) => p.id === 'glass_stasis_coffin');
    assert.equal(smashedCoffin.is_smashed, true, 'Coffin must be marked as smashed');
    assert.equal(smashedCoffin.obstacle_type, 'passable', 'Smashed debris becomes passable');

    // Check DOM rendering receives .smashed class
    const worldEl = document.getElementById('world');
    const coffinEl = worldEl.querySelector('.prop-glass-coffin');
    assert.ok(coffinEl, 'Glass coffin DOM element must exist');
    assert.ok(coffinEl.classList.contains('smashed'), 'Glass coffin DOM element must have .smashed class');

    // Player should now be able to walk directly through the debris without collision blocking
    viewer.setActorPosition('player', 44.0, 82.5);
    const walkThroughDebris = viewer.tryMoveActor('player', 44.0, 84.5);
    assert.equal(walkThroughDebris.success, true, 'Player can walk across shattered glass debris');
  });
});
