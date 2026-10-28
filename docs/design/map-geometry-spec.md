# Spec: Map Geometry Model v2

Status: **proposal, not implemented**
Phase 1 builds a standalone module; consumers are ported afterwards.
Related: [cartographers-moss-atlas-ontology.md](cartographers-moss-atlas-ontology.md),
[comfyui-runtime.md](comfyui-runtime.md)

## 1. Problem

Map declarations carry geometry in feature-specific fields, so every consumer
re-implements the same arithmetic. That is acceptable while the format is still
being discovered; it becomes the problem to solve once the shape is visible.
Two places branch on feature type today:

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
3. A **standalone** implementation: it must not import the current renderers,
   terrain loader, or scene placement, and nothing in this phase wires it into
   them. Legacy code is ported to it later, not extended to meet it.
4. No loss of existing capability. Every current feature must be expressible,
   proven by equivalence tests rather than by rewiring consumers.

## 3. Non-goals

This phase builds the architecture and stops there. Explicitly out of scope:

| Not in this phase | Why |
|---|---|
| Editing `terrain_mesh.py`, `render_map_art.py`, `scene_placement.py` | Those files are field sketches. Modifying them to host the new model tangles sketch and plate, which is the spaghetti this phase exists to prevent. |
| A compatibility shim inside existing consumers | A shim in legacy code is a dependency edge pointing the wrong way. |
| Deleting the four per-type branch blocks | That is the porting phase's work, done consumer by consumer. |
| EPSG/WKT CRS registry | Fictional world, flat per map; a frame record is sufficient |
| Geodesy, map projections, datum shifts | Longest map is 140 m; planar error is nil |
| OGC interchange encodings (WKT/GML/GeoJSON) | Take the model, skip the formats |
| ISO 19115 lineage metadata | Hollis Ledger and provenance already cover it |
| Spatial indexing (R-tree, tile pyramids) | 4 primitives, 7 STL primitives, 4 props, 1 build plate; brute force is clearer |

Reading `schema_version: 1` files is *not* a legacy dependency: it is an input
format, and supporting it keeps the new module testable against real data from
day one.

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

## 5. Architecture as source of truth

The rendered map we have today is a **field sketch**: it discovered the
structure (planar metres, a vertical axis, drape, rotation, feature kinds) but
expresses it per-feature. This model is the **engraved plate** — the first
statement of the architecture. From here the plate governs and the sketch
becomes a record of what to implement.

See `AGENTS.md` § "Field Sketch vs Engraved Plate" for the repository-wide rule
and its vocabulary; the lore fragments are
`library/fragments/cartographers/field-sketch.json` and
`library/fragments/cartographers/engraved-plate.json`.

Dependency rules, enforced by review and by a test that greps imports:

1. `companion/map_model/` imports only the standard library and, where
   unavoidable, `numpy`. Never `terrain_mesh`, `render_map_art`,
   `scene_placement`, or any `companion.*` consumer.
2. Consumers may import the model during porting. Until then, nothing does.
3. No compatibility branch is added to legacy code. Where old code must keep
   running, it keeps running unchanged on its own path.
4. When a consumer is ported, its old arm is deleted in the same commit. No
   consumer supports two geometry paths.

### Reading v1 data

`map_model` parses `schema_version: 1` files into the new types. This is a
reader for a data format, not a dependency on legacy logic, and it lets every
test run against `library/maps/border-march.json` immediately. The v1 reading
path is deleted only when no v1 file remains.

## 6. Phase plan

### Phase 1 — architecture, standalone (this spec)

Deliver `companion/map_model/` with primitives, frame, feature records, v1
reading, and the parent transform. No consumer changes. Acceptance is
equivalence: the model computes the same bounds and renders nothing.

### Phase 2 — port one consumer

Pick the cheaper of the two branch blocks — the MOSS layout builder
(`build_map_layout_prompt`, 141 lines with four arms) — and rewrite it on the
model, deleting the arms. Compare its nine boxes against the recorded draft
before wiring; wire only after they match.

### Phase 3 — port the loader

`load_outdoor_map_scene` reads features through the model instead of branching.
Verified by byte-identical depth and relief renders.

### Phase 4 — capabilities the sketch never had

Only after the ports: node topology (if a junction needs it), rotation-aware
extents for polygons, cartographic generalisation for smaller scales, and
standard aspect. These are additions to an established architecture, not
retrofits.

## 7. Migration and rollout

- v1 files keep loading. The new model reads them; legacy consumers are not
  touched in this phase.
- Writers emit v2 only after Phase 3.
- Overlap risk, and how it is contained:
  - **Freeze legacy to bug fixes.** No new feature types are added to the
    per-type arms once this phase begins, or the porting target moves.
  - **Equivalence, not rewiring, proves the port.** Boxes and renders are
    compared before a consumer switches.
  - **One commit per consumer.** The old arm and the new call land together, so
    no consumer ever has two geometry paths.

## 8. Impact

Phase 1 creates files and touches no existing module. Columns show when each
change lands.

| File | Phase 1 | Later phase |
|---|---|---|
| new `companion/map_model/` | primitives, frame, features, `extent()`, rotation, v1 reading, parent transform | — |
| new `companion/map_model/test_map_model.py` | geometry, frames, v1 reading, transform, equivalence | — |
| new `companion/validate_maps.py` | validates v1 and v2 files against the model | — |
| `library/maps/border-march.json` | read only, unchanged | migrated to v2 in Phase 3 |
| `companion/render_map_art.py` | **untouched** | Phase 2: `build_map_layout_prompt` collapses to one `extent()` call |
| `companion/terrain_mesh.py` | **untouched** | Phase 3: `load_outdoor_map_scene` reads features instead of four arms |
| `companion/scene_placement.py` | **untouched** | Phase 3: reads `placement` |
| `companion/floorplan.py` | unchanged | unchanged; floor plans stay a separate schema |

## 9. Acceptance criteria (Phase 1)

1. The new package imports nothing from `companion.*`. A test asserts this.
2. Reading `library/maps/border-march.json` yields one feature per declaration
   entry: 4 primitives, 7 STL primitives, 4 props, 1 build plate.
3. Bounds computed by the model match the current ad-hoc maths for all four
   primitive types, and match the nine existing MOSS layout boxes (build plate,
   4 primitives, 4 props). The circular prop radius is rotation-invariant, so
   the boxes must not move.
4. A synthetic two-map fixture resolves a child point into parent coordinates
   within 1e-6, and a `claimed` transform reports its confidence.
5. `validate_maps.py` passes on the real fixture and fails on: missing frame,
   geometry outside extent, unknown geometry type, unresolved node reference.
6. Existing suites still pass, proving nothing was disturbed.

Cross-phase acceptance (checked when a consumer is ported, not before):
byte-identical depth, relief, and stylized renders; no `ptype ==` or
`primitive_type ==` branch surviving in that consumer.

## 10. Open decisions

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
3. **Where does height live?** Per-feature `attributes` (current) or a `z` on
   geometry? Recommend attributes, since MOSS and layout work are planar.
4. **Are node references worth the parser cost now, or defer until a road
   network exists?** Recommend deferring topology to Phase 4 unless a junction
   already needs it.
5. **Should `frame.axis` be enforced or advisory?** Recommend advisory with a
   validator warning, to avoid rewriting existing fixtures.

## 11. Phase 1 scope

Geometry + frame + feature records + v1 reading, for all four primitive types
plus props, STL primitives, and build plates. No topology, no scale link
beyond the transform function, no consumer edits. Verifiable by acceptance
criteria 1–6. Topology and generalisation follow in Phase 4, against an
established architecture rather than retrofitted onto a sketch.