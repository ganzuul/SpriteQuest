# LATTICE editor latency audit

Date: 2026-10-10. Scope: LATTICE, the node editor in this SillyCanvas repository that runs inside SillyTavern. This is an investigation and implementation roadmap; no application code was changed by this audit. Measurements and source references describe the frozen inputs below; concurrent workspace changes are outside that snapshot.

## Answer to the main questions

**Svelte is used extensively, but the surrounding pipeline often turns small committed edits into broad synchronous updates.** Node cards, pins, wires, Details, shelf, menus and other panels already use Svelte 5. Keyed components retain DOM identity, Details remains mounted, and local editor state uses runes. The problem is the amount of synchronous domain preparation, document serialization and geometry measurement attached to an ordinary committed edit, followed by broad replacement of otherwise unchanged view objects.

**The reported delay is credible and the editor has measurable bottlenecks.** A Details setting can trigger whole-root cloning and validation, rebuilding workflow and library views, graph replacement, two full canvas renders, and recovery serialization before the browser can paint. Root-node release does even more work. A small local editor toggle takes a different, much cheaper path. Measured results and their limits appear below.

The highest-value improvements are to reuse validated immutable data, separate layout changes from semantic changes, eliminate redundant rendering and serialization, and update only affected view objects and geometry. Better Svelte granularity helps after those upstream costs are removed.

## Measurements

The reported >500ms delay is reproduced for committed Details changes in this fixture. At 100 nodes, Trim output blocks synchronously for **637ms median**, with a **762ms** settling estimate. At 250 nodes, the corresponding figures are **1967ms** and **2534ms**. Local expansion/representation switches take under 1ms synchronously.

### Baseline action timings

Values below are medians in milliseconds from seven **uninstrumented** repetitions after one warmup, at CPU rate 1. Each action also has a separate instrumented sample. The fixture is a chain of short Compose Text nodes with one wire removed (`E=N−2`), an empty library, no groups/model profiles and no large output payloads. This deliberately exposes editor scaling; it does not model every user workflow.

| Action | Sync 25 | Sync 100 | Sync 250 | Settle 25 | Settle 100 | Settle 250 |
|---|---:|---:|---:|---:|---:|---:|
| Local rows ↔ JSON switch | 0.2 | 0.2 | 0.3 | 30 | 27 | 30 |
| Local section expansion | 0.1 | 0.1 | 0.0 | 26 | 30 | 24 |
| Committed Mode option | 172 | 665 | 1917 | 200 | 783 | 2534 |
| Committed Trim output toggle | 172 | 637 | 1967 | 210 | 762 | 2534 |
| Structured sections Save | 167 | 586 | 1956 | 196 | 715 | 2533 |
| Select another node | 3 | 6 | 12 | 24 | 23 | 25 |
| Centered shelf creation | 93 | 301 | 834 | 239 | 876 | 3095 |
| Unconnected-search creation | 32 | 93 | 246 | 224 | 774 | 2884 |
| Enter compatible target pin | 30 | 101 | 243 | 43 | 108 | 257 |
| Release accepted connection | 31 | 114 | 240 | 219 | 911 | 2915 |

**Sync** is the directly dispatched handler/bridge-call duration. Creation and connection commit continue asynchronously after that call returns; their smaller sync duration does not mean the operation has finished. **Settle** ends at the second `requestAnimationFrame` after dispatch and includes frame alignment and work before that callback. It is a paint-opportunity estimate, not a verified rendered-pixel timestamp or INP. Synthetic `.click()`/change events, selection calls and bridge commands omit trusted-input queuing, some hit testing and native pointer capture. Values rounded to milliseconds (one decimal below 1ms).

The 100-node toggle's observed maximum among seven plain runs is 700ms synchronous and 830ms to settle. Raw fields named `P95` use a nearest-rank calculation; with seven samples they equal the observed maximum and are **not a population tail estimate**.

### Continuous gestures and release

These are **two instrumented samples per gesture**, each with 45 frame-paced batches of six events (44 frame intervals). A supplemental matched-build run waits 220ms after setup to allow the ordinary recovery debounce to settle; these tables use that run. This does not establish global quiescence: camera persistence/completion can occur during long inter-frame gaps. The original raw run retains its motion data for transparency, and can also include setup saves. P95 is calculated within each short gesture; the ranges span those two samples. Include the worst observed interval because a single start-of-drag stall can disappear from P95. Release includes synchronous dispatch and the two-frame settling estimate. Instrumentation overhead prevents direct comparison with the plain action medians.

