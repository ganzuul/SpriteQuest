import test from 'node:test';
import assert from 'node:assert/strict';
const api = await import('../src/workflow/modifiers.js').catch(() => ({}));
const modifier = (type, settings, id = type, enabled = true) => ({ id, type, version: 1, enabled, settings });
const output = [{id:'out',direction:'output',kind:'text'}];

test('trim applies only the requested edges and returns an immutable raw source and applied trace', () => {
    assert.equal(typeof api.applyTextModifiers, 'function');
    const result = api.applyTextModifiers('  hello \n', [modifier('trim', {edges:'start'})]);
    assert.equal(result.ok, true);
    assert.equal(result.data.text, 'hello \n');
    assert.equal(result.data.rawText, '  hello \n');
    assert.deepEqual(result.data.trace, [{id:'trim',type:'trim',version:1,settings:{edges:'start'},beforeLength:9,afterLength:7,changed:true}]);
    assert.ok(Object.isFrozen(result.data.trace[0].settings));
});

test('modifier admission rejects malformed exact versioned settings even when disabled', () => {
    assert.equal(typeof api.validateNodeModifiers, 'function');
    const good = modifier('trim', {edges:'both'});
    assert.deepEqual(api.validateNodeModifiers({type:'workflow',modifiers:[good]}, output).data.modifiers, [good]);
    const bad = [
        {...good,type:'unknown'}, {...good,version:2}, {...good,enabled:1}, {...good,id:''}, {...good,id:'a'.repeat(65)},
        {...good,settings:{edges:'both',extra:true}}, {...good,settings:{}}, {...good,settings:{edges:'all'}}, {...good,extra:true},
        modifier('wrap',{prefix:'a'.repeat(4097),suffix:''}), modifier('replace',{pattern:'',replacement:'',caseSensitive:true,occurrence:'all'}),
    ];
    for (const entry of bad) for (const enabled of [true,false]) assert.equal(api.validateNodeModifiers({type:'workflow',modifiers:[{...entry,enabled:typeof entry.enabled === 'boolean'?enabled:entry.enabled}]},output).ok,false);
    for (const modifiers of [[good,good],Array.from({length:17},(_,i)=>({...good,id:String(i)})),[good,,good],null,{}]) assert.equal(api.validateNodeModifiers({type:'workflow',modifiers},output).ok,false);
    let reads=0; const settings = {get edges(){reads++;return 'both';}};
    assert.equal(api.validateNodeModifiers({type:'workflow',modifiers:[{...good,settings}]},output).ok,false);
    assert.equal(reads,0);
    assert.equal(api.applyTextModifiers('safe',[{...good,version:99}]).ok,false);
});

test('only primitive nodes with exactly one Text output admit modifiers and removing all entries restores compatibility', () => {
    const modifiers=[modifier('trim',{edges:'both'},'trim',false)];
    for(const [type,ports] of [['subgraph-input',output],['subgraph',output],['note',output],['workflow',[]],['workflow',[...output,{id:'data',direction:'output',kind:'data'}]],...['draft','patches','guidance','data','context','candidate'].map(kind=>['workflow',[{...output[0],kind}]])]) {
        assert.equal(api.validateNodeModifiers({type,modifiers},ports).ok,false);
        assert.equal(api.validateNodeModifiers({type,modifiers:[]},ports).ok,true);
        assert.equal(api.validateNodeModifiers({type},ports).ok,true);
    }
    assert.equal(api.validateNodeModifiers({type:'workflow',modifiers},output).ok,true);
});

test('whitespace applies explicit line endings trailing horizontal spaces and blank line policies', () => {
    const text='one \t\r\n \t\r\n\r\ntwo  \r\n';
    const cases=[
        [{lineEndings:'lf',trailingSpaces:true,blankLines:'collapse'},'one\n\ntwo\n'],
        [{lineEndings:'crlf',trailingSpaces:false,blankLines:'remove'},'one \t\r\ntwo  \r\n'],
        [{lineEndings:'preserve',trailingSpaces:true,blankLines:'preserve'},'one\r\n\r\n\r\ntwo\r\n'],
    ];
    for(const [settings,want] of cases) assert.equal(api.applyTextModifiers(text,[modifier('whitespace',settings)]).data.text,want);
});

