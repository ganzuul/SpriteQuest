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


def generate_stasis_coffin_primitive(
    width: float = 0.85,
    length: float = 2.20,
    height: float = 0.70,
    primitive_id: str = "glass-stasis-coffin",
    fragment_id: str = "space-vampires/glass-stasis-coffin",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a hexagonal borosilicate stasis coffin STL primitive."""
    rx = width / 2.0
    rz = height / 2.0
    y_half = length / 2.0

    # Angles with top apex at 90 deg and bottom apex at 270 deg (touches z=0)
    angles = [math.pi / 6.0 + i * (math.pi / 3.0) for i in range(6)]
    zc = rz  # so z ranges from 0.0 to height
    front_ring = [[rx * math.cos(a), -y_half, zc + rz * math.sin(a)] for a in angles]
    back_ring = [[rx * math.cos(a), y_half, zc + rz * math.sin(a)] for a in angles]

    triangles: list[list[list[float]]] = []

    # Front cap (at y = -y_half)
    center_f = [0.0, -y_half, zc]
    for i in range(6):
        i_next = (i + 1) % 6
        triangles.append([center_f, front_ring[i], front_ring[i_next]])

    # Back cap (at y = +y_half)
    center_b = [0.0, y_half, zc]
    for i in range(6):
        i_next = (i + 1) % 6
        triangles.append([center_b, back_ring[i_next], back_ring[i]])

    # 6 Longitudinal side facets
    for i in range(6):
        i_next = (i + 1) % 6
        f0, f1 = front_ring[i], front_ring[i_next]
        b0, b1 = back_ring[i], back_ring[i_next]
        triangles.append([f0, b0, b1])
        triangles.append([f0, b1, f1])

    # Borosilicate chamfered lid crest along the top vertex (at i=1, 90 deg)
    z_crest = height + 0.06
    c0 = [0.0, -y_half * 0.85, z_crest]
    c1 = [0.0, y_half * 0.85, z_crest]
    f_t0, f_t1, f_t2 = front_ring[0], front_ring[1], front_ring[2]
    b_t0, b_t1, b_t2 = back_ring[0], back_ring[1], back_ring[2]
    triangles.append([f_t1, c0, b_t1])
    triangles.append([b_t1, c0, c1])
    triangles.append([f_t0, f_t1, c0])
    triangles.append([f_t1, f_t2, c0])
    triangles.append([b_t1, b_t0, c1])
    triangles.append([b_t2, b_t1, c1])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Hexagonal Borosilicate Stasis Coffin",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(width, 3), round(length, 3), round(height + 0.06, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_relic_cairn_primitive(
    base_radius: float = 0.90,
    height: float = 1.60,
    primitive_id: str = "relic-cairn",
    fragment_id: str = "cartographers/epistemic-survey",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a stepped dry-stone conical cairn with central theodolite mount."""
    n_segs = 8
    angles = [i * (2.0 * math.pi / n_segs) for i in range(n_segs)]
    triangles: list[list[list[float]]] = []

    tiers = [
        (0.00, 0.35, base_radius, base_radius * 0.85),
        (0.35, 0.70, base_radius * 0.82, base_radius * 0.68),
        (0.70, 1.00, base_radius * 0.65, base_radius * 0.50),
        (1.00, 1.25, base_radius * 0.48, base_radius * 0.35),
    ]

    for z0, z1, r0, r1 in tiers:
        for i in range(n_segs):
            i_next = (i + 1) % n_segs
            a0, a1 = angles[i], angles[i_next]
            b0 = [r0 * math.cos(a0), r0 * math.sin(a0), z0]
            b1 = [r0 * math.cos(a1), r0 * math.sin(a1), z0]
            t0 = [r1 * math.cos(a0), r1 * math.sin(a0), z1]
            t1 = [r1 * math.cos(a1), r1 * math.sin(a1), z1]
            triangles.append([b0, b1, t1])
            triangles.append([b0, t1, t0])

    r_top = base_radius * 0.35
    center_top = [0.0, 0.0, 1.25]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        p0 = [r_top * math.cos(angles[i]), r_top * math.sin(angles[i]), 1.25]
        p1 = [r_top * math.cos(angles[i_next]), r_top * math.sin(angles[i_next]), 1.25]
        triangles.append([center_top, p0, p1])

    center_bot = [0.0, 0.0, 0.0]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        p0 = [base_radius * math.cos(angles[i]), base_radius * math.sin(angles[i]), 0.0]
        p1 = [base_radius * math.cos(angles[i_next]), base_radius * math.sin(angles[i_next]), 0.0]
        triangles.append([center_bot, p1, p0])

    r_post = 0.08
    z_post_top = height
    center_post = [0.0, 0.0, z_post_top]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        a0, a1 = angles[i], angles[i_next]
        pb0 = [r_post * math.cos(a0), r_post * math.sin(a0), 1.25]
        pb1 = [r_post * math.cos(a1), r_post * math.sin(a1), 1.25]
        pt0 = [r_post * math.cos(a0), r_post * math.sin(a0), z_post_top]
        pt1 = [r_post * math.cos(a1), r_post * math.sin(a1), z_post_top]
        triangles.append([pb0, pb1, pt1])
        triangles.append([pb0, pt1, pt0])
        triangles.append([center_post, pt0, pt1])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Cartographer Relic Cairn & Theodolite Station",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(base_radius * 2.0, 3), round(base_radius * 2.0, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_wish_stone_primitive(
    width: float = 3.0,
    length: float = 8.0,
    thickness: float = 0.60,
    primitive_id: str = "wish-stone-slab",
    fragment_id: str = "grey-wind/wish-granting",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a monolithic quarried granite/slate bridge slab with chiseled edges."""
    hw = width / 2.0
    hl = length / 2.0
    chamfer = min(0.15, thickness * 0.25)

    top_hw = hw - chamfer
    top_hl = hl - chamfer
    c_top = [
        [-top_hw, -top_hl, thickness], [top_hw, -top_hl, thickness],
        [top_hw, top_hl, thickness], [-top_hw, top_hl, thickness],
    ]
    c_mid_t = [
        [-hw, -hl, thickness - chamfer], [hw, -hl, thickness - chamfer],
        [hw, hl, thickness - chamfer], [-hw, hl, thickness - chamfer],
    ]
    c_bot = [
        [-hw, -hl, 0.0], [hw, -hl, 0.0],
        [hw, hl, 0.0], [-hw, hl, 0.0],
    ]

    triangles: list[list[list[float]]] = []

    triangles.append([c_top[0], c_top[1], c_top[2]])
    triangles.append([c_top[0], c_top[2], c_top[3]])

    triangles.append([c_bot[0], c_bot[2], c_bot[1]])
    triangles.append([c_bot[0], c_bot[3], c_bot[2]])

    for i in range(4):
        i_next = (i + 1) % 4
        triangles.append([c_top[i], c_top[i_next], c_mid_t[i_next]])
        triangles.append([c_top[i], c_mid_t[i_next], c_mid_t[i]])

    for i in range(4):
        i_next = (i + 1) % 4
        triangles.append([c_bot[i], c_bot[i_next], c_mid_t[i_next]])
        triangles.append([c_bot[i], c_mid_t[i_next], c_mid_t[i]])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Orom's Literal Wish-Stone Slab",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(width, 3), round(length, 3), round(thickness, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_entropy_beacon_primitive(
    base_width: float = 0.90,
    height: float = 3.20,
    primitive_id: str = "cryo-entropy-beacon",
    fragment_id: str = "space-vampires/glyph-entropy-matrix",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a tapered obsidian cryo-entropy beacon monolith with pyramidion apex."""
    bw = base_width / 2.0
    triangles: list[list[list[float]]] = []

    sw = bw * 1.3
    c_base = [
        [-sw, -sw, 0.0], [sw, -sw, 0.0], [sw, sw, 0.0], [-sw, sw, 0.0],
        [-sw, -sw, 0.35], [sw, -sw, 0.35], [sw, sw, 0.35], [-sw, sw, 0.35],
    ]
    f_idx = [
        [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
        [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
        [0, 3, 2], [0, 2, 1],
    ]
    for f in f_idx:
        triangles.append([c_base[f[0]], c_base[f[1]], c_base[f[2]]])

    z_shaft_top = height * 0.85
    tw = bw * 0.55
    c_shaft_bot = [[-bw, -bw, 0.35], [bw, -bw, 0.35], [bw, bw, 0.35], [-bw, bw, 0.35]]
    c_shaft_top = [[-tw, -tw, z_shaft_top], [tw, -tw, z_shaft_top], [tw, tw, z_shaft_top], [-tw, tw, z_shaft_top]]
    for i in range(4):
        i_next = (i + 1) % 4
        triangles.append([c_shaft_bot[i], c_shaft_bot[i_next], c_shaft_top[i_next]])
        triangles.append([c_shaft_bot[i], c_shaft_top[i_next], c_shaft_top[i]])

    apex = [0.0, 0.0, height]
    for i in range(4):
        i_next = (i + 1) % 4
        triangles.append([c_shaft_top[i], c_shaft_top[i_next], apex])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Cryo-Entropy Beacon Monolith",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(base_width * 1.3, 3), round(base_width * 1.3, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_glass_column_primitive(
    base_radius: float = 1.50,
    height: float = 45.00,
    primitive_id: str = "glass-column-fluted",
    fragment_id: str = "wizard-tower/glass-cathedral",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a 16-fluted asteroid-glass cathedral column with base and capital."""
    n_flutes = 16
    angles = [i * (2.0 * math.pi / n_flutes) for i in range(n_flutes)]
    triangles: list[list[list[float]]] = []

    r_shaft_out = base_radius * 0.90
    r_shaft_in = base_radius * 0.78
    r_flutes = [r_shaft_out if (i % 2 == 0) else r_shaft_in for i in range(n_flutes)]

    z_base_plinth = 1.5
    z_shaft_start = 3.0
    z_shaft_end = height - 3.0
    z_top = height

    r_plinth = base_radius * 1.15
    r_capital = base_radius * 1.25

    center_bot = [0.0, 0.0, 0.0]
    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        p0 = [r_plinth * math.cos(angles[i]), r_plinth * math.sin(angles[i]), 0.0]
        p1 = [r_plinth * math.cos(angles[i_next]), r_plinth * math.sin(angles[i_next]), 0.0]
        triangles.append([center_bot, p1, p0])

    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        b0 = [r_plinth * math.cos(angles[i]), r_plinth * math.sin(angles[i]), 0.0]
        b1 = [r_plinth * math.cos(angles[i_next]), r_plinth * math.sin(angles[i_next]), 0.0]
        t0 = [r_plinth * math.cos(angles[i]), r_plinth * math.sin(angles[i]), z_base_plinth]
        t1 = [r_plinth * math.cos(angles[i_next]), r_plinth * math.sin(angles[i_next]), z_base_plinth]
        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])

    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        b0 = [r_plinth * math.cos(angles[i]), r_plinth * math.sin(angles[i]), z_base_plinth]
        b1 = [r_plinth * math.cos(angles[i_next]), r_plinth * math.sin(angles[i_next]), z_base_plinth]
        t0 = [r_flutes[i] * math.cos(angles[i]), r_flutes[i] * math.sin(angles[i]), z_shaft_start]
        t1 = [r_flutes[i_next] * math.cos(angles[i_next]), r_flutes[i_next] * math.sin(angles[i_next]), z_shaft_start]
        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])

    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        b0 = [r_flutes[i] * math.cos(angles[i]), r_flutes[i] * math.sin(angles[i]), z_shaft_start]
        b1 = [r_flutes[i_next] * math.cos(angles[i_next]), r_flutes[i_next] * math.sin(angles[i_next]), z_shaft_start]
        t0 = [r_flutes[i] * math.cos(angles[i]), r_flutes[i] * math.sin(angles[i]), z_shaft_end]
        t1 = [r_flutes[i_next] * math.cos(angles[i_next]), r_flutes[i_next] * math.sin(angles[i_next]), z_shaft_end]
        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])

    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        b0 = [r_flutes[i] * math.cos(angles[i]), r_flutes[i] * math.sin(angles[i]), z_shaft_end]
        b1 = [r_flutes[i_next] * math.cos(angles[i_next]), r_flutes[i_next] * math.sin(angles[i_next]), z_shaft_end]
        t0 = [r_capital * math.cos(angles[i]), r_capital * math.sin(angles[i]), z_top]
        t1 = [r_capital * math.cos(angles[i_next]), r_capital * math.sin(angles[i_next]), z_top]
        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])

    center_top = [0.0, 0.0, z_top]
    for i in range(n_flutes):
        i_next = (i + 1) % n_flutes
        p0 = [r_capital * math.cos(angles[i]), r_capital * math.sin(angles[i]), z_top]
        p1 = [r_capital * math.cos(angles[i_next]), r_capital * math.sin(angles[i_next]), z_top]
        triangles.append([center_top, p0, p1])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Fluted Asteroid-Glass Cathedral Column",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(r_capital * 2.0, 3), round(r_capital * 2.0, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_solarium_mirror_primitive(
    dish_diameter: float = 3.0,
    height: float = 3.8,
    primitive_id: str = "solarium-mirror",
    fragment_id: str = "wizard-tower/three-registers",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a parabolic solarium alignment mirror on an articulated pedestal."""
    triangles: list[list[list[float]]] = []

    n_segs = 8
    angles = [i * (2.0 * math.pi / n_segs) for i in range(n_segs)]
    r_ped = 0.75
    center_bot = [0.0, 0.0, 0.0]
    center_ped_top = [0.0, 0.0, 1.4]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        b0 = [r_ped * math.cos(angles[i]), r_ped * math.sin(angles[i]), 0.0]
        b1 = [r_ped * math.cos(angles[i_next]), r_ped * math.sin(angles[i_next]), 0.0]
        t0 = [r_ped * math.cos(angles[i]), r_ped * math.sin(angles[i]), 1.4]
        t1 = [r_ped * math.cos(angles[i_next]), r_ped * math.sin(angles[i_next]), 1.4]
        triangles.append([center_bot, b1, b0])
        triangles.append([b0, b1, t1])
        triangles.append([b0, t1, t0])
        triangles.append([center_ped_top, t0, t1])

    fork_h = 1.0
    fork_w = 0.20
    for x_side in [-0.6, 0.6]:
        x0, x1 = x_side - fork_w / 2.0, x_side + fork_w / 2.0
        y0, y1 = -0.15, 0.15
        z0, z1 = 1.4, 1.4 + fork_h
        c_f = [
            [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0],
            [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1],
        ]
        f_idx = [
            [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
            [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
            [4, 5, 6], [4, 6, 7],
        ]
        for f in f_idx:
            triangles.append([c_f[f[0]], c_f[f[1]], c_f[f[2]]])

    r_dish = dish_diameter / 2.0
    z_dish_center = 2.4
    depth = 0.35
    dish_segs = 12
    d_angles = [i * (2.0 * math.pi / dish_segs) for i in range(dish_segs)]

    cos_t = math.cos(math.pi / 4.0)
    sin_t = math.sin(math.pi / 4.0)

    center_dish_front = [0.0, sin_t * (-depth), z_dish_center + cos_t * (-depth)]
    center_dish_back = [0.0, 0.0, z_dish_center]

    rim_pts = []
    for a in d_angles:
        xl = r_dish * math.cos(a)
        yl = r_dish * math.sin(a)
        xw = xl
        yw = yl * cos_t
        zw = z_dish_center + yl * sin_t
        rim_pts.append([xw, yw, zw])

    for i in range(dish_segs):
        i_next = (i + 1) % dish_segs
        p0 = rim_pts[i]
        p1 = rim_pts[i_next]
        triangles.append([center_dish_front, p0, p1])
        triangles.append([center_dish_back, p1, p0])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="Solarium Articulated Alignment Mirror",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(dish_diameter, 3), round(dish_diameter * cos_t + 0.3, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def generate_solar_focus_primitive(
    dais_diameter: float = 6.0,
    height: float = 5.5,
    primitive_id: str = "solar-focus-lens",
    fragment_id: str = "wizard-tower/first-cast-beats",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """Generate a stepped astronomical lens dais with equatorial gimbal cradle."""
    triangles: list[list[list[float]]] = []
    n_segs = 12
    angles = [i * (2.0 * math.pi / n_segs) for i in range(n_segs)]

    tiers = [
        (0.00, 0.35, dais_diameter / 2.0),
        (0.35, 0.70, dais_diameter / 2.0 * 0.80),
        (0.70, 1.05, dais_diameter / 2.0 * 0.60),
    ]

    r0 = tiers[0][2]
    center_bot = [0.0, 0.0, 0.0]
    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        p0 = [r0 * math.cos(angles[i]), r0 * math.sin(angles[i]), 0.0]
        p1 = [r0 * math.cos(angles[i_next]), r0 * math.sin(angles[i_next]), 0.0]
        triangles.append([center_bot, p1, p0])

    for idx, (z0, z1, r_tier) in enumerate(tiers):
        for i in range(n_segs):
            i_next = (i + 1) % n_segs
            b0 = [r_tier * math.cos(angles[i]), r_tier * math.sin(angles[i]), z0]
            b1 = [r_tier * math.cos(angles[i_next]), r_tier * math.sin(angles[i_next]), z0]
            t0 = [r_tier * math.cos(angles[i]), r_tier * math.sin(angles[i]), z1]
            t1 = [r_tier * math.cos(angles[i_next]), r_tier * math.sin(angles[i_next]), z1]
            triangles.append([b0, b1, t1])
            triangles.append([b0, t1, t0])

        r_next = tiers[idx + 1][2] if idx + 1 < len(tiers) else 0.0
        center_t = [0.0, 0.0, z1]
        for i in range(n_segs):
            i_next = (i + 1) % n_segs
            t0 = [r_tier * math.cos(angles[i]), r_tier * math.sin(angles[i]), z1]
            t1 = [r_tier * math.cos(angles[i_next]), r_tier * math.sin(angles[i_next]), z1]
            if r_next > 0.0:
                in0 = [r_next * math.cos(angles[i]), r_next * math.sin(angles[i]), z1]
                in1 = [r_next * math.cos(angles[i_next]), r_next * math.sin(angles[i_next]), z1]
                triangles.append([in0, t0, t1])
                triangles.append([in0, t1, in1])
            else:
                triangles.append([center_t, t0, t1])

    cw, cl = 0.60, 1.20
    c_cradle = [
        [-cw, -cl, 1.05], [cw, -cl, 1.05], [cw, cl, 1.05], [-cw, cl, 1.05],
        [-cw, -cl, 1.65], [cw, -cl, 1.65], [cw, cl, 1.65], [-cw, cl, 1.65],
    ]
    f_idx = [
        [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5],
        [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7],
        [4, 5, 6], [4, 6, 7],
    ]
    for f in f_idx:
        triangles.append([c_cradle[f[0]], c_cradle[f[1]], c_cradle[f[2]]])

    z_lens_center = 3.5
    r_lens = 2.0
    lens_thickness = 0.4
    center_lens_n = [0.0, -lens_thickness / 2.0, z_lens_center]
    center_lens_s = [0.0, lens_thickness / 2.0, z_lens_center]

    for i in range(n_segs):
        i_next = (i + 1) % n_segs
        a0, a1 = angles[i], angles[i_next]
        p0 = [r_lens * math.cos(a0), 0.0, z_lens_center + r_lens * math.sin(a0)]
        p1 = [r_lens * math.cos(a1), 0.0, z_lens_center + r_lens * math.sin(a1)]
        triangles.append([center_lens_n, p0, p1])
        triangles.append([center_lens_s, p1, p0])

    all_tris = np.array(triangles, dtype=np.float32)
    prim = STLPrimitive(
        id=primitive_id,
        name="High Chancel Solar Focus Lens & Gimbal Dais",
        fragment_id=fragment_id,
        stl_path=Path(output_path) if output_path else None,
        dimensions=(round(dais_diameter, 3), round(dais_diameter, 3), round(height, 3)),
        triangles=all_tris,
    )
    if output_path:
        prim.save(output_path)
    return prim


def extrude_wall_box(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    z_bottom: float,
    z_top: float,
    thickness: float,
) -> list[list[list[float]]]:
    """
    Extrude a 2D wall segment centerline (x1, y1) -> (x2, y2) into a 3D rectangular box
    between elevations z_bottom and z_top with specified thickness.
    Normals face outwards with counter-clockwise winding.
    NO CEILING: the wall top rim at z_top is capped, but the interior room is open.
    Returns list of 12 triangles [[p0, p1, p2], ...].
    """
    dx = float(x2 - x1)
    dy = float(y2 - y1)
    length = math.hypot(dx, dy)
    if length < 1e-5:
        return []

    ux, uy = dx / length, dy / length
    # Normal pointing perpendicular to wall in XY plane
    nx, ny = -uy, ux
    hw = float(thickness) / 2.0
    wx, wy = nx * hw, ny * hw

    zb = float(z_bottom)
    zt = float(z_top)

    # 4 bottom vertices at z_bottom
    p0 = [float(x1 - wx), float(y1 - wy), zb]
    p1 = [float(x2 - wx), float(y2 - wy), zb]
    p2 = [float(x2 + wx), float(y2 + wy), zb]
    p3 = [float(x1 + wx), float(y1 + wy), zb]

    # 4 top rim vertices at z_top
    p4 = [float(x1 - wx), float(y1 - wy), zt]
    p5 = [float(x2 - wx), float(y2 - wy), zt]
    p6 = [float(x2 + wx), float(y2 + wy), zt]
    p7 = [float(x1 + wx), float(y1 + wy), zt]

    return [
        # Bottom face (normal points -Z)
        [p0, p2, p1],
        [p0, p3, p2],
        # Top rim face (normal points +Z)
        [p4, p5, p6],
        [p4, p6, p7],
        # Side face 1 (left side, normal outward towards -w)
        [p0, p1, p5],
        [p0, p5, p4],
        # Side face 2 (right side, normal outward towards +w)
        [p2, p3, p7],
        [p2, p7, p6],
        # Start cap (back end, normal towards -u)
        [p3, p0, p4],
        [p3, p4, p7],
        # End cap (front end, normal towards +u)
        [p1, p2, p6],
        [p1, p6, p5],
    ]


def extrude_floorplan_walls(
    floorplan: dict[str, Any] | Path | str,
    anchor_x: float = 0.0,
    anchor_y: float = 0.0,
    base_z: float = 0.0,
    default_wall_height: float = 3.5,
    default_thickness: float = 0.45,
    cut_portals: bool = True,
    primitive_id: str = "customs-house-walls",
    output_path: Path | str | None = None,
) -> STLPrimitive:
    """
    Extrude all walls from a SillyTavern / SpriteQuest floorplan JSON declaration
    into an open-topped (no ceiling) 3D architectural wall mesh.
    
    Portals are cut through walls leaving doorway openings (and optional lintels above).
    Coordinates are normalized relative to scale.center_xz + anchor.
    """
    if isinstance(floorplan, (str, Path)):
        fp_path = Path(floorplan)
        fp_data = json.loads(fp_path.read_text(encoding="utf-8"))
    else:
        fp_data = floorplan

    scale_info = fp_data.get("scale", {})
    center_xz = scale_info.get("center_xz", [0.0, 0.0])
    cx, cz = float(center_xz[0]), float(center_xz[1])

    # 1. Resolve portals
    portals = list(fp_data.get("portals", []))
    for elem in fp_data.get("architectural_elements", []):
        if elem.get("type") == "portal" and elem not in portals:
            portals.append(elem)

    resolved_portals = []
    for p in portals:
        pos = p.get("position", [0.0, 0.0, 0.0])
        # local floorplan has (x, y, z) where x=X, y=elev, z=Y
        px = float(pos[0]) - cx + anchor_x
        py = float(pos[2]) - cz + anchor_y
        pz = float(pos[1]) + base_z
        resolved_portals.append({
            "id": p.get("id", "portal"),
            "pos": (px, py, pz),
            "width": float(p.get("width", 2.0)),
            "height": float(p.get("height", 3.0)),
        })

    # 2. Extrude walls
    all_triangles: list[list[list[float]]] = []

    for w in fp_data.get("walls", []):
        s = w.get("start", [0.0, 0.0])
        e = w.get("end", [0.0, 0.0])
        wx1 = float(s[0]) - cx + anchor_x
        wy1 = float(s[1]) - cz + anchor_y
        wx2 = float(e[0]) - cx + anchor_x
        wy2 = float(e[1]) - cz + anchor_y
        thickness = float(w.get("thickness", default_thickness))
        wall_h = float(w.get("height", default_wall_height))

        dx = wx2 - wx1
        dy = wy2 - wy1
        seg_len = math.hypot(dx, dy)
        if seg_len < 1e-4:
            continue

        # Check for intersecting portals along this wall segment
        portal_spans = []
        if cut_portals:
            for p in resolved_portals:
                ppx, ppy, ppz = p["pos"]
                pw = p["width"]
                ph = p["height"]
                # Vector from segment start to portal
                vpx = ppx - wx1
                vpy = ppy - wy1
                # Project onto wall centerline
                proj = (vpx * dx + vpy * dy) / (seg_len * seg_len)
                # Perpendicular distance
                closest_x = wx1 + proj * dx
                closest_y = wy1 + proj * dy
                dist_perp = math.hypot(ppx - closest_x, ppy - closest_y)

                if dist_perp <= (thickness / 2.0 + 0.35) and (-0.05 <= proj <= 1.05):
                    half_span = (pw / 2.0) / seg_len
                    t0 = max(0.0, proj - half_span)
                    t1 = min(1.0, proj + half_span)
                    if t1 > t0:
                        portal_spans.append((t0, t1, ph))

        if not portal_spans:
            # Solid wall segment without portals
            tris = extrude_wall_box(wx1, wy1, wx2, wy2, base_z, base_z + wall_h, thickness)
            all_triangles.extend(tris)
        else:
            # Sort portal intervals along the wall
            portal_spans.sort(key=lambda s: s[0])
            prev_t = 0.0
            for t0, t1, ph in portal_spans:
                if t0 - prev_t > 0.01:
                    # Solid segment before portal
                    sx1 = wx1 + prev_t * dx
                    sy1 = wy1 + prev_t * dy
                    sx2 = wx1 + t0 * dx
                    sy2 = wy1 + t0 * dy
                    all_triangles.extend(extrude_wall_box(sx1, sy1, sx2, sy2, base_z, base_z + wall_h, thickness))

                # Lintel over the portal doorway (if wall is taller than door opening)
                lintel_h = min(wall_h, ph)
                if lintel_h < wall_h:
                    lx1 = wx1 + t0 * dx
                    ly1 = wy1 + t0 * dy
                    lx2 = wx1 + t1 * dx
                    ly2 = wy1 + t1 * dy
                    all_triangles.extend(extrude_wall_box(lx1, ly1, lx2, ly2, base_z + lintel_h, base_z + wall_h, thickness))

                prev_t = max(prev_t, t1)

            if 1.0 - prev_t > 0.01:
                # Solid segment after last portal
                sx1 = wx1 + prev_t * dx
                sy1 = wy1 + prev_t * dy
                sx2 = wx2
                sy2 = wy2
                all_triangles.extend(extrude_wall_box(sx1, sy1, sx2, sy2, base_z, base_z + wall_h, thickness))

    tris_arr = np.array(all_triangles, dtype=np.float32) if all_triangles else np.zeros((0, 3, 3), dtype=np.float32)

    # Compute bounding box
    if len(tris_arr) > 0:
        v = tris_arr.reshape(-1, 3)
        min_v = v.min(axis=0)
        max_v = v.max(axis=0)
        dims = (round(float(max_v[0] - min_v[0]), 3), round(float(max_v[1] - min_v[1]), 3), round(float(max_v[2] - min_v[2]), 3))
    else:
        dims = (0.0, 0.0, 0.0)

    prim = STLPrimitive(
        id=primitive_id,
        name=f"Extruded Architectural Walls ({fp_data.get('name', 'Floorplan')}) [No Ceiling]",
        fragment_id=fp_data.get("id", "floorplan"),
        stl_path=Path(output_path) if output_path else None,
        dimensions=dims,
        triangles=tris_arr,
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


def composite_terrain_and_primitives_glb(
    terrain_mesh: Any,
    placed_primitives: Sequence[PlacedSTLPrimitive],
    output_glb_path: Path | str,
    solid_base: bool = True,
) -> Path | None:
    """
    Export the composite terrain and placed primitives to standard binary GLB format
    if trimesh is available. Returns path on success, or None if trimesh unavailable.
    """
    try:
        import trimesh
    except ImportError:
        return None

    out_p = Path(output_glb_path)
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

    tris_np = np.array(triangles, dtype=np.float32)
    mesh = trimesh.Trimesh(
        vertices=tris_np.reshape(-1, 3),
        faces=np.arange(len(tris_np) * 3, dtype=np.int64).reshape(-1, 3),
        process=False,
    )
    mesh.export(str(out_p))
    return out_p


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

    # Campaign primitives (The Unwritten Consignment Acts I-IV)
    coffin_path = target_dir / "glass-stasis-coffin.stl"
    if not coffin_path.is_file():
        catalog["glass-stasis-coffin"] = generate_stasis_coffin_primitive(output_path=coffin_path)
    else:
        catalog["glass-stasis-coffin"] = STLPrimitive.load_stl(coffin_path, "glass-stasis-coffin", "space-vampires/glass-stasis-coffin")

    cairn_path = target_dir / "relic-cairn.stl"
    if not cairn_path.is_file():
        catalog["relic-cairn"] = generate_relic_cairn_primitive(output_path=cairn_path)
    else:
        catalog["relic-cairn"] = STLPrimitive.load_stl(cairn_path, "relic-cairn", "cartographers/epistemic-survey")

    wish_path = target_dir / "wish-stone-slab.stl"
    if not wish_path.is_file():
        catalog["wish-stone-slab"] = generate_wish_stone_primitive(output_path=wish_path)
    else:
        catalog["wish-stone-slab"] = STLPrimitive.load_stl(wish_path, "wish-stone-slab", "grey-wind/wish-granting")

    beacon_path = target_dir / "cryo-entropy-beacon.stl"
    if not beacon_path.is_file():
        catalog["cryo-entropy-beacon"] = generate_entropy_beacon_primitive(output_path=beacon_path)
    else:
        catalog["cryo-entropy-beacon"] = STLPrimitive.load_stl(beacon_path, "cryo-entropy-beacon", "space-vampires/glyph-entropy-matrix")

    column_path = target_dir / "glass-column-fluted.stl"
    if not column_path.is_file():
        catalog["glass-column-fluted"] = generate_glass_column_primitive(output_path=column_path)
    else:
        catalog["glass-column-fluted"] = STLPrimitive.load_stl(column_path, "glass-column-fluted", "wizard-tower/glass-cathedral")

    mirror_path = target_dir / "solarium-mirror.stl"
    if not mirror_path.is_file():
        catalog["solarium-mirror"] = generate_solarium_mirror_primitive(output_path=mirror_path)
    else:
        catalog["solarium-mirror"] = STLPrimitive.load_stl(mirror_path, "solarium-mirror", "wizard-tower/three-registers")

    lens_path = target_dir / "solar-focus-lens.stl"
    if not lens_path.is_file():
        catalog["solar-focus-lens"] = generate_solar_focus_primitive(output_path=lens_path)
    else:
        catalog["solar-focus-lens"] = STLPrimitive.load_stl(lens_path, "solar-focus-lens", "wizard-tower/first-cast-beats")

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

    # 3. Architectural floorplan walls (Customs House with open roof)
    walls_path = target_dir / "customs-house-walls.stl"
    customs_fp = REPO_ROOT / "library" / "floorplans" / "customs-house.json"
    if customs_fp.is_file():
        if not walls_path.is_file():
            catalog["customs-house-walls"] = extrude_floorplan_walls(
                customs_fp,
                anchor_x=0.0,
                anchor_y=0.0,
                base_z=0.0,
                output_path=walls_path,
                primitive_id="customs-house-walls",
            )
        else:
            catalog["customs-house-walls"] = STLPrimitive.load_stl(
                walls_path, "customs-house-walls", "customs-house/floorplan"
            )

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
