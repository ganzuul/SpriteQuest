import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { parseWorkflow, exportWorkflow } from '../src/workflow/packages.js?v=0.26.0';
import { validateWorkflow } from '../src/workflow/contracts.js?v=0.26.0';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js?v=0.26.0';

const folder = new URL('../examples/roleplay/', import.meta.url);
assert.ok(existsSync(folder), 'thirty complete bundled examples must be delivered as portable files');
const files = readdirSync(folder).filter(name => name.endsWith('.json'));
assert.equal(files.length, 37, 'all thirty recipes include their seven separate phase companions');
const api = await import('../src/workflow/examples.js?v=0.26.0');
const { listWorkflowExamples } = api;
const entries = listWorkflowExamples().filter(entry => entry.number <= 30);
assert.equal(entries.length, 30);
assert.deepEqual(entries.map(entry => entry.number), Array.from({ length: 30 }, (_, index) => index + 1));
assert.equal(entries[0].title, 'Make a scene brief');
assert.equal(entries.at(-1).title, 'Combine memory with a voice pass');
const expectedBounds = [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 1, 1, 0, 1, 2, 1, 1, 2];
const packages = files.map(name => JSON.parse(readFileSync(new URL(name, folder), 'utf8')));
const definitions = new Map();
for (const envelope of packages) {
    const parsed = parseWorkflow(JSON.stringify(envelope));
    assert.equal(parsed.ok, true, JSON.stringify(parsed.error));
    const graph = parsed.data, validation = validateWorkflow(graph);
    assert.equal(validation.ok, true, `${graph.name}: ${JSON.stringify(validation.error)}`);
    assert.deepEqual(exportWorkflow(graph), envelope, 'literal portable packages round-trip without lost settings or teaching notes');
    assert.deepEqual(graph.groups, {}, 'comment frames never create execution groups');
    for (const binding of Object.values(graph.roles)) assert.deepEqual(binding, { model: null, profileId: null });
    for (const node of Object.values(graph.nodes)) {
        assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
        if (node.type !== 'note') assert.ok(node.w >= 260);
        if (node.modelRole) assert.ok(['Analysis', 'Prose'].includes(node.modelRole));
        if (Object.hasOwn(node, 'profileId')) assert.equal(node.profileId, null);
        if (Object.hasOwn(node, 'model')) assert.equal(node.model, null);
    }
    for (const [key, definition] of Object.entries(graph.definitions)) {
        assert.equal(validateDefinition(definition, graph.definitions).ok, true);
        assert.equal(definitionRefKey(definition), key);
        assert.equal(computeDefinitionIdentity(definition).data.semanticHash, definition.semanticHash);
        for (const node of Object.values(definition.body.nodes)) assert.ok(Number.isFinite(node.x) && Number.isFinite(node.y));
        definitions.set(definition.id, definition);
    }
}
assert.equal(definitions.size, 6, 'the final lessons ship all six verified embedded definitions');
for (const [index, entry] of entries.entries()) {
    assert.equal(validateWorkflow(entry.graph).data.callBound, expectedBounds[index], entry.title);
    assert.deepEqual(Object.keys(entry).sort(), ['goal', 'graph', 'id', 'number', 'title']);
    assert.ok(packages.some(envelope => envelope.graph.id === entry.graph.id));
    assert.ok(entry.graph.description.includes('Inspect:'), 'node-specific teaching notes survive portable export');
}
assert.equal(entries[0].graph.nodes.brief.sections[0].name, 'Direction');
assert.match(entries[0].graph.nodes.brief.sections[0].text, /unopened letter sealed/);
assert.equal(entries[1].graph.nodes.rules.rules[0].replacement, 'exhaled');
assert.equal(entries[10].graph.nodes.speech.scope, 'dialogue');
assert.equal(entries[11].graph.nodes.revoice.mode, 'character-voice');
assert.equal(entries[16].graph.nodes['pre-compact'].method, 'compress');
assert.match(entries[19].graph.description, /acknowledgment|acknowledged/);
assert.match(entries.at(-1).graph.description, /Fixture only/);
const authoring = JSON.parse(readFileSync(new URL('../docs/research/2026-10-09-lattice-example-catalog.json', import.meta.url), 'utf8'));
for (const lesson of authoring.entries) for (const detail of lesson.nodeDetails) {
    const graph = packages.find(envelope => envelope.graph.template.id === lesson.id && envelope.graph.mode === `native-${detail.phase.toLowerCase()}`).graph;
    const definition = detail.definitionId && Object.values(graph.definitions).find(item => item.id === detail.definitionId);
    const node = graph.nodes[detail.key] ?? definition?.body.nodes[detail.nativeNodeId ?? detail.key.split(/[./]/).at(-1)];
    assert.ok(node, `${lesson.id}: ${detail.key} remains inspectable in its native root or embedded body`);
    for (const [control, value] of Object.entries(detail.settings)) {
        // Native definition identity materialization omits the version-1 Draft
        // default to preserve its supported semantic identity.
        const delivered = control === 'inputKind' && value === 'draft' ? node.inputKind ?? 'draft' : node[control];
        assert.deepEqual(delivered, value, `${lesson.id}: ${detail.key}.${control}`);
    }
}
console.log('workflow-examples packages: ok');

