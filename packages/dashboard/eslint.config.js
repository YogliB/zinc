import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import { configs as storybookConfigs } from 'eslint-plugin-storybook';
import rootConfig from '../../eslint.config.mjs';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [
	{
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'**/*.d.ts.map',
			'.svelte-kit/**',
			'build/**'
		]
	},
	includeIgnoreFile(gitignorePath),
	...rootConfig,
	...svelte.configs.recommended,
	...svelte.configs.prettier,
	...storybookConfigs['flat/recommended'],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
];
