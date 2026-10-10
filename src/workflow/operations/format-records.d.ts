import type { JsonValue, Result, SchemaFinding } from './json-data.js';
import type { JsonSchema } from './json-decode.js';
import type { FieldSelection } from './select-fields.js';

export type RecordFormat = 'json' | 'jsonl' | 'csv' | 'text' | 'markdown';
export type FormattedRecord = { [key: string]: JsonValue };
export interface RecordMappingSettings {
    /** Omit to preserve supplied fields. Missing optional mappings omit; explicit defaults alone add values. */
    fields?: FieldSelection[];
    /** Schema of each resulting record. CSV checks canonical string cells after scalar rendering. */
    schema?: JsonSchema;
}
export type FormatRecordsSettings = RecordMappingSettings & (
    | { format: 'json'; jsonShape?: 'records' | 'single' }
    | { format: 'jsonl' }
    | { format: 'csv'; columns: string[] }
    | { format: 'text' | 'markdown'; separator: string; trailingSeparator: boolean }
);
export type RecordSerialization =
    | { format: 'json'; jsonShape?: 'records' | 'single' }
    | { format: 'jsonl' }
    | { format: 'csv'; columns: string[] }
    | { format: 'text' | 'markdown'; separator: string; trailingSeparator: boolean };
export interface FormattedRecords {
    /** CSV explicitly returns string cells: finite numbers/booleans stringify and null becomes ''. */
    records: FormattedRecord[];
    text: string;
    serialization: RecordSerialization;
    report: SchemaFinding[];
}
/** Accept one structured object or an array of them. Never extract fields from prose.
 * JSON emits an array by default; explicit single shape requires exactly one record and emits that object; JSONL emits one record per LF-terminated line.
 * CSV emits an exact scalar-column schema with a header, CRLF rows and standard quote escaping.
 * Text/Markdown accept only {text:string} records and explicit separator controls.
 * JSON serializations must pass the existing raw reader and bounded plain text admission.
 * CSV converts scalar cells to strings before schema validation; it does not preserve scalar types.
 * Inputs and outputs are bounded plain JSON; failures contain no partial data.
 */
export function formatRecords(value: unknown, settings: FormatRecordsSettings): Result<FormattedRecords>;
