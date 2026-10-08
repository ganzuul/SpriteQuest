import assert from 'node:assert/strict';
import * as helpers from '../src/workflow/operations/json-data.js';
const { cloneJsonValue } = helpers;
const input = { token: 'keep', nested: [null, { ready: true }] };
const cloned = cloneJsonValue(input);
assert.deepEqual(cloned, { ok: true, data: { value: input } });
cloned.data.value.nested[1].ready = false;
assert.equal(input.nested[1].ready, true);
class FancyArray extends Array {}
assert.equal(cloneJsonValue(new FancyArray(1,2)).ok,false);
assert.deepEqual(helpers.readJsonPath(JSON.parse('{"__proto__":{"constructor":["safe"]}}'), ['__proto__', 'constructor', 0]), {ok:true, data:{found:true,value:'safe'}});
assert.deepEqual(helpers.readJsonPath({}, ['toString']), {ok:true,data:{found:false}});
assert.deepEqual(helpers.readJsonPath(['a','b'],['length']), {ok:true,data:{found:false}});
for (const selector of ['length','constructor','__proto__','toString','01','+0','-0','1.0','1e0','-','2']) {
    assert.deepEqual(helpers.readJsonPath({items:['a','b']},['items',selector]), {ok:true,data:{found:false}});
}
for (const selector of [0,'0']) assert.deepEqual(helpers.readJsonPath(['a','b'],[selector]), {ok:true,data:{found:true,value:'a'}});
for (const selector of ['length','01','constructor','__proto__']) {
    const object = JSON.parse('{"length":"kept","01":"kept","constructor":"kept","__proto__":"kept"}');
    assert.deepEqual(helpers.readJsonPath(object,[selector]), {ok:true,data:{found:true,value:'kept'}});
}
// Rejecting unsafe values must not call accessors or toJSON hooks.
let invoked = 0;
const accessor = Object.defineProperty({}, 'secret', {enumerable:true,get(){invoked++;return 1;}});
const cycle = {}; cycle.self = cycle;
for (const value of [undefined, NaN, Infinity, 1n, Symbol('x'), () => 1, new Date(), new Map(), Object.create({x:1}), [,1], accessor, cycle, {toJSON(){invoked++;return 'hidden';}}]) {
    assert.equal(cloneJsonValue(value).ok, false, 'non-plain JSON must fail');
}
assert.equal(invoked, 0);
// Root has depth zero; each child is one additional visited value.
assert.equal(cloneJsonValue('a'.repeat(262142)).ok, true);
assert.equal(cloneJsonValue('a'.repeat(262143)).ok, false);
assert.equal(cloneJsonValue('😀'.repeat(65536)).ok, false);
assert.equal(cloneJsonValue(Array(9999).fill(null)).ok, true);
assert.equal(cloneJsonValue(Array(10000).fill(null)).ok, false);
let deep = null;
for (let i = 0; i < 32; i++) deep = [deep];
assert.equal(cloneJsonValue(deep).ok, true);
assert.equal(cloneJsonValue([deep]).ok, false);
for (const path of [null, 'x', [-1], [1.5], [true], ['x', undefined]]) {
    assert.equal(helpers.readJsonPath({x:1}, path).ok, false);
}
assert.equal(helpers.readJsonPath(accessor, ['secret']).ok, false);
assert.equal(invoked, 0);
const whole = helpers.readJsonPath(input, []);
whole.data.value.nested[1].ready = false;
assert.equal(input.nested[1].ready, true);
console.log('workflow JSON data tests passed');
