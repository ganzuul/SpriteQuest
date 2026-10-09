import type { ActorState, Data, Item, OperationResult, Reflection, Result, Scope, SettledEvent, StateProposal, Store } from './contracts';
import type { ContextArtifact } from '../types';

export interface RequestMessage { role: 'system' | 'user' | 'assistant'; content: string }
export interface AnalysisRequest {
    messages: RequestMessage[];
    maxTokens: number;
    signal?: AbortSignal;
}
export interface ModelCompletion {
    text: string;
    /** A recognized successful finish reason is required at runtime. */
    finish?: string | null;
    usage?: unknown;
}
export interface AnalysisPorts {
    /** Inject the already resolved Analysis or Prose role; no provider resolution occurs here. */
    request?: (request: AnalysisRequest) => Promise<Result<ModelCompletion>>;
    signal?: AbortSignal;
    /** Reflect uses this snapshot's scope/store when supplied. */
    state?: Data<ActorState>;
    episodes?: Data<{ episodes: Item[] }>;
    /** Optional Express provenance; records must share the assessment's scope/store/version. */
    events?: Data<{ events: SettledEvent[] }>;
    context?: ContextArtifact;
    /** Required by Reflect when no state snapshot is supplied. */
    scope?: Scope;
    store?: Store;
}
export interface InferenceSettings {
    /** Default 2048; safe integer from 1 to 65536. */
    maxTokens?: number;
    /** At most 4096 characters. */
    instructions?: string;
}
export interface ReflectSettings extends InferenceSettings { mode?: 'character' | 'recall' | 'scene' }
export interface InternalizeSettings extends InferenceSettings { mode?: 'experience' | 'pattern' | 'recovery' }
export interface ExpressSettings extends InferenceSettings { mode?: 'behavior' | 'attention' | 'inner-voice' }
export interface Guidance { kind: 'guidance'; text: string }
export interface FictionalText { kind: 'text'; text: string; fictional: true }

/** One request, raw JSON only, bounded prompt/output and explicit revision provenance. Default character. */
export function reflect(context: unknown, settings?: ReflectSettings, ports?: AnalysisPorts): Promise<OperationResult<Data<Reflection>>>;
/** One request from nonempty settled events; returns a pure validated proposal. Default experience. */
export function internalize(priorState: unknown, events: unknown, settings?: InternalizeSettings, ports?: AnalysisPorts): Promise<OperationResult<Data<StateProposal>>>;
/** Behavior/Attention are deterministic; Inner Voice uses one Prose request. Default behavior. */
export function express(assessment: unknown, settings?: ExpressSettings, ports?: AnalysisPorts): Promise<OperationResult<Guidance | FictionalText>>;
