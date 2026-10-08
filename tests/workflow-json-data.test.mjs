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
let inheritedJsonReads = 0, inheritedJsonResult, inheritedJsonThrown;
Object.defineProperty(Object.prototype,'toJSON',{configurable:true,get(){inheritedJsonReads++;throw new Error('Inherited toJSON must not be read.');}});
try { inheritedJsonResult = cloneJsonValue({a:1}); }
catch (error) { inheritedJsonThrown = error; }
finally { delete Object.prototype.toJSON; }
assert.equal(inheritedJsonReads,0);
assert.equal(inheritedJsonThrown,undefined);
assert.deepEqual(inheritedJsonResult,{ok:true,data:{value:{a:1}}});
assert.equal(typeof helpers.stringifyJsonValue,'function','stringifyJsonValue must exist');
assert.deepEqual(helpers.stringifyJsonValue(JSON.parse('{"__proto__":[null,true,-0,"line\\nquote\\\""]}')), {ok:true,data:{text:'{"__proto__":[null,true,0,"line\\nquote\\\""]}'}});
for (const prototype of [Object.prototype,Array.prototype]) {
    let reads = 0, thrown, results;
    Object.defineProperty(prototype,'toJSON',{configurable:true,get(){reads++;throw new Error('Inherited toJSON must not be read.');}});
    try {
        results = [
            cloneJsonValue({nested:[1,{token:'keep'}]}),
            cloneJsonValue({text:'a'.repeat(262133)}),
            cloneJsonValue({text:'a'.repeat(262134)}),
            helpers.stringifyJsonValue({nested:[1,{token:'keep'}]}),
            helpers.stringifyJsonValue('a'.repeat(262142)),
            helpers.stringifyJsonValue('a'.repeat(262143)),
        ];
    } catch (error) { thrown = error; }
    finally { delete prototype.toJSON; }
    assert.equal(reads,0);
    assert.equal(thrown,undefined);
    assert.deepEqual(results[0],{ok:true,data:{value:{nested:[1,{token:'keep'}]}}});
    assert.equal(Object.getPrototypeOf(results[0].data.value),Object.prototype);
    assert.equal(results[1].ok,true);
    assert.equal(results[2].ok,false);
    assert.deepEqual(results[3],{ok:true,data:{text:'{"nested":[1,{"token":"keep"}]}'}});
    assert.equal(results[4].ok,true);
    assert.equal(results[5].ok,false);
}
// An inherited descriptor value cannot disguise an own accessor as data.
const ownAccessor = Object.defineProperty({},'secret',{enumerable:true,get(){throw new Error('Own accessor must not be read.');}});
let descriptorReads = 0, descriptorResult;
Object.defineProperty(Object.prototype,'value',{configurable:true,get(){descriptorReads++;throw new Error('Inherited descriptor value must not be read.');}});
try { descriptorResult = cloneJsonValue(ownAccessor); }
finally { delete Object.prototype.value; }
assert.equal(descriptorReads,0);
assert.equal(descriptorResult.ok,false);
const originalConstructor = Object.getOwnPropertyDescriptor(Array.prototype,'constructor');
let statefulConstructorReads = 0, statefulConstructorResult, statefulConstructorThrown;
Object.defineProperty(Array.prototype,'constructor',{configurable:true,get(){if (++statefulConstructorReads === 1) return Array; throw new Error('Second inherited constructor read.');}});
try { statefulConstructorResult = helpers.stringifyJsonValue({a:1}); }
catch (error) { statefulConstructorThrown = error; }
finally { Object.defineProperty(Array.prototype,'constructor',originalConstructor); }
assert.equal(statefulConstructorThrown,undefined,'stringifyJsonValue must return a Result when encoding fails');
assert.equal(typeof statefulConstructorResult.ok,'boolean');
let constructorReads = 0, constructorResults, constructorThrown;
Object.defineProperty(Array.prototype,'constructor',{configurable:true,get(){constructorReads++;throw new Error('Inherited constructor must not be read.');}});
try {
    constructorResults = [cloneJsonValue({a:1}),cloneJsonValue([1,2]),helpers.stringifyJsonValue({a:1}),helpers.stringifyJsonValue([1,2])];
} catch (error) { constructorThrown = error; }
finally { Object.defineProperty(Array.prototype,'constructor',originalConstructor); }
assert.equal(constructorReads,0);
assert.equal(constructorThrown,undefined);
assert.deepEqual(constructorResults,[{ok:true,data:{value:{a:1}}},{ok:true,data:{value:[1,2]}},{ok:true,data:{text:'{"a":1}'}},{ok:true,data:{text:'[1,2]'}}]);
assert.equal(statefulConstructorReads,0);
assert.deepEqual(statefulConstructorResult,{ok:true,data:{text:'{"a":1}'}});
console.log('workflow JSON data tests passed');
