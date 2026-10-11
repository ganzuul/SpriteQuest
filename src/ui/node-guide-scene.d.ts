import type { NativeGraph3, Result } from '../workflow/types';
import type { NodeCardData } from '../../ui/types';
import type { CommentFrameData } from '../../ui/comment-types';
import type { NodeGuideConnection } from './node-guide-preview';
export interface NodeGuideScene { cards: NodeCardData[]; connections: NodeGuideConnection[]; comments: CommentFrameData[] }
export function prepareNodeGuideScene(graph: NativeGraph3, options?: { instancePath?: string[]; definitionKey?: string }): Result<NodeGuideScene>;
