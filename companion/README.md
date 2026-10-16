# SpriteQuest Companion Service

This directory holds the companion backend service and character declarations for SpriteQuest's SillyTavern integration.

## What It Does

In SpriteQuest, characters have narrative "standing" tracked via an append-only ledger (`hollis-ledger.jsonl`):
1. **Seeded State**: Characters like Hollis the Quartermaster are seeded with authored standing (`"written": true`), while characters like Pell the Underwritten start unwritten (`unreliable`).
2. **Guidance on Send**: SillyTavern calls `GET /guidance` (via Lattice `Service Call` nodes) to retrieve current roster standing and prompt constraints.
3. **Draft Event Extraction**: Replies propose ledger events (e.g., granting a character their part, or changing grudges).
4. **Player Accept / Apply**: Accepted events are posted to `POST /events`, updating the roster state idempotently.

This loop is implemented as the Lattice workflow [`workflows/understudy.lattice.json`](../workflows/understudy.lattice.json).

## Contents

- `forge_service.py`: Local HTTP microservice exposing `/health`, `/roster`, `/guidance`, `/ledger`, and `/events`.
- `schemas.py`: Data structures (`EventRecord`, `Gate`, `fold_events`) modeling event validation and character folding.
- `demo_forge.py`: Playable standalone 5-beat walkthrough demonstrating the full loop.
- `test_forge_service.py`: Integration test suite for the forge HTTP server.
- `convert_character_card.py`: Bidirectional converter between `companion/npcs/*.json` and Tavern v2 character cards.
- `npcs/`: Character declaration JSON files.
- `worldpack.json`: World identifiers and register metadata.

## Usage

### Run the Demo
```bash
python3 companion/demo_forge.py
```

### Run Tests
```bash
python3 companion/test_forge_service.py
```

### Run the Service for SillyTavern / Lattice
```bash
python3 companion/forge_service.py --seed-from companion/npcs/ --port 8788
```
