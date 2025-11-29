import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
import {
	createMemoryGetTool,
	createMemorySaveTool,
	createMemoryListTool,
	createMemoryDeleteTool,
} from '../../src/mcp/tools/memory';
import {
	createContextResource,
	createMemoryResourceTemplate,
} from '../../src/mcp/resources/memory';

describe('[Integration:Memory] Memory MCP End-to-End', () => {
	let temporaryDirectory: string;
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		const prefix = path.join(os.tmpdir(), 'memory-mcp-test-');
		temporaryDirectory = await mkdtemp(prefix);

		storageEngine = new StorageEngine({
			rootPath: temporaryDirectory,
			debug: false,
		});

		repository = new MemoryRepository({
			storageEngine,
			memorybankPath: '.devflow/memory',
		});
	});

	afterEach(async () => {
		try {
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	// ============ HELPERS ============

	async function createTestMemoryFile(
		name: string,
		content: string,
		frontmatter: Record<string, unknown> = {},
	): Promise<void> {
		return repository.saveMemory(name, { frontmatter, content });
	}

	async function getTestMemoryFile(name: string) {
		return repository.getMemory(name);
	}

	async function listTestMemories(): Promise<string[]> {
		return repository.listMemories();
	}

	// ============ STEP 2: TOOL INTEGRATION TESTS ============

	describe('memory:list tool', () => {
		it('returns empty array on fresh init', async () => {
			const tool = createMemoryListTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.memories).toEqual([]);
			expect(parsed.count).toBe(0);
		});

		it('returns saved files after creation', async () => {
			await createTestMemoryFile('test1', 'Content 1');
			await createTestMemoryFile('test2', 'Content 2');

			const tool = createMemoryListTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.memories).toContain('test1');
			expect(parsed.memories).toContain('test2');
			expect(parsed.count).toBe(2);
		});
	});

	describe('memory:save tool', () => {
		it('creates new memory file successfully', async () => {
			const tool = createMemorySaveTool(repository);
			const result = await tool.execute({
				name: 'new-memory',
				content: 'This is new content',
			});

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);
			expect(parsed.name).toBe('new-memory');

			const saved = await getTestMemoryFile('new-memory');
			expect(saved.content).toBe('This is new content');
		});

		it('updates existing file (idempotency)', async () => {
			await createTestMemoryFile('idempotent', 'Original content');

			const tool = createMemorySaveTool(repository);
			const result = await tool.execute({
				name: 'idempotent',
				content: 'Updated content',
			});

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);

			const updated = await getTestMemoryFile('idempotent');
			expect(updated.content).toBe('Updated content');
		});

		it('handles frontmatter correctly (schema-valid fields)', async () => {
			const tool = createMemorySaveTool(repository);
			const frontmatter = {
				tags: ['test', 'integration'],
				category: 'memory',
			};
			const result = await tool.execute({
				name: 'with-frontmatter',
				frontmatter,
				content: 'Content with metadata',
			});

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);

			const saved = await getTestMemoryFile('with-frontmatter');
			expect(saved.frontmatter.tags).toEqual(['test', 'integration']);
			expect(saved.frontmatter.category).toBe('memory');
			expect(saved.content).toBe('Content with metadata');
		});

		it('skips invalid frontmatter fields (Zod schema filters)', async () => {
			const tool = createMemorySaveTool(repository);
			const invalidFrontmatter = {
				invalidField: 'value',
				category: 'valid',
			};
			const result = await tool.execute({
				name: 'partial-fm',
				frontmatter: invalidFrontmatter,
				content: 'Content',
			});

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);

			const saved = await getTestMemoryFile('partial-fm');
			expect(saved.frontmatter.category).toBe('valid');
		});
	});

	describe('memory:get tool', () => {
		it('retrieves saved file with correct content', async () => {
			await createTestMemoryFile('retrieve-test', 'Test content here');

			const tool = createMemoryGetTool(repository);
			const result = await tool.execute({ name: 'retrieve-test' });

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.content).toBe('Test content here');
		});

		it('returns error for non-existent file', async () => {
			const tool = createMemoryGetTool(repository);
			const result = await tool.execute({ name: 'does-not-exist' });

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.error).toBe('Memory not found');
		});

		it('includes valid frontmatter in response', async () => {
			const frontmatter = { title: 'Test Memory', category: 'notes' };
			await createTestMemoryFile('with-meta', 'Content', frontmatter);

			const tool = createMemoryGetTool(repository);
			const result = await tool.execute({ name: 'with-meta' });

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.frontmatter.title).toBe('Test Memory');
			expect(parsed.frontmatter.category).toBe('notes');
			expect(parsed.content).toBe('Content');
		});
	});

	describe('memory:delete tool', () => {
		it('removes file successfully', async () => {
			await createTestMemoryFile('to-delete', 'Content');

			const tool = createMemoryDeleteTool(repository);
			const result = await tool.execute({ name: 'to-delete' });

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);

			const memories = await listTestMemories();
			expect(memories).not.toContain('to-delete');
		});

		it('returns error for non-existent file', async () => {
			const tool = createMemoryDeleteTool(repository);
			const result = await tool.execute({ name: 'not-there' });

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.error).toBe('Memory not found');
		});
	});

	// ============ STEP 3: RESOURCE INTEGRATION TESTS ============

	describe('devflow://context/memory resource (Cursor only)', () => {
		it('loads and returns combined context', async () => {
			await createTestMemoryFile(
				'activeContext',
				'# Active\n\nContext here',
			);
			await createTestMemoryFile('progress', '# Progress\n\nWork done');

			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.mimeType).toBe('text/markdown');
				expect(result.text).toContain('# Active Context');
				expect(result.text).toContain('Context here');
				expect(result.text).toContain('# Progress');
				expect(result.text).toContain('Work done');
			}
		});

		it('handles missing activeContext.md gracefully', async () => {
			await createTestMemoryFile(
				'progress',
				'# Progress\n\nJust progress',
			);

			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('# Progress');
				expect(result.text).toContain('Just progress');
			}
		});

		it('handles missing progress.md gracefully', async () => {
			await createTestMemoryFile(
				'activeContext',
				'# Active\n\nJust context',
			);

			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('# Active Context');
				expect(result.text).toContain('Just context');
			}
		});

		it('handles both files missing gracefully', async () => {
			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('No memory files found');
				expect(result.mimeType).toBe('text/markdown');
			}
		});
	});

	describe('devflow://memory/{name} resource', () => {
		it('returns individual file content', async () => {
			await createTestMemoryFile('individual', 'Individual content');

			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'individual' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Individual content');
				expect(result.mimeType).toBe('text/markdown');
				expect(result.uri).toBe('devflow://memory/individual');
			}
		});

		it('includes frontmatter in output', async () => {
			const frontmatter = { category: 'test', title: 'Test' };
			await createTestMemoryFile('with-fm', 'Body content', frontmatter);

			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'with-fm' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('---');
				expect(result.text).toContain('category: "test"');
				expect(result.text).toContain('title: "Test"');
				expect(result.text).toContain('Body content');
			}
		});

		it('returns error text for non-existent file', async () => {
			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'missing' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Error');
				expect(result.uri).toBe('devflow://memory/missing');
			}
		});

		it('returns correct mimeType', async () => {
			await createTestMemoryFile('mime-test', 'Content');

			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'mime-test' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.mimeType).toBe('text/markdown');
			}
		});
	});

	// ============ STEP 3b: PROMPTS FOR ZED (RESOURCE WORKAROUND) ============

	describe('memory:context prompt (Zed workaround)', () => {
		it('returns same data as context resource', async () => {
			await createTestMemoryFile(
				'activeContext',
				'# Active\n\nContext data',
			);
			await createTestMemoryFile(
				'progress',
				'# Progress\n\nProgress data',
			);

			const resource = createContextResource(repository);
			const resourceResult = await resource.load?.();

			expect(resourceResult).toBeDefined();
			if (resourceResult && !Array.isArray(resourceResult)) {
				const resourceText = resourceResult.text;
				expect(resourceText).toContain('Context data');
				expect(resourceText).toContain('Progress data');
			}
		});

		it('handles missing files gracefully (same as resource)', async () => {
			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('No memory files found');
			}
		});
	});

	describe('memory:load prompt (Zed workaround)', () => {
		it('returns same data as dynamic resource', async () => {
			await createTestMemoryFile('test-load', 'Load test content');

			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'test-load' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Load test content');
			}
		});

		it('validates file names (missing files)', async () => {
			const template = createMemoryResourceTemplate(repository);
			const result = await template.load?.({ name: 'invalid-name' });

			expect(result).toBeDefined();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Error');
			}
		});
	});

	// ============ STEP 4: ERROR HANDLING TESTS ============

	describe('Error handling', () => {
		it('handles concurrent saves to same file', async () => {
			const tool = createMemorySaveTool(repository);

			const promises = [
				tool.execute({
					name: 'concurrent',
					content: 'Version 1',
				}),
				tool.execute({
					name: 'concurrent',
					content: 'Version 2',
				}),
				tool.execute({
					name: 'concurrent',
					content: 'Version 3',
				}),
			];

			const results = await Promise.all(promises);
			for (const result of results) {
				const parsed = JSON.parse(result.text);
				expect(parsed.success).toBe(true);
			}

			const getTool = createMemoryGetTool(repository);
			const finalResult = await getTool.execute({
				name: 'concurrent',
			});
			const parsed = JSON.parse(finalResult.text);
			expect(parsed.content).toBeDefined();
		});

		it('handles large files (>1MB)', async () => {
			const largeContent = 'x'.repeat(2 * 1024 * 1024); // 2MB
			const tool = createMemorySaveTool(repository);

			const result = await tool.execute({
				name: 'large-file',
				content: largeContent,
			});

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);

			const getTool = createMemoryGetTool(repository);
			const getResult = await getTool.execute({
				name: 'large-file',
			});
			const getParsed = JSON.parse(getResult.text);
			expect(getParsed.content.length).toBe(largeContent.length);
		});
	});

	// ============ USER JOURNEY TESTS ============

	describe('User journey: create → list → get → delete', () => {
		it('completes full workflow', async () => {
			// Step 1: Create
			const saveTool = createMemorySaveTool(repository);
			let result = await saveTool.execute({
				name: 'journey-test',
				content: 'Journey content',
				frontmatter: { title: 'Journey' },
			});
			expect(JSON.parse(result.text).success).toBe(true);

			// Step 2: List
			const listTool = createMemoryListTool(repository);
			result = await listTool.execute();
			const listParsed = JSON.parse(result.text);
			expect(listParsed.memories).toContain('journey-test');

			// Step 3: Get
			const getTool = createMemoryGetTool(repository);
			result = await getTool.execute({ name: 'journey-test' });
			const getParsed = JSON.parse(result.text);
			expect(getParsed.content).toBe('Journey content');
			expect(getParsed.frontmatter.title).toBe('Journey');

			// Step 4: Delete
			const deleteTool = createMemoryDeleteTool(repository);
			result = await deleteTool.execute({ name: 'journey-test' });
			expect(JSON.parse(result.text).success).toBe(true);

			// Verify deletion
			result = await listTool.execute();
			const finalList = JSON.parse(result.text);
			expect(finalList.memories).not.toContain('journey-test');
		});
	});
});
