# Manifest rules — the formalization

> **What this document is.** The shipping manifest turned into a rule set:
> exactly which facts gate what, which side of the split laya is allowed to
> stand on, what a verdict must make observable, and what may never be asked
> of a 421 M classifier. Formalized 2026-10-06 at the user's request
> (*"formalize the shipping manifest as rules which laya can gate on"*).
> **Status, same night: the contract was confirmed and the deterministic
> half was built** — `tools/manifest_rules.py` (R1–R4, the budget-capped
> renderers, the seam-shaped questions, the un-mergeable `compose`), pinned
> by `tools/test_manifest_rules.py`; the 40-word cap earned its keep by
> refusing a real `crate-stack` rendering, and the authored strings were
> trimmed to fit it — the cap functioning, not the data being precious.
> `engine/probe_manifest_gate.py` has **run once (2026-10-06, n=1, cuda)**
> and both cases it implemented agreed with the contract: `condition_shippable`
> *moves* with the rendered fact (sound `noul` 0.2302/conf 0.7698 → rotten
> 0.0750/conf 0.9250), and an over-budget state arrives truncated and reads
> `unevaluated`, never a silent pass. The load-bearing nuance: the clerk's
> eye reads direction but never says *yes* outright — even the sound crate
> answers 0.23 "no". So an absolute threshold on laya's answers would refuse
> every consignment; advisory answers must be read as **movement between
> contrast pairs, not verdicts** — which is exactly what "advisory never
> blocks" was protecting, and the probe now shows it is arithmetic, not
> only policy. Cases 2 (budget at N) and 4 (threshold sweep) remain
> written-not-implemented. Every measured number cited here was checked
> against `engine/README.md` and laya's own source, not against memory.

---

## The two-gate principle

The manifest already chose its validator's creed, in its own words:
*"Refusing to use a bad number is the gate; the model is not."* Formalized,
the rules split by **kind of fact**, and the split is load-bearing:

| Gate | Evaluator | Verdicts | Can it block an action? |
|---|---|---|---|
| **Hard rules** | deterministic code (stdlib, arithmetic, comparisons) | `passed` / `blocked` / `unevaluated` | **yes** — this is the only blocking kind |
| **Advisory rules** | laya, through the HTTP seam, through its own confidence gate | `advises` / `abstained` / `unevaluated` | **no — never** |

Laya is a ModernBERT-scale classifier of *English conditionals*: the probes
measured its sensitivity to state and its confidence behavior
(`engine/README.md`, the measurement table), and measured **nothing about its
arithmetic** — which is why `9 × 4 ≤ 30` may never be its job. The design
doc's own commitment completes the argument: *he is unreliable about her, and
never about the numbers* (`docs/design.md` commitment 2). The rule layer *is*
the numbers; laya is a reliable witness about unreliable things — condition,
packing, the difference between a frown and a nod. Blocking stays with
arithmetic; narration goes to the model; and the charter's line
(**"no model gates completion, rewards, or saves"**) is exactly the line
that keeps `advises` from ever hardening into `blocked`.

## The budget, measured — and what it dictates

Three numbers, all from `engine/README.md`:

- state budget: **18 units ≈ 408 words ≈ 450 state tokens** (`probe_budget.py`,
  bisected, README:73); past ~426 words the model starts dropping state
  tokens;
- the truncation hazard: with the deciding sentence placed *past* the cut,
  laya answered **0.915, confidently, from a state that no longer contained
  it** (README:105-119);
- latency: **~100 ms** at budget — a decision is an event, not a frame
  (README:72,79).

