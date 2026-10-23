# Integration targets — getting a roleplay system in

> **What this document is.** The concrete, prospective integration targets for
> bringing an *actual roleplaying system* into SpriteQuest — named systems, the
> seam each lands in, and adopt-vs-reimplement. Companion to
> `docs/integration-architecture.md`, which states the principle (*authoring is
> free, standing is gated*); this names what we pull and where it goes.
>
> Written 2026-10-06. **Nothing is integrated.** Targets are prospective. Per
> `docs/prior-art.md`'s rule of use, external systems are *candidates, mapping
> not yet checked* — we may borrow a shape and never a citation or a number.

## What "an actual roleplaying system" means here

The runtime layer that makes an NPC **roleplay**: it decides how an NPC speaks,
what it wants, whether its role is written well enough to resume, and when it
breaks the fourth wall. Not the four content systems themselves (those exist —
`docs/integration-architecture.md` maps them) but the engine that *drives* them
in play and passes whatever the model authors through the deterministic gate.

The seam, stated once: **the game (Godot, downstream of the `laya` seam) plays
its modes deterministically; the roleplay system answers the NPC questions and
gates its own output.** The model authors; the gate decides standing; the game
never trusts an ungated answer.

## The seam reality — constraints that pick the targets

- **`tools/` is stdlib-only and offline** (`QWEN.md` invariant 1). The roleplay
  system does **not** go in `tools/`. It is a new top-level module or an
  out-of-process service.
- **The game is Godot (GDScript/C#).** So the roleplay system reaches the game
  as (a) an HTTP service Godot calls, (b) a reimplementation in GDScript, or
  (c) content authored at dev time and baked in. This is the controlling fork —
  see below.
- **Provenance is load-bearing** (`QWEN.md` invariant 3). Every authored output
  carries a sidecar and a gate verdict, exactly as a render does.
- **No model gates completion, rewards, or saves** (`QWEN.md` Boundaries). The
  model authors dialogue and motivation; a deterministic engine owns mechanics.

## The controlling fork — settle this first

**Does the roleplay system run *live* in the shipped game, or *author* content at
dev time that the game bakes?**

| | Live | Dev-time authoring |
|---|---|---|
| Where the model runs | beside the player | in the pipeline (`gemma4-orion`/`laya`) |
| Shipped game | calls an LLM at runtime | fully deterministic |
| Fits *authored, never spawned* (`docs/princess-effect.md`) | against | for |
| Fits *no model gates completion* | needs care | for |
| "An actual roleplaying system" | plainly yes | the capability, baked |

**Decided 2026-10-06 (user): both, from the start.** The service is the real
runtime — the model roleplays live beside the player — *and* the dev-time
authoring path, with no ship-dev-time simplification. Both callers use the same
verbs, the same schemas and the same gate; what differs is who calls and when
content is persisted (runtime turns are ephemeral and gated; dev-time authoring
is baked with provenance). More work up front, accepted.

The four targets below are valid under either answer — the spine, the motivation
gate and the prose gate are the same work — so this decision fixes the
*packaging*, not the build order. `runtime/` must serve both callers from day
one: no dev-time-only shortcut, no runtime-only shape.

## Targets, ranked

### Target 1 — The deterministic spine (galdr's shape, reimplemented)

The backbone: a small service that **owns NPC state** — role, aspirations, and
the grudge × role-written axes (`docs/design.md:43-46`) — plus an **append-only
event log as the authority**, and **gates everything the model authors**.

Why `galdr`: its spine *is* our certification posture — canonical entity store,
event log the world can be rebuilt from, deterministic backstops, the model
authoring narrative and never adjudicating. It is the closest thing to a
promotion-ready standing register that exists. **AGPL-3.0 → reimplement the
shape**, in Python to match the pipeline language (`galdr` is Python anyway).

- **Seam:** new top-level `runtime/` (never `tools/`). HTTP verbs, roughly:
  `speak(npc, situation)`, `motivation(npc)`, `demand(npc)`, `heal(npc, scene)`.
  Each returns authored content **plus** a gate verdict.
- **Adopt / reimplement:** reimplement (license). Borrow the *shape* — entity
  schema, event log, gate split. Never its numbers.
- **First action:** write the two schemas — the event-log record and the NPC
  entity (mirroring `npcs/hollis.json` + `docs/design.md:43-46`) — before any
  service code. The schema is the integration contract.

### Target 2 — The motivation network's gate (AdaMARP's action space)

`init_scene / pick_speaker / switch_scene / add_role / end` — a **discrete,
machine-checkable** action space. `add_role` is literally the verb behind *"an
NPC demands a well-written role"*: you complete their role, and whether it
counts as written is checked against the schema, not judged by a model.

Why `AdaMARP`: it formalizes the exact problem this mechanic is built on —
multi-character orchestration, scene transitions, on-the-fly role introduction —
and answers *is this role satisfied?* from a discrete action space.

- **Seam:** the motivation network's gate (currently ungated,
  `docs/integration-architecture.md`). The grudge × role-written axes become
  state the gate reads.
