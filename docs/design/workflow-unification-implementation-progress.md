# Workflow unification implementation progress

Goal created: 2026-10-10. Status: active; implementation and final main integration remain outstanding.

## Authority and scope

The user requested implementation of both design documents and all requirements in this conversation, in a worktree, followed by merging this work and all other repository changes to main and pushing main. That authorization includes the final merge and push; do not request it again. Preserve others' work and recheck the repository before final integration.

Specifications:
- docs/design/workflow-unification-summary.md
- docs/design/expanded-nodes.md

XP and relationship intensity are recipes built from general structures. Prefer existing nodes or mode extensions; do not introduce dedicated XP or lust nodes. Implement every reusable capability and demonstrate the motivating scenarios and ten additional flows through examples.

## Workspace and initial state

- Primary checkout: F:/git/SillyCanvas, branch main.
- Managed implementation worktree: C:/Users/Keptin/.codex/worktrees/workflow-unification/SillyCanvas.
- Implementation branch: codex/workflow-unification.
- Starting commit: 94c05fa08c57516f6420c6b5de349bbaab4ade9f; verified equal to GitHub origin/main on 2026-10-10.
- Remote: origin, https://github.com/MentallyQuill/Lattice.git.
- GitHub CLI authentication valid for MentallyQuill. Always use gh with network permission enabled. If expired, request reauthentication.
- Node 24.16.0; locked npm dependencies installed successfully with npm ci --no-audit --no-fund.
- Primary checkout changes initially: docs/README.md and the two untracked design documents. Copied these into the implementation worktree; originals preserved.
- Other worktree details-panel-overhaul: clean; no commits ahead of main at initial inspection.
- Other worktree node-profile-dropdowns: substantial uncommitted profile-selection/UI/model-binding changes and new modules/tests. Leave it intact during implementation. Integrate its completed work at the final repository reconciliation, recheck for subsequent changes, and validate together.

## Implementation workstreams to plan and complete

- [ ] Unified graph contracts, source/stage capabilities, current native graph conversion, definition/package compatibility, and diagnostics.
- [ ] Named operation outputs, port activation/skip/unresolved states, conditional scheduling, optional joins, bounded ordered iteration, recording, cancellation, and owned native generation continuation.
- [ ] Normal SillyTavern Send/generation integration, single workflow binding, source/chat/user/generation correlation, final review/publication, accepted consequence settlement, and partial failure recovery.
- [ ] Composable Draft lineage, generic model calls/revisions, extraction/enrichment, checked assembly, Combine/Append, notes rendering, and final output authority.
- [ ] Decision and Fast Decision, typed Jev/Laya connection transport, provider configuration, confidence/answer semantics, batching, explicit fallback, and request accounting.
- [ ] Event/source triggers, condition/branch operations, semantic confirmation, actor presence/private context, character-specific prompts and memories, item identity/holder/transfers/use events.
- [ ] Collections, rule lookup, numeric reduction, threshold enumeration, event-keyed random draws, JSON/text effect libraries, and the model-authored wild branch.
- [ ] Format/schema mapping/serialization, authorized Read File and Write to File adapters, append/add-unique/upsert/update/replace modes, projected updates, retained file references, conflicts, correction/replay, and per-target persistence receipts.
- [ ] Manual hotkey arming and automatic recall with reply/swipe/both targets, independent consumption policy, deduplication, private routing, cancellation and inspection.
- [ ] Persisted Story Clock, explicit or validated time advance, daily midnight/14:00 schedules, anchored intervals, one-time delay, cooldown, interrupt/remainder and bounded catch-up, clock replay and canon reconciliation.
- [ ] General state progression, richer event ledgers, authored rewards, multiple crossed milestones, directed relationship state, ordered per-event scene/day caps, temporary intensity/recovery, portrayal bands and private authority.
- [ ] Complete UI controls, shelf entries/modes, previews, run stages, storage/provider setup, visible arming and settlement indicators, accessibility and browser validation.
- [ ] Complete unified examples and documentation for all discussed flows; clarify shipped behavior and supported storage/host integration rather than leaving proposal-only features.
- [ ] Required automated checks, installation/live host validation, task and whole-branch reviews, built assets/version consistency.
- [ ] Reconcile main and other worktree changes, resolve conflicts, verify the complete integrated tree, merge to main, push origin/main, and verify the remote commit.

## Initial architectural findings

Use compatible continuation of ST's already-published reply as the first verified publication architecture. A held unpublished native Draft seam is not currently available. Preserve the base reply and apply the final revision through a new swipe, with explicit review/acceptance and staged consequences.

