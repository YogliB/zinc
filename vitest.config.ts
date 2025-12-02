import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		bail: 0,
		pool: 'threads',
		poolOptions: {
			threads: {
				singleThread: false,
			},
		},
		isolate: true,
		fileParallelism: true,
		dir: '.',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			reportsDirectory: './coverage',
			include: ['src/**/*.ts'],
			exclude: [
				'node_modules/**',
				'dist/**',
				'scripts/**',
				'src/**/index.ts',
				'**/*.spec.ts',
				'**/*.test.ts',
				'tests/**',
				'src/server.ts',
				'src/mcp/tools/**',
				'src/core/analysis/plugins/typescript.ts',
			],
			thresholds: {
				perFile: true,
				lines: 0.7,
				functions: 0.75,
				statements: 0.7,
				branches: 0.65,
			},
			reportOnFailure: true,
		},
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
	},
});
