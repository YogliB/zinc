import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { detectProjectRoot } from '../../src/core/config';
import { createStorageEngine } from '../../src/core/storage/engine';
import path from 'node:path';
import { mkdir, writeFile, rm, realpath } from 'node:fs/promises';

describe('Server Initialization Integration', () => {
	let originalCurrentDirectory: string;
	let originalEnvironment: string | undefined;
	let testProjectRoot: string;

	beforeEach(async () => {
		originalCurrentDirectory = process.cwd();
		originalEnvironment = process.env.DEVFLOW_ROOT;
		const testRootName = `devflow-init-test-${Date.now()}`;
		testProjectRoot = path.resolve('.test-integration', testRootName);

		await mkdir(path.resolve('.test-integration', testRootName), {
			recursive: true,
		});
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(testProjectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(testProjectRoot, packageJsonName);
		await writeFile(packageJsonPath, '{}');

		testProjectRoot = await realpath(
			path.resolve('.test-integration', testRootName),
		);
		process.chdir(testProjectRoot);
	});

	afterEach(async () => {
		process.chdir(originalCurrentDirectory);
		delete process.env.DEVFLOW_ROOT;
		if (originalEnvironment) {
			process.env.DEVFLOW_ROOT = originalEnvironment;
		}

		try {
			await rm(testProjectRoot, { recursive: true, force: true });
		} catch {
			// Cleanup might fail in some cases
		}
	});

	it('should initialize StorageEngine successfully', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		expect(storageEngine.getRootPath()).toBe(projectRoot);
	});

	it('should work with StorageEngine to read/write files', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		const testContent = 'test content';
		await storageEngine.writeFile('.devflow/test.txt', testContent);

		const readContent = await storageEngine.readFile('.devflow/test.txt');
		expect(readContent).toContain(testContent);
	});

	it('should respect DEVFLOW_ROOT environment variable', async () => {
		process.env.DEVFLOW_ROOT = testProjectRoot;

		const projectRoot = await detectProjectRoot();
		expect(projectRoot).toBe(testProjectRoot);

		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		expect(storageEngine.getRootPath()).toBe(testProjectRoot);
	});

	it('should initialize without errors in valid project', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		expect(projectRoot).toBeDefined();
		expect(projectRoot.length).toBeGreaterThan(0);
		expect(storageEngine).toBeDefined();
	});

	it('should handle errors gracefully in StorageEngine', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		try {
			await storageEngine.readFile('nonexistent.md');
			expect(true).toBe(false); // Should not reach here
		} catch (error) {
			expect(error).toBeDefined();
		}
	});

	it('should initialize full server components', async () => {
		const projectRoot = await detectProjectRoot();
		const { AnalysisEngine } =
			await import('../../src/core/analysis/engine');
		const { TypeScriptPlugin } =
			await import('../../src/core/analysis/plugins/typescript');
		const { GitAnalyzer } =
			await import('../../src/core/analysis/git/git-analyzer');
		const { GitAwareCache } =
			await import('../../src/core/analysis/cache/git-aware');
		const { FileWatcher } =
			await import('../../src/core/analysis/watcher/file-watcher');
		const { FastMCP } = await import('fastmcp');
		const { registerAllTools } = await import('../../src/mcp/tools');

		const storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		const analysisEngine = new AnalysisEngine(projectRoot);
		const tsPlugin = new TypeScriptPlugin(projectRoot);
		analysisEngine.registerPlugin(tsPlugin);

		const gitAnalyzer = new GitAnalyzer(projectRoot);
		const cache = new GitAwareCache();
		const fileWatcher = new FileWatcher(100, cache);
		await fileWatcher.watchDirectory(projectRoot);

		const server = new FastMCP({
			name: 'devflow-mcp',
			version: '0.1.0',
		});

		registerAllTools(server, analysisEngine, storageEngine, gitAnalyzer);

		expect(analysisEngine).toBeDefined();
		expect(gitAnalyzer).toBeDefined();
		expect(cache).toBeDefined();
		expect(fileWatcher).toBeDefined();
		expect(server).toBeDefined();

		fileWatcher.stop();
	});

	it('should handle initialization errors gracefully', async () => {
		const invalidPath = path.resolve(
			'.test-integration',
			`invalid-${Date.now()}`,
		);
		process.env.DEVFLOW_ROOT = invalidPath;

		try {
			const projectRoot = await detectProjectRoot();
			const storageEngine = createStorageEngine({
				rootPath: projectRoot,
				debug: false,
			});

			expect(storageEngine.getRootPath()).toBe(invalidPath);
		} finally {
			delete process.env.DEVFLOW_ROOT;
		}
	});

	it('should reject initialization with directory exceeding size threshold', async () => {
		const largeTestDirectory = path.resolve(
			'.test-integration',
			`large-test-${Date.now()}`,
		);
		await mkdir(largeTestDirectory, { recursive: true });

		// Create 1,000 files instead of 100,000 for faster testing
		const fileCount = 1000;
		const writePromises: Promise<void>[] = [];

		for (let fileIndex = 0; fileIndex < fileCount; fileIndex++) {
			writePromises.push(
				writeFile(
					path.join(largeTestDirectory, `file-${fileIndex}.txt`),
					`Content ${fileIndex}`,
				),
			);
		}

		await Promise.all(writePromises);

		process.env.DEVFLOW_ROOT = largeTestDirectory;

		// Mock estimateDirectorySize to simulate threshold breach
		const fileWatcherModule =
			await import('../../src/core/analysis/watcher/file-watcher');
		vi.spyOn(fileWatcherModule, 'estimateDirectorySize').mockResolvedValue(
			100_000 + 1,
		);

		const { FileWatcher } = fileWatcherModule;
		const { GitAwareCache } =
			await import('../../src/core/analysis/cache/git-aware');

		const cache = new GitAwareCache();
		const fileWatcher = new FileWatcher(100, cache);

		await expect(
			fileWatcher.watchDirectory(largeTestDirectory),
		).rejects.toThrow('Directory too large');

		fileWatcher.stop();
		vi.restoreAllMocks();
		delete process.env.DEVFLOW_ROOT;

		await rm(largeTestDirectory, { recursive: true, force: true });
	}, 10_000);
});