test('wrap inserts literal prefix and suffix without expanding host macros', () => {
    const result=api.applyTextModifiers('hello',[modifier('wrap',{prefix:'{{user}}\n',suffix:'$&'})]);
    assert.equal(result.data.text,'{{user}}\nhello$&');
});

test('replace matches one literal pattern with explicit occurrence and case policy and literal replacement', () => {
    const cases=[
        [{pattern:'a.b',replacement:'$&',caseSensitive:true,occurrence:'all'},'A.B $& aXb $&'],
        [{pattern:'a.b',replacement:'$&',caseSensitive:false,occurrence:'first'},'$& a.b aXb a.b'],
        [{pattern:'a.b',replacement:'!',caseSensitive:false,occurrence:'all'},'! ! aXb !'],
    ];
    for(const [settings,want] of cases)assert.equal(api.applyTextModifiers('A.B a.b aXb a.b',[modifier('replace',settings)]).data.text,want);
});

test('unwrap-fence removes exactly one complete enclosing Markdown fence and preserves content', () => {
    const fenced='```json\r\n {"a":1} \r\n```\r\n';
    assert.equal(api.applyTextModifiers(fenced,[modifier('unwrap-fence',{})]).data.text,' {"a":1} \r\n');
    assert.equal(api.applyTextModifiers('~~~\nhello\n~~~',[modifier('unwrap-fence',{})]).data.text,'hello\n');
    for(const text of ['before\n```\nhello\n```','```\nhello\n```\nafter','```\na\n```\n```\nb\n```','```\nhello\n~~~','plain'])assert.equal(api.applyTextModifiers(text,[modifier('unwrap-fence',{})]).data.text,text);
});

test('ordered modifiers retain disabled settings while summary counts only enabled entries', () => {
    const trim=modifier('trim',{edges:'both'}), wrap=modifier('wrap',{prefix:'[',suffix:']'}), off=modifier('replace',{pattern:'text',replacement:'changed',caseSensitive:true,occurrence:'all'},'off',false);
    assert.equal(api.applyTextModifiers(' text ',[trim,wrap,off]).data.text,'[text]');
    assert.equal(api.applyTextModifiers(' text ',[wrap,trim,off]).data.text,'[ text ]');
    assert.equal(api.applyTextModifiers(' text ',[trim,wrap,off]).data.trace.length,2);
    assert.equal(typeof api.modifierSummary,'function');
    assert.deepEqual(api.modifierSummary([trim,wrap,off]),{count:2,labels:['Trim','Wrap'],text:'Trim · Wrap'});
    assert.ok(Object.isFrozen(api.modifierTypes.whitespace.defaultSettings));
});

test('modifier application rejects oversized sources and expanding intermediate outputs', () => {
    const replace=modifier('replace',{pattern:'a',replacement:'a'.repeat(4096),caseSensitive:true,occurrence:'all'});
    assert.equal(api.applyTextModifiers('a'.repeat(100001),[]).ok,false);
    assert.equal(api.applyTextModifiers(null,[]).ok,false);
    assert.equal(api.applyTextModifiers('a'.repeat(100000),[replace]).ok,false);
    assert.equal(api.applyTextModifiers('a'.repeat(100000),[modifier('wrap',{prefix:'x',suffix:''})]).ok,false);
    assert.equal(api.applyTextModifiers('\n'.repeat(60000),[modifier('whitespace',{lineEndings:'crlf',trailingSpaces:false,blankLines:'preserve'})]).ok,false);
    assert.equal(api.applyTextModifiers('a'.repeat(100000),[modifier('trim',{edges:'both'})]).ok,true);
});

const {runWorkflow}=await import('../src/workflow/runtime.js');
const {validateGraphStructure}=await import('../src/workflow/contracts.js');
const graphOf=nodes=>({id:'modifiers',schema:3,runtime:2,mode:'native-pre',nodes,wires:{},portals:{},definitions:{},groups:{},roles:{}});
const textNode=(modifiers)=>({id:'source',type:'workflow',operation:'text',text:' raw ',...(modifiers?{modifiers}:{})});
const target={workflowId:'modifiers',instancePath:[],nodeId:'source',portId:'out'};
test('graph admission rejects invalid and incompatible modifiers before source binding requests or writes', async () => {
    let effects=0;const effect=()=>{effects++;throw new Error('No host effect before admission');};
    for(const node of [textNode([modifier('trim',{edges:'both'},'off',false),modifier('unknown',{})]),{id:'source',type:'workflow',operation:'guidance',modifiers:[modifier('trim',{edges:'both'})]},{id:'source',type:'note',modifiers:[modifier('trim',{edges:'both'})]}]) {
        const graph=graphOf({source:node});
        assert.equal(validateGraphStructure(graph).ok,false);
        const result=await runWorkflow(graph,{target,snapshot:effect,resolveBinding:effect,countTokens:effect,request:effect,publish:effect});
        assert.equal(result.ok,false);
    }
    assert.equal(effects,0);
});

