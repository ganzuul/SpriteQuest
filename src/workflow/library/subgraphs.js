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
function literalCleanup() {
    return definition('literal-cleanup', 'Literal Cleanup', 'post', 'draft', 'draft', 'candidate', 'candidate', {
        scan: primitive('scan', 'pattern-scan', { scope: 'narration', rules: ['the words hung in the air', 'the tension was palpable', 'something unreadable'] }),
        repair: primitive('repair', 'repair', { mode: 'repair', instructions: 'Replace only selected literal phrase spans with plain context-appropriate wording. Preserve meaning, dialogue and protected wording.' }),
        validate: primitive('validate', 'validate-patches'),
    }, { scan: wire('scan', 'entry', 'scan'), repair: wire('repair', 'scan', 'repair'), validate: wire('validate', 'repair', 'validate'), result: wire('result', 'validate', 'exit') }, [
        parameter('rules', 'Literal phrases', 'scan'), parameter('scope', 'Narration, dialogue or whole', 'scan'),
        parameter('caseSensitive', 'Case sensitive', 'scan'), parameter('exemptions', 'Literal exemptions', 'scan'),
        parameter('pins', 'Protected literal pins', 'scan', 'protectedLiterals'), parameter('instructions', 'Repair instructions', 'repair'),
        parameter('strength', 'Repair strength', 'repair'), parameter('maxTokens', 'Repair completion limit', 'repair'),
    ], unresolved('Prose'));
}
function formattingCleanup() {
    return definition('formatting-cleanup', 'Formatting Cleanup', 'post', 'draft', 'draft', 'candidate', 'candidate', {
        rules: primitive('rules', 'text-rules', { inputKind: 'draft', mode: 'replace', rules: [{ kind: 'literal', pattern: '\r\n', replacement: '\n' }] }),
        validate: primitive('validate', 'validate-patches'),
    }, { rules: wire('rules', 'entry', 'rules'), validate: wire('validate', 'rules', 'validate'), result: wire('result', 'validate', 'exit') }, [
        parameter('rules', 'Formatting rules', 'rules'),
    ]);
}
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
    if (id === 'literal-cleanup') return packageDefinition(literalCleanup());
    if (id === 'formatting-cleanup') return packageDefinition(formattingCleanup());
    if (id === 'scene-compass') {
        const lens = createLibrarySubgraph('context-lens');
        if (!lens.ok) return lens;
        return packageDefinition(sceneCompass(lens.data.definition), { [definitionRefKey(lens.data.definition)]: lens.data.definition });
    }
    return fail('UNKNOWN_LIBRARY_SUBGRAPH', 'Unknown library subgraph ID.');
}

/** Complete authoring root with explicit source and terminal; no arming or Apply authority. */
export function createLibraryWorkflow(id) {
    if (id === 'context-lens') return fail('LIBRARY_UTILITY_ONLY', 'Context Lens outputs Context and is a utility subgraph, not a complete Guidance workflow.');
    if (!['scene-compass', 'literal-cleanup', 'formatting-cleanup'].includes(id)) return fail('UNKNOWN_LIBRARY_WORKFLOW', 'Unknown complete library workflow ID.');
    const created = createLibrarySubgraph(id);
    if (!created.ok) return created;
    const parsed = parseSubgraph(created.data.json);
    if (!parsed.ok) return parsed;
    const { definition: pinned, definitions } = parsed.data;
    const pre = pinned.body.mode === 'native-pre';
    const graph = {
        id: `lattice.library.workflow.${id}`, name: pinned.name, schema: 3, runtime: 2, mode: pinned.body.mode,
        nodes: { source: primitive('source', pre ? 'scene-context' : 'reply-snapshot'), library: instance('library', pinned),
            ...(pre ? {} : { review: primitive('review', 'review-gate') }), output: primitive('output', pre ? 'guidance' : 'apply-reply') },
        wires: { source: wire('source', 'source', 'library', 'out', pinned.interface[0].id),
            output: wire('output', 'library', pre ? 'output' : 'review', pinned.interface[1].id),
            ...(pre ? {} : { review: wire('review', 'review', 'output') }) },
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
