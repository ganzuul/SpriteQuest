import { ARTIFACT_KINDS, FAMILIES, OPERATIONS, describeOperation, operationDefaults } from '../workflow/catalog.js?v=0.19.1';
import { cloneDefinitionData, definitionRefKey } from '../workflow/definitions.js?v=0.19.1';

const registries = new WeakMap();
const fail = message => ({ ok: false, error: { code: 'INVALID_SEARCH_CATALOG', message } });
const text = value => typeof value === 'string' && value.length > 0;
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const exact = (value, keys) => record(value) && Object.keys(value).every(key => keys.includes(key));
const rootOnly = new Set(['scene-context', 'reply-snapshot', 'guidance', 'apply-reply']);
const presets = [
    ['text-rules', 'draft', 'Text Rules · Draft', { inputKind: 'draft', mode: 'replace' }],
    ['json-decode', 'check', 'JSON Decode · Check', { mode: 'check' }],
    ['compose', 'input', 'Compose · Input', { sections: [{ name: 'Input', text: '' }] }],
    ['compose', 'guidance', 'Compose · Guidance', { outputKind: 'guidance' }],
];
const freeze = value => {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        for (const child of Object.values(value)) freeze(child);
        Object.freeze(value);
    }
    return value;
};
const portProjection = port => ({ portId: port.id, dir: port.direction === 'input' ? 'in' : 'out', kind: port.kind, label: port.label, required: port.required });
const validOrigin = origin => record(origin) && ['in', 'out'].includes(origin.dir) && ARTIFACT_KINDS.includes(origin.kind);
const matchingPorts = (choice, origin) => choice?.ports.filter(port => port.dir !== origin.dir && port.kind === origin.kind) ?? [];
// Static discovery metadata, separate from placed-node aliases and saved operation controls.
// Existing shortcodes follow the approved shelf; new tools use the same quiet mnemonic convention.
const searchMetadata = cloneDefinitionData({
    'scene-context': { purpose: 'Capture recent messages and character information.', shortcode: 'sc', searchAliases: ['scene-context', 'chat history'] },
    'reply-snapshot': { purpose: 'Capture the assistant response before cleanup.', shortcode: 'rs', searchAliases: ['reply-snapshot', 'original reply'] },
    'smart-compactor': { purpose: 'Reduce token usage while preserving protected facts.', shortcode: 'cp', searchAliases: ['smart-compactor', 'compaction'] },
    'response-plan': { purpose: 'Plan the next response with user agency and scene continuity.', shortcode: 'rp', searchAliases: ['response-plan', 'planner'] },
    'pattern-scan': { purpose: 'Locate literal matches in narration or dialogue.', shortcode: 'ps', searchAliases: ['pattern-scan', 'literal search'] },
    repair: { purpose: 'Revise prose into guarded patches.', shortcode: 'rr', searchAliases: ['prose repair', 'cleanup'] },
    'validate-patches': { purpose: 'Check patch candidates and protected literals.', shortcode: 'vp', searchAliases: ['validate-patches', 'patch validation'] },
    guidance: { purpose: 'Publish a bounded host instruction.', shortcode: 'gd', searchAliases: ['prompt guidance'] },
    'review-gate': { purpose: 'Approve a candidate before delivery.', shortcode: 'rg', searchAliases: ['review-gate', 'approval'] },
    'apply-reply': { purpose: 'Replace the accepted host response.', shortcode: 'ar', searchAliases: ['apply-reply', 'delivery'] },
    'context-join': { purpose: 'Merge structured contexts through named slots.', shortcode: 'cj', searchAliases: ['context-join', 'combine context'] },
    compose: { purpose: 'Format text from data and named sections.', shortcode: 'co', searchAliases: ['text assembly'] },
    'text-rules': { purpose: 'Replace or extract literal text matches.', shortcode: 'tr', searchAliases: ['text-rules', 'text replacement'] },
    'json-decode': { purpose: 'Decode JSON text or check structured values.', shortcode: 'jd', searchAliases: ['json-decode', 'JSON parser'] },
    'select-fields': { purpose: 'Project selected paths from structured data.', shortcode: 'sf', searchAliases: ['select-fields', 'field projection'] },
}).data;
const variantSearchMetadata = cloneDefinitionData({
    'text-rules:draft': { purpose: 'Produce guarded patches from literal draft rules.', shortcode: 'trd', searchAliases: ['draft replacement'] },
    'json-decode:check': { purpose: 'Check structured values against a JSON schema.', shortcode: 'jdc', searchAliases: ['JSON validation'] },
    'compose:input': { purpose: 'Format a named text section alongside data.', shortcode: 'coi', searchAliases: ['text section'] },
    'compose:guidance': { purpose: 'Format a host instruction from data and sections.', shortcode: 'cog', searchAliases: ['guidance template'] },
}).data;
const queryText = choice => [choice.label, choice.family, choice.purpose, choice.shortcode, ...choice.searchAliases].join(' ').toLocaleLowerCase();

/** Explicit content preparation only. Scope/choices are presentation metadata;
 * the captured adapter and full-root producer still authorize every edit.
 * checkedLibraryEntries are already checked local shelf projections, not definitions to resolve.
 */
