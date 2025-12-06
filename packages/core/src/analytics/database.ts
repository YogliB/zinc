import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema.js';

export type AnalyticsDatabase = ReturnType<typeof createAnalyticsDatabase>;

let databaseInstance: AnalyticsDatabase | undefined;

/**
 * Creates a new analytics database instance.
 * This function handles directory creation, SQLite connection setup,
 * WAL mode configuration, and migrations.
 *
 * @internal This is a private implementation detail. Use getAnalyticsDatabase() instead.
 * @returns A Drizzle ORM database instance configured for analytics
 */
const createAnalyticsDatabase = () => {
	const homeDirectory = process.env.HOME || homedir();
	const devflowDirectory = path.join(homeDirectory, '.devflow');
	const databasePath = path.join(devflowDirectory, 'analytics.db');

	if (!existsSync(devflowDirectory)) {
		mkdirSync(devflowDirectory, { recursive: true });
	}

	const sqlite = new Database(databasePath);

	sqlite.exec('PRAGMA journal_mode = WAL;');

	const database = drizzle(sqlite, { schema });

	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	migrate(database, {
		migrationsFolder: path.join(currentDirectory, 'migrations'),
	});

	return database;
};

/**
 * Gets the analytics database instance, creating it lazily on first access.
 *
 * Uses a singleton pattern to ensure only one database connection exists.
 * The database is NOT created on module import - only when this function
 * is first called. This eliminates initialization overhead in performance
 * tests and other code paths that don't require analytics.
 *
 * Thread-safety: Bun is single-threaded, so no locking is required.
 *
 * @returns The shared analytics database instance
 *
 * @example
 * ```ts
 * import { getAnalyticsDatabase } from './analytics/database';
 *
 * const db = getAnalyticsDatabase();
 * db.insert(sessions).values({ startedAt: new Date(), toolCount: 0 });
 * ```
 */
export const getAnalyticsDatabase = (): AnalyticsDatabase => {
	if (!databaseInstance) {
		databaseInstance = createAnalyticsDatabase();
	}
	return databaseInstance;
};

/**
 * Closes and resets the analytics database instance.
 *
 * This function is primarily intended for testing purposes, allowing
 * tests to clean up the singleton state between test runs.
 *
 * Note: This does NOT close the underlying SQLite connection - it only
 * resets the module-level reference. The next call to getAnalyticsDatabase()
 * will create a new instance.
 *
 * @example
 * ```ts
 * import { closeAnalyticsDatabase } from './analytics/database';
 *
 * afterEach(() => {
 *   closeAnalyticsDatabase();
 * });
 * ```
 */
export const closeAnalyticsDatabase = (): void => {
	databaseInstance = undefined;
};
