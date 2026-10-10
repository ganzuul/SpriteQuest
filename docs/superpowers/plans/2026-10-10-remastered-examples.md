# Remastered Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Tasks are independently owned and may run in parallel under the current delegation instructions; root integrates and reviews all changes.

**Goal:** Ship the approved 30-example unified curriculum and usable teaching catalog, preserve saved workflows, verify, merge and push main.

**Architecture:** New authored generator/modules emit 30 portable root bundles and exact helper snapshots into examples/remastered and remastered-example-data.js. Catalog API exposes the new lessons while retaining archived admission; UI presents/searches lessons without execution side effects.

**Tech Stack:** Existing JavaScript modules, Svelte/TypeScript UI, Node tests, Playwright, current workflow schema3/runtime2.

**Spec:** docs/superpowers/specs/2026-10-10-remastered-examples-design.md

## Global Constraints

- Exactly 30 visible supplied examples, numbered 1–30, all native-unified schema3/runtime2.
- Preserve saved workflows and archived example IDs/packages for compatibility.
- Bands: Foundations 1–8; Composition 9–17; Advanced 18–26; Capstone 27–30.
- No additional runtime operations, provider calls, real story mutations or secret exports.
- Work in the attached isolated worktree; preserve unrelated main changes; integrate/review/verify before main merge/push.
- No further human approval questions: approved implementation and earlier merge/push authority apply.

## Review Focus

- An opened/imported example must retain actual reusable interfaces and instructions; existing saved graphs must be untouched.
- Lesson nodes must participate causally, and all canonical/private/time/file authority must come from real source contracts.
- Optional and uncertain branches must preserve usable Drafts or hold explicitly instead of falsely accepting effects.
- Layout and helper views must avoid real node collisions and remain readable when groups fold.
- Call budgets must include helper iteration/fallback and avoid hidden requests or persistence.

## Shared interface

Generator exports REMASTERED_WORKFLOW_EXAMPLE_DATA from src/workflow/remastered-example-data.js. Each entry: {id,number,title,goal,lesson,packages}. lesson: {difficulty:'Foundations'|'Composition'|'Advanced'|'Capstone',focus:string,learn:string[],requirements:string[],steps:string[],checkpoints:{node:string,port:string,expect:string}[],experiments:{change:string,expect:string}[],cases:{when:string,expect:string}[],callBudget:string}. Metadata checkpoint node is visible alias/name, not copied graph identity. Runtime WorkflowExample/Result includes optional lesson for archive compatibility. projectWorkflowExamples preserves lesson on tiles. New ID convention lesson-01 through lesson-30. Generated filenames use number plus descriptive slug.

### Task 1: Author the curriculum

**Files:** tools/build-remastered-examples.mjs; tools/remastered/*; examples/remastered/*; src/workflow/remastered-example-data.js; tests/workflow-remastered-authoring.test.mjs; tests/workflow-remastered-layout.test.mjs.

**Consumes:** Existing contracts/descriptors and approved design. **Produces:** Shared interface and 30 complete valid bundles, sample fixtures, real pinned helpers and annotations.

- [ ] Write one failing behavior/authoring test proving missing new lesson package or flow; record Red.
- [ ] Implement focused generator/builder and independently authored recipes for all 30 exact goals. Follow incremental tests for source, conditional, helper and effect wiring.
- [ ] Lay out root/helper DAGs deliberately, author operation-preserving aliases, comments and consistent group membership; annotate setup and checkpoints.
- [ ] Export/parse/prepare/install validate every bundle and inspect request bounds/authority.
- [ ] Run authored/layout tests and generator twice to confirm deterministic output; report evidence and concerns.

### Task 2: Present and install the teaching catalog

**Files:** src/workflow/examples.js/.d.ts; src/ui/example-catalog.js/.d.ts; ui/ExamplesBrowser.svelte; ui/types.ts and focused UI components if needed; tests/ui-example-catalog.test.mjs; tests/ui-examples.test.mjs; tests/browser/example-curriculum.spec.mjs.

**Consumes:** Shared metadata interface and generated 30 entries. **Produces:** Exactly 30 visible numbered/searchable/filterable teaching examples with details, independent installation, archived-ID compatibility and detached metadata.

- [ ] Write and run one failing test for visible new lessons/search/details, not exact prose.
- [ ] Wire new catalog and preserve old packages only for archived install lookup. Keep saved registry intact on browsing/opening; installation adds independent roots only.
- [ ] Expose goal/focus/difficulty/setup/instructions and useful catalog search/filter. Keep unavailable package diagnostics and accessible keyboard interaction.
- [ ] Preserve graph readme in authored comments; show lesson details before opening, with clear setup and actual checkpoints. Improve group thumbnail geometry if needed.
- [ ] Verify metadata detached/immutable, unchanged existing graphs, unavailable tiles, search by node/topic, difficulty and details/install behavior through real UI tests.

### Task 3: Verify behavior and document the collection

**Files:** docs/examples.md or current example-guide equivalent; docs/README.md and relevant guide references; tests/workflow-remastered-execution.test.mjs; existing workflow-example*/unified/scoped/story-flow/soak tests only where catalog expectations change; tools/check-example-curriculum.mjs if useful.

