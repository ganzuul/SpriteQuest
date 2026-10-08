# Lattice Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking. The user's autonomous execution and final main-push authorization is recorded in the spec.

**Goal:** Ship the approved Lattice Svelte workspace with functional discovery, graph composition, inspection and editing, then push the verified implementation to the user's main branch.

**Architecture:** Keep Svelte as a typed presentation/callback layer and Canvas as the optimized gesture/geometry owner. Pure native modules prepare/validate/resolve graph changes; one sequential root executor and host controller retain cancellation, connection authentication and reviewed Apply authority. Separate root execution sessions from per-instance editor views.

**Tech Stack:** Node >=24, existing JavaScript domain modules, Svelte 5, TypeScript view contracts, Vite, Node unit tests and Playwright. Local SVG/font assets.

**Spec:** `docs/superpowers/specs/2026-10-08-lattice-workspace-design.md`

## Global Constraints

- Baseline `f20f040b0b1f2c1da82a399642760887cece4ec5`, Lattice 0.19.1, fork `MentallyQuill/Lattice`; implementation branch `codex/lattice-workspace` in the managed worktree.
- Node >=24; preserve existing dependency pins and versioned native imports. Release version 0.20.0 is applied with the repository version tool at final integration.
- Svelte receives plain data/callbacks; no state/compiler/run imports. Canvas keeps keyed mounted nodes/wires, shared graph transform, cached unscaled geometry and frame scheduling. Camera/presentation paths perform zero analysis/binding/freshness/token/lore/request work.
- White LATTICE: Bricolage Grotesque 600, 20px, 0.015em tracking; supplied 30px logo; 4px gap. Bundle font/license. Quote-orange `var(--SmartThemeQuoteColor, #e18a24)` interaction accent. Rounded 4px shells/nodes/popups, 2px compact controls; recessed graph frame and joined active tab.
- Families Input, Shaping, Surface, Transpose, Derive, Output, Subgraphs; unavailable Transpose stays unavailable. Shelf floats outside camera, full canvas remains usable beneath it. Supported widths 1,024/736/360/320px.
- Native schema 3/runtime 2; schema-2 and legacy readers/semantics remain. Envelope pairs workflow 1/1 for schema2, workflow 2/2 for schema3, subgraph 1/2. New envelope limit 2,000,000 UTF-8 bytes; old reader retains 2,000,000-character bound and current plain-data protections.
- Expanded limits 1,000 nodes/2,000 wires/depth8, including bounded non-executable traversal. Single-input cardinality with output fan-out. Portals resolve before validation. Root-only snapshots/Guidance/Apply remain outside subgraphs.
- Immutable pinned definitions; library revisions and local copies are explicit. One root request/cancellation budget; no recursive workflow runners. Exact authenticated connection objects remain private to runtime adapters.
- Presentation preserves recordings/runs; accepted semantic changes invalidate/cancel. Target runs cannot publish Guidance or grant Apply authority. Camera/selection/tab changes cannot call model/host/domain preparation.
- One diagnostic recording: total 4,194,304 bytes, per-artifact 262,144 bytes, rendered text 65,536 bytes; metadata-first deterministic truncation/omission. Full authoritative candidate remains separate and unchanged.
- No automatic model rebuild/retry, remote definitions, execution-result cache or alternative scheduler. Preserve SillyTavern native prompts/extensions and historical aliases/storage readers.
- Independent task reviews and final whole-branch review. Final normal main push is explicitly authorized; no force push and no unrelated untracked files staged.

## Review Focus

1. Unicode/hostile portable packages: new byte caps, old character caps, nested sanitization and unsupported versions fail atomically; Task2/5 tests.
2. Repeated definitions and separator-containing IDs: qualified addresses, cameras, overrides and pins stay independent; Task5/7 tests.
3. Deferred provider completion during tab/pane changes and Stop: preserve valid root completion, reject obsolete/cancelled events and authority; Task6/7 tests.
4. Unfinished unrelated branches versus hidden structural cycles: Run to here permits the former and rejects the latter; Task6 tests.
5. Oversized recordings and externally changed profiles: truncation never changes reviewed candidate, and Apply checks effective-binding freshness without presentation resolver calls; Task6/9 tests.

## Interfaces and file responsibilities

