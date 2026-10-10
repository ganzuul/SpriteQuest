# Details panel overhaul

The user authorized autonomous implementation of the reviewed design on October 9, 2026, with continuous correctness and visual/UX verification in a worktree. This spec makes the approved research concrete.

## Editing surface

The selected node has one identity header with family icon/color, an editable alias/name, and secondary management commands. Keep the canonical name only when an alias differs. F2/Rename focuses the title editor. Compact Card appears only in the graph context menu and graph-focused Shift+C, never while typing or in the inspector overflow. Disable/enable retains the current execution-stop semantics and remains a graph command; show a clear Blocks run state when disabled. Duplicate/Delete remain available in secondary commands.

Place node controls before metadata. Use compact native numeric rows, labeled boolean switches, short segmented choices where appropriate, dropdowns for longer choices, and generous prose editors. Use purpose-based groups and conditional settings, including every Introspection mode, boundary, and exposed subgraph control. Model bindings collapse to an accurate inherited/override summary, but missing bindings and validation failures remain visible and open the relevant group. Do not show unchanged Effective/Saved metadata under every field.

Use existing theme variables and family colors, readable labels, quiet surfaces, and keyboard-accessible interactions. Support the inspector's 220px minimum, 258px default, and 520px maximum, light/dark themes, long names/errors, read-only library semantics, and separately permitted presentation edits. Keep invalid drafts scoped to qualified node addresses and preserve acknowledgment/revision safety. Scalar changes retain on-change commit, and structured edits retain explicit Save.

## Structured editing

Provide schema-aware row editors for Text Rules, Pattern Scan rules where applicable, Select Fields, Compose sections, Context Join slots, and numeric State values/durations. Preserve all supported value shapes and options through a raw JSON editing fallback. Structured and raw views share one draft, switching does not lose invalid content, and save always validates a complete candidate. JSON Decode schema is raw JSON text, not an object; fix the real projection path and add a regression test through projector and editor.

## Modifiers

Store an ordered optional node.modifiers array of versioned entries: { id, type, version: 1, enabled, settings }. The initial types are trim (edges), whitespace (explicit line-ending/trailing-space/blank-line options), wrap (literal prefix/suffix), replace (one literal pattern, replacement, case/occurrence policy), and unwrap-fence (one enclosing Markdown fence). Support only nodes with exactly one Text output initially. Data field selection/guards remain explicit existing operations until a separately typed extension is justified. Do not modify Draft, Patches, typed Introspection Data, Guidance, terminal operations, or unsupported outputs.

Every modifier has a stable local ID, ordered execution, on/off, remove, and accessible reorder. Expose quick toggles for common modifiers and a compact configuration strip only when applicable. All changes use existing graph-edit undo/redo and read-only capability checks. Show active modifier names/count on ordinary and compact canvas cards. Apply before downstream consumers and artifact capture, preserving an inspectable raw output and applied modifier trace. A local deterministic preview uses a recorded source without rerunning a paid model stage; display freshness accurately.

Modifier admission validates exact known type/version/settings, bounded size/count, unique IDs, supported output, and enabled boolean. Fail on unknown/incompatible data rather than ignoring it. Preserve modifier semantics in exports/imports, clipboard/subgraph composition, graph signatures, and definition hashes. Existing nodes without modifiers behave identically. Authored invalid modifiers are rejected before model requests or writes.

## Verification and completion

Meaningful tests cover the schema mismatch, drafts/read-only/overrides, mode grouping, menu/shortcut, modifier order and exact text transforms, invalid admission, disabled versus removed entries, undo/redo, fan-out and downstream output, raw/modified recording, portable round-trip, definition/signature freshness, and forbidden output types. Run the repository's full unit, type, build, asset, and browser checks. Inspect live panels at 220/258/520px and light/dark appearances, including long and failed states. Fix failures and review findings before marking the goal complete. Keep the worktree and reviewable branch; do not merge/publish as part of this authorization.