// Reusing canonical IDs or nested settings must not let edits cross copy boundaries.
assert.equal(typeof api.installWorkflowExample, 'function', 'the local installer is available');
const originalGraph = { id: 'original', name: 'Existing root', description: 'Keep this live object', nodes: {} };
const settings = { graphs: { original: originalGraph }, activeGraphId: 'original', enabled: true,
    nativeBindings: { preGraphId: 'original', postGraphId: null }, ui: { palette: 'olive' } };
const canonical = JSON.stringify(listWorkflowExamples());
const first = api.installWorkflowExample('continuity-and-voice', settings);
assert.equal(first.ok, true, JSON.stringify(first.error));
assert.equal(first.data.companions.length, 1);
const second = api.installWorkflowExample('continuity-and-voice', settings);
assert.equal(second.ok, true, JSON.stringify(second.error));
assert.notEqual(first.data.graph.id, second.data.graph.id);
assert.notEqual(first.data.graph.name, second.data.graph.name);
assert.notDeepEqual(Object.keys(first.data.graph.nodes), Object.keys(second.data.graph.nodes));
const firstSource = Object.values(first.data.graph.nodes).find(node => node.operation === 'scene-context');
const secondSource = Object.values(second.data.graph.nodes).find(node => node.operation === 'scene-context');
firstSource.recentMessages = 3;
assert.equal(secondSource.recentMessages, 12);
const firstDefinition = Object.values(first.data.graph.definitions).find(definition => definition.id === 'lattice.examples.continuity-character');
const secondDefinition = Object.values(second.data.graph.definitions).find(definition => definition.id === 'lattice.examples.continuity-character');
firstDefinition.body.nodes.reflect.instructions = 'Changed locally';
assert.notEqual(secondDefinition.body.nodes.reflect.instructions, 'Changed locally');
first.data.companions[0].nodes[Object.keys(first.data.companions[0].nodes)[0]].alias = 'Edited companion';
assert.notEqual(second.data.companions[0].nodes[Object.keys(second.data.companions[0].nodes)[0]].alias, 'Edited companion');
assert.equal(JSON.stringify(listWorkflowExamples()), canonical, 'copy edits leave canonical roots and definition settings unchanged');

// An unknown tile identifier is a pure recoverable failure, never a thrown exception.
const beforeUnknown = JSON.stringify(settings), registryBeforeUnknown = settings.graphs;
let unknown;
assert.doesNotThrow(() => { unknown = api.installWorkflowExample('missing-example', settings); });
assert.equal(unknown.ok, false);
assert.equal(unknown.error.code, 'UNKNOWN_EXAMPLE');
assert.equal(settings.graphs, registryBeforeUnknown);
assert.equal(JSON.stringify(settings), beforeUnknown);

