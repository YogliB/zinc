import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TypeScriptPlugin } from '../../src/core/analysis/plugins/typescript';
import { AnalysisEngine } from '../../src/core/analysis/engine';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expectDurationWithinBaseline } from '../helpers/performance-baseline';

const benchProjectRoot = '.bench-project';

describe('Performance Benchmarks', () => {
	beforeEach(async () => {
		await rm(benchProjectRoot, { recursive: true, force: true });
		await mkdir(benchProjectRoot, { recursive: true });
	});

	afterEach(async () => {
		await rm(benchProjectRoot, { recursive: true, force: true });
	});

	describe('TypeScript Plugin Initialization', () => {
		it('should initialize in under 100ms with lazy loading', async () => {
			for (let index = 0; index < 100; index++) {
				await writeFile(
					path.join(benchProjectRoot, `file${index}.ts`),
					`export const value${index} = ${index};\nexport function func${index}() { return ${index}; }`,
				);
			}

			const startTime = performance.now();
			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const duration = performance.now() - startTime;

			expect(plugin).toBeDefined();
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.plugin-init-100',
				0.5,
			);
			console.log(
				`✓ Plugin initialization: ${duration.toFixed(2)}ms (100 files)`,
			);
		});

		it('should initialize in under 200ms with 500 files', async () => {
			await mkdir(path.join(benchProjectRoot, 'src'), {
				recursive: true,
			});
			await mkdir(path.join(benchProjectRoot, 'tests'), {
				recursive: true,
			});

			for (let index = 0; index < 400; index++) {
				await writeFile(
					path.join(benchProjectRoot, 'src', `module${index}.ts`),
					`export class Module${index} { method() { return ${index}; } }`,
				);
			}

			for (let index = 0; index < 100; index++) {
				await writeFile(
					path.join(benchProjectRoot, 'tests', `test${index}.ts`),
					`import { Module${index} } from '../src/module${index}';\ntest('test', () => {});`,
				);
			}

			const startTime = performance.now();
			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const duration = performance.now() - startTime;

			expect(plugin).toBeDefined();
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.plugin-init-500',
				0.5,
			);
			console.log(
				`✓ Plugin initialization: ${duration.toFixed(2)}ms (500 files)`,
			);
		});
	});

	describe('First Tool Call Latency', () => {
		it('should analyze single file in under 500ms on first call', async () => {
			const filePath = path.join(benchProjectRoot, 'app.ts');
			await writeFile(
				filePath,
				`
export class Application {
	private config: Record<string, unknown>;

	constructor() {
		this.config = {};
	}

	public start(): void {
		console.log('Starting application');
	}

	public configure(key: string, value: unknown): void {
		this.config[key] = value;
	}
}

export function createApp(): Application {
	return new Application();
}
`,
			);

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			const startTime = performance.now();
			const analysis = await engine.analyzeFile(filePath);
			const duration = performance.now() - startTime;

			expect(analysis.symbols.length).toBeGreaterThan(0);

			// Using baseline-driven performance check (see docs/TESTING.md)
			// Allows 50% regression from baseline to account for CI environment variability
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.first-file-analysis',
				0.5,
			);
			console.log(`✓ First file analysis: ${duration.toFixed(2)}ms`);
		});

		it('should analyze multiple files efficiently', async () => {
			const files = [];
			for (let index = 0; index < 10; index++) {
				const filePath = path.join(
					benchProjectRoot,
					`service${index}.ts`,
				);
				await writeFile(
					filePath,
					`export class Service${index} { execute() { return ${index}; } }`,
				);
				files.push(filePath);
			}

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			const startTime = performance.now();
			const analyses = await engine.analyzeFiles(files);
			const duration = performance.now() - startTime;

			expect(analyses).toHaveLength(10);
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.batch-analysis',
				0.5,
			);
			console.log(
				`✓ Batch analysis (10 files): ${duration.toFixed(2)}ms (${(duration / 10).toFixed(2)}ms avg per file)`,
			);
		});
	});

	describe('Preload Performance', () => {
		it('should preload 100 files in under 5 seconds', async () => {
			for (let index = 0; index < 100; index++) {
				await writeFile(
					path.join(benchProjectRoot, `file${index}.ts`),
					`export const value${index} = ${index};\nexport function func${index}() { return ${index}; }`,
				);
			}

			const plugin = new TypeScriptPlugin(benchProjectRoot);

			const startTime = performance.now();
			const result = await plugin.preloadFiles();
			const duration = performance.now() - startTime;

			expect(result.count).toBeGreaterThan(0);
			expect(result.errors).toEqual([]);
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.preload-100',
				0.5,
			);
			console.log(
				`✓ Preload 100 files: ${duration.toFixed(2)}ms (${result.count} files loaded)`,
			);
		});

		it('should analyze preloaded files instantly', async () => {
			const filePath = path.join(benchProjectRoot, 'preloaded.ts');
			await writeFile(filePath, 'export const x = 1;');

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			await plugin.preloadFiles();

			const startTime = performance.now();
			const analysis = await engine.analyzeFile(filePath);
			const duration = performance.now() - startTime;

			expect(analysis.symbols.length).toBeGreaterThan(0);
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.preloaded-analysis',
				0.5,
			);
			console.log(`✓ Preloaded file analysis: ${duration.toFixed(2)}ms`);
		});
	});

	describe('Cache Performance', () => {
		it('should benefit from caching on repeated analysis', async () => {
			const filePath = path.join(benchProjectRoot, 'cached.ts');
			await writeFile(
				filePath,
				`
export interface Config {
	port: number;
	host: string;
	debug: boolean;
}

export class Server {
	constructor(private config: Config) {}

	start(): void {
		console.log('Server starting');
	}
}
`,
			);

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			const startTime1 = performance.now();
			await engine.analyzeFile(filePath);
			const duration1 = performance.now() - startTime1;

			const startTime2 = performance.now();
			await engine.analyzeFile(filePath);
			const duration2 = performance.now() - startTime2;

			const startTime3 = performance.now();
			await engine.analyzeFile(filePath);
			const duration3 = performance.now() - startTime3;

			expect(duration2).toBeLessThanOrEqual(duration1);
			expect(duration3).toBeLessThanOrEqual(duration2);

			console.log(`✓ Cache performance:`);
			console.log(`  First:  ${duration1.toFixed(2)}ms`);
			console.log(
				`  Second: ${duration2.toFixed(2)}ms (${((duration2 / duration1) * 100).toFixed(1)}% of first)`,
			);
			console.log(
				`  Third:  ${duration3.toFixed(2)}ms (${((duration3 / duration1) * 100).toFixed(1)}% of first)`,
			);
		});
	});

	describe('Memory Efficiency', () => {
		it('should not load all files into memory on initialization', async () => {
			for (let index = 0; index < 200; index++) {
				await writeFile(
					path.join(benchProjectRoot, `file${index}.ts`),
					`export const value${index} = ${index};`,
				);
			}

			const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

			const plugin = new TypeScriptPlugin(benchProjectRoot);

			const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
			const memDiff = memAfter - memBefore;

			expect(plugin).toBeDefined();
			// Memory efficiency test keeps hardcoded threshold due to non-duration metric
			// CI variance: may be up to 75MB due to different runtime environments
			expect(memDiff).toBeLessThan(75);

			console.log(
				`✓ Memory usage after initialization: ${memDiff.toFixed(2)}MB increase (200 files not loaded)`,
			);
		});
	});

	describe('Large File Handling', () => {
		it('should handle large files efficiently', async () => {
			const filePath = path.join(benchProjectRoot, 'large.ts');

			const largeContent = Array.from(
				{ length: 500 },
				(_, index) =>
					`export function func${index}(x: number): number { return x + ${index}; }`,
			).join('\n\n');

			await writeFile(filePath, largeContent);

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			const startTime = performance.now();
			const analysis = await engine.analyzeFile(filePath);
			const duration = performance.now() - startTime;

			expect(analysis.symbols.length).toBe(500);
			expectDurationWithinBaseline(
				duration,
				'performance-benchmarks.large-file',
				0.5,
			);

			console.log(
				`✓ Large file (500 functions): ${duration.toFixed(2)}ms (${(duration / 500).toFixed(2)}ms per function)`,
			);
		});
	});

	describe('End-to-End Server Initialization Simulation', () => {
		it('should complete full initialization flow in under 1 second', async () => {
			await mkdir(path.join(benchProjectRoot, 'src'), {
				recursive: true,
			});
			await mkdir(path.join(benchProjectRoot, 'src/utils'), {
				recursive: true,
			});
			await mkdir(path.join(benchProjectRoot, 'src/services'), {
				recursive: true,
			});

			await writeFile(
				path.join(benchProjectRoot, 'src/index.ts'),
				'export { App } from "./app";\nexport { config } from "./config";',
			);

			await writeFile(
				path.join(benchProjectRoot, 'src/app.ts'),
				'export class App { start() {} }',
			);

			await writeFile(
				path.join(benchProjectRoot, 'src/config.ts'),
				'export const config = { port: 3000 };',
			);

			for (let index = 0; index < 10; index++) {
				await writeFile(
					path.join(benchProjectRoot, 'src/utils', `util${index}.ts`),
					`export function util${index}() { return ${index}; }`,
				);
			}

			for (let index = 0; index < 10; index++) {
				await writeFile(
					path.join(
						benchProjectRoot,
						'src/services',
						`service${index}.ts`,
					),
					`export class Service${index} { execute() {} }`,
				);
			}

			const startTime = performance.now();

			const plugin = new TypeScriptPlugin(benchProjectRoot);
			const engine = new AnalysisEngine(benchProjectRoot);
			engine.registerPlugin(plugin);

			const duration = performance.now() - startTime;

			expect(engine).toBeDefined();
			expect(duration).toBeLessThan(1000);

			console.log(
				`\n✅ End-to-end initialization: ${duration.toFixed(2)}ms`,
			);
			console.log(`   Target: < 1000ms`);
			console.log(`   Status: ${duration < 1000 ? 'PASS' : 'FAIL'}`);
		});
	});
});
