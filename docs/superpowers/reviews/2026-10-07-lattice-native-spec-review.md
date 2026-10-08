# Lattice native workflow specification review

Verdict: Ready after two bounded contract amendments. No Critical defects found. The architecture does not need redesign, and these amendments can be folded into the implementation plan without another user approval.

Reviewed: F:\git\SillyCanvas\docs\superpowers\specs\2026-10-07-lattice-native-workflows-design.md. Cross-checked the read-only Svelte migration checkout and the installed SillyTavern host. The requested temporary host-lifecycle report was absent when checked. No paid requests, implementation changes, or delegated work performed.

## Important findings

1. Spec line 68: define fixed-profile endpoint and preset fallback behavior, not only API/model/service validation. The installed `ConnectionManagerRequestService.sendRequest` forwards the profile endpoint and named presets (public/scripts/extensions/shared.js:423-487), but `ChatCompletionService.presetToGeneratePayload` explicitly resolves URL fields as profile -> completion preset -> current CC settings (public/scripts/custom-request.js:599-606). Text completion also falls back to the current configured endpoint (`createRequestData`, lines 85-99), and missing instruct/sampler presets fall back with a console warning (lines 293-329). A valid fixed profile ID/model therefore does not alone establish the actual endpoint or guarantee the formatting/preset shown in setup. This is not a claim that the service copies the native main prompt: it takes the supplied messages directly. Amend the adapter contract to resolve and display relevant inherited endpoint/preset dependencies or reject unresolved required ones, and test a partial custom profile while an unrelated chat endpoint is active. Preserve intentional supported host credential fallback; do not recreate credential handling or globally activate a profile.

2. Spec lines 86-88: define normalization of overlapping findings before assigning patch indices. Editable literal rules can match both a phrase and a substring of that phrase, or repeat a match through different rules. Duplicate patch-index rejection does not reject two distinct indices whose original ranges overlap. Applying both patches can consume original text twice or change the candidate according to incidental application order, undermining the selected-range/unselected-text guarantee. Define offsets as half-open UTF-16 ranges against the frozen original (or another explicit convention), deduplicate equal ranges, then merge overlapping selected ranges or reject them before the repair request. Preserve separate finding explanations if ranges merge. Apply validated patches against the original in a deterministic order; tests should cover equal, nested, partially overlapping, adjacent and non-BMP ranges. This is a small prerequisite for the chosen patch architecture, not a request for a more general edit engine.

## Verified strengths and feasibility

- Native/legacy mode separation and preservation of schema-1 semantics are explicit. Native graph preflight must run before the legacy importer, whose current implementation adds a legacy Output when absent (src/state.js:926 onward); the spec correctly forbids that for native graphs.
- The host supports an awaited manifest generation interceptor (`public/scripts/extensions.js:2024-2052`), called before subsequent prompt assembly/budget work and skipped on dry runs (`public/script.js:4557-4579`). Its parameters do not carry an AbortSignal, so host generation events plus the spec's independent run identity/controller are necessary. This is feasible, not an unsupported assumption.
- ConnectionManagerRequestService supplies node-owned messages directly for chat completion and provides profile instruct formatting for text completion. The intended no-global-activation architecture is supported. Avoid reusing legacy askModel without isolating its follow-chat fallback and retry behavior (migration src/run.js:340-413).
- Prompt cleanup, failed-pre fallback, manual post execution, frozen source checks immediately before apply, and explicit Apply are coherent. Call bounds are concrete and cancellation covers delayed completion.
- The formation persists actual primitives and wires, with component identity/version only as metadata. Collapsed and expanded editing share the same saved nodes, avoiding two competing execution definitions. Deferring arbitrary nested authoring is a sensible supported constraint.
- The two starter cards, role setup, family descriptions, inspectable formation, and explicit request counts give a newcomer a usable entry point. The six families are catalog organization and do not contaminate persisted legacy node types.
- Smart Compactor's protected-material overflow is an intentional error, not a defect: a two-turn verbatim reservation can exceed 1200 tokens and should visibly fail as specified.
- Literal-only scanning is intentionally zero-call and no automatic post model request is promised. External memory repair is explicitly outside scope and the limitation is accurately disclosed.

## Implementation clarifications, not blockers

- Define the native-pre manual Run action as snapshot/results preview, with generation-hook execution owning temporary prompt publication. The current spec implies explicit Run and hook execution but does not explicitly describe whether manual Run installs guidance or whether the next Send reruns it. Choose one behavior and label it so the user does not accidentally pay twice expecting reuse.
- Choose and test the supported generation-type allowlist (ordinary reply, and whether regenerate/swipe/continue are supported). The host also has impersonate and quiet modes. Background/internal classification needs an actual event/type mapping, not a nonexistent dedicated flag.
- The host context exposes swipe navigation and rendering/save tools, not an obvious dedicated append-swipe method. Its own `/addswipe` implementation initializes swipes/swipe_info, appends manual metadata, navigates, then saves (`public/scripts/slash-commands.js:4618-4675`) and specifically targets the latest message. Either provide a host adapter with equivalent supported handling for explicitly selected older replies, or make older-reply Apply unavailable with a clear explanation. The spec's 'where the supported host API permits' already allows this limitation; do not silently redirect to the latest reply.
- Preserve original swipe metadata separately and give the accepted revision its own provenance. Treat event/save failure honestly: a mutation may already have happened even when persistence failed. The existing prohibition on falsely claiming acceptance should be reflected in result states.
- The artifact envelope and operation table should become concrete JSDoc contracts in the implementation plan. A prose-only enum of all kinds is not required to approve this design, but phase, operation version, source identity and derived status must be carried through every pass.

## Requested disposition

Add the endpoint/preset resolution rule and the span-normalization rule; carry the nonblocking decisions into the first adapter/runtime tasks. Proceed with the specified red/green coverage and real-host synthetic acceptance within the existing eight-request authorization. No new scope or user decision is required by this review.

## Amendment verification and final disposition

The scoped changes were rechecked in the current specification. Finding 1 is resolved by explicit endpoint inheritance/origin disclosure, missing named preset rejection, and binding execution to the resolved provider/model/endpoint (line 68). Finding 2's material defect is resolved by merging overlapping/adjacent candidate ranges before assigning stable, non-overlapping indices (line 90).

The requested follow-up clarifications are also present: manual pre Test does not publish guidance and later Send reruns it; the supported host generation types are enumerated (line 82); initial Apply targets only the latest completed assistant reply and rejects older/busy targets; in-memory application and unacknowledged save durability are distinguished (line 94).

Minor precision note: neither the specification nor the current implementation plan contains the stated UTF-16/half-open offset convention. Carry `half-open UTF-16 offsets into the frozen original` into the patch contract and Unicode tests. This does not leave the material overlapping-region defect open.

Final verdict: READY for implementation. No remaining Critical or Important specification findings from this review. No broad re-review, implementation, or paid calls were performed during amendment verification.
