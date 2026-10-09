from pathlib import Path
root = Path(__file__).resolve().parents[3]
def edit(name, fn):
    p=root/name; p.write_text(fn(p.read_text(encoding='utf-8')), encoding='utf-8')
def cut(s, a, b):
    return s[:s.index(a)]+s[s.index(b):]

def surface(s):
    s=s.replace("import { normalizeNativeGraph } from '../workflow/migration.js?v=0.20.0';", "import { cloneWorkflowDocument } from '../workflow/document.js?v=0.20.0';")
    s=s.replace("import * as uiBundle from '../../dist/lattice-ui.js?v=0.20.0';\n", '')
    s=s.replace('isNativeWorkflow, safeWorkflowData, validateWorkflow','isWorkflowGraph, safeWorkflowData')
    s=cut(s,'const legacy =','const choices =')
    s=cut(s,'function projectLegacyWorkflow(', '// Content/host preparation')
    s=s.replace("native: true, phase: '', workflowMode: 'legacy',", "phase: '',")
    s=cut(s,'function candidateOf(', 'function baseWorkflowView(')
    s=s.replace("const native = isNativeWorkflow(graph), phase =", "const phase =")
    s=s.replace("name: graph.name || '', native, phase,", "name: graph.name || '', phase,")
    s=s.replace("workflowMode: settings.workflowMode || 'legacy', ", '')
    s=s.replace("legacy: (legacy[name] || []).map(id => ({ id, title: id === 'memory' ? name === 'Input' ? 'Memory reader' : 'Memory save' : legacyTitles[id] })),\n            ", '')
    s=s.replace('compatible: native && ', 'compatible: ')
    a=s.index("    if (!root || typeof root !== 'object'")
    b=s.index('    const prepared = planner === undefined',a)
    s=s[:a]+"    const cloned = cloneWorkflowDocument(root);\n    if (!cloned.ok) return reject(cloned.error.message);\n    const graph = cloned.data;\n"+s[b:]
    s=cut(s,'function legacyResultView(', '/** Selection/navigation projection')
    s=cut(s,'    if (owner.legacy)', '    const path = safeWorkflowData')
    s=cut(s,'/** Compatibility preparation wrapper.', 'function boundedResult(')
    s=s.replace("if (result?.recording && (result.schema === 3 || result.mode === 'target'))", 'if (result?.recording)')
    s=s.replace("            if (response.schema === 3 || response.mode === 'target') result = boundedResult(response, reviewHandles);\n            else { const { recording: ignored, ...legacyResult } = response; result = freezeCandidate({ ...structuredClone(legacyResult), recording }); }", '            result = boundedResult(response, reviewHandles);')
    s=s.replace("} else if (response.ok === false && (recording || invocation?.graph.schema === 3))", '} else if (response.ok === false)')
    s=s.replace("} else { result = freezeCandidate(structuredClone(response)); reviewHandles = []; availability = 'current'; }", "} else { preparationError = { code: 'RECORDING_REQUIRED', message: 'Current workflow results require an addressed recording.' }; clearAuthority(); availability = recording ? 'superseded' : 'current'; }")
    s=s.replace("if (record.result.schema === 3 && !record.result.recording)", 'if (!record.result.recording)')
    s=s.replace("if (record.result.schema === 3 && availability", 'if (availability')
    s=s.replace('const handle = safeHandle(selector), legacyCandidate = candidateOf(result);','const handle = safeHandle(selector);')
    s=s.replace('captured || legacyCandidate ? runtime()?.candidateStatus?.(captured || legacyCandidate)', 'captured ? runtime()?.candidateStatus?.(captured)')
    a=s.index('            let candidate;\n',s.index('        async apply(selector)'))
    b=s.index('            if (!candidate) return;',a)
    s=s[:a]+"            const handle = safeHandle(selector);\n            const candidate = handle && reviewHandles.find(item => item.handleId === handle.handleId && item.runId === handle.runId && targetKey(item.terminal) === targetKey(handle.terminal));\n            if (!candidate || result.mode !== 'root' || candidate.runId !== result.runId || candidate.terminal.address.workflowId !== rootCurrent()?.id) return;\n"+s[b:]
    s=s.replace('isWorkflowGraph, safeWorkflowData','safeWorkflowData')
    return s
edit('src/ui/workflow-surface.js',surface)

