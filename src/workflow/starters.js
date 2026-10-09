import { operationDefaults } from './catalog.js?v=0.22.1';
export const STARTERS = [
    { id: 'native-guidance', version: 1, title: 'Scene guidance', purpose: 'Shape scene direction while SillyTavern writes the reply.', phase: 'pre', roles: ['Analysis'], callBound: 2, operations: ['scene-context', 'smart-compactor', 'response-plan', 'guidance'] },
    { id: 'reviewed-de-slop', version: 1, title: 'Reviewed AI De-slop', purpose: 'Find literal patterns and review a bounded repair before applying.', phase: 'post', roles: ['Prose'], callBound: 1, operations: ['reply-snapshot', 'pattern-scan', 'repair', 'validate-patches', 'review-gate', 'apply-reply'] },
    { id: 'literal-cleanup', version: 1, title: 'Literal cleanup', purpose: 'Try a small literal replacement without a model call, then review before applying.', phase: 'post', roles: [], callBound: 0, operations: ['reply-snapshot', 'text-rules', 'validate-patches', 'review-gate', 'apply-reply'] },
    { id: 'structured-guidance', version: 1, title: 'Structured guidance', purpose: 'Read JSON, select fields and compose optional guidance without a model call.', phase: 'pre', roles: [], callBound: 0, operations: ['compose', 'json-decode', 'select-fields', 'compose', 'guidance'] },
];
/** Canonical versioned definitions also generate the literal portable packages. */
export function starterGraph(id) {
    const starter = STARTERS.find(item => item.id === id);
    if (!starter) throw new Error('Unknown workflow starter.');
    return workspaceStarter(starter);
}
function workspaceStarter(starter) {
    const graph = { id: starter.id, name: starter.title, schema: 3, runtime: 2, mode: 'native-' + starter.phase, template: { id: starter.id, version: starter.version }, roles: Object.fromEntries(starter.roles.map(role => [role, { profileId: null, model: null }])), nodes: {}, wires: {}, portals: {}, definitions: {}, groups: {}, view: { x: 0, y: 0, zoom: 1 } };
    const ids = starter.id === 'structured-guidance' ? ['compose-json', 'json-decode', 'select-fields', 'compose-guidance', 'guidance'] : starter.operations;
    for (const [i, operation] of starter.operations.entries()) {
        const nodeId = ids[i];
        graph.nodes[nodeId] = { ...operationDefaults(operation), id: nodeId, type: 'workflow', operationVersion: 1, enabled: true, x: 100 + i * (starter.roles.length ? 310 : 230), y: 140, w: 260 };
        if (i) graph.wires['wire-' + i] = { id: 'wire-' + i, route: 'wire', from: ids[i - 1], fromPort: 'out', to: nodeId, toPort: nodeId === 'compose-guidance' ? 'data' : 'in' };
    }
    if (starter.id === 'literal-cleanup') {
        graph.nodes['text-rules'].inputKind = 'draft';
        graph.nodes['text-rules'].rules = [{ kind: 'literal', pattern: 'very very', replacement: 'very', flags: '' }];
    } else if (starter.id === 'native-guidance') {
        graph.nodes['smart-compactor'].method = 'compress';
        graph.nodes['response-plan'].instructions = 'Suggest scene direction and actor intentions. Preserve user agency; proposals are not established events.';
    } else if (starter.id === 'reviewed-de-slop') {
        const members = ['pattern-scan', 'repair', 'validate-patches'];
        graph.groups['ai-de-slop'] = { id: 'ai-de-slop', title: 'AI De-slop', collapsed: true, x: 410, y: 140, w: 260, members };
        for (const member of members) graph.nodes[member].inGroup = 'ai-de-slop';
        graph.nodes['pattern-scan'].rules = ['a testament to', 'delve', 'tapestry'];
    } else {
        graph.nodes['compose-json'].sections = [{ name: 'Scene', text: JSON.stringify({ direction: 'A quiet conversation.', constraint: 'Let the user choose their next action.' }, null, 2) }];
        graph.nodes['select-fields'].fields = [{ name: 'direction', path: ['direction'] }, { name: 'constraint', path: ['constraint'] }];
        Object.assign(graph.nodes['compose-guidance'], { mode: 'template', outputKind: 'guidance', template: 'Direction: {{data:/direction}}\nConstraint: {{data:/constraint}}' });
    }
    return graph;
}
/** Installation only adds independent data. Phase assignment and arming are explicit. */
export function installStarter(id, settings) {
    const graph = starterGraph(id), suffix = globalThis.crypto?.randomUUID?.() ?? String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    const ids = Object.fromEntries(Object.keys(graph.nodes).map(nodeId => [nodeId, nodeId + '-' + suffix]));
    graph.nodes = Object.fromEntries(Object.values(graph.nodes).map(node => { node.id = ids[node.id]; if (node.inGroup) node.inGroup += '-' + suffix; return [node.id, node]; }));
    graph.wires = Object.fromEntries(Object.values(graph.wires).map(wire => { wire.id += '-' + suffix; wire.from = ids[wire.from]; wire.to = ids[wire.to]; return [wire.id, wire]; }));
    graph.groups = Object.fromEntries(Object.values(graph.groups).map(group => { group.id += '-' + suffix; group.members = group.members.map(member => ids[member]); return [group.id, group]; }));
    graph.id += '-' + suffix; graph.createdAt = graph.updatedAt = Date.now();
    settings.graphs ??= {}; settings.graphs[graph.id] = graph;
    return graph;
}