`src/workflow/types.d.ts` defines shared pure DTOs: `Result<T>`, artifact kind, endpoint, addressed node/artifact, direct/portal wire, graph3, definition/ref/interface/parameter, resolved plan, event and recording. JS modules use JSDoc imports; `ui/types.ts` imports types only. `ports.js` owns catalog endpoint compatibility and native editing preparation; `definitions.js` owns bounded snapshots/hash/parameter validation; `resolve.js` owns expanded planning; `insertion.js` owns pure additive remapping; `composition.js` owns conversion/unpack/revision preparation; `transactions.js` owns complete root commits/history. `run-state.js` and `recording.js` own pure progress and bounded diagnostics.

Address keys serialize tuples `[workflowId, instancePath, nodeId, portId]`; never concatenate labels with separators. New direct wires retain `from`/`to` node IDs plus `fromPort`/`toPort`, `route:'wire'`; portal consumers use `route:'portal',portalId,to,toPort` and resolve the publisher from graph.portals. Outputs fan out; each input has cardinality one. Primitive ports are `in`/`out`, absent on sources/terminals as appropriate. Reroute has typed in/out and no requests.

`src/ui/view-state.js` owns root-qualified instance/library view persistence and reconciliation; `src/ui/controller.js` dispatches commands and separates root/view epochs. `src/ui/workflow-surface.js` caches prepared diagnostics/binding/freshness summaries outside selection/camera projection. `ui/Workbench.svelte` owns stable shell surfaces; extracted menus/shelf/tabs/divider/details/preview/manager components consume data/callbacks. Canvas owns transformed cards and wires; shared endpoint geometry supplies renderer and hit testing.

## Task 1: Workspace shell, brand, menus, shelf and divider

**Files:** Modify `ui/Workbench.svelte`, `ui/Toolbar.svelte`, `ui/types.ts`, `src/ui/controller.js`, `src/ui/workbench.js`, `style.css`, asset/install checks as required. Create `ui/WorkspaceMenus.svelte`, `ui/NodeShelf.svelte`, `ui/PaneDivider.svelte`, `ui/GraphTabs.svelte`, local logo/font/license assets. Test `tests/browser/workspace.spec.mjs` and existing workbench/camera lifecycle tests.

**Interfaces:** Consumes existing `WorkbenchView/Actions`, stable `getParts()` and native catalog projection. Produces additive typed workspace/menu/shelf/pane callbacks and stable `canvasHost/sidebar/inspector/preview` refs. Graph1 shell and root workflow controls are functional; instance tabs/recorded output arrive in Tasks7/9.

- [ ] Add one failing browser case proving the divider expands preview/contracts graph while preserving root camera, selection and mounted card identity; run it and capture the expected missing-feature failure.
- [ ] Implement stable shell rearrangement and divider pointer/keyboard/collapse state. Reconcile Canvas cached bounds on pane resize, never fit or project on each tick. Preserve fixed fullscreen host/z-index and narrow layouts.
- [ ] Implement local logo/font lockup, flat eight-menu chrome, root workflow status/actions, recessed joined Graph1 frame and floating family shelf with measured aligned cascades. Route existing legacy/native commands through existing controller actions; do not create fake operations or competing runtime state.
- [ ] Run the new case, Svelte checks and affected workbench/camera tests. Inspect 1,024/736/360/320px, actual local font load, shelf corners/flyouts and attached-tab bevel at multiple DPRs.
- [ ] Commit only Task1 files after a task-scoped spec/quality review.

## Task 2: Shared native schema, named ports and atomic edit preparation

**Files:** Create `src/workflow/types.d.ts`, `src/workflow/ports.js`, `src/workflow/migration.js`; modify `catalog.js`, `contracts.js`, `packages.js`, native dispatch guards in `state.js`, `run.js`, `ui/controller.js`, `ui/workflow-surface.js`, and relevant helpers. Test `tests/workflow-ports.test.mjs` plus existing contracts/packages/state/runtime suites.

**Interfaces:** Produces `isNativeWorkflow(graph)`, `normalizeNativeGraph(graph):Result<NativeGraph3>`, `portsForNode(graph,node):PortDescriptor[]`, `prepareConnection(graph,{from,to,replace}):Result<PreparedGraphEdit>`, `prepareDisconnection(graph,edgeIds):Result<PreparedGraphEdit>`, `validateGraphStructure(graph):Result<StructureDiagnostics>`. Existing schema2 execution remains supported.

