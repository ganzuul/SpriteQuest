import assert from 'node:assert/strict';
import { composeText } from '../src/workflow/operations/compose.js';

const joined = composeText({sections:[{name:'intro',text:'First'},{name:'ending',text:'Last'}]});
assert.equal(joined.ok, true);
assert.equal(joined.data.text, 'First\n\nLast');
assert.ok(Array.isArray(joined.data.report));


assert.equal(composeText({template:'Hello {{section:who}}!',sections:[{name:'who',text:'world'}]}).data.text, 'Hello world!');

assert.equal(composeText({template:'{{data:/profile/name}} {{data:/count}} {{data:}}',data:{profile:{name:'Ada'},count:2}}).data.text, 'Ada 2 {"profile":{"name":"Ada"},"count":2}');

assert.equal(composeText({template:'{{{{section:missing}} {{section:raw}}',sections:[{name:'raw',text:'{{data:/notRead}}'}]}).data.text, '{{section:missing}} {{data:/notRead}}');

const missing = composeText({template:'Before {{section:missing}} after'});
assert.equal(missing.ok, false);
assert.equal(missing.error.code, 'MISSING_SECTION');
assert.equal(Object.hasOwn(missing, 'data'), false);

assert.equal(composeText({template:'{{data:/missing}}',data:{present:null}}).error?.code, 'MISSING_PATH');

assert.equal(composeText({template:'{{data:/a~2b}}',data:{'a~2b':'bad'}}).error?.code, 'INVALID_TEMPLATE');

assert.equal(composeText({template:'Hi {{host:secret}}'}).error?.code, 'INVALID_TEMPLATE');

assert.equal(composeText({sections:[{name:'same',text:'one'},{name:'same',text:'two'}]}).error?.code, 'INVALID_COMPOSE');

for (const settings of [null, 5, [], {sections:null}, {sections:[{name:'bad-name',text:'x'}]}, {sections:[{name:'valid',text:42}]}, {separator:3}, {template:4}, {unknown:true}]) {
  assert.equal(composeText(settings).error?.code, 'INVALID_COMPOSE');
}

assert.equal(composeText({sections:Array.from({length:65},(_,i)=>({name:'s'+i,text:''}))}).error?.code, 'INVALID_COMPOSE');

for (const settings of [{template:'x'.repeat(100001)}, {separator:'x'.repeat(100001)}, {sections:[{name:'s',text:'x'.repeat(100001)}]}, {template:'{{section:s}}{{section:s}}',sections:[{name:'s',text:'x'.repeat(50001)}]}]) {
  const result = composeText(settings);
  assert.equal(result.error?.code, 'TEXT_LIMIT');
  assert.equal(Object.hasOwn(result,'data'), false);
}

let reads = 0;
const accessed = {get template(){reads++; return 'unsafe';}};
assert.equal(composeText(accessed).error?.code, 'INVALID_COMPOSE');
assert.equal(reads, 0);

const accessedSection = {name:'s',get text(){reads++; return 'unsafe';}};
assert.equal(composeText({sections:[accessedSection]}).error?.code, 'INVALID_COMPOSE');
assert.equal(reads, 0);

assert.equal(composeText({data:undefined}).error?.code, 'INVALID_JSON_VALUE');

assert.equal(composeText({template:'{{data:}}'}).error?.code, 'MISSING_PATH');

// Hand-checked RFC 6901 fixtures, including empty keys and own special keys.
assert.equal(composeText({template:'{{data:/a~1b/~0key/0}}|{{data:/}}|{{data:/constructor}}|{{data:/__proto__}}',data:JSON.parse('{"a/b":{"~key":["yes"]},"":"empty","constructor":"own","__proto__":"safe"}')}).data.text, 'yes|empty|own|safe');
assert.equal(composeText({template:'{{data:/nil}} {{data:/flag}} {{data:/list}}',data:{nil:null,flag:false,list:[1,2]}}).data.text, 'null false [1,2]');
assert.equal(composeText({template:'{{data:/01}}',data:['zero','one']}).ok, false);
assert.equal(composeText({template:'{{data:/toString}}',data:{}}).ok, false);
assert.equal(composeText({template:'{{data:/x}}',data:{x:'{{host:eval}} ${1+1}'}}).data.text, '{{host:eval}} ${1+1}');
assert.equal(composeText({template:'{{section:unfinished'}).error?.code,'INVALID_TEMPLATE');
assert.equal(composeText({template:'{{data:relative}}',data:{}}).error?.code,'INVALID_TEMPLATE');
assert.equal(composeText({sections:new Array(1)}).error?.code,'INVALID_COMPOSE');
assert.equal(composeText({sections:[{text:'x'}]}).error?.code,'INVALID_COMPOSE');
assert.equal(composeText({sections:[{name:'s',text:'x'}],separator:'|'}).data.text,'x');
assert.equal(composeText({sections:[{name:'a',text:'x'},{name:'b',text:'y'}],separator:'|'}).data.text,'x|y');
assert.equal(composeText().data.text,'');
assert.equal(composeText({template:''}).data.text,'');
assert.equal(composeText({template:'x'.repeat(100000)}).data.text.length,100000);
assert.equal(composeText({sections:[{name:'s',text:'😀'.repeat(50000)}]}).data.text.length,100000);
assert.equal(composeText({sections:[{name:'s',text:'😀'.repeat(50001)}]}).error?.code,'TEXT_LIMIT');
assert.equal(composeText({sections:Array.from({length:64},(_,i)=>({name:'s'+i,text:''})),separator:''}).ok,true);
const frozen = Object.freeze({template:'{{section:s}}:{{data:/name}}',sections:Object.freeze([Object.freeze({name:'s',text:'Intro'})]),data:Object.freeze({name:'Ada'})});
assert.equal(composeText(frozen).data.text,'Intro:Ada');
assert.deepEqual(frozen.data,{name:'Ada'});
assert.deepEqual(composeText(frozen),composeText(frozen));
const cyclic = {}; cyclic.self = cyclic;
assert.equal(composeText({data:cyclic}).error?.code,'INVALID_JSON_VALUE');
assert.equal(composeText({data:'x'.repeat(262143)}).error?.code,'INVALID_JSON_VALUE');
assert.equal(composeText({template:'{{data:}}',data:'x'.repeat(100001)}).error?.code,'TEXT_LIMIT');

