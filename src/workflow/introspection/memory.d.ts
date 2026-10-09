import type { ActorState, Data, IntrospectionRecord, Item, OperationResult, Result, Scope, SettledEvent, SourceRef, StateProposal } from './contracts.js';

export interface Receipt { key:string; fingerprint:string; version:number }
export interface MemorySnapshot { state:Data<ActorState>; receipts:Receipt[] }
export interface CompareAndSwapInput { expectedVersion:number; state:Data<ActorState>; receipt:Receipt }
export interface MemoryCASControls { signal?:AbortSignal; sourceRefs?:SourceRef[] }
export interface MemoryBackend {
    scope:Scope;
    storeId:string;
    load:()=>Promise<Result<MemorySnapshot>>;
    readEvents:()=>Promise<Result<Data<{events:SettledEvent[]}>>>;
    validateSources:(refs:SourceRef[])=>Promise<Result<void>>;
    /** Adapters with prewrite awaits must recheck evidence and signal before mutation. */
    compareAndSwap:(input:CompareAndSwapInput,controls?:MemoryCASControls)=>Promise<Result<{acknowledged:boolean}>>;
}
export interface CommitControls { signal?:AbortSignal; preview?:boolean; dryRun?:boolean; root?:boolean }
export interface CommitResult { applied:boolean; acknowledged:boolean; state:Data<ActorState>; version:number }
export interface CommitIntent { proposal:IntrospectionRecord<StateProposal>; idempotencyKey:string }
export interface MemoryService {
    read(settings?:{view?:'state'}):Promise<OperationResult<Data<ActorState>>>;
    /** Event evidence keeps its identities/revisions; its envelope uses the loaded state version. */
    read(settings:{view:'events'}):Promise<OperationResult<Data<{events:SettledEvent[]}>>>;
    read(settings:{view:'episodes'}):Promise<OperationResult<Data<{episodes:Item[]}>>>;
    read(settings:{view:'state'|'events'|'episodes'}):Promise<OperationResult<Data<ActorState|{events:SettledEvent[]}|{episodes:Item[]}>>>;
    recall(settings:{query:string;limit?:number}):Promise<OperationResult<Data<{episodes:Item[]}>>>;
    commit(intent:Data<CommitIntent>|unknown,controls?:CommitControls):Promise<Result<CommitResult>>;
}
/** Invalid options yield Result failures on use; construction has no host effects. */
export function createMemoryService(options:MemoryBackend):MemoryService;
/** Events are detached at construction, or supplied fresh by the callback. */
export function createInMemoryBackend(initialState:Data<ActorState>,events:Data<{events:SettledEvent[]}>|(()=>Data<{events:SettledEvent[]}>|Promise<Data<{events:SettledEvent[]}> >)):MemoryBackend;
export interface ChatMetadataContext { chatId:string; chatMetadata:Record<string,unknown> }
export interface ChatMetadataOptions {
    scope:Scope;
    storeId:string;
    initialState?:Data<ActorState>;
    getContext:()=>ChatMetadataContext|Promise<ChatMetadataContext>;
    /** Only true acknowledges persistence; false, undefined or a thrown save is unknown. */
    saveMetadata:(context:ChatMetadataContext)=>boolean|void|Promise<boolean|void>;
    readEvents:MemoryBackend['readEvents'];
    validateSources:MemoryBackend['validateSources'];
}
export function createChatMetadataBackend(options:ChatMetadataOptions):MemoryBackend;
