import type { NativeGraph3, PreparedGraphEdit, Result } from './types';
import type { NodeGuideExample } from './node-guide-examples';
export type NodeGuideIdentityKind = 'nodes' | 'wires' | 'groups' | 'portals' | 'definitions' | 'roles';
export interface NodeGuideInsertionOptions {
    viewPath?: string[];
    readOnly?: boolean;
    at?: { x: number; y: number };
    allocateId?: (kind: NodeGuideIdentityKind, sourceId: string) => string;
}
export interface PreparedNodeGuideInsertion extends PreparedGraphEdit {
    added: Record<NodeGuideIdentityKind, string[]>;
    identityMap: Record<NodeGuideIdentityKind, Record<string, string>>;
    viewPath: string[];
    reusedNodeIds: string[];
    selectedNodeIds: string[];
    message: string;
    diagnostics: { callBound: number; importedCallBound: number; bindingReviewRequired: boolean; requiredRoles: string[]; unresolvedBindings: unknown[]; terminals: unknown[]; [key: string]: unknown };
}
export function prepareNodeGuideInsertion(destination: NativeGraph3, example: NodeGuideExample, options?: NodeGuideInsertionOptions): Result<PreparedNodeGuideInsertion>;
