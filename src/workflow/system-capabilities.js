import { sha256Text } from './definition-data.js?v=0.27.0';
import { workflowDataPresetFor } from './workflow-data-defaults.js?v=0.27.0';

/** Static composition eligibility is trusted code, never a portable node flag. */
const scopedOperations = new Set(['read-file', 'write-file', 'story-clock', 'commit-clock', 'commit-outcomes']);
export const isScopedSystemOperation = node => node?.type === 'workflow' && scopedOperations.has(node.operation);

/** Resolve execution-only reserved targets after authored parameter overrides. */
export function resolveSystemNode(node, address) {
    if (!address || typeof address.workflowId !== 'string' || !Array.isArray(address.instancePath) || address.instancePath.some(id => typeof id !== 'string' || !id)) return { ok: false, error: { code: 'INVALID_SYSTEM_ADDRESS', message: 'System defaults require an valid workflow address.' } };
    const effective = { ...node }, defaults = [];
    const controls = node.operation === 'story-clock' ? ['clockId'] : node.operation === 'random-pick' ? ['ledgerId'] : ['read-file', 'commit-outcomes'].includes(node.operation) ? ['targetId'] : [];
    for (const control of controls) {
        const configured = node[control];
        const fallback = workflowDataPresetFor(node.operation);
        const target = (configured === undefined || configured === '') && node.operation !== 'random-pick' ? fallback?.targetId : configured;
        const preset = ['story-clock', 'read-file', 'commit-outcomes'].map(workflowDataPresetFor).find(item => item.targetId === target);
        if (!preset) continue;
        const targetId = address.instancePath.length && preset.kind !== 'clock' ? 'lattice-system-' + preset.kind + '-' + sha256Text(JSON.stringify([address.workflowId, address.instancePath, preset.kind])).slice(7) : preset.targetId;
        effective[control] = targetId;
        defaults.push({ ...preset, targetId });
    }
    return { ok: true, data: { node: effective, defaults } };
}
