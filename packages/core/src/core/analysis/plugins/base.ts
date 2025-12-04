import type { AST, Symbol, Relationship, Pattern, FileChange } from '../types';

export interface LanguagePlugin {
	readonly name: string;
	readonly languages: string[];

	parse(path: string): Promise<AST>;
	extractSymbols(ast: AST, path: string): Promise<Symbol[]>;
	buildRelationships(
		symbols: Symbol[],
		ast: AST,
		path: string,
	): Promise<Relationship[]>;
	detectPatterns(
		ast: AST,
		symbols: Symbol[],
		path: string,
	): Promise<Pattern[]>;

	canIncrementallyUpdate?(oldAST: AST, changes: FileChange): boolean;
	incrementallyUpdate?(oldAST: AST, changes: FileChange): Promise<AST>;
}
