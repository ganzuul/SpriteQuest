# Lattice legacy removal audit

Audit date: 2026-10-10. Baseline: local working tree at `d807155`, including existing and concurrent workspace edits. Sections through “Audit verification and limits” record the original read-only audit; the approved implementation is recorded below. A concurrent terminology update renamed the Story Documents UI to Workflow Data; its internal modules still use the story-document names.

The remaining legacy system is the separate `native-pre` / `native-post` workflow model retained inside the current engine. Removing its menu labels alone would leave its saved assignments, host dispatch, settlement behavior, catalog and validation branches active. The original compiler and older engine formats have already been removed.

## Verified scope

| Current inventory | Verified count |
| --- | ---: |
| Unified example tiles / root packages | 31 / 31 |
| Bundled definitions in unified examples | 9; all `native-unified` |
| Legacy example tiles / root packages | 30 / 37 |
| Legacy example roots by mode | 20 Pre / 17 Post |
| Legacy starters | 11 of 12 |
| Registered operations, including shared operations | 75 |

All 68 catalog packages parsed and validated during the audit. Unified recipes have no dependency on the old lesson bodies or `lattice.library.*` definitions. Catalog absence alone does not prove that an operation is obsolete: users can author unified graphs with operations absent from these recipes.

## 1. Legacy workflow UI: retire

| Surface | Source locations | Required change |
| --- | --- | --- |
| New legacy pre/post workflow menu commands | `ui/WorkspaceMenus.svelte:21`; `src/ui/controller.js:504` | Remove both commands and their dispatch routes. New workflows use the unified starter. |
| Assign legacy pre/post phase | `ui/WorkspaceMenus.svelte:21`; `src/ui/controller.js:506`; `src/ui/provider-settings.js:4` | Keep one unified assignment backed by `workflowGraphId`. |
| Workflow type dropdown in the unsaved-New dialog | `ui/NewWorkflowPrompt.svelte:28`; `ui/types.ts:26`; `src/ui/controller.js:793` | Remove phase selection/payload; keep the save/discard/cancel dialog. |
| Full manual Run for separate root graphs | `ui/Toolbar.svelte:23`; `src/ui/workflow-surface.js:321`, `:335`; `src/workflow/host.js:753`, `:778` | Retire `runPre` / `runPost` dispatch and the root Run command. Unified generation uses Send; retain Stop and supported Run to here. |
| Root-phase filtering and legacy configured-node locks | `src/ui/native-search-catalog.js:99`, `:154`; `src/ui/workflow-surface.js:116`; `src/ui/configured-node-creation.js:29` | Simplify root-mode logic while retaining fixed operation stages and reusable helper stage contracts. |
| Pre-only automatic result admission | `src/ui/workflow-surface.js:305` | Use unified automatic results; retain recording and ownership checks. |
| Legacy empty-canvas/paste cases | `src/ui/controller.js:478`, `:649` | Use unified diagnostic graphs and remove the Pre-root paste special case. |
| Old launcher instructions | `index.js:31`; `src/run.js:61`; `ui/Workbench.svelte:140`; `manifest.json` description | Replace Setup/manual Post guidance with the unified Send and review flow. |
| Old operation icons/search descriptions | `src/ui/node-palette.js:37`; `src/ui/native-search-catalog.js:53` | Remove entries only when their corresponding operations are retired. |

Two integration leftovers need replacement, not simple deletion:

- `src/ui/controller.js:348` (`currentRootPreviewTerminal`) accepts only `native-post` + `apply-reply`. Apply/Reject routes through this guard, although `src/ui/workflow-surface.js:193` already projects unified `review-publish` handles. Static inspection indicates the guard blocks unified preview application. Replace it with unified terminal authority and verify Apply/Reject end to end. This audit did not reproduce the behavior in a live browser.
- `index.js:95` snapshots the active graph and Pre/Post assignments but omits `workflowGraphId`. When simplifying bindings, cover the assigned unified graph in cancellation/change detection, including when another graph is open.

Keep Preparation/Response node stage controls (`ui/NodeDetails.svelte:347`, `ui/ConfigureNode.svelte:17`), the canvas, subgraphs, portals, groups, profiles, Fast connections, Workflow Data, Recall and reviewed publication.

