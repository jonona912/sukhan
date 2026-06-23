// @ts-check
import { test, expect } from '@playwright/test'

const website = 'http://localhost:5173/';

test.beforeEach(async ({ page }) => {
  await page.goto(website);
});

test.describe('Home Page', () => {

  test('home page', async ({ page }) => {
    // Expect a title "to contain" a substring.
    const locator = page.getByText('Welcome');
    await expect(locator).toBeVisible();
  });

  // test home page
  // test create account flow
  // test login flow

  test('enter create a new account', async ({ page }) => {
    // send DELETE request to remove test user if it exists
    const deleteResponse = await page.request.delete('http://localhost:5173/api/users/all');
    // optionally assert successful delete or 404
    expect([200, 204, 404]).toContain(deleteResponse.status());
    // Expect a title "to contain" a substring.
    const locator = page.getByRole('button', { name: 'Create Account' }).click();
    await expect(page).toHaveURL('http://localhost:5173/register');
    await page.getByLabel('Username').fill('e2e_testuser1');
    await page.getByLabel('Email').fill('e2e_testuser1@example.com');
    await page.getByLabel('Password', { exact: true }).fill('testpassword');
    await page.getByLabel('Confirm Password').fill('testpassword');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page).toHaveURL('http://localhost:5173/')
    await expect(page.getByText('User registered successfully')).toBeVisible();
  });
});
