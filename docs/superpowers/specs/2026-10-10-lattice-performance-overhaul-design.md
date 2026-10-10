# LATTICE performance overhaul design

Date: 2026-10-10. Status: proposed for user review; product implementation has not started.

Branch: `codex/lattice-performance-overhaul`, based on verified GitHub Main `143ec11cdd35c5478990198d51823f1076922bd7`.

The [fresh Main baseline](../../research/2026-10-10-performance-main-baseline.md) passes 263 unit test files, type checking, build and asset checks. Its preliminary 100-node toggle median is 683ms synchronous / 885ms to the paint-opportunity estimate. Raw measurements, exact input hashes and verification logs accompany that report.

## Purpose and success

Make placing, moving, connecting and editing nodes feel immediate and keep continuous gestures smooth. Preserve workflow meaning, validation, qualified definition ownership, undo/redo, document saving, recovery, draft editing and existing visual behavior. The user authorized a major performance overhaul informed by the [latency audit](../../research/2026-10-10-editor-latency-audit.md).

The audit reproduced a 637ms synchronous Details toggle at 100 nodes and 1967ms at 250 nodes. Those numbers describe the audit's frozen working-tree build, not this clean Main checkout. Current-code review confirms the same expensive paths on Main; before/after claims require new measurements against this worktree's baseline.

Svelte already supplies keyed, retained components and local reactive editor state. The overhaul will give it stable, narrow inputs and batched publications. It will also remove redundant domain preparation, synchronous geometry and serialization that Svelte cannot optimize for us.

Final performance goals for the audit's short-text fixture on the same machine, browser and CPU-rate-1 configuration:

- At 25 and 100 nodes, common committed Details edits, node creation, accepted connections and root drag release should reach the probe's paint-opportunity estimate in under 100ms median and under 200ms observed maximum across at least 20 plain samples after warmup.
- At 250 nodes, the same actions and root drag release should settle in under 200ms median and under 400ms observed maximum. Each intermediate milestone must improve matched measurements and reduce its intended work counts; these goals are targets to verify, not current results.
- Continuous drag, pan, zoom and wire preview target 16.7ms of frame work at 60Hz. For 25/100/250-node fixtures, measure five plain gestures after warmup, each with 45 frame-paced batches of six events. Require observed frame-interval P95 no greater than 20ms and worst interval no greater than 50ms per gesture at CPU rate 1; this accommodates frame alignment while exposing stalls. Report frames over 25ms, start/threshold latency and release separately. Keep instrumented work-count samples separate. Do not hide a startup stall behind a good P95.
- Preserve correctness across representative mixed graphs, populated libraries, nested occurrences, groups, wrapped pins, model profiles and large Details content. Record those results separately rather than treating the chain fixture as universal.

## Approach

| Approach | Benefit | Limitation |
|---|---|---|
| **Recommended: staged revision-aware preparation and granular Svelte/canvas updates** | Addresses all measured cost centers; preserves existing components and admission boundaries; supports independently verified milestones | Requires explicit ownership, invalidation and lifecycle contracts |
| Isolated render and debounce patches | Small changes can quickly remove individual redraws | Whole-document preparation still dominates committed actions; debounce alone can weaken recovery |
| Rewrite the editor around reactive graph state or workers | Could move substantial computation or change state granularity | Broad compatibility risk; mutable authoring and layout bottlenecks remain unless redesigned; transfer and scheduling costs need evidence |

Keep the current application, document formats, component layout and operation behavior. Introduce no new product dependency or worker in the initial overhaul. Reconsider off-thread pure preparation only if profiling after these changes shows a remaining CPU bottleneck that warrants it.

## Authority, revisions and preparation

Create a private preparation pipeline that owns admitted immutable snapshots and checked artifacts. Public graph objects and serialized DTOs remain ordinary data. An object identity or counter attached to today's mutable root cannot prove that its content has stayed unchanged: current tests deliberately mutate roots and prepared candidates.

