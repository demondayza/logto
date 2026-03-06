# Baseline Capture

Date: 2026-03-04
Repo: /Users/andrewmargetts/Development/clientwork/myeyes/myeyesid
Branch: myeyesid

## Command outcomes

| Command | Exit code | Duration (s) | Outcome | Log |
| --- | ---: | ---: | --- | --- |
| `pnpm install` | 0 | 82 | Passed with warnings | `branding/.baseline-logs/pnpm_install.log` |
| `pnpm -r build` | 0 | 82 | Passed with warnings | `branding/.baseline-logs/pnpm_-r_build.log` |
| `pnpm ci:lint` | 0 | 187 | Passed with warnings | `branding/.baseline-logs/pnpm_ci_lint.log` |
| `CI=true pnpm ci:test` | 1 | 24 | Failed (`@myeyesid/core` test command exits with no tests) | `branding/.baseline-logs/pnpm_ci_test.log` |

## Details

### `pnpm install`

- Completed successfully.
- Reported ignored build scripts: `@swc/core`, `core-js`, `esbuild`, `puppeteer`, `tsup`.
- Reported peer dependency warnings (examples):
  - `stylelint-scss` unmet peer `stylelint@^16.0.2` (found `15.11.0`)
  - `@vitejs/plugin-react` unmet peer `vite@"^4.2.0 || ^5.0.0"` (found `6.4.1`)

### `pnpm -r build`

- Completed successfully across workspace packages.
- Included warning in `packages/core`: unsupported engine wanted Node `^22.14.0`, current Node `v20.19.6`.

### `pnpm ci:lint`

- Completed successfully.
- `packages/console` reported `29` warnings and `0` errors.
- Example warning categories: `no-warning-comments`, `react-hooks/exhaustive-deps`.

### `CI=true pnpm ci:test`

- Command terminates deterministically in CI mode.
- Failure source:
  - `packages/core test:ci: No tests found, exiting with code 1`
  - `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL @myeyesid/core@1.37.1 test:ci`
- This is a baseline repo behavior in current environment, not a branding change regression.
