import { safeWorkflowData, validateGraphStructure } from './contracts.js?v=0.25.0';
import { OPERATIONS, operationFor } from './catalog.js?v=0.25.0';
import { cloneDefinitionData, computeDefinitionIdentity, definitionRefKey, inspectDefinitionMetadata, validateDefinition } from './definitions.js?v=0.25.0';
const limit = 2000000;
const fail = (code, message) => ({ ok: false, error: { code, message } });
const pick = (value, keys) => Object.fromEntries(keys.filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]]));
const portableBindings = bindings => Object.fromEntries(Object.entries(bindings ?? {}).map(([id, binding]) => [id, { ...pick(binding, ['model']), ...(Object.hasOwn(binding, 'profileId') ? { profileId: null } : {}) }]));
function portableDefinition(definition) {
    const copy = pick(definition, ['id', 'version', 'semanticHash', 'name', 'description']);
    copy.interface = definition.interface.map(port => pick(port, ['id', 'label', 'direction', 'kind', 'required', 'cardinality', 'boundaryNodeId']));
    copy.parameters = definition.parameters.map(parameter => ({ ...pick(parameter, ['id', 'label']), target: pick(parameter.target, ['instancePath', 'nodeId', 'controlId']) }));
    copy.body = portableNativeDocument(definition.body);
    const materialized = computeDefinitionIdentity(copy);
    return materialized.ok ? structuredClone({ ...materialized.data.materializedDefinition, semanticHash: materialized.data.semanticHash }) : copy;
}
function portableNativeDocument(graph) {
    const copy = pick(graph, ['id', 'name', 'description', 'schema', 'runtime', 'mode', 'nodes', 'wires', 'groups', 'roles', 'portals', 'definitions', 'template', 'view', 'createdAt', 'updatedAt']);
    copy.nodes = Object.fromEntries(Object.entries(graph.nodes).map(([id, node]) => [id, pick(node, [
        'id', 'type', 'operation', 'operationVersion', 'title', 'enabled', 'x', 'y', 'w', 'h', 'width', 'height', 'collapsed', 'compact', 'inGroup', 'color',
        'profileId', 'model', 'modelRole', 'artifactKind', 'phase', 'alias', ...(node.type === 'note' ? ['content', 'commentFrame', 'moveContents'] : []),
        ...(node.type === 'subgraph' ? ['definition', 'parameterOverrides', 'roleOverrides', 'nodeBindingOverrides'] : []),
        ...(['subgraph-input', 'subgraph-output'].includes(node.type) ? ['interfacePortId'] : []),
        ...((OPERATIONS[node.operation]?.family === 'Introspection' ? operationFor(node, { phase: graph.mode.slice(7) }) : OPERATIONS[node.operation])?.controls ?? []), ...(node.operation === 'validate-patches' ? ['protectedLiterals'] : []),
    ])]));
    for (const node of Object.values(copy.nodes)) {
        if (Object.hasOwn(node, 'profileId')) node.profileId = null;
        if (node.type === 'subgraph') {
            node.definition = pick(node.definition, ['id', 'version', 'semanticHash']);
            node.roleOverrides = portableBindings(node.roleOverrides);
            node.nodeBindingOverrides = portableBindings(node.nodeBindingOverrides);
        }
    }
    copy.wires = Object.fromEntries(Object.entries(graph.wires).map(([id, wire]) => [id, pick(wire, ['id', 'route', 'from', 'fromPort', 'to', 'toPort', 'portalId'])]));
    if (graph.roles) copy.roles = portableBindings(graph.roles);
    if (graph.portals) copy.portals = Object.fromEntries(Object.entries(graph.portals).map(([id, portal]) => {
        if (Object.keys(portal.source).some(key => !['nodeId', 'portId'].includes(key))) throw new Error('Portal sources must be local endpoints.');
        return [id, { ...pick(portal, ['id', 'label', 'kind']), source: pick(portal.source, ['nodeId', 'portId']) }];
    }));
    if (graph.definitions) copy.definitions = Object.fromEntries(Object.entries(graph.definitions).map(([key, definition]) => [key, portableDefinition(definition)]));
    if (graph.groups) copy.groups = Object.fromEntries(Object.entries(graph.groups).map(([id, group]) => {
        const portable = pick(group, ['id', 'title', 'name', 'description', 'x', 'y', 'w', 'h', 'width', 'height', 'color', 'collapsed', 'members']);
        if (group.frame) portable.frame = pick(group.frame, ['x', 'y', 'w', 'h']);
        return [id, portable];
    }));
    if (graph.view) copy.view = pick(graph.view, ['x', 'y', 'zoom']);
    if (graph.template) copy.template = pick(graph.template, ['id', 'version']);
    return copy;
}
function portableGraph(graph) {
    return structuredClone(portableNativeDocument(graph));
}
/** The caller serializes this envelope for download. No host state is consulted. */
export function exportWorkflow(graph) {
    if (!safeWorkflowData(graph)) throw new Error('Expected a bounded plain workflow graph.');
    const structure = validateGraphStructure(graph);
    if (!structure.ok) throw new Error(structure.error.message);
    const portable = portableGraph(graph);
    const validation = validateGraphStructure(portable);
    if (!validation.ok) throw new Error(validation.error.message);
    const envelope = { kind: 'lattice-workflow', schema: 2, minRuntime: 2, graph: portable };
    if (new TextEncoder().encode(JSON.stringify(envelope)).byteLength > limit) throw new Error('Workflow JSON must be at most 2,000,000 UTF-8 bytes.');
    return envelope;
}
/** Parsing and preflight are pure; settings change only after caller acceptance. */
export function parseWorkflow(json) {
    if (typeof json !== 'string' || json.length > limit || new TextEncoder().encode(json).byteLength > limit) return fail('MALFORMED_WORKFLOW', 'Workflow JSON must be at most 2,000,000 UTF-8 bytes.');
    let envelope;
    try { envelope = JSON.parse(json); } catch { return { ok: false, error: { code: 'INVALID_JSON', message: 'That is not valid workflow JSON.' } }; }
    if (!safeWorkflowData(envelope)) return { ok: false, error: { code: 'MALFORMED_WORKFLOW', message: 'Invalid workflow package data.' } };
    if (envelope?.kind !== 'lattice-workflow' || envelope.schema !== 2 || envelope.minRuntime !== 2) return fail('UNSUPPORTED_PACKAGE', 'Expected a Lattice workflow package with schema 2 and minRuntime 2.');
    const structure = validateGraphStructure(envelope.graph);
    if (!structure.ok) return structure;
    let portable;
    try { portable = portableGraph(envelope.graph); } catch { return fail('MALFORMED_WORKFLOW', 'Malformed workflow package containers.'); }
    const validation = validateGraphStructure(portable);
    if (!validation.ok) return validation;
    return { ok: true, data: portable };
}

