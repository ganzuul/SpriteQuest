import assert from 'node:assert/strict';
import { test } from 'node:test';
import { describeOperation, operationDefaults } from '../src/workflow/catalog.js';
import { computeDefinitionIdentity, definitionRefKey, validateDefinition } from '../src/workflow/definitions.js';
const api = await import('../src/ui/native-search-catalog.js').catch(() => ({}));
const scope = (mode = 'native-pre', extra = {}) => ({ schema: 3, runtime: 2, mode, workflowId: 'root', viewPath: [], inDefinition: false, ...extra });
function catalog(input = scope(), options) {
    assert.equal(typeof api.prepareNativeSearchCatalog, 'function');
    const result = api.prepareNativeSearchCatalog(input, options);
    assert.equal(result.ok, true, JSON.stringify(result));
    return result.data;
}
const choice = (value, id) => value.choices.find(item => item.id === id);

test('default and declared variants describe real pins in the containing phase without allocated identities', () => {
    for (const mode of ['native-pre', 'native-post']) {
        const value = catalog(scope(mode));
        for (const item of value.choices.filter(item => !item.disabledReason)) {
            const command = api.resolveNativeSearchChoice(value, item.id);
            const described = describeOperation(scope(mode), { type: 'workflow', ...operationDefaults(command.operation), ...command.controls });
            assert.equal(described.ok, true);
            assert.equal(item.phase, mode.slice(7));
            assert.deepEqual(item.ports, described.data.ports.map(port => ({ portId: port.id, dir: port.direction === 'input' ? 'in' : 'out', kind: port.kind, label: port.label, required: port.required })));
            for (const port of item.ports) for (const key of ['nodeId', 'center', 'address']) assert.equal(Object.hasOwn(port, key), false);
        }
        assert.equal(choice(value, 'operation:reroute'), undefined);
        assert.ok(value.families.includes('Transpose'));
        assert.equal(value.choices.some(item => item.family === 'Transpose'), false);
    }
});

test('Draft Text Rules, JSON check, Compose Input and Context Join expose actual variant ports', () => {
    const pre = catalog(), post = catalog(scope('native-post'));
    assert.equal(choice(pre, 'operation:text-rules:draft'), undefined);
    assert.deepEqual(choice(post, 'operation:text-rules:draft').ports.map(p => [p.dir, p.kind]), [['in', 'draft'], ['out', 'patches']]);
    assert.equal(choice(pre, 'operation:json-decode:check').ports[0].kind, 'data');
    assert.deepEqual(api.resolveNativeSearchChoice(pre, 'operation:json-decode:check').controls, { mode: 'check' });
    assert.ok(choice(pre, 'operation:compose:input').ports.some(p => p.portId === 'section.Input' && p.kind === 'text'));
    assert.deepEqual(choice(pre, 'operation:context-join').ports.filter(p => p.dir === 'in').map(p => p.portId), ['context-1', 'context-2']);
    assert.equal(choice(post, 'operation:compose:guidance'), undefined);
    assert.equal(choice(pre, 'operation:compose:guidance').ports.find(p => p.dir === 'out').kind, 'guidance');
});

test('private bodies exclude root-only and wrong-phase operations while retaining dynamic both-phase choices', () => {
    for (const mode of ['native-pre', 'native-post']) {
        const value = catalog(scope(mode, { inDefinition: true, viewPath: ['instance'] }));
        for (const id of ['scene-context', 'reply-snapshot', 'guidance', 'apply-reply']) assert.equal(choice(value, 'operation:' + id), undefined);
        assert.ok(choice(value, 'operation:compose'));
        assert.ok(choice(value, 'operation:json-decode:check'));
        assert.equal(choice(value, mode === 'native-pre' ? 'operation:repair' : 'operation:smart-compactor'), undefined);
    }
});

