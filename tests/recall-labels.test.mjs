import assert from 'node:assert/strict';
import {test} from 'node:test';
import {recallActivationLabel,recallUseLabel,recallConsumeLabel,recallTargetLabel} from '../src/workflow/recall-labels.js';
test('friendly recall labels retain wire values without displaying them',()=>{assert.equal(recallUseLabel('until-disarmed'),'Until cancelled');assert.equal(recallActivationLabel('armed'),'Manual queue');assert.equal(recallActivationLabel('armed-or-character'),'Manual queue or character presence');assert.equal(recallTargetLabel('swipe'),'Generated swipe');assert.equal(recallConsumeLabel('accepted'),'Accepted result');for(const label of [recallActivationLabel,recallUseLabel,recallConsumeLabel,recallTargetLabel])assert.equal(label('unknown'),'Unavailable');});
