# OpenRig Faction Port — Design Handoff

**Design record:** 2026-10-23
**Status:** Audit + design handoff. Consolidates the OpenRig research into a
port plan for the proposed Cartographers of the Unmapped faction. It does not
authorize implementation.
**Companion:** [Expanded Nodes](expanded-nodes.md) for the workflow half; this
document owns the context / knowledge / organization half.

## 1. Objective and scope

The user-approved direction (2026-10-20 → 2026-10-23) is to move the proposed
**Cartographers of the Unmapped** faction — formalized as the
**Bureau of the Unwritten Atlas** — from an in-game lore concept into a
systematic faction design, using OpenRig (`https://github.com/mvschwarz/openrig`)
as the source of an existing spec worth porting from.

Scope of this document:

- Record the OpenRig audit findings.
- Record the concept mapping between OpenRig primitives and SpriteQuest
  artifacts.
- Propose the phase split (Phase 1: OpenRig-side port design. Phase 2: in-game
  porting into the SpriteQuest setting).

Out of scope: implementation, new fragments, new workflow nodes, new visuals.

## 2. Audit verdict: OpenRig already has the spec we need

The OpenRig repository already contains a substantial, current design system.
The audit (2026-10-23, source at clone `dae1dd9`) did not surface a single missing
primitive for this port; rather, it surfaced **the right existing vocabulary**.

### 2.1 Where the relevant specs live

| Concern | OpenRig artifact | Path (in clone) |
|---|---|---|
| Overall design / brand / interaction | `docs/DESIGN.md` | `docs/DESIGN.md` |
| Rig topology format | `docs/reference/rig-spec.md` | `docs/reference/rig-spec.md` |
| Agent blueprint format | `docs/reference/agent-spec.md` | `docs/reference/agent-spec.md` |
| Portable team artifacts | `docs/reference/rig-bundle.md`, `docs/reference/publishing-a-rig-bundle.md`, `docs/reference/bundle-formats.md` | `docs/reference/...` |
| Knowledge / epistemic ladder | `docs/reference/knowledge-maturity.md` | `docs/reference/knowledge-maturity.md` |
| Lore / position knowledge | `docs/reference/lore-routing.md` | `docs/reference/lore-routing.md` |
| World / mission / context composition | `docs/reference/mission-install.md`, context packs | `docs/reference/mission-install.md`, `packages/daemon/src/domain/context-packs/context-pack-types.ts` |
| Operating model (traces, chains, placement) | `skills/_canonical/core/openrig-operating-model/SKILL.md` | `skills/_canonical/core/openrig-operating-model/SKILL.md` |
| Context engineering practice | `skills/_canonical/process/context-engineering/SKILL.md` | `skills/_canonical/process/context-engineering/SKILL.md` |
| Mental model for a booting agent | `skills/_canonical/core/forming-an-openrig-mental-model/SKILL.md` | `skills/_canonical/core/forming-an-openrig-mental-model/SKILL.md` |
| Rig classes | same mental-model skill (kernel / project / ephemeral / infra-build / managed-app) | `skills/_canonical/core/forming-an-openrig-mental-model/SKILL.md` |

The docs are versioned, cross-linked, and machine-oriented (frontmatter with
`stage:`, `warrant:`, `sources:`), which is itself a strong signal that the
project treats these as governed artifacts rather than scratch notes.

### 2.2 Existing primitives relevant to the Bureau

**Context taxonomy (one shared enum, four kinds):**

`world | lore | skills | mission` — defined as the single classification point
for what kind of context something is.

- `world` = where you are (entities, rules, affordances).
- `lore` = what has been learned here (position knowledge earned in place).
- `skills` = what you know how to do (procedural capability).
- `mission` = what you are doing now (the current work and its intent).

**World anatomy — atoms:**

- Regions: `identity`, `ontology`, `terrain`, `actors`, `laws`, `history`,
  `state`, `affordances`. Atoms carry regions as metadata, not as folders.
- Situations: `fresh`, `handover`, `post-compaction`.
- Purposes: `depth`, `width`.
- Priorities: `core`, `recommended`, `optional`.
- Probes: natural prompt + expected observable behavior (behavioral acceptance).

**Knowledge maturity ladder:**

`DATA → FIELD NOTES / OBSERVATIONS → INSIGHTS → CANON`, with the stage enum
`wip | provisional | established | canonical | superseded | retired`.

Key discipline: canon is defined by *timescale of change* (years); insights
months; field notes days–weeks; data continuous. Canon diffs should read as
*addition*. Promotion is explicit (harvest / notice → fold in own words →
curate). The **warrant rule**: canon without warrants is cargo cult.

**Lore routing:**

