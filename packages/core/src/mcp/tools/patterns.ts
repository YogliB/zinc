import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';

function validateDirectoryPath(
	directory: string,
	projectRoot: string,
): string | undefined {
	const resolvedDirectory = path.resolve(directory);
	if (!resolvedDirectory.startsWith(projectRoot)) {
		return undefined;
	}
	return resolvedDirectory;
}

function checkSymbolForAntiPatterns(
	symbols: Array<{ name: string; path: string; line: number }>,
	antiPatterns: Array<{
		type: string;
		description: string;
		path: string;
		line: number;
	}>,
): void {
	for (const symbol of symbols) {
		const name = symbol.name.toLowerCase();
		if (
			name.includes('any') ||
			name.includes('todo') ||
			name.includes('fixme')
		) {
			antiPatterns.push({
				type: 'naming-issue',
				description: `Symbol name contains problematic terms: ${symbol.name}`,
				path: symbol.path,
				line: symbol.line,
			});
		}
	}
}

async function analyzeFileForAntiPatterns(
	filePath: string,
	engine: AnalysisEngine,
	antiPatterns: Array<{
		type: string;
		description: string;
		path: string;
		line: number;
	}>,
): Promise<void> {
	try {
		const analysis = await engine.analyzeFile(filePath);
		checkSymbolForAntiPatterns(analysis.symbols, antiPatterns);
	} catch {
		// Ignore errors when analyzing files
	}
}

export function registerPatternTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'findCodePatterns',
		description: createToolDescription({
			summary:
				'Search for specific architectural patterns (middleware, controller, service, error-handler) within a directory.',
			whenToUse: {
				triggers: [
					'Standardizing code structure across modules',
					'Finding examples to follow for consistency',
					'Auditing pattern usage and distribution',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				type: 'Pattern type to search for (e.g., middleware, controller, service, error-handler)',
				scope: 'Optional directory path to limit search',
			},
			returns:
				'Array of patterns with type, name, path, line number, and confidence score',
			workflow: {
				after: [
					'Review patterns for consistency',
					'Use found examples as templates',
					'Identify areas needing standardization',
				],
			},
			example: {
				scenario: 'Find all middleware patterns in API module',
				params: {
					projectRoot: '/path/to/project',
					type: 'middleware',
					scope: 'src/api',
				},
				next: 'Ensure all middleware follows the same structure',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			type: z
				.string()
				.describe(
					'Pattern type to search for (e.g., middleware, controller, service, error-handler)',
				),
			scope: z
				.string()
				.optional()
				.describe('Optional directory scope to search'),
		}),
		execute: async ({
			projectRoot,
			type,
			scope,
		}: {
			projectRoot?: string;
			type: string;
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

			const patterns: Array<{
				type: string;
				name: string;
				path: string;
				line: number;
				confidence: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				const validatedDirectory = validateDirectoryPath(
					directory,
					resolvedProjectRoot,
				);
				if (!validatedDirectory) {
					return;
				}

				const safeDirectory = validatedDirectory as string;
				let entries;
				try {
					entries = await readdir(safeDirectory, {
						withFileTypes: true,
					});
				} catch {
					return;
				}

				for (const entry of entries) {
					const fullPath = path.join(safeDirectory, entry.name);
					if (entry.isDirectory()) {
						if (
							!entry.name.startsWith('.') &&
							entry.name !== 'node_modules'
						) {
							await searchDirectory(fullPath);
						}
					} else if (
						entry.isFile() &&
						isSupportedLanguage(fullPath)
					) {
						try {
							const analysis =
								await engines.analysis.analyzeFile(fullPath);
							const matchingPatterns = analysis.patterns.filter(
								(p) => p.type === type,
							);
							patterns.push(...matchingPatterns);
						} catch {
							// Ignore errors when analyzing files
						}
					}
				}
			}

			await searchDirectory(targetPath);

			return JSON.stringify(patterns);
		},
	});

	server.addTool({
		name: 'detectAntiPatterns',
		description: createToolDescription({
			summary:
				'Scan codebase for common code smells: problematic naming (any, todo, fixme) and other anti-patterns.',
			whenToUse: {
				triggers: [
					'During code reviews or pre-commit checks',
					'Before releases to ensure code quality',
					'When improving codebase health',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				scope: 'Optional directory path to limit search (e.g., "src", "lib")',
			},
			returns:
				'Array of anti-patterns with type, description, file path, and line number',
			workflow: {
				after: [
					'Review each issue with file path and line number',
					'Fix critical anti-patterns immediately',
					'Plan refactoring for lower-priority issues',
				],
			},
			example: {
				scenario: 'Pre-release quality check on src directory',
				params: { projectRoot: '/path/to/project', scope: 'src' },
				next: 'Address all naming issues and TODOs',
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
				.describe(
					'Optional directory scope to limit search (e.g., "src", "lib")',
				),
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

			const antiPatterns: Array<{
				type: string;
				description: string;
				path: string;
				line: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				const validatedDirectory = validateDirectoryPath(
					directory,
					resolvedProjectRoot,
				);
				if (!validatedDirectory) {
					return;
				}

				const safeDirectory = validatedDirectory as string;
				let entries;
				try {
					entries = await readdir(safeDirectory, {
						withFileTypes: true,
					});
				} catch {
					return;
				}

				for (const entry of entries) {
					const fullPath = path.join(safeDirectory, entry.name);
					if (entry.isDirectory()) {
						if (
							!entry.name.startsWith('.') &&
							entry.name !== 'node_modules'
						) {
							await searchDirectory(fullPath);
						}
					} else if (
						entry.isFile() &&
						isSupportedLanguage(fullPath)
					) {
						await analyzeFileForAntiPatterns(
							fullPath,
							engines.analysis,
							antiPatterns,
						);
					}
				}
			}

			await searchDirectory(targetPath);

			return JSON.stringify(antiPatterns);
		},
	});
}
