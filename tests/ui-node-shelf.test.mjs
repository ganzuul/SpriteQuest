import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLMediaElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const client = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(client);
const click = async element => { element.click(); flushSync(); await tick(); flushSync(); };
const keys = async (element, key) => { element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); flushSync(); await tick(); flushSync(); };
const initial = { native: true, families: [
    { name: 'Shaping', operations: [{ id: 'smart-compactor', title: 'Smart Compactor', phase: 'pre', compatible: true }, { id: 'response-plan', title: 'Response Plan', phase: 'pre', compatible: true }] },
    { name: 'Output', operations: [{ id: 'guidance', title: 'Guidance', phase: 'pre', compatible: true }, { id: 'apply-reply', title: 'Apply Reply', phase: 'post', compatible: false }] },
] };

test('a populated Transpose family opens and dispatches its checked creation choice', async () => {
    const calls = [], choices = [{ id: 'operation:style-transfer', label: 'Style Transfer', family: 'Transpose', phase: 'post', purpose: 'Reference voice', shortcode: 'st', ports: [] }];
    await fixture({ view: initial, choices, choose: id => calls.push(id) }, async host => {
        const family = host.querySelector('[data-family="Transpose"]');
        assert.equal(family.disabled, false);
        await click(family);
        await click(host.querySelector('[data-subfamily="Reference voice"]'));
        await click(host.querySelector('[data-shelf-choice="operation:style-transfer"]'));
        assert.deepEqual(calls, ['operation:style-transfer']);
    });
});
async function fixture(props, check) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-node-shelf-')), host = document.createElement('div');
    host.className = 'pc-canvas-area'; host.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1024, bottom: 600, width: 1024, height: 600 });
    Object.defineProperty(host, 'clientWidth', { value: 1024 }); Object.defineProperty(host, 'clientHeight', { value: 600 }); document.body.append(host);
    let instance;
    try {
        const source = await readFile(new URL('../ui/NodeShelf.svelte', import.meta.url), 'utf8'), output = compile(source, { filename: 'NodeShelf.svelte', generate: 'client', css: 'injected' });
        assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
        const code = output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? client : import.meta.resolve(specifier))).replace(/(['"])(\.\.\/src\/[^'"]+)\1/g, (_, quote, specifier) => JSON.stringify(new URL(specifier, new URL('../ui/NodeShelf.svelte', import.meta.url)).href));
        const file = join(directory, 'shelf.mjs'); await writeFile(file, code);
        instance = mount((await import(pathToFileURL(file).href)).default, { target: host, props }); flushSync(); await tick(); await check(host, instance);
    } finally {
        if (instance) await unmount(instance); host.remove();
        const scope = relative(resolve(tmpdir()), resolve(directory)); assert.ok(scope && scope.startsWith('lattice-node-shelf-') && !scope.startsWith('..') && !isAbsolute(scope)); await rm(directory, { recursive: true, force: true });
    }
}
test('approved shelf groups separate purpose from phase and show individual icons and shortcodes', async () => {
    const calls = [];
    await fixture({ view: initial, add: (...args) => calls.push(args) }, async host => {
        await click(host.querySelector('[data-family="Shaping"]'));
        assert.deepEqual([...host.querySelectorAll('[data-subfamily]')].map(row => row.dataset.subfamily), ['Context', 'Planning']);
        assert.ok(host.querySelector('[data-subfamily="Context"] svg'));
        await click(host.querySelector('[data-subfamily="Context"]'));
        const node = host.querySelector('[data-shelf-choice="smart-compactor"]'); assert.ok(node.querySelector('svg')); assert.equal(node.querySelector('small').textContent, 'cp');
        await click(node); assert.deepEqual(calls, [['smart-compactor']]); assert.equal(host.querySelector('.pc-family-menu'), null);
    });
});
test('shelf keyboard traversal owns focus and an incompatible phase cannot dispatch through a raw click', async () => {
    const calls = [];
    await fixture({ view: initial, add: (...args) => calls.push(args) }, async host => {
        const family = host.querySelector('[data-family="Output"]'); await keys(family, 'ArrowRight');
        assert.equal(document.activeElement.dataset.subfamily, 'Guidance'); await keys(document.activeElement, 'ArrowRight');
        assert.equal(document.activeElement.dataset.shelfChoice, 'guidance'); await keys(document.activeElement, 'ArrowLeft');
        assert.equal(document.activeElement.dataset.subfamily, 'Guidance'); await click(host.querySelector('[data-subfamily="Delivery"]'));
        const incompatible = host.querySelector('[data-shelf-choice="apply-reply"]'); assert.equal(incompatible.disabled, true);
        incompatible.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); flushSync(); assert.deepEqual(calls, []);
        await keys(host.querySelector('.pc-leaf-menu'), 'Escape'); assert.equal(document.activeElement, family);
    });
});
test('checked catalog variants and exact shelf choices route current IDs while read-only mutation is guarded', async () => {
    const calls = [], choices = [
        { id: 'operation:compose:input', label: 'Compose · Input', family: 'Shaping', phase: 'pre', purpose: 'Named text', shortcode: 'coi', ports: [] },
        { id: 'definition:exact-pin', label: 'Saved cleanup', family: 'Subgraphs', phase: 'pre', shortcode: 'sg', ports: [] },
    ];
    await fixture({ view: initial, choices, choose: id => calls.push(id), add: () => assert.fail('Catalog choices use the checked producer'), manageSubgraphs: () => calls.push('manage') }, async host => {
        await click(host.querySelector('[data-family="Subgraphs"]')); await click(host.querySelector('[data-subfamily="Library"]'));
        await click(host.querySelector('[data-shelf-choice="definition:exact-pin"]')); assert.deepEqual(calls, ['definition:exact-pin']);
        await click(host.querySelector('[data-family="Subgraphs"]')); await click(host.querySelector('[data-subfamily="Library"]')); await click(host.querySelector('[data-shelf-manage]')); assert.equal(calls.at(-1), 'manage');
    });
    await fixture({ view: initial, choices, readOnly: true, choose: id => calls.push(id), add: () => assert.fail('Read-only creation') }, async host => {
        await click(host.querySelector('[data-family="Shaping"]')); await click(host.querySelector('[data-subfamily="Assembly"]'));
        host.querySelector('[data-shelf-choice="operation:compose:input"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); flushSync(); assert.deepEqual(calls, ['definition:exact-pin', 'manage']);
    });
});
test('hover opens aligned drawers without stealing focus and Escape cancels deferred opening', async () => {
    await fixture({ view: initial, add: () => assert.fail('Browsing cannot create nodes') }, async host => {
        const focus = document.createElement('input'); host.append(focus); focus.focus();
        const family = host.querySelector('[data-family="Shaping"]'); family.dispatchEvent(new dom.window.MouseEvent('pointerenter')); flushSync(); await tick();
        assert.equal(document.activeElement, focus);
        const group = host.querySelector('[data-subfamily="Context"]'); group.dispatchEvent(new dom.window.MouseEvent('pointerenter')); flushSync(); await tick();
        assert.ok(host.querySelector('[data-shelf-choice="smart-compactor"]')); assert.equal(document.activeElement, focus);
        await keys(group, 'Escape'); assert.equal(host.querySelector('.pc-family-menu'), null);
        family.dispatchEvent(new dom.window.MouseEvent('pointerenter')); flushSync();
        await keys(family, 'Escape'); assert.equal(host.querySelector('.pc-family-menu'), null); assert.equal(document.activeElement, family);
    });
});
test('a current disabled catalog entry rejects a raw event from its previously enabled shelf button', async () => {
    const calls = [], choice = { id: 'operation:compose', label: 'Compose', family: 'Shaping', phase: 'pre', shortcode: 'co' };
    await fixture({ view: initial, choices: [choice], choose: id => calls.push(id), add() {} }, async host => {
        await click(host.querySelector('[data-family="Shaping"]')); await click(host.querySelector('[data-subfamily="Assembly"]'));
        const button = host.querySelector('[data-shelf-choice="operation:compose"]'); assert.equal(button.disabled, false);
        choice.disabledReason = 'The current scope no longer permits insertion.';
        button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); flushSync(); assert.deepEqual(calls, []);
    });
});

test('returning to a category cannot restore focus after its drawer is dismissed or replaced', async () => {
    await fixture({ view: initial, add: () => assert.fail('Navigation cannot create nodes') }, async host => {
        const output = host.querySelector('[data-family="Output"]');
        await click(output); await click(host.querySelector('[data-subfamily="Guidance"]'));
        host.querySelector('.pc-leaf-menu').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); flushSync();
        host.querySelector('.pc-family-menu').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); flushSync();
        await tick(); flushSync();
        assert.equal(host.querySelector('.pc-family-menu'), null); assert.equal(document.activeElement, output);

        await click(output); await click(host.querySelector('[data-subfamily="Guidance"]'));
        host.querySelector('.pc-leaf-menu').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); flushSync();
        const shaping = host.querySelector('[data-family="Shaping"]'); shaping.click(); flushSync();
        await tick(); flushSync();
        assert.equal(host.querySelector('.pc-family-menu').getAttribute('aria-label'), 'Shaping categories');
        assert.equal(document.activeElement.dataset.subfamily, 'Context');
    });
});
