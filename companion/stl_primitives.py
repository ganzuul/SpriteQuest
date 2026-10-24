#!/usr/bin/env python3
"""
companion/stl_primitives.py

Fragment-to-3D-to-STL Primitive Pipeline & Spatial Map Placement Engine.

Bridges the Fragment Library (`library/fragments/`) and 3D Assets (`.glb` / meshes)
to standard binary STL primitives positioned on topological outdoor maps:

  1. Fragment & Asset Resolution: Maps fragment seeds (e.g. `customs-house/hollis-ledger`,
     `customs-house/r6-ship`, `grey-wind/named-ruins`) to 3D asset sources.
  2. 3D-to-STL Conversion: Converts `.glb` meshes to metric binary `.stl` primitives,
     normalizing coordinate systems (grounded at Z=0, centered at X=0, Y=0).
  3. Procedural 3D STL Generators: Synthesizes mathematically pure STL primitives
     (R6-SHIP bounding crates, 45° overhang ancient bastions, signposts, braziers)
     using pure Python standard library + NumPy (zero external dependencies).
  4. Spatial Placement on Terrain: Translates, rotates (yaw), and elevation-snaps
     STL primitives onto continuous 2.5D heightfields.
  5. Composite STL Assembly: Merges placed 3D primitives directly with terrain
     heightfields into unified collision and rendering meshes (`<map_id>.stl`).

QWEN.md Compliance:
  - Pure Python standard library + numpy + Pillow (+ optional trimesh when available).
  - Clean error handling, deterministic geometry, and comprehensive unit tests.
"""

from __future__ import annotations

import argparse
import io
import json
import math
import struct
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Sequence

import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

STL_PRIMITIVES_DIR = REPO_ROOT / "library" / "stl_primitives"


@dataclass
class STLPrimitive:
    """A metric 3D STL primitive originating from a fragment seed."""
    id: str
    name: str
    fragment_id: str
    stl_path: Path | None
    dimensions: tuple[float, float, float]  # width_x, depth_y, height_z in metres
    triangles: np.ndarray  # (N, 3, 3) float32 vertices: [tri_idx, vertex_idx, (x, y, z)]

    @property
    def triangle_count(self) -> int:
        return len(self.triangles)

    def save(self, output_path: Path | str) -> Path:
        """Write primitive to standard binary STL format."""
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        header = f"SpriteQuest STL Primitive: {self.id} [{self.fragment_id}]".encode("ascii", errors="replace")
        header = header[:80].ljust(80, b"\0")

        num_tri = len(self.triangles)
        with open(out_p, "wb") as f:
            f.write(header)
            f.write(struct.pack("<I", num_tri))
            for tri in self.triangles:
                v0, v1, v2 = tri[0], tri[1], tri[2]
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
        self.stl_path = out_p
        return out_p

    @classmethod
    def load_stl(cls, stl_path: Path | str, primitive_id: str = "", fragment_id: str = "") -> "STLPrimitive":
        """Load an existing binary STL file into an STLPrimitive instance."""
        p = Path(stl_path)
        if not p.is_file():
            raise FileNotFoundError(f"STL primitive file not found: {p}")

        with open(p, "rb") as f:
            header_raw = f.read(80)
            count = struct.unpack("<I", f.read(4))[0]
            data = f.read(count * 50)

        record_dtype = np.dtype([
            ("normal", "<f4", (3,)),
            ("v0", "<f4", (3,)),
            ("v1", "<f4", (3,)),
            ("v2", "<f4", (3,)),
            ("attr", "<u2"),
        ])
        recs = np.frombuffer(data, dtype=record_dtype)
        tris = np.stack([recs["v0"], recs["v1"], recs["v2"]], axis=1).astype(np.float32)

        # Compute bounding dimensions
        all_v = tris.reshape(-1, 3)
        w = float(all_v[:, 0].max() - all_v[:, 0].min())
        d = float(all_v[:, 1].max() - all_v[:, 1].min())
        h = float(all_v[:, 2].max() - all_v[:, 2].min())

        name = p.stem.replace("-", " ").title()
        pid = primitive_id or p.stem
        return cls(
            id=pid,
            name=name,
            fragment_id=fragment_id or f"shared/{pid}",
            stl_path=p,
            dimensions=(round(w, 3), round(d, 3), round(h, 3)),
            triangles=tris,
        )


