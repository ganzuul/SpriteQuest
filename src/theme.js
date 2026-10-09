/** Lattice workspace themes and explicit user overrides. */

import { settings, save, safe } from './state.js?v=0.26.0';

/** The roles, in the order the editor lists them. */
export const ROLES = [
    { key: 'panel', label: 'Panel background', group: 'surface' },
    { key: 'block', label: 'Block background', group: 'surface' },
    { key: 'canvas', label: 'Canvas background', group: 'surface' },
    { key: 'border', label: 'Borders', group: 'surface' },
    { key: 'text', label: 'Text', group: 'surface' },
    { key: 'muted', label: 'Quiet text', group: 'surface' },
    { key: 'flow', label: 'Selection accent', group: 'meaning' },
    { key: 'warn', label: 'Warnings and skipped blocks', group: 'meaning' },
    { key: 'error', label: 'Errors and switched-off blocks', group: 'meaning' },
];
const MEANING = ROLES.filter(r => r.group === 'meaning').map(r => r.key);

/**
 * The look of a theme, apart from its colours. Each is a small choice, set on
 * the page as data attributes and CSS variables that style.css reads.
 */
export const STYLE_OPTIONS = {
    shape: { label: 'Shape', options: [['sharp', 'Sharp corners'], ['rounded', 'Rounded'], ['soft', 'Soft and round']] },
    font: { label: 'Font', options: [['theme', 'SillyTavern’s'], ['sans', 'Clean sans'], ['round', 'Friendly rounded'], ['serif', 'Book serif'], ['mono', 'Typewriter mono']] },
    grid: { label: 'Canvas', options: [['dots', 'Dots'], ['lines', 'Grid lines'], ['paper', 'Paper'], ['scan', 'Scanlines'], ['none', 'Plain']] },
    wires: { label: 'Wires', options: [['curved', 'Curved'], ['angled', 'Right angles']] },
    weight: { label: 'Lines', options: [['thin', 'Thin'], ['normal', 'Normal'], ['bold', 'Bold']] },
    header: { label: 'Block headers', options: [['tint', 'Quiet'], ['strip', 'Coloured by type']] },
    depth: { label: 'Depth', options: [['flat', 'Flat'], ['soft', 'Soft shadow'], ['deep', 'Deep shadow'], ['glow', 'Glow']] },
};
const DEFAULT_STYLE = { shape: 'rounded', font: 'sans', grid: 'none', wires: 'curved', weight: 'normal', header: 'tint', depth: 'soft' };

const FONTS = {
    sans: `system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    round: `Nunito, Quicksand, 'Varela Round', 'Segoe UI', system-ui, sans-serif`,
    serif: `'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif`,
    mono: `'Cascadia Mono', 'JetBrains Mono', Consolas, 'Courier New', ui-monospace, monospace`,
};
const RADII = { sharp: [2, 1, 3], rounded: [4, 3, 4], soft: [16, 10, 999] };
const WEIGHTS = { thin: [1, 1.6], normal: [1, 2.5], bold: [2, 3.5] };

/**
 * Built-in themes. "SillyTavern" leaves the surfaces to your SillyTavern
 * theme; the others set everything, and each has a look of its own.
 */
