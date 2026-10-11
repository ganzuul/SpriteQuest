# Node guides implementation plan

Goal: Give every operation and structural node an approachable guide in Details, including a complete graph example that can be added to the active tab.

Architecture: A checked content registry supplies prose and catalog-backed settings. Examples reuse admitted lesson graphs and focused authored graphs. A presentation-only preview adapter renders the existing NodeCard and CanvasLayer. The controller owns captured, atomic insertion through existing graph editing APIs.

Tech stack: Svelte 5, JavaScript with declaration contracts, Node assertions and Playwright.

Spec: The approved conversation and `docs/workshop/compose-guide/mini-canvas-design.md`. Execution is explicitly authorized by the user.

Global constraints: Preserve existing work. No provider calls from previews or insertion. Native theme and renderer throughout. Fixed selected node above How to use it; settings expanded; example below settings and collapsed; full-width, roughly square example; footer Add example to current tab; no screenshot assets, zoom controls, percent readout or gesture helper. Guide close restores focus and isolates shortcuts. Graph insertion preserves unrelated content and is one undoable action with fresh identities and visible incompatibility reasons.

Review focus: Coverage and prose accuracy for all 74 operations, Note, Comment, Subgraph, Subgraph Input and Subgraph Output; actual ports and current controls; complete admitted examples; lazy preview cleanup; disabled/import/stale context handling; theme inheritance and accessibility.

## Task 1: Guide content and examples

Own `src/ui/node-guide-content.js`, its declaration, `src/workflow/node-guide-examples.js`, its declaration, and focused catalog/example tests. Inventory current operations and structural types, author concise summaries and steps, and explain every effective control including mode-specific controls. Reuse complete lesson graphs where appropriate and add missing focused examples. Return detached, admitted graphs with setup notes and exact sample file data where required. Verify catalog coverage, settings coverage and example validity; execute deterministic examples with mocked host where practical.

## Task 2: Native preview renderer

Own `ui/NodeGuidePreview.svelte`, `ui/NodeGuideCanvas.svelte`, `src/ui/node-guide-preview.js` and its declaration, plus focused tests. Render existing NodeCard and CanvasLayer from checked prepared graphs. Use measured pins and existing connection routing, inherit current theme, isolate gestures, and clean up observers. Canvas accepts a footer snippet; parent owns insertion button. Test preparation purity and routing geometry; integration tests cover mount and resize.

## Task 3: Example insertion

Own `src/workflow/node-guide-insertion.js`, its declaration and tests. Accept an authored example and destination scope. Reuse portable clipboard insertion and graph candidates. Empty compatible roots receive full examples; compatible existing lifecycle nodes are reused only when their configuration and connections allow the complete example without overwriting custom work. Other cases return a plain actionable disabled reason. Rebase every imported identity, strip local bindings, preserve destination, and return a single prepared mutation plus selected/revealed node identities. Verify full and merged Compose runtime, occupied ports, read-only/helper scope constraints, fresh IDs and mutation purity.

## Task 4: Details integration

Root owns `ui/NodeGuide.svelte`, guide types/projection, NodeDetails/Workbench/types integration and `src/ui/controller.js` changes. Open guides from a visible help button in each node identity header. Project selected prepared card and guide from current effective node; use real current control labels. Keep disclosure defaults and render example only while expanded. Capture active editor context at insertion, commit once, select/reveal new nodes, and show failures inline. Close stale selection guides and restore focus. Add controller and browser tests incrementally, including structural nodes, themes, keyboard and undo.

## Task 5: Review and verification

Run targeted tests, complete unit suite, Svelte/type checks, production build, asset checks and browser suite. Review combined feature independently, fix concrete findings and rerun affected checks. Update user documentation and report verified coverage and any required example setup accurately. Leave changes on the feature branch for review; do not push or merge.

## Execution record

Implemented all 79 guides, current-node previews, expanded settings, lazy collapsed examples, native themed canvases, and captured one-undo insertion. File-backed lessons include exact copyable setup data and model lessons name their required connections. Independent review corrected auxiliary Item Use Trigger setup and Repair's Patches/Candidate wording. Visual QA found and repaired Comment frame overflow using display-only compact layout; authored graph geometry stays unchanged.

Verification on 2026-10-10:

- Complete unit run: 270/270 test files passed. After the final Comment layout fix, the affected preview suite passed 13/13 tests.
- Complete browser run: 351/351 passed. After rebuilding the final Comment fix, all 11 guide browser checks passed, including four additional Comment/Note desktop and narrow-screen checks.
- Svelte/type check: zero errors and warnings.
- Production build and asset checks passed; the UI remains self-contained and imports one native domain module graph.
- Whitespace check passed. Preview and insertion tests made no provider calls; deterministic example execution uses a synthetic host.

Changes remain uncommitted on `codex/node-guides` for review. Main has not been merged into or advanced, and nothing was pushed.
