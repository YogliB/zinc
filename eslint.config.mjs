// @ts-check

import eslint from '@eslint/js';
import { configs as tsConfigs } from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';

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
	eslint.configs.recommended,
	...tsConfigs.recommended,
	sonarjs.configs.recommended,
	security.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	unicorn.configs.recommended,
	{
		files: ['**/index.ts', '**/index.js'],
		plugins: {
			'index-exports': indexExportsOnlyPlugin,
		},
		rules: {
			'index-exports/index-exports-only': 'error',
		},
	},
	{
		settings: {
			'import/resolver': {
				typescript: true,
				node: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
				},
			},
			'import/core-modules': ['bun:test'],
		},
	},
	{
		files: ['tests/**/*.ts', '**/*.test.ts'],
		rules: {
			'security/detect-non-literal-fs-filename': 'off',
		},
	},
	prettier,
];