- [ ] Incrementally test/fix schema2 normalization: source has no input, terminal no output, IDs/fan-out preserved, ports in/out, presentation ignored in semantics. Example assertion: `normalizeNativeGraph(old).data.wires[0].fromPort === 'out'`.
- [ ] Add typed control descriptors and native Reroute descriptor. Global structural validation handles named direction/type/phase/cardinality/cycles; full execution completeness remains separate. Rejected or duplicate edits leave source graph unchanged.
- [ ] Support exact envelope version pairs and new UTF-8 limits while preserving old native/legacy readers. Update all schema2-only dispatch guards before allowing schema3 saves; unsupported versions never enter legacy compile/lore paths.
- [ ] Test occupied-input replacement, fan-out, self/type/cycle/cardinality rejection, malformed/prototype/accessor data, multibyte caps and legacy keyed-port/wire-mode parity. Run focused unit suites and type/build checks.
- [ ] Commit Task2 after independent review.

## Task 3: Intrinsic normal/compact cards and shared endpoint geometry

**Files:** Modify `src/canvas.js`, `src/canvas/presentation.js`, `ui/CanvasLayer.svelte`, `ui/NodeCard.svelte`, `ui/WireLayer.svelte`, `ui/types.ts`, `style.css`; create focused endpoint geometry helper if needed. Test node/pin geometry in `tests/browser/rendering.spec.mjs`, `selection.spec.mjs` and workspace tests.

**Interfaces:** Consumes Task2 port descriptors; produces cached graph-space endpoint centers and unscaled card width/height used by drawing, snapping, fit/marquee/group frames. Alias/compact fields live in presentation metadata, with native semantic signatures unchanged.

- [ ] Add one failing browser assertion that a native input cable meets its actual left pin center and output meets right pin center at nonidentity zoom, then implement shared endpoint geometry and horizontal native paths. Preserve legacy mode-specific endpoints/loops.
- [ ] Implement intrinsic card rows/widths, compact icon/pins/caption, canonical details identity and escaped alias/F2/reset (80 characters). Source/terminal real endpoints only; separate host-result preview action.
- [ ] Preserve whole-body dragging with 8-screen-pixel native threshold, pin-only linking/hover and cancellation rollback; keep legacy selection/movement semantics. Batch ResizeObserver geometry, never per-pin reads during camera frames.
- [ ] Verify mixed compact/normal nodes, label/body dragging, editor focus and keyed identity; run camera/rendering/selection/parity suites. Check left canvas beneath shelf and no native fixed-width dead space.
- [ ] Commit Task3 after review.

## Task 4: Complete graph transactions and additive import

**Files:** Create `src/workflow/transactions.js`, `src/workflow/insertion.js`; modify `src/history.js`, `src/state.js`, `src/ui/controller.js`, file/menu actions and browser fixtures. Test `tests/workflow-insertion.test.mjs`, `tests/history.test.mjs`, `tests/browser/workspace.spec.mjs`.

**Interfaces:** Produces `prepareWorkflowInsertion(destination,imported,{at,allocateId,viewPath}):Result<{candidate,diagnostics,added,identityMap,baseSignature,baseDocumentSignature}>` and `commitPreparedGraph(root,prepared):Result<CommitSummary>`. Preparation is pure; commit checks root/semantic and editable-document signatures/view, preserves camera/selection, flushes prior history and creates exactly one undo step.

- [ ] Incrementally test repeated imports into populated graph, identity collisions and implicit Analysis/Prose role remapping; recipient roles remain unchanged and imported defaults become explicit namespaced roles.
- [ ] Extend root history to roles/schema/runtime/mode/portals/definition snapshots and instance overrides; exclude recordings/authority/view state. Undo/redo reconcile views and semantic invalidation rather than restoring Apply authority.
- [ ] Add distinct File > Import into graph with review of phase, unresolved bindings, terminals and bound; parse first, reject mismatch/read-only/stale destination atomically, retain relative layout and select added nodes. Default births avoid overlap; explicit drop coordinates remain exact.
- [ ] Test no arm/assign/request/publish/apply side effects, all internal-reference remapping, one-step undo/redo, intervening presentation edits requiring reprepare/preservation and error rollback. Preserve Open workflow behavior and legacy imports.
- [ ] Commit Task4 after review.

## Task 5: Portals, immutable subgraph packages and expanded planning

**Files:** Create `src/workflow/definitions.js`, `src/workflow/resolve.js`, `src/workflow/composition.js`; extend ports/packages/state/library and tests. Test `tests/workflow-composition.test.mjs`, `workflow-packages.test.mjs`, insertion/history fixtures.

