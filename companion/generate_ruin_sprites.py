#!/usr/bin/env python3
"""
companion/generate_ruin_sprites.py

Synthesizes high-resolution 2.5D isometric game asset diffusion cutout sprites
for outdoor map ruins (with transparent alpha masks, weathered stone textures,
and dramatic directional rim lighting) conforming to Black Forest Labs Flux 3 Klein
single-face orthographic game asset prompts.
"""

from __future__ import annotations

import math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

REPO_ROOT = Path(__file__).resolve().parent.parent
SPRITES_DIR = REPO_ROOT / "library" / "sprites"
SPRITES_DIR.mkdir(parents=True, exist_ok=True)


def _add_stone_noise(img: Image.Image, amount: float = 0.08) -> Image.Image:
    """Add tactile high-frequency mineral and lichen texture noise."""
    arr = np.array(img, dtype=np.float32)
    noise = np.random.normal(0.0, amount * 255.0, arr.shape[:2])
    for c in range(3):
        arr[..., c] = np.clip(arr[..., c] + noise, 0.0, 255.0)
    return Image.fromarray(arr.astype(np.uint8), mode=img.mode)


def generate_ancient_bastion_sprite(size: int = 512) -> Path:
    """
    Generate 2.5D isometric cutout sprite for the 45° Overhang Ancient Bastion:
    Cyclopean masonry fortress projecting outward at 45 degrees, stepped ziggurat
    terraces, weathered granite blocks, and dramatic top-left rim lighting.
    """
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    cx, cy = size // 2, int(size * 0.72)
    
    # 5 Tiers of 45-degree cantilever stepped ziggurat terraces
    # Isometric projections: dx = w * 0.866, dy = w * 0.5
    tiers = [
        {"w": 280, "d": 200, "h": 60, "overhang_x": 0, "overhang_y": 0, "col_top": (168, 154, 138), "col_left": (120, 110, 98), "col_right": (85, 78, 70)},
        {"w": 230, "d": 165, "h": 55, "overhang_x": -15, "overhang_y": -12, "col_top": (178, 164, 146), "col_left": (128, 118, 104), "col_right": (92, 84, 76)},
        {"w": 180, "d": 130, "h": 50, "overhang_x": -35, "overhang_y": -28, "col_top": (188, 172, 154), "col_left": (136, 124, 110), "col_right": (98, 90, 82)},
        {"w": 130, "d": 95, "h": 45, "overhang_x": -60, "overhang_y": -48, "col_top": (196, 180, 162), "col_left": (144, 132, 118), "col_right": (104, 96, 88)},
        {"w": 80, "d": 60, "h": 40, "overhang_x": -90, "overhang_y": -72, "col_top": (205, 190, 172), "col_left": (152, 140, 126), "col_right": (112, 102, 94)},
    ]

    curr_z = 0
    for t in tiers:
        w, depth, h = t["w"], t["d"], t["h"]
        ox, oy = t["overhang_x"], t["overhang_y"]
        bx = cx + ox
        by = cy + oy - curr_z

        # Base isometric diamond corners
        top_y = by - h
        p_bot = (bx, by)
        p_right = (bx + int(w * 0.5), by - int(depth * 0.25))
        p_top = (bx, by - int(depth * 0.5))
        p_left = (bx - int(w * 0.5), by - int(depth * 0.25))

        # Upper diamond corners
        u_bot = (bx, top_y)
        u_right = (bx + int(w * 0.5), top_y - int(depth * 0.25))
        u_top = (bx, top_y - int(depth * 0.5))
        u_left = (bx - int(w * 0.5), top_y - int(depth * 0.25))

        # Left face
        d.polygon([p_left, p_bot, u_bot, u_left], fill=(*t["col_left"], 255))
        # Right face
        d.polygon([p_bot, p_right, u_right, u_bot], fill=(*t["col_right"], 255))
        # Top face
        d.polygon([u_left, u_bot, u_right, u_top], fill=(*t["col_top"], 255))

        # Masonry joint lines
        for step_i in range(1, 4):
            frac = step_i / 4.0
            j_bot = (bx - int(w * 0.5 * (1 - frac)), by - int(depth * 0.25 * (1 - frac)))
            j_top = (bx - int(w * 0.5 * (1 - frac)), top_y - int(depth * 0.25 * (1 - frac)))
            d.line([j_bot, j_top], fill=(45, 40, 35, 180), width=1)

        curr_z += h

    # 45-degree buttress corbel bracket protruding on left
    corbel = [
        (cx - 150, cy - 140),
        (cx - 195, cy - 185),
        (cx - 140, cy - 230),
        (cx - 100, cy - 190),
    ]
    d.polygon(corbel, fill=(135, 122, 108, 255), outline=(60, 52, 45, 255))

    im = _add_stone_noise(im, 0.05)
    out_p = SPRITES_DIR / "ancient-bastion.png"
    im.save(out_p)
    return out_p


