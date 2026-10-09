# Lattice A/B scoped fixes — frozen 2026-10-09

Status: scoped fixes complete and frozen for ROOT integration and fresh independent combined review. Work stayed in `C:/Users/Keptin/.codex/worktrees/lattice-native-finish/SillyCanvas`. No Git operations, worker subagents, full production builds, browser sessions, provider requests or secrets. Existing workers' edits were preserved. Query versions remain `0.20.0` for ROOT's eventual coordinated bump.

## Reviewed findings resolved

1. `host.js`: target documents are admitted before `start()` replaces run authority or consults host context. Malformed data settles through the bounded runtime Result path; the throwing `mode` getter runs zero times, with zero context/source/binding/tokenizer/request effects. Valid targets derive phase from the admitted detached document. Apply returns only the unconditional current addressed result plus local application/persistence metadata; the unreachable raw artifact/reports/calls/trace branch is removed.
2. `clipboard.js`: `makeClip(currentRoot,{nodeIds?,groupIds?,viewPath?})` selects a checked effective root or qualified scope. Selected primitive values retain effective controls/bindings. Selected wrappers capture effective primitive bindings, including nested inherited role values, explicit node overrides and null barriers. Exact definition closure remains portable, detached and profile-free. Ancestor parameter values absent from a selected child interface are materialized into fresh exact pinned copies only when needed, using the shared pure `materializeInstanceControls` helper also used by Unpack. Allocations reserve source and snapshot identities.
3. Original root admission validates private ownership, then detached fragments discard `localDefinitionOwners` and wrapper `localCopy` authority before export. Ordinary selection, private wrappers and nested selections work without mutation or unrelated ownership leakage.
4. Removed active group component identity/entry/exit/enabled contracts and wire append/prepend/merge/order contracts from validation/export/generation/remapping/types/composition. Named endpoints, artifact pin kinds and Context Join's declared ordered slots remain. Visual groups retain `members`, `inGroup`, collapsed formations and frames. Declared members must agree with actual `inGroup` membership; the old composition-insertion fixture was corrected to use a real Canvas membership. Unpack now assigns only ungrouped children to the outer visual group's member list, preserving inner group membership and ignoring retired group enable annotations.
5. `GroupCard.svelte` helpers use the exact `'open'|'collapse'` action union.
6. Restored existing folded-group body dragging: hidden members, group anchors and saved frames move together; dragging a selected folded unit or a visible node carries the full selected set and selected folded anchors; Shift preserves the selection; stationary clicks narrow to the group. Cancellation restores positions, absent anchors, selection and cable state. Movement stays in detached presentation and emits `onPresentationChange(nodeIds,groupIds)`; read-only semantic controls remain guarded. Cache retention preserves current hidden member geometry across fold/unfold while deleted graph IDs are pruned. No new geometry/comment features were implemented.

## Current clipboard interfaces agreed with C

- `makeClip(currentRoot,{nodeIds?,groupIds?,viewPath?}) -> Result<current lattice-workflow envelope>`.
- `makeDefinitionClip(currentDefinition,currentSnapshots,{nodeIds?,groupIds?,viewPath?}) -> Result<current lattice-workflow envelope>`. It admits an actual definition and checked exact closure through `inspectDefinitionGraph`; it does not invent a workflow wrapper or accept a raw body.
- Direct or group-selected interface boundary nodes return `BOUNDARY_SELECTION` with an explicit diagnostic explaining that their ownership belongs to the definition. Ordinary interior-node selection works. Copy the whole subgraph instance to preserve its interface.
- `readClip(textOrEnvelope)` and `prepareClipPaste(destination,envelope,options)` remain current-envelope Result APIs. Paste prepares the existing detached additive insertion with captured signatures, placement and fresh identities; C owns one-step captured commit and host clipboard I/O.
- C now passes the actual root plus qualified path, or the actual Library definition/snapshot table. It overlays selected positions, portable alias/compact fields and group positions/frames before `readClip` re-admission. C extended current local view state/preparation for `groupPresentation` positions and preserved overlays on fold toggles.

## RED evidence

