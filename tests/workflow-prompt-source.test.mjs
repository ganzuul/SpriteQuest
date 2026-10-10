import assert from 'node:assert/strict';
import test from 'node:test';
import { snapshotPromptSource, promptSourceFingerprint } from '../src/workflow/prompt-source.js';

test('raw system source snapshots the configured text completion template without expanding it', () => {
    const context = { mainApi:'textgenerationwebui', powerUserSettings:{sysprompt:{enabled:true,content:'You are {{char}}.'}}, substituteParams(){throw new Error('Raw form expanded macros');} };
    assert.deepEqual(snapshotPromptSource(context, {}).artifact, {kind:'text',text:'You are {{char}}.',source:{source:'system',block:'sysprompt',form:'raw',enabled:true,mainApi:'textgenerationwebui',override:'none'}});
});

test('disabled system source fails instead of exporting its stored template', () => {
    const result = snapshotPromptSource({mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:false,content:'Stored disabled text'}}}, {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'PROMPT_DISABLED');
});

test('system source preserves a whole bounded template and rejects overflow without truncation', () => {
    const context = {mainApi:'novel',powerUserSettings:{sysprompt:{enabled:true,content:'🙂'.repeat(50000)}}};
    assert.equal(snapshotPromptSource(context, {}).artifact.text.length, 100000);
    context.powerUserSettings.sysprompt.content += 'x';
    const result = snapshotPromptSource(context, {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INPUT_LIMIT');
});

test('unavailable or malformed system settings fail visibly instead of throwing or fabricating text', () => {
    for (const context of [{}, {mainApi:'kobold'}, {mainApi:'kobold',powerUserSettings:{sysprompt:{content:'No enabled state'}}}, {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:{secret:'Do not coerce'}}}}, {mainApi:'unknown',powerUserSettings:{sysprompt:{enabled:true,content:'Unsupported API'}}}]) {
        const result = snapshotPromptSource(context, {});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'PROMPT_UNAVAILABLE');
        assert.equal(typeof result.error.message, 'string');
    }
});

test('unsupported node source and form settings fail before reading host material', () => {
    const context = {get powerUserSettings(){throw new Error('Invalid selection read host settings');}};
    for (const node of [{source:'assembled'}, {form:'rendered'}, {source:42}, {form:[]}, {source:'prompt-entry',promptId:''}, {source:'prompt-entry',promptId:42}, {source:'prompt-entry',promptId:'x'.repeat(257)}]) {
        const result = snapshotPromptSource(context, node);
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'INVALID_PROMPT_SOURCE');
    }
});

test('prompt entry selects its stable identifier and records the active global order state', () => {
    const context = {mainApi:'openai',characterId:7,chatCompletionSettings:{prompts:[{identifier:'other',name:'Selected name',content:'Wrong entry'},{identifier:'uuid-entry',name:'Custom',role:'user',content:'Literal {{user}}'}],prompt_order:[{character_id:7,order:[{identifier:'uuid-entry',enabled:false}]},{character_id:100001,order:[{identifier:'uuid-entry',enabled:true}]}]}};
    assert.deepEqual(snapshotPromptSource(context, {source:'prompt-entry',promptId:'uuid-entry'}).artifact, {kind:'text',text:'Literal {{user}}',source:{source:'prompt-entry',block:'prompt-entry',promptId:'uuid-entry',form:'raw',enabled:true,mainApi:'openai',override:'none',orderScope:'global'}});
});

test('chat completion system selects the active main entry instead of the text completion system setting', () => {
    const context = {mainApi:'openai',powerUserSettings:{sysprompt:{enabled:false,content:'Wrong API block'}},chatCompletionSettings:{prompts:[{identifier:'main',content:'Chat main {{char}}',role:'system'}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:true}]}]}};
    const result = snapshotPromptSource(context, {});
    assert.equal(result.ok, true);
    assert.equal(result.artifact.text, 'Chat main {{char}}');
    assert.deepEqual(result.artifact.source, {source:'system',block:'prompt-entry',promptId:'main',form:'raw',enabled:true,mainApi:'openai',override:'none',orderScope:'global'});
});

