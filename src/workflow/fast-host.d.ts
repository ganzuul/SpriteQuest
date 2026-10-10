import type { Result } from './types';
import type { FastRegistry } from './fast-registry';
import type { FastBinding, FastRequestResponse } from './fast-connections';
import type { DecisionQuestions, DecisionState } from './decision';
export interface FastHostBridge {
    resolve(node: {fastConnectionId:string}): Promise<Result<FastBinding>>;
    preview(node: {fastConnectionId:string}): Result<{capability:'typed-decision';connectionId:string;provider:'jev'|'laya'|'compatible';model:string;revision:string|number}>;
    bindingStatus(binding:unknown,context?:unknown): Result<unknown>;
    summary(binding:unknown): FastBinding | undefined;
    request(binding:unknown,value:{state:DecisionState;questions:DecisionQuestions;signal?:AbortSignal}): Promise<Result<FastRequestResponse>>;
}
export function createFastHostBridge(registry:FastRegistry, ports?:{completionBindingStatus?:(binding:unknown,context?:unknown)=>Result<unknown>}): FastHostBridge;
