import type { Result } from './types';
import type { FastConnectionConfiguration, FastConnectionHost } from './fast-connections';
export interface FastConnectionInput { id: string; label?: string; provider: 'jev' | 'laya' | 'compatible'; model: string; endpoint?: string; }
export interface FastSavedConnection extends FastConnectionConfiguration { label: string; revision: string; }
export interface FastRegistryConfiguration { schema: 1; connections: Record<string, FastSavedConnection>; }
export interface FastRegistrySnapshot { userId: string; credentialStorage: 'session'; connections: (FastSavedConnection & { credentialReady: boolean })[]; }
export interface FastRegistry {
    readonly host: FastConnectionHost;
    snapshot(): Result<FastRegistrySnapshot>;
    upsert(value: FastConnectionInput | unknown): Result<FastRegistrySnapshot>;
    remove(id: string): Result<FastRegistrySnapshot>;
    setCredential(id: string, secret: string): Result<{ connectionId: string; credentialReady: true; credentialStorage: 'session' }>;
    clearCredential(id: string): Result<{ connectionId: string; credentialReady: false }>;
    save(): Promise<Result<{ appliedLocally: true; saveAttempted: true; acknowledged: boolean }>>;
    dispose(): void;
}
/** Secrets are private session capabilities; saved host configuration and public summaries never contain them. */
export function createFastRegistry(ports: {
    getUserId: () => string;
    getConfiguration: () => unknown;
    setConfiguration: (value: FastRegistryConfiguration) => void;
    save?: () => unknown | Promise<unknown>;
    fetch?: FastConnectionHost['fetch'];
}): FastRegistry;