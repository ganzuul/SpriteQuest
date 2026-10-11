# Pattern Detection and Text Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Pattern Scan with a deterministic Pattern detector, route its result through existing Branch, and filter matching lines/paragraphs safely.

**Architecture:** Pattern emits exact Draft passthrough, Boolean Data, and a bounded report bound privately to the scanned Draft. Filter selects atomic deletion units and creates an authenticated deletion-only successor. Existing runtime routing, privacy inheritance, and review/publication remain authoritative.

**Tech Stack:** JavaScript ES modules, TypeScript declarations, Node >=24, owned browser Workers and Node test Worker adapters, Svelte authoring, Node tests, Playwright.

**Spec:** [Pattern and filtering](../specs/2026-10-10-pattern-routing-design.md). Read the [overview](../specs/2026-10-10-readable-node-workflows-design.md) and [delivery order](2026-10-10-readable-node-workflows.md) first.

## Global Constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Detection and filtering use zero model requests; optional natural-language configuration assistance is deferred.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Review Focus

- Duplicate/overlapping rules, Unicode case offsets, and protected hits must produce inspectable counts without granting permissions (Task 1).
- Regex deadlines, cancellation, zero-width matches, and Data report limits must not turn incomplete scans into false decisions (Task 1).
- Whole-unit deletion must preserve source/revision authority and immutable/protected/exempt text, including appended presentation sections (Tasks 2 and 3).
- Copied/forged/stale reports must fail while ordinary direct/static wiring preserves the private report binding (Tasks 1, 3, and 4).
- No-hit, skipped, blocked, and empty-filter states must select/hold the correct path without duplicate execution or effects from previews (Task 4).

## Ownership

Own `pattern`/`filter-text` runtime, catalog/dispatch, Draft deletion authority, and their tests. Node entry owns friendly rule/protection controls and canonical authoring; Preview owns report presentation. Shared catalog/types/controller files are edited sequentially. Existing internal Repair scanning may remain for Repair, but no public legacy Pattern mode or alias is built.

## Task 1: Pattern detector, report binding, and current catalog

**Files:** Create `src/workflow/operations/pattern-nodes.js`, `.d.ts`, `src/workflow/operations/pattern-engine.js`, `.d.ts`, `src/workflow/operations/pattern-worker.js`, `tests/workflow-pattern.test.mjs`, and `tests/fixtures/pattern-node-worker.mjs`; modify `src/workflow/catalog.js`, `src/workflow/runtime.js`, `src/workflow/types.d.ts`, and catalog/port/contract tests referencing the replaced public operation. Inspect `src/ui/native-search-catalog.js` and other discovery projections for title/operation references.

**Interfaces:** Produce the spec's `PatternSettings`, `PatternRule`, `PatternOccurrence`, and `PatternMatchReport`; `describePattern(node:NativeNode): Result<OperationDescription>`; `scanPatternDraft(draft:unknown, settings:PatternSettings, local?:{signal?:AbortSignal; workerFactory?:()=>TextRuleWorker}): Promise<OperationResult>`; `getPatternReportBinding(value:unknown, draft:unknown): Result<PatternReportBinding>`. Binding is a readonly private engine record containing the exact parent object, checked snapshot, effective settings, and scan regions; its lookup does not clone the value first.

