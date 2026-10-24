#!/usr/bin/env python3
"""The forge's door-check: what gets in, what gets turned away, and why.

    python3 tools/test_forge_service.py

Every test runs against a real server on an ephemeral port and a real state
file in a temp dir -- no mocks of the log, because the log is the thing.
"""
from __future__ import annotations

import json
import shutil
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


def _request(url: str, payload: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, method="POST" if data else "GET",
        headers={"Content-Type": "application/json"} if data else {})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
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

    def get(self, route):
        return _request(f"{self.base}{route}")

    def post(self, route, payload):
        return _request(f"{self.base}{route}", payload)

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


if __name__ == "__main__":
    unittest.main(verbosity=2)
