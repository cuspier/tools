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

    // Check that "Share to Device" button is visible
    const shareButton = page.locator('button:has-text("Share to Device")').or(page.locator('button:has-text("기기 간 전송")'));
    await expect(shareButton).toBeVisible();

    // Click "Share to Device" button
    await shareButton.click();

    // Verify ShareModal is open
    await expect(page.locator('role=dialog')).toBeVisible();
    await expect(page.locator('role=dialog').locator('text=Share to Device').or(page.locator('role=dialog').locator('text=기기 간 전송'))).toBeVisible();

    // Verify that the file name in ShareModal card is "merged_document.pdf"
    await expect(page.locator('role=dialog').locator('text=merged_document.pdf')).toBeVisible();

    // Close the ShareModal
    await page.locator('role=dialog').locator('button[aria-label="Close"]').click();
    
    // Verify ShareModal is closed
    await expect(page.locator('role=dialog')).not.toBeVisible();
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

    // Locate the "To Page" input (second number input)
    const toPageInput = page.locator('input[type="number"]').nth(1);

    // Verify initial value is 2 (since sample1 has 2 pages)
    await expect(toPageInput).toHaveValue('2');

    // Test clearing input (should allow empty string and not get stuck at 0)
    await toPageInput.fill('');
    await expect(toPageInput).toHaveValue('');

    // Test typing a valid number
    await toPageInput.fill('1');
    await expect(toPageInput).toHaveValue('1');

    // Test clamping behavior: fill with out of bounds value 10 and blur
    await toPageInput.fill('10');
    await toPageInput.blur();
    await expect(toPageInput).toHaveValue('2');

    // Set page range to 1-1 for split
    await toPageInput.fill('1');

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
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    await page.goto('/edit');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF File")').click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf')
    ]);

    // Wait for canvas to render
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });

    // Wait for PDF dimensions to be populated and canvas width to be set
    await expect(canvas).toHaveAttribute('width', /^[1-9]\d*$/);

    // Verify pages list in sidebar contains 2 pages initially
    await expect(page.locator('text=Pages (2)')).toBeVisible();
    await expect(page.locator('text=Page 1')).toBeVisible();
    await expect(page.locator('text=Page 2')).toBeVisible();

    // Click on the container to add text
    const container = page.locator('div.cursor-crosshair');
    await container.click({ position: { x: 100, y: 100 } });

    // Type text into the new textarea
    const input = page.locator('textarea').last();
    await input.fill('HELLO PLAYWRIGHT');

    // Add a blank page
    await page.click('button:has-text("Add Blank Page")');
    // Verify page list count increases to 3
    await expect(page.locator('text=Pages (3)')).toBeVisible();
    await expect(page.locator('text=Page 3')).toBeVisible();

    // Click on the container to add text on the blank page
    await container.click({ position: { x: 150, y: 150 } });
    const input2 = page.locator('textarea').last();
    await input2.fill('TEXT ON BLANK PAGE');

    // Hover and delete the annotation on the blank page
    await input2.hover();
    await page.locator('.delete-ann-btn').last().click();

    // Delete Page 2
    await page.locator('text=Page 2').hover();
    await page.locator('.delete-page-btn').nth(1).click();
    // Verify page list count decreases to 2
    await expect(page.locator('text=Pages (2)')).toBeVisible();

    // Click Save Changes
    await page.click('button:has-text("Save Changes")');

    // Wait for download
    const downloadPromise = page.waitForEvent('download');
    await page.click('a:has-text("Download PDF")');
    const download = await downloadPromise;

    // Verify download filename
    expect(download.suggestedFilename()).toBe('edited_sample1.pdf');

    // Verify no rendering errors occurred in the browser console
    const renderErrors = errors.filter(e => e.includes('Error rendering PDF'));
    expect(renderErrors).toEqual([]);
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