test('disabled prompt entries are unavailable even when their content is stored', () => {
    const context = {mainApi:'openai',chatCompletionSettings:{prompts:[{identifier:'main',content:'Stored main'}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:false}]}]}};
    for (const node of [{}, {source:'prompt-entry'}]) {
        const result = snapshotPromptSource(context, node);
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'PROMPT_DISABLED');
    }
});

test('active system source uses the selected card override and chat override precedence in raw form', () => {
    for (const mainApi of ['kobold','openai']) {
        const context = {mainApi,characterId:0,characters:[{data:{system_prompt:'  Card {{char}} {{original}}  '}}],powerUserSettings:{prefer_character_prompt:true,sysprompt:{enabled:true,content:'Configured base'}},chatCompletionSettings:{prompts:[{identifier:'main',content:'Configured base'}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:true}]}]}};
        const card = snapshotPromptSource(context, {});
        assert.equal(card.ok, true);
        assert.equal(card.artifact.text, 'Card {{char}} {{original}}');
        assert.equal(card.artifact.source.override, 'character');
        assert.equal(card.artifact.source.block, 'character-system');
        context.chatMetadata = {system_prompt:'  Chat {{user}}  '};
        const chat = snapshotPromptSource(context, {});
        assert.equal(chat.artifact.text, 'Chat {{user}}');
        assert.equal(chat.artifact.source.override, 'chat');
        assert.equal(chat.artifact.source.block, 'chat-system');
    }
});

test('chat main forbid-overrides keeps the configured block and explicit prompt-entry reads keep its literal template', () => {
    const context = {mainApi:'openai',characterId:0,characters:[{data:{system_prompt:'Character replacement'}}],powerUserSettings:{prefer_character_prompt:true},chatCompletionSettings:{prompts:[{identifier:'main',content:'Protected main',forbid_overrides:true}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:true}]}]}};
    assert.equal(snapshotPromptSource(context, {}).artifact.text, 'Protected main');
    context.chatCompletionSettings.prompts[0].forbid_overrides = false;
    const entry = snapshotPromptSource(context, {source:'prompt-entry'});
    assert.equal(entry.artifact.text, 'Protected main');
    assert.equal(entry.artifact.source.override, 'none');
});

test('marker IDs cannot capture assembled chat, character, or lore prompt blocks', () => {
    const context = {mainApi:'openai',chatCompletionSettings:{prompts:[{identifier:'worldInfoBefore',marker:true,content:'Do not assemble lore'}]}};
    const result = snapshotPromptSource(context, {source:'prompt-entry',promptId:'worldInfoBefore'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'UNSUPPORTED_PROMPT');
});

test('public character and group prompt orders are honored when no global order is exposed', () => {
    for (const [identity, scope] of [[{characterId:7},'character'],[{groupId:'group-seven'},'group']]) {
        const orderId = scope === 'character' ? 7 : 'group-seven';
        const context = {...identity,mainApi:'openai',chatCompletionSettings:{prompts:[{identifier:'custom',content:'Selected ordered entry'}],prompt_order:[{character_id:orderId,order:[{identifier:'custom',enabled:false}]}]}};
        assert.equal(snapshotPromptSource(context, {source:'prompt-entry',promptId:'custom'}).error.code, 'PROMPT_DISABLED');
        context.chatCompletionSettings.prompt_order[0].order[0].enabled = true;
        const result = snapshotPromptSource(context, {source:'prompt-entry',promptId:'custom'});
        assert.equal(result.artifact.source.enabled, true);
        assert.equal(result.artifact.source.orderScope, scope);
    }
});

test('an entry detached from an exposed active order fails instead of pretending it is enabled', () => {
    const context = {mainApi:'openai',chatCompletionSettings:{prompts:[{identifier:'custom',content:'Detached entry'}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:true}]}]}};
    const result = snapshotPromptSource(context, {source:'prompt-entry',promptId:'custom'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'PROMPT_INACTIVE');
});

