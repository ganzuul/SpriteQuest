# Compose

Compose brings pieces of text together. Use it to build a prompt, combine notes, or prepare instructions for the next reply. It uses the text and values you supply; it does not ask a model to write new material.

The workshop preview shows a fixed Compose node here, above **How to use it**.

## How to use it

Add a section for each piece of text you want to include. You can write its text directly or connect a Text output to the section's input. Save new sections before connecting their inputs. A connected value replaces the text saved in that section.

Choose **Join** to put sections together in order, or **Template** to arrange them in a format you write. Choose **Text** for ordinary text, or **Guidance** for instructions that feed Generate Reply.

<details open>
<summary>Settings and options</summary>

| Setting | What it does |
| --- | --- |
| **Mode** | **Join** combines the sections from top to bottom. **Template** fills named placeholders in your own layout. |
| **Output** | **Text** can feed other text inputs. **Guidance** supplies instructions for Generate Reply and is available in Preparation. |
| **Workflow stage** | Use **Preparation** before Generate Reply or **Response** after it. Text works in either stage; Guidance works only in Preparation. |
| **Sections** | Each section has a unique **Name**, such as `Direction`, and saved **Text** used when its input is not connected. Names use A–Z, a–z, digits, and underscores, and start with a letter or underscore. Add, remove, or reorder sections, then choose **Save Sections**. **Edit JSON** offers another way to edit the same list. |
| **Separator** | In Join mode, this text goes between sections. The default is a blank line. Find it inside the **Output** settings group. |
| **Template** | In Template mode, write the layout and insert values with placeholders. `{{section:Direction}}` inserts a section; `{{data:/tone}}` inserts the `tone` field from a connected Data input. |

</details>

<details>
<summary>Example: give a scene a clear direction</summary>

The example canvas shows the complete [workflow](compose-example.lattice.json): **On Send → Generate Reply → Review / Publish**, with **Text → Compose** supplying Generate Reply's **Guidance**.

The Text node supplies “Describe the dark lighthouse and one sound from the water.” Compose adds a second section named **Boundary**, containing “Leave the player's next action to them.”

Compose uses **Mode → Join**, **Output → Guidance**, and the default **Separator**. Text is connected to **Direction**, and Compose is connected to Generate Reply's **Guidance**.

**Add example to current tab** appears in the canvas footer. The workshop button demonstrates the addition locally; integration into the app is pending. The planned action adds the full workflow to an empty root. In a compatible workflow, it keeps the existing On Send, Generate Reply, and Review / Publish nodes, adds Text and Compose, and connects Guidance automatically. An occupied Guidance input, incompatible view, or read-only destination disables the action with a reason.

To run the example in Lattice now:

1. Import [compose-example.lattice.json](compose-example.lattice.json) into an empty root workspace.
2. Enable Lattice.
3. Send an ordinary chat message. Generate Reply uses the assembled Guidance, and Review / Publish prepares its reply for review.
4. Inspect the result and choose **Apply reviewed candidate** in Preview when it is ready.

Optionally, choose **Run to here** on Compose first to preview its instruction without generating a reply. The recorded Compose output is:

```text
Describe the dark lighthouse and one sound from the water.

Leave the player's next action to them.
```

The recorded Compose output confirms the assembled instruction. Mock host checks cover workflow execution; a real generated reply requires a live host run.

</details>

## When you use Template

Only values you reference are included; unused sections are not added automatically. Use `{{data:/scene/tone}}` for a nested field or `{{data:}}` for the whole Data value. Missing section names or fields stop Compose with an error. These placeholders insert values; they do not run scripts or SillyTavern macros. Write `{{{{` to include a literal `{{`.

With **Text** output, the shared **Modifiers** controls can adjust the assembled text afterward, for example by trimming it or adding a prefix.
