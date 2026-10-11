# Familiar Node Data Entry Specification

**Status:** Prepared for review under the approved [design overview](2026-10-10-readable-node-workflows-design.md).

## Goal

Let people configure ordinary nodes with actual words, lists, rows, and typed fields. Lattice packages and validates those values. Advanced JSON remains available for precise configuration; requiring JSON syntax is no longer the default user experience.

“Plain language” here primarily means the value the person intended to enter, such as `though`. Inferring a multi-setting instruction such as “find though in narration and warn after three hits” is a separate, deferred Draft settings feature.

## Global constraints

- Use the existing JavaScript ES-module, Svelte 5, TypeScript declaration, Node test, and Playwright stack; Node >=24.
- Target one current contract; update docs, examples, generators, and tests instead of adding backward compatibility.
- Preserve source/revision authority, explicit scope restrictions, protections, privacy, and review/publication checks.
- Convert friendly configuration at authoring time into validated canonical settings; runtime execution does not infer intent from prose or choose a parser heuristically.
- CSV applies only to declared list/table controls; prose, templates, paths, and regex expressions retain their syntax.
- Opening previews, changing display modes, copying content, and saving settings never starts a workflow or commits host state.
- Preserve unrelated concurrent workspace edits and stage only files owned by the current implementation task.

## Shared authoring architecture

`NodeDetails.svelte` already uses descriptor-driven fields and `StructuredControl.svelte` row editors. `ConfigureNode.svelte` still presents an entire controls object as JSON. Both must render the same shared control projection, parser, row adapters, and validation messages.

Add `src/ui/control-input-contracts.js` and `.d.ts` for grammar and storage decisions, `src/ui/control-input-adapters.js` and `.d.ts` for node-specific row conversion, and `src/ui/node-control-projection.js` and `.d.ts` for descriptor-to-editor projection. Move existing `detailControl`, `visibleDetailControl`, and presentation decisions from `workspace-preparation.js` into that projection. Move row parsing out of the Svelte component.

```ts
type ControlInputFormat = 'auto' | 'plain' | 'csv' | 'json' | 'rows';
interface ControlInputSpec {
  id: string; version: 1;
  editor: 'text' | 'list' | 'rows' | 'schema' | 'value' | 'path' | 'hotkey' | 'helper';
  formats: readonly ControlInputFormat[];
  storage: 'text' | 'json-value' | 'json-text';
  limits: { maxItems?: number; maxStringLength?: number; maxBytes?: number };
}
resolveControlInputSpec(context: {
  operation: string; controls: Record<string, unknown>;
  key: string; descriptor: ControlDescriptor;
}): ControlInputSpec;
parseControlInput(spec: ControlInputSpec, input: {
  format: ControlInputFormat; text?: string; value?: JsonValue;
  currentValue?: JsonValue;
}): Result<{ value: JsonValue; sourceText?: string;
  displayItems?: readonly string[]; warnings: readonly string[] }>;
formatControlInput(spec: ControlInputSpec, value: JsonValue,
  format: ControlInputFormat): Result<string>;
```

`spec.id` identifies the operation/control grammar; add it and version to the existing editor contract key so mode/schema changes invalidate incompatible drafts. Result errors include a stable code, message, and row/cell/path when applicable. Parsing uses bounded own JSON data and existing operation validators. Limits derive from descriptors and engines, never invented unrestricted defaults.

Preserve storage semantics: schemas and Collection thresholds are JSON text strings; Pattern rules, Extract records, rows, and ordinary arrays are typed values. JSON-text controls preserve exact valid source text when saved from JSON mode and serialize once from forms. Runtime JSON Decode and provider response parsing stay strict.

## Terms, lists, and CSV

Literal term controls default to a familiar entry area with the help **Separate terms with commas or newlines. Quote phrases containing commas.** Show parsed chips/rows and count before Save. Provide an explicit **Plain text** interpretation for phrases that resemble JSON or include unquoted commas. Advanced JSON is an alternate authoring format, independent of preview Readable/Source modes.

