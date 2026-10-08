# Silly Canvas Svelte UI migration design

## Outcome and authorization

Make Silly Canvas immediate to zoom, pan, select, and move blocks, including
close zoom. Rebuild its workbench and canvas views with maintainable Svelte
components while retaining saved canvases and prompt semantics. The user
approved the rendering audit and authorized design, planning, implementation,
isolation, verification, and local commits on 2026-10-07, then explicitly added
ComfyUI-style mouse selection. This authorization replaces additional workflow
approval handoffs. Execute continuously and record real blockers and rulings.

## Evidence and selected approach

Controlled Chromium measurements with the original renderer and CSS:

- 250 blocks / 496 wires: 497 layouts and about 40 ms per zoom event.
- Applying only the camera transform: unchanged wire geometry and <0.2 ms.
- 100 blocks: per-card graph-wide analysis produces 156–185 ms full renders;
  sharing one analysis reduces that to about 20 ms.
- The default 12 px backdrop blur and Neon wire filters cause missed pan frames;
  isolating their removal restores roughly 16.7 ms frames in matched fixtures.

Patch-only would retain the monolithic view and whole-tree replacement model.
SvelteFlow would require adapters for blankets, folded groups, named ports,
reverse save wires, loops, together ties, and position-dependent prompt order.
Select a **Svelte workbench with a dedicated camera and graph renderer**. Borrow
Pomegranate's headless state bindings, stable keyed components, explicit host
adapters, pointer lifecycle handling, and semantic styling. Keep product-owned
source and avoid introducing its complete layout engine or unpublished packages.

## Global constraints

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

## Architecture and ownership

SillyTavern enters through the existing UI facade and domain APIs. Svelte receives
explicit projections and callbacks, never its own bundled copy of domain state.

| Unit | Responsibility |
| --- | --- |
| Camera utilities | Pointer-anchored zoom, coordinate conversion, wheel normalization, limits |
| Frame scheduler | Coalesced visual work, explicit flush, cancellation, teardown |
| Selection utilities | Hit testing, replace/add/remove/toggle selection, gesture precedence |
| Canvas controller | Existing graph edits, wiring, drag, groups, keyboard and pointer lifecycle |
| Geometry cache | Unscaled node/group dimensions and endpoint/adjacency invalidation |
| Graph projections | Node cards, wires, group frames, focus and shared graph analysis |
| Svelte renderer | Stable keyed node/group/wire identities and declarative card/SVG markup |
| Svelte workbench | Header, graph picker, status, panes, canvas controls and layout |
| Domain editor adapters | Specialized editors, State window, theme editor and model controls |
| UI facade/controller | Compatible public exports, domain callbacks and host subscriptions |

Camera changes update the existing graph `view` envelope for persistence while
bypassing topology analysis, token counting, inspector work, and graph DOM
creation. Graph edits commit through existing domain functions and undo; only
changed projections are updated. Svelte owns canvas markup and workbench
controls. Specialized domain input builders may remain in named adapter
components; document them honestly and keep their work independent of camera
motion. Split focused controller/adapter modules rather than grow the UI monolith.

## Camera behavior

Normalize wheel deltaMode: pixels use the actual delta, lines use 16 px per line,
pages use canvas height. Use exponential zoom with sensitivity 0.002 per pixel;
clamp one event's effective delta to [-240,240]. Ignore zero vertical delta.
Preserve the graph point under the cursor and camera bounds. Accumulate input
but schedule at most one visual update per animation frame. No transform easing
trails the pointer. Direct APIs and fit can flush when immediate measurement is
required. Mouse fallback and pointer capture must cancel cleanly on focus loss,
pointer cancellation, close, teardown, and graph changes.

## ComfyUI-style selection contract

