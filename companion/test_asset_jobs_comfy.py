#!/usr/bin/env python3
"""ComfyUI provider tests with an in-memory transport.

No server, no GPU, no network. The fake implements the ComfyUI endpoints the
provider actually uses, so the transport contract is pinned:

    POST /prompt
    GET  /history/{prompt_id}
    GET  /view?filename=...
    GET  /queue
    POST /queue {"delete": [...]}
    POST /interrupt
"""

from __future__ import annotations

import json
import sys
import tempfile
import threading
import unittest
import urllib.parse
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from companion.asset_jobs.comfy import (  # noqa: E402
    ComfyUIProvider,
    parse_args,
    artifact_kind_for,
)
from companion.asset_jobs.model import Step, StepScript  # noqa: E402
from companion.asset_jobs.providers import ProviderRequest  # noqa: E402


class FakeComfy:
    """A tiny ComfyUI state machine over the provider's transport protocol."""

    def __init__(
        self,
        *,
        outputs: dict | None = None,
        status_str: str = "success",
        complete_after: int = 1,
        queue_status: int = 200,
        running: bool = False,
        pending: bool = False,
        node_errors: dict | None = None,
        files: dict | None = None,
        view_status: int = 200,
        history_status: int = 200,
        submit_status: int = 200,
        appear_in_history: bool = True,
    ) -> None:
        self.outputs = outputs if outputs is not None else {
            "9": {"images": [{"filename": "crate_00001_.png", "subfolder": "", "type": "output"}]}
        }
        self.status_str = status_str
        self.complete_after = complete_after
        self.queue_status = queue_status
        self.running = running
        self.pending = pending
        self.node_errors = node_errors
        self.files = files if files is not None else {"crate_00001_.png": b"\x89PNG\r\n\x1a\nfake"}
        self.view_status = view_status
        self.history_status = history_status
        self.submit_status = submit_status
        self.appear_in_history = appear_in_history
        self.calls: list[tuple[str, str]] = []
        self.submitted: dict | None = None
        self.prompt_id = "prompt-abc"
        self.polls = 0
        self.deleted: list[str] = []
        self.interrupted = 0

    def request(self, method: str, path: str, *, body: bytes | None = None, timeout: float = 60.0):
        self.calls.append((method, path))
        if method == "POST" and path == "/prompt":
            payload = json.loads(body or b"{}")
            self.submitted = payload
            if self.submit_status != 200:
                return self.submit_status, b'{"error": "bad prompt"}'
            response = {"prompt_id": self.prompt_id, "number": 1}
            if self.node_errors:
                response["node_errors"] = self.node_errors
            return 200, json.dumps(response).encode()
        if method == "GET" and path.startswith("/history/"):
            self.polls += 1
            if self.history_status != 200:
                return self.history_status, b"{}"
            if not self.appear_in_history or self.polls < self.complete_after:
                return 200, b"{}"
            entry = {
                "outputs": self.outputs,
                "status": {"status_str": self.status_str, "completed": self.status_str == "success"},
            }
            return 200, json.dumps({self.prompt_id: entry}).encode()
        if method == "GET" and path.startswith("/view?"):
            query = urllib.parse.parse_qs(path.split("?", 1)[1])
            filename = (query.get("filename") or [""])[0]
            if self.view_status != 200:
                return self.view_status, b"missing"
            return 200, self.files.get(filename, b"")
        if method == "GET" and path == "/queue":
            return self.queue_status, json.dumps(
                {
                    "queue_running": [[1, self.prompt_id, {}, {}, []]] if self.running else [],
                    "queue_pending": [[2, self.prompt_id, {}, {}, []]] if self.pending else [],
                }
            ).encode()
        if method == "POST" and path == "/queue":
            self.deleted.extend(json.loads(body or b"{}").get("delete", []))
            return 200, b"{}"
        if method == "POST" and path == "/interrupt":
            self.interrupted += 1
            return 200, b"{}"
        return 404, b"{}"


def make_request(
    tmp: Path,
    args: list[str],
    *,
    timeout: float = 5.0,
    cancel: threading.Event | None = None,
) -> ProviderRequest:
    step = Step(
        name="sprite",
        dependencies=(),
        host_requirements=__import__(
            "companion.asset_jobs.model", fromlist=["HostRequirements"]
        ).HostRequirements(),
        script=StepScript("provider:comfy", tuple(args)),
        timeout_seconds=timeout,
    )
    return ProviderRequest(
        job_id="job-1",
        step=step,
        command="provider:comfy",
        args=tuple(args),
        parameters={},
        cancel_event=cancel or threading.Event(),
        output_dir=tmp / "artifacts" / "sprite",
    )


