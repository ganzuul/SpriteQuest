# Canvas Memory Recall Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace artillery vocabulary with clear activation/queue terminology and make recall visible and controllable on nodes, selections, Details, and the Node menu.

**Architecture:** The trusted recall controller owns one ephemeral request per memory set, atomic batches, lifecycle summaries, and exact document ownership. A pure UI projection and one guarded command adapter supply consistent card, Details, menu, and overview contracts. Runtime-only updates use keyed status setters without graph preparation or authored edits.

**Tech Stack:** JavaScript ES modules, Svelte 5, TypeScript declaration/view contracts, existing Node test host, Playwright, current theme/CSS/SVG system; no new dependencies.

**Spec:** [Canvas memory recall design](../specs/2026-10-10-canvas-memory-recall-design.md).

## Global Constraints

- No product-facing Arm, Armed, Disarm, Disarmed, or arming terminology, including accessibility text, diagnostics, authored enum labels, current guides, and shipped example descriptions.
- Live recall queues, claims, document tokens, and status badges never enter workflow files, portable packages, saved settings, Undo history, or modified-file status.
- Queue and Cancel perform zero model requests, generate no reply, publish no text, and write no memory or story document.
- Recall actions operate only in the current unified workflow document and authorized active user/chat/actor scope.
- Same-ID document replacement must revoke old queues, pending claims, shortcuts, and captured UI commands even when graph content is identical.
- Preserve existing actor privacy, source provenance, presence checks, budgets, generation ownership, and success-versus-accepted consumption behavior.
- Add no dependencies and do not redesign unrelated menus, file lifecycle, profiles, or legacy execution.

Retain the spec's serialized compatibility discriminants and schema/version values. Use friendly text and new application-facing APIs; historical records and intentional compatibility fixtures are excluded from the wording sweep.

## Review Focus

1. Reopening an identical graph in another document must invalidate old queues and captured menu/Details actions (Task 1 and Task 4).
2. Several nodes and different physical shortcuts for one memory set must share a request without replenishing or cancelling its pending use (Task 1 and Task 2).
3. A stale or conflicting multi-selection must produce no partial runtime mutation and never fall back to all nodes (Task 1 and Task 4).
4. Queue-state refreshes must preserve an active drag, keyboard focus, unsaved Details drafts, document dirty state, and Undo history (Task 3 and Task 4).
5. Disabled Lattice, automatic-only Recall, compact cards, and minimum zoom must have honest, accessible state without exposing another actor's queues (Task 2, Task 3, and Task 6).

## Execution baseline and file ownership

Planning checkout: `F:/git/SillyCanvas`, main `d047477`, `0.26.0`. The user subsequently approved integration in an isolated worktree.

At execution, inspect `git status`, active artifacts/worktrees, and current instructions. Use the worktree skill to obtain an isolated implementation checkout. Start from a reviewed baseline that includes the workflow-files active-document lifecycle (`activeWorkflow`, `documentSession.capture/stillCurrent`, activation cancellation). If absent, resolve that integration before Task 1; do not implement an assigned-graph fallback. Adapt to integrated legacy-removal/profile cleanup rather than reverting it. The user subsequently approved reconciling main 0.27 into the feature worktree. Merging the feature into main, pushing, releasing, and deployment remain outside this plan.

