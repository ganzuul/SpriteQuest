# Blueprint Connections and Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ship direct Blueprint-style connections and portable nonexecuting comment frames, then push verified changes to main.

**Architecture:** Isolate spline geometry and comment document operations in small modules. Canvas consumes those modules; dedicated Svelte frame/details components handle comment presentation. Notes carry authored comment data through the existing native graph pipeline.

**Tech Stack:** JavaScript ES modules, Svelte 5, Node tests, Playwright.

**Spec:** docs/superpowers/specs/2026-10-09-blueprint-connections-comments-design.md

## Global Constraints

- User approved autonomous implementation and normal push to main; no force push.
- All work occurs in the attached isolated worktree. Preserve concurrent cleanup and unrelated primary files.
- No perimeter lanes or global obstacle router. Comments are nonexecuting notes, never execution groups.
- Use cached geometry and the qualified native edit pipeline. Keep opaque text, pins and run indicators.
- GitHub CLI always uses network-enabled permission; expired authentication requires user reauthentication.

## Review Focus

- Same-height backward curves retain curvature and clear horizontal pin departure.
- Drag previews, hit targets and labels match the visible route at all zooms.
- Comments cannot affect execution semantics or enable invalid connections.
- Empty selections, contained nodes and read-only/nested documents remain predictable.
- Undo, clipboard and portable exports preserve comment settings without deleting contained nodes.

### Task 1: Shared smooth connection geometry

**Files:** Create src/canvas/connection-route.js; tests/connection-route.test.mjs. Root integrates src/canvas.js, ui/WireLayer.svelte and style.css.

**Interfaces:** buildConnectionRoute(from, to) returns { d, label: { x, y } }. Endpoints carry graph x/y and side. Horizontal necks and compact rounded backward bows are encoded by the route.

- [x] Write and observe failing behavior tests for horizontal departure/arrival, forward compactness, equal-height backward bow, close/vertical cases, route label placement, finite coordinates.
- [x] Implement route helper; run focused tests and self-review.
- [x] Integrate shared path and label result for settled and preview wires; add endpoint highlighting and background translucency.
- [x] Verify renderer alignment and hover behavior with browser tests.

### Task 2: Nonexecuting authored comment frames

**Files:** Create src/canvas/comment-frames.js and tests/comment-frames.test.mjs; extend src/workflow/packages.js and focused export/clipboard/history tests only as required.

**Interfaces:** Pure helpers createCommentFrame(graph, ids, boundsFor, options), containedCommentNodes(graph, frame, boundsFor), fitCommentFrame(graph, frame, boundsFor), and isCommentFrame(node). Notes use commentFrame/moveContents metadata. Return a new frame from creation; root inserts through the qualified edit pipeline.

- [x] Write and observe failing tests for measured selection padding, empty frame, containment/fit, nonexecuting identity, export/import, clipboard and undo behavior.
- [x] Implement focused helpers and portable fields; ordinary notes remain unchanged.
- [x] Run focused tests and self-review the persisted model.

### Task 3: Native comment interaction and presentation

**Files:** Root owns src/canvas.js; ui/CanvasLayer.svelte; new ui/CommentFrame.svelte and ui/CommentDetails.svelte; ui/types.ts; src/ui/controller.js; style.css; browser/comment and Canvas integration tests. Coordinate cleanup changes before shared edits.

- [x] Write and observe failing tests for selection/right-click/C creation, title/notes, resize/fit/move/delete-only, read-only/scoped edits and interior click-through.
- [x] Add frame layer behind wires and nodes, measured geometry, frame selection and header/resize gestures using captured containment.
- [x] Add context/keyboard commands and dedicated details editing through existing native document pipeline.
- [x] Run focused Node/browser checks and visually inspect forward/backward wires and comments at narrow/normal sizes.

### Task 4: Integration, independent review and main delivery

- [x] Coordinate cleanup integration order and apply the latest cleanup baseline safely.
- [x] Run full Node/type/build/assets/browser/smoke checks appropriate to the final baseline.
- [x] Independently review the combined change, fix actionable findings and reverify affected behavior.
- [ ] Commit only owned changes, fetch and integrate remote updates normally, push main without force, verify remote SHA and report completion.
