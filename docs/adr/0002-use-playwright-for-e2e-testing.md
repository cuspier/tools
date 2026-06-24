# Architecture Decision Record: 0002 - Automated End-to-End Testing with Playwright

## Status
Accepted

## Context
As we are building a 100% client-side PDF processing application, testing becomes a unique challenge. We need to ensure that local file uploads, browser-based manipulations (using `pdf-lib` and `pdf.js`), and subsequent downloads work perfectly across different browser engines without regressions. 
Unit tests alone are insufficient because the core logic heavily relies on browser APIs (Canvas, File API, Object URLs, Blob downloads) and user interactions.

## Decision
We will use **Playwright** as our primary testing framework.
- Playwright provides native support for intercepting and verifying file downloads, which is critical for an application that generates and downloads modified files locally.
- It supports multiple browser engines natively.
- Tests will cover the full E2E flow: navigating to the tool, uploading files, executing the client-side manipulation, and verifying the downloaded output file format.
- A rule has been added to `AGENTS.md` explicitly requiring that all new tools must be covered by automated Playwright tests before being considered complete.

## Consequences

### Positive
- High confidence that client-side file manipulation works as expected.
- Regressions will be caught automatically.
- Tests simulate the exact user experience (uploading -> processing -> downloading).

### Negative
- Slower test execution compared to unit tests.
- Requires maintaining mock PDF files (test fixtures) within the repository.
