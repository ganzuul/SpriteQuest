# Pattern Detection and Text Filtering Specification

**Status:** Prepared for review under the approved [design overview](2026-10-10-readable-node-workflows-design.md).

## Goal

Detect keywords/patterns, inspect their occurrences, and use the result to route or filter a reply deterministically. Detection, routing, and text changes are distinct operations. Ordinary keyword detection and filtering require zero model requests.

## Global constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Detection and filtering use zero model requests; optional natural-language configuration assistance is deferred.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Current design and clean replacement

The current public `pattern-scan` operation invokes `repair.js::scanDraft`. That helper annotates Draft findings and narrows editable spans to matched phrases. Such phrase spans cannot authorize deleting the surrounding line or paragraph.

Replace the public operation with **Pattern**, operation ID `pattern`. It is a detector with exact Draft passthrough. Remove `pattern-scan` from active catalog, dispatch, authoring references, current docs, example generators, and fixtures. Do not introduce a legacy annotation mode, public alias, migration, or hash-preservation branch. Internal `scanDraft` may remain if another operation uses it; its annotation semantics are not the new public Pattern behavior.

New **Filter Text**, operation ID `filter-text`, performs deliberate unit deletion with existing authority checks. Branch and Join already provide routing; no execution-wire subsystem is needed.

## Pattern configuration and ports

Pattern is post-phase, nonterminal, request bound 0.

| Pin ID | Label | Kind | Direction |
| --- | --- | --- | --- |
| `in` | Draft | draft | Required input |
| `out` | Draft | draft | Output |
| `matched` | Matched | data | Output containing a primitive Boolean |
| `matches` | Matches | data | Output containing the typed report |

```ts
interface PatternRule { id: string; pattern: string; label?: string }
interface PatternSettings {
  mode: 'literal' | 'whole-word' | 'regex';
  scope: 'authorized' | 'whole' | 'narration' | 'dialogue';
  caseSensitive: boolean;
  rules: PatternRule[];
  exemptions: string[];
  protectedLiterals: string[];
  matchPolicy: 'any' | 'all';
  minOccurrences: number;
  regexFlags: string;
  timeoutMs: number;
}
```

Defaults: `mode: 'whole-word'`, `scope: 'whole'`, `caseSensitive: false`, empty lists, `matchPolicy: 'any'`, `minOccurrences: 1`, `regexFlags: ''`, `timeoutMs: 1000`. Friendly entry compiles terms/CSV/JSON into rule records with stable IDs; advanced configuration uses the same canonical shape. Regex uses expression rows and never CSV-splits expression text.

Bound rules and literal lists to 128 entries, patterns/pins to 2,048 UTF-16 units each, IDs/labels to 128 units, and source Draft text to 100,000 units. Rule IDs are unique and nonblank. `minOccurrences` is an integer 1–4,096. Worker timeout is an integer 100–2,000 ms. Invalid configuration is an error, not a false result.

## Matching semantics

Scan the story body returned by `readDraftBody`, excluding appended presentation sections. Match offsets are UTF-16 half-open `[start,end)` positions in the exact current Draft/body prefix. Preserve Unicode boundaries and original text; do not lowercase a copy and reuse its changed offsets.

- Literal mode matches substrings, including overlapping occurrences.
- Whole-word mode uses literal matches whose preceding/following code points are absent or outside Unicode letters, numbers, marks, and underscore. Apostrophes/hyphens are boundaries. `though` does not match `thought`; `1` does not match `12`.
- Regex mode supports expression strings without `/.../` delimiters. Matching is nonoverlapping and global, Unicode is implicit, case comes from `caseSensitive`, and optional flags are unique `m`/`s` only. Zero-width matches are errors.
- Whole/narration/dialogue selects scan regions; a match must lie fully within one region. Authorized scope additionally requires existing Draft permissions and cannot be used on an unannotated root Draft.
- Whole scope can inspect noneditable text; it does not grant editing permission. Each occurrence reports whether it is currently editable and/or protected.
- Upstream and configured exemptions exclude overlapping occurrences from counts. Apply the existing retained exemption case policy; new exemptions also apply their configured case policy.
- Protected literals remain inspectable and may trigger Matched, but cannot be deleted. Combine upstream and configured protections without weakening either.

Occurrence identity is `(ruleIndex,start,end)`. Duplicate authored patterns can count separately; overlapping rules also count separately. Counts are for this invocation only, excluding upstream findings, merged permission spans, and diagnostics.

