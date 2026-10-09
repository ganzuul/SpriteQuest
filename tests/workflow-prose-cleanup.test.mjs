import assert from 'node:assert/strict';
import { snapshotReply } from '../src/workflow/host.js';
const { cleanupDraft, CLEANUP_MODES, validateCleanupSettings } = await import('../src/workflow/operations/prose-cleanup.js');
const draft = text => ({ kind: 'draft', text, source: { originalText: text, token: { profile: 'private' } }, spans: [{ index: 0, start: 0, end: text.length, text }] });
const inspected = await cleanupDraft(draft('The tension was palpable.'), { mode: 'inspect', scope: 'whole' }, { request() { throw new Error('Inspect must not request prose'); }, countTokens() { throw new Error('Inspect must not tokenize'); } });
assert.equal(inspected.ok, true);
assert.equal(inspected.data.artifact.kind, 'patches');
assert.deepEqual(inspected.data.artifact.patches, []);
assert.equal(inspected.data.artifact.draft.text, 'The tension was palpable.');
assert.equal(inspected.data.artifact.draft.findings[0].text, 'The tension was palpable');
assert.equal(inspected.data.artifact.draft.findings[0].start, 0);
assert.equal(inspected.data.artifact.draft.findings[0].end, 24);
assert.equal(inspected.data.report.some(record => record.code === 'SLOP_LITERAL_MATCH'), true);
assert.equal(inspected.data.report.some(record => record.code === 'SEMANTIC_ASSESSMENT_REQUIRED'), true);
assert.deepEqual(CLEANUP_MODES, ['inspect', 'contextual', 'strict']);



// Removing synchronous validation would permit malformed controls before runtime effects.
const defaults = validateCleanupSettings();
assert.equal(defaults.ok, true);
assert.deepEqual({ ...defaults.data.settings }, { mode: 'inspect', scope: 'authorized', categories: [], protectedLiterals: [], caseSensitive: false, strength: 'light', instructions: '', maxTokens: 2048 });
for (const invalid of [null, [], { mode: 'repair' }, { categories: ['missing'] }, { categories: ['generic-tension-atmosphere', 'generic-tension-atmosphere'] }, { categories: Array(1) }, { maxTokens: 0 }, { maxTokens: 65537 }, { instructions: 'x'.repeat(10001) }, { caseSensitive: 1 }, { strength: 'heavy' }, { scope: 'all' }, { protectedLiterals: Array(1) }, { protectedLiterals: [''] }, { protectedLiterals: ['x'.repeat(2049)] }, { protectedLiterals: Array(129).fill('a') }, { unknown: true }]) {
    const result = validateCleanupSettings(invalid);
    assert.equal(result.error?.code, 'INVALID_SETTINGS');
    assert.equal(Object.hasOwn(result, 'data'), false);
}
let reads = 0;
const accessor = Object.defineProperty({}, 'mode', { enumerable: true, get() { reads++; throw new Error('must not read'); } });
assert.equal(validateCleanupSettings(accessor).error?.code, 'INVALID_SETTINGS');
assert.equal(reads, 0);
const settings = { categories: ['generic-tension-atmosphere'], protectedLiterals: ['palpable'], mode: 'contextual' };
const validated = validateCleanupSettings(settings);
settings.categories[0] = 'missing'; settings.protectedLiterals[0] = 'changed';
assert.deepEqual(validated.data.settings.categories, ['generic-tension-atmosphere']);
assert.deepEqual(validated.data.settings.protectedLiterals, ['palpable']);
assert.equal(Object.isFrozen(validated.data.settings), true);

