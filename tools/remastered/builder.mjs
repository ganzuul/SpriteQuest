import { GUIDE } from './guide.mjs';
import { OPERATIONS, operationDefaults, portsForNode, describeOperation } from '../../src/workflow/catalog.js';
import { validateWorkflow } from '../../src/workflow/contracts.js';
import { exportWorkflow, parseWorkflow } from '../../src/workflow/packages.js';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../../src/workflow/definitions.js';
import { prepareWorkflowPlanner } from '../../src/workflow/resolve.js';
export const must = (r, label) => {
    if (!r.ok)
        throw Error(`${label}: ${JSON.stringify(r.error)}`);
    return r.data;
};
export function layout(graph) {
    const nodes = Object.values(graph.nodes).filter(n => n.type !== 'note'), levels = new Map(), pending = new Set(nodes.map(n => n.id));
    for (let round = 0; pending.size && round < 1000; round++)
        for (const id of [...pending]) {
            const parents = Object.values(graph.wires).filter(w => w.to === id).map(w => w.from);
            if (parents.every(p => levels.has(p))) {
                levels.set(id, Math.max(0, ...parents.map(p => levels.get(p) + 1)));
                pending.delete(id);
            }
        }
    if (pending.size)
        throw Error('Cannot lay out cyclic graph');
    const rows = {};
    for (const n of nodes) {
        const col = levels.get(n.id), row = rows[col] ?? 0;
        rows[col] = row + 1;
        n.x = 100 + col * 360;
        n.y = 240 + row * 320;
        n.w = 300;
        const pins = portsForNode(graph, n);
        n.h = Math.max(210, 100 + Math.max(pins.filter(p => p.direction === 'input').length, pins.filter(p => p.direction === 'output').length) * 32);
    }
    graph.groups = {};
    if (nodes.length > 6) {
        const buckets = {};
        for (const n of nodes)
            (buckets[levels.get(n.id)] ??= []).push(n);
        for (const [stage, members] of Object.entries(buckets)) {
            const id = 'stage-' + stage;
            for (const n of members)
                n.inGroup = id;
            const title = members.some(n => n.operation === 'generate-reply') ? 'Native generation' : members.some(n => n.operation === 'review-publish' || ['write-file', 'commit-clock', 'commit-outcomes'].includes(n.operation)) ? 'Review / accepted staging' : members.every(n => n.phase === 'post') ? 'Response processing' : 'Preparation / processing';
            const x = Math.min(...members.map(n => n.x)) - 25, y = Math.min(...members.map(n => n.y)) - 50, right = Math.max(...members.map(n => n.x + n.w)) + 25, bottom = Math.max(...members.map(n => n.y + n.h)) + 25;
            graph.groups[id] = {
                id, title, description: 'Stage ' + stage + '. Wires determine execution; folding is presentation only.', x, y, w: right - x, h: bottom - y, collapsed: false, members: members.map(n => n.id), color: title === 'Native generation' ? '#284e67' : '#57416e'
            };
        }
    }
}
export function builder(number, title, goal, focus) {
    const id = `lesson-${String(number).padStart(2, '0')}`, graph = {
        id: `remastered-${id}`, name: `${number}. ${title}`, description: goal, schema: 3, runtime: 2, mode: 'native-unified', template: { id, version: 1 }, nodes: {}, wires: {}, roles: {}, groups: {}, portals: {}, definitions: {}, view: { x: 0, y: 0, zoom: .65 }
    };
    let wire = 0;
    const add = (id, operation, settings = {}, label = '') => {
        const n = {
            ...operationDefaults(operation, settings), ...settings, id, type: 'workflow', enabled: true, alias: label ? `${OPERATIONS[operation].title} · ${label}` : OPERATIONS[operation].title, x: 0, y: 0, w: 300, h: 210
        };
        if (n.modelRole && !graph.roles[n.modelRole])
            graph.roles[n.modelRole] = { profileId: n.profileId, model: null };
        graph.nodes[id] = n;
        return id;
    };
    const connect = (from, fromPort, to, toPort) => {
        const id = `edge-${++wire}`;
        graph.wires[id] = {
            id, route: 'wire', from, fromPort, to, toPort
        };
    };
    add('send', 'on-send');
    add('generate', 'generate-reply');
    add('review', 'review-publish');
    connect('send', 'activation', 'generate', 'activation');
    const r = {
        number, id, title, goal, focus, graph, add, connect, requirements: [], steps: [], experiments: [], cases: [], checkpoints: [], fixtures: {}, budget: '0 auxiliary model requests; one ordinary native generation.', learn: []
    };
    r.data = (id, value, phase = 'pre') => {
        add(id + '-text', 'text', { text: JSON.stringify(value), phase }, 'authored input');
        add(id, 'json-decode', { phase });
        connect(id + '-text', 'out', id, 'in');
        return id;
    };
    r.guidance = (source, port = 'out', text = 'Use this supplied material as context; preserve established facts and player choices.', id = 'guidance') => {
        add(id, 'compose', { outputKind: 'guidance', mode: 'template', template: text + '\n{{data:}}' });
        connect(source, port, id, 'data');
        connect(id, 'out', 'generate', 'guidance');
        return id;
    };
    r.textGuidance = (source, port = 'out', id = 'guidance') => {
        add(id, 'compose', { outputKind: 'guidance', sections: [{ name: 'Material', text: '' }] });
        connect(source, port, id, 'section.Material');
        connect(id, 'out', 'generate', 'guidance');
        return id;
    };
    r.notes = (source, port = 'out', draft = 'generate', draftPort = 'draft', id = 'notes') => {
        add(id, 'render-notes', { title: focus, phase: 'post' });
        connect(source, port, id, 'data');
        add('append', 'append', { sectionId: r.id });
        connect(draft, draftPort, 'append', 'draft');
        connect(id, 'out', 'append', 'section');
        return ['append', 'out'];
    };
    r.summary = (source, port = 'out', draft = 'generate', draftPort = 'draft', id = 'notes') => {
        add(id, 'compose', { phase: 'post', mode: 'template', template: '<details><summary>' + focus + '</summary>\n{{data:}}\n</details>' });
        connect(source, port, id, 'data');
        add('append', 'append', { sectionId: r.id });
        connect(draft, draftPort, 'append', 'draft');
        connect(id, 'out', 'append', 'section');
        return ['append', 'out'];
    };
    r.check = (id, port, expect) => r.checkpoints.push({ node: graph.nodes[id].alias, port, expect });
    r.helper = (id, name, configure, { input = 'data', output = 'data', parameters = [] } = {}) => {
        const body = {
            id: id + '-body', schema: 3, runtime: 2, mode: 'native-unified', nodes: { item: {
                    id: 'item', type: 'subgraph-input', interfacePortId: 'item', enabled: true
                }, result: {
                    id: 'result', type: 'subgraph-output', interfacePortId: 'result', enabled: true
                } }, wires: {}, roles: {}, groups: {}, definitions: {}, portals: {}
        };
        let seq = 0;
        const add = (id, op, settings = {}, label = '') => {
            body.nodes[id] = {
                ...operationDefaults(op, settings), ...settings, id, type: 'workflow', enabled: true, alias: OPERATIONS[op].title + (label ? ' · ' + label : '')
            };
            const n = body.nodes[id];
            if (n.modelRole)
                body.roles[n.modelRole] = { profileId: n.profileId, model: null };
        };
        const c = (from, fromPort, to, toPort) => {
            const id = 'edge-' + ++seq;
            body.wires[id] = {
                id, route: 'wire', from, fromPort, to, toPort
            };
        };
        configure(add, c);
        const definition = {
            id: `remastered-${id}`, version: 1, name, description: 'Pure processor: no host sources, publication, private grants or settlement. Inspect the typed interface and exposed controls.', interface: [{
                    id: 'item', label: 'Item', direction: 'input', kind: input, required: true, cardinality: 'one', boundaryNodeId: 'item'
                }, {
                    id: 'result', label: 'Result', direction: 'output', kind: output, required: false, cardinality: 'one', boundaryNodeId: 'result'
                }], parameters, body
        };
        body.interface = definition.interface;
        layout(body);
        delete body.interface;
        const identity = must(computeDefinitionIdentity(definition), name);
        const snapshot = { ...identity.materializedDefinition, semanticHash: identity.semanticHash };
        graph.definitions[definitionRefKey(snapshot)] = snapshot;
        must(validateDefinition(snapshot, graph.definitions), name);
        return { id: snapshot.id, version: 1, semanticHash: snapshot.semanticHash };
    };
    r.finish = (draft = 'generate', port = 'draft') => {
        connect(draft, port, 'review', 'draft');
        if (!r.checkpoints.length)
            r.check('review', 'draft', 'An owned native Draft is available for deliberate review.');
        const lesson = {
            difficulty: number <= 8 ? 'Foundations' : number <= 17 ? 'Composition' : number <= 26 ? 'Advanced' : 'Capstone', focus, learn: r.learn.length ? r.learn : [focus, 'Trace named artifacts to the owned Draft or accepted proposal.'], requirements: ['Assign this independent copy as Unified and arm Lattice before Send. Ordinary generation uses Active SillyTavern.', ...r.requirements], steps: [`Open ${title} and inspect the named pins.`, ...r.steps, 'Send in a disposable story, inspect checkpoints, then explicitly Apply or Reject. Preview never publishes or settles proposals.'], checkpoints: r.checkpoints, experiments: r.experiments.length ? r.experiments : [{ change: GUIDE[number][2], expect: GUIDE[number][3] }], cases: r.cases.length ? r.cases : [{ when: GUIDE[number][0], expect: GUIDE[number][1] }, { when: 'Rejected or stopped', expect: 'The existing story and staged effects are retained without settlement.' }], callBudget: r.budget
        };
        graph.description = goal + '\n\n' + lesson.requirements.join('\n') + '\n\n' + lesson.steps.join('\n') + '\n\nCalls: ' + lesson.callBudget + '\n' + 'Checkpoints:\n' + lesson.checkpoints.map(c => `${c.node}.${c.port}: ${c.expect}`).join('\n');
        graph.nodes['lesson-note'] = {
            id: 'lesson-note', type: 'note', content: graph.description, title: 'Lesson instructions', x: 100, y: 0, w: 900, h: 180, enabled: true, commentFrame: true, moveContents: false
        };
        layout(graph);
        must(validateWorkflow(graph), id);
        must(prepareWorkflowPlanner(graph), id + ' prepare');
        const envelope = exportWorkflow(graph);
        const parsed = must(parseWorkflow(JSON.stringify(envelope)), id + ' parse');
        must(validateWorkflow(parsed), id + ' round trip');
        return {
            id, number, title, goal, lesson, packages: [envelope]
        };
    };
    return r;
}
