# Spec: Map Geometry Model v2

Status: **proposal, not implemented**
Supersedes: nothing (extends `schema_version: 1`)
Related: [cartographers-moss-atlas-ontology.md](cartographers-moss-atlas-ontology.md),
[comfyui-runtime.md](comfyui-runtime.md)

## 1. Problem

Map declarations carry geometry in feature-specific fields, so every consumer
re-implements the same arithmetic. Two places branch on feature type today:

| Consumer | Branching |
|---|---|
| `terrain_mesh.load_outdoor_map_scene` | four `if/elif ptype ==` arms: `ridge_pass`, `ancient_ruin_buttress`, `hill`, `canyon_gorge` |
| `render_map_art.build_map_layout_prompt` | four `elif primitive_type ==` arms, each recomputing an axis-aligned bound |

Consequences observed while building the MOSS workflow:

- A new feature type means editing the loader **and** the layout builder, in two
  different coordinate conventions, to teach each one the same bound.
- Each arm hand-rolls extent maths: `center ± base_width/2`, `start/end ±
  wall_slope_width`, `center ± radius`. `build_map_layout_prompt` contains no
  `yaw` reference at all. That is currently harmless rather than correct:
  `props[]` carries non-zero rotation (45°, 15°) but its bound is a circular
  `radius = scale × 1.5`, which is rotation-invariant; and the rotated
  `stl_primitives[]` (45°, 30°, 45°, 15°) never reach the layout builder, so
  their orientation is simply absent from the MOSS prompt. Any future attempt to
  place a rotated footprint from geometry would silently under-cover it.
- There is no declared spatial frame. `scale.dimensions` gives size in metres,
  but origin, axis orientation, and extent are implicit. Nothing can transform
  between two maps, so the Scale Register's "explicit transform to its parent
  map" exists only as prose.
- There is no topological identity. A road meeting a pass duplicates the
  coordinate; nothing prevents drift.
- No map validator exists, unlike floor plans (`floorplan.py:60` enforces
  `schema_version`).

## 2. Goals

1. One geometry vocabulary so extent, containment, and transform are computed
   once, independent of feature type.
2. An explicit frame per map, sufficient to place a child map inside a parent.
3. A versioned migration: v1 files keep loading unchanged; v2 is opt-in.
4. No loss of existing capability. Every current feature must be expressible.

## 3. Non-goals

Explicitly out of scope, with reasons:

| Not adopted | Reason |
|---|---|
| EPSG/WKT CRS registry | Fictional world, flat per map; a frame record is sufficient |
| Geodesy, map projections, datum shifts | Longest map is 140 m; planar error is nil |
| OGC interchange encodings (WKT/GML/GeoJSON) | Take the model, skip the formats |
| ISO 19115 lineage metadata | Hollis Ledger and provenance already cover it |
| Spatial indexing (R-tree, tile pyramids) | 4 primitives, 7 STL primitives, 4 props, 1 build plate; brute force is clearer |

## 4. Proposed model

### 4.1 Geometry primitives

Three types, matching OGC's planimetric set:

```jsonc
{"type": "Point",      "coordinates": [x, y]}
{"type": "LineString", "coordinates": [[x, y], ...]}
{"type": "Polygon",    "coordinates": [[[x, y], ...]]}   // ring, not closed-duplicated
```

Rules:

- Coordinates are metres in the map's declared frame, `[x, y]` order (matches
  existing `at`, `start`, `end`).
- Every geometry provides `extent() -> [x_min, y_min, x_max, y_max]` in local
  coordinates, ignoring rotation.
- Rotation stays a placement attribute (`yaw_deg`), not a geometry property.
  `extent(with_rotation=True)` must return the bound of the rotated geometry.
  This matters for any polygon or rectangular footprint; it changes nothing for
  the current circular prop radius.

### 4.2 Frame

A new top-level object; required in v2, derived in v1:

```jsonc
"frame": {
  "origin": [0.0, 0.0],
  "extent": [0.0, 0.0, 120.0, 140.0],
  "axis": {"x": "east", "y": "south", "z": "up"},
  "units": "m"
}
```

`axis` names are descriptive, not a CRS. `extent` is authoritative for bounds
validation; `scale.dimensions` remains for height and grid resolution.

### 4.3 Feature record

```jsonc
{
  "id": "east-pass",
  "kind": "ridge_pass",
  "geometry": {"type": "LineString", "coordinates": [[88, 12], [92, 132]]},
  "placement": {"yaw_deg": 0, "elevation_mode": "surface", "scale": 1.0},
  "attributes": {"pass_elevation": 6.0, "ridge_elevation": 14.0,
                 "pass_width": 3.0, "ridge_flank_width": 6.0}
}
```

