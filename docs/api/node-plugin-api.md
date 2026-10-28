# Node plugin API v1

[API overview](README.md) · [Interface inventory](interface-inventory.md) · [Versioning](versioning.md) · [`node-plugin.d.ts`](contracts/node-plugin.d.ts)

**Status:** proposed. No registration API or registry exists in `0.27.3`. This document defines the contract a future host must implement and a plugin author must target.

## Purpose

Today an operation is spread across a descriptor in [`catalog.js`](../../src/workflow/catalog.js), a membership test in `newOperation`, a branch in `dynamicDescription`, an executor in [`runtime.js`](../../src/workflow/runtime.js), and discovery text in three UI modules. Adding one requires editing all of them. The plug-in API turns that set into one declarative object plus a small execution contract.

The API separates:

- **Functionality:** what the operation means, its inputs, outputs, controls, limits, and behavior.
- **Implementation:** how the host stores the registry, validates a graph, renders a control, dispatches a run, or draws a card.

A plugin declares the first. It does not import the second.

## Non-goals

- Native host effects, prompt injection, generation interception, or settlement. Those remain core/verified host operations.
- Arbitrary DOM, Svelte components, CSS, or canvas drawing.
- Credentials, connection profiles, or provider transports.
- A new workflow document format. Plugins operate inside `schema: 3` / `runtime: 2`.
- Replacing the built-in families in the same release that introduces the API. Migration is staged.

## Trust tiers

| Tier | Who | Isolation | Allowed capabilities |
| --- | --- | --- | --- |
| **Core** | Ships in this repository, reviewed with the host | Same realm | Everything, including host operations |
| **Verified** | Third party, integrity-pinned and conformance-tested | Same realm or worker | Request, tokenizer, clock, random, logger; network only with an explicit allowlist |
| **Community** | User-installed third party | Worker or iframe boundary required for admission | Pure execution; no network, no host, no storage |

The contract distinguishes the tiers so a saved graph can fail closed. A descriptor that declares a capability its tier cannot receive is rejected at activation, not at run time.

> JavaScript running in the same realm cannot be sandboxed by convention. The community tier is only honest if the host enforces a worker or iframe boundary. Until that boundary exists, the host must not admit community plugins.

## Package and discovery

A plugin is a directory with a manifest and one ESM entry point.

```text
my-plugin/
  spritequest.plugin.json
  plugin.js
  README.md
```

### Manifest

```json
{
  "apiVersion": 1,
  "id": "com.example.spritequest.dice",
  "name": "Dice",
  "version": "1.0.0",
  "entry": "./plugin.js",
  "operations": ["dice-roll"],
  "license": "MIT",
  "integrity": "sha256-BASE64",
  "minHostVersion": "0.28.0"
}
```

| Field | Required | Rule |
| --- | --- | --- |
| `apiVersion` | yes | Integer major. The host refuses an unknown major. |
| `id` | yes | Reverse-DNS or equivalent stable identifier. Unique across installed plugins. |
| `name` | yes | Display name. |
| `version` | yes | SemVer of the plugin package, not of the contract. |
| `entry` | yes | Relative ESM path inside the package. No remote URL. |
| `operations` | yes | Declared operation IDs; must match the entry's registrations exactly. |
| `license` | yes | SPDX identifier. |
| `integrity` | verified/community | Subresource-integrity-style hash of the entry and declared assets. |
| `minHostVersion` | no | Release version required for optional host features. Not a contract version. |

Discovery is host-owned. The host MAY scan configured plugin roots, but it MUST NOT auto-activate a plugin without a user-visible approval that names the plugin, its tier, and its requested capabilities.

## Plugin object

The entry point exports one plugin object as its default export.

