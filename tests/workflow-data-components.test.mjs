import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compiled } from './helpers/svelte-compile.mjs';
import { prepareNodeControlChange } from '../src/workflow/ports.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const { mount, unmount, flushSync, tick } = await import(new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href);

async function fixture(initial, actions) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-workflow-data-')), host = document.createElement('div'); document.body.append(host); let mounted;
    const close = async () => { if (mounted) await unmount(mounted); host.remove(); const rel = relative(resolve(tmpdir()), resolve(directory)); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(directory, { recursive: true, force: true }); };
    try {
        const leaf = await compiled('NodeDetails', directory);
        const harness = await compiled('WorkflowDataHarness', directory, `<script>import Leaf from ${JSON.stringify(pathToFileURL(leaf.path).href)}; let { initial, actions } = $props(); let view = $state.raw(initial); export function update(next) { view = next; }</script><Leaf {view} {actions} />`);
        mounted = mount(harness.component, { target: host, props: { initial, actions } }); flushSync();
        return { host, update(next) { mounted.update(next); flushSync(); }, close };
    } catch (error) { await close(); throw error; }
}
const address = { workflowId: 'root', instancePath: [], nodeId: 'clock' };
const selection = { selectionKey: 'clock-details', revision: 'revision1', address };
const clock = { schemaVersion: 1, clockId: 'chat-clock', calendarId: 'story-calendar', dayLengthMinutes: 1440, absoluteMinute: 3005, revision: 1, unit: 'minute', originMinute: 0, originDay: 1, timeEvidence: { kind: 'explicit' }, settledTimeEventIds: ['accepted-event'] };
const definition = { targetId: 'chat-clock', name: 'Chat clock', format: 'json', content: JSON.stringify(clock), visibility: { kind: 'public' } };
const data = extra => ({ kind: 'clock', controlKey: 'clockId', targetId: 'chat-clock', name: 'Chat clock', format: 'json', visibility: { kind: 'public' }, sources: [{ value: 'chat-clock', label: 'Chat clock' }], available: true, editable: true, key: 'catalog1', definition, expectedCalendar: '', ...extra });
const view = extra => ({ ...selection, title: 'Story Clock', canonicalTitle: 'Story Clock', iconPath: 'M3 5h18', family: 'Time', phase: 'pre', operation: 'story-clock', alias: '', compact: false, enabled: true, readOnly: false, canPresent: true, model: null, ports: [], controls: [], workflowData: data(), ...extra });
const input = (element, value) => { assert.ok(element); element.value = value; element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); flushSync(); };
const change = (element, value) => { assert.ok(element); element.value = value; element.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync(); };
const settle = async () => { await tick(); flushSync(); };

test('Expected calendar edits the Story Clock declared validation control without changing initial calendar data', async () => {
    let graph = { id: 'root', schema: 3, runtime: 2, mode: 'native-pre', roles: {}, definitions: {}, portals: {}, groups: {}, wires: {}, nodes: { clock: { id: 'clock', type: 'workflow', operation: 'story-clock', operationVersion: 1, clockId: 'chat-clock', calendarId: '' } } };
    const edits = [], f = await fixture(view(), { editControl(captured, key, value) {
        const prepared = prepareNodeControlChange(graph, { nodeId: captured.address.nodeId, controls: { [key]: value } });
        if (prepared.ok) { graph = prepared.data.candidate; edits.push([captured, key, value]); }
        return prepared;
    } });
    try {
        change(f.host.querySelector('[aria-label="Expected calendar"]'), 'campaign-calendar'); await settle();
        assert.equal(graph.nodes.clock.calendarId, 'campaign-calendar');
        assert.deepEqual(edits, [[selection, 'calendarId', 'campaign-calendar']]);
        assert.equal(f.host.querySelector('[aria-label="Initial calendar name"]').value, 'story-calendar');
        assert.equal(JSON.parse(definition.content).calendarId, 'story-calendar');
        assert.equal(f.host.querySelector('[data-diagnostic]'), null);
    } finally { await f.close(); }
});

test('clock starting fields save minute arithmetic while preserving the loaded template provenance', async () => {
    const saves = [], f = await fixture(view(), { saveWorkflowData: (captured, key, next) => { saves.push([captured, key, next]); return { ok: true }; } });
    try {
        assert.match(f.host.textContent, /Uses Chat clock/);
        assert.equal(f.host.querySelector('[data-workflow-initial]').open, true);
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').value, '3');
        assert.equal(f.host.querySelector('[aria-label="Starting time"]').value, '02:05');
        input(f.host.querySelector('[aria-label="Starting day"]'), '4'); input(f.host.querySelector('[aria-label="Starting time"]'), '05:30'); input(f.host.querySelector('[aria-label="Hours per day"]'), '30');
        f.host.querySelector('[data-save-workflow-data]').click(); await settle();
        assert.equal(saves.length, 1); assert.deepEqual(saves[0].slice(0, 2), [selection, 'catalog1']);
        assert.deepEqual(JSON.parse(saves[0][2].content), { ...clock, absoluteMinute: 5730, dayLengthMinutes: 1800 });
    } finally { await f.close(); }
});

