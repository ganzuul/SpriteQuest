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
    graphs: { id: string; name: string }[]; graphId: string; armed: boolean; sideOpen: boolean; inspectorOpen: boolean;
    history: HistoryView; status: StatusView; camera: { x: number; y: number; zoom: number; mode: string }; selectionCount: number;
}
export interface WorkbenchActions {
    pickGraph: (id: string) => void; arm: (enabled: boolean) => void; command: (name: string) => void;
    mode: (mode: string) => void; zoom: (factor: number) => void; fitSelection: () => void;
    unpin: () => void; pinChat: () => void; pinCharacter: () => void; makeDefault: () => void; preview: () => void;
}
