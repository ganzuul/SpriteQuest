# Readable and Source Preview Specification

**Status:** Prepared for review under the approved [design overview](2026-10-10-readable-node-workflows-design.md).

## Goal and scope

Replace serialized walls of text with a faithful, readable default across the shared output-preview surface. Provide exactly two presentation modes, **Readable** and **Source**. Runtime artifacts, capture freshness, pinning, execution, review, and publication retain their existing behavior.

## Global constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Readable presentation is faithful to retained content; it never summarizes, rewrites, or fabricates messages or metadata.
- Source means the retained privacy-projected diagnostic payload, subject to existing recording and display bounds; it does not expose private host state.
- Keep the existing 4 MiB recording, 256 KiB artifact, and 64 KiB preview-text bounds and explicit omission/truncation notices.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Current implementation

`recording.js::diagnosticJSON` records privacy-projected artifacts. `record-data.js::safeSource` removes host tokens and original source text. Native `snapshotReply` retains draft prose in `text` and captured messages in `context.messages`; those messages are distinct from `source` metadata.

`workflow-surface.js::boundedSections` formats and caches the selected artifact; `workspace-preparation.js::projectWorkspacePanels` creates UI sections. `OutputPreview.svelte` currently renders section text in escaped `pre` elements. Existing Text modifier sections, selected-output tabs, target badges, pinned recordings, and local modifier previews must survive.

No general Markdown parser or HTML sanitizer is bundled today.

## Presentation behavior

### Readable

Readable is the default when there is no valid saved mode preference.

| Retained subject | Presentation |
| --- | --- |
| Text or Guidance | Exact own `text`, with supported formatting rendered. |
| Draft | Exact draft `text` as the main result. |
| Candidate | Exact candidate `text`; review/change information remains secondary. |
| Known Patches wrapper | Clearly labeled proposed changes and its typed draft, preserving existing sections. |
| Context | Ordered, separate full-width messages, with available role/id metadata. |
| Draft with retained context | Main draft plus separate, initially collapsed **Captured context · N messages**. |
| Generic Data | Indented JSON of `value`; no heuristic extraction of arbitrary `text` or `messages` fields. |
| Recognized Pattern report | Per-rule counts, total count, and expandable occurrence rows from the [Pattern schema](2026-10-10-pattern-routing-design.md). |
| Recognized Filter report | Selected removals, retained-unit count, and blocked/empty diagnostics, with exact retained unit text. |
| Unknown structured artifact | Indented retained JSON. |
| Omitted or prefix-only recording | Explanation and access to Source; no fabricated readable reconstruction. |

Known wrappers are recognized by their declared artifact kind and documented shape. Arbitrary Data objects containing `text`, `messages`, `source`, or `token` remain ordinary Data.

Message order, empty message content, and original wording are preserved. Show role labels when speaker names were not captured; do not look up names, dates, or content from the current host. Show captured speaker/date metadata only when explicitly retained. Empty retained `messages: []` means **No captured messages**; missing context means unavailable, not zero messages.

Use approximately 16px body text, 1.55 line height, and a maximum prose width of 80ch while respecting the existing theme and zoom. Code/JSON use monospace and can scroll horizontally. Message boundaries remain visible without relying only on color.

### Source

Source displays the selected artifact's retained diagnostic payload, indented with two spaces when a complete structured capture exists. The mode includes the notice **Recorded diagnostic payload; private host fields are excluded.** The notice describes capture policy, without claiming which fields were removed from a particular record.

Source includes retained metadata and wrapper structure, rather than only the currently selected prose subsection. Modifier-specific Output/Raw output/Modifier trace sections remain accessible in Readable; these are artifact-content tabs, not additional presentation modes. Source may hide that subsection selector while retaining its selection for switching back.

If only a JSON prefix was recorded, show it as **Partial recorded source**. A display-truncated complete payload is also labeled partial. Never describe or copy an incomplete prefix as valid JSON. Source does not reacquire current runtime or host data.

### Selection, preference, and copying

Keep mode choice independent of selected artifact/subsection, capture identity, target selection, pin/follow state, and collapse state. For the first release, persist one application-wide mode string under `lattice.workspace.preview.mode`. Only `readable` and `source` are valid. Missing, corrupt, or unavailable storage falls back to Readable; storage failure does not break the preview. Do not store document content or payloads in preferences.

Preserve the existing artifact/subsection reconciliation and keyboard/paste isolation. Do not treat the current revision-based `sourceKey` as a preference namespace. The existing `lattice.workspace.preview` pane geometry storage is unchanged.

**Copy text** copies the exact bounded underlying text/Markdown of the selected prose section. Each message has **Copy message** for its exact retained text. **Copy source** copies exactly the displayed retained source. Partial text/source copies are visibly labeled; clipboard rejection produces local feedback and no workflow action. Copy does not depend on rendered DOM text, which can normalize whitespace or lose syntax.

## Bounds and fidelity

Derive readable content only from a complete `format: 'structured'` captured artifact. Never JSON-parse `json-prefix-text`, parse incomplete prefixes, or introduce an unbounded capture-time sidecar. A later readable sidecar would require its own explicit design and must debit existing recording budgets.

