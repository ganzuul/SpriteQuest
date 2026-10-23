# Specification: 2.5D Topological Outdoor Map Engine & SillyTavern Extension

**Document Status**: Draft / Architectural Specification  
**Subsystem**: SpriteQuest Outdoor Maps, 2.5D Parallax Renderer & Fog-of-War Engine  
**Module Identifier**: `spritequest-outdoor-engine`

---

## 1. Executive Summary & Purpose

This document specifies the architecture, data models, rendering techniques, and gameplay mechanics for **topological outdoor maps** in SpriteQuest. 

Outdoor maps serve as the macro-scale geographic canvas connecting scenes, movement routes, encounter zones, and ancient ambient ruins. Rather than employing a heavy, fully-rendered 3D viewport or a static flat 2D tilemap, this system implements a **browser-native 2.5D diorama stack**:
- **Ground Truth**: High-resolution 2.5D heightfield geometry exporting directly to binary STL collision meshes.
- **Architectural Constraint (The 3D-Printer Rule)**: Physical overhang limits ($45^\circ$ slope boundary) used as a mechanical and narrative marker designating non-navigable ancient ruins vs. modern habitable settlements.
- **Visual Presentation**: Player-centric perspective where the camera's vanishing point tracks the player character, rendered via hardware-accelerated **CSS 3D transforms** and layered elevation strata.
- **Interactive Depth Probing**: Dynamic shadows cast by a directional global light and a cursor-anchored probe light, allowing the player to physically sense terrain elevation through cast shadows.
- **Sightlines & Fog of War**: Real-time elevation-aware Line-of-Sight (LOS) raymarching originating from the character's eye position.
- **Procedural Composition & Fast Diffusion**: Assembly of modular terrain primitives (passes, plateaus, terraces) textured in near-realtime via fast distilled diffusion passes.

Due to its clean separation of concerns, this system is designed to be usable directly within SpriteQuest or packaged as an independent **SillyTavern extension** for tabletop RPG spatial exploration.

---

## 2. Geometric Ground Truth & The 3D-Printer Overhang Rule

### 2.1 The 2.5D Heightfield Model
Terrain elevation is modeled as a continuous single-valued heightfield:
$$z = h(x, y), \quad x \in [0, W], \; y \in [0, L]$$
discretized into a metric grid with step resolution $\Delta x = \Delta y = \delta$ (typically $\delta = 0.5\text{m}$ to $1.0\text{m}$).

### 2.2 Surface Normals and Slope Classification
For each grid node $(x, y)$, the surface tangent vectors and unit normal $\hat{n}$ are derived:
$$\vec{T}_x = \left(\delta, 0, \frac{\partial h}{\partial x}\delta\right), \quad \vec{T}_y = \left(0, \delta, \frac{\partial h}{\partial y}\delta\right), \quad \hat{n} = \frac{\vec{T}_x \times \vec{T}_y}{\|\vec{T}_x \times \vec{T}_y\|}$$
The slope angle $\theta$ relative to the horizontal plane is:
$$\cos \theta = \hat{n} \cdot \hat{z} = \hat{n}_z$$

Terrain traversability and mechanical zoning are classified strictly by slope $\theta$:
| Slope Angle $\theta$ | Terrain Classification | Gameplay / Traversability Impact |
| :--- | :--- | :--- |
| $\theta < 35^\circ$ | **Navigable Terrain** | Standard walking / running, roads, open meadows, plateaus. |
| $35^\circ \le \theta < 50^\circ$ | **Scramble / Difficult** | Half-speed movement, high stamina cost, scree / steep slope. |
| $\theta \ge 50^\circ$ | **Impassable Cliff Wall** | Impassable barrier unless stairs, ramps, or climbing gear exist. |

### 2.3 The "Ancient Overhang" Constraint
In early additive manufacturing (FDM 3D printing), molten extrusions cannot span air without sagging unless supported; slopes steeper than $45^\circ$ require temporary support structures.

**SpriteQuest Game Mechanic & Lore Rule**:
- **Ancient Ruins (Ambient Backdrop)** strictly obey the $45^\circ$ overhang constraint. Ancient architecture is characterized by stepped ziggurats, corbelled vaults, $45^\circ$ cantilevered buttresses, and talus stone ramps.
- **Visual Marker**: Any geometry exhibiting strict $45^\circ$ slope boundaries is marked as **Ancient / Unwritten Ambient Scenery**—it serves as visual framing and barrier boundary, signaling to the player that it is non-navigable relic infrastructure.
- **Modern / Living Construction** (e.g., the Customs House, wooden bridges, scaffolds) breaks this rule using tensile timber, iron bolts, and horizontal cantilevers, signaling interactable and inhabited human space.

### 2.4 The High-Resolution STL Collision Mesh
The heightfield is triangulated into a standard triangle list (two triangles per cell) and exported to standard binary **STL (`.stl`)** format:
- **Zero tooling overhead**: Can be inspected in any slicer (PrusaSlicer, Cura), 3D viewer, Blender, or Godot.
- **Physical precision**: Exact vertex coordinates in metres.
- **Fast 2D collision lookup**: Height and slope queries are $O(1)$ coordinate evaluations.