test('source fingerprint tracks captured text and source metadata without reacting to unrelated host state', () => {
    const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'Initial'}},unrelated:'one'};
    const before = promptSourceFingerprint(context, {});
    assert.deepEqual(before, {ok:true,data:'["Initial",null,"Initial",{"source":"system","block":"sysprompt","form":"raw","enabled":true,"mainApi":"kobold","override":"none"}]'});
    context.unrelated = 'two';
    assert.equal(promptSourceFingerprint(context, {}).data, before.data);
    context.powerUserSettings.sysprompt.content = 'Changed';
    assert.notEqual(promptSourceFingerprint(context, {}).data, before.data);
    context.powerUserSettings.sysprompt.enabled = false;
    assert.equal(promptSourceFingerprint(context, {}).error.code, 'PROMPT_DISABLED');
});

test('resolved form uses the supported host substitution API with character-field expansion disabled', () => {
    const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'Talk as {{char}} to {{user}}.'}},substituteParams(text, options){assert.equal(options.replaceCharacterCard, false);assert.equal(typeof options.postProcessFn, 'function');return text.replace('{{char}}','Mira').replace('{{user}}','Alex');}};
    const result = snapshotPromptSource(context, {form:'resolved'});
    assert.equal(result.ok, true);
    assert.equal(result.artifact.text, 'Talk as Mira to Alex.');
    assert.equal(result.artifact.source.form, 'resolved');
});

test('resolved form reports absent, failing, and non-text host substitution instead of fabricating success', () => {
    for (const [substituteParams, code] of [[undefined,'PROMPT_RESOLUTION_UNAVAILABLE'],[() => {throw new Error('Private host exception');},'PROMPT_RESOLUTION_FAILED'],[() => ({live:'object'}),'PROMPT_RESOLUTION_FAILED']]) {
        const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'{{char}}'}},substituteParams};
        const result = snapshotPromptSource(context, {form:'resolved'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, code);
        assert.equal(JSON.stringify(result).includes('Private host exception'), false);
    }
});

test('resolved capture rejects state-changing, custom, character-field, and lore macros before host evaluation', () => {
    const context = {mainApi:'kobold',variableWrites:0,powerUserSettings:{sysprompt:{enabled:true,content:''}},substituteParams(){this.variableWrites++;return 'Unexpected expansion';}};
    for (const content of ['{{setvar::x::1}}','{{incglobalvar::x}}','{{customExtension}}','{{description}}','{{outlet::lore}}','{{random::one::two}}','{{.x = 1}}','{{char{{setvar::x::1}}}}']) {
        context.powerUserSettings.sysprompt.content = content;
        const result = snapshotPromptSource(context, {form:'resolved'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'UNSUPPORTED_PROMPT_MACRO');
        assert.equal(context.variableWrites, 0);
        assert.equal(snapshotPromptSource(context, {form:'raw'}).artifact.text, content);
    }
});

test('resolved system override supplies the resolved configured original through the host API', () => {
    for (const mainApi of ['kobold','openai']) {
        const context = {mainApi,characterId:0,characters:[{data:{system_prompt:'Card {{char}} / {{original}}'}}],powerUserSettings:{prefer_character_prompt:true,sysprompt:{enabled:true,content:'Base {{char}}'}},chatCompletionSettings:{prompts:[{identifier:'main',content:'Base {{char}}'}],prompt_order:[{character_id:100001,order:[{identifier:'main',enabled:true}]}]},substituteParams(text, options){return text.replaceAll('{{char}}','Mira').replaceAll('{{original}}',options.original ?? 'Missing original');}};
        assert.equal(snapshotPromptSource(context, {form:'resolved'}).artifact.text, 'Card Mira / Base Mira');
    }
});

test('resolved text expansion is bounded after host substitution and never truncated', () => {
    const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'{{char}}'}},substituteParams(){return 'x'.repeat(100000);}};
    assert.equal(snapshotPromptSource(context, {form:'resolved'}).artifact.text.length, 100000);
    context.substituteParams = () => 'x'.repeat(100001);
    const result = snapshotPromptSource(context, {form:'resolved'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'INPUT_LIMIT');
});