They yield three rendering rules, which the formalization borrows from
`GATE_STATES`' contract in shape while keeping its own names — a gate is a
policy, and *"a policy whose application cannot be observed is not one"*
(laya's own docstring):

1. **Deciding facts first.** Rendered manifest state places numbers and
   marks ahead of scenery prose, because truncation cuts the tail and the
   0.915 answer would read as success.
2. **One decision, one state.** A state carries *the manifests this decision
   consumes*, never *the scene's whole inventory*: at ≤ 40 words per manifest
   (rule 3) plus a ≤ 25-word header, a six-item lift renders in ~265 words —
   inside budget with ~35% margin; "ask about the room" is not a decision.
3. **Truncation is refusal.** If the reply's `usage.truncated` or
   `usage.truncated_questions` is set, the advisory verdict for that answer
   is **`unevaluated`** — not `abstained`, and never a silent pass. (This is
   QWEN.md invariant 7, made structural.)

## Hard rules — deterministic, blocking

The notation is a rule record; `manifest.*` reads the item's accepted fields
only (`tools/prop_store.py`'s `validate_manifest` produces the
`accepted`/`rejected` split, and a rule consuming a **rejected** field is
`unevaluated` *for that field*, with the rejection reason carried — a
missing fact asks a question, it does not refuse a scene). Actor facts
(`lift_capacity_kg`, `hands`) are engine state and **never defaulted**: their
absence is `unevaluated`, not a zero.

| Rule | Predicate | Fields consumed | Blocking means, in the fiction |
|---|---|---|---|
| **R1 CARRY** | `Σ quantity × weight_kg ≤ lift_capacity_kg` over the items of one lift | `weight_kg`, `quantity` + actor | the lift sags; the crew is called, or the plan changes |
| **R2 STACK-ON** | nothing rests above a thing with `fragile = true` or mark `DO NOT TOPPLE` | `fragile`, `handling_marks` | the stack is refused at the counter, politely, in writing |
| **R3 ORIENT** | placements of things marked `THIS SIDE UP` stay upright: yaw-only, no pitch | `handling_marks` + placement | the crate goes on its side and the scene says so |
| **R4 FIT** | `manifest.dimensions` ≤ slot on each axis, compared as stored — **never clamped toward fitting** | `dimensions` + slot | the doorway; the shelf; the hold |
| **R5 FORM** | the entry gate that exists today: `validate_manifest` per-field accept/reject | all | already shipped; the other four consume only its `accepted` |
| **R6 SHIP** | *(specified 2026-10-06, not built)* `ship(item)` is blocked unless `dimensions`, `weight_kg` and `quantity` are all **accepted** -- the user's rule, *"it should be impossible to ship an asset without a crate, and a crate is the bounding box of each item"* -- plus the **standard fare**: a per-fare capacity band, TBD and parameterized, and *bands rather than a boolean* (see the note under this table) | `dimensions`, `weight_kg`, `quantity` + fare table | the counter refuses the consignment, politely, by name: no box, no crate, no ship |

Why the crate clause is the whole of R6's first half: a boxless item is not
merely unpriced, it is **unevaluable** -- every other hard rule consumes
`dimensions` (R1's density lives through it, R4's slot, R2's load), so
"ship it" without a crate means shipping something no rule can read. The
rule turns that silence into a verdict. And the detection it needs is the
gate's remaining gap: `no-manifest` / `no-dimensions` / `field-rejected`
must become machine-readable absence codes for R6 to block by name rather
than abstain in prose (the sweep question is `docs/transport-blockers.md`,
Blocker 4).

R6's second half is where a candidate ancestor earns its place: the shape
of the **standard fares** -- burden divided into bands against one capacity
number, each band changing what the crew can *do*, not merely whether the
lift is possible -- is GURPS's encumbrance form, filed uncited in
`docs/prior-art.md`'s candidates section. The repo takes the *shape*: a
lift that is legal and miserable is diegesis a boolean cannot give, and the
counter's own arithmetic already knows burden has degrees -- R1 answers
"can this pair of hands do it" once, while the fare asks "what will it cost
the crew to keep doing it," which is a different, slower, more interesting
question. The numbers stay ours, calibrated and labeled hypothesized like
the density band, because an uncited ancestor may lend a form and never a
figure.
>
> **Correction by excavation, 2026-10-06:** the GURPS form was a *shape*
> with no source; a bounded try at the real statutes landed cited grounding
> instead (Magna Carta cl. 35; 1495 "stricken" vs the 1835 ban on heaped
> measure; the 1688 lost original and the 1695/1706 copy-chains; the
> alnager's seal and the forfeit; and the **1353 repeal of the single
> cloth width as unworkable** -- a statute about cloth, whose history the
> fare argument *analogy-maps* onto burden: one-size rules break when
> goods diversify, so bands, not booleans. The analogy is ours; the
> dates and the repeal are the statute's, cited in `docs/prior-art.md`).
> The room that fires R6 has a name and its own site doc: **the customs
> house**, `docs/scenes/customs-house.md`.

Two of the unit-traps the spec warned about are closed by construction, not
by care: **`weight_kg` is per unit** (R1 multiplies by `quantity`; the
`crate-stack` manifest is the case the spec calls out — its unit *is* the
stack, `quantity: 1`, and that reading was authored, not inferred), and
**`bool` is not an `int`** (inherited from the validator; a `True` never
weighs 1 kg in R1).

## Advisory rules — laya's, and few

The seam's question format is the probes' format — `noul` (yes/no from the
state) and `score` (ordered criteria), per `probe_budget.py`/`probe_latency.py`;
through `laya.decide`'s schema subset, which is exactly **enum, boolean and
bounded integer** (`structured.py` module docstring — free strings are
rejected naming the path, so the schema below is deliberately all three of
the allowed kinds):

```json
{
  "type": "object",
  "properties": {
    "condition_shippable": { "type": "boolean" },
    "packing_coherent":    { "type": "boolean" },
    "marks_clear":         { "enum": ["unlisted", "partial", "explicit"] }
  }
}
```

* *"Does this condition describe a thing that survives the journey intact?"*
  — the clerk's eye over `condition`, a field of prose the rules refuse to
  parse arithmetically (`"sound, reused timber, stencil worn"` is exactly the
  sentence a rule cannot read and a judge can).
* *"Do packing and material agree?"* — over `packing` × `material`.
* *"Are the handling marks legible to a stranger?"* — over `handling_marks`.

Each is **`advises` or `abstained`** — `decide(min_confidence = t)` projects
a low-confidence field to `None` (`structured.py`, `_project`), which is the
abstention this layer records and the scene narrates; a threshold value is
**hypothesized until `fit_temperatures`-style calibration is run on this
question set**, and `unevaluated` belongs to the truncation rule alone.
`marks_clear` answers, notably, never override R2: a frown about ambiguous
marks narrates next to the blocked stack. **Directing these questions is
this document's act, not a measurement** — `probe_manifest_gate.py` (below)
is what would make them `observed`.

## Verdict composition

```json
{ "action": "lift/crate-stack by clerk-1",
  "hard":     { "R1": "passed", "R2": "blocked: DO NOT TOPPLE + load above",
                "R3": "unevaluated: no slot orientation" },
  "advisory": { "condition_shippable": "advises(true)",
                "marks_clear": "abstained(gate: abstained)" },
  "outcome":  "blocked" }
```

`outcome = blocked` iff some hard rule blocks; advisory kinds never appear
in that clause's inputs. `unevaluated` on either side means the same thing
in both registers: **a human question, logged with its reason** — never a
silent pass, never a silent refusal. The record is the artifact: exactly
`GATE_STATES`' discipline (*"an ungated call returns exactly the payload it
returned before, and the presence of the field … is what tells a caller the
gate ran"*), reproduced at the rule layer.

## The clerk — where the culture lands

`probe_budget.py` has been saying it since it was written: *"a sealed crate
waits on the counter of the customs house while the clerk checks the manifest
against the bill of lading."* The formalization's only creative act is
naming what the probe already staged: **the clerk is the gate**. The
manifest on the counter is the state; the questions are the clerk's eye;
R1's refusal is the polite no; the abstentions are the pause before the
frown. What the clerk may never do is write the hollis ledger — promotion
stays the human's threshold (`docs/transport-blockers.md` Blocker 3), and the
asset-store site doc's rule holds at the counter: report, don't record.

## Probe *(run 2026-10-06: cases 1 and 3 observed, n=1; 2 and 4 remain)*

`engine/probe_manifest_gate.py`, following the probe tradition — each case
answering a question this document could previously only assert. **Two ran:**

- **Reading vs priors — observed, and it passes.** Sound timber vs rotten
  planks on one crate: the answer *moves* with the rendered fact
  (`noul` 0.2302 → 0.0750, confidence 0.7698 → 0.9250). The advisory rule
  is not a rumor.
- **Truncation guard — observed, and it holds.** Deliberate overrun; the
  answer arrived `truncated` and read `unevaluated`, never a silent pass.
- **The calibration finding — the one that changes the design.** Even the
  sound crate answered 0.23 *no* at 77% confidence: on absolute thresholds
  laya would refuse every consignment, sound or rotten. The advisory layer
  therefore consumes **contrast pairs** (does the answer move when the
  fact changes?) and never a raw value — tonight's contract held for the
  reason the two-gate split predicted, now measured rather than asserted.
  The loader's own startup warning agrees from the machine's side: *this
  checkpoint ships invalid temperatures… treat confidence from the affected
  entries as uncalibrated* — those confidence numbers are not evidence of
  anything except direction against a contrast.
- Cases 2 (budget at N — six-manifest lift) and 4 (confidence sweep) are
  **still open**: the probe file implements 1 and 3 and says so in its own
  status block. A future run with the card reserved adds them; the
  reservation dance itself is now documented in `docs/scene-ci.md`.

## Do not

- Ask laya arithmetic, form-completeness (R5 owns that), or promotion
  (a human owns that). All three are the *"model gates completion"* drift.
- Promote an advisory pass into an action permission, or read an
  `unevaluated` as either safety or danger — it is a question with an owner.
- Default a missing actor fact into a hard rule. `lift_capacity_kg` absent
  makes R1 `unevaluated`, *because the fiction's question is then "who could
  carry this?"* — and only the fiction may answer.
