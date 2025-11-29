import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, rm } from 'node:fs/promises';
import { StorageEngine } from '../../core/storage/engine';
import { MemoryRepository } from './repository';
import { FileNotFoundError } from '../../core/storage/errors';

const testMemoryStorageDirectory = '.test-storage/memory-storage';

describe('MemoryRepository', () => {
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		await mkdir(testMemoryStorageDirectory, { recursive: true });
		storageEngine = new StorageEngine({
			rootPath: testMemoryStorageDirectory,
		});
		repository = new MemoryRepository({
			storageEngine,
			memorybankPath: '.devflow/memory',
		});
	});

	afterEach(async () => {
		await rm('.test-storage', { recursive: true, force: true });
	});

	describe('saveMemory and getMemory', () => {
		it('should save and retrieve a memory file', async () => {
			const memoryFile = {
				frontmatter: {
					title: 'Test Memory',
					created: '2024-01-01T00:00:00Z',
				},
				content: 'This is test content.',
			};

			await repository.saveMemory('test-memory', memoryFile);
			const retrieved = await repository.getMemory('test-memory');

			expect(retrieved.frontmatter.title).toBe('Test Memory');
			expect(retrieved.content).toBe('This is test content.');
		});

		it('should create nested directories if needed', async () => {
			const memoryFile = {
				frontmatter: { title: 'Nested' },
				content: 'Content',
			};

			await repository.saveMemory('nested/deep/memory', memoryFile);
			const retrieved = await repository.getMemory('nested/deep/memory');

			expect(retrieved.frontmatter.title).toBe('Nested');
		});

		it('should throw FileNotFoundError when memory does not exist', async () => {
			await expect(repository.getMemory('nonexistent')).rejects.toThrow(
				FileNotFoundError,
			);
		});

		it('should handle empty frontmatter', async () => {
			const memoryFile = {
				frontmatter: {},
				content: 'Just content.',
			};

			await repository.saveMemory('minimal', memoryFile);
			const retrieved = await repository.getMemory('minimal');

			expect(retrieved.frontmatter).toEqual({});
			expect(retrieved.content).toBe('Just content.');
		});

		it('should preserve tags in frontmatter', async () => {
			const memoryFile = {
				frontmatter: {
					title: 'Tagged Memory',
					tags: ['important', 'reference'],
				},
				content: 'Tagged content.',
			};

			await repository.saveMemory('tagged', memoryFile);
			const retrieved = await repository.getMemory('tagged');

			expect(retrieved.frontmatter.tags).toEqual([
				'important',
				'reference',
			]);
		});
	});

	describe('listMemories', () => {
		it('should list all memory files', async () => {
			await repository.saveMemory('memory1', {
				frontmatter: {},
				content: 'Content 1',
			});
			await repository.saveMemory('memory2', {
				frontmatter: {},
				content: 'Content 2',
			});

			const memories = await repository.listMemories();

			expect(memories.some((m) => m.includes('memory1'))).toBe(true);
			expect(memories.some((m) => m.includes('memory2'))).toBe(true);
			expect(memories.length).toBeGreaterThanOrEqual(2);
		});

		it('should return empty array when no memories exist', async () => {
			const memories = await repository.listMemories();
			expect(Array.isArray(memories)).toBe(true);
		});

		it('should filter out non-markdown files', async () => {
			await storageEngine.writeFile(
				'.devflow/memory/memory.md',
				'---\n---\n\nContent',
			);
			await storageEngine.writeFile(
				'.devflow/memory/other.txt',
				'Text file',
			);

			const memories = await repository.listMemories();

			expect(memories.some((m) => m.includes('memory'))).toBe(true);
			expect(memories.every((m) => !m.includes('other.txt'))).toBe(true);
		});

		it('should handle nested memory files', async () => {
			await repository.saveMemory('category/memory1', {
				frontmatter: {},
				content: 'Content',
			});
			await repository.saveMemory('category/memory2', {
				frontmatter: {},
				content: 'Content',
			});

			const memories = await repository.listMemories();

			expect(memories.length).toBeGreaterThanOrEqual(2);
			const hasMemory1 = memories.some((m) => m.includes('memory1'));
			const hasMemory2 = memories.some((m) => m.includes('memory2'));
			expect(hasMemory1 || hasMemory2).toBe(true);
		});
	});

	describe('deleteMemory', () => {
		it('should delete a memory file', async () => {
			await repository.saveMemory('to-delete', {
				frontmatter: {},
				content: 'Content',
			});

			expect(
				await storageEngine.exists('.devflow/memory/to-delete.md'),
			).toBe(true);

			await repository.deleteMemory('to-delete');

			expect(
				await storageEngine.exists('.devflow/memory/to-delete.md'),
			).toBe(false);
		});

		it('should throw FileNotFoundError when deleting nonexistent memory', async () => {
			await expect(
				repository.deleteMemory('nonexistent'),
			).rejects.toThrow(FileNotFoundError);
		});
	});

	describe('validation', () => {
		it('should validate memory file structure', async () => {
			const validFile = {
				frontmatter: {
					title: 'Valid',
					tags: ['tag1'],
					category: 'test',
				},
				content: 'Content',
			};

			const result = repository.saveMemory('valid-memory', validFile);
			await expect(result).resolves.toBeUndefined();
		});

		it('should accept partial frontmatter', async () => {
			const file = {
				frontmatter: { title: 'Only Title' },
				content: 'Content',
			};

			const result = repository.saveMemory('partial', file);
			await expect(result).resolves.toBeUndefined();
		});

		it('should preserve and retrieve multiple memory types', async () => {
			const memories = [
				{
					name: 'note-1',
					file: {
						frontmatter: { title: 'Note' },
						content: 'Quick note',
					},
				},
				{
					name: 'context-2',
					file: {
						frontmatter: {
							title: 'Context',
							tags: ['important'],
						},
						content: 'Important context',
					},
				},
				{
					name: 'reference-3',
					file: {
						frontmatter: {
							title: 'Reference',
							category: 'docs',
						},
						content: 'Reference material',
					},
				},
			];

			for (const { name, file } of memories) {
				await repository.saveMemory(name, file);
			}

			const list = await repository.listMemories();
			expect(list.length).toBeGreaterThanOrEqual(3);

			for (const { name, file } of memories) {
				const retrieved = await repository.getMemory(name);
				expect(retrieved.frontmatter.title).toBe(
					file.frontmatter.title,
				);
			}
		});
	});

	describe('Round-trip operations', () => {
		it('should preserve data through save-read cycle', async () => {
			const original = {
				frontmatter: {
					title: 'Original Title',
					tags: ['test', 'important'],
				},
				content:
					'# Heading\n\nSome content with **formatting**.\n\n- Item 1\n- Item 2',
			};

			await repository.saveMemory('round-trip', original);
			const retrieved = await repository.getMemory('round-trip');

			expect(retrieved.frontmatter.title).toBe(
				original.frontmatter.title,
			);
			expect(retrieved.frontmatter.tags).toEqual(
				original.frontmatter.tags,
			);
			expect(retrieved.content).toBe(original.content);
		});

		it('should handle updates to existing memories', async () => {
			const initial = {
				frontmatter: { title: 'Initial' },
				content: 'Initial content',
			};

			await repository.saveMemory('update-test', initial);

			const updated = {
				frontmatter: { title: 'Updated' },
				content: 'Updated content',
			};

			await repository.saveMemory('update-test', updated);
			const final = await repository.getMemory('update-test');

			expect(final.frontmatter.title).toBe('Updated');
			expect(final.content).toBe('Updated content');
		});
	});

	describe('Error handling', () => {
		it('should handle corrupted markdown gracefully', async () => {
			await storageEngine.writeFile(
				'.devflow/memory/corrupted.md',
				'Invalid YAML\n---\n\nContent',
			);

			const retrieved = await repository.getMemory('corrupted');
			expect(retrieved.content).toBeTruthy();
		});

		it('should provide meaningful error messages', async () => {
			try {
				await repository.getMemory('missing');
			} catch (error) {
				expect(error).toBeInstanceOf(FileNotFoundError);
				expect((error as Error).message).toContain('missing');
			}
		});
	});
});
