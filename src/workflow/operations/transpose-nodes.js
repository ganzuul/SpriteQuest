import { transferDraft } from './reference-transfer.js?v=0.25.0';
import { mapTerminology } from './terminology-map.js?v=0.25.0';
const port = (id, label, direction, kind, required = false) => ({ id, label, direction, kind, required, cardinality: 'one' });
const enumeration = (key, label, options) => ({ key, label, type: 'enum', options });
const scopes = ['authorized', 'whole', 'narration', 'dialogue'];
const commonDefaults = { scope: 'narration', protectedLiterals: [] };
const commonControls = [enumeration('scope', 'Scope', scopes), { key: 'protectedLiterals', label: 'Protected literals', type: 'array', maxItems: 128, items: { type: 'string', minLength: 1, maxLength: 2048, nonblank: true } }];
const transferDefaults = { referenceKind: 'text', ...commonDefaults, strength: 'light', instructions: '', maxTokens: 2048 };
const transferControls = [enumeration('referenceKind', 'Reference', ['text', 'data']), ...commonControls, enumeration('strength', 'Strength', ['light', 'balanced']), { key: 'instructions', label: 'Instructions', type: 'string', maxLength: 10000 }, { key: 'maxTokens', label: 'Output tokens', type: 'integer', minimum: 1, maximum: 65536 }];
function freeze(value) {
    if (value && typeof value === 'object') { Object.freeze(value); for (const child of Object.values(value)) freeze(child); }
    return value;
}
const registration = (id, title, defaults, controlDescriptors, requestBound) => ({ id, title, family: 'Transpose', phase: 'post', operationVersion: 1, input: 'draft', output: 'patches', defaults, controls: Object.keys(defaults), controlDescriptors, requestBound, modelRole: requestBound ? 'Prose' : null, terminal: false, dynamicPorts: true });
/** Integration metadata only; registration and graph freshness belong to core intake. */
export const TRANSPOSE_OPERATIONS = freeze({
    'style-transfer': registration('style-transfer', 'Style Transfer', { ...transferDefaults, mode: 'narration' }, [...transferControls, enumeration('mode', 'Mode', ['narration', 'character-voice', 'rhythm', 'register'])], 1),
    'format-transfer': registration('format-transfer', 'Format Transfer', { ...transferDefaults }, [...transferControls], 1),
    'terminology-map': registration('terminology-map', 'Terminology Map', { ...commonDefaults, caseSensitive: true, match: 'word' }, [...commonControls, enumeration('caseSensitive', 'Case sensitive', [true, false]), enumeration('match', 'Match', ['word', 'phrase'])], 0),
});
const failure = (code, message) => ({ ok: false, error: { code, message } });
function plainRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value));
}
function own(value, key, fallback) {
    const property = Object.getOwnPropertyDescriptor(value, key);
    if (!property) return fallback;
    if (!property.enumerable || !Object.hasOwn(property, 'value')) throw new Error('Own enumerable data required.');
    return property.value;
}
function validateControls(settings, descriptors) {
    for (const control of descriptors) {
        const value = settings[control.key];
        if (control.type === 'enum' && !control.options.includes(value)) throw new Error('Invalid enum.');
        if (control.type === 'string' && (typeof value !== 'string' || value.length > control.maxLength)) throw new Error('Invalid string.');
        if (control.type === 'integer' && (!Number.isSafeInteger(value) || value < control.minimum || value > control.maximum)) throw new Error('Invalid integer.');
        if (control.type === 'array') {
            if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) throw new Error('Invalid array.');
            const length = Object.getOwnPropertyDescriptor(value, 'length').value;
            if (length > control.maxItems || Reflect.ownKeys(value).length !== length + 1) throw new Error('Invalid array length.');
            const pins = Array.from({ length }, (_, i) => {
                if (!Object.hasOwn(value, String(i))) throw new Error('Sparse array.');
                const pin = own(value, String(i));
                if (typeof pin !== 'string' || !pin.trim() || pin.length > control.items.maxLength) throw new Error('Invalid literal.');
                return pin;
            });
            settings[control.key] = pins;
        }
    }
}
function resolve(node, phase) {
    try {
        if (!plainRecord(node)) return failure('INVALID_SETTINGS', 'Node must be a plain record.');
        const operation = own(node, 'operation');
        if (typeof operation !== 'string' || !Object.hasOwn(TRANSPOSE_OPERATIONS, operation)) return failure('UNKNOWN_OPERATION', 'Unknown Transpose operation.');
        if (own(node, 'operationVersion', 1) !== 1) return failure('INVALID_VERSION', 'Transpose requires operation version 1.');
        if (own(node, 'phase', 'post') !== 'post' || phase !== undefined && phase !== 'post') return failure('INVALID_PHASE', 'Transpose requires post phase.');
        const base = TRANSPOSE_OPERATIONS[operation];
        const settings = Object.fromEntries(base.controls.map(key => [key, own(node, key, structuredClone(base.defaults[key]))]));
        validateControls(settings, base.controlDescriptors);
        const ports = [port('in', 'Input', 'input', 'draft', true), port('reference', 'Reference', 'input', base.requestBound ? settings.referenceKind : 'data', true), ...(base.requestBound ? [port('context', 'Context', 'input', 'context')] : []), port('out', 'Output', 'output', 'patches')];
        return { ok: true, data: { descriptor: structuredClone(base), ports, settings } };
    } catch { return failure('INVALID_SETTINGS', 'Declared node fields require own enumerable data.'); }
}
export function describeTranspose(node) {
    const result = resolve(node);
    if (!result.ok) return result;
    const { descriptor, ports } = result.data;
    return { ok: true, data: { descriptor, ports } };
}


