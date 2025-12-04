# PR3: Knip Workspaces + Final Cleanup

## Goal

Configure Knip for workspace-aware analysis and finalize configuration standardization by removing duplication, validating all tooling integrations, and documenting the hierarchical configuration architecture established in PR1 and PR2.

## Scope

- **In Scope:**
    - Knip workspace configuration (root + package configs)
    - Prettier consistency verification across workspace
    - Root package.json script validation for all packages
    - Removal of redundant/duplicated configuration
    - Full integration testing (lint, type-check, format, knip, test)
    - Documentation updates (ARCHITECTURE.md, CONTRIBUTING.md, inline comments)
    - VSCode/Zed integration validation
- **Out of Scope:**
    - New linting rules or TypeScript compiler options
    - Changes to build scripts or bundler configurations
    - Performance optimization beyond config cleanup
    - New developer tooling additions
    - Package dependency updates

## Risks

- **Knip workspace detection fails**: Entry points not properly configured
    - _Mitigation_: Test with explicit entry point definitions per package, validate against known exports
    - _Recovery_: Keep dashboard in ignore list temporarily, iterate on config
- **Prettier config inheritance breaks**: Package-specific formatting needs emerge
    - _Mitigation_: Verify .prettierrc applies correctly to .svelte, .ts, .js files in both packages
    - _Recovery_: Add package-specific .prettierrc if needed (minimal extension pattern)
- **Config cleanup removes needed rules**: Over-aggressive deduplication
    - _Mitigation_: Cross-reference with PR1/PR2 changes, test after each removal
    - _Recovery_: git revert specific cleanup commits, restore needed config
- **IDE integration regresses**: Tooling stops working in VSCode/Zed
    - _Mitigation_: Test in both IDEs after each major change
    - _Recovery_: Add .vscode/settings.json or document IDE-specific setup

## Dependencies

- **Blocked by:** PR1 (ESLint hierarchy), PR2 (TypeScript hierarchy)
- **Blocks:** None
- **External:** Knip 5.71+, Prettier 3.x, Bun workspaces

## Priority

High (completes configuration standardization initiative)

## Logging / Observability

- **Success logs:**
    - `✓ Knip analyzed [N] workspaces, found [N] unused exports`
    - `✓ All packages passed formatting check`
    - `✓ Configuration cleanup removed [N] lines of duplicated config`
- **Error logs:**
    - `✖ Knip failed to detect workspace: [package-name]`
    - `✖ Format check failed in [package]: [file]`
    - `✖ [tool] configuration inheritance broken: [details]`
- **Metrics to track:**
    - Knip unused exports count per package (baseline vs after)
    - Total config file line count (expect 30-50% reduction)
    - CI pipeline duration (should not increase)
    - Tool execution time (lint, type-check, format, knip)

## Implementation Plan (TODOs)

- [ ] **Step 1: Configure Knip for Workspaces**
    - [ ] Read current `knip.json` to understand existing configuration
    - [ ] Read `packages/core/package.json` to identify core entry points (server.ts, index.ts, tools)
    - [ ] Read `packages/dashboard/package.json` to identify dashboard entry points (SvelteKit, Storybook)
    - [ ] Update root `knip.json` with workspace configuration array
    - [ ] Remove `"dashboard/**"` from root ignore patterns
    - [ ] Create `packages/core/knip.json` with core-specific entry points and ignore patterns
    - [ ] Create `packages/dashboard/knip.json` with SvelteKit/Storybook entry points
    - [ ] Run `bun run knip` and verify both packages analyzed without false positives
    - [ ] Document knip configuration pattern in inline comments

- [ ] **Step 2: Verify Prettier Consistency**
    - [ ] Read `.prettierrc` to confirm configuration
    - [ ] Check for any package-level `.prettierrc` files (should not exist)
    - [ ] Read `.prettierignore` and update with workspace-aware patterns (`**/dist`, `**/coverage`, `**/.svelte-kit`)
    - [ ] Run `bun run format:check` from root and verify both packages checked
    - [ ] Run `bun run format:check --filter devflow-mcp` to test package-scoped formatting
    - [ ] Run `bun run format:check --filter dashboard` to test dashboard formatting
    - [ ] Test formatting on sample files: `.ts` in core, `.svelte` in dashboard
    - [ ] Document Prettier workspace behavior in inline comments

