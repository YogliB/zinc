// @ts-check

import eslint from '@eslint/js';
import { configs as tsConfigs } from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import security from 'eslint-plugin-security';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';

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
	prettier,
];