GRAPH = REPO_ROOT / "workflows" / "comfyui" / "r6_ship_crate_standard.json"


class ArgumentTests(unittest.TestCase):
    def test_graph_file_and_typed_overrides(self):
        args = parse_args(
            [
                "--graph",
                str(GRAPH),
                "--set",
                "4.inputs.text=a crate",
                "--set",
                "7.inputs.seed=42",
                "--set",
                "2.inputs.device=cpu",
            ]
        )
        self.assertEqual(args.graph["4"]["inputs"]["text"], "a crate")
        self.assertEqual(args.graph["7"]["inputs"]["seed"], 42)
        self.assertEqual(args.graph["2"]["inputs"]["device"], "cpu")
        self.assertEqual(args.graph_label, str(GRAPH))

    def test_unknown_node_is_rejected(self):
        with self.assertRaises(Exception):
            parse_args(["--graph", str(GRAPH), "--set", "99.inputs.text=x"])

    def test_unknown_input_is_rejected(self):
        with self.assertRaises(Exception):
            parse_args(["--graph", str(GRAPH), "--set", "7.inputs.nope=x"])

    def test_missing_graph_is_rejected(self):
        with self.assertRaises(Exception):
            parse_args(["--set", "7.inputs.seed=1"])

    def test_missing_graph_file_is_rejected(self):
        with self.assertRaises(Exception):
            parse_args(["--graph", "workflows/comfyui/does-not-exist.json"])

    def test_scalar_typing_preserves_strings_and_json(self):
        args = parse_args(
            [
                "--graph",
                str(GRAPH),
                "--set",
                "7.inputs.steps=20",
                "--set",
                "7.inputs.cfg=4.5",
                "--set",
                "4.inputs.text=plain text",
            ]
        )
        self.assertEqual(args.graph["7"]["inputs"]["steps"], 20)
        self.assertEqual(args.graph["7"]["inputs"]["cfg"], 4.5)
        self.assertEqual(args.graph["4"]["inputs"]["text"], "plain text")

    def test_unknown_argument_is_rejected(self):
        with self.assertRaises(Exception):
            parse_args(["--graph", str(GRAPH), "--nope"])

    def test_media_and_kind_helpers(self):
        self.assertEqual(artifact_kind_for("x.glb"), "mesh")
        self.assertEqual(artifact_kind_for("x.png"), "image")
        self.assertEqual(artifact_kind_for("x.txt"), "file")


class ProviderTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix="comfy-provider-")
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)

    def provider(self, fake: FakeComfy) -> ComfyUIProvider:
        return ComfyUIProvider(server="http://fake", transport=fake, http_timeout=1.0)

    def test_successful_run_saves_artifacts(self):
        fake = FakeComfy()
        request = make_request(
            self.root,
            ["--graph", str(GRAPH), "--set", "4.inputs.text=hello", "--set", "7.inputs.seed=7"],
        )
        result = self.provider(fake).run(request)
        self.assertTrue(result.ok, result.error)
        self.assertEqual(len(result.artifacts), 1)
        artifact = result.artifacts[0]
        self.assertEqual(artifact.kind, "image")
        self.assertEqual(artifact.media_type, "image/png")
        self.assertEqual(artifact.path.read_bytes(), fake.files["crate_00001_.png"])
        self.assertEqual(len(artifact.sha256), 64)
        self.assertEqual(result.metadata["promptId"], "prompt-abc")
        self.assertEqual(result.metadata["nodeCount"], len(json.loads(GRAPH.read_text())))

    def test_parameter_overrides_reach_the_prompt(self):
        fake = FakeComfy()
        request = make_request(
            self.root,
            ["--graph", str(GRAPH), "--set", "4.inputs.text=the crate", "--set", "7.inputs.seed=99"],
        )
        result = self.provider(fake).run(request)
        self.assertTrue(result.ok, result.error)
        submitted = fake.submitted["prompt"]
        self.assertEqual(submitted["4"]["inputs"]["text"], "the crate")
        self.assertEqual(submitted["7"]["inputs"]["seed"], 99)

    def test_cpu_encoder_override_is_submitted(self):
        fake = FakeComfy()
        request = make_request(
            self.root,
            ["--graph", str(GRAPH), "--set", "2.inputs.device=cpu"],
        )
        self.assertTrue(self.provider(fake).run(request).ok)
        self.assertEqual(fake.submitted["prompt"]["2"]["inputs"]["device"], "cpu")

    def test_node_errors_fail_the_step(self):
        fake = FakeComfy(node_errors={"4": {"errors": ["bad text"]}})
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("node errors", result.error)

    def test_queue_rejection_fails_the_step(self):
        fake = FakeComfy(submit_status=400)
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("rejected", result.error)

    def test_execution_error_fails_the_step(self):
        fake = FakeComfy(status_str="error")
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("errored", result.error)

    def test_history_failure_fails_the_step(self):
        fake = FakeComfy(history_status=500)
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("history failed", result.error)

    def test_view_failure_fails_the_step(self):
        fake = FakeComfy(view_status=404)
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("could not serve", result.error)

    def test_no_saved_output_fails_the_step(self):
        fake = FakeComfy(outputs={"9": {"text": ["no files here"]}})
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertFalse(result.ok)
        self.assertIn("no saved files", result.error)

    def test_non_image_output_is_a_mesh_artifact(self):
        fake = FakeComfy(
            outputs={"12": {"gltf": [{"filename": "tower.glb", "subfolder": "", "type": "output"}]}},
            files={"tower.glb": b"glTF\x02\x00\x00\x00"},
        )
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertTrue(result.ok, result.error)
        self.assertEqual(result.artifacts[0].kind, "mesh")
        self.assertEqual(result.artifacts[0].media_type, "model/gltf-binary")

    def test_duplicate_output_descriptors_are_fetched_once(self):
        fake = FakeComfy(
            outputs={
                "9": {"images": [{"filename": "a.png", "subfolder": "", "type": "output"}]},
                "10": {"images": [{"filename": "a.png", "subfolder": "", "type": "output"}]},
            }
        )
        result = self.provider(fake).run(make_request(self.root, ["--graph", str(GRAPH)]))
        self.assertTrue(result.ok, result.error)
        self.assertEqual(len(result.artifacts), 1)
        views = [path for method, path in fake.calls if path.startswith("/view?")]
        self.assertEqual(len(views), 1)

    def test_timeout_cancels_the_prompt(self):
        fake = FakeComfy(complete_after=10**6, running=True)
        result = self.provider(fake).run(
            make_request(self.root, ["--graph", str(GRAPH)], timeout=0.1)
        )
        self.assertFalse(result.ok)
        self.assertIn("did not finish", result.error)
        self.assertEqual(fake.interrupted, 1)

    def test_cancel_event_stops_polling_and_deletes_pending(self):
        cancel = threading.Event()
        fake = FakeComfy(complete_after=10**6, pending=True)
        provider = self.provider(fake)

        def stop_soon():
            cancel.set()

        threading.Timer(0.05, stop_soon).start()
        result = provider.run(
            make_request(self.root, ["--graph", str(GRAPH)], timeout=5.0, cancel=cancel)
        )
        self.assertTrue(result.cancelled)
        self.assertEqual(fake.deleted, ["prompt-abc"])
        self.assertEqual(fake.interrupted, 0)

    def test_cancel_event_interrupts_running_prompt(self):
        cancel = threading.Event()
        fake = FakeComfy(complete_after=10**6, running=True)
        provider = self.provider(fake)
        threading.Timer(0.05, cancel.set).start()
        result = provider.run(
            make_request(self.root, ["--graph", str(GRAPH)], timeout=5.0, cancel=cancel)
        )
        self.assertTrue(result.cancelled)
        self.assertEqual(fake.interrupted, 1)

    def test_queue_probe_failure_does_not_mask_cancellation(self):
        cancel = threading.Event()
        fake = FakeComfy(queue_status=500, complete_after=10**6)
        provider = self.provider(fake)
        threading.Timer(0.05, cancel.set).start()
        result = provider.run(
            make_request(self.root, ["--graph", str(GRAPH)], timeout=5.0, cancel=cancel)
        )
        self.assertTrue(result.cancelled)

    def test_scheduler_integration_runs_a_comfy_job(self):
        from companion.asset_jobs import ResourcePool, Scheduler, load_job_template

        fake = FakeComfy()
        template = load_job_template(
            REPO_ROOT / "companion" / "asset_jobs" / "templates" / "comfy-sprite.job.json"
        )
        scheduler = Scheduler(
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
            providers={"comfy": self.provider(fake)},
            output_dir=self.root / "jobs",
        )
        self.addCleanup(scheduler.stop)
        job = scheduler.submit(template, {"Brief": "a crate", "Seed": 5})
        scheduler.run_until_idle()
        self.assertEqual(job.state.value, "completed", job.step("sprite").error)
        self.assertEqual(fake.submitted["prompt"]["4"]["inputs"]["text"], "a crate")
        self.assertEqual(fake.submitted["prompt"]["7"]["inputs"]["seed"], 5)
        manifest = json.loads(job.manifest_path.read_text())
        self.assertEqual(manifest["steps"][0]["provider"], "comfy")
        self.assertEqual(manifest["artifacts"][0]["mediaType"], "image/png")


if __name__ == "__main__":
    unittest.main()