```ts
import type { LatticePlugin } from './contracts/node-plugin';

const plugin: LatticePlugin = {
  apiVersion: 1,
  id: 'com.example.spritequest.dice',
  name: 'Dice',
  version: '1.0.0',
  operations: [diceRoll],
  activate(host) {
    // Optional: register dynamic descriptors, open a resource, return a disposer.
    return () => { /* release resources */ };
  },
};
export default plugin;
```

`activate(host)` is optional. It receives a narrow host surface for registration and logging only. It must not receive the editor, the graph, the chat, or a provider connection. The returned function is called once on unload or disable.

## Operation definition

```ts
import type { OperationDefinition } from './contracts/node-plugin';

const diceRoll: OperationDefinition = {
  id: 'dice-roll',
  version: 1,
  title: 'Dice Roll',
  family: 'Randomness',
  phase: 'both',
  input: 'data',
  output: 'data',
  controls: {
    sides: { type: 'integer', min: 2, max: 1000, default: 20, label: 'Sides' },
    count: { type: 'integer', min: 1, max: 100, default: 1, label: 'Count' },
  },
  ports: [
    { id: 'in', label: 'Input', direction: 'input', kind: 'data', required: false, cardinality: 'one' },
    { id: 'out', label: 'Outcome', direction: 'output', kind: 'data', required: false, cardinality: 'one' },
  ],
  constraints: { minimumSchema: 3, minimumRuntime: 2, rootOnly: false, terminal: false, dynamicPorts: false },
  capabilities: { random: true },
  validate: (node) => Number(node.count) <= 100
    ? { ok: true, data: undefined }
    : { ok: false, error: { code: 'INVALID_SETTINGS', message: 'Roll at most 100 dice.' } },
  execute: async (ctx) => {
    const sides = Number(ctx.node.sides);
    const count = Number(ctx.node.count);
    const rolls = Array.from({ length: count }, () => 1 + Math.floor(ctx.services.random!() * sides));
    return { ok: true, artifact: { kind: 'data', value: { rolls } }, reports: [{ code: 'ROLLED', count }] };
  },
};
```

### Identity and version

| Field | Rule |
| --- | --- |
| `id` | `^[a-z][a-z0-9-]{1,63}$`. Globally unique among registered operations. Host prefixes are reserved (`host.`). |
| `version` | `1` initially. It is the serialized `operationVersion` and is independent of `nodeApi`. |
| `title` | User-facing, short, distinct within a family. |
| `family` | One of the closed v1 families. |
| `phase` | `pre`, `post`, `both`, or `null` (derived by the host from wiring). |
| `input` / `output` | Artifact kinds or `null`. A `null` input means the node starts a branch; a `null` output means the node is terminal. |
| `requestBound` | Static upper bound on text-completion requests per run. `0` (the default) means no request. The host enforces it; a function is not part of the serializable contract. |
| `modelRole` | The role the host resolves to a connection, or `null` for a pure operation. |

### Controls

`controls` is an ordered record. Declaration order is shelf order. Defaults are derived from each descriptor unless `defaults` overrides them. Every `defaults` key must name a declared control, and every default must validate against its descriptor; the host rejects an extra default or an out-of-bounds value.

| Type | Payload | Notes |
| --- | --- | --- |
| `string` | `{ min?, max?, multiline?, editor? }` | UTF-16 length bounds. |
| `integer` | `{ min, max }` | Safe integers only. |
| `number` | `{ min, max, step? }` | Finite numbers only. |
| `boolean` | `{}` | |
| `enum` | `{ values, valueLabels? }` | Closed vocabulary; values are strings. |
| `json-value` | `{}` | Plain JSON only; no functions, cycles, `NaN`, or `undefined`. |
| `array` | `{ items, min?, max? }` | `items` is a primitive kind or `record`. |
| `object` | `{ max? }` | String-keyed plain JSON object. |

Every descriptor may also carry `label`, `help`, `editor`, `exposable`, `hidden`, and `visibleWhen`. `visibleWhen` is presentation only; validation still runs for hidden controls unless the descriptor sets `validateWhenHidden: false`.

