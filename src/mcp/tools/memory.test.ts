import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	createMemoryGetTool,
	createMemorySaveTool,
	createMemoryListTool,
	createMemoryDeleteTool,
	createMemoryContextTool,
	createMemoryUpdateTool,
} from './memory';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

describe('Memory Tools', () => {
	let mockRepository: MemoryRepository;

	beforeEach(() => {
		mockRepository = {
			getMemory: vi.fn(),
			saveMemory: vi.fn(),
			listMemories: vi.fn(),
			deleteMemory: vi.fn(),
		} as unknown as MemoryRepository;

		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	describe('createMemoryGetTool', () => {
		it('should return memory data on successful get', async () => {
			const mockData = {
				frontmatter: { title: 'Test Memory' },
				content: 'This is test content.',
			};

			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValueOnce(mockData);

			const tool = createMemoryGetTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			expect(result).toEqual({
				type: 'text',
				text: JSON.stringify({
					frontmatter: { title: 'Test Memory' },
					content: 'This is test content.',
				}),
			});
			expect(mockRepository.getMemory).toHaveBeenCalledWith(
				'test-memory',
			);
		});

		it('should return error object when memory not found', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(
				new FileNotFoundError('.devflow/memory/test-memory.md'),
			);

			const tool = createMemoryGetTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Memory not found',
				name: 'test-memory',
			});
		});

		it('should return error object for validation errors', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(
				new ValidationError('Invalid memory file format'),
			);

			const tool = createMemoryGetTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Invalid memory file',
				message: 'Invalid memory file format',
			});
		});

		it('should return error object for generic errors', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Unexpected error'));

			const tool = createMemoryGetTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Failed to get memory',
				message: 'Unexpected error',
			});
		});

		it('should have correct tool metadata', () => {
			const tool = createMemoryGetTool(mockRepository);

			expect(tool.name).toBe('memory-get');
			expect(tool.description).toBe('Get a memory file by name');
			expect(tool.parameters).toBeDefined();
		});
	});

	describe('createMemorySaveTool', () => {
		it('should save memory successfully with frontmatter', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0);

			const tool = createMemorySaveTool(mockRepository);
			const result = await tool.execute({
				name: 'test-memory',
				frontmatter: { title: 'Test', created: '2024-01-01' },
				content: 'Test content',
			});

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				success: true,
				message: 'Memory saved',
				name: 'test-memory',
			});
			expect(mockRepository.saveMemory).toHaveBeenCalledWith(
				'test-memory',
				{
					frontmatter: { title: 'Test', created: '2024-01-01' },
					content: 'Test content',
				},
			);
		});

		it('should save memory successfully with empty frontmatter', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0);

			const tool = createMemorySaveTool(mockRepository);
			const result = await tool.execute({
				name: 'test-memory',
				content: 'Test content',
			});

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				success: true,
				message: 'Memory saved',
				name: 'test-memory',
			});
			expect(mockRepository.saveMemory).toHaveBeenCalledWith(
				'test-memory',
				{
					frontmatter: {},
					content: 'Test content',
				},
			);
		});

		it('should return error object for validation errors', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new ValidationError('Invalid content'));

			const tool = createMemorySaveTool(mockRepository);
			const result = await tool.execute({
				name: 'test-memory',
				content: 'Test content',
			});

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Validation failed',
				message: 'Invalid content',
			});
		});

		it('should return error object for generic errors', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Write failed'));

			const tool = createMemorySaveTool(mockRepository);
			const result = await tool.execute({
				name: 'test-memory',
				content: 'Test content',
			});

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Failed to save memory',
				message: 'Write failed',
			});
		});

		it('should have correct tool metadata', () => {
			const tool = createMemorySaveTool(mockRepository);

			expect(tool.name).toBe('memory-save');
			expect(tool.description).toBe('Save or update a memory file');
			expect(tool.parameters).toBeDefined();
		});

		describe('createMemoryContextTool', () => {
			it('should return combined activeContext and progress', async () => {
				const mockActiveContext = {
					frontmatter: {},
					content: '# Current Work\n\nWorking on feature X',
				};
				const mockProgress = {
					frontmatter: {},
					content: '# Milestone 1\n\nCompleted 3/5 tasks',
				};

				(mockRepository.getMemory as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce(mockActiveContext)
					.mockResolvedValueOnce(mockProgress);

				const tool = createMemoryContextTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('# Active Context');
				expect(result.text).toContain('Working on feature X');
				expect(result.text).toContain('# Progress');
				expect(result.text).toContain('Completed 3/5 tasks');
			});

			it('should handle missing activeContext gracefully', async () => {
				const mockProgress = {
					frontmatter: {},
					content: '# Milestone 1\n\nCompleted 3/5 tasks',
				};

				(mockRepository.getMemory as ReturnType<typeof vi.fn>)
					.mockRejectedValueOnce(
						new FileNotFoundError(
							'.devflow/memory/activeContext.md',
						),
					)
					.mockResolvedValueOnce(mockProgress);

				const tool = createMemoryContextTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('# Progress');
				expect(result.text).toContain('Completed 3/5 tasks');
			});

			it('should return message when no files found', async () => {
				(mockRepository.getMemory as ReturnType<typeof vi.fn>)
					.mockRejectedValueOnce(
						new FileNotFoundError(
							'.devflow/memory/activeContext.md',
						),
					)
					.mockRejectedValueOnce(
						new FileNotFoundError('.devflow/memory/progress.md'),
					);

				const tool = createMemoryContextTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('No memory files found');
				expect(result.text).toContain('memory-init');
			});
		});

		describe('createMemoryUpdateTool', () => {
			it('should return all 4 memory files with workflow guide', async () => {
				const mockFiles = {
					projectContext: {
						frontmatter: {},
						content: '# Project Overview\n\nThis is a test project',
					},
					activeContext: {
						frontmatter: {},
						content: '# Current Work\n\nWorking on feature X',
					},
					progress: {
						frontmatter: {},
						content: '# Milestone 1\n\nCompleted 3/5 tasks',
					},
					decisionLog: {
						frontmatter: {},
						content: '# Decision 001\n\nUse TypeScript',
					},
				};

				(mockRepository.getMemory as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce(mockFiles.projectContext)
					.mockResolvedValueOnce(mockFiles.activeContext)
					.mockResolvedValueOnce(mockFiles.progress)
					.mockResolvedValueOnce(mockFiles.decisionLog);

				const tool = createMemoryUpdateTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('Memory Bank Update Workflow');
				expect(result.text).toContain('Project Context');
				expect(result.text).toContain('Active Context');
				expect(result.text).toContain('Progress');
				expect(result.text).toContain('Decision Log');
				expect(result.text).toContain('This is a test project');
				expect(result.text).toContain('Working on feature X');
				expect(result.text).toContain('Completed 3/5 tasks');
				expect(result.text).toContain('Use TypeScript');
			});

			it('should include workflow checklist', async () => {
				(
					mockRepository.getMemory as ReturnType<typeof vi.fn>
				).mockResolvedValue({ frontmatter: {}, content: 'Content' });

				const tool = createMemoryUpdateTool(mockRepository);
				const result = await tool.execute();

				expect(result.text).toContain('What to Update');
				expect(result.text).toContain('projectContext.md:');
				expect(result.text).toContain('activeContext.md:');
				expect(result.text).toContain('progress.md:');
				expect(result.text).toContain('decisionLog.md:');
				expect(result.text).toContain('Next Steps After Review');
				expect(result.text).toContain('memory-save');
			});

			it('should handle missing files gracefully', async () => {
				(mockRepository.getMemory as ReturnType<typeof vi.fn>)
					.mockResolvedValueOnce({
						frontmatter: {},
						content: 'Project data',
					})
					.mockRejectedValueOnce(
						new FileNotFoundError(
							'.devflow/memory/activeContext.md',
						),
					)
					.mockResolvedValueOnce({
						frontmatter: {},
						content: 'Progress data',
					})
					.mockRejectedValueOnce(
						new FileNotFoundError('.devflow/memory/decisionLog.md'),
					);

				const tool = createMemoryUpdateTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('Project Context');
				expect(result.text).toContain('Project data');
				expect(result.text).toContain('Active Context (Not Found)');
				expect(result.text).toContain('Progress');
				expect(result.text).toContain('Progress data');
				expect(result.text).toContain('Decision Log (Not Found)');
				expect(result.text).toContain(
					'missing: activeContext, decisionLog',
				);
			});

			it('should return message when all files missing', async () => {
				(
					mockRepository.getMemory as ReturnType<typeof vi.fn>
				).mockRejectedValue(
					new FileNotFoundError('.devflow/memory/test.md'),
				);

				const tool = createMemoryUpdateTool(mockRepository);
				const result = await tool.execute();

				expect(result.type).toBe('text');
				expect(result.text).toContain('No memory files found');
				expect(result.text).toContain('memory-init');
			});
		});
	});

	describe('createMemoryListTool', () => {
		it('should return list of memories', async () => {
			const memories = ['memory1', 'memory2', 'memory3'];
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValueOnce(memories);

			const tool = createMemoryListTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				memories,
				count: 3,
			});
			expect(mockRepository.listMemories).toHaveBeenCalled();
		});

		it('should return empty list when no memories exist', async () => {
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValueOnce([]);

			const tool = createMemoryListTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				memories: [],
				count: 0,
			});
		});

		it('should return error object on list failure', async () => {
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Directory access failed'));

			const tool = createMemoryListTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Failed to list memories',
				message: 'Directory access failed',
			});
		});

		it('should have correct tool metadata', () => {
			const tool = createMemoryListTool(mockRepository);

			expect(tool.name).toBe('memory-list');
			expect(tool.description).toBe(
				'List all memory files in the memory bank',
			);
		});
	});

	describe('createMemoryDeleteTool', () => {
		it('should delete memory successfully', async () => {
			(
				mockRepository.deleteMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0);

			const tool = createMemoryDeleteTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				success: true,
				message: 'Memory deleted',
				name: 'test-memory',
			});
			expect(mockRepository.deleteMemory).toHaveBeenCalledWith(
				'test-memory',
			);
		});

		it('should return error object when memory not found', async () => {
			(
				mockRepository.deleteMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(
				new FileNotFoundError('.devflow/memory/test-memory.md'),
			);

			const tool = createMemoryDeleteTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Memory not found',
				name: 'test-memory',
			});
		});

		it('should return error object for generic errors', async () => {
			(
				mockRepository.deleteMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Permission denied'));

			const tool = createMemoryDeleteTool(mockRepository);
			const result = await tool.execute({ name: 'test-memory' });

			const parsed = JSON.parse(
				(result as { type: string; text: string }).text,
			);
			expect(parsed).toEqual({
				error: 'Failed to delete memory',
				message: 'Permission denied',
			});
		});

		it('should have correct tool metadata', () => {
			const tool = createMemoryDeleteTool(mockRepository);

			expect(tool.name).toBe('memory-delete');
			expect(tool.description).toBe('Delete a memory file by name');
			expect(tool.parameters).toBeDefined();
		});
	});

	describe('Input validation', () => {
		it('should validate memory:get input', async () => {
			const tool = createMemoryGetTool(mockRepository);

			expect(() => {
				tool.parameters?.parse({ name: '' });
			}).toThrow();
		});

		it('should validate memory:save input', async () => {
			const tool = createMemorySaveTool(mockRepository);

			expect(() => {
				tool.parameters?.parse({ name: '', content: 'test' });
			}).toThrow();

			expect(() => {
				tool.parameters?.parse({ name: 'test', content: '' });
			}).not.toThrow();
		});

		it('should validate memory:delete input', async () => {
			const tool = createMemoryDeleteTool(mockRepository);

			expect(() => {
				tool.parameters?.parse({ name: '' });
			}).toThrow();
		});

		it('should accept optional frontmatter in memory:save', async () => {
			const tool = createMemorySaveTool(mockRepository);

			expect(() => {
				tool.parameters?.parse({
					name: 'test',
					content: 'content',
					frontmatter: { key: 'value' },
				});
			}).not.toThrow();

			expect(() => {
				tool.parameters?.parse({
					name: 'test',
					content: 'content',
				});
			}).not.toThrow();
		});
	});
});
