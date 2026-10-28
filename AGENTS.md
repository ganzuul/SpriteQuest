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

### Which tier is this code?

A useful first approximation: **code without a spec above it is exploratory.** It
is quick to apply and usually right. But it keys off whether a document exists,
and an agent can satisfy that by writing one afterwards, so use the test below to
settle the real question.

> **When the code and the spec disagree, which one is wrong?**

- The spec is right and the code is defective → **normative**. The spec is
  upstream; disagreement resolves toward it.
- The code is right and the spec was a guess → **exploratory**, whatever
  documents exist. The spec is downstream; it describes rather than governs.

A document that cannot be wrong is not a spec, it is a transcript. Authority
requires that the document could contradict what someone built. A spec written
after the fact, describing what the code happens to do, has no authority over
that code and does not promote it.

The same rule already governs fragments in this repository: canon without a
warrant is cargo cult, and a warrant certifies that evidence supports the claim
rather than following it. See `library/fragments/cartographers/canon-warrant.json`.

Practical consequences:

- **Writing a spec before the port** is what makes the port normative. The spec
  may be short and may change; what matters is that it is upstream.
- **Recording observed behaviour** is worth doing, but call it a description, and
  do not cite it as authority.
- **A spec that must be edited every time the code changes** was never upstream;
  demote it to a description rather than maintaining a fiction.

### The trap: obeying the letter

Absolute phrasing invites evasion, and evasion is what produces the mess. If you
find yourself doing any of these, the dependency is still there:

| Evasion | Why it does not count |
|---|---|
| importing inside a function body | the dependency is identical; only the grep is defeated |
| renaming a compatibility shim an "adapter" | the direction is unchanged |
| passing an exploratory object through, untyped | the declaration still breaks when discovery changes |
| duplicating a constant "to avoid the import" | two authorities, now guaranteed to diverge |
| writing the spec after the code and calling it normative | a spec that cannot be wrong describes; it does not govern |

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
| describe (what exploratory code does) | "spec", "contract", "the API" | A document written after the code cannot be wrong about it, so it records rather than governs. Write the spec before the port if you want authority. |

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

## Commit messages

A commit message states **authority, not inventory**. The diff already lists what
changed; the message exists so a reader can tell what they may now build on, what
they may not, and what has to happen before the next step. If that is unclear, the
message is not finished.

Every commit answers four questions, in this order:

1. **What was true before, and why could it not continue?** The constraint, in a
   sentence or two. Not the fix.
2. **What does this commit establish?** The behaviour a later change may depend
   on. Name the tier.
3. **What does it not establish?** Internal details that stay free to change, and
   capabilities that are absent or deliberately refused.
4. **What must be true before the next step?** A short promissory list, not a
   roadmap.

The questions scale. A one-line fix answers them in one line. A commit that
introduces a structure, moves a module between tiers, or changes a boundary may
need a page.

### Contract first (ICS-inspired)

The pattern is the one standards bodies use for conformance claims: an
**Implementation Conformance Statement** (ICS), defined for protocols by ISO/IEC
9646-7 through its PICS proforma. A proforma lists every requirement with its
status; the implementer records support against each. Copy the structure, not
the ceremony:

| Column | Meaning |
| --- | --- |
| Item | Stable identifier a commit can cite: `C1`, `C2`, ... |
| Requirement | One falsifiable capability |
| Reference | Where it is specified, and where it is tested |
| Status | `m` mandatory, `o` optional, `c.i` conditional, `n.a.` not applicable |
| Support | `Y` supported, `N` not supported; `N/A` only where status is `n.a.` |
| Remarks | Deviations, with their reason |

The contract is written **before** the work, or, where one already exists, cited
and amended rather than restated. Commit it with the code if that is convenient;
written after the code it is a description, however it is filed.

The commit then reports like a PICS: the items it supports, the items it does
not, and the deviations that explain why. Standards ask one question first — *are
all mandatory capabilities implemented?* — and answer "no" only with every
missing item listed and justified.

- **Number the requirements** so a commit can cite what it met.
- **Report conformance, not achievement.** Name the items supported, the items
  not supported, and the items the contract was missing.
- **Separate the two failures.** A *conformance gap* is a requirement not
  delivered. A *contract defect* is something delivery exposed that the contract
  failed to say. The second is the more valuable finding, and it is fixed by
  amending the contract, not by patching the code.

### Rules

- **Name the tier.** A commit that introduces a structure says whether it is
  exploratory or normative. Only a normative commit may call its document a spec,
  a contract, or an authority. A document written after the code is a
  *description*, whatever its title says.
- **Cite the contract.** Name the file if one exists; write it first if it does
  not. A commit that delivers requirements names the item IDs it supports and the
  ones it does not. A commit with no contract to cite is exploratory for the code
  it changes and says so; that is legitimate, but it cannot then claim authority
  over that code.
- **Refusals carry their code.** An operation that is deliberately unimplemented
  is listed with the code it returns, so the gap is discoverable rather than
  inferred from silence.
- **Adapters carry an owner and an end condition.** If old and new coexist, say
  whose adapter it is and what ends it.
- **Do not restate the diff.** File lists and per-file summaries belong in the
  change review, not the message.
- **Verification is a command.** `npm run test:ci`, not "tests pass".
- **Subject:** conventional `type(scope): act`, imperative, at most 72 characters.
  The act changes what the repository knows — explore, declare, port, amend,
  refuse, delete — not which files were touched.
- **Body:** wrapped at 72 characters. Length follows the tier, not the diff size.

A commit that adds a new structure without naming its tier is incomplete,
regardless of how good the code is.

The fill-in form is [`.github/commit-template.md`](.github/commit-template.md);
enable it once per checkout with
`git config commit.template .github/commit-template.md`, and install the
validator with `npm run hooks:install`. Its field reference, notation, and worked
examples are in [docs/commit-form.md](docs/commit-form.md).

The validator checks shape and contract freshness. It cannot check whether you
read the contract, and no password can: a token proves retrieval, not
understanding, and trains extraction. Do not add one.

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