A plugin MUST NOT use a control to store a credential, a host handle, or an absolute local path that is not explicitly a file reference.

### Ports

Ports are either static or produced by `describe`.

```ts
interface PortDeclaration {
  id: string;
  label: string;
  direction: 'input' | 'output';
  kind: ArtifactKind;
  required: boolean;
  cardinality: 'one';
}
```

Rules:

- Input IDs and output IDs are unique and stable; a label may change without a version bump.
- Inputs accept one binding; outputs may fan out. A plugin may not declare a many-input pin.
- A dynamic port set must be a pure function of the saved node and the effective phase. It must not inspect the graph, the chat, or the clock.
- A port that disappears in a new `describe` result leaves existing wires invalid; admission reports the exact port, and the graph is not silently rewritten.

### Constraints

| Field | Meaning |
| --- | --- |
| `minimumSchema` | Minimum workflow schema. v1 plugins require `3`. |
| `minimumRuntime` | Minimum runtime. v1 plugins require `2`. |
| `rootOnly` | Only a root-level node may use the operation. |
| `terminal` | The operation produces no routable artifact. |
| `dynamicPorts` | `describe` may return a different port set. |
| `requiresStateInDefinition` | A subgraph definition needs an explicit state input. |
| `acceptsSkippedInputs` | Unresolved/skipped inputs are passed with their state rather than failing the node. |
| `previewSafe` | The operation may run in preview without a side effect. |
| `modes` | Accepted workflow modes. Omitted means all current modes. |

### Mapping from the current descriptor

The plugin declaration is a cleaner projection of the existing `OperationDescriptor`. A host adapter can translate without changing saved meaning:

| Current field | Plugin declaration |
| --- | --- |
| `controls: string[]` + `controlDescriptors: Record<string, ControlDescriptor>` | `controls: Record<string, ControlDescriptor>`; declaration order is the old `controls` order |
| `defaults` | `defaults`; otherwise each control's `default` |
| `requestCapability: 'text-completion'` | `capabilities.request: true`; v1 has no other request capability |
| `hostOperation` / `nativeBoundary` | Not available to third-party plugins; core tier only |
| `minimumSchema` | `constraints.minimumSchema` |
| `dynamicPorts`, `rootOnly`, `requiresStateInDefinition`, `acceptsSkippedInputs`, `terminal`, `modes` | `constraints.*` |
| `title`, `family`, `phase`, `input`, `output`, `requestBound`, `modelRole` | Same names at the top level |
| Search/guide maps in `src/ui/` | `presentation` |

A core operation whose `requestBound` is a function cannot be registered unchanged; the adapter must replace it with a static bound or a control-derived expression that the host can enforce without executing plugin code during admission.

### Capabilities

Capabilities are requested declaratively and granted by the host according to the trust tier. A boolean requests a service; `network` carries an origin allowlist.

| Capability | Surface | v1 tier |
| --- | --- | --- |
| `request` | `TextRequestService` | Verified |
| `tokenizer` | `TokenCounter` | Verified |
| `clock` | `Clock` | All |
| `random` | `RandomSource` | All |
| `network` | `NetworkService` with an origin allowlist | Deferred; verified only |
| `host` | Native operation context | Core only |

A plugin that requests an ungranted capability MUST fail activation with `CAPABILITY_DENIED`. It must not degrade silently into a different behavior.

A future `NetworkService` must accept only an allowlisted origin, refuse a cross-origin redirect, bound the response body, and pass the abort signal. It is not part of v1; a plugin cannot use it to reach the companion service yet.

## Lifecycle

### `describe(context)`

```ts
describe?(context: DescribeContext): Result<OperationDescription>;
```

`DescribeContext` contains `{ phase, mode, node }` where `node` is the plain saved settings. `describe` is optional. Without it, the host derives the description from the static fields. When present, it must be pure and bounded; the host may call it during admission, search, and rendering.

