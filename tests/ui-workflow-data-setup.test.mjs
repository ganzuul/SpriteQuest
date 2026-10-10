import test from 'node:test';
import assert from 'node:assert/strict';
import { createChatDocumentCatalog } from '../src/workflow/document-catalog.js';
import { createWorkflowDataSetup, projectWorkflowData } from '../src/ui/workflow-data-setup.js';

function fixture() {
    let context = { chatId: 'chat', chat: [], chatMetadata: {} }, userId = 'user';
    const catalog = createChatDocumentCatalog({ getContext: () => context, getUserId: () => userId, saveMetadata: async () => true });
    const setup = createWorkflowDataSetup(catalog, { getStored: (scope, id) => context.chatMetadata.latticeDocuments?.[scope.userId]?.[id] });
    return { catalog, setup, context, switchChat() { context = { chatId: 'other', chat: [], chatMetadata: {} }; }, switchUser() { userId = 'other'; } };
}
const clock = (id, minute = 0) => ({ targetId: id, name: 'Travel clock', format: 'json', visibility: { kind: 'public' }, content: JSON.stringify({ schemaVersion: 1, clockId: id, calendarId: 'story-calendar', dayLengthMinutes: 1440, absoluteMinute: minute, revision: 1, unit: 'minute', originMinute: 0, originDay: 1, timeEvidence: { kind: 'explicit' } }) });

test('unconfigured clock shows the automatic initial values without needing a chat', () => {
    const view = projectWorkflowData({ operation: 'story-clock' }, { available: false, key: '', documents: [] });
    assert.equal(view.targetId, 'lattice-default-clock');
    assert.equal(view.name, 'Chat clock');
    assert.equal(view.sources.length, 1);
    assert.equal(view.available, false);
    assert.equal(JSON.parse(view.definition.content).absoluteMinute, 0);
});

test('unrelated panel refreshes retain the settings capture, while catalog changes expire it', () => {
    const { catalog, setup } = fixture();
    const first = setup.snapshot();
    assert.equal(setup.snapshot().key, first.key);
    catalog.define(clock('travel'));
    const second = setup.snapshot();
    assert.notEqual(second.key, first.key);
    assert.equal(setup.checkBinding(first.key, 'story-clock', 'travel').ok, false);
    assert.equal(setup.checkBinding(second.key, 'story-clock', 'travel').ok, true);
});

test('clock sources include valid clocks, never unrelated JSON; initial templates load explicitly', () => {
    const { catalog, setup } = fixture();
    assert.equal(catalog.define(clock('travel')).ok, true);
    assert.equal(catalog.define({ targetId: 'items', name: 'Items', format: 'json', content: '[]', visibility: { kind: 'hidden' } }).ok, true);
    const snapshot = setup.snapshot();
    const view = projectWorkflowData({ operation: 'story-clock', clockId: 'travel' }, snapshot);
    assert.deepEqual(view.sources.map(source => source.value), ['lattice-default-clock', 'travel']);
    assert.equal(view.definition, undefined);
    assert.equal(setup.load(view.key, 'story-clock', 'travel').data.definition.content, clock('travel').content);
    assert.equal(setup.checkBinding(view.key, 'story-clock', 'items').ok, false);
    assert.equal(projectWorkflowData({ operation: 'read-file' }, snapshot).sources.length, 3, 'Read File can read every supported document format');
});

test('ordinary logical IDs matching object methods still require explicit template loading', () => {
    const { catalog, setup } = fixture();
    catalog.define(clock('toString'));
    const snapshot = setup.snapshot();
    assert.equal(projectWorkflowData({ operation: 'story-clock', clockId: 'toString' }, snapshot).definition, undefined);
    assert.equal(setup.load(snapshot.key, 'story-clock', 'toString').ok, true);
    assert.equal(projectWorkflowData({ operation: 'story-clock', clockId: 'toString' }, setup.snapshot()).definition.targetId, 'toString');
});

test('optional outcome storage can be disabled again after binding a Random Pick node', () => {
    const { setup } = fixture();
    const snapshot = setup.snapshot();
    const view = projectWorkflowData({ operation: 'random-pick', ledgerId: 'lattice-default-outcomes' }, snapshot);
    assert.ok(view.sources.some(source => source.value === '' && source.label === 'Disabled'));
    assert.equal(setup.checkBinding(view.key, 'random-pick', '').ok, true);
    assert.equal(projectWorkflowData({ operation: 'random-pick', ledgerId: '' }, snapshot), null);
});

test('changing clock initial values preserves canonical time and visibility is explicit', async () => {
    const { catalog, setup, context } = fixture();
    catalog.define(clock('travel'));
    context.chatMetadata.latticeDocuments = { user: { travel: { ...clock('travel', 4321), scope: { userId: 'user', chatId: 'chat' }, revision: 7, receipts: [] } } };
    const canonical = structuredClone(context.chatMetadata.latticeDocuments);
    const { key } = setup.snapshot();
    const definition = { ...clock('travel', 90), visibility: { kind: 'actor-private', actorId: 'actor-one' } };
    const result = await setup.save(key, 'story-clock', 'travel', definition);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.deepEqual(context.chatMetadata.latticeDocuments, canonical);
    assert.deepEqual(catalog.definition('travel').data.visibility, definition.visibility);
    assert.equal(setup.load(key, 'story-clock', 'travel').ok, false, 'Catalog mutation expires previous UI capture');
});

