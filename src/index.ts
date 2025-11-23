import { FastMCP } from 'fastmcp';
import { StorageEngine } from './core/storage/engine';
import { MemoryRepository } from './layers/memory/repository';
import { detectProjectRoot } from './core/config';

let memoryRepository: MemoryRepository;

async function initializeServer(): Promise<void> {
	try {
		const projectRoot = await detectProjectRoot();
		console.error(`[DevFlow:INFO] Project root detected: ${projectRoot}`);

		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		console.error('[DevFlow:INFO] StorageEngine initialized');

		memoryRepository = new MemoryRepository({
			storageEngine,
			memorybankPath: 'memory-bank',
		});
		console.error(
			'[DevFlow:INFO] MemoryRepository initialized (path: memory-bank)',
		);
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

	await server.start({
		transportType: 'stdio',
	});
	console.error('DevFlow MCP Server running on stdio');
}

await main().catch((error) => {
	console.error(
		`[DevFlow:ERROR] Fatal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
	);
	throw error;
});

export { memoryRepository };
