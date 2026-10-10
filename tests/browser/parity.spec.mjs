import {test,expect} from '@playwright/test';
async function load(page){await page.goto('/tests/browser/harness.html');await page.waitForFunction(()=>!!window.canvasHarness);}
test('current multi-pin cards keep their named pins and keyed identity across view updates',async({page})=>{
    await load(page);
    await page.evaluate(async()=>{
        const h=window.canvasHarness,{operationDefaults}=await import('/src/workflow/catalog.js?v='+h.version),g=h.S.blankGraph('Multi-pin');g.id='multi-pin';
        g.nodes.text={...operationDefaults('compose'),id:'text',type:'workflow',operation:'compose',operationVersion:1,x:180,y:100,sections:Array.from({length:8},(_,i)=>({name:'Section'+i,text:'Text '+i}))};
        g.nodes.sink={...operationDefaults('text-rules'),id:'sink',type:'workflow',operation:'text-rules',operationVersion:1,inputKind:'text',x:520,y:100};
        g.wires.edge={id:'edge',route:'wire',from:'text',fromPort:'out',to:'sink',toPort:'in'};await h.activate(g);
        window.parityCard=h.canvas.nodeLayer.querySelector('[data-id="text"]');window.parityPins=[...window.parityCard.querySelectorAll('.pc-port')];window.parityWire=h.canvas.svg.querySelector('.pc-wire');
        await h.view({x:110,y:70,zoom:.75});
    });
    await expect(page.locator('[data-id="text"] .pc-port[data-dir="in"]')).toHaveCount(9);
    expect(await page.evaluate(()=>{const h=window.canvasHarness;return h.canvas.nodeLayer.contains(window.parityCard)&&window.parityPins.every(pin=>window.parityCard.contains(pin))&&h.canvas.svg.contains(window.parityWire);})).toBe(true);
    await expect(page.locator('.pc-port-key,.pc-port-stage,.pc-tok')).toHaveCount(0);
});
test('copy and paste current selected fragments retain their internal named wire in one undo step',async({page})=>{
    await load(page);const ids=await page.evaluate(()=>window.canvasHarness.reset(3,3));
    await page.evaluate(ids=>{const h=window.canvasHarness;h.canvas.setMulti(ids.slice(0,2));h.H.flush(h.graph);Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.fragmentText=text;},readText:async()=>window.fragmentText}});},ids);
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'Edit', exact: true }).click();await page.getByRole('menuitem',{name:/^Copy/}).click();await page.waitForFunction(()=>!!window.fragmentText);
    const before=await page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length);
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'Edit', exact: true }).click();await page.getByRole('menuitem',{name:/^Paste/}).click();
    await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(before+2);
    const added=await page.evaluate(ids=>{const g=window.canvasHarness.graph,newIds=Object.keys(g.nodes).filter(id=>!ids.includes(id));return Object.values(g.wires).filter(w=>newIds.includes(w.from)&&newIds.includes(w.to)).map(w=>[w.fromPort,w.toPort]);},ids);
    expect(added).toEqual([['out','section.Text']]);await page.keyboard.press('Control+z');expect(await page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(before);
});
test('grouping current nodes is visual and its keyboard fold controls do not change execution',async({page})=>{
    await load(page);const ids=await page.evaluate(()=>window.canvasHarness.reset(3,3));await page.evaluate(ids=>window.canvasHarness.canvas.setMulti(ids.slice(0,2)),ids);
    await page.keyboard.press('Control+g');await expect(page.locator('.pc-node-group')).toHaveCount(1);
    await page.getByRole('button',{name:'Open group',exact:true}).focus();await page.keyboard.press('Space');await expect(page.locator('.pc-group-frame')).toHaveCount(1);
    await page.getByRole('button',{name:'Fold group',exact:true}).focus();await page.keyboard.press('Enter');await expect(page.locator('.pc-node-group')).toHaveCount(1);
    await expect(page.locator('.pc-node-group .pc-port')).toHaveCount(0);expect(await page.evaluate(()=>window.canvasHarness.canvas.spaceDown)).toBe(false);
});
