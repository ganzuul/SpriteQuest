/** Synthetic current authoring graph. Preparation remains the real UI boundary. */
export function canvasWorkflow(operationDefaults, count = 3, columns = 3) {
    if (typeof operationDefaults !== 'function' || !Number.isSafeInteger(count) || count < 1 || count > 500 || !Number.isSafeInteger(columns) || columns < 1 || columns > 500) throw Error('Use a bounded current canvas fixture.');
    const graph = {id:'browser-fixture',name:'Browser fixture',schema:3,runtime:2,mode:'native-pre',roles:{},nodes:{},wires:{},groups:{},portals:{},definitions:{},view:{x:0,y:0,zoom:1}};
    for(let i=0;i<count;i++) {
        const id='n'+i;
        graph.nodes[id]={...operationDefaults('compose'),id,type:'workflow',operation:'compose',operationVersion:1,enabled:true,title:'Text '+(i+1),x:(i%columns)*300+40,y:Math.floor(i/columns)*210+80,outputKind:'text',sections:[{name:'Text',text:'Synthetic rendering fixture.'}]};
        if(i)graph.wires['w'+i]={id:'w'+i,route:'wire',from:'n'+(i-1),fromPort:'out',to:id,toPort:'section.Text'};
    }
    return graph;
}
