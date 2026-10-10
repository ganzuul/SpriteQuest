import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture, dom, mouse } from './canvas-fixture.mjs';
const options = [
    { value: 'active', label: 'Active SillyTavern model', apiLabel: 'Provider', model: 'live-model', active: true },
    { value: 'fast', label: 'Long Fast Profile', apiLabel: 'Alpha', model: 'fast-v2', active: false },
    { value: 'slow', label: 'Careful Profile', apiLabel: 'Beta', model: 'reason-v3', active: false },
];
const selection = id => ({ selectionKey: id, revision: 'r1', address: { workflowId: 'workflow', instancePath: ['wrapper'], nodeId: id } });
const row = (id, extra = {}) => ({ id, selection: selection(id), value: 'active', label: options[0].label, model: 'live-model', editable: true, options, ...extra });
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
async function open(env, id = 'b') { env.host.querySelector(`.pc-node-profile[data-id="${id}"] .profile-bar`).click(); await settle(); }
async function query(env, text) { const input = env.host.querySelector('.profile-search input'); input.value = text; input.dispatchEvent(new dom.window.Event('input', { bubbles: true })); await settle(); return input; }
async function key(target, key) { target.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); await settle(); }

// Catches using authored width instead of the measured card, moving controls into the card, or dropping compact clearance.
test('decorations use measured bounds outside native node geometry and follow drag and collapse', async () => {
    const env = fixture();
    try {
        assert.equal(typeof env.canvas.setNodeProfiles, 'function', 'canvas must accept prepared profile rows');
        env.b.w = 9999; env.canvas.setNodeProfiles([row('b')]);
        let profile = env.host.querySelector('.pc-node-profile');
        assert.equal(profile.parentElement.parentElement, env.canvas.viewport);
        assert.equal(profile.style.left, '350px'); assert.equal(profile.style.top, '50px'); assert.equal(profile.style.width, '160px');
        assert.equal(profile.querySelector('.profile-picker').style.top, '55px');
        assert.equal(profile.querySelector('.node-model-meta').textContent, 'live-model');
        assert.deepEqual(env.canvas.endpoint('b', 'in', 'in'), { id: 'in', direction: 'in', x: 350, y: 74, side: 'left', kind: 'context' });
        mouse(env.host.querySelector('.pc-node[data-id="b"]'), 'mousedown', 360, 60); mouse(window, 'mousemove', 400, 100); env.canvas.frames.flush();
        assert.equal(profile.style.left, '390px'); assert.equal(profile.style.top, '90px'); mouse(window, 'mouseup', 400, 100);
        env.b.presentation = { compact: true }; env.canvas.render();
        assert.equal(profile.querySelector('.profile-picker').style.top, '93px');
        env.graph.groups.g = { id: 'g', x: 1, y: 1, collapsed: true }; env.b.inGroup = 'g'; env.canvas.render();
        assert.equal(env.host.querySelector('.pc-node-profile'), null);
    } finally { await env.canvas.destroy(); }
});

// Catches OR filtering, active-option filtering, or Enter choosing the reserved active option for fixed-profile searches.
test('AND keyword search retains active first and Enter edits only the qualified occurrence', async () => {
    const edits = [], env = fixture({ editProfile: (selection, value) => { edits.push([selection, value]); return { ok: true }; } });
    try {
        env.canvas.setNodeProfiles([row('a'), row('b')]); await open(env);
        const input = await query(env, 'ALPHA fast');
        assert.deepEqual([...env.host.querySelectorAll('.profile-option .profile-name')].map(e => e.textContent), ['Active SillyTavern model', 'Long Fast Profile']);
        assert.equal(env.host.querySelector('.profile-option.is-active .profile-name').textContent, 'Long Fast Profile');
        await key(input, 'Enter');
        assert.deepEqual(edits, [[selection('b'), 'fast']]);
        assert.equal(env.canvas.selection, null); assert.equal(env.host.querySelector('.profile-menu'), null);
        assert.equal(env.host.querySelector('.pc-node-profile[data-id="a"] .profile-value').textContent, 'Active SillyTavern model');
        await open(env); await query(env, 'missing words');
        assert.equal(env.host.querySelectorAll('.profile-option').length, 1);
        const activeInput = await query(env, 'active sillytavern'); await key(activeInput, 'Enter');
        assert.deepEqual(edits.at(-1), [selection('b'), 'active']);
    } finally { await env.canvas.destroy(); }
});

