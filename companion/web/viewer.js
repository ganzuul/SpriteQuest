/**
 * companion/web/viewer.js
 *
 * SpriteQuest 2.5D Topological Parallax Engine & Depth Probe Viewer.
 *
 * Implements:
 *   - Player-centric CSS 3D perspective tracking
 *   - 3-state Fog of War (Active daylight LOS, Explored memory, Unexplored shroud)
 *   - Elevation-aware Line-of-Sight occlusion raymarcher
 *   - Interactive Cursor Depth Probe with slope & elevation telemetry
 *   - Smooth WASD, Arrow keys, and click-to-move controls
 */

export function initViewer(config) {
  const {
    mapWidthM,
    mapLengthM,
    cols,
    rows,
    elev,
    strata,
    initialPlayerX,
    initialPlayerY,
    features,
    dom,
  } = config;

  const zones = features?.zones || [];
  const walls = features?.walls || [];
  const portals = features?.portals || [];
  const props = features?.props || [];
  const stagecraft = features?.stagecraft || {};
  const prosceniumLine = stagecraft.proscenium_line || null;
  const playingAreas = stagecraft.playing_areas || [];
  const cueMarks = stagecraft.cue_marks || [];
  const affordanceTemplates = stagecraft.affordance_templates || [];
  let actorWritten = Boolean(config.actorWritten);

  const viewport = dom?.viewport || document.getElementById('viewport');
  const world = dom?.world || document.getElementById('world');
  const playerEl = dom?.player || document.getElementById('player');
  const probeEl = dom?.probe || document.getElementById('probe');
  const tooltipEl = dom?.tooltip || (typeof document !== 'undefined' ? document.getElementById('cursor-tooltip') : null);
  const featuresEl = dom?.features || (typeof document !== 'undefined' ? document.getElementById('features') : null);
  const canvas = dom?.canvas || (typeof document !== 'undefined' ? document.getElementById('lighting-canvas') : null);
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  let playerX = initialPlayerX;
  let playerY = initialPlayerY;
  let cursorX = null;
  let cursorY = null;

  // Persistent fog-of-war explored memory grid: 0 = unrevealed, 1 = explored
  const explored = new Uint8Array(rows * cols);

  // Multi-actor registry and physical prop state
  const actors = new Map();
  const propStates = new Map();
  const physicalPropsList = features?.physical_props || [];
  const physicalPropsMap = new Map();
  let playerStrength = 60.0;

  // Initialize physical props from fragments
  physicalPropsList.forEach((fp) => {
    physicalPropsMap.set(fp.id, {
      ...fp,
      tokenEl: null,
    });
  });

  // Fallback for props not in physicalProps
  props.forEach((p) => {
    if (!physicalPropsMap.has(p.id)) {
      const isSolid =
        p.id.includes('desk') ||
        p.id.includes('table') ||
        p.id.includes('bookcase') ||
        p.id.includes('wardrobe') ||
        p.id.includes('cairn');
      physicalPropsMap.set(p.id, {
        id: p.id,
        fragment_id: 'floorplan/customs-house',
        label: p.label,
        salience: 'minor',
        obstacle_type: isSolid ? 'solid_furniture' : 'passable',
        mass_kg: isSolid ? 100.0 : 15.0,
        world_x: p.world_x,
        world_y: p.world_y,
        world_z: p.world_z || 6.0,
        bounds: { width: 1.2, depth: 1.2, height: 1.0 },
        visual_template: 'generic',
        interactive_verbs: [],
        tokenEl: null,
      });
    }
  });

  // Populate propStates
  physicalPropsMap.forEach((p, id) => {
    propStates.set(id, {
      id,
      label: p.label,
      world_x: p.world_x,
      world_y: p.world_y,
      weightKg: 0,
      balanceAngleDeg: 0,
    });
  });

  // Offscreen buffer for fast pixel-grid raymarching
  const offCanvas = dom?.offCanvas || (typeof document !== 'undefined' ? document.createElement('canvas') : null);
  if (offCanvas) {
    offCanvas.width = cols;
    offCanvas.height = rows;
  }
  const offCtx = offCanvas ? offCanvas.getContext('2d') : null;
  const imgData = offCtx ? offCtx.createImageData(cols, rows) : null;

  // Populate Strata HUD list
  const strataListEl = dom?.strataList || (typeof document !== 'undefined' ? document.getElementById('strata-list') : null);
  if (strataListEl && strataListEl.appendChild && strata) {
    strataListEl.innerHTML = '';
    strata.forEach((s) => {
      const div = document.createElement('div');
      div.className = 'stat-row';
      div.innerHTML = `<span>${s.name}:</span><span class="stat-val">+${s.css_z}px (${s.z_min}-${s.z_max}m)</span>`;
      strataListEl.appendChild(div);
    });
  }

  function sampleElevation(xm, ym) {
    const fx = (xm / mapWidthM) * (cols - 1);
    const fy = (ym / mapLengthM) * (rows - 1);
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

  function getSlope(xm, ym) {
    const c = Math.max(1, Math.min(cols - 2, Math.round((xm / mapWidthM) * (cols - 1))));
    const r = Math.max(1, Math.min(rows - 2, Math.round((ym / mapLengthM) * (rows - 1))));
    const cellW = mapWidthM / cols;
    const cellL = mapLengthM / rows;
    const gx = (elev[r][c + 1] - elev[r][c - 1]) / (2 * cellW);
    const gy = (elev[r + 1][c] - elev[r - 1][c]) / (2 * cellL);
    const grad = Math.hypot(gx, gy);
    return Math.round(Math.atan(grad) * (180 / Math.PI));
  }

  function getZoneAt(xm, ym) {
    for (const z of zones) {
      if (
        xm >= z.bounds.x_min &&
        xm <= z.bounds.x_max &&
        ym >= z.bounds.y_min &&
        ym <= z.bounds.y_max
      ) {
        return z;
      }
    }
    return null;
  }

  function segmentIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (Math.abs(denom) < 1e-7) return null;
    const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
    const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) };
    }
    return null;
  }

  function isSightlineBlockedByWall(x1, y1, x2, y2) {
    for (const w of walls) {
      const hit = segmentIntersect(x1, y1, x2, y2, w.start[0], w.start[1], w.end[0], w.end[1]);
      if (hit) {
        let throughPortal = false;
        for (const p of portals) {
          if (!p.passable) continue;
          const distToPortal = Math.hypot(hit.x - p.world_x, hit.y - p.world_y);
          if (distToPortal <= p.width / 2.0 + 0.15) {
            throughPortal = true;
            break;
          }
        }
        if (!throughPortal) return true;
      }
    }
    return false;
  }

  function renderFeaturesDOM() {
    if (!featuresEl || !world || !featuresEl.appendChild) return;
    featuresEl.innerHTML = '';

    const worldW = world.clientWidth || 600;
    const worldH = world.clientHeight || 700;

    // 1. Render Zones
    zones.forEach((z) => {
      const box = document.createElement('div');
      box.className = 'scene-zone-box';
      const leftPx = (z.bounds.x_min / mapWidthM) * worldW;
      const topPx = (z.bounds.y_min / mapLengthM) * worldH;
      const widthPx = ((z.bounds.x_max - z.bounds.x_min) / mapWidthM) * worldW;
      const heightPx = ((z.bounds.y_max - z.bounds.y_min) / mapLengthM) * worldH;

      box.style.left = `${leftPx}px`;
      box.style.top = `${topPx}px`;
      box.style.width = `${widthPx}px`;
      box.style.height = `${heightPx}px`;

      const lbl = document.createElement('div');
      lbl.className = 'scene-zone-label';
      lbl.innerText = z.name;
      box.appendChild(lbl);

      featuresEl.appendChild(box);
    });

    // 2. Render Walls
    walls.forEach((w) => {
      const x1 = (w.start[0] / mapWidthM) * worldW;
      const y1 = (w.start[1] / mapLengthM) * worldH;
      const x2 = (w.end[0] / mapWidthM) * worldW;
      const y2 = (w.end[1] / mapLengthM) * worldH;

      const length = Math.hypot(x2 - x1, y2 - y1);
      const angleRad = Math.atan2(y2 - y1, x2 - x1);
      const angleDeg = angleRad * (180 / Math.PI);
      const thickPx = Math.max(3, (w.thickness / mapWidthM) * worldW);

      const wallEl = document.createElement('div');
      wallEl.className = 'scene-wall-line';
      wallEl.style.left = `${x1}px`;
      wallEl.style.top = `${y1}px`;
      wallEl.style.width = `${length}px`;
      wallEl.style.height = `${thickPx}px`;
      wallEl.style.transform = `translate(0, -${thickPx / 2}px) rotate(${angleDeg}deg)`;
      featuresEl.appendChild(wallEl);
    });

    // 3. Render Portals
    portals.forEach((p) => {
      const pxX = (p.world_x / mapWidthM) * worldW;
      const pxY = (p.world_y / mapLengthM) * worldH;
      const widthPx = Math.max(12, (p.width / mapWidthM) * worldW);

      const portalEl = document.createElement('div');
      portalEl.className = 'scene-portal-marker';
      portalEl.style.left = `${pxX}px`;
      portalEl.style.top = `${pxY}px`;
      portalEl.style.width = `${widthPx}px`;
      portalEl.style.height = '6px';
      featuresEl.appendChild(portalEl);
    });

    // 4. Render Physical & Fragment Props
    physicalPropsMap.forEach((pr) => {
      const pxX = (pr.world_x / mapWidthM) * worldW;
      const pxY = (pr.world_y / mapLengthM) * worldH;

      const propEl = document.createElement('div');
      if (propEl.dataset) propEl.dataset.propId = pr.id;
      propEl.style.left = `${pxX}px`;
      propEl.style.top = `${pxY}px`;
      pr.tokenEl = propEl;

      if (pr.visual_template === 'r6_crate') {
        propEl.className = 'prop-r6-crate scene-prop-token';
        const box = document.createElement('div');
        box.className = 'crate-box';
        const stencil = document.createElement('div');
        stencil.className = 'crate-stencil';
        stencil.textContent = 'R6-SHIP';
        const band = document.createElement('div');
        band.className = 'crate-band';
        const mass = document.createElement('div');
        mass.className = 'crate-mass';
        mass.textContent = `${pr.mass_kg}kg`;
        box.appendChild(stencil);
        box.appendChild(band);
        box.appendChild(mass);
        propEl.appendChild(box);
      } else if (pr.visual_template === 'weigh_scale') {
        propEl.className = 'prop-weigh-scale scene-prop-token';
        const base = document.createElement('div');
        base.className = 'scale-base';
        const beam = document.createElement('div');
        beam.className = 'scale-beam';
        const lPan = document.createElement('div');
        lPan.className = 'scale-pan left-pan';
        const rPan = document.createElement('div');
        rPan.className = 'scale-pan right-pan';
        beam.appendChild(lPan);
        beam.appendChild(rPan);
        const lbl = document.createElement('div');
        lbl.className = 'scale-label';
        lbl.textContent = '1588 Standard';
        base.appendChild(beam);
        base.appendChild(lbl);
        propEl.appendChild(base);
      } else if (pr.visual_template === 'ledger_desk') {
        propEl.className = 'prop-ledger-desk scene-prop-token';
        const surface = document.createElement('div');
        surface.className = 'desk-surface';
        const folio = document.createElement('div');
        folio.className = 'ledger-folio';
        const col1 = document.createElement('div');
        col1.className = 'folio-col left-col';
        const col2 = document.createElement('div');
        col2.className = 'folio-col right-col';
        folio.appendChild(col1);
        folio.appendChild(col2);
        const quill = document.createElement('div');
        quill.className = 'desk-quill';
        quill.textContent = '✒️';
        surface.appendChild(folio);
        surface.appendChild(quill);
        propEl.appendChild(surface);
      } else if (pr.visual_template === 'glass_coffin') {
        propEl.className = 'prop-glass-coffin scene-prop-token' + (pr.is_smashed ? ' smashed' : '');
        const hex = document.createElement('div');
        hex.className = 'coffin-hex-chassis';
        const chamber = document.createElement('div');
        chamber.className = 'coffin-cryo-chamber';
        const figure = document.createElement('div');
        figure.className = 'coffin-sleeper';
        const digits = document.createElement('div');
        digits.className = 'coffin-cycle-counter';
        digits.textContent = '00:04:18:92';
        chamber.appendChild(figure);
        chamber.appendChild(digits);
        hex.appendChild(chamber);
        propEl.appendChild(hex);
      } else if (pr.visual_template === 'warrant_pedestal') {
        propEl.className = 'prop-warrant-pedestal scene-prop-token';
        const ped = document.createElement('div');
        ped.className = 'pedestal-stone';
        const disc = document.createElement('div');
        disc.className = 'warrant-brass-disc';
        disc.textContent = 'SEAL';
        const ribbon = document.createElement('div');
        ribbon.className = 'warrant-ribbon';
        ped.appendChild(disc);
        ped.appendChild(ribbon);
        propEl.appendChild(ped);
      } else if (pr.visual_template === 'unmodelled_slab') {
        propEl.className = 'prop-unmodelled-slab scene-prop-token';
        const slab = document.createElement('div');
        slab.className = 'unmodelled-clay-box';
        const promptLabel = document.createElement('div');
        promptLabel.className = 'unmodelled-wireframe-label';
        promptLabel.textContent = '[Prompt Awaiting]';
        slab.appendChild(promptLabel);
        propEl.appendChild(slab);
      } else {
        propEl.className = 'scene-prop-token';
        const icon = document.createElement('div');
        icon.className = 'prop-icon';
        let symbol = '📦';
        if (pr.id.includes('chair') || pr.id.includes('bench')) symbol = '🪑';
        else if (pr.id.includes('signpost')) symbol = '🪧';
        else if (pr.id.includes('brazier')) symbol = '🔥';
        else if (pr.id.includes('cairn') || pr.id.includes('altar')) symbol = '🗿';
        else if (pr.id.includes('bookcase') || pr.id.includes('cabinet') || pr.id.includes('wardrobe')) symbol = '📚';
        icon.textContent = symbol;
        propEl.appendChild(icon);
      }

      const tag = document.createElement('div');
      tag.className = 'prop-tag';
      tag.textContent = pr.label;
      propEl.appendChild(tag);

      propEl.addEventListener('click', (e) => {
        if (e.stopPropagation) e.stopPropagation();
        tryMoveActor('player', pr.world_x, pr.world_y);
      });

      featuresEl.appendChild(propEl);
    });

    // 5. Render Stagecraft Proscenium Line
    if (prosceniumLine) {
      const x1 = (prosceniumLine.start[0] / mapWidthM) * worldW;
      const y1 = (prosceniumLine.start[1] / mapLengthM) * worldH;
      const x2 = (prosceniumLine.end[0] / mapWidthM) * worldW;
      const y2 = (prosceniumLine.end[1] / mapLengthM) * worldH;
      const length = Math.hypot(x2 - x1, y2 - y1);
      const angleDeg = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

      const pLine = document.createElement('div');
      pLine.className = 'stagecraft-proscenium-line';
      pLine.style.left = `${x1}px`;
      pLine.style.top = `${y1}px`;
      pLine.style.width = `${length}px`;
      pLine.style.transform = `translate(0, -1px) rotate(${angleDeg}deg)`;

      const pLbl = document.createElement('div');
      pLbl.className = 'stagecraft-proscenium-label';
      pLbl.innerText = 'PROSCENIUM THRESHOLD';
      pLine.appendChild(pLbl);
      featuresEl.appendChild(pLine);
    }

    // 6. Render Stagecraft Playing Areas
    playingAreas.forEach((pa) => {
      const pxX = (pa.world_x / mapWidthM) * worldW;
      const pxY = (pa.world_y / mapLengthM) * worldH;
      const diamW = ((pa.radius * 2) / mapWidthM) * worldW;
      const diamH = ((pa.radius * 2) / mapLengthM) * worldH;

      const ringEl = document.createElement('div');
      ringEl.className = 'stagecraft-playing-ring';
      ringEl.style.left = `${pxX}px`;
      ringEl.style.top = `${pxY}px`;
      ringEl.style.width = `${diamW}px`;
      ringEl.style.height = `${diamH}px`;
      featuresEl.appendChild(ringEl);
    });

    // 7. Render Stagecraft Actor Cue Marks
    cueMarks.forEach((cm) => {
      const pxX = (cm.world_x / mapWidthM) * worldW;
      const pxY = (cm.world_y / mapLengthM) * worldH;

      const cmEl = document.createElement('div');
      cmEl.className = 'stagecraft-cue-mark';
      if (cmEl.dataset) cmEl.dataset.cueId = cm.id;
      cmEl.style.left = `${pxX}px`;
      cmEl.style.top = `${pxY}px`;

      const star = document.createElement('div');
      star.className = 'cue-mark-star';
      star.innerText = '★';

      const lbl = document.createElement('div');
      lbl.className = 'cue-mark-label';
      lbl.innerText = cm.label;

      cmEl.appendChild(star);
      cmEl.appendChild(lbl);

      cmEl.addEventListener('click', (e) => {
        if (e.stopPropagation) e.stopPropagation();
        updatePlayerPosition(cm.world_x, cm.world_y);
      });

      featuresEl.appendChild(cmEl);
    });
  }

  function getSemanticAnchor(xm = playerX, ym = playerY, written = actorWritten) {
    let z = sampleElevation(xm, ym);
    const zone = getZoneAt(xm, ym);
    if (zone && typeof zone.elevation === 'number') {
      z = Math.max(z, zone.elevation);
    }

    let prosceniumState = 'wilderness';
    if (prosceniumLine) {
      const pxMin = Math.min(prosceniumLine.start[0], prosceniumLine.end[0]);
      const pxMax = Math.max(prosceniumLine.start[0], prosceniumLine.end[0]);
      const pyLine = prosceniumLine.start[1];
      if (xm >= pxMin && xm <= pxMax && ym >= pyLine && ym <= 95.0) {
        prosceniumState = 'on_stage';
      } else if (zone && ym < pyLine) {
        prosceniumState = 'apron_threshold';
      }
    }

    let activePa = null;
    let bestPaDist = Infinity;
    for (const pa of playingAreas) {
      const d = Math.hypot(xm - pa.world_x, ym - pa.world_y);
      if (d <= pa.radius + 1.5 && d < bestPaDist) {
        bestPaDist = d;
        activePa = {
          id: pa.id,
          label: pa.blocking_label,
          distance_m: Number(d.toFixed(2)),
        };
      }
    }

    let anchoredCm = null;
    let bestCmDist = Infinity;
    for (const cm of cueMarks) {
      const d = Math.hypot(xm - cm.world_x, ym - cm.world_y);
      const capRad = cm.capture_radius_m || 3.5;
      if (d <= capRad && d < bestCmDist) {
        bestCmDist = d;
        const verdict =
          cm.required_standing === 'written' && !written
            ? 'unwritten_usurpation'
            : 'authorized';
        anchoredCm = {
          id: cm.id,
          label: cm.label,
          facing: cm.facing,
          distance_m: Number(d.toFixed(2)),
          required_standing: cm.required_standing,
          standing_verdict: verdict,
        };
      }
    }

    let statusDiff = 'roving_observer';
    let camVantage = 'macro_exploration';
    if (anchoredCm && anchoredCm.id === 'mark_hollis') {
      statusDiff =
        anchoredCm.standing_verdict === 'authorized'
          ? 'authority_at_dais'
          : 'unwritten_on_authority_mark';
      camVantage = 'cam_hollis_over_shoulder';
    } else if (prosceniumState === 'on_stage') {
      statusDiff = 'supplicant_to_authority';
      camVantage = 'cam_proscenium_dialogue';
    } else if (prosceniumState === 'apron_threshold') {
      statusDiff = 'entrant_at_threshold';
      camVantage = 'cam_proscenium_dialogue';
    }

    return {
      actor_id: 'player',
      pose: {
        x: Number(xm.toFixed(2)),
        y: Number(ym.toFixed(2)),
        z: Number(z.toFixed(2)),
      },
      scene_id: zone ? zone.scene_id : prosceniumState !== 'wilderness' ? 'customs-house' : null,
      zone_id: zone ? zone.id : null,
      zone_name: zone ? zone.name : 'Border Approach (Wilderness)',
      proscenium_state: prosceniumState,
      playing_area: activePa,
      anchored_cue_mark: anchoredCm,
      status_differential: statusDiff,
      active_camera_vantage: camVantage,
    };
  }

  function getActiveAffordances(xm = playerX, ym = playerY, written = actorWritten) {
    const results = [];
    for (const at of affordanceTemplates) {
      const dist = Math.hypot(xm - at.world_x, ym - at.world_y);
      if (dist > (at.reach_radius_m || 4.5)) continue;
      const isRefused = at.required_standing === 'written' && !written;
      results.push({
        id: at.id,
        prop_id: at.prop_id,
        label: at.label,
        distance_m: Number(dist.toFixed(2)),
        required_standing: at.required_standing,
        status: isRefused ? 'standing_refused' : 'available',
        reason: isRefused
          ? 'Requires written standing (role.authored) in the Hollis Ledger'
          : 'Within reach and standing verified',
        verbs: at.verbs || [],
      });
    }
    results.sort((a, b) => a.distance_m - b.distance_m);
    return results;
  }

  function getStageDirection(xm = playerX, ym = playerY, written = actorWritten) {
    const anchor = getSemanticAnchor(xm, ym, written);
    const affordances = getActiveAffordances(xm, ym, written);
    const lines = [
      `[STAGE DIRECTION · VANTAGE: ${anchor.active_camera_vantage} · ZONE: ${anchor.zone_name}]`,
    ];

    if (anchor.proscenium_state === 'wilderness') {
      lines.push(
        `- Spatial Blocking: Actor 'player' is roving in the unscripted wilderness at (${anchor.pose.x}m, ${anchor.pose.y}m, elev ${anchor.pose.z}m) outside the proscenium threshold.`
      );
    } else if (anchor.proscenium_state === 'apron_threshold') {
      lines.push(
        `- Spatial Blocking: Actor 'player' stands in the ${anchor.zone_name} approaching the proscenium line before the inspection hall.`
      );
    } else {
      const paLabel = anchor.playing_area ? anchor.playing_area.label : 'Active Stage';
      lines.push(
        `- Spatial Blocking: Actor 'player' has crossed the Proscenium Line into ${paLabel} at (${anchor.pose.x}m, ${anchor.pose.y}m, elev ${anchor.pose.z}m).`
      );
    }

    if (anchor.anchored_cue_mark) {
      const cm = anchor.anchored_cue_mark;
      if (cm.standing_verdict === 'authorized') {
        lines.push(
          `- Cue Mark Hit: Anchored at ${cm.label} facing ${cm.facing}. Standing gate: AUTHORIZED (${anchor.status_differential}).`
        );
      } else {
        lines.push(
          `- Cue Mark Fault: Actor stepped onto ${cm.label} (+0.6m dais) without a written part! Standing gate: UNWRITTEN USURPATION.`
        );
      }
    }

    if (anchor.proscenium_state === 'on_stage' || anchor.proscenium_state === 'apron_threshold') {
      lines.push(
        `- Co-Actor Orientation: Upstage Right at Mark H (63.0m, 69.0m, +6.6m dais), Quartermaster Hollis presides behind the cast-iron grille.`
      );
    }

    const avail = affordances.filter((a) => a.status === 'available');
    const refused = affordances.filter((a) => a.status === 'standing_refused');
    if (avail.length > 0) {
      const verbStrs = [];
      for (const a of avail) {
        for (const v of a.verbs) {
          verbStrs.push(`${v.verb} (${v.label})`);
        }
      }
      lines.push(`- Active Affordance Templates (In Reach): ${verbStrs.join('; ')}.`);
    } else {
      lines.push(`- Active Affordance Templates (In Reach): None within arm's reach.`);
    }

    if (refused.length > 0) {
      const refStrs = refused.map((r) => `${r.label} [LOCKED: ${r.reason}]`);
      lines.push(`- Refused Affordances: ${refStrs.join('; ')}.`);
    }

    return lines.join('\n');
  }

  function renderLightingOverlay() {
    if (!imgData || !offCtx || !ctx) return;

    const stepM = mapWidthM / (cols - 1);
    const pZ = sampleElevation(playerX, playerY);
    const eyeZ = pZ + 1.7;
    const viewRadiusM = 56.0;
    const featherRadiusM = viewRadiusM * 0.85;

    const cp = Math.round((playerX / mapWidthM) * (cols - 1));
    const rp = Math.round((playerY / mapLengthM) * (rows - 1));
    const radCells = Math.ceil(viewRadiusM / stepM);

    const r0 = Math.max(0, rp - radCells);
    const r1 = Math.min(rows - 1, rp + radCells);
    const c0 = Math.max(0, cp - radCells);
    const c1 = Math.min(cols - 1, cp + radCells);

    // 1. Mark visible cells via elevation raymarching
    // activeVis[r*cols + c] in [0.0..1.0] where 1.0 = full daylight, 0.0 = occluded/out of sight
    const activeVis = new Float32Array(rows * cols);

    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const wx = (c / (cols - 1)) * mapWidthM;
        const wy = (r / (rows - 1)) * mapLengthM;
        const dx = wx - playerX;
        const dy = wy - playerY;
        const dist2D = Math.hypot(dx, dy);

        if (dist2D > viewRadiusM) continue;

        const cellIdx = r * cols + c;

        if (dist2D < 0.8) {
          activeVis[cellIdx] = 1.0;
          explored[cellIdx] = 1;
          continue;
        }

        const targetZ = elev[r][c];
        const steps = Math.max(Math.floor(dist2D / (stepM * 0.75)), 2);
        let blocked = false;

        if (isSightlineBlockedByWall(playerX, playerY, wx, wy)) {
          blocked = true;
        } else {
          for (let s = 1; s < steps; s++) {
            const t = s / steps;
            const testX = playerX + dx * t;
            const testY = playerY + dy * t;
            const rayZ = eyeZ + (targetZ - eyeZ) * t;

            const terrainZ = sampleElevation(testX, testY);
            if (terrainZ > rayZ + 0.12) {
              blocked = true;
              break;
            }
          }
        }

        if (!blocked) {
          // Daylight visibility is crisp (1.0) across open terrain
          // Only feather gently at the outer horizon perimeter
          let vis = 1.0;
          if (dist2D > featherRadiusM) {
            const frac = (dist2D - featherRadiusM) / (viewRadiusM - featherRadiusM);
            vis = 1.0 - frac * frac;
          }
          activeVis[cellIdx] = vis;
          explored[cellIdx] = 1;
        }
      }
    }

    // 2. Cursor depth probe illumination buffer
    const probeLight = new Float32Array(rows * cols);
    if (cursorX !== null && cursorY !== null) {
      const probeRadiusM = 24.0;
      const curGroundZ = sampleElevation(cursorX, cursorY);
      const probeLightZ = curGroundZ + 2.5;

      const cc = Math.round((cursorX / mapWidthM) * (cols - 1));
      const rc = Math.round((cursorY / mapLengthM) * (rows - 1));
      const radP = Math.ceil(probeRadiusM / stepM);

      const pr0 = Math.max(0, rc - radP);
      const pr1 = Math.min(rows - 1, rc + radP);
      const pc0 = Math.max(0, cc - radP);
      const pc1 = Math.min(cols - 1, cc + radP);

      for (let r = pr0; r <= pr1; r++) {
        for (let c = pc0; c <= pc1; c++) {
          const wx = (c / (cols - 1)) * mapWidthM;
          const wy = (r / (rows - 1)) * mapLengthM;
          const dx = wx - cursorX;
          const dy = wy - cursorY;
          const dist2D = Math.hypot(dx, dy);

          if (dist2D > probeRadiusM) continue;

          const cellIdx = r * cols + c;

          if (dist2D < 0.6) {
            probeLight[cellIdx] = 1.0;
            continue;
          }

          const targetZ = elev[r][c];
          const steps = Math.max(Math.floor(dist2D / (stepM * 0.75)), 2);
          let blocked = false;

          for (let s = 1; s < steps; s++) {
            const t = s / steps;
            const testX = cursorX + dx * t;
            const testY = cursorY + dy * t;
            const rayZ = probeLightZ + (targetZ - probeLightZ) * t;

            const terrainZ = sampleElevation(testX, testY);
            if (terrainZ > rayZ + 0.08) {
              blocked = true;
              break;
            }
          }

          if (!blocked) {
            const atten = Math.pow(1.0 - (dist2D / probeRadiusM), 2.0);
            probeLight[cellIdx] = atten;
          }
        }
      }
    }

    // 3. Assemble composite shadow mask:
    // - Active daylight sight: alpha = 0 (crystal clear daylight)
    // - Explored memory: alpha = 115 (subdued terrain features visible)
    // - Unexplored shroud: alpha = 230 (dark fog)
    // - Cursor probe subtracts shadow alpha in its local cone
    const d = imgData.data;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellIdx = r * cols + c;
        const pxIdx = cellIdx * 4;

        d[pxIdx] = 18;     // R
        d[pxIdx + 1] = 16; // G
        d[pxIdx + 2] = 14; // B

        const isExp = explored[cellIdx];
        const vis = activeVis[cellIdx];
        const pLit = probeLight[cellIdx];

        let baseAlpha;
        if (vis > 0.0) {
          // Transition from clear (0) to memory (115) based on visibility
          baseAlpha = Math.round((1.0 - vis) * 115);
        } else if (isExp) {
          baseAlpha = 115; // Explored memory shadow
        } else {
          baseAlpha = 230; // Unexplored shroud
        }

        if (pLit > 0.0) {
          baseAlpha = Math.round(baseAlpha * (1.0 - pLit * 0.85));
        }

        d[pxIdx + 3] = baseAlpha;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Blit to main canvas with smooth scaling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

    // Add warm probe specular glow on canvas if active
    if (cursorX !== null && cursorY !== null) {
      const cx = (cursorX / mapWidthM) * canvas.width;
      const cy = (cursorY / mapLengthM) * canvas.height;
      const probePxRad = (24.0 / mapWidthM) * canvas.width;

      const probeGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, probePxRad);
      probeGrad.addColorStop(0, 'rgba(255, 215, 60, 0.45)');
      probeGrad.addColorStop(0.35, 'rgba(245, 175, 40, 0.20)');
      probeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = probeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, probePxRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function updatePlayerPosition(xm, ym) {
    playerX = Math.max(2, Math.min(mapWidthM - 2, xm));
    playerY = Math.max(2, Math.min(mapLengthM - 2, ym));

    const pActor = actors.get('player');
    if (pActor) {
      pActor.x = playerX;
      pActor.y = playerY;
      pActor.z = sampleElevation(playerX, playerY);
    }

    const pxX = (playerX / mapWidthM) * (world ? world.clientWidth || 600 : 600);
    const pxY = (playerY / mapLengthM) * (world ? world.clientHeight || 700 : 700);

    if (playerEl) {
      playerEl.style.left = pxX + 'px';
      playerEl.style.top = pxY + 'px';
    }

    // Dynamic player-centric CSS perspective origin
    if (viewport && world) {
      const rect = world.getBoundingClientRect();
      const vpRect = viewport.getBoundingClientRect();
      const originX = ((rect.left + pxX - vpRect.left) / vpRect.width) * 100;
      const originY = ((rect.top + pxY - vpRect.top) / vpRect.height) * 100;
      viewport.style.perspectiveOrigin = `${originX.toFixed(1)}% ${originY.toFixed(1)}%`;

      const vanEl = document.getElementById('stat-vanishing');
      if (vanEl) vanEl.innerText = `${originX.toFixed(0)}%, ${originY.toFixed(0)}%`;
    }

    const pZ = sampleElevation(playerX, playerY);
    const pXyEl = document.getElementById('stat-player-xy');
    if (pXyEl) pXyEl.innerText = `${playerX.toFixed(1)}m, ${playerY.toFixed(1)}m`;
    const pZEl = document.getElementById('stat-player-z');
    if (pZEl) pZEl.innerText = `${pZ.toFixed(2)}m`;

    // Update zone in HUD
    const curZone = getZoneAt(playerX, playerY);
    const zoneEl = document.getElementById('stat-player-zone');
    if (zoneEl) {
      zoneEl.innerText = curZone ? curZone.name : 'Border Approach (Wilderness)';
    }

    // Update nearest prop in HUD
    let nearestProp = null;
    let nearestDist = Infinity;
    for (const p of props) {
      const d = Math.hypot(p.world_x - playerX, p.world_y - playerY);
      if (d < nearestDist) {
        nearestDist = d;
        nearestProp = p;
      }
    }
    const propElHud = document.getElementById('stat-nearest-prop');
    if (propElHud) {
      if (nearestProp && nearestDist <= 6.0) {
        propElHud.innerText = `${nearestProp.label} (${nearestDist.toFixed(1)}m)`;
      } else {
        propElHud.innerText = 'None nearby';
      }
    }

    // Update Stagecraft Semantic Blackboard HUD
    const anchor = getSemanticAnchor(playerX, playerY, actorWritten);
    const activeAff = getActiveAffordances(playerX, playerY, actorWritten);
    const stageDir = getStageDirection(playerX, playerY, actorWritten);

    const proscEl = document.getElementById('stat-proscenium');
    if (proscEl) proscEl.innerText = anchor.proscenium_state;

    const anchorEl = document.getElementById('stat-semantic-anchor');
    if (anchorEl) {
      if (anchor.anchored_cue_mark) {
        anchorEl.innerText = `${anchor.anchored_cue_mark.label} (${anchor.anchored_cue_mark.standing_verdict})`;
      } else if (anchor.playing_area) {
        anchorEl.innerText = anchor.playing_area.label;
      } else {
        anchorEl.innerText = 'None';
      }
    }

    const camEl = document.getElementById('stat-camera-vantage');
    if (camEl) camEl.innerText = anchor.active_camera_vantage;

    const affEl = document.getElementById('stat-affordances');
    if (affEl) {
      if (activeAff.length > 0) {
        affEl.innerText = activeAff
          .map((a) => `${a.id.replace('at-', '')} [${a.status}]`)
          .join(', ');
      } else {
        affEl.innerText = 'None in reach';
      }
    }

    const dirEl = document.getElementById('stat-stage-direction');
    if (dirEl) dirEl.innerText = stageDir;

    renderLightingOverlay();
  }

  function screenToWorld(pxX, pxY, wWidth = (world ? world.clientWidth || 600 : 600), wHeight = (world ? world.clientHeight || 700 : 700)) {
    const rx = Math.max(0, Math.min(1, pxX / wWidth));
    const ry = Math.max(0, Math.min(1, pxY / wHeight));
    return {
      x: rx * mapWidthM,
      y: ry * mapLengthM,
    };
  }

  function getInteractableAt(xm, ym) {
    // 1. Check physical props (bounding box + 0.45m margin)
    for (const prop of physicalPropsMap.values()) {
      const bw = prop.bounds?.width || 1.2;
      const bd = prop.bounds?.depth || 1.2;
      const halfW = bw / 2.0 + 0.45;
      const halfD = bd / 2.0 + 0.45;
      if (Math.abs(xm - prop.world_x) <= halfW && Math.abs(ym - prop.world_y) <= halfD) {
        return {
          kind: 'prop',
          id: prop.id,
          label: prop.label,
          sublabel: `${prop.mass_kg}kg | ${prop.obstacle_type.replace(/_/g, ' ')}`,
          lore: prop.lore_snippet,
          verbs: prop.interactive_verbs || ['examine', 'push'],
          salience: prop.salience,
          mass_kg: prop.mass_kg,
          destructible: prop.destructible,
          is_smashed: prop.is_smashed,
          targetX: prop.world_x,
          targetY: prop.world_y,
        };
      }
    }

    // 2. Check actors
    for (const [id, actor] of actors.entries()) {
      if (id === 'player') continue;
      const d = Math.hypot(xm - actor.x, ym - actor.y);
      if (d <= 1.25) {
        return {
          kind: 'actor',
          id: actor.id,
          label: `${actor.name} (${actor.role})`,
          sublabel: actor.written ? 'Standing: Written (Clearance)' : 'Standing: Unwritten (Understudy)',
          verbs: ['speak', 'examine'],
          targetX: actor.x,
          targetY: actor.y,
        };
      }
    }

    // 3. Check cue marks
    for (const cm of cueMarks) {
      const d = Math.hypot(xm - cm.world_x, ym - cm.world_y);
      if (d <= (cm.radius_m || 2.0)) {
        return {
          kind: 'cue_mark',
          id: cm.id,
          label: cm.label,
          sublabel: `Gate: ${cm.standing_gate} [${cm.standing_verdict}]`,
          verbs: ['step_to_cue', 'stage_action'],
          targetX: cm.world_x,
          targetY: cm.world_y,
        };
      }
    }

    // 4. Fallback to Zone
    const zone = getZoneAt(xm, ym);
    if (zone) {
      return {
        kind: 'zone',
        id: zone.id,
        label: zone.name,
        sublabel: `Elevation: ${typeof zone.elevation === 'number' ? zone.elevation.toFixed(1) + 'm' : 'Ground'} | ${zone.material || 'Terrain'}`,
        verbs: ['walk_here'],
        targetX: xm,
        targetY: ym,
      };
    }

    return {
      kind: 'zone',
      id: 'border-wilderness',
      label: 'Border March Wilderness',
      sublabel: `Elevation: ${sampleElevation(xm, ym).toFixed(1)}m | Open Terrain`,
      verbs: ['walk_here'],
      targetX: xm,
      targetY: ym,
    };
  }

  function handleMouseMove(pxX, pxY, wWidth = (world ? world.clientWidth || 600 : 600), wHeight = (world ? world.clientHeight || 700 : 700)) {
    const worldCoord = screenToWorld(pxX, pxY, wWidth, wHeight);
    cursorX = worldCoord.x;
    cursorY = worldCoord.y;

    if (probeEl) {
      probeEl.style.display = 'block';
      probeEl.style.left = `${pxX}px`;
      probeEl.style.top = `${pxY}px`;
    }

    const curZ = sampleElevation(cursorX, cursorY);
    const pZ = sampleElevation(playerX, playerY);
    const deltaZ = curZ - pZ;
    const slope = getSlope(cursorX, cursorY);

    const cXyEl = typeof document !== 'undefined' ? document.getElementById('stat-cursor-xy') : null;
    if (cXyEl) cXyEl.innerText = `${cursorX.toFixed(1)}m, ${cursorY.toFixed(1)}m`;
    const cZEl = typeof document !== 'undefined' ? document.getElementById('stat-cursor-z') : null;
    if (cZEl) cZEl.innerText = `${curZ.toFixed(2)}m`;
    const cDeltaEl = typeof document !== 'undefined' ? document.getElementById('stat-cursor-delta') : null;
    if (cDeltaEl) cDeltaEl.innerText = `${deltaZ >= 0 ? '+' : ''}${deltaZ.toFixed(2)}m`;
    const cSlopeEl = typeof document !== 'undefined' ? document.getElementById('stat-cursor-slope') : null;
    if (cSlopeEl) {
      cSlopeEl.innerText = `${slope}° (${
        slope >= 45 ? 'Ancient Overhang' : slope < 35 ? 'Walkable' : 'Scramble'
      })`;
    }

    // Hit-testing interactables & floating cursor tooltip
    const hit = getInteractableAt(cursorX, cursorY);
    const currentTooltipEl = tooltipEl || (typeof document !== 'undefined' ? document.getElementById('cursor-tooltip') : null);
    if (currentTooltipEl) {
      if (hit && hit.kind !== 'zone') {
        currentTooltipEl.style.display = 'block';
        currentTooltipEl.style.left = `${pxX}px`;
        currentTooltipEl.style.top = `${pxY}px`;

        const badgeText = hit.kind === 'prop' ? (hit.salience ? `PROP - ${hit.salience.toUpperCase()}` : 'PROP') : hit.kind.replace(/_/g, ' ').toUpperCase();
        let html = `<div class="tooltip-badge">[${badgeText}]</div>`;
        html += `<div class="tooltip-title">${hit.label}</div>`;
        if (hit.sublabel) html += `<div class="tooltip-meta">${hit.sublabel}</div>`;
        if (hit.is_smashed) html += `<div class="tooltip-meta" style="color: #7dd3fc;">✨ Fractured Cryogenic Debris</div>`;
        if (hit.verbs && hit.verbs.length) {
          html += `<div class="tooltip-verbs">Actions: ${hit.verbs.map((v) => `[${v.replace(/_/g, ' ')}]`).join(' ')}</div>`;
        }
        currentTooltipEl.innerHTML = html;
      } else {
        currentTooltipEl.style.display = 'none';
        currentTooltipEl.innerHTML = '';
      }
    }

    renderLightingOverlay();
    return hit;
  }

  function handleClick(pxX, pxY, wWidth = (world ? world.clientWidth || 600 : 600), wHeight = (world ? world.clientHeight || 700 : 700)) {
    const worldCoord = screenToWorld(pxX, pxY, wWidth, wHeight);
    const hit = getInteractableAt(worldCoord.x, worldCoord.y);

    if (hit && hit.kind === 'prop') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      return { hitKind: 'prop', targetId: hit.id, x: hit.targetX, y: hit.targetY };
    } else if (hit && hit.kind === 'cue_mark') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      return { hitKind: 'cue_mark', targetId: hit.id, x: hit.targetX, y: hit.targetY };
    } else if (hit && hit.kind === 'actor') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      return { hitKind: 'actor', targetId: hit.id, x: hit.targetX, y: hit.targetY };
    } else {
      tryMoveActor('player', worldCoord.x, worldCoord.y);
      return { hitKind: 'ground', x: worldCoord.x, y: worldCoord.y };
    }
  }

  // Mouse interaction surfaces
  if (world && world.addEventListener) {
    world.addEventListener('mousemove', (e) => {
      const rect = world.getBoundingClientRect();
      const pxX = e.clientX - rect.left;
      const pxY = e.clientY - rect.top;
      handleMouseMove(pxX, pxY, rect.width || world.clientWidth || 600, rect.height || world.clientHeight || 700);
    });

    world.addEventListener('mouseleave', () => {
      cursorX = null;
      cursorY = null;
      if (probeEl) probeEl.style.display = 'none';
      const currentTooltipEl = tooltipEl || (typeof document !== 'undefined' ? document.getElementById('cursor-tooltip') : null);
      if (currentTooltipEl) {
        currentTooltipEl.style.display = 'none';
        currentTooltipEl.innerHTML = '';
      }

      const cXyEl = document.getElementById('stat-cursor-xy');
      if (cXyEl) cXyEl.innerText = '--';
      const cZEl = document.getElementById('stat-cursor-z');
      if (cZEl) cZEl.innerText = '--';
      const cDeltaEl = document.getElementById('stat-cursor-delta');
      if (cDeltaEl) cDeltaEl.innerText = '--';
      const cSlopeEl = document.getElementById('stat-cursor-slope');
      if (cSlopeEl) cSlopeEl.innerText = '--';

      renderLightingOverlay();
    });

    // Click to move / interact
    world.addEventListener('click', (e) => {
      const rect = world.getBoundingClientRect();
      const pxX = e.clientX - rect.left;
      const pxY = e.clientY - rect.top;
      handleClick(pxX, pxY, rect.width || world.clientWidth || 600, rect.height || world.clientHeight || 700);
    });
  }

  // Keyboard movement (WASD & Arrows)
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      const step = 1.25;
      if (e.key === 'w' || e.key === 'ArrowUp') tryMoveActor('player', playerX, playerY - step);
      if (e.key === 's' || e.key === 'ArrowDown') tryMoveActor('player', playerX, playerY + step);
      if (e.key === 'a' || e.key === 'ArrowLeft') tryMoveActor('player', playerX - step, playerY);
      if (e.key === 'd' || e.key === 'ArrowRight') tryMoveActor('player', playerX + step, playerY);
    });
  }

  // Register default player actor
  actors.set('player', {
    id: 'player',
    name: 'Player',
    role: 'Wanderer',
    x: playerX,
    y: playerY,
    z: sampleElevation(playerX, playerY),
    facing: 0,
    color: '#eab308',
    written: actorWritten,
    tokenEl: playerEl,
    balloonEl: null,
  });

  function addActor(id, options = {}) {
    const name = options.name || id;
    const role = options.role || 'Performer';
    const ax = options.x !== undefined ? options.x : playerX;
    const ay = options.y !== undefined ? options.y : playerY;
    let az = sampleElevation(ax, ay);
    const zone = getZoneAt(ax, ay);
    if (zone && typeof zone.elevation === 'number') {
      az = Math.max(az, zone.elevation);
    }
    const color = options.color || '#38bdf8';
    const written = options.written !== undefined ? Boolean(options.written) : false;

    let tokenEl = null;
    if (id === 'player') {
      tokenEl = playerEl;
    } else {
      tokenEl = document.createElement('div');
      tokenEl.className = 'actor-token';
      tokenEl.dataset.actorId = id;
      tokenEl.style.backgroundColor = color;
      tokenEl.style.borderColor = written ? '#fef08a' : '#94a3b8';

      const badge = document.createElement('div');
      badge.className = 'actor-badge';
      badge.textContent = name.charAt(0).toUpperCase();
      tokenEl.appendChild(badge);

      if (world && world.appendChild) {
        const wW = world.clientWidth || 600;
        const wH = world.clientHeight || 700;
        tokenEl.style.left = `${(ax / mapWidthM) * wW}px`;
        tokenEl.style.top = `${(ay / mapLengthM) * wH}px`;
        world.appendChild(tokenEl);
      }
    }

    const actor = {
      id,
      name,
      role,
      x: ax,
      y: ay,
      z: az,
      color,
      written,
      tokenEl,
      balloonEl: null,
    };
    actors.set(id, actor);
    return actor;
  }

  function getPropState(propId) {
    return propStates.get(propId) || null;
  }

  function getPhysicalProps() {
    return Array.from(physicalPropsMap.values());
  }

  function getPlayerStrength() {
    return playerStrength;
  }

  function setPlayerStrength(val) {
    playerStrength = Number(val);
    const sEl = typeof document !== 'undefined' ? document.getElementById('stat-player-strength') : null;
    if (sEl) sEl.textContent = `${playerStrength.toFixed(0)} kg`;
  }

  function smashProp(propId) {
    const prop = physicalPropsMap.get(propId);
    if (!prop) return false;
    prop.is_smashed = true;
    prop.obstacle_type = 'passable';

    const pEl = prop.tokenEl || (world ? world.querySelector(`.prop-glass-coffin, [data-prop-id="${propId}"]`) : null);
    if (pEl) {
      pEl.classList.add('smashed');
    }
    return true;
  }

  function getPropPosition(propId) {
    const p = physicalPropsMap.get(propId);
    if (!p) return null;
    return { x: p.world_x, y: p.world_y, z: p.world_z };
  }

  function setPropPosition(propId, x, y, z) {
    const p = physicalPropsMap.get(propId);
    if (!p) return;
    p.world_x = x;
    p.world_y = y;
    if (z !== undefined) p.world_z = z;

    const wState = propStates.get(propId);
    if (wState) {
      wState.world_x = x;
      wState.world_y = y;
    }

    if (p.tokenEl && world) {
      const wW = world.clientWidth || 600;
      const wH = world.clientHeight || 700;
      p.tokenEl.style.left = `${(x / mapWidthM) * wW}px`;
      p.tokenEl.style.top = `${(y / mapLengthM) * wH}px`;
    }
  }

  function evaluatePhysicalInteractions() {
    let totalWeight = 0;
    for (const [id, prop] of physicalPropsMap.entries()) {
      if (prop.obstacle_type === 'physics_object') {
        const distToScale = Math.hypot(prop.world_x - 48.0, prop.world_y - 63.0);
        if (distToScale <= 2.5) {
          totalWeight += prop.mass_kg;
        }
      }
    }

    const scaleState = propStates.get('weigh_table') || { id: 'weigh_table' };
    scaleState.weightKg = totalWeight;
    scaleState.balanceAngleDeg =
      totalWeight > 0 ? Math.min(18, Math.max(4, (totalWeight - 30) * 0.8)) : 0;
    propStates.set('weigh_table', scaleState);

    const beamEl = world && world.querySelector ? world.querySelector('.scale-beam') : null;
    if (beamEl && beamEl.style) {
      beamEl.style.transform = `rotate(${scaleState.balanceAngleDeg}deg)`;
    }
  }

  function setActorPosition(actorId, x, y) {
    let actor = actors.get(actorId);
    if (!actor) {
      actor = addActor(actorId, { x, y });
    }
    actor.x = x;
    actor.y = y;
    let az = sampleElevation(x, y);
    const zone = getZoneAt(x, y);
    if (zone && typeof zone.elevation === 'number') {
      az = Math.max(az, zone.elevation);
    }
    actor.z = az;

    const wW = world ? world.clientWidth || 600 : 600;
    const wH = world ? world.clientHeight || 700 : 700;

    if (actorId === 'player') {
      playerX = x;
      playerY = y;
      if (playerEl) {
        playerEl.style.left = `${(x / mapWidthM) * wW}px`;
        playerEl.style.top = `${(y / mapLengthM) * wH}px`;
      }
      renderLightingOverlay();
    } else if (actor.tokenEl) {
      actor.tokenEl.style.left = `${(x / mapWidthM) * wW}px`;
      actor.tokenEl.style.top = `${(y / mapLengthM) * wH}px`;
    }
  }

  function checkSingleStepCollision(fromX, fromY, toX, toY, actorRadius = 0.5, pushStrength = playerStrength) {
    // 1. Check wall intersection
    for (const w of walls) {
      const hit = segmentIntersect(fromX, fromY, toX, toY, w.start[0], w.start[1], w.end[0], w.end[1]);
      if (hit) {
        let throughPortal = false;
        for (const p of portals) {
          if (!p.passable) continue;
          const distToPortal = Math.hypot(hit.x - p.world_x, hit.y - p.world_y);
          if (distToPortal <= (p.width / 2.0) + 0.20) {
            throughPortal = true;
            break;
          }
        }
        if (!throughPortal) {
          return { allowed: false, reason: 'wall_collision', hit };
        }
      }
    }

    // 2. Check solid furniture & physical props at target point
    for (const [id, prop] of physicalPropsMap.entries()) {
      if (prop.obstacle_type === 'passable' || prop.is_smashed) {
        continue;
      }
      const bw = prop.bounds?.width || 1.2;
      const bd = prop.bounds?.depth || 1.2;
      const halfW = bw / 2.0 + actorRadius;
      const halfD = bd / 2.0 + actorRadius;

      const dx = Math.abs(toX - prop.world_x);
      const dy = Math.abs(toY - prop.world_y);

      if (dx < halfW && dy < halfD) {
        if (prop.obstacle_type === 'solid_furniture' || prop.obstacle_type === 'wall') {
          return { allowed: false, reason: 'solid_obstacle', propId: id };
        } else if (prop.obstacle_type === 'physics_object' || prop.obstacle_type === 'destructible_physics_object') {
          if (pushStrength >= prop.mass_kg) {
            return { allowed: true, pushedProp: id };
          } else {
            return { allowed: false, reason: 'too_heavy', propId: id };
          }
        }
      }
    }

    return { allowed: true };
  }

  function canMoveTo(fromX, fromY, toX, toY, actorRadius = 0.5, pushStrength = playerStrength) {
    const distTotal = Math.hypot(toX - fromX, toY - fromY);
    if (distTotal < 1e-4) return { allowed: true, x: fromX, y: fromY };

    const numSubsteps = Math.max(1, Math.ceil(distTotal / 0.25));
    let lastValidX = fromX;
    let lastValidY = fromY;
    let pushedPropId = null;

    for (let s = 1; s <= numSubsteps; s++) {
      const st = s / numSubsteps;
      const nextX = fromX + (toX - fromX) * st;
      const nextY = fromY + (toY - fromY) * st;

      const check = checkSingleStepCollision(lastValidX, lastValidY, nextX, nextY, actorRadius, pushStrength);
      if (check.allowed) {
        lastValidX = nextX;
        lastValidY = nextY;
        if (check.pushedProp) {
          pushedPropId = check.pushedProp;
          const p = physicalPropsMap.get(check.pushedProp);
          if (p) {
            const moveDx = toX - fromX;
            const moveDy = toY - fromY;
            const targetPropX = p.world_x + moveDx * 1.05;
            const targetPropY = p.world_y + moveDy * 1.05;

            // Check if pushed prop impacts an impassable wall
            let impactsWall = false;
            for (const w of walls) {
              const hit = segmentIntersect(p.world_x, p.world_y, targetPropX, targetPropY, w.start[0], w.start[1], w.end[0], w.end[1]);
              if (hit) {
                impactsWall = true;
                break;
              }
            }

            if (impactsWall && p.destructible) {
              smashProp(p.id);
            } else {
              setPropPosition(p.id, targetPropX, targetPropY);
              evaluatePhysicalInteractions();
            }
          }
        }
      } else {
        // Obstructed along full vector; attempt axis-sliding along clear axis
        // 1. Try sliding along X only
        const checkX = checkSingleStepCollision(lastValidX, lastValidY, nextX, lastValidY, actorRadius, pushStrength);
        if (checkX.allowed && Math.abs(nextX - lastValidX) > 1e-4) {
          lastValidX = nextX;
        } else {
          // 2. Try sliding along Y only
          const checkY = checkSingleStepCollision(lastValidX, lastValidY, lastValidX, nextY, actorRadius, pushStrength);
          if (checkY.allowed && Math.abs(nextY - lastValidY) > 1e-4) {
            lastValidY = nextY;
          } else {
            // Completely blocked on both axes
            return {
              allowed: false,
              x: lastValidX,
              y: lastValidY,
              reason: check.reason,
              propId: check.propId,
              pushedProp: pushedPropId,
            };
          }
        }
      }
    }

    const reachedTarget = Math.hypot(lastValidX - toX, lastValidY - toY) <= 0.15;
    return {
      allowed: reachedTarget,
      x: lastValidX,
      y: lastValidY,
      pushedProp: pushedPropId,
    };
  }

  function tryMoveActor(actorId, targetX, targetY) {
    let currentX, currentY;
    if (actorId === 'player') {
      currentX = playerX;
      currentY = playerY;
    } else {
      const actor = actors.get(actorId);
      currentX = actor ? actor.x : 0;
      currentY = actor ? actor.y : 0;
    }
    const str = actorId === 'player' ? playerStrength : 80.0;
    const res = canMoveTo(currentX, currentY, targetX, targetY, 0.5, str);

    if (res.allowed) {
      if (actorId === 'player') {
        updatePlayerPosition(res.x, res.y);
      } else {
        setActorPosition(actorId, res.x, res.y);
      }
      return { success: true, actualX: res.x, actualY: res.y, pushedProp: res.pushedProp };
    } else {
      if (Math.hypot(res.x - currentX, res.y - currentY) > 1e-3) {
        if (actorId === 'player') {
          updatePlayerPosition(res.x, res.y);
        } else {
          setActorPosition(actorId, res.x, res.y);
        }
      }
      return { success: false, actualX: res.x, actualY: res.y, reason: res.reason };
    }
  }

  async function moveActor(id, targetX, targetY, options = {}) {
    let actor = actors.get(id);
    if (!actor) {
      actor = addActor(id, { x: playerX, y: playerY });
    }

    const durationMs = options.durationMs !== undefined ? options.durationMs : 500;
    const stepCallback = options.stepCallback || null;
    const startX = actor.x;
    const startY = actor.y;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const totalDist = Math.hypot(dx, dy);

    const worldW = world ? world.clientWidth || 600 : 600;
    const worldH = world ? world.clientHeight || 700 : 700;

    if (totalDist < 0.05 || durationMs <= 0) {
      actor.x = targetX;
      actor.y = targetY;
      let az = sampleElevation(targetX, targetY);
      const zone = getZoneAt(targetX, targetY);
      if (zone && typeof zone.elevation === 'number') {
        az = Math.max(az, zone.elevation);
      }
      actor.z = az;

      if (id === 'player') {
        updatePlayerPosition(targetX, targetY);
      } else if (actor.tokenEl) {
        actor.tokenEl.style.left = `${(targetX / mapWidthM) * worldW}px`;
        actor.tokenEl.style.top = `${(targetY / mapLengthM) * worldH}px`;
      }
      if (stepCallback) stepCallback(actor);
      return { id, x: targetX, y: targetY, z: az };
    }

    const steps = Math.max(4, Math.min(60, Math.round(durationMs / 16)));
    const intervalMs = Math.max(1, durationMs / steps);

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const curX = startX + dx * t;
      const curY = startY + dy * t;
      let curZ = sampleElevation(curX, curY);
      const curZone = getZoneAt(curX, curY);
      if (curZone && typeof curZone.elevation === 'number') {
        curZ = Math.max(curZ, curZone.elevation);
      }

      actor.x = curX;
      actor.y = curY;
      actor.z = curZ;

      if (id === 'player') {
        updatePlayerPosition(curX, curY);
      } else if (actor.tokenEl) {
        actor.tokenEl.style.left = `${(curX / mapWidthM) * worldW}px`;
        actor.tokenEl.style.top = `${(curY / mapLengthM) * worldH}px`;
      }

      if (stepCallback) stepCallback(actor);
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return { id, x: targetX, y: targetY, z: actor.z };
  }

  function executeAffordance(actorId, affordanceId, verb, params = {}) {
    const actor = actors.get(actorId) || { x: playerX, y: playerY, written: actorWritten };
    const at = affordanceTemplates.find((a) => a.id === affordanceId);
    if (!at) return { success: false, reason: 'unknown_affordance', status: 'unknown' };

    const dist = Math.hypot(actor.x - at.world_x, actor.y - at.world_y);
    const reachRad = at.reach_radius_m || 4.5;
    if (dist > reachRad + 2.5) {
      return { success: false, reason: 'out_of_reach', status: 'out_of_reach' };
    }

    if (at.required_standing === 'written' && !actor.written) {
      return {
        success: false,
        reason: 'standing_refused',
        status: 'standing_refused',
        affordanceId,
        verb,
        message: 'Requires written standing in the Hollis Ledger',
      };
    }

    const vObj = (at.verbs || []).find((v) => v.verb === verb);
    const stageBeat = vObj ? vObj.stage_beat : `${verb} on ${at.label}`;

    if (affordanceId === 'at-weigh-scale' && verb === 'weigh_cargo') {
      const wState = propStates.get('weigh_table') || { id: 'weigh_table' };
      const weightKg = params.weightKg !== undefined ? params.weightKg : 42.5;
      wState.weightKg = weightKg;
      wState.balanceAngleDeg = Math.min(18, Math.max(-18, (weightKg - 30) * 0.8));
      propStates.set('weigh_table', wState);
    }

    // Update telemetry HUD with enacted stage beat
    const dirEl = document.getElementById('stat-stage-direction');
    if (dirEl) {
      dirEl.innerText = `[ENACTED BEAT · ${actor.name || actorId}]: ${stageBeat}`;
    }

    return {
      success: true,
      status: 'executed',
      affordanceId,
      verb,
      params,
      stage_beat: stageBeat,
    };
  }

  async function speak(actorId, text, options = {}) {
    const actor = actors.get(actorId);
    if (!actor || !actor.tokenEl) return;

    const durationMs = options.durationMs !== undefined ? options.durationMs : 2000;

    let bubble = actor.tokenEl.querySelector('.actor-speech-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'actor-speech-bubble';
      actor.tokenEl.appendChild(bubble);
    }

    bubble.innerHTML = '';
    const spk = document.createElement('div');
    spk.className = 'actor-speech-speaker';
    spk.textContent = actor.name;
    const txt = document.createElement('div');
    txt.className = 'actor-speech-text';
    txt.textContent = text;

    bubble.appendChild(spk);
    bubble.appendChild(txt);
    bubble.classList.add('visible');
    bubble.style.display = 'block';

    const dirEl = document.getElementById('stat-stage-direction');
    if (dirEl) {
      dirEl.textContent = `[SPOKEN · ${actor.name}]: "${text}"`;
    }

    await new Promise((r) => setTimeout(r, durationMs));

    bubble.classList.remove('visible');
    bubble.style.display = 'none';
  }

  function setCameraVantage(vantageId) {
    if (!viewport || !world) return;
    const rect = world.getBoundingClientRect ? world.getBoundingClientRect() : { left: 0, top: 0, width: 600, height: 700 };
    const vpRect = viewport.getBoundingClientRect ? viewport.getBoundingClientRect() : { left: 0, top: 0, width: 600, height: 700 };

    let targetX = playerX;
    let targetY = playerY;

    if (vantageId === 'cam_hollis_over_shoulder') {
      targetX = 63.0;
      targetY = 69.0;
    } else if (vantageId === 'cam_proscenium_dialogue') {
      targetX = 55.0;
      targetY = 64.0;
    } else if (vantageId === 'macro_exploration') {
      targetX = 45.0;
      targetY = 50.0;
    }

    const wW = world.clientWidth || 600;
    const wH = world.clientHeight || 700;
    const pxX = (targetX / mapWidthM) * wW;
    const pxY = (targetY / mapLengthM) * wH;

    const originX = ((rect.left + pxX - vpRect.left) / vpRect.width) * 100;
    const originY = ((rect.top + pxY - vpRect.top) / vpRect.height) * 100;
    viewport.style.perspectiveOrigin = `${originX.toFixed(1)}% ${originY.toFixed(1)}%`;

    const camEl = document.getElementById('stat-camera-vantage');
    if (camEl) camEl.innerText = vantageId;
  }

  async function playCutscene(script, options = {}) {
    const speedMultiplier = options.speedMultiplier || 1.0;
    const executionLog = [];

    if (script.actors) {
      script.actors.forEach((a) => {
        if (!actors.has(a.id)) {
          addActor(a.id, a);
        }
      });
    }

    for (const beat of (script.beats || [])) {
      if (beat.type === 'camera') {
        setCameraVantage(beat.vantage);
        executionLog.push({ type: 'camera', vantage: beat.vantage, status: 'set' });
      } else if (beat.type === 'move') {
        const res = await moveActor(beat.actor, beat.to[0], beat.to[1], {
          durationMs: (beat.durationMs || 500) / speedMultiplier,
        });
        executionLog.push({ type: 'move', actor: beat.actor, pos: res, status: 'completed' });
      } else if (beat.type === 'cue_check') {
        const actor = actors.get(beat.actor) || { x: playerX, y: playerY, written: false };
        const anc = getSemanticAnchor(actor.x, actor.y, actor.written);
        const mark = anc.anchored_cue_mark;
        const isPass =
          mark &&
          mark.id === beat.expectedMark &&
          mark.standing_verdict === beat.expectedVerdict;
        executionLog.push({
          type: 'cue_check',
          actor: beat.actor,
          markId: mark ? mark.id : null,
          verdict: mark ? mark.standing_verdict : null,
          status: isPass ? 'pass' : 'fail',
        });
      } else if (beat.type === 'speak') {
        await speak(beat.actor, beat.text, {
          durationMs: (beat.durationMs || 1000) / speedMultiplier,
        });
        executionLog.push({ type: 'speak', actor: beat.actor, text: beat.text, status: 'spoken' });
      } else if (beat.type === 'affordance') {
        const res = executeAffordance(beat.actor, beat.affordance, beat.verb, beat.params);
        executionLog.push({
          type: 'affordance',
          actor: beat.actor,
          affordance: beat.affordance,
          verb: beat.verb,
          params: beat.params,
          status: res.status || (res.success ? 'executed' : 'refused'),
          stage_beat: res.stage_beat,
        });
      } else if (beat.type === 'pause') {
        await new Promise((r) => setTimeout(r, (beat.durationMs || 500) / speedMultiplier));
      }
    }

    return executionLog;
  }

  async function playBorderClearanceCutscene() {
    const script = {
      id: 'border-clearance-act-1',
      title: 'Act I: The Clearance at the Border March',
      actors: [
        { id: 'pell', name: 'Pell the Underwritten', role: 'Understudy', x: 35.0, y: 42.0, color: '#38bdf8', written: false },
        { id: 'hollis', name: 'Hollis the Twice-Written', role: 'Quartermaster', x: 63.0, y: 69.0, color: '#f59e0b', written: true },
      ],
      beats: [
        { type: 'camera', vantage: 'macro_exploration' },
        { type: 'move', actor: 'pell', to: [45.0, 48.0], durationMs: 1200 },
        { type: 'speak', actor: 'pell', text: 'The mountain pass is bitter cold, but the chimney smokes...', durationMs: 2200 },
        { type: 'move', actor: 'pell', to: [48.0, 59.0], durationMs: 1000 },
        { type: 'cue_check', actor: 'pell', expectedMark: 'mark_supplicant', expectedVerdict: 'authorized' },
        { type: 'camera', vantage: 'cam_proscenium_dialogue' },
        { type: 'affordance', actor: 'pell', affordance: 'at-weigh-scale', verb: 'weigh_cargo', params: { weightKg: 42.5 } },
        { type: 'speak', actor: 'pell', text: 'Quartermaster! Forty-two stone of crated assets from the neighboring kingdom.', durationMs: 2600 },
        { type: 'camera', vantage: 'cam_hollis_over_shoulder' },
        { type: 'affordance', actor: 'hollis', affordance: 'at-quartermaster-desk', verb: 'inscribe_ledger' },
        { type: 'speak', actor: 'hollis', text: 'Forty-two stone of unwritten freight. Your shipping slip bears no author, Understudy.', durationMs: 2800 },
        { type: 'affordance', actor: 'hollis', affordance: 'at-quartermaster-desk', verb: 'strike_seal' },
        { type: 'speak', actor: 'hollis', text: 'I strike a provisional transit seal. You may raise the boom, but the ledger records your unwritten standing.', durationMs: 3000 },
      ],
    };
    return await playCutscene(script);
  }

  // Initial setup
  renderFeaturesDOM();
  updatePlayerPosition(playerX, playerY);

  const instance = {
    sampleElevation,
    getSlope,
    updatePlayerPosition,
    renderLightingOverlay,
    getZoneAt,
    getCurrentZone: () => getZoneAt(playerX, playerY),
    isSightlineBlockedByWall,
    renderFeaturesDOM,
    getFeatures: () => ({ zones, walls, portals, props, stagecraft }),
    getSemanticAnchor: (xm = playerX, ym = playerY, written = actorWritten) => getSemanticAnchor(xm, ym, written),
    getActiveAffordances: (xm = playerX, ym = playerY, written = actorWritten) => getActiveAffordances(xm, ym, written),
    getStageDirection: (xm = playerX, ym = playerY, written = actorWritten) => getStageDirection(xm, ym, written),
    addActor,
    getActor: (id) => actors.get(id),
    setActorPosition,
    getPropState,
    getPhysicalProps,
    getPlayerStrength,
    setPlayerStrength,
    getPropPosition,
    setPropPosition,
    smashProp,
    canMoveTo,
    tryMoveActor,
    evaluatePhysicalInteractions,
    moveActor,
    executeAffordance,
    speak,
    setCameraVantage,
    playCutscene,
    playBorderClearanceCutscene,
    setActorStanding: (written) => {
      actorWritten = Boolean(written);
      updatePlayerPosition(playerX, playerY);
    },
    getExploredGrid: () => explored,
    getPlayerPos: () => ({ x: playerX, y: playerY }),
    getPlayerPosition: () => ({ x: playerX, y: playerY }),
    screenToWorld,
    getInteractableAt,
    handleMouseMove,
    handleClick,
  };

  const globalRoot = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  if (globalRoot) {
    globalRoot.getPlayerPos = () => ({ x: playerX, y: playerY });
    globalRoot.getPlayerPosition = () => ({ x: playerX, y: playerY });
    globalRoot.screenToWorld = screenToWorld;
    globalRoot.getInteractableAt = getInteractableAt;
    globalRoot.handleMouseMove = handleMouseMove;
    globalRoot.handleClick = handleClick;
    globalRoot.sampleElevation = sampleElevation;
    globalRoot.getSlope = getSlope;
    globalRoot.playerX = playerX;
    globalRoot.playerY = playerY;
    globalRoot.getZoneAt = getZoneAt;
    globalRoot.getCurrentZone = () => getZoneAt(playerX, playerY);
    globalRoot.isSightlineBlockedByWall = isSightlineBlockedByWall;
    globalRoot.getSemanticAnchor = (xm = playerX, ym = playerY, written = actorWritten) => getSemanticAnchor(xm, ym, written);
    globalRoot.getActiveAffordances = (xm = playerX, ym = playerY, written = actorWritten) => getActiveAffordances(xm, ym, written);
    globalRoot.getStageDirection = (xm = playerX, ym = playerY, written = actorWritten) => getStageDirection(xm, ym, written);
    globalRoot.addActor = addActor;
    globalRoot.getActor = (id) => actors.get(id);
    globalRoot.setActorPosition = setActorPosition;
    globalRoot.getPropState = getPropState;
    globalRoot.getPhysicalProps = getPhysicalProps;
    globalRoot.getPlayerStrength = getPlayerStrength;
    globalRoot.setPlayerStrength = setPlayerStrength;
    globalRoot.getPropPosition = getPropPosition;
    globalRoot.setPropPosition = setPropPosition;
    globalRoot.smashProp = smashProp;
    globalRoot.canMoveTo = canMoveTo;
    globalRoot.tryMoveActor = tryMoveActor;
    globalRoot.evaluatePhysicalInteractions = evaluatePhysicalInteractions;
    globalRoot.moveActor = moveActor;
    globalRoot.executeAffordance = executeAffordance;
    globalRoot.speak = speak;
    globalRoot.setCameraVantage = setCameraVantage;
    globalRoot.playCutscene = playCutscene;
    globalRoot.playBorderClearanceCutscene = playBorderClearanceCutscene;
    globalRoot.viewer = instance;
  }

  return instance;
}

const globalRoot = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
if (globalRoot) {
  globalRoot.initViewer = initViewer;
}


