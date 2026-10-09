import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
import { createGraphViewSession } from '../src/ui/graph-view-session.js';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(clientURL);

async function component(name, directory, suppliedSource) {
    const source = suppliedSource ?? await readFile(new URL('../ui/' + name + '.svelte', import.meta.url), 'utf8');
    const compiled = compile(source, { filename: name + '.svelte', generate: 'client', css: 'injected' });
    assert.deepEqual(compiled.warnings.filter(warning => warning.code.startsWith('a11y')), [], 'component accessibility compiler warnings');
    const code = compiled.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
    const path = join(directory, name + '.mjs');
    await writeFile(path, code);
    return (await import(pathToFileURL(path).href)).default;
}

const rootIdentity = { kind: 'root', workflowId: 'root' };
const root = { key: 'root', identity: rootIdentity, label: 'Graph 1', readOnly: false, breadcrumbs: [] };
const child = (key, label) => ({ key, identity: { kind: 'instance', workflowId: 'root', instancePath: [key] }, label, readOnly: true, breadcrumbs: [{ key: 'root', identity: rootIdentity, label: 'Graph 1' }, { key, identity: { kind: 'instance', workflowId: 'root', instancePath: [key] }, label }] });
const keydown = (element, key) => { element.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); flushSync(); };

// Exercise the real source component without rebuilding or consuming the Workbench's generated bundle.
test('tabs retain the root default and provide roving focus, sibling close controls and reopen commands', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-graph-tabs-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        const GraphTabs = await component('GraphTabs', directory);
        mounted = mount(GraphTabs, { target: host }); flushSync();
        assert.equal(host.querySelector('button.pc-graph-tab'), null);
        await unmount(mounted); mounted = null;
        const selected = child('first', 'First child'), second = child('second', 'Second child'), closed = child('closed', 'Closed child');
        const calls = [];
        mounted = mount(GraphTabs, { target: host, props: { views: { workflowId: 'root', viewEpoch: 1, active: selected, tabs: [root, selected, second], closedViews: [closed] }, panelId: 'canvas-panel', actions: { focusView: key => calls.push(['focus', key]), closeView: key => calls.push(['close', key]), reopenView: key => calls.push(['reopen', key]), closeOtherViews: key => calls.push(['others', key]) } } }); flushSync();
        const tabs = [...host.querySelectorAll('[role="tab"]')];
        assert.equal(tabs.length, 3);
        assert.deepEqual(tabs.map(tab => tab.tabIndex), [-1, 0, -1]);
        assert.equal(tabs[1].getAttribute('aria-controls'), 'canvas-panel');
        tabs[1].focus(); keydown(tabs[1], 'ArrowRight');
        assert.equal(document.activeElement, tabs[2]);
        assert.deepEqual(calls.at(-1), ['focus', 'second']);
        keydown(tabs[2], 'Home');
        assert.equal(document.activeElement, tabs[0]);
        assert.deepEqual(calls.at(-1), ['focus', 'root']);
        keydown(tabs[0], 'End');
        assert.equal(document.activeElement, tabs[2]);
        const close = host.querySelector('button[aria-label^="Close First child"]');
        assert.ok(close);
        assert.equal(close.closest('[role="tab"]'), null, 'close control is a sibling, never a nested button');
        close.click(); flushSync();
        assert.deepEqual(calls.at(-1), ['close', 'first']);
        assert.equal(host.querySelector('button[aria-label^="Close Graph 1"]'), null);
        host.querySelector('button[aria-label="Graph view actions"]').click(); flushSync(); await tick();
        const reopen = [...host.querySelectorAll('button')].find(button => button.textContent.includes('Reopen Closed child'));
        assert.ok(reopen); reopen.click(); flushSync();
        assert.deepEqual(calls.at(-1), ['reopen', 'closed']);
    } finally {
        if (mounted) await unmount(mounted);
        host.remove();
        await rm(directory, { recursive: true, force: true });
    }
});

