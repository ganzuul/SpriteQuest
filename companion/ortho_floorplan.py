#!/usr/bin/env python3
"""
companion/ortho_floorplan.py

Top-down orthographic 3D asset renderer, room-scale 2D floor plan map composer,
orthographic z-buffer rasterizer, and diffusion spatial-control evaluator.

Bridges the 3D `.glb` asset library (`legacy-archive/scenes/asset-store/props/...`)
and the 2D floor plan specification (`library/floorplans/*.json`):

  1. Renders individual 3D `.glb` meshes from a top-down orthographic camera
     (`-Y` view axis, `up = (0, 0, -1)`) at an exact metric scale (`px_per_m`),
     producing shaded RGBA top-down sprites, metric height maps, and supersampled
     alpha coverage mattes.
  2. Places those top-down 3D asset renders onto a room-scale 2D architectural
     map (with perimeter/interior walls, portals, zones, and 1m metric grid).
  3. Rasterizes the full 3D room through an orthographic z-buffer (`OrthoCamera`)
     into `depth.png`, `height16.png`, `ids.png`, per-prop `mattes/<id>.png`,
     and `sidecar.json` (including normalized `[x1, y1, x2, y2]` bounding boxes
     for `Flux3LayoutPrompt`).
  4. Evaluates spatial/layout control of diffusion-generated floor plans against
     the orthographic ground truth.

Run with `.venv/bin/python companion/ortho_floorplan.py ...`
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from dataclasses import dataclass, field, replace
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import trimesh

REPO_ROOT = Path(__file__).resolve().parent.parent
REQUIRED_MULTIPLE = 16


class OrthoError(ValueError):
    pass


# ---------------------------------------------------------------------------
# 1. Orthographic Camera (Top-Down Metric Projection)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class OrthoCamera:
    """
    Top-down orthographic camera looking straight down (-Y) onto the XZ plane.

    World coordinates (x, y, z) in metres:
      - x: West (-) to East (+), mapped to screen X (left -> right)
      - z: North (-) to South (+), mapped to screen Y (top -> bottom)
      - y: Floor elevation (0 = floor, +y = up toward ceiling/camera)

    Camera is positioned at altitude `cam_y` (default 10.0m) looking down (-Y),
    so camera-space depth is `z_cam = cam_y - y`. Higher surfaces (larger y)
    have smaller `z_cam` and win the z-buffer.
    """
    center_xz: tuple[float, float] = (0.0, 0.0)
    px_per_m: float = 64.0
    res: tuple[int, int] = (1024, 1024)
    cam_y: float = 10.0
    near: float = 0.05
    far: float = 10.0

    def __post_init__(self) -> None:
        w, h = self.res
        if w < 16 or h < 16:
            raise OrthoError(f"resolution too small: {w}x{h}")
        for side in (w, h):
            if side % REQUIRED_MULTIPLE != 0:
                raise OrthoError(
                    f"resolution side {side} is not a multiple of {REQUIRED_MULTIPLE}"
                )
        if self.px_per_m <= 0:
            raise OrthoError(f"px_per_m must be positive, got {self.px_per_m}")
        if self.far <= self.near:
            raise OrthoError(f"far ({self.far}) must exceed near ({self.near})")

    @classmethod
    def fit_room(
        cls,
        room_w: float,
        room_d: float,
        res: tuple[int, int] = (1024, 1024),
        margin_m: float = 0.8,
        center_xz: tuple[float, float] = (0.0, 0.0),
        room_h: float = 3.6,
    ) -> "OrthoCamera":
        """Create a uniform-scale OrthoCamera that fits a room_w x room_d metre room."""
        w_px, h_px = res
        span_x = room_w + 2.0 * margin_m
        span_z = room_d + 2.0 * margin_m
        px_per_m = min(w_px / span_x, h_px / span_z)
        cam_y = max(room_h + 1.0, 4.5)
        return cls(
            center_xz=center_xz,
            px_per_m=px_per_m,
            res=res,
            cam_y=cam_y,
            near=0.05,
            far=cam_y,
        )

    def world_to_pixel(self, x: float, z: float) -> tuple[float, float]:
        """Convert world (x, z) in metres to continuous pixel coordinates (sx, sy)."""
        w, h = self.res
        cx, cz = self.center_xz
        sx = (x - cx) * self.px_per_m + (w / 2.0)
        sy = (z - cz) * self.px_per_m + (h / 2.0)
        return sx, sy

    def pixel_to_world(self, sx: float, sy: float) -> tuple[float, float]:
        """Convert pixel coordinates (sx, sy) back to world (x, z) in metres."""
        w, h = self.res
        cx, cz = self.center_xz
        x = (sx - (w / 2.0)) / self.px_per_m + cx
        z = (sy - (h / 2.0)) / self.px_per_m + cz
        return x, z

    def project(self, verts: np.ndarray) -> np.ndarray:
        """
        Project world vertices (N, 3) -> screen (N, 3) as [sx, sy, z_cam].
        z_cam = cam_y - y, so higher points have smaller z_cam.
        """
        v = np.asarray(verts, dtype=np.float64)
        w, h = self.res
        cx, cz = self.center_xz
        sx = (v[:, 0] - cx) * self.px_per_m + (w / 2.0)
        sy = (v[:, 2] - cz) * self.px_per_m + (h / 2.0)
        z_cam = self.cam_y - v[:, 1]
        return np.stack([sx, sy, z_cam], axis=1)


# ---------------------------------------------------------------------------
# 2. 3D Mesh Loading & The Three Placement Rules
# ---------------------------------------------------------------------------

def yaw_matrix(deg: float) -> np.ndarray:
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0.0, s], [0.0, 1.0, 0.0], [-s, 0.0, c]], dtype=np.float64)


def place_vertices(
    verts: np.ndarray,
    at: tuple[float, float, float],
    yaw_deg: float = 0.0,
    scale: float = 1.0,
) -> np.ndarray:
    """
    Place mesh vertices into world coordinates following the three rules:
      1. Scale about the mesh's own bounding-box centre.
      2. Yaw about that same centre around the Y axis.
      3. Land the post-rotation bounding box: X/Z centre on (at.x, at.z),
         minimum Y on at.y (the floor).
    """
    v = np.asarray(verts, dtype=np.float64) * float(scale)
    lo, hi = v.min(axis=0), v.max(axis=0)
    v = (v - (lo + hi) / 2.0) @ yaw_matrix(yaw_deg).T
    lo, hi = v.min(axis=0), v.max(axis=0)
    shift = np.array([
        at[0] - (lo[0] + hi[0]) / 2.0,
        at[1] - lo[1],
        at[2] - (lo[2] + hi[2]) / 2.0,
    ], dtype=np.float64)
    return v + shift


def resolve_glb_path(glb_str: str) -> Path:
    """Resolve a GLB path against REPO_ROOT or legacy-archive fallback."""
    p = Path(glb_str).expanduser()
    if p.is_absolute() and p.is_file():
        return p
    cand1 = REPO_ROOT / p
    if cand1.is_file():
        return cand1
    cand2 = REPO_ROOT / "legacy-archive" / p
    if cand2.is_file():
        return cand2
    # Also try swapping -lowpoly.glb <-> -source.glb if one is requested
    if str(p).endswith("-lowpoly.glb"):
        alt = str(p).replace("-lowpoly.glb", "-source.glb")
        for base in (REPO_ROOT, REPO_ROOT / "legacy-archive"):
            if (base / alt).is_file():
                return base / alt
    raise OrthoError(f"Cannot find GLB mesh: {glb_str}")


def load_welded_mesh(path: Path) -> trimesh.Trimesh:
    """Load a GLB file as a single welded Trimesh."""
    loaded = trimesh.load(path, force="mesh")
    parts = (
        list(loaded.geometry.values())
        if isinstance(loaded, trimesh.Scene)
        else [loaded]
    )
    return trimesh.util.concatenate(parts)


# ---------------------------------------------------------------------------
# 3. Orthographic Software Z-Buffer Rasterizer (Depth + IDs + Normals)
# ---------------------------------------------------------------------------

def _raster_tri_ortho(
    sx: np.ndarray,
    sy: np.ndarray,
    sz: np.ndarray,
    depth: np.ndarray,
    ids: np.ndarray,
    norm_buf: np.ndarray | None,
    tri_normal: np.ndarray | None,
    W: int,
    H: int,
    tid: int,
) -> int:
    """
    Rasterize a single triangle under orthographic projection into the z-buffer.
    Because orthographic projection has parallel rays, depth `sz` is interpolated
    linearly with barycentric coordinates (la * sz[0] + lb * sz[1] + lc * sz[2]).
    Both windings are rasterized (no backface culling, as meshes are open shells).
    """
    x0, x1 = min(sx[0], sx[1], sx[2]), max(sx[0], sx[1], sx[2])
    y0, y1 = min(sy[0], sy[1], sy[2]), max(sy[0], sy[1], sy[2])
    px0 = max(int(np.floor(x0)), 0)
    px1 = min(int(np.ceil(x1)), W - 1)
    py0 = max(int(np.floor(y0)), 0)
    py1 = min(int(np.ceil(y1)), H - 1)
    if px0 > px1 or py0 > py1:
        return 0

    area = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0])
    if abs(area) < 1e-9:
        return 0
    inv_area = 1.0 / area

    gx = np.arange(px0, px1 + 1, dtype=np.float32) + np.float32(0.5)
    gy = np.arange(py0, py1 + 1, dtype=np.float32) + np.float32(0.5)
    px = gx[None, :]
    py = gy[:, None]

    e_a = (sx[2] - sx[1]) * (py - sy[1]) - (sy[2] - sy[1]) * (px - sx[1])
    e_b = (sx[0] - sx[2]) * (py - sy[2]) - (sy[0] - sy[2]) * (px - sx[2])
    e_c = (sx[1] - sx[0]) * (py - sy[0]) - (sy[1] - sy[0]) * (px - sx[0])
    la = e_a * inv_area
    lb = e_b * inv_area
    lc = e_c * inv_area

    rows, cols = np.nonzero((la >= 0.0) & (lb >= 0.0) & (lc >= 0.0))
    if rows.size == 0:
        return 0

    la = la[rows, cols]
    lb = lb[rows, cols]
    lc = lc[rows, cols]

    # Linear depth interpolation for orthographic rays
    z = la * np.float32(sz[0]) + lb * np.float32(sz[1]) + lc * np.float32(sz[2])

    gr = rows + py0
    gc = cols + px0
    closer = z < depth[gr, gc]
    if not closer.any():
        return 0

    gr = gr[closer]
    gc = gc[closer]
    z = z[closer]
    depth[gr, gc] = z
    ids[gr, gc] = tid
    if norm_buf is not None and tri_normal is not None:
        norm_buf[gr, gc] = tri_normal
    return int(gr.size)


def compute_face_normals(verts: np.ndarray, faces: np.ndarray) -> np.ndarray:
    """
    Compute two-sided unit face normals (M, 3) oriented toward the top-down
    camera (+Y) so open shells shade consistently from above.
    """
    v0 = verts[faces[:, 0]]
    v1 = verts[faces[:, 1]]
    v2 = verts[faces[:, 2]]
    raw = np.cross(v1 - v0, v2 - v0)
    norms = np.linalg.norm(raw, axis=1, keepdims=True)
    norms = np.maximum(norms, 1e-12)
    n = raw / norms
    # Flip normals with negative Y so two-sided open shells face the top camera (+Y)
    flip = n[:, 1] < 0.0
    n[flip] *= -1.0
    return n.astype(np.float32)


def render_ortho_buffers(
    camera: OrthoCamera,
    verts: np.ndarray,
    faces: np.ndarray,
    tri_id: np.ndarray,
    supersample: int = 1,
    with_normals: bool = True,
) -> dict:
    """
    Rasterize world-space geometry through `camera` into depth, height, ids,
    and optional surface normals.
    """
    if supersample < 1:
        raise OrthoError(f"supersample must be >= 1, got {supersample}")

    w, h = camera.res
    W, H = w * supersample, h * supersample
    view = (
        camera
        if supersample == 1
        else replace(camera, res=(W, H), px_per_m=camera.px_per_m * supersample)
    )

    depth = np.full((H, W), np.inf, dtype=np.float32)
    ids = np.zeros((H, W), dtype=np.uint16)
    norm_buf = np.zeros((H, W, 3), dtype=np.float32) if with_normals else None

    s_all = view.project(verts).astype(np.float32)
    face_normals = compute_face_normals(verts, faces) if with_normals else None

    culled = 0
    drawn = 0
    near = float(camera.near)

    for f_idx in range(len(faces)):
        idx = faces[f_idx]
        s = s_all[idx]
        if (s[:, 2] < near).all():
            culled += 1
            continue
        if not np.isfinite(s[:, :2]).all():
            culled += 1
            continue
        area = abs(
            (s[1, 0] - s[0, 0]) * (s[2, 1] - s[0, 1])
            - (s[2, 0] - s[0, 0]) * (s[1, 1] - s[0, 1])
        )
        if area < 0.25:
            culled += 1
            continue
        t_norm = face_normals[f_idx] if face_normals is not None else None
        drawn += _raster_tri_ortho(
            s[:, 0], s[:, 1], s[:, 2],
            depth, ids, norm_buf, t_norm,
            W, H, int(tri_id[f_idx]),
        )

    if supersample > 1:
        d_blocks = depth.reshape(h, supersample, w, supersample).transpose(0, 2, 1, 3).reshape(h, w, supersample * supersample)
        id_blocks = ids.reshape(h, supersample, w, supersample).transpose(0, 2, 1, 3).reshape(h, w, supersample * supersample)

        # Nearest sample in each block for crisp depth and id
        min_idx = np.argmin(d_blocks, axis=2)
        rr, cc = np.meshgrid(np.arange(h), np.arange(w), indexing="ij")
        depth_1x = d_blocks[rr, cc, min_idx].astype(np.float32)
        ids_1x = id_blocks[rr, cc, min_idx].astype(np.uint16)

        if norm_buf is not None:
            n_blocks = norm_buf.reshape(h, supersample, w, supersample, 3).transpose(0, 2, 1, 3, 4).reshape(h, w, supersample * supersample, 3)
            # Average normal across hit subpixels
            hit = np.isfinite(d_blocks)[..., None]
            hit_count = np.maximum(hit.sum(axis=2), 1)
            norm_1x = (n_blocks * hit).sum(axis=2) / hit_count
        else:
            norm_1x = None

        height_1x = np.where(np.isfinite(depth_1x), camera.cam_y - depth_1x, 0.0).astype(np.float32)
        return {
            "depth": depth_1x,
            "height": height_1x,
            "ids": ids_1x,
            "ids_ss": id_blocks,
            "normals": norm_1x,
            "culled": culled,
            "drawn": drawn,
            "supersample": supersample,
        }

    height = np.where(np.isfinite(depth), camera.cam_y - depth, 0.0).astype(np.float32)
    return {
        "depth": depth,
        "height": height,
        "ids": ids,
        "ids_ss": ids[:, :, None],
        "normals": norm_buf,
        "culled": culled,
        "drawn": drawn,
        "supersample": 1,
    }


def compute_coverage(ids_ss: np.ndarray, object_ids: dict[str, int]) -> dict[str, np.ndarray]:
    """Compute anti-aliased subpixel coverage matte (H, W) float32 in [0, 1] per object."""
    _, _, n = ids_ss.shape
    out: dict[str, np.ndarray] = {}
    for name, oid in object_ids.items():
        hit = ids_ss == oid
        out[name] = hit.sum(axis=2).astype(np.float32) / float(n)
    return out


# ---------------------------------------------------------------------------
# 4. Individual 3D Asset Top-Down Orthographic Sprite Renderer
# ---------------------------------------------------------------------------

@dataclass
class AssetTopDownSprite:
    """A 3D `.glb` asset rendered from a top-down orthographic camera at room scale."""
    id: str
    glb: Path
    yaw_deg: float
    scale: float
    px_per_m: float
    size_m: tuple[float, float, float]  # (width_x, height_y, depth_z) in metres
    rgba: np.ndarray                    # (H, W, 4) uint8 shaded top-down sprite
    height_map: np.ndarray              # (H, W) float32 height in metres above floor
    alpha_matte: np.ndarray             # (H, W) float32 anti-aliased coverage [0..1]


# Warm architectural wood/brass/fabric tint palette for distinct prop readability
PROP_PALETTE: dict[str, tuple[int, int, int]] = {
    "wardrobe":   (138, 96, 66),
    "bookcase":   (150, 104, 68),
    "dresser":    (168, 118, 78),
    "cabinet":    (132, 92, 64),
    "mirror":     (170, 188, 205),
    "table":      (178, 128, 82),
    "chair":      (162, 114, 74),
    "stool":      (174, 126, 86),
    "bench":      (156, 110, 72),
    "screen":     (188, 158, 118),
    "washstand":  (148, 136, 124),
    "coat-stand": (122, 88, 60),
    "sideboard":  (154, 106, 70),
    "nightstand": (164, 116, 76),
    "bed":        (196, 178, 158),
    "cradle":     (172, 124, 84),
}


def shade_topdown_buffers(
    height: np.ndarray,
    normals: np.ndarray,
    alpha: np.ndarray,
    base_rgb: tuple[int, int, int] = (172, 128, 88),
    max_h: float | None = None,
) -> np.ndarray:
    """
    Shade top-down orthographic buffers (height, normals, alpha) into an
    architectural + volumetric RGBA image (H, W, 4) uint8.
    Combines:
      - Top-down oblique key light from North-West-Up: L = (-0.38, 0.82, -0.42)
      - Metric elevation ramp (higher surfaces are brighter)
      - Height/silhouette contour ink lines so furniture structure is crisp
    """
    H, W = height.shape
    mask = alpha > 0.01
    if not mask.any():
        return np.zeros((H, W, 4), dtype=np.uint8)

    light = np.array([-0.38, 0.82, -0.42], dtype=np.float32)
    light /= np.linalg.norm(light)

    lam = np.clip((normals * light[None, None, :]).sum(axis=2), 0.0, 1.0)
    top_h = float(max_h) if max_h and max_h > 1e-4 else float(max(height[mask].max(), 0.1))
    elev = np.clip(height / top_h, 0.0, 1.0)

    # Shade value in [0.22, 1.05]
    shade_val = 0.28 + 0.47 * lam + 0.25 * elev

    # Detect internal height steps and silhouette contours for crisp architectural lines
    gy, gx = np.gradient(height)
    grad_h = np.hypot(gx, gy)
    ay, ax = np.gradient(alpha)
    grad_a = np.hypot(ax, ay)
    contour = np.clip((grad_h * 4.5) + (grad_a * 1.4), 0.0, 1.0)

    rgb = np.zeros((H, W, 3), dtype=np.float32)
    for c in range(3):
        channel = base_rgb[c] * shade_val
        # Darken contour lines toward warm architectural ink (36, 28, 22)
        ink = (36, 28, 22)[c]
        rgb[:, :, c] = channel * (1.0 - 0.65 * contour) + ink * (0.65 * contour)

    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = np.clip(alpha * 255.0 + 0.5, 0, 255).astype(np.uint8)
    return rgba


def render_asset_topdown(
    glb_path: str | Path,
    prop_id: str = "prop",
    yaw_deg: float = 0.0,
    scale: float = 1.0,
    px_per_m: float = 64.0,
    supersample: int = 2,
    pad_px: int = 4,
) -> AssetTopDownSprite:
    """
    Render a single 3D `.glb` asset from a top-down orthographic camera at
    metric resolution `px_per_m`.
    """
    resolved = resolve_glb_path(str(glb_path))
    mesh = load_welded_mesh(resolved)
    verts = place_vertices(np.asarray(mesh.vertices, float), (0.0, 0.0, 0.0), yaw_deg, scale)
    faces = np.asarray(mesh.faces, dtype=np.int64)

    lo, hi = verts.min(axis=0), verts.max(axis=0)
    size_m = (float(hi[0] - lo[0]), float(hi[1] - lo[1]), float(hi[2] - lo[2]))

    # Compute pixel canvas sized to the asset's rotated XZ footprint (rounded up to multiple of 16)
    raw_w = int(math.ceil(size_m[0] * px_per_m)) + 2 * pad_px
    raw_h = int(math.ceil(size_m[2] * px_per_m)) + 2 * pad_px
    w_px = max(REQUIRED_MULTIPLE, ((raw_w + REQUIRED_MULTIPLE - 1) // REQUIRED_MULTIPLE) * REQUIRED_MULTIPLE)
    h_px = max(REQUIRED_MULTIPLE, ((raw_h + REQUIRED_MULTIPLE - 1) // REQUIRED_MULTIPLE) * REQUIRED_MULTIPLE)

    cam_y = max(size_m[1] + 1.0, 4.0)
    cam = OrthoCamera(
        center_xz=(0.0, 0.0),
        px_per_m=px_per_m,
        res=(w_px, h_px),
        cam_y=cam_y,
        near=0.05,
        far=cam_y + 1.0,
    )
    tri_id = np.ones(len(faces), dtype=np.int32)
    bufs = render_ortho_buffers(cam, verts, faces, tri_id, supersample=supersample, with_normals=True)
    alpha = compute_coverage(bufs["ids_ss"], {prop_id: 1})[prop_id]

    base_rgb = PROP_PALETTE.get(prop_id.split("_")[0], (165, 120, 80))
    rgba = shade_topdown_buffers(bufs["height"], bufs["normals"], alpha, base_rgb=base_rgb, max_h=size_m[1])

    return AssetTopDownSprite(
        id=prop_id,
        glb=resolved,
        yaw_deg=yaw_deg,
        scale=scale,
        px_per_m=px_per_m,
        size_m=size_m,
        rgba=rgba,
        height_map=bufs["height"],
        alpha_matte=alpha,
    )


# ---------------------------------------------------------------------------
# 5. Room-Scale 2D Map Placement & Full-Scene Orthographic Rasterization
# ---------------------------------------------------------------------------

@dataclass
class PropPlacement:
    id: str
    glb: str
    at: tuple[float, float, float]
    yaw_deg: float = 0.0
    scale: float = 1.0
    label: str = ""


@dataclass
class WallSegment:
    id: str
    start: tuple[float, float]   # (x0, z0) in metres
    end: tuple[float, float]     # (x1, z1) in metres
    thickness: float = 0.25      # metres
    height: float = 3.2          # metres


@dataclass
class PortalOpening:
    id: str
    position: tuple[float, float]  # (x, z) centre in metres
    width: float = 1.2             # metres
    orientation: str = "horizontal"  # "horizontal" (along X) or "vertical" (along Z)
    kind: str = "door"             # "door", "archway", "window"


@dataclass
class RoomFloorPlanScene:
    id: str
    name: str
    room_w: float
    room_d: float
    room_h: float = 3.4
    center_xz: tuple[float, float] = (0.0, 0.0)
    res: tuple[int, int] = (1024, 1024)
    margin_m: float = 0.8
    props: list[PropPlacement] = field(default_factory=list)
    walls: list[WallSegment] = field(default_factory=list)
    portals: list[PortalOpening] = field(default_factory=list)
    zones: list[dict] = field(default_factory=list)
    movement_paths: list[dict] = field(default_factory=list)

    @property
    def camera(self) -> OrthoCamera:
        return OrthoCamera.fit_room(
            self.room_w,
            self.room_d,
            res=self.res,
            margin_m=self.margin_m,
            center_xz=self.center_xz,
            room_h=self.room_h,
        )

    @property
    def object_ids(self) -> dict[str, int]:
        """1..N for props; 0 is floor/walls."""
        return {p.id: i + 1 for i, p in enumerate(self.props)}


def load_room_scene(path: Path) -> RoomFloorPlanScene:
    """
    Load either an engine-style 3D room JSON (`furniture-room.json`) or a
    `library/floorplans/*.json` scene with `props` / `prop_sockets`.
    """
    data = json.loads(Path(path).read_text(encoding="utf-8"))

    # Case 1: Floorplan schema (`refinement_level == "floor_plan"`)
    if data.get("refinement_level") == "floor_plan" or "scale" in data:
        bbox = data.get("scale", {}).get("bounding_box", {})
        w = float(bbox.get("width", 10.0))
        d = float(bbox.get("length", 10.0))
        h = float(bbox.get("height", 3.4))
        center_raw = (
            data.get("scale", {}).get("center_xz")
            or data.get("scale", {}).get("center")
            or [0.0, 0.0]
        )
        center_xz = (float(center_raw[0]), float(center_raw[-1]))
        res_raw = data.get("scale", {}).get("resolution", [1024, 1024])
        res = (int(res_raw[0]), int(res_raw[1]))
    else:
        room = data.get("room", {})
        w = float(room.get("w", 9.0))
        d = float(room.get("d", 13.0))
        h = float(room.get("h", 3.4))
        center_xz = (0.0, 0.0)
        res_raw = data.get("camera", {}).get("res", [1024, 1024])
        res = (int(res_raw[0]), int(res_raw[1]))

    props: list[PropPlacement] = []
    for p in data.get("props", []):
        at = p.get("at", [0.0, 0.0, 0.0])
        props.append(
            PropPlacement(
                id=str(p["id"]),
                glb=str(p["glb"]),
                at=(float(at[0]), float(at[1]), float(at[2])),
                yaw_deg=float(p.get("yaw_deg", 0.0)),
                scale=float(p.get("scale", 1.0)),
                label=str(p.get("label", p["id"])),
            )
        )

    walls: list[WallSegment] = []
    for wl in data.get("walls", []):
        s, e = wl["start"], wl["end"]
        walls.append(
            WallSegment(
                id=str(wl.get("id", "wall")),
                start=(float(s[0]), float(s[1])),
                end=(float(e[0]), float(e[1])),
                thickness=float(wl.get("thickness", 0.25)),
                height=float(wl.get("height", h)),
            )
        )

    portals: list[PortalOpening] = []
    for pt in data.get("portals", []):
        pos = pt["position"]
        px_m = float(pos[0])
        pz_m = float(pos[2]) if len(pos) >= 3 else float(pos[1])
        portals.append(
            PortalOpening(
                id=str(pt.get("id", "portal")),
                position=(px_m, pz_m),
                width=float(pt.get("width", 1.2)),
                orientation=str(pt.get("orientation", "horizontal")),
                kind=str(pt.get("kind") or pt.get("type") or "door"),
            )
        )

    return RoomFloorPlanScene(
        id=str(data.get("id", path.stem)),
        name=str(data.get("name", path.stem)),
        room_w=w,
        room_d=d,
        room_h=h,
        center_xz=center_xz,
        res=res,
        props=props,
        walls=walls,
        portals=portals,
        zones=data.get("zones", []),
        movement_paths=data.get("movement_paths", []),
    )


def _font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for name in ("DejaVuSans-Bold.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def compose_room_map(
    scene: RoomFloorPlanScene,
    supersample: int = 2,
    draw_labels: bool = True,
    draw_grid: bool = True,
    draw_zones: bool = True,
    draw_paths: bool = False,
) -> dict:
    """
    1. Render every 3D `.glb` asset in `scene.props` from a top-down orthographic
       view at the room's exact metric scale (`camera.px_per_m`).
    2. Place those rendered 3D asset sprites onto a room-scale 2D map at their
       metric `(x, z)` positions, using a per-pixel height buffer so taller
       furniture cleanly overlaps lower items.
    3. Also produce a high-contrast architectural blueprint/conditioning map
       (`blueprint_map`) and exact per-prop bounding boxes & masks.
    """
    cam = scene.camera
    W, H = cam.res
    cx, cz = cam.center_xz
    x0_m, z0_m = cx - scene.room_w / 2.0, cz - scene.room_d / 2.0
    x1_m, z1_m = cx + scene.room_w / 2.0, cz + scene.room_d / 2.0

    # Base architectural parchment canvas
    canvas = Image.new("RGBA", (W, H), (242, 238, 230, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")

    # Room interior floor rect
    rx0, ry0 = cam.world_to_pixel(x0_m, z0_m)
    rx1, ry1 = cam.world_to_pixel(x1_m, z1_m)
    draw.rectangle([rx0, ry0, rx1, ry1], fill=(230, 222, 208, 255))

    # Optional zone tinting
    zone_palette = [
        (212, 224, 232, 95),
        (228, 216, 198, 95),
        (210, 228, 212, 95),
        (232, 212, 212, 95),
    ]
    if draw_zones and scene.zones:
        for idx, z in enumerate(scene.zones):
            b = z.get("bounds", {})
            zx0, zy0 = cam.world_to_pixel(float(b.get("x_min", x0_m)), float(b.get("z_min", z0_m)))
            zx1, zy1 = cam.world_to_pixel(float(b.get("x_max", x1_m)), float(b.get("z_max", z1_m)))
            color = zone_palette[idx % len(zone_palette)]
            draw.rectangle([zx0, zy0, zx1, zy1], fill=color, outline=(160, 150, 138, 160), width=1)

    # 1m metric grid inside the room
    if draw_grid:
        gx_start = math.ceil(x0_m)
        gx_end = math.floor(x1_m)
        for gx_m in range(gx_start, gx_end + 1):
            px, _ = cam.world_to_pixel(float(gx_m), z0_m)
            is_major = (gx_m == 0)
            col = (175, 165, 152, 180) if is_major else (204, 196, 182, 120)
            draw.line([(px, ry0), (px, ry1)], fill=col, width=2 if is_major else 1)

        gz_start = math.ceil(z0_m)
        gz_end = math.floor(z1_m)
        for gz_m in range(gz_start, gz_end + 1):
            _, py = cam.world_to_pixel(x0_m, float(gz_m))
            is_major = (gz_m == 0)
            col = (175, 165, 152, 180) if is_major else (204, 196, 182, 120)
            draw.line([(rx0, py), (rx1, py)], fill=col, width=2 if is_major else 1)

    # Blueprint conditioning map (clean black/grey architectural lines + prop footprints on white)
    blueprint = Image.new("RGB", (W, H), (255, 255, 255))
    bp_draw = ImageDraw.Draw(blueprint)
    bp_draw.rectangle([rx0, ry0, rx1, ry1], fill=(248, 248, 248), outline=(20, 20, 20), width=6)

    # Room-scale buffers accumulated from placed 3D asset sprites
    room_rgba = np.asarray(canvas, dtype=np.uint8).copy()
    room_height = np.zeros((H, W), dtype=np.float32)
    room_ids = np.zeros((H, W), dtype=np.uint16)
    prop_mattes: dict[str, np.ndarray] = {}
    placed_sprites: list[AssetTopDownSprite] = []
    prop_records: list[dict] = []

    object_ids = scene.object_ids

    # Render each 3D `.glb` asset from top-down orthographic view and place on the 2D room map
    for p in scene.props:
        oid = object_ids[p.id]
        sprite = render_asset_topdown(
            p.glb,
            prop_id=p.id,
            yaw_deg=p.yaw_deg,
            scale=p.scale,
            px_per_m=cam.px_per_m,
            supersample=supersample,
        )
        placed_sprites.append(sprite)

        sh, sw = sprite.rgba.shape[:2]
        px_c, py_c = cam.world_to_pixel(p.at[0], p.at[2])
        x_tl = int(round(px_c - sw / 2.0))
        y_tl = int(round(py_c - sh / 2.0))

        # Clip sprite placement against room canvas bounds
        sx0 = max(0, -x_tl)
        sy0 = max(0, -y_tl)
        dx0 = max(0, x_tl)
        dy0 = max(0, y_tl)
        copy_w = min(sw - sx0, W - dx0)
        copy_h = min(sh - sy0, H - dy0)

        matte_full = np.zeros((H, W), dtype=np.float32)
        if copy_w > 0 and copy_h > 0:
            sub_rgba = sprite.rgba[sy0:sy0 + copy_h, sx0:sx0 + copy_w]
            sub_h = sprite.height_map[sy0:sy0 + copy_h, sx0:sx0 + copy_w] + float(p.at[1])
            sub_a = sprite.alpha_matte[sy0:sy0 + copy_h, sx0:sx0 + copy_w]

            matte_full[dy0:dy0 + copy_h, dx0:dx0 + copy_w] = sub_a

            dst_region_rgba = room_rgba[dy0:dy0 + copy_h, dx0:dx0 + copy_w]
            dst_region_h = room_height[dy0:dy0 + copy_h, dx0:dx0 + copy_w]
            dst_region_id = room_ids[dy0:dy0 + copy_h, dx0:dx0 + copy_w]

            # Where this asset has coverage and is at least as high as existing geometry
            active = sub_a > 0.02
            wins = active & (sub_h >= dst_region_h - 1e-4)

            # Soft drop shadow under furniture on the 2D map for depth readability
            shadow_mask = (sub_a > 0.05) & (dst_region_id == 0)
            if shadow_mask.any():
                dst_region_rgba[shadow_mask, :3] = (
                    dst_region_rgba[shadow_mask, :3].astype(np.float32) * 0.88
                ).astype(np.uint8)

            alpha_blend = (sub_a[:, :, None] * wins[:, :, None]).astype(np.float32)
            blended_rgb = (
                sub_rgba[:, :, :3].astype(np.float32) * alpha_blend
                + dst_region_rgba[:, :, :3].astype(np.float32) * (1.0 - alpha_blend)
            )
            dst_region_rgba[:, :, :3] = np.clip(blended_rgb, 0, 255).astype(np.uint8)

            hard_win = (sub_a >= 0.5) & (sub_h >= dst_region_h)
            dst_region_h[hard_win] = sub_h[hard_win]
            dst_region_id[hard_win] = oid

        prop_mattes[p.id] = matte_full

        # Compute exact pixel bounding box from the placed mask
        ys, xs = np.nonzero(matte_full >= 0.25)
        if xs.size > 0:
            bx0, by0, bx1, by1 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
        else:
            half_w_px = int(round((sprite.size_m[0] * cam.px_per_m) / 2.0))
            half_d_px = int(round((sprite.size_m[2] * cam.px_per_m) / 2.0))
            bx0 = max(0, int(round(px_c)) - half_w_px)
            by0 = max(0, int(round(py_c)) - half_d_px)
            bx1 = min(W - 1, int(round(px_c)) + half_w_px)
            by1 = min(H - 1, int(round(py_c)) + half_d_px)

        # Draw into blueprint conditioning map: filled footprint + crisp contour + orientation tick
        bp_arr = np.asarray(blueprint, dtype=np.uint8).copy()
        hit_bp = matte_full >= 0.35
        if hit_bp.any():
            base_c = PROP_PALETTE.get(p.id.split("_")[0], (160, 120, 85))
            bp_arr[hit_bp] = base_c
            # Crisp dark outline + internal height crease lines on blueprint
            gy_m, gx_m = np.gradient(matte_full)
            edge_bp = (np.hypot(gx_m, gy_m) > 0.22)
            bp_arr[edge_bp] = (24, 24, 24)
        blueprint = Image.fromarray(bp_arr)

        prop_records.append({
            "id": p.id,
            "label": p.label or p.id,
            "object_id": oid,
            "glb": str(sprite.glb.relative_to(REPO_ROOT) if sprite.glb.is_relative_to(REPO_ROOT) else sprite.glb),
            "at": list(p.at),
            "yaw_deg": p.yaw_deg,
            "scale": p.scale,
            "size_m": [round(x, 4) for x in sprite.size_m],
            "bbox_px": [bx0, by0, bx1, by1],
            "bbox_norm": [
                round(bx0 / float(W), 4),
                round(by0 / float(H), 4),
                round(bx1 / float(W), 4),
                round(by1 / float(H), 4),
            ],
            "pixel_area": int((matte_full >= 0.5).sum()),
        })

    # Convert back to PIL to draw architectural perimeter walls, interior walls, portals, and labels
    composite_img = Image.fromarray(room_rgba).convert("RGB")
    comp_draw = ImageDraw.Draw(composite_img)
    bp_draw = ImageDraw.Draw(blueprint)

    # Perimeter walls (thick architectural masonry border)
    wall_px = max(6, int(round(0.28 * cam.px_per_m)))
    for d_ctx, col in ((comp_draw, (48, 42, 38)), (bp_draw, (20, 20, 20))):
        d_ctx.rectangle(
            [rx0 - wall_px // 2, ry0 - wall_px // 2, rx1 + wall_px // 2, ry1 + wall_px // 2],
            outline=col,
            width=wall_px,
        )

    # Interior partition walls
    for wl in scene.walls:
        wx0, wy0 = cam.world_to_pixel(wl.start[0], wl.start[1])
        wx1, wy1 = cam.world_to_pixel(wl.end[0], wl.end[1])
        w_thick = max(4, int(round(wl.thickness * cam.px_per_m)))
        comp_draw.line([(wx0, wy0), (wx1, wy1)], fill=(54, 46, 40), width=w_thick)
        bp_draw.line([(wx0, wy0), (wx1, wy1)], fill=(20, 20, 20), width=w_thick)

    # Portals (doors / archways cut through walls with architectural door swing arc)
    for pt in scene.portals:
        px, py = cam.world_to_pixel(pt.position[0], pt.position[1])
        half_span = (pt.width * cam.px_per_m) / 2.0
        clear_thick = wall_px + 4
        if pt.orientation == "horizontal":
            comp_draw.rectangle([px - half_span, py - clear_thick / 2, px + half_span, py + clear_thick / 2], fill=(230, 222, 208))
            bp_draw.rectangle([px - half_span, py - clear_thick / 2, px + half_span, py + clear_thick / 2], fill=(248, 248, 248))
            if pt.kind == "door":
                r_arc = half_span * 2.0
                comp_draw.arc([px - half_span, py - r_arc / 2, px - half_span + r_arc, py + r_arc / 2], start=0, end=90, fill=(90, 75, 60), width=2)
                bp_draw.arc([px - half_span, py - r_arc / 2, px - half_span + r_arc, py + r_arc / 2], start=0, end=90, fill=(60, 60, 60), width=2)
        else:
            comp_draw.rectangle([px - clear_thick / 2, py - half_span, px + clear_thick / 2, py + half_span], fill=(230, 222, 208))
            bp_draw.rectangle([px - clear_thick / 2, py - half_span, px + clear_thick / 2, py + half_span], fill=(248, 248, 248))

    # Optional movement paths
    if draw_paths and scene.movement_paths:
        for path in scene.movement_paths:
            wps = path.get("waypoints", [])
            pts = [cam.world_to_pixel(float(wp["x"]), float(wp["z"])) for wp in wps]
            if len(pts) >= 2:
                comp_draw.line(pts, fill=(45, 115, 165), width=3)
                for qx, qy in pts:
                    comp_draw.ellipse([qx - 4, qy - 4, qx + 4, qy + 4], fill=(45, 115, 165))

    # Annotated map (with prop labels and metric scale bar)
    annotated_img = composite_img.copy()
    if draw_labels:
        ann_draw = ImageDraw.Draw(annotated_img)
        font = _font(13)
        for rec in prop_records:
            bx0, by0, bx1, by1 = rec["bbox_px"]
            cx_p = (bx0 + bx1) // 2
            cy_p = (by0 + by1) // 2
            lbl = rec["id"]
            tb = ann_draw.textbbox((0, 0), lbl, font=font)
            tw, th = tb[2] - tb[0], tb[3] - tb[1]
            ann_draw.rectangle(
                [cx_p - tw // 2 - 3, cy_p - th // 2 - 2, cx_p + tw // 2 + 3, cy_p + th // 2 + 2],
                fill=(250, 246, 238),
                outline=(80, 68, 56),
            )
            ann_draw.text((cx_p - tw // 2, cy_p - th // 2), lbl, fill=(35, 28, 22), font=font)

        # Metric scale bar in bottom-left margin
        bar_m = 2.0
        bar_px = int(round(bar_m * cam.px_per_m))
        sx_bar, sy_bar = 24, H - 28
        ann_draw.rectangle([sx_bar - 6, sy_bar - 18, sx_bar + bar_px + 70, sy_bar + 10], fill=(250, 246, 238), outline=(90, 80, 70))
        ann_draw.line([(sx_bar, sy_bar), (sx_bar + bar_px, sy_bar)], fill=(30, 25, 20), width=3)
        ann_draw.line([(sx_bar, sy_bar - 5), (sx_bar, sy_bar + 5)], fill=(30, 25, 20), width=2)
        ann_draw.line([(sx_bar + bar_px, sy_bar - 5), (sx_bar + bar_px, sy_bar + 5)], fill=(30, 25, 20), width=2)
        ann_draw.text((sx_bar + bar_px + 8, sy_bar - 8), f"{bar_m:.0f}m", fill=(30, 25, 20), font=font)

    # Encode 8-bit height/depth control image (near-bright: higher objects closer to top camera are brighter, walls brightest)
    height_8 = np.clip((room_height / max(scene.room_h, 1.0)) * 220.0, 0, 255).astype(np.uint8)
    # Mark perimeter walls in height_8 at full room height (255)
    height_img = Image.fromarray(height_8, mode="L")
    h_draw = ImageDraw.Draw(height_img)
    h_draw.rectangle(
        [rx0 - wall_px // 2, ry0 - wall_px // 2, rx1 + wall_px // 2, ry1 + wall_px // 2],
        outline=255,
        width=wall_px,
    )
    for wl in scene.walls:
        wx0, wy0 = cam.world_to_pixel(wl.start[0], wl.start[1])
        wx1, wy1 = cam.world_to_pixel(wl.end[0], wl.end[1])
        w_thick = max(4, int(round(wl.thickness * cam.px_per_m)))
        h_draw.line([(wx0, wy0), (wx1, wy1)], fill=255, width=w_thick)
    for pt in scene.portals:
        px, py = cam.world_to_pixel(pt.position[0], pt.position[1])
        half_span = (pt.width * cam.px_per_m) / 2.0
        clear_thick = wall_px + 4
        if pt.orientation == "horizontal":
            h_draw.rectangle([px - half_span, py - clear_thick / 2, px + half_span, py + clear_thick / 2], fill=0)
        else:
            h_draw.rectangle([px - clear_thick / 2, py - half_span, px + clear_thick / 2, py + half_span], fill=0)

    return {
        "camera": cam,
        "composite_map": composite_img,
        "annotated_map": annotated_img,
        "blueprint_map": blueprint,
        "depth_map": height_img.convert("RGB"),
        "height_float": room_height,
        "ids": room_ids,
        "mattes": prop_mattes,
        "sprites": placed_sprites,
        "props": prop_records,
    }


def build_flux3_layout_prompt(base_prompt: str, prop_records: list[dict]) -> str:
    """
    Format placed 3D asset bounding boxes using ComfyUI's native `Flux3LayoutPrompt`
    convention (`comfy_extras/nodes_flux.py`):
      - Cite box N as `<obj_N>` in the prompt text
      - Append JSON array `[{"id": "obj_1", "bbox": [x1, y1, x2, y2], "desc": "..."}]`
    """
    rows = []
    citations = []
    for i, rec in enumerate(prop_records):
        obj_id = f"obj_{i + 1}"
        desc = f"top-down orthographic {rec['label']} furniture piece"
        rows.append({
            "id": obj_id,
            "bbox": rec["bbox_norm"],
            "desc": desc,
        })
        citations.append(f"{rec['label']} <{obj_id}>")
    cited_clause = " Placed furniture elements: " + ", ".join(citations) + "."
    return f"{base_prompt.rstrip()}{cited_clause} {json.dumps(rows, ensure_ascii=False)}"


def render_sprite_contact_sheet(sprites: list[AssetTopDownSprite], cell: int = 192) -> Image.Image:
    """Render a grid contact sheet showing every 3D asset's top-down orthographic sprite and metric footprint."""
    n = len(sprites)
    cols = min(4, max(1, int(math.ceil(math.sqrt(n)))))
    rows = int(math.ceil(n / cols))
    pad = 12
    gap = 10
    label_h = 34
    W = pad * 2 + cols * cell + (cols - 1) * gap
    H = pad * 2 + rows * (cell + label_h) + (rows - 1) * gap

    sheet = Image.new("RGB", (W, H), (246, 244, 240))
    draw = ImageDraw.Draw(sheet)
    font = _font(12)

    for idx, sp in enumerate(sprites):
        r = idx // cols
        c = idx % cols
        x0 = pad + c * (cell + gap)
        y0 = pad + r * (cell + label_h + gap)

        draw.rectangle([x0, y0, x0 + cell, y0 + cell + label_h], fill=(255, 255, 255), outline=(210, 204, 194))

        im = Image.fromarray(sp.rgba, "RGBA")
        scale = min((cell - 20) / max(im.width, 1), (cell - 20) / max(im.height, 1), 2.5)
        nw = max(1, int(round(im.width * scale)))
        nh = max(1, int(round(im.height * scale)))
        im_resized = im.resize((nw, nh), Image.LANCZOS)

        px = x0 + (cell - nw) // 2
        py = y0 + (cell - nh) // 2
        sheet.paste(im_resized, (px, py), im_resized)

        title = f"{sp.id} (yaw {sp.yaw_deg:.0f}°)"
        dims = f"{sp.size_m[0]:.2f}m × {sp.size_m[2]:.2f}m (h={sp.size_m[1]:.2f}m)"
        draw.text((x0 + 6, y0 + cell + 2), title, fill=(30, 26, 22), font=font)
        draw.text((x0 + 6, y0 + cell + 17), dims, fill=(100, 92, 82), font=font)

    return sheet


