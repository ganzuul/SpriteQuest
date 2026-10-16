#!/usr/bin/env python3
"""The HTTP face of the hollis ledger: what the story has written down.

    python3 tools/forge_service.py --seed-from npcs/ --port 8788

A Lattice workflow asks this service who is in the scene and what they can be
relied on for; the model writes the reply; when the player *accepts* the
reply, the workflow posts the accepted events here and the roster moves. The
accept is the only door: the service validates every event through
`runtime/schemas.EventRecord` and rebuilds each character through
`runtime/schemas.fold_events`, so an event that cannot be trusted -- a
role with no gate verdict, a model's word with no provenance -- is refused
at the door with its reason, and a character is nothing but the fold of the
hollis ledger's lines.

Four reads and one write:

    GET  /health     liveness: the state file and the line count
    GET  /roster     every character, folded: role state, grudge, disposition
    GET  /guidance   the roster as one injectable text block
    GET  /ledger     the append-only log itself
    POST /events     one accepted event (or a list) -> appended, or refused

State is one JSONL file per story (`--state`), append-only, defaulting under
`~/.local/state/spritequest/` -- game state is per-machine, not repo content.
Every failure answers JSON that names the reason. Silence is never an answer.
"""
from __future__ import annotations

import argparse
import json
import sys
from dataclasses import asdict
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from schemas import (  # noqa: E402  (path first, by design)
    EventRecord, Gate, SchemaError, fold_events,
)

DEFAULT_STATE = Path.home() / ".local" / "state" / "spritequest" / "hollis-ledger.jsonl"

#: The enchantment payload, deterministically keyed -- the service is rules,
#: not narration. The disposition is the player-facing fact; the line is the
#: fiction's own explanation of it. "Unreliable" is the understudy's line
#: whoever carries it: unwritten, and it is not their fault.
LINES = {
    "unreliable": "has no part above the first line -- not short of method, "
                  "short of standing; nobody wrote them down",
    "refuses":    "has no part and bears a grudge; he refuses",
    "helps":      "is written; the part obliges him, whatever he feels about "
                  "it -- the paperwork wins",
}


def line_for(role_state: str, disposition: str) -> str:
    if disposition == "helps" and role_state == "restored":
        return "is written again; the part obliges him"
    return LINES.get(disposition, f"is {role_state} and {disposition}")


