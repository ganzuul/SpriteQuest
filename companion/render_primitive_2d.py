#!/usr/bin/env python3
"""
companion/render_primitive_2d.py

2D Multi-View Technical Renderer for 3D STL Primitives.
Renders every 3D binary `.stl` primitive in `library/stl_primitives/` into a
crisp 2D multi-angle inspection sheet (3/4 Isometric + Top-Down Ortho + Side Profile)
using pure Python + NumPy + Pillow.

Provides both saved PNG files in `renders/primitives/<id>.png`, `.svg` wrappers,
and self-contained data URLs for the Left Sidebar Asset Navigation Panel.
"""

from __future__ import annotations

import base64
import html
import io
import math
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

RENDERS_DIR = REPO_ROOT / "renders" / "primitives"
STL_DIR = REPO_ROOT / "library" / "stl_primitives"


@dataclass
class Primitive2DVisual:
    id: str
    name: str
    fragment_id: str
    category: str
    dimensions: tuple[float, float, float]
    triangle_count: int
    svg_data_url: str
    png_path: Path | None = None
    png_data_url: str | None = None
    diffusion_prompt: str = ""


# Material tint palettes per primitive ID / category
PRIMITIVE_STYLES: dict[str, dict[str, Any]] = {
    "ancient-bastion": {
        "title": "Ancient 45° Stepped Bastion",
        "category": "architecture",
        "base_rgb": (168, 134, 94),
        "edge_rgb": (72, 54, 36),
        "accent": "#f59e0b",
    },
    "relic-cairn": {
        "title": "Theodolite Station & Relic Cairn",
        "category": "monuments",
        "base_rgb": (132, 148, 168),
        "edge_rgb": (48, 62, 78),
        "accent": "#38bdf8",
    },
    "wish-stone-slab": {
        "title": "Orom's Literal Wish-Stone Slab",
        "category": "monuments",
        "base_rgb": (148, 122, 178),
        "edge_rgb": (64, 42, 92),
        "accent": "#a855f7",
    },
    "cryo-entropy-beacon": {
        "title": "Cryo-Entropy Beacon Monolith",
        "category": "hazards",
        "base_rgb": (72, 168, 198),
        "edge_rgb": (22, 74, 96),
        "accent": "#06b6d4",
    },
    "glass-column-fluted": {
        "title": "Fluted Asteroid-Glass Column",
        "category": "architecture",
        "base_rgb": (94, 212, 192),
        "edge_rgb": (28, 92, 84),
        "accent": "#2dd4bf",
    },
    "solar-focus-lens": {
        "title": "High Chancel Solar Focus Lens",
        "category": "instruments",
        "base_rgb": (218, 168, 78),
        "edge_rgb": (92, 64, 22),
        "accent": "#f59e0b",
    },
    "solarium-mirror": {
        "title": "Solarium Articulated Mirror",
        "category": "instruments",
        "base_rgb": (212, 184, 88),
        "edge_rgb": (88, 72, 24),
        "accent": "#eab308",
    },
    "glass-stasis-coffin": {
        "title": "Hexagonal Borosilicate Stasis Coffin",
        "category": "vessels",
        "base_rgb": (88, 182, 224),
        "edge_rgb": (24, 78, 112),
        "accent": "#38bdf8",
    },
    "r6-ship-crate": {
        "title": "R6-SHIP Standard Bounding Crate",
        "category": "containers",
        "base_rgb": (184, 132, 78),
        "edge_rgb": (74, 48, 24),
        "accent": "#f59e0b",
    },
    "frontier-brazier": {
        "title": "Frontier Cast-Iron Brazier",
        "category": "hearth",
        "base_rgb": (196, 104, 72),
        "edge_rgb": (78, 32, 22),
        "accent": "#ef4444",
    },
    "border-signpost": {
        "title": "Border Milestone Signpost",
        "category": "markers",
        "base_rgb": (168, 124, 78),
        "edge_rgb": (68, 46, 26),
        "accent": "#ca8a04",
    },
    "common-table": {
        "title": "Hollis's Quartermaster Ledger Desk",
        "category": "furniture",
        "base_rgb": (178, 128, 82),
        "edge_rgb": (68, 44, 24),
        "accent": "#d97706",
    },
    "common-chair": {
        "title": "Quartermaster Clerk Chair",
        "category": "furniture",
        "base_rgb": (166, 118, 76),
        "edge_rgb": (64, 42, 22),
        "accent": "#ca8a04",
    },
    "common-bookcase": {
        "title": "Customs Manifest Archive Shelf",
        "category": "furniture",
        "base_rgb": (154, 106, 68),
        "edge_rgb": (58, 38, 20),
        "accent": "#d97706",
    },
    "common-cabinet": {
        "title": "Sealed Stamp & Seal Cabinet",
        "category": "furniture",
        "base_rgb": (146, 100, 66),
        "edge_rgb": (54, 34, 18),
        "accent": "#ca8a04",
    },
    "common-dresser": {
        "title": "1588 Beam Weigh Scale Station",
        "category": "instruments",
        "base_rgb": (172, 124, 80),
        "edge_rgb": (66, 44, 24),
        "accent": "#f59e0b",
    },
    "common-bench": {
        "title": "Intake Supplicant Bench",
        "category": "furniture",
        "base_rgb": (160, 112, 72),
        "edge_rgb": (62, 40, 22),
        "accent": "#ca8a04",
    },
    "common-wardrobe": {
        "title": "Forfeit Storage Wardrobe",
        "category": "furniture",
        "base_rgb": (138, 98, 68),
        "edge_rgb": (52, 34, 20),
        "accent": "#a1a1aa",
    },
}


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        ("DejaVuSansMono-Bold.ttf", "DejaVuSans-Bold.ttf")
        if bold
        else ("DejaVuSansMono.ttf", "DejaVuSans.ttf")
    )
    for name in candidates:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def _project_triangles(
    tris: np.ndarray,
    view_mode: str,
    box_rect: tuple[int, int, int, int],
) -> tuple[list[tuple[float, list[tuple[float, float]], np.ndarray, float]], list[tuple[float, float]]]:
    """
    Project 3D triangles (N, 3, 3) into a 2D viewport rectangle (x0, y0, x1, y1).
    view_mode:
      - 'iso': 3/4 isometric (yaw 38°, pitch 28°)
      - 'top': top-down orthographic (X right, Y down, Z up toward camera)
      - 'side': front/side profile elevation (X right, Z up)
    Returns (sorted_draw_list, bbox_screen_corners).
    """
    all_v = tris.reshape(-1, 3).astype(np.float64)
    vmin = all_v.min(axis=0)
    vmax = all_v.max(axis=0)
    center = (vmin + vmax) / 2.0
    span = np.maximum(vmax - vmin, 1e-4)

    # Normalize centered coordinates
    v_centered = all_v - center

    # For extreme aspect ratios (e.g. 45m tall column), softly compress visual display axis
    # so the object fills the inspection viewport legibly while keeping true metric labels
    max_span = float(span.max())
    min_span = float(span.min())
    scale_factors = np.ones(3, dtype=np.float64)
    if max_span / max(min_span, 0.05) > 5.5:
        # Compress longest axis slightly so detail is visible
        longest_axis = int(np.argmax(span))
        scale_factors[longest_axis] = (min_span * 4.2) / max_span
        v_centered = v_centered * scale_factors

    if view_mode == "iso":
        yaw = math.radians(38.0)
        pitch = math.radians(28.0)
        cy, sy = math.cos(yaw), math.sin(yaw)
        cp, sp = math.cos(pitch), math.sin(pitch)
        # Rotate around Z (yaw), then tilt (pitch) so Z is screen-up
        rx = v_centered[:, 0] * cy - v_centered[:, 1] * sy
        ry_temp = v_centered[:, 0] * sy + v_centered[:, 1] * cy
        rz = v_centered[:, 2]
        sx = rx
        sy_scr = -rz * cp + ry_temp * sp
        depth = ry_temp * cp + rz * sp
        view_vec = np.array([sy * cp, cy * cp, sp], dtype=np.float64)
    elif view_mode == "top":
        sx = v_centered[:, 0]
        sy_scr = v_centered[:, 1]
        depth = v_centered[:, 2]
        view_vec = np.array([0.0, 0.0, 1.0], dtype=np.float64)
    else:  # "side"
        sx = v_centered[:, 0]
        sy_scr = -v_centered[:, 2]
        depth = v_centered[:, 1]
        view_vec = np.array([0.0, 1.0, 0.0], dtype=np.float64)

    x0, y0, x1, y1 = box_rect
    avail_w = (x1 - x0) * 0.80
    avail_h = (y1 - y0) * 0.78

    ptp_x = max(float(sx.max() - sx.min()), 1e-4)
    ptp_y = max(float(sy_scr.max() - sy_scr.min()), 1e-4)
    scale_2d = min(avail_w / ptp_x, avail_h / ptp_y)

    mid_x = float(sx.max() + sx.min()) / 2.0
    mid_y = float(sy_scr.max() + sy_scr.min()) / 2.0
    cx_box = (x0 + x1) / 2.0
    cy_box = (y0 + y1) / 2.0

    px = (sx - mid_x) * scale_2d + cx_box
    py = (sy_scr - mid_y) * scale_2d + cy_box

    px_tris = px.reshape(-1, 3)
    py_tris = py.reshape(-1, 3)
    d_tris = depth.reshape(-1, 3)

    # Compute world-space face normals for lighting
    v0 = tris[:, 0].astype(np.float64)
    v1 = tris[:, 1].astype(np.float64)
    v2 = tris[:, 2].astype(np.float64)
    raw_n = np.cross(v1 - v0, v2 - v0)
    norms = np.linalg.norm(raw_n, axis=1, keepdims=True)
    norms = np.maximum(norms, 1e-12)
    unit_n = raw_n / norms

    z_min = float(vmin[2])
    z_span = max(float(vmax[2] - vmin[2]), 1e-4)

    draw_list = []
    for i in range(len(tris)):
        avg_d = float(d_tris[i].mean())
        facing = 1 if float(np.dot(unit_n[i], view_vec)) >= -0.05 else 0
        pts = [
            (float(px_tris[i, 0]), float(py_tris[i, 0])),
            (float(px_tris[i, 1]), float(py_tris[i, 1])),
            (float(px_tris[i, 2]), float(py_tris[i, 2])),
        ]
        elev_norm = float(((tris[i, :, 2].mean()) - z_min) / z_span)
        draw_list.append(((facing, avg_d), pts, unit_n[i], elev_norm))

    draw_list.sort(key=lambda item: item[0])
    return draw_list, []


