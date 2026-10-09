import { safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.19.1';
import { normalizeNativeGraph } from './migration.js?v=0.19.1';
import { operationFor } from './catalog.js?v=0.19.1';
export { portsForNode } from './catalog.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const endpoint = value => value && typeof value === 'object' && !Array.isArray(value) && typeof value.nodeId === 'string' && typeof value.portId === 'string';
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;

/** Pure execution identity. Schema-2 serialization matches the established runtime signature. */
export function graphSemanticSignature(graph) {
    if (!graph) return 'null';
    const binding = value => value && typeof value === 'object' && !Array.isArray(value) ? { profileId: value.profileId ?? null, model: value.model ?? null } : value;
    const inheritedBinding = value => graph.schema === 3 && value && typeof value === 'object' && !Array.isArray(value)
        ? Object.fromEntries(['profileId', 'model'].filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]])) : binding(value);
    const nodes = Object.entries(graph.nodes ?? {}).filter(([, node]) => node.type !== 'note' || node.inGroup !== undefined).map(([key, node]) => {
        const operation = operationFor(node);
        const controls = Object.fromEntries((operation?.controls ?? []).map(control => [control, node[control] === undefined ? operation.defaults[control] : node[control]]));
        if (node.operation === 'validate-patches') controls.protectedLiterals = node.protectedLiterals === undefined ? [] : node.protectedLiterals;
        return { key, id: node.id, type: node.type, operation: node.operation, operationVersion: node.operationVersion === undefined ? 1 : node.operationVersion, enabled: node.enabled !== false, modelRole: node.modelRole ?? operation?.modelRole ?? null, ...binding(node), inGroup: node.inGroup, controls,
            ...(graph.schema === 3 && node.operation === 'reroute' ? { artifactKind: node.artifactKind, phase: node.phase } : {}),
            ...(graph.schema === 3 && node.type === 'subgraph' ? { definition: node.definition, parameterOverrides: node.parameterOverrides ?? {}, roleOverrides: Object.fromEntries(Object.entries(node.roleOverrides ?? {}).map(([key, value]) => [key, inheritedBinding(value)])), nodeBindingOverrides: Object.fromEntries(Object.entries(node.nodeBindingOverrides ?? {}).map(([key, value]) => [key, inheritedBinding(value)])) } : {}),
            ...(graph.schema === 3 && ['subgraph-input', 'subgraph-output'].includes(node.type) ? { interfacePortId: node.interfacePortId } : {}),
        };
    });
    const wires = Object.entries(graph.wires ?? {}).map(([key, wire]) => ({ key, id: wire.id, from: wire.from, to: wire.to, order: wire.order, kind: wire.kind, port: wire.port, loop: wire.loop,
        ...(graph.schema === 3 ? { route: wire.route, fromPort: wire.fromPort, toPort: wire.toPort, portalId: wire.portalId } : {}),
    }));
    const groups = Object.entries(graph.groups ?? {}).map(([key, group]) => ({ key, id: group.id, enabled: group.enabled !== false, component: group.component === undefined ? undefined : group.component && { id: group.component.id, version: group.component.version }, entry: group.entry, exit: group.exit, members: group.members }));
    const roles = Object.fromEntries(Object.entries(graph.roles ?? {}).map(([role, value]) => [role, inheritedBinding(value)]));
    const composition = graph.schema === 3 ? {
        portals: Object.fromEntries(Object.entries(graph.portals ?? {}).map(([key, portal]) => [key, { id: portal.id, source: portal.source, kind: portal.kind }])),
        definitions: Object.fromEntries(Object.entries(graph.definitions ?? {}).map(([key, definition]) => [key, {
            id: definition.id, version: definition.version, semanticHash: definition.semanticHash,
            interface: definition.interface?.map(({ label, ...port }) => port), parameters: definition.parameters?.map(({ label, ...parameter }) => parameter),
            body: JSON.parse(graphSemanticSignature(definition.body)),
        }])),
    } : {};
    return JSON.stringify(canonical({ schema: graph.schema, runtime: graph.runtime, mode: graph.mode, nodes, wires, groups, roles, ...composition }));
}

/** Document precondition includes aliases/layout, but excludes root camera/selection and save bookkeeping. */
export function graphDocumentSignature(graph) {
    const { view, selection, updatedAt, ...document } = graph;
    return JSON.stringify(canonical(document));
}
function prepared(original, candidate, addedEdgeIds, removedEdgeIds) {
    const changed = addedEdgeIds.length > 0 || removedEdgeIds.length > 0;
    return { ok: true, data: {
        candidate: changed ? candidate : structuredClone(original), changed,
        addedEdgeIds, removedEdgeIds, baseSignature: graphSemanticSignature(original), baseDocumentSignature: graphDocumentSignature(original),
    } };
}

/** Prepare a complete candidate; no mutation, host calls, or identity allocation side effects.
 * @param {unknown} graph
 * @param {import('./types').ConnectionCommand} command
 * @returns {import('./types').Result<import('./types').PreparedGraphEdit>}
 */
export function prepareConnection(graph, command) {
    if (!safeWorkflowData(command) || !endpoint(command?.from) || !endpoint(command?.to) || (command.replace !== undefined && typeof command.replace !== 'boolean')) return fail('INVALID_ENDPOINT', 'Expected named output and input endpoints.');
    const normalized = normalizeNativeGraph(graph);
    if (!normalized.ok) return normalized;
    const candidate = normalized.data;
    const { from, to, replace = false } = command;
    if (from.nodeId === to.nodeId) return fail('CYCLE', 'A block cannot connect to itself.');
    const incoming = Object.values(candidate.wires).filter(wire => wire.to === to.nodeId && wire.toPort === to.portId);
    if (incoming.some(wire => wire.route === 'wire' && wire.from === from.nodeId && wire.fromPort === from.portId)) return prepared(graph, candidate, [], []);
    if (incoming.length && !replace) return fail('AMBIGUOUS_INPUT', 'This input is already connected.');
    const removed = incoming.map(wire => wire.id);
    for (const id of removed) delete candidate.wires[id];
    let next = 1;
    while (Object.hasOwn(graph.wires, `edge-${next}`)) next++;
    const id = `edge-${next}`;
    candidate.wires[id] = { id, route: 'wire', from: from.nodeId, fromPort: from.portId, to: to.nodeId, toPort: to.portId, order: 0 };
    const validation = validateGraphStructure(candidate);
    return validation.ok ? prepared(graph, candidate, [id], removed) : validation;
}

/** Disconnection is valid authoring state even when it leaves required inputs unfinished.
 * @returns {import('./types').Result<import('./types').PreparedGraphEdit>}
 */
export function prepareDisconnection(graph, edgeIds) {
    if (!safeWorkflowData(edgeIds) || !Array.isArray(edgeIds) || edgeIds.some(id => typeof id !== 'string')) return fail('INVALID_WIRE', 'Expected wire IDs.');
    const normalized = normalizeNativeGraph(graph);
    if (!normalized.ok) return normalized;
    const candidate = normalized.data;
    const removed = [...new Set(edgeIds)].filter(id => Object.hasOwn(candidate.wires, id));
    for (const id of removed) delete candidate.wires[id];
    const validation = validateGraphStructure(candidate);
    return validation.ok ? prepared(graph, candidate, [], removed) : validation;
}
