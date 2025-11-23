import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryUpdatePrompt } from './memory-update';
import type { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

describe('Memory Update Prompt', () => {
	let mockRepository: MemoryRepository;

	beforeEach(() => {
		mockRepository = {
			getMemory: vi.fn(),
			saveMemory: vi.fn(),
			listMemories: vi.fn(),
			deleteMemory: vi.fn(),
		} as unknown as MemoryRepository;
	});

	describe('createMemoryUpdatePrompt', () => {
		it('should return a prompt with correct metadata', () => {
			const prompt = createMemoryUpdatePrompt(mockRepository);

			expect(prompt.name).toBe('memory:update');
			expect(prompt.description).toContain('Review all memory');
			expect(prompt.description).toContain('workflow');
			expect(prompt.arguments).toEqual([]);
			expect(prompt.load).toBeDefined();
		});

		it('should load all 4 memory files when they exist', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					frontmatter: { category: 'project-info' },
					content: '# Project Context\n\nProject overview',
				})
				.mockResolvedValueOnce({
					frontmatter: { category: 'active-work' },
					content: '# Active Context\n\nCurrent work',
				})
				.mockResolvedValueOnce({
					frontmatter: { category: 'tracking' },
					content: '# Progress\n\nMilestones',
				})
				.mockResolvedValueOnce({
					frontmatter: { category: 'decisions' },
					content: '# Decision Log\n\nDecisions',
				});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toBeDefined();
			expect(result).toContain('Memory Bank Update Workflow');
			expect(result).toContain('Project Context');
			expect(result).toContain('Active Context');
			expect(result).toContain('Progress');
			expect(result).toContain('Decision Log');
		});

		it('should include workflow instructions', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Update Process');
			expect(result).toContain('Review ALL files');
			expect(result).toContain('Document Current State');
			expect(result).toContain('Clarify Next Steps');
			expect(result).toContain('Document Insights');
		});

		it('should include focus areas for each file', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Focus Areas');
			expect(result).toContain('activeContext.md');
			expect(result).toContain('progress.md');
			expect(result).toContain('projectContext.md');
			expect(result).toContain('decisionLog.md');
		});

		it('should include update checklist for each file type', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('What to Update');
			expect(result).toContain('projectContext.md:');
			expect(result).toContain('activeContext.md:');
			expect(result).toContain('progress.md:');
			expect(result).toContain('decisionLog.md:');
		});

		it('should include example of how to use memory-save tool', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('memory-save');
			expect(result).toContain('Next Steps After Review');
		});

		it('should handle missing memory files gracefully', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					frontmatter: {},
					content: '# Project Context',
				})
				.mockRejectedValueOnce(new FileNotFoundError('Not found'))
				.mockResolvedValueOnce({
					frontmatter: {},
					content: '# Progress',
				})
				.mockResolvedValueOnce({
					frontmatter: {},
					content: '# Decision Log',
				});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toBeDefined();
			expect(result).toContain('Not Found');
			expect(result).toContain('memory-init');
		});

		it('should handle all files missing', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new FileNotFoundError('Not found'));

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toBeDefined();
			expect(result).toContain('No memory files found');
		});

		it('should display files in markdown code blocks', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: '# Test\n\nContent here',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('```markdown');
			expect(result).toContain('# Test');
			expect(result).toContain('Content here');
			expect(result).toContain('```');
		});

		it('should include tips for updating memory', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Tips');
			expect(result).toContain('Be specific');
			expect(result).toContain('Link decisions');
			expect(result).toContain('Archive old work');
		});

		it('should include status summary at the end', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' })
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' })
				.mockRejectedValueOnce(new FileNotFoundError('Not found'))
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' });

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Status:');
			expect(result).toContain('Successfully loaded');
			expect(result).toContain('memory-save');
		});

		it('should call getMemory for each file', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			await prompt.load?.({} as never);

			expect(mockRepository.getMemory).toHaveBeenCalledTimes(4);
		});

		it('should call getMemory with correct file names', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			await prompt.load?.({} as never);

			const calls = (mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mock.calls;
			const fileNames = calls.map((call) => call[0]);

			expect(fileNames).toContain('projectContext');
			expect(fileNames).toContain('activeContext');
			expect(fileNames).toContain('progress');
			expect(fileNames).toContain('decisionLog');
		});

		it('should handle validation errors gracefully', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({
					frontmatter: {},
					content: 'Content',
				})
				.mockRejectedValueOnce(new ValidationError('Invalid format'))
				.mockResolvedValueOnce({
					frontmatter: {},
					content: 'Content',
				})
				.mockResolvedValueOnce({
					frontmatter: {},
					content: 'Content',
				});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toBeDefined();
			expect(result).toContain('Error Loading');
		});

		it('should preserve file content in output', async () => {
			const testContent = '# Test\n\nSpecific content to preserve';

			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: testContent,
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain(testContent);
		});

		it('should include instructions for archiving old entries', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Archive old entries');
			expect(result).toContain('30 days');
		});

		it('should include instructions for documenting blockers', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Document blockers');
			expect(result).toContain('Severity');
			expect(result).toContain('impact');
		});

		it('should format output as markdown', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('# Memory Bank Update Workflow');
			expect(result).toMatch(/^## /m);
			expect(result).toContain('---');
		});

		it('should load prompt arguments as empty array', async () => {
			const prompt = createMemoryUpdatePrompt(mockRepository);

			expect(prompt.arguments).toEqual([]);
		});

		it('should provide clear instructions for memory-save usage', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('name');
			expect(result).toContain('content');
			expect(result).toContain('frontmatter');
			expect(result).toContain('category');
		});

		it('should mention memory-list and memory-get tools', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('memory-list');
			expect(result).toContain('memory-get');
		});

		it('should include tracking metrics guidance', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Content',
			});

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('Track metrics');
			expect(result).toContain('Velocity');
		});

		it('should format status summary with file count', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' })
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' })
				.mockRejectedValueOnce(new FileNotFoundError('Not found'))
				.mockResolvedValueOnce({ frontmatter: {}, content: 'Content' });

			const prompt = createMemoryUpdatePrompt(mockRepository);
			const result = await prompt.load?.({} as never);

			expect(result).toContain('3/4');
			expect(result).toContain('missing');
		});
	});
});
