#!/usr/bin/env python3
"""
companion/scene_placement.py

Scene & Prop Placement Engine for Topological Outdoor Maps.

Projects architectural floorplans (e.g. Customs House) and standalone outdoor props
onto continuous-to-stepped 2.5D heightfields.

Provides:
  - World coordinate transformation from scene-local coordinates to build plate anchors.
  - Elevation snapping against terrain heightfields and zone pedestals.
  - Zone containment queries for audio/ambience/narrative context.
  - Wall line segment collision & Line-of-Sight occlusion with portal awareness.
  - Serialisation to JSON manifests for the 2.5D Web Parallax Viewer.
"""

from __future__ import annotations

import json
import math
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class PlacedZone:
    id: str
    name: str
    scene_id: str
    elevation: float
    bounds: dict[str, float]  # x_min, x_max, y_min, y_max
    material: str = ""
    acoustic_reverb: str = ""
    description: str = ""

    def contains(self, x: float, y: float) -> bool:
        return (
            self.bounds["x_min"] <= x <= self.bounds["x_max"]
            and self.bounds["y_min"] <= y <= self.bounds["y_max"]
        )


@dataclass
class PlacedWall:
    id: str
    scene_id: str
    start: tuple[float, float]
    end: tuple[float, float]
    thickness: float = 0.4
    height: float = 4.0
    base_elevation: float = 0.0
    top_elevation: float = 4.0


@dataclass
class PlacedPortal:
    id: str
    scene_id: str
    kind: str
    world_x: float
    world_y: float
    world_z: float
    width: float = 3.0
    height: float = 3.5
    passable: bool = True
    orientation: str = "horizontal"


@dataclass
class PlacedProp:
    id: str
    label: str
    scene_id: str | None
    world_x: float
    world_y: float
    world_z: float
    yaw_deg: float = 0.0
    scale: float = 1.0
    glb: str | None = None
    prop_type: str | None = None
    description: str = ""
    collider_radius: float = 0.8
    interactable: bool = True


def segment_intersection(
    p1: tuple[float, float],
    p2: tuple[float, float],
    p3: tuple[float, float],
    p4: tuple[float, float],
) -> tuple[bool, tuple[float, float] | None]:
    """
    Test line segment intersection between (p1->p2) and (p3->p4).
    Returns (True, (ix, iy)) if segments intersect, else (False, None).
    """
    x1, y1 = p1
    x2, y2 = p2
    x3, y3 = p3
    x4, y4 = p4

    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    if abs(denom) < 1e-9:
        return False, None

    ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom
    ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom

    if 0.0 <= ua <= 1.0 and 0.0 <= ub <= 1.0:
        ix = x1 + ua * (x2 - x1)
        iy = y1 + ua * (y2 - y1)
        return True, (ix, iy)

    return False, None


