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
console.log('workflow select fields tests passed');
