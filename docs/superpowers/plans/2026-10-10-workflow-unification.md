# Lattice Workflow Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the entire unified-workflow and expanded-capability design, integrate all repository work, and push the validated result to origin/main.

**Architecture:** Admit one native-unified root whose dependencies determine preparation and processing, retaining existing native-pre/native-post documents as explicit compatible tools. A suspended run releases the ordinary ST interceptor at its native generation boundary and resumes on an owned completed reply; final review publishes a preserved-original swipe and settles accepted effects. Focused portable engines produce validated records and pure projections; trusted host adapters own connections, storage, generation, and publication.

**Tech Stack:** Existing JavaScript ES modules, TypeScript declarations, Svelte 5, Node >=24, native test runner and Playwright. Retain bounded plain-data Result contracts and the existing build/asset pipeline.

**Spec:** docs/design/workflow-unification-summary.md and docs/design/expanded-nodes.md; requirements and clarifications in this conversation also bind implementation.

## Global Constraints

- One workflow covers preparation, native ST generation, processing, final presentation and settlement; graph position does not establish phase.
- Preserve normal ST prompt assembly, configured main connection and participating extensions.
- Use the exact names Decision and Fast Decision.
- Fast Decision uses typed Jev-compatible requests, including hosted Jev and self-hosted Laya; preserve provider-specific answer/confidence semantics.
- XP and relationship progression are recipes using general structures. Favor existing nodes and modes; do not add dedicated XP or lust nodes.
- Distinguish skip, unresolved, failure and cancellation. Valid empty branches complete without requests or writes.
- Preserve root authority, chat/user/actor scope, source revisions, private knowledge and player agency.
- Event identity differs from execution attempts; alternatives and retry cannot double-write, reroll or advance the clock twice.
- File Input is an imported snapshot. Live storage needs an authorized backend reference; portable settings never contain credentials or write authority.
- Stage canonical effects until the final selected scene is accepted. Report partial writes and unverified durable persistence truthfully.
- Story time is explicit persisted time, not wall time or message count. Curve steps are not elapsed hours.
- Implement in C:/Users/Keptin/.codex/worktrees/workflow-unification/SillyCanvas on codex/workflow-unification.
- Preserve primary checkout changes and the other worktrees. Final authorization includes merging all completed repository changes to main and pushing origin/main.

## Review Focus

- Streaming and nonstream ST deliver Received/Ended in different orders; reject unrelated replies and never deadlock the interceptor.
- A revised swipe changes native evidence authority; accepted effects must validate the final story body and retain persistence-only retry.
- JSON semantic append must preserve concurrent edits and unrelated fields, with identical duplicates distinct from conflicting identities.
- Long skips and replies spanning midnight require chronological projected state and each event's own day, not the ending day.
- Private per-actor state must not reach another actor's model or public notes; absent actors do not gain an on-scene contribution.

## Decisions and execution

Use compatible already-published native reply continuation, explicit final review initially, and one native generation boundary. Support ordinary replies first, then newly generated swipes before completion; selection of an existing swipe has a separate canon policy. Retain initial native formats without reviving retired systems. Use host-managed logical documents as the native storage foundation and add an explicitly selected file-handle/export adapter where supported; label targets honestly.

Each task uses one meaningful failing behavior at a time, then implementation and covering verification. Commit only owned files after review. Independent pure-engine tasks may run in parallel with disjoint ownership; central catalog/runtime/host integration remains serialized. Keep reports and review packages under .superpowers/sdd/workflow-unification. No task completion substitutes for the final requirement audit.

### Task 1: Unified contracts and operation phase projection

**Files:** Modify src/workflow/contracts.js, catalog.js, graph-validation.js, definition-data.js, packages.js, record-data.js, resolve.js, types.d.ts; tests/workflow-unified-contracts.test.mjs.
**Interfaces:** Admit native-unified in schema-3/runtime-2 documents. Export phaseForNode(graph,node) from catalog.js for an operation's effective pre/post execution context; resolved root plans report unified while each primitive carries its effective phase. Unified Guidance has a routable out pin and is not the final publication terminal. Current native modes retain their behavior.
- [ ] Write and run a failing mixed-operation admission test; assert valid unified post source/repair chain and pre operations coexist without WRONG_PHASE.
- [ ] Implement metadata admission and effective operation projection without widening host authority or allowing cross-phase cycles.
- [ ] Add incremental tests for compatible pre/post definitions within a unified root, malformed data, conflicting explicit phases, portable roundtrip and unknown runtime.
- [ ] Verify node metadata, package and graph tests plus the full unit suite; review and commit.

