import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { registerArchitectureTools } from '../../../src/mcp/tools/architecture';
import { createTestProject } from '../../setup/test-helpers';

describe('MCP Tools - Architecture', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);

		registerArchitectureTools(server, engine);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register architecture tools without errors', () => {
		expect(() => {
			registerArchitectureTools(server, engine);
		}).not.toThrow();
	});
});