// Substring matching and punctuation normalization must keep original UTF-16 positions.
const unicodeText = "😀 inadequate éadequate adequateé adequate acceptable don't get the wrong idea Don’t get the wrong idea";
const unicode = await cleanupDraft(draft(unicodeText), { mode: 'inspect', scope: 'whole', categories: ['tsundere-defensive-deflection-slop'] });
assert.equal(unicode.ok, true);
assert.deepEqual(unicode.data.artifact.draft.findings.map(({ start, end, text }) => ({ start, end, text })), [
    { start: 34, end: 42, text: 'adequate' },
    { start: 43, end: 53, text: 'acceptable' },
    { start: 54, end: 78, text: "don't get the wrong idea" },
    { start: 79, end: 103, text: 'Don’t get the wrong idea' },
]);
const exactCase = await cleanupDraft(draft('Adequate adequate'), { mode: 'inspect', scope: 'whole', caseSensitive: true });
assert.equal(exactCase.ok, true);
assert.deepEqual(exactCase.data.artifact.draft.findings.map(record => record.start), [9]);

// Inspection must annotate protected/uneditable matches without expanding original permission spans.
const guardedText = 'adequate. "acceptable."';
const guardedDraft = { ...draft(guardedText), spans: [{ index: 0, start: 0, end: 8, text: 'adequate' }], protectedLiterals: ['acceptable.'], findings: [{ code: 'UPSTREAM', start: 0, end: 1 }] };
const guarded = await cleanupDraft(guardedDraft, { mode: 'inspect', scope: 'narration', protectedLiterals: ['adequate.'] });
assert.equal(guarded.ok, true);
assert.deepEqual(JSON.parse(JSON.stringify(guarded.data.artifact.draft.spans)), guardedDraft.spans);
assert.deepEqual(JSON.parse(JSON.stringify(guarded.data.artifact.draft.source)), guardedDraft.source);
assert.deepEqual(guarded.data.artifact.protectedLiterals, ['acceptable.', 'adequate.']);
assert.equal(guarded.data.artifact.draft.findings[0].code, 'UPSTREAM');
assert.deepEqual(guarded.data.artifact.draft.findings.slice(1).map(({ start, end, protected: pinned, editable }) => ({ start, end, pinned, editable })), [
    { start: 0, end: 8, pinned: true, editable: false },
    { start: 11, end: 21, pinned: true, editable: false },
]);
const emptyDraft = { ...draft('adequate'), spans: [] };
const empty = await cleanupDraft(emptyDraft, { mode: 'inspect', scope: 'whole' });
assert.equal(empty.ok, true);
assert.deepEqual(empty.data.artifact.draft.spans, []);
assert.equal(empty.data.artifact.draft.findings[0].editable, false);
const templateInspect = await cleanupDraft(draft('It was not X. It was Y.'), { mode: 'inspect', scope: 'whole', categories: ['false-profundity-sentence-structures', 'echoing-and-parroting'] });
assert.equal(templateInspect.ok, true);
assert.equal(templateInspect.data.artifact.draft.findings.some(finding => finding.rule.includes('X')), false);
const semantics = templateInspect.data.report.find(record => record.code === 'SEMANTIC_ASSESSMENT_REQUIRED');
assert.equal(semantics.assessment, 'not-performed');
assert.equal(semantics.policies.some(policy => policy.matchType === 'template'), true);
assert.equal(semantics.policies.some(policy => policy.matchType === 'behavior'), true);


