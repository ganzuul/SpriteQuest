import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';
import { prepareNodeControlChange } from '../src/workflow/ports.js';
import { describeOperation } from '../src/workflow/catalog.js';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLMediaElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
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
async function fixture(name, view, actions) {
    const directory = await mkdtemp(join(tmpdir(), 'lattice-detail-panels-'));
    const host = document.createElement('div'); document.body.append(host);
    let mounted;
    try {
        const leaf = await compiled(name, directory);
        const harness = await compiled(name + 'Harness', directory, `<script>import Leaf from ${JSON.stringify(pathToFileURL(leaf.path).href)}; let { initial, actions } = $props(); let view = $state.raw(initial); export function update(next) { view = next; }</script><Leaf {view} {actions} />`);
        mounted = mount(harness.component, { target: host, props: { initial: view, actions } }); flushSync();
        return { host, update(next) { mounted.update(next); flushSync(); }, async close() { await unmount(mounted); host.remove(); const target = resolve(directory), rel = relative(resolve(tmpdir()), target); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(target, { recursive: true, force: true }); } };
    } catch (error) {
        if (mounted) await unmount(mounted); host.remove(); const rel = relative(resolve(tmpdir()), resolve(directory)); assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel)); await rm(directory, { recursive: true, force: true }); throw error;
    }
}
const address = { workflowId: 'root', instancePath: ['instance/one'], nodeId: 'compose' };
const node = extra => ({ selectionKey: JSON.stringify(address), revision: 'revision1', address, title: 'My wording', canonicalTitle: 'Compose', iconPath: 'M3 5h18', family: 'Shaping', phase: 'pre', alias: 'My wording', compact: false, enabled: true, readOnly: false, canPresent: true, model: null, ports: [{ id: 'out', label: 'Output', direction: 'output', kind: 'text' }], controls: [{ key: 'sections', label: 'Sections', editor: 'json', representation: 'json-value', value: [{ name: 'intro', text: 'Hello' }] }], ...extra });
const change = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('change', { bubbles: true })); flushSync(); };
const input = (element, value) => { element.value = value; element.dispatchEvent(new dom.window.Event('input', { bubbles: true })); flushSync(); };
const success = () => ({ ok: true });

test('selected deterministic details keep canonical identity and guard readonly semantic edits separately from presentation', async () => {
    const calls = [];
    const f = await fixture('NodeDetails', node({ readOnly: true }), { present: (...args) => { calls.push(['present', ...args]); return success(); }, editControl: (...args) => { calls.push(['control', ...args]); return success(); }, editField: (...args) => { calls.push(['field', ...args]); return success(); } });
    try {
        assert.match(f.host.textContent, /Canonical type: Compose/); assert.match(f.host.textContent, /My wording/);
        assert.equal(f.host.querySelector('[data-model-controls]'), null);
        assert.equal(f.host.querySelector('[aria-label="Sections"]').disabled, true);
        change(f.host.querySelector('[aria-label="Alias"]'), 'Alias two');
        assert.equal(calls.length, 1); assert.deepEqual(calls[0], ['present', { selectionKey: JSON.stringify(address), revision: 'revision1', address }, 'alias', 'Alias two']);
        input(f.host.querySelector('[aria-label="Sections"]'), '[]'); f.host.querySelector('[data-save-control="sections"]').click();
        assert.equal(calls.length, 1, 'raw events cannot bypass readonly semantic guard');
        f.update(node({ readOnly: true, canPresent: false })); change(f.host.querySelector('[aria-label="Alias"]'), 'blocked');
        assert.equal(calls.length, 1, 'presentation permission has its own guard');
    } finally { await f.close(); }
});