assert.equal(composeText({sections:[{name:'x'.repeat(100001),text:''}]}).error?.code,'TEXT_LIMIT');


const revokedSettings = Proxy.revocable({}, {});
revokedSettings.revoke();
assert.equal(composeText(revokedSettings.proxy).error?.code, 'INVALID_COMPOSE');

const revokedSection = Proxy.revocable({name:'s',text:'x'}, {});
revokedSection.revoke();
const revokedSections = Proxy.revocable([], {});
revokedSections.revoke();
for (const settings of [{sections:[revokedSection.proxy]}, {sections:revokedSections.proxy}]) {
  const result = composeText(settings);
  assert.equal(result.error?.code, 'INVALID_COMPOSE');
  assert.equal(Object.hasOwn(result,'data'), false);
}

const rootArrayMetadata = composeText({template:'{{data:/length}}',data:['a','b']});
assert.equal(rootArrayMetadata.error?.code,'MISSING_PATH');
assert.equal(Object.hasOwn(rootArrayMetadata,'data'),false);

const nestedArrayMetadata = composeText({template:'{{data:/items/length}}',data:{items:['a','b']}});
assert.equal(nestedArrayMetadata.error?.code,'MISSING_PATH');
assert.equal(Object.hasOwn(nestedArrayMetadata,'data'),false);

assert.equal(composeText({template:'{{data:/length}} {{data:/nested/length}}',data:{length:2,nested:{length:'own'}}}).data.text,'2 own');


// Normal joining must not consult a prototype getter for absent template.
let inheritedTemplateReads = 0;
let inheritedTemplateJoin;
Object.defineProperty(Object.prototype,'template',{configurable:true,get(){inheritedTemplateReads++; throw new Error('inherited template read');}});
try {
  inheritedTemplateJoin = composeText({sections:[{name:'s',text:'Constant'}]});
} finally {
  delete Object.prototype.template;
}
assert.equal(inheritedTemplateReads,0);
assert.equal(inheritedTemplateJoin.ok,true);
assert.equal(inheritedTemplateJoin.data.text,'Constant');

// All optional configuration defaults use only own descriptors.
for (const key of ['sections','data','separator']) {
  let inheritedReads = 0;
  let result;
  Object.defineProperty(Object.prototype,key,{configurable:true,get(){inheritedReads++; throw new Error('inherited config read');}});
  try {
    result = composeText(key === 'sections' ? {} : {sections:[{name:'a',text:'First'},{name:'b',text:'Last'}]});
  } finally {
    delete Object.prototype[key];
  }
  assert.equal(inheritedReads,0,key);
  assert.equal(result.ok,true,key);
  assert.equal(result.data.text,key === 'sections' ? '' : 'First\n\nLast');
}

let inheritedSectionNameReads = 0;
let inheritedSectionNameResult;
Object.defineProperty(Object.prototype,'name',{configurable:true,get(){inheritedSectionNameReads++; throw new Error('inherited section name read');}});
try {
  inheritedSectionNameResult = composeText({sections:[{text:'Missing name'}]});
} finally {
  delete Object.prototype.name;
}
assert.equal(inheritedSectionNameReads,0);
assert.equal(inheritedSectionNameResult.error?.code,'INVALID_COMPOSE');

let inheritedToJsonReads = 0;
let inheritedToJsonResult;
let inheritedArrayToJsonResult;
Object.defineProperty(Object.prototype,'toJSON',{configurable:true,get(){inheritedToJsonReads++; throw new Error('inherited JSON hook read');}});
try {
  inheritedToJsonResult = composeText({template:'{{data:}}',data:{name:'Ada',items:[1,2]}});
  inheritedArrayToJsonResult = composeText({template:'{{data:}}',data:['Ada',{count:2}]});
} finally {
  delete Object.prototype.toJSON;
}
assert.equal(inheritedToJsonReads,0);
assert.equal(inheritedToJsonResult.ok,true);
assert.equal(inheritedToJsonResult.data.text,'{"name":"Ada","items":[1,2]}');
assert.equal(inheritedArrayToJsonResult.ok,true);
assert.equal(inheritedArrayToJsonResult.data.text,'["Ada",{"count":2}]');
console.log('workflow-compose tests passed');
