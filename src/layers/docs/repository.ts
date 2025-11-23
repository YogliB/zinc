import path from 'path';
import { StorageEngine } from '../../core/storage/engine';
import { parseMarkdown, stringifyMarkdown } from '../../core/storage/markdown';
import {
	DocsFileSchema,
	type DocsFile,
	type DocsFrontmatter,
} from '../../core/schemas/docs';
import { ValidationError, FileNotFoundError } from '../../core/storage/errors';

export interface DocsRepositoryOptions {
	storageEngine: StorageEngine;
	docsPath?: string;
}

export class DocsRepository {
	private storageEngine: StorageEngine;
	private docsPath: string;

	constructor(options: DocsRepositoryOptions) {
		this.storageEngine = options.storageEngine;
		this.docsPath = options.docsPath ?? 'docs';
	}

	private buildDocsPath(relativePath: string): string {
		const normalized = path.normalize(relativePath);

		if (path.isAbsolute(normalized) || normalized.startsWith('..')) {
			throw new ValidationError(
				`Invalid docs path "${relativePath}": path traversal is not allowed`,
			);
		}

		return `${this.docsPath}/${normalized}`;
	}

	async getDoc(path: string): Promise<DocsFile> {
		const filePath = this.buildDocsPath(path);

		try {
			const content = await this.storageEngine.readFile(filePath);
			const parsed = parseMarkdown(content);

			const docsFile: DocsFile = {
				frontmatter: parsed.frontmatter,
				content: parsed.content,
			};

			const validated = DocsFileSchema.parse(docsFile);
			return validated;
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to load docs file "${path}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async saveDoc(path: string, data: Partial<DocsFile>): Promise<void> {
		try {
			const frontmatter = data.frontmatter ?? {};
			const content = data.content ?? '';

			const docsFile: DocsFile = {
				frontmatter,
				content,
			};

			const validated = DocsFileSchema.parse(docsFile);
			const markdown = stringifyMarkdown(validated);
			const filePath = this.buildDocsPath(path);

			await this.storageEngine.writeFile(filePath, markdown);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to save docs file "${path}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async listDocs(directory?: string): Promise<string[]> {
		try {
			const searchPath = directory
				? this.buildDocsPath(directory)
				: this.docsPath;
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

	async deleteDoc(path: string): Promise<void> {
		try {
			const filePath = this.buildDocsPath(path);
			await this.storageEngine.delete(filePath);
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to delete docs file "${path}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async createDoc(
		path: string,
		frontmatter?: DocsFrontmatter,
		content = '',
	): Promise<void> {
		const docsFile: DocsFile = {
			frontmatter: frontmatter ?? {},
			content,
		};
		await this.saveDoc(path, docsFile);
	}
}