---

## 3. Player-Centric Perspective & CSS 3D Parallax

### 3.1 The Moving Perspective Origin
Rather than a fixed global camera, the perspective origin tracks the player character's screen position $(x_P, y_P)$:

```
           [North Cliff Wall]  <-- Tilts back away from player
                   ^
                   |
  [West Tower] <-- (Player) --> [East Ridge]  <-- All features lean AWAY from player
                   |
                   v
           [South Valley Drop] <-- Pulls forward / reveals floor below
```

For any feature at world coordinate $(x, y, z)$ when the player is at $(x_P, y_P, z_P)$, the apparent visual displacement $\Delta \vec{s}$ relative to the base plane is directed radially away from the player:
$$\Delta \vec{s} = (\vec{p}_{\text{feature}} - \vec{p}_{\text{player}}) \cdot \frac{z - z_P}{D_{\text{eye}}}$$
where $D_{\text{eye}}$ is the virtual eye distance.

**Gameplay Result**:
- As the player walks toward a high plateau, its cliff face rises and foreshortens toward them.
- Standing at the lip of a canyon $(z_P > z_{\text{floor}})$ exposes the canyon floor underneath.
- Standing in a trench or valley $(z_P < z_{\text{rim}})$ causes the surrounding ridge walls to loom over the view.

### 3.2 Browser-Native Implementation via CSS 3D Transforms
The viewport uses standard CSS 3D transforms, delegating matrix calculations and hardware acceleration to the browser compositor:

```html
<div class="sq-map-viewport" id="viewport">
  <div class="sq-map-world" id="world">
    <!-- Discrete Elevation Strata (Quantized Layers) -->
    <div class="sq-stratum stratum-0" style="transform: translateZ(0px);"></div>
    <div class="sq-stratum stratum-1" style="transform: translateZ(35px);"></div>
    <div class="sq-stratum stratum-2" style="transform: translateZ(80px);"></div>
    <div class="sq-stratum stratum-3" style="transform: translateZ(140px);"></div>

    <!-- Billboards / Props -->
    <div class="sq-prop-layer" style="transform-style: preserve-3d;"></div>

    <!-- Lighting & Fog-of-War Canvas Overlay -->
    <canvas id="lighting-canvas" class="sq-lighting-overlay"></canvas>

    <!-- Player Token -->
    <div id="player-token" class="sq-player-token"></div>
  </div>
</div>
```

```css
.sq-map-viewport {
  width: 100%;
  height: 100%;
  overflow: hidden;
  perspective: 1000px;
  perspective-origin: var(--player-screen-x, 50%) var(--player-screen-y, 50%);
  transition: perspective-origin 0.2s cubic-bezier(0.2, 0.8, 0.25, 1.0);
}

.sq-map-world {
  position: relative;
  width: var(--map-pixel-width);
  height: var(--map-pixel-height);
  transform-style: preserve-3d;
  will-change: transform;
}

.sq-stratum {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-repeat: no-repeat;
  background-size: contain;
}
```

Updating `--player-screen-x` and `--player-screen-y` smoothly updates the vanishing point across all strata at 60 FPS without DOM re-renders or WebGL overhead.

---

## 4. Lighting, Cursor Depth Probing, and Line-of-Sight

### 4.1 Dual-Source Dynamic Shadow Casting
Depth is communicated through cast shadows rather than heavy 3D rendering:

1. **Global Sun / Moon Light**: Directional vector $\vec{L}_{\text{global}} = (L_x, L_y, L_z)$. Casts static/slow-moving cast shadows from cliffs, ridges, and buildings.
2. **Interactive Cursor Depth Probe**:
   - A virtual light source is positioned at the mouse cursor coordinate $(x_M, y_M)$ at an elevation $z_M = h(x_M, y_M) + 2.5\text{m}$.
   - As the player hovers their cursor across the map, radial shadows stretch away from the cursor across elevation steps.
   - **Tactile Depth Sensation**: Moving the mouse over a flat plateau casts round, even light; moving near a cliff edge causes sharp, elongated shadow cascades, allowing the player to "feel" terrain drops before walking there.

### 4.2 Elevation-Aware Horizon Raymarching
For any light source $(x_0, y_0, z_0)$ and terrain point $(x_t, y_t)$, shadow occlusion is evaluated along the discretized line segment:
$$\text{tan\_max} = \max_{s \in (0, 1)} \left( \frac{h(x(s), y(s)) - z_0}{\text{dist}(s)} \right)$$
If $\text{tan\_max} > \frac{h(x_t, y_t) - z_0}{\text{dist}(t)}$, the point is occluded and rendered in shadow.

### 4.3 Line-of-Sight (LOS) and Fog of War
Visibility is computed strictly from the player character's eye position $(x_P, y_P, z_P + h_{\text{eye}})$ where $h_{\text{eye}} \approx 1.7\text{m}$:

