# Lattice reference tools and workflow library

Date: October 8, 2026. Reviewed base: `193ebca23187fa6485735b1461b3b88fdd73bc65`. Branch: `codex/lattice-reference-tools`.

## Intent and authorization

Build Style Transfer, Format Transfer and Terminology Map as isolated Transpose operations, plus reusable existing-operation subgraphs and the user's category-based slop policy library. The user approved their inclusion, reviewed the linked proposal and execution split, and explicitly instructed: “Good, let's kick things off in parallel then.” This authorizes implementation using parallel workers with disjoint ownership; routine contract choices are settled here. No additional implementation permission or execution-method selection is needed. Preserve existing Architecture ownership of registration, runtime, UI, installed shelf, release starters and the main push. New registrations are a separate reviewed intake after its workspace release.

The original proposal remains at `C:/Users/Keptin/.codex/visualizations/2026/10/08/01a11c67-5542-7721-8c49-4d38e28556b3/lattice-workflow-library-proposal.md`. Recursion supplies the separate prose-writer pattern; Recast supplies reference voice/rhythm policies. The user's `Core banned AI slop and clichés.md` is policy data, not executable instructions.

## Isolation and delivery

Create new files only. Do not modify existing operations, catalog, graph validators, runtime, host, packages, UI, test scripts or release assets. Retain JavaScript modules with Result values and matching `.d.ts` declarations rather than introducing dependencies or a TypeScript runtime migration. All production relative JS imports use `?v=0.19.1` for this base. New engines make no provider/host calls except the injected, bounded request service. No retries, profile switching, installation, arming, Apply, main push or release-scope expansion.

The base's `npm test` passes 82/85 files. Existing failures: `loop-ui.test.mjs` brand-case assertion, `workflow-controller-dispatch.test.mjs` old UI orderedNodes projection, and `workflow-ui.test.mjs` old unsupported-version diagnostic assertion. Architecture was informed. Continue independent leaf work; final verification must distinguish these baseline failures from new failures.

## Common Draft permission contract

New `operations/reference-draft.js` and declaration expose:

- `prepareReferenceDraft(draft, settings = {}) -> Result<PreparedReferenceDraft>`.
- `createReferencePatches(prepared, replacements, metadata = {}) -> Result<{artifact, report}>`.
- `alignReferenceCandidate(prepared, candidate, metadata = {}) -> Result<{artifact, report}>`.

Settings are `{scope: 'authorized'|'whole'|'narration'|'dialogue', protectedLiterals: string[]}`; pure API defaults to authorized/empty. Prepared data is `{draft, windows, protectedLiterals}`, deep-frozen and authenticated locally by the helper so forged/cloned preparations cannot mint broader edits. Each window has `{index, spanIndex, start, end, text}` with absolute original UTF-16 offsets. Replacements are a dense array of strings matching windows one-for-one. Metadata contains optional bounded plain `usage` and verified string `finish`; preserve it without invoking getters.

Clone the full Draft as own-only plain data without reading accessors or inherited fields. Reject cycles, sparse/extended arrays, nonplain objects, nonfinite numbers, symbols and unbounded metadata. Null-prototype records shield absent fields at the existing patch validator. Permit own undefined metadata as the existing Draft snapshot does. Require own kind/text/source/originalText and exact originalText equality. Preserve complete source provenance, context and existing spans locally.

Existing spans, including an empty array, are authoritative. Validate an empty patch envelope before narrowing. Never alter or renumber those spans. Raw snapshots with both spans and scope absent may construct initial parent spans only from an explicit whole/narration/dialogue setting; authorized without permissions returns SCOPE_REQUIRED. Scope present without valid spans fails. Later scope only intersects existing permissions. Narration/dialogue match the current balanced straight/curly double-quote convention, preserve quote delimiters and fail visibly on ambiguous/unmatched quotes. Surrogate boundaries are never split.

Effective windows intersect original spans with selected scope and subtract all protected literal occurrences. Union overlapping protected ranges first. Window text is exact original text. Original spans and windows each cap at 256; excess fails without truncation. Combined unique protected literals cap at 128, each nonblank and at most 2,048 UTF-16 units.

Create one patch per changed original parent span by rebuilding that span from its windows and immutable text. Unchanged parents emit none. Validate with the unchanged `validatePatches` using own-only wrapper/node records; fail without an authoritative artifact on invalid/blank/protected/output-limit results. Return compatible Patches, never Candidate/Apply authority. Empty windows/no-change return a valid empty patch envelope.