// Catches popup events triggering canvas gestures/zoom/workbench shortcuts or a failed edit losing its error.
test('profile controls contain wheel and keys, dismiss outside, and retain failed edit errors', async () => {
    let context = 0, opened = 0, bubbled = 0;
    const env = fixture({ editProfile: () => ({ ok: false, error: { code: 'stale', message: 'Selection changed' } }), onContextMenu: () => context++, onOpen: () => opened++ });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env);
        const root = env.host.querySelector('.pc-node-profile'), list = root.querySelector('.profile-options');
        const camera = { ...env.canvas.view };
        const wheel = new dom.window.WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 25, deltaMode: 1 }); list.dispatchEvent(wheel);
        assert.equal(wheel.defaultPrevented, true); assert.equal(list.scrollTop, 450); assert.deepEqual(env.canvas.view, camera);
        mouse(root.querySelector('.profile-value'), 'mousedown', 360, 110); mouse(root, 'dblclick', 360, 110); mouse(root, 'contextmenu', 360, 110);
        assert.equal(env.canvas.hasContentGesture(), false); assert.equal(context, 0); assert.equal(opened, 0);
        env.host.addEventListener('keydown', () => bubbled++); await key(root.querySelector('input'), 'Delete'); assert.equal(bubbled, 0);
        await key(root.querySelector('input'), 'ArrowDown'); await key(root.querySelector('input'), 'Enter');
        assert.equal(root.querySelector('[role="alert"]').textContent, 'Selection changed'); assert.ok(root.querySelector('.profile-menu'));
        await key(root.querySelector('input'), 'Escape'); assert.equal(root.querySelector('.profile-menu'), null);
        await open(env); document.body.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true })); await settle(); assert.equal(root.querySelector('.profile-menu'), null);
    } finally { await env.canvas.destroy(); }
});

// Catches retaining a detached popup's old selection authority across row/document replacement.
test('row replacement invalidates detached popup choices and readonly rows cannot edit', async () => {
    const edits = [], env = fixture({ editProfile: (...args) => { edits.push(args); return { ok: true }; } });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env);
        const staleOption = env.host.querySelectorAll('.profile-option')[1];
        env.canvas.setNodeProfiles([row('b', { selection: { ...selection('b'), revision: 'r2' }, editable: false, label: 'Unavailable profile', model: '' })]); await settle();
        staleOption.click(); await settle(); assert.deepEqual(edits, []);
        assert.equal(env.host.querySelector('.profile-menu'), null); assert.equal(env.host.querySelector('.profile-bar').disabled, true);
        assert.equal(env.host.querySelector('.node-model-meta'), null);
        env.canvas.setGraph({ ...env.graph, id: 'replacement' }); assert.equal(env.host.querySelector('.pc-node-profile'), null);
    } finally { await env.canvas.destroy(); }
});

// Catches a chooser anchored above a short canvas extending beyond its visible top edge.
test('a short narrow canvas keeps the popup and scrollable list inside visible bounds', async () => {
    const env = fixture();
    try {
        env.host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 100, right: 300, bottom: 100 });
        env.b.x = 270; env.b.y = 0; env.canvas.render(); env.canvas.setNodeProfiles([row('b')]); await open(env);
        const menu = env.host.querySelector('.profile-menu');
        assert.equal(menu.style.width, '284px'); assert.equal(menu.style.left, '-262px');
        assert.equal(menu.style.top, '-47px', 'popup overlaps the bar when neither side can contain its search and results');
        assert.equal(menu.querySelector('.profile-options').style.maxHeight, '30px');
    } finally { await env.canvas.destroy(); }
});

