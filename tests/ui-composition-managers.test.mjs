import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(clientURL);
async function compiled(name, directory, source) {
    source ??= await readFile(new URL('../ui/' + name + '.svelte', import.meta.url), 'utf8');
    const output = compile(source, { filename: name + '.svelte', generate: 'client', css: 'injected' });
    assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
    const code = output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
    const path = join(directory, name + '.mjs'); await writeFile(path, code);
    return { path, component: (await import(pathToFileURL(path).href)).default };
}
async function fixture(name, view, actions, reactive = false) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-composition-panels-'));
    const host = document.createElement('div'); document.body.append(host); let mounted;
    const cleanup = async () => { if (mounted) await unmount(mounted); host.remove(); const rel = relative(resolve(tmpdir()), resolve(directory)); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(directory, { recursive: true, force: true }); };
    try {
        const leaf = await compiled(name, directory);
        const harness = await compiled(name + 'Harness', directory, `<script>import Leaf from ${JSON.stringify(pathToFileURL(leaf.path).href)}; let { initial, actions } = $props(); let view = ${reactive ? '$state(initial)' : '$state.raw(initial)'}; export function update(next) { view = next; }</script><Leaf {view} {actions} />`);
        mounted = mount(harness.component, { target: host, props: { initial: view, actions } }); flushSync();
        return { host, update(next) { mounted.update(next); flushSync(); }, close: cleanup };
    } catch (error) { await cleanup(); throw error; }
}
const success = () => ({ ok: true });
const input = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); flushSync(); };
const change = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync(); };
const clickRaw = element => { element.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); flushSync(); };
const ref = { id: 'definition/one', version: 2, semanticHash: 'sha256:abc' };
const scope = { kind: 'graph', workflowId: 'root', instancePath: ['outer', 'inner'], definitionRef: ref };
const capture = (view, library = false) => ({ managerKey: view.managerKey, revision: view.revision, scope: structuredClone(view.scope), ...(library ? { libraryRevision: view.libraryRevision } : {}) });
const portal = extra => ({ managerKey: 'portal/inner', revision: 'r1', scope, scopeLabel: 'Inner graph', readOnly: true, canPresent: true, renameMode: 'presentation', capabilities: { create: false, rename: true, retarget: false, connect: false, restore: false, remove: false, convert: false }, selectedPortalId: 'portal/one', publishers: [{ id: 'portal/one', label: 'Scene', kind: 'context', source: { nodeId: 'source', portId: 'context.out' } }], sources: [{ key: 'source-key', nodeId: 'source', portId: 'context.out', label: 'Scene Context · Context', kind: 'context', direction: 'output', occupied: false }], receivers: [], consumers: [], conversion: null, ...extra });
const capabilities = { importJSON: true, exportJSON: true, duplicate: true, renameRevision: true, removeRevision: true, insert: true, makeLocalCopy: false, saveToShelf: false, editInterface: false, editParameter: false, editParameterOverride: false, editBindingOverride: false, prepareUpdate: false, acceptUpdate: false, convertSelection: false, unpack: false };
const subgraph = extra => ({ managerKey: 'subgraph/one', revision: 'r1', libraryRevision: 'shelf1', scope: { kind: 'library', definitionRef: ref }, scopeLabel: 'Library · Prepare Context', selectedRef: ref, entries: [{ key: 'entry1', ref, name: 'Prepare Context', phase: 'pre', nodeCount: 2, wireCount: 1 }], permissions: { libraryWrite: true, insert: true, instanceEdit: false, bodyEdit: false }, capabilities, definition: { ref, name: 'Prepare Context', description: '', interface: [], parameters: [], eligibleTargets: [], kinds: ['context', 'text', 'data'] }, instance: null, destinations: [{ key: 'main', label: 'Graph 1' }], selectedDestinationKey: 'main', update: null, selection: null, ...extra });

test('child portal aliases are presentation callbacks with exact scope capture and reactive capability guards', async () => {
    const calls = [];
    const f = await fixture('PortalManager', portal(), { rename: (...args) => { calls.push(args); return success(); }, create: () => { calls.push('create'); return success(); } });
    try {
        assert.match(f.host.textContent, /Inner graph/); assert.match(f.host.textContent, /Local workspace label/);
        input(f.host.querySelector('[aria-label="Portal name"]'), 'Scene alias');
        clickRaw(f.host.querySelector('[data-portal-rename]')); await tick(); flushSync();
        assert.deepEqual(calls, [[capture(portal()), 'portal/one', 'Scene alias', 'presentation']]);
        const button = f.host.querySelector('[data-portal-rename]');
        f.update(portal({ canPresent: false })); input(f.host.querySelector('[aria-label="Portal name"]'), 'Forbidden'); clickRaw(button);
        assert.equal(calls.length, 1, 'raw events cannot bypass removed presentation permission');
        f.update(portal({ readOnly: false, renameMode: 'authored', capabilities: { ...portal().capabilities, rename: false } })); clickRaw(button);
        assert.equal(calls.length, 1, 'editable graph does not grant an unsupported producer capability');
        f.update(portal({ renameMode: 'authored' })); clickRaw(button); assert.equal(calls.length, 1, 'authored mutation stays blocked in pinned bodies');
        clickRaw(f.host.querySelector('[data-portal-create]')); assert.equal(calls.length, 1);
    } finally { await f.close(); }
});

