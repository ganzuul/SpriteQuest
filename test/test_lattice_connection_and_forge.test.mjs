/**
 * test/test_lattice_connection_and_forge.test.mjs
 *
 * Dedicated Test Suite verifying:
 *   1. Lattice Workflow Graph Validation: `workflows/asset-forge.lattice.json` is a strictly valid
 *      Lattice schema 3 / runtime 2 / native-unified workflow graph.
 *   2. Lattice Workflow Execution: `runWorkflow` executes the graph and transforms prompts.
 *   3. Interface Dynamic Recompile & Prompt Rewrite: Selecting props and triggering compile
 *      dynamically updates the prompt, reflecting live Cartographer curation and criticism changes.
 *   4. Actor Recompile for Hollis and Pell: NPC declarations compile with authentic fragments.
 *   5. Telemetry & Terminal Logs: Interface records comprehensive [LATTICE] pipeline stages.
 */

import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import { JSDOM } from 'jsdom';

import { validateWorkflow } from '../src/workflow/contracts.js';
import { runWorkflow } from '../src/workflow/runtime.js';

const REPO_ROOT = path.resolve('.');

function nodeWorkerFactory(entryURL) {
  const worker = new Worker(new URL('../tests/fixtures/text-rules-node-worker.mjs', import.meta.url), {
    workerData: { entryURL: entryURL?.href },
  });
  const handlers = new Map();
  return {
    addEventListener(type, fn) {
      const handler = type === 'message' ? (data) => {
        if (!data.fixtureStarted) fn({ data });
      } : (error) => fn({ error });
      handlers.set(fn, { type, handler });
      worker.on(type, handler);
    },
    removeEventListener(type, fn) {
      const item = handlers.get(fn);
      if (item) {
        worker.off(type, item.handler);
        handlers.delete(fn);
      }
    },
    postMessage(data) {
      worker.postMessage(data);
    },
    terminate() {
      return worker.terminate();
    },
  };
}

