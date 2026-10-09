import { safeWorkflowData } from './contracts.js?v=0.19.1';
import { graphDocumentSignature } from './ports.js?v=0.19.1';

const fail = (code, message) => ({ ok: false, error: { code, message } });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const TYPES = new Set(['prompt', 'st', 'history', 'injection', 'generate', 'output', 'note', 'decider', 'lorebook', 'state', 'memory']);
const KINDS = new Set(['append', 'prepend', 'merge', 'together', 'save', 'sequence']);
const idList = values => Array.isArray(values) && values.every(value => record(value) && typeof value.id === 'string' && value.id.length) && new Set(values.map(value => value.id)).size === values.length;

/** @typedef {{schema?:1, nodes:Record<string,Record<string,unknown>>, wires:Record<string,Record<string,unknown>>, groups?:Record<string,Record<string,unknown>>} & Record<string,unknown>} LegacyInsertionGraph */

// Key/value/stage IDs are local to their owning node; preserve them and their wire.port strings.
function legacyPorts(node) {
    if (node.type === 'decider') {
        if (!Array.isArray(node.keys ?? [])) return null;
        const keys = [...(node.keys ?? []), ...(node.fallback ? [node.fallback] : [])];
        return idList(keys) ? new Set(keys.map(key => key.id)) : null;
    }
    if (node.type === 'state') {
        if (!idList(node.values ?? [])) return null;
        const ports = new Set();
        for (const value of node.values ?? []) {
            if (value.id.includes(':') || !Array.isArray(value.stages ?? []) || !Array.isArray(value.rules ?? [])) return null;
            ports.add(value.id);
            if (value.stageDots) {
                if (!idList(value.stages ?? [])) return null;
                for (const stage of value.stages ?? []) ports.add(`${value.id}:${stage.id}`);
            }
        }
        return ports;
    }
    return new Set();
}

/**
 * Narrow authoring boundary for additive legacy fragments; never compiles or executes.
 * Mirrors saved shape constraints from state.connect/outPorts/migrateGraph without host imports.
 * @param {unknown} graph
 * @returns {import('./types').Result<import('./types').StructureDiagnostics>}
 */
