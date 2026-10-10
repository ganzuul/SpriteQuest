import { mkdir, readFile, writeFile, rename, open, unlink } from 'node:fs/promises';
import { dirname, resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requestModel } from '../src/workflow/connections.js?v=0.27.0';
import { validateWorkflow } from '../src/workflow/contracts.js?v=0.27.0';
import { createExampleFixture, examplePhases, currentMemory, guidance, withBrowserWorker } from '../tests/helpers/workflow-example-fixtures.mjs';
import { liveCaseSpec } from './roleplay-soak-cases.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const MODEL = 'z-ai/glm-5.2:thinking', PRESET = 'Wandlight-1.8', DEFAULT_REQUESTS = 64, MAX_REQUESTS = 80;
const TOKENIZER_ENDPOINT = '/api/tokenizers/openai/count?model=gpt-3.5-turbo';
const fail = (code, message) => ({ ok: false, error: { code, message } });
const timestamp = () => new Date().toISOString();
const cleanText = value => typeof value === 'string' ? value.replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]').replace(/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[redacted]') : null;
const codeOf = value => typeof value === 'string' && /^[A-Z0-9_]{1,80}$/.test(value) ? value : 'SOAK_FAILED';
const safeUsage = value => {
    if (!value || typeof value !== 'object') return null;
    const keys = ['prompt_tokens', 'completion_tokens', 'total_tokens', 'input_tokens', 'output_tokens', 'reasoning_tokens', 'cost'];
    const result = Object.fromEntries(keys.filter(key => Number.isFinite(value[key]) && value[key] >= 0).map(key => [key, value[key]]));
    if (Number.isFinite(value.completion_tokens_details?.reasoning_tokens)) result.reasoning_tokens = value.completion_tokens_details.reasoning_tokens;
    return Object.keys(result).length ? result : null;
};
const samplerKeys = ['temperature', 'frequency_penalty', 'presence_penalty', 'top_p', 'seed', 'include_reasoning', 'reasoning_effort', 'nanogpt_provider', 'nanogpt_payg_override', 'enable_web_search', 'request_images', 'custom_prompt_post_processing', 'stop'];

/** Parse the paid boundary before filesystem/account/network work. */
export function parseSoakArgs(args) {
    const options = { live: false, retestFailed: false, revalidate: false, revision: 'baseline', host: 'http://127.0.0.1:8000', from: 1, to: 30, phase: 'all', maxRequests: DEFAULT_REQUESTS, priorAttempts: 0, report: 'docs/superpowers/reviews/2026-10-09-roleplay-example-live-soak.json' };
    const names = { '--host': 'host', '--account': 'account', '--profile-id': 'profileId', '--report': 'report', '--from': 'from', '--to': 'to', '--phase': 'phase', '--max-requests': 'maxRequests', '--prior-attempts': 'priorAttempts', '--revision': 'revision' };
    const explicit = new Set();
    for (let index = 0; index < args.length; index++) {
        if (args[index] === '--live') { options.live = true; continue; }
        if (args[index] === '--retest-failed') { options.retestFailed = true; continue; }
        if (args[index] === '--revalidate') { options.revalidate = true; continue; }
        if (args[index] === '--help') { options.help = true; continue; }
        const key = names[args[index]], value = args[++index];
        if (!key || !value || value.startsWith('--')) throw Error('Unknown option or missing option value.');
        options[key] = ['from', 'to', 'maxRequests', 'priorAttempts'].includes(key) ? Number(value) : value;
        explicit.add(key);
    }
    if (options.help) return options;
    if (options.retestFailed && options.revalidate) throw Error('Choose either --retest-failed or --revalidate.');
    const manual = options.retestFailed || options.revalidate;
    if (manual !== explicit.has('revision') || manual && (options.revision === 'baseline' || !/^[a-z][a-z0-9-]{2,63}$/.test(options.revision))) throw Error('Manual retests or revalidation require their explicit mode and a new explicit --revision.');
    if (options.revalidate && (!options.live || !explicit.has('from') || !explicit.has('to'))) throw Error('Manual revalidation requires --live and explicit --from and --to.');
    if (!/^lattice-examples-soak-[A-Za-z0-9_-]+$/.test(options.account ?? '') || typeof options.profileId !== 'string' || !options.profileId.trim()) throw Error('Supply the separate soak --account and explicit --profile-id.');
    const host = new URL(options.host);
    if (host.protocol !== 'http:' || !['127.0.0.1', '[::1]'].includes(host.hostname) || host.username || host.password || host.pathname !== '/' || host.search || host.hash) throw Error('Use an HTTP loopback host without credentials or a path.');
    for (const key of ['from', 'to']) if (!Number.isSafeInteger(options[key]) || options[key] < 1 || options[key] > 30) throw Error('Use example numbers from 1 through 30.');
    if (options.from > options.to || !['all', 'pre', 'post'].includes(options.phase)) throw Error('Use an ordered example range and pre, post or all phases.');
    if (!Number.isSafeInteger(options.maxRequests) || options.maxRequests < 1 || options.maxRequests > MAX_REQUESTS || !Number.isSafeInteger(options.priorAttempts) || options.priorAttempts < 0 || options.priorAttempts > MAX_REQUESTS) throw Error('The cumulative paid request ceiling is at most 80, including external prior attempts; the default remains 64.');
    const report = resolve(ROOT, options.report), inside = relative(resolve(ROOT, 'docs/superpowers/reviews'), report);
    if (inside.startsWith('..') || isAbsolute(inside) || !report.endsWith('.json')) throw Error('Save the ledger as JSON under docs/superpowers/reviews.');
    options.report = report;
    return options;
}

