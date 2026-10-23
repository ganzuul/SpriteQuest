# Integration architecture — authoring is free, standing is gated

> **What this document is.** The principle that reconciles SpriteQuest's four
> systems with the roleplay-harness landscape, and where each external offering
> would land. Written 2026-10-06 *before any code*, so the direction is on disk
> for parallel work. Nothing here is implemented; the landscape rows are
> **candidates**, not adopted dependencies.
>
> Naming follows `docs/glossary.md`. Load-bearing nouns stay qualified
> (*hollis ledger*, *prop-store ledger*, *fragment library*, *the store*, *the
> customs house*) because the ratchet at commit time reads this file as prose.

## The principle

The roleplay landscape states one rule in two postures, and the difference is
the whole design.

**Restriction posture.** *"The LLM narrates. A deterministic engine adjudicates."*
Read as a prohibition: the model may not author, only describe; humans author
the world; the engine prevents illegal mutations. This is how
`native-gaming-harness` and `galdr` frame it — state authority means the model
cannot reach state except through a closed tool whitelist.

**Certification posture (ours).** The LLM **may author anything**. What it
authors must pass a **deterministic gate** before it becomes real. The gate does
not ask *"is this move legal?"* — it asks *"does this earn standing?"*

The distinction matters because the two postures license opposite work:

| | Restriction | Certification |
|---|---|---|
| What the model may create | narration | anything |
| What the gate prevents | illegal mutations | unearned **standing** |
| Failure mode | thin, over-constrained content | a yard full of warm approximations |
| Where effort goes | shrinking the model's reach | building the gate |

**We were already certification-posture before the landscape named it.**
`docs/lore.md:57` — *the hollis ledger is the difference between an artifact and
an asset* — and `docs/lore.md:71-72` — *nothing is real until it is written
down… it has no standing*. The forge (`docs/lore.md`) authors a hundred
artifacts freely: gemma4-orion rewrites, Qwen renders, no restriction on authorship.
One hollis-ledger entry is what turns an artifact into an asset. **The gate is
not damage arithmetic. It is standing.**

This is also the posture the game is *about*. A hero who restores dignity to a
broken narrative by authoring roles, and then has to earn them standing, is a
certification-posture story told in a certification-posture engine. The
restriction posture would forbid the very act the game asks the player to
perform.

## The gate is already two-tier, and it is better than the landscape's

`docs/manifest-rules.md` has already built the shape, and it is more
sophisticated than most surveyed projects:

- **Hard rules own the arithmetic and the blocking.** Deterministic; a rule
  either passes or refuses.
- **laya owns judgment and never blocks.** Advisory only, and measured to move
  on *contrast pairs* (does the answer move when the fact changes?) rather than
  absolute thresholds — because `probe_manifest_gate.py` found laya answers
  `0.23 no` at 77% confidence even on a sound crate, so an absolute gate would
  refuse every consignment (`docs/manifest-rules.md:223-232`).
- **Truncation reads `unevaluated`, never a silent pass** (`docs/manifest-rules.md:221-222`).

Most landscape projects have a gate that is either all-deterministic or
all-LLM-judgment. Ours already refuses to promote an advisory pass into an
action permission (`docs/manifest-rules.md:242`). The integration inherits this
split rather than importing a flatter one.

### The reconciliation this forces

`docs/manifest-rules.md:208-210` says *what the clerk may never do is write the
hollis ledger — promotion stays the human's threshold*. `docs/production.md:401`
says promotion is *an explicit human decision, not automatic*. Those are the
standing doctrine.

The principle above does **not** overturn them. It splits a question they had
bundled:

- **Authoring** — who may create a candidate. *Anyone, the model included.* Free.
- **Validation** — what must be true. *The deterministic gate.* Never the model.
- **Authorization** — who triggers the standing-grant. *Currently: a human.*

