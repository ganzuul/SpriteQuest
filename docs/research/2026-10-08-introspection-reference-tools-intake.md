# Introspection next-intake assessment

2026-10-08. Read-only assessment; current reference delivery remains scoped to reviewed base `193ebca23187fa6485735b1461b3b88fdd73bc65`. No new production operations, registrations or packages.

Evidence: incoming introspection handoff; current reference-tools handoff, design and library docs; public workflow, primitive, transfer and library declarations; native-workflow docs and primitive handoff. Architecture implementation was not audited. Incoming handoff claims are identified below. Ancient Access is fictional reference data, not executable authority or established psychological facts.

## Reuse

| Proposal | Confirmed reuse | Missing behavior |
| --- | --- | --- |
| Context Focus | Context Lens, pre Context -> Context: select 0, compression at most 1 Analysis; token/recent/pin/method controls | Current selection is budget/recent/pin based, not an actor-aware relevance ranker |
| Context Assemble | Compose already creates labeled Text/Guidance from Data/sections; incoming handoff reports Architecture context-join combines 2-16 Context inputs with source checks/deduplication | Reconfirm join on integration revision; Compose cannot create Context; decide zero/one-input cases and available source readers |
| Reflect Scene | Scene Compass: Lens -> specialized Response Plan -> Guidance, default 1 Analysis; compression raises bound to 2 | Structured assessment is a new contract; Response Plan cannot be relabeled as arbitrary Context -> Data |
| Reflect Character/Recall; Internalize | Data, JSON Decode/check, Select Fields, Compose; transfer's injected role-bound request/completion/cancellation pattern | No structured Context -> Data Analysis operation in inspected delivery; retrieval, prior-state and event schemas needed |
| Express Behavior/Attention | Compose can render existing assessment fields as Guidance with 0 requests | Fresh interpretation requires separately counted Analysis; guidance is not displayed prose |
| Inner Voice | Text artifact exists | Prose generation contract and intended destination needed; output is fictional authored text |
| Post-draft Express | Reference Draft preparation/alignment/Patches helpers; Style/Format each <=1 Prose | Reuse permission mechanics, not style-transfer semantics as undeclared psychology editing; new operation needs registration |
| Memory/State extensions | Legacy Memory/State documented; source identity and bounded run diagnostics exist | Existing legacy nodes do not establish native sources, semantic retrieval, typed updates or durable commit support |

Confirmed deterministic boundaries: JSON Decode Text -> Data or Data -> Data; Select Fields Data -> Data; Compose optional Data/named Text sections -> Text or pre Guidance. All have bound 0/modelRole null. Guidance publication remains a host terminal effect.

## Proposed schemas: NOT implemented contracts

Keep existing `data` kind with versioned domain records and one analysis `out:Data`. Select Fields/Compose inside a definition can derive multiple interface outputs; one primitive need not emit different artifacts per pin. Exact IDs, fields, enum values and bounds require agreement.

Common proposed envelope: `{schemaVersion:1,recordType,actorId,chatId,sourceRefs:[],payload}`. References need event/message identity, revision/content identity and evidence location. Validate model-produced IDs against supplied sources. Bindings and host authority never enter exported Data.

- **ActorStateV1:** separate traits, experiences, temporary conditions, beliefs, goals, relationships and conflicts, with stable item/state IDs and prior version. Record evidence and `observation|interpretation|possibility`. Actor visibility must come from a supported source policy. Agree ranges/units/optional fields and permitted update targets before coding.
- **ReflectionV1:** mode `character|recall|scene`; bounded brief, appraisals, competing wants, recalled episode IDs, scene changes, unresolved tensions, optional behavior/attention hints, evidence and uncertainty. Recall IDs must belong to supplied candidates. Proposed inputs: required `context:Context`, optional `state:Data` and `episodes:Data`; output Data. A minimal generic Context-only engine instead needs an agreed provenance-preserving embedding of state/episodes into Context; Compose Text cannot supply this conversion today.
- **StateProposalV1:** mode `experience|pattern|recovery`; actor/chat scope, prior-state identity/version, settled event references, permitted target changes, evidence and proposed-state preview. Changes require typed operations/values and prior-value or version preconditions. Derive preview deterministically or verify it exactly against changes. Proposed inputs: Context, required prior-state Data and settled-events Data, optional tracks Data; output Data with no write authority.
- **Expression:** Behavior/Attention consume Reflection/state Data and produce Guidance, using a deterministic template by default. Inner Voice produces Text with fictional status and actor/source provenance retained in report/Data. A mode changing Text versus Guidance needs validated rewiring or separate internal descriptors, not an unchecked union. Post-draft expression uses Draft -> Patches in post phase.
- **MemoryRead/Recall:** store identity/version, actor/chat scope, selected episodes/state, provenance and omission report. Memory Recall owns retrieval; Reflect Recall interprets supplied candidates. Semantic recall/backend scoring is unspecified, not presumed vector search.
- **Commit/State update intent:** selected validated proposal, expected store/state version, permitted targets, explicit replace/append/merge policy, settled event identity and idempotency key. This proposed host envelope is not Data that automatically grants write authority. Results distinguish stale/rejected, applied in memory, persistence acknowledged and persistence unknown. State Value/Curve/Track require typed ranges/units, time/event identity and recurrence rules; interpretation belongs to Internalize.

