# Interface inventory

[API overview](README.md) · [Node plugin API](node-plugin-api.md) · [Companion HTTP API](companion-http-api.md) · [Versioning](versioning.md)

This is the assimilation register. It lists the elements that already cross, or should cross, an API seam and records what happens to each one. The purpose is to stop functionality from being reachable only by editing an implementation detail.

## How to read a disposition

| Disposition | Meaning |
| --- | --- |
| **Assimilate** | The element becomes part of a published contract. A consumer may depend on it; a change follows [versioning](versioning.md). |
| **Internal** | The element stays an implementation detail. It may be refactored freely; the contract names the behavior, not this code. |
| **Defer** | The element is acknowledged but is not in v1. It may enter a later minor or major. |
| **Exclude** | The element must not become a public contract, usually because it carries authority, secrets, or unbounded code. |
| **Contradicted** | The repository currently claims something that is not true. The specification records the gap; a documentation fix is in scope. |

### Assimilation criteria

An element is eligible when at least one is true:

- it crosses a process boundary;
- it is authored or serialized by a user;
- a third party must implement it to interoperate;
- it encodes a compatibility promise.

An element is not eligible merely because it is convenient, widely imported, or hard to change. Host authority, credentials, editor internals, and rendering primitives are excluded even when they are stable in practice.

## Assimilation summary

What we want the API to absorb, because it crosses a seam:

**Node plugin boundary**

- Operation identity and version (`operation`, `operationVersion`).
- The descriptor: family, phase, artifact kinds, controls, defaults, request bound, model role, root/terminal/dynamic-port constraints.
- Ports and artifact envelopes; result, port-state, and error contracts.
- The `describe` / `validate` / `execute` / `migrate` lifecycle.
- The injected capabilities: text request, tokenizer, clock, randomness.
- Discovery and presentation data: purpose, shortcode, aliases, guide, examples.
- Admission limits and the error codes a saved graph can produce.
- The outbound service-call transport, so a workflow can read `/guidance` or post `/events` without a bespoke host adapter. This is deferred in v1 because network access is not a default capability.

**Companion boundary**

- `EventRecord`, `Gate`, the fold semantics, and the closed vocabularies.
- The core ledger resources: health, roster, guidance, ledger, events.
- The provisional Cartographer resources: status, ledger, survey, curate, criticize.
- Discovery, the uniform error envelope, idempotency, sequence conflict, and pagination.
- The single-writer append law and the at-least-once/exactly-once delivery rule.

What we deliberately do **not** absorb:

- Native host authority, settlement, prompt injection, or generation interception.
- Arbitrary network access, credentials, or connection profiles.
- Modifiers, editor DOM, Svelte component props, canvas internals, or build output.
- Forge, waterfall, terrain, map, and static-content routes.
- Python dataclasses, `ThreadingHTTPServer`, response indentation, or CORS `*` as an implementation default.

## Node and workflow surfaces

