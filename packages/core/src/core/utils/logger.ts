export interface Logger {
	debug: (message: string) => void;
	info: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string) => void;
}

export interface LoggerOptions {
	debug?: boolean;
}

export function createLogger(
	namespace: string,
	options: LoggerOptions = {},
): Logger {
	const debugEnabled = options.debug ?? false;

	const log = (level: string, message: string): void => {
		if (level === 'debug' && !debugEnabled) {
			return;
		}
		console.error(`[${namespace}:${level.toUpperCase()}] ${message}`);
	};

	return {
		debug: (message: string) => log('debug', message),
		info: (message: string) => log('info', message),
		warn: (message: string) => log('warn', message),
		error: (message: string) => log('error', message),
	};
}
