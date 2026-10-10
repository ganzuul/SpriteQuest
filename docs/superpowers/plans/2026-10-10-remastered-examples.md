# Remastered Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Tasks are independently owned and may run in parallel under the current delegation instructions; root integrates and reviews all changes.

**Goal:** Ship the approved 30-example unified curriculum and usable teaching catalog, preserve supported saved workflows and retired-root recovery data, verify, merge and push main.

**Architecture:** New authored generator/modules emit 30 portable root bundles and exact helper snapshots into examples/remastered and remastered-example-data.js. Catalog API exposes the new lessons while retaining archived admission; UI presents/searches lessons without execution side effects.

**Tech Stack:** Existing JavaScript modules, Svelte/TypeScript UI, Node tests, Playwright, current workflow schema3/runtime2.

**Spec:** docs/superpowers/specs/2026-10-10-remastered-examples-design.md

## Global Constraints

- Exactly 30 visible supplied examples, numbered 1–30, all native-unified schema3/runtime2.
- Preserve saved unified workflows and earlier unified example IDs/packages. Retired Pre/Post roots remain recoverable through the approved archive migration.
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

- [x] Write one failing behavior/authoring test proving missing new lesson package or flow; record Red.
- [x] Implement focused generator/builder and independently authored recipes for all 30 exact goals. Follow incremental tests for source, conditional, helper and effect wiring.
- [x] Lay out root/helper DAGs deliberately, author operation-preserving aliases, comments and consistent group membership; annotate setup and checkpoints.
- [x] Export/parse/prepare/install validate every bundle and inspect request bounds/authority.
- [x] Run authored/layout tests and generator twice to confirm deterministic output; report evidence and concerns.

### Task 2: Present and install the teaching catalog

**Files:** src/workflow/examples.js/.d.ts; src/ui/example-catalog.js/.d.ts; ui/ExamplesBrowser.svelte; ui/types.ts and focused UI components if needed; tests/ui-example-catalog.test.mjs; tests/ui-examples.test.mjs; tests/browser/example-curriculum.spec.mjs.

**Consumes:** Shared metadata interface and generated 30 entries. **Produces:** Exactly 30 visible numbered/searchable/filterable teaching examples with details, independent installation, earlier unified-ID compatibility and detached metadata.

- [x] Write and run one failing test for visible new lessons/search/details, not exact prose.
- [x] Wire new catalog and preserve earlier unified packages only for hidden install lookup. Keep retired Pre/Post packages removed. Keep saved registry intact on browsing/opening; installation adds independent roots only.
- [x] Expose goal/focus/difficulty/setup/instructions and useful catalog search/filter. Keep unavailable package diagnostics and accessible keyboard interaction.
- [x] Preserve graph readme in authored comments; show lesson details before opening, with clear setup and actual checkpoints. Improve group thumbnail geometry if needed.
- [x] Verify metadata detached/immutable, unchanged existing graphs, unavailable tiles, search by node/topic, difficulty and details/install behavior through real UI tests.

### Task 3: Verify behavior and document the collection

**Files:** docs/examples.md or current example-guide equivalent; docs/README.md and relevant guide references; tests/workflow-remastered-execution.test.mjs; existing workflow-example*/unified/scoped/story-flow/soak tests only where catalog expectations change; tools/check-example-curriculum.mjs if useful.

**Consumes:** New bundles/runtime catalog, original engine verification contracts. **Produces:** Accurate learner guide, cross-catalog coverage audit and meaningful authored-flow behavior verification while legacy contract tests remain valid.

- [x] Write one failing integration case for new authored flow with real runner and narrowly stubbed external responses; record Red.
- [x] Verify representative original/new Draft handling, optional/semantic decisions, pure helper iteration, staged document acceptance/rejection/dedupe, confirmed event/holder and capstone wiring.
- [x] Use existing engine tests for detailed privacy/time/random/partial-save contracts and add cases where new wiring could violate them.
- [x] Update expected visible catalog counts/IDs under changed requirements; retain archived fixtures/contract coverage instead of deleting tests for legacy compatibility.
- [x] Document 30 independent goals, setup/model roles, source coverage, actual limitations, safe fixtures and acceptance behavior; add relative local links.

### Task 4: Integration and release verification

**Files:** generated UI bundles/release version files as needed; relevant verification records; unrelated existing changes on main remain intact.

- [x] Review each owned task diff for spec and quality, fix findings with covering tests and re-review.
- [x] Run npm test, npm run check:types, npm run build, npm run check:assets, npm run test:browser, npm run smoke:install; inspect representative screenshots and helper/group layouts.
- [x] Review existing main launcher/polish changes separately, preserve them and validate appropriate tests; include them under the user's prior all-repository-changes instruction when integrating.
- [x] Refresh release/version consistently if needed; verify GitHub authentication using gh with network permission.
- [ ] Commit, integrate into main without force/reset, verify final main, push and confirm remote SHA with gh.