describe('Interface Connection with Lattice & Prompt Rewrite Pipeline (TDD)', () => {
  let dom;
  let window;
  let document;
  let viewer;
  let rawWorkflow;

  before(async () => {
    // 1. Load standalone HTML preview
    const htmlPath = path.join(REPO_ROOT, 'renders/maps/border-march/index.html');
    const rawHtml = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(rawHtml, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
    });
    window = dom.window;
    document = window.document;

    window.HTMLCanvasElement.prototype.getContext = () => ({
      createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }),
      putImageData: () => {},
      clearRect: () => {},
      drawImage: () => {},
      createRadialGradient: () => ({ addColorStop: () => {} }),
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
    });

    const scriptMatch = rawHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
    window.eval(scriptMatch);
    viewer = window.viewer;

    // 2. Load Lattice workflow definition
    const wfPath = path.join(REPO_ROOT, 'workflows/asset-forge.lattice.json');
    rawWorkflow = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  });

  test('1. Asset Forge Lattice Workflow is Valid under Lattice Schema 3 Contracts', () => {
    assert.equal(rawWorkflow.kind, 'lattice-workflow');
    assert.equal(rawWorkflow.schema, 2);

    const graph = rawWorkflow.graph;
    assert.equal(graph.id, 'asset-forge');
    assert.equal(graph.schema, 3);
    assert.equal(graph.runtime, 2);
    assert.equal(graph.mode, 'native-unified');

    // Validate using Lattice core contracts
    const validation = validateWorkflow(graph);
    assert.equal(validation.ok, true, `Workflow validation failed: ${JSON.stringify(validation.error)}`);

    // Verify key nodes
    const nodes = graph.nodes;
    assert.ok(nodes['select-asset'], 'Must contain select-asset node');
    assert.ok(nodes['read-world-fragments'], 'Must contain read-world-fragments node');
    assert.ok(nodes['cartographer-coherence-gate'], 'Must contain cartographer-coherence-gate node');
    assert.ok(nodes['compile-world-brief'], 'Must contain compile-world-brief node');
    assert.ok(nodes['rewrite-prompt'], 'Must contain rewrite-prompt node');
    assert.ok(nodes['format-flux3-conditioning'], 'Must contain format-flux3-conditioning node');
    assert.ok(nodes['generate'], 'Must contain generate node');
    assert.ok(nodes['forge-dispatch'], 'Must contain forge-dispatch node');

    // Verify wires
    const wires = Object.values(graph.wires);
    assert.ok(wires.length >= 5, 'Must contain at least 5 interconnecting wires');
  });

  test('2. Lattice Runtime Executes Asset Forge Workflow Pipeline', async () => {
    // Construct execution graph with input brief data
    const execGraph = structuredClone(rawWorkflow.graph);

    // Isolate the core compiler-rewriter subgraph for standalone in-memory execution
    delete execGraph.nodes['read-prop-spec'];
    delete execGraph.nodes['read-world-fragments'];
    delete execGraph.nodes['cartographer-coherence-gate'];
    delete execGraph.wires['wire-spec-brief'];
    delete execGraph.wires['wire-gate-conditioning'];

    // Provide compile-world-brief sections for standalone execution
    execGraph.nodes['compile-world-brief'].sections = [
      { name: 'doctrine', text: 'Hollis Ledger Desk', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'zone', text: 'Weigh & Inspection Hall', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['compile-world-brief'].template = 'Subject: {{section:doctrine}}\nHost Zone: {{section:zone}}';

    const target = {
      workflowId: execGraph.id,
      instancePath: [],
      nodeId: 'rewrite-prompt',
      portId: 'out',
    };

    const runResult = await runWorkflow(execGraph, {
      target,
      createWorker: nodeWorkerFactory,
    });

    assert.equal(runResult.ok, true, `runWorkflow failed: ${JSON.stringify(runResult.error)}`);

    // Verify rewrite-prompt output artifact
    const outputArtifact = runResult.recording.artifacts.find(
      (a) => a.kind === 'text' && a.value?.text?.includes('orthographic top-down 2.5D isometric game asset cutout')
    );
    assert.ok(outputArtifact, 'Output artifact must exist');
    assert.match(outputArtifact.value.text, /orthographic top-down 2\.5D isometric game asset cutout, Hollis Ledger Desk/);
    assert.match(outputArtifact.value.text, /Host Zone: Weigh & Inspection Hall/);
  });

  test('3. Interface Triggers Dynamic Recompile & Prompt Rewrite upon State Changes', () => {
    // 1. Select unrendered prop
    const asset = viewer.selectAsset('r6_ship_crate_standard');
    assert.ok(asset);

    // 2. Initial compile
    const initialCompile = viewer.compileSelectedAssetBrief();
    assert.equal(initialCompile.success, true);
    assert.equal(initialCompile.status, 'compiled');
    const initialPrompt = initialCompile.prompt;
    assert.ok(initialPrompt.length > 50);
    assert.match(initialPrompt, /orthographic top-down 2\.5D isometric/);
    assert.match(initialPrompt, /R6-SHIP/);

    // 3. Authorial Curation: Curate a fragment through Cartographers ledger
    const curateRes = viewer.curateAssetFragment(
      'r6_ship_crate_standard',
      'customs-house/r6-ship',
      'reinforced cold-rolled iron bands with official Customs House Wax Seal'
    );
    assert.equal(curateRes.success, true);
    assert.equal(curateRes.standing_tier, 'warranted');

    // 4. Re-trigger compilation via the interface
    const recompileRes = viewer.compileSelectedAssetBrief();
    assert.equal(recompileRes.success, true);
    assert.notEqual(recompileRes.prompt, initialPrompt, 'Prompt must dynamically update after curation');
    assert.match(recompileRes.prompt, /Canon warrant:/i, 'Recompiled prompt must reflect the Canon Warrant');

    // 5. Authorial Criticism: Criticize a fragment
    const critRes = viewer.criticizeAssetFragment(
      'r6_ship_crate_standard',
      'customs-house/r6-ship',
      'Reject exposed zinc nails; only forged iron corner brackets permitted'
    );
    assert.equal(critRes.success, true);

    // 6. Re-trigger compilation again
    const postCritCompile = viewer.compileSelectedAssetBrief();
    assert.notEqual(postCritCompile.prompt, recompileRes.prompt, 'Prompt must dynamically update after criticism');
    assert.match(postCritCompile.prompt, /Authorial criticisms:/i, 'Recompiled prompt must incorporate criticisms');
  });

  test('4. Actor Recompile Pipeline Authentically Compiles Hollis and Pell', () => {
    // 1. Hollis the Twice-Written
    viewer.selectAsset('hollis');
    const hollisRes = viewer.compileSelectedAssetBrief();
    assert.equal(hollisRes.success, true);
    assert.match(hollisRes.prompt, /quartermaster/i);
    assert.match(hollisRes.prompt, /ledger/i);
    assert.match(hollisRes.prompt, /16-bit pixel aesthetic/);

    // 2. Pell the Underwritten
    viewer.selectAsset('pell');
    const pellRes = viewer.compileSelectedAssetBrief();
    assert.equal(pellRes.success, true);
    assert.match(pellRes.prompt, /understudy/i);
    assert.match(pellRes.prompt, /rehearsal/i);
    assert.match(pellRes.prompt, /pool of light|spotlight/i);
  });

  test('5. Telemetry & Log Terminal Captures Complete Lattice Workflow Lifecycle', () => {
    const logs = viewer.getLogs();
    const latticeLogs = logs.filter((l) => l.category === 'LATTICE');

    // Must record all 6 pipeline stages
    assert.ok(latticeLogs.some((l) => l.message.includes('select-asset')), 'Must log [select-asset] stage');
    assert.ok(latticeLogs.some((l) => l.message.includes('cartographer-coherence-gate')), 'Must log [cartographer-coherence-gate] stage');
    assert.ok(latticeLogs.some((l) => l.message.includes('compile-world-brief')), 'Must log [compile-world-brief] stage');
    assert.ok(latticeLogs.some((l) => l.message.includes('rewrite-prompt')), 'Must log [rewrite-prompt] stage');
    assert.ok(latticeLogs.some((l) => l.message.includes('format-flux3-conditioning')), 'Must log [format-flux3-conditioning] stage');
    assert.ok(latticeLogs.some((l) => l.message.includes('Activating workflow')), 'Must log workflow activation');
  });

  test('6. CORS & Forge Service Endpoint Resolution & Graceful Offline Handling', async () => {
    // 1. Endpoint resolution
    assert.equal(typeof viewer.getForgeServiceUrl, 'function');
    assert.equal(viewer.getForgeServiceUrl(), 'http://127.0.0.1:8788');

    // 2. Custom override via window.FORGE_SERVICE_URL
    window.FORGE_SERVICE_URL = 'http://127.0.0.1:9999';
    assert.equal(viewer.getForgeServiceUrl(), 'http://127.0.0.1:9999');
    delete window.FORGE_SERVICE_URL;

    // 3. Graceful offline probe handling
    assert.equal(typeof viewer.checkForgeServer, 'function');
    const isOnline = await viewer.checkForgeServer('http://127.0.0.1:18788');
    assert.equal(isOnline, false, 'Unreachable port returns false without throwing');
    const statusEl = document.getElementById('log-forge-status');
    if (statusEl) {
      assert.match(statusEl.textContent, /Local/i, 'Status reflects local fallback when forge service is offline');
    }

    // 4. Remote compile sync handles offline/CORS gracefully
    const compRes = viewer.compileAssetBrief('r6_ship_crate_standard', { remote: true });
    assert.equal(compRes.success, true, 'Compilation succeeds locally even when remote daemon is offline');
    assert.ok(compRes.prompt.length > 50, 'Generates valid diffusion prompt locally');
  });

  test('7. SillyTavern Map Launcher & Overlay Integration', () => {
    const indexPath = path.resolve('./index.js');
    const indexCode = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(indexCode.includes('function addMapSendbarButton'), 'index.js must define addMapSendbarButton');
    assert.ok(indexCode.includes('export async function openMapModal'), 'index.js must export openMapModal');
    assert.ok(indexCode.includes('sq-map-sendbar'), 'index.js must create sq-map-sendbar button');
    assert.ok(indexCode.includes('sq-map-overlay'), 'index.js must define sq-map-overlay container');
    assert.ok(indexCode.includes('sq-menu-map-launch'), 'index.js must add map launcher to extension menu');

    const stylePath = path.resolve('./style.css');
    const styleCode = fs.readFileSync(stylePath, 'utf-8');
    assert.ok(styleCode.includes('#sq-map-sendbar'), 'style.css must style sq-map-sendbar launcher');
    assert.ok(styleCode.includes('.sq-map-overlay'), 'style.css must style sq-map-overlay modal');
  });

  test('8. Outdoor Ruin Primitives Trigger Dynamic Lattice Prompt Refinement', () => {
    // 1. Switch to Overhang Bastion scene
    viewer.selectScene('consignment-overhang-bastion');
    const sc = viewer.getCurrentScene();
    assert.equal(sc.id, 'consignment-overhang-bastion');

    // 2. Select ancient-bastion outdoor ruin
    const item = viewer.selectScenePrimitive('ancient-bastion');
    assert.ok(item, 'Must select ancient-bastion primitive');

    // 3. Compile asset brief via Lattice
    const compRes = viewer.compileSelectedAssetBrief();
    assert.equal(compRes.success, true);
    assert.ok(compRes.prompt.includes('45-degree cantilever overhang rule'), 'Must weave 45-degree cantilever rule');
    assert.ok(compRes.prompt.includes('cyclopean'), 'Must weave cyclopean masonry');
    assert.ok(compRes.prompt.includes('image diffusion render'), 'Must condition for image diffusion');

    // 4. Verify sidebar DOM prompt element is populated
    const promptEl = document.getElementById('sidebar-preview-prompt');
    if (promptEl) {
      assert.ok(promptEl.textContent.includes('45-degree cantilever overhang rule'), 'DOM must display refined prompt');
    }
  });

  test('9. Left Sidebar Collapsibility, Staging Palette, & Multi-Representation Facet Inspection', () => {
    // 1. Vertical section collapsibility
    assert.equal(typeof viewer.toggleSidebarSection, 'function');
    assert.equal(typeof viewer.isSidebarSectionCollapsed, 'function');

    // Initially expanded
    assert.equal(viewer.isSidebarSectionCollapsed('sidebar-scene-picker'), false);

    // Toggle collapse
    viewer.toggleSidebarSection('sidebar-scene-picker');
    assert.equal(viewer.isSidebarSectionCollapsed('sidebar-scene-picker'), true);

    const pickerEl = document.getElementById('sidebar-scene-picker');
    if (pickerEl) {
      assert.ok(pickerEl.classList.contains('is-collapsed'), 'DOM element must have is-collapsed class');
    }

    // Toggle back to expanded
    viewer.toggleSidebarSection('sidebar-scene-picker');
    assert.equal(viewer.isSidebarSectionCollapsed('sidebar-scene-picker'), false);

    // 2. Staging Palette availability
    assert.equal(typeof viewer.getStagingPalette, 'function');
    const palette = viewer.getStagingPalette();
    assert.equal(Array.isArray(palette), true);
    assert.equal(palette.length, 5, 'Must provide all 5 outdoor ruin primitives in the staging palette');

    const ruinKeys = palette.map((p) => p.id);
    assert.ok(ruinKeys.includes('ancient-bastion'));
    assert.ok(ruinKeys.includes('relic-cairn'));
    assert.ok(ruinKeys.includes('wish-stone-slab'));
    assert.ok(ruinKeys.includes('ruined-watchtower'));
    assert.ok(ruinKeys.includes('ancient-ruin-terrace'));

    // 3. Staging and inspecting an outdoor ruin before placement
    const selected = viewer.selectScenePrimitive('ruined-watchtower');
    assert.ok(selected, 'Must be able to select ruined-watchtower from staging catalogue');
    assert.equal(selected.id, 'ruined-watchtower');
    assert.equal(selected.overhang_constrained, true);

    // 4. Multi-Representation Facet toggling
    assert.equal(typeof viewer.setPreviewFacet, 'function');
    assert.equal(typeof viewer.getPreviewFacet, 'function');

    // Default facet is sprite
    assert.equal(viewer.getPreviewFacet(), 'sprite');

    // Toggle to 5-cell collage
    viewer.setPreviewFacet('collage');
    assert.equal(viewer.getPreviewFacet(), 'collage');
    const previewImg = document.getElementById('sidebar-preview-img');
    if (previewImg) {
      assert.ok(previewImg.src.includes('collage.png'), 'Image src must point to 5-cell collage');
    }

    // Toggle to 3D depth template
    viewer.setPreviewFacet('depth');
    assert.equal(viewer.getPreviewFacet(), 'depth');

    // Toggle to physics collider
    viewer.setPreviewFacet('collider');
    assert.equal(viewer.getPreviewFacet(), 'collider');

    // Toggle back to sprite
    viewer.setPreviewFacet('sprite');
    assert.equal(viewer.getPreviewFacet(), 'sprite');

    // 5. Quality & Slicing Metrics Badges in DOM
    const metaEl = document.getElementById('sidebar-preview-meta');
    if (metaEl) {
      assert.ok(metaEl.innerHTML.includes('45° Overhang Rule'), 'Must verify 45-degree overhang constraint');
      assert.ok(metaEl.innerHTML.includes('CoACD'), 'Must verify CoACD collision pieces');
      assert.ok(metaEl.innerHTML.includes('Solid Skirt'), 'Must verify watertight base grounding skirt');
    }
  });

  test('10. Gemma4-Orion Prompt Refinement Pass & Dedicated 3D Pipeline Button', async () => {
    // 1. Select outdoor ruin primitive: ancient-bastion
    const selected = viewer.selectScenePrimitive('ancient-bastion');
    assert.ok(selected, 'Must select ancient-bastion');

    // 2. Compile button triggers fragment gathering & gemma4-orion prompt refinement
    assert.equal(typeof viewer.compileSelectedAssetBrief, 'function');
    assert.equal(typeof viewer.compileAssetBrief, 'function');

    const compileResult = viewer.compileSelectedAssetBrief();
    assert.ok(compileResult, 'Compile result must not be null');
    assert.equal(compileResult.success, true);
    assert.equal(compileResult.status, 'compiled');
    assert.equal(compileResult.rewriter, 'gemma4-orion');

    // Verify fragment gathering (both visual fragments and doctrine fragments where for: gemma4-orion)
    assert.ok(Array.isArray(compileResult.fragments_used), 'Fragments used must be an array');
    assert.ok(compileResult.fragments_used.some((f) => f.includes('grey-wind/named-ruins')), 'Must gather visual fragment grey-wind/named-ruins');
    assert.ok(compileResult.fragments_used.some((f) => f.includes('single-face-reading')), 'Must gather doctrine fragment shared/single-face-reading');
    assert.ok(compileResult.fragments_used.some((f) => f.includes('secondary-growth-is-not-a-pair')), 'Must gather doctrine fragment shared/secondary-growth-is-not-a-pair');

    // Verify gemma4-orion prompt synthesis content
    const prompt = compileResult.prompt;
    assert.ok(prompt.includes('single front isometric elevation displaying primary visible face'), 'Must enforce single-face reading doctrine');
    assert.ok(prompt.includes('asymmetric alpine lichen patina'), 'Must enforce asymmetric weathering rule');
    assert.ok(prompt.includes('45-degree cantilever'), 'Must incorporate 45-degree cantilever overhang rule');
    assert.ok(prompt.includes('image diffusion render, 1024x1024'), 'Must condition for image diffusion');

    // Verify DOM was updated with the refined prompt
    const promptEl = document.getElementById('sidebar-preview-prompt');
    if (promptEl) {
      assert.equal(promptEl.textContent, prompt, 'Sidebar preview prompt must reflect gemma4-orion rewrite');
      assert.ok(promptEl.classList.contains('prompt-updated-flash'), 'Prompt box must trigger flash animation');
    }

    // 3. Dedicated 3D Pipeline Button Verification
    assert.equal(typeof viewer.runPrimitive3DPipeline, 'function', 'Must export runPrimitive3DPipeline function');
    const btn3D = document.getElementById('btn-sidebar-3d-pipeline');
    if (btn3D) {
      assert.ok((btn3D.textContent || '').includes('3D Pipeline'), 'Button must display 3D Pipeline label');
    }

    // Run 3D Pipeline on ancient-bastion
    const pipeResult = viewer.runPrimitive3DPipeline('ancient-bastion', { remote: false });
    assert.ok(pipeResult, '3D Pipeline result must exist');
    assert.equal(pipeResult.success, true);
    assert.equal(pipeResult.status, 'depth_generated');
    assert.equal(pipeResult.primitive_id, 'ancient-bastion');
    assert.equal(pipeResult.depth_url, 'renders/primitives/ancient-bastion-depth.png');
    assert.equal(pipeResult.facet, 'depth');

    // Verify facet was automatically switched to 3D Depth
    assert.equal(viewer.getPreviewFacet(), 'depth', '3D Pipeline must switch preview facet to depth');

    // Verify preview image src is the high-detail depth map
    const previewImg = document.getElementById('sidebar-preview-img');
    if (previewImg) {
      assert.equal(previewImg.src, 'renders/primitives/ancient-bastion-depth.png', 'Preview image must show 3D depth map');
    }

    // 4. Verify depth maps for all 5 outdoor ruin primitives
    const ruins = ['ancient-bastion', 'relic-cairn', 'wish-stone-slab', 'ruined-watchtower', 'ancient-ruin-terrace'];
    for (const rid of ruins) {
      const item = viewer.selectScenePrimitive(rid);
      assert.ok(item);
      viewer.setPreviewFacet('depth');
      if (previewImg) {
        assert.equal(previewImg.src, `renders/primitives/${rid}-depth.png`, `Ruin ${rid} depth map must resolve to high-detail PNG`);
      }
    }
  });

  test('11. Interactive 3D Mesh Inspection & Facet Resolution', async () => {
    // 1. Select generated/reconstructed ruin: relic-cairn / prop-relic-cairn
    const selected = viewer.selectScenePrimitive('relic-cairn') || viewer.selectScenePrimitive('prop-relic-cairn');
    assert.ok(selected, 'Must select relic-cairn');

    // 2. Facet tab buttons present in DOM
    const tabMesh = document.getElementById('facet-tab-mesh');
    assert.ok(tabMesh, '🧊 3D Mesh facet tab button must exist in sidebar');

    // 3. Switch to 3D Mesh facet
    viewer.setPreviewFacet('mesh');
    assert.equal(viewer.getPreviewFacet(), 'mesh', 'Preview facet must be mesh');

    // 4. Verify 3D container visibility and 2D image suppression
    const previewImg = document.getElementById('sidebar-preview-img');
    const wrap3D = document.getElementById('sidebar-3d-wrap');
    if (previewImg && wrap3D) {
      assert.equal(previewImg.style.display, 'none', '2D image must be hidden when viewing 3D mesh');
      assert.equal(wrap3D.style.display, 'flex', '3D wrapper must be active when viewing 3D mesh');
    }

    // 5. 3D Model URL Resolution
    assert.equal(typeof viewer.getFacet3DModelForItem, 'function');
    const model = viewer.getFacet3DModelForItem(selected, 'mesh');
    assert.ok(model, '3D model object must resolve');
    assert.ok(model.glb.includes('relic-cairn-lowpoly.glb'), 'Mesh GLB must resolve to lowpoly GLB');
    assert.ok(model.stl.includes('relic-cairn.stl'), 'STL URL must resolve to watertight STL solid');

    // 6. Camera reset controls
    assert.equal(typeof viewer.reset3DCamera, 'function');
    viewer.reset3DCamera('sidebar');

    // 7. Lightbox inspection with 3D mesh facet
    assert.equal(typeof viewer.openPrimitiveLightbox, 'function');
    viewer.openPrimitiveLightbox(selected.id, 'mesh');
    const lightbox3dWrap = document.getElementById('lightbox-3d-wrap');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox3dWrap && lightboxImg) {
      assert.equal(lightboxImg.style.display, 'none', 'Lightbox 2D image must be hidden when viewing 3D mesh');
      assert.equal(lightbox3dWrap.style.display, 'flex', 'Lightbox 3D wrapper must be active when viewing 3D mesh');
    }
    viewer.closePrimitiveLightbox();

    // 8. Update primitive record synchronizes across all registries
    viewer.updatePrimitiveRecord('relic-cairn', {
      source_triangles: 1061696,
      triangle_count: 5200,
    });
    const refreshed = viewer.getSelectedScenePrimitive();
    assert.equal(refreshed.source_triangles, 1061696);
    assert.equal(refreshed.triangle_count, 5200);
  });
});
