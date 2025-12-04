import type { FileAnalysis } from './types';
import type { LanguagePlugin } from './plugins/base';
import { PluginRegistry } from './plugins/registry';
import { detectLanguage } from './utils/language-detector';

export class AnalysisEngine {
	private plugins: PluginRegistry;
	private projectRoot: string;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.plugins = new PluginRegistry();
	}

	registerPlugin(plugin: LanguagePlugin): void {
		this.plugins.register(plugin);
	}

	async analyzeFile(filePath: string): Promise<FileAnalysis> {
		const language = detectLanguage(filePath);
		const plugin = this.plugins.get(language);

		if (!plugin) {
			throw new Error(
				`No plugin available for language: ${language} (file: ${filePath})`,
			);
		}

		const ast = await plugin.parse(filePath);
		const symbols = await plugin.extractSymbols(ast, filePath);
		const relationships = await plugin.buildRelationships(
			symbols,
			ast,
			filePath,
		);
		const patterns = await plugin.detectPatterns(ast, symbols, filePath);

		return {
			path: filePath,
			symbols,
			relationships,
			patterns,
			ast,
		};
	}

	async analyzeFiles(filePaths: string[]): Promise<FileAnalysis[]> {
		return Promise.all(filePaths.map((path) => this.analyzeFile(path)));
	}

	getPlugin(language: string): LanguagePlugin | undefined {
		return this.plugins.get(language);
	}

	getProjectRoot(): string {
		return this.projectRoot;
	}
}
