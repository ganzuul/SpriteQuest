import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<body><div id="chat"></div></body>', { pretendToBeVisual: true });
Object.assign(globalThis, { window: dom.window, document: dom.window.document, CSS: { escape: s => s }, CustomEvent: dom.window.CustomEvent, HTMLElement: dom.window.HTMLElement, Event: dom.window.Event, MouseEvent: dom.window.MouseEvent });
globalThis.requestAnimationFrame = fn => setTimeout(fn, 0);
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.toastr = { info() {}, warning() {}, success() {}, error() {} };
const { installMock } = await import('./mock.js');
const context = installMock({ settings: { graphs: {} } });
let lore = 0, snapshots = 0, tokens = 0;
context.getWorldInfoPrompt = async () => { lore++; return {}; };
context.getCharacterCardFields = () => { snapshots++; return {}; };
context.getTokenCountAsync = async () => { tokens++; return 1; };
const state = await import('../src/state.js');
const { starterGraph } = await import('../src/workflow/starters.js');
const { normalizeNativeGraph } = await import('../src/workflow/migration.js');
const UI = await import('../src/ui.js');
for (const schema of [3, 99]) {
    const graph = normalizeNativeGraph(starterGraph('native-guidance')).data;
    graph.schema = schema;
    if (schema === 99) graph.nodes.legacy = { id: 'legacy', type: 'generate', title: 'Unsupported old block', x: 0, y: 0 };
    state.settings().graphs[graph.id] = graph;
    state.settings().activeGraphId = graph.id;
    UI.open();
    UI.scheduleTokenCount(0);
    await UI.runPreview();
    await new Promise(resolve => setTimeout(resolve, 80));
    assert.equal(lore, 0, `schema ${schema} controller never gathers legacy lore`);
    assert.equal(snapshots, 0, `schema ${schema} controller never gathers legacy character snapshots`);
    assert.equal(tokens, 0, `schema ${schema} controller never tokenizes a legacy prompt`);
    assert.equal(document.querySelector('.pc-preview')?.classList.contains('pc-preview-open'), false);
    assert.ok(document.querySelector('.pc-inspector').textContent.includes('schema 2 and runtime 1'), 'unsupported native document exposes its version diagnostic');
    assert.equal(Object.values(graph.nodes).some(node => node.type === 'output'), false);
    if (schema === 99) {
        document.querySelector('.pc-node[data-id="legacy"]').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));
        const menu = document.querySelector('.pc-menu');
        assert.ok(menu, 'native node context menu opens');
        assert.ok(!menu.textContent.includes('Save its answers to memory'), 'native intent cannot expose legacy memory commands');
    }
    UI.close();
}
console.log('workflow-controller-dispatch: ok');
