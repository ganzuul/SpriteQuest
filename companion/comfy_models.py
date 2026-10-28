#!/usr/bin/env python3
"""
companion/comfy_models.py

Single source of truth for ComfyUI model folders, roles, and installed files.

Companion scripts used to keep their own candidate lists and to guess model
filenames, which silently produced graphs referencing files that did not exist
and hid the fact that ComfyUI can expose models from extra_model_paths.yaml.
Everything now resolves through one role table.

Stdlib only.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path

DEFAULT_SERVER = os.environ.get("COMFY_SERVER", "http://127.0.0.1:8080/upstream/comfyui")
COMFY_MODELS = Path(os.environ.get("COMFY_MODELS", Path.home() / "ComfyUI" / "models"))
COMFY_INPUT_DIR = Path(os.environ.get("COMFY_INPUT", Path.home() / "ComfyUI" / "input"))
COMFY_EXTRA_PATHS = Path(
    os.environ.get("COMFY_EXTRA_PATHS", Path.home() / "ComfyUI" / "extra_model_paths.yaml")
)

VRAM_BASE_GIB = 6.0
RAM_OVERHEAD_FACTOR = 1.3


class ModelNotInstalled(RuntimeError):
    """Raised when a role has no candidate present on disk or in ComfyUI."""


class BudgetError(RuntimeError):
    """Raised when ComfyUI cannot hold the requested models and canvas."""


@dataclass(frozen=True)
class Role:
    """A model slot: local folder, ComfyUI folder keys, and candidate order."""

    folder: str
    candidates: tuple[str, ...]
    comfy_folders: tuple[str, ...] = ()

    def keys(self) -> tuple[str, ...]:
        return self.comfy_folders or (self.folder,)


DIFFUSION_CANDIDATES = (
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
)

CLIP_CANDIDATES = (
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
)

VAE_CANDIDATES = (
    "flux2-vae.safetensors",
    "flux_vae.safetensors",
    "ae.safetensors",
    "flux2_vae.safetensors",
    "qwen_image_2.1_vae_bf16.safetensors",
)

# Verified safetensors encoders come first; a GGUF encoder is opt-in because it
# needs the ComfyUI-GGUF qwen35 patch and a conversion of the MOSS encoder itself.
MOSS_CLIP_CANDIDATES = tuple(
    name for name in CLIP_CANDIDATES if "qwen3.5_9b" in name and "upsampler" not in name
) + ("Qwen3.5-9B-ComfyUI-Q8_0.gguf",)

HUNYUAN_CHECKPOINT_CANDIDATES = (
    "hunyuan_3d_v2.1-fp16.safetensors",
    "hunyuan_3d_v2.1-fp8-e5m2-comfy-quant.safetensors",
    "hunyuan_3d_v2.1_bf16.safetensors",
    "hunyuan3d-dit-v2-1.safetensors",
)

ROLES: dict[str, Role] = {
    "image_unet": Role("diffusion_models", DIFFUSION_CANDIDATES, ("diffusion_models", "unet_gguf")),
    "image_clip": Role("text_encoders", CLIP_CANDIDATES, ("text_encoders", "clip_gguf")),
    "image_vae": Role("vae", VAE_CANDIDATES),
    "moss_unet": Role(
        "diffusion_models",
        tuple(n for n in DIFFUSION_CANDIDATES if "moss" in n),
        ("diffusion_models", "unet_gguf"),
    ),
    "moss_clip": Role("text_encoders", MOSS_CLIP_CANDIDATES, ("text_encoders", "clip_gguf")),
    "moss_vae": Role(
        "vae",
        tuple(n for n in VAE_CANDIDATES if "flux2" in n or n in {"flux_vae.safetensors", "ae.safetensors"}),
    ),
    "hunyuan_ckpt": Role("checkpoints", HUNYUAN_CHECKPOINT_CANDIDATES),
}


def _request_json(url: str, timeout: float = 5.0):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as response:
            return json.load(response)
    except (OSError, ValueError, TimeoutError, urllib.error.URLError):
        return None


def comfy_model_names(server: str, folder: str) -> list[str]:
    """Return the filenames ComfyUI reports for one folder key, or [] if unreachable."""
    names = _request_json(f"{server.rstrip('/')}/models/{folder}")
    if not isinstance(names, list):
        return []
    return [name for name in names if isinstance(name, str)]


def system_stats(server: str) -> dict | None:
    """Return ComfyUI's /system_stats payload, or None when it is not reachable."""
    return _request_json(f"{server.rstrip('/')}/system_stats")


def local_names(directory: Path) -> list[str]:
    """Return model filenames under a local folder, including subfolders."""
    if not directory.is_dir():
        return []
    return sorted(
        str(path.relative_to(directory))
        for path in directory.rglob("*")
        if path.is_file()
        and path.stat().st_size > 0
        and not any(part.startswith(".") for part in path.relative_to(directory).parts)
    )