test('cached query and context matching preserve multiple real compatible ports and allow context-off choices', () => {
    const value = catalog(), origin = { dir: 'out', kind: 'context' };
    const matched = api.filterNativeSearchChoices(value, { query: 'join', origin, contextSensitive: true });
    assert.deepEqual(matched.map(c => c.id), ['operation:context-join']);
    assert.deepEqual(api.matchNativeSearchPorts(value, matched[0].id, origin).map(p => p.portId), ['context-1', 'context-2']);
    assert.equal(api.filterNativeSearchChoices(value, { query: 'JSON', origin, contextSensitive: true }).length, 0);
    assert.equal(api.filterNativeSearchChoices(value, { query: 'JSON', origin, contextSensitive: false }).length, 2);
    assert.equal(api.matchNativeSearchPorts(value, 'operation:json-decode:check', origin).length, 0);
    assert.equal(api.resolveNativeSearchChoice(value, 'missing'), null);
    assert.equal(api.resolveNativeSearchChoice({ ...value }, 'operation:compose'), null, 'foreign catalog cannot provide checked commands');
});

test('checked shelf entries retain exact revision and actual interface choices but require an atomic producer', () => {
    const id = '界'.repeat(300);
    const interfacePorts = Array.from({ length: 257 }, (_, i) => ({ id: 'input-' + i, label: 'Input ' + i, direction: 'input', kind: 'context', required: false, cardinality: 'one', boundaryNodeId: 'boundary-' + i }));
    const draft = { id, version: 4, name: 'Saved shape', interface: interfacePorts, parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', nodes: Object.fromEntries(interfacePorts.map(port => [port.boundaryNodeId, { id: port.boundaryNodeId, type: 'subgraph-input', interfacePortId: port.id }])), wires: {} } };
    const identity = computeDefinitionIdentity(draft); assert.equal(identity.ok, true);
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    assert.equal(validateDefinition(definition, { [definitionRefKey(definition)]: definition }).ok, true, 'real 257-interface source is accepted by the existing definition validator');
    const ref = { id, version: 4, semanticHash: definition.semanticHash }, ports = interfacePorts.map(({ boundaryNodeId, ...port }) => port);
    const value = catalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved shape', phase: 'pre', ports }] });
    const item = value.choices.find(c => c.family === 'Subgraphs');
    assert.deepEqual(item.definitionRef, ref);
    assert.equal(item.ports.length, 257);
    assert.match(item.disabledReason, /atomic/i);
    assert.equal(api.resolveNativeSearchChoice(value, item.id), null);
    ref.id = 'mutated'; ports[0].id = 'mutated';
    assert.equal(item.definitionRef.id, id); assert.equal(item.ports[0].portId, 'input-0');
    assert.ok(Object.isFrozen(item.ports));
});

test('catalog admission rejects unsupported schema, malformed/getter scope and malformed shelf metadata without invoking getters', () => {
    assert.equal(typeof api.prepareNativeSearchCatalog, 'function');
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { schema: 2, runtime: 1 })).ok, false);
    let reads = 0;
    const trapped = { ...scope() }; Object.defineProperty(trapped, 'workflowId', { enumerable: true, get() { reads++; return 'root'; } });
    assert.equal(api.prepareNativeSearchCatalog(trapped).ok, false); assert.equal(reads, 0);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ definitionRef: {}, name: 'bad', phase: 'pre', ports: [] }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { viewPath: Array(9).fill('instance'), inDefinition: true })).ok, false);
});

test('genuine interface and data overlimits reject while a disabled shelf remains a queryable cached choice', () => {
    const ref = { id: 'definition', version: 1, semanticHash: 'sha256:' + 'f'.repeat(64) };
    const ports = Array.from({ length: 1001 }, (_, i) => ({ id: 'port-' + i, label: '', direction: 'input', kind: 'context', required: false, cardinality: 'one' }));
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved', phase: 'pre', ports }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope('native-pre', { workflowId: '界'.repeat(700000) })).ok, false);
    const value = catalog(scope(), { checkedLibraryEntries: [{ definitionRef: ref, name: 'Saved', phase: 'pre', ports: ports.slice(0, 1) }] });
    assert.equal(api.filterNativeSearchChoices(value, { query: 'Saved' })[0].disabledReason, 'Atomic subgraph creation is not available yet.');
});