| Input in term entry | Canonical meaning |
| --- | --- |
| `though` | One term. |
| `1,2,3` or `1, 2, 3` | Three string terms. |
| `001` | String `001`, not number 1. |
| One term per line | Terms in that order. |
| `"red, blue", green` | Two terms: `red, blue` and `green`. |
| `"say ""hello""", next` | Escaped quote within the first term. |
| `["1", "2", "3"]` | Valid JSON list compiled to the field's canonical collection. |

Auto recognizes apparent JSON containers only for declared structured controls. An opening `[`/`{` with malformed JSON produces an error and retains the draft; it does not silently become a term. Explicit Plain text retains those characters literally. Scalar-looking term inputs such as `true`, `null`, and `123` remain strings.

The list CSV parser supports commas, LF/CRLF/CR record separators, quoted commas/newlines, and doubled quotes. Flatten list-import cells in row order. Trim separator padding around unquoted entries; preserve content inside quotes. Ignore blank cells with a visible ignored-entry count. Unterminated quotes or trailing junk after a quoted field are errors. Do not deduplicate terms silently: duplicate authored rules remain distinct and their count behavior is visible.

Numeric-list contracts parse finite numbers, then apply engine constraints. Paths use typed segments; never split a literal property name on dots or commas without an explicit path/list import action. Regex inputs use expression rows: commas, quantifiers, brackets, and backslashes remain part of an expression. JSON is available through its explicit alternate, not auto detection inside a regex row.

Path editors expose numeric indices only where that consuming engine accepts mixed string/number JSON paths. Controls declared as string-array paths retain string keys, including numeric-looking keys; authoring does not broaden their runtime schema.

CSV/table import uses **Add rows** or **Replace rows**, a review of parsed rows/columns, then the ordinary Save transaction. Supported column mappings are adapter-specific; do not infer entire schedules or question records from free prose. Invalid imports do not alter saved configuration.

## IDs, drafts, and round trips

Generate IDs once for new Pattern/Extract/question/slot rows using the smallest unused positive suffix (`pattern-1`, `question-1`, or adapter-specific equivalent). Editing labels/text and reordering retains IDs. Explicit JSON IDs are validated and retained; duplicates are actionable errors. Pattern uses `{id, pattern, label?}` under the current `pattern` operation; Extract retains `{id, literal, label}`.

Forms edit supported fields while retaining supported extra values in the canonical row. Preserve optional-field absence separately from `null`, `false`, `0`, and empty strings. If an advanced shape cannot be represented by a simplified control, retain it in Advanced JSON and explain the limitation; do not drop fields on a view switch. A nonrepresentable CSV export is an explicit error, not a lossy conversion.

Unfinished or invalid text belongs to the local draft and survives view switches and rejected saves. Save compiles and validates one candidate through the existing graph transaction, including changed-port handling. Cancel leaves saved settings unchanged. Creation remains one creation transaction; imports and configuration saves produce a single relevant Undo step.

## Control coverage and delivery waves

The scope includes all currently exposed JSON/structured control families below. Waves are delivery order, not an unspecified future audit. Scalar string/number/enum/boolean controls retain their established controls.

| Wave | Controls | Friendly control / canonical contract |
| --- | --- | --- |
| Foundation | Configure Node and Node Details | Shared `DetailControl` rendering and typed draft state; whole-controls Advanced JSON remains available. |
| 1 | `pattern.rules` | Terms and expression rows; compile to current Pattern records, max 128. |
| 1 | `extract.patterns` | Phrase/label rows, generated stable IDs; max 64; optional terms/CSV import. |
| 1 | `collection.thresholds` | Numeric list; compile to the existing JSON text string. |
| 1 | `join.inputs`, `collect.inputs` | Slot rows `{id,label,required}`, 1–16; do not reuse Context Join's two-slot minimum. |
| 1 | `format.fields` | Same field-mapping rows as Select Fields. |
| 1 | `hotkey-arm.hotkey` | Physical key selection plus Ctrl/Alt/Shift/Meta; existing reserved-key validation. |
| 1 | `compose.sections`, `text-rules.rules`, `select-fields.fields`, `context-join.inputs`, `state.updates`, `state.durations` | Unify existing row editors and validation; retain mode-specific bounds. |
| 1 | `for-each.helper`, `for-each.roleOverrides` | Exact pinned helper and existing sparse binding selectors in both screens. |
| 2 | All exposed `.schema` controls: JSON Decode, Extract, Model Call, Format, Read File, Write File, Project Document | Shared supported-subset schema builder and Advanced JSON; preserve JSON text storage. |
| 2 | Select Fields/Format nested `.path` and `.default` | Key/index segment rows and typed value tree; optional default checkbox preserves absence. |
| 2 | `condition.value`, including null/object/array | Explicit type selector and bounded value tree; null remains an editable value. |
| 3 | `decision.questions` | Stable-ID question cards: yes/no, choices, ordered score rubric; structured instructions via typed tree/JSON. |
| 3 | `time-trigger.metadata` | Named typed values; reject reserved timing keys. |
| 3 | `advance-time.schedules` | Daily/interval/delay rows; identity, revision, timing, order, scope, and typed extra metadata; max 1,000. |