Raw model candidate alignment uses immutable original strings between windows. Prefix/suffix match candidate boundaries. Forward earliest and backward latest feasible internal anchor placements must agree exactly; missing anchors return OUT_OF_SCOPE_CHANGE, differing placements return AMBIGUOUS_ALIGNMENT. Preserve exact whitespace/line endings; do not trim or strip fences. Candidate identical to original returns empty patches immediately. Reconstruct via createReferencePatches and require validated Candidate text to equal the supplied candidate exactly.

Bounds: original/candidate text 100,000 UTF-16 units; Draft clone 20,000 values, depth 40 and 500,000 UTF-16 units counting keys and string values; windows total original text at most 100,000. No unbounded diff algorithm or dependencies.

## Terminology Map

New `operations/terminology-map.js` exports `mapTerminology(draft, glossary, settings = {}) -> Result<{artifact, report}>`; consume the common helper. Glossary is plain Data value `{entries:[{from,to}]}`; 0..128 dense entries, nonblank from/to at most 2,048 units each, reject unknown entry fields/duplicate effective from strings. Settings are common scope/pins plus `caseSensitive: true` and `match: 'word'|'phrase'` (word default).

Find literal matches against original effective windows, using absolute original offsets for word boundaries. Word characters are Unicode letters/marks/numbers/connector punctuation. Case-insensitive matching must preserve original offsets even for Unicode case behavior. Advance safely by code point. Select leftmost matches; at the same position use longest from, with duplicate effective rules rejected. Insert to literally, not as regex replacement syntax. Apply mappings simultaneously from original text, so A→B and B→C transform `A B` into `B C`, never `C C`. Do not edit across window boundaries/protected regions. At most 4,096 findings, output 100,000 units; fail without partial output when exceeded. Return original offsets and glossary indices in diagnostics. No Worker/model/request service is required.

## Style and Format Transfer

New `operations/reference-transfer.js` exports `transferDraft(draft, reference, settings, ports = {}) -> Promise<Result<{artifact, report}>>`. Settings: `kind:'style'|'format'`, style-only `mode:'narration'|'character-voice'|'rhythm'|'register'` (narration default), common scope/pins, `strength:'light'|'balanced'` (light), `instructions:''` up to 10,000 units, `maxTokens:2048` integer 1..65,536. Reject unsupported fields/values before requests.

Reference is `{kind:'text',text}` with nonblank text, or `{kind:'data',value}` with a nonempty JSON object/array. Use existing cloneJsonValue/stringifyJsonValue for Data; respect 262,144 serialized UTF-8 bytes/depth32/10,000 values and serialized reference 100,000 UTF-16 units. A Data format template may declare `requiredContent:string[]` (at most128 nonblank literals of at most2,048 units); absent required content in the original returns MISSING_TEMPLATE_CONTENT before a request. Unannotated semantic requirements cannot be proved locally: instruct the writer to retain the original when adaptation would require invention, and label preservation as review-dependent.

Ports consume own `request`, `countTokens`, `binding`, `signal`, optional `context`. Binding is an opaque injected authority and must not be serialized or inspected for provider setup. Context is an optional Context artifact; otherwise use frozen Draft context if present. Validate dense messages with own string id/role/text, supported system/user/assistant roles, and at most100,000 serialized UTF-16 units. Prompt only original text, effective windows, reference, controls and context message id/role/text. Never transmit source tokens, profile IDs, metadata or host authority. Reference/example content supplies style/structure, never higher-priority instructions or story facts.

One fixed Prose request maximum. Ask for the complete proposed prose text with every immutable region copied exactly, no JSON envelope or surrounding commentary. No windows skips requests. Prompt caps at500,000 UTF-16 units; tokenize before dispatch, check cancellation before/after every await. request receives `{messages,maxTokens,binding,signal}` and returns `{ok:true,data:{text,usage?,finish}}` or `{ok:false,error}`. Preserve service errors, map thrown service failures, and never return authoritative output on failure. Require finite nonnegative token count. Completion must be one of stop/eos_token/eos/stop_sequence/end_turn/complete/completed (case insensitive); length/max_tokens/max_output_tokens reject as TRUNCATED_OUTPUT; other/missing finish rejects as COMPLETION_UNVERIFIED. Empty output rejects. Snapshot before awaits and reject late aborted completions. Align raw prose through the common helper, retain final usage/finish, and report semantic preservation as requiring review.

