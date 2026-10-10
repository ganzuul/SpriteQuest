import { test, expect } from '@playwright/test';

test('connection reconciliation retains the selected Details and publishes only the replacement scene', async ({page}) => {
    await page.goto('/tests/browser/harness.html');
    await page.waitForFunction(() => !!window.canvasHarness);
    const result = await page.evaluate(async () => {
        const h=window.canvasHarness; await h.reset(2,2);
        h.graph.wires={}; h.S.touchGraph(h.graph); h.UI.refreshIfOpen(); await h.settle();
        const c=h.canvas; c.select({kind:'node',id:'n0'}); await h.settle();
        const bridge=c.hooks.nativeBridge();
        const pin=(id,dir,portId)=>{const metadata=c.graph.nativeCards[id].ports.find(p=>p.dir===dir&&p.port===portId),center=c.endpoint(id,dir,portId);return {nodeId:id,dir,portId,kind:metadata.kind,center:{x:center.x,y:center.y},address:{workflowId:h.graph.id,instancePath:[],nodeId:id,portId}};};
        const origin=pin('n0','out','out'),target=pin('n1','in','section.Text');
        bridge.dispatch({type:'begin-pin',pin:origin,pointerId:99,graphPoint:origin.center,originalBindings:[]});
        bridge.dispatch({type:'pointer-move',pointerId:99,graphPoint:target.center,hit:{kind:'pin',pin:target}}); await h.settle();
        let renders=0; const render=c.render;c.render=function(...args){renders++;return render.apply(this,args);};
        bridge.dispatch({type:'release',pointerId:99,graphPoint:target.center,screenAnchor:{x:400,y:400},hit:{kind:'pin',pin:target}});
        await h.settle(); c.render=render;
        return {wires:Object.keys(h.graph.wires).length,selection:c.selection,details:!!document.querySelector('textarea[aria-label="Section 1 text"]'),renders,providerCalls:h.providerCalls()};
    });
    expect(result.wires).toBe(1); expect(result.selection).toEqual({kind:'node',id:'n0'});
    expect(result.details).toBe(true); expect(result.renders).toBe(0); expect(result.providerCalls).toBe(0);
});
