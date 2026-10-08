# Silly Canvas Svelte UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. The user's blanket approval authorizes continuous native execution; request a fresh whole-branch review after implementation.

**Goal:** Deliver a smooth Svelte canvas/workbench with ComfyUI-style selection while retaining Silly Canvas graph and prompt behavior.

**Architecture:** Keep domain modules authoritative. Separate frame-scheduled camera and selection from graph projections, mount stable keyed Svelte views, and expose specialized native editors through explicit adapters. Commit compiled UI assets for ordinary extension installs.

**Tech Stack:** Node.js >=24, Svelte 5, Vite, JavaScript domain modules, typed Svelte boundary props, Node test runner/jsdom, Playwright Chromium.

**Spec:** `docs/superpowers/specs/2026-10-07-svelte-ui-migration-design.md`

## Global Constraints

- Node.js >=24 is the development runtime; users install compiled extension assets.
- Svelte 5 and Vite are build dependencies; the shipped UI requires no build step.
- The existing `prompt-canvas` settings key and graph JSON format remain compatible.
- Existing module version queries must resolve each domain module to one instance.
- `src/state.js`, `src/compile.js`, `src/run.js`, memory, lore, and generation hooks remain authoritative.
- Node vertical position remains semantically significant to prompt order.
- Camera limits remain 0.25–2.5; fit-to-view remains capped at 1.2.
- Existing CSS classes used by tests and extension integrations remain available.
- No production model call, live-chat edit, package publication, or shared-branch merge is needed for verification.
- PomegranateUI remains read-only; preserve license notices for any copied source.

## Review Focus

- Negative positions and very tall Decider/State cards: selection and wires use actual graph bounds.
- Gesture cancellation after blur, graph switch or close: no stuck pan mode or half-committed undo action.
- Ctrl/Shift/Alt combinations and sub-threshold drags: predictable selection and text controls keep native input behavior.
- Delayed token/model responses after graph switch: updates belong to the original graph and never interrupt current input.
- Production cache-busting and reopen: one domain state instance and one active set of event handlers.

## Task 1: Reproducible baseline and verification tooling

**Files:** Create `package.json`, `tools/test-all.mjs`, `tools/serve-harness.mjs`, `tests/browser/harness.html`, `tests/browser/harness.js`, `playwright.config.mjs`; modify `.gitignore`; retain all existing test sources.

**Interfaces:** Consumes the existing `tests/*.test.mjs` and `tests/mock.js`. Produces `npm.cmd test` (all existing and new Node tests), `npm.cmd run test:browser`, and a localhost-only mock-host harness. The harness exposes `window.canvasHarness` with graph/domain access, selection, camera, and reset without production network calls.

- [x] Establish the clean existing baseline with Node and a locally available jsdom runtime; record every pre-existing failure by name.
- [x] Add the minimal reproducible development dependencies and scripts, pinning resolved versions in the lockfile.
- [x] Add a browser smoke fixture opening the real extension UI and asserting a visible Output card, usable canvas host, and zero page errors; verify RED for unavailable harness then GREEN after the harness is implemented.
- [x] Verify `npm.cmd test` and `npm.cmd run test:browser`; keep full logs outside source.
- [x] Commit the baseline/tooling deliverable.

## Task 2: Camera fast path and frame scheduler

**Files:** Create `src/canvas/camera.js`, `src/canvas/frame.js`, `tests/camera.test.mjs`, `tests/frame.test.mjs`, `tests/canvas-performance.test.mjs`; modify `src/canvas.js` and `style.css`.

**Interfaces:** Camera exports `zoomAt(view, factor, point) -> boolean`, `wheelFactor(delta, mode, height) -> number`, `graphPoint(view, point) -> {x,y}`. Scheduler exports `createFrameScheduler(render, {request,cancel}) -> {schedule,flush,cancel,destroy}`. Canvas retains `zoomBy`, `applyTransform`, `fit`, `toGraph` and its existing hooks.