export function prepareNativeSearchCatalog(scope, options = {}) {
    const admitted = cloneDefinitionData({ scope, options });
    if (!admitted.ok) return admitted;
    const input = admitted.data.scope, settings = admitted.data.options;
    if (!exact(input, ['schema', 'runtime', 'mode', 'workflowId', 'viewPath', 'inDefinition'])
        || input.schema !== 3 || input.runtime !== 2 || !['native-pre', 'native-post'].includes(input.mode)
        || !text(input.workflowId) || !Array.isArray(input.viewPath) || input.viewPath.length > 8 || !input.viewPath.every(text)
        || typeof input.inDefinition !== 'boolean' || input.inDefinition !== (input.viewPath.length > 0)
        || !exact(settings, ['checkedLibraryEntries']) || settings.checkedLibraryEntries !== undefined && !Array.isArray(settings.checkedLibraryEntries)) return fail('Expected the checked schema-3 scope and local shelf metadata.');
    const phase = input.mode.slice(7), choices = [], commands = new Map();
    const addOperation = (operation, variant, label, controls) => {
        if (operation === 'reroute' || input.inDefinition && rootOnly.has(operation)) return;
        const description = describeOperation(input, { type: 'workflow', ...operationDefaults(operation), ...controls });
        if (!description.ok || description.data.descriptor.phase !== phase) return;
        const id = 'operation:' + operation + (variant ? ':' + variant : '');
        const baseSearch = searchMetadata[operation] ?? { purpose: '', shortcode: '', searchAliases: [operation] }, variantSearch = variantSearchMetadata[operation + ':' + variant];
        const metadata = variantSearch ? { ...variantSearch, searchAliases: [...baseSearch.searchAliases, ...variantSearch.searchAliases] } : baseSearch;
        choices.push({ id, label: label ?? description.data.descriptor.title, family: description.data.descriptor.family, phase, ...metadata,
            ports: description.data.ports.map(portProjection) });
        commands.set(id, freeze({ operation, ...(controls ? { controls: structuredClone(controls) } : {}) }));
    };
    for (const operation of Object.keys(OPERATIONS)) addOperation(operation);
    for (const [operation, variant, label, controls] of presets) addOperation(operation, variant, label, controls);
    const shelfIds = new Set();
    for (const entry of settings.checkedLibraryEntries ?? []) {
        const ref = entry?.definitionRef;
        if (!exact(entry, ['definitionRef', 'name', 'phase', 'ports', 'purpose', 'shortcode', 'searchAliases']) || !text(entry.name) || !['pre', 'post'].includes(entry.phase)
            || !exact(ref, ['id', 'version', 'semanticHash']) || !text(ref.id) || !Number.isSafeInteger(ref.version) || ref.version < 1 || !/^sha256:[0-9a-f]{64}$/.test(ref.semanticHash)
            || !Array.isArray(entry.ports) || entry.ports.length > 1000
            || ['purpose', 'shortcode'].some(key => entry[key] !== undefined && typeof entry[key] !== 'string')
            || entry.searchAliases !== undefined && (!Array.isArray(entry.searchAliases) || entry.searchAliases.some(alias => typeof alias !== 'string'))) return fail('Expected exact checked shelf references and interface descriptors.');
        const portIds = new Set();
        for (const port of entry.ports) {
            if (!exact(port, ['id', 'label', 'direction', 'kind', 'required', 'cardinality']) || !text(port.id) || typeof port.label !== 'string'
                || !['input', 'output'].includes(port.direction) || !ARTIFACT_KINDS.includes(port.kind) || typeof port.required !== 'boolean' || port.cardinality !== 'one' || portIds.has(port.id)) return fail('Expected distinct actual interface ports.');
            portIds.add(port.id);
        }
        const id = 'definition:' + definitionRefKey(ref);
        if (shelfIds.has(id)) return fail('A shelf revision must be unique.');
        shelfIds.add(id);
        if (entry.phase !== phase) continue;
        choices.push({ id, label: entry.name, family: 'Subgraphs', phase, definitionRef: { ...ref }, ports: entry.ports.map(portProjection),
            purpose: entry.purpose ?? 'Reusable saved definition with named interface ports.', shortcode: entry.shortcode ?? 'sg', searchAliases: entry.searchAliases ?? [],
            disabledReason: 'Atomic subgraph creation is not available yet.' });
    }
    const data = freeze({ scope: input, families: [...FAMILIES, 'Subgraphs'], choices });
    registries.set(data, commands);
    return { ok: true, data };
}

export const isNativeSearchCatalog = catalog => registries.has(catalog);

/** Returns an immutable checked primitive preset; unknown/disabled/foreign choices fail closed. */
export function resolveNativeSearchChoice(catalog, id) {
    return registries.get(catalog)?.get(id) ?? null;
}

export function matchNativeSearchPorts(catalog, id, origin) {
    if (!registries.has(catalog)) return [];
    const copied = cloneDefinitionData(origin);
    if (!copied.ok || !validOrigin(copied.data)) return [];
    const choice = catalog.choices.find(item => item.id === id);
    return matchingPorts(choice, copied.data);
}

/** Query and compatibility filtering use only cached descriptors, never describe/validate a graph. */
export function filterNativeSearchChoices(catalog, options = {}) {
    if (!registries.has(catalog)) return [];
    const copied = cloneDefinitionData(options);
    if (!copied.ok || !exact(copied.data, ['query', 'origin', 'contextSensitive'])) return [];
    const { query = '', origin = null, contextSensitive = true } = copied.data;
    if (typeof query !== 'string' || typeof contextSensitive !== 'boolean' || origin !== null && !validOrigin(origin)) return [];
    const needle = query.toLocaleLowerCase().trim();
    return catalog.choices.filter(choice => (!needle || queryText(choice).includes(needle))
        && (!origin || !contextSensitive || matchingPorts(choice, origin).length > 0));
}
