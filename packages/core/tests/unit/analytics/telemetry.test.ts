import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
	TelemetryService,
	type ToolCallMetadata,
} from '../../../src/analytics/telemetry.js';
import { sessions, toolCalls } from '../../../src/analytics/schema.js';

describe('TelemetryService', () => {
	let mockDatabase: {
		insert: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
	};
	let service: TelemetryService;
	let setTimeoutSpy: ReturnType<typeof vi.fn>;
	let clearTimeoutSpy: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		setTimeoutSpy = vi.fn(() => 123); // Return a fake timer ID
		clearTimeoutSpy = vi.fn();
		vi.spyOn(globalThis, 'setTimeout').mockImplementation(setTimeoutSpy);
		vi.spyOn(globalThis, 'clearTimeout').mockImplementation(
			clearTimeoutSpy,
		);
		mockDatabase = {
			insert: vi.fn().mockReturnValue({
				values: vi.fn().mockReturnValue({
					run: vi.fn(),
					returning: vi.fn().mockReturnValue({
						all: vi.fn().mockReturnValue([]),
					}),
				}),
			}),
			update: vi.fn().mockReturnValue({
				set: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						run: vi.fn(),
					}),
				}),
			}),
		};
		service = new TelemetryService(mockDatabase);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('recordToolCall', () => {
		test('stores single tool call correctly', async () => {
			const metadata: ToolCallMetadata = {
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			};

			await service.recordToolCall(metadata);

			expect(mockDatabase.insert).not.toHaveBeenCalled();

			await service.flush();

			expect(mockDatabase.insert).toHaveBeenCalledWith(toolCalls);
			const insertCall = mockDatabase.insert.mock.calls[0][0];
			expect(insertCall).toBe(toolCalls);
			const valuesCall = mockDatabase.insert.mock.results[0].value.values;
			expect(valuesCall).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						toolName: 'grep',
						durationMs: 100,
						status: 'success',
						sessionId: 'session-1',
						timestamp: expect.any(Date),
						id: expect.any(String),
					}),
				]),
			);
		});

		test('batches up to 50 records before flushing', async () => {
			const metadata: ToolCallMetadata = {
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			};

			for (let index = 0; index < 49; index++) {
				await service.recordToolCall(metadata);
			}

			expect(mockDatabase.insert).not.toHaveBeenCalled();

			await service.recordToolCall(metadata); // 50th

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
		});

		test('flushes automatically after 5 seconds', async () => {
			const metadata: ToolCallMetadata = {
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			};

			await service.recordToolCall(metadata);

			expect(mockDatabase.insert).not.toHaveBeenCalled();
			expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

			// Manually call the timeout callback
			const callback = setTimeoutSpy.mock.calls[0][0];
			await callback();

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
		});

		test('handles error status with errorType', async () => {
			const metadata: ToolCallMetadata = {
				toolName: 'terminal',
				durationMs: 5000,
				status: 'error',
				errorType: 'permission_denied',
				sessionId: 'session-1',
			};

			await service.recordToolCall(metadata);
			await service.flush();

			const valuesCall = mockDatabase.insert.mock.results[0].value.values;
			expect(valuesCall).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({
						status: 'error',
						errorType: 'permission_denied',
					}),
				]),
			);
		});
	});

	describe('startSession', () => {
		test('inserts session with correct data', async () => {
			const sessionId = 'session-123';

			await service.startSession(sessionId);

			expect(mockDatabase.insert).toHaveBeenCalledWith(sessions);
			const valuesCall = mockDatabase.insert.mock.results[0].value.values;
			expect(valuesCall).toHaveBeenCalledWith(
				expect.objectContaining({
					id: sessionId,
					startedAt: expect.any(Date),
					toolCount: 0,
				}),
			);
		});

		test('handles database errors gracefully', async () => {
			mockDatabase.insert.mockImplementation(() => {
				throw new Error('Database error');
			});

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await service.startSession('session-1');

			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to start session session-1:',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});
	});

	describe('endSession', () => {
		test('updates session with endedAt and toolCount', async () => {
			const sessionId = 'session-123';

			await service.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId,
			});
			await service.recordToolCall({
				toolName: 'read_file',
				durationMs: 200,
				status: 'success',
				sessionId,
			});

			await service.endSession(sessionId);

			expect(mockDatabase.update).toHaveBeenCalledWith(sessions);
			const setCall = mockDatabase.update.mock.results[0].value.set;
			expect(setCall).toHaveBeenCalledWith(
				expect.objectContaining({
					endedAt: expect.any(Date),
					toolCount: 2,
				}),
			);
			const whereCall =
				mockDatabase.update.mock.results[0].value.set.mock.results[0]
					.value.where;
			expect(whereCall).toHaveBeenCalled();
		});

		test('handles database errors gracefully', async () => {
			mockDatabase.update.mockImplementation(() => {
				throw new Error('Database error');
			});

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await service.endSession('session-1');

			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to end session session-1:',
				expect.any(Error),
			);

			consoleSpy.mockRestore();
		});
	});

	describe('flush', () => {
		test('does nothing if queue is empty', async () => {
			await service.flush();

			expect(mockDatabase.insert).not.toHaveBeenCalled();
		});

		test('inserts all queued tool calls', async () => {
			const metadata1: ToolCallMetadata = {
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			};
			const metadata2: ToolCallMetadata = {
				toolName: 'read_file',
				durationMs: 200,
				status: 'success',
				sessionId: 'session-1',
			};

			await service.recordToolCall(metadata1);
			await service.recordToolCall(metadata2);
			await service.flush();

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
			const valuesCall = mockDatabase.insert.mock.results[0].value.values;
			expect(valuesCall).toHaveBeenCalledWith(
				expect.arrayContaining([
					expect.objectContaining({ toolName: 'grep' }),
					expect.objectContaining({ toolName: 'read_file' }),
				]),
			);
		});

		test('clears timer after manual flush', async () => {
			await service.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			});

			expect(service['flushTimer']).not.toBeUndefined();

			await service.flush();

			expect(service['flushTimer']).toBeUndefined();
		});

		test('re-queues batch on database error', async () => {
			mockDatabase.insert.mockImplementation(() => {
				throw new Error('Insert failed');
			});

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});

			await service.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			});
			await service.flush();

			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to flush tool calls:',
				expect.any(Error),
			);

			// Queue should still have the item
			expect(service['queue'].length).toBe(1);

			consoleSpy.mockRestore();
		});
	});

	describe('shutdown', () => {
		test('flushes pending records and clears timer', async () => {
			await service.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			});

			await service.shutdown();

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
			expect(service['flushTimer']).toBeUndefined();
		});

		test('handles flush errors gracefully', async () => {
			mockDatabase.insert.mockImplementation(() => {
				throw new Error('Flush failed');
			});

			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const consoleLogSpy = vi
				.spyOn(console, 'log')
				.mockImplementation(() => {});

			await service.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			});

			await service.shutdown();

			expect(consoleLogSpy).toHaveBeenCalledWith(
				'TelemetryService shutdown',
			);

			consoleSpy.mockRestore();
			consoleLogSpy.mockRestore();
		});
	});

	describe('concurrent operations', () => {
		test('handles multiple recordToolCall calls without corruption', async () => {
			const promises = [];
			for (let index = 0; index < 10; index++) {
				promises.push(
					service.recordToolCall({
						toolName: `tool-${index}`,
						durationMs: 100 + index,
						status: 'success',
						sessionId: 'session-1',
					}),
				);
			}

			await Promise.all(promises);
			await service.flush();

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
			const valuesCall = mockDatabase.insert.mock.results[0].value.values;
			const insertedCalls = valuesCall.mock.calls[0][0];
			expect(insertedCalls.length).toBe(10);
		});
	});

	describe('configuration', () => {
		test('uses custom batch size', async () => {
			const customService = new TelemetryService(mockDatabase, {
				batchSize: 5,
			});

			for (let index = 0; index < 4; index++) {
				await customService.recordToolCall({
					toolName: 'grep',
					durationMs: 100,
					status: 'success',
					sessionId: 'session-1',
				});
			}

			expect(mockDatabase.insert).not.toHaveBeenCalled();

			await customService.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			}); // 5th

			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
		});

		test('uses custom flush interval', async () => {
			const customSetTimeoutSpy = vi.fn();
			vi.stubGlobal('setTimeout', customSetTimeoutSpy);
			const customService = new TelemetryService(mockDatabase, {
				flushIntervalMs: 1000,
			});

			await customService.recordToolCall({
				toolName: 'grep',
				durationMs: 100,
				status: 'success',
				sessionId: 'session-1',
			});

			expect(customSetTimeoutSpy).toHaveBeenCalledWith(
				expect.any(Function),
				1000,
			);
			expect(mockDatabase.insert).not.toHaveBeenCalled();

			// Manually call the timeout callback
			const callback = customSetTimeoutSpy.mock.calls[0][0];
			await callback();
			expect(mockDatabase.insert).toHaveBeenCalledTimes(1);
		});
	});
});
