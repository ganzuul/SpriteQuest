# Lattice examples browser and 30 roleplay recipes

Date: October 9, 2026. Design baseline: working checkout at `029a930`, package version 0.25.0.

Status: implemented in package version 0.26.0. The compact picker opens all thirty lessons from 37 validated native phase packages with six embedded definitions. Each click activates an independent editable primary copy and installs any companions atomically. Roles and local connections remain explicit; opening does not run, assign a phase, or arm a workflow.

Delivered paths: `examples/roleplay/`, `src/workflow/example-data.js`, and `src/workflow/examples.js` provide portable packages, bundled data, and atomic copy installation. `src/ui/example-catalog.js`, `ui/ExamplesBrowser.svelte`, and `src/ui/controller.js` project actual-package thumbnails and open the primary copy. `tools/build-roleplay-examples.mjs` generates the packages from the authoring catalog. The earlier conversation mockup remains a historical design artifact; it is separate from the production picker described here.

## Intent

Put **Open examples…** immediately below **Open workflow…** in the File menu. Help a player find a writing system by the result they want: a distinctive voice, better pacing, believable emotional change, a remembered promise, or consistent objects and scenes. The examples should demonstrate how Lattice combines model calls with deterministic preparation, validation, and persistence rather than transplanting a large roleplay preset into one instruction node.

The main deliverable is thirty differentiated roleplay recipes. The accompanying picker exposes them through compact graph thumbnails and names. The supplied Gaea image establishes the thumbnail-grid reference. The supplied JSON presets establish writing goals, not instructions for the designer or runtime.

Assumptions: examples are bundled locally; opening one creates an editable independent copy; browsing is free of model calls; thumbnails are derived from graphs. Fictional writing fixtures remain in the recipe documentation. No account service or background generation is needed.

## Revised experience: compact tile picker

The user rejected the large catalog screen and specified a much smaller menu in Lattice's theme and style, with very simple interaction: no sorting, just clickable tiles, each showing a node preview of its canvas. This revision replaces the previous gallery/list alternatives. The approved compact presentation stays the same. The catalog now follows a learning progression, with extension concepts documented separately from the thirty teaching examples.

### Size and appearance

Use one compact workspace dialog, approximately **560 px wide and 430 px tall**, with a header reading **Examples**, one close button, and a scrolling tile grid. Use three columns, 8 px gaps, roughly 170 px tile widths, 72 px canvas previews, and a short 12 px title below each preview. About nine tiles fit at desktop size. The content area is capped at 386 px; at small widths the dialog fits its container and the grid becomes two columns.

Use existing Lattice theme roles rather than a separate gallery palette: panel `--pc-panel-solid`, tile `--pc-block`, canvas `--pc-canvas`, border `--pc-border`, text `--pc-text`, muted text `--pc-muted`, and `--pc-accent` for hover/focus. Use the current system UI/Segoe UI font, 4 px corners, thin borders, and restrained inset/shadow styling. Honor the user's active Lattice/SillyTavern theme. The presentation uses the current default dark olive-gray palette.

### Simple interaction

Keep examples in the fixed lesson order, from simple to advanced. Categories may organize the design document, but have no controls, headers, or category navigation in the picker. There is **no search, sorting, filters, pagination, layout switcher, detail panel, before/after prose panel, graph inspector, or setup form** in this dialog.

Each tile is one native button with its canvas thumbnail and example name. Clicking a ready tile immediately opens an independent copy in the normal workspace and closes the picker. Configuration, previewing, model binding, phase assignment, and running happen through the existing workspace controls. No select-then-confirm step or separate Open button is needed. A brief hover/focus tooltip may describe the goal without adding permanent UI.

The scroll position survives closing and reopening. Native button focus and the existing dialog focus trap/Escape behavior remain available. Close restores focus to the invoking File-menu action, or its trigger when the menu has closed. The earlier interactive mockup used a local canvas view and return button; production tile clicks install and activate real native copies through the normal workspace.

Keep **File → Open examples…** immediately below **Open workflow…**. The existing **Workflows → Workflow examples…** entry opens the same compact picker.

### Node canvas previews

Each thumbnail is a **read-only miniature of the example's primary graph**, using its actual saved node positions, named nodes, typed pin colors, curved wires, canvas background/grid, and current theme. Generate it from the validated bundled workflow and the existing native presentation/rendering layer; do not run the workflow, scan the current chat, or invent a different graph for illustration. Fit its complete graph bounds into the thumbnail without cutting off nodes or wires. For a two-phase recipe, preview the primary package; both packages still open through the documented bundle lifecycle.

