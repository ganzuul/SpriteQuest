import type { Result } from './types';
export type ModifierType = 'trim' | 'whitespace' | 'wrap' | 'replace' | 'unwrap-fence';
interface ModifierEntry<T extends ModifierType, S> { id: string; type: T; version: 1; enabled: boolean; settings: S; }
/** Ordered pure text transforms; max 16, unique IDs /^[A-Za-z0-9_-]{1,64}$/. Disabled entries validate fully. */
export type NodeModifier =
    | ModifierEntry<'trim', { edges: 'both' | 'start' | 'end' }>
    | ModifierEntry<'whitespace', { lineEndings: 'preserve' | 'lf' | 'crlf'; trailingSpaces: boolean; blankLines: 'preserve' | 'collapse' | 'remove' }>
    | ModifierEntry<'wrap', { prefix: string; suffix: string }>
    | ModifierEntry<'replace', { pattern: string; replacement: string; caseSensitive: boolean; occurrence: 'first' | 'all' }>
    | ModifierEntry<'unwrap-fence', Record<string, never>>;
export type ModifierField = { readonly key: string; readonly label: string } & (
    | { readonly type: 'enum'; readonly options: readonly string[] }
    | { readonly type: 'string'; readonly min: number; readonly max: number }
    | { readonly type: 'boolean' });
export interface ModifierTypeDescriptor { readonly type: ModifierType; readonly label: string; readonly version: 1; readonly defaultSettings: Readonly<Record<string, string | boolean>>; readonly fields: readonly ModifierField[]; }
export const modifierTypes: Readonly<Record<ModifierType, ModifierTypeDescriptor>>;
export interface ModifierTrace { readonly id: string; readonly type: ModifierType; readonly version: 1; readonly settings: Readonly<Record<string, string | boolean>>; readonly beforeLength: number; readonly afterLength: number; readonly changed: boolean; }
export interface TextModifierMetadata { readonly rawText: string; readonly trace: readonly ModifierTrace[]; }
export interface ModifiedText extends TextModifierMetadata { readonly text: string; }
/** Only primitive workflow nodes with exactly one Text output admit nonempty modifier arrays. */
export function validateNodeModifiers(node: unknown, outputPorts: readonly { kind: string; direction?: string }[]): Result<{ readonly modifiers: readonly NodeModifier[] }>;
/** Sources/intermediates <=100000 UTF-16 units; literal settings <=4096 units; pattern nonempty. Detached frozen result. */
export function applyTextModifiers(text: unknown, modifiers?: unknown): Result<ModifiedText>;
/** Invalid lists yield empty summary; admission still rejects them. */
export function modifierSummary(modifiers?: unknown): { readonly count: number; readonly labels: readonly string[]; readonly text: string };