Native ST MESSAGE_RECEIVED and GENERATION_ENDED ordering differs between streaming and non-streaming. Do not resume from an arbitrary next message or ENDED alone. The pre-generation interceptor must release when preparation reaches the native boundary; otherwise awaiting the full run deadlocks native generation. Correlate source, chat, trusted user scope, owned attempt, received reply identity, and actual completed/nonbusy state.

Current executeWorkflow assigns one artifact to all output ports, immediately executes undefined inputs, and recordings require completed dependencies. Define named outputs and skipped/unresolved admission before branch nodes. Current graph and record contracts admit only pre/post. Current repair operations require source.originalText equality; introduce a central composable revision contract instead of just changing artifact kinds.

Current Memory Commit settles independently of Apply and releases its session/intents at run end. Unified review must retain trusted staged intents and revalidate the selected final evidence. Publishing a new swipe changes source authority, so accepted effects require explicit final-evidence handling and truthful partial outcomes.

Current storage is scoped chat metadata CAS with unknown durable-save acknowledgement. Start from authorized host-managed logical documents with explicit file references and a separate namespace; actual external-file access needs a verified adapter or explicitly selected handle. Imported File Input is a snapshot and cannot grant write authority.

Keep portable operation engines in focused modules with descriptors, typed boundary declarations and injected capabilities; root integration owns catalog, runtime, contracts and Details projection. Current State Value supplies literal numeric replacements, Track counts distinct settled message IDs, and Curve uses steps. Dynamic weighted progression, scene occurrences and story hours require explicit extensions.

## Verification and recovery

Baseline verified: npm test completed successfully; 171/171 test files passed. Log: .superpowers/sdd/workflow-unification/baseline-tests.log.

Architecture reports: .superpowers/sdd/workflow-unification/runtime-map.md and nodes-map.md. These investigations are read-only and should be trusted; do not repeat repository exploration wholesale after compaction.

Plan saved: docs/superpowers/plans/2026-10-10-workflow-unification.md. The implementation remains active. Recovery ledger: .superpowers/sdd/2026-10-10-workflow-unification/progress.md. A reviewed engine checkpoint establishes its scoped behavior; it does not establish the full native integration, UI, or recipe requirement.

## Reviewed implementation checkpoints

| Commit | Implemented and independently reviewed scope | Remaining integration |
| --- | --- | --- |
| 113ded0 | Unified contracts, mixed-stage definitions, named outputs, branch/skip/unresolved states and bounded iterator capability | Native generation stage barrier and real pinned helper graph compiler |
| e8b0549 | Schema-aware document projection, exact story time and generic progression engines | Authorized node adapters, host persistence, UI and complete recipes |
| 5cdcb29 | Ordinary/typed decision engines, Jev-compatible transport, authorized logical document storage and accepted staged effects | Provider registry/configuration, native final-evidence settlement and recovery UI |
| da17b2c | Authenticated composable Draft revisions, Model Call, Revise Draft, Extract, Enrich, Render Notes, Combine/Append and Draft Text | Central registration is in review; native publication and model authoring UI remain |
| 83ce59e | Event/source/actor/item engines, literal triggers, weighted saved random outcomes and collection operations | Catalog/runtime registration, trusted actor scope and accepted event/outcome settlement |

Fresh scoped evidence includes 139 Draft/model tests, 63 decision/storage tests, and 81 event/Draft/progression integration tests. Every checkpoint closed independent review findings before commit. A later clean full project check and live native validation are still required.

## Current integration work

The first central runtime/editor segment is ready for independent review. It registers Decision/Fast Decision and Draft/model adapters, separates typed requests and connection summaries, accounts for explicit fallback, defers new model bindings until actual requests, and exposes both stages on one unified shelf. Its focused suite passed 122/122 tests. The project type check passed before the final small binding-summary adjustment; review will verify current source again.

File node adapters are addressing two independent review findings concerning mapping-default privacy and capability failure diagnostics. Time node adapters are implementing checked Story Clock, Advance Time and daily/interval/delay trigger ports. These adapters are not yet committed or claimed shipped.

Native Send and generated-swipe continuation, accepted evidence settlement across stores, provider setup, private recall/hotkey modes, progression wrappers, complete shelf/Details controls, all examples, browser/live verification, and reconciliation of other worktrees remain required. Main has not been merged or pushed. Never mark the goal complete until all requirements and the final remote push are verified.
## Additional reviewed checkpoints

