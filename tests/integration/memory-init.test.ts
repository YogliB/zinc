import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
import { createMemoryInitTool } from '../../src/mcp/tools/memory-init';

describe('[Integration] Memory Init Tool End-to-End', () => {
	let temporaryDirectory: string;
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		const prefix = path.join(os.tmpdir(), 'memory-init-test-');
		temporaryDirectory = await mkdtemp(prefix);

		storageEngine = new StorageEngine({
			rootPath: temporaryDirectory,
			debug: false,
		});

		repository = new MemoryRepository({
			storageEngine,
		});
	});

	afterEach(async () => {
		try {
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Cleanup might fail in some cases
		}
	});

	it('should create all 4 core memory files', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		expect(result.type).toBe('text');

		const parsed = JSON.parse(result.text);
		expect(parsed.success).toBe(true);
		expect(parsed.filesCreated).toHaveLength(4);

		const memories = await repository.listMemories();
		expect(memories).toContain('projectContext');
		expect(memories).toContain('activeContext');
		expect(memories).toContain('progress');
		expect(memories).toContain('decisionLog');
	});

	it('should create files with proper structure', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectContext = await repository.getMemory('projectContext');
		expect(projectContext.content).toContain('# Project Context');
		expect(projectContext.frontmatter.category).toBe('project-info');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('# Active Context');
		expect(activeContext.frontmatter.category).toBe('active-work');

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('# Progress');
		expect(progress.frontmatter.category).toBe('tracking');

		const decisionLog = await repository.getMemory('decisionLog');
		expect(decisionLog.content).toContain('# Decision Log');
		expect(decisionLog.frontmatter.category).toBe('decisions');
	});

	it('should create files with placeholders for user to fill', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectContext = await repository.getMemory('projectContext');
		expect(projectContext.content).toContain('[');
		expect(projectContext.content).toContain(']');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('[DATE]');

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('[Milestone Name]');

		const decisionLog = await repository.getMemory('decisionLog');
		expect(decisionLog.content).toContain('[Decision Title]');
	});

	it('should return correct path in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		expect(parsed.path).toBe('.devflow/memory');
	});

	it('should include timestamp in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		expect(parsed.timestamp).toBeDefined();

		const timestamp = new Date(parsed.timestamp);
		expect(timestamp).toBeInstanceOf(Date);
		expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
	});

	it('should create files with content readable by get tool', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const files = [
			'projectContext',
			'activeContext',
			'progress',
			'decisionLog',
		];

		for (const fileName of files) {
			const memory = await repository.getMemory(fileName);
			expect(memory).toBeDefined();
			expect(memory.content).toBeDefined();
			expect(memory.content.length).toBeGreaterThan(0);
			expect(memory.frontmatter).toBeDefined();
		}
	});

	it('should create files with proper frontmatter for each type', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectContext = await repository.getMemory('projectContext');
		expect(projectContext.frontmatter).toHaveProperty(
			'category',
			'project-info',
		);
		expect(projectContext.frontmatter).toHaveProperty('created');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.frontmatter).toHaveProperty(
			'category',
			'active-work',
		);
		expect(activeContext.frontmatter).toHaveProperty('created');

		const progress = await repository.getMemory('progress');
		expect(progress.frontmatter).toHaveProperty('category', 'tracking');
		expect(progress.frontmatter).toHaveProperty('created');

		const decisionLog = await repository.getMemory('decisionLog');
		expect(decisionLog.frontmatter).toHaveProperty('category', 'decisions');
		expect(decisionLog.frontmatter).toHaveProperty('created');
	});

	it('should return all created file names in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		const filesCreated = parsed.filesCreated;

		expect(filesCreated).toContain('projectContext');
		expect(filesCreated).toContain('activeContext');
		expect(filesCreated).toContain('progress');
		expect(filesCreated).toContain('decisionLog');
	});

	it('should create files with template sections for current context', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('## Current Focus');
		expect(activeContext.content).toContain('## Active Blockers');
		expect(activeContext.content).toContain('## Recent Changes');
		expect(activeContext.content).toContain('## Next Steps');
	});

	it('should create files with template sections for progress', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('## Current Milestone');
		expect(progress.content).toContain('## Completed Milestones');
		expect(progress.content).toContain('## Metrics');
		expect(progress.content).toContain('## Known Issues');
	});

	it('should create files with template sections for decisions', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const decisionLog = await repository.getMemory('decisionLog');
		expect(decisionLog.content).toContain('## Decision');
		expect(decisionLog.content).toContain('### Context');
		expect(decisionLog.content).toContain('### Decision');
		expect(decisionLog.content).toContain('### Rationale');
		expect(decisionLog.content).toContain('### Alternatives Considered');
	});

	it('should work with full initialization workflow', async () => {
		const tool = createMemoryInitTool(repository);

		const directoryBefore = await storageEngine.exists('.devflow/memory');
		expect(directoryBefore).toBe(false);

		const result = await tool.execute({});
		const parsed = JSON.parse(result.text);

		expect(parsed.success).toBe(true);
		expect(parsed.filesCreated).toHaveLength(4);

		const directoryAfter = await storageEngine.exists('.devflow/memory');
		expect(directoryAfter).toBe(true);

		const memories = await repository.listMemories();
		expect(memories.length).toBe(4);
	});

	it('should properly serialize content with markdown formatting', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectContext = await repository.getMemory('projectContext');

		expect(projectContext.content).toMatch(/^# Project Context/);
		expect(projectContext.content).toMatch(/## Project Overview/);
		expect(projectContext.content).toMatch(/### /);

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toMatch(/^# Active Context/);
		expect(activeContext.content).toMatch(/\*\*Last Updated:\*\*/);
	});
});