- [x] RED: a rendered graph retains the exact wire/node elements and wire path data after zoom; instrument browser layout count and require zero endpoint measurements on camera-only work.
- [x] GREEN: remove wire redraw from zoom/fit and isolate viewport/background updates.
- [x] RED/GREEN one case at a time for wheel zero delta, actual magnitude, line/page normalization, clamp and cursor anchoring. Assert hand-checked graph coordinates and zoom bounds.
- [x] RED/GREEN scheduler tests: many schedules yield one pending frame, flush applies final state once, cancel/destroy cannot invoke pending work.
- [x] Integrate frame scheduling into wheel/pan and flush on gesture completion; eliminate full-screen blur and apply gesture classes to suppress wire filters.
- [x] Run `npm.cmd test` and camera browser tests; commit.

## Task 3: Selection utilities and ComfyUI gestures

**Files:** Create `src/canvas/selection.js`, `tests/selection-gestures.test.mjs`, `tests/browser/selection.spec.mjs`; modify `src/canvas.js`, `src/ui.js`, `style.css`.

**Interfaces:** Exports `selectionMode(modifiers) -> 'replace'|'add'|'remove'`, `rectangle(a,b) -> {x,y,w,h}`, `intersects(rect,box) -> boolean`, `combineSelection(initial,hits,mode) -> Set<string>`. Canvas adds `selectAll()`, `fitSelection()`, `cancelGesture()`, and a Select/Pan mode setter; existing `setMulti`, hooks and group protections remain authoritative.

- [x] RED/GREEN true empty left-drag rectangle selection in all directions at non-default camera transforms, including partial intersection and negative coordinates.
- [x] RED/GREEN additive Shift/Ctrl/Cmd and subtractive Alt marquee using the initial selection; Alt precedence is explicit.
- [x] RED/GREEN Ctrl/Cmd toggle click, Shift add click, stationary selected-member click versus whole-selection drag, and the 4 px screen threshold.
- [x] RED/GREEN middle/Space pan starting over nodes without selection changes, selected-set drag with relative positions, and one undo step.
- [x] RED/GREEN live rectangle feedback, folded-group units, select-all, group selection shortcut, selection fit, Escape/blur/capture cancellation, and typing exclusions.
- [x] Verify all existing UI tests and real pointer browser tests; document the new gestures and commit.

## Task 4: Geometry and graph-analysis caches

**Files:** Create `src/canvas/geometry.js`, `src/ui/graph-analysis.js`, relevant Node/browser tests; modify `src/canvas.js`, `src/ui.js`.

**Interfaces:** Geometry cache exposes measured size lookup/update/invalidation and wire adjacency by node ID. Analysis builds duplication counts and Generate wave info once per render/revision and exposes `copiesOf(node)` / `waveInfo(node)` lookups to the current Canvas hooks. It is invalidated on graph topology/domain changes, never on camera changes.

- [x] RED/GREEN one analysis per full render with multiple cards; wire changes invalidate it and camera changes do not.
- [x] RED/GREEN measuring tall and folded cards in a read batch, then producing all endpoints without per-wire DOM reads.
- [x] RED/GREEN node/multi/group drag updates only moved elements and incident wire geometry, while unaffected cards/paths retain identity.
- [x] RED/GREEN ResizeObserver dimension changes, fallback measurement, group fold/unfold and removed IDs cannot leave stale endpoints.
- [x] Verify existing group/wiring/loop/trace/token behavior and measured large-graph work; commit.

## Task 5: Svelte canvas renderer and committed build

**Files:** Create `ui/entry.js`, `ui/CanvasLayer.svelte`, `ui/NodeCard.svelte`, `ui/GroupCard.svelte`, `ui/WireLayer.svelte`, `ui/types.ts`, `vite.config.mjs`, `tsconfig.json`, `tools/check-assets.mjs`, `src/canvas/presentation.js`, committed `dist/lattice-ui.js`; modify `src/canvas.js`, build scripts and version tooling as needed.

**Interfaces:** Compiled entry exports `mountCanvas(target, callbacks) -> {viewport,svg,nodeLayer,setNodes,setGroups,setWires,destroy}`. Presentation data has stable IDs and graph-space coordinates. Components import only UI types/helpers and Svelte, with domain data supplied as props/callbacks. Existing controller methods consume returned DOM anchors and preserve public APIs.

