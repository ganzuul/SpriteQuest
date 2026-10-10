# Lattice menu and workspace design audit

Audit date: 2026-10-10.

This audit translates the full Gaea 2 top-bar capture into a practical direction for Lattice rather than copying Gaea's information architecture or visual density.
The goal is faster discovery, clearer state, and less repeated chrome while preserving Lattice's workflow model.

## Approved implementation

The user selected and approved **Consolidated Menus** on 2026-10-10: **File, Edit, View, Graph, Workflow, Help**. The [approved specification](superpowers/specs/2026-10-10-consolidated-menus.md) supersedes the initial recommendation below. The implementation lives in the managed `codex/consolidated-menus` worktree.

The implementation preserves the actual Lattice logo, spaces out the menu roots and rows, and adds shared icons, separators, check/radio state and a Configure submenu. Click enables hover switching; choosing an action or dismissing the menu resets it. Open popups isolate graph shortcuts, while closed menus permit normal clipboard and history accelerators. Keyboard focus and popup scrolling remain usable at narrow widths.

Practical additions include persistent shelf visibility, panel layout reset, clear workflow assignment, owned-run Stop, a real validation report and Help views. Preview diagnostics retain the selected source and target and cannot replace a busy host run. Unified generation remains tied to ordinary SillyTavern Send.

Examples now has one menu home under File. Details no longer repeats Duplicate/Delete or a permanent Portals button, and preview tracking uses one pin control. Undo/Redo, Details, Arm/Stop, contextual actions, the run meter and result-specific Apply/Reject remain intentional quick controls. The remaining sections record the original audit and deferred feature scope.

## Initial recommendation

Keep the existing eight top-level menus for the first pass: **File, Edit, Graph, Node, Preview, Workflows, Tools, Help**.
Changing labels, command ownership, rendering, keyboard behavior, and menu count at once would make regressions and feedback harder to interpret.

An acceptable later alternative is six menus: **File, Edit, View, Graph, Workflow, Help**.
It folds Node into Graph, Preview into View, and managers into Workflow; adopt it only if usage evidence shows eight menus remain too fragmented.

This work must follow the unified-workflow direction in the [legacy removal audit](<F:/git/SillyCanvas/docs/legacy-removal-audit.md:1>) and must not improve or further expose legacy Pre/Post paths.
Legacy removal remains a separate migration project and does not require a backend rewrite for the menu pass.

## Current state

The current menu bar declares eight names and constructs every popup from one flat item array.
Its descriptor has no icon, separator, check/radio state, submenu, semantic tone, or typeahead; see [WorkspaceMenus.svelte](<F:/git/SillyCanvas/ui/WorkspaceMenus.svelte:11>) and its [flat item type](<F:/git/SillyCanvas/ui/WorkspaceMenus.svelte:12>).

The contents mix document commands, view state, workflow lifecycle, and legacy execution; Graph owns workflow duplicate/rename/delete while Workflows repeats Examples and exposes legacy creation and root Run.
See the current [Graph menu](<F:/git/SillyCanvas/ui/WorkspaceMenus.svelte:18>) and [Workflows menu](<F:/git/SillyCanvas/ui/WorkspaceMenus.svelte:21>).

The popup CSS is a two-column flex row with label and shortcut, without a stable icon/check rail or separator styling; see [workspace popup styling](<F:/git/SillyCanvas/style.css:407>).

Lattice already has a richer context-menu implementation with a private icon registry, stable gutter, shortcuts, checks, separators, nested children, tones, viewport fitting, and pointer-opened submenus.
See [the icon registry](<F:/git/SillyCanvas/src/ui/context-menu.js:4>), [descriptor rendering](<F:/git/SillyCanvas/src/ui/context-menu.js:134>), and [context-menu layout](<F:/git/SillyCanvas/style.css:519>).

The top bar should share command descriptors and icon mappings with contextual menus without directly reusing their imperative renderer.
It has different ownership, anchoring, hover switching, and menubar keyboard rules.

## Critical defect to fix first

Menu keyboard events currently bubble into graph shortcuts: a local harness selected a `.pc-node`, opened Edit, focused a `role="menuitem"`, and pressed Delete.
The graph node count changed from 3 to 2; see [keyboard-isolation.json](<F:/git/SillyCanvas/.tmp/menu-design-audit/keyboard-isolation.json:1>).

