# Portable reference library

The library provides Context Lens and Scene Compass reusable subgraphs, plus the complete Scene Compass workflow. Both cleanup recipes are deferred until registered operations can enforce their permission prerequisites. Shipped packages use schema 3/runtime 2 graphs, stable `lattice.library.*` definition IDs, version 1 and verified SHA-256 semantic hashes. The factories are pure: creation and parsing do not install definitions, resolve models, arm workflows, publish guidance or apply a reply.

| ID | Phase and boundary | Default requests | Operations |
| --- | --- | --- | --- |
| `context-lens` | Pre: Context → Context | 0 | Smart Compactor in selection mode |
| `scene-compass` | Pre: Context → Guidance | 1 Analysis | Context Lens → Response Plan |
| `literal-cleanup` | Deferred recipe | No executable package | Permission-preserving scan/repair registration required |
| `formatting-cleanup` | Deferred recipe | No executable package | Explicit permission-construction prerequisite required |

## Setup

Use `examples/library/subgraphs/context-lens.json` or `scene-compass.json` for reusable definitions, and `examples/library/workflows/scene-compass.json` for the complete workflow. A subgraph package is a `lattice-subgraph` envelope (`schema: 1`, `minRuntime: 2`). The complete workflow is a `lattice-workflow` envelope (`schema: 2`, `minRuntime: 2`). Parse with the existing `parseSubgraph` or `parseWorkflow` API and handle its Result before choosing to import through the application. Import/installation and workflow activation remain explicit application actions.

```js
import { createLibrarySubgraph, createLibraryWorkflow } from './src/workflow/library/subgraphs.js?v=0.19.1';
import { parseSubgraph, parseWorkflow } from './src/workflow/packages.js?v=0.19.1';

const reusable = createLibrarySubgraph('scene-compass');
if (reusable.ok) {
    const checked = parseSubgraph(reusable.data.json);
    // checked.data.definition and checked.data.definitions are detached portable data.
}
const complete = createLibraryWorkflow('scene-compass');
if (complete.ok) {
    const checked = parseWorkflow(complete.data.json);
    // Configure local role bindings before running checked.data.
}
```

The Analysis role has an unresolved `model: null` binding. Configure the local role or instance override in the application before execution. The packages include no profile IDs, credentials or runtime recordings. Exporting a configured package strips local profile IDs through the existing package API. Model names, when supplied locally, are portable semantic settings; hashes therefore change if the model name changes.

The shipped complete root is Scene Context → Scene Compass → Guidance. Sources and terminals remain outside reusable definition bodies. No post cleanup roots or Apply Reply nodes are shipped by this library.

## Controls and modes

**Context Lens** exposes `targetTokens`, `keepRecent`, `pins`, `method`, `purpose` and `maxTokens`. Selection removes flexible messages to fit the budget without a model request. Pinned and recent messages remain subject to the existing budget checks. Compression allows at most one Analysis request when input exceeds the target. Selecting compression changes the bound even when a particular input fits without a request. Context Lens outputs Context, so `createLibraryWorkflow('context-lens')` returns `LIBRARY_UTILITY_ONLY`; it cannot connect directly to Guidance. It can run as an artifact target inside a containing workflow.

**Scene Compass** embeds the exact selected Context Lens pin. It exposes the Lens controls, uses `compressionMaxTokens` for the nested completion limit, and exposes Response Plan `instructions` and `maxTokens`. Its default bound is one Analysis request. Switching the Lens to compression makes the complete root bound two. Planning proposes optional direction and preserves user agency; it does not establish events.

## Deferred cleanup recipes

Both factory APIs return `{ok:false,error:{code:'LIBRARY_PERMISSION_PREREQUISITE',message:...}}` for `literal-cleanup` and `formatting-cleanup`, before creating a definition, graph or JSON package. Their four executable example files are intentionally absent. This applies even when a caller intends to supply restricted or already-authorized input; these static compositions cannot validate that prerequisite safely at the library boundary.

**Literal Cleanup, future recipe:** Post Draft → Candidate through a permission-preserving scan, Repair and Validate Patches. The unchanged registered Pattern Scan replaces incoming spans, scope, exemptions and protected literals. As a result, its original proposed static composition could broaden an empty span list, dialogue-only scope or protected phrase into editable narration. It cannot satisfy the rule that existing spans remain frozen and scope only narrows. Registration must preserve/intersect upstream permissions and carry protected wording before this recipe becomes executable. No core operation changes are made here.

The intended defaults remain narration-only, literal mode, `caseSensitive:false`, no exemptions or extra pins, and exactly three supplied rules: `the words hung in the air`, `the tension was palpable`, `something unreadable`. These are literal preferences rather than semantic detection or the full category policy library. Planned controls are `rules`, `scope`, `caseSensitive`, `exemptions`, `pins`, `instructions`, `strength` and `maxTokens`. Repair defaults are `mode:'repair'`, `strength:'light'`, `maxTokens:2048`, with instructions: “Replace only selected literal phrase spans with plain context-appropriate wording. Preserve meaning, dialogue and protected wording.” Future execution would allow at most one Prose request, with zero for no authorized matches, and validate replacements against the frozen original. Planned complete flow is Reply Snapshot → cleanup → Review Gate → Apply Reply; host review/freshness approval would still own Apply authority.

**Formatting Cleanup, future recipe:** Post Draft → Candidate through Text Rules Draft and Validate Patches. The unchanged Text Rules primitive implicitly constructs whole-source spans when spans are absent and scope is absent/whole. Missing permission construction must be explicit under this library's contract; a static graph cannot enforce that prerequisite with the available operations. Registration must reject missing permissions or require a separate explicit permission constructor, while preserving existing narrow/empty spans and protected wording.

The intended defaults remain `inputKind:'draft'`, `mode:'replace'`, `separator:'\n'`, and exactly `rules:[{kind:'literal',pattern:'\r\n',replacement:'\n'}]`, with no extra validation pins. Only CRLF → LF normalization is intended; lone CR characters remain unchanged. The planned exposed control is `rules`; future permission-safe execution would make zero model requests through the dedicated bounded Worker and produce a review-required Candidate. These defaults are documentation for later intake, not an executable package or an endorsement of implicit whole-text permissions.

## Portable identity and later registration

Named interface ports and exposed control paths remain stable across package round trips. Scene Compass's dependency is bundled in one flat `definitions` table outside all definition bodies; its complete root also pins the top-level reusable definition. Missing or altered pins fail existing validation. Display labels and local profile IDs do not alter semantic identity; operation controls, model choices and exact nested references do. Generate shipped examples by writing each successful factory's `data.json` verbatim; the focused test checks all three shipped files against their factories and verifies the four deferred files are absent.

Style Rewrite, Terminology Map and Format Adapt helper engines are separate APIs. They are not registered catalog operations in this library release. Packages using new Transpose operation IDs cannot pass current core validation and are deferred until registration supplies descriptors, controls, typed pins and runtime execution. No such unknown IDs are emitted here.
