import { createServer } from 'node:net';
import { createLogger } from '../core/utils/logger';

const logger = createLogger('PortFinder');

const DEFAULT_PORT_START = 3000;
const DEFAULT_PORT_END = 3100;
const MAX_PORT_ATTEMPTS = 100;

export interface PortResult {
	port: number;
	wasAutoDetected: boolean;
}

const isPortAvailable = async (port: number): Promise<boolean> => {
	return new Promise((resolve) => {
		const server = createServer();

		server.listen(port, () => {
			server.close(() => resolve(true));
		});

		server.on('error', () => {
			resolve(false);
		});
	});
};

export const findAvailablePort = async (
	preferredPort?: number,
): Promise<PortResult> => {
	if (preferredPort !== undefined) {
		logger.debug(`Checking preferred port ${preferredPort}...`);
		const available = await isPortAvailable(preferredPort);

		if (available) {
			logger.debug(`Preferred port ${preferredPort} is available`);
			return {
				port: preferredPort,
				wasAutoDetected: false,
			};
		}

		logger.debug(
			`Preferred port ${preferredPort} is busy, auto-detecting...`,
		);
	}

	const startPort = preferredPort ?? DEFAULT_PORT_START;
	const endPort = DEFAULT_PORT_END;
	let attempts = 0;

	for (
		let port = startPort;
		port <= endPort && attempts < MAX_PORT_ATTEMPTS;
		port++
	) {
		attempts++;
		logger.debug(`Trying port ${port}... (attempt ${attempts})`);

		const available = await isPortAvailable(port);

		if (available) {
			logger.info(`Auto-detected available port: ${port}`);
			return {
				port,
				wasAutoDetected: true,
			};
		}
	}

	throw new Error(
		`Could not find available port in range ${startPort}-${endPort} after ${attempts} attempts`,
	);
};
