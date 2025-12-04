# PR1: ESLint Configuration Hierarchy

## Goal

Establish hierarchical ESLint configuration where root defines minimal universal rules (base ESLint, TypeScript, Prettier) and each package extends with specific customizations (core: unicorn/sonarjs/security, dashboard: Svelte/Storybook). Eliminates duplication while maintaining package independence.

## Scope

- **In Scope:**
    - Refactor root `eslint.config.mjs` to minimal shared rules
    - Update `packages/core/eslint.config.mjs` to extend root + add Node.js/MCP rules
    - Update `packages/dashboard/eslint.config.js` to extend root + add Svelte/UI rules
    - Validate inheritance works correctly
    - Ensure all lint scripts pass
    - Document config inheritance in inline comments
- **Out of Scope:**
    - TypeScript configuration changes (PR2)
    - Knip configuration changes (PR3)
    - Prettier configuration changes (PR3)
    - Documentation updates to ARCHITECTURE.md (PR3)
    - Package dependency updates
    - ESLint version upgrades

## Risks

- **Config inheritance breaks existing linting**: All packages already extend root config using spread operator - pattern is proven to work. Mitigation: Test each package independently after changes.
- **VSCode/Zed ESLint integration fails**: Modern IDEs support flat config extends. Mitigation: Test in both editors before committing.
- **False positives/negatives from rule reorganization**: Moving rules between configs might change behavior. Mitigation: Run lint before/after and compare output counts.
- **CI pipeline failures**: Config changes affect all workflows. Mitigation: Validate locally with `bun run ci` before pushing.

## Dependencies

- ✅ Bun workspaces already configured
- ✅ ESLint flat config format in use
- ✅ Both packages already use spread operator to extend root config
- None blocking - this is the first PR in the masterplan

## Priority

High - Blocks PR2 and PR3, foundational change for entire config standardization effort

## Logging / Observability

- **Success logs:**
    - `✓ Root config reduced to [N] shared rules`
    - `✓ Core package extends root with [N] additional rules`
    - `✓ Dashboard package extends root with [N] additional rules`
    - `✓ ESLint passed for all packages`
- **Error logs:**
    - `✖ ESLint failed for [package]: [error details]`
    - `✖ Config inheritance broken: [rule] not applied in [package]`
- **Metrics to track:**
    - ESLint error count before/after (expect same or lower)
    - ESLint warning count before/after (expect same or lower)
    - Total config lines before/after (expect reduction)
    - Rule count per config (root: ~20-30, core: +40-50, dashboard: +30-40)

## Implementation Plan (TODOs)

- [ ] **Step 1: Analyze current configuration and document baseline**
    - [ ] Run `bun run lint` and capture error/warning counts for baseline
    - [ ] Count total rules in root config (currently all plugins loaded)
    - [ ] Count total rules in core package config (currently minimal, just globals)
    - [ ] Count total rules in dashboard config (currently Svelte/Storybook specific)
    - [ ] Document which plugins are in root: eslint, typescript-eslint, sonarjs, security, import, unicorn, prettier
    - [ ] Document which plugins are in core: none (uses root)
    - [ ] Document which plugins are in dashboard: svelte, storybook (plus root)
    - [ ] Identify shared rules: base ESLint recommended, TypeScript recommended, prettier integration
    - [ ] Identify core-specific rules: unicorn (strict), sonarjs (code quality), security (Node.js), import (module resolution), index-exports-only (custom)
    - [ ] Identify dashboard-specific rules: svelte configs, storybook configs, browser globals

- [ ] **Step 2: Design new hierarchy architecture**
    - [ ] Define root config scope: ESLint recommended, TypeScript recommended, Prettier integration only
    - [ ] Define core config additions: unicorn, sonarjs, security, import plugins + custom index-exports plugin
    - [ ] Define dashboard config additions: svelte, storybook plugins + browser globals
    - [ ] Plan ignore patterns: root uses workspace-aware (`packages/**/dist`), packages use local (`dist/**`)
    - [ ] Document inheritance pattern in comments for each config file
    - [ ] Verify no rule conflicts between root and package configs

