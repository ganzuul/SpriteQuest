import assert from 'node:assert/strict';
import { test } from 'node:test';
import { applyProgressionEvents } from '../src/workflow/progression.js';

const state = () => ({values:[{key:'player-xp',value:80,actorId:'player'}],ledger:[],campaign:'Story-2'});
const rules = () => ({ruleSetId:'campaign-rewards',revision:1,rules:[
    {ruleId:'quest',eventType:'quest-completed',targetKey:'player-xp',identityFields:['questId'],mode:'add',amount:100,min:0,max:100000},
    {ruleId:'repeatable-quest',eventType:'repeatable-quest-completed',targetKey:'player-xp',identityFields:['questInstanceId'],mode:'add',amount:100,min:0,max:100000},
]});
const event = (eventId,eventType,identity,more={}) => ({eventId,eventType,identity,status:'confirmed',evidence:{origin:'validated-extraction',sourceRevision:'draft-1'},...more});

test('authored quest rewards deduplicate quest identity and preserve unrelated state', () => {
    const initial = state(), authored = rules(), occurrences = [
        event('event-a','quest-completed',{questId:'beacon'}),
        event('event-b','quest-completed',{questId:'beacon'}),
        event('event-c','repeatable-quest-completed',{questInstanceId:'courier-1'}),
        event('event-d','repeatable-quest-completed',{questInstanceId:'courier-2'}),
    ];
    const result = applyProgressionEvents(initial,occurrences,authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.equal(result.data.state.values[0].value,380);
    assert.equal(result.data.state.campaign,'Story-2');
    assert.equal(result.data.ledger.length,3);
    assert.deepEqual(result.data.receipts.map(item=>item.status),['applied','duplicate','applied','applied']);
    assert.equal(result.data.actualCalls,0);
    assert.deepEqual(initial,state());
    const replay = applyProgressionEvents(result.data.state,occurrences,authored);
    assert.equal(replay.ok,true);
    assert.equal(replay.data.state.values[0].value,380);
    assert.equal(replay.data.ledger.length,3);
});
import * as progression from '../src/workflow/progression.js';

test('all cumulative thresholds crossed by one authored award are reported in order', () => {
    const result = progression.resolveThresholds(80,650,[0,100,300,600]);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.crossings.map(item=>item.threshold),[100,300,600]);
    assert.equal(result.data.beforeBand,1);
    assert.equal(result.data.afterBand,4);
    assert.equal(result.data.actualCalls,0);
});


test('directed relationship events consume projected scene/day caps at each event day', () => {
    const initial = {values:[
        {key:'mira->elias',value:18,subjectId:'mira',objectId:'elias',visibility:'actor-private'},
        {key:'elias->mira',value:31,subjectId:'elias',objectId:'mira',visibility:'actor-private'},
    ],ledger:[]};
    const authored = {ruleSetId:'romance',revision:1,dayLengthMinutes:1440,rules:[
        {ruleId:'mira-moment',eventType:'romantic-moment',targetKey:'mira->elias',subjectId:'mira',objectId:'elias',identityFields:['momentId'],mode:'add',amount:2,min:0,max:100,positiveSceneCap:2,positiveDayCap:4,zeroDeltaPolicy:'consume'},
        {ruleId:'elias-moment',eventType:'romantic-moment',targetKey:'elias->mira',subjectId:'elias',objectId:'mira',identityFields:['momentId'],mode:'add',amount:1,min:0,max:100,positiveSceneCap:2,positiveDayCap:4,zeroDeltaPolicy:'consume'},
    ]};
    const moments = [
        event('m1','romantic-moment',{momentId:'1'},{subjectId:'mira',objectId:'elias',sceneId:'a',absoluteMinute:1438}),
        event('m2','romantic-moment',{momentId:'2'},{subjectId:'mira',objectId:'elias',sceneId:'a',absoluteMinute:1441}),
        event('m3','romantic-moment',{momentId:'3'},{subjectId:'mira',objectId:'elias',sceneId:'b',absoluteMinute:1442}),
        event('e1','romantic-moment',{momentId:'1'},{subjectId:'elias',objectId:'mira',sceneId:'b',absoluteMinute:1442}),
    ];
    const result = applyProgressionEvents(initial,moments,authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.state.values.map(item=>item.value),[22,32]);
    assert.deepEqual(result.data.receipts.map(item=>[item.allowed,item.storyDay]),[[2,1],[0,2],[2,2],[1,2]]);
    assert.equal(result.data.ledger.length,4,'capped-zero event is consumed by authored policy');
    assert.deepEqual(result.data.state.values.map(item=>item.visibility),['actor-private','actor-private']);
});


