#!/usr/bin/env python3
"""
companion/comfy_depth.py

Render top-down and 3/4 depth maps of a 3D mesh through ComfyUI.

The graph lives in `workflows/comfyui/mesh_depth.json` so it can be edited and
tuned in the ComfyUI UI; this module only substitutes a handful of inputs,
submits the graph, and fetches the rendered PNGs. Keeping the node graph in a
workflow file means the rasterization logic is not maintained in Python.

Depth convention (from ComfyUI's `Render Mesh`, mode `depth`): the view's hit
depths are normalised to its own min/max, near = white, background = the node's
`background` colour. This is relative depth, not metric elevation.
"""

from __future__ import annotations

import io
import json
import math
import re
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.comfy_models import COMFY_INPUT_DIR, DEFAULT_SERVER
from companion.render_sheets import COMFY_WORKFLOWS_DIR, Comfy, ComfyError

DEPTH_TEMPLATE = COMFY_WORKFLOWS_DIR / "mesh_depth.json"
DEPTH_FOV_DEG = 35.0
DEPTH_PRIMITIVE_INPUT_DIR = COMFY_INPUT_DIR / "3d"

_PLACEHOLDER = re.compile(r"^\{\{([A-Z0-9_]+)\}\}$")


def _substitute(value, replacements: dict):
    """Replace `{{NAME}}` scalars while preserving the numeric type of the value."""
    if isinstance(value, dict):
        return {key: _substitute(item, replacements) for key, item in value.items()}
    if isinstance(value, list):
        return [_substitute(item, replacements) for item in value]
    if isinstance(value, str):
        match = _PLACEHOLDER.match(value.strip())
        if match:
            return replacements[match.group(1)]
    return value


def load_depth_template(template_path: Path | str = DEPTH_TEMPLATE) -> dict:
    """Load the editable depth-render workflow template."""
    return json.loads(Path(template_path).read_text(encoding="utf-8"))


def mesh_frame(mesh_path: Path | str, fov_deg: float = DEPTH_FOV_DEG, margin: float = 1.02) -> dict:
    """
    Return camera target and distance that frame the mesh's bounding sphere.

    trimesh reports Z-up bounds while the GLB loads into the ComfyUI viewer as
    Y-up, so the target is converted from trimesh space: (x, y, z) -> (x, z, -y).
    """
    import trimesh

    loaded = trimesh.load(str(mesh_path), force="mesh")
    bounds = loaded.bounds
    centre = (bounds[0] + bounds[1]) / 2.0
    radius = max(float(np.linalg.norm(bounds[1] - bounds[0]) / 2.0), 1e-6)
    distance = radius * margin / math.sin(math.radians(fov_deg) / 2.0)
    return {
        "TARGET_X": round(float(centre[0]), 4),
        "TARGET_Y": round(float(centre[2]), 4),
        "TARGET_Z": round(float(-centre[1]), 4),
        "DISTANCE": round(distance, 4),
        "FOV": float(fov_deg),
    }


def stage_mesh(mesh_path: Path | str, input_dir: Path | str = DEPTH_PRIMITIVE_INPUT_DIR) -> str:
    """Copy the mesh under ComfyUI's `input/3d` folder and return its Load3D path."""
    source = Path(mesh_path)
    if not source.is_file():
        raise FileNotFoundError(f"Mesh not found: {source}")
    target_dir = Path(input_dir)
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"spritequest_depth_{source.stem}{source.suffix.lower()}"
    shutil.copy2(source, target_dir / name)
    return f"3d/{name}"


def render_mesh_depth(
    mesh_path: Path | str,
    prefix: str = "spritequest/depth/mesh",
    width: int = 1024,
    height: int = 1024,
    server: str = DEFAULT_SERVER,
    template_path: Path | str = DEPTH_TEMPLATE,
    input_dir: Path | str = DEPTH_PRIMITIVE_INPUT_DIR,
    timeout: float = 300.0,
) -> dict[str, Image.Image]:
    """
    Render `three_quarter` and `topdown` depth maps for one mesh via ComfyUI.

    Returns a mapping of view name to a PIL image. Raises ComfyError when the
    server rejects or fails the graph.
    """
    if width <= 0 or height <= 0:
        raise ValueError("Depth render dimensions must be positive")
    mesh_file = stage_mesh(mesh_path, input_dir=input_dir)
    workflow = load_depth_template(template_path)
    workflow = _substitute(
        workflow,
        {
            "MESH_FILE": mesh_file,
            "PREFIX": prefix,
            "WIDTH": int(width),
            "HEIGHT": int(height),
            **mesh_frame(mesh_path),
        },
    )

    comfy = Comfy(server, timeout=timeout)
    outputs = comfy.wait(comfy.queue(workflow))

    views: dict[str, Image.Image] = {}
    for node_out in outputs.values():
        for image in node_out.get("images", []):
            filename = str(image.get("filename", ""))
            view = "topdown" if "topdown" in filename else "three_quarter"
            payload = comfy.fetch(filename, image.get("subfolder", ""), image.get("type", "output"))
            with Image.open(io.BytesIO(payload)) as rendered:
                views[view] = rendered.convert("L")
    if not views:
        raise ComfyError(
            "Depth render produced no images; check that the template's Render Mesh nodes are "
            "connected to Save Image nodes"
        )
    return views


def side_by_side_depth(topdown: Image.Image, three_quarter: Image.Image) -> Image.Image:
    """Compose the dual-view depth template: top-down left, 3/4 right."""
    height = topdown.height
    resized = three_quarter if three_quarter.height == height else three_quarter.resize(
        (three_quarter.width, height), Image.Resampling.LANCZOS
    )
    canvas = Image.new("L", (topdown.width + resized.width, height), 0)
    canvas.paste(topdown, (0, 0))
    canvas.paste(resized, (topdown.width, 0))
    return canvas


def render_depth_artifact(
    mesh_path: Path | str,
    out_path: Path | str,
    width: int = 1024,
    height: int = 512,
    server: str = DEFAULT_SERVER,
    side_by_side: bool = True,
    template_path: Path | str = DEPTH_TEMPLATE,
) -> Path:
    """Render one depth artifact PNG, optionally as a side-by-side dual view."""
    pane_width = width // 2 if side_by_side else width
    views = render_mesh_depth(
        mesh_path,
        prefix=f"spritequest/depth/{Path(out_path).stem}",
        width=pane_width,
        height=height,
        server=server,
        template_path=template_path,
    )
    if side_by_side:
        image = side_by_side_depth(views["topdown"], views["three_quarter"])
    else:
        image = views["topdown"]
    destination = Path(out_path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG")
    return destination