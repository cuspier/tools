import { test, expect } from '@playwright/test';

test.describe('LocalPDF i18n Translation Tests', () => {
  test('Should switch language and persist in localStorage', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('File tasks, now done right here, right now');
    
    // Switch to KO
    await page.getByRole('button', { name: 'KO', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('파일 작업, 이제 바로틀에서 바로');
    
    // Check local storage
    const localeKo = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeKo).toBe('ko');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('파일 작업, 이제 바로틀에서 바로');
    
    // Switch to EN
    await page.getByRole('button', { name: 'EN', exact: true }).click();
    
    // Wait for UI text (retrying)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('File tasks, now done right here, right now');
    
    // Check local storage
    const localeEn = await page.evaluate(() => localStorage.getItem('localpdf_locale'));
    expect(localeEn).toBe('en');
    
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('File tasks, now done right here, right now');
  });
});
