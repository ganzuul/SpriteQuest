import assert from 'node:assert/strict';
import test from 'node:test';
import * as connections from '../src/workflow/connections.js';

test('binding freshness and safe summaries authenticate the exact resolver object and current preset/profile',()=>{
    assert.equal(typeof connections.bindingStatus,'function');assert.equal(typeof connections.bindingSummary,'function');
    const profile={id:'fixed',api:'custom',model:'model',preset:'sampler','api-url':'https://private.example'};
    const preset={temperature:0.2};
    const context={CONNECT_API_MAP:{custom:{selected:'openai',source:'custom'}},ConnectionManagerRequestService:{getProfile:()=>profile},getPresetManager:()=>({getCompletionPresetByName:()=>preset})};
    const binding=connections.resolveBinding({profileId:'fixed',modelRole:'Analysis'},{},context).data;
    assert.equal(connections.bindingStatus(binding,context).ok,true);
    assert.equal(connections.bindingStatus({...binding},context).error.code,'BINDING_CHANGED');
    const summary=connections.bindingSummary(binding);assert.deepEqual(Object.keys(summary).sort(),['fingerprint','model','profileId','role']);
    assert.equal(summary.role,'Analysis');assert.equal(summary.model,'model');assert.equal(typeof summary.fingerprint,'string');
    assert.ok(!JSON.stringify(summary).includes('private.example'));assert.equal(connections.bindingSummary({...binding}),undefined);
    preset.temperature=0.3;assert.equal(connections.bindingStatus(binding,context).error.code,'BINDING_CHANGED');
    preset.temperature=0.2;profile.model='changed';assert.equal(connections.bindingStatus(binding,context).error.code,'BINDING_CHANGED');
    profile.model='model';assert.equal(connections.bindingStatus(binding,context).ok,true);
    binding.endpoint='forged';assert.equal(connections.bindingStatus(binding,context).error.code,'BINDING_CHANGED');
    let reads=0;Object.defineProperty(binding,'model',{get(){reads++;return 'private mutation';}});
    assert.equal(connections.bindingSummary(binding).model,'model');assert.equal(reads,0,'safe summaries use captured metadata without invoking a mutated binding getter');
});