| Unit | Files and responsibility |
| --- | --- |
| Trusted request state | `src/workflow/recall-state.js`, `.d.ts`: bounded shared policy, atomic mutation, safe lifecycle metadata |
| Native host integration | `src/workflow/native-recall.js`, `.d.ts`, `src/workflow/host.js`, `src/run.js`: exact document ownership, node discovery, capture validation, notifications, facade |
| Friendly vocabulary | New `src/workflow/recall-labels.js`, `.d.ts`; `operations/recall-nodes.js`: shared display labels, retained wire values |
| UI projection and commands | New `src/ui/recall-projection.js`, `.d.ts`, `src/ui/recall-commands.js`, `.d.ts`, `ui/recall-types.ts`: display/capability DTOs and guarded runtime dispatch |
| Status rendering bridge | `src/canvas.js`, `src/canvas/presentation.js`, `ui/CanvasLayer.svelte`, `ui/NodeCard.svelte`, `ui/types.ts`, `style.css`: status-only keyed card updates |
| Details/menus/controller | `src/ui/controller.js`, `src/ui/context-menu.js`, `ui/NodeDetails.svelte`, `ui/detail-types.ts`, `ui/WorkspaceMenus.svelte`, `ui/Toolbar.svelte`, `ui/Workbench.svelte`: scoped controls, activation vocabulary, selection capture |
| Overview | Rename `ui/RecallArms.svelte` to `ui/RecallOverview.svelte`: one row per memory set, friendly status and navigation |
| Documentation/examples | Current operator guides, `examples/unified/unified-recall-memories.json`, generated example data and browser fixtures: accurate current labels and flows |

Do not assign two workers ownership of `controller.js`, `host.js`, or shared view contracts at the same time. Tasks 3 and 4 depend on the contracts in Task 2. Integrated changes are reviewed as one feature.

## Task 1: Shared queue semantics, atomic batches, and document ownership

**Files:** modify `src/workflow/recall-state.js`, `.d.ts`, `src/workflow/native-recall.js`, `.d.ts`, `src/workflow/host.js`, `src/run.js`, `src/ui/recall-shortcuts.js`, and affected existing recall tests. Create `tests/workflow-recall-queue-batch.test.mjs`.

**Interfaces:**

- Rename live application methods/types to queue terminology: state `queue`, `cancel`, `validateRecallQueueProposal`, `RecallQueueProposal`, and `RecallRequestState`; native `queue`, `cancel`; host `queueRecall`, `cancelRecall`. Update owned callers/tests; old persisted discriminants remain exact values.
- State `changeQueues(request: {action:'queue'; proposals:readonly RecallQueueProposal[]} | {action:'cancel'; memorySetIds:readonly string[]}): Result<{changedMemorySetIds:readonly string[]}>`. Single actions delegate to it. Compare actor/memorySet/target/uses/consumeOn policy, excluding physical hotkey identity. `cancel(memorySetId:string)` cancels that shared request and its unconsumed claims; absence is an idempotent no-op.
- `NativeRecallPorts.getActive()` returns `{owner:object, scope:RecallScope, graph:NativeGraph3, signature:string} | null`; `owner` is the exact document activation token supplied through the host by `documentSession.capture()`. Never serialize it. Add native `resetDocument(owner:object|null):void`, delegated by host `resetRecallDocument(owner:object|null):void`. In the existing workflow activation listener, cancel the run and call `resetRecallDocument(documentSession.capture())` even while disabled. A changed owner releases previous slots/listeners/claims immediately; the same exact owner is a no-op.
- Native `captureQueueCommand():Result<RecallCommandCapture>` returns an opaque application-owned capture; no imported object can substitute for it. Native `changeQueues(capture:RecallCommandCapture, request:{action:'queue'|'cancel'; shortcutNodeIds:readonly string[]}):Result<NativeRecallStatus>` revalidates the exact document/scope/signature, resolves/deduplicates policies, then invokes one state batch. Host delegates as `captureRecall` and `changeRecallQueues`.
- `NativeRecallStatus` becomes `{scope:RecallScope|null, version:number, requests:readonly RecallRequestSummary[], shortcuts:readonly RecallShortcutSummary[]}`. Request summaries contain memorySetId, target, uses, consumeOn, queued, remaining, pendingGenerationCount, and pendingState (`null | 'generation' | 'acceptance'`). Shortcut summaries contain nodeId, actorId, memorySetId, validated hotkey and policy. No memory text, owner token, claim object, or private generation IDs are included.
- Add native `subscribe(listener:()=>void):()=>void`; notify after queue/cancel, reservation/release, complete-success/accepted consumption, reset, and scope changes. Subscribe once in `src/run.js` to dispatch existing `pc-recall-state`; do not recursively notify when unchanged status is merely read. Version changes only when display-relevant state changes.

