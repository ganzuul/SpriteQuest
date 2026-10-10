import assert from 'node:assert/strict';
import { test } from 'node:test';
const revisions = await import('../src/workflow/draft-revisions.js?v=0.27.0').catch(() => ({}));
const root = text => ({ kind: 'draft', text, source: { chatId: 'story', messageIndex: 4, swipeId: 0, originalText: text, token: 'native-token' } });
const must = result => { assert.equal(result.ok, true, JSON.stringify(result.error)); return result.data; };

test('successive revisions preserve native original and expose a flat parent lineage', () => {
    assert.equal(typeof revisions.createDraftRevision, 'function', 'Draft revision helper is required');
    const first = must(revisions.createDraftRevision(root('Native prose.'), 'First prose.', { nodeId: 'style', scope: 'whole' })).draft;
    const second = must(revisions.createDraftRevision(first, 'Second prose.', { nodeId: 'voice', scope: 'authorized' })).draft;
    const candidate = must(revisions.toFinalCandidate(second)).candidate;
    assert.equal(candidate.original, 'Native prose.');
    assert.equal(candidate.text, 'Second prose.');
    assert.equal(candidate.source.originalText, 'Native prose.');
    assert.equal(second.lineage.length, 2);
    assert.equal(second.lineage[1].parentId, first.revisionId);
    assert.equal(second.lineage.some(entry => Object.hasOwn(entry, 'draft')), false);
    assert.equal(Object.isFrozen(second.source), true);
});
test('narrow revisions cannot widen their parent permissions or remove protected literals', () => {
    const original = { ...root('A "KEEP cold" B'), protectedLiterals: ['KEEP'], spans: [{ index: 0, start: 3, end: 12, text: 'KEEP cold' }], scope: 'dialogue' };
    const first = revisions.createDraftRevision(original, 'A "KEEP warm" B', { nodeId: 'voice', scope: 'whole' });
    assert.equal(first.ok, true, JSON.stringify(first.error));
    const changedOutside = revisions.createDraftRevision(first.data.draft, 'X "KEEP warm" B', { nodeId: 'voice2', scope: 'whole' });
    assert.equal(changedOutside.ok, false, 'Parent dialogue permission cannot be widened to narration');
    assert.equal(revisions.createDraftRevision(first.data.draft, 'A "warm" B', { nodeId: 'voice2', scope: 'authorized' }).ok, false);
    assert.equal(revisions.createDraftRevision(root('unannotated'), 'changed', { nodeId: 'style', scope: 'authorized' }).error.code, 'SCOPE_REQUIRED');
});
test('legacy patch repair and reference alignment target the current revision while preserving root original', async () => {
    const { scanDraft, repairDraft, validatePatches } = await import('../src/workflow/repair.js');
    const reference = await import('../src/workflow/operations/reference-draft.js?v=0.27.0');
    const first = must(revisions.createDraftRevision(root('Native cold prose.'), 'First warm prose.', { nodeId: 'first', scope: 'whole' })).draft;
    const scanned = scanDraft(first, { scope: 'whole', rules: ['warm'] });
    assert.equal(scanned.ok, true, JSON.stringify(scanned.error));
    const repaired = await repairDraft(scanned.artifact, { id: 'repair' }, { binding: {}, countTokens: async () => ({ tokens: 10 }), request: async options => {
        assert.equal(JSON.parse(options.messages[1].content).original, 'First warm prose.');
        return { ok: true, data: { text: '{"patches":[{"index":0,"replacement":"bright"}]}', finish: 'stop' } };
    } });
    assert.equal(repaired.ok, true, JSON.stringify(repaired.error));
    const candidate = validatePatches(repaired.artifact);
    assert.equal(candidate.ok, true, JSON.stringify(candidate.error));
    assert.equal(candidate.artifact.original, 'Native cold prose.');
    assert.equal(candidate.artifact.text, 'First bright prose.');
    assert.equal(candidate.artifact.baseline, 'First warm prose.');
    assert.equal(candidate.artifact.parentRevisionId, first.revisionId);
    const prepared = must(reference.prepareReferenceDraft(first, { scope: 'whole' }));
    const aligned = must(reference.alignReferenceCandidate(prepared, 'Second warm prose.'));
    assert.equal(validatePatches(aligned.artifact).artifact.original, 'Native cold prose.');
});
test('prose cleanup preserves revision authority while adding findings and checked patches', async () => {
    const { cleanupDraft } = await import('../src/workflow/operations/prose-cleanup.js?v=0.27.0');
    const { validatePatches } = await import('../src/workflow/repair.js');
    const first = must(revisions.createDraftRevision(root('Original.'), 'She let out a breath she did not know she was holding.', { nodeId: 'first', scope: 'whole' })).draft;
    const result = await cleanupDraft(first, { mode: 'inspect', scope: 'whole' });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    const candidate = validatePatches(result.data.artifact);
    assert.equal(candidate.ok, true, JSON.stringify(candidate.error));
    assert.equal(candidate.artifact.original, 'Original.');
});
test('a successful revision remains readable within the same snapshot bounds', () => {
    const large = { ...root('Native.'), extra: 'x'.repeat(400000) };
    const result = revisions.createDraftRevision(large, 'y'.repeat(80000), { nodeId: 'expand', scope: 'whole' });
    assert.equal(result.ok, false, 'An output beyond the next-read bound must not be emitted');
    assert.equal(result.error.code, 'OUTPUT_LIMIT');
});
test('revising an assembled body keeps the presentation immutable and subsequent append uses the new body', () => {
    const first = must(revisions.createDraftRevision(root('Native.'), 'First.', { nodeId: 'one', scope: 'whole' })).draft;
    const assembled = must(revisions.appendDraftSections(first, [{ id: 'notes', text: 'Notes.' }], { nodeId: 'append' })).draft;
    const revised = must(revisions.createDraftRevision(assembled, 'Second.\n\nNotes.', { nodeId: 'two', scope: 'authorized' })).draft;
    const replaced = must(revisions.appendDraftSections(revised, [{ id: 'notes', text: 'Updated.' }], { nodeId: 'append' })).draft;
    assert.equal(replaced.text, 'Second.\n\nUpdated.');
    assert.equal(revisions.createDraftRevision(assembled, 'First.\n\nChanged notes.', { nodeId: 'bad', scope: 'whole' }).ok, false);
});
test('annotation authority rejects fabricated spans rather than authenticating malformed permissions', () => {
    const first = must(revisions.createDraftRevision(root('Native.'), 'Current.', { nodeId: 'one', scope: 'whole' })).draft;
    const retained = revisions.retainDraftAuthority(first, { ...first, spans: [{ index: 0, start: 0, end: 8, text: 'invented' }] });
    assert.equal(retained.ok, false);
    assert.equal(retained.error.code, 'INVALID_SPANS');
});
test('an unchanged scoped revision does not guess new alignment for repeated anchors', () => {
    const text = 'abc MARK abc MARK abc';
    const parent = { ...root(text), scope: 'whole', spans: [{ index: 0, start: 0, end: 12, text: 'abc MARK abc' }, { index: 1, start: 18, end: 21, text: 'abc' }] };
    const result = revisions.createDraftRevision(parent, text, { nodeId: 'no-change', scope: 'authorized' });
    assert.equal(result.ok, true, JSON.stringify(result.error));
    assert.deepEqual(result.data.draft.spans.map(span => [span.start, span.end]), [[0, 12], [18, 21]]);
});
test('dialogue revision cannot emit permissions that cross newly inserted quote delimiters', () => {
    const result = revisions.createDraftRevision(root('A "cold" B'), 'A "warm "curse"" B', { nodeId: 'dialogue', scope: 'dialogue' });
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INVALID_SPANS');
});
test('new exemption wording narrows successor permissions instead of becoming editable authority', () => {
    const parent = { ...root('cold warm'), scope: 'whole', caseSensitive: true, exemptions: ['KEEP'], spans: [{ index: 0, start: 0, end: 9, text: 'cold warm' }] };
    const result = must(revisions.createDraftRevision(parent, 'cold KEEP warm', { nodeId: 'one', scope: 'authorized' })).draft;
    assert.deepEqual(result.spans.map(span => span.text), ['cold ', ' warm']);
});
test('copied ancestry, modified source scope and getter-backed Drafts cannot recreate live authority', () => {
    const native = root('Native.'); native.source.userHandle = 'default-user';
    const first = must(revisions.createDraftRevision(native, 'Current.', { nodeId: 'one', scope: 'whole' })).draft;
    for (const forged of [{ ...first }, structuredClone(first), { ...first, source: { ...first.source, chatId: 'elsewhere' } }, { kind: 'text', text: first.text, lineage: first.lineage }]) {
        assert.equal(revisions.toFinalCandidate(forged).ok, false);
        assert.equal(revisions.createDraftRevision(forged, 'Forged.', { nodeId: 'bad', scope: 'whole' }).ok, false);
    }
    native.source.originalText = 'Changed after capture';
    assert.equal(must(revisions.toFinalCandidate(first)).candidate.original, 'Native.');
    let reads = 0;
    const unsafe = root('Native.'); Object.defineProperty(unsafe, 'text', { enumerable: true, get() { reads++; return 'Native.'; } });
    assert.equal(revisions.snapshotDraft(unsafe).ok, false);
    assert.equal(reads, 0);
});