- [ ] Add tests for 12/0/2 counts -> total14/ANYtrue/ALLfalse; ANY/ALL with minimum total occurrences; empty rule list false; duplicate authored IDs rejected, duplicate pattern text counted separately; overlapping literal hits sorted start/end/rule index; `though` vs `thought`, `1` vs `12`, and Unicode code-point boundaries.
- [ ] Assert `out === inputDraft`, with no added/narrowed findings/spans/protections; report counts ignore upstream findings. Test whole/narration/dialogue/authorized scope, protected/noneditable true hits, exemptions, malformed quote unresolved counts, and exclusion of appended presentation.
- [ ] Add regex syntax/zero-width/deadline/cancel tests using a terminable Worker adapter; timeout1000, allowed100–2000, no main-thread fallback. Add >128 rules, >2,048-unit pattern, >100,000-unit Draft, >4,096 occurrences, and generic Data report-limit rejection tests. Test no partial/false outputs on failure.

  Complete synthetic scan assertions using the spec-default settings fixture:
  ```js
  const result = await scanPatternDraft(draft, settings);
  assert.equal(result.ok, true);
  assert.equal(result.outputs.out, draft);
  assert.equal(result.outputs.matched.value, true);
  assert.equal(result.outputs.matches.value.totalOccurrences, 14);
  assert.deepEqual(result.outputs.matches.value.rules.map(rule => rule.count), [12, 0, 2]);
  ```
- [ ] Run `node tools/test-all.mjs workflow-pattern workflow-contracts workflow-ports`; confirm new detector assertions fail.
- [ ] Implement bounded match engine and Worker lifecycle, validate the complete report through `cloneJsonValue`, bind the actual emitted value, then emit `out`/`matched`/`matches`. Preserve source/privacy metadata as applicable. Register public `pattern` with the spec's defaults/pins/requestBound0 and remove `pattern-scan` dispatch/catalog references. Keep unrelated Repair helpers internal.
- [ ] Run the same suites plus `node tools/test-all.mjs workflow-repair workflow-text-rules workflow-draft-revisions`, `npm run check:types`, and `npm run build`; require passes. Commit `feat(workflow): add pattern detector` using only owned changes.

## Task 2: Authenticated exact deletion revisions

**Files:** Modify `src/workflow/draft-revisions.js`, `.d.ts`; extend `tests/workflow-draft-revisions.test.mjs` and `tests/workflow-reference-draft.test.mjs`. Keep ordinary `repair.js::validatePatches` blank-replacement policy intact.

**Interfaces:** Add `DraftDeleteRange {start:number; end:number}` and `createDraftDeletionRevision(parent:unknown, ranges:DraftDeleteRange[], settings:DraftRevisionSettings): Result<{draft:DraftArtifact; report:unknown[]}>`. It prepares/validates its own authorized windows from the checked parent and scope/protection/exemption state; Filter's report does not authorize ranges. Reuse/factor internal permission calculation rather than importing reference-draft back into draft-revisions and creating a module cycle.

- [ ] Test exact first/middle/last/multiple deletion ranges; surviving span remapping, lineages/root IDs, retained source identity, Unicode boundaries, protected literals, stored exemptions/case policy, existing scopes, and assembled body/presentation boundaries.
- [ ] Assert out-of-range/overlapping/unsorted/surrogate-splitting ranges fail; immutable/protected gaps fail; no-op returns the original object. Assert copied serialized successors still lack live authority. Ensure ordinary model blank patches and ordinary blank revisions remain rejected.

  Exact deletion assertion:
  ```js
  const text = 'A\nElara\nB';
  const parent = {kind:'draft', text, source:{originalText:text}};
  const result = createDraftDeletionRevision(parent, [{start:2, end:8}], {nodeId:'filter', scope:'whole'});
  assert.equal(result.ok, true);
  assert.equal(result.data.draft.text, 'A\nB');
  assert.equal(result.data.draft.source.originalText, text);
  ```
- [ ] Run `node tools/test-all.mjs workflow-draft-revisions workflow-reference-draft workflow-repair`; confirm deletion-only tests fail for the absent constructor.
- [ ] Implement exact range deletion and offset remapping inside the authenticated revision module. Merge adjacent valid deletion ranges internally. Never use string-anchor alignment to infer deleted regions or widen parent permissions. Return `EMPTY_FILTER_RESULT` before creating a blank story-body successor.
- [ ] Run the same suites plus `workflow-text-rules`; require passes. Commit `feat(workflow): add exact draft deletions`.

## Task 3: Filter units, report admission, and catalog

