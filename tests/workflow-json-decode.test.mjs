import assert from 'node:assert/strict';

import { decodeJson } from '../src/workflow/operations/json-decode.js';
assert.deepEqual(decodeJson('{"token":"keep","items":[null,3]}'), {
    ok: true, data: { value: { token: 'keep', items: [null, 3] }, report: [] },
});
for (const input of ['```json\n{}\n```', '{broken}', 3, null, undefined]) assert.equal(decodeJson(input).ok, false);
const checkedInput = {items:[{value:1}]};
const checked = decodeJson(checkedInput, {mode:'check'});
assert.equal(checked.ok,true);
checked.data.value.items[0].value=2;
assert.equal(checkedInput.items[0].value,1);
assert.equal(decodeJson('null', {mode:'repair'}).ok,false);
assert.equal(decodeJson(' '.repeat(99996)+'null').ok,true);
const oversizedText = decodeJson(' '.repeat(99997)+'null');
assert.equal(oversizedText.ok,false);
assert.equal(Object.hasOwn(oversizedText,'data'),false);
assert.equal(decodeJson('"'+'界'.repeat(87381)+'"').ok,false);
assert.equal(decodeJson(' '.repeat(262141)+'null').ok,false);
assert.equal(decodeJson('"'+ 'a'.repeat(262142) +'"').ok,false);
assert.equal(decodeJson('a'.repeat(262142),{mode:'check'}).ok,true);
assert.equal(decodeJson('1e999').ok,false);
assert.equal(decodeJson(new Date(), {mode:'check'}).ok,false);
const mismatch = decodeJson('{"name":4}', {schema:{type:'object',properties:{name:{type:'string'}},required:['name']}});
assert.equal(mismatch.ok,false);
assert.equal(mismatch.error.code,'SCHEMA_MISMATCH');
assert.equal(mismatch.error.findings[0].path,'/name');
for (const schema of [null, true, {type:['string','null']}, {$ref:'remote'}, {format:'email'}, {properties:{x:{pattern:'x'}}}, {additionalProperties:{}}, {required:'name'}, {items:[]}, {minItems:-1}, {minimum:'1'}]) {
    const result = decodeJson('null', {schema});
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'UNSUPPORTED_SCHEMA');
}
// Schema constraints must reject mismatches without coercion.
for (const [input,schema,path] of [
    ['{}',{required:['a/b~c']},'/a~1b~0c'],
    ['{"extra":1}',{properties:{known:{}},additionalProperties:false},'/extra'],
    ['["x",3]',{items:{type:'string'}},'/1'],
    ['[]',{minItems:1},''], ['[1,2]',{maxItems:1},''],
    ['"😀"',{minLength:2},''], ['"long"',{maxLength:3},''],
    ['2',{minimum:3},''], ['4',{maximum:3},''],
    ['2',{enum:[1,3]},''], ['{"x":1}',{const:{x:2}},''],
]) {
    const result=decodeJson(input,{schema});
    assert.equal(result.error?.code,'SCHEMA_MISMATCH');
    assert.equal(result.error.findings[0].path,path);
}
const many=decodeJson(JSON.stringify(Array(200).fill(1)),{schema:{items:{type:'string'}}});
assert.equal(many.error.findings.length,128);
assert.equal(Object.hasOwn(many,'data'),false);
let schemaDepth={type:'null'};
let valueDepth=null;
for(let i=0;i<16;i++){schemaDepth={type:'object',properties:{x:schemaDepth}};valueDepth={x:valueDepth};}
assert.equal(decodeJson(valueDepth,{mode:'check',schema:schemaDepth}).ok,true);
assert.equal(decodeJson({x:valueDepth},{mode:'check',schema:{properties:{x:schemaDepth}}}).error.code,'UNSUPPORTED_SCHEMA');
const atNodes={properties:Object.fromEntries(Array.from({length:999},(_,i)=>['k'+i,{}]))};
assert.equal(decodeJson('{}',{schema:atNodes}).ok,true);
atNodes.properties.overflow={};
assert.equal(decodeJson('{}',{schema:atNodes}).error.code,'UNSUPPORTED_SCHEMA');
assert.equal(decodeJson('{}',{schema:{properties:{unused:{type:'unsupported'}}}}).error.code,'UNSUPPORTED_SCHEMA');
// Positive fixtures prevent a validator which simply rejects every constrained value.
for (const [input,schema] of [
    ['null',{type:'null'}], ['true',{type:'boolean'}], ['"ready"',{type:'string',minLength:1,maxLength:5}],
    ['2.5',{type:'number',minimum:2,maximum:3}], ['2',{type:'integer'}],
    ['["x"]',{type:'array',items:{type:'string'},minItems:1,maxItems:1}],
    ['{"name":"ok"}',{type:'object',properties:{name:{type:'string'}},required:['name'],additionalProperties:false}],
    ['{"b":2,"a":1}',{enum:[{a:1,b:2}],const:{a:1,b:2},title:'example',description:'metadata',$schema:'https://example.test/schema'}],
]) assert.equal(decodeJson(input,{schema}).ok,true);
let inheritedTypeReads = 0, inheritedTypeResult, inheritedTypeThrown;
Object.defineProperty(Object.prototype,'type',{configurable:true,get(){inheritedTypeReads++;throw new Error('Inherited schema type must not be read.');}});
try { inheritedTypeResult = decodeJson('{}',{schema:{}}); }
catch (error) { inheritedTypeThrown = error; }
finally { delete Object.prototype.type; }
assert.equal(inheritedTypeReads,0);
assert.equal(inheritedTypeThrown,undefined);
assert.equal(inheritedTypeResult.ok,true);
// Every declared optional keyword and option must ignore inherited accessors.
for (const key of ['type','enum','const','properties','required','additionalProperties','items','minItems','maxItems','minLength','maxLength','minimum','maximum','title','description','$schema','mode','schema']) {
    let reads = 0, thrown, results;
    Object.defineProperty(Object.prototype,key,{configurable:true,get(){reads++;throw new Error(`Inherited ${key} must not be read.`);}});
    try {
        results = [
            decodeJson('null'),
            ...['null','true','{}','[]','2','"text"'].map(text => decodeJson(text,{schema:{}})),
            decodeJson('{"nested":{}}',{schema:{properties:{nested:{}}}}),
            decodeJson([{}],{mode:'check',schema:{items:{}}}),
        ];
    } catch (error) { thrown = error; }
    finally { delete Object.prototype[key]; }
    assert.equal(reads,0,`Inherited ${key} getter was read`);
    assert.equal(thrown,undefined);
    assert.equal(results.every(result => result.ok),true);
}
const accessorSchema = Object.defineProperty({},'type',{enumerable:true,get(){throw new Error('Own schema accessor must not be read.');}});
let descriptorReads = 0, descriptorSchemaResult;
Object.defineProperty(Object.prototype,'value',{configurable:true,get(){descriptorReads++;throw new Error('Inherited descriptor value must not be read.');}});
try { descriptorSchemaResult = decodeJson('null',{schema:accessorSchema}); }
finally { delete Object.prototype.value; }
assert.equal(descriptorReads,0);
assert.equal(descriptorSchemaResult.error.code,'UNSUPPORTED_SCHEMA');
console.log('workflow JSON decode tests passed');
