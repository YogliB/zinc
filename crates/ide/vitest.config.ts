/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config.js';

export default defineConfig(async (configEnv) => {
	const baseConfig = await viteConfig(configEnv);
	return mergeConfig(baseConfig, {
		test: {
			browser: {
				enabled: true,
				headless: true,
				provider: playwright,
				instances: [{ browser: 'chromium' }],
			},
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
