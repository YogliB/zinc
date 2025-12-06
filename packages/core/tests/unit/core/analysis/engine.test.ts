import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnalysisEngine } from '../../../../src/core/analysis/engine';
import { MockLanguagePlugin } from '../../../helpers/mocks';
import {
	createTestProject,
	writeTestFile,
} from '../../../helpers/test-helpers';
import { sampleTypeScriptFile } from '../../../helpers/fixtures';
import type {
	Symbol,
	Relationship,
	Pattern,
} from '../../../../src/core/analysis/types';

describe('AnalysisEngine', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject();
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should register and retrieve plugin', () => {
		const engine = new AnalysisEngine(testProject.root);
		const plugin = new MockLanguagePlugin('test', ['typescript']);

		engine.registerPlugin(plugin);

		expect(engine.getPlugin('typescript')).toBe(plugin);
	});

	it('should return undefined for unregistered language', () => {
		const engine = new AnalysisEngine(testProject.root);

		expect(engine.getPlugin('python')).toBeUndefined();
	});

	it('should get project root', () => {
		const engine = new AnalysisEngine(testProject.root);

		expect(engine.getProjectRoot()).toBe(testProject.root);
	});

	it('should analyze file with registered plugin', async () => {
		const engine = new AnalysisEngine(testProject.root);
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const mockSymbols: Symbol[] = [
			{
				name: 'TestClass',
				type: 'class',
				path: filePath,
				line: 1,
				column: 1,
				exported: true,
			},
		];

		const mockRelationships: Relationship[] = [];
		const mockPatterns: Pattern[] = [];

		const plugin = new MockLanguagePlugin('test', ['typescript'], {
			symbols: mockSymbols,
			relationships: mockRelationships,
			patterns: mockPatterns,
		});

		engine.registerPlugin(plugin);

		const analysis = await engine.analyzeFile(filePath);

		expect(analysis.path).toBe(filePath);
		expect(analysis.symbols).toHaveLength(1);
		expect(analysis.symbols[0].name).toBe('TestClass');
		expect(analysis.relationships).toEqual(mockRelationships);
		expect(analysis.patterns).toEqual(mockPatterns);
	});

	it('should throw error for unsupported language', async () => {
		const engine = new AnalysisEngine(testProject.root);
		const filePath = await writeTestFile(
			testProject.root,
			'test.py',
			'print("hello")',
		);

		await expect(engine.analyzeFile(filePath)).rejects.toThrow(
			'No plugin available for language: unknown',
		);
	});

	it('should analyze multiple files', async () => {
		const engine = new AnalysisEngine(testProject.root);
		const filePath1 = await writeTestFile(
			testProject.root,
			'test1.ts',
			sampleTypeScriptFile,
		);
		const filePath2 = await writeTestFile(
			testProject.root,
			'test2.ts',
			sampleTypeScriptFile,
		);

		const plugin = new MockLanguagePlugin('test', ['typescript'], {
			symbols: [
				{
					name: 'Test',
					type: 'class',
					path: '',
					line: 1,
					column: 1,
					exported: true,
				},
			],
			relationships: [],
			patterns: [],
		});

		engine.registerPlugin(plugin);

		const analyses = await engine.analyzeFiles([filePath1, filePath2]);

		expect(analyses).toHaveLength(2);
		expect(analyses[0].path).toBe(filePath1);
		expect(analyses[1].path).toBe(filePath2);
	});
});
