import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';

function matchesSymbol(relationship: { to: string }, symbol: string): boolean {
	return relationship.to === symbol || relationship.to.includes(symbol);
}

function extractReferencingSymbols(
	analysis: {
		symbols: Array<{
			name: string;
			type: string;
			path: string;
			line: number;
		}>;
		relationships: Array<{ to: string }>;
	},
	symbol: string,
	type?: string,
): Array<{ name: string; type: string; path: string; line: number }> {
	const matchingRelationships = analysis.relationships.filter(
		(relationship) => matchesSymbol(relationship, symbol),
	);
	if (matchingRelationships.length === 0) {
		return [];
	}
	const fileSymbols = type
		? analysis.symbols.filter((s) => s.type === type)
		: analysis.symbols;
	return fileSymbols.map((s) => ({
		name: s.name,
		type: s.type,
		path: s.path,
		line: s.line,
	}));
}

async function analyzeFileForReferences(
	filePath: string,
	engine: AnalysisEngine,
	symbol: string,
	type: string | undefined,
	referencingSymbols: Array<{
		name: string;
		type: string;
		path: string;
		line: number;
	}>,
): Promise<void> {
	try {
		const analysis = await engine.analyzeFile(filePath);
		const symbols = extractReferencingSymbols(analysis, symbol, type);
		referencingSymbols.push(...symbols);
	} catch {
		// Ignore errors when analyzing files
	}
}

export function registerSymbolTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'getSymbolsInFile',
		description: createToolDescription({
			summary:
				'List all symbols in a file with optional type filtering (class, function, interface, etc.).',
			whenToUse: {
				triggers: [
					'Need complete symbol inventory before refactoring',
					'Finding specific symbol types in a file',
					'Understanding all declarations in a module',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				path: 'Path to the file',
				filterByType:
					'Optional filter: class, function, interface, type, variable, enum, namespace, method, property',
			},
			returns: 'Array of symbols with name, type, path, and line numbers',
			workflow: {
				after: [
					'Use symbols for refactoring planning',
					'Filter by type to find specific declarations',
				],
			},
			example: {
				scenario: 'Find all functions in a utility file',
				params: {
					projectRoot: '/path/to/project',
					path: 'src/utils/helpers.ts',
					filterByType: 'function',
				},
				next: 'Review functions for consolidation opportunities',
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
			filterByType: z
				.enum([
					'class',
					'function',
					'interface',
					'type',
					'variable',
					'enum',
					'namespace',
					'method',
					'property',
				])
				.optional()
				.describe('Optional symbol type filter'),
		}),
		execute: async ({
			projectRoot,
			path: filePath,
			filterByType,
		}: {
			projectRoot?: string;
			path: string;
			filterByType?: string;
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
			let symbols = analysis.symbols;

			if (filterByType) {
				symbols = symbols.filter((s) => s.type === filterByType);
			}

			return JSON.stringify(symbols);
		},
	});

	server.addTool({
		name: 'findReferencingSymbols',
		description: createToolDescription({
			summary:
				'Discover all locations where a symbol is referenced across the codebase.',
			whenToUse: {
				triggers: [
					'Before renaming or removing a symbol (impact analysis)',
					'Tracking API usage across the project',
					'Understanding symbol dependencies',
				],
				skipIf: 'Doing broad text search (use grep instead)',
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				symbol: 'Exact name of the symbol to find references for',
				type: 'Optional symbol type filter for more precise results',
			},
			returns:
				'Array of referencing symbols with file paths and line numbers',
			workflow: {
				before: [
					'Know the exact symbol name',
					'Symbol likely used in multiple files',
				],
				after: [
					'Assess impact scope (number of files affected)',
					'Review each usage context',
					'Plan refactoring strategy if modifying symbol',
				],
			},
			example: {
				scenario: 'Pre-refactor impact analysis',
				params: {
					projectRoot: '/path/to/project',
					symbol: 'validateUser',
					type: 'function',
				},
				next: 'Determine how many files need updates',
			},
			antiPatterns: {
				dont: 'Use for broad searches or partial matches',
				do: 'Combine with getSymbolsInFile to discover exact symbol names first',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			symbol: z
				.string()
				.describe('Name of the symbol to find references for'),
			type: z
				.enum([
					'class',
					'function',
					'interface',
					'type',
					'variable',
					'enum',
					'namespace',
					'method',
					'property',
				])
				.optional()
				.describe('Type of the symbol'),
		}),
		execute: async ({
			projectRoot,
			symbol,
			type,
		}: {
			projectRoot?: string;
			symbol: string;
			type?: string;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const referencingSymbols: Array<{
				name: string;
				type: string;
				path: string;
				line: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
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
								await searchDirectory(fullPath);
							}
						} else if (
							entry.isFile() &&
							isSupportedLanguage(fullPath)
						) {
							await analyzeFileForReferences(
								fullPath,
								engines.analysis,
								symbol,
								type,
								referencingSymbols,
							);
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await searchDirectory(resolvedProjectRoot);

			return JSON.stringify(referencingSymbols);
		},
	});
}
