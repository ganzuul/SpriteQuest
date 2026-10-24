#!/usr/bin/env python3
"""
companion/terrain_mesh.py

2.5D Topological Terrain Heightfield, Slope & Overhang Analyzer,
Elevation Strata Slicer, and Binary STL 3D Mesh Exporter.

Implements the geometric foundation specified in docs/outdoor-maps-and-2.5d-engine-spec.md:
  - Metric 2.5D heightfield z = h(x, y)
  - Surface normal and slope calculation
  - Traversability categorization (<35° walk, 35°-50° scramble, >=50° cliff)
  - 45° overhang ancient ruin constraint tagging
  - Discrete elevation strata slicing for CSS 3D parallax rendering
  - Standard binary STL (.stl) 3D mesh export (zero external C-deps required)
"""

from __future__ import annotations

import argparse
import json
import math
import struct
import sys
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parent.parent


# Traversability slope angle thresholds (degrees)
SLOPE_WALKABLE_MAX_DEG = 35.0
SLOPE_SCRAMBLE_MAX_DEG = 50.0
OVERHANG_ANCIENT_DEG = 45.0

# Semantic terrain tag masks (bitflags)
TAG_BUILD_PLATE = 1       # Level architectural foundation
TAG_ANCIENT_RUIN = 2      # Ancient 45° overhang relic infrastructure
TAG_ROAD_PASS = 4         # Traversable ridge pass / cleared road corridor
TAG_CANYON_GORGE = 8      # Sunken riverbed / alluvial canyon gorge


@dataclass
class TerrainStratum:
    """An elevation slice band for the CSS 3D parallax layer stack."""
    id: str
    name: str
    z_min: float
    z_max: float
    css_z_px: int
    navigable_pct: float = 0.0


