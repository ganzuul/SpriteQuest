import type { Result, OperationDescription, OperationDescriptor } from '../types.js';
import type { IntrospectionNode } from './nodes.js';
export function introspectionDefaults(operation: string, mode?: string): Record<string, unknown>;
export function projectIntrospectionNode(node: unknown): Result<IntrospectionNode>;
export function describeNativeIntrospection(node: unknown, options?: {phase?: 'pre'|'post'}): Result<OperationDescription>;
export const INTROSPECTION_NATIVE_OPERATIONS: Record<string, OperationDescriptor>;
