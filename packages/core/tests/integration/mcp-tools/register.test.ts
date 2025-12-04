import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { createStorageEngine } from '../../../src/core/storage/engine';
import { GitAnalyzer } from '../../../src/core/analysis/git/git-analyzer';
import { registerAllTools } from '../../../src/mcp/tools/register';
import { createTestProject } from '../../setup/test-helpers';

describe('MCP Tools - Register', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;
	let storage: ReturnType<typeof createStorageEngine>;
	let gitAnalyzer: GitAnalyzer;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		storage = createStorageEngine({
			rootPath: testProject.root,
			debug: false,
		});
		gitAnalyzer = new GitAnalyzer(testProject.root);

		registerAllTools(server, engine, storage, gitAnalyzer);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register all tools without errors', () => {
		expect(() => {
			registerAllTools(server, engine, storage, gitAnalyzer);
		}).not.toThrow();
	});
});
