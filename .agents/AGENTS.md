# Workspace Rules

## Architecture Constraints
- **100% Local Browser Execution**: All PDF processing, editing, manipulation, and conversion tasks MUST be performed directly within the user's local browser.
- **No Backend Processing**: Do not use or propose server-side Python, Node.js, or other backend frameworks for processing files. Use purely client-side libraries (e.g., `pdf-lib`, `pdf.js`, `tesseract.js`, and WASM modules) to ensure complete privacy and local execution.

## Testing & Quality Assurance Constraints
- **Mandatory Automated E2E Testing**: Every new feature or tool (e.g., Merge, Split, Edit) MUST be accompanied by an automated End-to-End (E2E) test using Playwright. No feature is considered complete until it has a passing test that runs in the browser, verifying file uploads, processing, and downloads locally.

## Agent skills

### Issue tracker

Issues are tracked using local markdown files under `.scratch/`. See [issue-tracker.md](file:///c:/workspace/tools/docs/agents/issue-tracker.md).

### Triage labels

Triage states are managed using default canonical roles. See [triage-labels.md](file:///c:/workspace/tools/docs/agents/triage-labels.md).

### Domain docs

The project uses a single-context domain documentation layout. See [domain.md](file:///c:/workspace/tools/docs/agents/domain.md).
