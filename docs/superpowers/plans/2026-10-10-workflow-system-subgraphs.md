# Workflow System Subgraphs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Compose independent stateful subgraphs around one native reply using upgraded existing nodes and one convenient authoring command.

**Architecture:** Main owns the native lifecycle and accepted effect bundle. Existing static subgraph expansion executes system bodies; trusted instance-scoped adapters delegate five state operations. Compose consumes typed named Guidance contributions and retains authentic private constituent proofs through the host boundary.

**Tech Stack:** Existing JavaScript ESM, TypeScript declarations, Svelte 5, Node behavior tests, Playwright and Vite; no new dependencies.

**Spec:** docs/superpowers/specs/2026-10-10-workflow-system-subgraphs-design.md

## Global Constraints

- Keep schema 3, runtime 2 and existing operationVersion 1 contracts.
- Add zero public node types; extend Compose, subgraph capabilities and editor commands.
- Preserve old Compose settings, section.NAME pin IDs, literal fallbacks, templates, separators and pinned semantic hashes.
- Native generation and acceptance remain owned by the enclosing Main workflow.
- Preview, Run to here, rejection, cancellation and public runner calls never publish or persist effects.
- Preserve actor, user, chat, source, document-reference and currentness authorization; portable bytes never grant authority.
- Keep For Each host-operation restrictions and native lifecycle/source root-only rules.
- Keep duplicate writes to one target rejected; no silent last-writer-wins or claim of atomic disk saving.
- Use Node.js 24 or later and the existing locked dependencies; no new runtime dependency.
- Leave F:/git/SillyCanvas and its unrelated uncommitted changes untouched.

## Review Focus

- Old pinned Compose definitions remain importable with unchanged identity after additive controls.
- Two sibling systems with identical local IDs save distinct intents and keep intentional shared-target conflicts visible.
- A source/actor change during awaited tokenization or prompt installation revokes composed private guidance.
- A disabled stateful system cannot provision defaults, spend requests or stage effects through a terminal branch.
- A stale or cancelled Add system dialog leaves graph, connections, definitions, selection and tabs unchanged.

## Task 1: Stateful static subgraphs and participation

**Files:**
- Create: src/workflow/system-capabilities.js and declaration, tests/workflow-system-subgraphs.test.mjs.
- Modify: src/workflow/graph-validation.js, resolve.js, runtime.js, host.js, native-settlement.js, workflow-data-defaults.js and related declarations.
- Modify: scoped descriptor metadata in operations/file-nodes.js, time-nodes.js, random-outcomes.js as needed; src/ui/native-search-catalog.js must use the same scoped capability rule.
- Test: workflow-composition, iteration helpers, native stage barrier, defaults, file access, native outcomes/time/settlement, addressed runtime suites.

**Interfaces:**
- Produces isScopedSystemOperation(node): boolean: true only for the five spec-approved operations; consumers cannot opt in via portable fields.
- Produces resolveSystemNode(node, address): Result<effective node plus reserved default definitions>; root and explicit controls stay unchanged, nested notes/outcomes are addressed and clock is shared.
- Runtime host dispatch passes the authentic NodeAddress, including instancePath, to existing host sessions and file intent preparation.
- Disabled subgraph descendants carry trusted skip metadata in plans; downstream consumers receive existing output state status:'skipped'.

- [ ] Read the spec and analysis report .tmp/workflow-systems/subgraphs.md; confirm actual production seams.
- [ ] Write one failing test for an allowed nested file read, run it and confirm ROOT_ONLY/HOST_OPERATION failure.
- [ ] Implement narrow descriptor/validation/host dispatch delegation and prove the read passes without broadening lifecycle or For Each rights.
- [ ] Incrementally test and implement nested Write/Clock/Outcome staging, exact-source and preview restrictions, addressed intent identity and shared-target conflicts.
- [ ] Incrementally test and implement stable scoped notes/outcomes defaults, preserved root defaults/explicit IDs and shared Chat clock.
- [ ] Incrementally test and implement wrapper enabled:false skip semantics, including no host calls, no model calls, no effects/defaults and correct optional-source output state.
- [ ] Verify nested lifecycle/Memory/Recall/source operations retain original exclusions and that two stages keep one generation boundary.
- [ ] Run targeted suites and the full npm test suite with escalation where child processes require it; record commands/results.
- [ ] Self-review, write .tmp/workflow-systems/task-1-report.md, commit only owned feature files, and return status/commit/test summary.

## Task 2: Compose Guidance and authentic aggregate admission

**Files:**
- Create: src/workflow/compose-guidance.js/.d.ts for deterministic contribution resolution; src/workflow/native-guidance-compose.js/.d.ts for run-owned proof registry; tests/workflow-native-guidance-compose.test.mjs.
- Modify: src/workflow/operations/nodes.js/.d.ts, catalog.js, runtime.js, host.js and related scoped output hook declarations.
- Test: workflow-primitive-nodes, ports, definition identity, native actor context, Recall provenance, unified host suites.

