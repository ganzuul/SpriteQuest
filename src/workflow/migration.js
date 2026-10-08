import { validateGraphStructure } from './contracts.js?v=0.19.1';
export { isNativeWorkflow } from './contracts.js?v=0.19.1';

/** Clone a supported native document and give primitive wires stable named endpoints.
 * @returns {import('./types').Result<import('./types').NativeGraph3>}
 */
export function normalizeNativeGraph(graph) {
    const validation = validateGraphStructure(graph);
    if (!validation.ok) return validation;
    const copy = structuredClone(graph);
    if (copy.schema === 2) {
        copy.schema = 3;
        copy.runtime = 2;
        for (const wire of Object.values(copy.wires)) Object.assign(wire, { route: 'wire', fromPort: 'out', toPort: 'in' });
    }
    copy.portals ??= {};
    copy.definitions ??= {};
    return { ok: true, data: copy };
}
