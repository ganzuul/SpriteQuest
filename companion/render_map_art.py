#!/usr/bin/env python3
"""
companion/render_map_art.py

Z-Depth Map Extraction, Stylized Cartography, and Diffusion Map Art Generator.

Provides:
  1. STL & TerrainMesh Z-depth map rasterization (depth_map.png).
  2. Deterministic stylized fantasy cartography rendering (aged parchment,
     biome elevation washes, oblique hillshading, and iso-contour ink lines).
  3. ComfyUI pipeline for MOSS-Image-SFT conditioned on the
     topographic Z-depth map via ReferenceLatent to produce painterly hand-drawn map art.
  4. Automatic integration into outdoor map bundles (renders/maps/<map_id>/).

QWEN.md Compliance:
  - Pure Python standard library + numpy + Pillow (zero external C/pip dependencies).
  - Standalone CLI and importable companion module.
"""

from __future__ import annotations

import argparse
import io
import json
import math
import os
import re
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_models import (
    BudgetError,
    require_budget,
    resolve,
)
from companion.render_sheets import (
    Comfy,
    pick_clip,
    pick_clip_type,
    pick_unet,
    save_workflow_snapshot,
    COMFY_WORKFLOWS_DIR,
)
from companion.terrain_mesh import (
    TAG_ANCIENT_RUIN,
    TAG_BUILD_PLATE,
    TAG_CANYON_GORGE,
    TAG_ROAD_PASS,
    TerrainMesh,
    load_outdoor_map_scene,
)

DEFAULT_COMFY_SERVER = os.environ.get("COMFY_SERVER", "http://127.0.0.1:8080/upstream/comfyui")
COMFY_INPUT_DIR = Path(os.environ.get("COMFY_INPUT", Path.home() / "ComfyUI" / "input"))
MAP_DIFFUSION_SIZE = 768
# Canvas presets trade detail against VRAM on the 8 GiB card these were measured on.
CANVAS_PRESETS = {"safe": 768, "balanced": 896, "max": 1024}
DEFAULT_MAP_PROMPT = (
    "This image is a grayscale height map: white is high mountain, black is low ground. "
    "Redraw it as antique hand-inked fantasy cartography on aged parchment, strictly top-down "
    "orthographic plan view, no horizon, no perspective, ink hachures on slopes, soft watercolor wash, "
    "no text, no border. Keep every landform exactly where it is: a long north-south mountain ridge "
    "along the east side with a narrow pass running down its spine, a flat rectangular plateau in "
    "the centre-west where a small customs house stands, two small square ruined stone bastions "
    "at the north-west and south-west, flat grassy lowland everywhere else."
)

NEGATIVE_PROMPT = ""