test('opening refreshes prepared metadata and a camera update preserves the popup and native cards', async () => {
    let refreshes = 0, env;
    env = fixture({ refreshProfiles: selection => {
        refreshes++; assert.deepEqual(selection, { selectionKey: 'b', revision: 'r1', address: { workflowId: 'workflow', instancePath: ['wrapper'], nodeId: 'b' } });
        env.canvas.setNodeProfiles([row('b', { label: 'Current live profile', model: 'updated-live-model' })]);
    } });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env);
        const card = env.host.querySelector('.pc-node[data-id="b"]'), input = env.host.querySelector('.profile-search input');
        assert.equal(refreshes, 1); assert.equal(env.host.querySelector('.profile-value').textContent, 'Current live profile');
        assert.equal(env.host.querySelector('.node-model-meta').textContent, 'updated-live-model');
        Object.assign(env.canvas.view, { x: 30, y: 20, zoom: 2 }); env.canvas.applyTransform(); await settle();
        assert.equal(env.canvas.viewport.style.transform, 'translate(30px, 20px) scale(2)');
        assert.equal(env.host.querySelector('.profile-search input'), input); assert.equal(env.host.querySelector('.pc-node[data-id="b"]'), card);
        assert.equal(env.host.querySelector('.profile-menu').style.width, '330px'); assert.equal(refreshes, 1);
        env.canvas.setNodeProfiles([row('b', { model: 'another-model' })]); await settle(); assert.equal(env.host.querySelector('.profile-menu'), null);
    } finally { await env.canvas.destroy(); }
});

test('only one independently bound picker stays open and selected options show their checkmark', async () => {
    const env = fixture();
    try {
        env.canvas.setNodeProfiles([row('a', { value: 'slow', label: 'Careful Profile', model: 'reason-v3' }), row('b')]);
        await open(env, 'a');
        assert.equal(env.host.querySelector('[aria-selected="true"] .profile-name').textContent, 'Careful Profile');
        assert.ok(env.host.querySelector('[aria-selected="true"] .profile-check svg'));
        await open(env, 'b'); assert.equal(env.host.querySelectorAll('.profile-menu').length, 1);
        assert.equal(env.host.querySelector('.profile-menu').closest('.pc-node-profile').dataset.id, 'b');
        assert.equal(env.host.querySelector('.pc-node-profile[data-id="a"] .profile-bar').title, 'Careful Profile');
    } finally { await env.canvas.destroy(); }
});

test('releasing an existing node drag over a profile surface cancels without leaving a stuck gesture', async () => {
    const env = fixture();
    try {
        env.canvas.setNodeProfiles([row('b')]);
        mouse(env.host.querySelector('.pc-node[data-id="a"]'), 'mousedown', 60, 60);
        mouse(window, 'mousemove', 360, 110); env.canvas.frames.flush(); assert.equal(env.canvas.hasContentGesture(), true);
        mouse(env.host.querySelector('.profile-value'), 'mouseup', 360, 110);
        assert.equal(env.canvas.hasContentGesture(), false);
        assert.deepEqual([env.a.x, env.a.y], [50, 50]);
    } finally { await env.canvas.destroy(); }
});

test('Space held on the canvas is released when keyup occurs over an isolated profile bar', async () => {
    const env = fixture();
    try {
        env.canvas.setNodeProfiles([row('b')]); env.host.focus(); await key(env.host, ' '); assert.equal(env.canvas.spaceDown, true);
        const bar = env.host.querySelector('.profile-bar'); bar.focus();
        bar.dispatchEvent(new dom.window.KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true }));
        assert.equal(env.canvas.spaceDown, false); assert.equal(env.host.classList.contains('pc-space-pan'), false);
        mouse(env.host.querySelector('.pc-node[data-id="a"]'), 'mousedown', 60, 60);
        assert.ok(env.canvas.drag); assert.equal(Boolean(env.canvas.pan), false);
    } finally { await env.canvas.destroy(); }
});

test('a successful synchronous prepared row replacement restores focus to its connected occurrence bar', async () => {
    let env;
    env = fixture({ editProfile: (selection, value) => {
        env.canvas.setNodeProfiles([row('b', { selection: { ...selection, revision: 'r2' }, value, label: 'Long Fast Profile' })]); return { ok: true };
    } });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env); await key(env.host.querySelector('input'), 'ArrowDown'); await key(env.host.querySelector('input'), 'Enter');
        assert.equal(document.activeElement, env.host.querySelector('.profile-bar')); assert.equal(env.host.querySelector('.profile-menu'), null);
        assert.equal(env.host.querySelector('.profile-value').textContent, 'Long Fast Profile');
    } finally { await env.canvas.destroy(); }
});

