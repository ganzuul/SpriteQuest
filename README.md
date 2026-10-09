# LATTICE

**A visual workspace for engineering writing workflows.**

LATTICE turns a writing process into a system you can build, inspect, and reuse. Connect context sources, model operations, text transformations, structured data, and review steps in a node graph. Package a useful process as a subgraph, expose its settings, and compose it into a larger workflow.

It runs inside SillyTavern. Your workflows can prepare guidance for a conversation or propose edits to a completed reply, while SillyTavern handles the main generation. Those integration points give your writing systems a place to run; the editor gives you the tools to design them.

![LATTICE workspace with a structured writing brief flowing through JSON Decode, Select Fields, Compose, and Guidance](docs/images/workspace-overview.png)

*Build a writing brief from structured fields, inspect its result in Preview, and configure the selected operation in Details—all in one workspace.*

## What you can build

- **Context preparation pipelines:** select recent material, preserve protected passages, compact context, and combine branches before planning.
- **Scene planning workflows:** define instructions and budgets for model-assisted direction, intentions, constraints, and possible next beats.
- **Structured writing briefs:** parse JSON, select the fields you need, and compose them into repeatable guidance templates.
- **Editorial pipelines:** scan configured patterns, apply literal or regex rules, or ask a model for bounded repairs; validate and review the proposed result.
- **Actor memory and state:** reflect on supplied evidence, express optional behavior guidance, internalize settled events, and track deterministic consequences.
- **Reusable writing tools:** wrap a sequence in a subgraph with named inputs, outputs, and exposed parameters, then use it in other workflows.

These are combinations of the shipped tools. The eleven workflow examples are starting points for your own processes.

## Key features

| Feature | What it gives you |
| --- | --- |
| **Typed node graphs** | Connect Context, Draft, Text, Data, Guidance, Patches, and Candidate artifacts through named pins. Connections determine dependencies. |
| **Reusable subgraphs** | Package operations behind a typed interface, expose selected settings, and compose nested processes. |
| **Graph tabs** | Open subgraph bodies without losing your place in the parent workflow. Each instance retains its own view. |
| **Node shelf and contextual search** | Browse families and categories, search operations and subgraphs, or discover compatible nodes while connecting a pin. |
| **Node details** | Edit operation controls, aliases, compact cards, and model bindings; inspect effective values and validation issues. |
| **Per-operation model connections** | Use role defaults or individual profile/model overrides without switching SillyTavern's active connection globally. |
| **Recorded previews** | Inspect inputs and outputs, follow selection, pin an artifact, or run only a selected output's dependencies. |
| **Execution visibility** | See node states, expanded subgraph stages, request bounds, actual calls, and failures. |
| **Portals and reroutes** | Keep a large graph readable while preserving its dependencies. |
| **Review before application** | Compare a proposed revision with its original; applying creates a new swipe and preserves the source. |
| **Portable workflow packages** | Import, export, and share workflows with pinned subgraph definitions. Add fragments through a reviewed import. |
| **Editing controls** | Undo/redo, copy/paste, multiselection, pan/zoom, pane resizing, and presentation aliases. |
| **Workflow comments** | Frame selected nodes with a labeled comment, add notes, and move or resize it with undo support. |

![LATTICE context assembly graph with two context branches joining before a Response Plan](docs/images/context-assembly.png)

*Combine context branches with named inputs. This authored example includes a model planning step; bind its Analysis role before a full run.*

## Available nodes

This development branch contains **25 operations**, plus subgraph instances and their input/output boundaries. **0** means no auxiliary model call; counts are per operation execution, separate from the normal SillyTavern reply.

| Family | Node | Purpose | Model calls |
| --- | --- | --- | ---: |
| Input | **Scene Context** | Read bounded recent conversation and selected character fields | 0 |
| Input | **Reply Snapshot** | Freeze the latest completed text reply for review | 0 |
| Shaping | **Smart Compactor** | Select or summarize context while protecting chosen material | 0–1 |
| Shaping | **Context Join** | Combine ordered Context inputs and check duplicate identities | 0 |
| Shaping | **Response Plan** | Propose optional direction and constraints from context | 1 |
| Shaping | **Compose** | Join named sections or fill a template from structured fields | 0 |
| Shaping | **Reroute** | Route a typed connection through a compact graph point | 0 |
| Surface | **Text Rules** | Replace or extract text with literal/regex rules; propose Draft patches | 0 |
| Surface | **Repair** | Generate bounded patches for scanned spans | 0–1 |
| Transpose | **Style Transfer** | Apply reference voice, rhythm, diction or register to permitted draft text | 0–1 |
| Transpose | **Format Transfer** | Apply an example or template without inventing missing content | 0–1 |
| Transpose | **Terminology Map** | Apply a canonical glossary with simultaneous literal replacements | 0 |
| Introspection | **Reflect** | Appraise supplied character, recall or scene evidence | 1 Analysis |
| Introspection | **Internalize** | Propose actor state updates from settled events | 1 Analysis |
| Introspection | **Express** | Render behavior/attention guidance or fictional inner voice | 0–1 |
| Introspection | **Context** | Assemble, filter perspective or focus Context | 0–1 |
| Introspection | **Memory** | Read/recall scoped records or explicitly commit a state proposal | 0 |
| Introspection | **State** | Propose numeric values, curve recovery or distinct-event tracks | 0 |
| Derive | **Pattern Scan** | Identify configured literal patterns in a reply | 0 |
| Derive | **JSON Decode** | Parse JSON text or check Data against a supported schema | 0 |
| Derive | **Select Fields** | Extract and rename structured fields by path | 0 |
| Derive | **Validate Patches** | Validate proposed changes and construct a candidate | 0 |
| Output | **Guidance** | Produce bounded guidance for the host generation | 0 |
| Output | **Review Gate** | Mark a candidate for explicit review | 0 |
| Output | **Apply Reply** | Expose the final reviewed reply result | 0 |