ANY requires at least one rule with a hit. ALL requires every configured rule to have a hit. Both are ANDed with `totalOccurrences >= minOccurrences`. An empty rule list always returns false, including ALL.

For twelve occurrences of `1`, two of `3`, and none of `2`, the report contains fourteen occurrences, counts 12/0/2, and Matched is true under the default ANY/minimum-one condition. ALL is false.

## Report and errors

```ts
interface PatternOccurrence {
  ruleId: string; ruleIndex: number; start: number; end: number;
  text: string; protected: boolean; editable: boolean;
}
interface PatternMatchReport {
  recordType: 'pattern-matches'; schemaVersion: 1;
  status: 'complete' | 'unresolved';
  matched: boolean | null;
  totalOccurrences: number | null;
  matchedRuleCount: number | null;
  rules: (PatternRule & { count: number | null })[];
  occurrences: PatternOccurrence[];
  source: { revisionId: string | null; rootRevisionId: string | null;
    textLength: number; bodyLength: number };
  settings: Pick<PatternSettings, 'mode' | 'scope' | 'caseSensitive' |
    'matchPolicy' | 'minOccurrences' | 'regexFlags'>;
  diagnostics: { code: string; message: string }[];
}
```

Sort occurrences by start, end, then rule index. Rule summaries remain authored order, including zero-count rules. Exact matched text appears once per occurrence; readable excerpts can derive from retained report information without adding invented context.

No match is completed `matched: false` and a complete report with zero counts. Do not use unresolved for ordinary no-hit results. Ambiguous narration/dialogue quotes produce unchanged `out`, unresolved `matched` with reason `UNMATCHED_QUOTES`, and completed `matches` containing an unresolved report with null counts and no purported complete occurrences. Whole scope can still scan with a quote diagnostic.

At most 4,096 occurrences are permitted. The complete report must also satisfy the generic Data bound: <=10,000 traversed values, depth <=32, <=262,144 UTF-8 bytes. These limits can be reached before 4,096 occurrence objects; return `PATTERN_REPORT_LIMIT` without partial results or false decisions. Syntax errors, zero-width regex, timeout, cancellation, invalid Draft authority, and scan limits are explicit failures.

Use an owned terminable Worker for regex, following the existing Text Rules lifecycle. The timeout includes startup; abort terminates the Worker. No caller-thread regex fallback. Literal/whole-word matching stays deterministic and bounded.

## Live report binding

Filter Text accepts a fresh report from Pattern for the exact same Draft. A private WeakMap keyed by `matches.value` retains the original Draft reference, bounded checked snapshot, effective settings, and scan regions. Validate/clone the JSON report before binding the actual emitted value; do not clone it again through generic primitive input admission before consulting the binding.

Runtime wiring, Branch, Join, Reroute, and static composition preserve value identity. Recordings, JSON import, Collect, Select Fields, and For Each collection/result cloning produce descriptive copies and do not recover this binding. No public token appears in the report. Reject missing/forged/copied binding as `INVALID_MATCH_REPORT`, or changed Draft/source/revision/permissions as `STALE_MATCH_REPORT`. Re-running Pattern produces a fresh valid report.

This binding carries evidence of the exact scan, not deletion permission. Permission is independently established from the Draft and Filter scope. The report's public offsets/flags never grant authority.

## Filter Text

Filter Text is post-phase, nonterminal, request bound 0. Pins: required `in: draft`, required `matches: data`, outputs `out: draft` and `report: data`.

Controls: `action: 'remove' | 'keep'` (default remove), `unit: 'line' | 'paragraph'` (default paragraph), `scope: 'authorized' | 'whole' | 'narration' | 'dialogue'` (new-node default whole), and `protectedLiterals: string[]` (default empty). Store the fresh node's explicit scope. Existing Draft permissions and protections can only narrow the selected scope.

Scan scope selects hits; Filter scope limits edits. Each unit containing at least one current occurrence is a matching unit. Remove deletes matching units; Keep deletes nonmatching units. Deduplicate units before deletion. Multiple hits in one paragraph remove that paragraph once.

### Units and delimiter ownership

