# Lattice performance overhaul

Date: 2026-10-10. Branch: `codex/lattice-performance-overhaul`. Main base: `143ec11cdd35c5478990198d51823f1076922bd7`, verified as remote Main when this worktree was created. Implementation commit: e8420427f196bcdae7aa16d5fe01eef59bde7a9c.

The major implementation is ready for review, with explicit remaining latency misses. In the matched 20-sample audit, a 100-node Details toggle settles in **124 ms instead of 682 ms**; shelf creation falls from **864 to 171 ms** and connection commit from **799 to 102 ms**. At 250 nodes the toggle falls from **2,576 to 211 ms**. These are synthetic local UI measurements, with the limitations below. Stable Svelte update boundaries and less repeated preparation both contribute; whole-document synchronous preparation is still the main remaining cost.

## Why the buttons lagged

The [initial clean Main baseline](2026-10-10-performance-main-baseline.md), with three plain samples per case, reproduced the reported delay. Its smaller cohort is distinct from the matched 20-sample table below. A 100-node Trim output toggle took 683 ms synchronously and 885 ms to the probe's paint-opportunity estimate. Its instrumented sample performed two full canvas renders, one graph replacement and 900 pin rectangle reads. It counted 121,369 recursive clone calls; that count includes small recursive operations and is not a count of full-document copies.

One small edit triggered repeated graph admission and expansion, operation descriptions, workspace and Details preparation, canvas classification and geometry reads, and recovery/checkpoint serialization. Keyed Svelte components already retained DOM, but that did not reduce the synchronous work before publication. Shelf placement also prepared an entire provisional workspace to measure one card, then prepared it again after committing its final coordinates.

## Are we utilizing Svelte enough?

The existing component structure was useful, but the update boundaries were too broad. The overhaul gives Svelte stable per-ID reactive slots and separate scene, position, wire-preview and status channels. Structural arrays change for membership/order changes; affected slots change for local updates. Movement patches affected nodes and incident routes. Trace and free wire previews do not replace the settled scene.

Details now receives stable immutable authored projections across coordinate and runtime updates. Edit-authority envelopes change independently, so retaining a control does not retain permission to write stale data. Structured controls update typed drafts without a whole stringify/parse cycle on every keystroke. Advanced editors mount when opened, with draft namespaces and acknowledgment guards preserving legitimate drafts.

Using more Svelte syntax alone would not remove domain admission, full authored-content fingerprints, definition expansion, recovery encoding or browser geometry costs. Those boundaries needed separate treatment. This branch improves both the Svelte publication paths and the preparation around them. There is no new product dependency or worker.

## What changed

- Canvas retains layout-qualified geometry and observers, batches scene publication, patches incident routes, and keeps ghost/status updates narrow. Cancellation before replacement restores gestures and releases captures without rendering the outgoing scene. Connection reconciliation retains the selected Details panel. Continuous dragging qualifies focus/selection painting by its actual dependencies and compares route fields directly; 12 steady test frames perform zero whole-layer class scans and zero JSON conversions.
- Checked immutable artifacts reuse verified graph admission, definition registries and planner summaries. A verified committed artifact is adopted for the next edit. Qualified/create/connect producers reuse their admitted historical original; changed candidates still receive complete admission. Raw mutation, getter-free bounds, exact root/context, history generation/revision and synchronous observer checks remain.
- Workspace preparation uses linear endpoint/group indexes, lazy qualified target summaries and stable panel projections. Shelf placement projects only its checked new card before repreparing final coordinates, including private definition pins. Provisional measurement now consumes a checked artifact token and projects only the exact card; final-coordinate creation still checks the current context. The canvas drawing omits invisible Details schemas; the public drawing API's default DTO remains complete and mutable.
- Trusted coordinate receipts allow one root reconciliation while retaining the planner, bridge, selection and Details content. Missing coordinates, comments, ownership and unsupported changes use full preparation.
- An admitted authored edit publishes one immediate detached recovery payload. View/host saves capture the exact document, settings owner and saver; stale timers do no work. Failed submissions remain retryable and lifecycle boundaries flush synchronously. Native file checkpoints and synchronous picker activation remain independent. During an exact local committed reconciliation, the intermediate views-only dirty snapshot is deferred to the final notification: the real mounted browser test drops from two canonical snapshot pairs to one, while synchronous observer mutations and activation changes remain visible.

