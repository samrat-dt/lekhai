import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Tests critical user authentication flows:
 * - Sign up with validation
 * - Sign in with credentials
 * - Password requirements
 * - Session persistence
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display sign up page', async ({ page }) => {
    // Navigate to sign up
    await page.goto('/signup');

    // Verify page elements
    await expect(page.locator('text=Create Account')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should show password strength validation on sign up', async ({ page }) => {
    await page.goto('/signup');

    const passwordInput = page.locator('input[name="password"]');

    // Type weak password
    await passwordInput.fill('weak');

    // Should show validation error (wait for validation message or error state)
    await page.waitForTimeout(500);
    const hasError = await passwordInput.evaluate((el: any) =>
      el.classList.contains('error') || el.getAttribute('aria-invalid') === 'true'
    );

    expect(hasError).toBeTruthy();
  });

  test('should accept strong password on sign up', async ({ page }) => {
    await page.goto('/signup');

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button:has-text("Sign Up")');

    // Fill with valid credentials
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    await emailInput.fill(testEmail);
    await passwordInput.fill('SecurePass123!');

    // Verify form is valid (no error message or disabled submit)
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeFalsy();
  });

  test('should show error for weak password', async ({ page }) => {
    await page.goto('/signup');

    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button:has-text("Sign Up")');

    // Type weak password
    await passwordInput.fill('weak');

    // Submit button should be disabled or show error
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeTruthy();
  });

  test('should show sign in page', async ({ page }) => {
    // Navigate to sign in
    await page.goto('/signin');

    // Verify page elements
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should have link to sign up from sign in page', async ({ page }) => {
    await page.goto('/signin');

    const signUpLink = page.locator('a:has-text("Create Account")');
    await expect(signUpLink).toBeVisible();

    // Click and verify navigation
    await signUpLink.click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('should have link to sign in from sign up page', async ({ page }) => {
    await page.goto('/signup');

    const signInLink = page.locator('a:has-text("Sign In")');
    await expect(signInLink).toBeVisible();

    // Click and verify navigation
    await signInLink.click();
    await expect(page).toHaveURL(/\/signin/);
  });

  test('should display landing page for unauthenticated users', async ({ page }) => {
    // Should be able to see landing page content
    const heading = page.locator('h1, h2');
    await expect(heading.first()).toBeVisible();
  });

  test('should redirect to sign in when accessing protected routes', async ({ page }) => {
    // Try to access protected dashboard
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Should be redirected to sign in
    await expect(page).toHaveURL(/\/(signin|login)/);
  });
});
