# Node Profile Dropdowns Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement the approved per-node profile controls and dynamic active-model default in the isolated worktree.

**Architecture:** Keep runtime connection authority separate from prepared display data. Render profile decorations in a sibling canvas layer using cached native geometry; route selection through existing qualified binding commands. The runtime and canvas rendering tasks have disjoint ownership and can proceed independently before controller integration.

**Tech Stack:** JavaScript modules, Svelte 5, TypeScript UI contracts, Node test runner, Playwright, Vite.

**Spec:** `docs/superpowers/specs/2026-10-10-node-profile-dropdowns.md`

## Global Constraints

- Work only in the managed `node-profile-dropdowns` worktree on `codex/node-profile-dropdowns`.
- Match the approved mock's profile controls and model-only labels; no helper footer or new setup panel.
- The special choice is named `Active SillyTavern model`, always first, with subtitle `Follows SillyTavern’s current model`.
- New model-capable nodes use an explicit active binding; existing null/absent bindings retain inheritance/block semantics.
- Never mutate host settings or activate profiles to send auxiliary requests; preserve request limits, cancellation and completion evidence.
- Keep profile data to safe display fields; never expose credentials, endpoints or raw settings in canvas DTOs.
- Preserve shared/pinned definition ownership, stale-context validation, and Undo/Redo.
- Run tests before implementation for substantive behavior; do not commit unrelated files or personal profile fixtures.

## Review Focus

- Active API/model/samplers change after preflight: reject stale authority before transmission.
- A selected profile disappears: show unavailable rather than execute with another profile.
- Deep pinned sibling instances: selecting one occurrence must not affect the other or definition identity.
- List interaction under zoom/pan and compact nodes: correct alignment and no canvas/hotkey side effects.
- Popup selection after changing workflow/tab or host profile list: stale actions cannot edit a new document.

### Task 1: Active host connection binding

**Files:**
- Create: `src/workflow/model-profiles.js`
- Modify: `src/workflow/catalog.js`, `src/workflow/connections.js`, `src/workflow/host.js`, `src/workflow/definition-data.js`, `src/workflow/packages.js`, `src/workflow/insertion.js`
- Test: new `tests/workflow-active-model.test.mjs`, relevant existing binding/host/package tests.

**Interfaces:**
- Export `ACTIVE_PROFILE_ID = 'lattice:active-sillytavern'` and `ACTIVE_PROFILE_NAME = 'Active SillyTavern model'` from `model-profiles.js`.
- Export `activeModelMetadata(context)` returning safe `{ api: string, apiLabel: string, model: string | null }` or null, without request authority or secrets.
- Keep `resolveBinding(node, graph, context)` and object-context request calls compatible; permit a context getter for fresh active authority.
- Later tasks consume the constants/metadata and existing resolved binding `model` field.

- [x] Write and run failing tests for default node creation, active routing/model refresh, request limits/abort/freshness, preserved role inheritance, pinned occurrence overrides and portable active binding identity.
- [x] Add the explicit factory default only for model-capable operations. Retain the active marker through portable definitions/packages while stripping actual local profile IDs exactly as before.
- [x] Resolve active chat/text settings and use verified public host services directly; Connection Manager requires a fixed profile ID. Preserve all fixed-profile behavior and request evidence checks.
- [x] Run targeted runtime/host/definition/package tests and record commands/results in `.tmp/node-profiles/task-1-report.md`.

### Task 2: Canvas profile picker and model decoration

**Files:**
- Create: `ui/NodeProfilePicker.svelte`, `ui/node-profile-types.ts`
- Modify: `src/canvas.js`, `ui/CanvasLayer.svelte`, `ui/entry.js`, `ui/types.ts`, `tests/canvas-fixture.mjs`
- Test: new component/canvas tests; renderer fixture integration.

**Interfaces:**
- `Canvas.setNodeProfiles(rows)` accepts prepared rows with `id`, qualified `selection`, `value`, `label`, `model`, `editable`, and shared `options` (`value`, `label`, `apiLabel`, `model`, `active`). It adds measured x/y/w/h and compact clearance before calling layer `setNodeProfiles(rows)`.
- Extend canvas actions/hooks with `editProfile(selection, value)` returning the existing binding edit result; the component receives current prepared authority with the row.
- Controller task supplies rows after each workflow/view/host preparation; renderer must not read host settings or resolve bindings.

- [x] Write and run failing tests for bar/label geometry, keyword selection, active row first for all queries, independent choices, scroll containment, outside dismissal and stale row replacement.
- [x] Render a sibling profile overlay inside the camera-transformed viewport using actual cached node bounds. Keep node/pin measurement unchanged and update decorations during drag, resize, compact presentation and collapse.
- [x] Match the approved mock's grey bar, plain model label, popup dimensions, spacing, row typography and checkmarks. Position popup within visible canvas bounds and retain full-name tooltips.
- [x] Exclude `.pc-node-profile` controls from native pointer/wheel/double-click/context-menu and global keyboard shortcuts. Support Escape/arrows/Enter and ordinary tab focus.
- [x] Run focused component/native canvas tests and record evidence in `.tmp/node-profiles/task-2-report.md`.

### Task 3: Prepared metadata, controller integration and full visual verification

**Files:**
- Modify: `src/ui/controller.js`, `src/ui/workspace-preparation.js`, `src/ui/workflow-surface.js`, UI profile/detail types as needed, `ui/NodeDetails.svelte` if active option needs presentation consistency.
- Test: `tests/browser/node-connections.spec.mjs`, new `tests/browser/node-profile-dropdowns.spec.mjs`, relevant preparation/instance tests.
- Build: `dist/lattice-ui.js` and styles/assets produced by existing build.
- Documentation: existing connection/workflow user documentation where behavior changed.

**Interfaces:**
- Consumes Task 1's active constants and safe metadata, Task 2's `Canvas.setNodeProfiles(rows)` and `editProfile(selection,value)`.
- Produces qualified per-node rows from cached saved/effective preparation. Selection uses `nodeDetailsActions.editBinding(selection,'profileId','override',value)` without requiring primary selection.
- Profile option metadata uses `apiLabel`, never forbidden `provider`/`endpoint` keys.

- [x] Write and run failing integration tests for an unselected root node, deep pinned instance sibling isolation, missing profile display, existing binding restoration, new node active default and host model/profile refresh.
- [x] Build safe shared options and per-node decoration rows only for currently model-calling operations. Wire edits through qualified commands, retain Undo/Redo and disable library editing.
- [x] Refresh metadata through supported host events and menu-open refresh; never rerun host resolution for camera/drag/selection bursts.
- [x] Run `npm test`, `npm run check:types`, `npm run build`, `npm run check:assets`, and full `npm run test:browser` using the worktree's own harness server.
- [x] Capture real running UI and compare the bar, model label, search list, selected row, scrolling and open/closed states with the approved mock at normal/narrow widths and nonidentity camera. Fix all material visual discrepancies.
- [x] Request independent review of final diff and resolve substantive findings. Record screenshots, test totals and review verdict in `.tmp/node-profiles/final-report.md`.

## Plan self-review

The runtime and canvas renderer share only the documented safe data contract. Controller integration consumes both; generated bundle is built once after integration. All approved behavior maps to a task and the five Review Focus cases have explicit test coverage assigned above. User approval authorizes continuous implementation in the worktree; no further approval gate is required.
