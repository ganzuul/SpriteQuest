# LATTICE

**A visual workspace for engineering writing workflows.**

LATTICE turns a writing process into a system you can build, inspect, and reuse. Connect context sources, model operations, text transformations, structured data, and review steps in a node graph. Package a useful process as a subgraph, edit its body in a graph tab, and compose it into a larger workflow.

It runs inside SillyTavern. A unified workflow prepares guidance, uses it for the ordinary SillyTavern generation, then processes the completed reply in the same graph. Auxiliary models can revise prose, extract scene records or enrich notes. Review the final result before Apply creates a new swipe and accepts its staged consequences.

![LATTICE workspace with a structured writing brief flowing through JSON Decode, Select Fields, Compose, and Guidance](docs/images/workspace-overview.png)

*Build a writing brief from structured fields, inspect its result in Preview, and configure the selected operation in Details—all in one workspace.*

## What you can build

- **Context preparation pipelines:** select recent material, preserve protected passages, compact context, and combine branches before planning.
- **Scene planning workflows:** define instructions and budgets for model-assisted direction, intentions, constraints, and possible next beats.
- **Structured writing briefs:** parse JSON, select the fields you need, and compose them into repeatable guidance templates.
- **Editorial pipelines:** scan configured patterns, apply literal or regex rules, or ask a model for bounded repairs; validate and review the proposed result.
- **Actor memory and state:** reflect on supplied evidence, express optional behavior guidance, internalize settled events, and track deterministic consequences.
- **Reusable writing tools:** wrap a sequence in a subgraph with named inputs and outputs, then use it in other workflows.

These are combinations of the shipped tools. **File → Open examples…** offers [30 numbered unified lessons](docs/examples.md), searchable by goal or node technique and filterable by difficulty. Lessons include prose-and-notes chains, item effects, story-time triggers, generic progression and scoped actor memory. Each opens as an editable copy with its own setup instructions. The workflow JSON examples below also explore individual capabilities.

## Key features

| Feature | What it gives you |
| --- | --- |
| **Typed node graphs** | Connect Context, Draft, Text, Data, Guidance, Patches, and Candidate artifacts through named pins. Connections determine dependencies. |
| **Reusable subgraphs** | Package operations behind a typed interface, customize an editable copy, and compose nested processes. |
| **Graph tabs** | Open subgraph bodies without losing your place in the parent workflow. Each instance retains its own view. |
| **Node shelf and contextual search** | Open a family to choose an operation directly, search operations and subgraphs, or discover compatible nodes while connecting a pin. |
| **Node details** | Edit operation controls, aliases, compact cards, and model bindings; inspect effective values and validation issues. |
| **Per-operation model connections** | Choose each model node’s connection profile and model in Details without switching SillyTavern’s main connection; For Each exposes its pinned helper’s role selectors too. |
| **One native workflow** | Connect preparation to Generate Reply, process its owned Draft, and review the result in one graph. |
| **Typed decisions and branches** | Use ordinary Decision with explicit accepted, rejected and unresolved routes; Confidence Gate handles authored numeric policies. |
| **Workflow Data and accepted effects** | Read authorized logical targets, project append/keyed updates, and settle file/clock/outcome consequences with the chosen reviewed result. |
| **Scoped character context and Recall** | Process present actors separately and queue selected-actor memories through canvas controls or shortcuts. |
| **Recorded previews** | Inspect inputs and outputs, follow selection, pin an artifact, or run only a selected output's dependencies. |
| **Execution visibility** | See node states, expanded subgraph stages, request bounds, actual calls, and failures. |
| **Portals and reroutes** | Keep a large graph readable while preserving its dependencies. |
| **Review before application** | Compare a proposed revision with its original; applying creates a new swipe and preserves the source. |
| **Portable workflow packages** | Import, export, and share workflows with pinned subgraph definitions. Add fragments through a reviewed import. |
| **Editing controls** | Undo/redo, copy/paste, multiselection, pan/zoom, pane resizing, and presentation aliases. |
| **Workflow comments** | Frame selected nodes with a labeled comment, add notes, and move or resize it with undo support. |

![LATTICE context assembly graph with two context branches joining before a Response Plan](docs/images/context-assembly.png)

*Combine context branches with named inputs. This authored example includes a model planning step; choose that node's connection profile in Details before a full run.*

