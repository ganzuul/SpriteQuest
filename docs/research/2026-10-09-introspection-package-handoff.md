# Introspection package integration handoff

Worktree: C:/Users/Keptin/.codex/worktrees/lattice-introspection/SillyCanvas. Branch: codex/lattice-introspection. Base: ca19c51d90e096b208d7d9cc84d7f3246d6fec7c (0.22.0). Main and other worktrees are untouched. This package implements the reduced six-entry Ancient Access inspired design; it has no dependency on the external JSON file.

## Delivered

`src/workflow/introspection/` contains shared versioned contracts, Reflect/Internalize/Express analysis, deterministic Context/State engines, Memory service and storage adapters, dynamic node descriptions/execution, and the manifest harness. Matching declarations accompany each module. `tests/introspection-*.test.mjs` cover package boundaries and lifecycle; `examples/introspection/` contains three explicitly package-only manifests. See `docs/introspection-package.md` for exact port shapes, controls and storage contract.

The package imports existing Context Join, Smart Compactor, Context validation and JSON validation. It adds no dependencies and keeps versioned production imports. The node wrapper validates modes, named ports and input kinds before provider reads/requests, and bounds actual requests. All model roles are existing Analysis/Prose roles. Shared selection/validation/composition are internal support rather than extra canvas entries.

## Later native integration

1. Register six IDs in `src/workflow/catalog.js`, delegating mode-dependent descriptions/ports to `describeIntrospection`. Preserve mode controls in schema-3 import/export and call-bound compilation. Translate UI descriptor controls using the current catalog convention.
2. Add `executeIntrospection` dispatch in `src/workflow/runtime.js`, passing the runtime's existing resolved request/binding/token-count/signal ports. Preserve the native global call accounting; the package wrapper is a second bound, not a replacement.
3. Apply root-policy validation to Memory Read/Recall sources and post-phase Memory Commit terminal. Candidate execution produces an intent only. Native public `runWorkflow` remains effect-free.
4. Wire the host's scoped memory service through trusted `runWorkflowForHost` prepare/settle lifecycle. Settle only an explicitly compiled root intent after successful execution, never preview/dry-run/target/cancelled execution. Recheck active chat, expected version and exact current settled evidence immediately before persistence. Keep save acknowledgments distinct from unknown outcomes.
5. Supply revisioned settled-event DTOs from the host's selected committed message revisions. Edit/swipe/delete invalidation must update `readEvents`/`validateSources`. Do not treat drafts, candidate outputs or model private reasoning as settled events. Do not silently erase historical story state when evidence is invalidated.
6. Mount all six entries in the add-node menu and inspector using current catalogue-driven UI. Reuse existing port styling and controls; no bespoke canvas family is required. Convert the example manifests to schema-3 native graph starters once registered and add native runtime/browser coverage for mounting and settlement.

These mounting edits are intentionally absent from this branch, so merging the package alone does not make new nodes appear in the native menu. The portable package harness is runnable now with injected adapters. Integrators should use the delivered engine tests as acceptance contracts and add native lifecycle tests for their host wiring.

## Review and verification

Baseline npm test:102/102 files passed. Final frozen-tree npm test:109/109 files passed. Package suites:7/7 files passed, including strict public TypeScript consumption. Project types:0 errors/0 warnings. Vite build and asset verification passed (238 versioned local imports). Existing browser regressions:137/137 passed; these cover the current UI, with package mounting still deferred as described above. No live paid model calls were made; all new request tests use deterministic fixtures.

Independent whole-package review approved after regression-backed fixes for optional Express inputs, original-input watches across awaited work, capability and provider-result accessors, Perspective nested metadata, declaration usability, unsafe manifest IDs, and commit/event lifecycle boundaries. Two-turn tests exercise both storage adapters. No additional actionable findings remain within package scope. Host-wide atomic persistence coordination and native mounting remain explicit integration obligations.