test('model controls honor producer allowed modes and show inherited effective binding separately', async () => {
    const calls = [], inherit = { value: 'inherit', label: 'Use role binding' }, override = { value: 'override', label: 'Override' };
    const model = { role: 'Analysis', roleEditable: true, effective: 'Reasoner · profile model', source: 'Instance role override', profile: { mode: 'inherit', allowedModes: [inherit, override], value: null, options: [{ value: 'profileA', label: 'Reasoner' }] }, model: { mode: 'block', allowedModes: [inherit, override, { value: 'block', label: 'Block inheritance' }], value: null } };
    const f = await fixture('NodeDetails', node({ canonicalTitle: 'Response Plan', model }), { editBinding: (...args) => { calls.push(args); return success(); }, editField: success });
    try {
        assert.match(f.host.textContent, /Effective connection: Reasoner · profile model/); assert.match(f.host.textContent, /Instance role override/);
        const connection = f.host.querySelector('[aria-label="Connection mode"]');
        assert.deepEqual([...connection.options].map(option => option.value), ['inherit', 'override'], 'historical null fallback does not acquire invented block semantics');
        assert.equal(f.host.querySelector('[aria-label="Model mode"]').value, 'block');
        change(connection, 'override');
        assert.equal(calls.length, 0, 'choosing Override only reveals the value editor');
        change(f.host.querySelector('[aria-label="Connection profile"]'), 'profileA');
        assert.deepEqual(calls[0], [{ selectionKey: JSON.stringify(address), revision: 'revision1', address }, 'profileId', 'override', 'profileA']);
        f.update(node({ model, readOnly: true })); change(f.host.querySelector('[aria-label="Model mode"]'), 'inherit');
        assert.equal(calls.length, 1);
        f.update(node({ model: null })); assert.equal(f.host.querySelector('[data-model-controls]'), null);
    } finally { await f.close(); }
});

test('model role dispatch rechecks the current role capability in editable bodies and after reactive removal', async () => {
    const calls = [], inherit = { value: 'inherit', label: 'Use role binding' };
    const model = { role: 'Analysis', roleEditable: false, effective: 'Reasoner', source: 'Root role', profile: { mode: 'inherit', allowedModes: [inherit], value: null }, model: { mode: 'inherit', allowedModes: [inherit], value: null } };
    const f = await fixture('NodeDetails', node({ readOnly: false, model }), { editField: (...args) => { calls.push(args); return success(); } });
    try {
        const role = f.host.querySelector('[aria-label="Model role"]');
        assert.equal(role.disabled, true); change(role, 'Forbidden role');
        assert.equal(calls.length, 0, 'an editable body does not grant a noneditable model role');
        f.update(node({ readOnly: false, model: { ...model, roleEditable: true } }));
        assert.equal(role.disabled, false); change(role, 'Allowed role');
        assert.deepEqual(calls, [[{ selectionKey: JSON.stringify(address), revision: 'revision1', address }, 'modelRole', 'Allowed role']]);
        f.update(node({ readOnly: false, model }));
        assert.equal(f.host.querySelector('[aria-label="Model role"]'), role, 'reactive permission update retains the mounted input');
        assert.equal(role.disabled, true); change(role, 'Revoked role');
        assert.equal(calls.length, 1, 'the handler checks current capability after it is removed');
        f.update(node({ model: null })); assert.equal(f.host.querySelector('[aria-label="Model role"]'), null); assert.equal(calls.length, 1);
    } finally { await f.close(); }
});

test('JSON drafts preserve connected pins on complete-candidate rejection and raw schema text is never converted to an object', async () => {
    const graph = { id: 'root', schema: 3, runtime: 2, mode: 'native-pre', definitions: {}, portals: {}, nodes: { source: { id: 'source', type: 'workflow', operation: 'compose' }, compose: { id: 'compose', type: 'workflow', operation: 'compose', sections: [{ name: 'intro', text: 'Hello' }], model: 'portable-model' } }, wires: { edge: { id: 'edge', route: 'wire', from: 'source', fromPort: 'out', to: 'compose', toPort: 'section.intro' } } };
    const before = structuredClone(graph), values = [];
    const f = await fixture('NodeDetails', node(), { editControl: (captured, key, value) => { values.push(value); const prepared = prepareNodeControlChange(graph, { nodeId: captured.address.nodeId, controls: { [key]: value } }); return prepared.ok ? success() : prepared; } });
    try {
        input(f.host.querySelector('[aria-label="Sections"]'), '{broken'); f.host.querySelector('[data-save-control="sections"]').click(); flushSync();
        assert.equal(values.length, 0); assert.match(f.host.textContent, /valid JSON/);
        input(f.host.querySelector('[aria-label="Sections"]'), '[]'); f.host.querySelector('[data-save-control="sections"]').click(); await tick(); flushSync();
        assert.deepEqual(values, [[]]); assert.match(f.host.querySelector('[role="alert"]').textContent, /port|endpoint/i);
        assert.equal(f.host.querySelector('[aria-label="Sections"]').value, '[]'); assert.deepEqual(graph, before, 'rejected draft cannot mutate source graph, bindings or connected pins');
        const text = '  {"type":"object","required":["name"]}  ';
        f.update(node({ revision: 'schema-revision', canonicalTitle: 'JSON Decode', controls: [{ key: 'schema', label: 'Schema', editor: 'json', representation: 'json-text', allowEmpty: true, value: '' }] }));
        input(f.host.querySelector('[aria-label="Schema"]'), text); f.host.querySelector('[data-save-control="schema"]').click(); await tick(); flushSync();
        assert.equal(values.at(-1), text, 'raw JSON schema whitespace/string representation is preserved');
        input(f.host.querySelector('[aria-label="Schema"]'), ''); f.host.querySelector('[data-save-control="schema"]').click(); await tick(); flushSync(); assert.equal(values.at(-1), '', 'empty optional schema remains valid JSON-text setting');
    } finally { await f.close(); }
});

