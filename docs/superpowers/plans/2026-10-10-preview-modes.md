# Readable and Source Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present retained outputs as faithful readable content by default, with inspectable Source and clear message boundaries.

**Architecture:** Project safe recorded artifacts into typed content sections and a separately bounded Source representation. A dedicated Markdown/sanitizer module renders prose; Svelte renders typed messages and reports. Mode preference and copying remain local UI behavior.

**Tech Stack:** JavaScript ES modules, Svelte 5, TypeScript declarations, Node >=24, jsdom, Playwright, bundled markdown-it and DOMPurify.

**Spec:** [Preview modes](../specs/2026-10-10-preview-modes-design.md). Read the [overview](../specs/2026-10-10-readable-node-workflows-design.md) and [delivery order](2026-10-10-readable-node-workflows.md) first.

## Global Constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Readable presentation is faithful to retained content; it never summarizes, rewrites, or fabricates messages or metadata.
- Source means the retained privacy-projected diagnostic payload, subject to existing recording and display bounds; it does not expose private host state.
- Keep the existing 4 MiB recording, 256 KiB artifact, and 64 KiB preview-text bounds and explicit omission/truncation notices.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Review Focus

- Generic Data objects with `text`/`messages`/`token`/`source` fields must remain ordinary JSON, not be heuristically rewritten (Task 1).
- Prefix-only captures, multibyte aggregate budgets, and empty/missing context need distinct honest displays (Task 1).
- Malformed HTML, unsafe URL schemes, resource elements, and excessive generated markup must stay inert and bounded (Task 2).
- Mode persistence and copy failure/partial labels must not alter pin/follow, freshness, execution, or settlement (Task 3).
- Status-only projection updates and live Text modifier previews must not invalidate recorded Source or cause repeated large rendering work (Tasks 1 and 4).

## Ownership

Own recorded-preview projection, rendering, and OutputPreview UI. Coordinate `workspace-preparation.js` and `ui/detail-types.ts` changes with node-entry tasks. Do not change host snapshot acquisition, recording quotas, or publication code. The Pattern report shape is read from its spec; UI recognition is not a live report validator.

## Task 1: Typed projection of retained artifacts

**Files:** Create `src/ui/recorded-preview.js`, `.d.ts`, `tests/ui-recorded-preview.test.mjs`; modify `src/ui/workflow-surface.js`, `src/ui/workspace-preparation.js`, `src/workflow/types.d.ts`, `ui/detail-types.ts`, and focused `tests/workflow-recording.test.mjs`, `tests/ui-preview-tabs.test.mjs`, `tests/ui-preview-review-integration.test.mjs`, and `tests/ui-projection-performance.test.mjs`.

**Interfaces:** Produce the spec's `PreviewSource`, `ReadableContent`, `PreviewMessage`, `PreviewPatternReport`, and `PreviewFilterReport`; `projectRecordedPreview(artifact: RecordedArtifact | undefined): {source:PreviewSource; sections:RecordedPreviewSection[]}`. Keep pure projection separate from the DOM renderer. Source is selected-artifact-wide and cached with sections. Update DTO producers/consumers directly; no old DTO compatibility adapter.

- [ ] Add synthetic tests asserting exact prose/newlines, candidate vs draft content, three ordered role-labeled messages, separate collapsed draft context, retained-empty vs missing context, and generic Data with misleading field names.
- [ ] Add `partial JSON never becomes readable messages`, omitted-record policy notices, snapshot omissions vs display omissions, Unicode-safe final-message clipping, and one aggregate 64 KiB UTF-8 text budget across messages/labels. Assert Source indentation/truncation labels and absence of private token/originalText fields.
- [ ] Add cache tests: same retained artifact/status-only update preserves projected references; local Text modifier output changes Readable while Source remains recorded. Preserve modifier Output/Raw output/Trace sections.

  Synthetic Draft fixture assertions:
  ```js
  const projected = projectRecordedPreview(recordedDraftFixture);
  assert.equal(projected.sections[0].readable.kind, 'text');
  assert.equal(projected.sections[0].readable.text, exactReplyText);
  assert.deepEqual(projected.sections.find(s => s.readable.kind === 'messages').readable.messages.map(m => m.role),
    ['user', 'assistant', 'user']);
  ```