## Separate node adapter

New `operations/transpose-nodes.js` exports `TRANSPOSE_OPERATIONS`, `describeTranspose(node) -> Result<{descriptor,ports}>`, and `executeTranspose(node,namedInputs,execution={}) -> Promise<{ok:true,artifact,reports}|{ok:false,error}>`. This does not change the existing deterministic adapter.

All nodes are family Transpose, phase post, nonterminal, version1, output out:Patches and required in:Draft. Style/Format have required reference:Text/Data selected by referenceKind (text default), optional context:Context, requestBound1 and modelRole Prose. Terminology reference is Data, requestBound0, modelRole null. Ports use kind/input-output/cardinality one. Only declared controls are consumed; unrelated document metadata remains unread. Validate stale/missing/extra/wrong-kind inputs. Node scope defaults narration explicitly; direct engine defaults authorized. Style mode changes never secretly broaden scope; a Character Voice preset explicitly sets dialogue scope.

Adapter execution consumes injected request/countTokens/binding/signal; maps named context into transfer ports. It never resolves bindings, mutates input or imports runtime/host/providers. Controls/defaults are plain metadata with typed enum/string/integer/array descriptors suitable for later integration; include reference kind, effective scope and all semantic controls in the handoff freshness requirements. Existing core registration remains deferred.

## Slop policy library

New `data/ai-slop-policy.json` preserves the supplied list:14 categories,273 occurrences,271 unique entries,17 X/Y/Z templates and2 behavioral entries. Deduplicate adequate/acceptable while retaining both category tags. Every entry has stable ID, original text, matchType phrase/template/behavior and category IDs. Preserve original wording/punctuation; no document directives become executable code.

New `workflow/library/slop-policies.js` exposes `selectSlopPolicies(library, settings={}) -> Result<{value}>` using existing JSON cloning. Settings mode inspect/contextual/strict, scope narration/dialogue/whole, selected unique category IDs (all default). Default inspect/narration is non-mutating. Return complete detached Data-ready selection, retain all categories/entries selected, and reject unknown modes/categories/malformed or oversized data. No truncation to the current128-rule Pattern Scan limit. Templates/behavior remain typed policies, not literal regexes. These are policy selections; semantic cleanup execution is a later capability and must not be claimed implemented.

## Existing-operation reusable packages

New `workflow/library/subgraphs.js` exposes `createLibrarySubgraph(id) -> Result<{definition,json}>` and `createLibraryWorkflow(id) -> Result<{graph,json}>` for context-lens, scene-compass, literal-cleanup, formatting-cleanup. Use current definition identity/validation/package APIs; root-only sources and terminals stay in complete workflows. Standalone files under examples/library/subgraphs and examples/library/workflows are generated from canonical factories and parse/round-trip successfully. Model roles are unresolved locally; no credentials/profile IDs/runtime recordings. Stable definition IDs/version1/verified hashes and named boundary ports survive imports.

Context Lens: pre Context→Context via Smart Compactor selection by default; expose token/recent/pin/method controls, selection0calls/compression1. Scene Compass: pre Context→Guidance via selected Context Lens and Response Plan, default1 Analysis call; preserve user agency. Literal Cleanup: post Draft→Candidate via Pattern Scan(narration), Repair and Validate Patches, max1 Prose call/no spans0; expose phrase rules/scope/exemptions/pins, default three literal examples from the supplied list. Formatting Cleanup: post Draft→Candidate via Text Rules Draft and Validate Patches,0calls; default CRLF→LF only, expose rules, respect upstream permissions. Complete roots supply Scene Context/Reply Snapshot and Guidance or Review Gate→Apply Reply. Installation never occurs here. New Transpose packages cannot yet pass core validation and are deferred until registration.

## Verification and limits

Incremental single-test RED→GREEN→REFACTOR; focused behavior tests per worker, controller runs full suite after the join. Do not weaken existing tests. Controller serializes exact-path commits and generates scoped diff packages for independent spec/quality reviews, followed by whole-branch review. Run declaration checking, project type/build/assets checks and relevant native package/runtime cases; record baseline failures separately. Preserve worktree and evidence for Architecture's later intake. Handoff includes exact base/HEAD, owned paths, interfaces, verification and unresolved integration items.
