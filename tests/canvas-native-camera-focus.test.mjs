import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { fixture, mouse, dom, version } from './canvas-fixture.mjs';

for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLMediaElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLSelectElement', 'MutationObserver']) Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync, tick } = await import(clientURL);
const { starterGraph } = await import(`../src/workflow/starters.js?v=${version}`);
const { normalizeNativeGraph } = await import(`../src/workflow/migration.js?v=${version}`);
const { createGraphViewSession } = await import(`../src/ui/graph-view-session.js?v=${version}`);
const { projectPreparedWorkflow } = await import(`../src/ui/workflow-surface.js?v=${version}`);
const { prepareWorkspaceViews, projectEditorDraw, projectWorkspacePanels } = await import(`../src/ui/workspace-preparation.js?v=${version}`);
const directory = await mkdtemp(join(tmpdir(), 'lattice-native-camera-focus-'));
after(async () => {
    const target = resolve(directory), rel = relative(resolve(tmpdir()), target);
    assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel));
    await rm(target, { recursive: true, force: true });
});
const source = await readFile(new URL('../ui/NodeDetails.svelte', import.meta.url), 'utf8');
const output = compile(source, { filename: 'NodeDetails.svelte', generate: 'client', css: 'injected' });
assert.deepEqual(output.warnings.filter(warning => warning.code.startsWith('a11y')), []);
const code = output.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
const componentPath = join(directory, 'NodeDetails.mjs');
await writeFile(componentPath, code);
const Details = (await import(pathToFileURL(componentPath).href)).default;
let sequence = 0;
const keyboard = (target, type, key, code = key) => {
    const event = new dom.window.KeyboardEvent(type, { bubbles: true, cancelable: true, key, code });
    target.dispatchEvent(event); return event;
};
async function cameraFixture(native = true) {
    const root = normalizeNativeGraph(starterGraph('native-guidance')).data;
    root.id = 'camera-focus-' + ++sequence;
    const counts = { bindings: 0, preparation: 0, changes: 0, edits: 0 };
    const prepared = prepareWorkspaceViews(root, { resolveBinding: () => { counts.bindings++; return { ok: true, data: { profileId: 'cached', model: 'cached-model' } }; } });
    assert.equal(prepared.ok, true, JSON.stringify(prepared));
    const views = createGraphViewSession({ root, activationId: root.id, ...prepared.data }).data;
    const drawing = projectEditorDraw(views.readEditor());
    const workflow = projectPreparedWorkflow(prepared.data.workflow, { selectedId: 'response-plan' });
    const view = projectWorkspacePanels(views.readEditor(), workflow, { busy: false, availability: 'current' }, 'camera:1', null, null).nodeDetails;
    assert.ok(view.controls.some(control => control.key === 'instructions'));
    const real = fixture({ nativeCard: node => drawing.nativeCards[node.id], nativeScope: () => ({ workflowId: root.id, instancePath: [], readOnly: false }), canEdit: () => true,
        prepareRender: () => { counts.preparation++; }, onChange: () => { counts.changes++; } });
    if (native) real.canvas.setGraph(drawing);
    const workspace = document.createElement('div'); workspace.className = 'pc-root pc-open'; document.body.append(workspace); workspace.append(real.host);
    const detailHost = document.createElement('div'); workspace.append(detailHost);
    const edited = () => { counts.edits++; return { ok: true }; };
    const mounted = mount(Details, { target: detailHost, props: { view, actions: { present: edited, editField: edited, editControl: edited, editBinding: edited } } }); flushSync();
    const editor = detailHost.querySelector('textarea[aria-label="instructions"]'); assert.ok(editor && !editor.disabled);
    const saved = JSON.stringify(root), content = JSON.stringify({ nodes: real.canvas.graph.nodes, wires: real.canvas.graph.wires, groups: real.canvas.graph.groups, updatedAt: real.canvas.graph.updatedAt });
    const baseline = { ...counts }, node = real.host.querySelector(native ? '.pc-node-native' : '.pc-node'); assert.ok(node);
    return { ...real, workspace, detailHost, editor, node, counts,
        assertPreserved() {
            assert.equal(document.activeElement, editor, 'the exact mounted NodeDetails editor must retain focus');
            assert.equal(editor.isConnected, true);
            assert.equal(detailHost.querySelector('textarea[aria-label="instructions"]'), editor);
            assert.equal(real.host.querySelector(native ? '.pc-node-native' : '.pc-node'), node, 'camera motion must retain the keyed card');
            assert.equal(JSON.stringify(root), saved);
            assert.equal(JSON.stringify({ nodes: real.canvas.graph.nodes, wires: real.canvas.graph.wires, groups: real.canvas.graph.groups, updatedAt: real.canvas.graph.updatedAt }), content);
            assert.deepEqual(counts, baseline, 'camera focus does not prepare, bind, edit or touch documents');
        },
        async close() { await real.canvas.destroy(); await unmount(mounted); workspace.remove(); }
    };
}
async function finishPan(f, button) {
    const before = { ...f.canvas.view };
    mouse(window, 'mousemove', 235, 125, { buttons: button === 1 ? 4 : 1 });
    mouse(window, 'mouseup', 235, 125, { button });
    f.canvas.frames.flush(); await tick(); flushSync();
    assert.notDeepEqual(f.canvas.view, before, 'the genuine pan still moves the camera');
    assert.equal(f.canvas.pan, null); assert.equal(f.host.classList.contains('pc-panning'), false);
}
for (const mode of ['MMB', 'Pan', 'Space']) test(`native ${mode} camera pan and wheel retain the actual NodeDetails editor and typing protection`, async () => {
    const f = await cameraFixture();
    try {
        if (mode === 'Pan') f.canvas.setMode('pan');
        if (mode === 'Space') {
            f.host.focus(); const down = keyboard(f.host, 'keydown', ' ', 'Space');
            assert.equal(down.defaultPrevented, true); assert.equal(f.canvas.spaceDown, true);
        }
        f.editor.focus(); f.assertPreserved();
        const beforeZoom = f.canvas.view.zoom;
        f.host.dispatchEvent(new dom.window.WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: 200, clientY: 100, deltaY: -20 }));
        await new Promise(resolve => setTimeout(resolve, 180)); f.canvas.frames.flush(); await tick(); flushSync();
        assert.notEqual(f.canvas.view.zoom, beforeZoom); f.assertPreserved();
        const button = mode === 'MMB' ? 1 : 0;
        mouse(f.host, 'mousedown', 200, 100, { button });
        assert.ok(f.canvas.pan); f.assertPreserved();
        await finishPan(f, button); f.assertPreserved();
        keyboard(document.activeElement, 'keyup', ' ', 'Space');
        const typing = keyboard(document.activeElement, 'keydown', ' ', 'Space');
        assert.equal(typing.defaultPrevented, false, 'Space remains editor input, not a Canvas shortcut');
        assert.equal(f.canvas.spaceDown, false); assert.equal(f.host.classList.contains('pc-space-pan'), false);
        const escape = keyboard(document.activeElement, 'keydown', 'Escape');
        assert.equal(escape.defaultPrevented, false, 'focused-editor keys are not claimed by Canvas'); f.assertPreserved();
    } finally { await f.close(); }
});
test('native fresh-page and unrelated-workspace pan acquire Canvas focus and Escape cancels the owned gesture', async () => {
    const f = await cameraFixture(); const other = document.createElement('div'); other.className = 'pc-root pc-open'; document.body.append(other);
    try {
        const button = document.createElement('button'); button.textContent = 'Graph menu'; f.workspace.append(button); button.focus();
        mouse(f.host, 'mousedown', 200, 100, { button: 1 }); assert.equal(document.activeElement, f.host); assert.ok(f.canvas.pan);
        mouse(window, 'mousemove', 235, 125, { buttons: 4 });
        const escape = keyboard(document.activeElement, 'keydown', 'Escape');
        assert.equal(escape.defaultPrevented, true); assert.equal(f.canvas.pan, null); assert.equal(f.host.classList.contains('pc-panning'), false);
        mouse(window, 'mouseup', 235, 125, { button: 1 });
        other.append(f.detailHost); f.editor.focus();
        mouse(f.host, 'mousedown', 200, 100, { button: 1 });
        assert.equal(document.activeElement, f.host, 'an editor in another actual workspace cannot take Canvas keyboard ownership');
        await finishPan(f, 1);
    } finally { await f.close(); other.remove(); }
});
test('legacy pan retains its existing Canvas focus acquisition with a local editor focused', async () => {
    const f = await cameraFixture(false);
    try {
        f.editor.focus(); assert.equal(document.activeElement, f.editor);
        mouse(f.host, 'mousedown', 200, 100, { button: 1 });
        assert.equal(document.activeElement, f.host); assert.ok(f.canvas.pan);
        await finishPan(f, 1);
    } finally { await f.close(); }
});
