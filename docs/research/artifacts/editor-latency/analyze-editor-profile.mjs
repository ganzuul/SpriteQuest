import { readFileSync } from 'node:fs';

// Sampled, exclusive phase attribution; inclusive stacks must not be summed.
const profile = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const nodes = new Map(profile.nodes.map(node => [node.id, node]));
const parents = new Map();
for (const node of profile.nodes) for (const child of node.children ?? []) {
    if (parents.has(child) && parents.get(child) !== node.id) throw Error(`Multiple parents for ${child}`);
    parents.set(child, node.id);
}
if (profile.samples.length !== profile.timeDeltas.length) throw Error('Sample/timeDelta count mismatch');
const sourcePath = node => (node.callFrame.url ?? '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
const label = node => `${node.callFrame.functionName || '(anonymous)'} @ ${sourcePath(node) || '(runtime)'}:${node.callFrame.lineNumber + 1}`;

function phase(node) {
    const fn = node.callFrame.functionName || '', url = sourcePath(node), line = node.callFrame.lineNumber + 1;
    if (url === '/src/workflow/document-file.js' || url === '/src/ui/document-session.js' ||
        (url === '/src/state.js' && /^(persistRecovery|save|setActiveWorkspaceViews)$/.test(fn)) ||
        (url === '/src/ui/controller.js' && (/^(persistGraphViews|renderDocumentState)$/.test(fn) || (fn === 'snapshot' && line >= 194 && line <= 209)))) return 'persistence';
    if (url === '/src/ui/workspace-preparation.js' ||
        (url === '/src/ui/workflow-surface.js' && /^(prepareWorkflowProjection|baseWorkflowView|projectPreparedWorkflow|cachedRows|boundedSections|prepareRecordedAliases|previewChoicesFor|historicalPreviewTarget|safeSettlement|safeHandle)$/.test(fn)) ||
        (url === '/src/ui/controller.js' && /^(prepareWorkspaceDocument|refreshWorkspaceDocument|refreshWorkflowPreparation|workspaceInputs|workflowView|updateWorkflowProjection|recallSetupView|refreshRecallOverview)$/.test(fn)) ||
        (url === '/src/ui/graph-view-session.js' && /^(prepareCache|cloneDTO|replacePreparedViews)$/.test(fn)) ||
        url === '/src/library.js' || url === '/src/ui/native-search-catalog.js' ||
        (url === '/src/workflow/resolve.js' && fn === 'prepareWorkflowPlanner')) return 'preparation';
    if (url === '/src/workflow/transactions.js' || url === '/src/workflow/prepared-graph-edit.js' ||
        url === '/src/history.js' || url === '/src/workflow/definition-library.js' ||
        (url === '/src/ui/controller.js' && /^(captureEditor|detailCapture|commitCaptured|prepareScopeMutation|prepareNode|editModifiers|editControl|editBinding|editField|syncNativeRevision|editorCurrent|scopeCommand|onSemanticChange)$/.test(fn))) return 'transaction';
    if (url === '/dist/lattice-ui.js' || url === '/src/canvas.js' || url.startsWith('/src/canvas/')) return 'render';
    return null;
}

const categories = new Map(), owners = new Map(), leaves = new Map(), otherLeaves = new Map();
let totalUs = 0;
const add = (map, key, us) => map.set(key, (map.get(key) ?? 0) + us);
for (let i = 0; i < profile.samples.length; i++) {
    const deltaUs = profile.timeDeltas[i];
    if (!Number.isFinite(deltaUs) || deltaUs < 0) throw Error(`Invalid timeDelta ${i}`);
    const chain = [], visited = new Set();
    let id = profile.samples[i];
    while (id !== undefined) {
        if (visited.has(id)) throw Error(`Cycle at ${id}`);
        visited.add(id);
        const node = nodes.get(id);
        if (!node) throw Error(`Unknown sampled node ${id}`);
        chain.push(node); // Leaf first: shared validators inherit their caller.
        id = parents.get(id);
    }
    const owner = chain.find(node => phase(node) !== null), category = owner ? phase(owner) : 'other';
    totalUs += deltaUs;
    add(categories, category, deltaUs);
    add(owners, `${category} | ${label(owner ?? chain[0])}`, deltaUs);
    add(leaves, `${category} | ${label(chain[0])}`, deltaUs);
    if (category === 'other') add(otherLeaves, label(chain[0]), deltaUs);
}
const rows = map => [...map].sort((a,b) => b[1]-a[1]).map(([name,us]) => ({name,ms:Math.round(us/1000*100)/100,percent:Math.round(us/totalUs*10000)/100}));
console.log(JSON.stringify({
    sampleCount:profile.samples.length,
    profileDurationMs:(profile.endTime-profile.startTime)/1000,
    sampledIntervalMs:totalUs/1000,
    categories:rows(categories),
    phaseOwners:rows(owners),
    topExclusiveLeaves:rows(leaves).slice(0,30),
    otherLeaves:rows(otherLeaves),
},null,2));