// Rewrites must consume one bounded raw-prose request and omit source/profile metadata.
let requests = 0, tokenizations = 0, sent;
const rewriteDraft = draft('The tension was palpable. "adequate."');
rewriteDraft.source.token.secret = 'SOURCE_SECRET'; rewriteDraft.profile = { secret: 'PROFILE_SECRET' };
const rewriteContext = { kind: 'context', messages: [{ id: 'MESSAGE_ID_SECRET', role: 'user', text: 'The door had already locked.' }], profile: 'CONTEXT_PROFILE_SECRET' };
const contextual = await cleanupDraft(rewriteDraft, { mode: 'contextual', scope: 'narration', instructions: 'Keep the locked door.', strength: 'balanced', maxTokens: 1000 }, {
    binding: { profile: 'BINDING_SECRET' }, context: rewriteContext,
    async countTokens(prompt) { tokenizations++; assert.equal(typeof prompt, 'string'); return { tokens: 99 }; },
    async request(payload) { requests++; sent = payload; return { ok: true, data: { text: 'The door had locked. "adequate."', finish: 'stop', usage: { output_tokens: 7 } } }; },
});
assert.equal(contextual.ok, true);
assert.equal(requests, 1); assert.equal(tokenizations, 1);
assert.deepEqual(contextual.data.artifact.patches.map(patch => ({ ...patch })), [{ index: 0, replacement: 'The door had locked. "adequate."' }]);
assert.equal(contextual.data.artifact.finish, 'stop');
assert.equal(sent.maxTokens, 1000);
const promptPayload = JSON.parse(sent.messages[1].content);
assert.equal(promptPayload.policies.entries.length, 271);
assert.equal(promptPayload.policies.entries.filter(entry => entry.matchType === 'template').length, 17);
assert.equal(promptPayload.policies.entries.filter(entry => entry.matchType === 'behavior').length, 2);
assert.deepEqual(promptPayload.context, [{ role: 'user', text: 'The door had already locked.' }]);
assert.equal(promptPayload.controls.strength, 'balanced');
for (const secret of ['SOURCE_SECRET', 'PROFILE_SECRET', 'CONTEXT_PROFILE_SECRET', 'BINDING_SECRET', 'MESSAGE_ID_SECRET']) assert.equal(JSON.stringify(sent.messages).includes(secret), false);
assert.equal(contextual.data.report.find(record => record.code === 'PROSE_CLEANUP').requestCount, 1);

// Dropping Reply Snapshot's Context would deprive contextual policies of preceding chat.
const replySnapshot = snapshotReply({ chatId: 'INHERITED_CHAT_SECRET', characterId: 0, characters: [{ data: { name: 'Mara', scenario: 'The door is locked.' } }], chat: [
    { mes: 'The passphrase is deliberately "adequate".', is_user: true },
    { mes: 'Mara refuses to open the locked door.' },
    { mes: 'The tension was palpable. "adequate."' },
] });
assert.equal(replySnapshot.kind, 'draft');
const inheritedDraft = { ...replySnapshot, profile: 'INHERITED_PROFILE_SECRET', context: { ...replySnapshot.context, profile: 'INHERITED_CONTEXT_PROFILE_SECRET', private: 'INHERITED_PRIVATE_SECRET', messages: replySnapshot.context.messages.map(message => ({ ...message, private: 'INHERITED_MESSAGE_SECRET' })) } };
let inheritedRequests = 0, inheritedTokens = 0, inheritedSent;
const inheritedCleanup = await cleanupDraft(inheritedDraft, { mode: 'contextual', scope: 'narration' }, {
    binding: { profile: 'INHERITED_BINDING_SECRET' },
    async countTokens() { inheritedTokens++; return { tokens: 11 }; },
    async request(payload) { inheritedRequests++; inheritedSent = payload; return { ok: true, data: { text: 'Mara waits at the locked door. "adequate."', finish: 'stop' } }; },
});
assert.equal(inheritedCleanup.ok, true);
assert.deepEqual(JSON.parse(inheritedSent.messages[1].content).context, [
    { role: 'system', text: 'Mara' },
    { role: 'system', text: 'The door is locked.' },
    { role: 'user', text: 'The passphrase is deliberately "adequate".' },
    { role: 'assistant', text: 'Mara refuses to open the locked door.' },
]);
assert.equal(inheritedRequests, 1); assert.equal(inheritedTokens, 1);
for (const secret of [replySnapshot.source.token, 'INHERITED_CHAT_SECRET', 'INHERITED_PROFILE_SECRET', 'INHERITED_CONTEXT_PROFILE_SECRET', 'INHERITED_PRIVATE_SECRET', 'INHERITED_MESSAGE_SECRET', 'INHERITED_BINDING_SECRET', 'chat:0', 'character:scenario']) assert.equal(JSON.stringify(inheritedSent.messages).includes(secret), false, secret);

