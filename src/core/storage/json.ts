export interface JSONStringifyOptions {
	pretty?: boolean;
	indent?: number;
}

export function parseJSON<T = Record<string, unknown>>(text: string): T {
	try {
		return JSON.parse(text) as T;
	} catch (error) {
		throw new Error(
			`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}

export function stringifyJSON<T>(
	data: T,
	options?: JSONStringifyOptions,
): string {
	const indent =
		options?.pretty !== false ? (options?.indent ?? 2) : undefined;
	return JSON.stringify(data, null, indent);
}
