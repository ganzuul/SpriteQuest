import { captureFastBinding, fastBindingSummary, requestFastDecision } from './fast-connections.js?v=0.26.0';
const fail=(code,message)=>({ok:false,error:{code,message}});
/** Trusted host bridge; public preview DTOs never grant request or review authority. */
export function createFastHostBridge(registry, { completionBindingStatus } = {}) {
    const captured=new WeakMap();
    const epoch=()=>registry.host.getRegistryRevision();
    const changed=()=>fail('BINDING_CHANGED','The model connection changed. Run the workflow again.');
    return Object.freeze({
        async resolve(node) {
            try { const before=epoch(),result=await captureFastBinding(node.fastConnectionId,registry.host); if(!result.ok)return result; if(epoch()!==before)return changed();captured.set(result.data,before);return result; }
            catch { return fail('SERVICE_UNAVAILABLE','Fast connections are unavailable for the active user.'); }
        },
        preview(node) {
            const snapshot=registry.snapshot();if(!snapshot.ok)return fail('SERVICE_UNAVAILABLE','Fast connections are unavailable for the active user.');
            const item=snapshot.data.connections.find(connection=>connection.id===node.fastConnectionId);if(!item)return fail('CONNECTION_MISSING','Select a configured Fast Decision connection.');
            if((item.provider==='jev'||item.credentialRef)&&!item.credentialReady)return fail('AUTH_MISSING','Enter this connection’s session API key in Fast Connections.');
            return {ok:true,data:{capability:'typed-decision',connectionId:item.id,provider:item.provider,model:item.model,revision:item.revision}};
        },
        bindingStatus(binding,context) {
            if(binding&&typeof binding==='object'&&(captured.has(binding)||binding.capability==='typed-decision')) {
                try {return captured.has(binding)&&captured.get(binding)===epoch()?{ok:true}:changed();}catch{return changed();}
            }
            return typeof completionBindingStatus==='function'?completionBindingStatus(binding,context):changed();
        },
        summary:fastBindingSummary,
        request:(binding,value)=>requestFastDecision(binding,value,registry.host),
    });
}
