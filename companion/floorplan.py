#!/usr/bin/env python3
"""
companion/floorplan.py

Schema validator, spatial analysis tool, and stagecraft blockout renderer for
SpriteQuest scene floor plans.

Floor plans serve as the ground truth refinement level for:
  1. Architectural refinement & 3D scene construction (bounding boxes, portals, geometry)
  2. Movement paths (actor navigation, clearance widths, traversal vectors)
  3. Stagecraft & framing (proscenium lines, stage zones, cue marks, camera sightlines)

Stdlib only.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FLOORPLANS_DIR = REPO_ROOT / "library" / "floorplans"


def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_floorplans() -> list[dict]:
    """Find and return summaries of all floor plans in library/floorplans/."""
    plans = []
    if not FLOORPLANS_DIR.exists():
        return plans
    for p in sorted(FLOORPLANS_DIR.glob("*.json")):
        try:
            data = load_json(p)
            plans.append({
                "id": data.get("id", p.stem),
                "name": data.get("name", p.stem),
                "scene_id": data.get("scene_id", ""),
                "refinement_level": data.get("refinement_level", ""),
                "path": p,
            })
        except Exception:
            continue
    return plans


def validate_floorplan(data: dict) -> list[str]:
    """
    Validate floor plan against schema_version: 1 rules.
    Returns a list of error strings; empty list indicates valid plan.
    """
    errors = []

    if data.get("schema_version") != 1:
        errors.append(f"Invalid or missing schema_version: {data.get('schema_version')}")
    if not data.get("id"):
        errors.append("Missing required field 'id'")
    if data.get("refinement_level") != "floor_plan":
        errors.append(f"refinement_level must be 'floor_plan', got '{data.get('refinement_level')}'")

    scale = data.get("scale", {})
    bbox = scale.get("bounding_box", {})
    width = bbox.get("width", 0)
    length = bbox.get("length", 0)
    height = bbox.get("height", 0)
    if width <= 0 or length <= 0 or height <= 0:
        errors.append(f"Invalid bounding box dimensions: width={width}, length={length}, height={height}")

    zones = data.get("zones", [])
    if not zones:
        errors.append("Floor plan must define at least one zone")

    zone_ids = set()
    for z in zones:
        zid = z.get("id")
        if not zid:
            errors.append("Zone missing required 'id'")
        elif zid in zone_ids:
            errors.append(f"Duplicate zone id: {zid}")
        else:
            zone_ids.add(zid)

        bounds = z.get("bounds")
        if not bounds:
            errors.append(f"Zone '{zid}' missing 'bounds'")
        else:
            if bounds.get("x_min", 0) > bounds.get("x_max", 0):
                errors.append(f"Zone '{zid}' has x_min > x_max")
            if bounds.get("z_min", 0) > bounds.get("z_max", 0):
                errors.append(f"Zone '{zid}' has z_min > z_max")

    # Movement paths
    paths = data.get("movement_paths", [])
    for p in paths:
        pid = p.get("id", "unnamed")
        waypoints = p.get("waypoints", [])
        if len(waypoints) < 2:
            errors.append(f"Path '{pid}' must have at least 2 waypoints, got {len(waypoints)}")
        for wp in waypoints:
            wpid = wp.get("id", "unnamed")
            wp_zone = wp.get("zone")
            if wp_zone and wp_zone not in zone_ids:
                errors.append(f"Path '{pid}' waypoint '{wpid}' references undefined zone '{wp_zone}'")

    # Stagecraft validation
    stagecraft = data.get("stagecraft", {})
    if not stagecraft:
        errors.append("Floor plan must define 'stagecraft' (proscenium, playing_areas, sightlines)")
    else:
        if "proscenium_line" not in stagecraft:
            errors.append("Stagecraft missing 'proscenium_line'")
        cue_marks = stagecraft.get("cue_marks", [])
        for m in cue_marks:
            if "x" not in m or "z" not in m:
                errors.append(f"Cue mark '{m.get('id')}' missing x or z coordinate")

    return errors


def compute_path_metrics(floorplan: dict) -> list[dict]:
    """Compute lengths and elevation changes for all movement paths."""
    results = []
    for path in floorplan.get("movement_paths", []):
        pid = path.get("id")
        name = path.get("name", pid)
        waypoints = path.get("waypoints", [])
        total_dist = 0.0
        total_elev_change = 0.0
        legs = []

        for i in range(len(waypoints) - 1):
            w1 = waypoints[i]
            w2 = waypoints[i + 1]
            dx = w2.get("x", 0.0) - w1.get("x", 0.0)
            dy = w2.get("y", 0.0) - w1.get("y", 0.0)
            dz = w2.get("z", 0.0) - w1.get("z", 0.0)
            leg_dist = math.sqrt(dx * dx + dy * dy + dz * dz)
            total_dist += leg_dist
            total_elev_change += abs(dy)
            legs.append({
                "from": w1.get("id"),
                "to": w2.get("id"),
                "distance_m": round(leg_dist, 2),
            })

        results.append({
            "id": pid,
            "name": name,
            "type": path.get("type", "standard"),
            "clearance_width_m": path.get("clearance_width", 1.0),
            "waypoint_count": len(waypoints),
            "total_length_m": round(total_dist, 2),
            "elevation_delta_m": round(total_elev_change, 2),
            "legs": legs,
        })
    return results


def render_ascii_plan(floorplan: dict, canvas_cols: int = 56, canvas_rows: int = 24) -> str:
    """Render a 2D top-down ASCII map of zones, proscenium line, and cue marks."""
    scale = floorplan.get("scale", {})
    bbox = scale.get("bounding_box", {})
    w = bbox.get("width", 60.0)
    l = bbox.get("length", 100.0)

    # Normalize coordinate mapping: X from -w/2 to +w/2, Z from 0 to l
    half_w = w / 2.0

    def to_grid(x: float, z: float) -> tuple[int, int]:
        col = int(((x + half_w) / w) * (canvas_cols - 1))
        row = int((z / l) * (canvas_rows - 1))
        col = max(0, min(canvas_cols - 1, col))
        row = max(0, min(canvas_rows - 1, row))
        return col, row

    grid = [[" " for _ in range(canvas_cols)] for _ in range(canvas_rows)]

    # Draw border
    for r in range(canvas_rows):
        grid[r][0] = "│"
        grid[r][canvas_cols - 1] = "│"
    for c in range(canvas_cols):
        grid[0][c] = "─"
        grid[canvas_rows - 1][c] = "─"
    grid[0][0] = "┌"
    grid[0][canvas_cols - 1] = "┐"
    grid[canvas_rows - 1][0] = "└"
    grid[canvas_rows - 1][canvas_cols - 1] = "┘"

    # Draw zones
    for z in floorplan.get("zones", []):
        b = z.get("bounds", {})
        c1, r1 = to_grid(b.get("x_min", 0), b.get("z_min", 0))
        c2, r2 = to_grid(b.get("x_max", 0), b.get("z_max", 0))

        for r in range(r1, r2 + 1):
            for c in range(c1, c2 + 1):
                if 0 < r < canvas_rows - 1 and 0 < c < canvas_cols - 1:
                    if grid[r][c] == " ":
                        grid[r][c] = "·"

        # Label zone center
        mid_c = (c1 + c2) // 2
        mid_r = (r1 + r2) // 2
        label = z.get("id", "")[:10]
        start_c = max(1, mid_c - len(label) // 2)
        if 0 < mid_r < canvas_rows - 1:
            for i, ch in enumerate(label):
                if start_c + i < canvas_cols - 1:
                    grid[mid_r][start_c + i] = ch

    # Draw proscenium line
    stagecraft = floorplan.get("stagecraft", {})
    prosc = stagecraft.get("proscenium_line", {})
    if prosc:
        s = prosc.get("start", [0, 0, 0])
        e = prosc.get("end", [0, 0, 0])
        c1, r1 = to_grid(s[0], s[2])
        c2, r2 = to_grid(e[0], e[2])
        for c in range(min(c1, c2), max(c1, c2) + 1):
            if 0 < r1 < canvas_rows - 1 and 0 < c < canvas_cols - 1:
                grid[r1][c] = "="

    # Draw movement paths
    for path in floorplan.get("movement_paths", []):
        for wp in path.get("waypoints", []):
            c, r = to_grid(wp.get("x", 0), wp.get("z", 0))
            if 0 < r < canvas_rows - 1 and 0 < c < canvas_cols - 1:
                grid[r][c] = "o"

    # Draw cue marks
    for m in stagecraft.get("cue_marks", []):
        c, r = to_grid(m.get("x", 0), m.get("z", 0))
        if 0 < r < canvas_rows - 1 and 0 < c < canvas_cols - 1:
            grid[r][c] = "★"

    lines = ["".join(row) for row in grid]
    legend = [
        "",
        "Legend:",
        "  [ · ] Zone footprint",
        "  [ = ] Proscenium boundary",
        "  [ o ] Movement waypoint",
        "  [ ★ ] Stagecraft actor cue mark",
    ]
    return "\n".join(lines + legend)


def print_stagecraft_report(floorplan: dict) -> None:
    """Print formatted stagecraft, blocking, and camera vantage analysis."""
    print(f"=== STAGECRAFT BLOCKOUT: {floorplan.get('name')} ===")
    print(f"Scene ID:         {floorplan.get('scene_id')}")
    scale = floorplan.get('scale', {}).get('bounding_box', {})
    print(f"Dimensions:       {scale.get('width')}m wide × {scale.get('length')}m deep × {scale.get('height')}m high")

    stagecraft = floorplan.get("stagecraft", {})
    prosc = stagecraft.get("proscenium_line", {})
    print(f"\nProscenium Boundary:")
    print(f"  Span:    {prosc.get('start')} to {prosc.get('end')}")
    print(f"  Context: {prosc.get('description')}")

    print("\nPlaying Areas:")
    for area_id, area in stagecraft.get("playing_areas", {}).items():
        print(f"  - {area.get('blocking_label', area_id)}:")
        print(f"      Coord: (X: {area.get('x')}m, Y: {area.get('y', 0.0)}m, Z: {area.get('z')}m), Radius: {area.get('radius')}m")

    print("\nCue Marks (Blocking):")
    for m in stagecraft.get("cue_marks", []):
        print(f"  - {m.get('label', m.get('id'))}:")
        print(f"      Coord:   (X: {m.get('x')}, Y: {m.get('y')}, Z: {m.get('z')})")
        print(f"      Facing:  {m.get('facing')}")
        print(f"      Purpose: {m.get('description')}")

    print("\nSightlines & Camera Frustums:")
    for cam in stagecraft.get("sightlines", []):
        print(f"  - {cam.get('id')} [{cam.get('type')}]:")
        print(f"      Eye:   {cam.get('position')}")
        print(f"      Look:  {cam.get('target')}")
        print(f"      FOV:   {cam.get('fov_deg')}°")
        print(f"      Notes: {cam.get('description')}")

    print("\nProp Sockets:")
    for s in floorplan.get("prop_sockets", []):
        print(f"  - {s.get('id')} (Zone: {s.get('zone')}):")
        print(f"      Pos:       {s.get('position')}")
        print(f"      Footprint: {s.get('footprint')}")
        print(f"      Recommends: {s.get('recommended_prop')}")


def main():
    parser = argparse.ArgumentParser(description="SpriteQuest Floor Plan analysis and stagecraft validation tool.")
    parser.add_argument("plan", nargs="?", help="Path or slug to a floor plan JSON in library/floorplans/")
    parser.add_argument("--list", action="store_true", help="List all registered floor plans")
    parser.add_argument("--validate", action="store_true", help="Validate floor plan against schema")
    parser.add_argument("--ascii", action="store_true", help="Render 2D top-down ASCII layout")
    parser.add_argument("--stagecraft", action="store_true", help="Print detailed stagecraft and camera blocking report")
    parser.add_argument("--metrics", action="store_true", help="Print movement path length and traversal metrics")
    parser.add_argument("--render-ortho", metavar="OUT_DIR", help="Render 3D .glb props orthographically from above onto a room-scale 2D map")

    args = parser.parse_args()

    if args.list:
        plans = list_floorplans()
        print(f"Registered Floor Plans ({len(plans)}):")
        for p in plans:
            print(f"  - {p['id']}: {p['name']} [scene: {p['scene_id']}] ({p['path'].relative_to(REPO_ROOT)})")
        return 0

    if not args.plan:
        parser.error("Must specify a floor plan (or use --list)")

    # Resolve plan path
    plan_path = Path(args.plan)
    if not plan_path.is_file():
        candidate = FLOORPLANS_DIR / f"{args.plan}.json"
        if candidate.is_file():
            plan_path = candidate
        else:
            candidate2 = FLOORPLANS_DIR / args.plan
            if candidate2.is_file():
                plan_path = candidate2
            else:
                print(f"Error: Floor plan not found: {args.plan}", file=sys.stderr)
                return 1

    floorplan = load_json(plan_path)

    # By default, or on --validate, run schema validation
    errors = validate_floorplan(floorplan)
    if errors:
        print(f"Validation FAILED for {plan_path.name}:", file=sys.stderr)
        for err in errors:
            print(f"  - {err}", file=sys.stderr)
        return 1

    if args.validate:
        print(f"Validation PASSED: {floorplan.get('name')} ({plan_path.name}) is fully compliant.")
        return 0

    if args.ascii:
        print(f"=== TOP-DOWN LAYOUT: {floorplan.get('name')} ===")
        print(render_ascii_plan(floorplan))
        print()

    if args.metrics:
        print(f"=== MOVEMENT PATH METRICS: {floorplan.get('name')} ===")
        metrics = compute_path_metrics(floorplan)
        for m in metrics:
            print(f"  Path: {m['name']} ({m['id']})")
            print(f"    Type:             {m['type']}")
            print(f"    Clearance:        {m['clearance_width_m']}m")
            print(f"    Total Distance:   {m['total_length_m']}m across {m['waypoint_count']} waypoints")
            print(f"    Elevation Delta:  {m['elevation_delta_m']}m")
            print("    Legs:")
            for leg in m["legs"]:
                print(f"      {leg['from']} -> {leg['to']}: {leg['distance_m']}m")
        print()

    if args.stagecraft:
        print_stagecraft_report(floorplan)
        print()

    if args.render_ortho:
        from companion.ortho_floorplan import load_room_scene, save_ortho_bundle
        scene = load_room_scene(plan_path)
        out_dir = Path(args.render_ortho)
        bundle = save_ortho_bundle(scene, out_dir, supersample=2)
        cam = bundle["result"]["camera"]
        print(
            f"Rendered {len(scene.props)} 3D assets onto {cam.res[0]}x{cam.res[1]} "
            f"room-scale 2D map ({cam.px_per_m:.2f} px/m) -> {out_dir}"
        )
        return 0

    # If no specific mode flag was given, print a comprehensive summary
    if not (args.ascii or args.metrics or args.stagecraft or args.validate or args.render_ortho):
        print(f"Floor Plan: {floorplan.get('name')} ({floorplan.get('id')})")
        print(f"Scene:      {floorplan.get('scene_id')}")
        print(f"Zones:      {len(floorplan.get('zones', []))}")
        print(f"Paths:      {len(floorplan.get('movement_paths', []))}")
        print(f"Cue Marks:  {len(floorplan.get('stagecraft', {}).get('cue_marks', []))}")
        print(f"Sockets:    {len(floorplan.get('prop_sockets', []))}")
        print("\nTip: Pass --ascii, --metrics, or --stagecraft for detailed visual and blocking output.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
