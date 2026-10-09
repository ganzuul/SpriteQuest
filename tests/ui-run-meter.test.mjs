import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync } = await import(clientURL);

async function fixture() {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-run-meter-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    return {
        async show(view, open) {
            const source = await readFile(new URL('../ui/RunMeter.svelte', import.meta.url), 'utf8');
            const compiled = compile(source, { filename: 'RunMeter.svelte', generate: 'client', css: 'injected' });
            assert.deepEqual(compiled.warnings.filter(warning => warning.code.startsWith('a11y')), []);
            const code = compiled.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
            const output = join(directory, 'RunMeter.mjs'); await writeFile(output, code);
            const component = (await import(pathToFileURL(output).href)).default;
            mounted = mount(component, { target: host, props: { view, open } }); flushSync(); return host;
        },
        async close() {
            if (mounted) await unmount(mounted);
            host.remove();
            const cleanup = resolve(directory), parent = resolve(tmpdir()), path = relative(parent, cleanup);
            assert.ok(path && !path.startsWith('..') && !isAbsolute(path), 'cleanup stays within the exact temporary fixture');
            await rm(cleanup, { recursive: true, force: true });
        },
    };
}
const row = (id, status = 'completed') => ({ id, title: 'Stage ' + id, status, executableCount: 1, completedCount: status === 'completed' ? 1 : 0 });

test('one accessible meter retains wrapper display without double-counting executable stages', async () => {
    const f = await fixture(); let opened = 0;
    try {
        const host = await f.show({ status: 'running', rows: [{ ...row('wrapper', 'running'), executableCount: 2, completedCount: 1 }, row('outside', 'waiting')], completedCount: 1, executableCount: 3, actualCalls: 1, callBound: 2, elapsedMs: 1500 }, () => opened++);
        const button = host.querySelector('button'); assert.equal(host.querySelectorAll('button').length, 1);
        assert.match(button.getAttribute('aria-label'), /1 of 3 stages complete/);
        assert.match(button.getAttribute('aria-label'), /1 of 2 requests/);
        assert.equal(host.querySelectorAll('[data-run-pixel]').length, 2);
        assert.equal(host.querySelector('[data-run-pixel]').dataset.status, 'running');
        assert.match(host.textContent, /1\.5s/);
        button.click(); assert.equal(opened, 1);
    } finally { await f.close(); }
});

test('overflow retains failure feedback in one aggregate pixel and details remain reachable', async () => {
    const f = await fixture(); let opened = 0;
    try {
        const rows = Array.from({ length: 40 }, (_, index) => row(String(index)));
        rows[39].status = 'failed'; rows[39].completedCount = 0;
        const host = await f.show({ status: 'failed', rows, completedCount: 39, executableCount: 40, actualCalls: 0, callBound: 0, elapsedMs: null }, () => opened++);
        const pixels = [...host.querySelectorAll('[data-run-pixel]')];
        assert.equal(pixels.length, 36);
        assert.equal(pixels.at(-1).dataset.status, 'failed');
        assert.match(pixels.at(-1).getAttribute('title'), /5 remaining rows/);
        assert.match(host.querySelector('button').getAttribute('aria-label'), /39 of 40 stages complete/);
        assert.equal(host.querySelector('[data-run-elapsed]'), null, 'unknown duration is not invented');
        host.querySelector('button').click(); assert.equal(opened, 1);
    } finally { await f.close(); }
});
