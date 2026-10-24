#!/usr/bin/env python3
"""Target 1's two schemas: the NPC entity and the event-log record.

    python3 -m unittest discover -s runtime     # offline, stdlib, no GPU

**The integration contract** every other target binds to
(`docs/quarantine/integration-targets.md`, Target 1). Two shapes:

  * ``NPCEntity``   -- the roleplay state of one character: role, motivation,
                       and the two axes from ``docs/quarantine/design.md:43-46``.
  * ``EventRecord`` -- one line of the append-only event log.

Why the log is authoritative and the entity is a projection (galdr's shape,
reimplemented, AGPL not linked): if the entity were the truth, a model could
reach past the gate and mutate it. Making the append-only log the only authority
means **state can only change through an event, and every event carries its gate
verdict and provenance**. The entity is rebuilt from events alone
(``fold_events``) -- the same property that lets ``docs/quarantine/lore.md`` say *nothing is
real until it is written down*. A state change with no event is not a different
state; it is a lie the log will not corroborate.

Both callers -- the runtime turn and dev-time authoring (decided 2026-10-06,
*both from the start*) -- write the same events. What differs is persistence:
a runtime ``speak`` is gated and returned and may never need to survive the
turn, while a dev-time ``role.authored`` is baked with its sidecar. The schema
does not care; ``EventRecord`` is the same either way.

Offline, stdlib only (invariant 1, extended to ``runtime/``).
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field, replace
from pathlib import Path

# --------------------------------------------------------------------------
# Closed vocabularies. Same discipline as library/README.md's `facts`: a term
# earns its place by being checkable, and an unknown term is a defect, not a
# maybe. Keep these small; widen them when a consumer needs it, never before.
# --------------------------------------------------------------------------


def _registered_worlds() -> tuple[str, ...]:
    """The worlds a pack declares, read from its `worldpack.json`.

    One source of truth, shared with `check_library.WORLDS` and
    `prop_compiler.KEYS`, which read the same file through
    `tools/worldpack.registries`. `runtime/` stays stdlib-only and never
    imports `tools/`; it reads the pack file directly instead. If the pack is
    absent -- the module lifted out on its own -- fall back to the reference
    worlds rather than accept any `world_id`: a missing pack is a deployment
    slip, not a licence to widen the vocabulary.
    """
    for candidate in (
        Path(__file__).resolve().parent / "worldpack.json",
        Path(__file__).resolve().parent.parent / "worldpack.json",
    ):
        if candidate.exists():
            pack = candidate
            break
    else:
        pack = Path(__file__).resolve().parent / "worldpack.json"
    try:
        worlds = json.loads(pack.read_text()).get("worlds") or ()
    except (OSError, ValueError):
        worlds = ()
    worlds = tuple(str(w) for w in worlds)
    return worlds or ("shared", "scaffolded-kingdom", "neighboring-kingdom")


#: Registered worlds. `world_id` is an identifier; a display name
#: ("princess's kingdom") is a label and never an identifier.
WORLD_IDS = _registered_worlds()

#: Axis B, `docs/quarantine/design.md:43-46` -- "whether their part is written". The
#: paperwork. `written` and `restored` count as written; the other two do not.
ROLE_STATES = ("unassigned", "drafted", "written", "restored")

#: Who caused an event. Split so provenance can answer "was this authored or
#: adjudicated?" -- the gate is never the same actor as the model it judges.
ACTORS = ("model", "gate", "human", "game")

#: Event kinds. State-changing kinds are listed in FOLDERS; the rest are
#: records that change no state and exist so the log is complete.
EVENT_KINDS = (
    "entity.seeded",     # identity + motivation enter the world
    "role.authored",     # a role is written (model authors it)
    "grudge.changed",    # axis A moves -- what he did to them
    "standing.granted",  # the promotion: an artifact gains standing
    "heal",              # a role is restored; the NPC resumes it
    "gate.verdict",      # the deterministic gate records a judgment
    "speak",             # a runtime turn: dialogue generated
    "demand",            # an NPC demands a well-written role
    "fragment.synthesized", # cartographer/model mints a provisional field note
    "fragment.curated",     # human edits fragment; grants Canon Warrant & standing
    "fragment.criticized",  # human deletes fragment; records negative criticism tombstone
    "domain.saturated",     # domain reaches saturation threshold; canon locked
)

#: The deterministic gate's answer. `unevaluated` is a first-class outcome and
#: never a silent pass (docs/quarantine/manifest-rules.md:221-222): a question with an
#: owner, not a safety or a danger.
GATE_VERDICTS = ("pass", "refuse", "unevaluated")

#: Help disposition, `docs/quarantine/design.md:43-46`. "The paperwork wins."
HELP = ("helps", "refuses", "unreliable")


class SchemaError(ValueError):
    """A record that cannot be trusted.

    Raised on any field that is missing, the wrong type, or outside its closed
    vocabulary. The failure this prevents: a record that *parses* but means
    nothing, which is how a gate starts approving things it never examined."""


def _require(data: dict, key: str, kind):
    if key not in data:
        raise SchemaError(f"missing required field {key!r}")
    value = data[key]
    if not isinstance(value, kind):
        label = kind.__name__ if isinstance(kind, type) else "/".join(k.__name__ for k in kind)
        raise SchemaError(f"field {key!r} must be {label}, got {type(value).__name__}")
    return value


def _one_of(value: str, allowed: tuple, label: str):
    if value not in allowed:
        raise SchemaError(f"{label} must be one of {allowed}, got {value!r}")
    return value


# --------------------------------------------------------------------------
# The NPC entity
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class Motivation:
    """What the character wants, and where they belong.

    Mirrors the sheet fields (`npcs/hollis.json`): `aspirations` is the want
    (a story has a want -- charter.md), `favored_items` and `home` are texture.
    Kept together because a role is written against all three."""

    aspirations: str
    favored_items: tuple = ()
    home: str = ""


@dataclass(frozen=True)
class Role:
    """The paperwork -- axis B.

    `state` is the vocabulary; `written` is the axis the help rule reads. Both
    are kept because they answer different questions: `state` says how far along
    the writing is, `written` says whether the NPC may be expected to resume it."""

    state: str = "unassigned"
    text: str = ""

    def __post_init__(self):
        _one_of(self.state, ROLE_STATES, "role.state")

    @property
    def written(self) -> bool:
        return self.state in ("written", "restored")


@dataclass(frozen=True)
class Grudge:
    """Axis A -- what he did to them. The world, not the paperwork.

    Renamed from ``Standing`` 2026-10-16: standing is what being written down
    earns (`glossary/standing.md`), and that is the *role* axis; hanging the
    old name on the grudge inverted the mechanic the paperwork-wins rule
    exists to express.

    `grudge` is 0.0..1.0. The help rule only asks whether he *bears a grudge*
    (grudge > 0); the magnitude is for scenes and for the log, so a small slight
    and a betrayal are not the same entry. Independent of the paperwork, and the
    paperwork outranks it (`docs/quarantine/design.md:46`)."""

    grudge: float = 0.0

    def __post_init__(self):
        if not (0.0 <= self.grudge <= 1.0):
            raise SchemaError(f"grudge must be within 0.0..1.0, got {self.grudge}")

    @property
    def bears_grudge(self) -> bool:
        return self.grudge > 0.0


@dataclass(frozen=True)
class NPCEntity:
    """One character's roleplay state.

    Identity + motivation are authored (`entity.seeded`); the two axes move via
    events. The entity is a *projection* of the log -- see ``fold_events``."""

    id: str
    name: str
    world_id: str
    motivation: Motivation
    role: Role = Role()
    grudge: Grudge = Grudge()
    events: tuple = ()  # EventRecord ids that built this projection

    def __post_init__(self):
        if not self.id.startswith("npc/"):
            raise SchemaError(f"id must be 'npc/<slug>', got {self.id!r}")
        _one_of(self.world_id, WORLD_IDS, "world_id")

    def help_disposition(self) -> str:
        """Deterministic help rule -- the motivation network's gate, seeded.

        `docs/quarantine/design.md:43-46`, verbatim in effect: an unhealed NPC who bears no
        grudge helps unreliably; one who bears a grudge refuses; a healed one who
        still resents him helps anyway. This is pure and total on purpose -- no
        model may decide it -- because it is the one behaviour the whole game is
        built to make the player *feel*, and a judged answer would be a coin
        wearing a costume."""
        return help_disposition(self.role.written, self.grudge.bears_grudge)


def help_disposition(written: bool, bears_grudge: bool) -> str:
    """The two-axis help rule as a pure function, so tests can pin every cell.

    The paperwork wins: a written role obliges regardless of feeling. That is
    the point of the mechanic -- help from someone who does not like you."""
    if written:
        return "helps"          # healed, grudge or not -- the paperwork wins
    return "refuses" if bears_grudge else "unreliable"


# --------------------------------------------------------------------------
# The event-log record
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class Gate:
    """The deterministic gate's verdict on an authored thing.

    `rule` names which check ran; `verdict` is never inferred from the model's
    confidence -- `unevaluated` is how a truncation or a missing fact reads
    (docs/quarantine/manifest-rules.md:221-222)."""

    rule: str
    verdict: str
    checks: tuple = ()

    def __post_init__(self):
        _one_of(self.verdict, GATE_VERDICTS, "gate.verdict")


@dataclass(frozen=True)
class EventRecord:
    """One append-only line in the authority.

    `gate` and `provenance` are the two things a model's output must carry to be
    citable -- the same split as a render's sidecar (QWEN.md invariant 3). An
    authored event with no gate is an artifact in the yard: present, warm, and
    with no standing."""

    seq: int
    kind: str
    entity: str
    actor: str
    data: dict = field(default_factory=dict)
    gate: Gate | None = None
    provenance: dict = field(default_factory=dict)

    def __post_init__(self):
        if self.seq < 0:
            raise SchemaError(f"seq must be >= 0, got {self.seq}")
        _one_of(self.kind, EVENT_KINDS, "kind")
        _one_of(self.actor, ACTORS, "actor")
        if not (self.entity.startswith("npc/") or self.entity.startswith("prop/") or self.entity.startswith("fragment/")):
            raise SchemaError(f"entity must be 'npc/<slug>', 'prop/<slug>', or 'fragment/<slug>', got {self.entity!r}")
        if self.actor == "model" and not self.provenance:
            raise SchemaError("a model-authored event must carry provenance (sidecar)")
        if self.kind == "role.authored" and self.gate is None:
            raise SchemaError("role.authored must carry a gate verdict")


# --------------------------------------------------------------------------
# Rebuilding state from the log -- the property that makes the log the truth
# --------------------------------------------------------------------------

#: Kinds that change entity state. Everything else is a record. Kept explicit
#: so adding a kind cannot silently start mutating state.
FOLDERS = ("entity.seeded", "role.authored", "grudge.changed", "standing.granted", "heal", "fragment.curated")


def fold_events(events) -> NPCEntity:
    """Rebuild an NPC entity from its events alone.

    The reason this exists at all: if the entity cannot be reconstructed from
    the log, the log is a diary and the entity is the truth, which inverts the
    whole authority and hands the model a back door. Fold proves the inversion
    holds. Events must be one entity's, in ``seq`` order."""
    events = list(events)
    if not events:
        raise SchemaError("cannot fold an empty event list")

    entity_id = events[0].entity
    state: NPCEntity | None = None
    grudge = 0.0
    role = Role()

    for ev in events:
        if ev.entity != entity_id:
            raise SchemaError(f"fold expects one entity, got {entity_id!r} then {ev.entity!r}")
        if ev.kind not in FOLDERS:
            continue                                   # a record: no state change
        if ev.kind == "entity.seeded":
            state = NPCEntity(
                id=ev.entity,
                name=_require(ev.data, "name", str),
                world_id=_require(ev.data, "world_id", str),
                motivation=Motivation(
                    aspirations=_require(ev.data, "aspirations", str),
                    favored_items=tuple(ev.data.get("favored_items", ())),
                    home=ev.data.get("home", ""),
                ),
                events=(),
            )
        elif ev.kind in ("role.authored", "heal"):
            role = Role(state=_require(ev.data, "state", str),
                        text=ev.data.get("text", ""))
        elif ev.kind == "grudge.changed":
            grudge = _require(ev.data, "grudge", (int, float))
        elif ev.kind in ("standing.granted", "fragment.curated"):
            role = replace(role, state="restored")

    if state is None:
        raise SchemaError("no entity.seeded event; identity cannot be reconstructed")

    return replace(
        state,
        role=role,
        grudge=Grudge(grudge=float(grudge)),
        events=tuple(e.seq for e in events),
    )
