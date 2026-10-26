#!/usr/bin/env python3
"""
companion/run_floorplan_diffusion_tests.py

Empirical test suite measuring spatial/layout control over
MOSS-Image-SFT when generating 2D architectural floor plans from placed 3D assets.

Tests 5 progressive degrees of conditioning against the ground-truth 16-asset
top-down orthographic room map (`library/floorplans/furniture-room.json`):
  1. `text_only`: Verbal room + furniture description only.
  2. `flux3_layout_bbox`: MOSS-Image-SFT native `<obj_N>` layout bounding-box table (`build_moss_image_layout_prompt`).
  3. `ref_latent_blueprint`: MOSS-Image-SFT `ReferenceLatent` (`image_cond` stream) conditioned on `blueprint_map.png` (`denoise=1.0`).
  4. `img2img_denoise_070`: Orthographic 2D composite map + `VAEEncode` + `ReferenceLatent` (`denoise=0.70`).
  5. `img2img_denoise_045`: Orthographic 2D composite map + `VAEEncode` + `ReferenceLatent` (`denoise=0.45`).

Quantitative metrics (`evaluate_diffusion_control`) and a visual comparison sheet
with ground-truth 3D footprint overlays are written to the output directory.
"""

from __future__ import annotations

import argparse
import io
import json
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.ortho_floorplan import (
     _font,
    build_flux3_layout_prompt,
    compose_room_map,
    evaluate_diffusion_control,
    load_room_scene,
    save_ortho_bundle,
)
from companion.render_sheets import (
    Comfy,
    pick_clip,
    pick_clip_type,
    pick_unet,
    pick_vae,
    save_workflow_snapshot,
    COMFY_WORKFLOWS_DIR,
)

COMFY_INPUT_DIR = Path.home() / "ComfyUI" / "input"
DEFAULT_SERVER = "http://127.0.0.1:8080/upstream/comfyui"


def _base_loader_nodes() -> dict:
    unet_name = pick_unet()
    clip_name = pick_clip()
    clip_type = pick_clip_type(clip_name, unet_name)
    if unet_name.endswith(".gguf"):
        unet_node = {
            "class_type": "UnetLoaderGGUF",
            "inputs": {"unet_name": unet_name},
        }
    else:
        unet_node = {
            "class_type": "UNETLoader",
            "inputs": {"unet_name": unet_name, "weight_dtype": "default"},
        }
    return {
        "1": unet_node,
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": clip_name,
                "type": clip_type,
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": pick_vae()},
        },
    }


def build_condition_workflow(
    condition_id: str,
    prompt_text: str,
    width: int = 1024,
    height: int = 1024,
    seed: int = 424242,
    steps: int = 25,
    cfg: float = 3.0,
    denoise: float = 1.0,
    ref_image_name: str | None = None,
    use_img2img_latent: bool = False,
    attach_ref_latent: bool = True,
    snapshot_name: str | Path | None = None,
) -> dict:
    graph = _base_loader_nodes()
    graph["4"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": ["2", 0], "text": prompt_text},
    }
    graph["5"] = {
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": ["2", 0], "text": ""},
    }

    pos_cond = ["4", 0]
    neg_cond = ["5", 0]

    if ref_image_name is not None:
        graph["10"] = {
            "class_type": "LoadImage",
            "inputs": {"image": ref_image_name},
        }
        graph["11"] = {
            "class_type": "VAEEncode",
            "inputs": {"pixels": ["10", 0], "vae": ["3", 0]},
        }
        if attach_ref_latent:
            graph["12"] = {
                "class_type": "ReferenceLatent",
                "inputs": {"conditioning": ["4", 0], "latent": ["11", 0]},
            }
            graph["13"] = {
                "class_type": "ReferenceLatent",
                "inputs": {"conditioning": ["5", 0], "latent": ["11", 0]},
            }
            pos_cond = ["12", 0]
            neg_cond = ["13", 0]

    if use_img2img_latent and ref_image_name is not None:
        latent_input = ["11", 0]
    else:
        graph["6"] = {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1},
        }
        latent_input = ["6", 0]

    graph["7"] = {
        "class_type": "KSampler",
        "inputs": {
            "model": ["1", 0],
            "positive": pos_cond,
            "negative": neg_cond,
            "latent_image": latent_input,
            "seed": seed,
            "steps": steps,
            "cfg": cfg,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": denoise,
        },
    }
    graph["8"] = {
        "class_type": "VAEDecode",
        "inputs": {"samples": ["7", 0], "vae": ["3", 0]},
    }
    graph["9"] = {
        "class_type": "SaveImage",
        "inputs": {
            "images": ["8", 0],
            "filename_prefix": f"floorplan_test/{condition_id}",
        },
    }
    if snapshot_name is not None:
        save_workflow_snapshot(graph, snapshot_name)
    return graph


