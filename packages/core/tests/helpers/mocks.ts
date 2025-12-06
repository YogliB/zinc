import type {
	AST,
	Symbol,
	Relationship,
	Pattern,
} from '../../src/core/analysis/types';
import type { LanguagePlugin } from '../../src/core/analysis/plugins/base';

export class MockLanguagePlugin implements LanguagePlugin {
	readonly name: string;
	readonly languages: string[];
	private mockSymbols: Symbol[] = [];
	private mockRelationships: Relationship[] = [];
	private mockPatterns: Pattern[] = [];

	constructor(
		name: string,
		languages: string[],
		options?: {
			symbols?: Symbol[];
			relationships?: Relationship[];
			patterns?: Pattern[];
		},
	) {
		this.name = name;
		this.languages = languages;
		this.mockSymbols = options?.symbols || [];
		this.mockRelationships = options?.relationships || [];
		this.mockPatterns = options?.patterns || [];
	}

	async parse(filePath: string): Promise<AST> {
		return {
			kind: 'SourceFile',
			filePath,
		} as AST;
	}

	async extractSymbols(_ast: AST, filePath: string): Promise<Symbol[]> {
		return this.mockSymbols.map((s) => ({
			...s,
			path: filePath,
		}));
	}

	async buildRelationships(
		_symbols: Symbol[],
		_ast: AST,
		_filePath: string,
	): Promise<Relationship[]> {
		return this.mockRelationships.filter(
			() => _symbols && _ast.kind && _filePath,
		);
	}

	async detectPatterns(
		_ast: AST,
		_symbols: Symbol[],
		_filePath: string,
	): Promise<Pattern[]> {
		return this.mockPatterns.filter(
			() => _ast.kind && _symbols && _filePath,
		);
	}
}
