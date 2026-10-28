"""A small, dependency-aware scheduler for the OpenJD subset.

This is deliberately a spike, not a production scheduler. It proves the
properties the asset layer needs:

* submit early and return a handle;
* run independent steps in parallel, respecting dependencies;
* treat GPU/CPU/remote pools and llama-swap swap groups as explicit resources;
* order queued work by priority;
* pause, resume, and cancel a job cooperatively;
* write an artifact manifest when the job settles.

It does not implement preemption, durable state, or remote-provider auth yet.
"""

from __future__ import annotations

import threading
import time
import uuid
from collections import deque
from concurrent.futures import Future, ThreadPoolExecutor
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, IntEnum
from pathlib import Path
from typing import Any, Callable, Iterable, Mapping

from .manifest import SCHEDULER_VERSION, write_manifest
from .model import HostRequirements, JobTemplate, Step, resolve_parameters, substitute
from .providers import (
    Artifact,
    Provider,
    ProviderCapabilities,
    ProviderError,
    ProviderRequest,
    ProviderResult,
    resolve_provider,
)
from .resources import Reservation, ResourcePool, SwapGroup


class Priority(IntEnum):
    """Lower numbers run first. Map criticality onto these three classes."""

    CRITICAL = 0
    NORMAL = 10
    BACKGROUND = 20