def render_stylized_cartography(
    tm: TerrainMesh,
    width: int = 1024,
    height: int = 1024,
    contour_step_m: float = 2.0,
    map_data: dict | None = None,
) -> Image.Image:
    """
    Deterministic artistic cartography renderer for outdoor terrain primitives.
    Produces a vintage hand-drawn fantasy map on aged vellum parchment with:
      - Multi-band elevation biome tinting (lowland silt, sandstone plateau, scree, relic basalt)
      - Oblique NW hillshading
      - Directional slope hachuring along the fall-line on steep ascents
      - Intermediate (2m) & index (10m) sepia iso-contour ink lines
      - Dressed-stone foundation retaining walls and floorplan wall footprints for build plates
      - Stepped cyclopean masonry terraces for ancient 45° overhang ruins
      - Twin wagon wheel ruts and trail stippling for ridge passes
      - Sunken alluvial washes and riparian flow lines for canyon gorges
      - Cartographic symbols for placed props (signposts, braziers, cargo crates)
      - Authentic map furniture: Compass Rose (North needle), metric scale bar, summit spot heights, and neatline frame.
    """
    def world_to_px(x_m: float, y_m: float) -> tuple[int, int]:
        px = int((x_m / tm.width_m) * (width - 1))
        py = int((y_m / tm.length_m) * (height - 1))
        return max(0, min(width - 1, px)), max(0, min(height - 1, py))

    # 1. Base Elevation & Oblique Hillshading
    normals = tm.compute_surface_normals()
    slopes = tm.compute_slope_degrees()

    light = np.array([-0.55, -0.55, 0.62], dtype=np.float32)
    light /= np.linalg.norm(light)
    lam = np.clip((normals * light[None, None, :]).sum(axis=2), 0.0, 1.0)

    z_min = float(tm.heights.min())
    z_max = float(tm.heights.max())
    elev_norm = np.clip((tm.heights - z_min) / max(z_max - z_min, 1e-5), 0.0, 1.0)

    # Resize matrices to output resolution
    lam_hi = np.asarray(Image.fromarray(lam.astype(np.float32)).resize((width, height), Image.Resampling.BICUBIC))
    elev_hi = np.asarray(Image.fromarray(elev_norm.astype(np.float32)).resize((width, height), Image.Resampling.BICUBIC))
    h_hi = np.asarray(Image.fromarray(tm.heights.astype(np.float32)).resize((width, height), Image.Resampling.BICUBIC))
    tags_hi = np.asarray(Image.fromarray(tm.tags).resize((width, height), Image.Resampling.NEAREST))

    gy_hi, gx_hi = np.gradient(h_hi, tm.length_m / height)
    grad_mag_hi = np.hypot(gx_hi, gy_hi)
    slope_deg_hi = np.degrees(np.arctan(grad_mag_hi))

    # Shading coefficient
    shade = 0.38 + 0.44 * lam_hi + 0.18 * elev_hi

    # Biome wash palette
    r = np.zeros((height, width), dtype=np.float32)
    g = np.zeros((height, width), dtype=np.float32)
    b = np.zeros((height, width), dtype=np.float32)

    m_low = elev_hi < 0.22
    m_plat = (elev_hi >= 0.22) & (elev_hi < 0.52)
    m_scree = (elev_hi >= 0.52) & (elev_hi < 0.82)
    m_peak = elev_hi >= 0.82

    # Lowlands: warm olive-silt parchment
    r[m_low] = shade[m_low] * 218.0
    g[m_low] = shade[m_low] * 210.0
    b[m_low] = shade[m_low] * 182.0

    # Plateau: rich golden ochre
    r[m_plat] = shade[m_plat] * 236.0
    g[m_plat] = shade[m_plat] * 222.0
    b[m_plat] = shade[m_plat] * 190.0

    # Scree / high passes: slate limestone
    r[m_scree] = shade[m_scree] * 206.0
    g[m_scree] = shade[m_scree] * 200.0
    b[m_scree] = shade[m_scree] * 186.0

    # Ancient relic peaks: weathered dark basalt
    r[m_peak] = shade[m_peak] * 172.0
    g[m_peak] = shade[m_peak] * 164.0
    b[m_peak] = shade[m_peak] * 156.0

    # 2. Slope Hachuring (Directional Fall-Line Strokes)
    fall_angle = np.arctan2(gy_hi, gx_hi)
    y_coords, x_coords = np.mgrid[0:height, 0:width]
    wavelength = 7.0
    contour_proj = -x_coords * np.sin(fall_angle) + y_coords * np.cos(fall_angle)
    hachure_pattern = np.cos(2.0 * np.pi * contour_proj / wavelength)

    hachure_active = (slope_deg_hi >= 30.0) & (slope_deg_hi < 65.0)
    thresh = 0.82 - 0.45 * np.clip((slope_deg_hi - 30.0) / 30.0, 0.0, 1.0)
    hachure_mask = hachure_active & (hachure_pattern > thresh)

    r[hachure_mask] *= 0.72
    g[hachure_mask] *= 0.68
    b[hachure_mask] *= 0.62

    # Darken steep cliff scarps (slope >= 48 deg)
    cliff_mask = slope_deg_hi >= 48.0
    r[cliff_mask] *= 0.60
    g[cliff_mask] *= 0.58
    b[cliff_mask] *= 0.54

    # 3. Iso-contour lines in bistre ink (intermediate 2m, index 10m)
    cont_2m = np.fmod(h_hi, contour_step_m)
    gy_c, gx_c = np.gradient(cont_2m)
    contour_mask_2m = np.hypot(gx_c, gy_c) > (contour_step_m * 0.42)

    cont_10m = np.fmod(h_hi, max(contour_step_m * 4.0, 10.0))
    gy_10, gx_10 = np.gradient(cont_10m)
    contour_mask_10m = np.hypot(gx_10, gy_10) > (max(contour_step_m * 4.0, 10.0) * 0.42)

    # Intermediate contours (fine sepia)
    r[contour_mask_2m] = 58
    g[contour_mask_2m] = 48
    b[contour_mask_2m] = 38

    # Index contours (heavier dark bistre)
    r[contour_mask_10m] = 32
    g[contour_mask_10m] = 24
    b[contour_mask_10m] = 18

    # 4. Primitive Semantic Tag Shading
    # Build Plate Foundation (tag 1)
    build_mask = (tags_hi & TAG_BUILD_PLATE) != 0
    if np.any(build_mask):
        r[build_mask] = np.clip(r[build_mask] * 1.06, 0, 255)
        g[build_mask] = np.clip(g[build_mask] * 1.04, 0, 255)
        b[build_mask] = np.clip(b[build_mask] * 0.98, 0, 255)

    # Ancient Ruin Buttresses (tag 2)
    ruin_mask = (tags_hi & TAG_ANCIENT_RUIN) != 0
    if np.any(ruin_mask):
        r[ruin_mask] = np.clip(r[ruin_mask] * 0.88, 0, 255)
        g[ruin_mask] = np.clip(g[ruin_mask] * 0.94, 0, 255)  # verdigris lichen tint
        b[ruin_mask] = np.clip(b[ruin_mask] * 0.88, 0, 255)

    # Ridge Pass Road / Trail (tag 4)
    road_mask = (tags_hi & TAG_ROAD_PASS) != 0
    if np.any(road_mask):
        r[road_mask] = np.clip(r[road_mask] * 1.14, 0, 255)
        g[road_mask] = np.clip(g[road_mask] * 1.10, 0, 255)
        b[road_mask] = np.clip(b[road_mask] * 0.94, 0, 255)

    # Canyon / Gorge Riverbed (tag 8)
    gorge_mask = (tags_hi & TAG_CANYON_GORGE) != 0
    if np.any(gorge_mask):
        r[gorge_mask] = np.clip(r[gorge_mask] * 0.82, 0, 255)
        g[gorge_mask] = np.clip(g[gorge_mask] * 0.96, 0, 255)  # alluvial turquoise silt
        b[gorge_mask] = np.clip(b[gorge_mask] * 0.98, 0, 255)

    rgb = np.stack([
        np.clip(r, 0, 255),
        np.clip(g, 0, 255),
        np.clip(b, 0, 255),
    ], axis=-1).astype(np.uint8)

    canvas = Image.fromarray(rgb, mode="RGB")
    draw = ImageDraw.Draw(canvas, "RGBA")

    # 5. Vector Overlays: Architectural Elements, Primitive Details & Props
    if map_data:
        # A. Build Plate Retaining Stone Walls & Floorplan Footprints
        for plate in map_data.get("build_plates", []):
            anchor = plate.get("anchor", {})
            footprint = plate.get("footprint", {})
            cx, cy = anchor.get("center_x", 0.0), anchor.get("center_y", 0.0)
            w_m, l_m = footprint.get("width", 30.0), footprint.get("length", 30.0)

            x0, y0 = cx - w_m / 2.0, cy - l_m / 2.0
            x1, y1 = cx + w_m / 2.0, cy + l_m / 2.0
            p0 = world_to_px(x0, y0)
            p1 = world_to_px(x1, y1)

            # Dressed-stone foundation retaining wall
            draw.rectangle([p0, p1], outline=(54, 44, 32, 220), width=3)
            draw.rectangle([p0[0] + 3, p0[1] + 3, p1[0] - 3, p1[1] - 3], outline=(90, 78, 62, 140), width=1)

            # Floorplan interior layout
            fp_path = REPO_ROOT / plate.get("scene_floorplan", "")
            if fp_path.is_file():
                try:
                    fp_data = json.loads(fp_path.read_text(encoding="utf-8"))
                    for zone in fp_data.get("zones", []):
                        zb = zone.get("bounds", {})
                        zx0 = cx + zb.get("x_min", 0.0)
                        zx1 = cx + zb.get("x_max", 0.0)
                        zy0 = cy + (zb.get("z_min", 0.0) - 30.0)
                        zy1 = cy + (zb.get("z_max", 0.0) - 30.0)
                        zp0 = world_to_px(zx0, zy0)
                        zp1 = world_to_px(zx1, zy1)
                        draw.rectangle([zp0, zp1], outline=(42, 34, 26, 180), width=2)
                        draw.rectangle([zp0[0] + 2, zp0[1] + 2, zp1[0] - 2, zp1[1] - 2], fill=(210, 198, 175, 45))
                except Exception:
                    pass

        # B. Primitive Inking (Pass tracks, ancient ruin terraces, gorge beds)
        for prim in map_data.get("primitives", []):
            ptype = prim.get("type")
            if ptype == "ridge_pass":
                sx, sy = prim["start"]
                ex, ey = prim["end"]
                dx = ex - sx
                dy = ey - sy
                dist = math.hypot(dx, dy)
                if dist > 1e-5:
                    ux, uy = dx / dist, dy / dist
                    nx, ny = -uy, ux
                    gauge_m = 1.6  # Standard wagon wheel gauge
                    t1_s = world_to_px(sx - nx * (gauge_m / 2.0), sy - ny * (gauge_m / 2.0))
                    t1_e = world_to_px(ex - nx * (gauge_m / 2.0), ey - ny * (gauge_m / 2.0))
                    t2_s = world_to_px(sx + nx * (gauge_m / 2.0), sy + ny * (gauge_m / 2.0))
                    t2_e = world_to_px(ex + nx * (gauge_m / 2.0), ey + ny * (gauge_m / 2.0))
                    draw.line([t1_s, t1_e], fill=(110, 95, 78, 200), width=2)
                    draw.line([t2_s, t2_e], fill=(110, 95, 78, 200), width=2)

            elif ptype == "ancient_ruin_buttress":
                c = prim["center"]
                bw = prim.get("base_width", 20.0)
                bl = prim.get("base_length", 20.0)
                steps = 4
                for s in range(steps):
                    frac = 1.0 - (s / steps) * 0.7
                    w_s = bw * frac
                    l_s = bl * frac
                    rp0 = world_to_px(c[0] - w_s / 2.0, c[1] - l_s / 2.0)
                    rp1 = world_to_px(c[0] + w_s / 2.0, c[1] + l_s / 2.0)
                    draw.rectangle([rp0, rp1], outline=(38, 30, 24, 210), width=2)

            elif ptype == "canyon_gorge":
                sx, sy = prim["start"]
                ex, ey = prim["end"]
                sp = world_to_px(sx, sy)
                ep = world_to_px(ex, ey)
                # Stream flow center line
                draw.line([sp, ep], fill=(70, 110, 120, 220), width=2)

        # C. Placed Map Props (Signpost, Brazier, Cargo Crates)
        for prop in map_data.get("props", []):
            ptype = prop.get("type")
            px_m, py_m = prop["at"]
            pp = world_to_px(px_m, py_m)
            if ptype == "signpost":
                draw.line([(pp[0] - 6, pp[1]), (pp[0] + 6, pp[1])], fill=(80, 50, 25, 255), width=3)
                draw.line([(pp[0], pp[1] - 6), (pp[0], pp[1] + 6)], fill=(80, 50, 25, 255), width=3)
                draw.ellipse([(pp[0] - 3, pp[1] - 3), (pp[0] + 3, pp[1] + 3)], fill=(220, 200, 160, 255), outline=(60, 40, 20, 255))
            elif ptype == "brazier":
                draw.ellipse([(pp[0] - 8, pp[1] - 8), (pp[0] + 8, pp[1] + 8)], fill=(230, 120, 40, 70))
                draw.ellipse([(pp[0] - 4, pp[1] - 4), (pp[0] + 4, pp[1] + 4)], fill=(245, 160, 30, 255), outline=(40, 30, 25, 255), width=2)
            elif ptype == "cargo_crates":
                draw.rectangle([(pp[0] - 6, pp[1] - 6), (pp[0] + 6, pp[1] + 6)], fill=(150, 120, 85, 230), outline=(50, 35, 20, 255), width=2)
                draw.line([(pp[0] - 6, pp[1] - 6), (pp[0] + 6, pp[1] + 6)], fill=(50, 35, 20, 200), width=1)
                draw.line([(pp[0] + 6, pp[1] - 6), (pp[0] - 6, pp[1] + 6)], fill=(50, 35, 20, 200), width=1)
            else:
                draw.ellipse([(pp[0] - 4, pp[1] - 4), (pp[0] + 4, pp[1] + 4)], fill=(180, 60, 40, 230), outline=(40, 20, 20, 255))

    # 6. Cartographic Furnishings & Margin Elements
    # A. Double Neatline Border
    border_margin = 18
    draw.rectangle([(border_margin, border_margin), (width - border_margin, height - border_margin)], outline=(42, 34, 26, 240), width=3)
    draw.rectangle([(border_margin + 4, border_margin + 4), (width - border_margin - 4, height - border_margin - 4)], outline=(72, 60, 48, 160), width=1)

    # B. Compass Rose in North-East Margin
    cr_x, cr_y = width - 75, 75
    cr_r = 28
    draw.ellipse([(cr_x - cr_r, cr_y - cr_r), (cr_x + cr_r, cr_y + cr_r)], outline=(60, 48, 36, 180), width=1)
    draw.polygon([(cr_x, cr_y - cr_r - 6), (cr_x - 7, cr_y), (cr_x, cr_y - 4)], fill=(42, 32, 24, 255))
    draw.polygon([(cr_x, cr_y - cr_r - 6), (cr_x + 7, cr_y), (cr_x, cr_y - 4)], fill=(190, 175, 150, 255), outline=(42, 32, 24, 255))
    draw.polygon([(cr_x, cr_y + cr_r + 4), (cr_x - 6, cr_y), (cr_x, cr_y + 3)], fill=(170, 155, 130, 255), outline=(42, 32, 24, 255))
    draw.polygon([(cr_x, cr_y + cr_r + 4), (cr_x + 6, cr_y), (cr_x, cr_y + 3)], fill=(42, 32, 24, 255))
    draw.polygon([(cr_x + cr_r + 4, cr_y), (cr_x, cr_y - 6), (cr_x + 3, cr_y)], fill=(42, 32, 24, 255))
    draw.polygon([(cr_x - cr_r - 4, cr_y), (cr_x, cr_y - 6), (cr_x - 3, cr_y)], fill=(170, 155, 130, 255), outline=(42, 32, 24, 255))
    draw.text((cr_x - 4, cr_y - cr_r - 18), "N", fill=(32, 24, 18, 255))

    # C. Metric Scale Bar (e.g. 50m bar)
    sb_x = 35
    sb_y = height - 35
    px_per_m = width / tm.width_m
    bar_len_50m = int(50.0 * px_per_m)
    bar_len_25m = int(25.0 * px_per_m)
    bar_h = 6

    draw.rectangle([(sb_x, sb_y), (sb_x + bar_len_25m, sb_y + bar_h)], fill=(42, 34, 26, 255), outline=(42, 34, 26, 255))
    draw.rectangle([(sb_x + bar_len_25m, sb_y), (sb_x + bar_len_50m, sb_y + bar_h)], fill=(240, 232, 215, 255), outline=(42, 34, 26, 255), width=1)
    draw.text((sb_x - 2, sb_y - 12), "0", fill=(32, 24, 18, 255))
    draw.text((sb_x + bar_len_25m - 6, sb_y - 12), "25m", fill=(32, 24, 18, 255))
    draw.text((sb_x + bar_len_50m - 8, sb_y - 12), "50m", fill=(32, 24, 18, 255))

    # D. Spot Elevation Peak Markers
    if z_max > z_min + 5.0:
        # Find peak location
        peak_idx = np.unravel_index(np.argmax(tm.heights), tm.heights.shape)
        peak_wx, peak_wy = tm.grid_to_world(int(peak_idx[1]), int(peak_idx[0]))
        ppk = world_to_px(peak_wx, peak_wy)
        draw.polygon([(ppk[0], ppk[1] - 5), (ppk[0] - 4, ppk[1] + 3), (ppk[0] + 4, ppk[1] + 3)], fill=(42, 32, 24, 255))
        draw.text((ppk[0] + 6, ppk[1] - 6), f"▲ {z_max:.1f}m", fill=(32, 24, 18, 255))

    return canvas