test('obsolete validation responses cannot leak into a new draft or qualified selection', async () => {
    const pending = [], captures = [];
    const f = await fixture('NodeDetails', node(), { editControl: (captured, key, value) => { captures.push(captured); return new Promise(resolve => pending.push(resolve)); } });
    try {
        input(f.host.querySelector('[aria-label="Sections"]'), '[]'); f.host.querySelector('[data-save-control="sections"]').click();
        input(f.host.querySelector('[aria-label="Sections"]'), '[{"name":"new","text":"New draft"}]');
        pending[0]({ ok: false, error: { code: 'OLD_ERROR', message: 'Old failure' } }); await tick(); flushSync();
        assert.doesNotMatch(f.host.textContent, /Old failure/); assert.match(f.host.querySelector('[aria-label="Sections"]').value, /New draft/);
        f.host.querySelector('[data-save-control="sections"]').click();
        const changed = node({ selectionKey: 'sibling', revision: 'revision2', address: { ...address, instancePath: ['instance/two'] }, controls: [{ key: 'sections', label: 'Sections', editor: 'json', representation: 'json-value', value: [] }] });
        f.update(changed); pending[1]({ ok: false, error: { code: 'STALE', message: 'Wrong sibling failure' } }); await tick(); flushSync();
        assert.deepEqual(captures[1], { selectionKey: JSON.stringify(address), revision: 'revision1', address });
        assert.doesNotMatch(f.host.textContent, /Wrong sibling failure/); assert.equal(f.host.querySelector('[aria-label="Sections"]').value, '[]');
    } finally { await f.close(); }
});

const terminal = nodeId => ({ kind: 'terminal', address: { workflowId: 'root', instancePath: [], nodeId } });
const selector = nodeId => ({ handleId: 'opaque-' + nodeId, runId: 'run-one', terminal: terminal(nodeId) });
const preview = extra => ({ sourceKey: 'source-one', title: 'Apply Reply', status: 'current', choices: [{ key: 'applyA', label: 'First host result', kind: 'candidate', target: terminal('applyA') }, { key: 'applyB', label: 'Second host result', kind: 'candidate', target: terminal('applyB') }], selectedKey: null, pinned: false, followSelection: true, sections: [{ id: 'candidate', label: 'Recorded candidate', kind: 'candidate', text: 'Bounded recorded preview', format: 'structured-text', truncated: true }], issues: [], busy: false, runHere: { enabled: true, callBound: 2 }, review: { selector: selector('applyA'), canApply: true, fresh: true, selectedRootTerminal: true, mode: 'root' }, ...extra });

test('preview requires an explicit matching root terminal and never turns recorded text or target runs into Apply authority', async () => {
    const applied = [], runs = [], selections = [];
    const f = await fixture('OutputPreview', preview(), { select: (...args) => selections.push(args), runHere: (...args) => runs.push(args), apply: value => applied.push(value) });
    try {
        const apply = () => f.host.querySelector('[data-preview-apply]');
        assert.equal(apply().disabled, true, 'multiple terminals require explicit selection');
        assert.match(f.host.textContent, /Truncated diagnostic/);
        change(f.host.querySelector('[aria-label="Preview output"]'), 'applyB'); assert.deepEqual(selections[0], ['source-one', 'applyB', terminal('applyB')]);
        f.update(preview({ selectedKey: 'applyB' })); assert.equal(apply().disabled, true, 'selected terminal must match the opaque handle');
        f.update(preview({ selectedKey: 'applyA' })); assert.equal(apply().disabled, false); apply().click(); assert.deepEqual(applied, [selector('applyA')]); assert.equal('text' in applied[0], false);
        f.host.querySelector('[data-run-here]').click(); assert.deepEqual(runs, [['source-one', terminal('applyA')]]); assert.match(f.host.querySelector('[data-run-here]').textContent, /maximum 2 requests/);
        for (const extra of [{ status: 'stale' }, { status: 'removed' }, { review: { ...preview().review, mode: 'target' } }, { review: { ...preview().review, fresh: false } }, { busy: true }]) {
            f.update(preview({ selectedKey: 'applyA', ...extra })); assert.equal(apply().disabled, true); apply().click();
        }
        assert.equal(applied.length, 1, 'disabled or obsolete review states dispatch no apply');
    } finally { await f.close(); }
});