- [x] RED/GREEN browser identity assertions across graph card updates, selection, tokens, camera motion and theme changes against the Svelte entry.
- [x] Implement node/group projections for all node types, chips, conditions, named/stage/tie ports, models, wave/duplication labels, enablement and trace state; port the actual visible card markup into Svelte.
- [x] Implement keyed SVG hit/visible/label entries for normal, activate, result, append/prepend, save, loop, conditional and together paths; preserve context/double-click behavior.
- [x] Keep geometry outside component render effects; ResizeObserver feeds measured dimensions back into the controller.
- [x] Verify fresh build, typed component props, existing Node/jsdom UI parity and real browser canvas interactions.
- [x] Verify committed relative ESM assets, one domain module instance and no dev URLs; commit.

## Task 6: Svelte workbench, controls and explicit domain adapters

**Files:** Create `ui/Workbench.svelte`, `ui/Toolbar.svelte`, `ui/StatusBar.svelte`, `ui/CanvasControls.svelte`, `ui/DomainSurface.svelte`, `src/ui/workbench.js`, focused UI adapter/controller modules; modify `src/ui.js`, `style.css` and compiled assets.

**Interfaces:** Entry exports `mountWorkbench(target, actions) -> {root,parts,update,destroy}`. Parts preserve header, graphSelect, arm, status, sidebar, canvasHost, inspector, preview and pane anchors where legacy tests/contracts use them. Svelte owns header actions, graph picker, mode/zoom controls, pane hierarchy and presentation; domain surfaces have explicit renderer/revision contracts.

- [x] RED/GREEN production entry open/close/reopen and public UI exports use the same domain graph and one mounted workbench.
- [x] Replace native shell construction with accessible Svelte controls and callbacks; preserve selectors while adding labels, state and keyboard support.
- [x] Move graph picker/status/selection/mode data through a headless projection/update boundary. Camera changes update only camera controls at most once per frame.
- [x] Place rich existing inspector/library/preview/State/theme/model builders behind named, focused adapters. Preserve typed input focus and do not remount specialized surfaces for unrelated token/camera updates.
- [x] RED/GREEN stale async results after graph switch and keyboard shortcuts in textarea/contenteditable inputs.
- [x] Verify domain/UI/browser suites, typecheck, assets, and desktop/narrow visual layouts; commit.

## Task 7: Parity, performance, polish and whole-branch review

**Files:** Extend `tests/browser/*.spec.mjs`, `tools/benchmark-canvas.mjs`, `README.md`; create `docs/svelte-ui-migration.md`, matched benchmark evidence; update spec/plan/progress to reflect actual implementation and committed assets.

**Interfaces:** `npm.cmd run check` runs the whole Node suite, build/type/asset checks and browser tests. `npm.cmd run benchmark` produces matched 25/100/250-node camera and drag cases with theme and layout metrics.

- [x] Complete feature matrix for each node type, group mode, wire kind/mode, clipboard/library, undo/redo, preview/tokens, State/theme/model controls and host lifecycle.
- [x] Run matched Chromium benchmarks and verify deterministic camera/identity/scheduler budgets plus local p95 <=1 ms camera handling and median <=18 ms / p95 <=25 ms steady frames.
- [x] Inspect real desktop/narrow screenshots and refine spacing/focus/contrast without reintroducing slow paint effects; verify reduced-motion behavior.
- [x] Run full `npm.cmd run check`, fresh production install/harness smoke, and reproducible build comparison. Record limitations and adapter boundaries explicitly.
- [x] Commit final source, generated assets and documentation, then request a fresh-context whole-branch review against the spec, plan and ledger.
- [x] Address important findings with RED/GREEN evidence; rerun affected checks and whole suite where warranted.
- [x] Mark the goal complete only after the full acceptance contract is met; hand off the committed branch and concise verification evidence.

## Execution ledger

Use this plan's ignored `.superpowers/sdd/2026-10-07-svelte-ui-migration/progress.md`.
Record task baselines/commits, RED/GREEN outcomes, interface pre-flight and every
ruling. The scripts are Bash-oriented; if Windows cannot invoke them safely,
record equivalent task-start/task-done commands and preserve the same ledger
contract. Never rerun completed tasks after compaction: trust ledger and commits.