| Element | Current owner | What crosses | Disposition | Contract anchor / notes |
| --- | --- | --- | --- | --- |
| `OPERATIONS` registry | [`catalog.js`](../../src/workflow/catalog.js) | Operation identity, descriptor, defaults, controls | **Assimilate** (identity and descriptor only) | The map is internal; `operation` IDs and descriptor fields become `nodeApi: 1`. |
| `FAMILIES` | [`catalog.js`](../../src/workflow/catalog.js) | Shelf family grouping | **Assimilate** | Closed set in v1: Input, Shaping, Surface, Transpose, Introspection, Derive, Events, Collections, Randomness, Recall, Output. A new family is a host change. |
| `ARTIFACT_KINDS` | [`catalog.js`](../../src/workflow/catalog.js) | Port kinds | **Assimilate** | Closed v1 set: `context`, `draft`, `patches`, `candidate`, `guidance`, `text`, `data`. New kinds require a major or an explicit extension negotiation. |
| `OperationDescriptor` | [`types.d.ts`](../../src/workflow/types.d.ts) | Declared behavior | **Assimilate** | Phase, modes, input/output, ports, request bound, model role, terminal, root restrictions, dynamic ports. |
| `ControlDescriptor` | [`types.d.ts`](../../src/workflow/types.d.ts) | Authoring controls and validation | **Assimilate** | Types: string, integer, number, boolean, enum, json-value, array, object. Labels, help, visibility, bounds. |
| `newOperation(id)` | [`catalog.js`](../../src/workflow/catalog.js) | Membership test with a hardcoded family list | **Internal** | Replaced by a registry lookup by operation ID; the descriptor's family is presentation. |
| `dynamicDescription(node)` | [`catalog.js`](../../src/workflow/catalog.js) | Per-family `if` chain | **Internal** | The contract is `OperationDefinition.describe`; the chain is not API. |
| Family `describe*Node` functions | `src/workflow/operations/*` | Phase-aware descriptor and ports | **Assimilate** | Optional `describe(context)` hook; a static descriptor may supply the default. |
| Family `execute*` functions | `src/workflow/operations/*` | Artifact production | **Assimilate** | `execute(context)` returning `OperationResult`. |
| `executeNode` dispatch | [`runtime.js`](../../src/workflow/runtime.js) | Hardcoded family `if` chain | **Internal** | Replaced by registry dispatch. Built-in plugins prove the registry before third parties rely on it. |
| `OperationExecutionContext` | [`types.d.ts`](../../src/workflow/types.d.ts) | Phase, root, address, input states, signal, request | **Assimilate** (reduced) | Public context exposes only declared capabilities; root mode and host ownership stay host-side. |
| `IterationRequest` | [`control-nodes.d.ts`](../../src/workflow/operations/control-nodes.d.ts) | Text-completion request | **Assimilate** as `TextRequestService` | Messages, max tokens, signal, model role; `binding` and `childAddress` stay host authority. Returns a `Result` with text and usage. |
| `countTokens` | Runtime ports | Token counting | **Assimilate** as `TokenCounter` | Returns `{ tokens, method }`; method is evidence, not decoration. |
| `AbortSignal` | Runtime ports | Cancellation | **Assimilate** | A plugin MUST stop at a checkpoint and MUST return an `ABORTED` failure, not a partial artifact. |
| `iterateHelper`/`IterateHelper` | [`control-nodes.d.ts`](../../src/workflow/operations/control-nodes.d.ts) | Nested helper execution | **Defer** | Powerful and authority-bearing; not a v1 third-party capability. |
| HTTP service call (`serviceRequest`) | Not in this checkout; described in [`lattice-integration.md`](../../.scratch-review/lattice-integration.md) for a different fork | Outbound request to a local service | **Defer** | A v1 plugin has no network capability. A verified plugin may request an allowlisted origin in a later minor; the companion contract is transport-agnostic. |
| `executeHostOperation` | [`types.d.ts`](../../src/workflow/types.d.ts) | Native effects, staging, settlement | **Exclude** | Core operations only. A third-party plugin cannot receive host authority in v1. |
| `hostOperation` / `nativeBoundary` | Descriptors | Root-owned host behavior | **Exclude** (for third parties) | A saved node that declares it requires a core operation; a third-party declaration is rejected so the graph fails closed. |
| `rootOnly` / `requiresStateInDefinition` | Descriptors | Where an operation may appear | **Assimilate** | Constraint declarations with the same admission meaning. |
| `terminal` | Descriptors | No routable output | **Assimilate** | Review/Publish is the canonical terminal. |
| `dynamicPorts` | Descriptors | Ports depend on settings | **Assimilate** (provisional) | `describe` may return a different port set; admission validates the result. |
| `requestBound` / `modelRole` | Descriptors | Budget and model role | **Assimilate** | Bounds are enforced by the host, not trusted from the plugin. |
| `WorkflowArtifact` | [`types.d.ts`](../../src/workflow/types.d.ts) | Artifact envelopes | **Assimilate** | Text, Data, Guidance, Context, Draft, Patches, Candidate. |
| `PortState` | [`types.d.ts`](../../src/workflow/types.d.ts) | completed / skipped / unresolved | **Assimilate** | A plugin may mark declared outputs; it may not mark an input completed. |
| `OperationResult` | [`types.d.ts`](../../src/workflow/types.d.ts) | Success/failure envelope | **Assimilate** | `artifact`, `outputs`, `outputStates`, `reports`; or `WorkflowError`. |
| `WorkflowError` codes | [`types.d.ts`](../../src/workflow/types.d.ts) | Machine-readable failure | **Assimilate** | Codes are stable; messages are user-facing text and may improve. |
| `RunEvent` | [`types.d.ts`](../../src/workflow/types.d.ts) | Editor/recording telemetry | **Internal** | Not a plugin contract. A plugin reports through its result and logger. |
| `validateWorkflow` admission | [`graph-validation.js`](../../src/workflow/graph-validation.js) | Graph acceptance | **Internal** (behavior assimilated) | The gate stays host-owned; its error codes and limits are published. |
| Graph limits | [`graph-validation.js`](../../src/workflow/graph-validation.js) | 1,000 nodes / 2,000 wires, bounded data | **Assimilate** | Documented admission limits, not a performance guarantee. |
| `modifiers` | [`modifiers.js`](../../src/workflow/modifiers.js) | Output post-processing | **Defer** | A plugin may declare compatibility, but modifier semantics are not v1. |
| Family `.d.ts` files | `src/workflow/operations/*.d.ts` | Internal source contracts | **Internal** | Replaceable by the published plugin types; they do not obligate a third party. |
| `native-search-catalog.js` metadata | [`native-search-catalog.js`](../../src/ui/native-search-catalog.js) | Purpose, shortcode, aliases, presets | **Assimilate** as optional `presentation` | Data only; no arbitrary HTML or DOM. |
| `node-guide-content.js` | [`node-guide-content.js`](../../src/ui/node-guide-content.js) | In-editor guide | **Assimilate** as optional `presentation.guide` | Summary and sections; host renders them. |
| `node-guide-examples.js` | [`node-guide-examples.js`](../../src/workflow/node-guide-examples.js) | Example insertion | **Assimilate** as optional `presentation.examples` | Examples must validate against the descriptor. |
| Saved workflow JSON | [`workflows/`](../../workflows/) | User-authored graphs | **Assimilate** as the consumer format | `schema: 3`, `runtime: 2`, `operation`, `operationVersion`. |
| `globalThis.lattice` | [`index.js`](../../index.js) | Launcher open/close/toggle | **Exclude** | A host convenience, not a workflow or plugin API. |
| `dist/lattice-ui.js` | [`dist/`](../../dist/) | Built Svelte bundle | **Internal** | Build output; never a contract. |