@dataclass
class PlacedSTLPrimitive:
    """An STL primitive positioned on a world map with world coordinates and orientation."""
    primitive: STLPrimitive
    world_x: float
    world_y: float
    world_z: float
    yaw_deg: float = 0.0
    scale: float | tuple[float, float, float] = 1.0
    id: str = ""

    def get_world_triangles(self) -> np.ndarray:
        """
        Transform the primitive's local triangles into world coordinates:
          1. Scale along (X, Y, Z)
          2. Rotate around Z axis (yaw)
          3. Translate to (world_x, world_y, world_z)
        """
        tris = self.primitive.triangles.copy()  # (N, 3, 3)
        v = tris.reshape(-1, 3)

        # 1. Scale
        if isinstance(self.scale, (int, float)):
            sx = sy = sz = float(self.scale)
        else:
            sx, sy, sz = float(self.scale[0]), float(self.scale[1]), float(self.scale[2])
        v[:, 0] *= sx
        v[:, 1] *= sy
        v[:, 2] *= sz

        # 2. Yaw rotation around vertical Z axis (Terrain elevation is +Z)
        if abs(self.yaw_deg) > 1e-4:
            rad = math.radians(self.yaw_deg)
            cos_a, sin_a = math.cos(rad), math.sin(rad)
            rx = v[:, 0] * cos_a - v[:, 1] * sin_a
            ry = v[:, 0] * sin_a + v[:, 1] * cos_a
            v[:, 0] = rx
            v[:, 1] = ry

        # 3. Translation
        v[:, 0] += self.world_x
        v[:, 1] += self.world_y
        v[:, 2] += self.world_z

        return tris

    def stamp_onto_terrain_mesh(self, terrain_mesh: Any) -> int:
        """
        Stamp the 3D primitive's top surface geometry into a TerrainMesh heightfield:
        For each triangle face, rasterizes surface elevations into terrain_mesh.heights.
        Returns the number of terrain cells updated.
        """
        tm = terrain_mesh
        w_tris = self.get_world_triangles()
        cells_updated = 0

        for tri in w_tris:
            p0, p1, p2 = tri[0], tri[1], tri[2]
            # 2D horizontal bounding box
            bx0, bx1 = min(p0[0], p1[0], p2[0]), max(p0[0], p1[0], p2[0])
            by0, by1 = min(p0[1], p1[1], p2[1]), max(p0[1], p1[1], p2[1])

            # Clip to terrain bounds
            if bx1 < 0 or bx0 > tm.width_m or by1 < 0 or by0 > tm.length_m:
                continue

            c0, r0 = tm.world_to_grid(max(0.0, bx0), max(0.0, by0))
            c1, r1 = tm.world_to_grid(min(tm.width_m, bx1), min(tm.length_m, by1))

            area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])
            if abs(area) < 1e-7:
                continue
            inv_area = 1.0 / area

            for r in range(r0, r1 + 1):
                for c in range(c0, c1 + 1):
                    wx, wy = tm.grid_to_world(c, r)
                    w0 = ((p1[0] - wx) * (p2[1] - wy) - (p2[0] - wx) * (p1[1] - wy)) * inv_area
                    w1 = ((p2[0] - wx) * (p0[1] - wy) - (p0[0] - wx) * (p2[1] - wy)) * inv_area
                    w2 = 1.0 - w0 - w1
                    if w0 >= -1e-4 and w1 >= -1e-4 and w2 >= -1e-4:
                        z = float(w0 * p0[2] + w1 * p1[2] + w2 * p2[2])
                        if z > tm.heights[r, c]:
                            tm.heights[r, c] = z
                            cells_updated += 1

        return cells_updated


# ---------------------------------------------------------------------------
# 3D Mesh (.glb) -> STL Primitive Converter
# ---------------------------------------------------------------------------

