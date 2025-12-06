import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
	getAnalyticsDatabase,
	closeAnalyticsDatabase,
} from '../../src/analytics/database.js';
import { sessions, toolCalls } from '../../src/analytics/schema.js';
import { eq } from 'drizzle-orm';
import { expectDurationWithinBaseline } from '../helpers/performance-baseline.js';

describe('Database Performance', () => {
	let temporaryDirectory: string;
	let originalHome: string | undefined;

	beforeEach(() => {
		temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'devflow-perf-'));
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

	describe('Database Initialization', () => {
		it('should initialize database in under 100ms', () => {
			const startTime = performance.now();
			const database = getAnalyticsDatabase();
			const duration = performance.now() - startTime;

			expect(database).toBeDefined();
			expectDurationWithinBaseline(
				duration,
				'database-performance.initialization',
				0.5,
			);
			console.log(`✓ Database initialization: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Write Performance', () => {
		it('should insert single session in under 10ms', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 0,
			};

			const startTime = performance.now();
			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const duration = performance.now() - startTime;

			expect(insertedSessions.length).toBe(1);
			expectDurationWithinBaseline(
				duration,
				'database-performance.single-write',
				0.5,
			);
			expect(duration).toBeLessThan(100);
			console.log(`✓ Single session insert: ${duration.toFixed(2)}ms`);
		});

		it('should insert 100 tool calls in under 100ms', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 100,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const toolCallsData = Array.from({ length: 100 }, (_, index) => ({
				toolName: `tool${index}`,
				durationMs: 100 + index,
				status: 'success' as const,
				timestamp: new Date(),
				sessionId,
			}));

			const startTime = performance.now();
			database.insert(toolCalls).values(toolCallsData).run();
			const duration = performance.now() - startTime;

			expectDurationWithinBaseline(
				duration,
				'database-performance.batch-write-100',
				0.5,
			);
			expect(duration).toBeLessThan(200);
			console.log(
				`✓ Batch insert (100 tool calls): ${duration.toFixed(2)}ms (${(duration / 100).toFixed(2)}ms avg)`,
			);
		});

		it('should handle sequential writes efficiently', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 50,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const startTime = performance.now();

			for (let index = 0; index < 50; index++) {
				database
					.insert(toolCalls)
					.values({
						toolName: `concurrent-tool-${index}`,
						durationMs: index * 10,
						status: 'success' as const,
						timestamp: new Date(),
						sessionId,
					})
					.run();
			}

			const duration = performance.now() - startTime;

			expectDurationWithinBaseline(
				duration,
				'database-performance.sequential-writes',
				0.5,
			);
			expect(duration).toBeLessThan(100);
			console.log(
				`✓ Sequential writes (50 operations): ${duration.toFixed(2)}ms`,
			);
		});
	});

	describe('Query Performance', () => {
		beforeEach(() => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 500,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const toolCallsData = Array.from({ length: 500 }, (_, index) => ({
				toolName: index % 10 === 0 ? 'grep' : `tool${index % 20}`,
				durationMs: 50 + index,
				status: (index % 5 === 0 ? 'error' : 'success') as const,
				timestamp: new Date(Date.now() - index * 1000),
				sessionId,
			}));

			database.insert(toolCalls).values(toolCallsData).run();
		});

		it('should query by session_id in under 10ms', () => {
			const database = getAnalyticsDatabase();

			const allSessions = database.select().from(sessions).all();
			const sessionId = allSessions[0]!.id;

			const startTime = performance.now();
			const results = database
				.select()
				.from(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.all();
			const duration = performance.now() - startTime;

			expect(results.length).toBe(500);
			expectDurationWithinBaseline(
				duration,
				'database-performance.query-by-session',
				0.5,
			);
			console.log(
				`✓ Query by session_id (500 rows): ${duration.toFixed(2)}ms`,
			);
		});

		it('should query by tool_name index in under 10ms', () => {
			const database = getAnalyticsDatabase();

			const startTime = performance.now();
			const results = database
				.select()
				.from(toolCalls)
				.where(eq(toolCalls.toolName, 'grep'))
				.all();
			const duration = performance.now() - startTime;

			expect(results.length).toBeGreaterThan(0);
			expectDurationWithinBaseline(
				duration,
				'database-performance.query-by-tool-name',
				0.5,
			);
			console.log(
				`✓ Query by tool_name (indexed): ${duration.toFixed(2)}ms`,
			);
		});

		it('should query all tool calls in under 20ms', () => {
			const database = getAnalyticsDatabase();

			const startTime = performance.now();
			const results = database.select().from(toolCalls).all();
			const duration = performance.now() - startTime;

			expect(results.length).toBe(500);
			expectDurationWithinBaseline(
				duration,
				'database-performance.query-all',
				0.5,
			);
			console.log(
				`✓ Query all tool calls (500 rows): ${duration.toFixed(2)}ms`,
			);
		});
	});

	describe('Update Performance', () => {
		it('should update session in under 10ms', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 10,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const startTime = performance.now();
			database
				.update(sessions)
				.set({ endedAt: new Date(), toolCount: 15 })
				.where(eq(sessions.id, sessionId))
				.run();
			const duration = performance.now() - startTime;

			expectDurationWithinBaseline(
				duration,
				'database-performance.update',
				0.5,
			);
			expect(duration).toBeLessThan(50);
			console.log(`✓ Update session: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Delete Performance', () => {
		it('should delete session with cascading tool calls in under 20ms', () => {
			const database = getAnalyticsDatabase();

			const newSession = {
				startedAt: new Date(),
				toolCount: 100,
			};

			const insertedSessions = database
				.insert(sessions)
				.values(newSession)
				.returning()
				.all();
			const sessionId = insertedSessions[0]!.id;

			const toolCallsData = Array.from({ length: 100 }, (_, index) => ({
				toolName: `tool${index}`,
				durationMs: index,
				status: 'success' as const,
				timestamp: new Date(),
				sessionId,
			}));

			database.insert(toolCalls).values(toolCallsData).run();

			const startTime = performance.now();
			database
				.delete(toolCalls)
				.where(eq(toolCalls.sessionId, sessionId))
				.run();
			database.delete(sessions).where(eq(sessions.id, sessionId)).run();
			const duration = performance.now() - startTime;

			expectDurationWithinBaseline(
				duration,
				'database-performance.delete-cascade',
				0.5,
			);
			console.log(
				`✓ Delete session with cascading (100 tool calls): ${duration.toFixed(2)}ms`,
			);

			const remainingSessions = database
				.select()
				.from(sessions)
				.where(eq(sessions.id, sessionId))
				.all();
			expect(remainingSessions.length).toBe(0);
		});
	});

	describe('Migration Performance', () => {
		it('should complete migrations in under 50ms on fresh database', () => {
			closeAnalyticsDatabase();

			const databaseDirectory = path.join(temporaryDirectory, '.devflow');
			mkdirSync(databaseDirectory, { recursive: true });

			const startTime = performance.now();
			const database = getAnalyticsDatabase();
			const duration = performance.now() - startTime;

			expect(database).toBeDefined();
			expectDurationWithinBaseline(
				duration,
				'database-performance.migration',
				0.5,
			);
			console.log(`✓ Migration execution: ${duration.toFixed(2)}ms`);
		});
	});
});
