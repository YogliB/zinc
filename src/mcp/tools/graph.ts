import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';

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
): void {
	server.addTool({
		name: 'getSymbolGraph',
		description:
			'Build a dependency graph of symbols and their relationships within a scope',
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
								engine,
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
