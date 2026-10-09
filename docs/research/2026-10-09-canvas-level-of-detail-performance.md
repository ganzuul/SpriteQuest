# Canvas zoom level-of-detail investigation

Date: 2026-10-09. Benchmarked published main `f06bbb2354b432924e6508eae61697f036fe94e7` in an isolated checkout, keeping concurrent workspace edits untouched. This is research; no application behavior was changed.

## Finding

A geometry-preserving node overview mode is worth a small implementation. It reduced measured Chrome browser task time by approximately 4–16% in synthetic scenes containing 100–500 nodes. The effect on frame rate was smaller: most scenes already sustained approximately 60 fps. At 500 mounted nodes / 350 initially visible nodes, Neon recorded 11 frame intervals above 25 ms with full cards versus 7 with simplified nodes, across two samples of 89 intervals each.

This is performance headroom, not evidence of a guaranteed large desktop FPS improvement. The browser used software rendering (SwiftShader). Physical GPU behavior, real graphs, more densely connected graphs, notes, running status updates, and the concurrent subgraph editor changes need further validation.

## Current renderer

- `src/canvas.js:applyTransform` changes one shared graph transform and the background grid. It updates camera controls, but does not reconstruct node or wire arrays during ordinary camera motion.
- Actual zoom/pan applies `pc-interacting` / `pc-panning`. These provide `will-change: transform` on the viewport and suppress wire filters during interaction. These existing optimizations materially affect results and must be present in any comparison.
- `ui/CanvasLayer.svelte` mounts all unfolded node cards and wires. There is no camera-based detail mode or viewport culling.
- `ui/NodeCard.svelte` renders a heading/title/icon and named input/output rows, with optional note content and result controls.
- `ui/WireLayer.svelte` renders a hit path, visible path/title, and outlined text label for every wire.
- Geometry and named pin endpoints are measured and cached. The existing compact presentation changes heading/pin layout and card size; using that mode automatically during zoom could shift wire endpoints and fit/selection geometry.

## Experiment

Real built Svelte Workbench and Canvas; Chromium 151.0.7922.34; browser viewport 1440 × 900; zoom oscillating between 0.25 and 0.275 with a small matching translation. The mounted workbench determines the canvas area, so viewport size is not equivalent to canvas host size. Initially visible counts were measured against the actual host.

Each graph uses Compose nodes with four text sections, resulting in six ports per card, and a single chain of `N - 1` named-pin wires. There were two repeats per condition, reversing condition order on the second repeat, and 90 requested animation frames per sample. CPU was not throttled. Camera transforms use the production `applyTransform` and camera-control hook, with the actual interaction compositor hint enabled; the probe bypasses wheel input/easing to give every condition the same camera trajectory.

Conditions:

1. **Baseline:** existing cards and wires.
2. **Node overview:** hide port labels, heading icons, note bodies and host-result controls using `visibility: hidden`; remove unselected node shadows. Preserve titles, port dots, outer sizes and port positions. Keep DOM mounted.
3. **Node + wire overview:** same node changes, plus `display: none` on SVG wire labels.

Task time below is CDP `Performance.TaskDuration` averaged across the two samples. It includes browser task work, not solely painting. One repeat of each 500-node condition also collected timeline traces; comparisons at that size therefore average one traced and one untraced sample per condition.

| Mounted / initially visible | Theme | Baseline task ms | Node overview task ms | Reduction | Intervals >25 ms, baseline → overview |
|---|---|---:|---:|---:|---:|
| 100 / 100 | Ember | 202.7 | 187.5 | 7.5% | 0 → 0 |
| 100 / 100 | Neon | 282.4 | 270.7 | 4.1% | 0 → 0 |
| 300 / 266 | Ember | 604.1 | 507.8 | 15.9% | 0 → 0 |
| 300 / 266 | Neon | 845.7 | 738.7 | 12.7% | 0 → 0 |
| 500 / 350 | Ember | 1046.2 | 949.8 | 9.2% | 0 → 0 |
| 500 / 350 | Neon | 1393.0 | 1257.2 | 9.7% | 11 → 7 |

