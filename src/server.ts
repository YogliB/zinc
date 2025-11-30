import { FastMCP } from 'fastmcp';
import { createStorageEngine } from './core/storage/engine';
import type { StorageEngine } from './core/storage/engine';
import { detectProjectRoot } from './core/config';

let storageEngine: StorageEngine;

async function initializeServer(): Promise<void> {
	try {
		const projectRoot = await detectProjectRoot();
		console.error(`[DevFlow:INFO] Project root detected: ${projectRoot}`);

		storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		console.error('[DevFlow:INFO] StorageEngine initialized');
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error during initialization';
		console.error(
			`[DevFlow:ERROR] Failed to initialize server: ${errorMessage}`,
		);
		if (error instanceof Error && error.stack) {
			console.error(`[DevFlow:ERROR] Stack trace: ${error.stack}`);
		}
		throw error;
	}
}

async function main(): Promise<void> {
	await initializeServer();

	const server = new FastMCP({
		name: 'devflow-mcp',
		version: '0.1.0',
	});

	console.error(
		'[DevFlow:INFO] Server initialized (no tools registered yet)',
	);

	await server.start({
		transportType: 'stdio',
	});
	console.error('DevFlow MCP Server running on stdio');
}

(async () => {
	await main().catch((error) => {
		console.error(
			`[DevFlow:ERROR] Fatal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
		process.exit(1);
	});
})();

export { storageEngine };
