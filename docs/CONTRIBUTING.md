# Contributing Guide

**Thank you for your interest in contributing to DevFlow MCP!**

This guide will help you get started with contributing to the project.

---

## Getting Started

### Prerequisites

- **Bun 1.3.2+** - Runtime and package manager
- **Node.js 20+** - For compatibility
- **Git** - Version control
- **Code Editor** - VS Code, Cursor, or your preferred editor

### Development Setup

1. **Fork and Clone:**

```bash
git clone https://github.com/your-username/devflow-mcp.git
cd devflow-mcp
```

2. **Install Dependencies:**

```bash
bun install
```

3. **Verify Setup:**

```bash
# Run tests
bun test

# Type check
bun run type-check

# Lint
bun run lint
```

4. **Create a Branch:**

```bash
git checkout -b feature/your-feature-name
```

---

## Modifying CI Checks

### CI Sync Mechanism

The CI configuration is maintained in two places:

- **`.github/workflows/ci.yml`** - GitHub Actions workflow (source of truth)
- **`scripts/ci.sh`** - Local CI script (auto-generated)

**Important:** `scripts/ci.sh` is automatically generated from `ci.yml`. Do not edit it manually.

### How to Add/Modify CI Checks

1. **Edit the YAML workflow:**

```bash
# Edit .github/workflows/ci.yml
# Add or modify a job with the check you want
```

2. **Regenerate the shell script:**

```bash
bun run generate:ci-sh
```

3. **Verify sync:**

```bash
bun run validate:ci-sync
```

### Automatic Sync

The pre-commit hook automatically regenerates `ci.sh` when you commit changes to `ci.yml`:

```bash
git add .github/workflows/ci.yml
git commit -m "feat: Add new CI check"
# ci.sh is automatically regenerated and staged
```

### Console.log Prevention

The pre-commit hook automatically checks for `console.*` calls to ensure all logging uses the centralized logger utility.

**What's Checked:**

- All staged TypeScript/JavaScript files in `src/`
- Excludes `scripts/`, `tests/`, and test files (`.test.ts`, `.spec.ts`)
- Excludes commented-out console statements

**If Violations Found:**

```bash
❌ Found console.* call(s) in src/example.ts:
   42:  console.log('debug message');

🚫 Pre-commit check FAILED: console.* calls detected

Please use the logger utility instead of console.*
```

**Use Logger Instead:**

```typescript
import { createLogger } from './core/utils/logger.js';

const logger = createLogger('ModuleName');

logger.debug('Debug message');
logger.info('Information');
logger.warn('Warning');
logger.error('Error occurred');
```

**When --no-verify is Acceptable:**

- Emergency hotfixes (rare)
- Legitimate console usage in scripts/ or tests/
- Temporary debugging (remove before merging)

```bash
# Bypass pre-commit checks (not recommended)
git commit --no-verify -m "fix: emergency hotfix"
```

**Note:** CI linting serves as a backup check, so bypassed violations will still be caught in CI.

### CI Validation

The CI pipeline includes a `ci-sync-check` job that ensures the files stay in sync. If they drift, the CI will fail with a clear error message.

---

## Development Workflow

### Code Style

We follow strict code style guidelines:

- **TypeScript** - Strict mode enabled
- **ESLint** - Enforced with zero warnings
- **Prettier** - Automatic formatting
- **No Comments** - Code should be self-explanatory (see coding rules)

**Before Committing:**

```bash
# Auto-fix linting issues
bun run lint:fix

# Format code
bun run format

# Type check
bun run type-check
```

### Configuration Inheritance

