import { validateGraphStructure } from './contracts.js?v=0.20.0';

/** Detach a current document and supply its absent optional authoring containers.
 * @param {unknown} graph
 * @returns {import('./types').Result<import('./types').NativeGraph3>}
 */
export function cloneWorkflowDocument(graph) {
    const validation = validateGraphStructure(graph);
    if (!validation.ok) return validation;
    const copy = structuredClone(graph);
    for (const key of ['groups', 'roles', 'portals', 'definitions']) copy[key] ??= {};
    return { ok: true, data: copy };
}
