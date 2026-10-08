# ComfyTavern Native Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two approachable, portable workflows that add native guidance and manually reviewed reply repairs with per-node SillyTavern connections.

**Architecture:** Retain the UI Performance Svelte projections/callbacks and legacy canvas engine. Add a framework-independent typed-artifact workflow domain, versioned templates, bounded operations, and a host controller. Native graphs execute by wires; the host owns primary generation and explicit reviewed application.

**Tech Stack:** Existing unbundled JavaScript/JSDoc, Svelte 5/TypeScript projections, Node 24+, existing Node/jsdom and Playwright tests; no new runtime dependencies.

**Spec:** [Native workflows design](../specs/2026-10-07-comfytavern-native-workflows-design.md).

## Global Constraints

- The exact family names and display order are **Input, Shaping, Surface, Transpose, Derive, Output**.
- Svelte receives immutable projections and callbacks; compiled UI imports no domain modules.
- Existing coordinate-based schema-1 execution stays unchanged.
- No global profile activation. Secrets stay in SillyTavern's store and are absent from workflow JSON, fixtures, traces, and repository files.
- No implicit retries. Every actual request reserves against the run bound before sending.
- No automatic post-reply model call in this first release.
- Live tests are authorized for NanoGPT **z-ai/glm-5.2** and **z-ai/glm-5.2:thinking** only; acceptance is limited to **8 attempted requests**, **4096 completion tokens per request**, and synthetic material.
- Installation/import/editing never arms generation, switches connection, or initiates paid calls. Native-mode assignment is an explicit user action.
- Worktree: `C:/Users/Keptin/.codex/worktrees/native-workflows/SillyCanvas`; branch `codex/native-workflows`; base `a1e2332402ff13b56ee95ee0b0fda6722e478f51`.

## Review Focus

- A profile deleted after setup must fail preflight instead of borrowing a live chat model (Tasks 2, 4).
- Stop or chat switch during a delayed request must invalidate its later result and clear only owned guidance (Task 4).
- Source swipe/content changed while review is open must reject Apply before any chat mutation (Tasks 4, 5).
- A pasted compound must keep remapped entry/exit identities, and imported roles must not retain another user's profile IDs (Task 1).
- Movement/token preview/late inspector render must not make a request or rescan native lore; camera updates keep their fast path (Task 5).

## Shared interfaces

Operation IDs: `scene-context`, `reply-snapshot`, `smart-compactor`, `response-plan`, `pattern-scan`, `repair`, `validate-patches`, `guidance`, `review-gate`, `apply-reply`.

Graph: schema 2, runtime 1, mode `native-pre`/`native-post`; nodes have `type:'workflow'`, `operation`, `modelRole`, optional `profileId`/`model`, controls and usual canvas properties. Roles map names to `{profileId:null|string, model:null|string}`. Wires have `from`, `to`, `order`; one primary artifact input per consuming node. Groups carry component identity/version, entry/exit and internal members. Host-output nodes are terminal; Apply is deferred until explicit reviewed acceptance.

Artifacts: `{kind:'context',messages:[{id,role,text,source}],original?,report?}`; `{kind:'guidance',text,context?}`; `{kind:'draft',text,source,context?,spans?,findings?}`; `{kind:'patches',draft,patches}`; `{kind:'candidate',original,text,source,findings,changes,reviewRequired:true}`. Snapshot source includes chat ID, message index, swipe ID, original text and enough identity to reject replacement/reordering.

Native operation result: `{ok:true,artifact,reports:[],calls:[],trace:[]}` or `{ok:false,error:{code,message,nodeId?},reports:[],calls:[],trace:[]}`. Contract parsing/validation uses `{ok:true,data}` or `{ok:false,error}`. Trace preserves each request separately. Ports: `{snapshot(phase),countTokens(text):Promise<{tokens,method}>,request({binding,messages,maxTokens,signal}),binding,signal,onStage?,onResult?}`. Request always returns `{ok:true,data:{text,usage,finish}}` or `{ok:false,error:{code,message}}`; `ports.binding` is resolved per operation by runtime and is never persisted on nodes. Runtime request wrapper reserves/counts requests and collects authoritative traces; standalone handlers report attempted calls too, without runtime double-counting them. Candidate.original is the original draft text string. Operation handlers preserve all reports/source references.

