# Introspection workflows and package

Reflect, Internalize, Express, Context, Memory and State are registered native operations. Open the **Introspection** shelf family to choose one of these six nodes directly, or find it through contextual pin search. Their eighteen modes are selected in **Details → Mode**; they are not separate shelf entries. Editable controls and typed named pins follow the chosen mode. Existing saved modes remain intact. They participate in the normal native validator, runner, model bindings, recorded Preview, and workflow import/export. The [node reference](node-reference.md#introspection) lists the native pin contracts.

| Entry | Modes | Output | Requests |
| --- | --- | --- | --- |
| Reflect | Character, Recall, Scene | Reflection Data | 1 Analysis |
| Internalize | Experience, Pattern, Recovery | State proposal Data | 1 Analysis |
| Express | Behavior, Attention, Inner Voice | Guidance, Guidance, Text | 0, 0, 1 Prose |
| Context | Assemble, Perspective, Focus | Context | 0; Focus compression 1 Analysis |
| Memory | Read, Recall, Commit | State/events/episodes Data; native Commit Host result | 0 |
| State | Value, Curve, Track | Snapshot or state-proposal Data | 0 |

Reflect, Internalize and State produce candidate records. Express Behavior/Attention renders optional guidance without a model; Inner Voice is fictional authored text, not access to private model reasoning. Model operations receive supplied evidence with observation/interpretation/possibility labels and instructions to preserve player agency. Proposals never write by themselves, and multiple proposals do not merge without a version/evidence check.

## Native workflow examples

The **Workflow examples…** picker includes three Introspection starters. Each install creates an independent editable graph, leaves model connections unresolved, and neither assigns a phase nor arms the extension.

| Native workflow | Phase and flow | Maximum auxiliary requests |
| --- | --- | --- |
| [Reflect and express](../examples/introspection/native/reflect-and-express.json) | Pre: Scene Context → Context Focus (`select`) → Reflect Character → Express Behavior → Guidance; Memory Read State feeds Reflect's optional `state` pin | 1 Analysis |
| [Internalize and commit](../examples/introspection/native/internalize-and-commit.json) | Post: Memory Read State + Memory Read Events → Internalize Experience → Memory Commit | 1 Analysis |
| [Consequence clock](../examples/introspection/native/consequence-clock.json) | Post: Memory Read State + Memory Read Events → State Track → Memory Commit | 0 |

Choose a local **Analysis** connection before running the first two. Consequence clock needs no model profile. Run to here inspects a selected output's dependencies without publishing guidance or writing memory. A manual Pre Run computes guidance; assigning Pre and arming causes Send to run the graph again and publish the bounded result. The normal SillyTavern reply is an additional request.

**A successful full Post root Run with Memory Commit writes actor memory.** Commit has a required `proposal` Data input, no output pin, and a recorded Host result. Only one Commit is allowed in a Post root graph, and it settles after every branch succeeds. A failed/cancelled run, preview, target Run, dry-run, or public `runWorkflow` call cannot settle it. Memory Read/Recall/Commit cannot appear inside reusable subgraphs. State can appear in a subgraph with an explicit `state` input.

Native memory is scoped to the active chat and the host-selected character, using the `native-chat` store. Group chats require an active actor; a workflow record or model response cannot select storage authority. Event reads capture only bounded settled public message text and its selected swipe/revision. Private reasoning and unsupported tool, system, intermediate, media or unfinished content are excluded. Edits, swipes, deletion, actor/chat switches, changed settings, cancellation and stale store versions can prevent settlement. Historical evidence is reported as invalidated rather than rewritten as new story history.

The host rechecks source evidence and prior version immediately before a compare-and-swap write, preserves unrelated metadata namespaces, and records idempotency receipts. The default Commit key `lattice-memory-commit` is expanded by the native host from the graph, terminal and exact proposal. Custom keys must identify one intended transaction: identical replay is idempotent, changed content with the same key fails. Distinct-event tracks do not count the same event twice.

Local application and durable persistence have separate status. SillyTavern's public metadata save wrapper returns no positive durability acknowledgment. A local update with that result returns `memoryCommit: { applied: true, acknowledged: false, version: ... }`, and Preview says **Memory updated; save unconfirmed**. A returned save error can likewise leave an unknown outcome after local application. Replaying that transaction remains blocked for the current controller. A new controller after reloading the host can confirm a receipt from persisted metadata; replacing the local metadata object alone does not confirm a save. A distinct next-turn proposal may advance the intact local state and version, with its save still marked unconfirmed. Missing receipts or rolled-back state block further writes. An adapter that positively acknowledges the save reports `acknowledged: true`.

## Two example formats

Files under [examples/introspection/native](../examples/introspection/native/) are `lattice-workflow` packages with a schema-3/runtime-2 graph. Open them with **File → Open workflow…** or add them through **Import into graph…**. Exports omit local profile IDs and credentials; imported model roles need local bindings.

The three files directly under [examples/introspection](../examples/introspection/) remain `lattice-introspection-example` version-1 manifests for the package harness below. Their `integrationRequired: true` flag declares that the harness needs injected services and root authority; those manifests use arrays of nodes with `inputs` bindings and are not native canvas packages. The native equivalents are available now. Synthetic fixtures exercise both formats without provider/API calls.

## Calling the package

Import `describeIntrospection` and `executeIntrospection` from `src/workflow/introspection/nodes.js`. Nodes use the existing flat workflow shape:

```js
const node = {type:'workflow',operation:'express',operationVersion:1,mode:'behavior'};
const result = await executeIntrospection(node,{assessment:reflection},{root:true});
```

Descriptions return named ports, mode-specific controls, output kind, role and request bound. Reflect consumes `context` plus optional `state`/`episodes`. Internalize requires `state` and `events`. Express consumes `assessment` plus optional supporting records. Context Assemble has `in1` through its configured `inputCount` (2–16); Perspective/Focus take `context`. State takes optional `state`, falling back to scoped Memory Read; Track also requires `events`. Memory Commit consumes `proposal`. Package engine outputs use `out`, including commit-intent Data; the native adapter exposes Commit as a terminal without a routable output pin.

Inject `request({messages,maxTokens,signal})`, returning `{ok:true,data:{text,finish}}`, with a verified finish such as `stop`. The package makes at most one request per inference node and does not resolve profiles/providers or retry. The example harness passes `modelRole` to the injected request adapter. Focus additionally needs `countTokens(text) -> {tokens,method}` and a resolved `binding` for compression. Never use model output as a host storage authority.

`runIntrospectionExample(manifest,inputs,ports)` in `library.js` validates the complete typed topological graph before provider work. Supply `root:true`, a scoped memory service, request adapter, and any external Context artifacts named by the manifest. Preview, dry-run and target execution perform no work. A single commit terminal must be last; it settles only after every node and output succeeds. The harness exercises package behavior and does not replace the native workflow runner.

Package-harness manifests:

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

Metadata is explicitly namespaced under `chatMetadata.latticeIntrospection[storeId][actorId] = {state,receipts}`. `getContext` returns a plain `{chatId,chatMetadata}` snapshot; adapt the host's larger context to this shape. `saveMetadata` receives the proposed detached snapshot and must return `true` only for acknowledged persistence. The native adapter in `host-memory.js` bridges the public SillyTavern context/save API, serializes writes, merges fresh unrelated metadata, and checks actor/chat/source/version after awaited work. Package integrations must provide the same coordination. Memory event reads use the loaded state version in the envelope, preserving exact event IDs, revisions, text and settled classification across turns.

`commit(intent,{root:true,signal,preview:false,dryRun:false})` serializes transactions and revalidates evidence/current state before one CAS. Receipt fingerprints are canonical full intent JSON; replaying a key with identical content returns `applied:false`, while changed content fails. Unknown acknowledgment is explicitly returned as `acknowledged:false`; confirm durable storage before reporting it as saved or retrying. A per-service guard blocks an unresolved replay without a stored receipt. Receipt capacity is64; there is no silent eviction. The host must explicitly reconcile/archive history to extend bounded capacity. Evidence and track histories are also bounded, requiring deliberate summarization rather than silent truncation.

## Controls

Reflect/Internalize/Express use `mode`, `maxTokens` (default2048), and `instructions`. Memory Read uses `view:state|events|episodes`; Recall uses `query` and `limit` (default8); Commit requires a stable nonblank `idempotencyKey` unique to the intended event transaction. Native defaults use the host-derived key described above. Model controls appear only for request-making modes; changing Express from Behavior to Inner Voice changes `out` from Guidance to Text and requires a Prose binding.

Context Perspective requires `actorId` and explicit `message.visibleTo` arrays. Unmarked messages are omitted. Native Scene Context marks public chat and selected character material as provided to the active host actor, preserving existing visibility exclusions. That annotation describes supplied material, not knowledge of in-world events. Imported Context still requires its own explicit visibility. The output strips nested input metadata that might reintroduce omitted text; reports expose bounded omitted IDs. This controls the returned artifact, not separately assembled prompt material. Focus uses `method:select|compress`, `targetTokens`, `maxTokens`, `keepRecent`, `pins`, and `purpose`.

State Value reads when `updates` is absent; configured updates form a numeric proposal checked against `min`/`max` (default0..1). In Details, **Values** is a JSON object such as `{"trust":0.35}`. Arrays are invalid; numeric values and finite Minimum/Maximum may be fractional. Curve uses `curveId`, `steps` (1..64), `decay` (0..1), `baseline`, and positive integer durations (1..64) for onset/peak/plateau/decline/aftermath. **Phase durations** is a JSON object such as `{"onset":2,"peak":1,"plateau":3,"decline":2,"aftermath":1}`. Decay and Baseline support fractions. Save the JSON control before running. Curve deterministically approaches baseline and does not infer emotional truth. Track uses `trackId` and distinct settled event IDs; repeats do not advance its count.
