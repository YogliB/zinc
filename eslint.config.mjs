// @ts-check

/**
 * Root ESLint Configuration - Monorepo Hierarchical Pattern
 *
 * This configuration uses ESLint flat config's file-based overrides pattern to establish
 * a hierarchy where:
 * 1. Universal rules (ESLint, TypeScript, Prettier) apply to ALL packages
 * 2. Package-specific rules are scoped using file patterns (packages/core/**, packages/dashboard/**)
 *
 * Package-specific configurations:
 * - packages/core: Node.js/MCP server tooling (unicorn, sonarjs, security, import)
 * - packages/dashboard: Svelte/UI tooling (svelte, storybook, browser globals)
 *
 * Why all plugins are in root:
 * - ESLint flat config requires plugins to be loaded where rules are defined
 * - Running `eslint packages/core packages/dashboard` from root uses THIS config
 * - File patterns scope rules to specific packages while keeping plugins centralized
 * - Inline disable comments work because plugins are available in the config
 *
 * When to add rules:
 * - Universal (all packages): Add to the base configs (eslint, typescript-eslint, prettier)
 * - Core-specific (Node.js/backend): Add to the packages/core/** override section
 * - Dashboard-specific (Svelte/frontend): Add to the packages/dashboard/** override section
 */

import { fileURLToPath } from 'node:url';
import eslint from '@eslint/js';
import ts from 'typescript-eslint';
import { configs as tsConfigs } from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import { configs as storybookConfigs } from 'eslint-plugin-storybook';

// Import dashboard svelte config for parser configuration
const dashboardSvelteConfigPath = fileURLToPath(
	new URL('./packages/dashboard/svelte.config.js', import.meta.url),
);
const svelteConfig = await import(dashboardSvelteConfigPath).then(
	(m) => m.default,
);

// Custom plugin: Enforces that index files only contain re-exports
const indexExportsOnlyPlugin = {
	rules: {
		'index-exports-only': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Index files must only contain re-exports',
				},
			},
			create(context) {
				const allowed = new Set([
					'ExportAllDeclaration',
					'ExportNamedDeclaration',
					'ImportDeclaration',
				]);
				return {
					Program(node) {
						for (const stmt of node.body) {
							if (!allowed.has(stmt.type)) {
								context.report({
									node: stmt,
									message:
										'Index files must only contain import/export statements.',
								});
							}
							if (
								stmt.type === 'ExportNamedDeclaration' &&
								stmt.declaration
							) {
								context.report({
									node: stmt,
									message:
										'Index files must only re-export, not declare new exports.',
								});
							}
						}
					},
				};
			},
		},
	},
};

export default [
	// ============================================================================
	// Global Ignores - Apply to All Packages
	// ============================================================================
	{
		ignores: [
			'packages/**/node_modules/**',
			'packages/**/dist/**',
			'packages/**/.svelte-kit/**',
			'packages/**/build/**',
			'packages/**/coverage/**',
			'packages/**/*.d.ts.map',
			'packages/**/eslint.config.*',
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'**/*.d.ts.map',
		],
	},

	// ============================================================================
	// Universal Rules - Apply to All Packages
	// ============================================================================
	// Base ESLint recommended rules - universal JavaScript best practices
	eslint.configs.recommended,
	// TypeScript ESLint recommended rules - universal TypeScript best practices
	...tsConfigs.recommended,
	// Prettier integration - ensures consistent formatting across all packages
	prettier,

	// ============================================================================
	// Core Package - Node.js/MCP Server Specific Rules
	// ============================================================================
	{
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		...sonarjs.configs.recommended,
	},
	{
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		...security.configs.recommended,
	},
	{
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		...importPlugin.flatConfigs.recommended,
	},
	{
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		...importPlugin.flatConfigs.typescript,
	},
	{
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		...unicorn.configs.recommended,
	},
	{
		// Enforce index-exports-only rule on core package index files
		files: ['packages/core/**/index.ts', 'packages/core/**/index.js'],
		plugins: {
			'index-exports': indexExportsOnlyPlugin,
		},
		rules: {
			'index-exports/index-exports-only': 'error',
		},
	},
	{
		// Import resolver configuration for core package
		files: ['packages/core/**/*.ts', 'packages/core/**/*.js'],
		settings: {
			'import/resolver': {
				typescript: true,
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
			'import/core-modules': [],
		},
	},
	{
		// Relax security rules for test files and scripts in core package
		files: [
			'packages/core/tests/**/*.ts',
			'packages/core/**/*.test.ts',
			'packages/core/**/scripts/**/*.ts',
			'packages/core/**/storage/engine.ts',
			'packages/core/**/tools/patterns.ts',
			'packages/core/**/helpers/**/*.ts',
			'packages/core/**/analytics/**/*.ts',
			'packages/core/**/dashboard/**/*.ts',
		],
		rules: {
			'security/detect-non-literal-fs-filename': 'off',
		},
	},
	{
		// Server-specific rule overrides for long-running process
		files: ['packages/core/src/server.ts'],
		rules: {
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/no-process-exit': 'off',
		},
	},

	// ============================================================================
	// Dashboard Package - Svelte/UI Specific Rules
	// ============================================================================
	// Svelte recommended rules - scoped to dashboard package
	...svelte.configs.recommended.map((config) => ({
		...config,
		files: config.files
			? config.files.map((pattern) => `packages/dashboard/${pattern}`)
			: [
					'packages/dashboard/**/*.js',
					'packages/dashboard/**/*.ts',
					'packages/dashboard/**/*.svelte',
				],
	})),
	// Svelte prettier integration - scoped to dashboard package
	...svelte.configs.prettier.map((config) => ({
		...config,
		files: config.files
			? config.files.map((pattern) => `packages/dashboard/${pattern}`)
			: [
					'packages/dashboard/**/*.js',
					'packages/dashboard/**/*.ts',
					'packages/dashboard/**/*.svelte',
				],
	})),
	// Storybook recommended rules - scoped to dashboard package
	...storybookConfigs['flat/recommended'].map((config) => ({
		...config,
		files: config.files
			? config.files.map((pattern) => `packages/dashboard/${pattern}`)
			: [
					'packages/dashboard/**/*.js',
					'packages/dashboard/**/*.ts',
					'packages/dashboard/**/*.svelte',
				],
	})),
	{
		// Configure Storybook addon validation for monorepo structure
		files: ['packages/dashboard/.storybook/**/*.ts'],
		rules: {
			'storybook/no-uninstalled-addons': [
				'error',
				{
					packageJsonLocation: 'packages/dashboard/package.json',
				},
			],
		},
	},
	{
		// Browser and Node.js globals for dashboard package
		files: [
			'packages/dashboard/**/*.js',
			'packages/dashboard/**/*.ts',
			'packages/dashboard/**/*.svelte',
		],
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			// Svelte compiler handles variable checking, disable base ESLint no-undef
			'no-undef': 'off',
		},
	},
	{
		// Svelte file-specific parser configuration with TypeScript support
		// This MUST come after svelte.configs.recommended to merge parserOptions
		files: [
			'packages/dashboard/**/*.svelte',
			'packages/dashboard/**/*.svelte.ts',
			'packages/dashboard/**/*.svelte.js',
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
];