## 2. Saved roots and dual assignments: retire with data handling

`src/state.js:47`, `:60`, `:76`, `:94` retain Pre/Post admission, `preGraphId` / `postGraphId`, phase-specific creation and deletion cleanup. `src/run.js:51`, `:70` still resolve these assignments. `src/ui/provider-settings.js:4` maps all three binding fields.

Recommended final state: one supported root mode (`native-unified`) and one assigned root field (`workflowGraphId`). Remove creation arguments and root-mode routing for Pre/Post.

**Existing data is a concrete blocker.** `src/state.js:41` validates every saved graph at startup. Rejecting Pre/Post while leaving those graphs in the registry can prevent the entire extension from loading. The current product has no automatic converter; its documented policy is manual adaptation of a new copy (`README.md:96`; `docs/unified-workflows.md:230`). Before tightening admission, implement an explicit export/archive or conversion path that keeps recoverable originals outside the active graph registry. Do not silently drop saved graphs or assignments.

Reusable definitions need a separate decision. Pre/Post helper bodies currently work inside unified roots; ending legacy root support does not require immediately ending those stage contracts. All five built-in library bodies (`src/workflow/library/subgraphs.js:17`) and `workflows/subgraphs/literal-cleanup.json` use Pre/Post modes. Converting them changes semantic hashes and requires new revisions plus updated nested references (`src/workflow/definition-data.js:156`, `:187`, `:198`). Do not relabel pinned saved bodies in place.

Update the dummy Pre root used for shelf validation (`src/library.js:31`). The older inferred shelf-head fallback (`src/library.js:14`) can be retired only after materializing explicit `entries` in saved libraries.

## 3. Legacy execution and settlement: retire

| Compatibility path | Source locations | Unified behavior to retain |
| --- | --- | --- |
| Public `runPre` / `runPost` entry points | `src/workflow/host.js:753`, `:778`, `:934`; `src/ui/workflow-surface.js:335` | Owned Send continuation and `runTarget` for supported previews. |
| Automatic Send fallback to the assigned Pre graph | `src/workflow/host.js:763`; `src/run.js:51` | `beforeUnified` and the owned On Send / Generate Reply boundary. |
| Direct terminal Guidance publication | `src/workflow/host.js:422` | Guidance installation inside Generate Reply (`:690`), with budgets, freshness and prompt cleanup. |
| Immediate Memory Commit after successful legacy Run | `src/workflow/host.js:467` | Staged consequences settled through the reviewed authoritative unified result (`:446`). |
| Fixed legacy model preflight | `src/workflow/runtime.js:185`, `:215` | Activation-time binding, fixed profiles, freshness, request limits and completion evidence. |
| Legacy root mode/phase branches | `src/workflow/contracts.js:17`, `:34`; `src/workflow/graph-validation.js:53`, `:80`; `src/workflow/catalog.js:87`; `src/workflow/types.d.ts:7` | Preparation/Response dependency validation and one native generation boundary. |
| Legacy helper admission branches | `src/workflow/graph-validation.js:391`; `src/workflow/iteration-helpers.js:90`; `src/workflow/connection-edits.js:171` | Keep until the corresponding pinned definitions are migrated or their stage contract is deliberately retained. |

Removing these paths retires guidance-only automatic roots, retroactive manual Post runs, and Run-triggered memory persistence. Workflow adaptation must account for that behavior change.

## 4. Earlier operation pipeline: consolidate selectively

The old pipeline is registered at `src/workflow/catalog.js:33` and dispatched at `src/workflow/runtime.js:85`. Its age does not make all its engines disposable.

