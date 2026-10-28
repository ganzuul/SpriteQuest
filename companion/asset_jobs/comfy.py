"""A ComfyUI provider for the asset-job scheduler.

The provider owns the ComfyUI transport, not the scheduler. It submits an
API-format workflow to ``POST /prompt``, polls ``/history/{id}``, fetches each
output through ``/view``, and cooperatively cancels through ``/queue`` and
``/interrupt``.

The HTTP transport is injectable so the contract is testable without a GPU or a
running server. Nothing here reaches for a global socket on import.

Step arguments (already parameter-substituted by the scheduler)::

    --graph workflows/comfyui/r6_ship_crate_standard.json
    --set 4.inputs.text={{Param.Brief}}     # JSON scalars are typed
    --set 7.inputs.seed={{Param.Seed}}
    --set 2.inputs.device=cpu               # the 9B encoder off the GPU
    --artifact-kind sprite                  # optional override

``--graph-json '<inline json>'`` is accepted for tests and small graphs.
"""

from __future__ import annotations

import hashlib
import json
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Mapping, Protocol, Sequence

from .providers import Artifact, ProviderError, ProviderRequest, ProviderResult

REPO_ROOT = Path(__file__).resolve().parents[2]

_MEDIA_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".stl": "model/stl",
    ".obj": "model/obj",
    ".json": "application/json",
    ".txt": "text/plain",
}
_MESH_SUFFIXES = {".glb", ".gltf", ".stl", ".obj"}
_IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def media_type_for(name: str) -> str:
    return _MEDIA_TYPES.get(Path(name).suffix.lower(), "application/octet-stream")


def artifact_kind_for(name: str) -> str:
    suffix = Path(name).suffix.lower()
    if suffix in _IMAGE_SUFFIXES:
        return "image"
    if suffix in _MESH_SUFFIXES:
        return "mesh"
    return "file"


# ---------------------------------------------------------------------------
# Transport
# ---------------------------------------------------------------------------


class ComfyTransport(Protocol):
    """Minimal HTTP boundary, injected so tests need no server."""

    def request(
        self,
        method: str,
        path: str,
        *,
        body: bytes | None = None,
        timeout: float = 60.0,
    ) -> tuple[int, bytes]:
        ...