- [ ] Run `node tools/test-all.mjs ui-recorded-preview workflow-recording ui-preview-tabs ui-preview-review-integration ui-projection-performance`; confirm intended failures.
- [ ] Implement own-data typed recognition and bounded projection. Read only `format:'structured'`; prefix/omitted recordings yield unavailable Readable without host lookup. Preserve recorded/source privacy policy.
- [ ] Run the same suites and `npm run check:types`; require passes. Commit `feat(ui): project readable recorded outputs`.

## Task 2: Bounded sanitized Markdown rendering

**Files:** Create `src/ui/preview-markdown.js`, `.d.ts`, `ui/ReadableContent.svelte`, `tests/ui-preview-markdown.test.mjs`; modify `package.json`, `package-lock.json`, and `THIRD_PARTY_NOTICES.md`.

**Interfaces:** Produce `renderPreviewMarkdown(text:string, window:Window, options?:{maxHtmlBytes?:number}): {html:string; truncated:boolean; omittedFormatting:boolean}` with default max HTML bytes 262,144. The complete selected representation shares that budget; multiple message renders do not each receive a full budget. Cache by immutable content plus rendering policy. `ReadableContent.svelte` accepts typed `ReadableContent` and copy callbacks, and emits only sanitizer-owned HTML for prose.

- [ ] Add tests for paragraphs, headings, emphasis, code fences, tables, lists, and details/summary; assert punctuation/wording stays unchanged and copying is independent of rendered DOM normalization.
- [ ] Add malicious script/event/style/id/name/SVG/iframe/image/media cases; assert no executable/resource-bearing nodes survive. Test `javascript:`, `data:`, `file:`, relative, protocol-relative, and app URLs are blocked; http/https/mailto remain controlled links. Assert removed resources are represented inertly with omission feedback.
- [ ] Add deeply repeated Markdown producing >256 KiB markup; assert input shortening + rerender produces bounded complete DOM, not cut HTML. Use a multibyte final boundary and multiple-message aggregate case.

  Sanitizer assertions in the jsdom Window fixture:
  ```js
  const rendered = renderPreviewMarkdown('<img src="https://example.test/pixel" onerror="alert(1)">Hello', window);
  assert.equal(rendered.html.includes('<img'), false);
  assert.equal(rendered.html.includes('onerror'), false);
  assert.equal(new TextEncoder().encode(rendered.html).byteLength <= 262144, true);
  ```
- [ ] Run the new renderer suite and confirm the missing module assertions fail. Resolve supported stable releases, then run `npm install --save-exact markdown-it dompurify` under network-enabled permissions. Add exact package-lock pins and license notices; add no CDN/runtime host-global dependency.
- [ ] Implement the exact tag/attribute/URL policy from the spec using DOMPurify, with smart punctuation and linkification disabled. Render UI labels/report tables through escaped Svelte text. Never add source HTML attributes after sanitization except controlled link behavior.
- [ ] Run `node tools/test-all.mjs ui-preview-markdown`, `npm run check:types`, `npm run build`, and `npm run check:assets`; require passes. Commit `feat(ui): render safe readable preview text`.

## Task 3: Two modes, remembered choice, and exact copying

**Files:** Create `src/ui/preview-preferences.js`, `.d.ts`, `tests/ui-preview-preferences.test.mjs`; modify `ui/OutputPreview.svelte`, `ui/ReadableContent.svelte`, and `tests/ui-preview-tabs.test.mjs`, `tests/ui-preview-review-integration.test.mjs`, `tests/ui-preview-target-badge.test.mjs`. Add `tests/browser/preview-modes.spec.mjs`; extend `tests/browser/preview-fidelity.spec.mjs`.

**Interfaces:** Produce `readPreviewMode(storage?:Pick<Storage,'getItem'>): PreviewMode` and `writePreviewMode(storage:Pick<Storage,'setItem'>|undefined, mode:PreviewMode): boolean`, using only `lattice.workspace.preview.mode`. UI uses `navigator.clipboard.writeText` through an injectable callback for tests; success/failure feedback is local. Mode never enters the workflow graph or recording.

