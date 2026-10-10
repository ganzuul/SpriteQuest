import assert from 'node:assert/strict';
import { test } from 'node:test';
import { installWorkflowExample } from '../src/workflow/examples.js';
import { unifiedRecipeHost } from './helpers/unified-recipe-host.mjs';
const actor = 'character:rowan.png';
const first = 'Rowan repairs the lighthouse beacon.';
const second = 'Rowan rescues Iris from the flooded pier.';
const body = first + ' ' + second;
const initial = { values: [{ key: 'experience', value: 260 }], ledger: [] };
const response = value => ({ ok: true, data: { text: JSON.stringify(value), finish: 'stop' } });
const content = f => JSON.parse(f.c.chatMetadata.latticeDocuments?.['default-user']?.['player-progression']?.content ?? f.catalog.definition('player-progression').data.content);
for (const accept of [true, false])
    test(`lesson 25 sees the final 260 to 300 threshold after two objectives and ${accept ? 'accepts' : 'rejects'} the projection`, async () => {
        const installed = installWorkflowExample('lesson-25', { graphs: {} });
        assert.equal(installed.ok, true, JSON.stringify(installed.error));
        const f = unifiedRecipeHost(installed.data.graph, { configureContext: c => {
                c.characters = [{ avatar: 'rowan.png', data: { name: 'Rowan' } }, { avatar: 'iris.png', data: { name: 'Iris' } }];
            }, documents: [{
                    targetId: 'player-progression', name: 'player-progression', format: 'json', content: JSON.stringify(initial), visibility: { kind: 'public' }
                }], request: async (options) => {
                if (options.messages[0].content.startsWith('Evaluate'))
                    return response({ answers: { actual: { type: 'noul', accepted: true } } });
                const source = JSON.parse(options.messages[1].content).data;
                assert.equal(source.text, body, 'Extraction receives unchanged owned native evidence');
                return response([{
                        eventType: 'scene-action', actorId: actor, position: { start: 0, end: first.length }, semantics: 'actual'
                    }, {
                        eventType: 'scene-action', actorId: actor, position: { start: first.length + 1, end: body.length }, semantics: 'actual'
                    }]);
            } });
        try {
            const result = await f.generate(body);
            assert.equal(result.ok, true, JSON.stringify(result.error));
            assert.equal(f.calls(), 3, 'One extraction and two bounded confirmations');
            assert.equal(f.saves(), 0);
            const thresholds = result.recording.artifacts.map(a => a.value?.value).find(v => Array.isArray(v?.crossings));
            assert.ok(thresholds, 'Threshold artifact is available');
            assert.deepEqual(thresholds.crossings.map(c => c.threshold), [300]);
            assert.equal(thresholds.beforeBand, 1);
            assert.equal(thresholds.afterBand, 2);
            const candidate = result.recording.artifacts.find(a => a.kind === 'candidate').value;
            assert.ok(candidate.text.startsWith(body));
            assert.match(candidate.text, /300/, 'Review contains the final threshold checkpoint');
            if (accept) {
                assert.equal((await f.controller.apply(result.reviewHandles[0])).ok, true);
                const state = content(f);
                assert.equal(state.values[0].value, 300);
                assert.equal(state.ledger.length, 2);
                assert.equal(f.saves(), 1);
                assert.equal((await f.controller.apply(result.reviewHandles[0])).ok, true);
                assert.equal(f.saves(), 1, 'Repeated Apply cannot settle awards twice');
            }
            else {
                assert.equal(f.controller.reject(result.reviewHandles[0]).ok, true);
                assert.deepEqual(content(f), initial);
                assert.equal(f.saves(), 0);
            }
        }
        finally {
            f.controller.dispose();
        }
    });