### Task 2: Named outputs, activation and recording

**Files:** Modify runtime.js, run-state.js, recording.js, record-data.js, resolve.js, types.d.ts, catalog.js and ports.js; create operations/control-nodes.js/.d.ts; tests/workflow-unified-runtime.test.mjs and workflow-control-nodes.test.mjs.
**Interfaces:** Operation result outputs maps port IDs to artifacts; outputStates maps ports to completed/skipped/unresolved with optional reason. local.inputStates accompanies namedInputs. Legacy single-artifact results map only their declared conventional output. Control operations expose Condition, Branch, Confidence Gate, Join/Collect and bounded For Each.
- [ ] Demonstrate Branch routing only its selected output and a skipped model branch making zero requests.
- [ ] Implement per-port state propagation and recorder admission; optional joins accept declared skipped inputs, required unresolved inputs hold.
- [ ] Implement bounded subgraph iteration and ordered projected-state mode; keep request bounds enforced per iteration and root.
- [ ] Cover empty collections, provider failure versus No, cancellation and one recording across suspension; review and commit.

### Task 3: Draft lineage and composable processing

**Files:** Create draft-revisions.js/.d.ts and operations/model-nodes.js/.d.ts; modify repair.js, operations/reference-draft.js, prose-cleanup.js and runtime registration; tests/workflow-draft-revisions.test.mjs and workflow-model-nodes.test.mjs.
**Interfaces:** createDraftRevision(parent,text,{nodeId,scope}) returns bounded lineage preserving root source and originalText. toFinalCandidate(draft) validates root ancestry and original. Model Call, Revise Draft, Extract, Enrich, Draft Text, Combine/Append and Render Notes consume typed artifacts.
- [ ] Reproduce a second revision targeting its parent text while final Candidate.original remains the native source text.
- [ ] Implement central revision validation and operation-local parent baselines; arbitrary Text cannot forge publication authority.
- [ ] Cover checked prose preservation, notes append, parallel extraction/enrichment, invalid ancestry, scopes and protected literals.
- [ ] Verify existing repair/reference/cleanup tests and full suite; review and commit.

### Task 4: Decision and typed fast-provider connections

**Files:** Create operations/decision-nodes.js/.d.ts, decision.js/.d.ts, fast-connections.js/.d.ts; modify connections.js and host configuration; tests/workflow-decision.test.mjs and workflow-fast-connections.test.mjs.
**Interfaces:** requestFastDecision(binding,{state,questions,signal}) uses POST /v1/systemone and matching keyed answers. Current provider fields are noul/choice/score/probabilities/legend/confidence (primary docs verified2026-10-10; earlier yesprob/selectedkey references are stale). Decision uses the existing verified text completion port. Fast Decision preserves noul/choice/score payloads and explicit endpoint/auth references outside portable graphs.
- [ ] Fail a typed Yes/No response-preservation test, then implement validated typed transport and response parsing.
- [ ] Incrementally cover Choice probabilities, Score rubric, question IDs, unsupported endpoint, auth, transport failure, cancellation and confidence gates.
- [ ] Provide hosted Jev/self-hosted Laya setup, independent model connections, bounded batches and explicit Decision fallback.
- [ ] Verify operation and real adapter boundary fixtures, primary documentation, UI configuration and full suite; review and commit.

### Task 5: Events, actor scope and item mechanics