- [ ] **Step 3: Update Root package.json Scripts**
    - [ ] Read root `package.json` scripts section
    - [ ] Verify `lint` script runs on all workspaces (check for `--filter` usage)
    - [ ] Verify `type-check` script covers all packages or delegates correctly
    - [ ] Verify `format` and `format:check` validate all workspaces
    - [ ] Add workspace script documentation in package.json comments (if supported) or adjacent README
    - [ ] Test each script individually: `lint`, `type-check`, `format:check`, `knip`, `test`
    - [ ] Verify scripts work with `--filter` for individual packages

- [ ] **Step 4: Clean Up Redundant Configurations**
    - [ ] List all config files in root and packages (eslint, tsconfig, knip, prettier, bunfig)
    - [ ] Cross-reference package ESLint configs with root (from PR1) - remove duplicates
    - [ ] Cross-reference package TypeScript configs with root (from PR2) - remove duplicates
    - [ ] Identify any orphaned config files (old formats, unused tools)
    - [ ] Remove duplicated rules from `packages/core/eslint.config.mjs` if any
    - [ ] Remove duplicated rules from `packages/dashboard/eslint.config.js` if any
    - [ ] Remove duplicated options from `packages/core/tsconfig.json` if any
    - [ ] Remove duplicated options from `packages/dashboard/tsconfig.json` if any
    - [ ] Delete any orphaned config files
    - [ ] Document removed configurations and line count reduction

- [ ] **Step 5: Integration Testing**
    - [ ] Run `bun run lint` from root - verify both packages analyzed, no new errors
    - [ ] Run `bun run --filter devflow-mcp lint` - verify core package passes
    - [ ] Run `bun run --filter dashboard lint` - verify dashboard package passes
    - [ ] Run `bun run type-check` from root - verify both packages checked
    - [ ] Run `bun run --filter devflow-mcp type-check` - verify core passes
    - [ ] Run `bun run --filter dashboard check` - verify dashboard svelte-check passes
    - [ ] Run `bun run format:check` from root - verify all files checked
    - [ ] Run `bun run knip` from root - verify both packages analyzed
    - [ ] Run `bun test` from root - verify all tests pass
    - [ ] Test VSCode ESLint integration in both packages (open files, check inline diagnostics)
    - [ ] Test VSCode TypeScript integration in both packages (check type hints)
    - [ ] Test VSCode Prettier integration in both packages (format on save)
    - [ ] Test Zed integration for all tools (if available)
    - [ ] Run full CI pipeline locally if possible: `bun run ci` or equivalent

- [ ] **Step 6: Update Documentation**
    - [ ] Read `docs/ARCHITECTURE.md` to understand current structure
    - [ ] Add "Configuration Architecture" section to ARCHITECTURE.md
    - [ ] Document hierarchical config pattern (root shared, packages extend)
    - [ ] Document which rules belong at root vs package level
    - [ ] Document Knip workspace detection strategy
    - [ ] Read `docs/CONTRIBUTING.md` to understand current guidelines
    - [ ] Add config inheritance guidelines to CONTRIBUTING.md
    - [ ] Document how to add new linting rules (root vs package decision tree)
    - [ ] Document how to troubleshoot config inheritance issues
    - [ ] Add inline comments to `knip.json` explaining workspace pattern
    - [ ] Add inline comments to `.prettierignore` explaining workspace patterns
    - [ ] Verify all config files have explanatory comments from PR1/PR2

## Docs

- [ ] **ARCHITECTURE.md**: Add "Configuration Architecture" section documenting hierarchy
- [ ] **CONTRIBUTING.md**: Add config inheritance guidelines for contributors
- [ ] **knip.json**: Inline comments explaining workspace configuration
- [ ] **.prettierignore**: Comments explaining workspace-aware ignore patterns
- [ ] **package.json**: Document workspace script patterns (in comments or README)
- [ ] **PR Description**: Document removed files and line count reduction

## Testing

- [ ] **Manual Testing:**
    - [ ] Lint all packages individually and together
    - [ ] Type-check all packages individually and together
    - [ ] Format-check all packages individually and together
    - [ ] Run Knip on workspace and verify both packages analyzed
    - [ ] Run full test suite
