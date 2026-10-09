# Task C checkpoint

Status: safe checkpoint for replacement with the user-requested GPT-6.1 Sol Ultra agent. Implementation is unfinished. No production files have changed.

## Files written

- `tests/ui-native-only-workspace.test.mjs`: four RED assertions for unconditional shell, no legacy mounts, actual Setup examples/no mode selector, shared frame geometry/no fallback tab, no schema-2 selector, pure current admission/controller imports.
- `.superpowers/sdd/2026-10-09-lattice-native-only/task-C-rewrite.py`: prepared transformation script, **not successfully run**. It contains proposed UI/projection transformations and component deletions. Read/review before any execution. Its first production write to `src/ui/workflow-surface.js` failed `PermissionError`; thus none of its transformations were applied.
- This report.

## RED evidence

`node --import ./tools/node-test-host.mjs tests/ui-native-only-workspace.test.mjs`: all four tests fail on expected existing legacy paths (conditional mounts, Setup mode, theme/fallback tabs, current admission branches). The node launcher works directly. `node tools/test-all.mjs ui-native-only-workspace` fails to spawn Node (`EPERM`) in this restricted environment.

## Interfaces agreed with ROOT / B

- State needed: `ctx`, `safe`, `settings`, `save`, `allGraphs`, `getGraph`, `createGraph`, `duplicateGraph`, `deleteGraph`, `touchGraph`, `commitGraphEdit`, `stepGraphHistory`, `resolveGraph`, `exportGraph`, `importGraph`, `onGraphTouched`, presentation group APIs as actually needed (`groupNodes`, `ungroup`, `groupMembers`, `createBlanket`, `inOffGroup`). ROOT retains those focused APIs. No legacy `NODE_TYPES`/`WIRE_KINDS`/roles/bindings/node/connect/folder dependencies.
- Import `workflowSignature` directly from `src/workflow/runtime.js`; `run.js` is now only current facade/controller/init/status/callCount.
- B is writing `src/workflow/clipboard.js`: `makeClip(graph,nodeIds):Result<portable fragment>`, `readClip(string/value):Result<fragment>`, `prepareClipPaste(graph,fragment,{position?,catalog?}):Result<{graph,insertedNodeIds,insertedEdgeIds,idMap}>`. Controller owns navigator clipboard I/O, last detached clip, captured qualified transaction and `prepareGraphCandidate` wrapper. Plain text pastes create Compose with `sections:[{name:'pasted_text',text}]`, phase-appropriate output kind.
- B requires prepared card for current note nodes (preparation currently skips notes): `canonicalTitle:'Note'`, `family:'Organization'`, current note `iconPath`, `body:node.content`, `ports:[]`, `hostResult:false`. All nodes need prepared nativeCards; raw renderer fallback is being removed.
- Library uses only current load/get/install/revise/remove subgraph functions.
- Current result projections must use bounded recording/opaque review handles only; remove all legacy results/artifact/calls branches.

## Reading/context already completed

Read task-C-brief.md, design spec, using-superpowers (subagent skip), TDD skill. Read controller native segments/lifecycle/build/history/import/managers, all owned components/types, projection/session/preparation, current test files and prototype CSS reference. No Git, browser, full build, provider or credential actions occurred.

## Implementation plan / useful source boundaries

`src/ui/controller.js` is ~4,380 lines, most retired UI. Rewrite it by retaining native preparation/navigation/preview/groups/detail actions/managers and reviewed import/history, replacing whole legacy body. Native portions: beginning through `defaultNodeSpot`; current lifecycle/build currently at lines ~409–657; import CRUD/review at ~3805–3946; capture/detail/wire bridge/native delete/managers at ~4248 to EOF. Remove all legacy compiler/library/ST inspector/seeding/preview/token exports. Current `currentPreviewHandle` keeps the correct explicit selected root terminal authority; schema2 helpers immediately before it must be removed.

Preserve `captureEditor`, `editorCurrent`, `scopeCommand`, `commitCaptured`, qualified node/portal/subgraph managers, graph view session, field drafts, root run epoch independent of navigation/camera. Replace all normalizeNativeGraph and schema rebasing with direct current APIs/cloneWorkflowDocument. Root execution must not restart/cancel merely on tab/camera changes.

UI: shell is currently conditional `class:pc-native-workspace`, `StatusBar`, `DomainSurface`, fallback controls and tabs. Render `class="pc-root pc-native-workspace"` unconditionally, bind real Details DOM instead of DomainSurface parts, keep actual OutputPreview/NodeDetails/RunMeter, remove library/sidebar buttons and use Subgraphs. Remove mode UI/actions/types, schema2 selectors, legacy result union and mountWorkflowSurface. Delete DomainSurface/StatusBar/CanvasControls/WorkflowSurface and src/ui/domain-surfaces.js / graph-analysis.js. Update tests formerly using WorkflowSurface into actual Setup / OutputPreview current component tests.

Style: existing native shell style lives mainly in Workbench.svelte and style.css bottom (~1504 onward); old CSS before it carries retired inspector/cards/status/library. Need remove obsolete CSS while retaining generic Canvas/groups/menu/theme plus current native shell. Default palette must be Lattice independently of host CSS; explicit custom theme must not change shell geometry. Prototype unchanged hash required; preview 240px, Details 258px, joined tabs/canvas orange border, rounded recessed surfaces. ROOT performs actual production browser/frame comparison.

## Remaining verification

Focused component/projection/session/preparation/menu tests need porting off migration/schema2 fixtures. Run direct Node per-file commands in this environment, then types after interfaces settle. ROOT handles full suite/build/browser/prototype performance. Report exact owned file list and check results when finished.

## Blocking environment fact

Normal shell script writes into managed worktree are denied by sandbox. `apply_patch` writes succeeded. Replacement agent should use `apply_patch` for production edits or ROOT-authorized sandbox escalation for script mutation. Do not re-run pending script casually.