## Available nodes

The [node reference](docs/node-reference.md) lists the actual reusable operations, ports and controls. **0** calls means no auxiliary model request; the ordinary SillyTavern reply is separate.

| Tools | Examples |
| --- | --- |
| **Native lifecycle** | On Send, Player Event Source, Generate Reply · SillyTavern, Review / Publish |
| **Context and model work** | Scene Context, Actor Context, Model Call, Response Plan, Revise Draft, Extract, Enrich |
| **Assembly and editing** | Compose, Text Rules, Transpose, Draft Text, Render Notes, Append/Combine |
| **Decisions and control** | Decision, Confidence Gate, Condition, Branch, Join, Collect, pinned For Each |
| **Canonical events and item rules** | Event Normalize, Confirm Events, Scene Presence, Current Holder, Character Direction, Prompted Memory |
| **Randomness** | Effect Library, Random Pick, Effect Author, Stage Outcome, Outcome Commit |
| **Documents and collections** | Read File, Format, Project Document, Write to File; lookup/filter/count/sum/threshold/project/flatten |
| **Time and progression** | Story Clock, Advance Time, Time Trigger, Clock Commit; generic State progression and time-decay |
| **Memory** | Reflect, Internalize, Express, scoped Memory, Recall and Recall Shortcut |

Repair also offers Inspect, Contextual Cleanup and Strict Avoidance modes using the complete category-based policy. Nodes have phase and artifact requirements; the [node reference](docs/node-reference.md) explains their ports and controls. The [reference library guide](docs/lattice-reference-library.md) covers reusable Context Lens, Scene Compass and cleanup workflows.

The shelf and contextual search offer one entry per operation. Choose variants in **Details**: Reflect's Character/Recall/Scene modes, JSON Decode's Parse/Check modes, Reroute's Artifact kind, and the other operation controls. Introspection modes and generic State progression/time-decay use these controls. The Subgraphs shelf shows the latest explicitly saved entry for each reusable item; placed copies retain their exact saved contents.

New Transpose nodes accept and return **Text** in either graph phase. Choose **Input type → Draft** in the Response stage to produce source-bound Patches for validation and review. Existing saved nodes without an Input type setting retain their Draft behavior. See the [reference library guide](docs/lattice-reference-library.md) for reference inputs and independent mode/scope controls.

Memory is root-only; Commit is a Response terminal. Its effects wait for the chosen accepted Review / Publish result. Run to here records a preview without writing. Memory uses the active chat and character, including a required selected actor in group chats. See the [Introspection guide](docs/introspection-package.md) for evidence, controls and persistence limits.

## Reuse a process, inspect its internals

Select processing nodes, right-click, and choose **Create Subgraph**. The editor opens their body in a new editable tab, creates and wires typed input/output boundaries, and reconnects the parent workflow through the new subgraph block. Click a boundary to edit its port in Details. Add Input and Output nodes from the Subgraphs shelf; they are enabled inside editable subgraphs. Save a wrapper with **Add to Subgraphs**, then explicitly create or update a shelf entry. Placed copies retain their saved contents. Undo restores the original nodes and connections in one step.

![LATTICE subgraph body open in a second graph tab, showing Draft and Patches boundaries around Text Rules](docs/images/subgraph-tab.png)

*The Literal cleanup subgraph exposes Draft → Patches. Its body opens in a tab; validation, review, and application remain in the parent workflow. Pinned bodies are read-only until you make a local copy.*

## Install and try it

1. In SillyTavern, open **Extensions → Install extension**.
2. Enter `https://github.com/MentallyQuill/Lattice`, leaving the branch field blank to install `main`.
3. Install, then reload SillyTavern. Open LATTICE from its logo on the left of the chat bar or with `/lattice`. Fresh launch opens **Unified story workflow**, with Lattice disabled. Existing installations restore their unified recovery draft; previous unified documents remain available through **File → Recover previous workflows**.
4. Keep the starter open, select **Enable Lattice**, and Send a player message in SillyTavern. The starter makes no auxiliary calls and exposes its completed native Draft for review.
5. Select **Review / Publish · Host result** in Preview, inspect it, and Apply or Reject. For a richer pipeline, open a unified example and configure its model nodes, For Each helper roles and required workflow data documents before the next Send.
New Story Clock, Read File and Outcome Commit nodes have automatic Workflow Data presets.

