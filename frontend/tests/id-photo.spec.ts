import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('증명사진 자동화 도구 (ID Photo Tool)', () => {

  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
    await page.goto('/');
    await page.evaluate(() => localStorage.setItem('localpdf_locale', 'ko'));
  });

  test('홈 화면에 증명사진 도구가 이미지 도구 섹션에 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=이미지 도구')).toBeVisible();
    await expect(page.getByRole('heading', { name: '증명사진 자동화' })).toBeVisible();
  });

  test('증명사진 도구 페이지에 접근하면 업로드 UI가 표시된다', async ({ page }) => {
    await page.goto('/id-photo');
    await expect(page.getByRole('heading', { name: '증명사진 자동화' })).toBeVisible();
    await expect(page.locator('label:has-text("사진 업로드")')).toBeVisible();
    await expect(page.locator('text=100% 로컬 처리')).toBeVisible();
  });

  test('이미지 업로드 후 배경 제거가 완료되고 규격 선택 UI가 표시된다', async ({ page }) => {
    await page.goto('/id-photo');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("사진 업로드")').click();
    const fileChooser = await fileChooserPromise;

    await fileChooser.setFiles([
      path.join(__dirname, 'fixtures/portrait.jpg')
    ]);

    // 배경 제거 완료까지 대기 (최대 60초 — 첫 모델 다운로드 포함)
    await expect(page.locator('text=규격 선택')).toBeVisible({ timeout: 60000 });
  });

  test('여권 규격 선택 시 배경색이 흰색으로 고정된다', async ({ page }) => {
    await page.goto('/id-photo');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("사진 업로드")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([path.join(__dirname, 'fixtures/portrait.jpg')]);

    await expect(page.locator('text=규격 선택')).toBeVisible({ timeout: 60000 });

    // 여권 규격 선택
    await page.locator('button:has-text("여권")').click();

    // 배경색 고정 안내 문구 확인
    await expect(page.locator('text=여권사진은 흰색 배경만 허용됩니다')).toBeVisible();
  });

  test('이미지 다운로드 버튼 클릭 시 파일이 다운로드된다', async ({ page }) => {
    await page.goto('/id-photo');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("사진 업로드")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([path.join(__dirname, 'fixtures/portrait.jpg')]);

    await expect(page.locator('text=규격 선택')).toBeVisible({ timeout: 60000 });

    // 반명함 선택
    await page.locator('button:has-text("반명함")').click();

    // 이미지 다운로드
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("이미지 저장")').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/id-photo.*\.(jpg|png)$/);
  });

  test('인쇄 레이아웃 PDF 다운로드 버튼 클릭 시 PDF 파일이 다운로드된다', async ({ page }) => {
    await page.goto('/id-photo');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.locator('label:has-text("사진 업로드")').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles([path.join(__dirname, 'fixtures/portrait.jpg')]);

    await expect(page.locator('text=규격 선택')).toBeVisible({ timeout: 60000 });

    // 반명함 선택
    await page.locator('button:has-text("반명함")').click();

    // 인쇄 레이아웃 PDF 다운로드
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("인쇄용 PDF")').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/id-photo.*\.pdf$/);
  });

});
