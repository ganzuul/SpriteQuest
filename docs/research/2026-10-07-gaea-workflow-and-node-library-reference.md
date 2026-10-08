# Gaea reference for ComfyTavern workflow discovery

Research date: October 7, 2026. Status: reference research with user-selected family names; family contents and behavior remain proposals, not an approved UI or runtime implementation spec.

## Intent

The user wants a toolbox whose vertically ordered families suggest how to build a workflow, drawing on QuadSpinner Gaea 2 and Gaea 3. This extends the approachability goal: help a newcomer choose a useful operation before requiring knowledge of node names or wiring.

The user selected these exact one-word family names, in this order: **Input, Shaping, Surface, Transpose, Derive, Output**. Technical wording is acceptable. Keep short descriptions and descriptive operation names available to explain each family's purpose.

Keep the current [host-owned pre/post workflow recommendation](2026-10-07-comfytavern-approachability-and-workflows.md). Organizing the library does not require taking over SillyTavern's prompt assembler. The separate UI Performance task owns the Svelte migration; this document proposes discovery behavior and metadata for later coordination.

## What the references establish

### A functional family rail

Gaea calls this part of the interface the Toolbox. Its [official full-interface screenshot](https://docs.gaea.app/.data/ui/complete-ui.png) shows it inside the graph area, beside a preview, a selected-node property panel, and a project tree. The screenshot identifies its build as 2.2.7.0 Dev; it is a published reference image, not a capture of an installed current build.

The [expanded toolbox image](https://docs.gaea.app/.data/ui/interface/graph/toolbox-and-search/gaea-untitled.webp) shows this vertical order:

```text
Primitive
Terrain
Modify
Surface
Simulate
Derive
Colorize
Output
Utility
```

The [current node-family reference](https://docs.gaea.app/reference/nodes/) also lists Macro. It describes families in terms of the task a user wants to perform. This supports the user's recollection of a catalog that roughly follows a construction process. Utility and reusable components are cross-cutting tools, so the catalog is not a mandatory sequence.

The [nested toolbox screenshot](https://docs.gaea.app/.data/ui/interface/graph/toolbox-and-search/gaea-untitled-02.webp) shows a family opening subcategories and then a list of individual operations. It is a rail with nested menus, rather than evidence of a literal accordion-drawer interface. ComfyTavern can adapt the family idea into drawers if that is clearer for its audience.

Gaea's [graph documentation](https://docs.gaea.app/ui/interface/graph/index.html) describes graph flow as left to right. The vertical ordering belongs to the toolbox; copying it does not require a vertical execution graph.

### Discovery and less manual wiring

The [Toolbox and Search documentation](https://docs.gaea.app/ui/interface/graph/toolbox-and-search.html) describes family colors/icons, several toolbox layouts, node creation by click or drag, connection when a node is dropped onto another, search that includes presets, and optional local suggestions learned from creation/connection patterns. Its [toolbox settings](https://docs.gaea.app/ui/interface/options/toolbox.html) offer nested or flat organization and optional family names in search results.

The [graph conveniences guide](https://docs.gaea.app/ui/graph/basic-workflow/graph-conveniences.html) adds insertion into an existing connection, creation of a node chain, combining outputs, navigation through connections, upstream/downstream selection, groups, and automatic layout. These conveniences make a catalog useful during graph editing, rather than only when starting an empty graph.

### A short learning path and reusable components

Gaea's [starter guide](https://docs.gaea.app/using/getting-started/index.html) teaches with a three-node terrain: Mountain, Adjust, then Erosion_2. Each step has a visible purpose and result. The transferable lesson is a complete small example with understandable stages.

[Macro authoring](https://docs.gaea.app/developers/extensibility/macros/building-macros.html) describes packaging a graph behind named ports and exposed controls, with export metadata and installation. The [2.3 release announcement](https://blog.quadspinner.com/gaea-2-3-now-available/) confirms Macros as an introduced feature, despite the authoring page retaining older scheduled wording. Its [Macro guidance](https://docs.gaea.app/developers/extensibility/macros/best-practices.html) emphasizes meaningful names, parameter compatibility, and export/reload validation.

This is a useful reference for ComfyTavern components: a simple control surface can represent a reusable, inspectable workflow. It requires a component contract beyond today's copied node groups.

### Small adjustments and focused inspection

The [Modifier Stack](https://docs.gaea.app/ui/interface/property-editor/modifier-stack.html) applies ordered adjustments to a node's output and keeps small refinements out of the main graph. Reordering can change the result.

[Lock Preview](https://docs.gaea.app/ui/graph/basic-workflow/lock-preview.html) keeps the viewport focused on a selected result while upstream changes propagate. These patterns make editing focused: users can adjust one part and inspect the result they care about.

### Gaea 3 as an evolving reference

QuadSpinner's [Gaea 3 page](https://www.quadspinner.com/Gaea3) currently describes Early Access and warns that some listed information may be outdated. Its published workflow material includes unified command search, context-sensitive controls, template collections, customizable layout, and compact UI.

I inspected its official [Command Bar image](https://cdn.gaea.app/web2026/img/gaea3/command-bar.png) and [toolbar image](https://cdn.gaea.app/web2026/img/gaea3/Toolbar_Contents%402x.png). They support search across different item kinds and compact graph controls. They do not establish a finalized Gaea 3 family hierarchy. Use the documented Gaea 2 toolbox for that concrete reference, and treat Gaea 3 material as evolving inspiration. The official page also links an Early Access preview video; this research did not watch or test it.

## Selected ComfyTavern families and proposed contents

### User-supplied node-building video

The [Gaea 2 clip supplied by the user](https://cdn.gaea.app/web2025/mp4/Gaea_Web2_1080p.mp4) is about 20.47 seconds long. I inspected timeline samples and detailed frames. Its visible build label is 2.2.0.0 Dev. Approximate landmarks:

| Time | Visible behavior |
| --- | --- |
| 02–04 seconds | Mountain source, selected-node properties, search beside the node |
| 04–09 seconds | Processing steps added to a connected chain |
| 09–14 seconds | Shaping stages and parameter changes with terrain previews |
| 16–20 seconds | Color/finishing stages and final terrain inspection |

The persistent family rail, compact graph, large result preview, and separate property panel remain visible. The clip supports studying construction and feedback together. It is promotional material, not a latency benchmark or proof of every mouse/keyboard gesture.

For ComfyTavern, use this to explore an **Add next step** action near a node or connection, with phase/type-compatible suggestions, a visible insertion preview, and an inspector that edits the chosen operation. Preserve a result panel while users build the chain. These are proposed adaptations; the video does not establish how LLM costs, execution, or chat commits should work.

### Translating terrain language into writing operations

The user's [Crafting the Surface reference](https://docs.gaea.app/using/using-gaea/crafting-the-surface/index.html) adds a useful distinction: establish the broad form, then work on its surface character. The linked [Surface Nodes guide](https://docs.gaea.app/using/using-gaea/crafting-the-surface/surface-nodes.html) separates overall volume from surface treatment. [Transpose Shapes](https://docs.gaea.app/using/using-gaea/crafting-the-surface/transpose-shapes.html) describes transferring surface character from a reference terrain onto a target while preserving the target's volume.

For ComfyTavern, the proposed analogy is **content and intent versus expression**. A response plan can describe events, facts, character intentions, and constraints. A style pass can work on voice, rhythm, diction, imagery, or dialogue. These can be separate, inspectable artifacts rather than one opaque instruction block.

Use the user's selected one-word family names. The following purpose descriptions and example operations are proposed contents for those families:

| Concept | Selected family | Example role |
| --- | --- | --- |
| Primitive or imported material | **Input** | Read a message, character field, reference passage, or completed reply |
| Broad form | **Shaping** | Select and organize context; establish response structure, intent, events, and constraints |
| Surface treatment | **Surface** | Adjust voice, diction, rhythm, imagery, and dialogue |
| Reference transfer | **Transpose** | Apply a reference style or template to target content |
| Derived information | **Derive** | Extract facts, constraints, summaries, or a reusable style brief |
| Finished or intermediate results | **Output** | Inspect, compare, expose guidance, or explicitly accept a result |

These are analogies, not a one-to-one terrain taxonomy or guarantees of equivalent behavior. A model can alter facts during a stylistic rewrite. An Apply Style operation should expose the original, reference, candidate, and preservation instructions, with comparison before acceptance. A later checker can flag differences; its result is another assessment, not proof that meaning is unchanged.

A style reference can also guide the native writer before generation. For example, a reusable style brief can feed ComfyTavern's named guidance alongside a response plan; after generation, a reference-guided revision can be an optional separate branch. Neither use requires decomposing the entire SillyTavern preset or replacing native prompt assembly.

Family labels stay technical and one word; operation labels can be descriptive, such as Response Plan, Apply Style, Extract Facts, and Compare Results. The proposed distinction between **Surface** and **Transpose** is expression adjustment versus reference-guided adaptation: Improve Dialogue belongs under Surface, while Apply Reference Style belongs under Transpose. Descriptions and search synonyms can explain this without changing the chosen labels.

### Selected family order

The names and display order are selected. The following catalog entries are proposals, not a list of implemented nodes. Start with a few supported operations and grow their families as real recipes require them.

| Order | Family | Question it answers | Example entries |
| --- | --- | --- | --- |
| 1 | **Input** | What material will this pass use? | Latest user message, recent conversation, character fields, completed reply, reference passage |
| 2 | **Shaping** | What should the response contain, and how should it be organized? | Select message window, combine context, build an auxiliary prompt, plan a response |
| 3 | **Surface** | How should that content read? | Refine prose, adjust tone, improve dialogue, change descriptive detail |
| 4 | **Transpose** | What reference should influence this content? | Apply reference style, adapt to a reference template |
| 5 | **Derive** | What information can I extract from this material? | Extract facts, summarize context, identify constraints, derive a style brief |
| 6 | **Output** | Where should the result go, and what will I inspect or accept? | Inspect result, install named guidance, compare original/candidate, apply as a new swipe |

Routing tools and reusable components remain available through search and contextual tools. They are useful in several stages. Any additional family name would be a separate design decision; the selected family rail contains the six names above.

Put **Starter workflows** and **Favorites** above or beside the family browser. A user who wants a working example should not have to assemble one from the catalog first. Search should find both individual operations and templates, with visibly distinct result kinds.

### Phase-aware choices

The lifecycle still has a native generation boundary. One possible guidance workflow and its optional revision branch are:

```text
Input (conversation) -> Shaping (response plan) -> Output (named guidance)
    -> [SillyTavern assembles and generates one native reply]

Input (completed reply) -> Surface or Transpose (revision)
    -> Output (compare and apply)
```

The native reply is a handoff, not another detached Generate request. A pre-reply phase should not offer the current completed reply as an available input. An after-reply phase should make that source easy to find. Some operations can be valid in either phase; family and phase are separate metadata. Derive can feed Shaping or Transpose even though it appears lower in the family rail. Output can expose pre-reply guidance or an after-reply candidate; applying to chat is a specific operation, not an automatic consequence of reaching this family.

Library order teaches a likely construction path. It does not define execution order or force users to include every shelf. Keep the existing coordinate-based semantics intact during the UI migration; any later execution-order change needs a separately coordinated runtime contract.

### Keep the operation model small

Analyze scene, plan response, and critique reply can initially be authored configurations of a shared model-call operation. Each can have appropriate instructions, inputs, output contract, profile binding, and help text. Family organization does not require a separate engine implementation for every menu entry.

Model selection belongs in the operation's setup or inspector. It does not need to occupy a mandatory shelf of model nodes. Each operation should show whether it adds a request, and each reusable component should expose the requests and effects inside it.

### Adapt Gaea's conveniences deliberately

| Reference pattern | ComfyTavern proposal |
| --- | --- |
| Family rail and nested menus | Labeled expandable shelves, with icons/colors as secondary cues; add subfamilies when the catalog warrants them |
| Search and creation beside a connection | Suggest operations compatible with the selected port and phase; use deterministic compatibility rules first |
| Automatic connection or insertion | Offer a clear insertion preview; connect automatically only where compatible input/output selection is unambiguous |
| Presets and short example graphs | Provide a working guidance workflow and a reviewed prose-revision workflow before requiring manual graph creation |
| Reusable Macro | Named ports, exposed settings, versioned component metadata, and visible internal steps |
| Modifier Stack | Compact deterministic text/data adjustments with inspectable order; keep model requests and writes visible |
| Focused preview | Pin an artifact or comparison panel while editing; show its source run and whether it is stale |

ComfyTavern should not copy automatic terrain recomputation into paid model execution. Editing settings can refresh deterministic previews and invalidate old results; executing a model stage remains an explicit action or part of an enabled chat workflow. Do not assume that a matching input makes a fresh model result deterministic.

Suggested stage recommendations do not need a learning system in the first delivery. Allowed input types, phase, and a small curated successor list can provide understandable next-step suggestions. Favorites and recent items can make frequent choices quick without a larger prediction subsystem.

### Node context menus and experimenting in place

The user's attached Gaea screenshot shows Refresh, Reset, Rename, Duplicate, Bypass, Bookmark, Lock Preview, Use as Underlay, Exclude from Underlay, Mark for Export, Replace, Insert chokepoint, Manage Portals, Delete, Copy Properties, Paste Properties, and Show Locked 2D Viewport. This is evidence of the visible menu, not a test of every command. Gaea's [menu documentation](https://docs.gaea.app/ui/interface/menus-and-toolbars/main-menu.html) describes node refresh, bypass, locked preview, export marking, bookmarks, and property copying; its [Property Editor Toolbar](https://docs.gaea.app/ui/interface/menus-and-toolbars/property-editor-toolbar.html) describes related-node replacement, defaults, saved settings, and node help.

The useful design principle is that the graph offers ways to experiment with a stage where it sits, alongside the library used to create it. Proposed adaptations:

| Reference action | ComfyTavern action | Proposed behavior |
| --- | --- | --- |
| Lock Preview | **Pin result** | Keep a selected run artifact in the result panel; show its run and freshness |
| Use as Underlay | **Use as comparison baseline** | Compare a selected artifact with another result; selecting a baseline makes no model request |
| Bypass | **Bypass step** | Forward a declared compatible input to output without executing that operation |
| Replace | **Replace step…** | Offer compatible operations; preserve only explicitly mapped connections and settings, with undo |
| Refresh | **Run step again** | Make an explicit new request using identified inputs; preserve the prior artifact for comparison |
| Reset | **Reset settings** | Restore operation defaults, with undo, without executing it |
| Copy/Paste Properties | **Copy/Paste settings** | Transfer compatible configuration fields, without credentials or run artifacts |
| Bookmark | **Bookmark step** | Provide quick navigation to an important step; distinct from saving a reusable library item |
| Mark for Export | **Expose named result** | Make an intermediate artifact available in a results list; chat application remains a separate action |
| Insert chokepoint | **Insert junction** | Add a neutral routing point for a result shared by several branches |
| Manage Portals | **Named connections** | A possible later way to reuse a visible, traceable source across graph areas |

The current checked-out fork already implements Copy, Save to library, Duplicate, Duplicate with inputs, Switch on/off, Wire into Output, and Delete in [the node context menu](../../src/ui.js). It also offers group and connection actions. Extend this existing interaction rather than treating context menus as a new subsystem. These observations describe the current main checkout; they do not assert what the concurrently migrating Svelte worktree currently renders.

**Disable and bypass need distinct behavior.** In [the compiler](../../src/compile.js), a switched-off Generate node contributes no result; it does not automatically route its input onward. A pass-through bypass needs a declared input/output mapping. A prose revision could forward its original draft. An analysis step producing structured guidance may have no compatible input to forward; its menu should explain why bypass is unavailable. Existing Switch off must retain its meaning.

**Inspection comes before rerunning.** Add access to available inputs, the constructed auxiliary request, returned output, profile, errors, and available usage/timing information. Missing traces should be labeled unavailable rather than reconstructed as if captured. A pinned artifact is not frozen computation. Editing inputs or rerunning a stage can make dependent artifacts stale; selecting a preview must not trigger a paid call or install guidance, save memory, or apply a reply. Dependency-aware partial reruns require a runtime contract and are not a simple menu-only change.

**Chokepoints are routing, not saved execution checkpoints.** Gaea's [Chokepoint reference](https://docs.gaea.app/reference/nodes/utility/chokepoint.html) describes a neutral junction that lets users change one upstream connection while keeping downstream consumers wired. ComfyTavern examples could be Shared Context, Response Plan, or Style Brief. This concept does not imply caching, persistence, or resume support. Keep it and named connections as later complexity tools unless starter workflows demonstrate a concrete need.

For approachability, make the same applicable actions available from a visible node menu button and the inspector, with keyboard access. Common actions can remain near the top, with inspection and advanced operations grouped below. Show checked states for bypass/bookmarks, and explain unavailable actions. Reuse framework-independent commands and capability checks in all entry points. Graph-edit undo should not imply that paid calls or external writes can be undone.

First candidates are **inspect/pin result**, existing edit/library actions, and a clearly defined bypass for compatible revision steps. Replacement, partial reruns, named outputs, and routing tools can follow when their contracts are supported. A larger menu should not become the starting tutorial: examples and the family library still teach construction, while the menu supports experimentation.

## Runtime/editor boundary for coordination

The library can consume framework-independent descriptors containing stable operation ID/version, label, family/subfamily, description, valid phases, input/output types, configuration fields, request-count estimate, side effects, and example/help references. Svelte owns their presentation and search interaction; the runtime owns validation and execution. A descriptor does not by itself authorize a side effect.

This is a candidate interface for coordination, not a newly approved registry or plugin system. A static built-in catalog can establish the behavior first. Third-party node loading, learned prediction, deep scene taxonomies, and a new Gaea-style SDK would enlarge the scope beyond this approachability problem.

## Evidence limits and next design discussion

I reviewed official documentation and release material, including the user's surface-crafting guide and its Surface Nodes and Transpose Shapes links; visually inspected five published UI images and the user's node-menu screenshot; and inspected timeline samples and detailed frames from the user's Gaea 2 video. I also read the checked-out fork's existing context menu and relevant disabled-node compilation paths. I did not run Gaea 2/3, verify every convenience in an installed build, or inspect a finalized Gaea 3 toolbox. No ComfyTavern product code or UI Performance files changed.

The family names and display order are now selected. The [node-family catalog discussion](2026-10-07-comfytavern-node-family-catalog.md) maps existing nodes, identifies presentation versus runtime changes, and proposes candidate operations and two starter workflows. Their contents and priorities remain proposals. A small library mockup can then test drawer expansion, search, descriptions, and phase-aware suggestions without committing to a broader editor redesign.