def preparation(s):
    s=s.replace("import { normalizeNativeGraph } from '../workflow/migration.js?v=0.20.0';\n",'')
    s=s.replace('    let planner, composition;\n    if (root.schema === 3 && root.runtime === 2) {\n        const prepared = prepareWorkflowPlanner(root); if (!prepared.ok) return prepared;\n        planner = prepared.data;\n        composition = prepareCompositionViews(root, planner); if (!composition.ok) return composition;\n    } else composition = { ok: true, data: { views: [{ instancePath: [], editable: true, savedGraph: root, effectiveNodes: root.nodes, interface: [], ports: [] }] } };', '    const prepared = prepareWorkflowPlanner(root); if (!prepared.ok) return prepared;\n    const planner = prepared.data;\n    const composition = prepareCompositionViews(root, planner); if (!composition.ok) return composition;')
    s=s.replace(', schema2Selector = null)', ')')
    a=s.index("    const result = workflow.result, sections =")
    b=s.index('    const outputPreview =',a)
    s=s[:a]+"    const result = workflow.result, sections = result ? result.sections.map((section,i) => ({ id: String(i), label: section.kind, ...section })) : [];\n    const selector = editor?.view.identity.kind === 'root' ? result?.selectedReviewHandle ?? null : null;\n"+s[b:]
    s=s.replace('        const normalized = view.savedGraph.schema === 2 ? normalizeNativeGraph(view.savedGraph) : null;\n        const drawBase = structuredClone(normalized?.ok ? normalized.data : view.savedGraph);','        const drawBase = structuredClone(view.savedGraph);')
    s=s.replace("            if (!operation && !wrapper && !boundary) continue;", "            if (node.type === 'note') { drawBase.nativeCards[node.id] = { canonicalTitle: 'Note', family: 'Organization', familyColor: '#a3aa99', iconPath: 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5', body: node.content || '', ports: [], hostResult: false, defaults: {}, controlDescriptors: {}, modelRole: null }; continue; }\n            if (!operation && !wrapper && !boundary) continue;")
    return s
edit('src/ui/workspace-preparation.js',preparation)

def workbench(s):
    for name in ['StatusBar','CanvasControls','DomainSurface']:
        s=s.replace(f"    import {name} from './{name}.svelte';\n",'')
    s=s.replace("armed: false, sideOpen: true, inspectorOpen: true", "armed: false, inspectorOpen: true")
    s=s.replace(", status: { armed: false, warning: false, text: '', overrideTitle: '', chatPinned: false, charPinned: false, charTitle: 'No character selected', isDefault: false }",'')
    s=s.replace('let root: HTMLDivElement, canvasHost: HTMLDivElement, stage: HTMLDivElement;', 'let root: HTMLDivElement, canvasHost: HTMLDivElement, stage: HTMLDivElement, inspector: HTMLDivElement;')
    s=s.replace('; sideBtn: HTMLButtonElement','')
    a=s.index('    let status:'); b=s.index('    export function updateActions',a)
    s=s[:a]+"    export function getParts() { return { root, parts: { ...toolbar.getParts(), inspector, canvasHost } }; }\n"+s[b:]
    s=s.replace('class="pc-root" class:pc-native-workspace={view.workflow?.native} class:pc-native-default={view.nativeDefaultTheme}', 'class="pc-root pc-native-workspace"')
    s=s.replace('    <StatusBar status={view.status} {actions} bind:this={status} />\n','')
    s=s.replace('        <DomainSurface className="pc-sidebar" label="Block library" bind:this={library} />\n','')
    s=s.replace('                    <DomainSurface className="pc-preview" label="Prompt preview" bind:this={preview} />\n','')
    a=s.index('                    {#if view.workflow?.native}<OutputPreview'); b=s.index('\n',a)
    s=s[:a]+'                    <OutputPreview view={view.outputPreview ?? null} actions={actions.outputPreview} collapse={() => collapse(true)} />'+s[b:]
    s=s.replace("role={view.graphViews ? 'tabpanel' : undefined}", 'role="tabpanel"')
    s=s.replace("{#if view.workflow?.native}<div class=\"pc-workspace-run\"><RunMeter view={view.runMeter ?? null} open={() => { overlay = 'run-details'; }} /></div>{/if}", "<div class=\"pc-workspace-run\"><RunMeter view={view.runMeter ?? null} open={() => { overlay = 'run-details'; }} /></div>")
    s=s.replace(' add={(id, legacy) => actions.addNode?.(id, legacy)}',' add={(id) => actions.addNode?.(id)}')
    s=s.replace('                {#if !view.workflow?.native}<CanvasControls camera={view.camera} count={view.selectionCount} {actions} />\n','')
    s=s.replace('hidden={!view.inspectorOpen}>', 'hidden={!view.inspectorOpen} bind:this={inspector}>')
    s=s.replace('{#if view.workflow?.native}<header class="pc-details-heading">','<header class="pc-details-heading">')
    s=s.replace('actions={actions.nodeDetails} />{/if}','actions={actions.nodeDetails} />')
    s=s.replace('            <DomainSurface className="pc-legacy-inspector" label="Selection inspector" bind:this={inspector} />\n','')
    s=s.replace('Library holds personal blocks and saved material. Setup contains workflow examples, phase assignment and role defaults.', 'Setup contains workflow examples, phase assignment and role defaults. Subgraphs manages reusable definitions.')
    a=s.index('<p>File › Import'); b=s.index('</p>',a)+4
    s=s[:a]+'<p>File › Import into graph reviews a same-phase fragment before one undoable insertion. Import workflow opens a separate graph.</p>'+s[b:]
    s=s.replace('    .pc-native-workspace :global(.pc-status) { display: none; }\n','')
    a=s.index('    .pc-native-default {'); b=s.index('\n',a)
    s=s[:a]+s[b:]
    s=s.replace('    .pc-native-workspace :global(.pc-preview) { display: none; }\n','')
    return s
