import assert from 'node:assert/strict';
import { scanDraft, validatePatches } from '../src/workflow/repair.js';

const draft = text => ({ kind: 'draft', text, source: { originalText: text, token: 'original-source' } });

// Removing this upstream permission intersection would make a rescan authorize text.
{
    const input = { ...draft('cold'), spans: [] };
    const result = scanDraft(input, { scope: 'whole', rules: ['cold'] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.spans, []);
    assert.deepEqual(input.spans, []);
}

console.log('workflow-permission-scans: empty permissions passed');

// Replacing upstream pins or exemptions would grant either immutable literal.
{
    const text = 'cold heart; cold hands; cold feet';
    const input = { ...draft(text), spans: [{ index: 0, start: 0, end: 10, text: 'cold heart' }, { index: 1, start: 24, end: 33, text: 'cold feet' }], protectedLiterals: ['cold heart'], exemptions: ['cold hands'] };
    const result = scanDraft(input, { scope: 'whole', rules: ['cold'], protectedLiterals: ['cold feet'], exemptions: ['absent'] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.spans, []);
    assert.deepEqual(result.artifact.protectedLiterals, ['cold heart', 'cold feet']);
    assert.deepEqual(result.artifact.exemptions, ['cold hands', 'absent']);
    assert.equal(result.artifact.findings[0].protected, true);
}

console.log('workflow-permission-scans: upstream pins and exemptions passed');

// A whole rescan must keep the source's narrower narration authority.
{
    const input = { ...draft('cold "cold"'), scope: 'narration', spans: [{ index: 0, start: 0, end: 4, text: 'cold' }] };
    const result = scanDraft(input, { scope: 'whole', rules: ['cold'] });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.scope, 'narration');
    assert.deepEqual(result.artifact.spans, input.spans);
}

console.log('workflow-permission-scans: source scope preserved');

// Changing the default to whole would silently construct raw permissions again.
{
    const result = scanDraft(draft('cold'), { rules: ['cold'] });
    assert.equal(result.error?.code, 'SCOPE_REQUIRED');
    const authorized = scanDraft({ ...draft('cold'), spans: [{ index: 0, start: 0, end: 4, text: 'cold' }] }, { rules: ['cold'] });
    assert.equal(authorized.ok, true);
    assert.deepEqual(authorized.artifact.spans, [{ index: 0, start: 0, end: 4, text: 'cold' }]);
}

console.log('workflow-permission-scans: raw scope is explicit');

// An explicitly malformed permission field is not the same as an unannotated raw Draft.
for (const metadata of [{ spans: undefined }, { spans: null }, { spans: Array(1) }, { protectedLiterals: null }, { exemptions: null }]) {
    const result = scanDraft({ ...draft('cold'), ...metadata }, { scope: 'whole', rules: ['cold'] });
    assert.equal(result.ok, false);
    assert.ok(['INVALID_DRAFT', 'INVALID_SPANS'].includes(result.error.code));
}

console.log('workflow-permission-scans: malformed upstream permissions fail');

// Preserving upstream findings must not let a second scan exceed the authority bound.
{
    const input = { ...draft('cold'), findings: Array.from({ length: 4096 }, () => ({ code: 'UPSTREAM' })) };
    const result = scanDraft(input, { scope: 'whole', rules: ['cold'] });
    assert.equal(result.error?.code, 'SCAN_LIMIT');
}

console.log('workflow-permission-scans: cumulative findings are bounded');

// The conservative unmatched-quote path must retain the same accumulated protections.
{
    const input = { ...draft('cold "cold'), protectedLiterals: ['cold'], exemptions: ['warm'] };
    const result = scanDraft(input, { scope: 'narration', rules: ['cold'], protectedLiterals: ['new pin'], exemptions: ['new exemption'] });
    assert.equal(result.ok, true);
    assert.deepEqual(result.artifact.spans, []);
    assert.deepEqual(result.artifact.protectedLiterals, ['cold', 'new pin']);
    assert.deepEqual(result.artifact.exemptions, ['warm', 'new exemption']);
}

console.log('workflow-permission-scans: unmatched quotes retain protections');

// Rule matching may change case policy without changing upstream exemption authority.
for (const rule of ['FOO', 'foo']) {
    const input = { ...draft('FOO'), spans: [{ index: 0, start: 0, end: 3, text: 'FOO' }], exemptions: ['foo'], caseSensitive: true };
    const before = structuredClone(input);
    const result = scanDraft(input, { scope: 'whole', rules: [rule], caseSensitive: false });
    assert.equal(result.ok, true);
    const candidate = validatePatches({ kind: 'patches', draft: result.artifact, patches: [{ index: 0, replacement: 'BAR' }] });
    assert.equal(candidate.ok, true, JSON.stringify(candidate.error));
    assert.equal(candidate.artifact.text, 'BAR');
    assert.equal(result.artifact.caseSensitive, true);
    assert.deepEqual(result.artifact.exemptions, ['foo']);
    assert.deepEqual(result.artifact.spans, input.spans);
    assert.deepEqual(input, before);
}

console.log('workflow-permission-scans: upstream exemption case policy survives rescans');

// Mixed new exemptions must also produce permissions valid under the retained stored policy.
{
    const input = { ...draft('FOO'), spans: [{ index: 0, start: 0, end: 3, text: 'FOO' }], exemptions: ['bar'], caseSensitive: false };
    const result = scanDraft(input, { scope: 'whole', rules: ['FOO'], exemptions: ['foo'], caseSensitive: true });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.caseSensitive, false);
    assert.deepEqual(result.artifact.exemptions, ['bar', 'foo']);
    assert.deepEqual(result.artifact.spans, []);
    assert.equal(validatePatches({ kind: 'patches', draft: result.artifact, patches: [] }).ok, true);
}

console.log('workflow-permission-scans: mixed exemption policies narrow consistently');

// A new insensitive exemption still narrows even when the stored upstream policy is sensitive.
{
    const input = { ...draft('FOO'), spans: [{ index: 0, start: 0, end: 3, text: 'FOO' }], exemptions: ['bar'], caseSensitive: true };
    const result = scanDraft(input, { scope: 'whole', rules: ['foo'], exemptions: ['foo'], caseSensitive: false });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.caseSensitive, true);
    assert.deepEqual(result.artifact.exemptions, ['bar', 'foo']);
    assert.deepEqual(result.artifact.spans, []);
    assert.equal(validatePatches({ kind: 'patches', draft: result.artifact, patches: [] }).ok, true);
}

// Conservative quote handling must also keep the original exemption flag.
{
    const text = 'FOO "bar';
    const input = { ...draft(text), scope: 'whole', spans: [{ index: 0, start: 0, end: text.length, text }], exemptions: ['foo'], caseSensitive: true };
    const result = scanDraft(input, { scope: 'narration', rules: ['FOO'], caseSensitive: false });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.caseSensitive, true);
    assert.deepEqual(result.artifact.spans, []);
    assert.equal(validatePatches({ kind: 'patches', draft: result.artifact, patches: [] }).ok, true);
}

console.log('workflow-permission-scans: new exemptions and quote paths preserve case authority');
