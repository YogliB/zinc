import { describe, it, expect, beforeEach, vi } from 'bun:test';
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
			expect(tool.description).toContain('6 core files');
			expect(tool.execute).toBeDefined();
		});

		it('should initialize memory bank with 6 core files', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(undefined as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text.split('\n\n')[0]!); // Get JSON before deprecation warning
			expect(parsed.success).toBe(true);
			expect(parsed.filesCreated).toHaveLength(6);
			expect(parsed.filesCreated).toContain('projectBrief');
			expect(parsed.filesCreated).toContain('productContext');
			expect(parsed.filesCreated).toContain('systemPatterns');
			expect(parsed.filesCreated).toContain('techContext');
			expect(parsed.filesCreated).toContain('activeContext');
			expect(parsed.filesCreated).toContain('progress');
			expect(parsed.structure).toBe('cline-6-file');
		});

		it('should set correct path in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed.path).toBe('.devflow/memory');
		});

		it('should include timestamp in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed.timestamp).toBeDefined();

			const timestamp = new Date(parsed.timestamp);
			expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
		});

		it('should call saveMemory for each template', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			expect(mockRepository.saveMemory).toHaveBeenCalledTimes(6);
		});

		it('should save files with correct names', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;

			const savedNames = calls.map((call) => call[0]);
			expect(savedNames).toContain('projectBrief');
			expect(savedNames).toContain('productContext');
			expect(savedNames).toContain('systemPatterns');
			expect(savedNames).toContain('techContext');
			expect(savedNames).toContain('activeContext');
			expect(savedNames).toContain('progress');
		});

		it('should save files with frontmatter', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

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
			).mockResolvedValue(void 0 as void);

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
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new ValidationError('Invalid frontmatter'));

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed.success).toBe(false);
			expect(parsed.error).toBe('Validation failed');
			expect(parsed.message).toContain('Invalid frontmatter');
		});

		it('should return error object for generic errors', async () => {
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockRejectedValueOnce(new Error('Write failed'));

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			expect(result.type).toBe('text');

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed.success).toBe(false);
			expect(parsed.error).toBe('Initialization failed');
			expect(parsed.message).toContain('Write failed');
		});

		it('should include success message in result', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed.message).toContain('initialized successfully');
			expect(parsed.message).toContain('6 core files');
		});

		it('should handle optional input schema', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);

			const resultWithoutArgument = await tool.execute();
			expect(resultWithoutArgument.type).toBe('text');

			const parsed = JSON.parse(resultWithoutArgument.text);
			expect(parsed.success).toBe(true);
		});

		it('should create files in correct order', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			await tool.execute();

			const calls = (
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mock.calls;

			expect(calls[0]![0]).toBe('projectBrief');
			expect(calls[1]![0]).toBe('productContext');
			expect(calls[2]![0]).toBe('systemPatterns');
			expect(calls[3]![0]).toBe('techContext');
			expect(calls[4]![0]).toBe('activeContext');
			expect(calls[5]![0]).toBe('progress');
		});

		it('should return proper JSON structure on success', async () => {
			(
				mockRepository.saveMemory as ReturnType<typeof vi.fn>
			).mockResolvedValue(void 0 as void);
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);

			const tool = createMemoryInitTool(mockRepository);
			const result = await tool.execute();

			const parsed = JSON.parse(result.text.split('\n\n')[0]!);
			expect(parsed).toHaveProperty('success');
			expect(parsed).toHaveProperty('message');
			expect(parsed).toHaveProperty('filesCreated');
			expect(parsed).toHaveProperty('path');
			expect(parsed).toHaveProperty('timestamp');
			expect(parsed).toHaveProperty('structure');
			expect(parsed).toHaveProperty('hierarchy');
		});

		it('should return proper JSON structure on error', async () => {
			(
				mockRepository.listMemories as ReturnType<typeof vi.fn>
			).mockResolvedValue([]);
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
