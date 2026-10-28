# Companion HTTP API v1

[API overview](README.md) · [Interface inventory](interface-inventory.md) · [Versioning](versioning.md) · [OpenAPI](contracts/companion.openapi.yaml) · [JSON Schema](contracts/companion.schemas.json)

**Status:** proposed. The current service in [`forge_service.py`](../../companion/forge_service.py) exposes unversioned routes and no machine-readable contract. This document defines the v1 target; the [migration](#migration-from-unversioned-routes) section explains how today's paths relate to it.

## Purpose

The companion service is the HTTP face of the Hollis ledger. A workflow asks who is present and what they can be relied on for; the model writes a reply; when the player accepts it, the workflow posts the accepted events and the roster moves.

The API separates:

- **Functionality:** the append-only law, the gate/provenance requirements, the fold that produces a roster, and the Cartographer rules that certify fragments.
- **Implementation:** the Python handler, JSONL file, dataclasses, threading model, and response formatting.

A client depends on the contract, not on `forge_service.py`.

## Principles

1. **The log is the authority; the roster is a projection.** No endpoint stores a mutable character. A roster line is always a fold of events.
2. **Every state change is an event.** A read endpoint cannot mutate; a write endpoint appends. There is no "set role" endpoint.
3. **A gate verdict is evidence, not confidence.** `unevaluated` is a first-class outcome and never a silent pass.
4. **A refusal names its reason.** Validation failures return the field and the rule, not a bare "bad request".
5. **Delivery is at least once; the log is exactly once.** Event identity makes a re-post safe.
6. **No secrets in the log.** Provenance names a source; it does not carry a token.

## Base URL and versioning

```text
http://127.0.0.1:8788/v1
```

- The major version is in the path. A breaking change creates `/v2`; it does not reinterpret `/v1`.
- Responses are `application/json; charset=utf-8`.
- A request with a body must send `Content-Type: application/json`. Another media type is `415`.
- The service MUST NOT return an HTML error page for an API route. A reverse proxy in front of it must preserve that rule.
- `GET /v1/capabilities` is the discovery document. A client must read it before assuming an optional feature.

## Transport policy

| Concern | v1 rule |
| --- | --- |
| Bind address | Loopback (`127.0.0.1`) by default. |
| Non-loopback | Refused unless a bearer token is configured. |
| Authentication | Optional `Authorization: Bearer <token>`. A loopback deployment may omit it; a non-loopback deployment must require it. |
| CORS | Explicit origin allowlist. Localhost origins may be allowlisted by default. `*` is a development-only opt-in. |
| Preflight | `OPTIONS` returns `204` with no body and the allowlist headers. |
| Request body | Maximum 1 MiB unless the capabilities document advertises a different limit. |
| Batch | Maximum 1,000 events per `POST /v1/events`. |
| Ledger page | Maximum 1,000 events per response. |
| Caching | Mutable resources send `Cache-Control: no-store`. Static content is outside the API. |
| Compression | Optional; clients must not require it. |
| Timeouts | Server-side request timeout is implementation-defined and advertised in capabilities. |

The service does not use cookies. A browser client therefore does not need CSRF tokens, but the service still checks `Origin` against the allowlist for state-changing requests.

## Discovery

### `GET /v1/capabilities`

```json
{
  "service": "spritequest-companion",
  "api": "v1",
  "eventSchema": 1,
  "features": ["ledger", "guidance", "cartographers"],
  "limits": {
    "maxBodyBytes": 1048576,
    "maxBatchEvents": 1000,
    "maxLedgerPage": 1000
  },
  "routes": [
    { "method": "GET", "path": "/v1/health", "tier": "stable" },
    { "method": "GET", "path": "/v1/roster", "tier": "stable" }
  ]
}
```

- `features` is a closed list for this major; absence means unsupported.
- `routes` is informational. A client must still handle `404` for a route removed in a later minor only if the capabilities document said it was provisional.
- The document must not expose credentials or absolute filesystem paths. A `state` summary, if present, belongs in `/v1/health` and must be redactable.

## Common conventions

### Resource identifiers

| Prefix | Meaning | Example |
| --- | --- | --- |
| `npc/` | A character | `npc/hollis` |
| `prop/` | An object with standing | `prop/r6-ship-crate-standard` |
| `fragment/` | A Cartographer fragment | `fragment/fra-grounding-slate` |

A segment after the prefix is a slug: lowercase ASCII, digits, and hyphens. An identifier is opaque to a client; it must not parse meaning out of a slug.

### JSON rules

- UTF-8, no byte-order mark.
- No `NaN`, `Infinity`, `undefined`, or functions.
- Object key order is not significant. The service currently pretty-prints with indentation; clients must ignore whitespace.
- Unknown response fields must be ignored. Unknown request fields are rejected unless the schema marks the object `additionalProperties: true` (only `data` and `provenance` do).
- A numeric `seq` is a safe integer greater than or equal to zero.

### Errors

Every failure uses one envelope:

```json
{
  "error": {
    "code": "EVENT_REFUSED",
    "message": "role.authored must carry a gate verdict",
    "details": { "field": "gate" },
    "requestId": "5f0c2f9e-7b1a-4f4e-9d0e-3c2a1b6d8e10"
  }
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `code` | yes | Stable machine code from the table below. |
| `message` | yes | Human-readable reason, safe to show. |
| `details` | no | Structured context: field, entity, index, expected value. |
| `requestId` | no | Correlates a client report with a server log line. |

Current payloads such as `{"error": "event refused", "reason": "..."}` are **not** v1. The v1 adapter maps them to `code: "EVENT_REFUSED"` and `message: reason`.

### Idempotency

A write may carry identity in two places:

1. `Idempotency-Key: <string>` header, scoped to the endpoint and the resource.
2. `id` on an event body, the stable identity a workflow's outbox assigns.

Rules:

- If both are present, they must match; otherwise `400 INVALID_REQUEST`.
- A repeated identity returns `200` with a receipt whose `status` is `already-written`. It does not append.
- The service retains identity for at least the life of the log. The log itself is the dedupe index today.
- An idempotent replay must not change `seq`, `kind`, `entity`, or `data`.
- A duplicate identity within one batch is treated the same way: the first occurrence writes, later occurrences are `already-written`.

### Sequences and concurrency

- The service is a single writer. A write takes the append lock, validates, assigns `seq`, appends, and returns.
- Clients SHOULD omit `seq`. If a client supplies `seq`, it must equal the next expected value for that item in the batch; otherwise `409 SEQ_CONFLICT`.
- A conflict means "re-read and retry", not "overwrite".
- `POST /v1/events` is atomic in the target contract: if any item is refused, no item in the batch is appended. The current service appends earlier items before a later refusal; see [implementation status](#implementation-status).

### Pagination

- `GET /v1/ledger` accepts `since_seq`, `limit`, and `entity`.
- `since_seq` is exclusive: return events with `seq > since_seq`.
- `limit` defaults to 200 and is capped by capabilities.
- `next_seq` is the sequence a client should pass next, or `null` when the page reached the end.
- `GET /v1/roster` returns all members in v1. A future minor may add pagination without changing the default shape.

## Resources

### EventRecord

One append-only line.

```json
{
  "seq": 7,
  "kind": "role.authored",
  "entity": "npc/pell-the-underwritten",
  "actor": "human",
  "data": {
    "state": "written",
    "text": "Sworn Searcher of the Gap"
  },
  "gate": { "rule": "human_authorial_curation", "verdict": "pass", "checks": [] },
  "provenance": { "source": "review/publish", "scene": "customs-house" }
}
```

| Field | Type | Rule |
| --- | --- | --- |
| `seq` | integer | `>= 0`; unique and monotonic in the log. |
| `kind` | string | One of `EVENT_KINDS`. |
| `entity` | string | `npc/<slug>`, `prop/<slug>`, or `fragment/<slug>`. |
| `actor` | string | One of `ACTORS`: `model`, `gate`, `human`, `game`. |
| `data` | object | Free-form but bounded JSON. Shape depends on `kind`. |
| `gate` | object or null | Required for `role.authored`; `verdict` is one of `GATE_VERDICTS`. |
| `provenance` | object | Required when `actor` is `model`; names the source, never a secret. |

The service preserves an optional top-level `id` on the stored line so a replay can be recognized. `id` is not part of the folded state.

### Gate

```json
{ "rule": "human_authorial_curation", "verdict": "pass", "checks": [] }
```

`rule` names the check that ran. `verdict` is `pass`, `refuse`, or `unevaluated`. `checks` is a bounded list of evidence records whose shape is rule-specific.

### RosterMember

```json
{
  "entity": "npc/hollis",
  "name": "Hollis the Quartermaster",
  "world_id": "shared",
  "role": "written",
  "grudge": 0.0,
  "disposition": "helps",
  "can_help": true,
  "line": "is written; the part obliges him, whatever he feels about it -- the paperwork wins",
  "aspirations": "to keep the customs house solvent",
  "lines_written": 4
}
```

When a fold is refused, the member carries the failure instead of hiding the character:

```json
{
  "entity": "npc/broken-entry",
  "name": "Broken Entry",
  "fold": "refused: no entity.seeded event; identity cannot be reconstructed",
  "line": "cannot be folded -- no entity.seeded event; identity cannot be reconstructed",
  "disposition": "unevaluated",
  "can_help": false,
  "lines_written": 2
}
```

A refused member is a first-class result. It must not be omitted or turned into a 500.

### Roster

```json
{ "count": 2, "members": [ /* RosterMember[] */ ] }
```

### Guidance

```json
{
  "guidance": "The ledger, as it stands:\n- Hollis the Quartermaster (shared): is written; ...",
  "count": 2
}
```

`guidance` is one injectable text block. A compose node may paste it without knowing the roster shape. The service does not infer; every line is a fold.

### Ledger page

```json
{
  "count": 7,
  "returned": 2,
  "events": [ /* EventRecord[] */ ],
  "next_seq": 8
}
```

`count` is the total number of lines in the log, preserving the current `/ledger` meaning. `returned` is the size of this page.

### Receipt

```json
{ "seq": 8, "kind": "grudge.changed", "entity": "npc/hollis", "status": "written" }
```

A replay receipt carries `{ "id": "...", "status": "already-written" }`.

### Cartographer entry

A fragment's maturity and warrant. The exact shape is provisional; the stable fields are:

```json
{
  "fragment_id": "fra-grounding-slate",
  "recipe_archetype": "grounding",
  "maturity": "curated",
  "warrant_id": "WARRANT-FRA-GROUNDING-SLATE-CURATED",
  "standing_tier": "warranted",
  "standing_score": 0.9,
  "criticism_constraint": "optional; present when criticized"
}
```

## Endpoints

### `GET /v1/health`

Liveness and a bounded state summary.

```json
{
  "ok": true,
  "status": "ready",
  "service": "spritequest-companion",
  "api": "v1",
  "eventSchema": 1,
  "state": { "path": "/home/operator/.local/state/spritequest/hollis-ledger.jsonl", "lines": 7 }
}
```

`state` is optional and must be redactable by configuration. `lines` is the number of events, not the number of folds.

### `GET /v1/roster`

`200` with a [Roster](#roster). `200` even when some members refuse to fold. `500` only for a service fault, never for a bad line.

### `GET /v1/guidance`

`200` with a [Guidance](#guidance). A refused fold produces an explanatory line, as the current service does.

### `GET /v1/ledger`

Query parameters:

| Name | Type | Default | Meaning |
| --- | --- | --- | --- |
| `since_seq` | integer | `-1` (all) | Return events with `seq > since_seq`. |
| `limit` | integer | `200` | Page size, capped by capabilities. |
| `entity` | string | absent | Exact resource identifier filter. |

`200` with a [Ledger page](#ledger-page). Invalid integers return `400 INVALID_REQUEST`.

### `POST /v1/events`

Append one event or a batch.

```json
{
  "events": [
    {
      "id": "outbox-01J8Z6",
      "kind": "grudge.changed",
      "entity": "npc/hollis",
      "actor": "game",
      "data": { "grudge": 0.4 },
      "provenance": { "source": "review/publish" }
    }
  ]
}
```

The v1 request body is an object with an `events` array. For compatibility, the adapter also accepts a single event object or a bare array, as the current service does. New clients SHOULD use the object form.

`200`:

```json
{
  "appended": 1,
  "receipts": [{ "seq": 8, "kind": "grudge.changed", "entity": "npc/hollis", "status": "written" }],
  "lines": 8
}
```

`appended` counts receipts with status `written`; an `already-written` receipt does not increase it. `lines` is the resulting log length.

| Status | Code | When |
| --- | --- | --- |
| `400` | `EVENT_REFUSED` | A record fails schema validation. `details.index` names the item in a batch. |
| `400` | `INVALID_REQUEST` | Malformed JSON, wrong content type, missing field, or mismatched idempotency identity. |
| `409` | `SEQ_CONFLICT` | A supplied `seq` is already written. |
| `413` | `PAYLOAD_TOO_LARGE` | Body or batch exceeds the advertised limit. |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | A body is not JSON. |
| `500` | `INTERNAL` | Storage or an unexpected fault. |

Validation rules are the same as [`schemas.py`](../../companion/schemas.py):

- `kind` is in `EVENT_KINDS`; `actor` is in `ACTORS`.
- `entity` has a known prefix and a non-empty slug.
- A `model` actor carries non-empty `provenance`.
- `role.authored` carries a `Gate`.
- `gate.verdict` is in `GATE_VERDICTS`.
- `role.authored` and `heal` carry `data.state` from `ROLE_STATES`.
- `entity.seeded` carries `data.name`, `data.world_id`, and `data.aspirations`.
- A `grudge.changed` value is within `0.0..1.0`.
- A seeded entity's `world_id` is in `WORLD_IDS`.
- A fold requires an `entity.seeded` line before it can produce a member.

### `GET /v1/cartographers/status`

```json
{
  "ok": true,
  "total_entries": 12,
  "counts": { "field_note": 4, "curated": 6, "criticized": 1, "canon": 1 },
  "active_criticisms": ["reject the grounded-slate formulation"],
  "parsimony_config": { "saturation_threshold": 0.8, "default_target_capacity": 4 }
}
```

### `GET /v1/cartographers/ledger`

```json
{
  "ok": true,
  "entries": { "fra-grounding-slate": { /* Cartographer entry */ } },
  "warrants": ["WARRANT-FRA-GROUNDING-SLATE-CURATED"],
  "parsimony_config": { "saturation_threshold": 0.8 }
}
```

### `POST /v1/cartographers/survey`

Audits a prop against a scene zone. This is a **write**: it may synthesize provisional fragments and append `fragment.synthesized` events.

`prop_id` is optional when the asset carries its own `id`; the response always names the resolved prop. Request:

```json
{
  "prop_id": "r6-ship-crate-standard",
  "scene_id": "customs-house",
  "asset": {
    "id": "r6-ship-crate-standard",
    "label": "Standard Ship Crate",
    "mass_kg": 50,
    "world_x": 45,
    "world_y": 55,
    "world_z": 6,
    "bounds": { "width": 1, "depth": 1, "height": 1 },
    "visual_template": "generic_prop"
  }
}
```

Response:

```json
{
  "ok": true,
  "prop_id": "r6-ship-crate-standard",
  "zone_context": {
    "scene_id": "customs-house",
    "zone_id": "inspection-hall",
    "zone_name": "Inspection Hall",
    "substrate_material": "scarred timber planking over iron joists",
    "acoustic_reverb": "damp",
    "elevation": 6.0,
    "is_interior": true
  },
  "conflicts": [
    {
      "conflict_id": "conflict-01",
      "kind": "underdetermined_slab",
      "severity": "moderate",
      "description": "The crate has no grounding fragment.",
      "proposed_fragment_id": "fra-grounding-slate",
      "proposed_detail": "A slate footing ...",
      "proposed_facts": {}
    }
  ],
  "synthesized": [ /* fragment objects minted by the model */ ],
  "saturation": {
    "recipe_archetype": "grounding",
    "canon_count": 2,
    "pending_field_notes": 1,
    "curated_count": 1,
    "criticized_count": 0,
    "saturation_score": 0.6,
    "saturation_threshold": 0.8,
    "saturation_locked": false,
    "max_pending_field_notes": 1
  }
}
```

### `POST /v1/cartographers/curate`

Grants a human warrant and appends `fragment.curated`.

Request: `{ "fragment_id": "fra-grounding-slate", "detail": "optional edited text" }`

Response:

```json
{
  "ok": true,
  "fragment_id": "fra-grounding-slate",
  "warrant_id": "WARRANT-FRA-GROUNDING-SLATE-CURATED",
  "maturity": "curated",
  "standing_score": 0.9,
  "entry": { /* Cartographer entry */ }
}
```

### `POST /v1/cartographers/criticize`

Records a human criticism tombstone and appends `fragment.criticized`.

Request: `{ "fragment_id": "fra-grounding-slate", "constraint": "reject this formulation" }`

Response:

```json
{
  "ok": true,
  "fragment_id": "fra-grounding-slate",
  "maturity": "criticized",
  "standing_score": 0.55,
  "constraint": "reject this formulation",
  "entry": { /* Cartographer entry */ }
}
```

Cartographer endpoints are **provisional**. Their resource shapes may change in a minor with a migration note; the event kinds they append are stable.

## Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `INVALID_REQUEST` | 400 | Malformed or contradictory request. |
| `MISSING_FIELD` | 400 | A required field is absent. |
| `SCHEMA_VIOLATION` | 400 | A value is outside its type or vocabulary. |
| `EVENT_REFUSED` | 400 | An event cannot enter the log. `details` names the rule. |
| `SEQ_CONFLICT` | 409 | A write would rewind or collide with the log. |
| `UNKNOWN_ROUTE` | 404 | No resource at the path for this major. |
| `NOT_FOUND` | 404 | A named resource does not exist. |
| `PAYLOAD_TOO_LARGE` | 413 | Body or batch exceeds a limit. |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | A body is not JSON. |
| `UNAUTHORIZED` | 401 | Missing or invalid bearer token. |
| `FORBIDDEN_ORIGIN` | 403 | `Origin` is not allowlisted for a write. |
| `INTERNAL` | 500 | Unexpected service fault. |
| `UNAVAILABLE` | 503 | Storage is not writable or the service is shutting down. |

## Excluded from v1

The following routes exist in the current handler but are not part of the companion contract:

- `/forge/pipeline`, `/forge/pipeline/3d`, `/forge/waterfall*`, `/forge/compile`, `/forge/workflow/snapshot`
- `/renders/*`, `/library/*`, `/companion/web/*`
- `/`, `/viewer`, `/preview`

They may continue to exist as an **experimental** surface. They must not be advertised in `/v1/capabilities` and must not share the v1 error envelope promise. Static content is a content origin, not an API.

## Diegetic counterparts

| In-world | Concrete v1 |
| --- | --- |
| The Hollis ledger: a line is written, and an object or role has standing only because the line exists. | `EventRecord` appended by `POST /v1/events`; `fold_events` produces the roster. A write with no gate/provenance is refused. |
| Hollis the Quartermaster reads the ledger and says who may be relied on. | `GET /v1/roster` and `GET /v1/guidance`; the `line` field is the fiction's explanation of the fold. |
| Pell the Underwritten has no part above the first line until someone writes one. | `role.authored` changes `role.state`; `role.written` drives `help_disposition`. An unwritten, grudge-free character is `unreliable`. |
| The Cartographers audit a scene, mint provisional field notes, and the Bureau warrants or criticizes them. | `POST /v1/cartographers/survey` mints `fragment.synthesized`; `curate` grants a warrant; `criticize` records a constraint. |
| The Forge answers a wish literally and coarsely. | Excluded from this contract. The Forge is a separate workshop; its endpoints are experimental and not part of the ledger's authority. |

An engineering change that alters one side must be reviewed against the other. For example, allowing a `model` event without provenance would make a model's word citable without a gate verdict, which contradicts the ledger's whole premise.

## Implementation status

| Contract | Current service | Gap |
| --- | --- | --- |
| `/v1/*` paths | Unversioned paths | Add aliases or a version router. |
| `/v1/capabilities` | None | Add discovery. |
| Error envelope | `{"error": "...", "reason": "..."}` | Add adapter with stable codes. |
| Atomic batch | Sequential append | Validate the whole batch before writing. |
| `appended` count | Counts every receipt, including duplicates | Count only `written` receipts. |
| Semantic checks | Some run at fold, not append | Validate `grudge` range and `world_id` at the door. |
| `Idempotency-Key` | Body `id` only | Accept the header and reconcile with `id`. |
| Ledger pagination | Returns every event | Add `since_seq`/`limit` while keeping the default workable. |
| Bearer token | None | Add optional auth and refuse non-loopback without it. |
| CORS allowlist | `*` | Make configurable; keep loopback development convenient. |
| Machine-readable schema | Python dataclasses | Publish JSON Schema + OpenAPI and check the dataclasses against them. |

## Migration from unversioned routes

| Step | Change | Compatibility |
| --- | --- | --- |
| 1 | Serve every core resource at `/v1/...` and add `/v1/capabilities`. | Unversioned paths keep working. |
| 2 | Add the error envelope on `/v1`. Keep the old shape on unversioned paths. | Old clients unaffected. |
| 3 | Mark unversioned paths deprecated with `Deprecation` and `Sunset` headers. | Clients have a documented window. |
| 4 | Remove unversioned paths after the support window. | A breaking change announced as such. |

The window length is a [versioning policy](versioning.md) decision, not an endpoint detail.

## Contract artifacts and testing

- [`companion.openapi.yaml`](contracts/companion.openapi.yaml) is the normative description of the v1 routes.
- [`companion.schemas.json`](contracts/companion.schemas.json) is the normative schema for `EventRecord`, `Gate`, `RosterMember`, `Guidance`, `Receipt`, and `Error`.
- [`companion/schemas.py`](../../companion/schemas.py) is the implementation of the same rules. A contract test should validate fixtures against both the JSON Schema and `_record`/`fold_events`.
- A conformance run should cover: valid append, duplicate id replay, `seq` conflict, each schema violation, batch atomicity, refused fold in the roster, and every documented status code.

## Open decisions

| Question | Current proposal |
| --- | --- |
| Token provisioning | A local file or CLI flag; not in the log or the graph. |
| `state.path` in health | Return it only to a loopback client; allow redaction. |
| Cartographer tier | Provisional v1; promote after the fragment schema stabilizes. |
| Atomic batch failure shape | One `EVENT_REFUSED` with `details.index`; no partial receipts. |
| Idempotency retention | The life of the log; a compacted log needs a separate index. |
| Whether `/v1` includes the Forge | No. Keep it experimental. |