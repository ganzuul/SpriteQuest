/**
 * companion/web/elevation_raymarch.js
 *
 * Client-side Elevation-Aware Line-of-Sight (LOS) Raymarcher.
 * Computes exact geometric terrain shadows and Line-of-Sight visibility.
 */

/**
 * Sample elevation at continuous world coordinates (x, y) with bilinear interpolation.
 * @param {Float32Array|number[][]} elev
 * @param {number} rows
 * @param {number} cols
 * @param {number} stepM
 * @param {number} xm
 * @param {number} ym
 * @returns {number}
 */
export function sampleElevation(elev, rows, cols, stepM, xm, ym) {
  const fx = xm / stepM;
  const fy = ym / stepM;

  const c0 = Math.max(0, Math.min(cols - 1, Math.floor(fx)));
  const c1 = Math.max(0, Math.min(cols - 1, c0 + 1));
  const r0 = Math.max(0, Math.min(rows - 1, Math.floor(fy)));
  const r1 = Math.max(0, Math.min(rows - 1, r0 + 1));

  const tx = fx - c0;
  const ty = fy - r0;

  const h00 = elev[r0][c0];
  const h01 = elev[r0][c1];
  const h10 = elev[r1][c0];
  const h11 = elev[r1][c1];

  const h0 = h00 * (1 - tx) + h01 * tx;
  const h1 = h10 * (1 - tx) + h11 * tx;
  return h0 * (1 - ty) + h1 * ty;
}

/**
 * Compute elevation-aware Line-of-Sight mask for a player character.
 * @param {number[][]} elev - Elevation grid [rows][cols] in metres.
 * @param {number} rows
 * @param {number} cols
 * @param {number} stepM - Grid step in metres.
 * @param {number} playerX - Player X coordinate in metres.
 * @param {number} playerY - Player Y coordinate in metres.
 * @param {number} eyeHeightM - Player eye height above ground (e.g. 1.7m).
 * @param {number} viewRadiusM - Max sightline distance (e.g. 40.0m).
 * @returns {Float32Array} 1D array of size rows*cols in [0.0..1.0] where 1.0=visible, 0.0=occluded.
 */
export function computeElevationLOS(elev, rows, cols, stepM, playerX, playerY, eyeHeightM = 1.7, viewRadiusM = 40.0) {
  const los = new Float32Array(rows * cols);
  const pGroundZ = sampleElevation(elev, rows, cols, stepM, playerX, playerY);
  const eyeZ = pGroundZ + eyeHeightM;

  const cp = Math.round(playerX / stepM);
  const rp = Math.round(playerY / stepM);

  const radCells = Math.ceil(viewRadiusM / stepM);
  const r0 = Math.max(0, rp - radCells);
  const r1 = Math.min(rows - 1, rp + radCells);
  const c0 = Math.max(0, cp - radCells);
  const c1 = Math.min(cols - 1, cp + radCells);

  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const wx = c * stepM;
      const wy = r * stepM;
      const dx = wx - playerX;
      const dy = wy - playerY;
      const dist2D = Math.hypot(dx, dy);

      if (dist2D > viewRadiusM) continue;

      const idx = r * cols + c;

      if (dist2D < 0.5) {
        los[idx] = 1.0;
        continue;
      }

      const targetZ = elev[r][c];
      const steps = Math.max(Math.floor(dist2D / (stepM * 0.75)), 2);
      let blocked = false;

      // March ray from eye to target point
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        const testX = playerX + dx * t;
        const testY = playerY + dy * t;
        const rayZ = eyeZ + (targetZ - eyeZ) * t;

        const terrainZ = sampleElevation(elev, rows, cols, stepM, testX, testY);
        if (terrainZ > rayZ + 0.10) {
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        // Clear daylight visibility across open terrain, with soft feather at the outer horizon
        const featherRadiusM = viewRadiusM * 0.85;
        if (dist2D <= featherRadiusM) {
          los[idx] = 1.0;
        } else {
          const frac = (dist2D - featherRadiusM) / (viewRadiusM - featherRadiusM);
          los[idx] = 1.0 - frac * frac;
        }
      }
    }
  }

  return los;
}