// A syntactically portable companion with a missing required boundary input must
// fail full admission before the already-valid primary can be installed.
const { WORKFLOW_EXAMPLE_DATA } = await import('../src/workflow/example-data.js?v=0.26.0');
async function installerWithRecipe(recipe) {
    return installerWithCatalog([recipe]);
}
async function installerWithCatalog(catalog) {
    const fixtureURL = 'data:text/javascript,' + encodeURIComponent(`export const WORKFLOW_EXAMPLE_DATA = ${JSON.stringify(catalog)};`);
    const moduleURL = new URL('../src/workflow/examples.js', import.meta.url);
    const source = readFileSync(moduleURL, 'utf8').replace(/from '(\.\/[^']+)'/g, (_, path) => `from ${JSON.stringify(path.startsWith('./example-data.js') ? fixtureURL : new URL(path, moduleURL).href)}`);
    return import('data:text/javascript,' + encodeURIComponent(source));
}
const incompleteRecipe = structuredClone(WORKFLOW_EXAMPLE_DATA.find(entry => entry.id === 'continuity-and-voice'));
const incompleteCompanion = incompleteRecipe.packages[1];
delete incompleteCompanion.graph.wires['wire-1'];
assert.equal(parseWorkflow(JSON.stringify(incompleteCompanion)).ok, true, 'this fixture specifically crosses full admission after structure parsing');
const incompleteAPI = await installerWithRecipe(incompleteRecipe);
const atomicSettings = { graphs: { original: originalGraph }, activeGraphId: 'original', enabled: true, nativeBindings: { preGraphId: 'original', postGraphId: null } };
const atomicBefore = JSON.stringify(atomicSettings), atomicRegistry = atomicSettings.graphs;
const incomplete = incompleteAPI.installWorkflowExample('continuity-and-voice', atomicSettings);
assert.equal(incomplete.ok, false, 'a missing required companion input blocks the complete recipe');
assert.equal(atomicSettings.graphs, atomicRegistry);
assert.equal(JSON.stringify(atomicSettings), atomicBefore, 'failed admission installs neither primary nor companion and preserves active root');

// Reject inaccessible destinations as Results; preflight must never trigger an
// accessor or replace a frozen registry property after preparing copies.
for (const invalidSettings of [null, {}, { graphs: [] }, Object.freeze({ graphs: {} })]) {
    let result;
    assert.doesNotThrow(() => { result = api.installWorkflowExample('scene-brief-basics', invalidSettings); });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INVALID_EXAMPLE_DESTINATION');
}
let accessorReads = 0;
const accessorDestination = Object.defineProperty({}, 'graphs', { enumerable: true, get() { accessorReads++; return {}; } });
assert.equal(api.installWorkflowExample('scene-brief-basics', accessorDestination).ok, false);
assert.equal(accessorReads, 0, 'admission inspects data descriptors without evaluating accessors');

// Existing names reserve both bundle members; unrelated state remains the exact
// same data while every returned copy is the graph installed in the registry.
const occupied = { graphs: { a: { id: 'a', name: 'Combine memory with a voice pass' }, b: { id: 'b', name: 'Combine memory with a voice pass (2)' },
    c: { id: 'c', name: 'Combine memory with a voice pass · Post' } }, activeGraphId: 'a', enabled: false,
    nativeBindings: { preGraphId: 'a', postGraphId: 'c' }, ui: { remember: ['scroll', 'draft'] }, subgraphLibrary: { definitions: {} } };
const occupiedGraphs = { ...occupied.graphs }, preservedBindings = occupied.nativeBindings, preservedUI = occupied.ui, preservedLibrary = occupied.subgraphLibrary;
const named = api.installWorkflowExample('continuity-and-voice', occupied);
assert.equal(named.ok, true, JSON.stringify(named.error));
assert.equal(named.data.graph.name, 'Combine memory with a voice pass (3)');
assert.equal(named.data.companions[0].name, 'Combine memory with a voice pass · Post (2)');
assert.equal(occupied.activeGraphId, 'a');
assert.equal(occupied.enabled, false);
assert.equal(occupied.nativeBindings, preservedBindings);
assert.equal(occupied.ui, preservedUI);
assert.equal(occupied.subgraphLibrary, preservedLibrary);
for (const [id, graph] of Object.entries(occupiedGraphs)) assert.equal(occupied.graphs[id], graph);
for (const graph of [named.data.graph, ...named.data.companions]) {
    assert.equal(occupied.graphs[graph.id], graph);
    assert.equal(validateWorkflow(graph).ok, true);
    for (const [key, definition] of Object.entries(graph.definitions)) assert.equal(key, definitionRefKey(definition), 'root renaming retains native semantic pinned identities');
}
const twinRoots = {
    'persistent-conditions': { post: 1, pre: 1 }, 'promise-callback': { pre: 0, post: 1 },
    'anger-and-trust': { post: 1, pre: 1 }, 'earned-trust': { post: 1, pre: 1 },
    'consequence-clock': { post: 0, pre: 0 }, 'offscreen-agenda': { pre: 1, post: 1 },
    'continuity-and-voice': { pre: 2, post: 1 },
};
for (const entry of entries) {
    const destination = { graphs: {}, activeGraphId: null, enabled: false, nativeBindings: { preGraphId: null, postGraphId: null } };
    const installed = api.installWorkflowExample(entry.id, destination);
    assert.equal(installed.ok, true, `${entry.id}: ${JSON.stringify(installed.error)}`);
    assert.equal(installed.data.graph.mode, entry.graph.mode);
    assert.equal(installed.data.companions.length, Object.hasOwn(twinRoots, entry.id) ? 1 : 0);
    assert.equal(Object.keys(destination.graphs).length, installed.data.companions.length + 1);
    assert.equal(destination.activeGraphId, null);
    assert.deepEqual(destination.nativeBindings, { preGraphId: null, postGraphId: null });
    assert.equal(destination.enabled, false);
    for (const graph of [installed.data.graph, ...installed.data.companions]) {
        const checked = validateWorkflow(graph);
        assert.equal(checked.ok, true, JSON.stringify(checked.error));
        if (twinRoots[entry.id]) assert.equal(checked.data.callBound, twinRoots[entry.id][graph.mode.slice(7)]);
        assert.ok(checked.data.requiredRoles.every(role => ['Analysis', 'Prose'].includes(role)));
    }
}
const malformedRecipe = structuredClone(WORKFLOW_EXAMPLE_DATA.find(entry => entry.id === 'continuity-and-voice'));
malformedRecipe.packages[1].graph.wires['wire-1'].to = 'missing-voice-node';
const malformedAPI = await installerWithRecipe(malformedRecipe);
const malformed = malformedAPI.installWorkflowExample('continuity-and-voice', atomicSettings);
assert.equal(malformed.ok, false);
assert.equal(malformed.error.code, 'DANGLING_WIRE');
assert.equal(atomicSettings.graphs, atomicRegistry);
assert.equal(JSON.stringify(atomicSettings), atomicBefore);