## Companion HTTP surfaces

| Element | Current owner | What crosses | Disposition | Contract anchor / notes |
| --- | --- | --- | --- | --- |
| `EventRecord` | [`schemas.py`](../../companion/schemas.py) | One append-only line | **Assimilate** | `seq`, `kind`, `entity`, `actor`, `data`, `gate`, `provenance`. |
| `Gate` | [`schemas.py`](../../companion/schemas.py) | Deterministic verdict | **Assimilate** | `rule`, `verdict`, `checks`; `verdict` is never inferred. |
| `fold_events` | [`schemas.py`](../../companion/schemas.py) | Roster projection | **Assimilate** as semantics | Not an endpoint. The roster is always a fold; no stored mutable entity. |
| Closed vocabularies | [`schemas.py`](../../companion/schemas.py) | Role, actor, kind, verdict, disposition, world | **Assimilate** | Extension requires a documented version change, not a silent widening. |
| `_record` / `SchemaError` | [`forge_service.py`](../../companion/forge_service.py) | Wire-to-record validation | **Internal** (codes assimilated) | The reason text crosses; the exception class does not. |
| `GET /health` | [`forge_service.py`](../../companion/forge_service.py) | Liveness and state summary | **Assimilate** (stable) | Proposed `/v1/health`; include contract version. |
| `GET /roster` | [`forge_service.py`](../../companion/forge_service.py) | Folded characters | **Assimilate** (stable) | Proposed `/v1/roster`; member shape and refusal line. |
| `GET /guidance` | [`forge_service.py`](../../companion/forge_service.py) | One injectable text block | **Assimilate** (stable) | Proposed `/v1/guidance`; `{ guidance, count }`. |
| `GET /ledger` | [`forge_service.py`](../../companion/forge_service.py) | Append-only log | **Assimilate** (stable) | Proposed `/v1/ledger`; add `since_seq`, `limit`, `entity` without changing the default shape. |
| `POST /events` | [`forge_service.py`](../../companion/forge_service.py) | Accepted events | **Assimilate** (stable) | Proposed `/v1/events`; idempotency, receipts, 400/409. |
| `GET /cartographers/status` | [`forge_service.py`](../../companion/forge_service.py) | Maturity counts and criticisms | **Assimilate** (provisional) | Proposed `/v1/cartographers/status`. |
| `GET /cartographers/ledger` | [`forge_service.py`](../../companion/forge_service.py) | Fragment entries and warrants | **Assimilate** (provisional) | Proposed `/v1/cartographers/ledger`. |
| `POST /cartographers/survey` | [`forge_service.py`](../../companion/forge_service.py) | Coherence audit and minting | **Assimilate** (provisional) | Proposed `/v1/cartographers/survey`; model-minted fragments are provisional. |
| `POST /cartographers/curate` | [`forge_service.py`](../../companion/forge_service.py) | Human warrant | **Assimilate** (provisional) | Proposed `/v1/cartographers/curate`; actor is human. |
| `POST /cartographers/criticize` | [`forge_service.py`](../../companion/forge_service.py) | Human criticism tombstone | **Assimilate** (provisional) | Proposed `/v1/cartographers/criticize`; actor is human. |
| `/forge/pipeline*` | [`forge_service.py`](../../companion/forge_service.py) | ComfyUI/3D pipeline state | **Exclude** from v1 | Experimental namespace, not part of the companion contract. |
| `/forge/waterfall*` | [`forge_service.py`](../../companion/forge_service.py) | Waterfall job status | **Exclude** from v1 | Experimental. |
| `/forge/compile` | [`forge_service.py`](../../companion/forge_service.py) | Asset brief compilation | **Exclude** from v1 | Experimental. |
| `/forge/workflow/snapshot` | [`forge_service.py`](../../companion/forge_service.py) | ComfyUI snapshot read | **Exclude** from v1 | Experimental. |
| `/renders/*`, `/library/*`, `/companion/web/*` | [`forge_service.py`](../../companion/forge_service.py) | Static files | **Exclude** | Content origin, not API. Serve from a separate origin or path policy. |
| `/`, `/viewer`, `/preview` | [`forge_service.py`](../../companion/forge_service.py) | HTML viewer | **Exclude** | Presentation; not JSON API. |
| `known_routes` | [`forge_service.py`](../../companion/forge_service.py) | Route discovery | **Internal** | Replaced by `GET /v1/capabilities`. |
| Ad-hoc error dictionaries | [`forge_service.py`](../../companion/forge_service.py) | `error`/`reason` strings | **Assimilate** as one envelope | Stable `code`, human `message`, optional `details`, `requestId`. |
| CORS `*` | [`forge_service.py`](../../companion/forge_service.py) | Browser access policy | **Internal** (policy assimilated) | Target is an explicit origin allowlist; loopback development may opt into `*`. |
| No authentication | [`forge_service.py`](../../companion/forge_service.py) | Local trust | **Internal** (policy assimilated) | Loopback bind stays; optional bearer token for non-loopback use. |
| `--seed-from` | [`forge_service.py`](../../companion/forge_service.py) | Seed CLI | **Internal** | Deployment concern, not HTTP API. |
| State path in `/health` | [`forge_service.py`](../../companion/forge_service.py) | Local filesystem detail | **Assimilate** with care | MAY be returned to a loopback client; MUST be redactable. |
| `indent=2` JSON | [`forge_service.py`](../../companion/forge_service.py) | Wire formatting | **Internal** | Clients MUST NOT depend on whitespace. |
| `ThreadingHTTPServer` | [`forge_service.py`](../../companion/forge_service.py) | Concurrency model | **Internal** | The contract publishes the single-writer append law, not the class. |
| Incremental batch append | [`Ledger.append`](../../companion/forge_service.py) | Partial batch on failure | **Assimilate** as target atomicity | v1 target: validate all, then append; today's service may append earlier items before a later refusal. |
| `LINES` / `line_for` | [`forge_service.py`](../../companion/forge_service.py) | Roster `line` text | **Internal** (field assimilated) | The `line` field is stable; the mapping may change with the fiction. |
| `SceneZoneContext` | [`fragment_compiler.py`](../../companion/fragment_compiler.py) | Survey zone evidence | **Assimilate** (provisional) | `scene_id`, `zone_id`, `zone_name`, substrate, reverb, elevation, interior. |
| `CoherenceConflict` | [`fragment_compiler.py`](../../companion/fragment_compiler.py) | Survey conflict | **Assimilate** (provisional) | IDs, kind, severity, description, proposed fragment/detail/facts. |
| Saturation report | [`CartographersLedger`](../../companion/fragment_compiler.py) | Parsimony evidence | **Assimilate** (provisional) | Counts, score, threshold, lock, pending cap. |
| Python dataclasses | [`schemas.py`](../../companion/schemas.py) | Implementation types | **Internal** | JSON Schema is normative; Python is checked against it. |