| Old operation / behavior | Retirement or replacement | Boundary |
| --- | --- | --- |
| Reply Snapshot as the new reply source | Generate Reply's owned Draft | Reading an already existing reply is a separate feature; preserve it through an explicit source adapter if desired. |
| Terminal Guidance | Feed Guidance into Generate Reply | In unified mode the same node is already a nonterminal budget check (`catalog.js:166`). Its host publication branch is obsolete; its budgeting function remains useful. |
| Review Gate → Apply Reply | Review / Publish with authenticated Draft lineage | Review Gate only sets `reviewRequired`; it is redundant as a separate approval step. Old Candidate inputs need migration to Drafts before replacing Apply Reply. |
| Repair → Validate Patches | Revise Draft, or a Draft-preserving deterministic transform | Old repair uses indexed patches, editable ranges and protected literals. A whole-prose revision is not an exact replacement. |
| Pattern Scan / policy-based cleanup | Preserve findings and scoped edits in the replacement flow | Removing these also removes real inspection/cleanup features. |
| Text Rules in Draft mode | Make deterministic edits produce a checked Draft revision | Text→Text mode is shared and remains useful. Draft mode currently produces Patches (`operations/nodes.js:106`, `:174`). |
| Transpose's omitted `inputKind` / Draft→Patches default | Materialize saved input kinds, then standardize explicit Text or Draft revisions | Saved pins and behavior depend on this default (`operations/transpose-nodes.js:16`, `:65`). Keep Text Transpose. |
| Smart Compactor / Response Plan nodes | Optional consolidation into reusable recipes around current model/context operations | `compactor.js` remains used by Introspection Context Focus (`introspection/context-state.js:3`, `:56`). Deleting a node does not justify deleting that engine. |
| Old Introspection starter recipes | Unified actor/memory/state workflows | Keep scoped Introspection engines, analysis, memory and native adapters. Legacy Curve message-step semantics need separate migration if replaced by elapsed story time. |

`repair.js`, `reference-draft.js`, Transpose and Revise Draft share validation/alignment helpers. Do not delete them wholesale while their active callers remain.

The single-artifact result ABI is also still active: `runtime.js:354` and `iteration-helpers.js:159` map `result.artifact` to `out`. Current unified model, event, decision, primitive, random and Introspection operations use it; Review / Publish still uses it for terminal results. Removing this convention requires migrating every producer and preserving the terminal-result contract. It is an optional API refactor, not dead legacy code.

## 5. Legacy starters, catalogs and second executor: delete as groups

| Group | Deletion scope | Dependency handling |
| --- | --- | --- |
| Eleven legacy starters | `src/workflow/starters.js:6` through the legacy catalog/dispatch; `src/workflow/introspection/starters.js` | Keep `unified-basic` and starter installation APIs; replace generic tests that use old starters as fixtures. |
| Thirty old roleplay lessons | `src/workflow/example-data.js`; all 37 JSON files in `examples/roleplay/`; `tools/build-roleplay-examples.mjs`; `docs/research/2026-10-09-lattice-example-catalog.json` | Remove old catalog import/merge at `src/workflow/examples.js:2`, `:7`. Keep independent-copy/admission APIs. Unified recipes need no repinning. |
| Standalone Pre/Post root packages | All four `workflows/*.json`; four `examples/library/workflows/*.json`; three `examples/introspection/native/*.json` | Remove their root factories, especially `createLibraryWorkflow` (`library/subgraphs.js:108`). Treat reusable subgraph bodies separately. |
| Built-in old library recipes | Five `examples/library/subgraphs/*.json` plus `workflows/subgraphs/literal-cleanup.json`; corresponding factories | Remove if no longer offered, or publish new unified revisions. Saved user definitions remain a separate data concern. |
| Experimental standalone Introspection executor | `src/workflow/introspection/library.js`, `library.d.ts`; three direct `examples/introspection/*.json` manifests | Separate `lattice-introspection-example` v1 sequential executor with direct memory settlement; no product callers. Remove `tests/introspection-acceptance.test.mjs` and its consumer-fixture import, or port their meaningful coverage. Keep current Introspection runtime modules. |

The legacy starter IDs are `native-guidance`, `reviewed-de-slop`, `literal-cleanup`, `structured-guidance`, `scene-compass`, `library-literal-cleanup`, `formatting-cleanup`, `prose-cleanup`, `reflect-and-express`, `internalize-and-commit` and `consequence-clock`.

## 6. Unused UI code and old secondary surfaces: delete

Repository searches found no callers for:

- `escapeHtml` — `src/ui/controller.js:90` (currently a public export; remove deliberately from the repository API).
- `commitNativeNode` — `src/ui/controller.js:1481`.
- Local `requestBound` — `src/ui/workflow-surface.js:18`.
- `.pc-settings-sub` — `style.css:199`.
- `.pc-workflow-starter` rules — `style.css:535`.

