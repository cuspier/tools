# Frontend Module

Next.js App Router 기반의 사용자 브라우저 100% 로컬 실행 문서 및 이미지 처리 UI 모듈입니다.

## Purpose

- 이 모듈은 PDF 병합/분할/변환, 증명사진 자동 배치/배경 제거 등 사용자의 파일을 100% 클라이언트 사이드에서 안전하게 처리하는 UI와 로컬 작업 엔진을 configure하고 owns합니다.

## Quick Commands

아래 명령어를 통해 개발, 빌드 및 E2E 브라우저 테스트를 구동할 수 있습니다:

```bash
# 로컬 개발 서버 시작
npm run dev

# 빌드 검증 및 프로덕션 번들링
npm run build

# Playwright 기반 E2E 자동 테스트 전체 실행
npm run test:e2e
```

## Key Files

수정 및 유지가 주로 일어나는 핵심 파일 경로들입니다:

- **포털 메인**: [src/app/page.tsx](file:///C:/workspace/tools/frontend/src/app/page.tsx)
- **PDF 편집 도구**: [src/app/edit/page.tsx](file:///C:/workspace/tools/frontend/src/app/edit/page.tsx)
- **증명사진 도구**: [src/app/id-photo/page.tsx](file:///C:/workspace/tools/frontend/src/app/id-photo/page.tsx)
- **Playwright E2E 테스트**: [tests/tools.spec.ts](file:///C:/workspace/tools/frontend/tests/tools.spec.ts)
- **Playwright 러너 설정**: [playwright.config.ts](file:///C:/workspace/tools/frontend/playwright.config.ts)

## Common Modification Patterns

- **새 도구 추가**: `src/app/` 아래에 새 디렉터리와 `page.tsx`를 생성하고, `src/app/page.tsx` 포털 메인에 링크를 추가합니다.
- **E2E 테스트 추가**: `tests/tools.spec.ts` 파일에 Playwright 테스트 시나리오를 추가합니다.

## Gotchas & Warnings

- **Warning**: 보안 및 프라이버시 원칙에 따라 파일 데이터를 외부 서버로 업로드하는 기능을 구현하지 마십시오.
- **Gotcha**: Next.js App Router 환경에서의 SSR 문제를 방지하기 위해, 브라우저 API나 Canvas 조작 라이브러리는 dynamic import를 통해 클라이언트 사이드에서만 로드되도록 하십시오.
- **Why**: 서버 사이드 렌더링 시 브라우저 전용 객체(window, document, canvas)에 접근하면 런타임 빌드 에러가 발생합니다.
- **Note**: 무거운 PDF 연산 시 렌더 스레드 블로킹 방지를 위해 비동기 처리를 반드시 설계하십시오.
- **Important**: Playwright E2E 테스트를 완료하기 전에는 작업 완료로 판정하지 마십시오.

## Cross-Module Dependencies

- 이 모듈은 Next.js breaking 변경 규약인 [AGENTS.md](AGENTS.md)를 depend하며 준수합니다.
- 프로젝트 전체 가이드는 상위의 [CLAUDE.md](../CLAUDE.md) 및 [README.md](README.md) 파일을 참조하십시오.
