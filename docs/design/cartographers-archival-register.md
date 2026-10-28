# Cartographers: the archival register

Status: **proposal, not applied**
Related: [commit messages](../commit-form.md), [map geometry spec](map-geometry-spec.md)

## 1. Diagnosis

The current Cartographers fragments are written in an **antiquarian descriptive**
register: they inventory materials and appearance in period-flavoured nouns.

> "a heavy circular brass medallion stamped with an indelible iron-gall seal and
> ribbon of parchment"
>
> "cast yellow brass, cold-stamped iron-gall wax, linen-rag vellum ribbon"

That is the voice of a museum label or an item description. It is not the voice
any archival or legal tradition actually used, and the mismatch is what reads as
faux-old-timey.

This is not an isolated slip. **Thirteen of the fourteen** Cartographers
fragments fill `facts.material` with a materials inventory; the pattern is the
faction's default, including in the two fragments added most recently for the
tier vocabulary. Whatever replaces it has to be a rule, not a one-off edit.

The fix is not a vocabulary change. It is a **genre change**. Two registers did
the real work, and both are dry:

- **The formulary** — the words written *in* the record. Short, formulaic,
  repetitive by design. Repetition is what makes a record verifiable.
- **The treatise** — the academic study of such records: diplomatics and archival
  science. Definitional and procedural, never decorative.

Neither decorates. Both are more evocative than the invented version precisely
because they are real.

## 2. Which archive

The request was for a very old English archive with its own local standards whose
language outlived it. Three candidates, all real, and they are complementary
rather than competing.

### The Exchequer — the formulary

The Pipe Rolls run from 1130, pre-national (Angevin), departmental, and invented
their own notation for exactly the problem this repository has: *how does a
central office know what a distant officer owes, and record that he has paid?*

An account on a pipe roll is built from a small set of formulas, attested across
independent nineteenth-century transcriptions:

| Formula | Meaning |
|---|---|
| `reddit compotum de ...` | renders account of ... |
| `In thesauro liberavit` | paid into the treasury |
| `Et debet ...` | and he owes ... |
| `In perdonis ... per breve Regis` | in pardons ... by the king's writ |
| `Et quietus est` | and he is quit |

The discharge vocabulary survived into modern law and audit: *quietus* gives
English "quit", "acquittance", "discharge", "to be quit of". A local medieval
office standard became ordinary legal English.

There is also an in-period technical manual about it: the **Dialogus de
Scaccario** (c. 1179), by Richard FitzNeal, Treasurer, written as a
**question-and-answer exposition** for a newcomer. That is the authentic in-world
genre for a document like `AGENTS.md`, which already asks its reader four
questions in order.

### Chancery — the warrant and the enrolment

From the early thirteenth century — the patent rolls in an almost unbroken
series from 1201 — the Chancery enrolled instruments on rolls. The **warrant**
authorised; the **enrolment** was the authoritative record. Two consequences worth borrowing:

- An instrument without a warrant behind it is not authoritative, however
  formally it is worded. This is already the repository's rule: canon without a
  warrant is cargo cult.
- The enrolled copy is the one that governs. Later practice based enrolments on
  the authorising warrant's text, which is why enrolled versions drift when the
  clerk worked from a draft.

### The Public Record Office — the bridge to global standards

Sir Hilary Jenkinson's *A Manual of Archive Administration* (1922) codified the
English custodial tradition into a doctrine that shaped international archival
description: a record's authenticity and impartiality rest on **unbroken
custody**, not on its content. Custody broken cannot be repaired by re-wording.

That is the same claim as the commit rules, stated in archival terms: a document
written after the code is a description, because the custody of the claim is
wrong.

## 3. The academic field

**Diplomatics** is the discipline that studies the form of authoritative
documents. Founded by Dom Jean Mabillon in *De re diplomatica* (1681), written in
reply to Daniel van Papenbroeck's wholesale suspicion of monastic charters — the
first systematic attempt to distinguish genuine from forged by structure alone.

Its vocabulary is the register we want:

- An instrument has **three parts**: the *protocol* (initial), the *text*, and the
  *eschatocol* (final protocol).
- The **corroboratio** opens the eschatocol: the clause naming seal and
  attesters. It is followed by the *datum*.
- The text runs *arenga* (preamble), *narratio* (statement of fact), *dispositio*
  (the operative clause), *sanctio* (penalty for breach).
- The initial protocol carries *invocatio*, *intitulatio* (who speaks),
  *inscriptio* (to whom), *salutatio*.

Luciana Duranti's *Diplomatics: New Uses for an Old Science* (Archivaria) carries
the discipline into digital records and gives the two terms that matter for
conformance work: **reliability** (the record's trustworthiness as to the facts at
the time of creation) and **authenticity** (that it is what it purports to be, and
has not been corrupted since).

## 4. The mapping

The Pipe Roll is a conformance report. Its anatomy is the ICS proforma's, five
centuries earlier.

