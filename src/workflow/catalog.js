/** Native operation metadata. Artifact flow, rather than canvas placement, defines execution. */
export const FAMILIES = ['Input', 'Shaping', 'Surface', 'Transpose', 'Derive', 'Output'];
export const ARTIFACT_KINDS = ['context', 'draft', 'patches', 'candidate', 'guidance'];
function controlDescriptor(operation, key, value) {
    const values = key === 'method' ? ['select', 'compress'] : key === 'scope' ? ['whole', 'narration', 'dialogue'] : key === 'mode' ? (operation === 'repair' ? ['repair', 'scan'] : ['literal']) : null;
    if (values) return { type: 'enum', values, default: value };
    if (typeof value === 'number') return { type: 'integer', min: key === 'keepRecent' ? 0 : 1, max: key === 'keepRecent' ? 1000 : 65536, default: value };
    if (Array.isArray(value)) return { type: 'array', items: key === 'rules' ? 'string-or-record' : 'string', default: value };
    return { type: typeof value, default: value };
}
const descriptor = (id, title, family, phase, input, output, defaults = {}, extra = {}) => ({ id, title, family, phase, input, output, controls: Object.keys(defaults), controlDescriptors: Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, controlDescriptor(id, key, value)])), defaults, requestBound: 0, modelRole: null, terminal: false, ...extra });
export const OPERATIONS = {
    'scene-context': descriptor('scene-context', 'Scene Context', 'Input', 'pre', null, 'context', { recentMessages: 12, includeCharacter: true }),
    'reply-snapshot': descriptor('reply-snapshot', 'Reply Snapshot', 'Input', 'post', null, 'draft'),
    'smart-compactor': descriptor('smart-compactor', 'Smart Compactor', 'Shaping', 'pre', 'context', 'context', { targetTokens: 1200, purpose: '', method: 'select', keepRecent: 2, pins: [], maxTokens: 1024 }, { modelRole: 'Analysis', requestBound: node => node.method === 'compress' ? 1 : 0 }),
    'response-plan': descriptor('response-plan', 'Response Plan', 'Shaping', 'pre', 'context', 'guidance', { instructions: '', maxTokens: 768 }, { modelRole: 'Analysis', requestBound: 1 }),
    'pattern-scan': descriptor('pattern-scan', 'Pattern Scan', 'Derive', 'post', 'draft', 'draft', { mode: 'literal', scope: 'whole', caseSensitive: false, rules: [], exemptions: [], protectedLiterals: [] }),
    repair: descriptor('repair', 'Repair', 'Surface', 'post', 'draft', 'patches', { mode: 'repair', strength: 'light', instructions: '', maxTokens: 2048, protectedLiterals: [] }, { modelRole: 'Prose', requestBound: node => node.mode === 'scan' ? 0 : 1 }),
    'validate-patches': descriptor('validate-patches', 'Validate Patches', 'Derive', 'post', 'patches', 'candidate'),
    guidance: descriptor('guidance', 'Guidance', 'Output', 'pre', 'guidance', null, { budgetTokens: 768 }, { terminal: true }),
    'review-gate': descriptor('review-gate', 'Review Gate', 'Output', 'post', 'candidate', 'candidate'),
    'apply-reply': descriptor('apply-reply', 'Apply Reply', 'Output', 'post', 'candidate', null, {}, { terminal: true }),
    reroute: descriptor('reroute', 'Reroute', 'Shaping', null, null, null),
};
export function operationFor(node) {
    const op = node?.type === 'workflow' && typeof node.operation === 'string' && Object.hasOwn(OPERATIONS, node.operation) ? OPERATIONS[node.operation] : null;
    if (op?.id !== 'reroute') return op;
    return ARTIFACT_KINDS.includes(node.artifactKind) && ['pre', 'post'].includes(node.phase)
        ? { ...op, phase: node.phase, input: node.artifactKind, output: node.artifactKind } : null;
}
/** Stable primitive pins; sources and terminals never fabricate unused endpoints.
 * @returns {import('./types').PortDescriptor[]}
 */
export function portsForNode(graph, node) {
    // Projection of checked DTO metadata only: no graph analysis, preparation or host work.
    if (node?.type === 'subgraph') {
        const ref = node.definition;
        const key = ref && JSON.stringify([ref.id, ref.version, ref.semanticHash]);
        const definition = key && Object.hasOwn(graph?.definitions ?? {}, key) ? graph.definitions[key] : null;
        return Array.isArray(definition?.interface) ? definition.interface.map(({ boundaryNodeId, ...port }) => ({ ...port })) : [];
    }
    if (node?.type === 'subgraph-input' || node?.type === 'subgraph-output') {
        const port = Array.isArray(graph?.interface) ? graph.interface.find(port => port.id === node.interfacePortId && port.boundaryNodeId === node.id) : null;
        return port ? [{ id: node.type === 'subgraph-input' ? 'out' : 'in', label: port.label, kind: port.kind, direction: node.type === 'subgraph-input' ? 'output' : 'input', required: node.type === 'subgraph-output', cardinality: 'one' }] : [];
    }
    const op = operationFor(node);
    if (!op) return [];
    return [
        ...(op.input ? [{ id: 'in', label: 'Input', kind: op.input, direction: 'input', required: true, cardinality: 'one' }] : []),
        ...(op.output ? [{ id: 'out', label: 'Output', kind: op.output, direction: 'output', required: false, cardinality: 'one' }] : []),
    ];
}
export function operationDefaults(id = 'scene-context') {
    const op = Object.hasOwn(OPERATIONS, id) ? OPERATIONS[id] : null;
    if (!op) throw new Error(`Unknown workflow operation: ${id}`);
    return { operation: id, title: op.title, modelRole: op.modelRole, profileId: null, model: null, ...structuredClone(op.defaults) };
}
