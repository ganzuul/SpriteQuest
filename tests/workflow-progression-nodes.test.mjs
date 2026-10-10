import assert from 'node:assert/strict';
import test from 'node:test';
import { executeIntrospection, describeIntrospection } from '../src/workflow/introspection/nodes.js';
import { projectIntrospectionNode, describeNativeIntrospection, introspectionDefaults } from '../src/workflow/introspection/native.js';

const node=mode=>({type:'workflow',operation:'state',operationVersion:1,mode});
const data=(value,visibility)=>({kind:'data',value,...(visibility?{visibility}:{})});
const state=()=>({values:[{key:'experience',value:80},{key:'mana',value:9}],ledger:[],campaign:'Story-2'});
const rules=()=>({ruleSetId:'campaign-rewards',revision:1,rules:[{ruleId:'quest',eventType:'quest-completed',targetKey:'experience',identityFields:['questId'],mode:'add',amount:100,min:0,max:100000}]});
const event=(eventId,questId,more={})=>({eventId,eventType:'quest-completed',identity:{questId},status:'confirmed',evidence:{origin:'validated-extraction',sourceRevision:'draft-1'},...more});

test('native State Progression executes explicit authored rules and returns reusable state plus a distinct receipt',async()=>{
    const projected=projectIntrospectionNode({...node('progression'),id:'reward',x:10,y:20,label:'Quest rewards'});
    assert.equal(projected.ok,true,JSON.stringify(projected.error));
    const described=describeNativeIntrospection({...node('progression'),id:'reward'},{phase:'post'});
    assert.equal(described.ok,true,JSON.stringify(described.error));
    assert.deepEqual(described.data.ports.filter(pin=>pin.direction==='input').map(pin=>[pin.id,pin.kind,pin.required]),[['state','data',true],['rules','data',true],['events','data',true]]);
    assert.deepEqual(described.data.ports.filter(pin=>pin.direction==='output').map(pin=>pin.id),['out','receipt']);
    assert.equal(described.data.descriptor.requestBound,0);
    const initial=state(),authored=rules(),occurrences=[event('event-a','beacon'),event('event-b','beacon')];
    const before=JSON.stringify({initial,authored,occurrences});
    let calls=0,reads=0,writes=0;
    const ports={request:async()=>{calls++;throw Error('No model call');},memory:{read:async()=>{reads++;throw Error('No ambient state read');},commit:async()=>{writes++;throw Error('No write');}}};
    const result=await executeIntrospection(projected.data,{state:data(initial),rules:data(authored),events:data(occurrences)},ports);
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.outputs.out.value.values.map(value=>value.value),[180,9]);
    assert.equal(result.outputs.out.value.campaign,'Story-2');
    assert.deepEqual(result.outputs.receipt.value.receipts.map(value=>value.status),['applied','duplicate']);
    assert.equal(result.outputs.receipt.value.status,'proposed');
    assert.equal(result.outputs.receipt.value.acceptance,'pending');
    assert.equal(result.outputs.out.status,'proposed');
    assert.equal(JSON.stringify({initial,authored,occurrences}),before);
    assert.equal(calls+reads+writes,0);
    const replay=await executeIntrospection(node('progression'),{state:result.outputs.out,rules:data(authored),events:data(occurrences)},ports);
    assert.equal(replay.ok,true,JSON.stringify(replay.error));
    assert.equal(replay.outputs.out.value.values[0].value,180);
    assert.equal(replay.outputs.out.value.ledger.length,1);
    assert.deepEqual(introspectionDefaults('state','progression'),{mode:'progression'});
    assert.equal(describeIntrospection(node('progression')).ok,true);
});
const clock=absoluteMinute=>({clockId:'campaign-clock',calendarId:'campaign-calendar',dayLengthMinutes:1440,absoluteMinute,revision:1});
test('State Time Decay uses the supplied effective clock for exact elapsed recovery and replays without extra decay',async()=>{
    const authored=[{decayId:'recover',revision:2,targetKey:'experience',baseline:10,unitsPerMinute:1,min:0,max:100,initialMinute:10}];
    const initial=state();
    let reads=0;
    const ports={memory:{read:async()=>{reads++;return {ok:false,error:{code:'PRIVATE_FAILURE',message:'DO_NOT_LEAK'}};}}};
    const result=await executeIntrospection(node('time-decay'),{state:data(initial),rules:data(authored),clock:data(clock(70))},ports);
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.deepEqual(result.outputs.out.value.values.map(value=>value.value),[20,9]);
    assert.equal(result.outputs.out.value.campaign,'Story-2');
    assert.equal(result.outputs.receipt.value.receipts[0].elapsedMinutes,60);
    assert.equal(result.outputs.receipt.value.receipts[0].ruleRevision,2);
    assert.equal(result.outputs.receipt.value.clock.absoluteMinute,70);
    const replay=await executeIntrospection(node('time-decay'),{state:result.outputs.out,rules:data(authored),clock:data(clock(70))},ports);
    assert.equal(replay.ok,true,JSON.stringify(replay.error));
    assert.equal(replay.outputs.receipt.value.receipts[0].elapsedMinutes,0);
    assert.equal(replay.outputs.out.value.values[0].value,20);
    const later=await executeIntrospection(node('time-decay'),{state:replay.outputs.out,rules:data(authored),clock:data(clock(90))},ports);
    assert.equal(later.ok,true,JSON.stringify(later.error));
    assert.equal(later.outputs.out.value.values[0].value,10);
    const backward=await executeIntrospection(node('time-decay'),{state:later.outputs.out,rules:data(authored),clock:data(clock(80))},ports);
    assert.equal(backward.ok,false);
    assert.equal(backward.error.code,'BACKWARD_TIME');
    assert.equal(reads,0);
    assert.deepEqual(initial,state());
    const description=describeNativeIntrospection(node('time-decay'));
    assert.equal(description.ok,true,JSON.stringify(description.error));
    assert.deepEqual(description.data.ports.filter(pin=>pin.direction==='input').map(pin=>[pin.id,pin.required]),[['state',true],['rules',true],['clock',true]]);
});
test('directed relationship pacing retains event days, cooldowns and private receipts through State',async()=>{
    const initial={values:[{key:'mira->elias',value:18,subjectId:'Mira',objectId:'Elias',visibility:'actor-private'},{key:'mana',value:9}],ledger:[],campaign:'Story-2'};
    const authored={ruleSetId:'romance',revision:3,dayLengthMinutes:1440,rules:[{ruleId:'moment',eventType:'romantic-moment',targetKey:'mira->elias',subjectId:'Mira',objectId:'Elias',identityFields:['momentId'],mode:'add',amount:2,min:0,max:100,positiveSceneCap:2,positiveDayCap:4,cooldownMinutes:30,diminishingFactors:[1,0.5],zeroDeltaPolicy:'consume'}]};
    const moment=(eventId,absoluteMinute,sceneId,objectId='Elias')=>({eventId,eventType:'romantic-moment',identity:{momentId:eventId},status:'confirmed',evidence:{origin:'validated-extraction'},subjectId:'Mira',objectId,sceneId,absoluteMinute});
    const result=await executeIntrospection(node('progression'),{state:data(initial),rules:data(authored),events:data([moment('m1',1438,'a'),moment('m2',1441,'a'),moment('m3',1468,'b'),moment('m4',1469,'b','Laya')])});
    assert.equal(result.ok,true,JSON.stringify(result.error));
    assert.equal(result.outputs.out.value.values[0].value,21);
    assert.equal(result.outputs.out.value.values[1].value,9);
    assert.deepEqual(result.outputs.receipt.value.receipts.slice(0,3).map(receipt=>[receipt.allowed,receipt.storyDay]),[[2,1],[0,2],[1,2]]);
    assert.equal(result.outputs.receipt.value.receipts[3].status,'unmatched');
    assert.equal(result.outputs.out.value.ledger.length,3);
    const visibility={kind:'actor-private',actorId:'Mira'};
    for(const artifact of Object.values(result.outputs))assert.deepEqual(artifact.visibility,visibility);
    assert.deepEqual(result.outputs.out.value.visibility,visibility);
    for(const receipt of result.outputs.receipt.value.receipts)assert.deepEqual(receipt.visibility,visibility);
    for(const receipt of result.outputs.out.value.ledger)assert.deepEqual(receipt.visibility,visibility);
    assert.equal(initial.values[0].value,18);
});

