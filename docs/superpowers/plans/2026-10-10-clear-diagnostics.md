# Clear Diagnostics Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement the independent tasks, followed by integration and review. Track the steps below.

**Goal:** Make every Lattice diagnostic understandable, accurately actionable, and consistent across its UI.

**Architecture:** A pure diagnostic presenter translates existing service errors at user-facing boundaries. A small Svelte disclosure renders severity and optional technical details. Manual native-generation paths are rejected before execution, and Preview uses explicit empty states and deduplicated diagnostics.

**Tech Stack:** Existing JavaScript ES modules, TypeScript declarations, Svelte 5, Node test runner, Playwright. No added dependencies.

**Spec:** `docs/superpowers/specs/2026-10-10-clear-diagnostics-design.md`

## Global constraints

- Preserve stable error codes, acceptance/privacy checks, bounded recordings, request accounting, and saving/retry authority.
- Imports in src JavaScript use `?v=0.27.0`; Svelte imports follow existing conventions.
- No automatic Send, model retry, Apply or data write. No credentials/private source content in diagnostic details.
- Use exact visible setting names and distinguish display truncation from model truncation.
- Work only in the attached worktree; do not commit or change files in the original checkout.

## Review focus

- One code may have several causes; specific message variants must retain different remedies.
- A failed manual native path must spend zero model requests.
- A retained prior output must not appear to belong to a failed current run.
- Partial, unknown and unverified saving states must not receive the same retry advice.
- Every disabled-control reason and disclosure must be accessible without hover.

## Task 1: Shared diagnostic presentation

Files: create `src/ui/diagnostics.js`, `src/ui/diagnostics.d.ts`, `src/ui/diagnostic-copy.js`, `tests/ui-diagnostics.test.mjs`.

Interfaces: `presentDiagnostic(input, context?) => DiagnosticView`; `diagnosticText(input, context?) => string`; `presentDiagnostics(inputs, context?) => DiagnosticView[]`. Context contains optional operation, nodeTitle, inputLabel, outputType, inputType, enabled and action. DiagnosticView contains id, severity (`info|warning|error`), title, message, technical (`{code,message}` or null), optional address. Accept strings or plain `{code,message,nodeId?,address?}`. Keep unknown raw exceptions out of visible copy and redact secrets from technical details. Deduplicate only matching code/message/address, preserving independent locations.

- [x] Incrementally test cause-specific wording, state severity, uncertain saving, unknown/private errors and address-aware deduplication, showing each new behavior fail first.
- [x] Implement the pure presenter and a readable catalog of source-backed message families.
- [x] Verify with `node --import ./tools/node-test-host.mjs tests/ui-diagnostics.test.mjs`.

## Task 2: UI diagnostic disclosures and copy

Files: create `ui/DiagnosticMessage.svelte`, `ui/diagnostic-types.ts`, `tests/ui-diagnostic-message.test.mjs`; modify UI components for Preview, Details, managers, Workflow Data, Recall, imports, examples, search, menus, reports and Workbench. Own all `ui/*.svelte`, `ui/workspace-menu-model.ts`; do not modify `ui/detail-types.ts` (integration owns this).

Interfaces: DiagnosticMessage accepts `issue` (string or error record), optional `context`, optional `diagnostic` (already presented), and optional `reveal` callback for address navigation. Uses Task 1 presenter. `OutputPreviewView.diagnostics?` is a list of DiagnosticView; `emptyMessage?`, `runHere.reason?` and `review.reason?` are integration-supplied optional strings. Legacy inputs still render safely.

- [x] Add one meaningful component test at a time for readable copy, collapsed technical details, keyboard operation, and deduplication; run it red before each implementation.
- [x] Replace raw diagnostic rendering, prefix codes only in details, and make expected states neutral.
- [x] Give disabled controls associated visible explanations; propagate menu reasons through the menu model.
- [x] Use the existing recursive Svelte compiler helper; update tests that compiled Preview as a leaf to compile its imports.
- [x] Verify focused UI tests and Svelte type checking.

## Task 3: Runtime notification and non-component boundaries

Files: modify `src/run.js`, `index.js`, `src/ui/controller.js`, `src/ui/document-controller.js`, `src/ui/workflow-file-access.js`, `src/ui/file-input.js`, plus other non-component UI diagnostic boundaries as necessary. Own `src/ui/controller.js` only for toast/error presentation and reveal action wiring; do not modify workflow-surface or workspace-preparation.

Interfaces: use Task 1 diagnosticText/presentDiagnostic. Toast entry points select info/warning/error from the presented severity. Wire OutputPreviewActions.reveal to existing node-selection navigation. Humanize confirmation and setup notices without changing their actions.

- [x] Add incremental regression checks for notification severity and no raw exception leak.
- [x] Route caught errors and notification boundaries through shared presentation.
- [x] Inventory source/UI families in `docs/research/2026-10-10-clear-diagnostics-inventory.md` and identify any uncovered surface for integration.
- [x] Verify affected host/document/controller tests.

## Task 4: Preview projection and manual preflight (integration)

Files: modify `src/ui/workflow-surface.js`, `src/ui/workspace-preparation.js`, `src/workflow/resolve.js`, `src/workflow/host.js`, `ui/detail-types.ts`; add `tests/ui-diagnostic-preflight.test.mjs`, `tests/browser/clear-diagnostics.spec.mjs`.

Interfaces: planner summaries add `requiresNativeGeneration` without changing root validation. Target summaries disable manual native-boundary paths. `runTarget` verifies the selected closure before starting authority or executing requests. Projection supplies DiagnosticView arrays, accurate emptyMessage, and disabled reason strings.

- [x] Test manual native path denial with zero auxiliary calls; prove source-free paths and ordinary Send still work.
- [x] Test generic empty-state suppression when an actual cause exists, independent error retention, and current-vs-earlier output wording.
- [x] Implement context-aware projection and reveal-safe node locations.
- [x] Run full `npm test`, `npm run check:types`, `npm run build`, `npm run check:assets`, and `npm run test:browser` using worktree-only test server; repair browser findings and rerun the affected flows.
- [x] Review implementation independently, fix material findings, capture and inspect a diagnostic panel, and report exact verification results.

## Progress

- Design and plan reflect the user-approved proposal. Parallel tasks have separate file ownership; shared interfaces are specified above.
- Original checkout has unrelated in-progress changes, so the managed worktree starts from its HEAD and excludes those changes.
- Tasks 1–3 and projection/preflight implementation are verified by focused red/green tests. Review fixes preserve connection/helper/freshness support codes, selected port states, current-run ownership, neutral omissions, safe uncertain saves, and visible disabled explanations.
- Independent source review and final incremental review both passed with no remaining material findings. Final Svelte check reports zero errors and warnings.
- Full unit/integration verification passed all 268 test files. After the final incremental changes, 49 focused tests passed; type checking, build, and the 539-import asset check passed.
- The complete browser run passed 333 cases and identified six failures. All six were repaired, and the final affected-browser rerun passed all 73 cases against the final build on the worktree-only server. No remaining browser findings are open.
- Final wide and narrow preview captures were saved and visually inspected; keyboard disclosure, associated disabled reasons, navigation, narrow layouts, and zero-request native preflight passed in the browser. Exact evidence is recorded in `docs/research/2026-10-10-clear-diagnostics-verification.md`.