The three are separable. The model authors; the gate validates deterministically;
a human (today) authorizes. The open decision — recorded below, not settled here —
is whether authorization may itself become a deterministic rule. Until it does,
the doctrine holds and the principle adds nothing that contradicts it.

## The four systems are already here

Before integrating anything, it is worth stating that the four systems are not
absent — they are the repo's signature, and each already has a gate.

| System | Where it lives | What it authors | Its gate today |
|---|---|---|---|
| **Grounding** | `docs/prior-art.md` (the well of finished answers), fragment `evidence` (`library/README.md`), `docs/manifest-rules.md` | claims, citations | verbatim `evidence.quote` in `evidence.source`; *a second memory is corroboration, never a citation* (`docs/prior-art.md:116`) |
| **4th-wall lore compatibility** | `docs/theatre.md` (register boundaries), `docs/glossary.md` (two-names, rule 3b zoning), `tools/find.py:33-46` | fiction ↔ tooling correspondence | `tools/check_glossary.py --staged` ratchet; *what the registers may not write into each other* |
| **Motivation network** | `npcs/*.json` (`role`/`aspirations`/`favored_items`/`home`), `docs/guild.md` (capability), `docs/princess-effect.md`, the grudge × role-written axes | roles, aspirations, dialogue | not yet gated — see below |
| **Asset store** | `docs/scenes/asset-store.md`, `tools/prop_store.py`, `scenes/asset-store/` | artifacts from the forge | the hollis ledger entry (promotion) — **not implemented** (`docs/production.md:415`) |

Two of the four are gated. The two that are not — the motivation network's roles,
and the store's promotion — are exactly where the landscape contributes.

## The landscape, sorted by posture

Recall the survey's five layers. For our purposes only two matter.

**The engine-owns-state school** — `native-gaming-harness`, `galdr`, `earth-0`,
`RpgAi`, `covel` — is the fit, because it shares the certification concern: a
deterministic store, an append-only event log as authority, and a model that
contributes without being trusted with standing. `galdr`'s tagline is our
principle misread as a prohibition, which is why it felt like a match.

**The chat frontends** (SillyTavern, Agnai, RisuAI) and **hosted NPC platforms**
(Inworld, Convai) are not the fit. The frontends are prompt-assembly with no
game-mode runtime — useless for tower defense, puzzle, platformer. The hosted
platforms answer *"who owns the character?"* with *they do*, which contradicts
the asset store, the provenance rule, and the kingdoms-as-income premise.

## Integration map

Each offering, placed by the system it augments, with the gate its output would
pass through. The question that admits an offering is always the same: ***what
does it author, and what deterministic gate makes it real?*** A system with no
gate may contribute authoring and never standing.

| Our system | Integrate from | What it authors | Gate its output passes |
|---|---|---|---|
| **Asset store** (standing) | `galdr`: canonical entity store + append-only event log + deterministic backstops | entities, artifacts, roles | **promotion** — the hollis ledger entry |
| **Grounding** (provenance) | `native-gaming-harness`: `ToolCallLog` as sole event log; `galdr`: *a database remembers* | claims, citations | verbatim-quote check; sourced/uncited (`docs/prior-art.md`) |
| **Motivation network** | `AdaMARP`: Scene Manager action space (`add_role`/`pick_speaker`) + profiles & motivations; `earth-0`: NPC mind-isolation | roles, aspirations, dialogue | grudge × role-written axes; a prose quality gate |
| **4th-wall compatibility** | little to import — this one is **original to SpriteQuest** | fiction ↔ tooling boundary | `check_glossary.py --staged`; register boundaries |

Two offerings are worth taking outright because they *are* gates, on surfaces we
have no gate for:

- **`Orb`'s Editor pass** — a ReAct loop that detects slop, repetition and
  length drift and rewrites only the offending sentences. This is the
  deterministic gate for **prose**, the one surface none of our four systems
  currently gate. Pairs with `earth-0`'s prose quality gate (a machine scan that
  forces a rewrite on failure — already the mechanism behind *"an NPC demands a
  well-written role"*, built as a linter).