For 100 Compose cards, excluding editor-only schemas reduces the actual drawing clone input from 187,074 to 128,374 bytes and from 3,113 to 2,013 nested objects. Deterministic domain clone counts fell from 10 to 5 for a captured qualified edit, 13 to 8 for creation, and 11 to 6 for connection preparation. These are workload checks, not end-to-end timing estimates.

## Matched action results

Each action has 20 plain samples after one warmup. Percentiles use the harness's nearest-rank calculation. Values are milliseconds; sync covers the initial call, while settle includes the probe's second animation frame. Instrumented counts are excluded from these timings.

| Nodes | Action | Sync median Main → final | Settle median Main → final | Final settle maximum |
|---:|---|---:|---:|---:|
| 25 | Open local JSON | 0.1 → 0.1 | 25.7 → 25.3 | 33.9 |
| 25 | Expand local section | 0.1 → 0.1 | 25.5 → 26.3 | 33.9 |
| 25 | Details enum | 136.8 → 31.4 | 168.7 → 42.3 | 56.2 |
| 25 | Details toggle | 139.2 → 41.3 | 172.0 → 54.1 | 71.0 |
| 25 | Details Save | 131.5 → 34.4 | 161.6 → 42.5 | 62.8 |
| 25 | Select node | 2.9 → 2.0 | 25.4 → 26.0 | 34.2 |
| 25 | Place from shelf | 72.9 → 11.6 | 208.0 → 47.5 | 70.4 |
| 25 | Create from search | 23.6 → 5.3 | 177.6 → 38.9 | 51.8 |
| 25 | Connection compatibility | 23.2 → 5.0 | 32.3 → 28.2 | 34.4 |
| 25 | Commit connection | 23.3 → 5.0 | 170.2 → 43.1 | 53.1 |
| 100 | Open local JSON | 0.2 → 0.2 | 25.7 → 28.4 | 34.2 |
| 100 | Expand local section | 0.1 → 0.1 | 25.1 → 22.1 | 33.5 |
| 100 | Details enum | 567.3 → 134.0 | 684.5 → 144.0 | 173.3 |
| 100 | Details toggle | 569.7 → 115.7 | 682.3 → 124.0 | 166.6 |
| 100 | Details Save | 564.0 → 104.1 | 681.3 → 114.5 | 144.8 |
| 100 | Select node | 5.9 → 4.8 | 24.3 → 25.9 | 34.0 |
| 100 | Place from shelf | 296.6 → 59.3 | 863.6 → 171.3 | 192.5 |
| 100 | Create from search | 91.5 → 21.2 | 792.0 → 116.8 | 151.0 |
| 100 | Connection compatibility | 90.0 → 21.6 | 100.3 → 33.7 | 41.9 |
| 100 | Commit connection | 90.4 → 18.3 | 798.5 → 101.9 | 132.7 |
| 250 | Open local JSON | 0.3 → 0.3 | 25.2 → 24.3 | 36.6 |
| 250 | Expand local section | 0.1 → 0.1 | 24.5 → 25.9 | 34.9 |
| 250 | Details enum | 2001.2 → 188.9 | 2629.4 → 200.6 | 276.2 |
| 250 | Details toggle | 1977.9 → 200.5 | 2576.3 → 211.4 | 274.7 |
| 250 | Details Save | 1962.7 → 206.8 | 2531.4 → 216.0 | 338.5 |
| 250 | Select node | 12.0 → 5.6 | 28.4 → 25.7 | 35.5 |
| 250 | Place from shelf | 829.6 → 99.4 | 3090.5 → 275.2 | 402.5 |
| 250 | Create from search | 246.4 → 44.7 | 2952.2 → 223.0 | 297.4 |
| 250 | Connection compatibility | 252.3 → 49.4 | 266.4 → 63.4 | 77.2 |
| 250 | Commit connection | 258.4 → 48.4 | 3029.6 → 255.4 | 338.9 |


