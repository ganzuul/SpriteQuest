#!/usr/bin/env python3
"""
companion/compile_faction_npc.py

Compiles base NPC declaration sheets with NPC Faction templates to produce:
1. A faction-aligned NPC motivation sheet (JSON)
2. A compiled SillyTavern Tavern v2 character card with embedded lorebook (JSON)

Standard library only.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Base directories relative to this file
REPO_ROOT = Path(__file__).resolve().parent.parent
NPCS_DIR = REPO_ROOT / "companion" / "npcs"
CARDS_DIR = REPO_ROOT / "companion" / "cards"
FACTIONS_DIR = REPO_ROOT / "library" / "plans" / "factions"
FRAGMENTS_DIR = REPO_ROOT / "library" / "fragments"


def load_json(path: Path) -> dict:
    """Load JSON from a file with utf-8 encoding."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(data: dict, path: Path) -> None:
    """Save JSON data to path with pretty printing."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def list_factions() -> list[dict]:
    """Return list of available faction plans."""
    factions = []
    if not FACTIONS_DIR.exists():
        return factions
    for fpath in sorted(FACTIONS_DIR.glob("*.json")):
        try:
            data = load_json(fpath)
            factions.append({
                "id": data.get("id", fpath.stem),
                "name": data.get("name", fpath.stem),
                "kind": data.get("kind", "neutral"),
                "path": fpath,
            })
        except (json.JSONDecodeError, OSError):
            continue
    return factions


def list_npcs() -> list[dict]:
    """Return list of base NPC sheets (excluding already-compiled faction variants)."""
    npcs = []
    if not NPCS_DIR.exists():
        return npcs
    for fpath in sorted(NPCS_DIR.glob("*.json")):
        try:
            data = load_json(fpath)
            if data.get("extensions", {}).get("faction_id"):
                continue
            npcs.append({
                "slug": fpath.stem,
                "name": data.get("name", fpath.stem),
                "role": data.get("role", ""),
                "path": fpath,
            })
        except (json.JSONDecodeError, OSError):
            continue
    return npcs


def find_fragment_by_id(fragment_id: str) -> dict | None:
    """Find a fragment JSON file in FRAGMENTS_DIR matching fragment_id ('scope/slug')."""
    if not FRAGMENTS_DIR.exists():
        return None
    # If formatted as scope/slug, check directly
    parts = fragment_id.split("/")
    if len(parts) == 2:
        direct = FRAGMENTS_DIR / parts[0] / f"{parts[1]}.json"
        if direct.exists():
            try:
                return load_json(direct)
            except (json.JSONDecodeError, OSError):
                pass

    # Fallback recursive search
    for fpath in FRAGMENTS_DIR.rglob("*.json"):
        try:
            data = load_json(fpath)
            if data.get("id") == fragment_id:
                return data
        except (json.JSONDecodeError, OSError):
            continue
    return None


def find_fragments_for_world(world_id: str) -> list[dict]:
    """Return all fragment JSON files whose world_id matches world_id."""
    if not world_id or not FRAGMENTS_DIR.exists():
        return []
    fragments = []
    for fpath in sorted(FRAGMENTS_DIR.rglob("*.json")):
        try:
            data = load_json(fpath)
            if data.get("world_id") == world_id:
                fragments.append(data)
        except (json.JSONDecodeError, OSError):
            continue
    return fragments


def compose_npc(base_npc: dict, faction_plan: dict) -> dict:
    """Compose a base NPC sheet with a faction plan into a faction NPC sheet."""
    composition = faction_plan.get("composition", {})

    base_name = base_npc.get("name", "Unnamed")
    base_role = base_npc.get("role", "")
    base_world = base_npc.get("world", "")
    base_style = base_npc.get("style", "")
    base_portrait = base_npc.get("portrait", "")
    base_home = base_npc.get("home", "")
    base_favored = list(base_npc.get("favored_items", []))
    base_aspirations = base_npc.get("aspirations", "")
    base_world_id = base_npc.get("world_id", "")
    written = base_npc.get("written", False)

    # 1. Role composition
    role_suffix = composition.get("role_suffix", "")
    composed_role = f"{base_role}{role_suffix}" if role_suffix else base_role

    # 2. World description
    faction_name = faction_plan.get("name", faction_plan.get("id", "Faction"))
    composed_world = f"{base_world} (aligned with {faction_name})" if base_world else faction_name

    # 3. Visual style overlay
    style_overlay = composition.get("style_overlay", "")
    if base_style and style_overlay:
        composed_style = f"{base_style}, {style_overlay}"
    elif style_overlay:
        composed_style = style_overlay
    else:
        composed_style = base_style

    # 4. Portrait modifications
    portrait_modifiers = composition.get("portrait_modifiers", [])
    if portrait_modifiers:
        mod_str = "; ".join(portrait_modifiers)
        composed_portrait = f"{base_portrait}. Visage modified by {faction_name} alignment: {mod_str}" if base_portrait else mod_str
    else:
        composed_portrait = base_portrait

    # 5. Home / Stationing
    home_overlay = composition.get("home_overlay", "")
    if base_home and home_overlay:
        composed_home = f"{base_home}; currently stationed in {home_overlay}"
    elif home_overlay:
        composed_home = home_overlay
    else:
        composed_home = base_home

    # 6. Favored items
    faction_items = composition.get("favored_items", [])
    seen_items = set()
    composed_favored = []
    for item in faction_items + base_favored:
        if item not in seen_items:
            seen_items.add(item)
            composed_favored.append(item)

    # 7. Aspirations
    aspirations_overlay = composition.get("aspirations_overlay", "")
    if base_aspirations and aspirations_overlay:
        composed_aspirations = f"{base_aspirations} Re-aligned by faction imperatives: {aspirations_overlay}"
    elif aspirations_overlay:
        composed_aspirations = aspirations_overlay
    else:
        composed_aspirations = base_aspirations

    # 8. World ID
    faction_world_id = faction_plan.get("world_id", "shared")

    # Resulting NPC sheet
    composed = {
        "name": base_name,
        "role": composed_role,
        "written": written,
        "world": composed_world,
        "style": composed_style,
        "portrait": composed_portrait,
        "home": composed_home,
        "favored_items": composed_favored,
        "aspirations": composed_aspirations,
        "world_id": faction_world_id,
        "extensions": {
            "base_npc": base_name,
            "base_world_id": base_world_id,
            "faction_id": faction_plan.get("id"),
            "faction_name": faction_name,
            "faction_kind": faction_plan.get("kind", "neutral"),
            "tags": list(composition.get("tags", [])),
        }
    }
    return composed


def compile_tavern_card(
    composed_npc: dict,
    faction_plan: dict,
    include_base_lore: bool = True,
    ledger: Any | None = None,
) -> dict:
    """
    Compile a composed NPC dictionary and faction plan into a Tavern v2 character card.
    Embeds faction fragments and base world fragments into character_book.entries,
    filtering through the CartographersLedger to omit criticized fragments and enrich
    curated fragments with their Canon Warrant provenance.
    """
    if ledger is None:
        try:
            from companion.fragment_compiler import CartographersLedger
            ledger = CartographersLedger()
            ledger.sync_with_filesystem()
        except Exception:
            ledger = None

    name = composed_npc.get("name", "")
    role = composed_npc.get("role", "")
    world = composed_npc.get("world", "")
    description = f"{role} — {world}" if role and world else (role or world or "")
    personality = composed_npc.get("aspirations", "")
    scenario = composed_npc.get("home", "")
    greeting_template = faction_plan.get("composition", {}).get(
        "greeting_template",
        "I am {name}. Our calculations indicate your utility parameters have reached threshold."
    )
    first_mes = greeting_template.format(name=name) if name else ""

    # Favored items and faction tags form the tags array
    tags = list(composed_npc.get("favored_items", []))
    ext_tags = composed_npc.get("extensions", {}).get("tags", [])
    for t in ext_tags:
        if t not in tags:
            tags.append(t)

    # Collect fragments for lorebook
    collected_fragments = []
    seen_frag_ids = set()

    # 1. Faction plan specified fragments
    for frag_ref in faction_plan.get("fragments", []):
        fid = frag_ref.get("id") if isinstance(frag_ref, dict) else str(frag_ref)
        if fid and fid not in seen_frag_ids:
            frag = find_fragment_by_id(fid)
            if frag:
                collected_fragments.append(frag)
                seen_frag_ids.add(fid)

    # 2. Any additional fragments from faction's world_id
    faction_world = faction_plan.get("world_id")
    if faction_world:
        for frag in find_fragments_for_world(faction_world):
            fid = frag.get("id")
            if fid and fid not in seen_frag_ids:
                collected_fragments.append(frag)
                seen_frag_ids.add(fid)

    # 3. Base world fragments if requested
    if include_base_lore:
        base_world = composed_npc.get("extensions", {}).get("base_world_id")
        if base_world and base_world != faction_world:
            for frag in find_fragments_for_world(base_world):
                fid = frag.get("id")
                if fid and fid not in seen_frag_ids:
                    collected_fragments.append(frag)
                    seen_frag_ids.add(fid)

    # Filter through CartographersLedger
    filtered_fragments = []
    curated_warrants = []
    omitted_criticisms = []

    for frag in collected_fragments:
        fid = frag.get("id", "")
        if ledger and fid in ledger.entries:
            entry = ledger.entries[fid]
            mat = entry.get("maturity")
            if mat == "criticized":
                omitted_criticisms.append(fid)
                continue
            if mat == "curated":
                wid = entry.get("warrant_id")
                if wid:
                    curated_warrants.append(wid)
                    frag = dict(frag)
                    frag["warrant_id"] = wid
        filtered_fragments.append(frag)

    # Build character_book entries
    entries = []
    for idx, frag in enumerate(filtered_fragments):
        wid = frag.get("warrant_id")
        note = frag.get("note", "")
        comment = f"[Canon Warrant: {wid}] {note}" if wid else note
        entry_dict = {
            "key": frag.get("id", ""),
            "value": frag.get("detail", ""),
            "comment": comment,
            "enabled": True,
            "insertion_order": idx,
        }
        if wid:
            entry_dict["extensions"] = {"warrant_id": wid, "standing": "warranted"}
        entries.append(entry_dict)

    character_book = {
        "name": f"{name} Lorebook ({faction_plan.get('name', 'Faction')})",
        "description": f"Lorebook entries compiled from {faction_plan.get('name', 'Faction')} and origin world.",
        "scan_depth": 100,
        "token_budget": 2048,
        "recursive_scanning": False,
        "extensions": {
            "faction_id": faction_plan.get("id", ""),
            "cartographers_governance": {
                "curated_warrants": curated_warrants,
                "omitted_criticisms": omitted_criticisms,
            },
        },
        "entries": entries,
    }

    card_data = {
        "name": name,
        "description": description,
        "personality": personality,
        "scenario": scenario,
        "first_mes": first_mes,
        "mes_example": "",
        "creator_notes": f"Compiled faction card for {name} aligned with {faction_plan.get('name', 'Faction')}.",
        "system_prompt": "",
        "post_history_instructions": "",
        "alternate_greetings": [],
        "character_book": character_book,
        "tags": tags,
        "creator": "SpriteQuest Faction Compiler",
        "character_version": "1.0.0",
        "extensions": {
            "world_id": composed_npc.get("world_id", ""),
            "npcs_role": role,
            "npcs_world": world,
            "portrait": composed_npc.get("portrait", ""),
            "style": composed_npc.get("style", ""),
            "faction": composed_npc.get("extensions", {}),
        }
    }

    return {
        "spec": "chara_card_v2",
        "spec_version": "2.0",
        "data": card_data,
    }


def resolve_npc_path(base_arg: str) -> Path:
    """Resolve an NPC path from a filename, slug, or full path."""
    p = Path(base_arg)
    if p.exists() and p.is_file():
        return p
    candidate = NPCS_DIR / f"{base_arg}.json"
    if candidate.exists():
        return candidate
    candidate2 = NPCS_DIR / base_arg
    if candidate2.exists():
        return candidate2
    raise FileNotFoundError(f"Base NPC sheet not found: {base_arg}")


def resolve_faction_path(faction_arg: str) -> Path:
    """Resolve a faction path from a slug, filename, or full path."""
    p = Path(faction_arg)
    if p.exists() and p.is_file():
        return p
    candidate = FACTIONS_DIR / f"{faction_arg}.json"
    if candidate.exists():
        return candidate
    candidate2 = FACTIONS_DIR / faction_arg
    if candidate2.exists():
        return candidate2
    raise FileNotFoundError(f"Faction plan not found: {faction_arg}")


def main():
    parser = argparse.ArgumentParser(description="Compile an NPC with a Faction template into an aligned NPC sheet and card.")
    parser.add_argument("--base", help="Path or slug of the base NPC (e.g. 'hollis' or 'companion/npcs/hollis.json')")
    parser.add_argument("--faction", default="space-vampires", help="Path or slug of the faction plan (e.g. 'space-vampires')")
    parser.add_argument("--out-npc", help="Output path for the compiled NPC sheet JSON")
    parser.add_argument("--out-card", help="Output path for the compiled Tavern v2 card JSON")
    parser.add_argument("--no-base-lore", action="store_true", help="Exclude base NPC's original world fragments from lorebook")
    parser.add_argument("--list-factions", action="store_true", help="List all available factions and exit")
    parser.add_argument("--list-npcs", action="store_true", help="List all base NPCs and exit")

    args = parser.parse_args()

    if args.list_factions:
        factions = list_factions()
        print(f"Available Factions ({len(factions)}):")
        for f in factions:
            print(f"  - {f['id']}: {f['name']} [{f['kind']}] ({f['path'].relative_to(REPO_ROOT)})")
        return

    if args.list_npcs:
        npcs = list_npcs()
        print(f"Available Base NPCs ({len(npcs)}):")
        for n in npcs:
            print(f"  - {n['slug']}: {n['name']} ({n['role']})")
        return

    if not args.base:
        parser.error("Must specify --base NPC (or use --list-npcs / --list-factions)")

    base_path = resolve_npc_path(args.base)
    faction_path = resolve_faction_path(args.faction)

    base_npc = load_json(base_path)
    faction_plan = load_json(faction_path)

    base_slug = base_path.stem
    faction_slug = faction_plan.get("id", faction_path.stem)

    composed_npc = compose_npc(base_npc, faction_plan)
    card = compile_tavern_card(composed_npc, faction_plan, include_base_lore=not args.no_base_lore)

    out_npc_path = Path(args.out_npc) if args.out_npc else NPCS_DIR / f"{base_slug}-{faction_slug}.json"
    out_card_path = Path(args.out_card) if args.out_card else CARDS_DIR / f"{base_slug}-{faction_slug}.card.json"

    save_json(composed_npc, out_npc_path)
    save_json(card, out_card_path)

    print(f"Compiled Faction NPC:")
    print(f"  Base NPC:    {base_npc.get('name')} ({base_path.name})")
    print(f"  Faction:     {faction_plan.get('name')} ({faction_path.name})")
    print(f"  Sheet saved: {out_npc_path.relative_to(REPO_ROOT)}")
    print(f"  Card saved:  {out_card_path.relative_to(REPO_ROOT)}")
    print(f"  Lore entries: {len(card['data']['character_book']['entries'])}")


if __name__ == "__main__":
    main()