- [ ] Test default Readable, saved Source, invalid/corrupt storage fallback, disabled storage, and preservation through target changes/new capture/pin/follow/collapse. Assert no payload is stored and existing pane geometry key remains untouched.
- [ ] Test mode switching preserves subsection selection, Source is artifact-wide, captured context starts collapsed, and message copy uses exact retained Markdown. Assert partial-copy labels and visible clipboard rejection without thrown UI errors.
- [ ] Test keyboard focus, paste isolation, all controls reachable at 320px, and request/host capture/commit counters remaining unchanged after display/copy actions.

  Preference/counter assertions:
  ```js
  assert.equal(readPreviewMode({getItem:() => null}), 'readable');
  assert.equal(readPreviewMode({getItem:() => 'source'}), 'source');
  assert.equal(readPreviewMode({getItem:() => 'broken'}), 'readable');
  assert.deepEqual(afterDisplayActions, beforeDisplayActions);
  ```
- [ ] Run `node tools/test-all.mjs ui-preview-preferences ui-preview-tabs ui-preview-review-integration ui-preview-target-badge`; confirm intended failures.
- [ ] Add the Readable/Source selector, mode preference, controlled context/message presentation, copy controls, and ~16px/1.55/80ch prose styling. Use theme tokens and scoped-wrapper rich-descendant CSS. Preserve existing Run/Apply/target/freshness controls and read-only semantics.
- [ ] Run focused suites, `npm run check:types`, `npm run build`, and `npx playwright test tests/browser/preview-modes.spec.mjs tests/browser/preview-fidelity.spec.mjs tests/browser/artifact-pins.spec.mjs`; require passes. Commit `feat(ui): add preview modes and copy controls`.

## Task 4: Typed reports and integration regressions

**Files:** Modify `src/ui/recorded-preview.js`, `.d.ts`, `ui/ReadableContent.svelte`, `tests/ui-recorded-preview.test.mjs`, and `tests/browser/preview-modes.spec.mjs`. Extend existing projection/cache/privacy tests as necessary.

**Interfaces:** `PreviewPatternReport` projects only verified schemaVersion-1 `recordType:'pattern-matches'` public fields; `PreviewFilterReport` projects verified `recordType:'text-filter'`. These readonly UI DTOs never contain engine bindings. Count/report copy operates on displayed bounded text/source, not live artifacts.

- [ ] Add a 12/0/2 Pattern report with total 14; assert authored-order rule counts and occurrence rows. Add unresolved/null counts, protected flags, malformed discriminant/shape fallback to generic JSON, and stale recording labels.
- [ ] Add Filter reports for complete removal, blocked atomic deletion, no-op, and empty output; assert exact retained removed-unit text is readable and diagnostics are visible. Add report display clipping without implying complete retained evidence.

  Report fixture assertions:
  ```js
  const summary = projectRecordedPreview(recordedPatternFixture).sections[0].readable.report;
  assert.equal(summary.totalOccurrences, 14);
  assert.deepEqual(summary.rules.map(rule => rule.count), [12, 0, 2]);
  assert.equal(projectRecordedPreview(recordedUnknownDataFixture).sections[0].readable.kind, 'json');
  ```
- [ ] Run `node tools/test-all.mjs ui-recorded-preview`; confirm report presentation assertions fail.
- [ ] Add typed report projection/rendering and required empty/unresolved/partial notices. Test final Pattern-to-Filter output previews with synthetic captured artifacts once the Pattern stream lands.
- [ ] Run `node tools/test-all.mjs workflow-recording workflow-projection ui-details-projection ui-preview-tabs ui-preview-review-integration ui-preview-target-badge ui-projection-performance ui-diagnostic-boundaries ui-recorded-preview ui-preview-markdown ui-preview-preferences`, then types/build/assets and the Task 3 browser command. Commit `feat(ui): show pattern and filter reports`.

## Stream completion

The shared preview must work for ordinary Text/Draft/Context/Data without requiring the Pattern engine. Typed reports integrate after the Pattern report contract lands. Documentation/screenshots are updated by the coordinated delivery task. No recording-side readable sidecar or changed quota is part of this plan.
