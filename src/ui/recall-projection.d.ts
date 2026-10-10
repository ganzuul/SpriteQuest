import type {NativeGraph3} from '../workflow/types';
import type {NativeRecallStatus} from '../workflow/native-recall';
import type {RecallProjection} from '../../ui/recall-types';
export function projectRecallView(input:{rootGraph:NativeGraph3|null;status:NativeRecallStatus|null;enabled:boolean;issue?:string;nodeIds:readonly string[];viewKind:'root'|'instance'|'library'}):RecallProjection;