## Movement and interaction frames

Five plain gestures per size/mode, each with 45 batches of six events and 44 measured frame intervals. P95 below is pooled across 220 intervals. Pass counts also test each gesture separately (P95 ≤20 ms and worst ≤50 ms), so pooling cannot hide a failed gesture.

| Nodes | Motion | Frame P95 Main → final | Worst frame Main → final | Passing gestures Main → final | Intervals >25 ms Main → final |
|---:|---|---:|---:|---:|---:|
| 25 | drag | 16.7 → 16.8 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 25 | pan | 16.7 → 16.8 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 25 | zoom | 16.8 → 16.7 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 25 | wire-preview | 16.7 → 16.7 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 100 | drag | 16.8 → 16.8 | 50.1 → 16.8 | 3/5 → 5/5 11 → 0 |
| 100 | pan | 16.7 → 16.7 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 100 | zoom | 16.7 → 16.8 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 100 | wire-preview | 16.8 → 16.8 | 16.8 → 16.8 | 5/5 → 5/5 0 → 0 |
| 250 | drag | 33.3 → 16.8 | 183.3 → 33.4 | 0/5 → 5/5 12 → 8 |
| 250 | pan | 16.8 → 16.8 | 33.4 → 49.9 | 5/5 → 5/5 6 → 6 |
| 250 | zoom | 16.7 → 16.8 | 33.3 → 33.4 | 5/5 → 4/5 2 → 4 |
| 250 | wire-preview | 33.3 → 16.8 | 49.9 → 33.4 | 3/5 → 5/5 14 → 2 |

One 250-node zoom gesture has a 33.2 ms frame P95 despite the pooled P95 of 16.8 ms; this is the single failed gesture.

Start and finalization are separate from steady frame intervals. These are final-run sample maxima; zoom boundary includes the intended 180 ms idle delay and host submission, without a disk acknowledgment.

| Nodes | Motion | Down sync | First batch sync | First batch settle | Release settle | Zoom save submission from last input |
|---:|---|---:|---:|---:|---:|---:|
| 25 | drag | 2.1 | 1.1 | 14.2 | 33.6 | — |
| 25 | pan | 0.2 | 0.1 | 13.6 | 33.3 | — |
| 25 | zoom | 0.0 | 0.2 | 12.6 | — | 192.2 |
| 25 | wire-preview | 2.8 | 4.9 | 15.7 | 30.8 | — |
| 100 | drag | 3.5 | 3.8 | 16.0 | 84.9 | — |
| 100 | pan | 0.3 | 0.1 | 8.3 | 33.2 | — |
| 100 | zoom | 0.0 | 0.2 | 21.1 | — | 209.0 |
| 100 | wire-preview | 7.4 | 5.3 | 16.0 | 29.9 | — |
| 250 | drag | 5.6 | 9.5 | 32.0 | 165.3 | — |
| 250 | pan | 0.3 | 0.2 | 23.0 | 65.7 | — |
| 250 | zoom | 0.0 | 0.3 | 33.4 | — | 221.3 |
| 250 | wire-preview | 10.7 | 3.2 | 16.8 | 32.1 | — |

A separate run measures 20 plain drag releases per size. Main maxima below come from its five-gesture cohort, so the sample counts differ.

| Nodes | Final release median, 20 samples | Final release maximum, 20 samples | Main release maximum, 5 samples | Release target |
|---:|---:|---:|---:|---|
| 25 | 32.8 | 57.4 | 200.1 | Pass |
| 100 | 66.0 | 82.3 | 1250.2 | Pass |
| 250 | 116.9 | 133.6 | 3600.7 | Pass |

The supplemental run also records frames: 59/60 gestures meet the frame goals. Its 250-node drag repeat 7 has frame P95 33.3 ms and worst interval 33.4 ms; release timing still meets its separate target. Supplemental intervals over 25 ms by size: 25 nodes: 0/880; 100 nodes: 0/880; 250 nodes: 16/880.

