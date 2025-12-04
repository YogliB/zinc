# Workspace Configuration Standardization Masterplan

**Overview:** Establish hierarchical configuration architecture where root defines minimal universal rules for all workspace packages (MCP server + dashboard), and each package extends with specific customizations. Eliminates config duplication while maintaining package independence.

**Approach:** Phased rollout across 3 PRs - ESLint hierarchy, TypeScript hierarchy, then Knip/Prettier/cleanup.

**Est. Time:** 12-16h incl. review (4-6h per phase)

**PRs:** 3 across 1 repo (devflow)

**Risk:** Medium - Touches all config infrastructure, affects both packages, requires careful testing of inheritance patterns

**Repos:** devflow

## Implementation Status

| PR  | Repo    | Status | Link | Notes                             |
| --- | ------- | ------ | ---- | --------------------------------- |
| 1   | devflow | ⏸️     | -    | ESLint hierarchy foundation       |
| 2   | devflow | ⏸️     | -    | TypeScript config standardization |
| 3   | devflow | ⏸️     | -    | Knip workspaces + final cleanup   |

Status: 🟢 done · 🟡 in‑progress · 🟠 review · ⏸️ not‑started · 🔴 blocked · ⚫ canceled

---

## PR1: ESLint Configuration Hierarchy — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 4-6h dev + 30m review

**Files:** `eslint.config.mjs`, `packages/core/eslint.config.mjs`, `packages/dashboard/eslint.config.js`

**Changes:**

1. **Analyze current state and design hierarchy** — Files: all config files
    - Document current root ESLint config with all rules (unicorn, sonarjs, security, import)
    - Document package configs (core has own, dashboard has Svelte-specific)
    - Identify shared rules: base ESLint, TypeScript recommended, prettier integration
    - Identify package-specific: core (unicorn strict, sonarjs, security, import), dashboard (Svelte, Storybook)

2. **Refactor root ESLint to minimal shared config** — File: `eslint.config.mjs`
    - Extract only language-agnostic and basic TypeScript rules
    - Remove: unicorn (too strict for UI), sonarjs (backend-focused), security (Node.js specific)
    - Keep: base ESLint recommended, TypeScript recommended, prettier integration
    - Add comments documenting what belongs at root vs package level
    - Update ignores to use workspace-aware patterns (`**/dist`, `**/node_modules`, `**/coverage`)

3. **Update core package ESLint config** — File: `packages/core/eslint.config.mjs`
    - Import root config using flat config spread: `import rootConfig from '../../eslint.config.mjs'`
    - Compose with package-specific rules: `export default [...rootConfig, coreSpecificConfig]`
    - Add unicorn, sonarjs, security, import plugins with Node.js/MCP-specific rules
    - Add core-specific ignores (dist, .test-\*, .bun-test)
    - Add custom rules (index-exports-only for index files)

4. **Update dashboard package ESLint config** — File: `packages/dashboard/eslint.config.js`
    - Import root config: `import rootConfig from '../../eslint.config.mjs'`
    - Compose with Svelte/Storybook configs
    - Keep frontend-specific rules and overrides
    - Maintain .gitignore integration for build artifacts

5. **Test and validate** — All packages
    - Run `bun run lint` from root - should analyze both packages
    - Run `bun run --filter devflow-mcp lint` - core package passes
    - Run `bun run --filter dashboard lint` - dashboard package passes
    - Verify error/warning counts are same or improved
    - Test in VSCode/Zed - ESLint integration works in both packages

**Acceptance:**

- [ ] Root ESLint config contains only shared, universal rules
- [ ] Core package extends root with Node.js/MCP-specific rules
- [ ] Dashboard package extends root with Svelte/frontend rules
- [ ] No duplication of base rules between root and packages
- [ ] `bun run lint` passes for all packages
- [ ] Package-scoped lint scripts work (`--filter devflow-mcp`, `--filter dashboard`)
- [ ] VSCode/Zed ESLint plugin works in both package directories
- [ ] CI passes with new config
- [ ] Documentation added to config files explaining inheritance

