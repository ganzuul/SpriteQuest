import type { JsonValue, Result, OperationError } from './operations/json-data';
import type { DocumentSnapshot, DocumentRevision, DocumentMutationSettings, PreparedDocumentMutation, ProjectedDocument } from './operations/document-mutations';
export interface StorageScope { userId:string; chatId:string; actorId?:string; }
export type AuthorityCheck={ok:true;data?:undefined}|{ok:false;error:OperationError};
declare const referenceAuthority:unique symbol;
declare const intentAuthority:unique symbol;
/** Object identity is private authority. A JSON copy is only descriptive data. */
export interface FileReference { readonly [referenceAuthority]:true; readonly kind:'file-reference'; readonly backend:'host-store'; readonly scope:StorageScope; readonly targetId:string; readonly revision:DocumentRevision; }
export interface FileIntentHandle { readonly [intentAuthority]:true; readonly intentId:string; }
export interface StoredFileReceipt { intentId:string; fingerprint:string; revision:DocumentRevision; }
export interface StoredDocument extends DocumentSnapshot { receipts:StoredFileReceipt[]; }
export interface FileSettlementReceipt { intentId:string; targetId:string; status:'ready'|'confirmed'|'save-unverified'|'unknown'|'unchanged'; applied:boolean|null; acknowledged:boolean; revision?:DocumentRevision; }
export interface FileCasUpdate { targetId:string; expectedRevision:DocumentRevision; expectedContent:string; projectedDocument:ProjectedDocument; intentId:string; fingerprint:string; }
export interface FileBackendPorts {
    load:(targetId:string)=>Promise<Result<StoredDocument>>;
    compareAndSwap:(update:FileCasUpdate,controls:{signal?:AbortSignal})=>Promise<Result<{applied:true;acknowledged:boolean;revision:DocumentRevision}>>;
}
export interface FileStoreConfiguration extends FileBackendPorts {
    scope:StorageScope; authorizedTargets:string[]; signal?:AbortSignal;
    validateEvidence:(evidence:JsonValue[])=>Promise<AuthorityCheck>;
    isCurrent:()=>boolean;
}
export interface PreparedFileIntent { handle:FileIntentHandle; plan:PreparedDocumentMutation; status:'staged'; }
export interface FileStore {
    read(targetId:string):Promise<Result<{snapshot:DocumentSnapshot;fileRef:FileReference}>>;
    prepare(fileRef:FileReference|unknown,settings:DocumentMutationSettings,options:{intentId:string;evidence:JsonValue[]}):Promise<Result<PreparedFileIntent>>;
    preflight(handle:FileIntentHandle|unknown):Promise<Result<FileSettlementReceipt>>;
    commit(handle:FileIntentHandle|unknown,controls?:{root?:boolean;accepted?:boolean;preview?:boolean;dryRun?:boolean}):Promise<Result<FileSettlementReceipt>>;
    release():void;
}
/** Captured targets and host ports are never installed from portable graph settings. */
export function createFileStore(config:FileStoreConfiguration):FileStore;
export interface ChatDocumentContext { chat:unknown[];chatId:string;userId:string;chatMetadata:Record<string,unknown>; }
export interface ChatDocumentBackendConfiguration {
    scope:StorageScope;
    getContext:()=>ChatDocumentContext;
    saveMetadata:()=>Promise<unknown>;
    initialDocuments?:Pick<DocumentSnapshot,'targetId'|'format'|'content'>[];
}
/** Atomic local replacement is distinct from durable host save acknowledgement. */
export function createChatDocumentBackend(config:ChatDocumentBackendConfiguration):FileBackendPorts;