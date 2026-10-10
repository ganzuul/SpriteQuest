import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Canvas} from '../src/canvas.js';
test('recall refresh forwards only status and preserves graph, geometry and drag',()=>{let updates=0;const graph={nodes:{}},drag={},geometry={};const canvas={graph,drag,geometry,layer:{setRecallStatus(value){updates++;assert.equal(value.a.state,'queued');}},setGraph(){throw new Error('graph rebuild');},render(){throw new Error('geometry redraw');}};const status={a:{state:'queued',tooltip:'Queued',ariaLabel:'Memory recall'}};Canvas.prototype.setRecallStatus.call(canvas,status);assert.equal(updates,1);assert.equal(canvas.graph,graph);assert.equal(canvas.drag,drag);assert.equal(canvas.geometry,geometry);});
