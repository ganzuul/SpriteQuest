#!/usr/bin/env python3
"""A playable walkthrough of the hollis ledger loop -- one command, no setup.

    python3 tools/demo_forge.py

Spins a real forge on an ephemeral port with a temp state seeded from npcs/,
then acts out the five beats the Lattice workflow performs across two Turns:
the world as the fiction seeds it, the door-check turning a model away, your
accept writing a part down, the roster moving, and the outbox re-delivering
without corrupting the log. Every step is a real HTTP round trip -- nothing is
mocked, so what you see here is what ST sees.
"""
from __future__ import annotations

import json
import sys
import tempfile
import threading
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from forge_service import Ledger, make_handler  # noqa: E402

RULE = "=" * 74


def act(title: str) -> None:
    print(f"\n{title}\n{'-' * len(title)}")


def request(url: str, payload: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        url, data=data, method="POST" if data else "GET",
        headers={"Content-Type": "application/json"} if data else {})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as exc:
        with exc:
            return exc.code, json.loads(exc.read())


def show_roster(roster: dict) -> None:
    for m in roster["members"]:
        state = m.get("role", "?")
        disp = m.get("disposition", "?")
        print(f"  {m['name']:<26} {state:<10} {disp:<11} {m['line']}")


def main() -> int:
    print(RULE)
    print("THE UNDERSTUDY -- a demo of the hollis ledger loop")
    print(RULE)
    with tempfile.TemporaryDirectory(prefix="forge-demo-") as tmp:
        state = Path(tmp) / "ledger.jsonl"
        npc_dir = HERE / "npcs" if (HERE / "npcs").exists() else HERE.parent / "npcs"
        ledger = Ledger(state, seed_dir=npc_dir)
        server = ThreadingHTTPServer(("127.0.0.1", 0), make_handler(ledger))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}"

        try:
            act("Act I -- The world as npcs/ seeds it (Turn 1, On Send: GET /guidance)")
            code, body = request(f"{base}/guidance")
            print(f"  [HTTP {code}]")
            for line in body["guidance"].splitlines():
                print(f"  {line}")

            act("Act II -- A model tries to write Pell a second part, ungated")
            code, body = request(f"{base}/events", {
                "kind": "role.authored", "entity": "npc/pell-the-underwritten",
                "actor": "model", "provenance": {"source": "the-model-felt-like-it"},
                "data": {"state": "written", "text": "also a king now"},
            })
            print(f"  [HTTP {code}] {body['error']}: {body['reason']}")

            act("Act III -- You accept the reply where Pell is given a part (Apply)")
            print("  The workflow's outbox delivers what you accepted:")
            event = {
                "id": "outbox-pell-ferryman", "kind": "role.authored",
                "entity": "npc/pell-the-underwritten", "actor": "model",
                "gate": {"rule": "player-accept", "verdict": "pass"},
                "provenance": {"source": "understudy-outbox"},
                "data": {"state": "written", "text": "the ferryman who gets an ending"},
            }
            code, body = request(f"{base}/events", event)
            print(f"  [HTTP {code}] appended={body['appended']} "
                  f"receipt={body['receipts'][0]['status']} seq={body['receipts'][0]['seq']}")

            act("Act IV -- Turn 2, On Send: the roster moves before the reply")
            code, body = request(f"{base}/roster")
            print(f"  [HTTP {code}]")
            show_roster(body)

            act("Act V -- The outbox re-delivers the whole accepted history (idempotent)")
            code, body = request(f"{base}/events", event)
            first = body["receipts"][0]
            print(f"  [HTTP {code}] {first['status']} -- the log holds at "
                  f"{body['lines']} lines, nothing rewound, nothing duplicated")

            act("The log itself (GET /ledger) -- a character is only ever this")
            code, body = request(f"{base}/ledger")
            for ev in body["events"]:
                name = ev["entity"].split("/", 1)[-1]
                print(f"  #{ev['seq']:<3} {ev['kind']:<16} {name:<26} actor={ev['actor']}")
        finally:
            server.shutdown()

    print()
    print(RULE)
    print("In SillyTavern this loop is the understudy.lattice.json workflow:")
    print("  Act I+IV = Service Call GET /guidance -> Compose -> your reply")
    print("  Act II+III = Apply stages the outbox; only your accept delivers")
    print("  Act V = next Send's pre-phase sync (dedup keeps the log exactly-once)")
    print("Run the real thing: python3 tools/forge_service.py --seed-from npcs/")
    print(RULE)
    return 0


if __name__ == "__main__":
    sys.exit(main())
