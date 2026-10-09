import type { DefinitionSnapshot, NativeGraph3, Result } from '../types';

export type LibrarySubgraphId = 'context-lens' | 'scene-compass' | 'literal-cleanup' | 'formatting-cleanup' | 'prose-cleanup';
export type LibraryWorkflowId = Exclude<LibrarySubgraphId, 'context-lens'>;
export interface LibrarySubgraphPackage { definition: DefinitionSnapshot; json: string; }
export interface LibraryWorkflowPackage { graph: NativeGraph3; json: string; }

/** Creates portable version-1 definitions. JSON includes the flat pinned dependency closure.
 * Unknown IDs return UNKNOWN_LIBRARY_SUBGRAPH; no installation or model resolution occurs.
 */
export function createLibrarySubgraph(id: unknown): Result<LibrarySubgraphPackage>;
/** Creates a complete source-to-terminal authoring root without host authority.
 * Context Lens returns LIBRARY_UTILITY_ONLY; unknown IDs return UNKNOWN_LIBRARY_WORKFLOW.
 * Cleanup roots retain Review Gate and explicit Apply Reply outside reusable bodies.
 */
export function createLibraryWorkflow(id: unknown): Result<LibraryWorkflowPackage>;