## Task 1: Catalog, graph contracts, portability, and persistence

**Files:** Create `src/workflow/catalog.js`, `src/workflow/contracts.js`, `src/workflow/packages.js`; modify `src/state.js`, `src/clip.js`; test `tests/workflow-contracts.test.mjs`, `tests/clip.test.mjs`.

**Interfaces:** `FAMILIES`, `OPERATIONS`, `operationFor(node)`, `operationDefaults(id)`; `validateWorkflow(graph,{phase}={})` returns result with ordered nodes and configured call bound; `exportWorkflow(graph)` and `parseWorkflow(json)` return portable data/result; `defaultNode(NODE_TYPES.WORKFLOW,...)` delegates to operation defaults. `settings()` supplies `workflowMode:'legacy'`, `nativeBindings:{preGraphId:null,postGraphId:null}`. Native import/export dispatch is integrated with existing state entry points without adding legacy Output.

- [ ] Write one failing graph-order test, run it, then add the minimal contracts/catalog to pass:

```js
const graph = fixturePreGraph(); // IDs source, compact, plan, output; fixtures are literals
graph.nodes.plan.y = -500;
assert.deepEqual(validateWorkflow(graph).data.orderedNodes.map(n => n.id),
  ['source', 'compact', 'plan', 'output']);
```

- [ ] Incrementally red/green invalid cycle, dangling wire, wrong phase/kind, unknown operation/runtime, ambiguous input, disabled operation, invalid numbers and missing terminal. Validate all nodes/settings in package, then reachable execution; reject prototype-bearing/oversized malformed data safely. Bounds/roles derive from descriptors, not positions.
- [ ] Add portable round-trip tests: preserve complete graph/formation and group entry/exit; remove bound profile IDs from roles and nodes; retain role names/model preference; reject unknown package versions before settings mutation. Implement envelope `{kind:'comfytavern-workflow',schema:1,minRuntime:1,graph}`. `parseWorkflow` performs no host mutations.
- [ ] Add a legacy JSON regression and a failing clipboard entry/exit remap regression; fix only the identified remap problem. Default operation is Scene Context; default native role bindings are unresolved.
- [ ] Run `node tools/test-all.mjs workflow-contracts clip state wiring`, then `npm.cmd test`; self-review and commit `feat(workflows): add portable native graph contracts`.

## Task 2: Fixed profile requests and Smart Compactor

**Files:** Create `src/workflow/connections.js`, `src/workflow/compactor.js`; test `tests/workflow-connections.test.mjs`, `tests/workflow-compactor.test.mjs`.

**Interfaces:** `resolveBinding(node,graph,context)` → result with `{profileId,model,source,profileName}`; `requestModel({binding,messages,maxTokens,signal},context)` → result `{text,usage,finish}`; `compactContext(artifact,node,ports)` → operation result. Connections consume Task 1 modelRole/roles. Compactor consumes normalized context artifact and runtime ports.

- [ ] Begin with a failing missing-profile test (literal fixed binding points at deleted profile); it must return `PROFILE_MISSING` and make zero calls. Incrementally implement strict node override → role binding, model override → profile model, supported CC/TC profile API resolution using host map/known enums, service absence, missing model and request abort/error/cutoff handling. Resolve/display effective endpoint and its host/profile origin, reject unavailable endpoints/named missing presets, and bind request overrides to the resolved provider/model/endpoint even if the live connection changes. Use `ConnectionManagerRequestService.sendRequest` with node-owned messages; preserve preset/instruct formatting without native prompt assembly or global activation.
- [ ] Start compaction with a failing pass-through test:

