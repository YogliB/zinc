# Migrate to esbuild and tsx v1.0

## Goal

Replace Bun as the primary bundler with esbuild for production builds and replace `bun run dev` with tsx for development server, resolving better-sqlite3 compatibility issues and providing a stable build pipeline.

## Scope

- **In Scope:** 
  - Update build script to use esbuild API
  - Replace dev script with tsx
  - Test build and development functionality
  - Update package.json scripts
- **Out of Scope:** 
  - Changing package management from Bun
  - Modifying test runner (Vitest)
  - Updating other Bun-dependent scripts

## Risks

- **Build failures with esbuild**: Mitigation - Test build output thoroughly and compare with current Bun build
- **tsx compatibility issues**: Mitigation - Verify ESM support and TypeScript execution
- **Performance regression**: Mitigation - Benchmark build times and ensure acceptable performance
- **Native module issues persist**: Mitigation - Monitor better-sqlite3 behavior in new setup

## Dependencies

- esbuild package installation
- tsx package installation
- Node.js environment for testing

## Priority

High - Current Bun setup has blocking issues with native modules and CI/CD

## Logging / Observability

- Build output logs
- Development server startup logs
- Test execution results

## Implementation Plan (TODOs)

- [ ] **Install Dependencies**
    - [ ] Add esbuild as dev dependency
    - [ ] Add tsx as dev dependency
    - [ ] Update package.json resolutions if needed

- [ ] **Update Build Script**
    - [ ] Modify `packages/core/scripts/build.ts` to use esbuild API instead of Bun.build
    - [ ] Maintain existing configuration (external deps, minification, target)
    - [ ] Test build output for correctness

- [ ] **Update Development Script**
    - [ ] Change `"dev"` script in `package.json` from `bun run src/server.ts` to `tsx src/server.ts`
    - [ ] Verify tsx can run the server with proper ESM support

- [ ] **Test Changes**
    - [ ] Run build and verify output matches previous functionality
    - [ ] Run development server and test basic operations
    - [ ] Execute test suite to ensure no regressions

- [ ] **Update Documentation**
    - [ ] Update SETUP.md with new development requirements
    - [ ] Document esbuild/ts configuration

## Docs

- [ ] Update `docs/SETUP.md`: Add esbuild and tsx setup instructions
- [ ] Update `docs/ARCHITECTURE.md`: Note bundler change

## Testing

- [ ] Unit tests: Ensure all existing tests pass
- [ ] Integration tests: Verify server functionality
- [ ] Build tests: Confirm production build works
- [ ] Development tests: Test hot reloading and server startup

## Acceptance

- [ ] Build completes successfully with esbuild
- [ ] Development server starts with tsx
- [ ] All tests pass
- [ ] No performance regression >10%
- [ ] better-sqlite3 issues resolved

## Fallback Plan

If esbuild or tsx causes issues:
1. Revert package.json scripts to Bun versions
2. Revert build.ts changes
3. Investigate alternative bundlers (webpack, rollup) if needed
4. Consider keeping Bun for development while using esbuild for builds

## References

- esbuild documentation: https://esbuild.github.io/
- tsx documentation: https://tsx.is/

## Complexity Check

- TODO Count: 12
- Depth: 2
- Cross-deps: 2
- **Decision:** Proceed - manageable scope for single PR