/** A config revision is explicitly requested; completed or previously attempted graph/revision pairs never rerun. */
export function selectSoakSpecs(options, data) {
    return examplePhases.filter(item => item.number >= options.from && item.number <= options.to && (options.phase === 'all' || item.phase === options.phase)).flatMap(item => {
        const history = data.phases.map((phase, index) => ({ phase, index })).filter(record => record.phase.graphId === item.graphId);
        const attempted = (data.requests ?? []).some(request => (request.graphId === item.graphId || request.address?.workflowId === item.graphId || request.number === item.number && request.phase === item.phase) && (request.revision ?? 'baseline') === options.revision);
        if (attempted || history.some(record => (record.phase.revision ?? 'baseline') === options.revision)) return [];
        const baseline = history.filter(record => (record.phase.revision ?? 'baseline') === 'baseline').at(-1);
        const latest = history.at(-1);
        if (options.retestFailed && (baseline?.phase.status !== 'failed' || latest?.phase.status !== 'failed')) return [];
        if (options.revalidate && (!['completed', 'failed'].includes(latest?.phase.status) || !Number.isFinite(Date.parse(latest.phase.finishedAt)))) return [];
        return [{ ...liveCaseSpec(item.number, item.phase), revision: options.revision, ...(options.retestFailed ? { retestOf: baseline.index } : {}), ...(options.revalidate ? { revalidateOf: latest.index } : {}) }];
    });
}

