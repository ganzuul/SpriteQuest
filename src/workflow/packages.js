import { safeWorkflowData, validateWorkflow, validateGraphStructure } from './contracts.js?v=0.19.1';
import { operationFor } from './catalog.js?v=0.19.1';
const limit = 2000000;
const fail = (code, message) => ({ ok: false, error: { code, message } });
const pick = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
function portableNativeDocument(graph) {
    const copy = pick(graph, ['id', 'name', 'description', 'schema', 'runtime', 'mode', 'nodes', 'wires', 'groups', 'roles', 'portals', 'definitions', 'template', 'view', 'createdAt', 'updatedAt']);
    copy.nodes = Object.fromEntries(Object.entries(graph.nodes).map(([id, node]) => [id, pick(node, [
        'id', 'type', 'operation', 'operationVersion', 'title', 'enabled', 'x', 'y', 'w', 'h', 'width', 'height', 'collapsed', 'compact', 'inGroup', 'color',
        'profileId', 'model', 'modelRole', 'artifactKind', 'phase', ...(node.type === 'note' ? ['content'] : []),
        ...(operationFor(node)?.controls ?? []), ...(node.operation === 'validate-patches' ? ['protectedLiterals'] : []),
    ])]));
    copy.wires = Object.fromEntries(Object.entries(graph.wires).map(([id, wire]) => [id, pick(wire, ['id', 'route', 'from', 'fromPort', 'to', 'toPort', 'order', 'kind'])]));
    if (graph.roles) copy.roles = Object.fromEntries(Object.entries(graph.roles).map(([id, binding]) => [id, pick(binding, ['profileId', 'model'])]));
    if (graph.groups) copy.groups = Object.fromEntries(Object.entries(graph.groups).map(([id, group]) => {
        const portable = pick(group, ['id', 'title', 'name', 'description', 'x', 'y', 'w', 'h', 'width', 'height', 'color', 'collapsed', 'enabled', 'entry', 'exit', 'members']);
        if (group.component) portable.component = pick(group.component, ['id', 'version']);
        if (group.frame) portable.frame = pick(group.frame, ['x', 'y', 'w', 'h']);
        return [id, portable];
    }));
    if (graph.view) copy.view = pick(graph.view, ['x', 'y', 'zoom']);
    if (graph.template) copy.template = pick(graph.template, ['id', 'version']);
    return copy;
}
function portableGraph(graph) {
    const copy = structuredClone(graph.schema === 3 ? portableNativeDocument(graph) : graph);
    for (const binding of Object.values(copy.roles ?? {})) if ('profileId' in binding) binding.profileId = null;
    for (const node of Object.values(copy.nodes)) if ('profileId' in node) node.profileId = null;
    return copy;
}
/** The caller serializes this envelope for download. No host state is consulted. */
export function exportWorkflow(graph) {
    if (!safeWorkflowData(graph)) throw new Error('Expected a bounded plain workflow graph.');
    const validation = graph?.schema === 3 ? validateGraphStructure(graph) : validateWorkflow(graph);
    if (!validation.ok) throw new Error(validation.error.message);
    const version = graph.schema === 3 ? 2 : 1;
    const envelope = { kind: 'lattice-workflow', schema: version, minRuntime: version, graph: portableGraph(graph) };
    if (version === 2 && new TextEncoder().encode(JSON.stringify(envelope)).byteLength > limit) throw new Error('Workflow JSON must be at most 2,000,000 UTF-8 bytes.');
    return envelope;
}
/** Parsing and preflight are pure; settings change only after caller acceptance. */
export function parseWorkflow(json) {
    if (typeof json !== 'string' || json.length > 2000000) return { ok: false, error: { code: 'MALFORMED_WORKFLOW', message: 'Workflow JSON must be at most 2 MB.' } };
    let envelope;
    try { envelope = JSON.parse(json); } catch { return { ok: false, error: { code: 'INVALID_JSON', message: 'That is not valid workflow JSON.' } }; }
    if (!safeWorkflowData(envelope)) return { ok: false, error: { code: 'MALFORMED_WORKFLOW', message: 'Invalid workflow package data.' } };
    if (!['lattice-workflow', 'comfytavern-workflow'].includes(envelope?.kind) || !((envelope.schema === 1 && envelope.minRuntime === 1) || (envelope.schema === 2 && envelope.minRuntime === 2))) return { ok: false, error: { code: 'UNSUPPORTED_PACKAGE', message: 'This package requires a supported Lattice workflow version and runtime.' } };
    if (envelope.schema === 2 && new TextEncoder().encode(json).byteLength > limit) return fail('MALFORMED_WORKFLOW', 'Workflow JSON must be at most 2,000,000 UTF-8 bytes.');
    const expected = envelope.schema === 1 ? [2, 1] : [3, 2];
    if (envelope.graph?.schema !== expected[0] || envelope.graph?.runtime !== expected[1]) return fail('UNSUPPORTED_VERSION', 'The graph version does not match its package version.');
    const validation = envelope.schema === 1 ? validateWorkflow(envelope.graph) : validateGraphStructure(envelope.graph);
    if (!validation.ok) return validation;
    return { ok: true, data: portableGraph(envelope.graph) };
}