- [x] **Step 1: Write failing behavioral tests.** Use fixtures from existing recall suites; pin these assertions:

```js
// Test: repeated queue and different shortcuts share the pending request.
assert.equal(controller.queue('shortcut-a').ok, true);
const before = controller.status().data.requests;
assert.equal(controller.queue('shortcut-b').ok, true); // same policy, different key
assert.deepEqual(controller.status().data.requests, before);
// Repeat while an owned generation is reserved; its exact claim stays valid.
```

Add named tests for `conflicting batch leaves every set unchanged`, `capacity overflow changes nothing`, `cancel deduplicates matching shortcuts`, `identical document replacement revokes requests and old capture`, `pending state separates generation from acceptance`, `notifications change once per logical transition`, and `disabled re-enabled scope preserves only current-document unspent queues`. Assert zero provider calls and no exported live state. Preserve first-successful-Recall generation dedup and existing failure/Stop/Reject policies.

- [x] **Step 2: Run the new suite and relevant existing suites to see the missing API/behavior fail.**

Run: `node --import ./tools/node-test-host.mjs --test --test-isolation=none tests/workflow-recall-queue-batch.test.mjs tests/workflow-recall-state.test.mjs tests/workflow-recall-nodes.test.mjs tests/workflow-native-recall.test.mjs tests/recall-shortcuts.test.mjs`.

- [x] **Step 3: Implement the declared interfaces and update existing callers.** Preflight bounded plain-data requests and all policy/capacity checks before changing maps. Read coherent authority once for the batch, then perform callback-free synchronous mutation. Preserve current claim object authority and settlement gates. Changing document owner releases every obsolete slot even when IDs/signatures match. Shortcut registration resolves per-node hotkeys, while queue identity resolves per memory set. Replace current runtime diagnostic messages with Queue/Cancel wording; internal runtime error codes also use queue terminology unless an existing external compatibility contract requires the old code. Keep existing bounds of 64 stored request slots, 1024 activation identities, and 32 live scoped native slots; include deduplication and reclaimable inactive slots in preflight capacity calculation. Queue during a pending generation never releases its claim.

- [x] **Step 4: Run all six existing Recall suites plus the new suite.** Include `tests/workflow-recall-registration.test.mjs` and `tests/workflow-native-recall-provenance.test.mjs`. Expected: all pass, no skipped new tests and no provider access. Confirm automatic trigger/privacy/provenance regressions remain intact.

- [x] **Step 5: Commit this deliverable alone.** Stage exact owned files and use a focused queue-semantics commit message.

## Task 2: Friendly labels, shared UI projection, and guarded commands

**Files:** create the vocabulary, projection, command and type files in the ownership table; create `tests/ui-recall-projection.test.mjs`, `tests/ui-recall-commands.test.mjs`, and `tests/recall-labels.test.mjs`; modify `src/workflow/operations/recall-nodes.js`, `ui/types.ts`, `ui/detail-types.ts`, and the integration-toggle callers in `ui/Toolbar.svelte`, `ui/Workbench.svelte`, `src/ui/controller.js`.

**Interfaces:**

