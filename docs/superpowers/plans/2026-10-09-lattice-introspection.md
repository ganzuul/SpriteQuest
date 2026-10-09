# Lattice introspection implementation plan

> For agentic workers: use the shared spec and this plan's bounded task briefs. Execute tests before implementation, with independent final review.

**Goal:** Deliver all six mode-driven introspection entries as a self-contained tested package for later native registration.
**Architecture:** Shared parsed Data records and pure candidate reduction back bounded analysis and deterministic rendering. Scoped host adapters alone settle versioned explicit commits. Existing core files and Main are untouched; the package adapter and examples document their registration requirement.
**Tech stack:** ES modules, Result DTOs, matching TypeScript declarations, Node test runner; no new dependencies.
**Spec:** docs/superpowers/specs/2026-10-09-lattice-introspection-design.md

## Global constraints

Use ?v=0.22.0 production relative imports. No paid requests, merge/push/release, core edits or legacy migration. One request per Reflect/Internalize/Inner Voice/compression operation, no retries. Data limits are 262144 bytes/depth32/10000 values; IDs128, text4096, refs64, collections64, changes32. Parse before effects; source/scope/version checks and successful completion are required. Public inference returns candidates, never persistence authority.

## Review focus

Untrusted own-data/accessor boundaries; stale source/version after awaits; duplicate idempotency keys with changed content; mode-dependent outputs/bounds; provenance and possibilities becoming committed facts. Each belongs in its component tests.

## Task 1: shared contracts (controller)

Create src/workflow/introspection/contracts.js and .d.ts; tests/introspection-contracts.test.mjs and tests/fixtures/introspection.mjs.

Interfaces: createActorState(scope,store?,initial?) -> Result<Data>; parseRecord(artifact,expectedType?) -> Result<Record>; makeRecord(recordType,base,payload,sourceRefs?) -> Result<Data>; validateEvidence(refs,allowed) -> Result; applyStateProposal(state,proposal) -> Result<Data>. Records use {schemaVersion:1,recordType,scope:{chatId,actorId},store:{id,version},sourceRefs:[{id,revision}],payload}. Actor collections are traits/beliefs/goals/relationships/conflicts/conditions/episodes; items {id,text,classification,sourceRefs}. Reflection payload is {brief,appraisals,conflicts,recalls,sceneChanges,behaviorHints,attentionHints,recalledEpisodeIds}. Proposal payload {changes,values,curves,tracks}; defaults empty. Changes are {op:'upsert',collection,item} or {op:'remove',collection,id}; traits protected. Events payload {events:[{id,revision,text,settled:true}]}; episodes payload {episodes:[Item]}. Commit intent payload {proposal:Record,idempotencyKey:string}. State values finite numbers; curves {phase,value,elapsed}; tracks {eventIds:string[],count:number}; all maps <=32 keys. Pure reducer validates identity/version and requires item refs in state/proposal allowed refs, never mutates inputs.

- [ ] Write/run a failing contract test.
- [ ] Implement validators/reducer and cover malformed fields, evidence, bounded values, identities and immutability.
- [ ] Run contract suite and commit exact owned paths.

## Task 2: bounded analysis (worker A after Task 1)

Own analysis.js/.d.ts and tests/introspection-analysis.test.mjs. Functions reflect(context,settings,ports), internalize(priorState,events,settings,ports), express(assessment,settings,ports), all return Promise<{ok:true,artifact,reports}|Failure>. Ports include request({messages,maxTokens}), signal and optional state/episodes/context. Reflect mode character/recall/scene returns reflection Data. Internalize mode experience/pattern/recovery validates events and returns proposal Data. Express behavior/attention deterministically returns Guidance; inner-voice uses one Prose request and returns Text. Inference output is raw JSON payload for structured modes; no fence stripping/retries. Verify finish, cancellation, supplied-ref membership, recalled IDs and protected traits. Prompts label evidence versus interpretation and prohibit assigning player private state. Defaults mode character/experience/behavior, maxTokens2048, instructions''. Test all modes and errors before implementing. No storage/core changes.

## Task 3: memory service (worker B after Task 1)

Own memory.js/.d.ts and tests/introspection-memory.test.mjs. createMemoryService({scope,storeId,load,compareAndSwap,readEvents,validateSources}) exposes read({view:'state'|'events'|'episodes'}), recall({query,limit}), commit(intent,{signal,preview,dryRun,root}). read snapshots/clones before awaits; recall uses deterministic terms, limit1..64 (default8). Commit validates a commit-intent record and pure reduction, source/version/scope, serializes calls, rechecks after awaited validation, calls injected CAS once, and distinguishes acknowledged/unknown persistence. Require root===true and preview/dryRun false. Replay same key/content returns applied:false; different content fails. No writes from reads/import/preview/cancellation. Provide createInMemoryBackend(initialState,events) and createChatMetadataBackend({getContext,saveMetadata,validateSources,scope,storeId}) with explicit namespaced metadata, source invalidation, CAS and receipt state. Caller provides settled-event source; do not invent swipe/delete semantics. Tests exercise real in-memory commits and deferred cancellation/stale/event mutations plus metadata save outcomes. No core changes.

## Task 4: deterministic context/state (worker C after Task 1)

Own context-state.js/.d.ts and tests/introspection-context-state.test.mjs. shapeContext(namedInputs,settings,ports) delegates Context Join for assemble; Smart Compactor for focus; perspective retains only messages with explicit visibleTo including actorId and reports omitted IDs. Default assemble requires2..16 slots; focus select/compress budget controls mirror existing compactor; perspective fails visibly if no explicit visibility is available. advanceState(state,settings,events?) returns Data actor-state for value read, otherwise proposal. Values updates finite within configured min/max; Curve advances phase sequence onset/peak/plateau/decline/aftermath/baseline with per-phase positive durations and value approaches baseline by decay0..1; Track counts distinct settled event IDs under configured trackId and refuses overflow. Tests all modes, provenance, unknown actor and deterministic duplicate-event behavior. No storage/core changes.

## Task 5: node adapter/examples/integration (controller after Tasks 2–4)

Own nodes.js/.d.ts, library.js/.d.ts, tests/introspection-nodes.test.mjs, tests/introspection-acceptance.test.mjs, examples/introspection/*.json, docs/introspection-package.md and docs/research/2026-10-09-introspection-package-handoff.md.

Export INTROSPECTION_OPERATIONS (six descriptors), describeIntrospection(node,{phase}), executeIntrospection(node,namedInputs,ports). Validate settings/known ports/kinds before reading providers or spending requests. Named ports/mode controls expose all18 modes; sources/Memory Commit rootOnly; Commit is terminal and produces intent for trusted settlement, never invokes write in execution. Include roles/requestBound/output kinds in descriptors. Memory read view supplies state/events/episodes; State optional state input falls back to read provider. runIntrospectionExample manifest schema lattice-introspection-example/version1 runs typed topological named bindings, guarded bounded requests and settles intents only at successful root end. Examples show all modes via adapter, with primary reflect/express and separate internalize/commit cross-turn. Round-trip manifests JSON and test exact adapter modes/call bounds, no provider work on invalid/preview/target, cancellation and explicit save. Native core mounting remains a documented later integration step.

- [ ] Run fresh package suites, project suite, types, build, assets and declaration checks.
- [ ] Obtain independent whole-branch review and fix material findings with covering tests.
- [ ] Commit clean package delivery; retain worktree and review evidence for integration.