function validateInputs(namedInputs, ports) {
    if (!plainRecord(namedInputs)) return failure('INVALID_INPUTS', 'Named inputs must be a plain record.');
    const expected = ports.filter(item => item.direction === 'input');
    const inputs = Object.create(null);
    for (const key of Reflect.ownKeys(namedInputs)) {
        const selected = expected.find(item => item.id === key);
        if (!selected) return failure('UNSUPPORTED_INPUT', 'Unsupported or stale named input.');
        const value = own(namedInputs, key);
        if (!plainRecord(value) || own(value, 'kind') !== selected.kind) return failure('INVALID_INPUT', 'Input ' + key + ' requires ' + selected.kind + '.');
        inputs[key] = value;
    }
    for (const selected of expected) if (selected.required && !Object.hasOwn(inputs, selected.id)) return failure('MISSING_INPUT', 'Required input is missing: ' + selected.id);
    return { ok: true, data: inputs };
}
function transferPorts(execution) {
    try {
        const ports = Object.fromEntries(['request', 'countTokens', 'binding', 'signal'].map(key => [key, own(execution, key)]));
        if (ports.request !== undefined && typeof ports.request !== 'function' || ports.countTokens !== undefined && typeof ports.countTokens !== 'function' || ports.signal !== undefined && !(ports.signal instanceof AbortSignal)) return failure('INVALID_EXECUTION', 'Inject request, countTokens and an AbortSignal.');
        return { ok: true, data: ports };
    } catch { return failure('INVALID_EXECUTION', 'Execution ports require own enumerable data.'); }
}
/** Injected services only; no runtime binding or provider resolution. */
export async function executeTranspose(node, namedInputs, execution = {}) {
    try {
        if (!plainRecord(execution)) return failure('INVALID_EXECUTION', 'Execution must be a plain record.');
        const resolved = resolve(node, own(execution, 'phase'));
        if (!resolved.ok) return resolved;
        const { descriptor, settings, ports: namedPorts } = resolved.data;
        const checkedInputs = validateInputs(namedInputs, namedPorts);
        if (!checkedInputs.ok) return checkedInputs;
        const inputs = checkedInputs.data;
        // Deterministic Terminology has no model authority: do not even read its ports.
        if (descriptor.id === 'terminology-map') {
            const transformed = mapTerminology(inputs.in, own(inputs.reference, 'value'), settings);
            if (!transformed.ok) return transformed;
            return { ok: true, artifact: transformed.data.artifact, reports: transformed.data.report };
        }
        const { referenceKind, ...semanticSettings } = settings;
        const checkedPorts = transferPorts(execution);
        if (!checkedPorts.ok) return checkedPorts;
        const ports = checkedPorts.data;
        if (Object.hasOwn(inputs, 'context')) ports.context = inputs.context;
        const transformed = await transferDraft(inputs.in, inputs.reference, { ...semanticSettings, kind: descriptor.id === 'style-transfer' ? 'style' : 'format' }, ports);
        if (!transformed.ok) return transformed;
        return { ok: true, artifact: transformed.data.artifact, reports: transformed.data.report };
    } catch { return failure('INVALID_INPUTS', 'Use named inputs and execution with own data properties.'); }
}