def draw_gt_overlay(gen_img: Image.Image, ortho_res: dict) -> Image.Image:
    """
    Overlay ground-truth 3D orthographic asset silhouettes (cyan contours) and
    bounding boxes onto a diffusion-generated floor plan to visualize spatial adherence.
    """
    overlay = gen_img.convert("RGB").copy()
    arr = np.asarray(overlay, dtype=np.uint8).copy()

    for pid, matte in ortho_res["mattes"].items():
        gy, gx = np.gradient(matte)
        contour = np.hypot(gx, gy) > 0.18
        # Bright cyan contour for exact 3D mesh top-down silhouette
        arr[contour] = (0, 235, 255)

    out = Image.fromarray(arr)
    draw = ImageDraw.Draw(out)
    font = _font(11)
    for rec in ortho_res["props"]:
        bx0, by0, bx1, by1 = rec["bbox_px"]
        draw.rectangle([bx0, by0, bx1, by1], outline=(255, 210, 40), width=1)
        draw.text((bx0 + 2, max(0, by0 - 13)), rec["id"], fill=(255, 230, 80), font=font)
    return out


def build_comparison_sheet(
    ortho_res: dict,
    condition_outputs: list[tuple[str, str, Image.Image, Image.Image, dict]],
    out_path: Path,
) -> None:
    """
    Build a 2-row x (1 + N)-column visual comparison sheet:
      - Row 1: Ground-truth 2D Composite Map + Raw Diffusion Outputs for each condition
      - Row 2: Ground-truth Annotated Blueprint + Diffusion Outputs with 3D GT Silhouette Overlays & Metrics
    """
    tile_s = 384
    pad = 16
    header_h = 68
    cols = 1 + len(condition_outputs)
    W = cols * tile_s + (cols + 1) * pad
    H = 2 * (tile_s + header_h) + 3 * pad

    sheet = Image.new("RGB", (W, H), (248, 246, 240))
    draw = ImageDraw.Draw(sheet)
    title_font = _font(14)
    meta_font = _font(12)

    # Column 0: Ground-Truth Orthographic 3D-to-2D Map
    gt_comp = ortho_res["composite_map"].resize((tile_s, tile_s), Image.Resampling.LANCZOS)
    gt_ann = ortho_res["annotated_map"].resize((tile_s, tile_s), Image.Resampling.LANCZOS)

    x0 = pad
    y_row1 = pad
    y_row2 = pad * 2 + tile_s + header_h

    sheet.paste(gt_comp, (x0, y_row1 + header_h))
    draw.rectangle([x0, y_row1 + header_h, x0 + tile_s, y_row1 + header_h + tile_s], outline=(60, 55, 50), width=2)
    draw.text((x0, y_row1 + 6), "0. Ground Truth: 3D Ortho Composite", fill=(25, 22, 18), font=title_font)
    draw.text((x0, y_row1 + 26), "16 .glb meshes -> top-down ortho @ 88.3 px/m", fill=(85, 78, 70), font=meta_font)
    draw.text((x0, y_row1 + 44), "Recall: 100.0% | Local IoU: 1.000 | Detected: 16/16", fill=(20, 110, 50), font=meta_font)

    sheet.paste(gt_ann, (x0, y_row2 + header_h))
    draw.rectangle([x0, y_row2 + header_h, x0 + tile_s, y_row2 + header_h + tile_s], outline=(60, 55, 50), width=2)
    draw.text((x0, y_row2 + 6), "0. Ground Truth: Annotated Room Map", fill=(25, 22, 18), font=title_font)
    draw.text((x0, y_row2 + 26), "Zones + 1m grid + walls + portals + prop labels", fill=(85, 78, 70), font=meta_font)

    for idx, (cid, label, gen_img, ov_img, metrics) in enumerate(condition_outputs, start=1):
        xc = pad + idx * (tile_s + pad)
        g_thumb = gen_img.resize((tile_s, tile_s), Image.Resampling.LANCZOS)
        o_thumb = ov_img.resize((tile_s, tile_s), Image.Resampling.LANCZOS)

        rec_pct = metrics["mean_footprint_recall"] * 100.0
        iou_val = metrics["mean_local_iou"]
        det_pct = metrics["props_detected_pct"]
        edge_f1 = metrics["edge_f1"]

        sheet.paste(g_thumb, (xc, y_row1 + header_h))
        draw.rectangle([xc, y_row1 + header_h, xc + tile_s, y_row1 + header_h + tile_s], outline=(60, 55, 50), width=2)
        draw.text((xc, y_row1 + 6), f"{idx}. {label}", fill=(25, 22, 18), font=title_font)
        draw.text((xc, y_row1 + 26), f"Condition ID: {cid}", fill=(85, 78, 70), font=meta_font)
        draw.text(
            (xc, y_row1 + 44),
            f"Recall: {rec_pct:.1f}% | IoU: {iou_val:.3f} | Det: {det_pct:.0f}%",
            fill=(20, 95, 145),
            font=meta_font,
        )

        sheet.paste(o_thumb, (xc, y_row2 + header_h))
        draw.rectangle([xc, y_row2 + header_h, xc + tile_s, y_row2 + header_h + tile_s], outline=(60, 55, 50), width=2)
        draw.text((xc, y_row2 + 6), f"{idx}. 3D GT Silhouette Overlay (Cyan)", fill=(25, 22, 18), font=title_font)
        draw.text(
            (xc, y_row2 + 26),
            f"Edge F1: {edge_f1:.3f} | Yellow = 3D BBox, Cyan = 3D Mesh",
            fill=(85, 78, 70),
            font=meta_font,
        )

    sheet.save(out_path)


