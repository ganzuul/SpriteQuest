import type { DetailEditResponse } from './detail-types';
import type { NodeGuideExample } from '../src/workflow/node-guide-examples';
import type { NodeGuideScene } from '../src/ui/node-guide-scene';
export interface NodeGuideActions {
    example?: (key: string) => {ok: true; data: {example: NodeGuideExample; scene: NodeGuideScene}} | {ok: false; error: {message: string}};
    status?: (key: string) => {enabled: boolean; reason: string};
    add?: (key: string) => DetailEditResponse;
}