test('revision history fails at its bound without dropping original ancestry', () => {
    let draft = root('Native.');
    for (let index = 0; index < 64; index++) draft = must(revisions.createDraftRevision(draft, `Revision ${index}.`, { nodeId: `node-${index}`, scope: index === 0 ? 'whole' : 'authorized' })).draft;
    assert.equal(revisions.createDraftRevision(draft, 'Overflow.', { nodeId: 'overflow', scope: 'authorized' }).error.code, 'LINEAGE_LIMIT');
    assert.equal(must(revisions.toFinalCandidate(draft)).candidate.original, 'Native.');
    assert.equal(draft.lineage.length, 64);
});
test('story-body views exclude presentation and keep a stable body revision across note replacements', () => {
    assert.equal(typeof revisions.readDraftBody, 'function', 'A checked story-body view is required');
    const first = must(revisions.createDraftRevision(root('Native.'), 'The wand was used.', { nodeId: 'prose', scope: 'whole' })).draft;
    const assembled = must(revisions.appendDraftSections(first, [{ id: 'notes', text: 'The wand was used again. (notes only)' }], { nodeId: 'append' })).draft;
    const replaced = must(revisions.appendDraftSections(assembled, [{ id: 'notes', text: 'Different presentation.' }], { nodeId: 'append' })).draft;
    assert.equal(must(revisions.readDraftBody(assembled)).text, 'The wand was used.');
    assert.equal(must(revisions.readDraftBody(replaced)).provenance.revisionId, first.revisionId);
    assert.equal(revisions.readDraftBody({ ...assembled, text: 'Forged' }).ok, false);
});
test('same-text annotations preserve private disclosure restrictions before public append', async () => {
    const models = await import('../src/workflow/operations/model-nodes.js?v=0.27.0');
    const privateRoot = { ...root('Private prose.'), visibility: { kind: 'actor-private', actorId: 'mara' } };
    const first = must(revisions.createDraftRevision(privateRoot, 'Private revision.', { nodeId: 'one', scope: 'whole' })).draft;
    for (const altered of [{ ...first, visibility: { kind: 'public' } }, { ...first, visibility: undefined }, { ...first, visibility: { kind: 'actor-private', actorId: 'laya' } }]) {
        const retained = revisions.retainDraftAuthority(first, altered);
        assert.equal(retained.ok, false, 'Annotation must not grant public or different-actor access to private text');
        assert.equal(retained.error.code, 'DISCLOSURE_CHANGED');
    }
    const preserved = must(revisions.retainDraftAuthority(first, { ...first, findings: [{ code: 'CHECKED' }] })).draft;
    assert.equal((await models.executeModelNode({ id: 'append', operation: 'append' }, { draft: preserved, section: { kind: 'text', text: 'Notes.' } }, { phase: 'post' })).error.code, 'PRIVATE_MATERIAL');
    const nested = must(revisions.createDraftRevision({ ...root('Native.'), context: { visibility: { kind: 'actor-private', actorId: 'mara' }, text: 'Private memory' } }, 'Current.', { nodeId: 'nested', scope: 'whole' })).draft;
    assert.equal(revisions.retainDraftAuthority(nested, { ...nested, context: { visibility: { kind: 'public' }, text: 'Private memory' } }).error.code, 'DISCLOSURE_CHANGED');
    assert.equal(revisions.retainDraftAuthority(nested, { ...nested, context: undefined }).error.code, 'DISCLOSURE_CHANGED');
});

