# Outstanding worktree integration — 2026-10-10

## Result and handoff

All nine linked worktrees are included in the integration. The user initially excluded the active compact shelf, then included its completed scale, opacity, bold-label and icon work. The user subsequently requested hands-on testing of merged and pushed Main before cleanup. **Keep all nine checkouts, source branches and recovery archives until the user confirms cleanup.**

Starting local and GitHub Main: `7d1c0cf8b474484622152b7b14b86cce51ed8822`, release 0.27.0. Source merges were sequential on `codex/integrate-outstanding-2026-10-10`; independent intent audits and reviews ran in parallel. **Verified integration `6d9d0cc6464f9048aa1921340f106c812968d6a0` was fast-forwarded into local Main and normally pushed to GitHub.** Network-enabled GitHub CLI confirmed that exact SHA; local/origin Main had zero divergence. The primary `F:/git/SillyCanvas` checkout is now on `main`. This documentation receipt follows the functional integration; the preservation directory's `handoff.json` records the final confirmed local/GitHub SHA and complete bundle hash. Cleanup remains deferred until user acceptance.

## Source accounting

| Linked checkout | Preserved source tip | Integration decision |
| --- | --- | --- |
| canvas-memory-recall | `fc281fe65895dc0c79e9ad2b7d6039cf58031fbb` | Real merge `e5336d0`; current-document lifecycle, File access and shared scoped Recall retained. |
| node-profile-dropdowns | `2486c4442098df5e0b0a8288a1e4136c461c4b00` | Real merge `f42a897`; themed selectors, Active defaults and advanced Details retained; Fast/profile retirement reconciled with modern documents and curriculum. |
| workflow-data-node-defaults | `203335173169dae9a78106bed91c5f45a0daa1e5` | Real merge `3490e52`; automatic data provisioning and setup DTOs use the captured editable scope and current document authority. |
| consolidated-menus | `4933a7e7e9a3fcf8166e85a40de3d907825b9956` | Real merge `24d7a16`; File/Edit/View/Graph/Workflow/Help, panels, reports and owned runtime activity reconciled with modern File and Recall behavior. |
| typed-pin-routing | `58f8a0380b41921302f50cca83bcc0046d787ea8` | Real merge `7425e87`; seven shared glyphs, palettes, font/zoom alignment, 25px leads and direct middle routes; Recall card identity and geometry preserved. |
| compact-node-shelf | Original Main plus eight completed dirty files; captured as `50d28c18db8ba15753afa421d3946762056b1060` | Exact completed source snapshot committed on its source branch after preservation; real merge `0723ba0`. Shelf/drawers use 80% geometry and matching 90%-control translucent surfaces, bold labels and distinct operation icons. |
| details-panel-overhaul | `1343e3ca8c8d9a339625dbd9a12c70b77dee1bfd` | Already in starting Main's ancestry; existing Details behavior retained. |
| workflow-unification | `7d1c0cf8b474484622152b7b14b86cce51ed8822` | Already starting Main; no unique source changes. Used for the unchanged Main baseline. |
| workflow-files | `d807155fbc27d7a4784b729579068ad8527981c1` plus dirty working state | Committed history already included; document lifecycle independently reconciled in `df2e3a3` and the Recall tip. Reviewed dirty deltas against modern Main: ported the unique consumed-Escape guard/test. Older launcher, naming, legacy execution and curriculum deltas were superseded by current implementations and retained in the full archive. |

All nine source tips are reachable from the integrated candidate. Reachability includes the shelf snapshot; it does not imply blindly replaying superseded source content.

## Conflict and review decisions

- Preserve schema-2 independent current documents, exact ownership tokens, guarded New/Open/Recent/Examples/Recovery, native Save versus fallback Download, local binding portability, and the shared Recall queue. Do not restore saved-root collection assignment or `runPre`/`runPost` execution.
- Retire Fast execution while preserving historical graphs, immutable dependency closures, scoped bindings and unreadable originals in cold recovery. Validate candidate settings and writable descriptors before changing settings or document authority. Descriptor-only recovery-array admission rejects getters, hidden/symbol metadata and nonstandard prototypes before executing historical methods; sparse holes and original entry identities survive.
- Retain the 30 modern lesson IDs and progression. Replace lesson 11's Fast judgment with ordinary Decision/Branch/optional Join, and lesson 29 with ordinary Decision and Confirm Events. True, false and unresolved results retain distinct behavior, per-actor visibility and publication requirements. Preserve the historical lesson-11 filename for package stability.
- Provision workflow-data defaults before file-session authority capture. Recursively include compiled helper scope data nodes. Preserve the four-argument creation-stage interface. Async data save, visibility save and creation recheck the original editor context after awaiting.
- Preserve modern File commands and captured Recall submenu actions in the six-menu renderer. Stop checks owned graph and document token. Native Send activity remains visible through generation and post-processing. Opening menus cancels existing canvas gestures/held Space pan; nested Escape returns focus to the parent; modal buttons cannot trigger capture-phase Recall hotkeys.
- Preserve Recall spacers, event isolation, card identity and status-only updates while adding typed glyphs and measured optical pin alignment. Pins keep their 24px hit areas. Replace superseded pseudo-element glyphs; theme legends, cards and thumbnails share one seven-kind glyph definition.
- Preserve the shelf's semantic catalog comparison and destruction cleanup. Add session/root/active-view/epoch insertion identity so sibling tabs and identical-ID document replacement cancel open or dragged shelf actions, while status/camera refreshes preserve browsing. Directional Input/Output icons are dispatched distinctly in both shelf choices and prepared cards.
- Normalize inherited 0.26 cache URLs to the installed 0.27 release. Rebuild assets from combined source; never select an old source branch bundle as the final asset.
- Preserve original Main-local audits before taking completed branch versions. Keep the original `work/` mockups untracked and untouched. Refresh operator navigation and synthetic documentation captures for the final combined UI.