Cache thumbnails by recipe revision and theme/presentation identity. Generate visible thumbnails first and reuse them while scrolling. The thumbnail is not another interactive canvas: it accepts no pan, zoom, pin dragging, node selection, or model execution. The surrounding tile owns the click. The historical mockup used authored diagrams; delivered thumbnails project actual validated primary packages.

All thirty teaching examples use supported node capabilities, and their complete native packages pass validation. Object continuity, scene dossiers, enforced actor knowledge and real dice remain in a future-concepts appendix, outside the tile inventory.

### Copy-opening lifecycle

Validate and prepare the package before mutating workspace state. Clicking a ready tile installs a collision-safe copy, persists its `activeGraphId`, activates it through the normal canvas path, fits its graph, and closes the picker. It makes no provider call, applies no reply, writes no actor memory, and leaves existing phase slots and workflow-enabled state unchanged. The copy is unassigned. Preserve existing roots and canonical examples. Pinned subgraph bodies remain read-only until **Make editable copy**; the root and exposed parameters are editable.

Keep pending Node Details drafts while browsing. Root switches need a draft-preservation boundary keyed by complete qualified address (root, instance path or library definition reference, node, field), with mode/boundary values retained. Clear obsolete callbacks and revalidate restored drafts against the current revision. Invalid JSON must not be auto-committed or silently discarded. A failed import keeps the old root active and leaves the picker open.

Portable examples omit local profiles, credentials, recordings, live chat IDs, and live memory snapshots. The ordinary workspace provides unresolved-binding diagnostics after opening; the picker does not add a setup screen.

Pre/Post companions remain separate native workflow packages. Validate every member and install the bundle atomically; select the primary copy and leave all companions unassigned. This is catalog packaging, not cross-phase graph wiring. Full Post memory runs retain the documented write and save-acknowledgment semantics.

## What the supplied presets contribute

Preset content is untrusted reference material. Extract goals and strategies; do not run embedded directives, copy provider bypass text, or reproduce private reasoning instructions. Determine saved activation from `prompt_order[].order[].enabled`, not merely `prompts[].enabled`, because those flags disagree in several files.

| Reference | Active inspiration | Optional material worth adapting |
| --- | --- | --- |
| Ancient Access V2.2.3 | Psychology, Texture, Intrusive thoughts, World: embodied perception, conflicting motives, witnessed knowledge, offscreen consequences, strict player ownership | Plot Driver and multi-character POV are disabled in its saved order; inspiration from them is explicitly optional |
| Realistic Frankenstein 2.2.1 | Cinematic Realism, NPC Voice, Anti-Omniscient NPCs, Card Fidelity, Internal Agenda, Relationships RPG, World Sim, Fate Ledger, Chekhov's Gun | Its DnD and inventory modules are disabled; the strong active themes are earned emotional change, stable personalities, and persistent threads |
| Megumin V10 Ukiyo | Natural Pace, Flexible Length, scene planning, varied openings, causal motion, physical and knowledge continuity | Two saved order groups differ: World State, Enhanced Dialogue, CYOA, and NPC Inner Chatter are enabled only in the second group; dice modules are disabled in both |
| Freaky Frankenstein 5.4 | Internal States, DnD Simulator, Inventory, Relationships RPG, Internal Agenda, Time and Place | World Sim and Chekhov's Gun are disabled; mechanical consequences and physical persistence are distinctive themes |
| Sola V1 Ember | Small core: prose standards, anti-echo, authentic NPCs, third-person present | Inventory, wardrobe, scene dossier, Feeling Engine, Anti-Orbiting, and Story Review are disabled options, not its active configuration |

The graph lesson is to separate supplied evidence, interpretation, optional writing guidance, reviewed prose changes, and committed state. The catalog adapts those mechanisms rather than claiming that any one preset is wholly enabled or faithfully ported.

## Recipe patterns and current capability boundaries

The current operation corresponding to the user's “Recast” idea is **Style Transfer**; **Format Transfer** and **Terminology Map** cover related transformations. Use “Recast” as a descriptive term in the recipe documentation, while using actual operation names in graph diagrams.

Use these shared patterns in the catalog:

- **T — Reviewed transfer:** Reply Snapshot + Compose Reference Text → Style Transfer → Validate Patches → Review Gate → Apply Reply. At most 1 Prose call. The reference pin is required: an authored Compose supplies the voice/style brief. Format Transfer substitutes for Style Transfer in the format recipe. For Terminology Map, a Compose JSON source → JSON Decode branch supplies the required glossary Data, giving a zero-call recipe.
- **P — Scene planning:** Scene Context → Context Focus (selection) → Response Plan → Guidance. 1 Analysis call. Compression is off in base recipes; enabling model compression adds 1 call.
- **R — Character appraisal:** Scene Context + Memory Read State/Episodes → Reflect → Express Behavior/Attention → Guidance. 1 Analysis call. Omit memory readers when a recipe does not need history. Express Behavior/Attention is deterministic rendering of the model's structured appraisal, not another inference.
- **M — Capture settled experience:** Memory Read State + Memory Read Events → Internalize Experience/Pattern/Recovery → Memory Commit. 1 Analysis call, Post root. The next Pre run reads the updated state. Capture and recall are separate packages.
- **D — Deterministic assembly:** Memory Read or structured Data → Select Fields/Compose → Guidance. 0 calls. Compose accepts Data and named Text pins, not arbitrary Guidance inputs.

These outlines name dependencies; they are not portable package JSON or final coordinates. The concrete package author must use mode-specific typed pins.

Current boundaries that constrain the recipes:

1. Native graphs support dependency branches but execute sequentially. Multiple calls can use different node bindings; no concurrent model dispatch is implied.
2. Draft-input Style Transfer, Format Transfer, Terminology Map and Text Rules emit Patches. Validate emits Candidate. There is no Patches/Candidate → Draft adapter or patch merge: do not chain Draft transforms through those outputs. Text-input forms may produce Text for ordinary composition/chaining; they do not bypass reviewed reply application. Pattern Scan narrows configured literal Draft spans rather than universally selecting dialogue.
3. Transfer operations receive embedded Draft context from Reply Snapshot when their optional Context pin is unwired. Scene Context is Pre-only; do not wire it into a Post graph. There is no native routable Post Context source for a Post Reflect pipeline.
4. Memory is root-only, active-chat/selected-actor scoped. Group chats require an active actor. Records can retain object and scene observations in that actor's episodes, but that is not a shared entity/world store.
5. Memory Recall is deterministic token matching over stored episodes with a saved, fixed query. It has no input pins for a per-turn query and no vector/semantic index. Automatic present-cue association can use Reflect Recall over supplied bounded episodes at 1 Analysis call; it is model appraisal, not indexed lorebook activation.
6. State Value writes literal configured numbers, not formulas or inferred event deltas. State Track unions every supplied settled event ID; native Read Events supplies eligible public chat messages, not classified domain actions. “Count thefts” needs an event classifier/filter. The supported clock recipe is explicitly turn/event based.
7. Context Perspective retains explicitly visible messages. It cannot infer visibility annotations or keep secrets out of SillyTavern's independently assembled main prompt. Enforced per-character knowledge needs a host visibility/source contract.
8. Model requests can propose changes to meaning. Patch validation checks edits and permissions; it is not a semantic continuity or agency judge. Those safeguards must not be advertised as guarantees.
9. Memory Commit writes after a successful full Post root Run. Review Gate accepts Candidates, not state proposals; there is no separate review-click for a committed state proposal. Run to here previews without writing, but a subsequent full run recomputes. The normal workspace setup/run surface must say **Writes actor memory on full Run** for capture packages; the picker does not add a details panel.
10. Keep reply revision and memory capture in separate workflows. A repaired candidate is not settled evidence until applied; committing from the original before application can become stale when the swipe/revision changes.
11. Full Run may update local actor memory while native saving remains unconfirmed. Every actor-memory example must show the returned acknowledgment status and must not label an unconfirmed outcome durably saved. Memory and receipts are bounded; the distinct-event clock can commit retained IDs only while current settled evidence still includes them, so the current 64-position evidence horizon eventually needs explicit reconciliation/archive support.

## The 30 examples: a learning progression

The list has one authored order. A player can open any example directly, but scrolling down introduces progressively more configuration, typed artifacts, persistence, comment frames and reusable subgraphs. Six five-lesson stages organize this document only; they add no sorting, category navigation or section headers to the compact picker. Complexity means the amount of graph knowledge introduced, not a requirement for every lesson to have more nodes or calls than its predecessor.