test('implicit introspection envelopes and explicit mixed restrictions taint every generic State output',async()=>{
    const privateTypes=['actor-state','reflection','state-proposal','events','episodes','commit-intent'];
    for(const recordType of privateTypes) {
        const privateNote={schemaVersion:1,recordType,scope:{actorId:'Mira',chatId:'Story-2'},payload:{privateFeeling:'A secret thought.'}};
        const initial={...state(),notes:{visibility:'public',privateNote}};
        const progression=await executeIntrospection(node('progression'),{state:data(initial),rules:data(rules()),events:data([])});
        assert.equal(progression.ok,true,JSON.stringify(progression.error));
        for(const artifact of Object.values(progression.outputs))assert.deepEqual(artifact.visibility,{kind:'actor-private',actorId:'Mira'},recordType);
        assert.deepEqual(progression.outputs.receipt.value.visibility,{kind:'actor-private',actorId:'Mira'});
        const timed=await executeIntrospection(node('time-decay'),{state:data(state()),rules:data([]),clock:data({...clock(70),privateNote})});
        assert.equal(timed.ok,true,JSON.stringify(timed.error));
        for(const artifact of Object.values(timed.outputs))assert.deepEqual(artifact.visibility,{kind:'actor-private',actorId:'Mira'},recordType);
    }
    const mixed=await executeIntrospection(node('progression'),{state:data(state(),{kind:'actor-private',actorId:'Mira'}),rules:data(rules(),{kind:'actor-private',actorId:'Laya'}),events:data([])});
    assert.equal(mixed.ok,true,JSON.stringify(mixed.error));
    for(const artifact of Object.values(mixed.outputs))assert.deepEqual(artifact.visibility,{kind:'hidden'});
    const restricted=await executeIntrospection(node('progression'),{state:data({...state(),notes:{visibleTo:['Mira']}}),rules:data(rules()),events:data([])});
    assert.equal(restricted.ok,true,JSON.stringify(restricted.error));
    for(const artifact of Object.values(restricted.outputs))assert.deepEqual(artifact.visibility,{kind:'hidden'});
});
test('generic State modes hold missing required inputs and reject unconfirmed or unauthored changes without invoking services',async()=>{
    let calls=0;
    const ports={request:async()=>{calls++;return {ok:false,error:{code:'PRIVATE_FAILURE',message:'DO_NOT_LEAK'}};},memory:{read:async()=>{calls++;return {ok:false,error:{code:'PRIVATE_FAILURE',message:'DO_NOT_LEAK'}};},commit:async()=>{calls++;throw Error('DO_NOT_LEAK');}}};
    const cases=[
        [node('progression'),{rules:data(rules()),events:data([])},'MISSING_INPUT'],
        [node('progression'),{state:data(state()),rules:data(rules())},'MISSING_INPUT'],
        [node('time-decay'),{state:data(state()),rules:data([])},'MISSING_INPUT'],
        [node('progression'),{state:data(state()),rules:data(rules()),events:data([{...event('a','beacon'),status:'candidate'}])},'INVALID_PROGRESSION'],
        [node('progression'),{state:data(state()),rules:data({...rules(),rules:[{...rules().rules[0],modelAward:999}]}),events:data([event('a','beacon')])},'INVALID_PROGRESSION'],
        [node('time-decay'),{state:data(state()),rules:data([{decayId:'recover',revision:1,targetKey:'experience',baseline:0,unitsPerMinute:1,min:0,max:100,initialMinute:0,modelAward:999}]),clock:data(clock(70))},'INVALID_TIME_DECAY'],
    ];
    for(const [operation,inputs,code] of cases) {
        const result=await executeIntrospection(operation,inputs,ports);
        assert.equal(result.ok,false,JSON.stringify(result));
        assert.equal(result.error.code,code);
        assert.equal(Object.hasOwn(result,'outputs'),false);
        assert.equal(JSON.stringify(result).includes('DO_NOT_LEAK'),false);
    }
    const privateState={values:[{key:'relationship',value:18,subjectId:'Mira',objectId:'Elias',visibility:'actor-private'}],ledger:[]};
    const unscoped={ruleSetId:'romance',revision:1,rules:[{ruleId:'kiss',eventType:'kiss',targetKey:'relationship',identityFields:['momentId'],mode:'add',amount:2,min:0,max:100}]};
    const privateResult=await executeIntrospection(node('progression'),{state:data(privateState),rules:data(unscoped),events:data([])},ports);
    assert.equal(privateResult.ok,false);
    assert.equal(privateResult.error.code,'INVALID_PROGRESSION');
    assert.equal(calls,0);
});

