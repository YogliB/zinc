// @ts-check

import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import globals from 'globals';
import rootConfig from '../../eslint.config.mjs';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'coverage/**', '**/*.d.ts.map'],
	},
	includeIgnoreFile(gitignorePath),
	...rootConfig,
	{
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ['src/server.ts'],
		rules: {
			'unicorn/prefer-top-level-await': 'off',
			'unicorn/no-process-exit': 'off',
		},
	},
	{
		settings: {
			'import/core-modules': ['bun:test'],
		},
	},
];
