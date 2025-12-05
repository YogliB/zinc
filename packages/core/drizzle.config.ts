import { defineConfig } from 'drizzle-kit';
import { homedir } from 'node:os';
import path from 'node:path';

export default defineConfig({
	schema: './src/analytics/schema.ts',
	out: './src/analytics/migrations',
	dialect: 'sqlite',
	dbCredentials: {
		url: path.join(homedir(), '.devflow', 'analytics.db'),
	},
});