test('numeric set and clamp are authored modes that preserve other metrics', () => {
    const initial = {values:[{key:'shield',value:75},{key:'mana',value:9}],ledger:[],notes:'keep'};
    const authored = {ruleSetId:'mechanics',revision:1,rules:[
        {ruleId:'set-shield',eventType:'ward-cast',targetKey:'shield',identityFields:['castId'],mode:'set',amount:120,min:0,max:100},
        {ruleId:'clamp-shield',eventType:'ward-weakened',targetKey:'shield',identityFields:['damageId'],mode:'clamp',min:0,max:40},
    ]};
    const result = applyProgressionEvents(initial,[
        event('cast','ward-cast',{castId:'1'}),
        event('damage','ward-weakened',{damageId:'1'}),
    ],authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.receipts.map(item=>[item.before,item.raw,item.allowed,item.after]),[[75,45,25,100],[100,0,-60,40]]);
    assert.deepEqual(result.data.state.values.map(item=>item.value),[40,9]);
    assert.equal(result.data.state.notes,'keep');
});


test('cooldown boundaries and diminishing factors use explicit story time and consumed history', () => {
    const initial = {values:[{key:'focus',value:10}],ledger:[]};
    const authored = {ruleSetId:'practice',revision:1,rules:[
        {ruleId:'compliment',eventType:'compliment',targetKey:'focus',identityFields:['momentId'],mode:'add',amount:2,min:0,max:100,cooldownMinutes:480,diminishingFactors:[1,0.5,0],zeroDeltaPolicy:'consume'},
    ]};
    const result = applyProgressionEvents(initial,[
        event('a','compliment',{momentId:'1'},{absoluteMinute:360}),
        event('b','compliment',{momentId:'2'},{absoluteMinute:839}),
        event('c','compliment',{momentId:'3'},{absoluteMinute:840}),
        event('d','compliment',{momentId:'4'},{absoluteMinute:1320}),
    ],authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.receipts.map(item=>item.allowed),[2,0,1,0]);
    assert.equal(result.data.receipts[1].reasons.includes('cooldown'),true);
    assert.equal(result.data.receipts[2].reasons.includes('diminishing-returns'),true);
    assert.equal(result.data.state.values[0].value,13);
    assert.equal(result.data.ledger.length,4);
});


test('time-based recovery approaches an authored baseline once per established minute', () => {
    const initial={values:[{key:'temporary-desire',value:50},{key:'attraction',value:18}],ledger:[]};
    const decayRules=[{decayId:'desire-fades',revision:1,targetKey:'temporary-desire',baseline:0,unitsPerMinute:0.1,min:0,max:100,initialMinute:360}];
    const result=progression.projectTimeDecay(initial,480,decayRules);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.state.values.map(item=>item.value),[38,18]);
    assert.deepEqual(result.data.receipts.map(item=>[item.elapsedMinutes,item.before,item.after]),[[120,50,38]]);
    assert.equal(result.data.actualCalls,0);
    const replay=progression.projectTimeDecay(result.data.state,480,decayRules);
    assert.equal(replay.ok,true);
    assert.equal(replay.data.state.values[0].value,38);
    const later=progression.projectTimeDecay(replay.data.state,1000,decayRules);
    assert.equal(later.ok,true);
    assert.equal(later.data.state.values[0].value,0);
    assert.equal(progression.projectTimeDecay(result.data.state,479,decayRules).ok,false);
    assert.deepEqual(initial.values.map(item=>item.value),[50,18]);
});


test('invalid authorship configuration and uncertain evidence cannot silently apply a reward', () => {
    const malformed=rules();
    malformed.rules[0].positiveScenCap=2;
    assert.equal(applyProgressionEvents(state(),[event('a','quest-completed',{questId:'beacon'})],malformed).ok,false,'unknown rule settings must reject');
    const unsupported=event('a','quest-completed',{questId:'beacon'});
    unsupported.evidence={};
    assert.equal(applyProgressionEvents(state(),[unsupported],rules()).ok,false,'confirmed label alone is not provenance');
    unsupported.evidence={origin:'validated-extraction'};
    unsupported.status='unresolved';
    assert.equal(applyProgressionEvents(state(),[unsupported],rules()).ok,false);
    const privateState={values:[{key:'mira->elias',value:18,subjectId:'mira',objectId:'elias',visibility:'actor-private'}],ledger:[]};
    const privateRules=rules();privateRules.rules=[{...privateRules.rules[0],targetKey:'mira->elias'}];
    assert.equal(applyProgressionEvents(privateState,[event('a','quest-completed',{questId:'beacon'})],privateRules).ok,false,'a private target requires an explicit directed rule scope');
});


