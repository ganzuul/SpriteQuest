# SpriteQuest Companion Service

This directory holds the companion backend service and character declarations for SpriteQuest's SillyTavern integration.

## What It Does

In SpriteQuest, characters have narrative "standing" tracked via an append-only ledger (`hollis-ledger.jsonl`):
1. **Seeded State**: Characters like Hollis the Quartermaster are seeded with authored standing (`"written": true`), while characters like Pell the Underwritten start unwritten (`unreliable`).
2. **Guidance on Send**: SillyTavern calls `GET /guidance` (via Lattice `Service Call` nodes) to retrieve current roster standing and prompt constraints.
3. **Draft Event Extraction**: Replies propose ledger events (e.g., granting a character their part, or changing grudges).
4. **Player Accept / Apply**: Accepted events are posted to `POST /events`, updating the roster state idempotently.

This loop is implemented as the Lattice workflow [`workflows/understudy.lattice.json`](../workflows/understudy.lattice.json).

## Contents

- `forge_service.py`: Local HTTP microservice exposing `/health`, `/roster`, `/guidance`, `/ledger`, and `/events`.
- `schemas.py`: Data structures (`EventRecord`, `Gate`, `fold_events`) modeling event validation and character folding.
- `demo_forge.py`: Playable standalone 5-beat walkthrough demonstrating the full loop.
- `test_forge_service.py`: Integration test suite for the forge HTTP server.
- `convert_character_card.py`: Bidirectional converter between `companion/npcs/*.json` and Tavern v2 character cards.
- `compile_faction_npc.py`: Compiles a base NPC declaration sheet with an NPC faction template into a faction-aligned NPC and Tavern v2 character card with embedded lorebook entries.
- `test_faction_compiler.py`: Unit test suite for the faction compiler and faction templates.
- `check_models.py`: Verifies presence of MOSS-Image-SFT diffusion weights, text encoders, and VAE in `~/ComfyUI/models/`.
- `render_sheets.py`: Batch renders NPC sheets (portrait, home, favored items, aspirations, cutout) via ComfyUI using MOSS-Image-SFT.
- `test_render_sheets.py`: Unit test suite for the MOSS-Image-SFT graph builder and sheet renderer.
- `workflows/comfyui/`: Versioned snapshots of generated ComfyUI JSON workflows for characters, assets, and maps.
- `floorplan.py`: Scene floor plan validator, traversal metrics calculator, and stagecraft blockout renderer (including `--render-ortho`).
- `test_floorplans.py`: Unit test suite for floor plan validation and metrics.
- `terrain_mesh.py`: 2.5D topological terrain heightfield compiler, slope and 45° overhang analyzer, elevation strata slicer, and binary STL 3D mesh exporter.
- `terrain_lighting.py`: Horizon raymarch directional shadow caster, interactive cursor depth probe light, and player-centric Line-of-Sight / Fog-of-War raymarcher.
- `test_terrain.py`: Automated unit test suite for terrain geometry, STL export, and lighting raymarchers.
- `export_web_preview.py`: Generates a standalone, hardware-accelerated CSS 3D parallax web preview with player-tracking perspective and live cursor depth probing.
- `ortho_floorplan.py`: Top-down orthographic 3D `.glb` asset rasterizer (`OrthoCamera`, software z-buffer + normal/elevation shading), room-scale 2D map composer (`composite_map.png`, `blueprint_map.png`, `depth_map.png`, `ids.png`, `sprites_contact_sheet.png`), MOSS-Image-SFT / Flux `<obj_N>` layout prompt builder, and spatial adherence evaluator.
- `test_ortho_floorplan.py`: Unit test suite for orthographic 3D projection, room map composition, and spatial adherence metrics.
- `run_floorplan_diffusion_tests.py`: Empirical benchmark testing 5 degrees of spatial conditioning with MOSS-Image-SFT on room-scale 2D floor plans.
- `npcs/`: Character declaration JSON files.
- `cards/`: Compiled Tavern v2 character cards with embedded lorebooks.
- `worldpack.json`: World identifiers and register metadata.

## Usage

### Run the Demo
```bash
python3 companion/demo_forge.py
```

### Run Tests
```bash
# Test the forge service and event ledger
python3 companion/test_forge_service.py

# Test the faction compiler and faction templates
python3 companion/test_faction_compiler.py

# Test the MOSS-Image-SFT renderer and graph builder
python3 companion/test_render_sheets.py

# Test Scene Floor Plans and stagecraft geometry
python3 companion/test_floorplans.py

# Test 2.5D Topological Terrain, STL Exporter & Lighting
.venv/bin/python companion/test_terrain.py

# Test Top-Down Orthographic 3D Asset Projection & Room-Scale 2D Map Composer
.venv/bin/python companion/test_ortho_floorplan.py
```

### Compile Outdoor Maps & Launch 2.5D Parallax Web Preview
```bash
# Compile outdoor map declaration into binary STL, topographic relief, and strata
.venv/bin/python companion/terrain_mesh.py library/maps/border-march.json

# Generate and view interactive CSS 3D parallax preview with cursor depth probe
.venv/bin/python companion/export_web_preview.py library/maps/border-march.json
# Open renders/maps/border-march/index.html in browser
```

### Render 3D Assets to Top-Down Orthographic 2D Floor Plan & Run Diffusion Control Tests
```bash
# Render 16 3D .glb furniture meshes orthographically onto a room-scale 2D map
.venv/bin/python companion/ortho_floorplan.py library/floorplans/furniture-room.json --out renders/floorplans/furniture-room/ortho_gt

# Run the 5-condition MOSS-Image-SFT spatial control benchmark
.venv/bin/python companion/run_floorplan_diffusion_tests.py --steps 25

### Inspect Scene Floor Plans & Stagecraft
```bash
# List all registered floor plans
python3 companion/floorplan.py --list

# Render ASCII layout and movement paths
python3 companion/floorplan.py glass-cathedral --ascii
python3 companion/floorplan.py customs-house --ascii --metrics

# Print stagecraft blocking and camera frustums
python3 companion/floorplan.py glass-cathedral --stagecraft
```

### Render NPC Sheets with MOSS-Image-SFT
```bash
# Verify model files in ComfyUI models directory
python3 companion/check_models.py

# Dry-run prompt assembly and workflow graph for all NPCs
python3 companion/render_sheets.py --dry-run

# Render a specific sheet (e.g. Hollis)
python3 companion/render_sheets.py companion/npcs/hollis.json --server http://127.0.0.1:8188
```

### Compile an NPC into a Faction Variant
```bash
# List available factions and base NPCs
python3 companion/compile_faction_npc.py --list-factions
python3 companion/compile_faction_npc.py --list-npcs

# Compile Hollis or Pell into a Space Vampire variant
python3 companion/compile_faction_npc.py --base hollis --faction space-vampires
python3 companion/compile_faction_npc.py --base pell-the-underwritten --faction space-vampires
```

### Run the Service for SillyTavern / Lattice
```bash
python3 companion/forge_service.py --seed-from companion/npcs/ --port 8788
```
