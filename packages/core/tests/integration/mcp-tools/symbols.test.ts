import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../../src/core/analysis/plugins/typescript';
import { registerSymbolTools } from '../../../src/mcp/tools/symbols';
import { createTestProject } from '../../helpers/test-helpers';

describe('MCP Tools - Symbols', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;

	beforeEach(async () => {
		testProject = await createTestProject();
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		const tsPlugin = new TypeScriptPlugin(testProject.root);
		engine.registerPlugin(tsPlugin);

		registerSymbolTools(server, engine);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register symbol tools without errors', () => {
		expect(() => {
			registerSymbolTools(server, engine);
		}).not.toThrow();
	});
});