## Targets and remaining costs

The approved goals require committed Details/creation/connections/root drag release below 100 ms median and 200 ms sample maximum at 25/100 nodes, and below 200/400 ms at 250 nodes. These are implementation goals, not a guarantee of perceived latency on every host.

- 25 nodes: 6/6 committed action cases meet both goals.
- 100 nodes: 0/6 committed action cases meet both goals. Median misses: Details enum, Details toggle, Details Save, Place from shelf, Create from search, Commit connection.
- 250 nodes: 0/6 committed action cases meet both goals. Median misses: Details enum, Details toggle, Details Save, Place from shelf, Create from search, Commit connection. Sample-maximum miss: Place from shelf.
- Continuous motion: 59/60 gestures meet the frame goals. The per-case table above retains any failed gesture.
- Root drag release: 3/3 sizes meet both goals in the supplemental 20-sample run.

The overhaul makes a large improvement, but full acceptance remains open. The final 250-node CPU profiles still attribute about 104–120 ms inclusively to post-commit reconciliation, 38 ms to workspace preparation and 24–33 ms to Canvas graph replacement. Bounded validation, canonicalization, enumerable-data checks, cloning and freezing are material self costs. These instrumented inclusive paths overlap and must not be added; they cannot predict the savings of a future change.

Next priorities are combining repeated bounded descriptor traversals without dropping accessor/prototype/symbol/limit checks, reusing privately owned immutable prepared-view metadata, and reusing operation descriptions within an exact checked preparation. Broader revision-only caches remain unsafe for publicly mutable roots. General checkpoint/recovery revision caches and one global Workbench publication batch were not implemented; the plan records the narrower substitutions and deferrals.

The intermediate 7b6d897 cohort remains available. Its 100-node Details medians were about 89–92 ms, versus 115–144 ms on final source even though the follow-ups reduced operation counts. Unchanged clone work and selection also slowed. That suggests runtime variation but does not prove its cause; both frozen cohorts are retained and no timing benefit is attributed solely to the follow-ups. Main/final are matched configurations run sequentially, not randomized interleaved samples; unrelated machine activity is not fully controlled.


## Correctness

Final frozen source passes **279/279 isolated unit test files**, **336/336 browser tests**, type checks with **0 errors/0 warnings**, production build, **544 versioned local import** checks and fresh install smoke. Browser tests use a fresh CI server on port 4210 with two workers. Unit/browser suites used disjoint fixtures/storage against frozen source/build; all regression work stopped before timing. Install smoke reports zero API calls, no missing resources or browser errors, and the Svelte workbench mounts. Independent code review approved the final changes after fixes.

Generated JavaScript is 377.50 kB (101.22 kB gzip); CSS is 62.18 kB (10.67 kB gzip). The measured JavaScript SHA-256 is 478d4c66b7d33019af060400824344f95fe05a36c60351c09ac15677e4a1200c, matching both the current build and the implementation commit's exact Git blob.

Representative correctness coverage includes:

| Case | Evidence |
|---|---|
| Mixed native cards and narrow widths | Rendering browser checks at 1,024, 736, 360 and 320 px |
| Nested and sibling occurrences | Prepared planning, qualified transactions and exact structural address/source pairing |
| Populated library and shelf pins | Subgraph authoring and nested shelf tests with configured entries and reachable/unrelated pins |
| Folded and empty groups | Retained geometry, drag rollback and saved group-frame tests |
| Wrapped pins | Artifact-pin browser checks across five fonts and three zooms |
| Large Details drafts | Real compiled recursive controls: 64 Compose sections, over 200 KB encoded content and a 99,000-character row; exact checked Save, no JSON conversion on typed input, and invalid-draft retention |
| Saving, recovery and host freshness | Captured owner/saver, retry/failure/pagehide, undo/checkpoints, native picker and reviewed Apply tests |

The small populated-library tests establish correctness; they do not establish latency for a large library. The latency fixture itself contains no groups, model profiles, library entries or large payloads.