- [ ] **Step 3: Refactor root eslint.config.mjs to minimal shared base**
    - [ ] Create backup of current root config (for rollback)
    - [ ] Remove unicorn plugin import and config (move to core)
    - [ ] Remove sonarjs plugin import and config (move to core)
    - [ ] Remove security plugin import and config (move to core)
    - [ ] Remove import plugin configuration (move to core)
    - [ ] Remove index-exports-only custom plugin (move to core)
    - [ ] Remove file-specific rules for tests/storage/tools/setup (move to core)
    - [ ] Keep: `@eslint/js` recommended, `typescript-eslint` recommended, `eslint-plugin-prettier`
    - [ ] Update ignores to workspace-aware patterns: `packages/**/node_modules`, `packages/**/dist`, `packages/**/.svelte-kit`, `packages/**/build`, `packages/**/coverage`, `packages/**/*.d.ts.map`, `packages/**/eslint.config.*`
    - [ ] Add comment block at top explaining root config contains only universal shared rules
    - [ ] Add comment explaining package configs extend and customize
    - [ ] Export config array with only shared rules

- [ ] **Step 4: Update packages/core/eslint.config.mjs with core-specific rules**
    - [ ] Create backup of current core config (for rollback)
    - [ ] Add imports for plugins: sonarjs, security, importPlugin, unicorn
    - [ ] Add import for custom index-exports-only plugin (copy from old root config)
    - [ ] Keep existing root config spread: `...rootConfig`
    - [ ] Add sonarjs.configs.recommended after root spread
    - [ ] Add security.configs.recommended after sonarjs
    - [ ] Add importPlugin.flatConfigs.recommended and typescript after security
    - [ ] Add unicorn.configs.recommended after import
    - [ ] Add index-exports-only plugin configuration for index files
    - [ ] Add settings block for import resolver (typescript, node, core-modules: bun:test)
    - [ ] Add file-specific rules for tests/storage/tools/setup (security/detect-non-literal-fs-filename off)
    - [ ] Keep existing file-specific rules for src/server.ts (unicorn rules off)
    - [ ] Update ignores to local patterns: `dist/**`, `node_modules/**`, `coverage/**`, `**/*.d.ts.map`
    - [ ] Add comment block explaining core extends root with Node.js/MCP-specific rules
    - [ ] Verify languageOptions.globals.node is preserved

- [ ] **Step 5: Update packages/dashboard/eslint.config.js with dashboard-specific rules**
    - [ ] Create backup of current dashboard config (for rollback)
    - [ ] Verify root config import is present: `import rootConfig from '../../eslint.config.mjs'`
    - [ ] Verify root config spread is before svelte configs: `...rootConfig`
    - [ ] Keep svelte.configs.recommended and svelte.configs.prettier
    - [ ] Keep storybookConfigs['flat/recommended']
    - [ ] Keep languageOptions with browser + node globals
    - [ ] Keep Svelte-specific parser configuration block
    - [ ] Keep rule override: `'no-undef': 'off'` (required for Svelte)
    - [ ] Update ignores to local patterns: `dist/**`, `node_modules/**`, `coverage/**`, `**/*.d.ts.map`, `.svelte-kit/**`, `build/**`
    - [ ] Add comment block explaining dashboard extends root with Svelte/frontend-specific rules
    - [ ] Verify gitignore integration is preserved

- [ ] **Step 6: Test root-level linting**
    - [ ] Run `bun run lint` from workspace root
    - [ ] Verify both packages are analyzed (core + dashboard)
    - [ ] Compare error count to baseline (should be same or lower)
    - [ ] Compare warning count to baseline (should be same or lower)
    - [ ] Verify no new errors introduced by config refactor
    - [ ] Check that workspace-aware ignores work (packages/\*\*/dist ignored)

