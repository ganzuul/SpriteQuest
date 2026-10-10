// Built-in palettes keep text and meaning colors readable. Signal deliberately
// uses grayscale; its connections are distinguished by shapes and patterns.
import assert from 'node:assert/strict';
import { installMock } from './mock.js';
installMock({ settings: { graphs: {} } });
const v = JSON.parse((await import('node:fs')).readFileSync(new URL('../manifest.json', import.meta.url))).version;
const T = await import(`../src/theme.js?v=${v}`);
const MEANING = T.ROLES.filter(r => r.group === 'meaning').map(r => r.key);

const needed = ['ember', 'lattice', 'ash', 'graphite', 'slate', 'obsidian', 'harbor', 'signal'];
assert.deepEqual(Object.keys(T.PRESETS), needed);
const problems = [];
for (const [key, p] of Object.entries(T.PRESETS)) {
    const c = p.colors;
    const P = (k) => T.parseColor(c[k]);
    for (const k of ['panel', 'block', 'canvas', 'border', 'text', 'muted', ...MEANING]) if (c[k] !== undefined && !P(k)) problems.push(`${key}.${k} unparseable`);
    const tp = T.contrast(P('text'), P('panel')), tb = T.contrast(P('text'), P('block'));
    if (tp < 7 || tb < 7) problems.push(`${key}: text contrast ${tp.toFixed(1)} / ${tb.toFixed(1)} (want 7+)`);
    if (T.contrast(P('muted'), P('block')) < 3.5) problems.push(`${key}: muted text ${T.contrast(P('muted'), P('block')).toFixed(1)} on blocks`);
    for (const m of MEANING) {
        for (const bg of ['panel', 'block']) {
            const r = T.contrast(P(m), P(bg));
            if (r < 3) problems.push(`${key}: ${m} on ${bg} only ${r.toFixed(2)}:1`);
        }
    }
    for (let i = 0; i < MEANING.length; i++) for (let j = i + 1; j < MEANING.length; j++) {
        const dd = T.distance(P(MEANING[i]), P(MEANING[j]));
        if (key !== 'signal' && dd < 20) problems.push(`${key}: ${MEANING[i]} vs ${MEANING[j]} only ${dd.toFixed(1)} apart`);
    }
    const warnings = T.themeWarnings(c).filter(w => key !== 'signal' || w.kind !== 'similar');
    if (warnings.length) problems.push(`${key}: ${warnings.map(w => w.text).join(' ')}`);
}
if (problems.length) { console.log(problems.join('\n')); process.exit(1); }

// the light fix: a colour picked for a dark theme is darkened on a light panel
const pale = T.parseColor('#f0c36a'), white = T.parseColor('#ffffff');
assert.ok(T.contrast(pale, white) < 3);
assert.ok(T.contrast(T.fitContrast(pale, white), white) >= 3);
const fitted = T.toHex(T.fitContrast(pale, white));
assert.notEqual(fitted, '#f0c36a');

// warnings catch look-alikes and unreadable text
const w = T.themeWarnings({ flow: '#7ab7ff', warn: '#7bb8fe', text: '#333333', panel: '#222222', block: '#222222' });
assert.ok(w.some(x => x.kind === 'similar'));
assert.ok(w.some(x => x.kind === 'contrast'));

// export and import round trip, and custom colours sit on top of a preset
T.setPreset('slate');
T.setColor('flow', '#ff00aa');
const shared = T.exportTheme('Mine');
assert.equal(JSON.parse(shared).latticeTheme, 1);
assert.equal(JSON.parse(shared).sillyCanvasTheme, undefined);
const legacyTheme = { ...JSON.parse(shared), sillyCanvasTheme: 1 };
delete legacyTheme.latticeTheme;
assert.equal(T.importTheme(JSON.stringify(legacyTheme)).ok, false, 'retired theme aliases are rejected');
T.setPreset('obsidian');
assert.equal(T.currentTheme().colors.flow, T.PRESETS['obsidian'].colors.flow);
assert.equal(T.importTheme(shared).ok, true);
assert.equal(T.currentTheme().preset, 'slate');
assert.equal(T.currentTheme().colors.flow, '#ff00aa');
assert.equal(T.currentTheme().colors.warn, T.PRESETS['slate'].colors.warn);
T.setColor('flow', null);
assert.equal(T.currentTheme().colors.flow, T.PRESETS['slate'].colors.flow, 'reset one role');
assert.equal(T.importTheme('not a theme').ok, false);
assert.equal(T.importTheme('{"latticeTheme":1,"colors":{"flow":"javascript:alert(1)"}}').ok, true);
assert.equal(T.currentTheme().custom.flow, undefined, 'junk values are dropped');
// Every preset starts with a supported look that remains independently editable.
for (const [k, p] of Object.entries(T.PRESETS)) for (const [part, def] of Object.entries(T.STYLE_OPTIONS)) {
    assert.ok(def.options.some(o => o[0] === p.style[part]), `${k}.${part}`);
}
// the look is put on the page, can be changed, and travels with a shared theme
T.setPreset('slate');
const root = globalThis.document?.documentElement;
assert.equal(T.currentTheme().style.wires, 'curved');
T.setStyle('wires', 'angled');
assert.equal(T.currentTheme().style.wires, 'angled');
assert.deepEqual(T.currentTheme().customStyle, { wires: 'angled' });
T.setStyle('wires', 'curved');                     // the preset's own: not a change
assert.deepEqual(T.currentTheme().customStyle, {});
T.setStyle('font', 'serif');
const withLook = T.exportTheme();
T.setPreset('ash');
assert.deepEqual(T.currentTheme().customStyle, {}, 'a new preset starts clean');
T.importTheme(withLook);
assert.equal(T.currentTheme().preset, 'slate');
assert.equal(T.currentTheme().style.font, 'serif');
T.setStyle('font', 'comic-sans');                  // not an option: ignored
assert.equal(T.currentTheme().style.font, 'sans');

// Sharing and saved-state reads retain every approved preset and custom look.
for (const preset of needed) {
    T.setPreset(preset);
    T.setColor('muted', '#8899aa');
    T.setStyle('font', 'serif');
    const exported = T.exportTheme();
    T.setPreset('ember');
    assert.equal(T.importTheme(exported).ok, true);
    assert.equal(T.currentTheme().preset, preset);
    assert.deepEqual(T.currentTheme().custom, { muted: '#8899aa' });
    assert.deepEqual(T.currentTheme().customStyle, { font: 'serif' });
    const saved = structuredClone(globalThis.SillyTavern.getContext().extensionSettings.lattice.ui.theme);
    T.setPreset('ember');
    globalThis.SillyTavern.getContext().extensionSettings.lattice.ui.theme = saved;
    assert.equal(T.currentTheme().preset, preset, 'saved preset recognized');
    assert.equal(T.currentTheme().style.font, 'serif', 'saved custom style retained');
}
// an unknown preset uses the current default
const s = globalThis.SillyTavern.getContext().extensionSettings.lattice;
s.ui.theme = { preset: 'pink-blink', colors: {} };
assert.equal(T.currentTheme().preset, 'ember');
console.log('themes: ok');
