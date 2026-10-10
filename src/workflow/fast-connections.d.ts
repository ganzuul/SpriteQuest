import type { Result } from './types';
import type { DecisionQuestions, DecisionState, FastResponse } from './decision';
export interface FastConnectionConfiguration { id: string; revision: string | number; provider: 'jev' | 'laya' | 'compatible'; model: string; endpoint?: string; credentialRef?: string; }
/** A public selector DTO. Only the exact private-captured object is request authority. */
export interface FastBinding { readonly capability: 'typed-decision'; readonly connectionId: string; readonly provider: 'jev' | 'laya' | 'compatible'; readonly model: string; readonly revision: string | number; readonly fingerprint: string; }
export interface FastHttpResponse { ok: boolean; status: number; body?: ReadableStream<Uint8Array> | null; text?: () => Promise<string>; }
export interface FastConnectionHost {
    /** Synchronous nonreused epoch covering all configuration AND resolved-credential mutations. */
    getRegistryRevision: () => string | number;
    getConnection: (id: string) => unknown | Promise<unknown>;
    resolveSecret?: (reference: string) => string | null | undefined | Promise<string | null | undefined>;
    fetch?: (url: string, options: { method: 'POST'; headers: Record<string,string>; body: string; redirect: 'error'; credentials: 'omit'; cache: 'no-store'; signal?: AbortSignal }) => Promise<FastHttpResponse>;
}
export interface FastRequestResponse { response: FastResponse; usage: FastResponse['usage']; provenance: FastBinding & { returnedModel: string }; }
export function captureFastBinding(id: string, host: FastConnectionHost): Promise<Result<FastBinding>>;
export function fastBindingStatus(binding: FastBinding | unknown, host: FastConnectionHost): Promise<{ ok: true } | { ok: false; error: { code: string; message: string } }>;
export function fastBindingSummary(binding: FastBinding | unknown): FastBinding | undefined;
export function requestFastDecision(binding: FastBinding | unknown, value: { state: DecisionState; questions: DecisionQuestions; signal?: AbortSignal }, host: FastConnectionHost): Promise<Result<FastRequestResponse>>;
