import { operationDefaults } from '../catalog.js?v=0.26.0';

/** Native starter factories preserve the operation modes and named typed pins. */
export function createIntrospectionStarter(starter) {
    const graph = { id: starter.id, name: starter.title, description: starter.purpose, schema: 3, runtime: 2, mode: 'native-' + starter.phase,
        template: { id: starter.id, version: starter.version }, roles: Object.fromEntries(starter.roles.map(role => [role, { profileId: null, model: null }])),
        nodes: {}, wires: {}, portals: {}, definitions: {}, groups: {}, view: { x: 0, y: 0, zoom: 1 },
    };
    const add = (id, operation, controls, x, y = 140) => {
        graph.nodes[id] = { ...operationDefaults(operation, controls.mode ? { mode: controls.mode } : {}), ...controls,
            id, type: 'workflow', operationVersion: 1, enabled: true, x, y, w: 260 };
    };
    const connect = (from, to, toPort, fromPort = 'out') => {
        const id = 'wire-' + (Object.keys(graph.wires).length + 1);
        graph.wires[id] = { id, route: 'wire', from, fromPort, to, toPort };
    };
    if (starter.id === 'reflect-and-express') {
        add('scene-context', 'scene-context', {}, 100);
        add('focus', 'context', { mode: 'focus', method: 'select' }, 410);
        add('prior', 'memory', { mode: 'read', view: 'state' }, 410, 400);
        add('reflect', 'reflect', { mode: 'character', instructions: 'Use supplied scene evidence and prior actor state. Distinguish observations from interpretations and possibilities; preserve player agency.' }, 720);
        add('express', 'express', { mode: 'behavior' }, 1030);
        add('guidance', 'guidance', {}, 1340);
        connect('scene-context', 'focus', 'context');
        connect('focus', 'reflect', 'context');
        connect('prior', 'reflect', 'state');
        connect('reflect', 'express', 'assessment');
        connect('express', 'guidance', 'in');
    } else if (starter.id === 'internalize-and-commit' || starter.id === 'consequence-clock') {
        add('prior', 'memory', { mode: 'read', view: 'state' }, 100);
        add('events', 'memory', { mode: 'read', view: 'events' }, 100, 400);
        const track = starter.id === 'consequence-clock';
        add('update', track ? 'state' : 'internalize', track ? { mode: 'track', trackId: 'consequences' } : { mode: 'experience', instructions: 'Propose only updates supported by settled events. Preserve enduring traits, separate temporary conditions from guarded beliefs, and preserve player agency.' }, 410);
        add('commit', 'memory', { mode: 'commit' }, 720);
        connect('prior', 'update', 'state');
        connect('events', 'update', 'events');
        connect('update', 'commit', 'proposal');
    } else throw new Error('Unknown Introspection starter.');
    return graph;
}