/** Reservations count failed/unknown attempts. Nothing retries a request or resets its durable ledger. */
export function createSoakLedger(data, { maxRequests = DEFAULT_REQUESTS, checkpoint }) {
    if (!Number.isSafeInteger(maxRequests) || maxRequests < 1 || maxRequests > MAX_REQUESTS || data.maxRequests !== undefined && (!Number.isSafeInteger(data.maxRequests) || data.maxRequests < 1 || data.maxRequests > MAX_REQUESTS)) throw Error('Invalid cumulative paid request ceiling.');
    data.maxRequests = Math.max(data.maxRequests ?? 0, maxRequests);
    data.requests ??= []; data.phases ??= []; data.externalPriorAttempts ??= 0;
    let active = null;
    const persist = async () => { data.updatedAt = timestamp(); await checkpoint(data); };
    return {
        data, persist,
        remaining: () => maxRequests - data.externalPriorAttempts - data.requests.length,
        async capturePayload(payload) {
            if (!active || payload.chat_completion_source !== 'nanogpt' || payload.model !== active.model || payload.max_tokens !== active.maxTokens || payload.stream !== false || JSON.stringify(payload.messages) !== active.messages || active.transmitted) throw Error('Generation payload differs from its owned reservation.');
            active.transmitted = true;
            active.record.transportPrepared = true;
            active.record.sampler = Object.fromEntries(samplerKeys.filter(key => payload[key] !== undefined).map(key => [key, payload[key]]));
            await persist();
        },
        captureResponse(raw) {
            if (!active) throw Error('No active owned request.');
            active.record.backendAccepted = true;
            active.record.output = cleanText(raw?.choices?.[0]?.message?.content ?? raw?.choices?.[0]?.text);
            active.record.finish = typeof raw?.choices?.[0]?.finish_reason === 'string' ? raw.choices[0].finish_reason.slice(0, 80) : null;
            active.record.usage = safeUsage(raw?.usage);
        },
        async request(input, stage, spec, execute) {
            if (data.stopped || active || data.externalPriorAttempts + data.requests.length >= maxRequests) throw Error('The paid sweep is stopped or its cumulative request ceiling is exhausted.');
            if (input.binding?.model !== MODEL || !Number.isSafeInteger(input.maxTokens) || input.maxTokens < 1 || input.maxTokens !== stage?.node?.maxTokens || !Array.isArray(input.messages) || input.messages.some(message => typeof message.content !== 'string' || !['system', 'user', 'assistant', 'tool'].includes(message.role))) throw Error('Only owned synthetic requests with the authored completion cap are admitted.');
            const record = { attempt: data.externalPriorAttempts + data.requests.length + 1, startedAt: timestamp(), number: spec.number, phase: spec.phase, revision: spec.revision ?? 'baseline', ...(spec.revalidateOf === undefined ? {} : { revalidateOf: spec.revalidateOf }), graphId: spec.graph?.id ?? stage.address.workflowId, address: structuredClone(stage.address), operation: stage.node.operation, model: input.binding.model, maxTokens: input.maxTokens, messages: input.messages.map(({ role, content }) => ({ role, content: cleanText(content) })), outcome: 'reserved', transportPrepared: false, backendAccepted: false, usage: null, usageStatus: 'unknown', finish: null, output: null };
            data.requests.push(record);
            active = { record, model: input.binding.model, maxTokens: input.maxTokens, messages: JSON.stringify(input.messages), transmitted: false };
            await persist();
            const started = Date.now();
            try {
                const result = await execute();
                record.outcome = result?.ok ? 'complete' : 'failed';
                record.errorCode = result?.ok ? null : codeOf(result?.error?.code);
                record.output ??= cleanText(result?.data?.text);
                record.finish ??= result?.data?.finish ?? result?.error?.finish ?? null;
                record.usage ??= safeUsage(result?.data?.usage ?? result?.error?.usage);
                if (record.errorCode === 'REQUEST_FAILED' || record.errorCode?.startsWith('LOCAL_')) data.stopped = true;
                return result;
            } catch {
                record.outcome = 'failed'; record.errorCode = 'TRANSPORT_FAILED'; data.stopped = true;
                return fail('TRANSPORT_FAILED', 'The request transport failed; the sweep stopped without retry.');
            } finally {
                record.elapsedMs = Date.now() - started; record.usageStatus = record.usage ? 'reported' : 'unknown';
                active = null; await persist();
            }
        },
    };
}

