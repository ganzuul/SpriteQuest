export type FastProvider = 'jev' | 'laya' | 'compatible';
export interface FastConnectionFields { id: string; label: string; provider: FastProvider; model: string; endpoint?: string; }
export interface FastSetupConnection extends FastConnectionFields { credentialReady: boolean; }
export interface FastConnectionsView { userId: string; connections: FastSetupConnection[]; issue: string; }
export type FastSettingsResult = { ok: true; data?: { message?: string } } | { ok: false; error: { code: string; message: string } };
export interface FastConnectionsActions {
    refresh?: () => void;
    save?: (configuration: FastConnectionFields, key: string, userId: string) => FastSettingsResult | Promise<FastSettingsResult>;
    remove?: (id: string, userId: string) => FastSettingsResult | Promise<FastSettingsResult>;
    clearCredential?: (id: string, userId: string) => FastSettingsResult | Promise<FastSettingsResult>;
}
