# Lattice Reference Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Build isolated Transpose engines, a policy library and portable existing-operation subgraphs for later Architecture intake.

**Architecture:** A common frozen-Draft helper enforces original permissions and maps raw prose to existing Patches. Deterministic terminology and one-call reference transfers consume it; a separate adapter provides metadata/named inputs without modifying core. Policy content and existing-operation packages are independent lanes.

**Tech Stack:** Existing ES modules, Result values, `.d.ts`, Node assertions; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-08-lattice-reference-tools-design.md`.

## Global Constraints

- Reviewed base193ebca23187fa6485735b1461b3b88fdd73bc65; new files only; core/runtime/UI/starters/release assets untouched.
- JavaScript Results and declarations; production JS imports?v=0.19.1; no new dependencies or direct provider/host calls.
- Draft/candidate/reference text100,000 UTF-16; Draft clone20,000 values/depth40/500,000 key+string units; spans/windows256; pins128×2,048.
- Original source provenance and existing spans stay frozen; scope can only narrow; raw missing permissions need explicit construction; no Apply authority.
- Style/Format one Prose request, Terminology zero; no retries/profile changes; prompt500,000; instructions10,000; maxTokens1..65,536 default2048.
- Parallel workers own disjoint files; no worker commits/subagents; controller serializes exact paths and reviews. Focused TDD per worker; full project suite at joined verification.
- Baseline82/85 with loop-ui, workflow-controller-dispatch, workflow-ui failures; do not change those tests.

## Review Focus

1. Inherited/getter source or settings fields must not execute or weaken permission checks.
2. Repeated immutable anchors must fail ambiguous alignment instead of assigning the wrong original span.
3. Unicode word boundaries/case behavior must preserve original offsets and avoid partial-word edits.
4. Late model completion/cancellation and reference prompt content must never gain host authority or change bindings.
5. Complete package/library selection must retain policy entries, pinned definitions and request bounds through round trips.

### Task 1: Frozen Draft permissions and patch alignment

**Files:** Create `src/workflow/operations/reference-draft.js`, `.d.ts`, `tests/workflow-reference-draft.test.mjs`.

**Interfaces:** Produce prepareReferenceDraft(draft,{scope,protectedLiterals}), createReferencePatches(prepared,replacements,metadata), alignReferenceCandidate(prepared,candidate,metadata). Consumers receive deep-frozen authenticated preparation with draft/windows/protectedLiterals.

- [ ] One explicit whole raw-Draft test RED→GREEN; assert original unchanged, source retained and real validatePatches accepts returned patches.
- [ ] Incrementally test missing-authorized scope, scoped-without-spans rejection, existing [] no edit, original span/index retention, narration/dialogue and ambiguous quotes, protected-range subtraction, surrogate boundaries and exact limits.
- [ ] Test no-change, unique prefix/internal/suffix anchors, missing/out-of-scope changes, repeated-anchor ambiguity, multi-window parent reconstruction and blank/protected/output-limit rejection.
- [ ] Test getters/inherited source, sparse/cyclic data and forged/cloned preparations; no accessor calls/no authority on failure.
- [ ] Run focused test/self-review/report; controller commits exact files and obtains scoped spec/quality review.

### Task 2: Deterministic Terminology Map

**Files:** Create `src/workflow/operations/terminology-map.js`, `.d.ts`, `tests/workflow-terminology-map.test.mjs`.

**Interfaces:** Consume Task1 prepared windows and createReferencePatches. Produce mapTerminology(draft,{entries:[{from,to}]},{scope,protectedLiterals,caseSensitive,match}) as specified.

- [ ] Canonical term replacement test RED→GREEN, asserting compatible patches and source preservation.
- [ ] Incrementally cover simultaneous A→B/B→C, leftmost-longest overlaps, duplicate rules, exact literal dollar replacement, word vs phrase, Unicode letters/marks/offsets, protected and scoped exclusions.
- [ ] Cover128 mappings/4,096 findings/100,000 output, nonblank2,048 entries, malformed/accessor data, no-change and input isolation.
- [ ] Run focused tests/self-review/report; controller commits owned files and obtains scoped review.

### Task 3: Raw-prose reference transfer service

**Files:** Create `src/workflow/operations/reference-transfer.js`, `.d.ts`, `tests/workflow-reference-transfer.test.mjs`.

**Interfaces:** Consume Task1 prepareReferenceDraft/alignReferenceCandidate and existing JSON clone/stringify. Produce transferDraft(draft,reference,{kind,mode?,scope,strength,instructions,maxTokens,protectedLiterals},ports).

- [ ] One Style Transfer raw-prose request test RED→GREEN with real patch validation; exactly one injected service call.
- [ ] Incrementally cover four style modes, format prompts, Text/Data references, requiredContent missing preflight, explicit Context and Draft context, max limits and no-window/no-change behavior.
- [ ] Assert prompt excludes full source token/profile metadata, treats references as material, preserves immutable anchors and never returns Candidate/host effects.
- [ ] Cover request/tokenizer failures, malformed responses, truncated/unverified finish, abort before and during both awaits, changed caller data during await and exact whitespace preservation. Never strip fences; test wrapper rejection with immutable prefix/suffix anchors, with authorized text remaining review-dependent.
- [ ] Run focused tests/self-review/report; controller commits owned files and obtains scoped review.

### Task 4: Transpose metadata and named-input adapter

**Files:** Create `src/workflow/operations/transpose-nodes.js`, `.d.ts`, `tests/workflow-transpose-nodes.test.mjs`.

**Interfaces:** Consume Tasks2/3; produce TRANSPOSE_OPERATIONS, describeTranspose(node), executeTranspose(node,namedInputs,execution). Exact controls/ports/contracts are in the spec.

- [ ] Describe post-only Style Transfer with in:Draft/reference:Text/context:Context/out:Patches RED→GREEN; test Data reference switch and version/phase validation.
- [ ] Test default/invalid controls, node envelope getter immunity, stale/missing/extra/wrong-kind inputs, mode/scope separation and typed metadata bounds.
- [ ] Execute all three operations against real helpers; validate patches with existing gate, preserve source, assert request bounds1/1/0 and zero binding/provider/host resolution.
- [ ] Run focused tests/self-review/report; controller commits owned files and obtains scoped review.

### Task 5: Category-based slop policy data

**Files:** Create `data/ai-slop-policy.json`, `src/workflow/library/slop-policies.js`, `.d.ts`, `tests/workflow-slop-policies.test.mjs`, `tests/fixtures/ai-slop-source.md` (exact source copy for portable verification).

**Interfaces:** Read the user's source file as data. Produce selectSlopPolicies(library,{mode,scope,categories})→Result<{value}>; source metadata/IDs/categories/entries exactly as spec.

- [x] Source completeness test RED→GREEN:14 categories,273 occurrences,271 unique entries,17 templates,2 behaviors; adequate/acceptable retain both tags.
- [x] Test inspect/contextual/strict selection, independent scope/category filtering, stable source wording, detached output, unknown modes/categories, malformed/accessor/oversized data and no truncation at128.
- [x] Confirm templates/behaviors are not compiled as literal rules; selection makes no calls and no mutations.
- [x] Run focused tests/self-review/report; controller commits owned files and obtains scoped review.

### Task 6: Portable existing-operation library

**Files:** Create `src/workflow/library/subgraphs.js`, `.d.ts`, `tests/workflow-library-subgraphs.test.mjs`, `examples/library/subgraphs/{context-lens,scene-compass,literal-cleanup,formatting-cleanup}.json`, three corresponding roots (excluding context-lens) in `examples/library/workflows`, and `docs/lattice-reference-library.md`.

**Interfaces:** Consume existing definition/package/runtime APIs, not new Transpose engines. Produce createLibrarySubgraph(id)→Result<{definition,json}> and createLibraryWorkflow(id)→Result<{graph,json}>.

**Review correction:** Deliver Context Lens and Scene Compass subgraphs plus the Scene Compass root. Literal Cleanup and Formatting Cleanup return visible permission-prerequisite errors and remain documented recipes; remove their executable JSON files. The base cannot safely guard existing Pattern Scan's permission replacement or Text Rules' implicit construction without changing core. The superseding spec ruling preserves the global permission constraint.

- [ ] Context Lens standalone parse/round-trip/verified-hash test RED→GREEN; roots remain outside body.
- [ ] Incrementally add Scene Compass, Literal Cleanup and Formatting Cleanup with stable typed boundaries/exposed controls/unresolved roles and canonical generated files.
- [ ] Execute three complete roots through current runtime using fixed request/snapshot ports; default bounds1/1/0 for scene-compass/literal-cleanup/formatting-cleanup, no-match cleanup0, no installation/arming/Apply side effect. Context Lens remains a0-call utility subgraph inside Scene Compass; requesting it as a complete root fails visibly.
- [ ] Test package import/export and semantic identities, source/terminal exclusions, local profile stripping and pinned definitions. Document setup, mode distinctions and later Transpose registration.
- [ ] Run focused tests/self-review/report; controller commits owned files and obtains scoped review.

### Task 7: Joined verification and handoff

**Files:** Controller updates this plan and creates `docs/research/2026-10-08-reference-tools-handoff.md`.

- [ ] Run all new focused tests, full npm test, project types/build/assets and strict declaration check; classify every baseline/new failure accurately.
- [ ] Obtain whole-branch independent review, resolve findings with a reviewed fix wave, and retain all evidence/rulings.
- [ ] Deliver exact base/HEAD/owned paths, helper/engine/adapter contracts, package files, verification and integration checklist to Architecture for separate post-release intake.
- [ ] Preserve isolated branch/worktree; no main push, core integration or shelf installation from this chat.

## Execution order

Initial parallel lanes: Tasks1,5,6. After Task1 review, Tasks2 and3 can run independently. Task4 follows reviewed2/3. Controller-only commits and per-task diff packages prevent shared-index races. User explicitly selected parallel execution; ordinary choices and documented preflight rulings do not pause work for another permission round.
