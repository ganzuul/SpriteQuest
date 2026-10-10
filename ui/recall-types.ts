import type {NativeRecallStatus} from '../src/workflow/native-recall';
import type {DetailEditResponse} from './detail-types';
export interface RecallBadgeView {state:'queued'|'generation'|'acceptance';tooltip:string;ariaLabel:string;}
export interface RecallNodeStatus {nodeId:string;memorySetId:string;state:'unavailable'|'not-queued'|'queued'|'generation'|'acceptance';queued:boolean;queueAllowed:boolean;cancelAllowed:boolean;reason:string;targetLabel:string;useLabel:string;consumeLabel:string;activationLabel:string;statusText:string;remaining:{reply:boolean;swipe:boolean};pendingCount:number;shortcutNodeIds:string[];hotkeys:{nodeId:string;label:string}[];badge?:RecallBadgeView;}
export interface RecallCommandScope {queueNodeIds:string[];cancelNodeIds:string[];queueShortcutNodeIds:string[];cancelShortcutNodeIds:string[];queueMemorySetCount:number;cancelMemorySetCount:number;queueReason:string;cancelReason:string;relevantNodeIds:string[];excludedCount:number;}
export interface RecallSetView extends RecallNodeStatus {nodeIds:string[];}
export interface RecallProjection {nodes:Record<string,RecallNodeStatus>;sets:RecallSetView[];commands:{selected:RecallCommandScope;all:RecallCommandScope};issue:string;}
export interface RecallActions {refresh():void;change(nodeIds:readonly string[],action:'queue'|'cancel'):DetailEditResponse;reveal(nodeId:string):void;}
export interface RecallContext {editorToken:unknown;documentToken:object;selectionEpoch:number;projection:RecallProjection;}
export type RecallNativeStatus=NativeRecallStatus;
