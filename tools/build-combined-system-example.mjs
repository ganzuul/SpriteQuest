import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {portableCombinedExample,editableCombinedExample,combinedExampleResources,normalizeExampleCheckout} from './combined-system-example.mjs';
import {parseWorkflow} from '../src/workflow/packages.js';
import {parseWorkflowDocument} from '../src/workflow/document-file.js';
const check=process.argv.includes('--check');
const root=new URL('../examples/unified/',import.meta.url),fixtures=new URL('fixtures/combined-systems/',root);
const portable=JSON.stringify(portableCombinedExample(),null,2)+'\n',editable=editableCombinedExample()+'\n';
assert.equal(parseWorkflow(portable).ok,true);assert.equal(parseWorkflowDocument(editable).ok,true);
const files=[[new URL('unified-combined-systems.json',root),portable],[new URL('unified-combined-systems.lattice-document.json',root),editable],...combinedExampleResources().map(document=>[new URL(document.targetId+'.json',fixtures),document.content+'\n'])];
if(!check)await mkdir(fixtures,{recursive:true});
for(const [url,content] of files){if(check)assert.equal(normalizeExampleCheckout(await readFile(url,'utf8')),content,url.pathname);else await writeFile(url,content);}
console.log((check?'Verified':'Generated')+' combined portable workflow, editable Main + three body tabs, and five resource seeds.');