**Consumes:** New bundles/runtime catalog, original engine verification contracts. **Produces:** Accurate learner guide, cross-catalog coverage audit and meaningful authored-flow behavior verification while legacy contract tests remain valid.

- [ ] Write one failing integration case for new authored flow with real runner and narrowly stubbed external responses; record Red.
- [ ] Verify representative original/new Draft handling, optional/semantic decisions, pure helper iteration, staged document acceptance/rejection/dedupe, confirmed event/holder and capstone wiring.
- [ ] Use existing engine tests for detailed privacy/time/random/partial-save contracts and add cases where new wiring could violate them.
- [ ] Update expected visible catalog counts/IDs under changed requirements; retain archived fixtures/contract coverage instead of deleting tests for legacy compatibility.
- [ ] Document 30 independent goals, setup/model roles, source coverage, actual limitations, safe fixtures and acceptance behavior; add relative local links.

### Task 4: Integration and release verification

**Files:** generated UI bundles/release version files as needed; relevant verification records; unrelated existing changes on main remain intact.

- [ ] Review each owned task diff for spec and quality, fix findings with covering tests and re-review.
- [ ] Run npm test, npm run check:types, npm run build, npm run check:assets, npm run test:browser, npm run smoke:install; inspect representative screenshots and helper/group layouts.
- [ ] Review existing main launcher/polish changes separately, preserve them and validate appropriate tests; include them under the user's prior all-repository-changes instruction when integrating.
- [ ] Refresh release/version consistently if needed; verify GitHub authentication using gh with network permission.
- [ ] Commit, integrate into main without force/reset, verify final main, push and confirm remote SHA with gh.

## Execution record

Root maintains task reports/review notes in this plan's ignored scratch directory and records final verification in the committed guide/release note. User approval covers this plan's execution; proceed autonomously.

## Implementation refinements found during verification

The slow-burn relationship root requires projected private generic State to affect the next native portrayal. Existing Model Call → Compose Guidance retains private scope but is deliberately not an authorized native actor Guidance producer. Character Direction therefore receives an optional bounded Data input, checked against its genuine current scene presence and actor grant before any private dispatch. Its existing literal systemPrompt and exact retained native Guidance authority remain in place; no arbitrary Compose producer is authorized. Without the optional input its behavior is unchanged. Cross-actor, hidden, mixed, forged and stale inputs must hold before a model request.

Actual UI captures also showed that ordinary Fit to view obscured input nodes behind the floating shelf, and its interaction zoom floor clipped the largest maps. Whole-graph Fit uses the existing shelf inset by default and can show a smaller complete overview; normal zoom and focused node inspection retain their ordinary limits. Browser regressions cover roots, a pinned helper and all four capstone overviews.

Multi-turn execution of the native Memory lesson exposed a retained-source lifecycle failure: Apply preserved the original native reply and selected the reviewed swipe, while stored episode references still named the original revision. Accepted memory persistence now rebases only that exact owned native source reference to the verified selected publication revision. Unrelated historical references, model prose, proposal identity and receipt fingerprints remain unchanged. The original-preserving publication and actor visibility are rechecked around asynchronous hashing; cancellation, release or edits prevent persistence. Reload validates the current selected source without granting authority over arbitrary older swipes.

The progression lesson also compares the original experience value with the final projected value after all confirmed rewards. Real two-objective 260-to-300 acceptance and rejection cases cover the complete threshold crossing.
