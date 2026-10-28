"""Provider boundary for the asset-job spike.

A provider runs one step. The scheduler never knows whether that means a local
ComfyUI graph, a llama-swap completion, a CPU encoder, or a remote API. The
mock providers here make the scheduler testable without a GPU.
"""

from __future__ import annotations

import hashlib
import json
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable, Mapping, Protocol

from .model import Step


class ProviderError(RuntimeError):
    """The step cannot be routed or the provider failed."""


@dataclass(frozen=True)
class ProviderCapabilities:
    """What a provider can actually do.

    ``suspend`` is false for every provider in this spike: ComfyUI and
    llama-swap have no general checkpoint API, so a suspension would have to
    pretend. Declaring it is what lets the scheduler refuse honestly instead of
    silently cancelling and calling that a pause.
    """

    suspend: bool = False
    preemptible: bool = True
    streaming: bool = False


@dataclass(frozen=True)
class Artifact:
    id: str
    kind: str
    path: Path
    sha256: str
    bytes: int
    media_type: str
    provenance: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class ProviderRequest:
    job_id: str
    step: Step
    command: str
    args: tuple[str, ...]
    parameters: Mapping[str, Any]
    cancel_event: threading.Event
    output_dir: Path


@dataclass(frozen=True)
class ProviderResult:
    ok: bool
    artifacts: tuple[Artifact, ...] = ()
    error: str | None = None
    cancelled: bool = False
    metadata: dict[str, Any] = field(default_factory=dict)
    #: Asset identifiers the step needs and could not find. A non-empty tuple
    #: means "unresolved", never "failed": the difference is evidence.
    missing: tuple[str, ...] = ()


class Provider(Protocol):
    id: str

    def run(self, request: ProviderRequest) -> ProviderResult: ...


class MockProvider:
    """A deterministic provider that writes a JSON artifact after a delay."""

    def __init__(
        self,
        provider_id: str,
        *,
        kind: str,
        delay: float = 0.05,
        media_type: str = "application/json",
        extension: str = ".json",
        artifact_kind: str = "data",
        content: Callable[[ProviderRequest], Any] | None = None,
        capabilities: ProviderCapabilities | None = None,
    ) -> None:
        self.id = provider_id
        self.capabilities = capabilities or ProviderCapabilities()
        self.kind = kind
        self.delay = max(0.0, float(delay))
        self.media_type = media_type
        self.extension = extension
        self.artifact_kind = artifact_kind
        self._content = content or self._default_content

    def run(self, request: ProviderRequest) -> ProviderResult:
        started = time.monotonic()
        deadline = started + request.step.timeout_seconds
        while True:
            if request.cancel_event.is_set():
                return ProviderResult(ok=False, cancelled=True, error="cancelled")
            now = time.monotonic()
            if now >= deadline:
                return ProviderResult(
                    ok=False,
                    error=f"step timed out after {request.step.timeout_seconds:.1f}s",
                    metadata={"provider": self.id, "kind": self.kind},
                )
            remaining = self.delay - (now - started)
            if remaining <= 0:
                break
            time.sleep(min(0.01, remaining, max(0.0, deadline - now)))

        if request.cancel_event.is_set():
            return ProviderResult(ok=False, cancelled=True, error="cancelled")

        try:
            payload = self._content(request)
        except Exception as exc:  # a provider failure is evidence, not a crash
            return ProviderResult(
                ok=False,
                error=f"provider {self.id} could not build content: {exc}",
                metadata={"provider": self.id, "kind": self.kind},
            )

        request.output_dir.mkdir(parents=True, exist_ok=True)
        path = request.output_dir / f"{request.step.name}{self.extension}"
        body = self._encode(payload)
        path.write_bytes(body)
        digest = hashlib.sha256(body).hexdigest()
        duration_ms = int((time.monotonic() - started) * 1000)
        artifact = Artifact(
            id=f"{request.job_id}/{request.step.name}",
            kind=self.artifact_kind,
            path=path,
            sha256=digest,
            bytes=len(body),
            media_type=self.media_type,
            provenance={
                "provider": self.id,
                "providerKind": self.kind,
                "jobId": request.job_id,
                "step": request.step.name,
                "command": request.command,
                "durationMs": duration_ms,
            },
        )
        return ProviderResult(
            ok=True,
            artifacts=(artifact,),
            metadata={"provider": self.id, "kind": self.kind, "durationMs": duration_ms},
        )

    def _default_content(self, request: ProviderRequest) -> Any:
        return {
            "jobId": request.job_id,
            "step": request.step.name,
            "provider": self.id,
            "providerKind": self.kind,
            "command": request.command,
            "args": list(request.args),
            "parameters": dict(request.parameters),
        }

    @staticmethod
    def _encode(payload: Any) -> bytes:
        if isinstance(payload, bytes):
            return payload
        if isinstance(payload, str):
            return payload.encode("utf-8")
        return json.dumps(payload, indent=2, sort_keys=True).encode("utf-8")


def resolve_provider(command: str, providers: Mapping[str, Provider]) -> Provider:
    """Resolve only the explicit ``provider:<id>`` command form.

    Shell execution is deliberately out of scope for the spike. It would give a
    job template ambient authority before the resource and cancellation model
    has been proven.
    """

    if not command.startswith("provider:"):
        raise ProviderError(
            f"unsupported command {command!r}; this subset runs only provider:<id>"
        )
    provider_id = command.split(":", 1)[1]
    provider = providers.get(provider_id)
    if provider is None:
        raise ProviderError(f"unknown provider {provider_id!r}")
    return provider


__all__ = [
    "Artifact",
    "MockProvider",
    "Provider",
    "ProviderCapabilities",
    "ProviderError",
    "ProviderRequest",
    "ProviderResult",
    "resolve_provider",
]