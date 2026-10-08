# Native workflows

ComfyTavern can add guidance before SillyTavern writes its normal reply, or prepare a revision for you to review afterward. SillyTavern still builds the main prompt and generates the reply. The existing canvas engine remains available as **Legacy · Replace prompt**.

This work is prepared on `codex/native-workflows` for a draft PR. Until it is merged, the repository's default branch may not include native workflows. For draft testing, check out that branch in the installed extension before reloading; this guide does not claim a released or merged build.

## Start with an example

1. Install the extension through SillyTavern's **Extensions → Install extension** using `https://github.com/MentallyQuill/ComfyTavern`, then reload. Open the canvas beside Send or with `/canvas`.
2. Open the library and choose **Install Scene guidance** or **Install Reviewed AI De-slop**. Each install creates its own editable graph and opens setup. Installing, importing, and editing never arm generation or make a model call.
3. Choose a SillyTavern Connection Manager profile for each role: **Analysis** for scene guidance, **Prose** for repair. An optional role model override uses that model with the chosen profile. Inspect a model operation to override its connection/model independently.
4. Use **Assign pre phase and enable native mode** for guidance, or **Assign post phase and enable native mode** for reviewed repair. Arming is a separate action. A missing/deleted profile or unsupported route blocks the run with a useful issue.
5. For guidance, use **Test workflow** to inspect the result. To use guidance on normal sends, arm the extension and send as usual. For repair, wait for a completed assistant reply, then choose **Run reviewed repair** and compare the candidate with the original.

**Test workflow can spend model tokens.** It computes guidance without publishing it. A later Send runs the enabled pre workflow again, with up to two more auxiliary requests; the test result is not cached for Send.

Connections stay fixed to your bindings; ComfyTavern does not activate a profile globally. Auxiliary requests contain the operation's own instructions and supplied context. They use the bound profile's route and sampler preset, without copying the native main prompt's system text into every request. Credentials stay in SillyTavern's secret store.

## Two graphs

| Example | Operations | Maximum auxiliary requests |
| --- | --- | --- |
| Scene guidance | Scene Context → Smart Compactor → Response Plan → Guidance | 2: one compression, one plan |
| Reviewed AI De-slop | Reply Snapshot → Pattern Scan → Repair → Validate Patches → Review Gate → Apply Reply | 1: repair |

The normal SillyTavern reply is an additional request. Selection-only compaction, context already within budget, and literal scan-only repair can avoid their respective model calls. Results show actual requests against the configured bound; failed attempts can still cost tokens. There are no implicit retries.

Native graph wires determine execution order. Moving a card does not change message order. The family list is a discovery guide, in this order: **Input, Shaping, Surface, Transpose, Derive, Output**. Transpose currently has no native operation. Disabled native operations block validation rather than silently bypassing.

The **AI De-slop** formation is a saved group of three editable operations: Pattern Scan, Repair, and Validate Patches. Use **Open AI De-slop formation** to inspect them. Saved instances do not silently update when an example definition changes.

## Shape scene context

Scene Context takes bounded recent messages and selected character fields already available to the host. It does not run a new lore scan or reproduce the final native prompt. Omitted or unsupported material appears in the report.

Smart Compactor's **target tokens** measures the resulting context artifact. Its defaults are a 1,200-token target, two recent messages kept verbatim, and a 1,024-token completion cap. **Select** removes older flexible messages deterministically without a model. **Compress** makes at most one summary request if needed, labels the summary as derived, and keeps the original material for inspection.

Add exact **protected literal pins** to preserve every source message containing a matching literal verbatim. Matching is case-sensitive. A missing pin reports `PIN_MISSING`; pinned/recent material that cannot fit reports `PIN_BUDGET_EXCEEDED`. Increase the target or reduce protected material. Protected text is never cut to make it fit. The preservation report lists retained, removed, summarized, and omitted input message IDs. Over-budget or cut-off summaries fail without another attempt.

Response Plan proposes direction, actor intentions, constraints, and possible next beats. Its defaults are a 768-token completion cap and a 768-token guidance-artifact budget. Proposals are optional guidance, not established events. Adjust the operation's instructions to preserve the choices you want the user to make.

On an armed native send, owned guidance is installed before native budgeting and cleared after the generation, failure, stop, or chat switch. A preparation failure clears guidance and leaves SillyTavern's ordinary generation available, with a visible failure report. Native mode does not replace the main prompt. Quiet/background, dry-run, and impersonation generations are skipped.

## Review a reply repair

This release supports the **latest completed text-only assistant reply**. Older replies, unfinished generations, tool/intermediate messages, and media replies cannot be redirected to another message for repair. There is no automatic post-reply model call.

