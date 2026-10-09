import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const retired = ['compile', 'memory', 'jev', 'thoughts', 'statevals', 'state-window', 'lore', 'expr', 'select', 'clip', 'model-combo'].map(name => `src/${name}.js`)
    .concat(['src/workflow/migration.js', 'src/workflow/legacy-insertion.js', 'src/ui/domain-surfaces.js', 'src/ui/graph-analysis.js',
        'ui/DomainSurface.svelte', 'ui/StatusBar.svelte', 'ui/CanvasControls.svelte', 'ui/WorkflowSurface.svelte']);

test('installation contains no retired engine, reader, or compatibility component', () => {
    for (const file of retired) assert.equal(existsSync(resolve(root, file)), false, `${file} must be removed from the installation`);
});

test('the shipped entry resolves all local modules and exposes only current host hooks', () => {
    const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
    assert.equal(manifest.generate_interceptor, 'latticeGenerationInterceptor');
    const seen = new Set(), pending = [resolve(root, manifest.js.split('?')[0])];
    while (pending.length) {
        const file = pending.pop();
        if (seen.has(file)) continue;
        seen.add(file);
        assert.ok(existsSync(file), `missing installed dependency: ${file}`);
        const source = readFileSync(file, 'utf8');
        assert.equal(/isNativeWorkflow|normalizeNativeGraph|schema2-candidate|mountWorkflowSurface|promptCanvasGenerationInterceptor|comfytavernGenerationInterceptor|globalThis\.promptCanvas\b|globalThis\.comfytavern\b/.test(source), false, `retired hook or selector in ${file}`);
        for (const match of source.matchAll(/(?:from\s*|import\s*\(|new\s+URL\s*\()\s*['"](\.{1,2}\/[^'"]+\.js(?:\?[^'"]*)?)['"]/g)) {
            const dependency = resolve(dirname(file), match[1].split('?')[0]);
            assert.ok(dependency.startsWith(root), `dependency leaves installation: ${match[1]}`);
            assert.ok(!retired.some(path => resolve(root, path) === dependency), `retired installed import: ${match[1]}`);
            pending.push(dependency);
        }
    }
    assert.ok(seen.size > 20, 'walked the actual runtime and UI import graph');
    const entry = readFileSync(resolve(root, 'index.js'), 'utf8');
    assert.match(entry, /name:\s*'lattice'/);
    assert.match(entry, /globalThis\.lattice\s*=/);
    assert.doesNotMatch(entry, /AFTER_COMBINE_PROMPTS|GENERATE_AFTER_DATA|prompt-canvas|\/canvas\b/);
});