This blocks adding shortcuts or richer menus: handled events must prevent browser defaults where appropriate and stop propagation before graph handlers see them.
Cover activation, navigation, Escape, Home, End, arrows, printable typeahead, and Space; Tab closes the menu and continues normal focus movement.

The behavior should follow the WAI-ARIA [Menu and Menubar Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/).
Use a real menubar/menu focus model, restore focus on Escape, make disabled commands discoverable with activation blocked, and expose check and radio state semantically.
Separators and section labels must never receive focus.

## Presentation specification

Use aligned columns: a 16 px icon/check rail, a flexible label, a trailing shortcut, and a reserved submenu caret.
Keep the empty rail for alignment and place separators between task groups rather than after a fixed item count.

Target 32–36 px rows for precise pointers and at least 44 px under coarse-pointer media queries.
Use normal, muted, and danger colors semantically; checks mark independent toggles and radios mark exclusive modes such as Select/Pan.

Constrain and scroll popups within the viewport, flipping submenus left when the right edge would clip.
While open, hovering another top-level label switches menus; support typeahead without hijacking graph keys.

Refinement agreed on 2026-10-10: preserve the actual `assets/lattice-logo.svg` brand mark and give top-level labels more horizontal room, following the supplied Gaea bar reference.
Hover switching starts after a top-level menu is clicked. It remains active across menu labels and submenus until a command, toggle, or radio choice is selected, the user clicks outside, or Escape dismisses the menu. Hover alone must not start another session.

Display platform-correct shortcut labels: Ctrl on Windows/Linux and Command on macOS.
Do not register browser- or operating-system-reserved shortcuts merely because a label appears in a menu.
Central command descriptors should own label, icon, shortcut, enabled state, checked/radio state, tone, and action binding.

Enabled state must be capability-based.
It must account for read-only views, the exact selection kind, root versus child view, active requests, and supported node operations.
A raw `selectionCount` is insufficient for commands such as group, subgraph, comment, and run-to-output.

Async commands must capture the graph/view identity and revalidate it before mutation.
No delayed menu action may mutate whichever graph happens to be active when a promise settles.

## Proposed primary menu tree

The following is the first-pass target.
“Current” means the behavior already exists somewhere in the product.
“Proposal” means exposure, relocation, wording, or presentation work.
“New” means product behavior that does not currently exist and needs separate design and implementation.

### File

- **New workflow** / **Open workflow…** / **Open examples…** — Current; Proposal: one canonical Examples entry here.
- Separator.
- **Save to workspace** — Current behavior, renamed to describe local persistence and autosave expectations.
- **Duplicate workflow** / **Rename workflow…** — Current; Proposal: move from Graph.
- Separator.
- **Import into current graph…** — Current; clarify that it reviews and inserts a compatible fragment.
- **Export portable workflow…** — Current; clarify that connection-local information is excluded.
- Separator.
- **Delete workflow…** / **Close workspace** — Current; Proposal: move delete from Graph and use danger tone.

“Save to workspace” is not a file Save As operation.
The workspace persists local editable state; Export creates a portable sharing copy.
“Duplicate workflow” is the closest browser-style Save As equivalent and should be described that way in help text.

### Edit

- **Undo** / **Redo** — Current, with action-aware labels when history metadata is available.
- Separator.
- **Cut** / **Copy** / **Paste** / **Duplicate selection** / **Delete selection** — Current capabilities; Proposal: make this the canonical top-menu home.
- Separator.
- **Select all** / **Clear selection** — Current canvas capabilities that need top-menu exposure.

Delete and Duplicate may remain in node/context menus because contextual repetition is useful.
They should not also live in the Node top menu or Details overflow after Edit provides reliable coverage.

### Graph

- **Select tool** / **Pan tool** — Current; Proposal: radio items with current mode reflected.
- Separator.
- **Zoom in** / **Zoom out** / **Fit graph** / **Fit selection** / **Center selection** — Current capabilities to expose consistently.
- **Actual size** — New; useful only if one scale can be defined predictably across displays.
- Separator.
- **Add comment** / **Comment around selection** — Current comment behavior to expose.
- Separator.
- **Manage portals…** — Current manager; Proposal: canonical global access here.
- **Workspace › Details pane** — Current visibility state; Proposal: checked submenu item.
- **Workspace › Node shelf** — New visibility toggle.
- **Workspace › Reset layout** — New; reset pane geometry and visibility without changing graph content.

