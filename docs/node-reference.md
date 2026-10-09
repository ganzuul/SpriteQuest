# LATTICE node reference

[Documentation](README.md) · [Operator's manual](operators-manual.md) · [Model setup](native-workflows.md)

This reference covers the **25 operations** in this LATTICE 0.26.0 development branch and the structural nodes used by subgraphs. A starter is a complete workflow built from operations; a subgraph is a reusable process with its own interface. Neither is an extra model engine.

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

**Before reply (Pre)** graphs can prepare guidance before a normal Send. **After reply (Post)** graphs can inspect and propose changes to a completed reply through a manual Run and explicit review. **Both** operations can be configured in either phase where their artifact types are compatible; a graph phase does not turn ordinary Text into a reply Draft. Reply sources and host outputs enforce their own phase and context requirements. An input accepts one connection and an output can feed multiple consumers. There is no implicit conversion between Text, Data, Context, and Draft.

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
| Transpose | [Style Transfer](#style-transfer) | Both; Draft in Post | Text/Draft + Text/Data reference; optional Context → Text/Patches | 0–1 |
| Transpose | [Format Transfer](#format-transfer) | Both; Draft in Post | Text/Draft + Text/Data reference; optional Context → Text/Patches | 0–1 |
| Transpose | [Terminology Map](#terminology-map) | Both; Draft in Post | Text/Draft + Data glossary → Text/Patches | 0 |
| Introspection | [Reflect](#reflect) | Both | Context + optional State/Episodes Data → Reflection Data | 1 |
| Introspection | [Internalize](#internalize) | Both | State + Events Data → State proposal Data | 1 |
| Introspection | [Express](#express) | Both | Reflection Data + optional evidence → Guidance or Text | 0–1 |
| Introspection | [Context](#context) | Both | Context inputs → Context | 0–1 |
| Introspection | [Memory](#memory) | Both; Commit Post | Scoped source → Data; Proposal Data → Host result | 0 |
| Introspection | [State](#state) | Both | State + optional Events Data → Snapshot/proposal Data | 0 |
| Derive | [Pattern Scan](#pattern-scan) | Post | Draft → Draft with findings/spans | 0 |
| Derive | [JSON Decode](#json-decode) | Both | Text → Data, or Data → Data | 0 |
| Derive | [Select Fields](#select-fields) | Both | Data → Data | 0 |
| Derive | [Validate Patches](#validate-patches) | Post | Patches → Candidate | 0 |
| Output | [Guidance](#guidance) | Pre | Guidance → Host result | 0 |
| Output | [Review Gate](#review-gate) | Post | Candidate → Candidate requiring review | 0 |
| Output | [Apply Reply](#apply-reply) | Post | Candidate → Host result | 0 |

Open a shelf family to choose a node directly. Each operation appears once; choose modes and artifact kinds in **Details**. The **Subgraphs** family keeps separate entries for saved revisions and offers **Manage subgraphs…**. **Transpose** contains Style Transfer, Format Transfer and Terminology Map; see [the reference library guide](lattice-reference-library.md). **Introspection** contains six operations with eighteen modes selected in Details; their named pins and controls change with the selected mode.

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

**Controls:** **Artifact kind** in Details selects Context, Draft, Patches, Candidate, Guidance, Text or Data. New shelf nodes default to Text; inserting one on a wire adopts the connection's kind. Its phase and kind must match the connection. A kind edit that would invalidate an existing wire is rejected without changing the node or its wires. It makes no model call and does not transform data.

**Connect:** place between compatible pins to organize a long connection or an output with several consumers. A portal is the separate option for replacing a visible wire with a named reference.

## Surface

### Text Rules

Apply a sequence of literal or regex rules. Text input can use **replace** or **extract** mode and produces Text. Draft input supports **replace** in the Post phase and produces Patches tied to the source reply for later validation and review.

**Controls:** Input (`text`/`draft`), Mode (`replace`/`extract`), Rules JSON, Separator for extracted results. Up to 64 rules; regex execution is bounded in a worker.

Draft mode also exposes Scope (`authorized` by default, or explicit `whole`/`narration`/`dialogue`) and Protected literals. Raw snapshots need an explicit construction scope; existing permissions, including an empty span set, can only narrow. Choose Input → Draft and an appropriate Scope in Details; the existing literal starter explicitly selects whole.

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

**Cleanup modes:** Choose Inspect, Contextual Cleanup or Strict Avoidance in Details. Inspect returns unchanged Patches plus literal findings without a model. Contextual Cleanup and Strict Avoidance use at most one raw-prose Prose request with the complete selected policy. Categories, scope and protected wording are independent controls; choose the intended scope separately. Optional Context supports contextual policies. Exact source permissions are checked before proposal; semantic preservation still requires review. See [the reference library guide](lattice-reference-library.md).

## Transpose

New nodes use **Input type → Text**, accepting Text and returning Text in either graph phase or a reusable subgraph. Choose **Input type → Draft** in Post to accept a frozen reply Draft and return source-bound Patches. Saved nodes that omit Input type retain Draft → Patches behavior. Changing Input type or Reference changes the pins; incompatible connected edits are rejected until you disconnect or replace the affected wires.

Text output can feed a Compose section or another Text tool. Draft output follows Validate Patches → Review Gate → explicit Apply Reply. References guide expression and structure; they do not supply new story facts or reply-application authority.

### Style Transfer

Transfer narration, character voice, rhythm or register from Text or Data reference material to Text or permitted Draft windows. Required inputs are Input and Reference; optional Context can supply relevant background. Text input returns Text; Draft input returns Patches. It makes at most one Prose request. Choose **Mode → Character voice** and **Scope → Dialogue** separately; changing Mode preserves the current Scope.

Controls include Input type, Reference (`text`/`data`), Mode, Scope, Strength, Instructions, Output tokens and Protected literals. Default scope is narration. Mode, Scope, Strength and Protected literals are independent controls. Connect Compose Text as the input or reference, or Compose → JSON Decode for a Data reference. For Draft edits, use the validation/review/apply path above.

### Format Transfer

Reorganize Text or permitted Draft material using a Text example or Data template. Text input returns Text; Draft input returns Patches, with at most one Prose request. Optional Context supplies background. Data may include `requiredContent`, exact strings that must already exist in the input text. Missing required content fails before a request. Controls match Style Transfer except its style mode; reference material cannot authorize new story facts.

### Terminology Map

Apply a Data glossary to Text or permitted Draft text without a model. Data is `{"entries":[{"from":"Captain","to":"Commander"}]}`. Controls are Input type, Scope, Protected literals, Case sensitive and Match (`word` or `phrase`). Unicode boundaries preserve offsets; replacements are simultaneous and never cascade. Text input returns Text; Draft input returns Patches for the same validation/review/apply flow.

## Introspection

Add one of the six canonical nodes from the Introspection family, then choose its **Mode** in Details. Character/Recall/Scene, for example, are modes of Reflect rather than separate shelf nodes. Existing saved modes remain intact.

Introspection Data uses scoped versioned records with evidence references. Plain JSON Data from JSON Decode is not an actor-state, reflection or events record. A proposal does not change memory until a root Memory Commit settles. Modes preserve observation, interpretation and possibility labels; supplied evidence cannot decide the player's actions or private state.

### Reflect

Use one **Analysis** request to appraise supplied evidence. **Character** considers beliefs, goals, relationships and conflicts; **Recall** connects supplied episodes to present evidence; **Scene** considers conditions, opportunities, pressures and attention. Output is Reflection Data, a candidate assessment.

**Pins:** required `context` (Context); optional `state` and `episodes` (Data); `out` (Data). An unwired State pin uses the active actor's empty scoped state for the assessment; wire Memory Read State to include stored state.

**Controls:** Mode, Output tokens (`maxTokens`, default 2,048), Instructions. Recall cannot invent an episode ID absent from the supplied records.

**Connect:** Scene Context → Context Focus → Reflect Character → Express Behavior. Memory Read State can feed Reflect's `state` pin. The [Reflect and express starter](../examples/introspection/native/reflect-and-express.json) ends in Guidance.

### Internalize

Use one **Analysis** request to propose actor updates from settled events. **Experience** extracts supported experience updates; **Pattern** interprets supported recurrence; **Recovery** considers temporary conditions while retaining guarded beliefs and unresolved consequences. Enduring traits cannot be rewritten.

**Pins:** required `state` and `events` (Data), `out` (state-proposal Data). Both input records must match scope, store and prior version.

**Controls:** Mode, Output tokens (`maxTokens`, default 2,048), Instructions. Changed items require exact references to supplied settled events.

**Connect:** Memory Read State + Memory Read Events → Internalize Experience → Memory Commit in a Post root graph. Inspect the proposal with Run to here; a full root Run with Commit may write it.

### Express

**Behavior** and **Attention** render the reflection's corresponding hints as Guidance without a model. **Inner Voice** uses at most one **Prose** request to produce fictional Text. Inner Voice is authored characterization, not access to private model reasoning.

**Pins:** required `assessment` (Reflection Data); optional `state`, `events`, `episodes` (Data) and `context` (Context). `out` is Guidance for Behavior/Attention and Text for Inner Voice. Supporting records must match the assessment's identity and evidence.

**Controls:** Mode, Output tokens (`maxTokens`, default 2,048), Instructions. Output tokens applies to Inner Voice's request; deterministic modes do not resolve a model.

**Connect:** Reflect → Express Behavior → Guidance. Express Inner Voice can feed a Compose Text section. Changing mode changes the output type, so review incompatible connections.

### Context

**Assemble** joins ordered Context inputs and rejects conflicting duplicate identities. **Perspective** retains only messages whose explicit `visibleTo` array includes the chosen Actor ID; unmarked messages are omitted. The default Actor ID `character` resolves to the active host actor. Visibility applies to the returned artifact; independently assembled prompts may contain other material. **Focus** selects or compresses Context using the same protected-material contract as Smart Compactor.

**Pins:** Assemble has required `in1`…`inN` (Context), with Inputs (`inputCount`) from 2 to 16. Perspective and Focus have required `context` (Context). All modes produce Context on `out`.

**Controls:** Assemble: Inputs. Perspective: Actor ID. Focus: Method (`select`/`compress`), Target tokens (default 1,200), Output tokens (default 1,024), Keep recent (default 2), Pins, Purpose. Selection makes zero requests; compression makes at most one **Analysis** request when needed.

**Connect:** Scene Context → Context Focus → Reflect, or Scene Context → Context Perspective → Reflect. The native host marks provided public chat and selected character material visible to its active actor, preserving explicit visibility exclusions. This identifies supplied material; it does not infer who witnessed an in-world event. Imported unmarked Context still requires explicit visibility for Perspective.

### Memory

**Read** returns the selected State, Events or Episodes view as Data. **Recall** finds bounded stored episodes using Query and Results (`limit`, default 8, range 1–64). **Commit** consumes a state proposal and is a Post terminal. All three modes require the root graph and use the active host chat/actor; group chats require a selected actor. Model output cannot choose a store or actor authority.

**Pins:** Read and Recall have no inputs and produce Data on `out`. Commit requires `proposal` (Data) and has **no output pin**. Its commit intent is recorded as a Host result for diagnostics.

**Controls:** Read: View (`state`/`events`/`episodes`). Recall: Query, Results. Commit: Commit key (`idempotencyKey`). The default `lattice-memory-commit` lets the native host derive a key from the graph, terminal and exact proposal. A custom key must identify one intended transaction; reusing it for changed content fails.

**Connect:** Memory Read State + Memory Read Events → State Track or Internalize → Memory Commit. One Memory Commit may appear in a Post root graph. Settlement occurs after all branches succeed and checks fresh source revisions, actor/chat selection, cancellation and the store version before one compare-and-swap write. Public runner calls, previews, Run to here, dry-runs and failed runs never write. See [memory settlement and save status](native-workflows.md#actor-memory-and-state).

### State

Deterministically read or propose state with zero model calls. **Value** returns the state snapshot when Values is absent; configured Values propose numeric updates within Minimum/Maximum (defaults 0–1). **Curve** advances a bounded recovery curve toward Baseline through onset, peak, plateau, decline, aftermath and baseline. **Track** counts distinct settled event IDs; repeats do not advance it. These controls do not infer emotional truth.

**Pins:** optional `state` (Data), falling back to scoped Memory Read at the root. Track also requires `events` (Data). `out` is snapshot or state-proposal Data. Inside a subgraph, explicitly wire `state`; implicit Memory access is root-only.

**Controls:** Value: Values JSON object, Minimum, Maximum. For example `{"trust":0.35}`; arrays are invalid and fractional numeric bounds are supported. Curve: Curve ID, Steps (1–64), Decay (0–1, fractions allowed), Baseline (finite number), Phase durations JSON object, with positive integer durations (1–64) for `onset`, `peak`, `plateau`, `decline`, `aftermath`. Track: Track ID. Save object edits in Details before running.

**Connect:** Memory Read State + Memory Read Events → State Track → Memory Commit. The [Consequence clock starter](../examples/introspection/native/consequence-clock.json) makes zero model requests. State proposals never persist on their own.

## Derive

### Pattern Scan

Locate configured literal patterns, honor exemptions and protected wording, and attach findings/spans to the frozen Draft. Rules are personal editorial preferences.

**Controls:** `mode` (`literal`), `scope` (`whole`, `narration`, `dialogue`), `caseSensitive`, `rules`, `exemptions`, `protectedLiterals`.

**Connect:** Reply Snapshot → Pattern Scan → Repair. Dialogue means paired straight or curly double quotes. Single quotes and apostrophes are ordinary text; unmatched double quotes block narration/dialogue scanning with an issue.

### JSON Decode

Add **JSON Decode** from Derive, then choose **Mode → Parse** or **Check** in Details. **parse** converts raw JSON Text to Data. **check** receives Data and validates it. An optional Schema is entered as raw JSON text; blank means no schema. Markdown fences are not part of a raw JSON payload.

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

**Connect:** Response Plan or Compose with Guidance output → Guidance. A manual Run records a preview. On an assigned, enabled pre workflow, Send installs the bounded guidance for that generation and clears it afterward.

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