test('late successful results from a replaced view never steal focus from the current document', async () => {
    let finish; const env = fixture({ editProfile: () => new Promise(resolve => { finish = resolve; }) });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env); await key(env.host.querySelector('input'), 'Enter');
        env.canvas.setGraph({ ...env.graph, id: 'another-document' }); env.canvas.setNodeProfiles([row('b', { selection: { ...selection('b'), selectionKey: 'new-session:b' } })]);
        env.host.focus(); finish({ ok: true }); await settle(); assert.equal(document.activeElement, env.host);
    } finally { await env.canvas.destroy(); }
});

test('a measured coarse-pointer bar preserves the six pixel popup gap below and above', async () => {
    const env = fixture();
    try {
        env.canvas.setNodeProfiles([row('b')]);
        const bar = env.host.querySelector('.profile-bar');
        bar.getBoundingClientRect = () => ({ left: 350, top: 105, width: 160, height: 44, right: 510, bottom: 149 });
        await open(env); assert.equal(env.host.querySelector('.profile-menu').style.top, '50px');
        await key(env.host.querySelector('input'), 'Escape'); env.b.y = 730; env.canvas.render(); await open(env);
        assert.equal(env.host.querySelector('.profile-menu').style.bottom, '50px');
    } finally { await env.canvas.destroy(); }
});

test('a pending edit cannot steal focus after another independently bound picker opens', async () => {
    let finish; const env = fixture({ editProfile: () => new Promise(resolve => { finish = resolve; }) });
    try {
        env.canvas.setNodeProfiles([row('a'), row('b')]); await open(env, 'a'); await key(env.host.querySelector('input'), 'Enter');
        await open(env, 'b'); const otherInput = env.host.querySelector('.pc-node-profile[data-id="b"] input');
        assert.equal(document.activeElement, otherInput);
        finish({ ok: true }); await settle();
        assert.equal(document.activeElement, otherInput); assert.ok(env.host.querySelector('.pc-node-profile[data-id="b"] .profile-menu'));
    } finally { await env.canvas.destroy(); }
});

for (const dismissal of ['outside', 'focus-transfer']) test(`a pending edit cannot restore focus after ${dismissal}`, async () => {
    let finish; const env = fixture({ editProfile: () => new Promise(resolve => { finish = resolve; }) });
    try {
        env.canvas.setNodeProfiles([row('b')]); await open(env); await key(env.host.querySelector('input'), 'Enter');
        if (dismissal === 'outside') { document.body.dispatchEvent(new dom.window.MouseEvent('pointerdown', { bubbles: true })); await settle(); }
        env.host.focus(); assert.equal(document.activeElement, env.host);
        finish({ ok: true }); await settle(); assert.equal(document.activeElement, env.host);
    } finally { await env.canvas.destroy(); }
});

test('Enter on an unmatched non-active query leaves the binding unchanged until active is explicitly chosen', async () => {
    const edits = [], env = fixture({ editProfile: (selection, value) => { edits.push([selection, value]); return { ok: true }; } });
    try {
        env.canvas.setNodeProfiles([row('b', { value: 'slow', label: 'Careful Profile' })]); await open(env);
        const input = await query(env, 'does not exist'); await key(input, 'Enter');
        assert.deepEqual(edits, []); assert.ok(env.host.querySelector('.profile-menu'));
        assert.equal(env.host.querySelector('.profile-value').textContent, 'Careful Profile');
        await key(input, 'ArrowDown'); await key(input, 'Enter'); assert.deepEqual(edits, [[selection('b'), 'active']]);
        await open(env); const explicitInput = await query(env, 'active sillytavern'); await key(explicitInput, 'Enter');
        assert.deepEqual(edits.at(-1), [selection('b'), 'active']); assert.equal(edits.length, 2);
        await open(env); await query(env, 'nothing matches'); env.host.querySelector('.profile-option').click(); await settle();
        assert.deepEqual(edits.at(-1), [selection('b'), 'active']); assert.equal(edits.length, 3);
    } finally { await env.canvas.destroy(); }
});