/** Mirrors installed custom-request.js/settingsToUpdate/createGenerationParameters for quiet NanoGPT calls. */
export function presetToNanoGPTPayload(preset, settings, override = {}, character = {}) {
    const current = structuredClone(settings.oai_settings ?? {});
    const names = { temperature: 'temp_openai', frequency_penalty: 'freq_pen_openai', presence_penalty: 'pres_pen_openai', top_p: 'top_p_openai' };
    const direct = ['seed', 'show_thoughts', 'reasoning_effort', 'nanogpt_provider', 'nanogpt_payg_override', 'enable_web_search', 'request_images', 'request_image_resolution', 'request_image_aspect_ratio', 'custom_prompt_post_processing', 'verbosity'];
    for (const [key, setting] of Object.entries(names)) if (preset[key] !== undefined) current[setting] = preset[key];
    for (const key of direct) if (preset[key] !== undefined) current[key] = preset[key];
    const payload = { type: 'quiet', messages: override.messages, model: override.model, chat_completion_source: 'nanogpt', stream: false,
        temperature: Number(current.temp_openai), frequency_penalty: Number(current.freq_pen_openai), presence_penalty: Number(current.pres_pen_openai), top_p: Number(current.top_p_openai),
        include_reasoning: Boolean(current.show_thoughts), reasoning_effort: current.reasoning_effort,
        nanogpt_provider: current.nanogpt_provider, nanogpt_payg_override: current.nanogpt_payg_override,
        enable_web_search: Boolean(current.enable_web_search), request_images: Boolean(current.request_images),
        request_image_resolution: String(current.request_image_resolution), request_image_aspect_ratio: String(current.request_image_aspect_ratio),
        custom_prompt_post_processing: current.custom_prompt_post_processing, use_sysprompt: true,
        user_name: 'Synthetic player', char_name: character.name ?? 'Mira', group_names: [], ...override,
    };
    if (current.seed >= 0) payload.seed = current.seed;
    let stops = settings.power_user?.custom_stopping_strings;
    if (typeof stops === 'string') { try { stops = JSON.parse(stops); } catch { stops = []; } }
    if (Array.isArray(stops)) {
        stops = stops.filter(value => typeof value === 'string' && value.length > 0);
        if (settings.power_user?.custom_stopping_strings_macro) stops = stops.map(value => {
            const substituted = value.replace(/\{\{char\}\}/gi, payload.char_name).replace(/\{\{user\}\}/gi, payload.user_name);
            if (/\{\{[^}]+\}\}/.test(substituted)) throw Error('A stop-string macro requires unavailable UI state.');
            return substituted;
        });
        if (stops.length) payload.stop = stops.slice(0, 4);
    }
    for (const key of Object.keys(payload)) if (payload[key] === undefined) delete payload[key];
    return payload;
}

/** Installed NanoGPT getTokenCountAsync calls countTokensOpenAIAsync({content:text}, true). */
export function createLocalTokenCounter(client) {
    const counter = async text => {
        if (typeof text !== 'string' || new TextEncoder().encode(text).byteLength > 1048576) throw Error('LOCAL_TOKENIZER_INPUT_LIMIT');
        const result = await client.call(TOKENIZER_ENDPOINT, [{ content: text }]);
        if (!Number.isSafeInteger(result?.token_count) || result.token_count < 0 || result.token_count > 1048576) throw Error('LOCAL_TOKENIZER_INVALID');
        return { tokens: result.token_count, method: counter.method };
    };
    Object.defineProperty(counter, 'method', { value: 'sillytavern-openai:gpt-3.5-turbo:full=true', enumerable: true });
    return counter;
}

