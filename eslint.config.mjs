// @ts-check

import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
// import preact from 'eslint-config-preact';
import storybook from 'eslint-plugin-storybook';
import unicorn from 'eslint-plugin-unicorn';

export default defineConfig([
	globalIgnores([
		'dist/',
		'src-tauri/',
		'eslint.config.mjs',
		'vite.config.ts',
		'vitest.config.ts',
	]),
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	sonarjs.configs.recommended,
	unicorn.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	// ...preact,
	...storybook.configs['flat/recommended'],
	prettier,
	{
		settings: {
			'import/resolver': {
				typescript: true,
				node: true,
			},
		},
	},
]);
