# Task C: Current Lattice workspace completion

Date: 2026-10-09. Worktree: `C:/Users/Keptin/.codex/worktrees/lattice-native-finish/SillyCanvas`, based on checkpoint `768128b`. C-owned source, tests and styles are frozen for ROOT integration. This report records focused verification; it is not a release or a claim that the full application acceptance checks have finished.

## Scope and interfaces

The mixed UI controller is replaced with current schema-3/runtime-2 preparation, qualified editor sessions, captured commits and one unconditional Svelte workspace. Public `open`, `close`, `toggle`, `isOpen` and `refreshIfOpen` remain. Root execution, private candidate review and recording authority remain independent of camera, selection, presentation and qualified tab navigation.

C changed `src/ui/controller.js`, `workflow-surface.js`, `workspace-preparation.js`, `graph-view-session.js`, `view-state.js` and `node-palette.js`; `ui/Workbench`, `Toolbar`, `WorkspaceMenus`, `NodeShelf`, `WorkflowSetup`, `GraphTabs`, `OutputPreview` and `ImportReview`; UI entry/detail/view contracts and `style.css`. Existing current search/wire bridge/workbench adapters were retained and verified through their focused suites. C removed `src/ui/domain-surfaces.js`, `graph-analysis.js`, and the `DomainSurface`, `StatusBar`, `CanvasControls` and `WorkflowSurface` components. No compatibility renderer, early-result selector, migration reader or old mode remains in the UI surface.

The narrow final ownership exception exports the existing `reconcileOwners` function from `src/workflow/definition-library.js` without changing its algorithm. Root deletion reuses it and `prunePrivateSnapshots`; descendant ownership and unreachable private revisions are reconciled within the same captured transaction. Nested body edits use the existing immutable owned-revision path. Admission and ownership validation remain strict.

Clipboard uses the coordinated current APIs: `makeClip(root, {nodeIds, groupIds, viewPath})`, `makeDefinitionClip(definition, snapshots, selection)`, `readClip` and `prepareClipPaste`. The controller owns navigator I/O, a detached tab fallback and captured commits. A failed clipboard write cannot Cut; a continuation cannot retarget another view or a replaced root. Qualified Copy preserves effective inherited bindings, definition closure and portable aliases/compactness. Selected group IDs, optional geometry and local node presentation survive re-admission. Group Cut removes both ordinary nodes and its authored enclosure in one undoable edit.

## Retained behavior and review fixes

- Actual root selection and supported cable selection paint restore across child/root view roundtrips. Current saved camera/qualified presentation data retain their explicit view identity; old reader names and persistence fallbacks are removed.
- Ctrl/Cmd+G groups ordinary nodes with consistent `inGroup`/optional members, a visual frame and one history step. Shift+Ctrl/Cmd+G ungroups without deleting nodes or wires. Read-only and boundary-node guards apply. Folding and readonly group/node movement remain local presentation.
- Completed editable root drags commit authored coordinates and group frames once. Unfinished/cancelled gestures have no document commit, and stale pointer captures cannot edit a replacement root. Child/library/readonly movement remains an independent local overlay. Root position edits preserve semantic recording authority.
- New, Duplicate and current Import persist the opened root ID. Delete activates the same survivor selected by state. Captured async root actions reject stale destinations, including same-ID storage replacement before import commit.
- Actual managers, unsaved Details drafts, pending import reviews, qualified node/control/binding edits, library inspection and private Apply handle checks are preserved. The empty-shelf Subgraphs manager now opens without looking up an absent definition; its native keyboard click remains intact.
- Current portable flat alias/compact values normalize at preparation and panel projection. Saved presentation and local view overlays retain their precedence. Only typed strings/booleans become display values, so malformed object aliases/titles cannot execute coercion during projection. Shared domain admission is owned by ROOT.
- Visual groups with omitted `members` prepare from actual node `inGroup` membership in root, portable and child scopes. Notes receive detached prepared organization cards and no executable pins.

## Visual implementation

