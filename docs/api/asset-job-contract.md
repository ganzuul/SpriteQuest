# Asset job contract

[API overview](README.md) · [Implementation description](asset-jobs.md) · [Interface inventory](interface-inventory.md)

**Status:** contract for the port. This document is upstream of the work it
governs: the normative asset-job module does not exist yet. Where this contract
and `companion/asset_jobs/` disagree, this contract is right and the sketch is
defective.

`companion/asset_jobs/` is an exploratory implementation that happens to be
checked against these requirements. It is not the thing this contract governs,
and satisfying a requirement here does not promote the sketch to normative.

## Conformance proforma

Modeled on the PICS proforma in ISO/IEC 9646-7. `Status` is the requirement on
any implementation; `Support` is this implementation's answer. `N/A` is legal
only where `Status` is `n.a.`.

| Item | Requirement | Status | Support | Reference | Remarks |
| --- | --- | --- | --- | --- | --- |
| C1 | A job is a portable document of named steps with explicit, acyclic dependencies, interpretable without the producing process. | m | Y | `model.py`; `TemplateTests` | Duplicate, unknown and cyclic names rejected. |
| C2 | Independent steps may run concurrently; a step does not start before every dependency completes. | m | Y | `scheduler.py`; parallel and dependency tests | |
| C3 | A dependent of a step that did not complete resolves explicitly: `skipped` when the cause is failure or cancellation, `unresolved` when the cause is a missing input. No step stays indeterminate after settlement. | m | Y | `scheduler.py` `_resolve_blocked_locked`; propagation tests | |
| C4 | Requirements are quantities (cpu, memory, gpu, vram) and named attributes; a worker is eligible only if it satisfies both. | m | Y | `resources.py`; `test_no_eligible_pool_fails_closed` | |
| C5 | A swap group is exclusive to its capacity; a worker dedicated to a group refuses steps that do not request it. | m | Y | `resources.py`; `test_swap_group_is_exclusive` | |
| C6 | A remote or shared provider is modelled as a pool with a declared concurrency limit. | m | Y | `resources.py` `capacity` | Model only; no remote adapter yet. |
| C7 | Queued work starts in declared priority order. | m | Y | `test_priority_orders_queued_jobs` | |
| C8 | Pause stops starting new steps and never discards running work; resume continues from the same state. | m | Y | `test_pause_and_resume` | |
| C9 | Cancel is cooperative and per step; pending steps cancel immediately; a running step stops, releases its reservation, and reports the outcome. | m | Y | `test_cancel_before_start`, `test_cancel_while_running` | |
| C10 | Suspend and resume either work or refuse with a typed code; the capability is discoverable before asking; the refusal names the alternative and is never reported as success. | m | Y | `suspend`, `resume_suspended`, `capabilities()`; suspend tests | No provider can checkpoint, so refusal is the delivered behaviour. |
| C11 | Preemption restarts the step, and the restart is visible in the attempt count. | m | Y | `test_preemption_evicts_and_requeues_the_step` | |
| C12 | Only a strictly higher priority may evict; equal priorities never evict each other. | m | Y | `test_preemption_requires_strictly_higher_priority`, `test_equal_priority_jobs_cannot_ping_pong` | |
| C13 | Evictions per job are bounded; cooldown, rolling window and reciprocity bound churn; no pair of jobs can restart each other indefinitely. | m | Y | policy tests | Pinned on single-step jobs only; see G3. |
| C14 | A settled job writes exactly one manifest with template identity and hash, per-step state and attempts, artifact hashes, and provider identity. | m | Y | `manifest.py`; `test_sample_job_completes_with_manifest` | |
| C15 | State changes are observable as events with a stable type; a refusal carries a machine-readable code. | m | Y | `scheduler.py` `_emit`; event assertions | |
| C16 | Providers receive an injected transport; no step executes a shell command; behaviour is testable without a GPU or network. | m | Y | `comfy.py`, `providers.py`; ComfyUI transport tests | |
| C17 | A job may declare an asset identity. A job that would regenerate a locked asset is refused before it is created, and an automatic retry is refused while the asset is locked. | m | Y | `scheduler.py` `submit`, `_execute_step`; lock tests | |
| C18 | A regeneration refusal carries a machine-readable code naming the asset and the lock reason. It never replaces the artifact anyway. | m | Y | `RegenerationRefused`; refusal tests | `ASSET_LOCKED`, with the reason in the message and details. |
| C19 | Lock state is readable without attempting regeneration: asset, reason, who set it, and when. | m | Y | `lock_state`, `locks`, `can_regenerate`; observability test | |
| C20 | Automation may set a lock but may not release one. A release records who released it and why. | m | Y | `lock` (by `policy`), `unlock` (requires `by` and `reason`); auto-lock tests | The scheduler records the actor; it does not authenticate one. |
| C21 | A retry is a new attempt of the same step, not an eviction: it consumes no eviction budget and changes no priority. | m | Y | `scheduler.py` `_execute_step` | Semantics were unstated until D2; the behaviour already matched. |
| C22 | A refusal to run because named assets are absent is `unresolved` and carries those identifiers. Any other failure is `failed` and carries none. The distinction is asserted, never inferred from an error string. | m | Y | `StepState.UNRESOLVED`, `ProviderResult.missing`, `Step.requires`; missing-input tests | |
| C23 | A dependent inherits its dependencies' state: completed permits a run, unresolved becomes unresolved with the union of missing identifiers, and failed, cancelled or skipped becomes skipped with a reason. | m | Y | `_resolve_blocked_locked`; union and skip tests | |
| C24 | Every unresolved step contributes its missing identifiers to a pending set, deduplicated by identifier and listing every demander. | m | Y | `pending_assets`; deduplication test | |
| C25 | A job that declares the asset it produces records `produced → missing` edges when it is unresolved. The pending set exposes those edges. | m | Y | `pending_assets` learned edges; chain test | |
| C26 | A pending asset with no recorded requirements is a root and is reported as the next thing to author. A cycle is reported as a cycle and never walked as if it could resolve. | m | Y | `pending_roots`, `_cyclic_nodes`; root and cycle tests | |

