import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'node:crypto';

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
	endedAt: integer('ended_at', { mode: 'timestamp' }),
	toolCount: integer('tool_count').notNull().default(0),
});

export const toolCalls = sqliteTable(
	'tool_calls',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => randomUUID()),
		toolName: text('tool_name').notNull(),
		durationMs: integer('duration_ms').notNull(),
		status: text('status', {
			enum: ['success', 'error', 'timeout'],
		}).notNull(),
		errorType: text('error_type'),
		timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
		sessionId: text('session_id')
			.notNull()
			.references(() => sessions.id),
	},
	(table) => ({
		toolNameIdx: index('tool_name_idx').on(table.toolName),
		timestampIdx: index('timestamp_idx').on(table.timestamp),
		timestampToolNameIdx: index('timestamp_tool_name_idx').on(
			table.timestamp,
			table.toolName,
		),
	}),
);

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type ToolCall = typeof toolCalls.$inferSelect;
export type NewToolCall = typeof toolCalls.$inferInsert;