| Commit form field | Pipe-roll / diplomatic term | Why it matches |
|---|---|---|
| Subject | the marginal heading of the account | states whose account and for what |
| Before | the occasion of the charge | why an account is being rendered at all |
| Contract | the *compotus* being answered | the enumerated charge the account is measured against |
| Contract revision | *inspeximus* — "we have inspected" | proof the current instrument was read, not recalled |
| Contract status | newly enrolled / amended by writ / carried forward | whether the charge is new, changed, or standing |
| Tier | whether the membrane records a charge or a mere memorandum | only an enrolled charge carries authority |
| Conformance `Y` | `In thesauro liberavit` | the obligation is discharged |
| Conformance `N` | `Et debet` | the residue, which must be accounted for |
| Conformance `n.a.` | *non applicatur* | the item never applied to this account |
| Deviations + reason | `In perdonis ... per breve Regis` | differs, with the authority that permits it |
| Contract defects `D<n>` | a charge entered in error, remedied by *allocate* | the roll is amended, not the payment |
| Verification | *visus compoti*, the view of account | the audit that produced the figure |
| Next | the *debet* carried to the next roll | the opening entry of the following account |

Two of these are worth stating plainly, because they are the contract's most
unusual rules and the Exchequer already had them:

1. **A contract defect is fixed by amending the charge.** If a sheriff was charged
   for something never owed, the remedy was an allowance against the charge —
   amending the roll — not a false entry in the payment. Patching the code and
   leaving the contract wrong is the error the whole form exists to prevent.
2. **`inspeximus` is the "cite, do not restate" rule.** A confirmation charter
   quoted and confirmed the earlier grant rather than re-describing it, so the
   later authority was traceable to the earlier text. Re-stating a contract in a
   commit's own words severs that chain.

## 5. Two registers, by fragment type

Not every fragment should read as a formulary. The rule is by function:

| Fragment function | Register | Rule |
|---|---|---|
| Instruments, registers, seals, ledgers, warrants | **Formulary** | give the operative formula, the parts, and the formula's effect. No material inventory. |
| Places, halls, furniture, tools | **Diplomatic description** | describe what each part *does in the procedure*, using the real part-names. Materials only where they affect verification (wax, ink, membrane — not decoration). |
| People, factions | **Treatise** | definitional and procedural. State the office and what it decides, not its costume. |

What to drop outright: "indelible iron-gall seal and ribbon of parchment",
"cast yellow brass, cold-stamped iron-gall wax", "heavy circular brass medallion".
These are inventory. They carry no information about how anything is verified.

## 6. Writing rules

1. **Prefer the attested formula to an invented one.** `Et quietus est` is
   shorter, stranger, and truer than any paraphrase.
2. **Name the part, not the appearance.** `corroboratio` and `datum` tell a reader
   where authority sits; "stamped seal" does not.
3. **Describe the failure mode.** A register fragment should say what goes wrong
   when it is misused, because that is what an instrument is for.
4. **Keep the `note` field for the engineering rule**, in plain language, as now.
   The diegetic register belongs in `detail` and `facts`.
5. **Do not translate the Latin away.** A reader who does not know `quietus` still
   understands it from context; a reader who does gets the whole tradition at once.

## 7. Worked example

`canon-warrant.json`, the closest-existing fragment to the contract.

**Before** — inventory register:

> detail: "a heavy circular brass medallion stamped with an indelible iron-gall
> seal and ribbon of parchment, bearing the engraved seal of the Bureau ..."
>
> facts.material: "cast yellow brass, cold-stamped iron-gall wax, linen-rag vellum
> ribbon"

**After** — formulary plus diplomatic description:

> detail: "a sealed instrument on one membrane in the Bureau's fixed hand: a
> narratio naming the thing observed and the span of the observation, a dispositio
> conferring standing, a corroboratio naming the seal and the attesting officers,
> and a datum. Sealed once. An instrument re-sealed is not the same instrument."
>
> facts.extent: "one membrane, folded three times, endorsed on the dorse"
>
> facts.material: "parchment, iron-gall ink, yellow wax in a skippet"
>
> facts.state: "sealed and dated; the dorse carries the enrolment mark of the
> Bureau's register"

The engineering rule survives in `note`, unchanged in meaning: a warrant that
confers standing is written before the standing exists; written after, it
describes, and description carries no authority.

## 8. What this changes

- **`canon-warrant`, `epistemic-survey`, `field-sketch`, `engraved-plate`** are
  procedural and should move to the formulary register.
- **`the-living-atlas`, `atlas-locus-frame`, `atlas-witness-plate`,
  `atlas-scale-register`** are instruments or places: keep the physical facts that
  bear on verification, drop the rest.
- **`unwritten-borders`, `cross-origin-clearance`, `glyph-surveyor-rose`** are
  jurisdictional: use the treatise register — what the office decides, and on what
  authority.
- **Fragment schema is untouched.** This is a prose change within `detail`,
  `facts`, and `note`.

## 9. Open questions

1. **Latin, English, or both?** `Et quietus est` in a card is evocative but opaque.
   A workable middle: Latin formula, English gloss in the same sentence.
2. **Does the Bureau have a Dialogue?** The *Dialogus* genre (question-and-answer
   for a newcomer) fits the four commit questions almost exactly. It may be a
   better home for the contract's rules than a new fragment.
3. **Should the commit form itself appear in-world?** A conformance table is
   already a pipe roll. Reproducing it as the Bureau's standard form, rather than
   describing it, may be the strongest option — but it makes the card a document
   rather than a description of one.