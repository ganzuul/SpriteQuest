import { phaseForNode, portsForNode } from '../../src/workflow/catalog.js';

const lifecycle = new Set(['on-send', 'generate-reply', 'review-publish']);
const intersects = (operations, choices) => choices.some(operation => operations.has(operation));
function purpose(nodes, phase, actorName) {
    if (actorName) return `Prepare ${actorName}'s private reflection`;
    const operations = new Set(nodes.map(node => node.operation));
    if (intersects(operations, ['write-file', 'commit-clock', 'commit-outcomes']) || nodes.some(node => node.operation === 'memory' && node.mode === 'commit')) return 'Update saved story data';
    if (intersects(operations, ['time-trigger', 'advance-time'])) return 'Plan scheduled story events';
    if (intersects(operations, ['random-pick', 'saved-outcome', 'effect-author', 'stage-outcome'])) return 'Choose an item effect';
    if (intersects(operations, ['prompted-memory', 'recall', 'reflect', 'memory'])) return 'Recall character memories';
    if (intersects(operations, ['event-normalize', 'confirm-events', 'item-use-trigger', 'draft-event-source', 'player-event-source'])) return 'Check story event evidence';
    if (operations.has('revise-draft')) return intersects(operations, ['render-notes', 'append']) ? 'Polish and annotate the reply' : 'Polish the reply';
    if (intersects(operations, ['render-notes', 'append'])) return 'Annotate the reply';
    if (operations.has('response-plan')) return 'Plan the scene';
    if (intersects(operations, ['character-direction', 'actor-context', 'scene-presence'])) return 'Prepare character reactions';
    if (intersects(operations, ['scene-context', 'context-join', 'smart-compactor', 'read-file'])) return 'Prepare scene context';
    return phase === 'post' ? 'Process reply details' : 'Prepare reply guidance';
}

/** Lay out authored examples without changing their connections or operation settings. */
export function layout(graph) {
    const nodes = Object.values(graph.nodes).filter(node => node.type !== 'note');
    const byId = new Map(nodes.map(node => [node.id, node]));
    const edges = Object.values(graph.wires).map(wire => ({
        from: wire.route === 'portal' ? graph.portals?.[wire.portalId]?.source?.nodeId : wire.from,
        to: wire.to,
    }));
    const parents = new Map(nodes.map(node => [node.id, []]));
    for (const edge of edges) {
        if (!byId.has(edge.from) || !byId.has(edge.to)) throw new Error('Cannot lay out a wire with a missing box');
        parents.get(edge.to).push(edge.from);
    }
    const pending = new Set(byId.keys()), levels = new Map(), stages = new Map();
    while (pending.size) {
        let progressed = false;
        for (const id of [...pending]) {
            const inputs = parents.get(id);
            if (!inputs.every(parent => levels.has(parent))) continue;
            levels.set(id, Math.max(0, ...inputs.map(parent => levels.get(parent) + 1)));
            const node = byId.get(id);
            // Some operations support both phases. Their incoming generation
            // dependencies determine where they belong in the reading order.
            stages.set(id, node.operation === 'generate-reply' || phaseForNode(graph, node) === 'post' || node.phase === 'post' || inputs.some(parent => stages.get(parent) === 'post') ? 'post' : 'pre');
            pending.delete(id);
            progressed = true;
        }
        if (!progressed) throw new Error('Cannot lay out cyclic graph');
    }
    for (const node of nodes) {
        delete node.inGroup;
        node.x = 100 + levels.get(node.id) * 360;
        node.w = 300;
        const pins = portsForNode(graph, node);
        node.h = Math.max(210, 100 + Math.max(pins.filter(pin => pin.direction === 'input').length, pins.filter(pin => pin.direction === 'output').length) * 32);
    }
    graph.groups = {};
    const helper = nodes.some(node => ['subgraph-input', 'subgraph-output'].includes(node.type));
    const components = [];
    if (!helper && nodes.length > 8) {
        // Paired actor perspectives share evidence, but each actor's private
        // reflection is a separate system worth inspecting on its own.
        const actorContexts = nodes.filter(node => node.operation === 'actor-context' && node.id.endsWith('-context'));
        const actorBranches = actorContexts.length > 1 ? actorContexts.map(node => {
            const prefix = node.id.slice(0, -'-context'.length);
            return { prefix, name: prefix.replace(/(^|-)([a-z])/g, (_, separator, letter) => (separator ? ' ' : '') + letter.toUpperCase()) };
        }) : [];
        const branchFor = id => actorBranches.find(branch => id.startsWith(branch.prefix + '-'));
        const eligible = new Set(nodes.filter(node => !lifecycle.has(node.operation)).map(node => node.id));
        const neighbors = new Map([...eligible].map(id => [id, []]));
        for (const { from, to } of edges) if (eligible.has(from) && eligible.has(to) && stages.get(from) === stages.get(to) && branchFor(from) === branchFor(to)) {
            neighbors.get(from).push(to);
            neighbors.get(to).push(from);
        }
        while (eligible.size) {
            const first = eligible.values().next().value, ids = [], queue = [first];
            eligible.delete(first);
            while (queue.length) {
                const id = queue.shift();
                ids.push(id);
                for (const neighbor of neighbors.get(id)) if (eligible.delete(neighbor)) queue.push(neighbor);
            }
            if (ids.length >= 2) components.push({ nodes: ids.map(id => byId.get(id)), phase: stages.get(first), actorName: branchFor(first)?.name });
        }
    }
    const grouped = new Set(components.flatMap(component => component.nodes.map(node => node.id)));
    const free = nodes.filter(node => !grouped.has(node.id));
    // Each complete processing group has its own band. Ungrouped lifecycle
    // boxes stay together above them, so no frame surrounds unrelated work.
    const bands = [...(free.length ? [{ nodes: free }] : []), ...components.sort((a, b) => (a.phase === 'pre' ? 0 : 1) - (b.phase === 'pre' ? 0 : 1))];
    const commentBottom = Math.max(0, ...Object.values(graph.nodes).filter(node => node.type === 'note').map(node => node.y + node.h));
    let bandTop = Math.max(240, commentBottom + 80);
    for (const band of bands) {
        const columns = new Map();
        for (const node of band.nodes) {
            node.y = columns.get(node.x) ?? bandTop;
            columns.set(node.x, node.y + node.h + 80);
        }
        const bottom = Math.max(...band.nodes.map(node => node.y + node.h));
        if (band.phase) {
            const id = 'processing-' + band.nodes[0].id;
            const x = Math.min(...band.nodes.map(node => node.x)) - 25;
            const y = Math.min(...band.nodes.map(node => node.y)) - 50;
            const right = Math.max(...band.nodes.map(node => node.x + node.w)) + 25;
            const title = purpose(band.nodes, band.phase, band.actorName);
            graph.groups[id] = {
                id, title, description: 'These connected boxes work together. Follow their wires to see how each result is used.',
                x, y, w: right - x, h: bottom + 25 - y, collapsed: false,
                members: band.nodes.map(node => node.id), color: band.phase === 'pre' ? '#284e67' : '#57416e',
            };
            for (const node of band.nodes) node.inGroup = id;
        }
        bandTop = bottom + (band.phase ? 25 : 0) + 130;
    }
}
