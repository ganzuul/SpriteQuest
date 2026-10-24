#!/usr/bin/env python3
"""
companion/scene_definitions.py

Scene Definition Engine & Primitive Linkage Registry.
Binds scenes (acts/floorplans/maps) with their constituent 3D STL primitives,
adventure staging roles, cast members, and 2D multi-view inspection sheets.
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
    asset_id: str = ""
    tree_group: str = "Scene Assets"
    stage_role: str = ""
    world_pos: list[float] | None = None
    image_2d: str = ""

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        if not d["asset_id"]:
            d["asset_id"] = self.id
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
    cast: list[dict[str, Any]] = field(default_factory=list)
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
            "cast": self.cast,
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
                asset_id=p_raw.get("asset_id", pid),
                tree_group=p_raw.get("tree_group", "Scene Assets"),
                stage_role=p_raw.get("stage_role", ""),
                world_pos=p_raw.get("world_pos"),
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
        cast=list(data.get("cast", [])),
        map_ref=data.get("map_ref"),
        floorplan_ref=data.get("floorplan_ref"),
    )


def load_all_scenes(scenes_dir: Path = SCENES_DIR) -> dict[str, SceneDefinition]:
    """Load all scene definitions available in library/scenes/ ordered by Act."""
    scenes: dict[str, SceneDefinition] = {}
    if not scenes_dir.is_dir():
        return scenes

    # Order chronologically by Act I -> Act II -> Act III -> Act IV
    preferred_order = ["customs-house", "border-march", "unwritten-ascent", "glass-cathedral"]
    found_stems = [f.stem for f in sorted(scenes_dir.glob("*.json"))]
    ordered_stems = [s for s in preferred_order if s in found_stems] + [
        s for s in found_stems if s not in preferred_order
    ]

    for s_id in ordered_stems:
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
        print(f"  [{s['id']:18s}] '{s['name']}' ({len(s['primitives'])} primitives, {len(s.get('cast', []))} cast)")
        for p in s["primitives"]:
            print(f"     - [{p['tree_group']}] {p['name']} ({p['id']} -> {p['asset_id']})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
