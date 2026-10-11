# LATTICE Performance Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove broad synchronous work from node editing and motion, with measured latency improvements and preserved authoring safety.

**Architecture:** Retain the existing Svelte application and public raw-data admission APIs. Add narrow renderer channels, privately owned checked preparation artifacts, trusted transaction change summaries, dependency-qualified projections and a single recovery publication boundary. Conservative raw mutation paths remain checked.

**Tech Stack:** Node >=24, JavaScript with JSDoc/TypeScript contracts, Svelte 5, Vite, node:test, Playwright. No new product dependencies.

**Spec:** [Approved design](../specs/2026-10-10-lattice-performance-overhaul-design.md).

**Authorization:** The user approved execution and implementation on 2026-10-10 and requested no further approval asks. Use parallel agents for independent file ownership and root integration for coupled authority/lifecycle work. Preserve the managed worktree and branch.

## Global Constraints

- Preserve workflow meaning, validation, qualified definition ownership, undo/redo, document saving, recovery, draft editing and existing visual behavior.
- Keep the current application, document formats, component layout and operation behavior. Introduce no new product dependency or worker in the initial overhaul.
- Camera, selection and persistence timestamps neither stale a valid edit nor get rewound by it.
- Preserve immediate in-memory recovery for admitted authored commits.
- Host generations qualify display caches only; they never replace binding re-resolution, execution/apply-time freshness checks, chat/reply/swipe/prompt identity checks or the final synchronous check immediately before host mutation.
- Native Save As invokes its picker synchronously before awaiting other work.
- Raw mutable-root APIs retain fingerprint/admission checks; revision-only reuse requires owned immutable snapshots and covered writes.
- Root serializes builds, staging and commits. Agents edit only assigned files and do not revert concurrent work.

## Review Focus

1. Folded members retain qualified geometry and remeasure when invalidated/remounted; active previews follow endpoint movement/resizing.
2. Equal semantic definition pins can contain different presentation/local bindings; combined registries still need aggregate validation.
3. A stale asynchronous Details acknowledgment cannot clear a restored/newer draft; its own successful commit acknowledgment can clear the submitted generation.
4. A settings-owner/document change cannot let an old view-save timer encode the replacement; host debounce gives no disk acknowledgment.
5. Raw callers can mutate roots/candidates and supply accessors; fast paths must not turn ordinary DTOs into authority.

## File ownership and execution

Canvas lane owns `src/canvas.js`, `src/canvas/**`, `ui/CanvasLayer.svelte`, `ui/NodeCard.svelte`, `ui/WireLayer.svelte` if present, canvas exports in `ui/entry.js`, `tests/canvas-fixture.mjs`, and canvas/browser tests.

Domain lane owns `src/workflow/transactions.js`, `prepared-graph-edit.js`, `definition-library.js`, `graph-validation.js`, `resolve.js`, `composition-views.js`, related checked preparation modules/types and workflow tests. It does not change host execution/apply authority.

Projection lane owns `src/ui/workspace-preparation.js`, `workflow-surface.js`, `ui/NodeDetails.svelte`, `StructuredControl.svelte`, `Workbench.svelte`, structured editor helpers and projection/Details tests. Coordinate scene publication remains the root controller's responsibility.

Root owns `src/state.js`, `src/ui/controller.js`, `graph-view-session.js`, `document-session.js`, recovery helpers, integration tests, measurement tools/reports and generated distribution output. Domain/projection lanes expose additive contracts and preserve current exports.

### Task 1: Narrow renderer channels and retained geometry

**Files:** Canvas lane above; add focused geometry/update helpers under `src/canvas/` when separating responsibilities.

**Interfaces:** Preserve existing `setGraph`, `setPositions`, `setTrace`, `setRecallStatus`, selection and native-wire bridge APIs. Add `setWirePreview(ghost)` and `setVisualStatus(trace)` in the mount adapter. Add a batched scene publication method to the adapter, with a matching test fixture export. Keep layer DTOs stable by qualified view/card identity; constructor/graph activation handles view lifetime.