test('reusing one occurrence ID for incompatible authored facts is a visible conflict', () => {
    const initial=state();
    const result=applyProgressionEvents(initial,[
        event('same-id','quest-completed',{questId:'beacon'}),
        event('same-id','repeatable-quest-completed',{questInstanceId:'courier-1'}),
    ],rules());
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'EVENT_ID_CONFLICT');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.deepEqual(initial,state());
    const first=applyProgressionEvents(initial,[event('same-id','quest-completed',{questId:'beacon'})],rules());
    const changed=applyProgressionEvents(first.data.state,[event('same-id','quest-completed',{questId:'observatory'})],rules());
    assert.equal(changed.ok,false);
    assert.equal(changed.error.code,'EVENT_ID_CONFLICT');
    const nextRules=rules();nextRules.revision=2;nextRules.rules[0].amount=999;
    const replay=applyProgressionEvents(first.data.state,[event('new-attempt','quest-completed',{questId:'beacon'})],nextRules);
    assert.equal(replay.ok,true);
    assert.equal(replay.data.state.values[0].value,180);
});


test('shared positive budgets cannot be bypassed by a second rule with a different cap', () => {
    const authored=rules();authored.rules[0].positiveSceneCap=2;
    authored.rules[1].positiveSceneCap=20;
    const result=applyProgressionEvents(state(),[
        event('a','quest-completed',{questId:'beacon'},{sceneId:'same'}),
        event('b','repeatable-quest-completed',{questInstanceId:'courier-1'},{sceneId:'same'}),
    ],authored);
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'INVALID_PROGRESSION');
    authored.rules[1].budgetGroup='repeatable-rewards';
    const separate=applyProgressionEvents(state(),[
        event('a','quest-completed',{questId:'beacon'},{sceneId:'same'}),
        event('b','repeatable-quest-completed',{questInstanceId:'courier-1'},{sceneId:'same'}),
    ],authored);
    assert.equal(separate.ok,true,JSON.stringify(separate));
    assert.equal(separate.data.state.values[0].value,102);
});


test('temporal progression rejects out-of-order occurrences instead of consuming a false cooldown', () => {
    const authored=rules();authored.rules[0].cooldownMinutes=480;
    const result=applyProgressionEvents(state(),[
        event('later','quest-completed',{questId:'later'},{absoluteMinute:840}),
        event('earlier','quest-completed',{questId:'earlier'},{absoluteMinute:360}),
    ],authored);
    assert.equal(result.ok,false);
    assert.equal(result.error.code,'EVENT_ORDER');
});


test('empty and retained-zero progression paths do not invent bookkeeping writes', () => {
    const initial=state();
    const empty=applyProgressionEvents(initial,[],rules());
    assert.equal(empty.ok,true);
    assert.deepEqual(empty.data.state,initial);
    const authored=rules();authored.rules[0].positiveSceneCap=0;authored.rules[0].zeroDeltaPolicy='retain';
    authored.rules[1].budgetGroup='independent';
    const held=applyProgressionEvents(initial,[event('a','quest-completed',{questId:'beacon'},{sceneId:'a'})],authored);
    assert.equal(held.ok,true,JSON.stringify(held));
    assert.deepEqual(held.data.state,initial);
    assert.equal(held.data.receipts[0].status,'retained');
    const noDecay=progression.projectTimeDecay(initial,360,[]);
    assert.equal(noDecay.ok,true);
    assert.deepEqual(noDecay.data.state,initial);
});


