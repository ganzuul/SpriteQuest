# Blueprint connections and comments final review

The approved feature is integrated with native-only cleanup commit `d54281822b1b636fb77aa7406831f3bbd8b9f34b` as release 0.22.0. The review covered the direct spline renderer, comment model/components, qualified controller actions, presentation/history restoration, clipboard packages, and integration with the approved Ember theme.

The independent whole-feature review found no P1 issues and two P2 issues. Generic Delete/Cut and comment-only Paste/Duplicate inside owned subgraphs revised definition pins even though only annotations changed. Both are fixed: comment-only deletion uses a bounded atomic comment batch, and validated comment-only insertion preserves the exact owned snapshots. Executable selections retain the existing revision behavior.

The scoped independent re-review cleared both findings with no concrete regression introduced by the fixes. It independently ran 58 passing tests covering nested leaf and ancestor pins, execution signatures, live runtime references, one-step undo/redo, asynchronous stale captures, shared/library rejection, and mixed executable operations.

Review scope decisions: obstacle crossings are explicitly approved; wires may pass behind translucent cards. Existing execution routing, ownership rules, ordinary group movement, and native cleanup behavior remain the integration baseline. No additional behavior was deferred to avoid a known defect.

Focused browser acceptance passed all 12 cases. Four actual production captures at widths 1440 and 900 were inspected for forward/backward paths, pin highlighting, comment title/notes, frame bounds, and interior interaction. They recorded zero browser errors and provider calls, with the approved Ember fill, opaque card content, radius and shadow. Their UI bundle SHA-256 is `5311f79b57e15ae0cd696158bc20c3ea80ac82b070514a963226824ca11feee2`.

The renderer benchmark passed 36 scenarios across three themes, two zoom levels, and 100/250-node graphs. Gestures retained node/wire identities with no repeated graph preparation or geometry-height reads. The installed-copy smoke passed without developer UI source or node_modules, with no missing assets, browser errors, or provider calls.

The final `npm run check` passed all 102 Node test files, zero Svelte errors/warnings, the production build, 223 versioned local asset imports, and all 137 browser tests. Documentation validation also passed. The final rebuilt UI bundle matches the inspected capture hash above.

Release 0.22.0 was normally pushed to main as feature commit `6f7b5c6e7f7cd6a5cbde0990041a5ee6fab4c649`. The network-enabled GitHub CLI independently returned that exact SHA for remote main. This documentation follow-up records publication and completes the plan; it changes no release source or assets.