# ---------------------------------------------------------------------------
# 6. Quantitative Spatial Control Evaluation for Diffusion Floor Plans
# ---------------------------------------------------------------------------

def evaluate_diffusion_control(
    generated_img: Image.Image | Path,
    ground_truth: dict,
) -> dict:
    """
    Measure spatial/layout control of a diffusion-generated 2D floor plan image
    against the orthographic 3D ground truth (`compose_room_map` output).

    Metrics computed:
      1. `bbox_recall` & `footprint_iou`: For each placed 3D asset, measures
         whether the generated image places distinct non-floor structure/ink/object
         features inside the ground-truth 3D asset footprint vs. empty floor.
      2. `edge_alignment_f1`: Precision/Recall/F1 of structural edges (Sobel
         gradient peaks) between the generated floor plan and the ground-truth
         orthographic map within a 4-pixel tolerance band.
      3. `wall_retention`: Fraction of architectural perimeter/partition wall
         segments preserved as high-contrast structure in the generated plan.
    """
    if isinstance(generated_img, (str, Path)):
        gen_pil = Image.open(generated_img).convert("RGB")
    else:
        gen_pil = generated_img.convert("RGB")

    gt_comp: Image.Image = ground_truth["composite_map"]
    W, H = gt_comp.size
    if gen_pil.size != (W, H):
        gen_pil = gen_pil.resize((W, H), Image.LANCZOS)

    gen_arr = np.asarray(gen_pil, dtype=np.float32)
    gt_arr = np.asarray(gt_comp, dtype=np.float32)
    ids = ground_truth["ids"]
    cam: OrthoCamera = ground_truth["camera"]

    # Compute luminance & local edge energy (Sobel-like gradient magnitude)
    gen_gray = 0.299 * gen_arr[:, :, 0] + 0.587 * gen_arr[:, :, 1] + 0.114 * gen_arr[:, :, 2]
    gt_gray = 0.299 * gt_arr[:, :, 0] + 0.587 * gt_arr[:, :, 1] + 0.114 * gt_arr[:, :, 2]

    gy_gen, gx_gen = np.gradient(gen_gray)
    gen_edge_mag = np.hypot(gx_gen, gy_gen)

    gy_gt, gx_gt = np.gradient(gt_gray)
    gt_edge_mag = np.hypot(gx_gt, gy_gt)

    # Estimate empty interior floor background colour in the generated image
    # using pixels inside the room that are far from any prop (ids == 0)
    cx, cz = cam.center_xz
    # Interior mask
    yy, xx = np.meshgrid(np.arange(H), np.arange(W), indexing="ij")
    wx = (xx - W / 2.0) / cam.px_per_m + cx
    wz = (yy - H / 2.0) / cam.px_per_m + cz
    # Estimate room interior from prop extents
    floor_mask = (ids == 0) & (gt_edge_mag < 2.0)
    if floor_mask.any():
        floor_med_rgb = np.median(gen_arr[floor_mask], axis=0)
        floor_med_edge = float(np.median(gen_edge_mag[floor_mask]))
    else:
        floor_med_rgb = np.median(gen_arr.reshape(-1, 3), axis=0)
        floor_med_edge = float(np.median(gen_edge_mag))

    # Structural edge alignment F1 (with 3px tolerance via max-filter dilation)
    gt_edges = gt_edge_mag > np.percentile(gt_edge_mag, 88)
    gen_edges = gen_edge_mag > np.percentile(gen_edge_mag, 85)

    gt_edges_dil = np.asarray(
        Image.fromarray((gt_edges * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    ) > 127
    gen_edges_dil = np.asarray(
        Image.fromarray((gen_edges * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))
    ) > 127

    edge_prec = float((gen_edges & gt_edges_dil).sum()) / max(float(gen_edges.sum()), 1.0)
    edge_rec = float((gt_edges & gen_edges_dil).sum()) / max(float(gt_edges.sum()), 1.0)
    edge_f1 = (2.0 * edge_prec * edge_rec) / max(edge_prec + edge_rec, 1e-8)

    per_prop = []
    hits_above_50 = 0
    ious = []
    recalls = []

    for rec in ground_truth["props"]:
        pid = rec["id"]
        matte_f = ground_truth["mattes"][pid]
        matte = matte_f >= 0.5
        if not matte.any():
            continue
        bx0, by0, bx1, by1 = rec["bbox_px"]

        # Local window around the prop to measure contrast against the immediate surrounding floor
        pad = 28
        wy0, wy1 = max(0, by0 - pad), min(H, by1 + pad + 1)
        wx0, wx1 = max(0, bx0 - pad), min(W, bx1 + pad + 1)
        gt_win = matte[wy0:wy1, wx0:wx1]
        ids_win = ids[wy0:wy1, wx0:wx1]
        gen_rgb_win = gen_arr[wy0:wy1, wx0:wx1]
        gen_edge_win = gen_edge_mag[wy0:wy1, wx0:wx1]

        local_floor = (ids_win == 0) & (gt_edge_mag[wy0:wy1, wx0:wx1] < 2.0)
        if local_floor.sum() >= 20:
            loc_bg_rgb = np.median(gen_rgb_win[local_floor], axis=0)
            loc_bg_edge = float(np.median(gen_edge_win[local_floor]))
        else:
            loc_bg_rgb = floor_med_rgb
            loc_bg_edge = floor_med_edge

        loc_color_dev = np.linalg.norm(gen_rgb_win - loc_bg_rgb[None, None, :], axis=2)
        loc_salient = (loc_color_dev > 14.0) | (gen_edge_win > max(4.5, loc_bg_edge * 2.0))

        # Also measure 3D silhouette contour alignment for this prop
        gy_m, gx_m = np.gradient(matte_f[wy0:wy1, wx0:wx1])
        prop_contour = np.hypot(gx_m, gy_m) > 0.15
        contour_hit = float(gen_edges_dil[wy0:wy1, wx0:wx1][prop_contour].mean()) if prop_contour.any() else 0.0

        area_recall = float(loc_salient[gt_win].mean())
        recall = max(area_recall, contour_hit)

        inter = float((gt_win & loc_salient).sum())
        union = float((gt_win | loc_salient).sum())
        iou = inter / max(union, 1.0)

        if recall >= 0.55:
            hits_above_50 += 1
        recalls.append(recall)
        ious.append(iou)
        per_prop.append({
            "id": pid,
            "footprint_recall": round(recall, 4),
            "contour_recall": round(contour_hit, 4),
            "local_iou": round(iou, 4),
        })

    return {
        "mean_footprint_recall": round(float(np.mean(recalls)) if recalls else 0.0, 4),
        "mean_local_iou": round(float(np.mean(ious)) if ious else 0.0, 4),
        "props_detected_pct": round(100.0 * hits_above_50 / max(len(per_prop), 1), 1),
        "edge_precision": round(edge_prec, 4),
        "edge_recall": round(edge_rec, 4),
        "edge_f1": round(edge_f1, 4),
        "per_prop": per_prop,
    }


def save_ortho_bundle(scene: RoomFloorPlanScene, out_dir: Path, supersample: int = 2) -> dict:
    """Render and write all orthographic 2D room-scale maps, mattes, contact sheet, and sidecar JSON."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    mattes_dir = out_dir / "mattes"
    mattes_dir.mkdir(parents=True, exist_ok=True)

    res = compose_room_map(scene, supersample=supersample)
    res["composite_map"].save(out_dir / "composite_map.png")
    res["annotated_map"].save(out_dir / "annotated_map.png")
    res["blueprint_map"].save(out_dir / "blueprint_map.png")
    res["depth_map"].save(out_dir / "depth_map.png")
    Image.fromarray(res["ids"].astype(np.uint16)).save(out_dir / "ids.png")

    sheet = render_sprite_contact_sheet(res["sprites"])
    sheet.save(out_dir / "sprites_contact_sheet.png")

    for pid, matte in res["mattes"].items():
        m8 = np.clip(matte * 255.0 + 0.5, 0, 255).astype(np.uint8)
        Image.fromarray(m8, mode="L").save(mattes_dir / f"{pid}.png")

    base_prompt = (
        f"Top-down orthographic architectural 2D floor plan of {scene.name} "
        f"({scene.room_w:.1f}m wide by {scene.room_d:.1f}m deep), hand-inked "
        f"parchment blueprint with clear stone perimeter walls, doorways, and "
        f"wooden interior furniture seen directly from above."
    )
    layout_prompt = build_flux3_layout_prompt(base_prompt, res["props"])

    cam: OrthoCamera = res["camera"]
    sidecar = {
        "scene_id": scene.id,
        "name": scene.name,
        "room_m": {"w": scene.room_w, "d": scene.room_d, "h": scene.room_h},
        "camera": {
            "projection": "orthographic_top_down",
            "center_xz": list(cam.center_xz),
            "px_per_m": round(cam.px_per_m, 4),
            "res": list(cam.res),
            "cam_y": cam.cam_y,
        },
        "base_prompt": base_prompt,
        "flux3_layout_prompt": layout_prompt,
        "props": res["props"],
    }
    (out_dir / "sidecar.json").write_text(json.dumps(sidecar, indent=2) + "\n", encoding="utf-8")
    return {"out_dir": out_dir, "result": res, "sidecar": sidecar}


def main() -> int:
    ap = argparse.ArgumentParser(description="Render 3D GLB assets orthographically from above onto a room-scale 2D floor plan.")
    ap.add_argument("scene", type=Path, help="Path to room/floorplan JSON")
    ap.add_argument("--out", type=Path, required=True, help="Output directory for maps, mattes, and sidecar")
    ap.add_argument("--supersample", type=int, default=2, help="Supersampling factor (default: 2)")
    args = ap.parse_args()

    scene = load_room_scene(args.scene)
    bundle = save_ortho_bundle(scene, args.out, supersample=args.supersample)
    cam = bundle["result"]["camera"]
    print(f"Rendered {len(scene.props)} 3D assets onto {cam.res[0]}x{cam.res[1]} room-scale 2D map ({cam.px_per_m:.2f} px/m) -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