For updates, use **Manage Extensions**, then reload. Installation, import, and editing do not make model calls.

The [unified workflow guide](docs/unified-workflows.md) walks through applying an example to **Story-2 on default-user**, chaining different models, using Decision, recording private moments, queueing recall and managing accepted effects. A full unified native generation starts with ordinary Send; supported **Run to here** paths inspect without acceptance.

Opening a unified example makes an independent editable copy the active document. It makes no model request and does not change **Enable Lattice**. Choose each auxiliary model’s connection on its node bar; Details provides advanced model settings; configure For Each’s **Helper model bindings** separately. **Workflow → Configure → Workflow Data…** authorizes logical JSON/text targets. Local connection IDs and credentials are excluded from portable exports.

Adjust a node’s **Details → Starting values** or initial content, and use **Advanced** for its source, Format and Visibility. Nodes using the same clock share saved time; create a separate clock with **+** for an independent timeline. Changing initial values preserves existing saved time and document content. **Workflow → Configure → Workflow Data…** remains available for managing custom targets, including those named by imported examples. Local connection IDs and credentials are excluded from portable exports.

Saved unified documents retain their content and recovery draft. Earlier unified example IDs remain installable while the visible picker shows the 30 new lessons. Saved pre/post roots are retired. On upgrade, LATTICE preserves their original graphs, bindings and active selection in a cold recovery archive, then opens a disabled unified starter when needed. **File → Export archived workflows** saves a copy of the archive as JSON. Archived roots cannot execute or import as current workflows, and recovery makes no model requests. Rebuild useful operations in a new unified graph; there is no automatic converter.

Open a current workflow from **File → Open examples…**, or its JSON with **File → Open workflow…**:

| Example | What it demonstrates |
| --- | --- |
| [12 · Plan, write, polish, and annotate one reply](examples/remastered/12-plan-write-polish-and-annotate-one-reply.lattice.json) | Guidance, owned native Draft, prose revision and notes |
| [17 · Record only the scene you accept](examples/remastered/17-record-only-the-scene-you-accept.lattice.json) | Accepted same-target document projection and duplicate identity handling |
| [21 · Give one present character their own direction](examples/remastered/21-give-one-present-character-their-own-direction.lattice.json) | Presence-verified actor-private direction |
| [25 · Award experience from confirmed progress](examples/remastered/25-award-experience-from-confirmed-progress.lattice.json) | Evidence-backed deterministic progression |
| [26 · Recall a memory with a hotkey or a story trigger](examples/remastered/26-recall-a-memory-with-a-hotkey-or-a-story-trigger.lattice.json) | Scoped Recall with visible queue controls |

Five pinned stage-specific subgraph definitions remain available as reusable processing tools. Their bodies retain their own stage contracts; complete executable roots are unified. Run to here records diagnostics without publishing guidance, creating Apply authority or settling memory.

![LATTICE showing a completed cleanup workflow and its original and revised text in the candidate artifact](docs/images/review-candidate.png)

*Inspect the root Host result before choosing Apply reviewed candidate or Reject candidate. Intermediate outputs are diagnostic previews.*

## Learn and build

- [Operator's manual](docs/operators-manual.md) — screenshot-guided workspace, graph editing, subgraphs, Details, Preview, and execution.
- [Node reference](docs/node-reference.md) — every available operation, its artifacts, controls, and connection examples.
- [Connections and comments](docs/connection-comments.md) — smooth connections, workflow annotations, and comment editing shortcuts.
- [Quick start](docs/lattice-workspace.md) — open the zero-auxiliary-call starter, enable Lattice, Send and review.
- [Unified workflows](docs/unified-workflows.md) — story setup, one-graph Send/Apply, decisions, actor context, documents, Recall, clocks and migration.
- [Model connections and host integration](docs/native-workflows.md) — local profiles, token budgets, reply review, supported routes, and troubleshooting.
- [Introspection](docs/introspection-package.md) — Introspection modes, scoped memory and package APIs.
- [Development guide](docs/development.md) — build tools and reproducible documentation captures.

Screenshots illustrate the editor and existing example tools on a local demonstration host with synthetic writing material; captions identify their demonstrated workflows. The demonstrated completed workflows make no provider requests.

## License

MIT. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).