export function validateLegacyInsertionGraph(graph) {
    if (!safeWorkflowData(graph) || !record(graph) || !record(graph.nodes) || !record(graph.wires ?? {}) || !record(graph.groups ?? {})) return fail('MALFORMED_WORKFLOW', 'Expected bounded plain legacy graph containers.');
    if (graph.schema !== undefined && graph.schema !== 1 || graph.runtime !== undefined) return fail('UNSUPPORTED_VERSION', 'This legacy fragment requires schema 1 or an unversioned historical graph.');
    if (['portals', 'definitions'].some(key => graph[key] !== undefined && (!record(graph[key]) || Object.keys(graph[key]).length))) return fail('UNSUPPORTED_COMPOSITION', 'Native composition records are not legacy fragments.');
    if (Object.keys(graph.nodes).length > 1000 || Object.keys(graph.wires ?? {}).length > 2000) return fail('GRAPH_LIMIT', 'An inserted graph may contain at most 1000 blocks and 2000 wires.');
    if (Object.values(graph.nodes).filter(node => node?.type === 'output').length > 1) return fail('DUPLICATE_OUTPUT', 'A legacy graph has one Output. Open separately, or import a fragment without Output.');
    const ports = new Map();
    for (const [id, node] of Object.entries(graph.nodes)) {
        if (!id || !record(node) || node.id !== id || !TYPES.has(node.type)) return fail('INVALID_NODE', 'Expected a known legacy block with its saved identity.');
        const pins = legacyPorts(node);
        if (!pins) return fail('INVALID_PORT', 'Legacy keys, values and exposed stages require distinct saved IDs.');
        ports.set(id, pins);
        if (node.inGroup !== undefined && (typeof node.inGroup !== 'string' || !Object.hasOwn(graph.groups ?? {}, node.inGroup))) return fail('INVALID_GROUP', 'A legacy block refers to a missing group.');
    }
    const forward = new Map(Object.keys(graph.nodes).map(id => [id, []]));
    for (const [id, wire] of Object.entries(graph.wires ?? {})) {
        if (!id || !record(wire) || wire.id !== id || typeof wire.from !== 'string' || typeof wire.to !== 'string' || !Object.hasOwn(graph.nodes, wire.from) || !Object.hasOwn(graph.nodes, wire.to)) return fail('DANGLING_WIRE', 'A legacy wire must reference saved blocks.');
        if (!KINDS.has(wire.kind) || wire.from === wire.to || wire.mode !== undefined && !['send', 'activate', 'result'].includes(wire.mode) || wire.route !== undefined || wire.fromPort !== undefined || wire.toPort !== undefined || wire.portalId !== undefined) return fail('INVALID_WIRE', 'Expected an established legacy wire kind and mode.');
        const source = graph.nodes[wire.from], target = graph.nodes[wire.to];
        if (source.type === 'output' || source.type === 'note' || target.type === 'note') return fail('INVALID_WIRE', 'Output cannot send, and notes do not carry prompt text.');
        if (['decider', 'state'].includes(source.type) ? typeof wire.port !== 'string' || !ports.get(source.id).has(wire.port) : wire.port !== undefined && wire.port !== null && wire.port !== '') return fail('INVALID_PORT', 'A legacy keyed wire must name a saved output key, value or exposed stage.');
        if (wire.kind === 'save' && (target.type !== 'memory' || !['generate', 'decider'].includes(source.type)) || target.type === 'memory' && wire.kind !== 'save') return fail('INVALID_WIRE', 'Memory accepts Save wires from Generate or Decider outputs.');
        if (wire.kind === 'together' && (source.type !== 'generate' || target.type !== 'generate')) return fail('INVALID_WIRE', 'Together ties require two Generate blocks.');
        if (wire.loop !== undefined && (!record(wire.loop) || !['generate', 'decider'].includes(source.type) || ['save', 'together'].includes(wire.kind) || !['string', 'number'].includes(typeof wire.loop.max) || !Number.isFinite(Number(wire.loop.max)) || Number(wire.loop.max) <= 0 || wire.loop.stopWhenSame !== undefined && typeof wire.loop.stopWhenSame !== 'boolean')) return fail('INVALID_LOOP', 'A legacy loop requires a bounded Generate or Decider return wire.');
        if (!['save', 'together'].includes(wire.kind) && !wire.loop) forward.get(wire.from).push(wire.to);
    }
    for (const node of Object.values(graph.nodes)) if (node.type === 'decider') {
        for (const key of node.keys ?? []) {
            if (!Array.isArray(key.conditions ?? [])) return fail('INVALID_DECIDER_INPUT', 'Decider rules require a saved list of conditions.');
            for (const condition of key.conditions ?? []) {
                // Empty/absent means all inputs together; every selected input is a wire ID.
                if (!condition?.input) continue;
                const wire = typeof condition.input === 'string' && Object.hasOwn(graph.wires ?? {}, condition.input) ? graph.wires[condition.input] : null;
                if (!wire || wire.to !== node.id || wire.mode === 'activate' || wire.loop) return fail('INVALID_DECIDER_INPUT', 'A selected Decider incoming wire is missing or cannot supply text. Include that incoming wire, choose all inputs together, or Open separately.');
            }
        }
    }
    for (const [id, group] of Object.entries(graph.groups ?? {})) {
        if (!id || !record(group) || group.id !== id || group.component !== undefined) return fail('INVALID_GROUP', 'Expected a saved legacy group identity.');
        for (const key of ['entry', 'exit']) if (group[key] !== undefined && (typeof group[key] !== 'string' || !Object.hasOwn(graph.nodes, group[key]))) return fail('INVALID_GROUP', 'Group endpoints must reference saved blocks.');
        if (group.members !== undefined && (!Array.isArray(group.members) || group.members.some(member => typeof member !== 'string' || !Object.hasOwn(graph.nodes, member)) || new Set(group.members).size !== group.members.length)) return fail('INVALID_GROUP', 'Group members must reference distinct saved blocks.');
    }
    const visited = new Set(), visiting = new Set();
    const visit = id => {
        if (visiting.has(id)) return false;
        if (visited.has(id)) return true;
        visiting.add(id);
        for (const next of forward.get(id)) if (!visit(next)) return false;
        visiting.delete(id); visited.add(id);
        return true;
    };
    if ([...forward.keys()].some(id => !visit(id))) return fail('CYCLE', 'Legacy return paths require explicit bounded loop wires.');
    return { ok: true, data: { nodeCount: Object.keys(graph.nodes).length, wireCount: Object.keys(graph.wires ?? {}).length } };
}