- Added host target getter regression: Promise rejected with `getter ran` at `host.js:255` before fixes.
- Clipboard regression command initially had four failures: inherited second-wrapper model was `null` instead of `root-model`; ordinary private-document selection failed `Each owned ID must have one exact live instance path`; qualified child selection failed `Select current workflow nodes to copy`; `makeDefinitionClip` was missing.
- Current authoring regressions initially failed because retired group metadata was validated and starter wires still had kind/order.
- Retained generic `groups.test.mjs` failed hidden-member x=50 instead of90; `selection-gestures.test.mjs` failed outside selection x=650 instead of690. Their assertions were preserved.
- Added current nested visual Unpack regression failed `INVALID_GROUP` before the outer member-list correction, then passed.

## Fresh verification

All following commands exited0 after the final source changes:

```text
node --test --test-isolation=none --test-reporter=spec tests/workflow-current-admission.test.mjs tests/workflow-contracts.test.mjs tests/workflow-packages.test.mjs tests/workflow-clipboard.test.mjs tests/workflow-authoring-current.test.mjs tests/workflow-insertion.test.mjs tests/workflow-transactions.test.mjs tests/workflow-qualified-transactions.test.mjs tests/workflow-definitions.test.mjs tests/workflow-ports.test.mjs tests/workflow-composition.test.mjs tests/workflow-composition-insertion.test.mjs tests/workflow-instance-edits.test.mjs tests/workflow-qualified-manager-edits.test.mjs tests/workflow-composition-edits.test.mjs tests/workflow-workspace-starters.test.mjs tests/workflow-host-addressed.test.mjs tests/workflow-runtime-addressed.test.mjs
```

**108 passed, 0 failed** across18 focused domain files. Includes strict current admission, getter safety, private ownership, controls/bindings/null precedence, exact pins/closure, additive placement/freshness, qualified edit authority, atomic one-step history, cancellation, bounded addressed runtime/host, Apply source/binding freshness and rollback. All four workflow JSON files were regenerated from `exportWorkflow(starterGraph(id))`; starter tests compare exact portable envelopes and preserve independent/unarmed installation. The standalone subgraph example remains checked by the retained starter suite.

```text
node --import ./tools/node-test-host.mjs --test --test-isolation=none --test-reporter=spec tests/canvas-group-presentation.test.mjs tests/canvas-prepared-only.test.mjs tests/canvas-native-integration.test.mjs tests/canvas-lifecycle.test.mjs
```

**33 passed, 0 failed**. The focused fixture compiles only the four real Canvas components; this is not a full production build. Covers prepared-only named pins and terminal affordances, body/native wire gestures, read-only presentation, folded anchors/frames, cancellation, pointer loss, camera reconciliation, cable selection and lifecycle destruction. Direct `node --import ./tools/node-test-host.mjs tests/groups.test.mjs` and `... tests/selection-gestures.test.mjs` both printed their `ok` assertions and exited0.

Individual `node --check` calls exited0 for all9 changed JS production files: `src/canvas.js`, and workflow `host`, `clipboard`, `graph-validation`, `packages`, `insertion`, `starters`, `composition`, `composition-transform`. Scoped search found no remaining `group.component/entry/exit/enabled`, `wire.order/kind`, old group-component diagnostic or wire append/prepend/merge routing branches in the owned production modules; incidental variable `merged` is ordinary definition-table merging.

## Scope and integrations

Owned production edits: `src/canvas.js`; workflow `host.js`, `clipboard.js`, `graph-validation.js`, `packages.js`, `insertion.js`, `starters.js`, `types.d.ts`, `composition.js`, `composition-transform.js`; `ui/GroupCard.svelte`.

Owned test/example edits: new `tests/workflow-authoring-current.test.mjs`, `tests/canvas-group-presentation.test.mjs`; expanded clipboard/host-addressed regressions; current fixture/assertion ports in contracts/insertion/composition-insertion/qualified-manager tests; all4 current `workflows/*.json` starter files. No generic tools/group/history/selection tests were edited by this worker.

ROOT owns final version/type/build/full-test/browser/import-audit/release/integration and retired-file deletion. C owns controller/current UI preparation/view-state/type/style integration. This freeze is focused verification, not release approval; full production checks and independent combined review remain ROOT's work.
