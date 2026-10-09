# The Lattice workspace

Lattice adds optional planning before a SillyTavern reply and reviewed editing afterward. SillyTavern continues to build its normal prompt, including its lorebooks and extensions. Start with an example, inspect its nodes, and change one stage at a time.

## Start with an example

1. Open **Workflows → Workflow examples…**. **Structured guidance** works without a model connection or an existing reply. **Literal cleanup** demonstrates a small replacement in the latest completed text-only assistant reply, also without a model connection.
2. For an example with model roles, open workflow setup and choose its connection profiles. Click a model-backed node to override its profile or model in the details panel. Deterministic nodes do not need a model connection.
3. Run the workflow explicitly and inspect its outputs in the preview pane. Opening, importing, editing, and selecting nodes do not make model calls.
4. Enable and assign a workflow only when you want it used during generation. For a reply revision after a full **Run**, choose **Apply Reply · Host result** in **Preview output**, inspect the original and proposed reply in the available artifact tabs, then choose **Apply reviewed candidate** or **Reject candidate**.

Literal cleanup's default rule changes `very very` to `very`. It proposes no change when the source reply lacks that literal. To try another rule, edit Rules and click **Save Rules** before running. JSON and multi-line editors keep drafts until their **Save …** button validates and commits the value; workspace autosave does not commit an unfinished editor draft.

Each model-backed stage uses its own auxiliary instructions through the selected connection. Its output does not replace SillyTavern's system prompt. The request bound shows the maximum auxiliary calls for the chosen run; your normal SillyTavern reply is separate.

| Example | Phase | Maximum auxiliary calls | What to try |
| --- | --- | --- | --- |
| [Literal cleanup](../workflows/literal-cleanup.json) | Post | 0 | Change the literal rule, inspect its proposed patches, then review and Apply. |
| [Structured guidance](../workflows/structured-guidance.json) | Pre | 0 | Edit the JSON source and inspect the selected fields and composed guidance. |
| [Scene guidance](../workflows/native-guidance.json) | Pre | 2 | Use a planning connection to compact context and suggest scene direction. |
| [Reviewed AI De-slop](../workflows/reviewed-de-slop.json) | Post | 1 | Find configured patterns and review a model's bounded repair. |

Manual pre-processing runs preview their guidance. Once a pre-processing workflow is assigned and enabled, the normal SillyTavern Send path installs its optional guidance for that generation. A target run remains an inspection action.

## Find and connect nodes

The floating shelf follows the usual order of building a workflow:

| Family | Use it for |
| --- | --- |
| Input | Bring scene context, a reply, or other material into the graph. |
| Shaping | Select, compact, combine, and plan that material. |
| Surface | Inspect and improve the resulting writing. |
| Transpose | Adaptations between forms; unavailable until supported nodes exist. |
| Derive | Extract facts, structured values, findings, or patches. |
| Output | Produce guidance or a reviewed reply result. |
| Subgraphs | Reuse a saved graph as one node. |

Right-click empty canvas to search for a node at that location. You can also drag from a pin: drop onto another compatible pin, or drop into empty canvas to search and create a connected node. **Context sensitive** filters the choices for that pin. If a node has several matching pins, choose the one you intend to use.

Input pins are on the left and output pins on the right. Their colors and labels identify the material they carry. An output can feed several nodes; each input accepts one connection. A rejected connection keeps the existing graph intact and explains the problem.

Click a node to edit its settings in the right details panel. Commit JSON and multi-line edits with the field's **Save …** button and resolve any validation error before Run. Its graph label can be an alias; the details panel retains the canonical node type. Compact view keeps the icon and real pins while reducing the card's size.

## Move around the graph

Drag a node by its body. Drag with the middle mouse button to pan, and use the wheel to zoom around the pointer. The shelf floats over the graph; the canvas beneath and below it remains usable.

Grab the handle between preview and graph to resize the panes. Collapse the preview when you need more graph space, then reopen it to continue inspecting the same output.

