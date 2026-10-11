import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { getNodeGuideExample } from '../src/workflow/node-guide-examples.js';

const fixtures = await import('../src/workflow/node-guide-fixtures.js').catch(() => ({}));
const expected = [
    ['read-file', 'lesson-16', ['campaign-notebook.txt']],
    ['write-file', 'lesson-17', ['accepted-scene-journal.json']],
    ['current-holder', 'lesson-20', ['accepted-item-holders.json']],
    ['prompted-memory', 'lesson-22', ['accepted-item-holders.json', 'rowan-item-memories.json']],
    ['story-clock', 'lesson-23', ['story-clock.json']],
    ['time-trigger', 'lesson-24', ['story-clock.json']],
    ['state', 'lesson-25', ['player-progression.json']],
    ['recall', 'lesson-26', ['rowan-moments.json']],
    ['effect-author', 'lesson-27', ['wand-holders.json', 'wand-effects.json', 'wand-outcomes.json']],
    ['stage-outcome', 'lesson-27', ['wand-holders.json', 'wand-effects.json', 'wand-outcomes.json']],
    ['actor-context', 'lesson-29', ['iris-moments.json']],
];

test('guide setup embeds exactly the shipped fixture bytes needed by its selected lesson', async () => {
    assert.equal(typeof fixtures.getNodeGuideFixtures, 'function');
    for (const [key, lessonId, names] of expected) {
        const example = getNodeGuideExample(key);
        assert.equal(example.id, lessonId);
        assert.deepEqual(example.fixtures?.map(fixture => fixture.name), names, key);
        assert.deepEqual(example.fixtures, fixtures.getNodeGuideFixtures(lessonId), key);
        for (const fixture of example.fixtures) {
            assert.match(fixture.name, /\.(?:txt|json)$/);
            assert.equal(fixture.content, await readFile(new URL(`../examples/remastered/fixtures/${fixture.name}`, import.meta.url), 'utf8'), `${key}: ${fixture.name}`);
            if (fixture.name.endsWith('.json')) JSON.parse(fixture.content);
        }
    }
});

test('fixture results are detached and omit unrelated setup or fabricated native memory', () => {
    assert.equal(typeof fixtures.getNodeGuideFixtures, 'function');
    const copy = fixtures.getNodeGuideFixtures('lesson-27'); copy[0].content = 'changed'; copy.push({ name: 'extra.json', content: '{}' });
    assert.equal(fixtures.getNodeGuideFixtures('lesson-27').length, 3);
    assert.notEqual(fixtures.getNodeGuideFixtures('lesson-27')[0].content, 'changed');
    const example = getNodeGuideExample('story-clock'); example.fixtures[0].content = 'changed';
    assert.notEqual(getNodeGuideExample('story-clock').fixtures[0].content, 'changed');
    assert.deepEqual(fixtures.getNodeGuideFixtures('unknown'), []);
    assert.equal(getNodeGuideExample('compose').fixtures, undefined);
    assert.equal(getNodeGuideExample('file-input').fixtures, undefined, 'The imported lore snapshot is already in the graph.');
    const memory = getNodeGuideExample('memory');
    assert.equal(memory.fixtures, undefined);
    assert.ok(memory.requirements.some(text => /accepted native episode/.test(text)));
    const reflection = getNodeGuideExample('actor-context');
    assert.ok(reflection.requirements.some(text => /as \[\]/.test(text)), 'The reflection targets must start empty, without importing the populated Recall fixture.');
    assert.equal(reflection.fixtures.some(f => f.name === 'rowan-moments.json'), false);
});

test('event examples name auxiliary Extract and helper model connections required before running', () => {
    const itemUse = getNodeGuideExample('item-use-trigger');
    const itemCheck = itemUse.requirements.find(text => text.startsWith('Check these auxiliary model connections'));
    assert.ok(itemCheck, 'Item Use Trigger Extract mode needs its auxiliary connection in addition to native generation.');
    assert.match(itemCheck, /Item Use Trigger/);
    assert.match(itemCheck, /Decision.*helper role/);
    const wand = getNodeGuideExample('effect-author');
    const wandCheck = wand.requirements.find(text => text.startsWith('Check these auxiliary model connections'));
    assert.ok(wandCheck);
    for (const operation of ['Item Use Trigger', 'Effect Author', 'Decision', 'Revise Draft']) assert.ok(wandCheck.includes(operation), operation);
    assert.equal(wandCheck.includes('For Each ·'), false, 'For Each forwards requests through bound helper roles; it is not itself an auxiliary model operation.');
    assert.equal(getNodeGuideExample('compose').requirements.some(text => text.startsWith('Check these auxiliary model connections')), false);
});
