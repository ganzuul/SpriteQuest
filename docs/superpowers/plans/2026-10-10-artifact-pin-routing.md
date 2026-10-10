# Artifact pin and routing implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the approved direct wires and fixed small artifact shapes across all themes in an isolated worktree.

**Architecture:** Keep routing in the shared graph-space helper. Share artifact glyph geometry across node, thumbnail and theme legend renderers; themes own palette and accessibility styling. Retain measured pin endpoints and existing interaction targets.

**Tech Stack:** JavaScript ES modules, Svelte 5, CSS, Node test runner, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-10-artifact-pin-routing-design.md`

## Global Constraints

The spec's exact sizes, colors, seven shapes, endpoint side behavior and layout constraints apply to every task. Worktree base: 7d1c0cf8b474484622152b7b14b86cce51ed8822. Implement and verify in the worktree, then integrate its verified commit by local fast-forward into `main`.

## Review Focus

- Crossing coincident lead ends and level alignment must not cause NaN, sudden jumps or broad detours.
- Snapped drags from either input or output must match settled geometry and color.
- Theme/font changes must keep visible glyph centers, measured wire anchors and labels aligned.
- Signal/Harbor selection and compatibility cues must remain distinguishable with fixed glyphs.
- Example thumbnails and the theme legend must use live type geometry and palettes.

### Task 1: Direct connection geometry

**Files:** `src/canvas/connection-route.js`, `tests/connection-route.test.mjs`, `tests/browser/connection-curves.spec.mjs`.
**Interfaces:** Preserve `buildConnectionRoute(from,to) -> {d,label}` and `buildDragConnectionRoute(origin,pointer) -> {d}`. Consumers retain shared path/hit geometry and whole-route half-arc-length labels.

- [x] Write tests for 25px leads, a straight middle span, compact almost-level returns, coincident lead continuity, all pin sides and finite coordinates; replace superseded broad-bow expectations.
- [x] Run `npm test -- connection-route` and observe the new behavior fail.
- [x] Replace broad blended splines with compact turns and a direct span; use a bounded continuous fallback around coincident lead ends.
- [x] Run the route tests and the connection-curves browser tests; preserve existing free-drag behavior.

### Task 2: Shared pin geometry, palettes and alignment

**Files:** `ui/NodeCard.svelte`, `ui/ExamplesBrowser.svelte`, `src/theme.js`, `src/theme-editor.js`, `style.css`, new shared glyph/alignment helpers, corresponding theme/pin unit tests, `tests/browser/accessible-themes.spec.mjs`, new pin design browser tests.
**Interfaces:** Shared seven-kind SVG geometry at scale 0.5625; unchanged .pc-port datasets and 24px wrapper; existing --pc-kind-* roles provide matched pin/wire colors. Preserve compatibility feedback and accessible patterns. Expose optical pin placement to existing DOM endpoint measurement.

- [x] Add runtime tests proving all themes keep identical type geometry, match wire/pin colors, render triangle Patches, preserve interaction targets and align visible label ink.
- [x] Observe intended failures before production edits.
- [x] Implement the shared glyphs and font-aware alignment, apply the default palette with accessible overrides, migrate thumbnail and theme legend cues, and hide redundant type labels until hover or selection.
- [x] Verify focused unit/browser tests and theme/font transitions, including Signal and Harbor.

### Task 3: Wire presentation and integration verification

**Files:** `src/canvas.js`, `ui/WireLayer.svelte`, `ui/types.ts`, `ui/CanvasLayer.svelte` only as needed, related canvas tests; documentation and verification evidence.
**Interfaces:** Settled/snapped routes consume Task 1; pin centers and palettes consume Task 2. Ghost DTO adds artifact kind for live color. Wire label associations allow hover/selection without permanent canvas clutter.

- [x] Add failing real-canvas tests for typed previews, default hidden labels and hover/selection disclosure; implement the minimum DTO/rendering changes.
- [x] Run `npm test`, `npm run check:types`, `npm run build`, `npm run check:assets` and browser coverage for routing, pin themes, connection gestures and theme/font transitions.
- [x] Inspect actual Ember, Harbor and Signal screenshots and obtain an independent whole-change review. Resolve material findings.
- [x] Commit the reviewed worktree changes and report the branch, verification and integration state.
