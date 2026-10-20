# The fragment library

Reusable units of world vocabulary for `docs/quarantine/compiler-pipeline.md`. Fragments
are **sources**; composed system prompts, rewrites and images are **artifacts**.

```
fragment ──compose──> system prompt ──rewrite──> prompt ──render──> sketch
   ▲                                                             │
   └────────────────── observations (creative direction) ────────┘
```

## What a fragment is

**One observable detail, in prose, with where it came from.** Not a concept, not
a design note, not a sentence of a character sheet.

The test is visual: *could an artist be handed this single line and draw it?*

### Two kinds, and the test each one answers

That test is the test for a fragment the **renderer** reads. The pipeline has a
second consumer — the rewriter — and a rule addressed to it is not drawable and
should not pretend to be:

| `for` | Read by | Composed into | Admission test |
|---|---|---|---|
| `diffusion` | the sampler | appended to the render prompt, **after** refinement | could an artist be handed this line and draw it? |
| `gemma4-orion` | the rewriter | the system prompt, **before** refinement | would this change what the compiler writes? |

The distinction is enforced at compose time, not advisory, and the reason is
`docs/quarantine/dev-pain-log.md` entries 2 and 9: **rewriting erodes constraints**. A
mechanical constraint routed through the rewriter gets paraphrased until it
decays, so a `diffusion` fragment may never enter a system prompt —
`tools/compose_prompt.py` refuses rather than sorting. See `docs/quarantine/compose.md`.

A `gemma4-orion` fragment carries no `facets`: facets select details for a *sheet*,
and a rule for the writer belongs to no sheet.

The reason rules live here rather than in the prompt file is the reason anything
lives here: versioned, evidence-bearing, selectable per batch, and testable by
whether the next render changed. `docs/quarantine/dev-pain-log.md` entry 14 is the failure
that moved them.

| Fragment | Not a fragment |
|---|---|
| "thin dashed stitch lines between separately laid background tiles" | "the world is under construction" |
| "a garment shoulder rendered as a flat, differently-shaded slab" | "unmodelled props create unease" |
| "a ledger with two columns of figures that do not sum" | "the asset trade is unbalanced" |
| "describe the object from one face, at one moment" (`for: gemma4-orion`) | "renders look better when you are careful" |

Most of the game's design — orthogonal currencies, healing costing performance
budget, the two kingdoms' diplomacy — is real and load-bearing, and none of it
renders. It belongs in the design doc. If a fragment needs a paragraph of
explanation, it is two fragments or it is not a fragment.

## Hard rules and underdetermined findings — 2026-10-09

`check_library` does not treat every complaint as one kind of thing, because
they are not one kind of thing. A finding is one of two:

| | What it is | development run | version-bump run |
|---|---|---|---|
| **hard rule** | a constraint the project has earned certainty about | warning | fatal |
| **underdetermined** | a real shape we have not settled yet | advisory | advisory |

**The asymmetry is the design, and it is not a setting.**

An unresolved shape is not a defect to be closed before shipping. The
underdetermined finding is the normal state of the fragment library, and it is
expected to survive to the release build — where it stops being a loose end and
becomes part of what the game is. The fiction already keeps an unresolved
artifact in the yard on purpose (`docs/quarantine/scenes/asset-store.md`); the schema is
allowed the same honesty.

Hard rules are the scarce thing. Each is earned by discovery — a render that
came back wrong, a decision that turned out to matter — and persists because we
found a reason to keep it, not because someone declared it.

The two do opposite work, which is why they need separate names: **hard rules
are the constraints that make the game fun and challenging; underdetermined
states are what persist to release and become part of gameplay.** Neither is
provisional.

### A version bump gates hard rules, and never underdetermined findings

The bump is where a hard rule stops being a warning and starts being a gate: a
development run prints it and passes, a version-bump run prints it and fails.
That is the whole of the escalation available, and it is available only to
findings we have already promoted.

There is no flag, mode or argument that makes an underdetermined finding fatal,
and a version bump is not one. Bumping `schema_version` changes what the checker
*understands*; it does not change what counts as a defect. The same finding is
advisory before a bump, during a bump, and after it — and it stays advisory
through release, because that is the status, not a phase.

A bump does a second thing: it is the moment we decide which underdetermined
findings have stopped being underdetermined. **Promoting a finding to a hard
rule is a deliberate act with a visible diff, and it is a major milestone for a
game leaning this heavily on underdeterminism** — it encodes a decision about
the game, so it belongs in review rather than in a config value.
`check_glossary.py` already carries the shape this borrows: a dated severity
declared per entry, a ratchet that gates only what has been earned, and old debt
that never blocks.

