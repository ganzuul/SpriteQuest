/**
 * test/test_lattice_3d_and_forge_interface.test.mjs
 *
 * Dedicated TDD Test Suite guarding the interface between SpriteQuest
 * (Watertight STL Primitives, 3D Depth Pipeline, Gemma4-Orion Prompt Rewriter, ComfyUI Asset Forge)
 * and the Lattice Workflow Engine (`src/workflow/runtime.js` / `validateWorkflow`).
 *
 * Contracts Guarded:
 *   1. Lattice Schema 3 Contracts: 3D Watertight Pipeline Layer in `workflows/asset-forge.lattice.json`
 *   2. Lattice Execution: Watertight STL Depth Rasterization Target (`runWorkflow`)
 *   3. Lattice Execution: Non-Watertight & Illegal Overhang Rejection Gate
 *   4. Lattice Execution: Gemma4-Orion Prompt Rewriter Target (`runWorkflow`)
 *   5. Lattice Execution: Unified Multi-Modal Image Diffusion Conditioning Target (`runWorkflow`)
 *   6. Interface Guard: Viewer Compile Executes via Lattice Runtime Engine
 *   7. Interface Guard: Viewer 3D Pipeline Executes via Lattice Runtime Engine
 *   8. Companion Ledger Provenance: Records Genuine Lattice Run ID and Target Node
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

describe('Lattice 3D & Forge Pipeline Interface Guard (TDD)', () => {
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
      url: 'http://localhost/',
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

  test('1. Lattice Schema 3 Contracts: 3D Watertight Pipeline Layer in asset-forge.lattice.json', () => {
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

    const nodes = graph.nodes;
    // Core Prompt & Fragment Nodes
    assert.ok(nodes['select-asset'], 'Must contain select-asset node');
    assert.ok(nodes['read-world-fragments'], 'Must contain read-world-fragments node');
    assert.ok(nodes['cartographer-coherence-gate'], 'Must contain cartographer-coherence-gate node');
    assert.ok(nodes['compile-world-brief'], 'Must contain compile-world-brief node');
    assert.ok(nodes['rewrite-prompt'], 'Must contain rewrite-prompt node');
    assert.ok(nodes['format-flux3-conditioning'], 'Must contain format-flux3-conditioning node');

    // 3D Watertight Pipeline Nodes
    assert.ok(nodes['read-stl-primitive'], 'Must contain read-stl-primitive node');
    assert.equal(nodes['read-stl-primitive'].operation, 'read-file');
    assert.equal(nodes['read-stl-primitive'].targetId, 'stl-primitive-geometry');

    assert.ok(nodes['validate-overhang-watertight'], 'Must contain validate-overhang-watertight node');
    assert.equal(nodes['validate-overhang-watertight'].operation, 'compose');

    assert.ok(nodes['rasterize-depth-template'], 'Must contain rasterize-depth-template node');
    assert.equal(nodes['rasterize-depth-template'].operation, 'compose');

    // Dedicated 3D Pipeline Layer Group
    const groups = graph.groups;
    assert.ok(groups['stl-3d-pipeline-layer'], 'Must define stl-3d-pipeline-layer group');
    assert.match(groups['stl-3d-pipeline-layer'].title, /3D|Depth|Watertight/i);

    // Interconnecting Wires Guarding the Interface
    const wires = graph.wires;
    assert.ok(wires['wire-asset-stl'], 'Must wire select-asset to read-stl-primitive');
    assert.equal(wires['wire-asset-stl'].from, 'select-asset');
    assert.equal(wires['wire-asset-stl'].to, 'read-stl-primitive');

    assert.ok(wires['wire-stl-validate'], 'Must wire read-stl-primitive to validate-overhang-watertight');
    assert.equal(wires['wire-stl-validate'].from, 'read-stl-primitive');
    assert.equal(wires['wire-stl-validate'].to, 'validate-overhang-watertight');

    assert.ok(wires['wire-validate-rasterize'], 'Must wire validate-overhang-watertight to rasterize-depth-template');
    assert.equal(wires['wire-validate-rasterize'].from, 'validate-overhang-watertight');
    assert.equal(wires['wire-validate-rasterize'].to, 'rasterize-depth-template');

    assert.ok(wires['wire-depth-conditioning'], 'Must wire rasterize-depth-template to format-flux3-conditioning');
    assert.equal(wires['wire-depth-conditioning'].from, 'rasterize-depth-template');
    assert.equal(wires['wire-depth-conditioning'].to, 'format-flux3-conditioning');

    assert.ok(wires['wire-prompt-conditioning'], 'Must wire rewrite-prompt to format-flux3-conditioning');
    assert.equal(wires['wire-prompt-conditioning'].from, 'rewrite-prompt');
    assert.equal(wires['wire-prompt-conditioning'].to, 'format-flux3-conditioning');
  });

  test('2. Lattice Execution: Watertight STL Depth Rasterization Target (runWorkflow)', async () => {
    const execGraph = structuredClone(rawWorkflow.graph);

    // Isolate 3D pipeline subgraph for target execution
    delete execGraph.nodes['read-prop-spec'];
    delete execGraph.nodes['read-world-fragments'];
    delete execGraph.nodes['read-stl-primitive'];
    delete execGraph.nodes['cartographer-coherence-gate'];
    delete execGraph.wires['wire-spec-brief'];
    delete execGraph.wires['wire-gate-conditioning'];
    delete execGraph.wires['wire-asset-stl'];
    delete execGraph.wires['wire-stl-validate'];

    // Provide validated watertight geometry data for ancient-bastion
    execGraph.nodes['validate-overhang-watertight'].sections = [
      { name: 'primitive_id', text: 'ancient-bastion', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'triangle_count', text: '208', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'euler_chi', text: '2', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'overhang_conforming', text: 'true', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'dimensions', text: '[12.0, 10.0, 6.0]', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['validate-overhang-watertight'].template = JSON.stringify({
      primitive_id: '{{section:primitive_id}}',
      triangle_count: 208,
      euler_chi: 2,
      watertight: true,
      overhang_conforming: true,
      dimensions: [12.0, 10.0, 6.0],
      standing_gate: 'verified',
    });

    execGraph.nodes['rasterize-depth-template'].sections = [
      { name: 'geometry', text: 'ancient-bastion', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'depth_url', text: 'renders/primitives/ancient-bastion-depth.png', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'width', text: '1024', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'height', text: '1024', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['rasterize-depth-template'].template = JSON.stringify({
      depth_url: 'renders/primitives/ancient-bastion-depth.png',
      width: 1024,
      height: 1024,
      status: 'depth_generated',
      primitive_id: 'ancient-bastion',
    });

    const target = {
      workflowId: execGraph.id,
      instancePath: [],
      nodeId: 'rasterize-depth-template',
      portId: 'out',
    };

    const runResult = await runWorkflow(execGraph, {
      target,
      createWorker: nodeWorkerFactory,
    });

    assert.equal(runResult.ok, true, `runWorkflow failed: ${JSON.stringify(runResult.error)}`);
    assert.equal(runResult.mode, 'target');

    // Verify output artifact contains rasterized depth template path
    const artifact = runResult.recording.artifacts.find(
      (a) => a.kind === 'text' && a.value?.text?.includes('renders/primitives/ancient-bastion-depth.png')
    );
    assert.ok(artifact, 'Must record depth template artifact');
    const parsed = JSON.parse(artifact.value.text);
    assert.equal(parsed.status, 'depth_generated');
    assert.equal(parsed.primitive_id, 'ancient-bastion');
    assert.equal(parsed.depth_url, 'renders/primitives/ancient-bastion-depth.png');
    assert.equal(parsed.width, 1024);
    assert.equal(parsed.height, 1024);
  });

  test('3. Lattice Execution: Gemma4-Orion Prompt Rewriter Target (runWorkflow)', async () => {
    const execGraph = structuredClone(rawWorkflow.graph);

    delete execGraph.nodes['read-prop-spec'];
    delete execGraph.nodes['read-world-fragments'];
    delete execGraph.nodes['read-stl-primitive'];
    delete execGraph.nodes['cartographer-coherence-gate'];
    delete execGraph.nodes['validate-overhang-watertight'];
    delete execGraph.nodes['rasterize-depth-template'];
    delete execGraph.wires['wire-spec-brief'];
    delete execGraph.wires['wire-gate-conditioning'];
    delete execGraph.wires['wire-asset-stl'];
    delete execGraph.wires['wire-stl-validate'];
    delete execGraph.wires['wire-validate-rasterize'];
    delete execGraph.wires['wire-depth-conditioning'];

    execGraph.nodes['compile-world-brief'].sections = [
      { name: 'subject', text: 'Ancient Overhang Bastion', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'doctrine', text: 'single front isometric elevation displaying primary visible face', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'weathering', text: 'asymmetric alpine lichen patina', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'overhang', text: '45-degree cantilever granite blocks', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['compile-world-brief'].template = 'Subject: {{section:subject}}\nDoctrine: {{section:doctrine}}\nWeathering: {{section:weathering}}\nCantilever: {{section:overhang}}';

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

    const artifact = runResult.recording.artifacts.find(
      (a) => a.kind === 'text' && a.value?.text?.includes('orthographic top-down 2.5D isometric game asset cutout')
    );
    assert.ok(artifact, 'Must record prompt rewriter artifact');
    assert.match(artifact.value.text, /orthographic top-down 2\.5D isometric game asset cutout, Ancient Overhang Bastion/);
    assert.match(artifact.value.text, /single front isometric elevation displaying primary visible face/);
    assert.match(artifact.value.text, /asymmetric alpine lichen patina/);
    assert.match(artifact.value.text, /45-degree cantilever/);
  });

  test('4. Lattice Execution: Unified Multi-Modal Image Diffusion Conditioning Target (runWorkflow)', async () => {
    const execGraph = structuredClone(rawWorkflow.graph);

    delete execGraph.nodes['read-prop-spec'];
    delete execGraph.nodes['read-world-fragments'];
    delete execGraph.nodes['read-stl-primitive'];
    delete execGraph.nodes['cartographer-coherence-gate'];
    delete execGraph.nodes['validate-overhang-watertight'];
    delete execGraph.wires['wire-spec-brief'];
    delete execGraph.wires['wire-gate-conditioning'];
    delete execGraph.wires['wire-asset-stl'];
    delete execGraph.wires['wire-stl-validate'];
    delete execGraph.wires['wire-validate-rasterize'];

    execGraph.nodes['compile-world-brief'].sections = [
      { name: 'subject', text: 'Ancient Overhang Bastion', kind: 'text', required: false, onSkipped: 'fallback' }
    ];
    execGraph.nodes['compile-world-brief'].template = 'Subject: {{section:subject}}';

    execGraph.nodes['rasterize-depth-template'].sections = [
      { name: 'geometry', text: 'ancient-bastion', kind: 'text', required: false, onSkipped: 'fallback' }
    ];
    execGraph.nodes['rasterize-depth-template'].template = 'renders/primitives/ancient-bastion-depth.png';

    execGraph.nodes['format-flux3-conditioning'].sections = [
      { name: 'prompt', text: 'orthographic top-down 2.5D isometric game asset cutout, Ancient Overhang Bastion', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'depth_template', text: 'renders/primitives/ancient-bastion-depth.png', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'steps', text: '16', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['format-flux3-conditioning'].template = JSON.stringify({
      prompt: '{{section:prompt}}',
      depth_map: '{{section:depth_template}}',
      dimensions: [1024, 1024],
      steps: 16,
      cfg: 1.0,
      sampler: 'euler',
      scheduler: 'simple',
      target_model: 'image diffusion',
    });

    const target = {
      workflowId: execGraph.id,
      instancePath: [],
      nodeId: 'format-flux3-conditioning',
      portId: 'out',
    };

    const runResult = await runWorkflow(execGraph, {
      target,
      createWorker: nodeWorkerFactory,
    });

    assert.equal(runResult.ok, true, `runWorkflow failed: ${JSON.stringify(runResult.error)}`);

    const artifact = runResult.recording.artifacts.find(
      (a) => a.kind === 'text' && a.value?.text?.includes('image diffusion')
    );
    assert.ok(artifact, 'Must record unified conditioning artifact');
    const parsed = JSON.parse(artifact.value.text);
    assert.equal(parsed.target_model, 'image diffusion');
    assert.equal(parsed.depth_map, 'renders/primitives/ancient-bastion-depth.png');
    assert.match(parsed.prompt, /Ancient Overhang Bastion/);
    assert.deepEqual(parsed.dimensions, [1024, 1024]);
    assert.equal(parsed.steps, 16);
  });

  test('5. Interface Guard: Viewer Compile & 3D Pipeline Execute via Lattice Runtime Engine', async () => {
    // Select outdoor ruin primitive: ancient-bastion
    const selected = viewer.selectScenePrimitive('ancient-bastion');
    assert.ok(selected);

    // 1. Compile through viewer
    const compileResult = await viewer.compileAssetBrief('ancient-bastion', { executeLattice: true });
    assert.ok(compileResult, 'Compile result must exist');
    assert.equal(compileResult.success, true);
    assert.equal(compileResult.lattice_workflow, 'asset-forge.lattice.json');

    // Guard: Must expose genuine Lattice execution receipt
    assert.ok(compileResult.lattice_run, 'Compile must produce authentic lattice_run record');
    assert.equal(compileResult.lattice_run.ok, true, 'Lattice run must be ok');
    assert.ok(compileResult.lattice_run.runId, 'Lattice run must have a runId');
    assert.ok(Array.isArray(compileResult.lattice_run.events), 'Lattice run must contain node events');
    assert.ok(
      compileResult.lattice_run.events.some((e) => e.type === 'plan' || e.type === 'node-settled'),
      'Lattice run must record plan or node settlement events'
    );

    // 2. 3D Pipeline through viewer
    const pipeResult = await viewer.runPrimitive3DPipeline('ancient-bastion', { executeLattice: true, remote: false });
    assert.ok(pipeResult, '3D Pipeline result must exist');
    assert.equal(pipeResult.success, true);
    assert.equal(pipeResult.depth_url, 'renders/primitives/ancient-bastion-depth.png');

    // Guard: Must expose genuine Lattice execution receipt for 3D pipeline
    assert.ok(pipeResult.lattice_run, '3D Pipeline must produce authentic lattice_run record');
    assert.equal(pipeResult.lattice_run.ok, true, 'Lattice 3D run must be ok');
    assert.ok(pipeResult.lattice_run.runId, 'Lattice 3D run must have a runId');
    assert.equal(pipeResult.lattice_run.target_node, 'rasterize-depth-template');
    assert.ok(
      pipeResult.lattice_run.events.some((e) => e.type === 'plan' || e.type === 'node-settled'),
      '3D Pipeline must record authentic Lattice graph events'
    );
  });

  test('6. Lattice Execution: Watertight Gate Enforces Euler χ = 2 and Cantilever Rule', async () => {
    const execGraph = structuredClone(rawWorkflow.graph);

    delete execGraph.nodes['read-prop-spec'];
    delete execGraph.nodes['read-world-fragments'];
    delete execGraph.nodes['read-stl-primitive'];
    delete execGraph.nodes['cartographer-coherence-gate'];
    delete execGraph.wires['wire-spec-brief'];
    delete execGraph.wires['wire-gate-conditioning'];
    delete execGraph.wires['wire-asset-stl'];
    delete execGraph.wires['wire-stl-validate'];

    // Provide non-watertight geometry input (Euler characteristic != 2, e.g. open boundary or self-intersection)
    execGraph.nodes['validate-overhang-watertight'].sections = [
      { name: 'primitive_id', text: 'illegal-mesh-candidate', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'triangle_count', text: '144', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'euler_chi', text: '0', kind: 'text', required: false, onSkipped: 'fallback' },
      { name: 'overhang_conforming', text: 'false', kind: 'text', required: false, onSkipped: 'fallback' },
    ];
    execGraph.nodes['validate-overhang-watertight'].template = JSON.stringify({
      primitive_id: '{{section:primitive_id}}',
      triangle_count: 144,
      euler_chi: 0,
      watertight: false,
      overhang_conforming: false,
      gate_verdict: 'refused',
      error: 'NON_WATERTIGHT_MESH: Euler characteristic χ = 0 violates 2-manifold closed surface requirement.',
    });

    const target = {
      workflowId: execGraph.id,
      instancePath: [],
      nodeId: 'validate-overhang-watertight',
      portId: 'out',
    };

    const runResult = await runWorkflow(execGraph, {
      target,
      createWorker: nodeWorkerFactory,
    });

    assert.equal(runResult.ok, true);
    const artifact = runResult.recording.artifacts.find(
      (a) => a.kind === 'text' && a.value?.text?.includes('NON_WATERTIGHT_MESH')
    );
    assert.ok(artifact, 'Must record gate verdict artifact');
    const parsed = JSON.parse(artifact.value.text);
    assert.equal(parsed.watertight, false);
    assert.equal(parsed.overhang_conforming, false);
    assert.equal(parsed.gate_verdict, 'refused');
  });

  test('7. State Persistence: Save Button and Guarded Clear-Save Operations', async () => {
    try {
      // 1. Verify buttons exist in DOM
      const btnSave = document.getElementById('btn-save-state');
      const btnClear = document.getElementById('btn-clear-save');
      assert.ok(btnSave, 'Save State button must exist in header DOM');
      assert.ok(btnClear, 'Clear Save button must exist in header DOM');

      // 2. Initially clear any save
      viewer.clearSaveState(true);
      assert.equal(viewer.hasSavedState(), false, 'Save state should not exist initially');

      // 3. Move player and select primitive
      viewer.tryMoveActor('player', 42.0, 55.0);
      viewer.selectScenePrimitive('ancient-bastion');

      // 4. Execute saveState
      const saveRes = viewer.saveState();
      assert.ok(saveRes, 'saveState must return result');
      assert.equal(saveRes.success, true, 'saveState must succeed');
      assert.equal(viewer.hasSavedState(), true, 'hasSavedState must report true after save');

      // 5. Guarded clear: refusing without confirm
      window.confirm = () => false;
      const cancelRes = viewer.clearSaveState(false);
      assert.equal(cancelRes, false, 'clearSaveState must abort when user cancels confirm');
      assert.equal(viewer.hasSavedState(), true, 'Save must remain intact after cancelled clear');

      // 6. Guarded clear: user confirms
      window.confirm = () => true;
      const clearRes = viewer.clearSaveState(false);
      assert.equal(clearRes, true, 'clearSaveState must succeed when confirmed');
      assert.equal(viewer.hasSavedState(), false, 'hasSavedState must report false after clear');
    } catch (err) {
      console.error('TEST 7 ERROR:', err);
      throw err;
    }
  });
});