class ScenePlacementEngine:
    """Manages placement of interior scene floorplans and exterior props on a terrain map."""

    def __init__(self, terrain_mesh: Any, map_data: dict[str, Any]):
        self.terrain = terrain_mesh
        self.map_data = map_data
        self.build_plates = map_data.get("build_plates", [])

        self.zones: list[PlacedZone] = []
        self.walls: list[PlacedWall] = []
        self.portals: list[PlacedPortal] = []
        self.props: list[PlacedProp] = []

        self._resolve_scenes_and_props()

    def _resolve_scenes_and_props(self) -> None:
        """Resolve all build plate floorplans and standalone outdoor props."""
        # 1. Resolve build plates with floor plans
        for plate in self.build_plates:
            fp_rel = plate.get("scene_floorplan")
            if not fp_rel:
                continue

            fp_path = REPO_ROOT / fp_rel
            if not fp_path.exists():
                continue

            fp_data = json.loads(fp_path.read_text(encoding="utf-8"))
            scene_id = fp_data.get("scene_id", plate.get("id"))
            anchor = plate.get("anchor", {})
            anc_x = float(anchor.get("center_x", 0.0))
            anc_y = float(anchor.get("center_y", 0.0))
            anc_z = float(anchor.get("elevation", 0.0))

            scale_info = fp_data.get("scale", {})
            center_xz = scale_info.get("center_xz", [0.0, 30.0])
            cx, cz = float(center_xz[0]), float(center_xz[1])

            # Resolve Zones
            for z in fp_data.get("zones", []):
                b = z.get("bounds", {})
                local_elev = float(z.get("elevation", 0.0))
                placed_zone = PlacedZone(
                    id=z["id"],
                    name=z.get("name", z["id"]),
                    scene_id=scene_id,
                    elevation=round(anc_z + local_elev, 2),
                    bounds={
                        "x_min": round(anc_x + (float(b.get("x_min", 0.0)) - cx), 2),
                        "x_max": round(anc_x + (float(b.get("x_max", 0.0)) - cx), 2),
                        "y_min": round(anc_y + (float(b.get("z_min", 0.0)) - cz), 2),
                        "y_max": round(anc_y + (float(b.get("z_max", 0.0)) - cz), 2),
                    },
                    material=z.get("material", ""),
                    acoustic_reverb=z.get("acoustic_reverb", ""),
                    description=z.get("description", ""),
                )
                self.zones.append(placed_zone)

            # Resolve Portals first so walls can check them
            for p in fp_data.get("portals", []):
                pos = p.get("position", [0.0, 0.0, 0.0])
                wx = anc_x + (float(pos[0]) - cx)
                wy = anc_y + (float(pos[2]) - cz)
                wz = anc_z + float(pos[1])
                placed_portal = PlacedPortal(
                    id=p["id"],
                    scene_id=scene_id,
                    kind=p.get("kind", "door"),
                    world_x=round(wx, 2),
                    world_y=round(wy, 2),
                    world_z=round(wz, 2),
                    width=float(p.get("width", 3.0)),
                    height=float(p.get("height", 3.5)),
                    passable=True,
                    orientation=p.get("orientation", "horizontal"),
                )
                self.portals.append(placed_portal)

            # Resolve Walls
            for w in fp_data.get("walls", []):
                s = w.get("start", [0.0, 0.0])
                e = w.get("end", [0.0, 0.0])
                wx1 = anc_x + (float(s[0]) - cx)
                wy1 = anc_y + (float(s[1]) - cz)
                wx2 = anc_x + (float(e[0]) - cx)
                wy2 = anc_y + (float(e[1]) - cz)
                wall_h = float(w.get("height", 4.0))

                placed_wall = PlacedWall(
                    id=w["id"],
                    scene_id=scene_id,
                    start=(round(wx1, 2), round(wy1, 2)),
                    end=(round(wx2, 2), round(wy2, 2)),
                    thickness=float(w.get("thickness", 0.45)),
                    height=wall_h,
                    base_elevation=anc_z,
                    top_elevation=round(anc_z + wall_h, 2),
                )
                self.walls.append(placed_wall)

            # Resolve Floorplan Props
            for prop in fp_data.get("props", []):
                at = prop.get("at", [0.0, 0.0, 0.0])
                wx = anc_x + (float(at[0]) - cx)
                wy = anc_y + (float(at[2]) - cz)
                wz = anc_z + float(at[1])

                placed_prop = PlacedProp(
                    id=prop["id"],
                    label=prop.get("label", prop["id"]),
                    scene_id=scene_id,
                    world_x=round(wx, 2),
                    world_y=round(wy, 2),
                    world_z=round(wz, 2),
                    yaw_deg=float(prop.get("yaw_deg", 0.0)),
                    scale=float(prop.get("scale", 1.0)),
                    glb=prop.get("glb"),
                    prop_type="furniture",
                    description=prop.get("label", ""),
                )
                self.props.append(placed_prop)

        # 2. Resolve Outdoor Map Props
        for op in self.map_data.get("props", []):
            at = op.get("at", [0.0, 0.0])
            ox, oy = float(at[0]), float(at[1])
            if op.get("elevation_mode") == "surface" and self.terrain is not None:
                oz = float(self.terrain.sample_elevation(ox, oy))
            else:
                oz = float(op.get("elevation", 0.0))

            placed_op = PlacedProp(
                id=op["id"],
                label=op.get("label", op["id"]),
                scene_id=None,
                world_x=round(ox, 2),
                world_y=round(oy, 2),
                world_z=round(oz, 2),
                yaw_deg=float(op.get("yaw_deg", 0.0)),
                scale=float(op.get("scale", 1.0)),
                prop_type=op.get("type", "outdoor_prop"),
                description=op.get("description", ""),
            )
            self.props.append(placed_op)

    def get_zone_at(self, x: float, y: float) -> PlacedZone | None:
        """Find which interior zone (if any) contains the given world coordinate."""
        for z in self.zones:
            if z.contains(x, y):
                return z
        return None

    def get_outdoor_props(self) -> list[PlacedProp]:
        """Return all standalone outdoor props."""
        return [p for p in self.props if p.scene_id is None]

    def test_wall_sightline(
        self,
        x1: float,
        y1: float,
        x2: float,
        y2: float,
        ray_z: float | None = None,
    ) -> tuple[bool, tuple[float, float] | None]:
        """
        Test whether a sightline ray from (x1, y1) to (x2, y2) is blocked by any solid wall.
        Rays passing directly through open portals are allowed to pass.
        Returns (blocked: bool, hit_pos: (x, y) | None).
        """
        p1 = (x1, y1)
        p2 = (x2, y2)

        for wall in self.walls:
            hit, hit_pos = segment_intersection(p1, p2, wall.start, wall.end)
            if not hit or hit_pos is None:
                continue

            hx, hy = hit_pos

            # Check if this hit point passes through an open portal
            portal_clear = False
            for portal in self.portals:
                if not portal.passable:
                    continue
                # Distance from hit to portal center
                dist_to_portal = math.hypot(hx - portal.world_x, hy - portal.world_y)
                # If hit is within portal opening tolerance (half-width + 0.15m margin)
                if dist_to_portal <= (portal.width / 2.0) + 0.15:
                    portal_clear = True
                    break

            if not portal_clear:
                return True, hit_pos

        return False, None

    def export_features_json(self) -> dict[str, Any]:
        """Export serialized feature bundle for web preview and SillyTavern adapters."""
        from companion.fragment_placement import FragmentPlacementEngine
        from companion.stagecraft_anchoring import StagecraftAnchoringEngine

        sc_engine = StagecraftAnchoringEngine(self)
        frag_engine = FragmentPlacementEngine(self)

        # Collect NPC declaration sheets and pre-compile their facets
        npcs_data = {}
        npcs_dir = REPO_ROOT / "companion" / "npcs"
        if npcs_dir.is_dir():
            from companion.fragment_compiler import compile_npc_facet_brief
            for np_path in npcs_dir.glob("*.json"):
                try:
                    sheet = json.loads(np_path.read_text(encoding="utf-8"))
                    slug = np_path.stem
                    keys = [slug]
                    if slug == "pell-the-underwritten":
                        keys.append("pell")
                    if slug == "hollis":
                        keys.append("hollis")

                    portrait_brief = compile_npc_facet_brief(sheet, "portrait", scene_id="customs-house")
                    cutout_brief = compile_npc_facet_brief(sheet, "cutout", scene_id="customs-house")

                    npc_entry = {
                        "slug": slug,
                        "name": sheet.get("name", slug),
                        "role": sheet.get("role", ""),
                        "written": sheet.get("written", False),
                        "world": sheet.get("world", ""),
                        "world_id": sheet.get("world_id", ""),
                        "style": sheet.get("style", ""),
                        "portrait": sheet.get("portrait", ""),
                        "home": sheet.get("home", ""),
                        "favored_items": sheet.get("favored_items", []),
                        "aspirations": sheet.get("aspirations", ""),
                        "compiled_portrait": asdict(portrait_brief),
                        "compiled_cutout": asdict(cutout_brief),
                    }
                    for k in keys:
                        npcs_data[k] = npc_entry
                except Exception:
                    pass

        return {
            "zones": [asdict(z) for z in self.zones],
            "walls": [asdict(w) for w in self.walls],
            "portals": [asdict(p) for p in self.portals],
            "props": [asdict(pr) for pr in self.props],
            "physical_props": frag_engine.export_fragment_assets(),
            "stagecraft": sc_engine.export_stagecraft_manifest(),
            "npcs": npcs_data,
        }


def load_and_place_map_scenes(map_path: Path) -> tuple[Any, ScenePlacementEngine]:
    """Load an outdoor map scene and return the terrain mesh and placement engine."""
    from companion.terrain_mesh import load_outdoor_map_scene

    tm, map_data = load_outdoor_map_scene(map_path)
    engine = ScenePlacementEngine(tm, map_data)
    return tm, engine