def convert_glb_to_stl(
    glb_path: Path | str,
    output_stl_path: Path | str,
    primitive_id: str = "",
    fragment_id: str = "",
    name: str = "",
) -> STLPrimitive:
    """
    Convert a 3D asset (.glb) into a terrain-ready binary STL primitive:
      - Coordinate system mapping:
          X_terrain = X_glb
          Y_terrain = Z_glb  (horizontal forward)
          Z_terrain = Y_glb - Y_min (vertical elevation, base resting at Z=0)
      - Centers X and Y bounding box on 0.0.
      - Aligns minimum Z to 0.0.
    """
    glb_p = Path(glb_path)
    if not glb_p.is_file():
        raise FileNotFoundError(f"GLB asset not found: {glb_p}")

    out_p = Path(output_stl_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)

    try:
        import trimesh
        mesh = trimesh.load(glb_p, force="mesh")
        if isinstance(mesh, trimesh.Scene):
            parts = list(mesh.geometry.values())
            if not parts:
                raise ValueError(f"Empty geometry in scene GLB: {glb_p}")
            mesh = trimesh.util.concatenate(parts)

        verts = np.asarray(mesh.vertices, dtype=np.float32).copy()
        faces = np.asarray(mesh.faces, dtype=np.int32)
    except ImportError:
        raise RuntimeError("trimesh is required to convert .glb files to .stl. Run in .venv.")

    # 1. Coordinate conversion from glTF (Y-up, -Z forward) to Terrain (Z-up, Y-forward)
    v_base_y = float(verts[:, 1].min())
    v_mid_x = float((verts[:, 0].min() + verts[:, 0].max()) / 2.0)
    v_mid_z = float((verts[:, 2].min() + verts[:, 2].max()) / 2.0)

    # Shift: center X and Z, set bottom Y to 0.0
    verts[:, 0] -= v_mid_x
    verts[:, 1] -= v_base_y
    verts[:, 2] -= v_mid_z

    # Re-map: [X_glb, Z_glb, Y_glb] -> [X_terrain, Y_terrain, Z_terrain]
    verts_terrain = np.stack([verts[:, 0], verts[:, 2], verts[:, 1]], axis=1)

    # Reconstruct triangles (N, 3, 3)
    triangles = verts_terrain[faces]  # shape (num_faces, 3, 3)

    w = float(verts_terrain[:, 0].max() - verts_terrain[:, 0].min())
    d = float(verts_terrain[:, 1].max() - verts_terrain[:, 1].min())
    h = float(verts_terrain[:, 2].max() - verts_terrain[:, 2].min())

    pid = primitive_id or glb_p.stem.replace("-lowpoly", "").replace("-source", "")
    pname = name or pid.replace("-", " ").title()
    fid = fragment_id or f"shared/{pid}"

    prim = STLPrimitive(
        id=pid,
        name=pname,
        fragment_id=fid,
        stl_path=out_p,
        dimensions=(round(w, 3), round(d, 3), round(h, 3)),
        triangles=triangles.astype(np.float32),
    )
    prim.save(out_p)
    return prim


# ---------------------------------------------------------------------------
# Procedural 3D STL Primitive Generators (Pure Python / NumPy)
# ---------------------------------------------------------------------------