class TerrainMesh:
    """
    A 2.5D continuous-to-stepped metric terrain heightfield grid z = h(x, y).
    """

    def __init__(
        self,
        width_m: float,
        length_m: float,
        grid_step_m: float = 0.5,
        base_elevation_m: float = 0.0,
        name: str = "Terrain",
    ):
        if width_m <= 0 or length_m <= 0 or grid_step_m <= 0:
            raise ValueError(f"Invalid terrain dimensions: {width_m}x{length_m} @ {grid_step_m}m")

        self.width_m = float(width_m)
        self.length_m = float(length_m)
        self.grid_step_m = float(grid_step_m)
        self.name = str(name)

        self.cols = int(round(self.width_m / self.grid_step_m)) + 1
        self.rows = int(round(self.length_m / self.grid_step_m)) + 1

        # Elevation buffer (rows = Y / South, cols = X / East)
        self.heights = np.full((self.rows, self.cols), float(base_elevation_m), dtype=np.float32)

        # Tags buffer (uint8 bitmask: 1 = build_plate, 2 = ancient_ruin, 4 = road/path)
        self.tags = np.zeros((self.rows, self.cols), dtype=np.uint8)

    # -------------------------------------------------------------------------
    # Coordinate transforms
    # -------------------------------------------------------------------------

    def world_to_grid(self, x_m: float, y_m: float) -> tuple[int, int]:
        c = int(round(x_m / self.grid_step_m))
        r = int(round(y_m / self.grid_step_m))
        c = max(0, min(self.cols - 1, c))
        r = max(0, min(self.rows - 1, r))
        return c, r

    def grid_to_world(self, col: int, row: int) -> tuple[float, float]:
        return float(col * self.grid_step_m), float(row * self.grid_step_m)

    def sample_elevation(self, x_m: float, y_m: float) -> float:
        """Bilinear interpolation of elevation at world coordinates (x, y) in metres."""
        fx = x_m / self.grid_step_m
        fy = y_m / self.grid_step_m

        c0 = max(0, min(self.cols - 1, int(math.floor(fx))))
        c1 = max(0, min(self.cols - 1, c0 + 1))
        r0 = max(0, min(self.rows - 1, int(math.floor(fy))))
        r1 = max(0, min(self.rows - 1, r0 + 1))

        tx = fx - c0
        ty = fy - r0

        h00 = self.heights[r0, c0]
        h01 = self.heights[r0, c1]
        h10 = self.heights[r1, c0]
        h11 = self.heights[r1, c1]

        h0 = h00 * (1.0 - tx) + h01 * tx
        h1 = h10 * (1.0 - tx) + h11 * tx
        return float(h0 * (1.0 - ty) + h1 * ty)

    # -------------------------------------------------------------------------
    # Procedural shaping operators
    # -------------------------------------------------------------------------

    def add_flat_build_plate(
        self,
        center_x: float,
        center_y: float,
        width: float,
        length: float,
        elevation: float,
        blend_margin: float = 2.0,
        tag_mask: int = 1,
    ) -> None:
        """
        Stamp a level build plate (flat foundation for a scene, e.g. Customs House).
        Smoothly blends into the surrounding terrain across blend_margin metres.
        """
        c_min, r_min = self.world_to_grid(center_x - width / 2.0 - blend_margin, center_y - length / 2.0 - blend_margin)
        c_max, r_max = self.world_to_grid(center_x + width / 2.0 + blend_margin, center_y + length / 2.0 + blend_margin)

        half_w = width / 2.0
        half_l = length / 2.0

        for r in range(r_min, r_max + 1):
            for c in range(c_min, c_max + 1):
                wx, wy = self.grid_to_world(c, r)
                dx = abs(wx - center_x)
                dy = abs(wy - center_y)

                # Inside the core build plate
                if dx <= half_w and dy <= half_l:
                    self.heights[r, c] = elevation
                    self.tags[r, c] |= tag_mask
                elif dx <= half_w + blend_margin and dy <= half_l + blend_margin:
                    # Margin distance
                    excess_x = max(0.0, dx - half_w)
                    excess_y = max(0.0, dy - half_l)
                    d_edge = math.hypot(excess_x, excess_y)
                    if d_edge <= blend_margin:
                        t = math.cos((d_edge / blend_margin) * (math.pi / 2.0)) ** 2
                        self.heights[r, c] = self.heights[r, c] * (1.0 - t) + elevation * t

    def add_hill(self, center_x: float, center_y: float, height: float, radius: float) -> None:
        """Add a smooth Gaussian / cosine hill."""
        c_min, r_min = self.world_to_grid(center_x - radius, center_y - radius)
        c_max, r_max = self.world_to_grid(center_x + radius, center_y + radius)

        for r in range(r_min, r_max + 1):
            for c in range(c_min, c_max + 1):
                wx, wy = self.grid_to_world(c, r)
                dist = math.hypot(wx - center_x, wy - center_y)
                if dist < radius:
                    elev = height * 0.5 * (1.0 + math.cos(math.pi * dist / radius))
                    self.heights[r, c] += elev

    def add_ridge_pass(
        self,
        start_x: float,
        start_y: float,
        end_x: float,
        end_y: float,
        pass_elevation: float,
        ridge_elevation: float,
        pass_width: float = 8.0,
        ridge_flank_width: float = 24.0,
    ) -> None:
        """
        Cut a traversable low-elevation saddle pass flanked by steep ridges.
        """
        dx = end_x - start_x
        dy = end_y - start_y
        seg_len = math.hypot(dx, dy)
        if seg_len < 1e-6:
            return

        ux = dx / seg_len
        uy = dy / seg_len
        # Perpendicular normal
        nx = -uy
        ny = ux

        margin = ridge_flank_width + 4.0
        x_min = min(start_x, end_x) - margin
        x_max = max(start_x, end_x) + margin
        y_min = min(start_y, end_y) - margin
        y_max = max(start_y, end_y) + margin

        c_min, r_min = self.world_to_grid(x_min, y_min)
        c_max, r_max = self.world_to_grid(x_max, y_max)

        for r in range(r_min, r_max + 1):
            for c in range(c_min, c_max + 1):
                wx, wy = self.grid_to_world(c, r)
                # Project onto line segment
                vx = wx - start_x
                vy = wy - start_y
                proj = vx * ux + vy * uy
                if -margin <= proj <= seg_len + margin:
                    # Distance to pass center line
                    perp_dist = abs(vx * nx + vy * ny)
                    if perp_dist <= pass_width / 2.0:
                        self.heights[r, c] = pass_elevation
                        self.tags[r, c] |= 4  # Road/path tag
                    elif perp_dist <= ridge_flank_width:
                        # Rise sharply to ridge height
                        t = (perp_dist - pass_width / 2.0) / (ridge_flank_width - pass_width / 2.0)
                        h_flank = pass_elevation + (ridge_elevation - pass_elevation) * (t ** 1.3)
                        self.heights[r, c] = max(self.heights[r, c], h_flank)

    def add_ancient_overhang_ruin(
        self,
        center_x: float,
        center_y: float,
        base_width: float,
        base_length: float,
        top_elevation: float,
        base_elevation: float = 0.0,
        overhang_angle_deg: float = 45.0,
    ) -> None:
        """
        Build an ancient stepped ruin buttress that strictly obeys the 45° overhang
        rule (cantilever step delta_h <= delta_dist). Marked as an ancient ambient relic.
        """
        h_delta = top_elevation - base_elevation
        # Under 45° rule, horizontal slope step = h_delta / tan(45°) = h_delta
        slope_run = h_delta / math.tan(math.radians(overhang_angle_deg))

        half_w = base_width / 2.0
        half_l = base_length / 2.0

        c_min, r_min = self.world_to_grid(center_x - half_w - 2.0, center_y - half_l - 2.0)
        c_max, r_max = self.world_to_grid(center_x + half_w + 2.0, center_y + half_l + 2.0)

        for r in range(r_min, r_max + 1):
            for c in range(c_min, c_max + 1):
                wx, wy = self.grid_to_world(c, r)
                dx = abs(wx - center_x)
                dy = abs(wy - center_y)

                # Distance from outer base boundary inward toward center
                edge_dist_x = half_w - dx
                edge_dist_y = half_l - dy
                edge_in = min(edge_dist_x, edge_dist_y)

                if edge_in > 0:
                    elev = base_elevation + min(edge_in * math.tan(math.radians(overhang_angle_deg)), h_delta)
                    self.heights[r, c] = max(self.heights[r, c], elev)
                    self.tags[r, c] |= TAG_ANCIENT_RUIN

    def add_canyon_gorge(
        self,
        start_x: float,
        start_y: float,
        end_x: float,
        end_y: float,
        bed_elevation: float,
        bed_width: float = 6.0,
        wall_slope_width: float = 8.0,
        tag_mask: int = TAG_CANYON_GORGE,
    ) -> None:
        """
        Carve a sunken canyon gorge or alluvial river bed with steep wall scarps
        and a flat, traversable bed floor.
        """
        dx = end_x - start_x
        dy = end_y - start_y
        seg_len = math.hypot(dx, dy)
        if seg_len < 1e-6:
            return

        ux = dx / seg_len
        uy = dy / seg_len
        nx = -uy
        ny = ux

        margin = bed_width / 2.0 + wall_slope_width + 4.0
        x_min = min(start_x, end_x) - margin
        x_max = max(start_x, end_x) + margin
        y_min = min(start_y, end_y) - margin
        y_max = max(start_y, end_y) + margin

        c_min, r_min = self.world_to_grid(x_min, y_min)
        c_max, r_max = self.world_to_grid(x_max, y_max)

        for r in range(r_min, r_max + 1):
            for c in range(c_min, c_max + 1):
                wx, wy = self.grid_to_world(c, r)
                vx = wx - start_x
                vy = wy - start_y
                proj = vx * ux + vy * uy
                if -2.0 <= proj <= seg_len + 2.0:
                    perp_dist = abs(vx * nx + vy * ny)
                    half_bed = bed_width / 2.0
                    if perp_dist <= half_bed:
                        self.heights[r, c] = min(self.heights[r, c], bed_elevation)
                        self.tags[r, c] |= tag_mask
                    elif perp_dist <= half_bed + wall_slope_width:
                        t = (perp_dist - half_bed) / wall_slope_width
                        t_curve = t * t * (3.0 - 2.0 * t)
                        orig_h = self.heights[r, c]
                        carved_h = bed_elevation + (orig_h - bed_elevation) * t_curve
                        self.heights[r, c] = min(orig_h, carved_h)
                        if perp_dist <= half_bed + 1.5:
                            self.tags[r, c] |= tag_mask

    # -------------------------------------------------------------------------
    # Slope, normal, and traversability analysis
    # -------------------------------------------------------------------------

    def compute_surface_normals(self) -> np.ndarray:
        """
        Compute unit surface normals (rows, cols, 3) float32 oriented +Z (up).
        """
        # Central differences with step 2 * grid_step
        gy, gx = np.gradient(self.heights, self.grid_step_m)

        # Tangent vectors: Tx = (1, 0, gx), Ty = (0, 1, gy)
        # Normal N = Tx x Ty = (-gx, -gy, 1)
        nx = -gx
        ny = -gy
        nz = np.ones_like(self.heights)

        length = np.hypot(np.hypot(nx, ny), nz)
        normals = np.stack([nx / length, ny / length, nz / length], axis=-1).astype(np.float32)
        return normals

    def compute_slope_degrees(self) -> np.ndarray:
        """
        Compute surface slope angle in degrees [0..90] for every grid cell.
        Slope theta = arccos(n_z).
        """
        normals = self.compute_surface_normals()
        nz = np.clip(normals[:, :, 2], 0.0, 1.0)
        return np.degrees(np.arccos(nz)).astype(np.float32)

    def analyze_traversability(self) -> dict:
        """
        Categorize terrain cells by traversability and overhang adherence.
        """
        slopes = self.compute_slope_degrees()
        total_cells = float(slopes.size)

        walkable_mask = slopes < SLOPE_WALKABLE_MAX_DEG
        scramble_mask = (slopes >= SLOPE_WALKABLE_MAX_DEG) & (slopes < SLOPE_SCRAMBLE_MAX_DEG)
        cliff_mask = slopes >= SLOPE_SCRAMBLE_MAX_DEG

        # Check ancient ruin areas (tag bit 2) for overhang constraint compliance
        ruin_mask = (self.tags & 2) != 0
        if ruin_mask.any():
            # In ruins, slope should ideally not exceed 45° (or stepped terraces)
            ruin_overhang_violation = (slopes > (OVERHANG_ANCIENT_DEG + 3.0)) & ruin_mask
            ruin_compliance_pct = 100.0 * (1.0 - float(ruin_overhang_violation.sum()) / float(ruin_mask.sum()))
        else:
            ruin_compliance_pct = 100.0

        return {
            "total_cells": int(total_cells),
            "walkable_pct": round(100.0 * float(walkable_mask.sum()) / total_cells, 2),
            "scramble_pct": round(100.0 * float(scramble_mask.sum()) / total_cells, 2),
            "cliff_pct": round(100.0 * float(cliff_mask.sum()) / total_cells, 2),
            "ancient_ruin_compliance_pct": round(ruin_compliance_pct, 2),
            "elevation_min_m": round(float(self.heights.min()), 3),
            "elevation_max_m": round(float(self.heights.max()), 3),
            "elevation_range_m": round(float(self.heights.max() - self.heights.min()), 3),
        }

    # -------------------------------------------------------------------------
    # Elevation Strata Slicer (for CSS 3D Parallax Stack)
    # -------------------------------------------------------------------------

    def slice_strata(self, num_strata: int = 4) -> list[TerrainStratum]:
        """
        Divide the continuous terrain heightfield into discrete elevation strata
        for the CSS 3D translateZ parallax layer stack.
        """
        z_min = float(self.heights.min())
        z_max = float(self.heights.max())
        span = max(z_max - z_min, 1.0)
        step = span / float(num_strata)

        slopes = self.compute_slope_degrees()
        strata: list[TerrainStratum] = []

        labels = ["valley_subfloor", "lowland_paths", "mid_plateau", "high_ridge_ruins"]
        css_z_steps = [0, 40, 95, 160]

        for idx in range(num_strata):
            sub_z0 = z_min + idx * step
            sub_z1 = z_min + (idx + 1) * step if idx < num_strata - 1 else z_max + 1e-4

            mask = (self.heights >= sub_z0) & (self.heights < sub_z1)
            cell_count = float(mask.sum())
            if cell_count > 0:
                walk_count = float((mask & (slopes < SLOPE_WALKABLE_MAX_DEG)).sum())
                nav_pct = 100.0 * (walk_count / cell_count)
            else:
                nav_pct = 0.0

            strata.append(
                TerrainStratum(
                    id=f"stratum_{idx}",
                    name=labels[idx % len(labels)],
                    z_min=round(sub_z0, 2),
                    z_max=round(sub_z1, 2),
                    css_z_px=css_z_steps[idx % len(css_z_steps)],
                    navigable_pct=round(nav_pct, 1),
                )
            )

        return strata

    # -------------------------------------------------------------------------
    # Binary STL 3D Mesh Exporter
    # -------------------------------------------------------------------------

    def export_stl(self, output_path: Path, solid_base: bool = True) -> int:
        """
        Export the 2.5D heightfield to a standard binary STL file.
        Format specification:
          - 80-byte header
          - 4-byte uint32 little-endian triangle count
          - For each triangle:
              - 3x float32 normal (nx, ny, nz)
              - 3x (3x float32 vertex: x, y, z)
              - 2-byte uint16 attribute byte count (0)
        Total file size = 84 + 50 * num_triangles bytes.
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        triangles: list[tuple[tuple[float, float, float], tuple[float, float, float], tuple[float, float, float]]] = []

        # 1. Top surface grid (2 triangles per cell)
        # Orientation: (X = East, Y = North/Forward in world space, Z = Up)
        for r in range(self.rows - 1):
            y0 = float(r * self.grid_step_m)
            y1 = float((r + 1) * self.grid_step_m)
            for c in range(self.cols - 1):
                x0 = float(c * self.grid_step_m)
                x1 = float((c + 1) * self.grid_step_m)

                z00 = float(self.heights[r, c])
                z01 = float(self.heights[r, c + 1])
                z10 = float(self.heights[r + 1, c])
                z11 = float(self.heights[r + 1, c + 1])

                # Upper-left triangle (00 -> 10 -> 01)
                triangles.append(((x0, y0, z00), (x0, y1, z10), (x1, y0, z01)))
                # Lower-right triangle (01 -> 10 -> 11)
                triangles.append(((x1, y0, z01), (x0, y1, z10), (x1, y1, z11)))

        # 2. Optional solid skirt base down to min_elevation - 1.0m (for 3D printing / water-tightness)
        if solid_base:
            base_z = float(self.heights.min() - 1.0)
            # North and South edges
            for c in range(self.cols - 1):
                x0 = float(c * self.grid_step_m)
                x1 = float((c + 1) * self.grid_step_m)
                # North edge (r = 0)
                z0, z1 = float(self.heights[0, c]), float(self.heights[0, c + 1])
                triangles.append(((x0, 0.0, z0), (x1, 0.0, z1), (x0, 0.0, base_z)))
                triangles.append(((x1, 0.0, z1), (x1, 0.0, base_z), (x0, 0.0, base_z)))

                # South edge (r = rows - 1)
                y_s = float((self.rows - 1) * self.grid_step_m)
                zs0, zs1 = float(self.heights[-1, c]), float(self.heights[-1, c + 1])
                triangles.append(((x0, y_s, zs0), (x0, y_s, base_z), (x1, y_s, zs1)))
                triangles.append(((x1, y_s, zs1), (x0, y_s, base_z), (x1, y_s, base_z)))

            # West and East edges
            for r in range(self.rows - 1):
                y0 = float(r * self.grid_step_m)
                y1 = float((r + 1) * self.grid_step_m)
                # West edge (c = 0)
                zw0, zw1 = float(self.heights[r, 0]), float(self.heights[r + 1, 0])
                triangles.append(((0.0, y0, zw0), (0.0, y0, base_z), (0.0, y1, zw1)))
                triangles.append(((0.0, y1, zw1), (0.0, y0, base_z), (0.0, y1, base_z)))

                # East edge (c = cols - 1)
                x_e = float((self.cols - 1) * self.grid_step_m)
                ze0, ze1 = float(self.heights[r, -1]), float(self.heights[r + 1, -1])
                triangles.append(((x_e, y0, ze0), (x_e, y1, ze1), (x_e, y0, base_z)))
                triangles.append(((x_e, y1, ze1), (x_e, y1, base_z), (x_e, y0, base_z)))

            # Bottom floor
            x_max = float((self.cols - 1) * self.grid_step_m)
            y_max = float((self.rows - 1) * self.grid_step_m)
            triangles.append(((0.0, 0.0, base_z), (x_max, 0.0, base_z), (0.0, y_max, base_z)))
            triangles.append(((x_max, 0.0, base_z), (x_max, y_max, base_z), (0.0, y_max, base_z)))

        # Write binary STL
        header = f"SpriteQuest Terrain: {self.name[:60]}".encode("ascii").ljust(80, b"\0")
        num_tri = len(triangles)

        with open(output_path, "wb") as f:
            f.write(header)
            f.write(struct.pack("<I", num_tri))

            for v0, v1, v2 in triangles:
                # Compute face normal via cross product
                ax, ay, az = v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]
                bx, by, bz = v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]
                nx = ay * bz - az * by
                ny = az * bx - ax * bz
                nz = ax * by - ay * bx
                norm = math.hypot(math.hypot(nx, ny), nz)
                if norm > 1e-9:
                    nx, ny, nz = nx / norm, ny / norm, nz / norm
                else:
                    nx, ny, nz = 0.0, 0.0, 1.0

                f.write(struct.pack(
                    "<12fH",
                    nx, ny, nz,
                    v0[0], v0[1], v0[2],
                    v1[0], v1[1], v1[2],
                    v2[0], v2[1], v2[2],
                    0,
                ))

        return num_tri

    # -------------------------------------------------------------------------
    # 2D Visual Maps (Elevation Relief, Normal Map, Topo Contours)
    # -------------------------------------------------------------------------

    def render_topdown_relief(self, contour_step_m: float = 2.0) -> Image.Image:
        """
        Render a high-contrast 2D topographic relief map:
          - North-West key elevation hillshading
          - Iso-contour lines (every contour_step_m metres)
          - Subtle slope tinting (cliffs = dark rock, plateaus = warm parchment)
        """
        normals = self.compute_surface_normals()
        slopes = self.compute_slope_degrees()

        # Oblique light from North-West (L = (-0.5, -0.5, 0.707))
        light = np.array([-0.5, -0.5, 0.707], dtype=np.float32)
        light /= np.linalg.norm(light)

        lam = np.clip((normals * light[None, None, :]).sum(axis=2), 0.0, 1.0)

        z_min = float(self.heights.min())
        z_max = float(self.heights.max())
        elev_norm = np.clip((self.heights - z_min) / max(z_max - z_min, 1.0), 0.0, 1.0)

        # Base tone: warm topographic parchment
        shade = 0.35 + 0.45 * lam + 0.20 * elev_norm

        # Iso-contour line calculation
        cont = np.fmod(self.heights, contour_step_m)
        gy_c, gx_c = np.gradient(cont)
        contour_mask = (np.hypot(gx_c, gy_c) > (contour_step_m * 0.45))

        # Cliff tinting: steep slopes get darkened into slate rock
        cliff_mask = slopes >= SLOPE_SCRAMBLE_MAX_DEG

        r = np.clip(shade * 230.0, 0, 255)
        g = np.clip(shade * 218.0, 0, 255)
        b = np.clip(shade * 198.0, 0, 255)

        # Darken cliffs
        r[cliff_mask] *= 0.65
        g[cliff_mask] *= 0.65
        b[cliff_mask] *= 0.68

        # Draw contour lines (dark sepia)
        r[contour_mask] = 48
        g[contour_mask] = 40
        b[contour_mask] = 34

        rgb = np.stack([r, g, b], axis=-1).astype(np.uint8)
        return Image.fromarray(rgb, mode="RGB")

    def render_z_depth_map(
        self,
        width: int = 1024,
        height: int = 1024,
        invert: bool = False,
    ) -> Image.Image:
        """
        Render a normalized 8-bit Z-depth map from the elevation heightfield.
        Elevations are mapped linearly:
          - invert=False: z_min -> 0 (black/distant), z_max -> 255 (white/highest peaks)
          - invert=True:  z_min -> 255, z_max -> 0 (optical distance from camera)
        Returns a PIL Image in mode 'L' resized to (width, height).
        """
        z_min = float(self.heights.min())
        z_max = float(self.heights.max())
        denom = max(z_max - z_min, 1e-6)
        norm = (self.heights - z_min) / denom
        if invert:
            norm = 1.0 - norm
        u8 = np.clip(norm * 255.0, 0, 255).astype(np.uint8)
        img = Image.fromarray(u8, mode="L")
        if (img.width, img.height) != (width, height):
            img = img.resize((width, height), Image.Resampling.BILINEAR)
        return img

    def render_stratum_layer(
        self,
        stratum_index: int,
        num_strata: int = 4,
        contour_step_m: float = 2.0,
        base_art: Image.Image | None = None,
    ) -> Image.Image:
        """
        Render an RGBA image containing ONLY the terrain geometry belonging to
        the given stratum elevation band [z_min, z_max]. Outside pixels have alpha=0.
        Essential for true CSS 3D parallax where upper strata reveal lower terrain.

        If base_art is provided (e.g. diffusion-rendered map art), it is used as the
        color plate with the stratum alpha mask applied. Otherwise, falls back to
        render_topdown_relief.
        """
        strata = self.slice_strata(num_strata=num_strata)
        if stratum_index < 0 or stratum_index >= len(strata):
            raise IndexError(f"Stratum index {stratum_index} out of range (0..{len(strata)-1})")

        s = strata[stratum_index]
        z_lo = s.z_min
        z_hi = s.z_max

        # Alpha mask calculation
        if stratum_index == 0:
            # Bottom stratum includes everything up to its upper boundary
            mask = self.heights <= z_hi
        elif stratum_index == len(strata) - 1:
            # Top stratum includes everything from its lower boundary up
            mask = self.heights >= z_lo
        else:
            mask = (self.heights >= z_lo) & (self.heights <= z_hi)

        alpha_arr = np.where(mask, 255, 0).astype(np.uint8)

        if base_art is not None:
            rgba = base_art.convert("RGBA").copy()
            alpha_img = Image.fromarray(alpha_arr, mode="L")
            if alpha_img.size != rgba.size:
                alpha_img = alpha_img.resize(rgba.size, Image.Resampling.BILINEAR)
            rgba.putalpha(alpha_img)
            return rgba

        relief = self.render_topdown_relief(contour_step_m=contour_step_m)
        relief_arr = np.asarray(relief, dtype=np.uint8)
        rgba_arr = np.dstack([relief_arr, alpha_arr])
        return Image.fromarray(rgba_arr, mode="RGBA")


def rasterize_stl_depth(
    stl_path: Path | str,
    width: int = 1024,
    height: int = 1024,
    invert: bool = False,
) -> Image.Image:
    """
    Directly parse a binary STL file and rasterize an orthographic top-down Z-depth map.
    Extracts surface vertices, resolves the top surface Z for every (x, y) grid point,
    normalizes elevation to [0, 255], and outputs an image resized to (width, height).
    """
    stl_path = Path(stl_path)
    if not stl_path.is_file():
        raise FileNotFoundError(f"STL file not found: {stl_path}")

    with open(stl_path, "rb") as f:
        _hdr = f.read(80)
        num_tri_raw = f.read(4)
        if len(num_tri_raw) < 4:
            raise ValueError(f"Corrupt STL header in {stl_path}")
        num_tri = struct.unpack("<I", num_tri_raw)[0]
        data = f.read(num_tri * 50)

    record_dtype = np.dtype([
        ("normal", "<f4", (3,)),
        ("v0", "<f4", (3,)),
        ("v1", "<f4", (3,)),
        ("v2", "<f4", (3,)),
        ("attr", "<u2")
    ])
    triangles = np.frombuffer(data, dtype=record_dtype)
    if len(triangles) == 0:
        return Image.new("L", (width, height), 0)

    # Surface points from all triangle vertices
    pts = np.concatenate([triangles["v0"], triangles["v1"], triangles["v2"]], axis=0)

    # Sort descending by Z so the highest vertex takes priority at each (X, Y)
    sort_order = np.argsort(-pts[:, 2])
    pts_sorted = pts[sort_order]

    # Unique by quantized (X, Y) coordinates (millimetre precision)
    xy_keys = np.round(pts_sorted[:, :2], 3)
    _, u_idx = np.unique(xy_keys, axis=0, return_index=True)
    top_pts = pts_sorted[u_idx]

    xs = top_pts[:, 0]
    ys = top_pts[:, 1]
    zs = top_pts[:, 2]

    x_min, x_max = float(xs.min()), float(xs.max())
    y_min, y_max = float(ys.min()), float(ys.max())
    z_min, z_max = float(zs.min()), float(zs.max())

    # Detect grid resolution
    u_xs = np.unique(np.round(xs, 3))
    dxs = np.diff(u_xs)
    step_x = float(dxs[dxs > 1e-4].min()) if len(dxs[dxs > 1e-4]) > 0 else 1.0

    u_ys = np.unique(np.round(ys, 3))
    dys = np.diff(u_ys)
    step_y = float(dys[dys > 1e-4].min()) if len(dys[dys > 1e-4]) > 0 else 1.0

    grid_cols = int(round((x_max - x_min) / step_x)) + 1
    grid_rows = int(round((y_max - y_min) / step_y)) + 1

    grid = np.full((grid_rows, grid_cols), z_min, dtype=np.float32)
    col_idx = np.clip(np.round((xs - x_min) / step_x).astype(int), 0, grid_cols - 1)
    row_idx = np.clip(np.round((ys - y_min) / step_y).astype(int), 0, grid_rows - 1)
    grid[row_idx, col_idx] = zs

    denom = max(z_max - z_min, 1e-6)
    norm = (grid - z_min) / denom
    if invert:
        norm = 1.0 - norm
    u8 = np.clip(norm * 255.0, 0, 255).astype(np.uint8)

    img = Image.fromarray(u8, mode="L")
    if (img.width, img.height) != (width, height):
        img = img.resize((width, height), Image.Resampling.BILINEAR)
    return img


def load_outdoor_map_scene(map_path: Path) -> tuple[TerrainMesh, dict]:
    """
    Load an outdoor map JSON declaration (library/maps/*.json), construct the
    continuous TerrainMesh, and stamp all build plates and terrain primitives.
    """
    data = json.loads(Path(map_path).read_text(encoding="utf-8"))
    scale = data.get("scale", {})
    dims = scale.get("dimensions", {"width": 100.0, "length": 100.0, "height": 20.0})
    step = float(scale.get("grid_step", 0.5))
    base_elev = float(scale.get("base_elevation", 0.0))

    tm = TerrainMesh(
        width_m=float(dims["width"]),
        length_m=float(dims["length"]),
        grid_step_m=step,
        base_elevation_m=base_elev,
        name=str(data.get("name", map_path.stem)),
    )

    # 1. Stamp terrain primitives
    for prim in data.get("primitives", []):
        ptype = prim.get("type")
        if ptype == "ridge_pass":
            start = prim["start"]
            end = prim["end"]
            tm.add_ridge_pass(
                start_x=float(start[0]),
                start_y=float(start[1]),
                end_x=float(end[0]),
                end_y=float(end[1]),
                pass_elevation=float(prim.get("pass_elevation", 4.0)),
                ridge_elevation=float(prim.get("ridge_elevation", 16.0)),
                pass_width=float(prim.get("pass_width", 8.0)),
                ridge_flank_width=float(prim.get("ridge_flank_width", 20.0)),
            )
        elif ptype == "ancient_ruin_buttress":
            c = prim["center"]
            tm.add_ancient_overhang_ruin(
                center_x=float(c[0]),
                center_y=float(c[1]),
                base_width=float(prim.get("base_width", 20.0)),
                base_length=float(prim.get("base_length", 20.0)),
                top_elevation=float(prim.get("top_elevation", 16.0)),
                base_elevation=float(prim.get("base_elevation", base_elev)),
                overhang_angle_deg=float(prim.get("overhang_angle_deg", OVERHANG_ANCIENT_DEG)),
            )
        elif ptype == "hill":
            c = prim["center"]
            tm.add_hill(
                center_x=float(c[0]),
                center_y=float(c[1]),
                height=float(prim.get("height", 10.0)),
                radius=float(prim.get("radius", 15.0)),
            )
        elif ptype == "canyon_gorge":
            start = prim["start"]
            end = prim["end"]
            tm.add_canyon_gorge(
                start_x=float(start[0]),
                start_y=float(start[1]),
                end_x=float(end[0]),
                end_y=float(end[1]),
                bed_elevation=float(prim.get("bed_elevation", base_elev)),
                bed_width=float(prim.get("bed_width", 6.0)),
                wall_slope_width=float(prim.get("wall_slope_width", 8.0)),
                tag_mask=int(prim.get("tag_mask", TAG_CANYON_GORGE)),
            )

    # 2. Stamp scene build plates (flattened ground foundations)
    for plate in data.get("build_plates", []):
        anchor = plate.get("anchor", {})
        footprint = plate.get("footprint", {})
        tm.add_flat_build_plate(
            center_x=float(anchor.get("center_x", 0.0)),
            center_y=float(anchor.get("center_y", 0.0)),
            width=float(footprint.get("width", 30.0)),
            length=float(footprint.get("length", 30.0)),
            elevation=float(anchor.get("elevation", base_elev + 4.0)),
            blend_margin=float(footprint.get("blend_margin", 3.0)),
            tag_mask=1,
        )

    return tm, data


def compile_outdoor_map_bundle(map_path: Path, out_dir: Path) -> dict:
    """
    Compile a complete outdoor map bundle:
      - Binary STL collision mesh (.stl)
      - Topographic relief image (topdown_relief.png)
      - Strata slicing metadata (strata.json)
      - Traversability & overhang adherence report (report.json)
    """
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    tm, map_data = load_outdoor_map_scene(map_path)
    stl_path = out_dir / f"{map_path.stem}.stl"
    tri_count = tm.export_stl(stl_path, solid_base=True)

    relief_img = tm.render_topdown_relief(contour_step_m=2.0)
    # Resize relief cleanly to 1024x1024 for crisp visual display
    relief_highres = relief_img.resize((1024, 1024), Image.Resampling.LANCZOS)
    img_path = out_dir / "topdown_relief.png"
    relief_highres.save(img_path)

    stats = tm.analyze_traversability()
    strata = tm.slice_strata(num_strata=len(map_data.get("strata", [])) or 4)

    strata_records = [
        {
            "id": s.id,
            "name": s.name,
            "z_min": s.z_min,
            "z_max": s.z_max,
            "css_z_px": s.css_z_px,
            "navigable_pct": s.navigable_pct,
        }
        for s in strata
    ]

    report = {
        "map_id": map_data.get("id", map_path.stem),
        "name": map_data.get("name", map_path.stem),
        "dimensions_m": {
            "width": tm.width_m,
            "length": tm.length_m,
            "elevation_range": stats["elevation_range_m"],
            "elevation_min": stats["elevation_min_m"],
            "elevation_max": stats["elevation_max_m"],
        },
        "grid_step_m": tm.grid_step_m,
        "grid_resolution": [tm.cols, tm.rows],
        "triangles": tri_count,
        "stl_file": str(stl_path.relative_to(REPO_ROOT) if stl_path.is_relative_to(REPO_ROOT) else stl_path),
        "traversability": stats,
        "strata": strata_records,
        "build_plates": map_data.get("build_plates", []),
        "initial_spawn": map_data.get("initial_spawn", {}),
    }

    report_path = out_dir / "map_manifest.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Create, analyze, and export 2.5D terrain heightfields to binary STL.")
    parser.add_argument("map", nargs="?", help="Path to outdoor map declaration JSON (library/maps/*.json)")
    parser.add_argument("--demo", action="store_true", help="Build and export a demo outdoor terrain map")
    parser.add_argument("--out", type=Path, default=None, help="Output directory")
    args = parser.parse_args()

    if args.map:
        map_path = Path(args.map)
        out_dir = args.out or (REPO_ROOT / "renders" / "maps" / map_path.stem)
        print(f"Compiling outdoor map bundle from {map_path} -> {out_dir} ...")
        report = compile_outdoor_map_bundle(map_path, out_dir)
        print(f"Compiled map: {report['name']} ({report['dimensions_m']['width']}m x {report['dimensions_m']['length']}m)")
        print(f"  - Triangles:    {report['triangles']:,} in {report['stl_file']}")
        print(f"  - Walkable:     {report['traversability']['walkable_pct']}%")
        print(f"  - Cliff:        {report['traversability']['cliff_pct']}%")
        print(f"  - Ruin Overhang Compliance: {report['traversability']['ancient_ruin_compliance_pct']}%")
        print(f"  - Strata Slices: {len(report['strata'])}")
        return 0

    if args.demo:
        print("Generating demo outdoor terrain: 80m x 80m @ 0.5m grid step...")
        tm = TerrainMesh(80.0, 80.0, grid_step_m=0.5, base_elevation_m=2.0, name="Border-March-Plateau")

        # 1. Level build plate for Customs House (36m x 60m at +6m elevation)
        tm.add_flat_build_plate(40.0, 40.0, width=32.0, length=44.0, elevation=6.0, blend_margin=4.0)

        # 2. East ridge pass
        tm.add_ridge_pass(start_x=40.0, start_y=62.0, end_x=40.0, end_y=80.0, pass_elevation=6.0, ridge_elevation=18.0)

        # 3. Ancient 45° overhang ruin buttress in northwest
        tm.add_ancient_overhang_ruin(center_x=16.0, center_y=16.0, base_width=18.0, base_length=18.0, top_elevation=14.0, overhang_angle_deg=45.0)

        stats = tm.analyze_traversability()
        print(f"Traversability: Walkable={stats['walkable_pct']}%, Scramble={stats['scramble_pct']}%, Cliff={stats['cliff_pct']}%")
        print(f"Ancient Overhang Rule Compliance: {stats['ancient_ruin_compliance_pct']}%")

        out_dir = args.out or (REPO_ROOT / "renders" / "terrain" / "demo-plateau")
        out_dir.mkdir(parents=True, exist_ok=True)
        stl_path = out_dir / "terrain_mesh.stl"
        tri_count = tm.export_stl(stl_path, solid_base=True)
        print(f"Exported binary STL: {stl_path} ({tri_count:,} triangles, {stl_path.stat().st_size / 1e6:.2f} MB)")

        relief_img = tm.render_topdown_relief(contour_step_m=2.0)
        img_path = out_dir / "terrain_relief.png"
        relief_img.save(img_path)
        print(f"Rendered topographic relief: {img_path}")

        strata = tm.slice_strata(num_strata=4)
        print(f"Sliced {len(strata)} elevation strata for CSS 3D parallax stack:")
        for s in strata:
            print(f"  - {s.id} ({s.name}): {s.z_min}m -> {s.z_max}m [CSS: translateZ({s.css_z_px}px)] Nav={s.navigable_pct}%")

    return 0


if __name__ == "__main__":
    sys.exit(main())