All 36 completed samples retained node/wire DOM identity, performed no workspace preparation during motion, and recorded zero layout duration during motion. Sampled card widths/heights and pin offsets remained unchanged across modes. The 500-node scene contained 13,999 graph descendant elements, 3,000 ports, and 499 wires; the CSS overview kept that DOM count unchanged.

Hiding wire labels did **not** provide a consistent benefit. With the production compositor hint, Neon at 500 nodes worsened from 11 to 101 intervals above 25 ms across the two samples, and average task time increased from 1393.0 to 2430.0 ms. The precise cause was not isolated; changes to SVG painting/compositing are a hypothesis, not a finding. Do not ship wire-label removal on the basis of a general assumption that fewer visible elements always help.

A preliminary run omitted the production compositor hint and overestimated the benefit. In the traced Ember 500-node sample, baseline summed raster-task duration fell from roughly 2070 ms without that hint to 15 ms with it. Worker raster durations are summed across threads and are not frame latency. The final recommendation uses the corrected run. A 1000-node four-section fixture exceeded bounded workflow-data admission and was excluded; no performance result is claimed for it.

The initial graph admission took approximately 0.17–1.12 seconds in the corrected run, including preparation, synchronous rendering and waiting for two frames. CSS changes made after mounting do not reduce that initial work or DOM memory. Detail-mode transition cost was settled before timed motion, so its one-time cost remains to be measured.

## Suggested implementation

Start with one automatic **overview** level, rather than multiple aggressive representations.

- Enter overview below about 50% zoom; return to full detail above about 60%. These are starting values for visual testing. The gap provides hysteresis, preventing repeated switches when zoom hovers near a threshold. At 25% zoom a normal 12px label is only 3px on screen.
- Evaluate the displayed camera zoom in `applyTransform`, and update a host detail attribute/class only when the level changes. Avoid passing a changing zoom prop to every card or rebuilding graph presentation arrays on every frame.
- Use CSS to hide low-value text/icons and reduce shadows while retaining card dimensions and pin dots. Start with the measured node-only changes. Keep family color, selection, disabled state and execution/error indicators legible.
- Reveal full visual detail for selected, hovered or keyboard-focused nodes without resizing them. Keep inspection and keyboard access useful; hidden labels/controls must not become an accessibility or interaction trap.
- Keep cached node geometry, drag/selection/fit behavior and wire endpoints fixed. Detail level is ephemeral camera state and should not modify workflow data or history.
- Cover threshold crossings, animated zoom retargeting, hover/selection/focus overrides, notes, groups, boundary cards and execution states. Check no geometry jumps, no repeated preparation/DOM reconstruction, and no transition spikes. Benchmark representative real graphs across themes and physical GPU hardware.

The first pass fits mainly in `src/canvas.js` and `style.css`, with focused browser coverage. Svelte components may need small hooks for focus/detail overrides; replacing the renderer is unnecessary for this experiment. Removing DOM subtrees would be a separate step requiring a stable card shell and cached or proxy pin geometry.

For larger scalability improvements, investigate **viewport culling** separately: compute a padded visible rectangle in graph coordinates, retain geometry independently of mounted cards, and mount only relevant cards. Keep dragged/focused/selected nodes available and include wires whose curves cross the viewport even when their endpoints are outside. Culling can reduce mounted DOM and update work; LOD makes visible content cheaper. Their benefits address different costs.

## Reproduction and sources

- [Probe script](artifacts/canvas-lod/benchmark-canvas-lod.mjs)
- [Corrected measurements](artifacts/canvas-lod/canvas-lod-results.json)
- [Preliminary measurements without the gesture hint](artifacts/canvas-lod/canvas-lod-without-gesture-hint.json)

Both scripts default to the repository containing this report, regardless of the invoking directory. Pass a target repository path as the first argument to benchmark a different checkout. The target checkout needs its normal dependencies and a built `dist/lattice-ui.js` matching its source and styles. Each script starts a local HTTP server and writes results beside itself; save a copy of the checked-in measurements before rerunning if you need to keep them unchanged.

