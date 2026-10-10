/** Portable demonstration data. Importing these bytes grants no host, private, event or settlement authority. */
const rowan = 'character:rowan.png', iris = 'character:iris.png';
const directed = (dimension, value) => ({
    key: 'rowan-toward-iris-' + dimension, value, subjectId: rowan, objectId: iris, visibility: { kind: 'actor-private', actorId: rowan }
});
export const FIXTURES = {
    'harbor-lore.json': { location: 'North Harbor', constraint: 'The lighthouse is dark.', unrelated: 'A distant kingdom holds a festival.' },
    'accepted-scene-journal.json': [],
    'accepted-item-holders.json': { 'signal-lantern': rowan },
    'rowan-item-memories.json': [],
    'rowan-moments.json': [{
            id: 'lighthouse-promise', revision: 'r1', actorId: rowan, text: 'Rowan remembers promising to return to the lighthouse.', tags: ['lighthouse']
        }],
    'iris-moments.json': [],
    'story-clock.json': {
        schemaVersion: 1, clockId: 'story-clock', calendarId: 'campaign-days', revision: 1, absoluteMinute: 780, dayLengthMinutes: 1440, settledTimeEventIds: []
    },
    'player-progression.json': { values: [{ key: 'experience', value: 80 }], ledger: [] },
    'wand-holders.json': { 'broken-wand': rowan },
    'wand-outcomes.json': [],
    'wand-effects.json': {
        libraryId: 'wand-effects', revision: 'r1', itemId: 'broken-wand', effects: [{
                id: 'sparks', kind: 'fixed', weight: 80, description: 'Blue sparks replace the spell.'
            }, { id: 'wild', kind: 'generate', weight: 20 }]
    },
    'sword-souls-99.json': Array.from({ length: 99 }, (_, i) => ({
        id: 'demonstration-victim-' + String(i + 1).padStart(3, '0'), eventId: 'demonstration-kill-' + (i + 1), attackerId: rowan, victimId: 'demonstration-victim-' + (i + 1), quote: 'Disposable seed ledger entry; this is not live story evidence.', source: { sourceId: 'demonstration-fixture', revision: 'r1' }
    })),
    'rowan-relationship.json': { values: [directed('trust', 0), directed('desire', 0), directed('tension', 2), directed('excitement', 0)], ledger: [] },
};
export const TEXT_FIXTURES = {
    'campaign-notebook.txt': 'North Harbor: the lighthouse is dark. The player has not chosen what to investigate next.\n',
    'wand-effects.txt': '# Same explicit library identity settings as the JSON exercise\n80 | Blue sparks replace the spell.\n20 | @generate:wild\n',
};
