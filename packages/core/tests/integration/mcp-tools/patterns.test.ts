import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { registerPatternTools } from '../../../src/mcp/tools/patterns';
import { createTestProject } from '../../setup/test-helpers';

describe('MCP Tools - Patterns', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);

		registerPatternTools(server, engine);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register pattern tools without errors', () => {
		expect(() => {
			registerPatternTools(server, engine);
		}).not.toThrow();
	});
});