test('privacy can change without loading the initial template, preserving both initial and saved values', async () => {
    const { catalog, setup, context } = fixture();
    catalog.define(clock('travel', 120));
    context.chatMetadata.latticeDocuments = { user: { travel: { ...clock('travel', 4321), scope: { userId: 'user', chatId: 'chat' }, revision: 7, receipts: [] } } };
    const canonical = structuredClone(context.chatMetadata.latticeDocuments);
    const { key } = setup.snapshot();
    const result = await setup.saveVisibility(key, 'story-clock', 'travel', { kind: 'hidden' });
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(catalog.definition('travel').data.content, clock('travel', 120).content);
    assert.deepEqual(catalog.definition('travel').data.visibility, { kind: 'hidden' });
    assert.deepEqual(context.chatMetadata.latticeDocuments, canonical);
});

test('an authored template and its save notice survive the verified catalog refresh', async () => {
    const { catalog, setup, switchChat } = fixture();
    catalog.define(clock('travel'));
    const first = setup.snapshot();
    const authored = clock('travel', 3270);
    assert.equal((await setup.save(first.key, 'story-clock', 'travel', authored)).ok, true);
    const updated = setup.snapshot();
    assert.notEqual(updated.key, first.key);
    const panel = projectWorkflowData({ operation: 'story-clock', clockId: 'travel' }, updated);
    assert.equal(panel.definition.content, authored.content);
    assert.match(panel.notice, /saved and verified/);
    catalog.define(clock('travel', 1));
    assert.equal(projectWorkflowData({ operation: 'story-clock', clockId: 'travel' }, setup.snapshot()).definition, undefined, 'An external template replacement requires explicit loading');
    switchChat();
    assert.equal(projectWorkflowData({ operation: 'story-clock', clockId: 'travel' }, setup.snapshot()).notice, undefined, 'Notice and known data never follow another chat');
});

test('visibility-only save notices never expose an unloaded private initial template', async () => {
    const { catalog, setup } = fixture();
    catalog.define({ targetId: 'private-notes', name: 'Notes', format: 'text', content: 'UNLOADED INITIAL SECRET', visibility: { kind: 'actor-private', actorId: 'actor' } });
    const first = setup.snapshot();
    assert.equal((await setup.saveVisibility(first.key, 'read-file', 'private-notes', { kind: 'hidden' })).ok, true);
    const updated = setup.snapshot();
    assert.deepEqual(Object.keys(updated.definitions), []);
    assert.deepEqual(Object.keys(updated.notice).sort(), ['message', 'targetId']);
    assert.equal(JSON.stringify(updated).includes('UNLOADED INITIAL SECRET'), false);
});

test('stale user/chat captures cannot create, bind or update data', async () => {
    for (const switchScope of ['switchChat', 'switchUser']) {
        const f = fixture();
        const { key } = f.setup.snapshot();
        f[switchScope]();
        assert.equal(f.setup.checkBinding(key, 'story-clock', 'lattice-default-clock').ok, false);
        assert.equal((await f.setup.create(key, 'story-clock', { name: 'Travel clock' })).ok, false);
        assert.equal((await f.setup.save(key, 'story-clock', 'lattice-default-clock', clock('lattice-default-clock'))).ok, false);
        assert.equal(f.catalog.snapshot().data.documents.length, 0);
    }
});

test('separate clocks receive unique IDs, explicit initial values, and no shared state', async () => {
    const { setup, catalog } = fixture();
    const first = await setup.create(setup.snapshot().key, 'story-clock', { name: 'Travel clock', calendarId: 'journey', absoluteMinute: 120, dayLengthMinutes: 720 });
    const second = await setup.create(setup.snapshot().key, 'story-clock', { name: 'Battle clock' });
    assert.equal(first.ok, true, JSON.stringify(first));
    assert.equal(second.ok, true, JSON.stringify(second));
    assert.notEqual(first.data.definition.targetId, second.data.definition.targetId);
    const values = JSON.parse(catalog.definition(first.data.definition.targetId).data.content);
    assert.equal(values.clockId, first.data.definition.targetId);
    assert.equal(values.absoluteMinute, 120);
    assert.equal(values.dayLengthMinutes, 720);
    assert.equal(JSON.parse(second.data.definition.content).absoluteMinute, 0);
});

test('incompatible clocks and mismatched destinations are rejected before metadata changes', async () => {
    const { setup, context } = fixture();
    const { key } = setup.snapshot();
    const wrong = clock('wrong');
    assert.equal((await setup.save(key, 'story-clock', 'lattice-default-clock', wrong)).ok, false);
    assert.equal((await setup.save(key, 'story-clock', 'lattice-default-clock', { ...wrong, targetId: 'lattice-default-clock' })).ok, false);
    assert.equal(context.chatMetadata.latticeDocumentCatalog, undefined);
});
