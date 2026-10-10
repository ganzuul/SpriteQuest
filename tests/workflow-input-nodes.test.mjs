import assert from 'node:assert/strict';
import { test } from 'node:test';
const api = await import('../src/workflow/operations/input-nodes.js').catch(() => ({}));

test('Text describes one Text output in the containing phase', () => {
    assert.equal(typeof api.describeInput, 'function');
    const result = api.describeInput({ operation: 'text' }, { phase: 'pre' });
    assert.equal(result.ok, true);
    assert.deepEqual(result.data.ports, [{ id: 'out', label: 'Text', direction: 'output', kind: 'text', required: false, cardinality: 'one' }]);
    assert.equal(result.data.descriptor.phase, 'pre');
    assert.equal(result.data.descriptor.input, null);
    assert.equal(result.data.descriptor.requestBound, 0);
    assert.equal(result.data.descriptor.modelRole, null);
    assert.deepEqual(result.data.descriptor.defaults, { text: '' });
    assert.deepEqual(result.data.descriptor.controlDescriptors.text, { type: 'string', label: 'Text', editor: 'text', default: '', multiline: true, maxLength: 100000 });
});

test('Text emits literal saved content without interpreting placeholders', () => {
    assert.equal(typeof api.executeInput, 'function');
    const result = api.executeInput({ operation: 'text', text: '{{char}}\n{{data:}}\n<a href="x">literal</a>' }, { phase: 'post' });
    assert.deepEqual(result, { ok: true, artifact: { kind: 'text', text: '{{char}}\n{{data:}}\n<a href="x">literal</a>' }, reports: [] });
});

test('Text without a saved value emits valid empty Text', () => {
    assert.deepEqual(api.executeInput({ operation: 'text' }, { phase: 'pre' }), { ok: true, artifact: { kind: 'text', text: '' }, reports: [] });
});

