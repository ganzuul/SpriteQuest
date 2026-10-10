# Open Examples Implementation Plan

> **For agentic workers:** Use test-first implementation and independent task ownership. Continue through integration and verification in this session.

**Goal:** Clicking any of the thirty compact example tiles opens a real, independently editable native workflow as Lattice's current workflow.

**Architecture:** Materialize the approved authoring catalog into portable single-phase native packages and a bundled local data module. Preflight and clone every member of a recipe before publishing any roots. Project thumbnails from those actual packages, and activate the primary copy through the existing workspace controller.

**Tech Stack:** Native JavaScript modules, Svelte 5, TypeScript view contracts, Node tests, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-09-lattice-examples-browser-design.md`

## Global Constraints

- Keep all thirty tamer names, fixed simple-to-complex order, node-specific settings, teaching notes, native comment frames, and final subgraphs.
- File > Open examples… goes immediately below Open workflow…. Workflows > Workflow examples… opens the same picker.
- Approximately 560 × 430 px, three columns, 72 px canvas previews; two columns on narrow screens. No search, sorting, filters, detail pane, or second confirmation.
- Opening performs no provider request, reply application, memory write, automatic phase assignment, or arming.
- Validate all companions before mutation; install fresh collision-safe copies; persist activeGraphId; preserve existing graphs, phase bindings, and enabled state.
- Examples have unresolved local model roles and no credentials, live chat IDs, or memory snapshots. Memory sources/effects remain in roots; Pre/Post remain separate.
- Preserve existing concurrent workspace edits. Work in the current checkout because the feature integrates with its uncommitted native loader/subgraph changes. No commits, resets, pushes, or worktree creation are part of this request.
- Runtime source imports use `?v=0.26.0`; compiled UI remains self-contained.

## Review Focus

- Reopening the same tile produces an isolated copy and a distinct name; edits cannot mutate the canonical example or previous copies.
- A malformed companion cannot leave a partially installed bundle or change the active root.
- Selecting a tile from a pinned subgraph view activates the real primary root and expires stale callbacks.
- Invalid JSON, model-binding mode, and boundary-control drafts survive returning to their qualified node addresses.
- Last tiles, long names, narrow screens, keyboard activation/Escape, scroll retention, and focus return remain usable.

## Task 1: Native packages and atomic fresh-copy installation

**Owner:** examples packages worker.
**Files:** `tools/build-roleplay-examples.mjs`, `examples/roleplay/*.json`, `src/workflow/example-data.js`, `src/workflow/examples.js`, corresponding declaration file, `tests/workflow-examples.test.mjs`.
**Interfaces:** `listWorkflowExamples()` returns `{id, number, title, goal, graph}` for the thirty primary native graphs; `installWorkflowExample(id, settings)` returns a Result containing `{graph, companions}` and atomically adds prepared fresh copies to `settings.graphs`. It does not save, assign phases, or activate roots.

- [x] Write and observe a failing test for thirty complete native packages, resolved supported roles/call bounds, six valid embedded definition drafts, and customized node settings.
- [x] Materialize nodes/settings/typed wires, derive comment frames, lay out root and definition bodies, generate portable files and local module.
- [x] Run the package test to green.
- [x] Add one failing installation test at a time for isolation, names, unknown IDs, malformed companions, and untouched unrelated settings; implement atomic admission/cloning and verify each.

## Task 2: Compact picker and actual-package thumbnail projection

**Owner:** examples UI worker.
**Files:** `ui/ExamplesBrowser.svelte`, `ui/WorkspaceMenus.svelte`, `ui/Workbench.svelte`, `ui/types.ts`, `src/ui/example-catalog.js`, matching declaration file, `tests/ui-example-catalog.test.mjs`, `tests/browser/examples.spec.mjs`.
**Interfaces:** `projectWorkflowExamples()` supplies `WorkbenchView.examples` as typed tile/thumbnail data. `WorkbenchActions.openExample(id)` returns boolean or Promise<boolean>; close the picker only on true.

- [x] Write and observe a failing package-thumbnail projection test.
- [x] Render named native cards, typed named ports/wires, and comment-frame bounds from the delivered graph data; cache stable projections.
- [x] Add the compact picker with simple clickable buttons, retained scroll, native focus trap, Escape/close, and existing theme roles.
- [x] Route both menu entries to it, immediately below File Open workflow.
- [x] Write/observe browser failure before implementation where feasible; verify dimensions, thirty thumbnails/order, last tile, narrow layout, successful opening, keyboard and focus behavior after controller integration.

## Task 3: Preserve qualified inspector drafts

**Owner:** details draft worker.
**Files:** `ui/NodeDetails.svelte`, scoped Node Details/browser tests.

- [x] Write and observe a failing test for an invalid JSON draft across a qualified node/root switch and return.
- [x] Cache local draft state by full existing qualified selection identity, expire pending request callbacks, and restore only controls supported by the current node revision.
- [x] Preserve binding mode/value and boundary configuration drafts with focused failing-then-passing tests. Do not auto-commit any invalid input or alter committed graphs.

## Task 4: Controller activation, execution evidence, build, and review

**Owner:** primary agent.
**Files:** `src/ui/controller.js`, `tests/ui-workflow-activation.test.mjs` or scoped `tests/ui-examples.test.mjs`, documentation.

- [x] Write/observe a failing controller test for primary activeGraphId persistence after opening.
- [x] Call the atomic installer, select the returned primary graph, save, use setCanvasGraph/renderAll, and fit after settled layout with current-root guards.
- [x] Pass cached tile projections and openExample action to the Workbench; keep failures open and report them through existing toast diagnostics.
- [x] Verify companion graph availability, repeated copies, editing/saving/exporting, no implicit host effects, and final embedded subgraph opening.
- [x] Execute meaningful zero-call recipes with fixtures and model-backed recipes with deterministic test adapters; do not make paid/live provider requests.
- [x] Run affected native/controller/browser tests, full Node tests, type checks, build, and asset checks. Inspect the real picker and opened advanced graph.
- [x] Obtain an independent scoped code review; fix concrete findings; update documentation to distinguish delivered functionality from remaining external model setup.

## Progress

- Baseline: workflow package, file command, and root menu tests pass (19 tests). Windows test subprocesses require the already-authorized escalated Node runner.
- Read-only conversion audit: all 37 native roots and six definitions pass current validation; variant call ceilings/roles match.
- Execution is authorized by the user's correction that the entire purpose of Open examples is loading workflows, following the previously approved picker/design. Continue without another approval round.

- Delivered: 30 lessons, 37 native phase packages, and six pinned definitions. Each opening installs independent copies and selects the primary; companion installation is atomic.
- Catalog review fix: per-entry admission and preview diagnostics isolate bad bundles; catalog refresh runs after Canvas construction, catches whole-catalog failures, and supports Retry. Independent rereview found no remaining actionable issues.
- Deferred example fitting is guarded against root changes, closure, and entering a child view. A failing child-navigation regression now passes.
- Inspector lifetime: Close hides the persistent Workbench, so its drafts survive reopening. An actual component unmount/remount test confirms a new workspace cannot inherit the old cache.
- Final verification: 153/153 Node test files; 18/18 examples/File/Details browser checks and 12/12 workspace integration checks on the final build; zero Svelte errors/warnings; production build and 299-import asset check passed; scoped diff whitespace check passed.
- Seven synthetic native execution fixtures verify literal briefs, structured guidance, literal/glossary reviewed edits, bounded prose review, empty memory recall, and replay-safe message counting. No live provider requests were made.
- Inspected actual desktop/narrow pickers and an opened editable subgraph. The real desktop capture is docs/images/examples-picker.png; operator and developer documentation now describe delivered loading.
- Documentation link/image checks found no new issues. Its sole failure is an existing blanket regex false positive for the accurate phrase 'legacy angle-token macros' in docs/node-reference.md:76; that unrelated reference was preserved.