import type { NodeDetailsView } from '../../ui/detail-types';
import type { NodeCardData } from '../../ui/types';
import type { CommentFrameData } from '../../ui/comment-types';
export interface NodeGuideView {
    key: string; title: string; summary: string; howTo: readonly string[];
    card: NodeCardData | null; comment?: CommentFrameData;
    settings: {key: string; label: string; description: string}[];
}
export function projectNodeGuide(details: NodeDetailsView | null | undefined): NodeGuideView | null;
export function projectCommentGuide(comment: CommentFrameData): NodeGuideView | null;
