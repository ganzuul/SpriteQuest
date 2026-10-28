#!/usr/bin/env python3
"""Run the asset-job spike against deterministic mock providers.

    python3 -m companion.asset_jobs.demo
    python3 -m companion.asset_jobs.demo --output /tmp/spritequest-jobs

The demo submits a critical job and a background job, pauses the background
job, then cancels it. The critical job finishes on its own. No GPU, ComfyUI,
llama-swap, or remote API is called.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from .model import load_job_template
from .providers import MockProvider
from .resources import ResourcePool
from .scheduler import Priority, Scheduler

TEMPLATE = Path(__file__).resolve().parent / "templates" / "ruined-watchtower.job.json"


def build_demo_scheduler(output_dir: Path) -> Scheduler:
    pools = [
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
    providers = {
        "mock-comfy": MockProvider("mock-comfy", kind="comfyui", delay=0.12),
        "mock-cpu": MockProvider("mock-cpu", kind="cpu", delay=0.08),
        "mock-remote": MockProvider("mock-remote", kind="remote", delay=0.05),
    }
    return Scheduler(pools, providers, output_dir=output_dir, max_workers=8)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("renders/asset-jobs"),
        help="directory for job artifacts and manifests",
    )
    args = parser.parse_args(argv)

    template = load_job_template(TEMPLATE)
    scheduler = build_demo_scheduler(args.output)

    capabilities = scheduler.capabilities()
    print("capabilities:")
    print(f"  suspend: {capabilities['suspend']['supported']} ({capabilities['suspend']['reason']})")
    print(f"  preempt: {capabilities['preempt']['mode']}")
    print(f"  pause:   {capabilities['pause']['mode']}")
    print(f"  cancel:  {capabilities['cancel']['mode']}")

    critical = scheduler.submit(
        template,
        {"Brief": "A ruined watchtower on the border march.", "Seed": 42},
        priority=Priority.CRITICAL,
        job_id="ruined-watchtower-critical",
    )
    background = scheduler.submit(
        template,
        {"Brief": "A relic cairn in the same border march.", "Seed": 43},
        priority=Priority.BACKGROUND,
        job_id="relic-cairn-background",
    )
    print(f"\nsubmitted {critical.id} (critical) and {background.id} (background)")
    scheduler.start()
    try:
        scheduler.wait_for_event(
            "step.started", job_id=background.id, step="sprite", timeout=30.0
        )
        refused = scheduler.suspend(background.id, "sprite")
        print(f"suspend {background.id}: {refused.code} -- {refused.message}")
        moved = scheduler.preempt(
            background.id, by_job_id=critical.id, reason="critical scene asset"
        )
        print(f"preempt {background.id}: {moved.code} -- {moved.message}")
        equal = scheduler.preempt(critical.id, by_job_id=background.id)
        print(f"preempt back: {equal.code} -- {equal.message}")
        scheduler.wait(critical.id, timeout=60.0)
        scheduler.wait(background.id, timeout=60.0)
    finally:
        scheduler.stop()

    for job in (critical, background):
        print(
            f"\n{job.id}: {job.state.value}, evictions={job.evictions}, "
            f"artifacts={len(job.artifacts)}, manifest={job.manifest_path}"
        )
        for step_run in job.step_runs.values():
            print(f"  {step_run.step.name}: {step_run.state.value} attempt={step_run.attempt}")
    print("\nevents:")
    for event in scheduler.events():
        data = event.get("data", {})
        step = f" step={data.get('step')}" if data.get("step") else ""
        code = f" code={data.get('code')}" if data.get("code") else ""
        print(f"  {event['type']}{step}{code}")
    return 0 if critical.state.value == "completed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