test('Text rejects values outside its bounded string contract before execution', () => {
    for (const text of [undefined, null, 1, {}, 'x'.repeat(100001)]) {
        const node = { operation: 'text', text };
        for (const result of [api.describeInput(node, { phase: 'pre' }), api.executeInput(node, { phase: 'pre' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'INVALID_SETTINGS');
            assert.equal(Object.hasOwn(result, 'artifact'), false);
        }
    }
    const text = 'x'.repeat(100000);
    assert.equal(api.executeInput({ operation: 'text', text }, { phase: 'post' }).artifact.text, text);
});

test('File Input keeps an embedded saved snapshot hidden from ordinary setting editors', () => {
    const result = api.describeInput({ operation: 'file-input' }, { phase: 'post' });
    assert.equal(result.ok, true);
    assert.equal(result.data.descriptor.title, 'File Input');
    assert.deepEqual(result.data.descriptor.defaults, { fileName: '', content: '', loaded: false });
    assert.deepEqual(result.data.descriptor.controls, ['fileName', 'content', 'loaded']);
    for (const key of ['fileName', 'content', 'loaded']) {
        assert.equal(result.data.descriptor.controlDescriptors[key].hidden, true);
        assert.equal(result.data.descriptor.controlDescriptors[key].exposable, false);
    }
    assert.equal(result.data.descriptor.controlDescriptors.content.maxLength, 100000);
    assert.equal(result.data.descriptor.controlDescriptors.fileName.maxLength, 255);
    assert.equal(result.data.descriptor.phase, 'post');
    assert.deepEqual(result.data.ports.map(port => [port.id, port.direction, port.kind]), [['out', 'output', 'text']]);
});

test('File Input fails explicitly until a snapshot has been loaded', () => {
    for (const node of [{ operation: 'file-input' }, { operation: 'file-input', fileName: 'notes.txt', content: 'stale', loaded: false }]) {
        const result = api.executeInput(node, { phase: 'pre' });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'FILE_UNAVAILABLE');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
});

test('File Input emits its embedded snapshot including a loaded empty file', () => {
    for (const content of ['', 'Saved {{char}}\ncontent', 'x'.repeat(100000)]) {
        const node = { operation: 'file-input', fileName: 'notes.txt', content, loaded: true };
        const serialized = JSON.parse(JSON.stringify(node));
        const result = api.executeInput(serialized, { phase: 'post' });
        assert.deepEqual(result, { ok: true, artifact: { kind: 'text', text: content }, reports: [] });
        assert.equal(serialized.content, content);
    }
});

test('File Input rejects malformed or overlarge embedded snapshot controls', () => {
    for (const patch of [{ loaded: 'true' }, { loaded: undefined }, { fileName: null }, { fileName: 'n'.repeat(256) }, { content: null }, { content: 'x'.repeat(100001) }]) {
        const node = { operation: 'file-input', fileName: 'notes.txt', content: '', loaded: true, ...patch };
        for (const result of [api.describeInput(node, { phase: 'pre' }), api.executeInput(node, { phase: 'pre' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'INVALID_SETTINGS');
            assert.equal(Object.hasOwn(result, 'artifact'), false);
        }
    }
    assert.equal(api.executeInput({ operation: 'file-input', fileName: 'n'.repeat(255), loaded: true }, { phase: 'pre' }).ok, true);
});

test('Prompt Source describes stable root-only host template selectors', () => {
    const result = api.describeInput({ operation: 'prompt-source', source: 'system', promptId: 'custom-entry', form: 'resolved' }, { phase: 'pre' });
    assert.equal(result.ok, true);
    const descriptor = result.data.descriptor;
    assert.equal(descriptor.title, 'Prompt Source');
    assert.equal(descriptor.rootOnly, true);
    assert.deepEqual(descriptor.defaults, { source: 'system', promptId: 'main', form: 'raw' });
    assert.deepEqual(descriptor.controls, ['source', 'promptId', 'form']);
    assert.deepEqual(descriptor.controlDescriptors.source.values, ['system', 'prompt-entry']);
    assert.deepEqual(descriptor.controlDescriptors.form.values, ['raw', 'resolved']);
    assert.deepEqual(descriptor.controlDescriptors.promptId.visibleWhen, { key: 'source', value: 'prompt-entry' });
    assert.equal(descriptor.controlDescriptors.promptId.maxLength, 200);
    assert.equal(descriptor.requestBound, 0);
    assert.equal(descriptor.modelRole, null);
    assert.deepEqual(result.data.ports.map(port => [port.id, port.direction, port.kind]), [['out', 'output', 'text']]);
});

test('Prompt Source requires host dispatch instead of synthesizing an empty snapshot', () => {
    for (const node of [{ operation: 'prompt-source' }, { operation: 'prompt-source', source: 'prompt-entry', promptId: 'main', form: 'resolved' }]) {
        const result = api.executeInput(node, { phase: 'pre' });
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'HOST_SOURCE_REQUIRED');
        assert.equal(Object.hasOwn(result, 'artifact'), false);
    }
});

test('Prompt Source validates its stable identifier even when the selector is hidden', () => {
    for (const patch of [{ promptId: '' }, { promptId: '   ' }, { promptId: 'p'.repeat(201) }, { promptId: null }, { source: 'assembled' }, { form: 'formatted' }]) {
        const node = { operation: 'prompt-source', source: 'system', ...patch };
        for (const result of [api.describeInput(node, { phase: 'post' }), api.executeInput(node, { phase: 'post' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'INVALID_SETTINGS');
        }
    }
    assert.equal(api.describeInput({ operation: 'prompt-source', source: 'prompt-entry', promptId: 'p'.repeat(200) }, { phase: 'post' }).ok, true);
});

test('Input descriptions require a concrete phase and reject a conflicting containing phase', () => {
    for (const operation of ['text', 'file-input', 'prompt-source']) {
        const node = { operation };
        assert.equal(api.describeInput({ ...node, phase: 'post' }).data.descriptor.phase, 'post');
        assert.equal(api.describeInput(node, { phase: 'pre' }).data.descriptor.phase, 'pre');
        for (const [value, options] of [[node, {}], [node, { phase: 'both' }], [{ ...node, phase: 'pre' }, { phase: 'post' }], [{ ...node, phase: 'both' }, { phase: 'pre' }]]) {
            for (const result of [api.describeInput(value, options), api.executeInput(value, options)]) {
                assert.equal(result.ok, false);
                assert.equal(result.error.code, 'INVALID_PHASE');
            }
        }
    }
});

test('Input operations reject unknown identities and unsupported operation versions', () => {
    for (const node of [{ operation: 'compose' }, { operation: '__proto__' }, { operation: null }, { operation: 'text', operationVersion: 2 }, { type: 'note', operation: 'text' }]) {
        for (const result of [api.describeInput(node, { phase: 'pre' }), api.executeInput(node, { phase: 'pre' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'UNKNOWN_OPERATION');
        }
    }
    assert.equal(api.describeInput({ type: 'workflow', operation: 'text', operationVersion: 1 }, { phase: 'pre' }).ok, true);
});

test('Input operation adapters reject accessor controls without reading them', () => {
    const fixtures = [
        [{ operation: 'text' }, 'text', 'unsafe'],
        [{ operation: 'file-input' }, 'content', 'unsafe'],
        [{ operation: 'file-input' }, 'loaded', true],
        [{ operation: 'prompt-source' }, 'promptId', 'main'],
        [{ operation: 'text' }, 'operation', 'text'],
        [{ operation: 'text' }, 'operationVersion', 1],
        [{ operation: 'text' }, 'phase', 'pre'],
    ];
    let reads = 0;
    for (const [node, key, value] of fixtures) {
        Object.defineProperty(node, key, { enumerable: true, get() { reads++; return value; } });
        for (const result of [api.describeInput(node, { phase: 'pre' }), api.executeInput(node, { phase: 'pre' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'INVALID_SETTINGS');
        }
    }
    const options = Object.defineProperty({}, 'phase', { enumerable: true, get() { reads++; return 'pre'; } });
    assert.equal(api.describeInput({ operation: 'text' }, options).error.code, 'INVALID_SETTINGS');
    assert.equal(reads, 0);
});

test('Input adapters accept plain DTOs and reject arrays or class instances', () => {
    class Node { constructor() { this.operation = 'text'; this.text = 'class'; } }
    class Options { constructor() { this.phase = 'pre'; } }
    const arrayNode = Object.assign([], { operation: 'text', text: 'array' });
    for (const node of [new Node(), arrayNode, null, 'text']) {
        for (const result of [api.describeInput(node, { phase: 'pre' }), api.executeInput(node, { phase: 'pre' })]) {
            assert.equal(result.ok, false);
            assert.equal(result.error.code, 'INVALID_SETTINGS');
        }
    }
    for (const options of [new Options(), Object.assign([], { phase: 'pre' }), null]) {
        assert.equal(api.describeInput({ operation: 'text' }, options).error.code, 'INVALID_SETTINGS');
    }
    const node = Object.assign(Object.create(null), { operation: 'text', text: 'plain' });
    const options = Object.assign(Object.create(null), { phase: 'post' });
    assert.deepEqual(api.executeInput(node, options), { ok: true, artifact: { kind: 'text', text: 'plain' }, reports: [] });
});