**Dependencies:** None · Blocks PR2, PR3

---

## PR2: TypeScript Configuration Hierarchy — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 3-4h dev + 30m review

**Files:** `tsconfig.json`, `packages/core/tsconfig.json`, `packages/dashboard/tsconfig.json`

**Changes:**

1. **Refactor root TypeScript config to shared base** — File: `tsconfig.json`
    - Extract shared compiler options: target, module, strict flags, lib
    - Set `composite: true` for project references support
    - Define shared `exclude`: `["**/node_modules", "**/dist", "**/coverage", "**/.svelte-kit"]`
    - Remove package-specific paths, includes, references
    - Add comments documenting inheritance pattern

2. **Update core package TypeScript config** — File: `packages/core/tsconfig.json`
    - Add `extends: "../../tsconfig.json"` at top
    - Override/add core-specific options: `include`, `exclude`, `paths`
    - Configure for Node.js/Bun runtime (lib: ES2022, target: ES2022)
    - Set `outDir`, `rootDir` for core package structure
    - Keep Vitest types integration

3. **Update dashboard package TypeScript config** — File: `packages/dashboard/tsconfig.json`
    - Add `extends: "../../tsconfig.json"` at top
    - Override for SvelteKit: add `.svelte` file support
    - Configure for browser + node: lib DOM, DOM.Iterable
    - Integrate SvelteKit type generation
    - Keep Vite client types

4. **Test TypeScript configuration** — All packages
    - Run `bun run type-check` from root (should check all packages)
    - Run `bun run --filter devflow-mcp type-check` - core passes
    - Run `bun run --filter dashboard check` - dashboard svelte-check passes
    - Verify IDE type hints work in both packages
    - Check project references resolve correctly

**Acceptance:**

- [ ] Root tsconfig.json contains only shared compiler options
- [ ] Core package extends root with Node.js/Bun-specific config
- [ ] Dashboard package extends root with SvelteKit-specific config
- [ ] No duplication of base compiler options
- [ ] `bun run type-check` passes for all packages
- [ ] Package-scoped type-check scripts work
- [ ] IDE (VSCode/Zed) type checking works in both packages
- [ ] CI passes with new config
- [ ] Config inheritance documented in comments

**Dependencies:** Blocked by PR1 (want configs aligned) · Blocks PR3

---

## PR3: Knip Workspaces + Final Cleanup — ⏸️

**Repo:** devflow · **Link:** - · **ETA:** 4-6h dev + 30m review

**Files:** `knip.json`, `packages/core/knip.json`, `packages/dashboard/knip.json`, `.prettierrc`, `.prettierignore`, `package.json`, `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`

**Changes:**

1. **Configure Knip for workspaces** — Files: `knip.json`, `packages/*/knip.json`
    - Update root `knip.json` with workspaces configuration
    - Remove `"dashboard/**"` from root ignore list
    - Define workspace entry points in root or delegate to package configs
    - Create/update `packages/core/knip.json` with core entry points (server.ts, index.ts)
    - Create/update `packages/dashboard/knip.json` with SvelteKit/Storybook entry points
    - Test: `bun run knip` analyzes both packages without false positives

2. **Verify Prettier consistency** — Files: `.prettierrc`, `.prettierignore`
    - Confirm root `.prettierrc` applies to all workspace packages
    - Remove any duplicate prettier configs in packages (if exist)
    - Update `.prettierignore` with workspace-aware patterns
    - Test: `bun run format` and `bun run format:check` work on all packages

3. **Update root package.json scripts** — File: `package.json`
    - Ensure `lint` runs on all workspaces (already uses `--filter`)
    - Ensure `format:check` validates all workspaces
    - Verify `type-check` covers all packages
    - Document workspace script patterns in comments

