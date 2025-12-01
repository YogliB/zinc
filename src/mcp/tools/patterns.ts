import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';

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
): void {
	server.addTool({
		name: 'findCodePatterns',
		description: 'Find code patterns of a specific type within a scope',
		parameters: z.object({
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
		execute: async ({ type, scope }: { type: string; scope?: string }) => {
			const projectRoot = engine.getProjectRoot();
			const targetPath = scope
				? path.join(projectRoot, scope)
				: projectRoot;

			const patterns: Array<{
				type: string;
				name: string;
				path: string;
				line: number;
				confidence: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				try {
					const resolvedDirectory = path.resolve(directory);
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
							try {
								const analysis =
									await engine.analyzeFile(fullPath);
								const matchingPatterns =
									analysis.patterns.filter(
										(p) => p.type === type,
									);
								patterns.push(...matchingPatterns);
							} catch {
								// Ignore errors when analyzing files
							}
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await searchDirectory(targetPath);

			return JSON.stringify(patterns);
		},
	});

	server.addTool({
		name: 'detectAntiPatterns',
		description: 'Detect common anti-patterns in the codebase',
		execute: async () => {
			const projectRoot = engine.getProjectRoot();
			const antiPatterns: Array<{
				type: string;
				description: string;
				path: string;
				line: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				try {
					const resolvedDirectory = path.resolve(directory);
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
							await analyzeFileForAntiPatterns(
								fullPath,
								engine,
								antiPatterns,
							);
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await searchDirectory(projectRoot);

			return JSON.stringify(antiPatterns);
		},
	});
}
