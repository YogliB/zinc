import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';

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
				params: { type: 'middleware', scope: 'src/api' },
				next: 'Ensure all middleware follows the same structure',
			},
		}),
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
				const validatedPath = validateDirectoryPath(
					directory,
					projectRoot,
				);
				if (!validatedPath) {
					return;
				}

				const safeDirectory = validatedPath as string;
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
							const analysis = await engine.analyzeFile(fullPath);
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
				scenario: 'Pre-release quality check',
				params: {},
				next: 'Address all naming issues and TODOs',
			},
		}),
		execute: async () => {
			const projectRoot = engine.getProjectRoot();
			const antiPatterns: Array<{
				type: string;
				description: string;
				path: string;
				line: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				const validatedPath = validateDirectoryPath(
					directory,
					projectRoot,
				);
				if (!validatedPath) {
					return;
				}

				const safeDirectory = validatedPath as string;
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
							engine,
							antiPatterns,
						);
					}
				}
			}

			await searchDirectory(projectRoot);

			return JSON.stringify(antiPatterns);
		},
	});
}
