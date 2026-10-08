import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { installMock } from './mock.js';
export const dom = new JSDOM('<body><div id="canvas"></div></body>', { pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, HTMLElement: dom.window.HTMLElement, CustomEvent: dom.window.CustomEvent, CSS: { escape: value => value }, getComputedStyle: dom.window.getComputedStyle });
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
document.elementFromPoint = () => null;
installMock({ settings: { graphs: {} } });
export const version = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url))).version;
export const S = await import(`../src/state.js?v=${version}`);
export const { Canvas } = await import(`../src/canvas.js?v=${version}`);
export function fixture(hooks = {}) {
    const host = document.createElement('div'); document.body.append(host);
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 1000, height: 800, right: 1000, bottom: 800 });
    const graph = S.blankGraph('Test'); graph.view = { x: 0, y: 0, zoom: 1 };
    const a = S.addNode(graph, 'prompt', 50, 50);
    const b = S.addNode(graph, 'prompt', 350, 50);
    const wire = S.connect(graph, a.id, b.id, 'merge');
    const canvas = new Canvas(host, hooks); canvas.setGraph(graph);
    return { host, graph, a, b, wire, canvas };
}
export function mouse(target, type, x, y, options = {}) {
    target.dispatchEvent(new dom.window.MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y, ...options }));
}
