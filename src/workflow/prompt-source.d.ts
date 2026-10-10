export interface PromptSourceSettings {
    source?: 'system' | 'prompt-entry';
    /** Stable host identifier, default main; up to 256 UTF-16 units. */
    promptId?: string;
    form?: 'raw' | 'resolved';
}
export interface PromptSourceMetadata {
    source: 'system' | 'prompt-entry';
    block: 'sysprompt' | 'prompt-entry' | 'character-system' | 'chat-system';
    form: 'raw' | 'resolved';
    /** Null means an explicit entry's active order is not publicly exposed. */
    enabled: boolean | null;
    mainApi: 'openai' | 'kobold' | 'koboldhorde' | 'novel' | 'textgenerationwebui';
    override: 'none' | 'character' | 'chat';
    promptId?: string;
    orderScope?: 'global' | 'character' | 'group' | 'unavailable';
}
export interface PromptSourceArtifact {
    kind: 'text';
    text: string;
    source: PromptSourceMetadata;
}
export type PromptSourceFailure = { ok: false; error: { code: string; message: string } };
export type PromptSourceSnapshot =
    | { ok: true; artifact: PromptSourceArtifact; fingerprint: string }
    | PromptSourceFailure;
/**
 * Read one configured public host block. Text and expanded originals are bounded
 * at 100,000 UTF-16 units; markers and stateful/custom macros fail visibly.
 * Success fingerprint is private freshness material and must not enter graph,
 * recording, or artifact controls. Resolved form uses pure host macros only.
 */
export function snapshotPromptSource(context: unknown, node?: PromptSourceSettings): PromptSourceSnapshot;
/** Uses exactly the same selection and private fingerprint as snapshotPromptSource. */
export function promptSourceFingerprint(context: unknown, node?: PromptSourceSettings):
    { ok: true; data: string } | PromptSourceFailure;
