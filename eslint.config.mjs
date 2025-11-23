// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';

export default [
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'**/*.d.ts.map',
			'vitest.config.d.ts',
			'vitest.config.js',
		],
	},
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	sonarjs.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
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