Double-click a subgraph node to open its contents in a graph tab. **Graph 1** remains the main workflow. Each instance keeps its own camera, selection, and presentation, even when several instances use the same saved definition. Closing a tab hides the view; reopening it restores that view. Switching tabs does not stop a running root workflow.

## Reuse workflows and subgraphs

**Open workflow** opens a separate workflow. **Import into graph** adds a workflow or fragment to the existing graph after showing a review. Imported nodes receive fresh identities and keep their internal connections and relative layout. Review the phase, terminal changes, model roles, and request bound before accepting.

Import requires matching graph modes and phases. Legacy prompt-replacement graphs retain their single Output rule: a fragment with a second Output must be opened separately or exported without that extra terminal.

A subgraph exposes named inputs, outputs, and selected settings. Save reusable definitions in the **Subgraphs** shelf and export them as individual JSON files. Installed instances keep their pinned definition snapshots, so deleting a shelf entry does not break existing workflows.

The [Literal cleanup subgraph](../workflows/subgraphs/literal-cleanup.json) takes a frozen Draft and returns Patches. Its Rules setting is exposed on the instance. Keep **Validate Patches → Review Gate → Apply Reply** in the main graph after that output; the reusable body proposes changes and the main workflow owns review and application.

Library revisions and instance updates are explicit. Inspect an update's interface and binding changes before accepting it. Use **Make local copy** to edit a private body without changing other instances. Nested local copies preserve their containing graph through private ancestor revisions. **Unpack** exposes one level of nodes while preserving effective settings, bindings, and parent connections.

Portals replace long visible connections with named references to existing outputs. Manage their source and consumers, rename them, or restore a visible wire. They preserve the same dependency; crossing a subgraph boundary still requires an exposed input or output.

## Inspect a run

A bright ring identifies the active node. Failed nodes have a red ring and a dimmed interior; blocked descendants and unrelated nodes have distinct states. The bottom-left meter opens run details, including the expanded stages inside subgraphs. Navigation never steals the current selection or moves the camera automatically.

Preview the recorded inputs and outputs of a selected node, or pin an output while inspecting another part of the graph. Artifact tabs show the sections recorded for that output. After a full root Run, select **Apply Reply · Host result** in **Preview output** to inspect its candidate artifact and access the fresh reviewed Apply action. Reviewed AI repair records separate **original** and **candidate** text tabs; Literal cleanup's structured **candidate** artifact contains `original` and `text` fields. Text Rules, validation, review-gate and subgraph outputs remain diagnostic. **Run to here** explicitly runs the selected output and its upstream dependencies. It does not publish guidance or enable applying an intermediate reply.

Changing semantic controls or connections makes the previous run stale and cancels active work. Camera, selection, aliases, compact view, and tab changes preserve the run. A stale result stays available for inspection but cannot supply a fresh Apply action.

Large recordings show explicit truncated or omitted entries. Diagnostic retention follows a stable graph order and may leave space unused after its cutoff. The full reviewed reply candidate remains separate from preview text; applying it never uses a truncated preview.

## Native connection shortcuts

These controls apply to named-pin native workflows. Legacy wire modes retain their original behavior.

| Gesture | Action |
| --- | --- |
| Click a wire | Select it. |
| Shift/Ctrl-click wires | Extend the wire selection. |
| Delete/Backspace | Delete selected connections when focus is outside an editor. |
| Alt-click a wire | Disconnect that wire. |
| Alt-click a pin | Disconnect its attached bindings. |
| Ctrl-drag a connected input | Move its binding to another compatible input. |
| Ctrl-drag an output | Move its consumers to another compatible output. |
| Double-click a direct wire | Insert a compact, typed Reroute. |
| Right-click a pin | Break individual/all bindings or navigate to a connected source. |
| F2 on a selected node | Rename its alias. |
| Escape | Cancel an unfinished drag or chooser. |

Text fields and search retain their normal keyboard editing. Invalid or cancelled moves preserve the original connections. Stop cancels the active run; a late provider response cannot revive it.