test('bounded own-data admission never evaluates model-shaped getters or sparse arrays', () => {
    let reads=0;
    const unsafe=rules();
    Object.defineProperty(unsafe.rules[0],'amount',{enumerable:true,get(){reads++;return 100;}});
    const result=applyProgressionEvents(state(),[event('a','quest-completed',{questId:'beacon'})],unsafe);
    assert.equal(result.ok,false);assert.equal(reads,0);assert.equal(Object.hasOwn(result,'data'),false);
    const sparse=new Array(2);sparse[1]=event('a','quest-completed',{questId:'beacon'});
    assert.equal(applyProgressionEvents(state(),sparse,rules()).ok,false);
    const cyclic=state();cyclic.cycle=cyclic;
    assert.equal(applyProgressionEvents(cyclic,[],rules()).ok,false);
});

test('bounds consume new zero-delta events while negative awards do not refund positive caps', () => {
    const initial={values:[{key:'affinity',value:98}],ledger:[]};
    const authored={ruleSetId:'pacing',revision:1,rules:[
        {ruleId:'gain',eventType:'gain',targetKey:'affinity',identityFields:['momentId'],mode:'add',amount:5,min:0,max:100,positiveSceneCap:2,zeroDeltaPolicy:'consume'},
        {ruleId:'loss',eventType:'loss',targetKey:'affinity',identityFields:['momentId'],mode:'add',amount:-1,min:0,max:100,positiveSceneCap:2,zeroDeltaPolicy:'consume'},
    ]};
    const result=applyProgressionEvents(initial,[
        event('a','gain',{momentId:'1'},{sceneId:'same'}),
        event('b','loss',{momentId:'2'},{sceneId:'same'}),
        event('c','gain',{momentId:'3'},{sceneId:'same'}),
    ],authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.receipts.map(item=>item.allowed),[2,-1,0]);
    assert.equal(result.data.ledger.length,3);assert.equal(result.data.state.values[0].value,99);
});