### Statement of conformance

**Are all mandatory capabilities implemented?** Yes.

Every mandatory item is supported, with the qualifications recorded in
`Remarks`. The two contract defects that delivery found — D1 and D3 — were
answered by amending the contract, and the amended items are now delivered.

## Findings

Delivery exposes two kinds of failure, and they are not interchangeable.

**Contract defects** — the contract did not say, and delivery needed an answer:

- **D1 (C3):** failure propagation was unspecified. The sketch settles the job
  `failed` while its dependents remain `pending`. That is not a bug against a
  requirement; it is a missing requirement. C3 was added because of this
  finding.
- **D3:** `C3` assumed one kind of failure and that skipping was a sufficient
  answer. Delivery showed that a failure may mean *missing content*, which
  points at a dependency tree rather than a dead end. `C3` was reworded,
  `C22`–`C26` were added, and all are now delivered.
- **D2:** retry semantics were unspecified. Resolved: `C21` states that a retry
  is a new attempt rather than an eviction, and `C17`–`C20` gate regeneration
  behind an asset lock. The gate is delivered and tested.

**Conformance gaps** — the contract says, the sketch does not do:

- **G1 (C3):** dependents are not resolved on failure.
- **G2:** `step.retry` has no test, so its behaviour is unverified.
- **G3 (C13):** preemption is tested on single-step jobs only; multi-step
  eviction is exercised but not pinned.
- **G5 (C22–C26):** the pending-asset model is specified but not implemented.
  There is one failure kind, no missing channel, and nothing correlating demand.
- ~~G4 (C17–C20):~~ resolved in `feat(asset-jobs): gate regeneration behind an
  asset lock`. The gate, the refusal code, and the observable lock are delivered
  and tested.

## Out of scope

These are excluded by the contract, not deferred defects:

- durable scheduler state and restart recovery;
- an HTTP job API, CloudEvents transport, and provider authentication;
- `parameterSpace`, task chunking, and multi-step tasks;
- checkpointing, and therefore true suspension;
- admission control and per-pool quotas;
- cost, rate-limit, and token accounting.

## How to use this

- A commit that delivers against this contract cites the requirement IDs it
  meets, and lists the ones it does not.
- A change to a requirement is a contract change and belongs in its own commit,
  before the code that depends on it.
- A finding that the contract failed to say something is recorded here as a
  contract defect. Adding the requirement is the fix; the code follows.
- This document was transcribed after the first sketch, which is recorded rather
  than hidden. Its authority comes from governing the port, which has not
  happened yet.