class JobState(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    PAUSED = "paused"
    CANCELLING = "cancelling"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    FAILED = "failed"


class StepState(str, Enum):
    PENDING = "pending"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


_TERMINAL_JOB_STATES = {JobState.CANCELLED, JobState.COMPLETED, JobState.FAILED}


@dataclass
class StepRun:
    step: Step
    state: StepState = StepState.PENDING
    attempt: int = 0
    started_at: float | None = None
    finished_at: float | None = None
    error: str | None = None
    provider: str | None = None
    artifacts: list[Artifact] = field(default_factory=list)
    reservation: Reservation | None = None
    cancel_event: threading.Event = field(default_factory=threading.Event)
    preemption: dict[str, Any] | None = None
    suspended: bool = False


@dataclass
class Job:
    id: str
    template: JobTemplate
    parameters: dict[str, Any]
    priority: int
    output_dir: Path
    template_hash: str
    state: JobState = JobState.QUEUED
    created_at: float = field(default_factory=time.time)
    started_at: float | None = None
    finished_at: float | None = None
    cancel_event: threading.Event = field(default_factory=threading.Event)
    pause_event: threading.Event = field(default_factory=threading.Event)
    step_runs: dict[str, StepRun] = field(default_factory=dict)
    manifest_path: Path | None = None
    evictions: int = 0
    last_eviction_at: float | None = None
    preemptible: bool = True
    evicted_by: set[str] = field(default_factory=set)
    asset_id: str | None = None
    standing: float | None = None

    @property
    def artifacts(self) -> list[Artifact]:
        return [
            artifact
            for step_run in self.step_runs.values()
            for artifact in step_run.artifacts
        ]

    @property
    def is_terminal(self) -> bool:
        return self.state in _TERMINAL_JOB_STATES

    def step(self, name: str) -> StepRun:
        return self.step_runs[name]


class RegenerationRefused(RuntimeError):
    """A submission or retry that would replace a locked asset.

    The refusal is typed so a caller can branch without parsing prose, and so a
    UI can show the lock rather than an unexplained failure.
    """

    def __init__(self, code: str, message: str, *, asset_id: str | None = None,
                 details: Mapping[str, Any] | None = None) -> None:
        super().__init__(message)
        self.code = code
        self.asset_id = asset_id
        self.details = dict(details or {})


@dataclass(frozen=True)
class LockRecord:
    """Why an asset will not be regenerated without a person saying so."""

    asset_id: str
    reason: str
    locked_by: str
    locked_at: float
    standing: float | None = None


@dataclass(frozen=True)
class RegenerationPolicy:
    """Automation may set a lock; it never releases one.

    ``auto_lock_standing`` locks an asset when the standing reported at
    submission reaches the threshold, so a batch run cannot trivially replace
    something the story already accepted. Releasing is a user action.
    """

    auto_lock_standing: float | None = None


@dataclass(frozen=True)
class Outcome:
    """A typed refusal or acceptance. Never a silent no-op."""

    ok: bool
    code: str
    message: str
    details: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class PreemptionPolicy:
    """Anti-livelock rules for evicting running work.

    Two jobs that can evict each other and restart would ping-pong forever.
    The policy makes that impossible rather than merely unlikely:

    * only a strictly higher priority may evict (equal priority never does);
    * a job that has itself been evicted may not evict anyone (no reciprocity);
    * a job is promoted to non-preemptible after ``max_evictions_per_job``;
    * a per-job cooldown and a rolling window bound the churn.
    """

    max_evictions_per_job: int = 2
    cooldown_seconds: float = 2.0
    window_seconds: float = 60.0
    max_evictions_per_window: int = 6
    allow_reciprocal: bool = False


class Scheduler:
    def __init__(
        self,
        pools: Iterable[ResourcePool],
        providers: Mapping[str, Provider],
        *,
        output_dir: str | Path = "renders/asset-jobs",
        event_sink: Callable[[dict[str, Any]], None] | None = None,
        max_workers: int = 8,
        swap_groups: Mapping[str, SwapGroup] | None = None,
        scheduler_version: str = SCHEDULER_VERSION,
        preemption_policy: PreemptionPolicy | None = None,
        regeneration_policy: RegenerationPolicy | None = None,
    ) -> None:
        self._pools = list(pools)
        self._providers = dict(providers)
        self._output_dir = Path(output_dir)
        self._event_sink = event_sink
        self._max_workers = max(1, int(max_workers))
        self._scheduler_version = scheduler_version
        self._policy = preemption_policy or PreemptionPolicy()
        self._regeneration = regeneration_policy or RegenerationPolicy()
        self._locks: dict[str, LockRecord] = {}
        self._lock_mutex = threading.Lock()
        self._eviction_log: deque[float] = deque()
        groups = dict(swap_groups or {})
        for pool in self._pools:
            if pool.swap_group and pool.swap_group not in groups:
                groups[pool.swap_group] = SwapGroup(pool.swap_group)
        self._swap_groups = groups
        self._condition = threading.Condition(threading.RLock())
        self._manifest_lock = threading.Lock()
        self._jobs: dict[str, Job] = {}
        self._events: list[dict[str, Any]] = []
        self._futures: dict[Future[Any], tuple[str, str]] = {}
        self._executor: ThreadPoolExecutor | None = None
        self._thread: threading.Thread | None = None
        self._stop = threading.Event()
        self._closed = False
        self._sequence = 0

    # -- lifecycle ---------------------------------------------------------

    def start(self) -> None:
        with self._condition:
            if self._closed:
                raise RuntimeError("scheduler is closed")
            if self._thread and self._thread.is_alive():
                return
            self._stop.clear()
            self._ensure_executor()
            self._thread = threading.Thread(
                target=self._run_loop, name="asset-job-scheduler", daemon=True
            )
            self._thread.start()

    def stop(self) -> None:
        with self._condition:
            self._closed = True
            self._stop.set()
            for job in self._jobs.values():
                if not job.is_terminal:
                    job.cancel_event.set()
            self._condition.notify_all()
        thread = self._thread
        if thread and thread.is_alive():
            thread.join(timeout=5.0)
        self._write_pending_manifests()
        executor = self._executor
        if executor is not None:
            executor.shutdown(wait=True, cancel_futures=True)
        self._executor = None
        self._thread = None

    def _ensure_executor(self) -> ThreadPoolExecutor:
        if self._executor is None:
            self._executor = ThreadPoolExecutor(
                max_workers=self._max_workers, thread_name_prefix="asset-job"
            )
        return self._executor

    # -- submission and control -------------------------------------------

    def submit(
        self,
        template: JobTemplate,
        parameters: Mapping[str, Any] | None = None,
        *,
        priority: int | Priority = Priority.NORMAL,
        job_id: str | None = None,
        asset_id: str | None = None,
        standing: float | None = None,
    ) -> Job:
        values = resolve_parameters(template, parameters)
        if asset_id is not None:
            self._refuse_if_locked(asset_id)
        with self._condition:
            if self._closed:
                raise RuntimeError("scheduler is closed")
            identifier = job_id or f"job-{uuid.uuid4().hex[:12]}"
            if identifier in self._jobs:
                raise ValueError(f"job {identifier!r} already exists")
            output_dir = self._output_dir / identifier
            output_dir.mkdir(parents=True, exist_ok=True)
            job = Job(
                id=identifier,
                template=template,
                parameters=values,
                priority=int(priority),
                output_dir=output_dir,
                template_hash=template.sha256(),
                asset_id=asset_id,
                standing=standing,
            )
            job.step_runs = {step.name: StepRun(step) for step in template.steps}
            self._jobs[identifier] = job
            self._sequence += 1
            self._emit(job, "job.queued", data={"sequence": self._sequence})
            self._condition.notify_all()
            return job

    def pause(self, job_id: str) -> Job:
        with self._condition:
            job = self._job(job_id)
            if job.is_terminal:
                return job
            job.pause_event.set()
            job.state = JobState.PAUSED
            self._emit(job, "job.paused")
            self._condition.notify_all()
            return job

    def resume(self, job_id: str) -> Job:
        with self._condition:
            job = self._job(job_id)
            if job.is_terminal:
                return job
            job.pause_event.clear()
            job.state = JobState.RUNNING if job.started_at else JobState.QUEUED
            self._emit(job, "job.resumed")
            self._condition.notify_all()
            return job

    # -- capabilities and unimplemented operations -------------------------

    def provider_capabilities(self, provider_id: str) -> ProviderCapabilities:
        provider = self._providers.get(provider_id)
        declared = getattr(provider, "capabilities", None)
        return declared if isinstance(declared, ProviderCapabilities) else ProviderCapabilities()

    def capabilities(self) -> dict[str, Any]:
        """Advertise what the scheduler can and cannot do.

        A caller can consult this before asking. It exists because a refusal is
        only honest if the caller had a way to know in advance.
        """

        suspend_providers = {
            provider_id: self.provider_capabilities(provider_id).suspend
            for provider_id in sorted(self._providers)
        }
        return {
            "suspend": {
                "supported": any(suspend_providers.values()),
                "reason": (
                    "no provider declares checkpointing; ComfyUI and llama-swap "
                    "cannot pause a running job and continue it later"
                )
                if not any(suspend_providers.values())
                else "at least one provider declares checkpointing",
                "providers": suspend_providers,
                "alternative": "cancel and requeue (preempt), restarting the step",
            },
            "preempt": {
                "supported": True,
                "mode": "evict-and-requeue",
                "policy": {
                    "maxEvictionsPerJob": self._policy.max_evictions_per_job,
                    "cooldownSeconds": self._policy.cooldown_seconds,
                    "windowSeconds": self._policy.window_seconds,
                    "maxEvictionsPerWindow": self._policy.max_evictions_per_window,
                    "allowReciprocal": self._policy.allow_reciprocal,
                },
            },
            "pause": {"supported": True, "mode": "queue-only"},
            "cancel": {"supported": True, "mode": "cooperative"},
        }

    def suspend(self, job_id: str, step: str | None = None) -> Outcome:
        """Suspend running work, or refuse with a reason.

        No provider in this spike can checkpoint, so the honest answer is
        ``SUSPEND_UNSUPPORTED`` plus the supported alternative. The call is
        still a first-class operation: callers branch on it instead of guessing.
        """

        with self._condition:
            job = self._job(job_id)
            targets = (
                [job.step_runs[step]]
                if step is not None and step in job.step_runs
                else list(job.step_runs.values())
            )
            if step is not None and step not in job.step_runs:
                return Outcome(False, "UNKNOWN_STEP", f"job {job_id!r} has no step {step!r}")
            running = [item for item in targets if item.state == StepState.RUNNING]
            if not running:
                return Outcome(
                    False,
                    "SUSPEND_NOT_RUNNING",
                    "no running step to suspend; queue-level pause is already available",
                )
            unsupported = [
                item
                for item in running
                if not self.provider_capabilities(item.provider or "").suspend
            ]
            if unsupported:
                item = unsupported[0]
                self._emit(
                    job,
                    "step.suspend-refused",
                    item,
                    {
                        "code": "SUSPEND_UNSUPPORTED",
                        "provider": item.provider,
                        "alternative": "cancel and requeue",
                    },
                )
                return Outcome(
                    False,
                    "SUSPEND_UNSUPPORTED",
                    f"provider {item.provider!r} cannot checkpoint a running step; "
                    "use cancel() or preempt(), which restart the step",
                    {
                        "provider": item.provider,
                        "affectedSteps": [entry.step.name for entry in unsupported],
                        "alternative": "preempt",
                    },
                )
            for item in running:
                item.suspended = True
                self._emit(job, "step.suspended", item)
            return Outcome(True, "SUSPENDED", "running steps suspended")

    def resume_suspended(self, job_id: str, step: str | None = None) -> Outcome:
        with self._condition:
            job = self._job(job_id)
            targets = (
                [job.step_runs[step]]
                if step is not None and step in job.step_runs
                else list(job.step_runs.values())
            )
            suspended = [item for item in targets if item.suspended]
            if not suspended:
                return Outcome(False, "NOT_SUSPENDED", "no suspended step to resume")
            item = suspended[0]
            if not self.provider_capabilities(item.provider or "").suspend:
                return Outcome(
                    False,
                    "RESUME_UNSUPPORTED",
                    f"provider {item.provider!r} cannot resume a suspended step",
                    {"provider": item.provider},
                )
            for entry in suspended:
                entry.suspended = False
                self._emit(job, "step.resumed", entry)
            return Outcome(True, "RESUMED", "suspended steps resumed")

    def preempt(
        self,
        job_id: str,
        *,
        by_job_id: str | None = None,
        reason: str = "higher priority work",
    ) -> Outcome:
        """Evict and requeue running work. Never a silent restart.

        The policy exists so two jobs cannot evict each other forever. Every
        refusal is typed, and the target is promoted to non-preemptible once
        its budget is spent.
        """

        now = time.monotonic()
        with self._condition:
            target = self._job(job_id)
            if target.is_terminal:
                return Outcome(False, "PREEMPTION_TARGET_TERMINAL", "target job already settled")
            if not target.preemptible:
                return self._refuse_preemption(
                    target, "PREEMPTION_PROMOTED", "target job is no longer preemptible"
                )
            if target.evictions >= self._policy.max_evictions_per_job:
                target.preemptible = False
                self._emit(target, "job.promoted", data={"reason": "eviction budget spent"})
                return self._refuse_preemption(
                    target,
                    "PREEMPTION_BUDGET",
                    "target job reached its eviction budget and is now non-preemptible",
                )
            if (
                target.last_eviction_at is not None
                and now - target.last_eviction_at < self._policy.cooldown_seconds
            ):
                return self._refuse_preemption(
                    target, "PREEMPTION_COOLDOWN", "target job was evicted too recently"
                )
            self._prune_eviction_log(now)
            if len(self._eviction_log) >= self._policy.max_evictions_per_window:
                return self._refuse_preemption(
                    target, "PREEMPTION_THROTTLED", "too many evictions in the current window"
                )
            preemptor: Job | None = None
            if by_job_id is not None:
                preemptor = self._job(by_job_id)
                if preemptor.is_terminal:
                    return self._refuse_preemption(
                        target, "PREEMPTION_BY_SETTLED", "requesting job already settled"
                    )
                if target.priority <= preemptor.priority:
                    return self._refuse_preemption(
                        target,
                        "PREEMPTION_NOT_HIGHER",
                        "only a strictly higher priority may evict; equal priority never does",
                    )
                if target.id in preemptor.evicted_by and not self._policy.allow_reciprocal:
                    return self._refuse_preemption(
                        target,
                        "PREEMPTION_RECIPROCAL",
                        "this would be tit-for-tat: the target already evicted the requester",
                        {"byJob": preemptor.id},
                    )
            running = [
                item for item in target.step_runs.values() if item.state == StepState.RUNNING
            ]
            if not running:
                return self._refuse_preemption(
                    target, "PREEMPTION_NOT_RUNNING", "target has no running step to evict"
                )
            for item in running:
                item.preemption = {
                    "reason": reason,
                    "byJob": preemptor.id if preemptor else None,
                }
                item.cancel_event.set()
            target.evictions += 1
            target.last_eviction_at = now
            if preemptor is not None:
                target.evicted_by.add(preemptor.id)
            self._eviction_log.append(now)
            if target.evictions >= self._policy.max_evictions_per_job:
                target.preemptible = False
                self._emit(target, "job.promoted", data={"reason": "eviction budget spent"})
            self._emit(
                target,
                "job.preemption-accepted",
                data={
                    "reason": reason,
                    "byJob": preemptor.id if preemptor else None,
                    "evictions": target.evictions,
                },
            )
            self._condition.notify_all()
            return Outcome(
                True,
                "PREEMPTED",
                f"{len(running)} running step(s) will be requeued",
                {
                    "byJob": preemptor.id if preemptor else None,
                    "steps": [item.step.name for item in running],
                    "evictions": target.evictions,
                },
            )

    def _refuse_preemption(
        self,
        job: Job,
        code: str,
        message: str,
        details: Mapping[str, Any] | None = None,
    ) -> Outcome:
        payload = {"code": code, "message": message}
        if details:
            payload.update(details)
        self._emit(job, "preemption.refused", data=payload)
        return Outcome(False, code, message, dict(details or {}))

    def _prune_eviction_log(self, now: float) -> None:
        cutoff = now - self._policy.window_seconds
        while self._eviction_log and self._eviction_log[0] < cutoff:
            self._eviction_log.popleft()

    # -- regeneration locks -----------------------------------------------

    def lock(
        self,
        asset_id: str,
        *,
        reason: str,
        by: str = "user",
        standing: float | None = None,
    ) -> LockRecord:
        """Lock an asset against regeneration. Idempotent; the first reason wins."""

        with self._lock_mutex:
            existing = self._locks.get(asset_id)
            if existing is not None:
                return existing
            record = LockRecord(
                asset_id=asset_id,
                reason=reason,
                locked_by=by,
                locked_at=time.time(),
                standing=standing,
            )
            self._locks[asset_id] = record
        self._emit_asset("asset.locked", asset_id, {
            "reason": reason,
            "lockedBy": by,
            "standing": standing,
        })
        return record

    def unlock(self, asset_id: str, *, by: str, reason: str) -> Outcome:
        """Release a lock. Automation must not call this; a person must."""

        with self._lock_mutex:
            record = self._locks.pop(asset_id, None)
        if record is None:
            return Outcome(False, "ASSET_NOT_LOCKED", f"asset {asset_id!r} is not locked")
        self._emit_asset("asset.unlocked", asset_id, {
            "reason": reason,
            "unlockedBy": by,
            "lockedBy": record.locked_by,
            "lockReason": record.reason,
        })
        return Outcome(True, "UNLOCKED", f"asset {asset_id!r} unlocked", {
            "reason": reason,
            "by": by,
        })

    def lock_state(self, asset_id: str) -> LockRecord | None:
        with self._lock_mutex:
            return self._locks.get(asset_id)

    def locks(self) -> tuple[LockRecord, ...]:
        with self._lock_mutex:
            return tuple(sorted(self._locks.values(), key=lambda record: record.asset_id))

    def can_regenerate(self, asset_id: str) -> Outcome:
        """Answer before asking, the same way capabilities() does for suspend."""

        record = self.lock_state(asset_id)
        if record is None:
            return Outcome(True, "REGENERATION_ALLOWED", f"asset {asset_id!r} is not locked")
        return Outcome(
            False,
            "ASSET_LOCKED",
            f"asset {asset_id!r} is locked: {record.reason}",
            {"assetId": asset_id, "reason": record.reason, "lockedBy": record.locked_by},
        )

    def _refuse_if_locked(self, asset_id: str) -> None:
        record = self.lock_state(asset_id)
        if record is None:
            return
        self._emit_asset("regeneration.refused", asset_id, {
            "code": "ASSET_LOCKED",
            "reason": record.reason,
            "lockedBy": record.locked_by,
        })
        raise RegenerationRefused(
            "ASSET_LOCKED",
            f"asset {asset_id!r} is locked: {record.reason}. "
            "Unlock it to regenerate.",
            asset_id=asset_id,
            details={"reason": record.reason, "lockedBy": record.locked_by},
        )

    def _emit_asset(self, event_type: str, asset_id: str, data: Mapping[str, Any]) -> None:
        payload = {"assetId": asset_id, **data}
        event = {
            "specversion": "1.0",
            "id": uuid.uuid4().hex,
            "source": "spritequest.asset-jobs",
            "type": f"io.spritequest.asset.{event_type}",
            "subject": asset_id,
            "time": datetime.now(timezone.utc).isoformat(),
            "data": payload,
        }
        self._events.append(event)
        sink = self._event_sink
        if sink is not None:
            try:
                sink(event)
            except Exception:
                pass

    def cancel(self, job_id: str) -> Job:
        with self._condition:
            job = self._job(job_id)
            if job.is_terminal:
                return job
            job.cancel_event.set()
            for step_run in job.step_runs.values():
                step_run.cancel_event.set()
                if step_run.state in {StepState.PENDING, StepState.READY}:
                    step_run.state = StepState.CANCELLED
                    step_run.finished_at = time.time()
                    step_run.error = "cancelled before start"
                    self._emit(job, "step.cancelled", step_run, {"reason": "before start"})
            if any(sr.state == StepState.RUNNING for sr in job.step_runs.values()):
                job.state = JobState.CANCELLING
                self._emit(job, "job.cancelling")
            else:
                job.state = JobState.CANCELLED
                job.finished_at = time.time()
                self._emit(job, "job.cancelled")
            self._finalize_job_locked(job)
            self._condition.notify_all()
            terminal = job.is_terminal
        if terminal:
            self._write_manifest(job)
        return job

    def wait(self, job_id: str, timeout: float | None = None) -> Job:
        deadline = None if timeout is None else time.monotonic() + timeout
        with self._condition:
            job = self._job(job_id)
            while not job.is_terminal:
                remaining = None if deadline is None else deadline - time.monotonic()
                if remaining is not None and remaining <= 0:
                    raise TimeoutError(f"job {job_id!r} did not settle within {timeout}s")
                self._condition.wait(remaining if remaining is not None else 0.1)
            settled = job.is_terminal
        if settled:
            self._write_manifest(job)
        return job

    def wait_for_event(
        self,
        event_type: str,
        *,
        job_id: str | None = None,
        step: str | None = None,
        timeout: float = 5.0,
    ) -> dict[str, Any]:
        expected = event_type if event_type.startswith("io.spritequest.") else f"io.spritequest.asset.{event_type}"
        deadline = time.monotonic() + timeout
        with self._condition:
            while True:
                for event in self._events:
                    if event.get("type") != expected:
                        continue
                    data = event.get("data", {})
                    if job_id is not None and data.get("jobId") != job_id:
                        continue
                    if step is not None and data.get("step") != step:
                        continue
                    return event
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise TimeoutError(f"event {event_type!r} did not arrive within {timeout}s")
                self._condition.wait(min(remaining, 0.05))

    def job(self, job_id: str) -> Job:
        with self._condition:
            return self._job(job_id)

    def events(self) -> list[dict[str, Any]]:
        with self._condition:
            return list(self._events)

    # -- execution ---------------------------------------------------------

    def run_until_idle(self) -> None:
        """Run until every submitted job settles, without a background thread."""

        while True:
            with self._condition:
                self._start_ready_locked()
                if not self._futures:
                    if self._all_terminal_locked() or self._any_paused_locked():
                        self._write_pending_manifests()
                        return
                    if not self._any_pending_work_locked():
                        self._write_pending_manifests()
                        return
                    self._fail_deadlocked_locked()
                    self._write_pending_manifests()
                    return
                self._condition.wait(0.05)

    def _run_loop(self) -> None:
        while not self._stop.is_set():
            with self._condition:
                self._start_ready_locked()
                if not self._futures:
                    if self._all_terminal_locked() or self._any_paused_locked():
                        self._condition.wait(0.05)
                    elif not self._any_pending_work_locked():
                        self._condition.wait(0.05)
                    else:
                        self._fail_deadlocked_locked()
                else:
                    self._condition.wait(0.02)
            self._write_pending_manifests()

    def _start_ready_locked(self) -> int:
        submitted = 0
        jobs = sorted(
            self._jobs.values(),
            key=lambda item: (item.priority, item.created_at, item.id),
        )
        for job in jobs:
            if job.is_terminal or job.pause_event.is_set() or job.cancel_event.is_set():
                continue
            if job.state == JobState.QUEUED:
                job.state = JobState.RUNNING
                job.started_at = time.time()
                self._emit(job, "job.started")
            for step_run in job.step_runs.values():
                if step_run.state != StepState.PENDING:
                    continue
                if not all(
                    job.step_runs[dependency].state == StepState.COMPLETED
                    for dependency in step_run.step.dependencies
                ):
                    continue
                reservation = self._reserve(step_run.step.host_requirements)
                if reservation is None:
                    continue
                provider = self._provider_id(step_run.step)
                step_run.cancel_event.clear()
                step_run.state = StepState.RUNNING
                step_run.attempt += 1
                step_run.started_at = time.time()
                step_run.provider = provider
                step_run.reservation = reservation
                self._emit(job, "step.started", step_run, {"attempt": step_run.attempt})
                future = self._ensure_executor().submit(
                    self._execute_step, job, step_run, reservation
                )
                self._futures[future] = (job.id, step_run.step.name)
                future.add_done_callback(self._future_done)
                submitted += 1
        return submitted

    def _reserve(self, requirements: HostRequirements) -> Reservation | None:
        for pool in self._pools:
            reservation = pool.try_reserve(requirements, self._swap_groups)
            if reservation is not None:
                return reservation
        return None

    def _provider_id(self, step: Step) -> str:
        command = step.script.command
        if command.startswith("provider:"):
            return command.split(":", 1)[1]
        return command

    def _execute_step(
        self, job: Job, step_run: StepRun, reservation: Reservation
    ) -> None:
        try:
            result = self._run_provider(job, step_run)
        finally:
            reservation.release()
            step_run.reservation = None
        with self._condition:
            step_run.finished_at = time.time()
            preemption = step_run.preemption
            if preemption is not None:
                step_run.preemption = None
                step_run.artifacts.clear()
                step_run.state = StepState.PENDING
                step_run.started_at = None
                step_run.error = None
                self._emit(
                    job,
                    "step.preempted",
                    step_run,
                    {
                        "reason": preemption.get("reason", "preempted"),
                        "byJob": preemption.get("byJob"),
                        "evictions": job.evictions,
                    },
                )
            elif job.cancel_event.is_set() or result.cancelled:
                step_run.state = StepState.CANCELLED
                step_run.error = result.error or "cancelled"
                self._emit(job, "step.cancelled", step_run, {"reason": step_run.error})
            elif result.ok:
                step_run.state = StepState.COMPLETED
                step_run.artifacts.extend(result.artifacts)
                self._emit(
                    job,
                    "step.completed",
                    step_run,
                    {"artifacts": [artifact.id for artifact in result.artifacts]},
                )
            else:
                step_run.error = result.error or "provider failed"
                lock = self.lock_state(job.asset_id) if job.asset_id else None
                if lock is not None and step_run.attempt <= step_run.step.retry:
                    step_run.state = StepState.FAILED
                    step_run.error = f"ASSET_LOCKED: {lock.reason}"
                    self._emit(
                        job,
                        "step.retry-refused",
                        step_run,
                        {"code": "ASSET_LOCKED", "assetId": job.asset_id, "reason": lock.reason},
                    )
                elif step_run.attempt <= step_run.step.retry:
                    step_run.state = StepState.PENDING
                    step_run.started_at = None
                    self._emit(
                        job,
                        "step.retrying",
                        step_run,
                        {"attempt": step_run.attempt, "error": step_run.error},
                    )
                else:
                    step_run.state = StepState.FAILED
                    self._emit(job, "step.failed", step_run, {"error": step_run.error})
            self._finalize_job_locked(job)
            self._condition.notify_all()
            terminal = job.is_terminal
        if terminal:
            self._write_manifest(job)

    def _run_provider(self, job: Job, step_run: StepRun) -> ProviderResult:
        step = step_run.step
        try:
            provider = resolve_provider(step.script.command, self._providers)
            parameters = {
                name: substitute(value, job.parameters) if isinstance(value, str) else value
                for name, value in job.parameters.items()
            }
            args = tuple(substitute(arg, job.parameters) for arg in step.script.args)
            request = ProviderRequest(
                job_id=job.id,
                step=step,
                command=step.script.command,
                args=args,
                parameters=parameters,
                cancel_event=step_run.cancel_event,
                output_dir=job.output_dir / "artifacts" / step.name,
            )
            return provider.run(request)
        except ProviderError as exc:
            return ProviderResult(ok=False, error=str(exc))
        except Exception as exc:  # a broken adapter is a failed step, not a crash
            return ProviderResult(ok=False, error=f"provider crashed: {exc}")

    def _future_done(self, future: Future[Any]) -> None:
        with self._condition:
            self._futures.pop(future, None)
            self._condition.notify_all()

    def _finalize_job_locked(self, job: Job) -> None:
        if job.is_terminal:
            return
        states = [step_run.state for step_run in job.step_runs.values()]
        if job.cancel_event.is_set() and not any(
            state in {StepState.RUNNING, StepState.PENDING} for state in states
        ):
            job.state = JobState.CANCELLED
            job.finished_at = time.time()
            self._emit(job, "job.cancelled")
            return
        if any(state == StepState.FAILED for state in states):
            job.state = JobState.FAILED
            job.finished_at = time.time()
            self._emit(job, "job.failed")
            return
        if all(state == StepState.COMPLETED for state in states):
            job.state = JobState.COMPLETED
            job.finished_at = time.time()
            self._emit(job, "job.completed")
            self._maybe_auto_lock(job)
            return
        if job.pause_event.is_set():
            job.state = JobState.PAUSED
        elif any(state == StepState.RUNNING for state in states):
            job.state = JobState.RUNNING
        else:
            job.state = JobState.RUNNING if job.started_at else JobState.QUEUED

    # -- diagnostics -------------------------------------------------------

    def _all_terminal_locked(self) -> bool:
        return all(job.is_terminal for job in self._jobs.values())

    def _any_paused_locked(self) -> bool:
        return any(
            job.state == JobState.PAUSED and not job.is_terminal
            for job in self._jobs.values()
        )

    def _any_pending_work_locked(self) -> bool:
        return any(
            not job.is_terminal
            and any(
                step_run.state in {StepState.PENDING, StepState.READY, StepState.RUNNING}
                for step_run in job.step_runs.values()
            )
            for job in self._jobs.values()
        )

    def _fail_deadlocked_locked(self) -> None:
        for job in self._jobs.values():
            if job.is_terminal or job.pause_event.is_set() or job.cancel_event.is_set():
                continue
            running = any(
                step_run.state == StepState.RUNNING
                for step_run in job.step_runs.values()
            )
            if running:
                continue
            blocked = [
                step_run
                for step_run in job.step_runs.values()
                if step_run.state == StepState.PENDING
                and all(
                    job.step_runs[dependency].state == StepState.COMPLETED
                    for dependency in step_run.step.dependencies
                )
            ]
            for step_run in blocked:
                step_run.state = StepState.FAILED
                step_run.finished_at = time.time()
                step_run.error = (
                    "no eligible resource pool for requirements "
                    f"{sorted(step_run.step.host_requirements.amount_map())}"
                )
                self._emit(job, "step.failed", step_run, {"error": step_run.error})
            if blocked:
                job.state = JobState.FAILED
                job.finished_at = time.time()
                self._emit(job, "job.failed", data={"reason": "no eligible resource pool"})
        self._condition.notify_all()

    def _job(self, job_id: str) -> Job:
        job = self._jobs.get(job_id)
        if job is None:
            raise KeyError(f"unknown job {job_id!r}")
        return job

    def _emit(
        self,
        job: Job,
        event_type: str,
        step_run: StepRun | None = None,
        data: Mapping[str, Any] | None = None,
    ) -> None:
        payload = {
            "jobId": job.id,
            "priority": int(job.priority),
            "state": job.state.value,
        }
        if step_run is not None:
            payload["step"] = step_run.step.name
            payload["stepState"] = step_run.state.value
        if data:
            payload.update(data)
        event = {
            "specversion": "1.0",
            "id": uuid.uuid4().hex,
            "source": "spritequest.asset-jobs",
            "type": f"io.spritequest.asset.{event_type}",
            "subject": job.id,
            "time": datetime.now(timezone.utc).isoformat(),
            "data": payload,
        }
        self._events.append(event)
        sink = self._event_sink
        if sink is not None:
            try:
                sink(event)
            except Exception:
                # An observer must not be able to fail a job.
                pass

    def _maybe_auto_lock(self, job: Job) -> None:
        """Standing promotes an asset to locked. Only a person may undo it."""

        threshold = self._regeneration.auto_lock_standing
        if threshold is None or job.asset_id is None or job.standing is None:
            return
        if job.standing < threshold:
            return
        self.lock(
            job.asset_id,
            reason=f"standing {job.standing:g} >= {threshold:g}",
            by="policy",
            standing=job.standing,
        )

    def _write_pending_manifests(self) -> None:
        with self._condition:
            pending = [
                job
                for job in self._jobs.values()
                if job.is_terminal and job.manifest_path is None
            ]
        for job in pending:
            self._write_manifest(job)

    def _write_manifest(self, job: Job) -> None:
        # Settlement can be observed by the worker, the run loop, wait(), and
        # stop() at once. One writer wins; the others see the finished file.
        with self._manifest_lock:
            if job.manifest_path is not None and job.manifest_path.exists():
                return
            try:
                job.manifest_path = write_manifest(
                    job, scheduler_version=self._scheduler_version
                )
            except Exception:
                # Manifest writing is observable evidence; a failure is surfaced
                # by the missing file and must not rewrite the job result.
                job.manifest_path = None


__all__ = [
    "Job",
    "JobState",
    "Outcome",
    "PreemptionPolicy",
    "Priority",
    "Scheduler",
    "StepRun",
    "StepState",
]