def free_comfy_vram(server: str) -> None:
    url = server.rstrip("/") + "/free"
    payload = json.dumps({"unload_models": True, "free_memory": True}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15.0) as _:
            pass
    except Exception as exc:
        print(f"Warning: /free returned {exc}", file=sys.stderr)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run empirical MOSS-Image-SFT floor plan spatial control tests.")
    parser.add_argument(
        "scene",
        nargs="?",
        default=str(REPO_ROOT / "library" / "floorplans" / "furniture-room.json"),
        help="Floor plan JSON with placed 3D .glb props",
    )
    parser.add_argument(
        "--out",
        default=str(REPO_ROOT / "renders" / "floorplans" / "furniture-room"),
        help="Output directory for ortho bundle and diffusion control tests",
    )
    parser.add_argument("--server", default=DEFAULT_SERVER, help="ComfyUI server URL")
    parser.add_argument("--steps", type=int, default=25, help="MOSS-Image-SFT sampling steps (default: 25)")
    parser.add_argument("--seed", type=int, default=424242, help="Deterministic RNG seed")
    parser.add_argument("--reuse-existing", action="store_true", help="Reuse existing condition PNGs if already rendered")
    args = parser.parse_args()

    out_root = Path(args.out)
    ortho_dir = out_root / "ortho_gt"
    diff_dir = out_root / "diffusion_tests"
    diff_dir.mkdir(parents=True, exist_ok=True)

    scene = load_room_scene(Path(args.scene))
    print(f"[1/4] Rendering 3D assets from top-down orthographic view -> {ortho_dir}")
    bundle = save_ortho_bundle(scene, ortho_dir, supersample=2)
    sidecar = bundle["sidecar"]
    ortho_res = bundle["result"]

    # Copy conditioning maps into ComfyUI/input/
    COMFY_INPUT_DIR.mkdir(parents=True, exist_ok=True)
    comp_input_name = "spritequest_ortho_composite.png"
    bp_input_name = "spritequest_ortho_blueprint.png"
    shutil.copyfile(ortho_dir / "composite_map.png", COMFY_INPUT_DIR / comp_input_name)
    shutil.copyfile(ortho_dir / "blueprint_map.png", COMFY_INPUT_DIR / bp_input_name)

    verbal_prompt = (
        "Top-down 90-degree orthographic architectural 2D floor plan of a 10m by 10m "
        "medieval timber-and-stone domestic lodge room on warm parchment with thick dark "
        "stone perimeter walls, a southern entry door with swing arc, an eastern passage "
        "door, and a western casement window. Along the northern wall from west to east "
        "sit four wooden storage pieces: a wardrobe, a bookcase, a dresser, and a cabinet. "
        "In the central parlor sit a standing mirror near the west wall, a large rectangular "
        "wooden dining table at the center with a wooden chair to its west, a round stool to "
        "its east, a wooden bench to its south, and a folding screen in the northeast. "
        "In the southern sleeping alcove sit a washstand and coat-stand on the west, a wooden "
        "bed and rocking cradle in the southwest, a nightstand in the southeast, and a large "
        "round wooden sideboard table in the east. Clean hand-inked architectural blueprint "
        "illustration, flat orthographic plan projection, crisp dark furniture outlines."
    )

    layout_prompt = sidecar["flux3_layout_prompt"]

    ref_bp_prompt = (
        "Using <ref_image_0> as the exact room-scale architectural layout blueprint, render a "
        "detailed top-down orthographic 2D RPG architectural floor plan on warm parchment. "
        "Keep every piece of wooden furniture, wall, and doorway in the exact position, "
        "orientation, and footprint shown in <ref_image_0>, adding rich hand-inked wood grain, "
        "stone masonry wall hatching, woven rug and floorboard textures."
    )

    ref_comp_prompt = (
        "Using <ref_image_0> as the exact 3D-shaded orthographic room map, transform it into "
        "a richly illustrated top-down 2D RPG architectural floor plan on warm parchment. "
        "Preserve every piece of furniture's exact 3D top-down relief details (including the "
        "washstand basin bowl, rocking cradle pillow, chair backrest, and round sideboard top), "
        "metric position, and angle from <ref_image_0>, while rendering hand-inked medieval "
        "stone walls, wooden plank flooring, and warm candlelit shadows."
    )

    img2img_prompt = (
        "Top-down orthographic 2D architectural floor plan illustration on warm parchment, "
        "hand-inked RPG battlemap style, finely detailed wood grain furniture top views, "
        "stone masonry perimeter walls, subtle ambient occlusion shadows, crisp ink contours."
    )

    conditions = [
        {
            "id": "1_text_only",
            "label": "Text Prompt Only (Verbal Layout)",
            "prompt": verbal_prompt,
            "denoise": 1.0,
            "ref_image": None,
            "use_img2img": False,
            "attach_ref_latent": False,
        },
        {
            "id": "2_flux3_layout_bbox",
            "label": "Flux3LayoutPrompt (<obj_N> BBoxes)",
            "prompt": layout_prompt,
            "denoise": 1.0,
            "ref_image": None,
            "use_img2img": False,
            "attach_ref_latent": False,
        },
        {
            "id": "3_ref_latent_blueprint",
            "label": "ReferenceLatent (2D Blueprint, d=1.0)",
            "prompt": ref_bp_prompt,
            "denoise": 1.0,
            "ref_image": bp_input_name,
            "use_img2img": False,
            "attach_ref_latent": True,
        },
        {
            "id": "4_ref_latent_composite",
            "label": "ReferenceLatent (3D Ortho Shaded, d=1.0)",
            "prompt": ref_comp_prompt,
            "denoise": 1.0,
            "ref_image": comp_input_name,
            "use_img2img": False,
            "attach_ref_latent": True,
        },
        {
            "id": "5_img2img_only_d075",
            "label": "Pure VAEEncode Img2Img (No Ref, d=0.75)",
            "prompt": img2img_prompt,
            "denoise": 0.75,
            "ref_image": comp_input_name,
            "use_img2img": True,
            "attach_ref_latent": False,
        },
    ]

    comfy = Comfy(args.server, timeout=900.0)
    summary_rows = []
    condition_outputs = []
    ran_comfy = False

    try:
        for idx, cond in enumerate(conditions, start=1):
            cid = cond["id"]
            gen_path = diff_dir / f"{cid}.png"
            if args.reuse_existing and gen_path.is_file():
                print(f"[2/4] Reusing existing Condition {idx}/{len(conditions)}: {cid} ...")
                gen_img = Image.open(gen_path).convert("RGB")
                elapsed = 0.0
            else:
                print(f"[2/4] Running Condition {idx}/{len(conditions)}: {cid} ({cond['label']}) ...")
                t0 = time.time()
                wf = build_condition_workflow(
                    condition_id=cid,
                    prompt_text=cond["prompt"],
                    width=1024,
                    height=1024,
                    seed=args.seed,
                    steps=args.steps,
                    cfg=1.0,
                    denoise=cond["denoise"],
                    ref_image_name=cond["ref_image"],
                    use_img2img_latent=cond["use_img2img"],
                    attach_ref_latent=cond["attach_ref_latent"],
                    snapshot_name=f"floorplan_{cid}.json",
                )
                img_bytes = comfy.run(wf)
                ran_comfy = True
                elapsed = time.time() - t0
                gen_path.write_bytes(img_bytes)
                gen_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

            metrics = evaluate_diffusion_control(gen_img, ortho_res)
            metrics["condition_id"] = cid
            metrics["label"] = cond["label"]
            metrics["denoise"] = cond["denoise"]
            metrics["elapsed_sec"] = round(elapsed, 2)

            ov_img = draw_gt_overlay(gen_img, ortho_res)
            ov_path = diff_dir / f"{cid}_gt_overlay.png"
            ov_img.save(ov_path)

            condition_outputs.append((cid, cond["label"], gen_img, ov_img, metrics))
            summary_rows.append(metrics)

            print(
                f"      -> Done in {elapsed:.1f}s | "
                f"Footprint Recall: {metrics['mean_footprint_recall']*100:.1f}% | "
                f"Local IoU: {metrics['mean_local_iou']:.3f} | "
                f"Props Detected: {metrics['props_detected_pct']:.1f}% | "
                f"Edge F1: {metrics['edge_f1']:.3f}"
            )
    finally:
        if ran_comfy:
            print("[3/4] Releasing ComfyUI VRAM via /free ...")
            free_comfy_vram(args.server)

    comp_sheet_path = diff_dir / "comparison_grid.png"
    build_comparison_sheet(ortho_res, condition_outputs, comp_sheet_path)

    report = {
        "scene_id": scene.id,
        "model": pick_unet(),
        "text_encoder": pick_clip(),
        "vae": pick_vae(),
        "seed": args.seed,
        "steps": args.steps,
        "resolution": list(scene.res),
        "px_per_m": round(ortho_res["camera"].px_per_m, 3),
        "conditions": summary_rows,
    }
    report_path = diff_dir / "control_metrics_report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"[4/4] Saved quantitative report to {report_path} and visual grid to {comp_sheet_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
