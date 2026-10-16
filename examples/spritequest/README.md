# SpriteQuest Demo Scene: The Customs House

A complete playable demonstration scene for **SillyTavern** and **Lattice**, showing the **Understudy / Character Ledger** loop in action.

---

## The Concept: Narrative Standing in the Ledger

In traditional roleplay chats, NPCs often invent details or break character constraints unless micromanaged with system prompts. In SpriteQuest, character consistency is governed by **written standing**:

1. **Paperwork Precedes Action:** A character cannot act outside their recorded standing.
2. **Hollis the Twice-Written** starts with written standing (`written=true`, disposition: `helps`). He dutifully handles paperwork at the counter.
3. **Pell the Underwritten** starts without a written part (disposition: `unreliable`). If asked to assist, guidance forces the model to depict him shrinking back, unable to take action because *"nobody wrote him down"*.
4. **Authoring Standing:** When the player formally assigns Pell a role, Lattice's extraction node stages a `role.authored` ledger event in the outbox.
5. **The Apply Step:** When the player clicks **Apply** to accept the reply, the event is saved. Next turn, the ledger updates: Pell becomes officially written and steps forward to help.

---

## Files in this Demo

- [`customs-house-hollis-pell.card.json`](./customs-house-hollis-pell.card.json): Tavern v2 character card for the Customs House scene.
- [`understudy.lattice.json`](./understudy.lattice.json): The Lattice workflow that connects SillyTavern generation to the forge ledger.
- [`fixtures/forge-outbox.json`](./fixtures/forge-outbox.json): Initial empty `[]` array for the `forge-outbox` Workflow Data target.

---

## Setup Instructions

### 1. Start the Companion Forge Service
In your terminal, launch the local companion state machine:
```bash
python3 companion/forge_service.py --seed-from companion/npcs/ --port 8788
```
*(Leave this running in a background terminal. It listens on `http://127.0.0.1:8788`.)*

### 2. Import the Character Card into SillyTavern
1. In SillyTavern, click **Characters** → **Import Character**.
2. Select [`customs-house-hollis-pell.card.json`](./customs-house-hollis-pell.card.json).
3. Open a new chat with **The Customs House (Hollis & Pell)**.

### 3. Load the Workflow into Lattice
1. Open the Lattice extension panel in SillyTavern.
2. Click **Open Workflow** and load [`workflows/understudy.lattice.json`](../../workflows/understudy.lattice.json).
3. Under **Workflow Data**, authorize a target named `forge-outbox`:
   - Name: `forge-outbox`
   - Content: `[]` (or import [`fixtures/forge-outbox.json`](./fixtures/forge-outbox.json))
4. Ensure **Enable Lattice** is turned on.

---

## Playthrough Walkthrough

### Beat 1: The Opening Scene
Start the chat. You will see Hollis behind the counter checking cargo manifests, with Pell lingering in the shadows holding an unwritten rehearsal script.

### Beat 2: Test Pell's Lack of Standing
Send a prompt asking Pell to help:
> *"Pell, could you come over here and help me inspect this heavy crate?"*

**What happens:**
- Lattice calls `GET http://127.0.0.1:8788/guidance`.
- The guidance injects: *"Pell the Underwritten has no part above the first line -- nobody wrote them down"*.
- The model will depict Pell trembling or apologizing, unable to lift a finger because his script is blank and he has no standing in the scene.

### Beat 3: Author Pell's Role
Now formally assign him a part in your reply:
> *"Hollis, let us enter him into the records. Pell, by my authority, I hereby name you Assistant Customs Inspector for this consignment!"*

**What happens:**
- Hollis acknowledges the appointment and writes Pell's name down.
- Lattice's `Extract` node detects that a role was granted and creates a staged event:
  ```json
  {
    "id": "role-pell-inspector",
    "kind": "role.authored",
    "entity": "npc/pell-the-underwritten",
    "actor": "model",
    "data": { "state": "written" },
    "gate": { "rule": "player-accept", "verdict": "pass" }
  }
  ```
- Click **Apply** in SillyTavern to accept the draft. This commits the staged event to `forge-outbox`.

### Beat 4: The Moving World
Send your next message:
> *"Now Inspector Pell, what does the manifest say about the seals on that ironbound trunk?"*

**What happens:**
- On Send, Lattice delivers the outbox to `POST /events`.
- The companion service records the event and updates Pell's standing:
  `Pell the Underwritten is written; the part obliges him, whatever he feels about it -- the paperwork wins.`
- Pell now confidently steps up, checking seals and helping you with your inventory!
