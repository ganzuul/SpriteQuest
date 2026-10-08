import { operationFor } from './catalog.js?v=0.18.0';
const fail = (code, message, nodeId) => ({ ok: false, error: { code, message, ...(nodeId ? { nodeId } : {}) } });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
/** Bound plain JSON data before reading untrusted graph properties. */
export function safeWorkflowData(value) {
    let entries = 0, characters = 0;
    const seen = new Set();
    const visit = (item, depth) => {
        if (++entries > 20000 || depth > 40) return false;
        if (typeof item === 'string') { characters += item.length; return characters <= 2000000; }
        if (item === null || typeof item === 'boolean') return true;
        if (typeof item === 'number') return Number.isFinite(item);
        if (typeof item !== 'object' || seen.has(item)) return false;
        const prototype = Object.getPrototypeOf(item);
        if (prototype !== Object.prototype && prototype !== Array.prototype && prototype !== null) return false;
        seen.add(item);
        for (const [key, property] of Object.entries(Object.getOwnPropertyDescriptors(item))) {
            if (/^(api[_-]?key|api[_-]?token|access[_-]?token|token|password|secret|credentials?|authorization|headers?|provider|endpoint|base[_-]?url)$/i.test(key) || ['__proto__', 'prototype', 'constructor'].includes(key) || !('value' in property) || !visit(property.value, depth + 1)) return false;
        }
        seen.delete(item);
        return true;
    };
    try { return visit(value, 0); } catch { return false; }
}
/** Validate a native graph without reading or mutating host state. */
export function validateWorkflow(graph, { phase } = {}) {
    if (!safeWorkflowData(graph) || !record(graph) || !record(graph.nodes) || !record(graph.wires) || (graph.groups !== undefined && !record(graph.groups))) return fail('MALFORMED_WORKFLOW', 'Expected a bounded plain workflow graph.');
    if (graph.schema !== 2 || graph.runtime !== 1) return fail('UNSUPPORTED_VERSION', 'This workflow requires schema 2 and runtime 1.');
    if (graph.name !== undefined && typeof graph.name !== 'string') return fail('INVALID_SETTINGS', 'Workflow name must be text.');
    const bindingValid = binding => record(binding) && ['profileId', 'model'].every(key => binding[key] === undefined || binding[key] === null || typeof binding[key] === 'string');
    if (!record(graph.roles ?? {}) || Object.values(graph.roles ?? {}).some(binding => !bindingValid(binding))) return fail('INVALID_SETTINGS', 'Workflow roles must contain valid profile/model bindings.');
    const allNodes = Object.values(graph.nodes), wires = Object.values(graph.wires);
    const nodes = allNodes.filter(node => node?.type !== 'note');
    if (allNodes.length > 1000 || wires.length > 2000 || allNodes.some(node => !record(node) || typeof node.id !== 'string' || graph.nodes[node.id] !== node) || wires.some(wire => !record(wire) || typeof wire.id !== 'string' || graph.wires[wire.id] !== wire)) return fail('MALFORMED_WORKFLOW', 'Invalid block or wire identity.');
    for (const [id, group] of Object.entries(graph.groups ?? {})) {
        if (!record(group) || group.id !== id) return fail('INVALID_GROUP', 'Invalid group identity.');
        if (group.component !== undefined && (!record(group.component) || group.component.id !== 'ai-de-slop' || group.component.version !== 1)) return fail('UNSUPPORTED_COMPONENT', 'This formation requires a supported component version.');
        if (group.component && (typeof group.entry !== 'string' || typeof group.exit !== 'string' || !Array.isArray(group.members))) return fail('INVALID_GROUP', 'Components require entry, exit, and member block IDs.');
        for (const key of ['entry', 'exit']) {
            if (group[key] !== undefined && (typeof group[key] !== 'string' || !Object.hasOwn(graph.nodes, group[key]))) return fail('INVALID_GROUP', 'Formation entry and exit must reference saved block IDs.');
        }
        if (group.members !== undefined && (!Array.isArray(group.members) || group.members.some(member => typeof member !== 'string' || !Object.hasOwn(graph.nodes, member)) || new Set(group.members).size !== group.members.length)) return fail('INVALID_GROUP', 'Formation members must reference distinct saved block IDs.');
        if (group.component) {
            const members = new Set(group.members);
            if (!members.has(group.entry) || !members.has(group.exit)) return fail('INVALID_GROUP', 'Component entry and exit must be member block IDs.');
            if (group.members.some(member => graph.nodes[member].inGroup !== id) || allNodes.some(node => node.inGroup === id && !members.has(node.id))) return fail('INVALID_GROUP', 'Component members must match canvas group membership.');
        }
    }
    for (const node of allNodes) if (node.inGroup !== undefined && (typeof node.inGroup !== 'string' || !Object.hasOwn(graph.groups ?? {}, node.inGroup))) return fail('INVALID_GROUP', 'A block refers to a missing group.', node.id);
    for (const node of nodes) {
        if (!bindingValid(node) || (node.modelRole !== undefined && node.modelRole !== null && typeof node.modelRole !== 'string')) return fail('INVALID_SETTINGS', 'Invalid node model binding.', node.id);
        const operation = operationFor(node);
        if (!operation || (node.operationVersion !== undefined && node.operationVersion !== 1)) return fail('UNKNOWN_OPERATION', 'Unknown workflow operation or version.', node.id);
        for (const [key, fallback] of Object.entries(operation.defaults)) {
            const value = node[key] === undefined ? fallback : node[key];
            if (typeof fallback === 'string' && typeof value !== 'string' || typeof fallback === 'boolean' && typeof value !== 'boolean' || Array.isArray(fallback) && (!Array.isArray(value) || value.some(item => typeof item !== 'string' && !(key === 'rules' && record(item))))) return fail('INVALID_SETTINGS', `Invalid ${key}.`, node.id);
            const choices = key === 'method' ? ['select', 'compress'] : key === 'scope' ? ['whole', 'narration', 'dialogue'] : key === 'mode' ? (node.operation === 'repair' ? ['repair', 'scan'] : ['literal']) : null;
            if (choices && !choices.includes(value)) return fail('INVALID_SETTINGS', `Invalid ${key}.`, node.id);
            if (typeof fallback === 'number' && (!Number.isSafeInteger(value) || value < (key === 'keepRecent' ? 0 : 1) || value > (key === 'keepRecent' ? 1000 : 65536))) return fail('INVALID_SETTINGS', `Invalid ${key}.`, node.id);
        }
    }
    if (!['native-pre', 'native-post'].includes(graph.mode) || (phase && graph.mode !== 'native-' + phase) || nodes.some(node => operationFor(node).phase !== graph.mode.slice(7))) return fail('WRONG_PHASE', 'The workflow operation does not support this phase.');
    for (const wire of wires) if (typeof wire.from !== 'string' || typeof wire.to !== 'string' || !Number.isSafeInteger(wire.order) || wire.order < 0 || wire.loop || wire.port || (wire.kind !== undefined && !['append', 'prepend', 'merge'].includes(wire.kind))) return fail('INVALID_WIRE', 'Native wires require nonnegative order and direct artifact flow.');
    for (const wire of wires) if (!graph.nodes[wire.from] || !graph.nodes[wire.to]) return fail('DANGLING_WIRE', 'A wire refers to a missing block.');
    for (const wire of wires) if (!operationFor(graph.nodes[wire.from]) || !operationFor(graph.nodes[wire.to])) return fail('ARTIFACT_KIND', 'Notes are annotations and carry no artifacts.');
    const terminals = nodes.filter(node => operationFor(node).terminal);
    if (!terminals.length) return fail('MISSING_TERMINAL', 'Add Guidance or Apply Reply to finish the workflow.');
    const orderedNodes = [], visited = new Set(), visiting = new Set();
    let cycle = false;
    const visit = node => {
        if (visiting.has(node.id)) { cycle = true; return; }
        if (visited.has(node.id)) return;
        visiting.add(node.id);
        for (const wire of wires.filter(w => w.to === node.id).sort((a, b) => a.order - b.order)) visit(graph.nodes[wire.from]);
        visiting.delete(node.id); visited.add(node.id); orderedNodes.push(node);
    };
    for (const node of nodes) visit(node);
    if (cycle) return fail('CYCLE', 'Workflow wires contain a cycle.');
    orderedNodes.length = 0; visited.clear();
    for (const node of terminals) visit(node);
    for (const wire of wires) if (operationFor(graph.nodes[wire.from]).output !== operationFor(graph.nodes[wire.to]).input || operationFor(graph.nodes[wire.from]).terminal || !operationFor(graph.nodes[wire.to]).input) return fail('ARTIFACT_KIND', 'These operations carry incompatible artifacts.');
    for (const node of nodes) if (wires.filter(w => w.to === node.id).length > 1) return fail('AMBIGUOUS_INPUT', 'An operation accepts one primary artifact input.', node.id);
    for (const node of orderedNodes) if (node.enabled === false || graph.groups?.[node.inGroup]?.enabled === false) return fail('DISABLED_OPERATION', 'Disabled workflow operations cannot be bypassed.', node.id);
    for (const node of orderedNodes) if (operationFor(node).input && !wires.some(w => w.to === node.id)) return fail('MISSING_INPUT', 'Connect the required input artifact.', node.id);
    const callBound = orderedNodes.reduce((sum, node) => { const bound = operationFor(node).requestBound; return sum + (typeof bound === 'function' ? bound(node) : bound); }, 0);
    const requiredRoles = [...new Set(orderedNodes.filter(node => {
        const bound = operationFor(node).requestBound;
        return (typeof bound === 'function' ? bound(node) : bound) > 0;
    }).map(node => node.modelRole ?? operationFor(node).modelRole).filter(Boolean))];
    return { ok: true, data: { orderedNodes, callBound, requiredRoles } };
}
