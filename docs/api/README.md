# API and contracts

[Documentation](../README.md) · [Developer guide](../developer-guide.md) · [Versioning](versioning.md)

This directory defines the interfaces that separate Lattice's **functionality** from its **implementation**. It is a specification: it proposes two versioned contracts and records what should be assimilated into them. It does not add runtime code, routes, or exports.

Two boundaries are in scope:

| Boundary | What it separates | Contract |
| --- | --- | --- |
| [Node plugin API](node-plugin-api.md) | An operation's declared behavior from the core catalog, runtime dispatch, editor, and host adapters | `nodeApi: 1` |
| [Companion HTTP API](companion-http-api.md) | The Hollis ledger and Cartographer rules from the Python service's handler, storage, and presentation | `v1` |

The [interface inventory](interface-inventory.md) is the bridge between them and the current source: every element that crosses a seam is listed with a disposition of **Assimilate**, **Internal**, **Defer**, or **Exclude**.

## Status

**Proposed, not implemented.** The current extension exposes a launcher (`globalThis.lattice = { open, close, toggle }`), a map launcher (`globalThis.spritequest`), and the `latticeGenerationInterceptor`; it has no plug-in registration API. The current companion service exposes its routes without a version prefix, discovery document, or machine-readable schema. The contracts here describe the target surface and mark where today's behavior differs.

