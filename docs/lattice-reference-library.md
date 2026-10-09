# Portable reference library

The library provides four reusable subgraphs and three complete authoring workflows using registered Lattice operations. All packages use schema 3/runtime 2 graphs, stable `lattice.library.*` definition IDs, version 1 and verified SHA-256 semantic hashes. The factories are pure: creation and parsing do not install definitions, resolve models, arm workflows, publish guidance or apply a reply.

| ID | Phase and boundary | Default requests | Operations |
| --- | --- | --- | --- |
| `context-lens` | Pre: Context → Context | 0 | Smart Compactor in selection mode |
| `scene-compass` | Pre: Context → Guidance | 1 Analysis | Context Lens → Response Plan |
| `literal-cleanup` | Post: Draft → Candidate | At most 1 Prose; 0 without editable matches | Pattern Scan → Repair → Validate Patches |
| `formatting-cleanup` | Post: Draft → Candidate | 0 | Text Rules in Draft mode → Validate Patches |

## Setup

Use `examples/library/subgraphs/*.json` for reusable definitions, or `examples/library/workflows/*.json` for complete workflows. A subgraph package is a `lattice-subgraph` envelope (`schema: 1`, `minRuntime: 2`). A complete workflow is a `lattice-workflow` envelope (`schema: 2`, `minRuntime: 2`). Parse with the existing `parseSubgraph` or `parseWorkflow` API and handle its Result before choosing to import through the application. Import/installation and workflow activation remain explicit application actions.

```js
import { createLibrarySubgraph, createLibraryWorkflow } from './src/workflow/library/subgraphs.js?v=0.19.1';
import { parseSubgraph, parseWorkflow } from './src/workflow/packages.js?v=0.19.1';

const reusable = createLibrarySubgraph('scene-compass');
if (reusable.ok) {
    const checked = parseSubgraph(reusable.data.json);
    // checked.data.definition and checked.data.definitions are detached portable data.
}
const complete = createLibraryWorkflow('literal-cleanup');
if (complete.ok) {
    const checked = parseWorkflow(complete.data.json);
    // Configure local role bindings before running checked.data.
}
```

Analysis and Prose roles have unresolved `model: null` bindings. Configure the required local role or instance override in the application before execution. The packages include no profile IDs, credentials or runtime recordings. Exporting a configured package strips local profile IDs through the existing package API. Model names, when supplied locally, are portable semantic settings; hashes therefore change if the model name changes.

Sources and terminals exist only in complete roots: Scene Context → Scene Compass → Guidance, or Reply Snapshot → cleanup → Review Gate → Apply Reply. The post roots produce review-required Candidates. The Apply Reply node does not supply Apply authority; the existing host freshness/review/approval path must authorize any actual mutation. Calling the public runtime in isolation records a terminal result and makes no Apply side effect.

## Controls and modes

**Context Lens** exposes `targetTokens`, `keepRecent`, `pins`, `method`, `purpose` and `maxTokens`. Selection removes flexible messages to fit the budget without a model request. Pinned and recent messages remain subject to the existing budget checks. Compression allows at most one Analysis request when input exceeds the target. Selecting compression changes the bound even when a particular input fits without a request. Context Lens outputs Context, so `createLibraryWorkflow('context-lens')` returns `LIBRARY_UTILITY_ONLY`; it cannot connect directly to Guidance. It can run as an artifact target inside a containing workflow.

**Scene Compass** embeds the exact selected Context Lens pin. It exposes the Lens controls, uses `compressionMaxTokens` for the nested completion limit, and exposes Response Plan `instructions` and `maxTokens`. Its default bound is one Analysis request. Switching the Lens to compression makes the complete root bound two. Planning proposes optional direction and preserves user agency; it does not establish events.

**Literal Cleanup** defaults to narration-only, case-insensitive scanning for exactly three supplied examples: `the words hung in the air`, `the tension was palpable`, and `something unreadable`. These are literal preferences rather than semantic detection or the full category policy library. Exposed controls are `rules`, `scope`, `caseSensitive`, `exemptions`, `pins`, `instructions`, `strength` and `maxTokens`. `pins` maps to Pattern Scan's `protectedLiterals`. Pattern Scan creates the selected original phrase spans; Repair receives only these spans and makes no request when none remain. Dialogue is excluded by the default narration scope. Exemptions and protected matches suppress editable selections. Validate Patches verifies replacements against the frozen original. Change scope/rules deliberately when adopting this package.

**Formatting Cleanup** exposes `rules` and defaults exclusively to literal CRLF → LF replacement. Lone CR characters remain unchanged. Text Rules processes Draft spans in its dedicated bounded Worker, with no model requests. Existing span permissions stay unchanged: narrow spans limit edits, and an explicit empty span list permits none. Existing protected literals flow into validation; a rule that removes protected wording fails. The existing Text Rules primitive constructs a whole-source span when an unscoped/whole Draft has no span list; supplying explicit spans is the way to constrain permissions. The package does not add a new permission constructor.

## Portable identity and later registration

Named interface ports and exposed control paths remain stable across package round trips. Scene Compass's dependency is bundled in one flat `definitions` table outside all definition bodies; complete roots also pin their top-level reusable definition. Missing or altered pins fail existing validation. Display labels and local profile IDs do not alter semantic identity; operation controls, model choices and exact nested references do. Generate examples by writing each factory's `data.json` verbatim; the focused test checks all seven files against their factories.

Style Rewrite, Terminology Map and Format Adapt helper engines are separate APIs. They are not registered catalog operations in this library release. Packages using new Transpose operation IDs cannot pass current core validation and are deferred until registration supplies descriptors, controls, typed pins and runtime execution. No such unknown IDs are emitted here.
