/**
 * Tests for the SDD/ICS commit message validator.
 *
 * The validator checks artifact shape and contract freshness. It cannot check
 * comprehension, so neither do these tests: they pin the rules a machine can
 * decide, and the error a human or agent sees when a rule fails.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateMessage, gitBlobHash } from '../tools/check-commit-message.mjs';

const CONTRACT_PATH = 'docs/api/example-contract.md';
const CONTRACT_TEXT = [
    '# Example contract',
    '',
    '| Item | Requirement | Status |',
    '| --- | --- | --- |',
    '| C1 | A job has steps. | m |',
    '| C2 | Steps may fail. | m |',
    '',
].join('\n');
const REVISION = gitBlobHash(CONTRACT_TEXT).slice(0, 12);

const options = {
    root: '/repo',
    contractExists: (path) => path === CONTRACT_PATH,
    readContract: (path) => {
        if (path !== CONTRACT_PATH) throw new Error(`unexpected contract ${path}`);
        return CONTRACT_TEXT;
    },
};

const FULL = `feat(asset-jobs): deliver the contracted job model

Asset stages live in one script, so none can be scheduled on its own.

Contract: ${CONTRACT_PATH}
Contract revision: ${REVISION}
Tier: exploratory

Conformance
Y  C1  steps are portable
N  C2  failure does not propagate

Deviations
- C2: dependents stay pending — propagation was unspecified

Verification
- npm run test:asset-jobs: pass
`;

const NONE = `fix(comfy): correct the depth axis

Contract: none
Tier: exploratory

Verification
- python3 companion/test_image_to_3d.py: pass
`;

describe('commit message validator', () => {
    test('accepts a filled form with a cited contract', () => {
        const result = validateMessage(FULL, options);
        assert.deepEqual(result.errors, []);
        assert.equal(result.ok, true);
    });

    test('accepts a change with no contract', () => {
        const result = validateMessage(NONE, options);
        assert.deepEqual(result.errors, []);
        assert.equal(result.ok, true);
    });

    test('skips merge, revert and fixup messages', () => {
        for (const subject of ['Merge branch \'main\' into work', 'Revert "feat: x"', 'fixup! feat: x']) {
            const result = validateMessage(`${subject}\n`);
            assert.equal(result.ok, true, subject);
            assert.ok(result.skipped, subject);
        }
    });

    test('rejects an unfilled form', () => {
        const template = [
            '<type>(<scope>): <act> <object>',
            '',
            '<The constraint this commit responds to.>',
            '',
            'Contract: <path or "none">',
        ].join('\n');
        const result = validateMessage(template, options);
        assert.equal(result.ok, false);
        assert.match(result.errors.join('\n'), /not filled in/);
    });

    test('rejects a non-conventional subject', () => {
        const result = validateMessage(FULL.replace('feat(asset-jobs): deliver the contracted job model', 'did some work'), options);
        assert.equal(result.ok, false);
        assert.match(result.errors.join('\n'), /Subject must read/);
    });

    test('rejects an unknown type', () => {
        const result = validateMessage(FULL.replace('feat(asset-jobs)', 'yolo(asset-jobs)'), options);
        assert.match(result.errors.join('\n'), /Unknown type/);
    });

    test('rejects a subject over 72 characters', () => {
        const longSubject = `feat(asset-jobs): ${'x'.repeat(60)}`;
        const result = validateMessage(FULL.replace(/^feat.*$/m, longSubject), options);
        assert.match(result.errors.join('\n'), /limit is 72/);
    });

    test('requires a tier', () => {
        const result = validateMessage(FULL.replace(/^Tier:.*$/m, ''), options);
        assert.match(result.errors.join('\n'), /Tier/);
    });

    test('rejects an unknown tier', () => {
        const result = validateMessage(FULL.replace('Tier: exploratory', 'Tier: prototype'), options);
        assert.match(result.errors.join('\n'), /exploratory or normative/);
    });

    test('ignores trailing punctuation after the tier', () => {
        const result = validateMessage(FULL.replace('Tier: exploratory', 'Tier: exploratory. The contract governs the port.'), options);
        assert.deepEqual(result.errors, []);
    });

    test('requires a contract field', () => {
        const result = validateMessage(FULL.replace(/^Contract:.*$/m, ''), options);
        assert.match(result.errors.join('\n'), /Contract:/);
    });

    test('reports a missing contract file', () => {
        const result = validateMessage(FULL.replace(CONTRACT_PATH, 'docs/api/nope.md'), options);
        assert.match(result.errors.join('\n'), /does not exist/);
    });

    test('requires a contract revision', () => {
        const result = validateMessage(FULL.replace(/^Contract revision:.*$/m, ''), options);
        assert.match(result.errors.join('\n'), /Contract revision/);
        assert.match(result.errors.join('\n'), /git hash-object/);
    });

    test('rejects a stale contract revision', () => {
        const result = validateMessage(FULL.replace(REVISION, 'deadbeefcafe'), options);
        assert.match(result.errors.join('\n'), /stale/);
    });

    test('requires a conformance section when a contract is cited', () => {
        const withoutConformance = FULL.replace(/Conformance\n[\s\S]*?\nDeviations/, 'Deviations');
        const result = validateMessage(withoutConformance, options);
        assert.match(result.errors.join('\n'), /Conformance/);
    });

    test('reads item ids before the explanatory note', () => {
        const noted = FULL.replace('N  C2  failure does not propagate', 'N  C2: failure does not propagate');
        const result = validateMessage(noted.replace(/^- C2:.*$/m, ''), options);
        assert.match(result.errors.join('\n'), /Item C2 is "N"/);
    });

    test('requires a deviation for every N', () => {
        const result = validateMessage(FULL.replace(/^- C2:.*$/m, ''), options);
        assert.match(result.errors.join('\n'), /Item C2 is "N"/);
    });

    test('accepts N when the deviation names the item', () => {
        const result = validateMessage(FULL, options);
        assert.equal(result.ok, true);
    });

    test('requires a verification section', () => {
        const result = validateMessage(FULL.replace(/Verification\n[\s\S]*$/, ''), options);
        assert.match(result.errors.join('\n'), /Verification/);
    });

    test('ignores comment lines left by the template', () => {
        const commented = `# guidance\n${FULL}\n# trailing guidance\n`;
        const result = validateMessage(commented, options);
        assert.equal(result.ok, true);
    });

    test('judges a message against the contract as it was at commit time', () => {
        const oldText = CONTRACT_TEXT;
        const newText = `${CONTRACT_TEXT}| C9 | Added later. | m |\n`;
        const oldRevision = gitBlobHash(oldText).slice(0, 12);
        const message = FULL.replace(REVISION, oldRevision);
        const atCommit = validateMessage(message, {
            root: '/repo',
            contractExists: () => true,
            readContract: () => oldText,
        });
        assert.equal(atCommit.ok, true);
        const againstToday = validateMessage(message, {
            root: '/repo',
            contractExists: () => true,
            readContract: () => newText,
        });
        assert.match(againstToday.errors.join('\n'), /stale/);
    });

    test('every failure points at the form', () => {
        const result = validateMessage('nonsense', options);
        assert.equal(result.ok, false);
        assert.match(result.errors.at(-1), /commit-template\.md/);
    });

    test('computes git blob hashes', () => {
        const expected = createHash('sha1').update('blob 5\0hello').digest('hex');
        assert.equal(gitBlobHash('hello'), expected);
    });
});
