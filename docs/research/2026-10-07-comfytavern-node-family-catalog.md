# ComfyTavern node families: existing nodes and proposed additions

Research date: October 7, 2026. Status: design discussion. The family names and display order are selected by the user; placements, operation contents, runtime changes, and priorities below remain proposals.

## Purpose and boundaries

Make the existing nodes easier to discover and identify the smallest additions that enable useful, approachable workflows. Use the selected families in order: **Input, Shaping, Surface, Transpose, Derive, Output**. Family order describes the catalog, not an execution sequence.

Keep the [host-owned pre/post recommendation](2026-10-07-comfytavern-approachability-and-workflows.md): SillyTavern assembles its native prompt and generates the main reply; ComfyTavern prepares auxiliary guidance and optional revision candidates. The separate UI Performance task owns Svelte rendering. This document changes no product code or shared runtime interface.

## Existing nodes

The checked-out runtime declares eleven node types in [state.js](../../src/state.js). Their visible names appear in [canvas.js](../../src/canvas.js); their message resolution, routing, and collection behavior is in [compile.js](../../src/compile.js).

| Existing node | Primary family | Proposed treatment |
| --- | --- | --- |
| Prompt | Input | Keep its text, library binding, role, and macro behavior. It supplies material, even when that material is instructions or a style reference. Descriptive library entries can distinguish Instructions and Reference Text. |
| SillyTavern prompt | Input | Keep as a source reference for auxiliary work. Explain missing or unresolved markers; it is not a faithful representation of the entire native prompt. Do not automatically feed a duplicated preset back into native guidance. |
| Chat history | Input | Reuse count, skip, speaker/prose presentation, and existing wire filters. Offer convenient Current Message and Recent Conversation entries. A new immutable Completed Reply source has a different lifecycle contract. |
| Injections | Input | Clarify that it reads selected context contributions. The current resolver reads marker sources; it does not publish ComfyTavern guidance. Availability and timing must be explained, particularly for world info and extension contributions. |
| Lorebook | Input | Reuse explicit selection, filters, limits, and local scanning where appropriate. The native host still owns its authoritative lore selection for the main reply. The current context collector performs a world-info scan; a host-owned mode must avoid repeating that scan merely to obtain a preview or early source snapshot. |
| Memory | Input for reads; Output for saves | Reuse chat-local storage, save modes, and optional lorebook mirroring. Make Read Memory and Save Memory distinct intentions in the catalog/setup. Preserve existing combined nodes and Save-wire semantics until any versioned change is designed. This is not an adapter for arbitrary third-party memory systems. |
| State | Input | Reuse computed values, stage text, and activation ports. It supplies workflow state such as energy or tension. Its rules and bookkeeping already exist; explain them rather than replacing the node. |
| Decider | Shaping | Keep as the routing operation. A Route or Branch discovery label can explain it while retaining the saved type. Deterministic rules/random selection and model-based decisions need distinct request-cost descriptions. |
| Generate | Shaping by default; Surface, Transpose, or Derive for authored recipes | Keep one model-call implementation. Classify named recipes by their function, not by guessing from prompt text. Response Plan, Polish Prose, Apply Style, and Extract Facts can share this engine. |
| Output | Output | Substantial behavior work is required for the proposed native mode. The existing terminal compiles a prompt that the host hook uses to replace the assembled chat array. Future Guidance and Apply Reply operations need explicit, separate contracts; relabeling the current Output is insufficient. |
| Note | Editor tool | Keep as an annotation accessible from the canvas menu. Notes do not send text to the model and should not be presented as a data input. No seventh family is needed for this editor tool. |

Supporting behavior is already distributed across nodes and wires. [select.js](../../src/select.js) filters by message number, speaker, window, tags, and paragraphs, and can join messages. Merge/append/prepend, activation, parallel ties, and bounded loops also exist. Exposing a Select Context operation or routing entry should reuse those capabilities rather than build a second implementation of them.

## What needs modification

### Catalog changes

Most placement work can be descriptors and library entries: stable recipe ID, family, label, description, example, supported phase, settings, and model-role requirements. Preserve existing node types and imported JSON behavior. A generic imported Generate node can default to Shaping; a selected recipe records its own family and purpose explicitly.

The library and inspector should distinguish deterministic processing, model requests, and host writes. A deterministic text operation can run without a model profile. A model recipe exposes its profile, output limit, and request count. A write operation says what it changes. This can be expressed in a small built-in catalog without a new third-party SDK.

