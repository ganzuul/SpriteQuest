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

## Exploratory and Normative Code

This is a **top-level design abstraction**, not a stylistic preference. It decides
where new code goes and what may depend on what. Read it before introducing a new
structure.

### Two standing tiers

- **Exploratory code** is written to *discover* a shape. It exists because the
  structure is not yet visible, so it explores: per-case branches, duplicated
  arithmetic, hardcoded values. Its value is that it may be wrong cheaply. It is
  never authoritative, is not built upon, and is expected to be superseded.
- **Normative code** is written to *declare* a structure already observed. It is
  the single source of truth, and everything else derives from it. Amendments
  change the normative module; they do not reach into its dependents.

Branches and duplication in exploratory code are honest admissions that the shape
is unknown. Do not abstract prematurely and call the result architecture.

### The rule

> **Normative code must not depend on exploratory code, and exploratory code must
> never become the host of a new architecture.**

In practice:

1. **Explore freely while the structure is unclear.** Leave the branches there;
   they are evidence of what you did not yet know.
2. **When the structure becomes visible, introduce the normative module as a
   stand-alone package.** It must not import the exploratory modules, and must
   not be wired into them.
3. **Port afterwards, one consumer at a time.** Delete the old branch in the same
   commit as the port, so no consumer ever holds two code paths.
4. **Never add a compatibility shim to exploratory code.** A shim there inverts
   the dependency: it makes the exploration the host of the architecture, and the
   new design inherits the old shape.

### Overlap is the risk; contain it

While both tiers coexist there are two sources of truth. Contain it by **freezing
the exploratory code to bug fixes** (no new cases, or the porting target moves),
**proving equivalence at the boundary** (compare outputs before wiring), and
landing each port atomically.

### Words that steer this correctly

The wrong words invite the wrong move, so prefer these:

| Say | Not | Because |
|---|---|---|
| declare the contract, legislate the shape | "define an API", "flatten the interface" | An API can be *extracted from* existing code, which wraps exploration instead of replacing it. Declaring requires the shape to be visible first, and flattening is an *outcome* of declaring, not the discipline that earns it. |
| exploratory, provisional | "prototype", "v1", "the current API" | Those imply something to extend. Exploration is something to supersede. |
| derive from the normative module | "consumer of the API" | A dependent has authority only through the normative module, and must not consult the exploratory version. |
| amend the normative module | "patch the caller" | Fixing a derived copy leaves the source wrong. |

### In-world name

The Cartographers faction already runs this ladder, so the repository uses its
vocabulary in lore and prose: exploratory code is a **Field Sketch**, normative
code is an **Engraved Plate**, and a dependent is a **struck print**. See
`library/fragments/cartographers/field-sketch.json` and
`library/fragments/cartographers/engraved-plate.json`. The ladder's existing
tiers line up directly: a sketch carries `field note` standing, a plate carries
`canon`. The lore is the mnemonic; the engineering rule above is the authority.

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
