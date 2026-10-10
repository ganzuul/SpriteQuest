# LATTICE model connections and host integration

For editor operation, graph tabs, subgraphs, node controls, and recorded previews, use the [operator's manual](operators-manual.md). The [node reference](node-reference.md) lists all operations and their contracts. This guide covers model-backed workflows, connection routes, phase assignment, reply review, and actor memory settlement.

Install from the repository's default branch using the steps below.

## Start with an example

1. Open SillyTavern's **Extensions → Install extension**. Enter repository URL `https://github.com/MentallyQuill/Lattice`, leave **Branch or tag name (optional)** blank to install the default branch, click **Install** (or **Install just for me**), then reload. Open LATTICE beside Send or with `/lattice`.
2. Open **Workflows → Workflow examples…** and choose a lesson, or open [Scene guidance](../workflows/native-guidance.json) or [Reviewed AI De-slop](../workflows/reviewed-de-slop.json) with **File → Open workflow…**. Each opening creates its own editable graph. Opening, importing, and editing never arm generation or make a model call.
3. Select each model-calling node and choose its own SillyTavern Connection Manager profile in **Details → Connection profile**. Scene guidance has separate Smart Compactor and Response Plan connections; repair has its own connection. Each node uses the selected profile's model by default. Choose **Model mode → Override** only when that node needs a different model identifier.
4. Use **Workflows → Assign pre phase** for guidance, or **Assign post phase** for reviewed repair. Arming is a separate action. A missing/deleted profile or unsupported route blocks the run with a useful issue.
5. Use **Run** to inspect the workflow's result. To use guidance on normal sends, arm the extension and send as usual. For repair, wait for a completed assistant reply before running, then compare the candidate with the original.

For an existing installation, update it in **Manage Extensions** and reload. If you need to change branches, select the desired branch in **Manage Extensions → Switch branch**, click **Switch**, then reload. Install URLs use the repository address above without a `/tree/` suffix.

**Run can spend model tokens.** A manual guidance run computes guidance without publishing it. A later Send runs the enabled pre workflow again, with up to two more auxiliary requests; the manual result is not cached for Send.

Connections stay fixed to your bindings; Lattice does not activate a profile globally. Auxiliary requests contain the operation's own instructions and supplied context. They use the bound profile's route and sampler preset, without copying the native main prompt's system text into every request. Credentials stay in SillyTavern's secret store.

## Model-backed examples

| Example | Operations | Maximum auxiliary requests |
| --- | --- | --- |
| Scene guidance | Scene Context → Smart Compactor → Response Plan → Guidance | 2: one compression, one plan |
| Reviewed AI De-slop | Reply Snapshot → Pattern Scan → Repair → Validate Patches → Review Gate → Apply Reply | 1: repair |
| Reflect and express | Scene Context → Context Focus Select → Reflect Character → Express Behavior → Guidance; Memory Read State feeds Reflect | 1 Analysis: reflection |
| Internalize and commit | Memory Read State + Memory Read Events → Internalize Experience → Memory Commit | 1 Analysis: state proposal |
| Consequence clock | Memory Read State + Memory Read Events → State Track → Memory Commit | 0 |

The normal SillyTavern reply is an additional request. Selection-only compaction, context already within budget, and literal scan-only repair can avoid their respective model calls. Results show actual requests against the configured bound; failed attempts can still cost tokens. There are no implicit retries.

Native graph wires determine execution order. Moving a card does not change message order. The family list is a discovery guide, in this order: **Input, Shaping, Surface, Transpose, Introspection, Derive, Output**. Transpose offers Style Transfer, Format Transfer and Terminology Map in Post workflows. Introspection offers six operations with eighteen mode presets in the shelf and contextual search. Disabled native operations block validation rather than silently bypassing.

The **AI De-slop** formation is an ordinary group of three editable operations: Pattern Scan, Repair, and Validate Patches. Use **Open group** on its collapsed card, or double-click the group, to reveal its nodes. Reusable subgraphs instead open in graph tabs, and their pinned definitions do not silently update.

## Shape scene context

Scene Context takes bounded recent messages and selected character fields already available to the host. It does not run a new lore scan or reproduce the final native prompt. Omitted or unsupported material appears in the report.

Smart Compactor's **target tokens** measures the resulting context artifact. Its defaults are a 1,200-token target, two recent messages kept verbatim, and a 1,024-token completion cap. **Select** removes older flexible messages deterministically without a model. **Compress** makes at most one summary request if needed, labels the summary as derived, and keeps the original material for inspection.

Add exact **protected literal pins** to preserve every source message containing a matching literal verbatim. Matching is case-sensitive. A missing pin reports `PIN_MISSING`; pinned/recent material that cannot fit reports `PIN_BUDGET_EXCEEDED`. Increase the target or reduce protected material. Protected text is never cut to make it fit. The preservation report lists retained, removed, summarized, and omitted input message IDs. Over-budget or cut-off summaries fail without another attempt.

Response Plan proposes direction, actor intentions, constraints, and possible next beats. Its defaults are a 768-token completion cap and a 768-token guidance-artifact budget. Proposals are optional guidance, not established events. Adjust the operation's instructions to preserve the choices you want the user to make.

On an enabled send, owned guidance is installed before native budgeting and cleared after the generation, failure, stop, or chat switch. A preparation failure clears guidance and leaves SillyTavern's ordinary generation available, with a visible failure report. Workflows do not replace the main prompt. Quiet/background, dry-run, and impersonation generations are skipped.

## Review a reply repair

This release supports the **latest completed text-only assistant reply**. Older replies, unfinished generations, tool/intermediate messages, and media replies cannot be redirected to another message for repair. There is no automatic post-reply model call.

Pattern Scan uses your literal preferences, exemptions, protected wording, and case policy. Defaults are examples such as “a testament to,” “delve,” and “tapestry”; they are editable preferences, not a universal banned-word list. Scope can be the whole reply, narration, or dialogue. Dialogue is text inside paired straight or curly double quotes; apostrophes and single quotes are ordinary text. Unmatched double quotes block narration/dialogue scanning with a report.

Repair asks for JSON patches within the identified spans, with a default 2,048-token completion cap. Strength and instructions guide the model; they are not a measured preservation guarantee. Validation rejects malformed patches, unknown/duplicate indices, blank replacements, changes outside selected spans, and removed protected wording. Unselected text is restored exactly from the original. Rejected output leaves the original in place and is not retried as a whole-reply rewrite.

After a full **Run**, select the root **Apply Reply · Host result** entry in **Preview output**. Inspect the original and proposed reply in the available artifact tabs: reviewed AI repair records separate **original** and **candidate** text tabs; Literal cleanup shows `original` and `text` in its structured **candidate** artifact. Review the recorded findings, changes, selected model and request trace too. **Apply reviewed candidate** rechecks source freshness and adds a new assistant swipe while keeping the original. **Reject candidate** preserves the original without applying. Intermediate outputs and **Run to here** are diagnostic previews. Switching chat/swipe, editing the source, replacing the message, or starting generation can invalidate the candidate; run again against the current reply.

Apply reports local in-memory success separately from persistence. The host's save wrapper gives no positive durability acknowledgment, so a resolved save does not prove the revision reached disk. Other memory extensions may already have consumed the original reply. Edit/swipe events do not guarantee they re-extract it; review those extensions separately if needed.

## Actor memory and state

Open [Reflect and express](../examples/introspection/native/reflect-and-express.json), [Internalize and commit](../examples/introspection/native/internalize-and-commit.json) or [Consequence clock](../examples/introspection/native/consequence-clock.json) with **File → Open workflow…**. Opening creates an independent graph without assigning a phase or arming. Choose a connection profile in Details for Reflect or Internalize; the deterministic Consequence clock requires no connection. The [Introspection guide](introspection-package.md) covers all modes, typed records and controls.

Reflect Character makes one bounded assessment request; Express Behavior renders its hints as Guidance without another request. Context Focus defaults to Select, so the Pre starter's bound is one Analysis call. Run previews its guidance; an assigned, armed Pre send runs it again. Internalize Experience makes one Analysis request to propose supported actor updates. State Track proposes a count of distinct settled event IDs without a model. Neither proposal persists on its own.

Memory Read, Recall and Commit require the root graph. Memory uses the active chat and host-selected character; group chats require an active actor. It reads settled selected public message text, excluding private reasoning and unsupported unfinished/system/tool/intermediate/media content. Scope, store, prior version and source revisions accompany each record. A source edit, swipe, deletion, actor/chat switch, changed settings or cancellation can invalidate a pending commit.

**A successful full Post root Run ending in Memory Commit may write immediately.** There is no separate reply-review action for this memory terminal. Commit takes `proposal` Data and has no output pin. One Commit is allowed, and all independent branches must succeed before it settles. Run to here, target execution, dry-run, public runner calls and failed runs never write. In reusable subgraphs, supply State's `state` input explicitly and keep Memory in the parent root.

Settlement rechecks fresh sources, active scope and store version before one compare-and-swap update, preserving other metadata namespaces. The default Commit key `lattice-memory-commit` becomes a native key for that graph, terminal and exact proposal. A custom key must identify a single transaction. Identical receipt replay applies nothing again; changed content using the same key fails. State Track never counts a repeated settled event ID twice.

Memory's local application and durable saving are separate. The public SillyTavern metadata save wrapper returns no durability acknowledgment. When local application succeeds, the result is `memoryCommit: { applied: true, acknowledged: false, version: ... }`, and Preview shows **Memory updated; save unconfirmed**. Save rejection can also leave an unknown outcome. Confirm a fresh metadata load containing the receipt before retrying; subsequent writes stay blocked while that outcome is unknown. Positively acknowledged adapters report `acknowledged: true`.

## Share JSON

The complete portable examples include [native-guidance.json](../workflows/native-guidance.json), [reviewed-de-slop.json](../workflows/reviewed-de-slop.json), and the zero-call examples in [the workspace guide](lattice-workspace.md). Use **File → Open workflow…** to open a workflow, or **Import into graph…** to review an addition to the current graph. Export uses a versioned `lattice-workflow` package; composed workflows include their pinned subgraph definitions. Individual subgraphs export as their own JSON packages. Exports omit bound profile IDs and credentials, so choose local profiles for imported model nodes in Details before running.

The three [native Introspection examples](../examples/introspection/native/) are portable schema-3/runtime-2 workflows. The version-1 manifests directly under `examples/introspection/` are package-harness inputs requiring injected services; use the native directory for canvas import. Both formats have synthetic fixture coverage without API calls.

Do not paste API keys into workflow JSON, instructions, or model overrides. Unsupported package versions, dependencies, graph cycles, incompatible artifacts, and dangling wires are rejected before settings change.

## Costs, limits, and troubleshooting

Token counts identify their method: host tokenizer or character estimate. Artifact budgets exclude provider framing, and even a host tokenizer count is not exact provider context usage. Reported usage/finish reasons appear only where the provider and host expose them. A thinking model may spend much of its completion allowance on reasoning; reaching the limit rejects the auxiliary result. Increase an explicit cap or choose another bound model before a deliberate rerun.

| Issue | What to do |
| --- | --- |
| Missing binding/profile/preset | Choose an available fixed Connection Manager profile and its existing sampler preset; confirm the effective model in the inspector. |
| Unsupported binding | Use a supported direct route. The current host wrappers for Claude, Gemini/Makersuite, Vertex AI, and InfermaticAI discard completion evidence; named/inherited reverse proxies fail when the selected route can use them, as does cross-provider text-completion sampler conversion. NanoGPT keeps its fixed provider endpoint and ignores unused proxy selections. |
| Endpoint missing | Configure the endpoint in the bound Connection Manager profile or its sampler preset. |
| Budget exceeded or output cut off | Review the report, then change the target, protected material, or explicit completion cap. A failed run never silently removes pins or retries. |
| No verified completion evidence | Use a route whose host response preserves a recognized completion reason. The original is retained. |
| Invalid repair patches | Inspect the output and operation instructions. Repair requires a raw patches JSON object without Markdown fences. Correct the format or binding before a deliberate rerun; the original is retained. |
| Apply unavailable/stale | Finish generation, return to the latest text-only reply, and run repair again. Do not reuse a candidate after the source changed. |
| Main reply proceeded after pre failure | This is the native fallback. Inspect the visible preparation report and fix the binding/context before the next send. |
| Changes missing after reload | Local Apply is separate from durable saving; inspect SillyTavern's save/network status. |
| Memory updated; save unconfirmed / `PERSISTENCE_UNKNOWN` | The local update succeeded without a durability acknowledgment. Reload confirmed metadata and verify its receipt before another write; do not blindly retry. |
| Actor required / invalid memory evidence | Select an active group actor and use current settled public message evidence. Run again after source edits, swipes or deletion; inspect historical invalidation reports. |
| Memory idempotency conflict / stale version | A custom key was reused for changed content, or state changed after the proposal. Read fresh state and use a key for the intended transaction; the default native key derives from the exact proposal. |
| Old assets after an update | Hard reload SillyTavern with Ctrl+Shift+R so all versioned modules load together. |
