#!/usr/bin/env python3
"""
companion/export_web_preview.py

Generates an interactive, standalone 2.5D CSS Parallax & Cursor Depth Probe
web viewer for an outdoor map bundle.

Features:
  - Hardware-accelerated CSS 3D parallax stack (preserve-3d + perspective)
  - Player-centric perspective origin (perspective-origin follows player position)
  - Interactive Cursor Depth Probe (hovering mouse probes local elevation & casts radial light)
  - Player movement (WASD, Arrow keys, or click-to-move) with smooth perspective transitions
  - Real-time canvas Line-of-Sight & Fog of War rendering
"""

from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.scene_placement import ScenePlacementEngine
from companion.terrain_lighting import TerrainLighting
from companion.terrain_mesh import load_outdoor_map_scene


def generate_interactive_html(map_path: Path, out_html_path: Path) -> Path:
    tm, map_data = load_outdoor_map_scene(map_path)
    tl = TerrainLighting(tm)

    # Downsampled elevation matrix for fast in-browser client queries (e.g. 120x140 grid)
    elev_data = [
        [round(float(tm.heights[r, c]), 2) for c in range(tm.cols)]
        for r in range(tm.rows)
    ]

    import io
    strata_b64: list[str] = []
    for s_idx in range(4):
        s_img = tm.render_stratum_layer(s_idx, num_strata=4, contour_step_m=2.0)
        s_buf = io.BytesIO()
        s_img.save(s_buf, format="PNG")
        strata_b64.append(base64.b64encode(s_buf.getvalue()).decode("ascii"))

    strata_json = json.dumps([
        {"id": s.id, "name": s.name, "z_min": s.z_min, "z_max": s.z_max, "css_z": s.css_z_px}
        for s in tm.slice_strata(4)
    ])

    spawn = map_data.get("initial_spawn", {}).get("player", {"x": 35.0, "y": 65.0})
    player_x = float(spawn.get("x", 35.0))
    player_y = float(spawn.get("y", 65.0))

    # Resolve scene floorplans and props on the map
    scene_engine = ScenePlacementEngine(tm, map_data)
    features_json = json.dumps(scene_engine.export_features_json())

    viewer_js_path = REPO_ROOT / "companion" / "web" / "viewer.js"
    viewer_js_code = viewer_js_path.read_text(encoding="utf-8")
    viewer_js_code = viewer_js_code.replace("export function initViewer", "function initViewer")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{map_data.get('name', 'Outdoor Map')} - SpriteQuest 2.5D Parallax Engine</title>
  <style>
    :root {{
      --bg: #141210;
      --panel: #1e1b18;
      --accent: #2dd4bf;
      --text: #e6dfd5;
      --gold: #f59e0b;
      --player-screen-x: 50%;
      --player-screen-y: 50%;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; user-select: none; }}
    body {{
      background: var(--bg);
      color: var(--text);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }}
    header {{
      background: var(--panel);
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #332d27;
      z-index: 100;
    }}
    h1 {{ font-size: 15px; font-weight: 600; color: #f3ece2; }}
    .badge {{
      display: inline-block;
      padding: 2px 7px;
      background: #2a241e;
      border: 1px solid #4a3e34;
      border-radius: 4px;
      font-size: 11px;
      color: var(--accent);
      margin-left: 8px;
    }}
    .controls-hint {{ font-size: 11px; color: #9c8e80; }}

    #main-container {{
      flex: 1;
      display: flex;
      position: relative;
      overflow: hidden;
    }}

    /* The 3D Perspective Viewport */
    .viewport-3d {{
      flex: 1;
      position: relative;
      overflow: hidden;
      perspective: 900px;
      perspective-origin: var(--player-screen-x) var(--player-screen-y);
      transition: perspective-origin 0.22s cubic-bezier(0.2, 0.8, 0.25, 1.0);
      background: radial-gradient(circle at center, #1c1815 0%, #0d0b0a 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: crosshair;
    }}

    /* The preserve-3d World Container */
    .world-plane {{
      position: relative;
      width: 600px;
      height: 700px;
      transform-style: preserve-3d;
      will-change: transform;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
      border: 2px solid #3a322b;
    }}

    /* Elevation Strata Layers */
    .stratum-layer {{
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-size: cover;
      pointer-events: none;
    }}
    .layer-0 {{
      background-image: url('data:image/png;base64,{strata_b64[0]}');
      transform: translateZ(0px);
    }}
    .layer-1 {{
      background-image: url('data:image/png;base64,{strata_b64[1]}');
      transform: translateZ(35px);
      filter: drop-shadow(0 4px 10px rgba(0,0,0,0.5));
    }}
    .layer-2 {{
      background-image: url('data:image/png;base64,{strata_b64[2]}');
      transform: translateZ(80px);
      filter: drop-shadow(0 8px 18px rgba(0,0,0,0.6));
    }}
    .layer-3 {{
      background-image: url('data:image/png;base64,{strata_b64[3]}');
      transform: translateZ(140px);
      filter: drop-shadow(0 14px 28px rgba(0,0,0,0.7));
    }}

    /* Canvas Overlays (Lighting, Probe & Sightlines) */
    #lighting-canvas {{
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      transform: translateZ(142px);
      mix-blend-mode: multiply;
    }}

    /* Player Token */
    .player-token {{
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--accent);
      border: 2px solid #ffffff;
      transform: translate(-50%, -50%) translateZ(150px);
      box-shadow: 0 0 15px var(--accent);
      pointer-events: none;
      transition: left 0.06s linear, top 0.06s linear;
      z-index: 50;
    }}
    .player-arrow {{
      position: absolute;
      top: -6px; left: 6px;
      width: 0; height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-bottom: 7px solid #ffffff;
    }}

    /* Features Layer: Scene Zones, Architectural Walls, Portals, Props */
    .features-plane {{
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      transform-style: preserve-3d;
      transform: translateZ(48px);
      pointer-events: none;
    }}
    .scene-zone-box {{
      position: absolute;
      border: 1px dashed rgba(245, 158, 11, 0.22);
      background: rgba(32, 28, 24, 0.15);
      box-shadow: inset 0 0 14px rgba(0, 0, 0, 0.45);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .scene-zone-label {{
      font-size: 8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(245, 238, 223, 0.35);
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
      pointer-events: none;
      text-align: center;
      padding: 2px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }}
    .scene-zone-box:hover .scene-zone-label {{
      opacity: 0.9;
    }}
    .scene-wall-line {{
      position: absolute;
      background: #181412;
      border: 1px solid #5a4b3d;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.85);
      transform-origin: 0% 50%;
      pointer-events: none;
      z-index: 55;
    }}
    .scene-portal-marker {{
      position: absolute;
      transform: translate(-50%, -50%);
      border: 1px dashed #2dd4bf;
      background: rgba(45, 212, 191, 0.25);
      pointer-events: none;
      z-index: 56;
      transition: all 0.3s ease;
    }}
    .scene-portal-marker.portal-opened {{
      border: 1px dashed #22c55e;
      background: rgba(34, 197, 94, 0.45);
      box-shadow: 0 0 14px rgba(34, 197, 94, 0.65);
      opacity: 0.40;
    }}
    .scene-prop-token {{
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.15s ease-out;
      z-index: 60;
    }}
    .scene-prop-token:hover {{
      transform: translate(-50%, -50%) scale(1.22);
    }}
    .prop-icon {{
      width: 20px; height: 20px;
      border-radius: 4px;
      background: #241f1a;
      border: 1px solid var(--gold);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
    }}
    .prop-tag {{
      font-size: 8.5px;
      white-space: nowrap;
      background: rgba(18, 16, 14, 0.95);
      color: #f3ece2;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid #ca8a04;
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      z-index: 95;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
    }}
    .scene-prop-token:hover .prop-tag,
    .prop-r6-crate:hover .prop-tag,
    .prop-weigh-scale:hover .prop-tag,
    .prop-ledger-desk:hover .prop-tag,
    .prop-glass-coffin:hover .prop-tag,
    .prop-warrant-pedestal:hover .prop-tag,
    .prop-unmodelled-slab:hover .prop-tag {{
      opacity: 1;
      visibility: visible;
    }}

    /* Stagecraft Layer: Proscenium Line, Playing Area Rings, Actor Cue Marks */
    .stagecraft-proscenium-line {{
      position: absolute;
      height: 3px;
      background: repeating-linear-gradient(
        to right,
        #ef4444 0px,
        #ef4444 8px,
        transparent 8px,
        transparent 14px
      );
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.65);
      pointer-events: none;
      z-index: 57;
    }}
    .stagecraft-proscenium-label {{
      position: absolute;
      top: -14px;
      right: 4px;
      font-size: 8px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fca5a5;
      background: rgba(24, 16, 16, 0.85);
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid rgba(239, 68, 68, 0.45);
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
    }}
    .stagecraft-proscenium-line:hover .stagecraft-proscenium-label {{
      opacity: 1;
      visibility: visible;
    }}
    .stagecraft-playing-ring {{
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 1px dashed rgba(45, 212, 191, 0.35);
      background: radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, transparent 75%);
      pointer-events: none;
      z-index: 52;
    }}
    .stagecraft-cue-mark {{
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      pointer-events: auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 65;
      transition: transform 0.15s ease-out;
    }}
    .stagecraft-cue-mark:hover {{
      transform: translate(-50%, -50%) scale(1.25);
    }}
    .cue-star {{
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(20, 18, 16, 0.92);
      border: 1.5px solid #38bdf8;
      color: #38bdf8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.55);
    }}
    .cue-tag,
    .cue-mark-label {{
      font-size: 8px;
      white-space: nowrap;
      background: rgba(15, 23, 42, 0.95);
      color: #bae6fd;
      padding: 2px 6px;
      border-radius: 3px;
      border: 1px solid rgba(56, 189, 248, 0.6);
      position: absolute;
      bottom: calc(100% + 4px);
      left: 50%;
      transform: translateX(-50%);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity 0.15s ease, visibility 0.15s ease;
      z-index: 95;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
    }}
    .stagecraft-cue-mark:hover .cue-tag,
    .stagecraft-cue-mark:hover .cue-mark-label {{
      opacity: 1;
      visibility: visible;
    }}
    .stage-direction-box {{
      margin-top: 6px;
      padding: 6px 8px;
      background: #0e0c0a;
      border: 1px solid #332d27;
      border-radius: 4px;
      font-size: 10px;
      line-height: 1.35;
      color: #d6cbbd;
      white-space: pre-wrap;
      max-height: 125px;
      overflow-y: auto;
    }}

    /* Visually Meaningful Fragment Prop Styles */
    .prop-r6-crate {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(28px);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: grab;
      z-index: 55;
    }}
    .crate-box {{
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #78350f 0%, #92400e 50%, #451a03 100%);
      border: 2px solid #ca8a04;
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.75), inset 0 0 6px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }}
    .crate-stencil {{
      font-family: 'Courier New', monospace;
      font-size: 7px;
      font-weight: 800;
      color: #fef08a;
      letter-spacing: 0.05em;
    }}
    .crate-band {{
      width: 100%; height: 3px;
      background: #475569;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border-top: 1px solid #1e293b;
      border-bottom: 1px solid #1e293b;
    }}
    .crate-mass {{
      font-size: 6px;
      color: #cbd5e1;
      margin-top: 5px;
      font-weight: 700;
    }}

    .prop-weigh-scale {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .scale-base {{
      width: 38px; height: 26px;
      background: #334155;
      border: 1px solid #64748b;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 2px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.7);
    }}
    .scale-beam {{
      width: 32px; height: 3px;
      background: #eab308;
      display: flex;
      justify-content: space-between;
      position: relative;
      transition: transform 0.3s ease;
    }}
    .scale-pan {{
      width: 8px; height: 4px;
      background: #cbd5e1;
      border-radius: 0 0 4px 4px;
      border: 1px solid #475569;
    }}
    .scale-label {{
      font-size: 6px;
      color: #94a3b8;
      font-weight: 700;
      text-transform: uppercase;
    }}

    .prop-ledger-desk {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(32px);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .desk-surface {{
      width: 44px; height: 26px;
      background: linear-gradient(135deg, #3f2e20 0%, #5c4331 100%);
      border: 1px solid #855e3e;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.8);
    }}
    .ledger-folio {{
      width: 18px; height: 14px;
      background: #fef3c7;
      border: 1px solid #b45309;
      display: flex;
    }}
    .folio-col {{
      flex: 1;
      border-right: 1px dashed #d97706;
    }}
    .desk-quill {{
      font-size: 10px;
    }}

    /* Borosilicate Glass Stasis Coffin (Space Vampires impounded artifact) */
    .prop-glass-coffin {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(30px);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: grab;
      z-index: 55;
      transition: transform 0.2s ease, opacity 0.3s ease;
    }}
    .coffin-hex-chassis {{
      width: 24px; height: 50px;
      background: rgba(8, 28, 36, 0.75);
      border: 1.5px solid #38bdf8;
      border-radius: 6px;
      box-shadow: 0 0 16px rgba(56, 189, 248, 0.45), inset 0 0 10px rgba(56, 189, 248, 0.35);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 3px;
      position: relative;
      overflow: hidden;
    }}
    .coffin-cryo-chamber {{
      width: 100%; height: 100%;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(2, 132, 199, 0.05) 80%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }}
    .coffin-sleeper {{
      width: 10px; height: 28px;
      background: rgba(224, 242, 254, 0.55);
      border-radius: 4px;
      filter: blur(1px);
    }}
    .coffin-cycle-counter {{
      font-family: 'Courier New', monospace;
      font-size: 5px;
      color: #4ade80;
      letter-spacing: 0.05em;
      position: absolute;
      bottom: 2px;
    }}
    /* Smashed Debris State */
    .prop-glass-coffin.smashed {{
      cursor: default;
      filter: grayscale(0.5);
    }}
    .prop-glass-coffin.smashed .coffin-hex-chassis {{
      background: rgba(15, 23, 42, 0.3);
      border: 1px dashed rgba(56, 189, 248, 0.4);
      box-shadow: 0 0 6px rgba(56, 189, 248, 0.2);
      transform: scaleY(0.4) rotate(8deg);
      border-radius: 2px;
    }}
    .prop-glass-coffin.smashed .coffin-sleeper {{
      display: none;
    }}
    .prop-glass-coffin.smashed::after {{
      content: '✨ shards';
      position: absolute;
      font-size: 7px;
      color: #7dd3fc;
      bottom: -4px;
      white-space: nowrap;
    }}

    /* Canon Warrant Pedestal (Cartographers) */
    .prop-warrant-pedestal {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(30px);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .pedestal-stone {{
      width: 26px; height: 26px;
      background: #475569;
      border: 1px solid #94a3b8;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0,0,0,0.7);
      position: relative;
    }}
    .warrant-brass-disc {{
      width: 14px; height: 14px;
      border-radius: 50%;
      background: radial-gradient(circle, #fde047 0%, #ca8a04 100%);
      border: 1px solid #713f12;
      box-shadow: 0 0 6px rgba(234, 179, 8, 0.6);
      font-size: 5px;
      font-weight: 800;
      color: #451a03;
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .warrant-ribbon {{
      width: 4px; height: 8px;
      background: #dc2626;
      border-radius: 0 0 2px 2px;
      margin-top: -1px;
    }}

    /* Unmodelled Placeholder Slab (4th-Wall Standing Translation) */
    .prop-unmodelled-slab {{
      position: absolute;
      transform: translate(-50%, -50%) translateZ(25px);
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: grab;
      z-index: 55;
    }}
    .unmodelled-clay-box {{
      width: 28px; height: 28px;
      background: #c4b5fd;
      border: 1.5px dashed #7c3aed;
      border-radius: 2px;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.6), inset 0 0 6px rgba(124, 58, 237, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .unmodelled-wireframe-label {{
      font-size: 5.5px;
      font-family: monospace;
      color: #4c1d95;
      text-align: center;
      font-weight: 700;
    }}

    /* Imperial Clearance Statutes Noticeboard */
    .prop-statute-board {{
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .statute-board-timber {{
      width: 32px; height: 38px;
      background: linear-gradient(135deg, #451a03 0%, #78350f 100%);
      border: 1.5px solid #b45309;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.8);
      position: relative;
    }}
    .statute-placard {{
      width: 24px; height: 26px;
      background: #fef3c7;
      border: 1px solid #d97706;
      font-family: serif;
      font-size: 5px;
      font-weight: 800;
      color: #78350f;
      text-align: center;
      padding: 2px;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
    }}
    .statute-red-seal {{
      width: 8px; height: 8px;
      background: #dc2626;
      border-radius: 50%;
      border: 1px solid #7f1d1d;
      box-shadow: 0 0 4px rgba(220, 38, 38, 0.6);
      position: absolute;
      bottom: 4px;
    }}

    /* Ancient Chained Grimoire on Lectern */
    .prop-grimoire-lectern {{
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .grimoire-oak-stand {{
      width: 26px; height: 32px;
      background: linear-gradient(135deg, #271b12 0%, #3d291a 100%);
      border: 1px solid #785233;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.85);
      position: relative;
    }}
    .grimoire-open-folio {{
      width: 20px; height: 16px;
      background: #fde68a;
      border: 1px solid #b45309;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
    }}
    .grimoire-floating-rune {{
      position: absolute;
      top: -8px;
      font-size: 11px;
      color: #38bdf8;
      text-shadow: 0 0 6px rgba(56, 189, 248, 0.9);
      animation: runeHover 2s ease-in-out infinite alternate;
    }}
    @keyframes runeHover {{
      from {{ transform: translateY(0px); opacity: 0.7; }}
      to {{ transform: translateY(-3px); opacity: 1.0; }}
    }}

    /* Monumental Living Atlas Folio */
    .prop-living-atlas {{
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
    }}
    .atlas-granite-pedestal {{
      width: 44px; height: 32px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border: 1.5px solid #ca8a04;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0,0,0,0.9);
      position: relative;
    }}
    .atlas-monumental-folio {{
      width: 36px; height: 22px;
      background: #713f12;
      border: 1px solid #eab308;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
    }}
    .atlas-illuminated-face {{
      width: 30px; height: 16px;
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 1px solid #b45309;
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.45);
    }}
    .atlas-brass-cranks {{
      position: absolute;
      right: -6px;
      bottom: 2px;
      font-size: 9px;
      color: #eab308;
      filter: drop-shadow(0 1px 2px #000);
    }}

    /* Uninstalled Primed Matte Backdrop Flat */
    .prop-matte-flat {{
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 54;
      cursor: grab;
    }}
    .matte-canvas-cylinder {{
      width: 14px; height: 38px;
      background: linear-gradient(90deg, #d4d4d8 0%, #a1a1aa 50%, #71717a 100%);
      border: 1px solid #52525b;
      border-radius: 6px;
      transform: rotate(-12deg);
      box-shadow: 2px 4px 10px rgba(0,0,0,0.7);
      position: relative;
    }}
    .matte-painted-edge {{
      position: absolute;
      top: 4px; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, #38bdf8, #ca8a04);
      opacity: 0.85;
    }}
    .matte-wooden-dowel {{
      position: absolute;
      top: -3px; left: 2px; width: 8px; height: 3px;
      background: #78350f;
      border-radius: 1px;
    }}

    /* Impounded Forfeit Consignment Chest */
    .prop-forfeit-chest {{
      position: absolute;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 55;
      cursor: grab;
    }}
    .forfeit-iron-cage {{
      width: 28px; height: 24px;
      background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
      border: 1.5px solid #71717a;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0,0,0,0.85);
      position: relative;
    }}
    .forfeit-lead-padlock {{
      font-size: 8px;
      color: #94a3b8;
      position: absolute;
      top: 2px;
    }}
    .forfeit-draft-tag {{
      width: 20px; height: 9px;
      background: #fef08a;
      border: 1px solid #ca8a04;
      font-size: 4.5px;
      font-weight: 800;
      color: #713f12;
      text-align: center;
      line-height: 9px;
      position: absolute;
      bottom: 3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }}

    /* Actor Tokens & Theatrical Speech Balloons */
    .actor-token {{
      position: absolute;
      width: 22px; height: 22px;
      border-radius: 50%;
      transform: translate(-50%, -50%) translateZ(42px);
      box-shadow: 0 0 12px rgba(0, 0, 0, 0.85);
      transition: transform 0.1s linear, left 0.1s linear, top 0.1s linear;
      z-index: 65;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #fef08a;
      cursor: pointer;
    }}
    .actor-badge {{
      font-size: 10px;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 1px 2px #000;
      pointer-events: none;
    }}
    .actor-speech-bubble {{
      position: absolute;
      bottom: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%) translateZ(50px);
      background: rgba(20, 17, 14, 0.96);
      color: #fef08a;
      border: 1px solid #ca8a04;
      border-radius: 6px;
      padding: 7px 11px;
      font-family: Georgia, serif;
      font-size: 11px;
      line-height: 1.4;
      white-space: normal;
      width: max-content;
      max-width: 230px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
      pointer-events: none;
      z-index: 100;
    }}
    .actor-speech-bubble::after {{
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 6px;
      border-style: solid;
      border-color: #ca8a04 transparent transparent transparent;
    }}
    .actor-speech-speaker {{
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #fde047;
      margin-bottom: 3px;
    }}

    /* Cutscene Controller Button */
    .btn-cutscene {{
      background: linear-gradient(135deg, #ca8a04 0%, #a16207 100%);
      color: #fff;
      border: 1px solid #eab308;
      border-radius: 4px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 10px;
      box-shadow: 0 2px 8px rgba(202, 138, 4, 0.35);
      transition: all 0.2s ease;
    }}
    .btn-cutscene:hover {{
      background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
      box-shadow: 0 4px 14px rgba(234, 179, 8, 0.5);
    }}
    .btn-cutscene:active {{
      transform: scale(0.98);
    }}

    /* Cursor Depth Probe Ring & Floating Interaction Tooltip */
    .probe-cursor {{
      position: absolute;
      width: 24px; height: 24px;
      border-radius: 50%;
      border: 2px dashed var(--gold);
      transform: translate(-50%, -50%);
      pointer-events: none;
      display: none;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.45);
      z-index: 90;
    }}
    .cursor-tooltip {{
      position: absolute;
      transform: translate(14px, 14px);
      background: rgba(14, 12, 10, 0.95);
      border: 1px solid #ca8a04;
      border-radius: 4px;
      padding: 6px 9px;
      color: #f3ece2;
      font-size: 10px;
      line-height: 1.35;
      pointer-events: none;
      display: none;
      z-index: 120;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.85);
      max-width: 220px;
    }}
    .tooltip-badge {{
      font-size: 7.5px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      color: #ca8a04;
      margin-bottom: 2px;
    }}
    .tooltip-title {{
      font-weight: 700;
      color: #fef08a;
      font-size: 11px;
    }}
    .tooltip-meta {{
      font-size: 9px;
      color: #94a3b8;
      margin-top: 2px;
    }}
    .tooltip-verbs {{
      font-size: 8.5px;
      color: #38bdf8;
      margin-top: 4px;
    }}

    /* Telemetry HUD Panel - Compact layout with custom scrolling */
    .telemetry-panel {{
      width: 330px;
      background: var(--panel);
      border-left: 1px solid #332d27;
      padding: 12px 10px;
      display: flex;
      flex-direction: column;
      gap: 7px;
      font-size: 11px;
      z-index: 100;
      max-height: calc(100vh - 46px);
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #554433 #151311;
    }}
    .panel-section {{
      background: #151311;
      border: 1px solid #2d2620;
      border-radius: 5px;
      padding: 7px 9px;
    }}
    .panel-section-collapsible {{
      width: 100%;
    }}
    .section-summary {{
      cursor: pointer;
      user-select: none;
      outline: none;
      list-style: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .section-summary::-webkit-details-marker {{
      display: none;
    }}
    .section-title {{
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #b09f8e;
      display: flex;
      align-items: center;
      gap: 5px;
    }}
    .section-summary .section-title::before {{
      content: '▶';
      font-size: 7.5px;
      color: #786b59;
      transition: transform 0.18s ease;
      display: inline-block;
    }}
    details[open] > .section-summary .section-title::before {{
      transform: rotate(90deg);
      color: var(--accent);
    }}
    .section-summary-badge {{
      font-size: 8.5px;
      font-weight: 600;
      color: #a8947f;
      background: #241f1a;
      padding: 1px 5px;
      border-radius: 3px;
      border: 1px solid #3d332a;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }}
    .section-body {{
      margin-top: 7px;
      padding-top: 5px;
      border-top: 1px dashed #261f19;
    }}
    .stat-row {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 3.5px;
      color: #c4b5a5;
      font-size: 10.5px;
    }}
    .stat-val {{ font-weight: 600; color: #f5eedf; }}
    .stat-accent {{ color: var(--accent); }}
    .stat-gold {{ color: var(--gold); }}

    .legend-bar {{
      height: 8px;
      border-radius: 3px;
      background: linear-gradient(to right, #4a3e34 0%, #a8947f 50%, #f5ecd9 100%);
      margin-top: 5px;
    }}

    /* Asset & Diffusion Viewer in Sidebar */
    .asset-viewer-section {{
      background: #181512;
      border: 1.5px solid #4a3b2c;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.65);
    }}
    .asset-viewer-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }}
    .asset-badge {{
      font-size: 8px;
      font-weight: 800;
      color: #f59e0b;
      background: #291d0e;
      border: 1px solid #78350f;
      border-radius: 3px;
      padding: 1px 5px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    .asset-title-row {{
      display: flex;
      flex-direction: column;
      margin-bottom: 7px;
    }}
    .asset-name {{
      font-size: 12px;
      font-weight: 700;
      color: #fef08a;
      line-height: 1.25;
    }}
    .asset-id {{
      font-size: 9px;
      color: #8b7d6b;
      font-family: monospace;
    }}
    .asset-image-container {{
      width: 100%;
      min-height: 130px;
      background: #0c0b09;
      border: 1px solid #382e24;
      border-radius: 4px;
      margin-bottom: 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }}
    .asset-img-wrapper {{
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }}
    .asset-viewer-img {{
      max-width: 100%;
      max-height: 175px;
      object-fit: contain;
      border-radius: 3px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.85);
    }}
    .asset-img-caption {{
      width: 100%;
      background: rgba(12, 10, 8, 0.92);
      font-size: 8px;
      color: #ca8a04;
      text-align: center;
      padding: 2.5px 4px;
      border-top: 1px solid #33271d;
    }}
    .asset-no-img-box {{
      padding: 12px 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }}
    .asset-no-img-icon {{
      font-size: 22px;
      color: #786b59;
    }}
    .asset-no-img-text {{
      font-size: 10px;
      font-weight: 600;
      color: #d6cbbd;
    }}
    .asset-no-img-sub {{
      font-size: 8.5px;
      color: #8c7e70;
      line-height: 1.3;
      max-width: 250px;
      font-style: italic;
    }}
    .asset-lore-box {{
      font-size: 9.5px;
      color: #c5b8a5;
      background: #110f0d;
      border-left: 2px solid var(--accent);
      padding: 5px 7px;
      border-radius: 0 3px 3px 0;
      margin-bottom: 7px;
      line-height: 1.3;
      font-style: italic;
    }}
    .btn-forge-render {{
      width: 100%;
      padding: 6px 9px;
      background: linear-gradient(135deg, #78350f 0%, #b45309 100%);
      border: 1px solid #f59e0b;
      border-radius: 4px;
      color: #fef3c7;
      font-weight: 700;
      font-size: 10.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      box-shadow: 0 2px 8px rgba(180, 83, 9, 0.4);
      transition: all 0.2s ease;
    }}
    .btn-forge-render:hover {{
      background: linear-gradient(135deg, #92400e 0%, #d97706 100%);
      box-shadow: 0 3px 12px rgba(245, 158, 11, 0.6);
      transform: translateY(-1px);
    }}
    .btn-forge-render.btn-secondary {{
      background: #231d17;
      border-color: #786b59;
      color: #eed;
      box-shadow: none;
      margin-top: 4px;
    }}
    .btn-forge-render.btn-secondary:hover {{
      background: #2f271f;
      border-color: #ca8a04;
      color: #fef08a;
    }}
    .btn-forge-render.btn-compile {{
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-color: #38bdf8;
      color: #38bdf8;
      box-shadow: 0 2px 8px rgba(56, 189, 248, 0.25);
    }}
    .btn-forge-render.btn-compile:hover {{
      background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
      border-color: #7dd3fc;
      color: #f0f9ff;
      box-shadow: 0 3px 12px rgba(56, 189, 248, 0.5);
      transform: translateY(-1px);
    }}
    .btn-forge-render:disabled {{
      background: #2b231c;
      border-color: #554433;
      color: #887766;
      cursor: wait;
      transform: none;
      box-shadow: none;
    }}
    .forge-progress-bar {{
      width: 100%;
      height: 4px;
      background: #221c17;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 6px;
    }}
    .forge-progress-fill {{
      height: 100%;
      background: linear-gradient(90deg, #ca8a04, #38bdf8);
      width: 0%;
      animation: forgeAnim 1.2s ease-in-out infinite alternate;
    }}
    @keyframes forgeAnim {{
      from {{ width: 20%; }}
      to {{ width: 95%; }}
    }}

    /* Terminal & Activity Log Stream */
    .log-terminal {{
      background: #090807;
      border: 1px solid #2a231c;
      border-radius: 4px;
      padding: 6px 8px;
      font-family: monospace;
      font-size: 9.5px;
      line-height: 1.4;
      max-height: 140px;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: thin;
      scrollbar-color: #554433 #151311;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }}
    .log-line {{
      display: flex;
      align-items: baseline;
      gap: 5px;
      word-break: break-word;
    }}
    .log-time {{
      color: #6e6254;
      font-size: 8.5px;
      flex-shrink: 0;
    }}
    .log-badge {{
      font-size: 8px;
      font-weight: 700;
      padding: 0.5px 3.5px;
      border-radius: 2px;
      flex-shrink: 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .log-badge-forge {{ color: #f59e0b; background: #291d0e; border: 1px solid #78350f; }}
    .log-badge-comfyui {{ color: #38bdf8; background: #082f49; border: 1px solid #0369a1; }}
    .log-badge-stage {{ color: #34d399; background: #064e3b; border: 1px solid #047857; }}
    .log-badge-audio {{ color: #c084fc; background: #3b0764; border: 1px solid #7e22ce; }}
    .log-badge-phys {{ color: #eab308; background: #422006; border: 1px solid #854d0e; }}
    .log-badge-compiler {{ color: #2dd4bf; background: #134e4a; border: 1px solid #0f766e; }}
    .log-badge-rewriter {{ color: #f472b6; background: #831843; border: 1px solid #9d174d; }}
    .log-badge-sys {{ color: #94a3b8; background: #1e293b; border: 1px solid #475569; }}
    .log-badge-error {{ color: #f43f5e; background: #4c0519; border: 1px solid #be123c; }}

    .log-msg {{ color: #c4b5a5; }}
    .log-level-warn .log-msg {{ color: #fef08a; }}
    .log-level-error .log-msg {{ color: #fda4af; }}

    .log-toolbar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }}
    .log-btn {{
      background: #221c17;
      border: 1px solid #3d332a;
      border-radius: 3px;
      color: #a8947f;
      font-size: 8.5px;
      padding: 1px 6px;
      cursor: pointer;
    }}
    .log-btn:hover {{
      background: #2f271f;
      color: #f5eedf;
      border-color: #554433;
    }}
    .log-status-dot {{
      font-size: 8.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }}
    .log-status-dot::before {{
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }}
    .log-status-dot.online {{ color: #4ade80; }}
    .log-status-dot.online::before {{ background: #22c55e; box-shadow: 0 0 6px #22c55e; }}
    .log-status-dot.offline {{ color: #f59e0b; }}
    .log-status-dot.offline::before {{ background: #eab308; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>SpriteQuest 2.5D Topological Parallax Engine <span class="badge">{map_data.get('id')}</span></h1>
    </div>
    <div class="controls-hint">
      WASD / Arrows / Click to Move • Mouse Hover probes elevation & dynamic shadows
    </div>
  </header>

  <div id="main-container">
    <div class="viewport-3d" id="viewport">
      <div class="world-plane" id="world">
        <!-- Strata layers for CSS 3D parallax -->
        <div class="stratum-layer layer-0"></div>
        <div class="stratum-layer layer-1"></div>
        <div class="stratum-layer layer-2"></div>
        <div class="stratum-layer layer-3"></div>

        <!-- Features plane (zones, walls, portals, props) -->
        <div class="features-plane" id="features"></div>

        <!-- Lighting, probe and sightline canvas -->
        <canvas id="lighting-canvas" width="600" height="700"></canvas>

        <!-- Player token -->
        <div class="player-token" id="player">
          <div class="player-arrow"></div>
        </div>

        <!-- Mouse probe ring & floating tooltip -->
        <div class="probe-cursor" id="probe"></div>
        <div class="cursor-tooltip" id="cursor-tooltip"></div>
      </div>
    </div>

    <!-- Right-Hand Telemetry HUD -->
    <div class="telemetry-panel">
      <!-- 1. Asset & Diffusion Viewer Panel (Pinned at Top) -->
      <div class="panel-section asset-viewer-section" id="asset-viewer-panel">
        <div class="asset-viewer-header">
          <div class="section-title">
            <span>🎨 Asset & Diffusion Viewer</span>
          </div>
          <span class="asset-badge" id="asset-viewer-badge">[PROP · MAJOR]</span>
        </div>
        <div class="asset-title-row">
          <span class="asset-name" id="asset-viewer-name">R6-SHIP Standard Bounding Crate</span>
          <span class="asset-id" id="asset-viewer-id">r6_ship_crate_standard</span>
        </div>

        <div class="asset-image-container" id="asset-viewer-image-container">
          <!-- Populated dynamically: <img> with caption, or placeholder + prompt + Render button -->
        </div>

        <div class="asset-meta-row" id="asset-viewer-meta">
          <div class="stat-row"><span>Provenance:</span><span class="stat-val stat-accent" id="asset-viewer-provenance">customs-house/r6-ship</span></div>
          <div class="stat-row"><span>Compiled Lore:</span><span class="stat-val stat-accent" id="asset-viewer-fragments">r6-ship · single-face-reading</span></div>
          <div class="stat-row"><span>Cartographer Standing:</span><span class="stat-val stat-gold" id="asset-viewer-standing">VERIFIED (0.65)</span></div>
          <div class="stat-row"><span>Scene Backpressure:</span><span class="stat-val" id="asset-viewer-coherence">clearance-foyer · coherent</span></div>
          <div class="stat-row"><span>Physicality:</span><span class="stat-val" id="asset-viewer-physicality">42.5kg · physics object</span></div>
          <div class="stat-row"><span>Diffusion Model:</span><span class="stat-val stat-gold" id="asset-viewer-model">Black Forest Labs Flux 3 Klein</span></div>
          <div class="stat-row"><span>Pipeline Server:</span><span class="stat-val" id="asset-viewer-server-status" style="color: #4ade80;">Checking...</span></div>
          <div class="stat-row"><span>Lattice Pipeline:</span><span class="stat-val stat-gold" id="asset-viewer-pipeline-status">Fragment Compiler + Rewriter</span></div>
        </div>

        <div class="asset-lore-box" id="asset-viewer-lore">
          "Standardized rectangular shipping crate demanding arithmetic clearance."
        </div>

        <div class="asset-actions" id="asset-viewer-actions">
          <div style="display: flex; gap: 6px; margin-bottom: 6px;">
            <button class="btn-forge-render btn-compile" id="btn-forge-compile" onclick="window.viewer && window.viewer.compileSelectedAssetBrief && window.viewer.compileSelectedAssetBrief()">
              ⚡ Compile (Lattice)
            </button>
            <button class="btn-forge-render" id="btn-forge-render" onclick="window.viewer && window.viewer.renderSelectedAssetInForge && window.viewer.renderSelectedAssetInForge()">
              ✨ Render in Forge
            </button>
          </div>
          <div class="cartographer-actions" style="display: flex; gap: 6px;">
            <button class="btn-forge-render btn-secondary" id="btn-cartographer-survey" style="font-size: 10px; padding: 5px 8px; flex: 1;" onclick="window.viewer && window.viewer.surveyAssetCoherence && window.viewer.surveyAssetCoherence()">
              🧭 Survey
            </button>
            <button class="btn-forge-render btn-secondary" id="btn-cartographer-curate" style="font-size: 10px; padding: 5px 8px; flex: 1;" onclick="window.viewer && window.viewer.curateAssetFragment && window.viewer.curateAssetFragment()">
              ✒️ Curate
            </button>
            <button class="btn-forge-render btn-secondary" id="btn-cartographer-criticize" style="font-size: 10px; padding: 5px 8px; flex: 1;" onclick="window.viewer && window.viewer.criticizeAssetFragment && window.viewer.criticizeAssetFragment()">
              🗑️ Criticize
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Player Perspective Origin (Collapsible) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" open>
          <summary class="section-summary">
            <span class="section-title">Player Perspective</span>
            <span class="section-summary-badge" id="badge-player-xy">{player_x:.1f}m, {player_y:.1f}m</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>World Coord:</span><span class="stat-val stat-accent" id="stat-player-xy">{player_x:.1f}m, {player_y:.1f}m</span></div>
            <div class="stat-row"><span>Ground Elevation:</span><span class="stat-val stat-accent" id="stat-player-z">6.00m</span></div>
            <div class="stat-row"><span>Vanishing Point:</span><span class="stat-val" id="stat-vanishing">50%, 50%</span></div>
            <div class="stat-row"><span>Sightline Status:</span><span class="stat-val" style="color: #4ade80;">Active (Clear)</span></div>
          </div>
        </details>
      </div>

      <!-- 3. Scene Zone & Interactables (Collapsible) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" open>
          <summary class="section-summary">
            <span class="section-title">Zone & Interactables</span>
            <span class="section-summary-badge" id="badge-player-zone">Wilderness</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>Current Zone:</span><span class="stat-val stat-accent" id="stat-player-zone">Border Approach (Wilderness)</span></div>
            <div class="stat-row"><span>Nearest Prop:</span><span class="stat-val stat-gold" id="stat-nearest-prop">--</span></div>
          </div>
        </details>
      </div>

      <!-- 4. Physicality & Push Strength (Collapsible) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" open>
          <summary class="section-summary">
            <span class="section-title">Physicality & Push</span>
            <span class="section-summary-badge" id="badge-strength">60 kg</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>Push Strength:</span><span class="stat-val stat-gold" id="stat-player-strength">60 kg</span></div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              <button style="flex: 1; padding: 4px; font-size: 9.5px; background: #26211c; border: 1px solid #786b59; color: #eed; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(60)">60kg (Norm)</button>
              <button style="flex: 1; padding: 4px; font-size: 9.5px; background: #26211c; border: 1px solid #786b59; color: #eed; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(160)">160kg (Locker)</button>
              <button style="flex: 1; padding: 4px; font-size: 9.5px; background: #26211c; border: 1px solid #ca8a04; color: #fde047; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(320)">320kg (Cryo)</button>
            </div>
          </div>
        </details>
      </div>

      <!-- 5. Stagecraft Semantic Blackboard (Collapsible) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" open>
          <summary class="section-summary">
            <span class="section-title">Stagecraft Blackboard</span>
            <span class="section-summary-badge" id="badge-proscenium">wilderness</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>Proscenium State:</span><span class="stat-val stat-accent" id="stat-proscenium">wilderness</span></div>
            <div class="stat-row"><span>Anchored Cue Mark:</span><span class="stat-val stat-gold" id="stat-semantic-anchor">None</span></div>
            <div class="stat-row"><span>Camera Vantage:</span><span class="stat-val" id="stat-camera-vantage">macro_exploration</span></div>
            <div class="stat-row"><span>Affordances:</span><span class="stat-val stat-gold" id="stat-affordances">None</span></div>
            <div class="stage-direction-box" id="stat-stage-direction" style="font-size: 9.5px; padding: 5px 8px; margin: 6px 0;">[STAGE DIRECTION] Move onto stage or click a ★ Cue Mark.</div>
            <button class="btn-cutscene" id="btn-play-cutscene" style="padding: 5px; font-size: 10px;" onclick="window.viewer && window.viewer.playBorderClearanceCutscene && window.viewer.playBorderClearanceCutscene()">
              ▶ Play Cutscene: Border Clearance
            </button>
          </div>
        </details>
      </div>

      <!-- 6. Atmosphere & Audio Synthesizer (Collapsible) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" open>
          <summary class="section-summary">
            <span class="section-title">Atmosphere & Audio</span>
            <span class="section-summary-badge" id="badge-atmosphere">DAY</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>Lighting Shroud:</span><span class="stat-val stat-accent" id="stat-atmosphere">DAY</span></div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              <button style="flex: 1; padding: 3px; font-size: 9px; background: #26211c; border: 1px solid #786b59; color: #eed; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setAtmosphereMode('day')">☀️ Day</button>
              <button style="flex: 1; padding: 3px; font-size: 9px; background: #26211c; border: 1px solid #ca8a04; color: #fde047; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setAtmosphereMode('golden_hour')">🌅 Dusk</button>
              <button style="flex: 1; padding: 3px; font-size: 9px; background: #26211c; border: 1px solid #38bdf8; color: #7dd3fc; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setAtmosphereMode('night')">🌙 Night</button>
              <button style="flex: 1; padding: 3px; font-size: 9px; background: #26211c; border: 1px solid #2dd4bf; color: #99f6e4; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setAtmosphereMode('cryo')">❄️ Cryo</button>
            </div>
            <button id="btn-audio-toggle" style="width: 100%; margin-top: 6px; padding: 4px; font-size: 9.5px; background: #241f1a; border: 1px solid #786b59; color: #d6cbbd; border-radius: 3px; cursor: pointer;" onclick="if (window.viewer) {{ window.viewer.setAudioMuted(!window.viewer.isAudioMuted()); this.innerText = window.viewer.isAudioMuted() ? '🔇 Audio: Muted' : '🔊 Audio: Active (Web Audio Synthesizer)'; }}">
              🔇 Audio: Muted (Click to Enable Synthesizer)
            </button>
          </div>
        </details>
      </div>

      <!-- 7. Cursor Depth Probe (Collapsed by Default) -->
      <div class="panel-section">
        <details class="panel-section-collapsible">
          <summary class="section-summary">
            <span class="section-title">Cursor Depth Probe</span>
            <span class="section-summary-badge" id="badge-cursor">Hover Map</span>
          </summary>
          <div class="section-body">
            <div class="stat-row"><span>Cursor Coord:</span><span class="stat-val stat-gold" id="stat-cursor-xy">--</span></div>
            <div class="stat-row"><span>Probed Height:</span><span class="stat-val stat-gold" id="stat-cursor-z">--</span></div>
            <div class="stat-row"><span>Delta to Player:</span><span class="stat-val" id="stat-cursor-delta">--</span></div>
            <div class="stat-row"><span>Surface Slope:</span><span class="stat-val" id="stat-cursor-slope">--</span></div>
          </div>
        </details>
      </div>

      <!-- 8. Parallax Strata Stack (Collapsed by Default) -->
      <div class="panel-section">
        <details class="panel-section-collapsible">
          <summary class="section-summary">
            <span class="section-title">Parallax Strata Stack</span>
            <span class="section-summary-badge">4 Layers</span>
          </summary>
          <div class="section-body">
            <div id="strata-list"></div>
            <div class="legend-bar"></div>
          </div>
        </details>
      </div>

      <!-- 9. Ancient Overhang Lore Rule (Collapsed by Default) -->
      <div class="panel-section">
        <details class="panel-section-collapsible">
          <summary class="section-summary">
            <span class="section-title">Ancient Overhang Rule</span>
            <span class="section-summary-badge">&ge; 45°</span>
          </summary>
          <div class="section-body">
            <p style="font-size: 10px; line-height: 1.35; color: #9c8e80;">
              Slopes &ge; 45° represent ancient non-navigable relics. Habitable structures sit on level build plates.
            </p>
          </div>
        </details>
      </div>

      <!-- 10. Pipeline & Activity Logs (Open by Default) -->
      <div class="panel-section">
        <details class="panel-section-collapsible" id="section-logs" open>
          <summary class="section-summary">
            <span class="section-title">Terminal & Ledger Logs</span>
            <span class="section-summary-badge" id="badge-log-count">0 events</span>
          </summary>
          <div class="section-body">
            <div class="log-toolbar">
              <span class="log-status-dot online" id="log-server-status">ComfyUI: Online</span>
              <div style="display: flex; gap: 4px;">
                <button class="log-btn" id="btn-ping-server" onclick="window.viewer && window.viewer.checkComfyServer && window.viewer.checkComfyServer()">Ping</button>
                <button class="log-btn" id="btn-clear-logs" onclick="window.viewer && window.viewer.clearLogs && window.viewer.clearLogs()">Clear</button>
              </div>
            </div>
            <div class="log-terminal" id="log-terminal">
              <!-- Dynamically populated by viewer.log -->
            </div>
          </div>
        </details>
      </div>
    </div>
  </div>

  <script>
{viewer_js_code}

  window.viewer = initViewer({{
    mapWidthM: {tm.width_m},
    mapLengthM: {tm.length_m},
    cols: {tm.cols},
    rows: {tm.rows},
    elev: {json.dumps(elev_data)},
    strata: {strata_json},
    initialPlayerX: {player_x},
    initialPlayerY: {player_y},
    features: {features_json},
  }});
  </script>
</body>
</html>
"""
    out_html_path = Path(out_html_path)
    out_html_path.parent.mkdir(parents=True, exist_ok=True)
    out_html_path.write_text(html, encoding="utf-8")
    return out_html_path


def main() -> int:
    parser = argparse.ArgumentParser(description="Export interactive CSS 3D parallax web preview for outdoor map.")
    parser.add_argument("map", nargs="?", default=str(REPO_ROOT / "library" / "maps" / "border-march.json"), help="Outdoor map declaration JSON")
    parser.add_argument("--out", type=Path, default=REPO_ROOT / "renders" / "maps" / "border-march" / "index.html", help="Output HTML file path")
    args = parser.parse_args()

    out_file = generate_interactive_html(Path(args.map), args.out)
    print(f"Generated standalone 2.5D Parallax Web Preview -> {out_file} ({out_file.stat().st_size / 1024:.1f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