| Nodes | Gesture | Press sync | Frame P95 | Worst frame interval | Frames >25ms | Six-event handler max | Release sync | Release settle |
|---:|---|---:|---:|---:|---:|---:|---:|---:|
| 25 | Root-node drag | 3.2–4.0 | 16.7–16.8 | 16.8 | 0 | 11.6–11.8 | 201–238 | 236–265 |
| 25 | Camera pan | 0.2–0.3 | 16.7–16.8 | 16.8 | 0 | 0.1–0.2 | 20.7–28.7 | 32.8–48.1 |
| 25 | Wheel zoom | — | 16.7–16.8 | 16.8 | 0 | 0.2–0.5 | — | — |
| 25 | Free wire preview | 9.9–10.7 | 16.7 | 16.8 | 0 | 4.5–5.2 | 0.3–1.0 | 26.7–29.5 |
| 100 | Root-node drag | 7.7–9.0 | 16.7–16.8 | 83.3–100 | 2 | 48.2–53.5 | 1045–1230 | 1297–1369 |
| 100 | Camera pan | 0.1–0.3 | 16.7–16.8 | 16.8 | 0 | 0.2 | 104–168 | 115–185 |
| 100 | Wheel zoom | — | 16.8 | 16.8 | 0 | 0.2–0.3 | — | — |
| 100 | Free wire preview | 49.6–51.4 | 16.7–16.8 | 16.8 | 0 | 4.2–4.7 | 0.5–0.8 | 24.0–27.5 |
| 250 | Root-node drag | 15.9–17.2 | 16.8–33.3 | 300–317 | 2–3 | 155–160 | 3788–4681 | 4434–5577 |
| 250 | Camera pan | 0.3–0.4 | 16.8 | 16.8–33.4 | 0–1 | 0.1–0.2 | 289–338 | 315–365 |
| 250 | Wheel zoom | — | 16.7–16.8 | 16.7–33.3 | 0–1 | 0.2–0.3 | — | — |
| 250 | Free wire preview | 170–180 | 16.8–33.3 | 33.3–50.0 | 2–3 | 4.7–5.5 | 0.4–0.6 | 17.0–24.5 |

Root drag has a separate commit/release stall even when most live frames meet the 60Hz budget. Crossing the 8px drag threshold also captures and validates the root once; inspect the maximum handler/interval rather than concluding that P95 alone proves smooth input. Camera pan release serializes presentation/recovery state. Free wire preview is cancelled rather than connected in this motion probe; accepted connections are measured above. Zoom has no mouse release; its **final settlement/save after sampling is not measured separately**. Camera frames rearm deferred view persistence, and wheel events rearm completion persistence, both at 180ms; either can run inside a long gesture. This is not a physical-input or GPU smoothness guarantee.

### CPU stress at 100 nodes

Chrome CPU rate 4 is an emulated stress condition, **not a prediction for a particular slower computer**. Action medians remain uninstrumented.

| Action | Sync rate 1 | Sync rate 4 | Settle rate 1 | Settle rate 4 |
|---|---:|---:|---:|---:|
| Local rows ↔ JSON switch | 0.2 | 0.8 | 27 | 29 |
| Local section expansion | 0.1 | 0.2 | 30 | 29 |
| Committed Mode option | 665 | 3685 | 783 | 4516 |
| Committed Trim output toggle | 637 | 3724 | 762 | 4555 |
| Structured sections Save | 586 | 3676 | 715 | 4497 |
| Select another node | 6 | 36 | 23 | 51 |
| Centered shelf creation | 301 | 2204 | 876 | 5823 |
| Unconnected-search creation | 93 | 672 | 774 | 5037 |
| Enter compatible target pin | 101 | 652 | 108 | 696 |
| Release accepted connection | 114 | 655 | 911 | 4919 |

| Gesture, rate 4 | Press sync | Frame P95 | Worst frame interval | Frames >25ms | Release settle |
|---|---:|---:|---:|---:|---:|
| Root-node drag | 53.1–58.8 | 50.0–50.1 | 717–850 | 36–41 | 9369–9464 |
| Camera pan | 0.6–1.3 | 16.8–33.4 | 50.1–750 | 2–6 | 700–817 |
| Wheel zoom | — | 33.4–66.7 | 733–933 | 5–22 | — |
| Free wire preview | 437–627 | 133–167 | 217–233 | 44 | 59.9–61.7 |