### Operation changes

Named input roles are useful for reference-guided work. Today's Generate assembly largely combines incoming messages and its own instructions. Apply Style should separately identify Content, Reference, and Constraints, even if the final auxiliary API request remains an ordinary message list. Implementing that input contract is more than supplying a nicer prompt template.

The model operation should support inspectable results and explicit failure behavior. Structured extraction needs validation before its fields can control routing or become persisted memory. An invalid result should be visible, not silently treated as empty or acceptable. Any repair call or repeat must be included in its bounds and request estimate.

### Lifecycle changes

The main missing primitives are a frozen completed-response source and explicit host outputs. A Completed Reply source identifies the chat, message, swipe, and source content used by the revision. Guidance owns only ComfyTavern's prompt keys and their lifetime. Apply Reply rechecks source identity and produces an explicitly accepted candidate, initially through manual review and a new swipe where supported.

Existing Prompt Manager references and injection readers must not be mistaken for this lifecycle. The current [host hook](../../index.js) replaces `eventData.chat`; it is not already an additive guidance system. The existing [per-block preview and test](../../src/run.js) provide useful infrastructure, but do not establish dependency-aware partial execution or a post-reply pipeline.

Preserve old graph behavior explicitly during any migration. Changing a terminal's meaning, wire ordering, or saved Memory behavior underneath existing files is not merely taxonomy work. New workflows should identify their execution mode and requirements.

## Candidate operations by family

Legend: **reuse** means a catalog entry over existing behavior; **recipe** means an authored Generate configuration; **primitive** means new source, deterministic operation, or host integration. A recipe can still need shared input/validation improvements.

### Input

| Operation | Function | Basis |
| --- | --- | --- |
| Current Message | Supply the latest relevant user message to an auxiliary pass | Reuse History selection |
| Character Fields | Select card fields such as description, personality, and scenario as auxiliary source data | Primitive reader using available host fields; not a complete native-prompt reconstruction |
| Completed Reply | Supply the frozen reply selected for review or revision, with its source identity | Primitive with a supported after-reply/manual lifecycle |
| Reference Text | Supply a passage, style brief, or structural example | Reuse Prompt and personal library |

These complement existing History, Lorebook, Memory, State, and prompt-source readers. Workflow/model settings can initially remain exposed recipe controls rather than additional mandatory nodes.

### Shaping

| Operation | Function | Basis |
| --- | --- | --- |
| Select Context | Choose a message window, speakers, or relevant portions before a pass | Reuse existing filters, optionally surfaced as a visible operation |
| Compose Prompt | Arrange named context, instructions, and constraints into an auxiliary request | Primitive deterministic composer; host macro expansion remains separate from workflow-field binding |
| Response Plan | Produce concise scene direction, intended events, and response constraints for the native writer | Recipe; normally one auxiliary model request |

Decider supplies branching. The Smart Compactor proposal below develops the earlier Budget Context/Context Distiller idea: fit selected material into an auxiliary request budget while showing preservation and omissions. The current token warning is not that enforcement. It would not duplicate the host's main-reply budgeting engine.

### Surface

| Operation | Function | Basis |
| --- | --- | --- |
| Polish Prose | Propose a clearer, smoother version while requesting preservation of events and facts | Recipe; normally one model request |
| Tune Tone | Adjust intensity, formality, pacing, or descriptive detail through explicit controls | Recipe variant over the same model operation |
| Refine Dialogue | Revise spoken lines and presentation while requesting preservation of surrounding events | Recipe variant; optional character context |

These are related recipes, not three separate model engines. Simple whitespace or markup cleanup can be a deterministic operation when a real starter needs it. Revising a workflow's style brief before generation is another use of this family; applying its output remains an explicit Output operation.

### Transpose

| Operation | Function | Basis |
| --- | --- | --- |
| Apply Style | Propose a revision of target content using a supplied style brief or reference passage | Recipe with Content and Reference inputs |
| Apply Voice | Adapt target dialogue or narration to supplied voice characteristics and examples | Recipe variant; explicit target and reference |
| Adapt Structure | Reorganize target content to resemble a reference structure or template | Recipe variant; structure and content kept distinguishable |

Transpose uses an external reference; Surface adjusts expression through instructions/settings. Compose Prompt fills named sections deterministically; Adapt Structure asks a model to reorganize meaning-bearing text. Those distinctions help users predict behavior and cost. Requests to preserve content are constraints, not guarantees.

