import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		setupFiles: ['src/test-setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts', 'src/**/*.tsx'],
			thresholds: {
				perFile: true,
				statements: 60,
				branches: 60,
				functions: 50,
				lines: 80,
			},
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(
				path.dirname(fileURLToPath(import.meta.url)),
				'./src',
			),
		},
	},
});