const emptyRecipe = structuredClone(WORKFLOW_EXAMPLE_DATA[0]);
emptyRecipe.packages = [];
const emptyAPI = await installerWithRecipe(emptyRecipe);
const empty = emptyAPI.installWorkflowExample(emptyRecipe.id, atomicSettings);
assert.equal(empty.ok, false, 'an empty local recipe cannot report a successful root installation');
assert.equal(atomicSettings.graphs, atomicRegistry);
assert.equal(JSON.stringify(atomicSettings), atomicBefore);
console.log('workflow-examples atomic installation: ok');

// The picker must receive a failure for one malformed lesson rather than lose
// the entire catalog. Its other 29 identities and independently admitted roots
// stay available for installation.
const damagedCatalog = structuredClone(WORKFLOW_EXAMPLE_DATA);
damagedCatalog[4].packages[0].graph.nodes['pre-plan'].operation = 'missing-example-operation';
const damagedAPI = await installerWithCatalog(damagedCatalog);
assert.throws(() => damagedAPI.listWorkflowExamples(), /Unknown workflow operation/i, 'strict legacy listing reproduces the malformed-primary failure');
assert.equal(typeof damagedAPI.listWorkflowExampleResults, 'function', 'per-example Result listing isolates catalog admission failures');
let available;
assert.doesNotThrow(() => { available = damagedAPI.listWorkflowExampleResults().filter(entry => entry.number <= 30); });
assert.equal(available.length, 30);
assert.deepEqual(available.map(({ id, number, title, goal }) => ({ id, number, title, goal })), entries.map(({ id, number, title, goal }) => ({ id, number, title, goal })));
assert.equal(available[4].result.ok, false);
assert.equal(available[4].result.error.code, 'UNKNOWN_OPERATION');
assert.equal(available.filter(entry => entry.result.ok).length, 29);
for (const entry of available.filter(entry => entry.result.ok)) {
    assert.equal(validateWorkflow(entry.result.data).ok, true);
    const installed = damagedAPI.installWorkflowExample(entry.id, { graphs: {} });
    assert.equal(installed.ok, true, `${entry.id}: ${JSON.stringify(installed.error)}`);
}
const validSource = available[0].result.data.nodes.brief;
validSource.sections[0].text = 'Edited result snapshot';
assert.notEqual(damagedAPI.listWorkflowExampleResults()[0].result.data.nodes.brief.sections[0].text, 'Edited result snapshot');
assert.equal(incompleteAPI.listWorkflowExampleResults()[0].result.ok, false, 'a malformed companion makes its primary tile unavailable before clicking');
assert.equal(emptyAPI.listWorkflowExampleResults()[0].result.ok, false);
console.log('workflow-examples isolated admission: ok');
