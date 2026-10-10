import { cloneJsonValue } from './operations/json-data.js?v=0.27.0';
const fail = (code, message) => ({ ok: false, error: { code, message } });
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const stateValue = value => typeof value === 'string' || plain(value) || Array.isArray(value);
const exact = (value, allowed) => plain(value) && Object.keys(value).every(key => allowed.includes(key));
const probability = value => Number.isFinite(value) && value >= 0 && value <= 1;
const sameKeys = (left, right) => Object.keys(left).length === right.length && right.every(key => Object.hasOwn(left, key));
const tolerance = 1e-6;
const freezeJson = value => { if (value !== null && typeof value === 'object') { Object.values(value).forEach(freezeJson); Object.freeze(value); } return value; };
/** Typed batches intentionally have a local 32-question bound, independent of provider limits. */
export function validateDecisionQuestions(value) {
    const checked = cloneJsonValue(value);
    if (!checked.ok || !plain(checked.data.value)) return fail('INVALID_QUESTIONS', 'Questions must be bounded own JSON records.');
    const questions = checked.data.value, ids = Object.keys(questions);
    if (!ids.length || ids.length > 32 || ids.some(id => !id.trim() || id.length > 128)) return fail('INVALID_QUESTIONS', 'Provide 1–32 questions with stable bounded IDs.');
    for (const question of Object.values(questions)) {
        if (!exact(question, ['type', 'instructions', 'criteria']) || !['noul','choice','score'].includes(question.type) || !stateValue(question.instructions) || typeof question.instructions === 'string' && !question.instructions.trim()) return fail('INVALID_QUESTIONS', 'Each question needs a typed question and text or structured instructions.');
        if (question.type === 'noul') {
            if (Object.hasOwn(question, 'criteria') && (!exact(question.criteria, ['true', 'false']) || !Object.keys(question.criteria).length || Object.values(question.criteria).some(item => !stateValue(item)))) return fail('INVALID_QUESTIONS', 'Yes/no descriptions use true and false criteria.');
        } else if (question.type === 'choice') {
            if (!plain(question.criteria) || Object.keys(question.criteria).length < 2 || Object.keys(question.criteria).length > 255 || Object.keys(question.criteria).some(key => !key.trim() || key.length > 128) || Object.values(question.criteria).some(item => item !== null && !stateValue(item))) return fail('INVALID_QUESTIONS', 'Choice needs 2–255 named alternatives.');
        } else if (!Array.isArray(question.criteria) || question.criteria.length < 2 || question.criteria.length > 10 || question.criteria.some(item => !stateValue(item))) return fail('INVALID_QUESTIONS', 'Score needs 2–10 ordered rubric levels.');
    }
    return { ok: true, data: { questions } };
}
export function prepareFastDecisionRequest(value) {
    const checked = cloneJsonValue(value);
    if (!checked.ok || !exact(checked.data.value, ['state','questions']) || !stateValue(checked.data.value.state)) return fail('INVALID_REQUEST', 'Provide bounded text or structured state and keyed questions.');
    const questions = validateDecisionQuestions(checked.data.value.questions);
    return questions.ok ? { ok: true, data: { state: checked.data.value.state, questions: questions.data.questions } } : questions;
}
function distribution(value, keys) {
    return plain(value) && sameKeys(value, keys) && Object.values(value).every(probability) && Math.abs(Object.values(value).reduce((sum, item) => sum + item, 0) - 1) <= tolerance;
}
const secretKey = /secret|password|api.?key|authorization|token|credential|headers|endpoint|url/i;
function diagnostic(value, depth = 0) {
    if (depth > 8) return null;
    if (typeof value === 'string') return value.slice(0, 2048);
    if (value === null || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.slice(0, 64).map(item => diagnostic(item, depth + 1));
    return Object.fromEntries(Object.entries(value).filter(([key]) => !secretKey.test(key)).slice(0, 64).map(([key,item]) => [key, diagnostic(item, depth + 1)]));
}
/** Preserve each provider metric; acceptance policies belong to an explicit downstream gate. */
export function validateFastDecisionResponse(raw, questionsValue) {
    const prepared = validateDecisionQuestions(questionsValue); if (!prepared.ok) return prepared;
    const checked = cloneJsonValue(raw); if (!checked.ok) return fail('INVALID_FAST_RESPONSE', 'The typed provider returned invalid bounded JSON.');
    const response = checked.data.value, questions = prepared.data.questions;
    if (!plain(response) || typeof response.model !== 'string' || !response.model.trim() || response.model.length > 256 || !plain(response.answers) || !sameKeys(response.answers, Object.keys(questions)) || !exact(response.usage, ['input_tokens','output_tokens']) || !['input_tokens','output_tokens'].every(key => Number.isSafeInteger(response.usage[key]) && response.usage[key] >= 0)) return fail('INVALID_FAST_RESPONSE', 'The provider must return matching answers, a model and verified token usage.');
    const answers = {};
    for (const [id, question] of Object.entries(questions)) {
        const answer = response.answers[id];
        if (!exact(answer, question.type === 'noul' ? ['type','noul'] : question.type === 'choice' ? ['type','choice','probabilities','confidence'] : ['type','score','legend','probabilities','confidence']) || answer.type !== question.type) return fail('INVALID_FAST_RESPONSE', 'An answer type does not match its question.');
        if (question.type === 'noul') {
            if (!probability(answer.noul)) return fail('INVALID_FAST_RESPONSE', 'Yes/no probability must be finite and between zero and one.');
            Object.defineProperty(answers,id,{ value: { type: 'noul', noul: answer.noul }, enumerable: true });
        } else {
            const keys = question.type === 'choice' ? Object.keys(question.criteria) : question.criteria.map((_, index) => String(index));
            if (!distribution(answer.probabilities, keys) || !probability(answer.confidence)) return fail('INVALID_FAST_RESPONSE', 'Answer probabilities must match the rubric and sum to one; confidence must be bounded.');
            if (question.type === 'choice') {
                if (typeof answer.choice !== 'string' || !keys.includes(answer.choice) || answer.probabilities[answer.choice] + tolerance < Math.max(...Object.values(answer.probabilities))) return fail('INVALID_FAST_RESPONSE', 'Choice must be an offered highest-probability alternative.');
                Object.defineProperty(answers,id,{ value: { type: 'choice', choice: answer.choice, probabilities: answer.probabilities, confidence: answer.confidence }, enumerable: true });
            } else {
                const weighted = keys.reduce((sum, key) => sum + Number(key) * answer.probabilities[key], 0);
                if (!Number.isFinite(answer.score) || answer.score < 0 || answer.score > question.criteria.length - 1 || Math.abs(answer.score - weighted) > tolerance || !plain(answer.legend) || !sameKeys(answer.legend, keys) || keys.some(key => typeof answer.legend[key] !== 'string' || typeof question.criteria[Number(key)] === 'string' && answer.legend[key] !== question.criteria[Number(key)])) return fail('INVALID_FAST_RESPONSE', 'Score must agree with its zero-based weighted rubric and legend.');
                Object.defineProperty(answers,id,{ value: { type: 'score', score: answer.score, legend: answer.legend, probabilities: answer.probabilities, confidence: answer.confidence }, enumerable: true });
            }
        }
    }
    const diagnostics = Object.fromEntries(['routing','action'].filter(key => Object.hasOwn(response,key)).map(key => [key, diagnostic(response[key])]));
    return { ok: true, data: { model: response.model, answers, usage: response.usage, ...(Object.keys(diagnostics).length ? { diagnostics } : {}) } };
}
const completeReasons = new Set(['stop','eos_token','eos','stop_sequence','end_turn','complete','completed']);
const fallbackCodes = new Set(['REQUEST_FAILED','SERVICE_UNAVAILABLE','RATE_LIMITED','PROVIDER_OVERLOADED','AUTH_MISSING','HTTP_ERROR','INVALID_FAST_RESPONSE']);
const requestFailure = (result, code = 'REQUEST_FAILED') => fail(typeof result?.error?.code === 'string' && /^[A-Z_]{1,64}$/.test(result.error.code) ? result.error.code : code, 'The decision request failed; no answer was inferred.');
function decisionOptions(value) {
    const checked = cloneJsonValue(value);
    if (!checked.ok || !exact(checked.data.value, ['state','questions','maxTokens','fallback'])) return fail('INVALID_SETTINGS', 'Decision settings require bounded supported controls.');
    const settings = checked.data.value;
    const prepared = prepareFastDecisionRequest({ state: settings.state, questions: settings.questions }); if (!prepared.ok) return prepared;
    const maxTokens = settings.maxTokens ?? 2048;
    if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > 65536) return fail('INVALID_SETTINGS', 'The completion limit must be 1–65,536 tokens.');
    const fallback = settings.fallback ?? { enabled: false, allowedCodes: [] };
    if (!exact(fallback, ['enabled','allowedCodes']) || typeof fallback.enabled !== 'boolean' || !Array.isArray(fallback.allowedCodes) || fallback.allowedCodes.length > fallbackCodes.size || new Set(fallback.allowedCodes).size !== fallback.allowedCodes.length || fallback.allowedCodes.some(code => !fallbackCodes.has(code))) return fail('INVALID_SETTINGS', 'Fallback needs an explicit supported error-code list.');
    return { ok: true, data: freezeJson({ ...prepared.data, maxTokens, fallback }) };
}
function validateTextAnswers(raw, questions) {
    const checked = cloneJsonValue(raw);
    if (!checked.ok || !exact(checked.data.value,['answers']) || !plain(checked.data.value.answers) || !sameKeys(checked.data.value.answers,Object.keys(questions))) return fail('INVALID_DECISION_OUTPUT', 'Return one strict JSON answer for each requested question.');
    const answers = checked.data.value.answers;
    for (const [id, question] of Object.entries(questions)) {
        const answer = answers[id], field = question.type === 'noul' ? 'accepted' : question.type === 'choice' ? 'choice' : 'score';
        if (!exact(answer,['type',field,'confidence','evidence']) || answer.type !== question.type || !Object.hasOwn(answer,field) || Object.hasOwn(answer,'confidence') && !probability(answer.confidence) || Object.hasOwn(answer,'evidence') && (typeof answer.evidence !== 'string' || answer.evidence.length > 2048)) return fail('INVALID_DECISION_OUTPUT', 'The answer must match its declared type and bounded evidence.');
        const value = answer[field];
        if (value !== null && (question.type === 'noul' ? typeof value !== 'boolean' : question.type === 'choice' ? typeof value !== 'string' || !Object.hasOwn(question.criteria,value) : !Number.isFinite(value) || value < 0 || value > question.criteria.length - 1)) return fail('INVALID_DECISION_OUTPUT', 'The answer lies outside its authored alternatives or rubric.');
    }
    return { ok: true, data: { answers } };
}
/** The injected request must be an independently authenticated verified text connection. */
export async function runDecision(value, local = {}) {
    const checked = decisionOptions(value); if (!checked.ok) return checked;
    if (local.signal?.aborted) return fail('ABORTED','The decision was stopped.');
    if (typeof local.request !== 'function') return fail('SERVICE_UNAVAILABLE','Bind the independent text Decision connection.');
    const { state, questions, maxTokens } = checked.data;
    const system = 'Evaluate only the supplied state against the supplied questions. Return strict JSON with exactly an answers map using the same IDs and question types. For noul use accepted: true, false, or null if unresolved; for choice use choice: an offered key or null; for score use score: a zero-based number between the first and last ordered rubric level, or null. Each answer may include evidence (a short quote from the supplied state) and confidence (0 to 1, self-reported certainty). Do not invent absent evidence, add questions, output probabilities, or add prose outside JSON.';
    let result;
    try { result = await local.request({ messages: [{ role: 'system', content: system }, { role: 'user', content: JSON.stringify({ state, questions }) }], maxTokens, ...(local.signal ? { signal: local.signal } : {}) }); }
    catch { return requestFailure(null); }
    if (local.signal?.aborted) return fail('ABORTED','Ignore the stopped decision result.');
    if (result?.ok !== true) return requestFailure(result);
    const finish = result.data?.finish;
    if (typeof finish !== 'string' || !completeReasons.has(finish.toLowerCase())) return fail('COMPLETION_UNVERIFIED','The text connection did not verify a complete response.');
    const text = result.data?.text;
    if (typeof text !== 'string' || text.length > 100000 || new TextEncoder().encode(text).byteLength > 262144) return fail('INVALID_DECISION_OUTPUT','Decision output must be bounded JSON text.');
    let parsed; try { parsed = JSON.parse(text); } catch { return fail('INVALID_DECISION_OUTPUT','Decision output must be strict JSON without prose or fences.'); }
    const answers = validateTextAnswers(parsed, questions); if (!answers.ok) return answers;
    const usage = safeUsage(result.data?.usage ?? null);
    if (!usage.ok) return usage;
    return { ok: true, data: { schemaVersion: 1, recordType: 'decision', source: 'model-text', answers: answers.data.answers, confidenceSemantics: 'self-reported', usage: usage.data.value, actualCalls: 1 } };
}
/** Fast transport never calls a text model unless the authored allowed-code policy permits it. */
export async function runFastDecision(value, local = {}) {
    const checked = decisionOptions(value); if (!checked.ok) return checked;
    if (local.signal?.aborted) return fail('ABORTED','The decision was stopped.');
    const { state, questions, fallback, maxTokens } = checked.data;
    let result, actualCalls = 0;
    if (typeof local.typedRequest !== 'function') result = fail('SERVICE_UNAVAILABLE','Bind a typed Fast Decision connection.');
    else {
        actualCalls++;
        try { result = await local.typedRequest({ state, questions, ...(local.signal ? { signal: local.signal } : {}) }); } catch { result = requestFailure(null); }
    }
    if (local.signal?.aborted) return fail('ABORTED','Ignore the stopped typed decision result.');
    if (result?.ok === true) {
        const response = validateFastDecisionResponse(result.data?.response ?? result.data, questions);
        if (response.ok) return { ok: true, data: { schemaVersion: 1, recordType: 'decision', source: 'typed-provider', ...response.data, ...(safeProvenance(result.data?.provenance) === undefined ? {} : { provenance: safeProvenance(result.data.provenance) }), actualCalls } };
        result = response;
    }
    const failure = requestFailure(result);
    if (!fallback.enabled || !fallback.allowedCodes.includes(failure.error.code)) return failure;
    const textResult = await runDecision({ state, questions, maxTokens }, { request: local.request, signal: local.signal });
    return textResult.ok ? { ok: true, data: { ...textResult.data, actualCalls: actualCalls + textResult.data.actualCalls, fallback: { from: 'typed-provider', reason: failure.error.code } } } : textResult;
}