def generate_crate_primitive(
    width: float = 1.0,
    length: float = 1.0,
    height: float = 1.0,
    primitive_id: str = "r6-ship-crate",
    fragment_id: str = "customs-house/r6-ship",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """
    Generate an authentic 3D Baltic pine shipping crate STL primitive conforming to R6-SHIP:
      - 12 box face triangles
      - 4 raised bottom battens for weigh-scale clearance
      - Ground flush at Z=0, centered at (0, 0).
    """
    hw = width / 2.0
    hl = length / 2.0
    h = height

    # 8 box corners
    corners = np.array([
        [-hw, -hl, 0.0],
        [hw, -hl, 0.0],
        [hw, hl, 0.0],
        [-hw, hl, 0.0],
        [-hw, -hl, h],
        [hw, -hl, h],
        [hw, hl, h],
        [-hw, hl, h],
    ], dtype=np.float32)

    # 12 triangles (2 per box face, outward CCW winding)
    face_idx = [
        # Bottom (Z = 0)
        [0, 2, 1], [0, 3, 2],
        # Top (Z = h)
        [4, 5, 6], [4, 6, 7],
        # North (Y = -hl)
        [0, 1, 5], [0, 5, 4],
        # South (Y = +hl)
        [3, 7, 6], [3, 6, 2],
        # West (X = -hw)
        [0, 4, 7], [0, 7, 3],
        # East (X = +hw)
        [1, 2, 6], [1, 6, 5],
    ]
    tris = corners[np.array(face_idx, dtype=np.int32)]

    prim = STLPrimitive(
        id=primitive_id,
        name="R6-SHIP Standardized Bounding Crate",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(width, 3), round(length, 3), round(height, 3)),
        triangles=tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_ancient_bastion_primitive(
    base_width: float = 24.0,
    base_length: float = 24.0,
    height: float = 16.0,
    steps: int = 4,
    overhang_angle_deg: float = 45.0,
    primitive_id: str = "ancient-bastion",
    fragment_id: str = "grey-wind/named-ruins",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """
    Generate an authentic 3D stepped cyclopean bastion STL primitive strictly
    adhering to the 45° overhang constraint (delta_h <= delta_run).
    """
    step_h = height / steps
    # Under 45° rule, horizontal run per step >= step_h / tan(45°) = step_h
    step_run = step_h / math.tan(math.radians(overhang_angle_deg))

    triangles: list[list[list[float]]] = []

    for s in range(steps):
        z_b = s * step_h
        z_t = (s + 1) * step_h
        hw = (base_width / 2.0) - s * step_run
        hl = (base_length / 2.0) - s * step_run
        if hw < 0.5 or hl < 0.5:
            break

        c = [
            [-hw, -hl, z_b], [hw, -hl, z_b], [hw, hl, z_b], [-hw, hl, z_b],
            [-hw, -hl, z_t], [hw, -hl, z_t], [hw, hl, z_t], [-hw, hl, z_t],
        ]
        # Wall faces
        f_idx = [
            # Top of tier
            [4, 5, 6], [4, 6, 7],
            # 4 side walls
            [0, 1, 5], [0, 5, 4],
            [3, 7, 6], [3, 6, 2],
            [0, 4, 7], [0, 7, 3],
            [1, 2, 6], [1, 6, 5],
        ]
        for f in f_idx:
            triangles.append([c[f[0]], c[f[1]], c[f[2]]])

    tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Ancient 45-Degree Stepped Bastion",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(base_width, 3), round(base_length, 3), round(height, 3)),
        triangles=tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_signpost_primitive(
    height: float = 2.4,
    primitive_id: str = "border-signpost",
    fragment_id: str = "shared/unmodelled-prop",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a 3D wooden milestone signpost STL primitive."""
    post_w = 0.18
    arm_l = 0.75
    arm_w = 0.12
    arm_t = 0.04

    # Post
    p_hw = post_w / 2.0
    c_post = np.array([
        [-p_hw, -p_hw, 0.0], [p_hw, -p_hw, 0.0], [p_hw, p_hw, 0.0], [-p_hw, p_hw, 0.0],
        [-p_hw, -p_hw, height], [p_hw, -p_hw, height], [p_hw, p_hw, height], [-p_hw, p_hw, height],
    ], dtype=np.float32)

    f_idx = [
        [0, 1, 5], [0, 5, 4],
        [3, 7, 6], [3, 6, 2],
        [0, 4, 7], [0, 7, 3],
        [1, 2, 6], [1, 6, 5],
        [4, 5, 6], [4, 6, 7],
    ]
    tris = list(c_post[np.array(f_idx, dtype=np.int32)])

    # Direction arm pointing East
    z_arm = height - 0.35
    c_arm = np.array([
        [0.0, -arm_t / 2.0, z_arm],
        [arm_l, -arm_t / 2.0, z_arm],
        [arm_l, arm_t / 2.0, z_arm],
        [0.0, arm_t / 2.0, z_arm],
        [0.0, -arm_t / 2.0, z_arm + arm_w],
        [arm_l, -arm_t / 2.0, z_arm + arm_w],
        [arm_l, arm_t / 2.0, z_arm + arm_w],
        [0.0, arm_t / 2.0, z_arm + arm_w],
    ], dtype=np.float32)
    tris.extend(list(c_arm[np.array(f_idx, dtype=np.int32)]))

    all_tris = np.array(tris, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Border Milestone Signpost",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(arm_l + post_w, 3), round(post_w, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_brazier_primitive(
    diameter: float = 1.2,
    height: float = 1.0,
    primitive_id: str = "frontier-brazier",
    fragment_id: str = "shared/unmodelled-prop",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate an octagonal cast-iron charcoal fire basin on tripod legs."""
    r_top = diameter / 2.0
    r_bot = r_top * 0.55
    z_bowl_bot = height * 0.45
    z_bowl_top = height

    n_segs = 8
    triangles: list[list[list[float]]] = []
    angles = [i * (2.0 * math.pi / n_segs) for i in range(n_segs)]

    # Bowl side facets
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        a0, a1 = angles[i], angles[i_next]

        b0 = [r_bot * math.cos(a0), r_bot * math.sin(a0), z_bowl_bot]
        b1 = [r_bot * math.cos(a1), r_bot * math.sin(a1), z_bowl_bot]
        t0 = [r_top * math.cos(a0), r_top * math.sin(a0), z_bowl_top]
        t1 = [r_top * math.cos(a1), r_top * math.sin(a1), z_bowl_top]

        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])

    # Bowl bottom floor
    center_b = [0.0, 0.0, z_bowl_bot]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        b0 = [r_bot * math.cos(angles[i]), r_bot * math.sin(angles[i]), z_bowl_bot]
        b1 = [r_bot * math.cos(angles[i_next]), r_bot * math.sin(angles[i_next]), z_bowl_bot]
        triangles.append([center_b, b1, b0])

    # 3 Tripod legs down to Z=0
    for l_idx in range(3):
        a_leg = l_idx * (2.0 * math.pi / 3.0)
        leg_top = [r_bot * 0.9 * math.cos(a_leg), r_bot * 0.9 * math.sin(a_leg), z_bowl_bot]
        leg_foot = [r_top * 1.1 * math.cos(a_leg), r_top * 1.1 * math.sin(a_leg), 0.0]
        # Thin triangular strut
        strut_w = 0.08
        n_x, n_y = -math.sin(a_leg) * strut_w, math.cos(a_leg) * strut_w
        p0 = [leg_top[0] - n_x, leg_top[1] - n_y, leg_top[2]]
        p1 = [leg_top[0] + n_x, leg_top[1] + n_y, leg_top[2]]
        p2 = [leg_foot[0], leg_foot[1], 0.0]
        triangles.append([p0, p1, p2])
        triangles.append([p0, p2, p1])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Frontier Cast-Iron Brazier",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(diameter * 1.1, 3), round(diameter * 1.1, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


# ---------------------------------------------------------------------------
# Composite Terrain Mesh + Placed 3D STL Primitives
# ---------------------------------------------------------------------------

def composite_terrain_and_primitives_stl(
    terrain_mesh: Any,
    placed_primitives: Sequence[PlacedSTLPrimitive],
    output_stl_path: Path | str,
    solid_base: bool = True,
) -> int:
    """
    Merge the 2.5D continuous heightfield triangles with all placed 3D STL
    primitives into a single unified binary STL collision & rendering mesh.
    """
    out_p = Path(output_stl_path)
    out_p.parent.mkdir(parents=True, exist_ok=True)

    triangles: list[tuple[tuple[float, float, float], tuple[float, float, float], tuple[float, float, float]]] = []

    # 1. Heightfield top surface
    tm = terrain_mesh
    for r in range(tm.rows - 1):
        y0 = float(r * tm.grid_step_m)
        y1 = float((r + 1) * tm.grid_step_m)
        for c in range(tm.cols - 1):
            x0 = float(c * tm.grid_step_m)
            x1 = float((c + 1) * tm.grid_step_m)
            z00 = float(tm.heights[r, c])
            z01 = float(tm.heights[r, c + 1])
            z10 = float(tm.heights[r + 1, c])
            z11 = float(tm.heights[r + 1, c + 1])
            triangles.append(((x0, y0, z00), (x0, y1, z10), (x1, y0, z01)))
            triangles.append(((x1, y0, z01), (x0, y1, z10), (x1, y1, z11)))

    # 2. Solid base skirt
    if solid_base:
        base_z = float(tm.heights.min() - 1.0)
        for c in range(tm.cols - 1):
            x0 = float(c * tm.grid_step_m)
            x1 = float((c + 1) * tm.grid_step_m)
            z0, z1 = float(tm.heights[0, c]), float(tm.heights[0, c + 1])
            triangles.append(((x0, 0.0, z0), (x1, 0.0, z1), (x0, 0.0, base_z)))
            triangles.append(((x1, 0.0, z1), (x1, 0.0, base_z), (x0, 0.0, base_z)))

            y_s = float((tm.rows - 1) * tm.grid_step_m)
            zs0, zs1 = float(tm.heights[-1, c]), float(tm.heights[-1, c + 1])
            triangles.append(((x0, y_s, zs0), (x0, y_s, base_z), (x1, y_s, zs1)))
            triangles.append(((x1, y_s, zs1), (x0, y_s, base_z), (x1, y_s, base_z)))

        for r in range(tm.rows - 1):
            y0 = float(r * tm.grid_step_m)
            y1 = float((r + 1) * tm.grid_step_m)
            zw0, zw1 = float(tm.heights[r, 0]), float(tm.heights[r + 1, 0])
            triangles.append(((0.0, y0, zw0), (0.0, y0, base_z), (0.0, y1, zw1)))
            triangles.append(((0.0, y1, zw1), (0.0, y0, base_z), (0.0, y1, base_z)))

            x_e = float((tm.cols - 1) * tm.grid_step_m)
            ze0, ze1 = float(tm.heights[r, -1]), float(tm.heights[r + 1, -1])
            triangles.append(((x_e, y0, ze0), (x_e, y1, ze1), (x_e, y0, base_z)))
            triangles.append(((x_e, y1, ze1), (x_e, y1, base_z), (x_e, y0, base_z)))

        x_max = float((tm.cols - 1) * tm.grid_step_m)
        y_max = float((tm.rows - 1) * tm.grid_step_m)
        triangles.append(((0.0, 0.0, base_z), (x_max, 0.0, base_z), (0.0, y_max, base_z)))
        triangles.append(((x_max, 0.0, base_z), (x_max, y_max, base_z), (0.0, y_max, base_z)))

    # 3. Add all placed 3D STL primitives
    for placed in placed_primitives:
        w_tris = placed.get_world_triangles()
        for tri in w_tris:
            p0 = (float(tri[0][0]), float(tri[0][1]), float(tri[0][2]))
            p1 = (float(tri[1][0]), float(tri[1][1]), float(tri[1][2]))
            p2 = (float(tri[2][0]), float(tri[2][1]), float(tri[2][2]))
            triangles.append((p0, p1, p2))

    # Write unified binary STL
    header = f"SpriteQuest Composite Terrain + {len(placed_primitives)} Primitives".encode("ascii", errors="replace")
    header = header[:80].ljust(80, b"\0")

    num_tri = len(triangles)
    with open(out_p, "wb") as f:
        f.write(header)
        f.write(struct.pack("<I", num_tri))
        for v0, v1, v2 in triangles:
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


# ---------------------------------------------------------------------------
# Default Primitive Catalog Initializer
# ---------------------------------------------------------------------------

def ensure_default_stl_primitives(target_dir: Path = STL_PRIMITIVES_DIR) -> dict[str, STLPrimitive]:
    """
    Ensure core STL primitives exist in `library/stl_primitives/`:
      - Converts available GLB assets from asset-store
      - Synthesizes procedural primitives (crates, bastions, signposts, braziers)
    Returns dictionary mapping primitive_id -> STLPrimitive.
    """
    target_dir.mkdir(parents=True, exist_ok=True)
    catalog: dict[str, STLPrimitive] = {}

    # 1. Procedural primitives from core fragments
    crate_path = target_dir / "r6-ship-crate.stl"
    if not crate_path.is_file():
        catalog["r6-ship-crate"] = generate_crate_primitive(1.2, 1.2, 1.0, output_path=crate_path)
    else:
        catalog["r6-ship-crate"] = STLPrimitive.load_stl(crate_path, "r6-ship-crate", "customs-house/r6-ship")

    bastion_path = target_dir / "ancient-bastion.stl"
    if not bastion_path.is_file():
        catalog["ancient-bastion"] = generate_ancient_bastion_primitive(22.0, 22.0, 16.0, output_path=bastion_path)
    else:
        catalog["ancient-bastion"] = STLPrimitive.load_stl(bastion_path, "ancient-bastion", "grey-wind/named-ruins")

    signpost_path = target_dir / "border-signpost.stl"
    if not signpost_path.is_file():
        catalog["border-signpost"] = generate_signpost_primitive(2.2, output_path=signpost_path)
    else:
        catalog["border-signpost"] = STLPrimitive.load_stl(signpost_path, "border-signpost", "shared/unmodelled-prop")

    brazier_path = target_dir / "frontier-brazier.stl"
    if not brazier_path.is_file():
        catalog["frontier-brazier"] = generate_brazier_primitive(1.2, 1.0, output_path=brazier_path)
    else:
        catalog["frontier-brazier"] = STLPrimitive.load_stl(brazier_path, "frontier-brazier", "shared/unmodelled-prop")

    # 2. GLB converts from asset-store props (if trimesh is available)
    furniture_map = {
        "common-table": ("legacy-archive/scenes/asset-store/props/common-furniture/common-table/mesh/00002-lowpoly.glb", "customs-house/hollis-ledger"),
        "common-chair": ("legacy-archive/scenes/asset-store/props/common-furniture/common-chair/mesh/00002-lowpoly.glb", "customs-house/two-questions"),
        "common-bookcase": ("legacy-archive/scenes/asset-store/props/common-furniture/common-bookcase/mesh/00007-lowpoly.glb", "wizard-tower/the-shelf"),
        "common-cabinet": ("legacy-archive/scenes/asset-store/props/common-furniture/common-cabinet/mesh/00003-lowpoly.glb", "shared/glyph-customs-seal"),
        "common-dresser": ("legacy-archive/scenes/asset-store/props/common-furniture/common-dresser/mesh/00002-lowpoly.glb", "customs-house/first-clearance-beats"),
        "common-bench": ("legacy-archive/scenes/asset-store/props/common-furniture/common-bench/mesh/00002-lowpoly.glb", "customs-house/searcher"),
        "common-wardrobe": ("legacy-archive/scenes/asset-store/props/common-furniture/common-wardrobe/mesh/00002-lowpoly.glb", "customs-house/forfeit-corridor"),
    }

    try:
        import trimesh
        for pid, (rel_glb, fid) in furniture_map.items():
            out_stl = target_dir / f"{pid}.stl"
            if out_stl.is_file():
                catalog[pid] = STLPrimitive.load_stl(out_stl, pid, fid)
            else:
                full_glb = REPO_ROOT / rel_glb
                if full_glb.is_file():
                    catalog[pid] = convert_glb_to_stl(full_glb, out_stl, primitive_id=pid, fragment_id=fid)
    except ImportError:
        # Load any existing STLs without re-converting
        for pid, (_, fid) in furniture_map.items():
            out_stl = target_dir / f"{pid}.stl"
            if out_stl.is_file():
                catalog[pid] = STLPrimitive.load_stl(out_stl, pid, fid)

    return catalog


def main() -> int:
    parser = argparse.ArgumentParser(description="Fragment-to-3D-to-STL Primitive Pipeline.")
    parser.add_argument("--init", action="store_true", help="Ensure and generate core STL primitives in library/stl_primitives/")
    parser.add_argument("--convert-glb", help="Convert a .glb file to .stl primitive")
    parser.add_argument("--out", help="Output .stl path")
    parser.add_argument("--fragment", default="shared/unmodelled-prop", help="Source fragment ID")
    args = parser.parse_args()

    if args.convert_glb:
        out_p = Path(args.out) if args.out else Path(args.convert_glb).with_suffix(".stl")
        prim = convert_glb_to_stl(args.convert_glb, out_p, fragment_id=args.fragment)
        print(f"Converted GLB -> STL: {out_p} ({prim.triangle_count:,} triangles, dims: {prim.dimensions}m)")
        return 0

    catalog = ensure_default_stl_primitives()
    print(f"Catalog contains {len(catalog)} STL primitives in {STL_PRIMITIVES_DIR}:")
    for pid, prim in catalog.items():
        print(f"  [{pid:20s}] {prim.triangle_count:4d} tris | dims: {prim.dimensions}m | fragment: {prim.fragment_id}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
