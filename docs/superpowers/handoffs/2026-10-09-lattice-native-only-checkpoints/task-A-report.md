# Task A checkpoint (handoff requested)

Status: paused at ROOT's requested safe checkpoint for model replacement. Changes are uncommitted and must be preserved. No Git mutations, builds, browser sessions, provider calls or secrets accessed.

## Binding requirements read

- `.superpowers/sdd/2026-10-09-lattice-native-only/task-A-brief.md`
- `docs/superpowers/specs/2026-10-09-lattice-native-only-design.md`

Task A owns workflow contract/document/validation/package/ports/insertion/transaction/composition/definition/runtime/host/recording/run-state/types/starters modules and focused domain tests plus workflow JSON examples. B owns new `src/workflow/clipboard.js`; C owns UI/controller; ROOT owns state/run/index/library/theme/tools and orchestration tests. Do not edit their modules or revert their changes.

## RED evidence

Added `tests/workflow-current-admission.test.mjs` and ran `node tests/workflow-current-admission.test.mjs` before production changes. Failed with AssertionError `reject comfytavern-workflow schema 2`, actual true vs expected false, at line 19. This is the meaningful obsolete-brand acceptance bug. Test also covers rejection of old envelope/schema/raw graph across file and additive boundaries, getter-free current classification, absent optional containers/detached clone, unfinished graph import/export, current standalone subgraph envelope schema1/runtime2, and multibyte 2,000,000-byte admission limits.

## Current edits

- `src/workflow/contracts.js`: replaced primitive/schema2 validation and native/legacy routing classifier with current-only `isWorkflowGraph`, `validateGraphStructure`, `validateWorkflow`. `isWorkflowGraph` currently uses full structural validation; accepts unfinished authoring graphs and avoids getters through safeWorkflowData. Old versions return UNSUPPORTED_VERSION before structural inspection.
- `src/workflow/document.js`: NEW `cloneWorkflowDocument(graph):Result<NativeGraph3>`, validates current structure then structuredClone, fills missing groups/roles/portals/definitions. No migration/re-export.
- `src/workflow/packages.js`: current-only workflow schema2/minRuntime2/lattice-workflow envelope; graph schema3/runtime2 required before portability conversion. Universal UTF-8 byte limit now applies before package parsing; no old brand/old envelope compatibility. Exports validate original and sanitized graph; private fields/profile IDs still stripped. Standalone subgraph path unchanged so far.
- `src/workflow/graph-validation.js`: replaced stale schema2 guard comment only.
- `tests/workflow-current-admission.test.mjs`: NEW test described above.

No GREEN verification yet. Current insertion/transactions/migration and external callers still import removed `isNativeWorkflow`, so the tree is intentionally incomplete until remaining ownership work closes them. `migration.js` and `legacy-insertion.js` still exist and must be deleted after import closure.

## Agreed interfaces

Sent ROOT: remove migration.js/isNativeWorkflow entirely; current consumers use cloneWorkflowDocument from document.js and isWorkflowGraph from contracts.js. Runtime results become only addressed recordings with current schema3/runtime2 and root/target mode, removing legacy artifact/reports/calls/outputs fields.

Sent B: `exportWorkflow(currentGraph)` -> `{kind:'lattice-workflow',schema:2,minRuntime:2,graph}`; `parseWorkflow(envelopeJson)` yields detached sanitized current graph, unfinished allowed. Existing `prepareWorkflowInsertion(destination, importedGraph, {at,allocateId?,viewPath?})` API must remain, yielding candidate/additions/identityMap plus semantic/document signatures and binding diagnostics without mutation. Preserve exact definition dependency closure, remapping and isolated imported role bindings.

Sent ROOT starter guidance: preserve existing STARTERS, starterGraph(id), installStarter(id,settings); no createStructuredGuidanceStarter currently exists. ROOT can call installStarter('structured-guidance',settings), which makes independent suffixed IDs and leaves enabled/nativeBindings untouched. All starterGraph outputs must directly be schema3/runtime2.

## Remaining work