### `validate(node, context)`

```ts
validate?(node: PlainNode, context: DescribeContext): Result<void>;
```

`validate` runs after control-shape validation and before admission. It may add semantic checks that a control descriptor cannot express (for example, "two selected modes are incompatible"). It must not read the chat, the clock, or a network resource.

### `execute(context)`

```ts
execute(context: NodeExecutionContext): Promise<OperationResult> | OperationResult;
```

`execute` receives only declared capabilities. It must return a complete `OperationResult`. Throwing is allowed but the host converts it to `EXECUTION_FAILED`; returning a failure is preferred because it carries a code.

### `migrate(node, fromVersion)`

```ts
migrate?(node: PlainNode, fromVersion: number): Result<PlainNode>;
```

Required when a new `version` changes the meaning or shape of saved controls. The host runs migration before validation. A migration must be deterministic, idempotent when re-run on its output, and must not fetch or mutate external state.

### `dispose()`

The disposer returned by `activate` is the only teardown hook. There is no per-run `dispose`.

## Execution context

```ts
interface NodeExecutionContext {
  node: Readonly<Record<string, JsonValue>>;
  inputs: Readonly<Record<string, WorkflowArtifact>>;
  inputStates: Readonly<Record<string, PortState>>;
  phase: 'pre' | 'post';
  mode: 'native-pre' | 'native-post' | 'native-unified';
  address: NodeAddress;
  preview: boolean;
  dryRun: boolean;
  signal?: AbortSignal;
  services: NodeServices;
  log: Logger;
}

interface NodeServices {
  request?: TextRequestService;
  countTokens?: TokenCounter;
  clock?: Clock;
  random?: RandomSource;
}
```

Rules:

- `node` is a frozen deep copy of the declared controls only, with each control's default materialized when the saved node omitted it. The host preserves unknown controls in the saved document, but they are not present in `node`. Host metadata and private fields are not present either.
- `inputs` contains only declared ports. A missing optional input is absent; an unresolved required input is a failure before `execute` unless `acceptsSkippedInputs` is set.
- `inputStates` lets a plugin distinguish `skipped` from `unresolved` when it accepts skipped inputs.
- `signal` is the only cancellation channel. A plugin should check it between expensive steps and pass it to `request`.
- `preview` and `dryRun` are advisory for presentation, but a plugin MUST NOT perform an external write when `dryRun` is true.
- The context is not serializable and must not be stored.

### Services

```ts
interface TextRequestService {
  (options: {
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
    maxTokens: number;
    modelRole?: string | null;
    signal?: AbortSignal;
  }): Promise<Result<{ text: string; finish?: string; usage?: ReportedUsage }>>;
}

interface TokenCounter {
  (text: string): Promise<{ tokens: number; method: string }>;
}

interface Clock {
  now(): number;
  monotonic(): number;
}

interface RandomSource {
  (): number; // finite, 0 <= value < 1
}

interface Logger {
  debug(message: string, fields?: Record<string, JsonValue>): void;
  info(message: string, fields?: Record<string, JsonValue>): void;
  warn(message: string, fields?: Record<string, JsonValue>): void;
  error(message: string, fields?: Record<string, JsonValue>): void;
}
```

`request` is budgeted by the host. A plugin's declared `requestBound` is an upper bound per run, not a reservation. Going over budget returns `REQUEST_BOUND`; a plugin must not retry around the budget.

`countTokens.method` is evidence (`host-tokenizer`, `character-estimate`). A consumer that needs precision must check it. The `log` service (a bounded `Logger`) is always present; it is not a capability-gated request and cannot be used as an artifact channel.

## Result contract

```ts
type OperationResult =
  | {
      ok: true;
      artifact?: WorkflowArtifact;
      outputs?: Record<string, WorkflowArtifact>;
      outputStates?: Record<string, PortState>;
      reports?: Report[];
    }
  | { ok: false; error: WorkflowError };
```