test('each event consumes its remaining day allowance across scenes and exact midnight', () => {
    const authored=rules();authored.dayLengthMinutes=1440;
    authored.rules[0].positiveSceneCap=100;authored.rules[0].positiveDayCap=4;
    authored.rules[1].budgetGroup='other';
    const result=applyProgressionEvents(state(),[
        event('a','quest-completed',{questId:'a'},{sceneId:'one',absoluteMinute:1400}),
        event('b','quest-completed',{questId:'b'},{sceneId:'two',absoluteMinute:1439}),
        event('c','quest-completed',{questId:'c'},{sceneId:'two',absoluteMinute:1440}),
    ],authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.deepEqual(result.data.receipts.map(item=>[item.allowed,item.storyDay]),[[4,1],[0,1],[4,2]]);
    assert.equal(result.data.state.values[0].value,88);
    const unknown=applyProgressionEvents(state(),[event('d','quest-completed',{questId:'d'},{sceneId:'three'})],authored);
    assert.equal(unknown.ok,false);assert.equal(unknown.error.code,'UNRESOLVED_TIME');
});

test('threshold endpoints, descending changes and invalid cumulative tables are explicit', () => {
    assert.deepEqual(progression.resolveThresholds(100,300,[0,100,300,600]).data.crossings.map(item=>item.threshold),[300]);
    assert.deepEqual(progression.resolveThresholds(650,80,[0,100,300,600]).data.crossings.map(item=>item.threshold),[600,300,100]);
    assert.deepEqual(progression.resolveThresholds(100,100,[0,100,300]).data.crossings,[]);
    for(const table of [[0,100,100],[100,0],[0,NaN],[0,Infinity],new Array(2)])assert.equal(progression.resolveThresholds(80,650,table).ok,false);
    assert.equal(progression.resolveThresholds(Infinity,650,[0,100]).ok,false);
});

test('invalid arithmetic and recovery policy hold the complete projection', () => {
    const authored=rules();authored.rules[0].amount=Number.MAX_SAFE_INTEGER;authored.rules[0].max=Number.MAX_SAFE_INTEGER;
    assert.equal(applyProgressionEvents(state(),[event('a','quest-completed',{questId:'a'})],authored).ok,false);
    const initial={values:[{key:'recovery',value:10}],ledger:[]};
    const recovery={decayId:'recover',revision:1,targetKey:'recovery',baseline:20,unitsPerMinute:1,min:0,max:100,initialMinute:0};
    assert.equal(progression.projectTimeDecay(initial,5,[recovery]).data.state.values[0].value,15);
    assert.equal(progression.projectTimeDecay(initial,5,[{...recovery,baseline:101}]).ok,false);
    assert.equal(progression.projectTimeDecay(initial,Number.MAX_SAFE_INTEGER,[{...recovery,unitsPerMinute:2}]).ok,false);
    assert.equal(progression.projectTimeDecay(initial,5,[recovery,{...recovery,decayId:'another'}]).ok,false);
});


test('authored bounds cannot force positive gains beyond scene or day caps', () => {
    const initial={values:[{key:'affinity',value:0}],ledger:[]};
    const authored={ruleSetId:'pacing',revision:1,dayLengthMinutes:1440,rules:[
        {ruleId:'gain',eventType:'gain',targetKey:'affinity',identityFields:['momentId'],mode:'set',amount:80,min:50,max:100,positiveSceneCap:2,positiveDayCap:4},
    ]};
    const occurrence=event('a','gain',{momentId:'1'},{sceneId:'same',absoluteMinute:10});
    const result=applyProgressionEvents(initial,[occurrence],authored);
    assert.equal(result.ok,false,'incompatible bounds must hold rather than bypass the cap');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.deepEqual(initial.values,[{key:'affinity',value:0}]);
    authored.rules[0].amount=1;
    assert.equal(applyProgressionEvents(initial,[occurrence],authored).ok,false,'the bounds cannot bypass a cap even when the raw award is smaller');
});
test('reordering configured identity fields across rule revisions does not reaward an occurrence', () => {
    const authored=rules();authored.rules[0].identityFields=['questId','questInstanceId'];
    const occurrence=event('a','quest-completed',{questId:'beacon',questInstanceId:'first'});
    const first=applyProgressionEvents(state(),[occurrence],authored);
    assert.equal(first.ok,true);
    const reordered=structuredClone(authored);reordered.revision=2;reordered.rules[0].identityFields.reverse();
    const replay=applyProgressionEvents(first.data.state,[occurrence],reordered);
    assert.equal(replay.ok,true);
    assert.equal(replay.data.state.values[0].value,180);
    assert.equal(replay.data.receipts[0].status,'duplicate');
    assert.equal(replay.data.ledger.length,1);
});
test('one occurrence cannot move to a different scene or story minute to escape retained caps', () => {
    const authored={ruleSetId:'pacing',revision:1,dayLengthMinutes:1440,rules:[
        {ruleId:'gain',eventType:'gain',targetKey:'affinity',identityFields:['momentId'],mode:'add',amount:2,min:0,max:100,positiveSceneCap:2,positiveDayCap:4,zeroDeltaPolicy:'retain'},
    ]};
    const initial={values:[{key:'affinity',value:0}],ledger:[],budgets:{scene:{},day:{}}};
    initial.budgets.scene[JSON.stringify(['affinity','affinity','full'])]=2;
    initial.budgets.day[JSON.stringify(['affinity','affinity',1])]=4;
    const retained=event('same','gain',{momentId:'one'},{sceneId:'full',absoluteMinute:10});
    for(const changed of [{sceneId:'different'},{absoluteMinute:1440},{sceneId:'different',absoluteMinute:1440}]){
        const result=applyProgressionEvents(initial,[retained,{...retained,...changed}],authored);
        assert.equal(result.ok,false,'attribution is immutable even when no award is consumed');
        assert.equal(result.error.code,'EVENT_ID_CONFLICT');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
});
test('elapsed-time decay requires the same explicitly authored private actor pair as awards', () => {
    const initial={values:[{key:'mira->elias',value:20,subjectId:'mira',objectId:'elias',visibility:'actor-private'}],ledger:[]};
    const rule={decayId:'cool-off',revision:1,targetKey:'mira->elias',baseline:0,unitsPerMinute:1,min:0,max:100,initialMinute:0};
    for(const scope of [{},{subjectId:'mira'},{subjectId:'elias',objectId:'mira'}]){
        const result=progression.projectTimeDecay(initial,10,[{...rule,...scope}]);
        assert.equal(result.ok,false,'private decay must declare its matching directed pair');
        assert.equal(Object.hasOwn(result,'data'),false);
    }
    const result=progression.projectTimeDecay(initial,10,[{...rule,subjectId:'mira',objectId:'elias'}]);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.equal(result.data.state.values[0].value,10);
    assert.deepEqual(initial.values[0],{key:'mira->elias',value:20,subjectId:'mira',objectId:'elias',visibility:'actor-private'});
});
test('set preserves the authored value and rejects unsafe intermediate deltas', () => {
    const authored={ruleSetId:'exact-set',revision:1,rules:[
        {ruleId:'set',eventType:'set',targetKey:'metric',identityFields:['id'],mode:'set',amount:Number.MAX_SAFE_INTEGER-1,min:-Number.MAX_SAFE_INTEGER,max:Number.MAX_SAFE_INTEGER},
    ]};
    const occurrence=event('one','set',{id:'one'});
    const unsafe=applyProgressionEvents({values:[{key:'metric',value:-Number.MAX_SAFE_INTEGER}],ledger:[]},[occurrence],authored);
    assert.equal(unsafe.ok,false,'unsafe delta must not round to a different authored value');
    assert.equal(Object.hasOwn(unsafe,'data'),false);
    authored.rules[0].amount=0.1;
    const exact=applyProgressionEvents({values:[{key:'metric',value:Number.MAX_SAFE_INTEGER-1}],ledger:[]},[occurrence],authored);
    assert.equal(exact.ok,true,JSON.stringify(exact));
    assert.equal(exact.data.state.values[0].value,0.1,'an unmodified set uses the authored value directly');
});
test('generated reward identity keys obey the same bounds required for ledger replay', () => {
    const key='k'.repeat(256), identity=Object.fromEntries(Array.from({length:14},(_,index)=>['f'+index,'v'.repeat(240)]));
    const initial={values:[{key,value:0}],ledger:[]};
    const authored={ruleSetId:'r'.repeat(256),revision:1,rules:[
        {ruleId:'q'.repeat(256),eventType:'gain',targetKey:key,identityFields:Object.keys(identity),mode:'add',amount:1,min:0,max:100},
    ]};
    const occurrence=event('one','gain',identity);
    const oversized=applyProgressionEvents(initial,[occurrence],authored);
    assert.equal(oversized.ok,false,'a successful projection must remain admissible on replay');
    assert.equal(Object.hasOwn(oversized,'data'),false);
    occurrence.identity=Object.fromEntries(Object.keys(identity).map(field=>[field,'v'.repeat(200)]));
    const first=applyProgressionEvents(initial,[occurrence],authored);
    assert.equal(first.ok,true,JSON.stringify(first));
    const replay=applyProgressionEvents(first.data.state,[occurrence],authored);
    assert.equal(replay.ok,true,JSON.stringify(replay));
    assert.equal(replay.data.state.values[0].value,1);
    assert.equal(replay.data.receipts[0].status,'duplicate');
});
test('fractional positive caps absorb arithmetic dust while real overruns still hold', () => {
    const initial={values:[{key:'metric',value:0.2}],ledger:[]};
    const authored={ruleSetId:'fractional',revision:1,rules:[
        {ruleId:'gain',eventType:'gain',targetKey:'metric',identityFields:['id'],mode:'add',amount:0.1,min:0,max:100,positiveSceneCap:0.1},
    ]};
    const occurrence=event('one','gain',{id:'one'},{sceneId:'scene'});
    const result=applyProgressionEvents(initial,[occurrence],authored);
    assert.equal(result.ok,true,JSON.stringify(result));
    assert.equal(result.data.receipts[0].allowed,0.1);
    assert.equal(Object.values(result.data.state.budgets.scene)[0],0.1);
    authored.rules[0].min=0.301;
    assert.equal(applyProgressionEvents(initial,[occurrence],authored).ok,false,'a real cap overrun still holds');
    authored.rules[0].positiveSceneCap=0;
    assert.equal(applyProgressionEvents(initial,[occurrence],authored).ok,false,'zero cap never absorbs a positive change');
});
test('bounded actual clamp delta must be safe before receipts or projected state are returned', () => {
    const initial={values:[{key:'metric',value:-Number.MAX_SAFE_INTEGER}],ledger:[]};
    const authored={ruleSetId:'clamp',revision:1,rules:[
        {ruleId:'clamp',eventType:'clamp',targetKey:'metric',identityFields:['id'],mode:'clamp',min:Number.MAX_SAFE_INTEGER-1,max:Number.MAX_SAFE_INTEGER},
    ]};
    const result=applyProgressionEvents(initial,[event('one','clamp',{id:'one'})],authored);
    assert.equal(result.ok,false,'the actual bounded delta must satisfy the receipt magnitude limit');
    assert.equal(Object.hasOwn(result,'data'),false);
    assert.equal(initial.values[0].value,-Number.MAX_SAFE_INTEGER);
});