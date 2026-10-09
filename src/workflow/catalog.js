import { PRIMITIVE_OPERATIONS, describePrimitive } from './operations/nodes.js?v=0.22.0';
import { describeContextJoin } from './operations/context-join.js?v=0.22.0';

/** Native operation metadata. Artifact flow, rather than canvas placement, defines execution. */
export const FAMILIES = ['Input', 'Shaping', 'Surface', 'Transpose', 'Derive', 'Output'];
export const ARTIFACT_KINDS = ['context', 'draft', 'patches', 'candidate', 'guidance', 'text', 'data'];
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
const primitiveDescriptor = source => ({ ...source, minimumSchema: 3,
    controlDescriptors: Object.fromEntries(source.controlDescriptors.map(control => [control.key, {
        ...(control.type === 'enum' ? { type: 'enum', values: control.options } : control.type === 'text' || typeof source.defaults[control.key] === 'string' ? { type: 'string' } : { type: 'array', items: 'record' }),
        default: structuredClone(source.defaults[control.key]), label: control.label, editor: control.type === 'json' ? 'json' : 'text',
        ...(Array.isArray(source.defaults[control.key]) ? { max: control.key === 'fields' ? 128 : 64 } : {}),
    }])),
});
Object.assign(OPERATIONS, Object.fromEntries(Object.entries(PRIMITIVE_OPERATIONS).map(([id, source]) => [id, primitiveDescriptor(source)])));
const contextJoinDescriptor = source => ({ ...source, controlDescriptors: { inputs: { ...source.controlDescriptors.inputs, label: 'Inputs', editor: 'json', exposable: false } } });
OPERATIONS['context-join'] = contextJoinDescriptor(describeContextJoin({ type: 'workflow', operation: 'context-join', operationVersion: 1, inputs: [{ id: 'context-1', label: 'Context 1' }, { id: 'context-2', label: 'Context 2' }] }).data.descriptor);
const newOperation = id => Object.hasOwn(PRIMITIVE_OPERATIONS, id) || id === 'context-join';
const failure = (code, message) => ({ ok: false, error: { code, message } });
function dynamicDescription(node, phase) {
    if (node.operation === 'context-join') {
        const result = describeContextJoin({ type: 'workflow', operation: 'context-join', operationVersion: node.operationVersion ?? 1, inputs: node.inputs === undefined ? structuredClone(OPERATIONS['context-join'].defaults.inputs) : node.inputs }, { phase });
        return result.ok ? { ok: true, data: { ...result.data, descriptor: contextJoinDescriptor(result.data.descriptor) } } : result;
    }
    const result = describePrimitive(node, { phase });
    return result.ok ? { ok: true, data: { ...result.data, descriptor: { ...primitiveDescriptor(result.data.descriptor), minimumSchema: 3 } } } : result;
}
/** Compatibility metadata projection. Graph validators supply the containing phase. */
export function operationFor(node, { phase } = {}) {
    const op = node?.type === 'workflow' && typeof node.operation === 'string' && Object.hasOwn(OPERATIONS, node.operation) ? OPERATIONS[node.operation] : null;
    if (!op) return null;
    if (newOperation(op.id)) {
        const effectivePhase = phase ?? node.phase ?? (op.id === 'text-rules' && node.inputKind === 'draft' ? 'post' : 'pre');
        const described = dynamicDescription(node, effectivePhase);
        return described.ok ? described.data.descriptor : null;
    }
    if (op.id !== 'reroute') return op;
    return ARTIFACT_KINDS.includes(node.artifactKind) && ['pre', 'post'].includes(node.phase)
        ? { ...op, phase: node.phase, input: node.artifactKind, output: node.artifactKind } : null;
}
/** One checked producer for effective descriptor, settings validation and actual named pins.
 * @returns {import('./types').Result<import('./types').OperationDescription>}
 */
export function describeOperation(graph, node) {
    try {
        const own = (value, key) => {
            if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('plain metadata');
            const property = Object.getOwnPropertyDescriptor(value, key);
            if (!property) return undefined;
            if (!property.enumerable || !Object.hasOwn(property, 'value')) throw new Error('own metadata');
            return property.value;
        };
        const id = own(node, 'operation');
        if (own(node, 'type') !== 'workflow' || typeof id !== 'string' || !Object.hasOwn(OPERATIONS, id)) return failure('UNKNOWN_OPERATION', 'Unknown workflow operation.');
        const version = own(node, 'operationVersion');
        if (version !== undefined && version !== 1) return failure('UNKNOWN_OPERATION', 'Unknown workflow operation version.');
        if (newOperation(id)) {
            if (own(graph, 'schema') !== 3 || own(graph, 'runtime') !== 2) return failure('UNSUPPORTED_VERSION', 'This operation requires schema 3 and runtime 2.');
            const mode = own(graph, 'mode');
            if (!['native-pre', 'native-post'].includes(mode)) return failure('WRONG_PHASE', 'Expected a native workflow phase.');
            // Context Join receives only its declared settings; no envelope metadata is runtime Context.
            if (id === 'context-join') own(node, 'inputs');
            const result = dynamicDescription(node, mode.slice(7));
            return !result.ok && result.error.code === 'INVALID_PHASE' ? failure('WRONG_PHASE', result.error.message) : result;
        }
        const descriptor = operationFor(node);
        if (!descriptor) return failure('UNKNOWN_OPERATION', 'Unknown workflow operation.');
        return { ok: true, data: { descriptor, ports: [
            ...(descriptor.input ? [{ id: 'in', label: 'Input', kind: descriptor.input, direction: 'input', required: true, cardinality: 'one' }] : []),
            ...(descriptor.output ? [{ id: 'out', label: 'Output', kind: descriptor.output, direction: 'output', required: false, cardinality: 'one' }] : []),
        ] } };
    } catch { return failure('INVALID_SETTINGS', 'Use plain operation metadata with own data properties.'); }
}
/** Slot labels are presentation; stable slot identity and order are semantic. */
export function semanticControlsForNode(node, operation = operationFor(node)) {
    const controls = Object.fromEntries((operation?.controls ?? []).map(key => [key, node[key] === undefined ? operation.defaults[key] : node[key]]));
    if (node.operation === 'context-join' && Array.isArray(controls.inputs)) controls.inputs = controls.inputs.map(slot => ({ id: slot.id }));
    return controls;
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
    const described = describeOperation(graph, node);
    return described.ok ? described.data.ports : [];
}
export function operationDefaults(id = 'scene-context') {
    const op = Object.hasOwn(OPERATIONS, id) ? OPERATIONS[id] : null;
    if (!op) throw new Error(`Unknown workflow operation: ${id}`);
    return { operation: id, ...(op.minimumSchema === 3 ? { operationVersion: 1 } : {}), title: op.title, modelRole: op.modelRole, profileId: null, model: null, ...structuredClone(op.defaults) };
}