The binding proposal is unchanged: `C:/Users/Keptin/.codex/visualizations/2026/10/08/01a11972-1aa4-7150-95aa-65ce26252718/lattice-workspace.html`.

The shell uses white logo/wordmark, charcoal/quote-orange defaults, flat menus, joined graph tabs, recessed frames, floating family shelf/drawers, output preview, right Details, compact named-pin cards and process feedback. Retired CSS was removed. Own-theme rules target intended boxed controls so host styles cannot re-box flat menus or preview buttons. Side pin hit areas are positioned relative to label rows. Narrow Details is reachable through the workspace scroll container, and the compact preview preserves a useful artifact body with scrolling controls.

Fresh launch starts at zoom 1 with a readable card beside or below the shelf instead of automatically shrinking the graph with Fit. Initial placement uses measured shelf/card/meter bounds, keeping the first input clear of the bottom-left meter; responsive pan remains available. The vertical shelf reserves the meter strip and scrolls. Existing saved nondefault cameras remain unchanged. ROOT verified the intended selected-tab painted overlap and host-CSS geometry; C did not execute browser checks or change the approved join to satisfy a bounding-box-only assertion.

## Verification

The final C-focused sweep completed with exit 0: **30 test files, 218 Node subtests, plus the standalone controller-dispatch assertion script; no failures or skips**. Evidence is the ignored worktree log `.task-c-focused.log`.

The same focused selection can be reproduced from the exact worktree with:

```powershell
node tools/test-all.mjs ui- canvas-native-camera-focus workflow-ui workflow-projection workflow-session workflow-controller-dispatch workflow-surface-component
```

This covers the real compiled Setup/OutputPreview/Details/shelf/menu components; qualified sessions and saved view validation; current workflow projection/session; root/child/library preview authority; presentation/folding; current wire bridge/search; actual captured controller clipboard/group/position/root-activation/import operations; malformed projection; root/nested owned Delete/Cut and exact one-step undo; camera/editor focus and host menu/pin CSS rules.

New regressions were first observed failing for malformed presentation coercion, memberless groups, portable alias rendering, group Cut cleanup, empty manager lookup, owned root wrapper deletion, initial card/meter overlap and shelf strip clearance, then passed after their corresponding fixes. Existing failed/stale clipboard and private review authority assertions were retained.

Scoped `git diff --check` and Node syntax checks for the changed controller/preparation/projection/session/presentation modules completed with exit 0. A source search found no remaining retired schema/mode/readers/selectors/components in `src/ui`, `ui` or `style.css`.

C made no Git mutations, full builds, browser executions, provider calls or secret reads, and did not add agents. Generated temporary C rewrite/check scripts were removed; historical checkpoint scripts remain records.

## ROOT integration remaining

ROOT owns the 0.21 version/query bump, full Node/type/build/assets checks, installed-import checks, final independent review, production browser/capture/benchmark acceptance and normal release/push. The focused snapshot preceded that shared version bump. Browser confirmation fixtures should explicitly accept successful Delete/Cut dialogs while retaining failed/stale clipboard guards. Final fresh 320/360/736 checks must verify the actual starter input and shelf hit targets are clear of the run meter under public host CSS. Separate authorized spline/highlighting/authored-comment work is outside this cleanup slice and must follow the coordinated release/rebase sequence.

## Approved Ember follow-up — source frozen

The user approved **Ember** after the original C freeze. [The approval handoff](2026-10-09-ember-theme-approved.md), [exact tokens](2026-10-09-ember-theme-tokens.json), [workspace reference](../../images/themes/ember-workspace.png) and [enlarged node reference](../../images/themes/ember-nodes.png) now supersede the earlier palette only. The approved layout and geometry remain the native-only workspace described above. All source queries remain 0.21.0.

