// @ts-check

import eslint from '@eslint/js';
import { configs as tsConfigs } from 'typescript-eslint';
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
	...tsConfigs.recommended,
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