// An explicit Context pin replaces inherited material; an empty artifact clears it.
for (const [override, expectedContext] of [
    [{ kind: 'context', messages: [{ id: 'OVERRIDE_ID_SECRET', role: 'user', text: 'Only the deliberate passphrase matters.', source: 'OVERRIDE_SOURCE_SECRET' }], profile: 'OVERRIDE_PROFILE_SECRET' }, [{ role: 'user', text: 'Only the deliberate passphrase matters.' }]],
    [{ kind: 'context', messages: [] }, []],
]) {
    let overrideCalls = 0, overrideTokens = 0, overridePrompt;
    const overridden = await cleanupDraft(inheritedDraft, { mode: 'contextual', scope: 'narration' }, {
        context: override, binding: {},
        async countTokens() { overrideTokens++; return { tokens: 1 }; },
        async request({ messages }) { overrideCalls++; overridePrompt = JSON.parse(messages[1].content); return { ok: true, data: { text: inheritedDraft.text, finish: 'stop' } }; },
    });
    assert.equal(overridden.ok, true);
    assert.deepEqual(overridePrompt.context, expectedContext);
    assert.equal(overrideCalls, 1); assert.equal(overrideTokens, 1);
    for (const secret of ['INHERITED_CHAT_SECRET', 'INHERITED_PROFILE_SECRET', 'INHERITED_PRIVATE_SECRET', 'OVERRIDE_ID_SECRET', 'OVERRIDE_SOURCE_SECRET', 'OVERRIDE_PROFILE_SECRET']) assert.equal(JSON.stringify(overridePrompt).includes(secret), false, secret);
}
let contextGuardCalls = 0, contextGetterReads = 0;
const contextGuardPorts = { binding: {}, countTokens() { contextGuardCalls++; throw new Error('Context must validate first'); }, request() { contextGuardCalls++; throw new Error('Context must validate first'); } };
for (const invalidOverride of [undefined, null, false, { kind: 'context', messages: [{ id: 'bad', role: 'tool', text: 'unsupported' }] }]) {
    const rejectedOverride = await cleanupDraft(inheritedDraft, { mode: 'contextual', scope: 'narration' }, { ...contextGuardPorts, context: invalidOverride });
    assert.equal(rejectedOverride.error?.code, 'INVALID_CONTEXT');
    assert.equal(Object.hasOwn(rejectedOverride, 'data'), false);
}

// Inherited messages have the same shape/serialization guard and own-data bounds as pinned Context.
const inheritedContextAccessor = Object.defineProperty({ kind: 'context' }, 'messages', { enumerable: true, get() { contextGetterReads++; throw new Error('do not invoke context getter'); } });
for (const [invalidContext, expectedCode] of [
    [{ kind: 'context', messages: [{ id: 'bad', role: 'tool', text: 'unsupported' }] }, 'INVALID_CONTEXT'],
    [{ kind: 'context', messages: [{ id: 'bad', role: 'user' }] }, 'INVALID_CONTEXT'],
    [{ kind: 'context', messages: [{ id: 'large', role: 'user', text: 'x'.repeat(100000) }] }, 'INVALID_CONTEXT'],
    [{ kind: 'context', messages: Array(1) }, 'INVALID_DRAFT'],
    [inheritedContextAccessor, 'INVALID_DRAFT'],
    [{ kind: 'context', messages: [], private: 'x'.repeat(500001) }, 'INVALID_DRAFT'],
]) {
    const rejectedInherited = await cleanupDraft({ ...draft('adequate'), context: invalidContext }, { mode: 'contextual' }, contextGuardPorts);
    assert.equal(rejectedInherited.error?.code, expectedCode);
    assert.equal(Object.hasOwn(rejectedInherited, 'data'), false);
}
assert.equal(contextGuardCalls, 0); assert.equal(contextGetterReads, 0);

// Consuming inherited Context cannot add tokenizer/request effects to Inspect or empty authority.
let inheritedNoEffects = 0;
for (const [mode, input] of [
    ['inspect', inheritedDraft],
    ['contextual', { ...inheritedDraft, spans: [] }],
    ['strict', { ...inheritedDraft, spans: [] }],
]) {
    const noEffects = await cleanupDraft(input, { mode, scope: 'narration' }, { countTokens() { inheritedNoEffects++; throw new Error('No tokenization'); }, request() { inheritedNoEffects++; throw new Error('No request'); } });
    assert.equal(noEffects.ok, true);
    assert.deepEqual(noEffects.data.artifact.patches, []);
    assert.equal(noEffects.data.report.find(record => record.code === 'PROSE_CLEANUP').requestCount, 0);
    if (mode !== 'inspect') assert.deepEqual(noEffects.data.artifact.draft.spans, []);
}
assert.equal(inheritedNoEffects, 0);

