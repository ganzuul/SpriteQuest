import type { JsonValue, Result, OperationError } from './operations/json-data';
import type { StorageScope, AuthorityCheck } from './file-store';
export interface StagedEffectReceipt {
    intentId:string;targetId:string;status:'ready'|'confirmed'|'unchanged'|'save-unverified'|'unknown'|'failed';
    applied?:boolean|null;acknowledged?:boolean;error?:OperationError;
    [key:string]:unknown;
}
export interface StagedEffect {
    intentId:string;targetId:string;proposed:JsonValue;
    preflight:()=>Promise<Result<{status:'ready'|'confirmed'|'unchanged';[key:string]:unknown}>>;
    commit:(controls:{root:true;accepted:true})=>Promise<Result<{status:'confirmed'|'unchanged'|'save-unverified'|'unknown';[key:string]:unknown}>>;
}
export interface StagedEffectsConfiguration {
    scope:StorageScope;originalEvidence:JsonValue;signal?:AbortSignal;isCurrent:()=>boolean;
    validateFinal:(data:{scope:StorageScope;originalEvidence:JsonValue;finalEvidence:JsonValue;effects:Pick<StagedEffect,'intentId'|'targetId'|'proposed'>[]})=>Promise<AuthorityCheck>;
    publish:(finalEvidence:JsonValue)=>Promise<Result<{appliedLocally:true;[key:string]:unknown}>>;
}
export interface EffectSettlement { status:'settled'|'partial'|'save-unverified';published:true;publication:JsonValue;receipts:StagedEffectReceipt[]; }
export interface StagedEffects {
    stage(effect:StagedEffect):Result<{intentId:string;status:'staged'}>;
    settle(controls?:{root?:boolean;accepted?:boolean;preview?:boolean;dryRun?:boolean;finalEvidence?:JsonValue}):Promise<Result<EffectSettlement>>;
    reject():Result<{published:boolean;receipts:(StagedEffectReceipt|null)[];status:'rejected'|'rejected-after-publication'}>;
    inspect():Result<{published:boolean;rejected:boolean;effects:(Pick<StagedEffect,'intentId'|'targetId'|'proposed'>&{receipt:StagedEffectReceipt|null})[]}>;
}
/** Only trusted host callbacks are admitted. Public DTOs never grant settlement capability. */
export function createStagedEffects(config:StagedEffectsConfiguration):StagedEffects;