1. Replace normalizeNativeGraph imports/calls with cloneWorkflowDocument in owned ports/composition/connection-edits/definition-library/runtime; remove migration.js afterward. Guard import closure across non-owned files coordinated with ROOT/B/C.
2. Current-only insertion: parseWorkflowInsertionFile simply delegates parseWorkflow, eliminate raw/native fallback, legacy normalization/signatures/diagnostics/decider branch, but retain named endpoints/portals/qualified ownership/role remapping/definition pin closure/placement/no-op identity semantics.
3. Current-only transactions: structural validation and semantic signature only; retain private WeakMap capabilities, session/root/view freshness, document signatures, protected authority checks and one-step history commit. Remove legacy-insertion.js after import closure.
4. Runtime: delete legacyPlan/schema2 plan branch, calls/reports/outputs accumulation, legacy result DTO branch and raw request transcript retention. Preserve addressed bounded recorder lifecycle, cancellation, request bound/completion evidence, source/private host hooks, deterministic engines and binding freshness.
5. Host: remove old-brand guidance cleanup, schema2 epoch origin result branch, raw candidate selector fallback, old diagnostic DTO fields. Keep opaque handle selection, private payloads, cancellation/freshness/Apply rollback/swipe/source checks intact.
6. types.d.ts: remove NativeGraph2/LegacyNativeWire/LegacyWorkflowRunResult/result unions and schema2 metadata comment. PreparedGraphEdit candidate NativeGraph3 only; bounded run current schema3/runtime2 only. No shim aliases.
7. starters.js: Scene guidance and Reviewed de-slop are currently schema2; unify direct named-pin schema3 generation with roles, formations, bounds 2/1/0/0. Retain the literal/structured exact operation controls and use unique structured node IDs. Regenerate all four workflow JSON envelopes current format; inspect standalone subgraph example closure if affected.
8. Focused tests: port workflow-contracts.test.mjs away from schema2/state/legacy assertions while retaining validation safety scenarios; workflow-packages.test.mjs currently has old compatibility acceptance assertions to replace with rejection; workflow-ports.test.mjs old migration fixtures require current fixtures; workflow-insertion.test.mjs and workflow-transactions.test.mjs contain obsolete tests to remove but preserve meaningful current insertion/history/authority/freshness tests. Existing composition/qualified tests are mostly current, some imports migration.js.
9. Run focused meaningful Node tests and syntax only (no full builds); ROOT ports runtime/host orchestration suites after module freeze. Report exact successful and failing tests, integration needs and freeze.

## Useful findings

- Existing `safeWorkflowData` traversal is bounded 20,000 entries/depth40/2,000,000 characters and rejects accessors/prototype pollution/secret-like keys; retain it.
- Current named structural validation already supports unfinished authoring and named/portal pin checks, current definitions and formation validation.
- `src/workflow/runtime.js` has current addressed execution already, but schema2 fork keeps raw calls/reports/outputs; removal can simplify without changing current loop.
- `src/workflow/host.js`: old branches found around lines 103 (origin schema2 epoch), 115 (comfytavern guidance cleanup), 273 (schema2 raw candidate selector); notify near line90 strips old DTO fields.
- Do not use PowerShell brace expansion for filenames; use rg -g filters or explicit paths.

# Task A continuation: verified freeze

Status: Task A owned implementation and focused tests are complete and frozen for ROOT review. Prior RED evidence and all checkpoint edits were preserved. ROOT explicitly retains final deletion of `migration.js` and `legacy-insertion.js` after non-owned UI consumers close. No Git mutations, full builds, browser sessions, live provider calls, secrets or subagents used.

## Current behavior and interfaces

