import { test, expect } from '@playwright/test';
import {login} from "../../utils/login"

test.beforeEach('Login as admin',async({page})=>{
await login(page)
})

test('[ORG_01] Verify that user can user can create new branch.', async ({ page }) => {
await page.getByRole('button', { name: 'Organisation' }).click();
await page.getByRole('link', { name: 'Branches' }).click();
await page.getByRole('button', { name: 'New branch' }).click();
await page.getByRole('textbox', { name: 'Name *' }).fill('Gyaneshwor Branch');
await page.getByRole('textbox', { name: 'Code *' }).click();
await page.getByRole('textbox', { name: 'Code *' }).fill('GYAN');
await page.locator('div').filter({ hasText: /^New branch$/ }).nth(1).click();
await page.getByRole('textbox', { name: 'City' }).click();
await page.getByRole('textbox', { name: 'City' }).fill('Kathmandu');
await page.getByRole('textbox', { name: 'Country' }).click();
await page.getByRole('textbox', { name: 'Country' }).fill('Nepal');
await page.getByRole('textbox', { name: 'Address' }).click();
await page.getByRole('textbox', { name: 'Address' }).fill('Raatopool paari');
await page.getByRole('textbox', { name: 'Phone' }).click();
await page.getByRole('textbox', { name: 'Phone' }).fill('9888888888');
await page.getByRole('button', { name: 'Create branch' }).click();
await expect(page.getByRole('cell', { name: 'Gyaneshwor Branch' })).toBeVisible({timeout:5000});
await expect(page.getByRole('cell', { name: 'GYAN', exact: true })).toBeVisible();
await expect(page.getByRole('cell', { name: 'Kathmandu' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'Nepal' })).toBeVisible();
await page.getByRole('button', { name: 'Move to trash' }).first().click();
await page.getByRole('button', { name: 'Move to trash' }).click();
await page.waitForTimeout(1000);
});

test('[ORG_02] Verify that user can edit branch details.',async({page})=>{

await page.getByRole('button', { name: 'Organisation' }).click();
await page.getByRole('link', { name: 'Branches' }).click();
await page.getByRole('button', { name: 'New branch' }).click();
await page.getByRole('textbox', { name: 'Name *' }).click();
await page.getByRole('textbox', { name: 'Name *' }).fill('test');
await page.getByRole('textbox', { name: 'Code *' }).click();
await page.getByRole('textbox', { name: 'Code *' }).fill('test');
await page.getByRole('textbox', { name: 'City' }).click();
await page.getByRole('textbox', { name: 'City' }).fill('test');
await page.getByRole('textbox', { name: 'Country' }).click();
await page.getByRole('textbox', { name: 'Country' }).fill('test');
await page.getByRole('textbox', { name: 'Address' }).click();
await page.getByRole('textbox', { name: 'Address' }).fill('test');
await page.getByRole('textbox', { name: 'Phone' }).click();
await page.getByRole('textbox', { name: 'Phone' }).fill('9888888888888');
await page.getByRole('button', { name: 'Create branch' }).click();

await expect(page.getByRole('cell', { name: 'test' }).first()).toBeVisible({timeout:5000});
await expect(page.getByRole('cell', { name: 'test' }).nth(1)).toBeVisible()
await expect(page.getByRole('cell', { name: 'test' }).nth(2)).toBeVisible();
await expect(page.getByRole('cell', { name: 'test' }).nth(3)).toBeVisible();

await page.getByRole('button', { name: 'Edit' }).first().click()
await page.getByRole('textbox', { name: 'Name *' }).click();
await page.getByRole('textbox', { name: 'Name *' }).fill('updated_name');
await page.getByRole('textbox', { name: 'Code *' }).click();
await page.getByRole('textbox', { name: 'Code *' }).fill('updated_code');
await page.getByRole('textbox', { name: 'City' }).click();
await page.getByRole('textbox', { name: 'City' }).fill('updated_city');
await page.getByRole('textbox', { name: 'Country' }).click();
await page.getByRole('textbox', { name: 'Country' }).fill('updated_country');
await page.getByRole('textbox', { name: 'Address' }).click();
await page.getByRole('textbox', { name: 'Address' }).fill('updated_address');;

await page.getByRole('textbox', { name: 'Phone' }).click();
await page.getByRole('textbox', { name: 'Phone' }).fill('977777777');
await page.getByRole('button', { name: 'Save changes' }).click();


await expect(page.getByRole('cell', { name: 'updated_name' })).toBeVisible({timeout:5000})
await expect(page.getByRole('cell', { name: 'updated_code' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'updated_city' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'updated_country' })).toBeVisible();;


await page.getByRole('button', { name: 'Move to trash' }).first().click()
await page.getByRole('button', { name: 'Move to trash' }).click()
await page.getByRole('button', { name: 'Move to trash' }).click();
})

test.only('[ORG_03] Verify that user can delete branch.',async({page})=>{
await page.getByRole('button', { name: 'Organisation' }).click();
await page.getByRole('link', { name: 'Branches' }).click();
await page.getByRole('button', { name: 'New branch' }).click();

await page.getByRole('textbox', { name: 'Name *' }).click();
await page.getByRole('textbox', { name: 'Name *' }).fill('deleting_branch');
await page.getByRole('textbox', { name: 'Code *' }).click()
await page.getByRole('textbox', { name: 'Code *' }).fill('deleting_code');
await page.getByRole('textbox', { name: 'City' }).click();
await page.getByRole('textbox', { name: 'City' }).fill('d');
await page.getByRole('textbox', { name: 'City' }).fill('deleting_city');
await page.getByRole('textbox', { name: 'Country' }).click();
await page.getByRole('textbox', { name: 'Country' }).fill('d');
await page.getByRole('textbox', { name: 'Country' }).fill('deleting_country');
await page.getByRole('textbox', { name: 'Address' }).click();
await page.getByRole('textbox', { name: 'Address' }).fill('deleting_address');
await page.getByRole('textbox', { name: 'Phone' }).click();
await page.getByRole('textbox', { name: 'Phone' }).fill('988888888888');
await page.getByRole('button', { name: 'Create branch' }).click();;


await expect(page.getByRole('cell', { name: 'deleting_branch' })).toBeVisible()
await expect(page.getByRole('cell', { name: 'deleting_code' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'deleting_city' })).toBeVisible();
await expect(page.getByRole('cell', { name: 'deleting_country' })).toBeVisible();


await page.getByRole('button', { name: 'Move to trash' }).first().click();
await page.getByRole('button', { name: 'Move to trash' }).click();

await page.pause()

});

// test('[ORG_04] Verify that user can search branches by name, code or city.',async({page})=>{

// });

// test('[ORG_05] Verify that user can create new department.',async({page})=>{

// });

// test('[ORG_06] Verify that the user can edit department details.',async({page})=>{

// });

// test('[ORG_07] Verify that the user can delete department.',async({page})=>{

// });

// test('[ORG_08] Verify that the user can [search] department.',async({page})=>{

// });

// test('[ORG_09] Verify that the filter on the right side of [search] bar works.',async({page})=>{

// });

// test('[ORG_10] Verify that user can create new designation.',async({page})=>{

// });

// test('[ORG_11] Verify that the user can edit designation details.',async({page})=>{

// });

// test('[ORG_12] Verify that the user can delete designation.',async({page})=>{

// });

// test('[ORG_13] Verify that the user can [search] designation.',async({page})=>{

// });

// test('[ORG_14] Verify that the filter on the right side of [search] bar works.',async({page})=>{

// });