The stress pan sample records two host save calls in one repetition, versus one in the other. Both zoom samples record one save despite having no mouse release, with 43,068 JSON calls and 24,032 clone calls. These counters establish included persistence work but cannot identify which timer caused a particular frame spike. Free wire preview records zero host save calls while its high frame intervals persist. Further uninstrumented motion profiling is required before assigning precise production costs to these stress results.

### Operation counts and provenance

Instrumented Details enum/toggle/Save samples perform two Canvas renders and one graph replacement. Root drag samples perform four renders and two replacements. Some asynchronous search-creation paths have an additional render. Card/Details DOM identities are retained in the committed Details samples. Counts of JSON/clone calls include many small recursive operations and must not be interpreted as that many full-document copies. Host save counts can include the 180ms timer when a long action keeps the sample open; a debounced host API does not make the recovery work before it asynchronous.

The full run used Chromium **151.0.7922.34**, a **1440×1000** viewport, reduced-motion preference, CPU rates 1/4, and a software rendering device (ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver-5.0.0)). The frozen build's SHA-256 is `c20244a6e3dc9b8a0c282e98eeaba61734e7e990332431780e3f48d6edafde45`. Exact app/build/harness input hashes are in the source manifest. The local frozen snapshot is `F:\git\SillyCanvas\.tmp\editor-latency-baseline`. The raw report's `head`/`status` came from its ancestor live Git checkout at run completion (c9e7b76bb284b5905f040a8c0ca2bfb39025c956); they do **not** identify a clean Git checkout of that snapshot. Fingerprints are authoritative.

Only report/probe artifacts were added. The final saved probe adds outcome guards and source fingerprinting around the same timed actions, plus a setup debounce wait for motion; separate motion and small-fixture runs verify those changes. Hardware/runtime/probe hashes and commands are recorded in the provenance artifact.


### Where the 250-node toggle spends time

One separate instrumented CPU profile supports the following attribution. Sample intervals are weighted by Chrome's `timeDeltas` and assigned once to the innermost recognized phase; the 1,903 samples cover approximately 3,497ms, including asynchronous work after the synchronous handler.

| Exclusive phase | Approximate sampled time | Share |
|---|---:|---:|
| Rendering and geometry | 1,551ms | 44.4% |
| Transaction validation, cloning and history | 792ms | 22.6% |
| Workspace preparation and projection | 520ms | 14.9% |
| Recovery persistence and dirty snapshots | 483ms | 13.8% |
| Other/runtime/GC | 151ms | 4.3% |

The largest leaf is `getBoundingClientRect`: approximately **1,361ms, or 38.9%** of sampled time. Rectangle queries include browser layout work. The profile shows three measurement paths after one toggle: `setGraph → render → measureCards → alignCardPins`, `setTrace → render` repeating that path, and the `ResizeObserver` callback measuring cards again. Rectangle-read samples divide into roughly 897ms inside the synchronous edit and 464ms afterward. Pin alignment interleaves probe insertion/removal, geometry reads and style writes; this strongly supports layout work as a major cost.

The instrumented toggle records **two Canvas renders, one `setGraph`, and 2,250 pin rectangle reads**. `layer.setNodes` takes 8.6ms inclusive, while the two Canvas render calls take approximately 1,004ms inclusive. Retained node, wire and control DOM identities show that remounting every Svelte component is not the explanation for this sample.

Instrumentation changes absolute cost: the plain toggle median is 1,967ms synchronous and 2,534ms to the settling estimate, versus 2,730ms and 3,379ms in the profiled sample. Timing wrappers themselves cost time (`performance.now` received about 194ms of samples). These percentages describe that instrumented sample, rather than exact production shares. Inclusive call times overlap and must not be added; rectangle-query time must not also be added to CDP's layout duration.

## How a Details click becomes expensive

A committed enum or boolean follows this path:

```text
DOM change
  → NodeDetails.perform / editControl or modifier commit
  → capture current edit context and document signatures
  → clone and normalize whole root; prepare candidate
  → validate original and candidate; commit history
  → reconcile graph views
  → prepare workflow, all instance views, library views and catalogs
  → replace drawing, measure cards, render canvas
  → project Details/Preview/profiles/recall; apply trace and render again
  → serialize recovery/workspace state; call host save
  → browser receives an opportunity to paint
```

