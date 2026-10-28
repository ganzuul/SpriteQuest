# Asset jobs — exploratory OpenJD-shaped scheduling

[API overview](README.md) · [Contract](asset-job-contract.md) · [Interface inventory](interface-inventory.md) · [Package guide](../../companion/asset_jobs/README.md)

**Status:** exploratory. [`companion/asset_jobs/`](../../companion/asset_jobs/) carries no authority, is not the thing to build on, and is expected to be superseded. It runs a real ComfyUI provider in addition to deterministic mocks; llama-swap and remote APIs are not wired yet.

**This page is a description, not a spec.** It records what the code currently does, and it was written after the code, so it cannot be wrong about it; by the repository's own test that makes it a description rather than an authority. The upstream document is [asset-job-contract.md](asset-job-contract.md), whose requirements `C1`–`C16` govern the port. Where the two disagree, the contract is right.

## What this describes

**Observed behaviour, pinned by tests.** A change here is visible in the diff and in a failing test, but it is still not a promise:

- a job is a template of named steps with explicit dependencies;
- a step declares host requirements as amounts and attributes, and an exclusive swap group is a first-class resource;
- independent steps run concurrently; dependent steps wait;
- queued work starts in priority order (critical, normal, background);
- pause is queue-only; cancel is cooperative and per step;
- `suspend` and `resume_suspended` refuse with a typed code while no provider can checkpoint;
- preemption is evict-and-requeue, bounded by strict priority, per-job budget, cooldown, window, and reciprocity;
- a settled job writes one manifest with template and artifact hashes.

**Internal, free to change:**

- the `Scheduler` class, its methods, and in-process event list;
- the `provider:<id>` command form, the mock providers, and the package layout;
- the choice of eviction over suspension.

**Explicitly absent:**

- durable scheduler state, job submission over HTTP, and provider authentication;
- `parameterSpace`, task chunking, and multi-task steps;
- llama-swap and remote-provider adapters;
- checkpointing, and therefore true suspend/resume;
- a full PROV/RO-Crate export; the manifest is a compatible precursor.

## Before the port

The order matters more than the content.

1. **Amend the [contract](asset-job-contract.md) before changing behaviour it governs.** A requirement change is its own commit, ahead of the code.
2. **Then write the normative module on its own terms.** Its tests must run without `companion/asset_jobs/`, and it must not import from it.
3. **Delete the old path as each consumer moves.** No coexistence beyond a thin, dated adapter.
4. **Treat job templates as exploratory artifacts.** No user data depends on `provider:<id>` or on these control names yet; the spec decides what a template may contain before anything is saved and depended on.

## Why OpenJD

