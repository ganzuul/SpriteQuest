/** Native operation metadata. Artifact flow, rather than canvas placement, defines execution. */
export const FAMILIES = ['Input', 'Shaping', 'Surface', 'Transpose', 'Derive', 'Output'];
const descriptor = (id, title, family, phase, input, output, defaults = {}, extra = {}) => ({ id, title, family, phase, input, output, controls: Object.keys(defaults), defaults, requestBound: 0, modelRole: null, terminal: false, ...extra });
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
};
export const operationFor = node => node?.type === 'workflow' && typeof node.operation === 'string' && Object.hasOwn(OPERATIONS, node.operation) ? OPERATIONS[node.operation] : null;
export function operationDefaults(id = 'scene-context') {
    const op = Object.hasOwn(OPERATIONS, id) ? OPERATIONS[id] : null;
    if (!op) throw new Error(`Unknown workflow operation: ${id}`);
    return { operation: id, title: op.title, modelRole: op.modelRole, profileId: null, model: null, ...structuredClone(op.defaults) };
}