- [x] Write failing work-count tests: trace-only and free ghost motion do zero full renders, settled-route publications and card/pin reads; selection/focus/classes remain correct.
- [x] Run focused tests with `node --import ./tools/node-test-host.mjs tests/<owned-test>.test.mjs`; record the intended failure.
- [x] Implement separate ghost/status slots, one classification per admitted scene, batched Svelte assignments, retained observer/geometry entries and dirty-card measurement. Cache layout by explicit content/port/font/layout contracts, not graph object identity or outer size alone.
- [x] Add coverage for one dirty card, stale/removal callbacks, fold/remount, active endpoint movement, optical wrapped pins, LOD/focus and drag cancellation. Patch incident routes on motion and preserve unchanged card/wire identities.
- [x] Run all affected canvas unit tests. Root runs type/build and browser rendering, artifact-pins, node-lod, connection-curves and interactions after lane completion.
- [x] Save a report with red/green evidence and exact methods available for controller integration. Root reviews and commits.

### Task 2: Owned preparation, registry/planner reuse and trusted change receipts

**Files:** Domain lane above; add focused checked-artifact module(s) under `src/workflow/` as needed.

**Interfaces:** Preserve raw `captureGraphEditContext`, `commitPreparedGraph`, `prepareGraphCandidate`, `prepareQualifiedScopeEdit`, `prepareNativeNodeEdit`, `prepareWorkflowPlanner`, `preparedWorkflowExpansion`, and `inspectDefinitionGraph` signatures. Add `committedGraphChange(root, summary)` returning a privately verified change record or null; coordinate records expose affected node/group IDs and admitted candidate artifacts. Add `prepareDefinitionRegistry(snapshots)` / `inspectPreparedDefinition(registry, ref)` with privately branded, immutable owned data; public DTO cloning cannot transfer brands. Expose artifact reuse through explicit owned tokens, never mutable identity alone. Communicate these interfaces before dependent integration.

- [x] Write failing tests for bounded target memoization/identity, registry-wide admission reuse, foreign/cloned/replayed receipts, coordinate classification versus nonsemantic comments/ownership, and tamper/mutation-between-capture-and-commit rejection.
- [x] Run the focused workflow suites and record expected failures before implementation.
- [x] Thread checked base/candidate artifacts through internal prepare/commit. Keep full raw-root fingerprints and protected/context/ownership checks. Use graphHistoryStamp generation/revision plus privately owned checked artifacts at controlled transitions in place of separate authored/execution/presentation/registry stamps; preserve exact content/context admission and history freshness.
- [x] Implement one checked registry admission per combination, including unused entries and aggregate conflicts/limits. Reuse unchanged immutable definitions and qualified expansion artifacts; exact semantic pins alone cannot key full presentation/binding snapshots.
- [x] Memoize root and admitted inventory target summaries after getter-free target admission; arbitrary invalid input is never retained. Preserve historical planner snapshot answers and current resolver completeness/native-boundary semantics. Reuse effective port metadata within checked scopes.
- [x] Derive trusted coordinate-only impact from the complete admitted transition; retain unknown/full refresh and raw public candidate validation. Return null for a receipt whose root/committed content no longer matches. Keep camera/selection/timestamps outside stale checks.
- [x] Run transactions, state transactions, prepared planning, resolver parity, definition/library/qualified composition and legacy canonical-hash tests. Save red/green evidence; root reviews and commits.

### Task 3: Linear workspace preparation and stable Details projections

**Files:** Projection lane above.

**Interfaces:** Preserve `prepareWorkspaceViews`, `prepareLibraryViews`, `projectEditorDraw`, `projectWorkspacePanels`, `prepareWorkflowProjection`, `projectPreparedWorkflow`, and Svelte action payloads. Consume Task 2 checked registry/planner artifacts when available. Add a producer-supplied `editorContractKey` to Details DTOs; its identity excludes activation/revision/request tokens. Memoized display DTOs remain immutable; edit-token envelopes still advance when authority changes.