Repair also offers Inspect, Contextual Cleanup and Strict Avoidance modes using the complete category-based policy. Nodes have phase and artifact requirements; the [node reference](docs/node-reference.md) explains their ports and controls. The [reference library guide](docs/lattice-reference-library.md) covers reusable Context Lens, Scene Compass and cleanup workflows.

All six Introspection nodes and their eighteen mode presets are available in the canvas shelf and contextual search. Memory is root-only; Commit is a Post terminal and writes only after a successful full root Run. Run to here records a preview without writing. Memory uses the active chat and character, including a required selected actor in group chats. See the [Introspection guide](docs/introspection-package.md) for evidence, controls and persistence limits.

## Reuse a process, inspect its internals

Select processing nodes, right-click, and choose **Create Subgraph**. The editor opens their body in a new editable tab, creates and wires typed input/output boundaries, and reconnects the parent workflow through the new subgraph block. Click a boundary to edit its port name or use **Add input/output** to extend the interface. Undo restores the original nodes and connections in one step.

![LATTICE subgraph body open in a second graph tab, showing Draft and Patches boundaries around Text Rules](docs/images/subgraph-tab.png)

*The Literal cleanup subgraph exposes Draft → Patches. Its body opens in a tab; validation, review, and application remain in the parent workflow. Pinned bodies are read-only until you make a local copy.*

## Install and try it

1. In SillyTavern, open **Extensions → Install extension**.
2. Enter `https://github.com/MentallyQuill/Lattice`, leaving the branch field blank to install `main`.
3. Install, then reload SillyTavern. Open LATTICE from its logo on the left of the chat bar or with `/lattice`. Fresh launch selects **Structured guidance**, with workflows disabled and no phase assigned.
4. Try the selected zero-call graph, or open **Workflows → Workflow examples…** and install another starter.
5. Configure any model roles, click **Run**, and inspect the recorded results. Assign a phase and arm only when you want integration with normal sends.

For updates, use **Manage Extensions**, then reload. Installation, import, and editing do not make model calls.

| Starter | What it demonstrates | Maximum auxiliary calls |
| --- | --- | ---: |
| [Structured guidance](workflows/structured-guidance.json) | JSON → selected fields → composed writing brief | 0 |
| [Literal cleanup](workflows/literal-cleanup.json) | Deterministic reply edits with validation and review | 0 |
| [Scene guidance](workflows/native-guidance.json) | Context compaction and model-assisted scene direction | 2 |
| [Reviewed AI De-slop](workflows/reviewed-de-slop.json) | Configured pattern scanning and reviewed model repair | 1 |
| [Scene Compass](examples/library/workflows/scene-compass.json) | Reusable context selection and scene direction | 1 |
| [Literal phrase cleanup](examples/library/workflows/literal-cleanup.json) | Reusable phrase repair with review | 1 |
| [Formatting cleanup](examples/library/workflows/formatting-cleanup.json) | Reusable deterministic line-ending cleanup | 0 |
| [Prose cleanup](examples/library/workflows/prose-cleanup.json) | Reusable category-based cleanup | 1 |
| [Reflect and express](examples/introspection/native/reflect-and-express.json) | Focus → character reflection → behavior guidance | 1 Analysis |
| [Internalize and commit](examples/introspection/native/internalize-and-commit.json) | Settled events → experience proposal → root memory commit | 1 Analysis |
| [Consequence clock](examples/introspection/native/consequence-clock.json) | Distinct settled events → deterministic track → root memory commit | 0 |

Start with Structured guidance without a connection profile, or Literal cleanup with a completed text reply. A manual model-backed run can spend tokens; an armed Send runs guidance again. Reply application requires a fresh, fully reviewed root result.

The two Post Introspection starters write actor memory on a successful full Run. The host checks current evidence and store version before writing and records idempotency receipts. SillyTavern's public metadata save wrapper returns no durability acknowledgment: Preview reports **Memory updated; save unconfirmed** when the local update succeeds but the save is unconfirmed. Confirm refreshed metadata before another commit.

![LATTICE showing a completed cleanup workflow and its original and revised text in the candidate artifact](docs/images/review-candidate.png)

*Inspect the root Host result before choosing Apply reviewed candidate or Reject candidate. Intermediate outputs are diagnostic previews.*

## Learn and build

- [Operator's manual](docs/operators-manual.md) — screenshot-guided workspace, graph editing, subgraphs, Details, Preview, and execution.
- [Node reference](docs/node-reference.md) — every available operation, its artifacts, controls, and connection examples.
- [Connections and comments](docs/connection-comments.md) — smooth connections, workflow annotations, and comment editing shortcuts.
- [Quick start](docs/lattice-workspace.md) — your first two workflows without model calls.
- [Model connections and host integration](docs/native-workflows.md) — phase setup, token budgets, reply review, supported routes, and troubleshooting.
- [Introspection](docs/introspection-package.md) — native starters, all eighteen modes, scoped memory and package APIs.
- [Development guide](docs/development.md) — build tools and reproducible documentation captures.

Screenshots show the shipped UI on a local demonstration host with synthetic writing material. The demonstrated completed workflows make no provider requests.

## License

MIT. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).
