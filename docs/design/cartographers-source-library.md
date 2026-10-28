# Cartographers: source library

Status: **reference**, used by [the archival register](cartographers-archival-register.md)
Register rule: **chiefly English, Latin for flair.**

## 1. Why a source library

Two reasons, and they are the same reason.

**Content.** The real documents are better than invented ones. "Walter Hait
renders an account of 5 marks of silver for the relief of the land of his father"
is plainer and stranger than any invented formula, and it is the exact sentence
shape a conformance report needs.

**Warrant.** Fragment `evidence` blocks already carry `{kind, source, quote}`. Cite
a Gutenberg line and the fragment becomes traceable to a real text — the Bureau's
Canon Warrant finally has a referent. The custody doctrine we adopted applies to
the lore as much as to the code: a claim with no source is a description of our
own invention.

## 2. On Project Gutenberg

Verified by fetching the text and locating the passage. Line numbers are from the
`pg<id>.txt` file.

| ID | Work | Supplies | Verified passage |
|---|---|---|---|
| [#39227](https://www.gutenberg.org/ebooks/39227) | *A Source Book of Mediæval History*, ed. **Frederic Austin Ogg** (1907) | **The English account formula.** Pipe-roll entries translated, citing Madox, 1140–1230 | l. 9315 "Walter Hait renders an account of 5 marks of silver for the relief of the land of his father"; l. 9324 "Walter Fitz Thomas … **owes** 28s. 4d. for …" |
| [#44021](https://www.gutenberg.org/ebooks/44021) | J. H. Round, *Feudal England* (1895) | Latin *in thesauro* in living context; Pipe Roll citations; the treasury as an archive | l. 5562 `… apud Wintoniam in thesauro … per Librum de Thesauro`; l. 3784 "entered in the Pipe Roll of 1130, our first evidence on the subject" |
| [#43255](https://www.gutenberg.org/ebooks/43255) | F. W. Maitland, *Domesday Book and Beyond* (1897) | Inquest as a procedure; what a survey record proves and cannot prove | — |
| [#68933](https://www.gutenberg.org/ebooks/68933) | J. H. Round, *The Commune of London, and other studies* (1899) | Exchequer studies; the office's own history | — |
| [#71142](https://www.gutenberg.org/ebooks/71142) | *A Translation of Glanville* (c. 1187) | **The treatise voice**, contemporary with the *Dialogus*: procedure stated as rule | ll. 142–144 "… according to which Pleas are determined in the King's Court, the Exchequer, and before the Justices, wheresoever …" |
| [#42707](https://www.gutenberg.org/ebooks/42707) | *A Source Book for Mediæval History*, **Thatcher & McNeal** | A *different* anthology, not another edition of #39227; same translated-extract method | — |
| [#43348](https://www.gutenberg.org/ebooks/43348) | *The Paston Letters*, vol. 1 of 6 (1422–1509) | **The administrative letter**, in English, unadorned | l. 3949 "Right worshipful friends, I recommend me unto you; and I suppose it …" |

The remaining Paston volumes: [#40989](https://www.gutenberg.org/ebooks/40989),
[#41024](https://www.gutenberg.org/ebooks/41024),
[#41081](https://www.gutenberg.org/ebooks/41081),
[#42239](https://www.gutenberg.org/ebooks/42239),
[#42240](https://www.gutenberg.org/ebooks/42240).

## 3. Not on Gutenberg

The most important source is absent, which is worth stating plainly.

| Work | Where | Why it matters |
|---|---|---|
| **Henderson, *Select Historical Documents of the Middle Ages* (1892)** — contains the *Dialogus de Scaccario* in English | [Wikisource](https://en.wikisource.org/wiki/Select_Historical_Documents_of_the_Middle_Ages/Book_I/Dialogue_concerning_the_Exchequer), [archive.org (1896 ed.)](https://archive.org/details/selecthistorical1896hend), [Google scan](https://archive.org/details/selecthistorica01hendgoog) | The treasurer's own question-and-answer manual. The closest structural model for `AGENTS.md` and the best single source for the Bureau's voice. |
| Hubert Hall, *Studies in English Official Historical Documents* (1908) | [archive.org](https://archive.org/details/studiesinenglish00halluoft) | A diplomatic manual for English records: classes of document and their forms. |
| Thomas Madox, *History and Antiquities of the Exchequer* (1711; 1769 ed.) | archive.org | The source #39227 translates. |
| Hilary Jenkinson, *A Manual of Archive Administration* (1922) | [archive.org](https://archive.org/details/manualofarchivea00jenkuoft) | Continuous custody; the doctrine behind "a document written after the code is a description". |
| T. F. Tout, *Chapters in the Administrative History of Mediaeval England* | archive.org | The department as a working institution. |
| Mabillon, *De re diplomatica* (1681) | archive.org | Diplomatics itself; Latin throughout. |

## 4. Which source for which fragment

| Fragment function | Draw on | Register |
|---|---|---|
| Warrants, enrolments, registers, ledgers | #39227 (the account), Round #44021 (`in thesauro`) | Formulary: the operative formula, then what it effects |
| Offices, factions, appointments | Glanville #71142, Henderson's *Dialogus* | Treatise: what the office decides, on what authority |
| Correspondence, dispatches, disputes | Paston #43348 | Letter: plain English, no ornament |
| Surveys, extents, measurements | #43255 (and Maitland's method) | Record: enumerated findings, each with its witness |

## 5. Register, with the sources behind it

**Chiefly English** — because the English translations are already the right
register. From the verified text:

> "Walter Hait **renders an account of** 5 marks of silver for the relief of the
> land of his father." (#39227, l. 9315)

> "Walter Fitz Thomas, of Newington, **owes** 28s. 4d. for having a fourth part of
> one knight's fee which had been seized into the hand of the king for default of
> relief." (#39227, l. 9324)

> "… according to which Pleas are determined in the King's Court, **the
> Exchequer**, and before the Justices, wheresoever …" (#71142, ll. 142–144)

Three plain sentences, no decoration, each doing exactly one job: opens an
account, states a residue, names a jurisdiction. That is the target.

**Latin for flair** — the operative words, kept untranslated where they are doing
work rather than decorating: `reddit compotum de`, `In thesauro liberavit`,
`Et debet`, `Et quietus est`, `inspeximus`, `in capite`. Short, and glossed once in
English on first use.

**Wrong, and what to replace it with:**

| Not this | This |
|---|---|
| "a heavy circular brass medallion stamped with an indelible iron-gall seal" | "a sealed instrument on one membrane; the seal is the corroboratio, and an instrument re-sealed is not the same instrument" |
| "cast yellow brass, cold-stamped iron-gall wax, linen-rag vellum ribbon" | "parchment, iron-gall ink, yellow wax in a skippet" |
| "the Bureau detects the authorial refinement" | "the Bureau enrolls the refinement and the enrolment is the record" |

## 6. Citing in a fragment

The schema already supports it; use it for real.

```json
"evidence": {
  "kind": "directed",
  "source": "gutenberg/39227 l.9315 (Ogg 1907, after Madox 1769)",
  "quote": "Walter Hait renders an account of 5 marks of silver for the relief of the land of his father."
}
```

Rules:

1. **Cite what you checked.** Ebook id and line, so the next reader can verify in
   one fetch.
2. **Quote the formula, not the flavour.** A citation that supports atmosphere but
   not the claim is decoration with a footnote.
3. **One source per claim.** If two are needed, the claim is two claims.
4. **Do not paraphrase into the quote field.** Verbatim, or mark the elision.

## 7. Rights

Every Gutenberg work above is public domain in the United States; the translations
(Ogg 1907, Thatcher & McNeal 1905, Round 1895, Maitland 1897, Henderson 1892) are likewise
public domain. The Project Gutenberg **trademark and licence** apply to
redistributing a complete text, not to short quotation with attribution — which is
all a fragment does. Do not paste an entire ebook into `library/`.

## 8. Gaps worth filling

- **The Domesday survey is not on Gutenberg.** Gutenberg's "Domesday Book"
  (#35991) is a poetry collection by Edgar Lee Masters that took the title. It
  is a good reminder that an ebook id is only a pointer: check the title page
  before citing. Maitland (#43255) quotes and discusses the survey, which is
  sufficient for our purpose; the text itself is on archive.org and
  [Open Domesday](https://opendomesday.org/).
- **A pipe roll in the original Latin**, not a translated extract, for exact
  formula spelling. The *Rotuli* editions are on archive.org.
- **The *Dialogus* on Gutenberg** does not exist; if a transcription is added
  upstream, replace the Wikisource citation.
- **Chancery enrolment formulas** (`per breve de privato sigillo`, `Teste me ipso
  apud …`) are well attested but I have not located a single citable public-domain
  list. Hall (1908) is the likeliest place, and it is not on Gutenberg.
- **Jenkinson in full** would let the custody rule cite its own origin rather than
  summarise it.