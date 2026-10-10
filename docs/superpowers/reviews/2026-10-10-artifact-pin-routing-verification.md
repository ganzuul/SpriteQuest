# Artifact pin and routing verification

Plan: `docs/superpowers/plans/2026-10-10-artifact-pin-routing.md`
Specification: `docs/superpowers/specs/2026-10-10-artifact-pin-routing-design.md`
Branch: `codex/typed-pin-routing`, managed worktree from 7d1c0cf8.

## Implementation evidence

- Routing regressions observed RED before implementation, then GREEN: 25px horizontal leads, compact rounded turns, a literal straight middle, bounded level returns, near-coincident continuity, all endpoint sides and finite extreme coordinates. Free pointer previews retain their single source-anchored curve.
- Seven shared SVG glyphs supply live nodes, example thumbnails and the theme legend. All eight themes and custom corner styles preserve glyph geometry, 0.5625 scale and 24px pin interaction targets. Harbor and Signal retain their accessible palettes and wire patterns.
- Real canvas tests observed RED→GREEN for typed connection previews and wire label associations. Browser tests observed resting labels hidden and disclosure on hover/selection.
- Font-aware alignment places the interactive wrapper, visible glyph and measured cable anchor at the visible lettering center without changing authored node coordinates.

## Independent review and repair

The whole-change review found no blocking issues and two narrow geometry findings. Both were reproduced with independent failing regressions and fixed:

1. A wrapped Arial label containing lowercase `xxxx` followed by uppercase `WWWW` used whole-string ascent and placed the pin 1px too high. The helper now measures the first and last rendered line separately. Ordinary single-line labels avoid character scanning.
2. A same-side level route could reverse collinearly at its arrival. Shallow return activation now considers a reversal at either endpoint, with the existing smooth transition; ordinary opposite-side geometry is unchanged.

The first full implementation suite exposed a superseded CSS expectation that pins always use the row center. It now verifies the measured text offset and unchanged 24px target. A browser fixture identifier containing spaces was corrected to a legal name before the final run.

## Final checks

- `npm test`: **241/241 test files passed** on the final implementation tree.
- `npm run check:types`: 0 errors, 0 warnings.
- `npm run build`: success; checked-in UI JavaScript and CSS regenerated.
- `npm run check:assets`: 493 versioned local imports verified.
- Focused Chromium coverage: **28/28 passed** across artifact pins, accessible themes, Ember, connection curves, wire presentation, node connections and the native canvas bridge.
- Browser coverage includes all eight themes, theme/font transitions, wrapped labels, multiple zooms, backward and steep wires, connection gestures, wire selection/deletion, typed reroutes, compatibility feedback and label disclosure.
- Actual Ember, Harbor and Signal screenshots inspected: shared small shapes, aligned lettering and matched wire/pin colors. No authored node movement.
- `git diff --check`: clean.

The browser run used an isolated local server on port 4186 because the user's existing server occupied 4178. Test logs and screenshots are retained in the task's external visualization directory. No generated browser results are included in the commit.

Integration target: local `main`, fast-forward from the verified worktree commit.
