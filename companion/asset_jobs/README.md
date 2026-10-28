# Portable asset jobs

A small, dependency-free scheduler for **asset generation jobs that can be
described before they run**: steps with dependencies, declared host needs,
priorities, cancellation, regeneration locks, and a manifest with content
hashes.

It exists because a pipeline script cannot answer questions a producer asks:
which stage is blocked, what is missing, what may be safely regenerated, and
what did we actually build. This package answers them without knowing what the
asset is for.

**Status: pre-1.0, exploratory.** There is no published distribution. Copy the
directory or vendor it; the API may change until it is extracted and versioned.
Nothing here imports the rest of the repository, and nothing here knows about
SillyTavern, ComfyUI workflows, or the SpriteQuest fiction.

| | |
| --- | --- |
| Language | Python 3.10+ |
| Dependencies | standard library only |
| External services | none required; one optional ComfyUI provider |
| Tests | `companion/test_asset_jobs.py` and `companion/test_asset_jobs_comfy.py` (beside the package in this repository) |

## What it is not

- not an asset store: it writes a job directory and a manifest, no content database;
- not a service: there is no HTTP API, no authentication, no persistence;
- not a renderer: providers do the work;
- not durable: a process restart loses in-flight jobs;
- not a workflow engine: one job is one dependency graph of steps, not a graph editor.

## Quick start

A job template is plain JSON:

```json
{
  "name": "watchtower",
  "specificationVersion": "jobtemplate-2023-09",
  "parameters": [{ "name": "Brief", "type": "STRING" }],
  "steps": [
    {
      "name": "sprite",
      "requires": ["fragment/grounding-slate"],
      "hostRequirements": {
        "amounts": [{ "name": "amount.worker.gpu", "min": 1 }],
        "attributes": [{ "name": "attr.worker.model", "anyOf": ["moss-image-sft"] }]
      },
      "script": { "actions": { "onRun": { "command": "provider:comfy", "args": ["--graph", "portrait.json"] } } }
    },
    {
      "name": "mesh",
      "dependencies": ["sprite"],
      "hostRequirements": {
        "amounts": [{ "name": "amount.worker.gpu", "min": 1 }],
        "attributes": [{ "name": "attr.worker.model", "anyOf": ["hunyuan3d"] }]
      },
      "script": { "actions": { "onRun": { "command": "provider:comfy", "args": ["--graph", "mesh.json"] } } }
    }
  ]
}
```

```python
from asset_jobs import Scheduler, ResourcePool, load_job_template

scheduler = Scheduler(
    pools=[
        ResourcePool(
            "gpu",
            "local-gpu",
            amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
            attributes={"attr.worker.model": ("moss-image-sft", "hunyuan3d")},
            capacity=1,
        )
    ],
    providers={"comfy": ComfyUIProvider(server="http://127.0.0.1:8188")},
    output_dir="renders/jobs",
)

job = scheduler.submit(load_job_template("watchtower.job.json"), {"Brief": "a ruin"})
scheduler.run_until_idle()

print(job.state)                 # JobState.COMPLETED
print(job.manifest_path)         # renders/jobs/<job-id>/manifest.json
for artifact in job.artifacts:
    print(artifact.kind, artifact.sha256, artifact.path)
```

## Concepts

### Steps and dependencies

A step is the unit of work. `dependencies` order steps; independent steps run
concurrently as pools allow. Duplicate names, unknown dependencies and cycles
are rejected when the template is parsed, not when a job runs.

### Host requirements

`amounts` are capacities (`amount.worker.vcpu`, `memory_gb`, `gpu`,
`vram_gb`; any name works). `attributes` are string capabilities
(`attr.worker.model`, `attr.worker.provider`). A pool is eligible only if it
satisfies both.

### Swap groups

Some workers can hold only one model at a time. Declare that honestly:

```python
ResourcePool(
    "gpu-image",
    "local-gpu",
    amounts={"amount.worker.gpu": 1},
    attributes={
        "attr.worker.model": ("moss-image-sft",),
        "attr.worker.swap_group": ("image",),
    },
    swap_group="image",   # exclusive to `capacity`
)
```

A pool with a swap group accepts only steps requesting that group, so an
unrelated job cannot consume it. This models llama-swap residency without the
scheduler knowing llama-swap exists.

### Requirements and missing content

A step may name content it needs:

```json
{ "name": "sprite", "requires": ["fragment/grounding-slate"] }
```

Declared requirements are checked against known assets **before** a worker is
reserved. A provider may also report what it could not find:

```python
ProviderResult(ok=False, error="fragment absent", missing=("fragment/x",))
```

The two produce different states, and the difference matters:

| State | Cause | Payload |
| --- | --- | --- |
| `failed` | The step ran and broke | error, no claim about inputs |
| `unresolved` | Named content is absent | the missing identifiers |

A runtime `missing` is never retried: a second attempt cannot create content.

### Turns, priorities, cancellation

- `Priority.CRITICAL` / `NORMAL` / `BACKGROUND` order queued work.
- `pause()` stops starting new steps; running work finishes. `resume()` continues.
- `cancel()` is cooperative, per step; running steps must stop and release their
  reservation.
- `preempt(job_id, by_job_id=…)` evicts and requeues running work. Only a strictly
  higher priority may evict; equal priorities never do. A job is promoted to
  non-preemptible after a bounded number of evictions; cooldown, a rolling
  window and a reciprocity check bound churn.

### Suspension is refused, not faked

`suspend()` and `resume_suspended()` return a typed `Outcome` with
`SUSPEND_UNSUPPORTED` when no provider can checkpoint, and `capabilities()`
publishes that before anyone asks. The supported alternative is
`preempt()`/`cancel()` plus resubmission.

### Regeneration locks

An asset that the story has accepted should not be replaced by a batch run:

```python
scheduler.lock("prop/tower", reason="approved", by="user")
scheduler.submit(template, asset_id="prop/tower")   # raises RegenerationRefused
scheduler.unlock("prop/tower", by="operator", reason="regenerate")
```

`ASSET_LOCKED` carries the reason. `lock_state()`, `locks()` and
`can_regenerate()` let a UI show the lock without attempting a run. Automation
may set a lock (for example when standing crosses a threshold via
`RegenerationPolicy`) but never releases one.

### Pending assets

Unresolved steps feed a deduplicated pending set. Edges are learned from the
jobs themselves: a job that declares the asset it produces and ends unresolved
because of `Y` teaches `produced → Y`.

```python
for asset in scheduler.pending_assets():
    print(asset.asset_id, asset.state, asset.depth, asset.requires, asset.demanders)

scheduler.pending_roots()   # nothing has claimed it can produce these
```

`state` is `root` (no known requirements), `waiting` (requirements known) or
`cycle` (reported, never walked).

## API

```python
Scheduler(pools, providers, *, output_dir="renders/asset-jobs", event_sink=None,
          max_workers=8, swap_groups=None, preemption_policy=None,
          regeneration_policy=None)

submit(template, parameters=None, *, priority=NORMAL, job_id=None,
       asset_id=None, standing=None) -> Job      # raises RegenerationRefused
start(); stop(); run_until_idle()
wait(job_id, timeout=None) -> Job
pause(job_id); resume(job_id); cancel(job_id)
preempt(job_id, *, by_job_id=None, reason="higher priority work") -> Outcome
suspend(job_id, step=None) -> Outcome; resume_suspended(job_id, step=None) -> Outcome
capabilities() -> dict
lock(asset_id, *, reason, by="user", standing=None) -> LockRecord
unlock(asset_id, *, by, reason) -> Outcome
lock_state(asset_id); locks(); can_regenerate(asset_id) -> Outcome
register_asset(asset_id); known_assets()
pending_assets() -> tuple[PendingAsset, ...]; pending_roots()
events() -> list[dict]; wait_for_event(type, *, job_id=None, step=None, timeout=5)
```

Value types: `Job`, `StepRun`, `Artifact`, `LockRecord`, `PendingAsset`,
`Outcome`, `PreemptionPolicy`, `RegenerationPolicy`, `JobState`, `StepState`,
`Priority`.

## Writing a provider

A provider is one method:

```python
class MyProvider:
    id = "mine"

    def run(self, request: ProviderRequest) -> ProviderResult:
        # request.job_id, request.step, request.args, request.parameters,
        # request.output_dir, request.cancel_event
        if request.cancel_event.is_set():
            return ProviderResult(ok=False, cancelled=True, error="cancelled")
        ...
        return ProviderResult(ok=True, artifacts=(artifact,))
```

Rules that keep the scheduler honest:

- check `cancel_event` between expensive steps and return `cancelled`;
- return `missing=` only when content is genuinely absent, never for a crash;
- write artifacts under `request.output_dir` and return their SHA-256;
- never execute a shell command from a template;
- treat the injected transport as the only network access.

`MockProvider` is included for tests: it writes a JSON artifact after a delay
and never touches the network.

## ComfyUI provider

`ComfyUIProvider` submits an API-format graph to `/prompt`, polls `/history`,
fetches each saved output from `/view`, and cancels through `/queue` and
`/interrupt`. The transport is injectable, so the contract is testable without
a GPU.

```json
"args": [
  "--graph", "workflows/comfyui/r6_ship_crate_standard.json",
  "--set", "4.inputs.text={{Param.Brief}}",
  "--set", "7.inputs.seed={{Param.Seed}}",
  "--set", "2.inputs.device=cpu"
]
```

`--set NODE.INPUT=VALUE` overwrites one input; JSON scalars keep their type. An
unknown node or input is a failure, not a silent no-op. Cancellation probes
`/queue` first, so a pending prompt is deleted without interrupting another
job's render.

## Events and manifest

Events are CloudEvents-shaped (`io.spritequest.asset.<type>`), covering job and
step lifecycle, refusals (`step.suspend-refused`, `step.retry-refused`,
`preemption.refused`), locks, and unresolved work.

Each settled job writes one `manifest.json` containing the template hash, every
step's state, attempts and missing inputs, and every artifact's path, media
type, size and SHA-256. The hash is the handle another system can cite.

## Guarantees

The behaviour above is specified as numbered requirements in the repository's
asset-job contract, with a conformance table. Delivered items are tested; the
current statement of conformance is "all mandatory capabilities implemented".

## Extracting this as a library

The directory is self-contained by construction:

```bash
cp -r companion/asset_jobs ../my-project/vendor/asset_jobs
```

Before publishing it properly:

1. **Rename the event prefix** (`io.spritequest.asset`) — it is the only
   game-specific string in the code.
2. **Split the ComfyUI provider** into an optional extra, so the core has no
   HTTP client and no opinion about renderers.
3. **Add packaging** (`pyproject.toml`), a version, and the tests as a suite.
4. **Publish the contract alongside it**; the requirements are what a dependent
   may rely on, and they are currently in this repository's docs.
5. **Decide the queue boundary**: the in-process scheduler is deliberately
   replaceable by OpenCue, Nomad, Kueue or a cloud job service. Keep the
   template format portable if that happens.

## Limitations

- one task per step: no `parameterSpace`, no chunking;
- no durable state, recovery, or idempotent submission;
- no HTTP API, event transport, or authentication;
- no admission control or per-pool quotas;
- suspension is refused, never emulated;
- locks record their actor but do not authenticate one;
- no cost, rate-limit, or token accounting;
- the manifest is a precursor to PROV/RO-Crate, not a serialization of it.