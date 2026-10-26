#!/usr/bin/env python3
"""
companion/rasterize_primitive_depth.py

Utility to rasterize dense, solid, orthographic top-down Z-depth maps
from binary STL primitives in `library/stl_primitives/` to `renders/primitives/<id>-depth.png`.

These high-detail depth templates are consumed directly by:
  1. The Left Sidebar multi-representation inspector (facet: 'depth')
  2. The 3D Pipeline action button in SillyTavern / Web Viewer
  3. Image diffusion depth-conditioned img2img / ControlNet
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.terrain_mesh import rasterize_stl_depth

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
) -> list[tuple[str, Path]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    results = []

    stl_files = sorted(stl_dir.glob("*.stl"))
    for stl_path in stl_files:
        pid = stl_path.stem
        if target_ids and pid not in target_ids:
            continue
        out_png = out_dir / f"{pid}-depth.png"
        img = rasterize_stl_depth(stl_path, width=width, height=height, prefer_source_mesh=True, side_by_side=side_by_side)
        img.save(out_png)
        results.append((pid, out_png))
        print(f"[3D Depth] Rasterized '{pid}' -> {out_png.relative_to(REPO_ROOT)} ({img.width}x{img.height})")

    # Also rasterize any standalone source GLBs
    for source_glb in sorted(mesh_dir.glob("*-source.glb")):
        pid = source_glb.stem[:-7]  # strip '-source'
        if target_ids and pid not in target_ids:
            continue
        out_png = out_dir / f"{pid}-depth.png"
        img = rasterize_stl_depth(source_glb, width=width, height=height, prefer_source_mesh=True, side_by_side=side_by_side)
        img.save(out_png)
        if (pid, out_png) not in results:
            results.append((pid, out_png))
            print(f"[3D Depth] Rasterized source mesh '{pid}' -> {out_png.relative_to(REPO_ROOT)} ({img.width}x{img.height})")

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description="Rasterize STL primitives to high-detail top-down & 3/4th depth maps")
    parser.add_argument("--width", type=int, default=1024, help="Output image width")
    parser.add_argument("--height", type=int, default=512, help="Output image height")
    parser.add_argument("--primitive", type=str, default="", help="Specific primitive ID to rasterize")
    parser.add_argument("--single-view", action="store_true", help="Rasterize single top-down view instead of side-by-side")
    args = parser.parse_args()

    target_ids = [args.primitive] if args.primitive else None
    results = rasterize_all_primitive_depths(
        width=args.width,
        height=args.height,
        side_by_side=not args.single_view,
        target_ids=target_ids,
    )
    print(f"Completed rasterization of {len(results)} high-detail depth templates.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
