#!/usr/bin/env python3
"""Tests for the OpenJD-shaped asset job spike.

The providers are deterministic mocks. The tests pin the properties the game
needs before a real ComfyUI/llama-swap adapter is attached:

* dependency order and parallel readiness
* explicit GPU/CPU/remote pools
* exclusive swap groups
* priority ordering
* pause/resume and cooperative cancel
* artifact manifest with content hashes
"""

from __future__ import annotations

import json
import sys
import tempfile
import time
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.asset_jobs import (  # noqa: E402
    JobState,
    MockProvider,
    PreemptionPolicy,
    Priority,
    ProviderResult,
    RegenerationPolicy,
    RegenerationRefused,
    ResourcePool,
    Scheduler,
    StepState,
    TemplateError,
    load_job_template,
    parse_job_template,
    resolve_parameters,
)

TEMPLATE = REPO_ROOT / "companion" / "asset_jobs" / "templates" / "ruined-watchtower.job.json"


def default_pools() -> list[ResourcePool]:
    return [
        ResourcePool(
            "gpu-image",
            "local-gpu",
            amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
            attributes={
                "attr.worker.model": ("moss-image-sft",),
                "attr.worker.swap_group": ("image",),
            },
            swap_group="image",
        ),
        ResourcePool(
            "gpu-mesh",
            "local-gpu",
            amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
            attributes={
                "attr.worker.model": ("hunyuan3d",),
                "attr.worker.swap_group": ("mesh",),
            },
            swap_group="mesh",
        ),
        ResourcePool(
            "cpu-encode",
            "local-cpu",
            amounts={"amount.worker.vcpu": 16, "amount.worker.memory_gb": 64},
            attributes={"attr.worker.kind": ("cpu",)},
        ),
        ResourcePool(
            "remote-audio",
            "remote",
            attributes={"attr.worker.provider": ("remote-audio",)},
            capacity=2,
        ),
    ]


def default_providers(delay: float = 0.05) -> dict[str, MockProvider]:
    return {
        "mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=delay),
        "mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=delay),
        "mock-remote": MockProvider("mock-remote", kind="remote", delay=delay),
    }


def make_scheduler(root: Path, *, providers=None, pools=None, **kwargs) -> Scheduler:
    return Scheduler(
        pools if pools is not None else default_pools(),
        providers if providers is not None else default_providers(),
        output_dir=root / "jobs",
        **kwargs,
    )


def one_step_template(
    *,
    name: str = "one-step",
    step: str = "render",
    command: str = "provider:mock-comfy",
    group: str = "image",
    model: str = "moss-image-sft",
    kind: str | None = None,
    provider: str | None = None,
) -> object:
    amounts = []
    attributes = []
    if group:
        amounts.append({"name": "amount.worker.gpu", "min": 1})
        amounts.append({"name": "amount.worker.vram_gb", "min": 16})
        attributes.append({"name": "attr.worker.model", "anyOf": [model]})
        attributes.append({"name": "attr.worker.swap_group", "anyOf": [group]})
    if kind:
        amounts.append({"name": "amount.worker.vcpu", "min": 4})
        attributes.append({"name": "attr.worker.kind", "anyOf": [kind]})
    if provider:
        attributes.append({"name": "attr.worker.provider", "anyOf": [provider]})
    return parse_job_template(
        {
            "name": name,
            "specificationVersion": "jobtemplate-2023-09",
            "steps": [
                {
                    "name": step,
                    "dependencies": [],
                    "hostRequirements": {"amounts": amounts, "attributes": attributes},
                    "script": {
                        "actions": {
                            "onRun": {"command": command, "args": [step]}
                        }
                    },
                }
            ],
        }
    )


class TemplateTests(unittest.TestCase):
    def test_sample_template_parses(self):
        template = load_job_template(TEMPLATE)
        self.assertEqual(template.name, "ruined-watchtower")
        self.assertEqual([step.name for step in template.steps], ["sprite", "encode", "mesh", "audio"])
        self.assertEqual(template.step_map()["mesh"].dependencies, ("sprite",))
        self.assertEqual(len(template.sha256()), 64)

    def test_duplicate_step_rejected(self):
        with self.assertRaises(TemplateError):
            parse_job_template(
                {
                    "name": "dupe",
                    "specificationVersion": "jobtemplate-2023-09",
                    "steps": [
                        {"name": "a", "script": {"actions": {"onRun": {"command": "provider:x"}}}},
                        {"name": "a", "script": {"actions": {"onRun": {"command": "provider:x"}}}},
                    ],
                }
            )

    def test_cycle_rejected(self):
        with self.assertRaises(TemplateError):
            parse_job_template(
                {
                    "name": "cycle",
                    "specificationVersion": "jobtemplate-2023-09",
                    "steps": [
                        {
                            "name": "a",
                            "dependencies": ["b"],
                            "script": {"actions": {"onRun": {"command": "provider:x"}}},
                        },
                        {
                            "name": "b",
                            "dependencies": ["a"],
                            "script": {"actions": {"onRun": {"command": "provider:x"}}},
                        },
                    ],
                }
            )

    def test_unknown_dependency_rejected(self):
        with self.assertRaises(TemplateError):
            parse_job_template(
                {
                    "name": "missing",
                    "specificationVersion": "jobtemplate-2023-09",
                    "steps": [
                        {
                            "name": "a",
                            "dependencies": ["nope"],
                            "script": {"actions": {"onRun": {"command": "provider:x"}}},
                        }
                    ],
                }
            )

    def test_parameter_space_rejected(self):
        with self.assertRaises(TemplateError):
            parse_job_template(
                {
                    "name": "unsupported",
                    "specificationVersion": "jobtemplate-2023-09",
                    "steps": [
                        {
                            "name": "a",
                            "parameterSpace": {"taskParameterDefinitions": []},
                            "script": {"actions": {"onRun": {"command": "provider:x"}}},
                        }
                    ],
                }
            )

    def test_parameter_defaults_and_allowed_values(self):
        template = parse_job_template(
            {
                "name": "params",
                "specificationVersion": "jobtemplate-2023-09",
                "parameters": [
                    {"name": "Mode", "type": "STRING", "default": "fast", "allowedValues": ["fast", "slow"]}
                ],
                "steps": [
                    {
                        "name": "a",
                        "script": {"actions": {"onRun": {"command": "provider:x", "args": ["{{Param.Mode}}"]}}},
                    }
                ],
            }
        )
        self.assertEqual(resolve_parameters(template), {"Mode": "fast"})
        with self.assertRaises(TemplateError):
            resolve_parameters(template, {"Mode": "wrong"})


class SchedulerTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="asset-jobs-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.schedulers: list[Scheduler] = []

    def scheduler(self, **kwargs) -> Scheduler:
        scheduler = make_scheduler(self.root, **kwargs)
        self.schedulers.append(scheduler)
        self.addCleanup(scheduler.stop)
        return scheduler

    def test_sample_job_completes_with_manifest(self):
        scheduler = self.scheduler()
        job = scheduler.submit(load_job_template(TEMPLATE), {"Brief": "tower", "Seed": 7})
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        self.assertEqual(len(job.artifacts), 4)
        self.assertIsNotNone(job.manifest_path)
        manifest = json.loads(job.manifest_path.read_text())
        self.assertEqual(manifest["state"], "completed")
        self.assertEqual(len(manifest["artifacts"]), 4)
        self.assertEqual(manifest["template"]["name"], "ruined-watchtower")
        self.assertEqual(manifest["parameters"]["Seed"], 7)
        for artifact in manifest["artifacts"]:
            self.assertEqual(len(artifact["sha256"]), 64)
            self.assertTrue(artifact["path"].startswith("artifacts/"))

    def test_independent_steps_share_a_wall_clock_round(self):
        """Two waves of 80 ms, not four sequential steps: parallel work is real."""

        delay = 0.08
        scheduler = self.scheduler(
            providers={
                "mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=delay),
                "mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=delay),
                "mock-remote": MockProvider("mock-remote", kind="remote", delay=delay),
            }
        )
        job = scheduler.submit(load_job_template(TEMPLATE), {"Brief": "tower", "Seed": 1})
        scheduler.run_until_idle()
        wall = job.finished_at - job.created_at
        self.assertLess(wall, delay * 3, f"expected about two waves, took {wall:.3f}s")
        earliest_finish = min(step.finished_at for step in job.step_runs.values())
        for name in ("sprite", "encode", "audio"):
            self.assertLess(job.step(name).started_at, earliest_finish)

    def test_dependencies_and_parallel_steps(self):
        scheduler = self.scheduler()
        job = scheduler.submit(load_job_template(TEMPLATE), {"Brief": "tower", "Seed": 1})
        scheduler.run_until_idle()
        sprite = job.step("sprite")
        encode = job.step("encode")
        mesh = job.step("mesh")
        audio = job.step("audio")
        self.assertGreaterEqual(mesh.started_at, sprite.finished_at)
        self.assertLess(encode.started_at, sprite.finished_at)
        self.assertLess(audio.started_at, sprite.finished_at)
        self.assertEqual(encode.state, StepState.COMPLETED)
        self.assertEqual(audio.state, StepState.COMPLETED)

    def test_different_swap_groups_run_concurrently(self):
        """A critical job in another swap group must not wait for background work."""

        scheduler = self.scheduler(
            providers={
                "slow": MockProvider("slow", kind="comfyui", delay=0.5),
                "fast": MockProvider("fast", kind="comfyui", delay=0.1),
            },
            pools=[
                ResourcePool(
                    "gpu-image",
                    "local-gpu",
                    amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                    attributes={
                        "attr.worker.model": ("moss-image-sft",),
                        "attr.worker.swap_group": ("image",),
                    },
                    swap_group="image",
                ),
                ResourcePool(
                    "gpu-mesh",
                    "local-gpu",
                    amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                    attributes={
                        "attr.worker.model": ("hunyuan3d",),
                        "attr.worker.swap_group": ("mesh",),
                    },
                    swap_group="mesh",
                ),
            ],
        )

        def template(model: str, group: str, command: str):
            return parse_job_template(
                {
                    "name": f"{model}-job",
                    "specificationVersion": "jobtemplate-2023-09",
                    "steps": [
                        {
                            "name": "render",
                            "hostRequirements": {
                                "amounts": [{"name": "amount.worker.gpu", "min": 1}],
                                "attributes": [
                                    {"name": "attr.worker.model", "anyOf": [model]},
                                    {"name": "attr.worker.swap_group", "anyOf": [group]},
                                ],
                            },
                            "script": {"actions": {"onRun": {"command": command}}},
                        }
                    ],
                }
            )

        background = scheduler.submit(
            template("moss-image-sft", "image", "provider:slow"),
            priority=Priority.BACKGROUND,
            job_id="background",
        )
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="background", step="render", timeout=2.0)
        critical = scheduler.submit(
            template("hunyuan3d", "mesh", "provider:fast"),
            priority=Priority.CRITICAL,
            job_id="critical",
        )
        scheduler.wait("critical", timeout=3.0)
        self.assertLess(
            critical.step("render").started_at,
            background.step("render").finished_at or float("inf"),
            "critical work in another swap group must overlap the background job",
        )
        self.assertLess(critical.finished_at - critical.created_at, 0.4)
        scheduler.wait("background", timeout=3.0)
        self.assertEqual(background.state, JobState.COMPLETED)

    def test_swap_group_is_exclusive(self):
        provider = MockProvider("mock-comfy", kind="comfyui", delay=0.08)
        scheduler = self.scheduler(
            providers={"mock-comfy": provider},
            pools=[ResourcePool(
                "gpu-image",
                "local-gpu",
                amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                attributes={"attr.worker.model": ("moss-image-sft",), "attr.worker.swap_group": ("image",)},
                swap_group="image",
            )],
        )
        template = one_step_template()
        first = scheduler.submit(template, priority=Priority.NORMAL, job_id="first")
        second = scheduler.submit(template, priority=Priority.NORMAL, job_id="second")
        scheduler.run_until_idle()
        a = first.step("render")
        b = second.step("render")
        ordered = sorted([a, b], key=lambda step: step.started_at)
        self.assertLessEqual(ordered[0].finished_at, ordered[1].started_at)

    def test_priority_orders_queued_jobs(self):
        scheduler = self.scheduler(
            providers={"mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.05)},
            pools=[ResourcePool(
                "gpu-image",
                "local-gpu",
                amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                attributes={"attr.worker.model": ("moss-image-sft",), "attr.worker.swap_group": ("image",)},
                swap_group="image",
            )],
        )
        template = one_step_template()
        background = scheduler.submit(template, priority=Priority.BACKGROUND, job_id="background")
        critical = scheduler.submit(template, priority=Priority.CRITICAL, job_id="critical")
        scheduler.run_until_idle()
        self.assertLess(
            critical.step("render").started_at,
            background.step("render").started_at,
        )

    def test_cancel_before_start(self):
        scheduler = self.scheduler()
        job = scheduler.submit(load_job_template(TEMPLATE), {"Brief": "tower", "Seed": 1})
        scheduler.cancel(job.id)
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.CANCELLED)
        self.assertTrue(all(step.state == StepState.CANCELLED for step in job.step_runs.values()))
        self.assertFalse(any(event["type"].endswith("step.started") for event in scheduler.events()))

    def test_cancel_while_running(self):
        scheduler = self.scheduler(
            providers={
                "mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.5),
                "mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=0.05),
                "mock-remote": MockProvider("mock-remote", kind="remote", delay=0.05),
            }
        )
        job = scheduler.submit(load_job_template(TEMPLATE), {"Brief": "tower", "Seed": 1})
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id=job.id, step="sprite", timeout=2.0)
        scheduler.cancel(job.id)
        scheduler.wait(job.id, timeout=3.0)
        self.assertEqual(job.state, JobState.CANCELLED)
        self.assertEqual(job.step("mesh").state, StepState.CANCELLED)
        self.assertIsNone(job.step("mesh").started_at)

    def test_pause_and_resume(self):
        scheduler = self.scheduler(
            providers={
                "mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.12),
                "mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=0.12),
                "mock-remote": MockProvider("mock-remote", kind="remote", delay=0.12),
            }
        )
        template = parse_job_template(
            {
                "name": "pause",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "a",
                        "dependencies": [],
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 1}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:mock-cpu"}}},
                    },
                    {
                        "name": "b",
                        "dependencies": ["a"],
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 1}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:mock-cpu"}}},
                    },
                ],
            }
        )
        job = scheduler.submit(template)
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id=job.id, step="a", timeout=2.0)
        scheduler.pause(job.id)
        scheduler.wait_for_event("step.completed", job_id=job.id, step="a", timeout=2.0)
        time.sleep(0.15)
        self.assertEqual(job.step("b").state, StepState.PENDING)
        scheduler.resume(job.id)
        scheduler.wait(job.id, timeout=3.0)
        self.assertEqual(job.state, JobState.COMPLETED)

    def test_remote_pool_concurrency(self):
        provider = MockProvider("mock-remote", kind="remote", delay=0.08)
        scheduler = self.scheduler(
            providers={"mock-remote": provider},
            pools=[
                ResourcePool(
                    "remote-audio",
                    "remote",
                    attributes={"attr.worker.provider": ("remote-audio",)},
                    capacity=1,
                )
            ],
        )
        template = one_step_template(
            group="", kind=None, provider="remote-audio", command="provider:mock-remote"
        )
        first = scheduler.submit(template, job_id="first")
        second = scheduler.submit(template, job_id="second")
        scheduler.run_until_idle()
        a = first.step("render")
        b = second.step("render")
        ordered = sorted([a, b], key=lambda step: step.started_at)
        self.assertLessEqual(ordered[0].finished_at, ordered[1].started_at)

    # -- suspend/resume: declared unsupported ---------------------------------

    def test_capabilities_advertise_suspend_as_unsupported(self):
        scheduler = self.scheduler()
        report = scheduler.capabilities()
        self.assertFalse(report["suspend"]["supported"])
        self.assertIn("no provider declares checkpointing", report["suspend"]["reason"])
        self.assertEqual(report["suspend"]["alternative"], "cancel and requeue (preempt), restarting the step")
        self.assertTrue(report["pause"]["supported"])
        self.assertTrue(report["cancel"]["supported"])

    def test_suspend_refuses_with_a_typed_outcome(self):
        scheduler = self.scheduler(
            providers={"mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.4)},
        )
        job = scheduler.submit(one_step_template())
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id=job.id, step="render", timeout=2.0)
        outcome = scheduler.suspend(job.id)
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "SUSPEND_UNSUPPORTED")
        self.assertIn("cannot checkpoint", outcome.message)
        self.assertEqual(outcome.details["alternative"], "preempt")
        self.assertEqual(job.step("render").state, StepState.RUNNING)
        self.assertFalse(job.step("render").suspended)
        scheduler.cancel(job.id)
        scheduler.wait(job.id, timeout=3.0)

    def test_suspend_refusal_is_an_event(self):
        scheduler = self.scheduler(
            providers={"mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.3)},
        )
        job = scheduler.submit(one_step_template())
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id=job.id, step="render", timeout=2.0)
        scheduler.suspend(job.id)
        event = scheduler.wait_for_event(
            "step.suspend-refused", job_id=job.id, step="render", timeout=2.0
        )
        self.assertEqual(event["data"]["code"], "SUSPEND_UNSUPPORTED")
        self.assertEqual(event["data"]["provider"], "mock-comfy")
        scheduler.cancel(job.id)
        scheduler.wait(job.id, timeout=3.0)

    def test_suspend_before_running_says_not_running(self):
        scheduler = self.scheduler()
        job = scheduler.submit(one_step_template())
        outcome = scheduler.suspend(job.id)
        self.assertEqual(outcome.code, "SUSPEND_NOT_RUNNING")
        scheduler.run_until_idle()

    def test_resume_without_suspension_is_refused(self):
        scheduler = self.scheduler()
        job = scheduler.submit(one_step_template())
        outcome = scheduler.resume_suspended(job.id)
        self.assertEqual(outcome.code, "NOT_SUSPENDED")
        self.assertFalse(outcome.ok)
        scheduler.run_until_idle()

    # -- preemption: evict and requeue, with anti-livelock rules ---------------

    def slow_scheduler(self, delay: float = 0.3, policy: PreemptionPolicy | None = None) -> Scheduler:
        return self.scheduler(
            providers={"mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=delay)},
            preemption_policy=policy,
        )

    def test_preemption_requires_strictly_higher_priority(self):
        scheduler = self.slow_scheduler()
        target = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="target")
        rival = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="rival")
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="target", step="render", timeout=2.0)
        outcome = scheduler.preempt(target.id, by_job_id=rival.id)
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "PREEMPTION_NOT_HIGHER")
        self.assertEqual(target.evictions, 0)
        scheduler.cancel("target")
        scheduler.wait("target", timeout=3.0)
        scheduler.wait("rival", timeout=5.0)

    def test_preemption_evicts_and_requeues_the_step(self):
        scheduler = self.slow_scheduler(delay=0.3)
        target = scheduler.submit(
            one_step_template(), priority=Priority.BACKGROUND, job_id="background"
        )
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="background", step="render", timeout=2.0)
        critical = scheduler.submit(
            one_step_template(), priority=Priority.CRITICAL, job_id="critical"
        )
        outcome = scheduler.preempt(target.id, by_job_id=critical.id, reason="critical render")
        self.assertTrue(outcome.ok, outcome.message)
        self.assertEqual(outcome.code, "PREEMPTED")
        self.assertEqual(target.evictions, 1)
        scheduler.wait("background", timeout=10.0)
        scheduler.wait("critical", timeout=10.0)
        self.assertEqual(target.state, JobState.COMPLETED)
        self.assertEqual(critical.state, JobState.COMPLETED)
        self.assertGreaterEqual(target.step("render").attempt, 2)
        self.assertIsNotNone(target.manifest_path)
        self.assertIsNotNone(critical.manifest_path)
        types = [event["type"] for event in scheduler.events()]
        self.assertIn("io.spritequest.asset.step.preempted", types)
        self.assertIn("io.spritequest.asset.job.preemption-accepted", types)

    def test_preemption_evicts_every_running_step_of_a_job(self):
        """C13 on a job with concurrent work: all running steps requeue, not one."""

        scheduler = self.scheduler(
            providers={"mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=0.3)},
            pools=[
                ResourcePool(
                    "cpu",
                    "local-cpu",
                    amounts={"amount.worker.vcpu": 8},
                    attributes={"attr.worker.kind": ("cpu",)},
                    capacity=2,
                ),
                ResourcePool(
                    "gpu-image",
                    "local-gpu",
                    amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                    attributes={
                        "attr.worker.model": ("moss-image-sft",),
                        "attr.worker.swap_group": ("image",),
                    },
                    swap_group="image",
                ),
            ],
        )
        template = parse_job_template(
            {
                "name": "two-handed",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": name,
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 4}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:mock-cpu"}}},
                    }
                    for name in ("left", "right")
                ],
            }
        )
        target = scheduler.submit(template, priority=Priority.BACKGROUND, job_id="pair")
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="pair", step="left", timeout=2.0)
        scheduler.wait_for_event("step.started", job_id="pair", step="right", timeout=2.0)
        critical = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="critical")
        outcome = scheduler.preempt(target.id, by_job_id=critical.id, reason="critical")
        self.assertTrue(outcome.ok, outcome.message)
        self.assertEqual(sorted(outcome.details["steps"]), ["left", "right"])
        scheduler.wait("pair", timeout=20.0)
        scheduler.wait("critical", timeout=20.0)
        self.assertEqual(target.state, JobState.COMPLETED)
        self.assertEqual(target.step("left").attempt, 2)
        self.assertEqual(target.step("right").attempt, 2)
        preempted = [
            event["data"]["step"]
            for event in scheduler.events()
            if event["type"] == "io.spritequest.asset.step.preempted"
            and event["data"].get("byJob") == "critical"
        ]
        self.assertEqual(sorted(preempted), ["left", "right"])

    def test_eviction_budget_promotes_the_target(self):
        policy = PreemptionPolicy(max_evictions_per_job=1, cooldown_seconds=0.0)
        scheduler = self.slow_scheduler(delay=0.25, policy=policy)
        target = scheduler.submit(
            one_step_template(), priority=Priority.BACKGROUND, job_id="background"
        )
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="background", step="render", timeout=2.0)
        first = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="first")
        second = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="second")
        self.assertTrue(scheduler.preempt(target.id, by_job_id=first.id).ok)
        self.assertFalse(target.preemptible)
        outcome = scheduler.preempt(target.id, by_job_id=second.id)
        self.assertFalse(outcome.ok)
        self.assertIn(outcome.code, {"PREEMPTION_PROMOTED", "PREEMPTION_BUDGET"})
        scheduler.wait("background", timeout=10.0)
        self.assertEqual(target.state, JobState.COMPLETED)

    def test_cooldown_refuses_a_second_eviction(self):
        policy = PreemptionPolicy(max_evictions_per_job=5, cooldown_seconds=30.0)
        scheduler = self.slow_scheduler(delay=0.4, policy=policy)
        target = scheduler.submit(
            one_step_template(), priority=Priority.BACKGROUND, job_id="background"
        )
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="background", step="render", timeout=2.0)
        first = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="first")
        second = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="second")
        self.assertTrue(scheduler.preempt(target.id, by_job_id=first.id).ok)
        scheduler.wait_for_event("step.started", job_id="background", step="render", timeout=5.0)
        outcome = scheduler.preempt(target.id, by_job_id=second.id)
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "PREEMPTION_COOLDOWN")
        scheduler.wait("background", timeout=15.0)

    def test_reciprocal_eviction_is_refused(self):
        """Defence in depth: tit-for-tat is refused even if priorities are reassigned."""

        policy = PreemptionPolicy(max_evictions_per_job=5, cooldown_seconds=0.0)
        scheduler = self.slow_scheduler(delay=0.3, policy=policy)
        victim = scheduler.submit(
            one_step_template(), priority=Priority.NORMAL, job_id="victim"
        )
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="victim", step="render", timeout=2.0)
        rival = scheduler.submit(one_step_template(), priority=Priority.CRITICAL, job_id="rival")
        self.assertTrue(scheduler.preempt(victim.id, by_job_id=rival.id).ok)
        self.assertIn("rival", victim.evicted_by)
        # Simulate a planner raising the victim's priority above its evictor.
        with scheduler._condition:
            victim.priority = -1
        scheduler.wait_for_event("step.started", job_id="victim", step="render", timeout=10.0)
        outcome = scheduler.preempt(rival.id, by_job_id=victim.id)
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "PREEMPTION_RECIPROCAL")
        for job_id in ("victim", "rival"):
            scheduler.wait(job_id, timeout=20.0)

    def test_equal_priority_jobs_cannot_ping_pong(self):
        """The livelock case: two peers each trying to pause/evict the other."""

        scheduler = self.slow_scheduler(delay=0.25)
        left = scheduler.submit(one_step_template(), priority=Priority.NORMAL, job_id="left")
        right = scheduler.submit(one_step_template(), priority=Priority.NORMAL, job_id="right")
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="left", step="render", timeout=2.0)
        attempts = [
            scheduler.preempt(left.id, by_job_id=right.id),
            scheduler.preempt(right.id, by_job_id=left.id),
            scheduler.preempt(left.id, by_job_id=right.id),
        ]
        for outcome in attempts:
            self.assertFalse(outcome.ok)
            self.assertEqual(outcome.code, "PREEMPTION_NOT_HIGHER")
        self.assertEqual(left.evictions, 0)
        self.assertEqual(right.evictions, 0)
        scheduler.wait("left", timeout=10.0)
        scheduler.wait("right", timeout=10.0)
        self.assertEqual(left.state, JobState.COMPLETED)
        self.assertEqual(right.state, JobState.COMPLETED)
        self.assertEqual(left.step("render").attempt, 1)
        self.assertEqual(right.step("render").attempt, 1)

    def test_window_budget_throttles_eviction(self):
        policy = PreemptionPolicy(
            max_evictions_per_job=5,
            cooldown_seconds=0.0,
            max_evictions_per_window=1,
            window_seconds=300.0,
        )
        scheduler = self.slow_scheduler(delay=0.2, policy=policy)
        first = scheduler.submit(one_step_template(), priority=Priority.BACKGROUND, job_id="a")
        second = scheduler.submit(one_step_template(), priority=Priority.BACKGROUND, job_id="b")
        scheduler.start()
        scheduler.wait_for_event("step.started", job_id="a", step="render", timeout=2.0)
        self.assertTrue(scheduler.preempt("a").ok)
        scheduler.wait_for_event("step.started", job_id="b", step="render", timeout=20.0)
        outcome = scheduler.preempt("b")
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "PREEMPTION_THROTTLED")
        for job_id in ("a", "b"):
            scheduler.wait(job_id, timeout=20.0)

    def test_stop_writes_manifests_for_settled_jobs(self):
        scheduler = self.scheduler()
        job = scheduler.submit(one_step_template())
        scheduler.start()
        scheduler.wait(job.id, timeout=5.0)
        scheduler.stop()
        self.assertIsNotNone(job.manifest_path)
        self.assertTrue(job.manifest_path.exists())

    def test_preemption_of_a_settled_job_is_refused(self):
        scheduler = self.scheduler()
        job = scheduler.submit(one_step_template())
        scheduler.run_until_idle()
        outcome = scheduler.preempt(job.id)
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "PREEMPTION_TARGET_TERMINAL")

    # -- regeneration locks (C17-C21) -----------------------------------------

    def locked_scheduler(self, **kwargs) -> Scheduler:
        return self.scheduler(**kwargs)

    def test_locked_asset_refuses_submission(self):
        scheduler = self.locked_scheduler()
        scheduler.lock("ruined-watchtower", reason="approved by review", by="user")
        with self.assertRaises(RegenerationRefused) as caught:
            scheduler.submit(one_step_template(), asset_id="ruined-watchtower")
        self.assertEqual(caught.exception.code, "ASSET_LOCKED")
        self.assertIn("approved by review", str(caught.exception))
        self.assertEqual(scheduler.events()[-1]["data"]["code"], "ASSET_LOCKED")
        with self.assertRaises(KeyError):
            scheduler.job("does-not-exist")

    def test_unlocking_allows_submission(self):
        scheduler = self.locked_scheduler()
        scheduler.lock("tower", reason="standing", by="user")
        outcome = scheduler.unlock("tower", by="operator", reason="regenerate after fix")
        self.assertTrue(outcome.ok)
        self.assertEqual(outcome.code, "UNLOCKED")
        job = scheduler.submit(one_step_template(), asset_id="tower")
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        types = [event["type"] for event in scheduler.events()]
        self.assertIn("io.spritequest.asset.asset.unlocked", types)

    def test_unlock_refuses_an_unlocked_asset(self):
        scheduler = self.locked_scheduler()
        outcome = scheduler.unlock("tower", by="operator", reason="why not")
        self.assertFalse(outcome.ok)
        self.assertEqual(outcome.code, "ASSET_NOT_LOCKED")

    def test_lock_state_is_observable(self):
        scheduler = self.locked_scheduler()
        self.assertIsNone(scheduler.lock_state("tower"))
        self.assertTrue(scheduler.can_regenerate("tower").ok)
        record = scheduler.lock("tower", reason="standing 0.9", by="policy", standing=0.9)
        self.assertEqual(record.asset_id, "tower")
        self.assertEqual(len(scheduler.locks()), 1)
        state = scheduler.lock_state("tower")
        self.assertEqual(state.reason, "standing 0.9")
        self.assertEqual(state.locked_by, "policy")
        blocked = scheduler.can_regenerate("tower")
        self.assertFalse(blocked.ok)
        self.assertEqual(blocked.code, "ASSET_LOCKED")
        self.assertEqual(blocked.details["reason"], "standing 0.9")

    def test_locking_is_idempotent_and_keeps_the_first_reason(self):
        scheduler = self.locked_scheduler()
        scheduler.lock("tower", reason="first", by="user")
        scheduler.lock("tower", reason="second", by="policy")
        self.assertEqual(scheduler.lock_state("tower").reason, "first")
        self.assertEqual(len(scheduler.locks()), 1)

    def test_standing_auto_locks_after_completion(self):
        scheduler = self.locked_scheduler(
            regeneration_policy=RegenerationPolicy(auto_lock_standing=0.8)
        )
        job = scheduler.submit(
            one_step_template(), asset_id="tower", standing=0.9
        )
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        record = scheduler.lock_state("tower")
        self.assertIsNotNone(record)
        self.assertEqual(record.locked_by, "policy")
        self.assertIn("standing", record.reason)
        with self.assertRaises(RegenerationRefused):
            scheduler.submit(one_step_template(), asset_id="tower")

    def test_low_standing_does_not_lock(self):
        scheduler = self.locked_scheduler(
            regeneration_policy=RegenerationPolicy(auto_lock_standing=0.8)
        )
        job = scheduler.submit(one_step_template(), asset_id="tower", standing=0.2)
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        self.assertIsNone(scheduler.lock_state("tower"))

    def test_policy_never_releases_a_user_lock(self):
        scheduler = self.locked_scheduler(
            regeneration_policy=RegenerationPolicy(auto_lock_standing=0.8)
        )
        scheduler.lock("tower", reason="manual", by="user")
        scheduler.run_until_idle()
        self.assertIsNotNone(scheduler.lock_state("tower"))

    def test_automatic_retry_is_refused_while_locked(self):
        calls = {"count": 0}

        class FailingOnce:
            id = "flaky"

            def run(self, request):
                calls["count"] += 1
                return ProviderResult(ok=False, error="transient")

        template = parse_job_template(
            {
                "name": "retry-job",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "render",
                        "retry": 2,
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 1}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:flaky"}}},
                    }
                ],
            }
        )
        scheduler = self.scheduler(
            providers={"flaky": FailingOnce()},
            pools=[ResourcePool(
                "cpu",
                "local-cpu",
                amounts={"amount.worker.vcpu": 4},
                attributes={"attr.worker.kind": ("cpu",)},
            )],
        )
        job = scheduler.submit(template, asset_id="tower")
        # The lock lands while the job is queued: the first attempt runs, the
        # automatic retry must not.
        scheduler.lock("tower", reason="approved", by="user")
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.FAILED)
        step = job.step("render")
        self.assertEqual(step.state, StepState.FAILED)
        self.assertIn("ASSET_LOCKED", step.error)
        self.assertEqual(step.attempt, 1)
        self.assertEqual(calls["count"], 1)
        types = [event["type"] for event in scheduler.events()]
        self.assertIn("io.spritequest.asset.step.retry-refused", types)

    def test_automatic_retry_runs_when_unlocked(self):
        calls = {"count": 0}

        class FailsThenSucceeds:
            id = "flaky"

            def run(self, request):
                calls["count"] += 1
                if calls["count"] == 1:
                    return ProviderResult(ok=False, error="transient")
                return ProviderResult(ok=True, artifacts=())

        template = parse_job_template(
            {
                "name": "retry-job",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "render",
                        "retry": 1,
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 1}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:flaky"}}},
                    }
                ],
            }
        )
        scheduler = self.scheduler(
            providers={"flaky": FailsThenSucceeds()},
            pools=[ResourcePool(
                "cpu",
                "local-cpu",
                amounts={"amount.worker.vcpu": 4},
                attributes={"attr.worker.kind": ("cpu",)},
            )],
        )
        job = scheduler.submit(template, asset_id="tower")
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        self.assertEqual(job.step("render").attempt, 2)
        self.assertEqual(calls["count"], 2)

    def test_retry_is_not_an_eviction(self):
        """C21: attempt counts rise, evictions do not."""

        calls = {"count": 0}

        class FailsOnce:
            id = "flaky"

            def run(self, request):
                calls["count"] += 1
                if calls["count"] == 1:
                    return ProviderResult(ok=False, error="transient")
                return ProviderResult(ok=True, artifacts=())

        template = parse_job_template(
            {
                "name": "retry-job",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "render",
                        "retry": 1,
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.vcpu", "min": 1}],
                            "attributes": [{"name": "attr.worker.kind", "anyOf": ["cpu"]}],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:flaky"}}},
                    }
                ],
            }
        )
        scheduler = self.scheduler(
            providers={"flaky": FailsOnce()},
            pools=[ResourcePool(
                "cpu",
                "local-cpu",
                amounts={"amount.worker.vcpu": 4},
                attributes={"attr.worker.kind": ("cpu",)},
            )],
        )
        job = scheduler.submit(template, asset_id="tower")
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        self.assertEqual(job.evictions, 0)

    # -- missing inputs and pending assets (C22-C26) --------------------------

    def missing_scheduler(self, missing=("fragment/grounding-slate",), delay=0.01):
        class NeedsContent:
            id = "needs"

            def __init__(self):
                self.calls = 0

            def run(self, request):
                self.calls += 1
                if request.step.requires:
                    return ProviderResult(ok=False, error="declared but absent",
                                          missing=tuple(request.step.requires))
                return ProviderResult(ok=False, error="needs content", missing=tuple(missing))

        provider = NeedsContent()
        scheduler = self.scheduler(
            providers={"needs": provider},
            pools=[
                ResourcePool(
                    "gpu-image",
                    "local-gpu",
                    amounts={"amount.worker.gpu": 1, "amount.worker.vram_gb": 24},
                    attributes={
                        "attr.worker.model": ("moss-image-sft",),
                        "attr.worker.swap_group": ("image",),
                    },
                    swap_group="image",
                )
            ],
        )
        return scheduler, provider

    @staticmethod
    def missing_template(name="render", requires=(), dependencies=(), retry=0):
        return parse_job_template(
            {
                "name": f"{name}-job",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "render",
                        "dependencies": list(dependencies),
                        "requires": list(requires),
                        "retry": retry,
                        "hostRequirements": {
                            "amounts": [{"name": "amount.worker.gpu", "min": 1}],
                            "attributes": [
                                {"name": "attr.worker.model", "anyOf": ["moss-image-sft"]},
                                {"name": "attr.worker.swap_group", "anyOf": ["image"]},
                            ],
                        },
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    }
                ],
            }
        )

    def test_static_requirement_missing_is_unresolved_without_calling_the_provider(self):
        scheduler, provider = self.missing_scheduler()
        job = scheduler.submit(
            self.missing_template(requires=["fragment/grounding-slate"]),
            asset_id="prop/tower",
        )
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.UNRESOLVED)
        step = job.step("render")
        self.assertEqual(step.state, StepState.UNRESOLVED)
        self.assertEqual(step.missing, ("fragment/grounding-slate",))
        self.assertEqual(provider.calls, 0, "a declared requirement is checked before the work")
        self.assertEqual(step.attempt, 0)

    def test_registered_asset_satisfies_a_static_requirement(self):
        calls = {"count": 0}

        class Present:
            id = "needs"

            def run(self, request):
                calls["count"] += 1
                return ProviderResult(ok=True, artifacts=())

        template = parse_job_template(
            {
                "name": "satisfied",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "render",
                        "requires": ["fragment/grounding-slate"],
                        "hostRequirements": {"amounts": [], "attributes": []},
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    }
                ],
            }
        )
        scheduler = self.scheduler(providers={"needs": Present()})
        scheduler.register_asset("fragment/grounding-slate")
        job = scheduler.submit(template, asset_id="prop/tower")
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.COMPLETED)
        self.assertEqual(calls["count"], 1)
        self.assertEqual(job.step("render").missing, ())

    def test_runtime_missing_is_unresolved_and_never_retried(self):
        scheduler, provider = self.missing_scheduler()
        job = scheduler.submit(self.missing_template(retry=3))
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.UNRESOLVED)
        step = job.step("render")
        self.assertEqual(step.state, StepState.UNRESOLVED)
        self.assertEqual(step.missing, ("fragment/grounding-slate",))
        self.assertEqual(provider.calls, 1, "missing content is not a transient failure")
        self.assertNotIn(
            "io.spritequest.asset.step.retrying",
            [event["type"] for event in scheduler.events()],
        )

    def test_dependent_of_unresolved_is_unresolved_with_the_union(self):
        scheduler, _ = self.missing_scheduler()
        template = parse_job_template(
            {
                "name": "chain",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "first",
                        "requires": ["fragment/a"],
                        "hostRequirements": {"amounts": [], "attributes": []},
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    },
                    {
                        "name": "second",
                        "dependencies": ["first"],
                        "requires": ["fragment/b"],
                        "hostRequirements": {"amounts": [], "attributes": []},
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    },
                ],
            }
        )
        job = scheduler.submit(template, asset_id="prop/thing")
        scheduler.run_until_idle()
        first = job.step("first")
        second = job.step("second")
        self.assertEqual(first.state, StepState.UNRESOLVED)
        self.assertEqual(first.missing, ("fragment/a",))
        self.assertEqual(second.state, StepState.UNRESOLVED)
        self.assertEqual(second.missing, ("fragment/a",), "the dependent inherits the missing set")

    def test_dependent_of_failed_is_skipped_not_unresolved(self):
        class Broken:
            id = "needs"

            def run(self, request):
                return ProviderResult(ok=False, error="boom")

        template = parse_job_template(
            {
                "name": "chain",
                "specificationVersion": "jobtemplate-2023-09",
                "steps": [
                    {
                        "name": "first",
                        "hostRequirements": {"amounts": [], "attributes": []},
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    },
                    {
                        "name": "second",
                        "dependencies": ["first"],
                        "hostRequirements": {"amounts": [], "attributes": []},
                        "script": {"actions": {"onRun": {"command": "provider:needs"}}},
                    },
                ],
            }
        )
        scheduler = self.scheduler(providers={"needs": Broken()})
        job = scheduler.submit(template)
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.FAILED)
        self.assertEqual(job.step("first").state, StepState.FAILED)
        self.assertEqual(job.step("second").state, StepState.SKIPPED)
        self.assertEqual(job.step("second").missing, ())
        self.assertIn("dependency first failed", job.step("second").error)

    def test_pending_assets_are_collected_and_deduplicated(self):
        scheduler, _ = self.missing_scheduler()
        tower = scheduler.submit(self.missing_template(), asset_id="prop/tower")
        brazier = scheduler.submit(self.missing_template(), asset_id="prop/brazier")
        scheduler.run_until_idle()
        by_id = {asset.asset_id: asset for asset in scheduler.pending_assets()}
        node = by_id["fragment/grounding-slate"]
        self.assertEqual(node.demands, 2)
        self.assertEqual(
            sorted(node.demanders),
            sorted([f"{tower.id}/render", f"{brazier.id}/render"]),
        )
        # The producers are nodes too, so the chain is visible.
        self.assertEqual(set(by_id), {"fragment/grounding-slate", "prop/tower", "prop/brazier"})

    def test_pending_edges_are_learned_from_produced_assets(self):
        scheduler, _ = self.missing_scheduler()
        scheduler.submit(self.missing_template(), asset_id="prop/tower")
        scheduler.run_until_idle()
        by_id = {asset.asset_id: asset for asset in scheduler.pending_assets()}
        self.assertIn("prop/tower", by_id)
        self.assertEqual(by_id["prop/tower"].requires, ("fragment/grounding-slate",))
        self.assertEqual(by_id["prop/tower"].state, "waiting")
        self.assertEqual(by_id["prop/tower"].depth, 1)
        self.assertEqual(by_id["fragment/grounding-slate"].state, "root")
        self.assertEqual(by_id["fragment/grounding-slate"].depth, 0)
        self.assertEqual(
            [asset.asset_id for asset in scheduler.pending_roots()],
            ["fragment/grounding-slate"],
        )

    def test_pending_cycles_are_reported_not_walked(self):
        scheduler, _ = self.missing_scheduler()
        scheduler.submit(self.missing_template(requires=["prop/b"]), asset_id="prop/a")
        scheduler.submit(self.missing_template(requires=["prop/a"]), asset_id="prop/b")
        scheduler.run_until_idle()
        by_id = {asset.asset_id: asset for asset in scheduler.pending_assets()}
        self.assertEqual(by_id["prop/a"].state, "cycle")
        self.assertEqual(by_id["prop/b"].state, "cycle")
        self.assertIsNone(by_id["prop/a"].depth)
        self.assertEqual(scheduler.pending_roots(), ())

    def test_unresolved_manifest_records_missing_inputs(self):
        scheduler, _ = self.missing_scheduler()
        job = scheduler.submit(self.missing_template(requires=["fragment/a"]), asset_id="prop/t")
        scheduler.run_until_idle()
        manifest = json.loads(job.manifest_path.read_text())
        self.assertEqual(manifest["state"], "unresolved")
        self.assertEqual(manifest["steps"][0]["missing"], ["fragment/a"])

    def test_no_eligible_pool_fails_closed(self):
        scheduler = self.scheduler(
            providers={"mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.01)},
            pools=[
                ResourcePool(
                    "cpu",
                    "local-cpu",
                    amounts={"amount.worker.vcpu": 1},
                    attributes={"attr.worker.kind": ("cpu",)},
                )
            ],
        )
        template = one_step_template()  # requires the image GPU pool
        job = scheduler.submit(template)
        scheduler.run_until_idle()
        self.assertEqual(job.state, JobState.FAILED)
        self.assertEqual(job.step("render").state, StepState.FAILED)
        self.assertIn("no eligible resource pool", job.step("render").error)


if __name__ == "__main__":
    unittest.main()
