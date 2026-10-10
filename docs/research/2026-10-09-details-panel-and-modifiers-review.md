# Details panel and modifier design review

Review date: October 9, 2026. Status: design research and recommendations; no product behavior changed.

## Brief and recommendation

The requested overhaul should make the selected node approachable: put its useful editing controls first, reduce repeated explanation and boxes, adopt the calm hierarchy and restrained color of the supplied Gaea 2 panels, and keep Compact Card exclusively in the node context menu and a graph shortcut. The modifier bar is an idea to evaluate, rather than an established feature requirement.

Recommend a **quiet, section-based inspector** with controls appropriate to each node and mode. Use a small identity header, purpose-based groups only where useful, and progressive disclosure for secondary configuration. A two-control node should have a two-control panel. Complex rules, schemas, and state dictionaries need better editors, rather than more decoration around their existing JSON textareas.

Separate delivery into two parts: a presentation overhaul that preserves workflow semantics, followed by a small, explicitly designed modifier system. Modifiers change execution, persistence, and recorded outputs; they are more than a footer toolbar.

## What the nine references actually show

The supplied screenshots are visual evidence. They establish the appearance and visible labels, not the semantics of every icon or gesture. The application's documentation supplements those observations.

| Reference | Useful design lesson | Adaptation for Lattice |
| --- | --- | --- |
| Swirl | One identity header, one relevant action, one group with three controls. Most of the panel is empty. | Keep Text, Guidance, Reroute, and simple source nodes short. Show an action strip only when the node has a useful direct action. |
| Erosion2 | A dense node remains readable through General, Sediment Discharge, Shape, and Orographic Influence. Color relates neighboring controls; toggles activate specific features. | Group complex nodes by the user's task: selection, protection, model, output. Reveal controls conditional on a mode or subfeature. Do not turn every group into another bordered card. |
| Cartography | Segmented choices, dropdowns, numeric ranges, and toggles share a common rhythm. Land/water controls repeat a recognizable structure. | Select the editor for the value. Use repeated rows for rules, fields, and sections. Small choice sets can be segmented; longer sets remain dropdowns. |
| Combine | Swap Inputs and Add Input sit above editing. Mode choices form a matrix; Output and Enhance are separate small choice groups. | Context Join and Compose can expose input/section management locally. A large option matrix is justified only when users benefit from scanning all choices. |
| Shade | Mode leads; values and feature-specific toggles follow. | Put mode first on Repair, JSON Decode, Text Rules, and Introspection nodes. Only show settings that apply to that mode. |
| Height | A range and falloff occupy very little space. | Avoid empty Presentation, Operation, and Advanced sections on sparse nodes. Do not fill the panel to look complete. |
| Height Remap modifier | One compact, removable strip with two endpoint values. | A modifier with two real parameters can use a compact inline editor, with clear endpoint names. |
| Shaper modifier | One adjustment fits in one strip. | A small numeric or text adjustment should stay small. |
| Invert modifier | A parameterless operation is represented by its name. | A cleanup toggle such as Trim edges needs a named row and state, rather than an empty settings box. |

Across the references, the important hierarchy is **identity → applicable actions → editable properties → small output refinements**. Controls get the visual attention; routine metadata does not. Empty space is allowed.

