# Lattice introspection package

Date: October 9, 2026. Base: ca19c51d90e096b208d7d9cc84d7f3246d6fec7c (0.22.0).

The user explicitly instructed this chat to build the previously discussed introspection package in a worktree for later integration. Implement the accepted six-entry/mode design here. Preserve Main and other worktrees. No merge, push, publication, live paid generation, or migration of retired settings is part of this delivery.

## Scope

Ship complete, independently testable operation engines and typed dynamic node adapters for Reflect (Character/Recall/Scene), Internalize (Experience/Pattern/Recovery), Express (Behavior/Attention/Inner Voice), Context (Assemble/Perspective/Focus), Memory (Read/Recall/Commit), and State (Value/Curve/Track). Provide host-owned persistence adapters, integration examples and a cross-turn acceptance fixture. Shared Lattice registry/UI mounting is an explicit later integration step; this package must not pretend an unregistered operation is already usable on Main.

Use existing Context/Data/Guidance/Text shapes, schema-3 descriptor conventions, injected model roles, and no dependencies. Production relative imports retain ?v=0.22.0. JavaScript engines have matching declarations. All functions return Result values and reject malformed, oversized, stale, actor-mismatched or unverified data without authoritative output. No retries or private provider/profile resolution.

## Record boundary

Data records carry schemaVersion 1, recordType, scope {chatId,actorId}, store {id,version}, sourceRefs [{id,revision}], and payload. Limits: existing JSON limits (262144 UTF-8 bytes, depth 32, 10000 values); strings <=4096, source references <=64, collections <=64, changes <=32. IDs are nonblank strings <=128. Versions are nonnegative safe integers. Arrays are dense plain data; accessors, inherited fields and dangerous keys are rejected by the existing JSON boundary before cloning.

Actor state payload has traits, beliefs, goals, relationships, conflicts, conditions, episodes (item arrays), and values, curves, tracks (maps). Items have id, text, classification (observation/interpretation/possibility), and sourceRefs. Traits are not writable by Internalize. Each evidence ref must identify supplied scene/event material. Reflect may interpret but must not present player private state as known.

Reflection payload has brief, appraisals, conflicts, recalls, sceneChanges, behaviorHints and attentionHints (bounded text arrays), plus recalled episode IDs. State proposal payload has changes (upsert/remove on the permitted nontrait collections), and optional deterministic value/curve/track changes. Applying a proposal is a pure operation that creates a proposed state. A proposal has no write authority.

## Operations

Reflect uses one Analysis request, Context plus optional state/episode Data, and returns validated Reflection Data. Recall can reference only supplied episodes. Internalize uses one Analysis request against prior-state and settled-event records and returns a validated state proposal. Its three prompts distinguish experience updates, recurrence interpretation and recovery. Express Behavior/Attention deterministically render assessment hints into Guidance; Inner Voice uses one Prose request and returns fictional Text. All inference checks completion, cancellation, and provenance before returning.

Context Assemble delegates Context Join; Focus delegates Smart Compactor; Perspective retains only messages with explicit actor visibility and reports omitted IDs. It never promises secrecy in an independently assembled main prompt.

Memory Read returns an injected scoped snapshot. Recall uses bounded deterministic term matching of stored episodes (no vector backend). Commit constructs an explicit intent from a validated proposal; host settlement rechecks scope, source events, prior version and idempotency. State Value reads or proposes bounded numeric updates; Curve advances configured deterministic phases/recovery; Track counts distinct settled event IDs and maintains consequence clocks. State changes persist only through explicit Memory Commit.

## Persistence and lifecycle

Storage is injected, namespaced, chat/actor scoped, and compare-and-swap versioned. Commit checks every source against an injected current-settled-event validator, rejects possibilities/drafts, serializes transactions, and records idempotent receipts. Same key with different contents is an error. Revalidation after awaited work prevents stale writes. Save acknowledgments and unknown persistence are distinct outcomes; no blind retry. Preview, dry-run, nonroot execution and cancellation never commit. Source edit/swipe/delete invalidation is provided by the event adapter and tested. The public engine remains effect-free.

Provide an in-memory adapter for deterministic tests and a chat-metadata adapter requiring explicit getContext/saveMetadata/source-validator functions for integration. No effects occur on construction/import. Rollback from external deletion is not silently inferred; invalidation reports which evidence no longer exists and prevents a new stale commit. Stored historical records retain provenance for an explicit later reconciliation decision.

## Integration and acceptance

Adapters expose descriptor, mode-dependent named ports and bounded execute APIs; the integration handoff lists catalog/runtime/root-policy/UI/host mounting changes. Example manifests bind all six entries and can execute through the package harness before core registration. They must visibly state their integration requirement.

Acceptance: every mode exercised; record limits and malformed data; cancellation/truncated/missing finish; invalid evidence/unknown episode; private-player agency constraints in prompts; stale/double/conflicting commits; no preview/target commit; metadata persistence acknowledgment; deterministic curve/track and rollback invalidation; cross-turn apology where immediate anger eases while trust remains guarded; portable mode/control round trip. Baseline and final project suites, types, build and assets are recorded separately from integration-specific tests.
