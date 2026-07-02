import { test, expect } from '@playwright/test';

test.describe('LocalPDF i18n Translation Tests', () => {
  test('Should switch language and persist in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every tool you need to work with PDFs in one place');
    
    // Switch to KO
    await page.getByRole('button', { name: 'KO', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
    
    // Check local storage
    const localeKo = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeKo).toBe('ko');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
    
    // Switch to EN
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every tool you need to work with PDFs in one place');
    
    // Check local storage
    const localeEn = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeEn).toBe('en');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Every tool you need to work with PDFs in one place');
  });
});
