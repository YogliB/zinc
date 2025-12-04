import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastMCP } from 'fastmcp';
import { AnalysisEngine } from '../../../src/core/analysis/engine';
import { createStorageEngine } from '../../../src/core/storage/engine';
import { registerProjectTools } from '../../../src/mcp/tools/project';
import { createTestProject } from '../../setup/test-helpers';

describe('MCP Tools - Project', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let server: FastMCP;
	let engine: AnalysisEngine;
	let storage: ReturnType<typeof createStorageEngine>;

	beforeEach(async () => {
		testProject = await createTestProject({ withTsConfig: true });
		server = new FastMCP({ name: 'test', version: '0.1.0' });
		engine = new AnalysisEngine(testProject.root);
		storage = createStorageEngine({
			rootPath: testProject.root,
			debug: false,
		});

		registerProjectTools(server, engine, storage);
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register getProjectOnboarding tool', () => {
		expect(() => {
			registerProjectTools(server, engine, storage);
		}).not.toThrow();
	});

	it('should register tools without errors', () => {
		expect(() => {
			registerProjectTools(server, engine, storage);
		}).not.toThrow();
	});
});
