import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { installMock } from './mock.js';

const dom = new JSDOM('<!doctype html><body></body>');
Object.assign(globalThis, { document: dom.window.document, window: dom.window, getComputedStyle: dom.window.getComputedStyle, CustomEvent: dom.window.CustomEvent });
const context = installMock({ settings: { graphs: {} } });
const version = JSON.parse(await readFile(new URL('../manifest.json', import.meta.url), 'utf8')).version;
const T = await import(`../src/theme.js?v=${version}`);
const root = document.documentElement;
const value = key => root.style.getPropertyValue('--pc-' + key);

test('selecting Ash applies the approved medium gray surfaces', () => {
    T.setPreset('ash');
    assert.equal(T.currentTheme().preset, 'ash');
    assert.equal(root.dataset.pcPreset, 'ash');
    assert.equal(value('panel'), '#343434');
    assert.equal(value('block'), '#292929');
    assert.equal(value('canvas'), '#454545');
});

for (const [preset, colors] of Object.entries({
    graphite: { panel: '#242422', block: '#32322e', canvas: '#20201f', border: '#50504a', text: '#e9e9e2', muted: '#b2b2a8', flow: '#e18a24', warn: '#e3c341', error: '#e57676' },
    slate: { panel: '#262c34', block: '#2b323b', canvas: '#1e2329', border: '#4b5563', text: '#e5eaf0', muted: '#b0bac6', flow: '#e18a24', warn: '#e3c341', error: '#e57676' },
    obsidian: { panel: '#121417', block: '#1b1e23', canvas: '#08090b', border: '#343a42', text: '#e4e7eb', muted: '#a5abb4', flow: '#e18a24', warn: '#e3c341', error: '#e57676' },
    harbor: { panel: '#17232d', block: '#233340', canvas: '#0e1820', border: '#657988', text: '#f2f5f7', muted: '#b9c8d2', flow: '#e69f00', warn: '#f0e442', error: '#ffb4a2' },
    signal: { panel: '#151515', block: '#262626', canvas: '#080808', border: '#929292', text: '#ffffff', muted: '#d0d0d0', flow: '#ffffff', warn: '#ffffff', error: '#ffffff' },
})) {
    test(`selecting ${preset} applies its approved capture palette`, () => {
        T.setPreset(preset);
        assert.equal(root.dataset.pcPreset, preset);
        assert.deepEqual(T.currentTheme().colors, colors);
        for (const role of ['panel', 'block', 'canvas', 'border', 'text', 'muted']) assert.equal(value(role), colors[role], role);
    });
}

test('retired saved selections fall back to Ember and preserve explicit custom colors and style', () => {
    for (const preset of ['sillytavern', 'midnight', 'blueprint', 'parchment', 'neon', 'terminal', 'petal', 'pink-blink', 'toString', '__proto__']) {
        context.extensionSettings.lattice.ui.theme = { preset, colors: { panel: '#fafafa', text: '#202020', flow: '#13579b' }, style: { font: 'serif', wires: 'angled' } };
        T.applyTheme();
        assert.equal(root.dataset.pcPreset, 'ember', preset);
        assert.equal(value('panel'), '#fafafa');
        assert.equal(value('text'), '#202020');
        assert.equal(root.dataset.pcFont, 'serif');
        assert.equal(root.dataset.pcWires, 'angled');
        assert.deepEqual(T.currentTheme().custom, { panel: '#fafafa', text: '#202020', flow: '#13579b' });
    }
});

