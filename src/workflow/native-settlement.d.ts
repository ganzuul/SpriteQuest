import type { Result, NodeAddress } from './types';
import type { DraftArtifact } from './draft-revisions';
import type { StorageScope, FileStore } from './file-store';
import type { ChatDocumentCatalog, DocumentVisibility } from './document-catalog';
import type { NativePersistenceVerifier } from './native-persistence';
import type { StagedEffect, StagedEffects } from './staged-effects';
export interface NativeSettlement {
    stage(effect:StagedEffect):ReturnType<StagedEffects['stage']>;
    /** Serialized attempts may correct failed prepublication Drafts; persistence recovery keeps the exact published Draft. */
    accept(draft:DraftArtifact):ReturnType<StagedEffects['settle']>;
    reject():ReturnType<StagedEffects['reject']>;
    release():void;
    inspect():Result<{published:boolean;rejected:boolean;effects:{intentId:string;targetId:string;receipt:unknown}[]}>;
}
export function createAcceptedNativeSettlement(config:{scope:StorageScope;originalDraft:DraftArtifact;signal?:AbortSignal;isCurrent:()=>boolean;validateFinal:(evidence:{body:string;originalBody:string;effects:{intentId:string;targetId:string;proposed:unknown}[]})=>Result<void>|Promise<Result<void>>;publish:(draft:DraftArtifact)=>Result<{appliedLocally:true;[key:string]:unknown}>|Promise<Result<{appliedLocally:true;[key:string]:unknown}>>;release?:()=>void}):NativeSettlement;
export function validateNativeFileEvidence(raw:unknown,body:string,originalBody?:string,options?:{draftEvidence?:import('./native-draft-evidence').NativeDraftEvidenceRegistry;finalDraft?:DraftArtifact}):Result<void>;
export interface NativeFileSession {
    store:FileStore;
    visibility(targetId:string):Result<DocumentVisibility>;
    intentId(node:{id:string},evidence:unknown[],address?:NodeAddress):Promise<Result<string>>;
    stage(prepared:{handle:Parameters<FileStore['preflight']>[0];plan:{targetId:string}},evidence:unknown[]):ReturnType<NativeSettlement['stage']>;
    release():void;
}
export function createNativeFileSession(config:{catalog:ChatDocumentCatalog;scope:StorageScope;context:()=>{chat:unknown[];chatId?:string;getCurrentChatId?:()=>string;chatMetadata:Record<string,unknown>};userId:()=>string;persistenceVerifier:NativePersistenceVerifier;signal?:AbortSignal;isCurrent:()=>boolean;barriers?:Map<string,{intentId:string;revision:number}>;workflowId:string;originalDraft?:DraftArtifact;getOriginalDraft?:()=>DraftArtifact;validateEvidence:(evidence:unknown[])=>Result<void>|Promise<Result<void>>;stage:NativeSettlement['stage']}):Result<NativeFileSession>;