**Interfaces:**
- Consumes Task 1 authentic addressed static runtime and existing outputStates.
- resolveComposeContributions(settings, inputs, inputStates): Result<{sections, contribution reports, original contributors}> uses exact original artifact references; pure composeText still receives only name/text sections.
- createNativeGuidanceComposition(): {retain(payload): Result, authorize(artifact, authorizeOriginal): Result, clear():void} owns an unexported WeakMap of exact frozen outputs and original input identities, bounded recursive aggregates, and rejects modified rendering.
- Section records add kind?, required?, onSkipped? with the exact defaults/values in the spec. budgetTokens defaults 0 and ranges 0..8192.
- Runtime forwards inputStates/countTokens to the primitive adapter and composition retention after modifiers/privacy/freeze. Host authorization includes aggregates at every existing native guidance guard.

- [ ] Read the spec and analysis report .tmp/workflow-systems/guidance.md.
- [ ] Write one failing real typed Guidance-to-Compose test, then implement effective ports, section admission and named input validation.
- [ ] Incrementally test legacy literal/template behavior, skipped omission, missing/required/unresolved sources and input getter rejection.
- [ ] Incrementally test ordered contribution reports, rendered budgets and additive-default semantic hash compatibility.
- [ ] Write one failing native public-plus-authentic-current-actor guidance test; implement private per-run retained composition proofs using the existing actor/Recall authorizers.
- [ ] Incrementally test forged/cloned/modified/hidden/other-actor/private Text sources, nested composition, root Recall inclusion, stale sources and tokenizer/setter reentrancy.
- [ ] Ensure public execution and serialization expose no private capability and no preview/failed run can inject or settle effects.
- [ ] Run targeted suites and full npm test; self-review and write .tmp/workflow-systems/task-2-report.md.
- [ ] Commit owned changes and return status/commit/test summary.

## Task 3: Add system and existing-node UI upgrades

**Files:**
- Create: src/workflow/system-authoring.js/.d.ts, UI authoring projection/controller helper and a focused Svelte dialog if existing components cannot serve it; tests/workflow-system-authoring.test.mjs and tests/browser/workflow-systems.spec.mjs.
- Modify: src/ui/controller.js, workspace-preparation.js, native-search-catalog.js as needed, ui/workspace-menu-model.ts, NodeDetails.svelte, StructuredControl.svelte and related DTO types.
- Modify: existing subgraph instance control edit path and saved document/tab paths only where required.

**Interfaces:**
- Consumes typed Compose sections and Task 1 skip semantics.
- prepareAddSystem(root, command): Result<PreparedGraphEdit plus instanceId and added addresses> parses a selected pinned closure, explicit typed boundary bindings, exposed overrides and chosen Guidance merge destination. It produces one validated root transaction without mutating the input.
- projectSystemAuthoring(root, library, scope): Result<picker DTO> offers saved definitions and explicitly identified compatible source/destination choices; stale capture invalidates submission.
- enable control edits existing SubgraphInstance.enabled using qualified root transactions, without routing the wrapper through primitive describeOperation.

- [ ] Read the spec and analysis report .tmp/workflow-systems/authoring.md.
- [ ] Write one failing Add system transaction test; implement declaration-checked definition insertion and editable local copy, including full nested closure and stable remapping.
- [ ] Incrementally test explicit inputs/destinations, occupied-pin protection, ambiguous sources, optional Guidance section naming, existing/new Compose integration and state-only terminals.
- [ ] Incrementally test stale/cancelled commands and atomic undo/redo; preserve library revisions and sibling copies.
- [ ] Add Workflow -> Add system... chooser/configuration/connection preview and open the inserted body after one successful commit.
- [ ] Upgrade StructuredControl section rows with kind/required/skipped-policy fields and existing ordering; expose shared budget/report preview through existing Details/Preview controls.
- [ ] Add wrapper enable control with clear run/skip wording and addressed validation; ensure tab navigation alone never changes execution.
- [ ] Verify Save/Open restores Main, definitions, bindings and system tabs; browser acceptance demonstrates adding, editing, disabling and restoring a system.
- [ ] Run targeted Node/UI/browser suites, type checking and full npm test; self-review, report and commit owned changes.

## Task 4: Combined example, documentation and whole-feature verification

**Files:**
- Create: one portable combined-system example and focused acceptance test/helper demonstrating item effect, relationship state and eight-hour weather under one Main.
- Modify: docs/node-reference.md, operators-manual.md, unified-workflows.md, lattice-workspace.md and README.md where the existing claims/contracts change.
- Regenerate: dist/lattice-ui.js and other existing build assets.

**Interfaces:**
- Consumes Tasks 1-3; example uses only existing operation IDs and the upgraded contracts.
- A single owned generation produces combined guidance and staged system effects; Apply settles the exact result once.

- [ ] Build a deterministic no-provider test fixture and portable example with independently editable system bodies, shared clock and distinct state targets.
- [ ] Verify simultaneous eligible item/weather contributions reach one native injection and post-reply relationship state saves only on Apply.
- [ ] Verify preview/rejection/cancellation and disabling each system preserve expected state and no duplicate effects/random draws.
- [ ] Document Add system, guidance controls, tab semantics, state scopes, accepted effects and existing root-only Memory/Recall limits using plain user-facing language.
- [ ] Run npm test, npm run check:types, npm run build, npm run check:assets and npm run test:browser on this worktree; resolve any regressions and capture browser evidence.
- [ ] Review the branch independently, fix substantive findings with covering tests, and commit documentation/example/assets.
- [ ] Verify clean feature status and report worktree path, branch, behavior, checks and material limitations. Preserve worktree for review; do not merge or publish without the user's instruction.
