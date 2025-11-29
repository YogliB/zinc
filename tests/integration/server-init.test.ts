/* eslint-disable security/detect-non-literal-fs-filename */
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { detectProjectRoot } from '../../src/core/config';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
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
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		expect(storageEngine.getRootPath()).toBe(projectRoot);
	});

	it('should initialize MemoryRepository successfully', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		expect(memoryRepository).toBeDefined();
	});

	it('should work with StorageEngine to read/write files', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});

		const testContent = 'test memory content';
		await storageEngine.writeFile('.devflow/memory/test.md', testContent);

		const readContent = await storageEngine.readFile(
			'.devflow/memory/test.md',
		);
		expect(readContent).toContain(testContent);
	});

	it('should work with MemoryRepository to save and get memory', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		const testMemory = 'test memory data';
		await memoryRepository.saveMemory('test', { content: testMemory });

		const retrieved = await memoryRepository.getMemory('test');
		expect(retrieved.content).toBe(testMemory);
	});

	it('should respect DEVFLOW_ROOT environment variable in full workflow', async () => {
		process.env.DEVFLOW_ROOT = testProjectRoot;

		const projectRoot = await detectProjectRoot();
		expect(projectRoot).toBe(testProjectRoot);

		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		const testData = 'env var test data';
		await memoryRepository.saveMemory('env-test', { content: testData });
		const retrieved = await memoryRepository.getMemory('env-test');

		expect(retrieved.content).toBe(testData);
	});

	it('should initialize without errors in valid project', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		expect(projectRoot).toBeDefined();
		expect(projectRoot.length).toBeGreaterThan(0);
		expect(storageEngine).toBeDefined();
		expect(memoryRepository).toBeDefined();
	});

	it('should create .devflow/memory directory on first write', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		const bankExists = await storageEngine.exists('.devflow/memory');
		expect(bankExists).toBe(false);

		await memoryRepository.saveMemory('first', { content: 'content' });

		const bankExistsAfter = await storageEngine.exists('.devflow/memory');
		expect(bankExistsAfter).toBe(true);
	});

	it('should list memories after saving multiple', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		const memoryRepository = new MemoryRepository({
			storageEngine,
		});

		await memoryRepository.saveMemory('memory1', { content: 'content1' });
		await memoryRepository.saveMemory('memory2', { content: 'content2' });
		await memoryRepository.saveMemory('memory3', { content: 'content3' });

		const memories = await memoryRepository.listMemories();
		expect(memories).toContain('memory1');
		expect(memories).toContain('memory2');
		expect(memories).toContain('memory3');
		expect(memories.length).toBeGreaterThanOrEqual(3);
	});

	it('should handle errors gracefully in StorageEngine', async () => {
		const projectRoot = await detectProjectRoot();
		const storageEngine = new StorageEngine({
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
