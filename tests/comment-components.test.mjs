import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compile } from 'svelte/compiler';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
for (const key of ['Node', 'Element', 'Text', 'Comment', 'Document', 'HTMLElement', 'HTMLButtonElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'MutationObserver']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
const clientURL = new URL('../node_modules/svelte/src/index-client.js', import.meta.url).href;
const { mount, unmount, flushSync } = await import(clientURL);
const comment = overrides => ({ id: 'comment-1', x: 40, y: 80, w: 320, h: 220, title: 'Review requests', content: 'First note\nSecond note', color: '#7ab7ff', moveContents: true, selected: true, readOnly: false, ...overrides });
async function fixture(name, props) {
    const source = await readFile(new URL(`../ui/${name}.svelte`, import.meta.url), 'utf8').catch(error => {
        if (error.code === 'ENOENT') assert.fail(`${name} has not been implemented`);
        throw error;
    });
    const compiled = compile(source, { filename: `${name}.svelte`, generate: 'client', css: 'injected' });
    assert.deepEqual(compiled.warnings.filter(warning => warning.code.startsWith('a11y')), [], 'component must not introduce accessibility warnings');
    const code = compiled.js.code.replace(/(['"])(svelte(?:\/[^'"]*)?)\1/g, (_, quote, specifier) => JSON.stringify(specifier === 'svelte' ? clientURL : import.meta.resolve(specifier)));
    const directory = await mkdtemp(join(tmpdir(), 'lattice-comment-component-'));
    const file = join(directory, 'component.mjs');
    await writeFile(file, code);
    const host = document.createElement('div');
    document.body.append(host);
    const component = (await import(pathToFileURL(file).href)).default;
    const mounted = mount(component, { target: host, props });
    flushSync();
    return { host, async close() {
        await unmount(mounted); host.remove();
        const rel = relative(resolve(tmpdir()), resolve(directory));
        assert.ok(rel && !rel.startsWith('..') && !isAbsolute(rel));
        await rm(directory, { recursive: true, force: true });
    } };
}
const actions = () => ({ select() {}, update() {}, command() {} });
const change = (element, value) => {
    if (element.type === 'checkbox') element.checked = value;
    else element.value = value;
    element.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    flushSync();
};

test('frame renders its measured rectangle and multiline notes outside its draggable title header', async () => {
    const f = await fixture('CommentFrame', { comment: comment(), actions: actions() });
    try {
        const frame = f.host.querySelector('.pc-comment-frame');
        assert.equal(frame.dataset.id, 'comment-1');
        assert.equal(frame.style.left, '40px'); assert.equal(frame.style.top, '80px');
        assert.equal(frame.style.width, '320px'); assert.equal(frame.style.height, '220px');
        assert.equal(frame.querySelector('.pc-comment-title-input').value, 'Review requests');
        const notes = frame.querySelector('.pc-comment-notes');
        assert.equal(notes.textContent, 'First note\nSecond note');
        assert.equal(frame.querySelector('.pc-comment-header').contains(notes), false);
        assert.equal(dom.window.getComputedStyle(frame).pointerEvents, 'none');
        assert.equal(dom.window.getComputedStyle(frame.querySelector('.pc-comment-header')).pointerEvents, 'auto');
        assert.ok(frame.querySelector('.pc-comment-resize'));
    } finally { await f.close(); }
});

test('frame title editing selects the comment and emits a title patch without bubbling canvas shortcuts', async () => {
    const calls = [], f = await fixture('CommentFrame', { comment: comment(), actions: { ...actions(), select: id => calls.push(['select', id]), update: (id, patch) => calls.push(['update', id, patch]) } });
    try {
        const input = f.host.querySelector('.pc-comment-title-input');
        input.focus(); assert.equal(document.activeElement, input);
        change(input, 'Changed title');
        let bubbled = false;
        f.host.addEventListener('keydown', () => { bubbled = true; });
        input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'c', bubbles: true }));
        assert.equal(bubbled, false);
        assert.deepEqual(calls, [['select', 'comment-1'], ['update', 'comment-1', { title: 'Changed title' }]]);
    } finally { await f.close(); }
});

test('readonly frame shows authored title and notes while removing editable title and resize handle', async () => {
    const f = await fixture('CommentFrame', { comment: comment({ readOnly: true }), actions: actions() });
    try {
        assert.ok(f.host.textContent.includes('Review requests'));
        assert.equal(f.host.querySelector('.pc-comment-notes').textContent, 'First note\nSecond note');
        assert.equal(f.host.querySelector('input'), null);
        assert.equal(f.host.querySelector('.pc-comment-resize'), null);
    } finally { await f.close(); }
});

test('details edit every authored field and issue only explicit frame commands', async () => {
    const patches = [], commands = [];
    const f = await fixture('CommentDetails', { comment: comment(), readOnly: false, onPatch: patch => patches.push(patch), onCommand: command => commands.push(command) });
    try {
        const title = f.host.querySelector('[aria-label="Comment title"]');
        const notes = f.host.querySelector('[aria-label="Comment notes"]');
        assert.equal(title.value, 'Review requests'); assert.equal(notes.value, 'First note\nSecond note');
        change(title, 'Revised'); change(notes, 'New first\nNew second');
        change(f.host.querySelector('input[type=color]'), '#b487e0');
        change(f.host.querySelector('input[type=checkbox]'), false);
        for (const button of f.host.querySelectorAll('button')) button.click();
        flushSync();
        assert.deepEqual(patches, [{ title: 'Revised' }, { content: 'New first\nNew second' }, { color: '#b487e0' }, { moveContents: false }]);
        assert.deepEqual(commands, ['fit', 'delete']);
        assert.match(f.host.textContent, /Fit to contents/); assert.match(f.host.textContent, /Delete comment/);
    } finally { await f.close(); }
});

for (const source of ['panel', 'comment']) test(`readonly details suppress edits and commands from ${source} authority`, async () => {
    const calls = [], f = await fixture('CommentDetails', { comment: comment({ readOnly: source === 'comment' }), readOnly: source === 'panel', onPatch: patch => calls.push(patch), onCommand: command => calls.push(command) });
    try {
        for (const element of f.host.querySelectorAll('input, textarea, button')) assert.equal(element.disabled, true);
        change(f.host.querySelector('[aria-label="Comment title"]'), 'Forbidden');
        for (const button of f.host.querySelectorAll('button')) button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
        assert.deepEqual(calls, []);
    } finally { await f.close(); }
});