- `recallActivationLabel(value:string):string`, `recallUseLabel(value:string):string`, `recallConsumeLabel(value:string):string`, `recallTargetLabel(value:string):string` in `recall-labels.js`. Use the spec's exact friendly labels and an explicit “Unavailable” fallback; never echo unknown raw enum strings. Descriptor title for existing `hotkey-arm` becomes `Recall Shortcut`.
- `projectRecallView(input:{rootGraph:NativeGraph3; status:NativeRecallStatus|null; enabled:boolean; issue?:string; nodeIds:readonly string[]; viewKind:'root'|'instance'|'library'}):RecallProjection` is pure and consumes already prepared/validated inputs. It produces `{nodes, sets, commands, issue}`; `nodes` is keyed by root node ID, `sets` groups memory sets, and `commands` provides queueable/cancellable node IDs, deduplicated Shortcut IDs, counts and disabled reasons for selected/all scopes. Use no runtime resolver, tokenizer, provider, or graph mutation.
- `RecallNodeStatus` contains `{nodeId,memorySetId,state:'unavailable'|'not-queued'|'queued'|'generation'|'acceptance',queued,queueAllowed,cancelAllowed,reason,targetLabel,useLabel,consumeLabel,statusText,remaining,pendingCount,shortcutNodeIds}`. `RecallBadgeView` contains `{state:'queued'|'generation'|'acceptance',tooltip,ariaLabel}`; only a live eligible manual state creates a badge.
- `createRecallCommands(ports)` exposes `capture(nodeIds:readonly string[]):Result<RecallUiCapture>`, `change(capture:RecallUiCapture, action:'queue'|'cancel'):Result<NativeRecallStatus>`, and `openDetails(nodeId:string):void`. Ports are `{readContext, isContextCurrent, captureRecall, changeRecallQueues, openDetails, changed}`; `readContext` returns the exact editor token, document token, selection epoch, prepared root graph, view kind, current selected IDs, and current projection. A private capture retains exact IDs and native capture; it cannot substitute the current selection during dispatch.
- `change` validates editor/document/selection identity, reevaluates eligibility for the captured IDs, rejects stale recall captures, and dispatches one native batch. `changed` refreshes projected status once. Empty/ineligible commands are no-ops with friendly reasons, never an all-nodes fallback.
- Rename integration view property to `enabled`, callback to `setEnabled`, and toolbar text to `Enable Lattice`. Rename Workbench recall view/action property to `recall`. Do not rename persisted settings' existing `enabled` field.

- [x] **Step 1: Write the projection/adapter/label tests.** Pin shared-set and selection behavior:

```js
// Test: three selected cards represent one manual request.
assert.equal(view.commands.selected.queueNodeIds.length, 3);
assert.equal(view.commands.selected.queueMemorySetCount, 1);
assert.deepEqual(view.commands.selected.queueShortcutNodeIds, ['shortcut-a']);
assert.equal(recallUseLabel('until-disarmed'), 'Until cancelled');
assert.equal(recallActivationLabel('armed'), 'Manual queue');
```

Also test automatic-only/missing Shortcut, conflicting Shortcut policy, partial target intersection, unrelated/other-actor/nested/library exclusions, disabled state, known-invalid enum labels, inherited read-only capability, zero/mixed selections, and cancelled/replaced editor/document/selection captures. A missing Shortcut never creates a node or a default key. An enabled invalid workflow retains a useful setup reason.

- [x] **Step 2: Run the three new suites and observe failure.** Run each with `node --import ./tools/node-test-host.mjs tests/<suite>.test.mjs`.

- [x] **Step 3: Implement the contracts and activation vocabulary.** Format physical-key shortcuts using existing rules. Choose a stable representative Shortcut by sorted node ID after verifying compatible policies; retain all keys/nodes for display. Compare queue policy separately from Recall filters; document that independent selections use different memory-set IDs. Centralize all queue/cancel eligibility in this projection and adapter.

- [x] **Step 4: Run the new tests, type check, and existing projection/toolbar tests affected by the view renames.** Run `npm run check:types`; expected no errors. Ensure old serialized workflows still parse and show `Recall Shortcut`.

- [x] **Step 5: Commit the vocabulary/projection/command contracts and their callers/tests.**

## Task 3: Status badges and cheap live canvas updates

**Files:** modify `src/canvas.js`, `src/canvas/presentation.js`, `src/ui/controller.js`, `ui/CanvasLayer.svelte`, `ui/NodeCard.svelte`, `ui/types.ts`, `style.css`; create `tests/canvas-recall-status.test.mjs`, `tests/browser/recall-canvas.spec.mjs`.