// Root stays visually quiet; children use cached ancestry and library inspection shows the exact revision.
test('breadcrumbs appear only for child/library views and navigate cached identities', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-graph-breadcrumbs-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        const GraphBreadcrumbs = await component('GraphBreadcrumbs', directory);
        mounted = mount(GraphBreadcrumbs, { target: host, props: { view: root } }); flushSync();
        assert.equal(host.querySelector('nav'), null);
        await unmount(mounted); mounted = null;
        const view = child('child', 'Child alias'), calls = [];
        mounted = mount(GraphBreadcrumbs, { target: host, props: { view, definitionRef: { id: 'saved-definition', version: 4, semanticHash: 'exact-hash' }, actions: { focusView: key => calls.push(key) } } }); flushSync();
        assert.equal(host.querySelector('nav').getAttribute('aria-label'), 'Graph location');
        assert.equal(host.querySelector('[aria-current="page"]').textContent, 'Child alias');
        assert.ok(host.textContent.includes('v4'));
        assert.ok(host.textContent.includes('Read only'));
        host.querySelector('button').click(); flushSync();
        assert.deepEqual(calls, ['root']);
        await unmount(mounted); mounted = null;
        const identity = { kind: 'library', workflowId: 'root', definitionRef: { id: 'library-definition', version: 9, semanticHash: 'pinned-hash' } };
        mounted = mount(GraphBreadcrumbs, { target: host, props: { view: { key: 'library', identity, label: 'Library alias', readOnly: true, breadcrumbs: [{ key: 'root', identity: rootIdentity, label: 'Graph 1' }, { key: 'library', identity, label: 'Library alias' }] } } }); flushSync();
        assert.ok(host.textContent.includes('Library inspection'));
        assert.ok(host.textContent.includes('v9'));
        assert.ok(host.querySelector('[title]').getAttribute('title').includes('pinned-hash'));
        assert.equal([...host.querySelectorAll('button')].some(button => /Run|Apply/.test(button.textContent)), false);
    } finally {
        if (mounted) await unmount(mounted);
        host.remove();
        await rm(directory, { recursive: true, force: true });
    }
});

// A parent can switch active views while a menu is open; the old popover cannot retain keyboard ownership.
test('active-view updates close overflow and Escape returns focus to its trigger', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-graph-tab-transition-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        await component('GraphTabs', directory);
        const first = child('first', 'First child'), second = child('second', 'Second child');
        const initial = { workflowId: 'root', viewEpoch: 1, active: first, tabs: [root, first, second], closedViews: [] };
        const source = `<script>import GraphTabs from ${JSON.stringify(pathToFileURL(join(directory, 'GraphTabs.mjs')).href)}; let { initial } = $props(); let views = $state(initial); export function update(next) { views = next; }</script><GraphTabs {views} actions={{focusView() {}}} />`;
        const Harness = await component('GraphTabHarness', directory, source);
        mounted = mount(Harness, { target: host, props: { initial } }); flushSync();
        const trigger = host.querySelector('button[aria-label="Graph view actions"]');
        trigger.click(); flushSync(); await tick();
        assert.ok(host.querySelector('[role="menu"]'));
        mounted.update({ ...initial, active: second, viewEpoch: 2 }); flushSync(); await tick();
        assert.equal(host.querySelector('[role="menu"]'), null);
        assert.deepEqual([...host.querySelectorAll('[role="tab"]')].map(tab => tab.tabIndex), [-1, -1, 0]);
        trigger.click(); flushSync(); await tick();
        const menu = host.querySelector('[role="menu"]');
        keydown(menu.querySelector('button'), 'End');
        assert.equal(document.activeElement, [...menu.querySelectorAll('button:not(:disabled)')].at(-1));
        keydown(document.activeElement, 'Escape');
        assert.equal(host.querySelector('[role="menu"]'), null);
        assert.equal(document.activeElement, trigger);
    } finally {
        if (mounted) await unmount(mounted);
        host.remove();
        await rm(directory, { recursive: true, force: true });
    }
});
const accepted = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };
function actualSession() {
    const root = { id: 'actual/root', nodes: {}, wires: {} };
    const rootIdentity = { kind: 'root', workflowId: root.id };
    const instance = path => ({ kind: 'instance', workflowId: root.id, instancePath: path });
    const navigation = [
        { identity: instance(['parent']), label: 'Parent', readOnly: true },
        { identity: instance(['parent', 'child']), label: 'Nested child', readOnly: true },
        { identity: instance(['sibling']), label: 'Sibling', readOnly: true },
    ];
    const preparedViews = [rootIdentity, ...navigation.map(entry => entry.identity)].map(identity => ({
        identity, ...(identity.kind === 'root' ? {} : { definitionRef: { id: 'saved-definition', version: 1, semanticHash: 'exact-hash' } }),
        savedGraph: { nodes: {}, wires: {} }, effectiveNodes: {}, interface: [], ports: [],
    }));
    return accepted(createGraphViewSession({ root, activationId: 'actual-activation', navigation, preparedViews }));
}
async function reactiveSessionComponent(name, directory) {
    await component(name, directory);
    const source = `<script>import View from ${JSON.stringify(pathToFileURL(join(directory, name + '.mjs')).href)}; let { session, actions } = $props(); let projection = $state.raw(session.project()); export function refresh() { projection = session.project(); } export function setActions(next) { actions = next; }</script><View ${name === 'GraphTabs' ? 'views={projection.graphViews}' : 'view={projection.graphViews.active}'} {actions} />`;
    return component(name + 'SessionHarness', directory, source);
}