test('malformed or ambiguous public prompt data cannot fabricate a source snapshot', () => {
    const prompt = {identifier:'custom',content:'Bounded text'};
    for (const chatCompletionSettings of [{prompts:{}},{prompts:[prompt,prompt]},{prompts:[prompt],prompt_order:{}},{prompts:[prompt],prompt_order:[{character_id:100001,order:{}}]},{prompts:[prompt],prompt_order:[{character_id:100001,order:[{identifier:'custom',enabled:'yes'}]}]},{prompts:[prompt],prompt_order:[{character_id:100001,order:[{identifier:'custom',enabled:true},{identifier:'custom',enabled:false}]}]}]) {
        const result = snapshotPromptSource({mainApi:'openai',chatCompletionSettings}, {source:'prompt-entry',promptId:'custom'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'PROMPT_UNAVAILABLE');
    }
    const result = snapshotPromptSource({mainApi:{live:'object'},chatCompletionSettings:{prompts:[prompt]}}, {source:'prompt-entry',promptId:'custom'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'PROMPT_UNAVAILABLE');
});

test('an active chat system requires enabled-order evidence while explicit entries can report unavailable order state', () => {
    const context = {mainApi:'openai',chatCompletionSettings:{prompts:[{identifier:'main',content:'Configured main'}]}};
    const system = snapshotPromptSource(context, {});
    assert.equal(system.ok, false);
    assert.equal(system.error.code, 'PROMPT_UNAVAILABLE');
    const entry = snapshotPromptSource(context, {source:'prompt-entry'});
    assert.equal(entry.ok, true);
    assert.equal(entry.artifact.source.enabled, null);
    assert.equal(entry.artifact.source.orderScope, 'unavailable');
});

test('resolved capture rejects unresolved supported macros left by the host', () => {
    const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'{{char}}'}},substituteParams(text){return text;}};
    const result = snapshotPromptSource(context, {form:'resolved'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'PROMPT_RESOLUTION_FAILED');
});

