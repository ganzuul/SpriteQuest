import type { NativeNode, NodeAddress, Result } from './types';
import type { WorkflowDataPreset } from './workflow-data-defaults';
export function isScopedSystemOperation(node: unknown): boolean;
export function resolveSystemNode(node: NativeNode, address: NodeAddress): Result<{ node: NativeNode; defaults: WorkflowDataPreset[] }>;
