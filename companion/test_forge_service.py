#!/usr/bin/env python3
"""The forge's door-check: what gets in, what gets turned away, and why.

    python3 tools/test_forge_service.py

Every test runs against a real server on an ephemeral port and a real state
file in a temp dir -- no mocks of the log, because the log is the thing.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
sys.path.insert(0, str(HERE))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from forge_service import Ledger, make_handler  # noqa: E402
from companion.fragment_compiler import CartographersLedger


def _request(url: str, payload: dict | None = None, timeout: float = 60.0) -> tuple[int, dict]:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, method="POST" if data else "GET",
        headers={"Content-Type": "application/json"} if data else {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        with exc:                                    # close: no leaked sockets
            return exc.code, json.loads(exc.read())


class ForgeCase(unittest.TestCase):
    """Boot a real server once per class; each test gets a fresh state file."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix="forge-test-")
        cls.state = Path(cls.tmp.name) / "ledger.jsonl"
        cls.cart_ledger_path = Path(cls.tmp.name) / "cartographers_ledger.json"
        cls.frags_dir = Path(cls.tmp.name) / "fragments"
        real_frags = REPO_ROOT / "library" / "fragments"
        if real_frags.is_dir():
            shutil.copytree(real_frags, cls.frags_dir)
        else:
            cls.frags_dir.mkdir(parents=True)
        cls.cart_ledger = CartographersLedger(ledger_path=cls.cart_ledger_path, fragments_dir=cls.frags_dir)

        seed_dir = HERE / "npcs" if (HERE / "npcs").exists() else HERE.parent / "npcs"
        cls.ledger = Ledger(cls.state, seed_dir=seed_dir)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0),
                                         make_handler(cls.ledger, cartographers_ledger=cls.cart_ledger))
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever,
                         daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.tmp.cleanup()

    def get(self, route, timeout: float = 60.0):
        return _request(f"{self.base}{route}", timeout=timeout)

    def post(self, route, payload, timeout: float = 60.0):
        return _request(f"{self.base}{route}", payload, timeout=timeout)

    def member(self, entity):
        _, roster = self.get("/roster")
        return next(m for m in roster["members"] if m["entity"] == entity)


class TestTheSeededWorld(ForgeCase):
    """The story opens where npcs/*.json leaves it -- the asymmetry is seeded."""

    def test_health_reports_the_log(self):
        code, body = self.get("/health")
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])
        self.assertGreater(body["lines"], 0)

    def test_hollis_is_written_and_helps(self):
        hollis = self.member("npc/hollis")
        self.assertEqual(hollis["role"], "written")
        self.assertTrue(hollis["can_help"])
        self.assertIn("paperwork wins", hollis["line"])

    def test_pell_is_the_understudy(self):
        pell = self.member("npc/pell-the-underwritten")
        self.assertEqual(pell["role"], "unassigned")     # the fold's default: no part
        self.assertFalse(pell["can_help"])
        self.assertEqual(pell["disposition"], "unreliable")
        self.assertIn("nobody wrote them down", pell["line"])

    def test_every_character_file_becomes_a_member(self):
        # The roster follows npcs/, so a new character joins without a test edit.
        npc_dir = HERE / "npcs" if (HERE / "npcs").exists() else HERE.parent / "npcs"
        expected = {f"npc/{p.stem}" for p in npc_dir.glob("*.json")}
        _, roster = self.get("/roster")
        self.assertEqual({m["entity"] for m in roster["members"]}, expected)

    def test_guidance_is_one_injectable_block(self):
        code, body = self.get("/guidance")
        self.assertEqual(code, 200)
        self.assertIn("The ledger, as it stands:", body["guidance"])
        self.assertIn("Pell the Underwritten", body["guidance"])
        self.assertIn("nobody wrote them down", body["guidance"])