test('narration scope parses only the registered body while preserving unmatched quotes in notes', async () => {
    const { scanDraft, validatePatches } = await import('../src/workflow/repair.js?v=0.27.0');
    const first = must(revisions.createDraftRevision(root('Native.'), 'First.', { nodeId: 'one', scope: 'narration' })).draft;
    const note = 'A note contains an unmatched " quote.';
    const assembled = must(revisions.appendDraftSections(first, [{ id: 'notes', text: note }], { nodeId: 'append' })).draft;
    const revised = must(revisions.createDraftRevision(assembled, 'Second.\n\n' + note, { nodeId: 'two', scope: 'authorized' })).draft;
    assert.equal(must(revisions.readDraftBody(revised)).text, 'Second.');
    assert.equal(revised.presentationSections[0].text, note);
    assert.equal(revisions.createDraftRevision(assembled, 'Second.\n\nChanged notes.', { nodeId: 'bad', scope: 'narration' }).error.code, 'OUT_OF_SCOPE_CHANGE');
    const scanned = scanDraft(assembled, { scope: 'narration', rules: ['First'] });
    assert.equal(scanned.ok, true, JSON.stringify(scanned.error));
    assert.equal(scanned.reports.some(report => report.code === 'UNMATCHED_QUOTES'), false);
    const patched = validatePatches({ kind: 'patches', draft: scanned.artifact, patches: [{ index: 0, replacement: 'Second' }] });
    assert.equal(patched.ok, true, JSON.stringify(patched.error));
    assert.equal(patched.artifact.text, 'Second.\n\n' + note);
    assert.equal(patched.artifact.original, 'Native.');
});

