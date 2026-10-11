# Familiar Node Data Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make node creation and editing accept familiar schema-specific inputs while compiling validated canonical settings.

**Architecture:** A shared input contract declares grammar, storage, and limits; pure adapters compile rows/imports into node settings. Both authoring screens render the same projected controls and use existing graph transactions. Implement the catalog inventory in three waves without a universal prose parser.

**Tech Stack:** JavaScript ES modules, Svelte 5, TypeScript declarations, Node >=24, Node tests with the repository host import, Playwright.

**Spec:** [Familiar node entry](../specs/2026-10-10-node-entry-design.md). Read the [overview](../specs/2026-10-10-readable-node-workflows-design.md) and [delivery order](2026-10-10-readable-node-workflows.md) first.

## Global Constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- CSV applies only to declared list/table controls; prose, templates, paths, and regex expressions retain their syntax.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Review Focus

- Numeric-looking terms, quoted commas/newlines, and malformed apparent JSON must keep the intended type or retain an actionable invalid draft (Task 1).
- Schema/threshold JSON-text storage must not become double-encoded when passing through Configure Node (Tasks 2 and 5).
- Editing/reordering generated-ID rows and switching formats must preserve identity, optional absence, and supported advanced fields (Task 3).
- Path keys containing commas/dots and own `__proto__` fields must remain literal keys without prototype mutation (Task 4).
- Dynamic modes, changed graph captures, null comparison values, and exact helper references must remain valid through save/cancel/Undo (Tasks 2, 4, and 6).

## Ownership and dependencies

This stream owns shared authoring modules and controls. Pattern owns its runtime catalog/engine and current rule schema; consume `{id,pattern,label?}` without reintroducing `pattern-scan`. Preview owns `OutputPreview.svelte` and its DTOs. Coordinate `workspace-preparation.js` and `ui/detail-types.ts` edits sequentially; do not let agents edit these shared files concurrently.

## Task 1: Bounded field-specific input contracts

**Files:** Create `src/ui/control-input-contracts.js`, `.d.ts`, `src/ui/delimited-input.js`, `.d.ts`, and `tests/ui-control-input-contracts.test.mjs`.

**Interfaces:** Produce `ControlInputFormat`, `ControlInputSpec`, `resolveControlInputSpec(context)`, `parseControlInput(spec,input)`, and `formatControlInput(spec,value,format)` exactly as specified. `parseDelimitedInput(text: string, delimiter: ',' | '\t'): Result<{rows: string[][]}>` owns quoted-cell tokenization; list contracts flatten cells, table contracts retain rows. Use existing `cloneJsonValue` and descriptors for budgets. Explicit TSV import is allowed; automatic term entry splits commas/newlines only.

- [ ] Add named tests asserting `though` -> one string term, `1, 2, 3` -> three strings, `001` stays a string, numeric thresholds -> finite numbers, quoted comma/newline/doubled quote preservation, ignored blank-cell warnings, and unterminated quote errors. Assert regex `a{1,3}` remains one expression.
- [ ] Add `apparent JSON is not silently reinterpreted`: malformed `["one",` returns `ok:false`; explicit Plain text accepts it literally; `true`/`null` in term Auto remain strings. Assert invalid input and generic JSON byte/depth/value limits fail without values.

  Decisive assertions using the literal-list spec fixture:
  ```js
  assert.deepEqual(parseControlInput(termSpec, {format:'auto', text:'001, 2'}).data.value, ['001', '2']);
  assert.equal(parseControlInput(termSpec, {format:'auto', text:'["one",'}).ok, false);
  assert.deepEqual(parseControlInput(termSpec, {format:'plain', text:'["one",'}).data.value, ['["one",']);
  ```
- [ ] Run `node tools/test-all.mjs ui-control-input-contracts`; confirm the new contract tests fail for the missing interfaces.
- [ ] Implement bounded own-data parsing, expected-shape JSON recognition, storage-aware formatting, and declared contracts for every inventory entry. Raw JSON-text sources remain exact; unsupported/lossy exports fail explicitly.
- [ ] Run the same command; require every assertion to pass. Commit only Task 1 files with `feat(ui): add control input contracts`.

## Task 2: Shared creation and editing controls

**Files:** Create `src/ui/node-control-projection.js`, `.d.ts`; modify `src/ui/workspace-preparation.js` (control projection/editor contract key), `src/ui/configured-node-creation.js`, `.d.ts`, `src/ui/controller.js` (configuration projection only), `ui/ConfigureNode.svelte`, `ui/NodeDetails.svelte`, `ui/DetailControl.svelte`, `ui/detail-types.ts`, `ui/storage-setup-types.ts`. Extend `tests/storage-configured-components.test.mjs`, `tests/storage-configured-ui.test.mjs`, `tests/storage-configured-controller.test.mjs`, `tests/ui-details-drafts.test.mjs`, and `tests/ui-workspace-preparation.test.mjs`.