test('public cached filter rejects accessor or malformed options without evaluating them', () => {
    const value = catalog(); let reads = 0;
    const options = {}; Object.defineProperty(options, 'query', { enumerable: true, get() { reads++; return 'Compose'; } });
    assert.deepEqual(api.filterNativeSearchChoices(value, options), []); assert.equal(reads, 0);
    assert.deepEqual(api.filterNativeSearchChoices(value, { query: '', origin: { dir: 'sideways', kind: 'context' } }), []);
    assert.deepEqual(api.filterNativeSearchChoices(value, { contextSensitive: 'yes' }), []);
});

test('cached operation purpose, prototype shortcode and known aliases each independently find compatible choices', () => {
    const value = catalog(), item = choice(value, 'operation:smart-compactor');
    assert.equal(typeof item.purpose, 'string'); assert.equal(item.shortcode, 'cp'); assert.ok(Object.isFrozen(item.searchAliases));
    for (const [field, term] of [['purpose', 'protected'], ['shortcode', 'cp'], ['searchAliases', 'compaction']]) {
        const fields = { label: item.label, family: item.family, purpose: item.purpose, shortcode: item.shortcode, searchAliases: item.searchAliases.join(' ') };
        assert.ok(fields[field].includes(term));
        for (const [name, contents] of Object.entries(fields)) if (name !== field) assert.equal(contents.toLowerCase().includes(term), false, term + ' appears only in ' + field);
        const filtered = api.filterNativeSearchChoices(value, { query: term.toUpperCase(), origin: { dir: 'out', kind: 'context' }, contextSensitive: true });
        assert.ok(filtered.some(match => match.id === item.id), term);
        assert.equal(api.filterNativeSearchChoices(value, { query: term, origin: { dir: 'out', kind: 'draft' }, contextSensitive: true }).some(match => match.id === item.id), false);
        assert.ok(api.filterNativeSearchChoices(value, { query: term, origin: { dir: 'out', kind: 'draft' }, contextSensitive: false }).some(match => match.id === item.id));
    }
    for (const entry of value.choices) { assert.equal(typeof entry.purpose, 'string'); assert.equal(typeof entry.shortcode, 'string'); assert.ok(Object.isFrozen(entry.searchAliases)); }
});

test('saved subgraph label and admitted optional search metadata remain immutable without placed-node aliases', () => {
    const entry = { definitionRef: { id: 'saved', version: 1, semanticHash: 'sha256:' + 'e'.repeat(64) }, name: 'Saved Loom', phase: 'pre', ports: [], purpose: 'Reusable arrangement', shortcode: 'lm', searchAliases: ['woven branch'] };
    const value = catalog(scope(), { checkedLibraryEntries: [entry] }), item = value.choices.find(choice => choice.family === 'Subgraphs');
    assert.equal(item.label, 'Saved Loom'); assert.deepEqual(item.searchAliases, ['woven branch']);
    for (const term of ['Saved Loom', 'arrangement', 'lm', 'woven branch']) assert.ok(api.filterNativeSearchChoices(value, { query: term }).some(choice => choice.id === item.id));
    entry.name = 'Changed'; entry.searchAliases.push('changed alias'); assert.equal(item.label, 'Saved Loom'); assert.deepEqual(item.searchAliases, ['woven branch']);
    let reads = 0; const trapped = { ...entry }; Object.defineProperty(trapped, 'purpose', { enumerable: true, get() { reads++; return 'bad'; } });
    assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [trapped] }).ok, false); assert.equal(reads, 0);
    for (const searchAliases of [[42], 'not an array']) assert.equal(api.prepareNativeSearchCatalog(scope(), { checkedLibraryEntries: [{ ...entry, searchAliases }] }).ok, false);
    assert.equal(api.prepareNativeSearchCatalog(scope(), { placedNodeAliases: ['placed node alias'] }).ok, false);
});