def render_stl_to_2d_image(
    primitive_id: str,
    prim_data: dict[str, Any] | None = None,
    width: int = 440,
    height: int = 310,
) -> Image.Image:
    """
    Render a 2x supersampled multi-view 2D technical inspection image directly
    from the 3D binary `.stl` primitive in `library/stl_primitives/<id>.stl`.
    """
    from companion.stl_primitives import STLPrimitive, ensure_default_stl_primitives

    stl_path = STL_DIR / f"{primitive_id}.stl"
    if not stl_path.is_file():
        ensure_default_stl_primitives()

    style = PRIMITIVE_STYLES.get(primitive_id, {})
    title = (
        (prim_data.get("name") if prim_data else None)
        or style.get("title")
        or primitive_id.replace("-", " ").title()
    )
    base_rgb = style.get("base_rgb", (162, 128, 92))
    edge_rgb = style.get("edge_rgb", (58, 42, 28))
    accent_hex = style.get("accent", "#2dd4bf")

    # Convert accent_hex to RGB tuple
    ah = accent_hex.lstrip("#")
    accent_rgb = tuple(int(ah[i : i + 2], 16) for i in (0, 2, 4)) if len(ah) == 6 else (45, 212, 191)

    ss = 2
    W, H = width * ss, height * ss
    img = Image.new("RGB", (W, H), (18, 16, 14))
    draw = ImageDraw.Draw(img, "RGBA")

    # Subtle blueprint grid background
    grid_step = 20 * ss
    for gx in range(0, W, grid_step):
        draw.line([(gx, 0), (gx, H)], fill=(38, 33, 28, 140), width=1)
    for gy in range(0, H, grid_step):
        draw.line([(0, gy), (W, gy)], fill=(38, 33, 28, 140), width=1)

    # Outer frame
    pad = 6 * ss
    draw.rectangle([pad, pad, W - pad, H - pad], outline=(68, 58, 48, 255), width=2)

    # Header bar
    hdr_h = 28 * ss
    draw.rectangle([pad, pad, W - pad, pad + hdr_h], fill=(28, 24, 20, 240), outline=(68, 58, 48, 255), width=1)
    f_hdr = _load_font(10 * ss, bold=True)
    f_sub = _load_font(9 * ss, bold=False)
    f_lbl = _load_font(8 * ss, bold=True)

    draw.text((14 * ss, 12 * ss), f"STL • {primitive_id.upper()}", fill=(214, 203, 189, 255), font=f_hdr)

    # Load STL triangles
    if stl_path.is_file():
        prim = STLPrimitive.load_stl(stl_path, primitive_id=primitive_id)
        tris = prim.triangles
        dims = prim.dimensions
        tri_count = prim.triangle_count
    else:
        tris = np.zeros((0, 3, 3), dtype=np.float32)
        dims = tuple(prim_data.get("dimensions", [1.0, 1.0, 1.0])) if prim_data else (1.0, 1.0, 1.0)
        tri_count = 0

    dim_str = f"{dims[0]:.2f}m × {dims[1]:.2f}m × {dims[2]:.2f}m  ({tri_count} tris)"
    draw.text((W - 14 * ss, 12 * ss), dim_str, fill=accent_rgb + (255,), font=f_sub, anchor="ra")

    # Define 3 viewports:
    # 1. Main 3/4 Isometric View (left)
    iso_rect = (12 * ss, 40 * ss, 286 * ss, 266 * ss)
    # 2. Top-Down Orthographic View (top right)
    top_rect = (294 * ss, 40 * ss, W - 12 * ss, 148 * ss)
    # 3. Side Profile View (bottom right)
    side_rect = (294 * ss, 156 * ss, W - 12 * ss, 266 * ss)

    for rect, v_title in (
        (iso_rect, "3/4 ISOMETRIC MESH VIEW"),
        (top_rect, "TOP-DOWN ORTHO (-Z)"),
        (side_rect, "SIDE ELEVATION PROFILE"),
    ):
        draw.rectangle(rect, fill=(24, 21, 18, 210), outline=(56, 48, 40, 255), width=2)
        draw.text((rect[0] + 6 * ss, rect[1] + 5 * ss), v_title, fill=(156, 142, 128, 255), font=f_lbl)

    if len(tris) > 0:
        light_dir = np.array([-0.45, -0.35, 0.82], dtype=np.float64)
        light_dir /= np.linalg.norm(light_dir)

        # Draw ground shadow ellipse in isometric view
        ix0, iy0, ix1, iy1 = iso_rect
        draw.ellipse(
            [ix0 + 38 * ss, iy1 - 54 * ss, ix1 - 38 * ss, iy1 - 14 * ss],
            fill=(10, 8, 7, 140),
        )

        for rect, mode in ((iso_rect, "iso"), (top_rect, "top"), (side_rect, "side")):
            # Inset drawing region below viewport label
            inner_rect = (rect[0] + 6 * ss, rect[1] + 18 * ss, rect[2] - 6 * ss, rect[3] - 6 * ss)
            draw_list, _ = _project_triangles(tris, mode, inner_rect)

            # Decide edge stroke visibility based on triangle count
            outline_alpha = 180 if len(tris) <= 220 else 75

            for _, pts, norm, elev_norm in draw_list:
                # Two-sided lambertian + elevation ramp
                lam = abs(float(np.dot(norm, light_dir)))
                shade = 0.34 + 0.48 * lam + 0.22 * elev_norm
                r = int(np.clip(base_rgb[0] * shade, 0, 255))
                g = int(np.clip(base_rgb[1] * shade, 0, 255))
                b = int(np.clip(base_rgb[2] * shade, 0, 255))
                edge_col = (edge_rgb[0], edge_rgb[1], edge_rgb[2], outline_alpha)
                draw.polygon(pts, fill=(r, g, b, 255), outline=edge_col)

    # Footer bar
    ftr_top = 272 * ss
    draw.rectangle([pad, ftr_top, W - pad, H - pad], fill=(14, 12, 10, 250), outline=(68, 58, 48, 255), width=1)
    draw.text((14 * ss, ftr_top + 8 * ss), title[:42], fill=(245, 238, 223, 255), font=f_hdr)
    frag_str = (prim_data.get("fragment_id") if prim_data else None) or f"stl/{primitive_id}"
    draw.text((W - 14 * ss, ftr_top + 9 * ss), f"FRAGMENT: {frag_str}", fill=accent_rgb + (255,), font=f_sub, anchor="ra")

    return img.resize((width, height), resample=Image.Resampling.LANCZOS)