def build_map_art_workflow(
    depth_image_name: str,
    prompt_text: str = DEFAULT_MAP_PROMPT,
    negative_text: str = NEGATIVE_PROMPT,
    width: int = MAP_DIFFUSION_SIZE,
    height: int = MAP_DIFFUSION_SIZE,
    seed: int = 7777,
    steps: int = 25,
    cfg: float = 3.0,
    denoise: float = 1.0,
    prefix: str = "map_art/border_march",
    snapshot_name: str | Path | None = None,
    unet_name: str | None = None,
    clip_name: str | None = None,
    vae_name: str | None = None,
    clip_device: str = "cpu",
) -> dict:
    """
    Construct the ComfyUI API graph conditioning MOSS-Image-SFT
    on the Z-depth map using ReferenceLatent and a fresh latent canvas.
    """
    unet_name = unet_name or pick_unet()
    clip_name = clip_name or pick_clip()
    vae_name = vae_name or pick_vae()
    clip_type = pick_clip_type(clip_name, unet_name)
    if unet_name.endswith(".gguf"):
        unet_node = {
            "class_type": "UnetLoaderGGUF",
            "inputs": {"unet_name": unet_name},
        }
    else:
        unet_node = {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": unet_name, "weight_dtype": "default"},
        }

    if clip_name.endswith(".gguf"):
        # CLIPLoaderGGUF has no device input: it always builds on the offload
        # device with GGMLOps, which is the CPU placement this small GPU needs.
        clip_node = {
            "class_type": "CLIPLoaderGGUF",
            "inputs": {"clip_name": clip_name, "type": clip_type},
        }
    else:
        clip_node = {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": clip_name,
                "type": clip_type,
                "device": clip_device,
            },
        }

    workflow = {
        "1": unet_node,
        "2": clip_node,
        "3": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": vae_name},
        },
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["2", 0], "text": prompt_text},
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {"clip": ["2", 0], "text": negative_text},
        },
        "6": {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1},
        },
        "10": {
            "class_type": "LoadImage",
            "inputs": {"image": depth_image_name},
        },
        "11": {
            "class_type": "VAEEncode",
            "inputs": {"pixels": ["10", 0], "vae": ["3", 0]},
        },
        "12": {
            "class_type": "ReferenceLatent",
            "inputs": {"conditioning": ["4", 0], "latent": ["11", 0]},
        },
        "13": {
            "class_type": "ReferenceLatent",
            "inputs": {"conditioning": ["5", 0], "latent": ["11", 0]},
        },
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["12", 0],
                "negative": ["13", 0],
                "latent_image": ["6", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": denoise,
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["7", 0], "vae": ["3", 0]},
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {"images": ["8", 0], "filename_prefix": prefix},
        },
    }
    if snapshot_name is not None:
        save_workflow_snapshot(workflow, snapshot_name)
    return workflow


