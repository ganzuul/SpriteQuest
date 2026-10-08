export interface ComposeSection {
  /** ASCII identifier: [A-Za-z_][A-Za-z0-9_]*, unique within sections. */
  name: string;
  text: string;
}
export interface ComposeSettings {
  template?: string;
  sections?: readonly ComposeSection[];
  /** Validated and cloned by the shared bounded JSON helper. */
  data?: unknown;
  separator?: string;
}
export type ComposeResult =
  | { ok: true; data: { text: string; report: Record<string, unknown>[] } }
  | { ok: false; error: { code: string; message: string; [key: string]: unknown } };
/** Pure, single-pass interpolation; limits are inclusive. No partial text on failure. */
export function composeText(settings?: ComposeSettings): ComposeResult;