/** Rebind after fixture.setGraph; invoke its controller directly so fixture convenience methods cannot restore fake roles. */
export function createLiveFixture(graph, options, services) {
    const tokenCount = options.tokenCount ?? services.countTokens;
    const f = createExampleFixture(graph, { ...options, ...(tokenCount ? { tokenCount } : {}), request: async (input, stage, context) => services.request(input, stage, context, () => requestModel(input, context)) });
    f.tokenizerMethod = tokenCount?.method ?? (options.tokenCount ? 'explicit-fixture-token-count' : 'example-fixture chars/4');
    const profile = services.profile;
    f.context.CONNECT_API_MAP = { nanogpt: { selected: 'openai', source: 'nanogpt' } };
    f.context.chatCompletionSettings = structuredClone(services.settings.oai_settings ?? {});
    f.context.getPresetManager = api => api === 'openai' ? { getCompletionPresetByName: name => name === profile.preset ? structuredClone(services.preset) : undefined } : undefined;
    f.context.ChatCompletionService = { presetToGeneratePayload: async (preset, overrides, payload) => presetToNanoGPTPayload({ ...preset, ...overrides }, services.settings, payload, f.context.characters[0]) };
    f.context.ConnectionManagerRequestService = {
        getProfile: id => id === profile.id ? structuredClone(profile) : undefined,
        async sendRequest(id, messages, maxTokens, custom, overrides) {
            if (id !== profile.id || custom.stream !== false || custom.extractData !== false || custom.includePreset !== false) throw Error('Unsupported connection transport.');
            const payload = { stream: false, messages, max_tokens: maxTokens, model: profile.model, chat_completion_source: 'nanogpt', secret_id: profile['secret-id'], ...overrides };
            return services.send(payload, custom.signal);
        },
    };
    const setGraph = f.setGraph;
    f.setGraph = next => {
        setGraph(next);
        for (const role of ['Analysis', 'Prose']) next.roles[role] = { profileId: profile.id, model: profile.model };
        for (const node of Object.values(next.nodes)) {
            if (!node.definition) continue;
            const definition = Object.values(next.definitions).find(item => item.id === node.definition.id);
            node.roleOverrides ??= {};
            for (const role of Object.keys(definition?.body.roles ?? {})) node.roleOverrides[role] = { ...next.roles[role] };
        }
        return next;
    };
    f.setGraph(graph);
    return f;
}