`NodeDetails.perform` awaits the action, but the action executes synchronously before that await yields. An async function alone does not move this work off the main thread. Pending state cannot be displayed during the synchronous portion.

Evidence: `ui/NodeDetails.svelte:82`, `src/ui/controller.js:1600`, `src/workflow/transactions.js:27`, `src/workflow/definition-library.js:18`, `src/workflow/prepared-graph-edit.js:5`, `src/history.js:114`, `src/state.js:324`.

This explanation applies to **committed changes**. Opening native `<details>`, switching structured rows to JSON, and editing unsaved structured/modifier drafts use local state. Persistent delay in these local actions on a small payload would require an additional investigation of background tasks, layout and the live host; it cannot be attributed automatically to document commits.

## Main findings and recommended changes

| Priority | Finding and evidence | Recommended change | Validation requirement |
|---|---|---|---|
| P0 | Details reconciliation activates a new drawing; `setGraph` renders, then applying trace renders again. Root drag release activates the editor again after reconciliation, producing four renders. `controller.js:241–259,359,646–666`; `canvas.js:129–155`. | Apply graph, trace and selection as one update. Remove the second root-drag activation. Make trace updates modify status without remeasuring geometry. | One geometry pass per structural update; no full geometry pass for an unchanged-status or coordinate-only update. Preserve selection, history and execution rings. |
| P0 | Every changed document commit unconditionally calls full `refreshWorkspaceDocument`, including root movement with `semanticChanged=false`. Successful no-ops skip reconciliation. `controller.js:80–85,261–267`; `state.js:332–335`. | Use the existing change summary to invalidate layout, node presentation, controls/ports, topology, definitions and host bindings independently. Root movement should reuse the prepared semantic graph. | Root drag remains undoable and persists coordinates, with no planner/library/catalog rebuilding on release. |
| P1 | Candidate capture/preparation/commit repeatedly validate, clone and sign the full document. Validation expands bundled definitions, including unused ones. `transactions.js:27,55`; `definition-library.js:18–47`; `prepared-graph-edit.js:5`; `graph-validation.js:293`. | Admit external data fully. Within trusted editor revisions, cache structural validation/definition expansion and carry revision-qualified transaction evidence. Preserve atomic candidate validation and freshness checks. | No weakening of malformed-data rejection, stale-context checks, read-only scopes or atomic history. Measure repeated stages explicitly before removing them. |
| P1 | Target summaries are eagerly prepared for every output. Each traverses upstream closure and scans primitives. Approximate `O(T × (N+E))`, quadratic for the chain fixture. `workflow-surface.js:109–116`; `resolve.js:51–60`. | Prepare summaries lazily for the selected output/run command, or memoize closure/bounds by topology and relevant content revisions. | Selected preview and run bounds remain correct after edits, including branches, terminals and subgraphs. |
| P1 | Every node port scans every wire/portal during attachment preparation. Approximate `O(P × (E+Q))`, plus publisher scans. `workspace-preparation.js:211–239`. | Build directional endpoint and portal indexes once per prepared topology. | Direct and portal connections, rewiring, disconnect menus and navigation preserve exact qualified endpoints. |
| P1 | Library view preparation calls whole-registry inspection for each definition, repeating registry validation and expansion. `workspace-preparation.js:243–270`; `graph-validation.js:264–281`. | Cache library admission, expansion, draw bases and catalog metadata by exact definition reference and library revision. Reuse unaffected entries when a root setting changes. | Exact semantic hashes, pinned versions, editable copies and independent occurrence scopes remain intact. |
| P1 | `Canvas.setGraph` checks every card through a helper that reclassifies the whole graph each time. Approximate `O(N × (N+E+G+D))`. `canvas.js:131–132`; `presentation.js:4–6`; `contracts.js:6–19`. | Classify/admit drawing metadata once. Use the batch pattern already present in `nodeCards` and checked card/pin lookup tables. | Existing batch-admission tests and malformed-drawing rejection continue to pass. |
| P0 | Drawing replacement clears geometry; every full render aligns and remeasures mounted cards. `drawNodes` disconnects/reobserves all cards after measuring them, so initial `ResizeObserver` notifications can measure them a third time. Pin alignment inserts/removes baseline probes between geometry reads. `canvas.js:93–97,135,345–377`; `pin-alignment.js:32–73`. | Retain geometry for unchanged cards and observers for retained elements. Skip/reuse already-measured unchanged observation entries. Mark only size/font/pin-layout changes dirty; batch reads/writes and reuse alignment inputs. | No redundant observer pass after an unchanged measured layout. Preserve real resize/font invalidation, pin ink alignment, wrapped labels, zoom and compact cards. |
| P1 | `saveSettingsDebounced` is called only after synchronous recovery projection, validation, cloning, pretty JSON and parse/validation. A normal edit creates recovery twice immediately and again through a 180ms timer. `controller.js:194–208`; `state.js:253–261,286`; `document-file.js:124–167`. | Publish one latest recovery snapshot per revision, coalesce view/document saves, and schedule noncritical serialization outside input handlers. Explicit Save/close/navigation should flush correctly. | Crash recovery, latest edit retention, explicit saves and document switching remain reliable. Do not merely delay stale snapshots. |
| P2 | Port dragging through empty space redraws all settled wire routes for a ghost-only change. Each route samples two cubic segments 64 times each for its label. `canvas.js:87–90,668–698,726–738`; `connection-route.js:8–35`. | Update the ghost independently; preserve settled-wire DTOs, bounds and focus state until endpoints/topology change. | Ghost snapping, typed feedback, established wires and out-of-viewport routes remain correct. |
| P2 | Entering a new target pin prepares a full candidate; the preview is discarded and release prepares again. Free-pointer motion does not itself prepare a candidate. `native-gestures.js:256–265`; `native-wire-bridge.js:126–164`. | Use cached prepared metadata for immediate type/direction feedback and revision-qualified graph checks where needed. Retain fresh complete commit validation. | Cycles, replacement input rules, portal constraints and stale captures still reject invalid commits. |
| P2 | Shelf click centering does provisional preparation, full workspace preparation, hidden card mounting/measurement, then preparation at final coordinates. An explicit drop point skips this sequence. `controller.js:1707–1722`; `ui/entry.js:6–18`. | Prepare semantic creation once, determine dimensions using a reusable measured representation, and finalize coordinates without repeating semantic preparation. | Small/large cards remain centered, camera remains stable, and creation remains one undo step. |
| P2 | Drag motion routes incident wires incrementally, but still traverses full node arrays, rebuilds group frames and performs repeated selection/focus scans. Crossing the 8px threshold also validates/signs the root once through `beginPositionEdit`. `CanvasLayer.svelte:27–31`; `canvas.js:395–403,435–445,698–713,1069`; `controller.js:641–644`. | Reuse revision-qualified edit capture, cache group membership and update affected frames; skip unchanged focus/selection painting; evaluate indexed position patches if array reconciliation remains expensive. | Multidrag, groups/comments, active hover, keyboard focus and wire selection remain correct. |