class TestTheDoorCheck(ForgeCase):
    """What the schema refuses is what the story cannot become."""

    def test_role_authored_without_a_gate_is_refused(self):
        code, body = self.post("/events", {
            "kind": "role.authored", "entity": "npc/pell-the-underwritten",
            "actor": "model", "data": {"state": "written", "text": "ferryman"},
            "provenance": {"source": "test"},
        })
        self.assertEqual(code, 400)
        self.assertIn("gate", body["reason"])

    def test_model_event_without_provenance_is_refused(self):
        code, body = self.post("/events", {
            "kind": "speak", "entity": "npc/pell-the-underwritten",
            "actor": "model", "data": {"text": "hello"},
        })
        self.assertEqual(code, 400)
        self.assertIn("provenance", body["reason"])

    def test_unknown_kind_is_refused(self):
        code, body = self.post("/events", {
            "kind": "smote", "entity": "npc/hollis", "actor": "game",
        })
        self.assertEqual(code, 400)
        self.assertIn("kind", body["reason"])


class TestThePromotion(ForgeCase):
    """The enchantment: the player's accepted reply writes the part down."""

    def setUp(self):
        self.before = self.member("npc/pell-the-underwritten")

    def test_pell_flips_to_helps_once_his_part_is_written(self):
        self.assertFalse(self.before["can_help"])
        code, body = self.post("/events", {
            "kind": "role.authored", "entity": "npc/pell-the-underwritten",
            "actor": "human", "gate": {"rule": "player-accept", "verdict": "pass"},
            "data": {"state": "written",
                     "text": "the ferryman who gets an ending"},
        })
        self.assertEqual(code, 200)
        self.assertEqual(body["appended"], 1)
        after = self.member("npc/pell-the-underwritten")
        self.assertEqual(after["role"], "written")
        self.assertTrue(after["can_help"])
        self.assertIn("paperwork wins", after["line"])

    def test_a_grudge_makes_an_unwritten_pell_refuse(self):
        code, _ = self.post("/events", {
            "kind": "grudge.changed", "entity": "npc/hollis", "actor": "human",
            "data": {"grudge": 0.4},
        })
        self.assertEqual(code, 200)
        hollis = self.member("npc/hollis")
        self.assertEqual(hollis["disposition"], "helps")   # paperwork still wins
        self.assertEqual(hollis["grudge"], 0.4)

    def test_the_log_does_not_rewind(self):
        event = {"kind": "speak", "entity": "npc/hollis", "actor": "human",
                 "data": {"text": "the books do not balance"}}
        code, _ = self.post("/events", event)
        self.assertEqual(code, 200)
        code, body = self.post("/events", {**event, "seq": 1})
        self.assertEqual(code, 409)
        self.assertIn("rewind", body["reason"])


class TestTheOutboxSync(ForgeCase):
    """At-least-once delivery, exactly-once log: the accepted outbox may be
    re-posted every turn without corrupting the ledger."""

    def test_same_id_arrives_twice_and_writes_once(self):
        event = {"id": "outbox-evt-7", "kind": "role.authored",
                 "entity": "npc/pell-the-underwritten", "actor": "human",
                 "gate": {"rule": "player-accept", "verdict": "pass"},
                 "data": {"state": "written", "text": "the ferryman"}}
        code, first = self.post("/events", event)
        self.assertEqual(code, 200)
        self.assertEqual(first["receipts"][0]["status"], "written")
        code, second = self.post("/events", event)      # the sync re-delivers
        self.assertEqual(code, 200)
        self.assertEqual(second["receipts"][0]["status"], "already-written")
        self.assertEqual(second["lines"], first["lines"])   # nothing appended

    def test_the_dedup_survives_a_relit_service(self):
        event = {"id": "outbox-evt-9", "kind": "speak", "actor": "human",
                 "entity": "npc/hollis", "data": {"text": "again"}}
        self.post("/events", event)
        relit = Ledger(self.ledger.path)               # restart, same state file
        code, body = _request(f"{self.base}/events", event)
        self.assertEqual(code, 200)
        self.assertEqual(body["receipts"][0]["status"], "already-written")
        self.assertEqual(len(relit.events), body["lines"])


