import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMemoryInitTool } from './memory-init';
import type { MemoryRepository } from '../../layers/memory/repository';
import { ValidationError } from '../../core/storage/errors';

describe('Memory Init Tool', () => {
	let mockRepository: MemoryRepository;

	beforeEach(() => {
		mockRepository = {
			getMemory: vi.fn(),
			saveMemory: vi.fn(),
			listMemories: vi.fn(),
			deleteMemory: vi.fn(),
		} as unknown as MemoryRepository;
	});

	describe('createMemoryInitTool', () => {
		it('should return a tool with correct metadata', () => {
			const tool = createMemoryInitTool(mockRepository);

			expect(tool.name).toBe('memory-init');
			expect(tool.description).toContain('memory bank');
			expect(tool.description).toContain('template');
			expect(tool.execute).toBeDefined();
		});

		it('should initialize memory bank with 4 core files', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);
			expect(parsed.filesCreated).toHaveLength(4);
			expect(parsed.filesCreated).toContain('projectContext');
			expect(parsed.filesCreated).toContain('activeContext');
			expect(parsed.filesCreated).toContain('progress');
			expect(parsed.filesCreated).toContain('decisionLog');
		});

		it('should set correct path in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text);
			expect(parsed.path).toBe('.devflow/memory');
		});

		it('should include timestamp in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text);
			expect(parsed.timestamp).toBeDefined();

			const timestamp = new Date(parsed.timestamp);
			expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
		});

		it('should call saveMemory for each template', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			expect(mockRepository.saveMemory).toHaveBeenCalledTimes(4);
		});

		it('should save files with correct names', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;

			const savedNames = calls.map((call) => call[0]);
			expect(savedNames).toContain('projectContext');
			expect(savedNames).toContain('activeContext');
			expect(savedNames).toContain('progress');
			expect(savedNames).toContain('decisionLog');
		});

		it('should save files with frontmatter', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;

			for (const [, data] of calls) {
				expect(data.frontmatter).toBeDefined();
				expect(data.frontmatter.category).toBeDefined();
				expect(data.frontmatter.created).toBeDefined();
			}
		});

		it('should save files with content', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;

			for (const [, data] of calls) {
				expect(data.content).toBeDefined();
				expect(data.content.length).toBeGreaterThan(0);
				expect(data.content).toContain('#');
			}
		});

		it('should return error object when validation fails', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new ValidationError('Invalid frontmatter'));

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(false);
			expect(parsed.error).toBe('Validation failed');
			expect(parsed.message).toContain('Invalid frontmatter');
		});

		it('should return error object for generic errors', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Disk full'));

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(false);
			expect(parsed.error).toBe('Initialization failed');
			expect(parsed.message).toContain('Disk full');
		});

		it('should include success message in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text);
			expect(parsed.message).toContain('initialized successfully');
			expect(parsed.message).toContain('4 core files');
		});

		it('should handle optional input schema', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);

			const resultWithoutArgument = await tool.execute();
			expect(resultWithoutArgument.type).toBe('text');

			const parsed = JSON.parse(resultWithoutArgument.text);
			expect(parsed.success).toBe(true);
		});

		it('should create files in correct order', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;
			const savedNames = calls.map((call) => call[0]);

			expect(savedNames[0]).toBe('projectContext');
			expect(savedNames[1]).toBe('activeContext');
			expect(savedNames[2]).toBe('progress');
			expect(savedNames[3]).toBe('decisionLog');
		});

		it('should return proper JSON structure on success', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text);
			expect(parsed).toHaveProperty('success');
			expect(parsed).toHaveProperty('message');
			expect(parsed).toHaveProperty('filesCreated');
			expect(parsed).toHaveProperty('path');
			expect(parsed).toHaveProperty('timestamp');
		});

		it('should return proper JSON structure on error', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Test error'));

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text);
			expect(parsed).toHaveProperty('success');
			expect(parsed).toHaveProperty('error');
			expect(parsed).toHaveProperty('message');
			expect(parsed.success).toBe(false);
		});
	});
});
