import { test, expect } from '@playwright/test';

test.describe('LocalPDF i18n Translation Tests', () => {
  test('Should switch language and persist in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
    
    await page.click('button:has-text("KO")');
    await expect(page.locator('h1')).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
    
    await page.reload();
    await expect(page.locator('h1')).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
    
    await page.click('button:has-text("EN")');
    await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
    
    await page.reload();
    await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
  });
});