### Derive

| Operation | Function | Basis |
| --- | --- | --- |
| Summarize | Produce a bounded recap from selected material | Recipe; returns an artifact rather than automatically updating memory |
| Extract Facts | Return candidate events, entities, and constraints in a defined structure | Recipe plus shared output validation |
| Style Profile | Describe reusable voice, diction, rhythm, and dialogue characteristics from reference passages | Recipe; an output can later save the brief explicitly |
| Critique | Return specific issues and suggested improvements without rewriting the input | Recipe; feeds a Surface/Transpose revision or a routing decision |
| Extract Field | Select tagged text or, later, a validated structured field from an upstream result | Reuse tag extraction initially; structured-field selection needs a primitive |

A later Check Constraints recipe could flag changes to facts or instructions between original and candidate. Its assessment should remain inspectable and should not be advertised as proof of unchanged meaning or canonical truth. Persisting extracted facts to Saga or another extension needs a separate adapter contract.

### Output

| Operation | Function | Basis |
| --- | --- | --- |
| Guidance | Install bounded, named instructions for the native writer before its prompt is assembled | Primitive host integration, including placement, lifetime, and cleanup |
| Inspect Result | Expose an available artifact with its source run and model information | Reuse previews/tests where possible; extend recorded run inspection |
| Compare | Show original and candidate together, with a textual difference view where useful | New result presentation/operation; no model request required |
| Apply Reply | Accept a reviewed candidate against the same source reply | Primitive guarded host write, not a second main generation |
| Save Memory | Persist selected content to ComfyTavern-owned memory or its explicitly selected lorebook mirror | Reuse storage primitives; make ownership and write timing explicit |

Reaching Output does not automatically modify chat or another extension's storage. Guidance and Apply Reply can add zero auxiliary model requests, but they have host effects. Compare and Inspect are read operations. Third-party writes and automatic revisions require their own tested policies.

## Smallest useful delivery

The catalog above is a candidate pool, not a requirement to implement every entry before release. Start with existing Input sources, Response Plan, Polish Prose, one reference-guided Apply Style recipe, and supported outputs for those flows. Summarize and Critique are useful next recipes once their results can be inspected and connected clearly.

Two starter workflows demonstrate the core value:

```text
Recent Conversation [Input]
  -> Response Plan [Shaping]
  -> Guidance [Output]
  -> SillyTavern's ordinary native generation

Completed Reply [Input] + Reference Text [Input]
  -> Apply Style [Transpose]
  -> Compare [Output]
  -> user accepts -> Apply Reply [Output]
```

The first normally adds one auxiliary model request. The second normally adds one request per revision run. Using a prepared style brief adds no extraction call; deriving one through Style Profile is a separate request. Optional critique, retries, and repeats add their own calls. No current engine support for either complete lifecycle is claimed by these diagrams.

Sequence the work around these recipes: catalog metadata and portable setup; native guidance/source lifecycle; minimal Content/Reference binding plus manual revision/comparison/commit; then validated derived artifacts and richer input roles as needed. Do not delay usable examples to fill every family or build a generic plugin ecosystem.

## Per-node connections and workflow-owned prompts

The user wants every model-backed node to select its own SillyTavern connection profile, so reasoning, prose, extraction, and other parts of a workflow can use different models and providers. The profile supplies connection/model settings; the auxiliary prompt is assembled by the workflow. Reusing a connection should not automatically import its native roleplay prompt or change the main chat's connection.

### What already exists

Generate already has a **Send with** profile selector and optional **Model** override in [ui.js](../../src/ui.js), implemented by `modelEditor` and `modelOverrideEditor`. Its defaults are `profileId: null` and `model: null`. [run.js](../../src/run.js) resolves an explicit node model first, otherwise the selected profile's model; an unbound node follows the live chat connection/model. This is not limited to one universal profile. The current Output profile selector does not supply an inherited profile to upstream Generate nodes.

AI Decider conditions and sorters already support profile IDs in their runtime configurations. The yes/no path uses `condition.profileId` then `decider.profileId`, and the sorter uses `sorter.profileId` then `decider.profileId`, before falling back to the chat. The current inspector exposes an optional model but does not expose those profile selectors. Jev is a separate inference backend with its own settings, not a SillyTavern connection profile.

