import { test, expect } from '@playwright/test';
const root = (page, name) => page.getByRole('menubar', { name: 'Workspace menus' }).getByRole('menuitem', { name, exact: true });
const menu = (page, name) => page.getByRole('menu', { name, exact: true });
async function start(page) { await page.goto('/tests/browser/harness.html'); await page.waitForFunction(() => !!window.canvasHarness); await page.evaluate(() => window.canvasHarness.reset()); }
test('opening a workspace menu cancels held Space pan before isolated key release',async({page})=>{await start(page);await page.locator('.pc-canvas-host').focus();await page.keyboard.down('Space');expect(await page.evaluate(()=>window.canvasHarness.canvas.spaceDown)).toBe(true);await root(page,'File').click();await page.keyboard.up('Space');await page.keyboard.press('Escape');expect(await page.evaluate(()=>window.canvasHarness.canvas.spaceDown)).toBe(false);await expect(page.locator('.pc-canvas-host')).not.toHaveClass(/pc-space-pan/);});
test('six menus start closed, click arms hover, and dismissal disarms hover', async ({ page }) => {
    await start(page);
    await expect(page.locator('.pc-flat-menu')).toHaveText(['File', 'Edit', 'View', 'Graph', 'Workflow', 'Help']);
    await root(page, 'Edit').hover(); await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page, 'File').click(); await expect(menu(page, 'File')).toBeVisible();
    await root(page, 'Edit').hover(); await expect(menu(page, 'Edit')).toBeVisible();
    await page.keyboard.press('Escape'); await expect(page.getByRole('menu')).toHaveCount(0); await expect(root(page, 'Edit')).toBeFocused();
    await root(page, 'View').hover(); await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page, 'View').click(); await page.locator('.pc-canvas-host').click({ position: { x: 10, y: 10 } });
    await root(page, 'Help').hover(); await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page, 'Help').click(); await page.keyboard.press('Tab'); await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page, 'Graph').hover(); await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page, 'Graph').click(); await page.setViewportSize({ width: 1300, height: 900 }); await expect(page.getByRole('menu')).toHaveCount(0);
});
test('menu keys and paste cannot edit or move the selected background graph', async ({ page }) => {
    await start(page);
    const before = await page.evaluate(async () => { const h = window.canvasHarness; h.S.settings().ui.confirmDelete = false; h.canvas.select({kind:'node', id:Object.keys(h.graph.nodes)[0]}); await h.view({x:123,y:67,zoom:.8}); return {graph:JSON.stringify(h.graph), camera:{...h.canvas.view}, selection:h.canvas.selection}; });
    await root(page, 'Edit').click(); await menu(page, 'Edit').getByRole('menuitem', {name:/^Copy/}).focus();
    for (const key of ['c', 'f', 'Delete', 'Control+z', 'Control+x', 'Control+v']) await page.keyboard.press(key);
    await page.evaluate(() => { const transfer = new DataTransfer(); transfer.setData('text/plain','must stay outside graph'); document.activeElement.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:transfer})); });
    expect(await page.evaluate(() => ({graph:JSON.stringify(window.canvasHarness.graph),camera:{...window.canvasHarness.canvas.view},selection:window.canvasHarness.canvas.selection}))).toEqual(before);
});