Titles describe concrete tasks and observable artifacts: a plan, recap, saved record, message count, or reviewable prose edit. Avoid promises about ideal timing, lasting character outcomes, or automatic world activity.

Call bounds exclude the native roleplay reply. Pre/Post means separate companion packages and executions. Counts are ceilings; early exits can make fewer calls. Model-backed examples import with local roles unresolved.

| # | Example | New graph lesson | Auxiliary call ceiling |
| --- | --- | --- | --- |
| 01 | **Make a scene brief** | Typed Guidance pins; Literal Compose sections; Deterministic preview | Pre 0 |
| 02 | **Replace a repeated phrase** | Draft source; Literal Text Rules; Source-bound patches; Explicit review | Post 0 |
| 03 | **Build a brief from JSON** | Text → Data; JSON schema; Select Fields; Optional fallback; Data template | Pre 0 |
| 04 | **Apply a names-and-terms glossary** | Glossary Data; Simultaneous replacement; Zero-call review | Post 0 |
| 05 | **Plan an open-ended NPC response** | Scene Context; Context selection; First Analysis binding; Player ownership | Pre ≤1 |
| 06 | **Suggest the next scene beat** | Planning instructions; Completion cap; Open next beat | Pre ≤1 |
| 07 | **Plan a clear action sequence** | Protected evidence pins; Cause and effect; Context budget | Pre ≤1 |
| 08 | **Plan an ensemble scene** | Cast focus; Evidence omissions; One bounded plan | Pre ≤1 |
| 09 | **Draft a shorter reply** | First Prose binding; Reference Text; Whole-reply scope | Post ≤1 |
| 10 | **Revise descriptive detail** | Original reference samples; Protected literals; First comment frame | Post ≤1 |
| 11 | **Revise quoted dialogue** | Dialogue scope; Paired quotation selection; Register | Post ≤1 |
| 12 | **Use a dialogue voice reference** | Character voice mode; Independent scope and mode; Voice specimens | Post ≤1 |
| 13 | **Revise an emotional beat's pacing** | Rhythm reference; Pacing constraints; Semantic review | Post ≤1 |
| 14 | **Try a closer narration viewpoint** | Focal evidence; Limited viewpoint; Semantic review limits | Post ≤1 |
| 15 | **Try screenplay formatting** | Format Transfer; Whole scope; Structural reference | Post ≤1 |
| 16 | **Combine two style references** | Two reference branches; Named Text inputs; Priority composition; Commented stages | Post ≤1 |
| 17 | **Prepare a scene recap** | Selection versus compression; Two-call bound; Context omissions | Pre ≤2 |
| 18 | **Suggest a character reaction** | Native actor state; Reflect Character; Express Behavior | Pre ≤1 |
| 19 | **Explore competing motives** | Structured appraisal; Goal conflict; Identity versus condition | Pre ≤1 |
| 20 | **Record injuries and fatigue** | Pre/Post companions; Settled events; Internalize; Root Commit | Post ≤1 / Pre ≤1 |
| 21 | **Recall promises about a topic** | Fixed-query recall; Zero-result-safe template; Capture versus recall | Pre 0 / Post ≤1 |
| 22 | **Suggest a memory from a cue** | Memory Episodes; Model relevance appraisal; Evidence-linked recall | Pre ≤1 |
| 23 | **Consider recovery after an apology** | Recovery proposal; Different timescales; Retained distrust | Post ≤1 / Pre ≤1 |
| 24 | **Record relationship patterns** | Pattern internalization; Evidence-backed trust; Bounded history | Post ≤1 / Pre ≤1 |
| 25 | **Count settled messages** | State Track; Idempotency; Zero-call clock; 64-position evidence horizon | Post 0 / Pre 0 |
| 26 | **Recall an offscreen plan** | Scene appraisal; Offscreen agenda capture; Commented companion stages | Pre ≤1 / Post ≤1 |
| 27 | **Draft a fictional inner voice** | Analysis then Prose; Fictional inner voice; Text → Guidance | Pre ≤2 |
| 28 | **Build a reusable context lens** | First subgraph; Typed Context interface; Exposed parameters; Instance overrides | Pre ≤1 |
| 29 | **Build a reusable reaction brief** | Multiple typed inputs; Native state boundary; Exposed model settings; Reusable reaction | Pre ≤1 |
| 30 | **Combine memory with a voice pass** | Multiple definitions; Analysis branches; Text composition; Separate Post subgraph; Root effects | Pre ≤2 / Post ≤1 |

