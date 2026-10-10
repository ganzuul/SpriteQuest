# LATTICE documentation

Build writing processes from typed operations, inspect their intermediate results, and package reusable processes as subgraphs.

| Guide | Start here when you want to… |
| --- | --- |
| [Quick start](lattice-workspace.md) | Assign the unified starter, Send and review; explore zero-auxiliary-call legacy tools |
| [Unified workflows](unified-workflows.md) | Apply an example to a story, chain models and decisions, configure documents/Recall, track story time and migrate a copy |
| [Operator's manual](operators-manual.md) | Learn the editor, shelf, Details, Preview, execution, tabs, and subgraphs through screenshots |
| [Node reference](node-reference.md) | Find every available node's artifacts, controls, model requirements, and connection examples |
| [Reference tools and workflow library](lattice-reference-library.md) | Use Transpose, cleanup modes and reusable context/cleanup recipes |
| [Connections and workflow comments](connection-comments.md) | Follow connections and label, annotate, move, and resize workflow sections |
| [Model connections and host integration](native-workflows.md) | Bind local profiles, inspect provider limits, run legacy tools, review replies and troubleshoot |
| [Development guide](development.md) | Build the extension and reproduce documentation screenshots |
| [Introspection](introspection-package.md) | Use original Introspection modes, actor memory starters, scoped records and package APIs |

The [repository README](../README.md) introduces capabilities and starter workflows. Existing screenshots illustrate the editor and the named legacy/example workflows. Development research and execution records in the research/superpowers directories are historical working material, not the operator reference.

## Workflow design records

These detailed design documents consolidate the unified-workflow discussion, including its original proposals and open choices. The [unified operator guide](unified-workflows.md) describes the implemented authoring path and current limits; do not treat every optional design alternative as an available control.

| Document | Covers |
| --- | --- |
| [Workflow Unification Summary](design/workflow-unification-summary.md) | One workflow across preparation, native ST generation, reply processing, publication, file updates, recall, story time, and reusable progression; runtime, host integration, UI, and open decisions |
| [Expanded Nodes](design/expanded-nodes.md) | Detailed node concepts and contracts, triggers, Decision/Fast Decision, character/item recipes, file updates, hotkey recall, clocks/intervals, general state structures for XP and relationship pacing, and ten additional story flows |

Implemented requirements and validation are recorded in the [requirement evidence](design/workflow-unification-requirements.md) and [release report](superpowers/reports/2026-10-10-workflow-unification.md).
