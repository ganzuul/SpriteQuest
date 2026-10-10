import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prepareDocumentMutation } from '../src/workflow/operations/document-mutations.js';
import { decodeJson } from '../src/workflow/operations/json-decode.js';
import { formatRecords } from '../src/workflow/operations/format-records.js';

const snapshot={targetId:'canon:sword-01',revision:'r7',format:'json',content:'{"schemaVersion":1,"swordId":"sword-01","souls":[{"eventId":"capture-1","victim":"Elias","notes":"keep"}],"level":{"xp":9}}'};
const settings={operation:'add-unique',collectionPath:'/souls',key:'eventId',missingPath:'error',records:[{eventId:'capture-2',victim:'Mira'}]};

test('projects one new soul while preserving existing records and unrelated fields', () => {
    const result=prepareDocumentMutation(snapshot,settings);
    assert.equal(result.ok,true);
    assert.equal(result.data.targetId,'canon:sword-01');
    assert.equal(result.data.expectedRevision,'r7');
    assert.equal(result.data.operation,'add-unique');
    assert.deepEqual(JSON.parse(result.data.projectedDocument.content),{schemaVersion:1,swordId:'sword-01',souls:[{eventId:'capture-1',victim:'Elias',notes:'keep'},{eventId:'capture-2',victim:'Mira'}],level:{xp:9}});
    assert.deepEqual(result.data.receipt,{changed:true,added:1,updated:0,unchanged:0});
    assert.equal(JSON.parse(snapshot.content).souls.length,1);
    result.data.projectedDocument.value.souls[0].notes='changed';
    assert.equal(settings.records[0].victim,'Mira');
    assert.equal(JSON.parse(snapshot.content).souls[0].notes,'keep');
});

test('treats an identical stable identity as a no-op without reserializing the file', () => {
    const source={...snapshot,content:'{\n "souls": [{"victim":"Elias","notes":"keep","eventId":"capture-1"}], "untouched": true\n}'};
    const result=prepareDocumentMutation(source,{...settings,records:[{eventId:'capture-1',victim:'Elias',notes:'keep'}]});
    assert.equal(result.ok,true);
    assert.equal(result.data.projectedDocument.content,source.content);
    assert.deepEqual(result.data.receipt,{changed:false,added:0,updated:0,unchanged:1});
});

