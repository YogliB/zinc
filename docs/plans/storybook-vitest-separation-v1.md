# Storybook-Vitest-Separation-v1

## Goal

Separate Storybook to run only stories (no tests) and configure Vitest for component testing with testing-library, keeping the setup simple.

## Scope

- **In Scope:** Modify Storybook config, add Vitest test script, configure Vitest for browser testing, remove unnecessary files.
- **Out of Scope:** Package updates, complex testing setups, changes to existing components or stories.

## Risks

- Version incompatibilities between Vitest, @vitest/browser-playwright, and Svelte 5: Mitigation - test after changes and revert if issues persist.
- Tests failing due to environment issues: Mitigation - use browser mode as configured.

## Dependencies

- None

## Priority

Medium

## Logging / Observability

- None required

## Implementation Plan (TODOs)

- [x] **Remove Vitest addon from Storybook**
    - [x] Edit .storybook/main.ts to remove "@storybook/addon-vitest" from addons array
- [x] **Add test script to package.json**
    - [x] Add "test": "vitest" to scripts in package.json
- [x] **Configure Vitest for browser testing**
    - [x] Update vitest.config.ts to use browser mode with Playwright provider
    - [x] Import playwright from @vitest/browser-playwright
- [x] **Clean up Storybook files**
    - [x] Remove .storybook/vitest.setup.ts if it exists
- [x] **Verify setup**
    - [x] Run bun run storybook to ensure stories load without tests
    - [ ] Run bun test to execute component tests (failing due to Svelte 5 compatibility)

## Docs

- [x] Update this plan after completion

## Testing

- [ ] Run existing FileTree.test.ts to ensure it passes with new config (failing due to Svelte 5 mount not available in server environments)
- [x] Verify Storybook UI shows stories without test results

## Acceptance

- [x] Storybook runs stories only, no test execution
- [ ] Vitest runs component tests with testing-library successfully (blocked by Svelte 5 compatibility issues)
- [x] No errors in console for storybook command
- [ ] No errors in console for test command (tests fail due to mount unavailable in server environments)

## Fallback Plan

If tests fail due to version issues, revert vitest.config.ts to jsdom environment and investigate @testing-library/svelte compatibility with Svelte 5.

## Execution Notes

- Storybook separation completed successfully.
- Vitest configuration attempted with browser mode, but @vitest/browser-playwright has version compatibility issues (serverFactory error).
- Tests fail because Svelte 5 mount is not available in server environments (jsdom/happy-dom).
- To fix: Either wait for updated @testing-library/svelte for Svelte 5, or use browser mode once provider is fixed, or test logic separately without component mounting.

## References

- Svelte 5 testing docs
- Vitest browser mode documentation

## Complexity Check

- TODO Count: 8
- Depth: 2
- Cross-deps: 0
- **Decision:** Proceed (low complexity, fits in single PR)