test('portal operations use actual named ports and explicit consumer replacement, restore and deletion choices', async () => {
    const calls = [], actions = Object.fromEntries(['create', 'retarget', 'connect', 'restoreWire', 'deletePublisher', 'convertWire', 'convertOutput', 'jumpSource', 'jumpConsumer', 'selectPortal'].map(key => [key, (...args) => { calls.push([key, ...args]); return success(); }]));
    const view = portal({ readOnly: false, renameMode: 'authored', capabilities: { create: true, rename: true, retarget: true, connect: true, restore: true, remove: true, convert: true }, sources: [...portal().sources, { key: 'second', nodeId: 'join', portId: 'context.merged', label: 'Join · Merged context', kind: 'context', direction: 'output', occupied: false }], receivers: [{ key: 'receiver', nodeId: 'compose', portId: 'section.instructions', label: 'Compose · Instructions', kind: 'context', direction: 'input', occupied: true }], consumers: [{ edgeId: 'edge/consumer', label: 'Planner · Scene', to: { nodeId: 'plan', portId: 'context.scene' } }], conversion: { kind: 'wire', edgeId: 'edge/source', label: 'Scene → Planner' } });
    const f = await fixture('PortalManager', view, actions);
    try {
        assert.equal(calls.length, 0, 'rendering performs no mutation or navigation');
        change(f.host.querySelector('[aria-label="Portal source"]'), 'second');
        input(f.host.querySelector('[aria-label="New portal name"]'), 'Prepared');
        f.host.querySelector('[data-portal-create]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['create', capture(view), 'Prepared', { nodeId: 'join', portId: 'context.merged' }]);
        f.host.querySelector('[data-portal-retarget]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['retarget', capture(view), 'portal/one', { nodeId: 'join', portId: 'context.merged' }]);
        change(f.host.querySelector('[aria-label="Compatible receiver"]'), 'receiver');
        assert.equal(f.host.querySelector('[data-portal-connect]').disabled, true, 'occupied input requires an explicit replacement');
        clickRaw(f.host.querySelector('[data-portal-connect]')); assert.equal(calls.length, 0);
        const replace = f.host.querySelector('[aria-label="Replace existing connection"]'); replace.checked = true; replace.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync();
        f.host.querySelector('[data-portal-connect]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['connect', capture(view), 'portal/one', { nodeId: 'compose', portId: 'section.instructions' }, true]);
        f.host.querySelector('[data-portal-restore]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['restoreWire', capture(view), 'edge/consumer']);
        clickRaw(f.host.querySelector('[data-portal-delete]')); assert.equal(calls.length, 0, 'delete cannot choose the fate of live consumers implicitly');
        change(f.host.querySelector('[aria-label="Existing consumers"]'), 'restore');
        f.host.querySelector('[data-portal-delete]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['deletePublisher', capture(view), 'portal/one', 'restore']);
        change(f.host.querySelector('[aria-label="Existing consumers"]'), 'disconnect');
        f.host.querySelector('[data-portal-delete]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['deletePublisher', capture(view), 'portal/one', 'disconnect']);
        f.host.querySelector('[data-portal-convert]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['convertWire', capture(view), 'edge/source']);
        f.host.querySelector('[data-portal-jump-source]').click(); assert.deepEqual(calls.shift(), ['jumpSource', capture(view), { nodeId: 'source', portId: 'context.out' }]);
        f.host.querySelector('[data-portal-jump-consumer]').click(); assert.deepEqual(calls.shift(), ['jumpConsumer', capture(view), 'edge/consumer', { nodeId: 'plan', portId: 'context.scene' }]);
        f.update({ ...view, conversion: { kind: 'output', endpoint: { nodeId: 'join', portId: 'context.merged' }, label: 'Join · Merged context' } });
        f.host.querySelector('[data-portal-convert]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['convertOutput', capture(view), { nodeId: 'join', portId: 'context.merged' }]);
        f.update({ ...view, readOnly: true }); clickRaw(f.host.querySelector('[data-portal-convert]')); clickRaw(f.host.querySelector('[data-portal-restore]')); assert.equal(calls.length, 0);
    } finally { await f.close(); }
});

test('read-only library inspection permits explicit shelf revisions and actual graph insertion without body permissions', async () => {
    const calls = [], actions = Object.fromEntries(['renameRevision', 'removeRevision', 'duplicate', 'insert', 'openLibrary', 'exportJSON', 'importJSON', 'editInterface', 'makeLocalCopy'].map(key => [key, (...args) => { calls.push([key, ...args]); return success(); }]));
    const view = subgraph(), f = await fixture('SubgraphManager', view, actions);
    try {
        assert.match(f.host.textContent, /Version 2/); assert.match(f.host.textContent, /Read-only definition/);
        assert.equal(f.host.querySelector('[aria-label="Interface label"]'), null, 'library inspection never becomes a fake editable body');
        assert.equal(calls.length, 0);
        input(f.host.querySelector('[aria-label="Definition name"]'), 'Context Preparation');
        f.host.querySelector('[data-subgraph-rename]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['renameRevision', capture(view, true), ref, 'Context Preparation']);
        f.host.querySelector('[data-subgraph-insert]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['insert', capture(view, true), ref, 'main']);
        f.host.querySelector('[data-subgraph-open-library]').click(); assert.deepEqual(calls.shift(), ['openLibrary', capture(view, true), ref]);
        f.host.querySelector('[data-subgraph-export]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['exportJSON', capture(view, true), ref]);
        f.host.querySelector('[data-subgraph-remove]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['removeRevision', capture(view, true), ref]);
        f.update(subgraph({ permissions: { ...view.permissions, libraryWrite: false }, capabilities: { ...capabilities, insert: false } }));
        clickRaw(f.host.querySelector('[data-subgraph-rename]')); clickRaw(f.host.querySelector('[data-subgraph-import]')); clickRaw(f.host.querySelector('[data-subgraph-insert]'));
        assert.equal(calls.length, 0, 'raw events respect current library and producer capabilities separately');
        assert.equal(f.host.querySelector('[data-subgraph-open-library]').disabled, false, 'inspection stays available');
    } finally { await f.close(); }
});

test('owned definition editors dispatch typed boundaries and actual eligible parameter targets, retaining pinned-body guards', async () => {
    const target = { instancePath: ['nested/one'], nodeId: 'compose', controlId: 'sections' };
    const detail = { ...subgraph().definition, interface: [{ id: 'input/one', label: 'Context', direction: 'input', kind: 'context', required: true, cardinality: 'one', boundaryNodeId: 'boundary/one' }], parameters: [{ id: 'parameter/one', label: 'Sections', target, control: { key: 'sections', label: 'Sections', editor: 'json', representation: 'json-value', value: [] } }], eligibleTargets: [{ key: 'compose-target', label: 'Nested Compose · Sections', target }], exposureNote: 'Context Join input slots: Edit inputs inside the graph body.' };
    const instance = { address: { workflowId: 'root', instancePath: ['outer'], nodeId: 'inner' }, ref, owned: true, parameters: [], bindings: [] };
    const view = subgraph({ scope, definition: detail, instance, permissions: { libraryWrite: true, insert: true, instanceEdit: true, bodyEdit: true }, capabilities: { ...capabilities, editInterface: true, editParameter: true, makeLocalCopy: true, saveToShelf: true, unpack: true } });
    const calls = [], actions = Object.fromEntries(['editInterface', 'editParameter', 'makeLocalCopy', 'saveToShelf', 'unpack', 'openInstance'].map(key => [key, (...args) => { calls.push([key, ...args]); return success(); }]));
    const f = await fixture('SubgraphManager', view, actions);
    try {
        input(f.host.querySelector('[aria-label="Interface label input/one"]'), 'Source context');
        change(f.host.querySelector('[aria-label="Interface kind input/one"]'), 'text');
        f.host.querySelector('[data-save-interface]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['editInterface', capture(view, true), { kind: 'update', id: 'input/one', label: 'Source context', artifactKind: 'text', required: true }]);
        input(f.host.querySelector('[aria-label="New interface label"]'), 'Result'); change(f.host.querySelector('[aria-label="New interface direction"]'), 'output'); change(f.host.querySelector('[aria-label="New interface kind"]'), 'data');
        f.host.querySelector('[data-add-interface]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['editInterface', capture(view, true), { kind: 'add', label: 'Result', direction: 'output', artifactKind: 'data', required: true }]);
        f.host.querySelector('[data-remove-interface]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['editInterface', capture(view, true), { kind: 'remove', id: 'input/one' }]);
        assert.match(f.host.textContent, /Edit inputs inside the graph body/);
        const choices = f.host.querySelector('[aria-label="Exposed parameter target"]'); assert.deepEqual([...choices.options].map(option => option.value), ['', 'compose-target']);
        input(f.host.querySelector('[aria-label="New parameter label"]'), 'Composition sections'); change(choices, 'compose-target');
        f.host.querySelector('[data-add-parameter]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['editParameter', capture(view, true), { kind: 'add', label: 'Composition sections', target }]);
        input(f.host.querySelector('[aria-label="Parameter label parameter/one"]'), 'Composition'); f.host.querySelector('[data-save-parameter]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['editParameter', capture(view, true), { kind: 'update', id: 'parameter/one', label: 'Composition' }]);
        f.host.querySelector('[data-remove-parameter]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['editParameter', capture(view, true), { kind: 'remove', id: 'parameter/one' }]);
        f.host.querySelector('[data-subgraph-save-shelf]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['saveToShelf', capture(view, true), 'new', null, 'Prepare Context']);
        change(f.host.querySelector('[aria-label="Shelf save mode"]'), 'revision'); assert.equal(f.host.querySelector('[data-subgraph-save-shelf]').disabled, true, 'revision identity is explicitly selected');
        change(f.host.querySelector('[aria-label="Shelf revision target"]'), 'entry1'); f.host.querySelector('[data-subgraph-save-shelf]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['saveToShelf', capture(view, true), 'revision', ref, 'Prepare Context']);
        f.host.querySelector('[data-subgraph-unpack]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['unpack', capture(view, true), instance.address, ref]);
        f.update({ ...view, permissions: { ...view.permissions, bodyEdit: false }, instance: { ...instance, owned: false } });
        const label = f.host.querySelector('[aria-label="Interface label input/one"]'); input(label, 'Forbidden'); clickRaw(f.host.querySelector('[data-save-interface]')); clickRaw(f.host.querySelector('[data-remove-parameter]')); clickRaw(f.host.querySelector('[data-subgraph-save-shelf]')); assert.equal(calls.length, 0);
        f.host.querySelector('[data-subgraph-local-copy]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['makeLocalCopy', capture(view, true), instance.address, ref], 'copy targets the actual editable parent action without making the body writable');
        assert.equal(label.disabled, true);
    } finally { await f.close(); }
});

test('wrapper overrides use descriptor representation and producer binding modes without granting pinned-body editing', async () => {
    const inherit = { value: 'inherit', label: 'Inherit' }, override = { value: 'override', label: 'Override' }, block = { value: 'block', label: 'Block inheritance' };
    const binding = { key: 'node/one', label: 'Nested reasoner', target: { kind: 'node', instancePath: ['nested/one'], nodeId: 'reasoner' }, editable: true, profile: { mode: 'inherit', allowedModes: [inherit, override], value: null, options: [{ value: 'reasoning-profile', label: 'Reasoning connection' }] }, model: { mode: 'block', allowedModes: [inherit, override, block], value: null }, effective: 'Thinking model · reasoning connection', source: 'Instance node override' };
    const instance = { address: { workflowId: 'root', instancePath: [], nodeId: 'wrapper' }, ref, owned: false, parameters: [{ id: 'sections', label: 'Sections', overridden: true, control: { key: 'sections', label: 'Sections', editor: 'json', representation: 'json-value', value: [{ name: 'one', text: 'Saved' }] } }, { id: 'schema', label: 'Schema', overridden: false, control: { key: 'schema', label: 'Schema', editor: 'json', representation: 'json-text', allowEmpty: true, value: '' } }, { id: 'enabled', label: 'Keep dialogue', overridden: false, control: { key: 'enabled', label: 'Keep dialogue', editor: 'boolean', value: true } }], bindings: [binding] };
    const view = subgraph({ scope: { kind: 'graph', workflowId: 'root', instancePath: [] }, instance, permissions: { libraryWrite: false, insert: false, instanceEdit: true, bodyEdit: false }, capabilities: { ...capabilities, editParameterOverride: true, editBindingOverride: true } });
    const values = [], bindings = [], f = await fixture('SubgraphManager', view, { editParameterOverride: (...args) => { values.push(args); return args[2] === 'set' && Array.isArray(args[3]) && !args[3].length ? { ok: false, error: { code: 'INVALID_PORT', message: 'Connected section cannot be removed.' } } : success(); }, editBindingOverride: (...args) => { bindings.push(args); return success(); } });
    try {
        assert.match(f.host.textContent, /Thinking model · reasoning connection/); assert.match(f.host.textContent, /Instance node override/);
        input(f.host.querySelector('[aria-label="Override Sections"]'), '{broken'); f.host.querySelector('[data-save-override="sections"]').click(); await tick(); flushSync(); assert.equal(values.length, 0); assert.match(f.host.textContent, /valid JSON/);
        input(f.host.querySelector('[aria-label="Override Sections"]'), '[]'); f.host.querySelector('[data-save-override="sections"]').click(); await tick(); flushSync(); assert.deepEqual(values.shift(), [capture(view, true), 'sections', 'set', []]); assert.match(f.host.textContent, /Connected section/); assert.equal(f.host.querySelector('[aria-label="Override Sections"]').value, '[]', 'rejected structured draft is retained');
        const schema = '  {"type":"object"}  '; input(f.host.querySelector('[aria-label="Override Schema"]'), schema); f.host.querySelector('[data-save-override="schema"]').click(); await tick(); flushSync(); assert.deepEqual(values.shift(), [capture(view, true), 'schema', 'set', schema]);
        input(f.host.querySelector('[aria-label="Override Schema"]'), ''); f.host.querySelector('[data-save-override="schema"]').click(); await tick(); flushSync(); assert.deepEqual(values.shift(), [capture(view, true), 'schema', 'set', '']);
        f.host.querySelector('[data-reset-override="sections"]').click(); await tick(); flushSync(); assert.deepEqual(values.shift(), [capture(view, true), 'sections', 'reset']);
        const checkbox = f.host.querySelector('[aria-label="Override Keep dialogue"]'); checkbox.checked = false; checkbox.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync(); f.host.querySelector('[data-save-override="enabled"]').click(); await tick(); flushSync(); assert.deepEqual(values.shift(), [capture(view, true), 'enabled', 'set', false], 'false remains an explicit override');
        const connectionMode = f.host.querySelector('[aria-label="Connection mode node/one"]'); assert.deepEqual([...connectionMode.options].map(option => option.value), ['inherit', 'override']);
        change(connectionMode, 'override'); await tick(); flushSync(); assert.deepEqual(bindings.shift(), [capture(view, true), binding.target, 'profileId', 'override', null]);
        change(f.host.querySelector('[aria-label="Model mode node/one"]'), 'inherit'); await tick(); flushSync(); assert.deepEqual(bindings.shift(), [capture(view, true), binding.target, 'model', 'inherit', null]);
        f.update({ ...view, instance: { ...instance, bindings: [{ ...binding, editable: false }] } }); change(connectionMode, 'override'); assert.equal(bindings.length, 0, 'current per-row capability is rechecked at dispatch');
        f.update({ ...view, permissions: { ...view.permissions, instanceEdit: false } }); clickRaw(f.host.querySelector('[data-save-override="sections"]')); assert.equal(values.length, 0);
        f.update({ ...view, instance: { ...instance, bindings: [] } }); assert.equal(f.host.querySelector('[data-instance-model]'), null, 'producer omits model rows in deterministic modes');
    } finally { await f.close(); }
});

test('instance update review sends all four explicit maps and accepts only the producer prepared key for current refs', async () => {
    const nextRef = { id: ref.id, version: 3, semanticHash: 'sha256:new' }, oldBinding = JSON.stringify([['nested/one'], 'reasoner']), newBinding = JSON.stringify([[], 'reasoner2']);
    const instance = { address: { workflowId: 'root', instancePath: [], nodeId: 'wrapper' }, ref, owned: false, parameters: [], bindings: [] };
    const update = { choices: [{ key: 'revision3', ref: nextRef, label: 'Prepare Context · v3' }], selectedKey: 'revision3', portMap: [{ from: 'context.in', label: 'Context input', to: 'context.in', options: [{ id: 'context.in', label: 'Context input' }, { id: 'text.in', label: 'Text input' }], canDrop: false }], parameterMap: [{ from: 'sections', label: 'Sections', to: 'sections', options: [{ id: 'sections', label: 'Sections' }], canDrop: true }], roleMap: [{ from: 'Analysis', label: 'Analysis', to: 'Analysis', options: [{ id: 'Analysis', label: 'Analysis' }], canDrop: true }], nodeBindingMap: [{ from: oldBinding, label: 'Nested reasoner', to: oldBinding, options: [{ id: oldBinding, label: 'Nested reasoner' }, { id: newBinding, label: 'Reasoner 2' }], canDrop: true }], preparedKey: 'private-prepared-1', summary: ['One instance; maximum 2 requests. No requests are made by Update.'] };
    const view = subgraph({ scope: { kind: 'graph', workflowId: 'root', instancePath: [] }, instance, update, permissions: { libraryWrite: false, insert: false, instanceEdit: true, bodyEdit: false }, capabilities: { ...capabilities, prepareUpdate: true, acceptUpdate: true } });
    const calls = [], f = await fixture('SubgraphManager', view, { prepareUpdate: (...args) => { calls.push(['prepare', ...args]); return success(); }, acceptUpdate: (...args) => { calls.push(['accept', ...args]); return success(); } });
    try {
        assert.equal(calls.length, 0);
        f.host.querySelector('[data-accept-instance-update]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['accept', capture(view, true), 'private-prepared-1', ref, nextRef]);
        change(f.host.querySelector('[data-map-kind="portMap"]'), JSON.stringify('text.in'));
        change(f.host.querySelector('[data-map-kind="parameterMap"]'), 'null');
        change(f.host.querySelector('[data-map-kind="nodeBindingMap"]'), JSON.stringify(newBinding));
        assert.equal(f.host.querySelector('[data-accept-instance-update]').disabled, true, 'local mapping drafts cannot reuse an earlier prepared candidate');
        clickRaw(f.host.querySelector('[data-accept-instance-update]')); assert.equal(calls.length, 0);
        f.host.querySelector('[data-prepare-instance-update]').click(); await tick(); flushSync();
        assert.deepEqual(calls.shift(), ['prepare', capture(view, true), ref, nextRef, { portMap: { 'context.in': 'text.in' }, parameterMap: { sections: null }, roleMap: { Analysis: 'Analysis' }, nodeBindingMap: { [oldBinding]: newBinding } }]);
        f.update({ ...view, revision: 'r2', update: { ...update, preparedKey: null } }); clickRaw(f.host.querySelector('[data-accept-instance-update]')); assert.equal(calls.length, 0, 'UI does not synthesize a prepared key');
        f.update({ ...view, permissions: { ...view.permissions, instanceEdit: false } }); clickRaw(f.host.querySelector('[data-prepare-instance-update]')); clickRaw(f.host.querySelector('[data-accept-instance-update]')); assert.equal(calls.length, 0);
    } finally { await f.close(); }
});

test('reactive parent DTOs dispatch detached plain scope, address and relative-target metadata', async () => {
    const calls = [], p = portal(), f = await fixture('PortalManager', p, { rename: (...args) => { calls.push(args); return success(); } }, true);
    try { input(f.host.querySelector('[aria-label="Portal name"]'), 'Reactive alias'); f.host.querySelector('[data-portal-rename]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), [capture(p), 'portal/one', 'Reactive alias', 'presentation']); }
    finally { await f.close(); }
    const target = { instancePath: ['nested'], nodeId: 'compose', controlId: 'sections' }, instance = { address: { workflowId: 'root', instancePath: ['outer'], nodeId: 'inner' }, ref, owned: true, parameters: [], bindings: [] };
    const s = subgraph({ scope, instance, definition: { ...subgraph().definition, eligibleTargets: [{ key: 'target', label: 'Compose · Sections', target }] }, permissions: { libraryWrite: false, insert: false, instanceEdit: true, bodyEdit: true }, capabilities: { ...capabilities, makeLocalCopy: true, editParameter: true } });
    const g = await fixture('SubgraphManager', s, { makeLocalCopy: (...args) => { calls.push(args); return success(); }, editParameter: (...args) => { calls.push(args); return success(); } }, true);
    try {
        g.host.querySelector('[data-subgraph-local-copy]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), [capture(s, true), instance.address, ref]);
        input(g.host.querySelector('[aria-label="New parameter label"]'), 'Sections'); change(g.host.querySelector('[aria-label="Exposed parameter target"]'), 'target'); g.host.querySelector('[data-add-parameter]').click(); await tick(); flushSync();
        const payload = calls.shift(); assert.deepEqual(payload, [capture(s, true), { kind: 'add', label: 'Sections', target }]);
        structuredClone(payload); payload[0].scope.instancePath.push('detached'); payload[1].target.instancePath.push('detached'); assert.deepEqual(s.scope.instancePath, ['outer', 'inner']); assert.deepEqual(target.instancePath, ['nested']);
    } finally { await g.close(); }
});

test('async validation errors remain scoped to the exact graph, library revision and unchanged local draft', async () => {
    const pending = [], captures = [], p = portal(), f = await fixture('PortalManager', p, { rename: (captured) => { captures.push(captured); return new Promise(resolve => pending.push(resolve)); } });
    try {
        input(f.host.querySelector('[aria-label="Portal name"]'), 'First'); f.host.querySelector('[data-portal-rename]').click();
        input(f.host.querySelector('[aria-label="Portal name"]'), 'Second'); pending.shift()({ ok: false, error: { code: 'OLD', message: 'Old draft error' } }); await tick(); flushSync(); assert.doesNotMatch(f.host.textContent, /Old draft error/); assert.equal(f.host.querySelector('[aria-label="Portal name"]').value, 'Second');
        f.host.querySelector('[data-portal-rename]').click(); const sibling = { ...p, scope: { ...scope, instancePath: ['outer', 'sibling'] } }; f.update(sibling);
        pending.shift()({ ok: false, error: { code: 'OLD', message: 'Wrong scope error' } }); await tick(); flushSync(); assert.doesNotMatch(f.host.textContent, /Wrong scope error/); assert.deepEqual(captures[1], capture(p));
        input(f.host.querySelector('[aria-label="Portal name"]'), 'Current'); f.host.querySelector('[data-portal-rename]').click(); pending.shift()({ ok: false, error: { code: 'CURRENT', message: 'Current rejection' } }); await tick(); flushSync(); assert.match(f.host.textContent, /Current rejection/);
        f.update({ ...sibling, canPresent: false }); clickRaw(f.host.querySelector('[data-portal-rename]')); assert.equal(pending.length, 0);
    } finally { await f.close(); }
    const s = subgraph(), g = await fixture('SubgraphManager', s, { renameRevision: captured => { captures.push(captured); return new Promise(resolve => pending.push(resolve)); } });
    try {
        input(g.host.querySelector('[aria-label="Definition name"]'), 'First revision'); g.host.querySelector('[data-subgraph-rename]').click(); g.update({ ...s, libraryRevision: 'shelf2' }); pending.shift()({ ok: false, error: { code: 'OLD', message: 'Old shelf error' } }); await tick(); flushSync(); assert.doesNotMatch(g.host.textContent, /Old shelf error/);
        input(g.host.querySelector('[aria-label="Definition name"]'), 'Current revision'); g.host.querySelector('[data-subgraph-rename]').click(); g.update({ ...s, libraryRevision: 'shelf2', scope: { kind: 'graph', workflowId: 'other-root', instancePath: [] } }); pending.shift()({ ok: false, error: { code: 'OLD', message: 'Wrong root error' } }); await tick(); flushSync(); assert.doesNotMatch(g.host.textContent, /Wrong root error/);
        assert.equal(g.host.querySelector('[role="status"]'), null, 'stale operation cannot keep the new scope pending');
        input(g.host.querySelector('[aria-label="Definition name"]'), 'Last'); g.host.querySelector('[data-subgraph-rename]').click(); await g.close(); pending.shift()({ ok: false, error: { code: 'CLOSED', message: 'Closed error' } }); await tick(); flushSync();
    } finally { if (g.host.isConnected) await g.close(); }
});

test('explicit navigation, import and selection conversion use current actual choices without implicit effects', async () => {
    const calls = [], otherRef = { id: 'other', version: 1, semanticHash: 'sha256:other' }, entry = { key: 'other-key', ref: otherRef, name: 'Other template', phase: 'pre', nodeCount: 1, wireCount: 0 };
    const view = subgraph({ scope: { kind: 'graph', workflowId: 'root', instancePath: [] }, entries: [...subgraph().entries, entry], permissions: { libraryWrite: true, insert: true, instanceEdit: false, bodyEdit: true }, capabilities: { ...capabilities, convertSelection: true }, selection: { nodeIds: ['compose/one', 'rules/two'], label: '2 selected nodes' } });
    const actions = Object.fromEntries(['selectRef', 'selectDestination', 'importJSON', 'duplicate', 'convertSelection'].map(key => [key, (...args) => { calls.push([key, ...args]); return success(); }]));
    const f = await fixture('SubgraphManager', view, { ...actions, exportJSON: () => { throw new Error('Export could not be prepared.'); } });
    try {
        assert.equal(calls.length, 0);
        change(f.host.querySelector('[aria-label="Library revision"]'), 'other-key'); assert.deepEqual(calls.shift(), ['selectRef', capture(view, true), otherRef]);
        change(f.host.querySelector('[aria-label="Library revision"]'), 'unknown'); assert.equal(calls.length, 0, 'an absent HTML option does not select a fabricated ref');
        change(f.host.querySelector('[aria-label="Insert destination"]'), 'main'); assert.deepEqual(calls.shift(), ['selectDestination', capture(view, true), 'main']);
        f.host.querySelector('[data-subgraph-import]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['importJSON', capture(view, true)]);
        input(f.host.querySelector('[aria-label="Definition name"]'), 'New template'); f.host.querySelector('[data-subgraph-duplicate]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['duplicate', capture(view, true), ref, 'New template']);
        input(f.host.querySelector('[aria-label="Selection subgraph name"]'), 'Formatting'); f.host.querySelector('[data-subgraph-convert-selection]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), ['convertSelection', capture(view, true), ['compose/one', 'rules/two'], 'Formatting']);
        f.host.querySelector('[data-subgraph-export]').click(); await tick(); flushSync(); assert.match(f.host.querySelector('[role="alert"]').textContent, /Export could not be prepared/);
        f.update({ ...view, selection: { ...view.selection, nodeIds: [] } }); clickRaw(f.host.querySelector('[data-subgraph-convert-selection]')); assert.equal(calls.length, 0);
    } finally { await f.close(); }
    const p = portal(), g = await fixture('PortalManager', p, { selectPortal: (...args) => calls.push(args) });
    try { change(g.host.querySelector('[aria-label="Selected portal"]'), 'portal/one'); assert.deepEqual(calls.shift(), [capture(p), 'portal/one']); }
    finally { await g.close(); }
});
test('authored portal rename rejects library scope with a still-enabled capability in raw and reactive DTOs', async () => {
    for (const reactive of [false, true]) {
        const calls = [], view = portal({ readOnly: false, renameMode: 'authored' });
        const f = await fixture('PortalManager', view, { rename: (...args) => { calls.push(args); return success(); } }, reactive);
        try {
            input(f.host.querySelector('[aria-label="Portal name"]'), 'Authored'); f.host.querySelector('[data-portal-rename]').click(); await tick(); flushSync(); assert.equal(calls.length, 1);
            f.update({ ...view, scope: { kind: 'library', definitionRef: ref } }); input(f.host.querySelector('[aria-label="Portal name"]'), 'Forbidden');
            const button = f.host.querySelector('[data-portal-rename]'); assert.equal(button.disabled, true); clickRaw(button); assert.equal(calls.length, 1);
            f.update({ ...view, scope: { kind: 'library', definitionRef: ref }, renameMode: 'presentation', canPresent: true }); input(f.host.querySelector('[aria-label="Portal name"]'), 'Local');
            f.host.querySelector('[data-portal-rename]').click(); await tick(); flushSync(); assert.equal(calls.length, 2); assert.equal(calls[1][3], 'presentation');
        } finally { await f.close(); }
    }
});
test('owning interface and parameter controls reject ownership removal without blocking editable-parent actions', async () => {
    for (const reactive of [false, true]) {
        const calls = [], instance = { address: { workflowId: 'root', instancePath: ['outer'], nodeId: 'inner' }, ref, owned: true, parameters: [], bindings: [] };
        const view = subgraph({ scope, instance, permissions: { libraryWrite: false, insert: false, instanceEdit: true, bodyEdit: true }, capabilities: { ...capabilities, makeLocalCopy: true, editInterface: true, editParameter: true }, definition: { ...subgraph().definition, interface: [{ id: 'input', label: 'Input', kind: 'context', direction: 'input', required: true, boundaryId: 'boundary' }], parameters: [{ id: 'parameter', label: 'Recent', target: { instancePath: [], nodeId: 'compactor', controlId: 'keepRecent' } }] } });
        const f = await fixture('SubgraphManager', view, { editInterface: (...args) => { calls.push(['interface', ...args]); return success(); }, editParameter: (...args) => { calls.push(['parameter', ...args]); return success(); }, makeLocalCopy: (...args) => { calls.push(['copy', ...args]); return success(); } }, reactive);
        try {
            f.update({ ...view, instance: { ...instance, owned: false } });
            assert.equal(f.host.querySelector('[aria-label="Interface label input"]').disabled, true);
            const save = f.host.querySelector('[data-save-interface]'), remove = f.host.querySelector('[data-remove-parameter]'); assert.equal(save.disabled, true); assert.equal(remove.disabled, true); clickRaw(save); clickRaw(remove); assert.deepEqual(calls, []);
            f.host.querySelector('[data-subgraph-local-copy]').click(); await tick(); flushSync(); assert.deepEqual(calls, [['copy', capture(view, true), instance.address, ref]]);
        } finally { await f.close(); }
    }
});
test('optional raw JSON text preserves blank whitespace while structured JSON still requires a value', async () => {
    const calls = [], instance = { address: { workflowId: 'root', instancePath: [], nodeId: 'wrapper' }, ref, owned: false, parameters: [
        { id: 'schema', label: 'Schema', overridden: false, control: { key: 'schema', label: 'Schema', editor: 'json', representation: 'json-text', allowEmpty: true, value: '' } },
        { id: 'structured', label: 'Structured', overridden: false, control: { key: 'structured', label: 'Structured', editor: 'json', representation: 'json-value', allowEmpty: true, value: {} } },
    ], bindings: [] };
    const view = subgraph({ scope: { kind: 'graph', workflowId: 'root', instancePath: [] }, instance, permissions: { libraryWrite: false, insert: false, instanceEdit: true, bodyEdit: false }, capabilities: { ...capabilities, editParameterOverride: true } });
    const f = await fixture('SubgraphManager', view, { editParameterOverride: (...args) => { calls.push(args); return success(); } }, true);
    try {
        const blank = '  \n  '; input(f.host.querySelector('[aria-label="Override Schema"]'), blank); f.host.querySelector('[data-save-override="schema"]').click(); await tick(); flushSync(); assert.deepEqual(calls, [[capture(view, true), 'schema', 'set', blank]]);
        input(f.host.querySelector('[aria-label="Override Structured"]'), blank); clickRaw(f.host.querySelector('[data-save-override="structured"]')); await tick(); flushSync(); assert.equal(calls.length, 1); assert.match(f.host.textContent, /valid JSON/);
    } finally { await f.close(); }
});