let emptyCalls = 0;
const unchanged = await cleanupDraft(emptyDraft, { mode: 'contextual', scope: 'whole' }, { countTokens() { emptyCalls++; throw new Error('no windows'); }, request() { emptyCalls++; throw new Error('no windows'); } });
assert.equal(unchanged.ok, true);
assert.equal(emptyCalls, 0);
assert.equal(unchanged.data.report.find(record => record.code === 'PROSE_CLEANUP').requestCount, 0);

// Strict mode must expose unresolved wording, including immutable originals, without retrying.
let strictCalls = 0;
const strict = await cleanupDraft(draft(guardedText), { mode: 'strict', scope: 'narration', protectedLiterals: ['acceptable'] }, {
    binding: {}, countTokens: async () => ({ tokens: 1 }),
    request: async () => { strictCalls++; return { ok: true, data: { text: 'acceptable. "acceptable."', finish: 'stop' } }; },
});
assert.equal(strict.ok, true); assert.equal(strictCalls, 1);
assert.deepEqual(strict.data.report.filter(record => record.code === 'STRICT_LITERAL_REMAINS').map(({ start, end, offsetSpace }) => ({ start, end, offsetSpace })), [
    { start: 0, end: 10, offsetSpace: 'candidate' }, { start: 13, end: 23, offsetSpace: 'candidate' },
]);
assert.deepEqual(strict.data.report.filter(record => record.code === 'STRICT_UNEDITABLE_LITERAL').map(({ start, end, reason, offsetSpace }) => ({ start, end, reason, offsetSpace })), [
    { start: 11, end: 21, reason: 'protected', offsetSpace: 'original' },
]);
assert.equal(strict.data.artifact.draft.findings.find(finding => finding.start === 11).protected, true);
const strictNoWindows = await cleanupDraft(emptyDraft, { mode: 'strict', scope: 'whole' });
assert.equal(strictNoWindows.ok, true);
assert.equal(strictNoWindows.data.report.filter(record => record.code === 'STRICT_LITERAL_REMAINS').length, 1);
assert.equal(strictNoWindows.data.report.find(record => record.code === 'PROSE_CLEANUP').requestCount, 0);

// Malformed authority and oversized inspection must fail before awaiting any external port.
let unsafeCalls = 0;
const neverPorts = { binding: {}, countTokens() { unsafeCalls++; throw new Error('must validate first'); }, request() { unsafeCalls++; throw new Error('must validate first'); } };
const overflow = await cleanupDraft({ ...draft('adequate'), findings: Array.from({ length: 4096 }, () => ({ code: 'upstream' })) }, { mode: 'contextual' }, neverPorts);
assert.equal(overflow.error?.code, 'SCAN_LIMIT');
for (const [input, options, error] of [
    [draft('adequate'), { categories: ['missing'], mode: 'contextual' }, 'INVALID_SETTINGS'],
    [{ ...draft('adequate'), spans: Array(1) }, { mode: 'contextual' }, 'INVALID_DRAFT'],
    [{ ...draft('adequate'), spans: undefined }, { mode: 'contextual' }, 'INVALID_SPANS'],
    [{ ...draft('adequate'), source: { originalText: 'other' } }, { mode: 'contextual' }, 'STALE_SOURCE'],
    [draft('x'.repeat(100001)), { mode: 'contextual' }, 'INPUT_LIMIT'],
]) {
    const failed = await cleanupDraft(input, options, neverPorts);
    assert.equal(failed.error?.code, error);
    assert.equal(Object.hasOwn(failed, 'data'), false);
}
assert.equal(unsafeCalls, 0);
const tooMany = await cleanupDraft(draft('adequate '.repeat(4097)), { mode: 'inspect', scope: 'whole' });
assert.equal(tooMany.error?.code, 'SCAN_LIMIT');