The following secondary paths have tests but no installed product callers; remove their obsolete tests or retarget coverage along with the code:

- `addSubgraphBoundary` (`src/ui/controller.js:1283`); production insertion uses configured native creation.
- `parseWorkflowRules` (`src/ui/workflow-surface.js:22`); used only by `tests/workflow-ui.test.mjs`.
- NodeShelf's `view.families` / `add` fallback (`ui/NodeShelf.svelte:88`, `:129`); installed controller supplies `nativeChoices`.
- Old workflow-node `controls` presentation (`src/ui/workflow-surface.js:96`, `:183`); current Details projects controls independently (`src/ui/workspace-preparation.js:122`). Retire its parser/formatter/type support together.

## 7. Tests, tools, docs and distribution: update alongside removal

| Area | Work required |
| --- | --- |
| Legacy catalog suites | Delete or replace `workflow-examples`, `workflow-example-authoring-review`, `workflow-example-prose`, `workflow-example-memory`, `workflow-example-reuse` and the old catalog helper. Port consumed-memory freshness coverage that imports that helper. |
| Combined examples picker | Update `tests/browser/examples.spec.mjs`, `tests/ui-example-catalog.test.mjs` and count/name expectations from the 61-tile mixed catalog. |
| Runtime/authoring fixtures | Port still-valuable host, session, validation, canvas, binding, reference and settlement tests to unified fixtures. Do not delete a suite because its filename predates unification. |
| Old provider lesson harness | Retire `tools/roleplay-soak-cases.mjs`, `tools/soak-roleplay-examples.mjs` and related tests/reports. Retire or replace Pre/Post fixtures and historical allowances in `tools/live-workflow-test.mjs`. |
| Captures and benchmark fixtures | Rewrite `tools/capture-documentation.mjs`, `tools/capture-lattice-workspace.mjs`, `tools/benchmark-canvas.mjs` and `tests/browser/native-fixture.mjs`. Captures still expect old starters/menu names. Keep general browser, installation, asset and performance checks. |
| Current operator documentation | Rewrite legacy passages/tables in `README.md`, `docs/README.md`, `docs/lattice-workspace.md`, `docs/native-workflows.md`, `docs/operators-manual.md`, `docs/node-reference.md`, `docs/introspection-package.md`, `docs/lattice-reference-library.md`, `docs/unified-workflows.md` and `docs/development.md`. Keep sections describing retained node capabilities. |
| Screenshots | Replace legacy walkthrough images in `docs/images/`; update references. `tools/check-documentation.mjs` checks required guides, links and root PNG references. |
| Historical records | Older research, plans, specs, handoffs, reviews, benchmark and soak evidence can be archived/deleted as a separate repository cleanup. `docs/svelte-ui-migration.md` explicitly describes a retired architecture. These records do not run in the installed product. Retain active unified requirements/evidence or update their compatibility claims. |
| Shipped UI | Rebuild `dist/lattice-ui.js` / `dist/lattice.css` after source removal. Keep active assets, build configuration, Svelte runtime notices and installation checks. |

Ignored `.tmp`, benchmark, test-result and Playwright outputs are development artifacts rather than shipped legacy systems.

## 8. Already retired, or shared infrastructure to retain

Already absent and protected by installation tests: original compiler, Jev/Thoughts/State/lore readers, expression/selection/clip/model-combo modules, migration/legacy-insertion modules, domain surfaces, graph-analysis compatibility UI and old host hooks. Graph schemas 1/2 with runtime 1 and Prompt Canvas/SillyCanvas/ComfyTavern packages are already rejected.

These low version numbers are **current contracts**: graph schema 3/runtime 2; workflow envelope schema 2; subgraph envelope schema 1; settings schema 1. Their namespaces have independent versions (`src/workflow/packages.js:124`, `:189`; `src/state.js:38`). Do not remove them based on the number.

Keep rejected-format/retired-module guards, current model/provider adapters, credential separation, typed pins, branch admission, source freshness, actor/privacy authority, bounded execution, Draft lineage, original-swipe preservation, persistence receipts and accepted settlement.

