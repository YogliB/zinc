import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest-setup.ts'],
		coverage: {
			enabled: true,
			provider: 'v8',
			reportsDirectory: './coverage',
			reporter: ['text', 'html', 'lcov'],
			include: ['src/**/*.{ts}', 'src/**/*.{svelte}'],
			exclude: [
				'**/*.spec.*',
				'**/*.test.*',
				'.svelte-kit/**',
				'dist/**',
				'node_modules/**',
				'src-tauri/**',
			],
			thresholds: {
				lines: 85,
				statements: 85,
				functions: 80,
				branches: 75,
				perFile: true,
			},
			reportOnFailure: true,
		},
	},
});
