import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../definitions.js?v=0.19.1';
import { exportSubgraph, exportWorkflow, parseSubgraph, parseWorkflow } from '../packages.js?v=0.19.1';
import { resolveWorkflow } from '../resolve.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const primitive = (id, operation, settings = {}) => ({ id, type: 'workflow', operation, operationVersion: 1, ...settings });
const wire = (id, from, to, fromPort = 'out', toPort = 'in') => ({ id, route: 'wire', from, fromPort, to, toPort });
const parameter = (id, label, nodeId, controlId = id, instancePath = []) => ({ id, label, target: { instancePath, nodeId, controlId } });
const definition = (id, name, phase, inputId, inputKind, outputId, outputKind, nodes, wires, parameters, roles = {}) => ({
    id: `lattice.library.${id}`, version: 1, name,
    interface: [
        { id: inputId, label: inputKind === 'context' ? 'Context' : 'Draft', direction: 'input', kind: inputKind, required: true, cardinality: 'one', boundaryNodeId: 'entry' },
        { id: outputId, label: name + ' result', direction: 'output', kind: outputKind, required: false, cardinality: 'one', boundaryNodeId: 'exit' },
    ],
    parameters,
    body: { schema: 3, runtime: 2, mode: `native-${phase}`, nodes: {
        entry: { id: 'entry', type: 'subgraph-input', interfacePortId: inputId },
        ...nodes,
        exit: { id: 'exit', type: 'subgraph-output', interfacePortId: outputId },
    }, wires, roles, groups: {}, portals: {} },
});
const unresolved = role => ({ [role]: { model: null } });
const reference = value => ({ id: value.id, version: value.version, semanticHash: value.semanticHash });
const instance = (id, value) => ({ id, type: 'subgraph', definition: reference(value), parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} });
function contextLens() {
    return definition('context-lens', 'Context Lens', 'pre', 'context', 'context', 'selected-context', 'context', {
        compact: primitive('compact', 'smart-compactor', { method: 'select' }),
    }, { select: wire('select', 'entry', 'compact'), result: wire('result', 'compact', 'exit') }, [
        parameter('targetTokens', 'Target tokens', 'compact'), parameter('keepRecent', 'Keep recent messages', 'compact'),
        parameter('pins', 'Protected literal pins', 'compact'), parameter('method', 'Selection or compression', 'compact'),
        parameter('purpose', 'Selection purpose', 'compact'), parameter('maxTokens', 'Compression completion limit', 'compact'),
    ], unresolved('Analysis'));
}
function sceneCompass(lens) {
    return definition('scene-compass', 'Scene Compass', 'pre', 'context', 'context', 'guidance', 'guidance', {
        lens: instance('lens', lens),
        plan: primitive('plan', 'response-plan', { instructions: 'Suggest optional scene direction, actor intentions, constraints and possible next beats. Preserve user agency; do not establish events or decide the user’s actions.' }),
    }, { select: wire('select', 'entry', 'lens', 'out', 'context'), plan: wire('plan', 'lens', 'plan', 'selected-context'), result: wire('result', 'plan', 'exit') }, [
        parameter('targetTokens', 'Context target tokens', 'compact', 'targetTokens', ['lens']),
        parameter('keepRecent', 'Keep recent messages', 'compact', 'keepRecent', ['lens']),
        parameter('pins', 'Protected context pins', 'compact', 'pins', ['lens']),
        parameter('method', 'Context selection or compression', 'compact', 'method', ['lens']),
        parameter('purpose', 'Context purpose', 'compact', 'purpose', ['lens']),
        parameter('compressionMaxTokens', 'Compression completion limit', 'compact', 'maxTokens', ['lens']),
        parameter('instructions', 'Planning instructions', 'plan'), parameter('maxTokens', 'Planning completion limit', 'plan'),
    ], unresolved('Analysis'));
}
const permissionPrerequisite = () => fail('LIBRARY_PERMISSION_PREREQUISITE', 'This cleanup recipe is deferred until a registered operation preserves upstream permissions and requires explicit construction of missing permissions.');
function packageDefinition(draft, snapshots = {}) {
    const identity = computeDefinitionIdentity(draft);
    if (!identity.ok) return identity;
    const pinned = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    const checked = validateDefinition(pinned, snapshots);
    if (!checked.ok) return checked;
    try {
        const json = JSON.stringify(exportSubgraph(pinned, snapshots), null, 2) + '\n';
        const parsed = parseSubgraph(json);
        return parsed.ok ? { ok: true, data: { definition: parsed.data.definition, json } } : parsed;
    } catch { return fail('LIBRARY_PACKAGE', 'The library subgraph could not be packaged.'); }
}

/** Construct a detached portable package. This never installs a definition or resolves a model. */
export function createLibrarySubgraph(id) {
    if (id === 'context-lens') return packageDefinition(contextLens());
    if (id === 'literal-cleanup' || id === 'formatting-cleanup') return permissionPrerequisite();
    if (id === 'scene-compass') {
        const lens = createLibrarySubgraph('context-lens');
        if (!lens.ok) return lens;
        return packageDefinition(sceneCompass(lens.data.definition), { [definitionRefKey(lens.data.definition)]: lens.data.definition });
    }
    return fail('UNKNOWN_LIBRARY_SUBGRAPH', 'Unknown library subgraph ID.');
}

/** Complete Scene Compass authoring root; cleanup recipes fail before package construction. */
export function createLibraryWorkflow(id) {
    if (id === 'context-lens') return fail('LIBRARY_UTILITY_ONLY', 'Context Lens outputs Context and is a utility subgraph, not a complete Guidance workflow.');
    if (id === 'literal-cleanup' || id === 'formatting-cleanup') return permissionPrerequisite();
    if (id !== 'scene-compass') return fail('UNKNOWN_LIBRARY_WORKFLOW', 'Unknown complete library workflow ID.');
    const created = createLibrarySubgraph(id);
    if (!created.ok) return created;
    const parsed = parseSubgraph(created.data.json);
    if (!parsed.ok) return parsed;
    const { definition: pinned, definitions } = parsed.data;
    const graph = {
        id: `lattice.library.workflow.${id}`, name: pinned.name, schema: 3, runtime: 2, mode: pinned.body.mode,
        nodes: { source: primitive('source', 'scene-context'), library: instance('library', pinned), output: primitive('output', 'guidance') },
        wires: { source: wire('source', 'source', 'library', 'out', pinned.interface[0].id),
            output: wire('output', 'library', 'output', pinned.interface[1].id) },
        definitions: { ...definitions, [definitionRefKey(pinned)]: pinned }, roles: pinned.body.roles, groups: {}, portals: {},
    };
    const resolved = resolveWorkflow(graph);
    if (!resolved.ok) return resolved;
    try {
        const json = JSON.stringify(exportWorkflow(graph), null, 2) + '\n';
        const portable = parseWorkflow(json);
        return portable.ok ? { ok: true, data: { graph: portable.data, json } } : portable;
    } catch { return fail('LIBRARY_PACKAGE', 'The library workflow could not be packaged.'); }
}
