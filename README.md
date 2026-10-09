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
- **Reusable writing tools:** wrap a sequence in a subgraph with named inputs, outputs, and exposed parameters, then use it in other workflows.

These are combinations of the shipped tools. The four included examples are starting points for your own processes.

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

The current toolset contains **16 operations**, plus subgraph instances and their input/output boundaries. **0** means no auxiliary model call; counts are per operation execution, separate from the normal SillyTavern reply.

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
| Derive | **Pattern Scan** | Identify configured literal patterns in a reply | 0 |
| Derive | **JSON Decode** | Parse JSON text or check Data against a supported schema | 0 |
| Derive | **Select Fields** | Extract and rename structured fields by path | 0 |
| Derive | **Validate Patches** | Validate proposed changes and construct a candidate | 0 |
| Output | **Guidance** | Produce bounded guidance for the host generation | 0 |
| Output | **Review Gate** | Mark a candidate for explicit review | 0 |
| Output | **Apply Reply** | Expose the final reviewed reply result | 0 |

Transpose is a visible shelf family with no supported operation yet. Nodes have phase and artifact requirements; the [node reference](docs/node-reference.md) explains their ports, controls, and compatible uses.

## Reuse a process, inspect its internals

![LATTICE subgraph body open in a second graph tab, showing Draft and Patches boundaries around Text Rules](docs/images/subgraph-tab.png)

*The Literal cleanup subgraph exposes Draft → Patches. Its body opens in a tab; validation, review, and application remain in the parent workflow. Pinned bodies are read-only until you make a local copy.*

## Install and try it

1. In SillyTavern, open **Extensions → Install extension**.
2. Enter `https://github.com/MentallyQuill/Lattice`, leaving the branch field blank to install `main`.
3. Install, then reload SillyTavern. Open LATTICE from the button beside Send or with `/lattice`. Fresh launch selects **Structured guidance**, with workflows disabled and no phase assigned.
4. Try the selected zero-call graph, or open **Workflows → Workflow examples…** and install another starter.
5. Configure any model roles, click **Run**, and inspect the recorded results. Assign a phase and arm only when you want integration with normal sends.

For updates, use **Manage Extensions**, then reload. Installation, import, and editing do not make model calls.

| Starter | What it demonstrates | Maximum auxiliary calls |
| --- | --- | ---: |
| [Structured guidance](workflows/structured-guidance.json) | JSON → selected fields → composed writing brief | 0 |
| [Literal cleanup](workflows/literal-cleanup.json) | Deterministic reply edits with validation and review | 0 |
| [Scene guidance](workflows/native-guidance.json) | Context compaction and model-assisted scene direction | 2 |
| [Reviewed AI De-slop](workflows/reviewed-de-slop.json) | Configured pattern scanning and reviewed model repair | 1 |

Start with Structured guidance without a connection profile, or Literal cleanup with a completed text reply. A manual model-backed run can spend tokens; an armed Send runs guidance again. Reply application requires a fresh, fully reviewed root result.

![LATTICE showing a completed cleanup workflow and its original and revised text in the candidate artifact](docs/images/review-candidate.png)

*Inspect the root Host result before choosing Apply reviewed candidate or Reject candidate. Intermediate outputs are diagnostic previews.*

## Learn and build

- [Operator's manual](docs/operators-manual.md) — screenshot-guided workspace, graph editing, subgraphs, Details, Preview, and execution.
- [Node reference](docs/node-reference.md) — every available operation, its artifacts, controls, and connection examples.
- [Connections and comments](docs/connection-comments.md) — smooth connections, workflow annotations, and comment editing shortcuts.
- [Quick start](docs/lattice-workspace.md) — your first two workflows without model calls.
- [Model connections and host integration](docs/native-workflows.md) — phase setup, token budgets, reply review, supported routes, and troubleshooting.
- [Development guide](docs/development.md) — build tools and reproducible documentation captures.

Screenshots show the shipped UI on a local demonstration host with synthetic writing material. The demonstrated completed workflows make no provider requests.

## License

MIT. See [LICENSE](LICENSE) and [third-party notices](THIRD_PARTY_NOTICES.md).
