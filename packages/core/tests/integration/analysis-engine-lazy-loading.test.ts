import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AnalysisEngine } from '../../src/core/analysis/engine';
import { TypeScriptPlugin } from '../../src/core/analysis/plugins/typescript';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expectDurationWithinBaseline } from '../helpers/performance-baseline';

const testProjectRoot = '.test-analysis-engine-integration';

const join = path.join;

describe('AnalysisEngine Lazy Loading Integration', () => {
	let engine: AnalysisEngine;
	let tsPlugin: TypeScriptPlugin;

	beforeEach(async () => {
		await rm(testProjectRoot, { recursive: true, force: true });
		await mkdir(testProjectRoot, { recursive: true });

		engine = new AnalysisEngine(testProjectRoot);
		tsPlugin = new TypeScriptPlugin(testProjectRoot);
		engine.registerPlugin(tsPlugin);
	});

	afterEach(async () => {
		await rm(testProjectRoot, { recursive: true, force: true });
	});

	describe('analyzeFile with lazy loading', () => {
		it('should analyze file on-demand without prior preloading', async () => {
			const filePath = join(testProjectRoot, 'test.ts');
			await writeFile(
				filePath,
				'export function hello() { return "world"; }',
			);

			const analysis = await engine.analyzeFile(filePath);

			expect(analysis).toBeDefined();
			expect(analysis.path).toBe(filePath);
			expect(analysis.symbols.length).toBeGreaterThan(0);
			expect(analysis.symbols[0].name).toBe('hello');
			expect(analysis.symbols[0].type).toBe('function');
		});

		it('should analyze multiple files independently', async () => {
			const file1 = join(testProjectRoot, 'file1.ts');
			const file2 = join(testProjectRoot, 'file2.ts');

			await writeFile(file1, 'export const x = 1;');
			await writeFile(file2, 'export const y = 2;');

			const analysis1 = await engine.analyzeFile(file1);
			const analysis2 = await engine.analyzeFile(file2);

			expect(analysis1.symbols[0].name).toBe('x');
			expect(analysis2.symbols[0].name).toBe('y');
		});

		it('should extract relationships from lazy-loaded files', async () => {
			const filePath = join(testProjectRoot, 'with-import.ts');
			await writeFile(
				filePath,
				'import { something } from "./other";\nexport const x = something;',
			);

			const analysis = await engine.analyzeFile(filePath);

			expect(analysis.relationships.length).toBeGreaterThan(0);
			const importRelationship = analysis.relationships.find(
				(r) => r.type === 'import',
			);
			expect(importRelationship).toBeDefined();
		});

		it('should detect patterns in lazy-loaded files', async () => {
			const filePath = join(testProjectRoot, 'controller.ts');
			await writeFile(
				filePath,
				'export class UserController { getUser() { return null; } }',
			);

			const analysis = await engine.analyzeFile(filePath);

			expect(analysis.patterns.length).toBeGreaterThan(0);
			const controllerPattern = analysis.patterns.find(
				(p) => p.type === 'controller',
			);
			expect(controllerPattern).toBeDefined();
			expect(controllerPattern?.name).toBe('UserController');
		});
	});

	describe('analyzeFiles batch processing', () => {
		it('should analyze multiple files in batch', async () => {
			const files = ['file1.ts', 'file2.ts', 'file3.ts'];

			for (const [index, fileName] of files.entries()) {
				const filePath = join(testProjectRoot, fileName);
				await writeFile(
					filePath,
					`export const value${index} = ${index};`,
				);
			}

			const filePaths = files.map((f) => join(testProjectRoot, f));
			const analyses = await engine.analyzeFiles(filePaths);

			expect(analyses).toHaveLength(3);
			for (const [index, analysis] of analyses.entries()) {
				expect(analysis.symbols.length).toBeGreaterThan(0);
				expect(analysis.symbols[0].name).toBe(`value${index}`);
			}
		});
	});

	describe('complex code analysis', () => {
		it('should analyze class with methods and properties', async () => {
			const filePath = join(testProjectRoot, 'complex-class.ts');
			await writeFile(
				filePath,
				`
export class DataManager {
	private data: string[];
	public count: number = 0;

	constructor() {
		this.data = [];
	}

	public addItem(item: string): void {
		this.data.push(item);
		this.count++;
	}

	private validate(item: string): boolean {
		return item.length > 0;
	}
}
`,
			);

			const analysis = await engine.analyzeFile(filePath);

			const classSymbol = analysis.symbols.find(
				(s) => s.type === 'class',
			);
			expect(classSymbol).toBeDefined();
			expect(classSymbol?.name).toBe('DataManager');

			const methods = analysis.symbols.filter((s) => s.type === 'method');
			expect(methods.length).toBeGreaterThan(0);

			const properties = analysis.symbols.filter(
				(s) => s.type === 'property',
			);
			expect(properties.length).toBeGreaterThan(0);
		});

		it('should analyze file with multiple exports', async () => {
			const filePath = join(testProjectRoot, 'multi-export.ts');
			await writeFile(
				filePath,
				`
export interface User {
	id: string;
	name: string;
}

export type UserId = string;

export function createUser(name: string): User {
	return { id: '1', name };
}

export const DEFAULT_USER: User = { id: '0', name: 'Guest' };
`,
			);

			const analysis = await engine.analyzeFile(filePath);

			expect(analysis.symbols.length).toBeGreaterThan(3);

			const interfaceSymbol = analysis.symbols.find(
				(s) => s.type === 'interface',
			);
			expect(interfaceSymbol?.name).toBe('User');

			const typeSymbol = analysis.symbols.find((s) => s.type === 'type');
			expect(typeSymbol?.name).toBe('UserId');

			const functionSymbol = analysis.symbols.find(
				(s) => s.type === 'function',
			);
			expect(functionSymbol?.name).toBe('createUser');
		});

		it('should analyze inheritance relationships', async () => {
			const filePath = join(testProjectRoot, 'inheritance.ts');
			await writeFile(
				filePath,
				`
interface Base {
	id: string;
}

export class Derived implements Base {
	id: string = '';
}
`,
			);

			const analysis = await engine.analyzeFile(filePath);

			const implementsRelationship = analysis.relationships.find(
				(r) => r.type === 'implements',
			);
			expect(implementsRelationship).toBeDefined();
		});
	});

	describe('performance with lazy loading', () => {
		it('should handle first-time analysis efficiently', async () => {
			const filePath = join(testProjectRoot, 'perf-test.ts');
			await writeFile(
				filePath,
				Array.from(
					{ length: 20 },
					(_, index) =>
						`export function func${index}() { return ${index}; }`,
				).join('\n'),
			);

			const startTime = performance.now();
			const analysis = await engine.analyzeFile(filePath);
			const duration = performance.now() - startTime;

			expect(analysis.symbols.length).toBe(20);
			expect(duration).toBeLessThan(1000);
		});

		it('should be faster on second analysis of same file', async () => {
			const filePath = join(testProjectRoot, 'cached.ts');
			await writeFile(filePath, 'export const x = 1;');

			const startTime1 = performance.now();
			await engine.analyzeFile(filePath);
			const duration1 = performance.now() - startTime1;

			const startTime2 = performance.now();
			await engine.analyzeFile(filePath);
			const duration2 = performance.now() - startTime2;

			expect(duration2).toBeLessThanOrEqual(duration1);
		});
	});

	describe('error handling', () => {
		it('should throw error for non-existent file', async () => {
			const nonExistentPath = join(testProjectRoot, 'nonexistent.ts');

			await expect(engine.analyzeFile(nonExistentPath)).rejects.toThrow();
		});

		it('should throw error for unsupported language', async () => {
			const unsupportedFile = join(testProjectRoot, 'test.py');
			await writeFile(unsupportedFile, 'print("hello")');

			await expect(engine.analyzeFile(unsupportedFile)).rejects.toThrow(
				/No plugin available/,
			);
		});
	});

	describe('with preloading', () => {
		it('should work correctly after preloading files', async () => {
			await writeFile(
				join(testProjectRoot, 'file1.ts'),
				'export const a = 1;',
			);
			await writeFile(
				join(testProjectRoot, 'file2.ts'),
				'export const b = 2;',
			);

			await tsPlugin.preloadFiles();

			const analysis1 = await engine.analyzeFile(
				join(testProjectRoot, 'file1.ts'),
			);
			const analysis2 = await engine.analyzeFile(
				join(testProjectRoot, 'file2.ts'),
			);

			expect(analysis1.symbols[0].name).toBe('a');
			expect(analysis2.symbols[0].name).toBe('b');
		});

		it('should be faster when files are preloaded', async () => {
			const filePath = join(testProjectRoot, 'preloaded.ts');
			await writeFile(filePath, 'export const x = 1;');

			await tsPlugin.preloadFiles();

			const startTime = performance.now();
			const analysis = await engine.analyzeFile(filePath);
			const duration = performance.now() - startTime;

			expect(analysis).toBeDefined();

			// Using baseline-driven performance check (see docs/TESTING.md)
			// Allows 50% regression from baseline to account for CI environment variability
			expectDurationWithinBaseline(
				duration,
				'analysis-engine-lazy-loading.preloaded-file-analysis',
				0.5,
			);
		});
	});
});
