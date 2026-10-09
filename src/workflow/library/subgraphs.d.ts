import type { DefinitionSnapshot, NativeGraph3, Result } from '../types';

export type LibrarySubgraphId = 'context-lens' | 'scene-compass';
export type LibraryWorkflowId = 'scene-compass';
export type DeferredLibraryRecipeId = 'literal-cleanup' | 'formatting-cleanup';
export interface LibrarySubgraphPackage { definition: DefinitionSnapshot; json: string; }
export interface LibraryWorkflowPackage { graph: NativeGraph3; json: string; }

/** Creates portable version-1 definitions. JSON includes the flat pinned dependency closure.
 * Cleanup recipe IDs return LIBRARY_PERMISSION_PREREQUISITE without executable data.
 * Unknown IDs return UNKNOWN_LIBRARY_SUBGRAPH; no installation or model resolution occurs.
 */
export function createLibrarySubgraph(id: unknown): Result<LibrarySubgraphPackage>;
/** Creates a complete source-to-terminal authoring root without host authority.
 * Context Lens returns LIBRARY_UTILITY_ONLY; cleanup recipe IDs return
 * LIBRARY_PERMISSION_PREREQUISITE; unknown IDs return UNKNOWN_LIBRARY_WORKFLOW.
 */
export function createLibraryWorkflow(id: unknown): Result<LibraryWorkflowPackage>;