**Interfaces:** Produces `validateDefinition(definition,snapshots):Result<DefinitionDiagnostics>`, verified semantic hashes, `resolveWorkflow(root,{target?}):Result<ResolvedPlan>`, pure portal changes and library `installDefinition/createRevision/prepareInstanceUpdate/makeLocalCopy/removeLibraryEntry`; conversion/unpack return PreparedGraphEdit. Resolved plan includes addressed ordered primitives, named edges/dependencies, hierarchy, terminals/target and root/per-node bounds.

- [ ] Test/fix named portal alias resolution, missing publishers, same-input normal+portal conflicts, hidden cycles and scope escape; labels do not affect signatures. Resolve every hidden dependency before planning.
- [ ] Define boundary/interface/exposed-control/ref validation and exact pinned snapshots; hash verified semantic content, handle ID/version conflicts explicitly, recursively strip local profiles/secrets/recordings on portable export. No external definition resolution.
- [ ] Expand nested instances into one DAG with stable tuple addresses, materialized parameter/role/node-binding overrides and preview boundary mappings. Root-only operations forbidden in bodies. Bound recursion/depth8/1,000 nodes/2,000 wires and wrapper/boundary traversal before dispatch.
- [ ] Implement Create from selection/Unpack preparation, library revisions/local copies/explicit update mappings and bundled nested JSON round trips. Root snapshots keep working after shelf deletion; two sibling instances remain independent.
- [ ] Test optional-boundary misuse, unmapped/duplicate ports, wrong phases, malicious nested packages, exact-ref conflicts, separator-containing IDs, shared ancestors versus distinct instances, override materialization and atomic history.
- [ ] Commit Task5 after review.

## Task 5a: Reviewed node-tools handoff and shared domain integration

**Files:** Consume the reviewed isolated Compose/Text Rules/JSON Decode/Select Fields commits and existing Context Join leaf. Extend shared workflow catalog/contracts/ports/types, definition defaults/hash/validation and portable packages; add focused integration fixtures. Runtime/host and UI integration remain Tasks6/9.

**Interfaces:** `PRIMITIVE_OPERATIONS`, `describePrimitive(node,{phase})` and `executePrimitive(node,namedInputs,execution)` supply the four zero-request operations; `describeContextJoin` and `executeContextJoin` supply ordered Context slots. Results are `{ok:true,artifact,reports:[]}` or `{ok:false,error}`. Text/Data are real bounded artifact kinds, separate from portable settings. Each descriptor declares its actual modes, ports, controls, phase and minimum schema.

- [ ] Record exact handoff commits, source ownership and reviewed evidence; bring in only owned commits normally after Task5 review. Preserve the source worktree/evidence until consumed; no source-chat main push. Reuse its passing engine/worker evidence unless integration changes or a concrete issue require rerunning it.
- [ ] Register schema3-only Compose, Text Rules, JSON Decode, Select Fields and Context Join through the shared catalog. Resolve `both` phase against the graph. Extend Text/Data/Context DTOs, safe settings/default materialization and dynamic named ports without admitting new operations to schema2 or legacy execution.
- [ ] Test mode/slot/section changes through complete candidate validation: occupied or removed pins cannot silently lose wires, Context Join slot IDs/order remain stable, label changes remain presentation-only, and invalid changes are atomic. Include mixed new operations inside pinned subgraphs and targeted resolution.
- [ ] Extend portable whitelist, structural profile stripping, semantic signatures and verified definition hashes for the declared operation controls. Round-trip composed/standalone packages with Text/Data boundaries, ordered Context slots and local models removed while portable roles/models remain.
- [ ] Verify zero model/host effects and operation adapter contracts in integration fixtures; keep runtime artifact provenance distinct from portable graph sanitization. Run focused contracts/ports/packages/composition checks and type/asset checks after shared integration. Complete independent Task5a review before Task6 runtime integration.

## Task 6: One executor, safe events, bounded recordings and partial runs

Task6's disjoint run-state/recording foundation may precede Task5a; runtime integration consumes the reviewed shared operation/resolved-plan contracts. Task9 supplies controls and artifact-appropriate previews without duplicate validators.

**Files:** Modify `src/workflow/runtime.js`, `host.js`, `connections.js`, `src/run.js`; create `run-state.js`, `recording.js`; extend types and runtime/host/connection tests.