The [Gaea Property Editor documentation](https://docs.gaea.app/ui/interface/property-editor/index.html) describes typed controls, muted default slider values, direct numeric entry, and a precision nudge menu. The [toolbar documentation](https://docs.gaea.app/ui/interface/menus-and-toolbars/property-editor-toolbar.html) confirms node-specific actions and state/help commands. These support compact editing and contextual commands; they do not require copying Gaea's exact gestures.

### What to improve instead of copying

- Several reference labels and inactive choices have low contrast. Keep essential labels legible, including default and disabled values.
- Do not require users to understand the bottom toolbar's unlabeled icons. Use short names initially and accessible descriptions throughout.
- Keep ordinary editing available with keyboard and direct entry. Numeric editing should not depend on discovering a right-click gesture.
- Do not copy the small diamond controls beside every parameter: Lattice does not currently have a corresponding general parameter-binding system.
- Name both ends of a range when their meaning is not obvious. A centered label between two numbers can hide which value is being edited.
- Large changes to text can affect meaning. A terrain-style Strength slider should not imply a measurable semantic guarantee for a model rewrite.
- Editing a setting must not silently trigger a paid model call or a memory/reply write.

## Current panel: why it feels complicated

The current panel is already mostly flat. Its fieldsets have transparent backgrounds, thin separators, and no shadows: [NodeDetails.svelte](../../ui/NodeDetails.svelte#L257). The problem is largely information hierarchy.

1. A workspace Details heading precedes another node heading. Canonical type, family, and phase repeat information already visible elsewhere.
2. Presentation occupies the top: Alias, Reset alias, Compact card. The controls needed to edit the operation begin below those.
3. Enabled and the sentence about blocking execution appear on every ordinary node.
4. The projector attaches effective value and source to every control, even when the effective value equals the saved value: [workspace-preparation.js](../../src/ui/workspace-preparation.js#L90). The panel displays them beneath the editor: [NodeDetails.svelte](../../ui/NodeDetails.svelte#L224). Whole JSON arrays can be repeated there.
5. Model nodes repeat role, connection mode, model mode, effective connection, and source. The useful question—what connection will this node use?—is buried among the mechanics.
6. Generic JSON editors make the user manage syntax for rule arrays, field maps, sections, input slots, and state values.
7. Duplicate/Delete are persistent buttons, though the node already has these canvas commands.

The review used current source, the saved model/text-rules screenshots, and read-only probes. No assumption that removing borders alone will solve this problem is warranted.

## Proposed inspector

### Identity and commands

Use one header with family-colored icon, node name, and a small overflow menu. Alias editing lives in the title/Rename flow; show the canonical name beneath it only when an alias differs. F2 and existing Rename must focus the replacement title editor, since they currently focus Alias in Details: [controller.js](../../src/ui/controller.js#L327).

Compact Card remains in the **node context menu only**, with a checked state and a documented graph shortcut. The menu item already exists: [controller.js](../../src/ui/controller.js#L1059). A proposed shortcut is Shift+C, active only when the graph owns focus and the user is outside an editor; audit host/browser conflicts before selecting it. Do not duplicate this command in the Details overflow.

Move Duplicate/Delete out of the main editing area. Keep Rename, Reset settings, and Help discoverable through appropriate commands. New commands require their actual contracts; a mockup menu is not evidence that they are implemented.

Keep read-only and execution-blocking states visible. Errors should open their containing section and remain visible near the affected control, even when it would normally be secondary.

### Control vocabulary

- **Bounded numbers:** one combined label/value adjustment row with direct numeric entry and an optional slider. Preserve integer steps and units. Use a number field without a fabricated slider range when no meaningful bounds exist; token budgets often benefit from exact entry.
- **Booleans:** compact labeled switches for genuine operation options. Do not replace essential explanations with color alone.
- **Enums:** segmented choices for two to four short options; dropdowns for larger or lengthy sets. Keep the actual saved values independent of display labels.
- **Prose:** a real textarea with adequate height. Instructions are central to writing workflows, so do not compress them into a numeric-control aesthetic.
- **Structured values:** editable rows with a secondary raw JSON view. Rule rows need match type, pattern, replacement, and supported options; field rows need output name, source path, and required/default handling.
- **Diagnostics and provenance:** show an override indicator when a value is inherited or different; reveal the full source on request. Do not print an identical Effective/Saved pair under every field.

Preserve the current save semantics during the initial presentation change. JSON/line editors explicitly Save, while scalar controls commit on change. Replacing this with global Apply requires a separate transaction design.

### Grouping by node

| Nodes | First visible controls | Secondary or conditional controls |
| --- | --- | --- |
| Text / File Input / Prompt Source | Content; file selection and name; source/form | Snapshot/file constraints; macro explanation; conditional prompt ID |
| Scene Context / Reply Snapshot | Recent-message and character choices where applicable | Technical metadata and ports; Snapshot may have almost no settings |
| Smart Compactor | Method, target tokens, recent material | Pins/protection, purpose, model/output limits when applicable |
| Response Plan | Instructions, output budget | Model summary and overrides |
| Context Join / Compose | Input/section rows; mode and relevant template | Separator, output type, raw JSON |
| Reroute | Artifact type | Ports |
| Text Rules / Pattern Scan | Mode, input/scope, rule rows | Separator; Draft-specific scope and protected wording; raw JSON |
| Repair / Style Transfer / Format Transfer | Mode, reference/scope/strength, instructions where applicable | Protections, model/output limits; mode-specific categories |
| Terminology Map | Input type, scope, matching and case choices | Protection and reference details |
| JSON Decode / Select Fields | Parse/check and schema; field/path rows | Raw JSON and diagnostics |
| Guidance | Token budget | Ports and behavior details |
| Validate Patches / Review Gate / Apply Reply | Only genuine editable settings | A concise behavior statement where necessary; no empty Operation group |
| Subgraph instance / boundaries | Exposed controls and roles; named port settings | Definition/version and technical interface; preserve edit permissions |

Introspection requires mode-specific layouts. Reflect/Internalize lead with Mode and Instructions. Express shows model configuration only for Inner Voice. Context Assemble edits input count, Perspective edits actor, and Focus edits selection/compression settings. Memory Read edits view, Recall edits query/results, and Commit exposes its commit configuration and write behavior. State Value uses named value rows with bounds, Curve uses recovery settings and phase durations, and Track exposes track identity. Native descriptors already change by mode: [native.js](../../src/workflow/introspection/native.js#L43).

Protection, schema constraints, output types, and Memory Commit behavior may be secondary in frequency but are not unimportant. Keep them easy to discover; show active settings and relevant warnings in the collapsed summary.

### Color and spacing

Dominant flat pixels sampled from the supplied Swirl image are panel **#2a2a2a**, header/action surfaces **#1f1f1f**, and section surface **#303030**. These are reference measurements, not a proposed global theme replacement.

For Lattice, derive equivalent roles from the existing theme: `--pc-panel`, `--pc-block`, `--pc-field`, `--pc-control`, `--pc-text`, `--pc-muted`, and `--pc-border`. NodeDetails currently hardcodes many colors, so theme consistency is part of this overhaul. Respect light themes and SillyTavern's explicit overrides.

Use the existing family palette for node identity: Input olive, Shaping teal, Surface sage, Transpose violet, Derive magenta, Introspection sand, Output rose, Subgraphs neutral. Within fields, prefer neutral readable labels, subtle related-control fills, and a restrained accent for value/selection. Do not assign every parameter a different hue. Error/warning colors must retain their meaning and not be reused decoratively.

Use one quiet section boundary or subtle surface difference, rather than border + card + inner fieldset. Target approximately 32–36px scalar rows, 8px field gaps, and 12–16px section gaps, increasing hit targets on coarse pointers. Validate at the actual inspector widths of **220–520px**, including its 258px default: [Workbench.svelte](../../ui/Workbench.svelte#L44).

## Enabled, disconnect, and bypass

The universal Enabled row can leave Details, but its behavior cannot be treated as redundant with disconnecting.

The planner collects the selected terminal/target's upstream closure and rejects a disabled dependency with `DISABLED_OPERATION`: [resolve.js](../../src/workflow/resolve.js#L56). Disabling preserves the wires and blocks that path. A disabled node outside that execution closure does not itself prevent the selected run, although stored settings still validate.

Disconnecting deletes a wire. A required input can then fail with `MISSING_INPUT`; an optional input may disappear from execution or use a configured fallback. A read-only probe confirmed disabled Text feeding an optional Compose section fails, while removing that wire allows Compose and Guidance to execute without that Text dependency.

Recommend keeping **Disable node / Enable node** as a secondary graph command with a visible **Blocks run** state on affected nodes. Preserve existing saved disabled nodes and explain the state when selected. The everyday Details panel should begin with editing controls. Whether the stop command is useful enough to retain long term is a product decision, rather than a styling change.

True **Bypass** is different again: it must forward a declared compatible input to an output. Text→Text stages may support that; Context→Guidance, Text→Data, and Draft→Patches cannot use a universal pass-through rule. Do not rename current disable to bypass.

## Modifier bar: useful scope and boundaries

Gaea documents modifiers as an ordered output post-process, with functionality overlapping ordinary nodes; changing order can change the result. See [Modifier Stack](https://docs.gaea.app/ui/interface/property-editor/modifier-stack.html) and [Using Modifiers](https://docs.gaea.app/using/using-gaea/managing-graphs/using-modifiers.html). Lattice can adopt the compact, inspectable adjustment pattern. Its performance benefit must be measured separately; fewer visible nodes do not automatically mean cheaper execution.

### Candidate order

| Priority | Modifier | Eligible output | Decision |
| --- | --- | --- | --- |
| First | Trim edges | Text | Removes leading/trailing whitespace. Explicit opt-in because indentation and templates can matter. |
| First | Normalize line endings / trailing spaces / blank lines | Text | Expose precise named options; avoid a vague Clean text operation that silently performs several edits. |
| First | Wrap | Text | Literal prefix/suffix for delimiters or framing; no hidden host macro expansion. |
| Next | Literal replace | Text | One clear replacement with occurrence/case policy. Multiple or regex rules belong in Text Rules. |
| Next | Unwrap outer fence | Text | Remove one well-defined enclosing Markdown fence, useful before strict JSON Decode. Do not search prose for guessed JSON. |
| Later | Pick/rename fields and explicit missing-field defaults | Ordinary JSON Data | Reuse Select Fields semantics; protect typed actor/event/state records. |
| Later | Require nonempty / size or schema guard | Text or ordinary Data | A visible validation rule that fails explicitly. It is not a silent truncation modifier. |

The smallest useful first set is **Trim edges, Whitespace options, Wrap** on single-output Text nodes. Expand only when real workflows show repeated small adjustments. Arbitrary strings, including host macro syntax, remain literal.

Keep model rewrites, compaction, JSON parsing/type conversion, reply mutation, memory writes, and branch logic as explicit nodes. Text Rules already has deterministic replacement/extraction behavior; Select Fields already defines required/default path selection. Draft is source-bound and cannot be directly trimmed without violating its original-text contract: [repair.js](../../src/workflow/repair.js#L180). Draft edits must continue through Patches, validation, and review.

### Interaction

For eligible nodes, show a small bottom adjustment area with short labeled quick toggles and an Add modifier action. Unsupported nodes have no empty tray. Active modifiers appear as ordered, removable rows; a parameterless one is simply a name and enabled state. Disabling keeps its settings; removal deletes it. Make both reversible through graph undo.

Keep this tray visible within the inspector's layout where practical, with the main controls scrolling separately in the real app. Let it grow or collapse accessibly at narrow widths; do not overlay writing controls or imitate the reference's enormous empty vertical region.

Order is semantic: Trim → Wrap preserves the wrapper's intentional whitespace; Wrap → Trim can remove it. Show order and provide keyboard-operable reordering as well as any drag handle. Show active modifier names/count on canvas cards, including compact cards. A decorated output affects every downstream consumer; branch-specific changes still need a separate node.

Preview should distinguish the recorded raw output, transformed output, and freshness. Editing deterministic modifiers can preview against a recorded source without rerunning the model; mark this as a local preview. Changed downstream results become stale. A new run applies modifiers before downstream consumers and captures their applied settings/results in the trace.

Offer **Convert to nodes** once equivalent explicit operations exist. This is a later escape hatch that must preserve order, connections, settings, and undo; do not ship a nonfunctional action with the first tray.

### Runtime requirements

Modifiers must be semantic workflow data with stable IDs/version, output targeting, enabled state, order, validated settings, and typed applicability. They must participate in validation, undo/redo, copy/paste, portable export/import, subgraph semantics, signatures, definition hashes, and stale-result detection. Current export whitelists known fields: [packages.js](../../src/workflow/packages.js#L18). A UI-only property could otherwise disappear when sharing and leave stale detection unaware of a changed output.

Unknown or incompatible modifiers must produce a visible validation failure rather than be silently ignored. Bound text/JSON size and execution cost. Choose an explicit per-output target before supporting nodes with multiple outputs. Start with Text and later ordinary JSON Data; the shared Data label does not make Introspection records safe for arbitrary field deletion.

## Approach choices

1. **Quiet sections — recommended.** Primary editing is visible; Model, advanced settings, ports, and provenance expand where needed. It resembles the reference hierarchy, works across sparse/dense nodes, and avoids hiding main settings behind tabs.
2. **Focused tabs.** Parameters / Model / Advanced can reduce vertical length, but make missing bindings, active protections, and errors easier to overlook. Worth considering only for the most complex node types, with visible status in tab labels.
3. **Command-heavy inspector.** Move nearly everything into menus and show only minimal controls. It looks clean but costs discovery and accessibility. The reference screenshots support simple controls, not an inspector stripped of useful editing context.

The conversation mockups compare the first two layouts and show a separate Text Rules modifier example. They are proposed interactions, not a replacement for the live app. Local browser checks exercised model overrides, tabs, rule save behavior, trim/wrap, order changes in both directions, removal/re-adding, and geometry at 220px, 320px, and wider. Light and dark renders were visually inspected. The mockup's raw JSON view is a read-only preview; an implemented editor must retain actual raw editing access.

## Safe delivery and validation

First: remove repeated presentation and management controls, adapt Rename/F2, add graph-focused Compact Card access, make provenance conditional, introduce presentation grouping, and use existing theme roles. Keep semantic contracts and current draft/save behavior stable. Extract a reusable control renderer if needed; `DetailControl` currently has no group/order/priority metadata: [detail-types.ts](../../ui/detail-types.ts#L12).

Second: build structured editors for the highest-friction values—Text Rules, Select Fields, Compose—while preserving supported raw JSON access and complete-candidate validation. Then extend the same vocabulary to Introspection modes and subgraphs.

Third: introduce the small Text modifier set with the complete runtime/export/trace contract. Validate ordering, bypass versus removal, branch fan-out, output targeting, invalid modifiers, round-trip sharing, stale detection, and undo.

For the inspector, cover a sparse source, Response Plan with inherited/overridden/missing binding, Text Rules in Text and Draft modes, JSON Decode's schema, Select Fields, State Curve, Memory Commit, a subgraph instance and boundary, and read-only library inspection. Verify selection changes retain invalid drafts and edits keep their qualified node identity. Current tests rely on Compact Card in Details and must move to menu/shortcut coverage. Visually check 220px, 258px, wider panels, light/dark themes, keyboard use, and long text/errors.

### Correctness issue discovered during review

The actual projector labels JSON Decode's schema as `json-value`, while the operation requires raw JSON text. Saving normal object JSON can therefore send an object where a string is required: [workspace-preparation.js](../../src/ui/workspace-preparation.js#L205), [nodes.js](../../src/workflow/operations/nodes.js#L80). Existing panel tests manually supply `json-text`, which misses the real projection path. A read-only probe confirmed the mismatch. Fix this with a real projector-to-editor regression test as a separate correctness change, or as an explicit part of the editor overhaul. It remains unfixed in this design review.

## Evidence limits

All nine supplied screenshots were visually reviewed. Official Gaea property editor, toolbar, and modifier documentation was consulted. Current Lattice inspector, descriptors, context commands, execution planning, and serialization were reviewed; read-only probes checked disabled/disconnected behavior and schema projection. Gaea itself was not run, and unlabeled icons were not assigned speculative meanings. No product files or existing working changes were edited.
