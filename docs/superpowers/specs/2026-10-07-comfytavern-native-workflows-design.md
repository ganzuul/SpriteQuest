# ComfyTavern native workflows design

Status: implementation design, consolidated from the user's approved discussions. The user authorized specification, independent review, planning, implementation, UI Performance coordination, and bounded live NanoGPT tests overnight. Intermediate document approvals are already covered by that authorization.

## Product outcome

An unfamiliar user can choose a working example, bind its model roles to SillyTavern connections, inspect its graph, and run it. SillyTavern assembles the main prompt and generates one ordinary reply. ComfyTavern supplies optional guidance beforehand and a separately reviewed revision afterward. Existing prompt-replacement canvases retain their current behavior.

Two supported examples ship first:

1. Scene Context → Smart Compactor → Response Plan → Guidance.
2. Reply Snapshot → Pattern Scan → Repair → Validate Patches → Review Gate → Apply Reply. The middle three operations form the inspectable, versioned **AI De-slop** group.

This release does not build a complete prompt converter, take over external memory, or implement the entire twenty-node research pool. [Research and future candidates](../../research/2026-10-07-comfytavern-turnkey-node-recommendations.md) remain design references.

## Families and discovery

The exact family names and display order are **Input, Shaping, Surface, Transpose, Derive, Output**. Order is a discovery aid, not execution order. Families appear as a vertical rail/list with compact descriptions and grouped choices, inspired by Gaea's [toolbox](https://docs.gaea.app/ui/interface/graph/toolbox-and-search.html). Preserve the Svelte migration's panels, colors, typography, keyed cards, camera fast path, and projection/callback boundary.

| Family | Meaning | Existing nodes | Initial new operations |
| --- | --- | --- | --- |
| Input | Bring material into a workflow | Prompt, ST prompt reader, History, Injection reader, Lorebook, State, Memory reader | Scene Context, Reply Snapshot |
| Shaping | Change the underlying plan or amount of material | Decider, general Generate | Smart Compactor, Response Plan |
| Surface | Refine expression | Authored Generate recipes | AI De-slop: Pattern Scan, Repair, Validate Patches |
| Transpose | Apply a reference's qualities | Authored Generate recipes | No unsupported placeholder actions; Voice Match remains a future candidate |
| Derive | Extract findings without changing the source | Authored Generate recipes | Pattern Scan can also be discovered here by purpose, without duplicating its definition |
| Output | Inspect or commit an artifact | Output, Memory save | Guidance, Review Gate, Apply Reply |

Note remains an editor annotation. Preserve all eleven legacy node IDs/settings. Explain legacy output as **Replace prompt** and new output as **Guidance** or **Reviewed reply**. Family assignment is catalog metadata, not a renaming of persisted legacy types.

The library starts with two cards showing purpose, required roles, phase, and maximum auxiliary requests. Installing an example creates an independent graph and opens setup; it never arms generation or makes a paid call. Setup binds Analysis, Prose, and Utility roles as needed. A missing binding blocks Run with a useful explanation. Expose an explicit native-workflow mode and pre/post assignments. Existing settings default to legacy mode. Merely opening/importing/editing a workflow must not change the user's global connection or prompt mode.

Context menus expose settings, rename, duplicate, enable/disable, compatible replacement where supported, and inspection. Offer the same useful actions through the inspector and keyboard-accessible buttons. **Run** and **Apply** are explicit actions with distinct meanings. Do not call disabled nodes bypassed: bypass must be a validated pass-through operation if provided. Pin/compare results can use the review surface; bookmarks/portals and arbitrary nested macro authoring are deferred.

## Persistence and execution boundary

Domain state stays in unbundled JavaScript modules consumed by `state.js`, `compile.js`, and `run.js`. Svelte receives immutable projections and callbacks; compiled UI imports no domain modules. Follow existing JS conventions with JSDoc contracts and checked UI types, avoiding an additional runtime dependency solely for validation.

Native graphs use schema 2, `mode: 'native-pre' | 'native-post'`, `runtime: 1`, `roles`, `template: {id, version}`, nodes, wires, and groups. A new persisted node type `workflow` carries a stable `operation` ID and operation settings. Each operation's descriptor defines family, phase, input/output artifact kinds, controls, and request bound. Existing coordinate-based schema-1 execution stays unchanged.

Native wires explicitly connect upstream artifacts to downstream operations. Their stored `order` resolves multiple inputs; coordinates never determine execution or message order. Start with one primary artifact stream per operation and a documented typed artifact envelope carrying optional context, findings, and provenance. Reject ambiguous multiple primary inputs, missing/dangling endpoints, cycles, unknown operation/version, wrong phase, and incompatible artifact kinds before any call. Keep node IDs unique when copying and remap group entry/exit IDs. Native graphs must not silently gain a legacy Output during import.

