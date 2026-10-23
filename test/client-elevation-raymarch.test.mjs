import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleElevation, computeElevationLOS } from '../companion/web/elevation_raymarch.js';

test('sampleElevation handles flat ground and bilinear interpolation', () => {
  const rows = 10;
  const cols = 10;
  const stepM = 1.0;
  const elev = Array.from({ length: rows }, () => new Float32Array(cols).fill(5.0));

  assert.equal(sampleElevation(elev, rows, cols, stepM, 4.5, 4.5), 5.0);
});

test('computeElevationLOS: wall occludes ground behind it', () => {
  const rows = 21;
  const cols = 51;
  const stepM = 1.0;
  const elev = Array.from({ length: rows }, () => new Float32Array(cols).fill(0.0));

  // 10m ridge wall at x in [20..22]
  for (let r = 0; r < rows; r++) {
    for (let c = 20; c <= 22; c++) {
      elev[r][c] = 10.0;
    }
  }

  // Player at (5m, 10m) with eye at 1.7m
  const los = computeElevationLOS(elev, rows, cols, stepM, 5.0, 10.0, 1.7, 45.0);

  // 1. In front of wall: visible
  const idxFront = 10 * cols + 15;
  assert.ok(los[idxFront] > 0.5, 'Front of wall should be visible');

  // 2. Facing surface of wall: visible
  const idxWall = 10 * cols + 20;
  assert.ok(los[idxWall] > 0.5, 'Facing wall surface should be visible');

  // 3. Ground behind wall (x in 23..40): MUST BE OCCLUDED (0.0)
  for (let x = 23; x <= 40; x++) {
    const idxBack = 10 * cols + x;
    assert.equal(
      los[idxBack],
      0.0,
      `Ground at x=${x} behind 10m ridge wall must be occluded (0.0), got ${los[idxBack]}`
    );
  }
});

test('computeElevationLOS: high ground advantage exposes valley below', () => {
  const rows = 21;
  const cols = 51;
  const stepM = 1.0;
  const elev = Array.from({ length: rows }, () => new Float32Array(cols).fill(0.0));

  // 10m ridge wall at x in [20..22]
  for (let r = 0; r < rows; r++) {
    for (let c = 20; c <= 22; c++) {
      elev[r][c] = 10.0;
    }
  }

  // Player standing ON TOP of the ridge at (21m, 10m)
  const los = computeElevationLOS(elev, rows, cols, stepM, 21.0, 10.0, 1.7, 30.0);

  // Both West and East valleys should be visible!
  const idxWest = 10 * cols + 8;
  const idxEast = 10 * cols + 35;

  assert.ok(los[idxWest] > 0.1, 'West valley must be visible from ridge top');
  assert.ok(los[idxEast] > 0.1, 'East valley must be visible from ridge top');
});
