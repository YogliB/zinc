import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';
import { createLogger } from '../../core/utils/logger';

const logger = createLogger('ArchitectureTools');

interface Architecture {
	readonly scope?: string;
	readonly files: number;
	readonly symbols: number;
	readonly relationships: number;
	readonly patterns: number;
	readonly topLevelSymbols: Array<{
		readonly name: string;
		readonly type: string;
		readonly path: string;
	}>;
	readonly mainPatterns: Array<{
		readonly type: string;
		readonly count: number;
	}>;
}

export function registerArchitectureTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'getArchitecture',
		description: createToolDescription({
			summary:
				'Get high-level architectural overview of a directory: symbol counts, top exports, and pattern distribution.',
			whenToUse: {
				triggers: [
					'Starting work on unfamiliar codebases or modules',
					'Planning refactors and need structural understanding',
					'Understanding module organization and patterns',
				],
				skipIf: 'Need single-file details (use getContextForFile instead)',
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				scope: 'Optional directory path (omit for entire project)',
			},
			returns:
				'File counts, symbol counts, top-level symbols, pattern distribution',
			workflow: {
				after: [
					'Review top-level symbols for entry points',
					'Check pattern distribution for consistency',
					'Use scope to drill into specific modules',
				],
			},
			example: {
				scenario: 'Understand API module structure',
				params: { projectRoot: '/path/to/project', scope: 'src/api' },
				next: 'Identify main controllers and patterns used',
			},
			antiPatterns: {
				dont: 'Use for single file analysis',
				do: 'Use getContextForFile for individual files',
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

			const files: string[] = [];
			const allSymbols: Array<{
				name: string;
				type: string;
				path: string;
			}> = [];
			const allPatterns: Array<{ type: string }> = [];
			let totalRelationships = 0;

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
							files.push(fullPath);
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await collectFiles(targetPath);

			for (const filePath of files.slice(0, 100)) {
				try {
					const analysis =
						await engines.analysis.analyzeFile(filePath);
					allSymbols.push(
						...analysis.symbols
							.filter((s) => s.exported)
							.map((s) => ({
								name: s.name,
								type: s.type,
								path: s.path,
							})),
					);
					allPatterns.push(...analysis.patterns);
					totalRelationships += analysis.relationships.length;
				} catch (error) {
					logger.error(
						`Error analyzing ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
					);
				}
			}

			const patternCounts = new Map<string, number>();
			for (const pattern of allPatterns) {
				patternCounts.set(
					pattern.type,
					(patternCounts.get(pattern.type) || 0) + 1,
				);
			}

			const mainPatterns = [...patternCounts.entries()]
				.map(([type, count]) => ({ type, count }))
				.toSorted((a, b) => b.count - a.count)
				.slice(0, 10);

			return JSON.stringify({
				scope,
				files: files.length,
				symbols: allSymbols.length,
				relationships: totalRelationships,
				patterns: allPatterns.length,
				topLevelSymbols: allSymbols.slice(0, 50),
				mainPatterns,
			} as Architecture);
		},
	});
}