Do not treat this directory as evidence that an endpoint, plugin hook, or export exists. The [implementation status](#implementation-status) table below is the quick check.

## Principles

1. **Plain data crosses the boundary.** Graph documents, descriptors, event records, and responses are JSON-compatible values. Host handles, authenticated bindings, DOM nodes, and credentials never cross.
2. **Capabilities are injected, not ambient.** A node plugin receives only the named capabilities it is granted; the host does not hand it `fetch`, `document`, `globalThis.SillyTavern`, storage, or a token. A same-realm verified plugin is trusted code, not a sandbox; the community tier requires an isolation boundary.
3. **The durable identity is separate from the implementation.** A saved node names `operation` and `operationVersion`; an HTTP resource names a stable entity such as `npc/hollis`. Renaming a module or a Python class does not rename the contract.
4. **A refusal carries its reason.** Validation, admission, execution, and transport failures return a structured error. Silence, a bare string, or an HTML error page is not a contract.
5. **Append-only authority stays append-only.** The companion log is the source of truth; the roster is a fold of it. An API convenience must not create a second authority.
6. **Version the contract, not the checkout.** `0.27.3` is a release. `nodeApi: 1` and companion `v1` are compatibility promises with their own lifecycles.

## Contract identifiers

| Identifier | Owner | Appears in | Meaning |
| --- | --- | --- | --- |
| `nodeApi` | Host | Plugin manifest `apiVersion`, `PluginHost.apiVersion` | Major version of the plug-in host surface. `1` is the proposed first stable major. |
| `operationVersion` | Saved graph | `node.operationVersion` | Version of one operation's serialized controls and meaning. Currently `1` for every core operation. |
| `schema` / `runtime` | Saved graph | `graph.schema`, `graph.runtime` | Workflow document format. Currently `3` / `2`. Not an API version; a document-format gate. |
| `api` | Companion service | `/v1` path, `/v1/capabilities` | Major version of the HTTP contract. The URL carries the major. |
| `eventSchema` | Companion service | `/v1/capabilities` | Version of the `EventRecord` wire schema. Proposed `1`. |
| `capabilities` | Both | `/v1/capabilities`, plugin manifest | Named optional features. Absence means unsupported, never "try it and see". |

A plugin that targets `nodeApi: 1` must not be loaded by a host that advertises `nodeApi: 2` without an explicit compatibility bridge. A client that targets companion `v1` must not silently retry a `v2`-only feature.

## Stability tiers

| Tier | Promise | Examples |
| --- | --- | --- |
| **Stable** | Additive changes only within the major. Removal needs a deprecation window and a new major. | Node descriptor fields, `execute` result shape, `/v1/roster`, `/v1/events` |
| **Provisional** | Shape is published and tested, but may change in a minor with a migration note. | Cartographer resources, dynamic-port authoring |
| **Experimental** | No compatibility promise; may move or disappear. | Forge and waterfall routes, host-effect plugin capability |
| **Internal** | Never part of the contract. Changing it is not a breaking API change. | `OPERATIONS` map, `dynamicDescription`, `ThreadingHTTPServer`, response indentation |

The inventory names a disposition and, where it applies, a tier. A tier may only move upward through the [versioning policy](versioning.md).

## Documents

| Document | Read it to… |
| --- | --- |
| [Interface inventory](interface-inventory.md) | See what currently crosses each seam and what should be assimilated, kept internal, deferred, or excluded. |
| [Node plugin API](node-plugin-api.md) | Design or review an operation that does not require editing core source. |
| [Companion HTTP API](companion-http-api.md) | Call, implement, or version the ledger and Cartographer service. |
| [Versioning](versioning.md) | Decide whether a change is additive, breaking, or merely a documentation fix. |
| [`contracts/node-plugin.d.ts`](contracts/node-plugin.d.ts) | Read the TypeScript shape of the plug-in host contract. |
| [`contracts/companion.openapi.yaml`](contracts/companion.openapi.yaml) | Generate a client or validate a response against the HTTP contract. |
| [`contracts/companion.schemas.json`](contracts/companion.schemas.json) | Validate an `EventRecord` or a roster line independently of the service. |

## How the two APIs meet

A workflow node may need to read or write the companion service. In the target design that happens through two explicit pieces, neither of which is ambient:

1. A node operation declares a **network capability** and an allowlisted origin. The plugin API v1 keeps arbitrary network access out of the default grant; a service-call operation is a candidate for v2 or a verified core plugin.
2. The transport is injected by the host as a network service; this is deferred in v1. The companion contract is transport-agnostic: it defines JSON bodies, status codes, and idempotency, not how a node obtains a socket.

Today the shipped workflows do not contain a Service Call node. The [inventory](interface-inventory.md#documentation-claims) records the earlier mismatch rather than inventing the node in this pass; `companion/README.md` now states the gap.

## Implementation status

| Claim | Current state | Contract status |
| --- | --- | --- |
| Third-party node registration | No public registration API | Proposed `nodeApi: 1` |
| Built-in operation families | Static imports and hardcoded dispatch | Target: first-party plugins on the same registry |
| Companion version prefix | Unversioned routes such as `/roster` | Proposed `/v1/roster`; old paths may alias during a transition |
| Companion discovery | No capabilities endpoint | Proposed `/v1/capabilities` |
| Companion schema publication | Python dataclasses only | Proposed JSON Schema + OpenAPI |
| Companion authentication | None; loopback bind | Proposed optional bearer token and origin allowlist |
| Forge routes | Mixed into the same handler | Excluded from v1; experimental namespace |
| `globalThis.lattice` | `{ open, close, toggle }` | Not part of these contracts; a launcher convenience |

## Non-goals

- Publishing an npm SDK or changing `package.json` exports. The package remains `private: true`.
- Replacing the workflow document format. `schema: 3` / `runtime: 2` stays.
- Granting third-party code native host authority or arbitrary network access in v1.
- Defining the visual editor's internal DOM, Svelte component props, or canvas contracts. Those remain implementation details described in the [developer guide](../developer-guide.md).
- Versioning the Forge, waterfall, ComfyUI, terrain, or map pipelines. They may consume authored data; they are not part of the companion API v1.

## Crossing the fourth wall

The companion resources are also story objects. The [Hollis ledger](../mini_campaign_the_unwritten_consignment.md) is the in-world record that gives an object or a role standing; the Bureau of the Unwritten Atlas and its Cartographers certify maps and fragments. The HTTP contract and the fiction must agree on *authority* even though they describe it differently.

The [companion API's diegetic counterpart table](companion-http-api.md#diegetic-counterparts) states both sides:

- **In-world:** who keeps the record and what a line means to a character.
- **Concrete:** the JSON resource, the validation rule, and the endpoint that changes it.

An engineering change that alters authority (for example, allowing a model-authored event without provenance) is therefore also a lore change, and must be reviewed as one.