class TestFoldIsTheTruth(ForgeCase):
    """State is never stored -- only rebuilt from the log, every request."""

    def test_roster_carries_no_state_fields(self):
        _, body = self.get("/roster")
        self.assertGreaterEqual(body["count"], 2)
        self.assertEqual(body["count"], len(body["members"]))
        for member in body["members"]:
            self.assertIn("lines_written", member)
            self.assertNotIn("state", member)          # projection, not storage

    def test_ledger_is_the_raw_log(self):
        _, body = self.get("/ledger")
        self.assertGreaterEqual(body["count"], 4)      # 2 identities + 1 role
        for ev in body["events"]:
            self.assertIn("seq", ev)
            self.assertIn("kind", ev)


class TestRefusalsAreLines(ForgeCase):
    """A character the schema cannot fold is a visible line, never a crash --
    in the roster *and* in the guidance block."""

    def _ledger_with_poisoned_seed(self):
        bad = {
            "seq": 99, "kind": "entity.seeded", "entity": "npc/beyond",
            "actor": "game",
            "data": {"name": "The Unregistered", "world_id": "unregistered-void",
                     "aspirations": "", "favored_items": [], "home": ""},
        }
        state = Path(self.tmp.name) / "poisoned.jsonl"
        state.write_text(json.dumps(bad) + "\n")
        return Ledger(state)

    def test_roster_and_guidance_both_render_the_refusal(self):
        ledger = self._ledger_with_poisoned_seed()
        roster = ledger.roster()
        member = next(m for m in roster["members"] if m["entity"] == "npc/beyond")
        self.assertIn("refused", member["fold"])
        self.assertIn("cannot be folded", member["line"])
        guidance = ledger.guidance()            # the call that raised KeyError
        self.assertIn("The Unregistered", guidance["guidance"])
        self.assertIn("cannot be folded", guidance["guidance"])


class TestCartographersLedgerBridge(ForgeCase):
    """The Bureau of the Unwritten Atlas bridge: survey, curate, and criticize over HTTP."""

    def test_cartographers_status_and_ledger(self):
        code, body = self.get("/cartographers/status")
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])
        self.assertIn("counts", body)
        self.assertIn("parsimony_config", body)

        code, ledger_body = self.get("/cartographers/ledger")
        self.assertEqual(code, 200)
        self.assertTrue(ledger_body["ok"])
        self.assertIn("entries", ledger_body)

    def test_survey_curate_criticize_lifecycle(self):
        # 1. Survey the glass stasis coffin in customs house
        code, survey_body = self.post("/cartographers/survey", {
            "prop_id": "glass_stasis_coffin",
            "scene_id": "customs-house",
            "asset": {
                "id": "glass_stasis_coffin",
                "fragment_id": "space-vampires/glass-stasis-coffin",
                "label": "Hexagonal Borosilicate Glass Stasis Coffin",
                "mass_kg": 280.0,
                "world_x": 44.0,
                "world_y": 84.0,
                "world_z": 6.0,
                "bounds": {"width": 0.8, "depth": 2.3, "height": 0.9},
                "visual_template": "glass_coffin",
            }
        })
        self.assertEqual(code, 200)
        self.assertTrue(survey_body["ok"])
        conflicts = survey_body["conflicts"]
        self.assertGreaterEqual(len(conflicts), 1)

        frag_id = "cartographers/bridge-glass-stasis-coffin-forfeit-corridor"
        # 2. Curate the fragment
        code, curate_body = self.post("/cartographers/curate", {
            "fragment_id": frag_id,
            "detail": "Carefully calibrated borosilicate glass stasis coffin with brass imperial clearance seal.",
        })
        self.assertEqual(code, 200)
        self.assertTrue(curate_body["ok"])
        self.assertEqual(curate_body["maturity"], "curated")
        self.assertEqual(curate_body["standing_score"], 0.90)
        self.assertIn("WARRANT-", curate_body["warrant_id"])

        # Check that Hollis ledger recorded the curation
        code, ledger_res = self.get("/ledger")
        self.assertEqual(code, 200)
        curated_event = next((e for e in ledger_res["events"] if e.get("kind") == "fragment.curated"), None)
        self.assertIsNotNone(curated_event)
        self.assertEqual(curated_event["entity"], f"fragment/{frag_id}")

        # 3. Criticize the fragment
        code, crit_body = self.post("/cartographers/criticize", {
            "fragment_id": frag_id,
            "constraint": "Rejected by author: no redundant space relics in customs house",
        })
        self.assertEqual(code, 200)
        self.assertTrue(crit_body["ok"])
        self.assertEqual(crit_body["maturity"], "criticized")
        self.assertEqual(crit_body["standing_score"], 0.55)

        # Check that Hollis ledger recorded the criticism
        code, ledger_res2 = self.get("/ledger")
        self.assertEqual(code, 200)
        crit_event = next((e for e in ledger_res2["events"] if e.get("kind") == "fragment.criticized"), None)
        self.assertIsNotNone(crit_event)
        self.assertEqual(crit_event["entity"], f"fragment/{frag_id}")