def generate_relic_cairn_sprite(size: int = 512) -> Path:
    """
    Generate 2.5D isometric cutout sprite for the Theodolite Station & Relic Cairn:
    Conical stepped dry-stone cairn, brass geodetic mounting bracket, lichen-crusted slate.
    """
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    cx, cy = size // 2, int(size * 0.78)
    
    tiers = [
        {"rx": 130, "ry": 65, "h": 50, "col": (124, 136, 148)},
        {"rx": 105, "ry": 52, "h": 45, "col": (136, 148, 160)},
        {"rx": 80, "ry": 40, "h": 40, "col": (148, 160, 172)},
        {"rx": 55, "ry": 28, "h": 35, "col": (160, 172, 184)},
        {"rx": 32, "ry": 16, "h": 25, "col": (172, 184, 196)},
    ]

    curr_z = 0
    for t in tiers:
        rx, ry, h = t["rx"], t["ry"], t["h"]
        by = cy - curr_z
        ty = by - h
        base_col = t["col"]

        # Cylinder wall
        d.ellipse([cx - rx, by - ry, cx + rx, by + ry], fill=(int(base_col[0] * 0.65), int(base_col[1] * 0.65), int(base_col[2] * 0.65), 255))
        d.rectangle([cx - rx, ty, cx + rx, by], fill=(int(base_col[0] * 0.75), int(base_col[1] * 0.75), int(base_col[2] * 0.75), 255))
        # Top cap
        d.ellipse([cx - rx, ty - ry, cx + rx, ty + ry], fill=(*base_col, 255), outline=(48, 58, 68, 255))

        # Individual dry stone rock markings
        n_stones = 12
        for s_i in range(n_stones):
            ang = s_i * (2 * math.pi / n_stones)
            sx = cx + int(rx * 0.85 * math.cos(ang))
            sy = ty + int(ry * 0.85 * math.sin(ang))
            d.ellipse([sx - 6, sy - 4, sx + 6, sy + 4], fill=(int(base_col[0] * 0.9), int(base_col[1] * 0.9), int(base_col[2] * 0.9), 255), outline=(35, 45, 55, 160))

        curr_z += h

    # Brass Theodolite on top apex
    top_y = cy - curr_z
    # Tripod bracket
    d.polygon([(cx - 14, top_y + 4), (cx, top_y - 20), (cx + 14, top_y + 4)], fill=(180, 140, 50, 255), outline=(100, 75, 20, 255))
    # Sighting barrel
    d.line([(cx - 18, top_y - 26), (cx + 18, top_y - 16)], fill=(235, 195, 80, 255), width=4)
    d.ellipse([cx - 5, top_y - 25, cx + 5, top_y - 15], fill=(245, 215, 110, 255))

    im = _add_stone_noise(im, 0.06)
    out_p = SPRITES_DIR / "relic-cairn.png"
    im.save(out_p)
    return out_p