- [ ] **Integration Testing:**
    - [ ] VSCode ESLint extension works in both packages
    - [ ] VSCode TypeScript language server works in both packages
    - [ ] VSCode Prettier extension works in both packages
    - [ ] Zed integration validated (if applicable)
- [ ] **Regression Testing:**
    - [ ] Error/warning counts match or improve vs pre-PR baseline
    - [ ] No new TypeScript errors introduced
    - [ ] No files excluded from tooling that were previously included
- [ ] **CI Validation:**
    - [ ] All CI checks pass with new configuration
    - [ ] CI duration does not significantly increase

## Acceptance

- [ ] Knip analyzes all workspace packages without ignoring dashboard
- [ ] Root Prettier config applies correctly to all packages and file types
- [ ] All root scripts (lint, type-check, format, knip, test) work on all packages
- [ ] Package-scoped scripts work with `--filter` flag
- [ ] No configuration duplication between root and packages
- [ ] Orphaned config files removed and documented in PR
- [ ] Full CI pipeline passes locally
- [ ] VSCode/Zed integration verified for ESLint, TypeScript, Prettier
- [ ] Documentation complete in ARCHITECTURE.md with "Configuration Architecture" section
- [ ] Documentation complete in CONTRIBUTING.md with config inheritance guidelines
- [ ] All config files have explanatory inline comments
- [ ] Total config file line count reduced by 30-50%
- [ ] CI passes on PR branch
- [ ] No production incidents after merge
- [ ] Developer experience improved or unchanged (validated via testing)

## Fallback Plan

**If Knip workspace detection fails:**

1. Keep `"dashboard/**"` in root knip.json ignore list
2. Run Knip separately per package in CI: `cd packages/core && bun run knip`
3. Document limitation and create follow-up issue for Knip configuration improvement

**If config cleanup breaks tooling:**

1. `git revert` specific cleanup commits
2. Restore minimal necessary config to broken package
3. Re-test integration
4. Document which configs cannot be deduplicated and why

**If IDE integration regresses:**

1. Add `.vscode/settings.json` with explicit config paths if needed
2. Document IDE-specific setup in CONTRIBUTING.md
3. Consider workspace-level IDE config files

**Full rollback:**

1. `git revert [PR3 commit hash]`
2. Verify linting, type-checking, formatting return to PR2 state
3. Investigate root cause
4. Re-apply changes incrementally with fixes

## References

- **Knip Workspaces Guide:** https://knip.dev/guides/workspaces
- **Prettier Configuration:** https://prettier.io/docs/en/configuration.html
- **Bun Workspaces:** https://bun.sh/docs/install/workspaces
- **ESLint Flat Config (PR1):** https://eslint.org/docs/latest/use/configure/configuration-files
- **TypeScript extends (PR2):** https://www.typescriptlang.org/docs/handbook/project-references.html
- **Related Plans:**
    - `docs/plans/workspace-config-pr1-eslint.md`
    - `docs/plans/workspace-config-pr2-typescript.md`
    - `docs/masterplans/workspace-config-standardization.md`
- **Project Rules:** `AGENTS.md`

## Complexity Check

- **TODO Count:** 42
- **Depth:** 2 (Steps → Tasks)
- **Cross-deps:** 2 (blocks: PR1, PR2)
- **High-risk TODOs:** 3 (Knip workspace config, config cleanup, integration testing)
- **Decision:** ⚠️ **BORDERLINE** - High TODO count (42) but appropriate for final integration PR. TODOs are granular and testable. Not complex enough for masterplan as changes are isolated to configuration files with clear validation steps.

## Notes

**Implementation order matters:**

1. Configure Knip first (new functionality, isolated)
2. Verify Prettier (low risk, quick validation)
3. Update scripts (documentation, no breaking changes)
4. Clean up configs (requires PR1/PR2 knowledge, test after each removal)
5. Integration testing (validates all previous steps)
6. Documentation (final step, reflects actual state)

**Testing strategy:**

- Test each package individually before testing workspace-level
- Validate IDE integration after each major change
- Keep baseline metrics (error counts, line counts) for comparison

**Key success indicators:**

- Knip detects both packages ✓
- No config duplication ✓
- All tools work in both packages ✓
- Documentation complete ✓
- 30-50% config reduction ✓