export const PRESETS = {
    ember: {
        name: 'Ember', note: 'The approved neutral canvas and soft translucent cards, with SillyTavern surfaces, text and orange accent.',
        style: { ...DEFAULT_STYLE },
        colors: { panel: '#171717', block: 'rgba(40, 40, 40, 0.75)', canvas: '#0f0f0f', border: 'rgba(0, 0, 0, 0.5)', text: '#dcdcd2', muted: '#919191', flow: '#e18a24', warn: '#e3c341', error: '#e57676' },
    },
    lattice: {
        name: 'Lattice', note: 'Charcoal surfaces with SillyTavern quote color as their accent.',
        style: { ...DEFAULT_STYLE },
        colors: { panel: '#202220', block: '#191b19', canvas: '#292a28', border: '#41433e', text: '#e7e8e4', muted: '#aaa99e', flow: '#ffb554', warn: '#e3c341', error: '#e57676' },
    },
    sillytavern: {
        name: 'SillyTavern',
        note: 'Follows your SillyTavern theme for backgrounds, text and font.',
        style: { ...DEFAULT_STYLE },
        colors: {
            muted: '#9aa0a6',
            flow: '#7ab7ff',
            warn: '#f0c36a', error: '#e08f8f',
        },
    },
    midnight: {
        name: 'Midnight',
        note: 'Clean modern dark. Deep shadows, a dot grid, clear bright signals.',
        style: { shape: 'rounded', font: 'sans', grid: 'dots', wires: 'curved', weight: 'normal', header: 'tint', depth: 'deep' },
        colors: {
            panel: '#0d1015', block: '#171c24', canvas: '#0a0d11', border: '#2a313c', text: '#dfe4ea', muted: '#8b949e',
            flow: '#58a6ff',
            warn: '#e3c341', error: '#f85149',
        },
    },
    blueprint: {
        name: 'Blueprint',
        note: 'Drafting paper: calm navy, a faint grid, chalk-white wires, sharp outlines and typewriter labels.',
        style: { shape: 'sharp', font: 'mono', grid: 'lines', wires: 'angled', weight: 'normal', header: 'tint', depth: 'flat' },
        colors: {
            panel: '#11263d', block: '#142d48', canvas: '#1c3b5b', border: '#5a7da2', text: '#e9eff6', muted: '#9fb3c9',
            flow: '#f3f6fa',
            warn: '#e6e089', error: '#f0928f',
        },
    },
    parchment: {
        name: 'Parchment',
        note: 'A light storybook page: cream paper, ink-brown lines, a book serif and coloured chapter headers.',
        style: { shape: 'rounded', font: 'serif', grid: 'paper', wires: 'curved', weight: 'normal', header: 'strip', depth: 'soft' },
        colors: {
            panel: '#efe3c8', block: '#fbf5e4', canvas: '#f3e8cf', border: '#b99c6f', text: '#3a2918', muted: '#7d6547',
            flow: '#2f5d8a',
            warn: '#8a6a00', error: '#a8322a',
        },
    },
    neon: {
        name: 'Neon',
        note: 'Black and violet with glowing wires and edges, bold lines and coloured headers.',
        style: { shape: 'soft', font: 'sans', grid: 'lines', wires: 'curved', weight: 'bold', header: 'strip', depth: 'glow' },
        colors: {
            panel: '#0a0612', block: '#140c24', canvas: '#07040d', border: '#3d2670', text: '#f4ecff', muted: '#a592cc',
            flow: '#00e5ff',
            warn: '#fff04d', error: '#ff3d6e',
        },
    },
    terminal: {
        name: 'Terminal',
        note: 'Green phosphor on black: typewriter text, square boxes, scanlines and right-angled wires.',
        style: { shape: 'sharp', font: 'mono', grid: 'scan', wires: 'angled', weight: 'normal', header: 'tint', depth: 'flat' },
        colors: {
            panel: '#040804', block: '#091109', canvas: '#030603', border: '#1f6a2c', text: '#8dff9c', muted: '#4fa35c',
            flow: '#3dff6b',
            warn: '#fff23d', error: '#ff4d4d',
        },
    },
    petal: {
        name: 'Petal',
        note: 'Soft and light: rosy paper, round shapes, a friendly font and coloured headers.',
        style: { shape: 'soft', font: 'round', grid: 'dots', wires: 'curved', weight: 'normal', header: 'strip', depth: 'soft' },
        colors: {
            panel: '#fff4f8', block: '#ffffff', canvas: '#ffeaf2', border: '#efb9cc', text: '#3d2230', muted: '#8e6477',
            flow: '#2563eb',
            warn: '#a16207', error: '#be123c',
        },
    },
};



export const DEFAULT_PRESET = 'ember';
const EMBER_HOST_ROLES = { panel: 'SmartThemeBlurTintColor', text: 'SmartThemeBodyColor', muted: 'SmartThemeEmColor', border: 'SmartThemeBorderColor', flow: 'SmartThemeQuoteColor' };

/* ------------------------------------------------------------------ */
/* colour maths                                                        */
/* ------------------------------------------------------------------ */

