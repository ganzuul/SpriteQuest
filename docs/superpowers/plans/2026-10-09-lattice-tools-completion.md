# Lattice tools completion implementation plan

> Execute the approved continuation in this chat with disjoint helpers and one independent whole-branch review. Use TDD for changes; preserve the completed prior implementation rather than rewriting it.

**Goal:** Complete the reference-tools handoff as a working isolated branch against current native Lattice.
**Architecture:** Shared frozen permissions support bounded Transpose and raw-prose cleanup engines. Native catalog/runtime/shelf consume typed adapters; portable verified packages compose existing operations.
**Tech stack:** Current ES modules, Results, declarations, Svelte UI and Node/browser tests; no new dependencies.
**Spec:** `docs/superpowers/specs/2026-10-09-lattice-tools-completion-design.md`.

## Global constraints

- Base ca19c51d90e096b208d7d9cc84d7f3246d6fec7c, version 0.22.0; every production JS import uses `?v=0.22.0`.
- Work only in `codex/lattice-tools-completion`. No Main push/merge, version bump, provider requests, arming or introspection changes.
- Draft/reference/output text 100,000 UTF-16 units; instructions 10,000; completion 1..65,536, default 2,048; prepared windows/spans <=256; protected strings <=128 x 2,048; findings <=4,096. Fail rather than truncate authority.
- Existing source-bound permissions and empty spans remain authoritative. Explicit raw scope may construct permissions; later scopes only narrow.
- Style/Format and contextual/strict cleanup <=1 injected Prose request; deterministic and inspect paths 0. No hidden retries or profile changes.
- Canonical policy retains 14 categories, 273 occurrences, 271 unique policies, 17 templates and 2 behaviors; categories and scope are independent.
- Helpers own disjoint files and no Git/build operations; controller owns shared integration, commits, builds, review and handoff.

## Review focus

1. Model cancellation or control/binding/reference edits cannot publish stale authority.
2. Empty permissions, protected dialogue and repeated immutable anchors cannot be widened or reassigned.
3. Policy words inside longer Unicode words are excluded; punctuation normalization retains original offsets.
4. Native descriptions, control editors and package pins agree after mode/reference changes.
5. Default presets never infer dialogue permissions from the selected style mode.

### Task 1: Restore reviewed leaf tools for current native contracts

**Ownership:** helper A owns new reference-draft, terminology-map, reference-transfer, transpose-nodes `.js/.d.ts` and their four prior test files. Reuse old branch files after missing-module/registration tests demonstrate the gap. Adapt import versions; resolve actual current-validator issues through tests. Do not edit core.
- [x] Restore tests and observe missing-feature failure; restore/adapt reviewed engines.
- [x] Run all four leaf suites, relevant validator cases, declaration checks and report.

### Task 2: Complete comprehensive cleanup modes

**Ownership:** helper B owns data/ai-slop-policy.json, portable source fixture, library/slop-policies `.js/.d.ts`, generated slop-policy-data.js, operations/prose-cleanup `.js/.d.ts`, and focused policy/cleanup suites.
**Interface:** export CLEANUP_MODES and `cleanupDraft(draft, settings={}, ports={}) -> Promise<Result<{artifact,report}>>`; consume shared reference-draft helper. Modes inspect/contextual/strict; scope narration by explicit node default; categories [] means all; optional Context is `ports.context`; injected request/countTokens/binding/signal. Setting caseSensitive defaults false.
- [x] Retain full-source policy tests; write cleanup inspect failure first, then complete modes incrementally.
- [x] Test complete selections, Unicode boundaries/punctuation offsets, protected/uneditable findings, truthful template/behavior limitations, strict unresolved checks, prompt redaction, one-call cap and abort/failed-output safety.

### Task 3: Permission-safe scans/rules and portable library

**Ownership:** helper C owns repair.js scanDraft permission correction only; operations/text-rules.js, nodes.js and related declarations only for explicit Draft scope/pins; library/subgraphs `.js/.d.ts`; generated examples/library packages; workflow-library-subgraphs and permission regressions. Do not change repairDraft/validatePatches semantics or root catalog/runtime/UI/starters.
**Interfaces:** Text Rules controls scope authorized/whole/narration/dialogue (default authorized), protectedLiterals []; `createDraftRulePatches` consumes them via prepareReferenceDraft then reconstructs through createReferencePatches. Factory `createLibrarySubgraph(id)` returns definition/json; `createLibraryWorkflow(id)` graph/json. IDs context-lens, scene-compass, literal-cleanup, formatting-cleanup, prose-cleanup; Context Lens is utility-only. Prose Cleanup body uses Repair mode contextual, explicit narration; cleanup controls are supplied by root catalog task.
- [x] Regress empty spans, narrower source scope and protected wording before scan changes.
- [x] Regress explicit raw scope and permission-window Text Rules, preserve original parent indices.
- [x] Restore/adapt Lens/Compass, enable cleanup recipes with current registered operations, generate canonical packages after root catalog is ready.
- [x] Test verified pins, unresolved roles, import/export, runtime request bounds and explicit review/apply roots.

### Task 4: Native operation/runtime/shelf integration

**Ownership:** controller owns catalog.js, runtime.js, graph controls/types as needed, native-search-catalog.js and metadata, starter picker/starters, existing literal examples, docs and integration suites.
- [x] Write missing Transpose registration/ports and cleanup mode tests; watch RED.
- [x] Adapt Transpose descriptors to keyed native editors; dispatch injected bounded runtime services; validate all controls, post-only phases and freshness.
- [x] Add Repair cleanup modes/scope/categories/pins/case controls and optional Context pin; preserve old modes' flow.
- [x] Add Character Voice/dialogue, Format Data, Terminology and cleanup presets. Explicitly author whole scope for existing Draft Text Rules starters/preset.
- [x] Expose portable library workflow starters through explicit installation; preserve fresh default.
- [x] Prove named wiring/package round trips, stale reference/control/binding rejection, zero/one call bounds and source-bound review/application.

### Task 5: Joined verification, review and delivery

- [x] Run full Node suite, types, build/assets, strict new declarations and focused browser tests; resolve introduced failures.
- [x] Generate scoped diff and obtain independent whole-branch review; fix material findings and verify.
- [ ] Commit source and self-contained UI artifacts needed to test this branch, without release bump.
- [ ] Write handoff with exact base/head, included features, test results and integration steps. Preserve branch/worktree for later integration.
