"""
stdlib converter between npcs/*.json motivation sheets and the
SillyTavern Tavern v2 character card format.

Round-trip:
  npcs/hollis.json  <-->  library/plans/st-character-card_template.json

This is pure portability. It does not affect play. The converter maps the
project's NPC declaration fields onto the Tavern v2 card fields so a sheet
can be imported into any ST-class authoring tool and exported back.

Field mapping (npcs -> Tavern v2):
  name          -> name
  role + world  -> description   (who they are + where they live)
  role          -> extensions.npcs_role   (lossless round-trip)
  world         -> extensions.npcs_world  (lossless round-trip)
  aspirations   -> personality   (what drives them)
  portrait      -> extensions.portrait    (image-gen params preserved)
  style         -> extensions.style       (image-gen params preserved)
  home          -> scenario      (the setting/situation)
  favored_items -> tags          (observable details as tags)
  world_id      -> extensions.world_id

Field mapping (Tavern v2 -> npcs):
  name          -> name
  description   -> role + world  (reconstructed from extensions for lossless round-trip)
  personality   -> aspirations
  extensions.portrait -> portrait
  extensions.style -> style
  scenario      -> home
  tags          -> favored_items
  extensions.world_id -> world_id
  character_book.entries -> fragments (informational; written back to library/fragments/)

Fragment-to-lorebook mapping:
  Each fragment whose world_id matches the NPC's world_id becomes a
  character_book.entries entry:
    key       -> fragment.id
    value     -> fragment.detail
    comment   -> fragment.note
    enabled   -> true
    insertion_order -> index
"""

import json
import sys
from pathlib import Path

# Location of the fragment library relative to this tool's directory.
FRAGMENTS_DIR = Path(__file__).resolve().parent.parent / "library" / "fragments"