class LocalTavernClient {
    constructor(host) { this.host = host; this.cookies = new Map(); this.csrf = ''; }
    async call(path, data, signal) {
        if (!['/csrf-token', '/api/users/login', '/api/settings/get', '/api/settings/save', '/api/chats/save', '/api/backends/chat-completions/generate', TOKENIZER_ENDPOINT].includes(path)) throw Error('Unapproved account endpoint.');
        const response = await fetch(new URL(path, this.host), { method: data === undefined ? 'GET' : 'POST', redirect: 'error', signal,
            headers: { cookie: [...this.cookies].map(([key, value]) => `${key}=${value}`).join('; '), ...(this.csrf ? { 'x-csrf-token': this.csrf } : {}), ...(data === undefined ? {} : { 'content-type': 'application/json' }) },
            ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
        for (const line of response.headers.getSetCookie()) { const first = line.split(';')[0], split = first.indexOf('='); this.cookies.set(first.slice(0, split), first.slice(split + 1)); }
        if (!response.ok) throw Error(`LOCAL_HTTP_${response.status}`);
        const result = await response.json();
        if (result.error) throw Error('LOCAL_PROVIDER_ERROR');
        return result;
    }
    async login(account) { this.csrf = (await this.call('/csrf-token')).token; await this.call('/api/users/login', { handle: account, password: '' }); }
}
async function openLocalSession(options) {
    const client = new LocalTavernClient(options.host); await client.login(options.account);
    const raw = await client.call('/api/settings/get', {}), settings = JSON.parse(raw.settings);
    const profiles = settings.extension_settings?.connectionManager?.profiles ?? [];
    const profile = profiles.find(item => item.id === options.profileId);
    if (!profile || profile.api !== 'nanogpt' || profile.model !== MODEL || profile.preset !== PRESET || !profile['secret-id']) throw Error('The approved fixed NanoGPT thinking/Wandlight profile is unavailable.');
    const selected = settings.extension_settings.connectionManager.selectedProfile;
    if (selected && selected !== profile.id) throw Error('The explicit profile differs from the separate account selected profile.');
    const index = raw.openai_setting_names.indexOf(profile.preset), serialized = raw.openai_settings[index];
    if (index < 0 || !serialized) throw Error('The approved Wandlight sampler preset is missing.');
    const preset = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    if (preset.enable_web_search || settings.oai_settings?.enable_web_search || preset.request_images || settings.oai_settings?.request_images) throw Error('The selected preset requests effects outside the text-only soak scope.');
    return { client, profile, preset, settings, countTokens: createLocalTokenCounter(client) };
}

/** The CLI is inert without --live; settings and provider traffic begin only after this boundary. */
export async function runSoakSweep(options, ports = {}) {
    if (!options.live) return { ok: true, data: { status: 'disabled', message: 'No account access or provider calls. Add explicit --live to execute the selected synthetic cases.' } };
    let lock, ledger;
    try {
        await mkdir(dirname(options.report), { recursive: true });
        lock = await open(`${options.report}.lock`, 'wx');
        let data;
        try { data = JSON.parse(await readFile(options.report, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        if (data && (data.account !== options.account || data.profileId !== options.profileId || data.model !== MODEL || data.preset !== PRESET)) throw Error('Existing ledger belongs to another authorized session.');
        data ??= { version: 1, startedAt: timestamp(), account: options.account, profileId: options.profileId, model: MODEL, preset: PRESET, runtime: 'native-controller synthetic fixtures with real account/provider transport', maxRequests: options.maxRequests, externalPriorAttempts: options.priorAttempts, requests: [], phases: [] };
        if (options.priorAttempts > data.externalPriorAttempts) data.externalPriorAttempts = options.priorAttempts;
        if (options.priorAttempts < data.externalPriorAttempts && options.priorAttempts !== 0) throw Error('External prior attempts cannot be reduced.');
        ledger = createSoakLedger(data, { maxRequests: options.maxRequests, checkpoint: async value => { const temporary = `${options.report}.pending`; await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`); await rename(temporary, options.report); } });
        const specs = selectSoakSpecs(options, data);
        const planned = specs.reduce((sum, spec) => sum + validateWorkflow(spec.graph).data.callBound, 0);
        if (data.stopped || planned > ledger.remaining()) throw Error('The requested phase bounds exceed the remaining cumulative ledger allowance or the session was stopped.');
        if (!specs.length) return { ok: true, data: { status: 'no-selected-phases', phases: data.phases.length, attempts: data.externalPriorAttempts + data.requests.length, remaining: ledger.remaining(), report: options.report } };
        data.status = 'running';
        await ledger.persist();
        const session = await (ports.openSession ?? openLocalSession)(options);
        data.samplerPreset = Object.fromEntries(['temperature', 'frequency_penalty', 'presence_penalty', 'top_p', 'seed', 'show_thoughts', 'reasoning_effort', 'nanogpt_provider', 'nanogpt_payg_override'].filter(key => session.preset[key] !== undefined).map(key => [key, session.preset[key]]));
        await withBrowserWorker(async () => {
            for (const spec of specs) {
                if (data.stopped) break;
                const phase = { number: spec.number, id: spec.id, title: spec.title, teachingGoal: spec.teachingGoal, phase: spec.phase, revision: spec.revision, ...(spec.retestOf === undefined ? {} : { retestOf: spec.retestOf }), ...(spec.revalidateOf === undefined ? {} : { revalidateOf: spec.revalidateOf }), graphId: spec.graph.id, startedAt: timestamp(), status: 'running', callBound: validateWorkflow(spec.graph).data.callBound, requestStart: data.requests.length };
                data.phases.push(phase); await ledger.persist();
                const f = createLiveFixture(spec.graph, { ...spec.options, chatId: `soak-${spec.id}-${spec.phase}-${spec.revision}-${data.startedAt.replace(/[^\d]/g, '')}` }, {
                    ...session,
                    request: (input, stage, context, execute) => ledger.request(input, stage, spec, execute),
                    send: async (payload, signal) => { await ledger.capturePayload(payload); const raw = await session.client.call('/api/backends/chat-completions/generate', payload, signal); ledger.captureResponse(raw); return raw; },
                });
                phase.tokenizerMethod = f.tokenizerMethod;
                const persistChat = async () => session.client.call('/api/chats/save', { avatar_url: f.context.characters[0].avatar, file_name: f.context.chatId, chat: [{ user_name: 'Synthetic player', character_name: f.context.characters[0].name, chat_metadata: f.context.chatMetadata }, ...f.context.chat] });
                const originalMetadataSave = f.context.saveMetadata, originalChatSave = f.context.saveChat;
                f.context.saveMetadata = async () => { const acknowledgment = await persistChat(); await originalMetadataSave(); return acknowledgment.ok === true; };
                f.context.saveChat = async () => { await persistChat(); await originalChatSave(); };
                try {
                    await persistChat(); await spec.seed(f); f.setGraph(spec.graph);
                    phase.chatBefore = structuredClone(f.context.chat); phase.character = structuredClone(f.context.characters[0]);
                    phase.memoryBefore = await currentMemory(f); phase.seedMemorySaves = f.memorySaves();
                    const eventStart = f.events.length;
                    const result = spec.phase === 'pre' ? await f.controller.beforeGenerate(f.context.chat, 8192, () => {}) : await f.controller.runPost(spec.graph);
                    phase.status = result.ok ? 'completed' : 'failed'; phase.errorCode = result.ok ? null : codeOf(result.error?.code);
                    phase.actualCalls = result.actualCalls; phase.recording = result.recording;
                    phase.events = structuredClone(f.events.slice(eventStart));
                    phase.publishedGuidance = cleanText(guidance(f.context)); phase.reviewHandles = result.reviewHandles?.length ?? 0;
                    phase.memoryCommit = result.memoryCommit ?? null;
                    phase.appliedReviews = [];
                    if (result.ok) for (const handle of result.reviewHandles ?? []) { const applied = await f.controller.apply(handle); phase.appliedReviews.push({ ok: applied.ok, errorCode: applied.ok ? null : codeOf(applied.error?.code) }); }
                    phase.chatAfter = structuredClone(f.context.chat); phase.memoryAfter = await currentMemory(f);
                    phase.memorySaves = f.memorySaves(); phase.chatSaves = f.chatSaves();
                    await persistChat();
                } catch { phase.status = 'failed'; phase.errorCode = 'FIXTURE_OR_TRANSPORT_FAILED'; data.stopped = true; }
                phase.requestEnd = data.requests.length; phase.finishedAt = timestamp();
                await ledger.persist();
                ports.progress?.({ number: spec.number, phase: spec.phase, revision: spec.revision, status: phase.status, requests: phase.requestEnd - phase.requestStart, errorCode: phase.errorCode });
            }
        });
        data.status = data.stopped ? 'stopped' : 'completed-selected-range'; await ledger.persist();
        return { ok: !data.stopped, data: { status: data.status, phases: data.phases.length, attempts: data.externalPriorAttempts + data.requests.length, remaining: ledger.remaining(), report: options.report } };
    } catch {
        if (ledger) { ledger.data.status = 'stopped'; await ledger.persist().catch(() => {}); }
        return fail('SOAK_SETUP_OR_LEDGER_FAILED', 'The account, sampler, ledger or requested allowance could not be admitted. No retry was made; inspect the checkpoint report.');
    } finally {
        if (lock) { await lock.close(); await unlink(`${options.report}.lock`).catch(() => {}); }
    }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    try {
        const options = parseSoakArgs(process.argv.slice(2));
        if (options.help) console.log('node tools/soak-roleplay-examples.mjs --live --account lattice-examples-soak-... --profile-id ID [--from 1 --to 30 --phase all] [--retest-failed --revision REVISION | --revalidate --revision REVISION --from N --to N] [--max-requests 80] [--prior-attempts N] [--report docs/superpowers/reviews/report.json]');
        else { const result = await runSoakSweep(options, { progress: item => console.log(JSON.stringify(item)) }); console.log(JSON.stringify(result)); if (!result.ok) process.exitCode = 1; }
    } catch { console.error('Invalid soak options. Use --help. No provider request was started.'); process.exitCode = 1; }
}
