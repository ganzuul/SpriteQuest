import { validateGraphStructure } from './contracts.js?v=0.22.0';
import { graphSemanticSignature, graphDocumentSignature } from './ports.js?v=0.22.0';

/** Pure dual-precondition boundary shared by composition and immutable definition revisions. */
export function prepareGraphCandidate(original, candidate, addedEdgeIds = [], removedEdgeIds = []) {
    const originalValidation = validateGraphStructure(original);
    if (!originalValidation.ok) return originalValidation;
    const validation = validateGraphStructure(candidate);
    if (!validation.ok) return validation;
    const baseDocumentSignature = graphDocumentSignature(original);
    // Cloning supplies optional current containers; their absence is not an edit.
    const document = graph => ({ ...graph, ...Object.fromEntries(['groups', 'roles', 'portals', 'definitions'].map(key => [key, graph[key] ?? {}])) });
    const changed = graphDocumentSignature(document(candidate)) !== graphDocumentSignature(document(original));
    return { ok: true, data: { candidate: structuredClone(changed ? candidate : original), changed, addedEdgeIds, removedEdgeIds, baseDocumentSignature, baseSignature: graphSemanticSignature(original) } };
}
