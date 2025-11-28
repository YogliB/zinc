// @ts-check

import eslint from '@eslint/js';
import { configs as tsConfigs } from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';

const noDisableCommentsPlugin = {
	rules: {
		'no-eslint-disable-comments': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Forbid disabling ESLint rules via comments',
					category: 'Best Practices',
				},
			},
			create(context) {
				return {
					LineComment(node) {
						if (/eslint-disable/.test(node.value)) {
							context.report({
								node,
								message:
									'Use of eslint-disable comments is forbidden. Fix the underlying issue instead.',
							});
						}
					},
					BlockComment(node) {
						if (/eslint-disable/.test(node.value)) {
							context.report({
								node,
								message:
									'Use of eslint-disable comments is forbidden. Fix the underlying issue instead.',
							});
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
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'**/*.d.ts.map',
			'vitest.config.d.ts',
			'vitest.config.js',
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
		settings: {
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
	},
	{
		files: ['src/index.ts'],
		rules: {
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/no-process-exit': 'off',
		},
	},
	{
		plugins: {
			'no-disable-comments': noDisableCommentsPlugin,
		},
		rules: {
			'no-disable-comments/no-eslint-disable-comments': 'error',
		},
	},
	prettier,
];
