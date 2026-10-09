// Presentation-only discovery metadata. No graph, binding or runtime preparation.
const cube = 'M3 7 12 2l9 5v10l-9 5-9-5ZM3 7l9 5 9-5M12 12v10';
const boxes = 'M3 6l4-2 4 2v5l-4 2-4-2ZM3 6l4 2 4-2M7 8v5M13 6l4-2 4 2v5l-4 2-4-2ZM13 6l4 2 4-2M17 8v5M8 15l4-2 4 2v5l-4 2-4-2ZM8 15l4 2 4-2M12 17v5';
export const FAMILY_PALETTE = Object.freeze([
    { name: 'Input', color: '#96ad52', icon: cube },
    { name: 'Shaping', color: '#589aab', icon: 'M20 8a8 8 0 1 0 0 8M20 3v5h-5' },
    { name: 'Surface', color: '#92c9ad', icon: 'M3 14L14 6l7 4-11 8Z' },
    { name: 'Transpose', color: '#9080b6', icon: 'M3 7h18m-4-4 4 4-4 4M21 17H3m4-4-4 4 4 4' },
    { name: 'Derive', color: '#b65b9e', icon: 'M5 20v-6M12 20V8M19 20V3' },
    { name: 'Introspection', color: '#b39d71', icon: 'M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0' },
    { name: 'Output', color: '#c96d82', icon: cube },
    { name: 'Subgraphs', color: '#a3aa99', icon: boxes },
].map(item => Object.freeze(item)));
const groups = {
    Sources: 'M14 2H5v20h14V7Zm0 0v5h5M2 13h10m-3-3 3 3-3 3',
    Context: 'M3 5h18M6 12h12M9 19h6',
    Planning: 'M4 5h8a4 4 0 0 1 0 8H8a4 4 0 0 0 0 8h12m-3-3 3 3-3 3',
    Assembly: 'M3 5h6v6H3ZM15 5h6v6h-6ZM9 17h6v5H9M6 11v3h12v-3m-6 3v3',
    Revision: 'm4 17 12-12 3 3L7 20H4Zm10-10 3 3M11 21h10',
    Analysis: 'M3 8V3h5m8 0h5v5M3 16v5h5m8 0h5v-5M3 12h18',
    Validation: 'm3 5 2 2 3-3M11 5h10m-18 7 2 2 3-3M11 12h10M3 19h5m3 0h10',
    Parsing: 'm7 3-4 9 4 9m10-18 4 9-4 9M10 12h4',
    Extraction: 'M3 5h18M3 12h8M3 19h8m4-4 6 4-6 4m6-4h-7',
    Guidance: 'M5 2h10l4 4v16H5ZM15 2v4h4M8 11h8m-8 5h6',
    Review: 'm2 12 4 4 8-9m-3 8 3 3 8-10',
    Delivery: 'm2 11 20-9-8 20-4-8Zm8 3L22 2',
    Library: boxes,
    Routing: 'M3 12h18m-7-7 7 7-7 7',
    Blocks: cube,
    Reflect: 'M21 12s-4-7-9-7-9 7-9 7 4 7 9 7 9-7 9-7ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
    Internalize: 'M4 4h16v16H4M8 8l4 4 4-4M12 12v5',
    Express: 'M4 4h16v12H9l-5 4ZM8 8h8M8 12h5',
    Memory: 'M5 3h14v18H5ZM8 7h8M8 11h8M8 15h5',
    State: 'M3 12h4l3-7 4 14 3-7h4',
};
export const PALETTE_GROUPS = Object.freeze(Object.fromEntries(Object.entries(groups).map(([name, icon]) => [name, Object.freeze({ name, icon })])));
const metadata = {
    'scene-context': ['Sources', 'sc', 'M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15'],
    'reply-snapshot': ['Sources', 'rs', 'M3 6h4l2-3h6l2 3h4v15H3ZM16 13a4 4 0 1 0-8 0 4 4 0 0 0 8 0'],
    'smart-compactor': ['Context', 'cp', 'M3 3l6 6M3 9h6V3M21 21l-6-6m0 6v-6h6M3 21l6-6M3 15h6v6M21 3l-6 6m0-6v6h6'],
    'context-join': ['Context', 'cj', 'M3 5h5v5h8V5h5M3 19h5v-5h8v5h5M8 12h8'],
    'response-plan': ['Planning', 'rp', groups.Planning],
    compose: ['Assembly', 'co', groups.Assembly],
    repair: ['Revision', 'rr', 'm4 19 11-11 3 3L7 22ZM3 4h6M6 1v6m11-5v4m-2-2h4'],
    'style-transfer': ['Reference voice', 'st', 'M3 7h18m-4-4 4 4-4 4M5 17h14M8 14l-3 3 3 3'],
    'format-transfer': ['Reference format', 'ft', 'M4 3h7v7H4zM13 14h7v7h-7zM14 6h6m-3-3 3 3-3 3M4 17h6'],
    'terminology-map': ['Canonical terms', 'tm', 'M3 5h7v14H3zM14 5h7v14h-7zM10 12h4m-2-2 2 2-2 2'],
    'text-rules': ['Revision', 'tr', 'M3 5h18M8 5v16m-4 0h8M16 12h5m-2-2 2 2-2 2M16 18h5'],
    'pattern-scan': ['Analysis', 'ps', 'M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0Zm-1 5 6 6'],
    'validate-patches': ['Validation', 'vp', groups.Validation],
    'json-decode': ['Parsing', 'jd', groups.Parsing],
    'select-fields': ['Extraction', 'sf', groups.Extraction],
    guidance: ['Guidance', 'gd', 'M21 12a9 9 0 1 0-18 0 9 9 0 0 0 18 0ZM15 9l-2 4-4 2 2-4Z'],
    'review-gate': ['Review', 'rg', 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 0-6 0 3 3 0 0 0 6 0'],
    'apply-reply': ['Delivery', 'ar', groups.Delivery],
    reroute: ['Routing', 'rt', groups.Routing],
    reflect: ['Reflect', 'rf', groups.Reflect],
    internalize: ['Internalize', 'in', groups.Internalize],
    express: ['Express', 'ex', groups.Express],
    context: ['Context', 'cx', groups.Context],
    memory: ['Memory', 'mm', groups.Memory],
    state: ['State', 'sv', groups.State],
};
const palette = Object.freeze(Object.fromEntries(Object.entries(metadata).map(([id, [group, shortcode, icon]]) => [id, Object.freeze({ group, shortcode, icon })])));
const unknown = Object.freeze({ group: 'Blocks', shortcode: '', icon: cube });
export const paletteForOperation = operation => Object.hasOwn(palette, operation) ? palette[operation] : unknown;
/** Current authored fields and local view overrides become typed display values. */
export function readNodePresentation(node = {}, overlay = {}) {
    const alias = overlay?.alias ?? node?.presentation?.alias ?? node?.alias;
    const compact = overlay?.compact ?? node?.presentation?.compact ?? node?.compact;
    return { alias: typeof alias === 'string' ? alias.slice(0, 80) : '', compact: compact === true };
}
