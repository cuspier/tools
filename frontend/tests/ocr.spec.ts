import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('OCR Tool End-to-End Tests', () => {

  test.beforeAll(async ({ browser }) => {
    // Generate a test image with text by taking a screenshot
    const page = await browser.newPage();
    await page.setContent('<div style="font-size: 50px; font-family: sans-serif; padding: 50px; background: white; color: black;">TEST OCR TEXT</div>');
    await page.screenshot({ path: path.join(__dirname, 'fixtures/screenshot.png') });
    await page.close();
  });

  test.afterAll(async () => {
    const fixturePath = path.join(__dirname, 'fixtures/screenshot.png');
    if (fs.existsSync(fixturePath)) {
      fs.unlinkSync(fixturePath);
    }
  });

  test('Should extract text from uploaded image', async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/ocr');

    // Wait for the file input to be available
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select Image File")').click();
    const fileChooser = await fileChooserPromise;
    
    // Upload the screenshot
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/screenshot.png')
    ]);

    // Verify file is loaded
    await expect(page.locator('text=screenshot.png')).toBeVisible();

    // Click Extract button
    await page.click('button:has-text("Extract Text")');

    // Wait for extraction to complete (the textarea should contain the text)
    // tesseract might take a few seconds
    await expect(page.locator('textarea')).toHaveValue(/TEST OCR TEXT/i, { timeout: 30000 });

    // Download the text
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Text File")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('extracted_screenshot.txt');
  });

});