During migration, retain existing raw-root capture/commit fingerprints, current context checks, protected-field checks and atomic history behavior. Add a privately branded receipt for a checked candidate produced and retained internally. Bind it to activation/root identity, authored document revision, captured qualified path/exact containing pin and the owned candidate. Recheck permissions, ownership, mode and protected fields at commit. Camera, selection and persistence timestamps neither stale a valid edit nor get rewound by it. Only an owned, immutable candidate may reuse its validation result. Raw public candidates continue through full admission. Brands must not survive cloning or serialization, and foreign, stale and replayed receipts must fail. Preserve raw captured-context reuse after an accepted no-op independently from any one-shot candidate receipt.

The controlled transition boundary publishes document content, history and revisions together before notifying observers. No-op and failed edits leave history and revisions unchanged. Undo/redo advances document revision even when returning to identical earlier content. Pending typing remains a separate prior undo step.

The resulting private document stamp distinguishes activation, authored document revision, execution revision, presentation revision and registry revision. Host metadata and shelf heads have separate generations. Adopt revision-only fast paths only after every relevant controlled authoring write crosses the ownership boundary. Legacy/raw mutation entry points retain conservative admission and full-refresh fallback.

Reuse checked registry identities, dependency information, effective node metadata, qualified port/endpoint indexes and planner artifacts. Validate all registry snapshots, including unused definitions, on external admission. Whenever registry membership or pins change, including internal combinations of individually checked definitions, check aggregate limits, exact references, same-ID/version consistency, recursion/depth and ownership. Reuse unchanged per-definition artifacts within that complete registry check. Build incoming/outgoing wire, portal subscriber and group membership indexes once per checked scope. Compute target summaries lazily. Public targets pass bounded getter-free plain-data admission before key construction. Memoize root and actual admitted inventory targets, including completeness failures, for the planner's lifetime; arbitrary invalid targets fail without entering the cache.

Keep historical planners as immutable captures: source changes must not change an old planner's answers. Check qualification when installing artifacts into the active workspace. Effective occurrence metadata includes ancestor enabled state, roles, overrides and phase. A standalone definition's expansion cannot substitute for an instantiated occurrence. Definition id/version/hash is insufficient for full display or binding reuse because canonical identity excludes some presentation and local binding data; qualify reuse with owned snapshot identity and registry generation. Preserve exact pin/provenance changes and existing result invalidation. Host generations qualify display caches only; they never replace binding re-resolution, execution/apply-time freshness checks, chat/reply/swipe/prompt identity checks or the final synchronous check immediately before host mutation.

## Trusted change receipts and controller reconciliation

The transaction/history producer derives a change receipt from the checked transition. Caller hints do not grant authority. It identifies document activation, revisions, affected qualified views/nodes/groups, and impact categories: coordinates, presentation/content, controls/ports, topology, definitions, permissions/ownership, metadata or unknown.

`semanticChanged === false` does not imply coordinate-only: comments, permissions and metadata can also be nonsemantic. Only a positively established coordinate-only root edit gets the position path. Unknown changes refresh conservatively.

| Change | Reconciliation |
|---|---|
| Root coordinates only | Commit authored positions and remove obsolete coordinate overlays atomically; patch affected prepared/draw entries; retain planner, editor bridge, selection and Details |
| Read-only definition movement | Update the allowed presentation overlay; retain authored definition data and execution authority |
| Trace, recall status, selection or runtime display | Patch visual state and dependent panels without card geometry or document preparation |
| Camera/view presentation | Update transform/view revision; use the existing persistence timing with owner-qualified tickets |
| Controls/content/ports | Reprepare affected projections conservatively; invalidate geometry only for changed layout contracts; invalidate execution artifacts when required |
| Topology, definitions, ownership or external replacement | Rebuild the required qualified scopes and invalidate affected authority; full admission for untrusted replacement |

One accepted edit reconciles and publishes once. Root drag release must not activate the editor twice. Patches to prepared views are checked against the current activation, scope and authority; permission/navigation changes invalidate captured edit contexts.

## Canvas publication and geometry

Separate the renderer's conceptual entry points:

```text
applyScene({ viewKey, revision, nodes, comments, groups, wires, profiles })
patchPositions(updates)
patchVisuals({ trace, recall, selection })
setWirePreview(preview)
invalidateGeometry(ids, reason)
```

