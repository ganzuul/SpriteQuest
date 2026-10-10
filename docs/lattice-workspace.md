# LATTICE quick start

[Documentation](README.md) · [Operator's manual](operators-manual.md) · [Node reference](node-reference.md)

Begin with two working examples that use no model calls. One assembles a structured writing brief; the other proposes an exact editorial change and lets you review it.

## Open the workspace

Install from `https://github.com/MentallyQuill/Lattice` in SillyTavern's **Extensions → Install extension**, leaving the branch field blank. Reload, then open the LATTICE logo on the left of the chat bar or type `/lattice`.

Fresh launch opens **Structured guidance**, with workflows disabled and no phase assigned. Use **Workflows → Workflow examples…** to install another copy or a different example. Opening, installing, or importing makes no provider request.

The default **Ember** theme follows SillyTavern's panel, text, control and quote colors, with a neutral canvas and translucent node fills. **Tools → Theme and colours** offers eight themes: Ember, Lattice, Ash, Graphite, Slate, Obsidian, Harbor and Signal. Choose one or customize its colors and look.

**Harbor** uses blue and amber, while **Signal** uses high contrast grayscale. Both identify connection types with labels, distinct pin shapes and wire patterns. Their visible picker legend explains the cues; example thumbnails use the same shapes and patterns.

## Build and inspect a brief

The example is:

```text
Compose (JSON source) → JSON Decode → Select Fields → Compose (Guidance) → Guidance
```

1. Click **Run**. Select each node to see its recorded result in Preview.
2. Select the first **Compose**. In **Sections**, change the JSON's `direction` and `constraint` strings. Keep the JSON valid, then click **Save Sections**.
3. Run again. Select the second **Compose** and inspect the Guidance artifact.
4. Experiment with another field, such as `tone`: add it to the source JSON, add a mapping in Select Fields, and add `Tone: {{data:/tone}}` to the final template.

![Structured guidance after a run, with Compose settings and the composed brief visible](images/workspace-overview.png)

*The captured example adds tone and uses synthetic harbor-scene material. The supplied starter begins with direction and constraint.*

This example needs no connection profile or existing reply. A manual run previews the brief. To use it with normal sends, open Setup, assign the pre phase and enable workflows. Send executes the configured pre workflow and installs its optional guidance for that generation.

## Propose an exact reply edit

Install **Literal cleanup** and wait for a completed text-only assistant reply. Its rule changes `very very` to `very`; a reply without that phrase proposes no change.

1. Select **Text Rules**. Inspect Draft input, replace mode, and the Rules JSON.
2. If needed, change the literal pattern/replacement to text in your latest reply, then click **Save Rules**.
3. Click **Run**.
4. Select **Apply Reply · Host result** in Preview output.
5. Read `original`, revised `text`, and changes in its candidate artifact. Choose **Apply reviewed candidate** or **Reject candidate**.

![Literal cleanup showing connected edit, validation, review, and application stages](images/text-rules-graph.png)

*Text Rules proposes Patches. The downstream stages validate and expose a reviewed root result; they do not automatically edit the reply.*

Apply rechecks the source and creates a new swipe preserving the original. Editing the source or switching chat/swipe may invalidate the candidate. See [reply review and persistence limits](native-workflows.md#review-a-reply-repair).

## Explore the toolset

| Example | Phase | Maximum auxiliary calls |
| --- | --- | ---: |
| [Structured guidance](../workflows/structured-guidance.json) | Pre | 0 |
| [Literal cleanup](../workflows/literal-cleanup.json) | Post | 0 |
| [Scene guidance](../workflows/native-guidance.json) | Pre | 2 |
| [Reviewed AI De-slop](../workflows/reviewed-de-slop.json) | Post | 1 |

For model-backed examples, bind **Analysis** or **Prose** in Setup. Details allows per-operation profile/model overrides. Manual runs can spend tokens, and Send does not reuse a manual guidance result.

Next, read the [operator's manual](operators-manual.md) to discover nodes, connect pins, open subgraph tabs, customize instances, and inspect recorded outputs. Use the [node reference](node-reference.md) to design a process beyond the starter examples.
