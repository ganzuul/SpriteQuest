import {createActorState} from '../../src/workflow/introspection/contracts.js';
import {createMemoryService,createInMemoryBackend} from '../../src/workflow/introspection/memory.js';
import {executeIntrospection,type ExecutionPorts} from '../../src/workflow/introspection/nodes.js';
import {runIntrospectionExample} from '../../src/workflow/introspection/library.js';
const state=createActorState({chatId:'chat',actorId:'actor'});
if(state.ok){
    const memory=createMemoryService(createInMemoryBackend(state.data,()=>({kind:'data',value:{schemaVersion:1,recordType:'events',scope:state.data.value.scope,store:state.data.value.store,sourceRefs:[],payload:{events:[]}}})));
    const ports:ExecutionPorts={root:true,memory,request:async request=>({ok:true,data:{text:request.messages[0].content,finish:'stop'}})};
    void executeIntrospection({type:'workflow',operation:'state',operationVersion:1},{state:state.data},ports);
    void runIntrospectionExample({}, {}, ports);
}
