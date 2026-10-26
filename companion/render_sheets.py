#!/usr/bin/env python3
"""
companion/render_sheets.py

Batch-render NPC character sheets through a local ComfyUI server using
MOSS-Image-SFT.

Each NPC is a JSON sheet describing facets: portrait, home, favored_items,
aspirations, and cutout (an isolated figure for 2.5D anchoring).
Every facet becomes one image rendered via MOSS-Image-SFT.

Stdlib only. Talks HTTP to ComfyUI.

Usage:
    python3 companion/render_sheets.py --dry-run                 # dry-run all NPC sheets
    python3 companion/render_sheets.py companion/npcs/hollis.json --dry-run
    python3 companion/render_sheets.py --server http://127.0.0.1:8188
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import random
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
NPCS_DIR = REPO_ROOT / "companion" / "npcs"
RENDERS_DIR = REPO_ROOT / "renders"
COMFY_WORKFLOWS_DIR = REPO_ROOT / "workflows" / "comfyui"

COMFY_MODELS = Path(
    os.environ.get("COMFY_MODELS", Path.home() / "ComfyUI" / "models")
)

# --- MOSS-Image-SFT Model Candidates -----------------------------------------
DIFFUSION_CANDIDATES = [
    "moss_image_sft_bf16.safetensors",
    "moss_image_sft_int8_convrot.safetensors",
    "moss-image-sft-bf16.safetensors",
    "moss_image_sft.safetensors",
    "moss-image-sft.safetensors",
    "moss_image_sft_sd_Q4_K_M.gguf",
    "flux3_image_klein_sd_Q4_K_M.gguf",
    "flux_3_image_klein_int8_convrot.safetensors",
    "flux3-image-klein-sd-int8-convrot.safetensors",
    "flux_3_image_klein_distilled_fp8.safetensors",
    "flux_3_image_klein_distilled_int8.safetensors",
    "flux_3_image_klein_bf16.safetensors",
    "flux_3_image_klein.safetensors",
    "flux1-dev-fp8.safetensors",
    "flux1-schnell-fp8.safetensors",
]

CLIP_CANDIDATES = [
    "qwen3.5_9b_int8_convrot.safetensors",
    "qwen3.5_9b_bf16.safetensors",
    "qwen3.5_9b_w4a8_gptq.safetensors",
    "qwen3.5_9b_moss_image_w4a8.safetensors",
    "qwen3vl_4b_int8_convrot.safetensors",
    "qwen3.5_9b_flux3_prompt_upsampler_w4a8.safetensors",
    "qwen3vl_8b_w4a8.safetensors",
    "qwen3vl_8b_int8_convrot.safetensors",
    "t5xxl_fp8_e4m3fn.safetensors",
    "clip_l.safetensors",
]

VAE_CANDIDATES = [
    "flux2-vae.safetensors",
    "flux_vae.safetensors",
    "ae.safetensors",
    "flux2_vae.safetensors",
    "qwen_image_2.1_vae_bf16.safetensors",
]


def pick_first(dir_path: Path, candidates: list[str]) -> str:
    """Return the filename of the first candidate present on disk, or the top candidate."""
    for name in candidates:
        if (dir_path / name).is_file() and (dir_path / name).stat().st_size > 0:
            return name
    return candidates[0]


def pick_unet() -> str:
    return pick_first(COMFY_MODELS / "diffusion_models", DIFFUSION_CANDIDATES)


def pick_clip() -> str:
    return pick_first(COMFY_MODELS / "text_encoders", CLIP_CANDIDATES)


def pick_vae() -> str:
    return pick_first(COMFY_MODELS / "vae", VAE_CANDIDATES)


def pick_clip_type(clip_name: str | None = None, unet_name: str | None = None) -> str:
    """Determine the CLIPLoader type compatible with the diffusion model and text encoder."""
    unet = (unet_name or pick_unet()).lower()
    clip = (clip_name or pick_clip()).lower()
    if "moss" in unet or "moss" in clip:
        return "moss_image"
    if "flux3" in unet or "klein" in unet or "flux3" in clip:
        return "flux3"
    if "flux" in unet:
        return "flux2"
    if "qwen_image" in unet or "qwen" in unet:
        return "qwen_image"
    return "flux3"


# --- Sampling defaults (MOSS-Image-SFT DiT) ----------------------------------
DEFAULT_STEPS = 25
DEFAULT_CFG = 3.0
DEFAULT_SAMPLER = "euler"
DEFAULT_SCHEDULER = "simple"
DEFAULT_DENOISE = 1.0

# --- Style preamble ----------------------------------------------------------
DEFAULT_STYLE = (
    "Retro JRPG character art, sword and sorcery, 16-bit pixel aesthetic with "
    "painterly shading, limited colour palette, sprite-sheet clarity, "
    "hand-drawn game illustration."
)

# --- Facets and aspect dimensions --------------------------------------------
FACET_SIZES = {
    "portrait": (1024, 1536),
    "home": (1536, 1024),
    "favored_items": (1024, 1024),
    "aspirations": (1536, 1024),
    "cutout": (1024, 1536),
}


def cutout_instruction(full_figure: bool = False) -> str:
    """Isolation clause for a cutout prompt."""
    parts = [
        "a full-figure character cutout" if full_figure else "a prop cutout",
        "the subject is completely isolated on an untextured, flat solid grey background",
        "no shadows cast on the backdrop, clean sharp silhouette, ready for alpha matting",
    ]
    return ", ".join(parts)


def brief_for(sheet: dict, fragment: str) -> str:
    who = sheet.get("name", "")
    role = sheet.get("role", "")
    subject = f"{who}, {role}" if role else who
    return ". ".join(p.strip().rstrip(".") for p in (subject, fragment) if p) + "."


def assemble(style: str, body: str, facet: str | None = None) -> str:
    parts = [style, body]
    if facet == "cutout":
        parts.append(cutout_instruction(full_figure=True))
    return ". ".join(p.strip().rstrip(".") for p in parts if p) + "."


def full_prompt(sheet: dict, fragment: str, facet: str | None = None, scene_id: str = "customs-house") -> str:
    try:
        from companion.fragment_compiler import compile_npc_facet_brief
        brief = compile_npc_facet_brief(sheet, facet or "portrait", fragment, scene_id=scene_id)
        return brief.rewritten_prompt
    except Exception:
        return assemble(sheet.get("style", DEFAULT_STYLE), brief_for(sheet, fragment), facet)


def facets_of(sheet: dict) -> list[tuple[str, list[str]]]:
    out = []
    for key in ("portrait", "home", "favored_items", "aspirations", "cutout"):
        val = sheet.get(key)
        if val is None:
            continue
        if isinstance(val, str):
            val = [val]
        if not isinstance(val, list) or not val:
            continue
        out.append((key, [str(v) for v in val]))
    return out


# --- ComfyUI Graph Builder for MOSS-Image-SFT --------------------------------
def save_workflow_snapshot(workflow: dict, filename_or_path: str | Path) -> Path:
    """Save a snapshot of a built ComfyUI workflow JSON into workflows/comfyui/."""
    COMFY_WORKFLOWS_DIR.mkdir(parents=True, exist_ok=True)
    if isinstance(filename_or_path, Path):
        out_path = filename_or_path
    else:
        name = str(filename_or_path)
        if not name.endswith(".json"):
            name = f"{name}.json"
        out_path = COMFY_WORKFLOWS_DIR / name
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(workflow, f, indent=2)
    return out_path


def build_moss_image_workflow(
    prompt: str,
    negative: str,
    seed: int,
    width: int,
    height: int,
    prefix: str,
    steps: int = DEFAULT_STEPS,
    cfg: float = DEFAULT_CFG,
    sampler: str = DEFAULT_SAMPLER,
    scheduler: str = DEFAULT_SCHEDULER,
    snapshot_name: str | Path | None = None,
) -> dict:
    """Build ComfyUI API graph for MOSS-Image-SFT."""
    unet_name = pick_unet()
    clip_name = pick_clip()
    clip_type = pick_clip_type(clip_name, unet_name)
    if unet_name.endswith(".gguf"):
        unet_node = {
            "class_type": "UnetLoaderGGUF",
            "inputs": {
                "unet_name": unet_name,
            },
        }
    else:
        unet_node = {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": unet_name,
                "weight_dtype": "default",
            },
        }
    workflow = {
        "1": unet_node,
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": clip_name,
                "type": clip_type,
                "device": "default"
            }
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": pick_vae()
            }
        },
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": prompt
            }
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "clip": ["2", 0],
                "text": negative
            }
        },
        "6": {
            "class_type": "EmptyFlux2LatentImage",
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1
            }
        },
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "model": ["1", 0],
                "positive": ["4", 0],
                "negative": ["5", 0],
                "latent_image": ["6", 0],
                "seed": seed,
                "steps": steps,
                "cfg": cfg,
                "sampler_name": sampler,
                "scheduler": scheduler,
                "denoise": DEFAULT_DENOISE
            }
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["7", 0],
                "vae": ["3", 0]
            }
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "images": ["8", 0],
                "filename_prefix": prefix
            }
        }
    }
    if snapshot_name is not None:
        save_workflow_snapshot(workflow, snapshot_name)
    return workflow


# Backwards compatibility alias
build_flux_workflow = build_moss_image_workflow


class ComfyError(RuntimeError):
    pass


class Comfy:
    def __init__(self, server: str, timeout: float = 600.0):
        self.server = server.rstrip("/")
        self.timeout = timeout

    def _get(self, path: str) -> bytes:
        with urllib.request.urlopen(self.server + path, timeout=self.timeout) as r:
            return r.read()

    def _post(self, path: str, payload: dict) -> dict:
        body = json.dumps(payload).encode()
        req = urllib.request.Request(
            self.server + path, data=body, method="POST",
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=self.timeout) as r:
            return json.loads(r.read() or b"{}")

    def alive(self) -> bool:
        try:
            self._get("/system_stats")
            return True
        except (urllib.error.URLError, OSError):
            return False

    def queue(self, workflow: dict) -> str:
        out = self._post("/prompt", {"prompt": workflow, "client_id": uuid.uuid4().hex})
        if "prompt_id" not in out:
            raise ComfyError(f"queue rejected: {json.dumps(out)[:500]}")
        return out["prompt_id"]

    def wait(self, prompt_id: str) -> dict:
        deadline = time.monotonic() + self.timeout
        while time.monotonic() < deadline:
            hist = json.loads(self._get(f"/history/{prompt_id}") or b"{}")
            entry = hist.get(prompt_id)
            if entry:
                if entry.get("status", {}).get("status_str") == "error":
                    raise ComfyError(f"workflow errored: {json.dumps(entry)[:800]}")
                return entry.get("outputs", {})
            time.sleep(0.4)
        raise ComfyError(f"timed out waiting for {prompt_id}")

    def fetch(self, filename: str, subfolder: str, typ: str) -> bytes:
        q = urllib.parse.urlencode({"filename": filename, "subfolder": subfolder, "type": typ})
        return self._get(f"/view?{q}")

    def run(self, workflow: dict) -> bytes:
        pid = self.queue(workflow)
        outputs = self.wait(pid)
        for node_out in outputs.values():
            for img in node_out.get("images", []):
                return self.fetch(img["filename"], img.get("subfolder", ""), img.get("type", "output"))
        raise ComfyError(f"no image output in {pid}: {outputs}")


def main():
    parser = argparse.ArgumentParser(description="Render NPC sheets with MOSS-Image-SFT via ComfyUI.")
    parser.add_argument("sheets", nargs="*", help="Path(s) to NPC sheet JSON file(s). Defaults to companion/npcs/*.json")
    parser.add_argument("--server", default=os.environ.get("COMFY_SERVER", "http://127.0.0.1:8080/upstream/comfyui"), help="ComfyUI server URL (default: http://127.0.0.1:8080/upstream/comfyui via llama-swap)")
    parser.add_argument("--dry-run", action="store_true", help="Print prompt assembly and graph without calling ComfyUI")
    parser.add_argument("--facets", nargs="*", help="Limit rendering to specific facets (e.g. portrait, home)")
    parser.add_argument("--scene", default="customs-house", help="Host floorplan scene ID for coherence backpressure (default: customs-house)")
    parser.add_argument("--live-llm", action="store_true", help="Enable live local LLM synthesis for unresolved facet prompts")
    parser.add_argument("--steps", type=int, default=DEFAULT_STEPS, help=f"Sampling steps (default: {DEFAULT_STEPS})")
    parser.add_argument("--cfg", type=float, default=DEFAULT_CFG, help=f"CFG scale (default: {DEFAULT_CFG})")
    parser.add_argument("--seed", type=int, help="Fixed random seed (random if omitted)")
    parser.add_argument("--no-snapshot", action="store_true", help="Disable saving ComfyUI JSON workflow snapshots to workflows/comfyui/")

    args = parser.parse_args()

    # Collect sheets
    sheet_paths = []
    if args.sheets:
        for s in args.sheets:
            p = Path(s)
            if p.is_file():
                sheet_paths.append(p)
            elif (NPCS_DIR / f"{s}.json").is_file():
                sheet_paths.append(NPCS_DIR / f"{s}.json")
            else:
                print(f"Warning: sheet {s} not found, skipping", file=sys.stderr)
    else:
        sheet_paths = sorted(NPCS_DIR.glob("*.json"))

    if not sheet_paths:
        print("No NPC sheets found to render.", file=sys.stderr)
        return 1

    print(f"Diffusion Engine: MOSS-Image-SFT")
    print(f"Diffusion Model:  {pick_unet()}")
    print(f"Text Encoder:     {pick_clip()}")
    print(f"VAE:              {pick_vae()}")
    print(f"Processing {len(sheet_paths)} NPC sheets...\n")

    comfy = Comfy(args.server)
    if not args.dry_run:
        if not comfy.alive():
            print(f"Error: ComfyUI server unreachable at {args.server}", file=sys.stderr)
            print("Start ComfyUI first or run with --dry-run.", file=sys.stderr)
            return 1

    for sheet_path in sheet_paths:
        try:
            with open(sheet_path, "r", encoding="utf-8") as f:
                sheet = json.load(f)
        except Exception as e:
            print(f"Error loading {sheet_path.name}: {e}", file=sys.stderr)
            continue

        name = sheet.get("name", sheet_path.stem)
        slug = sheet_path.stem
        all_facets = facets_of(sheet)

        if args.facets:
            all_facets = [(k, v) for k, v in all_facets if k in args.facets]

        print(f"=== NPC: {name} ({sheet_path.name}) ===")
        for facet, fragments in all_facets:
            for idx, frag in enumerate(fragments):
                dim = FACET_SIZES.get(facet, (1024, 1024))
                prompt = full_prompt(sheet, frag, facet, scene_id=args.scene)
                seed = args.seed if args.seed is not None else random.randint(1, 2**32 - 1)
                prefix = f"spritequest/{slug}/{facet}_{idx + 1}"
                snapshot_name = f"{slug}_{facet}_{idx + 1}.json"

                workflow = build_moss_image_workflow(
                    prompt=prompt,
                    negative="",
                    seed=seed,
                    width=dim[0],
                    height=dim[1],
                    prefix=prefix,
                    steps=args.steps,
                    cfg=args.cfg,
                    snapshot_name=None if args.no_snapshot else snapshot_name,
                )

                if args.dry_run:
                    print(f"  [{facet}] ({dim[0]}x{dim[1]}, seed {seed}):")
                    print(f"    Prompt: {prompt[:120]}...")
                    if not args.no_snapshot:
                        print(f"    Snapshot: {COMFY_WORKFLOWS_DIR / snapshot_name}")
                else:
                    print(f"  Queueing [{facet}] ({dim[0]}x{dim[1]})...", end="", flush=True)
                    pid = comfy.queue(workflow)
                    outputs = comfy.wait(pid)
                    print(f" Done (prompt {pid})")

        print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
