import { FastMCP, type FastMCPSession } from 'fastmcp';
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
import { createLogger } from './core/utils/logger';
import { startDashboardServer } from './dashboard/server';
import path from 'node:path';

import { getAnalyticsDatabase } from './analytics/database.js';
import { TelemetryService } from './analytics/telemetry.js';
import { wrapToolWithTelemetry } from './analytics/tool-wrapper.js';

const logger = createLogger('DevFlow');

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

function parsePort(value: string | undefined): number | undefined {
	if (!value) return undefined;
	const port = Number.parseInt(value, 10);
	if (Number.isNaN(port) || port < 1 || port > 65_535) {
		logger.warn(
			`Invalid port number "${value}", will auto-detect available port`,
		);
		return undefined;
	}
	return port;
}

let storageEngine: StorageEngine;
let analysisEngine: AnalysisEngine;
let gitAnalyzer: GitAnalyzer;
let cache: GitAwareCache;
let fileWatcher: FileWatcher;
let tsPlugin: TypeScriptPlugin;

let telemetryService: TelemetryService;

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
		logger.warn(
			`Large project root detected (estimated ${estimatedSize} files). ` +
				`File watching may impact performance. Consider setting DEVFLOW_ROOT to a more specific directory.`,
		);
	}
}

async function initializeServer(): Promise<void> {
	const startTime = performance.now();

	try {
		let phaseStart = performance.now();
		const projectRoot = await detectProjectRoot();
		logger.info(
			`Project root detected: ${projectRoot} (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		await validateProjectRoot(projectRoot);
		logger.info(
			`Project root validated (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		logger.info(
			`StorageEngine initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		analysisEngine = new AnalysisEngine(projectRoot);
		tsPlugin = new TypeScriptPlugin(projectRoot);
		analysisEngine.registerPlugin(tsPlugin);
		logger.info(
			`AnalysisEngine initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		gitAnalyzer = new GitAnalyzer(projectRoot);
		logger.info(
			`GitAnalyzer initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		cache = new GitAwareCache();
		logger.info(
			`Cache initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		phaseStart = performance.now();
		fileWatcher = new FileWatcher(100, cache);
		await fileWatcher.watchDirectory(projectRoot);
		logger.info(
			`FileWatcher initialized (${(performance.now() - phaseStart).toFixed(2)}ms)`,
		);

		const totalTime = performance.now() - startTime;
		logger.info(
			`Server initialization complete (${totalTime.toFixed(2)}ms total)`,
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
			logger.info('Starting background file preloading...');

			// Don't await - let this run in background
			tsPlugin
				.preloadFiles(patterns)
				.then((result) => {
					if (result.errors.length > 0) {
						logger.warn(
							`Preload completed with errors: ${result.errors.join(', ')}`,
						);
					} else {
						logger.info(
							`Preload complete: ${result.count} files loaded`,
						);
					}
				})
				.catch((error) => {
					logger.error(
						`Background preload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
					);
				});
		}
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error during initialization';
		logger.error(`Failed to initialize server: ${errorMessage}`);
		if (error instanceof Error && error.stack) {
			logger.error(`Stack trace: ${error.stack}`);
		}
		throw error;
	}
}

async function startDashboard(
	projectRoot: string,
): Promise<ReturnType<typeof startDashboardServer> | undefined> {
	const dashboardEnabled = parseBoolean(
		process.env.DEVFLOW_DASHBOARD_ENABLED,
		true,
	);

	if (!dashboardEnabled) {
		logger.info('Dashboard server disabled via DEVFLOW_DASHBOARD_ENABLED');
		return undefined;
	}

	const dashboardPort = parsePort(process.env.DEVFLOW_DASHBOARD_PORT);
	const autoOpen = parseBoolean(
		process.env.DEVFLOW_DASHBOARD_AUTO_OPEN,
		false,
	);
	const dashboardBuildDirectory = path.join(
		projectRoot,
		'packages/dashboard/build',
	);

	const dashboardStart = performance.now();

	try {
		const dashboardServer = await startDashboardServer({
			port: dashboardPort,
			buildDirectory: dashboardBuildDirectory,
			autoOpen,
		});
		logger.info(
			`Dashboard server initialization complete (${(performance.now() - dashboardStart).toFixed(2)}ms)`,
		);
		return dashboardServer;
	} catch (error) {
		logger.error(
			`Failed to start dashboard server: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
		logger.warn('Continuing with MCP server only...');
		return undefined;
	}
}

async function main(): Promise<void> {
	const projectRoot = await detectProjectRoot();
	await initializeServer();

	const analyticsInitStart = performance.now();

	const analyticsDatabase = getAnalyticsDatabase();

	telemetryService = new TelemetryService(analyticsDatabase);

	logger.info(
		`Analytics initialized (${(performance.now() - analyticsInitStart).toFixed(2)}ms)`,
	);

	const server = new FastMCP({
		name: 'devflow-mcp',
		version: '0.1.0',
	});

	server.addTool = wrapToolWithTelemetry(
		server.addTool,
		telemetryService,
	) as typeof server.addTool;

	const toolsStart = performance.now();
	registerAllTools(server, analysisEngine, storageEngine, gitAnalyzer);
	logger.info(
		`All MCP tools registered (${(performance.now() - toolsStart).toFixed(2)}ms)`,
	);

	server.on('connect', (event: { session: FastMCPSession }) => {
		if (event.session.sessionId) {
			telemetryService.startSession(event.session.sessionId);
		}
	});

	server.on('disconnect', (event: { session: FastMCPSession }) => {
		if (event.session.sessionId) {
			telemetryService.endSession(event.session.sessionId);
		}
	});

	await server.start({
		transportType: 'stdio',
	});

	logger.info('DevFlow MCP Server ready on stdio');

	process.on('SIGINT', async () => {
		await telemetryService.shutdown();
		process.exit(0);
	});

	void startDashboard(projectRoot);
}

try {
	await main();
} catch (error) {
	logger.error(
		`Fatal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
	);
	throw error;
}