`N/E/P/G/D/T/Q` denote nodes, wires, ports, groups, definitions, output targets and portals. Complexity estimates describe loops visible in source, rather than measured asymptotic proofs. Several costs overlap; their times should not be added together as independent percentages.

## Are we utilizing Svelte enough?

There is useful adoption already:

- The workbench and canvas use Svelte 5; nodes, ports, wires and controls are keyed. Full render calls generally preserve retained DOM elements. They rebuild view data and remeasure geometry rather than remounting every element.
- Details owns local `$state` drafts and remains mounted across selection/close/reopen. Configure Node also keeps local form state.
- Camera input is RAF-coalesced and applies a shared viewport transform. Native card geometry and incident-wire routing are cached during motion. Existing compositor hints and overview LOD should remain.
- `setPositions` preserves unchanged card references. Traversing its node array does not establish that every individual node rerenders.

The biggest missed opportunity is **stable, narrowly invalidated view state**:

1. Workbench uses one `$state.raw` view and spreads a new object on every update (`Workbench.svelte:29,35`). This does not prove that every component rerenders on every update, but changed nested DTO identities unnecessarily invalidate consumers.
2. Workflow projection runs twice to choose/evaluate the preview and a third time for root panels (`controller.js:337,341,352`). It then rebuilds panel/control/modifier descriptors (`workspace-preparation.js:124–135,303–307`). Reuse unchanged projections and static option descriptors by revision and selection key.
3. Canvas setters each call `flushSync` (`ui/entry.js:26–32`). Batch updates that do not require an intervening geometry read. Use synchronous flush only at explicit measurement/focus boundaries.
4. Structured row edits stringify all rows, update a parent text draft, and parse the JSON again on each input (`StructuredControl.svelte:21–43`). Keep typed row state while editing; serialize at Save/raw-mode boundaries. Preserve invalid raw JSON drafts.
5. Details grouping is calculated twice and repeatedly copies growing arrays (`NodeDetails.svelte:287–294,364,368`). Derive the grouped controls once; push into arrays during construction. Closed advanced `<details>` still mount their editors; expensive editors can be mounted on demand with parent-owned drafts.
6. Cached status and dirty-check results should be revision-based. Svelte cannot avoid work already performed in an imperative controller before a prop reaches a component.

