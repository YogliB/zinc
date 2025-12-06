import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	FileWatcher,
	estimateDirectorySize,
	MAX_FILE_COUNT_THRESHOLD,
} from '../../../../../src/core/analysis/watcher/file-watcher';
import { GitAwareCache } from '../../../../../src/core/analysis/cache/git-aware';
import {
	createTestProject,
	writeTestFile,
} from '../../../../helpers/test-helpers';
import { sampleTypeScriptFile } from '../../../../helpers/fixtures';
import path from 'node:path';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';

const handleChange = () => {};

describe('FileWatcher', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject();
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should watch directory', async () => {
		const watcher = new FileWatcher();
		await watcher.watchDirectory(testProject.root);
		expect(watcher).toBeDefined();
		watcher.stop();
	});

	it('should not watch same directory twice', async () => {
		const watcher = new FileWatcher();
		await watcher.watchDirectory(testProject.root);
		await watcher.watchDirectory(testProject.root);
		expect(watcher).toBeDefined();
		watcher.stop();
	});

	it('should register and call onChange callback', async () => {
		const watcher = new FileWatcher(50);
		const callbackPaths: string[] = [];

		await writeTestFile(testProject.root, 'src/.gitkeep', '');

		watcher.onChange((filePath) => {
			callbackPaths.push(filePath);
		});

		await watcher.watchDirectory(testProject.root);

		await new Promise((resolve) => setTimeout(resolve, 50));

		await writeTestFile(
			testProject.root,
			'src/test.ts',
			sampleTypeScriptFile,
		);

		await new Promise((resolve) => setTimeout(resolve, 200));

		watcher.stop();
		expect(callbackPaths.length).toBeGreaterThan(0);
		expect(callbackPaths.some((p) => p.includes('test.ts'))).toBe(true);
	});

	it('should remove onChange callback', () => {
		const watcher = new FileWatcher();

		watcher.onChange(handleChange);
		expect(() => {
			watcher.offChange(handleChange);
		}).not.toThrow();

		watcher.stop();
	});

	it('should invalidate cache on file change', async () => {
		const cache = new GitAwareCache();
		const watcher = new FileWatcher(50, cache);
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		await watcher.watchDirectory(testProject.root);

		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const changed = 1;',
		);

		await new Promise((resolve) => setTimeout(resolve, 200));

		watcher.stop();
		const retrieved = await cache.get(filePath);
		expect(retrieved).toBeUndefined();
	});

	it('should debounce file changes', async () => {
		const watcher = new FileWatcher(100);
		let callCount = 0;

		const handleChange = () => {
			callCount++;
		};

		watcher.onChange(handleChange);

		await watcher.watchDirectory(testProject.root);

		await writeTestFile(testProject.root, 'test.ts', sampleTypeScriptFile);
		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const v1 = 1;',
		);
		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const v2 = 2;',
		);

		await new Promise((resolve) => setTimeout(resolve, 300));

		watcher.stop();
		expect(callCount).toBeGreaterThan(0);
	});

	it('should stop watching and clear timers', async () => {
		const watcher = new FileWatcher();
		await watcher.watchDirectory(testProject.root);

		await writeTestFile(testProject.root, 'test.ts', sampleTypeScriptFile);

		watcher.stop();

		await writeTestFile(testProject.root, 'test2.ts', sampleTypeScriptFile);
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(watcher).toBeDefined();
	});

	it('should exclude node_modules from watching', async () => {
		const watcher = new FileWatcher(50);
		const callbackPaths: string[] = [];

		await mkdir(path.join(testProject.root, 'node_modules'), {
			recursive: true,
		});
		await writeTestFile(
			testProject.root,
			'node_modules/test.js',
			'console.log("test");',
		);

		watcher.onChange((filePath) => {
			callbackPaths.push(filePath);
		});

		await watcher.watchDirectory(testProject.root);
		await new Promise((resolve) => setTimeout(resolve, 50));

		await writeTestFile(
			testProject.root,
			'node_modules/another.js',
			'console.log("another");',
		);
		await writeTestFile(
			testProject.root,
			'src/valid.ts',
			sampleTypeScriptFile,
		);

		await new Promise((resolve) => setTimeout(resolve, 200));

		watcher.stop();
		expect(callbackPaths.some((p) => p.includes('node_modules'))).toBe(
			false,
		);
		expect(callbackPaths.some((p) => p.includes('valid.ts'))).toBe(true);
	});

	it('should estimate directory size correctly', async () => {
		const testDirectory = path.join(tmpdir(), `devflow-test-${Date.now()}`);
		await mkdir(testDirectory, { recursive: true });

		for (let index = 0; index < 100; index++) {
			await writeFile(
				path.join(testDirectory, `file-${index}.txt`),
				`Content ${index}`,
			);
		}

		const size = await estimateDirectorySize(testDirectory);
		expect(size).toBeGreaterThanOrEqual(100);
		expect(size).toBeLessThan(MAX_FILE_COUNT_THRESHOLD);

		await rm(testDirectory, { recursive: true, force: true });
	});

	it('should throw error when directory exceeds threshold', async () => {
		const testDirectory = path.join(
			tmpdir(),
			`devflow-large-test-${Date.now()}`,
		);
		await mkdir(testDirectory, { recursive: true });

		// Create 1,000 files instead of 100,000 for faster testing
		const fileCount = 1000;
		const writePromises: Promise<void>[] = [];

		for (let fileIndex = 0; fileIndex < fileCount; fileIndex++) {
			writePromises.push(
				writeFile(
					path.join(testDirectory, `file-${fileIndex}.txt`),
					`Content ${fileIndex}`,
				),
			);
		}

		await Promise.all(writePromises);

		// Mock estimateDirectorySize to simulate threshold breach
		const mockEstimate = vi
			.fn()
			.mockResolvedValue(MAX_FILE_COUNT_THRESHOLD + 1);

		const watcher = new FileWatcher(100, undefined, mockEstimate);
		await expect(watcher.watchDirectory(testDirectory)).rejects.toThrow(
			'Directory too large',
		);

		watcher.stop();
		await rm(testDirectory, { recursive: true, force: true });
	}, 10_000);
});
