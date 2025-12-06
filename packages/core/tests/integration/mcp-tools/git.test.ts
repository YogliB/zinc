import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { GitAnalyzer } from '../../../src/core/analysis/git/git-analyzer';
import { registerGitTools } from '../../../src/mcp/tools/git';
import { createTestProject } from '../../helpers/test-helpers';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { createStorageEngine } from '../../../src/core/storage/engine';

describe('MCP Tools - Git', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let gitAnalyzer: GitAnalyzer;
	let engine: AnalysisEngine;
	let storage: ReturnType<typeof createStorageEngine>;

	beforeEach(async () => {
		testProject = await createTestProject({ withGit: true });
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		gitAnalyzer = new GitAnalyzer(testProject.root);
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);
		storage = createStorageEngine({ rootPath: testProject.root });

		registerGitTools(server, gitAnalyzer, storage, engine);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register git tools without errors', () => {
		expect(() => {
			registerGitTools(server, gitAnalyzer, storage, engine);
		}).not.toThrow();
	});
});
