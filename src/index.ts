import { FastMCP } from 'fastmcp';
import { StorageEngine } from './core/storage/engine';
import { MemoryRepository } from './layers/memory/repository';
import { detectProjectRoot } from './core/config';
import {
	createMemoryGetTool,
	createMemorySaveTool,
	createMemoryListTool,
	createMemoryDeleteTool,
	createMemoryInitTool,
} from './mcp/tools/memory';
import {
	createContextResource,
	createMemoryResourceTemplate,
} from './mcp/resources/memory';
import {
	createMemoryContextPrompt,
	createMemoryLoadPrompt,
	createMemoryUpdatePrompt,
} from './mcp/prompts/memory';

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
		});
		console.error(
			'[DevFlow:INFO] MemoryRepository initialized (path: .devflow/memory)',
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

	try {
		const memoryGetTool = createMemoryGetTool(memoryRepository);
		server.addTool(memoryGetTool);
		console.error('[DevFlow:INFO] Registered tool: memory-get');

		const memorySaveTool = createMemorySaveTool(memoryRepository);
		server.addTool(memorySaveTool);
		console.error('[DevFlow:INFO] Registered tool: memory-save');

		const memoryListTool = createMemoryListTool(memoryRepository);
		server.addTool(memoryListTool);
		console.error('[DevFlow:INFO] Registered tool: memory-list');

		const memoryDeleteTool = createMemoryDeleteTool(memoryRepository);
		server.addTool(memoryDeleteTool);
		console.error('[DevFlow:INFO] Registered tool: memory-delete');

		const memoryInitTool = createMemoryInitTool(memoryRepository);
		server.addTool(memoryInitTool);
		console.error('[DevFlow:INFO] Registered tool: memory-init');

		console.error(
			'[DevFlow:INFO] All memory tools registered successfully',
		);

		const contextResource = createContextResource(memoryRepository);
		server.addResource(contextResource);
		console.error(
			'[DevFlow:INFO] Registered resource: devflow://context/memory',
		);

		const memoryResourceTemplate =
			createMemoryResourceTemplate(memoryRepository);
		server.addResourceTemplate(memoryResourceTemplate);
		console.error(
			'[DevFlow:INFO] Registered resource template: devflow://memory/{name}',
		);

		console.error(
			'[DevFlow:INFO] All memory resources registered successfully',
		);

		const memoryContextPrompt = createMemoryContextPrompt(memoryRepository);
		server.addPrompt(memoryContextPrompt);
		console.error('[DevFlow:INFO] Registered prompt: memory:context');

		const memoryLoadPrompt = createMemoryLoadPrompt(memoryRepository);
		server.addPrompt(memoryLoadPrompt);
		console.error('[DevFlow:INFO] Registered prompt: memory:load');

		const memoryUpdatePrompt = createMemoryUpdatePrompt(memoryRepository);
		server.addPrompt(memoryUpdatePrompt);
		console.error('[DevFlow:INFO] Registered prompt: memory:update');

		console.error(
			'[DevFlow:INFO] All memory prompts registered successfully',
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error during tool/resource/prompt registration';
		console.error(
			`[DevFlow:ERROR] Failed to register tools/resources/prompts: ${errorMessage}`,
		);
		throw error;
	}

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
