import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { registerGraphTools } from '../../../src/mcp/tools/graph';
import { createTestProject } from '../../helpers/test-helpers';

describe('MCP Tools - Graph', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);

		registerGraphTools(server, engine);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register graph tools without errors', () => {
		expect(() => {
			registerGraphTools(server, engine);
		}).not.toThrow();
	});
});
