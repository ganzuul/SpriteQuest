#!/usr/bin/env python3
"""
tools/link_models.py

Expose models from the shared Hugging Face cache to ComfyUI without copying
weights and without pinning snapshot hashes by hand.

ComfyUI resolves `models/<category>/<name>` (plus extra_model_paths.yaml). This
tool creates one symlink per model into those category folders, following the
Hugging Face cache's `refs/main` pointer so `hf download` updates are picked up
without editing config.

Default is a dry run. Pass --write to create the links.

Usage:
    python3 tools/link_models.py                 # show the plan
    python3 tools/link_models.py --write         # create/refresh symlinks
    python3 tools/link_models.py --write --prune # also drop dangling links it owns
"""

from __future__ import annotations

import argparse
import os
import sys
from dataclasses import dataclass
from pathlib import Path

HF_HUB = Path(
    os.environ.get("HF_HUB_CACHE", Path.home() / "models" / "huggingface" / "hub")
)
COMFY_MODELS = Path(
    os.environ.get("COMFY_MODELS", Path.home() / "ComfyUI" / "models")
)


@dataclass(frozen=True)
class Entry:
    """A cached model file and the ComfyUI category it belongs to."""

    repo: str
    filename: str
    category: str


ENTRIES = (
    Entry("Comfy-Org/MOSS-Image", "diffusion_models/moss_image_sft_int8_convrot.safetensors", "diffusion_models"),
    Entry("Comfy-Org/MOSS-Image", "diffusion_models/moss_image_sft_bf16.safetensors", "diffusion_models"),
    Entry("Comfy-Org/MOSS-Image", "text_encoders/qwen3.5_9b_w4a8_gptq.safetensors", "text_encoders"),
    Entry("Comfy-Org/MOSS-Image", "text_encoders/qwen3.5_9b_int8_convrot.safetensors", "text_encoders"),
    Entry("Comfy-Org/MOSS-Image", "text_encoders/qwen3.5_9b_bf16.safetensors", "text_encoders"),
    Entry("Comfy-Org/MOSS-Image", "vae/flux2-vae.safetensors", "vae"),
    Entry("Comfy-Org/MOSS-Image", "loras/moss_image_color_depth_control.safetensors", "loras"),
    Entry("Comfy-Org/MOSS-Image", "loras/moss_image_edit_lora_rank_64_bf16.safetensors", "loras"),
)


def repo_dir(repo: str) -> Path:
    return HF_HUB / f"models--{repo.replace('/', '--')}"


def snapshot_dir(repo: str) -> Path | None:
    """Resolve the cache revision from refs/main, falling back to any snapshot."""
    base = repo_dir(repo)
    ref = base / "refs" / "main"
    if ref.is_file():
        resolved = base / "snapshots" / ref.read_text(encoding="utf-8").strip()
        if resolved.is_dir():
            return resolved
    snapshots = base / "snapshots"
    if snapshots.is_dir():
        found = sorted(path for path in snapshots.iterdir() if path.is_dir())
        if found:
            return found[-1]
    return None


def plan() -> tuple[list[tuple[Entry, Path, Path]], list[Entry]]:
    """Return (linkable, missing) entries for the current cache."""
    linkable: list[tuple[Entry, Path, Path]] = []
    missing: list[Entry] = []
    for entry in ENTRIES:
        snapshot = snapshot_dir(entry.repo)
        source = snapshot / entry.filename if snapshot else None
        if not source or not source.is_file():
            missing.append(entry)
            continue
        target = COMFY_MODELS / entry.category / Path(entry.filename).name
        linkable.append((entry, source, target))
    return linkable, missing


def apply(linkable, write: bool, prune: bool) -> int:
    created = updated = kept = 0
    for entry, source, target in linkable:
        if target.is_symlink() and Path(os.readlink(target)) == source:
            kept += 1
            continue
        action = "update" if target.is_symlink() or target.exists() else "create"
        print(f"{action:6} {target} -> {source}")
        if write:
            target.parent.mkdir(parents=True, exist_ok=True)
            if target.is_symlink() or target.exists():
                target.unlink()
            target.symlink_to(source)
        if action == "create":
            created += 1
        else:
            updated += 1

    if prune:
        for category in {entry.category for entry in ENTRIES}:
            folder = COMFY_MODELS / category
            if not folder.is_dir():
                continue
            for link in folder.iterdir():
                if link.is_symlink() and not link.resolve().exists():
                    print(f"prune  {link}")
                    if write:
                        link.unlink()

    verb = "linked" if write else "would link"
    print(f"\n{verb}: {created + updated} new/changed, {kept} already correct")
    return created + updated


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="Create the symlinks (default: dry run)")
    parser.add_argument("--prune", action="store_true", help="Remove dangling symlinks in those categories")
    parser.add_argument("--hub", type=Path, default=HF_HUB, help=f"Hugging Face hub cache (default: {HF_HUB})")
    parser.add_argument("--models", type=Path, default=COMFY_MODELS, help=f"ComfyUI models dir (default: {COMFY_MODELS})")
    args = parser.parse_args(argv)
    globals()["HF_HUB"] = args.hub
    globals()["COMFY_MODELS"] = args.models

    linkable, missing = plan()
    for entry in missing:
        print(f"absent {entry.repo}:{entry.filename} (not in the cache)")
    apply(linkable, write=args.write, prune=args.prune)
    if missing and not linkable:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())