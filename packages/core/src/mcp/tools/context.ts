import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';

export function registerContextTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'getContextForFile',
		description: createToolDescription({
			summary:
				'Extract all symbols, relationships, and patterns from a single file for comprehensive understanding.',
			whenToUse: {
				triggers: [
					'Exploring unfamiliar code before making edits',
					'Understanding file dependencies and exports',
					'Identifying design patterns in a specific module',
				],
				skipIf: 'Need directory-level overview (use getArchitecture)',
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				file: 'Path to the file (relative or absolute)',
			},
			returns:
				'Structured JSON with symbols, relationships, patterns, and metadata',
			workflow: {
				before: ['Know the file path you want to analyze'],
				after: [
					'Review symbols to understand exports/imports',
					'Check relationships to see dependencies',
					'Identify patterns for consistency',
				],
			},
			example: {
				scenario: 'Pre-edit analysis of authentication module',
				params: {
					projectRoot: '/path/to/project',
					file: 'src/auth/validator.ts',
				},
				next: 'Review exported functions before refactoring',
			},
			antiPatterns: {
				dont: 'Use for entire directories (too slow)',
				do: 'Use getArchitecture for directory-level analysis',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			file: z.string().describe('Path to the file'),
		}),
		execute: async ({
			projectRoot,
			file,
		}: {
			projectRoot?: string;
			file: string;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const fullPath = path.isAbsolute(file)
				? file
				: path.join(resolvedProjectRoot, file);

			const analysis = await engines.analysis.analyzeFile(fullPath);

			return JSON.stringify({
				path: fullPath,
				symbols: analysis.symbols,
				relationships: analysis.relationships,
				patterns: analysis.patterns,
			});
		},
	});

	server.addTool({
		name: 'summarizeFile',
		description: createToolDescription({
			summary:
				'Get high-level file overview with exported symbols and pattern counts.',
			whenToUse: {
				triggers: [
					'Need quick orientation without full relationship details',
					'Scanning multiple files for initial exploration',
					'Want faster analysis than getContextForFile',
				],
				skipIf: 'Need complete relationship mapping (use getContextForFile)',
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				path: 'Path to the file',
				depth: 'Analysis depth: 1=shallow, 2=medium, 3=deep (default: 2)',
			},
			returns:
				'Exported symbols, pattern counts, relationship/symbol totals',
			workflow: {
				after: [
					'Use exported symbols to understand public API',
					'Check pattern counts for architectural style',
				],
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			path: z.string().describe('Path to the file'),
			depth: z
				.number()
				.default(2)
				.optional()
				.describe('Depth of analysis (1=shallow, 2=medium, 3=deep)'),
		}),
		execute: async ({
			projectRoot,
			path: filePath,
		}: {
			projectRoot?: string;
			path: string;
			depth?: number;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const fullPath = path.isAbsolute(filePath)
				? filePath
				: path.join(resolvedProjectRoot, filePath);

			const analysis = await engines.analysis.analyzeFile(fullPath);

			const exportedSymbols = analysis.symbols.filter((s) => s.exported);
			const mainPatterns = analysis.patterns.slice(0, 5);

			return JSON.stringify({
				path: fullPath,
				exportedSymbols: exportedSymbols.map((s) => ({
					name: s.name,
					type: s.type,
					line: s.line,
				})),
				patterns: mainPatterns,
				relationshipCount: analysis.relationships.length,
				symbolCount: analysis.symbols.length,
			});
		},
	});

	server.addTool({
		name: 'getTestCoverage',
		description: createToolDescription({
			summary:
				'Calculate test-to-source file ratio for a directory or entire project.',
			whenToUse: {
				triggers: [
					'Assessing code quality and test completeness',
					'Planning where to add new tests',
					'Identifying under-tested areas before releases',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				scope: 'Optional directory path (omit for entire project)',
			},
			returns: 'Test file count, source file count, coverage ratio',
			workflow: {
				after: [
					'Compare ratio to project goals (e.g., >0.5)',
					'Target low-coverage directories for test additions',
				],
			},
			example: {
				scenario: 'Check API module test coverage',
				params: { projectRoot: '/path/to/project', scope: 'src/api' },
				next: 'Add tests if ratio < 0.5',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			scope: z
				.string()
				.optional()
				.describe('Optional directory scope to analyze'),
		}),
		execute: async ({
			projectRoot,
			scope,
		}: {
			projectRoot?: string;
			scope?: string;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const targetPath = scope
				? path.join(resolvedProjectRoot, scope)
				: resolvedProjectRoot;

			const testFiles: string[] = [];
			const sourceFiles: string[] = [];

			async function collectFiles(directory: string): Promise<void> {
				try {
					const resolvedDirectory = path.resolve(directory);
					const { readdir } = await import('node:fs/promises');
					const entries = await readdir(resolvedDirectory, {
						withFileTypes: true,
					});
					for (const entry of entries) {
						const fullPath = path.join(
							resolvedDirectory,
							entry.name,
						);
						if (entry.isDirectory()) {
							if (
								!entry.name.startsWith('.') &&
								entry.name !== 'node_modules'
							) {
								await collectFiles(fullPath);
							}
						} else if (
							entry.isFile() &&
							isSupportedLanguage(fullPath)
						) {
							if (
								fullPath.includes('.test.') ||
								fullPath.includes('.spec.') ||
								fullPath.includes('__tests__')
							) {
								testFiles.push(fullPath);
							} else {
								sourceFiles.push(fullPath);
							}
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await collectFiles(targetPath);

			return JSON.stringify({
				testFiles: testFiles.length,
				sourceFiles: sourceFiles.length,
				coverageRatio:
					sourceFiles.length > 0
						? testFiles.length / sourceFiles.length
						: 0,
			});
		},
	});
}