The AI De-slop formation is actual primitive nodes/wires in the saved graph, with group component ID/version and stable entry/exit IDs. Its collapsed presentation and exposed settings edit those same nodes. Expand/open the formation for inspection/customization. Definition updates never silently change saved instances. Arbitrary nested components and multi-port group authoring are deferred; do not claim this first formation is an unrestricted plugin framework.

Portable JSON uses a versioned ComfyTavern workflow envelope containing the complete graph/formation, template identity, required role names, and minimum runtime. Export omits bound profile IDs and credentials. Import parses and preflights everything before changing settings; role bindings start unresolved and display setup. Continue accepting legacy `.canvas.json` envelopes/raw schema-1 graphs. Unsupported versions/dependencies produce actionable errors rather than half-imported graphs or empty prompts.

## Runtime contracts

All native operations return an explicit result:

```js
// Success: {ok:true, artifact, reports:[], calls:[]}
// Failure: {ok:false, error:{code,message,nodeId}, reports:[], calls:[]}
// Runtime ports supplied by the host adapter, never imported by Svelte:
// {snapshot(phase), countTokens(text), request({binding,messages,maxTokens,signal}), signal}
```

An artifact has a discriminated kind, original source provenance, and derived status. Context artifacts retain message roles, source labels, IDs, and exact retained text. Draft/candidate artifacts carry frozen chat/message/swipe identity and source content. Model outputs never become chat state merely because a run finished.

Run validates the reachable graph before executing. Operations execute once in explicit dependency order; disabled operations require an explicitly supported pass-through or produce a preflight error. No implicit retries. Every actual request reserves against the run bound before sending; trace records node, iteration, selected profile/model, prompt, result, usage when available, token-count method, elapsed time, and failure. Preserve traces for different requests/iterations rather than overwriting one node entry. Show actual versus configured maximum requests; auxiliary counts exclude the native reply.

Native starters have a bound of **2 pre calls** (at most one compaction and one plan) and **1 post call** (repair). Request output caps default to **768 tokens for planning**, **1024 for compaction**, **2048 for repair**. Users can change explicit limits. Abort propagates through every request; no downstream effects on aborted/failed/stale runs. Legacy Decider calls must be included in its displayed call estimate where support is already present.

## Connections and prompt ownership

Each model-backed node can override its workflow role binding with a SillyTavern profile ID and optional model ID. Resolution is node override → role binding; an unresolved fixed binding is an error, never a silent unrelated chat model. Legacy Follow chat semantics remain unchanged.

Use `ConnectionManagerRequestService` for profile routes, preserving host credential references, provider routing, sampler presets, and needed instruct formatting. Submit node-owned messages directly; do not invoke native prompt assembly or copy native system-prompt content into auxiliary requests. Required provider role/instruct formatting and the node's own system instructions remain. Validate supported profile API/model/service availability once and use the same resolution for display and request. Resolve endpoint dependencies explicitly: if a supported profile requires an endpoint that it omits, display the effective inherited host endpoint and its origin before running, or reject if unavailable. Reject a named missing preset rather than accepting unrelated live sampler settings. Bind execution to the resolved provider/model/endpoint so changing the live connection cannot silently reroute a fixed node. No global profile activation. Secrets stay in SillyTavern's store and are absent from workflow JSON, fixtures, traces, and repository files.

## Smart Compactor

Settings: target artifact tokens (default **1200**, positive integer), purpose, method (`select` or `compress`), recent turns kept verbatim (default **2**), protected literal pins, and optional Analysis/Utility connection. Budget measures the resulting context artifact, not downstream provider framing. Report host tokenizer versus character estimate; do not call it exact provider context usage.

Pass inputs already within budget unchanged and without a request. Reserve pinned material and recent messages first. If those alone exceed the target, return `PIN_BUDGET_EXCEEDED`; never truncate protected text. Selection removes older flexible messages deterministically, preserving retained roles/text and reporting omissions. Compression may make one bounded request for flexible material and combines its clearly labeled derived summary with verbatim protected/recent material. Measure the final artifact; reject over-budget, empty, truncated, malformed, or missing-pin results without a second attempt. Keep original material and the preservation/omission report. Extremely large input is bounded before transmission with an explicit omissions report; no hidden recursive chunking. Do not edit chat, lore, or extension memory.

## Response Plan and Guidance

Response Plan uses a compact, node-owned prompt to propose scene direction, actor intentions, constraints, and optional next beats without asserting those proposals happened. Expose purpose/initiative instructions and preserve user agency. Its output is derived guidance, not established lore.

Run preprocessing through the supported generation interceptor before native budgeting, using a snapshot of chat/character/explicitly available material. Do not call `gatherContext`/world-info scanning just to construct this snapshot; do not claim it is the final native prompt. Publish only ComfyTavern-owned prompt keys, bounded to the configured guidance budget (default **768 artifact tokens**), with declared role/position/depth. Guidance does not participate in lore scanning by default. Clear own keys on next run, failure, abort, chat switch, generation stop/end, and unload where supported. Ignore quiet/background/internal and dry-run generations. No replacement of `CHAT_COMPLETION_PROMPT_READY` or text-completion prompts in native mode. One host send produces one native reply. Legacy replacement hooks remain gated to legacy mode.

