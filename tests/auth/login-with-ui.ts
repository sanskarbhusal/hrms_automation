import { test, expect } from '@playwright/test';
import data from "../../fixture/data.json"

test('Verify that admin can login with valid credentials.', async ({ page }) => {
  await page.goto('/auth/login');
  await expect(page.getByText('Sign in to HRM')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(data.role.admin.email);
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill(data.role.admin.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
});


