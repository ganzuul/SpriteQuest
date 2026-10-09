import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const source = await readFile(new URL('../index.js', import.meta.url), 'utf8');
function actual(name, env) {
    const start = source.indexOf('function ' + name + '('), end = source.indexOf('\nfunction ', start + 1);
    assert.ok(start >= 0);
    return Function('env', 'with(env){' + source.slice(start, end < 0 ? undefined : end) + ';return ' + name + ';}')(env);
}
function fixture(left = true) {
    const dom = new JSDOM('<form id="send_form">' + (left ? '<div id="leftSendForm"><div id="options_button"></div></div>' : '') + '<textarea id="send_textarea"></textarea><div id="rightSendForm"><div id="send_but"></div></div></form>');
    const saved = { enabled: false, ui: {} }; let opens = 0, updates = 0;
    const env = { document: dom.window.document, settings: () => saved, armed: () => saved.enabled,
        UI: { open() { opens++; } }, updateState() { updates++; env.paintSendbar(); }, safe: fn => fn(),
        logoUrl: new URL('../assets/lattice-logo.svg', import.meta.url).href,
        sendWorkflowState: () => ({ automatic: false, offText: 'Workflows off', armedText: 'Armed', armLabel: 'Arm' }) };
    env.paintSendbar = actual('paintSendbar', env);
    return { dom, saved, env, mount: actual('addSendbarButton', env), opens: () => opens, updates: () => updates };
}

test('chat launcher uses the Lattice logo on the left without submitting or generating', () => {
    const f = fixture(); assert.equal(f.mount(), true);
    const button = f.env.document.getElementById('pc-sendbar');
    assert.equal(button.parentElement.id, 'leftSendForm');
    assert.equal(button.tagName, 'BUTTON'); assert.equal(button.type, 'button');
    assert.equal(button.getAttribute('aria-label'), 'Open Lattice');
    assert.equal(button.classList.contains('fa-diagram-project'), false);
    assert.match(button.querySelector('img').src, /\/assets\/lattice-logo\.svg$/);
    assert.equal(button.querySelector('img').alt, '');
    let submits = 0; f.env.document.querySelector('form').addEventListener('submit', event => { event.preventDefault(); submits++; });
    button.click(); assert.equal(f.opens(), 1); assert.equal(submits, 0);
    button.dispatchEvent(new f.dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    assert.equal(f.opens(), 2); assert.equal(f.saved.enabled, false);
    button.dispatchEvent(new f.dom.window.MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
    assert.equal(f.saved.enabled, true); assert.equal(f.updates(), 1); assert.equal(submits, 0);
});

test('launcher waits for the left control group and remounts without duplicating buttons', () => {
    const f = fixture(false); assert.equal(f.mount(), false);
    assert.equal(f.env.document.querySelector('#rightSendForm #pc-sendbar'), null);
    const left = f.env.document.createElement('div'); left.id = 'leftSendForm'; f.env.document.querySelector('form').prepend(left);
    assert.equal(f.mount(), true); const button = f.env.document.getElementById('pc-sendbar');
    f.env.document.getElementById('rightSendForm').append(button);
    assert.equal(f.mount(), true); assert.equal(button.parentElement, left);
    assert.equal(f.env.document.querySelectorAll('#pc-sendbar').length, 1);
    f.saved.ui.sendbarButton = false; assert.equal(f.mount(), true); assert.equal(f.env.document.getElementById('pc-sendbar'), null);
    f.saved.ui.sendbarButton = true; assert.equal(f.mount(), true); assert.equal(f.env.document.querySelectorAll('#pc-sendbar').length, 1);
});
