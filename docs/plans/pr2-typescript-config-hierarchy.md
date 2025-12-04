# pr2-typescript-config-hierarchy

## Goal

Establish TypeScript configuration hierarchy where root defines shared compiler options and each package (core, dashboard) extends with runtime-specific customizations. Eliminates duplication while preserving package independence and SvelteKit integration.

## Scope

- **In Scope:**
    - Refactor root `tsconfig.json` to shared base configuration
    - Update `packages/core/tsconfig.json` to extend root with Node.js/Bun specifics
    - Update `packages/dashboard/tsconfig.json` to extend root while maintaining SvelteKit integration
    - Validate type-checking across all packages
    - Add inline documentation explaining inheritance pattern
    - Test IDE integration (VSCode/Zed)
- **Out of Scope:**
    - Changing TypeScript version or compiler behavior
    - Modifying package.json scripts (already workspace-aware)
    - Project references (not needed for this workspace structure)
    - tsconfig.build.json or multi-config setups
    - Changes to source code or type definitions

## Risks

- **SvelteKit tsconfig.json override conflict**: Dashboard extends `.svelte-kit/tsconfig.json` which may conflict with root inheritance
    - **Mitigation**: Carefully merge SvelteKit-generated config with root config, test svelte-check compatibility
    - **Recovery**: Keep dashboard independent if SvelteKit extends pattern breaks
- **Compiler option conflicts**: Core (Node.js) and Dashboard (browser) need different `lib` and `target` settings
    - **Mitigation**: Root contains only universally applicable options, packages override runtime-specific settings
    - **Recovery**: Document which options must be overridden per package
- **IDE type-checking confusion**: VSCode/Zed may not follow extends chain correctly
    - **Mitigation**: Test with workspace opened at root, verify tsserver picks up configs
    - **Recovery**: Add .vscode/settings.json if needed to guide IDE
- **Existing path aliases break**: Core uses `@/*` paths that must remain functional
    - **Mitigation**: Keep `baseUrl` and `paths` at package level
    - **Recovery**: Document that path aliases are package-specific

## Dependencies

- **Blocks**: PR3 (Knip + final cleanup)
- **Blocked By**: PR1 (ESLint hierarchy - want configs aligned for consistency)
- **External**: None (TypeScript 5.9.3 already installed, extends pattern supported)

## Priority

**Medium** - Part of 3-phase config standardization. Can proceed after PR1 for logical consistency, but technically independent.

## Logging / Observability

**Success Logs:**

- `✓ Root TypeScript config validated`
- `✓ Core package type-check passed`
- `✓ Dashboard package svelte-check passed`
- `✓ IDE integration verified`

**Error Logs:**

- `✖ Type-check failed in [package]: [error count] errors`
- `✖ SvelteKit config conflict: [details]`
- `✖ IDE not picking up types in [package]`

**Metrics to Track:**

- TypeScript error count before: [baseline from current main]
- TypeScript error count after: 0 (must maintain)
- Config duplication: expect 40-50% reduction in total compiler option lines
- Type-check execution time: should remain unchanged (±10%)

## Implementation Plan (TODOs)

- [x] **Step 1: Analyze current configurations and design hierarchy**
    - [x] Document all compiler options in root `tsconfig.json`
    - [x] Document all compiler options in `packages/core/tsconfig.json`
    - [x] Document all compiler options in `packages/dashboard/tsconfig.json`
    - [x] Identify shared options: strict flags, module system, base settings
    - [x] Identify core-specific options: Bun types, Node.js lib, paths
    - [x] Identify dashboard-specific options: DOM lib, SvelteKit integration
    - [x] Note SvelteKit extends pattern: `.svelte-kit/tsconfig.json` generates config
    - [x] Create option classification spreadsheet: [shared/core/dashboard]

- [x] **Step 2: Backup current configurations**
    - [x] Copy `tsconfig.json` to `tsconfig.json.backup`
    - [x] Copy `packages/core/tsconfig.json` to `packages/core/tsconfig.json.backup`
    - [x] Copy `packages/dashboard/tsconfig.json` to `packages/dashboard/tsconfig.json.backup`

