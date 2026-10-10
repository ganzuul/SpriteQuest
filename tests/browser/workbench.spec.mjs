import { test, expect } from '@playwright/test';
async function sectionsJson(page) {
    const toggle = page.getByRole('button', { name: 'Edit Sections as JSON', exact: true });
    const editor = page.getByLabel('Sections', { exact: true });
    await expect(toggle.or(editor)).toBeVisible();
    if (await toggle.isVisible()) await toggle.click();
    await expect(editor).toBeVisible();
    return editor;
}
async function launch(page) { await page.goto('/tests/browser/harness.html'); await page.waitForFunction(()=>!!window.canvasHarness); }
test('a first click after editing switches Details to the clicked current node', async ({page})=>{
    await launch(page); const ids=await page.evaluate(()=>window.canvasHarness.reset(2,2));
    await page.evaluate(()=>window.canvasHarness.view({x:180,y:0,zoom:1}));
    await page.locator('.pc-node[data-id="'+ids[0]+'"] .pc-native-heading').click();
    const editor=await sectionsJson(page); await editor.fill('{unfinished'); await editor.focus();
    await page.locator('.pc-node[data-id="'+ids[1]+'"] .pc-native-heading').click();
    expect(await page.evaluate(()=>window.canvasHarness.canvas.selection.id)).toBe(ids[1]);
    await sectionsJson(page);
    await expect(editor).toHaveValue(JSON.stringify([{name:'Text',text:'Synthetic rendering fixture.'}],null,2));
});
test('camera menus retain the focused Details editor and unsaved JSON draft',async({page})=>{
    await launch(page); const id=await page.evaluate(async()=> (await window.canvasHarness.reset(2,2))[0]); await page.evaluate(()=>window.canvasHarness.view({x:180,y:0,zoom:1})); await page.locator('.pc-node[data-id="'+id+'"] .pc-native-heading').click();
    const editor=await sectionsJson(page); await editor.fill('{unfinished'); await editor.focus();
    await page.evaluate(()=>{window.editorProbe=document.activeElement;});
    const before=await page.evaluate(()=>JSON.stringify(window.canvasHarness.graph));
    await page.evaluate(async()=>{const h=window.canvasHarness; await h.view({x:90,y:70,zoom:.8}); h.canvas.host.dispatchEvent(new WheelEvent('wheel',{clientX:250,clientY:250,deltaY:-30,cancelable:true})); await h.settle();});
    await expect(editor).toHaveValue('{unfinished');
    expect(await page.evaluate(()=>document.activeElement===window.editorProbe&&document.contains(window.editorProbe))).toBe(true);
    expect(await page.evaluate(()=>JSON.stringify(window.canvasHarness.graph))).toBe(before);
    await page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name: 'Graph', exact: true }).click(); await page.getByRole('menuitemradio',{name:'Pan tool',exact:true}).click();
    expect(await page.evaluate(()=>window.canvasHarness.canvas.mode)).toBe('pan');
    expect(await page.evaluate(()=>document.contains(window.editorProbe))).toBe(true);
});
test('closing and reopening reuses one workbench and current prepared root',async({page})=>{
    await launch(page); const before=await page.evaluate(async()=>{const h=window.canvasHarness,root=document.querySelector('.pc-root'),cv=h.canvas,graph=h.graph;h.UI.close();h.UI.open();await h.settle();return {sameRoot:root===document.querySelector('.pc-root'),sameCanvas:cv===h.canvas,sameDocument:graph===h.graph,calls:h.providerCalls()};});
    expect(before).toEqual({sameRoot:true,sameCanvas:true,sameDocument:true,calls:0}); await expect(page.locator('.pc-root')).toHaveCount(1);
});