DevFlow uses a hierarchical configuration system where packages extend root configs. See [Configuration Architecture](./ARCHITECTURE.md#configuration-architecture) for details.

#### Adding Linting Rules

**Decision Tree:**

1. Does this rule apply to **all** TypeScript/JavaScript files?
    - ✅ Yes → Add to **root** `eslint.config.mjs`
    - ❌ No → Continue to step 2

2. Is this rule specific to Node.js/MCP server code?
    - ✅ Yes → Add to **root** `eslint.config.mjs` under `packages/core/**` file patterns
    - ❌ No → Continue to step 3

3. Is this rule specific to Svelte/frontend code?
    - ✅ Yes → Add to **packages/dashboard/eslint.config.js**

**Examples:**

- ✅ Root: `no-console`, `@typescript-eslint/no-unused-vars` (universal)
- ✅ Root (core patterns): `unicorn/no-process-exit`, `security/detect-object-injection` (Node.js)
- ✅ Dashboard: `svelte/no-at-html-tags`, `svelte/valid-compile` (Svelte-specific)

#### Adding TypeScript Compiler Options

**Decision Tree:**

1. Does this option affect how TypeScript compiles for **all** packages?
    - ✅ Yes → Add to **root** `tsconfig.json`
    - ❌ No → Continue to step 2

2. Is this option runtime-specific (browser vs Node.js)?
    - ✅ Yes → Add to **package-specific** `tsconfig.json`

**Examples:**

- ✅ Root: `strict`, `target`, `module`, `esModuleInterop` (universal)
- ✅ Package: `lib: ["DOM"]` (dashboard), `lib: ["ES2022"]` (core)

#### Modifying Prettier Config

**Decision Tree:**

1. Does this change affect formatting for **all** file types?
    - ✅ Yes → Update **root** `package.json` prettier config
    - ❌ No → Reconsider - Prettier should be consistent across packages

**Examples:**

- ✅ Root: `singleQuote`, `useTabs`, `tabWidth` (consistent across all files)
- ❌ Package: Don't add package-specific prettier configs

#### Adding Ignore Patterns

**Decision Tree:**

1. Should this pattern be ignored in **all** packages?
    - ✅ Yes → Add to **root** `.prettierignore` with `**/` prefix
    - ❌ No → Add to **package-specific** `.prettierignore`

**Examples:**

- ✅ Root: `**/dist/`, `**/node_modules/`, `**/coverage/` (workspace-wide)
- ✅ Package: `static/` (dashboard-specific static assets)

#### Troubleshooting Config Issues

**Linting not working:**

```bash
# Check if config is valid
bun run lint --debug

# Clear cache and retry
bun run lint:clean
bun run lint

# Verify package extends root correctly
cat packages/core/eslint.config.mjs | grep rootConfig
```

**Type errors in IDE but not CLI:**

```bash
# Restart TypeScript server in your editor
# For VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"

# Verify extends path is correct
cat packages/core/tsconfig.json | grep extends
```

**Formatting inconsistent:**

```bash
# Always format from root, not package directory
cd /path/to/devflow
bun run format

# Check if package has conflicting prettier config
grep -r "prettier" packages/*/package.json
```

### Project Structure

```
src/
├── core/              # Core infrastructure
│   ├── config.ts     # Project root detection
│   ├── storage/       # File I/O engine
│   └── analysis/     # Analysis engine and plugins
├── mcp/               # MCP server
│   └── tools/         # MCP tools
├── server.ts          # Main server entry point
└── index.ts          # Public API
```

### Adding a New Tool

1. **Create Tool File** (`src/mcp/tools/my-tool.ts`):

```typescript
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { z } from 'zod';

export function registerMyTools(server: FastMCP, engine: AnalysisEngine): void {
	server.addTool({
		name: 'myTool',
		description: 'Tool description',
		parameters: z.object({
			param: z.string().describe('Parameter description'),
		}),
		execute: async ({ param }: { param: string }) => {
			// Tool implementation
			return JSON.stringify({ result: 'data' });
		},
	});
}
```

2. **Register in `src/mcp/tools/register.ts`:**

```typescript
import { registerMyTools } from './my-tool';

export function registerAllTools(...) {
	// ... existing registrations
	registerMyTools(server, engine);
}
```

3. **Add Tests** (`tests/integration/mcp-tools/my-tool.test.ts`):

```typescript
import { describe, it, expect } from 'bun:test';

describe('myTool', () => {
	it('should work correctly', async () => {
		// Test implementation
	});
});
```

### Adding a Language Plugin

1. **Create Plugin** (`src/core/analysis/plugins/my-language.ts`):

```typescript
import type { LanguagePlugin } from './base';

export class MyLanguagePlugin implements LanguagePlugin {
	readonly name = 'my-language';
	readonly languages = ['mylang'];

	async parse(path: string): Promise<AST> {
		// Parse implementation
	}

	async extractSymbols(ast: AST, path: string): Promise<Symbol[]> {
		// Symbol extraction
	}

	async buildRelationships(...): Promise<Relationship[]> {
		// Relationship building
	}

	async detectPatterns(...): Promise<Pattern[]> {
		// Pattern detection
	}
}
```

2. **Register in Server** (`src/server.ts`):

```typescript
const myPlugin = new MyLanguagePlugin(projectRoot);
analysisEngine.registerPlugin(myPlugin);
```

---

## Testing

### Test Structure

```
tests/
├── unit/              # Fast, mocked tests (<10ms each)
├── integration/      # Real dependencies (<100ms each)
└── e2e/              # Full system tests (CI-only)
```

### Running Tests

```bash
# All tests
bun test

# Unit tests only
bun run test:unit

# Integration tests only
bun run test:integration

# Watch mode
bun test --watch

# Coverage
bun run test:coverage
```

### Writing Tests

**Unit Tests** - Fast, isolated, mocked:

```typescript
import { describe, it, expect } from 'bun:test';

describe('FunctionName', () => {
	it('should handle valid input', () => {
		expect(functionName('valid')).toBe(true);
	});

	it('should reject invalid input', () => {
		expect(functionName('invalid')).toBe(false);
	});
});
```

**Integration Tests** - Real dependencies:

```typescript
import { describe, it, expect } from 'bun:test';

describe('Tool Integration', () => {
	it('should analyze file correctly', async () => {
		const result = await tool.execute({ file: 'test.ts' });
		expect(result).toBeDefined();
	});
});
```

### Test Requirements

- ✅ All new features must have tests
- ✅ Tests must be isolated (no shared state)
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Tests should run in parallel safely

---

## Pull Request Process

### Before Submitting

1. **Ensure Tests Pass:**

```bash
bun test
bun run type-check
bun run lint
```

2. **Update Documentation:**

- Update relevant documentation files
- Add examples if introducing new features
- Update CHANGELOG.md if needed

3. **Check CI Requirements:**

All CI checks must pass:

- ✅ Linting
- ✅ Formatting
- ✅ Type checking
- ✅ Tests
- ✅ Build

### PR Guidelines

**Title Format:**

- `feat: Add new tool for X`
- `fix: Resolve issue with Y`
- `docs: Update usage guide`
- `refactor: Improve Z implementation`

**Description Should Include:**

- What changes were made
- Why the changes were needed
- How to test the changes
- Any breaking changes

**Example:**

```markdown
## Description

Adds a new tool for analyzing code complexity.

## Changes

- New `analyzeComplexity` tool
- Complexity calculation algorithm
- Tests and documentation

## Testing

Run `bun test` - all tests pass
Tested manually with sample files

## Breaking Changes

None
```

### Review Process

1. **Automated Checks** - CI runs automatically
2. **Code Review** - Maintainers review code
3. **Feedback** - Address any requested changes
4. **Approval** - Once approved, PR can be merged

### Commit Messages

Follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

**Example:**

```
feat: Add Python language plugin

Implements basic Python AST parsing and symbol extraction.
Supports classes, functions, and imports.

Closes #123
```

---

## Code of Conduct

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers
- ✅ Accept constructive criticism
- ✅ Focus on what's best for the project

### Unacceptable Behavior

- ❌ Harassment or discrimination
- ❌ Trolling or inflammatory comments
- ❌ Personal attacks
- ❌ Publishing others' private information

---

## Areas for Contribution

### High Priority

- **Bug Fixes** - Fix issues in existing features
- **Performance** - Optimize slow operations
- **Tests** - Increase test coverage
- **Documentation** - Improve clarity and examples

### Medium Priority

- **Language Plugins** - Add support for new languages
- **New Tools** - Implement additional MCP tools
- **Pattern Detection** - Add more pattern types
- **Error Handling** - Improve error messages

### Low Priority

- **IDE Plugins** - Create editor integrations
- **Examples** - Add more usage examples
- **Tutorials** - Create video or written tutorials

---

## Getting Help

### Questions?

- **GitHub Discussions** - Ask questions
- **GitHub Issues** - Report bugs or request features
- **Documentation** - Check [docs](./README.md)

### Communication

- Be clear and concise
- Provide context and examples
- Be patient with responses
- Follow up on discussions

---

## Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md (if applicable)
- Credited in release notes
- Appreciated by the community!

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to DevFlow MCP!** 🎉