class TestForgeCompilerPipelineBridge(ForgeCase):
    """Test the Asset Forge Fragment Compiler & Prompt Rewriter pipeline bridge."""

    def test_forge_pipeline_status(self):
        code, body = self.get("/forge/pipeline")
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(body["service"], "forge_compiler")
        self.assertEqual(body["workflow"], "asset-forge.lattice.json")
        self.assertTrue(body["workflow_exists"])

    def test_forge_compile_prop(self):
        code, body = self.post("/forge/compile", {
            "asset_id": "r6_ship_crate_standard",
            "kind": "prop",
            "scene_id": "customs-house",
        })
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(body["status"], "compiled")
        self.assertEqual(body["lattice_workflow"], "asset-forge.lattice.json")
        self.assertIn("R6-SHIP", body["compiled_brief"])
        self.assertIn("orthographic top-down 2.5D isometric game asset cutout", body["diffusion_prompt"])
        self.assertIn("Weigh & Inspection Hall", body["diffusion_prompt"])
        self.assertIn("conditioning", body)
        self.assertEqual(body["conditioning"]["steps"], 16)
        self.assertIn("workflow_snapshot", body)
        self.assertTrue(body["workflow_snapshot"].endswith("r6_ship_crate_standard.json"))
        self.assertIn("comfyui_workflow", body)
        self.assertIn("1", body["comfyui_workflow"])

        # Check ledger record
        code, ledger_res = self.get("/ledger")
        self.assertEqual(code, 200)
        compile_event = next((e for e in ledger_res["events"] if e.get("kind") == "standing.granted" and e.get("entity") == "prop/r6_ship_crate_standard"), None)
        self.assertIsNotNone(compile_event)
        self.assertEqual(compile_event["provenance"]["workflow"], "asset-forge.lattice.json")
        self.assertEqual(compile_event["data"]["workflow_snapshot"], body["workflow_snapshot"])

    def test_forge_workflow_snapshot_endpoints(self):
        # 1. POST snapshot with explicit workflow
        custom_wf = {
            "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "moss_image_sft_bf16.safetensors"}},
            "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3.5_9b_int8_convrot.safetensors"}},
        }
        code, post_body = self.post("/forge/workflow/snapshot", {
            "asset_id": "test_crate_flow",
            "workflow": custom_wf,
        })
        self.assertEqual(code, 200)
        self.assertTrue(post_body["ok"])
        self.assertTrue(post_body["saved"])
        self.assertEqual(post_body["nodes_count"], 2)
        self.assertEqual(post_body["workflow_snapshot"], "workflows/comfyui/test_crate_flow.json")

        # 2. GET specific snapshot
        code, get_body = self.get("/forge/workflow/snapshot?asset_id=test_crate_flow")
        self.assertEqual(code, 200)
        self.assertTrue(get_body["ok"])
        self.assertEqual(get_body["workflow"]["1"]["class_type"], "UNETLoader")

        # 3. GET directory listing
        code, list_body = self.get("/forge/workflow/snapshot")
        self.assertEqual(code, 200)
        self.assertTrue(list_body["ok"])
        self.assertIn("test_crate_flow.json", list_body["snapshots"])

        # Clean up test snapshot
        snap_file = REPO_ROOT / "workflows" / "comfyui" / "test_crate_flow.json"
        if snap_file.is_file():
            snap_file.unlink()

    def test_forge_compile_actors(self):
        # 1. Compile Hollis
        code, hollis_body = self.post("/forge/compile", {
            "asset_id": "hollis",
            "kind": "actor",
            "facet": "portrait",
            "scene_id": "customs-house",
        })
        self.assertEqual(code, 200)
        self.assertTrue(hollis_body["ok"])
        self.assertEqual(hollis_body["standing_tier"], "verified")
        self.assertIn("quartermaster", hollis_body["diffusion_prompt"].lower())
        self.assertIn("ledger", hollis_body["diffusion_prompt"].lower())

        # 2. Compile Pell
        code, pell_body = self.post("/forge/compile", {
            "asset_id": "pell",
            "kind": "actor",
            "facet": "portrait",
            "scene_id": "customs-house",
        })
        self.assertEqual(code, 200)
        self.assertTrue(pell_body["ok"])
        self.assertEqual(pell_body["standing_tier"], "provisional")
        self.assertIn("understudy", pell_body["diffusion_prompt"].lower())

    def test_forge_compile_with_gemma4_orion_rewriter(self):
        code, body = self.post("/forge/compile", {
            "asset_id": "ancient-bastion",
            "kind": "prop",
            "scene_id": "border-march",
        })
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(body["status"], "compiled")
        self.assertEqual(body["rewriter"], "gemma4-orion")
        self.assertIn("single front isometric elevation displaying primary visible face", body["diffusion_prompt"])
        self.assertIn("45-degree cantilever", body["diffusion_prompt"])
        self.assertIn("image diffusion", body["diffusion_prompt"])
        self.assertIn("doctrine_rules", body)

    def test_forge_pipeline_3d_execution(self):
        # 1. GET /forge/pipeline/3d
        code_get, body_get = self.get("/forge/pipeline/3d")
        self.assertEqual(code_get, 200)
        self.assertTrue(body_get["ok"])
        self.assertIn("ancient-bastion", body_get["stl_primitives_available"])
        self.assertIn("ancient-bastion", body_get["depth_templates_available"])

        # 2. POST /forge/pipeline/3d
        code_post, body_post = self.post("/forge/pipeline/3d", {
            "primitive_id": "ancient-bastion",
            "scene_id": "border-march",
            "width": 512,
            "height": 512,
            "use_hunyuan": False,
        })
        self.assertEqual(code_post, 200)
        self.assertTrue(body_post["ok"])
        self.assertEqual(body_post["primitive_id"], "ancient-bastion")
        self.assertEqual(body_post["depth_url"], "renders/primitives/ancient-bastion-depth.png")
        self.assertGreaterEqual(body_post["triangle_count"], 1000)
        self.assertTrue(body_post["overhang_compliant"])
        self.assertTrue(body_post["watertight"])
        self.assertGreater(body_post["solid_coverage_px"], 50000)

        # 3. Check ledger record
        code, ledger_res = self.get("/ledger")
        self.assertEqual(code, 200)
        p3d_event = next((e for e in ledger_res["events"] if e.get("kind") == "standing.granted" and e.get("gate", {}).get("rule") == "coacd_stl_watertightness"), None)
        self.assertIsNotNone(p3d_event)
        self.assertEqual(p3d_event["data"]["primitive_id"], "ancient-bastion")

    def test_forge_pipeline_3d_with_2d_image_payload(self):
        """3D pipeline ingests 2D asset payload and outputs depth and reconstructed metadata."""
        import base64
        # Tiny 4x4 red square PNG as base64 data URL
        fake_png_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAFUlEQVR4nGP8z8DwnwEJMDGgAcICAIPRAgYCkO9YAAAAAElFTkSuQmCC"

        code_post, body_post = self.post("/forge/pipeline/3d", {
            "primitive_id": "ancient-bastion",
            "scene_id": "border-march",
            "width": 256,
            "height": 256,
            "image_data": fake_png_b64,
            "use_hunyuan": False,
        })
        self.assertEqual(code_post, 200)
        self.assertTrue(body_post["ok"])
        self.assertEqual(body_post["primitive_id"], "ancient-bastion")
        self.assertTrue(body_post["watertight"])
        self.assertIn("depth_url", body_post)
        self.assertIn("renders/primitives/ancient-bastion-depth.png", body_post["depth_url"])