Pattern Scan uses your literal preferences, exemptions, protected wording, and case policy. Defaults are examples such as “a testament to,” “delve,” and “tapestry”; they are editable preferences, not a universal banned-word list. Scope can be the whole reply, narration, or dialogue. Dialogue is text inside paired straight or curly double quotes; apostrophes and single quotes are ordinary text. Unmatched double quotes block narration/dialogue scanning with a report.

Repair asks for JSON patches within the identified spans, with a default 2,048-token completion cap. Strength and instructions guide the model; they are not a measured preservation guarantee. Validation rejects malformed patches, unknown/duplicate indices, blank replacements, changes outside selected spans, and removed protected wording. Unselected text is restored exactly from the original. Rejected output leaves the original in place and is not retried as a whole-reply rewrite.

Compare the original, candidate, findings, changes, selected model, and request trace. **Apply reviewed candidate** rechecks source freshness and adds a new assistant swipe while keeping the original. **Reject candidate** preserves the original without applying. Switching chat/swipe, editing the source, replacing the message, or starting generation can invalidate the candidate; run again against the current reply.

Apply reports local in-memory success separately from persistence. The host's save wrapper gives no positive durability acknowledgment, so a resolved save does not prove the revision reached disk. Other memory extensions may already have consumed the original reply. Edit/swipe events do not guarantee they re-extract it; review those extensions separately if needed.

## Share JSON

The complete portable examples are [native-guidance.json](../workflows/native-guidance.json) and [reviewed-de-slop.json](../workflows/reviewed-de-slop.json). Download one and use the canvas's JSON import control. Export uses a versioned `comfytavern-workflow` envelope with a schema-2 graph and minimum runtime; it omits bound profile IDs and credentials. Imported roles need local setup before running.

Do not paste API keys into workflow JSON, instructions, or model overrides. Unsupported package versions, dependencies, graph cycles, incompatible artifacts, and dangling wires are rejected before settings change. Existing `.canvas.json` packages and raw schema-1 canvases remain supported in legacy mode.

## Costs, limits, and troubleshooting

Token counts identify their method: host tokenizer or character estimate. Artifact budgets exclude provider framing, and even a host tokenizer count is not exact provider context usage. Reported usage/finish reasons appear only where the provider and host expose them. A thinking model may spend much of its completion allowance on reasoning; reaching the limit rejects the auxiliary result. Increase an explicit cap or choose another bound model before a deliberate rerun.

| Issue | What to do |
| --- | --- |
| Missing binding/profile/preset | Choose an available fixed Connection Manager profile and its existing sampler preset; confirm the effective model in the inspector. |
| Unsupported binding | Use a supported direct route. The current host wrappers for Claude, Gemini/Makersuite, Vertex AI, and InfermaticAI discard completion evidence; named/inherited reverse proxies and cross-provider text-completion sampler conversion also fail preflight. |
| Endpoint missing | Configure the profile/preset endpoint. The inspector reports an inherited host endpoint and its origin when the route supports that dependency. |
| Budget exceeded or output cut off | Review the report, then change the target, protected material, or explicit completion cap. A failed run never silently removes pins or retries. |
| No verified completion evidence | Use a route whose host response preserves a recognized completion reason. The original is retained. |
| Apply unavailable/stale | Finish generation, return to the latest text-only reply, and run repair again. Do not reuse a candidate after the source changed. |
| Main reply proceeded after pre failure | This is the native fallback. Inspect the visible preparation report and fix the binding/context before the next send. |
| Changes missing after reload | Local Apply is separate from durable saving; inspect SillyTavern's save/network status. |
| Old assets after an update | Hard reload SillyTavern with Ctrl+Shift+R so all versioned modules load together. |

To return to existing prompt-replacement behavior, choose **Legacy · Replace prompt**. Native phase assignment and legacy canvas selection are separate. The original eleven legacy node types and saved schema-1 graphs retain their behavior.

## Developer live harness

`node tools/live-workflow-test.mjs` is disabled by default and makes no requests. Unit guard tests run with `node tests/live-workflow-harness.test.mjs` without credentials or network.

The live harness is for this acceptance run, with explicit readiness approval and synthetic material only. It uses production runtime/request modules in a fresh browser against a plain HTTP loopback SillyTavern host. It never calls native Send or Apply, reads private chat/character/lore, installs an extension, activates a profile, or fetches credential values. Its backend gate admits only the exact messages/model/cap owned by an active reservation and aborts unrelated generation traffic.

The acceptance allowance is eight attempted requests total, including three already consumed by the earlier canary phase. Only NanoGPT `z-ai/glm-5.2` and `z-ai/glm-5.2:thinking` are allowed, with at most 4,096 completion tokens each and no hidden retries. The default fixture run reserves at most three more attempts: plain compaction, thinking planning, and plain repair. Stop after quota/auth/provider failure. Prior canary evidence and production workflow fixtures must be reported separately; a canary is not full workflow acceptance.