**Interfaces:** consume Task 2 `RecallProjection`/`RecallBadgeView`. Add optional `recall?:RecallBadgeView` to `NodeCardData`, `Canvas.setRecallStatus(status:Readonly<Record<string,RecallBadgeView>>):void`, `CanvasLayer.setRecallStatus(status:Readonly<Record<string,RecallBadgeView>>):void`, and `CanvasActions.openRecallDetails(nodeId:string):void`. Keep status in the renderer, separate from saved prepared graph data. Pass it into ordinary node-card drawing and update keyed cards without `setGraph`.

- [x] **Step 1: Write failing rendering/state tests.** Assert linked Recall/Shortcut badges agree, pending overrides green, disabled removes active badges, compact cards retain badges, and removing a request removes all linked badges. With spies on graph preparation, `setGraph`, and geometry measurement, assert a runtime update invokes none; an active drag continues and card/pin/wire coordinates remain unchanged.

- [x] **Step 2: Run `tests/canvas-recall-status.test.mjs` directly and the new browser test with `npx playwright test tests/browser/recall-canvas.spec.mjs`.** Expected failures: missing status setter/badge and interaction.

- [x] **Step 3: Implement the badge and refresh bridge.** Reserve lower-right status space, use 16 CSS px glyph/24 CSS px hit area (44 coarse pointer), and a 10-screen-px minimum painted glyph at zoom 0.25. Give it its own CSS class, green/amber theme tokens, reservation/acceptance markers, tooltip and accessible button name. Stop drag/context shortcut propagation. Badge click/Enter/Space selects the card and opens Memory recall Details; no queue toggle. Preserve compact alias/profile clearance and keyed focus. In the controller, runtime events project and update cards/panels, never prepare the workspace merely to change a badge.

- [x] **Step 4: Run those tests and existing `tests/canvas-presentation-batch.test.mjs`, `tests/canvas-prepared-only.test.mjs`, and `tests/ui-workspace-preparation.test.mjs`, plus `tests/browser/rendering.spec.mjs` and `tests/browser/node-lod.spec.mjs`.** Retain their behavioral checks if integration moves them. Expected: no geometry, drag, profile, preparation, or focus regression.

- [x] **Step 5: Commit the status-rendering deliverable.**

## Task 4: Node/selection context actions and runtime Details controls

**Files:** modify `src/ui/controller.js`, `src/ui/context-menu.js`, `ui/NodeDetails.svelte`, `ui/detail-types.ts`; create `ui/RecallDetails.svelte`, `tests/ui-recall-details.test.mjs`; extend `tests/ui-context-menu-controller.test.mjs`, `tests/browser/context-menu.spec.mjs`, `tests/browser/recall-canvas.spec.mjs`.

**Interfaces:** consume Task 2 projection and command capture. `RecallDetails` props are `{view:RecallNodeStatus; actions:{queue:()=>DetailEditResponse;cancel:()=>DetailEditResponse;revealShortcut:(nodeId:string)=>void}}`. Extend `NodeDetailsView` with optional `recall:RecallNodeStatus`, and `NodeDetailsActions` with `queueRecall(selection:DetailSelection)` and `cancelRecall(selection:DetailSelection)` returning `DetailEditResponse`. These methods use their own runtime pending/error path, not the authored-control `perform()`/commit path.

- [x] **Step 1: Write failing interaction tests.** Assert right-clicking one of three selected relevant nodes retains the selection and yields `Queue recall for 3 nodes`; after queueing a mixed state, Cancel counts only queued eligible cards. Assert unique memory-set hint/count, unrelated node exclusion, zero-eligible disabled action, missing Shortcut explanation, and conflict reason. Open a menu or Details, replace document with identical ID/content, then invoke its captured action: no request in either document changes.