### Which findings are which

| Finding | Status | Why |
|---|---|---|
| unknown `facet`, `world_id`, field or `facts` key | **underdetermined** | the vocabulary is a guess; we do not know enough to make it immutable |
| `for` absent, or not `gemma4-orion`/`diffusion` | **hard rule** | not a vocabulary guess but a routing decision with no safe default: each guess fails silently on the opposite side of the refinement seam, and `docs/quarantine/dev-pain-log.md` entries 2 and 9 already establish that rewriting erodes what it routes. Added 2026-10-09 with `docs/quarantine/compose.md`; the composer refuses on the same grounds regardless of how this checker is graded |
| `facets` present on a `gemma4-orion` fragment | **underdetermined** | it selects nothing, so it is noise rather than a contradiction: advisory in both run modes, and never fatal under any of them |
| `evidence.quote` not found in `evidence.source` | **hard rule** | provenance is checkable now, and has been needed since 2026-10-03 |
| `id` disagreeing with its path; duplicate `id` | **hard rule** | scope must be visible from the path alone, and ids are cited by composed prompts |
| empty `detail` | **hard rule** | there is nothing to compose |

**Not yet implemented.** `check_library` still reports every finding as fatal;
the split above is the policy, and the checker has not been changed to match.
Recording it here first is deliberate — the wording should survive being
implemented.

## Schema v1

One JSON file per fragment, `library/fragments/<world>/<id>.json`. JSON only —
the repo is stdlib-only and already reads sheets this way.

```json
{
  "schema_version": 1,
  "id": "shared/seam-lines",
  "version": 1,
  "world_id": "shared",
  "for": "diffusion",
  "facets": ["home", "portrait"],
  "detail": "thin dashed stitch lines running between separately laid background tiles",
  "evidence": {
    "kind": "observed",
    "source": "npcs/hollis-the-twice-written/observations.md",
    "quote": "dashed stitch lines drawn between background tiles"
  }
}
```

| Field | Rules |
|---|---|
| `id` | `<world>/<slug>`. Globally unique. Never reused. |
| `version` | Positive integer, bumped when `detail` changes. Git is the history; this is what lets a composed prompt cite an exact revision. |
| `world_id` | `shared`, or a registered kingdom. Display names (`"princess's kingdom"`) are labels, never identifiers. |
| `for` | Required. `gemma4-orion` or `diffusion` — which model reads this, and therefore which side of the refinement seam it enters. There is deliberately no default: guessing `diffusion` files a writer's rule where the sampler ignores it, guessing `gemma4-orion` routes a mechanical constraint through the rewriter, where it erodes. See `docs/quarantine/compose.md`. |
| `facets` | Non-empty subset of `portrait`, `home`, `favored_items`, `aspirations`. Required for `diffusion`; **omitted entirely** for `gemma4-orion`, which selects no sheet. |
| `detail` | The payload. Prose, one detail, no leading article required. |
| `evidence` | Required. See below. |
| `facts` | Optional, see below. Only where the model's default reading is wrong. |
| `requires` | Optional. Fragment ids this one cannot stand without — a plan selecting it must select them too. Hard rule in `check_library`, refused by `compose_prompt`, never auto-added. Same `for` only. See `docs/quarantine/compose.md`, "`requires`". |

### `evidence.kind` — the distinction that matters

Your observations are **creative input**, not pixel transcripts. You are acting
as creative director and delegating detail work, so an observation may describe
something that was never in the image. That is a legitimate and primary source
of this library.

But provenance must record which kind it is, because the two answer different
questions later:

| `kind` | Meaning | Question it answers |
|---|---|---|
| `observed` | Seen in a rendered image | "Has this ever survived a render?" |
| `directed` | Creative direction; may have no image yet | "What are we aiming at?" |

`observed` is evidence the detail reaches the model. `directed` is a hypothesis
the next render tests. Both are first-class; neither is better. A fragment
without any `observed` entry is untested, which is worth knowing — not a defect.

Interpretations ("shipped scenery awaiting installation") are neither. They are
your reading of a detail, and if they enter as fragments every downstream render
inherits your interpretation as if it were observation. Keep them in
`observations.md`, where they are honestly labelled.

### `facts` — structured values the model would otherwise get wrong

```json
"facts": {
  "extent": "4 m long, 20 cm diameter",
  "scale_ref": "longer than a person is tall; stood on end, taller than a doorway",
  "material": "heavy primed canvas, not paper",
  "count": 1
}
```

A rolled theatre backdrop with no facts is a paper scroll to the model. **A fact
earns its place by correcting a plausible misreading** — not by being true. A
wooden crate needs no dimension.

