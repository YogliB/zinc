import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';

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
): void {
	server.addTool({
		name: 'getArchitecture',
		description:
			'Get architectural overview including symbols, patterns, and relationships for a given scope',
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
					const analysis = await engine.analyzeFile(filePath);
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
					console.error(
						`[getArchitecture] Error analyzing ${filePath}:`,
						error,
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
