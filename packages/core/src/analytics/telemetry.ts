import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import type { AnalyticsDatabase } from './database.js';

import { sessions, toolCalls, type NewToolCall } from './schema.js';

export interface ToolCallMetadata {
	toolName: string;
	durationMs: number;
	status: 'success' | 'error' | 'timeout';
	errorType?: string;
	sessionId: string;
}

export class TelemetryService {
	private db: AnalyticsDatabase;
	private config: { batchSize: number; flushIntervalMs: number };
	private queue: NewToolCall[] = [];
	private flushTimer: ReturnType<typeof setTimeout> | undefined = undefined;
	private sessionToolCounts: Map<string, number> = new Map();

	constructor(
		database: AnalyticsDatabase,
		config: Partial<{ batchSize: number; flushIntervalMs: number }> = {},
	) {
		this.db = database;
		this.config = { batchSize: 50, flushIntervalMs: 5000, ...config };
	}

	async recordToolCall(metadata: ToolCallMetadata): Promise<void> {
		const toolCall: NewToolCall = {
			id: randomUUID(),
			toolName: metadata.toolName,
			durationMs: metadata.durationMs,
			status: metadata.status,
			errorType: metadata.errorType,
			timestamp: new Date(),
			sessionId: metadata.sessionId,
		};
		this.queue.push(toolCall);
		this.sessionToolCounts.set(
			metadata.sessionId,
			(this.sessionToolCounts.get(metadata.sessionId) || 0) + 1,
		);
		if (this.queue.length >= this.config.batchSize) {
			await this.flush();
		} else if (!this.flushTimer) {
			this.flushTimer = setTimeout(
				() => this.flush(),
				this.config.flushIntervalMs,
			);
		}
	}

	async startSession(sessionId: string): Promise<void> {
		try {
			await this.db.insert(sessions).values({
				id: sessionId,
				startedAt: new Date(),
				toolCount: 0,
			});
			console.log(`Session ${sessionId} started`);
		} catch (error) {
			console.error(`Failed to start session ${sessionId}:`, error);
		}
	}

	async endSession(sessionId: string): Promise<void> {
		try {
			const toolCount = this.sessionToolCounts.get(sessionId) || 0;
			await this.db
				.update(sessions)
				.set({
					endedAt: new Date(),
					toolCount,
				})
				.where(eq(sessions.id, sessionId));
			this.sessionToolCounts.delete(sessionId);
			console.log(
				`Session ${sessionId} ended with ${toolCount} tool calls`,
			);
		} catch (error) {
			console.error(`Failed to end session ${sessionId}:`, error);
		}
	}

	async flush(): Promise<void> {
		if (this.queue.length === 0) return;
		const batch = [...this.queue];
		this.queue = [];
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = undefined;
		}
		try {
			await this.db.insert(toolCalls).values(batch);
			console.log(`Flushed ${batch.length} tool calls`);
		} catch (error) {
			console.error('Failed to flush tool calls:', error);
			// Re-queue the batch on failure to avoid data loss
			this.queue.unshift(...batch);
		}
	}

	async shutdown(): Promise<void> {
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = undefined;
		}
		await this.flush();
		console.log('TelemetryService shutdown');
	}
}
