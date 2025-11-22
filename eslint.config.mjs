import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
	{
		ignores: ['node_modules', 'dist', 'coverage'],
	},
	js.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: ['**/*.js'],
		...tseslint.configs.disableTypeChecked,
	},
	prettier,
];