- [ ] **Step 7: Test core package linting independently**
    - [ ] Navigate to `packages/core` directory
    - [ ] Run `bun run lint` (uses package-local script)
    - [ ] Verify unicorn rules are active (check for unicorn-specific errors if any)
    - [ ] Verify sonarjs rules are active (check for cognitive complexity warnings if any)
    - [ ] Verify security rules are active (check for security warnings if any)
    - [ ] Verify import rules are active (check for import order if any)
    - [ ] Verify index-exports-only rule works on index.ts files
    - [ ] Verify server.ts specific rules work (unicorn rules disabled)
    - [ ] Verify test file specific rules work (security rules relaxed)

- [ ] **Step 8: Test dashboard package linting independently**
    - [ ] Navigate to `packages/dashboard` directory
    - [ ] Run `bun run lint` (uses package-local script)
    - [ ] Verify Svelte rules are active (check .svelte files)
    - [ ] Verify Storybook rules are active (check .stories files)
    - [ ] Verify browser globals are recognized
    - [ ] Verify no-undef override works (no false positives in Svelte files)
    - [ ] Verify parser configuration works for .svelte files
    - [ ] Verify gitignore integration works (build artifacts ignored)

- [ ] **Step 9: Validate IDE integration**
    - [ ] Open workspace in VSCode
    - [ ] Verify ESLint extension loads without errors
    - [ ] Open file in `packages/core` and verify linting works
    - [ ] Open file in `packages/dashboard` and verify linting works
    - [ ] Verify inline ESLint errors/warnings appear correctly
    - [ ] Test in Zed editor (if available)
    - [ ] Verify auto-fix works in both packages
    - [ ] Check that rule documentation shows correctly on hover

- [ ] **Step 10: Run full CI pipeline locally**
    - [ ] Run `bun run lint` - expect pass
    - [ ] Run `bun run test` - expect pass (no test changes but verify no breakage)
    - [ ] Run `bun run type-check` - expect pass (no TypeScript changes but verify)
    - [ ] Run `bun run format:check` - expect pass (no format changes)
    - [ ] Run `bun run build` - expect pass (no build changes but verify)
    - [ ] Run complete `bun run ci` - expect all green
    - [ ] Compare CI execution time to baseline (should be similar)

- [ ] **Step 11: Document configuration changes**
    - [ ] Add inline comments to root config explaining inheritance pattern
    - [ ] Add inline comments to core config explaining extensions
    - [ ] Add inline comments to dashboard config explaining extensions
    - [ ] Document which rules belong at root vs package level (in comments)
    - [ ] Add comment explaining when to add rules to root (universal) vs packages (specific)
    - [ ] Verify comments are clear and helpful for future maintainers

- [ ] **Step 12: Final validation and cleanup**
    - [ ] Remove backup files created during refactor
    - [ ] Run `bun run lint:clean` to clear ESLint caches
    - [ ] Run `bun run lint` fresh to verify cache rebuilds correctly
    - [ ] Verify no .eslintcache files committed to git
    - [ ] Review all changed files for consistency
    - [ ] Verify no accidental changes to unrelated files
    - [ ] Double-check all TODOs in this plan are complete

## Docs

- [ ] **Inline documentation in config files**: Add comments explaining inheritance pattern, which rules belong where, and when to use root vs package configs
- [ ] **No external documentation changes**: ARCHITECTURE.md and CONTRIBUTING.md updates deferred to PR3

## Testing

- [ ] **Manual testing:**
    - Run `bun run lint` at root - both packages analyzed
    - Run `bun run lint` in `packages/core` - core-specific rules active
    - Run `bun run lint` in `packages/dashboard` - dashboard-specific rules active
    - Test VSCode ESLint integration in both packages
    - Test auto-fix functionality in both packages
- [ ] **Automated testing:**
    - CI pipeline passes (includes lint step)
    - Pre-commit hooks pass (if configured)
    - All existing tests pass (no test changes but verify no breakage)
- [ ] **Regression testing:**
    - Compare error/warning counts before and after
    - Verify no new false positives introduced
    - Verify no rules silently disabled

## Acceptance