- `kind` replaces `type` as the discriminator; `type` is reserved for geometry.
- `attributes` holds whatever the feature needs; consumers that care read it.
- `placement` groups the fields already used by `stl_primitives` and `props`.

### 4.4 Topology

Line and point features may reference shared nodes:

```jsonc
"nodes": {
  "n-span-junction": [92, 66]
},
"features": [
  {"id": "ridge-east", "kind": "ridge_pass",
   "geometry": {"type": "LineString", "coordinates": ["@n-span-junction", [92, 132]]}}
]
```

`"@<node-id>"` resolves to the shared coordinate at load time, so a junction is
one entity. Optional in v2; absent means no topology. A validator reports
duplicate coordinates within tolerance as a warning to encourage adoption.

### 4.5 Scale link

A child map may name its parent and the affine that places it:

```jsonc
"parent": {
  "map": "border-march",
  "transform": {"translate": [24.0, 24.0], "rotate_deg": 0.0, "scale": 1.0},
  "confidence": "surveyed"      // surveyed | claimed | disputed
}
```

`confidence` reuses the ontology's existing vocabulary: an unverified placement
is a claim, not a connection. Applying the transform is a pure function
`to_parent(point) -> point`; nesting repeats it.

## 5. Migration

- `schema_version: 1` files load unchanged. A shim converts each legacy arm to
  a geometry record in memory, so consumers see one shape.
- `schema_version: 2` files are read natively.
- Writers emit v2. Readers accept both for at least one release cycle.
- The v1→v2 shim is the single place that knows legacy field names, and it is
  deleted when v1 support is dropped.

## 6. Impact

| File | Change |
|---|---|
| `companion/terrain_mesh.py` | `load_outdoor_map_scene` reads geometry instead of four arms; `rasterize_stl_depth` and primitive stamping unchanged |
| `companion/render_map_art.py` | `build_map_layout_prompt` collapses to one `extent()` call per feature |
| `companion/scene_placement.py` | reads `placement` block |
| `companion/floorplan.py` | unchanged; floor plans stay a separate schema |
| new `companion/map_geometry.py` | primitives, `extent()`, rotation, node resolution, v1 shim |
| new `companion/validate_maps.py` | frame present, geometry valid, extents inside frame, duplicate-node warnings, transform sanity |
| `library/maps/border-march.json` | migrated to v2 as the reference fixture |

## 7. Acceptance criteria

1. `border-march` renders byte-identical depth, relief, and stylized art before
   and after migration (guard against silent geometry drift).
2. The MOSS layout draft for `border-march` keeps the same nine boxes
   (build plate, 4 primitives, 4 props). The circular prop radius is
   rotation-invariant, so migration alone must not move any box.
3. No `ptype ==` or `primitive_type ==` branch remains in either consumer.
4. A synthetic two-map fixture resolves a child point into parent coordinates
   within 1e-6, and a `claimed` transform is reported as such.
5. `validate_maps.py` passes on the migrated fixture and fails on: missing
   frame, geometry outside extent, unknown geometry type, unresolved node ref.
6. Existing test suites pass; new tests cover geometry, shim, topology, and
   transform.

## 8. Open decisions

1. **Does `Polygon` need to represent the current buttress footprint?** It is
   a rotated rectangle today (`base_width` × `base_length` + `yaw_deg`), and
   both current buttresses are square at 0°, so rotation plays no part yet —
   but `stl_primitives` do rotate. Options: keep a `Point` + footprint
   attributes with rotation-aware extent, or express a four-corner `Polygon` and
   let `yaw_deg` go. The former is less churn.
2. **Should `stl_primitives` enter the MOSS layout at all?** They are currently
   omitted, so `border-march`'s nine boxes cover build plate, four primitives,
   and four props. Including them adds seven rotated features and needs
   rotation-aware extents (open decision 1) first.
2. **Where does height live?** Per-feature `attributes` (current) or a `z` on
   geometry? Recommend attributes, since MOSS and layout work are planar.
3. **Are node references worth the parser cost now, or defer until a road
   network exists?** Recommend deferring topology to v2.1 unless a junction
   already needs it.
4. **Should `frame.axis` be enforced or advisory?** Recommend advisory with a
   validator warning, to avoid rewriting existing fixtures.

## 9. Sequenced first slice

Smallest change that proves the model: geometry + frame for
`ridge_pass`, `canyon_gorge`, `hill`, `ancient_ruin_buttress` only, with the v1
shim, no topology, no scale link. That deletes both four-arm blocks and is
verifiable by acceptance criteria 1–3 and 6. Topology and scale link follow as
separate slices with their own acceptance criteria.