def build_map_layout_prompt(
    map_data: dict,
    width: int = MAP_DIFFUSION_SIZE,
    height: int = MAP_DIFFUSION_SIZE,
) -> dict:
    """Build a documented MOSS Layout draft from one map's geographic feature data."""
    scale = map_data.get("scale", {})
    dimensions = scale.get("dimensions", {})
    map_width = float(dimensions.get("width", 100.0))
    map_length = float(dimensions.get("length", 100.0))
    if map_width <= 0 or map_length <= 0:
        raise ValueError(f"Map dimensions must be positive, got {map_width} x {map_length}")
    if width <= 0 or height <= 0 or width % 16 or height % 16:
        raise ValueError("MOSS Layout canvas dimensions must be positive multiples of 16")

    margin = min(width, height) * 0.08
    px_per_m = min((width - 2 * margin) / map_width, (height - 2 * margin) / map_length)
    map_px_width = map_width * px_per_m
    map_px_height = map_length * px_per_m
    offset_x = (width - map_px_width) / 2
    offset_y = (height - map_px_height) / 2

    def project_box(bounds: tuple[float, float, float, float]) -> list[float]:
        x0, y0, x1, y1 = bounds
        x0 = max(0.0, min(map_width, x0))
        x1 = max(0.0, min(map_width, x1))
        y0 = max(0.0, min(map_length, y0))
        y1 = max(0.0, min(map_length, y1))
        if x1 <= x0:
            x0, x1 = max(0.0, x0 - 0.5), min(map_width, x1 + 0.5)
        if y1 <= y0:
            y0, y1 = max(0.0, y0 - 0.5), min(map_length, y1 + 0.5)
        return [
            round(offset_x + x0 * px_per_m, 2),
            round(offset_y + y0 * px_per_m, 2),
            round(offset_x + x1 * px_per_m, 2),
            round(offset_y + y1 * px_per_m, 2),
        ]

    items = []
    for plate in map_data.get("build_plates", []):
        anchor = plate.get("anchor", {})
        footprint = plate.get("footprint", {})
        center_x = float(anchor.get("center_x", 0.0))
        center_y = float(anchor.get("center_y", 0.0))
        plate_width = float(footprint.get("width", 4.0))
        plate_length = float(footprint.get("length", 4.0))
        items.append({
            "label": "object",
            "caption": f"Level architectural build plate for {plate.get('name', plate.get('id', 'a settlement'))}.",
            "bbox": project_box((
                center_x - plate_width / 2,
                center_y - plate_length / 2,
                center_x + plate_width / 2,
                center_y + plate_length / 2,
            )),
        })

    for primitive in map_data.get("primitives", []):
        primitive_type = primitive.get("type", "terrain feature")
        feature_name = primitive.get("name") or primitive.get("id", primitive_type.replace("_", " "))
        if primitive_type == "ridge_pass":
            start, end = primitive["start"], primitive["end"]
            margin_m = float(primitive.get("ridge_flank_width", 0.0)) + float(primitive.get("pass_width", 0.0)) / 2
            bounds = (
                min(float(start[0]), float(end[0])) - margin_m,
                min(float(start[1]), float(end[1])) - margin_m,
                max(float(start[0]), float(end[0])) + margin_m,
                max(float(start[1]), float(end[1])) + margin_m,
            )
            caption = f"An elongated mountain ridge and traversable saddle pass, {feature_name}."
        elif primitive_type == "ancient_ruin_buttress":
            center = primitive["center"]
            half_width = float(primitive.get("base_width", 4.0)) / 2
            half_length = float(primitive.get("base_length", 4.0)) / 2
            bounds = (
                float(center[0]) - half_width,
                float(center[1]) - half_length,
                float(center[0]) + half_width,
                float(center[1]) + half_length,
            )
            caption = f"Stepped ancient stone ruin and steep buttress, {feature_name}."
        elif primitive_type == "canyon_gorge":
            start, end = primitive["start"], primitive["end"]
            half_width = float(primitive.get("bed_width", 2.0)) / 2 + float(primitive.get("wall_slope_width", 0.0))
            bounds = (
                min(float(start[0]), float(end[0])) - half_width,
                min(float(start[1]), float(end[1])) - half_width,
                max(float(start[0]), float(end[0])) + half_width,
                max(float(start[1]), float(end[1])) + half_width,
            )
            caption = f"A narrow sunken canyon gorge with sloped sides, {feature_name}."
        elif primitive_type == "hill":
            center = primitive["center"]
            radius = float(primitive.get("radius", 5.0))
            bounds = (
                float(center[0]) - radius,
                float(center[1]) - radius,
                float(center[0]) + radius,
                float(center[1]) + radius,
            )
            caption = f"A rounded raised hill, {feature_name}."
        else:
            continue
        items.append({"label": "object", "caption": caption, "bbox": project_box(bounds)})

    for prop in map_data.get("props", []):
        at = prop.get("at", [map_width / 2, map_length / 2])
        x, y = float(at[0]), float(at[1])
        radius = max(1.0, float(prop.get("scale", 1.0)) * 1.5)
        items.append({
            "label": "object",
            "caption": f"Small top-down map symbol for {prop.get('label', prop.get('id', 'a landmark'))}.",
            "bbox": project_box((x - radius, y - radius, x + radius, y + radius)),
        })

    if not items:
        raise ValueError("Map contains no build plates, terrain primitives, or props to lay out")

    map_name = map_data.get("name", map_data.get("id", "the surveyed region"))
    return {
        "width": width,
        "height": height,
        "bbox_coord_space": "abs",
        "bbox_format": "xyxy",
        "summary": {
            "meta": ["top-down fantasy cartography", "MOSS structured layout"],
            "canvas": "single",
            "caption": (
                f"Antique hand-inked regional terrain chart of {map_name}, strictly top-down "
                "orthographic, warm vellum, restrained watercolor elevation washes, fine "
                "hachures and contour marks. Preserve the relative placement and scale of "
                "the surveyed landforms. No lettering, labels, legend, frame, or route strokes; "
                "these will be added from the atlas record after illustration."
            ),
        },
        "items": items,
    }