```js
const result = await compactContext(smallContext, {targetTokens:1200,keepRecent:2,method:'compress'}, ports);
assert.equal(result.ok, true);
assert.deepEqual(result.artifact.messages, smallContext.messages);
assert.equal(result.calls.length, 0);
```

- [ ] Incrementally red/green deterministic old-message selection; pins/recent preserved verbatim; `PIN_BUDGET_EXCEEDED`; measured final artifact includes labels/summary; tokenizer method is retained; compress only flexible material through one request; reject cutoff, over-budget, empty, missing-pin, and abort results. Bound compression input with reported omissions; no retry/chunk recursion. Defaults target1200, keepRecent2, maxTokens1024; select requires no connection.
- [ ] Test profile-dependent request content and returned output rather than only a fake's call existence. Verify node-owned system prompt survives and no native roleplay preset text is appended. Real host confirmation belongs to Task 6.
- [ ] Run focused tests, then `npm.cmd test`; self-review and commit `feat(workflows): add bounded compaction and profile routing`.

## Task 3: Inspectable draft repair primitives

**Files:** Create `src/workflow/repair.js`; test `tests/workflow-repair.test.mjs`.

**Interfaces:** `scanDraft(draft,node)` → draft result with deterministic `spans` and findings; `repairDraft(draft,node,ports)` → patches result; `validatePatches(patchesArtifact,node)` → candidate result. Model request uses Task 2 ports; findings and source identity remain attached. Actual primitive formation is assembled in Task 5.

- [ ] Write/run one failing literal-pattern scan fixture before implementing it. Preserve original bytes; define dialogue as paired ASCII/curly double-quoted spans (single quotes/apostrophes are ordinary text), narration as their complement, whole as full text. Give spans stable integer indices and original ranges; report unmatched quotes rather than guessing scope. Patterns are literal user phrases with case policy, exemptions and protected text, not regex execution.
- [ ] Incrementally test scopes/exemptions/protected wording/empty rules. Ranges are half-open UTF-16 offsets into the frozen original; cover non-BMP text. Normalize edit ranges by merging overlapping/adjacent ranges within scope, sorting offsets, then assigning nonoverlapping stable indices; test overlapping phrase findings cannot produce intersecting edits. Default editable preferences may include stock phrases but must be visible. Bound spans/input length before a request and explain the limit.
- [ ] Red/green one valid JSON repair and candidate splice:

```js
// Source: 'Before. "A shiver ran down her spine." After.'
assert.equal(result.artifact.text, 'Before. "She paused." After.');
assert.equal(result.artifact.reviewRequired, true);
```

- [ ] Request JSON `{patches:[{index,replacement}]}` with exact supplied span indices; maxTokens2048, one call, Prose role. Literal scan-only mode yields no request and an inspectable unchanged candidate. Preserve usage/cutoff and all findings.
- [ ] Incrementally reject invalid JSON, duplicate/unknown indices, empty replacements, overlapping malformed spans, removed literal pins, truncated output, stale source inconsistency and abort. Restore unselected bytes from original; never fall back to whole-draft rewrite. Test no-op/empty patch response separately.
- [ ] Run focused tests, then `npm.cmd test`; self-review and commit `feat(workflows): add scoped prose repair formation primitives`.

## Task 4: Runtime facade and native host lifecycle

**Files:** Create `src/workflow/runtime.js`, `src/workflow/host.js`; modify `src/run.js`, `src/compile.js`, `index.js`, `manifest.json`; test `tests/workflow-runtime.test.mjs`, `tests/workflow-host.test.mjs`, relevant legacy hook tests.

**Interfaces:** `runWorkflow(graph,ports)` evaluates validated Task 1 nodes with Task 2/3 handlers. `snapshotContext(context,{phase,chat?})` does not scan lore; `snapshotReply(context,messageIndex?)` freezes identity; `createNativeWorkflowController({context,request,countTokens,onResult?})` exposes `beforeGenerate(chat,contextSize,abort,type)`, `runPost(graph,messageIndex?)`, `apply(candidate)`, `cancel(reason)`, `lastResult()`. UI consumes controller via a singleton native adapter export; no domain imports into Svelte. `run.js` reexports native facade and includes supported Decider calls in legacy estimate.

