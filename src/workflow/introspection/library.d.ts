import type {Failure,Result} from './contracts.js';
import type {IntrospectionNode,ExecutionPorts} from './nodes.js';
export type Binding = {node:string}|{input:string};
export interface IntrospectionExample {format:'lattice-introspection-example';version:1;integrationRequired:true;phase:'pre'|'post';description?:string;nodes:(IntrospectionNode & {id:string;inputs:Record<string,Binding>})[];outputs:Record<string,Binding>}
export interface ExampleResult {artifacts:Record<string,unknown>;outputs:Record<string,unknown>;reports:unknown[];calls:number;requestBound:number;settlements:unknown[]}
export function validateIntrospectionExample(manifest:unknown,namedInputs?:unknown):Result<{manifest:IntrospectionExample;inputs:Record<string,unknown>;nodes:unknown[];requestBound:number}>;
export function runIntrospectionExample(manifest:unknown,namedInputs?:unknown,ports?:ExecutionPorts & {bindings?:Record<string,unknown>}):Promise<{ok:true;data:ExampleResult}|Failure>;
