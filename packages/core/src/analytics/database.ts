import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import * as schema from './schema.js';

export type AnalyticsDatabase = ReturnType<typeof createAnalyticsDatabase>;

export const createAnalyticsDatabase = () => {
	const homeDirectory = process.env.HOME || homedir();
	const devflowDirectory = path.join(homeDirectory, '.devflow');
	const databasePath = path.join(devflowDirectory, 'analytics.db');

	if (!existsSync(devflowDirectory)) {
		mkdirSync(devflowDirectory, { recursive: true });
	}

	const sqlite = new Database(databasePath);

	sqlite.exec('PRAGMA journal_mode = WAL;');

	const database = drizzle(sqlite, { schema });

	migrate(database, {
		migrationsFolder: path.join(import.meta.dir, 'migrations'),
	});

	return database;
};
