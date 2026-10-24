#!/usr/bin/env python3
"""
companion/scene_definitions.py

Scene Definition Engine & Primitive Linkage Registry.
Binds scenes (acts/floorplans/maps) with their constituent 3D STL primitives
and 2D inspection blueprints.

Provides:
  - Standardized JSON scene declarations in library/scenes/*.json
  - Bidirectional lookup: scene -> primitives and primitive -> source fragments
  - 2D image asset resolution (vector blueprint SVGs, data URLs, rendered mattes)
  - Serialization to web preview bundle for HTML viewer menu integration.
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

SCENES_DIR = REPO_ROOT / "library" / "scenes"

from companion.render_primitive_2d import get_primitive_2d_data_url


@dataclass
class ScenePrimitive:
    id: str
    name: str
    fragment_id: str
    category: str
    dimensions: list[float]
    triangle_count: int
    stl_path: str
    description: str
    image_2d: str = ""

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        if not d["image_2d"]:
            d["image_2d"] = get_primitive_2d_data_url(self.id, d)
        return d


@dataclass
class SceneDefinition:
    id: str
    name: str
    act: str
    world_id: str
    category: str
    description: str
    primitives: list[ScenePrimitive] = field(default_factory=list)
    map_ref: str | None = None
    floorplan_ref: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "act": self.act,
            "world_id": self.world_id,
            "category": self.category,
            "description": self.description,
            "map_ref": self.map_ref,
            "floorplan_ref": self.floorplan_ref,
            "primitives": [p.to_dict() for p in self.primitives],
        }


def load_scene_definition(scene_id: str, scenes_dir: Path = SCENES_DIR) -> SceneDefinition | None:
    """Load a specific scene definition by ID from library/scenes/<scene_id>.json."""
    scene_file = scenes_dir / f"{scene_id}.json"
    if not scene_file.is_file():
        return None

    data = json.loads(scene_file.read_text(encoding="utf-8"))
    prims = []
    for p_raw in data.get("primitives", []):
        pid = p_raw.get("id", "")
        # Resolve 2D image
        img_url = p_raw.get("image_2d") or get_primitive_2d_data_url(pid, p_raw)
        prims.append(
            ScenePrimitive(
                id=pid,
                name=p_raw.get("name", pid),
                fragment_id=p_raw.get("fragment_id", "shared/unmodelled-prop"),
                category=p_raw.get("category", "general"),
                dimensions=list(p_raw.get("dimensions", [1.0, 1.0, 1.0])),
                triangle_count=int(p_raw.get("triangle_count", 12)),
                stl_path=p_raw.get("stl_path", f"library/stl_primitives/{pid}.stl"),
                description=p_raw.get("description", ""),
                image_2d=img_url,
            )
        )

    return SceneDefinition(
        id=data.get("id", scene_id),
        name=data.get("name", scene_id),
        act=data.get("act", ""),
        world_id=data.get("world_id", ""),
        category=data.get("category", "scene"),
        description=data.get("description", ""),
        primitives=prims,
        map_ref=data.get("map_ref"),
        floorplan_ref=data.get("floorplan_ref"),
    )


def load_all_scenes(scenes_dir: Path = SCENES_DIR) -> dict[str, SceneDefinition]:
    """Load all scene definitions available in library/scenes/."""
    scenes: dict[str, SceneDefinition] = {}
    if not scenes_dir.is_dir():
        return scenes

    for json_file in sorted(scenes_dir.glob("*.json")):
        s_id = json_file.stem
        scene = load_scene_definition(s_id, scenes_dir)
        if scene:
            scenes[s_id] = scene

    return scenes


def export_scenes_manifest(scenes_dir: Path = SCENES_DIR) -> dict[str, Any]:
    """Export complete scenes bundle for client-side embedding in the web viewer."""
    all_scenes = load_all_scenes(scenes_dir)
    return {
        "scenes": [s.to_dict() for s in all_scenes.values()],
        "scenes_by_id": {s_id: s.to_dict() for s_id, s in all_scenes.items()},
        "total_primitives_catalog": sum(len(s.primitives) for s in all_scenes.values()),
    }


def main() -> int:
    manifest = export_scenes_manifest()
    print(f"Loaded {len(manifest['scenes'])} scenes from {SCENES_DIR}:")
    for s in manifest["scenes"]:
        print(f"  [{s['id']:18s}] '{s['name']}' ({len(s['primitives'])} primitives)")
        for p in s["primitives"]:
            print(f"     - {p['id']:22s} dims:{p['dimensions']}m [{p['fragment_id']}]")
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
