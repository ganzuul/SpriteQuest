# Profile UI Cleanup Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development with independent ownership and focused behavior tests. Track completion below.

**Goal:** Make the per-node picker the ordinary connection control, remove the separate Fast Decision system, and preserve recoverable authored data.

**Architecture:** Ordinary Decision remains the one decision model node and uses ST profiles. Fast Decision is retired, with saved containing roots and library entries preserved as cold archive data before live validation. Advanced model/inheritance editing remains in Details. The separate active legacy-removal task owns Pre/Post retirement; integrate its verified commit rather than duplicate its implementation.

**Tech Stack:** JavaScript ES modules, Svelte 5, Node 24, node:test, Playwright, Vite.

**Spec:** [Approved cleanup audit](../../per-node-profile-cleanup-audit.md).

## Constraints and rulings

- Worktree: attached `node-profile-dropdowns/SillyCanvas`, branch `codex/profile-ui-cleanup`; main d047477 merged with the verified f35eef8 profile/theme changes.
- Ruling: retire Fast Decision and its manager together, because the user's approved cleanup removes that manager and ordinary ST profiles cannot preserve its typed protocol. Keep ordinary Decision and generic Confidence Gate/Confirm Events.
- Ruling: preserve original graphs and pinned definitions in a bounded, non-executable archive rather than converting native probability results into ordinary confidence.
- Ruling: avoid duplicating the concurrently approved legacy-removal work. Integrate its verified changes once available; retain pinned stage helpers and current shared engines.
- Keep Active first/default, instance-qualified edits, undo/redo, optional model overrides, null/inheritance semantics, supported Run to here, Arm/Stop, accepted effects and normal native generation.
- No paid model calls, live chat mutations or shared-branch push needed for this worktree task.
- Workers are not alone. Do not revert others' edits. Do not stage/commit shared changes; root integrates and commits after checks.

## Review focus

1. Saved Fast nodes inside root or pinned helpers must not block startup or disappear.
2. Removing the Fast bridge must preserve ordinary binding freshness and cancellation.
3. Removing Details' profile selector must not leave an unsavable Connection mode draft path.
4. For Each selectors must explain explicit helper-node precedence without changing existing choices.
5. The paired-kiss example must preserve unresolved acceptance and reviewed private effects without a boolean numeric gate.

## Task 1: Ordinary and manager UI — UI worker

**Own:** `ui/NodeDetails.svelte`, `ui/FastConnections.svelte`, `ui/fast-connections-types.ts`, `ui/detail-types.ts`, `ui/types.ts`, `ui/Workbench.svelte`, `ui/WorkspaceMenus.svelte`, `src/ui/controller.js`, `provider-settings.js`, `workspace-preparation.js`, `workflow-surface.js`, `iteration-bindings.js`, related UI unit/browser tests. Root owns state/archive; runtime worker owns `run.js`, runtime/host and catalog; docs worker owns guides.

- [x] Test-first: picker remains editable in root/pinned occurrence; Details has no duplicate profile selection or profile Override draft; reset inheritance remains usable.
- [x] Remove duplicate ordinary profile row; collapse model overrides/role/diagnostics under advanced settings; replace profile mode draft path with direct reset to inherited binding.
- [x] Remove Fast dialog, shortcuts, DTOs, actions, selector/fallback projection and help. Retain unrelated assignment helpers until legacy integration.
- [x] Test-first: helper source/caveat identifies explicit Active/fixed helper nodes and controls that cannot affect any helper call; preserve inherited/helper role editing.
- [x] Remove Workflows duplicate Examples entry and Details Duplicate/Delete overflow; relocate global Portals manager to Graph. Keep Details reopening dependable.
- [x] Delete unused projection helpers/secondary tests only when installed product callers are absent. Coordinate broader legacy dead-code deletion with that task.
- [x] Wire root's `exportArchivedWorkflows()` to File → Export archived workflows… when recovery data exists.
- [x] Run affected UI unit tests and targeted browser tests; record red/green evidence and known integration failures.

## Task 2: Fast runtime retirement — runtime worker

