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

## Recovery and retained worktrees

Recovery directory: `F:/git/SillyCanvas/.tmp/integration-preservation-2026-10-10/`.

- Ten complete TAR snapshots: original primary checkout and all nine linked sources. Includes tracked, untracked and useful ignored evidence; excludes Git administration and installed dependencies.
- `manifest.json`, separate completed shelf manifest, and per-checkout file SHA-256 manifests. `verification.json` records archive/member/file integrity, exact source tips and unchanged source state. All ten archives and nine linked sources verified.
- Verified complete `all-refs.bundle` plus shelf-era bundle. Final publication produces `all-refs-final.bundle` containing the integrated Main and retained source refs, with its SHA-256 recorded in `handoff.json`.
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
