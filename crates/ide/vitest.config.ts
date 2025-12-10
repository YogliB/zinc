/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default defineConfig(async (configEnv) => {
	const baseConfig = await viteConfig(configEnv);
	return mergeConfig(baseConfig, {
		test: {
			browser: {
				enabled: true,
				headless: true,
				provider: 'playwright',
				name: 'chromium',
			},
			environment: 'browser',
			globals: true,
			include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx,svelte}'],
			exclude: [
				'**/node_modules/**',
				'**/dist/**',
				'**/.{idea,git,cache,output,temp}/**',
			],
		},
	});
});