### Progressive organization

- **01–05 · Foundations:** literal Guidance, deterministic replacement, structured data and review, followed by the first bounded Analysis call. Small graphs remain visually open; aliases and concise wiring notes teach their flow.
- **06–10 · Flow and scope:** causal planning, cast focus and the first scoped Prose transfer. Example 10 introduces a native comment frame around its reference and transformation.
- **11–15 · References and formats:** each reference is written for its exact scenario. Quotation scope, voice mode, rhythm, viewpoint and whole-reply structure are independent choices.
- **16–20 · Context and character:** branch and compose reference Text, compare selection with compression, inspect native actor state, then introduce separate settled-capture and next-turn-guidance companions.
- **21–25 · Memory and state:** fixed-term and model-assisted recall, recovery, pattern capture and an idempotent deterministic clock. Comment frames identify evidence, interpretation and publication/commit stages.
- **26–30 · Composition and reuse:** annotated companion workflows, two-role inner voice, a Context Lens, a two-input Reaction processor, and the continuity-and-voice capstone with multiple reusable definitions.

### Node-specific teaching and customization

The [structured authoring catalog](../../research/2026-10-09-lattice-example-catalog.json) records every node in each phase and subgraph: canonical operation, meaningful alias, purpose, explicit supported settings, original reference text/fixture where needed, and the concrete artifact to inspect. A shared topology does not imply a shared generic prompt. Cadence, scope, protected literals, context windows, appraisal goals, budgets, field mappings and query terms are selected for the exact lesson.

Editorial goals such as sensory emphasis belong in authored instructions and reference sections; they are not invented runtime controls. Control-free sources, validators and terminals intentionally have empty settings, with teaching detail in aliases and inspection notes. Controls ignored by a mode are identified: Express Behavior renders hints deterministically and does not use inner-voice instructions/completion limits. Each example has two small modification exercises with an observable comparison. Documentation/test fixtures never seed live memory on import.

Use native **comment frames** around the member nodes named by each example’s commentGroups. Fill title and multiline notes with the wiring rationale, evidence assumptions and effect boundary. Enable Move contents and fit the frame to its members. A frame explains a stage; it does not change execution or turn those nodes into a processor. Later examples frame capture and guidance separately so the player can see where a full Run commits state.

### The final three subgraph lessons

**28 · Context Lens:** root Scene Context feeds a required Context input. Inside, deterministic Context Focus returns selected Context through an output boundary to a root Response Plan. Expose targetTokens, keepRecent, pins and purpose. Purpose is retained for compression and is inactive during deterministic selection. Instance overrides teach local configuration; Make editable copy teaches internal authoring; Add to Subgraphs and Save new subgraph teach reuse.

**29 · Character Reaction:** root Scene Context and Memory Read State feed required Context and Data boundaries. Inside, Reflect Character → Express Behavior → Guidance output. Expose appraisal instructions and its completion cap. Native record validation still applies after the Data boundary. Memory and final Guidance remain in the parent.

**30 · Continuity and Voice:** root evidence/state/episodes feed character and scene appraisal definitions. Each returns Text rendered from validated reflection fields. A deterministic two-Text composition definition produces Guidance. A separate Post wrapper accepts Draft and reference Text and returns Patches; Validate Patches, Review Gate and Apply Reply remain in that Post root. Commented bodies expose contracts, selected controls and model roles. Generate pinned identities from final validated bodies; an illustrative hash is not a native definition.

Opening these lessons exposes editable roots and instance parameters. Pinned bodies follow Make editable copy. Capture packages remain separate from writing processors; typed interfaces do not permit cross-phase wires or hide root-only Memory/Apply effects.

## Example metadata and packaging

The authoring catalog lives in `docs/research/2026-10-09-lattice-example-catalog.json`. `tools/build-roleplay-examples.mjs` materializes its settings, wires, notes, and definitions into ordinary validated `lattice-workflow` packages in `examples/roleplay/` and the bundled runtime module `src/workflow/example-data.js`. Runtime discovery and copy installation use that generated local module; the research catalog remains the editable authoring source.

An entry needs:

- Stable `id`, catalog revision, lesson position, title, curricular stage, one-sentence goal, and documentation tags. Only title and thumbnail appear on the tile; categories/numbers/tags are not picker controls.
- Capability readiness (`current-nodes` or `extension`) and required operation versions. Production readiness additionally requires authored package paths and validation; current-nodes alone does not enable Open.
- One or more `variants` identifying package path, phase, primary/companion status, required roles, authored call bound, and effects (`guidance`, `reviewed-reply`, or `actor-memory`).
- Canvas thumbnail source: the primary validated package plus recipe/theme revision. The existing before/after fixtures remain documentation/reference material and are not displayed in the compact picker. Fixtures stay outside graph runtime state and host memory.
- Graph outline, introduced features/prerequisites, full nodeDetails, two modification exercises, named commentGroups, typed authoringGraphs for every companion phase, subgraph interfaces/parameters and native definition drafts where needed, limitations, and source-theme notes. Runtime validation and request planning remain authoritative for actual requirements and call bounds.

Do not serialize a JavaScript factory, live data snapshot, model credentials, or executable preset prompt in the discovery manifest. Validate supported field lengths and enum values. Load bundled packages by allowlisted local paths. Render metadata as text. A malformed entry should show a diagnostic and not disable other valid entries; a manifest-load failure should keep the canvas accessible and offer retry.

For recipe #30 and other companion pairs, use a manifest grouping two valid packages. Atomic loading means prepare and validate all new graphs before changing workspace state; rollback the whole install if any dependency fails. This does not require changing the native workflow format.

## Proposed tracking extensions

These four future concepts sit outside the thirty-example curriculum. They are capability contracts, not an implementation scope hidden inside the picker:

- **Entity / Scene records:** versioned, chat-scoped records with stable IDs, aliases, source revisions, settled facts, and explicit changes. Keep authoritative world facts separate from an actor's belief or interpretation. Record ownership/location transitions and scene-local facts; reject ambiguous transfers instead of guessing. Retain lifecycle invalidation for edited/deleted/swiped evidence.
- **Trigger / Query bindings:** bind current context or selected fields to deterministic alias/keyword activation, with explicit limits, precedence, and an activation report. No recursive uncontrolled activation. Add semantic retrieval only as an explicitly model-backed option with its own call bound. Existing host lorebooks and extension stores require adapters; the gallery should never pretend it reads them automatically.
- **Visibility:** carry observed/communicated fact provenance and actor permissions into the auxiliary source and host integration. A filtered auxiliary call alone cannot enforce knowledge separation in the ordinary native generation.
- **Random Roll and Rules:** sample through an injected RNG, record seed/roll identity and verdict, freeze difficulty before sampling, and replay the settled verdict on retry. The model may classify the attempt or narrate an outcome, but cannot choose the random number or silently move difficulty afterward.

A later domain Event Mapper/Filter would let State Track count particular actions rather than all eligible messages. A later reviewed-state settlement feature would allow approval of a state proposal without regenerating it. Neither is assumed in current-node recipes.

## Integration seams

The delivered implementation uses native package validation and independent copy installation; discovery state stays outside workflow execution and graph semantics.

- `ui/WorkspaceMenus.svelte`: File entry and existing Workflows alias open the same picker.
- `ui/Workbench.svelte`: overlay visibility, focus/Escape handling, and a persistently mounted Node Details inspector.
- `src/ui/controller.js`: install/select the primary copy and persist `activeGraphId`; phase assignments and enabled state stay unchanged.
- `ui/WorkflowSetup.svelte` and `src/workflow/starters.js`: retain role setup and the eleven technical starters, separate from the thirty roleplay lessons.
- `src/workflow/examples.js` and `src/workflow/example-data.js`: validate all members before atomic installation of fresh copies.
- `src/workflow/packages.js` and `src/workflow/contracts.js`: pure package admission plus runnable validation; package admission alone accepts unfinished authoring graphs.
- `ui/types.ts`: typed independent tile-picker data, available even when the current graph is incomplete.
- `ui/NodeDetails.svelte`: qualified draft caching and callback expiration across root and inspector selection changes.
- `ui/ExamplesBrowser.svelte` and `src/ui/example-catalog.js`: compact presentation and cached actual-package thumbnail projection.

This integration preserves graph rendering, connection routing, runtime scheduling, and host memory semantics.

## Acceptance and authoring requirements

