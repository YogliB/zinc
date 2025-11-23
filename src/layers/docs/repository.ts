import path from 'node:path';
import { StorageEngine } from '../../core/storage/engine';
import { parseMarkdown, stringifyMarkdown } from '../../core/storage/markdown';
import {
	DocumentationFileSchema,
	type DocumentationFile,
	type DocumentationFrontmatter,
} from '../../core/schemas/documentation';
import { ValidationError, FileNotFoundError } from '../../core/storage/errors';

export interface DocumentationRepositoryOptions {
	storageEngine: StorageEngine;
	documentationPath?: string;
}

export class DocumentationRepository {
	private storageEngine: StorageEngine;
	private documentationPath: string;

	constructor(options: DocumentationRepositoryOptions) {
		this.storageEngine = options.storageEngine;
		this.documentationPath = options.documentationPath ?? 'docs';
	}

	private buildDocumentationPath(relativePath: string): string {
		const normalized = path.normalize(relativePath);

		if (path.isAbsolute(normalized) || normalized.startsWith('..')) {
			throw new ValidationError(
				`Invalid docs path "${relativePath}": path traversal is not allowed`,
			);
		}

		return `${this.documentationPath}/${normalized}`;
	}

	async getDoc(filePath: string): Promise<DocumentationFile> {
		const fullPath = this.buildDocumentationPath(filePath);

		try {
			const content = await this.storageEngine.readFile(fullPath);
			const parsed = parseMarkdown(content);

			const documentationFile: DocumentationFile = {
				frontmatter: parsed.frontmatter,
				content: parsed.content,
			};

			const validated = DocumentationFileSchema.parse(documentationFile);
			return validated;
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to load docs file "${filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async saveDoc(
		filePath: string,
		data: Partial<DocumentationFile>,
	): Promise<void> {
		try {
			const frontmatter = data.frontmatter ?? {};
			const content = data.content ?? '';

			const documentationFile: DocumentationFile = {
				frontmatter,
				content,
			};

			const validated = DocumentationFileSchema.parse(documentationFile);
			const markdown = stringifyMarkdown(validated);
			const fullPath = this.buildDocumentationPath(filePath);

			await this.storageEngine.writeFile(fullPath, markdown);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to save docs file "${filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async listDocs(directory?: string): Promise<string[]> {
		try {
			const searchPath = directory
				? this.buildDocumentationPath(directory)
				: this.documentationPath;
			const files = await this.storageEngine.listFiles(searchPath, {
				recursive: true,
			});
			return files.filter((file) => file.endsWith('.md'));
		} catch (error) {
			throw new ValidationError(
				`Failed to list docs: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async deleteDoc(filePath: string): Promise<void> {
		try {
			const fullPath = this.buildDocumentationPath(filePath);
			await this.storageEngine.delete(fullPath);
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to delete docs file "${filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async createDoc(
		filePath: string,
		frontmatter?: DocumentationFrontmatter,
		content = '',
	): Promise<void> {
		const documentationFile: DocumentationFile = {
			frontmatter: frontmatter ?? {},
			content,
		};
		await this.saveDoc(filePath, documentationFile);
	}
}