- [x] Write failing tests for linear endpoint attachment construction, lazy selected-target summaries, unchanged Details/schema/run DTO reuse on unrelated updates, and draft/ack contract changes.
- [x] Run focused projection/Details tests and record intended failures.
- [x] Build incoming/outgoing/portal/group indexes once; share checked registry inspection for library views. Request root plus selected target summaries lazily. Avoid whole-root reclassification from per-node rendering.
- [x] Separate selected authored controls/schema, preview, runtime rows and host capabilities by dependency. Keep stable immutable references on unrelated camera/runtime updates and supply the editor contract key without repeated support serialization.
- [x] Refactor structured local drafts to update typed draft data without full stringify/parse per input; lazily mount hidden advanced editors where draft/focus semantics permit. Group controls in one pass.
- [x] Preserve ordinary close/reopen and cross-document-return drafts. Clear cache on destruction/incompatible contract, distinguish truly different same-ID documents, and scope ack by namespace/visit/generation/current contract. Test own-commit acknowledgment after displayed revision advances.
- [x] Run projection/preparation unit suites and root runs node-details, details-overhaul and workflow-data-details browser coverage. Save red/green evidence; root reviews and commits.

### Task 4: Granular controller reconciliation, recovery and checkpoint lifecycle

**Files:** Root lane above; new `src/ui/recovery-coordinator.js` if needed; state/document/graph-view/controller integration tests.

**Interfaces:** Consume Task 2 `committedGraphChange(root, summary)` and Task 1 scene/status/position methods. Add `graphViews.applyPreparedPatch(change, preparedPatch)` checked against current root/view context. Recovery coordinator captures `{settingsOwner, documentToken, authoredRevision, viewsRevision, settingsRevision}` and exposes synchronous `request`, `flush`, `invalidate` with explicit Result/reporting semantics. Keep current file/view/activation APIs synchronous.

- [x] Write failing integration tests: coordinate-only root release performs one reconciliation, retains editor bridge/planner/Details/selection and creates one undo entry; comments/ownership cannot use that path.
- [x] Write failing recovery tests: one encoding per admitted authored transaction; latest view wins; settings-only saves work; stale owner/document timers fail; immediate authored recovery remains detached plain data; file-save snapshot/dirty behavior and native picker activation stay correct.
- [x] Run tests and record each expected failure before product edits.
- [x] Publish root positions and remove obsolete coordinate overlays atomically through applyCommittedCoordinates(summary), patch prepared/draw state, and remove duplicate postcommit activation. Preserve conservative refresh for unknown/qualified/ownership changes until checked support exists.
- [x] Retain selected-content projections across layout/runtime-only changes and perform one assignment per Workbench update. Qualify preview/run/host state independently; host authority checks remain unchanged.
- [x] Centralize recovery ticket ownership, coalesce authored transaction encodings, submit settings-only saves without recovery encoding, and retain failed payloads for retry. Finalize admitted authored recovery immediately. Existing view debounce remains 180ms with captured owner/document tickets. Flush synchronously at lifecycle boundaries and submit through the captured host boundary; report failure independently from file checkpoint success.
- [ ] Cache checkpoint comparisons only for owned authored graph/presentation revisions. Deferred: public roots remain mutable, so dirty comparisons retain complete canonical snapshots. Undo-to-checkpoint and same-ID acknowledgment correctness are implemented and verified.
- [x] Run affected state/document/view/controller/history/Details tests; root reviews integration and commits.

- [ ] General revision-keyed recovery encoding reuse and one global Workbench reconciliation publication. Deferred; narrower transaction batching and exact-activation intermediate dirty-render deferral are implemented.

### Task 5: Measurement harness and before/after report

**Files:** `docs/research/artifacts/editor-latency/audit-editor-latency.mjs`, measurement helpers, new result/provenance/report artifacts, `tools/benchmark-canvas.mjs` only if useful.

