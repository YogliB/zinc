import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';

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
): void {
	server.addTool({
		name: 'getSymbolsInFile',
		description: 'Get all symbols in a file, optionally filtered by type',
		parameters: z.object({
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
			path: filePath,
			filterByType,
		}: {
			path: string;
			filterByType?: string;
		}) => {
			const projectRoot = engine.getProjectRoot();
			const fullPath = path.isAbsolute(filePath)
				? filePath
				: path.join(projectRoot, filePath);

			const analysis = await engine.analyzeFile(fullPath);
			let symbols = analysis.symbols;

			if (filterByType) {
				symbols = symbols.filter((s) => s.type === filterByType);
			}

			return JSON.stringify(symbols);
		},
	});

	server.addTool({
		name: 'findReferencingSymbols',
		description: 'Find all symbols that reference the given symbol',
		parameters: z.object({
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
			symbol,
			type,
		}: {
			symbol: string;
			type?: string;
		}) => {
			const projectRoot = engine.getProjectRoot();
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
								engine,
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

			await searchDirectory(projectRoot);

			return JSON.stringify(referencingSymbols);
		},
	});
}