test('generic State admission rejects accessor and oversized inputs safely and respects cancellation',async()=>{
    let reads=0;
    const inputs={state:data(state()),rules:data(rules()),events:data([])};
    const hostile={...state(),get campaign(){reads++;return 'secret';}};
    const badInput=await executeIntrospection(node('progression'),{...inputs,state:data(hostile)});
    assert.equal(badInput.ok,false);
    const badPorts=await executeIntrospection(node('progression'),inputs,{get memory(){reads++;throw Error('secret');}});
    assert.equal(badPorts.ok,false);
    assert.equal(badPorts.error.code,'INVALID_PORTS');
    const badNode=await executeIntrospection({...node('progression'),get mode(){reads++;return 'progression';}},inputs);
    assert.equal(badNode.ok,false);
    assert.equal(reads,0);
    const cyclic=state();cyclic.self=cyclic;
    assert.equal((await executeIntrospection(node('progression'),{...inputs,state:data(cyclic)})).ok,false);
    assert.equal((await executeIntrospection(node('progression'),{...inputs,state:data({...state(),notes:'😀'.repeat(70000)})})).ok,false);
    const controller=new AbortController();controller.abort();
    const stopped=await executeIntrospection(node('progression'),inputs,{signal:controller.signal});
    assert.equal(stopped.ok,false);
    assert.equal(stopped.error.code,'ABORTED');
});