import { warn, debug, trace, info, error } from '@tauri-apps/plugin-log';

function forwardConsole(
	functionName: 'log' | 'debug' | 'info' | 'warn' | 'error',
	// eslint-disable-next-line no-unused-vars
	logger: (message: string) => Promise<void>,
) {
	const original = console[functionName];

	console[functionName] = (message) => {
		original(message);
		logger(message);
	};
}

forwardConsole('log', trace);
forwardConsole('debug', debug);
forwardConsole('info', info);
forwardConsole('warn', warn);
forwardConsole('error', error);