Graph-scoped commands always target the active graph view, including a child/subgraph tab.
They must not silently redirect to the saved root.

### Node

- **Add node…** / **Details for selection** / **Rename** — Current capabilities; Proposal: expose Rename with F2 where the platform permits.
- Separator.
- **Group** / **Ungroup** / **Create subgraph** / **Add to saved subgraphs…** — Current contextual features to expose when selection capabilities permit.
- Separator.
- **Compact card** — Current per-node presentation; Proposal: checked state for compatible selected nodes.

Do not repeat Duplicate or Delete here.
Keep those commands in Edit and in direct node context menus.
After menu coverage is proven, remove the Duplicate/Delete overflow from [NodeDetails](<F:/git/SillyCanvas/ui/NodeDetails.svelte:342>).

### Preview

- **Show preview** — Current visibility state; Proposal: checkbox.
- Separator.
- **Follow selection** / **Pin current output** — Current; Proposal: checked states and shorter wording.
- Separator.
- **Run to current output** — Current diagnostic execution; enabled only when request bounds and target support allow it.
- Separator.
- **Copy artifact** — New explicit clipboard action; users currently select and copy displayed text manually.
- **Export artifact…** — New.
- **Compare with baseline…** — New, later phase.
- Separator.
- **Run details…** — Current overlay and node-jump behavior.

Pin chooses the preview target; it does not create a cached comparison baseline.
Baseline comparison therefore needs its own data model and wording.
Apply and Reject remain visible, result-specific controls in the preview panel.
They must never become generic menu commands detached from fresh review authority.
See the current [Apply/Reject controls](<F:/git/SillyCanvas/ui/OutputPreview.svelte:92>).

### Workflows

- **Assign current root** / **Clear assignment** — Current assignment plus New explicit clearing.
- **Arm on Send** — Current Arm behavior; Proposal: checkbox with assignment/request-bound state.
- Separator.
- **Validate workflow…** — New UI over existing validation, producing an actionable issue list.
- **Review host result** — Proposal: generalize the current per-terminal Host result focus action into a root-result navigation command.
- **Stop workflow** — Current; visible and enabled only while busy.
- Separator.
- **Workflow statistics…** — New, later phase.

Do not expose a generic unified **Run workflow** command.
The current session explicitly returns `NATIVE_SEND_REQUIRED` for unified root runs; generation begins with ordinary SillyTavern Send.
See [workflow-surface.js](<F:/git/SillyCanvas/src/ui/workflow-surface.js:320>).
Keep visible Arm, assignment/request-bound feedback, and Stop while busy.
Stop already calls runtime cancellation, but the unified menu must observe native Send activity as well as manual preview activity before claiming the correct busy state.
Retire the current idle root Run presentation in [Toolbar.svelte](<F:/git/SillyCanvas/ui/Toolbar.svelte:23>) as unified UI replaces legacy paths.

### Tools

- **Workflow Data…** / **Fast connections…** / **Recall arms…** — Current managers.
- Separator.
- **Theme and colours** — Current.
- **Preferences…** — New eventual home for stable application-level choices.

Move Portals out of the Details header and into Graph after manager access is dependable.
Retain contextual portal pin actions because they act on a specific pin and are faster in place.
Move Details visibility from Tools into Graph › Workspace.

### Help

- **Workspace guide** — Current content; Proposal: update for unified workflows and the new menu structure.
- **Node reference** / **Keyboard shortcuts** / **About Lattice** — Existing documentation concepts needing new presentation and links/version UI.

## Intentional redundancy and cleanup

| Surface | Decision | Reason |
| --- | --- | --- |
| Saved root selector and child graph tabs | Keep both | They choose different scopes: saved document versus view within it. |
| Arm, Stop, compact run meter | Keep visible | They communicate host authority and live execution state. |
| Apply/Reject in Preview | Keep visible | They are bound to a fresh reviewed result, not a general command. |
| Context menus | Keep | They provide fast, target-specific actions. |
| Click and drag from node shelf | Keep | Direct creation is core canvas interaction. |
| Examples under File and Workflows | Remove Workflows duplicate | One canonical location is sufficient. |
| Details Duplicate/Delete overflow | Remove after coverage | Edit and context menus provide clearer ownership. |
| Permanent Portals button in Details header | Remove after coverage | Graph becomes the canonical manager entry. |
| Preview heading plus type label | Collapse in simple single-artifact mode | Preserve tabs and labels when multiple artifacts require disambiguation. |
| Follow and Pin controls | Simplify | Prefer follow by default plus a Pin toggle; retain manual non-follow only if a real use case remains. |
| “Collapse preview” text button | Replace with local chevron | Keep the menu command for discovery and reopening. |
| Toolbar Undo/Redo | Optional compact-preset removal | Keep for novices until menu history has clear labels and action feedback. |
| Details toolbar toggle | Optional compact-preset removal | Only after the checked menu command can always reopen the pane. |
| Top-right Close affordance | Keep | A familiar small exit control has high utility and low visual cost. |

