# Contract versioning

[API overview](README.md) · [Node plugin API](node-plugin-api.md) · [Companion HTTP API](companion-http-api.md)

This policy answers one question for every change: **may an existing consumer keep working without modification?**

It applies to the two published contracts. It does not apply to the extension release version, the workflow document format, or internal modules.

## Version identifiers

| Identifier | Where it lives | Changes when | Does not change when |
| --- | --- | --- | --- |
| Release version | `manifest.json`, `package.json` | Any shipped change | A contract stays compatible across releases |
| `nodeApi` | Plugin manifest, host activation | A required plugin field, hook, or capability meaning changes incompatibly | A new optional capability or presentation field |
| `operationVersion` | Saved node | The meaning or shape of that operation's saved controls changes | A label, help text, or internal implementation changes |
| `schema` / `runtime` | Workflow graph | The document format changes | A node is added within the format |
| Companion `api` | `/v1` path, capabilities | A route, field, status code, or resource meaning changes incompatibly | A new optional field or endpoint |
| `eventSchema` | Capabilities, schema artifact | `EventRecord` gains a required field or changes a field's meaning | A new optional `data` shape for a new event kind |
| Capability flags | Capabilities document, plugin manifest | A named optional feature is added or removed | The feature's implementation changes |

A release may ship `0.28.0` while `nodeApi: 1`, `operationVersion: 1`, and companion `v1` remain unchanged. That is the normal case.

## Semantics

The contracts use **major.minor.patch** reasoning without exposing a full SemVer string for each sub-surface. A **provisional** resource is the one exception: it may change in a minor with a migration note, because it has not yet earned a stable promise.

### Major

A major change requires a new major identifier and a migration path. It includes:

- removing or renaming a field, endpoint, hook, capability, or error code;
- changing the type of an existing field;
- changing the meaning of an existing value (for example, `status: "written"` starts meaning "acknowledged" instead of "appended");
- changing a default that alters observable behavior;
- changing a status code for an existing condition;
- requiring a new field in a request;
- making an optional field required;
- changing the close/quorum semantics of an append or a fold.

### Minor

A minor change is additive and must leave every valid existing request and response valid:

- adding an optional request field;
- adding a response field;
- adding an endpoint or route;
- adding a capability flag;
- adding an error code for a new condition (existing conditions keep their code);
- adding an enum value only when the consumer is required to ignore unknown values. If a consumer must understand every value to stay correct, the addition is a major change.
- adding a new `EVENT_KINDS` entry is a **minor** only if old folds remain correct when they encounter it as a record. If it changes the fold, it is a major change.

### Patch

A patch changes no observable contract:

- documentation, comments, and examples;
- internal refactoring;
- performance;
- a message text improvement that keeps the code and meaning;
- a bug fix that restores the documented behavior.

A patch must not be used to "fix" a consumer that relied on undocumented behavior.

## Unknown fields and forward compatibility

| Direction | Rule |
| --- | --- |
| Request body, typed object | Unknown fields are rejected with `INVALID_REQUEST` unless the schema says `additionalProperties: true`. |
| `data` / `provenance` | Free-form JSON; a consumer must preserve what it does not understand. |
| Response body | A client must ignore unknown fields. |
| Plugin descriptor | A host must reject an unknown required field. An unknown optional field is preserved but not interpreted. |
| Saved node controls | Unknown controls are preserved on round-trip. A plugin that does not recognize a control must not silently drop it. |
| Error `details` | A client must ignore unknown keys. |

The asymmetry is deliberate: writers are strict, readers are tolerant.

## Deprecation

A deprecation is a promise, not a deletion.

1. Mark the item deprecated in the contract and in the generated documentation.
2. Keep it working for the support window.
3. Return a warning where the protocol allows one:
   - HTTP: `Deprecation: true` and `Sunset: <HTTP-date>` response headers.
   - Plugin host: a `deprecated` descriptor field and a one-time admission warning.
4. Name the replacement and the migration.
5. Remove it only in the next major.

The proposed support window is **one major plus one minor release**, or six months, whichever is longer, for a local-first project. The window is intentionally not tied to a calendar date in this document; the release that starts a deprecation records the end condition in its notes.

## Capability negotiation

A version number is coarse. Capabilities describe optional behavior.

- A client reads `GET /v1/capabilities` before using an optional feature.
- A plugin declares `capabilities` in its manifest and operation definitions; the host grants or denies them.
- An absent capability means "not supported", never "try it and handle a failure".
- A capability may be added in a minor. Removing one is a major change.
- A capability name is stable even if its implementation changes.

Example:

```json
{
  "features": ["ledger", "guidance", "cartographers"],
  "limits": { "maxBatchEvents": 1000 }
}
```

A client that needs an optional behavior checks `features`; absence means unsupported. Atomic batch append is a v1 prose requirement, not an optional feature.