These are design contracts; implementation may preserve existing exported adapters while adding private methods. A structural scene is published once after admitted preparation. Related Svelte assignments share one flush. Measure dirty cards after the DOM update, then publish dependent routes/group frames together. Initial group layout may require this dependent stage; do not claim one total layout pass where the dependency requires two.

Maintain stable render slots by qualified view and element ID. Update order/membership arrays only when order or membership changes. Position changes patch affected nodes, incident wires and dependent groups rather than traversing all settled routes per frame. Preserve visual classes independently so movement cannot erase selection or trace state.

Retain an element/layout-key/epoch geometry registry and ResizeObserver subscriptions. Observe new elements and unobserve removed elements; reject stale callbacks from removed elements or earlier views. Distinguish DOM omission from authored deletion: folded/hidden members retain cached qualified geometry because group frames depend on their measured dimensions. Invalidate hidden geometry when required and remeasure on remount; remove cached geometry for deleted entities or a replaced view. Unchanged initial observer notifications must not trigger another complete measurement. Graph-reference replacement within the same view does not by itself discard geometry.

Invalidate geometry for changed content, port arrangement, wrapping width, compact mode, fonts, theme and pointer-media layout. Equal outer dimensions do not guarantee equal pin positions. Retain geometry for position, selection, hover, trace, recall status and the current LOD behavior. Preserve optical ink alignment for wrapped labels; optimize its reads and writes only with text, width, font and layout epoch included in qualification.

Wire preview owns a separate reactive slot. Free pointer movement updates only the ghost; it does not rebuild settled wire arrays or routes. Recompute target feedback when origin, target or compatibility changes. Position or geometry changes to an active origin/target also invalidate its preview, even with an unchanged pointer and target identity. Reuse hover preparation on release only when the captured context and candidate remain valid.

## Details and Svelte projections

Produce immutable per-panel and per-node DTOs with stable references for unchanged data. Keep selected content/schema, preview, run rows, profile capabilities and recall capabilities on separate dependency keys. Layout, camera and runtime-only updates should not reconstruct selected authored controls.

Replace repeated support-signature serialization with a producer-supplied editor contract key. Batch related Workbench state changes into one publication. Keep editor draft ownership separate from activation and asynchronous write tokens.

Invalid drafts must continue to survive ordinary inspector close/reopen and switching away from a document and returning. Key drafts by the existing qualified authored address and editor contract within a stable document namespace. A genuinely different document with the same graph ID receives a different namespace; returning to the retained document restores its namespace. Clear the private cache on component destruction and discard obsolete drafts on incompatible contract changes, preventing old text from resurfacing if that contract later returns. Scope acknowledgments by activation, visit, request generation and current contract so a stale completion cannot clear a restored or newer draft. A successful acknowledgment clears its own submitted draft even if its commit already advanced the displayed revision. An activation ID must not indiscriminately become part of the draft storage key.

For large structured fields, eliminate repeated full stringify/parse on each local input where the existing typed draft can be updated directly. Preserve current validation/save semantics. Instantiate advanced editors when opened where doing so preserves draft ownership and focus behavior. Do not place the entire mutable authored graph inside a Svelte deep proxy to bypass admission.

## Recovery, dirty state and lifecycle

Centralize recovery requests in shared state authority. Qualify each ticket with settings owner, document activation, authored revision, views revision and settings revision. Coalesce repeated requests for the same revision; publish the newest valid recovery snapshot once. Preference/library settings must still save when the graph is unchanged.

Preserve immediate in-memory recovery for admitted authored commits. In the first migration stage, keep one immediate canonical encoding where necessary and remove duplicate encodings. Replace the stringify/parse round trip only when a detached, admitted plain recovery projection is available with parity tests. Never publish aliases to mutable live graph objects. Host disk persistence keeps its existing debounced semantics; the initial overhaul adds no new intentional authored recovery delay.