`tests/workflow-legacy-definition-identity.test.mjs` and `tests/fixtures/workflow-legacy-029a930.json` protect actual saved pin compatibility. They remain relevant until that saved-data compatibility is deliberately ended.

## Suggested removal order

1. Correct unified Preview authority and assignment-change cancellation; establish reviewed saved-data handling.
2. Delete unused UI helpers and the standalone Introspection executor with their secondary fixtures.
3. Stop offering legacy creation, assignment, starters and lessons; update guides and capture fixtures.
4. Migrate/archive saved roots. Retain stage-pinned helpers initially or publish new revisions with updated references.
5. Remove legacy host routes, Send fallback, direct Guidance publication, immediate Memory settlement and model preflight; tighten root admission and settings fields together.
6. Consolidate the Candidate/Patches pipeline only after preserving desired deterministic repair/reference behavior and saved defaults.
7. Rebuild distribution and run unit, type, browser, installation and documentation gates. Treat result-ABI unification and historical-record deletion as optional separate work.

## Audit verification and limits

- Read-only parallel inspection covered UI/editor, runtime/host/contracts, storage/packages/examples and associated tooling/docs.
- Fresh catalog check: 61 tiles, 68/68 packages parsed and validated; 31 unified roots, nine unified-only helper definitions; 11 legacy starters.
- Fresh `node --import ./tools/node-test-host.mjs tests/lattice-installed-imports.test.mjs`: 2/2 checks passed, confirming retired module absence and resolvable current installed imports.
- No paid providers, live chat writes, saved-settings changes, deletions, builds or full regression run were performed. The identified Preview issue is based on code inspection.
- Application sources and existing/concurrent workspace edits were left untouched by this audit. Only this audit document was added.

## Approved implementation — 2026-10-10

The user approved removal after the audit. The implementation uses unified roots exclusively for creation, imports, Send assignments and execution.

- Removed Pre/Post creation and assignment menus, full-root Run, public `runPre`/`runPost`, fallback Pre execution, direct Guidance publication, immediate legacy Memory settlement and eager model preflight. Run to here, Stop and node Stage controls remain.
- Removed all 11 legacy starters, 30 legacy example tiles and their 37 root packages, old library root wrappers, the standalone Introspection manifest executor and its catalog, plus legacy example generators and provider soak/live drivers.
- Saved schema-3/runtime-2 Pre/Post roots move unchanged into `archivedWorkflows`. They cannot execute or import as active roots. A conditional File command downloads portable recovery JSON; local profile/Fast/fallback selectors are cleared from roots, nested pins and exposed overrides. Migration is atomic, idempotent and preserves an existing unified Send assignment.
- Corrected unified Preview Apply/Reject authority and cancellation when the assigned workflow changes while another graph is open. Current documentation, screenshots, captures and installation checks now describe the unified product.
- Preserved all five reusable stage helpers, exact saved pin identity, shared deterministic patch/reference/compactor engines, stage-aware clipboard editing/unpacking, target previews, privacy/freshness guards and reviewed publication/persistence. Original archived local data retains its authored controls and hashes.

Implementation and regression evidence is tracked in [the removal plan](superpowers/plans/2026-10-10-legacy-removal.md). Historical documents and the shared Candidate/Patches result ABI remain outside this removal.

Verified implementation gates: 236/236 unit test files; type check with zero errors/warnings; rebuilt distribution; 489 installed local imports; installation smoke with fresh unified settings and zero provider requests; documentation check covering 10 guides, 211 links, 75 operations and 20 screenshots. Updated captures passed 19 documentation screenshots, 15 workspace cases and three Ember images. Independent review found one portable Fast Decision selector issue, fixed with nested-pin/override coverage and re-reviewed successfully.

Browser verification covered all 269 unique cases: 147 unaffected cases from the broad run plus 122 passing cases in current affected-suite reruns. The first broad run captured 25 obsolete fixture failures; all were corrected and verified, including example import retry, stage editing, theme/pin behavior, target previews and workspace controls. No production regression remains from those failures.

The reviewed task delta was copied into the primary workspace with baseline-aware conflict checks and matching checksums for 253 task files, including 72 deletions. Concurrent Workflow Data/launcher work and unrelated documents were preserved. Primary installation, assets and documentation checks passed after delivery. Changes remain local and uncommitted.
