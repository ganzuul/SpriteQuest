# Readable Node Workflows Delivery Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver familiar configuration, faithful readable previews, and useful Pattern-driven filtering as three coordinated workstreams.

**Architecture:** Authoring compiles canonical settings, preview projection reads retained diagnostic artifacts, and deterministic Pattern/Filter operations run through existing routing and Draft authority. Separate stream plans define concrete interfaces, files, tests, and reviewable commits.

**Tech Stack:** JavaScript ES modules, Svelte 5, TypeScript declarations, Node >=24, Node tests, Playwright, dedicated Workers, bundled markdown-it/DOMPurify for preview rendering.

**Spec:** [Design overview](../specs/2026-10-10-readable-node-workflows-design.md), with three linked stream specifications. The user approved writing these documents; application implementation is a separate execution step.

## Global Constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- CSV applies only to declared list/table controls; prose, templates, paths, and regex expressions retain their syntax.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Readable presentation is faithful to retained content; it never summarizes, rewrites, or fabricates messages or metadata.
- Source means the retained privacy-projected diagnostic payload, subject to existing recording and display bounds; it does not expose private host state.
- Keep the existing 4 MiB recording, 256 KiB artifact, and 64 KiB preview-text bounds and explicit omission/truncation notices.
- Detection and filtering use zero model requests; optional natural-language configuration assistance is deferred.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Review Focus

- CSV terms versus numeric lists and regex quantifiers must retain intended grammar/type (node-entry Tasks 1/3/7).
- Readable versus Source must remain faithful for captured messages, prefixes, omissions, and privacy-projected fields (preview Tasks 1/2).
- Protected text, stale/copied reports, and whole-paragraph deletion must preserve Draft authority (Pattern Tasks 1/2/3).
- Multiple hits, no hits, and unresolved/empty results must execute one branch or hold work as appropriate (Pattern Task 4).
- Current docs, generators, and runnable examples must use the new contract; no legacy public Pattern alias remains (Pattern Task 5 and integration below).

## Deliverables and sequence

| Milestone | Plan | Result |
| --- | --- | --- |
| A | [Node entry](2026-10-10-node-entry.md), Tasks 1–3 | Shared authoring, familiar everyday lists/rules, and consistent creation/editing. |
| B | [Preview modes](2026-10-10-preview-modes.md), Tasks 1–3 | Readable/Source, safe formatting, separated messages, exact copying. |
| C | [Pattern routing](2026-10-10-pattern-routing.md), Tasks 1–4 | Current Pattern detector, report binding, Filter Text, Branch/Join integration. |
| D | Node entry, Tasks 4–7 | Typed paths/defaults/schemas/questions/schedules, bulk imports, complete declared control coverage. |
| E | Pattern Task 5, Preview Task 4, integration below | Current examples/docs, readable reports, and combined acceptance checks. |

The useful first milestone set is A+B+C plus current Pattern docs/examples. D completes the broader node-entry scope and is included in the approved planning package. D's schema/question/schedule work should not delay a functioning terms/preview/filter release. E's final check runs after all included work stabilizes.

Independent pure modules can be built in parallel. Integrate changes to `catalog.js`, `runtime.js`, `workspace-preparation.js`, `controller.js`, `types.d.ts`, `detail-types.ts`, package files, and shared user docs sequentially. Assign each shared file to one active owner; workers must preserve and accommodate other edits.

Pattern's public report schema and `{id,pattern,label?}` rules are fixed by its spec, so node-entry/preview pure modules can develop against synthetic fixtures before the engine lands. Use current `pattern` everywhere; do not add `behavior` or old-operation adapters.

Land Pattern Task 1 before the configured-Pattern integration in node-entry Task 3. Generic entry/projection modules can land earlier; no temporary compatibility adapter is needed. Preview Task 4 follows Pattern Tasks 1/3, while its ordinary content modes can land independently.

## Execution preparation

- [ ] Review the linked specs/plans and select execution method. Recommended: subagent-driven implementation with bounded ownership and independent review of parsing, sanitizer policy, and deletion authority. Native implementation with a final independent review is also valid.
- [ ] Reconcile the current workspace state: planning inspected a dirty `main` tree with other chats' work. Use an isolated execution baseline that includes the required current changes, or coordinate shared checkout ownership explicitly. Do not create a worktree from older HEAD and assume it contains the inspected uncommitted code.
- [ ] Run focused baseline tests for the first task before edits and record unrelated failures. Do not spend this documentation task running the full application suite.
- [ ] Read the project's applicable instructions and task-specific skills at execution time. GitHub CLI operations, if needed, use network-enabled permission; an expired token requires user reauthentication. No GitHub publication is part of this plan.

## Coordinated integration task

**Files:** Current public sections in `README.md`, `docs/README.md`, `docs/node-reference.md`, `docs/operators-manual.md`, `docs/unified-workflows.md`, affected example generators/current examples, browser synthetic fixtures, and a new `tests/browser/readable-node-workflows.spec.mjs`. Reuse each stream's focused unit fixtures rather than copying private Story-2 content.

**Interfaces:** This task consumes the three stream contracts without adding a new one. The synthetic browser scenario configures canonical `pattern.rules`, executes the existing Pattern/Branch/Filter/Join graph, and inspects Readable/Source recordings.

- [ ] Add a failing browser test that enters `Elara` plainly during creation and editing, confirms one parsed rule, scans repeated hits in two paragraphs, inspects counts, removes each matching paragraph once, and reviews the joined Draft. Assert zero model calls for Pattern/Filter.
- [ ] Add CSV `1, 2, 3` and JSON-array authoring cases producing equivalent rules; a synthetic reply produces counts12/0/2 and one branch choice. Assert Source shows the current diagnostic envelope and Readable shows separated captured messages.

  Synthetic browser-fixture assertions:
  ```js
  expect(ruleCounts).toEqual([12, 0, 2]);
  expect(totalOccurrences).toBe(14);
  expect(filterExecutionCount).toBe(1);
  expect(filteredDraftText).not.toContain('Elara');
  ```
- [ ] Add no-hit bypass and blocked/empty-filter scenarios; assert publication is held when required. Switch modes/copy/expand/pin and assert no additional run, capture, Worker, or commit.
- [ ] Update current docs with entry examples, quoted CSV guidance, Readable/Source meaning, Pattern outputs/matching defaults, filter unit semantics, and unresolved results. Regenerate affected examples from updated generators; do not stage unrelated pre-existing documentation changes.
- [ ] Check active references with `rg -n 'pattern-scan|Pattern Scan' src ui tests examples workflows tools docs README.md`; active code/runnable examples/current reference text must use Pattern. Historical research/spec explanations can describe the replaced operation explicitly.
- [ ] Run `node tools/check-documentation.mjs` and the stream focused suites. Run `npx playwright test tests/browser/readable-node-workflows.spec.mjs` after building the current UI; require all acceptance cases to pass.
- [ ] Run `npm run check` once after all changes stabilize. This performs the full Node suite, types, build, assets, and browser suite. Repeat only for subsequent material changes/failures; identify unrelated baseline failures explicitly rather than claiming a clean pass.
- [ ] Review the final branch, resolve substantive findings, and report delivered milestones, actual commands/results, remaining deliberately deferred features, and scoped change ownership. Commit only owned changes when the baseline permits safe separation; do not push/merge/publish without authorization.

## Planning-package verification

The documentation deliverable is complete when all linked specs/plans exist, local links resolve, interfaces/defaults/limits agree across streams, each requirement has an owning task, and the no-backward-compatibility decision is reflected everywhere. This verification does not claim application features have been implemented or tested.
