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

    /* Telemetry HUD Panel */
    .telemetry-panel {{
      width: 320px;
      background: var(--panel);
      border-left: 1px solid #332d27;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-size: 12px;
      z-index: 100;
    }}
    .panel-section {{
      background: #151311;
      border: 1px solid #2d2620;
      border-radius: 6px;
      padding: 12px;
    }}
    .section-title {{
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #b09f8e;
      margin-bottom: 8px;
    }}
    .stat-row {{
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #c4b5a5;
    }}
    .stat-val {{ font-weight: 600; color: #f5eedf; }}
    .stat-accent {{ color: var(--accent); }}
    .stat-gold {{ color: var(--gold); }}

    .legend-bar {{
      height: 10px;
      border-radius: 4px;
      background: linear-gradient(to right, #4a3e34 0%, #a8947f 50%, #f5ecd9 100%);
      margin-top: 6px;
    }}
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
      <div class="panel-section">
        <div class="section-title">Player Perspective Origin</div>
        <div class="stat-row"><span>World Coord:</span><span class="stat-val stat-accent" id="stat-player-xy">{player_x:.1f}m, {player_y:.1f}m</span></div>
        <div class="stat-row"><span>Ground Elevation:</span><span class="stat-val stat-accent" id="stat-player-z">6.00m</span></div>
        <div class="stat-row"><span>Vanishing Point:</span><span class="stat-val" id="stat-vanishing">50%, 50%</span></div>
        <div class="stat-row"><span>Sightline Status:</span><span class="stat-val" style="color: #4ade80;">Active (Clear)</span></div>
      </div>

      <div class="panel-section">
        <div class="section-title">Scene Zone & Interactables</div>
        <div class="stat-row"><span>Current Zone:</span><span class="stat-val stat-accent" id="stat-player-zone">Border Approach (Wilderness)</span></div>
        <div class="stat-row"><span>Nearest Prop:</span><span class="stat-val stat-gold" id="stat-nearest-prop">--</span></div>
      </div>

      <div class="panel-section">
        <div class="section-title">Physicality & Push Strength</div>
        <div class="stat-row"><span>Push Strength:</span><span class="stat-val stat-gold" id="stat-player-strength">60 kg</span></div>
        <div style="display: flex; gap: 4px; margin-top: 8px;">
          <button style="flex: 1; padding: 4px; font-size: 10px; background: #26211c; border: 1px solid #786b59; color: #eed; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(60)">60kg (Norm)</button>
          <button style="flex: 1; padding: 4px; font-size: 10px; background: #26211c; border: 1px solid #786b59; color: #eed; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(160)">160kg (Locker)</button>
          <button style="flex: 1; padding: 4px; font-size: 10px; background: #26211c; border: 1px solid #ca8a04; color: #fde047; border-radius: 3px; cursor: pointer;" onclick="window.viewer && window.viewer.setPlayerStrength(320)">320kg (Cryo)</button>
        </div>
        <div style="margin-top: 6px; font-size: 9.5px; color: #9c8e80; line-height: 1.3;">
          Push objects with mass &le; strength. Fragile borosilicate glass artifacts shatter when impacted into stone walls.
        </div>
      </div>

      <div class="panel-section">
        <div class="section-title">Stagecraft Semantic Blackboard</div>
        <div class="stat-row"><span>Proscenium State:</span><span class="stat-val stat-accent" id="stat-proscenium">wilderness</span></div>
        <div class="stat-row"><span>Anchored Cue Mark:</span><span class="stat-val stat-gold" id="stat-semantic-anchor">None</span></div>
        <div class="stat-row"><span>Camera Vantage:</span><span class="stat-val" id="stat-camera-vantage">macro_exploration</span></div>
        <div class="stat-row"><span>Affordances:</span><span class="stat-val stat-gold" id="stat-affordances">None</span></div>
        <div class="stage-direction-box" id="stat-stage-direction">[STAGE DIRECTION] Move onto stage or click a ★ Cue Mark.</div>
        <button class="btn-cutscene" id="btn-play-cutscene" onclick="window.viewer && window.viewer.playBorderClearanceCutscene && window.viewer.playBorderClearanceCutscene()">
          ▶ Play Cutscene: Border Clearance
        </button>
      </div>

      <div class="panel-section">
        <div class="section-title">Cursor Depth Probe</div>
        <div class="stat-row"><span>Cursor Coord:</span><span class="stat-val stat-gold" id="stat-cursor-xy">--</span></div>
        <div class="stat-row"><span>Probed Height:</span><span class="stat-val stat-gold" id="stat-cursor-z">--</span></div>
        <div class="stat-row"><span>Delta to Player:</span><span class="stat-val" id="stat-cursor-delta">--</span></div>
        <div class="stat-row"><span>Surface Slope:</span><span class="stat-val" id="stat-cursor-slope">--</span></div>
      </div>

      <div class="panel-section">
        <div class="section-title">Parallax Strata Stack</div>
        <div id="strata-list"></div>
        <div class="legend-bar"></div>
      </div>

      <div class="panel-section">
        <div class="section-title">Ancient Overhang Lore Rule</div>
        <p style="font-size: 11px; line-height: 1.4; color: #9c8e80;">
          Slopes &ge; 45° with strict cantilever bounds represent ancient non-navigable relics. Modern habitable structures sit on level build plates.
        </p>
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
