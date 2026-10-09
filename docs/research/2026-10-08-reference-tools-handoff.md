# Reference tools and library intake

Reviewed base: `193ebca23187fa6485735b1461b3b88fdd73bc65`. Branch: `codex/lattice-reference-tools`. Worktree: `C:/Users/Keptin/.codex/worktrees/lattice-reference-tools/SillyCanvas`.

This delivery is for separate intake after Architecture's current workspace release. It adds leaf engines, a separate adapter, policy content and portable packages. Core registration, runtime, UI, installed shelf and release assets remain Architecture-owned.

## Integration contracts

Transpose operations produce Patches from a frozen Draft. They do not acquire Apply authority. The common preparation helper preserves original parent spans and source provenance; settings may narrow existing permissions. Raw snapshots require an explicit scope to construct initial permissions. Node defaults explicitly select narration, while the pure engine defaults require existing authorization.

Style Transfer supports narration, character voice, rhythm and register modes. Format Transfer accepts a prose example or Data template. Each uses at most one injected Prose request and requires verified successful completion. Cancellation discards late output. Immutable text alignment fails when anchors are missing or ambiguous. Semantic preservation within allowed spans still requires review.

Terminology Map uses simultaneous literal substitutions, original offsets and Unicode word boundaries. It makes no model calls.

The slop policy library preserves the source document as policy data, with inspect, contextual and strict selections independent of scope and categories. Selection does not implement semantic cleanup rewriting.

Context Lens is a utility subgraph. Scene Compass also has a complete workflow package using operations present in the reviewed base, with one Analysis call by default.

Context Lens defaults to selection (zero requests); enabling compression adds one request, so a Scene Compass using compression has a bound of two. Model roles remain unresolved until normal binding setup.

Literal Cleanup and Formatting Cleanup remain documented recipes. Their factory IDs fail visibly until a registered permission-preserving prerequisite exists. The existing Pattern Scan overwrites upstream spans/scope/protected literals: independent runtime probes with empty spans, protected wording or dialogue plus empty spans each changed text with one request. Existing Text Rules also implicitly constructs whole-text permissions for raw Drafts. Static package composition cannot guard these behaviors on this base. The executable cleanup examples have therefore been removed; no core changes are included here.

## Delivered files

- `src/workflow/operations/reference-draft.{js,d.ts}`: authenticated frozen permission preparation, reconstructed parent patches and exact raw candidate alignment.
- `src/workflow/operations/terminology-map.{js,d.ts}`: synchronous simultaneous literal glossary mapping and original-offset findings.
- `src/workflow/operations/reference-transfer.{js,d.ts}`: asynchronous raw-prose Style/Format Transfer with injected bounded services.
- `src/workflow/operations/transpose-nodes.{js,d.ts}`: separate descriptors and named-input execution for `style-transfer`, `format-transfer` and `terminology-map`.
- `data/ai-slop-policy.json` and `src/workflow/library/slop-policies.{js,d.ts}`.
- `src/workflow/library/subgraphs.{js,d.ts}` and `docs/lattice-reference-library.md`.
- Two packages under `examples/library/subgraphs`: Context Lens and Scene Compass.
- One root under `examples/library/workflows`: Scene Compass.
- Portable source fixture and focused tests for policy content and package/runtime behavior.

The original source and portable fixture have identical SHA-256: `CA2AF9CDED518EDE3B37112BD3F51B1B99B8748F4503E6ECA2BD3EBB674F266D`. The policy lane passed independent spec and quality review at `b74069ca4c4a96c2ad424257d99f8ca291a6c3de`.

## Architecture intake checklist

- [ ] Review the final commit range and verification evidence below.
- [ ] Register the three Transpose operations and typed named ports through the existing catalog contract.
- [ ] Resolve Prose bindings through the existing control service; keep request bounds and injected execution authority.
- [ ] Include operation version, effective post phase, reference kind (Style/Format), mode, scope, strength, instructions, token limit, protected literals and terminology case/match controls in freshness checks. Capture reference and optional Context input identities through the existing execution plan.
- [ ] Preserve Draft/source-bound Patches, validation, review and explicit Apply behavior.
- [ ] Add shelf entries and user-facing presets after core validation accepts the operations. Character Voice presets must explicitly select dialogue.
- [ ] Import the existing-operation library packages through normal package validation and verified definition identities.
- [ ] Establish an explicit permission constructor and narrowing-only scan/rule behavior before enabling the documented cleanup recipes.
- [ ] Treat policy selection modes as content until a separately implemented semantic cleanup executor exists.