## Documentation claims

| Claim | Where | Reality | Action |
| --- | --- | --- | --- |
| "There is no external plug-in registration API in `0.27.3`" | [`docs/developer-guide.md`](../developer-guide.md) | True today; a v1 contract is proposed | **Consistent**: current fact retained; the proposed API is linked. |
| SillyTavern calls `GET /guidance` "via Lattice `Service Call` nodes" | [`companion/README.md`](../../companion/README.md) | No Service Call node exists in this checkout; shipped workflows use file and model nodes | **Fixed**: the README now states the current gap and links the proposed HTTP contract. |
| Companion routes are `/health`, `/roster`, `/guidance`, `/ledger`, `/events` | [`companion/README.md`](../../companion/README.md) | The handler also exposes cartographer and forge routes | **Fixed**: the README now points to the proposed v1 contract and names Forge as outside it. |
| "No published SDK exports" | [`docs/developer-guide.md`](../developer-guide.md) | Still true; this pass does not publish one | **Consistent**: the reuse section states that the contracts are specification-only. |
| Service Call exists "in the fork" | [`.scratch-review/lattice-integration.md`](../../.scratch-review/lattice-integration.md) | Refers to a different checkout, not this repository | **Out of scope**: do not present it as available here. |

## Decisions

| ID | Decision | Rationale |
| --- | --- | --- |
| D1 | Third-party plugins do not get host effects in v1. | Native settlement carries authority; a plug-in API that grants it cannot be honest about isolation. |
| D2 | Arbitrary network access is not a default capability. | A node that can POST anywhere can exfiltrate story data. Network is an explicit, allowlisted grant. |
| D3 | Forge/waterfall/static routes are outside companion v1. | They are a different product surface with different lifecycle and failure modes. |
| D4 | JSON Schema is normative for the companion wire; Python dataclasses are checked against it. | Avoids a third source of truth and lets a non-Python client validate. |
| D5 | `/v1` is the canonical path; unversioned paths may alias during one transition window. | Protects existing local integrations without freezing them forever. |
| D6 | Event batch append is atomic in the target contract. | A partial batch makes "the log is the truth" ambiguous for the caller. |
| D7 | The v1 family list is closed. | A plugin should extend an existing shelf, not invent a taxonomy the UI cannot present. |
| D8 | Unknown response fields are ignored; unknown request fields are rejected unless the schema says `additionalProperties: true`. | Forward compatibility for readers, strictness for writers. |
| D9 | `nodeApi`, `operationVersion`, and companion `v1` version independently. | The host, a saved operation, and a Python service have different release cadences. |