test('runtime modifiers reach every direct and portal consumer and record raw paid output with trace', async () => {
    const graph=graphOf({source:textNode([modifier('trim',{edges:'both'})]),transfer:{id:'transfer',type:'workflow',operation:'format-transfer',inputKind:'text',phase:'pre',scope:'whole',modifiers:[modifier('wrap',{prefix:'[',suffix:']'})]}});
    graph.wires={in:{id:'in',route:'wire',from:'source',fromPort:'out',to:'transfer',toPort:'in'},reference:{id:'reference',route:'portal',portalId:'shared',to:'transfer',toPort:'reference'}};
    graph.portals={shared:{id:'shared',label:'Shared',kind:'text',source:{nodeId:'source',portId:'out'}}};
    let calls=0,prompt;
    const result=await runWorkflow(graph,{target:{...target,nodeId:'transfer'},resolveBinding:()=>({ok:true,data:{profileId:'fixture'}}),countTokens:async()=>({tokens:20}),request:async request=>{
        calls++; prompt=JSON.parse(request.messages[1].content);
        return {ok:true,data:{text:' changed ',finish:'stop'}};
    }});
    assert.equal(result.ok,true,JSON.stringify(result.error));assert.equal(calls,1);
    assert.equal(prompt.original,'raw'); assert.deepEqual(prompt.reference,{kind:'text',text:'raw'});
    const output=result.recording.artifacts.find(entry=>entry.value?.text==='[ changed ]');
    assert.ok(output);assert.equal(output.value.modifiers.rawText,' changed ');
    assert.deepEqual(output.value.modifiers.trace.map(entry=>entry.type),['wrap']);
    const inputs=result.recording.units.find(unit=>unit.operation==='format-transfer').ports.filter(port=>port.direction==='input'&&port.artifact!==null);
    assert.equal(inputs.length,2);
    assert.ok(inputs.every(port=>result.recording.artifacts[port.artifact].value.text==='raw'));
});

const {exportWorkflow,parseWorkflow}=await import('../src/workflow/packages.js');
const {makeClip,prepareClipPaste}=await import('../src/workflow/clipboard.js');
test('portable export import and clipboard preserve modifier order stable IDs and disabled settings', () => {
    const modifiers=[modifier('wrap',{prefix:'[',suffix:']'}),modifier('trim',{edges:'both'},'off',false)];
    const graph=graphOf({source:textNode(modifiers)}), exported=exportWorkflow(graph);
    assert.deepEqual(exported.graph.nodes.source.modifiers,modifiers);
    assert.deepEqual(parseWorkflow(JSON.stringify(exported)).data.nodes.source.modifiers,modifiers);
    const clip=makeClip(graph,{nodeIds:['source']});assert.equal(clip.ok,true,JSON.stringify(clip.error));
    const pasted=prepareClipPaste(graphOf({}),clip.data);assert.equal(pasted.ok,true,JSON.stringify(pasted.error));
    assert.deepEqual(Object.values(pasted.data.candidate.nodes)[0].modifiers,modifiers);
    assert.throws(()=>exportWorkflow(graphOf({source:textNode([modifier('wrap',{prefix:'x'.repeat(4097),suffix:''})])})));
});

