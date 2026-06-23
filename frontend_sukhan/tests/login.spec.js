import { test, expect } from '@playwright/test'

const website = 'http://localhost:5173/'
const apiBase = 'http://localhost:5173'

const testUsers = [{
  username: 'e2e_login_user',
  email: 'e2e_login_user@example.com',
  password: 'testpassword',
  passwordConfirm: 'testpassword',
  }, {
  username: 'e2e_login_user2',
  email: 'e2e_login_user2@example.com',
  password: 'testpassword',
  passwordConfirm: 'testpassword',
}]

test.beforeAll(async ({ request }) => {
  await request.delete(`${apiBase}/api/users/all`)
  await request.delete(`${apiBase}/api/posts/all`)

  const response = await request.post(`${apiBase}/api/auth/register`, {
    data: testUsers[0],
  })
  expect([200, 201]).toContain(response.status())
})

test.beforeEach(async ({ page }) => {
  await page.goto(website)
})

test.describe('Login Flow', () => {
  test('login flow', async ({ page }) => {
    await expect(page.getByText('Welcome')).toBeVisible()

    await page.getByRole('button', { name: 'Login' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.getByLabel('Email').fill(testUsers[0].email)
    await page.getByLabel('Password').fill(testUsers[0].password)
    await page.getByRole('button', { name: 'Login' }).click()

    await expect(page).toHaveURL(website)
	  await expect(page.getByText('Login successful')).toBeVisible()
    const token = await page.evaluate(() => localStorage.getItem('authToken'))
    expect(token).toBeTruthy()
    expect(token.split('.')).toHaveLength(3)
    // Create a new post
    await page.getByRole('button', { name: 'New Post' }).click()
    await expect(page).toHaveURL(/\/new-post$/)
    await page.getByLabel('content').fill('This is a test post 2')
    await page.getByRole('button', { name: 'Post' }).click()
    await expect(page).toHaveURL(website)
    await expect(page.getByText('This is a test post 2')).toBeVisible()
    await expect(page.getByText('likes: 0')).toBeVisible()
    await page.getByRole('button', { name: 'Like' }).click()
    await expect(page.getByText('likes: 1')).toBeVisible()
  })
})
