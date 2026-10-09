# Reference tools completion handoff

The missing reference tools, cleanup modes and reusable library are implemented and reviewed on `codex/lattice-tools-completion`. This is a local branch for later integration. Main and the separate introspection work were not modified.

## Checkpoint

- Base: `ca19c51d90e096b208d7d9cc84d7f3246d6fec7c` (Lattice 0.22.0).
- Implementation: `c8ed4e583f8c820e6ab52936313fbe8e2199422b` (`feat: complete reference tools and library`).
- Delivery branch: `codex/lattice-tools-completion`; a following documentation commit completes the checklist and adds this handoff.
- Preserved worktree: `C:/Users/Keptin/.codex/worktrees/lattice-tools-completion/SillyCanvas`.
- No version bump, push, Main merge, live-provider request or automatic arming occurred.

## What is included

All three Transpose nodes are registered in the native catalog, runtime, search and Post shelf, with typed controls and named ports:

| Node | Inputs | Output | Model calls |
| --- | --- | --- | --- |
| Style Transfer | Draft, Text/Data reference, optional Context | Patches | At most 1 Prose |
| Format Transfer | Draft, Text/Data reference, optional Context | Patches | At most 1 Prose |
| Terminology Map | Draft, Data glossary | Patches | 0 |

Style supports narration, character voice, rhythm and register. The Character Voice preset explicitly selects dialogue; changing mode preserves scope. Reference kind changes preserve or reject incident wiring through the existing atomic control edit path.

Repair now has Inspect, Contextual Cleanup and Strict Avoidance modes. Inspect preserves the original and reports literal findings with original UTF-16 offsets, using zero model calls. Contextual/strict use at most one raw-prose Prose request with selected typed policies and bounded context. Available Reply Snapshot context is inherited unless an explicit Context input overrides it, including an empty input. Legacy repair/scan retain their incoming-permission semantics and expose only controls they enforce.

The complete supplied policy has 14 categories, 273 source occurrences and 271 unique entries, including 17 templates and 2 behavioral policies. Duplicate category memberships are preserved. Empty category selection means all categories. Categories, scope, case matching and protected wording are separate controls. Templates and behaviors are reported as requiring semantic assessment in Inspect; literal matches are not claims of semantic defects.

The canonical JSON is [data/ai-slop-policy.json](../../data/ai-slop-policy.json). Its browser module is generated from that JSON and checked for equality. The portable source fixture matches the attached document exactly: SHA256 `CA2AF9CDED518EDE3B37112BD3F51B1B99B8748F4503E6ECA2BD3EBB674F266D`. Document instructions were treated as policy data.

## Reusable subgraphs and workflows

Five verified, portable subgraphs are in [examples/library/subgraphs](../../examples/library/subgraphs/):

| Subgraph | Interface | Default request bound |
| --- | --- | --- |
| Context Lens | Context -> Context | 0; optional compression adds 1 Analysis |
| Scene Compass | Context -> Guidance | 1 Analysis; compression adds 1 |
| Literal Cleanup | Draft -> Candidate | At most 1 Prose; no matches means 0 |
| Formatting Cleanup | Draft -> Candidate | 0 |
| Prose Cleanup | Draft and optional Context -> Candidate | At most 1 Prose; Inspect/empty permissions means 0 |

Reusable bodies contain neither root sources nor Apply authority. Definition identities and dependency pins are verified. Model roles remain unresolved until configured.

Four complete workflows are in [examples/library/workflows](../../examples/library/workflows/), and the starter picker now offers eight choices. New starter IDs are `scene-compass`, `library-literal-cleanup`, `formatting-cleanup` and `prose-cleanup`. Installing creates an independent graph without assigning a phase or arming workflows. Context Lens remains a utility without a standalone terminal workflow.

Literal Cleanup targets narration with `the words hung in the air`, `the tension was palpable`, and `something unreadable`. Formatting Cleanup explicitly defaults to whole scope and CRLF -> LF. Prose Cleanup defaults to contextual/narration. The older `literal-cleanup` starter remains a separate deterministic Text Rules example.

## Permission compatibility

Pattern Scan narrows existing source-bound spans, preserves authoritative empty spans, unions protected wording/exemptions, and retains upstream exemption matching semantics. New exemption policies can conservatively narrow permissions; a rescan cannot reinterpret upstream exemptions or return permissions rejected by downstream validation.

Draft Text Rules now requires existing permissions or an explicit construction scope (`whole`, `narration` or `dialogue`). Its engine default is `authorized`. Bundled Draft presets, existing literal workflows and the saved literal subgraph explicitly select whole to retain their intended behavior. Existing permissions still restrict whole scope. Reconstruction retains original parent span indices.

All proposals follow source-bound Patches -> Validate Patches -> Review Gate -> explicit Apply. Protected dialogue, immutable anchors, source freshness, cancellation and recognized successful completion are checked before authority is published. Local checks enforce permissions and provenance; prose meaning and deliberate voice still require human review. No hidden retry attempts to force a revision.

## Verification and review

- Full Node suite: **111/111 test files passed** after the review fixes.
- Complete browser suite: **140/140 passed** on the isolated local harness at port 4182, including actual shelf presets, mode-dependent Details, saved controls, named reference pins and existing workflow/review behavior.
- Svelte/type check: **0 errors, 0 warnings**. Strict checks of nine new/modified declaration entrypoints passed without skipping declaration checks.
- Production UI build passed; asset check verified **241 versioned local imports** and the self-contained UI bundle.
- Documentation checker passed: **7 guides, 116 local links, 19 operations**. Staged whitespace and capture-tool syntax checks passed.
- Independent read-only whole-branch review found no Critical issues and three Important findings. Inherited cleanup context, exemption case semantics and misleading legacy Repair controls were reproduced with failing regressions, fixed, and verified. Canonical packages were regenerated after descriptor changes.

No live-provider prose evaluation was run. Tests use injected services and cover zero/one request bounds, prompt redaction, invalid/truncated/cancelled output, permission narrowing, source identity and stale control publication.

## Later integration

1. Integrate this branch after coordinating with the architecture chat's current Main. The implementation is one commit; the branch also contains its delivery documentation. Do not add the separate introspection implementation from this branch.
2. Resolve concurrent changes in catalog/runtime/starters, native search/shelf, permission handling and workflow examples against current Main. Preserve the constraints documented above and the matching regression tests.
3. If operation descriptors change during integration, regenerate the nine library packages from `createLibrarySubgraph` / `createLibraryWorkflow` and regenerate any affected existing definition identity. The library tests check canonical equality and verified pins.
4. Run Node, type/declaration, browser, build/assets and documentation checks on the integrated result. Release version/cache stamping belongs to the integration/release work; this branch deliberately remains 0.22.0.

See [the user guide](../lattice-reference-library.md), [completion design](../superpowers/specs/2026-10-09-lattice-tools-completion-design.md) and [implementation checklist](../superpowers/plans/2026-10-09-lattice-tools-completion.md). Local evidence is preserved under `.superpowers/sdd/2026-10-09-lattice-tools-completion/` in this worktree.
