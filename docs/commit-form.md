# The commit message form

[Documentation](README.md) · [Developer guide](developer-guide.md)

A commit message states authority, not inventory. The diff already lists what
changed; the message exists so a reader can tell what they may now build on, what
they may not, and what has to happen before the next step.

The form is [`.github/commit-template.md`](../.github/commit-template.md). Enable
it once per checkout:

```bash
git config commit.template .github/commit-template.md
```

Git strips lines beginning with `#`, so the guidance disappears and only the
filled sections are recorded.

## Lineage

The form joins two established practices. Naming them matters, because both are
easy to reinvent badly.

- **Spec-Driven Development (SDD)** writes the specification before the work and
  verifies the code against it. The useful vocabulary is its three levels of
  rigor: *spec-first* (a spec exists and leads), *spec-anchored* (the spec is the
  anchor and the code is checked against it), and *spec-as-source* (the code is
  generated from the spec). See Piskala, *Spec-Driven Development: From Code to
  Contract in the Age of AI Coding Assistants* (arXiv:2602.00180), and GitHub's
  Spec Kit, whose loop is `constitution → specify → plan → tasks → implement →
  converge`.
- **Implementation Conformance Statements (ICS)** are how standards bodies record
  what an implementation actually supports. A **PICS proforma** (ISO/IEC 9646-7)
  lists every requirement with a status; the supplier fills in a support column
  and answers one question first: *are all mandatory capabilities implemented?*
  CCSDS A20.1-Y-1, ETSI ETR 212, and the automation profiles (BACnet, IEC 61850)
  all use that shape.

SDD supplies the ordering. ICS supplies the reporting. Neither, as far as this
repository can tell, is applied to commit messages, which is the small thing this
form adds.

## Fields

| Field | Required | Meaning |
| --- | --- | --- |
| Subject | always | `<type>(<scope>): <act> <object>`, imperative, ≤72 characters |
| Before | most commits | The constraint that made the change necessary. Not the fix. |
| Contract | when one applies | Path to the contract, or `none` |
| Contract revision | when a path is given | First 12 characters of `git hash-object <path>` |
| Contract status | when one applies | `new` (written before the work), `amended`, `unchanged`, `none` |
| Tier | always | `exploratory` or `normative` |
| Conformance | when a contract applies | `Y` / `N` / `n.a.` per item group, in ICS notation |
| Deviations | when anything is `N` | Item, what differs, why |
| Contract defects | when delivery found one | `D<n>`, what the contract failed to say, `open` or `amended` |
| Out of scope | optional | Only what a reader would otherwise assume |
| Verification | always | Commands and their result |
| Next | optional | Prerequisites for the next change |

Sections that do not apply are deleted. A form that is filled in reflexively is
worse than no form, because it makes emptiness look deliberate.

## Notation

Follow the PICS proforma so a reader who knows one can read the other.

| Value | Meaning |
| --- | --- |
| `m` | mandatory requirement (contract side) |
| `o` | optional requirement (contract side) |
| `c.i` | conditional on another item (contract side) |
| `n.a.` | requirement does not apply (contract side) |
| `Y` | supported by this implementation |
| `N` | not supported by this implementation |
| `N/A` | answer not required; legal **only** where the contract says `n.a.` |

A `N` is a legitimate answer and never a silent one: it requires a deviation line
with a reason. That is the whole point of the form.

## Worked example: delivery against a contract

Revision hashes in these examples are illustrative; compute your own.

