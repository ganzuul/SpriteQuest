import type { ChatDocumentCatalog, StoryDocumentDefinition } from './document-catalog';
import type { Result } from './types';
export type WorkflowDataKind = 'clock' | 'notes' | 'outcomes';
export interface WorkflowDataPreset extends StoryDocumentDefinition { kind: WorkflowDataKind; controlKey: 'clockId' | 'targetId' | 'ledgerId'; }
export function workflowDataPresetFor(operation: string): WorkflowDataPreset | null;
export function workflowDataKind(definition: unknown): WorkflowDataKind | null;
export function ensureWorkflowDataDefaults(options: { catalog: ChatDocumentCatalog; defaults?: WorkflowDataPreset[]; graph: { nodes: Record<string, unknown> }; scope: { userId: string; chatId: string }; context: () => { chatId?: string; getCurrentChatId?: () => string; chatMetadata?: Record<string, unknown> }; isCurrent: () => boolean }): Result<{ created: string[] }>;