class UrllibTransport:
    """Default transport. Returns ``(status, body)`` and never raises on 4xx/5xx."""

    def __init__(self, server: str) -> None:
        self.server = server.rstrip("/")

    def request(
        self,
        method: str,
        path: str,
        *,
        body: bytes | None = None,
        timeout: float = 60.0,
    ) -> tuple[int, bytes]:
        request = urllib.request.Request(
            self.server + path,
            data=body,
            method=method,
            headers={"Content-Type": "application/json"} if body is not None else {},
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as exc:  # a refusal is evidence
            with exc:
                return exc.code, exc.read()
        except (urllib.error.URLError, OSError) as exc:
            raise ProviderError(f"ComfyUI unreachable at {self.server}: {exc}") from exc


# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class ComfyArgs:
    graph: dict[str, Any]
    graph_label: str
    overrides: tuple[tuple[str, str, Any], ...] = ()
    artifact_kind: str | None = None
    poll_interval: float = 0.25


def parse_args(args: Sequence[str]) -> ComfyArgs:
    graph: dict[str, Any] | None = None
    graph_label = "inline"
    overrides: list[tuple[str, str, Any]] = []
    artifact_kind: str | None = None
    poll_interval = 0.25

    index = 0
    while index < len(args):
        token = args[index]
        if token in {"--graph", "--graph-json"}:
            index += 1
            if index >= len(args):
                raise ProviderError(f"{token} needs a value")
            value = args[index]
            if token == "--graph":
                path = Path(value)
                if not path.is_absolute():
                    candidate = Path.cwd() / path
                    path = candidate if candidate.is_file() else REPO_ROOT / path
                try:
                    graph = json.loads(path.read_text(encoding="utf-8"))
                except OSError as exc:
                    raise ProviderError(f"cannot read workflow {value}: {exc}") from exc
                except ValueError as exc:
                    raise ProviderError(f"workflow {value} is not valid JSON: {exc}") from exc
                graph_label = value
            else:
                try:
                    graph = json.loads(value)
                except ValueError as exc:
                    raise ProviderError(f"--graph-json is not valid JSON: {exc}") from exc
                graph_label = "inline"
        elif token == "--set":
            index += 1
            if index >= len(args):
                raise ProviderError("--set needs NODE.INPUT=VALUE")
            assignment = args[index]
            if "=" not in assignment:
                raise ProviderError(f"--set expects NODE.INPUT=VALUE, got {assignment!r}")
            target, _, raw = assignment.partition("=")
            node_id, _, input_name = target.partition(".")
            if not node_id or not input_name:
                raise ProviderError(f"--set target must be NODE.INPUT, got {target!r}")
            if input_name.startswith("inputs."):
                input_name = input_name[len("inputs.") :]
            overrides.append((node_id, input_name, _coerce(raw)))
        elif token == "--artifact-kind":
            index += 1
            if index >= len(args):
                raise ProviderError("--artifact-kind needs a value")
            artifact_kind = args[index]
        elif token == "--poll":
            index += 1
            if index >= len(args):
                raise ProviderError("--poll needs seconds")
            try:
                poll_interval = max(0.05, float(args[index]))
            except ValueError as exc:
                raise ProviderError(f"--poll expects a number, got {args[index]!r}") from exc
        else:
            raise ProviderError(f"unknown ComfyUI provider argument {token!r}")
        index += 1

    if graph is None:
        raise ProviderError("ComfyUI provider needs --graph or --graph-json")
    if not isinstance(graph, dict) or not graph:
        raise ProviderError("the workflow must be a non-empty API-format JSON object")
    for node_id, input_name, _ in overrides:
        node = graph.get(node_id)
        if not isinstance(node, dict):
            raise ProviderError(f"workflow has no node {node_id!r}")
        inputs = node.get("inputs")
        if not isinstance(inputs, dict):
            raise ProviderError(f"workflow node {node_id!r} has no inputs object")
        if input_name not in inputs:
            raise ProviderError(
                f"workflow node {node_id!r} has no input {input_name!r}"
            )
    for node_id, input_name, value in overrides:
        graph[node_id]["inputs"][input_name] = value
    return ComfyArgs(
        graph=graph,
        graph_label=graph_label,
        overrides=tuple(overrides),
        artifact_kind=artifact_kind,
        poll_interval=poll_interval,
    )


def _coerce(raw: str) -> Any:
    """JSON scalars keep their type; everything else stays a string."""

    stripped = raw.strip()
    if stripped == "":
        return ""
    try:
        value = json.loads(stripped)
    except ValueError:
        return raw
    if isinstance(value, (dict, list, int, float, bool)) or value is None:
        return value
    return raw


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------


@dataclass
class ComfyUIProvider:
    """Runs one workflow per step and returns its saved outputs as artifacts."""

    id: str = "comfy"
    server: str = "http://127.0.0.1:8188"
    transport: ComfyTransport | None = None
    http_timeout: float = 60.0
    client_id: str = field(default_factory=lambda: uuid.uuid4().hex)

    def __post_init__(self) -> None:
        if self.transport is None:
            self.transport = UrllibTransport(self.server)

    def run(self, request: ProviderRequest) -> ProviderResult:
        try:
            parsed = parse_args(request.args)
        except ProviderError as exc:
            return ProviderResult(ok=False, error=str(exc))

        prompt_id = uuid.uuid4().hex
        try:
            submitted = self._submit(parsed.graph, prompt_id)
        except ProviderError as exc:
            return ProviderResult(ok=False, error=str(exc))
        prompt_id = str(submitted.get("prompt_id") or prompt_id)

        outputs, failure = self._wait(prompt_id, request, parsed.poll_interval)
        if failure is not None:
            return failure
        try:
            artifacts = self._collect(outputs, request, parsed)
        except ProviderError as exc:
            return ProviderResult(ok=False, error=str(exc))

        graph_hash = hashlib.sha256(
            json.dumps(parsed.graph, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        metadata = {
            "provider": self.id,
            "server": self.server,
            "promptId": prompt_id,
            "graph": parsed.graph_label,
            "graphSha256": graph_hash,
            "nodeCount": len(parsed.graph),
            "outputNodes": sorted(outputs),
        }
        return ProviderResult(ok=True, artifacts=artifacts, metadata=metadata)

    # -- protocol ----------------------------------------------------------

    def _submit(self, graph: Mapping[str, Any], prompt_id: str) -> dict[str, Any]:
        body = json.dumps(
            {"prompt": graph, "client_id": self.client_id, "prompt_id": prompt_id}
        ).encode()
        status, payload = self._transport().request(
            "POST", "/prompt", body=body, timeout=self.http_timeout
        )
        if status != 200:
            raise ProviderError(
                f"ComfyUI rejected the prompt ({status}): {_snippet(payload)}"
            )
        try:
            decoded = json.loads(payload or b"{}")
        except ValueError as exc:
            raise ProviderError(f"ComfyUI returned unreadable JSON: {exc}") from exc
        if decoded.get("node_errors"):
            raise ProviderError(
                "ComfyUI node errors: "
                + json.dumps(decoded["node_errors"], sort_keys=True)[:500]
            )
        return decoded

    def _wait(
        self, prompt_id: str, request: ProviderRequest, poll_interval: float
    ) -> tuple[dict[str, Any], ProviderResult | None]:
        deadline = time.monotonic() + request.step.timeout_seconds
        while True:
            if request.cancel_event.is_set():
                self.cancel(prompt_id)
                return {}, ProviderResult(ok=False, cancelled=True, error="cancelled")
            status, payload = self._transport().request(
                "GET", f"/history/{prompt_id}", timeout=self.http_timeout
            )
            if status == 200:
                try:
                    history = json.loads(payload or b"{}")
                except ValueError as exc:
                    return {}, ProviderResult(ok=False, error=f"unreadable history: {exc}")
                entry = history.get(prompt_id)
                if entry:
                    status_info = entry.get("status") or {}
                    if status_info.get("status_str") == "error":
                        return {}, ProviderResult(
                            ok=False,
                            error="ComfyUI workflow errored: "
                            + json.dumps(status_info.get("messages", []), sort_keys=True)[:800],
                        )
                    if status_info.get("completed") is False:
                        return {}, ProviderResult(
                            ok=False, error="ComfyUI reported an incomplete workflow"
                        )
                    return entry.get("outputs") or {}, None
            elif status not in {404, 425}:
                return {}, ProviderResult(
                    ok=False, error=f"ComfyUI history failed ({status}): {_snippet(payload)}"
                )
            if time.monotonic() >= deadline:
                self.cancel(prompt_id)
                return {}, ProviderResult(
                    ok=False,
                    error=f"ComfyUI did not finish within {request.step.timeout_seconds:.1f}s",
                )
            time.sleep(poll_interval)

    def cancel(self, prompt_id: str) -> None:
        """Best-effort: remove a queued prompt, or interrupt it if it is running."""

        try:
            status, payload = self._transport().request(
                "GET", "/queue", timeout=min(self.http_timeout, 10.0)
            )
            running: set[str] = set()
            pending: set[str] = set()
            if status == 200:
                try:
                    queue = json.loads(payload or b"{}")
                except ValueError:
                    queue = {}
                running = {item[1] for item in queue.get("queue_running", []) if len(item) > 1}
                pending = {item[1] for item in queue.get("queue_pending", []) if len(item) > 1}
            if prompt_id in pending:
                self._transport().request(
                    "POST",
                    "/queue",
                    body=json.dumps({"delete": [prompt_id]}).encode(),
                    timeout=min(self.http_timeout, 10.0),
                )
                return
            if prompt_id in running:
                self._transport().request(
                    "POST", "/interrupt", body=b"{}", timeout=min(self.http_timeout, 10.0)
                )
        except ProviderError:
            return
        except OSError:
            return

    # -- outputs -----------------------------------------------------------

    def _collect(
        self, outputs: Mapping[str, Any], request: ProviderRequest, parsed: ComfyArgs
    ) -> tuple[Artifact, ...]:
        seen: set[tuple[str, str, str]] = set()
        artifacts: list[Artifact] = []
        directory = request.output_dir
        directory.mkdir(parents=True, exist_ok=True)
        for node_id in sorted(outputs):
            for entry in _file_entries(outputs[node_id]):
                key = (
                    str(entry.get("filename")),
                    str(entry.get("subfolder", "")),
                    str(entry.get("type", "output")),
                )
                if key in seen:
                    continue
                seen.add(key)
                artifacts.append(self._fetch_artifact(key, directory, node_id, parsed))
        if not artifacts:
            raise ProviderError(
                "the workflow produced no saved files; add a SaveImage, SaveGLB, "
                "or other save node"
            )
        return tuple(artifacts)

    def _fetch_artifact(
        self,
        key: tuple[str, str, str],
        directory: Path,
        node_id: str,
        parsed: ComfyArgs,
    ) -> Artifact:
        filename, subfolder, kind = key
        query = urllib.parse.urlencode(
            {"filename": filename, "subfolder": subfolder, "type": kind}
        )
        status, payload = self._transport().request(
            "GET", f"/view?{query}", timeout=max(self.http_timeout, 120.0)
        )
        if status != 200:
            raise ProviderError(
                f"ComfyUI could not serve {filename!r} ({status}): {_snippet(payload)}"
            )
        target = directory / Path(filename).name
        if target.exists():
            target = directory / f"{Path(filename).stem}-{node_id}{Path(filename).suffix}"
        target.write_bytes(payload)
        digest = hashlib.sha256(payload).hexdigest()
        return Artifact(
            id=filename,
            kind=parsed.artifact_kind or artifact_kind_for(filename),
            path=target,
            sha256=digest,
            bytes=len(payload),
            media_type=media_type_for(filename),
            provenance={
                "provider": self.id,
                "server": self.server,
                "node": node_id,
                "filename": filename,
                "subfolder": subfolder,
                "type": kind,
                "graph": parsed.graph_label,
            },
        )

    def _transport(self) -> ComfyTransport:
        if self.transport is None:  # pragma: no cover - __post_init__ sets it
            self.transport = UrllibTransport(self.server)
        return self.transport


def _file_entries(value: Any) -> list[Mapping[str, Any]]:
    """Find saved-file descriptors in a ComfyUI node output without assuming a node type."""

    entries: list[Mapping[str, Any]] = []
    if isinstance(value, Mapping):
        if isinstance(value.get("filename"), str):
            entries.append(value)
        else:
            for child in value.values():
                entries.extend(_file_entries(child))
    elif isinstance(value, list):
        for child in value:
            entries.extend(_file_entries(child))
    return entries


def _snippet(payload: bytes, limit: int = 300) -> str:
    try:
        text = payload.decode("utf-8", "replace")
    except Exception:  # pragma: no cover - decode with replace never raises
        return "<unreadable>"
    return text[:limit]


__all__ = [
    "ComfyArgs",
    "ComfyTransport",
    "ComfyUIProvider",
    "UrllibTransport",
    "artifact_kind_for",
    "media_type_for",
    "parse_args",
]