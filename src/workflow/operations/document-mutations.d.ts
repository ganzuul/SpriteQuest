import type { JsonValue, Result } from './json-data.js';
import type { JsonSchema } from './json-decode.js';
import type { FormattedRecord, RecordFormat } from './format-records.js';

export type DocumentRevision = string | number;
/** Revision is a nonblank string or nonnegative safe integer, preserved verbatim. */
export interface DocumentSnapshot {
    targetId: string;
    revision: DocumentRevision;
    format: RecordFormat;
    content: string;
}
export interface CollectionMutationSettings {
    records: FormattedRecord[];
    /** JSON Pointer. JSONL and CSV require the empty pointer, selecting the root collection. */
    collectionPath: string;
    /** Create may add only a missing final collection under existing parents. */
    missingPath: 'error' | 'create';
    /** Schema of each resulting JSON record; parsed CSV cells remain strings. */
    schema?: JsonSchema;
    /** Required for CSV, in the exact existing header order. */
    columns?: string[];
    key?: string;
    /** Controls may travel together; only the selected operation applies them. */
    fieldPolicy?: 'merge' | 'replace';
    fields?: string[];
}
export type DocumentMutationOperation = 'append-text' | 'add' | 'add-unique' | 'upsert' | 'update-fields' | 'replace';
export type DocumentMutationSettings =
    | { operation: 'append-text'; text: string; separator: string; emptyPolicy: 'omit' | 'include'; trailingSeparator: boolean }
    | (CollectionMutationSettings & { operation: 'add' })
    | (CollectionMutationSettings & { operation: 'add-unique'; key: string })
    | (CollectionMutationSettings & { operation: 'upsert'; key: string; fieldPolicy: 'merge' | 'replace' })
    | (CollectionMutationSettings & { operation: 'update-fields'; key: string; fields: string[] })
    | { operation: 'replace'; content: string; schema?: JsonSchema; columns?: string[] };
export interface ProjectedDocument {
    format: RecordFormat;
    content: string;
    /** Parsed projection for collection formats. CSV matches the final read string cells; text/Markdown omit this field. */
    value?: JsonValue;
}
export interface MutationReceipt {
    changed: boolean;
    added: number;
    updated: number;
    unchanged: number;
}
/** Complete proposed content, never a records payload to be appended again. */
export interface PreparedDocumentMutation {
    targetId: string;
    expectedRevision: DocumentRevision;
    operation: DocumentMutationOperation;
    projectedDocument: ProjectedDocument;
    receipt: MutationReceipt;
}
/** Pure preparation; never reads a backend, persists, increments revisions, or mutates inputs.
 * JSON supports collection operations and replacement. JSONL/CSV support literal add and replacement.
 * Text/Markdown support append-text and replacement. Unsupported combinations fail explicitly.
 * Identical add-unique identities are no-ops; differing contents conflict. Upsert merge is shallow.
 * Replace validates new content without parsing old content, allowing deliberate repairs.
 * Existing JSON/JSONL records are checked without rendering; unchanged bytes are preserved.
 * Final content must pass the existing snapshot and format reader admission before success.
 * CSV schemas check canonical serialized string cells; numeric/boolean/null schema promises fail.
 * Persistence consumes projectedDocument.content once under targetId/expectedRevision.
 */
export function prepareDocumentMutation(snapshot: DocumentSnapshot, settings: DocumentMutationSettings): Result<PreparedDocumentMutation>;
