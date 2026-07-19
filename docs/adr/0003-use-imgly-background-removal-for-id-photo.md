# 배경 제거에 @imgly/background-removal 사용

증명사진 도구의 배경 제거 기능에 `@imgly/background-removal` 라이브러리를 사용한다.

이 프로젝트는 100% 로컬 처리 원칙을 따르므로 `remove.bg` 같은 외부 API는 사용할 수 없다. 브라우저에서 실행 가능한 대안 중 `@imgly/background-removal`이 설정이 가장 단순하고 실제 서비스에서 검증된 WASM+ONNX 기반 라이브러리이므로 선택했다.

## Considered Options

- **`@imgly/background-removal`** ✅ — WASM+ONNX, 완전 로컬, 설정 단순, 초기 모델 다운로드 약 30~80MB
- **`transformers.js`** — HuggingFace 모델 사용, 유연하지만 설정 복잡
- **외부 API (remove.bg 등)** — 품질 최상이지만 로컬 처리 원칙 위반으로 제외

## Consequences

초기 접속 시 모델 파일 다운로드로 인해 약 30~80MB 로딩이 발생한다. 이후 캐싱으로 재접속 시에는 즉시 실행된다. 진행 표시(Progress indicator)로 사용자에게 안내한다.