- **Adopt / reimplement:** adopt the **action-space schema** (public research
  code); reimplement the Scene Manager as a **deterministic** component, not an
  LLM judge. License unverified — take the schema's shape, not the code.
- **First action:** map `docs/design.md:43-46`'s two axes onto the action space;
  define what `add_role` must supply for a role to read as *written*.

### Target 3 — The prose gate (Orb's Editor pass)

A post-generation pass that detects slop, repetition and length-drift and
rewrites **only the offending sentences**. This is the deterministic gate for
**prose quality** — the check *"a well-written role"* requires. Pairs with
`earth-0`'s prose quality gate (a machine scan that forces a rewrite on failure —
the same mechanic, already built as a linter elsewhere).

Why `Orb`: algorithm-first by its own design rule (*if something can be done
with an algorithm, don't use an LLM*), and surgical — the model fixes targeted
sentences, not the whole turn.

- **Seam:** runs after `speak`/`demand`, before content reaches the game.
- **Adopt / reimplement:** reimplement the algorithm. **License unverified.**
- **First action:** enumerate the hard defects our NPCs would break the fourth
  wall over — leaked mechanics, padded openings, internal repetition, fake menu
  endings — as a scan list, per `docs/design.md:32`'s immersion contract.

### Target 4 — Interchange (low priority)

Adopt the **Tavern v2 character-sheet spec** as an import/export for
`npcs/*.json`, so a motivation sheet can round-trip through SillyTavern-class
authoring tools. Pure portability; does not affect play.

- **First action:** a stdlib converter in `tools/` between `npcs/hollis.json`
  and the Tavern v2 card JSON.

## What we do not integrate

- **Hosted NPC platforms** (Inworld, Convai) — they answer *"who owns the
  character?"* with *they do*. Contradicts the asset store, the provenance rule,
  and the kingdoms-as-income premise.
- **Chat frontends as runtime** (SillyTavern, Agnai, RisuAI) — prompt assembly,
  no game-mode runtime. Useful only as the Target 4 interchange.

## First action overall

Target 1's schema step: the event-log record and the NPC entity. It is the
integration contract every other target hangs off, it costs no GPU and no
licence, and it is testable offline (invariant 1). Everything downstream — the
motivation gate, the prose gate, the service — binds to those two schemas.

## Open decisions

- **The controlling fork** (live vs dev-time) — **settled 2026-10-06: both**,
  from the start. See the fork section above for what that fixes.
- **Service language and dependencies.** Python stdlib (`http.server`) to stay
  dependency-free, or FastAPI for robustness. `tools/` cannot host either; this
  is a `runtime/` decision.
- **Where the gate's authority lives.** `docs/manifest-rules.md:208` reserves
  promotion for a human. Does the roleplay service's gate grant standing
  automatically, or does it also stop at *report, don't record*? This is the
  same open question `docs/integration-architecture.md` raised, now with a
  concrete owner.

## Status

Prospective. No code, no dependency adopted. Targets are named so the next
session can pick one up without re-deriving the landscape.
