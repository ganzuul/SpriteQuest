## Task A: Current document/runtime boundary

**Owner:** contracts/runtime worker.
**Files:** `src/workflow/{contracts,document,graph-validation,packages,ports,insertion,transactions,composition*,connection-edits,definition-*,runtime,host,recording,run-state,types.d.ts,starters}.js` as needed; remove `migration.js` and `legacy-insertion.js`; all four workflow JSON examples. Owner has exclusive workflow-module writes; root retains connections/providers unless a current-only cleanup is necessary and announced.
**Interfaces:** Produce `cloneWorkflowDocument(graph):Result<NativeGraph3>` in document.js, `isWorkflowGraph(graph)` and current validation in contracts.js. Preserve current transaction/resolver/host APIs and addressed result shape. UI/root/Canvas replace their own imports.

- [ ] Add RED admission tests rejecting schema1/schema2/old brand/raw packages and accepting exact current workflow/subgraph formats with byte bounds/unfinished graphs.
- [ ] Remove primitive validation, migration, legacy insertion/signatures, old result DTOs/selectors and previous-brand cleanup. Preserve bounded safe current data, authority, cancellation and authoring/semantic identities.
- [ ] Generate all four current named-pin starters directly, preserve formations/bindings/request bounds, regenerate portable examples.
- [ ] Port native domain assertions that depended on early schemas/results; remove only retired-format acceptance tests. Own focused contract/package/ports/transaction/insertion tests; root ports runtime/host orchestration suites after freeze.
- [ ] Run focused meaningful Node tests/syntax, report exact changes and remaining integrations; freeze for ROOT review.