**Interfaces:** Preserve existing probe defaults/reproduction. Add explicit plain motion sampling and bounded motion repeat/event/frame options, keeping plain timing separate from instrumented counts. Retain provider/network guards and exact build/source hashes.

- [x] Add guard/summary tests for new probe options and plain/instrumented sample separation, then demonstrate expected failure.
- [x] Implement the minimum measurement extensions. Run a bounded smoke fixture before the long final measurement.
- [x] Run matched 25/100/250-node CPU-rate-1 action measurements with at least 20 plain repetitions, plus five plain 45-frame/six-event gestures after warmup; report P95/worst/threshold/release and observed maxima. Retain CPU-rate-4 stress separately where useful.
- [x] Exercise mixed graph, nested definitions/populated library, groups/wrapped pins and large Details content. Use an available authenticated host only if accessible; otherwise state the exact remaining host limitation.
- [x] Save raw results, runtime/source/build provenance and the user-facing report. Check artifact hashes and local links. Do not claim targets passed unless measured; profile and fix residual bottlenecks before final acceptance.

### Task 6: Final verification, independent review and delivery

**Files:** Entire changed branch; generated `dist/lattice-ui.js` / `dist/lattice.css`; final report/plan progress.

- [x] Run `npm test`, `npm run check:types`, `npm run build`, `npm run check:assets`, and `npm run test:browser` sequentially where shared build/fixture state requires it. Run install smoke if its local fixture is supported.
- [x] Create an exact branch diff/review package from documentation baseline `0c37e66`, including lane reports and relevant test evidence. Dispatch independent spec/quality review; fix material findings and rerun affected checks.
- [x] Verify the final build/source matches saved measurements, the working tree contains only intended changes, and generated assets are committed with source.
- [x] Update the plan/ledger and final before/after report. Keep the local performance branch and managed worktree available for review; no shared-branch merge or deployment is part of this request.

## Implementation substitutions and final verification

Source commit `e8420427f196bcdae7aa16d5fe01eef59bde7a9c` passes 279/279 isolated unit test files, 336/336 browser tests on fresh CI port 4210, type checks (0 errors/0 warnings), build, 544 versioned asset imports and fresh install smoke. The frozen unit/browser runs used disjoint fixtures/storage concurrently; no timing run overlapped them.

Task 2 uses the existing graphHistoryStamp generation/revision plus privately owned checked artifacts instead of separate authored/execution/presentation/registry counters. Full raw-root content admission and exact context/observer checks remain. Task 4 implements a narrower verified root-coordinate patch instead of the proposed general applyPreparedPatch API. Recovery coordination lives in state.js with captured settings owner, document activation and callable identity; the proposed standalone coordinator/revision tuple was not introduced.

The checkpoint revision cache, general same-revision recovery encoding cache and global Workbench publication batch remain deferred. Canonical dirty comparisons preserve raw mutation detection; local committed reconciliation removes one duplicate comparison while preserving immediate source/saved/activation updates and final observer mutations. These substitutions are intentional scope/authority choices, not claims that the original cache steps were completed.

## Measured acceptance status

The full Main/final cohorts each contain 600 plain action samples and 60 plain gestures; final supplemental releases contain 20 gestures per size. All probes report zero browser errors, blocked requests and provider calls. Primary frame targets pass 59/60 gestures; supplemental drag frames also pass 59/60 gestures, while drag release passes 3/3 sizes. Committed action medians at 100/250 nodes remain above goal, with the 250-node shelf sample maximum also above goal. The delivery report includes every case and retains the slower final 100-node cohort.

- [ ] Meet all numeric latency/frame goals on this fixture. Remaining costs and next safe optimization priorities are recorded in the report.
- [ ] Establish latency in an authenticated SillyTavern session and physical GPU/trusted-input conditions. The available fresh host browser reached login; synthetic local measurements cannot establish this.
