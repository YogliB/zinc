import { describe, it, expect, beforeEach, vi } from 'vitest';
import { wrapToolWithTelemetry } from '../../../src/analytics/tool-wrapper.js';
import type { TelemetryService } from '../../../src/analytics/telemetry.js';
import type { Tool, ToolParameters, FastMCPSessionAuth } from 'fastmcp';

describe('Tool Wrapper Integration', () => {
	let mockTelemetry: TelemetryService;
	let mockRecordToolCall = vi.fn();
	let mockGetCurrentSessionId = vi.fn();
	let originalAddTool: (
		tool: Tool<FastMCPSessionAuth, ToolParameters>,
	) => void;
	let addedTools: Tool<FastMCPSessionAuth, ToolParameters>[] = [];

	beforeEach(() => {
		mockRecordToolCall = vi.fn().mockResolvedValue();
		mockGetCurrentSessionId = vi.fn();
		mockTelemetry = {
			recordToolCall: mockRecordToolCall,
			getCurrentSessionId: mockGetCurrentSessionId,
		} as TelemetryService;

		addedTools = [];
		originalAddTool = (tool: Tool<FastMCPSessionAuth, ToolParameters>) => {
			addedTools.push(tool);
		};
	});

	it('should track successful tool execution accurately', async () => {
		mockGetCurrentSessionId.mockReturnValue('session-123');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const mockExecute = vi.fn().mockResolvedValue('success result');
		wrappedAddTool({
			name: 'test-tool',
			description: 'Test tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		const result = await tool.execute({ param: 'value' });

		expect(result).toBe('success result');
		expect(mockExecute).toHaveBeenCalledWith({ param: 'value' }, undefined);
		expect(mockRecordToolCall).toHaveBeenCalledTimes(1);
		expect(mockRecordToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				toolName: 'test-tool',
				status: 'success',
				sessionId: 'session-123',
				durationMs: expect.any(Number),
			}),
		);
	});

	it('should track failed tool execution with error types', async () => {
		mockGetCurrentSessionId.mockReturnValue('session-456');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const testError = new Error('Test error');
		const mockExecute = vi.fn().mockRejectedValue(testError);
		wrappedAddTool({
			name: 'failing-tool',
			description: 'Failing tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		await expect(tool.execute({})).rejects.toThrow('Test error');
		expect(mockRecordToolCall).toHaveBeenCalledWith(
			expect.objectContaining({
				toolName: 'failing-tool',
				status: 'error',
				errorType: 'Error',
				sessionId: 'session-456',
			}),
		);
	});

	it('should re-throw original error (behavior preservation)', async () => {
		mockGetCurrentSessionId.mockReturnValue('session-789');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const originalError = new TypeError('Original type error');
		const mockExecute = vi.fn().mockRejectedValue(originalError);
		wrappedAddTool({
			name: 'error-tool',
			description: 'Error tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		await expect(tool.execute({})).rejects.toBe(originalError);
	});

	it('should capture session ID from telemetry', async () => {
		const sessionId = 'captured-session-123';
		mockGetCurrentSessionId.mockReturnValue(sessionId);

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const mockExecute = vi.fn().mockResolvedValue('ok');
		wrappedAddTool({
			name: 'session-tool',
			description: 'Session tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		await tool.execute({});
		expect(mockRecordToolCall).toHaveBeenCalledWith(
			expect.objectContaining({ sessionId }),
		);
	});

	it('should measure execution duration accurately (±5ms tolerance)', async () => {
		mockGetCurrentSessionId.mockReturnValue('duration-session');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const mockExecute = vi.fn().mockImplementation(async () => {
			await new Promise((resolve) => setTimeout(resolve, 10)); // 10ms delay
			return 'done';
		});
		wrappedAddTool({
			name: 'duration-tool',
			description: 'Duration tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		await tool.execute({});

		const call = mockRecordToolCall.mock.calls[0][0];
		expect(call.durationMs).toBeGreaterThanOrEqual(5);
		expect(call.durationMs).toBeLessThanOrEqual(20); // Allow some tolerance
	});

	it('should not break tool interface', async () => {
		mockGetCurrentSessionId.mockReturnValue('interface-session');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const mockExecute = vi.fn().mockResolvedValue(42);
		wrappedAddTool({
			name: 'interface-tool',
			description: 'Interface tool',
			parameters: {
				type: 'object',
				properties: { x: { type: 'number' } },
			},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		expect(tool.name).toBe('interface-tool');
		expect(tool.description).toBe('Interface tool');
		expect(tool.parameters).toEqual({
			type: 'object',
			properties: { x: { type: 'number' } },
		});
		expect(typeof tool.execute).toBe('function');

		const result = await tool.execute({ x: 5 });
		expect(result).toBe(42);
		expect(mockExecute).toHaveBeenCalledWith({ x: 5 }, undefined);
	});

	it('should handle multiple concurrent tool calls', async () => {
		mockGetCurrentSessionId.mockReturnValue('concurrent-session');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const mockExecute1 = vi.fn().mockResolvedValue('result1');
		const mockExecute2 = vi.fn().mockResolvedValue('result2');

		wrappedAddTool({
			name: 'tool1',
			description: 'Tool 1',
			parameters: {},
			execute: mockExecute1,
		});
		wrappedAddTool({
			name: 'tool2',
			description: 'Tool 2',
			parameters: {},
			execute: mockExecute2,
		});

		const tool1 = addedTools[0];
		const tool2 = addedTools[1];

		const [result1, result2] = await Promise.all([
			tool1.execute({}),
			tool2.execute({}),
		]);

		expect(result1).toBe('result1');
		expect(result2).toBe('result2');
		expect(mockRecordToolCall).toHaveBeenCalledTimes(2);
	});

	it('should not affect tool return values', async () => {
		mockGetCurrentSessionId.mockReturnValue('return-session');

		const wrappedAddTool = wrapToolWithTelemetry(
			originalAddTool,
			mockTelemetry,
		);

		const complexResult = { data: [1, 2, 3], meta: { count: 3 } };
		const mockExecute = vi.fn().mockResolvedValue(complexResult);
		wrappedAddTool({
			name: 'return-tool',
			description: 'Return tool',
			parameters: {},
			execute: mockExecute,
		});

		const tool = addedTools[0];
		const result = await tool.execute({});

		expect(result).toEqual(complexResult);
		expect(result).toBe(complexResult); // Same reference
	});
});