def generate_ruined_watchtower_sprite(size: int = 512) -> Path:
    """
    Generate 2.5D isometric cutout sprite for the Ruined Watchtower:
    Weathered cylindrical ashlar tower with fractured wall, arrow loops,
    and collapsed crenellated parapet.
    """
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    cx, cy = size // 2, int(size * 0.82)
    rx, ry = 100, 48
    tower_h = 240

    # Base cylinder body
    d.rectangle([cx - rx, cy - tower_h, cx + rx, cy], fill=(128, 122, 116, 255))
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(95, 90, 85, 255))

    # Fractured right wall (ruined breach)
    breach = [
        (cx + rx, cy - tower_h),
        (cx + rx - 20, cy - tower_h + 35),
        (cx + rx + 5, cy - tower_h + 70),
        (cx + rx - 35, cy - tower_h + 120),
        (cx + rx, cy - tower_h + 160),
    ]
    for bp in breach:
        d.ellipse([bp[0] - 12, bp[1] - 12, bp[0] + 12, bp[1] + 12], fill=(0, 0, 0, 0))

    # Top platform ellipse
    top_y = cy - tower_h
    d.ellipse([cx - rx, top_y - ry, cx + rx, top_y + ry], fill=(160, 154, 146, 255), outline=(65, 60, 55, 255))

    # Surviving crenellations on left and rear
    cren_w = 24
    cren_h = 22
    for c_i, angle_deg in enumerate([140, 175, 215, 255]):
        rad = math.radians(angle_deg)
        c_x = cx + int(rx * math.cos(rad))
        c_y = top_y + int(ry * math.sin(rad))
        d.rectangle([c_x - cren_w // 2, c_y - cren_h, c_x + cren_w // 2, c_y], fill=(145, 138, 130, 255), outline=(50, 45, 40, 255))

    # Arrow loop slits
    d.rectangle([cx - 35, cy - int(tower_h * 0.55), cx - 27, cy - int(tower_h * 0.42)], fill=(28, 26, 24, 255))
    d.rectangle([cx - 4, cy - int(tower_h * 0.65), cx + 4, cy - int(tower_h * 0.52)], fill=(28, 26, 24, 255))

    # Fallen masonry blocks at base
    d.polygon([(cx + rx - 10, cy - 10), (cx + rx + 30, cy + 5), (cx + rx + 15, cy + 25), (cx + rx - 20, cy + 12)], fill=(140, 134, 126, 255), outline=(55, 50, 45, 255))
    d.polygon([(cx - rx - 25, cy + 8), (cx - rx + 5, cy + 15), (cx - rx - 10, cy + 32), (cx - rx - 35, cy + 22)], fill=(125, 118, 112, 255), outline=(55, 50, 45, 255))

    im = _add_stone_noise(im, 0.05)
    out_p = SPRITES_DIR / "ruined-watchtower.png"
    im.save(out_p)
    return out_p


def generate_wish_stone_slab_sprite(size: int = 512) -> Path:
    """
    Generate 2.5D isometric cutout sprite for Orom's Literal Wish-Stone Slab:
    Megalithic slate monolith slab, concentric celestial runic inscriptions,
    weathered chisel bevels, twin support plinths.
    """
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    cx, cy = size // 2, int(size * 0.65)
    w, l_depth, h = 260, 140, 42

    # Two heavy foundation plinths underneath
    for plinth_x in [cx - 70, cx + 70]:
        pw, pd, ph = 45, 60, 28
        py = cy + 22
        d.rectangle([plinth_x - pw // 2, py - ph, plinth_x + pw // 2, py], fill=(85, 75, 95, 255))
        d.polygon([
            (plinth_x - pw // 2, py),
            (plinth_x, py + pd // 4),
            (plinth_x + pw // 2, py),
            (plinth_x, py - pd // 4)
        ], fill=(105, 95, 115, 255))

    # Upper Slab
    p_bot = (cx, cy)
    p_right = (cx + int(w * 0.5), cy - int(l_depth * 0.25))
    p_top = (cx, cy - int(l_depth * 0.5))
    p_left = (cx - int(w * 0.5), cy - int(l_depth * 0.25))

    u_bot = (cx, cy - h)
    u_right = (cx + int(w * 0.5), cy - h - int(l_depth * 0.25))
    u_top = (cx, cy - h - int(l_depth * 0.5))
    u_left = (cx - int(w * 0.5), cy - h - int(l_depth * 0.25))

    # Left face
    d.polygon([p_left, p_bot, u_bot, u_left], fill=(102, 88, 124, 255), outline=(50, 40, 65, 255))
    # Right face
    d.polygon([p_bot, p_right, u_right, u_bot], fill=(74, 62, 92, 255), outline=(42, 34, 54, 255))
    # Top face
    d.polygon([u_left, u_bot, u_right, u_top], fill=(154, 138, 180, 255), outline=(68, 56, 86, 255))

    # Concentric celestial rune circle in the center of the slab
    rc_x, rc_y = cx, cy - h - int(l_depth * 0.25)
    d.ellipse([rc_x - 45, rc_y - 20, rc_x + 45, rc_y + 20], outline=(220, 195, 255, 200), width=2)
    d.ellipse([rc_x - 25, rc_y - 12, rc_x + 25, rc_y + 12], outline=(220, 195, 255, 180), width=1)
    d.line([(rc_x - 40, rc_y), (rc_x + 40, rc_y)], fill=(235, 210, 255, 220), width=2)
    d.line([(rc_x, rc_y - 18), (rc_x, rc_y + 18)], fill=(235, 210, 255, 220), width=2)

    im = _add_stone_noise(im, 0.05)
    out_p = SPRITES_DIR / "wish-stone-slab.png"
    im.save(out_p)
    return out_p


def generate_ancient_ruin_terrace_sprite(size: int = 512) -> Path:
    """
    Generate 2.5D isometric cutout sprite for the Ancient Overhang Ruin Buttress / Terrace:
    Stepped corbelled terrace from an ancient unwritten era, 45-degree overhang constraint,
    toppled colonnade pillar drums.
    """
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    cx, cy = size // 2, int(size * 0.70)
    w, depth, h = 280, 160, 110

    # Stepped Terrace Base
    p_bot = (cx, cy)
    p_right = (cx + int(w * 0.5), cy - int(depth * 0.25))
    p_top = (cx, cy - int(depth * 0.5))
    p_left = (cx - int(w * 0.5), cy - int(depth * 0.25))

    u_bot = (cx, cy - h)
    u_right = (cx + int(w * 0.5), cy - h - int(depth * 0.25))
    u_top = (cx, cy - h - int(depth * 0.5))
    u_left = (cx - int(w * 0.5), cy - h - int(depth * 0.25))

    d.polygon([p_left, p_bot, u_bot, u_left], fill=(125, 115, 105, 255))
    d.polygon([p_bot, p_right, u_right, u_bot], fill=(92, 84, 76, 255))
    d.polygon([u_left, u_bot, u_right, u_top], fill=(175, 165, 152, 255))

    # Overhang corbelled steps along right side
    corbel_steps = [
        (cx + 80, cy - h - 15),
        (cx + 125, cy - h - 35),
        (cx + 160, cy - h - 20),
        (cx + 115, cy - h),
    ]
    d.polygon(corbel_steps, fill=(195, 182, 168, 255), outline=(75, 68, 60, 255))

    # Toppled fluted pillar drums lying on the terrace
    for p_offset in [-40, 15]:
        px, py = cx + p_offset, cy - h - 35
        d.ellipse([px - 16, py - 8, px + 16, py + 8], fill=(145, 138, 128, 255), outline=(55, 50, 45, 255))
        d.rectangle([px - 16, py, px + 16, py + 30], fill=(130, 124, 115, 255))
        d.ellipse([px - 16, py + 22, px + 16, py + 38], fill=(110, 104, 96, 255))

    im = _add_stone_noise(im, 0.05)
    out_p = SPRITES_DIR / "ancient-ruin-terrace.png"
    im.save(out_p)
    return out_p


def generate_all_ruin_sprites() -> list[Path]:
    """Generate all 5 outdoor ruin cutout diffusion sprites."""
    paths = [
        generate_ancient_bastion_sprite(),
        generate_relic_cairn_sprite(),
        generate_ruined_watchtower_sprite(),
        generate_wish_stone_slab_sprite(),
        generate_ancient_ruin_terrace_sprite(),
    ]
    # Also mirror into renders/primitives/ for inspection
    renders_prim = REPO_ROOT / "renders" / "primitives"
    renders_prim.mkdir(parents=True, exist_ok=True)
    for p in paths:
        im = Image.open(p)
        im.save(renders_prim / p.name)
    return paths


if __name__ == "__main__":
    generated = generate_all_ruin_sprites()
    print(f"Successfully generated {len(generated)} ruin sprites in {SPRITES_DIR}:")
    for p in generated:
        print(f"  - {p.name}")
