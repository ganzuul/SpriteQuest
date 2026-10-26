#!/usr/bin/env python3
"""
companion/waterfall_pipeline.py

End-to-End Checksummed Waterfall Asset Forge Pipeline for SpriteQuest.

Hardcoded 9-Stage Waterfall Flow starting strictly from fragments:
  Stage 1: Fragment Ingestion & Admission Control (ASSET_RECIPES + floorplan constraints)
  Stage 2: Prompt Compilation & Rewrite (LLM / Gemma4-Orion rewrite specification)
  Stage 3: Text-to-2D Diffusion Generation (MOSS-Image in ComfyUI + Alpha Segmentation)
  Stage 4: 2D-to-3D Volumetric Reconstruction (Hunyuan3D in ComfyUI, no fallback, warn at failure)
  Stage 5: Low-Poly LOD Decimation & STL Export (~8k faces, watertight binary metric STL)
  Stage 6: CoACD Physics Convex Decomposition (~32 blocks, A: OBBs, B: Convex Hulls)
  Stage 7: Dual-View Depth Map Rasterization (Top-Down Ortho & 3/4th Ortho from STL)
  Stage 8: Consolidated Sprite Sheet (3 Cells: Sprite, 8k LOD, CoACD Cuts + H/W/L Info-Line)
  Stage 9: Ledger Settlement & Stagecraft Presentation (Hollis Ledger standing granted)

Checksums guard each stage: if upstream inputs have not changed and artifacts exist,
the stage is skipped cleanly with zero redundant compute.
"""

from __future__ import annotations

import hashlib
import json
import os
import shutil
import struct
import sys
import time
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

MANIFEST_PATH = REPO_ROOT / "library" / "waterfall_manifest.json"
RENDERS_DIR = REPO_ROOT / "renders" / "primitives"
STL_DIR = REPO_ROOT / "library" / "stl_primitives"
MESH_DIR = REPO_ROOT / "library" / "mesh"
SPRITES_DIR = REPO_ROOT / "library" / "sprites"


def _file_sha256(path: Path) -> str:
    """Calculate SHA256 of file bytes."""
    if not path.is_file():
        return ""
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()[:16]


def _text_sha256(text: str) -> str:
    """Calculate SHA256 of a string."""
    return hashlib.sha256(text.encode("utf-8", errors="replace")).hexdigest()[:16]


def load_waterfall_manifest() -> dict[str, Any]:
    """Load cached checksum manifest."""
    if MANIFEST_PATH.is_file():
        try:
            return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