def compile_moss_layout_prompt(layout: dict) -> str:
    """Convert an editable pixel Layout draft to MOSS's centered yxyx prompt format."""
    width = layout.get("width")
    height = layout.get("height")
    if type(width) is not int or type(height) is not int or width <= 0 or height <= 0 or width % 16 or height % 16:
        raise ValueError("MOSS Layout width and height must be positive multiples of 16")
    if layout.get("bbox_coord_space") != "abs" or layout.get("bbox_format") != "xyxy":
        raise ValueError("Editable MOSS Layout drafts must use abs / xyxy coordinates")
    summary = layout.get("summary")
    items = layout.get("items")
    if not isinstance(summary, dict) or not isinstance(items, list) or not items:
        raise ValueError("MOSS Layout draft requires a summary object and nonempty items")

    compiled_items = []
    for index, item in enumerate(items):
        box = item.get("bbox") if isinstance(item, dict) else None
        if not isinstance(box, list) or len(box) != 4 or any(type(value) not in (int, float) or not math.isfinite(value) for value in box):
            raise ValueError(f"Layout item {index} bbox must contain four finite pixel coordinates")
        x0, y0, x1, y1 = box
        if not (0 <= x0 < x1 <= width and 0 <= y0 < y1 <= height):
            raise ValueError(f"Layout item {index} bbox exceeds the {width}x{height} canvas")
        centered_yxyx = [
            math.floor(y0) - height // 2,
            math.floor(x0) - width // 2,
            math.ceil(y1) - height // 2,
            math.ceil(x1) - width // 2,
        ]
        compiled_items.append({**item, "bbox": centered_yxyx})

    compiled = {
        "summary": summary,
        "items": compiled_items,
        "bbox_coord_space": "abs_centralized",
        "bbox_format": "yxyx",
    }
    return json.dumps(compiled, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def export_map_layout_workflow(
    map_id_or_path: str | Path = "border-march",
    workflow_path: str | Path | None = None,
    comfy_input_dir: str | Path = COMFY_INPUT_DIR,
    layout_draft_path: str | Path | None = None,
    width: int = MAP_DIFFUSION_SIZE,
    height: int = MAP_DIFFUSION_SIZE,
    seed: int = 7777,
    steps: int = 25,
    cfg: float = 3.0,
    denoise: float = 0.72,
    unet_name: str | None = None,
    clip_name: str | None = None,
    vae_name: str | None = None,
    server: str = DEFAULT_COMFY_SERVER,
) -> dict:
    """Export a ComfyUI API workflow and its deterministic reference/layout inputs."""
    map_path = Path(map_id_or_path)
    if not map_path.is_file():
        map_path = REPO_ROOT / "library" / "maps" / f"{map_id_or_path}.json"
    if not map_path.is_file():
        raise FileNotFoundError(f"Map declaration not found: {map_id_or_path}")

    terrain, map_data = load_outdoor_map_scene(map_path)
    map_id = str(map_data.get("id", map_path.stem))
    safe_map_id = re.sub(r"[^a-zA-Z0-9_-]+", "_", map_id)
    unet_name = unet_name or resolve("moss_unet", server)
    if "moss" not in unet_name.lower():
        raise ValueError(f"Cartography layout export requires a MOSS diffusion model, got {unet_name!r}")
    clip_name = clip_name or resolve("moss_clip", server)
    vae_name = vae_name or resolve("moss_vae", server)
    input_dir = Path(comfy_input_dir)
    input_dir.mkdir(parents=True, exist_ok=True)
    reference_name = f"spritequest_{safe_map_id}_witness.png"
    reference_path = input_dir / reference_name
    reference_image = terrain.render_topdown_relief(contour_step_m=2.0)
    reference_image = reference_image.resize((width, height), Image.Resampling.LANCZOS)
    reference_image.save(reference_path, format="PNG")
    if not reference_path.is_file():
        raise RuntimeError(f"Failed to write ComfyUI witness image: {reference_path}")

    if workflow_path is None:
        workflow_path = COMFY_WORKFLOWS_DIR / f"cartography_{safe_map_id}_layout.json"
    workflow_path = Path(workflow_path)
    if layout_draft_path is None:
        layout_stem = workflow_path.stem.removesuffix("_layout")
        layout_path = workflow_path.with_name(f"{layout_stem}_layout_draft.json")
    else:
        layout_path = Path(layout_draft_path)

    if layout_path.is_file():
        layout = json.loads(layout_path.read_text(encoding="utf-8"))
        if layout.get("width") != width or layout.get("height") != height:
            raise ValueError(
                f"Existing layout draft is {layout.get('width')}x{layout.get('height')}, "
                f"but the export canvas is {width}x{height}"
            )
    else:
        layout = build_map_layout_prompt(map_data, width=width, height=height)
        layout_path.parent.mkdir(parents=True, exist_ok=True)
        layout_path.write_text(json.dumps(layout, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    layout_text = compile_moss_layout_prompt(layout)
    workflow = build_map_art_workflow(
        depth_image_name=reference_name,
        prompt_text=layout_text,
        width=width,
        height=height,
        seed=seed,
        steps=steps,
        cfg=cfg,
        denoise=denoise,
        prefix=f"spritequest/cartography/{safe_map_id}",
        snapshot_name=workflow_path,
        unet_name=unet_name,
        clip_name=clip_name,
        vae_name=vae_name,
    )
    return {
        "map_id": map_id,
        "workflow_path": str(workflow_path),
        "layout_path": str(layout_path),
        "reference_image": str(reference_path),
        "reference_name": reference_name,
        "node_count": len(workflow),
    }


def render_map_bundle_art(
    map_id_or_path: str | Path,
    out_dir: Path | None = None,
    comfy_server: str = DEFAULT_COMFY_SERVER,
    force_stylized: bool = False,
    prompt: str = DEFAULT_MAP_PROMPT,
    seed: int = 7777,
    steps: int = 25,
    ignore_budget: bool = False,
) -> dict:
    """
    End-to-end pipeline:
      1. Resolves map JSON declaration and STL mesh.
      2. Generates depth_map.png (rasterized directly from STL if present, else TerrainMesh).
      3. Renders map_art.png via ComfyUI (MOSS-Image-SFT) or fallback stylized cartography.
      4. Saves all assets into out_dir (defaults to renders/maps/<map_id>/).
    """
    map_p = Path(map_id_or_path)
    if not map_p.is_file():
        candidate = REPO_ROOT / "library" / "maps" / f"{map_id_or_path}.json"
        if candidate.is_file():
            map_p = candidate
        else:
            raise FileNotFoundError(f"Map declaration not found: {map_id_or_path}")

    tm, map_data = load_outdoor_map_scene(map_p)
    map_id = str(map_data.get("id", map_p.stem))

    if out_dir is None:
        out_dir = REPO_ROOT / "renders" / "maps" / map_id
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    stl_path = out_dir / f"{map_id}.stl"
    depth_path = out_dir / "depth_map.png"
    art_path = out_dir / "map_art.png"
    relief_path = out_dir / "topdown_relief.png"

    # 1. Z-depth map from the elevation heightfield (offline, no rasterizer)
    tm.render_z_depth_map(width=1024, height=1024).save(depth_path, format="PNG")

    # 2. Also save topdown relief if missing
    if not relief_path.is_file():
        relief_img = tm.render_topdown_relief(contour_step_m=2.0)
        relief_img.save(relief_path, format="PNG")

    # 3. Generate map art
    rendered_via = "stylized_fallback"
    if not force_stylized:
        try:
            comfy = Comfy(comfy_server, timeout=300)
            if comfy.alive():
                unet_name = resolve("moss_unet", comfy_server)
                clip_name = resolve("moss_clip", comfy_server)
                vae_name = resolve("moss_vae", comfy_server)
                if not ignore_budget:
                    require_budget(
                        clip_name,
                        MAP_DIFFUSION_SIZE,
                        MAP_DIFFUSION_SIZE,
                        comfy_server,
                        role="moss_clip",
                    )
                COMFY_INPUT_DIR.mkdir(parents=True, exist_ok=True)
                input_name = f"sq_map_depth_{map_id}.png"
                with Image.open(depth_path) as depth_image:
                    depth_image.resize(
                        (MAP_DIFFUSION_SIZE, MAP_DIFFUSION_SIZE),
                        Image.Resampling.LANCZOS,
                    ).save(COMFY_INPUT_DIR / input_name, format="PNG")

                wf = build_map_art_workflow(
                    depth_image_name=input_name,
                    prompt_text=prompt,
                    width=MAP_DIFFUSION_SIZE,
                    height=MAP_DIFFUSION_SIZE,
                    seed=seed,
                    steps=steps,
                    prefix=f"map_art/{map_id}",
                    snapshot_name=f"map_{map_id}.json",
                    unet_name=unet_name,
                    clip_name=clip_name,
                    vae_name=vae_name,
                )
                img_bytes = comfy.run(wf)
                with Image.open(io.BytesIO(img_bytes)) as generated:
                    generated.resize((1024, 1024), Image.Resampling.LANCZOS).save(art_path, format="PNG")
                rendered_via = "moss_image_sft"
        except BudgetError as exc:
            print(f"ComfyUI generation refused ({exc}); using stylized cartography fallback", file=sys.stderr)
        except Exception as exc:
            print(f"ComfyUI generation notice ({exc}), using stylized cartography fallback", file=sys.stderr)

    if rendered_via == "stylized_fallback" or not art_path.is_file():
        art_img = render_stylized_cartography(tm, width=1024, height=1024, map_data=map_data)
        art_img.save(art_path, format="PNG")

    return {
        "map_id": map_id,
        "depth_path": str(depth_path),
        "art_path": str(art_path),
        "relief_path": str(relief_path),
        "rendered_via": rendered_via,
    }


def main():
    parser = argparse.ArgumentParser(description="Render Z-depth map and cartographic map art for outdoor maps.")
    parser.add_argument("map", nargs="?", default="border-march", help="Map ID or path (default: border-march)")
    parser.add_argument("--server", default=DEFAULT_COMFY_SERVER, help=f"ComfyUI server URL (default: {DEFAULT_COMFY_SERVER})")
    parser.add_argument("--stylized-only", action="store_true", help="Force deterministic stylized cartography without diffusion")
    parser.add_argument(
        "--export-workflow",
        action="store_true",
        help="Export a MOSS Layout ComfyUI API workflow and witness image without contacting ComfyUI",
    )
    parser.add_argument(
        "--workflow-out",
        help="Workflow JSON path (default: workflows/comfyui/cartography_<map-id>_layout.json)",
    )
    parser.add_argument(
        "--layout-draft",
        help="Editable top-left xyxy MOSS Layout draft; an existing draft is preserved and compiled",
    )
    parser.add_argument(
        "--comfy-input",
        default=str(COMFY_INPUT_DIR),
        help=f"ComfyUI input directory for the witness image (default: {COMFY_INPUT_DIR})",
    )
    parser.add_argument("--prompt", default=DEFAULT_MAP_PROMPT, help="Prompt text for diffusion conditioning")
    parser.add_argument("--seed", type=int, default=7777, help="Random seed for diffusion")
    parser.add_argument(
        "--steps",
        type=int,
        help="Sampling steps (default: 25 for workflow export, 8 for direct rendering)",
    )
    parser.add_argument("--cfg", type=float, default=3.0, help="ComfyUI KSampler CFG (default: 3.0)")
    parser.add_argument("--denoise", type=float, default=0.72, help="Reference conditioning denoise (default: 0.72)")
    parser.add_argument("--unet", help="Override the MOSS diffusion model filename")
    parser.add_argument("--clip", help="Override the MOSS-compatible text encoder filename")
    parser.add_argument("--vae", help="Override the MOSS-compatible VAE filename")
    parser.add_argument(
        "--canvas",
        choices=sorted(CANVAS_PRESETS),
        default="safe",
        help="Square canvas preset: safe=768 (8 GiB GPU), balanced=896, max=1024 (>12 GiB free VRAM)",
    )
    parser.add_argument("--width", type=int, help="Override canvas width (positive multiple of 16)")
    parser.add_argument("--height", type=int, help="Override canvas height (positive multiple of 16)")
    parser.add_argument("--out-dir", help="Output directory (defaults to renders/maps/<map_id>/)")
    parser.add_argument(
        "--ignore-budget",
        action="store_true",
        help="Skip the free RAM/VRAM check before submitting a diffusion job",
    )

    args = parser.parse_args()
    preset = CANVAS_PRESETS[args.canvas]
    args.width = args.width or preset
    args.height = args.height or preset
    if args.export_workflow:
        result = export_map_layout_workflow(
            map_id_or_path=args.map,
            workflow_path=Path(args.workflow_out) if args.workflow_out else None,
            comfy_input_dir=args.comfy_input,
            layout_draft_path=Path(args.layout_draft) if args.layout_draft else None,
            width=args.width,
            height=args.height,
            seed=args.seed,
            steps=args.steps if args.steps is not None else 25,
            cfg=args.cfg,
            denoise=args.denoise,
            unet_name=args.unet,
            clip_name=args.clip,
            vae_name=args.vae,
            server=args.server,
        )
        print(json.dumps(result, indent=2))
        return

    out = render_map_bundle_art(
        map_id_or_path=args.map,
        out_dir=Path(args.out_dir) if args.out_dir else None,
        comfy_server=args.server,
        force_stylized=args.stylized_only,
        prompt=args.prompt,
        seed=args.seed,
        steps=args.steps if args.steps is not None else 8,
        ignore_budget=args.ignore_budget,
    )
    print(json.dumps(out, indent=2))


if __name__ == "__main__":
    main()