// Cancellation and incomplete/invalid output cannot produce an authoritative proposal.
for (const [response, error] of [
    [{ ok: true, data: { text: 'Plain.', finish: 'length' } }, 'TRUNCATED_OUTPUT'],
    [{ ok: true, data: { text: 'Plain.', finish: 'max_tokens' } }, 'TRUNCATED_OUTPUT'],
    [{ ok: true, data: { text: 'Plain.' } }, 'COMPLETION_UNVERIFIED'],
    [{ ok: true, data: { text: 'Plain.', finish: 'unknown' } }, 'COMPLETION_UNVERIFIED'],
    [{ ok: true, data: { text: '   ', finish: 'stop' } }, 'INVALID_RESPONSE'],
    [{ ok: true, data: { text: 'x'.repeat(100001), finish: 'stop' } }, 'OUTPUT_LIMIT'],
    [{ ok: false, error: { code: 'UPSTREAM_FAILED', message: 'No output' } }, 'UPSTREAM_FAILED'],
    [{ ok: false, error: { message: 'No code' } }, 'INVALID_RESPONSE'],
    [{ text: 'Plain.', finish: 'stop' }, 'INVALID_RESPONSE'],
]) {
    let calls = 0;
    const failed = await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { binding: {}, countTokens: async () => ({ tokens: 1 }), request: async () => { calls++; return response; } });
    assert.equal(failed.error?.code, error); assert.equal(calls, 1);
    assert.equal(Object.hasOwn(failed, 'data'), false);
}
const alteredAnchor = await cleanupDraft(draft('adequate. "Keep."'), { mode: 'contextual', scope: 'narration' }, { binding: {}, countTokens: async () => ({ tokens: 1 }), request: async () => ({ ok: true, data: { text: 'Plain. "Changed."', finish: 'stop' } }) });
assert.equal(alteredAnchor.error?.code, 'OUT_OF_SCOPE_CHANGE');
assert.equal(Object.hasOwn(alteredAnchor, 'data'), false);
let cancelledCalls = 0;
const initiallyAborted = new AbortController(); initiallyAborted.abort();
assert.equal((await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { signal: initiallyAborted.signal, countTokens() { cancelledCalls++; }, request() { cancelledCalls++; } })).error?.code, 'ABORTED');
const duringTokenization = new AbortController();
assert.equal((await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { signal: duringTokenization.signal, binding: {}, countTokens: async () => { duringTokenization.abort(); return { tokens: 1 }; }, request() { cancelledCalls++; } })).error?.code, 'ABORTED');
const duringRequest = new AbortController();
const abortedProposal = await cleanupDraft(draft('adequate'), { mode: 'strict' }, { signal: duringRequest.signal, binding: {}, countTokens: async () => ({ tokens: 1 }), request: async () => { duringRequest.abort(); return { ok: true, data: { text: 'Plain.', finish: 'stop' } }; } });
assert.equal(abortedProposal.error?.code, 'ABORTED'); assert.equal(Object.hasOwn(abortedProposal, 'data'), false);
assert.equal(cancelledCalls, 0);
let failedRequests = 0;
assert.equal((await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { binding: {}, countTokens: async () => ({ tokens: Infinity }), request() { failedRequests++; } })).error?.code, 'TOKENIZATION_FAILED');
const thrownRequest = await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { binding: {}, countTokens: async () => ({ tokens: 1 }), request() { failedRequests++; throw new Error('offline'); } });
assert.equal(thrownRequest.error?.code, 'REQUEST_FAILED'); assert.equal(failedRequests, 1);