## Measurement limits

Both builds use the same production controller and Svelte mounting path in a disabled synthetic host. The fixture is a short Compose Text chain with E = N - 2. Chromium 151.0.7922.34 runs at 1× CPU rate, a 1,440 × 1,000 viewport, reduced motion and SwiftShader on Windows 10 / Ryzen 7 5800X. Node is 24.16.0; dependencies come from the locked project versions. Regression tests are stopped during timing runs.

Actions use synthetic DOM events or controller bridge commands. Settle ends at the second requestAnimationFrame, a paint-opportunity estimate rather than INP or measured pixels. Motion uses 45 frame batches with six events each after warmup. Threshold/start, frame intervals, release and zoom-idle save submission are separate measurements. Submission does not acknowledge disk persistence.

Synthetic events omit trusted-input queuing and some native hit-testing/capture behavior. Software rendering cannot establish physical-GPU smoothness. Observed maxima describe these samples, not population tails. Plain timing and instrumented work counts are reported separately. Authenticated SillyTavern latency remains unmeasured: the available fresh browser reached login, so these results isolate Lattice's local UI work.

## Evidence and reproduction

- [Matched Main results](artifacts/editor-latency/main-matched-143ec11/editor-latency-results.json) and [source manifest](artifacts/editor-latency/main-matched-143ec11/editor-latency-source-manifest.json).
- [Final action/motion results](artifacts/editor-latency/overhaul-final/editor-latency-results.json), [source manifest](artifacts/editor-latency/overhaul-final/editor-latency-source-manifest.json) and [raw output](artifacts/editor-latency/overhaul-final/stdout.txt).
- [20-sample drag-release results](artifacts/editor-latency/overhaul-drag-release/editor-latency-results.json).
- Final CPU profiles: [Details toggle](artifacts/editor-latency/overhaul-final/detail-toggle-250.cpuprofile), [shelf creation](artifacts/editor-latency/overhaul-final/shelf-create-250.cpuprofile), [connection release](artifacts/editor-latency/overhaul-final/connect-release-250.cpuprofile).
- [Intermediate 7b6d897 cohort](artifacts/editor-latency/overhaul-7b6d897/README.md), retained as diagnostic evidence.
- [Validation logs](artifacts/editor-latency/overhaul-validation/README.md) and [provenance/hash index](artifacts/editor-latency/overhaul-provenance.json).

Production dependencies remain unchanged: Svelte 5.56.10, Vite 8.2.2, Playwright 1.62.1 and TypeScript 6.0.2 from the lockfile. The final and Main manifests verify every measured source/build file against the actual worktree bytes; Main's two rebuilt distribution files are its only working changes. JSON and CPU profiles are copied exactly; saved stdout/check logs are normalized to LF. Raw worktree source hashes may reflect Git line-ending conversion, so they are not asserted to equal text Git blobs byte-for-byte. Distribution files are marked non-text and the final bundle does match its Git blob exactly.

Reproduce from the frozen worktree (with locked dependencies installed):

~~~powershell
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs --source=<rebuilt-main-worktree> --sizes=25,100,250 --rates=1 --repeats=20 --motion-plain --motion-repeats=5 --output=.tmp/main-audit
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs --sizes=25,100,250 --rates=1 --repeats=20 --motion-plain --motion-repeats=5 --output=.tmp/overhaul-audit
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs --sizes=25,100,250 --rates=1 --repeats=2 --modes=selection --motion-plain --motion-modes=drag --motion-repeats=20 --output=.tmp/drag-release-audit
~~~

Keep builds/tests stopped during probes. The Main checkout is a disposable rebuilt baseline; the implementation branch and managed worktree are preserved for review.

[Original audit](2026-10-10-editor-latency-audit.md), [initial clean Main baseline](2026-10-10-performance-main-baseline.md), [approved design](../superpowers/specs/2026-10-10-lattice-performance-overhaul-design.md), [implementation plan](../superpowers/plans/2026-10-10-lattice-performance-overhaul.md).
