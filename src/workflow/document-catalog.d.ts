import type { Result } from './types';
import type { StorageScope } from './file-store';
import type { DocumentSnapshot } from './operations/document-mutations';
export type DocumentVisibility={kind:'public'}|{kind:'hidden'}|{kind:'actor-private';actorId:string};
export interface StoryDocumentDefinition { targetId:string;name:string;format:DocumentSnapshot['format'];content:string;visibility:DocumentVisibility;columns?:string[]; }
export interface SavedStoryDocumentDefinition extends StoryDocumentDefinition { revision:string; }
export interface DocumentCatalogSnapshot { scope:Pick<StorageScope,'userId'|'chatId'>;documents:Omit<SavedStoryDocumentDefinition,'content'>[]; }
export interface DocumentCatalogLease { scope:Pick<StorageScope,'userId'|'chatId'>;documents:SavedStoryDocumentDefinition[];isCurrent:()=>boolean; }
export interface ChatDocumentCatalog {
    snapshot():Result<DocumentCatalogSnapshot>;
    definition(targetId:string):Result<SavedStoryDocumentDefinition>;
    define(value:StoryDocumentDefinition|unknown):Result<DocumentCatalogSnapshot>;
    remove(targetId:string):Result<DocumentCatalogSnapshot>;
    /** Exact catalog-local captured authority; copied or foreign leases grant no mutation authority. */
    defineCaptured(lease:DocumentCatalogLease,value:StoryDocumentDefinition|unknown):Result<DocumentCatalogSnapshot>;
    removeCaptured(lease:DocumentCatalogLease,targetId:string):Result<DocumentCatalogSnapshot>;
    capture():Result<DocumentCatalogLease>;
    save():Promise<Result<{appliedLocally:true;saveAttempted:true;acknowledged:boolean}>>;
    revision():string;
}
export function createChatDocumentCatalog(ports:{getContext:()=>{chatId?:string;getCurrentChatId?:()=>string;chat:unknown[];chatMetadata:Record<string,unknown>};getUserId:()=>string;saveMetadata?:()=>unknown|Promise<unknown>}):ChatDocumentCatalog;