Add `queue status refresh preserves unfinished Details draft and focus`: type an uncommitted control value, queue via shortcut/runtime event, and assert the draft/focused element persist. Assert document dirty snapshot and Undo history unchanged by Queue/Cancel. A policy field edit still goes through normal authoring and invalidates obsolete requests.

- [x] **Step 2: Run the new Details suite and relevant existing context-menu tests to observe failure.** Use direct Node suite commands and `npx playwright test tests/browser/context-menu.spec.mjs tests/browser/recall-canvas.spec.mjs`.

- [x] **Step 3: Add a separated recall context section using captured IDs and existing `showContextMenu` stale guards.** Preserve Canvas's existing multi-selection handling. Add an icon mapping from the private context-menu registry; all labels/counts/reasons come from Task 2. Add `RecallDetails` under the selected root node's Details with shared status, policy/shortcut display and navigation. Queue/Cancel remain runtime operations; policy edits retain existing controls/qualified `DetailSelection` authoring gates.

- [x] **Step 4: Run new tests and existing `ui-detail-draft-revisions`, `ui-details-commands`, `ui-details-projection`, and context-menu suites.** Expected: consistent mutations from context/Details/shortcuts and no uncommitted-draft or stale-context mutation.

- [x] **Step 5: Commit context and Details integration.**

## Task 5: Node-menu global commands and grouped overview

**Files:** rename `ui/RecallArms.svelte` to `ui/RecallOverview.svelte`; modify `ui/WorkspaceMenus.svelte`, `ui/Workbench.svelte`, `ui/recall-types.ts`, `ui/types.ts`, `src/ui/controller.js`, `style.css`; create `tests/ui-recall-overview.test.mjs`, `tests/browser/recall-menu.spec.mjs`; update `tests/ui-workspace-menu-root.test.mjs` and `tests/browser/unified-authoring.spec.mjs`.

**Interfaces:** `RecallOverview` consumes Task 2 memory-set rows and shared queue/cancel adapter; each row includes matching root node IDs/titles and reveal-node actions. Local overlay command is `memory-recall`; single dialog title/heading is `Memory recall`. Workbench `recall` view/actions route refresh, selected/all queue/cancel, and reveal. Reuse the integrated workflow-files renderer's `submenu` descriptor and `subItems()` path to add a `Memory recall` submenu under Node; preserve File/Recent/recovery behavior and do not create a second renderer.

- [x] **Step 1: Write failing navigation/capability tests.** Assert the spec's five commands appear in Node, recall is absent from Tools, selected/all scopes stay distinct, global queue changes only the current authorized root sets, no duplicate overview row appears for matching cards, and rows reveal the correct node. Assert one dialog heading and one Close control; no memory text or raw policy/discriminant strings are rendered. Test all empty states and optional summary count by unique memory sets.

Add keyboard regression: open Node menu with a selected node, press Delete, Space, printable graph shortcuts, then Escape. The graph is unchanged, activation keys run only the focused command, separators/heading never take focus, and Escape restores the opener. Retain existing arrow/Home/End/Tab behavior.

- [x] **Step 2: Run the new overview/menu tests and observe failure.** Run `node --import ./tools/node-test-host.mjs tests/ui-recall-overview.test.mjs` and `npx playwright test tests/browser/recall-menu.spec.mjs`.

- [x] **Step 3: Implement the Node → Memory recall submenu, accurate selected/all capabilities, and grouped overview.** Keep overview supporting the direct canvas flow. Replace old overlay/component/view names throughout owned callers, remove Tools entry, and use exact friendly labels. Global actions capture root/document/scope even from a child view; selection actions in child/library views remain ineligible. If retaining the top badge, label it `Recall queued · N memory sets`.

- [x] **Step 4: Run new tests plus existing workspace-menu, file-menu, and unified-authoring tests.** Update fixtures to the integrated active-document flow and `Enable Lattice`; do not restore removed assignment/selector controls for tests. Expected: zero provider calls for all UI queue/cancel flows and no menu-key leakage.