**Own:** `src/run.js`, `src/workflow/decision.{js,d.ts}`, `operations/decision-nodes.{js,d.ts}`, `fast-{connections,host,registry}.{js,d.ts}`, `runtime.js`, `host.js`, `types.d.ts`, `operations/control-nodes.d.ts`, `iteration-helpers.js`, `catalog.js`, runtime/transport tests. Root owns saved admission/export; UI owns projections; docs worker owns examples.

- [x] Test-first: Fast Decision is unavailable for new/executed graphs while ordinary Decision still resolves/sends one bounded request.
- [x] Remove Fast registration/typed response/fallback dispatch and Fast transport modules; generalize shared request validation naming. Restore direct ordinary `bindingStatus` in facade.
- [x] Preserve ordinary model profiles, shared decision rubric/JSON validation, accounting, freshness/cancellation, privacy/host authority and recordings' useful historical decoding.
- [x] Retarget mixed tests to ordinary behavior and remove only dedicated retired Fast feature suites. Do not delete useful privacy/authority coverage.
- [x] Run affected runtime/host/decision tests and report integration needs.

## Task 3: Recipes and current docs — catalog/docs worker

**Own:** `tools/scoped-story-examples.mjs`, `tools/build-unified-examples.mjs`, `examples/unified/**`, generated `src/workflow/unified-example-data.js`, current README/docs, recipe tests and Fast-only reference claims. Do not rewrite/delete historical plans/research. Do not delete broad legacy catalogs; concurrent legacy task owns them.

- [x] Test-first: paired-kiss recipe uses ordinary Decision and extracts/adapts `answers.kiss.accepted` to `{accepted}` for Confirm Events; null remains unresolved; no Fast/native probability dependency.
- [x] Update generator and regenerate recipe packages with correct pinned hashes/references and request bounds.
- [x] Rewrite current profile guidance for node picker + advanced Details. Remove Fast setup/support claims and stale legacy copy only as retired paths are integrated.
- [x] Preserve main's Workflow Data terminology and existing example semantics outside the targeted rewrite.
- [x] Run generated example validation and affected recipe/docs checks.

## Task 4: Recovery and integration — root

**Own:** `src/state.js`, new `src/workflow/retired-workflows.js`, package/admission recovery hooks as necessary, recovery tests, `index.js` stale launcher copy, distribution and integration reconciliation.

- [x] Confirm clean unit baseline before product edits.
- [x] Test-first: saved Fast roots/pinned helpers/library entries move to cold bounded recovery data before executable validation; unrelated graph assignment remains intact; affected assignment disables; migration is idempotent and atomic for read-only/unsafe inputs.
- [x] Provide portable recovery export that omits local connection selectors, never executes or imports retired graphs, and preserves authored nodes/wires/definitions locally unchanged.
- [x] Integrate verified legacy-removal delta with baseline-aware conflict resolution; consolidate archive access and preserve current main/theme changes.
- [x] Fix stale launcher Setup text; reconcile UI/types/tests and clean inactive Fast selectors/export paths.
- [x] Run npm test, types, build/assets, browser suite and documentation/installation smoke checks, using an isolated harness port to avoid other tasks' servers.
- [x] Request independent final review; resolve material findings, repeat affected checks and commit the complete worktree delta. Update audit/report with completion and exact validation evidence.

## Completion evidence

- Baseline: 244/244 unit files before product edits. Changed-file integration check: 20/20.
- Final combined tree: 233/233 unit files; 281/282 full browser cases plus the corrected Examples-menu case passing its isolated rerun. No remaining failed case.
- Types: zero errors/warnings. Build, assets, ten current-guide documentation audit and installed-distribution smoke pass; smoke reports zero provider/API calls and no missing resources or page errors.
- Refreshed five documentation captures, inspected model/graph images and recaptured the two affected by stale binding-message copy. Capture evidence reports no errors or blocked requests.
- Independent UI, runtime/recovery, recipes and combined integration reviews completed without remaining material findings. Review fixes include exposed helper dependency/selector handling, ordinary recovery closure, null-container preservation and empty legacy startup.
- Cleanup checkpoint: `980f2e3`. Verified legacy snapshot: `3561229`, reconciled in this branch. Retain the named worktree branch; no shared-branch push was part of this cleanup request.
