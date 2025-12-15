import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
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
});