Independent reviews covered document/File/Recall ownership, profile/data retirement, typed pins and Recall geometry, menus, insertion scopes, keyboard isolation and the subsequent review fixes. Material findings received targeted failing regressions before fixes.

## Verification evidence

Unchanged starting Main: **240/240 Node test files passed** in the unchanged workflow-unification checkout. Initial overlapping baseline output was excluded from that conclusion.

Focused integration evidence includes document/Recall/Escape checks, profile and data checks, 122 menu cases, 92 pin/routing/theme cases, 70 shelf cases, additional insertion-context cases, descriptor-admission regressions and modal/Space keyboard regressions. Logs are in `.tmp/integration-*.log`.

Final verification covers **263/263 Node test files and all 326 browser cases with passing results**. The full browser run passed 305 cases and exposed 21 obsolete expectations for approved menu labels, SVG pins, shelf geometry, wire-label visibility and the remastered example's selection default. After review and fixture correction, the unchanged test IDs passed 20/20 in a fresh-server `--last-failed` run. The renamed compact-return test passed separately together with the comment export roundtrip (2/2). No test was skipped to establish passing coverage. The subsequent recovery-prototype change also passed all 67 affected cases.

| Check | Command / environment | Result and log |
| --- | --- | --- |
| Full Node suite | `npm test` | 263/263 files; `.tmp/integration-final-node-green.log` |
| Recovery follow-up | Canonical `tools/node-test-host.mjs`; affected document, state, example, format and retirement files | 67 affected cases; `.tmp/integration-recovery-prototype-green.log` |
| Full browser suite | `CI=1 LATTICE_TEST_PORT=4199 npx playwright test --workers=2 --output=.tmp/integration-final-browser-results` | 305 passing / 21 stale expectations reviewed; `.tmp/integration-final-browser-green.log` |
| Corrected browser cases | `CI=1 LATTICE_TEST_PORT=4203 npx playwright test --last-failed --workers=2 --output=.tmp/integration-final-browser-rerun-results` (copied original `.last-run.json`) | 20/20; `.tmp/integration-final-browser-repaired-green.log` |
| Renamed compact return and export | Focused `comment-frames.spec.mjs` run on fresh port 4198 | 2/2; `.tmp/integration-comment-green.log` |
| Types | `npm run check:types` | 0 errors / 0 warnings; `.tmp/integration-publish-types.log` |
| Generated build | `npm run build` | 180 modules, regenerated combined assets; `.tmp/integration-publish-build.log` |
| Installed imports | `npm run check:assets` | 521 versioned local imports; `.tmp/integration-publish-assets.log` |
| Isolated installation | `npm run smoke:install` | Zero errors, missing assets, API requests or provider calls; `.tmp/integration-final-smoke-green.log` |
| Documentation capture | `node tools/capture-documentation.mjs` on isolated documentation port | 19 captures, zero errors / blocked requests; `.tmp/integration-final-doc-capture-green.log` |
| Documentation checker | `node tools/check-documentation.mjs` | 11 documents, 225 links, 74 operations, 20 screenshots; `.tmp/integration-final-doc-check-green.log` |
| Preservation and concurrent state | `node .tmp/verify-integration-preservation.mjs`; network-enabled `gh api repos/MentallyQuill/Lattice/branches/main --jq '.commit.sha'` | Ten archives and nine source checkouts verified; GitHub Main unchanged before publication |

Browser fixture updates preserve the original functional assertions. In particular, the compactor test now exercises select/compress explicitly and confirms its independently chosen connection survives mode changes; import acceptance still revokes the pending run and late authority. Current overview and shelf documentation screenshots were visually inspected.

