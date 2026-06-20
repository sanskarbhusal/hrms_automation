import { Page,expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('http://localhost:5173/auth/login');
  await expect(page.getByText('Sign in to HRM')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Email *' }).click();
  await page.getByRole('textbox', { name: 'Email *' }).fill('admin@demo.test');
  await page.getByRole('textbox', { name: 'Password *' }).click();
  await page.getByRole('textbox', { name: 'Password *' }).fill('Admin@123');
  await page.getByRole('button', { name: 'Sign in' }).click();  
  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible(); 
}