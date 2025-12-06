import type { TelemetryService } from './telemetry.js';

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: unknown;
	execute: (parameters: unknown) => Promise<unknown>;
}

type AddToolFunction = (tool: ToolDefinition) => void;

const recordCall = (
	telemetry: TelemetryService,
	metadata: Parameters<TelemetryService['recordToolCall']>[0],
) => {
	telemetry.recordToolCall(metadata).catch((error) => {
		console.error('Failed to record tool telemetry:', error);
	});
};

export function wrapToolWithTelemetry(
	originalAddTool: AddToolFunction,
	telemetry: TelemetryService,
): AddToolFunction {
	return (tool: ToolDefinition) => {
		const wrappedExecute = async (parameters: unknown) => {
			const startTime = performance.now();
			const sessionId = telemetry.getCurrentSessionId();

			if (!sessionId) {
				console.warn('No active session for tool execution telemetry');
				return await tool.execute(parameters);
			}

			try {
				const result = await tool.execute(parameters);
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
		});
	};
}