Camera/view requests can retain the existing 180ms debounce. Flush means synchronous finalization of the captured owner's in-memory recovery and submission through that owner's available host save boundary; the current parameterless host debounce API supplies no disk acknowledgment. Flush before document/settings-owner replacement, explicit save/export, navigation/close/disposal and pagehide where available. Cancel old tickets before activating the replacement. Never use a replacement owner's current saver as evidence that the outgoing owner persisted. A stale callback must never serialize global current state on behalf of another document. Preserve synchronous view/activation APIs and native picker user activation: do not insert an awaited recovery operation before Save As opens its picker. Add an explicit recovery result/reporting adapter because current recovery failures can be silent. Retain pending failed work and report it separately from file-write failure. A successful native file write still acknowledges its exact captured snapshot independently of host recovery submission.

Cache dirty comparisons by owned authored graph and authored view-presentation revisions plus saved checkpoint content. Aliases and presentation overlays affect dirty state; camera, selection and navigation do not. Retain conservative snapshot checks for raw mutable roots/views until all their writes cross the ownership boundary. Undo back to saved content must become clean. File-save acknowledgment belongs to the exact captured snapshot: editing during a save stays dirty, and a same-ID replacement rejects the old acknowledgment.

## Verification and evidence

Extend existing correctness coverage rather than substituting timing assertions for domain tests. Required deterministic invariants include:

- Free wire preview and trace-only changes perform zero settled-route rebuilds, card measurements and observer reconnections; card/wire DOM identity and focus remain retained.
- Coordinate-only root release produces one reconciliation/publication, one undo entry and no planner/Details projection or editor reactivation. Nonsemantic ownership/comment changes cannot take that path.
- One dirty card measures only its required geometry; removal/stale observer callbacks and same-size font/pin changes remain correct. Preserve wrapped ink anchors, LOD hysteresis/focus rings, camera focus correction, folded groups and cancel behavior.
- Checked candidate reuse preserves stale/mutation/tamper/ownership rejection and atomic history. Verify foreign/cloned/replayed receipts, undo-to-identical-content staleness, semantic-hash-equal display/binding separation and sibling occurrences with different overrides.
- Planner/prepared resolver parity holds; cold and warm work counts demonstrate registry admission reuse, indexed attachments and memoized target summaries.
- Recovery encodes once per necessary revision, newest views win, settings-only edits save, outgoing lifecycle flush works, and stale owner/activation callbacks cannot overwrite a replacement.
- Details DTO identity and draft persistence survive unrelated updates and navigation. Stale completions cannot clear restored drafts. File checkpoints, credential/runtime stripping and legacy recovery remain intact.

Run relevant unit and browser suites for each milestone, plus type checking, build and asset checks. Update the canvas fixture adapter with renderer changes. Collect performance counters separately from uninstrumented action timing; instrumentation significantly affected the original profile. Record exact source/build hashes, hardware, browser, viewport and commands for each comparison. Retain raw measurements and write a milestone report, including regressions and limits. Use at least 20 plain samples for final action acceptance; report observed maxima without claiming population tail estimates.

Authenticated SillyTavern measurements remain a separate validation step: the audit's fresh browser reached the login page. Local host fixtures establish editor costs; actual host integration, provider availability and GPU smoothness require a suitable live session.

## Delivery sequence

Deliver one architecture in reversible, verified milestones:

1. Establish a clean Main performance baseline and deterministic work counters. Remove isolated ghost/status redraws through narrow renderer channels.
2. Batch scene publications, retain geometry/observers and patch position-dependent routes. Preserve all visual contracts before further invalidation narrowing.
3. Introduce trusted change receipts and coordinate-only reconciliation; remove duplicate editor activation and split Workbench/Details projections.
4. Thread checked preparation artifacts through one edit while retaining raw-root fingerprints. Introduce owned authoring transitions, then revision-qualified registry/planner/index reuse.
5. Consolidate recovery/checkpoint work and replace redundant serialization once the owned projection is proven. Refine structured editor draft work.
6. Rerun representative correctness and matched performance coverage, profile remaining costs and publish the before/after report.

Each milestone must stand on its own and retain a conservative path for unsupported change categories. The implementation plan will define exact edits, tests, ownership and integration order after this written design is approved.
