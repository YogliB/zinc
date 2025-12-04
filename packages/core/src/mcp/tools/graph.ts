import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';

interface SymbolGraph {
	readonly nodes: Array<{
		readonly id: string;
		readonly name: string;
		readonly type: string;
		readonly path: string;
	}>;
	readonly edges: Array<{
		readonly from: string;
		readonly to: string;
		readonly type: string;
	}>;
}

function addSymbolNodes(
	symbols: Array<{
		name: string;
		type: string;
		path: string;
		exported: boolean;
	}>,
	nodes: Map<
		string,
		{ id: string; name: string; type: string; path: string }
	>,
): void {
	for (const symbol of symbols) {
		if (symbol.exported) {
			const nodeId = `${symbol.path}:${symbol.name}`;
			if (!nodes.has(nodeId)) {
				nodes.set(nodeId, {
					id: nodeId,
					name: symbol.name,
					type: symbol.type,
					path: symbol.path,
				});
			}
		}
	}
}

function addRelationshipEdges(
	relationships: Array<{ from: string; to: string; type: string }>,
	edges: Array<{ from: string; to: string; type: string }>,
): void {
	for (const relationship of relationships) {
		edges.push({
			from: relationship.from,
			to: relationship.to,
			type: relationship.type,
		});
	}
}

async function analyzeFileForGraph(
	filePath: string,
	engine: AnalysisEngine,
	nodes: Map<
		string,
		{ id: string; name: string; type: string; path: string }
	>,
	edges: Array<{ from: string; to: string; type: string }>,
): Promise<void> {
	try {
		const analysis = await engine.analyzeFile(filePath);
		addSymbolNodes(analysis.symbols, nodes);
		addRelationshipEdges(analysis.relationships, edges);
	} catch {
		// Ignore errors when analyzing files
	}
}

export function registerGraphTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'getSymbolGraph',
		description: createToolDescription({
			summary:
				'Build a dependency graph showing how symbols connect across files.',
			whenToUse: {
				triggers: [
					'Visualizing architecture and component relationships',
					'Understanding data flow across modules',
					'Planning large refactors that affect multiple files',
				],
				skipIf: 'Need simple reference search (use findReferencingSymbols)',
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				scope: 'Optional directory path to limit graph scope',
			},
			returns:
				'Graph structure with nodes (symbols) and edges (relationships) for visualization or impact analysis',
			workflow: {
				after: [
					'Visualize nodes and edges to understand dependencies',
					'Identify tightly coupled components',
					'Plan refactoring to reduce coupling',
				],
			},
			example: {
				scenario: 'Map dependencies in core module',
				params: { scope: 'src/core' },
				next: 'Visualize graph to find circular dependencies',
			},
			antiPatterns: {
				dont: 'Use for finding specific symbol references',
				do: 'Use findReferencingSymbols for targeted reference searches',
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
				.describe('Optional directory scope to limit graph'),
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

			const nodes = new Map<
				string,
				{ id: string; name: string; type: string; path: string }
			>();
			const edges: Array<{ from: string; to: string; type: string }> = [];

			async function analyzeDirectory(directory: string): Promise<void> {
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
								await analyzeDirectory(fullPath);
							}
						} else if (
							entry.isFile() &&
							isSupportedLanguage(fullPath)
						) {
							await analyzeFileForGraph(
								fullPath,
								engines.analysis,
								nodes,
								edges,
							);
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await analyzeDirectory(targetPath);

			return JSON.stringify({
				nodes: [...nodes.values()],
				edges,
			} as SymbolGraph);
		},
	});
}
