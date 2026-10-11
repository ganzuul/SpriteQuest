# Readable Node Workflows: Design Overview

**Status:** Design direction approved in chat; written specifications and plans prepared for review. Implementation has not started.

**Authorization:** On October 10, 2026, the user approved building a specification and implementation plan for three workstreams. This document consolidates that discussion and the relevant context from the Codex chat titled “Simplify node data entry.”

**Compatibility decision:** The user explicitly confirmed there are no users and backward compatibility is unnecessary. Build one current contract and update repository documentation, examples, generators, and tests. Do not add legacy operation aliases, configuration migrations, or old definition-hash compatibility branches.

## Goal

Make Lattice easier to configure, easier to inspect, and more useful for deterministic workflows that react to text. A person should be able to enter `Elara`, understand the resulting matches, and route a reply through a paragraph filter without supplying internal JSON wrappers or using a model for keyword detection.

The audience includes novice and technical users. Friendly authoring and readable previews are the default; explicit advanced configuration and retained source data remain available.

## Three separately deliverable workstreams

| Workstream | Specification | Implementation plan | Deliverable |
| --- | --- | --- | --- |
| Node data entry | [Node entry](2026-10-10-node-entry-design.md) | [Node entry plan](../plans/2026-10-10-node-entry.md) | Schema-specific fields, lists, forms, CSV where meaningful, and validated Advanced JSON in creation and editing. |
| Preview presentation | [Preview modes](2026-10-10-preview-modes-design.md) | [Preview plan](../plans/2026-10-10-preview-modes.md) | Default Readable and optional Source views with faithful formatting and clear message boundaries. |
| Pattern and filtering | [Pattern routing](2026-10-10-pattern-routing-design.md) | [Pattern plan](../plans/2026-10-10-pattern-routing.md) | Pattern detection, boolean/report outputs, existing Branch integration, and deterministic Filter Text. |

The [delivery plan](../plans/2026-10-10-readable-node-workflows.md) defines order, integration checks, and ownership boundaries. Each stream can land separately; the final acceptance example combines them.

## Shared constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- CSV applies only to declared list/table controls; prose, templates, paths, and regex expressions retain their syntax.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Readable presentation is faithful to retained content; it never summarizes, rewrites, or fabricates messages or metadata.
- Source means the retained privacy-projected diagnostic payload, subject to existing recording and display bounds; it does not expose private host state.
- Keep the existing 4 MiB recording, 256 KiB artifact, and 64 KiB preview-text bounds and explicit omission/truncation notices.
- Detection and filtering use zero model requests; optional natural-language configuration assistance is deferred.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## End-to-end acceptance example

1. Create a Pattern node and enter `Elara` as a normal search term.
2. The editor visibly confirms one parsed rule; generated identifiers do not require user entry.
3. Scan an original reply containing the name in two paragraphs, with repeated hits inside one paragraph.
4. Readable shows occurrence counts and excerpts; Source shows retained diagnostic structure.
5. Connect Matched to Branch and pass the scanned Draft through its payload input.
6. The matched path runs Filter Text once, removing matching paragraphs once each. The unmatched path retains the reply.
7. Join the paths and inspect the resulting Draft before the existing review/publish process.
8. Switching preview modes, editing terms, or opening a pinned recording performs no generation, filtering run, or publication.

Separate tests also exercise twelve occurrences of `1`, two of `3`, and zero of `2`: fourteen occurrence records, per-rule counts of 12/0/2, and one branch choice per workflow run.

## Release boundaries

The core release includes all three stream specifications. Friendly authoring is migrated in explicit node families rather than replacing every control with a generic parser. The specifications identify the control coverage and advanced-only exceptions.

Pattern uses the current operation ID `pattern`; `pattern-scan` is removed from active catalog/dispatch and current examples. Internal scanner helpers needed by other operations may remain, but are not a legacy public Pattern mode.

Natural-language “Draft settings,” autonomous keyword watchers that start new runs, model repair improvements, generic execution wires, and unrelated graph/runtime refactoring are follow-up work. Existing Branch, Condition, Join, and For Each supply routing and iteration.

## Repository baseline

Planning inspected the working tree on `main`, initially at `e46c4ba`, with substantial unrelated edits already present. File paths in the plans refer to that inspected working tree; execution must reconcile concurrent changes before editing. No private Story-2 text is copied into repository fixtures or specifications; tests use synthetic replies.
