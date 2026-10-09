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
    const before = structuredClone(graph);
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
    if (schema === 3) {
        assert.ok(document.querySelector('.pc-details-heading')?.textContent.includes('Details'), 'supported native execution opens the actual Details pane');
        assert.equal(document.querySelector('.pc-native-diagnostic'), null, 'supported native execution has no unsupported-version diagnostic');
    } else {
        const diagnostic = document.querySelector('.pc-native-diagnostic');
        assert.ok(diagnostic && !diagnostic.hidden && !diagnostic.closest('[hidden]'), 'unsupported native execution exposes an honest visible diagnostic');
        assert.match(diagnostic.textContent, /unsupported/i);
        assert.match(diagnostic.textContent, /schema 2\/runtime 1/);
        assert.match(diagnostic.textContent, /schema 3\/runtime 2/);
    }
    assert.equal(Object.values(graph.nodes).some(node => node.type === 'output'), false);
    if (schema === 99) {
        document.querySelector('.pc-node[data-id="legacy"]').dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 100, clientY: 100 }));
        const manager = document.querySelector('[role="dialog"][aria-label="Manage portals"]');
        assert.ok(manager, 'native context opens the actual scoped Portal manager');
        assert.equal(document.querySelector('.pc-menu'), null, 'native context cannot fall through to the legacy menu');
        assert.ok(!document.body.textContent.includes('Save its answers to memory'), 'native intent cannot expose legacy memory commands');
        const warning = document.querySelector('.pc-native-diagnostic');
        assert.ok(warning && !warning.hidden && !warning.closest('[hidden]'), 'context navigation retains the visible unsupported-version warning');
        assert.match(warning.textContent, /schema 2\/runtime 1/);
        assert.match(warning.textContent, /schema 3\/runtime 2/);
        assert.equal(lore, 0, 'unsupported native context gathers no legacy lore');
        assert.equal(snapshots, 0, 'unsupported native context gathers no legacy character snapshots');
        assert.equal(tokens, 0, 'unsupported native context tokenizes no legacy prompt');
    }
    assert.equal(state.getGraph(graph.id), graph, 'UI retains the actual saved root identity');
    assert.deepEqual(state.getGraph(graph.id), before, 'native preview/context navigation cannot repair or mutate the saved root');
    UI.close();
}
console.log('workflow-controller-dispatch: ok');