Closed vocabulary: `extent`, `scale_ref`, `material`, `count`, `state`.

Two things `facts` does and does not do:

- **Does** give refinement passes fixed values to preserve instead of erode, and
  lets compose derive literal checks mechanically.
- **Does not** enforce anything in the rendered image. Absolute measurements are
  weakly honoured by diffusion models; `scale_ref` is what actually renders,
  because relational scale is what the model can act on.

Absolute measurements are never written into `wh_ratio` — object extent and
frame ratio are unrelated, and a rewriter seeing `4 m × 20 cm` may emit `1:20`.

## Symbols and Glyphs

Symbols, sigils, and glyphs represent discrete visual marks, stamps, seals, and notations within the world. Like all fragments, a glyph fragment describes **one observable mark**, in prose, with where it came from.

### Conventions for Glyph Fragments

1. **Location and Naming:**
   - Universal or cross-regional marks live under `library/fragments/shared/` with the `glyph-` prefix:
     - `library/fragments/shared/glyph-customs-seal.json`: The Customs attribution seal (two-pan scale with nested calipers).
     - `library/fragments/shared/glyph-grimoire-sigil.json`: The Wizard Tower name-and-tie uncial sigil (parallel rods with diagonal ligature).
     - `library/fragments/shared/glyph-unwritten-mark.json`: The Understudy's unwritten baseline mark (ruled line with empty circle indicator).
   - Regional or faction-specific marks live under their respective world directory (e.g. `library/fragments/<world_id>/glyph-<slug>.json`).

2. **The Admission Test for Glyphs:**
   - For `for: diffusion`: Describe geometry, stroke weight, medium (vermilion wax, cinnabar ink, engraved silver, graphite), and substrate. The test remains: *could an illustrator or sampler render this exact mark onto a surface?*
   - For `for: gemma4-orion`: Describe semantic binding or reading constraints (e.g., how the writer must treat an embossed seal or an unwritten heading).

3. **Required Fields & Facts:**
   - **`facets`**: Typically `["favored_items", "portrait", "home"]` because glyphs appear on seals, stamped props, illuminated manuscripts, or architectural lintels.
   - **`facts`**: Always specify `extent`, `scale_ref` (size relative to hands, documents, or doorways), `material` (e.g., vermilion wax, cinnabar ink, graphite), and `state` (e.g., crisp, worn, chipped).

## Deliberately not in schema v1

Deferred because nothing consumes them yet, not because they are wrong:

- **`tags`** — no retrieval. Selection is an explicit authored plan, so a batch
  prompt cannot silently bloat by matching everything.
- **`maturity`** (`draft`/`reviewed`/`locked`) — no code reads it. Evidence
  ("where did this come from") and maturity ("how may it change") are separate
  axes; add both together or not at all.
- **`constraints`** — derived from `facts` when a checker needs them. Maintaining
  both by hand guarantees they drift apart.
- **`conflicts`** — five fragments from one world have nothing to conflict about.
  Note that in this game "matte flat backdrop" vs "rich volumetric fog" is not an
  error but two states of the same level, healed and unhealed. Conflict handling
  must warn, never block.
- **Automatic promotion.** Promotion is a deliberate act by a human.

## Layout

```
library/
  README.md
  fragments/
    shared/                 # belongs to no single kingdom (includes shared glyphs: glyph-*)
    customs-house/          # checkpoint and inspection fragments
    neighboring-kingdom/    # the friend's game
    obsidian-wyrm/          # wyrm and citadel fragments
    scaffolded-kingdom/     # the princess's game
    wizard-tower/           # tower and grimoire fragments
  plans/                    # ordered {id, version} selections, one per batch
```

`world_id` must match the directory, so a fragment's scope is visible from the
path alone.

## Adding one

```bash
python3 tools/add.py fragment      # a new fragment
python3 tools/add.py facts         # add or edit facts on an existing one
python3 tools/add.py observation   # append to an NPC's observations.md
python3 tools/add.py sheet         # a new NPC sheet
python3 tools/add.py fragment --dry-run   # stop before writing
```

The rules above are shown as you type and checked as you type, the file is
previewed before it is written, and `check_library` runs on the result -- so a
fragment the tool writes is a fragment this pipeline accepts.

Hand-editing the JSON is fine; it is only JSON. Two things are easier to get
right through the tool: `evidence.quote` must appear *verbatim* in
`evidence.source`, which is matched for you against the file, and a source
under an ignored path (a render directory, say) is flagged before it can
become provenance that resolves for nobody else.

## Validation

```bash
python3 tools/check_library.py     # offline; exit 0 = valid
```