test('hierarchical run details retain stable rows, supplied primitive counters and truthful unknown usage with explicit navigation', async () => {
    const jumps = [];
    const row = (key, title, kind, depth, status) => ({ key, title, kind, depth, status, address: { workflowId: 'root', instancePath: depth ? ['subgraph'] : [], nodeId: key }, durationMs: null, attempts: 0, callBound: 0, usage: null });
    const view = { runId: 'run-details', status: 'failed', elapsedMs: null, actualCalls: 1, callBound: 2, completedCount: 1, executableCount: 3, rows: [row('subgraph', 'Formatting stack', 'instance', 0, 'failed'), { ...row('failed', 'Text Rules', 'primitive', 1, 'failed'), issue: 'RULE_WORKER_TIMEOUT: Rule exceeded deadline' }, row('blocked', 'JSON Decode', 'primitive', 1, 'blocked'), { ...row('complete', 'Independent plan', 'primitive', 0, 'completed'), durationMs: 1250, attempts: 1, callBound: 2, usage: { inputTokens: 300, outputTokens: 42, totalTokens: null, cost: null } }] };
    const f = await fixture('RunDetails', view, { jump: (...args) => jumps.push(args) });
    try {
        assert.match(f.host.textContent, /1 of 3 stages complete/); assert.match(f.host.textContent, /1 of 2 requests/);
        assert.deepEqual([...f.host.querySelectorAll('[data-run-row]')].map(row => row.dataset.runRow), ['subgraph', 'failed', 'blocked', 'complete']);
        assert.equal(f.host.querySelector('[data-run-row="failed"]').dataset.depth, '1');
        assert.match(f.host.textContent, /Elapsed: Unknown/); assert.match(f.host.textContent, /Input tokens: 300/); assert.match(f.host.textContent, /Total tokens: Unknown/); assert.match(f.host.textContent, /Cost: Unknown/); assert.match(f.host.textContent, /1\.25s/);
        assert.equal(jumps.length, 0, 'rendering never steals selection or navigation');
        f.host.querySelector('[aria-label="Open Text Rules in graph"]').click();
        assert.deepEqual(jumps, [['run-details', view.rows[1].address]]);
        f.update({ ...view, status: 'cancelled', rows: view.rows.map(row => ({ ...row, status: 'cancelled' })) });
        assert.equal(jumps.length, 1, 'state feedback does not navigate implicitly');
    } finally { await f.close(); }
});

