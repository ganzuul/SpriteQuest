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
});