| Commit | Independently reviewed scope | Remaining integration |
| --- | --- | --- |
| 4d68986 | Authorized Format, Read File and Write to File operation adapters | Accepted native file bundle and storage setup UI |
| 35fec1c | Story Clock, Advance Time, daily/interval/delay Time Trigger adapters | Persisted accepted clock and schedule ledgers |
| 622d973 | Central Decision/model dispatch and bounded typed requests | Real helper compiler and complete authoring |
| 69f5d0c | Session-only typed connection registry and exact binding ownership | Live provider validation |
| 40667d0 | State Value progression and time-decay modes | Accepted state persistence and tracker recipes |
| 93e74d1 | Unified starter/settings, actual ST typed bridge and user identity | Full native settlement and operator UI |
| b1572af | Native save verification for selected metadata | Accepted bundle integration |
| 4232f21 | User/chat document catalog, scoped leases and repaired callback races | Document setup UI |
| 398906b | Controlled native persistence failure after late host acquisition | Whole integration validation |
| e53b7bb | Typed provider configuration, unified stages and native review adoption | Accepted consequence recovery controls |

Current focused evidence: provider/unified UI 68 tests; document catalog/storage/effects 60 tests; native persistence 9 tests and strict declarations. Artifact privacy now follows descriptive derivations through comparisons, collections and secondary models. Public Draft assembly rejects restricted material; checked private commit authority retains exact object identity. Native continuation and helper aggregation privacy corrections are under independent review.

The accepted native settlement segment retains the final authenticated Draft, scoped document intents and memory intents until review. Canonical evidence is checked against narrative body separately from rendered notes. Known failed persistence targets may retry without model calls; unknown saves hold the target. Final rewritten canonical evidence, persistent clocks/outcomes/recall, complete authoring and recipes remain active work. Main has not been merged or pushed.

## Accepted review and reusable helper integration

Accepted native settlement and its UI now retain the exact private Draft and consequence handles. Independent review identified a cached-Draft/evidence mismatch in the exported coordinator; four regression tests now cover failed validation, failed preflight, overlapping acceptance and changed notes. Acceptance serializes the complete Draft/evidence pair, publishes that exact Draft and preserves it during persistence recovery. Renewed independent checks passed 58 tests; the surrounding integration passed 290 scoped checks.

For Each now compiles real pinned definitions before source/model effects, including empty collections. Whole-helper validation covers unused branches, exact immutable pins, recursive completeness, stage/authority restrictions and finite bounds. Actual nested text/typed models use their most-specific iteration request wrapper and retain exact private child bindings for native preparation/final settlement. Explicit Fast Decision fallback may recover only through an exact successfully validated compiled result. Independent compiler/runtime review passed 114 tests and strict declarations; no remaining finding in that scope.

The UI projects redacted per-target receipts. Partial acceptance keeps its review handle and retries failed persistence without regenerating the accepted reply. Unconfirmed writes expose their status and hold retry authority. Reject releases retained host bundles and accurately distinguishes an unpublished original reply from an already accepted reply.

Story document setup and required node configuration are in progress. Persistent clock/outcome bridges and scoped manual/automatic recall remain active implementation segments. Full suite, build, shipping assets, browser/live validation, complete recipes and final repository/main reconciliation remain required.


## Integrated implementation checkpoint (2026-10-10)

The implementation now includes owned unified native continuation, authenticated Draft revisions, final accepted evidence settlement, private per-actor capabilities, current-player source, pinned text/typed helpers, schema-aware logical story documents, accepted clocks/random ledgers/general progression, scoped Recall with real DOM shortcuts, and the full authoring UI. Thirty-one portable unified recipes are installed through the public examples API, alongside the thirty current legacy examples.

Independent reviews closed native source/currentness, private canonical memory, actor grant callback, helper fallback role and portable exposed binding findings. The final scoped recipes additionally gate empty/declined/uncertain events and actual absent actors; genuine identity routes retain exact live provenance. Target-aware portable parameter export rebases affected definition keys/pins without editing local documents or stripping ordinary story JSON.

Fresh evidence: 17 scoped recipe tests; 12 additional-flow tests; 23 helper-authoring/runtime checks; browser helper connection and Story-2 document/Recall authoring both passed; Svelte types0errors/0warnings; production build passed. Installed SillyTavern browser smoke validates both native event orders using actual public host helpers and an isolated synthetic reply. It blocks paid/provider traffic and host writes, so it does not claim real provider output or durable persistence.

The broad test pass exposed stale extracted-controller fixtures and old default/menu expectations. Those fixtures are updated without weakening their behavioral assertions. Final combined tests/assets/browser/install checks and reconciliation of the separately committed searchable profile picker remain required. Main has not yet been merged or pushed.
