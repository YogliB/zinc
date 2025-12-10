zinc/docs/plans/tailwind-v4-upgrade-ide.md

# Tailwind v4 Upgrade in IDE Crate

## Goal

Upgrade Tailwind CSS from version 3 to version 4 in the `ide` crate to leverage new features, performance improvements, and maintain compatibility with modern browsers.

## Scope

- **In Scope:** Update Tailwind CSS dependency, migrate configuration from `tailwind.config.js` to CSS-based config, update PostCSS/Vite integration, handle breaking changes in utilities and directives, test the application.
- **Out of Scope:** Upgrading other dependencies, changes to other crates, browser support for older versions (Safari <16.4, Chrome <111, Firefox <128).

## Risks

- Browser compatibility issues: Mitigation - Ensure target browsers meet v4 requirements; test in supported browsers.
- Breaking changes in utilities: Mitigation - Use the upgrade tool to automate most changes; manually review and update any custom utilities.
- Potential build failures: Mitigation - Run in a new branch; have fallback to revert.

## Dependencies

- Node.js 20 or higher
- Access to Tailwind CSS upgrade tool (`@tailwindcss/upgrade`)

## Priority

Medium

## Logging / Observability

- Monitor build logs for errors during upgrade.
- Check console for runtime issues post-upgrade.

## Implementation Plan (TODOs)

- [ ] **Step 1: Preparation**
    - [ ] Verify Node.js version is 20+
    - [ ] Create a new git branch for the upgrade
    - [ ] Backup current `tailwind.config.js` and related files
- [ ] **Step 2: Run Upgrade Tool**
    - [ ] Install and run `npx @tailwindcss/upgrade` in the `ide` directory
    - [ ] Review the changes made by the tool (dependencies, config, CSS imports)
- [ ] **Step 3: Manual Adjustments**
    - [ ] Update `vite.config.js` to use `@tailwindcss/vite` plugin if recommended
    - [ ] Remove deprecated utilities from codebase if any
    - [ ] Update any custom CSS imports from `@tailwind` to `@import "tailwindcss"`
- [ ] **Step 4: Testing**
    - [ ] Run `npm run build` to ensure no build errors
    - [ ] Run `npm run dev` and test the application in browser
    - [ ] Execute existing test suites (`vitest`, etc.)
- [ ] **Step 5: Finalize**
    - [ ] Commit changes if successful
    - [ ] Merge branch after review

## Docs

- [ ] Update `SETUP.md` or `USAGE.md` if Tailwind version affects setup instructions

## Testing

- [ ] Unit tests for components using Tailwind classes
- [ ] Integration tests for UI functionality
- [ ] Manual testing in supported browsers

## Acceptance

- [ ] Application builds successfully without errors
- [ ] All Tailwind utilities render correctly in the UI
- [ ] No console errors related to Tailwind
- [ ] Tests pass

## Fallback Plan

If issues arise, revert the branch and stick with Tailwind v3.4 until browser support allows or a compatibility mode is available.

## References

- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)

## Complexity Check

- TODO Count: 15
- Depth: 2
- Cross-deps: 0
- **Decision:** Proceed