- [x] **Step 5: Commit overview/menu relocation and browser fixture updates.**

## Task 6: Documentation, compatibility sweep, visual review, and release gates

**Files:** update `README.md`, `docs/README.md`, `docs/unified-workflows.md`, `docs/node-reference.md`, `docs/lattice-workspace.md`, `docs/native-workflows.md`, `docs/operators-manual.md`, `docs/introspection-package.md`, `docs/lattice-reference-library.md`, and `docs/development.md` where current wording exists. Update shipped example descriptions in `examples/unified/`, regenerate `src/workflow/unified-example-data.js` via the current generator, and rebuild `dist/lattice-ui.js`/`dist/lattice.css`. Update affected captures/harness texts and tests; preserve unrelated edits.

**Interfaces:** current operator documentation names only supported product controls and links to the renamed Recall Shortcut section. Existing schema/operation values still round-trip unchanged. Generated artifacts come from their normal tools, not manual edits.

- [x] **Step 1: Extend compatibility/installation/documentation checks before editing guides.** Pin old portable input parsing and serialization with unchanged `hotkey-arm`/activation/use values but new display titles; ensure friendly enum labels and zero restored queue state. Assert local workflow save and exported packages contain no runtime status/capture objects. Use existing installed-import, package, active-document and documentation checks rather than a duplicate serializer suite.

- [x] **Step 2: Update the current guides, descriptor references, example text and generated assets.** Fix heading anchors and links for Recall Shortcut/Memory recall. Teach canvas Queue/Cancel first, then Details/overview; explain automatic activation, shared memory-set grouping, target/repetition/consumption and disabled state. Search current product text for the retired wording; inspect each match, excluding only serialized compatibility constants, historical records, intentional fixtures, and this specification/plan. Do not substitute inside identifiers/semantic hashes.

- [x] **Step 3: Run final integrated checks.**

```powershell
npm run test
npm run check:types
npm run build
npm run check:assets
node --import ./tools/node-test-host.mjs tools/check-documentation.mjs
npm run smoke:install
npm run test:browser
```

Expected: every required gate succeeds with no new skipped tests. If sandbox child spawning fails, use the approved execution environment or individual Node suites with `--test-isolation=none` and run the equivalent complete gate; document the actual command/result instead of claiming a blocked full runner passed. No paid provider or live chat write is required.

- [x] **Step 4: Inspect rendered shipped UI, with screenshots.** Cover normal and compact Recall/Shortcut nodes; zoom 1, overview transition, and minimum .25; current light/dark/custom themes; narrow viewport; keyboard badge/menu use and coarse-pointer sizing. Inspect green queued, amber reserved, amber awaiting acceptance, shared multi-selection, conflicts, and disabled states. Verify badges avoid pins/profile/alias and remain recognizable without changing node geometry. Fix issues and rerun the affected checks before completion.

- [x] **Step 5: Review the integrated diff against every spec acceptance criterion, then commit exact documentation/generated/verification changes.** Record test counts, gate outputs, visual captures, and any genuine limitations in the implementation handoff. No claim of completion while a required gate or acceptance criterion remains unresolved.

## Plan self-review and execution handoff

Coverage: Task 1 owns runtime identity/atomicity/lifecycle/notifications; Task 2 owns vocabulary and all shared eligibility; Task 3 owns status visibility and cheap updates; Task 4 owns local interaction and draft/selection guards; Task 5 owns global commands and overview; Task 6 owns current docs, compatibility, shipped assets and integrated checks. The five Review Focus conditions have tests assigned above. Interfaces use one `recall` view, one shared command adapter, one batch service, and exact document tokens throughout.

Recommended execution method: Native implementation in one isolated checkout, with independent integrated review. These tasks share runtime/view/controller contracts; keeping their integration in one implementer's context reduces coordination risk. Subagent-driven execution remains available if the user prefers per-task independent review.

