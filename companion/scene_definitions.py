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
CAMPAIGNS_DIR = REPO_ROOT / "library" / "campaigns"

from companion.render_primitive_2d import get_primitive_2d_data_url


@dataclass
class ActDefinition:
    id: str
    name: str
    description: str
    scenes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class CampaignDefinition:
    id: str
    name: str
    short_name: str
    description: str
    document_ref: str | None = None
    acts: list[ActDefinition] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "short_name": self.short_name,
            "description": self.description,
            "document_ref": self.document_ref,
            "acts": [a.to_dict() for a in self.acts],
        }


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
    sprite_url: str = ""
    source_triangles: int = 0
    coacd_pieces: str = ""
    collage_url: str = ""
    sheet_url: str = ""
    overhang_constrained: bool = False
    overhang_angle_deg: float = 45.0

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        if not d["asset_id"]:
            d["asset_id"] = self.id
        if not d["image_2d"]:
            d["image_2d"] = get_primitive_2d_data_url(self.id, d)
        if not d.get("sprite_url"):
            # Prioritize authentic diffusion sprite over wireframe placeholder
            for cand_path in (
                REPO_ROOT / "renders" / "primitives" / f"{self.id}-generated.png",
                REPO_ROOT / "library" / "sprites" / f"{self.id}.png",
                REPO_ROOT / "library" / "sprites" / f"{self.id.replace('prop-', '')}.png",
            ):
                if cand_path.is_file() and cand_path.stat().st_size > 1000:
                    d["sprite_url"] = str(cand_path.relative_to(REPO_ROOT))
                    break
        if not d["sheet_url"]:
            sheet_file = REPO_ROOT / "renders" / "primitives" / f"{self.id}-sheet.png"
            if sheet_file.is_file():
                d["sheet_url"] = f"renders/primitives/{self.id}-sheet.png"
            elif d["collage_url"]:
                d["sheet_url"] = d["collage_url"]
        if not d["collage_url"]:
            for cand_file in (
                REPO_ROOT / "renders" / "primitives" / f"{self.id}-sheet.png",
                REPO_ROOT / "renders" / "primitives" / f"{self.id}-collage.png",
            ):
                if cand_file.is_file():
                    d["collage_url"] = str(cand_file.relative_to(REPO_ROOT))
                    break
        return d


@dataclass
class SceneDefinition:
    id: str
    name: str
    act: str
    world_id: str
    category: str
    description: str
    campaign_id: str = "tests"
    act_id: str = ""
    primitives: list[ScenePrimitive] = field(default_factory=list)
    cast: list[dict[str, Any]] = field(default_factory=list)
    map_ref: str | None = None
    floorplan_ref: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "act": self.act,
            "act_id": self.act_id,
            "campaign_id": self.campaign_id,
            "world_id": self.world_id,
            "category": self.category,
            "description": self.description,
            "map_ref": self.map_ref,
            "floorplan_ref": self.floorplan_ref,
            "cast": self.cast,
            "primitives": [p.to_dict() for p in self.primitives],
        }


def load_all_campaigns(campaigns_dir: Path = CAMPAIGNS_DIR) -> dict[str, CampaignDefinition]:
    """Load all campaign definitions from library/campaigns/."""
    campaigns: dict[str, CampaignDefinition] = {}
    if not campaigns_dir.is_dir():
        return campaigns

    order = ["tests", "unwritten-consignment"]
    stems = [f.stem for f in sorted(campaigns_dir.glob("*.json"))]
    ordered_stems = [s for s in order if s in stems] + [s for s in stems if s not in order]

    for stem in ordered_stems:
        c_path = campaigns_dir / f"{stem}.json"
        if not c_path.is_file():
            continue
        data = json.loads(c_path.read_text(encoding="utf-8"))
        acts = []
        for a in data.get("acts", []):
            acts.append(
                ActDefinition(
                    id=a.get("id", ""),
                    name=a.get("name", ""),
                    description=a.get("description", ""),
                    scenes=list(a.get("scenes", [])),
                )
            )
        campaigns[stem] = CampaignDefinition(
            id=data.get("id", stem),
            name=data.get("name", stem),
            short_name=data.get("short_name", stem),
            description=data.get("description", ""),
            document_ref=data.get("document_ref"),
            acts=acts,
        )
    return campaigns


