# Approved artifact pin and wire design

User approved the Ember preview at `C:/Users/Keptin/.codex/visualizations/2026/10/10/01a126b7-a7c0-7833-bb8f-73570c0fd061/ember-triangle-pin-preview.html`, then authorized integration using a worktree on October 10, 2026.

- Preserve authored node positions and existing node/card layouts.
- Settled and snapped connection paths have 25 graph-pixel horizontal leads from each pin, compact rounded turns, and a literal straight middle span. Route directly, including backward and steep connections; no obstacle or perimeter lanes.
- Preserve endpoint side semantics, zoom invariance, shared visible/hit geometry, stable near-coincident cases, and finite negative/fractional/extreme coordinates. Degenerate cases may use a bounded continuous local fallback.
- Free pointer previews remain source anchored; no imaginary arrival pin.
- Fixed type geometry across every theme and custom theme style: Context filled circle, Guidance diamond, Draft pentagon, Patches upright equilateral triangle, Candidate ring with center dot, Text horizontal capsule, Data square.
- Approved glyphs use 0.5625 of the original 11px geometry, including strokes and type-specific proportions. Keep existing 24px interactive pin targets.
- Center pins vertically with the visible label lettering, and measure wire anchors at those centers. Reconcile alignment after font/theme changes without changing node coordinates.
- Default type colors: Context #f0e442; Guidance #cc79a7; Draft #7fd8c5; Patches #ed8956; Candidate #b49af2; Text #e69f00; Data #56b4e9.
- Wires adopt their artifact pin color. Harbor and Signal may retain their accessible type palettes, contrast correction, wire patterns and state cues, but cannot redefine type shapes.
- Use the same shape source for live nodes, example thumbnails and the theme legend. Only the seven live ArtifactKinds appear in the legend; no obsolete Findings entry.
- Redundant wire type labels are hidden normally and available on hover/selection; retain accessible connection descriptions.
- No changes to graph execution, persisted node positions, transaction handling or authored comment colors.