- **`AdaMARP`'s `add_role` / `pick_speaker`** — a machine-checkable answer to
  *"is this NPC's role satisfied?"* decided from a discrete action space rather
  than by an LLM's opinion. That is the verb behind the mechanic where a scene
  must be made *more complete* before the NPC resumes it.

## The reimplementation list

License is not a blocker for *testing* integration, but the game worlds are
real-world income, so anything we ship links only permissive code. These are
adopted as **patterns to reimplement**, never as linked dependencies:

1. **`galdr`'s canonical entity store + append-only event log + deterministic
   backstops** — the highest-value borrow and the closest thing to a
   promotion-ready standing register. Reimplement the *shape*: entities with
   typed relationships, an append-only log as the authority, the world
   rebuildable from events alone. **AGPL-3.0** (engine) + CC-BY (SRD rules).
2. **`galdr`'s hierarchical compaction** for very long campaigns — needed once
   the princess carries a long memory. Not urgent.
3. **Tavern v2 character card** (SillyTavern's format) — adopt as an
   *interchange* for the motivation network's `npcs/` sheets, for portability.
   Do not take the frontend.

Verified licenses: `native-gaming-harness` **Apache-2.0** (checked 2026-10-06),
`galdr` **AGPL-3.0**, `Agnai` **AGPL-3.0**. `Orb`, `AdaMARP`, `earth-0`, `covel`,
`RpgAi`, `SillyTavern`, `RisuAI` — **license unverified**; do not assume
permissive. Per `docs/prior-art.md`'s rule of use, these rows enter the well as
**candidates, mapping not yet checked** — the borrowed *shape* may be cited,
never another project's numbers.

## The first slice — the promotion gate

`docs/scenes/asset-store.md:99-105` already names it: **promotion is
unimplemented**, and it is *the largest single gap in the architecture… this one
blocks meaning.* `docs/production.md:415` records the same gap and its open
questions (copies or renames; beside or inside the item folder).

That gap **is** the certification posture waiting to be built:

> An artifact (`scenes/asset-store/props/<set>/<item>/NNNNN.png`) gains standing
> through a single append-only event in the prop-store ledger, behind a
> deterministic gate. The model may author freely; the gate decides what becomes
> the shipped `<slug>.png` asset; a human authorizes the standing-grant until we
> decide otherwise.

One slice does three things at once: closes the named largest gap, runs
*authoring is free, standing is gated* as code instead of prose, and proves the
integration posture before anything larger is attempted. It is `tools/promote.py`
plus tests — stdlib only, offline, per invariant 1 — writing to the existing
`ledger.jsonl` shape so provenance stays append-only.

## Open decisions this raises

Recorded, not settled. Each belongs to a later document, not here.

- **Authorization.** Does the standing-grant stay a human's threshold
  (`docs/manifest-rules.md:208`), or may a deterministic rule authorize it? The
  principle permits either; the doctrine currently says human. Deciding this is
  the real content of the promotion gate.
- **The motivation network's gate.** Roles and dialogue are authored today with
  nothing checking them. `AdaMARP`'s action space and `Orb`'s Editor pass are
  two different gates for the same surface — declarative satisfaction vs prose
  quality. Likely both, and they must not block each other.
- **What the model may author into standing.** If authoring is free, the gate is
  the only thing standing between the forge and the hollis ledger. Whether an
  LLM-authored *role* may ever be promoted the way a rendered *artifact* is —
  `docs/guild.md`'s trained/untrained split is the likely answer — is open.
- **Provenance across the boundary.** An artifact carries a sidecar (seed, prompt
  hash, alpha verdict). A promoted role has no equivalent. What is the sidecar
  for authored narrative, and where does it live?

## Status

Not implemented. No code. This document is the direction; `docs/prior-art.md`
receives the landscape rows when a mapping is actually checked, not before.
