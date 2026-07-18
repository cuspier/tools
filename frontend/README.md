# 로컬 문서·이미지 처리 도구 (Local Web PDF & Image Tools)

사용자의 프라이버시를 완벽하게 보장하기 위해 서버 업로드 없이 100% 로컬 브라우저 환경에서만 모든 처리를 수행하는 문서 및 이미지 편집 도구 모음입니다.

## 주요 기능 (Tools)

- **PDF 도구**:
  - **병합 (Merge)**: 여러 PDF 파일을 순서대로 결합하여 하나의 PDF 파일로 다운로드합니다.
  - **분할 (Split)**: 하나의 PDF 파일을 개별 페이지 단위로 분리하여 내보냅니다.
  - **변환 (Convert)**: PDF, 이미지, 워드 문서 간의 상호 변환을 수행합니다.
  - **워터마크 (Watermark)**: PDF 문서에 텍스트 또는 이미지를 반투명하게 삽입합니다.
- **증명사진 도구 (ID Photo)**:
  - **배경 제거 (Background Removal)**: 인물 사진의 배경을 투명하게 지웁니다.
  - **얼굴 중앙 배치 (Face Centering)**: 얼굴 영역을 감지하여 규격에 맞게 크롭합니다.
  - **인쇄 레이아웃 (Print Layout)**: A4 용지 1장에 다수의 증명사진을 배치한 PDF를 생성합니다.
- **기타 도구**:
  - **OCR**: 이미지 내 텍스트를 브라우저 내에서 로컬로 추출합니다.
  - **회전 (Rotate)**: 이미지나 PDF를 회전하여 다운로드합니다.

## 개발 및 검증 (Quick Commands)

로컬 개발 및 자동화 E2E 테스트를 위해 아래 명령어들을 실행할 수 있습니다:

```bash
# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드 실행
npm run build

# Playwright E2E 자동화 테스트 실행 (모든 브라우저 테스트)
npm run test:e2e
```

## 핵심 파일 구조 (Key Files)

이 프로젝트는 Next.js App Router 아키텍처를 따르며, 핵심 파일들은 다음과 같습니다:

- **진입점 포털**: [frontend/src/app/page.tsx](file:///C:/workspace/tools/frontend/src/app/page.tsx)
- **증명사진 도구**: [frontend/src/app/id-photo/page.tsx](file:///C:/workspace/tools/frontend/src/app/id-photo/page.tsx)
- **PDF 편집 도구**: [frontend/src/app/edit/page.tsx](file:///C:/workspace/tools/frontend/src/app/edit/page.tsx)
- **E2E 테스트 스위트**: [frontend/tests/tools.spec.ts](file:///C:/workspace/tools/frontend/tests/tools.spec.ts)
- **Playwright 설정**: [frontend/playwright.config.ts](file:///C:/workspace/tools/frontend/playwright.config.ts)