- `artifact` is admitted only on the conventional `out` pin. A multi-output operation uses `outputs`.
- `outputStates` may mark declared outputs `skipped` or `unresolved` with a reason. It may not mark an input.
- `reports` are bounded, plain diagnostics. They are not a side channel for artifacts.
- A failure carries `{ code, message, nodeId?, address? }`. `message` is user-facing and should be actionable.
- Returning `ok: true` with no artifact and no output states for a declared output is an `INVALID_RESULT` host error.

## Admission and errors

The host validates a plugin before activation and a node before a run.

| Code | When |
| --- | --- |
| `PLUGIN_MISSING` | A saved graph names an operation whose plugin is not installed. |
| `PLUGIN_INCOMPATIBLE` | `apiVersion`, `minimumSchema`, or `minimumRuntime` is not supported. |
| `PLUGIN_INTEGRITY` | The entry or a declared asset fails its hash. |
| `PLUGIN_DUPLICATE_ID` | Two plugins register the same operation ID. |
| `INVALID_DESCRIPTOR` | A descriptor field is missing, malformed, or inconsistent. |
| `CAPABILITY_DENIED` | The requested capability exceeds the trust tier. |
| `UNKNOWN_OPERATION` | The operation ID is not registered. |
| `UNSUPPORTED_VERSION` | `operationVersion` is not supported and no migration exists. |
| `INVALID_SETTINGS` | A control or semantic validation failed. |
| `WRONG_PHASE` | The effective phase is not accepted. |
| `ROOT_ONLY_OPERATION` | A non-root node uses a root-only operation. |
| `INVALID_PORTS` | A declared input/output kind does not match a wire or the artifact. |
| `INVALID_INPUT` | A required input is missing or malformed. |
| `ABORTED` | The signal was aborted. |
| `REQUEST_BOUND` | A request would exceed the declared budget. |
| `EXECUTION_FAILED` | The plugin threw or returned an unreadable result. |
| `INVALID_RESULT` | A success result violates the declared ports/states. |

Admission limits remain host-owned: 1,000 nodes and 2,000 wires per graph, with bounded plain-data budgets. A plugin cannot raise them.

### Saved graph compatibility

- An operation whose plugin is not installed makes the graph **invalid**, not partially runnable. The editor names the node and the missing plugin; it does not drop the node or rewrite its controls.
- An unsupported `operationVersion` fails with `UNSUPPORTED_VERSION` unless `migrate` can produce a supported node.
- Migration runs on load and on paste, before validation. The host keeps the original document until the migrated candidate passes.
- Disabling a plugin does not delete authored nodes. It makes them invalid until the plugin is enabled again or the user deliberately removes them.
- Unknown controls are preserved even when the current descriptor does not declare them, so a downgrade does not destroy data.

## Presentation

Presentation is optional and data-only.

```ts
interface OperationPresentation {
  purpose?: string;
  shortcode?: string;
  searchAliases?: string[];
  guide?: {
    summary: string;
    sections: { title: string; body: string }[];
    settings?: { control: string; body: string }[];
  };
  examples?: {
    title: string;
    description?: string;
    node: PlainNode;
    explanation?: string;
  }[];
}
```

Rules:

- `family` is fixed by the definition, not by presentation.
- `shortcode` is a quiet mnemonic, unique within the family.
- Guide bodies are plain text or a restricted inline subset; no HTML, no scripts, no remote images.
- An example must validate against the same descriptor and must not include secrets or absolute paths.
- If presentation is absent, the host generates a minimal shelf row from the descriptor. It must not invent aliases.

## Security and privacy

