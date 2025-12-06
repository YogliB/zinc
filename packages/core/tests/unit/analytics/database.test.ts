import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
	getAnalyticsDatabase,
	closeAnalyticsDatabase,
} from '../../../src/analytics/database.js';
import { sessions, toolCalls } from '../../../src/analytics/schema.js';
import { eq } from 'drizzle-orm';

describe('Analytics Database', () => {
	let temporaryDirectory: string;
	let originalHome: string | undefined;

	beforeEach(() => {
		temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'devflow-test-'));
		originalHome = process.env.HOME;
		process.env.HOME = temporaryDirectory;
	});

	afterEach(() => {
		closeAnalyticsDatabase();
		process.env.HOME = originalHome;
		if (temporaryDirectory) {
			rmSync(temporaryDirectory, { recursive: true, force: true });
		}
	});

	describe('Lazy Initialization', () => {
		test('does not create database on module import', () => {
			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			expect(existsSync(databasePath)).toBe(false);
		});

		test('creates database on first getAnalyticsDatabase call', () => {
			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);

			expect(existsSync(databasePath)).toBe(false);

			const database = getAnalyticsDatabase();
			expect(database).toBeDefined();

			expect(existsSync(databasePath)).toBe(true);
			const stats = statSync(databasePath);
			expect(stats.size).toBeGreaterThan(0);
		});

		test('returns same instance on multiple calls', () => {
			const database1 = getAnalyticsDatabase();
			const database2 = getAnalyticsDatabase();
			expect(database1).toBeDefined();
			expect(database2).toBeDefined();
			expect(database1).toBe(database2);
		});

		test('creates new instance after closeAnalyticsDatabase', () => {
			const database1 = getAnalyticsDatabase();
			expect(database1).toBeDefined();
			closeAnalyticsDatabase();
			const database2 = getAnalyticsDatabase();
			expect(database2).toBeDefined();
		});
	});

	describe('Database Creation', () => {
		test('creates database file in home directory', () => {
			const database = getAnalyticsDatabase();
			expect(database).toBeDefined();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			expect(existsSync(databasePath)).toBe(true);
			const stats = statSync(databasePath);
			expect(stats.size).toBeGreaterThan(0);
		});

		test("creates .devflow directory if it doesn't exist", () => {
			getAnalyticsDatabase();

			const devflowDirectory = path.join(temporaryDirectory, '.devflow');
			expect(existsSync(devflowDirectory)).toBe(true);
		});

		test('reuses existing .devflow directory', () => {
			const devflowDirectory = path.join(temporaryDirectory, '.devflow');
			mkdirSync(devflowDirectory, { recursive: true });

			const database = getAnalyticsDatabase();
			expect(database).toBeDefined();

			const databasePath = path.join(devflowDirectory, 'analytics.db');
			expect(existsSync(databasePath)).toBe(true);
			const stats = statSync(databasePath);
			expect(stats.size).toBeGreaterThan(0);
		});
	});

	describe('WAL Mode', () => {
		test('enables WAL journal mode', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const result = sqlite.prepare('PRAGMA journal_mode;').get() as {
				journal_mode: string;
			};

			expect(result.journal_mode.toLowerCase()).toBe('wal');
			sqlite.close();
		});
	});

	describe('Migrations', () => {
		test('runs migrations successfully', () => {
			const database = getAnalyticsDatabase();
			expect(database).toBeDefined();
		});

		test('creates migration metadata table', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const tables = sqlite
				.prepare(
					"SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations';",
				)
				.all() as Array<{ name: string }>;

			expect(tables.length).toBe(1);
			expect(tables[0]?.name).toBe('__drizzle_migrations');
			sqlite.close();
		});
	});

	describe('Schema Validation', () => {
		test('creates sessions table with correct columns', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const columns = sqlite
				.prepare('PRAGMA table_info(sessions);')
				.all() as Array<{
				name: string;
				type: string;
				notnull: number;
			}>;

			expect(columns.length).toBe(4);
			expect(columns.map((c) => c.name)).toEqual([
				'id',
				'started_at',
				'ended_at',
				'tool_count',
			]);

			const idColumn = columns.find((c) => c.name === 'id');
			expect(idColumn?.type.toLowerCase()).toBe('text');
			expect(idColumn?.notnull).toBe(1);

			sqlite.close();
		});

		test('creates tool_calls table with correct columns', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const columns = sqlite
				.prepare('PRAGMA table_info(tool_calls);')
				.all() as Array<{
				name: string;
				type: string;
				notnull: number;
			}>;

			expect(columns.length).toBe(7);
			expect(columns.map((c) => c.name)).toEqual([
				'id',
				'tool_name',
				'duration_ms',
				'status',
				'error_type',
				'timestamp',
				'session_id',
			]);

			sqlite.close();
		});

		test('creates indexes on tool_calls table', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const indexes = sqlite
				.prepare(
					"SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='tool_calls';",
				)
				.all() as Array<{ name: string }>;

			const indexNames = indexes.map((index) => index.name);
			expect(indexNames).toContain('tool_name_idx');
			expect(indexNames).toContain('timestamp_idx');
			expect(indexNames).toContain('timestamp_tool_name_idx');

			sqlite.close();
		});

		test('enforces foreign key constraint on sessionId', () => {
			getAnalyticsDatabase();

			const databasePath = path.join(
				temporaryDirectory,
				'.devflow',
				'analytics.db',
			);
			const sqlite = new Database(databasePath);

			const foreignKeys = sqlite
				.prepare('PRAGMA foreign_key_list(tool_calls);')
				.all() as Array<{ table: string; from: string; to: string }>;

			expect(foreignKeys.length).toBe(1);
			expect(foreignKeys[0]?.table).toBe('sessions');
			expect(foreignKeys[0]?.from).toBe('session_id');
			expect(foreignKeys[0]?.to).toBe('id');

			sqlite.close();
		});
	});

	describe('CRUD Operations', () => {
		test('inserts and selects session record', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 0,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			expect(insertedSessions.length).toBe(1);

			const sessionId = insertedSessions[0]?.id;
			expect(sessionId).toBeDefined();

			const selectedSessions = database
				.select()
				.from(sessions)
				.where(eq(sessions.id, sessionId!))
				.all();

			expect(selectedSessions.length).toBe(1);
			expect(selectedSessions[0]?.toolCount).toBe(0);
			expect(selectedSessions[0]?.endedAt).toBeNull();
		});

		test('inserts toolCall with foreign key reference', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 1,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const newToolCall = {
				toolName: 'grep',
				durationMs: 123,
				status: 'success' as const,
				timestamp: new Date(),
				sessionId,
			};

			const insertedToolCalls = database
				.insert(toolCalls)
				.values(newToolCall)
				.returning()
				.all();
			expect(insertedToolCalls.length).toBe(1);
			expect(insertedToolCalls[0]?.toolName).toBe('grep');
			expect(insertedToolCalls[0]?.sessionId).toBe(sessionId);
		});

		test('updates session endedAt timestamp', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 0,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const endTime = new Date();
			database
				.update(sessions)
				.set({ endedAt: endTime })
				.where(eq(sessions.id, sessionId))
				.run();

			const updatedSessions = database
				.select()
				.from(sessions)
				.where(eq(sessions.id, sessionId))
				.all();

			expect(updatedSessions[0]?.endedAt?.getTime()).toBe(
				Math.floor(endTime.getTime() / 1000) * 1000,
			);
		});

		test('deletes session and related tool calls', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 1,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const newToolCall = {
				toolName: 'read_file',
				durationMs: 456,
				status: 'success' as const,
				timestamp: new Date(),
				sessionId,
			};

			database.insert(toolCalls).values(newToolCall).run();

			database
				.delete(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.run();
			database.delete(sessions).where(eq(sessions.id, sessionId)).run();

			const deletedSessions = database
				.select()
				.from(sessions)
				.where(eq(sessions.id, sessionId))
				.all();
			expect(deletedSessions.length).toBe(0);

			const deletedToolCalls = database
				.select()
				.from(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.all();
			expect(deletedToolCalls.length).toBe(0);
		});

		test('inserts multiple tool calls for same session', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 3,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const toolCallsData = [
				{
					toolName: 'grep',
					durationMs: 100,
					status: 'success' as const,
					timestamp: new Date(),
					sessionId,
				},
				{
					toolName: 'read_file',
					durationMs: 200,
					status: 'success' as const,
					timestamp: new Date(),
					sessionId,
				},
				{
					toolName: 'edit_file',
					durationMs: 300,
					status: 'error' as const,
					errorType: 'permission_denied',
					timestamp: new Date(),
					sessionId,
				},
			];

			database.insert(toolCalls).values(toolCallsData).run();

			const allToolCalls = database
				.select()
				.from(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.all();

			expect(allToolCalls.length).toBe(3);
			expect(allToolCalls.map((tc) => tc.toolName)).toEqual([
				'grep',
				'read_file',
				'edit_file',
			]);
		});

		test('queries tool calls by timestamp index', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 2,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const timestamp1 = new Date(Date.now() - 1000);
			const timestamp2 = new Date();

			database
				.insert(toolCalls)
				.values([
					{
						toolName: 'grep',
						durationMs: 100,
						status: 'success' as const,
						timestamp: timestamp1,
						sessionId,
					},
					{
						toolName: 'read_file',
						durationMs: 200,
						status: 'success' as const,
						timestamp: timestamp2,
						sessionId,
					},
				])
				.run();

			const results = database
				.select()
				.from(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.all();

			expect(results.length).toBe(2);
		});

		test('handles error status and error type correctly', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 1,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const errorToolCall = {
				toolName: 'terminal',
				durationMs: 5000,
				status: 'timeout' as const,
				errorType: 'execution_timeout',
				timestamp: new Date(),
				sessionId,
			};

			const insertedToolCalls = database
				.insert(toolCalls)
				.values(errorToolCall)
				.returning()
				.all();

			expect(insertedToolCalls[0]?.status).toBe('timeout');
			expect(insertedToolCalls[0]?.errorType).toBe('execution_timeout');
		});
	});
});
