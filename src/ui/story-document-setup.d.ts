import type {Result} from '../workflow/types';
import type {ChatDocumentCatalog,DocumentCatalogSnapshot,SavedStoryDocumentDefinition,StoryDocumentDefinition} from '../workflow/document-catalog';
export interface StoryDocumentSetupView extends DocumentCatalogSnapshot {key:string;revision:string;issue:string}
export interface StoryDocumentSetup {
 snapshot():Result<StoryDocumentSetupView>;
 load(key:string,targetId:string):Result<{definition:SavedStoryDocumentDefinition}>;
 save(key:string,definition:StoryDocumentDefinition):Promise<Result<{acknowledged:boolean;message:string}>>;
 remove(key:string,targetId:string):Promise<Result<{acknowledged:boolean;message:string}>>;
 isCurrent(key:string):boolean;
}
/** Settings authorization only. This does not open or overwrite canonical document contents. */
export function createStoryDocumentSetup(catalog:ChatDocumentCatalog):StoryDocumentSetup;
/** Explicit schema 1 clock template, admitted by the actual story-time engine. */
export function createStoryClockTemplate(clockId:string,calendarId:string,absoluteMinute?:number):Result<{text:string}>;
