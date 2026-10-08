import assert from 'node:assert/strict';
import { selectFields } from '../src/workflow/operations/select-fields.js';
const input=JSON.parse('{"token":"legitimate","__proto__":{"constructor":[{"x":1}]}}');
const result=selectFields(input,{fields:[{name:'token',path:['token']},{name:'__proto__',path:['__proto__','constructor',0]}]});
assert.deepEqual(result,{ok:true,data:{value:JSON.parse('{"token":"legitimate","__proto__":{"x":1}}'),report:[]}});
result.data.value.__proto__.x=2;
assert.equal(input.__proto__.constructor[0].x,1);
assert.equal(Object.getPrototypeOf(result.data.value),Object.prototype);
const missing=selectFields({}, {fields:[{name:'required',path:['missing']}]});
assert.equal(missing.error?.code,'MISSING_FIELD');
assert.equal(Object.hasOwn(missing,'data'),false);
assert.deepEqual(selectFields({}, {fields:[{name:'skip',path:['missing'],required:false},{name:'fallback',path:['missing'],required:false,default:null}]}).data.value,{fallback:null});
for (const settings of [undefined,null,{}, {fields:'x'}, {fields:[{name:'',path:[]}]}, {fields:[{name:'x',path:[],required:'yes'}]}, {fields:[{name:'x',path:[],extra:1}]}, {fields:[{name:'x',path:[]},{name:'x',path:[]}]}, {fields:Array.from({length:129},(_,i)=>({name:'k'+i,path:[]}))}]) {
    assert.equal(selectFields({},settings).error?.code,'INVALID_FIELDS');
}
assert.equal(selectFields(new Date(),{fields:[]}).ok,false);
assert.equal(selectFields('a'.repeat(140000),{fields:[{name:'one',path:[]},{name:'two',path:[]}]}).ok,false);
assert.equal(selectFields(Array(6000).fill(null),{fields:[{name:'one',path:[]},{name:'two',path:[]}]}).ok,false);
assert.equal(selectFields({}, {fields:[{name:'x',path:[],default:new Date()}]}).ok,false);
const missingPath=['absent'];
const missingIsolated=selectFields({}, {fields:[{name:'x',path:missingPath}]});
missingIsolated.error.path.push('changed');
assert.deepEqual(missingPath,['absent']);
for (const [value,path] of [[['a','b'],['length']], [{items:['a','b']},['items','length']]]) {
    const result = selectFields(value,{fields:[{name:'metadata',path}]});
    assert.equal(result.error?.code,'MISSING_FIELD');
    assert.equal(Object.hasOwn(result,'data'),false);
}
assert.deepEqual(selectFields({length:2,items:['a','b']},{fields:[{name:'length',path:['length']},{name:'first',path:['items',0]}]}).data.value,{length:2,first:'a'});
let inheritedRequiredReads = 0, inheritedRequiredResult, inheritedRequiredThrown;
Object.defineProperty(Object.prototype,'required',{configurable:true,get(){inheritedRequiredReads++;throw new Error('Inherited required must not be read.');}});
try { inheritedRequiredResult = selectFields({}, {fields:[{name:'x',path:['missing']}]}); }
catch (error) { inheritedRequiredThrown = error; }
finally { delete Object.prototype.required; }
assert.equal(inheritedRequiredReads,0);
assert.equal(inheritedRequiredThrown,undefined);
assert.equal(inheritedRequiredResult.error.code,'MISSING_FIELD');
for (const key of ['fields','name','path','required','default']) {
    let reads = 0, thrown, results;
    Object.defineProperty(Object.prototype,key,{configurable:true,get(){reads++;throw new Error(`Inherited ${key} must not be read.`);}});
    try {
        results = [
            selectFields({}, {fields:[{name:'missing',path:['absent']}]}),
            selectFields({}, {fields:[{name:'omitted',path:['absent'],required:false},{name:'fallback',path:['absent'],required:false,default:null}]}),
            selectFields({present:1}, {fields:[{name:'selected',path:['present']}]}),
            selectFields({}, {}),
            selectFields({}, {fields:[{path:[]}]}),
            selectFields({}, {fields:[{name:'missingPath'}]}),
        ];
    } catch (error) { thrown = error; }
    finally { delete Object.prototype[key]; }
    assert.equal(reads,0,`Inherited ${key} getter was read`);
    assert.equal(thrown,undefined);
    assert.equal(results[0].error.code,'MISSING_FIELD');
    assert.deepEqual(results[1].data.value,{fallback:null});
    assert.deepEqual(results[2].data.value,{selected:1});
    assert.equal(results.slice(3).every(result => result.error?.code === 'INVALID_FIELDS'),true);
}
const accessorField = Object.defineProperty({name:'x',path:[]},'required',{enumerable:true,get(){throw new Error('Own field accessor must not be read.');}});
let descriptorReads = 0, descriptorFieldResult;
Object.defineProperty(Object.prototype,'value',{configurable:true,get(){descriptorReads++;throw new Error('Inherited descriptor value must not be read.');}});
try { descriptorFieldResult = selectFields({}, {fields:[accessorField]}); }
finally { delete Object.prototype.value; }
assert.equal(descriptorReads,0);
assert.equal(descriptorFieldResult.error.code,'INVALID_FIELDS');
console.log('workflow select fields tests passed');