/** Clone only; explicitly opt into shipped compatibility rules for the imported side. */
export function normalizeLegacyInsertionGraph(graph, { compatibility = false } = {}) {
    const validation = validateLegacyInsertionGraph(graph);
    if (!validation.ok) return validation;
    const copy = structuredClone(graph);
    copy.wires ??= {};
    copy.groups ??= {};
    // Match the shipped historical migration for imported data only. Recipient data is untouched.
    if (compatibility && copy.migrated !== 3) {
        if (!copy.migrated) for (const wire of Object.values(copy.wires)) if (wire.kind === 'sequence') wire.kind = 'merge';
        for (const node of Object.values(copy.nodes)) {
            if (node.group && Object.hasOwn(copy.groups, node.group) && node.inGroup === undefined) {
                node.inGroup = node.group;
                delete node.group;
            }
        }
    }
    return { ok: true, data: copy };
}

/** Conservative legacy precondition; this is deliberately NOT a native semantic signature. */
export const legacyInsertionSignature = graphDocumentSignature;

export function legacyInsertionDiagnostics(candidate, added, destination) {
    const output = Object.values(destination.nodes).find(node => node.type === 'output');
    const clampPasses = (value, max) => Math.max(1, Math.min(max, Math.round(['number', 'string'].includes(typeof value) ? Number(value) || 1 : 1)));
    const calls = node => {
        const groupId = node.inGroup ?? (Object.hasOwn(candidate.groups ?? {}, node.group) ? node.group : null);
        if (node.enabled === false || candidate.groups?.[groupId]?.enabled === false) return 0;
        if (node.type === 'generate') return clampPasses(node.repeat, 10);
        if (node.type !== 'decider' || [null, '', 'random'].includes(node.mode)) return 0;
        if (node.mode === 'ai') return node.keys?.length ? 1 : 0;
        return (node.keys ?? []).flatMap(key => Array.isArray(key.conditions) ? key.conditions : []).filter(rule => rule?.mode === 'ai' && typeof rule.question === 'string' && rule.question.trim()).reduce((sum, rule) => sum + (rule.engine === 'jev' ? 1 : 2), 0);
    };
    // Use the shipped pass/loop caps, deliberately overcounting branch/loop reach.
    // No compiler, model/profile resolution, prompt collection or scheduler is invoked.
    const bound = (nodes, wires) => nodes.reduce((sum, node) => sum + calls(node), 0) * (1 + wires.filter(wire => wire.loop).reduce((sum, wire) => sum + clampPasses(wire.loop.max, 20), 0));
    const nodes = added.nodes.map(id => candidate.nodes[id]);
    const wires = added.wires.map(id => candidate.wires[id]);
    const requests = nodes.filter(node => calls(node) > 0);
    const saves = [...new Set(wires.filter(wire => wire.kind === 'save').map(wire => wire.to))];
    return { phase: 'legacy', requiredRoles: [], unresolvedBindings: [], bindingReviewRequired: requests.length > 0,
        inheritedBindings: requests.filter(node => !node.profileId || !node.model).map(node => node.id),
        terminals: [...nodes.filter(node => node.type === 'output').map(node => ({ nodeId: node.id, operation: 'output' })), ...saves.map(nodeId => ({ nodeId, operation: 'save-memory' }))],
        boundKind: 'conservative', callBound: bound(Object.values(candidate.nodes), Object.values(candidate.wires)), importedCallBound: bound(nodes, wires), recipientOutputPreserved: output?.id ?? null,
    };
}