**Files:** Create `src/workflow/operations/filter-text.js`, `.d.ts`, `tests/workflow-filter-text.test.mjs`; modify `src/workflow/catalog.js`, `src/workflow/runtime.js`, and appropriate declaration/discovery files. Extend operation contract/port tests. Consume Task 1's binding and Task 2's constructor.

**Interfaces:** Produce `FilterTextSettings {action:'remove'|'keep'; unit:'line'|'paragraph'; scope:'authorized'|'whole'|'narration'|'dialogue'; protectedLiterals:string[]}`, the spec's `FilterTextReport`, `describeFilterText(node:NativeNode): Result<OperationDescription>`, `selectFilterUnits(body:string, unit:'line'|'paragraph'): {start:number;end:number}[]`, and `filterPatternDraft(draft:unknown, matches:unknown, settings:FilterTextSettings, local:{nodeId:string}): OperationResult`.

- [ ] Test paragraph default, remove/keep, repeated hits removing one unit once, CR/LF/CRLF ownership, leading/trailing paragraph separators, blank lines, final unterminated line, and byte-for-byte retained text/presentation. Assert `First.\r\n\r\nElara arrives.\r\n\r\nLast.` -> `First.\r\n\r\nLast.`.
- [ ] Test direct bound report success; copied/forged/unresolved/stale/mutated source or permission report rejection. Validate private binding before any generic Data cloning. Test protected/exempt/immutable crossing -> unresolved `FILTER_PERMISSION_BLOCKED` with complete diagnostic report and no partial Draft.
- [ ] Test Pattern-configured protection/exemption absent from the passthrough Draft: a selected paragraph crossing it still blocks. Preserve the stored and scan exemption case policies; pass unioned protected literals to deletion preparation.
- [ ] Test remove-no-hit exact no-op, keep-no-hit and whitespace-only result -> unresolved `EMPTY_FILTER_RESULT`, >256 affected units -> `FILTER_UNIT_LIMIT`, and complete Data report overflow -> `FILTER_REPORT_LIMIT` without output. Assert diagnostics and proposed unit text are available for blocked/empty results.

  Filter fixture assertions:
  ```js
  assert.equal(filtered.outputs.out.text, 'First.\r\n\r\nLast.');
  assert.equal(noHit.outputs.out, originalDraft);
  assert.equal(empty.outputStates.out.status, 'unresolved');
  assert.equal(empty.outputStates.out.reason.code, 'EMPTY_FILTER_RESULT');
  ```
- [ ] Run `node tools/test-all.mjs workflow-filter-text workflow-contracts workflow-ports`; confirm intended failures.
- [ ] Implement units and deduplicated deletion selection, prepare existing reference-Draft windows for unit admission, enforce retained scan restrictions, and call Task 2's independently checking constructor with unioned protections. Register `filter-text` with paragraph/remove/whole defaults, Draft/Matches required inputs, Draft/Report outputs, requestBound0, and dedicated dispatch. Do not route it through generic input validation that clones Matches.value.
- [ ] Run the focused suites plus `workflow-draft-revisions workflow-reference-draft workflow-pattern`, types/build; require passes. Commit `feat(workflow): add pattern text filtering`.

## Task 4: Routing, authority, and preview neutrality

**Files:** Create `tests/workflow-pattern-routing.test.mjs`; extend `tests/workflow-control-nodes.test.mjs`, `tests/workflow-unified-runtime.test.mjs`, `tests/workflow-runtime-addressed.test.mjs`, `tests/workflow-composition.test.mjs`, and `tests/workflow-recording.test.mjs`. Modify runtime/privacy plumbing only if a demonstrated test requires it; do not create a new execution model.

**Interfaces:** Existing Branch consumes `{kind:'data',value:boolean}` on `condition`; its Draft payload uses `in`, `yes`, and `no`. Existing Join takes alternatives, with skipped input behavior. Pattern/Filter outputs follow ordinary `OperationResult` outputStates. Direct/static outputs preserve the Matches.value reference; recordings/descriptive transforms do not.