## Verification

Reviewed implementation HEAD: `28a1d8aa8fc2e35687fd4d0f57a6fdd6162570f0`. Final post-fix checks: all six new test files pass; full suite passes 88/91 with exactly the three baseline UI failures. Project types report zero errors/warnings and build succeeds; UI sources were unchanged by the final helper fix. Strict checking of all six new declarations succeeds with `--allowJs --checkJs false --skipLibCheck false`, matching the existing mixed-JS project. Assets verify 200 versioned local imports and the self-contained UI bundle. Git scope contains 28 added files and no modifications to existing base files.

An initial build/test overlap caused a transient missing-bundle failure in `blankets.test.mjs`; a stable rerun after restoring generated build outputs resolved it. Generated bundle/CSS changes are excluded from delivery. Check logs and review evidence remain under `.superpowers/sdd/2026-10-08-lattice-reference-tools/` in the retained worktree.

Independent task reviews are approved. Whole-branch review identified one helper restriction: changed whitespace-only windows were rejected even when their reconstructed parent patch was valid. The fix passed six RED→GREEN regressions, 51 affected tests and scoped independent re-review. Whole-parent blank rejection remains enforced by the unchanged validator. Final review disposition: ready for separate Architecture intake, subject to its registration/integration checks; no release or main-merge approval is implied.

Baseline before product edits: `npm ci --offline` succeeded; `npm test` passed 82 of 85 files. Existing failures were `loop-ui.test.mjs` (brand case), `workflow-controller-dispatch.test.mjs` (old UI orderedNodes projection) and `workflow-ui.test.mjs` (old unsupported-version diagnostic). Architecture acknowledged ownership of those active UI changes.

The final delivery tip adds completion documentation after the reviewed implementation HEAD; its exact SHA is supplied in the chat handoff. Exact paths are available with `git diff --name-status 193ebca23187fa6485735b1461b3b88fdd73bc65 <delivery-tip>`. All 28 paths are additions. A whitespace check reports two extra EOF blank lines in `terminology-map.js` and its test; this deferred formatting minor does not affect behavior.

## Decisions and costs

- Use disjoint parallel workers, serialized commits and joined checks: shared-interface defects can require rework at the join.
- Preserve Architecture ownership of the three baseline UI failures: full-suite green depends on its later integration.
- Keep JavaScript Results and declarations: implementation static checking is less comprehensive than a TypeScript build.
- Preserve raw fences and enforce immutable anchors: unwanted fences inside authorized windows require review.
- Deliver Context Lens as a utility subgraph: one fewer standalone root than the early proposal.
- Defer both runnable cleanup recipes until permission prerequisites exist: their availability is delayed; a safe current composition would make that delay avoidable.
- Preserve the branch/worktree/review evidence for intake: retained artifacts require disk space and later cleanup.

## Next intake: introspection modes

The separate introspection handoff can reuse Context Lens for Context Focus, Scene Compass for scene guidance and Compose/Select Fields/JSON Decode for deterministic routing and brief construction. Structured Reflect and Internalize require an agreed, registered Analysis operation and versioned actor-state, reflection and state-proposal schemas. Response Plan's Guidance output is not arbitrary structured Data. Proposed schemas, limits, source visibility and ownership are recorded in `2026-10-08-introspection-reference-tools-intake.md`; they are not implemented contracts.

Recommended first starter: selection/assembly → Reflect Character with behavior/attention hints → deterministic Express Behavior → Guidance. Proposed bound: one Analysis call; compression adds one. Internalize is a separate settled-event run with at most one Analysis. Inner Voice or post-draft expression would use at most one Prose request. Memory/State storage, retrieval, event settlement, stale/conflict handling and commits remain Architecture-owned host contracts and require agreement before implementation.

Tools and Nodes owns agreed mode recipes, prompts/defaults/examples, portable definitions and bounded leaf engines/adapters. Architecture owns shared schemas, catalog/runtime, sources/persistence, UI and release integration. This next intake does not expand the current delivery or Architecture's active release.
