# Lattice interaction polish review

Date: 2026-10-09

Branch: `codex/lattice-interaction-polish`

Baseline: `ca19c51` (0.22.0)

Reviewed product version: 0.22.1
Reviewer: independent read-only review agent

## Final verdict

Accepted with no remaining actionable production findings against the baseline. The final shared functional and visual gates passed. The interaction profile shows substantial selection and drag-initiation improvements, with a remaining large-graph drag-release cost documented below.

The review covered the chat launcher and search dismissal, shelf and tab styling, Details resizing and persistence, immediate guarded keyboard deletion, pin and loose-wire feedback, keyed canvas rendering, gesture cancellation, edit authority, view persistence, and history boundaries. The shelf changed from 43px to 28px, meeting the requested 15px reduction. Settled wire routing remains unchanged; the new simple curve applies to a loose drag endpoint.

## Confirmed regressions corrected during review

| Finding | Trigger and correction | Regression evidence |
| --- | --- | --- |
| Idle native bridge retained a ghost wire | Release could queue wire cleanup, followed by cancellation of the queued frame after the bridge became idle. Cancellation now removes the ghost and reapplies focus using cached wire views without rebuilding cards or routes. | A real native release-then-cancel test verifies ghost and pin-focus removal, preserved card identity, and zero cleanup card presentations or commands. |
| Explicit presentation edits saved stale view snapshots | Moving all serialization into a debounce left comment commits, root position cleanup, and scoped portal aliases stale in settings within the same turn. Explicit callers now snapshot synchronously; only live selection and camera hooks defer serialization. External saving remains debounced. | Actual persistence-helper tests cover comment commit/Undo/Redo, root position cleanup, scoped portal aliases, and zero serialization during a camera burst followed by one boundary snapshot. |
| Batch classification and card projection could read different graph references | The new card batch initially classified one `context.graph` value and reread it while projecting cards. The batch now captures the graph once and uses that reference throughout. | A switching-getter regression verifies one graph read. Descriptor admission, standalone graph checks, and per-node/card/pin checks remain intact. |

## Independent verification

The independent reviewer inspected the frozen production diff and relevant regression tests, then re-reviewed each correction. A second read-only reviewer found no remaining shell or batch-validation defect.

Executed directly by this reviewer:

```text
node --test --test-isolation=none tests/canvas-presentation-batch.test.mjs
7 tests passed; exit 0
```

This focused gate verifies single batch classification, unchanged standalone DTOs and validation, descriptor-only dense-array admission without getter reads, individual authoring budgets, malformed card/pin rejection, and a stable captured graph reference. The default isolated test runner encountered sandbox `spawn EPERM`; the in-process rerun above passed. This reviewer changed only this report and performed no product, test, Git, build, or browser mutation.

## Final shared gates

Root executed the following gates on frozen 0.22.1. This reviewer inspected their logs, JSON summaries, and the visual captures listed below.

| Gate | Final evidence |
| --- | --- |
| Full check | 109/109 Node test files; zero Svelte errors or warnings; build with 146 modules; 223 asset imports; 147/147 browser cases. `.lattice-interaction-final-check.log` ends with 147 passed. Root reported exit 0. |
| New interaction captures | Seven states passed, with zero errors, blocked requests, or provider calls. `benchmark-results/interaction-visuals/capture.json`. |
| Standard and Ember captures | 15/15 standard states and 3/3 Ember captures passed. `benchmark-results/visuals/metrics.json` and `benchmark-results/ember-visuals/metrics.json`. |
| Documentation capture/check | 20 captures; zero errors or blocked requests. Check passed for seven documents, 109 local links, 16 operations, and 20 screenshots. `.lattice-interaction-doc-capture.log` and `.lattice-interaction-doc-check.log`. |
| Install smoke | 76 local requests; zero provider calls, errors, or missing files. Mounted Svelte workbench and loaded launchers. `.lattice-interaction-smoke.log`. |
| Renderer profile | 36 samples; zero errors; maximum frame p95 16.8ms; zero frames above 25ms; zero card-height reads; all node/wire identities retained. `benchmark-results/latest.json`. |

The earlier full browser run exposed the stale snapshot boundaries described above. Those failures were corrected and the final full browser gate passed.

## Matched interaction profile and limits

`benchmark-results/interactions-baseline.json` and `benchmark-results/interactions-final.json` use the same full actual controller/Svelte-workbench scope, with inspector and preview mounted. They contain 12 samples across 25, 100, and 250 nodes and pan, zoom, drag, and selection. Each sample covers 30 frames; motion samples deliver 12 events per frame, while selection alternates nodes 30 times. The final run has zero errors, blocked requests, or provider calls, and preserves node/wire identity in every sample.

The 250-node measurements are:

| Measurement | 0.22.0 | 0.22.1 |
| --- | ---: | ---: |
| Selection handler p95 | 334.3ms | 13.4ms |
| Selection frame p95 | 350.0ms | 16.7ms |
| Selection full renders | 60 | 0 |
| Selection pin-rectangle reads | 67,500 | 0 |
| Selection clone calls | 1,812,600 | 0 |
| Drag start handler | 158.8ms | 8.1ms |
| Drag release handler | 2,259.5ms | 1,112.1ms |
| Drag full renders | 8 | 4 |
| Drag maximum sampled frame | 150.1ms | 183.3ms |
| Pan frame p95 | 16.7ms | 16.8ms |
| Zoom frame p95 | 16.8ms | 16.7ms |

Selection and drag initiation improved substantially. Pan and zoom were already near a 60Hz frame interval in the baseline and remain there at p95. The final 250-node drag still has a roughly 1.1-second release boundary and one frame above 25ms; its maximum sampled frame is higher than the baseline despite fewer full renders. Final pan has one 33.3ms frame and selection has two frames above 25ms. These results support reduced latency, not elimination of every long frame or edit-commit delay. Required transaction/preparation work is still present; the batch classification change must not be credited with removing those clones.

## Visual inspection

This reviewer inspected all seven new interaction PNGs and all three Ember PNGs. No actionable visual regression was found. The shelf keeps centered, full-width rows beneath a tall Preview, the tab joins continuously to its frame, search begins with its input, the loaded chat logo sits in the left host controls, the near-origin loose curve stays local, and compatible connection feedback is visible. Ember node cards, pins, and settled wires remain aligned, including the selected failed-node state.

The new capture metrics confirm Details width 378px, shelf row height 28px and width 110px, equal shelf client/scroll width of 120px, hidden horizontal overflow, and a thin dark vertical scrollbar. The neutral Details boundary is subtle in Ember; the resized/focused capture shows a clear orange handle, with pointer, keyboard, rollback, persistence, and mobile behavior covered by the final browser gate.

Inspected images are in `benchmark-results/interaction-visuals/` (`workspace`, `node-search`, `details-resized`, `shelf-scrolled-preview`, `pin-near-origin`, `pin-compatible-target`, `chatbar-left-logo`) and `benchmark-results/ember-visuals/` (`ember-workspace`, `ember-nodes`, `ember-selected-failure`).
