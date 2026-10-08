# Turnkey nodes: community references and proposed behaviors

Research date: October 7, 2026. Status: recommendations for discussion, not implemented nodes or an approved runtime specification. Family labels remain **Input, Shaping, Surface, Transpose, Derive, Output**, in that display order.

## Aim

Give users useful operations that can be dropped into a workflow as one node, with sensible controls, while allowing inspection and customization of the primitive steps inside. Preserve [native SillyTavern ownership and the node-family boundaries](2026-10-07-comfytavern-node-family-catalog.md). Each internal model operation can use its own supported connection profile through the proposed shared routing contract.

These recommendations combine community reports with verified tool behaviors. The text operations are design inferences, not demonstrated fixes or claims of quality parity with terrain/image algorithms. The research sample does not establish the most popular nodes by votes, installations, downloads, or current market share.

## Community signals

### ComfyUI

The useful signal is demand for convenient wrappers, local repair, explicit data flow, and inspection. In the sample, rgthree and Impact Pack recur as recommendations. Image-specific loaders are not necessarily useful writing features; borrow their useful controls and metadata rather than their names.

| Primary discussion | Relevant signal |
| --- | --- |
| [Favorite custom nodes](https://www.reddit.com/r/comfyui/comments/1l4lnpi/please_share_some_of_your_favorite_custom_nodes/) | Recommendations include KJNodes Get/Set, rgthree, Crystools, Impact Pack, metadata-rich loaders, crop/masked paste, presets, and data manipulation. |
| [Crop and Stitch author update](https://www.reddit.com/r/comfyui/comments/1jsq6ph/huge_update_inpaint_crop_and_stitch_nodes_to/) | A clear select/crop, transform, and restore workflow that protects unselected surroundings. |
| [Image description/analysis node](https://www.reddit.com/r/comfyui/comments/1oti4ff/does_anyone_know_of_a_good_image/) | Auxiliary analysis produces descriptive text that feeds the main pipeline; discussion also illustrates dependency and preset friction. |
| [Regional prompt discussion](https://www.reddit.com/r/comfyui/comments/1e7ka3s/) | Separate prompts and masks permit scoped influence rather than one undifferentiated input. |
| [Switching prompts without reconnecting](https://www.reddit.com/r/comfyui/comments/1erizhy/) | Users want selectable alternatives and reusable preset fields. |
| [Loop-node discussion](https://www.reddit.com/r/comfyui/comments/1frhzxg/) | Lists, carried state, and result accumulation need understandable semantics. |

The June and November 2025 threads and the Crop and Stitch author thread were opened directly. Some older threads were available through indexed extracts when direct opening failed. Cached rendering and scores do not establish current rankings; no vote totals are used.

Implementation behavior was checked against author documentation and core sources: [Impact Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack), [Crop and Stitch](https://github.com/lquesada/ComfyUI-Inpaint-CropAndStitch), [rgthree](https://github.com/rgthree/rgthree-comfy), [Inspire Pack](https://github.com/ltdrdata/ComfyUI-Inspire-Pack), and [ComfyUI conditioning source](https://github.com/Comfy-Org/ComfyUI/blob/master/nodes.py). GitHub material was inspected through network-enabled GitHub CLI. Core [subgraph blueprints](https://docs.comfy.org/custom-nodes/subgraph_blueprints), [lazy evaluation](https://docs.comfy.org/custom-nodes/backend/lazy_evaluation), and [list semantics](https://docs.comfy.org/custom-nodes/backend/lists) provide relevant contracts. Some generated built-in-node documentation was supplemented with the core source rather than treated as sole authority.

### SillyTavern

These are concrete reported needs. Advice in the replies is not evidence that a proposed remedy works universally.

| Primary discussion | Relevant need |
| --- | --- |
| [Unwanted AI prose habits](https://www.reddit.com/r/SillyTavernAI/comments/1wogwea/whats_that_one_ai_slop_wordbehaviour_that_irks/) | Canned prose, habitual constructions, and unwanted paraphrasing; commenters differ on what counts as unwanted style. |
| [Dealing with repetition](https://www.reddit.com/r/SillyTavernAI/comments/1wzoes6/how_do_you_deal_with_repetition/) | Repeated concepts, gestures, and reply structure can persist even when wording changes. |
| [Prompt postprocessing and user agency](https://www.reddit.com/r/SillyTavernAI/comments/1s9uc6n/recomended_settings_for_prompt_post_procesing/) | Unwanted narration or dialogue for the user-controlled actor. |
| [Characters sounding alike](https://www.reddit.com/r/SillyTavernAI/comments/1qvkkha/why_all_your_ai_characters_sound_the_same_and_how/) | Distinct voice should be grounded in character and situation rather than cosmetic catchphrases alone. |
| [Memory versus lorebook canon](https://www.reddit.com/r/SillyTavernAI/comments/1wngca8/a_question_on_memory_and_lorebook/) | This chat's events can conflict with franchise canon; storage and precedence are separate concerns. |
| [Roleplay progression and pacing](https://www.reddit.com/r/SillyTavernAI/comments/1qyeakp/ai_roleplay_seems_to_require_a_skill_how_do_you/) | Passive replies stall, while forced progression can become rushed or repetitive. |
| [Character knowledge boundaries](https://www.reddit.com/r/SillyTavernAI/comments/1wbkbla/is_local_rp_actually_capable_of_handling_basic/) | Characters know information that the scene has not revealed to them. |
| [Context limits and characterization drift](https://www.reddit.com/r/SillyTavernAI/comments/1wjcc70/a_bit_of_help_with_a_cardlorebook_i_made/) | Context bloat, lost details, and exaggerated character traits. |

All eight SillyTavern thread bodies were opened. Calendar dates appeared in search-rendered extracts, but relative ages sometimes disagreed across cached views; precise timestamps and popularity counts are omitted. This is a purposeful sample, not a prevalence survey or a study of model quality.

## Transferable behaviors

| Reference behavior | ComfyTavern adaptation |
| --- | --- |
| Impact Pack detector plus detailer | Find a specific problem, then transform only the relevant material. Package those stages behind a useful operation. |
| Crop and Stitch; regional conditioning | Select spans or fields, provide surrounding context, revise selected material, and restore it into the original artifact. |
| Conditioning Combine versus Average | Distinguish collecting inputs from reconciling them and from composing style influences. Text does not have a literal equivalent of numeric conditioning interpolation. |
| rgthree switches and comparison | Offer enabled alternatives, explicit fallbacks, and original/candidate inspection without rewiring. |
| Gaea [Combine](https://docs.gaea.app/reference/nodes/utility/combine.html) | Merge references with declared roles and priorities; do not advertise a mathematical percentage blend of prose. |
| Gaea [Modify](https://docs.gaea.app/reference/nodes/modify/index.html) | Expose controlled transformation strength, scope, and cleanup intent rather than a generic instruction box alone. |
| Gaea [Derive](https://docs.gaea.app/reference/nodes/derive/index.html) | Produce reusable descriptions and selections that guide later operations without directly editing the source. |
| Gaea [Surface Nodes](https://docs.gaea.app/using/using-gaea/crafting-the-surface/surface-nodes.html) and [Transpose](https://docs.gaea.app/using/using-gaea/crafting-the-surface/transpose-shapes.html) | Separate semantic content from expression, then optionally apply reference character to the expression. Model preservation remains a requested constraint, not a geometric guarantee. |
| Gaea [Macros](https://docs.gaea.app/developers/extensibility/macros/building-macros.html) and ComfyUI blueprints | Present an internal graph as a reusable node with named ports and a small exposed control surface. |

For text, a mask means selected spans, message ranges, actors, or structured fields. It is a scope contract, not an image mask. For deterministic patch application, unselected text can remain byte-for-byte unchanged; meaning inside rewritten spans still needs review. Controls such as strength or influence express requested behavior, not calibrated numeric guarantees.

## Recommended candidate catalog

The following twenty entries are a design pool. Related entries can be variants of the same compound definition. Request counts describe the proposed base configuration, exclude the ordinary native reply, and do not imply current runtime support. Optional judges, extraction, retries, loops, and per-item processing must be counted separately.

| Family | Node | Unique behavior and useful controls | Proposed base auxiliary calls |
| --- | --- | --- | --- |
| Input | **Scene Context** | Collect explicitly selected chat, character, and available notes/lore into a labeled, bounded source bundle. Expose source selection and limits; retain origins and omissions. Does not magically retrieve every extension's memory or reproduce the final native prompt. | 0 |
| Input | **Reply Snapshot** | Freeze the reply chosen for revision and attach chat/message/swipe/content identity. Downstream work uses that source rather than a changing latest-message lookup. | 0 |
| Input | **Reference Set** | Load approved passages or briefs from the library, label their intended role, and limit sample size. Supports several voices/styles without rewriting the source references. | 0 |
| Shaping | **Next Beat** | Produce a bounded scene opportunity from unresolved hooks, actor goals, and current context. Expose pace, initiative, and user-controlled actors; keep unchosen possibilities out of established facts. | 1 |
| Shaping | **Smart Compactor** | Develop the Context Distiller proposal into task-focused, target-budget reduction with pins, recent material, and a preservation/omissions report. Pass small inputs unchanged; optionally compress flexible material. Does not replace native budgeting. | 0 selection/pass-through; +1 ordinary compression |
| Shaping | **Perspective Mixer** | Ask selected perspectives for proposals, then reconcile them into one guidance brief with declared priorities and conflict notes. Expose branches and connections; avoid concatenating contradictory advice. | 3 for two perspectives plus synthesis |
| Surface | **AI De-slop** | Flag user-selected prose habits and propose limited repairs. Expose pattern profile, exceptions, edit scope, strength, and protected wording; preserve the original for comparison. | 0 literal scan; 1 repair |
| Surface | **Repetition Breaker** | Compare the draft with recent turns for repeated wording, gestures, imagery, and response structure; vary the selected repetitions while exempting intentional motifs and recurring facts. | 1 |
| Surface | **Dialogue Detailer** | Select spoken passages, supply surrounding context, revise them in a batch, and splice accepted patches into the original. Expose naturalness, rhythm, and scope while leaving unselected narration intact. | 1 for one batch |
| Transpose | **Voice Match** | Adapt target passages using approved character dialogue or a voice brief, accounting for the current emotional situation. Expose narration/dialogue scope and influence; avoid mandatory repeated catchphrases. | 1 |
| Transpose | **Style Blend** | Assign different references to features such as dialogue, description, rhythm, and formality, then revise the target. Show priorities; requested weights are not literal prose interpolation. | 1 with supplied references |
| Transpose | **Format Adapter** | Convert content to a selected structure such as screenplay, scene brief, or structured record. Validate required fields and preserve source facts as constraints; distinguish model conversion from deterministic rendering. | 1 conversion; 0 supported deterministic rendering |
| Derive | **Continuity Audit** | Compare a draft with supplied chat facts and selected canon precedence. Return conflicts and evidence links for time, location, possessions, relationships, or prior events; do not silently rewrite. | 1 |
| Derive | **Agency Check** | Flag newly assigned speech, feelings, choices, or voluntary actions for user-controlled actors. Expose strict roleplay versus co-writing permissions and distinguish allowed consequences from invented decisions. | 1 |
| Derive | **Knowledge Map** | Derive what each actor has observed or learned, linking evidence and marking unknowns. Can feed viewpoint guidance. It cannot guarantee secrecy if the native writer still sees all underlying facts. | 1 |
| Derive | **Memory Distiller** | Produce proposed event/entity records from selected conversation, deduplicate them, and attach source references. Distinguish established events, guesses, proposed futures, and retcons; save only through an explicit output. | 1 for one bounded batch |
| Derive | **Style Fingerprint** | Derive a reusable style/voice brief from approved examples, separating vocabulary, sentence rhythm, dialogue, and situational exceptions. Simple statistics can accompany the brief. | 1 brief; 0 optional literal statistics |
| Output | **Guidance** | Publish a bounded artifact into ComfyTavern-owned prompt keys with declared placement/lifetime and cleanup. SillyTavern still assembles and generates the main reply. | 0 |
| Output | **Review Gate** | Combine original/candidate comparison, available issue reports, source freshness, and an accept/reject choice. Apply only an accepted candidate against its source identity; no hidden judge request. | 0; a model judge is a separate option |
| Output | **Memory Commit** | Save explicitly selected records to ComfyTavern-owned memory or a selected supported lorebook mirror. Respect source/settlement rules; do not assume adapters to other extensions' stores. | 0 |

Start with AI De-slop, Repetition Breaker, Next Beat, Voice Match, Continuity Audit, and Review Gate, backed by the required source and Guidance primitives. They express concrete value and span the selected families. Perspective Mixer, richer knowledge modeling, broad adapters, and map/collect pipelines can follow demonstrated demand rather than inflate the initial release.

The [Smart Compactor discussion](2026-10-07-comfytavern-node-family-catalog.md) gives the former Context Distiller candidate concrete controls and distinguishes semantic compaction from existing output caps and whole-entry selection.

## AI De-slop as the first compound example

Ports:

- Required Draft; optional Recent Context, Constraints, and Style Profile.
- Candidate, Findings, and Changes outputs; the original remains available.

Exposed controls:

- Connection for rewriting; optional separate review connection through the same role-binding mechanism.
- Pattern presets plus editable rules: stock gestures, repeated openings/closings, unwanted paraphrasing, generic filler, and selected rhetorical constructions.
- Exceptions for intentional character diction, names, quoted material, and recurring motifs.
- Scope: whole reply, narration, dialogue, or selected spans.
- Requested edit strength and protected wording; semantic preservation instructions.
- Mode: literal scan, repair, and optional independent review; show the configured request bound.

One possible internal formation:

```text
Frozen draft + selected context + user rules
  -> select allowed spans and record protected material
  -> literal pattern scan (no model)
  -> optional model repair (Prose connection)
  -> validate patch ranges, source identity, and protected literal content
  -> splice patches into original
  -> optional independent assessment (Utility connection)
  -> Candidate + Findings + Changes
```

A literal scan is cheap and inspectable but cannot detect every semantic or structural habit. The repair pass can return findings as well as patches, so a separate paid diagnostic pass is not always necessary. An independent assessment is optional and adds a request; it does not prove meaning was preserved. Default repair can be one request, with review bringing the base to two before any explicitly configured retries. A semantic audit-only mode would itself be a model request.

Malformed or out-of-scope patches are errors to surface, not permission to rewrite the whole reply. A repair candidate remains separate from the chat until Review Gate accepts it. There is no universal banned-word list: the user defines what to avoid, and a word may be appropriate in character dialogue even when unwelcome in narration.

A separate preventive configuration can produce concise guidance from the same user preferences before the native reply. It may reduce the need for repairs, but should not silently rewrite an existing SillyTavern preset or promise to eliminate the reported habits.

## What makes these compounds different from renamed Generate nodes

Each useful definition includes more than task instructions:

1. Explicit source inputs, scope, output artifacts, and preservation rules.
2. Small, meaningful controls mapped to primitive settings.
3. A primitive graph containing selection, formatting, model calls, validation, routing, and result presentation as required.
4. Bounded, visible requests with profile bindings for every internal call, including optional judges and retries.
5. Inspectable internal results and an option to open/copy the formation for customization.
6. Stable component identity/version, dependency validation, and portable model-role setup.

The underlying graph remains the source of truth. The compound view and exposed controls edit that same graph. A user should be able to use the node immediately without opening its internals, then inspect or customize the formation when useful. Updating a library definition should not silently change existing instances; retain or explicitly migrate their selected version.

The existing [collapsed groups](../../src/state.js), [group inspector](../../src/ui.js), [saved library pieces](../../src/library.js), and [clipboard graph fragments](../../src/clip.js) are a starting point. Today they copy primitive nodes/settings/wires and show groups as one block, with one default entry/exit choice. They do not provide a versioned compound interface with named boundary ports and exposed controls. Existing Output cannot be grouped, so host-output operations need their own coordinated boundary rather than assuming any graph fragment can contain them.

The read-only source audit also identified two implementation follow-ups: `pasteClip()` remaps node IDs without remapping group entry/exit references, and the current Generate-based maximum-call count omits model-backed Decider calls. Neither was fixed or exercised live in this research. Compound round-trip checks and truthful aggregate request accounting need to cover these cases, while run inspection should retain separate iteration records rather than overwrite the same primitive trace entry.

## Limits and next decision

No product changes, paid model calls, measured usability tests, live extension compatibility tests, or validated text-transformation results were produced. Community wishes help select useful experiments; they do not establish that a prompt recipe solves the problem for every model. Native memory extensions can consume a reply before an optional revision; reviewed application and tested integration policies remain necessary.

The next decision is which small set of compounds and which exposed controls belong in the first supported library. The component contract can then be designed around those real examples alongside the Svelte team's rendering boundary, rather than starting with an unrestricted plugin framework.
