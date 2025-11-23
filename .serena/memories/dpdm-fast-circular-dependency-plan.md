# dpdm-fast Integration Plan v1.0

## Goal

Integrate `dpdm-fast` for automated circular dependency detection in the dev-toolkit-mcp project, with CI enforcement to prevent circular dependencies from being merged.

## Scope

- **In Scope:**
    - Install and configure dpdm-fast
    - Add npm script for local circular dependency checks
    - Add CI job for automated checks on push/PR
    - Configure to fail CI when circular dependencies detected
    - Support TypeScript path aliases (@/\*)
    - Documentation in README

- **Out of Scope:**
    - Fixing existing circular dependencies (if found)
    - Custom circular dependency visualization
    - Integration with other dependency tools (madge, etc.)
    - Pre-commit hooks for circular checks (too slow for dev workflow)

## Risks

- **Performance in CI**: dpdm-fast uses Rust for speed but progress bar slows it down
    - **Mitigation**: Use `--no-progress` flag in CI for maximum speed
- **False positives with dynamic imports**: May detect circular deps in dynamic imports
    - **Mitigation**: Use `--skip-dynamic-imports circular` if needed
- **Existing circular dependencies**: Project might already have them
    - **Mitigation**: Run check first, document findings, fix separately if needed

## Dependencies

- dpdm-fast npm package (latest version)
- Existing tsconfig.json for path resolution
- GitHub Actions CI infrastructure (already present)
- Bun package manager (v1.3.2)

## Priority

**High** - Prevents architectural issues from accumulating

## Logging / Observability

- CI job output shows circular dependency details when detected
- Local script provides tree output for debugging
- Exit code 1 on circular dependencies found for CI gating

## Implementation Plan (TODOs)

- [ ] **Step 1: Install and Configure dpdm-fast**
    - [ ] Install dpdm-fast as dev dependency: `bun add -D dpdm-fast`
    - [ ] Verify installation: `bunx dpdm-fast --version`

- [ ] **Step 2: Add Package.json Scripts**
    - [ ] Add `check:circular` script: `"check:circular": "dpdm-fast --no-warning --no-tree ./src/index.ts"`
    - [ ] Add `check:circular:verbose` script: `"check:circular:verbose": "dpdm-fast ./src/index.ts"`
    - [ ] Add `check:circular:ci` script: `"check:circular:ci": "dpdm-fast --no-warning --no-tree --no-progress --exit-code circular:1 --tsconfig ./tsconfig.json ./src/index.ts"`

- [ ] **Step 3: Test Locally**
    - [ ] Run `bun run check:circular` to verify basic functionality
    - [ ] Run `bun run check:circular:verbose` to see full tree output
    - [ ] Verify TypeScript path alias (@/\*) resolution works

- [ ] **Step 4: Add CI Job**
    - [ ] Add new `circular-deps` job to .github/workflows/ci.yml
    - [ ] Use same setup steps as other jobs (checkout, setup-bun, cache, install)
    - [ ] Run `bun run check:circular:ci` as the check step
    - [ ] Set `continue-on-error: false` to fail CI on detection

- [ ] **Step 5: Update CI Status Job**
    - [ ] Add `circular-deps` to the `needs` array in `ci-status` job
    - [ ] Add `circular-deps` result check to the status script

- [ ] **Step 6: Documentation**
    - [ ] Add "Circular Dependency Checks" section to README
    - [ ] Document available scripts and their purposes
    - [ ] Add troubleshooting guidance for common issues

## Docs

- [ ] **README.md**: Add section on circular dependency checks under "Development" or "Scripts"
- [ ] **CI.yml**: Inline comments explaining dpdm-fast job configuration
- [ ] **Package.json**: Script descriptions in this plan serve as documentation

## Testing

- [ ] **Local testing**: Run all three scripts and verify output
- [ ] **CI testing**: Trigger CI run and verify job executes successfully
- [ ] **Negative test**: Intentionally create circular dependency, verify CI fails
- [ ] **Path alias test**: Verify imports using @/\* are resolved correctly

## Acceptance

- [ ] dpdm-fast installed and appears in package.json devDependencies
- [ ] Three npm scripts available and functional (check:circular, check:circular:verbose, check:circular:ci)
- [ ] CI job runs successfully on push to main/develop and PRs
- [ ] CI fails with exit code 1 when circular dependencies detected
- [ ] TypeScript path aliases (@/\*) are correctly resolved
- [ ] Documentation updated in README with usage examples
- [ ] No performance degradation in CI (<30s additional time)

## Fallback Plan

If dpdm-fast causes issues:

1. Remove the CI job (keep as optional local script)
2. Investigate specific circular dependency issues
3. Consider alternative tools (madge, dependency-cruiser) if dpdm-fast doesn't work with Bun
4. Roll back to manual periodic checks

If CI becomes too slow:

1. Move circular check to scheduled workflow (nightly)
2. Keep as required local check only
3. Optimize by checking only changed files

## References

- [dpdm-fast GitHub](https://github.com/GrinZero/dpdm-fast)
- [dpdm-fast npm](https://www.npmjs.com/package/dpdm-fast)
- Project tsconfig.json (for path alias configuration)
- Existing CI workflow: .github/workflows/ci.yml

## Complexity Check

- **TODO Count**: 17
- **Depth**: 2 (Steps > Subtasks)
- **Cross-deps**: 1 (CI job depends on scripts being defined)
- **High Risk**: 0
- **Decision**: ✅ **Proceed** - Complexity is manageable for single PR

## Status

✅ **IMPLEMENTATION COMPLETE**

### Completed Tasks

- [x] **Step 1: Install and Configure dpdm-fast**
    - [x] Installed dpdm-fast@1.0.14 as dev dependency
    - [x] Verified installation: dpdm 1.0

- [x] **Step 2: Add Package.json Scripts**
    - [x] Added `check:circular`: Quick check, no tree output
    - [x] Added `check:circular:verbose`: Full dependency tree
    - [x] Added `check:circular:ci`: CI mode with exit code enforcement

- [x] **Step 3: Test Locally**
    - [x] All three scripts tested and working
    - [x] TypeScript path alias (@/\*) resolution verified
    - [x] No circular dependencies found in project

- [x] **Step 4: Add CI Job**
    - [x] New `circular-deps` job added to .github/workflows/ci.yml
    - [x] Uses same setup pattern as other jobs (checkout, bun, cache, install)
    - [x] Runs `bun run check:circular:ci` with proper exit code handling

- [x] **Step 5: Update CI Status Job**
    - [x] Added `circular-deps` to needs array
    - [x] Added `circular-deps` result check to status script

- [x] **Step 6: Documentation**
    - [x] Added "Development" section to README
    - [x] Documented all npm scripts
    - [x] Added "Circular Dependency Checks" subsection with examples
    - [x] Added dpdm-fast to Technology Stack

### Verification

- ✅ All npm scripts working locally
- ✅ CI job configuration valid YAML
- ✅ Zero circular dependencies detected in current codebase
- ✅ Documentation updated with usage examples
- ✅ dpdm-fast added to devDependencies

### Next Step

Commit and push to trigger CI workflow to verify the new circular-deps job runs successfully.
