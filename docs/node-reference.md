# LATTICE node reference

[Documentation](README.md) · [Operator's manual](operators-manual.md) · [Model setup](native-workflows.md)

This reference covers the **16 shipped operations** in LATTICE 0.20.0 and the structural nodes used by subgraphs. A starter is a complete workflow built from operations; a subgraph is a reusable process with its own interface. Neither is an extra model engine.

## Read the graph's types

| Artifact | Carries |
| --- | --- |
| Context | Selected messages, source identities, and context/preservation reports |
| Draft | Frozen reply text, source identity, and any selected spans/findings |
| Text | Plain text for deterministic transformation or assembly |
| Data | JSON-compatible structured values |
| Guidance | Optional writing direction ready for a bounded host output |
| Patches | Proposed replacements tied to a frozen Draft |
| Candidate | Validated revised text together with the original and review information |

**Pre** nodes prepare guidance; **Post** nodes work with completed replies. **Both** operations can be configured in either phase where their artifact types are compatible. An input accepts one connection and an output can feed multiple consumers. There is no implicit conversion between Text, Data, Context, and Draft.

Model calls below are maximum auxiliary calls **per execution of that operation**. A subgraph's total depends on its expanded body and how many instances run. Deterministic operations require no model profile. Phase validation and model bindings may block a full workflow before execution.

## Operation index

| Family | Operation | Phase | Artifact flow | Calls |
| --- | --- | --- | --- | ---: |
| Input | [Scene Context](#scene-context) | Pre | Source → Context | 0 |
| Input | [Reply Snapshot](#reply-snapshot) | Post | Source → Draft | 0 |
| Shaping | [Smart Compactor](#smart-compactor) | Pre | Context → Context | 0–1 |
| Shaping | [Context Join](#context-join) | Pre | Context × 2–16 → Context | 0 |
| Shaping | [Response Plan](#response-plan) | Pre | Context → Guidance | 1 |
| Shaping | [Compose](#compose) | Both | Optional Data/Text sections → Text or Guidance | 0 |
| Shaping | [Reroute](#reroute) | Both | Same artifact in and out | 0 |
| Surface | [Text Rules](#text-rules) | Both; Draft in Post | Text → Text, or Draft → Patches | 0 |
| Surface | [Repair](#repair) | Post | Draft → Patches | 0–1 |
| Derive | [Pattern Scan](#pattern-scan) | Post | Draft → Draft with findings/spans | 0 |
| Derive | [JSON Decode](#json-decode) | Both | Text → Data, or Data → Data | 0 |
| Derive | [Select Fields](#select-fields) | Both | Data → Data | 0 |
| Derive | [Validate Patches](#validate-patches) | Post | Patches → Candidate | 0 |
| Output | [Guidance](#guidance) | Pre | Guidance → Host result | 0 |
| Output | [Review Gate](#review-gate) | Post | Candidate → Candidate requiring review | 0 |
| Output | [Apply Reply](#apply-reply) | Post | Candidate → Host result | 0 |

The shelf also has a **Subgraphs** family for reusable definitions. **Transpose** has no available operations in this release.

## Input

### Scene Context

Read a bounded window of recent conversation and selected character fields available from SillyTavern. It produces a Context artifact with source identifiers and an omission report. It does not perform a fresh lore scan or reproduce the final assembled host prompt.

**Controls:** `recentMessages` (default 12), `includeCharacter` (default true).

**Connect:** Scene Context → Smart Compactor → Response Plan. Multiple Scene Context nodes can feed separate Context Join inputs.

### Reply Snapshot

Freeze the latest completed text-only assistant reply and its chat/message/swipe identity. That identity follows the Draft through proposed changes and is checked again before application.

**Controls:** no operation settings; the source is selected by the supported host reply contract.

**Connect:** Reply Snapshot → Text Rules for deterministic cleanup, or Reply Snapshot → Pattern Scan → Repair for model-assisted repair. An older, unfinished, tool/intermediate, or media reply is not a supported repair target.

## Shaping

### Smart Compactor

Fit a Context artifact to a target while retaining protected material. **Select** removes older flexible messages without a model. **Compress** may request one summary when needed and marks that summary as derived material. Inspection retains the original context and preservation report.

| Control | Meaning | Default |
| --- | --- | --- |
| `targetTokens` | Budget for the resulting context artifact | 1,200 |
| `purpose` | Purpose for context preparation | Empty |
| `method` | `select` or `compress` | `select` |
| `keepRecent` | Recent messages kept verbatim | 2 |
| `pins` | Case-sensitive literal strings whose containing messages stay verbatim | Empty |
| `maxTokens` | Completion cap for a compression request | 1,024 |

![Smart Compactor details with selection method, context budget, recent-message retention, protected pins, and model settings](images/compactor-details.png)

**Connect:** Scene Context → Smart Compactor → Response Plan. Missing protected literals or protected material exceeding the target produce an error; they are not silently removed. Compress uses the **Analysis** role by default.

### Context Join

Combine 2–16 Context inputs in declared slot order. Each required slot has a stable ID and visible label. Identical duplicate message IDs are deduplicated; conflicting material for the same identity fails. A report identifies retained and deduplicated material. Reintroducing material excluded by a compacted branch is reported.

**Controls:** **Inputs**, a JSON array such as:

```json
[
  { "id": "context-1", "label": "Selected context" },
  { "id": "context-2", "label": "Recent context" }
]
```

Changing slot IDs/order changes the operation; label changes are presentation. Its Inputs configuration is not an exposable subgraph parameter.

**Connect:** two Scene Context branches → Context Join → Response Plan. Connect every declared input. Review warnings if one branch brings back context another branch removed.

### Response Plan

Ask a bound model for optional direction, actor intentions, constraints, and possible next beats. The result is Guidance. Suggested events are proposals, not established story facts.

**Controls:** `instructions`, `maxTokens` (default 768), plus **Analysis** role and connection/model overrides. One auxiliary request.

**Connect:** prepared Context → Response Plan → Guidance. Set instructions to preserve the decisions you want the user to make. The completion cap and the downstream guidance budget are separate controls.

### Compose

Build text from named sections or a template. Compose can also produce Guidance directly, making structured writing briefs possible without a model call.

| Control | Meaning |
| --- | --- |
| Mode | `join` concatenates sections; `template` resolves explicit placeholders |
| Output | `text` or `guidance` |
| Template | Text with `{{section:Name}}` and `{{data:/path}}` placeholders |
| Sections | JSON records with unique identifier names and fallback text |
| Separator | Text placed between joined sections; default is a blank line |

Each section creates a named Text input, whose connected value overrides its fallback. The optional **Data** input supplies JSON pointer values to the template. A Compose node with literal sections can be a source with no incoming connection.

```text
Direction: {{data:/direction}}
Constraint: {{data:/constraint}}
Tone: {{data:/tone}}
```

![Compose operation controls showing template mode, Guidance output, template placeholders, sections, and separator](images/compose-details.png)

**Connect:** Select Fields → Compose's Data pin → Guidance. Use `{{{{` to emit a literal `{{`. Missing sections/paths and invalid placeholders fail rather than producing incomplete guidance. These are Compose placeholders, not arbitrary scripting or host macro evaluation.

### Reroute

Carry one artifact unchanged through a compact routing point. Double-click a direct wire to insert a typed Reroute.

**Controls:** its phase and artifact kind must match the connection. It makes no model call and does not transform data.

**Connect:** place between compatible pins to organize a long connection or an output with several consumers. A portal is the separate option for replacing a visible wire with a named reference.

## Surface

### Text Rules

Apply a sequence of literal or regex rules. Text input can use **replace** or **extract** mode and produces Text. Draft input supports **replace** in the Post phase and produces Patches tied to the source reply for later validation and review.

**Controls:** Input (`text`/`draft`), Mode (`replace`/`extract`), Rules JSON, Separator for extracted results. Up to 64 rules; regex execution is bounded in a worker.

```json
[
  {
    "kind": "literal",
    "pattern": "very very",
    "replacement": "very",
    "flags": ""
  }
]
```

Rule kinds are `literal` and `regex`. Literal flags support `i`, `u`; regex flags support `i`, `m`, `s`, `u`, with no duplicate flags. Save Rules commits the validated configuration. Draft transformation proposes patches; it does not edit the chat directly.

![Text Rules details showing Draft replacement mode and an editable literal rule](images/text-rules-details.png)

**Connect:** Reply Snapshot → Text Rules → Validate Patches → Review Gate → Apply Reply. For text extraction, use a Text-producing Compose upstream and another Compose section downstream.

### Repair

Use a model to propose JSON patches for the selected spans in a scanned Draft. **repair** makes up to one request through the **Prose** role. **scan** makes zero repair requests.

**Controls:** `mode`, `strength` (default `light`), `instructions`, `maxTokens` (default 2,048), `protectedLiterals`, and model bindings. Strength is an instruction, not a measured preservation guarantee.

**Connect:** Pattern Scan → Repair → Validate Patches. The requested result is a raw patches JSON object. Malformed or unacceptable output fails without a whole-reply fallback or implicit retry.

## Derive

### Pattern Scan

Locate configured literal patterns, honor exemptions and protected wording, and attach findings/spans to the frozen Draft. Rules are personal editorial preferences.

**Controls:** `mode` (`literal`), `scope` (`whole`, `narration`, `dialogue`), `caseSensitive`, `rules`, `exemptions`, `protectedLiterals`.

**Connect:** Reply Snapshot → Pattern Scan → Repair. Dialogue means paired straight or curly double quotes. Single quotes and apostrophes are ordinary text; unmatched double quotes block narration/dialogue scanning with an issue.

### JSON Decode

**parse** converts raw JSON Text to Data. **check** receives Data and validates it. An optional Schema is entered as raw JSON text; blank means no schema. Markdown fences are not part of a raw JSON payload.

**Controls:** Mode (`parse`/`check`), Schema, **Save Schema**.

![JSON Decode details with parse mode and the schema editor](images/json-decode-details.png)

The supported schema subset includes `type`, `enum`, `const`, `properties`, `required`, boolean `additionalProperties`, `items`, array/string length limits, and numeric `minimum`/`maximum`, plus descriptive metadata. It is not a full JSON Schema implementation; unsupported keywords fail.

**Connect:** a Compose source containing JSON → JSON Decode → Select Fields. Parse errors and schema mismatches block downstream processing.

### Select Fields

Read paths from Data and emit a new Data object with chosen names. Use arrays of string keys and numeric array indices to address nested values.

**Controls:** Fields JSON, **Save Fields**. Up to 128 unique named mappings.

```json
[
  { "name": "direction", "path": ["direction"] },
  { "name": "tone", "path": ["style", "tone"], "required": false, "default": "restrained" }
]
```

Fields are required by default. A missing optional field is omitted unless a default is provided. The node selects structured values; it does not infer missing facts from prose.

![Select Fields details showing editable named field paths](images/select-fields-details.png)

**Connect:** JSON Decode → Select Fields → Compose's Data pin. Match Compose placeholders to the output field names.

### Validate Patches

Validate the proposed changes against the frozen source and build a Candidate. Reject malformed patches, unknown or duplicate span indices, blank replacements, changes outside selected spans, and removed protected wording. Unselected text is restored from the original.

**Controls:** no operation settings.

**Connect:** Text Rules or Repair → Validate Patches → Review Gate. Rejection retains the source reply; no automatic rewrite is attempted.

## Output

### Guidance

Expose a Guidance artifact as the workflow's host result and enforce its token budget.

**Controls:** `budgetTokens` (default 768).

**Connect:** Response Plan or Compose with Guidance output → Guidance. A manual Run records a preview. On an assigned, enabled, armed pre workflow, Send installs the bounded guidance for that generation and clears it afterward.

### Review Gate

Pass a Candidate onward with an explicit review requirement. This is a stage of the graph; the user reviews the root result in Preview.

**Controls:** no operation settings.

**Connect:** Validate Patches → Review Gate → Apply Reply. A candidate passing this node does not mean the user has accepted it.

### Apply Reply

Expose the final Candidate as a root Host result. Running the node prepares the review action; it does not automatically write the reply.

**Controls:** no operation settings. After a full root Run, select **Apply Reply · Host result** in Preview and inspect the original/candidate before **Apply reviewed candidate** or **Reject candidate**.

**Connect:** Review Gate → Apply Reply. Apply checks source freshness and retains the original swipe. A target Run to here and intermediate node output cannot authorize application. See [reply review and persistence limits](native-workflows.md#review-a-reply-repair).

## Subgraph nodes

| Structural node | Purpose | Settings and behavior |
| --- | --- | --- |
| **Subgraph instance** | Use a pinned reusable definition as one node | Interface pins, exposed parameter overrides, role/node binding overrides; call bound comes from the expanded body |
| **Input boundary** | Bring an interface input into the body | Typed output corresponding to an exposed input |
| **Output boundary** | Return a body result through the interface | Typed input corresponding to an exposed output |

Boundary nodes belong to the subgraph interface. A definition's selected controls can become exposed parameters; the wrapper's overrides are edited in **Manage subgraphs**, not by changing the pinned body. Pinned definitions open read-only. **Make local copy** enables private body edits through the instance.

The supplied [Literal cleanup subgraph](../workflows/subgraphs/literal-cleanup.json) exposes Draft → Patches and a Rules parameter. Keep Validate Patches, Review Gate, and Apply Reply in the parent. See [the manual's subgraph walkthrough](operators-manual.md#reuse-a-process-with-subgraphs).
