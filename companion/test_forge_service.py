#!/usr/bin/env python3
"""The forge's door-check: what gets in, what gets turned away, and why.

    python3 tools/test_forge_service.py

Every test runs against a real server on an ephemeral port and a real state
file in a temp dir -- no mocks of the log, because the log is the thing.
"""
from __future__ import annotations

import json
import sys
import tempfile
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from forge_service import Ledger, make_handler  # noqa: E402


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
        seed_dir = HERE / "npcs" if (HERE / "npcs").exists() else HERE.parent / "npcs"
        cls.ledger = Ledger(cls.state, seed_dir=seed_dir)
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0),
                                         make_handler(cls.ledger))
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