`askModel` sends the graph-assembled message array to SillyTavern's `ConnectionManagerRequestService.sendRequest`, without selecting that profile globally. In the inspected installed host, [the request service](F:/SillyTavern/SillyTavern/public/scripts/extensions/shared.js) uses profile routing, endpoint, credential references, and optional generation presets while accepting the supplied prompt. [The completion service](F:/SillyTavern/SillyTavern/public/scripts/custom-request.js) handles preset-to-request parameters and text-completion instruct formatting. This is separate from running ordinary chat assembly over the character, lore, and native prompt order.

These are source observations, not a claim that every provider/template has been tested. Text-completion profiles can need model-specific instruct formatting, and settings-preset payloads can inherit host defaults. Request previews and provider tests must distinguish structural formatting and generation parameters from added prompt content. Disabling all system-role content would also discard legitimate node instructions; it is not a valid general method of excluding the native preset.

### Proposed common node controls

Use the same Model section for every supported model-backed operation, including Response Plan, Surface/Transpose/Derive recipes, and model-based Decider routing:

| Control | Proposed behavior |
| --- | --- |
| Connection | Inherit a workflow role, follow the current chat, or select a specific supported SillyTavern profile |
| Model | Use the resolved connection's model, with an optional override valid for that provider |
| Generation settings | Use supported profile parameters; expose node overrides for output limit, sampling, and reasoning where supported |
| Prompt | Use the node's instructions and connected inputs; native preset/character/lore content enters only through explicitly chosen Input sources |
| Resolved target | Display effective profile, provider, model, and whether each value is inherited or overridden |

Connection controls belong to node configuration. Users should not have to create a separate model-selection node or change the main chat connection to route an auxiliary pass. Required provider chat/instruct formatting remains available; any content-bearing template additions must be explicit and inspectable rather than silently imported from native settings.

### Defaults, roles, and portability

Offer optional named model roles at workflow setup, such as **Analysis**, **Prose**, and **Utility**. These are connection bindings, not additional node families. For example, Response Plan can use Analysis, Polish Prose can use Prose, and Extract Facts can use Utility. A particular node can override its role with another profile.

Proposed resolution order: **explicit node connection → assigned workflow role → workflow default → current chat**. An explicit missing or incompatible binding is an error to resolve, not permission to silently fall through to a different provider. Model overrides apply within the resolved connection. A fixed profile that lacks a usable model should prompt setup rather than quietly borrow an unrelated chat model; Follow Chat is the explicit dynamic choice.

Workflow roles are proposed; there is no independent workflow-wide connection default in the inspected current implementation. Imported examples should ask the recipient to bind Analysis/Prose/Utility to their own profiles, rather than depend solely on another user's saved profile IDs. Profile identifiers and names are references; credentials remain managed by SillyTavern and are not copied into workflow files.

### Shared request behavior

One runtime resolver and request adapter should serve all model-backed recipes and routing calls. It should resolve the actual provider/model consistently for model lists, reasoning controls, previews, execution, and run records. A workflow run should have an explicit policy for connection changes during execution, avoiding accidental switches between stages or retries. Parallel passes must use request-scoped settings without toggling SillyTavern's globally selected profile.

Retain the node-owned prompt, declared inputs, and output schema across retries. Report unavailable profiles, unsupported modes, and missing models clearly. Model-profile errors should not be concealed by automatically calling another provider. The graph can separately define whether a failed auxiliary step aborts the workflow or continues without that guidance.

The initial work is to expose and unify existing capability, add portable role bindings, and validate isolated auxiliary requests. This does not require implementing a new provider client for each node or deleting/editing the user's saved SillyTavern prompt. The main native reply continues to use the chat's normal configuration.

## Smart Compactor

The user wants a node that can sit midway through a workflow and intelligently reduce whatever context is connected to it. Proposed family: **Shaping**. This develops the Context Distiller candidate rather than adding a second tool with the same purpose. It reshapes material for a downstream task; Summarize under Derive remains an operation that produces a recap or extracted artifact.

### Current capability

There is no dedicated compactor in the current eleven node types. A Generate node can already summarize upstream material and pass only its answer onward. That is a usable manual recipe, but it does not implement measured target-budget fitting, preservation validation, or complete-result verification. Its output-token cap can truncate a summary rather than produce a complete compact representation.

History selects messages; wire filters select messages or text portions. Lorebook's token budget selects whole entries using an approximate content-length count; it does not shorten their contents. [compile.js](../../src/compile.js) counts assembled text and warns about oversized prompts without trimming them. Existing counts use the current host tokenizer or a character estimate, not a resolved downstream model's complete request framing.