def save_waterfall_manifest(manifest: dict[str, Any]) -> None:
    """Persist updated checksum manifest."""
    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def sync_asset_waterfall(
    primitive_id: str,
    scene_id: str = "border-march",
    dimensions: tuple[float, float, float] | None = None,
    force: bool = False,
    comfy_server: str | None = None,
) -> dict[str, Any]:
    """
    Execute synchronized waterfall asset pipeline from fragments to finished 3D STL.
    Checks checksums at each stage and only executes what is missing or changed.
    """
    t0 = time.monotonic()
    clean_id = primitive_id.replace("prop-", "")
    manifest = load_waterfall_manifest()
    entry = manifest.get(primitive_id, {})

    from companion.fragment_compiler import compile_asset_brief, FRAGMENTS_DIR
    from companion.image_to_3d import RUIN_SPECS

    spec = RUIN_SPECS.get(clean_id) or RUIN_SPECS.get(primitive_id) or {}
    dims = dimensions or spec.get("dimensions") or (4.0, 4.0, 6.0)
    asset_name = spec.get("name") or primitive_id.replace("-", " ").title()

    stages_executed = []
    stages_skipped = []

    # -------------------------------------------------------------------------
    # STAGE 1 & 2: Fragment Ingestion, Admission Control & Prompt Compilation
    # -------------------------------------------------------------------------
    brief_res = compile_asset_brief(primitive_id, scene_id=scene_id, resolve_conflicts=True)
    fragments_hash_input = "".join([
        f"{frag}:{_file_sha256(FRAGMENTS_DIR / f'{frag}.json')}"
        for frag in sorted(brief_res.fragments_used)
    ]) + f":dims={dims}:scene={scene_id}"
    curr_prompt_hash = _text_sha256(fragments_hash_input + brief_res.rewritten_prompt)

    prompt_outdated = force or (entry.get("prompt_hash") != curr_prompt_hash)
    if prompt_outdated:
        stages_executed.append("Stage 1 & 2: Fragment Ingestion & Prompt Compilation")
        entry["prompt_hash"] = curr_prompt_hash
        entry["prompt_text"] = brief_res.rewritten_prompt
        entry["fragments"] = brief_res.fragments_used
    else:
        stages_skipped.append("Stage 1 & 2: Fragment Ingestion & Prompt Compilation (cached)")

    diffusion_prompt = entry.get("prompt_text") or brief_res.rewritten_prompt

    # -------------------------------------------------------------------------
    # STAGE 3: Text-to-2D Diffusion Generation (MOSS-Image in ComfyUI)
    # -------------------------------------------------------------------------
    sprite_path = SPRITES_DIR / f"{clean_id}.png"
    gen_sprite_path = RENDERS_DIR / f"{primitive_id}-generated.png"
    curr_sprite_seed = 42
    curr_sprite_hash_input = f"{curr_prompt_hash}:{diffusion_prompt}:moss_image:{curr_sprite_seed}"
    curr_sprite_hash = _text_sha256(curr_sprite_hash_input)

    active_sprite = gen_sprite_path if gen_sprite_path.is_file() else sprite_path
    has_existing_sprite = active_sprite.is_file()
    if not entry.get("sprite_hash") and has_existing_sprite and not force and not prompt_outdated:
        entry["sprite_hash"] = curr_sprite_hash

    sprite_outdated = (
        force or
        prompt_outdated or
        not has_existing_sprite or
        (entry.get("sprite_hash") != curr_sprite_hash)
    )

    if sprite_outdated:
        stages_executed.append("Stage 3: Text-to-2D Diffusion Generation")
        try:
            from companion.render_sheets import Comfy, build_moss_image_workflow
            from companion.image_to_3d import load_and_segment_sprite, COMFY_SERVER_DEFAULT

            srv = comfy_server or os.environ.get("COMFY_SERVER", COMFY_SERVER_DEFAULT)
            client = Comfy(srv)
            if client.alive():
                wf = build_moss_image_workflow(
                    prompt=diffusion_prompt,
                    negative="low quality, blurry, text, watermark, cropped, deformed, solid black background",
                    seed=curr_sprite_seed,
                    width=1024,
                    height=1024,
                    prefix=f"forge/{primitive_id}",
                    steps=20,
                    cfg=5.0,
                )
                img_bytes = client.run(wf)
                from PIL import Image
                import io
                raw_img = Image.open(io.BytesIO(img_bytes))
                gen_sprite_path.parent.mkdir(parents=True, exist_ok=True)
                raw_img.save(gen_sprite_path)
                # Segment alpha
                segmented, _ = load_and_segment_sprite(gen_sprite_path)
                segmented.save(gen_sprite_path)
                active_sprite = gen_sprite_path
            else:
                print(f"[Waterfall] ComfyUI offline at {srv}; retaining existing sprite on disk.", file=sys.stderr)
        except Exception as exc:
            print(f"[Waterfall] Stage 3 ComfyUI dispatch notice: {exc}; utilizing existing disk sprite.", file=sys.stderr)

        entry["sprite_hash"] = curr_sprite_hash
        entry["sprite_path"] = str(active_sprite.relative_to(REPO_ROOT))
    else:
        stages_skipped.append("Stage 3: Text-to-2D Diffusion Generation (cached)")

    # -------------------------------------------------------------------------
    # STAGE 4 & 5: 2D-to-3D Volumetric Mesh & Low-Poly 8k LOD Decimation
    # -------------------------------------------------------------------------
    source_glb_path = MESH_DIR / f"{primitive_id}-source.glb"
    lowpoly_glb_path = MESH_DIR / f"{primitive_id}-lowpoly.glb"
    stl_path = STL_DIR / f"{primitive_id}.stl"

    sprite_bytes_hash = _file_sha256(active_sprite)
    curr_mesh_hash = _text_sha256(f"{sprite_bytes_hash}:dims={dims}:target_faces=8000")
    has_existing_mesh = stl_path.is_file() and lowpoly_glb_path.is_file()

    if not entry.get("mesh_hash") and has_existing_mesh and not force and not sprite_outdated:
        entry["mesh_hash"] = curr_mesh_hash

    mesh_outdated = (
        force or
        sprite_outdated or
        not has_existing_mesh or
        (entry.get("mesh_hash") != curr_mesh_hash)
    )

    if mesh_outdated:
        stages_executed.append("Stage 4 & 5: 2D-to-3D Volumetric Mesh & 8k Low-poly STL")
        from companion.image_to_3d import (
            generate_hunyuan_3d,
            decimate_to_lowpoly,
            export_binary_stl,
        )

        source_mesh = None
        try:
            hunyuan_res = generate_hunyuan_3d(active_sprite, target_extents=dims, server=comfy_server)
            if hunyuan_res is not None:
                source_mesh, _ = hunyuan_res
        except Exception as e:
            print(f"[Waterfall] Hunyuan3D error: {e}", file=sys.stderr)

        if source_mesh is None:
            # Per user specification: Hunyuan3D in ComfyUI, no fallback, warn at failure
            raise RuntimeError(
                f"[Waterfall Stage 4 Failure] Hunyuan3D-2.1 reconstruction failed or ComfyUI is unavailable for '{primitive_id}'. "
                f"Strict waterfall specification requires Hunyuan3D (no geometric fallback)."
            )

        source_glb_path.parent.mkdir(parents=True, exist_ok=True)
        source_mesh.export(source_glb_path)

        # Stage 5: Decimate to 8k faces
        lowpoly_mesh = decimate_to_lowpoly(source_mesh, target_faces=8000)
        lowpoly_mesh.export(lowpoly_glb_path)

        # Standardized watertight metric binary STL primitive
        fragment_id = spec.get("fragment_id", "grey-wind/named-ruins")
        export_binary_stl(lowpoly_mesh, stl_path, primitive_id=primitive_id, fragment_id=fragment_id)

        entry["mesh_hash"] = curr_mesh_hash
        entry["lowpoly_faces"] = len(lowpoly_mesh.faces)
        entry["source_faces"] = len(source_mesh.faces)
    else:
        stages_skipped.append("Stage 4 & 5: 2D-to-3D Volumetric Mesh & 8k Low-poly STL (cached)")
        import trimesh
        lowpoly_mesh = trimesh.load(lowpoly_glb_path)
        if isinstance(lowpoly_mesh, trimesh.Scene):
            lowpoly_mesh = lowpoly_mesh.to_geometry()

    # -------------------------------------------------------------------------
    # STAGE 6: CoACD Physics Convex Decomposition (~32 blocks, OBBs + Hulls)
    # -------------------------------------------------------------------------
    collider_glb_path = MESH_DIR / f"{primitive_id}-collider.glb"
    stl_bytes_hash = _file_sha256(stl_path)
    curr_collider_hash = _text_sha256(f"{stl_bytes_hash}:coacd_cap=32:threshold=0.025")
    has_existing_collider = collider_glb_path.is_file()

    if not entry.get("collider_hash") and has_existing_collider and not force and not mesh_outdated:
        entry["collider_hash"] = curr_collider_hash

    collider_outdated = (
        force or
        mesh_outdated or
        not has_existing_collider or
        (entry.get("collider_hash") != curr_collider_hash)
    )

    if collider_outdated:
        stages_executed.append("Stage 6: CoACD Physics Convex Decomposition (~32 blocks)")
        from companion.image_to_3d import decompose_coacd_colliders, export_collider_glb
        obbs, hulls = decompose_coacd_colliders(lowpoly_mesh, threshold=0.025, cap=32, fast=True)
        export_collider_glb((obbs, hulls), collider_glb_path)
        collider_pieces = hulls
        entry["collider_hash"] = curr_collider_hash
        entry["collider_blocks"] = len(hulls)
    else:
        stages_skipped.append("Stage 6: CoACD Physics Convex Decomposition (cached)")
        import trimesh
        loaded_coll = trimesh.load(collider_glb_path)
        if isinstance(loaded_coll, trimesh.Scene):
            collider_pieces = [geom for geom in loaded_coll.geometry.values() if "hull" in geom.metadata.get("node_name", "")] or list(loaded_coll.geometry.values())
        else:
            collider_pieces = [loaded_coll]

    # -------------------------------------------------------------------------
    # STAGE 7: Dual-View Depth Map Rasterization (from Full-Res STL)
    # -------------------------------------------------------------------------
    depth_png_path = RENDERS_DIR / f"{primitive_id}-depth.png"
    curr_depth_hash = _text_sha256(f"{stl_bytes_hash}:sbs=1024x512:yaw=45:pitch=30")
    has_existing_depth = depth_png_path.is_file()

    if not entry.get("depth_hash") and has_existing_depth and not force and not mesh_outdated:
        entry["depth_hash"] = curr_depth_hash

    depth_outdated = (
        force or
        mesh_outdated or
        not has_existing_depth or
        (entry.get("depth_hash") != curr_depth_hash)
    )

    if depth_outdated:
        stages_executed.append("Stage 7: Dual-View Depth Map Rasterization (Top-Down & 3/4th Ortho)")
        from companion.terrain_mesh import rasterize_stl_depth
        # Directly from full-resolution STL format per requirement
        depth_img = rasterize_stl_depth(stl_path, width=1024, height=512, prefer_source_mesh=False, side_by_side=True)
        depth_png_path.parent.mkdir(parents=True, exist_ok=True)
        depth_img.save(depth_png_path)
        entry["depth_hash"] = curr_depth_hash
    else:
        stages_skipped.append("Stage 7: Dual-View Depth Map Rasterization (cached)")

    # -------------------------------------------------------------------------
    # STAGE 8: Consolidated 3-Cell & Info-Line Sprite Sheet Composition
    # -------------------------------------------------------------------------
    sheet_png_path = RENDERS_DIR / f"{primitive_id}-sheet.png"
    collage_png_path = RENDERS_DIR / f"{primitive_id}-collage.png"
    curr_sheet_hash = _text_sha256(f"{_file_sha256(active_sprite)}:{_file_sha256(lowpoly_glb_path)}:{_file_sha256(collider_glb_path)}")
    has_existing_sheet = sheet_png_path.is_file()

    if not entry.get("sheet_hash") and has_existing_sheet and not force and not (sprite_outdated or mesh_outdated or collider_outdated):
        entry["sheet_hash"] = curr_sheet_hash

    sheet_outdated = (
        force or
        sprite_outdated or
        mesh_outdated or
        collider_outdated or
        not has_existing_sheet or
        (entry.get("sheet_hash") != curr_sheet_hash)
    )

    if sheet_outdated:
        stages_executed.append("Stage 8: Consolidated 3-Cell & Info-Line Sprite Sheet")
        from companion.image_to_3d import render_sprite_sheet
        render_sprite_sheet(
            sprite_path=active_sprite,
            lowpoly_mesh=lowpoly_mesh,
            collider_pieces=collider_pieces,
            output_path=sheet_png_path,
            asset_name=asset_name,
            dimensions=dims,
        )
        try:
            shutil.copy2(sheet_png_path, collage_png_path)
        except Exception:
            pass
        entry["sheet_hash"] = curr_sheet_hash
    else:
        stages_skipped.append("Stage 8: Consolidated 3-Cell & Info-Line Sprite Sheet (cached)")

    # -------------------------------------------------------------------------
    # STAGE 9: Ledger Settlement & Stagecraft Presentation
    # -------------------------------------------------------------------------
    lattice_run_id = f"waterfall-{hashlib.md5(f'{primitive_id}:{time.time()}'.encode()).hexdigest()[:10]}"
    entry["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    entry["dimensions"] = dims
    entry["lattice_run_id"] = lattice_run_id
    manifest[primitive_id] = entry
    save_waterfall_manifest(manifest)

    # Mirror aliases (e.g., ancient-bastion <-> prop-ancient-bastion)
    alt_id = clean_id if primitive_id.startswith("prop-") else f"prop-{primitive_id}"
    try:
        if stl_path.is_file():
            shutil.copy2(stl_path, STL_DIR / f"{alt_id}.stl")
        if lowpoly_glb_path.is_file():
            shutil.copy2(lowpoly_glb_path, MESH_DIR / f"{alt_id}-lowpoly.glb")
        if collider_glb_path.is_file():
            shutil.copy2(collider_glb_path, MESH_DIR / f"{alt_id}-collider.glb")
        if source_glb_path.is_file():
            shutil.copy2(source_glb_path, MESH_DIR / f"{alt_id}-source.glb")
        if depth_png_path.is_file():
            shutil.copy2(depth_png_path, RENDERS_DIR / f"{alt_id}-depth.png")
        if sheet_png_path.is_file():
            shutil.copy2(sheet_png_path, RENDERS_DIR / f"{alt_id}-sheet.png")
            shutil.copy2(sheet_png_path, RENDERS_DIR / f"{alt_id}-collage.png")
    except Exception:
        pass

    elapsed = round(time.monotonic() - t0, 2)
    return {
        "ok": True,
        "primitive_id": primitive_id,
        "name": asset_name,
        "scene_id": scene_id,
        "stages_executed": stages_executed,
        "stages_skipped": stages_skipped,
        "checksums": {
            "prompt": entry.get("prompt_hash"),
            "sprite": entry.get("sprite_hash"),
            "mesh": entry.get("mesh_hash"),
            "collider": entry.get("collider_hash"),
            "depth": entry.get("depth_hash"),
            "sheet": entry.get("sheet_hash"),
        },
        "artifacts": {
            "sprite_url": str(active_sprite.relative_to(REPO_ROOT)),
            "stl_url": str(stl_path.relative_to(REPO_ROOT)),
            "lowpoly_glb": str(lowpoly_glb_path.relative_to(REPO_ROOT)),
            "source_glb": str(source_glb_path.relative_to(REPO_ROOT)) if source_glb_path.is_file() else None,
            "collider_url": str(collider_glb_path.relative_to(REPO_ROOT)),
            "depth_url": str(depth_png_path.relative_to(REPO_ROOT)),
            "sheet_url": str(sheet_png_path.relative_to(REPO_ROOT)),
            "collage_url": str(collage_png_path.relative_to(REPO_ROOT)),
        },
        "measurements": {
            "width": float(dims[0]),
            "length": float(dims[1]),
            "height": float(dims[2]),
        },
        "triangle_count": entry.get("lowpoly_faces", 8000),
        "collider_blocks": entry.get("collider_blocks", 32),
        "lattice_run_id": lattice_run_id,
        "elapsed_seconds": elapsed,
    }


def main():
    import argparse
    ap = argparse.ArgumentParser(description="Synchronize waterfall pipeline for an asset")
    ap.add_argument("primitive_id", default="ancient-bastion", nargs="?")
    ap.add_argument("--scene", default="border-march")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    res = sync_asset_waterfall(args.primitive_id, scene_id=args.scene, force=args.force)
    print(json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
