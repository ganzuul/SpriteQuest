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
  arithmetic, hardcoded values. Its value is that it may be wrong cheaply. It
  carries no authority, is not the sensible thing to build on, and is expected to
  be superseded.
- **Normative code** is written to *declare* a structure already observed. It is
  the source of truth for that structure, and other code derives from it rather
  than restating it. Amendments change the normative module; they do not reach
  into its dependents.

Branches and duplication in exploratory code are honest admissions that the shape
is unknown. Do not abstract prematurely and call the result architecture.

### The principle

The two tiers differ in **authority**, and the useful constraint is about
**direction**: a declaration should be able to change without discovery forcing
it to, while discovery is free to change whenever the ground turns out to be
different.

Stated as a direction rather than a prohibition:

> **Declaration may not come to depend on discovery. Discovery is expected to
> depend on nothing.**

The reason is cost, not purity. When normative code borrows from exploratory
code, two things follow: the exploratory module gains a de-facto authority it was
never meant to have, and every change in it now propagates into the declaration.
That is the mechanism behind spaghetti, and it is worth naming precisely because
an agent that knows the mechanism can reason about a case the rules did not
anticipate.

### Working with the principle

1. **Explore freely while the structure is unclear.** Leave the branches there;
   they are evidence of what you did not yet know.
2. **When the structure becomes visible, write the normative module on its own
   terms.** It should not need the exploratory modules to be correct, and its
   tests should not need them to run.
3. **Port one consumer at a time**, and let the port delete the old path rather
   than preserve it beside the new one.
4. **Put any transition at the boundary, not in the core.** Where old and new
   must coexist for a while, the adapter is thin, one-directional, owned, and has
   a deletion date. A dated adapter is debt you intend to repay; an undated one
   is a second authority.

### The trap: obeying the letter

Absolute phrasing invites evasion, and evasion is what produces the mess. If you
find yourself doing any of these, the dependency is still there:

| Evasion | Why it does not count |
|---|---|
| importing inside a function body | the dependency is identical; only the grep is defeated |
| renaming a compatibility shim an "adapter" | the direction is unchanged |
| passing an exploratory object through, untyped | the declaration still breaks when discovery changes |
| duplicating a constant "to avoid the import" | two authorities, now guaranteed to diverge |

The test is not whether an import statement exists. It is: **if the exploratory
module changed shape tomorrow, would the normative module need editing?** If yes,
the dependency is real regardless of how the code is arranged.

### When the constraint should bend

The principle is about the steady state, so it allows stated exceptions. These
are the ones worth recognising:

- **A time-boxed adapter at the boundary**, while a consumer is ported. Legitimate
  if it is thin, one-directional, and has an owner and an end date.
- **A consumer that accepts both old and new input formats.** Two *data* paths are
  not two code paths; a file format is input, and reading it does not make the
  normative module depend on the exploratory one.
- **Reusing a definition, not a decision.** Importing a unit constant or a type
  that both tiers genuinely share is different from calling a branch-laden
  renderer. The first has no authority; the second does.

What is not an exception: keeping the old path "just in case", or leaving the
adapter undated so no one has to decide.

### Symptoms worth checking

Rather than a pass/fail gate, these are questions a reviewer can ask and an agent
can ask itself:

1. Does the normative module still make sense if the exploratory module were
   deleted?
2. Can its tests run without the exploratory modules present?
3. Is there an adapter? Whose is it, and when does it go?
4. Has an exploratory branch gained a new case since the port began? If so, the
   porting target is moving and should be re-scoped before continuing.

A grep for imports is still useful as a **tripwire** — it points at places worth
asking question 1 — but passing it is not evidence of anything.

### Words that steer this correctly

The wrong words invite the wrong move, so prefer these:

| Say | Not | Because |
|---|---|---|
| declare the contract, legislate the shape | "define an API", "flatten the interface" | An API can be *extracted from* existing code, which wraps exploration instead of replacing it. Declaring requires the shape to be visible first, and flattening is an *outcome* of declaring, not the discipline that earns it. |
| exploratory, provisional | "prototype", "v1", "the current API" | Those imply something to extend. Exploration is something to supersede. |
| derive from the normative module | "consumer of the API" | A dependent has authority only through the normative module; reading the exploratory version instead means there are two sources of truth again. |
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
