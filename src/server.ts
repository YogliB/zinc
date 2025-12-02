import { FastMCP } from 'fastmcp';
import { createStorageEngine } from './core/storage/engine';
import type { StorageEngine } from './core/storage/engine';
import { detectProjectRoot } from './core/config';
import { AnalysisEngine } from './core/analysis/engine';
import { TypeScriptPlugin } from './core/analysis/plugins/typescript';
import { GitAnalyzer } from './core/analysis/git/git-analyzer';
import { GitAwareCache } from './core/analysis/cache/git-aware';
import {
	FileWatcher,
	estimateDirectorySize,
	MAX_FILE_COUNT_THRESHOLD,
} from './core/analysis/watcher/file-watcher';
import { registerAllTools } from './mcp/tools';

function parseBoolean(
	value: string | undefined,
	defaultValue: boolean,
): boolean {
	if (value === undefined) return defaultValue;
	return value.toLowerCase() === 'true' || value === '1';
}

function parsePatterns(value: string | undefined): string[] | undefined {
	if (!value) return undefined;
	return value
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
}

let storageEngine: StorageEngine;
let analysisEngine: AnalysisEngine;
let gitAnalyzer: GitAnalyzer;
let cache: GitAwareCache;
let fileWatcher: FileWatcher;
let tsPlugin: TypeScriptPlugin;

async function validateProjectRoot(projectRoot: string): Promise<void> {
	const estimatedSize = await estimateDirectorySize(projectRoot);

	if (estimatedSize >= MAX_FILE_COUNT_THRESHOLD) {
		throw new Error(
			`Project root directory is too large (estimated ${estimatedSize} files). ` +
				`Watching this directory would cause memory exhaustion. ` +
				`Please set DEVFLOW_ROOT environment variable to point to a smaller project directory.`,
		);
	}

	if (estimatedSize > 10_000) {
		console.error(
			`[DevFlow:WARN] Large project root detected (estimated ${estimatedSize} files). ` +
				`File watching may impact performance. Consider setting DEVFLOW_ROOT to a more specific directory.`,
		);
	}
}

async function initializeServer(): Promise<void> {
	const startTime = performance.now();

	try {
		let phaseStart = performance.now();
		const projectRoot = await detectProjectRoot();
		console.error(
			`[DevFlow:INFO] Project root detected: ${projectRoot} (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		await validateProjectRoot(projectRoot);
		console.error(
			`[DevFlow:INFO] Project root validated (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		console.error(
			`[DevFlow:INFO] StorageEngine initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		analysisEngine = new AnalysisEngine(projectRoot);
		tsPlugin = new TypeScriptPlugin(projectRoot);
		analysisEngine.registerPlugin(tsPlugin);
		console.error(
			`[DevFlow:INFO] AnalysisEngine initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		gitAnalyzer = new GitAnalyzer(projectRoot);
		console.error(
			`[DevFlow:INFO] GitAnalyzer initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		cache = new GitAwareCache();
		console.error(
			`[DevFlow:INFO] Cache initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		fileWatcher = new FileWatcher(100, cache);
		await fileWatcher.watchDirectory(projectRoot);
		console.error(
			`[DevFlow:INFO] FileWatcher initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		const totalTime = performance.now() - startTime;
		console.error(
			`[DevFlow:INFO] Server initialization complete (${totalTime.toFixed(2)}ms total)`,
		);

		// Background preloading (optional, non-blocking)
		const shouldPreload = parseBoolean(
			process.env.DEVFLOW_PRELOAD_FILES,
			false,
		);
		if (shouldPreload) {
			const patterns = parsePatterns(
				process.env.DEVFLOW_PRELOAD_PATTERNS,
			);
			console.error(
				'[DevFlow:INFO] Starting background file preloading...',
			);

			// Don't await - let this run in background
			tsPlugin
				.preloadFiles(patterns)
				.then((result) => {
					if (result.errors.length > 0) {
						console.error(
							`[DevFlow:WARN] Preload completed with errors: ${result.errors.join(', ')}`,
						);
					} else {
						console.error(
							`[DevFlow:INFO] Preload complete: ${result.count} files loaded`,
						);
					}
				})
				.catch((error) => {
					console.error(
						`[DevFlow:ERROR] Background preload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
					);
				});
		}
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

	const toolsStart = performance.now();
	registerAllTools(server, analysisEngine, storageEngine, gitAnalyzer);
	console.error(
		`[DevFlow:INFO] All MCP tools registered (${(performance.now() - toolsStart).toFixed(2)}ms)`,
	);

	await server.start({
		transportType: 'stdio',
	});
	console.error('[DevFlow:INFO] DevFlow MCP Server ready on stdio');
}

(async () => {
	await main().catch((error) => {
		console.error(
			`[DevFlow:ERROR] Fatal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
		process.exit(1);
	});
})();
