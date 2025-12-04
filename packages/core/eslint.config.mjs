// @ts-check

/**
 * Core Package ESLint Configuration
 *
 * This package config is intentionally minimal - most rules are defined in the root
 * eslint.config.mjs using file-based overrides (packages/core/**).
 *
 * This file only contains:
 * - Local ignore patterns
 * - Node.js globals for the runtime environment
 * - Extension of root config for consistency
 *
 * All core-specific linting rules (unicorn, sonarjs, security, import, custom rules)
 * are defined in the root config and scoped to packages/core/** using file patterns.
 * This is the correct ESLint flat config pattern for monorepos.
 */

import globals from 'globals';
import rootConfig from '../../eslint.config.mjs';

export default [
	{
		// Local ignore patterns for core package
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'**/*.d.ts.map',
			'.bun-test/**',
			'.test-*/**',
		],
	},
	// Inherit all rules from root (includes universal + core-specific via file patterns)
	...rootConfig,
	{
		// Node.js runtime globals
		languageOptions: {
			globals: globals.node,
		},
	},
];
