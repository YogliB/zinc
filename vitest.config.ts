import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts', 'src/**/*.tsx'],
      'thresholds': {
        'perFile':  true,
        'statements': 60,
        'branches':60,
        'functions': 50,
        'lines': 60,
      }																												                  'lines': 80
		},
	},
});
