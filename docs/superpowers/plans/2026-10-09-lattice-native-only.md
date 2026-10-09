# Lattice native-only implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development for independently owned segments. ROOT owns integration, shared state/host facade, tests/tooling, release and all staging/commits. Do not revert another worker's edits.

**Goal:** Remove both retired graph engines/compatibility paths and make the approved Lattice workspace the fresh default.

**Architecture:** Preserve the current typed workflow/domain contracts and optimized Svelte renderer. Replace the mixed entry/state/controller adapters with focused current-only adapters. There is one supported workflow format and no migration or fallback renderer.

**Tech stack:** Existing JS domain modules, typed Svelte 5 components, Node and Playwright. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-09-lattice-native-only-design.md`.

## Global constraints

- Respect explicit no-legacy/no-backwards-compatibility authorization; no automatic conversion or old namespace reads.
- Current documents schema3/runtime2; phase values native-pre/native-post. Current workflow envelopes schema2/minRuntime2; current subgraph envelopes schema1/minRuntime2. Package cap2,000,000 UTF-8 bytes.
- Settings namespace lattice/schema1, first launch Structured guidance, disabled and unassigned. No implicit model/Send/Apply calls.
- Preserve private authority/freshness/cancellation, source snapshots, completion evidence, fixed connections, request caps and diagnostic limits.
- Exact approved prototype remains the visual reference. Keep custom themes explicit and preserve stable camera geometry/identity.
- Use existing isolated C worktree; F checkout/unrelated files stay intact. ROOT alone commits and pushes normally using network-enabled GitHub CLI checks. No live provider calls needed.

## Review focus

1. Fresh host settings containing old prompt-canvas data: create Lattice separately without reading, converting, arming or deleting old data.
2. Old or malformed files/storage: explicit rejection/diagnostic, no fallback renderer, mutation, accessor execution or model call.
3. Real host CSS/default launch: approved chrome/card/pin geometry must appear immediately, not only after installing a fixture.
4. Subgraph/terminal Apply: current result/recording cleanup must preserve opaque authority, qualified paths, fresh source/profile and full candidates.
5. Removed imports in copied installation: no old compiler/support modules, aliases or hidden dependency remains; Worker and public host helpers still load.

## Task A: Current document/runtime boundary

**Owner:** contracts/runtime worker.
**Files:** `src/workflow/{contracts,document,graph-validation,packages,ports,insertion,transactions,composition*,connection-edits,definition-*,runtime,host,recording,run-state,types.d.ts,starters}.js` as needed; remove `migration.js` and `legacy-insertion.js`; all four workflow JSON examples. Owner has exclusive workflow-module writes; root retains connections/providers unless a current-only cleanup is necessary and announced.
**Interfaces:** Produce `cloneWorkflowDocument(graph):Result<NativeGraph3>` in document.js, `isWorkflowGraph(graph)` and current validation in contracts.js. Preserve current transaction/resolver/host APIs and addressed result shape. UI/root/Canvas replace their own imports.

- [ ] Add RED admission tests rejecting schema1/schema2/old brand/raw packages and accepting exact current workflow/subgraph formats with byte bounds/unfinished graphs.
- [ ] Remove primitive validation, migration, legacy insertion/signatures, old result DTOs/selectors and previous-brand cleanup. Preserve bounded safe current data, authority, cancellation and authoring/semantic identities.
- [ ] Generate all four current named-pin starters directly, preserve formations/bindings/request bounds, regenerate portable examples.
- [ ] Port native domain assertions that depended on early schemas/results; remove only retired-format acceptance tests. Own focused contract/package/ports/transaction/insertion tests; root ports runtime/host orchestration suites after freeze.
- [ ] Run focused meaningful Node tests/syntax, report exact changes and remaining integrations; freeze for ROOT review.

## Task B: Prepared-only renderer and current clipboard

**Owner:** Canvas worker.
**Files:** `src/canvas.js`, `src/canvas/presentation.js`, `ui/{CanvasLayer,NodeCard,WireLayer,GroupCard}.svelte`, current clipboard module; relevant renderer types with UI owner coordination. Remove `src/clip.js` after callers switch. Keep camera/frame/geometry/selection modules unless necessary.
**Interfaces:** Keep Canvas lifecycle/setGraph/setTrace/view/Fit/cancellation/native-wire hooks used by the current controller. Only prepared named-pin DTOs are admissible. Clipboard exports current fragment creation/read/prepare-paste, using current insertion; no graph mutation before ROOT controller commits captured edits.

- [ ] Add RED tests proving no fallback legacy card/top-bottom endpoints/loop labels or old clipboard reader and correct current named/compact/host-terminal projection.
- [ ] Remove old type/icon/rule maps, library drops, token/compiler analysis, legacy linking/hover strips, Decider/State/group routing pins, together/loop/wire-mode code and unprepared graph fallback.
- [ ] Preserve real pin/body gestures, pointer cancellation, reverse drops/context search, modifier editing, reroutes, readonly scopes, group enclosure/collapse, camera/editor focus and keyed rendering.
- [ ] Use current portable fragment clipboard with fresh identities, definition closure/bindings, captured insertion/undo and strict package admission. UI owner wires commands.
- [ ] Run focused renderer/camera/clipboard tests and Svelte checks when shared contracts settle; report/freeze exact owned files.

## Task C: One Svelte workspace/controller

**Owner:** UI/controller worker.
**Files:** `src/ui/{controller,workflow-surface,workspace-preparation,workbench,node-palette,native-search-catalog,native-wire-bridge}.js` as needed; `ui/{Workbench,Toolbar,WorkspaceMenus,NodeShelf,WorkflowSetup,GraphTabs,entry,types.ts,view-types.ts,detail-types.ts}.svelte/js/ts`; `style.css`. Remove domain-surfaces.js/graph-analysis.js and DomainSurface/StatusBar/CanvasControls/WorkflowSurface components. Canvas components belong to B.
**Interfaces:** Keep public UI open/close/toggle/isOpen/refreshIfOpen; remove token/legacy preview exports. Keep pure current prepareWorkflowProjection/projectPreparedWorkflow/createWorkflowSession. Consume ROOT state and TaskA document/current result APIs, TaskB prepared Canvas/clipboard; report any required new state API before implementation.

- [ ] Add RED current component checks: single renderer/shell, no legacy mode/rows/components, no old schema2 selector, consistent frame/tab geometry and actual Setup examples.
- [ ] Rewrite mixed controller into current activation/captured transactions/managers/history/import/clipboard/menu/context/keyboard/field-draft actions; remove compiler/library/ST seeding/legacy inspector and preview code rather than hiding it.
- [ ] Render approved shell unconditionally and remove its native-only style gates/fallback tabs; use default Lattice palette and explicit custom-theme settings, unchanged qualified node details/preview/meter.
- [ ] Keep root execution across view changes, independent cameras/tabs, read-only library/instances, pending native gestures and current reviewed terminal targeting.
- [ ] Run focused component/projection/session tests, type checks after shared interfaces settle; report/freeze exact owned files.

## Task D: Fresh state, host facade, installation and acceptance

**Owner:** ROOT, parallel with A/B/C on disjoint files.
**Files:** `index.js`, `src/{state,run,library,theme,theme-editor,ui}.js`, host settings/API fixtures; native startup/state/host/runtime test ports; tools/browser harness/acceptance/docs after source freeze. Retired support files deleted only after import closure.
**Interfaces:** Preserve focused settings/graph CRUD/history/group APIs required by A/B/C. New library module contains only validated subgraph persistence. run.js exposes only current native host facade/controller/send labels/request bounds. Namespace lattice/schema1; no workflowMode or old globals/hooks.

- [ ] Add RED first-init tests with old namespace present: independent current starter, no reads of old data, disabled/unassigned/zero effects, current settings validation and graph CRUD/history.
- [ ] Rewrite state, current facade and entry integration; delete final-prompt replacement/event handlers, old alias globals/commands, old settings/result/thought/state integrations. Keep actual public busy/swipe/token helpers and freshness subscriptions.
- [ ] Remove obsolete support files, old theme aliases/roles and dependencies after all owners switch imports. Preserve current Lattice default palette, quote accent and explicit theme editor choices.
- [ ] Port native runtime/host/freshness/Apply suites to current result/recording APIs without losing safeguards. Remove strictly retired tests; update shared mocks/helpers.
- [ ] Rewrite actual browser harness reset/graph loading and smoke/install/capture/benchmark/live-harness summaries for current graphs. Retain opt-in/request reservations; do not run live calls.
- [ ] Add actual fresh-default browser coverage under host CSS, including no old controls/pins, default palette/join/recess, shelf/details/preview; preserve meaningful native gestures/history/root/child/library/drafts/Run/Apply/cancellation/performance checks.

## Task E: Removal audit and release

**Owner:** ROOT plus one independent final reviewer after sources freeze.

- [ ] Verify production import graph contains none of the removed modules/legacy symbols/old namespaces/readers/mode branches; add a meaningful installed-dependency assertion. No compatibility shims or dead fallback code.
- [ ] Rewrite active README/workspace/connection guides; retain attribution/licenses and clearly historical records. Default screenshots must show an actual fresh production launch and real deterministic run.
- [ ] Bump0.21.0 with reviewed version tool; build JS/CSS, run full Node/type/build/assets/browser checks, clean-install smoke and current typed-workflow camera benchmark. Compare prior performance with its different graph scope explicitly disclosed.
- [ ] Inspect actual production screenshots at1024/736/360/320, child/compact/multi-pin/failed/running/drawers and fractional/high-DPR joins against the approved mockup. Check installed SillyTavern where available without reading private chat or making model requests.
- [ ] Independent final review of actual deletion, current native safeguards, fresh/default visual evidence and integration; resolve material findings and commit complete cleanup.
- [ ] Fresh network-enabled gh auth/fetch/main checks, normal integration/push, exact remote SHA verification and safe F checkout fast-forward. Preserve unrelated files and ignored evidence.

## Execution notes

The explicit scope change and existing autonomous implementation approval govern this plan. No new top-level task or inferred goal is created. ROOT records accepted source checkpoints/current evidence in `.superpowers/sdd/2026-10-09-lattice-native-only/`, serializes commits, and performs final visual acceptance on the default experience rather than a manually selected native fixture.