test('themes restore their own seven-kind palettes when switching from accessible presets', () => {
    const pins = {
        harbor: { context: '#f0e442', guidance: '#cc79a7', draft: '#7fd8c5', patches: '#ffffff', text: '#e69f00', data: '#56b4e9', candidate: '#cbd5e1' },
        signal: { context: '#f2f2f2', guidance: '#f2f2f2', draft: '#f2f2f2', patches: '#f2f2f2', text: '#f2f2f2', data: '#f2f2f2', candidate: '#f2f2f2' },
    };
    for (const [preset, expected] of Object.entries(pins)) {
        T.setPreset(preset);
        assert.equal(root.dataset.pcAccessible, '1', preset);
        assert.equal(T.PRESETS[preset].accessible, true);
        for (const [kind, color] of Object.entries(expected)) assert.equal(value('kind-' + kind), color, `${preset} ${kind}`);
        for (const next of ['ember', 'lattice', 'ash', 'graphite', 'slate', 'obsidian']) {
            T.setPreset(preset);
            T.setPreset(next);
            assert.equal(root.dataset.pcAccessible, '0', next);
            const defaults = { context: '#f0e442', guidance: '#cc79a7', draft: '#7fd8c5', patches: '#ed8956', candidate: '#b49af2', text: '#e69f00', data: '#56b4e9' };
            for (const [kind, color] of Object.entries(defaults)) {
                const fitted = T.fitContrast(T.parseColor(color), [T.parseColor(T.PRESETS[next].colors.block), T.parseColor(T.PRESETS[next].colors.canvas)], 3);
                assert.equal(value('kind-' + kind), T.toHex(fitted), `${next} restores ${kind}`);
            }
            assert.equal(value('kind-findings'), '', 'No retired Findings token remains');
        }
    }
});

for (const preset of Object.keys(T.PRESETS)) {
    test(`${preset} connection colors stay visible on custom card and canvas surfaces`, () => {
        for (const surfaces of [
            { block: '#ffffff', canvas: '#ffffff' },
            { block: '#999999', canvas: '#999999' },
            { block: '#ffffff', canvas: '#111111' },
            { block: '#111111', canvas: '#ffffff' },
        ]) {
            T.setPreset(preset);
            T.setColor('block', surfaces.block);
            T.setColor('canvas', surfaces.canvas);
            for (const kind of ['context', 'guidance', 'draft', 'patches', 'text', 'data', 'candidate']) {
                const color = T.parseColor(value('kind-' + kind));
                for (const [surface, background] of Object.entries(surfaces)) {
                    assert.ok(T.contrast(color, T.parseColor(background)) >= 3, `${preset} ${kind} on custom ${surface}`);
                }
            }
        }
    });
}

for (const preset of ['harbor', 'signal']) {
    for (const surfaces of [
        { block: '#666666', canvas: '#ffffff' },
        { block: '#ffffff', canvas: '#666666' },
        { block: '#606060', canvas: '#ffffff' },
    ]) {
        test(`${preset} connection colors read on ${surfaces.block} cards and ${surfaces.canvas} canvas`, () => {
            T.setPreset(preset);
            T.setColor('block', surfaces.block);
            T.setColor('canvas', surfaces.canvas);
            for (const kind of ['context', 'guidance', 'draft', 'patches', 'text', 'data', 'candidate']) {
                const color = T.parseColor(value('kind-' + kind));
                for (const [surface, background] of Object.entries(surfaces)) {
                    const ratio = T.contrast(color, T.parseColor(background));
                    assert.ok(ratio >= 3, `${preset} ${kind} on ${surface}: ${ratio}`);
                }
            }
        });
    }
}

for (const preset of ['harbor', 'signal']) {
    for (const surfaces of [
        { panel: '#666666', block: '#ffffff' },
        { panel: '#ffffff', block: '#666666' },
    ]) {
        test(`${preset} feedback colors read on ${surfaces.panel} panels and ${surfaces.block} cards`, () => {
            T.setPreset(preset);
            T.setColor('panel', surfaces.panel);
            T.setColor('block', surfaces.block);
            for (const role of ['flow', 'warn', 'error']) {
                const color = T.parseColor(value(role));
                for (const [surface, background] of Object.entries(surfaces)) {
                    const ratio = T.contrast(color, T.parseColor(background));
                    assert.ok(ratio >= 3, `${preset} ${role} on ${surface}: ${ratio}`);
                }
            }
        });
    }
}


test('queued recall green fits custom light surfaces',()=>{T.setPreset('ember');T.setColor('panel','#f5f1eb');T.setColor('block','#ffffff');const color=T.parseColor(value('recall-ready-fit'));assert.ok(color,'theme supplies recall color');assert.ok(T.contrast(color,T.parseColor('#f5f1eb'))>=3);assert.ok(T.contrast(color,T.parseColor('#ffffff'))>=3);});
