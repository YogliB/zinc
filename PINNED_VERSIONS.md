# Pinned Package Versions

**Date:** Nov 22, 2024  
**Configuration:** Exact versions enforced via package.json and bunfig.toml

## Pinning Strategy

All dependencies are pinned to exact versions (no `^` or `~` ranges). This ensures:

- ✅ **Reproducible builds** across all environments
- ✅ **Consistent behavior** between developers
- ✅ **Predictable updates** (manual, controlled via PR review)
- ✅ **Dependency stability** for production deployments

## Pinned Versions

### Core Compiler

| Package       | Version   | Reason                       |
| ------------- | --------- | ---------------------------- |
| `typescript`  | `5.7.2`   | Stable, strict type checking |
| `@types/node` | `22.10.1` | Node.js type definitions     |

### MCP Framework

| Package                     | Version | Reason                |
| --------------------------- | ------- | --------------------- |
| `@modelcontextprotocol/sdk` | `0.7.0` | Latest stable MCP SDK |

### Code Quality

| Package                  | Version  | Reason                        |
| ------------------------ | -------- | ----------------------------- |
| `eslint`                 | `9.17.0` | Modern linting                |
| `@eslint/js`             | `9.17.0` | ESLint base config            |
| `typescript-eslint`      | `8.18.0` | TypeScript ESLint integration |
| `prettier`               | `3.4.2`  | Code formatting               |
| `eslint-plugin-prettier` | `5.2.1`  | ESLint + Prettier integration |

### Testing

| Package      | Version | Reason              |
| ------------ | ------- | ------------------- |
| `vitest`     | `2.1.8` | Modern test runner  |
| `@vitest/ui` | `2.1.8` | Vitest UI dashboard |

### Git Automation

| Package       | Version   | Reason                |
| ------------- | --------- | --------------------- |
| `husky`       | `9.1.7`   | Git hooks management  |
| `lint-staged` | `15.2.11` | Pre-commit automation |

## Total Packages

- **Direct dependencies:** 12 packages pinned
- **Transitive dependencies:** 220 packages (locked in bun.lock)
- **Total lockfile size:** 59KB

## Bun Configuration

### bunfig.toml

```toml
[install]
exact = true         # Always use exact versions
frozen = false       # Allow lockfile updates
trust = true         # Trust package.json versions

[packages]
# Ensure strict version compliance
```

### How It Works

1. **Installation:** `bun install` reads exact versions from package.json
2. **Lockfile:** bun.lock captures all transitive dependencies
3. **Reproducibility:** Other developers run `bun install` and get identical versions
4. **Updates:** Manual version bumps via `bun add package@version` + PR review

## Updating Packages

To update a package **safely and explicitly**:

```bash
# Update one package to specific version
bun add --exact @package/name@3.0.0 --save-dev

# This will:
# 1. Update package.json with exact version
# 2. Update bun.lock with new transitive deps
# 3. You commit both files to git
# 4. Team gets reproducible version on next `bun install`
```

**Never use:**

- `npm install` (uses npm, not bun)
- `bun add package` (without exact version)
- `bun upgrade` (upgrades all packages)

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: bun install --frozen-lockfile

- name: Type check
  run: bun run type-check

- name: Test
  run: bun test

- name: Lint
  run: bun run lint
```

The `--frozen-lockfile` flag ensures that the CI environment uses exactly the locked versions.

## When to Update

- **Security patches:** Immediately (for vulnerability fixes)
- **Major versions:** After testing and approval
- **Minor versions:** Quarterly review
- **Patch versions:** As needed

## Verification Commands

```bash
# Verify all packages are pinned (no ranges)
grep -o '"@.*".*"[~^]' package.json || echo "✅ All versions pinned"

# Check bun.lock size
ls -lh bun.lock

# Verify lockfile is up-to-date
bun install --frozen-lockfile

# Test reproducibility
rm -rf node_modules bun.lock && bun install && bun test
```

## Benefits Summary

| Aspect          | Pinned Versions | Version Ranges           |
| --------------- | --------------- | ------------------------ |
| Reproducibility | ✅ 100%         | ❌ ~90%                  |
| Predictability  | ✅ Full         | ❌ Surprises             |
| Security        | ✅ Controlled   | ❌ Automatic (risky)     |
| Debugging       | ✅ Easy         | ❌ "Works on my machine" |
| Team sync       | ✅ Perfect      | ❌ Drift possible        |
| Update burden   | ⚠️ Manual       | ✅ Automatic             |

---

**Configuration Date:** Nov 22, 2024  
**Next Review:** Before production release  
**Status:** ✅ All versions pinned and locked
