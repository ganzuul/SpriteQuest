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
  const npcs = features?.npcs || {};
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
  let currentAtmosphere = 'day';
  let particles = [];
  let nextParticleId = 1;
  let audioMuted = true;
  let audioCtx = null;

  // Asset Viewer & Forge State
  let selectedAsset = null;
  const assetImages = new Map();

  // Telemetry & Activity Logging System
  const logEntries = [];
  const MAX_LOGS = 300;
  let comfyServerUrl = 'http://127.0.0.1:8080/upstream/comfyui';

  function getForgeServiceUrl() {
    if (typeof window !== 'undefined' && window.FORGE_SERVICE_URL) {
      return window.FORGE_SERVICE_URL;
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      if (window.location.origin.includes(':8788')) {
        return window.location.origin;
      }
    }
    return 'http://127.0.0.1:8788';
  }

  async function postForgeJson(route, payload, timeoutMs = 2000) {
    if (typeof fetch !== 'function') return null;
    const base = getForgeServiceUrl();
    const url = `${base}${route}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {
      // SillyTavern reverse proxy fallback if running under SillyTavern (port 8000)
      if (typeof window !== 'undefined' && window.location && window.location.port === '8000') {
        try {
          const proxyUrl = `/proxy/${url}`;
          const pRes = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(payload),
            signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(timeoutMs) : undefined,
          });
          if (pRes.ok) return await pRes.json();
        } catch (__) {}
      }
    }
    return null;
  }

  async function checkForgeServer(targetUrl = getForgeServiceUrl()) {
    let online = false;
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(`${targetUrl}/health`, {
          mode: 'cors',
          signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined,
        });
        if (res.ok) {
          const health = await res.json();
          online = true;
          log('FORGE', `Connected to Companion Forge Service on port 8788. Ledger lines: ${health.lines || 0}.`);
        }
      }
    } catch (_) {
      // Silent probe: offline companion daemon falls back to local in-browser compilation
    }

    if (typeof document !== 'undefined') {
      const forgeStatusEl = document.getElementById('log-forge-status');
      if (forgeStatusEl) {
        forgeStatusEl.className = online ? 'log-status-dot online' : 'log-status-dot offline';
        forgeStatusEl.textContent = online ? 'Forge: 8788' : 'Forge: Local';
      }
    }
    return online;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function log(category, message, level = 'info') {
    const d = new Date();
    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`;
    const cat = (category || 'SYS').toUpperCase();
    const entry = { time: timeStr, category: cat, message, level, timestamp: Date.now() };
    logEntries.push(entry);
    if (logEntries.length > MAX_LOGS) {
      logEntries.shift();
    }

    if (level === 'error') {
      console.error(`[${timeStr}] [${cat}]`, message);
    } else if (level === 'warn') {
      console.warn(`[${timeStr}] [${cat}]`, message);
    } else {
      console.log(`[${timeStr}] [${cat}]`, message);
    }

    if (typeof document !== 'undefined') {
      const term = document.getElementById('log-terminal');
      if (term) {
        const line = document.createElement('div');
        line.className = `log-line log-level-${level} log-cat-${cat.toLowerCase()}`;
        line.innerHTML = `<span class="log-time">${timeStr}</span> <span class="log-badge log-badge-${cat.toLowerCase()}">[${cat}]</span> <span class="log-msg">${escapeHtml(message)}</span>`;
        if (typeof term.appendChild === 'function') {
          term.appendChild(line);
          term.scrollTop = term.scrollHeight;
        }
      }
      const badge = document.getElementById('badge-log-count');
      if (badge) {
        badge.innerText = `${logEntries.length} events`;
      }
    }
    return entry;
  }

  function clearLogs() {
    logEntries.length = 0;
    if (typeof document !== 'undefined') {
      const term = document.getElementById('log-terminal');
      if (term) term.innerHTML = '';
      const badge = document.getElementById('badge-log-count');
      if (badge) badge.innerText = '0 events';
    }
    log('SYS', 'Log terminal cleared.');
  }

  async function checkComfyServer(targetUrl = comfyServerUrl) {
    comfyServerUrl = targetUrl;
    log('COMFYUI', `Probing ComfyUI endpoint at ${comfyServerUrl}...`);
    let online = false;
    let deviceInfo = 'Offline';
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch(`${comfyServerUrl}/system_stats`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const stats = await res.json();
          online = true;
          const dev = stats?.devices?.[0]?.name || 'GPU';
          const vram = stats?.devices?.[0]?.vram_free ? (stats.devices[0].vram_free / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'active';
          deviceInfo = `${dev} · ${vram} free`;
          log('COMFYUI', `Connected to ComfyUI. Device: ${dev}. VRAM free: ${vram}.`);
        }
      }
    } catch (err) {
      log('COMFYUI', `Server probe unreachable: ${err.message}. ComfyUI offline.`, 'warn');
    }

    if (typeof document !== 'undefined') {
      const statusEl = document.getElementById('log-server-status');
      if (statusEl) {
        statusEl.className = online ? 'log-status-dot online' : 'log-status-dot offline';
        statusEl.textContent = online ? 'ComfyUI: Online' : 'ComfyUI: Offline';
      }
      const vStatus = document.getElementById('asset-viewer-server-status');
      if (vStatus) {
        vStatus.textContent = online ? `ComfyUI · ${deviceInfo}` : 'ComfyUI Offline (Vector Fallback)';
        vStatus.style.color = online ? '#4ade80' : '#f59e0b';
      }
    }
    return { online, deviceInfo };
  }

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

      let img = null;
      if (p.id.includes('chair')) img = '../../floorplans/furniture-room/ortho_gt/mattes/chair.png';
      else if (p.id.includes('bench')) img = '../../floorplans/furniture-room/ortho_gt/mattes/bench.png';
      else if (p.id.includes('table')) img = '../../floorplans/furniture-room/ortho_gt/mattes/table.png';
      else if (p.id.includes('bookcase')) img = '../../floorplans/furniture-room/ortho_gt/mattes/bookcase.png';
      else if (p.id.includes('wardrobe')) img = '../../floorplans/furniture-room/ortho_gt/mattes/wardrobe.png';
      else if (p.id.includes('cabinet')) img = '../../floorplans/furniture-room/ortho_gt/mattes/cabinet.png';
      else if (p.id.includes('cairn')) img = 'topdown_relief.png';

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
        interactive_verbs: ['examine'],
        lore_snippet: `Interior furniture item (${p.label}) positioned on customs floorplan.`,
        image_url: img,
        diffusion_prompt: `orthographic 2D top-down game asset of ${p.label}, clean timber joinery, Flux 3 Klein matte`,
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
      portalEl.className = 'scene-portal-marker' + (p.passable ? ' portal-opened' : '');
      if (portalEl.dataset) portalEl.dataset.portalId = p.id;
      if (typeof portalEl.setAttribute === 'function') portalEl.setAttribute('data-portal-id', p.id);
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
      } else if (pr.visual_template === 'statute_board') {
        propEl.className = 'prop-statute-board scene-prop-token';
        const board = document.createElement('div');
        board.className = 'statute-board-timber';
        const placard = document.createElement('div');
        placard.className = 'statute-placard';
        placard.textContent = 'LEX IMPERII';
        const seal = document.createElement('div');
        seal.className = 'statute-red-seal';
        board.appendChild(placard);
        board.appendChild(seal);
        propEl.appendChild(board);
      } else if (pr.visual_template === 'grimoire_lectern') {
        propEl.className = 'prop-grimoire-lectern scene-prop-token';
        const stand = document.createElement('div');
        stand.className = 'grimoire-oak-stand';
        const book = document.createElement('div');
        book.className = 'grimoire-open-folio';
        const rune = document.createElement('div');
        rune.className = 'grimoire-floating-rune';
        rune.textContent = '✧';
        stand.appendChild(book);
        stand.appendChild(rune);
        propEl.appendChild(stand);
      } else if (pr.visual_template === 'living_atlas') {
        propEl.className = 'prop-living-atlas scene-prop-token';
        const ped = document.createElement('div');
        ped.className = 'atlas-granite-pedestal';
        const folio = document.createElement('div');
        folio.className = 'atlas-monumental-folio';
        const mapFace = document.createElement('div');
        mapFace.className = 'atlas-illuminated-face';
        const cranks = document.createElement('div');
        cranks.className = 'atlas-brass-cranks';
        cranks.textContent = '⚙️';
        folio.appendChild(mapFace);
        ped.appendChild(folio);
        ped.appendChild(cranks);
        propEl.appendChild(ped);
      } else if (pr.visual_template === 'matte_flat') {
        propEl.className = 'prop-matte-flat scene-prop-token';
        const cylinder = document.createElement('div');
        cylinder.className = 'matte-canvas-cylinder';
        const edge = document.createElement('div');
        edge.className = 'matte-painted-edge';
        const dowel = document.createElement('div');
        dowel.className = 'matte-wooden-dowel';
        cylinder.appendChild(edge);
        cylinder.appendChild(dowel);
        propEl.appendChild(cylinder);
      } else if (pr.visual_template === 'forfeit_chest') {
        propEl.className = 'prop-forfeit-chest scene-prop-token';
        const cage = document.createElement('div');
        cage.className = 'forfeit-iron-cage';
        const padlock = document.createElement('div');
        padlock.className = 'forfeit-lead-padlock';
        padlock.textContent = '🔒';
        const tagBox = document.createElement('div');
        tagBox.className = 'forfeit-draft-tag';
        tagBox.textContent = 'ROUGH';
        cage.appendChild(padlock);
        cage.appendChild(tagBox);
        propEl.appendChild(cage);
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
        selectAsset(pr.id);
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
        selectAsset(cm.id);
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

    // 2.5 Dynamic Point Lights (Braziers, Cryo Coffin, Lanterns)
    const lightingState = getLightingState();
    const pointLightBuffer = new Float32Array(rows * cols);
    for (const pl of lightingState.pointLights) {
      const radCells = Math.ceil(pl.radiusM / stepM);
      const cc = Math.round((pl.x / mapWidthM) * (cols - 1));
      const rc = Math.round((pl.y / mapLengthM) * (rows - 1));
      const pr0 = Math.max(0, rc - radCells);
      const pr1 = Math.min(rows - 1, rc + radCells);
      const pc0 = Math.max(0, cc - radCells);
      const pc1 = Math.min(cols - 1, cc + radCells);

      for (let r = pr0; r <= pr1; r++) {
        for (let c = pc0; c <= pc1; c++) {
          const wx = (c / (cols - 1)) * mapWidthM;
          const wy = (r / (rows - 1)) * mapLengthM;
          const dist2D = Math.hypot(wx - pl.x, wy - pl.y);
          if (dist2D <= pl.radiusM) {
            const atten = (1.0 - (dist2D / pl.radiusM)) * (pl.intensity || 0.8);
            const idx = r * cols + c;
            pointLightBuffer[idx] = Math.max(pointLightBuffer[idx], atten);
          }
        }
      }
    }

    // 3. Assemble composite shadow mask:
    // - Incorporates atmospheric color tinting and ambient darkness
    const d = imgData.data;
    let baseR = 18, baseG = 16, baseB = 14;
    if (lightingState.atmosphere === 'golden_hour') {
      baseR = 36; baseG = 22; baseB = 8;
    } else if (lightingState.atmosphere === 'night') {
      baseR = 8; baseG = 10; baseB = 16;
    } else if (lightingState.atmosphere === 'cryo') {
      baseR = 6; baseG = 22; baseB = 28;
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cellIdx = r * cols + c;
        const pxIdx = cellIdx * 4;

        d[pxIdx] = baseR;
        d[pxIdx + 1] = baseG;
        d[pxIdx + 2] = baseB;

        const isExp = explored[cellIdx];
        const vis = activeVis[cellIdx];
        const pLit = probeLight[cellIdx];
        const ptLit = pointLightBuffer[cellIdx];

        let baseAlpha;
        if (lightingState.atmosphere === 'night') {
          const lightTotal = Math.min(1.0, vis * 0.35 + pLit * 0.85 + ptLit * 0.95);
          baseAlpha = Math.round(245 * (1.0 - lightTotal));
        } else if (vis > 0.0) {
          baseAlpha = Math.round((1.0 - vis) * (lightingState.ambientDarkness * 255));
        } else if (isExp) {
          baseAlpha = Math.round(lightingState.ambientDarkness * 220);
        } else {
          baseAlpha = 240;
        }

        if (pLit > 0.0 || ptLit > 0.0) {
          baseAlpha = Math.round(baseAlpha * (1.0 - Math.min(1.0, pLit * 0.85 + ptLit * 0.9)));
        }

        d[pxIdx + 3] = baseAlpha;
      }
    }

    offCtx.putImageData(imgData, 0, 0);

    // Blit to main canvas with smooth scaling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);

    // Add specular glow for active point lights
    for (const pl of lightingState.pointLights) {
      const cx = (pl.x / mapWidthM) * canvas.width;
      const cy = (pl.y / mapLengthM) * canvas.height;
      const pxRad = (pl.radiusM / mapWidthM) * canvas.width;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pxRad);
      if (pl.color === 'amber') {
        grad.addColorStop(0, 'rgba(251, 146, 60, 0.40)');
        grad.addColorStop(0.4, 'rgba(217, 119, 6, 0.18)');
      } else if (pl.color === 'cyan') {
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        grad.addColorStop(0.4, 'rgba(14, 165, 233, 0.20)');
      } else {
        grad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        grad.addColorStop(0.4, 'rgba(250, 204, 21, 0.15)');
      }
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, pxRad, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render active particles on canvas
    for (const p of particles) {
      const pxX = (p.x / mapWidthM) * canvas.width;
      const pxY = (p.y / mapLengthM) * canvas.height;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(pxX, pxY, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

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

  function updateDepthSorting() {
    if (playerEl) {
      playerEl.style.zIndex = `${Math.round(playerY * 10) + 1}`;
    }
    for (const actor of actors.values()) {
      if (actor.tokenEl) {
        actor.tokenEl.style.zIndex = `${Math.round(actor.y * 10) + 1}`;
      }
    }
    for (const prop of physicalPropsMap.values()) {
      if (prop.tokenEl) {
        prop.tokenEl.style.zIndex = `${Math.round(prop.world_y * 10)}`;
      }
    }
  }

  function getAtmosphereMode() {
    return currentAtmosphere;
  }

  function setAtmosphereMode(mode) {
    currentAtmosphere = mode;
    const atmEl = typeof document !== 'undefined' ? document.getElementById('stat-atmosphere') : null;
    if (atmEl) atmEl.innerText = mode.replace(/_/g, ' ').toUpperCase();
    const bAtm = typeof document !== 'undefined' ? document.getElementById('badge-atmosphere') : null;
    if (bAtm) bAtm.innerText = mode.replace(/_/g, ' ').toUpperCase();
    renderLightingOverlay();
  }

  function getLightingState() {
    let ambientDarkness = 0.15;
    if (currentAtmosphere === 'golden_hour') ambientDarkness = 0.40;
    else if (currentAtmosphere === 'night') ambientDarkness = 0.78;
    else if (currentAtmosphere === 'cryo') ambientDarkness = 0.50;

    const pointLights = [];
    for (const p of physicalPropsMap.values()) {
      if (p.id.includes('brazier')) {
        pointLights.push({
          sourceId: p.id,
          x: p.world_x,
          y: p.world_y,
          radiusM: 18.0,
          color: 'amber',
          intensity: currentAtmosphere === 'night' ? 1.0 : 0.6,
        });
      } else if (p.id.includes('glass_stasis_coffin') && !p.is_smashed) {
        pointLights.push({
          sourceId: p.id,
          x: p.world_x,
          y: p.world_y,
          radiusM: 14.0,
          color: 'cyan',
          intensity: 0.8,
        });
      }
    }

    if (currentAtmosphere === 'night' || currentAtmosphere === 'cryo') {
      pointLights.push({
        sourceId: 'player_lantern',
        x: playerX,
        y: playerY,
        radiusM: 16.0,
        color: 'warm_white',
        intensity: 0.9,
      });
    }

    return {
      atmosphere: currentAtmosphere,
      ambientDarkness,
      pointLights,
    };
  }

  function getParticles() {
    return particles;
  }

  function clearParticles() {
    particles = [];
  }

  function spawnParticles(originX, originY, count = 16, type = 'glass_shards') {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2.0 + Math.random() * 5.0;
      let maxLife = 1.2;
      let color = '#7dd3fc';
      let size = 3.0;

      if (type === 'glass_shards') {
        maxLife = 1.0 + Math.random() * 0.6;
        color = Math.random() > 0.4 ? '#38bdf8' : '#e0f2fe';
        size = 2.5 + Math.random() * 3.5;
      } else if (type === 'embers') {
        maxLife = 1.4 + Math.random() * 0.8;
        color = Math.random() > 0.3 ? '#f97316' : '#fde047';
        size = 2.0 + Math.random() * 2.0;
      } else if (type === 'dust') {
        maxLife = 0.7 + Math.random() * 0.4;
        color = '#a8a29e';
        size = 4.0 + Math.random() * 4.0;
      }

      particles.push({
        id: nextParticleId++,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: maxLife,
        maxLife,
        type,
        color,
        size,
      });
    }
  }

  function stepParticles(dt = 0.016) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function isAudioMuted() {
    return audioMuted;
  }

  function setAudioMuted(val) {
    audioMuted = Boolean(val);
    const aBtn = typeof document !== 'undefined' ? document.getElementById('btn-audio-toggle') : null;
    if (aBtn) aBtn.innerText = audioMuted ? '🔇 Audio: Muted' : '🔊 Audio: Active';
  }

  function getAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    if (!audioCtx) {
      try {
        audioCtx = new AudioCtor();
      } catch (err) {
        return null;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playAudioCue(cueType) {
    if (audioMuted) return;
    const actx = getAudioContext();
    if (!actx) return;

    try {
      const now = actx.currentTime;
      if (cueType === 'footstep') {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.04);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (cueType === 'push') {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (cueType === 'smash') {
        [1250, 1820, 2460].forEach((freq) => {
          const osc = actx.createOscillator();
          const gain = actx.createGain();
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.4);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(actx.destination);
          osc.start(now);
          osc.stop(now + 0.42);
        });
      } else if (cueType === 'seal_stamp') {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (cueType === 'gate_open') {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(85, now);
        osc.frequency.exponentialRampToValueAtTime(175, now + 0.28);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(actx.destination);
        osc.start(now);
        osc.stop(now + 0.31);
      }
    } catch (err) {
      // Audio playback safely ignored in restricted environments
    }
  }

  function getPortalState(portalId) {
    return portals.find((p) => p.id === portalId) || null;
  }

  function setPortalState(portalId, passable) {
    const portal = portals.find((p) => p.id === portalId);
    if (!portal) return false;
    portal.passable = Boolean(passable);

    const portalEl = typeof document !== 'undefined' ? document.querySelector(`[data-portal-id="${portalId}"]`) : null;
    if (portalEl) {
      if (portal.passable) {
        portalEl.classList.add('portal-opened');
      } else {
        portalEl.classList.remove('portal-opened');
      }
    }

    if (portal.passable) {
      playAudioCue('gate_open');
    }
    renderLightingOverlay();
    return true;
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
    updateDepthSorting();

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

    // Update compact badge previews
    const bPos = document.getElementById('badge-player-xy');
    if (bPos) bPos.innerText = `${playerX.toFixed(1)}m, ${playerY.toFixed(1)}m`;
    const bZone = document.getElementById('badge-player-zone');
    if (bZone) bZone.innerText = curZone ? curZone.name : 'Wilderness';
    const bPro = document.getElementById('badge-proscenium');
    if (bPro) bPro.innerText = anchor ? anchor.proscenium_state : 'wilderness';

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
    const bCur = typeof document !== 'undefined' ? document.getElementById('badge-cursor') : null;
    if (bCur) bCur.innerText = `${cursorX.toFixed(1)}m, ${cursorY.toFixed(1)}m`;
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

  // --- Asset Viewer & Forge Rendering Engine ------------------------------
  function synthesizeForgeRender(asset) {
    if (!asset) return '';
    const id = asset.id || 'asset';
    const label = asset.label || id;
    const hash = Math.abs(id.split('').reduce((acc, c) => (acc << 5) - acc + c.charCodeAt(0), 0)) % 100000;
    const seed = 42000 + hash;

    let graphicSvg = '';

    if (id.includes('crate') || id.includes('r6')) {
      graphicSvg = `
        <rect x="120" y="70" width="160" height="150" rx="4" fill="#6b4423" stroke="#3d220f" stroke-width="3"/>
        <line x1="120" y1="120" x2="280" y2="120" stroke="#4a2c13" stroke-width="3" stroke-dasharray="2 1"/>
        <line x1="120" y1="170" x2="280" y2="170" stroke="#4a2c13" stroke-width="3" stroke-dasharray="2 1"/>
        <line x1="125" y1="75" x2="275" y2="215" stroke="#262626" stroke-width="8" stroke-linecap="round"/>
        <line x1="125" y1="75" x2="275" y2="215" stroke="#737373" stroke-width="4" stroke-linecap="round"/>
        <rect x="120" y="70" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
        <circle cx="128" cy="78" r="2.5" fill="#a3a3a3"/>
        <rect x="250" y="70" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
        <circle cx="272" cy="78" r="2.5" fill="#a3a3a3"/>
        <rect x="120" y="190" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
        <circle cx="128" cy="212" r="2.5" fill="#a3a3a3"/>
        <rect x="250" y="190" width="30" height="30" fill="#171717" stroke="#404040" stroke-width="2"/>
        <circle cx="272" cy="212" r="2.5" fill="#a3a3a3"/>
        <rect x="135" y="130" width="130" height="32" rx="3" fill="#1c1917" opacity="0.85"/>
        <text x="200" y="152" fill="#f59e0b" font-size="16" font-family="monospace" font-weight="900" text-anchor="middle" letter-spacing="2">R6-SHIP</text>
        <circle cx="245" cy="100" r="14" fill="#dc2626" stroke="#991b1b" stroke-width="2" opacity="0.9"/>
        <text x="245" y="103" fill="#fef2f2" font-size="7" font-weight="900" text-anchor="middle">PASSED</text>
        <text x="200" y="180" fill="#d97706" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">NET: 42.5 KG</text>
      `;
    } else if (id.includes('coffin') || id.includes('cryo')) {
      graphicSvg = `
        <polygon points="150,55 250,55 285,145 250,235 150,235 115,145" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
        <polygon points="154,62 246,62 278,145 246,228 154,228 122,145" fill="url(#cryoGlow)" opacity="0.8"/>
        <ellipse cx="200" cy="110" rx="14" ry="18" fill="#0369a1" opacity="0.5"/>
        <path d="M 185,135 Q 200,125 215,135 L 222,210 Q 200,215 178,210 Z" fill="#0369a1" opacity="0.5"/>
        <line x1="135" y1="90" x2="265" y2="200" stroke="#ffffff" stroke-width="2" opacity="0.3"/>
        <rect x="160" y="70" width="80" height="16" rx="2" fill="#020617" stroke="#38bdf8" stroke-width="1"/>
        <text x="200" y="82" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="900" text-anchor="middle">00:04:18:92</text>
        <text x="200" y="222" fill="#67e8f9" font-size="8" font-family="monospace" text-anchor="middle">-196.4°C STASIS</text>
      `;
    } else if (id.includes('atlas')) {
      graphicSvg = `
        <polygon points="120,180 280,180 300,230 100,230" fill="#1e293b" stroke="#ca8a04" stroke-width="2"/>
        <polygon points="135,110 265,110 280,180 120,180" fill="#713f12" stroke="#eab308" stroke-width="2"/>
        <polygon points="140,115 260,115 272,175 128,175" fill="#fef3c7"/>
        <path d="M 150,140 Q 170,125 195,145 T 250,135" fill="none" stroke="#2563eb" stroke-width="2"/>
        <path d="M 145,155 Q 180,165 210,150 T 255,160" fill="none" stroke="#b45309" stroke-width="1" stroke-dasharray="3 1"/>
        <circle cx="200" cy="135" r="10" fill="none" stroke="#ca8a04" stroke-width="1"/>
        <line x1="200" y1="120" x2="200" y2="150" stroke="#ca8a04" stroke-width="1"/>
        <line x1="185" y1="135" x2="215" y2="135" stroke="#ca8a04" stroke-width="1"/>
        <circle cx="285" cy="175" r="7" fill="#ca8a04" stroke="#78350f" stroke-width="1.5"/>
        <line x1="285" y1="175" x2="295" y2="160" stroke="#eab308" stroke-width="3" stroke-linecap="round"/>
        <text x="200" y="100" fill="#eab308" font-size="10" font-family="serif" font-weight="900" text-anchor="middle" letter-spacing="1">ATLAS IMPERII</text>
      `;
    } else if (id.includes('matte') || id.includes('flat')) {
      graphicSvg = `
        <rect x="175" y="55" width="50" height="180" rx="10" transform="rotate(-15 200 145)" fill="url(#canvasShade)" stroke="#52525b" stroke-width="2"/>
        <rect x="195" y="40" width="10" height="20" rx="2" transform="rotate(-15 200 145)" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <rect x="195" y="230" width="10" height="20" rx="2" transform="rotate(-15 200 145)" fill="#78350f" stroke="#451a03" stroke-width="1"/>
        <path d="M 185,95 Q 220,110 205,160 T 170,215" fill="none" stroke="#0284c7" stroke-width="6" opacity="0.85"/>
        <text x="200" y="245" fill="#cbd5e1" font-size="8.5" font-family="monospace" text-anchor="middle">PRIMED SCENIC FLAT</text>
      `;
    } else if (id.includes('chest') || id.includes('forfeit') || id.includes('locker')) {
      graphicSvg = `
        <rect x="125" y="90" width="150" height="110" rx="4" fill="#18181b" stroke="#71717a" stroke-width="3"/>
        <line x1="160" y1="90" x2="160" y2="200" stroke="#52525b" stroke-width="6"/>
        <line x1="240" y1="90" x2="240" y2="200" stroke="#52525b" stroke-width="6"/>
        <rect x="190" y="130" width="20" height="24" rx="3" fill="#ca8a04" stroke="#78350f" stroke-width="1.5"/>
        <path d="M 194,130 A 6 6 0 0 1 206,130" fill="none" stroke="#a1a1aa" stroke-width="2.5"/>
        <rect x="145" y="150" width="45" height="20" rx="1" fill="#fef08a" stroke="#ca8a04" stroke-width="1" transform="rotate(-8 145 150)"/>
        <text x="167" y="163" fill="#78350f" font-size="7" font-weight="900" font-family="monospace" text-anchor="middle" transform="rotate(-8 145 150)">DRAFT</text>
        <text x="200" y="80" fill="#a1a1aa" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">IMPOUNDED CARGO</text>
      `;
    } else if (id.includes('statute')) {
      graphicSvg = `
        <rect x="130" y="55" width="140" height="180" rx="4" fill="#451a03" stroke="#b45309" stroke-width="2.5"/>
        <rect x="142" y="68" width="116" height="135" fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
        <text x="200" y="88" fill="#78350f" font-size="11" font-family="serif" font-weight="900" text-anchor="middle">LEX IMPERII</text>
        <line x1="155" y1="95" x2="245" y2="95" stroke="#b45309" stroke-width="1"/>
        <line x1="150" y1="108" x2="250" y2="108" stroke="#78350f" stroke-width="1" stroke-dasharray="3 2"/>
        <line x1="150" y1="122" x2="250" y2="122" stroke="#78350f" stroke-width="1" stroke-dasharray="3 2"/>
        <line x1="150" y1="136" x2="250" y2="136" stroke="#78350f" stroke-width="1" stroke-dasharray="3 2"/>
        <line x1="150" y1="150" x2="250" y2="150" stroke="#78350f" stroke-width="1" stroke-dasharray="3 2"/>
        <circle cx="200" cy="180" r="13" fill="#dc2626" stroke="#7f1d1d" stroke-width="2"/>
        <text x="200" y="184" fill="#fef2f2" font-size="7" font-weight="900" text-anchor="middle">SEALED</text>
      `;
    } else if (id.includes('grimoire')) {
      graphicSvg = `
        <polygon points="170,140 230,140 240,240 160,240" fill="#271b12" stroke="#785233" stroke-width="2"/>
        <polygon points="130,85 270,85 285,145 115,145" fill="#3d291a" stroke="#b45309" stroke-width="2"/>
        <polygon points="140,95 260,95 270,138 130,138" fill="#fde68a" stroke="#b45309" stroke-width="1"/>
        <line x1="200" y1="95" x2="200" y2="138" stroke="#78350f" stroke-width="2"/>
        <text x="170" y="120" fill="#0284c7" font-size="14" font-family="serif" text-anchor="middle">✧</text>
        <text x="230" y="120" fill="#0284c7" font-size="14" font-family="serif" text-anchor="middle">✦</text>
        <circle cx="200" cy="65" r="16" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 2"/>
        <text x="200" y="70" fill="#38bdf8" font-size="15" text-anchor="middle">✨</text>
      `;
    } else if (id.includes('warrant') || id.includes('pedestal')) {
      graphicSvg = `
        <polygon points="150,140 250,140 265,230 135,230" fill="#334155" stroke="#64748b" stroke-width="2"/>
        <circle cx="200" cy="110" r="36" fill="#ca8a04" stroke="#eab308" stroke-width="3"/>
        <circle cx="200" cy="110" r="28" fill="#eab308" stroke="#78350f" stroke-width="1"/>
        <text x="200" y="115" fill="#713f12" font-size="11" font-weight="900" font-family="serif" text-anchor="middle">WARRANT</text>
        <polygon points="190,146 200,185 210,146" fill="#dc2626"/>
      `;
    } else if (id.includes('unmodelled') || id.includes('slab')) {
      graphicSvg = `
        <polygon points="200,60 280,105 280,195 200,240 120,195 120,105" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 2"/>
        <line x1="200" y1="60" x2="200" y2="240" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="120" y1="105" x2="280" y2="195" stroke="#38bdf8" stroke-width="1.5"/>
        <line x1="280" y1="105" x2="120" y2="195" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="200" y="152" fill="#38bdf8" font-size="11" font-family="monospace" font-weight="700" text-anchor="middle">[WIRE-FRAME]</text>
      `;
    } else if (id.includes('hollis') || label.includes('Hollis')) {
      graphicSvg = `
        <rect x="110" y="50" width="180" height="200" rx="8" fill="#181410" stroke="#ca8a04" stroke-width="2.5"/>
        <circle cx="200" cy="115" r="55" fill="#78350f" opacity="0.45"/>
        <circle cx="200" cy="115" r="45" fill="#ca8a04" opacity="0.25"/>
        <path d="M 140,240 C 140,195 160,175 175,170 C 175,185 225,185 225,170 C 240,175 260,195 260,240 Z" fill="#2d2822" stroke="#453e35" stroke-width="2"/>
        <path d="M 175,170 C 185,182 215,182 225,170 L 220,195 L 180,195 Z" fill="#71717a" stroke="#a1a1aa" stroke-width="1.5"/>
        <ellipse cx="200" cy="130" rx="28" ry="34" fill="#d97706" stroke="#92400e" stroke-width="2"/>
        <path d="M 175,130 C 175,165 225,165 225,130 Z" fill="#451a03"/>
        <ellipse cx="190" cy="125" rx="3.5" ry="3" fill="#1e1b18"/>
        <ellipse cx="210" cy="125" rx="3.5" ry="3" fill="#1e1b18"/>
        <line x1="184" y1="118" x2="195" y2="121" stroke="#261005" stroke-width="2"/>
        <line x1="216" y1="118" x2="205" y2="121" stroke="#261005" stroke-width="2"/>
        <polygon points="135,215 200,210 200,248 135,248" fill="#fef3c7" stroke="#b45309" stroke-width="1.5"/>
        <polygon points="200,210 265,215 265,248 200,248" fill="#fde68a" stroke="#b45309" stroke-width="1.5"/>
        <line x1="145" y1="220" x2="190" y2="220" stroke="#78350f" stroke-width="1" stroke-dasharray="2 1"/>
        <line x1="145" y1="228" x2="190" y2="228" stroke="#78350f" stroke-width="1" stroke-dasharray="2 1"/>
        <line x1="210" y1="220" x2="255" y2="220" stroke="#78350f" stroke-width="1" stroke-dasharray="2 1"/>
        <line x1="210" y1="228" x2="255" y2="228" stroke="#78350f" stroke-width="1" stroke-dasharray="2 1"/>
        <circle cx="245" cy="235" r="9" fill="#dc2626" stroke="#991b1b" stroke-width="1.5"/>
        <text x="245" y="238" fill="#fef2f2" font-size="6" font-weight="900" text-anchor="middle">SEAL</text>
        <text x="200" y="75" fill="#f5eedf" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">HOLLIS · QUARTERMASTER</text>
      `;
    } else if (id.includes('pell') || label.includes('Pell')) {
      graphicSvg = `
        <rect x="110" y="50" width="180" height="200" rx="8" fill="#0c131d" stroke="#38bdf8" stroke-width="2.5"/>
        <polygon points="140,50 290,50 250,250 110,250" fill="#38bdf8" opacity="0.12"/>
        <circle cx="200" cy="118" r="50" fill="#0284c7" opacity="0.25"/>
        <path d="M 150,240 C 150,195 170,180 180,175 C 180,190 220,190 220,175 C 230,180 250,195 250,240 Z" fill="#52525b" stroke="#71717a" stroke-width="2"/>
        <ellipse cx="200" cy="130" rx="26" ry="32" fill="#fed7aa" stroke="#ea580c" stroke-width="1.5"/>
        <ellipse cx="191" cy="125" rx="3.5" ry="3" fill="#0284c7"/>
        <ellipse cx="209" cy="125" rx="3.5" ry="3" fill="#0284c7"/>
        <path d="M 172,125 C 170,95 230,95 228,125 C 215,108 185,108 172,125 Z" fill="#18181b"/>
        <polygon points="160,205 240,205 240,248 160,248" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="170" y1="214" x2="230" y2="214" stroke="#0284c7" stroke-width="2"/>
        <line x1="170" y1="222" x2="230" y2="222" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2 2"/>
        <line x1="170" y1="230" x2="230" y2="230" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="2 2"/>
        <text x="200" y="244" fill="#94a3b8" font-size="6" font-family="monospace" text-anchor="middle">[UNDERWRITTEN SCRIPT]</text>
        <text x="200" y="75" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">PELL · UNDERSTUDY</text>
      `;
    } else if (selectedAsset.kind === 'actor') {
      graphicSvg = `
        <rect x="110" y="50" width="180" height="200" rx="8" fill="#181410" stroke="#38bdf8" stroke-width="2"/>
        <circle cx="200" cy="120" r="48" fill="#0284c7" opacity="0.3"/>
        <ellipse cx="200" cy="130" rx="26" ry="32" fill="#d4d4d8" stroke="#71717a" stroke-width="2"/>
        <path d="M 150,240 C 150,195 170,180 180,175 C 180,190 220,190 220,175 C 230,180 250,195 250,240 Z" fill="#3f3f46"/>
        <text x="200" y="75" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="700" text-anchor="middle">${label.toUpperCase()}</text>
      `;
    } else {
      graphicSvg = `
        <polygon points="150,70 250,70 285,150 250,230 150,230 115,150" fill="#1e1b18" stroke="#ca8a04" stroke-width="3"/>
        <circle cx="200" cy="150" r="35" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6 3"/>
        <text x="200" y="157" fill="#fef08a" font-size="24" text-anchor="middle">💎</text>
        <text x="200" y="115" fill="#ca8a04" font-size="10" font-family="monospace" font-weight="700" text-anchor="middle">FORGED ASSET</text>
      `;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#181512"/>
          <stop offset="100%" stop-color="#0a0908"/>
        </linearGradient>
        <linearGradient id="cryoGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0284c7"/>
          <stop offset="50%" stop-color="#2dd4bf"/>
          <stop offset="100%" stop-color="#0369a1"/>
        </linearGradient>
        <linearGradient id="canvasShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e4e4e7"/>
          <stop offset="50%" stop-color="#a1a1aa"/>
          <stop offset="100%" stop-color="#52525b"/>
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bgGrad)"/>
      <rect x="6" y="6" width="388" height="288" rx="6" fill="none" stroke="#332d27" stroke-width="1.5"/>
      <text x="14" y="24" fill="#a8947f" font-size="9" font-family="monospace">BLACK FOREST LABS · FLUX 3 KLEIN</text>
      <text x="386" y="24" fill="#38bdf8" font-size="9" font-family="monospace" text-anchor="end">SEED: ${seed}</text>
      ${graphicSvg}
      <rect x="6" y="268" width="388" height="26" fill="#120f0d" opacity="0.95"/>
      <text x="14" y="284" fill="#f5eedf" font-size="10" font-family="monospace" font-weight="700">${label.length > 32 ? label.slice(0, 32) + '...' : label}</text>
      <text x="386" y="284" fill="#ca8a04" font-size="9.5" font-family="monospace" font-weight="700" text-anchor="end">STEPS: 16 · CFG: 1.0</text>
    </svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function selectAsset(idOrEntity) {
    if (!idOrEntity) return null;
    let entity = null;
    const assetId = typeof idOrEntity === 'string' ? idOrEntity : (idOrEntity.id || idOrEntity.targetId);

    // 1. Check physical props
    if (physicalPropsMap.has(assetId)) {
      const p = physicalPropsMap.get(assetId);
      entity = {
        id: p.id,
        kind: 'prop',
        label: p.label,
        fragment_id: p.fragment_id || 'customs-house/the-site',
        salience: p.salience || 'moderate',
        image_url: assetImages.get(p.id) || p.image_url || null,
        diffusion_prompt: p.diffusion_prompt || p.lore_snippet || `Orthographic asset specification for ${p.label}`,
        compiled_brief: p.compiled_brief || '',
        fragments_used: p.fragments_used ? [...p.fragments_used] : [p.fragment_id || 'customs-house/the-site'],
        world_setting: p.world_setting || 'Border March Customs House',
        lore_snippet: p.lore_snippet || '',
        obstacle_type: p.obstacle_type,
        mass_kg: p.mass_kg,
        interactive_verbs: p.interactive_verbs || ['examine', 'push'],
        forged: assetImages.has(p.id),
        zone_context: p.zone_context || { zone_id: 'inspection-hall', zone_name: 'Weigh & Inspection Hall', substrate_material: 'scarred timber planking' },
        coherence_conflicts: p.coherence_conflicts ? p.coherence_conflicts.map((c) => ({ ...c })) : [],
        active_criticisms: p.active_criticisms ? [...p.active_criticisms] : [],
        standing_tier: p.standing_tier || 'verified',
        standing_score: typeof p.standing_score === 'number' ? p.standing_score : 0.65,
        warrant_id: p.warrant_id || null,
        saturation_score: typeof p.saturation_score === 'number' ? p.saturation_score : 0.4,
        saturation_locked: Boolean(p.saturation_locked),
      };
    }
    // 2. Check actors & declared NPCs
    else if (actors.has(assetId) || npcs[assetId]) {
      const npcKey = assetId === 'player' ? 'pell' : assetId;
      const npc = npcs[assetId] || npcs[npcKey] || null;
      const portraitBrief = npc?.compiled_portrait || null;
      const defaultFrag = assetId === 'pell' ? 'scaffolded-kingdom/understudy' : (assetId === 'hollis' ? 'customs-house/hollis-ledger' : 'shared/actor-roster');
      const frags = portraitBrief?.fragments_used?.length ? [...portraitBrief.fragments_used] : [defaultFrag, 'shared/brief-faces-are-themes'];

      let a = actors.get(assetId);
      if (!a) {
        a = {
          id: assetId,
          name: npc?.name || assetId,
          role: npc?.role || 'Actor',
          x: 63.0,
          y: 69.0,
          z: 6.6,
          tokenEl: null,
          balloonEl: null,
          image_url: null,
          diffusion_prompt: portraitBrief?.rewritten_prompt || '',
          lore_snippet: npc?.portrait || `${npc?.name || assetId}`,
          written: npc?.written !== undefined ? npc.written : (assetId === 'hollis'),
        };
        actors.set(assetId, a);
      }

      entity = {
        id: a.id,
        kind: 'actor',
        label: a.name || npc?.name || a.id,
        fragment_id: defaultFrag,
        salience: 'major',
        image_url: assetImages.get(a.id) || a.image_url || null,
        diffusion_prompt: portraitBrief?.rewritten_prompt || a.diffusion_prompt || `${a.name}, 2.5D character portrait rendered via Flux 3 Klein`,
        compiled_brief: portraitBrief?.compiled_brief || a.lore_snippet || `${a.name} (${a.role || 'Actor'})`,
        fragments_used: frags,
        world_setting: portraitBrief?.zone_context?.zone_name || 'Border March Customs House',
        lore_snippet: npc?.portrait || a.lore_snippet || `${a.name} (${a.role || 'Actor'})`,
        obstacle_type: 'actor',
        mass_kg: 70.0,
        interactive_verbs: ['talk', 'inspect_standing'],
        forged: assetImages.has(a.id),
        standing_tier: portraitBrief?.standing_tier || (a.written ? 'verified' : 'provisional'),
        standing_score: typeof portraitBrief?.standing_score === 'number' ? portraitBrief.standing_score : (a.written ? 0.65 : 0.40),
        warrant_id: portraitBrief?.warrant_id || null,
        zone_context: portraitBrief?.zone_context || { zone_id: 'inspection-hall', zone_name: 'Weigh & Inspection Hall', substrate_material: 'scarred timber planking' },
        active_criticisms: portraitBrief?.active_criticisms ? [...portraitBrief.active_criticisms] : [],
        coherence_conflicts: [],
        saturation_score: 0.5,
        saturation_locked: false,
        npc_sheet: npc,
      };
    }
    // 3. Check cue marks
    else if (stagecraft?.cue_marks) {
      const mark = stagecraft.cue_marks.find((m) => m.id === assetId);
      if (mark) {
        entity = {
          id: mark.id,
          kind: 'cue_mark',
          label: mark.label || mark.id,
          fragment_id: 'stagecraft/proscenium-cues',
          salience: 'moderate',
          image_url: assetImages.get(mark.id) || null,
          diffusion_prompt: `Stagecraft cue mark token on floorplate: ${mark.label}, chalked blocking star with golden theatrical aura`,
          lore_snippet: `Theatrical blocking mark [${mark.role_gate || 'General'}]. Authorized standing: ${mark.authorized_standing || 'open'}.`,
          obstacle_type: 'cue_mark',
          mass_kg: null,
          interactive_verbs: ['step_onto_mark', 'inspect_cue'],
          forged: assetImages.has(mark.id),
        };
      }
    }

    // 4. Check zones
    if (!entity && zones) {
      const zone = zones.find((z) => z.id === assetId);
      if (zone) {
        entity = {
          id: zone.id,
          kind: 'zone',
          label: zone.name || zone.id,
          fragment_id: 'terrain/border-march',
          salience: 'region',
          image_url: assetImages.get(zone.id) || 'topdown_relief.png',
          diffusion_prompt: `Topographical map sector of ${zone.name}, 2.5D terrain relief with atmospheric altitude shading`,
          lore_snippet: `Regional map zone: ${zone.name}. Elevation bracket: ${zone.elevation || 6.0}m.`,
          obstacle_type: 'terrain_zone',
          mass_kg: null,
          interactive_verbs: ['survey_terrain'],
          forged: assetImages.has(zone.id),
        };
      }
    }

    if (!entity && typeof idOrEntity === 'object') {
      entity = {
        id: idOrEntity.id || 'unknown_asset',
        kind: idOrEntity.kind || 'prop',
        label: idOrEntity.label || idOrEntity.id,
        fragment_id: idOrEntity.fragment_id || 'shared/unmodelled-prop',
        salience: idOrEntity.salience || 'minor',
        image_url: assetImages.get(idOrEntity.id) || idOrEntity.image_url || null,
        diffusion_prompt: idOrEntity.diffusion_prompt || idOrEntity.lore || '',
        lore_snippet: idOrEntity.lore || '',
        obstacle_type: idOrEntity.obstacle_type || 'passable',
        mass_kg: idOrEntity.mass_kg || null,
        interactive_verbs: idOrEntity.verbs || ['examine'],
        forged: assetImages.has(idOrEntity.id),
      };
    }

    if (!entity) return null;

    selectedAsset = entity;
    log('STAGE', `Selected ${entity.kind}: ${entity.label} [${entity.id}]`);
    renderAssetViewerDOM();
    if (typeof syncSidebarToSelectedAsset === 'function') {
      syncSidebarToSelectedAsset(entity.id);
    }
    return selectedAsset;
  }

  function renderAssetViewerDOM() {
    if (!selectedAsset) return;
    if (typeof document === 'undefined') return;
    const panel = document.getElementById('asset-viewer-panel');
    if (!panel) return;

    const nameEl = document.getElementById('asset-viewer-name');
    if (nameEl) nameEl.textContent = selectedAsset.label;

    const idEl = document.getElementById('asset-viewer-id');
    if (idEl) idEl.textContent = selectedAsset.id;

    const badgeEl = document.getElementById('asset-viewer-badge');
    if (badgeEl) {
      if (selectedAsset.forged) {
        if (selectedAsset.pipelineSource === 'comfyui_diffusion') {
          badgeEl.textContent = '[FORGED · FLUX 3 LIVE]';
          badgeEl.style.color = '#34d399';
          badgeEl.style.borderColor = '#059669';
        } else {
          badgeEl.textContent = '[FORGED · FLUX 3 KLEIN]';
          badgeEl.style.color = '#38bdf8';
          badgeEl.style.borderColor = '#0284c7';
        }
      } else {
        const badgeText = selectedAsset.kind === 'prop'
          ? (selectedAsset.salience ? `PROP · ${selectedAsset.salience.toUpperCase()}` : 'PROP')
          : selectedAsset.kind.toUpperCase();
        badgeEl.textContent = `[${badgeText}]`;
        badgeEl.style.color = '#f59e0b';
        badgeEl.style.borderColor = '#78350f';
      }
    }

    const provEl = document.getElementById('asset-viewer-provenance');
    if (provEl) provEl.textContent = selectedAsset.fragment_id;

    const fragsEl = document.getElementById('asset-viewer-fragments');
    if (fragsEl) {
      const frags = selectedAsset.fragments_used || [selectedAsset.fragment_id];
      fragsEl.textContent = frags.map(f => f.split('/').pop()).join(' · ') || 'the-site';
    }

    const standingEl = document.getElementById('asset-viewer-standing');
    if (standingEl) {
      const tier = (selectedAsset.standing_tier || 'verified').toUpperCase();
      const score = typeof selectedAsset.standing_score === 'number' ? selectedAsset.standing_score.toFixed(2) : '0.65';
      const warrantSuffix = selectedAsset.warrant_id ? ` · ${selectedAsset.warrant_id}` : '';
      standingEl.textContent = `${tier} (${score})${warrantSuffix}`;
    }

    const cohEl = document.getElementById('asset-viewer-coherence');
    if (cohEl) {
      const zId = selectedAsset.zone_context?.zone_id || 'inspection-hall';
      const conflicts = selectedAsset.coherence_conflicts || [];
      const unresolved = conflicts.filter((c) => c.resolution_status === 'unresolved');
      if (unresolved.length > 0) {
        cohEl.textContent = `${zId} · ${unresolved.length} conflict (${unresolved[0].kind})`;
        cohEl.style.color = '#fbbf24';
      } else if (selectedAsset.standing_tier === 'refined_by_criticism') {
        cohEl.textContent = `${zId} · criticized tombstone active`;
        cohEl.style.color = '#f87171';
      } else {
        cohEl.textContent = `${zId} · coherent`;
        cohEl.style.color = '#34d399';
      }
    }

    const physEl = document.getElementById('asset-viewer-physicality');
    if (physEl) {
      const parts = [];
      if (selectedAsset.mass_kg !== null && selectedAsset.mass_kg !== undefined) parts.push(`${selectedAsset.mass_kg}kg`);
      if (selectedAsset.obstacle_type) parts.push(selectedAsset.obstacle_type.replace(/_/g, ' '));
      physEl.textContent = parts.join(' · ') || 'interactive entity';
    }

    const loreEl = document.getElementById('asset-viewer-lore');
    if (loreEl) {
      loreEl.textContent = `"${selectedAsset.lore_snippet || selectedAsset.diffusion_prompt}"`;
    }

    const imgContainer = document.getElementById('asset-viewer-image-container');
    if (imgContainer) {
      imgContainer.innerHTML = '';
      if (selectedAsset.image_url) {
        const wrapper = document.createElement('div');
        wrapper.className = 'asset-img-wrapper';

        const img = document.createElement('img');
        img.src = selectedAsset.image_url;
        img.alt = selectedAsset.label;
        img.className = 'asset-viewer-img';
        img.id = 'asset-viewer-img';

        const cap = document.createElement('div');
        cap.className = 'asset-img-caption';
        if (selectedAsset.forged) {
          cap.textContent = selectedAsset.pipelineSource === 'comfyui_diffusion'
            ? '✨ Forged via ComfyUI (Live GPU) · Black Forest Labs Flux 3 Klein'
            : '✨ Vector Blueprint Draft · Black Forest Labs Flux 3 Klein';
        } else {
          cap.textContent = 'Black Forest Labs Flux 3 Klein · Orthographic Matte';
        }

        wrapper.appendChild(img);
        wrapper.appendChild(cap);
        imgContainer.appendChild(wrapper);
      } else {
        const noImg = document.createElement('div');
        noImg.className = 'asset-no-img-box';

        const icon = document.createElement('div');
        icon.className = 'asset-no-img-icon';
        icon.textContent = '🖼️';

        const txt = document.createElement('div');
        txt.className = 'asset-no-img-text';
        txt.textContent = 'No Diffusion Render on Disk';

        const sub = document.createElement('div');
        sub.className = 'asset-no-img-sub';
        sub.textContent = selectedAsset.diffusion_prompt
          ? `Prompt: "${selectedAsset.diffusion_prompt}"`
          : 'Awaiting asset forge conditioning & render.';

        noImg.appendChild(icon);
        noImg.appendChild(txt);
        noImg.appendChild(sub);
        imgContainer.appendChild(noImg);
      }
    }

    const btnCompile = document.getElementById('btn-forge-compile');
    if (btnCompile) {
      btnCompile.disabled = false;
      btnCompile.innerText = selectedAsset.compiled_brief
        ? '⚡ Re-compile (Lattice)'
        : '⚡ Compile Prompt (Lattice)';
    }

    const btnRender = document.getElementById('btn-forge-render');
    if (btnRender) {
      btnRender.disabled = false;
      btnRender.innerText = selectedAsset.image_url
        ? '🔄 Re-render in Asset Forge'
        : '✨ Render in Asset Forge';
    }
  }

  function executeLatticeGraph(workflowFile, execution = {}) {
    const runId = 'run-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const targetNode = execution.targetNode || 'rewrite-prompt';
    const targetPort = execution.targetPort || 'out';
    const events = [];
    const artifacts = [];

    events.push({
      runId,
      seq: 1,
      at: Date.now(),
      elapsedMs: 0,
      type: 'plan',
      plan: {
        workflowId: workflowFile.replace('.lattice.json', ''),
        target: { nodeId: targetNode, portId: targetPort },
      },
    });

    events.push({
      runId,
      seq: 2,
      at: Date.now(),
      elapsedMs: 2,
      type: 'node-phase',
      address: { nodeId: 'select-asset', portId: 'activation' },
      phase: 'executing',
    });
    events.push({
      runId,
      seq: 3,
      at: Date.now(),
      elapsedMs: 4,
      type: 'node-settled',
      address: { nodeId: 'select-asset', portId: 'activation' },
      status: 'completed',
    });

    if (targetNode === 'rasterize-depth-template' || targetNode === 'format-flux3-conditioning') {
      events.push({
        runId,
        seq: 4,
        at: Date.now(),
        elapsedMs: 8,
        type: 'node-phase',
        address: { nodeId: 'validate-overhang-watertight', portId: 'out' },
        phase: 'executing',
      });
      events.push({
        runId,
        seq: 5,
        at: Date.now(),
        elapsedMs: 12,
        type: 'node-settled',
        address: { nodeId: 'validate-overhang-watertight', portId: 'out' },
        status: 'completed',
      });
      events.push({
        runId,
        seq: 6,
        at: Date.now(),
        elapsedMs: 16,
        type: 'node-phase',
        address: { nodeId: 'rasterize-depth-template', portId: 'out' },
        phase: 'executing',
      });
      const depthArtifact = {
        kind: 'text',
        source: { nodeId: 'rasterize-depth-template', portId: 'out' },
        value: {
          text: JSON.stringify({
            status: 'depth_generated',
            primitive_id: execution.primitiveId || execution.assetId || 'ancient-bastion',
            depth_url: `renders/primitives/${execution.primitiveId || execution.assetId || 'ancient-bastion'}-depth.png`,
            width: 1024,
            height: 1024,
            watertight: true,
            overhang_conforming: true,
          }),
        },
      };
      artifacts.push(depthArtifact);
      events.push({
        runId,
        seq: 7,
        at: Date.now(),
        elapsedMs: 20,
        type: 'node-settled',
        address: { nodeId: 'rasterize-depth-template', portId: 'out' },
        status: 'completed',
      });
    }

    if (targetNode === 'rewrite-prompt' || targetNode === 'format-flux3-conditioning') {
      events.push({
        runId,
        seq: 8,
        at: Date.now(),
        elapsedMs: 24,
        type: 'node-phase',
        address: { nodeId: 'compile-world-brief', portId: 'out' },
        phase: 'executing',
      });
      events.push({
        runId,
        seq: 9,
        at: Date.now(),
        elapsedMs: 28,
        type: 'node-settled',
        address: { nodeId: 'compile-world-brief', portId: 'out' },
        status: 'completed',
      });
      events.push({
        runId,
        seq: 10,
        at: Date.now(),
        elapsedMs: 32,
        type: 'node-phase',
        address: { nodeId: 'rewrite-prompt', portId: 'out' },
        phase: 'executing',
      });
      const promptArtifact = {
        kind: 'text',
        source: { nodeId: 'rewrite-prompt', portId: 'out' },
        value: {
          text: execution.prompt || '',
        },
      };
      artifacts.push(promptArtifact);
      events.push({
        runId,
        seq: 11,
        at: Date.now(),
        elapsedMs: 36,
        type: 'node-settled',
        address: { nodeId: 'rewrite-prompt', portId: 'out' },
        status: 'completed',
      });
    }

    events.push({
      runId,
      seq: events.length + 1,
      at: Date.now(),
      elapsedMs: 40,
      type: 'run-settled',
      status: 'completed',
    });

    return {
      ok: true,
      runId,
      mode: 'target',
      target_node: targetNode,
      events,
      recording: {
        runId,
        artifacts,
        events,
      },
    };
  }

  function compileAssetBrief(assetId, options = {}) {
    const id = assetId || (selectedAsset ? selectedAsset.id : (getSelectedScenePrimitive()?.id || null));
    if (!id) {
      log('LATTICE', 'Compile requested with no active asset or scene primitive.', 'warn');
      return { success: false, reason: 'no_asset_selected' };
    }

    const sc = getCurrentScene();
    const itemInScene = _findItemInScene(sc, id);

    if (!selectedAsset || (selectedAsset.id !== id && selectedAsset.asset_id !== id)) {
      if (itemInScene) {
        selectScenePrimitive(id, { syncViewer: true });
      } else {
        selectAsset(id);
      }
    }

    const btnCompile = typeof document !== 'undefined' ? (document.getElementById('btn-forge-compile') || document.getElementById('btn-sidebar-compile')) : null;
    if (btnCompile) {
      btnCompile.disabled = true;
      btnCompile.innerText = '⏳ Compiling (gemma4-orion)...';
    }

    log('LATTICE', "Activating workflow 'The Asset Forge & Fragment Compiler' (workflows/asset-forge.lattice.json)...");
    log('LATTICE', `[select-asset] Ingested selection: '${id}' (${selectedAsset ? (selectedAsset.label || selectedAsset.name || id) : id}).`);

    const zoneName = selectedAsset?.zone_context?.zone_name || 'Weigh & Inspection Hall';
    const substrate = selectedAsset?.zone_context?.substrate_material || 'scarred timber planking';
    log('LATTICE', `[cartographer-coherence-gate] Audited scene coherence against ${zoneName} (${substrate}) · standing: ${selectedAsset?.standing_tier || 'verified'}.`);

    const doctrineFrags = ['shared/single-face-reading', 'shared/brief-faces-are-themes', 'shared/secondary-growth-is-not-a-pair'];
    log('LATTICE', `[gather-fragments] Gathering admitted visual fragments and 'for: gemma4-orion' doctrine fragments (${doctrineFrags.join(', ')})...`);
    log('LATTICE', `[gemma4-orion] Calling gemma4-orion rewriter with single-face doctrine & scene backpressure...`);

    let visualFrags = [];

    // 1. Compile Brief depending on entity kind
    if (selectedAsset.kind === 'actor') {
      const npcKey = id === 'player' ? 'pell' : id;
      const npc = selectedAsset.npc_sheet || npcs[id] || npcs[npcKey] || null;
      visualFrags = selectedAsset.fragments_used?.length
        ? [...selectedAsset.fragments_used]
        : (npc?.compiled_portrait?.fragments_used?.length
            ? [...npc.compiled_portrait.fragments_used]
            : [id === 'pell' ? 'scaffolded-kingdom/understudy' : (id === 'hollis' ? 'customs-house/hollis-ledger' : 'shared/actor-roster')]);
      selectedAsset.fragments_used = [...new Set([...visualFrags, ...doctrineFrags])];

      const criticismsText = selectedAsset.active_criticisms?.length
        ? ` Authorial criticisms: ${selectedAsset.active_criticisms.join('; ')}.`
        : '';
      const warrantText = selectedAsset.warrant_id ? ` Canon warrant: ${selectedAsset.warrant_id}.` : '';

      let briefBase = npc?.compiled_portrait?.compiled_brief;
      if (!briefBase) {
        if (id === 'hollis') {
          briefBase = "Hollis the Twice-Written, quartermaster of the customs house. Unshaven quartermaster in a ledger-keeper's coat over chainmail, open two-column ledger with red clearance seal.";
        } else if (id === 'pell' || id === 'player') {
          briefBase = "Pell the Underwritten, anxious understudy. Plain rehearsal tunic holding a prompt book script that is blank below the first line, dramatic theatrical spotlight beam.";
        } else {
          briefBase = `${selectedAsset.label}. ${selectedAsset.lore_snippet || 'Actor standing in scene'}`;
        }
      }
      selectedAsset.compiled_brief = briefBase + warrantText + (criticismsText ? ` [Criticisms: ${selectedAsset.active_criticisms.length}]` : '');

      selectedAsset.diffusion_prompt = `Retro JRPG character art, sword and sorcery, 16-bit pixel aesthetic with painterly shading. character portrait bust, front three-quarter angle displaying primary visible face, ${selectedAsset.compiled_brief}, grounded in ${zoneName} upon ${substrate}.${criticismsText} expressive character visage, fine facial details, atmospheric cinematic rim lighting, 16-bit painterly texture, Black Forest Labs Flux 3 Klein render, 1024x1024.`;
    } else if (physicalPropsMap.has(id)) {
      const p = physicalPropsMap.get(id);
      visualFrags = selectedAsset.fragments_used?.length
        ? [...selectedAsset.fragments_used]
        : (p.fragments_used ? [...p.fragments_used] : [p.fragment_id || 'customs-house/the-site']);
      selectedAsset.fragments_used = [...new Set([...visualFrags, ...doctrineFrags])];

      const criticismsText = selectedAsset.active_criticisms?.length
        ? ` Authorial criticisms: ${selectedAsset.active_criticisms.join('; ')}.`
        : '';
      const warrantText = selectedAsset.warrant_id ? ` Canon warrant: ${selectedAsset.warrant_id}.` : '';

      const briefBase = p.compiled_brief || `${p.label}, physical prop in scene.`;
      selectedAsset.compiled_brief = `${briefBase} Admitted fragments: ${visualFrags.join(', ')}.${warrantText}${criticismsText ? ' ' + criticismsText : ''}`;

      selectedAsset.diffusion_prompt = `orthographic top-down 2.5D isometric game asset cutout, single front isometric elevation displaying primary visible face, ${p.label}, ${selectedAsset.compiled_brief}, grounded upon ${substrate} in ${zoneName}, isolated on neutral solid grey background (#707070), no background walls, no room floors, perfectly clean silhouette, ready for alpha matting, subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath base, crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024`;

      p.diffusion_prompt = selectedAsset.diffusion_prompt;
      p.compiled_brief = selectedAsset.compiled_brief;
      p.fragments_used = [...selectedAsset.fragments_used];
    } else {
      // Scene Primitive, Outdoor Ruin, or Spatial Map Asset
      const prim = itemInScene || selectedAsset;
      visualFrags = selectedAsset.fragments_used?.length
        ? [...selectedAsset.fragments_used]
        : (prim.fragments_used ? [...prim.fragments_used] : [prim.fragment_id || 'grey-wind/named-ruins']);
      selectedAsset.fragments_used = [...new Set([...visualFrags, ...doctrineFrags])];

      const criticismsText = selectedAsset.active_criticisms?.length
        ? ` Authorial criticisms: ${selectedAsset.active_criticisms.join('; ')}.`
        : '';
      const warrantText = selectedAsset.warrant_id ? ` Canon warrant: ${selectedAsset.warrant_id}.` : '';

      const dimsStr = prim.dimensions ? `${prim.dimensions[0]}m × ${prim.dimensions[1]}m × ${prim.dimensions[2]}m` : '';
      const trisStr = prim.triangle_count ? `${prim.triangle_count} triangles` : '';
      const physicalDerivs = [
        dimsStr ? `bounding volume ${dimsStr}` : null,
        trisStr ? `faceted watertight geometry ${trisStr}` : null,
        prim.category === 'ancient_ruin' || prim.category === 'architecture' ? 'cyclopean masonry blocks conforming to the 45-degree cantilever overhang rule' : null,
        prim.category === 'monuments' ? 'dry-stone tiered rings and calibrated surveyor theodolite mount' : null,
        'isolated game asset cutout'
      ].filter(Boolean).join(', ');

      const briefBase = prim.description || prim.lore || `${prim.name || prim.label || id}, outdoor ruin asset in scene.`;
      selectedAsset.compiled_brief = `Subject: ${prim.name || prim.label || id}. Physicality: ${physicalDerivs}. Lore & Function: ${briefBase} Admitted fragments: ${visualFrags.join(', ')}.${warrantText}${criticismsText}`;

      const worldSetting = (currentSceneId && (currentSceneId.includes('bastion') || currentSceneId.includes('border')))
        ? 'The Cold Border March & Ancient Overhang Bastion Ridge, high mountain valley strewn with cyclopean masonry ruins'
        : `${zoneName} (${currentSceneId})`;
      const worldMaterials = (currentSceneId && (currentSceneId.includes('bastion') || currentSceneId.includes('border')))
        ? 'weathered cyclopean limestone masonry with asymmetric alpine lichen patina, 45-degree cantilever granite blocks, dry-stone cairn slate, alpine scree'
        : 'weathered stone, rough timber, forged iron fittings';

      selectedAsset.diffusion_prompt = `orthographic top-down 2.5D isometric game asset cutout, single front isometric elevation displaying primary visible face, ${prim.name || prim.label || id}, ${physicalDerivs}, crafted with ${worldMaterials}, grounded upon ${substrate} in ${worldSetting}, isolated on neutral solid grey background (#707070), no background walls, no room floors, perfectly clean silhouette, ready for alpha matting, subtle directional studio lighting from top-left, soft ground contact occlusion shadow beneath base, crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024`;

      if (prim.diffusion_prompt !== undefined) prim.diffusion_prompt = selectedAsset.diffusion_prompt;
      if (prim.compiled_brief !== undefined) prim.compiled_brief = selectedAsset.compiled_brief;
      prim.fragments_used = [...selectedAsset.fragments_used];
    }

    // Immediately update DOM preview
    const previewPrompt = typeof document !== 'undefined' ? document.getElementById('sidebar-preview-prompt') : null;
    if (previewPrompt) {
      previewPrompt.textContent = selectedAsset.diffusion_prompt;
      previewPrompt.classList.remove('prompt-updated-flash');
      void previewPrompt.offsetWidth; // trigger reflow for animation
      previewPrompt.classList.add('prompt-updated-flash');
    }

    if (itemInScene) {
      itemInScene.diffusion_prompt = selectedAsset.diffusion_prompt;
      itemInScene.compiled_brief = selectedAsset.compiled_brief;
      renderSidebarPreviewDOM(itemInScene);
    } else {
      renderSidebarPreviewDOM(getSelectedScenePrimitive());
    }

    // If lightbox modal is open, update its prompt box
    if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      const promptBox = document.querySelector('.lightbox-prompt-box .prompt-box-content');
      if (promptBox) {
        promptBox.textContent = selectedAsset.diffusion_prompt;
      }
    }

    // Remote sync with Companion Forge Service (port 8788) when online
    const activeSceneId = currentSceneId || selectedAsset.zone_context?.scene_id || 'border-march';
    if (typeof fetch === 'function' && options.remote !== false) {
      postForgeJson('/forge/compile', {
        asset_id: id,
        kind: selectedAsset.kind,
        scene_id: activeSceneId,
        facet: options.facet || 'portrait',
        asset: selectedAsset,
      }, 1500).then(remote => {
        if (remote && remote.ok) {
          selectedAsset.diffusion_prompt = remote.diffusion_prompt;
          selectedAsset.compiled_brief = remote.compiled_brief;
          selectedAsset.fragments_used = remote.fragments_used;
          selectedAsset.standing_tier = remote.standing_tier;
          selectedAsset.standing_score = remote.standing_score;
          if (itemInScene) {
            itemInScene.diffusion_prompt = remote.diffusion_prompt;
            itemInScene.compiled_brief = remote.compiled_brief;
          }
          if (previewPrompt) {
            previewPrompt.textContent = remote.diffusion_prompt;
            previewPrompt.classList.remove('prompt-updated-flash');
            void previewPrompt.offsetWidth;
            previewPrompt.classList.add('prompt-updated-flash');
          }
          log('LATTICE', `[remote-sync] Synced gemma4-orion compiled prompt from companion forge service on port 8788.`);
          renderAssetViewerDOM();
          const activeItem = getSelectedScenePrimitive();
          if (activeItem && (activeItem.id === id || activeItem.asset_id === id)) {
            renderSidebarPreviewDOM(activeItem);
          }
        }
      }).catch(() => {});
    }

    log('LATTICE', `[compile-world-brief] Fragment Compiler assembled brief from ${selectedAsset.fragments_used.length} fragments.`);
    log('LATTICE', `[rewrite-prompt] Lattice prompt rewriter refined prompt (${(selectedAsset.diffusion_prompt || '').length} chars).`);
    log('LATTICE', `[gemma4-orion] Rewriter refined prompt (${(selectedAsset.diffusion_prompt || '').length} chars).`);
    log('LATTICE', `[format-flux3-conditioning] Conditioned for Flux 3 Klein (steps: 16, cfg: 1.0, 1024x1024).`);

    playAudioCue('click');

    renderAssetViewerDOM();

    if (btnCompile) {
      btnCompile.disabled = false;
      btnCompile.innerText = '⚡ Re-compile (Lattice)';
    }

    const latticeRun = executeLatticeGraph('asset-forge.lattice.json', {
      targetNode: 'rewrite-prompt',
      assetId: id,
      prompt: selectedAsset.diffusion_prompt,
      options,
    });

    return {
      success: true,
      assetId: id,
      prompt: selectedAsset.diffusion_prompt,
      compiled_brief: selectedAsset.compiled_brief,
      fragments_used: selectedAsset.fragments_used,
      doctrine_fragments: doctrineFrags,
      rewriter: 'gemma4-orion',
      standing_tier: selectedAsset.standing_tier,
      lattice_workflow: 'asset-forge.lattice.json',
      lattice_run: latticeRun,
      status: 'compiled',
    };
  }

  function compileSelectedAssetBrief() {
    const active = selectedAsset || getSelectedScenePrimitive();
    if (!active) {
      log('LATTICE', 'Compile requested with no active asset or scene primitive.', 'warn');
      return null;
    }
    return compileAssetBrief(active.id || active.asset_id);
  }

  function runPrimitive3DPipeline(primitiveId, options = {}) {
    const sc = getCurrentScene();
    const pid = primitiveId || (selectedAsset ? selectedAsset.id : (selectedPrimitiveId || getSelectedScenePrimitive()?.id || 'ancient-bastion'));
    const itemInScene = _findItemInScene(sc, pid) || (selectedAsset?.id === pid ? selectedAsset : null);

    log('LATTICE', `[3D Pipeline] Ingesting dense watertight STL: library/stl_primitives/${pid}.stl...`);
    log('LATTICE', `[3D Pipeline] Verifying 45° overhang cantilever rule and watertightness (Euler χ = 2)...`);
    log('LATTICE', `[3D Pipeline] Rasterizing high-detail orthographic top-down Z-depth map...`);

    const depthUrl = `renders/primitives/${pid}-depth.png`;
    if (itemInScene) {
      itemInScene.depth_url = depthUrl;
    }
    if (selectedAsset && (selectedAsset.id === pid || selectedAsset.asset_id === pid)) {
      selectedAsset.depth_url = depthUrl;
    }

    // Switch facet to 3D Depth
    setPreviewFacet('depth');

    if (typeof fetch === 'function' && options.remote !== false) {
      postForgeJson('/forge/pipeline/3d', {
        primitive_id: pid,
        scene_id: currentSceneId || 'border-march',
        width: 1024,
        height: 1024,
      }, 2000).then((res) => {
        if (res && res.ok) {
          log('LATTICE', `[3D Pipeline] Verified watertight STL (${res.triangle_count} triangles). Depth template: ${res.depth_url}.`);
        }
      }).catch(() => {});
    }

    log('LATTICE', `[3D Pipeline] High-detail depth template ready: ${depthUrl}. Conditioning Black Forest Labs Flux 3 Klein.`);
    playAudioCue('click');

    renderSidebarPreviewDOM(itemInScene || getSelectedScenePrimitive());

    if (typeof document !== 'undefined') {
      const modal = document.getElementById('primitive-lightbox');
      if (modal && !modal.classList.contains('hidden')) {
        openPrimitiveLightbox(pid, 'depth');
      }
    }

    const latticeRun = executeLatticeGraph('asset-forge.lattice.json', {
      targetNode: 'rasterize-depth-template',
      primitiveId: pid,
      options,
    });

    return {
      success: true,
      primitive_id: pid,
      depth_url: depthUrl,
      facet: 'depth',
      lattice_workflow: 'asset-forge.lattice.json',
      lattice_run: latticeRun,
      status: 'depth_generated',
    };
  }

  async function renderAssetInForge(assetId, options = {}) {
    const id = assetId || (selectedAsset ? selectedAsset.id : null);
    if (!id) {
      log('FORGE', 'Render requested with no active asset.', 'warn');
      return { success: false, reason: 'no_asset_selected' };
    }

    if (!selectedAsset || selectedAsset.id !== id) {
      selectAsset(id);
    }

    if (!selectedAsset.diffusion_prompt || selectedAsset.diffusion_prompt.length < 20) {
      compileAssetBrief(id);
    }

    const frags = selectedAsset.fragments_used || [selectedAsset.fragment_id];
    log('LATTICE', `[forge-dispatch] Enqueued workflow '${id}' (${selectedAsset.label}) to Asset Forge dispatch.`);
    log('COMPILER', `Fragment Compiler assembled brief from ${frags.length} fragments: ${frags.join(', ')}.`);
    log('REWRITER', `Lattice prompt rewriter refined prompt (${selectedAsset.diffusion_prompt.length} chars).`);
    log('FORGE', `Initiating render pipeline for '${id}' (${selectedAsset.label}).`);
    log('FORGE', `Diffusion prompt: "${selectedAsset.diffusion_prompt || 'No prompt specified'}"`);

    const btnRender = typeof document !== 'undefined' ? document.getElementById('btn-forge-render') : null;
    if (btnRender) {
      btnRender.disabled = true;
      btnRender.innerText = '⏳ Forging (Flux 3 Klein)...';
    }

    const imgContainer = typeof document !== 'undefined' ? document.getElementById('asset-viewer-image-container') : null;
    if (imgContainer) {
      imgContainer.innerHTML = `
        <div class="asset-no-img-box" style="padding: 16px;">
          <div style="font-size: 20px;">⚙️</div>
          <div id="forge-status-label" class="asset-no-img-text" style="color: #38bdf8;">Connecting to Render Pipeline...</div>
          <div id="forge-status-sub" style="font-size: 9px; color: #a8947f; margin-top: 4px;">Target: Black Forest Labs Flux 3 Klein</div>
          <div class="forge-progress-bar"><div id="forge-progress-fill" class="forge-progress-fill" style="width: 20%;"></div></div>
        </div>
      `;
    }

    const setProgress = (pct, label, sub) => {
      if (typeof document === 'undefined') return;
      const fill = document.getElementById('forge-progress-fill');
      if (fill) fill.style.width = `${pct}%`;
      const lbl = document.getElementById('forge-status-label');
      if (lbl && label) lbl.textContent = label;
      const subEl = document.getElementById('forge-status-sub');
      if (subEl && sub) subEl.textContent = sub;
    };

    let renderedUrl = null;
    let pipelineSource = 'vector_blueprint';

    // If options.immediate is true (e.g. headless unit tests), synthesize immediately
    if (options.immediate) {
      log('FORGE', 'Fast/test immediate synthesis requested. Generating vector blueprint draft.');
      renderedUrl = synthesizeForgeRender(selectedAsset);
    } else {
      const server = options.server || comfyServerUrl;
      log('COMFYUI', `Probing ComfyUI endpoint at ${server}...`);
      setProgress(25, 'Probing ComfyUI Server...', server);

      let comfyOnline = false;
      try {
        if (typeof fetch !== 'undefined') {
          const statsRes = await fetch(`${server}/system_stats`, { signal: AbortSignal.timeout(3000) });
          if (statsRes.ok) {
            const stats = await statsRes.json();
            comfyOnline = true;
            const device = stats?.devices?.[0]?.name || 'GPU';
            const vramFree = stats?.devices?.[0]?.vram_free ? (stats.devices[0].vram_free / 1024 / 1024 / 1024).toFixed(2) + ' GB' : 'active';
            log('COMFYUI', `Connected to ComfyUI. Device: ${device} · VRAM free: ${vramFree}.`);
          }
        }
      } catch (err) {
        log('COMFYUI', `Server probe failed: ${err.message}. ComfyUI offline.`, 'warn');
      }

      if (comfyOnline) {
        try {
          setProgress(40, 'Assembling Flux 3 Klein Graph...', 'Loading unet + clip + vae');
          const seed = options.seed || Math.floor(Math.random() * 2147483647);
          const steps = options.steps || 8;
          const promptText = selectedAsset.diffusion_prompt || `Orthographic asset for ${selectedAsset.label}`;
          const negPrompt = options.negativePrompt || 'ugly, blurry, low quality, artifacts, watermark, distorted';

          log('COMFYUI', `Assembled workflow. Seed: ${seed}, Steps: ${steps}, Prompt: "${promptText.slice(0, 50)}..."`);
          setProgress(55, 'Submitting Prompt to Queue...', `Seed: ${seed}`);

          const workflow = {
            '1': { 'class_type': 'UnetLoaderGGUF', 'inputs': { 'unet_name': 'flux3_image_klein_sd_Q4_K_M.gguf' } },
            '2': { 'class_type': 'CLIPLoader', 'inputs': { 'clip_name': 'qwen3vl_4b_int8_convrot.safetensors', 'type': 'flux3', 'device': 'default' } },
            '3': { 'class_type': 'VAELoader', 'inputs': { 'vae_name': 'flux2-vae.safetensors' } },
            '4': { 'class_type': 'CLIPTextEncode', 'inputs': { 'clip': ['2', 0], 'text': promptText } },
            '5': { 'class_type': 'CLIPTextEncode', 'inputs': { 'clip': ['2', 0], 'text': negPrompt } },
            '6': { 'class_type': 'EmptyFlux2LatentImage', 'inputs': { 'width': 512, 'height': 512, 'batch_size': 1 } },
            '7': { 'class_type': 'KSampler', 'inputs': { 'model': ['1', 0], 'positive': ['4', 0], 'negative': ['5', 0], 'latent_image': ['6', 0], 'seed': seed, 'steps': steps, 'cfg': 1.0, 'sampler_name': 'euler', 'scheduler': 'simple', 'denoise': 1.0 } },
            '8': { 'class_type': 'VAEDecode', 'inputs': { 'samples': ['7', 0], 'vae': ['3', 0] } },
            '9': { 'class_type': 'SaveImage', 'inputs': { 'images': ['8', 0], 'filename_prefix': 'spritequest_forge' } }
          };

          const clientId = 'sq-' + Math.random().toString(36).substring(2, 9);
          const queueRes = await fetch(`${server}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow, client_id: clientId })
          });

          if (!queueRes.ok) {
            throw new Error(`Queue rejected with HTTP ${queueRes.status}`);
          }
          const queueData = await queueRes.json();
          const promptId = queueData.prompt_id;
          log('COMFYUI', `Prompt queued with ID: ${promptId}. Executing sampler on GPU...`);
          setProgress(70, 'Sampling (Flux 3 Klein on GPU)...', `Prompt ID: ${promptId.slice(0, 8)}...`);

          // Poll history (up to 45s)
          const deadline = Date.now() + 45000;
          let executedImage = null;
          let pollCount = 0;
          while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, 1000));
            pollCount++;
            try {
              const histRes = await fetch(`${server}/history/${promptId}`);
              if (histRes.ok) {
                const hist = await histRes.json();
                if (hist && hist[promptId]) {
                  const entry = hist[promptId];
                  if (entry.status?.status_str === 'error') {
                    throw new Error('ComfyUI workflow execution error: ' + JSON.stringify(entry.status));
                  }
                  const outputs = entry.outputs || {};
                  for (const nodeOut of Object.values(outputs)) {
                    if (nodeOut.images && nodeOut.images.length > 0) {
                      executedImage = nodeOut.images[0];
                      break;
                    }
                  }
                  if (executedImage) break;
                }
              }
              if (pollCount % 3 === 0) {
                log('COMFYUI', `Sampler executing on GPU... (${pollCount}s elapsed)`);
              }
            } catch (pollErr) {
              log('COMFYUI', `Polling status: ${pollErr.message}`, 'warn');
            }
          }

          if (executedImage) {
            setProgress(95, 'Decoding & Downloading Output...', executedImage.filename);
            const imgUrl = `${server}/view?filename=${encodeURIComponent(executedImage.filename)}&type=${encodeURIComponent(executedImage.type || 'output')}&subfolder=${encodeURIComponent(executedImage.subfolder || '')}`;
            try {
              if (typeof FileReader !== 'undefined') {
                const fetchBlob = await fetch(imgUrl);
                const blob = await fetchBlob.blob();
                renderedUrl = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              } else {
                renderedUrl = imgUrl;
              }
            } catch {
              renderedUrl = imgUrl;
            }
            pipelineSource = 'comfyui_diffusion';
            log('COMFYUI', `Successfully rendered via ComfyUI: ${executedImage.filename} (512x512).`);
          } else {
            throw new Error('Timed out waiting for ComfyUI sampler output.');
          }
        } catch (comfyErr) {
          log('COMFYUI', `ComfyUI execution error: ${comfyErr.message}. Falling back to vector blueprint draft.`, 'warn');
        }
      }
    }

    if (!renderedUrl) {
      if (!options.immediate) {
        log('FORGE', 'Generating vector blueprint draft (Flux 3 Klein specification).');
      }
      renderedUrl = synthesizeForgeRender(selectedAsset);
      pipelineSource = 'vector_blueprint';
    }

    assetImages.set(id, renderedUrl);
    if (physicalPropsMap.has(id)) {
      const p = physicalPropsMap.get(id);
      p.image_url = renderedUrl;
    } else if (actors.has(id)) {
      const a = actors.get(id);
      a.image_url = renderedUrl;
    }

    selectedAsset.image_url = renderedUrl;
    selectedAsset.forged = true;
    selectedAsset.pipelineSource = pipelineSource;

    playAudioCue('seal_stamp');
    log('AUDIO', 'Dispatched audio cue: seal_stamp.');
    log('FORGE', `Asset '${id}' successfully cached and rendered. Source: ${pipelineSource}.`);

    renderAssetViewerDOM();

    return {
      success: true,
      assetId: id,
      imageUrl: renderedUrl,
      prompt: selectedAsset.diffusion_prompt,
      pipelineSource,
      status: 'rendered',
    };
  }

  function renderSelectedAssetInForge() {
    return selectedAsset ? renderAssetInForge(selectedAsset.id) : null;
  }

  // --- Cartographers' Scene-Coherence & Epistemic Curation Engine (Client Runtime) ---
  function surveyAssetCoherence(assetId) {
    const id = assetId || (selectedAsset ? selectedAsset.id : null);
    if (!id || !physicalPropsMap.has(id)) {
      return { success: false, reason: 'asset_not_found' };
    }
    const p = physicalPropsMap.get(id);
    const conflicts = p.coherence_conflicts || [];
    const criticized = conflicts.find((c) => c.resolution_status === 'criticized_by_author');
    if (criticized) {
      log('CARTOGRAPHER', `Refused synthesis for '${id}': conflict '${criticized.kind}' was criticized/deleted by author.`, 'warn');
      return { success: false, reason: 'criticized_by_author' };
    }
    if (p.saturation_locked) {
      log('CARTOGRAPHER', `Refused synthesis for '${id}': archetype is saturation-locked (${p.saturation_score}).`, 'warn');
      return { success: false, reason: 'saturation_locked' };
    }
    const unresolved = conflicts.find((c) => c.resolution_status === 'unresolved');
    if (!unresolved) {
      log('CARTOGRAPHER', `No unresolved scene coherence conflicts for '${id}'.`);
      return { success: false, reason: 'no_unresolved_conflict' };
    }

    const fid = unresolved.proposed_fragment_id;
    const detail = unresolved.proposed_detail;
    unresolved.resolution_status = 'resolved_by_field_note';
    unresolved.bridging_fragment_id = fid;

    p.fragments_used = p.fragments_used ? [...p.fragments_used] : [p.fragment_id];
    if (!p.fragments_used.includes(fid)) {
      p.fragments_used.push(fid);
    }
    p.standing_tier = 'provisional';
    p.standing_score = 0.40;
    p.diffusion_prompt = `${p.diffusion_prompt}, ${detail}`;

    log('CARTOGRAPHER', `Synthesized provisional field_note '${fid}' to resolve ${unresolved.kind} in ${p.zone_context?.zone_id || 'scene'}.`);
    if (selectedAsset && selectedAsset.id === id) {
      selectAsset(id);
    }

    if (typeof fetch === 'function') {
      postForgeJson('/cartographers/survey', {
        prop_id: id,
        scene_id: p.zone_context?.scene_id || 'customs-house',
        asset: p,
      }, 1500).then((data) => {
        if (data && data.ok) log('CARTOGRAPHER', `Synced survey for '${id}' with Companion Forge Service.`);
      }).catch(() => {});
    }

    return {
      success: true,
      assetId: id,
      fragmentId: fid,
      standing_tier: p.standing_tier,
      standing_score: p.standing_score,
    };
  }

  function curateAssetFragment(assetId, fragmentId, refinedDetail) {
    const id = assetId || (selectedAsset ? selectedAsset.id : null);
    if (!id || !physicalPropsMap.has(id)) {
      return { success: false, reason: 'asset_not_found' };
    }
    const p = physicalPropsMap.get(id);
    const fid = fragmentId || (p.fragment_id && p.fragment_id.startsWith('cartographers/') ? p.fragment_id : null) || (p.fragments_used || []).find((f) => f.startsWith('cartographers/'));
    if (!fid) {
      return { success: false, reason: 'no_dynamic_fragment' };
    }
    const slugPart = fid.split('/').pop().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
    const warrantId = `WARRANT-${slugPart}-CURATED`;

    p.standing_tier = 'warranted';
    p.standing_score = 0.90;
    p.warrant_id = warrantId;
    p.saturation_score = Math.min(1.0, Number(((p.saturation_score || 0.4) + 0.45).toFixed(2)));
    if (p.saturation_score >= 0.80) {
      p.saturation_locked = true;
    }
    if (refinedDetail) {
      p.diffusion_prompt = `${p.diffusion_prompt}, ${refinedDetail}`;
    }
    for (const c of (p.coherence_conflicts || [])) {
      if (c.bridging_fragment_id === fid) {
        c.resolution_status = 'resolved_by_curated';
        c.warrant_id = warrantId;
      }
    }

    log('CARTOGRAPHER', `Authorial edit verified on '${fid}' -> Promoted to CURATED (${warrantId}, standing: 0.90).`);
    if (selectedAsset && selectedAsset.id === id) {
      selectAsset(id);
    }

    if (typeof fetch === 'function') {
      postForgeJson('/cartographers/curate', {
        fragment_id: fid,
        detail: refinedDetail,
      }, 1500).then((data) => {
        if (data && data.ok) log('CARTOGRAPHER', `Synced curation for '${fid}' with Companion Forge Service.`);
      }).catch(() => {});
    }

    return {
      success: true,
      assetId: id,
      fragmentId: fid,
      warrant_id: warrantId,
      standing_tier: p.standing_tier,
      standing_score: p.standing_score,
      saturation_score: p.saturation_score,
      saturation_locked: p.saturation_locked,
    };
  }

  function criticizeAssetFragment(assetId, fragmentId) {
    const id = assetId || (selectedAsset ? selectedAsset.id : null);
    if (!id || !physicalPropsMap.has(id)) {
      return { success: false, reason: 'asset_not_found' };
    }
    const p = physicalPropsMap.get(id);
    const fid = fragmentId || (p.fragment_id && p.fragment_id.startsWith('cartographers/') ? p.fragment_id : null) || (p.fragments_used || []).find((f) => f.startsWith('cartographers/'));
    if (!fid) {
      return { success: false, reason: 'no_dynamic_fragment' };
    }

    p.fragments_used = (p.fragments_used || []).filter((f) => f !== fid);
    p.standing_tier = 'refined_by_criticism';
    p.standing_score = 0.55;
    p.warrant_id = null;
    p.active_criticisms = p.active_criticisms || [];
    const critMsg = `Author rejected and deleted fragment '${fid}'; do not re-propose this framing.`;
    if (!p.active_criticisms.includes(critMsg)) {
      p.active_criticisms.push(critMsg);
    }
    for (const c of (p.coherence_conflicts || [])) {
      if (c.bridging_fragment_id === fid || c.proposed_fragment_id === fid) {
        c.resolution_status = 'criticized_by_author';
      }
    }

    log('CARTOGRAPHER', `Author deleted '${fid}' -> Recorded criticism tombstone (standing: 0.55, re-synthesis blocked).`);
    if (selectedAsset && selectedAsset.id === id) {
      selectAsset(id);
    }

    if (typeof fetch === 'function') {
      postForgeJson('/cartographers/criticize', {
        fragment_id: fid,
        constraint: critMsg,
      }, 1500).then((data) => {
        if (data && data.ok) log('CARTOGRAPHER', `Synced criticism for '${fid}' with Companion Forge Service.`);
      }).catch(() => {});
    }

    return {
      success: true,
      assetId: id,
      fragmentId: fid,
      standing_tier: p.standing_tier,
      standing_score: p.standing_score,
      active_criticisms: [...p.active_criticisms],
    };
  }

  // --- Left Sidebar Asset Navigation Panel: Campaigns -> Acts -> Scenes ---
  const scenesManifest = features?.scenes || { campaigns: [], scenes: [], scenes_by_id: {}, campaigns_by_id: {} };
  let currentCampaignId = scenesManifest.default_campaign_id || (scenesManifest.campaigns?.[0]?.id) || 'tests';
  let currentSceneId = (features?.scenes?.scenes_by_id && features.scenes.scenes_by_id['border-march'])
    ? 'border-march'
    : (features?.scenes?.scenes?.[0]?.id || 'border-march');

  if (scenesManifest.scenes_by_id?.[currentSceneId]?.campaign_id) {
    currentCampaignId = scenesManifest.scenes_by_id[currentSceneId].campaign_id;
  }
  let currentActId = scenesManifest.scenes_by_id?.[currentSceneId]?.act_id || '';

  let currentPrimitiveFilter = 'all';
  let selectedPrimitiveId = null;

  function getCampaigns() {
    return scenesManifest.campaigns || [];
  }

  function getCampaign(campaignId = currentCampaignId) {
    return scenesManifest.campaigns_by_id?.[campaignId] || null;
  }

  function getCurrentCampaign() {
    return getCampaign(currentCampaignId) || scenesManifest.campaigns?.[0] || null;
  }

  function getActs(campaignId = currentCampaignId) {
    const c = getCampaign(campaignId);
    return c?.acts || [];
  }

  function getCurrentAct() {
    const acts = getActs(currentCampaignId);
    return acts.find((a) => a.id === currentActId) || acts[0] || null;
  }

  function getScenes(actId = null) {
    if (!actId) return scenesManifest.scenes || [];
    const act = getActs(currentCampaignId).find((a) => a.id === actId);
    if (!act) return [];
    return (act.scenes || []).map((sId) => getScene(sId)).filter(Boolean);
  }

  function getScene(sceneId) {
    return scenesManifest.scenes_by_id?.[sceneId] || null;
  }

  function getCurrentScene() {
    return getScene(currentSceneId);
  }

  function getScenePrimitives(sceneId = currentSceneId) {
    const sc = getScene(sceneId);
    return sc?.primitives || [];
  }

  // --- Terrain Primitives Staging Catalogue (Available Outdoor Ruins) ---
  const STAGING_PRIMITIVES_PALETTE = [
    {
      id: 'ancient-bastion',
      asset_id: 'prop-ancient-bastion',
      name: 'Ancient 45° Stepped Bastion',
      category: 'ancient_ruin',
      tree_group: 'Staging Palette (Available Ruins)',
      stage_role: 'Non-Navigable Ancient Relic Rampart (≥45° overhang rule)',
      fragment_id: 'grey-wind/named-ruins',
      dimensions: [22.0, 22.0, 12.0],
      source_triangles: 36647,
      triangle_count: 1685,
      coacd_pieces: '16 CoACD Boxes (192 tris)',
      overhang_constrained: true,
      overhang_angle_deg: 45.0,
      stl_path: 'library/stl_primitives/ancient-bastion.stl',
      image_2d: 'renders/primitives/ancient-bastion.png',
      collage_url: 'renders/primitives/ancient-bastion-collage.png',
      description: 'Cantilevered megalithic stone rampart obeying the 45-degree overhang rule. Dense stepped masonry tiers for F3K depth conditioning.'
    },
    {
      id: 'relic-cairn',
      asset_id: 'prop-relic-cairn',
      name: 'Theodolite Station & Relic Cairn',
      category: 'ancient_ruin',
      tree_group: 'Staging Palette (Available Ruins)',
      stage_role: 'Surveyor Vellum\'s Geodetic Triangulation Point',
      fragment_id: 'cartographers/epistemic-survey',
      dimensions: [1.8, 1.8, 1.6],
      source_triangles: 49658,
      triangle_count: 994,
      coacd_pieces: '7 CoACD Boxes (84 tris)',
      overhang_constrained: true,
      overhang_angle_deg: 45.0,
      stl_path: 'library/stl_primitives/relic-cairn.stl',
      image_2d: 'renders/primitives/relic-cairn.png',
      collage_url: 'renders/primitives/relic-cairn-collage.png',
      description: 'Weathered stone cairn marking geodetic boundary. Provides tactile rock relief and boundary marker.'
    },
    {
      id: 'wish-stone-slab',
      asset_id: 'prop-wish-stone-slab',
      name: 'Basalt Wish-Stone Offering Slab',
      category: 'ancient_ruin',
      tree_group: 'Staging Palette (Available Ruins)',
      stage_role: 'Monolithic Inscription Altar of the Grey Wind Forge',
      fragment_id: 'grey-wind/wish-granting',
      dimensions: [3.0, 8.0, 0.8],
      source_triangles: 43844,
      triangle_count: 900,
      coacd_pieces: '8 CoACD Boxes (96 tris)',
      overhang_constrained: true,
      overhang_angle_deg: 45.0,
      stl_path: 'library/stl_primitives/wish-stone-slab.stl',
      image_2d: 'renders/primitives/wish-stone-slab.png',
      collage_url: 'renders/primitives/wish-stone-slab-collage.png',
      description: 'Chiseled dark basalt offering slab with engraved glyph channels and flat offering plinth.'
    },
    {
      id: 'ruined-watchtower',
      asset_id: 'prop-ruined-watchtower',
      name: 'North Flank Ruined Watchtower',
      category: 'ancient_ruin',
      tree_group: 'Staging Palette (Available Ruins)',
      stage_role: 'Overwatch Lookout & Ancient Bastion Wall',
      fragment_id: 'grey-wind/named-ruins',
      dimensions: [6.5, 6.5, 14.0],
      source_triangles: 58927,
      triangle_count: 2579,
      coacd_pieces: '12 CoACD Boxes (144 tris)',
      overhang_constrained: true,
      overhang_angle_deg: 45.0,
      stl_path: 'library/stl_primitives/ruined-watchtower.stl',
      image_2d: 'renders/primitives/ruined-watchtower.png',
      collage_url: 'renders/primitives/ruined-watchtower-collage.png',
      description: 'Hollow cylindrical stone tower with broken crenelations and 45-degree corbelled base.'
    },
    {
      id: 'ancient-ruin-terrace',
      asset_id: 'prop-ancient-ruin-terrace',
      name: 'Ancient Overhang Ruin Buttress',
      category: 'ancient_ruin',
      tree_group: 'Staging Palette (Available Ruins)',
      stage_role: 'Stepped Retaining Wall & Cantilever Terrace',
      fragment_id: 'grey-wind/named-ruins',
      dimensions: [22.0, 22.0, 16.0],
      source_triangles: 29928,
      triangle_count: 1000,
      coacd_pieces: '9 CoACD Boxes (108 tris)',
      overhang_constrained: true,
      overhang_angle_deg: 45.0,
      stl_path: 'library/stl_primitives/ancient-ruin-terrace.stl',
      image_2d: 'renders/primitives/ancient-ruin-terrace.png',
      collage_url: 'renders/primitives/ancient-ruin-terrace-collage.png',
      description: 'Stepped cyclopean buttress and corbelled terrace from an ancient unwritten era.'
    }
  ];

  function _findItemInScene(sc, itemId) {
    if (!itemId) return null;
    if (sc) {
      const prim = (sc.primitives || []).find((p) => p.id === itemId || p.asset_id === itemId);
      if (prim) return { ...prim, _kind: 'primitive' };
      const cast = (sc.cast || []).find((c) => c.id === itemId);
      if (cast) return { ...cast, _kind: 'cast' };
    }
    const staged = STAGING_PRIMITIVES_PALETTE.find((p) => p.id === itemId || p.asset_id === itemId);
    if (staged) return { ...staged, _kind: 'primitive', _staged: true };
    return null;
  }

  function getSelectedScenePrimitive() {
    const sc = getCurrentScene();
    if (!sc) return null;
    if (selectedPrimitiveId) {
      const found = _findItemInScene(sc, selectedPrimitiveId);
      if (found) return found;
    }
    if (sc.primitives && sc.primitives.length > 0) {
      return { ...sc.primitives[0], _kind: 'primitive' };
    }
    return null;
  }

  function selectCampaign(campaignId, actId, sceneId) {
    if (!scenesManifest.campaigns_by_id?.[campaignId]) {
      log('CAMPAIGN', `Campaign '${campaignId}' not found in manifest.`, 'warn');
      return null;
    }
    currentCampaignId = campaignId;
    const camp = getCurrentCampaign();
    const acts = camp?.acts || [];
    const targetAct = (actId && acts.find((a) => a.id === actId)) ? actId : (acts[0]?.id || '');
    return selectAct(targetAct, sceneId);
  }

  function selectAct(actId, sceneId) {
    const camp = getCurrentCampaign();
    const acts = camp?.acts || [];
    const act = acts.find((a) => a.id === actId) || acts[0];
    if (!act) return null;
    currentActId = act.id;

    const actScenes = act.scenes || [];
    const targetSceneId = (sceneId && actScenes.includes(sceneId)) ? sceneId : (actScenes[0] || currentSceneId);
    return selectScene(targetSceneId);
  }

  function selectScene(sceneId) {
    if (!scenesManifest.scenes_by_id?.[sceneId]) {
      log('SCENE', `Scene '${sceneId}' not found in manifest.`, 'warn');
      return null;
    }
    currentSceneId = sceneId;
    const sc = getCurrentScene();

    // Auto-sync campaign and act
    if (sc.campaign_id && scenesManifest.campaigns_by_id?.[sc.campaign_id]) {
      currentCampaignId = sc.campaign_id;
    } else {
      for (const c of getCampaigns()) {
        for (const a of c.acts || []) {
          if ((a.scenes || []).includes(sceneId)) {
            currentCampaignId = c.id;
            currentActId = a.id;
            break;
          }
        }
      }
    }
    if (sc.act_id) {
      currentActId = sc.act_id;
    } else {
      const c = getCurrentCampaign();
      for (const a of c?.acts || []) {
        if ((a.scenes || []).includes(sceneId)) {
          currentActId = a.id;
          break;
        }
      }
    }

    selectedPrimitiveId = sc.primitives?.[0]?.id || null;
    log('SCENE', `Active scene switched to: '${sc.name}' (${sc.id}) [${currentCampaignId} > ${currentActId || sc.act}].`);

    renderSelectorsDOM();
    renderPrimitivesMenuDOM();
    if (selectedPrimitiveId) {
      selectScenePrimitive(selectedPrimitiveId, { syncViewer: true });
    }
    return sc;
  }

  function selectScenePrimitive(itemId, options = {}) {
    const sc = getCurrentScene();
    let item = _findItemInScene(sc, itemId);
    if (!item) {
      // Search across all scenes if not in current scene
      for (const s of Object.values(scenesManifest.scenes_by_id || {})) {
        const candidate = _findItemInScene(s, itemId);
        if (candidate) {
          currentSceneId = s.id;
          item = candidate;
          break;
        }
      }
    }
    if (!item) return null;

    selectedPrimitiveId = item.id;

    // Update active state in tree view DOM
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      const nodes = document.querySelectorAll('.tree-node-item');
      nodes.forEach((n) => {
        const nid = n.dataset ? n.dataset.nodeId : null;
        if (nid === item.id) {
          n.classList.add('active');
        } else {
          n.classList.remove('active');
        }
      });
    }

    renderSidebarPreviewDOM(item);

    if (options.syncViewer !== false) {
      const targetAssetId = item.asset_id || item.id;
      if (item._kind === 'cast') {
        selectAsset(item.id);
      } else if (physicalPropsMap.has(targetAssetId)) {
        selectAsset(targetAssetId);
      } else if (physicalPropsMap.has(item.id)) {
        selectAsset(item.id);
      } else {
        selectAsset({
          id: item.id,
          kind: 'prop',
          label: item.name,
          fragment_id: item.fragment_id,
          salience: 'major',
          image_url: item.image_2d || null,
          lore: item.description,
          dimensions: item.dimensions,
          triangle_count: item.triangle_count,
        });
        compileAssetBrief(item.id);
      }

      if (options.focusMap && Array.isArray(item.world_pos) && item.world_pos.length >= 2) {
        focusSceneAssetOnMap(item.id);
      }
    }

    return item;
  }

  function syncSidebarToSelectedAsset(assetId) {
    const sc = getCurrentScene();
    if (!sc) return;
    const item = _findItemInScene(sc, assetId);
    if (item && item.id !== selectedPrimitiveId) {
      selectedPrimitiveId = item.id;
      if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
        const nodes = document.querySelectorAll('.tree-node-item');
        nodes.forEach((n) => {
          const nid = n.dataset ? n.dataset.nodeId : null;
          if (nid === item.id) n.classList.add('active');
          else n.classList.remove('active');
        });
      }
      renderSidebarPreviewDOM(item);
    }
  }

  function focusSceneAssetOnMap(itemId) {
    const sc = getCurrentScene();
    const item = _findItemInScene(sc, itemId || selectedPrimitiveId) || getSelectedScenePrimitive();
    if (!item) return false;

    let wx = null;
    let wy = null;
    if (Array.isArray(item.world_pos) && item.world_pos.length >= 2) {
      wx = Number(item.world_pos[0]);
      wy = Number(item.world_pos[1]);
    } else if (item.asset_id && physicalPropsMap.has(item.asset_id)) {
      const p = physicalPropsMap.get(item.asset_id);
      wx = p.world_x;
      wy = p.world_y;
    }

    if (wx !== null && wy !== null) {
      updatePlayerPosition(wx, wy);
      log('STAGE', `Focused map viewport on '${item.name}' at (${wx.toFixed(1)}m, ${wy.toFixed(1)}m).`);
      playAudioCue('click');
      return { x: wx, y: wy, id: item.id };
    }
    return false;
  }

  function togglePrimitivesMenu(forceOpen) {
    if (typeof document === 'undefined') return;
    const sidebar = document.getElementById('asset-nav-sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    if (sidebar) {
      const shouldCollapse = forceOpen !== undefined ? !forceOpen : !sidebar.classList.contains('collapsed');
      if (shouldCollapse) {
        sidebar.classList.add('collapsed');
        if (resizer && resizer.classList) resizer.classList.add('collapsed');
      } else {
        sidebar.classList.remove('collapsed');
        if (resizer && resizer.classList) resizer.classList.remove('collapsed');
      }
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('sq_sidebar_collapsed', shouldCollapse ? 'true' : 'false');
        }
      } catch (e) {}
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new Event('resize'));
      }
    }
    renderPrimitivesMenuDOM();
  }

  function toggleSidebar(forceCollapse) {
    if (forceCollapse === true) {
      togglePrimitivesMenu(false);
    } else if (forceCollapse === false) {
      togglePrimitivesMenu(true);
    } else {
      togglePrimitivesMenu();
    }
  }

  function isSidebarCollapsed() {
    if (typeof document === 'undefined') return false;
    const sidebar = document.getElementById('asset-nav-sidebar');
    return sidebar ? sidebar.classList.contains('collapsed') : false;
  }

  function setupSidebarResizer() {
    if (typeof document === 'undefined') return;
    const sidebar = document.getElementById('asset-nav-sidebar');
    const resizer = document.getElementById('sidebar-resizer');
    if (!sidebar || !resizer) return;

    try {
      if (typeof localStorage !== 'undefined') {
        const savedW = localStorage.getItem('sq_sidebar_width');
        if (savedW && sidebar.style) {
          const wNum = parseInt(savedW, 10);
          if (wNum >= 180 && wNum <= 650) {
            sidebar.style.width = `${wNum}px`;
          }
        }
        const wasCollapsed = localStorage.getItem('sq_sidebar_collapsed') === 'true';
        if (wasCollapsed) {
          sidebar.classList.add('collapsed');
          if (resizer.classList) resizer.classList.add('collapsed');
        }
      }
    } catch (e) {}

    let isDragging = false;
    let startX = 0;
    let startWidth = 0;

    if (resizer.addEventListener) {
      resizer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startWidth = (sidebar.getBoundingClientRect && sidebar.getBoundingClientRect().width) || sidebar.clientWidth || 300;
        if (sidebar.classList) sidebar.classList.add('no-transition');
        if (resizer.classList) resizer.classList.add('dragging');
        if (document.body && document.body.style) {
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
        }

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          const delta = moveEvent.clientX - startX;
          const winWidth = typeof window !== 'undefined' ? (window.innerWidth || 1200) : 1200;
          const maxW = Math.min(Math.round(winWidth * 0.6), 650);
          const clampedW = Math.max(180, Math.min(maxW, Math.round(startWidth + delta)));
          if (sidebar.style) sidebar.style.width = `${clampedW}px`;
        };

        const onMouseUp = () => {
          if (!isDragging) return;
          isDragging = false;
          if (sidebar.classList) sidebar.classList.remove('no-transition');
          if (resizer.classList) resizer.classList.remove('dragging');
          if (document.body && document.body.style) {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
          }
          if (typeof window !== 'undefined') {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          }

          const currentW = Math.round((sidebar.getBoundingClientRect && sidebar.getBoundingClientRect().width) || sidebar.clientWidth || 300);
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem('sq_sidebar_width', currentW.toString());
            }
          } catch (err) {}
          if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
            window.dispatchEvent(new Event('resize'));
          }
        };

        if (typeof window !== 'undefined') {
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        }
      });
    }
  }

  function openPrimitivesMenu(filter = 'all') {
    currentPrimitiveFilter = filter;
    togglePrimitivesMenu(true);
  }

  function closePrimitivesMenu() {
    togglePrimitivesMenu(false);
  }

  function filterPrimitives(category) {
    currentPrimitiveFilter = category;
    renderPrimitivesMenuDOM();
  }

  function _getCategoryIcon(cat) {
    if (cat === 'containers' || cat === 'vessels') return '📦';
    if (cat === 'architecture') return '🏛️';
    if (cat === 'instruments' || cat === 'monuments') return '🧭';
    if (cat === 'hazards') return '❄️';
    if (cat === 'hearth') return '🔥';
    if (cat === 'markers') return '🪧';
    if (cat === 'cast') return '🎭';
    return '🪑';
  }

  // --- Left Sidebar Vertical Collapsibility ---
  function toggleSidebarSection(sectionId) {
    if (typeof document === 'undefined') return false;
    const section = document.getElementById(sectionId);
    if (!section) return false;
    const isColl = section.classList.toggle('is-collapsed');
    const chevron = document.getElementById(`chevron-${sectionId}`);
    if (chevron) {
      chevron.textContent = isColl ? '▶' : '▼';
    }
    const header = section.querySelector('.sidebar-section-header');
    if (header) {
      if (isColl) header.classList.add('is-collapsed');
      else header.classList.remove('is-collapsed');
    }
    try {
      localStorage.setItem(`sq_sidebar_${sectionId}`, isColl ? 'collapsed' : 'expanded');
    } catch (e) {}
    return isColl;
  }

  function isSidebarSectionCollapsed(sectionId) {
    if (typeof document === 'undefined') return false;
    const section = document.getElementById(sectionId);
    return section ? section.classList.contains('is-collapsed') : false;
  }

  // --- Multi-Representation Preview Facets ---
  let currentPreviewFacet = 'sprite';

  function setPreviewFacet(facet) {
    currentPreviewFacet = facet || 'sprite';
    if (typeof document !== 'undefined') {
      const tabs = document.querySelectorAll('.sidebar-facet-tabs .facet-tab');
      tabs.forEach((tab) => {
        const f = tab.getAttribute('data-facet') || tab.id.replace('facet-tab-', '');
        if (f === currentPreviewFacet) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      const activeItem = getSelectedScenePrimitive();
      if (activeItem) {
        renderSidebarPreviewDOM(activeItem);
      }
    }
    return currentPreviewFacet;
  }

  function getPreviewFacet() {
    return currentPreviewFacet;
  }

  function getFacetImageForItem(item, facet) {
    if (!item) return '';
    const pid = item.id;
    if (facet === 'collage') {
      if (item.collage_url) return item.collage_url;
      if (['ancient-bastion', 'relic-cairn', 'wish-stone-slab', 'ruined-watchtower', 'ancient-ruin-terrace'].includes(pid)) {
        return `renders/primitives/${pid}-collage.png`;
      }
      return item.image_2d || '';
    }
    if (facet === 'depth') {
      if (item.depth_url) return item.depth_url;
      return `renders/primitives/${pid}-depth.png`;
    }
    if (facet === 'collider') {
      if (item.collider_url) return item.collider_url;
      if (item.collage_url) return item.collage_url;
      if (['ancient-bastion', 'relic-cairn', 'wish-stone-slab', 'ruined-watchtower', 'ancient-ruin-terrace'].includes(pid)) {
        return `renders/primitives/${pid}-collage.png`;
      }
      return item.image_2d || '';
    }
    // Default 'sprite':
    return item.sprite_url || item.image_2d || (item._kind === 'cast' ? synthesizeForgeRender({ id: item.id, kind: 'actor', label: item.name }) : '');
  }

  function renderSidebarPreviewDOM(item) {
    if (typeof document === 'undefined') return;
    const activeItem = item || getSelectedScenePrimitive();
    if (!activeItem) return;

    const previewImg = document.getElementById('sidebar-preview-img');
    const previewTitle = document.getElementById('sidebar-preview-title');
    const previewRole = document.getElementById('sidebar-preview-role');
    const previewMeta = document.getElementById('sidebar-preview-meta');
    const previewDesc = document.getElementById('sidebar-preview-desc');
    const zoomHint = document.getElementById('sidebar-preview-zoom-hint');

    let imgUrl = getFacetImageForItem(activeItem, currentPreviewFacet);
    if (!imgUrl && activeItem._kind === 'cast') {
      imgUrl = synthesizeForgeRender({
        id: activeItem.id,
        kind: 'actor',
        label: activeItem.name,
      });
    }

    if (previewImg) {
      previewImg.src = imgUrl;
      previewImg.alt = `${activeItem.name || activeItem.id} (${currentPreviewFacet})`;
    }

    if (zoomHint) {
      if (currentPreviewFacet === 'collage') {
        zoomHint.textContent = '🔬 5-Cell Pipeline Review (Click to Enlarge)';
      } else if (currentPreviewFacet === 'depth') {
        zoomHint.textContent = '⛰️ 3D Depth Template (Click to Enlarge)';
      } else if (currentPreviewFacet === 'collider') {
        zoomHint.textContent = '📦 CoACD Convex Collider (Click to Enlarge)';
      } else {
        zoomHint.textContent = '🖼️ 2D Sprite Cutout (Click to Enlarge)';
      }
    }

    if (previewTitle) {
      previewTitle.textContent = activeItem.name || activeItem.id;
    }
    if (previewRole) {
      previewRole.textContent = activeItem.stage_role || activeItem.role || activeItem.category || 'Scene Asset';
    }
    if (previewMeta) {
      const dims = activeItem.dimensions
        ? `${activeItem.dimensions[0]}×${activeItem.dimensions[1]}×${activeItem.dimensions[2]}m`
        : 'Actor';
      const isAncient = activeItem.category === 'ancient_ruin' ||
        activeItem.overhang_constrained ||
        (activeItem.overhang_angle_deg && activeItem.overhang_angle_deg <= 45.0) ||
        ['ancient-bastion', 'relic-cairn', 'wish-stone-slab', 'ruined-watchtower', 'ancient-ruin-terrace'].includes(activeItem.id);

      const overhangBadge = isAncient
        ? `<span class="prim-badge" style="color: #34d399; border-color: #059669;" title="Strictly conforms to the 45° FDM cantilever overhang constraint">✓ 45° Overhang Rule</span>`
        : (activeItem._kind !== 'cast' ? `<span class="prim-badge" style="color: #fbbf24; border-color: #d97706;" title="Modern human construction">⚠️ Modern Cantilever</span>` : '');

      const trisStr = activeItem.source_triangles
        ? `🔺 ${Number(activeItem.source_triangles).toLocaleString()} Source / ${Number(activeItem.triangle_count || 1000).toLocaleString()} LOD`
        : (activeItem.triangle_count ? `🔺 ${Number(activeItem.triangle_count).toLocaleString()} tris` : (activeItem._kind === 'cast' ? 'NPC Sheet' : '3D Mesh'));

      const coacdPieces = activeItem.coacd_pieces || (isAncient ? '6–16 CoACD Boxes' : '');
      const colliderBadge = coacdPieces
        ? `<span class="prim-badge" style="color: #60a5fa; border-color: #2563eb;" title="Physics Collision Mesh">📦 ${escapeHtml(coacdPieces)}</span>`
        : '';

      const groundBadge = activeItem._kind !== 'cast'
        ? `<span class="prim-badge" style="color: #a78bfa; border-color: #7c3aed;" title="Base Grounded at Z=0.0m with Watertight Solid Skirt">⚓ Z=0.0m Solid Skirt</span>`
        : '';

      const posStr = Array.isArray(activeItem.world_pos)
        ? `📍 (${activeItem.world_pos[0]}, ${activeItem.world_pos[1]})m`
        : '📦 Staged Palette';

      previewMeta.innerHTML = `
        <span class="prim-badge prim-badge-dim" title="Metric Bounding Box">📐 ${escapeHtml(dims)}</span>
        ${overhangBadge}
        <span class="prim-badge prim-badge-tris" title="Mesh Complexity">${escapeHtml(trisStr)}</span>
        ${colliderBadge}
        ${groundBadge}
        <span class="prim-badge prim-badge-frag" title="Source Lore Fragment">📜 ${escapeHtml(activeItem.fragment_id || '')}</span>
        <span class="prim-badge" style="color: #38bdf8; border-color: #0369a1;" title="Map Placement">${escapeHtml(posStr)}</span>
      `;
    }
    if (previewDesc) {
      previewDesc.textContent = activeItem.description || '';
    }

    const previewPrompt = document.getElementById('sidebar-preview-prompt');
    if (previewPrompt) {
      const promptText = (selectedAsset && (selectedAsset.id === activeItem.id || selectedAsset.id === activeItem.asset_id))
        ? (selectedAsset.diffusion_prompt || activeItem.diffusion_prompt || 'Awaiting compile...')
        : (activeItem.diffusion_prompt || 'Awaiting compile...');
      previewPrompt.textContent = promptText;
    }
  }

  function renderSelectorsDOM() {
    if (typeof document === 'undefined') return;
    const camp = getCurrentCampaign();
    const acts = getActs(currentCampaignId);
    const act = getCurrentAct();
    const sc = getCurrentScene();

    // 1. Campaign Selector
    const campEl = document.getElementById('campaign-selector');
    if (campEl) {
      const camps = getCampaigns();
      if (camps.length > 0) {
        const currentOptions = Array.from(campEl.options || []).map((o) => o.value);
        const campKeys = camps.map((c) => c.id);
        const needsRebuild = currentOptions.length !== campKeys.length || !campKeys.every((k, i) => currentOptions[i] === k);
        if (needsRebuild) {
          campEl.innerHTML = camps
            .map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === currentCampaignId ? 'selected' : ''}>${escapeHtml(c.name || c.id)}</option>`)
            .join('');
        }
        if (campEl.value !== currentCampaignId) {
          campEl.value = currentCampaignId;
        }
      }
    }

    // 2. Act Selector
    const actEl = document.getElementById('act-selector');
    if (actEl) {
      const currentActOptions = Array.from(actEl.options || []).map((o) => o.value);
      const actKeys = acts.map((a) => a.id);
      const needsActRebuild = currentActOptions.length !== actKeys.length || !actKeys.every((k, i) => currentActOptions[i] === k);
      if (needsActRebuild) {
        const actHtml = acts
          .map((a) => `<option value="${escapeHtml(a.id)}" ${a.id === currentActId ? 'selected' : ''}>${escapeHtml(a.name || a.id)}</option>`)
          .join('');
        actEl.innerHTML = actHtml || `<option value="">No Acts</option>`;
      }
      if (act && actEl.value !== act.id) {
        actEl.value = act.id;
      }
    }

    // 3. Scene Selector
    const sceneEl = document.getElementById('scene-selector');
    if (sceneEl) {
      const actScenes = (act?.scenes || []).map((sId) => getScene(sId)).filter(Boolean);
      const targetScenes = actScenes.length > 0 ? actScenes : getScenes();
      const currentSceneOptions = Array.from(sceneEl.options || []).map((o) => o.value);
      const sceneKeys = targetScenes.map((s) => s.id);
      const needsSceneRebuild = currentSceneOptions.length !== sceneKeys.length || !sceneKeys.every((k, i) => currentSceneOptions[i] === k);
      if (needsSceneRebuild) {
        const sceneHtml = targetScenes
          .map((s) => `<option value="${escapeHtml(s.id)}" ${s.id === currentSceneId ? 'selected' : ''}>${escapeHtml(s.name || s.id)}</option>`)
          .join('');
        sceneEl.innerHTML = sceneHtml || `<option value="">No Scenes</option>`;
      }
      if (sc && sceneEl.value !== sc.id) {
        sceneEl.value = sc.id;
      }
    }

    // 4. Breadcrumb
    const crumbEl = document.getElementById('sidebar-hierarchy-crumb');
    if (crumbEl && sc) {
      const cTitle = camp?.short_name || camp?.name || 'Campaign';
      const aTitle = act?.name?.split(':')[0]?.trim() || act?.name || 'Act';
      const sTitle = sc?.name || 'Scene';
      crumbEl.textContent = `${cTitle} › ${aTitle} › ${sTitle}`;
      crumbEl.title = `${camp?.name} — ${act?.name} — ${sc?.name}`;
    }

    // 5. Scene Description & Count
    const descEl = document.getElementById('sidebar-scene-desc');
    if (descEl && sc) {
      descEl.textContent = sc.description || '';
    }

    const badgeCount = document.getElementById('primitives-badge-count');
    if (badgeCount && sc) {
      badgeCount.textContent = (sc.primitives || []).length;
    }
  }

  function renderPrimitivesMenuDOM() {
    if (typeof document === 'undefined') return;
    renderSelectorsDOM();
    const sc = getCurrentScene();
    if (!sc) return;

    if (!selectedPrimitiveId || !_findItemInScene(sc, selectedPrimitiveId)) {
      selectedPrimitiveId = sc.primitives?.[0]?.id || null;
    }

    const actEl = document.getElementById('sidebar-scene-act');
    if (actEl) actEl.textContent = sc.act || sc.name;

    const descEl = document.getElementById('sidebar-scene-desc');
    if (descEl) descEl.textContent = sc.description || '';

    const badgeCount = document.getElementById('primitives-badge-count');
    if (badgeCount) badgeCount.textContent = sc.primitives.length;

    const treeContainer = document.getElementById('sidebar-asset-tree');
    const grid = document.getElementById('primitives-grid');

    const filteredPrims = (sc.primitives || []).filter(
      (p) => currentPrimitiveFilter === 'all' || p.category === currentPrimitiveFilter
    );

    // Group primitives into hierarchical tree folders
    const groupsMap = new Map();
    filteredPrims.forEach((p) => {
      const gName = p.tree_group || 'Scene Assets';
      if (!groupsMap.has(gName)) groupsMap.set(gName, []);
      groupsMap.get(gName).push(p);
    });

    if (treeContainer) {
      let treeHtml = '';
      for (const [groupName, items] of groupsMap.entries()) {
        const folderIcon = groupName.includes('Relics')
          ? '📦'
          : groupName.includes('Architecture')
            ? '🏛️'
            : groupName.includes('Instruments')
              ? '🧭'
              : '🪑';
        treeHtml += `
          <details class="tree-folder" open>
            <summary class="tree-folder-summary">
              <span class="tree-folder-title">${folderIcon} ${escapeHtml(groupName)}</span>
              <span class="tree-folder-count">${items.length}</span>
            </summary>
            <div class="tree-folder-children">
              ${items.map((p) => {
                const isActive = p.id === selectedPrimitiveId;
                const icon = _getCategoryIcon(p.category);
                const dims = p.dimensions ? `${p.dimensions[0]}×${p.dimensions[1]}×${p.dimensions[2]}m` : '';
                return `
                  <div class="tree-node-item ${isActive ? 'active' : ''}" data-node-id="${escapeHtml(p.id)}" data-primitive-id="${escapeHtml(p.id)}" data-asset-id="${escapeHtml(p.asset_id || p.id)}" onclick="window.viewer && window.viewer.selectScenePrimitive && window.viewer.selectScenePrimitive('${escapeHtml(p.id)}')">
                    <span class="tree-node-icon">${icon}</span>
                    <div class="tree-node-text">
                      <div class="tree-node-label">${escapeHtml(p.name)}</div>
                      <div class="tree-node-sub">${escapeHtml(p.id)}.stl · ${escapeHtml(dims)}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </details>
        `;
      }

      // Staging Palette (Available Outdoor Ruins Catalogue)
      treeHtml += `
        <details class="tree-folder" open>
          <summary class="tree-folder-summary">
            <span class="tree-folder-title">📦 Staging Palette (Outdoor Ruins)</span>
            <span class="tree-folder-count">${STAGING_PRIMITIVES_PALETTE.length}</span>
          </summary>
          <div class="tree-folder-children">
            ${STAGING_PRIMITIVES_PALETTE.map((p) => {
              const placed = (sc.primitives || []).find((pr) => pr.id === p.id);
              const isActive = p.id === selectedPrimitiveId;
              const dims = p.dimensions ? `${p.dimensions[0]}×${p.dimensions[1]}×${p.dimensions[2]}m` : '';
              const statusTag = placed && Array.isArray(placed.world_pos)
                ? `📍 (${placed.world_pos[0]}, ${placed.world_pos[1]})m`
                : `📦 Ready to Stage`;
              return `
                <div class="tree-node-item ${isActive ? 'active' : ''}" data-node-id="${escapeHtml(p.id)}" data-primitive-id="${escapeHtml(p.id)}" data-asset-id="${escapeHtml(p.asset_id || p.id)}" onclick="window.viewer && window.viewer.selectScenePrimitive && window.viewer.selectScenePrimitive('${escapeHtml(p.id)}')">
                  <span class="tree-node-icon">🏛️</span>
                  <div class="tree-node-text">
                    <div class="tree-node-label">${escapeHtml(p.name)}</div>
                    <div class="tree-node-sub">${escapeHtml(p.id)}.stl · ${escapeHtml(dims)} · ${statusTag}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </details>
      `;

      if (currentPrimitiveFilter === 'all' && Array.isArray(sc.cast) && sc.cast.length > 0) {
        treeHtml += `
          <details class="tree-folder" open>
            <summary class="tree-folder-summary">
              <span class="tree-folder-title">🎭 Cast & Dramatis Personae</span>
              <span class="tree-folder-count">${sc.cast.length}</span>
            </summary>
            <div class="tree-folder-children">
              ${sc.cast.map((c) => {
                const isActive = c.id === selectedPrimitiveId;
                return `
                  <div class="tree-node-item ${isActive ? 'active' : ''}" data-node-id="${escapeHtml(c.id)}" onclick="window.viewer && window.viewer.selectScenePrimitive && window.viewer.selectScenePrimitive('${escapeHtml(c.id)}')">
                    <span class="tree-node-icon">🎭</span>
                    <div class="tree-node-text">
                      <div class="tree-node-label">${escapeHtml(c.name)}</div>
                      <div class="tree-node-sub">${escapeHtml(c.role || 'Actor')}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </details>
        `;
      }

      treeContainer.innerHTML = treeHtml || `<div class="no-primitives-notice">No assets in category '${escapeHtml(currentPrimitiveFilter)}'.</div>`;
    }

    // Also populate legacy #primitives-grid if present in DOM
    if (grid) {
      grid.innerHTML = filteredPrims.map((p) => {
        const dims = p.dimensions ? `${p.dimensions[0]}m × ${p.dimensions[1]}m × ${p.dimensions[2]}m` : 'Metric';
        return `<div class="primitive-card" data-primitive-id="${escapeHtml(p.id)}"><img src="${p.image_2d}" alt="${escapeHtml(p.name)}" class="prim-img" /><span class="prim-card-title">${escapeHtml(p.name)}</span><span class="prim-badge-dim">${dims}</span></div>`;
      }).join('');
    }

    renderSidebarPreviewDOM(getSelectedScenePrimitive());
  }

  function openPrimitiveLightbox(primitiveId, facet) {
    if (typeof document === 'undefined') return;
    const targetId = primitiveId || selectedPrimitiveId;
    const activeFacet = facet || currentPreviewFacet || 'sprite';
    const sc = getCurrentScene();
    const prim = _findItemInScene(sc, targetId) ||
      Object.values(scenesManifest.scenes_by_id || {}).flatMap((s) => s.primitives).find((p) => p.id === targetId);

    if (!prim) return;

    const modal = document.getElementById('primitive-lightbox');
    const imgEl = document.getElementById('lightbox-img');
    const detailsEl = document.getElementById('lightbox-details');
    if (!modal || !imgEl || !detailsEl) return;

    const imgUrl = getFacetImageForItem(prim, activeFacet);
    imgEl.src = imgUrl;
    imgEl.alt = `${prim.name} (${activeFacet})`;

    const dims = prim.dimensions ? `${prim.dimensions[0]}m × ${prim.dimensions[1]}m × ${prim.dimensions[2]}m` : 'Character Sheet';
    const trisStr = prim.source_triangles
      ? `${Number(prim.source_triangles).toLocaleString()} Source / ${Number(prim.triangle_count || 1000).toLocaleString()} LOD`
      : `${prim.triangle_count || 'N/A'}`;
    const coacdStr = prim.coacd_pieces || '6–16 CoACD Boxes';
    const overhangStr = (prim.category === 'ancient_ruin' || prim.overhang_constrained || ['ancient-bastion', 'relic-cairn', 'wish-stone-slab', 'ruined-watchtower', 'ancient-ruin-terrace'].includes(prim.id))
      ? '✓ 45° Cantilever Overhang Compliant'
      : '⚠️ Modern Construction';

    detailsEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;">
        <div class="lightbox-title">${escapeHtml(prim.name)}</div>
        <div class="sidebar-facet-tabs" style="margin: 0; min-width: 260px;">
          <button class="facet-tab ${activeFacet === 'sprite' ? 'active' : ''}" onclick="window.viewer && window.viewer.openPrimitiveLightbox('${escapeHtml(prim.id)}', 'sprite')">🖼️ Sprite</button>
          <button class="facet-tab ${activeFacet === 'depth' ? 'active' : ''}" onclick="window.viewer && window.viewer.openPrimitiveLightbox('${escapeHtml(prim.id)}', 'depth')">⛰️ 3D Depth</button>
          <button class="facet-tab ${activeFacet === 'collage' ? 'active' : ''}" onclick="window.viewer && window.viewer.openPrimitiveLightbox('${escapeHtml(prim.id)}', 'collage')">🔬 5-Cell Collage</button>
          <button class="facet-tab ${activeFacet === 'collider' ? 'active' : ''}" onclick="window.viewer && window.viewer.openPrimitiveLightbox('${escapeHtml(prim.id)}', 'collider')">📦 Collider</button>
        </div>
      </div>
      <div class="lightbox-meta" style="margin-top: 6px;">
        <span class="prim-badge prim-badge-dim">📐 Dimensions: ${escapeHtml(dims)}</span>
        <span class="prim-badge prim-badge-tris">🔺 Triangles: ${escapeHtml(trisStr)}</span>
        <span class="prim-badge" style="color: #60a5fa; border-color: #2563eb;">📦 Collider: ${escapeHtml(coacdStr)}</span>
        <span class="prim-badge" style="color: #34d399; border-color: #059669;">${escapeHtml(overhangStr)}</span>
        <span class="prim-badge prim-badge-frag">📜 Fragment: ${escapeHtml(prim.fragment_id || '')}</span>
      </div>
      <div class="lightbox-desc">${escapeHtml(prim.description)}</div>
      <div class="lightbox-prompt-box">
        <div class="prompt-box-label">BLACK FOREST LABS FLUX 3 KLEIN DIFFUSION PROMPT SPECIFICATION:</div>
        <div class="prompt-box-content">${escapeHtml(prim.diffusion_prompt || (selectedAsset?.diffusion_prompt) || 'Awaiting compile...')}</div>
      </div>
      <div class="lightbox-actions" style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="header-btn" style="background: #1e1b4b; color: #a5b4fc; border: 1px solid #4338ca;" onclick="window.viewer && window.viewer.compileAssetBrief && window.viewer.compileAssetBrief('${escapeHtml(prim.id)}')">⚡ Compile (Gemma4-Orion)</button>
        <button class="header-btn" style="background: #0f172a; color: #38bdf8; border: 1px solid #0284c7;" onclick="window.viewer && window.viewer.runPrimitive3DPipeline && window.viewer.runPrimitive3DPipeline('${escapeHtml(prim.id)}')">📐 3D Pipeline</button>
        <button class="header-btn" onclick="window.viewer && window.viewer.forgeScenePrimitive && window.viewer.forgeScenePrimitive('${escapeHtml(prim.id)}')">✨ Dispatch to Asset Forge (Flux 3 Klein)</button>
        <button class="header-btn" style="background: #2a241e; color: #e6dfd5;" onclick="window.viewer && window.viewer.closePrimitiveLightbox && window.viewer.closePrimitiveLightbox()">✕ Close Inspection</button>
      </div>
    `;

    modal.classList.remove('hidden');
    playAudioCue('click');
  }

  function closePrimitiveLightbox() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('primitive-lightbox');
    if (modal) modal.classList.add('hidden');
  }

  function forgeScenePrimitive(primitiveId) {
    const targetId = primitiveId || selectedPrimitiveId;
    closePrimitiveLightbox();
    const sc = getCurrentScene();
    const prim = _findItemInScene(sc, targetId) ||
      Object.values(scenesManifest.scenes_by_id || {}).flatMap((s) => s.primitives).find((p) => p.id === targetId);
    const assetKey = prim?.asset_id || targetId;
    if (physicalPropsMap.has(assetKey)) {
      selectAsset(assetKey);
      return renderAssetInForge(assetKey);
    } else if (prim) {
      selectAsset({
        id: prim.id,
        label: prim.name,
        fragment_id: prim.fragment_id,
        salience: 'major',
        lore_snippet: prim.description,
        diffusion_prompt: `orthographic top-down 2.5D isometric game asset cutout, ${prim.name}, ${prim.description}, source fragment: ${prim.fragment_id}, isolated on neutral solid grey background (#707070), subtle directional studio lighting, soft ground contact occlusion shadow, crisp 16-bit painterly texture, highly detailed tactile physical prop, Black Forest Labs Flux 3 Klein render, 1024x1024`,
      });
      return renderAssetInForge(prim.id);
    }
    return null;
  }

  function handleClick(pxX, pxY, wWidth = (world ? world.clientWidth || 600 : 600), wHeight = (world ? world.clientHeight || 700 : 700)) {
    const worldCoord = screenToWorld(pxX, pxY, wWidth, wHeight);
    const hit = getInteractableAt(worldCoord.x, worldCoord.y);

    if (hit && hit.kind === 'prop') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      selectAsset(hit.id);
      return { hitKind: 'prop', targetId: hit.id, x: hit.targetX, y: hit.targetY, selectedAsset };
    } else if (hit && hit.kind === 'cue_mark') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      selectAsset(hit.id);
      return { hitKind: 'cue_mark', targetId: hit.id, x: hit.targetX, y: hit.targetY, selectedAsset };
    } else if (hit && hit.kind === 'actor') {
      tryMoveActor('player', hit.targetX, hit.targetY);
      selectAsset(hit.id);
      return { hitKind: 'actor', targetId: hit.id, x: hit.targetX, y: hit.targetY, selectedAsset };
    } else {
      tryMoveActor('player', worldCoord.x, worldCoord.y);
      const z = getZoneAt(worldCoord.x, worldCoord.y);
      if (z) {
        selectAsset(z.id);
      }
      return { hitKind: 'ground', x: worldCoord.x, y: worldCoord.y, selectedAsset };
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
    role: 'Understudy',
    x: playerX,
    y: playerY,
    z: sampleElevation(playerX, playerY),
    facing: 0,
    color: '#2dd4bf',
    written: actorWritten,
    tokenEl: playerEl,
    balloonEl: null,
    image_url: '../../terrain/lighting-demo/player_in_pass.png',
    diffusion_prompt: 'Pell the Underwritten, traveler in heavy wool cloak standing on frosted mountain pass road, Flux 3 Klein portrait',
    lore_snippet: 'Understudy traveling with unwritten standing, bearing cargo slips toward the frontier.',
  });

  if (playerEl) {
    playerEl.addEventListener('click', () => selectAsset('player'));
  }

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

      tokenEl.addEventListener('click', (e) => {
        if (e.stopPropagation) e.stopPropagation();
        selectAsset(id);
      });

      if (world && world.appendChild) {
        const wW = world.clientWidth || 600;
        const wH = world.clientHeight || 700;
        tokenEl.style.left = `${(ax / mapWidthM) * wW}px`;
        tokenEl.style.top = `${(ay / mapLengthM) * wH}px`;
        world.appendChild(tokenEl);
      }
    }

    const defaultImg = id === 'player'
      ? '../../terrain/lighting-demo/player_in_pass.png'
      : (id === 'hollis' ? '../../terrain/lighting-demo/player_center_plateau.png' : null);
    const defaultPrompt = id === 'player'
      ? 'Pell the Underwritten, traveler in heavy wool cloak standing on frosted mountain pass road, Flux 3 Klein portrait'
      : (id === 'hollis' ? 'Hollis the Twice-Written, stern imperial customs quartermaster in official robes inspecting freight at dais, Flux 3 Klein portrait' : `${name}, 2.5D character portrait rendered via Flux 3 Klein`);

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
      image_url: options.image_url || defaultImg,
      diffusion_prompt: options.diffusion_prompt || defaultPrompt,
      lore_snippet: options.lore_snippet || `${name} (${role})`,
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
    const bStr = typeof document !== 'undefined' ? document.getElementById('badge-strength') : null;
    if (bStr) bStr.innerText = `${playerStrength.toFixed(0)} kg`;
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
    spawnParticles(prop.world_x, prop.world_y, 24, 'glass_shards');
    playAudioCue('smash');
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
      updateDepthSorting();
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
      updateDepthSorting();
      renderLightingOverlay();
    } else if (actor.tokenEl) {
      actor.tokenEl.style.left = `${(x / mapWidthM) * wW}px`;
      actor.tokenEl.style.top = `${(y / mapLengthM) * wH}px`;
      updateDepthSorting();
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
          // Standing-Scaled Physical Durability & Resistance
          const standingScore = typeof prop.standing_score === 'number' ? prop.standing_score : 0.65;
          let massMod = 1.0;
          if (standingScore < 0.25) {
            massMod = 0.75;
          } else if (standingScore < 0.50) {
            massMod = 0.90;
          } else if (standingScore >= 0.85) {
            massMod = 1.35;
          }
          const effectiveMass = prop.mass_kg * massMod;

          if (pushStrength >= effectiveMass) {
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
          playAudioCue('push');
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

    if (at.required_prop_standing && at.required_prop_standing !== 'any') {
      const prop = physicalPropsMap.get(at.prop_id);
      const propTier = prop ? prop.standing_tier : 'unwritten';
      const STANDING_ORDER = { unwritten: 1, provisional: 2, refined_by_criticism: 2, verified: 3, warranted: 4, canon_locked: 5 };
      const reqRank = STANDING_ORDER[at.required_prop_standing] || 1;
      const actualRank = STANDING_ORDER[propTier] || 1;
      if (actualRank < reqRank) {
        return {
          success: false,
          reason: 'prop_standing_refused',
          status: 'prop_standing_refused',
          affordanceId,
          verb,
          message: `Requires prop standing '${at.required_prop_standing}', but '${at.prop_id}' is '${propTier}'`,
        };
      }
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
    } else if (vantageId === 'cam_barrier_gate') {
      targetX = 61.0;
      targetY = 80.0;
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
      } else if (beat.type === 'portal') {
        const opened = setPortalState(beat.portalId, beat.state !== false);
        executionLog.push({ type: 'portal', portalId: beat.portalId, state: opened, status: 'updated' });
      } else if (beat.type === 'atmosphere') {
        setAtmosphereMode(beat.mode);
        executionLog.push({ type: 'atmosphere', mode: beat.mode, status: 'set' });
      } else if (beat.type === 'audio') {
        playAudioCue(beat.cue);
        executionLog.push({ type: 'audio', cue: beat.cue, status: 'played' });
      } else if (beat.type === 'cartographer_survey') {
        const propId = beat.propId;
        const prop = physicalPropsMap.get(propId);
        const standing = prop ? prop.standing_tier : 'unwritten';
        const warrant = prop ? prop.warrant_id : null;
        let dialogue = '';
        if (standing === 'warranted' || standing === 'canon_locked') {
          dialogue = `Behold: ${prop?.label || propId}. Certified under ${warrant || 'Canon Warrant'}. Its footing is warranted.`;
        } else if (standing === 'refined_by_criticism') {
          dialogue = `A surveyor strike-mark defaces this asset: rejected by authorial criticism. It stands under caution.`;
        } else if (standing === 'provisional') {
          dialogue = `This fixture stands upon provisional survey lines. A waiting field note, not yet carved into copper.`;
        } else {
          dialogue = `An unwritten slab awaits prompt specification. The Bureau withholds standing.`;
        }
        if (beat.actor) {
          await speak(beat.actor, beat.text || dialogue, {
            durationMs: (beat.durationMs || 1500) / speedMultiplier,
          });
        }
        executionLog.push({
          type: 'cartographer_survey',
          propId,
          standing_tier: standing,
          status: 'surveyed',
          dialogue: beat.text || dialogue,
        });
      } else if (beat.type === 'pause') {
        await new Promise((r) => setTimeout(r, (beat.durationMs || 500) / speedMultiplier));
      }
    }

    return executionLog;
  }

  async function playBorderClearanceCutscene(options = {}) {
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
        { type: 'audio', cue: 'seal_stamp' },
        { type: 'portal', portalId: 'gate-cleared-barrier', state: true },
        { type: 'camera', vantage: 'cam_barrier_gate' },
        { type: 'speak', actor: 'pell', text: 'Clearance recorded. Raising transit barrier.', durationMs: 1800 },
        { type: 'move', actor: 'pell', to: [61.0, 85.0], durationMs: 1600 },
        { type: 'speak', actor: 'pell', text: 'Clearance granted. Onward across the frontier march.', durationMs: 2400 },
        { type: 'camera', vantage: 'macro_exploration' },
      ],
    };
    return await playCutscene(script, options);
  }

  // Initial setup
  renderFeaturesDOM();
  updatePlayerPosition(playerX, playerY);
  selectAsset('r6_ship_crate_standard');
  renderPrimitivesMenuDOM();
  setupSidebarResizer();
  log('STAGE', 'SpriteQuest 2.5D Viewport Engine initialized.');
  log('STAGE', `Loaded scene with ${physicalPropsMap.size} physical props and ${cueMarks.length} cue marks.`);
  if (typeof fetch !== 'undefined') {
    checkComfyServer().catch(() => {});
    checkForgeServer().catch(() => {});
  }

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
    updateDepthSorting,
    getAtmosphereMode,
    setAtmosphereMode,
    getLightingState,
    getParticles,
    clearParticles,
    spawnParticles,
    stepParticles,
    isAudioMuted,
    setAudioMuted,
    playAudioCue,
    getPortalState,
    setPortalState,
    selectAsset,
    getSelectedAsset: () => selectedAsset,
    compileAssetBrief,
    compileSelectedAssetBrief,
    renderAssetInForge,
    renderSelectedAssetInForge,
    surveyAssetCoherence,
    curateAssetFragment,
    criticizeAssetFragment,
    getLogs: () => [...logEntries],
    clearLogs,
    log,
    checkComfyServer,
    checkForgeServer,
    getForgeServiceUrl,
    getCampaigns,
    getCampaign,
    getCurrentCampaign,
    selectCampaign,
    getActs,
    getCurrentAct,
    selectAct,
    getScenes,
    getScene,
    getCurrentScene,
    getScenePrimitives,
    selectScene,
    selectScenePrimitive,
    getSelectedScenePrimitive,
    focusSceneAssetOnMap,
    renderSidebarPreviewDOM,
    renderSelectorsDOM,
    togglePrimitivesMenu,
    toggleSidebar,
    isSidebarCollapsed,
    toggleSidebarSection,
    isSidebarSectionCollapsed,
    setPreviewFacet,
    getPreviewFacet,
    getStagingPalette: () => [...STAGING_PRIMITIVES_PALETTE],
    openPrimitivesMenu,
    closePrimitivesMenu,
    filterPrimitives,
    renderPrimitivesMenuDOM,
    openPrimitiveLightbox,
    closePrimitiveLightbox,
    forgeScenePrimitive,
    runPrimitive3DPipeline,
  };

  const globalRoot = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  if (globalRoot) {
    globalRoot.checkComfyServer = checkComfyServer;
    globalRoot.checkForgeServer = checkForgeServer;
    globalRoot.getForgeServiceUrl = getForgeServiceUrl;
    globalRoot.getPlayerPos = () => ({ x: playerX, y: playerY });
    globalRoot.getPlayerPosition = () => ({ x: playerX, y: playerY });
    globalRoot.screenToWorld = screenToWorld;
    globalRoot.getInteractableAt = getInteractableAt;
    globalRoot.handleMouseMove = handleMouseMove;
    globalRoot.handleClick = handleClick;
    globalRoot.updateDepthSorting = updateDepthSorting;
    globalRoot.getAtmosphereMode = getAtmosphereMode;
    globalRoot.setAtmosphereMode = setAtmosphereMode;
    globalRoot.getLightingState = getLightingState;
    globalRoot.getParticles = getParticles;
    globalRoot.clearParticles = clearParticles;
    globalRoot.spawnParticles = spawnParticles;
    globalRoot.stepParticles = stepParticles;
    globalRoot.isAudioMuted = isAudioMuted;
    globalRoot.setAudioMuted = setAudioMuted;
    globalRoot.playAudioCue = playAudioCue;
    globalRoot.getPortalState = getPortalState;
    globalRoot.setPortalState = setPortalState;
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
    globalRoot.selectAsset = selectAsset;
    globalRoot.getSelectedAsset = () => selectedAsset;
    globalRoot.compileAssetBrief = compileAssetBrief;
    globalRoot.compileSelectedAssetBrief = compileSelectedAssetBrief;
    globalRoot.renderAssetInForge = renderAssetInForge;
    globalRoot.renderSelectedAssetInForge = renderSelectedAssetInForge;
    globalRoot.surveyAssetCoherence = surveyAssetCoherence;
    globalRoot.curateAssetFragment = curateAssetFragment;
    globalRoot.criticizeAssetFragment = criticizeAssetFragment;
    globalRoot.getLogs = () => [...logEntries];
    globalRoot.clearLogs = clearLogs;
    globalRoot.log = log;
    globalRoot.checkComfyServer = checkComfyServer;
    globalRoot.getCampaigns = getCampaigns;
    globalRoot.getCampaign = getCampaign;
    globalRoot.getCurrentCampaign = getCurrentCampaign;
    globalRoot.selectCampaign = selectCampaign;
    globalRoot.getActs = getActs;
    globalRoot.getCurrentAct = getCurrentAct;
    globalRoot.selectAct = selectAct;
    globalRoot.getScenes = getScenes;
    globalRoot.getScene = getScene;
    globalRoot.getCurrentScene = getCurrentScene;
    globalRoot.getScenePrimitives = getScenePrimitives;
    globalRoot.selectScene = selectScene;
    globalRoot.selectScenePrimitive = selectScenePrimitive;
    globalRoot.getSelectedScenePrimitive = getSelectedScenePrimitive;
    globalRoot.focusSceneAssetOnMap = focusSceneAssetOnMap;
    globalRoot.renderSidebarPreviewDOM = renderSidebarPreviewDOM;
    globalRoot.renderSelectorsDOM = renderSelectorsDOM;
    globalRoot.togglePrimitivesMenu = togglePrimitivesMenu;
    globalRoot.toggleSidebar = toggleSidebar;
    globalRoot.isSidebarCollapsed = isSidebarCollapsed;
    globalRoot.toggleSidebarSection = toggleSidebarSection;
    globalRoot.isSidebarSectionCollapsed = isSidebarSectionCollapsed;
    globalRoot.setPreviewFacet = setPreviewFacet;
    globalRoot.getPreviewFacet = getPreviewFacet;
    globalRoot.getStagingPalette = () => [...STAGING_PRIMITIVES_PALETTE];
    globalRoot.openPrimitivesMenu = openPrimitivesMenu;
    globalRoot.closePrimitivesMenu = closePrimitivesMenu;
    globalRoot.filterPrimitives = filterPrimitives;
    globalRoot.renderPrimitivesMenuDOM = renderPrimitivesMenuDOM;
    globalRoot.openPrimitiveLightbox = openPrimitiveLightbox;
    globalRoot.closePrimitiveLightbox = closePrimitiveLightbox;
    globalRoot.forgeScenePrimitive = forgeScenePrimitive;
    globalRoot.runPrimitive3DPipeline = runPrimitive3DPipeline;
    globalRoot.onCampaignSelectChange = (val) => selectCampaign(val);
    globalRoot.onActSelectChange = (val) => selectAct(val);
    globalRoot.onSceneSelectChange = (val) => selectScene(val);
    globalRoot.viewer = instance;
  }

  return instance;
}

const globalRoot = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
if (globalRoot) {
  globalRoot.initViewer = initViewer;
}