class Ledger:
    """The append-only log plus its one law: a character is the fold of it."""

    def __init__(self, path: Path, seed_dir: Path | None = None):
        self.path = path
        self.events: list[EventRecord] = []
        self.seen_ids: set[str] = set()
        if path.exists():
            for n, raw in enumerate(path.read_text().splitlines(), 1):
                raw = raw.strip()
                if not raw:
                    continue
                try:
                    line = json.loads(raw)
                    self.events.append(_record(line))
                except (ValueError, SchemaError) as exc:
                    raise SystemExit(f"{path}:{n}: {exc}") from exc
                if line.get("id") is not None:
                    self.seen_ids.add(str(line["id"]))
        if not self.events and seed_dir is not None:
            self.seed_from(seed_dir)

    def seed_from(self, npc_dir: Path) -> None:
        """Open the story where `npcs/*.json` leaves it.

        Every character enters with an identity line; only a character whose
        file says the part is written gets a `role.authored` line. Hollis is
        the twice-written quartermaster and helps; Pell is the understudy and
        does not -- that asymmetry is the story's own, seeded, not invented.
        """
        for path in sorted(npc_dir.glob("*.json")):
            data = json.loads(path.read_text())
            slug = path.stem
            self._append(EventRecord(
                seq=self.next_seq(), kind="entity.seeded", entity=f"npc/{slug}",
                actor="game",
                data={"name": data["name"], "world_id": data.get("world_id", ""),
                      "aspirations": data.get("aspirations", ""),
                      "favored_items": tuple(data.get("favored_items", ())),
                      "home": data.get("home", "")},
                provenance={"source": f"npcs/{path.name}"},
            ))
            # A part is written only when the file says so explicitly -- the
            # `role` string is a card description and proves nothing (Pell has
            # one: "understudy awaiting a role"). The fiction declares who is
            # written; the seed does not infer it.
            if data.get("written"):
                self._append(EventRecord(
                    seq=self.next_seq(), kind="role.authored", entity=f"npc/{slug}",
                    actor="human",
                    data={"state": "written", "text": data.get("role", "")},
                    gate=Gate(rule="seed", verdict="pass"),
                    provenance={"source": f"npcs/{path.name}"},
                ))

    def next_seq(self) -> int:
        return 1 + max((e.seq for e in self.events), default=0)

    def append(self, payload: dict) -> list[dict]:
        """Validate, then append. Refuses duplicates -- the log does not rewind.

        An event may carry a top-level ``id``: the stable identity the Lattice
        outbox gives a proposed event. The same id arriving twice is the sync
        re-delivering what the ledger already holds -- acknowledged, not
        appended. That is what makes the accepted outbox safe to re-post every
        turn: delivery is at-least-once, the log is exactly-once.
        """
        items = payload if isinstance(payload, list) else [payload]
        receipts = []
        for item in items:
            event_id = item.get("id")
            if event_id is not None and event_id in self.seen_ids:
                receipts.append({"id": event_id, "status": "already-written"})
                continue
            seq = self.next_seq() if "seq" not in item else int(item["seq"])
            record = _record({**item, "seq": seq})
            if any(e.seq == record.seq for e in self.events):
                raise Conflict(f"seq {record.seq} is already written; the log "
                               f"does not rewind")
            self._append(record, event_id=str(event_id) if event_id is not None else None)
            if event_id is not None:
                self.seen_ids.add(event_id)
            receipts.append({"seq": record.seq, "kind": record.kind,
                             "entity": record.entity,
                             "status": "written"})
        return receipts

    def _append(self, record: EventRecord, event_id: str | None = None) -> None:
        self.events.append(record)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        line = asdict(record)
        if event_id is not None:
            line["id"] = event_id          # the name it arrived under; kept
        with self.path.open("a") as fh:
            fh.write(json.dumps(line, sort_keys=True) + "\n")

    def roster(self) -> dict:
        """Every character, folded from the log -- projection, never stored."""
        by_entity: dict[str, list[EventRecord]] = {}
        for ev in self.events:
            by_entity.setdefault(ev.entity, []).append(ev)
        members = []
        for entity, events in sorted(by_entity.items()):
            events.sort(key=lambda e: e.seq)
            try:
                npc = fold_events(events)
            except SchemaError as exc:
                # A refusal is a line, not a crash: the character is absent
                # from the fold, and the roster says why. The name lives in
                # the seed event even when the fold cannot complete, so show
                # who was lost, not just which slug failed.
                seeded = next((e for e in events if e.kind == "entity.seeded"), None)
                display = (seeded.data.get("name") if seeded else None) or \
                    entity.split("/", 1)[-1].replace("-", " ")
                members.append({"entity": entity, "name": display,
                                "fold": f"refused: {exc}",
                                "line": f"cannot be folded -- {exc}",
                                "disposition": "unevaluated", "can_help": False,
                                "lines_written": len(events)})
                continue
            disposition = npc.help_disposition()
            members.append({
                "entity": entity, "name": npc.name, "world_id": npc.world_id,
                "role": npc.role.state, "grudge": npc.grudge.grudge,
                "disposition": disposition,
                "can_help": disposition == "helps",
                "line": line_for(npc.role.state, disposition),
                "aspirations": npc.motivation.aspirations,
                "lines_written": len(events),
            })
        return {"count": len(members), "members": members}

    def guidance(self) -> dict:
        """The roster as one injectable block -- still rules, not narration.

        A Compose template can paste this whole block into guidance without
        knowing the roster's shape: who is here, what they may be relied on
        for, and why, in the fiction's own words. Nothing is inferred; every
        line is a fold of the log.
        """
        roster = self.roster()
        lines = ["The ledger, as it stands:"]
        for m in roster["members"]:
            if "fold" in m:
                # A refused fold is a line here too -- the guidance tells the
                # scene the character could not be rebuilt, never crashes on it.
                lines.append(f"- {m['name']}: {m['line']}")
                continue
            lines.append(f"- {m['name']} ({m['world_id']}): {m['line']}.")
        return {"guidance": "\n".join(lines), "count": roster["count"]}