**Interfaces:** Runtime consumes Task5 resolved plan. `runWorkflow(graph,ports)` gains optional `target/onEvent` while retaining existing callers; observer-safe old onStage remains. `reduceRunState(previous,event):RunState`, `projectRunRows(record,viewPath):RunRow[]` and bounded recording DTOs feed UI. Host adds explicit target run without Guidance/candidate authority and addressed terminal review handles.

- [ ] Add a failing test where two subgraph instances share one outer context but execute their own model nodes, with one root bound/signal and exact authenticated binding objects. Adapt primitive executor to inputs.in/outputs.out and per-address maps; do not recursively call runWorkflow.
- [ ] Publish immutable plan before binding preflight, ordered safe node/request/run events, and derive Failed/Blocked/Not run/cancelled states through pure reducer. Throwing observers and duplicate/out-of-order/obsolete/late events cannot alter execution or resurrect a cancelled run.
- [ ] Implement 4,194,304/262,144/65,536-byte diagnostic limits, metadata-first plan-order retention/omission, safe summaries without owned prompt messages/endpoints, all terminal recordings and authoritative candidate separation. Test oversized multibyte/structured/error artifacts and 1,000-node metadata.
- [ ] Add target-rooted completeness/bindings/bounds; allow missing terminals/unrelated unfinished branch, reject unrelated structural cycle, execute dependencies once and forbid partial publication/Apply. Full root runs retain terminal validation.
- [ ] Capture safe effective-binding provenance; Apply rechecks profiles/source/epoch/graph against private terminal handles, including multiple terminals and external profile changes. Preserve existing Send owned Guidance cleanup, latest reply, save/rollback and exact candidate checks.
- [ ] Run focused runtime/host/connections/compactor/repair suites; commit Task6 after review.

## Task 7: Root execution sessions and independent graph views

**Files:** Create `src/ui/view-state.js`; modify `src/ui/controller.js`, `workflow-surface.js`, Workbench/types/tabs and focused session/view tests.

**Interfaces:** Root WorkflowSession owns root reference/run epoch/recording/authority; view store owns root-qualified instance/library paths, camera/selection/inspector/presentation. Actions `openInstance/focusView/closeView/reopenView/revealParent` never call root switching or fit. UI projection consumes cached prepared diagnostics/binding/freshness summaries.

- [ ] Add a deferred-root-run test that opens/closes/reopens a child view before completion; assert accepted root completion and zero binding/snapshot/token/lore/request/freshness work for view/camera/selection operations.
- [ ] Separate root epoch from view epoch, guard async editor continuations by captured path, and cache preparation outside projections. Preserve cross-root/workbench-close cancellation policies.
- [ ] Persist independent instance/library view state with old graph.view fallback; Graph1 permanent, same path deduplicated, labels/breadcrumbs follow alias, deleted paths reconcile to nearest parent. Read-only bodies reject raw mutations; Make local copy is explicit.
- [ ] Wire double-click/Open graph, child-only breadcrumbs, accessible tab overflow/close/reopen and root-wide controls. Pins remain qualified across tabs/source deletion; never rebind a removed source.
- [ ] Test repeated definitions, nested paths, close/reopen/reload, stale callbacks, read-only gestures and semantic versus presentation invalidation; commit Task7 after review.

## Task 8: Native wire gestures and contextual node search

**Files:** Modify `src/canvas.js`, shared endpoint helper, controller, `ui/WireLayer.svelte`, `ui/NodeCard.svelte`, types; create `ui/NodeSearch.svelte` and pin/portal menu components. Test `tests/browser/connections.spec.mjs`, existing wiring/legacy parity tests.

**Interfaces:** Consumes Task2 validated edit preparation, Task4 commit/history, Task5 portal/instance descriptors and Task7 view guards. Canvas gesture DTO captures origin endpoint/view/original bindings/drop graph point; Svelte chooser/menu only dispatches selections.

- [ ] Test/fix live pin drag in both directions, validated direct connections and compatible/incompatible feedback. Genuine empty drop opens Context sensitive chooser with retained draft; select/create/connect is one transaction at captured graph point, independent of popup clamping/reflow.
- [ ] Add wire multi-select/Delete/Backspace with editable-control protection, Alt cable/pin disconnect plus rapid-double-click guard, pin hover and pin-specific break/jump menu. Preserve deleted topology on reload.
- [ ] Add atomic Ctrl input/output moves and exact typed reroute double-click, preserving originals on rejection/cancel. Escape/pointercancel/lostcapture/blur/view switch clear state. Real fresh-page MMB pan establishes keyboard ownership and Escape rollback without tab-order changes.
- [ ] Verify hidden portal cycles, occupied input replacement, fan-out, exact nonidentity zoom placement/geometry and no invalid/no-op run cancellation. Run legacy mode/double-click parity and camera geometry/identity checks.
- [ ] Commit Task8 after review.

