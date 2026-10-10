# Outstanding Worktree Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate outstanding repository work into verified Main and close eight integrated linked worktrees, retaining the active shelf checkout.

**Architecture:** Prepare a candidate integration branch in the primary checkout after preserving its original files and all source worktrees. Merge source history sequentially, resolve overlaps by reviewed intent, regenerate the UI bundle, and promote the tested candidate to Main. Read-only audits and independent reviews can run in parallel; Git mutations remain sequential.

**Tech Stack:** JavaScript ES modules, TypeScript, Svelte 5, Node 24, Vite, Playwright, Git and network-enabled GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-10-10-outstanding-integration.md`

## Global Constraints

- Exclude the entire active `compact-node-shelf/SillyCanvas` checkout, including scale, opacity, bold labels and icons.
- Preserve Main's 0.27 curriculum and retired-root guards; keep every installed import consistently versioned.
- Preserve document independence, scoped metadata, provider-default behavior, and zero unintended model calls.
- Keep source branches, verified archives and the Git bundle; never remove a source before its state is accounted for.
- Do not force-push. Cleanup follows a verified Main.

## Review Focus

- Unsaved active documents opened through File or Examples must remain detached until explicitly assigned; Recall and menu changes must honor that lifecycle.
- Automatic data creation must target the current editable workflow scope, including empty documents and nested views, without restoring retired roots.
- Fast/profile retirement must preserve model defaults, scoped bindings and actionable Details controls while the new menus remain reachable.
- Typed pins and direct routing must retain compatible creation, drag cancellation, selection and scoped subgraph behavior.
- Escape consumed by an active gesture must cancel it without also closing the workspace; idle Escape must still close.

## Task 1: Preservation and inventory

**Files:** `.tmp/integration-preservation-2026-10-10/{manifest.json,*-files.json,*.tar,all-refs.bundle}`; this plan and spec.

**Interfaces:** Produces immutable source heads, file hashes, archives and a complete Git recovery bundle.

- [x] Inventory all ten registered checkouts and local branch ancestry; identify the protected shelf checkout.
- [x] Preserve nine integration-source/primary trees, including useful ignored evidence but excluding dependencies, in TAR archives with file and archive SHA-256 records.
- [x] Create and verify `all-refs.bundle`; read-only auditing covers all unmerged branch intents.
- [ ] Record the fresh Main baseline Node result. Browser tests must use an isolated port to avoid the active shelf harness.

## Task 2: Document lifecycle, Recall and Escape

**Files:** `src/ui/controller.js`, `src/ui/document-controller.js`, `src/ui/document-session.js`, `src/ui/workflow-file-access.js`, `src/workflow/document-file.js`, `src/workflow/recall-state.js`, `src/workflow/native-recall.js`, Recall/UI components and corresponding source-branch tests.

**Interfaces:** Consumes Main and `codex/canvas-memory-recall` (`fc281fe`); produces the current active-document lifecycle and shared Recall queue.

- [ ] Recheck primary/source state, preserve colliding Main-local untracked files, and create `codex/integrate-outstanding-2026-10-10` without changing Main's ref.
- [ ] Merge Recall's already-reconciled 0.27 history. Account for workflow-files deltas by comparison to imported `df2e3a3`; avoid replaying duplicate document work or stale launcher/naming changes.
- [ ] Port `tests/canvas-controller-escape.test.mjs` from workflow-files with current imports. Verify its active pan/connection cases fail before the missing `event.defaultPrevented` guard, add the guard, and verify all three cases pass.
- [ ] Run document, workflow file/current-send, Recall queue/session and Escape tests, plus types.

## Task 3: Reconcile profile, data, menu and connection work

**Files:** `src/ui/controller.js`, `src/ui/workflow-surface.js`, `src/ui/workspace-preparation.js`, `src/ui/configured-node-creation.js`, `src/ui/workflow-data-setup.js`, `src/ui/context-menu.js`, `src/workflow/host.js`, `src/workflow/runtime.js`, `src/workflow/workflow-data-defaults.js`, canvas geometry/rendering modules, `ui/Workbench.svelte`, `ui/WorkspaceMenus.svelte`, `ui/NodeDetails.svelte`, `ui/WorkflowData.svelte`, `ui/NodeProfilePicker.svelte`, pin components, `style.css`, and source-branch tests/docs.

**Interfaces:** Consumes Task 2 and audited source heads; produces the combined candidate, preserving each approved behavior and current Main architecture.

- [ ] Merge profile cleanup `2486c44`; retain current curriculum/retirement work while adding themed selectors, appropriate default recovery and advanced Details cleanup.
- [ ] Merge automatic workflow data `2033351`; reconcile captured/current document scope and preserved profile cleanup.
- [ ] Merge consolidated menus `4933a7e`; keep the six-menu design, panel controls, diagnostics and activity updates with document lifecycle and Fast retirement.
- [ ] Merge typed-pin routing `58f8a03`; retain typed shape/color semantics and direct wire lead behavior alongside the shared Recall projection.
- [ ] For each conflict, review all participating versions and original requirements; record the decision. Rebuild generated assets from the final source rather than selecting a branch's old bundle.
- [ ] Run meaningful focused tests for each merge and cross-feature browser flows. Update obsolete test expectations only where approved behavior changed.

## Task 4: Whole-candidate verification and independent review

**Files:** `dist/lattice-ui.js`, `dist/lattice.css`, current operator/development docs and screenshots as needed, `docs/superpowers/reports/2026-10-10-outstanding-integration.md`.

**Interfaces:** Produces a reviewed candidate SHA, passing verification evidence and a source-by-source accounting report.

- [ ] Run full Node tests, `npm run check:types`, `npm run build`, `npm run check:assets`, and full browser suite on an isolated port with a fresh server.
- [ ] Run `npm run smoke:install`, current documentation capture/check, and relevant visual/interaction captures. Check provider requests remain absent in synthetic checks.
- [ ] Obtain independent source/semantic and UI/cross-feature reviews; fix material findings and rerun affected checks.
- [ ] Verify every included source tip is reachable or explicitly accounted for, Main-local original files are preserved, and protected shelf content was not introduced.
- [ ] Commit the verified candidate and record exact commands/results, conflict decisions and recovery locations.

## Task 5: Promote Main and close integrated checkouts

**Files:** Main ref, registered worktree state, integration report and preservation manifest.

**Interfaces:** Consumes a verified candidate; produces consolidated Main and only the protected shelf linked checkout.

- [ ] Recheck GitHub Main and local source state for concurrent changes; reconcile anything new before promotion.
- [ ] Fast-forward local Main to the verified candidate. Publish through a normal push only if the user authorizes publication of the reviewed result; otherwise report local Main ahead of origin. If published, verify GitHub SHA with network-enabled GitHub CLI.
- [ ] Verify preserved archives and hashes before closing the eight included linked worktrees. Prefer native archive when available for the owning attachment; otherwise use exact checked Git worktree paths backed by the preservation archives. Keep recovery branch refs.
- [ ] Recheck `git worktree list`, Main status and source accounting. Confirm only the primary checkout and active shelf worktree remain.

## Plan review

The requested result and exclusions are captured above. Native execution with parallel read-only audits/reviews is recommended because the source merges share controllers, runtime state and UI surfaces and must be reconciled in sequence.
