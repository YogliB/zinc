import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createContextResource, createMemoryResourceTemplate } from './memory';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';
import type { ResourceResult } from 'fastmcp';

function isTextResourceResult(
	result: ResourceResult | ResourceResult[],
): result is Extract<ResourceResult, { text: string }> {
	return !Array.isArray(result) && 'text' in result;
}

describe('Memory Resources', () => {
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

	describe('createContextResource', () => {
		it('should return a resource with correct metadata', () => {
			const resource = createContextResource(mockRepository);

			expect(resource.uri).toBe('devflow://context/memory');
			expect(resource.name).toBe('Memory Bank Context');
			expect(resource.description).toContain('activeContext');
			expect(resource.mimeType).toBe('text/markdown');
			expect(typeof resource.load).toBe('function');
		});

		it('should load both activeContext and progress when both exist', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockImplementation(async (name: string) => {
				if (name === 'activeContext') {
					return {
						frontmatter: {},
						content: 'Active context content here',
					};
				}
				if (name === 'progress') {
					return {
						frontmatter: {},
						content: 'Progress content here',
					};
				}
				throw new FileNotFoundError(`Memory "${name}" not found`);
			});

			const resource = createContextResource(mockRepository);
			const rawResult = await resource.load!();
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('# Active Context');
			expect(result.text).toContain('Active context content here');
			expect(result.text).toContain('# Progress');
			expect(result.text).toContain('Progress content here');
			expect(result.mimeType).toBe('text/markdown');
			expect(result.uri).toBe('devflow://context/memory');
		});

		it('should handle missing activeContext gracefully', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockImplementation(async (name: string) => {
				if (name === 'activeContext') {
					throw new FileNotFoundError(
						'Memory "activeContext" not found',
					);
				}
				if (name === 'progress') {
					return {
						frontmatter: {},
						content: 'Progress content here',
					};
				}
				throw new FileNotFoundError(`Memory "${name}" not found`);
			});

			const resource = createContextResource(mockRepository);
			const rawResult = await resource.load!();
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).not.toContain('# Active Context');
			expect(result.text).toContain('# Progress');
			expect(result.text).toContain('Progress content here');
			expect(result.text).not.toContain('undefined');
		});

		it('should handle missing progress gracefully', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockImplementation(async (name: string) => {
				if (name === 'activeContext') {
					return {
						frontmatter: {},
						content: 'Active context content here',
					};
				}
				if (name === 'progress') {
					throw new FileNotFoundError('Memory "progress" not found');
				}
				throw new FileNotFoundError(`Memory "${name}" not found`);
			});

			const resource = createContextResource(mockRepository);
			const rawResult = await resource.load!();
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('# Active Context');
			expect(result.text).toContain('Active context content here');
			expect(result.text).not.toContain('# Progress');
		});

		it('should handle both files missing gracefully', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new FileNotFoundError('Memory not found'));

			const resource = createContextResource(mockRepository);
			const rawResult = await resource.load!();
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('No memory files found');
			expect(result.mimeType).toBe('text/markdown');
		});

		it('should handle unexpected errors gracefully', async () => {
			(mockRepository.getMemory as ReturnType<typeof vi.fn>)
				.mockRejectedValueOnce(new Error('Database connection failed'))
				.mockResolvedValueOnce({
					frontmatter: {},
					content: 'Progress content',
				});

			const resource = createContextResource(mockRepository);
			const rawResult = await resource.load!();
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('# Progress');
			expect(result.text).toContain('Progress content');
			expect(result.text).not.toContain('Database connection failed');
		});
	});

	describe('createMemoryResourceTemplate', () => {
		it('should return a resource template with correct metadata', () => {
			const template = createMemoryResourceTemplate(mockRepository);

			expect(template.uriTemplate).toBe('devflow://memory/{name}');
			expect(template.name).toBe('Memory File');
			expect(template.description).toContain('individual memory file');
			expect(template.mimeType).toBe('text/markdown');
			expect(template.arguments).toHaveLength(1);
			expect(template.arguments[0].name).toBe('name');
			expect(template.arguments[0].required).toBe(true);
			expect(typeof template.load).toBe('function');
		});

		it('should load a memory file successfully', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: { status: 'active' },
				content: 'Test memory content',
			});

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({ name: 'testMemory' });
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('status: "active"');
			expect(result.text).toContain('Test memory content');
			expect(result.mimeType).toBe('text/markdown');
			expect(result.uri).toBe('devflow://memory/testMemory');
		});

		it('should load a memory file without frontmatter', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'Just plain content',
			});

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({ name: 'plain' });
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toBe('Just plain content');
			expect(result.text).not.toContain('---');
		});

		it('should handle missing memory file', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(
				new FileNotFoundError('Memory "missing" not found'),
			);

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({ name: 'missing' });
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('Error: Memory Not Found');
			expect(result.text).toContain('could not be found');
			expect(result.uri).toBe('devflow://memory/missing');
			expect(result.mimeType).toBe('text/markdown');
		});

		it('should handle invalid memory name (path traversal)', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(
				new ValidationError('path traversal is not allowed'),
			);

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({
				name: '../etc/passwd',
			});
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('Error: Invalid Memory Name');
			expect(result.text).toContain('path traversal is not allowed');
			expect(result.uri).toBe('devflow://memory/../etc/passwd');
		});

		it('should handle unexpected errors', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockRejectedValue(new Error('Unexpected failure'));

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({ name: 'test' });
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('Error: Failed to Load Memory');
			expect(result.text).toContain('Unexpected failure');
		});

		it('should format frontmatter correctly with multiple fields', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {
					status: 'in-progress',
					priority: 'high',
					tags: ['important', 'urgent'],
				},
				content: 'Memory content',
			});

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({
				name: 'complex',
			});
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toContain('---');
			expect(result.text).toContain('status: "in-progress"');
			expect(result.text).toContain('priority: "high"');
			expect(result.text).toContain('tags:');
			expect(result.text).toContain('Memory content');
		});

		it('should preserve special characters in content', async () => {
			const specialContent =
				'Line 1\nLine 2 with `code`\nLine 3 with "quotes"';
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: specialContent,
			});

			const template = createMemoryResourceTemplate(mockRepository);
			const rawResult = await template.load!({
				name: 'special',
			});
			expect(isTextResourceResult(rawResult)).toBe(true);
			const result = rawResult as Extract<
				ResourceResult,
				{ text: string }
			>;

			expect(result.text).toBe(specialContent);
		});

		it('should call repository.getMemory with correct name', async () => {
			(
				mockRepository.getMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue({
				frontmatter: {},
				content: 'content',
			});

			const template = createMemoryResourceTemplate(mockRepository);
			await template.load!({ name: 'testname' });

			expect(mockRepository.getMemory).toHaveBeenCalledWith('testname');
		});
	});
});