1. **No ambient authority.** The host must not expose `fetch`, `XMLHttpRequest`, `localStorage`, `indexedDB`, `document`, `window`, or `globalThis.SillyTavern` through the plugin object. A verified plugin is evaluated in the host realm, so this is an admission and review rule, not a runtime sandbox: same-realm JavaScript can still reach a global that exists. Only the community worker/iframe boundary can enforce the rule.
2. **Capability injection only.** A plugin's authority is exactly the services listed in `capabilities`. The host grants them per run, not at module scope.
3. **No secrets in data.** Connection profiles, tokens, and authenticated transports never enter `node`, `inputs`, reports, or logs.
4. **Artifact privacy.** A plugin must preserve the visibility metadata on Guidance and Context artifacts. A public output derived from private input is a leak; the host checks the declared privacy policy when one exists.
5. **Bounded output.** Reports, logs, and artifacts are size-limited. A plugin must not return an unbounded transcript or a live object graph.
6. **Honest isolation.** Verified plugins share the realm and are trusted as reviewed code; the host cannot prevent a determined verified plugin from reaching a global. Community plugins require a worker/iframe boundary, and the API must not advertise a sandbox it does not enforce.
7. **No credentials, no host operations, no settlement.** A plugin cannot accept a reply, mutate story state, or publish an artifact.

## Versioning

- `nodeApi` major changes when a required field, hook signature, or capability meaning changes incompatibly.
- An operation's `version` changes when saved controls or output meaning change. Additive optional controls may keep the same version if absent values preserve the old behavior.
- Adding an optional descriptor field or a new presentation field is a minor change.
- Adding a control type, artifact kind, family, or capability is a minor change only if old plugins remain valid; otherwise it is a major change.
- Deprecation is announced in the descriptor (`deprecated`, `replacement`) and in the [versioning policy](versioning.md). The host warns at admission and continues to run the operation for the support window.

## Conformance

A plugin is admissible when its conformance fixture passes:

1. Manifest and entry load; only declared operations register.
2. Every descriptor validates: identity, family, phase, kinds, ports, controls, defaults, constraints, capabilities.
3. Every example validates and produces the declared ports.
4. `describe` is pure: repeated calls with the same input produce equal results.
5. `validate` rejects malformed and boundary values with the declared codes.
6. `execute` handles: normal input, missing optional input, unresolved required input, skipped input where allowed, and cancellation.
7. `execute` returns a failure rather than a partial artifact on an invalid input.
8. `migrate` is idempotent and preserves meaning for every supported prior version.
9. Reports and logs are bounded and contain no credential-shaped fields.
10. A preview/dry run performs no external write.

The host should publish the fixture runner so a plugin author can run the same checks locally. Until that exists, the checks are a specification requirement, not a claim about current tooling.

## Migrating the built-in families

The registry is only credible if the host uses it.

| Stage | Work |
| --- | --- |
| 1 | Introduce the registry alongside `OPERATIONS`. Register one pure family (for example Compose, JSON Decode, Select Fields) and dispatch through it. Keep existing imports working. |
| 2 | Register descriptor and execution adapters for every family. Remove `newOperation` and the `dynamicDescription` chain. Keep the UI reading the registry projection. |
| 3 | Move presentation metadata and guides into operation definitions; delete the duplicated maps in `native-search-catalog.js` and `node-guide-content.js`. |
| 4 | Admit verified plugins behind an explicit setting and the conformance fixture. |
| 5 | Define and enforce the community isolation boundary before accepting community plugins. |

No stage is part of this specification pass.

## Open decisions

| Question | Current proposal |
| --- | --- |
| Worker, iframe, or SES for community isolation | Undecided; a worker boundary is the minimum credible option. |
| Can a plugin add an artifact kind? | No in v1. Use `data` with a declared shape until a major adds the kind. |
| Can a plugin add a family? | No in v1. Families are host taxonomy. |
| Is network a v1 capability? | Deferred. A verified plugin may request an allowlisted origin in a later minor. |
| How are plugin updates trusted? | Integrity hash in the manifest plus user approval; signing is undecided. |
| Do modifiers apply to plugin outputs? | Deferred; the descriptor may declare compatibility but the host owns the trace. |