**Interfaces:** Produce `projectNodeControls(operation: string, controls: Record<string,unknown>, context: {phase: 'pre'|'post'; readOnly?: boolean}): DetailControl[]`, reusing descriptor resolution and presentation logic. Each control carries its `ControlInputSpec`; the editor contract key includes spec ID/version and relevant mode. Retain the existing `apply(key, controlsText, phase)` configured-session boundary: maintain typed draft controls internally and serialize exactly once at Apply.

- [ ] Add tests that creating/editing the same node exposes the same control labels/grammar; whole-controls Advanced JSON and friendly forms produce the same validated settings. Assert one creation/save Undo, cancel neutrality, no workflow/model calls, exact helper choice validation, phase locks, and stale graph capture rejection.
- [ ] Add `json-text controls serialize once` with threshold/schema strings and a valid nested object; assert stored controls are strings containing the intended JSON, rather than quoted JSON string literals. Add invalid draft retention and spec-version/mode draft invalidation tests.

  Fixture assertions:
  ```js
  assert.equal(createdNode.thresholds, '[1,2,3]');
  assert.deepEqual(JSON.parse(createdNode.thresholds), [1, 2, 3]);
  assert.deepEqual(editedNode.thresholds, createdNode.thresholds);
  assert.equal(workflowRuns, 0);
  ```
- [ ] Run `node tools/test-all.mjs storage-configured ui-details-drafts ui-workspace-preparation`; confirm failures exercise the intended new behavior.
- [ ] Extract control projection, render shared `DetailControl` in Configure Node, and route save through Task 1. Preserve authorization/session/changed-port checks and existing disabled/read-only behavior. Do not create an alternate execution path.
- [ ] Run the focused command plus `npm run check:types`; require passes. Commit only owned hunks with `feat(ui): unify node configuration forms`.

## Task 3: Everyday lists and row editors (wave 1)

**Files:** Create `src/ui/control-input-adapters.js`, `.d.ts`, `ui/TermListControl.svelte`, `ui/HotkeyControl.svelte`; modify `ui/StructuredControl.svelte`, `ui/DetailControl.svelte`, the shared contracts/projection, and helper/binding rendering in `ui/ConfigureNode.svelte`. Extend `tests/ui-control-input-contracts.test.mjs`, `tests/ui-structured-controls.test.mjs`, and `tests/ui-structured-controls-large.test.mjs`.

**Interfaces:** Produce `readControlRows(spec: ControlInputSpec, value: JsonValue): Result<{rows: JsonValue[]}>` and `writeControlRows(spec, rows: JsonValue[], currentValue?: JsonValue): Result<{value: JsonValue}>`. Produce `allocateControlRowId(prefix: string, existingIds: readonly string[]): string` using the smallest unused positive suffix. Terms show parsed items before Save; adapters distinguish Pattern `pattern` records from Extract `literal` records.

- [ ] Add tests that edit/reorder Pattern and Extract rows without changing IDs; explicit duplicate IDs fail. Assert Pattern max 128, Extract max 64, Join/Collect 1–16 slots, Context Join minimum two, exact hotkey restrictions, and preserved optional `required`/`default`/label fields.
- [ ] Assert all wave-1 controls in the spec resolve to friendly editors, including existing Compose/Text Rules/State forms, string arrays, and exact For Each helper/binding selectors. Assert CSV on protected terms/IDs preserves strings; paths use segment semantics and regex rows keep commas.

  Stable-ID fixture assertions:
  ```js
  assert.equal(reordered[0].id, original[1].id);
  assert.equal(edited[0].id, original[0].id);
  assert.equal(allocateControlRowId('pattern', ['pattern-1', 'pattern-3']), 'pattern-2');
  ```
- [ ] Run `node tools/test-all.mjs ui-control-input-contracts ui-structured-controls`; confirm new cases fail.
- [ ] Move row adapters into the pure module, add terms/number-list/slot/Extract/hotkey controls, and reuse existing forms. Add explicit Plain text/Advanced JSON alternatives and nonrepresentable-shape feedback; preserve supported advanced values rather than dropping them.
- [ ] Run focused suites, `npm run check:types`, and `node tools/test-all.mjs workflow-model-nodes workflow-control-nodes workflow-collection-nodes workflow-recall-nodes`; require passes. Commit `feat(ui): add familiar list and rule editors`.

