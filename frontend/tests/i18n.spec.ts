import { test, expect } from '@playwright/test';

test.describe('LocalPDF i18n Translation Tests', () => {
  test('Should switch language and persist in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Local PDF Tools running 100% securely in your browser');
    
    // Switch to KO
    await page.getByRole('button', { name: 'KO', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('브라우저에서 100% 안전하게 실행되는 로컬 PDF 도구');
    
    // Check local storage
    const localeKo = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeKo).toBe('ko');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('브라우저에서 100% 안전하게 실행되는 로컬 PDF 도구');
    
    // Switch to EN
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Local PDF Tools running 100% securely in your browser');
    
    // Check local storage
    const localeEn = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeEn).toBe('en');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Local PDF Tools running 100% securely in your browser');
  });
});
