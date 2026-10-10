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

test('reactive parent DTOs dispatch detached plain portal scope metadata', async () => {
    const calls = [], p = portal(), f = await fixture('PortalManager', p, { rename: (...args) => { calls.push(args); return success(); } }, true);
    try { input(f.host.querySelector('[aria-label="Portal name"]'), 'Reactive alias'); f.host.querySelector('[data-portal-rename]').click(); await tick(); flushSync(); assert.deepEqual(calls.shift(), [capture(p), 'portal/one', 'Reactive alias', 'presentation']); }
    finally { await f.close(); }
});

test('async validation errors remain scoped to the exact graph and unchanged local portal draft', async () => {
    const pending = [], captures = [], p = portal(), f = await fixture('PortalManager', p, { rename: (captured) => { captures.push(captured); return new Promise(resolve => pending.push(resolve)); } });
    try {
        input(f.host.querySelector('[aria-label="Portal name"]'), 'First'); f.host.querySelector('[data-portal-rename]').click();
        input(f.host.querySelector('[aria-label="Portal name"]'), 'Second'); pending.shift()({ ok: false, error: { code: 'OLD', message: 'Old draft error' } }); await tick(); flushSync(); assert.doesNotMatch(f.host.textContent, /Old draft error/); assert.equal(f.host.querySelector('[aria-label="Portal name"]').value, 'Second');
        f.host.querySelector('[data-portal-rename]').click(); const sibling = { ...p, scope: { ...scope, instancePath: ['outer', 'sibling'] } }; f.update(sibling);
        pending.shift()({ ok: false, error: { code: 'OLD', message: 'Wrong scope error' } }); await tick(); flushSync(); assert.doesNotMatch(f.host.textContent, /Wrong scope error/); assert.deepEqual(captures[1], capture(p));
        input(f.host.querySelector('[aria-label="Portal name"]'), 'Current'); f.host.querySelector('[data-portal-rename]').click(); pending.shift()({ ok: false, error: { code: 'CURRENT', message: 'Current rejection' } }); await tick(); flushSync(); assert.match(f.host.textContent, /Current rejection/);
        f.update({ ...sibling, canPresent: false }); clickRaw(f.host.querySelector('[data-portal-rename]')); assert.equal(pending.length, 0);
    } finally { await f.close(); }
});

test('explicit portal selection uses its exact current scope without implicit effects', async () => {
    const calls = [];
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