## Task 9: Focused details, preview/progress and composition managers

**Files:** Split `ui/WorkflowSurface.svelte` into focused `NodeDetails.svelte`, `WorkflowSetup.svelte`, `OutputPreview.svelte`, `RunDetails.svelte`, `SubgraphManager.svelte`, `PortalManager.svelte`; update workflow/controller projections, types and browser acceptance.

**Interfaces:** Consumes Task6 run/recording/terminal authority DTOs, Task7 addressed view/pin actions and Task5/8 composition commands. Existing adapter entry points remain stable or are changed coherently with callers.

- [ ] Add one meaningful selected-node test: canonical type/alias/control/model inheritance in right details, root setup elsewhere, semantic control edit stales/cancels while alias/compact/selection preserves run. Deterministic nodes omit unnecessary model fields.
- [ ] Implement appropriate artifact input/output/original/changes previews, Not run/Current/Stale/removed status, pin/follow behavior and explicit Run to here with request bound. Only selected fresh root terminal review enables Apply through host private handle.
- [ ] Project active/failed/blocked/cancelled/invalid states to cards, shared three-row 4px/2px/12-column meter and hierarchical run details. Stable plan-order rows, >36 aggregation, explicit navigation, truthful elapsed/request/usage, reduced-motion readability.
- [ ] Implement full Subgraphs shelf manager, boundary/exposed-parameter editor, revisions/update mapping/local copy, JSON install/export/insert, conversion/unpack and deletion retaining instances. Implement Manage portals/P/convert wire/output scope/rename/consumer/source/restore controls.
- [ ] Test failed-stage partial artifacts, multiple terminals, truncation without candidate mutation, profile freshness, pinned source deletion, library read-only guards, repeated-instance overrides, portable file round trips and zero implicit model calls. Inspect desktop/narrow/theme/bevel layouts.
- [ ] Commit Task9 after review.

## Task 10: Integration, release checks and main push

**Files:** Regenerated `dist/lattice-ui.js`, version-tool outputs, documentation/getting-started/help/example updates, reviewed test/evidence fixes only.

**Interfaces:** Complete end-user flow from examples/import through graph editing/subgraph reuse, explicit execution/inspection and reviewed terminal application. All prior task interfaces are integrated.

- [ ] Apply 0.20.0 using `tools/bump-version.mjs` after inspecting its usage; preserve legacy identifiers and update native query versions coherently. Regenerate bundle and local asset/install manifests.
- [ ] Run `npm run check`, `npm run smoke:install` and matched `npm run benchmark -- --quick`; compare against `benchmark-results/baseline-workspace.json`. Verify camera/drag identity, zero height/domain reads and no material unexplained regression; timings include environment limits.
- [ ] Capture and inspect approved layouts at 1,024/736/360/320px, compact/normal/failed/running states and tab joins at DPR1/1.25/2/4. Resolve integration findings through one focused implementation/re-review round as needed.
- [ ] Dispatch independent whole-branch review with spec, plan, ledger, full diff and validation evidence. Resolve material findings, then commit release/integration results. No unresolved load-bearing defects before main push.
- [ ] Use network-enabled GitHub CLI with explicit `--repo MentallyQuill/Lattice` for remote checks; expired token requires user reauthentication. Fetch remote main, integrate concurrent changes normally and rerun affected verification. Push non-forcibly to main only when final reviewed commit is ready, then verify remote main SHA matches.
- [ ] Update goal complete only after remote verification; report release/commit, verification and any material limitations. Keep unrelated root checkout files intact and archive managed worktree only when no longer needed.

## Execution ledger and review recovery

Use the plan-owned ignored `.superpowers/sdd/2026-10-08-lattice-workspace/` workspace for task briefs/reports/review packages/progress. The first ledger line names this plan. Record baseline, authorization, interface/shared-file scan, task commits/verifications/reviews and rulings before proceeding. After compaction, trust ledger and git log; never redo completed tasks. Reviews receive exact task brief/report and a complete scoped diff. Independent work can be delegated only with disjoint file ownership and serialized commits; dependent edits/rebuilds remain sequential.
