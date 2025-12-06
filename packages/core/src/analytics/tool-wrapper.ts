import type { TelemetryService } from './telemetry.js';
import type { Tool } from 'fastmcp';

type AddToolFunction<ToolType> = (tool: ToolType) => void;

const recordCall = (
	telemetry: TelemetryService,
	metadata: Parameters<TelemetryService['recordToolCall']>[0],
) => {
	telemetry.recordToolCall(metadata).catch((error) => {
		console.error('Failed to record tool telemetry:', error);
	});
};

export function wrapToolWithTelemetry<ToolType extends Tool<unknown, unknown>>(
	originalAddTool: AddToolFunction<ToolType>,
	telemetry: TelemetryService,
): AddToolFunction<ToolType> {
	return (tool: ToolType) => {
		const wrappedExecute = async (
			arguments_: Parameters<ToolType['execute']>[0],
			context: Parameters<ToolType['execute']>[1],
		) => {
			const startTime = performance.now();
			const sessionId = telemetry.getCurrentSessionId();

			if (!sessionId) {
				console.warn('No active session for tool execution telemetry');
				return await tool.execute(arguments_, context);
			}

			try {
				const result = await tool.execute(arguments_, context);
				const durationMs = performance.now() - startTime;

				// Record success asynchronously
				Promise.resolve().then(() =>
					recordCall(telemetry, {
						toolName: tool.name,
						durationMs,
						status: 'success',
						sessionId,
					}),
				);

				return result;
			} catch (error) {
				const durationMs = performance.now() - startTime;
				const errorType =
					error instanceof Error
						? error.constructor.name
						: 'UnknownError';

				// Record error asynchronously
				Promise.resolve().then(() =>
					recordCall(telemetry, {
						toolName: tool.name,
						durationMs,
						status: 'error',
						errorType,
						sessionId,
					}),
				);

				// Re-throw to preserve original behavior
				throw error;
			}
		};

		// Call original addTool with wrapped execute
		originalAddTool({
			...tool,
			execute: wrappedExecute,
		} as ToolType);
	};
}