All ordinary string-array controls use the shared list contract where meaningful:

- Terms: Smart Compactor pins; Pattern exemptions/protected literals; Repair categories/protected literals; Text Rules and Transpose protected literals; Item Mention aliases; Recall keywords/event types/partner IDs/tags/record IDs; mode-specific Introspection pins.
- Column/field names: Format columns; Read File columns; Write File fields/columns; Project Document fields/columns.
- Paths: Condition path; Confidence Gate metric path; Collection collection/field/identity paths. Use segment controls, with explicit list import rather than default comma splitting.
- Identifiers: Time Trigger and Advance Time consumed IDs. List grammar preserves string identity.
- Filter Text protected literals, introduced by the Pattern stream.

Add a catalog coverage test: every exposed structured/list control resolves to an explicit contract, including dynamic State durations and Condition values. New controls must declare a contract rather than accidentally defaulting to JSON.

## Structured-control decisions

Schema builder supports exactly the engine subset: `type`, `enum`, `const`, `properties`, `required`, `additionalProperties`, `items`, `minItems`, `maxItems`, `minLength`, `maxLength`, `minimum`, `maximum`, `title`, `description`, `$schema`. Types are null/boolean/object/array/number/integer/string. Preserve depth <=16 and <=1,000 schema nodes; unsupported keywords are errors, not removed. Enum/const values use the typed value editor.

Value trees distinguish string, number, boolean, null, object, and array; typed object keys can include dots/commas/own names such as `__proto__` without prototype mutation. Numeric values must be finite. Preserve the generic JSON contract: <=10,000 traversed values, depth <=32, and <=262,144 encoded UTF-8 bytes.

Condition's comparison descriptor uses a `json-value` control type so null and structured/scalar values remain selectable in the same editor. This changes descriptor presentation, not comparison semantics or runtime JSON admission.

Decision cards compile to the existing questions map. Yes/no maps to runtime type `noul`; choices require 2–255 keys, scores require 2–10 ordered levels, and a batch contains 1–32 questions. Display novice-friendly labels; runtime names need not appear in the normal form.

Schedule rows use the existing runtime schema: `scheduleId`, `revision`, `kind`, optional `clockId`/`calendarId`, `order`, and timing (`minuteOfDay`, `anchorMinute`/`intervalMinutes`, or `dueMinute`). Use quantity + unit controls for intervals; minutes/hours/days convert to safe integer minutes using the authored calendar for days. Do not guess clocks/calendars or introduce a free-prose schedule interpreter.

When an authored day length is unavailable, days show an actionable configuration error; minutes/hours remain available. Bulk table import also accepts an explicitly selected TSV delimiter; automatic term entry does not split literal tabs.

## Acceptance

Both creation and editing accept `though`, CSV terms, and valid JSON without exposing wrapper requirements. Parsed results are visible; numbers remain strings for terms and numbers for numeric lists. Quoted commas/newlines, stable IDs, optional fields, advanced metadata, invalid drafts, and changed-port validation round-trip correctly. All covered controls have a friendly route or explicit typed selector, with Advanced JSON available. Saves use zero model calls and do not run flows. Documentation, generated examples, and fixtures use the new Pattern contract.

Deferred: natural-language Draft settings, arbitrary CSV spreadsheets for every schema, and any relaxation of runtime/provider JSON parsing.