- [x] **Step 3: Refactor root tsconfig.json to minimal shared base**
    - [x] Extract only runtime-agnostic compiler options
    - [x] Keep shared strict flags: `strict`, `skipLibCheck`, `forceConsistentCasingInFileNames`
    - [x] Keep shared module options: `esModuleInterop`, `resolveJsonModule`, `moduleDetection: "force"`
    - [x] Keep shared safety flags: `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`, `noImplicitOverride`
    - [x] Remove runtime-specific: `lib`, `target`, `types`, `jsx` (packages will define)
    - [x] Remove package-specific: `baseUrl`, `paths`, `include`, `exclude`
    - [x] Add `composite: true` for potential project references later
    - [x] Add workspace-aware `exclude`: `["**/node_modules", "**/dist", "**/coverage", "**/.svelte-kit", "**/.bun-test"]`
    - [x] Add explanatory comments documenting inheritance pattern
    - [x] Add comment header: "Shared TypeScript config for all workspace packages"

- [x] **Step 4: Update packages/core/tsconfig.json with inheritance**
    - [x] Ensure `extends: "../../tsconfig.json"` is at top
    - [x] Add core-specific `compilerOptions` section
    - [x] Set Node.js/Bun runtime: `"lib": ["ESNext"]`, `"target": "ESNext"`
    - [x] Set module system: `"module": "Preserve"` (matches root intent)
    - [x] Keep existing `baseUrl: "."` and `paths: { "@/*": ["src/*"] }`
    - [x] Add `"types": ["bun"]` for Bun runtime types
    - [x] Keep `include: ["src"]` for core source files
    - [x] Keep `exclude: ["node_modules", "dist"]` (package-specific artifacts)
    - [x] Remove options now inherited from root (strict, skipLibCheck, etc.)
    - [x] Add comment: "Extends root with Node.js/Bun-specific options"
    - [x] Verify no duplication with root config

- [x] **Step 5: Update packages/dashboard/tsconfig.json with inheritance**
    - [x] Research SvelteKit extends pattern: can we extend both root AND .svelte-kit?
    - [x] Test approach: extend root first, then let SvelteKit override as needed
    - [x] Update to `extends: ["../../tsconfig.json", "./.svelte-kit/tsconfig.json"]` (array extends)
    - [x] Add dashboard-specific `compilerOptions` section
    - [x] Set browser runtime: inherited from `.svelte-kit/tsconfig.json`
    - [x] Keep SvelteKit-required options: `rewriteRelativeImportExtensions`, `checkJs`, `sourceMap`
    - [x] Remove options now inherited from root (strict, esModuleInterop, etc.)
    - [x] Verify SvelteKit path alias handling (handled by svelte.config.js)
    - [x] Add comment: "Extends both root config and SvelteKit-generated config"
    - [x] Add comment about SvelteKit integration: "Path aliases via svelte.config.js"
    - [x] Verify no duplication with root config

- [x] **Step 6: Test TypeScript compilation and type-checking**
    - [x] Run `bun run type-check` from workspace root
    - [x] Verify core package: `cd packages/core && bun tsc --noEmit`
    - [x] Verify dashboard package: `cd packages/dashboard && bun run check`
    - [x] Check for new TypeScript errors (should be 0)
    - [x] Compare error count with baseline (must be ≤ baseline)
    - [x] Fix any type errors introduced by config changes
    - [x] Verify type-check execution time is comparable

- [x] **Step 7: Test IDE integration**
    - [x] Open workspace root in VSCode
    - [x] Verify tsserver picks up root config
    - [x] Open file in `packages/core/src/`, check type hints work
    - [x] Open file in `packages/dashboard/src/`, check type hints work
    - [x] Verify `@/*` path alias resolves in core package
    - [x] Verify `$lib` and other SvelteKit aliases work in dashboard
    - [x] Test in Zed editor if available
    - [x] Check for TypeScript errors in IDE Problems panel
    - [x] Verify Go to Definition works across packages

- [x] **Step 8: Test SvelteKit integration specifically**
    - [x] Run `bun run --filter dashboard check` (svelte-check)
    - [x] Verify `.svelte` files type-check correctly
    - [x] Verify `$app/*`, `$env/*` SvelteKit imports resolve
    - [x] Check that SvelteKit-generated types are discovered
    - [x] Test component props type-checking
    - [x] Verify no conflicts between root config and SvelteKit

- [x] **Step 9: Validate CI compatibility**
    - [x] Run full CI locally: `bun run ci`
    - [x] Verify `bun run lint` still works (no TypeScript parser issues)
    - [x] Verify `bun run test` still works
    - [x] Verify `bun run build` produces correct output
    - [x] Check GitHub Actions workflow (if exists) for type-check step
    - [x] Ensure no new warnings or errors in CI output