**Files:** Create operations/event-data.js/.d.ts, event-nodes.js/.d.ts, random-outcomes.js/.d.ts and collection-nodes.js/.d.ts; extend introspection nodes as needed; tests/workflow-story-events.test.mjs and workflow-random-outcomes.test.mjs.
**Interfaces:** Validated occurrence records retain event/source/scene/actor/item identities, evidence, position and pending status. Trigger modes watch explicit sources. Holder resolution folds ordered transfers. Random outcomes key selections and authored inventions by event identity.
- [ ] Reproduce two actual wand uses separated by a transfer and verify distinct event identities/holders, excluding mentions and remembered casts.
- [ ] Implement deterministic matching, explicit semantic extraction/confirmation adapters, presence, character-scoped direction and prompted memory.
- [ ] Implement authored JSON/text effect libraries, validated weighting, saved draws and special model-authored effect branch; retry keeps the draw and invention.
- [ ] Cover private actor context, absent actors, uncertainty, empty events, random errors and collection ordering; review and commit.

### Task 6: Format and pure schema-aware document mutation

**Files:** Create operations/format-records.js/.d.ts and document-mutations.js/.d.ts; tests/workflow-document-mutations.test.mjs and workflow-format-records.test.mjs.
**Interfaces:** formatRecords(value,settings) returns validated records/text. prepareDocumentMutation(snapshot,settings) returns {targetId,expectedRevision,operation,projectedDocument,receipt}; it never writes. Settings cover append-text, add, add-unique, upsert, update-fields and explicit replace, collection path, key and missing-path policy.
- [ ] Demonstrate add-unique appending one new soul while preserving existing records and unrelated fields.
- [ ] Implement semantic JSON mutation, literal JSON Lines, text/Markdown separators and CSV escaping/header rules; schema mapping does not invent fields.
- [ ] Cover identical duplicate no-op, conflicting duplicate, malformed JSON/schema, missing collection, zero records and prepared-update single application.
- [ ] Verify safe bounded own-data parsing and full suite; review and commit.

### Task 7: Authorized storage and final effect settlement

**Files:** Create file-store.js/.d.ts, staged-effects.js/.d.ts, operations/file-nodes.js/.d.ts; modify host.js and introspection/host-memory.js; tests/workflow-file-store.test.mjs and workflow-staged-effects.test.mjs.
**Interfaces:** Trusted store.read(target) returns revisioned snapshot/fileRef; prepare and commit consume privately authorized references. Effect bundles retain stable intent IDs, original/final evidence and per-target status until accept/reject.
- [ ] Prove preview and target runs cannot persist, and acceptance writes the prepared projection only once.
- [ ] Implement scoped logical-document backend, explicit selected-handle/export integration, conflict preflight/rebase, and schema-checked Read File/Write to File.
- [ ] Retain memory/file/outcome authority across review; validate final selected body, report partial success and retry only missing stable intents.
- [ ] Cover save-unverified barrier, two-file partial writes, source changes, cancellation and accepted-canon corrections; review and commit.

### Task 8: Story clock and scheduling engine

**Files:** Create story-time.js/.d.ts; tests/workflow-story-time.test.mjs. Node wrappers and host settlement belong to Tasks 10/11.
**Interfaces:** advanceStoryClock(clock,proposal), enumerateScheduledOccurrences(clock,destination,schedules,{limit,consumedIds}), resolveTimeAdvance(clock,proposal,schedules,{policy,limit,consumedIds}) return Result DTOs. Clock uses clockId, calendarId, dayLengthMinutes, absoluteMinute; schedules use scheduleId/revision and daily, interval or delay fields. Exact safe-integer arithmetic makes zero model calls.
- [ ] Write/run a crossing test: day 1 13:40 (820) to 15:10 (910) yields daily 14:00 due=840 once; starting at 840 does not emit it again.
- [ ] Implement explicit duration/destination advance with preserved metadata and no input mutation. Vague/estimated time requires explicit authored policy or an unresolved Result.
- [ ] Add one case at a time: midnight; multiple ordered days; interval anchor=360/period=480 due 840,1320,1800 without drift; delay once; duplicate consumption; bounded overflow; invalid/backward time.
- [ ] Resolve interrupt at 840 with remaining 70 minutes versus catch-up destination 910; zero due events still advance. Validate calendar origin/units, simultaneous order and replay inputs.
- [ ] Verify targeted tests and full suite, write report, obtain review, commit owned files.

### Task 9: General progression and directed pacing engine

