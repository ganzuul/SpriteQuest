#!/usr/bin/env python3
"""Run an OpenJD-subset asset job against a real ComfyUI server.

    python3 -m companion.asset_jobs.run \
        --template companion/asset_jobs/templates/comfy-sprite.job.json \
        --comfy http://127.0.0.1:8188 \
        --param Brief="a ruined watchtower" --param Seed=7

The mock pools match the template's host requirements. Nothing is published:
the job writes its artifacts and manifest under --output and exits.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .comfy import ComfyUIProvider
from .model import TemplateError, load_job_template
from .resources import ResourcePool
from .scheduler import Priority, Scheduler

DEFAULT_TEMPLATE = Path(__file__).resolve().parent / "templates" / "comfy-sprite.job.json"


def _param(text: str) -> tuple[str, str]:
    name, separator, value = text.partition("=")
    if not separator or not name:
        raise argparse.ArgumentTypeError("expected NAME=VALUE")
    return name, value


def _typed(value: str):
    try:
        return json.loads(value)
    except ValueError:
        return value


def build_pools() -> list[ResourcePool]:
    """The single-workstation layout the templates assume."""

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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--template", type=Path, default=DEFAULT_TEMPLATE)
    parser.add_argument(
        "--comfy",
        default="http://127.0.0.1:8188",
        help="ComfyUI base URL (the checkpoint that fronts it, if any)",
    )
    parser.add_argument("--output", type=Path, default=Path("renders/asset-jobs"))
    parser.add_argument("--param", action="append", type=_param, default=[])
    parser.add_argument(
        "--priority",
        choices=["critical", "normal", "background"],
        default="normal",
    )
    parser.add_argument("--timeout", type=float, default=120.0, help="seconds to wait")
    args = parser.parse_args(argv)

    try:
        template = load_job_template(args.template)
    except TemplateError as exc:
        print(f"template error: {exc}", file=sys.stderr)
        return 2

    priority = {
        "critical": Priority.CRITICAL,
        "normal": Priority.NORMAL,
        "background": Priority.BACKGROUND,
    }[args.priority]
    scheduler = Scheduler(
        pools=build_pools(),
        providers={"comfy": ComfyUIProvider(server=args.comfy)},
        output_dir=args.output,
    )
    parameters = {name: _typed(value) for name, value in args.param}
    job = scheduler.submit(template, parameters, priority=priority)
    print(f"submitted {job.id} ({args.priority}) -> {job.output_dir}")
    scheduler.start()
    try:
        scheduler.wait(job.id, timeout=args.timeout)
    except TimeoutError:
        scheduler.cancel(job.id)
        scheduler.stop()
        print(f"timed out; cancelled {job.id}", file=sys.stderr)
        return 1
    finally:
        scheduler.stop()

    print(f"state: {job.state.value}")
    for step in job.step_runs.values():
        detail = f" error={step.error}" if step.error else ""
        print(f"  {step.step.name}: {step.state.value}{detail}")
    for artifact in job.artifacts:
        print(f"  artifact {artifact.kind}: {artifact.path} sha256={artifact.sha256[:12]}")
    if job.manifest_path:
        print(f"  manifest: {job.manifest_path}")
    return 0 if job.state.value == "completed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
