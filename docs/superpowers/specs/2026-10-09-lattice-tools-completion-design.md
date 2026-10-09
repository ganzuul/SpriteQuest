# Complete reference tools for current Lattice

Build on verified Main ca19c51d90e096b208d7d9cc84d7f3246d6fec7c, version 0.22.0, in the isolated `codex/lattice-tools-completion` branch. The user explicitly asked this chat to build the discussed changes for later integration. This continues the approved reference-tools design and supersedes its new-files-only restriction for this isolated implementation. Main, other worktrees, release/versioning, and introspection remain outside this task. Introspection is being implemented by its own chat, as the user clarified.

## Result

Make the three approved Transpose nodes executable and authorable: Style Transfer (narration, character-voice, rhythm, register), Format Transfer (Text or Data reference), and Terminology Map (Data glossary). Register typed named inputs and current UI controls. Retain source-bound Draft -> Patches -> Validate -> Review -> explicit Apply. Style/Format use at most one injected Prose request; terminology uses zero. Character Voice preset explicitly selects dialogue. Reference-kind changes use existing atomic wire preservation/rejection. All declared semantic controls and named wires participate in freshness.

Reuse reviewed engines and regression tests from `codex/lattice-reference-tools`, adapting imports to 0.22.0 and current contracts. Preserve original permissions, empty spans, source metadata, protected wording, UTF-16 offsets, immutable anchors, verified complete output, cancellation, and bounded own-data validation. No retries, provider switching, direct host effects, or new dependencies.

## One cleanup operation with modes

Extend Repair with inspect, contextual, and strict modes while retaining repair/scan. Modes are controls, not additional primitive nodes. Scope (authorized/narration/dialogue/whole), category selection, protected wording, case matching, instructions and token budget are separate controls. New cleanup presets select narration explicitly. Optional Context input is available only to new cleanup modes for context-dependent evidence.

Use all 271 unique policies from the supplied document, with 14 categories, 273 occurrences, 17 templates and 2 behaviors. Retain exact source wording and duplicate category tags. Keep canonical JSON, portable source fixture, detached selector and a browser-loadable JS data module generated from the JSON; tests enforce equality. The attachment is data, never development instructions.

`cleanupDraft(draft, settings, ports)` returns Result with `{artifact, report}`. Inspect returns unchanged source-bound Patches and original-offset literal findings without model calls. Literal findings establish matches, not semantic defects. Use Unicode word boundaries, punctuation variants and exact original offsets. Templates and behaviors remain typed policies and are reported as requiring semantic assessment when no assessment is made; do not claim deterministic semantic detection.

Contextual/strict cleanup uses a separate raw-prose writing prompt with at most one Prose request. Include the full selected policy, bounded original text/windows and context messages; never profile/source-token metadata. Contextual preserves intentional/grounded uses; strict asks to avoid configured wording without deleting facts/actions. Exact permission/anchor checks precede any Patches. Retain grounded actions, chronology, refusals, character voice and user agency as prompt and human-review constraints, not machine-certified truth. Strict verifies remaining literal matches and reports protected/uneditable or unresolved matches. No editable windows means zero requests. Invalid, truncated, ambiguous or cancelled output yields no authoritative proposal.

## Permission-preserving recipes

Fix Pattern Scan to narrow existing spans and union upstream protections/exemptions; empty upstream spans never become editable. Raw scans construct only the explicit selected scope. Add explicit scope/protected-literal controls to Draft Text Rules, using shared prepared windows and reconstruction. Default engine permission scope is authorized; raw Draft construction requires explicit whole/narration/dialogue. Existing literal starter and Draft shelf preset explicitly choose whole to retain their intended behavior.

Deliver Context Lens (Context -> Context, selection 0 calls, optional compression 1), Scene Compass (Context -> Guidance, default 1 Analysis; compression adds 1), Literal Cleanup (Draft -> Candidate, narrow literal scan/Repair/Validate, max 1 Prose), Formatting Cleanup (Draft -> Candidate, CRLF -> LF by default, 0 calls), and Prose Cleanup (Draft -> Candidate, shared Repair mode controls, inspect 0/contextual or strict max 1 Prose). Generate portable subgraph packages, root workflows for the four terminal-compatible recipes, verified definition pins and unresolved model roles. Roots supply sources and explicit output/review/apply terminals; reusable bodies contain neither. Factories never install, arm, resolve a profile or apply.

Expose these through the existing workflow starter picker and normal subgraph import; installation remains explicit. Update documentation with flows, mode limitations and setup. No automatic arming or replacement of the fresh default.

## Verification

Write/run missing-behavior tests before implementation changes; retain existing reviewed leaf regressions. Check runtime named ports, mode/reference-kind rewire rejection, role bounds, freshness, cancellation, package round trips, pinned definitions, protected/empty spans, original source identity and explicit Apply. Run all Node suites, project types, build/assets, strict new declarations and focused browser coverage. Serialize builds. One independent whole-branch review, then fix material findings with regressions. Preserve branch/worktree and handoff evidence for later integration; do not push Main.
