"""Artifact manifests for a finished asset job.

The shape is intentionally close to a PROV/RO-Crate bundle: a job is an
activity, each step is a sub-activity, each artifact is an entity with a
content hash, and provenance names the provider and the inputs that produced it.
"""

from __future__ import annotations

import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from .scheduler import Job

SCHEDULER_NAME = "spritequest-asset-jobs"
SCHEDULER_VERSION = "0.1"


def _iso(timestamp: float | None) -> str | None:
    if timestamp is None:
        return None
    return datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()


def _relative(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def build_manifest(job: "Job", *, scheduler_version: str = SCHEDULER_VERSION) -> dict[str, Any]:
    steps: list[dict[str, Any]] = []
    artifacts: list[dict[str, Any]] = []
    for step_run in job.step_runs.values():
        step = step_run.step
        steps.append(
            {
                "name": step.name,
                "state": step_run.state.value,
                "dependencies": list(step.dependencies),
                "attempts": step_run.attempt,
                "startedAt": _iso(step_run.started_at),
                "finishedAt": _iso(step_run.finished_at),
                "error": step_run.error,
                "provider": step_run.provider,
                "requirements": {
                    "amounts": [
                        {"name": amount.name, "min": amount.min}
                        for amount in step.host_requirements.amounts
                    ],
                    "attributes": [
                        {"name": attribute.name, "anyOf": list(attribute.any_of)}
                        for attribute in step.host_requirements.attributes
                    ],
                },
                "artifacts": [artifact.id for artifact in step_run.artifacts],
            }
        )
        for artifact in step_run.artifacts:
            artifacts.append(
                {
                    "id": artifact.id,
                    "step": step.name,
                    "kind": artifact.kind,
                    "path": _relative(artifact.path, job.output_dir),
                    "sha256": artifact.sha256,
                    "bytes": artifact.bytes,
                    "mediaType": artifact.media_type,
                    "provenance": artifact.provenance,
                }
            )
    providers = sorted(
        {step_run.provider for step_run in job.step_runs.values() if step_run.provider}
    )
    return {
        "schemaVersion": 1,
        "jobId": job.id,
        "template": {
            "name": job.template.name,
            "specificationVersion": job.template.specification_version,
            "sha256": job.template_hash,
            "source": str(job.template.source_path) if job.template.source_path else None,
        },
        "parameters": dict(job.parameters),
        "priority": int(job.priority),
        "state": job.state.value,
        "createdAt": _iso(job.created_at),
        "startedAt": _iso(job.started_at),
        "finishedAt": _iso(job.finished_at),
        "steps": steps,
        "artifacts": artifacts,
        "providers": providers,
        "scheduler": {"name": SCHEDULER_NAME, "version": scheduler_version},
    }


def write_manifest(job: "Job", *, scheduler_version: str = SCHEDULER_VERSION) -> Path:
    job.output_dir.mkdir(parents=True, exist_ok=True)
    target = job.output_dir / "manifest.json"
    handle, temporary_name = tempfile.mkstemp(
        prefix="manifest-", suffix=".json.tmp", dir=job.output_dir
    )
    os.close(handle)
    temporary = Path(temporary_name)
    temporary.write_text(
        json.dumps(build_manifest(job, scheduler_version=scheduler_version), indent=2, sort_keys=True)
        + "\n",
        encoding="utf-8",
    )
    temporary.replace(target)
    return target


__all__ = ["SCHEDULER_NAME", "SCHEDULER_VERSION", "build_manifest", "write_manifest"]