test('a verified same-source refresh retains authored starting values and displays an unconfirmed save before acknowledgment', async () => {
    const original = { ...definition, content: JSON.stringify({ ...clock, absoluteMinute: 0 }) }, saved = { ...definition, content: JSON.stringify({ ...clock, absoluteMinute: 2880 }, null, 2) };
    let resolveSave, f;
    f = await fixture(view({ workflowData: data({ definition: original }) }), { saveWorkflowData: () => {
        f.update(view({ workflowData: data({ key: 'catalog2', definition: saved, notice: 'Settings updated locally; save unconfirmed.' }) }));
        return new Promise(resolve => { resolveSave = resolve; });
    } });
    try {
        input(f.host.querySelector('[aria-label="Starting day"]'), '3'); f.host.querySelector('[data-save-workflow-data]').click(); await settle();
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').value, '3');
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, false);
        assert.match(f.host.querySelector('[role="status"]')?.textContent ?? '', /save unconfirmed/);
        resolveSave({ ok: false, error: { code: 'OLD_ACK', message: 'Obsolete acknowledgment' } }); await settle();
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').value, '3');
        assert.match(f.host.querySelector('[role="status"]')?.textContent ?? '', /save unconfirmed/);
        assert.doesNotMatch(f.host.textContent, /Obsolete acknowledgment/);
        input(f.host.querySelector('[aria-label="Starting day"]'), '4');
        assert.equal(f.host.querySelector('[role="status"]'), null, 'a new unsaved draft cannot retain the previous save status');
    } finally { await f.close(); }
});

test('existing data requires explicit template loading and private visibility requires an actor', async () => {
    const saves = [], f = await fixture(view({ workflowData: data({ definition: undefined }) }), { loadWorkflowData: () => ({ ok: true, data: { definition } }), saveWorkflowData: (_selection, _key, next) => { saves.push(next); return { ok: true }; } });
    try {
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, true);
        f.host.querySelector('[data-load-workflow-data]').click(); await settle();
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, false);
        f.host.querySelector('[data-workflow-visibility="actor-private"]').click(); flushSync();
        assert.ok(f.host.querySelector('[aria-label="Private actor ID"]'));
        assert.equal(f.host.querySelector('[data-save-workflow-data]').disabled, true);
        input(f.host.querySelector('[aria-label="Private actor ID"]'), 'mara');
        f.host.querySelector('[data-save-workflow-data]').click(); await settle();
        assert.deepEqual(saves[0].visibility, { kind: 'actor-private', actorId: 'mara' });
        assert.equal(saves[0].content, JSON.stringify(clock, null, 2));
    } finally { await f.close(); }
});

test('visibility can be saved without reading or replacing an existing initial template', async () => {
    const saves = [], f = await fixture(view({ workflowData: data({ definition: undefined }) }), { saveWorkflowDataVisibility: (...args) => { saves.push(args); return { ok: true }; } });
    try {
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, true);
        f.host.querySelector('[data-workflow-visibility="hidden"]').click(); flushSync();
        f.host.querySelector('[data-save-workflow-data]').click(); await settle();
        assert.deepEqual(saves, [[selection, 'catalog1', { kind: 'hidden' }]]);
        assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, true);
    } finally { await f.close(); }
});

test('compatible sources use short choice buttons and separate clock creation stays inline', async () => {
    const sources = [{ value: 'chat-clock', label: 'Chat clock' }, { value: 'travel', label: 'Travel clock' }, { value: 'dream', label: 'Dream clock' }], binds = [], creates = [];
    const f = await fixture(view({ workflowData: data({ sources }) }), { bindWorkflowData: (...args) => { binds.push(args); return { ok: true }; }, createWorkflowData: (...args) => { creates.push(args); return { ok: true }; } });
    try {
        assert.equal(f.host.querySelector('[aria-label="Clock source"] select'), null);
        f.host.querySelector('[data-workflow-source="travel"]').click(); await settle(); assert.deepEqual(binds, [[selection, 'catalog1', 'travel']]);
        f.host.querySelector('[aria-label="Create separate clock"]').click(); flushSync(); input(f.host.querySelector('[aria-label="New clock name"]'), 'Combat clock');
        f.host.querySelector('[data-create-workflow-data]').click(); await settle();
        assert.deepEqual(creates[0], [selection, 'catalog1', { name: 'Combat clock', kind: 'clock', calendarId: 'story-calendar', absoluteMinute: 3005, dayLengthMinutes: 1440, visibility: { kind: 'public' }, format: 'json' }]);
        f.update(view({ workflowData: data({ sources: [...sources, { value: 'combat', label: 'Combat clock' }] }) }));
        change(f.host.querySelector('select[aria-label="Clock source"]'), 'combat'); await settle(); assert.deepEqual(binds[1], [selection, 'catalog1', 'combat']);
    } finally { await f.close(); }
});

test('a pending load cannot populate a different source and read-only raw events cannot write data', async () => {
    let resolveLoad; const writes = [], f = await fixture(view({ workflowData: data({ definition: undefined }) }), { loadWorkflowData: () => new Promise(resolve => { resolveLoad = resolve; }), saveWorkflowData: (...args) => { writes.push(args); return { ok: true }; }, bindWorkflowData: (...args) => { writes.push(args); return { ok: true }; }, createWorkflowData: (...args) => { writes.push(args); return { ok: true }; } });
    try {
        f.host.querySelector('[data-load-workflow-data]').click(); flushSync();
        f.update(view({ workflowData: data({ targetId: 'travel', name: 'Travel clock', key: 'catalog2', definition: undefined }) }));
        resolveLoad({ ok: true, data: { definition } }); await settle(); assert.equal(f.host.querySelector('[aria-label="Starting day"]').disabled, true);
        f.update(view({ readOnly: true, workflowData: data({ sources: [{ value: 'chat-clock', label: 'Chat clock' }, { value: 'travel', label: 'Travel clock' }] }) }));
        for (const button of f.host.querySelectorAll('[data-save-workflow-data], [data-workflow-source], [aria-label="Create separate clock"]')) button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
        await settle(); assert.deepEqual(writes, []);
    } finally { await f.close(); }
});
