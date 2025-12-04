import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { GitAnalyzer } from '../../../src/core/analysis/git/git-analyzer';
import { registerGitTools } from '../../../src/mcp/tools/git';
import { createTestProject } from '../../setup/test-helpers';

describe('MCP Tools - Git', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let gitAnalyzer: GitAnalyzer;

	beforeEach(async () => {
		testProject = await createTestProject({ withGit: true });
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		gitAnalyzer = new GitAnalyzer(testProject.root);

		registerGitTools(server, gitAnalyzer);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register git tools without errors', () => {
		expect(() => {
			registerGitTools(server, gitAnalyzer);
		}).not.toThrow();
	});
});