4. **Clean up redundant configurations** — Files: all config files
    - Remove duplicated rules from package configs (based on what's now in root)
    - Remove any unused config files
    - Verify no orphaned configuration remains
    - Document removed files in PR description

5. **Integration testing** — All packages
    - Run full CI pipeline locally: `bun run ci`
    - Run `bun run lint` - both packages pass
    - Run `bun run type-check` - both packages pass
    - Run `bun run format:check` - both packages pass
    - Run `bun run knip` - analyzes both packages correctly
    - Run `bun test` - all tests pass
    - Verify VSCode/Zed integration for ESLint, TypeScript, Prettier

6. **Update documentation** — Files: `docs/ARCHITECTURE.md`, `docs/CONTRIBUTING.md`
    - Add "Configuration Architecture" section to ARCHITECTURE.md
    - Document hierarchical config pattern (root shared, packages extend)
    - Update CONTRIBUTING.md with config inheritance guidelines
    - Add inline comments to config files explaining inheritance
    - Document which rules belong at root vs package level

**Acceptance:**

- [ ] Knip analyzes all workspace packages without ignoring any
- [ ] Root Prettier config applies to all packages
- [ ] All root scripts (lint, type-check, format) work on all packages
- [ ] No config duplication between root and packages
- [ ] Orphaned configs removed and documented
- [ ] Full CI pipeline passes locally
- [ ] VSCode/Zed integration verified for all tools
- [ ] Documentation complete in ARCHITECTURE.md and CONTRIBUTING.md
- [ ] Config files have explanatory comments
- [ ] CI passes with all changes

**Dependencies:** Blocked by PR1, PR2 · Blocks None

---

## Risk Mitigation

**Config Inheritance Breaking Existing Setup:**

- **Concern:** ESLint/TypeScript extends might not work as expected
- **Analysis:** Flat config (ESLint) and extends (TypeScript) are well-established patterns
- **Mitigation:** Test each package individually before committing, validate in CI
- **Recovery:** Revert to isolated configs per package if inheritance fails

**Knip Workspace Detection Issues:**

- **Concern:** Knip may not properly detect workspace entry points
- **Analysis:** Knip 5.71+ has workspace support, but config may need tuning
- **Mitigation:** Test with explicit entry point definitions per package
- **Recovery:** Keep packages in ignore list, run Knip separately per package in CI

**IDE Integration Confusion:**

- **Concern:** VSCode/Zed may not follow config extends correctly
- **Analysis:** Modern IDEs support extends, but workspace setup matters
- **Mitigation:** Test in both VSCode and Zed with workspace opened at root
- **Recovery:** Document IDE-specific setup if needed, consider .vscode/settings.json

**CI Pipeline Changes:**

- **Concern:** Workspace-aware scripts might affect CI performance
- **Analysis:** Scripts already use `--filter`, just more explicit now
- **Mitigation:** Monitor CI duration before/after, optimize if needed
- **Recovery:** Adjust caching strategy or parallelize package checks

---

## Deployment Strategy

**CRITICAL:** All PRs deploy to same repo, sequential merge order matters for config consistency.

**Stage 1:** Repo [devflow] · PRs: [1]

1. Merge PR1 (ESLint hierarchy)
2. Verify linting works for both packages
3. Monitor for any ESLint errors in subsequent development
4. Rollback: `git revert` if linting breaks, restore old configs

**Stage 2:** Repo [devflow] · PRs: [2]

1. Merge PR2 (TypeScript hierarchy)
2. Verify type-checking works for both packages
3. Monitor for any TypeScript errors in subsequent development
4. Rollback: `git revert` if type-checking breaks, restore old tsconfig

**Stage 3:** Repo [devflow] · PRs: [3]

1. Merge PR3 (Knip + cleanup + docs)
2. Verify Knip detects dead code correctly
3. Verify all documentation is accurate
4. Rollback: `git revert` if Knip fails, restore old config

**Cross-Repo Version Map**
| Stage | PR | devflow | Notes |
| ----: | -- | ---------- | ----------------------------------- |
| 1 | 1 | v0.0.2 | ESLint hierarchy established |
| 2 | 2 | v0.0.3 | TypeScript hierarchy complete |
| 3 | 3 | v0.0.4 | Full config standardization done |

---

## Monitoring & Observability

**Metrics:**

- ESLint error count: expect same or lower per package
- ESLint warning count: expect same or lower per package
- TypeScript error count: expect 0 (must stay 0)
- Knip unused exports: track count per package
- Config file line count: expect reduction of 30-50% total

**Logs:**

- Success: `✓ All packages passed linting/type-check`
- Errors: `✖ [package] failed [tool]: [error message]`
- Warning: `⚠ Config inheritance may not be working: [details]`

**Alarms:**

- CI failure after config changes → immediate investigation
- ESLint/TypeScript errors increase → review config inheritance
- Developer reports IDE issues → validate workspace setup

---

## Rollback

**Quick (per PR):**

1. `git revert [PR commit]` - reverts config changes
2. Verify linting/type-checking returns to previous state
3. Fix issues identified during rollback
4. Re-apply changes with fixes

**Full (if multiple PRs deployed):**

- If PR3 fails: Revert PR3 only (Knip/cleanup isolated)
- If PR2 fails: Revert PR2, keep PR1 (ESLint independent)
- If PR1 fails: Revert PR1, full reset to isolated configs

**Order:** Rollback in reverse merge order (PR3 → PR2 → PR1)

**Artifacts safe to keep:**

- Test results from validation
- CI logs showing config behavior
- Documentation improvements (if accurate)

---

## Success Criteria

- [ ] All 3 PRs merged to main
- [ ] Root configs contain only universal, shared rules
- [ ] Package configs extend root with package-specific customizations
- [ ] No config duplication between root and packages
- [ ] `bun run lint` passes for all packages
- [ ] `bun run type-check` passes for all packages
- [ ] `bun run format:check` passes for all packages
- [ ] `bun run knip` analyzes all packages correctly
- [ ] CI pipeline passes with new configuration
- [ ] VSCode/Zed integration works in both packages
- [ ] Documentation complete (ARCHITECTURE.md, CONTRIBUTING.md, inline comments)
- [ ] Config file line count reduced by 30-50%
- [ ] 0 production incidents from config changes
- [ ] Developer experience improved or unchanged

---

## References

- ESLint Flat Config: https://eslint.org/docs/latest/use/configure/configuration-files
- TypeScript Project References: https://www.typescriptlang.org/docs/handbook/project-references.html
- Knip Workspaces: https://knip.dev/guides/workspaces
- Bun Workspaces: https://bun.sh/docs/install/workspaces
- Existing Migration: `docs/plans/bun-workspaces-migration.md`
- Project Rules: `AGENTS.md`

---

## Notes & Assumptions

**Implementation decisions:**

- Use flat config spread for ESLint composition (modern, flexible)
- Use TypeScript extends for inheritance (standard, well-supported)
- Keep Prettier at root only (no package overrides needed)
- Knip workspace configuration at root, entry points per package

**Cross-package coordination:**

- Both packages must use compatible ESLint/TypeScript versions
- Root config must not break either package type
- Testing strategy: validate each package independently first

**Data model:**

- Config hierarchy: root (shared) → package (specific extensions)
- No circular dependencies between configs
- Each package remains independently buildable

**Risks:**

- Medium: Config changes affect all development workflows
- Low: Well-established patterns (extends, flat config)
- Mitigation: Thorough testing per PR, isolated changes

**Testing:**

- Integrated with each PR (linting, type-checking, formatting)
- No standalone test PRs - tests embedded in config changes
- CI validates all packages after each merge

**Assumptions:**

- ✅ Bun workspaces already configured and working
- ✅ ESLint flat config format supported by all plugins
- ✅ TypeScript 5.9+ supports extends pattern
- ✅ Knip 5.71+ supports workspace detection
- ✅ VSCode/Zed support config extends properly
- ❓ Package-specific rules won't conflict with root rules (needs validation in PR1)
