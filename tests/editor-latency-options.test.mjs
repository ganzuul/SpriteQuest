import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseAuditOptions, summarizeMotionSample, summarizeMotionSamples } from '../docs/research/artifacts/editor-latency/editor-latency-options.mjs';

test('legacy action and instrumented motion defaults remain reproducible', () => {
    const options = parseAuditOptions([]);
    assert.deepEqual(options.sizes, [25, 100, 250]);
    assert.equal(options.repeats, 7);
    assert.deepEqual(options.rates, [1, 4]);
    assert.equal(options.motionPlain, false);
    assert.equal(options.motionRepeats, 5);
    assert.equal(options.motionFrames, 45);
    assert.equal(options.motionEvents, 6);
    assert.equal(options.motionInstrumentedRepeats, 2);
    assert.equal(options.skipMotion, false);
});

test('plain gestures and profile-only runs require explicit bounded options', () => {
    const options = parseAuditOptions(['--motion-plain', '--motion-repeats=5', '--motion-frames=45', '--motion-events=6', '--skip-motion', '--sizes=25', '--repeats=20', '--rates=1', '--modes=detail-toggle']);
    assert.equal(options.motionPlain, true);
    assert.equal(options.skipMotion, true);
    assert.equal(options.motionRepeats, 5);
    assert.equal(options.repeats, 20);
    assert.deepEqual(options.modes, ['detail-toggle']);
    for (const value of ['0', '21', '1.5', 'NaN', '']) assert.throws(() => parseAuditOptions([`--motion-repeats=${value}`]), /bounded/i);
    for (const option of ['--motion-frames=1', '--motion-frames=121', '--motion-events=0', '--motion-events=13', '--sizes=', '--rates=', '--modes=unknown', '--repeats=31', '--motion-plain=false']) assert.throws(() => parseAuditOptions([option]), /bounded|unsupported/i);
});

test('frame summary exposes startup stalls and strict frame threshold counts', () => {
    const result = summarizeMotionSample({intervals: [16, 20, 25, 60], handlers: [1, 2, 4, 8]});
    assert.equal(result.frameP95Ms, 60);
    assert.equal(result.frameWorstMs, 60);
    assert.equal(result.framesOver20Ms, 2);
    assert.equal(result.framesOver25Ms, 1);
    assert.equal(result.handlerP95Ms, 8);
    assert.equal(result.handlerWorstMs, 8);
});

test('instrumented outliers never contaminate plain gesture aggregates or fixture groups', () => {
    const rows = [
        {size: 25, rate: 1, mode: 'drag', detailed: false, repeat: 0, intervals: [16, 18], handlers: [1], downMs: 2, thresholdSyncMs: 3, thresholdSettledMs: 19, releaseSyncMs: 4, releaseSettledMs: 20},
        {size: 25, rate: 1, mode: 'drag', detailed: false, repeat: 1, intervals: [17, 24], handlers: [2], downMs: 4, thresholdSyncMs: 5, thresholdSettledMs: 21, releaseSyncMs: 6, releaseSettledMs: 22},
        {size: 25, rate: 1, mode: 'drag', detailed: true, repeat: 0, intervals: [1000], handlers: [900], downMs: 800, thresholdSyncMs: 700, releaseSyncMs: 600, releaseSettledMs: 500},
        {size: 100, rate: 1, mode: 'drag', detailed: false, repeat: 0, intervals: [40], handlers: [9], downMs: 8, releaseSyncMs: 7, releaseSettledMs: 6},
    ];
    const summary = summarizeMotionSamples(rows);
    assert.equal(summary.length, 3);
    const plain = summary.find(row => row.size === 25 && row.sampling === 'plain');
    assert.equal(plain.repeats, 2);
    assert.equal(plain.frameP95Ms, 24);
    assert.equal(plain.frameWorstMs, 24);
    assert.equal(plain.framesOver20Ms, 1);
    assert.equal(plain.downWorstMs, 4);
    assert.equal(plain.thresholdSyncWorstMs, 5);
    assert.equal(plain.releaseSettledWorstMs, 22);
    assert.equal(summary.find(row => row.sampling === 'instrumented').frameWorstMs, 1000);
});


test('release acceptance can target bounded drag samples without unrelated gestures',()=>{
 assert.deepEqual(parseAuditOptions([]).motionModes,['drag','pan','zoom','wire-preview']);
 assert.deepEqual(parseAuditOptions(['--motion-modes=drag','--motion-repeats=20']).motionModes,['drag']);
 for(const value of ['', 'unknown', 'drag,drag'])assert.throws(()=>parseAuditOptions(['--motion-modes='+value]),/unsupported/i);
});
