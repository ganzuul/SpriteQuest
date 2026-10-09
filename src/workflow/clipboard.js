import { safeWorkflowData } from './contracts.js?v=0.20.0';
import { cloneWorkflowDocument } from './document.js?v=0.20.0';
import { operationFor } from './catalog.js?v=0.20.0';
import { definitionRefKey } from './definition-data.js?v=0.20.0';
import { exportWorkflow, parseWorkflow, selectSubgraphClosure } from './packages.js?v=0.20.0';
import { prepareWorkflowInsertion } from './insertion.js?v=0.20.0';

const fail = (message, code = 'INVALID_CLIPBOARD') => ({ ok: false, error: { code, message } });

/** A portable current fragment. Host I/O and transactions belong to the controller. */
export function makeClip(graph, selection = {}) {
    if (!safeWorkflowData(selection) || !selection || Array.isArray(selection)) return fail('Expected a plain clipboard selection.');
    for (const key of ['nodeIds', 'groupIds']) if (selection[key] !== undefined && (!Array.isArray(selection[key]) || selection[key].some(id => typeof id !== 'string'))) return fail('Expected selected node and group IDs.');
    const cloned = cloneWorkflowDocument(graph); if (!cloned.ok) return cloned;
    const source = cloned.data, nodes = new Set(selection.nodeIds ?? []), groups = new Set(selection.groupIds ?? []);
    for (const id of groups) {
        if (!Object.hasOwn(source.groups, id)) return fail('A selected group no longer exists.');
        for (const member of source.groups[id].members ?? []) nodes.add(member);
    }
    for (const node of Object.values(source.nodes)) if (groups.has(node.inGroup)) nodes.add(node.id);
    if (!nodes.size || [...nodes].some(id => !Object.hasOwn(source.nodes, id))) return fail('Select current workflow nodes to copy.');
    const fragment = { ...source, nodes: {}, wires: {}, groups: {}, portals: {}, roles: {}, definitions: {} };
    for (const id of nodes) {
        const node = source.nodes[id]; fragment.nodes[id] = node;
        if (!groups.has(node.inGroup)) delete node.inGroup;
        const role = node.modelRole ?? operationFor(node)?.modelRole;
        if (role && Object.hasOwn(source.roles, role)) fragment.roles[role] = source.roles[role];
        if (node.type === 'subgraph') {
            const key = definitionRefKey(node.definition), definition = source.definitions[key];
            if (!definition) return fail('The selected instance is missing its pinned definition.');
            const closure = selectSubgraphClosure(definition, source.definitions); if (!closure.ok) return closure;
            fragment.definitions[key] = closure.data.definition;
            Object.assign(fragment.definitions, closure.data.definitions);
        }
    }
    for (const [id, portal] of Object.entries(source.portals)) if (nodes.has(portal.source.nodeId)) fragment.portals[id] = portal;
    for (const [id, wire] of Object.entries(source.wires)) {
        if (!nodes.has(wire.to)) continue;
        if (wire.route === 'portal' ? Object.hasOwn(fragment.portals, wire.portalId) : nodes.has(wire.from)) fragment.wires[id] = wire;
    }
    for (const id of groups) {
        const group = source.groups[id];
        if (Array.isArray(group.members)) group.members = group.members.filter(id => nodes.has(id));
        for (const key of ['entry', 'exit']) if (group[key] && !nodes.has(group[key])) delete group[key];
        fragment.groups[id] = group;
    }
    try { return { ok: true, data: exportWorkflow(fragment) }; }
    catch (error) { return fail(error.message); }
}

/** Only current portable envelopes are admissible; never inspect unsafe objects. */
export function readClip(textOrEnvelope) {
    if (typeof textOrEnvelope !== 'string' && !safeWorkflowData(textOrEnvelope)) return fail('Expected bounded plain clipboard data.');
    let text;
    try { text = typeof textOrEnvelope === 'string' ? textOrEnvelope : JSON.stringify(textOrEnvelope); }
    catch { return fail('Expected portable clipboard JSON.'); }
    const parsed = parseWorkflow(text); if (!parsed.ok) return parsed;
    try { return { ok: true, data: exportWorkflow(parsed.data) }; }
    catch (error) { return fail(error.message); }
}

/** Prepare a detached insertion for a single captured edit and undo transaction. */
export function prepareClipPaste(destination, envelope, options = {}) {
    const clip = readClip(envelope); if (!clip.ok) return clip;
    return prepareWorkflowInsertion(destination, clip.data.graph, options);
}
