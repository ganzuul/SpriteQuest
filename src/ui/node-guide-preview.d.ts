import type { NodeCardData, WireData, PositionUpdate } from '../../ui/types';
import type { CommentFrameData } from '../../ui/comment-types';
export interface NodeGuideConnection { id: string; from: string; fromPort: string; to: string; toPort: string; kind: string; off: boolean }
export interface NodeGuideAnchor { x: number; y: number; side?: string }
export function nodeGuideWires(connections: NodeGuideConnection[], anchor: (nodeId: string, portId: string) => NodeGuideAnchor | null | undefined): WireData[];
export function layoutNodeGuideCards(cards: Pick<NodeCardData, 'id' | 'x' | 'y'>[], connections: Pick<NodeGuideConnection, 'from' | 'to'>[], dimensions: ReadonlyMap<string, { w: number; h: number }>, width: number): PositionUpdate[];
export function layoutNodeGuideComment(cards: Pick<NodeCardData, 'id' | 'x' | 'y'>[], comments: CommentFrameData[], connections: Pick<NodeGuideConnection, 'from' | 'to'>[], dimensions: ReadonlyMap<string, { w: number; h: number }>, width: number, textHeight: number): { nodes: PositionUpdate[]; comments: CommentFrameData[] } | null;
