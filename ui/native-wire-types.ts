// Presentation DTOs only. No root documents, transactions or opaque capabilities reach popovers.
export type ScreenPoint = Readonly<{ x: number; y: number }>;
export type SearchPort = Readonly<{ portId: string; dir: 'in' | 'out'; kind: string; label?: string; required?: boolean }>;
export type SearchChoice = Readonly<{ id: string; label: string; family: string; phase: string; ports: readonly SearchPort[]; purpose?: string; shortcode?: string; searchAliases?: readonly string[]; disabledReason?: string }>;
export type NodeSearchView = Readonly<{
    key: string | number;
    mode: 'nodes' | 'ports';
    screenAnchor: ScreenPoint;
    origin: Readonly<{ dir: 'in' | 'out'; kind: string }> | null;
    contextSensitive: boolean;
    readOnly: boolean;
    choices: readonly SearchChoice[];
    ports: readonly SearchPort[];
    feedback?: string;
}>;
export type NodeSearchActions = {
    choose?: (choiceId: string) => void;
    choosePort?: (portId: string) => void;
    setContextSensitive?: (enabled: boolean) => void;
    dismiss?: () => void;
};
export type PinMenuEntry = Readonly<{ id: string; label: string; capability: 'edit' | 'navigation'; disabled?: boolean; reason?: string }>;
export type PinMenuView = Readonly<{ key: string | number; title: string; kind: string; screenAnchor: ScreenPoint; readOnly: boolean; entries: readonly PinMenuEntry[] }>;
export type PinMenuActions = { pick?: (entryId: string) => void; dismiss?: () => void };
