import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { registerContextTools } from '../../../src/mcp/tools/context';
import { createStorageEngine } from '../../../src/core/storage/engine';
import { GitAnalyzer } from '../../../src/core/analysis/git/git-analyzer';
import { createTestProject } from '../../helpers/test-helpers';

describe('MCP Tools - Context', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;
	let storage: ReturnType<typeof createStorageEngine>;
	let gitAnalyzer: GitAnalyzer;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);

		storage = createStorageEngine({ rootPath: testProject.root });
		gitAnalyzer = new GitAnalyzer(testProject.root);

		registerContextTools(server, engine, storage, gitAnalyzer);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register context tools without errors', () => {
		expect(() => {
			registerContextTools(server, engine, storage, gitAnalyzer);
		}).not.toThrow();
	});
});