Support normal, swipe, regenerate, and continue host generations; ignore impersonate and quiet. Use the host-supplied interceptor chat as-is: it already excludes the swipe/regenerate target where appropriate. Manual pre **Test workflow** computes an inspectable result without installing prompt guidance; sending later runs the enabled pre workflow again. Label this clearly with its request bound so testing does not imply cached reuse.

Use a monotonically changing session/run identity to prevent delayed completion from reinstalling guidance after cancellation or chat switch. A pre failure leaves native generation available with a visible failure report and no stale guidance. This is a documented fallback, not silent partial successful guidance.

## AI De-slop and reviewed application

Reply Snapshot captures the explicitly selected/latest completed assistant reply with chat/message/swipe/content identity. No automatic post-reply model call in this first release. Pattern Scan returns literal findings with ranges and never makes a request. Rules are editable preferences, with exemptions and protected wording; no universal banned-word claim. Scope is whole reply, narration, or dialogue, with a precise deterministic definition shown in help. Strength is an instruction, not a calibrated preservation guarantee.

Repair receives the frozen draft, allowed indexed spans, nearby context, rules/exemptions, and optional voice constraints. All ranges are half-open UTF-16 offsets into the frozen original. Normalize candidate edit ranges within the selected scope first: merge overlapping/adjacent ranges, sort by source offset, then assign stable indices. Distinct indices must never overlap; findings can still overlap without granting duplicate edit regions. It requests JSON patches for selected spans using one Prose call. Validate Patches rejects invalid JSON, duplicate/unknown span indices, changes outside the declared selection, removed protected literal content, blank replacements, and cut-off outputs. Unselected text is restored byte-for-byte from the original. Failure preserves the original and offers a useful report; do not fall back to unrestricted whole-reply rewriting. Literal scan-only is a zero-call path.

Review Gate shows original/candidate, findings, changes, profile, usage, and source freshness. Accept/Apply is explicit. Recheck chat, message, swipe and source content immediately before mutation, and reject stale candidates. Apply as a new assistant swipe where the supported host API permits, preserving the original; emit the appropriate host update/save events without recursively triggering ComfyTavern. A failed apply must not claim acceptance. Report that other memory extensions may already have consumed the original; edit/swipe events do not guarantee re-extraction. No automatic external memory repair or arbitrary extension store writes.

Initial host application supports the latest completed assistant reply only. If the target is older or generation is in progress, report the unsupported/busy state without redirecting to a different message. Track in-memory application separately from save status: this host's save wrapper can resolve after logging a network failure, so it provides no positive durability acknowledgment. Preserve original swipe metadata and attach revision provenance to the new swipe.

## UI contracts and performance

Add a focused workflow setup/results surface with projection-only Svelte components where appropriate, mounted through native adapters. Setup and canvas edit one graph. Show editable role bindings and per-call overrides, operation controls, maximum/actual requests, validation issues, and an explicit Run action. Results/review show frozen data and Apply/Reject; no paid calls on render, token preview, movement, or import.

Ensure graph switching/closing invalidates pending setup, run, import, preview, and apply actions. Preserve Svelte migration stale-inspector protection, keyed identities, offscreen behavior, and O(1) camera updates. Native graphs avoid passing through legacy compiler previews that scan world info. Type/build/production asset checks remain required.

## Delivery and evidence

Work in an isolated branch based on the stable UI Performance commit. Independently review this spec, execute a task-sized plan with red/green tests and task reviews, and perform a final whole-branch review. Deliver a draft PR stacked on the UI migration branch if it has not merged; coordinate before changing that base. Do not merge, deploy, or alter existing user's chat content to demonstrate the feature.

Mocked host scenarios cover both starters, invalid imports, profiles, token limits/pins, patches, stop/chat-switch races, and stale apply. Browser tests cover example installation/setup, role/node overrides, family discovery, inspect formation, run/results/review, narrow layout, and preserved graph gestures. Use the real installed host for bounded calls against synthetic writing fixtures; never send private chat/character/history merely for testing.

Live tests are authorized for NanoGPT **z-ai/glm-5.2** and **z-ai/glm-5.2:thinking** only, reusing default-user credentials and creating dedicated test profiles if absent. Limit the acceptance run to **8 attempted requests**, no automatic retries, at most **4096 completion tokens per request**, record reported usage, and stop on quota/auth/provider rejection. Published model IDs may exist while a provider is temporarily unavailable; report that limitation precisely. Host credentials remain in the host store. Use temporary/synthetic host context and avoid changing the active profile or user's persistent prompt setup.