## Source confirmation and menu repairs

After publication, the user requested a fresh source-by-source confirmation and reported dropdown rendering and heading-spacing defects, then requested icon colors from the original Gaea 2 references. Three independent audits compared all nine source tips and their useful dirty content with Main, beyond ancestry alone. Recall/document lifecycle, Details behavior, profile retirement, data defaults, typed routing, shelf appearance and all 30 curriculum lesson identities remain accounted for. The workflow-files archive retains superseded source implementations and the unique consumed-Escape change remains integrated. Ten original archives, nine source checkouts, the original evidence hashes and preserved Main-local files were verified again.

The confirmation found a Help omission: its modern inline dialog bypassed the original project-guide/reference links and reset-layout instructions. These are restored alongside the modern File, Workflow and Recall guidance. Browser checks verify both link destinations, their focus cycle, unchanged graph content and zero provider calls.

The dropdown defects were already present in the original `4933a7e` menu worktree; they were not caused by a lost merge. The reference chat is **Improve Lattice dropdown menus**, `01a1267c-f07f-7580-ab84-e7f2fab54f76`. Its eight Gaea 2 screenshots and approved menu captures were inspected directly.

- Every row rendered a `<kbd>`, even with no shortcut, and left host keycap paint intact. Shortcut text now has a scoped reset; rows without shortcuts use an empty decorative grid placeholder. Plain text, aligned rails and submenu carets survive hostile host keyboard CSS.
- Fixed 68/64px heading widths produced text gaps ranging from 26.1 to 49.8px at desktop width and wrapped Help at 360px. Content-based widths, a 44px minimum, 12px side padding normally and 10px on small screens give 28px desktop gaps and 24–25.8px at 360px. All six headings fit the narrow row; coarse-pointer targets remain at least 44×44px. This intentionally updates the original fixed-width spacing decision in response to the user's correction.
- Command-specific icon colors follow Gaea's selective pattern: yellow creation/comments, blue saving/configuration/help, green execution/reset, purple structural tools/Recall/options, teal workflow data and red deletion/stopping/cancellation. Ordinary editing icons remain neutral. Only decorative icons receive this metadata; labels, shortcut text, carets, check states and command ownership retain their behavior. Disabled icons remain muted. Theme application fits colors to both idle and hovered menu surfaces with at least 3:1 contrast, and Signal keeps a monochrome presentation.

A fresh complete run on published `0f74c4f` passed **263/263 Node files and 326/326 browser cases in a single run** (`.tmp/integration-confirm-node.log`, `.tmp/integration-confirm-browser.log`). Help repairs then passed four affected browser cases and five Node files. New failing browser regressions reproduced both reported dropdown/spacing defects and the missing icon colors before implementation; the three new cases passed after rebuilding.

The complete suites then passed **263/263 Node files and 329/329 browser cases in one fresh run** with the Help, shortcut, heading and icon repairs included. Independent review found two edge cases in the new palette: malformed historical Error/Text colors could throw, and hovering an enabled red icon on a custom `#4a4a4a` panel reduced contrast to 2.475:1. Both were reproduced before fixing. Built-in color fallbacks now tolerate malformed saved values, and palette fitting includes the composited 9% text hover overlay. After those safeguards, **11/11 affected Node files and 64/64 affected browser cases passed**, including actual hovered-row contrast on all eight presets and three custom light/gray surfaces. No tests were skipped.

| Confirmation check | Result | Evidence |
| --- | --- | --- |
| Complete Node and browser suites with UI repairs | 263/263 files; 329/329 cases | `.tmp/integration-confirm-final-node.log`, `.tmp/integration-confirm-final-browser.log` |
| Final theme/menu/Help/shortcut follow-up | 11/11 Node files; 64/64 browser cases | `.tmp/integration-confirm-followup-node.log`, `.tmp/integration-confirm-followup-browser.log` |
| Final types/build/assets | 0 errors, 0 warnings; 180 modules; 521 imports | `.tmp/integration-confirm-types.log`, `.tmp/integration-confirm-build.log`, `.tmp/integration-confirm-assets.log` |
| Fresh isolated installation | 0 errors, missing assets, API requests or provider calls | `.tmp/integration-confirm-smoke.log` |
| Documentation links/catalog | 11 documents, 225 links, 74 operations, 20 screenshots | `.tmp/integration-confirm-doc-check.log` |
| Source preservation | Ten archives and nine unchanged source checkouts | `.tmp/integration-confirm-preservation.log` |

Final visual captures, including host keycap CSS, are under `.tmp/integration-confirm-menu-visuals/`: File, View, Graph and Workflow dropdowns, desktop headers and a 360px layout. These were visually compared with the original reference. No known actionable source omission remains in the reviewed scope. All original worktrees and recovery evidence remain available for user testing. Automated checks do not replace testing the real operating-system pickers, host theme, provider and Send lifecycle.

