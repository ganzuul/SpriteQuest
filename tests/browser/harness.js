import { installMock } from '../mock.js';
const context = installMock({ settings: { graphs: {}, ui: { liveTokens: false } } });
// Browser fixtures exercise the public host events used by workflow freshness.
const listeners = new Map();
context.eventSource = {
    on(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
    removeListener(name, callback) { listeners.get(name)?.delete(callback); },
    async emit(name, ...args) { for (const callback of [...(listeners.get(name) ?? [])]) await callback(...args); },
};
context.eventTypes = new Proxy({}, { get: (_, key) => key });
context.SlashCommandParser = { addCommandObject() {} }; context.SlashCommand = { fromProps: value => value };
const toasts = [];
globalThis.toastr = Object.fromEntries(['info', 'success', 'warning', 'error'].map(type => [type, message => toasts.push({ type, message })]));
const version = (await (await fetch('/manifest.json')).json()).version;
const S = await import(`/src/state.js?v=${version}`);
const { Canvas } = await import(`/src/canvas.js?v=${version}`);
let canvas;
const setGraph = Canvas.prototype.setGraph;
Canvas.prototype.setGraph = function (graph) { canvas = this; return setGraph.call(this, graph); };
const UI = await import(`/src/ui.js?v=${version}`);
const H = await import(`/src/history.js?v=${version}`);
await import(`/index.js?v=${version}`);
window.sillyCanvas.open();
const settle = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
await settle();
window.canvasHarness = {
    context, S, UI, H, toasts,
    get canvas() { return canvas; },
    get graph() { return canvas.graph; },
    get selection() { return [...canvas.multi]; },
    async reset(count = 3, columns = 3) {
        const g = canvas.graph;
        const blank = S.blankGraph('Browser fixture');
        g.nodes = blank.nodes; g.wires = {}; g.groups = {};
        const output = S.outputNode(g);
        output.x = 360; output.y = 430;
        const nodes = [];
        for (let i = 0; i < count; i++) {
            const node = S.addNode(g, S.NODE_TYPES.PROMPT, (i % columns) * 300 + 40, Math.floor(i / columns) * 210 + 40);
            node.title = `Prompt ${i + 1}`; node.content = 'A short prompt for rendering checks.';
            nodes.push(node);
        }
        for (let i = 1; i < nodes.length; i++) S.connect(g, nodes[i - 1].id, nodes[i].id, 'merge');
        if (nodes.length) S.connect(g, nodes.at(-1).id, output.id, 'merge');
        canvas.setGraph(g); UI.refreshIfOpen();
        await settle();
        Object.assign(g.view, { x: 0, y: 0, zoom: 1 }); canvas.applyTransform();
        return nodes.map(node => node.id);
    },
    async view(view) { Object.assign(canvas.view, view); canvas.applyTransform(); await settle(); },
    settle,
};