/** Select a checked exact closure for a standalone export or atomic shelf save.
 * Unrelated snapshots never enter the returned package; no source or saved pin changes.
 * @returns {import('./types').Result<{definition: import('./types').DefinitionSnapshot, definitions: import('./types').SnapshotTable}>}
 */
export function selectSubgraphClosure(definition, snapshots = {}) {
    const top = cloneDefinitionData(definition), table = cloneDefinitionData(snapshots);
    if (!top.ok) return top;
    if (!table.ok) return table;
    if (!table.data || typeof table.data !== 'object' || Array.isArray(table.data)) return fail('DEFINITION_DATA', 'Expected a plain pinned snapshot table.');
    const metadata = inspectDefinitionMetadata(top.data);
    if (!metadata.ok) return metadata;
    const topKey = definitionRefKey(top.data), selected = {}, visited = new Set(), pending = [top.data];
    if (Object.hasOwn(table.data, topKey)) selected[topKey] = table.data[topKey];
    while (pending.length) {
        const item = pending.pop(), checked = inspectDefinitionMetadata(item);
        if (!checked.ok) return checked;
        const key = definitionRefKey(item);
        if (visited.has(key)) continue;
        visited.add(key);
        for (const node of Object.values(item.body.nodes)) if (node?.type === 'subgraph') {
            if (!node.definition || typeof node.definition !== 'object' || Array.isArray(node.definition)) return fail('DEFINITION_REF', 'An instance requires an exact pinned reference.');
            const childKey = definitionRefKey(node.definition);
            if (!Object.hasOwn(table.data, childKey)) return fail('MISSING_DEFINITION', 'The exact pinned snapshot is not bundled.');
            selected[childKey] = table.data[childKey];
            pending.push(table.data[childKey]);
        }
    }
    const validation = validateDefinition(top.data, selected);
    if (!validation.ok) return validation;
    delete selected[topKey];
    return cloneDefinitionData({ definition: validation.data.definition, definitions: selected });
}

/** Portable standalone snapshots use one flat, local table for the complete pinned closure. */
export function exportSubgraph(definition, snapshots = {}) {
    if (!safeWorkflowData(definition) || !safeWorkflowData(snapshots)) throw new Error('Expected bounded plain subgraph data.');
    const closure = selectSubgraphClosure(definition, snapshots);
    if (!closure.ok) throw new Error(closure.error.message);
    const portable = portableDefinition(closure.data.definition), definitions = Object.fromEntries(Object.entries(closure.data.definitions).map(([key, item]) => [key, portableDefinition(item)]));
    const validation = validateDefinition(portable, definitions);
    if (!validation.ok) throw new Error(validation.error.message);
    const envelope = { kind: 'lattice-subgraph', schema: 1, minRuntime: 2, definition: portable, definitions };
    if (new TextEncoder().encode(JSON.stringify(envelope)).byteLength > limit) throw new Error('Subgraph JSON must be at most 2,000,000 UTF-8 bytes.');
    return envelope;
}
export function parseSubgraph(json) {
    if (typeof json !== 'string' || json.length > limit || new TextEncoder().encode(json).byteLength > limit) return fail('MALFORMED_WORKFLOW', 'Subgraph JSON must be at most 2,000,000 UTF-8 bytes.');
    let envelope;
    try { envelope = JSON.parse(json); } catch { return fail('INVALID_JSON', 'That is not valid subgraph JSON.'); }
    if (!safeWorkflowData(envelope)) return fail('DEFINITION_DATA', 'Invalid plain subgraph package data.');
    if (envelope?.kind !== 'lattice-subgraph' || envelope.schema !== 1 || envelope.minRuntime !== 2) return fail('UNSUPPORTED_PACKAGE', 'Unsupported subgraph package/runtime pair.');
    try {
        const closure = selectSubgraphClosure(envelope.definition, envelope.definitions ?? {});
        if (!closure.ok) return closure;
        const definition = portableDefinition(closure.data.definition), definitions = Object.fromEntries(Object.entries(closure.data.definitions).map(([key, item]) => [key, portableDefinition(item)]));
        const validation = validateDefinition(definition, definitions);
        return validation.ok ? { ok: true, data: { definition: validation.data.definition, definitions } } : validation;
    } catch { return fail('DEFINITION_DATA', 'Malformed subgraph package containers.'); }
}
