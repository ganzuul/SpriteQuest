# Svelte UI migration review and disposition

The independent `migration_review` agent reviewed `dc5b603..66c4f18` against the approved design, implementation plan and execution ledger. It inspected the whole branch and reproduced interaction/lifecycle failures with jsdom and offline Chromium serving the exact committed assets. No external provider requests or checkout edits were made by the reviewer.

The reviewed checkpoint had no Critical findings, six Important findings and one Minor. Its readiness verdict was **No at 66c4f18**. The implementation below fixes those findings in one subsequent pass. Each regression was observed failing before its fix, then passing afterward. There was no second review dispatch; the final complete acceptance suite verifies the corrections.

## Findings and fixes

| Finding at the reviewed commit | Disposition | Regression evidence |
| --- | --- | --- |
| P1: inspector deletion resumes against another graph after confirmation; duplicate/import snapshots retain matching node IDs | Capture the original graph and UI session; reject stale approval before deleting | `workbench.spec.mjs`: pending inspector delete on A, switch to snapshot B, approve; both graphs retain their blocks |
| P2: focused inspector input consumes the first subsequent canvas gesture | Mouse exclusions inspect the event target; keyboard handling keeps focused-input exclusions | `workbench.spec.mjs`: focus textarea, click another card once; that card is selected immediately |
| P2: wheel followed by immediate cancellation leaves graph view and viewport transform different | Reconcile the final wheel camera and persist its view while cancelling pending work | `canvas-lifecycle.test.mjs`: wheel then resize before the frame; graph coordinates match the displayed transform, including after the cancelled callback would run |
| P2: stationary click on a folded group does not narrow a larger selection | Record the clicked group and narrow on release below the movement threshold | `selection-gestures.test.mjs`: selected folded group plus Output; stationary group click selects only the group, while existing selected-set and Shift-drag cases still pass |
| P2: delayed dynamic ST Refresh removes another graph's focused inspector editor | Guard graph/session, selection and connected refresh control; preserve active editing | `workbench.spec.mjs`: refresh on A, open B and focus its textarea, resolve A; B retains the same focused editor |
| P2: context-menu clipboard read can paste into a subsequently opened graph | Reject clipboard continuation after a graph/session change | `workbench.spec.mjs`: Paste here on A, open B, resolve clipboard; neither graph gains a block |
| P3: rectangle selection leaves expensive theme wire filters enabled | Re-graded as Important for the requested smooth selection workflow; use the common active-interaction state | `selection-gestures.test.mjs`: rectangle gesture suppresses wire effects; release restores them |

The deletion, dynamic-refresh and context-menu-paste bugs predated the migration. They were still acceptance gaps in its explicit session/focus contract and were fixed in the native UI controller. The three camera/selection/focus regressions were introduced by the migration. No findings are deferred.

The reviewer also confirmed the keyed Svelte ownership boundary, camera fast path, unscaled geometry cache, incident-wire updates, production integration and explicit teardown. All twelve changed authoritative/support modules differed from the baseline only in version queries.

The final source and regression checkpoint is `a1e2332402ff13b56ee95ee0b0fda6722e478f51` on `codex/svelte-ui-migration`. [Draft PR #1](https://github.com/MentallyQuill/Lattice/pull/1) targets the user's fork `main`; the managed worktree is retained for review. The workflow chat received the stable commit and adapter contracts under the human's explicit coordination authorization. The [execution record](2026-10-07-svelte-ui-migration-execution.md) preserves the ledger before its temporary plan workspace is cleaned up.

## Final verification

- `npm run check`: 44/44 Node test files, 25/25 Chromium cases, zero Svelte errors or warnings, production build, and 62 consistent local asset imports.
- `npm run smoke:install`: 35 local requests, no missing files or page errors, real extension launchers, one shared domain graph, Svelte workbench and cards, without developer UI source or `node_modules`.
- Rebuilt bundle: 81.94 KB raw / 24.22 KB gzip; SHA256 `17335cbcbe86ab68b7c3b62647af1484ac4bfe5210d313b589e69cff05c803cc`, identical before and after the final acceptance run.
- `git diff --check` passed. The original checkout remains on `main` with its unrelated `docs/research/` directory preserved.
- The [matched benchmark records](../../benchmarks/2026-10-07-after.json) remain the performance evidence: 54 cases, camera handler p95 at most 0.2 ms, camera frame median at most 16.7 ms / p95 at most 16.8 ms, no endpoint measurements or graph analyses during gestures, and retained card/wire identity.

## Rulings carried from execution

These decisions retain their original execution order. Costs describe the practical limit or consequence if a decision is unsuitable.

1. Execute inline in the managed worktree and use PowerShell equivalents for the Bash ledger helpers. The native goal and blanket approval authorize continuous execution. Cost: equivalent bookkeeping depends on the recorded commands rather than the Bash helper implementation.
2. Combine camera and selection commits because both change the same gesture controller. Cost: rolling back that checkpoint removes both together.
3. Deliver Select/Pan controls with the Svelte workbench in Task 6, retaining compatibility mouse tracking until pointer capture is integrated. Cost: those controls appear later in the migration sequence.
4. Pull benchmark tooling forward into Task 4 to measure rendering before Svelte. Cost: an additional development tool must be maintained; it adds no installed runtime dependency.
5. Skip native delegation for Svelte action buttons to prevent double toggles; keep group mouse compatibility and keyboard actions. Cost: action callback parity relies on the covered button/port interaction contracts.
6. Correct the Task 5 ledger's overstated pointer-capture claim by adding actual capture and listener teardown in Task 6. Cost: capture keeps compatibility mouse semantics rather than replacing the event API.
7. Keep specialized library/inspector/preview/State/theme/model forms native behind named adapters; Svelte owns the actual canvas and shell/control markup. Cost: those rich forms still require a later conversion for an entirely Svelte editor implementation.
8. Include the missing Shift-drag behavior during final acceptance, with card and folded-group RED→GREEN cases. Cost: selected-set Shift-drag adopts the documented interaction semantics.
9. Re-grade marquee wire-effect suppression as Important because expensive Neon filters remain active during the newly requested drag-box workflow. Cost: effects briefly disappear even during a stationary empty-canvas click; no timing improvement is asserted for this correction.
10. Accept the reviewer's declined judgment on production providers/live SillyTavern writes: the approved verification contract uses a mock host and excludes real generation/chat mutations. Cost: host/provider integration issues may still require real-host validation.
11. Accept the reviewer's declined judgment on universal performance: timings apply to the documented local fixtures, with deterministic scheduling/identity checks as the portable contract. Cost: other hardware or unusually complex graphs may still render slowly.
12. Use the already-approved committed branch and draft-PR handoff on `MentallyQuill/Lattice`, retaining the managed worktree. Cost: the draft can be closed if desired; shared `main` is not merged by this task.