test('catalog-described primitive controls stay ordinary explicit editors with no model or run effects', async () => {
    const f = await fixture('NodeDetails', null, {});
    try {
        for (const [operation, settings] of [['compose', { sections: [{ name: 'intro', text: 'Hello' }] }], ['text-rules', { rules: [{ kind: 'literal', pattern: 'very', replacement: '' }] }], ['json-decode', { schema: '' }], ['select-fields', { fields: [{ name: 'name', path: ['name'] }] }], ['context-join', { inputs: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }] }], ['smart-compactor', { method: 'select' }], ['pattern-scan', {}]]) {
            const phase = operation === 'pattern-scan' ? 'post' : 'pre';
            const work = { id: 'work', type: 'workflow', operation, operationVersion: 1, ...settings };
            const g = { id: 'root', schema: 3, runtime: 2, mode: 'native-' + phase, nodes: { work }, wires: {}, definitions: {}, portals: {} };
            const result = describeOperation(g, work); assert.equal(result.ok, true, JSON.stringify(result));
            const { descriptor, ports } = result.data;
            const controls = descriptor.controls.map(key => {
                const d = descriptor.controlDescriptors[key], value = work[key] === undefined ? descriptor.defaults[key] : work[key];
                return { key, label: d.label ?? key, value, editor: d.type === 'enum' ? 'enum' : d.type === 'boolean' ? 'boolean' : d.type === 'integer' ? 'number' : d.editor === 'json' || d.type === 'array' ? 'json' : 'text', ...(d.type === 'enum' ? { options: d.values.map(value => ({ value, label: value })) } : {}), ...(d.type === 'integer' ? { min: d.min, max: d.max } : {}), ...(d.editor === 'json' || d.type === 'array' ? { representation: d.type === 'string' ? 'json-text' : 'json-value', allowEmpty: d.type === 'string' } : {}) };
            });
            f.update(node({ revision: operation, canonicalTitle: descriptor.title, controls, ports }));
            assert.match(f.host.textContent, new RegExp('Canonical type: ' + descriptor.title));
            assert.equal(f.host.querySelector('[data-model-controls]'), null);
            for (const control of controls) {
                const editor = f.host.querySelector('[aria-label="' + control.label + '"]'); assert.ok(editor, operation + '/' + control.key);
                if (control.editor === 'json') assert.equal(editor.value, control.representation === 'json-text' ? control.value : JSON.stringify(control.value, null, 2));
            }
            if (operation === 'context-join') assert.doesNotMatch(f.host.textContent, /Edit inputs inside/, 'actual body editor is not confused with the exposed-parameter picker');
        }
    } finally { await f.close(); }
});

test('recording preview preserves actual output addresses, artifact kinds and removed pinned source without implicit requests', async () => {
    const calls = [], output = { workflowId: 'root', instancePath: ['first/sibling', 'nested|part'], nodeId: 'decode', portId: 'data/output' };
    const choices = [{ key: 'data', label: 'Decoded data', kind: 'data', target: output }, { key: 'text', label: 'Source text', kind: 'text', target: { ...output, portId: 'text/output' } }];
    const f = await fixture('OutputPreview', preview({ choices, selectedKey: 'data', review: null, sections: [{ id: 'data', label: 'Output', kind: 'data', format: 'json-prefix-text', text: '{"value":"partial', truncated: true }, { id: 'missing', label: 'Input', kind: 'text', format: 'omitted', text: 'Artifact omitted: recording-byte-limit', truncated: false }] }), { pin: (...args) => calls.push(['pin', ...args]), follow: () => calls.push(['follow']), runHere: (...args) => calls.push(['run', ...args]), select: (...args) => calls.push(['select', ...args]) });
    try {
        assert.equal(calls.length, 0); assert.equal(f.host.querySelector('[data-preview-apply]'), null);
        assert.equal(f.host.querySelector('[data-artifact-kind="data"] pre').textContent, '{"value":"partial'); assert.match(f.host.textContent, /JSON prefix shown as text/); assert.match(f.host.textContent, /Artifact omitted/);
        f.host.querySelector('button[aria-pressed="false"]').click(); assert.deepEqual(calls[0], ['pin', 'source-one', output]);
        f.update(preview({ choices, selectedKey: 'data', review: null, pinned: true, followSelection: false, status: 'removed', statusDetail: 'Pinned source was removed. Recording preserved.' }));
        assert.match(f.host.textContent, /Source removed/); assert.match(f.host.textContent, /Recording preserved/); assert.equal(f.host.querySelector('[data-run-here]').disabled, true);
        f.host.querySelector('[data-run-here]').click(); assert.equal(calls.length, 1);
        [...f.host.querySelectorAll('button')].find(button => button.textContent === 'Unpin preview').click(); assert.deepEqual(calls[1], ['follow']);
    } finally { await f.close(); }
});

test('reject addresses the explicitly selected terminal rather than an unrelated retained selector', async () => {
    const rejected = [];
    const f = await fixture('OutputPreview', preview({ selectedKey: 'applyB' }), { reject: value => rejected.push(value) });
    try {
        const button = () => [...f.host.querySelectorAll('button')].find(button => button.textContent === 'Reject candidate');
        assert.equal(button().disabled, true); button().click(); assert.equal(rejected.length, 0);
        f.update(preview({ selectedKey: 'applyA', status: 'stale' })); assert.equal(button().disabled, false); button().click(); assert.deepEqual(rejected, [selector('applyA')]);
    } finally { await f.close(); }
});
