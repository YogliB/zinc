import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
import { createMemoryUpdatePrompt } from '../../src/mcp/prompts/memory-update';
import { createMemoryInitTool } from '../../src/mcp/tools/memory-init';

describe('[Integration] Memory Update Prompt End-to-End', () => {
	let temporaryDirectory: string;
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		const prefix = path.join(os.tmpdir(), 'memory-update-test-');
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

	it('should load all memory files when they exist', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toBeDefined();
		expect(result).toContain('Project Context');
		expect(result).toContain('Active Context');
		expect(result).toContain('Progress');
		expect(result).toContain('Decision Log');
	});

	it('should display memory file contents in code blocks', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('```markdown');
		expect(result).toContain('# Project Context');
		expect(result).toContain('# Active Context');
		expect(result).toContain('```');
	});

	it('should include update workflow instructions', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Update Process');
		expect(result).toContain('Review ALL files');
		expect(result).toContain('Document Current State');
		expect(result).toContain('Clarify Next Steps');
	});

	it('should include focus areas for each file type', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Focus Areas');
		expect(result).toContain('activeContext.md');
		expect(result).toContain('progress.md');
		expect(result).toContain('projectContext.md');
		expect(result).toContain('decisionLog.md');
	});

	it('should include checklists for updating each file', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('What to Update');
		expect(result).toContain('[ ]');
		expect(result).toContain('accurate');
	});

	it('should handle missing files gracefully', async () => {
		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toBeDefined();
		expect(result).toContain('No memory files found');
		expect(result).toContain('memory-init');
	});

	it('should include example memory-save usage', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('memory-save');
		expect(result).toContain('name');
		expect(result).toContain('content');
		expect(result).toContain('frontmatter');
	});

	it('should include tips for best practices', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Tips');
		expect(result).toContain('Be specific');
		expect(result).toContain('Archive old work');
		expect(result).toContain('Update timestamps');
	});

	it('should display status summary showing loaded files', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Status:');
		expect(result).toContain('4/4');
	});

	it('should format output as valid markdown', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toMatch(/^# /m);
		expect(result).toContain('---');
		expect(result).toMatch(/^## /m);
	});

	it('should preserve all template content from memory files', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		const projectContext = await repository.getMemory('projectContext');
		expect(result).toContain(projectContext.content.slice(0, 50));

		const activeContext = await repository.getMemory('activeContext');
		expect(result).toContain(activeContext.content.slice(0, 50));
	});

	it('should include instructions for memory-list and memory-get tools', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('memory-list');
		expect(result).toContain('memory-get');
	});

	it('should work with partial memory state', async () => {
		await repository.saveMemory('projectContext', {
			frontmatter: { category: 'project-info' },
			content: '# Project Context\n\nPartial state',
		});
		await repository.saveMemory('activeContext', {
			frontmatter: { category: 'active-work' },
			content: '# Active Context\n\nPartial state',
		});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toBeDefined();
		expect(result).toContain('Project Context');
		expect(result).toContain('Active Context');
		expect(result).toContain('Not Found');
	});

	it('should include archiving guidance', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Archive');
		expect(result).toContain('30 days');
	});

	it('should include blocker documentation guidance', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('blockers');
		expect(result).toContain('Severity');
		expect(result).toContain('impact');
	});

	it('should include metrics tracking guidance', async () => {
		const initTool = createMemoryInitTool(repository);
		await initTool.execute({});

		const prompt = createMemoryUpdatePrompt(repository);
		const result = await prompt.load?.({} as never);

		expect(result).toContain('Track metrics');
		expect(result).toContain('Velocity');
	});
});
