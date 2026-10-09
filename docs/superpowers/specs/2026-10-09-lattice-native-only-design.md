# Lattice native-only design

## Authorization and outcome

The user explicitly requested: “completely remove the old code”, “no need for legacy mode bloat”, and “no need for backwards compatibility—Lattice is an entirely new tool”. This supersedes the previous workspace spec's preservation of SillyCanvas and early native formats. The previously approved interactive Lattice proposal remains the visual target. Earlier authorization to implement autonomously, coordinate, verify, and push the completed work to main remains in force; this cleanup does not require another approval round.

Lattice has one workflow editor and one runtime. Fresh launch opens the approved workspace directly, with a Structured guidance example, unarmed and unassigned, and zero requests. Existing SillyCanvas data is neither read nor converted. No host data or credential files are deleted. Unrelated checkout files remain intact.

## Retained architecture

- Current typed schema-3/runtime-2 graphs, named endpoints, portals, pinned subgraphs, qualified graph tabs, explicit library revisions/local copies and atomic additive import.
- The optimized Svelte Canvas, cached native geometry, shared camera transforms, whole-body node dragging, compact aliases, pin/wire gestures and contextual creation.
- Per-node fixed SillyTavern connection/model bindings, compaction/planning/repair, deterministic operations, request bounds, cancellation, addressed recordings, and private reviewed Apply handles.
- SillyTavern owns its normal prompt, lorebooks and other extensions. Lattice can publish optional pre-generation guidance through the current host adapter; post-generation revisions require explicit Run and review.

Keep source/profile freshness, completion evidence, original swipes, rollback, bounded diagnostics, read-only scope guards, opaque review authority and zero implicit model calls. Supported host API/provider differences are integration requirements, not old Lattice compatibility.

## Removed architecture

Remove the schema-1 prompt-replacement compiler/executor and all Prompt/ST/History/Injection/Generate/Output/Decider/Lorebook/State/Memory legacy blocks; legacy append/prepend/merge/together/save/loop routing; prompt-order seeding/compilation; old thought/result displays and state windows; prompt folder/piece library; chat/character prompt-replacement bindings; mode switch; old inspectors/status rows/sidebars/control bars; all alternative legacy card/pin/render paths.

Remove schema-2/runtime-1 early workflows, migration code, schema-2 result shapes/selectors, ComfyTavern/SillyCanvas package/theme/clipboard/global aliases, raw graph file fallback and previous storage namespace reads. Retain MIT/upstream attribution and required third-party licenses. Historical research/review records are documentation, not shipped runtime support.

## Current contracts

- Workflow document: `schema:3`, `runtime:2`, `mode:'native-pre'|'native-post'`. These phase labels are current internal values; there is no user-selectable legacy/native mode.
- Portable workflow: `kind:'lattice-workflow'`, envelope `schema:2`, `minRuntime:2`, enclosing the current graph. Standalone subgraph: `kind:'lattice-subgraph'`, envelope `schema:1`, `minRuntime:2`. The subgraph's envelope schema 1 is current and must not be mistaken for the retired canvas.
- All portable admission uses the existing bounded plain-data validation, universal 2,000,000 UTF-8-byte package bound, safe exports, credential/profile stripping, exact dependency closure and unfinished-authoring support. Old brand/version/raw formats reject visibly without mutation.
- `src/workflow/document.js` exports `cloneWorkflowDocument(graph):Result<NativeGraph3>`: structurally validate only the current format, detach it and supply absent optional current containers. No upgrades or compatibility re-exports.
- `src/workflow/contracts.js` exports `isWorkflowGraph(graph):boolean`, `validateGraphStructure(graph)` and `validateWorkflow(graph,{phase}?)`. Classification never executes getters; old/malformed versions do not fall through to another engine.
- Current runtime results always use addressed bounded recordings and opaque terminal review handles; remove schema-dependent legacy result branches.
- Clipboard contains current portable workflow fragments and uses current insertion/transactions. Preserve selected-node identity remapping, definition closure, role bindings, placement and one-step undo; no old clipboard readers.

