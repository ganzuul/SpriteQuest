# QWEN.md — SpriteQuest

## Repository Identity & Purpose

**SpriteQuest** is a **SillyTavern extension** developed as a fork and continuation of the **Lattice** workflow extension (`https://github.com/ganzuul/SpriteQuest`).

Its purpose is to provide node-based workflow orchestration and narrative consistency mechanisms (such as character standing, event ledgers, and roster guidance) inside SillyTavern.

---

## The 4th-Wall Seam: Knowingly Crossing the Lore / Engineering Boundary

SpriteQuest's core creative and architectural premise is the **standing translation rule**: real-world software engineering realities, agent systems, LLM constraints, and developer pain (e.g., underdetermination, context rot, prompt gaps, epistemic maturity, provenance, ledgers) are **knowingly and deliberately translated across the 4th wall into in-game lore, mechanics, and factions**.

Examples of this intentional crossing:
- **The Forge** translates generative model underdetermination into an in-world smithy that answers wishes literally and coarsely.
- **The Hollis Ledger** translates asset provenance and deterministic acceptance gates into a diegetic record where objects earn standing.
- **Pell the Underwritten** translates prompt underdetermination and incomplete character definitions into a diegetic character reality.
- **The Bureau of the Unwritten Atlas / Cartographers** deliberately adapts real-world agent orchestration and epistemic governance (such as OpenRig's knowledge maturity ladder, canon warrants, and context packs) into a fantasy faction certifying maps and truth.

### The Boundary: Why We Account For It (Engineering Hygiene)

We explicitly highlight this 4th-wall barrier **because we are knowingly crossing it**, not because crossing it is forbidden. 

The boundary is an **engineering discipline**, not a creative prohibition:

1. **Creative & Design Freedom**:
   - You **ARE EXPECTED** to adapt and translate real-world engineering concepts (e.g., OpenRig, diffusion pipelines, agent topologies, context engineering) into in-game factions, lore fragments, and mechanics.
   - Do **NOT** flag 4th-wall conceptual translation as a "category error" or a "boundary violation." It is the intended artistic and architectural methodology of SpriteQuest.

2. **Practical Repository & Code Hygiene**:
   - In actual code (`src/`, `ui/`, `companion/`), write clean, maintainable, idiomatic TypeScript, Svelte, and Python.
   - Use standard software engineering practices: conventional git commits (`feat:`, `fix:`), standard unit tests (`npm test`, `pytest`), and standard schema designs.
   - Do **NOT** confuse the in-game fiction with repository governance: do not write commit messages in in-game roleplay prose, do not invent git hooks gating code merges on "in-game character standing", and do not refuse normal refactoring on fictional grounds.

3. **Accounting for the Seam in Design Docs**:
   - When a design doc crosses this seam, it must clearly account for **both sides**:
     - **The Diegetic Translation**: How does the concept manifest in-game? (Faction plans in `library/plans/factions/`, lorebook entries, NPC dialogue, character cards, diffusion portrait modifiers).
     - **The Concrete Implementation**: How does it actually execute in the extension? (Lattice nodes in `workflows/`, JSON schemas, companion HTTP endpoints in `companion/`, standard Tavern v2 formats).

---

## Architecture & Codebase Layout

1. **SillyTavern Extension Root**:
   - `manifest.json`: SillyTavern extension manifest.
   - `index.js`: Extension entrypoint for SillyTavern.
   - `package.json`: Vite / Svelte build dependencies and test scripts.
   - `src/`: Core workflow engine, node operations, graph logic, and native SillyTavern adapters.
   - `ui/`: Svelte UI components for the visual canvas and node configuration.
   - `dist/`: Built extension bundle.

2. **Workflows (`workflows/`)**:
   - `workflows/understudy.lattice.json`: The Understudy workflow implementing the ledger/roster guidance loop in SillyTavern.

3. **Companion Service (`companion/`)**:
   - Optional local Python service (`companion/forge_service.py`, port 8788) providing an HTTP state machine for character standing and event logging.
   - `companion/demo_forge.py`: Standalone demo demonstrating the 5-beat ledger loop.
   - `companion/test_forge_service.py`: Automated test suite for the companion service.
   - `companion/npcs/`: Character declaration sheets (`hollis.json`, `pell-the-underwritten.json`, etc.).
   - `companion/convert_character_card.py`: Converter between NPC sheets and Tavern v2 cards.
   - `companion/compile_faction_npc.py`: Compiler composing NPC sheets with faction plans into Tavern v2 cards.
   - `companion/render_sheets.py`: Batch sheet facet renderer targeting MOSS-Image-SFT via ComfyUI.
   - `companion/check_models.py`: Model weights presence validator for MOSS-Image-SFT.

4. **Historical Prototype Archive**:
   - The pre-pivot experimental tools (ComfyUI pipelines, 3D meshes, Godot probes) are preserved in git branch `archive/pre-pivot-prototype`. They do not run inside the extension runtime.

---

## Field Sketch vs Engraved Plate: Exploratory and Normative Code

This is a **top-level design abstraction**, not a stylistic preference. It decides
where new code goes and what may depend on what. Read it before starting work
that introduces a new structure.

### The two standing tiers of code

- **Field Sketch** — code written to *discover* a shape. It exists because the
  structure is not yet visible, so it explores: per-case branches, duplicated
  arithmetic, hardcoded coordinates. Its value is that it may be wrong cheaply.
  It is **never authoritative**, is **not built upon**, and is **expected to be
  superseded**.
- **Engraved Plate** — code written to *declare* a structure already observed.
  It is the single source of truth. Everything else derives from it. Amendments
  re-engrave the plate; nobody patches a print.

The Cartographers' own ladder already names these: a sketch carries the `field
note` tier, a plate carries `canon`. Lore fragments:
`library/fragments/cartographers/field-sketch.json` and
`library/fragments/cartographers/engraved-plate.json`.

### The rule that follows

> **You cannot engrave what has not been surveyed, and you cannot print from a
> field sketch.**

In practice:

1. **Scaffold freely while the structure is unclear.** Branches and duplication
   are honest admissions that the shape is unknown. Do not abstract prematurely
   and call it architecture.
2. **When the structure becomes visible, stop and engrave.** Introduce the
   normative module as a **stand-alone** package. It must not import the
   scaffolding, and it must not be wired into it.
3. **Port afterwards, one consumer at a time.** Delete the old branch in the
   same commit as the port, so no consumer ever holds two geometry paths.
4. **Never add a compatibility shim to legacy code.** A shim in scaffolding is a
   dependency edge pointing the wrong way: it makes the sketch the host of the
   plate, and the architecture inherits the sketch's shape.

### Overlap is the risk; contain it

While sketch and plate coexist there are two sources of truth. Contain it by
**freezing the sketch to bug fixes** (no new cases, or the porting target moves),
**proving equivalence at the boundary** (compare outputs before wiring), and
landing each port atomically.

### Words to use, and words to avoid

| Say | Not | Because |
|---|---|---|
| engrave the plate, declare the contract | "define an API", "flatten the interface" | An API can be *extracted from* existing code, which is exactly wrapping scaffolding. Engraving requires the shape to be visible first. Flattening is an *outcome* of engraving, not the discipline that produces it. |
| field sketch, scaffolding | "prototype", "v1", "the current API" | Those imply something to extend. A sketch is something to supersede. |
| struck print, derived copy | "consumer of the API" | A print has authority only through its plate; it must not consult the sketch. |
| re-engrave the plate | "patch the print" | Fixing a derived copy leaves the source wrong. |

Full worked example: `docs/design/map-geometry-spec.md`.

---

## Development & Test Commands

```bash
# Build the SillyTavern extension
npm run build

# Run unit tests
npm test

# Run companion forge service demo
python3 companion/demo_forge.py

# Run companion test suite
python3 companion/test_forge_service.py

# Start companion service for SillyTavern
python3 companion/forge_service.py --seed-from companion/npcs/ --port 8788
```