_DATA_URL_CACHE: dict[str, str] = {}


def get_primitive_2d_data_url(
    primitive_id: str,
    prim_data: dict[str, Any] | None = None,
    force_render: bool = False,
) -> str:
    """Return base64 PNG data URL rendered from the 3D STL primitive."""
    if not force_render and primitive_id in _DATA_URL_CACHE:
        return _DATA_URL_CACHE[primitive_id]

    RENDERS_DIR.mkdir(parents=True, exist_ok=True)
    png_file = RENDERS_DIR / f"{primitive_id}.png"
    if not force_render and png_file.is_file() and png_file.stat().st_size > 256:
        png_bytes = png_file.read_bytes()
    else:
        img = render_stl_to_2d_image(primitive_id, prim_data)
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        png_bytes = buf.getvalue()
        png_file.write_bytes(png_bytes)

    b64 = base64.b64encode(png_bytes).decode("ascii")
    url = f"data:image/png;base64,{b64}"
    _DATA_URL_CACHE[primitive_id] = url
    return url


def render_primitive_svg(primitive_id: str, prim_data: dict[str, Any] | None = None) -> str:
    """Return an SVG wrapper embedding the 3D STL multi-view render for backwards compatibility."""
    data_url = get_primitive_2d_data_url(primitive_id, prim_data)
    title = (prim_data.get("name") if prim_data else None) or PRIMITIVE_STYLES.get(primitive_id, {}).get("title", primitive_id)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="440" height="310" viewBox="0 0 440 310">'
        f'<title>{html.escape(str(title))}</title>'
        f'<image href="{data_url}" x="0" y="0" width="440" height="310" />'
        f"</svg>"
    )


def ensure_primitive_2d_assets() -> dict[str, str]:
    """
    Ensure all default catalog primitives have 2D multi-view PNGs & SVGs in `renders/primitives/`
    and return mapping `primitive_id -> data_url`.
    """
    RENDERS_DIR.mkdir(parents=True, exist_ok=True)
    results: dict[str, str] = {}

    for pid in PRIMITIVE_STYLES.keys():
        data_url = get_primitive_2d_data_url(pid)
        svg = render_primitive_svg(pid)
        (RENDERS_DIR / f"{pid}.svg").write_text(svg, encoding="utf-8")
        results[pid] = data_url

    return results


def main() -> int:
    urls = ensure_primitive_2d_assets()
    print(f"Rendered {len(urls)} 3D-to-2D multi-view primitive sheets in {RENDERS_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
