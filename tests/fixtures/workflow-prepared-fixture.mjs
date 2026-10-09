import { computeDefinitionIdentity, definitionRefKey } from '../../src/workflow/definitions.js';
export const direct = (id, from, fromPort, to, toPort) => ({ id, route: 'wire', from, fromPort, to, toPort });
export function siblingWorkflow() {
    const draft = { id: 'prepared-plan', version: 1, name: 'Plan', interface: [
        { id: 'scene', label: 'Scene', kind: 'context', direction: 'input', required: true, cardinality: 'one', boundaryNodeId: 'entry' },
        { id: 'proposal', label: 'Proposal', kind: 'guidance', direction: 'output', required: false, cardinality: 'one', boundaryNodeId: 'exit' },
    ], parameters: [], body: { schema: 3, runtime: 2, mode: 'native-pre', roles: { Analysis: { profileId: 'local' } }, nodes: {
        entry: { id: 'entry', type: 'subgraph-input', interfacePortId: 'scene' }, work: { id: 'work', type: 'workflow', operation: 'response-plan' }, exit: { id: 'exit', type: 'subgraph-output', interfacePortId: 'proposal' },
    }, wires: { a: direct('a', 'entry', 'out', 'work', 'in'), b: direct('b', 'work', 'out', 'exit', 'in') } } };
    const identity = computeDefinitionIdentity(draft);
    if (!identity.ok) throw new Error(identity.error.message);
    const definition = { ...identity.data.materializedDefinition, semanticHash: identity.data.semanticHash };
    const ref = { id: definition.id, version: definition.version, semanticHash: definition.semanticHash };
    const instance = id => ({ id, type: 'subgraph', definition: ref, parameterOverrides: {}, roleOverrides: {}, nodeBindingOverrides: {} });
    return { id: 'prepared-root', schema: 3, runtime: 2, mode: 'native-pre', nodes: {
        source: { id: 'source', type: 'workflow', operation: 'scene-context' }, 'first/path': instance('first/path'), second: instance('second'),
        one: { id: 'one', type: 'workflow', operation: 'guidance' }, two: { id: 'two', type: 'workflow', operation: 'guidance' },
    }, wires: { a: direct('a', 'source', 'out', 'first/path', 'scene'), b: direct('b', 'first/path', 'proposal', 'one', 'in'), c: direct('c', 'source', 'out', 'second', 'scene'), d: direct('d', 'second', 'proposal', 'two', 'in') }, definitions: { [definitionRefKey(definition)]: definition }, portals: {} };
}
export function nestedWorkflow() {
    const root=siblingWorkflow(),inner=Object.values(root.definitions)[0];
    const draft={id:'prepared-outer',version:1,name:'Outer',interface:structuredClone(inner.interface),parameters:[],body:{schema:3,runtime:2,mode:'native-pre',nodes:{
        entry:{id:'entry',type:'subgraph-input',interfacePortId:'scene'},work:{...structuredClone(root.nodes.second),id:'work'},exit:{id:'exit',type:'subgraph-output',interfacePortId:'proposal'},
    },wires:{a:direct('a','entry','out','work','scene'),b:direct('b','work','proposal','exit','in')}}};
    const identity=computeDefinitionIdentity(draft);if(!identity.ok)throw new Error(identity.error.message);
    const outer={...identity.data.materializedDefinition,semanticHash:identity.data.semanticHash};root.definitions[definitionRefKey(outer)]=outer;
    root.nodes['first/path'].definition={id:outer.id,version:outer.version,semanticHash:outer.semanticHash};return root;
}
export function twoOutputWorkflow(swapped=false) {
    const draft={id:'two-output',version:swapped?2:1,name:'Two outputs',interface:[
        {id:'first',label:'First',kind:'guidance',direction:'output',required:false,cardinality:'one',boundaryNodeId:'first'},
        {id:'second',label:'Second',kind:'guidance',direction:'output',required:false,cardinality:'one',boundaryNodeId:'second'},
    ],parameters:[],body:{schema:3,runtime:2,mode:'native-pre',nodes:{
        alpha:{id:'alpha',type:'workflow',operation:'compose',operationVersion:1,outputKind:'guidance',sections:[{name:'alpha',text:'Alpha'}]},
        beta:{id:'beta',type:'workflow',operation:'compose',operationVersion:1,outputKind:'guidance',sections:[{name:'beta',text:'Beta'}]},
        first:{id:'first',type:'subgraph-output',interfacePortId:'first'},second:{id:'second',type:'subgraph-output',interfacePortId:'second'},
    },wires:{a:direct('a','alpha','out',swapped?'second':'first','in'),b:direct('b','beta','out',swapped?'first':'second','in')}}};
    const identity=computeDefinitionIdentity(draft);if(!identity.ok)throw new Error(identity.error.message);
    const definition={...identity.data.materializedDefinition,semanticHash:identity.data.semanticHash};
    return {id:'two-output-root',schema:3,runtime:2,mode:'native-pre',nodes:{wrapper:{id:'wrapper',type:'subgraph',definition:{id:definition.id,version:definition.version,semanticHash:definition.semanticHash},parameterOverrides:{},roleOverrides:{},nodeBindingOverrides:{}},one:{id:'one',type:'workflow',operation:'guidance'},two:{id:'two',type:'workflow',operation:'guidance'}},wires:{a:direct('a','wrapper','first','one','in'),b:direct('b','wrapper','second','two','in')},definitions:{[definitionRefKey(definition)]:definition},portals:{}};
}