export function parseColor(c) {
    const s = String(c ?? '').trim();
    let m = /^#([0-9a-f]{3})$/i.exec(s);
    if (m) return { r: parseInt(m[1][0] + m[1][0], 16), g: parseInt(m[1][1] + m[1][1], 16), b: parseInt(m[1][2] + m[1][2], 16), a: 1 };
    m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(s);
    if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: m[2] ? parseInt(m[2], 16) / 255 : 1 };
    m = /^rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(s);
    if (m) {
        const a = m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
        return { r: +m[1], g: +m[2], b: +m[3], a };
    }
    return null;
}

export const toHex = ({ r, g, b }) => '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Put a see-through colour over the colour behind it. */
function over(top, under) {
    const a = top.a ?? 1;
    return { r: top.r * a + under.r * (1 - a), g: top.g * a + under.g * (1 - a), b: top.b * a + under.b * (1 - a), a: 1 };
}

function luminance({ r, g, b }) {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a, b) {
    const x = luminance(a), y = luminance(b);
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** Perceptual distance between two colours (CIE76 in Lab). Below ~15 they are hard to tell apart. */
export function distance(a, b) {
    const lab = ({ r, g, b }) => {
        const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const R = f(r), G = f(g), B = f(b);
        const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
        const Y = (R * 0.2126 + G * 0.7152 + B * 0.0722);
        const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
        const t = (v) => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116;
        return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))];
    };
    const [l1, a1, b1] = lab(a), [l2, a2, b2] = lab(b);
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** Darken or lighten a colour, keeping its hue, until it reads against a background. */
export function fitContrast(color, bg, target = 3) {
    if (contrast(color, bg) >= target) return color;
    const darker = luminance(bg) > 0.4;
    let c = { ...color };
    for (let i = 0; i < 24 && contrast(c, bg) < target; i++) {
        c = darker
            ? { r: c.r * 0.9, g: c.g * 0.9, b: c.b * 0.9 }
            : { r: c.r + (255 - c.r) * 0.12, g: c.g + (255 - c.g) * 0.12, b: c.b + (255 - c.b) * 0.12 };
    }
    return c;
}

/* ------------------------------------------------------------------ */
/* the current theme                                                   */
/* ------------------------------------------------------------------ */

function store() {
    const ui = (settings().ui ??= {});
    ui.theme ??= { preset: DEFAULT_PRESET, colors: {}, style: {} };
    ui.theme.colors ??= {};
    ui.theme.style ??= {};
    if (!PRESETS[ui.theme.preset]) ui.theme.preset = DEFAULT_PRESET;
    return ui.theme;
}

/** The chosen preset plus your own changes. */
export function currentTheme() {
    const t = store();
    const p = PRESETS[t.preset];
    const colors = { ...p.colors, ...t.colors };
    if (t.preset === 'ember') for (const [role, token] of Object.entries(EMBER_HOST_ROLES)) if (!Object.hasOwn(t.colors, role)) {
        const inherited = safe(() => getComputedStyle(document.documentElement).getPropertyValue('--' + token).trim());
        if (parseColor(inherited)) colors[role] = inherited;
    }
    return {
        preset: t.preset,
        colors,
        custom: { ...t.colors },
        style: { ...DEFAULT_STYLE, ...p.style, ...t.style },
        customStyle: { ...t.style },
    };
}

export function setPreset(key, { keepCustom = false } = {}) {
    const t = store();
    t.preset = PRESETS[key] ? key : DEFAULT_PRESET;
    if (!keepCustom) { t.colors = {}; t.style = {}; }
    save();
    applyTheme();
}

export function setColor(role, value) {
    const t = store();
    if (value === null || value === undefined || value === '') delete t.colors[role];
    else t.colors[role] = value;
    save();
    applyTheme();
}

/** Change one part of the look (shape, font, ...). null goes back to the preset's. */
export function setStyle(part, value) {
    const t = store();
    const opts = STYLE_OPTIONS[part]?.options.map(o => o[0]) ?? [];
    if (value === null || value === undefined || !opts.includes(value) || value === PRESETS[t.preset].style?.[part]) delete t.style[part];
    else t.style[part] = value;
    save();
    applyTheme();
}

