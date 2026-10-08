import type { JsonPath, JsonValue, Result, SchemaFinding } from './json-data.js';
export interface FieldSelection { name: string; path: JsonPath; required?: boolean; default?: JsonValue }
/** Missing required fields fail; optional fields omit unless an explicit default exists. */
export function selectFields(value: unknown, settings: { fields: FieldSelection[] }): Result<{ value: { [key: string]: JsonValue }; report: SchemaFinding[] }>;