- [ ] Red/green pre starter with fake external request only: context→compact→plan→guidance returns guidance, at most2 requests, explicit wire order, no mutation. Response Plan uses own prompt, maxTokens768. Add post chain with one repair request ending at a review-required candidate; Apply node does not mutate inside graph evaluation.
- [ ] Incrementally implement preflight/binding checks before all calls, request reservation and per-request trace, error/cutoff propagation, bounded source snapshots and guidance budget768, no calls in dry-run/preview, no hidden retry, cycle/type failures without calls.
- [ ] Reproduce host stop/chat-switch race before lifecycle code:

```js
const pending = controller.beforeGenerate(chat, 8192, abort, 'normal');
controller.cancel('chat changed'); releaseProviderReply(); await pending;
assert.equal(ownedGuidance(), '');
assert.equal(otherExtensionGuidance(), 'keep');
```

- [ ] Register supported generation interceptor using the extension manifest mechanism (inspect exact host hook before implementation), await prepass, publish namespaced `setExtensionPrompt` with scan=false, and clear only owned keys physically (do not rely on the host's asynchronous prompt filter). Session identity guards delayed completions. Support only normal/swipe/regenerate/continue; ignore impersonate/quiet/internal/dry runs. Use host-provided chat without double-popping swipe target. Manual pre Test workflow returns results without publishing, and Send reruns once with a clear UI label. Native failures visibly fall back with cleared guidance. Gate legacy final-prompt replacement by `workflowMode==='legacy'` AND resolved graph schema1/legacy type. Installing/selecting schema2 while legacy is already armed must cause no auxiliary calls at the legacy final-prompt hook.
- [ ] Manual reply snapshot excludes user/system/unfinished/tool/intermediate material; freshness checks chat, message object/index, swipe and exact source text. Initial Apply supports latest completed assistant reply only and rejects busy/older targets without redirection. Apply appends a new swipe preserving original and complete swipe metadata through inspected supported context APIs/direct guarded mutation; save and refresh appropriate host events. Recheck identity immediately before mutation; rollback in-memory changes on detectable failure. Do not claim durability acknowledgment if host save API swallows errors. Guard internal events from reentrancy.
- [ ] Cover stopped/failed generations, chat change, double Apply, deleted/reordered message, externally rewritten swipe, unavailable save/update APIs, and delayed completion. Retain legacy tests unchanged. Run focused/full tests; self-review and commit `feat(workflows): integrate native guidance and reviewed replies`.

## Task 5: Starter library, family discovery, setup and review UI

**Files:** Create `src/workflow/starters.js`, `src/ui/workflow-surface.js`, `ui/WorkflowSurface.svelte`, `workflows/native-guidance.json`, `workflows/reviewed-de-slop.json`; modify `ui/entry.js`, `ui/types.ts`, `src/ui/controller.js`, `src/ui/graph-analysis.js`, `src/canvas/presentation.js`, `style.css` as required; tests `tests/workflow-ui.test.mjs`, `tests/browser/workflows.spec.mjs`.

**Interfaces:** `STARTERS`, `installStarter(id,settings)` creates independent versioned graphs with unresolved roles; workflow projection types plus callbacks `{install,bindRole,assign,run,apply,reject,inspect,updateNode}`. Native adapter mounts/updates/destroys projection-only surface; existing workbench/domain surface remains. UI Run uses Task 4 controller; apply passes frozen candidate, not a lookup of latest text.

- [ ] Browser/DOM failing scenario: open library → install pre example → see missing Analysis binding → choose profile → assign pre phase explicitly → inspect editable controls and 2-call bound. Installation itself leaves enabled/mode/profile unchanged. Repeat for post Prose binding and 1-call bound.
- [ ] Build two literal JSON packages and canonical starter builder from the same definitions. AI De-slop group stores component `{id:'ai-de-slop',version:1}`, Pattern Scan→Repair→Validate nodes, remappable entry/exit. Collapsed summary shows Surface operation and call bound; open formation expands real nodes. Setup edits the same graph/primitive settings.
- [ ] Add six-family grouped library and add-node menu using Task 1 descriptors plus legacy family mapping. Keep empty Transpose informative with no fake action. Legacy nodes retain their old controls; native nodes get operation-specific controls, role and node profile/model overrides. Phase-incompatible nodes explain constraints. Native output labels/help describe guidance/review, not prompt replacement.
- [ ] Red/green Run produces reports with original/candidate comparison, findings/changes, count method and actual/max requests. Apply/Reject explicit; stale candidate blocks Apply. Inspector fields remain stable while typing. Switching graphs/closing cancels or invalidates pending work; no active new-graph mutation from late callbacks.
- [ ] Avoid legacy `gatherContext` preview/analysis for native graphs; derive projection/traces directly. Native card projections describe ports/model controls and terminal behavior without legacy stranded-to-Output warnings. Preserve camera-only updates and existing shortcuts. Context menus expose inspect/settings/duplicate/rename; disabled native paths explain preflight failure. Add keyboard labels and responsive layout using existing theme variables.
- [ ] Run focused DOM/browser cases, `npm.cmd run check`, `npm.cmd run smoke:install`; rebuild and commit production bundle with UI edits. Self-review and commit `feat(ui): add approachable native workflow setup and review`.

## Task 6: Live acceptance, documentation, release review and draft PR

**Files:** Create `tools/live-workflow-test.mjs`, `docs/native-workflows.md`, `docs/superpowers/reviews/2026-10-07-comfytavern-native-workflows.md`; modify README/help/manifest/cache versions only as needed for release consistency. Test live harness control boundaries with `tests/live-workflow-harness.test.mjs` (no credentials).

**Interfaces:** Harness explicitly opt-in, target host URL and allowlisted model IDs, max8 attempts/max4096 output, sessions/CSRF in memory, existing secret reference only. It calls production request/runtime modules against synthetic fixtures via host-backed service; label backend harness versus real browser request-service evidence separately.

- [ ] Red/green harness refuses unapproved model, extra attempts, excessive output cap, and implicit paid execution. Use local ST login/default-user and stored credential reference; never fetch key values. A dedicated profile may be created through host settings only if needed, preserving unrelated settings. Prefer existing thinking profile plus model override to avoid unnecessary host changes.
- [ ] Run one canary for each approved model, then bounded compaction/planning/repair fixtures through production workflow code. Stop on quota/auth/provider rejection; report successful content, usage, finish reason, elapsed time, input/output constraints and limitations. Do not use private chats or alter installed extension/personal prompt/active profile. If unavailable, retain deterministic test evidence and report precise live limitation rather than falsely claiming acceptance.
- [ ] Write approachable docs: install JSON/example, bind roles, assign native mode, run/review, controls, request costs, token estimate limits, legacy mode, memory-extension revision caveat and troubleshooting. Save independent task/final review outcomes and live evidence with no secrets.
- [ ] Run fresh full `npm.cmd run check`, install smoke, `git diff --check`; independent whole-branch review, fix verified findings and rerun affected checks. Confirm distribution/version consistency and schema-1 compatibility. Retain baseline/performance evidence; only broaden benchmark if native UI changes affect camera/card paths.
- [ ] Commit tested work; push branch through network-enabled GitHub CLI workflow, create draft PR based on `main` (UI Performance PR #1 merged to f5b3b61 and integrated into this branch), attach PR to this task. User authorized coordination and draft delivery; no merge/deploy. Goal is complete only after required implementation, checks, review and delivery.

## Controller self-review

Each spec area maps to a task: discovery/first use/formation (5), persistence/ordering/import (1), connections/compaction (2), scoped repair (3), generation/review lifecycle (4), release/live evidence (6). Interfaces above use `modelRole` consistently and retain exact phase/artifact names. Every Review Focus condition has a owning regression step. Independent specification review may amend the plan before execution; record changes in the plan ledger.