test('holds conflicting identities without exposing a partially projected document', () => {
    for(const records of [[{eventId:'capture-2',victim:'Mira'},{eventId:'capture-1',victim:'Changed'}],[{eventId:'new',victim:'Mira'},{eventId:'new',victim:'Changed'}]]) {
        const result=prepareDocumentMutation(snapshot,{...settings,records});
        assert.equal(result.error?.code,'IDENTITY_CONFLICT');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
    assert.equal(JSON.parse(snapshot.content).souls.length,1);
});

test('requires a bounded own-data snapshot and explicit supported mutation policy', () => {
    let reads=0;
    const accessor=Object.defineProperty({...snapshot},'content',{enumerable:true,get(){reads++;return snapshot.content;}});
    for(const value of [accessor,null,{...snapshot,revision:''},{...snapshot,unexpected:1}]) {
        assert.equal(prepareDocumentMutation(value,settings).error?.code,'INVALID_DOCUMENT_SNAPSHOT');
    }
    for(const options of [null,{}, {...settings,operation:'guess'}, {...settings,missingPath:'invent'}, {...settings,extra:true}]) {
        assert.equal(prepareDocumentMutation(snapshot,options).error?.code,'INVALID_MUTATION_SETTINGS');
    }
    assert.equal(reads,0);
});

test('replaces malformed old JSON deliberately with a checked complete document', () => {
    const source={...snapshot,content:'{broken'};
    const result=prepareDocumentMutation(source,{operation:'replace',content:'{"souls":[],"repaired":true}'});
    assert.equal(result.ok,true);
    assert.equal(result.data.expectedRevision,'r7');
    assert.equal(result.data.projectedDocument.content,'{"souls":[],"repaired":true}');
    assert.deepEqual(result.data.projectedDocument.value,{souls:[],repaired:true});
    assert.equal(prepareDocumentMutation(source,{operation:'replace',content:'{still-broken'}).error?.code,'INVALID_JSON');
});

test('resolves JSON Pointer escapes and creates only an explicitly missing final collection', () => {
    const source={...snapshot,content:'{"nested":{"a/b~c":[]},"keep":3}'};
    const escaped=prepareDocumentMutation(source,{...settings,collectionPath:'/nested/a~1b~0c'});
    assert.deepEqual(JSON.parse(escaped.data.projectedDocument.content),{nested:{'a/b~c':[{eventId:'capture-2',victim:'Mira'}]},keep:3});
    const missing={...snapshot,content:'{"nested":{},"keep":3}'};
    assert.equal(prepareDocumentMutation(missing,{...settings,collectionPath:'/nested/souls'}).error?.code,'MISSING_COLLECTION');
    const created=prepareDocumentMutation(missing,{...settings,collectionPath:'/nested/souls',missingPath:'create'});
    assert.deepEqual(JSON.parse(created.data.projectedDocument.content),{nested:{souls:[{eventId:'capture-2',victim:'Mira'}]},keep:3});
    assert.equal(prepareDocumentMutation(missing,{...settings,collectionPath:'/absent/souls',missingPath:'create'}).error?.code,'MISSING_COLLECTION');
    assert.equal(prepareDocumentMutation(source,{...settings,collectionPath:'/nested/a~2b'}).error?.code,'INVALID_COLLECTION_PATH');
});

test('validates records and collection schemas before exposing semantic mutation data', () => {
    const schema={type:'object',required:['eventId','victim'],properties:{eventId:{type:'string'},victim:{type:'string'}}};
    assert.equal(prepareDocumentMutation(snapshot,{...settings,schema,records:[{eventId:'capture-2',victim:3}]}).error?.code,'SCHEMA_MISMATCH');
    assert.equal(prepareDocumentMutation(snapshot,{...settings,schema:{$ref:'remote'}}).error?.code,'UNSUPPORTED_SCHEMA');
    for(const records of [[],['prose'],{eventId:'object-not-array'}]) {
        const result=prepareDocumentMutation(snapshot,{...settings,records});
        if (Array.isArray(records) && !records.length) {
            assert.equal(result.data.projectedDocument.content,snapshot.content);
            assert.deepEqual(result.data.receipt,{changed:false,added:0,updated:0,unchanged:0});
        } else assert.equal(result.error?.code,'INVALID_RECORDS');
    }
    assert.equal(prepareDocumentMutation({...snapshot,content:'{broken'},settings).error?.code,'INVALID_JSON');
    assert.equal(prepareDocumentMutation({...snapshot,content:'{"souls":{}}'},settings).error?.code,'INVALID_COLLECTION');
});

test('rejects missing or ambiguous stable identities instead of comparing undefined keys', () => {
    for(const records of [[{victim:'Mira'}],[{eventId:null,victim:'Mira'}],[{eventId:'',victim:'Mira'}]]) {
        assert.equal(prepareDocumentMutation(snapshot,{...settings,records}).error?.code,'INVALID_RECORD_KEY');
    }
    const ambiguous={...snapshot,content:'{"souls":[{"eventId":"one"},{"eventId":"one"}]}'};
    assert.equal(prepareDocumentMutation(ambiguous,settings).error?.code,'AMBIGUOUS_IDENTITY');
    const missingKey={...settings}; delete missingKey.key;
    assert.equal(prepareDocumentMutation(snapshot,missingKey).error?.code,'INVALID_MUTATION_SETTINGS');
});

test('upserts keyed records only with a declared merge or replacement field policy', () => {
    const records=[{eventId:'capture-1',victim:'Updated'},{eventId:'capture-2',victim:'Mira'}];
    const merged=prepareDocumentMutation(snapshot,{...settings,operation:'upsert',fieldPolicy:'merge',records});
    assert.deepEqual(merged.data.projectedDocument.value.souls,[{eventId:'capture-1',victim:'Updated',notes:'keep'},{eventId:'capture-2',victim:'Mira'}]);
    assert.deepEqual(merged.data.receipt,{changed:true,added:1,updated:1,unchanged:0});
    const replaced=prepareDocumentMutation(snapshot,{...settings,operation:'upsert',fieldPolicy:'replace',records:[records[0]]});
    assert.deepEqual(replaced.data.projectedDocument.value.souls,[{eventId:'capture-1',victim:'Updated'}]);
    assert.equal(prepareDocumentMutation(snapshot,{...settings,operation:'upsert',records}).error?.code,'INVALID_MUTATION_SETTINGS');
});

test('updates only explicitly selected fields on existing keyed records', () => {
    const options={...settings,operation:'update-fields',fields:['victim'],records:[{eventId:'capture-1',victim:'Updated',notes:'discard'}]};
    const result=prepareDocumentMutation(snapshot,options);
    assert.deepEqual(result.data.projectedDocument.value.souls,[{eventId:'capture-1',victim:'Updated',notes:'keep'}]);
    assert.deepEqual(result.data.receipt,{changed:true,added:0,updated:1,unchanged:0});
    assert.equal(prepareDocumentMutation(snapshot,{...options,records:[{eventId:'missing',victim:'Mira'}]}).error?.code,'RECORD_NOT_FOUND');
    assert.equal(prepareDocumentMutation(snapshot,{...options,records:[{eventId:'capture-1'}]}).error?.code,'MISSING_UPDATE_FIELD');
    for(const fields of [undefined,[],['eventId'],['victim','victim']]) {
        const invalid={...options}; if(fields===undefined) delete invalid.fields; else invalid.fields=fields;
        assert.equal(prepareDocumentMutation(snapshot,invalid).error?.code,'INVALID_MUTATION_SETTINGS');
    }
});

test('appends text with explicit empty-file and trailing-separator policies', () => {
    const options={operation:'append-text',text:'New note',separator:'\n---\n',emptyPolicy:'omit',trailingSeparator:true};
    for(const format of ['text','markdown']) {
        const source={targetId:'notes',revision:0,format,content:'Old note'};
        const result=prepareDocumentMutation(source,options);
        assert.equal(result.data.projectedDocument.content,'Old note\n---\nNew note\n---\n');
        assert.equal(result.data.expectedRevision,0);
        assert.equal(prepareDocumentMutation({...source,content:''},options).data.projectedDocument.content,'New note\n---\n');
        assert.equal(prepareDocumentMutation({...source,content:''},{...options,emptyPolicy:'include',trailingSeparator:false}).data.projectedDocument.content,'\n---\nNew note');
        assert.equal(prepareDocumentMutation(source,{...options,text:''}).data.receipt.changed,false);
        assert.equal(prepareDocumentMutation(source,{operation:'replace',content:'Replaced'}).data.projectedDocument.content,'Replaced');
    }
    assert.equal(prepareDocumentMutation(snapshot,options).error?.code,'UNSUPPORTED_MUTATION');
});

test('literally appends checked JSON Lines without wrapping or rewriting prior lines', () => {
    const source={targetId:'events',revision:'j1',format:'jsonl',content:'{"eventId":"one","note":"keep"}'};
    const options={operation:'add',collectionPath:'',missingPath:'error',records:[{eventId:'two',note:'line\nbreak'}]};
    const result=prepareDocumentMutation(source,options);
    assert.equal(result.data.projectedDocument.content,'{"eventId":"one","note":"keep"}\n{"eventId":"two","note":"line\\nbreak"}\n');
    assert.deepEqual(result.data.receipt,{changed:true,added:1,updated:0,unchanged:0});
    assert.equal(prepareDocumentMutation({...source,content:'{}\nnot-json\n'},options).error?.code,'INVALID_JSON');
    assert.equal(prepareDocumentMutation(source,{...options,records:[]}).data.projectedDocument.content,source.content);
    assert.equal(prepareDocumentMutation(source,{operation:'replace',content:'{"eventId":"repaired"}\n'}).data.projectedDocument.content,'{"eventId":"repaired"}\n');
    assert.equal(prepareDocumentMutation(source,{...options,operation:'upsert',key:'eventId',fieldPolicy:'merge'}).error?.code,'UNSUPPORTED_MUTATION');
});

test('appends CSV rows under the exact existing header without duplicating it', () => {
    const source={targetId:'captures',revision:'c1',format:'csv',content:'eventId,note\r\none,"Old\nline"\r\n'};
    const options={operation:'add',collectionPath:'',missingPath:'error',columns:['eventId','note'],records:[{eventId:'two',note:'a,"b"'}]};
    const result=prepareDocumentMutation(source,options);
    assert.equal(result.data.projectedDocument.content,'eventId,note\r\none,"Old\nline"\r\ntwo,"a,""b"""\r\n');
    assert.equal(prepareDocumentMutation({...source,content:''},options).data.projectedDocument.content,'eventId,note\r\ntwo,"a,""b"""\r\n');
    assert.equal(prepareDocumentMutation({...source,content:'note,eventId\r\nOld,one\r\n'},options).error?.code,'CSV_HEADER_MISMATCH');
    assert.equal(prepareDocumentMutation({...source,content:'eventId,note\r\none,"unterminated'},options).error?.code,'INVALID_CSV');
    assert.equal(prepareDocumentMutation(source,{...options,records:[]}).data.projectedDocument.content,source.content);
    const replacement=prepareDocumentMutation({...source,content:'broken"'},{operation:'replace',columns:['eventId','note'],content:'eventId,note\r\nrepaired,ok\r\n'});
    assert.equal(replacement.data.projectedDocument.content,'eventId,note\r\nrepaired,ok\r\n');
});

test('bounds a projected text document even when each input individually fits', () => {
    const source={targetId:'notes',revision:'n1',format:'text',content:'a'.repeat(140000)};
    const result=prepareDocumentMutation(source,{operation:'append-text',text:'b'.repeat(140000),separator:'\n',emptyPolicy:'omit',trailingSeparator:false});
    assert.equal(result.error?.code,'DOCUMENT_LIMIT');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.equal(source.content.length,140000);
});

test('holds contradictory input identities before intentional keyed overwrites', () => {
    const records=[{eventId:'capture-1',victim:'Updated'},{eventId:'capture-1',victim:'Contradictory'}];
    for(const operation of ['upsert','update-fields']) {
        const result=prepareDocumentMutation(snapshot,{...settings,operation,records,fieldPolicy:'merge',fields:['victim']});
        assert.equal(result.error?.code,'IDENTITY_CONFLICT');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
});

test('reports explicit empty-collection creation as a document change', () => {
    const source={...snapshot,content:'{"keep":3}'};
    const result=prepareDocumentMutation(source,{...settings,missingPath:'create',records:[]});
    assert.deepEqual(JSON.parse(result.data.projectedDocument.content),{keep:3,souls:[]});
    assert.deepEqual(result.data.receipt,{changed:true,added:0,updated:0,unchanged:0});
    assert.deepEqual(result.data.projectedDocument.value,{keep:3,souls:[]});
});

test('rejects record mutations on text formats even when their contents resemble JSON', () => {
    for(const format of ['text','markdown']) {
        const result=prepareDocumentMutation({...snapshot,format},settings);
        assert.equal(result.error?.code,'UNSUPPORTED_MUTATION');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
});

test('checks explicitly supplied JSON Lines schemas even for empty replacements', () => {
    const source={targetId:'events',revision:'j1',format:'jsonl',content:'broken'};
    for(const schema of [null,false,{$ref:'remote'}]) {
        const result=prepareDocumentMutation(source,{operation:'replace',content:'',schema});
        assert.equal(result.error?.code,'UNSUPPORTED_SCHEMA');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
    assert.equal(prepareDocumentMutation(source,{operation:'replace',content:''}).data.projectedDocument.content,'');
});

test('consumes a prepared complete update as replacement without appending its records again', () => {
    const projected=prepareDocumentMutation(snapshot,{...settings,operation:'add'});
    const consumed=prepareDocumentMutation(snapshot,{operation:'replace',content:projected.data.projectedDocument.content});
    assert.deepEqual(consumed.data.projectedDocument.value.souls,[{eventId:'capture-1',victim:'Elias',notes:'keep'},{eventId:'capture-2',victim:'Mira'}]);
    assert.equal(consumed.data.expectedRevision,'r7');
    assert.equal(Object.hasOwn(projected.data,'records'),false);
    assert.equal(prepareDocumentMutation(projected.data.projectedDocument,settings).error?.code,'INVALID_DOCUMENT_SNAPSHOT');
    assert.equal(prepareDocumentMutation(snapshot,{...settings,operation:'add',records:projected.data}).error?.code,'INVALID_RECORDS');
});

test('uses only own JSON data for prototype-named fields and collection paths', () => {
    const source={...snapshot,content:'{"__proto__":{"souls":[]},"untouched":true}'};
    const record=JSON.parse('{"eventId":"one","__proto__":{"keep":3}}');
    const result=prepareDocumentMutation(source,{...settings,collectionPath:'/__proto__/souls',records:[record]});
    assert.deepEqual(JSON.parse(result.data.projectedDocument.content),JSON.parse('{"__proto__":{"souls":[{"eventId":"one","__proto__":{"keep":3}}]},"untouched":true}'));
    assert.equal(Object.getPrototypeOf(result.data.projectedDocument.value),Object.prototype);
    const inherited={...snapshot,content:'{"souls":[]}'};
    assert.equal(prepareDocumentMutation(inherited,{...settings,collectionPath:'/constructor/souls',missingPath:'create'}).error?.code,'MISSING_COLLECTION');
    let reads=0,resultWithAccessor;
    Object.defineProperty(Object.prototype,'key',{configurable:true,get(){reads++;throw new Error('Inherited settings must be ignored.');}});
    try {resultWithAccessor=prepareDocumentMutation(snapshot,{operation:'add',records:[{victim:'Mira'}],collectionPath:'/souls',missingPath:'error'});}
    finally {delete Object.prototype.key;}
    assert.equal(reads,0);
    assert.equal(resultWithAccessor.ok,true);
});

test('holds blank targets, revisions and string identities without normalizing valid opaque revisions', () => {
    for(const source of [{...snapshot,targetId:'  '},{...snapshot,revision:'\t '},{...snapshot,revision:-1}]) {
        assert.equal(prepareDocumentMutation(source,settings).error?.code,'INVALID_DOCUMENT_SNAPSHOT');
    }
    assert.equal(prepareDocumentMutation(snapshot,{...settings,records:[{eventId:'  ',victim:'Mira'}]}).error?.code,'INVALID_RECORD_KEY');
    const opaque=prepareDocumentMutation({...snapshot,revision:' r7 '},settings);
    assert.equal(opaque.data.expectedRevision,' r7 ');
});

test('holds final projections that cannot pass the next snapshot and reader admission', () => {
    const cases=[
        [{targetId:'large-json',revision:'r1',format:'json',content:JSON.stringify({souls:[],note:'x'.repeat(90000)})},{operation:'add',collectionPath:'/souls',missingPath:'error',records:[{text:'x'.repeat(20000)}]}],
        [{targetId:'large-lines',revision:'r1',format:'jsonl',content:JSON.stringify({text:'\n'.repeat(40000)})+'\n'},{operation:'add',collectionPath:'',missingPath:'error',records:Array.from({length:2},()=>({text:'\n'.repeat(40000)}))}],
        [{targetId:'large-text',revision:'r1',format:'text',content:'x'.repeat(100000)},{operation:'append-text',text:'\n'.repeat(100000),separator:'',emptyPolicy:'omit',trailingSeparator:false}],
    ];
    for(const [source,options] of cases) {
        const result=prepareDocumentMutation(source,options);
        assert.equal(result.error?.code,'DOCUMENT_LIMIT',source.format);
        assert.equal(Object.hasOwn(result,'data'),false);
    }
    const [source,options]=cases[1];
    const admitted=prepareDocumentMutation(source,{...options,records:[options.records[0]]});
    assert.equal(admitted.ok,true);
    const reread=prepareDocumentMutation({...source,content:admitted.data.projectedDocument.content},{...options,records:[]});
    assert.equal(reread.ok,true);
    assert.deepEqual(reread.data.projectedDocument.value,admitted.data.projectedDocument.value);
});

test('projects and schema-checks the canonical CSV string cells that the next read observes', () => {
    const source={targetId:'typed-csv',revision:'c1',format:'csv',content:''};
    const options={operation:'add',collectionPath:'',missingPath:'error',columns:['id','enabled','note'],records:[{id:5,enabled:true,note:null}]};
    const result=prepareDocumentMutation(source,options);
    assert.equal(result.ok,true);
    assert.equal(result.data.projectedDocument.content,'id,enabled,note\r\n5,true,\r\n');
    assert.deepEqual(result.data.projectedDocument.value,[{id:'5',enabled:'true',note:''}]);
    const reread=prepareDocumentMutation({...source,content:result.data.projectedDocument.content},{...options,records:[]});
    assert.deepEqual(reread.data.projectedDocument.value,[{id:'5',enabled:'true',note:''}]);
    const numericSchema={type:'object',properties:{id:{type:'integer'},enabled:{type:'boolean'},note:{type:'null'}}};
    const held=prepareDocumentMutation(source,{...options,schema:numericSchema});
    assert.equal(held.error?.code,'SCHEMA_MISMATCH');
    assert.equal(Object.hasOwn(held,'data'),false);
    const stringSchema={type:'object',properties:{id:{type:'string'},enabled:{type:'string'},note:{type:'string'}}};
    const admitted=prepareDocumentMutation(source,{...options,schema:stringSchema});
    assert.equal(admitted.ok,true);
    const checkedAgain=prepareDocumentMutation({...source,content:admitted.data.projectedDocument.content},{...options,schema:stringSchema,records:[]});
    assert.equal(checkedAgain.ok,true);
});

test('preserves readable compact JSON bytes for no-ops despite canonical numeric expansion', () => {
    const content='['+Array.from({length:3000},(_,i)=>'{"id":'+i+',"v":1e20}').join(',')+']';
    const source={targetId:'compact-json',revision:'r1',format:'json',content};
    const options={operation:'add',collectionPath:'',missingPath:'error',records:[],schema:{type:'object',properties:{id:{type:'integer'},v:{type:'number'}}}};
    assert.equal(decodeJson(content).ok,true);
    const result=prepareDocumentMutation(source,options);
    assert.equal(result.ok,true);
    assert.equal(result.data.projectedDocument.content,content);
    assert.deepEqual(result.data.receipt,{changed:false,added:0,updated:0,unchanged:0});
    assert.equal(result.data.projectedDocument.value.length,3000);
    assert.deepEqual(result.data.projectedDocument.value[2999],{id:2999,v:1e20});
    assert.equal(prepareDocumentMutation({...source,content:result.data.projectedDocument.content},options).ok,true);
    assert.equal(prepareDocumentMutation(source,{...options,schema:{properties:{v:{type:'string'}}}}).error?.code,'SCHEMA_MISMATCH');
    assert.equal(formatRecords(result.data.projectedDocument.value,{format:'json'}).error?.code,'FORMAT_LIMIT');
    const rewritten=prepareDocumentMutation(source,{...options,records:[{id:3000,v:1e20}]});
    assert.equal(rewritten.error?.code,'DOCUMENT_LIMIT');
    assert.equal(Object.hasOwn(rewritten,'data'),false);
});

test('reads compact numeric JSON Lines for no-op and literal append without canonical expansion', () => {
    const content='{'+Array.from({length:4000},(_,i)=>'"v'+i+'":1e20').join(',')+'}';
    const source={targetId:'compact-jsonl',revision:'r1',format:'jsonl',content};
    const options={operation:'add',collectionPath:'',missingPath:'error',records:[],schema:{type:'object',properties:{v0:{type:'number'}}}};
    assert.equal(decodeJson(content).ok,true);
    const unchanged=prepareDocumentMutation(source,options);
    assert.equal(unchanged.ok,true);
    assert.equal(unchanged.data.projectedDocument.content,content);
    assert.deepEqual(unchanged.data.receipt,{changed:false,added:0,updated:0,unchanged:0});
    const appended=prepareDocumentMutation(source,{...options,records:[{id:'new'}]});
    assert.equal(appended.ok,true);
    assert.equal(appended.data.projectedDocument.content,content+'\n{"id":"new"}\n');
    assert.deepEqual(appended.data.receipt,{changed:true,added:1,updated:0,unchanged:0});
    assert.equal(appended.data.projectedDocument.value.length,2);
    assert.equal(Object.keys(appended.data.projectedDocument.value[0]).length,4000);
    assert.equal(appended.data.projectedDocument.value[0].v3999,1e20);
    assert.deepEqual(appended.data.projectedDocument.value[1],{id:'new'});
    assert.equal(prepareDocumentMutation({...source,content:appended.data.projectedDocument.content},options).ok,true);
    assert.equal(prepareDocumentMutation(source,{...options,schema:{properties:{v0:{type:'string'}}}}).error?.code,'SCHEMA_MISMATCH');
    assert.equal(formatRecords(appended.data.projectedDocument.value,{format:'jsonl'}).error?.code,'FORMAT_LIMIT');
});
