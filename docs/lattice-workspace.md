# LATTICE quick start

[Documentation](README.md) · [Unified workflows](unified-workflows.md) · [Operator's manual](operators-manual.md) · [Node reference](node-reference.md)

Start with one unified graph around ordinary SillyTavern generation.

## Open the workspace

Install from `https://github.com/MentallyQuill/Lattice` in SillyTavern's **Extensions → Install extension**, leaving the branch field blank. Reload, then open the LATTICE logo on the left of the chat bar or type `/lattice`.

Fresh launch opens **Unified story workflow**, with Lattice disabled. Existing installations restore their unified recovery draft; previous unified documents are available through **File → Recover previous workflows**. **File → Open examples…** offers [30 numbered unified lessons](examples.md), searchable by goal or technique and filterable by difficulty. Opening a lesson creates an independent editable active document. Opening and importing make no provider request and do not change **Enable Lattice**.

Use **File → Save workflow** or **Save As…** to save the editable document to disk. Browsers without direct file access offer **Download JSON…** instead. A recovery draft retains committed work across reloads; it does not save the file on disk. **Open Recent** reopens previously accessed files in supported browsers. See [save, import, and share](operators-manual.md#save-import-and-share) for modified-document prompts and recovery.

The menu bar contains **File**, **Edit**, **View**, **Graph**, **Workflow** and **Help**. Use **Graph → Add node…** to search for nodes and subgraphs, and **View → Fit graph** or **Fit selection** to recover your position.

The default **Ember** theme follows SillyTavern's panel, text, control and quote colors. **View → Theme and colours…** offers Ember, Lattice, Ash, Graphite, Slate, Obsidian, Harbor and Signal. Harbor and Signal also identify connection types with labeled pins, distinct shapes and wire patterns.

## Run your first unified workflow

The starter is **On Send → Generate Reply · SillyTavern → Review / Publish**. It makes no auxiliary model requests; the ordinary reply uses your SillyTavern connection.

1. Open your story and select its native character in SillyTavern.
2. Keep the starter open, then select **Enable Lattice**.
3. Send a player message normally. The starter waits for that generation's completed Draft and records its review result.
4. Select **Review / Publish · Host result** in Preview. Compare the original and candidate. **Apply reviewed candidate** preserves the original as a swipe and publishes the chosen result; **Reject candidate** leaves it alone.
5. Open a recipe to add preparation, prose editing or notes. Choose ordinary model connections on their node bars and configure For Each helper roles in Details before sending. Automatic Story Clock, Read File and Outcome Commit defaults need no setup. Authorize custom document targets in **Workflow → Configure → Workflow Data…**.

Full execution starts with the native generation owned by Send. Stop cancels active work. **Run to here** previews a selected output's supported dependencies without accepting effects or publishing guidance.

### Use automatic Workflow Data

Add **Story Clock** to use **Chat clock**, starting on Day 1 at 00:00 with a 24-hour day. **Read File** uses empty plain-text **Chat notes**, and **Outcome Commit** uses an empty JSON **Chat outcomes** list. The unified workflow supplies the referenced defaults for the active user/chat when they are needed. You can add and connect these nodes without visiting a setup dialog.

Select the node to customize it in Details. **Starting values** controls the clock’s starting day, time and hours per day; the other nodes offer initial content or outcomes. Open **Advanced** to choose a shared source, create a separate one with **+**, and adjust **Format** or **Visibility**. Visibility has Public, Hidden and Actor private buttons; the private option also needs its actor ID. Clock and outcomes data keep their required JSON format, while notes offer the supported document formats. Use **Save settings** to apply your changes.

Nodes selecting the same clock share its saved timeline. Separate clocks advance independently; they do not synchronize automatically. Initial values only seed data that has not been saved yet, so editing them preserves existing saved time, notes and outcomes. **Workflow → Configure → Workflow Data…** remains available for custom target management.

## Build and inspect a brief

Add a Preparation-stage Compose Text source, JSON Decode, Select Fields and Compose Guidance. Connect the selected fields to the final Compose's Data pin, then connect Guidance to Generate Reply's guidance pin. In the source JSON, supply direction, constraint and an optional tone. Use template placeholders such as `{{data:/direction}}`.

![Structured composition inspected with Run to here, showing the composed brief and Compose settings](images/workspace-overview.png)

*This synthetic authoring fixture demonstrates structured composition. Select its Compose Guidance output and use Run to here to inspect the brief without requesting a native reply.*

## Inspect an editorial process

Text Rules and Transpose can inspect or propose source-bound Patches in the Response stage. Validate Patches and Review Gate preserve the original and expose candidate diagnostics. These patch diagnostics do not grant Apply authority. For publication, process the owned Generate Reply Draft and end the final Draft in **Review / Publish**.

![Text Rules connected to deterministic patch validation and candidate inspection](images/text-rules-graph.png)

*The synthetic cleanup fixture proposes Patches. Run to here lets you inspect exact replacements and protected text without publication.*

See [reply review](native-workflows.md#review-a-reply-repair) and the [unified guide](unified-workflows.md) for current publication, actor authority and accepted effects.

## Recover an older setup

Retired pre/post roots are preserved in a cold archive. **File → Export archived workflows** downloads their original graphs, bindings and active selection for recovery. They cannot execute or import as current roots. Rebuild useful logic in a new unified graph with explicit Preparation/Response stages and Review / Publish. There is no automatic conversion or model request during recovery.

Read the [operator's manual](operators-manual.md) to connect pins, open subgraph tabs, customize instances and inspect recorded outputs.
