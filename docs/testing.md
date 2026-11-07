# Tests

## Unit and HTTP integration tests

```sh
pnpm test --run
pnpm check
pnpm lint
```

`pnpm test` starts Vitest's watch mode locally. `pnpm test --run` runs it once. `pnpm check` checks both the application and browser-test TypeScript.

## Browser tests

The Playwright suite in `tests/e2e/` runs 17 scenarios in two Chromium projects: desktop/dark and Pixel 7-sized mobile/light. This covers viewports and touch emulation, not separate Firefox/WebKit engines or physical devices.

### First-time setup

```sh
pnpm i --frozen-lockfile
pnpm fetch:signal-tokenizer
pnpm exec playwright install chromium
```

On Linux, install the browser's system dependencies too:

```sh
pnpm exec playwright install --with-deps chromium
```

### Run

```sh
# Build the production app and run both projects
pnpm test:e2e

# One project, or a headed browser
pnpm test:e2e --project=desktop-chromium
pnpm test:e2e --project=desktop-chromium --headed

# Interactive test runner (also builds first)
pnpm test:e2e:ui

# When the app is already built
pnpm exec playwright test

# Repeat to investigate intermittent failures
pnpm exec playwright test --repeat-each=3
```

The production build is intentional: these tests exercise SvelteKit's real Node request/response handling, including the upload-error connection-reset regression. Rebuild after changing application code when running Playwright directly.

### Isolation and safety

- Playwright starts its own server on **127.0.0.1:4187**. It refuses to reuse an existing server. If the port is occupied, choose another with `CHERRY_E2E_PORT=4190 pnpm test:e2e`.
- `scripts/start-e2e-server.mjs` creates a fresh database/data directory under the OS temporary directory and deletes it on normal shutdown. It overrides `DATABASE_PATH`, `DATA_DIR`, JWT secret, proxy authentication, OAuth credentials, and registration settings. Your normal `.env`, development database, and accounts are not modified.
- The Node adapter normally assumes HTTPS. For this loopback HTTP server, the runner configures `PROTOCOL_HEADER=x-forwarded-proto`, and Playwright sends `x-forwarded-proto: http`, like a trusted reverse proxy. CSRF protection remains enabled.
- Every test gets a new browser context and unique account; the signup/sign-in scenario creates its account through the UI. Other scenarios use the signup API for setup, sharing cookies with their browser context.
- Tests exercise real app APIs and SQLite writes. They block external browser traffic and stub the local favicon endpoint to avoid internet dependencies and slow third-party lookups.
- CSV/HTML fixtures are small and deterministic. The suite does not download the public sample export at runtime.
- Temporary files may remain if the runner is forcibly killed with SIGKILL; their directory names begin with `cherry-e2e-`.

### Coverage

- Authentication-required pages and imports; UI signup, failed/successful sign-in, sign-out, and session persistence.
- Cross-account bookmark reads/edits and import duplicate detection.
- UI bookmark creation, editing, clearing title/description, persistence after reload, bulk delete, and undo.
- Search submission with domains, full URLs, Unicode, punctuation, multiple words, and quoted phrases.
- CSV preview without writes, confirm, repeated imports, additive tag merges, groups, dates, Unicode, quoted/multiline fields, and empty descriptions.
- Dropdown mouse/keyboard controls, Escape/outside dismissal, stale-preview invalidation, and disabled controls while requests are pending.
- Malformed/empty files, record limits, oversized file selection, and actual browser fetch responses for oversized/invalid UTF-8 bodies.
- Browser HTML and legacy Pocket HTML imports.

The dedicated edit page uses the same form as the modal and is used for edit tests on both viewports, avoiding dependence on the bookmark's hover-only action menu.

### Failures and debugging

Playwright writes an HTML report to `playwright-report/`. Failed tests retain traces, screenshots, and error context under `test-results/`. Both directories are ignored by Git and Docker.

```sh
pnpm exec playwright show-report
pnpm exec playwright show-trace test-results/<failed-test>/trace.zip
```

Tests fail on unexpected page exceptions. They use role/label locators and response/DOM assertions rather than fixed sleeps. Explicit request gating tests loading states without introducing arbitrary delays.

## CI

The build workflow runs on pushes and pull requests. It installs Chromium, builds once, runs the browser suite, and uploads reports/screenshots/traces as `browser-test-results` when a job fails (retained for seven days). Browser test failures block the Docker build.

CI uses two workers and up to two retries; each retry gets a fresh browser context/account. Fork PRs do not need notification or registry credentials, and Docker publishing remains push-only.
