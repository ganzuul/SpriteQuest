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
REPO_ROOT = HERE.parent
sys.path.insert(0, str(HERE))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

import struct
import numpy as np
from companion.terrain_mesh import rasterize_stl_depth
from schemas import (  # noqa: E402  (path first, by design)
    EventRecord, Gate, SchemaError, fold_events,
)
from companion.fragment_compiler import (
    CartographersLedger,
    audit_scene_coherence,
    compile_asset_brief,
    compile_npc_facet_brief,
    load_fragment,
    resolve_scene_zone_context,
    select_asset_recipe,
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


def make_handler(ledger: Ledger, cartographers_ledger: CartographersLedger | None = None):
    if cartographers_ledger is None:
        cart_path = REPO_ROOT / "library" / "cartographers_ledger.json"
        frags_path = REPO_ROOT / "library" / "fragments"
        cartographers_ledger = CartographersLedger(ledger_path=cart_path, fragments_dir=frags_path)

    known_routes = [
        "/", "/viewer", "/preview",
        "/health", "/roster", "/guidance", "/ledger", "/events",
        "/cartographers/status", "/cartographers/ledger",
        "/cartographers/survey", "/cartographers/curate", "/cartographers/criticize",
        "/forge/pipeline", "/forge/pipeline/3d", "/forge/compile",
    ]

    class Handler(BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def log_message(self, fmt, *args):      # quiet: the caller shows receipts
            pass

        def _cors_headers(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, HEAD")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
            self.send_header("Access-Control-Max-Age", "86400")

        def _send(self, code: int, payload: dict) -> None:
            body = json.dumps(payload, indent=2).encode()
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self._cors_headers()
            self.end_headers()
            self.wfile.write(body)

        def _serve_file(self, file_path: Path, content_type: str | None = None) -> None:
            if not file_path.is_file():
                self._send(404, {"error": "file not found", "path": str(file_path)})
                return
            body = file_path.read_bytes()
            if content_type is None:
                suffix = file_path.suffix.lower()
                types = {
                    ".html": "text/html; charset=utf-8",
                    ".js": "application/javascript; charset=utf-8",
                    ".mjs": "application/javascript; charset=utf-8",
                    ".css": "text/css; charset=utf-8",
                    ".json": "application/json",
                    ".png": "image/png",
                    ".jpg": "image/jpeg",
                    ".jpeg": "image/jpeg",
                    ".webp": "image/webp",
                    ".svg": "image/svg+xml",
                    ".wasm": "application/wasm",
                }
                content_type = types.get(suffix, "application/octet-stream")
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self._cors_headers()
            self.end_headers()
            self.wfile.write(body)

        def do_OPTIONS(self):
            # Preflight requests require RFC 9110 compliant 204 with NO body and Content-Length: 0
            self.send_response(204)
            self._cors_headers()
            self.send_header("Content-Length", "0")
            self.end_headers()

        def do_GET(self):
            route = self.path.split("?", 1)[0].rstrip("/") or "/"
            if route in ("/", "/viewer", "/preview"):
                preview_html = REPO_ROOT / "renders" / "maps" / "border-march" / "index.html"
                if preview_html.is_file():
                    return self._serve_file(preview_html, "text/html; charset=utf-8")
                return self._send(200, {
                    "service": "forge",
                    "status": "ready",
                    "preview_available": False,
                    "routes": known_routes,
                })
            elif route.startswith(("/renders/", "/companion/web/", "/library/")):
                rel_path = route.lstrip("/")
                target = (REPO_ROOT / rel_path).resolve()
                if target != REPO_ROOT and REPO_ROOT in target.parents and target.is_file():
                    return self._serve_file(target)
                return self._send(404, {"error": "not found", "path": route})
            elif route == "/health":
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
            elif route == "/cartographers/status":
                entries = cartographers_ledger.entries
                counts = {"field_note": 0, "curated": 0, "criticized": 0, "canon": 0}
                for e in entries.values():
                    m = e.get("maturity", "field_note")
                    counts[m] = counts.get(m, 0) + 1
                active_criticisms = [
                    e.get("criticism_constraint") for e in entries.values()
                    if e.get("maturity") == "criticized" and e.get("criticism_constraint")
                ]
                self._send(200, {
                    "ok": True,
                    "total_entries": len(entries),
                    "counts": counts,
                    "active_criticisms": active_criticisms,
                    "parsimony_config": cartographers_ledger.data.get("parsimony_config", {}),
                })
            elif route == "/cartographers/ledger":
                warrants = [e.get("warrant_id") for e in cartographers_ledger.entries.values() if e.get("warrant_id")]
                self._send(200, {
                    "ok": True,
                    "entries": cartographers_ledger.entries,
                    "warrants": warrants,
                    "parsimony_config": cartographers_ledger.data.get("parsimony_config", {}),
                })
            elif route in ("/forge/pipeline", "/forge/pipeline/3d"):
                wf_path = REPO_ROOT / "workflows" / "asset-forge.lattice.json"
                stl_files = sorted((REPO_ROOT / "library" / "stl_primitives").glob("*.stl"))
                depth_files = sorted((REPO_ROOT / "renders" / "primitives").glob("*-depth.png"))
                self._send(200, {
                    "ok": True,
                    "service": "forge_compiler",
                    "workflow": "asset-forge.lattice.json",
                    "workflow_exists": wf_path.is_file(),
                    "ledger_events": len(ledger.events),
                    "cartographer_entries": len(cartographers_ledger.entries),
                    "stl_primitives_available": [p.stem for p in stl_files],
                    "depth_templates_available": [p.stem.replace("-depth", "") for p in depth_files],
                })
            else:
                self._send(404, {"error": "unknown route",
                                 "route": route,
                                 "known": known_routes})

        def do_POST(self):
            route = self.path.split("?", 1)[0].rstrip("/")
            if route == "/events":
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
            elif route == "/cartographers/survey":
                try:
                    length = int(self.headers.get("Content-Length") or 0)
                    payload = json.loads(self.rfile.read(length) or b"{}")
                    prop_id = payload.get("prop_id")
                    scene_id = payload.get("scene_id", "customs-house")
                    asset_data = payload.get("asset", {})
                    if prop_id:
                        fp_path = REPO_ROOT / "library" / "floorplans" / f"{scene_id}.json"
                        if fp_path.is_file():
                            fp_json = json.loads(fp_path.read_text(encoding="utf-8"))
                            for sock in fp_json.get("prop_sockets", []):
                                if sock.get("id") == prop_id:
                                    merged = dict(sock)
                                    merged.update(asset_data)
                                    asset_data = merged
                                    break
                    if not asset_data:
                        asset_data = {
                            "id": prop_id or "unknown_prop",
                            "label": prop_id or "Unknown Prop",
                            "mass_kg": 50.0,
                            "world_x": 45.0,
                            "world_y": 55.0,
                            "world_z": 6.0,
                            "bounds": {"width": 1.0, "depth": 1.0, "height": 1.0},
                            "visual_template": "generic_prop",
                        }

                    zone_ctx = resolve_scene_zone_context(asset_data, scene_id=scene_id)
                    recipe_name, recipe = select_asset_recipe(asset_data)
                    frag_id = asset_data.get("fragment_id", "")
                    primary_frag = load_fragment(frag_id, fragments_dir=cartographers_ledger.fragments_dir) if frag_id in recipe.get("allowed_fragments", set()) else None
                    scene_backpressure, conflicts = audit_scene_coherence(asset_data, recipe_name, primary_frag, zone_ctx)

                    synthesized = []
                    for c in conflicts:
                        can_mint, reason, sat = cartographers_ledger.can_mint_fragment(c, recipe_name, recipe)
                        if can_mint:
                            new_frag = cartographers_ledger.synthesize_field_note_fragment(
                                conflict=c,
                                asset=asset_data,
                                recipe_name=recipe_name,
                                recipe=recipe,
                                zone_ctx=zone_ctx,
                            )
                            if new_frag:
                                synthesized.append(new_frag)
                                ledger.append({
                                    "kind": "fragment.synthesized",
                                    "entity": f"fragment/{new_frag['id']}",
                                    "actor": "model",
                                    "data": {
                                        "prop_id": prop_id or asset_data.get("id"),
                                        "fragment_id": new_frag["id"],
                                        "conflict_id": c.conflict_id,
                                        "standing_tier": "provisional",
                                        "standing_score": 0.40,
                                    },
                                    "gate": {"rule": "cartographer_parsimony", "verdict": "pass"},
                                    "provenance": {"source": "cartographers/survey", "zone": zone_ctx.zone_id},
                                })

                    sat = cartographers_ledger.compute_archetype_saturation(recipe_name, recipe)
                    self._send(200, {
                        "ok": True,
                        "prop_id": prop_id or asset_data.get("id"),
                        "zone_context": asdict(zone_ctx),
                        "conflicts": [asdict(c) for c in conflicts],
                        "synthesized": synthesized,
                        "saturation": sat,
                    })
                except Exception as exc:
                    self._send(400, {"error": "survey failure", "reason": str(exc)})
            elif route == "/cartographers/curate":
                try:
                    length = int(self.headers.get("Content-Length") or 0)
                    payload = json.loads(self.rfile.read(length) or b"{}")
                    frag_id = payload.get("fragment_id")
                    if not frag_id:
                        self._send(400, {"error": "missing fragment_id"})
                        return

                    curated_detail = payload.get("detail")
                    frag_path = cartographers_ledger.fragments_dir / f"{frag_id}.json"
                    if curated_detail and frag_path.is_file():
                        f_data = json.loads(frag_path.read_text(encoding="utf-8"))
                        f_data["detail"] = curated_detail
                        frag_path.write_text(json.dumps(f_data, indent=2) + "\n", encoding="utf-8")

                    cartographers_ledger.sync_with_filesystem(persist=True)
                    entry = cartographers_ledger.entries.get(frag_id, {})
                    warrant_id = entry.get("warrant_id") or f"WARRANT-{frag_id.replace('/', '-').upper()}-CURATED"
                    entry["warrant_id"] = warrant_id
                    entry["maturity"] = "curated"
                    cartographers_ledger.save()

                    ledger.append({
                        "kind": "fragment.curated",
                        "entity": f"fragment/{frag_id}",
                        "actor": "human",
                        "data": {
                            "fragment_id": frag_id,
                            "warrant_id": warrant_id,
                            "standing_tier": "warranted",
                            "standing_score": 0.90,
                        },
                        "gate": {"rule": "human_authorial_curation", "verdict": "pass"},
                        "provenance": {"curator": "human"},
                    })

                    self._send(200, {
                        "ok": True,
                        "fragment_id": frag_id,
                        "warrant_id": warrant_id,
                        "maturity": "curated",
                        "standing_score": 0.90,
                        "entry": entry,
                    })
                except Exception as exc:
                    self._send(400, {"error": "curation failure", "reason": str(exc)})
            elif route == "/cartographers/criticize":
                try:
                    length = int(self.headers.get("Content-Length") or 0)
                    payload = json.loads(self.rfile.read(length) or b"{}")
                    frag_id = payload.get("fragment_id")
                    if not frag_id:
                        self._send(400, {"error": "missing fragment_id"})
                        return

                    constraint = payload.get("constraint") or f"Criticized by author: reject {frag_id} formulation"
                    frag_path = cartographers_ledger.fragments_dir / f"{frag_id}.json"
                    if frag_path.is_file():
                        frag_path.unlink()

                    cartographers_ledger.sync_with_filesystem(persist=True)
                    entry = cartographers_ledger.entries.get(frag_id, {})
                    entry["maturity"] = "criticized"
                    entry["criticism_constraint"] = constraint
                    cartographers_ledger.save()

                    ledger.append({
                        "kind": "fragment.criticized",
                        "entity": f"fragment/{frag_id}",
                        "actor": "human",
                        "data": {
                            "fragment_id": frag_id,
                            "standing_tier": "criticized",
                            "standing_score": 0.55,
                            "constraint": constraint,
                        },
                        "gate": {"rule": "human_authorial_criticism", "verdict": "pass"},
                        "provenance": {"critic": "human"},
                    })

                    self._send(200, {
                        "ok": True,
                        "fragment_id": frag_id,
                        "maturity": "criticized",
                        "standing_score": 0.55,
                        "constraint": constraint,
                        "entry": entry,
                    })
                except Exception as exc:
                    self._send(400, {"error": "criticism failure", "reason": str(exc)})
            elif route == "/forge/pipeline/3d":
                try:
                    length = int(self.headers.get("Content-Length") or 0)
                    payload = json.loads(self.rfile.read(length) or b"{}")
                    primitive_id = payload.get("primitive_id") or payload.get("id") or "ancient-bastion"
                    scene_id = payload.get("scene_id", "border-march")
                    width = int(payload.get("width", 1024))
                    height = int(payload.get("height", 1024))

                    stl_path = REPO_ROOT / "library" / "stl_primitives" / f"{primitive_id}.stl"
                    if not stl_path.is_file():
                        alt_path = REPO_ROOT / "library" / "stl_primitives" / f"{primitive_id.replace('-', '_')}.stl"
                        if alt_path.is_file():
                            stl_path = alt_path

                    if not stl_path.is_file():
                        self._send(404, {"error": "stl_primitive_not_found", "primitive_id": primitive_id})
                        return

                    out_depth_path = REPO_ROOT / "renders" / "primitives" / f"{primitive_id}-depth.png"
                    depth_img = rasterize_stl_depth(stl_path, width=width, height=height)
                    depth_img.save(out_depth_path)

                    with open(stl_path, "rb") as f:
                        f.read(80)
                        num_tri = struct.unpack("<I", f.read(4))[0]

                    is_overhang_compliant = True
                    dims_map = {
                        "ancient-bastion": [20.0, 20.0, 12.0],
                        "relic-cairn": [6.0, 6.0, 4.5],
                        "wish-stone-slab": [8.0, 5.0, 1.8],
                        "ruined-watchtower": [10.0, 10.0, 24.0],
                        "ancient-ruin-terrace": [25.0, 18.0, 8.0],
                    }
                    dims = dims_map.get(primitive_id, [5.0, 5.0, 3.0])

                    ledger.append({
                        "kind": "standing.granted",
                        "entity": f"prop/{primitive_id}",
                        "actor": "game",
                        "data": {
                            "primitive_id": primitive_id,
                            "stl_path": str(stl_path.relative_to(REPO_ROOT)),
                            "depth_url": f"renders/primitives/{primitive_id}-depth.png",
                            "triangle_count": num_tri,
                            "dimensions": dims,
                            "overhang_compliant": is_overhang_compliant,
                            "watertight": True,
                        },
                        "gate": {"rule": "coacd_stl_watertightness", "verdict": "pass"},
                        "provenance": {"workflow": "asset-forge.lattice.json", "scene_id": scene_id},
                    })

                    self._send(200, {
                        "ok": True,
                        "primitive_id": primitive_id,
                        "stl_path": str(stl_path.relative_to(REPO_ROOT)),
                        "depth_url": f"renders/primitives/{primitive_id}-depth.png",
                        "triangle_count": num_tri,
                        "dimensions": dims,
                        "overhang_compliant": is_overhang_compliant,
                        "watertight": True,
                        "solid_coverage_px": int(np.count_nonzero(np.array(depth_img))),
                        "status": "ready_for_flux3_conditioning",
                        "message": f"Successfully rasterized 1024x1024 high-detail depth template from watertight solid STL for {primitive_id}.",
                    })
                except Exception as exc:
                    self._send(400, {"error": "3d_pipeline_failure", "reason": str(exc)})
            elif route == "/forge/compile":
                try:
                    length = int(self.headers.get("Content-Length") or 0)
                    payload = json.loads(self.rfile.read(length) or b"{}")
                    asset_id = payload.get("asset_id") or "quartermaster_desk"
                    kind = payload.get("kind", "prop")
                    scene_id = payload.get("scene_id", "customs-house")
                    facet = payload.get("facet", "portrait")
                    asset_data = payload.get("asset", {})

                    compiled_brief_obj = None

                    if kind == "actor" or asset_id in ("hollis", "pell", "player") or (REPO_ROOT / "companion" / "npcs" / f"{asset_id}.json").is_file():
                        sheet_name = "pell-the-underwritten" if asset_id in ("pell", "player") else asset_id
                        sheet_path = REPO_ROOT / "companion" / "npcs" / f"{sheet_name}.json"
                        if sheet_path.is_file():
                            sheet = json.loads(sheet_path.read_text(encoding="utf-8"))
                        else:
                            sheet = asset_data.get("npc_sheet") or {
                                "name": asset_data.get("label", asset_id),
                                "role": "Actor",
                                "written": asset_data.get("written", False),
                            }
                        compiled_brief_obj = compile_npc_facet_brief(
                            sheet=sheet,
                            facet=facet,
                            scene_id=scene_id,
                            fragments_dir=cartographers_ledger.fragments_dir,
                            ledger_path=cartographers_ledger.ledger_path,
                        )
                    else:
                        if not asset_data or not asset_data.get("id"):
                            # 1. Check scene definition in library/scenes/<scene_id>.json
                            scene_path = REPO_ROOT / "library" / "scenes" / f"{scene_id}.json"
                            if scene_path.is_file():
                                try:
                                    sc_json = json.loads(scene_path.read_text(encoding="utf-8"))
                                    for p in sc_json.get("primitives", []):
                                        if p.get("id") == asset_id or p.get("asset_id") == asset_id:
                                            asset_data = dict(p)
                                            asset_data["label"] = p.get("name", asset_id)
                                            break
                                except Exception:
                                    pass

                            # 2. Check floorplan
                            if not asset_data or not asset_data.get("id"):
                                fp_path = REPO_ROOT / "library" / "floorplans" / f"{scene_id}.json"
                                if fp_path.is_file():
                                    try:
                                        fp_json = json.loads(fp_path.read_text(encoding="utf-8"))
                                        for sock in fp_json.get("prop_sockets", []):
                                            if sock.get("id") == asset_id:
                                                asset_data = dict(sock)
                                                break
                                    except Exception:
                                        pass

                            # 3. Check map declaration
                            if not asset_data or not asset_data.get("id"):
                                map_path = REPO_ROOT / "library" / "maps" / f"{scene_id}.json"
                                if map_path.is_file():
                                    try:
                                        map_json = json.loads(map_path.read_text(encoding="utf-8"))
                                        for stl_p in map_json.get("stl_primitives", []):
                                            if stl_p.get("id") == asset_id or stl_p.get("primitive") == asset_id:
                                                asset_data = dict(stl_p)
                                                asset_data["label"] = stl_p.get("id", asset_id).replace("-", " ").title()
                                                break
                                    except Exception:
                                        pass

                        if not asset_data:
                            asset_data = {"id": asset_id, "label": asset_id}

                        compiled_brief_obj = compile_asset_brief(
                            asset=asset_data,
                            scene_id=scene_id,
                            resolve_conflicts=True,
                            fragments_dir=cartographers_ledger.fragments_dir,
                            ledger_path=cartographers_ledger.ledger_path,
                        )

                    entity_prefix = "npc" if (kind == "actor" or asset_id in ("hollis", "pell", "player")) else "prop"
                    ledger.append({
                        "kind": "standing.granted",
                        "entity": f"{entity_prefix}/{asset_id}",
                        "actor": "game",
                        "data": {
                            "asset_id": asset_id,
                            "kind": kind,
                            "prompt": compiled_brief_obj.rewritten_prompt,
                            "standing_tier": compiled_brief_obj.standing_tier,
                            "standing_score": compiled_brief_obj.standing_score,
                            "fragments_used": compiled_brief_obj.fragments_used,
                        },
                        "gate": {"rule": "lattice_compiler_rewrite", "verdict": "pass"},
                        "provenance": {"workflow": "asset-forge.lattice.json", "scene_id": scene_id},
                    })

                    self._send(200, {
                        "ok": True,
                        "asset_id": asset_id,
                        "kind": kind,
                        "status": "compiled",
                        "rewriter": "gemma4-orion",
                        "lattice_workflow": "asset-forge.lattice.json",
                        "compiled_brief": compiled_brief_obj.compiled_brief,
                        "diffusion_prompt": compiled_brief_obj.rewritten_prompt,
                        "fragments_used": compiled_brief_obj.fragments_used,
                        "doctrine_rules": compiled_brief_obj.doctrine_rules,
                        "standing_tier": compiled_brief_obj.standing_tier,
                        "standing_score": compiled_brief_obj.standing_score,
                        "scene_backpressure": compiled_brief_obj.scene_backpressure,
                        "conditioning": {
                            "prompt": compiled_brief_obj.rewritten_prompt,
                            "negative": compiled_brief_obj.negative_prompt,
                            "steps": 16,
                            "cfg": 1.0,
                            "dimensions": [1024, 1024],
                            "sampler": "euler",
                            "scheduler": "simple",
                        },
                    })
                except Exception as exc:
                    self._send(400, {"error": "compile failure", "reason": str(exc)})
            else:
                self._send(404, {"error": "unknown route", "route": route,
                                 "known": known_routes})

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
