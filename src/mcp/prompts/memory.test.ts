import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryLoadPrompt } from './memory';
import type { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

describe('Memory Prompts', () => {
	let mockRepository: MemoryRepository;

	beforeEach(() => {
		mockRepository = {
			getMemory: vi.fn(),
			saveMemory: vi.fn(),
			listMemories: vi.fn(),
			deleteMemory: vi.fn(),
		} as unknown as MemoryRepository;
	});

	describe('createMemoryLoadPrompt', () => {
		it('should return a prompt with correct metadata', () => {
			const prompt = createMemoryLoadPrompt(mockRepository);

			expect(prompt.name).toBe('memory:load');
			expect(prompt.description).toContain('Zed workaround');
			expect(prompt.arguments).toHaveLength(1);
			expect(prompt.arguments?.[0]?.name).toBe('name');
			expect(prompt.arguments?.[0]?.required).toBe(true);
			expect(prompt.load).toBeDefined();
		});

		it('should load a memory file successfully', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: { title: 'Test' },
				content: 'Test content',
			});

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: 'test' });

			expect(result).toBeDefined();
			expect(result).toContain('---');
			expect(result).toContain('title: "Test"');
			expect(result).toContain('Test content');
		});

		it('should load a memory file without frontmatter', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Plain content',
			});

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: 'plain' });

			expect(result).toBeDefined();
			expect(result).toBe('Plain content');
			expect(result).not.toContain('---');
		});

		it('should handle missing memory file', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new FileNotFoundError('Not found'));

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: 'missing' });

			expect(result).toBeDefined();
			expect(result).toContain('Error: Memory Not Found');
			expect(result).toContain('missing');
		});

		it('should handle validation errors', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new ValidationError('Invalid name'));

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: '../invalid' });

			expect(result).toBeDefined();
			expect(result).toContain('Error: Invalid Memory Name');
			expect(result).toContain('Invalid name');
		});

		it('should handle unexpected errors', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new Error('Unexpected error'));

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: 'test' });

			expect(result).toBeDefined();
			expect(result).toContain('Error: Failed to Load Memory');
			expect(result).toContain('Unexpected error');
		});

		it('should format frontmatter correctly with multiple fields', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {
					title: 'Multi Field',
					category: 'test',
					tags: ['tag1', 'tag2'],
				},
				content: 'Content here',
			});

			const prompt = createMemoryLoadPrompt(mockRepository);
			const result = await prompt.load?.({ name: 'multi' });

			expect(result).toBeDefined();
			expect(result).toContain('---');
			expect(result).toContain('title: "Multi Field"');
			expect(result).toContain('category: "test"');
			expect(result).toContain('tags: ["tag1","tag2"]');
			expect(result).toContain('Content here');
		});

		it('should call repository.getMemory with correct name', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Test',
			});

			const prompt = createMemoryLoadPrompt(mockRepository);
			await prompt.load?.({ name: 'test-name' });

			expect(mockRepository.getMemory).toHaveBeenCalledWith('test-name');
		});
	});
});