- [ ] Root `eslint.config.mjs` contains only ESLint recommended, TypeScript recommended, and Prettier
- [ ] Core `eslint.config.mjs` extends root and adds unicorn, sonarjs, security, import, index-exports-only
- [ ] Dashboard `eslint.config.js` extends root and adds Svelte, Storybook configurations
- [ ] No duplication of base rules (ESLint recommended, TypeScript recommended) between root and packages
- [ ] `bun run lint` from workspace root passes and analyzes both packages
- [ ] `bun run lint` from `packages/core` passes with core-specific rules
- [ ] `bun run lint` from `packages/dashboard` passes with dashboard-specific rules
- [ ] VSCode ESLint extension works in both package directories
- [ ] Zed ESLint integration works in both package directories (if tested)
- [ ] Error count same or lower than baseline (before refactor)
- [ ] Warning count same or lower than baseline (before refactor)
- [ ] Full CI pipeline passes (`bun run ci`)
- [ ] Config files have clear inline comments explaining inheritance
- [ ] No regression in existing functionality

## Fallback Plan

**Quick rollback (if issues found during development):**

1. Restore backup files created in Steps 3, 4, 5
2. Run `bun run lint:clean` to clear caches
3. Run `bun run lint` to verify restoration works
4. Investigate issue, fix, and retry

**Post-merge rollback (if issues found after PR merged):**

1. `git revert [commit-hash]` to revert config changes
2. Verify linting returns to previous state
3. Create new branch to fix identified issues
4. Re-apply changes with fixes in new PR

**Safe rollback conditions:**

- Linting fails for either package
- IDE integration breaks
- CI pipeline fails
- New false positives introduced
- Performance degradation (>20% slower linting)

**Artifacts to preserve during rollback:**

- Baseline metrics (error/warning counts)
- Test results showing what failed
- IDE error logs if integration broke

## References

- **Masterplan:** `docs/masterplans/workspace-config-standardization.md`
- **ESLint Flat Config:** https://eslint.org/docs/latest/use/configure/configuration-files
- **ESLint Config Composition:** https://eslint.org/docs/latest/use/configure/configuration-files#using-configuration-files
- **Project Rules:** `AGENTS.md` (no config edits unless requested, no bypassing hooks)
- **Current root config:** `eslint.config.mjs`
- **Current core config:** `packages/core/eslint.config.mjs`
- **Current dashboard config:** `packages/dashboard/eslint.config.js`

## Complexity Check

- **TODO Count:** 68 (across 12 steps)
- **Depth:** 2 (main steps → subtasks)
- **Cross-dependencies:** 2 (both packages must work, IDE integration must work)
- **High-Risk TODOs:** 5 (Steps 3, 4, 5 modify configs; Steps 6, 7 validate)
- **Estimated Time:** 4-6 hours development + 30 minutes review
- **Decision:** ✅ **Proceed** - Well within bounds for single PR. Clear scope, atomic changes, comprehensive testing.

---

## Implementation Notes

**Why this hierarchy works:**

- Root config contains only rules ALL packages need (ESLint/TypeScript/Prettier)
- Core package adds Node.js/server-specific tooling (unicorn strict mode, security, complexity analysis)
- Dashboard package adds UI/frontend-specific tooling (Svelte, Storybook, browser globals)
- No rule conflicts because concerns are orthogonal (backend vs frontend)

**Critical success factors:**

1. Test each package independently - they must work in isolation
2. Verify spread operator ordering - root must come before package-specific configs
3. Validate IDE integration - devs rely on inline linting
4. Compare before/after metrics - no regressions allowed

**Common pitfalls to avoid:**

- Don't remove rules that seem unused - they may catch edge cases
- Don't change rule severity while refactoring - keep behavior identical
- Don't skip IDE testing - broken dev experience blocks development
- Don't ignore warning count increases - investigate all changes

**Package independence principle:**

- Each package config must be complete and self-contained
- Root config provides baseline, packages add specifics
- Either package should build/lint independently
- No hidden dependencies between package configs
