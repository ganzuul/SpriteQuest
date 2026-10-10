import { PRIMITIVE_OPERATIONS, describePrimitive } from './operations/nodes.js?v=0.26.0';
import { describeContextJoin } from './operations/context-join.js?v=0.26.0';
import { TRANSPOSE_OPERATIONS, describeTranspose } from './operations/transpose-nodes.js?v=0.26.0';
import { CLEANUP_MODES, validateCleanupSettings } from './operations/prose-cleanup.js?v=0.26.0';
import { INTROSPECTION_NATIVE_OPERATIONS, describeNativeIntrospection, introspectionDefaults } from './introspection/native.js?v=0.26.0';
import { INPUT_OPERATIONS, describeInput } from './operations/input-nodes.js?v=0.26.0';
import { CONTROL_OPERATIONS, describeControl } from './operations/control-nodes.js?v=0.26.0';
import { DECISION_OPERATIONS, describeDecision } from './operations/decision-nodes.js?v=0.26.0';
import { MODEL_OPERATIONS, describeModelNode } from './operations/model-nodes.js?v=0.26.0';

/** Native operation metadata. Artifact flow, rather than canvas placement, defines execution. */
export const FAMILIES = ['Input', 'Shaping', 'Surface', 'Transpose', 'Introspection', 'Derive', 'Output'];
export const ARTIFACT_KINDS = ['context', 'draft', 'patches', 'candidate', 'guidance', 'text', 'data'];
function controlDescriptor(operation, key, value) {
    if (operation === 'reroute' && key === 'artifactKind') return { type: 'enum', values: ARTIFACT_KINDS, default: value, label: 'Artifact kind' };
    const values = key === 'method' ? ['select', 'compress'] : key === 'scope' ? operation === 'repair' ? ['authorized', 'whole', 'narration', 'dialogue'] : ['whole', 'narration', 'dialogue'] : key === 'mode' ? (operation === 'repair' ? ['repair', 'scan', ...CLEANUP_MODES] : ['literal']) : null;
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
    repair: descriptor('repair', 'Repair', 'Surface', 'post', 'draft', 'patches', { mode: 'repair', scope: 'narration', categories: [], caseSensitive: false, strength: 'light', instructions: '', maxTokens: 2048, protectedLiterals: [] }, { modelRole: 'Prose', requestBound: node => ['scan', 'inspect'].includes(node.mode) ? 0 : 1 }),
    'validate-patches': descriptor('validate-patches', 'Validate Patches', 'Derive', 'post', 'patches', 'candidate'),
    guidance: descriptor('guidance', 'Guidance', 'Output', 'pre', 'guidance', null, { budgetTokens: 768 }, { terminal: true }),
    'review-gate': descriptor('review-gate', 'Review Gate', 'Output', 'post', 'candidate', 'candidate'),
    'apply-reply': descriptor('apply-reply', 'Apply Reply', 'Output', 'post', 'candidate', null, {}, { terminal: true }),
    reroute: descriptor('reroute', 'Reroute', 'Shaping', null, null, null, { artifactKind: 'text' }),
};
const primitiveDescriptor = source => ({ ...source, minimumSchema: 3,
    controlDescriptors: Object.fromEntries(source.controlDescriptors.map(control => [control.key, {
        ...(control.type === 'enum' ? { type: 'enum', values: control.options } : control.type === 'text' || typeof source.defaults[control.key] === 'string' ? { type: 'string' } : { type: 'array', items: control.key === 'protectedLiterals' ? 'string' : 'record' }),
        default: structuredClone(source.defaults[control.key]), label: control.label, editor: control.type === 'json' && control.key !== 'protectedLiterals' ? 'json' : 'text',
        ...(Array.isArray(source.defaults[control.key]) ? { max: ['fields', 'protectedLiterals'].includes(control.key) ? 128 : 64 } : {}),
    }])),
});
Object.assign(OPERATIONS, Object.fromEntries(Object.entries(PRIMITIVE_OPERATIONS).map(([id, source]) => [id, primitiveDescriptor(source)])));
const transposeDescriptor = source => ({ ...source, minimumSchema: 3,
    controlDescriptors: Object.fromEntries(source.controlDescriptors.map(control => [control.key, {
        ...(control.type === 'enum' ? control.options.every(value => typeof value === 'boolean') ? { type: 'boolean' } : { type: 'enum', values: control.options }
            : control.type === 'integer' ? { type: 'integer', min: control.minimum, max: control.maximum }
            : control.type === 'array' ? { type: 'array', items: 'string', max: control.maxItems }
            : { type: 'string' }),
        default: structuredClone(source.defaults[control.key]), label: control.label,
    }])),
});
Object.assign(OPERATIONS, Object.fromEntries(Object.entries(TRANSPOSE_OPERATIONS).map(([id, source]) => [id, transposeDescriptor(source)])));
Object.assign(OPERATIONS, INTROSPECTION_NATIVE_OPERATIONS);
Object.assign(OPERATIONS, INPUT_OPERATIONS);
Object.assign(OPERATIONS, CONTROL_OPERATIONS);
Object.assign(OPERATIONS, DECISION_OPERATIONS);
Object.assign(OPERATIONS, MODEL_OPERATIONS);
OPERATIONS.repair.controlDescriptors.categories.label = 'Policy categories (empty selects all)';
for (const [key, label] of Object.entries({ mode: 'Mode', scope: 'Scope', caseSensitive: 'Case sensitive', strength: 'Strength', instructions: 'Instructions', maxTokens: 'Output tokens', protectedLiterals: 'Protected literals' })) OPERATIONS.repair.controlDescriptors[key].label = label;
const contextJoinDescriptor = source => ({ ...source, controlDescriptors: { inputs: { ...source.controlDescriptors.inputs, label: 'Inputs', editor: 'json', exposable: false } } });
OPERATIONS['context-join'] = contextJoinDescriptor(describeContextJoin({ type: 'workflow', operation: 'context-join', operationVersion: 1, inputs: [{ id: 'context-1', label: 'Context 1' }, { id: 'context-2', label: 'Context 2' }] }).data.descriptor);
const newOperation = id => Object.hasOwn(MODEL_OPERATIONS, id) || Object.hasOwn(DECISION_OPERATIONS, id) || Object.hasOwn(CONTROL_OPERATIONS, id) || Object.hasOwn(INPUT_OPERATIONS, id) || Object.hasOwn(PRIMITIVE_OPERATIONS, id) || Object.hasOwn(TRANSPOSE_OPERATIONS, id) || Object.hasOwn(INTROSPECTION_NATIVE_OPERATIONS, id) || id === 'context-join' || id === 'repair';
const failure = (code, message) => ({ ok: false, error: { code, message } });
function ownMetadata(value, key) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw new Error('plain metadata');
    const property = Object.getOwnPropertyDescriptor(value, key);
    if (!property) return undefined;
    if (!property.enumerable || !Object.hasOwn(property, 'value')) throw new Error('own metadata');
    return property.value;
}
/** Effective operation capability; generation stage is derived separately from dependencies.
 * @returns {import('./types').WorkflowPhase | null}
 */
