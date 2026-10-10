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
const client = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(client);
const settle = async () => { flushSync(); await tick(); flushSync(); };
const input = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); flushSync(); };
const change = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync(); };
const initial = { key: 'save/local-1', name: 'Cleanup', targetId: 'saved-cleanup', entries: [{ id: 'saved-cleanup', name: 'Cleanup' }, { id: 'saved-format', name: 'Format' }] };

async function fixture(view, actions) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-subgraph-save-')), host = document.createElement('div'); document.body.append(host); let instance;
    async function compiled(name, source) {
        const result = compile(source, { filename: name + '.svelte', generate: 'client', css: 'injected' });
        assert.deepEqual(result.warnings.filter(warning => warning.code.startsWith('a11y')), []);
        const file = join(directory, name + '.mjs'), code = result.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? client : import.meta.resolve(specifier)));
        await writeFile(file, code); return file;
    }
    const cleanup = async () => { if (instance) await unmount(instance); host.remove(); const scope = relative(resolve(tmpdir()), resolve(directory)); assert.ok(scope && !scope.startsWith('..') && !isAbsolute(scope)); await rm(directory, { recursive: true, force: true }); };
    try {
        const leaf = await compiled('SubgraphSave', await readFile(new URL('../ui/SubgraphSave.svelte', import.meta.url), 'utf8'));
        const harness = await compiled('Harness', `<script>import Save from ${JSON.stringify(pathToFileURL(leaf).href)}; let { initial, actions } = $props(); let view = $state.raw(initial); export function update(next) { view = next; }</script><Save {view} {actions} />`);
        instance = mount((await import(pathToFileURL(harness).href)).default, { target: host, props: { initial: view, actions } }); await settle();
        return { host, async update(next) { instance.update(next); await settle(); }, close: cleanup };
    } catch (error) { await cleanup(); throw error; }
}

test('saving a subgraph explicitly chooses a new entry or a shelf replacement without changing placed copies', async () => {
    const calls = [], f = await fixture(initial, { close: () => calls.push('close'), save: (...args) => calls.push(args) });
    try {
        const name = f.host.querySelector('[aria-label="Subgraph name"]'), target = f.host.querySelector('[aria-label="Save as"]');
        assert.equal(name.value, 'Cleanup'); assert.equal(target.value, 'saved-cleanup'); assert.equal(document.activeElement, name);
        assert.match(f.host.textContent, /Existing placed copies stay unchanged/); assert.equal(calls.length, 0);
        input(name, 'Cleanup with formatting'); f.host.querySelector('[data-save-subgraph]').click(); await settle();
        assert.deepEqual(calls, [['save/local-1', 'Cleanup with formatting', 'saved-cleanup']]);
        change(target, ''); f.host.querySelector('[data-save-subgraph]').click(); await settle();
        assert.deepEqual(calls.at(-1), ['save/local-1', 'Cleanup with formatting', null]);
        input(name, '   '); assert.equal(f.host.querySelector('[data-save-subgraph]').disabled, true);
        f.host.querySelector('[data-save-subgraph]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); await settle(); assert.equal(calls.length, 2);
    } finally { await f.close(); }
});

test('save dialog owns modal keys, preserves failed drafts and resets captures for a different subgraph', async () => {
    const calls = [], bubbled = [], f = await fixture(initial, { close: () => calls.push('close'), save: (...args) => calls.push(args) });
    try {
        f.host.addEventListener('keydown', event => bubbled.push(event.key));
        const dialog = f.host.querySelector('[role="dialog"]'), name = f.host.querySelector('[aria-label="Subgraph name"]');
        input(name, 'Draft'); await f.update({ ...initial, error: 'Cannot save disconnected required output.' });
        assert.equal(name.value, 'Draft'); assert.match(f.host.querySelector('[role="alert"]').textContent, /Cannot save/);
        dialog.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })); flushSync();
        assert.deepEqual(calls, ['close']); assert.deepEqual(bubbled, []);
        const first = f.host.querySelector('[aria-label="Close save subgraph"]'), last = f.host.querySelector('[data-save-subgraph]');
        first.focus(); first.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })); flushSync(); assert.equal(document.activeElement, last);
        last.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })); flushSync(); assert.equal(document.activeElement, first);
        await f.update({ ...initial, key: 'save/local-2', name: 'Another', targetId: null });
        assert.equal(name.value, 'Another'); assert.equal(f.host.querySelector('[aria-label="Save as"]').value, '');
        f.host.querySelector('[data-save-subgraph]').click(); await settle(); assert.deepEqual(calls.at(-1), ['save/local-2', 'Another', null]);
    } finally { await f.close(); }
});

test('pending saves cannot dispatch twice and an old acknowledgment cannot settle a newer dialog', async () => {
    const calls = [], pending = [], f = await fixture(initial, { close() {}, save: (...args) => { calls.push(args); return new Promise(resolve => pending.push(resolve)); } });
    try {
        const save = f.host.querySelector('[data-save-subgraph]'); save.click(); flushSync(); assert.equal(save.disabled, true);
        f.host.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); flushSync(); assert.equal(calls.length, 1);
        await f.update({ ...initial, key: 'save/newer', targetId: null }); assert.equal(save.disabled, false);
        save.click(); flushSync(); assert.equal(calls.length, 2); assert.equal(save.disabled, true);
        pending.shift()(); await settle(); assert.equal(save.disabled, true, 'obsolete save acknowledgment cannot clear a new request');
        pending.shift()(); await settle(); assert.equal(save.disabled, false);
    } finally { await f.close(); }
});
