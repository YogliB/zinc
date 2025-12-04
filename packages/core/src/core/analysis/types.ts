export interface AST {
	readonly kind: string;
	readonly [key: string]: unknown;
}

export interface Symbol {
	readonly name: string;
	readonly type:
		| 'class'
		| 'function'
		| 'interface'
		| 'type'
		| 'variable'
		| 'enum'
		| 'namespace'
		| 'method'
		| 'property';
	readonly path: string;
	readonly line: number;
	readonly column: number;
	readonly exported: boolean;
	readonly visibility?: 'public' | 'private' | 'protected';
	readonly metadata?: Record<string, unknown>;
}

export interface Relationship {
	readonly from: string;
	readonly to: string;
	readonly type:
		| 'import'
		| 'export'
		| 'extends'
		| 'implements'
		| 'calls'
		| 'references';
	readonly metadata?: Record<string, unknown>;
}

export interface Pattern {
	readonly type: string;
	readonly name: string;
	readonly path: string;
	readonly line: number;
	readonly confidence: number;
	readonly metadata?: Record<string, unknown>;
}

export interface FileChange {
	readonly path: string;
	readonly type: 'created' | 'modified' | 'deleted';
	readonly content?: string;
}

export interface FileAnalysis {
	readonly path: string;
	readonly symbols: Symbol[];
	readonly relationships: Relationship[];
	readonly patterns: Pattern[];
	readonly ast: AST;
}