```text
feat(asset-jobs): deliver the contracted job model

Asset generation lives inside one waterfall script, so a stage cannot be
scheduled, prioritised, paused, or replaced on its own. This is the
first implementation of docs/api/asset-job-contract.md, which states
what the port must satisfy before any of that moves.

Contract: docs/api/asset-job-contract.md
Contract revision: 3f9c2e1a77b0
Contract status: new
Tier: exploratory — the contract governs the port; this package is the
sketch checked against it.

Conformance
Y  C1 C2      portable template, explicit dependencies, acyclicity
Y  C4 C5 C6   quantities and attributes, exclusive groups, bounded remote pool
Y  C7 C8 C9   priority order, queue-only pause, per-step cancel
Y  C10        typed suspend/resume refusal, capabilities() published
Y  C11 C12 C13 evict-and-requeue, higher priority only, bounded churn
Y  C14 C15 C16 manifest, typed events, injected transport
N  C3         dependents of a failed step stay pending

Deviations
- C3: dependents are never resolved as skipped or unresolved — failure
  propagation was unspecified until D1

Contract defects
- D1: the contract did not say how failure propagates — amended (C3 added)
- D2: retry semantics are unspecified — open

Out of scope
Durable state, HTTP API, event transport, provider auth, checkpointing.

Verification
- npm run test:asset-jobs: 55 tests pass
- npm run test:ci: 67/67 Node tests pass
- npm run check:types, npm run build: clean

Next
1. Resolve D2 and amend the contract before changing retry behaviour.
2. Port the first waterfall stage; delete its old path as it moves.
```

## Worked example: a change with no contract

The form scales down. Do not invent a contract for a one-line fix.

```text
fix(comfy): correct the GLB depth axis

The depth template tipped the mesh 90 degrees: Create Camera Info orbits
about Y, and the pipeline is Z-up.

Contract: none
Tier: exploratory

Verification
- python3 companion/test_image_to_3d.py: pass
```

## Enforcement

Two layers. The first gives fast feedback; only the second is authoritative once enabled.

**Local hook.** `.githooks/commit-msg` runs `tools/check-commit-message.mjs` on
the message before the commit is recorded:

```bash
npm run hooks:install   # git config core.hooksPath .githooks
```

It checks artifact shape, not intent:

- the subject parses as `type(scope): act` and fits 72 characters;
- `Tier:` is `exploratory` or `normative`;
- `Contract:` is present, and a cited path exists;
- a cited contract has a `Conformance` section with at least one `Y`, `N` or
  `n.a.` line;
- every `N` names its item in `Deviations`;
- a cited contract's `Contract revision` line matches the file's current blob
  hash, so a stale or remembered contract is rejected;
- `Verification` has at least one command.

It skips merge, revert and fixup messages.

**CI.** The same script accepts `--range origin/main..HEAD`, so it can run as a
required check once the form is in use. It is deliberately not wired into
`ci.yml` yet: every commit made before the form existed would fail, which would
break open branches for reasons that have nothing to do with their code.

### What a hook cannot do

A hook can decide whether the message has a shape. It cannot decide whether the
author read the contract, understood it, or told the truth about the `Y` lines.

That is why there is no password. A secret token in the contract proves only
that the agent found the token — and once it is committed to history, every
later agent finds it by grep without reading a word. Any proof a machine can
check is a proof an agent can satisfy mechanically. A token trains extraction;
it does not train reading.

The `Contract revision` line is the honest version of the idea, and it is worth
being precise about what it buys: it is a **freshness proof**, not a
comprehension test. It establishes that the cited bytes existed at commit time
and that the contract has not changed since. That catches the real failure — an
agent answering from an old summary or an invented requirement — without
pretending to test understanding.

Comprehension is enforced where it always was: by tests that fail when a `Y` is
false, and by review that reads the deviations.

### Bypassing

`git commit --no-verify` skips the hook. That is deliberate: a gate with no
escape hatch gets disabled wholesale. When bypassing, say so in the body:

```text
Bypass: rebase of 14 commits; messages predate the form.
```

CI still sees the message, so a bypass cannot hide a message that was never
written.

## Why the tiers are not decoration

An exploratory commit may answer `Contract: none`, because nothing upstream
governs it. That is honest, and it costs the commit any claim to authority. The
first time a structure is meant to be built on, the contract is written before
the work, and the commit that delivers it can then be `normative`.

A contract written after the code is a **description** and must be called one. It
cannot be wrong about the code, so it does not govern it.

## Reviewing a commit message

Ask, in order:

1. Can I tell what was true before, without reading the diff?
2. Is the contract named, and does its status match reality?
3. Is every `N` accompanied by a deviation?
4. Are the verification lines commands I could run?
5. Is anything here a restatement of the diff?

If question 5 is yes, delete that part.