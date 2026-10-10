import { expect } from '@playwright/test';

export async function setCompact(page, value) {
    const card = page.locator('.pc-node-native.pc-selected');
    const compact = await card.evaluate(element => element.classList.contains('pc-node-compact'));
    if (compact !== value) { await card.focus(); await page.keyboard.press('Shift+C'); }
}


const nodeDetails = page => page.getByRole('region', { name: 'Node details', exact: true });

export async function chooseControl(page, label, value) {
    const control = nodeDetails(page).getByLabel(label, { exact: true });
    await expect(control).toBeVisible();
    if (await control.getAttribute('role') === 'radiogroup') {
        await control.locator(`input[type="radio"][value=${JSON.stringify(value)}]`).check();
    } else {
        await control.selectOption(value);
    }
}

export async function controlValue(page, label) {
    const control = nodeDetails(page).getByLabel(label, { exact: true });
    await expect(control).toBeVisible();
    return await control.getAttribute('role') === 'radiogroup'
        ? control.locator('input[type="radio"]:checked').inputValue()
        : control.inputValue();
}

export async function openDetailGroup(page, name) {
    const group = nodeDetails(page).locator(name === 'Model' ? 'details[data-model-controls]' : `details[data-control-group=${JSON.stringify(name)}]`);
    await expect(group).toHaveCount(1);
    if (!await group.evaluate(element => element.open)) await group.locator(':scope > summary').click();
    await expect.poll(() => group.evaluate(element => element.open)).toBe(true);
    return group;
}
