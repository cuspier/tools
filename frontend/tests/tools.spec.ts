import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('LocalPDF Tools End-to-End Tests', () => {
  
  test('Merge PDF - Should merge two PDFs and download successfully', async ({ page }) => {
    await page.goto('/merge');

    // Wait for the file input to be available
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF Files")').click();
    const fileChooser = await fileChooserPromise;
    
    // Upload two dummy files
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf'),
      path.join(__dirname, 'fixtures/sample2.pdf')
    ]);

    // Verify files are listed
    await expect(page.locator('text=Selected Files (2)')).toBeVisible();

    // Click Merge button
    await page.click('button:has-text("Merge PDFs Now")');

    // Wait for merge to complete and download button to appear
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download Merged PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('merged_document.pdf');
    
    // Check for success message
    await expect(page.locator('text=PDFs Merged Successfully!')).toBeVisible();
  });

  test('Split PDF - Should extract pages and download successfully', async ({ page }) => {
    await page.goto('/split');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF File")').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf')
    ]);

    // Verify file is loaded
    await expect(page.locator('text=sample1.pdf')).toBeVisible();

    // Set page range (sample has 2 pages)
    await page.locator('input[type="number"]').nth(1).fill('1');

    // Click Split button
    await page.click('button:has-text("Extract Pages")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download Extracted PDF")');
    const download = await downloadPromise;

    // Verify download filename pattern
    expect(download.suggestedFilename()).toBe('sample1_1-1.pdf');
  });

  test('Rotate PDF - Should rotate pages and download successfully', async ({ page }) => {
    await page.goto('/rotate');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF File")').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample2.pdf')
    ]);

    // Verify file is loaded
    await expect(page.locator('text=sample2.pdf')).toBeVisible();

    // Select 180 degrees
    await page.click('button:has-text("Right 180°")');

    // Click Rotate button
    await page.click('button:has-text("Rotate PDF")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download Rotated PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('rotated_sample2.pdf');
  });

  test('Watermark PDF - Should add watermark and download successfully', async ({ page }) => {
    await page.goto('/watermark');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF File")').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf')
    ]);

    // Verify file is loaded
    await expect(page.locator('text=sample1.pdf')).toBeVisible();

    // Fill watermark text
    await page.fill('input[type="text"]', 'TESTING');

    // Click Watermark button
    await page.click('button:has-text("Add Watermark")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('watermarked_sample1.pdf');
  });

  test('Edit PDF - Should add text annotations and download successfully', async ({ page }) => {
    await page.goto('/edit');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF File")').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf')
    ]);

    // Wait for canvas to render
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });

    // Click on the container to add text
    const container = page.locator('div.cursor-crosshair');
    await container.click({ position: { x: 100, y: 100 } });

    // Type text into the new input
    const input = page.locator('input[type="text"]').last();
    await input.fill('HELLO PLAYWRIGHT');

    // Click Save Changes
    await page.click('button:has-text("Save Changes")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('edited_sample1.pdf');
  });

  test('Convert to PDF - Should convert images to PDF and download successfully', async ({ page }) => {
    await page.goto('/convert');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select Files")').click();
    const fileChooser = await fileChooserPromise;
    
    // We can reuse the screenshot.png from the OCR test (it's an image)
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/screenshot.png')
    ]);

    // Verify file is loaded
    await expect(page.locator('text=Selected Files (1)')).toBeVisible();

    // Click Convert to PDF
    await page.click('button:has-text("Convert to PDF")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('converted_document.pdf');
  });

});
