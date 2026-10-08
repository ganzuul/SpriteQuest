# Lattice node primitives implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development for bounded tasks. Use incremental test-driven development, one failing behavior at a time.

**Goal:** Build and integrate four approved deterministic nodes alongside the active Architecture prototype.

**Architecture:** Independent operation engines first, shared runtime/catalog/UI integration after Architecture's handoff. All host writes continue through existing Guidance or reviewed patch authority.

**Tech Stack:** JavaScript ES modules, JSDoc/declarations, Node assertion tests, native browser Workers; no new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-08-lattice-node-primitives-design.md`

## Global Constraints

- All four nodes are deterministic, make zero model requests, have no host effects and do not mutate inputs.
- New pure modules only until Architecture releases shared files. Never edit its checkout.
- Text limit 100,000 UTF-16 units; JSON 262,144 UTF-8 bytes, depth 32, 10,000 values.
- Failures are Result values; no partial authoritative output or silent truncation.
- Text Rules draft output is Patches validated against frozen original permissions.
- Incremental RED -> GREEN -> REFACTOR, real behavior fixtures, dedicated tests.
- Workers own disjoint files and never revert other agents' changes. Controller serializes commits.

## Review Focus

1. Runtime JSON containing hostile property names or accessors remains plain data without prototype traversal or execution.
2. Sequential Draft replacements never shift original patch permissions or bypass protected wording.
3. Path/template/schema errors fail visibly rather than defaulting or silently weakening constraints.
4. Regex hang, cancellation and output expansion terminate Worker and release resources.
5. New artifact modes survive package/subgraph round trips and preserve host authority.

### Task 1: JSON data operations

Own new `src/workflow/operations/json-data.js`, `json-decode.js`, `select-fields.js`, matching `.d.ts` files if useful, and dedicated `tests/workflow-json-data.test.mjs`, `workflow-json-decode.test.mjs`, `workflow-select-fields.test.mjs`.

Interfaces and exact limits are in the spec. Do not alter shared graph sanitizers. Build JSON cloning/paths, decode/check/subset validation and explicit projection incrementally.

- [ ] Write one test for raw parse output; run it to prove RED; implement minimum; prove GREEN.
- [ ] Repeat for schema mismatch/unsupported schema, boundaries, plain-data rejection, own-key reading, missing/default selection and clone isolation.
- [ ] Run the three focused test files and self-review. Record red/green evidence in the task report.
- [ ] Controller commits exact owned files and obtains scoped spec/quality review.

### Task 2: Text Rules

Own new `src/workflow/operations/text-rules.js`, `text-rules-engine.js`, `text-rules-worker.js`, matching declarations if useful, `tests/workflow-text-rules.test.mjs` and `tests/fixtures/text-rules-node-worker.mjs`. Existing repair.js is read-only.

Build bounded ordered transformations in a real Worker, its cancellable lifetime and Draft adapter. Use existing validatePatches to prove envelope compatibility and preserve scope/spans/protected literals.

- [ ] One literal replacement test RED -> GREEN, then regex captures, extraction, zero-width rejection, bounds and sequential behavior one at a time.
- [ ] Add real Worker timeout/cancellation/cleanup behavior, using Node worker_threads fixture through an injected browser-shaped factory.
- [ ] Add frozen Draft permission/nonblank/protected-literal tests and validate returned patches with the existing gate.
- [ ] Run dedicated tests, self-review, report evidence, then controller commit and scoped review.

### Task 3: Compose

Own new `src/workflow/operations/compose.js`, matching declaration if useful, and `tests/workflow-compose.test.mjs`. Consume cloneJsonValue/readJsonPath from Task 1; do not edit those files.

- [ ] Ordered section join test RED -> GREEN, then template section/data pointers, escaping, missing paths, duplicate sections and limits incrementally.
- [ ] Prove input isolation and no recursive or evaluated expansion.
- [ ] Run dedicated tests, self-review, report evidence, then controller commit and scoped review.

### Task 4: Named-input adapter and registration metadata

Own new `src/workflow/operations/nodes.js`, matching declarations if useful, and `tests/workflow-primitive-nodes.test.mjs`. Consume reviewed APIs from Tasks 1-3. No shared core edits.

- [ ] Build plain metadata and Result-based describePrimitive/executePrimitive interfaces specified in the design's integration section.
- [ ] Incrementally test correct dynamic mode ports/phases, stable section IDs, named input override, missing/stale inputs and native artifact envelopes.
- [ ] Prove zero requests/no host calls, Guidance envelope compatibility and Draft patches passing existing validation.
- [ ] Review and deliver exact commits, report and commands to Architecture.

### Task 5: Shared integration owned by Architecture

- [ ] Architecture cherry-picks reviewed modules onto its stable prototype and retains catalog/types/ports/runtime/packages/UI ownership.
- [ ] Architecture integrates four operations and Text/Data kinds, examples, subgraph exposure and previews while preserving budgets and host authority.
- [ ] Architecture runs focused end-to-end cases, project checks and final release integration. This chat verifies handoff acceptance and reports integration state accurately.

## Execution record

User approval authorizes building and integrating. Routine implementation choices are made autonomously. Independent file ownership permits Tasks 1-3 to run concurrently under the developer's delegation instruction; commits remain serialized. Architecture explicitly accepted core integration ownership. Task 4 provides its requested focused adapter/metadata; Task 5 remains serialized there.
