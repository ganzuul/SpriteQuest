import { safeWorkflowData, validateWorkflow } from './contracts.js?v=0.19.0';
function portableGraph(graph) {
    const copy = structuredClone(graph);
    for (const binding of Object.values(copy.roles ?? {})) if ('profileId' in binding) binding.profileId = null;
    for (const node of Object.values(copy.nodes)) if ('profileId' in node) node.profileId = null;
    return copy;
}
/** The caller serializes this envelope for download. No host state is consulted. */
export function exportWorkflow(graph) {
    const validation = validateWorkflow(graph);
    if (!validation.ok) throw new Error(validation.error.message);
    return { kind: 'comfytavern-workflow', schema: 1, minRuntime: 1, graph: portableGraph(graph) };
}
/** Parsing and preflight are pure; settings change only after caller acceptance. */
export function parseWorkflow(json) {
    if (typeof json !== 'string' || json.length > 2000000) return { ok: false, error: { code: 'MALFORMED_WORKFLOW', message: 'Workflow JSON must be at most 2 MB.' } };
    let envelope;
    try { envelope = JSON.parse(json); } catch { return { ok: false, error: { code: 'INVALID_JSON', message: 'That is not valid workflow JSON.' } }; }
    if (!safeWorkflowData(envelope)) return { ok: false, error: { code: 'MALFORMED_WORKFLOW', message: 'Invalid workflow package data.' } };
    if (envelope?.kind !== 'comfytavern-workflow' || envelope.schema !== 1 || envelope.minRuntime !== 1) return { ok: false, error: { code: 'UNSUPPORTED_PACKAGE', message: 'This package requires a supported ComfyTavern workflow version and runtime.' } };
    const validation = validateWorkflow(envelope.graph);
    if (!validation.ok) return validation;
    return { ok: true, data: portableGraph(envelope.graph) };
}
