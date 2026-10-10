import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { compile } from 'svelte/compiler';
const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');

test('the installed workspace has one unconditional current shell', async () => {
    const shell = await read('ui/Workbench.svelte');
    assert.doesNotMatch(shell, /DomainSurface|StatusBar|CanvasControls|pc-legacy|view\.workflow\?\.native|class:pc-native-workspace/);
    assert.match(shell, /class="pc-root pc-native-workspace"/);
    assert.equal((shell.match(/<OutputPreview /g) || []).length, 1);
    assert.equal((shell.match(/<NodeDetails /g) || []).length, 1);
    assert.equal((shell.match(/<RunMeter /g) || []).length, 1);
    assert.deepEqual(compile(shell, { filename: 'Workbench.svelte', generate: 'client' }).warnings.filter(warning => warning.code.startsWith('a11y')), []);
});

test('shell geometry is shared across themes and graph tabs have no fallback', async () => {
    const [shell, tabs, types, entry] = await Promise.all(['ui/Workbench.svelte', 'ui/GraphTabs.svelte', 'ui/detail-types.ts', 'ui/entry.js'].map(read));
    assert.doesNotMatch(shell, /pc-native-default|nativeDefaultTheme/);
    assert.doesNotMatch(tabs, /\{:else\}[\s\S]*Main graph/);
    assert.doesNotMatch(types, /Schema2|schema2-candidate/);
    assert.doesNotMatch(entry, /WorkflowSurface|mountWorkflowSurface/);
    assert.match(shell, /pc-canvas-area::after/);
    assert.match(shell, /pc-graph-tab\[aria-selected="true"\]::after/);
});

test('controller and preparation admit only current workflow documents', async () => {
    const [controller, projection, preparation] = await Promise.all(['src/ui/controller.js', 'src/ui/workflow-surface.js', 'src/ui/workspace-preparation.js'].map(read));
    for (const source of [controller, projection, preparation]) assert.doesNotMatch(source, /normalizeNativeGraph|schema2Review|schema2Selector|projectLegacyWorkflow|owner\.legacy|workflowMode/);
    // Ban the retired preview helper, while allowing current qualified output diagnostics.
    assert.doesNotMatch(controller, /compile\.js|memory\.js|clip\.js|domain-surfaces|graph-analysis|scheduleTokenCount|\brunPreview\b|renderNodeInspector/);
    assert.match(projection, /cloneWorkflowDocument/);
    assert.match(controller, /isWorkflowGraph/);
});