Position knowledge lives in seat-local `lore/` files at a stable address
(`seat:lore/<stable-slug>.md`). Composition by address with explicit read
grants. Graduation into a shared/shippable artifact requires authored re-homing
and a `graduation:` record (source address, source stage, owner, warrant).

**Mission install:**

Five layers — pieces, arrangement, position, contract, derive-your-own-delta.
Two depth profiles (planning = full depth; execution = high-altitude). Delivery
rules: push composed-on-behalf, pointer-walk by default, paced absorption,
ask-for-reaction per piece, byte-walk only when the seat cannot read.

**Operating model:**

Two trees — topology (`fleet → instance → rig → pod → seat`) and work
(`project → mission → slice → proof item`). One filename per chain, identical at
every level (filename law). Trace = deliberate reorientation by ascending the
chains. Placement rule: context lives at the narrowest scope that needs it; skills
are only for what has no scope.

**Context engineering principles:** minimal-sufficient set of high-signal tokens;
context rot; position effects (U-curve, lost-in-the-middle); recitation;
stability is money; failures are context.

## 3. Concept mapping: OpenRig primitive → SpriteQuest artifact

| OpenRig primitive | In-game / design counterpart | What it gives the Bureau |
|---|---|---|
| Rig (topology of agents) | The Bureau as an agent team / org | Pods = context domains of the Bureau; edges = coordination shape. |
| Context pack (world/lore/skills/mission) | Faction fragments + world fragments + workflow guidance | The Atlas as a context pack: ontology + lore + skills + mission. |
| Atom (region × situation × purpose) | A single authored truth / fragment / workflow beat | The Bureau authors atoms; probes validate behavior. |
| Knowledge maturity stage | Epistemic maturity of a lore claim / canon line | The Bureau certifies what may be canon; demotion is loud. |
| Lore routing + graduation | Fragment → canon promotion | The Bureau's promotion pipeline. |
| Mission install layers | The Understudy ledger / event loop | Position knowledge installed at handover; derive-own-delta at fresh starts. |
| Rig bundle / publishing | "Rig" = shippable unit of competence (the video's "rigs are the new skills") | The Bureau ships "atlas rigs" / competence bundles. |
| Operating model trace/placement | SQ's context map of fragments per world | The "map is not the territory" enforcement. |

## 4. Draft: the Bureau of the Unwritten Atlas, expressed in OpenRig terms

| Bureau role | OpenRig shape |
|---|---|
| The Atlas (authored ontology) | A world context pack; atoms keyed by region (`ontology`, `actors`, `laws`, `history`). |
| Epistemic licensing / canon certification | Knowledge maturity ladder + warrant rule; stage moves with ceremony. |
| Route registry / competence licensing | Rig spec: pods for atlas-craft, route-survey, epistemic-audit; edges for delegation/observation. |
| Parables / examples (doghouse→moonbase) | Rig bundles / rig specs as shippable competence units with probes. |
| Progressive disclosure | Context profiles with phases (`guided-world`, `project-mission-role-task`, `coverage-map`). |
| Map is not the territory | Authored atlas vs runtime narrative; derive-from-source commands. |

## 5. Phase plan

### Phase 1 — OpenRig-side port design (source of truth)

- Formalize a **Bureau / Cartographers** context pack or world-pack sketch inside
  OpenRig's own authoring surface (the `world-*` packs are the closest existing
  home; a private rig-local world install is the second).
- Draft the Bureau's rig spec (lead cartographer, atlas cartographers, route
  surveyors, epistemic auditors; pods/edges).
- Draft Bureau lore items with stable addresses and warrants.
- Draft probes for the "reinvent-the-wheel" failure mode and for atlas drift.

### Phase 2 — in-game porting into SpriteQuest

- Faction plan: `library/plans/factions/cartographers.json` (or
  `unwritten-atlas.json`).
- Fragments: `library/fragments/cartographers/…` (atlas, route-registry,
  epistemic-maturity, rig-blueprint, parable).
- Composition overlays for base NPCs (Hollis / Pell / Customs House anchors).
- Maps: atlas / route surfaces under `library/maps/`.
- Workflow: understudy ledger loop → atlas approval / rig-map flow.

## 6. Open questions

1. Does the Bureau license *agents* (competence) or *knowledge* (atlas claims)?
   The OpenRig bundle model leans agent/knowledge dual-use.
2. What is the in-game analogue of OpenRig's "derive-from-source" (commands that
   answer current state) vs "authored canon"?
3. How does the Bureau interact with the existing factions (Space Vampires,
   Grey Wind, Customs House, Wizard Tower, Obsidian Wyrm, Neighboring Kingdom,
   Scaffolded Kingdom) without collapsing the world?
4. Where does the Understudy's "unwritten" fit the Bureau's licensing model?