All four examples generate current documents directly. Scene guidance remains two auxiliary calls; Reviewed AI De-slop one; Literal cleanup and Structured guidance zero. No installation assigns a phase or arms generation.

## State and host facade

Store only `extensionSettings.lattice` with `schema:1`, `enabled:false`, current graph table/active id, nullable `nativeBindings` pre/post ids, subgraph definitions and UI/workspace state. Remove `workflowMode`, prompt folders and legacy settings. First initialization installs/selects Structured guidance directly. Current malformed storage is diagnosed rather than coerced into an old graph.

Retain focused state APIs: context/safe/id, settings/save, current graph CRUD, authoring mutations/history, graph-touch observers and current presentation groups. Do not retain dead function stubs for old callers. Groups are visual organization; subgraphs carry executable interfaces.

Rewrite `src/run.js` as a small current host facade retaining `getNativeWorkflowController`, `initializeNativeWorkflowController`, `sendWorkflowState` and a validated request-bound helper. Public SillyTavern busy/swipe/tokenization helpers remain real dependencies. Remove the old model executor and all its compiler/support imports.

Rewrite `index.js` around the Lattice launcher/settings/sendbar, `/lattice`, `globalThis.lattice`, `latticeGenerationInterceptor`, current host initialization and freshness refresh. Remove final-prompt replacement event handlers and all old global/hook aliases. No credential or live-provider action is part of the cleanup verification.

## One visual presentation

The approved supplied white logo/LATTICE Bricolage wordmark, flat menu bar, charcoal palette, quote-orange interaction accent, rounded recessed surfaces, joined graph tabs, floating family shelf/drawers, preview/divider, right Details and bottom-left run meter are the only workspace. Match the unchanged approved prototype SHA256 `C89442A03084032D95BD55668CFAA0AF3E2577FFC916F393F516A4D6089558A8`.

The default palette is Lattice's palette even inside a differently themed SillyTavern host. Quote color supplies the accent. Explicit custom Lattice themes/grid choices remain available without changing frame/tab geometry. Shell styles are unconditional; there is no fallback renderer or fallback legacy tab.

Use actual prepared named-pin DTOs only. Show malformed current documents as an error, never as old blocks. Keep keyboard/pointer accessibility, saved field drafts, resize cancellation, responsive 1024/736/360/320 layouts, fractional/high-DPR joins, focused editors, graph/view run independence and custom icons.

Delete `DomainSurface`, `StatusBar`, `CanvasControls`, `WorkflowSurface` compatibility mounts and old domain-surface adapters. Keep the pure current workflow projection/session functions, focused Svelte components and dedicated workflow setup. Library commands refer to subgraphs.

## Removal and verification

Delete retired support modules only after all production imports are closed: compile, memory, Jev, thoughts, statevals, state-window, lore, expr, select, old clip, old graph-analysis/domain-surfaces, legacy-insertion and migration. Remove obsolete CSS, type unions, assets, test fixtures and active documentation along with their features. Do not replace deleted paths with no-op compatibility shims.

Port meaningful native tests from early formats/results to current documents/recordings; remove tests solely proving retired features or backward readers. Preserve current safety, model, authoring, camera/history/selection and actual interaction coverage. Rewrite harness/smoke/benchmark/capture/live-harness summaries for current graphs; preserve opt-in/reservation guards without executing live calls.

Acceptance must exercise a fresh open with no selected or preinstalled fixture replacement, under SillyTavern-like host CSS, and inspect the actual installed UI where available. Verify no old mode/blocks/rows/sidebar/top-bottom pins can appear. Compare real production screenshots directly with the approved proposal at required widths/DPRs. Run full checks, clean installation and current-workflow performance checks, resolve independent review findings, bump to 0.21.0, and push normally to main with remote SHA verification.
