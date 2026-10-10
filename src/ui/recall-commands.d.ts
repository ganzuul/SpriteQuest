import type {Result} from '../workflow/types';
import type {NativeRecallStatus,RecallCommandCapture} from '../workflow/native-recall';
import type {RecallContext} from '../../ui/recall-types';
declare const uiCapture:unique symbol;
export interface RecallUiCapture {readonly [uiCapture]:true;}
export interface RecallCommandPorts {readContext():RecallContext|null;isContextCurrent(context:RecallContext):boolean;captureRecall():Result<RecallCommandCapture>;changeRecallQueues(capture:RecallCommandCapture,request:{action:'queue'|'cancel';shortcutNodeIds:readonly string[]}):Result<NativeRecallStatus>;openDetails(nodeId:string):void;changed(status:NativeRecallStatus):void;}
export function createRecallCommands(ports:RecallCommandPorts):{capture(nodeIds:readonly string[],scope?:'selected'|'all'):Result<RecallUiCapture>;change(capture:RecallUiCapture,action:'queue'|'cancel'):Result<NativeRecallStatus>;openDetails(nodeId:string):void};
