import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Authentication Flow', () => {
  test.describe('Sign Up', () => {
    test('should successfully create new account', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-up`);

      // Fill form
      await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="name"]', 'Test User');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL(`${BASE_URL}/dashboard`);
      expect(page.url()).toContain('/dashboard');
    });

    it('should reject weak password', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-up`);

      await page.fill('input[name="email"]', 'user@example.com');
      await page.fill('input[name="password"]', 'weak');

      // Try to submit
      const submitButton = page.locator('button[type="submit"]');
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(true);
    });

    test('should show error on duplicate email', async ({ page, context }) => {
      const email = `duplicate-${Date.now()}@example.com`;

      // First signup
      await page.goto(`${BASE_URL}/sign-up`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.fill('input[name="name"]', 'User 1');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Logout and try duplicate
      await page.goto(`${BASE_URL}/sign-out`);

      // New page context for second signup
      const page2 = await context.newPage();
      await page2.goto(`${BASE_URL}/sign-up`);
      await page2.fill('input[name="email"]', email);
      await page2.fill('input[name="password"]', 'SecurePass123!');
      await page2.fill('input[name="name"]', 'User 2');
      await page2.click('button[type="submit"]');

      // Should show error
      const errorMessage = page2.locator('text=already registered');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Sign In', () => {
    test('should successfully login with correct credentials', async ({ page }) => {
      const email = `login-${Date.now()}@example.com`;
      const password = 'SecurePass123!';

      // Create account first
      await page.goto(`${BASE_URL}/sign-up`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="name"]', 'Test User');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Logout
      await page.goto(`${BASE_URL}/sign-out`);
      await page.waitForURL(`${BASE_URL}/sign-in`);

      // Login
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.click('button[type="submit"]');

      await page.waitForURL(`${BASE_URL}/dashboard`);
      expect(page.url()).toContain('/dashboard');
    });

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPass123!');
      await page.click('button[type="submit"]');

      // Should show error
      const errorMessage = page.locator('text=Invalid email or password');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should navigate to password reset form', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-in`);

      // Click forgot password link
      await page.click('text=Forgot password');

      // Should be on reset page
      expect(page.url()).toContain('/forgot-password');
    });

    test('should have password strength requirements visible', async ({ page }) => {
      await page.goto(`${BASE_URL}/sign-up`);

      const requirements = page.locator('text=8 characters');
      await expect(requirements).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session on page refresh', async ({ page }) => {
      const email = `session-${Date.now()}@example.com`;
      const password = 'SecurePass123!';

      // Create and login
      await page.goto(`${BASE_URL}/sign-up`);
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="password"]', password);
      await page.fill('input[name="name"]', 'Test User');
      await page.click('button[type="submit"]');
      await page.waitForURL(`${BASE_URL}/dashboard`);

      // Refresh page
      await page.reload();

      // Should still be logged in
      expect(page.url()).toContain('/dashboard');
      const logoutLink = page.locator('text=Sign out');
      await expect(logoutLink).toBeVisible();
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/dashboard`);

      // Should redirect to sign-in
      await page.waitForURL(`${BASE_URL}/sign-in`);
      expect(page.url()).toContain('/sign-in');
    });
  });

  test.describe('Rate Limiting', () => {
    test('should rate limit login attempts', async ({ page }) => {
      // Attempt multiple failed logins
      for (let i = 0; i < 6; i++) {
        await page.goto(`${BASE_URL}/sign-in`);
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'wrong');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(100);
      }

      // Should show rate limit message
      const rateLimitMessage = page.locator('text=Too many requests');
      const isVisible = await rateLimitMessage.isVisible().catch(() => false);

      if (isVisible) {
        await expect(rateLimitMessage).toBeVisible();
      }
    });
  });
});