Choose a stable immutable per-node/per-panel projection API, or a small reactive editor view model with granular properties. Keep authored graph data behind validated transaction boundaries. Adding deep proxies to the entire graph is not a substitute for reducing repeated preparation.

Official Svelte documentation describes [granular updates through deep state](https://svelte.dev/docs/svelte/$state), [derived value identity and push/pull evaluation](https://svelte.dev/docs/svelte/$derived), and [keyed list identity](https://svelte.dev/docs/svelte/each). These mechanisms support the recommendations; the code and probes establish the application-specific findings.

## Coverage and remaining live-host checks

| Area | Evidence in this audit | Additional representative cases |
|---|---|---|
| Details | Enum, committed modifier toggle, structured Save, local JSON switch and local section expansion | Large row/JSON payloads, model profile controls, recorded large outputs, Workflow Data controls |
| Node placement | Centered shelf click and unconnected-search creation | Shelf drag/drop, configured creation, boundaries and nested editable definitions |
| Node movement | Root drag start, live motion and release | Multiselection, comments/groups, nested/library presentation movement |
| Connections | Free preview, new-target compatibility and accepted release | Rewire, portals, multiple-input replacement, invalid/cyclic targets and dense topology |
| Navigation/rendering | Selection, pan and wheel zoom | Enabled recall, many model profiles, large library, viewport culling and physical GPU themes |
| Persistence | Actual LATTICE recovery pipeline and counted mock host save calls | Real SillyTavern settings serialization, host event listeners, open chat/user/actor, saved-file dirty checkpoints |

The fixture keeps LATTICE disabled, has no active actor and uses a no-op host save. The real controller/recovery pipeline is present, but the following live-host costs are not timed:

- With LATTICE enabled and a valid actor, selection/projection calls `syncRecall`, which signs the semantic graph and can resolve it again even without recall shortcuts (`controller.js:167,354`; `host.js:197`; `native-recall.js:47–63`). Profile this enabled path and cache by authored revision/host scope.
- Many profile rows use repeated node/profile searches; recall projection scans graph nodes for each relevant node (`workspace-preparation.js:87–99`; `recall-projection.js:11–27`). Index those inputs.
- An explicitly saved checkpoint causes repeated canonical document snapshots for dirty-state display (`document-session.js:23`; `document-file.js:116`). Cache by authored/presentation revision.
- Actual host plugins, theme styling, chat size, GPU drivers and background work may add cost. The local host at port 8000 redirected a fresh read to SillyTavern's login page; this audit did not measure an authenticated live session.

Existing LOD research addresses camera rendering and retains all graph DOM. It cannot remove transaction/preparation cost. Treat culling as a later scalability project after the measured commit/release waste is reduced; retained geometry, selected/focused/dragged nodes and crossing wires require deliberate handling.

## Suggested implementation sequence and success criteria

1. Add named timing spans for capture, candidate preparation, commit/history, workspace/library preparation, panel projection, geometry and recovery. Record action-to-paint separately from synchronous handler time and background save work.
2. Remove duplicate root activation and graph/trace rendering; preserve geometry for unchanged cards and prevent redundant initial `ResizeObserver` remeasurement after synchronous layout.
3. Introduce layout-only invalidation, indexed attachments and cached definition admission. Avoid eager summaries for every possible output.
4. Coalesce recovery serialization and host saves; make dirty-state checking revision-based.
5. Stabilize Svelte DTOs, batch flushes, retain typed structured drafts and isolate ghost updates.
6. Repeat matched benchmarks and profile an authenticated SillyTavern session with the actual slow workflow. Add large text, nested definitions, a populated library, groups and enabled recall/profile cases before claiming general scalability.

Proposed targets: local feedback within one frame when practical; common Details/creation/connection feedback below 100ms, with a 200ms upper target on representative hardware; live drag/preview frames within the 16.7ms budget at 60Hz. These are proposed acceptance targets, not achieved results. Google's [INP guidance](https://web.dev/articles/optimize-inp) uses 200ms for good interaction responsiveness. The audit's two-frame settling metric is not INP.

Tests should preserve functional boundaries while asserting work counts: zero semantic preparation for camera/selection and layout-only release; one canvas render/geometry pass when required; no remeasurement for status-only updates; unchanged card/wire identity; bounded recovery saves; valid/invalid/stale edits, history and recovery all retained. Use browser performance comparisons for timing, rather than brittle fixed-millisecond unit assertions.

## Reproduction and artifacts

- [Probe](artifacts/editor-latency/audit-editor-latency.mjs)
- [Measurements](artifacts/editor-latency/editor-latency-results.json)
- [Motion rerun with a setup debounce wait](artifacts/editor-latency/editor-latency-motion-clean.json)
- [Small-fixture probe guard verification](artifacts/editor-latency/editor-latency-guard-verification.json)
- [Frozen source/build fingerprints](artifacts/editor-latency/editor-latency-source-manifest.json)
- [CPU profile, instrumented 250-node Details toggle](artifacts/editor-latency/detail-toggle-250.cpuprofile)
- [Reproducible CPU attribution script](artifacts/editor-latency/analyze-editor-profile.mjs) and [sampled summary](artifacts/editor-latency/editor-latency-profile-summary.json)
- [Runtime, commands and artifact hashes](artifacts/editor-latency/audit-provenance.json)
- [Prior camera/LOD investigation](2026-10-09-canvas-level-of-detail-performance.md)

From this repository:

```powershell
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs
```

Options: `--source=<checkout>`, `--output=<directory>`, `--sizes=25,100,250`, `--rates=1,4`, `--repeats=7`, `--modes=<comma-separated action names>`. CPU rates above 1 run only the 100-node size; include that size to exercise stress conditions. Motion probes run for each selected size/rate independently of `--modes`. Reruns overwrite the result/profile paths, so retain a copy when comparing builds. The target needs dependencies, installed Playwright Chromium, and a production bundle matching its source.

The probe starts a temporary local server, blocks nonlocal/mutating HTTP requests and provider calls, and closes browser/server afterward. The full workspace is mounted, including Details and Preview. Baseline action medians exclude instrumentation; diagnostic counters and the CPU profile use separate instrumented samples. Motion samples are instrumented. The final probe waits 220ms after setup before action/motion samples to let the ordinary debounce settle; it does not suppress legitimate camera saves or guarantee quiescence. All durations are nested where applicable, and CDP script/task/layout metrics cover the larger sampling window, including setup scans/frame alignment. No production source or generated asset was changed for this audit.

To rerun against the retained local snapshot without overwriting the original artifacts:

```powershell
node docs/research/artifacts/editor-latency/audit-editor-latency.mjs --source=.tmp/editor-latency-baseline --output=.tmp/editor-latency-rerun
node docs/research/artifacts/editor-latency/analyze-editor-profile.mjs docs/research/artifacts/editor-latency/detail-toggle-250.cpuprofile
```

The `.tmp` snapshot is local and ignored by Git. A different checkout needs its own matching production build; the fingerprints allow comparison with this audit's exact inputs.

Verification: the frozen production bundle was built successfully with Vite (180 modules). The full benchmark completed 72 result groups: 280 plain action repetitions, 40 separate instrumented action samples and 32 instrumented gesture samples, plus discarded warmups. The matched-build clean-motion run completed 36 groups, and the final small-fixture guard run completed 18. All three report zero browser errors, blocked requests and provider calls. The final probe checks committed values, creation/connection counts, selection, local editor state, persisted drag coordinates, camera changes and moved/cancelled wire previews. Probe/profile-script syntax, 267 frozen input fingerprints, artifact hashes, sampled-profile totals and local report links were checked. Performance targets above remain unmet; these checks validate the investigation and its data.
