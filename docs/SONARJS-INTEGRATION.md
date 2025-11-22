# SonarJS ESLint Plugin Integration

## Overview

The `eslint-plugin-sonarjs` (v3.0.5) is integrated into this project's ESLint configuration to enhance code quality through SonarSource's battle-tested rules for JavaScript and TypeScript.

## What SonarJS Provides

### Bug Detection Rules (~15 rules)

Catches logical errors and suspicious patterns:

- Identical expressions on both sides of operators
- Duplicated conditions in if/else chains
- Accessing empty collections
- Redundant break statements
- Calling functions with incorrect argument counts

### Code Smell Rules (~20 rules)

Identifies maintainability and quality issues:

- Cognitive complexity thresholds
- Duplicated code and logic
- Nested control flow depth limits
- Unreachable code
- Non-existent operators (=+, =-, =!)

## Configuration

The plugin is configured in `eslint.config.mjs` with recommended settings:

```javascript
import sonarjs from 'eslint-plugin-sonarjs';

export default [
	// ... other configs
	sonarjs.configs.recommended,
	// ... prettier (must come last)
];
```

## Key Rules Active

| Rule                       | Type  | Severity | Purpose                                  |
| -------------------------- | ----- | -------- | ---------------------------------------- |
| `no-identical-expressions` | Bug   | Error    | Find duplicate expressions in conditions |
| `cognitive-complexity`     | Smell | Warning  | Flag overly complex functions            |
| `no-commented-code`        | Smell | Error    | Remove commented-out code                |
| `no-collapsible-if`        | Smell | Warning  | Merge redundant nested if statements     |
| `no-duplicated-branches`   | Smell | Warning  | Prevent identical if/else blocks         |
| `no-extra-arguments`       | Bug   | Error    | Catch wrong function call signatures     |

**Note:** Some rules like `elseif-without-else` and `max-lines` are disabled by default and can be enabled as needed.

## Commands

```bash
bun run lint         # Check for violations
bun run lint:fix     # Auto-fix applicable violations
bun run type-check   # Verify TypeScript types
bun test            # Run test suite
```

## Best Practices

1. **Type Awareness**: SonarJS works best with TypeScript parser and type information enabled (already configured)
2. **Gradual Adoption**: If violations appear, prioritize:
    - Critical bugs (use error level)
    - Duplicated logic
    - Then other code smells
3. **Pre-commit**: Rules are enforced via `lint-staged` on staged files

## Integration Points

- **ESLint Config**: `eslint.config.mjs`
- **Pre-commit Hook**: `.husky/pre-commit` (runs lint-staged)
- **CI/CD**: `bun run lint` validates on pull requests
- **IDE**: Most IDEs with ESLint extensions will highlight violations as you type

## Disabling Specific Rules

If a rule conflicts with your coding style, disable it in `eslint.config.mjs`:

```javascript
{
	rules: {
		'sonarjs/rule-name': 'off'
	}
}
```

## Resources

- [SonarJS GitHub (archived v1.x)](https://github.com/SonarSource/eslint-plugin-sonarjs)
- [SonarSource Rule Index (RSPEC)](https://sonarsource.github.io/rspec/)
- [ESLint Plugin Documentation](https://sonarsource.github.io/SonarJS/)

## Version Info

- **Plugin**: eslint-plugin-sonarjs@3.0.5
- **ESLint**: 9.17.0
- **TypeScript**: 5.7.2
- **ESLint Plugin**: Requires ESLint 8.x or 9.x

---

**Added**: 2025-01-14  
**Status**: ✅ Active