// All consumed data must be detached before the first await, preserving source permissions.
let releaseTokens, observedPrompt;
const mutatingDraft = draft('adequate');
const mutatingSettings = { mode: 'contextual', categories: ['over-technical-or-out-of-character-diction'] };
const mutatingContext = { kind: 'context', messages: [{ id: 'one', role: 'user', text: 'Initial context.' }] };
const mutatingPorts = { binding: {}, context: mutatingContext, countTokens: () => new Promise(resolve => { releaseTokens = resolve; }), request: async ({ messages }) => { observedPrompt = JSON.parse(messages[1].content); return { ok: true, data: { text: 'Plain.', finish: 'completed' } }; } };
const pending = cleanupDraft(mutatingDraft, mutatingSettings, mutatingPorts);
mutatingDraft.text = 'CHANGED'; mutatingDraft.source.originalText = 'CHANGED'; mutatingDraft.spans.length = 0;
mutatingSettings.categories[0] = 'missing'; mutatingContext.messages[0].text = 'Changed context.';
mutatingPorts.request = () => { throw new Error('Ports were not captured'); };
releaseTokens({ tokens: 3 });
const detached = await pending;
assert.equal(detached.ok, true);
assert.equal(detached.data.artifact.draft.text, 'adequate');
assert.equal(detached.data.artifact.draft.spans.length, 1);
assert.equal(observedPrompt.original, 'adequate');
assert.deepEqual(observedPrompt.context, [{ role: 'user', text: 'Initial context.' }]);
assert.deepEqual(observedPrompt.policies.categories.map(category => category.id), ['over-technical-or-out-of-character-diction']);
for (const property of ['mode', 'scope', 'categories', 'protectedLiterals', 'caseSensitive', 'strength', 'instructions', 'maxTokens']) {
    let inheritedReads = 0;
    Object.defineProperty(Object.prototype, property, { configurable: true, get() { inheritedReads++; throw new Error('inherited getter'); } });
    let normalized;
    try { normalized = validateCleanupSettings(); }
    finally { delete Object.prototype[property]; }
    assert.equal(normalized.ok, true, property); assert.equal(inheritedReads, 0, property);
}





// Raw Drafts require explicit permission scope; later cleanup never infers dialogue authority.
const raw = { kind: 'draft', text: guardedText, source: { originalText: guardedText } };
assert.equal((await cleanupDraft(raw)).error?.code, 'SCOPE_REQUIRED');
const rawNarration = await cleanupDraft(raw, { mode: 'inspect', scope: 'narration' });
assert.equal(rawNarration.ok, true);
assert.deepEqual(rawNarration.data.artifact.draft.spans.map(({ start, end }) => ({ start, end })), [{ start: 0, end: 10 }]);
assert.equal(rawNarration.data.artifact.draft.findings.find(finding => finding.text === 'acceptable').editable, false);
const ambiguousDraft = { kind: 'draft', text: 'a#b#c', source: { originalText: 'a#b#c' }, spans: [{ index: 0, start: 0, end: 1, text: 'a' }, { index: 1, start: 2, end: 3, text: 'b' }, { index: 2, start: 4, end: 5, text: 'c' }] };
const ambiguous = await cleanupDraft(ambiguousDraft, { mode: 'contextual' }, { binding: {}, countTokens: async () => ({ tokens: 1 }), request: async () => ({ ok: true, data: { text: 'x#y#y#z', finish: 'stop' } }) });
assert.equal(ambiguous.error?.code, 'AMBIGUOUS_ALIGNMENT'); assert.equal(Object.hasOwn(ambiguous, 'data'), false);
let effectReads = 0;
for (const [payload, error] of [
    [Object.defineProperty({}, 'request', { enumerable: true, get() { effectReads++; throw new Error('port accessor'); } }), 'INVALID_PORTS'],
    [{ context: Object.defineProperty({ kind: 'context' }, 'messages', { enumerable: true, get() { effectReads++; throw new Error('context accessor'); } }) }, 'INVALID_CONTEXT'],
]) assert.equal((await cleanupDraft(draft('adequate'), { mode: 'inspect' }, payload)).error?.code, error);
const responseAccessor = Object.defineProperty({ finish: 'stop' }, 'text', { enumerable: true, get() { effectReads++; throw new Error('response accessor'); } });
const accessorOutput = await cleanupDraft(draft('adequate'), { mode: 'contextual' }, { binding: {}, countTokens: async () => ({ tokens: 1 }), request: async () => ({ ok: true, data: responseAccessor }) });
assert.equal(accessorOutput.error?.code, 'INVALID_RESPONSE'); assert.equal(effectReads, 0);
console.log('workflow prose cleanup tests passed');
