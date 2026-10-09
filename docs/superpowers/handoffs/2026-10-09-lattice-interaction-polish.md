# Lattice interaction polish — 0.22.1

Base: `ca19c51d90e096b208d7d9cc84d7f3246d6fec7c` (0.22.0). Implementation uses the existing keyed Svelte workspace and card/wire layers.

## Result

- The native chat-bar launcher displays the existing Lattice SVG in `leftSendForm`. It waits for that host anchor and handles remounts without duplicating the button.
- Canvas node search begins with the search field. Outside pointer-down and Escape dismiss it; visible title, long caption and Close button are removed. Accessible names, compatible-port choice and context-sensitive behavior remain.
- Node selection paints directly, with one selection callback and no complete card, geometry or connection rebuild. Camera events update current view state immediately and defer saved-view serialization until a save boundary. Explicit view edits/history still publish settings snapshots synchronously.
- Drag frames route only incident connections. Full card draws classify graph tables once per batch while retaining each node, card and named-pin validation. The batch captures the exact checked graph reference.
- Shelf rows are 28px tall, down from the measured 43px, with centered text/icons and fixed 110px width. The shelf reserves scrollbar room, hides horizontal overflow and uses a thin dark vertical scrollbar. The selected tab's right foot is removed while its canvas join remains continuous.
- Subgraph/library icons use closed cube faces; Surface uses a perspective tile. Hovered pins highlight, and held-wire targets show pending, compatible or invalid feedback.
- A free connection preview uses one source-anchored cubic with a horizontal departure that grows with pull distance. It switches to the existing settled route only for a confirmed compatible pin.
- The Details panel has a left-edge pointer/keyboard handle. Width is retained per graph view, clamped to available desktop space, and canceled drafts roll back. Narrow screens retain the stacked panel.
- Delete and Backspace delete selected editable nodes immediately, without a confirmation, with one-step Undo. Typed editors, blocking dialogs, read-only views and stale edit contexts retain their guards. Whole-workflow removal still has its separate confirmation.

## Review and regression fixes

Independent review identified and resolved an idle ghost surviving cancellation before its pending paint, stale persisted comment/portal presentation after deferring every serialization caller, and a switching graph-reference getter in the new card batch. Regression tests reproduce each before its fix. Camera/selection are the only serialization callers opting into deferral.

## Verification

Final `npm run check` exited 0: 109/109 Node test files, zero Svelte errors/warnings, production build, 223 versioned local imports, and 147/147 browser tests. Installed-copy smoke passed with 76 local requests, zero missing assets, errors, API requests or provider calls, and a loaded left-side SVG launcher.

Visual checks passed: seven new interaction captures, 15 standard workspace cases, three approved Ember cases, and 20 refreshed documentation screenshots. Documentation checks passed for seven documents, 109 local links and 16 operations. Independent review inspected the new interaction and Ember images; the root also inspected search, pin-target, chat-bar and documentation shelf captures. Synthetic fixtures and tools block live provider requests.

The matched full-workspace profiler used the actual controller with Details and Preview mounted, 25/100/250-node fixtures, 30 frames and 12 input events per frame for gestures. The repeated 250-node comparison is:

| Measurement | 0.22.0 | 0.22.1 |
| --- | ---: | ---: |
| Selection handler p95 | 334.3ms | 13.4ms |
| Selection frame p95 | 350ms | 16.7ms |
| Selection full renders / pin measurements / clones | 60 / 67,500 / 1,812,600 | 0 / 0 / 0 |
| Drag pointer-down handler | 158.8ms | 8.1ms |
| Drag release handler | 2,259.5ms | 1,112.1ms |
| Pan / zoom / drag frame p95 | 16.7 / 16.8 / 16.7ms | 16.8 / 16.7 / 16.7ms |

These timings include instrumentation overhead and are synthetic measurements, not a device-wide frame-rate guarantee. Pan/zoom were already frame-coalesced in the baseline; the change removes repeated serialization and measurement work rather than demonstrating a large timing improvement in those cases. Large-graph drag release still pays a material transaction/preparation cost. A first-threshold drag frame reached 183.3ms and one pan frame reached 33.3ms in the final profile; rare drops remain. No node/wire identities were lost and no provider requests occurred. The separate 36-sample renderer matrix exercises camera and multi-drag with auxiliary panes hidden; it is not the full-controller measurement. That matrix passed with p95 frames at most 16.8ms, zero frames over 25ms, zero height reads, and retained node/wire identity.

Reproduce with `node tools/profile-workspace-interactions.mjs --label=final`, `node tools/capture-interaction-polish.mjs`, `npm run capture`, `node tools/capture-ember-theme.mjs --execute`, `node tools/capture-documentation.mjs`, `node tools/check-documentation.mjs`, `npm run smoke:install`, and `npm run benchmark -- --quick`. Ignored evidence is under `benchmark-results/`.

The approved Ember token/reference files and the primary checkout's 19 unrelated untracked files are preserved. The implementation and verification run in the attached managed worktree.