// The real store focuses only open views; breadcrumbs must open or reopen a containing instance.
test('nested breadcrumbs open unopened and closed ancestors through the reactive session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-graph-breadcrumb-session-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        const session = actualSession();
        accepted(session.openInstance(['parent', 'child']));
        assert.deepEqual(session.project().graphViews.tabs.map(view => view.label), ['Graph 1', 'Nested child']);
        const results = [];
        const change = action => { const result = action(); results.push(result); mounted.refresh(); };
        const actions = { focusView: key => change(() => session.focusView(key)), openInstance: path => change(() => session.openInstance(path)) };
        const Harness = await reactiveSessionComponent('GraphBreadcrumbs', directory);
        mounted = mount(Harness, { target: host, props: { session, actions } }); flushSync();
        const parentButton = () => [...host.querySelectorAll('button')].find(button => button.textContent === 'Parent');
        parentButton().click(); flushSync(); await tick();
        assert.deepEqual(session.readEditor().view.identity.instancePath, ['parent']);
        assert.equal(results.at(-1).ok, true);
        assert.equal(host.querySelector('[aria-current="page"]').textContent, 'Parent');
        accepted(session.updateView({ camera: { x: 42, y: -10, zoom: 1.4 } }));
        accepted(session.openInstance(['parent', 'child']));
        const parentIdentity = { kind: 'instance', workflowId: 'actual/root', instancePath: ['parent'] };
        accepted(session.closeView(parentIdentity)); mounted.refresh(); flushSync();
        assert.equal(session.project().graphViews.closedViews.some(view => view.label === 'Parent'), true);
        parentButton().click(); flushSync(); await tick();
        assert.deepEqual(session.readEditor().view.identity.instancePath, ['parent']);
        assert.deepEqual(session.readEditor().view.camera, { x: 42, y: -10, zoom: 1.4 });
        assert.equal(session.project().graphViews.closedViews.some(view => view.label === 'Parent'), false);
        host.querySelector('button').click(); flushSync(); await tick();
        assert.equal(session.readEditor().view.identity.kind, 'root', 'Graph 1 breadcrumb keeps its existing focus action');
        assert.equal(host.querySelector('nav'), null);
        accepted(session.openInstance(['parent', 'child'])); mounted.refresh();
        mounted.setActions({ focusView: actions.focusView }); flushSync();
        assert.equal(parentButton().disabled, true, 'an instance ancestor requires openInstance');
        assert.equal([...host.querySelectorAll('button')].find(button => button.textContent === 'Graph 1').disabled, false);
        mounted.setActions({ openInstance: actions.openInstance }); flushSync();
        assert.equal(parentButton().disabled, false);
        assert.equal([...host.querySelectorAll('button')].find(button => button.textContent === 'Graph 1').disabled, true, 'the root requires focusView');
    } finally {
        if (mounted) await unmount(mounted);
        host.remove();
        await rm(directory, { recursive: true, force: true });
    }
});

// After the real reducer closes an active child, selection, tab stop and DOM focus must agree on Graph 1.
test('closing the active tab follows the reactive session surviving active view', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-graph-tab-close-session-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        const session = actualSession();
        accepted(session.openInstance(['parent']));
        accepted(session.openInstance(['sibling']));
        const results = [];
        const change = action => { const result = action(); results.push(result); mounted.refresh(); };
        const actions = { focusView: key => change(() => session.focusView(key)), closeView: key => change(() => session.closeView(key)) };
        const Harness = await reactiveSessionComponent('GraphTabs', directory);
        mounted = mount(Harness, { target: host, props: { session, actions } }); flushSync();
        const tab = label => [...host.querySelectorAll('[role="tab"]')].find(element => element.querySelector('span').textContent === label);
        const assertRootFocus = () => {
            assert.equal(session.readEditor().view.identity.kind, 'root');
            assert.deepEqual([...host.querySelectorAll('[role="tab"]')].map(element => [element.querySelector('span').textContent, element.getAttribute('aria-selected'), element.tabIndex]), [['Graph 1', 'true', 0], ['Parent', 'false', -1]]);
            assert.equal(document.activeElement, tab('Graph 1'));
        };
        assert.equal(tab('Sibling').getAttribute('aria-selected'), 'true');
        const close = host.querySelector('button[aria-label^="Close Sibling"]');
        close.focus(); close.click(); flushSync(); await tick(); flushSync();
        assertRootFocus();
        assert.equal(results.at(-1).ok, true);
        assert.equal(host.querySelector('button[aria-label^="Close Sibling"]'), null);
        accepted(session.openInstance(['sibling'])); mounted.refresh(); flushSync();
        tab('Sibling').focus(); keydown(tab('Sibling'), 'Delete'); await tick(); flushSync();
        assertRootFocus();
        const closedCount = session.project().graphViews.closedViews.length;
        keydown(tab('Graph 1'), 'Delete'); await tick(); flushSync();
        assertRootFocus();
        assert.equal(session.project().graphViews.closedViews.length, closedCount, 'Graph 1 remains permanent');
    } finally {
        if (mounted) await unmount(mounted);
        host.remove();
        await rm(directory, { recursive: true, force: true });
    }
});
