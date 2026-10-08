# Deterministic node primitives: Architecture handoff

The four approved operations and their named-input adapter are implemented and independently reviewed on `codex/lattice-node-primitives`, based on `f20f040`. This branch changes only new operation modules, dedicated tests and documentation. Shared registration and final release remain owned by the **Architecture** chat on `codex/lattice-workspace`.

Core integration is pending. Do not treat these nodes as registered in the current shelf or executor yet.

## Integration entry points

`src/workflow/operations/nodes.js` exports:

- `PRIMITIVE_OPERATIONS`: plain registration metadata, explicit control descriptors/defaults, requestBound 0, modelRole null, terminal false.
- `describePrimitive(node, {phase})`: Result containing effective descriptor and named ports. Supply the root's effective `pre`/`post` phase; static metadata's `both` is resolved here.
- `executePrimitive(node, namedInputs, execution)`: native `{ok:true,artifact,reports:[]}` or a visible Result error. `execution.createWorker` maps to the engine's `workerFactory`; signal and timeoutMs propagate.

| Operation | Named inputs | Output | Phase |
| --- | --- | --- | --- |
| Compose | Optional `data` Data, optional `section.NAME` Text overrides; ordered constant sections | `out` Text or Guidance | Guidance pre; Text pre/post |
| Text Rules | Required `in` Text or frozen Draft | `out` Text or Patches | Draft post; Text pre/post |
| JSON Decode | Required `in` Text in parse mode, Data in check mode; optional schema JSON text setting | `out` Data | pre/post |
| Select Fields | Required `in` Data; explicit named path/default mappings | `out` Data | pre/post |

Use port field `kind`, direction `input`/`output`, cardinality `one`. Text is `{kind:'text',text}`, Data is `{kind:'data',value}`. Compose Guidance is `{kind:'guidance',text}` and still goes to the existing publisher. Draft rules return the compatible frozen Draft/indexed Patches envelope; Validate Patches -> Review Gate -> root Apply Reply remains mandatory.

Mode changes need core's atomic wire preservation/rejection. Include declared controls and effective phase in execution freshness. Compose section IDs derive from names, preserving pins when sections reorder. Schema controls contain raw JSON text; Sections, Rules and Fields contain their declared arrays. Adapt the provided JSON editor metadata to the core UI control model.

Architecture owns Text/Data artifact kinds across validators, named ports, subgraph exposure, package round trips, recordings, previews and dispatch; starter wiring and final runtime/UI/release checks; Context Join. Runtime JSON helpers do not loosen graph/package sanitization. Do not merge arbitrary Data into routing/configuration objects.

Useful example paths are Compose Text containing JSON -> JSON Decode -> Select Fields -> Compose Guidance -> Guidance, and Reply Snapshot -> Text Rules Draft -> Validate Patches -> Review Gate -> Apply Reply. Text Rules extraction belongs only to intermediate Text.

## Operation behavior and bounds

The value engines are independent of host, catalog, runtime and UI. No models, retries, eval or implicit repair. Compose expands ordered section references and RFC 6901 Data pointers in one pass. JSON Decode supports only the documented bounded schema subset and rejects unsupported validation. Select Fields reads own nested paths and explicit missing/default policies. Shared clone/path/stringify helpers preserve legitimate JSON property names without invoking getters, toJSON or array species hooks.

Text input/output is capped at 100,000 UTF-16 units. Data is capped at 262,144 serialized UTF-8 bytes, depth 32 and 10,000 values. Schemas are capped at depth 16 and 1,000 schema nodes. No truncation creates authoritative success.

Text Rules uses a dedicated terminable module Worker with cancellation and a 100..2,000 ms deadline (default 1,000). Rules <=64, patterns <=2,048 units, findings <=4,096, spans <=256. Each materialized span intermediate and the completed full Draft proposal obey the text limit. Draft snapshots preserve own provenance/permissions using prototype-safe records; the unchanged patch gate receives a safe envelope and explicit validator config.

Installed Worker URLs inherit the operation module's version query. Vite's direct Worker expression emits a bundled asset. All production local imports carry `?v=0.19.1`; the final core release version tool updates them.

## Verification and review

Fresh checks against the settled operation branch:

- `npm test`: **58/58 test files passed**, including all six new dedicated suites and existing repair/runtime/host regressions.
- Text Rules: **37 behavior tests passed**; adapter: **21 behavior tests passed**.
- `npm run check:types`: **0 errors, 0 warnings**; standalone strict checks of all new declarations passed.
- `npm run build` and `npm run check:assets`: passed; **99 versioned imports verified**. The root-generated UI bundle was restored to the base version because Architecture owns its final build/release.
- Targeted Vite library build plus real Chromium: native and bundled Worker replacement, deadline and abort passed; **all six workers terminated**; installed entry inherited the version query and bundled worker asset loaded.
- Every task cleared independent spec/quality review after corrections. Final whole-branch review found **no Critical, Important or Minor issues**. No parked or deferred findings.

Core integration and its final UI/package/subgraph checks have not run on this branch. Detailed task/review evidence remains in this worktree's `.superpowers/sdd/2026-10-08-lattice-node-primitives/` until the handoff is accepted.

## Implementation decisions

- Disjoint workers ran concurrently with controller-only commits. If the ownership boundary proves incomplete, resolve remaining integration conflicts before release.
- Retained JavaScript ES modules, Results and declarations instead of adding Zod or a second build system. This costs some implementation-level static validation and puts more weight on boundary tests.
- Safely consume declared operation controls; ignore other node envelope metadata for core validation. A misspelled unused control may use its declared default until core flags it.
- Draft metadata uses the existing repair-sized 500,000 UTF-16-unit/depth-40/20,000-value boundary rather than generic Data's smaller cap, preserving source/context compatibility at the cost of larger bounded snapshots.
- Aggregate Draft limits apply to the completed full proposal; independent per-span intermediates are each bounded. This permits shrinking pipelines whose hypothetical combined intermediate exceeds 100,000, without constructing that combined intermediate.

The approved design and checked implementation plan are in `docs/superpowers/specs/2026-10-08-lattice-node-primitives-design.md` and `docs/superpowers/plans/2026-10-08-lattice-node-primitives.md`.
