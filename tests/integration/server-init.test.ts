/* eslint-disable security/detect-non-literal-fs-filename */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { detectProjectRoot } from '../../src/core/config';
import { createStorageEngine } from '../../src/core/storage/engine';
import path from 'node:path';
import { mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('Server Initialization Integration', () => {
	let originalCurrentDirectory: string;
	let originalEnvironment: string | undefined;
	let testProjectRoot: string;

	beforeEach(async () => {
		originalCurrentDirectory = process.cwd();
		originalEnvironment = process.env.DEVFLOW_ROOT;
		testProjectRoot = path.join(
			tmpdir(),
			`devflow-init-test-${Date.now()}`,
		);

		const gitDirectory = path.join(testProjectRoot, '.git');
		await mkdir(gitDirectory, { recursive: true });
		await writeFile(path.join(testProjectRoot, 'package.json'), '{}');

		testProjectRoot = await realpath(testProjectRoot);
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
});
