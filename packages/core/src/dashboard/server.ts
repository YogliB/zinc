import path from 'node:path';
import { existsSync } from 'node:fs';
import { createLogger } from '../core/utils/logger';

const logger = createLogger('Dashboard');

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

export const startDashboardServer = (port: number, buildDirectory: string) => {
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	if (!existsSync(buildDirectory)) {
		throw new Error(
			`Dashboard build directory not found: ${buildDirectory}. Run 'bun run --filter dashboard build' first.`,
		);
	}

	const server = Bun.serve({
		port,
		development: false,
		fetch: async (request): Promise<Response> => {
			const url = new URL(request.url);
			const pathname = normalizePath(url.pathname);

			const filePath = path.join(buildDirectory, pathname);

			const file = Bun.file(filePath);
			const exists = await file.exists();

			if (exists) {
				return new Response(file, {
					headers: {
						'Content-Type': resolveMimeType(pathname),
					},
				});
			}

			const indexFile = Bun.file(path.join(buildDirectory, 'index.html'));
			const indexExists = await indexFile.exists();

			if (indexExists) {
				return new Response(indexFile, {
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
					},
				});
			}

			return new Response('Not Found', { status: 404 });
		},
	});

	logger.info(`Dashboard server started at http://localhost:${server.port}`);

	return server;
};