1. Exactly thirty unique curriculum entries in fixed simple-to-complex order; six documented stages contain five lessons each. Four future concepts remain outside the picker. All documentation fixtures are original fictional material; tile previews show node canvases.
2. File placement is immediately below Open workflow…; the old Workflows entry opens the same catalog. Close restores focus to the invoking File-menu action, or its trigger when the menu has closed.
3. Scrolling, thumbnail rendering, hovering, and tile clicks cause zero provider calls, reply edits, or memory writes.
4. Every Open action creates independent IDs, preserves prior workflows, leaves new copies unassigned, preserves existing phase slots/enabled state, and persists the selected graph across reload.
5. All model-backed packages import with local bindings unresolved and show setup diagnostics; a recipe cannot silently reuse credentials embedded in a file.
6. Every authored package passes existing schema, pin, phase, dependency, and model-call-bound validation. A companion bundle installs all-or-nothing. Every picker lesson uses supported operations; packages without successful runnable validation cannot expose an enabled Open action.
7. Pre fixtures exercise guidance; Post transfer fixtures exercise fresh-source validation and explicit review; Post capture fixtures exercise root-only/idempotent memory persistence separately from reply application.
8. Use synthetic model adapters and synthetic metadata for automated fixtures. Do not require a paid provider call to browse or verify the gallery.
9. Zero-call fixtures for glossary, known-term recall, and the consequence clock prove deterministic results. The clock proves no duplicate tick for repeated evidence, without claiming semantic event classification.
10. Responsive/browser checks cover compact dimensions, desktop/narrow layouts, long titles, all thirty thumbnails, one-click opening, scrolling, keyboard tile activation, close/Escape, focus return, and absence of search/sort/filter/detail UI. Existing unrelated connection tests are outside this design verification.
11. Before calling any recipe shipped, verify its actual package, controls, preview, local binding behavior, and effects. The design's count is not evidence that thirty runnable graphs exist.
12. Draft-preservation checks cover invalid JSON, obsolete callbacks/revisions, and two subgraph instances containing the same local node ID. Pinned-body editing continues to require Make editable copy.

13. Every node has explicit supported settings or an intentional control-free record, scenario-specific alias/purpose and inspection target. Generic renamed copies fail the teaching requirement.
14. Each lesson supplies two concrete modification exercises. Comment frames appear gradually, explain their member nodes and persist through export/copy. Lessons 28–30 provide typed definitions, exposed settings and root-owned sources/effects.

## Design artifacts and implementation delivery

- This approved system design and fixed 30-lesson progression.
- `docs/research/2026-10-09-lattice-example-catalog.json`: goals, graph outlines, fixtures, complete node-specific authoring details, experiments, comment groups, subgraph contracts and limitations for all thirty lessons, plus four separate future concepts.
- An interactive compact tile-picker presentation in the conversation. Its Open interaction demonstrates the proposed copy-opening state locally; it does not install or execute a production workflow.

Curriculum and authoring verification: all thirty lesson positions/IDs are unique and ordered; the four future concepts are excluded. There are 213 node-specific teaching records across 37 root graph plans, including companions. Current operation descriptors accept all 188 primitive configurations; 151 root connections have matching named pins and artifact types with all required inputs connected. Six native subgraph drafts pass computed identity and definition/topology validation. Comment frames stay within one phase and containing graph; the first nine lessons have no frames and the final three introduce subgraphs. The generator now materializes and validates all 37 portable packages and six embedded definitions; these admission checks make no provider calls and write no actor memory.

Historical mockup verification: the approved dialog measured 560 × 429 px on desktop, with 30 ordered tiles and primary node counts matching the authoring plans. Nineteen distinct root topology patterns were represented; common transfer/planning backbones carried different configurations. The final three thumbnails contained subgraph wrappers, and later lessons showed comment frames. Its headless checks covered direct tile opening, keyboard activation, reaching the final tile, close/reopen, no search/sort/filter/detail UI, container widths 736/400/320 px, state restoration with zero writes, and zero page errors. Those checks describe the historical design presentation, not production workflow execution.

Production picker integration and native package authoring are delivered in the paths listed above. `tests/workflow-example-execution.test.mjs` exercises seven representative native fixtures using synthetic host evidence and deterministic model adapters. This evidence covers representative guidance, review/application, and memory boundaries; it does not claim live-provider validation or a full execution check of every lesson.
