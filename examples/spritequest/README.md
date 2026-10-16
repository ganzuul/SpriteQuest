# SpriteQuest Demo Scene: The Customs House

A complete, 100% native demonstration scene for **SillyTavern** and **Lattice**, showing the **Understudy / Character Ledger** loop in action without requiring any external services or custom node types.

---

## The Concept: Narrative Standing in the Ledger

In traditional roleplay chats, NPCs often invent details or break character constraints unless micromanaged with system prompts. In SpriteQuest, character consistency is governed by **written standing**:

1. **Paperwork Precedes Action:** A character cannot act outside their recorded standing.
2. **Hollis the Twice-Written** starts with written standing (`written; the part obliges him -- the paperwork wins`). He dutifully handles paperwork at the counter.
3. **Pell the Underwritten** starts without a written part (`unwritten; has no part above the first line -- nobody wrote him down`). If asked to assist, guidance forces the model to depict him shrinking back, unable to take action because he has no standing.
4. **Authoring Standing:** When the player formally assigns Pell a role, Lattice's `Extract` node detects the new role and stages an event.
5. **The Apply Step:** When the player clicks **Apply** to accept the reply, `Write to File` commits the updated standing into SillyTavern's Workflow Data. Next turn, Pell's status updates, and he steps forward to help.

---

## Files in this Demo

- [`customs-house-hollis-pell.card.json`](./customs-house-hollis-pell.card.json): Tavern v2 character card for the Customs House scene.
- [`understudy.lattice.json`](./understudy.lattice.json): Native Lattice workflow graph (100% standard nodes).
- [`fixtures/character-standing.json`](./fixtures/character-standing.json): Initial standing records for the `character-standing` Workflow Data document.

---

## Setup Instructions

### 1. Import the Character Card into SillyTavern
1. In SillyTavern, click **Characters** → **Import Character**.
2. Select [`customs-house-hollis-pell.card.json`](./customs-house-hollis-pell.card.json).
3. Open a new chat with **The Customs House (Hollis & Pell)**.

### 2. Authorize the Character Standing Data in Lattice
1. Open the **Lattice** side panel in SillyTavern.
2. Under **Workflow Data**, click **Add Target / Document**:
   - **Document Name**: `character-standing`
   - **Logical Target ID**: `character-standing`
   - **Format**: `JSON`
   - **Visibility**: `Public`
   - **Initial Template**: Paste the contents of [`fixtures/character-standing.json`](./fixtures/character-standing.json):
     ```json
     [
       {
         "id": "hollis",
         "text": "Hollis the Twice-Written (Quartermaster): written; the part obliges him, whatever he feels about it -- the paperwork wins."
       },
       {
         "id": "pell",
         "text": "Pell the Underwritten (Understudy): unwritten; has no part above the first line -- nobody wrote him down; he is unreliable and cannot take action."
       }
     ]
     ```
   - Click **Save Authorization**.

### 3. Load the Workflow into Lattice
1. In the Lattice panel, click **Open Workflow** and load [`workflows/understudy.lattice.json`](../../workflows/understudy.lattice.json).
2. Ensure **Enable Lattice** is turned on.

---

## Playthrough Walkthrough

### Beat 1: The Opening Scene
Start the chat. You will see Hollis behind the counter checking cargo manifests, with Pell lingering in the shadows holding an unwritten rehearsal script.

### Beat 2: Test Pell's Lack of Standing
Send a prompt asking Pell to help:
> *"Pell, could you come over here and help me inspect this heavy crate?"*

**What happens:**
- Lattice reads `character-standing` and injects it into generation guidance.
- The model depicts Pell trembling or apologizing, unable to lift a finger because his script is blank and he has no standing in the scene.

### Beat 3: Author Pell's Role
Now formally assign him a part in your reply:
> *"Hollis, let us enter him into the records. Pell, by my authority, I hereby name you Assistant Customs Inspector for this consignment!"*

**What happens:**
- Hollis acknowledges the appointment and writes Pell's name down.
- Lattice's `Extract` node detects that a role was granted and creates a staged entry:
  ```json
  {
    "id": "role-pell-inspector",
    "text": "Pell is appointed Assistant Inspector by authority of the traveler."
  }
  ```
- Click **Apply** in the Review / Publish card to accept the draft. This commits the staged update to `character-standing`.

### Beat 4: The Moving World
Send your next message:
> *"Now Inspector Pell, what does the manifest say about the seals on that ironbound trunk?"*

**What happens:**
- On Send, Lattice reads the updated `character-standing`.
- Pell now possesses an authored role, steps forward confidently, and assists with the cargo!