def extra_model_paths(path: Path | None = None) -> dict[str, list[Path]]:
    """
    Parse ComfyUI's extra_model_paths.yaml into category -> directories.

    Hand-rolled because the project is stdlib-only and the file's shape is
    simple: named sections with an optional base_path and category keys whose
    values are one path or a `|` block of paths. Relative paths resolve against
    the YAML file, matching ComfyUI's own loader.
    """
    config_path = Path(path or COMFY_EXTRA_PATHS)
    if not config_path.is_file():
        return {}

    resolved: dict[str, list[Path]] = {}
    for categories in _parse_sections(config_path).values():
        base_value = (categories.get("base_path") or [None])[0]
        if base_value and Path(base_value).is_absolute():
            root = Path(base_value)
        elif base_value:
            root = config_path.parent / base_value
        else:
            root = config_path.parent
        for category, values in categories.items():
            if category in {"base_path", "is_default"}:
                continue
            for value in values:
                candidate = Path(value)
                candidate = candidate if candidate.is_absolute() else root / candidate
                resolved.setdefault(category, []).append(candidate.resolve())
    return {key: value for key, value in resolved.items() if value}


def _parse_sections(path: Path) -> dict[str, dict[str, list[str]]]:
    """Return {section: {key: [values]}} for an extra_model_paths file."""
    sections: dict[str, dict[str, list[str]]] = {}
    current: dict[str, list[str]] | None = None
    block_key: str | None = None
    for raw in path.read_text(encoding="utf-8").splitlines():
        stripped = raw.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.endswith(":") and not raw.startswith((" ", "\t")):
            current = {}
            sections[stripped[:-1].strip()] = current
            block_key = None
            continue
        if current is None:
            continue
        if ":" in stripped and not stripped.startswith("-"):
            key, _, value = stripped.partition(":")
            key = key.strip()
            current.setdefault(key, [])
            block_key = key
            if value.strip() and value.strip() != "|":
                current[key].append(value.strip())
            continue
        if block_key:
            current[block_key].append(stripped)
    return sections


def installed_names(role: str | Role, server: str | None = None) -> list[str]:
    """Filenames for a role from ComfyUI (authoritative) plus the local folder."""
    spec = ROLES[role] if isinstance(role, str) else role
    names: list[str] = []
    if server:
        for folder in spec.keys():
            names.extend(comfy_model_names(server, folder))
    names.extend(local_names(COMFY_MODELS / spec.folder))
    for directory in extra_model_paths().get(spec.folder, []):
        names.extend(local_names(directory))
    return list(dict.fromkeys(names))


def resolve(role: str, server: str | None = None, strict: bool = True) -> str:
    """
    Pick the first installed candidate for a role.

    strict=False keeps dry-run/offline callers working and returns the top
    candidate; strict=True raises instead of naming a file that may not exist.
    """
    spec = ROLES[role]
    available = installed_names(spec, server)
    for name in spec.candidates:
        if name in available:
            return name
    if strict:
        listed = ", ".join(available) if available else "none"
        raise ModelNotInstalled(
            f"No installed model for role {role!r} in {COMFY_MODELS / spec.folder} "
            f"(ComfyUI reports: {listed}). Download {spec.candidates[0]} "
            f"or pass an explicit filename."
        )
    return spec.candidates[0]


def model_path(role: str, name: str, server: str | None = None) -> Path | None:
    """Locate a model file locally; returns None when it lives behind ComfyUI paths."""
    folders = [COMFY_MODELS / ROLES[role].folder, *extra_model_paths().get(ROLES[role].folder, [])]
    for folder in folders:
        for candidate in (folder / name, *(folder.glob(f"*/{name}"))):
            if candidate.is_file():
                return candidate
    return None


def require_budget(
    encoder_name: str,
    width: int,
    height: int,
    server: str = DEFAULT_SERVER,
    stats: dict | None = None,
    role: str = "moss_clip",
) -> dict:
    """
    Refuse a run that cannot fit, instead of swapping the machine to death.

    The encoder dominates host RAM (the loader materialises a full state dict),
    and VRAM scales with canvas area. Numbers come from measured 768px and
    1024px runs on an 8 GiB card.
    """
    if stats is None:
        stats = system_stats(server)
    if not stats:
        return {"checked": False, "reason": "ComfyUI not reachable"}

    gib = 1024 ** 3
    free_ram = float(stats.get("system", {}).get("ram_free", 0)) / gib
    devices = stats.get("devices") or [{}]
    free_vram = float(devices[0].get("vram_free", 0)) / gib

    path = model_path(role, encoder_name)
    encoder_gib = path.stat().st_size / gib if path else 0.0
    needed_ram = encoder_gib * RAM_OVERHEAD_FACTOR
    needed_vram = VRAM_BASE_GIB * (width * height) / (768 * 768)

    shortfalls = []
    if needed_ram and free_ram < needed_ram:
        shortfalls.append(f"host RAM {free_ram:.1f} GiB free < {needed_ram:.1f} GiB needed")
    if free_vram < needed_vram:
        shortfalls.append(f"VRAM {free_vram:.1f} GiB free < {needed_vram:.1f} GiB needed")
    if shortfalls:
        raise BudgetError(
            f"Refusing {width}x{height} with {encoder_name}: " + "; ".join(shortfalls)
            + ". Close other work, use a smaller --canvas, or pass --ignore-budget."
        )
    return {
        "checked": True,
        "free_ram_gib": round(free_ram, 2),
        "free_vram_gib": round(free_vram, 2),
        "needed_ram_gib": round(needed_ram, 2),
        "needed_vram_gib": round(needed_vram, 2),
    }