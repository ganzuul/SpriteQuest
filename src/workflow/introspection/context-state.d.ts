import type { ContextArtifact } from '../types';
import type { ActorState, Curve, Data, Failure, OperationResult, StateProposal } from './contracts';

export interface ContextSettings {
    mode?: 'assemble' | 'perspective' | 'focus';
    /** Assemble uses required named inputs in1..in16; default 2. */
    inputCount?: number;
    /** Perspective requires an actor and explicit visibleTo arrays on messages. */
    actorId?: string;
    /** Focus defaults to selection; compression makes at most one Analysis request. */
    method?: 'select' | 'compress';
    targetTokens?: number;
    maxTokens?: number;
    keepRecent?: number;
    pins?: string[];
    purpose?: string;
    id?: string;
    modelRole?: 'Analysis';
}
export interface ContextRequest {
    binding: unknown;
    messages: {role:'system'|'user'|'assistant';content:string}[];
    maxTokens: number;
    signal?: AbortSignal;
}
export interface ContextPorts {
    signal?: AbortSignal;
    binding?: unknown;
    countTokens?: (text:string) => Promise<{tokens:number;method:string}>;
    request?: (request:ContextRequest) => Promise<{ok:true;data:{text:string;finish?:string|null;usage?:unknown}}|Failure>;
}
export interface StateSettings {
    mode?: 'value' | 'curve' | 'track';
    actorId?: string;
    /** Omitted updates reads a detached actor-state; supplied updates create a proposal. */
    updates?: Record<string,number>;
    /** Value update limits default to 0..1. */
    min?: number;
    max?: number;
    curveId?: string;
    /** Positive integer 1..64, default 1. */
    steps?: number;
    /** Baseline approach per step, 0..1; default 0.25. */
    decay?: number;
    baseline?: number;
    /** Positive integer 1..64 per supplied phase; omitted phases last one step. */
    durations?: Partial<Record<Exclude<Curve['phase'],'baseline'>,number>>;
    trackId?: string;
}
/** Inputs are in1..inN for Assemble, or context for Focus/Perspective. No output artifact on failure. */
export function shapeContext(namedInputs:unknown,settings?:ContextSettings,ports?:ContextPorts):Promise<OperationResult<ContextArtifact>>;
/** Pure state read/proposal. Track requires matching scoped/versioned settled events. */
export function advanceState(stateData:unknown,settings?:StateSettings,eventsData?:unknown):OperationResult<Data<ActorState|StateProposal>>;
