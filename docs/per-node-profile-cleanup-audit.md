# Per-node connection profile cleanup audit

Date: 2026-10-10. Source baselines: main `d047477` and the node-profile follow-up worktree `f35eef8`.

This is an audit, not a product change. It covers connection controls, menus, legacy workflow surfaces, saved bindings, export behavior and related code. The existing [legacy removal audit](legacy-removal-audit.md) and [menu/workspace audit](menu-and-workspace-design-audit.md) remain separate work; this document adds the consequences of per-node profiles without replacing either.

## Recommended direction

Use the searchable bar under an ordinary model node as the primary connection selector. Keep **Active SillyTavern model** first and use the selected profile's model by default. Move exceptional model overrides and inheritance diagnostics into advanced Details. Remove competing ordinary-profile selection UI and outdated setup instructions.

**Fast connections is a separate feature dependency.** Its name makes it sound like a second manager for cheap text models, but it configures a typed SystemOne transport. Removing it requires either retiring Fast Decision or supplying a typed-capable replacement. Merely choosing a SillyTavern profile cannot replace its endpoint, request contract or native probability results.

## 1. Remove or simplify ordinary connection UI

| Surface | Recommendation | Evidence and conditions |
| --- | --- | --- |
| Ordinary **Details → Connection profile** dropdown | Remove the duplicate where the canvas picker is available. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L403) and [NodeProfilePicker.svelte](../ui/NodeProfilePicker.svelte#L104) edit the same binding through `nodeDetailsActions.editBinding` in [controller.js](../src/ui/controller.js#L555). Keep that shared action; the canvas picker still needs it. |
| **Advanced connection settings → Connection mode** | Replace the competing override workflow with a compact reset-to-role/definition action, or have Override open the canvas picker. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L193) currently creates a profile draft, then relies on the duplicate dropdown to choose/save it. Deleting only the dropdown leaves an incomplete edit path. Retain inherited and explicit-null behavior. |
| **Model mode / Model identifier** | Keep the optional override, collapsed under advanced model settings. Simplify its ordinary-root presentation if useful. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L404). An explicit model identifier can intentionally differ from the profile model. Nested definitions additionally require inherit/override/block semantics. Per-node profile selection does not make that behavior dead. |
| Free-text **Model role** | Remove from the normal connection-selection flow; retain advanced reusable-helper/inheritance authoring while roles remain supported. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L408). A node with its own profile does not need users to edit a role name to choose a model. Role names still group inherited helper bindings. |
| Repeated **Effective connection / source** text | Collapse ordinary successful diagnostics; keep errors and advanced provenance. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L410). The canvas already shows the selected profile and model. An unavailable profile or containing-instance override still needs an explanation. |
| **Helper model bindings** on For Each | Keep until helper calls have equivalent occurrence-specific controls. Improve the precedence display. | [NodeDetails.svelte](../ui/NodeDetails.svelte#L382), [iteration-bindings.js](../src/ui/iteration-bindings.js#L26). For Each selects profiles for helper roles; it has no direct model profile to replace those controls. See the confirmed no-effect case below. |

Do not remove the entire Details model section indiscriminately. Conditional operations can keep dormant saved bindings while their current mode makes no model call. Examples include Smart Compactor selection, Repair scan/inspect, Extract literal, Express behavior/attention, Context assembly/perspective/focus selection, and Item Use Trigger candidates. Their picker reappears when the operation uses a model. The projection checks the effective request bound in [workspace-preparation.js](../src/ui/workspace-preparation.js#L85).

No currently wired universal Models/Profiles panel or Workflow Setup panel was found. The former Setup UI is already absent; stale copy still points to it.

## 2. Fast connections: complete retirement scope or consolidation

Ordinary Decision sends messages through SillyTavern's completion services; fixed profiles use Connection Manager ([connections.js](../src/workflow/connections.js#L98)). Fast Decision directly posts `{model, state, questions}` to `/v1/systemone`, with a private session credential ([fast-connections.js](../src/workflow/fast-connections.js#L101)). It validates native `noul` probabilities, choice distributions and typed score results ([decision.js](../src/workflow/decision.js#L44)). Ordinary Decision produces acceptance and optional self-reported confidence; those values are not interchangeable with native probabilities.

If Lattice is to support only ordinary SillyTavern profiles, retire the following together:

| Layer | Remove/update |
| --- | --- |
| UI | `ui/FastConnections.svelte`, `ui/fast-connections-types.ts`, **Tools → Fast connections…**, the Fast Decision Details shortcut, Workbench overlay, Fast view/action types and setup help. Entry points: [WorkspaceMenus.svelte](../ui/WorkspaceMenus.svelte#L22), [Workbench.svelte](../ui/Workbench.svelte#L15), [NodeDetails.svelte](../ui/NodeDetails.svelte#L348). |
| Controller/preparation | Fast setup DTO, refresh/save/remove/clear-key actions and dialog activation; Fast options, primary/fallback resolution, typed exclusions and fallback control grouping. [controller.js](../src/ui/controller.js#L156), [provider-settings.js](../src/ui/provider-settings.js#L8), [workflow-surface.js](../src/ui/workflow-surface.js#L140), [workspace-preparation.js](../src/ui/workspace-preparation.js#L126). Keep provider-settings' unrelated workflow helpers until unified retirement handles them. |
| Host/transport | `fast-registry.{js,d.ts}`, `fast-host.{js,d.ts}`, `fast-connections.{js,d.ts}`; lazy registry/bridge and facade hooks in [run.js](../src/run.js#L15). Restore direct ordinary `bindingStatus` dispatch: ordinary freshness checks currently also pass through the Fast bridge. The saved key is `extensionSettings.lattice_fast_connections`; keys themselves are session-only. Retire persisted configuration deliberately rather than confusing it with `nativeBindings`. |
| Operations/runtime | Fast Decision registration, `fastConnectionId`, fallback enable/error/profile controls, `runFastDecision`, typed response handling and typed/fallback branches in runtime, host freshness checks, iteration declarations and recording types. Keep ordinary Decision, general request accounting, cancellation and binding freshness. |
| Examples/generators | Rewrite the paired-kiss example and its generator: [scoped-story-examples.mjs](../tools/scoped-story-examples.mjs#L44), `examples/unified/unified-paired-kiss-memories.json`, generated `unified-example-data.js`. Its gate currently reads `answers.kiss.noul`; changing only the node operation would leave that gate unresolved. An ordinary Decision version should extract/adapt `answers.kiss.accepted` into `{accepted}` for Confirm Events, preserving unresolved results. Do not retarget the numeric Confidence Gate to a boolean. |
| Saved workflows/definitions | Provide recoverable handling for saved Fast nodes and pinned helper definitions. Removing a registered operation makes those graphs invalid. Changed helper bodies require new hashes/references; do not silently mutate pinned identities. |
| Tests/docs/distribution | Retire dedicated Fast transport/registry/host/facade suites, retarget mixed suites, update current guides and screenshots, regenerate examples and rebuild `dist/lattice-ui.js`/`dist/lattice.css`. Preserve ordinary unified Send/Review tests and generic gates/events/privacy tests. |

Some apparently Fast-specific names hold shared code: ordinary Decision uses `prepareFastDecisionRequest` for validation, so generalize/rename that helper rather than deleting it. Confidence Gate and Confirm Events remain useful without Fast Decision. Historical run decoding may remain useful for recorded Fast runs.

If typed decisions remain a product feature, consolidate their configuration into a capability-aware connection UI, or supply a genuine SystemOne adapter with trusted credential integration. The current ordinary ST profile picker alone is insufficient. Renaming the existing manager to **Typed connections** would also make its purpose clearer, but would not remove the separate configuration requirement.

## 3. Binding inconsistencies to fix during cleanup

### For Each can offer a selection that does not change the model

Explicit helper-node bindings take precedence over the For Each role selection. [iteration-helpers.js](../src/workflow/iteration-helpers.js#L40) applies role overrides only when a saved node field is null/absent; [iteration-bindings.js](../src/ui/iteration-bindings.js#L32) mirrors that precedence.

A pure in-memory runtime probe confirmed:

| Helper node | For Each role choice | Requested profile |
| --- | --- | --- |
| `profileId` omitted | Chosen saved profile | Chosen saved profile |
| Created with the new explicit Active default | Same chosen saved profile | `lattice:active-sillytavern` |

The UI can still describe the source as “For Each role override” without explaining the explicit helper-node conflict. Do not remove all helper selectors: shipped helpers with omitted profile IDs still need and use them. Disclose which calls the override affects, show the fixed node binding, or disable a control that cannot affect any call. A change to new-helper inheritance is a separate behavior decision; ordinary newly created nodes should keep the approved Active default.

### Fast selectors are not scrubbed from portable exports

[packages.js](../src/workflow/packages.js#L76) includes operation controls and clears ordinary local `profileId`, but preserves `fastConnectionId` and `fallbackProfileId`. A pure export/import probe preserved both local IDs and parsed successfully. This conflicts with current documentation saying local connection IDs are excluded ([README.md](../README.md#L94)). No credential leak was identified; this is a portability/policy inconsistency.

If Fast remains, give it an explicit portable unbound/rebinding representation or correct the documented policy. Clearing only `fallbackProfileId` is insufficient: enabled fallback requires a nonempty profile and allowed-error list ([decision-nodes.js](../src/workflow/operations/decision-nodes.js#L34)). Handle pinned identity changes and import validity together. If Fast is retired, retire this export path with it.

### Imported unbound profiles are not automatically Active

Ordinary fixed profile IDs export as null. Import does not run node-creation defaults: that null can inherit an available role or hold without a binding ([graph-validation.js](../src/workflow/graph-validation.js#L374)). A pure probe confirmed both cases. Replacing all old nulls with Active during cleanup would change saved/imported execution and hide missing connections. Keep the approved Active default for newly created nodes; migrate older bindings deliberately if the inheritance system is retired.

## 4. Existing legacy workflow UI to retire

These are broader unified-workflow cleanup, already covered by the separate [legacy removal audit](legacy-removal-audit.md), rather than new consequences of per-node profiles:

- **New legacy pre workflow / New legacy post workflow**, legacy phase assignment commands and the creation phase dropdown: [WorkspaceMenus.svelte](../ui/WorkspaceMenus.svelte#L21), [NewWorkflowPrompt.svelte](../ui/NewWorkflowPrompt.svelte#L28).
- Idle root **Run** and **Run workflow** once Pre/Post root execution is retired: [Toolbar.svelte](../ui/Toolbar.svelte#L23). Unified root generation already requires normal SillyTavern Send. Keep Stop and supported Run to here.
- `preGraphId`/`postGraphId`, legacy Send fallback, public `runPre`/`runPost`, legacy root-mode filtering and creation defaults: [state.js](../src/state.js#L47), [run.js](../src/run.js#L50), [workflow-surface.js](../src/ui/workflow-surface.js#L335). Archive/export old saved roots before tightening admission.
- Old Pre/Post starters, lesson catalog, root packages/generators and the standalone experimental Introspection executor. Preserve useful current node engines and pinned stage-specific helpers.

Preparation/Response **node stages** are still part of unified workflows. They must survive removal of Pre/Post **root types**.

## 5. Other redundant UI and dead code

| Candidate | Action/dependency |
| --- | --- |
| Examples under both File and Workflows | Remove the Workflows duplicate; keep one canonical Examples entry. [WorkspaceMenus.svelte](../ui/WorkspaceMenus.svelte#L16). |
| Details Duplicate/Delete overflow | Remove after menu/context coverage is reliable. Context actions remain useful. [NodeDetails.svelte](../ui/NodeDetails.svelte#L342). |
| Permanent Portals button in Details | Move manager access to Graph, then remove the header button. Keep pin-specific portal context actions. [Workbench.svelte](../ui/Workbench.svelte#L127). |
| Inspector toggle in Tools plus Details button | Consolidate into a dependable pane visibility command; optional removal of compact toolbar duplication. Preserve a way to reopen Details. |
| Repeated Preview heading/type in simple single-artifact mode | Collapse redundant chrome; retain labels/tabs for multiple artifacts and result-specific Apply/Reject. |
| Unused helpers/CSS | Retire `escapeHtml`, `commitNativeNode`, local `requestBound`, `.pc-settings-sub`, `.pc-workflow-starter`; these were identified in the earlier legacy audit and remain in inspected sources. |
| Unused secondary projections | `projectDefinitionInstance` / `projectDefinitionUpdate` in [workspace-preparation.js](../src/ui/workspace-preparation.js#L306) have test imports but no installed product callers. Remove/retarget their secondary tests with the functions. |
| Old secondary UI paths | Retire `addSubgraphBoundary`, `parseWorkflowRules`, NodeShelf `view.families`/`add` fallback and the old workflow-node controls presentation with their type/parser/test support, as documented in the legacy audit. Keep active configured node insertion and current Details projections. |

Do not remove visible Arm, assignment/request-bound feedback, Stop, the run meter, normal undo/redo, context menus or Close merely because another access path exists. Their immediate feedback is useful. Saved root selection and child graph tabs choose different scopes. There is no current minimap, generic canvas toolbar or persistent gesture-hint surface to delete.

## 6. Stale text, docs and assets

- [index.js](../index.js#L31) still says “Assign optional pre-generation guidance in Setup” and describes manual reply repair. Replace it with unified assignment/Arm/Send guidance.
- [Workbench.svelte](../ui/Workbench.svelte#L140), [connections.js](../src/workflow/connections.js#L163), README and current guides still direct ordinary connection choice primarily to Details. Point to the node's bar and reserve Details for advanced options.
- Remove old Setup screenshots, Pre/Post walkthrough instructions and manual-root-Run claims from current operator guides as their features retire; update browser capture tools and generated distribution together.
- Preserve main's **Workflow Data** terminology and launcher fixes when integrating the profile follow-up worktree. Internal module/overlay identifiers still use `story-document` names; renaming those is optional internal consistency work, not a redundant feature to delete.
- Archive historical plans/research separately if desired. They are not installed UI or runtime paths.

## Keep as current functionality

- The Active option, saved ST profile discovery, model detection, per-node selectors, qualified instance overrides and undo/redo.
- `graph.roles`, `modelRole`, `roleOverrides`, `nodeBindingOverrides` and explicit-null semantics until a deliberate saved-data/definition migration removes their uses. No current global-role reader was found in `nativeBindings`; that namespace contains workflow assignments.
- Profile/model freshness and unavailable-profile errors, provider adapters and credential separation.
- Generate Reply's normal SillyTavern generation. It is a native boundary with no auxiliary model role/request bound ([lifecycle-nodes.js](../src/workflow/operations/lifecycle-nodes.js#L10)); it intentionally has no auxiliary profile picker.
- Workflow Data authorization, Recall arms, accepted-effect persistence, typed pins, branching, privacy/actor authority and reviewed publication.

## Suggested execution order and audit limits

1. Remove the ordinary duplicate selector and consolidate its Connection mode draft path; collapse advanced controls and correct stale copy.
2. Fix helper precedence feedback and, if retained, Fast portability. Coordinate with the existing menu/legacy cleanup rather than duplicating it.
3. Retire Fast Decision as a whole or implement a typed-capable configuration replacement; only then remove its manager and plumbing.
4. Finish legacy root retirement with recoverable saved data, then delete unused code/catalogs, refresh docs/screenshots and rebuild distribution.

Validation for implementation should cover root and pinned-occurrence edits, reset/inheritance, helper precedence, undo/redo, unavailable profiles, portable import/export, conditional model modes, keyboard isolation, theme rendering and unified Send/Review ownership. Keep paid-provider calls unnecessary for those checks.

This audit used three independent read-only source inspections, repository searches, comparison of main/follow-up sources, and three pure in-memory binding/export/identity probes. No product files, saved settings, credentials or live chats were changed. No full regression/build/browser run was performed for this documentation-only audit. Source links refer to the inspected baselines; the two preexisting audit documents were left untouched.