```
Player Eye (xP, yP, zP + 1.7m)
       \
        \  (Sightline Ray)
         \_______
                 \
                  \___ Target (x, y, z)
                    |
            [Ridge / Cliff Wall blocks sightline]
```

#### The Three Visibility States:
1. **Unexplored (The Void / Unwritten Subfloor)**: Completely unrevealed. Displayed as dark cross-hatched parchment or unprinted architectural subfloor.
2. **Explored / Inactive (Cartographic Memory)**: Previously visited. Displayed with muted contour lines, terrain elevation relief, and known static architecture. No active NPC tokens or dynamic props are visible.
3. **Active Sightline (Direct View)**: Inside the player's immediate field of view and unblocked by terrain. Full color, active actors, dynamic candle/torch flicker, and real-time shadow response.

---

## 5. Terrain Primitives & Modular Outdoor Map Schema

To avoid monolithic or non-interactive map generation, outdoor maps are composed from **modular topological primitives** combined with **scene build plates**.

### 5.1 Terrain Primitive Types
- `ridge_pass`: A traversable low-elevation saddle flanked by two impassable cliffs.
- `plateau_terrace`: A flat, elevated tableland with stepped approach ramps.
- `canyon_gorge`: A sunken river bed or dry gulch with steep walls.
- `ancient_ruin_buttress`: A stepped $45^\circ$ geometric relic framing boundary edges.
- `open_lowland`: Rolling meadow / valley floor connecting major landmarks.

### 5.2 Scene Build Plates (Embedding Indoor / Local Scenes)
Full architectural scenes (such as `library/floorplans/customs-house.json` or `furniture-room.json`) clip directly into the outdoor map via designated **Build Plates**:
- A build plate defines a rectangular footprint $[W \times L]$ at elevation $Z_{\text{base}}$ with flattened terrain $(h(x, y) = Z_{\text{base}})$.
- Interior scenes render seamlessly within the macro-map, allowing characters to transition from outdoor ridges to indoor desks without context switches.

### 5.3 Map Specification Schema (`library/maps/*.json`)
```json
{
  "schema_version": 1,
  "id": "border-march",
  "name": "The Border March & Forfeit Gap",
  "scale": {
    "unit": "meter",
    "grid_step": 0.5,
    "dimensions": {"width": 120.0, "length": 180.0, "height": 30.0}
  },
  "strata": [
    {"id": "valley", "z_min": 0.0, "z_max": 6.0, "css_z": 0},
    {"id": "road_bench", "z_min": 6.0, "z_max": 14.0, "css_z": 45},
    {"id": "high_plateau", "z_min": 14.0, "z_max": 24.0, "css_z": 95},
    {"id": "ruin_peaks", "z_min": 24.0, "z_max": 30.0, "css_z": 150}
  ],
  "build_plates": [
    {
      "id": "plate-customs-house",
      "scene_floorplan": "library/floorplans/customs-house.json",
      "anchor": {"x": 42.0, "y": 60.0, "elevation": 6.0},
      "facing_deg": 0.0
    }
  ],
  "primitives": [
    {"type": "ridge_pass", "at": [20.0, 40.0], "rotation_deg": 45},
    {"type": "ancient_ruin_buttress", "at": [85.0, 110.0], "overhang_constrained": true}
  ]
}
```

---

## 6. Near-Realtime Diffusion Pipeline (Styling the Collage)

While geometry, collision, and LOS are deterministic:
1. **The Topo Collage**: The engine renders a base orthographic terrain collage (elevation shading + contour rings + placed build plates).
2. **Fast Latent Refinement**: Using a fast distilled diffusion pass (1-step / 4-step Latent Consistency Model, SDXS, or step-distilled Flux Klein) with `ReferenceLatent` or low-step Img2Img (`denoise = 0.40 - 0.55`):
   - Blends seams between terrain primitives into seamless grass, rock strata, and gravel.
   - Generates terrain textures in **1–2 seconds**, enabling dynamic map generation during live play or campaign prep.

---

## 7. SillyTavern Extension Integration Plan

When deployed as an extension inside SillyTavern / Lattice:
- **UI Component (`ui/outdoor-map/`)**: A Svelte component hosting the CSS 3D viewport, rendering map strata, actor tokens, and the lighting/LOS canvas.
- **Lattice Workflow Nodes**:
  - `Map: Load / Switch`: Sets active outdoor map and initializes player starting mark.
  - `Map: Move Actor`: Updates actor $(x, y, z)$, triggering CSS perspective transition and recalculating LOS.
  - `Map: Query LOS`: Returns whether Actor A has Line-of-Sight to Actor B, injecting narrative visibility constraints into character prompts.
- **Companion Service (`companion/`)**:
  - `terrain_mesh.py`: STL generation, slope/overhang checker, and elevation sampling.
  - `terrain_lighting.py`: Horizon shadow casting and LOS mask computation.
