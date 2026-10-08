export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type JsonPath = (string | number)[];
export interface SchemaFinding { path: string; keyword: string; message: string }
export interface OperationError {
    code: string;
    message: string;
    name?: string;
    path?: JsonPath;
    findings?: SchemaFinding[];
}
export type Result<T> = { ok: true; data: T } | { ok: false; error: OperationError };
/** Clone bounded plain JSON. Root depth is zero; limit failures have no value. */
export function cloneJsonValue(value: unknown): Result<{ value: JsonValue }>;
/** Validate the value/path, traverse own data fields and return an isolated value. */
export function readJsonPath(value: unknown, path: unknown): Result<{ found: false } | { found: true; value: JsonValue }>;