Reference the current [ComfyUI shortcut documentation](https://docs.comfy.org/interface/shortcuts)
and [selection tests](https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/src/lib/litegraph/src/LGraphCanvas.selection.test.ts).
Their tests establish plain/add/subtract marquee, modifier clicks, and the Space
pan override. Adopt the useful behavior with consistent precedence; do not copy
known failing cases or model execution shortcuts irrelevant to Silly Canvas.

| Gesture | Behavior |
| --- | --- |
| Click a block | Select it; a stationary click on one member of a multi-selection narrows to it on release |
| Ctrl/Cmd-click | Toggle the block in the selection |
| Shift-click | Add the block; clicking an already-selected block preserves the selection |
| Left drag empty canvas | Live rectangular selection, replacing prior selection |
| Shift or Ctrl/Cmd + empty drag | Add rectangle hits to the selection captured at gesture start |
| Alt + empty drag | Remove rectangle hits; Alt takes precedence over additive modifiers |
| Middle drag or Space + left drag | Pan without changing selection, including when starting over a block |
| Drag any selected block | Move the whole selection and retain relative positions; one undo action |
| Empty click | Clear selection; a <4 px screen movement remains a click |
| Ctrl/Cmd+A | Select all visible blocks, including folded group cards as selectable group units |
| Escape | Cancel active gesture first, restoring its start state; clear selection on the next Escape |
| Delete / Copy / Cut / Paste | Apply to the selection while respecting text input and clipboard behavior |
| Ctrl/Cmd+G | Group selected blocks using existing group/blanket semantics |
| Period | Fit selection, with fit-all as a fallback for no selection |

Rectangle hit testing uses intersection, accepts drags in all four directions,
and operates in graph coordinates at any zoom/pan. Treat a folded group as its
visible card and include its members for selection commands without exposing
hidden node geometry. Output can be selected and moved but retains existing
delete/group protections. Live feedback must not rebuild cards. Shift-drag
selected blocks also moves the selection. Modifier clicks inside an input do
not hijack text editing. Right-click retains context menus and does not pan.
Keep clear toolbar Select/Pan modes for discoverability; Select is the default.

## Incremental rendering

Key nodes, groups, wire hit paths, visible paths and labels by stable IDs. Camera
and selection updates retain their identities. Token and trace updates change
presentation fields. Drag only affected elements and update incident wires
once per frame; commit graph/undo work on release. Cache unscaled dimensions,
populate after mounting, and refresh via ResizeObserver or a measured batch
fallback. Never interleave per-wire DOM reads and SVG writes. Prepare endpoint
geometry before applying presentation. Share duplication and Generate-wave
analysis once per graph revision/render.

Culling is optional after measurement. If introduced, cache offscreen dimensions
and include crossing wires with offscreen endpoints; do not change topology or
guess folded-card dimensions. No spatial index is needed without evidence.

## Visual direction

Use a compact labeled action header, legible central canvas, discoverable Select/
Pan controls, calm library and inspector panes, and an accessible preview. Retain
theme presets, color meanings, custom themes, and light/dark behavior. Remove
the workbench's full-screen backdrop blur; use panel surface colors. Suppress
wire filters during active camera/selection/drag gestures. Focus states and
keyboard controls use native buttons. Decorative transitions respect reduced
motion; positions update directly. Narrow layouts retain collapsible panes.

## Build and host integration

Commit relative-path ESM assets consumed by the extension. Bundle Svelte and its
components, not duplicate domain modules. An isolated harness uses the existing
SillyTavern mock and never sends model calls. Verify production assets contain no
development URLs. Keep `open`, `close`, `toggle`, `isOpen`, `refreshIfOpen`, token,
library and preview exports compatible. Build output must be reproducible.

## Acceptance and completion

Use red-green tests for camera, scheduler, selection, renderer identity and
adapters; run all existing tests. Browser acceptance covers real rectangle
drags (not a select-all substitute), selection modifiers, drag thresholds,
capture/cancel, zoom anchoring and limits, burst inputs, graph switching,
reopen, resizing, themes, undo, groups, named ports, wire modes, loop/save/tie
paths, clipboard/library, preview/tokens, tall cards, negative positions and
stale asynchronous results. Validate desktop/narrow layouts and keyboard use.

Deterministic performance assertions: camera work creates no graph DOM, does
not measure endpoints, and forces no per-wire layouts; analysis runs once per
revision/render; multiple input events schedule one visual update per frame.
On the audit machine, target camera handler p95 <=1 ms for 250 blocks/496 wires
and steady camera frames median <=18 ms, p95 <=25 ms under default and Neon
gesture styling. Store matched timing evidence; do not make universal CI rely
on noisy wall-clock thresholds.

Completion requires feature-parity records, passing existing and new tests,
production assets and type/build checks, browser visual review, before/after
performance evidence, fresh branch review, and committed source/build output.
Keep the goal active until this is achieved. Report exact limitations rather
than labeling partial migration complete.
