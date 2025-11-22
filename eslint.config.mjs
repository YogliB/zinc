// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
	eslint.configs.recommended,
	tseslint.configs.recommended,
	sonarjs.configs.recommended,
	prettier,
];
