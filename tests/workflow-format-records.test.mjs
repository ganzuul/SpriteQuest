import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatRecords } from '../src/workflow/operations/format-records.js';

test('maps supplied structured fields without inventing omitted fields', () => {
    const source = [{event:{id:'capture-2'},victim:'Mira',unrelated:'omit'}];
    const result = formatRecords(source, {format:'json',fields:[{name:'eventId',path:['event','id']},{name:'victim',path:['victim']},{name:'cause',path:['cause'],required:false}]});
    assert.equal(result.ok,true);
    assert.deepEqual(result.data.records,[{eventId:'capture-2',victim:'Mira'}]);
    assert.equal(result.data.text,'[{"eventId":"capture-2","victim":"Mira"}]');
    result.data.records[0].victim='changed';
    assert.equal(source[0].victim,'Mira');
});

test('rejects prose as record input instead of guessing a schema', () => {
    const result = formatRecords('Mira captured a soul.',{format:'json'});
    assert.equal(result.error?.code,'INVALID_RECORDS');
    assert.equal(Object.hasOwn(result,'data'),false);
});

test('reports record schema mismatches without coercing types', () => {
    const schema={type:'object',required:['eventId','count'],properties:{eventId:{type:'string'},count:{type:'integer'}}};
    const result = formatRecords([{eventId:'capture-2',count:'1'}],{format:'json',schema});
    assert.equal(result.error?.code,'SCHEMA_MISMATCH');
    assert.equal(result.error.findings[0].path,'/0/count');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.deepEqual(formatRecords([{eventId:'capture-2',count:1}],{format:'json',schema}).data.records,[{eventId:'capture-2',count:1}]);
});

test('rejects non-data settings without executing accessors', () => {
    let reads=0;
    const accessor=Object.defineProperty({},'format',{enumerable:true,get(){reads++;return 'json';}});
    for(const settings of [accessor,null,{}, {format:'xml'}, {format:'json',surprise:true}]) {
        assert.equal(formatRecords({id:'one'},settings).error?.code,'INVALID_FORMAT_SETTINGS');
    }
    assert.equal(reads,0);
});

test('serializes JSON Lines as literal independent records with a final newline', () => {
    const result=formatRecords([{id:'one',note:'line\nbreak'},{id:'two'}],{format:'jsonl'});
    assert.equal(result.data.text,'{"id":"one","note":"line\\nbreak"}\n{"id":"two"}\n');
    assert.deepEqual(result.data.serialization,{format:'jsonl'});
    assert.equal(formatRecords([],{format:'jsonl'}).data.text,'');
});

test('writes CSV with explicit column order, header and escaped multiline cells', () => {
    const result=formatRecords([{id:'one',note:'a,"b"\nnext',enabled:true},{id:'two',note:null,enabled:false}],{format:'csv',columns:['note','id','enabled']});
    assert.equal(result.data.text,'note,id,enabled\r\n"a,""b""\nnext",one,true\r\n,two,false\r\n');
    assert.deepEqual(result.data.serialization,{format:'csv',columns:['note','id','enabled']});
});

test('holds CSV schema changes and nested cells instead of silently dropping them', () => {
    for(const [records,columns] of [[[{id:'one',newColumn:'lose'}],['id']],[[{id:'one'}],['id','missing']],[[{id:{nested:'no'}}],['id']]]) {
        assert.equal(formatRecords(records,{format:'csv',columns}).error?.code,'CSV_RECORD_MISMATCH');
    }
    for(const columns of [undefined,[],['id','id'],[2]]) {
        const settings={format:'csv',...(columns!==undefined?{columns}:{})};
        assert.equal(formatRecords([] ,settings).error?.code,'INVALID_FORMAT_SETTINGS');
    }
    assert.equal(formatRecords([],{format:'csv',columns:['id']}).data.text,'id\r\n');
});

test('renders only explicit text records with declared separators', () => {
    for(const format of ['text','markdown']) {
        const result=formatRecords([{text:'First\nline'},{text:'Second'}],{format,separator:'\n---\n',trailingSeparator:true});
        assert.equal(result.data.text,'First\nline\n---\nSecond\n---\n');
        assert.deepEqual(result.data.serialization,{format,separator:'\n---\n',trailingSeparator:true});
        assert.equal(formatRecords([],{format,separator:'\n',trailingSeparator:false}).data.text,'');
        assert.equal(formatRecords({victim:'Mira'},{format,separator:'\n',trailingSeparator:false}).error?.code,'TEXT_RECORD_MISMATCH');
    }
});