- `contracts.js`: getter-free `isWorkflowGraph` classifies only own plain current metadata/tables (schema 3/runtime 2/native pre or post), without recursive primitive/domain/resolver work. Prepared child boundary drawing scopes classify correctly. Full bounded safe-data/structure checks stay in `validateGraphStructure`, `validateWorkflow` and `cloneWorkflowDocument`.
- `document.js`: prior current-only detached clone preserved; absent optional groups/roles/portals/definitions are supplied. No migration or compatibility re-export.
- Owned document consumers now import `cloneWorkflowDocument` from `document.js`; no owned active module imports retired migration or classifier aliases.
- Workflow file/additive admission accepts only the current Lattice envelope. Packages keep the universal 2,000,000 UTF-8-byte bound, unfinished authoring support, safe stripping and exact pins. `portableDefinition` retains the computed semanticHash; standalone export/import uses `selectSubgraphClosure` so only exact dependencies are bundled, without a duplicate top snapshot.
- Insertion uses only current structure, named endpoints/portals/qualified ownership, fresh identities, exact definition closure, isolated roles/binding overrides, placement, no-op identity and dual semantic/document preconditions. Removed raw/old-brand/early-native/legacy parsing, decider remapping, diagnostics and signatures.
- Transactions use current structure and semantic identity only; private WeakMap context authority, current root/session/view/read-only/freshness checks, protected metadata, atomic one-step history and no-op behavior remain.
- Runtime emits only addressed bounded recordings; removed schema-2 plan/execution branches and public raw artifact/reports/calls/trace/outputs DTOs and transcript accumulation. Existing cancellation, request bounds/completion evidence, safe metadata, source/binding freshness and private lifecycle hooks remain.
- Host uses only opaque terminal review handles; removed previous-brand guidance cleanup, schema-2 origin/selector/result branches and raw diagnostic DTO fields. Apply source/swipe/rollback/idempotence/freshness authority remains.
- Groups and annotations are visual only: removed group.enabled execution gating and group/inGroup/note/wire order+kind from runtime semantic identity and definition canonical identity. Named routes/endpoints and executable controls/bindings still invalidate work. Groups remain in document freshness/history and portable authoring data.
- `prepareGraphCandidate` now compares supplied optional containers as equivalent to their absence for no-op detection, while retaining raw original document signatures for freshness. This fixes three meaningful unchanged qualified-command regressions exposed by the stricter clone contract.
- All four starters directly emit schema 3/runtime 2 with named pins, current roles/formation controls and bounds 2/1/0/0. `starterGraph(id)` and `installStarter(id,settings)` remain unchanged APIs; installation generates independent IDs and leaves enabled/nativeBindings untouched. Regenerated four workflow envelopes and the standalone literal-cleanup subgraph hash.
- Types removed NativeGraph2/LegacyNativeWire/LegacyWorkflowRunResult and schema-2 result union members; candidates are NativeGraph3 only.

## Exact modified files

Production: `src/workflow/contracts.js`, `document.js`, `graph-validation.js`, `packages.js`, `ports.js`, `insertion.js`, `transactions.js`, `composition.js`, `connection-edits.js`, `definition-library.js`, `definition-data.js`, `prepared-graph-edit.js`, `runtime.js`, `host.js`, `starters.js`, `types.d.ts`.

Examples: `workflows/native-guidance.json`, `reviewed-de-slop.json`, `literal-cleanup.json`, `structured-guidance.json`, `workflows/subgraphs/literal-cleanup.json`.

Tests: `tests/workflow-current-admission.test.mjs`, `workflow-contracts.test.mjs`, `workflow-packages.test.mjs`, `workflow-ports.test.mjs`, `workflow-insertion.test.mjs`, `workflow-transactions.test.mjs`, `workflow-connection-edits.test.mjs`, `workflow-workspace-starters.test.mjs`, `workflow-composition-edits.test.mjs`, `workflow-instance-edits.test.mjs`, `workflow-definitions.test.mjs`.

## Fresh verification

Combined `node --test --test-isolation=none` command ran these 16 files: current-admission, contracts, packages, ports, insertion, transactions, connection-edits, workspace-starters, composition, composition-edits, composition-insertion, qualified-transactions, qualified-manager-edits, instance-edits, definitions and definition-display. Result: **99 tests passed, 0 failed**, exit 0, about 3.6 seconds. It includes actual Worker-based literal cleanup, exact opaque-handle Apply, zero-call structured guidance publication, named connection edits, qualified ownership/revisions, pin closures, bounded admission, private transaction capabilities and atomic history.

Ran fresh `node --check` for all 15 modified workflow JS modules; all syntax checks passed. Active owned workflow source grep (excluding retired files awaiting ROOT deletion) found no isNativeWorkflow/normalizeNativeGraph/legacyPlan/NativeGraph2/LegacyNativeWire/LegacyWorkflowRunResult/comfytavern references.

## ROOT integrations remaining

1. Close remaining UI migration imports in `src/ui/controller.js`, `workspace-preparation.js` and `workflow-surface.js` (Task C); then delete retired `migration.js` and `legacy-insertion.js` outright.
2. ROOT owns porting runtime/host/state/run/index/library orchestration tests, all build/type/browser/full-suite verification and Git integration. Current validation diagnostics expose addressed primitives/units, not retired orderedNodes/results/selectors.
3. Current definition semantic hashes intentionally changed because visual group and saved wire presentation metadata no longer affect execution. The shipped standalone example was regenerated; dynamic fixtures must use computeDefinitionIdentity, and old hash compatibility must not be added.
4. B clipboard remains separately owned; no edits made to `src/workflow/clipboard.js`. B confirmed 7 clipboard tests GREEN after the exact hash fix.
