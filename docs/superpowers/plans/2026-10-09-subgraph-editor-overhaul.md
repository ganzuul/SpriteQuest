# Subgraph editor overhaul implementation plan

**Goal:** Select nodes, create an editable subgraph from the canvas menu, preserve all crossing connections, and edit its typed ports from boundary blocks.

**Architecture:** Reuse the existing owned-definition extraction and metadata transactions. Keep one boundary node per interface port. Preserve saved controls and inherited bindings; use visible coordinates and transfer presentation without converting effective node data into authored settings.

**Constraints:** Preserve existing workspace edits. Use schema 3 and the existing transaction/history path. Keep pinned library bodies read-only. Do not add dependencies.

### 1. Core extraction and boundary placement

- [x] Add regression tests in `tests/workflow-composition-edits.test.mjs` and `tests/workflow-qualified-manager-edits.test.mjs` for visible coordinates, wrapper placement, boundary placement, unused output exposure, and finite placement validation.
- [x] Extend `prepareCreateFromSelection(root, command)` in `src/workflow/composition-transform.js` with optional selected `nodePositions`, preserving authored node settings.
- [x] Place inputs to the left and outputs to the right, exposing crossing connections and dangling selected outputs.
- [x] Extend interface add in `src/workflow/definition-library.js` with optional `graphPoint`, plus useful default placement.
- [x] Run the affected core test files.

### 2. Boundary editing components

- [x] Extend boundary panel DTOs in `ui/detail-types.ts`, `ui/types.ts`, `src/ui/workspace-preparation.js`, and `src/canvas/presentation.js`.
- [x] Add port label/type/required editing and Add input/output controls to `ui/NodeDetails.svelte`, plus edit/add buttons on `ui/NodeCard.svelte`.
- [x] Hide ordinary duplicate/delete actions for boundaries; provide safe interface removal.
- [x] Clarify the empty library state in `ui/SubgraphManager.svelte`.
- [x] Test real component events, stale/read-only protection, and workspace projection.

### 3. Editor orchestration

- [x] Add Create Subgraph for a node selection or group in `src/ui/controller.js`.
- [x] Capture visible selected coordinates and presentation, commit once, select the parent wrapper, open the child tab, transfer presentation, and fit the new view.
- [x] Reuse the same flow from manager conversion.
- [x] Wire canvas boundary buttons through the existing Canvas hook, and route panel interface edits through captured owned-definition transactions.
- [x] Add empty-space Add subgraph input/output actions in editable child tabs for zero-port definitions.
- [x] Test browser creation, rewiring, edits, adding/wiring ports, nested use, and undo/redo.

### 4. Verification and review

- [x] Run Node tests, Svelte type checks, production build/assets, and browser tests.
- [x] Review the final feature diff for connection loss, presentation drift, stale captures, nested ownership, and read-only handling.
- [x] Update user-facing documentation to describe the editor workflow.

**Verification:** 113/113 Node test files and 153/153 browser tests passed. The final nested-tab history extension passed 7/7 affected Node test files and 17/17 browser integration tests, including a new regression for tabs first opened after extraction. Svelte type checks reported zero errors and warnings; production build, assets, and whitespace checks passed. Focused review found no remaining defect in the final relocation fix.