edit('ui/Workbench.svelte',workbench)

def toolbar(s):
    s=s.replace(', sideBtn: HTMLButtonElement','').replace(', sideBtn, inspBtn',', inspBtn')
    s=s.replace('disabled={!workflow?.native || (!workflow?.busy && !!workflow?.issues.length)}', 'disabled={!workflow || (!workflow.busy && !!workflow.issues.length)}')
    s=s.replace("title={workflow?.native ? workflow.issues.join('\\n') || 'Run the root workflow' : 'Install a native workflow example to run'}", "title={workflow?.issues.join('\\n') || 'Run the root workflow'}")
    s=s.replace("{workflow?.native ? `${workflow.phase} · ${workflow.assigned ? 'Assigned' : 'Unassigned'} · ≤ ${workflow.callBound} requests` : 'Legacy prompt'}", "{workflow ? `${workflow.phase} · ${workflow.assigned ? 'Assigned' : 'Unassigned'} · ≤ ${workflow.callBound} requests` : 'Workflow unavailable'}")
    s='\n'.join(line for line in s.split('\n') if 'bind:this={sideBtn}' not in line)
    s=s.replace('aria-label="Canvas"','aria-label="Workflow"')
    return s
edit('ui/Toolbar.svelte',toolbar)

def menus(s):
    s=s.replace('New canvas','New workflow').replace('Import canvas','Import workflow').replace('Export canvas','Export workflow').replace('Duplicate canvas','Duplicate workflow').replace('Rename canvas','Rename workflow').replace('Delete canvas','Delete workflow')
    s=s.replace("...(view.workflow?.native ? [item('Select tool', 'select-tool'), item('Pan tool', 'pan-tool'), item('Zoom in', 'zoom-in'), item('Zoom out', 'zoom-out')] : [])", "item('Select tool', 'select-tool'), item('Pan tool', 'pan-tool'), item('Zoom in', 'zoom-in'), item('Zoom out', 'zoom-out')")
    s=s.replace(", item('Seed from SillyTavern’s current prompt order', 'seed', '', !!view.nativeGraph)",'')
    s=s.replace("item('Library', 'sidebar')", "item('Subgraphs', 'subgraphs')").replace("item('Toggle Library', 'sidebar')", "item('Manage subgraphs', 'subgraphs')")
    s=s.replace("item('Compile prompt', 'preview'), ",'')
    s=s.replace('!rootWorkflow?.native ||', '!rootWorkflow ||')
    s=s.replace("        else if (value === 'preview') { local('show-preview'); actions.preview(); }\n",'')
    return s
edit('ui/WorkspaceMenus.svelte',menus)

def shelf(s):
    s=s.replace('(id: string, legacy: boolean)', '(id: string)').replace('legacy: boolean; ','').replace(' && view?.native','')
    s=s.replace('legacy: false, ','')
    s='\n'.join(line for line in s.split('\n') if 'data.legacy.map' not in line)
    s=s.replace('add(entry.id, entry.legacy)','add(entry.id)')
    s=s.replace('const scope = view?.graphId, native = view?.native, catalog = choices; void scope; void native; void catalog;', 'const scope = view?.graphId, catalog = choices; void scope; void catalog;')
    return s
edit('ui/NodeShelf.svelte',shelf)

def setup(s):
    s='\n'.join(line for line in s.split('\n') if 'Workflow mode<select' not in line and '{#if view.native}' not in line)
    s=s.replace('    {/if}\n    <h3>Workflow examples</h3>', '    <h3>Workflow examples</h3>')
    s=s.replace('Assign {view.phase} phase and enable native mode','Assign {view.phase} phase')
    return s
edit('ui/WorkflowSetup.svelte',setup)
edit('ui/GraphTabs.svelte', lambda s: cut(s, '{:else}\n    <nav', '{/if}\n<style>'))
edit('ui/entry.js',lambda s: cut(s.replace("import WorkflowSurface from './WorkflowSurface.svelte';\n",''),'\n\nexport function mountWorkflowSurface(', '\n') if False else s[:s.index('\n\nexport function mountWorkflowSurface(')].replace("import WorkflowSurface from './WorkflowSurface.svelte';\n",''))
edit('ui/detail-types.ts',lambda s: s.replace("export interface DetailSchema2ReviewSelector { kind: 'schema2-candidate'; reviewId: string; terminal: { kind: 'terminal'; address: DetailNodeAddress }; }\n",'').replace('DetailHandleReviewSelector | DetailSchema2ReviewSelector','DetailHandleReviewSelector'))
for name in ['src/ui/domain-surfaces.js','src/ui/graph-analysis.js','ui/DomainSurface.svelte','ui/StatusBar.svelte','ui/CanvasControls.svelte','ui/WorkflowSurface.svelte']:
    (root/name).unlink()