- [ ] Build synthetic Pattern -> Branch -> Filter/bypass -> Join -> review fixtures. Assert fourteen matches execute Filter once; no-hit skips Filter before binding/execution; unresolved match/filter holds publication; no model requests occur in detection/filtering.
- [ ] Test direct/static/nested wrappers with duplicate local node IDs, Branch/Join/Reroute reference preservation, privacy-inherited envelope copy retaining `.value`, and Collect/Select Fields/recording/import copies rejecting live Filter admission. Keep For Each Draft authority restrictions effective.
- [ ] Test runtime `preview`/`dryRun` and display-mode/copy actions with spies: zero Worker allocation, source capture, model/tokenizer/binding use, filtering execution, and publication. Explicit workflow rerun is a new run; settlement/freshness checks remain effective.

  Runtime fixture assertions:
  ```js
  assert.equal(filterExecutionsForFourteenHits, 1);
  assert.equal(filterExecutionsForNoHits, 0);
  assert.equal(patternAndFilterModelRequests, 0);
  assert.deepEqual(previewEffectCounters, {workers:0, captures:0, requests:0, commits:0});
  ```
- [ ] Run `node tools/test-all.mjs workflow-pattern-routing workflow-control-nodes workflow-unified-runtime workflow-runtime-addressed workflow-composition workflow-recording`; investigate any failures using the existing architecture.
- [ ] Make only required fixes and run that command plus `npm run check:types`, `npm run build`, and `npm run check:assets`; require passes. Commit `test(workflow): verify pattern routing` or a specific fix commit if product changes were necessary.

## Task 5: Current examples and public reference

**Files:** Own Pattern/Filter sections in `docs/node-reference.md`, `docs/operators-manual.md`, `docs/unified-workflows.md`, `README.md`/`docs/README.md` only where these operations are referenced; example generators under `tools/remastered`, checked-in `examples/remastered`/`examples/unified`, and relevant example/guide fixtures. Add `examples/pattern-filter-reply.lattice.json` as a focused synthetic teaching graph unless the current generator already has a suitable dedicated lesson.

**Interfaces:** All current runnable examples use public `pattern` canonical rule records and `filter-text` settings, plus exact current port IDs. The focused lesson uses a synthetic source fixture and the Task 4 graph topology; it must not depend on a private Story-2 file or a user profile/model.

- [ ] Search `rg -n 'pattern-scan|Pattern Scan' src ui tests examples workflows tools docs README.md`. Classify historic research/spec prose separately; replace every active executable/reference occurrence. Do not add aliases or old hash fixtures.
- [ ] Update the authoritative generators before regenerating examples; reconcile concurrent generator/docs changes. Update authored lesson text to teach detection, one branch per reply, and atomic paragraph/line filtering. Explain incomplete/blocked/empty reports and Copy source policy where relevant.
- [ ] Add a current-catalog coverage assertion that active runnable examples contain no removed operation and that the new lesson validates; extend existing example/runtime tests with the synthetic routing scenario.

  Current example assertion:
  ```js
  assert.equal(activeExampleOperations.includes('pattern-scan'), false);
  assert.equal(activeExampleOperations.includes('pattern'), true);
  assert.equal(activeExampleOperations.includes('filter-text'), true);
  ```
- [ ] Run `node tools/check-documentation.mjs`, `node tools/test-all.mjs workflow-example workflow-unified-contracts workflow-pattern-routing`, types/build/assets, and relevant browser node-guide/workflow specs. Require current docs and runnable examples to agree with the catalog.
- [ ] Commit only owned docs/example changes after the coordinated delivery review. If pre-existing edits cannot be separated safely, leave those files uncommitted and report their ownership rather than staging unrelated work.

## Stream completion

Finish all five tasks: a new engine without current examples/docs is incomplete. Do not preserve old public operation behavior or definition hashes. Review deletion/permission logic independently before integration; run the full repository check once after all three streams stabilize, as specified in the delivery plan.