**Files:** Create progression.js/.d.ts; extend introspection/context-state.js and corresponding descriptors only after pure engine review; tests/workflow-progression.test.mjs.
**Interfaces:** applyProgressionEvents(state,events,rules) returns projected state, ledger and before/raw/allowed/after receipts. resolveThresholds(before,after,thresholds) returns all crossings in order. Rules supply deltas, scopes, bounds, caps, cooldown and zero-delta consumption policy.
- [ ] Prove authored rewards apply once for quest identity or repeatable instance identity, with unrelated state preserved.
- [ ] Implement numeric add/set/clamp and reusable rule lookup/threshold outputs; 80 to 650 crosses 100,300,600 and reaches level 4.
- [ ] Cover Mira->Elias versus Elias->Mira, +2 scene/+4 day caps using each event's day and sequential projected budgets, capped-zero ledger writes, cooldown/diminishing returns and temporary decay.
- [ ] Keep private-feeling authorship separate from observed evidence and portrayal permission; extend existing State modes instead of XP/lust nodes.
- [ ] Verify meaningful scenarios and full suite; review and commit.

### Task 10: Catalog, runtime and Details integration of all operations

**Files:** Modify catalog.js, runtime.js, packages.js, types.d.ts, src/ui/workspace-preparation.js, native-search-catalog.js and ui control/preview components; create operation adapters for Tasks 6/8/9 where needed; add integration and browser tests.
**Interfaces:** Descriptor maps expose actual modes/ports/defaults and inject trusted model/storage/clock capabilities through root runtime. Portable packages retain settings only. Typed port edits preserve occupied wires or reject atomically.
- [ ] Fail catalog-to-real-runtime execution for each engine family, then register and wire real execution.
- [ ] Add readable settings for triggers, schedules, provider capabilities, file modes, rules and progression; private/public previews and proposed/persisted receipts are separate.
- [ ] Integrate time effective destination/remainder into guidance and staged updates, and progression outputs into portrayal/reward contributions.
- [ ] Verify empty joins, activated request counts, actual node controls and complete workflow browser scenarios; review and commit.

### Task 11: Native host lifecycle, workflow binding and recall

**Files:** Modify host.js, src/run.js, index.js, state.js, UI workflow surface; create recall-activation.js/.d.ts and generation-rendezvous.js/.d.ts; tests/workflow-unified-host.test.mjs and browser unified workflows.
**Interfaces:** One Send binding owns frozen graph/context/user scope and a native generation deferred. Preparation-ready releases the interceptor; matching Received plus End/nonbusy resolves the Draft. Accept applies final swipe and Task 7 effects.
- [ ] Prove both ST event orders resume one owned run, while preparation returns before native generation.
- [ ] Implement correlation, guidance installation, source/binding checks, unsupported-mode diagnostics, Stop and missing-result failure.
- [ ] Add ordinary reply and generated-swipe targets; hotkey next-match/one-per-type/until-disarmed policies, keyword/actor/event automatic recall and visible disarm controls.
- [ ] Implement explicit current-native graph conversion/import, one workflow editor/binding UI, final review/accept/reject and persistence-only recovery.
- [ ] Verify live installed ST event behavior, no unrelated message authority, private recall and full checks; review and commit.

### Task 12: Complete recipes, docs, release and main integration

**Files:** Update starters/examples/workflows, docs/operator/node/native guides, README, manifest/package/versioned imports and built assets; integration/browser/live tests.
**Interfaces:** Every discussed flow is a runnable validated package using shipping contracts; optional specialist outputs use generic Model/Extract/Format rather than unimplemented named boxes.
- [ ] Build motivating prose/items/notes, character-only prompt, item-holder memory, broken wand wild effect, sword100, paired memories/recall, timed curse/8h, XP and slow-burn examples.
- [ ] Build the ten additional dice/ensemble/mystery/downtime/map/puzzle/alternate/crafting/documents/callback flows with inspectable outputs and correct settlement.
- [ ] Run npm run check, installation smoke and installed-ST scenarios; resolve all substantive review findings and audit every requirement against real behavior.
- [ ] Recheck primary and all other worktrees, integrate completed changes without discarding work, resolve conflicts and rerun complete validation on the integrated main tree.
- [ ] Merge to main, push origin/main using authorized network operations, verify GitHub remote commit, and only then mark the active goal complete.