## Task 4: Typed values and paths (wave 2 foundation)

**Files:** Create `ui/JsonValueControl.svelte`, `ui/JsonPathControl.svelte`, `src/ui/json-value-authoring.js`, `.d.ts`, `tests/ui-json-value-authoring.test.mjs`; modify `ui/StructuredControl.svelte`, shared contracts/adapters/projection, `src/workflow/types.d.ts`, and `src/workflow/operations/control-nodes.js` only for comparison-value descriptor projection. Extend structured-control and configured-authoring tests.

**Interfaces:** Add `ControlDescriptor` variant `{type:'json-value'; default:JsonValue}` for the Condition comparison value, including null. Produce `updateJsonValueAtPath(value: JsonValue, path: JsonPath, edit: {action:'set'; value:JsonValue} | {action:'remove'}): Result<{value:JsonValue}>`. The UI distinguishes keys from indices and default-disabled from default-null.

- [ ] Test nested key `a.b`, key `red, blue`, own key `__proto__`, index 0, finite number 0, boolean false, null, empty string, and omitted default. Assert no inherited/prototype lookup or mutation and no double serialization.
- [ ] Test consuming-schema path restrictions: Select Fields accepts an explicit numeric index, while string-array path contracts retain string `0` and expose no unsupported numeric-index choice.
- [ ] Test Condition value type switching through null/object/array/scalars without the field disappearing; path reordering and invalid unfinished typed values retain drafts.

  Own-key assertion:
  ```js
  const edited = updateJsonValueAtPath({}, ['__proto__'], {action:'set', value:{polluted:true}});
  assert.equal(edited.ok, true);
  assert.equal(Object.hasOwn(edited.data.value, '__proto__'), true);
  assert.equal({}.polluted, undefined);
  ```
- [ ] Run `node tools/test-all.mjs ui-json-value-authoring ui-structured-controls storage-configured workflow-control-nodes`; confirm targeted failures.
- [ ] Implement bounded type-tree/path editing and the comparison descriptor; use Task 1's JSON budgets. Replace nested “Path (JSON array)” and “Default (JSON)” mandatory entry with typed controls, retaining Advanced JSON.
- [ ] Run the same suites and `npm run check:types`; commit `feat(ui): add typed value and path controls`.

## Task 5: Supported-subset schema builder (wave 2)

**Files:** Create `ui/SchemaControl.svelte`, `src/ui/schema-authoring.js`, `.d.ts`, `tests/ui-schema-authoring.test.mjs`; modify shared contracts/adapters, `src/workflow/operations/json-decode.js` and `.d.ts` to expose existing schema admission without broadening it.

**Interfaces:** Produce `validateJsonSchema(schema: unknown): Result<{schema: JsonValue}>` wrapping the current engine validator; `updateSchemaAtPath(schema: JsonValue, path: readonly string[], patch: Record<string,JsonValue>): Result<{schema:JsonValue}>` handles schema nodes. Expose only the keywords/types in the spec, with optional schema enabled/disabled state and JSON-text storage.

- [ ] Test every supported keyword class, nested properties/items, Required toggling, enum/const typed values, unsupported `$ref` rejection, schema depth 17 rejection, >1,000 schema-node rejection, and exact Advanced JSON-text retention.
- [ ] Assert all seven schema consumers resolve to the builder and compile through their existing validator; builder/view switches preserve title/description/$schema and optional schema absence.

  Supported-subset assertions:
  ```js
  assert.equal(validateJsonSchema({type:'string', minLength:1}).ok, true);
  assert.equal(validateJsonSchema({type:'object', $ref:'#/other'}).ok, false);
  assert.equal(savedSchemaText, originalValidJsonText);
  ```
- [ ] Run `node tools/test-all.mjs ui-schema-authoring workflow-json-decode workflow-model-nodes workflow-format-records`; confirm targeted failures.
- [ ] Implement the builder with Tasks 1/4, expose admission, and wire all listed schema controls. Do not relax runtime raw JSON/provider parsing or add unsupported schema keywords.
- [ ] Run the same suites, relevant file/document operation tests, and `npm run check:types`; commit `feat(ui): add supported schema forms`.

## Task 6: Decision and schedule configuration (wave 3)

**Files:** Create `ui/DecisionQuestionsControl.svelte`, `ui/ScheduleControl.svelte`, `src/ui/decision-authoring.js`, `.d.ts`, `src/ui/schedule-authoring.js`, `.d.ts`, `tests/ui-decision-authoring.test.mjs`, `tests/ui-schedule-authoring.test.mjs`; modify shared contracts/adapters/projection and `ui/DetailControl.svelte`.