## F fits and centers selection

During user testing, the user requested that a single **F** press fit and center the selection instead of preserving zoom. F now invokes Fit selection. View and context-menu shortcut hints advertise F, Help describes F and period as aliases, and the manual and quick start explain the combined action. Center selection remains a separate, unbound menu action that preserves zoom. With no selection, F uses the existing shelf-aware Fit graph behavior.

Fit selection now shares the measured bounds and gesture protections of centering: primary and multiple node selections, measured wire endpoints, folded cards and empty group frames use their displayed geometry. Camera changes commit without changing graph edits or selection. The capability check permits fitting wires and empty groups, including read-only views. Typing, command modifiers, repeated F events, closed canvases, open menus and active drags remain protected.

Failing tests first reproduced the previous F zoom behavior, the menu eligibility gap, folded-card invalid bounds and fitting during a drag. After implementation, an isolated copy of `c9e7b76` containing only this follow-up passed **263/263 Node files and 41/41 affected browser cases**. Two independent reviews found no actionable issues. Concurrent File-command edits in the primary checkout were preserved separately and excluded from the verified candidate and published bundle.

| Follow-up check | Result | Evidence |
| --- | --- | --- |
| Complete Node suite | 263/263 files | `.tmp/focus-fit-isolated-node.log` |
| Affected browser suite | 41/41 cases: camera, selection, shortcuts, context menus, consolidated menus and workspace panels | `.tmp/focus-fit-isolated-browser.log` |
| Types/build/assets | 0 errors and warnings; 180 modules; 521 imports | `.tmp/focus-fit-isolated-types.log`, `.tmp/focus-fit-isolated-build.log`, `.tmp/focus-fit-isolated-assets.log` |
| Isolated installation | 0 errors, missing assets, API requests or provider calls | `.tmp/focus-fit-isolated-smoke.log` |
| Documentation | 11 documents, 225 links, 74 operations, 20 screenshots | `.tmp/focus-fit-isolated-doc-check.log` |
| Preservation | Ten archives and nine source checkouts verified | `.tmp/focus-fit-preservation.log` |

The follow-up receipt `focus-fit-confirmation.json` records the published file blobs, exact Main SHA, hashed evidence and additional `all-refs-focus-fit.bundle`. The earlier menu repair receipt, bundle and handoff remain preserved. Worktree cleanup still requires user acceptance of pushed Main.

## Recovery and retained worktrees

Recovery directory: `F:/git/SillyCanvas/.tmp/integration-preservation-2026-10-10/`.

- Ten complete TAR snapshots: original primary checkout and all nine linked sources. Includes tracked, untracked and useful ignored evidence; excludes Git administration and installed dependencies.
- `manifest.json`, separate completed shelf manifest, and per-checkout file SHA-256 manifests. `verification.json` records archive/member/file integrity, exact source tips and unchanged source state. All ten archives and nine linked sources verified.
- Verified complete `all-refs.bundle` plus shelf-era bundle. Initial publication produced `all-refs-final.bundle` containing the integrated Main and retained source refs. The later confirmation preserves that bundle and the initial handoff, and records its repair commit, fresh evidence and `all-refs-confirmed.bundle` hash in `confirmation.json` and the updated `handoff.json`.
- Four original colliding audit/plan files retained under `primary-collisions/docs/`; original primary content also remains in its TAR. Original wire prototypes remain in `work/`.
- All source branch refs and all nine checkouts remain available during user testing. No worktree removal, branch deletion or force push is authorized by this handoff.

To recover a source, inspect its preserved branch first; extract its TAR into a separate directory to recover its uncommitted or ignored evidence. Keep the complete recovery directory together.

## Suggested hands-on checks before cleanup

1. Reload the installed extension from updated Main. Check the compact shelf, matching drawer transparency, bold labels, distinct icons, typed pins and wire alignment with your actual theme and font.
2. Exercise New/Open/Recent/Examples, unsaved-change cancellation, Save/Save As or Download, reopening and Recovery with your real file permissions.
3. Edit root and sibling subgraph scopes, create data-backed nodes, change Details/profile options, undo/redo, and switch tabs while shelf menus or drags are open.
4. Queue and cancel Recall through badges, menus, Details and hotkeys; check shared-set behavior, overview navigation and modal isolation.
5. Enable the open workflow, Send with your real provider/profile and data documents, use owned Stop, inspect Review/Publish and Apply/Reject. Confirm expected actor visibility and persistent effects.
6. Test your usual narrow/wide layouts, camera gestures and keyboard shortcuts. Report any regression while all original worktrees remain available; confirm cleanup only after acceptance.
