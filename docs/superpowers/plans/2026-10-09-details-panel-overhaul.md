# Details Panel Overhaul Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans. Execute autonomously under the user's goal, with incremental red/green tests and independent review.

**Goal:** Implement the simplified inspector, structured editors, schema fix, and typed Text modifier stack with verified UI/UX.

**Architecture:** Keep operation semantics and draft ownership in existing workflow/controller layers. Add presentation metadata and focused Svelte field/structured/modifier components. Modifier semantics live in a pure workflow module and participate in validation, execution, persistence, and signatures.

**Tech Stack:** Svelte 5, TypeScript, ES modules, Node 24+, node:test/jsdom, Vite, Playwright. No new product dependencies.

**Spec:** ../specs/2026-10-09-details-panel-overhaul-design.md

## Global Constraints

- Preserve existing operation, port, execution-stop, model-call, and memory/reply-write semantics.
- Preserve qualified selection/revision drafts, explicit structured Save, inheritance, read-only semantic versus presentation permissions, and complete-candidate validation.
- Compact Card is context menu plus graph-focused Shift+C only; no typing shortcut interception.
- Use existing theme roles; support 220–520px panels and light/dark appearances.
- Modifiers are ordered version-1 semantic data on eligible single-Text-output nodes only; missing array is unchanged legacy behavior.
- No new dependencies, no merge/publish, and no edits to the original dirty checkout.

## Review Focus

- Invalid raw JSON survives view/selection switching without corrupting the saved node.
- Mode changes with connected pins reject incompatible candidates and retain useful edits.
- Stale asynchronous saves cannot apply to another qualified node.
- Disabled/unknown modifiers are validated consistently before requests and survive portable round trips.
- Narrow panels, unresolved bindings, read-only bodies, and long errors remain legible and actionable.

### Task 1: Modifier semantics and persistence

**Files:** Create src/workflow/modifiers.js and declarations/tests; modify graph validation, packages, ports signatures, definition data, runtime and recording/preview contracts only as needed.

**Interfaces:** Export modifierTypes, validateNodeModifiers(node, outputPorts), applyTextModifiers(text, modifiers), and modifierSummary(modifiers), using repository Result shapes. Node data is optional modifiers: Array<{id:string,type:string,version:1,enabled:boolean,settings:object}>. Runtime integration produces raw output plus applied trace without changing artifact types.

- [x] Write one failing transform/admission test, run to expected failure, implement minimal behavior, and repeat for each semantic transform and order.
- [x] Cover unknown/duplicate/incompatible/version/limits, bypass/remove distinction, downstream fan-out, zero model reruns, and trace integrity.
- [x] Add preservation/signature/definition/portable tests and integrate complete graph validation before execution.
- [x] Run focused workflow tests and report exact red/green evidence for independent review.

### Task 2: Inspector metadata and editing correctness

**Files:** src/ui/workspace-preparation.js; ui/detail-types.ts; tests/ui-details-projection.test.mjs and existing projector coverage.

**Interfaces:** DetailControl gains optional group, advanced, structured (kind) and changed/inheritance metadata. NodeDetailsView gains operation/familyColor, optional modifier view and capability metadata. NodeDetailsActions gains editModifiers(selection, modifiers). Keep existing fields backward compatible.

- [x] Add a real JSON Decode projection regression that expects schema representation json-text, observe failure, fix projection, verify editing string delivery.
- [x] Add presentation-only grouping/structured metadata and readable labels for all registered node/mode controls; suppress identical effective/source metadata.
- [x] Prepare modifier applicability/summary and canvas visibility using Task 1's stable data; wire edit commands through checked graph candidate + undo.
- [x] Test qualified/read-only/inherited state and unsupported types.

### Task 3: Structured fields

**Files:** Create ui/StructuredControl.svelte and focused helpers/types/test coverage. Avoid editing NodeDetails or shared projector owned by other tasks.

**Interfaces:** Component props: control: DetailControl; text: string; disabled: boolean; ontext(text:string):void; idPrefix:string. It edits the shared raw JSON text draft; parent owns save/validation. Support rules, fields, sections, slots, numeric-map and durations; safely fallback to raw when unknown shapes/options cannot be represented losslessly.

- [x] Add one failing row edit test with exact JSON preservation; run red, implement, run green and repeat for each shape.
- [x] Cover literal/regex supported options, required/default selection fields, section template/text, unknown keys, invalid raw JSON, and disabled editing.
- [x] Keep raw JSON editable and preserve content through row/raw switching.

### Task 4: Simplified inspector and modifier UI

**Files:** ui/NodeDetails.svelte, optional ui/DetailControl.svelte and ui/ModifierStack.svelte, focused UI tests. Controller shortcut/action wiring is integrated separately.

**Interfaces:** Consume Tasks 2/3 props and metadata; use editModifiers with captured DetailSelection. Preserve existing perform/draft/boundary/binding lifetime semantics.

- [x] Update intent-changed tests for header alias, absence of Compact Card/Enabled/main Duplicate/Delete, and conditional provenance; observe failure before implementing.
- [x] Render quiet theme-aware groups, native controls, node/mode metadata, inherited model summary, visible failures/read-only/Blocks run state, and structured component.
- [x] Add an eligible-only compact modifier tray with precise options, explicit save where needed, enabled/remove/reorder, and visible errors.
- [x] Verify drafts, pending save acknowledgment, binding mode staging, every structured editor, and Svelte accessibility/type checks.

### Task 5: Graph commands, live verification, integration

**Files:** src/ui/controller.js, ui/NodeCard.svelte/view contracts, tests/browser/node-details.spec.mjs, context-menu/subgraph tests, docs/operators-manual.md, generated dist via build.

- [x] Test Rename/F2 title focus and Shift+C outside editors, checked context state, undo, and disabled-block behavior; run red, implement minimal changes, run green.
- [x] Verify active modifiers remain visible on full/compact cards and expose raw/modified/fresh preview without model rerun.
- [x] Run npm test, npm run check:types, npm run build, npm run check:assets, and npm run test:browser with isolated server/ports.
- [x] Capture/inspect 220/258/520px panels, light/dark, sparse/model/JSON/Introspection/subgraph/read-only/failed states. Fix issues and rerun affected checks.
- [x] Independent whole-branch review; address concrete findings and reverify. Commit tested changes and leave the managed worktree attached for review.
