# Lattice native-only completion — 0.21.0

The authorized cleanup replaces the mixed editor/runtime with the current typed workflow system and makes the approved workspace the fresh default. The later approved Ember handoff supplies the default colors; the original prototype still supplies the layout. Publication follows the completed release gates and independent final review recorded here.

Implementation checkout: `C:/Users/Keptin/.codex/worktrees/lattice-native-finish/SillyCanvas`, branch `codex/lattice-native-finish`. Starting checkpoint: `768128b08a2ce81c96277664e70610081062ae15`. Documentation main through `ac69a2d86cff06496d0f691e86152c1df74423e3` was incorporated normally. The old implementation checkout was left intact.

## Resulting behavior

- One supported document format, schema3/runtime2, and current workflow/subgraph package envelopes. Retired engines, adapters, routing contracts, globals, commands, compiler/support modules and strictly retired tests are removed. There is no conversion or compatibility fallback.
- Fresh Lattice settings use Structured guidance, disabled and unassigned. Old settings remain unread and untouched. Startup does not arm generation, Send, Apply or a model request.
- The current controller handles qualified root/child/library edits, captured transactions, one-step history, imports, portable clipboard, managers and ordinary presentation. Source freshness, private ownership, cancellation, addressed results and explicit reviewed Apply remain covered.
- Root node/group movement updates authored presentation in one captured history step; child/shared/library presentation stays local. Saved activation, root replacement guards, group enclosure/collapse, wrapper ownership reconciliation and memberless current groups retain their current semantics.
- Ember inherits host text, quiet text, accent, surfaces and border tokens. Canvas is `#0f0f0f`; ordinary nodes use fill-only `rgba(40,40,40,.75)`, six-pixel corners, no ordinary border and the approved soft shadow. Original semantic labels/icons mix 68/32 with host body; pin dots mix 86/14; wire hues stay unchanged. Selection, running, completion and failure retain their semantic priority. Explicit theme and presentation controls remain meaningful.
- Public guides and twenty sanitized production screenshots describe the current UI. Versioned production imports, manifest, package and built assets are 0.21.0. LICENSE and third-party attribution are retained.

## Verified release evidence

Production `dist/lattice-ui.js` SHA256: `5587a5e84b422b342d27253e88ae8089226e2fb0bf3e5fcd4263d93f842ed76c`.

| Gate | Result |
| --- | --- |
| Full current Node suite | 94/94 test files passed. |
| Final CSS correction | Three affected component test files / twenty subtests passed after the final run-summary cascade correction. |
| Svelte / production build | Zero errors and warnings; 139 modules; JS 226.66 kB, CSS 27.40 kB. |
| Installed dependency / version audit | 207 versioned local imports; self-contained UI and one native domain module graph. |
| Final complete browser suite | 125/125 passed, including four Ember cases, live host-variable inheritance, actual zero-call completion/failure, qualified editing and Apply/cancellation safeguards. |
| Clean installed-copy smoke | 72 local requests; zero API/provider calls, missing resources or browser errors. No developer UI source or node_modules required. |
| Production workspace captures | 15/15 cases: four widths, DPR1/1.25/2/4, compact cards, purpose flyout, child/tab join and genuine zero-request running/failure. |
| Ember reference captures | Actual production full workspace, enlarged complete cards and selected JSON failure; approved token arithmetic, graph/camera separation and zero provider calls checked. |
| Documentation | Twenty fresh images; seven guides, 107 local links and all sixteen operations checked. Independent visual QA clear; two image alt-text mismatches corrected. |
| Canvas benchmark | 36 samples: 100/250 current Compose nodes, Ember/Parchment/Neon, zoom1/2.2, wheel/pan/multi-drag. Maximum handler p95 0.2 ms, frame p95 16.8 ms; zero height reads or extra preparations; all keyed cards/wires retained; no browser errors. One frame exceeded25 ms in the250-node Neon wheel sample, whose frame p95 remained16.7 ms. |
| Final source / whitespace review | Independent final review records resolved findings and limitations; normal Git whitespace check passes. |

The full94-file Node run preceded the final CSS-only usage-summary specificity correction. The three affected component files and the complete type/build/asset/browser pipeline were rerun afterward. This sequence is deliberate; the original failing browser evidence remains in the local logs.

The benchmark measures current prepared Compose cards, one named Text chain, one preparation per admission and thirty animation frames per sample. Historical benchmarks using a different graph format are not a matched speed comparison.

## Evidence and limits

Ignored replay evidence remains in this attached worktree: `.lattice-check-ember-final.log` (full Node suite and the discovered cascade failure), `.lattice-check-ember-stable.log` (final affected tests and complete rebuilt browser pipeline), `.lattice-smoke-ember-final.log`, `.lattice-capture-ember-final.log`, `.lattice-ember-visual-final.log`, `.lattice-docs-capture-ember-final.log`, `.lattice-benchmark-ember-final.log`, `benchmark-results/visuals/metrics.json`, `benchmark-results/ember-visuals/metrics.json`, `benchmark-results/documentation-capture.json` and `benchmark-results/latest.json`.

Actual local SillyTavern public base CSS was exercised through a CSS-only proxy with secondary resource imports omitted. Installed extension manifest routes returned403, so an actual installed-host overlay could not be inspected through those routes. The clean copied-install smoke independently verifies the release dependency graph, public host helpers, launchers and fresh production mounting. No private host chat/settings/credentials were read and no live provider calls were made.

The immutable Ember approval JSON and two approved reference images are retained under `docs/superpowers/handoffs/2026-10-09-ember-theme-*` and `docs/images/themes/`. Product captures are separate. The approved prototype SHA256 remains `C89442A03084032D95BD55668CFAA0AF3E2577FFC916F393F516A4D6089558A8`.

## Integration and preservation

Normal main publication and exact GitHub SHA verification are ROOT's final integration steps, followed by a safe fast-forward of `F:/git/SillyCanvas`. The primary checkout's nineteen unrelated files and four adopted Ember originals have separate preservation manifests and are checked before and after that fast-forward. No reset, clean, force push or unrelated-file deletion is part of this release.

The separately authorized “Improve node connection lines” work remains in its own checkout. It integrates the exact published main revision afterward; its new line/comment features are not included in this cleanup.

See the [final review](../reviews/2026-10-09-lattice-native-only-final-review.md), [continuation ledger](2026-10-09-lattice-finish-progress.md), [UI completion](2026-10-09-lattice-ui-completion.md), [tools completion](2026-10-09-lattice-tools-tests-completion.md), and [Ember approval](2026-10-09-ember-theme-approved.md).
