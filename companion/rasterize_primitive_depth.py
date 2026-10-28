#!/usr/bin/env python3
"""
companion/rasterize_primitive_depth.py

Render dual-view depth templates for stored 3D primitives into
`renders/primitives/<id>-depth.png` via ComfyUI's `Render Mesh` node.

The node graph lives in `workflows/comfyui/mesh_depth.json`; this script only
batches the render. Depth templates are consumed by:
  1. The Left Sidebar multi-representation inspector (facet: 'depth')
  2. The 3D Pipeline action button in SillyTavern / Web Viewer
  3. Image diffusion depth-conditioned img2img / ControlNet

Usage:
    python3 companion/rasterize_primitive_depth.py
    python3 companion/rasterize_primitive_depth.py --primitive ancient-bastion
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_depth import render_depth_artifact
from companion.comfy_models import DEFAULT_SERVER

MESH_DIR = REPO_ROOT / "library" / "mesh"
STL_DIR = REPO_ROOT / "library" / "stl_primitives"
OUT_DIR = REPO_ROOT / "renders" / "primitives"


def rasterize_all_primitive_depths(
    stl_dir: Path = STL_DIR,
    mesh_dir: Path = MESH_DIR,
    out_dir: Path = OUT_DIR,
    width: int = 1024,
    height: int = 512,
    side_by_side: bool = True,
    target_ids: list[str] | None = None,
    server: str = DEFAULT_SERVER,
) -> list[tuple[str, Path]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    results: list[tuple[str, Path]] = []
    seen: set[str] = set()

    for stl_path in sorted(stl_dir.glob("*.stl")):
        pid = stl_path.stem
        if target_ids and pid not in target_ids:
            continue
        source_glb = mesh_dir / f"{pid}-source.glb"
        mesh = source_glb if source_glb.is_file() else stl_path
        out_png = out_dir / f"{pid}-depth.png"
        render_depth_artifact(mesh, out_png, width=width, height=height, server=server, side_by_side=side_by_side)
        results.append((pid, out_png))
        seen.add(pid)
        print(f"[3D Depth] Rendered '{pid}' -> {out_png.relative_to(REPO_ROOT)} ({width}x{height})")

    for source_glb in sorted(mesh_dir.glob("*-source.glb")):
        pid = source_glb.stem[:-7]
        if (target_ids and pid not in target_ids) or pid in seen:
            continue
        out_png = out_dir / f"{pid}-depth.png"
        render_depth_artifact(source_glb, out_png, width=width, height=height, server=server, side_by_side=side_by_side)
        results.append((pid, out_png))
        print(f"[3D Depth] Rendered source mesh '{pid}' -> {out_png.relative_to(REPO_ROOT)} ({width}x{height})")

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Render primitive depth templates through ComfyUI")
    parser.add_argument("--width", type=int, default=1024, help="Composite width (two panes)")
    parser.add_argument("--height", type=int, default=512, help="Pane height")
    parser.add_argument("--primitive", type=str, default="", help="Specific primitive ID to render")
    parser.add_argument("--single-view", action="store_true", help="Render only the top-down view")
    parser.add_argument("--server", default=DEFAULT_SERVER, help=f"ComfyUI URL (default: {DEFAULT_SERVER})")
    args = parser.parse_args()

    target_ids = [args.primitive] if args.primitive else None
    results = rasterize_all_primitive_depths(
        width=args.width,
        height=args.height,
        side_by_side=not args.single_view,
        target_ids=target_ids,
        server=args.server,
    )
    print(f"Rendered {len(results)} depth templates.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