- A line ends at an actual LF, CRLF, or CR separator. Its range includes its following separator when present; the last unterminated line includes only its own content. Visual wrapping is not a line.
- A paragraph is a maximal run of nonblank lines. Blank means only spaces/tabs or empty content. Following blank-line separators belong to the preceding paragraph; leading blank separators belong to the first paragraph. The final paragraph includes its following trailing blank separators.
- Selected deletion ranges retain these original delimiters. Do not normalize newlines, trim retained text, or collapse spacing.
- Unit selection covers story body only. Appended presentation sections remain byte-for-byte intact.

Example: removing the middle paragraph from `First.\r\n\r\nElara arrives.\r\n\r\nLast.` yields `First.\r\n\r\nLast.`. Removing the final unterminated line of `First.\nElara` yields `First.\n`.

### Permission and settlement

Prepare authorized windows using the existing reference-Draft checks, combining inherited/configured protections and exemptions. A deleted unit must be fully contained in authorized windows; surrounding unit text does not become editable merely because it contains a keyword. Treat every unit atomically.

Because Pattern passes the Draft unchanged, its configured protections/exemptions are retained in the private scan binding rather than added to the Draft. Filter must also check selected units against those retained scan restrictions. Union Pattern/Draft/Filter protected literals for deletion preparation; independently exclude both stored and scan-configured exemption ranges with their original case policies. A report flag alone is insufficient to enforce a whole-unit restriction.

If any selected unit crosses an immutable/protected/exempt region, return unresolved `out` with `FILTER_PERMISSION_BLOCKED`, a completed report identifying blocked units, and no partially filtered Draft. At most 256 affected units/deletion ranges are permitted; larger selections return `FILTER_UNIT_LIMIT` without truncation. Complete reports also satisfy generic Data limits.

Remove with no matching units returns the exact input Draft and a completed no-op report. Keep with no matching units, or a deletion leaving an empty/whitespace-only story body, returns unresolved `out` with `EMPTY_FILTER_RESULT` and a completed report/removal preview. Existing nonblank publication requirements remain effective; do not silently publish an empty reply.

Add `createDraftDeletionRevision(parent, deleteRanges, {nodeId, scope, protectedLiterals})`. It validates bounded sorted nonoverlapping Unicode-safe ranges against independently prepared authorized windows, then deletes exact bytes. Remap surviving editable spans, lineage, root revision identity, protections, and assembled story-body boundaries directly. Do not use ambiguous text-anchor alignment and do not relax ordinary model patch validation to allow blank replacements.

Filter reports use the following public schema. Units describe selected deletion units; on blocked/empty output they are proposed removals, not a completed edit.

```ts
interface FilterTextReport {
  recordType: 'text-filter'; schemaVersion: 1;
  status: 'complete' | 'blocked' | 'empty';
  action: 'remove' | 'keep'; unit: 'line' | 'paragraph';
  units: { start: number; end: number; text: string; blocked: boolean }[];
  originalBodyLength: number; resultBodyLength: number;
  retainedUnitCount: number;
  diagnostics: { code: string; message: string }[];
}
```

Recording/display limits can truncate presentation, but the operation never silently drops selected units or hides an incomplete transformation. If complete report admission exceeds Data bounds, return `FILTER_REPORT_LIMIT` without a transformed output.

## Routing and execution

Wire Pattern `out` to Branch `in` (artifactKind Draft), Pattern `matched` to Branch `condition`, and the matched payload plus Pattern `matches` to Filter. Send the unmatched payload and filtered Draft to Join, then existing Review/Publish.

Branch chooses one path per workflow run. Fourteen occurrences do not run the branch fourteen times. Explicit iteration can consume descriptive occurrence/group arrays for suitable Data workflows. Preserve existing For Each capability restrictions; Data seeds do not acquire native Draft authority.

Inactive required paths are skipped before model binding or downstream execution. Unresolved conditions hold dependent work. Opening a preview, switching modes, or executing existing `preview`/`dryRun` paths creates no scan Worker, model request, host capture, or publication. A user-requested workflow rerun is a new execution and may repeat downstream actions under existing settlement rules. Autonomous keyword watchers are deferred.

## Acceptance

Synthetic tests exercise repeated/overlapping hits, whole words, Unicode offsets, protected/noneditable hits, exemptions, ANY/ALL/minimum counts, malformed quotes, regex cancellation/deadlines, complete-report limits, direct/static routing, copied/stale reports, exact newline deletion, multiple hits per unit, blocked units, no-op/empty results, appended sections, and final review. Current docs and generated examples teach Pattern detection and Filter Text rather than annotation/repair behavior.
