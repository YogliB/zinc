// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import importPlugin from 'eslint-plugin-import';
import preact from 'eslint-config-preact';
import storybook from 'eslint-plugin-storybook';

export default defineConfig(
	{
		ignores: [
			'eslint.config.mjs',
			'vite.config.ts',
			'vitest.config.ts',
			'**/.storybook/**',
			'src-tauri/**',
		],
	},
	eslint.configs.recommended,
	tseslint.configs.strict,
	tseslint.configs.stylistic,
	sonarjs.configs.recommended,
	importPlugin.flatConfigs.recommended,
	importPlugin.flatConfigs.typescript,
	...preact,
	...storybook.configs['flat/recommended'],
	prettier,
);