## Sources of truth

| Contract | Normative artifact | Checked implementation |
| --- | --- | --- |
| Node plugin API | [`contracts/node-plugin.d.ts`](contracts/node-plugin.d.ts) and the prose in [node-plugin-api.md](node-plugin-api.md) | Host registry and conformance fixture (future) |
| Companion HTTP | [`contracts/companion.openapi.yaml`](contracts/companion.openapi.yaml) and [`contracts/companion.schemas.json`](contracts/companion.schemas.json) | [`companion/schemas.py`](../../companion/schemas.py), [`forge_service.py`](../../companion/forge_service.py) |
| Saved workflow | [`src/workflow/types.d.ts`](../../src/workflow/types.d.ts), `schema: 3` | [`graph-validation.js`](../../src/workflow/graph-validation.js) |

Rules:

1. A change to a normative artifact is a contract change and follows the classification above.
2. Prose may clarify but must not add a requirement that the artifact does not express. If it does, the artifact is incomplete.
3. An implementation may be ahead of the artifact only behind a capability flag and an experimental tier.
4. A generated client must be regenerated from the normative artifact, not hand-edited.
5. The Python dataclasses remain the runtime types, but a fixture test must validate their serialized output against the JSON Schema. A mismatch is a defect in the implementation, not a second truth.

## Compatibility matrix

| Consumer | Producer | Guarantee |
| --- | --- | --- |
| Plugin `nodeApi: 1` | Host `nodeApi: 1` | Loads; optional capabilities may be absent. |
| Plugin `nodeApi: 1` | Host `nodeApi: 2` | Refused unless the host advertises a v1 compatibility bridge. |
| Plugin `nodeApi: 2` | Host `nodeApi: 1` | Refused. |
| Companion client `v1` | Service `v1` | Every documented stable route works. Provisional routes may change in a minor with a note. |
| Companion client `v1` | Service `v2` | Works only if the service keeps a `/v1` adapter. A v2 service need not. |
| Workflow `schema: 3` | Host `runtime: 2` | Runs. A plugin added to the graph requires that plugin. |
| Workflow `schema: 3` | Host without the plugin | Fails closed with `PLUGIN_MISSING`; it does not drop the node. |

## Change checklist

Before merging a contract change:

1. **Classify.** Major, minor, or patch? Name the affected identifier.
2. **Check both sides.** Does the change alter authority, privacy, or the append-only law? If yes, review the diegetic counterpart in [companion-http-api.md](companion-http-api.md#diegetic-counterparts).
3. **Update the artifact.** `node-plugin.d.ts`, OpenAPI, or JSON Schema.
4. **Update the prose.** A reader must not need the diff to understand the contract.
5. **Add a fixture.** A valid case and a refusal case for every new rule.
6. **Check compatibility.** Run the old fixture against the new implementation.
7. **Record the deprecation.** If something is removed or renamed, add the window and replacement.
8. **Do not bump the release to signal a contract change.** The identifiers carry that meaning.

## Worked examples

### Additive, minor

Add `GET /v1/ledger?entity=npc/hollis`:

- existing requests remain valid;
- the default response is unchanged;
- a client that ignores the query parameter is unaffected;
- capabilities may advertise `ledger.filter.entity`.

### Breaking, major

Change `POST /v1/events` to require an `Idempotency-Key` header:

- an existing client that omits it starts failing;
- no additive reading preserves both behaviors;
- therefore `/v2`, or a new endpoint, or an optional header that defaults to the body `id`.

### Additive, patch

Change the wording of `EVENT_REFUSED` from "role needs a gate" to "role.authored must carry a gate verdict":

- the code and the condition are unchanged;
- a client that matches on the code is unaffected;
- a client that matches on the exact message was relying on undocumented behavior.

### Plugin operation version

Add an optional `separator` control to a text operation:

- absent means the previous default;
- old saved nodes keep their meaning;
- `operationVersion` stays `1`;
- the descriptor gains an optional control, a minor `nodeApi` change.

Change `separator` from "join with this string" to "split on this string":

- old saved nodes now mean something different;
- `operationVersion` becomes `2`;
- a `migrate` hook is required for version `1` nodes.

## Open questions

| Question | Status |
| --- | --- |
| Exact support-window duration | Proposed one major plus one minor, or six months, whichever is longer. |
| Whether `eventSchema` versions independently of `api` | Proposed yes: a new event kind may be additive while the route stays `v1`. |
| Whether a plugin can declare its own capability | No in v1; capabilities are host-defined. |
| Whether the OpenAPI document is generated or hand-maintained | Hand-maintained for v1; generation is a later tooling decision. |
| Whether unversioned companion paths get a full support window | Proposed one minor release with `Deprecation`/`Sunset`, then removal. |