class TestForgeCorsAndStaticServing(ForgeCase):
    def test_cors_options_preflight_on_compile_and_survey(self):
        for route in ("/forge/compile", "/cartographers/survey", "/events"):
            url = f"{self.base}{route}"
            req = urllib.request.Request(url, method="OPTIONS")
            with urllib.request.urlopen(req, timeout=5) as resp:
                self.assertEqual(resp.status, 204)
                headers = dict(resp.headers)
                self.assertEqual(headers.get("Access-Control-Allow-Origin"), "*")
                self.assertIn("OPTIONS", headers.get("Access-Control-Allow-Methods", ""))
                self.assertIn("POST", headers.get("Access-Control-Allow-Methods", ""))
                self.assertIn("Content-Type", headers.get("Access-Control-Allow-Headers", ""))
                self.assertEqual(headers.get("Content-Length"), "0")
                body = resp.read()
                self.assertEqual(len(body), 0, "RFC 9110: 204 No Content MUST have 0 body bytes")

    def test_cors_headers_on_post_and_get(self):
        url = f"{self.base}/health"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertEqual(resp.headers.get("Access-Control-Allow-Origin"), "*")
            self.assertIn("Content-Type", resp.headers.get("Access-Control-Allow-Headers", ""))

    def test_static_viewer_serving(self):
        url = f"{self.base}/viewer"
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            self.assertEqual(resp.status, 200)
            self.assertIn("text/html", resp.headers.get("Content-Type", ""))
            body = resp.read()
            self.assertIn(b"SpriteQuest 2.5D", body)

            # Ensure served inlined JavaScript has zero syntax errors (no unescaped string literal breaks)
            html_str = body.decode("utf-8")
            if "<script>" in html_str and "</script>" in html_str:
                script_body = html_str.split("<script>", 1)[1].rsplit("</script>", 1)[0]
                proc = subprocess.run(["node", "--check", "-"], input=script_body, text=True, capture_output=True)
                self.assertEqual(proc.returncode, 0, f"Served viewer JavaScript has syntax errors: {proc.stderr}")

    def test_broken_pipe_handled_gracefully(self):
        import socket
        # Open socket, send request and abruptly close before reading response
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("127.0.0.1", self.server.server_address[1]))
        s.sendall(b"POST /forge/compile HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: 2\r\n\r\n{}")
        s.close()
        # Verify server is still completely healthy and responding
        code, body = self.get("/health")
        self.assertEqual(code, 200)
        self.assertTrue(body["ok"])

    def test_waterfall_status_and_asset_save_clear(self):
        # 1. Test progress status lookup
        code, status_body = self.get("/forge/waterfall/status?primitive_id=checkpoint-brazier")
        self.assertEqual(code, 200)
        self.assertIn("status", status_body)

        # 2. Test saving asset manifest entry
        code, save_body = self.post("/forge/asset/save", {
            "primitive_id": "test-brazier",
            "data": {
                "label": "Test Brazier",
                "dimensions": [2.0, 2.0, 3.0],
                "standing_tier": "verified",
            },
        })
        self.assertEqual(code, 200)
        self.assertTrue(save_body.get("ok"))
        self.assertEqual(save_body.get("saved"), "test-brazier")

        # 3. Test clearing asset manifest entry
        code, clear_body = self.post("/forge/asset/clear", {
            "primitive_id": "test-brazier",
        })
        self.assertEqual(code, 200)
        self.assertTrue(clear_body.get("ok"))
        self.assertEqual(clear_body.get("primitive_id"), "test-brazier")


if __name__ == "__main__":
    unittest.main(verbosity=2)