test('submenus preserve hover session, keyboard focus and action dismissal', async ({ page }) => {
    await start(page); await root(page,'Workflow').focus(); await page.keyboard.press('ArrowDown');
    const configure=menu(page,'Workflow').getByRole('menuitem',{name:'Configure',exact:true});
    await configure.focus(); await page.keyboard.press('ArrowRight');
    const submenu=menu(page,'Configure options'); await expect(submenu).toBeVisible();
    await expect(submenu.getByRole('menuitem',{name:'Workflow Data…',exact:true})).toBeFocused();
    await page.keyboard.press('End'); await expect(submenu.getByRole('menuitem',{name:'Workflow Data…',exact:true})).toBeFocused();
    await page.keyboard.press('Home'); await page.keyboard.press('w'); await expect(submenu.getByRole('menuitem',{name:'Workflow Data…',exact:true})).toBeFocused();
    await page.keyboard.press('ArrowLeft'); await expect(submenu).toHaveCount(0); await expect(configure).toBeFocused();
    await root(page,'Graph').hover(); await expect(menu(page,'Graph')).toBeVisible();
    await menu(page,'Graph').getByRole('menuitemradio',{name:'Pan tool',exact:true}).click();
    await expect(page.getByRole('menu')).toHaveCount(0);await expect(root(page,'Graph')).toBeFocused();
    await root(page,'File').hover();await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page,'Graph').click();await expect(menu(page,'Graph').getByRole('menuitemradio',{name:'Pan tool',exact:true})).toBeChecked();
});
test('menu hit targets and column rails remain reachable in narrow viewports', async ({ page }) => {
    await start(page);
    const sizes=await page.locator('.pc-flat-menu').evaluateAll(items=>items.map(item=>item.getBoundingClientRect().width));expect(Math.min(...sizes)).toBeGreaterThanOrEqual(68);
    const gap=await page.getByRole('menubar',{name:'Workspace menus'}).evaluate(el=>getComputedStyle(el).columnGap);expect(parseFloat(gap)).toBeGreaterThanOrEqual(4);
    await root(page,'Edit').click();
    const rowSizes=await menu(page,'Edit').locator('button').evaluateAll(items=>items.map(item=>item.getBoundingClientRect().height));expect(Math.min(...rowSizes)).toBe(34);
    const rails=await menu(page,'Edit').locator('button').evaluateAll(items=>items.map(item=>[...item.children].map(child=>child.getBoundingClientRect().left)));
    expect(rails.every(row=>JSON.stringify(row)===JSON.stringify(rails[0]))).toBe(true);
    await page.setViewportSize({width:360,height:520}); await root(page,'Workflow').click();await menu(page,'Workflow').getByRole('menuitem',{name:'Configure',exact:true}).hover();
    for(const name of ['Workflow','Configure options']){const box=await menu(page,name).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(360);expect(box.y+box.height).toBeLessThanOrEqual(520);}
    await menu(page,'Configure options').getByRole('menuitem',{name:'Workflow Data…',exact:true}).focus(); await page.keyboard.press('Escape');await expect(menu(page,'Workflow').getByRole('menuitem',{name:'Configure',exact:true})).toBeFocused();await expect(menu(page,'Configure options')).toHaveCount(0);await page.keyboard.press('Escape');await expect(root(page,'Workflow')).toBeFocused();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('checkbox choices and root toggle both reset hover, and Tab resumes outside the menu', async ({ page }) => {
    await start(page); await root(page,'View').click();await menu(page,'View').getByRole('menuitemcheckbox',{name:'Show node shelf',exact:true}).click();
    await root(page,'File').hover();await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page,'File').click();await root(page,'File').click();await root(page,'Help').hover();await expect(page.getByRole('menu')).toHaveCount(0);
    await root(page,'File').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await page.evaluate(()=>document.activeElement.tagName!=='BODY' && !document.activeElement.closest('.pc-workspace-menus'))).toBe(true);
});
test('coarse pointers provide 44 pixel targets and wrapped menu roots remain reachable', async ({ browser, baseURL }) => {
    const context=await browser.newContext({hasTouch:true,viewport:{width:360,height:640}});const page=await context.newPage();await page.goto(`${baseURL}/tests/browser/harness.html`);await page.waitForFunction(()=>!!window.canvasHarness);await page.evaluate(()=>window.canvasHarness.reset());
    await root(page,'Workflow').tap();const sizes=await menu(page,'Workflow').locator('button').evaluateAll(items=>items.map(item=>item.getBoundingClientRect().height));expect(Math.min(...sizes)).toBeGreaterThanOrEqual(44);
    const targets=await page.locator('.pc-flat-menu').evaluateAll(items=>items.map(item=>({width:item.getBoundingClientRect().width,height:item.getBoundingClientRect().height,right:item.getBoundingClientRect().right})));expect(targets.every(item=>item.width>=64 && item.height>=44 && item.right<=360)).toBe(true);
    await menu(page,'Workflow').getByRole('menuitem',{name:'Configure',exact:true}).tap();await expect(menu(page,'Configure options')).toBeVisible();await context.close();
});

test('keyboard navigation scrolls focused rows inside a short popup viewport', async ({ page }) => {
    await start(page); await page.setViewportSize({width:360,height:300});
    await root(page,'Graph').focus();await page.keyboard.press('ArrowDown');
    const popup=menu(page,'Graph');
    const visibleFocus=async()=>{
        const bounds=await popup.evaluate(element=>{const row=document.activeElement,box=row.getBoundingClientRect(),panel=element.getBoundingClientRect();return{top:box.top,bottom:box.bottom,visibleTop:panel.top+element.clientTop,visibleBottom:panel.top+element.clientTop+element.clientHeight};});
        expect(bounds.top).toBeGreaterThanOrEqual(bounds.visibleTop);expect(bounds.bottom).toBeLessThanOrEqual(bounds.visibleBottom);
    };
    await page.keyboard.press('End');await expect(popup.getByRole('menuitemradio',{name:'Pan tool',exact:true})).toBeFocused();await visibleFocus();
    await page.keyboard.press('Home');await expect(popup.getByRole('menuitem',{name:'Add node…',exact:true})).toBeFocused();await visibleFocus();
    await page.keyboard.press('p');await expect(popup.getByRole('menuitemradio',{name:'Pan tool',exact:true})).toBeFocused();await visibleFocus();
    await page.keyboard.press('ArrowDown');await expect(popup.getByRole('menuitem',{name:'Add node…',exact:true})).toBeFocused();await visibleFocus();
});
test('closed menubar permits history and paste accelerators after a selection command', async ({ page }) => {
    await start(page);
    const original=await page.evaluate(async()=>{const h=window.canvasHarness;h.canvas.select({kind:'node',id:Object.keys(h.graph.nodes)[0]});await h.settle();return Object.keys(h.graph.nodes).length;});
    await root(page,'Edit').click();await menu(page,'Edit').getByRole('menuitem',{name:'Duplicate selection',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(original+1);
    await expect(root(page,'Edit')).toBeFocused();await expect(page.getByRole('menu')).toHaveCount(0);
    await page.keyboard.press('Control+z');await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(original);
    await expect(root(page,'Edit')).toBeFocused();await root(page,'View').hover();await expect(page.getByRole('menu')).toHaveCount(0);
    await page.keyboard.press('Control+Shift+z');await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(original+1);
    await page.evaluate(()=>{const transfer=new DataTransfer();transfer.setData('text/plain','Paste after a closed menu');document.activeElement.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,clipboardData:transfer}));});
    await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(original+2);
    await page.keyboard.press('Control+z');await expect.poll(()=>page.evaluate(()=>Object.keys(window.canvasHarness.graph.nodes).length)).toBe(original+1);
    await root(page,'Graph').hover();await expect(page.getByRole('menu')).toHaveCount(0);
});
