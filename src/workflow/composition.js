import { safeWorkflowData } from './contracts.js?v=0.19.1';
import { normalizeNativeGraph } from './migration.js?v=0.19.1';
import { portsForNode } from './catalog.js?v=0.19.1';
import { prepareGraphCandidate } from './prepared-graph-edit.js?v=0.19.1';
export { prepareGraphCandidate } from './prepared-graph-edit.js?v=0.19.1';
export { prepareCreateFromSelection, prepareUnpack } from './composition-transform.js?v=0.19.1';
export { prepareCompositionViews } from './composition-views.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const endpoint = value => record(value) && typeof value.nodeId === 'string' && typeof value.portId === 'string';
const allocate = (table, prefix) => { let next = 1; while (Object.hasOwn(table, `${prefix}-${next}`)) next++; return `${prefix}-${next}`; };

function input(graph, command) {
    if (!safeWorkflowData(command) || !record(command)) return fail('INVALID_PORTAL', 'Expected a plain portal command.');
    return normalizeNativeGraph(graph);
}
function publisher(candidate, portalId) {
    return typeof portalId === 'string' && Object.hasOwn(candidate.portals, portalId) ? candidate.portals[portalId] : null;
}
function sourcePort(graph, source) {
    return endpoint(source) && Object.hasOwn(graph.nodes, source.nodeId) ? portsForNode(graph, graph.nodes[source.nodeId]).find(port => port.id === source.portId && port.direction === 'output') : null;
}
function restoreWire(candidate, wire) {
    const source = candidate.portals[wire.portalId].source;
    candidate.wires[wire.id] = { id: wire.id, route: 'wire', from: source.nodeId, fromPort: source.portId, to: wire.to, toPort: wire.toPort,
        ...(wire.order === undefined ? {} : { order: wire.order }), ...(wire.kind === undefined ? {} : { kind: wire.kind }) };
}

export function preparePortalCreate(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data, port = sourcePort(candidate, command.source);
    if (!port || typeof command.label !== 'string') return fail('INVALID_PORTAL', 'A publisher requires a label and existing output.');
    const id = command.id ?? allocate(candidate.portals, 'portal');
    if (typeof id !== 'string' || !id || Object.hasOwn(candidate.portals, id)) return fail('INVALID_PORTAL', 'A publisher requires a fresh stable ID.');
    Object.defineProperty(candidate.portals, id, { enumerable: true, configurable: true, writable: true, value: { id, label: command.label, kind: port.kind, source: { nodeId: command.source.nodeId, portId: command.source.portId } } });
    return prepareGraphCandidate(graph, candidate);
}
export function preparePortalRename(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data, portal = publisher(candidate, command.portalId);
    if (!portal || typeof command.label !== 'string') return fail('INVALID_PORTAL', 'Expected an existing publisher and label.');
    portal.label = command.label; return prepareGraphCandidate(graph, candidate);
}
export function preparePortalRetarget(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data, portal = publisher(candidate, command.portalId), port = sourcePort(candidate, command.source);
    if (!portal || !port) return fail('INVALID_PORTAL', 'Expected a publisher and compatible local output.');
    portal.source = { nodeId: command.source.nodeId, portId: command.source.portId }; portal.kind = port.kind;
    return prepareGraphCandidate(graph, candidate);
}
export function preparePortalBinding(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data;
    if (!publisher(candidate, command.portalId) || !endpoint(command.to) || command.replace !== undefined && typeof command.replace !== 'boolean') return fail('INVALID_PORTAL', 'Expected a publisher and named destination.');
    const incoming = Object.values(candidate.wires).filter(wire => wire.to === command.to.nodeId && wire.toPort === command.to.portId);
    if (incoming.some(wire => wire.route === 'portal' && wire.portalId === command.portalId)) return prepareGraphCandidate(graph, candidate);
    if (incoming.length && !command.replace) return fail('AMBIGUOUS_INPUT', 'This input is already bound.');
    const id = allocate(candidate.wires, 'edge');
    for (const wire of incoming) delete candidate.wires[wire.id];
    candidate.wires[id] = { id, route: 'portal', portalId: command.portalId, to: command.to.nodeId, toPort: command.to.portId };
    return prepareGraphCandidate(graph, candidate, [id], incoming.map(wire => wire.id));
}
export function preparePortalRestoreWire(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data, wire = typeof command.edgeId === 'string' && Object.hasOwn(candidate.wires, command.edgeId) && candidate.wires[command.edgeId];
    if (!wire || wire.route !== 'portal') return fail('INVALID_PORTAL', 'Expected a portal consumer wire.');
    restoreWire(candidate, wire); return prepareGraphCandidate(graph, candidate);
}
export function preparePortalDelete(graph, command) {
    const normalized = input(graph, command); if (!normalized.ok) return normalized;
    const candidate = normalized.data;
    if (!publisher(candidate, command.portalId)) return fail('INVALID_PORTAL', 'Expected an existing portal publisher.');
    const consumers = Object.values(candidate.wires).filter(wire => wire.route === 'portal' && wire.portalId === command.portalId);
    if (consumers.length && !['restore', 'disconnect'].includes(command.consumers)) return fail('PORTAL_IN_USE', 'Choose restore or disconnect for existing consumers.');
    for (const wire of consumers) if (command.consumers === 'restore') restoreWire(candidate, wire); else delete candidate.wires[wire.id];
    delete candidate.portals[command.portalId];
    return prepareGraphCandidate(graph, candidate, [], command.consumers === 'disconnect' ? consumers.map(wire => wire.id) : []);
}
