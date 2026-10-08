export interface TokenChip { text: string; title: string; className: string }
export interface CardRow { id: string; name: string; text: string; chosen: boolean; fallback?: boolean }
export interface Notice { className: string; icon: string; text: string; title?: string }
export interface Port { id: string; className: string; dir: string; side?: string; port?: string; left?: number; title: string; label?: string; icon?: string }
export interface NodeCardData {
    id: string; x: number; y: number; w: number; type: string; className: string; hint?: string;
    title: string; titleHint: string; label: string; icon: string; token?: TokenChip | null; offHint?: string;
    enabled: boolean; toggle: boolean; help: boolean; body: string | null; rows: CardRow[]; rowClass: string; mode?: { text: string; className: string };
    model?: { where: string; actual: string; title: string; pick: boolean } | null; notices: Notice[]; ports: Port[];
}
export interface GroupCardData {
    id: string; collapsed: boolean; x: number; y: number; w: number; h?: number; className: string;
    title: string; enabled: boolean; body: string; io: string; count: string; token?: TokenChip | null;
}
export interface WireData {
    id: string; d: string; className: string; arrow: boolean;
    label: { x: number; y: number; text: string; className: string; anchor?: string; id?: string; title?: string };
}
export interface CanvasActions {
    hover: (id: string | null) => void; toggle: (id: string) => void; help: (id: string) => void;
    model: (id: string, anchor: HTMLElement) => void; group: (id: string, action: string) => void;
}
export interface PositionUpdate { id: string; x: number; y: number; w?: number; h?: number }
export interface HistoryView { undo: boolean; redo: boolean; undoTitle: string; redoTitle: string; note: string; showNote: boolean }
export interface StatusView { armed: boolean; warning: boolean; text: string; overrideTitle: string; chatPinned: boolean; charPinned: boolean; charTitle: string; isDefault: boolean }
export interface WorkbenchView {
    graphs: { id: string; name: string }[]; graphId: string; nativeGraph?: boolean; armed: boolean; sideOpen: boolean; inspectorOpen: boolean;
    history: HistoryView; status: StatusView; camera: { x: number; y: number; zoom: number; mode: string }; selectionCount: number;
    workflow?: WorkflowView;
}
export interface WorkbenchActions {
    logoUrl?: string;
    pickGraph: (id: string) => void; arm: (enabled: boolean) => void; command: (name: string) => void;
    mode: (mode: string) => void; zoom: (factor: number) => void; fitSelection: () => void;
    unpin: () => void; pinChat: () => void; pinCharacter: () => void; makeDefault: () => void; preview: () => void;
    resizeStart?: () => void; addNode?: (id: string, legacy: boolean) => void;
    workflowSetup?: Pick<WorkflowActions, 'install' | 'setMode' | 'bindRole' | 'assign'>;
}


export interface WorkflowControl { key: string; label: string; value: string | number | boolean; kind: string; options: string[] | null }
export interface WorkflowNodeView { id: string; title: string; operation: string; family: string; phase: string; input: string; output: string; terminal: boolean; modelRole: string | null; profileId: string; model: string; effective: string; enabled: boolean; controls: WorkflowControl[] }
export interface WorkflowView {
    graphId: string; name: string; native: boolean; phase: string; workflowMode: string; assigned: boolean; selectedId: string | null;
    roles: { name: string; profileId: string; model: string }[]; profiles: { id: string; name: string }[];
    starters: { id: string; title: string; purpose: string; phase: string; roles: string[]; callBound: number }[];
    families: { name: string; description: string; legacy: { id: string; title: string }[]; operations: { id: string; title: string; phase: string; compatible: boolean }[] }[];
    nodes: WorkflowNodeView[]; groups: { id: string; title: string; members: string[]; collapsed: boolean; callBound: number }[];
    callBound: number; issues: string[]; busy: boolean; status: string; quoteHelp: string;
    result: { ok: boolean; error: string; actualCalls: number; callBound: number; guidance: string; original: string; candidate: string; findings: unknown[]; changes: unknown[]; reports: unknown[]; calls: unknown[]; tokenMethods: string[]; applyAvailable: boolean; applyIssue: string } | null;
}
export interface WorkflowActions {
    install: (id: string) => void; setMode: (mode: string) => void; bindRole: (name: string, profileId: string, model: string) => void; assign: (phase: string) => void;
    run: () => void; apply: () => void; reject: () => void; inspect: (id: string) => void; expand: (id: string) => void;
    duplicate: (id: string) => void; remove: (id: string) => void;
    editRules: (id: string, text: string) => string | null;
    updateNode: (id: string, key: string, value: unknown) => void; addNode: (operation: string) => void; addLegacyNode: (type: string) => void;
}