Allocate a single 64 KiB UTF-8 presentation-text budget per selected representation, including message labels and all message bodies. Do not grant 64 KiB to each message. Preserve complete messages where possible; truncate the final displayed body at a Unicode-safe boundary and show partial-message and omitted-message counts. Snapshot omissions and display omissions are separate notices. Source has its own 64 KiB display budget; switching modes does not change recorded retention.

Generated sanitized HTML has a separate maximum of 256 KiB per Readable representation. If markup exceeds it, shorten underlying input safely and rerender; never cut generated HTML. Mark resulting display truncation. Exact underlying retained text and Source remain unaffected. Cache projection by immutable recorded artifact identity and rendering by immutable content plus renderer policy, so status-only updates do not redo large parsing work.

## Safe formatting

Bundle `markdown-it` and `DOMPurify` through Vite, pinned by package lock at implementation. No CDN, host-global renderer, or remote resource fetch is required. Use Markdown without smart punctuation or linkification; allow source HTML only through the sanitizer.

Allowed tags: `p`, `br`, `hr`, `em`, `strong`, `s`, `blockquote`, `ul`, `ol`, `li`, `pre`, `code`, `h1` through `h6`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `details`, `summary`, `a`, `span`, and `div`.

Allowed source attributes: `href` and `title` on links, `start` on ordered lists, and `open` on details. Remove styles, classes, ids/names, event handlers, forms, scripts, frames, SVG/MathML, images, media, embeds, and resource-loading attributes. Links allow only `http:`, `https:`, and `mailto:`; block relative, protocol-relative, data, javascript, file, and app-action URLs. Add safe external-link behavior after sanitization using controlled attributes. Disallowed resource elements become inert text/alt descriptions where applicable, with a visible formatting-omission notice. Never evaluate inline scripts or fetch embedded resources.

Only the sanitizer's result enters Svelte HTML insertion. UI tables and message labels use normal escaped Svelte interpolation. Add licenses to `THIRD_PARTY_NOTICES.md`. Primary references: [markdown-it documentation](https://github.com/markdown-it/markdown-it), [DOMPurify documentation](https://github.com/cure53/DOMPurify). Stable package versions and Node/browser compatibility are checked when installing; planning installs nothing.

## Additive interfaces

Add `PreviewMode = 'readable' | 'source'` and hook-free DTOs in `src/ui/recorded-preview.d.ts`, referenced by the UI declarations:

```ts
interface PreviewSource {
  format: 'structured-text' | 'json-prefix-text' | 'omitted';
  text: string;
  truncated: boolean;
  policy: 'safe-recording';
}
type ReadableContent =
  | { kind: 'text'; text: string; truncated: boolean }
  | { kind: 'messages'; messages: readonly PreviewMessage[];
      omittedMessages: number; truncated: boolean }
  | { kind: 'json'; text: string; truncated: boolean }
  | { kind: 'pattern-matches'; report: PreviewPatternReport }
  | { kind: 'text-filter'; report: PreviewFilterReport }
  | { kind: 'unavailable'; reason: string };
interface PreviewMessage {
  id: string; role: string; speaker?: string; timestamp?: string;
  text: string; truncated: boolean;
}
```

`PreviewPatternReport` is a readonly UI summary of the Pattern report fields specified in the Pattern stream: status, total/matched-rule counts, rule summaries, occurrences, and diagnostics. The preview recognizer validates the report discriminant and shape before projecting these fields; it does not import the engine or confer live report authority. Before that stream lands, other reports use the generic Data fallback.

`PreviewFilterReport` is a readonly UI summary of the Filter report's status, action/unit, selected units, counts/lengths, and diagnostics. For unresolved blocked/empty output, label units **Proposed removals**, not as a completed edit.

`RecordedPreviewSection` and UI `PreviewSection` gain `readable` for content sections; existing format/truncation, raw modifier text, and trace information retain their functional roles. `OutputPreviewView` gains `source`. A new pure `projectRecordedPreview(artifact: RecordedArtifact | undefined): { source: PreviewSource; sections: RecordedPreviewSection[] }` uses only retained artifacts and bounded own-data reads. Live local Text modifier previews can replace their readable text while Source stays explicitly recorded. Update all producers and consumers together; no adapter for old preview DTOs is required.

## Acceptance and verification

- Exact synthetic Markdown/newlines display without JSON wrappers; Copy text preserves Markdown and whitespace.
- Three retained messages render as three ordered messages; a Draft's own reply is distinct from captured context.
- Empty strings, empty context, unavailable context, snapshot omissions, display truncation, omitted records, and malformed prefixes remain distinguishable.
- Generic Data with misleading field names remains Data; Pattern reports are recognized only by the agreed schema.
- Unsafe HTML and resource URLs are inert; supported details/summary, tables, code, and emphasis remain usable.
- Switching modes, pinning/following, expanding context, and copying leave request counts, source freshness, settlement, and host commits unchanged.
- Keyboard controls, tab selection, paste isolation, and controls at 320px remain usable.
- Status-only updates preserve projection references; large captures stay within aggregate budgets.

Use synthetic fixtures only. Focused tests cover pure projection, sanitizer behavior, UI mode/copy state, existing recording/privacy boundaries, cache stability, and browser fidelity. The implementation plan specifies commands and task ownership.
