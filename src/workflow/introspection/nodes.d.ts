import type {Failure,OperationResult} from './contracts.js';
import type {MemoryService} from './memory.js';
export interface IntrospectionNode {type:'workflow';operation:'reflect'|'internalize'|'express'|'context'|'memory'|'state';operationVersion:1;id?:string;mode?:string;[control:string]:unknown}
export interface Descriptor {id:string;title:string;family:string;phase:'both'|'post';minimumSchema:number;dynamicPorts:boolean;input:string|null;output:string;requestBound:number;modelRole:'Analysis'|'Prose'|null;terminal:boolean;rootOnly:boolean;modes:string[];controls:string[];defaults:Record<string,unknown>;controlDescriptors:Record<string,unknown>}
export interface Port {id:string;label:string;kind:string;direction:'input'|'output';required:boolean;cardinality:'one'}
export interface IntrospectionRequest {messages:{role:'system'|'user'|'assistant';content:string}[];maxTokens:number;signal?:AbortSignal;binding?:unknown;modelRole?:'Analysis'|'Prose'|null}
export interface ExecutionPorts {phase?:'pre'|'post';root?:boolean;signal?:AbortSignal;preview?:boolean;dryRun?:boolean;request?:(request:IntrospectionRequest)=>Promise<{ok:true;data:{text:string;finish?:string|null;usage?:unknown}}|Failure>;countTokens?:(text:string)=>Promise<{tokens:number;method:string}>;memory?:Pick<MemoryService,'read'> & Partial<Pick<MemoryService,'recall'|'commit'>>;[port:string]:unknown}
export const INTROSPECTION_OPERATIONS:readonly {id:string;title:string;family:string;minimumSchema:number;dynamicPorts:boolean;modes:string[];defaults:{mode:string}}[];
export function describeIntrospection(node:unknown,options?:{phase?:'pre'|'post'}):{ok:true;data:{descriptor:Descriptor;ports:Port[]}}|Failure;
export function executeIntrospection(node:unknown,namedInputs?:unknown,ports?:ExecutionPorts):Promise<OperationResult>;