From the repository root:

```sh
node docs/research/artifacts/canvas-lod/benchmark-canvas-lod.mjs /path/to/baseline-checkout
node docs/research/artifacts/canvas-lod/benchmark-canvas-lod-implementation.mjs /path/to/implementation-checkout
```

The original CSS probe measured published main `f06bbb2354b432924e6508eae61697f036fe94e7`, before automatic LOD existed. Its baseline must use that renderer; running it against a checkout with automatic LOD would change the comparison. The implementation script requires the automatic overview feature and compares it with CSS restoration of full idle-card visuals. The saved implementation results came from the approved working tree based on that same main commit. The preliminary JSON is retained as the historical run without the production gesture hint; the copied probe contains the corrected gesture hint.

The Gaea comparison is the user-observed behavior. Its exact Gaea 2 cutoff and rendering implementation were not verified. Official [Gaea UI documentation](https://docs.gaea.app/ui/index.html) describes the Infinity Graph, but does not establish those implementation details. Chrome's [runtime performance guide](https://developer.chrome.com/docs/devtools/performance) distinguishes JavaScript, layout, paint complexity and compositing, which is why this investigation measures the real browser pipeline rather than treating node count alone as frame cost.

## Approved implementation follow-up

Implemented the node overview in the shared workspace after approval. It enters below 50% displayed zoom and exits at 60%. Selected, multiselected, hovered and keyboard-focused cards retain full details. Compact cards retain their primary icon and alias. Running and failed execution rings, titles and port dots remain visible. Extra card actions and ordinary note bodies are hidden without changing geometry; comment frames and group controls remain available. Wire rendering is unchanged.

Detail scope uses the existing graph-view identity, including library definition revisions. Same-view preparation refreshes retain hysteresis; switching root, instance or library views resets it. A regression test navigates library A at 55% → library B at 25% → A at 55% to verify this.

Cards are keyboard focus stops so their hidden controls can be reached. Browser focus scrolling is adopted into the camera translation and the host scroll offset is reset to zero, preserving rendered position, hit testing, the grid and camera persistence. This was verified with an offscreen card in a 100-node scene.

The implementation comparison used production automatic LOD against benchmark CSS restoring full idle-card visuals. Both conditions used the same production camera, compositor hint, graph data and retained DOM. Two reversed-order samples per condition; the same software Chromium environment and limitations apply.

| Mounted nodes | Theme | Full-detail task ms | Automatic overview task ms | Task-time reduction | Intervals >25 ms, full → overview |
|---|---|---:|---:|---:|---:|
| 300 | Ember | 678.1 | 607.1 | 10.5% | 0 → 0 |
| 300 | Neon | 893.5 | 966.7 | -8.2% | 0 → 2 |
| 500 | Ember | 1063.6 | 869.6 | 18.2% | 0 → 0 |
| 500 | Neon | 1391.4 | 1233.3 | 11.4% | 11 → 6 |

All 16 samples retained node/wire identity and sampled geometry, recorded zero layout duration and performed no preparation during camera motion. Smaller-scene results varied: the 300-node Neon pair did not show a task-time improvement, while median frame intervals remained approximately 16.7 ms. No universal FPS or task-time improvement is claimed.

- [Implementation comparison script](artifacts/canvas-lod/benchmark-canvas-lod-implementation.mjs)
- [Implementation measurements](artifacts/canvas-lod/canvas-lod-implementation-results.json)
- Regression coverage: `tests/browser/node-lod.spec.mjs`, including thresholds, stable geometry, hover/selection/focus, scope changes, execution indicators, animated zoom and offscreen keyboard focus.

Final verification: shared workspace 113/113 unit test files and 13/13 focused LOD/camera browser tests passed; type check reported zero errors/warnings, and build/assets checks passed. In the isolated checkout based on published main, all 162 browser tests passed with the final feature applied. Independent review reported no remaining findings. Concurrent workspace edits were preserved.
