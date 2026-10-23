# The glossary

> **What this document is.** A rule, a directory, and a validator. The rule is
> that **every load-bearing noun in this project has at least two names**: the
> name we use, and the qualifier that says which thing we mean. One name is
> never enough to identify something, because we keep reusing the good ones.
>
> The directory is `glossary/`. **One file per ambiguous term, and the
> filename is the term.** The file system is the whole inventory — there is no
> index file to fall out of step with the entries, which is how
> `library/README.md` already describes its own layout ("scope is visible from
> the path alone").

## Why this exists

The word `ledger` carried four meanings at once before this rule:

| | Sense | Where |
|---|---|---|
| 1 | **Hollis's ledger** — the forge's provenance, the in-world mechanic | `docs/lore.md` |
| 2 | **the prop-store ledger** — append-only tooling timeline | `props/<set>/<item>/ledger.jsonl` |
| 3 | *the ledger is the difference between an artifact and an asset* — a thesis, not a thing | `docs/lore.md` |
| 4 | **the ledger prop** — a shipped asset whose slug is literally `ledger` | `scenes/asset-store/props/hollis/ledger/` |

Nothing was wrong with any of them. They were just one word, and a reader had
to infer which from the filename. Sense 4 is the sharp case: it is a
`detail` in `item.json` and a `<slug>.png` that ships, and it collides with the
provenance file one directory up.

This is dev-pain entry 8 in advance of it happening again: a rule with no code
path. So the rule has a validator.

## The rule

**1. The bare term is never the name.**
Write `hollis ledger` or `prop-store ledger`, not `ledger`. In prose, in
comments, in commit messages, in docs.

**2. Two names minimum.**
A term needs its own name *and* a qualifier that disambiguates it. If you
cannot supply a qualifier, the term is not yet specific enough to use — split it
or file it in `glossary/` first.

**3. Qualified forms are fixed per term.**
Each `glossary/<term>.md` lists the qualifiers in use. `check_glossary.py`
enforces that the bare term does not appear unaccompanied in prose, so the
qualifier set cannot drift into having four spellings.

**3a. Each entry carries a severity.**
`> **Severity:** strict` (the default) gates the term; `report` records the
entry and its senses but keeps the prose scan advisory. The distinction is
honesty, not softness: an entry written today cannot claim that a hundred
sentences written before it were violations, so a new term starts at `report`
and is flipped to `strict` when its prose debt is paid — the way `ledger`
earned its gate by fixing its twenty uses first.

**3b. Bare names resolve in a zone.**
This discipline and DNS's are the same discipline, and the policy answer was
sitting in RFC 1034 §3.1 since 1984: a short name is not *excused*, it is
**resolved against the origin of the enclosing zone**. An entry may therefore
declare zone defaults:

```
> **Bare:** pattern library (scope: docs/scenes/*)
```

Inside the zone, a bare mention of the term means that sense and is clean —
`docs/scenes/*.md` may write "the library" and "the guild" and "a card" and
mean the fiction's things, because the zone says so, in the entry, by a dated
human decision. Outside every declared zone, the old behavior stands: bare is
reported, qualifiers are required. Three rules keep the mechanism honest.
**Closest zone wins** — a specific scope overrides a catch-all `*`, the way a
zone cut overrides the root. **Two zones at equal distance, declaring
different senses, are a defect** — a resolver search-list silently misreading
names is the cautionary tale, and we do not ship ours. **A bare default must
be a listed qualifier** — the zone says what the word means, it must not
invent a fourth spelling to say it.

The consequence for `report`: its debt is now *zoned*, not infinite. Terms
whose collisions live entirely inside safe contexts (library, fully covered)
are documentation-only by declaration rather than by despair; terms whose
residue is a genuine verb problem (`set`) keep an honest radar without
promising a strict flip no one will ever pay. And the prose half of the
doctrine is still human: a sentence that **crosses registers** is a
boundary crossing, boundaries take the qualified spelling — RFC 4007 tags
the interface onto an ambiguous address, and we tag the sentence instead.

**4. A file that ships keeps its slug.**
`scenes/asset-store/props/hollis/ledger/` is an asset and keeps `ledger` as its filename. Code and
prose disambiguate; **we do not rename shipped artefacts to satisfy a prose
rule.** A rename costs a render, a sidecar, and a ledger append, and the
ambiguity is real only in sentences a human reads.

> **Deferred 2026-10-05 for one declared class: asset scaffold.**
> The sixteen rendered items in `scenes/asset-store/props/common-furniture/` are bare common
> nouns (`stool`, `chair`, `table`) — the naming shape rule 1 exists to stop.
> Rule 4 would normally grandfather them, but nothing has been promoted yet
> (`docs/production.md:412` — promotion "Not implemented"), so by the repo's
> own definition no file in them *ships*: they are artifacts, and artifacts
> are regenerable. Decision: treat the current renders as **asset scaffold**,
> delete the folders, and regenerate them under qualified slugs in a single
> **scaffold pass** (`docs/scaffold-pass.md`). The deletion is gated on the
> two agents whose uncommitted work currently sits in those ledgers —
> recording the deferral is cheap, executing it without coordination is not.
> Rule 4 keeps governing `scenes/asset-store/props/hollis/`: that set's names were authored
> against the glossary, and `ledger` stays per `glossary/ledger.md`.
>
> **Resolved 2026-10-06:** the scaffold pass was **superseded** by decision —
> the items were renamed to qualified slugs (`common-stool`) with their
> renders kept, the rename backfilled into every prop-store ledger as a
> dated event, and the deferral closed. What rule 4a actually got settled
> this way: the qualified-birth rule is real, and the rename proved the
> pre-promotion window closes by *decision* — `4c49cb5` took the slugs
> through `git mv` when delete-and-regenerate was still the stated plan, and
> the user accepted it after the fact. Prose, not folders, carries the
> ambiguity now.

**4a. New assets are born with their qualifier.**
Where rule 4 forgives a shipped slug, it excuses nothing forward. A new item
folder is named qualified from its first commit (`common-stool`, not `stool`),
because the path qualifier (`common-furniture/stool`) is visible to tools but
not to prose, and the name is what `find.py` and a sentence carry. This is the
same finding `library/README.md` reached for fragments: scope must be legible
where the thing is *read*, not only where it is stored.

**5. The inventory is the file system.**
No `glossary/README.md` index, no `terms.json`. Adding a file adds a term;
deleting a file removes it. An index would be a second source of truth, and
this repo already has one of those (`docs/compiler-pipeline.md:104-110`, the
`facts` gap).

## Current entries

The inventory is the directory listing:

```
glossary/
  ledger.md      four senses: Hollis's, the prop-store, the thesis, the prop   [strict]
  scaffold.md    the asset kind this repo declared, then kept                 [report]
  beat.md        the authored unit vs the scored unit                         [report]
  guild.md       the actors' guild, and the roster that must not be a ledger  [report]
  set.md         a folder of items vs the boards a scene is played on         [report]
  card.md        the label on a garment bag vs the pattern card in the drawer [report]
  library.md     the fragment store vs the pattern library, its in-world room [report]
  manifest.md    the experiments' arm list vs the shipping form vs the state file [report]
  gpu_resources.md  the 8 GB GPU every tenant waits for, and the gate for it  [report]
```

Two of these (beats, the guild) were queued in the first version of this
document; `set`, `card` and `scaffold` were added after the audit of 2026-10-05
found live two-sense collisions for the first two (`engine/README.md:191`
carries both senses of *set* in one sentence) and a name for a thing that
should never have been a permanent asset for the third. `manifest` was written
before its implementation named files; `gpu_resources` was split out of
`card` on 2026-10-16 — the original `card` entry had bundled the GPU and the
fiction's paperwork, which share only a spelling, and a shared spelling is
not a term. `library` was written
on 2026-10-06 *before* the scene work let the in-world room borrow the bare
word — the naming decision (pattern library in fiction, fragment library in
tooling) is recorded in the entry, which is what entries are for. `report`
means the senses are recorded and the prose scan advises; the flip to
`strict` is a decision to make after each term's existing debt is paid, not a
default.

**Queued, not written:** `scene` — it is now three things, a directory under
`scenes/`, a blocking document under `docs/scenes/`, and a placement JSON
`engine/scene.py` parses; and `pattern`, if a third scene reaches for it bare.
Also `gate`, since 2026-10-06 — it is now four things: the prop (the
half-built gate), the card gate (`tools/gpu_resources.py`, who holds the VRAM), laya's
confidence gate (`GATE_STATES`), and the manifest hard rules
(`docs/manifest-rules.md`). Prose in this repo already compounds each use;
an entry becomes due the day one of them is written bare.
Two more watches opened 2026-10-06 with the system-temple
(`docs/scenes/system-temple.md`): **`source`** is already claimed by tooling
prose (fragments are *sources*; `evidence.source` is a schema field), so the
fiction's wall of answers is called **the finished answers**, never "the
source"; and **`register`** means the kingdom's books here and is simultaneously a
*candidate name* for the guild's roster (`docs/guild.md`) — if the guild
picks it, that queue line becomes an entry the same day, zoned or renamed.

**The source behind rule 3b.** The zone doctrine was excavated, not invented;
the full ancestor record — RFC 1034 §3.1, RFC 1035 §5.1, the resolver
search-list caution, RFC 4007, RFC 6761, and the mapping-check for each row —
is `docs/prior-art.md`, which is itself the tooling shape of the
system-temple. A doctrine whose source is only cited inline is a footnote;
this one has an address.

## What the validator does, and what it does not

`python3 tools/check_glossary.py`

- **Every `glossary/*.md` is well-formed** — has a `term` heading, a
  `## Qualifiers` block, and every listed qualifier appears somewhere in the
  file's prose. Structural failures always fail the run.
- **No two entries claim the same bare term** (implied by the filename, and
  checked anyway, because the failure is silent).
- **The bare term is not used unaccompanied** — it reports each occurrence with
  file and line, so you can go qualify it. Scanned surfaces: `docs/` prose,
  the root `README.md`, code comments and docstrings under `tools/` and
  `engine/`, the prose fields of `scenes/*/props/`, `library/` and `npcs/`
  JSON (always advisory — a brief describes a crate, not a schema), and, via
  `--message-file`, a commit message. Only `strict` entries gate. Bare uses in
  a file whose path resolves to an entry's declared zone (rule 3b) are
  *resolved*, not reported. A full scan above 25 advisories collapses to
  per-term counts; `--verbose` prints the lines.
- **`--staged` is the ratchet**: it checks only lines the pending commit adds.
  A commit may stand on old violations; it may not write new ones. This is what
  makes the rule safe to impose on a tree two other agents are editing.
- **`--strict`** fails a full-scan run on any unqualified use of a `strict`
  term — the end state; the ratchet is the road to it.

It does **not** judge whether a term *should* exist, whether the qualifiers are
good names, or whether the senses listed are the real ones. Only a person
reading the repo can say that, and the validator's job is to make the failure
loud rather than to have an opinion.

> **Known limit, stated because it is the whole difficulty.** A bare `ledger`
> is also a legitimate mention when *listing* the senses — this document does
> it deliberately. The validator therefore exempts the glossary's own files,
> inline code spans (`` `ledger.png` `` is a slug, and rule 4 says the slug
> stays), and path-like tokens (a `/` in the word means it names a location,
> not a thing). Everything else is a report, not a hard failure, until we have
> seen whether it is useful.

**Enforcement lives in tracked hooks.** `.githooks/pre-commit` runs the ratchet
and `.githooks/commit-msg` runs the message check; a clone opts in with
`git config core.hooksPath .githooks` (this repo's clone has it set). A hook in
`.git/hooks/` would be invisible, unversioned, and gone on the next clone —
dev-pain entry 8 again. Installation, gating rules, limits and the
maintenance contract for the hooks are `docs/githooks.md`.