[Open Job Description](https://github.com/OpenJobDescription/openjd-specifications) is a portable job-template format for render and visual-compute work. It already models what this project needs:

- a job made of **steps**;
- steps that **depend** on each other or run in parallel;
- **tasks** as the schedulable unit;
- **host requirements** as amounts (CPU, memory, GPU) and attributes (model, provider, swap group);
- **environments** and sessions for shared setup;
- **job attachments** for input/output files in Deadline Cloud.

No other single standard covers that shape. Schedulers such as OpenCue, SLURM, Nomad, Kueue, or Deadline Cloud can run these jobs; OpenJD keeps the asset definition portable between them.

OpenJD intentionally does not define priority, preemption, pause/resume, cancellation, or provider authentication. This implementation adds those as scheduler semantics, not as template fields.

## The subset

The accepted JSON template subset is:

| Field | Supported |
| --- | --- |
| `name` | Required string |
| `specificationVersion` | Required, must start `jobtemplate-` |
| `parameters` | `STRING`, `INT`, `FLOAT`; optional `default` and `allowedValues` |
| `steps` | Non-empty list of steps |
| `step.name` | Unique string |
| `step.dependencies` | Names of earlier steps; cycles are rejected |
| `step.hostRequirements.amounts` | `{name, min}` entries |
| `step.hostRequirements.attributes` | `{name, anyOf}` entries |
| `step.script.actions.onRun.command` | `provider:<id>` (exploratory extension) |
| `step.script.actions.onRun.args` | Strings; `{{Param.Name}}` is substituted |
| `step.timeoutSeconds` | Positive number |
| `step.retry` | Non-negative integer |

Rejected explicitly rather than silently ignored:

- `parameterSpace` (one task per step);
- unknown parameter references;
- unknown dependencies, duplicate steps, and dependency cycles;
- non-positive timeouts and negative retries.

The `provider:<id>` command form is an **exploratory extension**, not upstream OpenJD. It keeps shell execution out of the template until the resource and cancellation model is proven. A production scheduler should either keep a provider adapter boundary or run a real command in an environment.

## Resource model

A pool is one worker, one GPU slot, or one remote provider capacity. It declares:

```python
ResourcePool(
    id="gpu-image",
    kind="local-gpu",
    amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
    attributes={
        "attr.worker.model": ("moss-image-sft",),
        "attr.worker.swap_group": ("image",),
    },
    swap_group="image",
)
```

- **Amounts** are capacities. A step requests a minimum; the scheduler reserves and releases them.
- **Attributes** are string capabilities. A step's `anyOf` must intersect the pool's values.
- **Swap groups** are exclusive resources. A pool with `swap_group="image"` only accepts steps that request that group, and the group's capacity limits concurrent residency. This is the llama-swap case: one model group at a time, but CPU and remote pools remain free.
- **Remote pools** have no amounts and a `capacity` equal to their concurrency limit.

The example worker layout:

| Pool | Kind | What it represents |
| --- | --- | --- |
| `gpu-image` | local GPU | MOSS-Image, swap group `image` |
| `gpu-mesh` | local GPU | Hunyuan3D, swap group `mesh` |
| `cpu-encode` | local CPU | 9B text encoder, 16 vCPU / 64 GB |
| `remote-audio` | remote | A remote audio provider, concurrency 2 |

An LLM on llama-swap would be another exclusive group, for example `llm-analysis` or `llm-prose`.

## Missing inputs and pending assets

A step can fail for two different reasons, and the difference is the whole point:

| State | Cause | Payload |
| --- | --- | --- |
| `failed` | The step ran and broke | An error, no claim about inputs |
| `unresolved` | Named assets do not exist | The missing identifiers |

`unresolved` is evidence, not a dead end. It says which content is absent, which
is exactly what a dependency tree is made of.

**Requirements are declared or reported.** A step may name what it needs:

```json
{ "name": "sprite", "requires": ["fragment/grounding-slate"] }
```

The scheduler checks declared requirements against the known assets *before*
reserving a worker, so an unmet requirement costs nothing. A provider can report
what it could not find at runtime:

```python
return ProviderResult(ok=False, error="fragment absent", missing=("fragment/x",))
```

A runtime `missing` is never retried — a second attempt cannot create content.

**Dependents inherit the evidence.** A dependent of a `failed` or cancelled step
is `skipped`, because nothing is known about what is missing. A dependent of an
`unresolved` step is `unresolved` with the union of the missing identifiers.
No step is left `pending` after settlement.

**Demand is collected and correlated.** Every unresolved step contributes its
missing identifiers to a pending set, deduplicated by identifier and listing
each demander:

```python
for asset in scheduler.pending_assets():
    print(asset.asset_id, asset.state, asset.depth, asset.requires, asset.demanders)
```

Edges are learned from the jobs themselves: a job that declares the asset it
produces and ends `unresolved` because of `Y` teaches `produced → Y`. Nothing has
to be declared up front.

```text
fragment/grounding-slate           root     depth=0  demands=3
prop/tower                         waiting  depth=1  requires=(fragment/grounding-slate,)
prop/brazier                       waiting  depth=1  requires=(fragment/grounding-slate,)
prop/crate                         waiting  depth=1  requires=(fragment/grounding-slate,)
```

`pending_roots()` returns the assets nothing has claimed it can produce — the
next authoring work. A cycle is reported as `state="cycle"` with `depth=None`
rather than walked as if it could resolve.

## Regeneration and locks

A job may name the asset it produces:

```python
job = scheduler.submit(template, {"Brief": brief}, asset_id="ruined-watchtower")
```

`asset_id` is what makes regeneration gating possible. Without it, the scheduler
has no identity to protect and every submission is independent.

**A lock stops replacement.** When an asset is locked, `submit` refuses with a
typed `RegenerationRefused`:

```text
ASSET_LOCKED: asset 'ruined-watchtower' is locked: standing 0.91 >= 0.8.
Unlock it to regenerate.
```

An automatic retry of a step belonging to a locked asset is refused the same
way: the step fails with `ASSET_LOCKED` and emits `step.retry-refused` rather
than quietly producing a second attempt. The first attempt is never interrupted;
the lock governs regeneration, not work already authorised.

**A lock is visible.** `lock_state(asset_id)` returns the record, `locks()`
returns all of them, and `can_regenerate(asset_id)` answers before a caller
tries — the same shape as `capabilities()` for suspension.

```python
record = scheduler.lock_state("ruined-watchtower")
# LockRecord(asset_id=..., reason="standing 0.91 >= 0.8", locked_by="policy", ...)
```

**Only a person releases it.** `scheduler.lock(asset_id, reason=..., by=...)`
sets a lock; `scheduler.unlock(asset_id, by=..., reason=...)` requires the actor
and the reason, and emits `asset.unlocked` with both. The scheduler records who
acted; it does not authenticate them. A UI is expected to show the lock and offer
the release.

**Standing can lock automatically.** A `RegenerationPolicy` may promote an asset
when the standing reported at submission reaches a threshold:

```python
Scheduler(..., regeneration_policy=RegenerationPolicy(auto_lock_standing=0.8))
```

The policy only ever sets locks. It never releases one, so a batch run cannot
undo a decision the story already made.

## Priority, pause, cancel

These are three different mechanisms. The names are easy to conflate, so the implementation keeps them separate.

| Concept | Current behavior |
| --- | --- |
| Priority | `CRITICAL=0`, `NORMAL=10`, `BACKGROUND=20`; queued work starts in priority order |
| Pause | Stops starting new steps for the job; running steps finish |
| Resume | Clears the pause and lets ready steps start |
| Suspend | Declared unsupported; returns `SUSPEND_UNSUPPORTED` with the alternative |
| Preempt | Evict and requeue, subject to the anti-livelock policy |
| Cancel | Cooperative signal; pending steps cancel immediately; running providers must return `cancelled` and free their reservation |
| Idempotency | Job IDs are unique; the manifest and events name the job and step |

### What "preemption" can mean

The word covers four different things, and they cost very different amounts:

1. **Priority ordering.** A critical job starts before a background job. Implemented. No running work is disturbed.
2. **Admission control.** A critical job is refused or delayed when capacity is exhausted, rather than degrading everything. Not implemented; resource pools fail closed instead.
3. **Suspend and resume a running step.** The step keeps its place and its partial state; a checkpoint is written and the step is continued later. **Declared unsupported** — see below.
4. **Evict and requeue.** The step is stopped, its work discarded, and it is restarted later. Implemented with an anti-livelock policy.

Suspend is a first-class operation that currently refuses with a reason rather than pretending. No provider in this repository can checkpoint: ComfyUI has no pause-and-continue API, and interrupting a llama-swap group forces a model reload. The honest answer is an explicit capability refusal, and the supported alternative is (4).

## Declared unsupported operations

`Scheduler.suspend()` and `Scheduler.resume_suspended()` return a typed [`Outcome`](../../companion/asset_jobs/scheduler.py):

```python
Outcome(
    ok=False,
    code="SUSPEND_UNSUPPORTED",
    message="provider 'comfy' cannot checkpoint a running step; use cancel() or preempt(), "
            "which restart the step",
    details={"provider": "comfy", "affectedSteps": ["sprite"], "alternative": "preempt"},
)
```

Callers branch on `ok` and `code`; they never infer capability from a guess. The refusal is also an event (`step.suspend-refused`), so it appears in the job's own record.

`Scheduler.capabilities()` publishes the same facts before anyone asks:

```json
{
  "suspend": {
    "supported": false,
    "reason": "no provider declares checkpointing; ComfyUI and llama-swap cannot pause a running job and continue it later",
    "providers": { "comfy": false },
    "alternative": "cancel and requeue (preempt), restarting the step"
  },
  "preempt": { "supported": true, "mode": "evict-and-requeue" },
  "pause": { "supported": true, "mode": "queue-only" },
  "cancel": { "supported": true, "mode": "cooperative" }
}
```

Providers declare their own limits through [`ProviderCapabilities`](../../companion/asset_jobs/providers.py):

```python
@dataclass(frozen=True)
class ProviderCapabilities:
    suspend: bool = False
    preemptible: bool = True
    streaming: bool = False
```

This is the **declared-unsupported** pattern: the interface is designed as if the capability existed, the implementation reports its absence with a machine-readable reason, and nothing silently degrades into a different operation.

## Anti-livelock rules for eviction

Eviction restarts a step. Two jobs that can evict each other would therefore restart each other forever. That is a **livelock**, and it is prevented by construction, not by timing:

| Rule | Effect |
| --- | --- |
| Strict priority | Only a strictly higher priority may evict. Equal or lower priority returns `PREEMPTION_NOT_HIGHER`. Two peers can never ping-pong. |
| Total order | Priority is a total order, so a cycle of "evicts" relations cannot exist while priorities are fixed. |
| No reciprocity | If the target already evicted the requester, the request is refused with `PREEMPTION_RECIPROCAL`. This is defence in depth for the case where a planner reassigns priorities. |
| Eviction budget | After `max_evictions_per_job` (default 2) the job is promoted to non-preemptible and further attempts return `PREEMPTION_PROMOTED`. |
| Cooldown | A job cannot be evicted twice within `cooldown_seconds` (default 2) → `PREEMPTION_COOLDOWN`. |
| Window budget | At most `max_evictions_per_window` (default 6) across the scheduler in `window_seconds` → `PREEMPTION_THROTTLED`. |

A refused eviction moves nothing: the target keeps running, its reservation stays held, and the refusal is emitted as `preemption.refused` with the code. An accepted eviction sets the step's own cancel signal, the provider stops, the step returns to `PENDING`, and its attempt counter increases. The manifest records the higher attempt number, so a restart is visible rather than silent.

Because cancellation is per step, evicting one step does not disturb the job's other running steps or any other job.

### Safe interrupt

ComfyUI's `POST /interrupt` stops whatever is currently executing, which may belong to another job. The provider therefore probes `/queue` first:

- if the prompt is **pending**, `POST /queue {"delete": [id]}` removes only that entry;
- if the prompt is **running**, `POST /interrupt` is used, because there is no per-prompt interrupt;
- if the probe fails, cancellation still reports `cancelled` but does not interrupt someone else's work.

## ComfyUI provider

[`comfy.py`](../../companion/asset_jobs/comfy.py) implements the provider boundary against the real ComfyUI HTTP API. The transport is injectable, so tests run without a server.

| Endpoint | Use |
| --- | --- |
| `POST /prompt` | Submit an API-format graph; rejects on `node_errors` |
| `GET /history/{prompt_id}` | Poll until complete or errored |
| `GET /view?filename=&subfolder=&type=` | Fetch each saved output |
| `GET /queue` | Check whether our prompt is pending or running before cancelling |
| `POST /queue {"delete": [id]}` | Remove a pending prompt |
| `POST /interrupt` | Stop a running prompt |

Step arguments:

```json
"script": {
  "actions": {
    "onRun": {
      "command": "provider:comfy",
      "args": [
        "--graph", "workflows/comfyui/r6_ship_crate_standard.json",
        "--set", "4.inputs.text={{Param.Brief}}",
        "--set", "7.inputs.seed={{Param.Seed}}",
        "--set", "2.inputs.device=cpu"
      ]
    }
  }
}
```

- `--graph` resolves against the working directory first, then the repository root.
- `--set NODE.INPUT=VALUE` overwrites one node input. JSON scalars keep their type, so `seed=42` is an integer and `cfg=4.5` is a float. An unknown node or input is a failure, not a silent no-op.
- `--set 2.inputs.device=cpu` is the MOSS-Image 9B encoder moving off the GPU.
- `--artifact-kind` overrides the inferred kind; otherwise the extension decides (`image`, `mesh`, `file`).
- `--poll` sets the history polling interval.

Artifacts are inferred from the outputs the save nodes report. A workflow that saves nothing fails with an explicit message rather than returning success with no evidence.

### Run a real job

```bash
python3 -m companion.asset_jobs.run \
  --template companion/asset_jobs/templates/comfy-sprite.job.json \
  --comfy http://127.0.0.1:8188 \
  --param Brief="a ruined watchtower" --param Seed=7 \
  --output renders/asset-jobs
```

The CLI prints the job state, each step, the artifact hashes, and the manifest path. It exits non-zero unless the job completed.

### Manifest for a ComfyUI job

```json
{
  "state": "completed",
  "steps": [
    { "name": "sprite", "state": "completed", "provider": "comfy", "attempts": 1 }
  ],
  "artifacts": [
    {
      "kind": "image",
      "mediaType": "image/png",
      "sha256": "9fc6552e65…",
      "path": "artifacts/sprite/sprite_0001.png"
    }
  ],
  "providers": ["comfy"]
}
```

The provider also records the prompt id, the workflow label, and the graph SHA-256 in the artifact provenance, so a later ledger entry can cite the exact graph that produced the file.

## Events

Events are CloudEvents-shaped:

```json
{
  "specversion": "1.0",
  "id": "…",
  "source": "spritequest.asset-jobs",
  "type": "io.spritequest.asset.step.completed",
  "subject": "ruined-watchtower-critical",
  "time": "2026-10-28T…Z",
  "data": {
    "jobId": "ruined-watchtower-critical",
    "step": "sprite",
    "stepState": "completed",
    "state": "running",
    "artifacts": ["ruined-watchtower-critical/sprite"]
  }
}
```

Event types:

- `job.queued`, `job.started`, `job.paused`, `job.resumed`, `job.cancelling`, `job.cancelled`, `job.completed`, `job.failed`
- `step.started`, `step.completed`, `step.failed`, `step.retrying`, `step.cancelled`

A consumer can await only the critical steps and let optional assets stream in later.

## Manifest

Every settled job writes `manifest.json` next to its artifacts. The shape is PROV/RO-Crate-like:

- job ID, template name, template SHA-256, parameters, priority, state;
- timestamps for the job and every step;
- each step's provider, attempt count, error, requirements, and artifact IDs;
- each artifact's path, SHA-256, byte count, media type, and provenance;
- the provider set and scheduler version.

The artifact hash is the acceptance handle. A later ledger entry can cite it without trusting the provider's word.

## Run it

```bash
python3 -m companion.asset_jobs.demo
python3 companion/test_asset_jobs.py
python3 companion/test_asset_jobs_comfy.py
```

The demo prints the capability report, submits a critical `ruined-watchtower` job and a background `relic-cairn` job, refuses a suspend, evicts the background step, and shows that the reverse eviction is refused. It writes to `renders/asset-jobs/` by default.

## Current limitations

- One task per step; no `parameterSpace` or task chunking.
- Known assets are declared through `register_asset` and completed jobs; there is
  no content store to query.
- Suspend/resume is declared unsupported; there is no checkpointing provider.
- Locks are per asset identity provided by the caller, not derived from the ledger.
- Preemption is eviction plus requeue, not suspension, so an evicted step restarts from zero.
- No durable scheduler state; a process restart loses in-flight jobs.
- Only the ComfyUI provider is real; the rest are mocks. llama-swap and remote APIs are not wired.
- No HTTP API or CloudEvent transport; events are in-process.
- No artifact store beyond the local job directory.
- No provider authentication, rate-limit accounting, or cost tracking.
- No full PROV/RO-Crate serialization yet; the manifest is a compatible precursor.
- A lock does not authenticate its actor; `by` is recorded, not verified.

## Next steps

1. Wire the llama-swap provider for text and audio models, with the same cancel behaviour.
2. Add an HTTP job API (`POST /jobs`, `GET /jobs/{id}`, `POST /jobs/{id}/cancel`, pause/resume).
3. Add CloudEvents transport (SSE or webhook) and an AsyncAPI document.
4. Persist scheduler state and make job submission idempotent.
5. Wrap the scheduler in the semantic asset service: brief/recipe in, manifest/artifacts out.
6. Add a PROV/RO-Crate exporter and link it to the Hollis ledger.