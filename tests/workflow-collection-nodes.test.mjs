import assert from 'node:assert/strict';
import test from 'node:test';
import { executeCollection, describeCollection, reduceCollection } from '../src/workflow/operations/collection-nodes.js';
const data=value=>({kind:'data',value});
const records=[{id:'first',actorId:'mara',points:20},{id:'second',actorId:'elias',points:50},{id:'third',actorId:'mara',points:30}];
test('filter preserves event ordering for a later count or sum reducer', () => {
    const filtered=executeCollection({operation:'collection',mode:'filter',fieldPath:['actorId'],value:'mara'},{in:data(records)});
    assert.equal(filtered.ok,true,JSON.stringify(filtered.error));
    assert.deepEqual(filtered.artifact.value.map(record=>record.id),['first','third']);
    const count=executeCollection({operation:'collection',mode:'count'},{in:filtered.artifact});
    assert.equal(count.ok,true,JSON.stringify(count.error));
    assert.equal(count.artifact.value,2);
    const sum=executeCollection({operation:'collection',mode:'sum',fieldPath:['points']},{in:filtered.artifact});
    assert.equal(sum.ok,true,JSON.stringify(sum.error));
    assert.equal(sum.artifact.value,50);
});
test('rule lookup selects authored matching rules without inventing rewards', () => {
    const table={ruleSetId:'rewards',revision:1,rules:[{ruleId:'quest',eventType:'quest-completed',amount:100},{ruleId:'kill',eventType:'enemy-defeated',amount:20}]};
    const result=executeCollection({operation:'collection',mode:'rule-lookup',fieldPath:['eventType'],value:'enemy-defeated'},{in:data(table)});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.artifact.value,[{ruleId:'kill',eventType:'enemy-defeated',amount:20}]);
    assert.equal(table.rules.length,2);
});
test('threshold mode enumerates every crossed milestone through the shared progression engine', () => {
    const result=executeCollection({operation:'collection',mode:'threshold',thresholds:'[0,100,300,600]'},{in:data({before:80,after:650})});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.artifact.value.crossings.map(crossing=>crossing.threshold),[100,300,600]);
    assert.equal(result.artifact.value.afterBand,4);
});
test('unique merge preserves source order and refuses conflicting duplicate identities', () => {
    const merged=executeCollection({operation:'collection',mode:'merge',mergePolicy:'add-unique',identityPath:['id']},{in:data(records.slice(0,2)),other:data([records[0],records[2]])});
    assert.equal(merged.ok,true,JSON.stringify(merged.error));
    assert.deepEqual(merged.artifact.value.map(value=>value.id),['first','second','third']);
    const conflict=executeCollection({operation:'collection',mode:'merge',mergePolicy:'add-unique',identityPath:['id']},{in:data(records),other:data([{...records[0],points:99}])});
    assert.equal(conflict.ok,false);
    assert.equal(conflict.error.code,'IDENTITY_CONFLICT');
});
test('lookup detects ambiguous identity and explicit missing-field policy controls filtering', () => {
    const selected=executeCollection({operation:'collection',mode:'lookup',fieldPath:['id'],value:'second'},{in:data(records)});
    assert.equal(selected.ok,true,JSON.stringify(selected.error));
    assert.equal(selected.artifact.value.value.points,50);
    const ambiguous=executeCollection({operation:'collection',mode:'lookup',fieldPath:['actorId'],value:'mara'},{in:data(records)});
    assert.equal(ambiguous.ok,false);
    assert.equal(ambiguous.error.code,'AMBIGUOUS_LOOKUP');
    const held=executeCollection({operation:'collection',mode:'filter',fieldPath:['missing'],value:'mara'},{in:data(records)});
    assert.equal(held.ok,true);
    assert.equal(held.outputStates.out.status,'unresolved');
    const excluded=executeCollection({operation:'collection',mode:'filter',fieldPath:['missing'],missingPolicy:'exclude',value:'mara'},{in:data(records)});
    assert.equal(excluded.ok,true,JSON.stringify(excluded.error));
    assert.deepEqual(excluded.artifact.value,[]);
});
test('empty collections count and sum to zero without model work', () => {
    assert.deepEqual(reduceCollection([],{mode:'count'}),{ok:true,data:{value:0,actualCalls:0}});
    assert.deepEqual(reduceCollection([],{mode:'sum',fieldPath:['points']}),{ok:true,data:{value:0,actualCalls:0}});
    const described=describeCollection({operation:'collection',mode:'count'},{phase:'post'});
    assert.equal(described.ok,true);
    assert.equal(described.data.descriptor.requestBound,0);
});