/** Prepared plain display contracts. These panels never resolve graphs, bindings or authority. */
export interface DetailNodeAddress { workflowId: string; instancePath: string[]; nodeId: string; }
export interface DetailArtifactAddress extends DetailNodeAddress { portId: string; }
export type DetailTarget = DetailArtifactAddress | { kind: 'terminal'; address: DetailNodeAddress };
export interface DetailLibraryNode { kind: 'library'; definitionRef: { id: string; version: number; semanticHash: string }; nodeId: string; }
export interface DetailSelection { selectionKey: string; revision: string; address: DetailNodeAddress | DetailLibraryNode; }
export interface DetailError { code: string; message: string; }
export type DetailEditResult = { ok: true } | { ok: false; error: DetailError };
export type DetailEditResponse = DetailEditResult | Promise<DetailEditResult>;
interface DetailControlBase {
    key: string; label: string; value: unknown;
    options?: { value: string; label: string }[]; min?: number; max?: number;
    effective?: string; source?: string; help?: string; exposureNote?: string;
}
export type DetailControl = DetailControlBase & (
    /** JSON-text returns the original text; json-value returns JSON.parse(text). */
    | { editor: 'json'; representation: 'json-text' | 'json-value'; allowEmpty?: boolean }
    | { editor: 'text' | 'number' | 'boolean' | 'enum' | 'lines'; representation?: never; allowEmpty?: never }
);
export type DetailBindingMode = 'inherit' | 'override' | 'block';
export interface DetailBindingField {
    mode: DetailBindingMode; allowedModes: { value: DetailBindingMode; label: string }[];
    value: string | null; options?: { value: string; label: string }[];
}
export interface DetailModelBinding {
    role: string; roleEditable: boolean; profile: DetailBindingField; model: DetailBindingField;
    effective: string; source: string; issue?: string;
}
export interface NodeDetailsView extends DetailSelection {
    title: string; canonicalTitle: string; iconPath: string; family: string; phase: string;
    alias: string; compact: boolean; enabled: boolean; readOnly: boolean; canPresent: boolean;
    controls: DetailControl[]; model: DetailModelBinding | null;
    ports: { id: string; label: string; direction: 'input' | 'output'; kind: string }[];
    status?: string; issues?: string[];
}
export interface NodeDetailsActions {
    present?: (selection: DetailSelection, field: 'alias' | 'compact', value: string | boolean) => DetailEditResponse;
    editControl?: (selection: DetailSelection, key: string, value: unknown) => DetailEditResponse;
    editField?: (selection: DetailSelection, key: 'enabled' | 'modelRole', value: boolean | string) => DetailEditResponse;
    editBinding?: (selection: DetailSelection, field: 'profileId' | 'model', mode: DetailBindingMode, value: string | null) => DetailEditResponse;
    duplicate?: (selection: DetailSelection) => void; remove?: (selection: DetailSelection) => void;
}
export interface PreviewSection {
    id: string; label: string; kind: string; text: string;
    format: 'structured-text' | 'json-prefix-text' | 'omitted'; truncated: boolean;
}
export interface PreviewChoice { key: string; label: string; kind: string; target: DetailTarget; }
export interface DetailHandleReviewSelector { handleId: string; runId: string; terminal: { kind: 'terminal'; address: DetailNodeAddress }; }
export type DetailReviewSelector = DetailHandleReviewSelector;
export interface OutputPreviewView {
    sourceKey: string; title: string; status: 'not-run' | 'current' | 'stale' | 'removed'; statusDetail?: string;
    choices: PreviewChoice[]; selectedKey: string | null; pinned: boolean; followSelection: boolean;
    sections: PreviewSection[]; issues: string[]; busy: boolean;
    runHere: { enabled: boolean; callBound: number; issue?: string } | null;
    review: { selector: DetailReviewSelector; canApply: boolean; fresh: boolean; selectedRootTerminal: boolean; mode: 'root' | 'target'; issue?: string } | null;
}
export interface OutputPreviewActions {
    select?: (sourceKey: string, choiceKey: string, target: DetailTarget) => void;
    pin?: (sourceKey: string, target: DetailTarget) => void; follow?: () => void;
    runHere?: (sourceKey: string, target: DetailTarget) => void;
    apply?: (selector: DetailReviewSelector) => void; reject?: (selector: DetailReviewSelector) => void;
}
export interface DetailRunUsage { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null; cost: string | null; }
export interface DetailRunRow {
    key: string; address: DetailNodeAddress; title: string; kind: 'instance' | 'primitive'; depth: number;
    status: string; subphase?: string | null; durationMs: number | null;
    attempts: number; callBound: number; usage: DetailRunUsage | null; issue?: string;
}
export interface RunDetailsView {
    runId: string; status: string; elapsedMs: number | null; actualCalls: number; callBound: number;
    completedCount: number; executableCount: number; rows: DetailRunRow[]; issue?: string;
}
export interface RunDetailsActions { jump?: (runId: string, address: DetailNodeAddress) => void; }