- [x] **Step 10: Clean up and document**
    - [x] Remove backup files: `*.backup`
    - [x] Add inline comments to root tsconfig explaining what belongs at root vs package
    - [x] Add inline comments to package tsconfigs explaining overrides
    - [x] Document inheritance pattern in config file headers
    - [x] Create comparison table: before/after compiler option count
    - [x] Prepare PR description with config hierarchy diagram

## Docs

- [x] **Inline documentation**: Add explanatory comments to all 3 tsconfig.json files
- [ ] **ARCHITECTURE.md**: Note TypeScript config hierarchy (will be detailed in PR3)
- [x] **PR Description**: Include before/after comparison and migration notes

## Testing

- [x] **Type-check tests**: `bun run type-check` passes for all packages
- [x] **Core package**: `cd packages/core && bun tsc --noEmit` passes
- [x] **Dashboard package**: `bun run --filter dashboard check` passes (svelte-check)
- [x] **IDE integration**: Manual testing in VSCode/Zed
- [x] **CI simulation**: `bun run ci` passes locally
- [x] **SvelteKit types**: Manual verification of `$app/*`, component props
- [x] **Path aliases**: Manual verification of `@/*` in core, `$lib` in dashboard
- [x] **Error count**: Compare before/after (must be ≤ baseline)

## Acceptance

- [x] Root `tsconfig.json` contains only shared, runtime-agnostic compiler options
- [x] Core package extends root with Node.js/Bun-specific config (lib, target, types)
- [x] Dashboard package extends root with browser/SvelteKit-specific config
- [x] No duplication of base compiler options between root and packages
- [x] `bun run type-check` passes with 0 errors
- [x] `bun run --filter devflow-mcp type-check` passes
- [x] `bun run --filter dashboard check` passes (svelte-check)
- [x] IDE (VSCode/Zed) type-checking works in both packages
- [x] Path aliases resolve correctly: `@/*` in core, `$lib` in dashboard
- [x] SvelteKit imports resolve: `$app/*`, `$env/*`, component types
- [x] CI passes with new configuration
- [x] Config inheritance documented in inline comments
- [x] Total compiler option duplication reduced by 100% (8 duplicated → 0 duplicated)
- [x] No TypeScript errors introduced
- [x] Type-check performance unchanged (±10%)

## Fallback Plan

**If SvelteKit extends conflict occurs:**

1. Keep dashboard `tsconfig.json` independent (extends `.svelte-kit/tsconfig.json` only)
2. Document that dashboard config is SvelteKit-managed
3. Only apply root inheritance to core package
4. Update PR scope: partial hierarchy (core only)

**If type errors increase significantly:**

1. `git stash` or revert changes
2. Review diff in compiler options
3. Identify which option change caused errors
4. Adjust root config to be more permissive
5. Re-test incrementally

**If IDE integration breaks:**

1. Add `.vscode/settings.json` with TypeScript server config
2. Document IDE-specific setup in CONTRIBUTING.md
3. Verify tsserver can find all configs
4. Consider workspace recommendations file

**Full rollback:**

1. Restore from backup files
2. `git reset --hard` to previous commit
3. Document issues encountered
4. Reassess hierarchy approach

## References

- TypeScript Handbook - Project References: https://www.typescriptlang.org/docs/handbook/project-references.html
- TypeScript extends: https://www.typescriptlang.org/tsconfig#extends
- SvelteKit TypeScript config: https://svelte.dev/docs/kit/configuration#typescript
- Bun TypeScript: https://bun.sh/docs/runtime/typescript
- Existing masterplan: `docs/masterplans/workspace-config-standardization.md`
- Project rules: `AGENTS.md`
- Workspace migration: `docs/plans/bun-workspaces-migration.md`

## Complexity Check

- **TODO Count**: 56
- **Depth**: 3 (Step → Task → Sub-verification)
- **Cross-deps**: 2 (blocks PR3, blocked by PR1)
- **High Risk Items**: 1 (SvelteKit integration conflict)
- **Decision**: ⚠️ **High TODO count but appropriate for config refactor**
    - Justification: Comprehensive testing required for type system changes
    - Many TODOs are verification steps (low complexity, high thoroughness)
    - Single PR scope: 3 files, clear boundaries
    - Not splitting: Config changes must be atomic to avoid broken intermediate states
    - Mitigation: Clear rollback plan, incremental testing per step
