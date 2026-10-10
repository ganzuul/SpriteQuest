import type {DataArtifact,NativeNode,NodeAddress,Result,WorkflowPhase,NativeGraph3,OperationResult,WorkflowArtifact} from './types';
import type {RecallScope,RecallGeneration,RecallHotkey} from './recall-state';
export interface NativeRecallSource {readonly sourceId:string;readonly revision:string;readonly sceneId:string;readonly watch?:string;}
export interface NativeRecallStatus {readonly scope:RecallScope|null;readonly nodes:readonly {readonly nodeId:string;readonly actorId:string;readonly memorySetId:string;readonly hotkey:RecallHotkey;readonly target:string;readonly uses:string;readonly consumeOn:string;readonly armed:boolean;readonly remaining:{readonly reply:boolean;readonly swipe:boolean};readonly pendingCount:number;}[];}
/** App-owned coherent active scope. Graph configuration never supplies these functions. */
export interface NativeRecallPorts {
 getActive:()=>{scope:RecallScope;graph:NativeGraph3;signature:string}|null;
 /** Listener owns editable-focus/conflict policy; returning cleanup is mandatory. */
 registerHotkey?:(entry:{readonly scope:RecallScope;readonly nodeId:string;readonly hotkey:RecallHotkey;readonly onPress:()=>Result<NativeRecallStatus>})=>Result<{dispose:()=>void}>;
}
export interface NativeRecallController {
 sync():Result<NativeRecallStatus>;status():Result<NativeRecallStatus>;
 arm(nodeId:string):Result<NativeRecallStatus>;disarm(nodeId:string):Result<NativeRecallStatus>;
 begin(exactRun:object,controls:{scope:RecallScope;signature:string;signal?:AbortSignal;getGeneration:()=>RecallGeneration|null;isCurrent:()=>boolean}):Result<{captured:true}>;
 /** Private trusted host-producer seam: the exact result must come from the live read/source adapter. */
 capture(exactRun:object,exactRawResult:OperationResult,details:{kind:'source'|'file'|'memory';source?:NativeRecallSource;fresh:()=>boolean;text?:string;recordValue?:unknown}):Result<{retained:true}>;
 /** For an already authenticated native Draft Event Source callback. No authored DTO can call this seam. */
 captureSourceArtifact(exactRun:object,exactArtifact:DataArtifact,details:{source:NativeRecallSource;text:string;fresh:()=>boolean}):Result<{retained:true}>;
 retain(exactRun:object,payload:{node:NativeNode;address:NodeAddress;inputs:Record<string,WorkflowArtifact>;artifact:WorkflowArtifact;portId:string;rawResult:OperationResult}):Result<{retained:true}>;
 lookup(exactRun:object,exactArtifact:WorkflowArtifact):Result<{kind:string;source:NativeRecallSource|null}>;
 authorizePresence(exactRun:object,exactArtifact:DataArtifact,options?:{actorId?:string}):Result<{source:NativeRecallSource;actorId:string;status:'present'|'absent'|'unresolved'}>;
 authorizeHolderEvent(exactRun:object,exactArtifact:DataArtifact,options:{actorId:string}):Result<{source:NativeRecallSource;actorId:string;eventId:string}>;
 authorizeGuidance(exactRun:object,exactArtifact:WorkflowArtifact):Result<{actorId:string;scope:RecallScope}>;
 execute(exactRun:object,node:NativeNode,inputs:Record<string,WorkflowArtifact>,local?:{phase?:WorkflowPhase;address?:NodeAddress;countTokens?:(text:string)=>{tokens:number}|Promise<{tokens:number}>}):Promise<OperationResult>;
 fresh(exactRun:object):boolean;hasPending(exactRun:object):boolean;succeed(exactRun:object):Result<{settled:true}>;
 effects(exactRun:object):{intentId:string;targetId:string;proposed:{kind:'recall'};preflight:()=>Result<unknown>;commit:()=>Result<unknown>}[];
 releaseRun(exactRun:object):void;dispose():void;
}
/** Ephemeral bounded scopes: no exported/imported graph restores arms, claims or producer authority. */
export function createNativeRecallController(ports:NativeRecallPorts):NativeRecallController;
