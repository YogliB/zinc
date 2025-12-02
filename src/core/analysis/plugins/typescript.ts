import {
	Project,
	Node,
	SyntaxKind,
	ClassDeclaration,
	FunctionDeclaration,
	InterfaceDeclaration,
	TypeAliasDeclaration,
	VariableDeclaration,
	EnumDeclaration,
	MethodDeclaration,
	PropertyDeclaration,
} from 'ts-morph';
import type { AST, Symbol, Relationship, Pattern } from '../types';
import type { LanguagePlugin } from './base';

export class TypeScriptPlugin implements LanguagePlugin {
	readonly name = 'typescript';
	readonly languages = ['typescript', 'javascript'];

	private project: Project;
	private projectRoot: string;
	private loadedFiles: Set<string>;

	constructor(projectRoot: string) {
		this.projectRoot = projectRoot;
		this.loadedFiles = new Set();
		this.project = new Project({
			tsConfigFilePath: undefined,
			skipAddingFilesFromTsConfig: true,
			skipFileDependencyResolution: true,
			skipLoadingLibFiles: true,
		});
	}

	private getOrLoadSourceFile(
		path: string,
	): ReturnType<Project['getSourceFile']> {
		let sourceFile = this.project.getSourceFile(path);
		if (!sourceFile && !this.loadedFiles.has(path)) {
			try {
				sourceFile = this.project.addSourceFileAtPath(path);
				this.loadedFiles.add(path);
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				throw new Error(`Failed to load file ${path}: ${errorMessage}`);
			}
		}
		return sourceFile;
	}

	async parse(path: string): Promise<AST> {
		const sourceFile = this.getOrLoadSourceFile(path);
		if (!sourceFile) {
			throw new Error(`File not found: ${path}`);
		}
		return {
			kind: 'SourceFile',
			sourceFile,
		} as AST;
	}

	async preloadFiles(
		patterns?: string[],
	): Promise<{ count: number; errors: string[] }> {
		const defaultPatterns = [
			`${this.projectRoot}/**/*.ts`,
			`${this.projectRoot}/**/*.tsx`,
			`${this.projectRoot}/**/*.js`,
			`${this.projectRoot}/**/*.jsx`,
		];
		const patternsToUse = patterns || defaultPatterns;
		const errors: string[] = [];
		let count = 0;

		try {
			const sourceFiles =
				this.project.addSourceFilesAtPaths(patternsToUse);
			count = sourceFiles.length;
			for (const sourceFile of sourceFiles) {
				this.loadedFiles.add(sourceFile.getFilePath());
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : 'Unknown error';
			errors.push(`Preload failed: ${errorMessage}`);
		}

		return { count, errors };
	}

	async extractSymbols(ast: AST, filePath: string): Promise<Symbol[]> {
		const astData = ast as unknown as { sourceFile?: unknown };
		const sourceFile = astData.sourceFile;
		if (!sourceFile || !Node.isSourceFile(sourceFile as Node)) {
			return [];
		}

		const tsSourceFile = sourceFile as ReturnType<Project['getSourceFile']>;
		if (!tsSourceFile) {
			return [];
		}

		const symbols: Symbol[] = [];

		const extractFromNode = (node: Node): void => {
			if (Node.isClassDeclaration(node)) {
				symbols.push(this.extractClassSymbol(node, filePath));
				for (const method of node.getMethods()) {
					symbols.push(
						this.extractMethodSymbol(method, node, filePath),
					);
				}
				for (const property of node.getProperties()) {
					symbols.push(
						this.extractPropertySymbol(property, node, filePath),
					);
				}
			} else if (Node.isFunctionDeclaration(node)) {
				symbols.push(this.extractFunctionSymbol(node, filePath));
			} else if (Node.isInterfaceDeclaration(node)) {
				symbols.push(this.extractInterfaceSymbol(node, filePath));
			} else if (Node.isTypeAliasDeclaration(node)) {
				symbols.push(this.extractTypeSymbol(node, filePath));
			} else if (Node.isVariableDeclaration(node)) {
				symbols.push(this.extractVariableSymbol(node, filePath));
			} else if (Node.isEnumDeclaration(node)) {
				symbols.push(this.extractEnumSymbol(node, filePath));
			}

			for (const child of node.getChildren()) {
				extractFromNode(child);
			}
		};

		extractFromNode(tsSourceFile);

		return symbols;
	}

	private extractClassSymbol(
		node: ClassDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName() || 'Anonymous';
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'class',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: node.isExported(),
			visibility: 'public',
			metadata: {
				abstract: node.isAbstract(),
				hasExtends: node.getExtends() !== undefined,
				hasImplements: node.getImplements().length > 0,
			},
		};
	}