`PRESETS.ember` is the fresh default and a visible theme-editor choice; explicit saved presets remain selectable. Ember binds panel/menubar, main/quiet text, borders, accent, fields and raised controls to the host's SmartTheme variables through scoped Lattice tokens. It never changes those host variables. Preview, Details and manager controls consume the same tokens without boxing flat preview or menu buttons. Default canvas is #0f0f0f and node fill is rgba(40,40,40,.75); only the fill is translucent. Ordinary nodes have zero border, 6px corners and the approved 0/1/2/0 soft shadow. Selection/running/failure feedback retains its priority; disabled semantics remain visible.

Heading/alias and family icons mix their original semantic hue 68% with host body text 32%. Pin labels mix original quiet text 68% with body text 32%, and shelf words use their original #9b9ea1 source. Pin dots use 86% original semantic hue and 14% host body text. CSS recomputes from original sources on host theme changes without a DOM mutation loop or compounded mixing; existing wire hues remain unchanged. Explicit block-color, shape, depth and grid customizations remain meaningful, including theme export/import and switching back to Ember. The optional Lattice preset is described neutrally rather than claiming the superseded approval.

The bounded follow-up changed `src/theme.js`, `style.css`, the theme/theme-editor/style tests, a new `tests/ember-theme.test.mjs`, and fixed-palette expectations in `tests/browser/lattice-visual.spec.mjs`. No runtime, layout, Canvas, node DTO, authored workflow or provider behavior changed.

Final focused verification: **8 files passed, 38 Node subtests plus the standalone themes and theme-editor assertion scripts, exit 0, no failures or skips**. Files: `ember-theme`, `themes`, `theme-ui`, `ui-workspace-style`, `ui-detail-panels`, `ui-native-only-workspace`, `ui-native-wire-components`, and `ui-node-shelf`. Each was executed directly with `node --import ./tools/node-test-host.mjs tests/<name>.test.mjs`; the aggregate wrapper was unavailable in the sandbox because its nested `spawnSync` returned EPERM. The actual default/host binding, ordinary-card styling and remaining Details/manager fixed colors were first observed RED, then verified GREEN. Tests use the real theme/state modules, exact approved JSON and compiled component styles; existing session/readonly/preview authority assertions remain intact. Node syntax checks for theme and the owned visual spec, and scoped `git diff --check`, also exited 0.

Ember source/tests/style are frozen. ROOT and the tools worker own the repeat full checks, real browser host-variable/custom-theme matrix, approved workspace/enlarged captures, independent review and release acceptance. C has not executed browsers or a full build and makes no browser-fidelity claim from the focused Node checks.

### Final run-panel token closure

The final review identified ordinary fixed colors in `ui/RunDetails.svelte` and `ui/RunMeter.svelte`. Their normal main/quiet text, neutral raised surfaces and general borders now consume `--pc-text`, `--pc-muted`, `--pc-control` and `--pc-border`. Every existing semantic status, row and meter-pixel color, running glow, error signal, dimensions and interaction remains unchanged. The new real compiled-style regression first failed on the old fixed main text, then passed with inherited roles while verifying existing completed/failure colors and 4px pixels. Border tokens are inspected in the compiled CSSOM because JSDOM does not resolve custom-property border shorthand.

The reopened slice is frozen after **3 focused files / 20 subtests passed, exit 0, no failures or skips**: `ui-workspace-style`, `ui-detail-panels` and `ui-run-meter`. Scoped diff checks also pass. ROOT/tools retain actual alternate-host run Details/meter browser acceptance and the shared build; no runtime or controller code changed.

The shared alternate-host browser check then exposed a cascade conflict: the workspace's own-theme `summary` control rule overrode the run usage heading's quiet text. A narrow scoped `RunDetails` selector now gives that ordinary usage heading the intended `--pc-muted` color. The compiled-style fixture includes the real usage `<summary>` and reproduced RED (`--pc-text`) before passing GREEN (`--pc-muted`) against the actual workspace sheet. Only this selector and its focused guard changed; status colors and geometry did not. `ui-workspace-style` and `ui-detail-panels` passed again: **2 files / 18 subtests, exit 0, no failures or skips**. Source/tests/report are frozen pending ROOT's actual browser recheck.
