import { validateGraphStructure } from './contracts.js?v=0.19.1';
import { graphSemanticSignature, graphDocumentSignature } from './ports.js?v=0.19.1';

/** Pure dual-precondition boundary shared by composition and immutable definition revisions. */
export function prepareGraphCandidate(original, candidate, addedEdgeIds = [], removedEdgeIds = []) {
    const originalValidation = validateGraphStructure(original);
    if (!originalValidation.ok) return originalValidation;
    const validation = validateGraphStructure(candidate);
    if (!validation.ok) return validation;
    const baseDocumentSignature = graphDocumentSignature(original);
    const changed = graphDocumentSignature(candidate) !== baseDocumentSignature;
    return { ok: true, data: { candidate: structuredClone(changed ? candidate : original), changed, addedEdgeIds, removedEdgeIds, baseDocumentSignature, baseSignature: graphSemanticSignature(original) } };
}
