import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createLogger } from '../core/utils/logger';
import { findAvailablePort } from './port-finder';
import { openBrowser } from './browser-launcher';

const logger = createLogger('Dashboard');

export interface DashboardServerConfig {
	port?: number;
	buildDirectory: string;
	autoOpen?: boolean;
}

const MIME_TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
};

const resolveMimeType = (pathname: string): string => {
	const extension = path.extname(pathname).toLowerCase();
	// eslint-disable-next-line security/detect-object-injection
	return MIME_TYPES[extension] || 'application/octet-stream';
};

const normalizePath = (pathname: string): string => {
	let normalized = pathname;
	if (normalized.endsWith('/')) {
		normalized = normalized.slice(0, -1);
	}
	if (normalized === '' || normalized === '/') {
		normalized = '/index.html';
	}
	return normalized;
};

export const startDashboardServer = async (config: DashboardServerConfig) => {
	if (!existsSync(config.buildDirectory)) {
		throw new Error(
			`Dashboard build directory not found: ${config.buildDirectory}. Run 'bun run --filter dashboard build' first.`,
		);
	}

	const portResult = await findAvailablePort(config.port);
	const { port, wasAutoDetected } = portResult;

	if (wasAutoDetected) {
		logger.info(`Auto-detected available port: ${port}`);
	} else {
		logger.info(`Using configured port: ${port}`);
	}

	const server = createServer(async (request, response) => {
		const url = new URL(request.url!, `http://localhost:${port}`);
		const pathname = normalizePath(url.pathname);

		const filePath = path.join(config.buildDirectory, pathname);

		try {
			const fileContent = await readFile(filePath);
			response.writeHead(200, {
				'Content-Type': resolveMimeType(pathname),
			});
			response.end(fileContent);
			return;
		} catch {
			// File not found, try index.html for SPA routing
		}

		try {
			const indexPath = path.join(config.buildDirectory, 'index.html');
			const indexContent = await readFile(indexPath);
			response.writeHead(200, {
				'Content-Type': 'text/html; charset=utf-8',
			});
			response.end(indexContent);
		} catch {
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.end('Not Found');
		}
	});

	server.listen(port);

	const dashboardUrl = `http://localhost:${port}`;
	logger.info(`Dashboard server started at ${dashboardUrl}`);

	if (config.autoOpen) {
		logger.info('Auto-opening browser...');
		void openBrowser(dashboardUrl);
	}

	return server;
};
