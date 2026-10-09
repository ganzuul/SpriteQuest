# Introspection package

This branch delivers six operation engines, dynamic typed node adapters, scoped memory storage, and runnable manifests. It does not change the current core registry. Canvas mounting and host wiring are the later integration step; the manifests explicitly declare `integrationRequired: true` and are not schema-3 canvas imports.

| Entry | Modes | Output | Requests |
| --- | --- | --- | --- |
| Reflect | Character, Recall, Scene | Reflection Data | 1 Analysis |
| Internalize | Experience, Pattern, Recovery | State proposal Data | 1 Analysis |
| Express | Behavior, Attention, Inner Voice | Guidance, Guidance, Text | 0, 0, 1 Prose |
| Context | Assemble, Perspective, Focus | Context | 0; Focus compression 1 Analysis |
| Memory | Read, Recall, Commit | State/events/episodes Data; commit-intent Data | 0 |
| State | Value, Curve, Track | Snapshot or state-proposal Data | 0 |

All engines are effect-free except the memory service's explicit `commit` settlement. A candidate never writes automatically. The model receives supplied evidence with observation/interpretation/possibility labels and instructions to preserve player agency. Inner Voice is fictional authored text, not access to private model reasoning. Deterministic value/curve/track proposals can be composed with character interpretation by the host; this package does not assume multiple candidates merge without a version/evidence check.

## Calling the package

Import `describeIntrospection` and `executeIntrospection` from `src/workflow/introspection/nodes.js`. Nodes use the existing flat workflow shape:

```js
const node = {type:'workflow',operation:'express',operationVersion:1,mode:'behavior'};
const result = await executeIntrospection(node,{assessment:reflection},{root:true});
```

Descriptions return named ports, mode-specific controls, output kind, role and request bound. Reflect consumes `context` plus optional `state`/`episodes`. Internalize requires `state` and `events`. Express consumes `assessment` plus optional supporting records. Context Assemble has `in1` through its configured `inputCount` (2–16); Perspective/Focus take `context`. State takes optional `state`, falling back to scoped Memory Read; Track also requires `events`. Memory Commit consumes `proposal`. Every output pin is `out`.

Inject `request({messages,maxTokens,signal})`, returning `{ok:true,data:{text,finish}}`, with a verified finish such as `stop`. The package makes at most one request per inference node and does not resolve profiles/providers or retry. The example harness passes `modelRole` to the injected request adapter. Focus additionally needs `countTokens(text) -> {tokens,method}` and a resolved `binding` for compression. Never use model output as a host storage authority.

`runIntrospectionExample(manifest,inputs,ports)` in `library.js` validates the complete typed topological graph before provider work. Supply `root:true`, a scoped memory service, request adapter, and any external Context artifacts named by the manifest. Preview, dry-run and target execution perform no work. A single commit terminal must be last; it settles only after every node and output succeeds. The harness exercises package behavior and does not replace the native workflow runner.

Examples:

- `examples/introspection/reflect-and-express.json`: Memory + Context -> Reflect -> Express -> Guidance for a subsequent generation node.
- `examples/introspection/internalize-and-commit.json`: settled events + prior state -> Internalize Recovery -> explicit commit.
- `examples/introspection/consequence-clock.json`: distinct settled event IDs -> State Track -> explicit commit.

## Data and provenance

Data is a versioned record: `{schemaVersion:1,recordType,scope:{chatId,actorId},store:{id,version},sourceRefs:[{id,revision}],payload}`. Boundaries clone plain own data without reading getters. They reject unsafe keys, cycles, inherited fields, sparse arrays and oversized structures. Maximums: 262144 UTF-8 bytes, depth32, 10000 values, IDs128 characters, text4096, source refs64, collection items64, changes32 and map keys32.

Actor state separates enduring `traits` from `beliefs`, `goals`, `relationships`, `conflicts`, temporary `conditions`, and `episodes`; `values`, `curves` and `tracks` carry deterministic state. Internalize cannot rewrite traits. Items retain classification and source references. A possibility remains a possibility when stored. Context message evidence requires an explicit `revision`; no invented revision makes unversioned scene text commit-worthy. Recalled episode IDs must refer to supplied episodes.

`applyStateProposal` is a pure candidate reducer. It validates scope/store/prior version and produces a detached state without increasing the version. Only successful host settlement increases the version. Historical evidence is retained; missing or changed sources produce invalidation reports and block new stale commits. Edit/swipe/delete semantics belong to the injected event/source adapter, not an inferred rollback of story canon.

## Scoped memory adapters

`createMemoryService` takes `{scope,storeId,load,readEvents,validateSources,compareAndSwap}`. Use `createInMemoryBackend(initialState,eventsDataOrCallback)` for deterministic tests. Use `createChatMetadataBackend({scope,storeId,getContext,saveMetadata,readEvents,validateSources,initialState?})` for host integration. Construction has no effects.

Ports:

- `load()` -> Result of `{state:Data,receipts:Receipt[]}`.
- `readEvents()` -> Result of scoped settled-events Data.
- `validateSources(refs)` -> `Result<void>`; reject any current revision mismatch or unsettled source.
- `compareAndSwap({expectedVersion,state,receipt},{signal,sourceRefs})` -> Result of `{acknowledged:boolean}`. Check chat, source validity, version and cancellation immediately before the atomic write. An adapter with awaited work must recheck before saving. External writers must use the same CAS contract.

Metadata is explicitly namespaced under `chatMetadata.latticeIntrospection[storeId][actorId] = {state,receipts}`. `getContext` returns a plain `{chatId,chatMetadata}` snapshot; adapt the host's larger context to this shape. `saveMetadata` receives the proposed detached snapshot and must return `true` only for acknowledged persistence. The host must coordinate metadata updates atomically with other writers and reuse one adapter for its scoped store; this adapter serializes its own calls and checks scope/version after awaited reads. Memory event reads use the loaded state version in the envelope, preserving exact event IDs, revisions, text and settled classification across turns.

`commit(intent,{root:true,signal,preview:false,dryRun:false})` serializes transactions and revalidates evidence/current state before one CAS. Receipt fingerprints are canonical full intent JSON; replaying a key with identical content returns `applied:false`, while changed content fails. Unknown acknowledgment is explicitly returned as `acknowledged:false`; confirm durable storage before reporting it as saved or retrying. A per-service guard blocks an unresolved replay without a stored receipt. Receipt capacity is64; there is no silent eviction. The host must explicitly reconcile/archive history to extend bounded capacity. Evidence and track histories are also bounded, requiring deliberate summarization rather than silent truncation.

## Controls

Reflect/Internalize/Express use `mode`, `maxTokens` (default2048), and `instructions`. Memory Read uses `view:state|events|episodes`; Recall uses `query` and `limit` (default8); Commit requires a stable nonblank `idempotencyKey` unique to the intended event transaction.

Context Perspective requires `actorId` and explicit `message.visibleTo` arrays. Unmarked messages are omitted. The output strips nested input metadata that might reintroduce omitted text; reports expose bounded omitted IDs. This controls the returned artifact, not separately assembled prompt material. Focus uses `method:select|compress`, `targetTokens`, `maxTokens`, `keepRecent`, `pins`, and `purpose`.

State Value reads when `updates` is absent; configured updates form a numeric proposal checked against `min`/`max` (default0..1). Curve uses `curveId`, `steps` (1..64), `decay` (0..1), `baseline`, and positive durations (1..64) for onset/peak/plateau/decline/aftermath. It deterministically approaches baseline and does not infer emotional truth. Track uses `trackId` and distinct settled event IDs; repeats do not advance its count.
