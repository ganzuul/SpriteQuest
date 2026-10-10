# Legacy Removal Implementation Plan

> **For agentic workers:** Use the approved audit and independent file ownership below. Apply test-first changes for behavior, then run the integrated gates. Track completion here.

**Goal:** Remove the pre-unified product paths while preserving unified execution and recoverable user data.

**Architecture:** Unified workflows become the only executable/importable roots and the only Send assignment. Existing schema-3 Pre/Post roots move to a non-executable archive that can be exported; pinned stage-specific definitions and shared node engines retain their current identity. Old catalogs, starter factories, secondary executors and unused UI paths are deleted.

**Tech stack:** JavaScript ES modules, Svelte 5, Node 24, node:test, Playwright, Vite.

**Spec:** [Approved removal audit](../../legacy-removal-audit.md). The user's approval authorizes implementation and necessary routine choices; no additional approval gate is needed.

## Constraints and interfaces

- Work in the attached `legacy-removal` checkout, seeded with the existing workspace edits. Do not revert another contributor's changes.
- Only `native-unified` roots execute or import. Shared structural validators continue to admit Pre/Post bodies for saved pinned helpers; phase vocabulary remains Preparation/Response.
- The only live assignment is `nativeBindings.workflowGraphId`. Archived original roots/bindings stay plain bounded data under `archivedWorkflows`; provide a portable JSON download without local credentials/profile selectors.
- New/fresh workflows use `unified-basic`. Archive migration does not generate, execute, publish or silently reassign a workflow.
- Keep typed sources, private actor authority, target previews, cancellation, reviewed publication and accepted persistence. Keep shared patch/reference/compactor engines and artifact results until independently migrated.
- No paid providers, live chat edits, push or merge is required.

## Review focus

1. A saved active Pre/Post root must not prevent startup, disappear, or run after migration.
2. A saved unified assignment must remain correct while another editor tab is selected.
3. Apply/Reject must act only on the current root's authoritative Review / Publish result.
4. Stage-specific pinned helpers must retain hashes, references and fixed-stage validation.
5. Valuable privacy/freshness/repair tests must survive fixture replacement rather than disappearing with legacy suites.

## Tasks

### 1. Saved-data handling and root admission — root owner

Files: `src/state.js`, `src/library.js`, `src/workflow/contracts.js`, `src/workflow/packages.js`, structural/root admission call sites and settings/admission tests.

- [x] Write and run a failing migration test: a schema-3 legacy root is archived byte-for-byte, no longer active/assigned, and a disabled/unassigned unified starter loads without host effects beyond saving the migration.
- [x] Implement cold archive admission/export; preserve existing unified roots/assignments and malformed-data rejection. Add idempotence, accessor/unsafe-data and mixed-registry cases incrementally.
- [x] Restrict execution/import root admission to unified while retaining structural helper admission; port generic pure-runtime tests to unified fixtures where their root behavior is still supported.
- [x] Verify settings, import/export, definition identity and current admission tests.

### 2. Host/runtime retirement — runtime worker

Files: `src/workflow/host.js`, `src/workflow/runtime.js`, `src/run.js`, run-related types and directly affected host/runtime tests.

- [x] Demonstrate with a failing behavior test that legacy assigned roots cannot execute on Send; unified Send and target previews remain operational.
- [x] Remove public `runPre`/`runPost`, fallback Pre execution, direct terminal Guidance installation, immediate legacy Memory settlement and eager legacy model preflight.
- [x] Simplify unified-only facade and host routing; retain shared output ABI, model/privacy authority, cancellation, native prompt cleanup and settlement.
- [x] Port or retire direct legacy host tests according to the approved audit; verify unified host/runtime and retained shared behavior.

### 3. Unified UI and recovery — UI worker

Files: `index.js`, `style.css`, `src/ui/**` except storage setup, `ui/**` except Workflow Data/Fast settings components, UI/browser tests directly related to these changes.

- [x] Write and run failing tests for unified Apply/Reject authority and assigned-graph cancellation when another editor graph is open.
- [x] Remove legacy creation/assignment/phase prompt/full root Run UI and dispatch; keep Send, Stop, Run to here and node Stage controls.
- [x] Add an export command only when `archivedWorkflows` has recoverable entries; use root owner's `exportArchivedWorkflows()` API.
- [x] Remove audited unused helpers/CSS and obsolete secondary shelf/control paths, updating corresponding fixtures rather than adding replacement systems.
- [x] Verify UI/browser tests and types while preserving concurrent Workflow Data terminology changes.

### 4. Catalogs, second executor, docs/tools — catalog worker

Files: `src/workflow/starters.js`, `src/workflow/examples.js`, old catalog/library/root factory/Introspection manifest modules, old example JSON files, legacy-specific tests/tools, current operator docs/capture scripts.

- [x] Update the example/starter behavior test to require independent unified copies only; run it failing before removing legacy catalog inputs.
- [x] Delete the approved old packages/generators/standalone executor and unused root factories. Keep the five reusable subgraph definitions initially for pinned-stage compatibility; remove their old root wrappers.
- [x] Replace legacy test conveniences with a test-only fixture helper where needed; preserve consumed-memory freshness coverage.
- [x] Retire old provider soak harness and replace capture/benchmark starter expectations. Rewrite current guides for unified-only roots and archive recovery; retain historical evidence and shared node reference sections.
- [x] Verify examples, docs links, tools and catalog-dependent browser expectations.

### 5. Integration and broad validation — root owner

- [x] Reconcile independent changes and remaining generic test fixtures; scan product code for removed commands, bindings, runners and catalog imports.
- [x] Run `npm test`, `npm run check:types`, `npm run build`, `npm run check:assets`, `npm run test:browser`, documentation and installation smoke checks.
- [x] Request independent code review; resolve material findings and repeat only affected gates.
- [x] Transfer the reviewed task delta back to the primary workspace with baseline-aware conflict checks, preserving all other edits. Update the audit with completion evidence and report the exact retained shared compatibility boundaries.

## Verification record

- Clean full unit run: **236/236 test files** passed after retiring unsupported fixtures and porting retained behaviors.
- Browser coverage: **269/269 unique cases** verified; 147 unaffected broad-run passes plus 122 current affected-suite cases. All 25 obsolete fixture failures from the initial broad run have passing reruns.
- Types: **0 errors, 0 warnings**. Distribution rebuilt successfully. Assets: **489 versioned local imports** verified.
- Documentation: **10 guides, 211 links, 75 operations, 20 screenshots** checked. Captures: 19 documentation screenshots, 15 workspace cases and three Ember images passed.
- Installation smoke: fresh unified-only settings, **zero API/provider requests**, no errors or missing resources.
- Independent review: resolved the sole finding (Fast Decision selectors in portable recovery export); nested definitions and exposed overrides covered without modifying archived originals.
- Delivery: 253 task files matched the verified worktree after transfer, including 72 deletions; zero baseline conflicts. Concurrent Workflow Data/launcher changes and unrelated audit/Memory Recall documents preserved. Primary asset/documentation checks and installation smoke passed after copying.
