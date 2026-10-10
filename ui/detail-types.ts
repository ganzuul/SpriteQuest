import type {RecallNodeStatus} from './recall-types';
import type { ManagerInterfaceEdit } from './manager-types';

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
    options?: { value: string; label: string }[]; min?: number; max?: number; step?: number | 'any';
    effective?: string; source?: string; help?: string; exposureNote?: string;
    group?: string; advanced?: boolean; singleLine?: boolean;
    structured?: 'rules' | 'fields' | 'sections' | 'slots' | 'numeric-map' | 'durations';
}
export type DetailControl = DetailControlBase & (
    /** JSON-text returns the original text; json-value returns JSON.parse(text). */
    | { editor: 'json'; representation: 'json-text' | 'json-value'; allowEmpty?: boolean }
    | { editor: 'text' | 'number' | 'boolean' | 'enum' | 'lines'; representation?: never; allowEmpty?: never }
);
export type DetailBindingMode = 'inherit' | 'override' | 'block';
export interface DetailModifier { id: string; type: string; version: 1; enabled: boolean; settings: Record<string, unknown>; }
export interface DetailModifierOption { type: string; label: string; defaultSettings: Record<string, unknown>; fields: DetailControl[]; }
export interface DetailBindingField {
    mode: DetailBindingMode; allowedModes: { value: DetailBindingMode; label: string }[];
    value: string | null; effectiveValue?: string | null; options?: { value: string; label: string }[];
}
export interface DetailModelBinding {
    role: string; roleEditable: boolean; profile: DetailBindingField; model: DetailBindingField;
    effective: string; source: string; issue?: string; profileDefaultModel?: boolean; editable?: boolean;
}
export interface DetailHelperBindings {
    helperKey:string; editable:boolean; issue?:string;
    roles:{role:string;label:string;profile:DetailBindingField;model:DetailBindingField;effective:string;source:string;caveat?:string}[];
}
export interface NodeDetailsView extends DetailSelection {
    recall?: RecallNodeStatus;
    title: string; canonicalTitle: string; iconPath: string; family: string; phase: string;
    operation?: string; familyColor?: string; phaseEditable?: boolean;
    alias: string; compact: boolean; enabled: boolean; readOnly: boolean; canPresent: boolean;
    controls: DetailControl[]; model: DetailModelBinding | null; helperBindings?: DetailHelperBindings | null;
    modifiers?: { items: DetailModifier[]; options: DetailModifierOption[]; editable: boolean; outputPortId: string } | null;
    fileInput?: { fileName: string; loaded: boolean };
    boundary?: { id: string; label: string; direction: 'input' | 'output'; kind: string; required: boolean; kinds: string[] };
    ports: { id: string; label: string; direction: 'input' | 'output'; kind: string }[];
    status?: string; issues?: string[];
}
export interface NodeDetailsActions {
    queueRecall?:(selection:DetailSelection)=>DetailEditResponse;
    cancelRecall?:(selection:DetailSelection)=>DetailEditResponse;
    revealRecallShortcut?:(nodeId:string)=>void;
    editPhase?: (selection: DetailSelection, phase: 'pre' | 'post') => DetailEditResponse;
    openFastConnections?: () => void;
    loadFile?: (selection: DetailSelection, file: File) => DetailEditResponse;
    present?: (selection: DetailSelection, field: 'alias' | 'compact', value: string | boolean) => DetailEditResponse;
    editControl?: (selection: DetailSelection, key: string, value: unknown) => DetailEditResponse;
    editModifiers?: (selection: DetailSelection, items: DetailModifier[]) => DetailEditResponse;
    editField?: (selection: DetailSelection, key: 'enabled' | 'modelRole', value: boolean | string) => DetailEditResponse;
    editHelperBinding?: (selection:DetailSelection,role:string,field:'profileId'|'model',mode:DetailBindingMode,value:string|null)=>DetailEditResponse;
    editBinding?: (selection: DetailSelection, field: 'profileId' | 'model', mode: DetailBindingMode, value: string | null) => DetailEditResponse;
    editInterface?: (selection: DetailSelection, edit: ManagerInterfaceEdit) => DetailEditResponse;
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
    settlement?: { status: 'settled' | 'partial' | 'save-unverified'; published: true; receipts: {intentId:string;targetId:string;status:string;error?:{code:string;message:string}}[] } | null;
    sourceKey: string; title: string; status: 'not-run' | 'current' | 'stale' | 'removed'; statusDetail?: string;
    choices: PreviewChoice[]; selectedKey: string | null; pinned: boolean; followSelection: boolean;
    sections: PreviewSection[]; issues: string[]; busy: boolean;
    runHere: { enabled: boolean; callBound: number; issue?: string } | null;
    review: { selector: DetailReviewSelector; canApply: boolean; persistOnly?: boolean; fresh: boolean; selectedRootTerminal: boolean; mode: 'root' | 'target'; issue?: string } | null;
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
