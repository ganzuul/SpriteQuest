# SDD ledger — plan: docs/superpowers/plans/2026-10-07-svelte-ui-migration.md

## Execution ruling
- Native inline execution under blanket user approval. Windows PowerShell equivalents replace the Bash-only ledger helper scripts.
- Latest steering adds the verified ComfyUI selection contract to the approved migration.
- Baseline: dc5b603; branch codex/svelte-ui-migration; original main checkout and PomegranateUI remain untouched.

## Task 1 — started
- Establish existing Node tests, then development tooling and browser smoke harness.

Task 1: complete — existing baseline 37/37; installed dependency run 37/37; browser smoke 1/1. RED missing harness server; GREEN real UI/Output with zero page errors. Pinned development dependencies and lockfile; no production dependencies.

## Task 2 — started
- RED canvas-performance.test.mjs: zoom replaces the wire element. Camera fast path next.

Ruling: combine the camera and selection commits — both share the gesture controller, and selection work proceeded while the full Node suite ran — one interaction checkpoint replaces two commits.
Task 2: complete — camera RED→GREEN for wire identity, zero/magnitude/line wheel cases, anchoring and coalescing. Node 40/40 and camera/browser 2/2 passed before selection. Paint blur removed; active camera disables wire glow.
Task 3: complete — RED→GREEN plain/live marquee, modifier selection, middle pan, screen threshold, cancellation, folded-unit movement and Ctrl+A/Escape. Full Node suite 41/41 passed. Browser suite 7/7 passed; real rectangles cover all directions and transformed negative positions; multi-drag has one undo step; text controls keep shortcuts.
- Ruling: Select/Pan controls ship with the Svelte workbench in Task 6; the controller mode API is complete. Window mouse tracking preserves existing tests; pointer-cancel cleanup is active, and pointer capture integration follows in the Svelte layer.

## Task 4 — started
- Share graph analysis across card hooks; batch cached heights; preserve card identity during drag and update incident wires once per frame.

Task 4: complete — shared per-revision analysis; cached batch heights with ResizeObserver; stable native card/wire identity during drag; incident updates and host bounds cached during gestures. RED repeated endpoint reads and multi-drag remounts; GREEN. Full Node 42/42; after final bounds optimization camera/drag subset 3/3 and browser 9/9.
- Ruling: benchmark tool from Task 7 pulled forward to measure the architecture before Svelte. 36 samples: 250 nodes/496 wires; zoom handlers p95 0.2–0.4ms, zero card-height reads and zero analysis calls during gestures; median frames 16.7ms. Neon zoom2.2 had two initial frames above25ms/p9533.3, retained as final tuning concern. Raw measurements saved in benchmark-results/latest.json.
- Coordination brief received from workflow research: UI migration owns Svelte/rendering/gesture/inspector presentation. No changes to saved graph schema, state/compiler/run APIs, generation entry point or runtime lifecycle. New graph-analysis and geometry modules are presentation projections only. No cross-chat message sent.

## Task 5 — started
- Build a keyed Svelte canvas with explicit presentation props and callback actions; ship compiled extension asset without bundling duplicate domain modules.

Task 5: complete — native card/SVG builders replaced by keyed Svelte NodeCard/GroupCard/WireLayer/CanvasLayer with typed props and plain JS projections. Native callbacks own domain changes, frame-scheduled positions and endpoint measurements. Full-render card/port identity RED→GREEN; Node 43/43; browser10/10; svelte-check0errors/0warnings; build and asset check passed.
- Event ruling: native host gestures skip Svelte action buttons, preventing native/Svelte delegated handlers from toggling twice. Group mousedown compatibility and keyboard click actions retained; exact port label whitespace corrected without modifying test expectations.
- Standard DOM constructors supplied by a Node-only preloader for legacy jsdom tests. Self-contained compiled asset tracked; no domain modules bundled; recursive version tool tested RED→GREEN; third-party runtime license included. Pointer capture uses native compatibility mouse events, with synthetic-event fallback.
- Automatic approval review timed out once; retry succeeded. No action remains blocked.

## Task 6 — started
- Svelte workbench/toolbars/status/camera controls; focused named adapters retain specialized native form builders and the public UI facade.
Task 6: complete — Svelte workbench, accessible toolbar/status/history/camera controls and Select/Pan modes; native public facade and named domain-surface adapters. RED→GREEN missing controls, stale reopen selection, delayed rename, preview, model-list response, folded-group wiring, pending delete and destroy cleanup. Full Node44/44; affected model/token/undo3/3 after final guards; browser workbench5/5 and earlier whole suite11/11; types0errors/0warnings; local assets62 verified.
- Visual review: desktop1440×1000, narrow700×900, Neon and light Parchment; no errors, collapsed canvas or header overflow. Reduced-motion narrow capture verified. Capture tool saves ignored images and metrics.
- Ruling: Task5 ledger overstated pointer capture; HEAD did not contain it. Added and verified capture plus AbortController listener cleanup in Task6. Svelte callbacks keep native mouse-test compatibility; Space leaves focused buttons/links alone.
- Ruling: rich specialized library/inspector/preview/State/theme/model editors remain native behind explicit adapter names in src/ui/controller.js; Svelte owns actual card/wire and shell/control markup. Camera and token updates preserve native editor elements. Schema/compiler/run behavior is unchanged.
- Asset verifier now parses JS import syntax instead of a regex that mistook the literal menu command "import" for a runtime dependency.