**Interfaces:** Produce `compileQuestionRows(rows: JsonValue[], currentValue?: JsonValue): Result<{value:JsonValue}>` via `validateDecisionQuestions`; `compileScheduleRows(rows: JsonValue[]): Result<{value:JsonValue}>`; `durationToMinutes(quantity:number, unit:'minutes'|'hours'|'days', dayLengthMinutes?:number): Result<{minutes:number}>`. Without an authored day length, days produce an actionable error; minutes/hours remain deterministic. Time Trigger metadata uses Task 4's typed tree and existing reserved-key validation.

- [ ] Test yes/no -> `noul`, 1–32 question bounds, 2–255 choices, 2–10 score levels, stable question IDs, structured instructions, and supported advanced criteria preservation.
- [ ] Test interval 8 hours -> 480 minutes, explicit day length conversion, missing day-length error, safe-integer overflow, daily/interval/delay fields, duplicate schedule IDs, 1,000-schedule bound, revision/order/scope preservation, and reserved metadata rejection.

  Conversion and question fixture assertions:
  ```js
  assert.deepEqual(durationToMinutes(8, 'hours').data, {minutes:480});
  assert.equal(durationToMinutes(1, 'days').ok, false);
  assert.deepEqual(durationToMinutes(1, 'days', 1200).data, {minutes:1200});
  assert.equal(compiledQuestions['question-1'].type, 'noul');
  ```
- [ ] Run `node tools/test-all.mjs ui-decision-authoring ui-schedule-authoring workflow-decision workflow-time-nodes`; confirm targeted failures.
- [ ] Implement cards/rows and typed metadata with existing runtime validation. Preserve explicit clock/calendar/helper identities; do not infer them from prose.
- [ ] Run the same suites, `npm run check:types`, and `npm run build`; commit `feat(ui): add question and schedule forms`.

## Task 7: Reviewable bulk imports and catalog coverage

**Files:** Create `ui/ControlImport.svelte`, `src/ui/control-table-import.js`, `.d.ts`, `tests/ui-control-table-import.test.mjs`; modify shared controls and `tests/ui-control-input-contracts.test.mjs`. Add `tests/browser/node-entry.spec.mjs`; extend `tests/browser/node-details.spec.mjs` and `tests/browser/details-overhaul.spec.mjs`.

**Interfaces:** Produce `parseControlTableImport(spec: ControlInputSpec, text:string, options:{delimiter:','|'\t'; columns:Record<string,string>; action:'add'|'replace'; currentValue:JsonValue}): Result<{value:JsonValue; rows:JsonValue[]; warnings:readonly string[]}>`. Supported table mappings: Pattern pattern/label/id, Extract literal/label/id, Text Rules kind/pattern/replacement/flags, slots id/label/required, and field mappings name/path/required/default with explicit typed cells. Other advanced structures retain their native forms/JSON.

- [ ] Test header mapping, quoted multiline cells, blank/invalid rows, add/replace, duplicate IDs, omitted optional columns, and typed field cells; importing never mutates currentValue or saves before confirmation.
- [ ] Add exhaustive catalog contract coverage including dynamic modes, null Condition values, and Filter protected literals when that operation is installed. Assert unknown newly exposed structured controls fail the coverage test rather than silently defaulting to raw JSON.

  Import fixture assertions:
  ```js
  assert.deepEqual(parseDelimitedInput('pattern,label\n"red, blue",Color', ',').data.rows,
    [['pattern','label'], ['red, blue','Color']]);
  assert.deepEqual(currentValue, originalValue);
  assert.equal(saveTransactionsBeforeConfirmation, 0);
  ```
- [ ] Run `node tools/test-all.mjs ui-control-table-import ui-control-input-contracts`; confirm targeted failures.
- [ ] Implement import review and integration with the ordinary save transaction; mark individual row/cell errors, preserve invalid draft input, and show parsed counts.
- [ ] Run focused suites, `npm run check:types`, `npm run build`, and `npx playwright test tests/browser/node-entry.spec.mjs tests/browser/node-details.spec.mjs tests/browser/details-overhaul.spec.mjs`; require passes. Commit `feat(ui): add reviewable control imports`.

## Stream completion

Deliver the spec's complete coverage matrix, not only Pattern entry. Documentation/examples are updated by the coordinated delivery task, after the new Pattern catalog lands. Run `node tools/test-all.mjs ui-control ui-json-value ui-schema ui-decision-authoring ui-schedule-authoring ui-details-drafts ui-structured-controls storage-configured` and the browser command above. Record actual results and any unrelated pre-existing failures; do not claim runtime checks were run while merely writing this plan.