/**
 * What the surfaces actually look like right now. For the SillyTavern preset
 * they come from your SillyTavern theme, so they have to be measured rather
 * than read from the theme.
 */
function measuredSurfaces(colors) {
    const doc = globalThis.document;
    const probe = (prop, fallback) => {
        if (colors[prop]) return parseColor(colors[prop]);
        const v = safe(() => getComputedStyle(doc.documentElement).getPropertyValue(`--pc-${prop}`).trim());
        return parseColor(v) ?? parseColor(fallback);
    };
    const page = safe(() => parseColor(getComputedStyle(doc.body).backgroundColor)) ?? parseColor('#202024');
    const base = page && page.a > 0 ? page : parseColor('#202024');
    const panel = over(probe('panel', 'rgba(20,20,24,0.97)') ?? parseColor('#141418'), base);
    const block = over(probe('block', 'rgba(40,40,48,0.96)') ?? parseColor('#282830'), panel);
    return { panel, block };
}

/**
 * Put the theme on the page. Meaning colours are then checked against the
 * backgrounds they sit on, and nudged darker (or lighter) if they would be
 * hard to read, so a colour picked on a dark theme still works on a light one.
 */
export function applyTheme() {
    const doc = globalThis.document;
    if (!doc?.documentElement) return;
    const { colors, style, preset, custom } = currentTheme();
    const root = doc.documentElement.style;
    const data = doc.documentElement.dataset;
    data.pcPreset = preset;

    // The look: data attributes for style.css, and a few sizes as variables.
    for (const part of Object.keys(STYLE_OPTIONS)) data[`pc${part[0].toUpperCase()}${part.slice(1)}`] = style[part];
    // A theme with its own surfaces also styles SillyTavern's buttons and
    // fields inside the panel, which otherwise keep SillyTavern's colours.
    data.pcOwn = preset === 'sillytavern' && !colors.panel ? '0' : '1';
    const [r, rSm, rChip] = RADII[style.shape] ?? RADII.rounded;
    root.setProperty('--pc-r', `${r}px`);
    root.setProperty('--pc-r-sm', `${rSm}px`);
    root.setProperty('--pc-r-chip', `${rChip}px`);
    const [bw, ww] = WEIGHTS[style.weight] ?? WEIGHTS.normal;
    root.setProperty('--pc-bw', `${bw}px`);
    root.setProperty('--pc-wire-w', String(ww));
    if (FONTS[style.font]) root.setProperty('--pc-font', FONTS[style.font]);
    else root.removeProperty('--pc-font');
    for (const r of ROLES) root.removeProperty(`--pc-${r.key}`);
    root.removeProperty('--pc-panel-solid');
    root.removeProperty('--pc-on-accent');
    for (const key of ['field', 'control', 'accent']) root.removeProperty('--pc-' + key);

    for (const r of ROLES) if (colors[r.key]) root.setProperty(`--pc-${r.key}`, colors[r.key]);
    if (colors.panel) root.setProperty('--pc-panel-solid', colors.panel);
    if (preset === 'ember') {
        for (const [role, token] of Object.entries(EMBER_HOST_ROLES)) if (!Object.hasOwn(custom, role)) root.setProperty('--pc-' + role, `var(--${token}, ${PRESETS.ember.colors[role]})`);
        if (!Object.hasOwn(custom, 'panel')) root.setProperty('--pc-panel-solid', `var(--SmartThemeBlurTintColor, ${PRESETS.ember.colors.panel})`);
        root.setProperty('--pc-field', 'var(--SmartThemeUserMesBlurTintColor, rgba(30, 30, 30, 0.9))');
        root.setProperty('--pc-control', 'var(--SmartThemeBotMesBlurTintColor, rgba(30, 30, 30, 0.9))');
    }

    const { panel, block } = measuredSurfaces(colors);
    const light = luminance(panel) > 0.4;
    // Menus and popovers need a solid background. When the panel colour comes
    // from SillyTavern it is often see-through, so use what it looks like.
    if (!colors.panel) root.setProperty('--pc-panel-solid', toHex(panel));
    root.setProperty('--pc-on-accent', light ? '#ffffff' : '#1a1a1e');
    doc.documentElement.dataset.pcLight = light ? '1' : '0';

    for (const key of MEANING) {
        if (preset === 'ember' && key === 'flow' && !Object.hasOwn(custom, key)) continue;
        const c = parseColor(colors[key]);
        if (!c) continue;
        // Worst case of the two backgrounds these colours sit on.
        const bg = contrast(c, panel) < contrast(c, block) ? panel : block;
        const fitted = fitContrast(c, bg, 3);
        if (fitted !== c) root.setProperty(`--pc-${key}`, toHex(fitted));
    }
    if (preset === 'lattice' && !currentTheme().custom.flow) {
        const quote = safe(() => getComputedStyle(doc.documentElement).getPropertyValue('--SmartThemeQuoteColor').trim());
        if (quote && parseColor(quote)) root.setProperty('--pc-flow', quote);
    }
    root.setProperty('--pc-accent', root.getPropertyValue('--pc-flow') || 'var(--SmartThemeQuoteColor, #e18a24)');
    // Notify the workspace after explicit theme changes.
    safe(() => doc.dispatchEvent(new CustomEvent('pc-theme')));
}