### Proposed input/output contract

- Context: text, messages, or supported structured artifacts from upstream nodes.
- Optional task/intent: what the next step needs this material for.
- Optional preservation rules: pinned passages, fields, or source items.
- Compact Context: a task-focused representation, retaining original message roles where messages remain verbatim and clearly labeling generated summaries.
- Compaction Report: input/output counts and counting method, retained/pinned material, omitted sources, compressed sections, request count, and unmet requirements.

Compaction creates a new downstream artifact. It does not rewrite source chat, lorebooks, memory, or SillyTavern's native prompt settings. Original input remains available for inspection or other branches.

### Controls

| Control | Function |
| --- | --- |
| **Target size** | A token target for the outgoing context artifact. An optional downstream-budget mode can deduct instructions, other inputs, framing, and response reserve where those values are known; it must not guess an unsupported model's window silently. |
| **Purpose** | General context, planning, prose revision, fact extraction, or an explicit task description. Relevance depends on what the consumer is trying to do. |
| **Preserve** | Pin selected input items, fields, or literal passages. Useful defaults can protect instructions, the current request, active constraints, names/numbers, and exact quotes as appropriate for the artifact type. Literal preservation and semantic preservation are distinct. |
| **Recent material** | For conversation inputs, keep a chosen recent window verbatim and compress older turns. For other inputs, use explicit pins/sections instead of inventing chat recency. |
| **Method** | Select/deduplicate without a model; semantic compression; or extract a task-focused brief. Nonidentical meanings must not be deduplicated solely because wording resembles another passage. |
| **Detail priority** | Preserve details, balanced, or aggressive reduction. Express which details may be omitted, not a promise that one numeric strength preserves every fact. |
| **Connection** | Choose the compaction model independently through the shared per-node/role profile controls. |

Show Target size, Purpose, Preserve, and Connection first; put recent-window, method, and detail controls in expanded settings. Provide a default to compact only when the measured/estimated input exceeds the target. Passing an already-small input onward requires no model request.

### Proposed formation

```text
Input artifact + task + preservation rules
  -> measure and separate pinned/verbatim material
  -> if within target, pass original onward
  -> otherwise select/deduplicate and optionally compact flexible material
  -> restore pinned items and label generated summaries
  -> measure complete outgoing artifact and check preservation/completeness
  -> Compact Context + Compaction Report
```

For example, a conversation source could feed Smart Compactor with a 1,500-token target, a planning purpose, the latest two turns protected, and active scene facts prioritized. Its result then feeds Response Plan. A prose-revision pass could preserve the draft verbatim while compacting supporting history; a reference-analysis pass should preserve relevant style samples rather than summarize away the style being analyzed.

A fixed preservation set can already exceed the budget. In that case the node should report that the requested target cannot be met without breaking those pins. It must not silently delete them or treat a larger result as compliant. Counts must identify the tokenizer/estimate used and distinguish context-artifact size from the final provider request; another model's formatting or tokenizer can change the total.

One ordinary semantic compaction can add one model request. Very large input may exceed the compactor's own window and require explicitly bounded chunking plus consolidation, with all calls shown. An optional smaller-target retry is another request; never loop until success without a limit. A truncated, malformed, or still-oversized result should remain an explained failure or explicit alternative, rather than silently forwarding an unusable artifact.

The compound can reuse existing Generate and selection primitives, but needs new budget, pinning, artifact assembly, and result-validation behavior. These settings and behaviors are proposals for review; no compaction node or provider tests were implemented here.

## Evidence and open decisions

The [turnkey-node recommendations](2026-10-07-comfytavern-turnkey-node-recommendations.md) extend this catalog with concrete community needs, ComfyUI/Gaea references, candidate compound behaviors, and an AI De-slop formation. These are proposed reusable operations rather than additional families or independently implemented model engines.

This mapping is based on the checked-out declarations, default node settings, source resolvers, connection rules, existing wire filters, model preview/test functions, host prompt hook, memory/state modules, per-node connection controls, and the installed host's request/completion services. No paid generations, live-host compatibility trials, or product changes were performed for this discussion.

The placements and candidate operation contents need user review. Important later choices are how recipe identity and named inputs persist, how old graphs select their existing mode, the supported host timing for guidance, and the exact manual revision/commit contract. These belong in coordinated runtime design before implementation, with Svelte consuming the agreed descriptors and commands.
