import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Standalone Share Page End-to-End Tests', () => {
  test('Share Page UI flow - Should allow selecting file, generating QR, copy link, and cancel/reset', async ({ page }) => {
    // 1. Go to share page
    await page.goto('/share');

    // 2. Verify share page initial header & description (English/Korean)
    // The page uses Header titleKey="share.title", which translates to "Share to Device" or "기기 간 전송"
    await expect(page.locator('h2:has-text("Share to Device")').or(page.locator('h2:has-text("기기 간 전송")'))).toBeVisible();
    await expect(page.locator('text=Drag & drop files here').or(page.locator('text=공유할 파일을 여기에 드래그하거나'))).toBeVisible();

    // 3. Upload a file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("Select PDF Files")').or(page.locator('label:has-text("PDF 파일 선택")')).click();
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/sample1.pdf')
    ]);

    // 4. Verify file name and size are displayed
    await expect(page.locator('text=sample1.pdf')).toBeVisible();

    // 5. Verify P2P radar and QR options are shown
    await expect(page.locator('text=Nearby Devices').or(page.locator('text=주변 기기 찾기'))).toBeVisible();
    await expect(page.locator('text=Remote or Scan QR').or(page.locator('text=원격 또는 직접 QR 연결'))).toBeVisible();

    // 6. Verify Share Link input exists
    const input = page.locator('input[aria-label="Share Link"]');
    await expect(input).toBeVisible();

    // 7. Verify Cancel button exists and returns to upload state
    await page.locator('button:has-text("Cancel")').or(page.locator('button:has-text("취소")')).click();
    await expect(page.locator('label:has-text("Select PDF Files")').or(page.locator('label:has-text("PDF 파일 선택")'))).toBeVisible();
  });
});
