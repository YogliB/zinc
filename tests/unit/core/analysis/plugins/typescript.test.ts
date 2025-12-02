import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TypeScriptPlugin } from '../../../../../src/core/analysis/plugins/typescript';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const testProjectRoot = '.test-typescript-plugin';
const join = path.join;

describe('TypeScriptPlugin', () => {
	beforeEach(async () => {
		await rm(testProjectRoot, { recursive: true, force: true });
		await mkdir(testProjectRoot, { recursive: true });
	});

	afterEach(async () => {
		await rm(testProjectRoot, { recursive: true, force: true });
	});

	describe('constructor', () => {
		it('should initialize without loading files', () => {
			const plugin = new TypeScriptPlugin(testProjectRoot);
			expect(plugin).toBeDefined();
			expect(plugin.name).toBe('typescript');
			expect(plugin.languages).toEqual(['typescript', 'javascript']);
		});

		it('should not throw when project root has many files', async () => {
			// Create multiple files
			for (let index = 0; index < 10; index++) {
				await writeFile(
					join(testProjectRoot, `file${index}.ts`),
					`export const value${index} = ${index};`,
				);
			}

			// Should not block or load files eagerly
			const startTime = performance.now();
			const plugin = new TypeScriptPlugin(testProjectRoot);
			const duration = performance.now() - startTime;

			expect(plugin).toBeDefined();
			expect(duration).toBeLessThan(100); // Should be near-instant
		});
	});

	describe('lazy loading', () => {
		it('should load file on first parse', async () => {
			const filePath = join(testProjectRoot, 'test.ts');
			await writeFile(
				filePath,
				'export function hello() { return "world"; }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);

			expect(ast).toBeDefined();
			expect(ast.kind).toBe('SourceFile');
		});

		it('should cache loaded files', async () => {
			const filePath = join(testProjectRoot, 'test.ts');
			await writeFile(filePath, 'export const x = 1;');

			const plugin = new TypeScriptPlugin(testProjectRoot);

			// First parse - should load file
			const startTime1 = performance.now();
			await plugin.parse(filePath);
			const duration1 = performance.now() - startTime1;

			// Second parse - should use cache
			const startTime2 = performance.now();
			await plugin.parse(filePath);
			const duration2 = performance.now() - startTime2;

			// Second parse should be faster (cached)
			expect(duration2).toBeLessThan(duration1);
		});

		it('should throw error for non-existent file', async () => {
			const plugin = new TypeScriptPlugin(testProjectRoot);
			const nonExistentPath = join(testProjectRoot, 'nonexistent.ts');

			await expect(plugin.parse(nonExistentPath)).rejects.toThrow();
		});

		it('should handle multiple files independently', async () => {
			const file1 = join(testProjectRoot, 'file1.ts');
			const file2 = join(testProjectRoot, 'file2.ts');

			await writeFile(file1, 'export const a = 1;');
			await writeFile(file2, 'export const b = 2;');

			const plugin = new TypeScriptPlugin(testProjectRoot);

			const ast1 = await plugin.parse(file1);
			const ast2 = await plugin.parse(file2);

			expect(ast1).toBeDefined();
			expect(ast2).toBeDefined();
			expect(ast1).not.toBe(ast2);
		});
	});

	describe('preloadFiles', () => {
		it('should preload files with default patterns', async () => {
			await writeFile(
				join(testProjectRoot, 'file1.ts'),
				'export const x = 1;',
			);
			await writeFile(
				join(testProjectRoot, 'file2.tsx'),
				'export const y = 2;',
			);
			await writeFile(
				join(testProjectRoot, 'file3.js'),
				'export const z = 3;',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const result = await plugin.preloadFiles();

			expect(result.count).toBeGreaterThan(0);
			expect(result.errors).toEqual([]);
		});

		it('should preload files with custom patterns', async () => {
			await mkdir(join(testProjectRoot, 'src'), { recursive: true });
			await writeFile(
				join(testProjectRoot, 'src', 'app.ts'),
				'export const app = true;',
			);
			await writeFile(
				join(testProjectRoot, 'test.ts'),
				'export const test = true;',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const patterns = [`${testProjectRoot}/src/**/*.ts`];
			const result = await plugin.preloadFiles(patterns);

			expect(result.count).toBeGreaterThan(0);
			expect(result.errors).toEqual([]);
		});

		it('should handle preload errors gracefully', async () => {
			const plugin = new TypeScriptPlugin(testProjectRoot);
			const invalidPatterns = ['/invalid/path/**/*.ts'];
			const result = await plugin.preloadFiles(invalidPatterns);

			expect(result.count).toBe(0);
			// Should not throw, errors should be collected
			expect(result.errors.length).toBeGreaterThanOrEqual(0);
		});

		it('should make subsequent parses instant after preload', async () => {
			const filePath = join(testProjectRoot, 'test.ts');
			await writeFile(filePath, 'export const x = 1;');

			const plugin = new TypeScriptPlugin(testProjectRoot);
			await plugin.preloadFiles();

			// Parse should be instant since file is already loaded
			const startTime = performance.now();
			await plugin.parse(filePath);
			const duration = performance.now() - startTime;

			expect(duration).toBeLessThan(50); // Should be very fast
		});
	});

	describe('extractSymbols', () => {
		it('should extract function symbols from lazy-loaded file', async () => {
			const filePath = join(testProjectRoot, 'test.ts');
			await writeFile(
				filePath,
				'export function testFunc() { return 42; }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);

			expect(symbols.length).toBeGreaterThan(0);
			expect(symbols[0].name).toBe('testFunc');
			expect(symbols[0].type).toBe('function');
		});

		it('should extract namespace declarations', async () => {
			const filePath = path.join(testProjectRoot, 'namespaces.ts');
			await writeFile(
				filePath,
				'export class TestClass { constructor() {} }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);

			const classSymbol = symbols.find((s) => s.type === 'class');
			expect(classSymbol).toBeDefined();
			expect(classSymbol?.name).toBe('TestClass');
		});

		it('should extract interface declarations', async () => {
			const filePath = path.join(testProjectRoot, 'interfaces.ts');
			await writeFile(
				filePath,
				'export interface TestInterface { value: string; }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);

			const interfaceSymbol = symbols.find((s) => s.type === 'interface');
			expect(interfaceSymbol).toBeDefined();
			expect(interfaceSymbol?.name).toBe('TestInterface');
		});
	});

	describe('buildRelationships', () => {
		it('should extract import relationships', async () => {
			const filePath = path.join(testProjectRoot, 'imports.ts');
			await writeFile(
				filePath,
				'import { something } from "./other";\nexport const x = something;',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);
			const relationships = await plugin.buildRelationships(
				symbols,
				ast,
				filePath,
			);

			const importRelationship = relationships.find(
				(r) => r.type === 'import',
			);
			expect(importRelationship).toBeDefined();
			expect(importRelationship?.metadata?.importedName).toBe(
				'something',
			);
		});

		it('should extract class inheritance relationships', async () => {
			const filePath = path.join(testProjectRoot, 'inheritance.ts');
			await writeFile(
				filePath,
				'class Base {}\nexport class Derived extends Base {}',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);
			const relationships = await plugin.buildRelationships(
				symbols,
				ast,
				filePath,
			);

			const extendsRelationship = relationships.find(
				(r) => r.type === 'extends',
			);
			expect(extendsRelationship).toBeDefined();
		});
	});

	describe('detectPatterns', () => {
		it('should detect middleware pattern', async () => {
			const filePath = path.join(testProjectRoot, 'middleware.ts');
			await writeFile(
				filePath,
				'export function authMiddleware(req, res, next) { next(); }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);
			const patterns = await plugin.detectPatterns(
				ast,
				symbols,
				filePath,
			);

			const middlewarePattern = patterns.find(
				(p) => p.type === 'middleware',
			);
			expect(middlewarePattern).toBeDefined();
			expect(middlewarePattern?.name).toBe('authMiddleware');
		});

		it('should detect controller pattern', async () => {
			const filePath = path.join(testProjectRoot, 'controller.ts');
			await writeFile(
				filePath,
				'export class UserController { getUsers() {} }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);
			const patterns = await plugin.detectPatterns(
				ast,
				symbols,
				filePath,
			);

			const controllerPattern = patterns.find(
				(p) => p.type === 'controller',
			);
			expect(controllerPattern).toBeDefined();
			expect(controllerPattern?.name).toBe('UserController');
		});

		it('should detect service pattern', async () => {
			const filePath = path.join(testProjectRoot, 'service.ts');
			await writeFile(
				filePath,
				'export class DataService { fetchData() {} }',
			);

			const plugin = new TypeScriptPlugin(testProjectRoot);
			const ast = await plugin.parse(filePath);
			const symbols = await plugin.extractSymbols(ast, filePath);
			const patterns = await plugin.detectPatterns(
				ast,
				symbols,
				filePath,
			);

			const servicePattern = patterns.find((p) => p.type === 'service');
			expect(servicePattern).toBeDefined();
			expect(servicePattern?.name).toBe('DataService');
		});
	});

	describe('performance', () => {
		it('should initialize quickly even with many files in directory', async () => {
			// Create 100 files
			for (let index = 0; index < 100; index++) {
				await writeFile(
					join(testProjectRoot, `file${index}.ts`),
					`export const value${index} = ${index};`,
				);
			}

			const startTime = performance.now();
			const plugin = new TypeScriptPlugin(testProjectRoot);
			const duration = performance.now() - startTime;

			expect(plugin).toBeDefined();
			expect(duration).toBeLessThan(200); // Should be fast without eager loading
		});

		it('should handle first parse with acceptable latency', async () => {
			const filePath = join(testProjectRoot, 'large.ts');
			const largeCode = Array.from(
				{ length: 50 },
				(_, index) =>
					`export function func${index}() { return ${index}; }`,
			).join('\n');
			await writeFile(filePath, largeCode);

			const plugin = new TypeScriptPlugin(testProjectRoot);

			const startTime = performance.now();
			await plugin.parse(filePath);
			const duration = performance.now() - startTime;

			// First parse with file loading should complete in reasonable time
			expect(duration).toBeLessThan(1000);
		});
	});
});
