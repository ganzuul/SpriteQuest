import type { DefinitionSnapshot, Result } from '../types';

export type LibrarySubgraphId = 'context-lens' | 'scene-compass' | 'literal-cleanup' | 'formatting-cleanup' | 'prose-cleanup';
export interface LibrarySubgraphPackage { definition: DefinitionSnapshot; json: string; }

/** Creates portable version-1 definitions. JSON includes the flat pinned dependency closure.
 * Unknown IDs return UNKNOWN_LIBRARY_SUBGRAPH; no installation or model resolution occurs.
 */
export function createLibrarySubgraph(id: unknown): Result<LibrarySubgraphPackage>;