test('successor scans may add narrowing exemptions while preserving previous exemptions and case policy', async () => {
    const { scanDraft } = await import('../src/workflow/repair.js?v=0.27.0');
    const text = 'KEEP cold and Warm.';
    const native = { ...root(text), scope: 'whole', exemptions: ['KEEP'], caseSensitive: false, spans: [{ index: 0, start: 4, end: text.length, text: text.slice(4) }] };
    const first = must(revisions.createDraftRevision(native, text, { nodeId: 'one', scope: 'authorized' })).draft;
    const scanned = scanDraft(first, { scope: 'whole', rules: ['cold', 'Warm'], exemptions: ['Warm'], caseSensitive: true });
    assert.equal(scanned.ok, true, JSON.stringify(scanned.error));
    assert.deepEqual(scanned.artifact.exemptions, ['KEEP', 'Warm']);
    assert.equal(scanned.artifact.caseSensitive, false, 'Old exemption case policy remains authoritative');
    assert.deepEqual(scanned.artifact.spans.map(span => span.text), ['cold']);
    assert.equal(must(revisions.toFinalCandidate(scanned.artifact)).candidate.original, text);
    assert.equal(revisions.retainDraftAuthority(scanned.artifact, { ...scanned.artifact, exemptions: ['Warm'] }).error.code, 'INVALID_SPANS');
    assert.equal(revisions.retainDraftAuthority(scanned.artifact, { ...scanned.artifact, caseSensitive: true }).error.code, 'INVALID_SPANS');
    assert.equal(revisions.retainDraftAuthority(first, { ...first, exemptions: ['KEEP', 'Warm'] }).error.code, 'INVALID_SPANS', 'New exemptions must actually narrow spans');
});