## Task 7 — started
- Complete browser parity, matched performance, production install/reproducible-build evidence, documentation and fresh whole-branch review.
Task 7 acceptance checkpoint: full npm run check passed — Node44/44, browser21/21, types0errors/0warnings, production build81.94KB/24.22KB gzip, local assets62. Fresh installed copy0missing/0errors,35local requests, no node_modules/developer UI source, real index/launcher and one shared graph. Build SHA256 identical before/after check: 17335cbcbe86ab68b7c3b62647af1484ac4bfe5210d313b589e69cff05c803cc.
- Performance: final54samples with Svelte workbench/controls mounted, same1440×900 viewport and graph fixture. All camera p95≤0.2ms, frame median≤16.7/p95≤16.8,0intervals>25ms,0heightreads/analysiscalls, all DOM identities retained. Zoom readout causes1layout/frame; pan0layouts. One large Neon multi-drag interval>25ms; p95 still16.8ms. Raw original/final records tracked in docs/benchmarks.
- Ruling: final acceptance inspection found missing Shift-drag behavior despite earlier click tests. Added failing card and folded-group cases, fixed without changing Ctrl/Alt semantics; Node and real mouse/browser GREEN.
- Cache-busting version0.18.0 updates all native module queries and package/lock metadata. Domain/schema/runtime files only have mechanical version-string edits.
- Documentation now records actual Svelte/native boundaries, feature matrix, visual verification and local timing limits. Whole-branch review next; goal stays active.

## Final review — one fresh-context whole-branch assessment
- Reviewer migration_review inspected dc5b603..66c4f18 using the spec, plan and ledger. No Critical findings; six Important findings and one Minor. Exact-commit jsdom/Chromium probes reproduced the findings. Reviewer readiness was No at 66c4f18; corrections below are subsequent working-tree changes, verified by TDD rather than another review round.
- Final: fixed first card gesture after typing — workbench first-click Chromium case RED→GREEN; mouse exclusions now use event target, keyboard exclusions retain focused-element checks.
- Final: fixed stale inspector deletion — snapshot graph-switch Chromium case RED→GREEN; original graph/session captured and checked after confirmation.
- Final: fixed pending wheel cancellation — canvas-lifecycle wheel-then-resize case RED→GREEN; viewport reconciled and accepted camera view persisted before discarding the pending frame.
- Final: fixed folded-group click narrowing — selection-gestures stationary folded unit case RED→GREEN; release narrows only below movement threshold and preserves Shift-drag.
- Final: fixed delayed dynamic prompt refresh — workbench ST Refresh graph-switch/focused-input case RED→GREEN; graph/session, selection, connection and active editing guarded.
- Final: fixed delayed context-menu paste — workbench clipboard graph-switch case RED→GREEN; clipboard continuation cancelled after graph/session switch.
- Final: Ruling: re-grade unsuspended wire effects during marquee as Important — expensive Neon effects remain active during the newly requested drag-box workflow, directly conflicting with the smooth-gesture performance contract; include it in the same fix pass — cost if wrong: effects briefly disappear during a stationary empty-canvas click.
- Final: fixed active-marquee wire effects — selection-gestures interaction-class/release case RED→GREEN; common interaction state suppresses wire filters and release/cancel restore them.
- Final: Ruling: production provider responses/live SillyTavern writes declined by reviewer — accept mock-host verification because the approved acceptance contract excludes live generation/chat changes — cost if wrong: integration issues requiring validation in a real host may remain.
- Final: Ruling: universal performance declined by reviewer — retain measurements only for the documented local fixtures and deterministic identity/scheduling checks — cost if wrong: other devices or unusually complex graphs may still render slowly.
- Final whole-suite verification passed: npm run check, Node44/44, Chromium25/25, Svelte0errors/0warnings, build81.94KB/24.22KB gzip, assets62. Final fresh install35local requests, no missing files/page errors, real launchers/shared graph/Svelte root, no developer source or node_modules. Bundle SHA256 remains17335cbcbe86ab68b7c3b62647af1484ac4bfe5210d313b589e69cff05c803cc. git diff --check passed.
- Final: fixed all seven accepted review requirements — named regressions above RED→GREEN; whole suite Node44/44 and Chromium25/25. No deferred findings and no re-review dispatch.
- Final: Ruling: use the already-approved branch/draft-PR handoff — blanket authorization permits a reviewable PR on MentallyQuill/ComfyTavern without another integration menu; preserve the managed worktree and main checkout — cost if wrong: draft PR can be closed and the branch remains recoverable.
- Final source/review commit: a1e2332402ff13b56ee95ee0b0fda6722e478f51; pushed codex/svelte-ui-migration to the user's fork. Draft PR https://github.com/MentallyQuill/ComfyTavern/pull/1 is OPEN/DRAFT, base main; attached to this chat. Remote main remains the reviewed baseline dc5b603.
- Coordination authorization verified from the human's workflow-chat message granting total approval to coordinate with UI Performance. Shared stable commit, draft PR, exact Svelte/adapter paths and ownership boundaries; workflow work remains independent and outside this migration goal.
- Task 7: complete — all planned acceptance checks and the one whole-branch review/fix pass are done. The implementation and handoff are committed; only documentation closure and the native goal-complete status update remain.
- Preserve the ledger in docs/superpowers/reviews/2026-10-07-svelte-ui-migration-execution.md before removing only this plan's temporary workspace. Preserve the managed worktree, unrelated research and sibling plan directories.