test('bounds mapped records and expanded rendered output before returning data', () => {
    const mapped=formatRecords({text:'a'.repeat(140000)},{format:'jsonl',fields:[{name:'one',path:['text']},{name:'two',path:['text']}]});
    assert.equal(mapped.ok,false);
    assert.equal(Object.hasOwn(mapped,'data'),false);
    const expanded=formatRecords(Array.from({length:500},()=>({text:'x'})),{format:'text',separator:'-'.repeat(600),trailingSeparator:true});
    assert.equal(expanded.error?.code,'FORMAT_LIMIT');
    assert.equal(Object.hasOwn(expanded,'data'),false);
});

test('validates mapping settings even when there are zero input records', () => {
    assert.equal(formatRecords([],{format:'json',fields:[{name:'lost',path:'magic'}]}).error?.code,'INVALID_FIELDS');
    assert.equal(formatRecords([],{format:'json',schema:{$ref:'remote'}}).error?.code,'UNSUPPORTED_SCHEMA');
    assert.deepEqual(formatRecords([],{format:'json'}).data.records,[]);
});

test('rejects serialization settings that have no meaning in the selected format', () => {
    for(const settings of [{format:'json',columns:['id']},{format:'jsonl',separator:'\n'},{format:'csv',columns:['id'],trailingSeparator:false},{format:'text',columns:['text'],separator:'\n',trailingSeparator:false}]) {
        assert.equal(formatRecords({id:'one'},settings).error?.code,'INVALID_FORMAT_SETTINGS');
    }
});

test('preserves legitimate prototype-named data without reading inherited settings', () => {
    const record=JSON.parse('{"__proto__":{"fact":"kept"},"constructor":"literal"}');
    const result=formatRecords(record,{format:'json'});
    assert.deepEqual(JSON.parse(result.data.text),[record]);
    let reads=0,inherited;
    Object.defineProperty(Object.prototype,'fields',{configurable:true,get(){reads++;throw new Error('Inherited mapping must be ignored.');}});
    try {inherited=formatRecords({id:'one'},{format:'json'});}
    finally {delete Object.prototype.fields;}
    assert.equal(reads,0);
    assert.deepEqual(inherited.data.records,[{id:'one'}]);
});

test('holds JSON serializations that the supported raw reader cannot consume', () => {
    for(const format of ['json','jsonl']) {
        const result=formatRecords([{text:'x'.repeat(100001)}],{format});
        assert.equal(result.error?.code,'FORMAT_LIMIT');
        assert.equal(Object.hasOwn(result,'data'),false);
        assert.equal(formatRecords([{text:'x'.repeat(99980)}],{format}).ok,true);
    }
});

test('holds escaped JSON Lines previews that cannot fit bounded plain text data', () => {
    const result=formatRecords(Array.from({length:3},()=>({text:'\n'.repeat(40000)})),{format:'jsonl'});
    assert.equal(result.error?.code,'FORMAT_LIMIT');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.equal(formatRecords(Array.from({length:2},()=>({text:'\n'.repeat(40000)})),{format:'jsonl'}).ok,true);
});

test('exposes explicit CSV string conversion before checking its record schema', () => {
    const source=[{id:5,enabled:true,note:null}];
    const options={format:'csv',columns:['id','enabled','note']};
    const result=formatRecords(source,options);
    assert.deepEqual(result.data.records,[{id:'5',enabled:'true',note:''}]);
    assert.deepEqual(source,[{id:5,enabled:true,note:null}]);
    assert.equal(result.data.text,'id,enabled,note\r\n5,true,\r\n');
    const typed={type:'object',properties:{id:{type:'integer'},enabled:{type:'boolean'},note:{type:'null'}}};
    assert.equal(formatRecords(source,{...options,schema:typed}).error?.code,'SCHEMA_MISMATCH');
    const strings={type:'object',properties:{id:{type:'string'},enabled:{type:'string'},note:{type:'string'}}};
    assert.deepEqual(formatRecords(source,{...options,schema:strings}).data.records,[{id:'5',enabled:'true',note:''}]);
});
