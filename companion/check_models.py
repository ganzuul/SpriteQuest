#!/usr/bin/env python3
"""Verify the MOSS-Image-SFT files the renderer needs are present.

Run before rendering or starting ComfyUI:

    python3 companion/check_models.py

Resolves the MOSS diffusion model, text encoder and VAE through the shared
registry (local folders, extra_model_paths.yaml, and a reachable ComfyUI).
Exits 0 when all three resolve, 1 and names what is missing otherwise.
Honours COMFY_MODELS to point at a model directory other than ~/ComfyUI/models.
"""
from __future__ import annotations

import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_models import (  # noqa: E402  (after path bootstrap)
    DEFAULT_SERVER,
    ModelNotInstalled,
    ROLES,
    model_path,
    resolve,
)


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    server = None if "--offline" in argv else DEFAULT_SERVER
    print(f"Resolving MOSS models ({'offline' if server is None else 'ComfyUI + local'})")

    missing = []
    for role, label in (
        ("moss_unet", "Diffusion model"),
        ("moss_clip", "Text encoder"),
        ("moss_vae", "VAE"),
    ):
        try:
            name = resolve(role, server)
        except ModelNotInstalled as exc:
            missing.append((label, str(exc)))
            continue
        path = model_path(role, name, server)
        size = f" ({path.stat().st_size / 1e9:5.2f} GB)" if path else ""
        print(f"  [PASS] {label + ':':17}{name}{size}")

    if missing:
        print("\nMissing required model weights for MOSS-Image-SFT:", file=sys.stderr)
        for label, reason in missing:
            print(f"  - {label}: {reason}", file=sys.stderr)
        print("\nFetch them with:", file=sys.stderr)
        for role in ("moss_unet", "moss_clip", "moss_vae"):
            print(f"  hf download Comfy-Org/MOSS-Image {ROLES[role].candidates[0]}", file=sys.stderr)
        print("Then link the cache into ComfyUI: python3 tools/link_models.py --write", file=sys.stderr)
        return 1

    print("\nAll required model components for MOSS-Image-SFT are present and ready.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