class Refused(ValueError):
    """An event the door-check turned away. Carries its reason, HTTP 400."""


class Conflict(ValueError):
    """A write that would rewind the log. HTTP 409."""


def _record(data: dict) -> EventRecord:
    """A dict from the wire into a validated event, reasons carried upward."""
    try:
        gate = data.get("gate")
        return EventRecord(
            seq=int(data["seq"]), kind=str(data["kind"]),
            entity=str(data["entity"]), actor=str(data["actor"]),
            data=dict(data.get("data", {})),
            gate=Gate(rule=str(gate["rule"]), verdict=str(gate["verdict"]),
                      checks=tuple(gate.get("checks", ()))) if gate else None,
            provenance=dict(data.get("provenance", {})),
        )
    except (KeyError, TypeError, ValueError, SchemaError) as exc:
        raise Refused(str(exc)) from exc


def make_handler(ledger: Ledger):
    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, fmt, *args):      # quiet: the caller shows receipts
            pass

        def _send(self, code: int, payload: dict) -> None:
            body = json.dumps(payload, indent=2).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(body)

        def do_OPTIONS(self):
            self._send(204, {})

        def do_GET(self):
            route = self.path.split("?", 1)[0].rstrip("/") or "/"
            if route == "/health":
                self._send(200, {"ok": True, "service": "forge",
                                 "state": str(ledger.path),
                                 "lines": len(ledger.events)})
            elif route == "/roster":
                self._send(200, ledger.roster())
            elif route == "/guidance":
                self._send(200, ledger.guidance())
            elif route == "/ledger":
                self._send(200, {"count": len(ledger.events),
                                 "events": [asdict(e) for e in ledger.events]})
            else:
                self._send(404, {"error": "unknown route",
                                 "route": route,
                                 "known": ["/health", "/roster", "/guidance",
                                           "/ledger", "/events"]})

        def do_POST(self):
            route = self.path.split("?", 1)[0].rstrip("/")
            if route != "/events":
                self._send(404, {"error": "unknown route", "route": route,
                                 "known": ["/events"]})
                return
            try:
                length = int(self.headers.get("Content-Length") or 0)
                payload = json.loads(self.rfile.read(length) or b"{}")
                receipts = ledger.append(payload)
            except Refused as exc:
                self._send(400, {"error": "event refused", "reason": str(exc),
                                 "law": "every event must be a record the "
                                        "schema can trust; a role needs a gate "
                                        "verdict, a model needs provenance"})
            except Conflict as exc:
                self._send(409, {"error": "append refused", "reason": str(exc)})
            except (json.JSONDecodeError, ValueError) as exc:
                self._send(400, {"error": "unreadable body", "reason": str(exc)})
            else:
                self._send(200, {"appended": len(receipts),
                                 "receipts": receipts,
                                 "lines": len(ledger.events)})

    return Handler


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--port", type=int, default=8788)
    ap.add_argument("--state", type=Path, default=DEFAULT_STATE)
    ap.add_argument("--seed-from", type=Path, default=None,
                    help="seed an empty state from a directory of character "
                         "JSON files (npcs/); refused on a non-empty log")
    args = ap.parse_args()

    seed = args.seed_from
    if seed is not None and args.state.exists() and args.state.stat().st_size:
        seed = None                     # an existing story is never re-seeded
    ledger = Ledger(args.state, seed_dir=seed)
    if seed is not None:
        print(f"seeded {len(ledger.events)} lines from {seed} "
              f"into {args.state}")
    print(f"the forge is lit: http://127.0.0.1:{args.port}/roster "
          f"({args.state}, {len(ledger.events)} lines)")
    ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(ledger)).serve_forever()
    return 0


if __name__ == "__main__":
    sys.exit(main())