	private extractFunctionSymbol(
		node: FunctionDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName() || 'Anonymous';
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'function',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: node.isExported(),
			metadata: {
				async: node.isAsync(),
				generator: node.isGenerator(),
			},
		};
	}

	private extractInterfaceSymbol(
		node: InterfaceDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName();
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'interface',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: node.isExported(),
		};
	}

	private extractTypeSymbol(
		node: TypeAliasDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName();
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'type',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: node.isExported(),
		};
	}

	private extractVariableSymbol(
		node: VariableDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName();
		const sourceFile = node.getSourceFile();
		const start = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'variable',
			path: filePath,
			line: start.line,
			column: start.column,
			exported: node.getVariableStatement()?.isExported() ?? false,
		};
	}

	private extractEnumSymbol(node: EnumDeclaration, filePath: string): Symbol {
		const name = node.getName();
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		return {
			name,
			type: 'enum',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: node.isExported(),
		};
	}

	private extractMethodSymbol(
		node: MethodDeclaration,
		parent: ClassDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName();
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		const modifiers = node.getModifiers();
		const isPrivate = modifiers.some(
			(m) => m.getKind() === SyntaxKind.PrivateKeyword,
		);
		const isProtected = modifiers.some(
			(m) => m.getKind() === SyntaxKind.ProtectedKeyword,
		);
		let visibility: 'private' | 'protected' | 'public' = 'public';
		if (isPrivate) {
			visibility = 'private';
		} else if (isProtected) {
			visibility = 'protected';
		}
		return {
			name,
			type: 'method',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: false,
			visibility,
			metadata: {
				parentClass: parent.getName(),
				async: node.isAsync(),
				static: node.isStatic(),
			},
		};
	}

	private extractPropertySymbol(
		node: PropertyDeclaration,
		parent: ClassDeclaration,
		filePath: string,
	): Symbol {
		const name = node.getName();
		const start = node.getStartLineNumber();
		const sourceFile = node.getSourceFile();
		const startPos = sourceFile.getLineAndColumnAtPos(node.getStart());
		const modifiers = node.getModifiers();
		const isPrivate = modifiers.some(
			(m) => m.getKind() === SyntaxKind.PrivateKeyword,
		);
		const isProtected = modifiers.some(
			(m) => m.getKind() === SyntaxKind.ProtectedKeyword,
		);
		let visibility: 'private' | 'protected' | 'public' = 'public';
		if (isPrivate) {
			visibility = 'private';
		} else if (isProtected) {
			visibility = 'protected';
		}
		return {
			name,
			type: 'property',
			path: filePath,
			line: start,
			column: startPos.column,
			exported: false,
			visibility,
			metadata: {
				parentClass: parent.getName(),
				static: node.isStatic(),
				readonly: node.isReadonly(),
			},
		};
	}

	private extractImportRelationships(
		tsSourceFile: ReturnType<Project['getSourceFile']>,
		filePath: string,
	): Relationship[] {
		if (!tsSourceFile) {
			return [];
		}
		const relationships: Relationship[] = [];
		const imports = tsSourceFile.getImportDeclarations();
		for (const imp of imports) {
			const moduleSpecifier = imp.getModuleSpecifierValue();
			const namedImports = imp.getNamedImports();
			for (const namedImport of namedImports) {
				const name = namedImport.getName();
				relationships.push({
					from: filePath,
					to: moduleSpecifier,
					type: 'import',
					metadata: {
						importedName: name,
					},
				});
			}
		}
		return relationships;
	}

	private extractExportRelationships(
		tsSourceFile: ReturnType<Project['getSourceFile']>,
		filePath: string,
	): Relationship[] {
		if (!tsSourceFile) {
			return [];
		}
		const relationships: Relationship[] = [];
		const exports = tsSourceFile.getExportedDeclarations();
		for (const [name, declarations] of exports) {
			for (const decl of declarations) {
				if (Node.isSourceFile(decl)) {
					continue;
				}
				const declFile = decl.getSourceFile();
				if (declFile.getFilePath() === filePath) {
					relationships.push({
						from: filePath,
						to: name,
						type: 'export',
						metadata: {
							exportedName: name,
						},
					});
				}
			}
		}
		return relationships;
	}

	private extractClassRelationships(
		tsSourceFile: ReturnType<Project['getSourceFile']>,
		filePath: string,
	): Relationship[] {
		if (!tsSourceFile) {
			return [];
		}
		const relationships: Relationship[] = [];
		const classes = tsSourceFile.getClasses();
		for (const cls of classes) {
			const extendsClause = cls.getExtends();
			if (extendsClause) {
				const extendsType = extendsClause.getExpression();
				if (Node.isIdentifier(extendsType)) {
					relationships.push({
						from: filePath,
						to: extendsType.getText(),
						type: 'extends',
						metadata: {
							className: cls.getName(),
						},
					});
				}
			}

			const implementsClauses = cls.getImplements();
			for (const impl of implementsClauses) {
				if (Node.isIdentifier(impl.getExpression())) {
					relationships.push({
						from: filePath,
						to: impl.getExpression().getText(),
						type: 'implements',
						metadata: {
							className: cls.getName(),
						},
					});
				}
			}
		}
		return relationships;
	}

	async buildRelationships(
		symbols: Symbol[],
		ast: AST,
		filePath: string,
	): Promise<Relationship[]> {
		const astData = ast as unknown as { sourceFile?: unknown };
		const sourceFile = astData.sourceFile;
		if (!sourceFile || !Node.isSourceFile(sourceFile as Node)) {
			return [];
		}

		const tsSourceFile = sourceFile as ReturnType<Project['getSourceFile']>;
		if (!tsSourceFile) {
			return [];
		}

		const importRelationships = this.extractImportRelationships(
			tsSourceFile,
			filePath,
		);
		const exportRelationships = this.extractExportRelationships(
			tsSourceFile,
			filePath,
		);
		const classRelationships = this.extractClassRelationships(
			tsSourceFile,
			filePath,
		);

		return [
			...importRelationships,
			...exportRelationships,
			...classRelationships,
		];
	}

	private detectFunctionPatterns(
		functions: FunctionDeclaration[],
		filePath: string,
	): Pattern[] {
		const patterns: Pattern[] = [];
		for (const function_ of functions) {
			const name = function_.getName();
			if (!name) {
				continue;
			}
			const lowerName = name.toLowerCase();
			if (lowerName.includes('middleware')) {
				patterns.push({
					type: 'middleware',
					name,
					path: filePath,
					line: function_.getStartLineNumber(),
					confidence: 0.8,
					metadata: {
						async: function_.isAsync(),
					},
				});
			}
			if (lowerName.includes('error') || lowerName.includes('handler')) {
				patterns.push({
					type: 'error-handler',
					name,
					path: filePath,
					line: function_.getStartLineNumber(),
					confidence: 0.7,
				});
			}
		}
		return patterns;
	}

	private detectClassPatterns(
		classes: ClassDeclaration[],
		filePath: string,
	): Pattern[] {
		const patterns: Pattern[] = [];
		for (const cls of classes) {
			const name = cls.getName();
			if (!name) {
				continue;
			}
			const lowerName = name.toLowerCase();
			if (lowerName.includes('controller')) {
				patterns.push({
					type: 'controller',
					name,
					path: filePath,
					line: cls.getStartLineNumber(),
					confidence: 0.8,
				});
			}
			if (lowerName.includes('service')) {
				patterns.push({
					type: 'service',
					name,
					path: filePath,
					line: cls.getStartLineNumber(),
					confidence: 0.8,
				});
			}
		}
		return patterns;
	}

	async detectPatterns(
		ast: AST,
		symbols: Symbol[],
		filePath: string,
	): Promise<Pattern[]> {
		const astData = ast as unknown as { sourceFile?: unknown };
		const sourceFile = astData.sourceFile;
		if (!sourceFile || !Node.isSourceFile(sourceFile as Node)) {
			return [];
		}

		const tsSourceFile = sourceFile as ReturnType<Project['getSourceFile']>;
		if (!tsSourceFile) {
			return [];
		}

		const patterns: Pattern[] = [];
		const functions = tsSourceFile.getFunctions();
		patterns.push(...this.detectFunctionPatterns(functions, filePath));
		const classes = tsSourceFile.getClasses();
		patterns.push(...this.detectClassPatterns(classes, filePath));

		return patterns;
	}
}