def _find_fragments_for_world(world_id: str) -> list:
    """Return all fragment JSON files whose world_id matches world_id."""
    if not world_id:
        return []
    fragments = []
    if not FRAGMENTS_DIR.exists():
        return fragments
    for fpath in sorted(FRAGMENTS_DIR.rglob("*.json")):
        try:
            data = json.loads(fpath.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        if data.get("world_id") == world_id:
            fragments.append(data)
    return fragments


def _fragments_to_lorebook(fragments: list) -> dict:
    """Convert a list of fragment dicts into a ST V2 character_book."""
    entries = []
    for idx, frag in enumerate(fragments):
        entries.append({
            "key": frag.get("id", ""),
            "value": frag.get("detail", ""),
            "comment": frag.get("note", ""),
            "enabled": True,
            "insertion_order": idx,
        })
    return {
        "extensions": {},
        "entries": entries,
    }


def npcs_to_card(npcs_path: Path) -> dict:
    """Convert an npcs motivation sheet to a Tavern v2 character card."""
    with open(npcs_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    name = data.get("name", "")
    role = data.get("role", "")
    world = data.get("world", "")
    aspirations = data.get("aspirations", "")
    portrait = data.get("portrait", "")
    home = data.get("home", "")
    favored_items = data.get("favored_items", [])
    world_id = data.get("world_id", "")
    style = data.get("style", "")

    # description: who they are + where they live (display form)
    if role and world:
        description = f"{role} — {world}"
    elif role:
        description = role
    elif world:
        description = world
    else:
        description = ""

    # personality: what drives them
    personality = aspirations or ""

    # scenario: the setting/situation
    scenario = home or ""

    # first_mes: opening greeting. Derive a simple greeting from the name;
    # the author should replace it with the character's actual voice.
    first_mes = f"Hello, I'm {name}." if name else ""

    # tags: observable details
    tags = list(favored_items)

    # extensions: carry over everything we need for lossless round-trip
    extensions = {}
    if world_id:
        extensions["world_id"] = world_id
    if role:
        extensions["npcs_role"] = role
    if world:
        extensions["npcs_world"] = world
    if portrait:
        extensions["portrait"] = portrait
    if style:
        extensions["style"] = style

    # character_book: embed matching fragments as lorebook entries
    fragments = _find_fragments_for_world(world_id)
    character_book = _fragments_to_lorebook(fragments) if fragments else {
        "extensions": {},
        "entries": [],
    }

    return {
        "spec": "chara_card_v2",
        "spec_version": "2.0",
        "data": {
            "name": name,
            "description": description,
            "personality": personality,
            "scenario": scenario,
            "first_mes": first_mes,
            "mes_example": "",
            "creator_notes": "",
            "system_prompt": "",
            "post_history_instructions": "",
            "alternate_greetings": [],
            "tags": tags,
            "creator": "",
            "character_version": "1.0",
            "extensions": extensions,
            "character_book": character_book,
        },
    }


def card_to_npcs(card_path: Path) -> dict:
    """Convert a Tavern v2 character card back to an npcs motivation sheet."""
    with open(card_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    card = data.get("data", {})

    name = card.get("name", "")
    description = card.get("description", "")
    personality = card.get("personality", "")
    scenario = card.get("scenario", "")
    first_mes = card.get("first_mes", "")
    tags = card.get("tags", [])
    extensions = card.get("extensions", {})
    character_book = card.get("character_book", {})

    # Recover role and world from extensions for lossless round-trip.
    role = extensions.get("npcs_role", "")
    world = extensions.get("npcs_world", "")
    if not role and not world and description:
        # Fallback: split description on the first " — " boundary.
        parts = description.split(" — ", 1)
        if len(parts) == 2:
            role = parts[0].strip()
            world = parts[1].strip()
        else:
            role = description.strip()

    # world_id from extensions
    world_id = extensions.get("world_id", "")
    if not world_id:
        world_id = world.lower().replace(" ", "-").replace("'", "") if world else ""

    # portrait and style from extensions
    portrait = extensions.get("portrait", "")
    style = extensions.get("style", "")

    # Reconstruct fragments from character_book.entries (informational).
    # These are written back to library/fragments/ by the caller if desired.
    fragments = []
    for entry in character_book.get("entries", []):
        fragments.append({
            "schema_version": 1,
            "id": entry.get("key", ""),
            "version": 1,
            "world_id": world_id,
            "for": "diffusion",
            "facets": [],
            "detail": entry.get("value", ""),
            "evidence": {
                "kind": "observed",
                "source": "character_book",
                "quote": "",
            },
            "note": entry.get("comment", ""),
        })

    result = {
        "name": name,
        "role": role,
        "world": world,
        "portrait": portrait,
        "home": scenario,
        "favored_items": list(tags),
        "aspirations": personality,
        "world_id": world_id,
        "_fragments": fragments,
    }
    if style:
        result["style"] = style
    return result


def write_fragments(fragments: list, world_id: str) -> None:
    """Write fragment dicts back to library/fragments/<world_id>/.

    Follows the project convention: the filename is the part of the fragment
    id after the last '/', matching existing fragments like
    library/fragments/scaffolded-kingdom/destination-unloadable.json
    whose id is "scaffolded-kingdom/destination-unloadable".
    """
    if not fragments:
        return
    out_dir = FRAGMENTS_DIR / world_id
    out_dir.mkdir(parents=True, exist_ok=True)
    for frag in fragments:
        fid = frag.get("id", "unknown")
        # Filename is the part after the last '/' in the id
        safe_name = fid.rsplit("/", 1)[-1].replace(":", "_")
        out_path = out_dir / f"{safe_name}.json"
        out_path.write_text(
            json.dumps(frag, indent=2) + "\n", encoding="utf-8"
        )


def main():
    if len(sys.argv) != 4:
        print("Usage: convert_character_card.py <direction> <input> <output>")
        print("  directions: to-card (or 'npcs->card'), to-npcs (or 'card->npcs')")
        sys.exit(1)

    direction = sys.argv[1].lower().strip("-")
    input_path = Path(sys.argv[2])
    output_path = Path(sys.argv[3])

    if not input_path.exists():
        print(f"Error: input file not found: {input_path}")
        sys.exit(1)

    if direction in ("to-card", "npcs->card", "npcs-to-card"):
        result = npcs_to_card(input_path)
    elif direction in ("to-npcs", "card->npcs", "card-to-npcs"):
        result = card_to_npcs(input_path)
        # Write fragments back to the fragment library if any were recovered.
        world_id = result.get("world_id", "")
        fragments = result.pop("_fragments", [])
        if fragments:
            write_fragments(fragments, world_id)
    else:
        print(f"Unknown direction: {direction}")
        sys.exit(1)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
        f.write("\n")

    print(f"Converted {input_path} -> {output_path} ({direction})")


if __name__ == "__main__":
    main()