test('invalid expanded original templates are rejected before evaluating the card override', () => {
    for (const [original, code] of [['{{setvar::x::one}}','PROMPT_RESOLUTION_FAILED'],['{{char}}','PROMPT_RESOLUTION_FAILED'],['x'.repeat(100001),'INPUT_LIMIT']]) {
        const context = {mainApi:'kobold',characterId:0,characters:[{data:{system_prompt:'Card {{original}}'}}],overrideWrites:0,powerUserSettings:{prefer_character_prompt:true,sysprompt:{enabled:true,content:'Base {{char}}'}},substituteParams(text){if(text === 'Base {{char}}')return original;this.overrideWrites++;return 'Unexpected override';}};
        const result = snapshotPromptSource(context, {form:'resolved'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, code);
        assert.equal(context.overrideWrites, 0);
    }
});

test('host prompt lookup rejects oversized public collections before scanning them', () => {
    const prompt = {identifier:'custom',content:'Bounded text'};
    for (const chatCompletionSettings of [{prompts:Array(10001).fill(prompt)},{prompts:[prompt],prompt_order:Array(1001).fill({character_id:100001,order:[]})},{prompts:[prompt],prompt_order:[{character_id:100001,order:Array(10001).fill({identifier:'custom',enabled:true})}]}]) {
        const result = snapshotPromptSource({mainApi:'openai',chatCompletionSettings}, {source:'prompt-entry',promptId:'custom'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'INPUT_LIMIT');
    }
});

test('unreadable host prompt settings return a safe failure without exposing private exceptions', () => {
    const context = {mainApi:'kobold',get powerUserSettings(){throw new Error('Private settings payload');}};
    const result = snapshotPromptSource(context, {});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'PROMPT_UNAVAILABLE');
    assert.equal(JSON.stringify(result).includes('Private settings payload'), false);
});

test('source freshness detects equivalent resolved template edits and raw override baseline edits', () => {
    const context = {mainApi:'kobold',powerUserSettings:{sysprompt:{enabled:true,content:'Use {{char}}.'}},substituteParams(text){return text.replaceAll('{{char}}','Mira');}};
    const first = promptSourceFingerprint(context, {form:'resolved'});
    context.powerUserSettings.sysprompt.content = 'Use Mira.';
    assert.notEqual(promptSourceFingerprint(context, {form:'resolved'}).data, first.data);
    context.characterId = 0;
    context.characters = [{data:{system_prompt:'Card {{original}}'}}];
    context.powerUserSettings.prefer_character_prompt = true;
    const override = promptSourceFingerprint(context, {form:'raw'});
    context.powerUserSettings.sysprompt.content = 'Changed base';
    assert.notEqual(promptSourceFingerprint(context, {form:'raw'}).data, override.data);
});

test('legacy angle name tokens are rejected before host evaluation can execute macros injected by names', () => {
    const context = {mainApi:'kobold',writes:0,powerUserSettings:{sysprompt:{enabled:true,content:''}},substituteParams(){this.writes++;return 'Host expanded an unsafe name';}};
    for (const content of ['<USER>','<BOT>','<CHAR>','<CHARIFNOTGROUP>','<GROUP>','<user>']) {
        context.powerUserSettings.sysprompt.content = content;
        const result = snapshotPromptSource(context, {form:'resolved'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'UNSUPPORTED_PROMPT_MACRO');
        assert.equal(context.writes, 0);
        assert.equal(snapshotPromptSource(context, {}).artifact.text, content);
    }
});

test('host name replacement guards prevent later mutable macros in selected and original expansion', () => {
    for (const useOverride of [false,true]) for (const [content,user,char] of [['{{user}}','{{banned "review-word"}}','Mira'],['{{user}}{{user}}banned "review-word"{{char}}{{char}}','{','}']]) {
        const context = {mainApi:'kobold',bannedWords:[],powerUserSettings:{prefer_character_prompt:useOverride,sysprompt:{enabled:true,content}},characterId:0,characters:[{data:{system_prompt:'Card {{original}}'}}],substituteParams(text, options){return text.replace(/\{\{(?:user|char|original)\}\}/g, macro => {const value = macro === '{{user}}' ? user : macro === '{{char}}' ? char : options.original ?? '';return options.postProcessFn ? options.postProcessFn(value) : value;}).replace(/\{\{banned "([^"]+)"\}\}/g, (_, word) => {this.bannedWords.push(word);return '';});}};
        const result = snapshotPromptSource(context, {form:'resolved'});
        assert.equal(result.ok, false);
        assert.equal(result.error.code, 'PROMPT_RESOLUTION_FAILED');
        assert.deepEqual(context.bannedWords, []);
    }
});

test('formatting macros cannot join literal brace fragments into mutable host macros', () => {
    const content = '{\n{{trim}}\n{banned "review-word"}\n{{trim}}\n}';
    const context = {mainApi:'kobold',bannedWords:[],powerUserSettings:{sysprompt:{enabled:true,content}},substituteParams(text){return text.replace(/\n*\{\{trim\}\}\n*/g,'').replace(/\{\{banned "([^"]+)"\}\}/g, (_,word) => {this.bannedWords.push(word);return '';});}};
    const result = snapshotPromptSource(context, {form:'resolved'});
    assert.equal(result.ok, false);
    assert.equal(result.error.code, 'UNSUPPORTED_PROMPT_MACRO');
    assert.deepEqual(context.bannedWords, []);
    assert.equal(snapshotPromptSource(context, {}).artifact.text, content);
});