function safeProvenance(value) {
    if(value===undefined)return undefined;
    const checked=cloneJsonValue(value);if(!checked.ok||!plain(checked.data.value))return undefined;
    const keys=['capability','connectionId','provider','model','returnedModel','revision','fingerprint'];
    return Object.fromEntries(Object.entries(checked.data.value).filter(([key,item])=>keys.includes(key)&&(typeof item==='string'&&item.length<=256||key==='revision'&&Number.isSafeInteger(item)&&item>0)));
}
function safeUsage(value) {
    const checked=cloneJsonValue(value);if(!checked.ok||checked.data.value!==null&&!plain(checked.data.value))return fail('INVALID_DECISION_OUTPUT','Usage must contain bounded token counters.');
    if(checked.data.value===null)return {ok:true,data:{value:null}};
    const fields=['inputTokens','outputTokens','totalTokens','promptTokens','completionTokens','input_tokens','output_tokens','total_tokens','prompt_tokens','completion_tokens','cached_tokens','reasoning_tokens'];
    const entries=Object.entries(checked.data.value).filter(([key])=>fields.includes(key));
    if(entries.some(([,item])=>!Number.isSafeInteger(item)||item<0))return fail('INVALID_DECISION_OUTPUT','Usage token counts must be nonnegative safe integers.');
    return {ok:true,data:{value:Object.fromEntries(entries)}};
}