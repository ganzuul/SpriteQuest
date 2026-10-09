import assert from 'node:assert/strict';
import test from 'node:test';
import {canvasWorkflow} from './browser/native-fixture.mjs';
import {operationDefaults} from '../src/workflow/catalog.js';
import {validateGraphStructure} from '../src/workflow/contracts.js';
import {prepareWorkspaceViews} from '../src/ui/workspace-preparation.js';
test('browser gesture fixtures admit real current named-pin graphs and prepare detached cards',()=>{
    for(const count of [1,3,25,250]) {
        const graph=canvasWorkflow(operationDefaults,count,5),before=JSON.stringify(graph);
        assert.equal(validateGraphStructure(graph).ok,true);
        const prepared=prepareWorkspaceViews(graph);assert.equal(prepared.ok,true,JSON.stringify(prepared.error));
        const draw=prepared.data.preparedViews[0].drawBase;
        assert.equal(Object.keys(draw.nativeCards).length,count);assert.equal(Object.keys(draw.wires).length,count-1);
        assert.ok(Object.values(draw.wires).every(w=>w.route==='wire'&&w.fromPort==='out'&&w.toPort==='section.Text'&&!Object.hasOwn(w,'kind')&&!Object.hasOwn(w,'order')));
        assert.ok(Object.values(draw.nativeCards).every(c=>c.ports.some(p=>p.port==='section.Text'&&p.dir==='in')&&c.ports.some(p=>p.port==='out'&&p.dir==='out')));
        assert.notEqual(draw.nodes,graph.nodes);assert.equal(JSON.stringify(graph),before);
    }
});
test('synthetic fixture bounds fail before attempting operation lookup',()=>{
    let lookups=0;const lookup=()=>{lookups++;throw Error('invalid dimensions must not resolve a catalog');};
    for(const dimensions of [[0,1],[501,1],[3.1,2],[1,0],[1,Infinity]])assert.throws(()=>canvasWorkflow(lookup,...dimensions),/bounded/);
    assert.equal(lookups,0);
});