## Execution record

Root maintains task reports/review notes in this plan's ignored scratch directory and records final verification in the committed guide/release note. User approval covers this plan's execution; proceed autonomously.

## Implementation refinements found during verification

The slow-burn relationship root requires projected private generic State to affect the next native portrayal. Existing Model Call → Compose Guidance retains private scope but is deliberately not an authorized native actor Guidance producer. Character Direction therefore receives an optional bounded Data input, checked against its genuine current scene presence and actor grant before any private dispatch. Its existing literal systemPrompt and exact retained native Guidance authority remain in place; no arbitrary Compose producer is authorized. Without the optional input its behavior is unchanged. Cross-actor, hidden, mixed, forged and stale inputs must hold before a model request.

Actual UI captures also showed that ordinary Fit to view obscured input nodes behind the floating shelf, and its interaction zoom floor clipped the largest maps. Whole-graph Fit uses the existing shelf inset by default and can show a smaller complete overview; normal zoom and focused node inspection retain their ordinary limits. Browser regressions cover roots, a pinned helper and all four capstone overviews.

Multi-turn execution of the native Memory lesson exposed a retained-source lifecycle failure: Apply preserved the original native reply and selected the reviewed swipe, while stored episode references still named the original revision. Accepted memory persistence now rebases only that exact owned native source reference to the verified selected publication revision. Unrelated historical references, model prose, proposal identity and receipt fingerprints remain unchanged. The original-preserving publication and actor visibility are rechecked around asynchronous hashing; cancellation, release or edits prevent persistence. Reload validates the current selected source without granting authority over arbitrary older swipes.

The progression lesson also compares the original experience value with the final projected value after all confirmed rewards. Real two-objective 260-to-300 acceptance and rejection cases cover the complete threshold crossing.

Large appended notes retain the separate native evidence and publication bounds: model-facing settled events remain limited to 4,096 characters, while exact accepted or historical selected-publication provenance is validated within the existing 100,000-character publication limit. Native Apply, controller disposal, metadata reload, canonical Recall and a second accepted Internalize turn are covered together. Presentation notes are never added to event evidence. Edited publications, cancellation and actor/visibility changes invalidate retained authority.

## Combined release integration

The completed, separately approved legacy-removal task was delivered to main while this curriculum was being verified. It is included under the user's all-repository-changes merge instruction. The release retains unified-only root admission/execution, recoverable archivedWorkflows, portable recovery export, unified Review/Publish ownership, assignment cancellation, retained stage helper identities and implicit actor-private State Value authority. The 30 new lessons remain the visible catalog; the 31 earlier unified IDs remain available for compatibility installation. Retired Pre/Post IDs are unavailable for installation or execution. New catalog metadata, keyboard focus, graph Fit, Character Direction Data and accepted-memory durability remain intact.

Before this integration, all 248 unit files passed; the broad browser run passed 272 cases and its two retired-title failures passed focused reruns. Final release claims use the fresh combined-tree checks below, rather than these earlier component checks.

## Final combined-tree verification — 0.27.0

- Complete unit/runtime run: **240/240 test files passed**, including all **32 authored-flow integration cases**.
- Complete browser run on isolated port 4222: **275/275 cases passed**, no failures or retries (16.7 minutes).
- Svelte/TypeScript: **0 errors, 0 warnings**. Production build: **171 modules**, self-contained UI and CSS.
- Assets: **490 versioned local imports**, one native domain module graph. Documentation: **11 guides, 225 local links, 75 operations, 20 screenshots**.
- Fresh installation: **142 local requests, zero API/provider calls**, no missing assets or browser errors, no developer UI source or node_modules dependency.
- Curriculum: **30 root bundles, nine pinned helpers**, all 48 generated output hashes unchanged across two generator runs.
- Final wide/narrow captures: 1440px and 500px catalogs, helper13, time24 and capstones27–30; zero overflow, browser errors or provider calls.
- Independent final merge review: **20/20 targeted interaction tests passed**, no actionable findings. Additional owner checks: **59/59 catalog/configuration tests**, **47/47 freshness/retirement/prior-unified tests**, and **34/34 native memory settlement tests**.
- Verified main cleanup commit included: **64cf727**; earlier Workflow Data/launcher commit **d047477** retained. Unrelated active-chat plans and work artifacts remain untouched.

Git integration and remote verification are recorded after the approved push.
