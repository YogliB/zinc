import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',

		// Test discovery patterns - simplified for better compatibility
		include: ['**/*.{test,spec}.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],

		// Performance: Parallel execution (Option 1)
		pool: 'forks',
		poolOptions: {
			forks: {
				singleFork: process.env.CI ? true : false,
			},
		},

		// Performance: Within-file concurrent tests (Option 3)
		sequence: {
			concurrent: process.env.CI ? false : true,
			shuffle: false,
		},

		// Environment-specific optimizations (Option 2)
		...(process.env.CI
			? {
					// CI: Sequential execution to prevent file system race conditions
					isolate: true,
					bail: 0,
					fileParallelism: false,
					maxConcurrency: 1,
				}
			: {
					// Dev: Fast feedback with parallel execution
					isolate: false,
					bail: 1,
					watch: true,
					changed: true,
					fileParallelism: true,
					maxConcurrency: 10,
				}),

		// Timeouts
		testTimeout: 5000,
		hookTimeout: 10_000,

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'json-summary'],
			reportOnFailure: true,
			exclude: [
				'node_modules/',
				'src/**/*.spec.ts',
				'src/**/*.test.ts',
				'tests/**',
				'dist/',
				'scripts/',
			],
		},

		// Reporter for performance tracking (CI mode)
		reporters: process.env.CI ? ['default', 'json'] : ['default'],
		outputFile: process.env.CI
			? {
					json: '.vitest/results.json',
				}
			: undefined,

		// Caching for faster re-runs
		cacheDir: '.vitest/cache',
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
