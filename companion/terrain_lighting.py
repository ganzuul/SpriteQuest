#!/usr/bin/env python3
"""
companion/terrain_lighting.py

Dynamic Shadow Caster, Cursor Depth Probe, and Player-Centric Line-of-Sight (LOS) / Fog of War.

Implements:
  1. Directional Sun/Dusk Shadow Caster via fast horizon raymarching across the 2.5D heightfield.
  2. Interactive Cursor Depth Probe: Point light hovering at (x_cursor, y_cursor, h + 2.5m)
     casting dynamic shadows across elevation steps to give tactile depth feedback.
  3. Player-Centric Line-of-Sight & Fog of War: Raymarching from character eye height
     (x_P, y_P, z_P + 1.7m) producing a 3-state visibility mask (Void / Memory / Active).
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.terrain_mesh import TerrainMesh


class TerrainLighting:
    """
    Computes dynamic cast shadows, interactive cursor probes, and line-of-sight
    masks on a TerrainMesh heightfield.
    """

    def __init__(self, terrain: TerrainMesh):
        self.terrain = terrain
        self.H = terrain.rows
        self.W = terrain.cols
        self.h = terrain.heights
        self.step_m = terrain.grid_step_m

    # -------------------------------------------------------------------------
    # 1. Global Directional Shadow Caster (Sun / Dusk / Moon)
    # -------------------------------------------------------------------------

    def compute_directional_shadows(
        self,
        light_azimuth_deg: float = 315.0,  # From North-West by default
        light_elevation_deg: float = 35.0, # 35 degrees above horizon
    ) -> np.ndarray:
        """
        Fast horizon raymarching across the 2.5D heightfield.
        Returns a float32 shadow mask (rows, cols) in [0.0..1.0] where 1.0 = fully lit,
        0.0 = completely in cast shadow.
        """
        # Direction rays travel FROM light INTO the scene
        az_rad = math.radians(light_azimuth_deg)
        el_rad = math.radians(light_elevation_deg)

        # Step vector on the grid (in units of grid cells)
        # Azimuth: 0 = North (-Y), 90 = East (+X), 180 = South (+Y), 270 = West (-X)
        dx_grid = math.sin(az_rad)
        dy_grid = -math.cos(az_rad)
        step_len = math.hypot(dx_grid, dy_grid)
        if step_len > 1e-6:
            dx_grid /= step_len
            dy_grid /= step_len

        # Vector pointing FROM any terrain cell TOWARD the light source
        # Azimuth 0 = North (-Y), 90 = East (+X), 180 = South (+Y), 270 = West (-X)
        to_light_x = math.sin(az_rad)
        to_light_y = -math.cos(az_rad)
        tan_el = math.tan(el_rad)

        shadow_mask = np.ones((self.H, self.W), dtype=np.float32)

        # Max ray steps across the diagonal of the grid
        max_steps = int(math.hypot(self.W, self.H)) + 2

        # A point (r, c) is in shadow if any point in the direction of the light has
        # h_caster > h_target + dist * tan(elevation)
        for step in range(1, min(max_steps, 80)):
            off_c = int(round(step * to_light_x))
            off_r = int(round(step * to_light_y))
            if off_c == 0 and off_r == 0:
                continue

            # Target cells (r_tgt, c_tgt)
            # Caster cells are at (r_tgt + off_r, c_tgt + off_c)
            r_tgt_min = max(0, -off_r)
            r_tgt_max = min(self.H, self.H - off_r)
            c_tgt_min = max(0, -off_c)
            c_tgt_max = min(self.W, self.W - off_c)

            r_cast_min = r_tgt_min + off_r
            r_cast_max = r_tgt_max + off_r
            c_cast_min = c_tgt_min + off_c
            c_cast_max = c_tgt_max + off_c

            if r_tgt_min >= r_tgt_max or c_tgt_min >= c_tgt_max:
                break

            dist_m = step * self.step_m
            ray_height_req = self.h[r_tgt_min:r_tgt_max, c_tgt_min:c_tgt_max] + dist_m * tan_el
            caster_height = self.h[r_cast_min:r_cast_max, c_cast_min:c_cast_max]
            occluded = caster_height > ray_height_req

            shadow_mask[r_tgt_min:r_tgt_max, c_tgt_min:c_tgt_max] = np.where(
                occluded,
                0.22,  # Ambient shadow floor
                shadow_mask[r_tgt_min:r_tgt_max, c_tgt_min:c_tgt_max],
            )

        return shadow_mask

    # -------------------------------------------------------------------------
    # 2. Interactive Cursor Depth Probe Light
    # -------------------------------------------------------------------------

    def compute_cursor_depth_probe(
        self,
        cursor_x_m: float,
        cursor_y_m: float,
        probe_radius_m: float = 24.0,
        light_height_above_ground: float = 2.5,
    ) -> np.ndarray:
        """
        Cast radial light and dynamic shadows from a point light hovering at the mouse
        cursor position: (cursor_x, cursor_y, ground_h + light_height_above_ground).
        Returns a float32 probe illumination buffer (rows, cols) in [0.0..1.0].
        """
        c_light, r_light = self.terrain.world_to_grid(cursor_x_m, cursor_y_m)
        h_ground = float(self.terrain.sample_elevation(cursor_x_m, cursor_y_m))
        z_light = h_ground + light_height_above_ground

        probe_buf = np.zeros((self.H, self.W), dtype=np.float32)

        rad_cells = int(math.ceil(probe_radius_m / self.step_m))
        r0 = max(0, r_light - rad_cells)
        r1 = min(self.H - 1, r_light + rad_cells)
        c0 = max(0, c_light - rad_cells)
        c1 = min(self.W - 1, c_light + rad_cells)

        # Radial raycast within the bounding box
        for r in range(r0, r1 + 1):
            for c in range(c0, c1 + 1):
                wx, wy = self.terrain.grid_to_world(c, r)
                dx = wx - cursor_x_m
                dy = wy - cursor_y_m
                dist_2d = math.hypot(dx, dy)
                if dist_2d > probe_radius_m:
                    continue

                if dist_2d < 0.2:
                    probe_buf[r, c] = 1.0
                    continue

                # Raymarch from light to target (r, c)
                steps = max(int(dist_2d / (self.step_m * 0.75)), 2)
                t_vals = np.linspace(0.0, 1.0, steps + 1)[1:-1]

                target_h = float(self.h[r, c])
                blocked = False

                for t in t_vals:
                    test_x = cursor_x_m + dx * t
                    test_y = cursor_y_m + dy * t
                    ray_z = z_light + (target_h - z_light) * t

                    terrain_z = self.terrain.sample_elevation(test_x, test_y)
                    if terrain_z > ray_z + 0.05:
                        blocked = True
                        break

                if not blocked:
                    # Inverse-square style falloff with smooth edge fade
                    atten = (1.0 - (dist_2d / probe_radius_m) ** 2) ** 2
                    probe_buf[r, c] = float(np.clip(atten, 0.0, 1.0))

        return probe_buf

    # -------------------------------------------------------------------------
    # 3. Player-Centric Line-of-Sight (LOS) & Fog of War
    # -------------------------------------------------------------------------

    def compute_player_los(
        self,
        player_x_m: float,
        player_y_m: float,
        view_radius_m: float = 40.0,
        player_eye_height: float = 1.7,
    ) -> np.ndarray:
        """
        Elevation-aware Line-of-Sight raymarch originating from the player's eyes:
          Eye position = (player_x, player_y, ground_z + player_eye_height)

        Returns a float32 visibility mask (rows, cols) where:
          1.0 = visible in direct line-of-sight
          0.0 = occluded by intermediate terrain ridges / cliff faces or out of range.
        """
        c_p, r_p = self.terrain.world_to_grid(player_x_m, player_y_m)
        h_ground = float(self.terrain.sample_elevation(player_x_m, player_y_m))
        eye_z = h_ground + player_eye_height

        los_mask = np.zeros((self.H, self.W), dtype=np.float32)

        rad_cells = int(math.ceil(view_radius_m / self.step_m))
        r0 = max(0, r_p - rad_cells)
        r1 = min(self.H - 1, r_p + rad_cells)
        c0 = max(0, c_p - rad_cells)
        c1 = min(self.W - 1, c_p + rad_cells)

        for r in range(r0, r1 + 1):
            for c in range(c0, c1 + 1):
                wx, wy = self.terrain.grid_to_world(c, r)
                dx = wx - player_x_m
                dy = wy - player_y_m
                dist_2d = math.hypot(dx, dy)
                if dist_2d > view_radius_m:
                    continue

                if dist_2d < 0.5:
                    los_mask[r, c] = 1.0
                    continue

                # Raymarch from eye to target point
                target_z = float(self.h[r, c])
                steps = max(int(dist_2d / (self.step_m * 0.75)), 2)
                t_vals = np.linspace(0.0, 1.0, steps + 1)[1:-1]

                blocked = False
                for t in t_vals:
                    test_x = player_x_m + dx * t
                    test_y = player_y_m + dy * t
                    ray_z = eye_z + (target_z - eye_z) * t

                    terrain_z = self.terrain.sample_elevation(test_x, test_y)
                    # If intermediate terrain obstructs the sightline
                    if terrain_z > ray_z + 0.10:
                        blocked = True
                        break

                if not blocked:
                    # Clear daylight visibility across open terrain, with soft feather at the outer horizon
                    feather_radius_m = view_radius_m * 0.85
                    if dist_2d <= feather_radius_m:
                        vis = 1.0
                    else:
                        frac = (dist_2d - feather_radius_m) / (view_radius_m - feather_radius_m)
                        vis = 1.0 - frac * frac
                    los_mask[r, c] = float(vis)

        return los_mask

    # -------------------------------------------------------------------------
    # Composite Top-Down Illumination Map
    # -------------------------------------------------------------------------

    def render_illuminated_topdown(
        self,
        player_x: float,
        player_y: float,
        cursor_x: float | None = None,
        cursor_y: float | None = None,
        unexplored_mask: np.ndarray | None = None,
    ) -> Image.Image:
        """
        Render a complete 2.5D top-down view combining:
          - Base topographic hillshading & contours
          - Directional sunlight cast shadows
          - Dynamic cursor depth probe light
          - Player Line-of-Sight & Fog of War
        """
        base_relief = np.asarray(self.terrain.render_topdown_relief(contour_step_m=2.0), dtype=np.float32)
        dir_shadow = self.compute_directional_shadows(light_azimuth_deg=315.0, light_elevation_deg=35.0)
        los = self.compute_player_los(player_x, player_y, view_radius_m=38.0)

        probe = (
            self.compute_cursor_depth_probe(cursor_x, cursor_y, probe_radius_m=20.0)
            if cursor_x is not None and cursor_y is not None
            else np.zeros((self.H, self.W), dtype=np.float32)
        )

        # Combine sunlight + probe into total scene illumination factor
        total_light = np.clip(dir_shadow * 0.85 + probe * 0.55 + 0.15, 0.0, 1.25)

        out_rgb = np.zeros_like(base_relief)
        for ch in range(3):
            # Lit relief
            lit_ch = base_relief[:, :, ch] * total_light

            # Fog of War 3-state compositing:
            # - Active Sightline: Full lit colour + warm lantern tint
            # - Memory (Explored): Muted sepia (greyscale * 0.55)
            # - Unexplored (Void): Dark parchment grid
            grey = 0.299 * base_relief[:, :, 0] + 0.587 * base_relief[:, :, 1] + 0.114 * base_relief[:, :, 2]
            memory_ch = grey * 0.52 + 18.0
            void_ch = 18.0  # Dark void

            active_blend = los[:, :]
            vis_ch = lit_ch * active_blend + memory_ch * (1.0 - active_blend)

            if unexplored_mask is not None:
                vis_ch = np.where(unexplored_mask, void_ch, vis_ch)

            out_rgb[:, :, ch] = np.clip(vis_ch, 0, 255)

        # Draw player token and cursor probe marker
        img = Image.fromarray(out_rgb.astype(np.uint8), mode="RGB")
        draw = ImageDraw.Draw(img)

        # Player token (cyan compass circle)
        cp, rp = self.terrain.world_to_grid(player_x, player_y)
        draw.ellipse([cp - 4, rp - 4, cp + 4, rp + 4], fill=(0, 240, 255), outline=(10, 20, 30))
        draw.line([cp, rp, cp, rp - 7], fill=(0, 240, 255), width=2)

        # Cursor probe marker (gold star / ring)
        if cursor_x is not None and cursor_y is not None:
            cc, rc = self.terrain.world_to_grid(cursor_x, cursor_y)
            draw.ellipse([cc - 3, rc - 3, cc + 3, rc + 3], fill=(255, 215, 40), outline=(50, 40, 10))

        return img


def main() -> int:
    parser = argparse.ArgumentParser(description="Demonstrate dynamic shadows, cursor probe, and player LOS.")
    parser.add_argument("--out", type=Path, default=REPO_ROOT / "renders" / "terrain" / "lighting-demo", help="Output directory")
    args = parser.parse_args()

    tm = TerrainMesh(80.0, 80.0, grid_step_m=0.5, base_elevation_m=2.0, name="Border-March-Plateau")
    tm.add_flat_build_plate(40.0, 40.0, width=32.0, length=44.0, elevation=6.0, blend_margin=4.0)
    tm.add_ridge_pass(start_x=40.0, start_y=62.0, end_x=40.0, end_y=80.0, pass_elevation=6.0, ridge_elevation=18.0)
    tm.add_ancient_overhang_ruin(center_x=16.0, center_y=16.0, base_width=18.0, base_length=18.0, top_elevation=14.0, overhang_angle_deg=45.0)

    tl = TerrainLighting(tm)
    args.out.mkdir(parents=True, exist_ok=True)

    # 1. Player in the center plateau, cursor probing the northern ridge
    img_center = tl.render_illuminated_topdown(player_x=40.0, player_y=36.0, cursor_x=40.0, cursor_y=68.0)
    path_center = args.out / "player_center_plateau.png"
    img_center.save(path_center)
    print(f"Saved: {path_center}")

    # 2. Player inside the south pass (flanked by tall ridges on east and west)
    img_pass = tl.render_illuminated_topdown(player_x=40.0, player_y=72.0, cursor_x=16.0, cursor_y=16.0)
    path_pass = args.out / "player_in_pass.png"
    img_pass.save(path_pass)
    print(f"Saved: {path_pass}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
