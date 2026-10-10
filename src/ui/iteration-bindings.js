import {inspectPinnedDefinitionIdentity,cloneDefinitionData,definitionRefKey,nodeBindingOverrideKey} from '../workflow/definition-data.js?v=0.26.0';
import {inspectDefinitionGraph} from '../workflow/graph-validation.js?v=0.26.0';
import {definitionChain} from '../workflow/composition-edit.js?v=0.26.0';
import {operationFor} from '../workflow/catalog.js?v=0.26.0';
import {validIterationRoleOverrides} from '../workflow/operations/control-nodes.js?v=0.26.0';
const fail=(code,message)=>({ok:false,error:{code,message}});
const merge=(base,extra)=>{const next=structuredClone(base??{});for(const [role,binding]of Object.entries(extra??{}))next[role]={...(next[role]??{}),...binding};return next;};
/** Bounded metadata inspection only; never resolve connections or execute a helper. */
export function inspectIterationTextRoles(helper,definitions,inheritedRoles={},roleOverrides={}) {
    try {
        const roles=new Map(),active=new Set();let visits=0;
        function visit(ref,inherited,overrides,depth,nestedRoles=new Set()) {
            if(++visits>1000||depth>8)return fail('ITERATION_DEPTH','Helper role inspection exceeds its bounded graph limit.');
            const pinned=inspectPinnedDefinitionIdentity(ref,definitions);if(!pinned.ok)return pinned;
            const key=definitionRefKey(pinned.data.ref);if(active.has(key))return fail('ITERATION_CYCLE','A helper cannot recursively invoke itself.');
            active.add(key);
            try {
                const checked=inspectDefinitionGraph(definitions[key],definitions);if(!checked.ok)return checked;
                const scopes=new Map(checked.data.expansion.scopes.map(scope=>[JSON.stringify(scope.instancePath),scope.graph]));
                for(const unit of checked.data.expansion.primitives) {
                    const op=operationFor(unit.node),scope=scopes.get(JSON.stringify(unit.address.instancePath)),path=unit.address.instancePath;
                    const chain=path.length?definitionChain({nodes:checked.data.definition.body.nodes,definitions},path):[];
                    let configured=overrides;const explicitRoles=new Set(nestedRoles);
                    for(const item of chain??[]){configured=merge(configured,item.node.roleOverrides);for(const role of Object.keys(item.node.roleOverrides??{}))explicitRoles.add(role);}
                    if(unit.node.operation==='for-each') {const next=visit(unit.node.helper,merge(inherited,scope.roles),merge(configured,unit.node.roleOverrides),depth+1,new Set([...explicitRoles,...Object.keys(unit.node.roleOverrides??{})]));if(!next.ok)return next;continue;}
                    // Fast Decision owns its fixed typed/fallback connections. Helper text-role overrides cannot retarget them.
                    if(!op||op.requestCapability==='typed-decision'||!unit.requestBound||unit.enabled===false)continue;
                    const role=unit.node.modelRole??op.modelRole;if(!role)continue;
                    const binding={...(inherited[role]??{}),...(scope.roles?.[role]??{}),...(configured[role]??{})};
                    const saved=(chain?.at(-1)?.definition.body??checked.data.definition.body).nodes[unit.address.nodeId],explicit={};
                    for(let depth=(chain?.length??0)-1;depth>=0;depth--)Object.assign(explicit,chain[depth].node.nodeBindingOverrides?.[nodeBindingOverrideKey(path.slice(depth+1),unit.address.nodeId)]??{});
                    if(saved?.profileId!=null)binding.profileId=saved.profileId;
                    if(saved?.model!=null)binding.model=saved.model;else if(saved?.profileId!=null||Object.hasOwn(explicit,'profileId'))binding.model=null;
                    Object.assign(binding,explicit);
                    const row=roles.get(role)??{role,bindings:[],nestedOverride:false};
                    row.bindings.push(binding);row.nestedOverride ||= explicitRoles.has(role);roles.set(role,row);
                    if(roles.size>64)return fail('ITERATION_ROLE_LIMIT','A helper can expose up to 64 text model roles.');
                }
                return {ok:true};
            }finally{active.delete(key);}
        }
        const result=visit(helper,inheritedRoles,roleOverrides,0);return result.ok?{ok:true,data:[...roles.values()]}:result;
    }catch{return fail('INVALID_ITERATION_BINDINGS','The exact helper role bindings could not be inspected.');}
}
export function prepareIterationBindings(node,definitions,profiles=[],inheritedRoles={}) {
    const checked=inspectIterationTextRoles(node.helper,definitions,inheritedRoles,node.roleOverrides??{});
    if(!checked.ok)return {helperKey:definitionRefKey(node.helper),roles:[],issue:checked.error.message};
    const field=(binding,key)=>({mode:Object.hasOwn(binding,key)?binding[key]===null?'block':'override':'inherit',value:binding[key]??null,allowedModes:[{value:'inherit',label:key==='model'?'Use helper model':'Use helper connection'},{value:'override',label:'Override'},...(key==='model'?[{value:'block',label:'Use profile model'}]:[])]});
    return {helperKey:definitionRefKey(node.helper),roles:checked.data.map(row=>{
        const saved=node.roleOverrides?.[row.role]??{},effective=row.bindings[0]??{};
        return {role:row.role,label:row.role.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[-_]+/g,' ').replace(/^./,char=>char.toUpperCase()),profile:{...field(saved,'profileId'),options:profiles.map(profile=>({value:profile.id,label:profile.name}))},model:field(saved,'model'),effective:[effective.profileId,effective.model??(effective.profileId?'Profile model':'')].filter(Boolean).join(' · ')||'Choose a connection for this helper role',source:row.nestedOverride?'Explicit nested helper binding':Object.keys(saved).length?'For Each role override':'Pinned helper or inherited binding',...(row.nestedOverride?{caveat:'An explicit nested helper binding takes precedence for that occurrence.'}:{})};
    })};
}
/** Prepare a detached sparse override; the controller owns captured graph authorization/commit. */
export function prepareIterationBindingOverride(node,definitions,input) {
    const copied=cloneDefinitionData({node,input});if(!copied.ok)return copied;
    const {node:saved,input:edit}=copied.data;
    if(saved.operation!=='for-each'||!edit||Object.keys(edit).some(key=>!['role','field','mode','value'].includes(key))||!['profileId','model'].includes(edit.field)||!['inherit','override','block'].includes(edit.mode)||edit.field==='profileId'&&edit.mode==='block')return fail('INVALID_ITERATION_BINDING','Choose a helper role and a supported binding field.');
    const inspected=inspectIterationTextRoles(saved.helper,definitions);if(!inspected.ok)return inspected;
    if(!inspected.data.some(row=>row.role===edit.role))return fail('INVALID_ITERATION_BINDING','Choose a text model role required by this exact helper.');
    const roleOverrides=structuredClone(saved.roleOverrides??{}),binding={...(roleOverrides[edit.role]??{})};
    if(edit.mode==='inherit'){delete binding[edit.field];if(edit.field==='profileId'&&binding.model===null)delete binding.model;}
    else {binding[edit.field]=edit.mode==='block'?null:edit.value;if(edit.field==='profileId'&&!Object.hasOwn(binding,'model'))binding.model=null;}
    if(Object.keys(binding).length)roleOverrides[edit.role]=binding;else delete roleOverrides[edit.role];
    return validIterationRoleOverrides(roleOverrides)?{ok:true,data:{roleOverrides}}:fail('INVALID_ITERATION_BINDING','Model and profile selectors must be nonempty bounded text.');
}