Do not claim cleanup of controls that do not exist.
The current workspace has no minimap, generic canvas toolbar, status bar, or persistent gesture hint to remove.

## Practical new features

Priority 1 is exposure of existing capability: Select all, center selection, grouping, comments, subgraphs, portals, run details, and preview pinning.
This phase should deliver most of the discoverability benefit without changing core graph semantics.

Priority 2 adds bounded functionality: Find node, select upstream/downstream, validation issue navigation, Reset layout, and a portable subgraph manager.
Find node is distinct from the existing add-node search and must navigate existing graph contents.
Upstream/downstream selection needs explicit traversal rules for typed edges, portals, groups, and nested subgraphs before implementation.

Priority 3 may add a command palette, bounded read-only run history, and artifact baseline comparison.
The command palette should reuse descriptors but remain distinct from node creation search.
Run history must never grant Apply authority; it can reopen evidence and navigation only.

Defer incremental Save, Open Recent, unsafe-type bypasses, plugins, build/cache controls, screenshots, and terrain-style features.
Local saved-root selection and autosave already address most recent/open/save needs.
The other ideas add policy or platform surface area without solving the current discovery problem.

## Rollout

1. **Presentation and safety:** fix keyboard isolation; add shared descriptors, icon mapping, separators, checks/radios, submenus, viewport behavior, hover switching, and typeahead.
2. **Exposure and cleanup:** reorganize existing commands, expose current capabilities, remove documented duplicates, and update help/shortcut text.
3. **New functionality:** implement only the prioritized New items with separate behavior specifications and authority tests.

Do not combine this rollout with legacy data migration or removal of the legacy backend.
Menus should stop promoting legacy workflows, while the separate removal project handles saved graphs, assignments, compatibility, and execution paths.

## Acceptance checks

- Opening a menu while a node is selected and pressing Delete cannot delete graph content unless the focused menu item is Delete and is activated.
- Arrow, Home, End, Escape, Enter, Space, Tab, and printable typeahead match the documented menubar behavior.
- Pointer hover switches top-level menus only while the menubar is open.
- Every icon/check rail, label, shortcut, and submenu caret aligns across mixed item types.
- Popups remain fully reachable near all viewport edges and at coarse-pointer row height.
- Checked and radio items expose correct roles and accessible state; separators expose `role="separator"`.
- Shortcut labels are platform-correct and new shortcuts do not add browser/OS conflicts; audit the existing Ctrl+D binding before expanding shortcut coverage.
- Read-only, selection-kind, root/child, request-bound, validation, and busy states enable exactly the commands they support.
- Actions captured in one graph/view cannot mutate another graph/view after an async boundary.
- File language clearly distinguishes workspace persistence, duplication, import, and portable export.
- Examples has one top-menu home under File.
- Unified generation begins with SillyTavern Send; idle unified UI has no generic Run command.
- Stop availability reflects the actual owned root/preview request, including native Send; it never targets an unrelated host generation.
- Arm, assignment feedback, Stop-while-busy, Apply/Reject, run meter, contextual menus, shelf interaction, and Close remain available.
- Preview Pin and baseline comparison are represented as different concepts.
- Graph and Node commands act on the active view and disclose when root-only behavior is required.
- Cleanup removes only the redundancies listed here and does not invent nonexistent controls.

## Audit limits

The original audit was based on the source at the time, the captured keyboard harness, the existing legacy-removal direction, and the supplied Gaea 2 menu captures.
Its initial scope excluded product changes; the approved implementation above and linked specification describe the subsequent menu work. Backend design and legacy migration remain separate.
Deferred features named here still require focused interaction and data-contract design before implementation.