export function phaseForNode(graph, node) {
    try {
        const mode = ownMetadata(graph, 'mode'), id = ownMetadata(node, 'operation');
        if (!['native-pre', 'native-post', 'native-unified'].includes(mode) || ownMetadata(node, 'type') !== 'workflow' || typeof id !== 'string' || !Object.hasOwn(OPERATIONS, id)) return null;
        const declared = ownMetadata(node, 'phase');
        if (declared !== undefined && !['pre', 'post'].includes(declared)) return null;
        const op = OPERATIONS[id];
        const fixed = Object.hasOwn(TRANSPOSE_OPERATIONS, id) && ownMetadata(node, 'inputKind') === 'text' ? undefined
            : id === 'extract' && ownMetadata(node, 'inputKind') !== 'text' || id === 'memory' && ownMetadata(node, 'mode') === 'commit' || id === 'text-rules' && ownMetadata(node, 'inputKind') === 'draft' ? 'post'
            : id === 'compose' && ownMetadata(node, 'outputKind') === 'guidance' ? 'pre'
            : ['pre', 'post'].includes(op.phase) ? op.phase : undefined;
        const phase = mode === 'native-unified' ? declared ?? fixed ?? 'pre' : mode === 'native-pre' ? 'pre' : 'post';
        return declared !== undefined && declared !== phase || fixed !== undefined && fixed !== phase ? null : phase;
    } catch { return null; }
}
function dynamicDescription(node, phase) {
    if (Object.hasOwn(MODEL_OPERATIONS, node.operation)) return describeModelNode(node, { phase });
    if (Object.hasOwn(DECISION_OPERATIONS, node.operation)) return describeDecision(node, { phase });
    if (Object.hasOwn(CONTROL_OPERATIONS, node.operation)) return describeControl(node, { phase });
    if (Object.hasOwn(INPUT_OPERATIONS, node.operation)) return describeInput(node, { phase });
    if (Object.hasOwn(INTROSPECTION_NATIVE_OPERATIONS, node.operation)) return describeNativeIntrospection(node, { phase });
    if (node.operation === 'repair') {
        if (phase !== 'post') return failure('INVALID_PHASE', 'Repair requires the post phase.');
        try {
            const descriptor = { ...OPERATIONS.repair, minimumSchema: 3 };
            const settings = Object.fromEntries(descriptor.controls.map(key => {
                const property = Object.getOwnPropertyDescriptor(node, key);
                if (property && (!property.enumerable || !Object.hasOwn(property, 'value'))) throw new Error('own settings');
                return [key, property ? property.value : structuredClone(descriptor.defaults[key])];
            }));
            if (!['repair', 'scan', ...CLEANUP_MODES].includes(settings.mode)) return failure('INVALID_SETTINGS', 'Select a supported Repair mode.');
            if (CLEANUP_MODES.includes(settings.mode)) {
                const checked = validateCleanupSettings(settings);
                if (!checked.ok) return checked;
            } else {
                descriptor.controls = descriptor.controls.filter(key => !['scope', 'categories', 'caseSensitive'].includes(key));
                descriptor.controlDescriptors = Object.fromEntries(descriptor.controls.map(key => [key, descriptor.controlDescriptors[key]]));
            }
            return { ok: true, data: { descriptor, ports: [
                { id: 'in', label: 'Draft', kind: 'draft', direction: 'input', required: true, cardinality: 'one' },
                ...(CLEANUP_MODES.includes(settings.mode) ? [{ id: 'context', label: 'Context', kind: 'context', direction: 'input', required: false, cardinality: 'one' }] : []),
                { id: 'out', label: 'Patches', kind: 'patches', direction: 'output', required: false, cardinality: 'one' },
            ] } };
        } catch { return failure('INVALID_SETTINGS', 'Repair controls require own data properties.'); }
    }
    if (Object.hasOwn(TRANSPOSE_OPERATIONS, node.operation)) {
        const result = describeTranspose(node, { phase });
        return result.ok ? { ok: true, data: { ...result.data, descriptor: transposeDescriptor(result.data.descriptor) } } : result;
    }
    if (node.operation === 'context-join') {
        const result = describeContextJoin({ type: 'workflow', operation: 'context-join', operationVersion: ownMetadata(node, 'operationVersion') ?? 1, inputs: ownMetadata(node, 'inputs') === undefined ? structuredClone(OPERATIONS['context-join'].defaults.inputs) : ownMetadata(node, 'inputs') }, { phase });
        return result.ok ? { ok: true, data: { ...result.data, descriptor: contextJoinDescriptor(result.data.descriptor) } } : result;
    }
    const result = describePrimitive(node, { phase });
    return result.ok ? { ok: true, data: { ...result.data, descriptor: { ...primitiveDescriptor(result.data.descriptor), minimumSchema: 3 } } } : result;
}
/** Compatibility metadata projection. Graph validators supply the containing phase. */
export function operationFor(node, { phase, mode } = {}) {
    try {
        const id = ownMetadata(node, 'operation');
        const op = ownMetadata(node, 'type') === 'workflow' && typeof id === 'string' && Object.hasOwn(OPERATIONS, id) ? OPERATIONS[id] : null;
        if (!op) return null;
        const declared = ownMetadata(node, 'phase');
        if (declared !== undefined && !['pre', 'post'].includes(declared)) return null;
        if (newOperation(op.id)) {
            const effectivePhase = phase ?? declared ?? (op.phase === 'post' || op.id === 'extract' && ownMetadata(node, 'inputKind') !== 'text' || op.id === 'memory' && ownMetadata(node, 'mode') === 'commit' || op.id === 'text-rules' && ownMetadata(node, 'inputKind') === 'draft' ? 'post' : 'pre');
            if (declared !== undefined && declared !== effectivePhase) return null;
            const described = dynamicDescription(node, effectivePhase);
            return described.ok ? described.data.descriptor : null;
        }
        if (op.id !== 'reroute') {
            if (declared !== undefined && declared !== op.phase) return null;
            return op.id === 'guidance' && mode === 'native-unified' ? { ...op, output: 'guidance', terminal: false } : op;
        }
        const artifactKind = ownMetadata(node, 'artifactKind');
        return ARTIFACT_KINDS.includes(artifactKind) && ['pre', 'post'].includes(declared)
            ? { ...op, phase: declared, input: artifactKind, output: artifactKind } : null;
    } catch { return null; }
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
            const phase = phaseForNode(graph, node);
            if (!phase) return failure('WRONG_PHASE', 'The operation does not support its effective native phase.');
            // Context Join receives only its declared settings; no envelope metadata is runtime Context.
            if (id === 'context-join') own(node, 'inputs');
            const result = dynamicDescription(node, phase);
            return !result.ok && result.error.code === 'INVALID_PHASE' ? failure('WRONG_PHASE', result.error.message) : result;
        }
        const phase = phaseForNode(graph, node);
        if (!phase) return failure('WRONG_PHASE', 'The operation does not support its effective native phase.');
        const descriptor = operationFor(node, { phase, mode: own(graph, 'mode') });
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
    // Additive editor controls must preserve existing version-1 semantic pins.
    if (Object.hasOwn(TRANSPOSE_OPERATIONS, node.operation) && controls.inputKind === 'draft') delete controls.inputKind;
    if (node.operation === 'reroute') delete controls.artifactKind; // Already projected as typed node metadata.
    if (node.operation === 'context-join' && Array.isArray(controls.inputs)) controls.inputs = controls.inputs.map(slot => ({ id: slot.id }));
    if (node.operation === 'repair' && CLEANUP_MODES.includes(controls.mode)) controls.policyVersion = 1;
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
export function operationDefaults(id = 'scene-context', { mode } = {}) {
    const registered = Object.hasOwn(OPERATIONS, id) ? OPERATIONS[id] : null;
    let op = registered;
    if (registered && Object.hasOwn(INTROSPECTION_NATIVE_OPERATIONS, id) && mode !== undefined) {
        const described = describeNativeIntrospection({ type: 'workflow', operation: id, operationVersion: 1, ...introspectionDefaults(id, mode) }, { phase: id === 'memory' && mode === 'commit' ? 'post' : 'pre' });
        if (!described.ok) throw new Error(described.error.message);
        op = described.data.descriptor;
    }
    if (!op) throw new Error(`Unknown workflow operation: ${id}`);
    return { operation: id, ...(op.minimumSchema === 3 ? { operationVersion: 1 } : {}), title: op.title, modelRole: op.modelRole, profileId: null, model: null, ...structuredClone(op.defaults) };
}