/** The font stack a look uses, for showing a preset's name in its own font. */
export function fontFor(style) {
    return FONTS[style?.font] ?? null;
}

/**
 * Things worth knowing about a theme: meaning colours too close to tell
 * apart, and colours hard to read on their background. Advice only.
 */
export function themeWarnings(colors = currentTheme().colors) {
    const out = [];
    const label = (k) => ROLES.find(r => r.key === k)?.label ?? k;
    const parsed = Object.fromEntries(MEANING.map(k => [k, parseColor(colors[k])]).filter(([, v]) => v));
    const keys = Object.keys(parsed);
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            const d = distance(parsed[keys[i]], parsed[keys[j]]);
            if (d < 15) out.push({ kind: 'similar', roles: [keys[i], keys[j]], text: `"${label(keys[i])}" and "${label(keys[j])}" are very close. They will be hard to tell apart.` });
        }
    }
    const text = parseColor(colors.text), panel = parseColor(colors.panel), block = parseColor(colors.block);
    if (text && panel && contrast(text, panel) < 4.5) out.push({ kind: 'contrast', roles: ['text', 'panel'], text: 'The text is hard to read on the panel background.' });
    if (text && block && contrast(text, block) < 4.5) out.push({ kind: 'contrast', roles: ['text', 'block'], text: 'The text is hard to read on the block background.' });
    return out;
}

/* ------------------------------------------------------------------ */
/* sharing                                                             */
/* ------------------------------------------------------------------ */

export function exportTheme(name = null) {
    const { preset, custom, customStyle } = currentTheme();
    const changed = Object.keys(custom).length + Object.keys(customStyle).length;
    return JSON.stringify({ latticeTheme: 1, name: name || PRESETS[preset].name + (changed ? ' (custom)' : ''), base: preset, colors: custom, style: customStyle });
}

/** @returns {{ok: boolean, reason?: string, name?: string}} */
export function importTheme(text) {
    let o;
    try { o = JSON.parse(String(text ?? '').trim()); } catch { return { ok: false, reason: 'That is not a Lattice theme. Paste the whole text you were given.' }; }
    if (!o || o.latticeTheme !== 1 || typeof o.colors !== 'object') return { ok: false, reason: 'That is not a Lattice theme.' };
    const colors = {};
    for (const r of ROLES) {
        const v = o.colors[r.key];
        if (v !== undefined && parseColor(v)) colors[r.key] = toHex(parseColor(v));
    }
    const style = {};
    for (const [part, def] of Object.entries(STYLE_OPTIONS)) {
        const v = o.style?.[part];
        if (def.options.some(x => x[0] === v)) style[part] = v;
    }
    const t = store();
    const base = o.base;
    t.preset = PRESETS[base] ? base : DEFAULT_PRESET;
    t.colors = colors;
    t.style = style;
    save();
    applyTheme();
    return { ok: true, name: String(o.name || 'Imported theme') };
}
