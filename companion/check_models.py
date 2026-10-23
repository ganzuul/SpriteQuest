#!/usr/bin/env python3
"""Verify the Black Forest Labs Flux 3 Klein files the renderer needs are present.

Run before rendering or starting ComfyUI:

    python3 companion/check_models.py

Exits 0 if the diffusion model, VAE and text encoder are present;
exits 1 and names what is missing otherwise. Honours COMFY_MODELS to point at
a model directory other than ~/ComfyUI/models.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

COMFY_MODELS = Path(
    os.environ.get("COMFY_MODELS", Path.home() / "ComfyUI" / "models")
)

DIFFUSION_CANDIDATES = [
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


def pick_first(dir_path: Path, candidates: list[str]) -> Path | None:
    for name in candidates:
        candidate = dir_path / name
        if candidate.is_file() and candidate.stat().st_size > 0:
            return candidate
    return None


def main():
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else COMFY_MODELS
    print(f"Checking models directory: {root}")

    diff_dir = root / "diffusion_models"
    clip_dir = root / "text_encoders"
    vae_dir = root / "vae"

    diff_file = pick_first(diff_dir, DIFFUSION_CANDIDATES)
    clip_file = pick_first(clip_dir, CLIP_CANDIDATES)
    vae_file = pick_first(vae_dir, VAE_CANDIDATES)

    missing = []
    if diff_file:
        print(f"  [PASS] Diffusion model: {diff_file.name} ({diff_file.stat().st_size / 1e9:5.2f} GB)")
    else:
        missing.append(f"Diffusion model in {diff_dir} (e.g. {DIFFUSION_CANDIDATES[0]})")

    if clip_file:
        print(f"  [PASS] Text encoder:    {clip_file.name} ({clip_file.stat().st_size / 1e9:5.2f} GB)")
    else:
        missing.append(f"Text encoder in {clip_dir} (e.g. {CLIP_CANDIDATES[0]})")

    if vae_file:
        print(f"  [PASS] VAE:             {vae_file.name} ({vae_file.stat().st_size / 1e9:5.2f} GB)")
    else:
        missing.append(f"VAE in {vae_dir} (e.g. {VAE_CANDIDATES[0]})")

    if missing:
        print("\nMissing required model weights for Black Forest Labs Flux 3 Klein:", file=sys.stderr)
        for m in missing:
            print(f"  - {m}", file=sys.stderr)
        print("\nTo download Black Forest Labs Flux 3 Klein weights, place them in ~/ComfyUI/models/.", file=sys.stderr)
        return 1

    print("\nAll required model components for Flux 3 Klein are present and ready.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