RUIN_GEOMETRY_STATS: dict[str, dict[str, Any]] = {
    "ancient-bastion": {
        "source_triangles": 36647,
        "coacd_pieces": "16 CoACD Boxes (192 tris)",
        "overhang_constrained": True,
        "overhang_angle_deg": 45.0,
    },
    "relic-cairn": {
        "source_triangles": 49658,
        "coacd_pieces": "7 CoACD Boxes (84 tris)",
        "overhang_constrained": True,
        "overhang_angle_deg": 45.0,
    },
    "wish-stone-slab": {
        "source_triangles": 43844,
        "coacd_pieces": "8 CoACD Boxes (96 tris)",
        "overhang_constrained": True,
        "overhang_angle_deg": 45.0,
    },
    "ruined-watchtower": {
        "source_triangles": 58927,
        "coacd_pieces": "12 CoACD Boxes (144 tris)",
        "overhang_constrained": True,
        "overhang_angle_deg": 45.0,
    },
    "ancient-ruin-terrace": {
        "source_triangles": 29928,
        "coacd_pieces": "9 CoACD Boxes (108 tris)",
        "overhang_constrained": True,
        "overhang_angle_deg": 45.0,
    },
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
        clean_id = pid.replace("prop-", "")
        # Prioritize authentic diffusion sprite over wireframe placeholder
        sprite_url = p_raw.get("image_url") or p_raw.get("sprite_url")
        if not sprite_url:
            for cand_path in (
                REPO_ROOT / "renders" / "primitives" / f"{pid}-generated.png",
                REPO_ROOT / "library" / "sprites" / f"{clean_id}.png",
                REPO_ROOT / "library" / "sprites" / f"{pid}.png",
            ):
                if cand_path.is_file() and cand_path.stat().st_size > 1000:
                    sprite_url = str(cand_path.relative_to(REPO_ROOT))
                    break

        img_url = p_raw.get("image_2d") or get_primitive_2d_data_url(pid, p_raw)
        stats = RUIN_GEOMETRY_STATS.get(pid, {})
        sheet_p = REPO_ROOT / "renders" / "primitives" / f"{pid}-sheet.png"
        collage_p = REPO_ROOT / "renders" / "primitives" / f"{pid}-collage.png"
        sheet_url = f"renders/primitives/{pid}-sheet.png" if sheet_p.is_file() else (f"renders/primitives/{pid}-collage.png" if collage_p.is_file() else "")
        collage_url = sheet_url or (f"renders/primitives/{pid}-collage.png" if collage_p.is_file() else "")
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
                sprite_url=sprite_url or "",
                source_triangles=p_raw.get("source_triangles", stats.get("source_triangles", 0)),
                coacd_pieces=p_raw.get("coacd_pieces", stats.get("coacd_pieces", "")),
                collage_url=p_raw.get("collage_url", collage_url),
                sheet_url=p_raw.get("sheet_url", sheet_url),
                overhang_constrained=p_raw.get("overhang_constrained", stats.get("overhang_constrained", False)),
                overhang_angle_deg=float(p_raw.get("overhang_angle_deg", stats.get("overhang_angle_deg", 45.0))),
            )
        )

    return SceneDefinition(
        id=data.get("id", scene_id),
        name=data.get("name", scene_id),
        act=data.get("act", ""),
        campaign_id=data.get("campaign_id", "tests"),
        act_id=data.get("act_id", ""),
        world_id=data.get("world_id", ""),
        category=data.get("category", "scene"),
        description=data.get("description", ""),
        primitives=prims,
        cast=list(data.get("cast", [])),
        map_ref=data.get("map_ref"),
        floorplan_ref=data.get("floorplan_ref"),
    )


def load_all_scenes(scenes_dir: Path = SCENES_DIR) -> dict[str, SceneDefinition]:
    """Load all scene definitions available in library/scenes/."""
    scenes: dict[str, SceneDefinition] = {}
    if not scenes_dir.is_dir():
        return scenes

    preferred_order = [
        "customs-house",
        "border-march",
        "unwritten-ascent",
        "glass-cathedral",
        "consignment-intake-foyer",
        "consignment-weigh-hall",
        "consignment-border-pass",
        "consignment-overhang-bastion",
        "consignment-orom-shrine",
        "consignment-unwritten-seam",
        "consignment-entropy-beacons",
        "consignment-cathedral-nave",
        "consignment-solar-focus-chancel",
    ]
    found_stems = [f.stem for f in sorted(scenes_dir.glob("*.json"))]
    ordered_stems = [s for s in preferred_order if s in found_stems] + [
        s for s in found_stems if s not in preferred_order
    ]

    for s_id in ordered_stems:
        scene = load_scene_definition(s_id, scenes_dir)
        if scene:
            scenes[s_id] = scene

    return scenes


def export_scenes_manifest(
    scenes_dir: Path = SCENES_DIR,
    campaigns_dir: Path = CAMPAIGNS_DIR,
) -> dict[str, Any]:
    """Export complete campaigns and scenes bundle for client-side embedding in the web viewer."""
    all_campaigns = load_all_campaigns(campaigns_dir)
    all_scenes = load_all_scenes(scenes_dir)

    for cid, camp in all_campaigns.items():
        for act in camp.acts:
            for sid in act.scenes:
                if sid in all_scenes:
                    all_scenes[sid].campaign_id = cid
                    all_scenes[sid].act_id = act.id

    return {
        "campaigns": [c.to_dict() for c in all_campaigns.values()],
        "campaigns_by_id": {c_id: c.to_dict() for c_id, c in all_campaigns.items()},
        "scenes": [s.to_dict() for s in all_scenes.values()],
        "scenes_by_id": {s_id: s.to_dict() for s_id, s in all_scenes.items()},
        "default_campaign_id": "tests",
        "default_scene_id": "border-march",
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
