import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';

export function registerContextTools(
	server: FastMCP,
	engine: AnalysisEngine,
): void {
	server.addTool({
		name: 'getContextForFile',
		description:
			'Get comprehensive context for a file including symbols, relationships, and related files',
		parameters: z.object({
			file: z.string().describe('Path to the file'),
		}),
		execute: async ({ file }: { file: string }) => {
			const projectRoot = engine.getProjectRoot();
			const fullPath = path.isAbsolute(file)
				? file
				: path.join(projectRoot, file);

			const analysis = await engine.analyzeFile(fullPath);

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
		description:
			'Generate a summary of a file including its purpose, exports, and key symbols',
		parameters: z.object({
			path: z.string().describe('Path to the file'),
			depth: z
				.number()
				.default(2)
				.optional()
				.describe('Depth of analysis (1=shallow, 2=medium, 3=deep)'),
		}),
		execute: async ({
			path: filePath,
		}: {
			path: string;
			depth?: number;
		}) => {
			const projectRoot = engine.getProjectRoot();
			const fullPath = path.isAbsolute(filePath)
				? filePath
				: path.join(projectRoot, filePath);

			const analysis = await engine.analyzeFile(fullPath);

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
		description: 'Analyze test coverage for a given scope',
		parameters: z.object({
			scope: z
				.string()
				.optional()
				.describe('Optional directory scope to analyze'),
		}),
		execute: async ({ scope }: { scope?: string }) => {
			const projectRoot = engine.getProjectRoot();
			const targetPath = scope
				? path.join(projectRoot, scope)
				: projectRoot;

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