The user approved implementation in a managed worktree, then explicitly approved reconciling the advanced 0.27 baseline. Native integration uses independently owned state, documentation, and regression reconciliation, followed by independent review.


## Integration record

Implementation worktree: `C:/Users/Keptin/.codex/worktrees/canvas-memory-recall/SillyCanvas`, branch `codex/canvas-memory-recall`, based on main `d047477`. The active-document prerequisite was imported as a selective, tested snapshot from the workflow-files worktree; that checkout was left untouched.

- Task 1: shared request semantics, atomic batches, exact document ownership, lifecycle notifications. The new command token method is `captureQueueCommand`; the existing `capture` producer-provenance method keeps its purpose.
- Task 2: shared friendly labels and typed projection/command contracts. Serialized workflow discriminants retain their compatible values.
- Tasks 3–5: committed together because the renderer, Details, context actions and Node menu share one controller boundary. Runtime refreshes do not author or prepare the graph.
- Review corrections: exact-token cleanup releases inactive/unretained reservations without restoring spent uses; all-node captures have an explicit root scope; local Details/context sections require the root view; pending icons have separate markers and fitted theme colors.
- Example regeneration pins portable teaching recipes to their explicit model-role bindings, preserving their control settings and definition identities while updating prose.

Validation completed on 2026-10-10. The user approved merging main `7d1c0cf` (0.27) into this feature worktree and resolving conflicts. Main remains unchanged; no feature merge into main, push, release or deployment is included.

0.27 reconciliation retains unified-only execution, archive/export-only retired roots, the thirty-lesson curriculum, portable Fast Decision selector cleanup, actor/memory provenance and authorization ordering. Active document sessions/files and canvas recall are layered onto that baseline. New regressions reject retired editable files, schema-2 recovery drafts, direct activation, Open Recent and Recover before changing a dirty document or its authority. All module cache URLs use 0.27.0.

## Final validation

All required gates pass on the reconciled 0.27 worktree:

| Gate | Evidence |
| --- | --- |
| `npm run test` | 256/256 test files passed in the final complete rerun |
| Playwright, CI, port 4189, two workers | 287/287 passed in a complete final run |
| Final document ownership and delayed-save suites | 127/127 host/session cases passed; settlement 15/15 also passed under the repository's preloaded test host |
| `npm run check:types` | 0 errors, 0 warnings |
| `npm run build` | Production assets rebuilt; 173 modules |
| `npm run check:assets` | 505 versioned imports; self-contained Svelte UI; one native domain graph |
| Documentation checker | 11 guides, 227 local links, 75 operations, 20 screenshots |
| `npm run smoke:install` | 149 requests; no errors or missing assets; zero API/provider calls |

Visual inspection covers the current dark theme, a custom light theme, a narrow viewport, normal/compact cards and minimum zoom .25. Queued and pending badges, selection actions, keyboard access and stale captures pass real browser tests. Touch targets measure 44 × 44 at normal zoom; minimum painted glyphs measure 10 × 10. Runtime-only status updates preserve geometry, gestures, drafts, focus, authoring history and document cleanliness.

Independent review found no remaining issues after the exact-document fixes. Document activation clears old run diagnostics even for the identical graph object; late old-document model completions and acceptance saves cannot replace a newer Send's result. Reopening the canvas preserves review authority for a fresh Send completed while closed.

The complete Node gate was rerun after correcting an obsolete fixture's constructor setup for `tools/node-test-host.mjs`; no new tests are skipped. Earlier fixture failures and the document-boundary regressions are resolved. Verification uses local host/provider fixtures and performs no live provider call or chat write. Detailed output and visual captures remain in `.superpowers/sdd/2026-10-10-canvas-memory-recall/` in this worktree.

See the [0.27 integration record](2026-10-10-recall-main-027-integration.md) for baseline preservation and scope. Keep the managed worktree for review; no feature merge into main, push, release or deployment was performed.