JSON Decode supports a bounded schema subset: types, enum/const, properties/required/additionalProperties, items, count/length/numeric limits. Its declaration has no oneOf, if/then, references, evidence or cross-field validation. Select one concrete schema per mode and perform semantic checks separately. JSON validity proves neither psychological truth nor state consistency. Existing Data limits: 262,144 serialized UTF-8 bytes, depth 32, 10,000 values; domain limits must fit those totals.

## Proposed role/call limits

| Path | Role | Maximum |
| --- | --- | --- |
| Structured Reflect, any mode | Analysis | 1 per bounded bundle |
| Internalize, any mode | Analysis | 1 per bounded batch |
| Express Behavior/Attention from assessment fields | none | 0 |
| Express with fresh interpretation | Analysis | 1, explicitly configured alternative |
| Inner Voice / post-draft expression | Prose | 1 |
| Assemble, explicit visibility filter, select Focus | none | 0 |
| Compression via existing Lens | Analysis | <=1 |
| Memory read/deterministic recall/commit; State bookkeeping | none | 0 model requests; host I/O separately bounded |

Recommended first starter: selection/assembly -> Reflect Character including behavior/attention hints -> deterministic Express Behavior -> Guidance. Bound 1 Analysis, or 2 with Context compression. Separate inference-based Express adds another call. Internalize is a separate settled-event run with bound 1; Commit is a host effect, not another model request.

Proposed starting leaf limits: maxTokens default 2048 (integer 1..65536), prompt <=500,000 UTF-16 units, instructions <=10,000, brief <=4096, changes <=32, evidence references <=64, all under Data aggregate limits. These are candidates, not tested contracts. Agree minimum/empty inputs, snapshot-before-await, token counting, abort checks before/after awaits, successful finish evidence, output/schema/semantic validation. Missing/unknown/truncated completion produces no authoritative artifact. No retries, hidden retrieval loops or profile switching. Reuse opaque injected binding/request/countTokens/signal discipline; leaf engines have no host effects.

## Conflicts and integration prerequisites

1. Preserve current reference-tools scope and verification. No unknown operation IDs in current packages; new generic Analysis must be agreed and registered before portable definitions depend on it.
2. Reuse Focus/Scene recipes where appropriate. Response Plan remains specialized Guidance. No duplicate compactor/planner or implicit structured extraction.
3. Incoming handoff reports one primitive artifact copied to output pins, cardinality-one inputs, root-only sources/terminals, acyclic graphs and sequential execution. Respect these constraints until Architecture confirms changes. Cross-turn state is a host concern; no same-run feedback loop or promised parallel inference.
4. Perspective requires explicit source visibility and player-agency policy. Auxiliary filtering cannot guarantee secrecy when the main writer sees underlying facts. Observed player behavior does not establish private player state.
5. State counts/advances clocks; Internalize interprets Pattern/Recovery. Memory retrieves; Reflect associates. Pre reflection is not canonical simply because generation finishes.
6. Post-draft expression preserves frozen Draft permissions, Patches, review and explicit Apply. Deferred cleanup recipes remain unusable until their permission prerequisites are fixed.

Architecture must first confirm the integration revision, context-join/source inventory and current host prepare/settle hooks (the latter are incoming-handoff observations, not independently verified here). Agree exact IDs/versions, descriptors/defaults, named ports, phases, typed mode schemas, roles/bounds and ownership paths, including Context-only Analysis versus auxiliary typed Data inputs.

Persistence intake must define canonical settled events, prior-state/store versions, actor/chat scope, allowed targets, deterministic merge/stale/conflict behavior, idempotency and rollback limits. Cover preview, dry run, cancellation/late completion, normal reply, retry, regenerate, selected/discarded swipes, deletion and edited events. No preview/unchosen draft commits; no disk durability or third-party store integration claims without supported adapter evidence. Preserve imported legacy Memory/State semantics; supported lorebook mirroring is explicit.

Include modes, schemas/prompts, effective controls and model semantics in hashes/freshness; exact definition pins and portable role setup survive round trips with local bindings stripped. Acceptance fixtures should cover bounded/no-retry calls; malformed/truncated/evidence-invalid outputs; player agency; stale/conflicting/double commit; preview/cancel; legacy compatibility; package round trips; and a cross-turn broken-promise/apology example where anger may ease while trust stays guarded.

Tools and Nodes owns agreed recipes, modes, prompts, defaults, examples, bounded leaf engines/adapters and portable definitions. Architecture owns shared contracts, registration, runtime, source/persistence adapters, UI and integration/release. This assessment performed no implementation, tests, paid calls, host effects or cross-chat messaging.