const recordingApi=await import('../src/workflow/recording.js');
test('recorded Text preview exposes complete raw source and trace without rerunning stages', async () => {
    assert.equal(typeof recordingApi.formatRecordedTextModifiers,'function');
    const result=await runWorkflow(graphOf({source:textNode([modifier('trim',{edges:'both'})])}),{target});
    const artifact=result.recording.artifacts.find(entry=>entry.value?.modifiers);
    const sections=recordingApi.formatRecordedTextModifiers(artifact);
    assert.deepEqual(sections.map(section=>[section.label,section.text]),[['Output','raw'],['Raw output',' raw '],['Modifier trace',JSON.stringify([{id:'trim',type:'trim',version:1,settings:{edges:'both'},beforeLength:5,afterLength:3,changed:true}])]]);
    assert.equal(sections[0].recordedRawText,' raw ');assert.equal(sections[0].recordedModifierTrace[0].type,'trim');
    const original=recordingApi.formatRecordedTextModifiers({kind:'text',format:'structured',value:{kind:'text',text:'original'}});
    assert.equal(original[0].recordedRawText,'original');assert.deepEqual(original[0].recordedModifierTrace,[]);
    assert.deepEqual(recordingApi.formatRecordedTextModifiers({kind:'text',format:'json-prefix-text',text:'partial'}),[]);
    assert.deepEqual(recordingApi.formatRecordedTextModifiers({kind:'text',format:'omitted',reason:'limit'}),[]);
});

const {graphSemanticSignature}=await import('../src/workflow/ports.js');
const {computeDefinitionIdentity}=await import('../src/workflow/definitions.js');
test('modifier configuration order and disabled settings enter graph signatures and definition hashes', () => {
    const modifiers=[modifier('trim',{edges:'both'}),modifier('wrap',{prefix:'[',suffix:']'},'off',false)];
    const base=graphOf({source:textNode(modifiers)});
    const definition=graph=>({id:'modifier-def',version:1,name:'Modifier definition',interface:[],parameters:[],body:graph});
    const signature=graphSemanticSignature(base), hash=computeDefinitionIdentity(definition(base));assert.equal(hash.ok,true,JSON.stringify(hash.error));
    for(const edit of [node=>node.modifiers.reverse(),node=>node.modifiers[1].settings.prefix='(',node=>node.modifiers[1].enabled=true,node=>delete node.modifiers]) {
        const changed=structuredClone(base);edit(changed.nodes.source);
        assert.notEqual(graphSemanticSignature(changed),signature);
        const identity=computeDefinitionIdentity(definition(changed));assert.equal(identity.ok,true,JSON.stringify(identity.error));assert.notEqual(identity.data.semanticHash,hash.data.semanticHash);
    }
    const bad=structuredClone(base);bad.nodes.source.modifiers[0].version=2;
    assert.equal(computeDefinitionIdentity(definition(bad)).ok,false);
});

const {prepareCreateFromSelection,prepareUnpack}=await import('../src/workflow/composition-transform.js');
test('subgraph creation and unpack preserve ordered modifiers on interior nodes', () => {
    const modifiers=[modifier('trim',{edges:'both'}),modifier('wrap',{prefix:'[',suffix:']'},'off',false)];
    const graph=graphOf({source:textNode(modifiers)});
    const created=prepareCreateFromSelection(graph,{nodeIds:['source'],definitionId:'modifier-definition',name:'Modifiers',instanceId:'wrapper'});
    assert.equal(created.ok,true,JSON.stringify(created.error));
    const definition=Object.values(created.data.candidate.definitions)[0];
    assert.deepEqual(definition.body.nodes.source.modifiers,modifiers);
    const unpacked=prepareUnpack(created.data.candidate,{instanceId:'wrapper'});
    assert.equal(unpacked.ok,true,JSON.stringify(unpacked.error));
    assert.deepEqual(Object.values(unpacked.data.candidate.nodes).find(node=>node.operation==='text').modifiers,modifiers);
});

const {createWorkflowSession}=await import('../src/ui/workflow-surface.js');
test('modifier setting edits during a subsequent run preserve the previous recording as stale', async () => {
    const graph=graphOf({source:textNode([modifier('trim',{edges:'both'})])});let state,edited=false;
    const session=createWorkflowSession({current:()=>graph,epoch:()=>0,active:()=>true,changed:value=>{state=value;},runtime:()=>({runTarget:async()=>{
        const result=await runWorkflow(graph,{target});
        if(edited)graph.nodes.source.modifiers[0].settings.edges='start';
        return result;
    }})});
    await session.run({target});const prior=state.recording;
    assert.equal(state.availability,'current');edited=true;await session.run({target});
    assert.equal(state.recording,prior);assert.equal(state.availability,'stale');assert.equal(state.busy,false);
});
