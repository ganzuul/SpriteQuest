#!/usr/bin/env python3
"""
companion/validate_workflows.py

Check ComfyUI API-format workflows before a slow render fails on them.

Catches the mistakes that cost real time: a model filename that is not
installed, a node link pointing at a missing node, and a LoadImage file that is
not in ComfyUI's input folder.

Usage:
    python3 -m companion.validate_workflows                      # workflows/comfyui/*.json
    python3 -m companion.validate_workflows path/to/graph.json
    python3 -m companion.validate_workflows --offline            # skip live ComfyUI queries

Exit status is 1 when any workflow fails.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_models import (  # noqa: E402
    COMFY_INPUT_DIR,
    DEFAULT_SERVER,
    comfy_model_names,
    installed_names,
)

MODEL_INPUTS = {
    "ckpt_name": "image_unet",
    "unet_name": "image_unet",
    "vae_name": "image_vae",
    "lora_name": None,
}
# Input keys whose role depends on the node class rather than the key alone.
CLASS_INPUT_ROLES = {
    ("ImageOnlyCheckpointLoader", "ckpt_name"): "hunyuan_ckpt",
}
CLIP_INPUTS = ("clip_name", "clip_name1", "clip_name2")


def _node_map(workflow) -> dict[str, dict] | None:
    """Return API-format nodes, or None for UI-format files."""
    if not isinstance(workflow, dict) or not workflow:
        return None
    if "nodes" in workflow and isinstance(workflow["nodes"], list):
        return None
    for node_id, node in workflow.items():
        if not isinstance(node_id, str) or not isinstance(node, dict) or "class_type" not in node:
            return None
    return workflow


def _links(node: dict) -> list[list]:
    return [value for value in node.get("inputs", {}).values() if _is_link(value)]


def _is_link(value) -> bool:
    return (
        isinstance(value, list)
        and len(value) == 2
        and isinstance(value[0], str)
        and isinstance(value[1], int)
    )


def check_workflow(
    path: Path,
    server: str | None = DEFAULT_SERVER,
    input_dir: Path = COMFY_INPUT_DIR,
) -> list[str]:
    """Return a list of human-readable problems; empty means the graph looks usable."""
    try:
        workflow = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [f"unreadable workflow: {exc}"]

    nodes = _node_map(workflow)
    if nodes is None:
        return ["skipped: not API-format (UI-format graphs resolve models at load time)"]

    problems: list[str] = []
    model_lists: dict[str, list[str]] = {}
    input_files: list[str] | None = None

    for node_id, node in nodes.items():
        for value in _links(node):
            if value[0] not in nodes:
                problems.append(f"node {node_id} links to missing node {value[0]}")

        for key, role in MODEL_INPUTS.items():
            name = node.get("inputs", {}).get(key)
            if not isinstance(name, str):
                continue
            role = CLASS_INPUT_ROLES.get((node.get("class_type"), key), role)
            if role is None:
                continue
            if role not in model_lists:
                model_lists[role] = installed_names(role, server)
            if name not in model_lists[role]:
                problems.append(
                    f"node {node_id} {key}={name!r} is not installed "
                    f"(available: {', '.join(model_lists[role][:4]) or 'none'})"
                )

        for key in CLIP_INPUTS:
            name = node.get("inputs", {}).get(key)
            if not isinstance(name, str):
                continue
            if "image_clip" not in model_lists:
                model_lists["image_clip"] = installed_names("image_clip", server)
            if name not in model_lists["image_clip"]:
                problems.append(
                    f"node {node_id} {key}={name!r} is not installed "
                    f"(available: {', '.join(model_lists['image_clip'][:4]) or 'none'})"
                )

        if node.get("class_type") == "LoadImage":
            image = node.get("inputs", {}).get("image")
            if isinstance(image, str):
                if input_files is None:
                    input_files = _input_folder(input_dir, server)
                if image not in input_files:
                    problems.append(
                        f"node {node_id} image={image!r} is not in {input_dir}"
                    )
    return problems


def _input_folder(input_dir: Path, server: str | None) -> list[str]:
    if input_dir.is_dir():
        return [str(path.relative_to(input_dir)) for path in input_dir.rglob("*") if path.is_file()]
    if server:
        listing = comfy_model_names(server, "input")
        return listing
    return []


def default_workflows() -> list[Path]:
    return sorted((REPO_ROOT / "workflows" / "comfyui").glob("*.json"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("workflows", nargs="*", type=Path)
    parser.add_argument("--server", default=DEFAULT_SERVER, help="ComfyUI URL for live model lists")
    parser.add_argument("--offline", action="store_true", help="Do not query ComfyUI")
    parser.add_argument("--input-dir", type=Path, default=COMFY_INPUT_DIR)
    args = parser.parse_args(argv)

    paths = args.workflows or default_workflows()
    if not paths:
        print("No workflows found.", file=sys.stderr)
        return 1

    server = None if args.offline else args.server
    failed = 0
    for path in paths:
        problems = check_workflow(path, server=server, input_dir=args.input_dir)
        if problems and all(problem.startswith("skipped:") for problem in problems):
            print(f"SKIP {path.name}: {problems[0][len('skipped: '):]}")
            continue
        if problems:
            failed += 1
            print(f"FAIL {path.name}")
            for problem in problems:
                print(f"  - {problem}")
        else:
            print(f"OK   {path.name}")
    print(f"\n{len(paths) - failed} passed, {failed} failed (of {len(paths)})")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())