import path from 'path';
import { StorageEngine } from '../../core/storage/engine';
import { parseMarkdown, stringifyMarkdown } from '../../core/storage/markdown';
import { MemoryFileSchema, type MemoryFile } from '../../core/schemas/memory';
import { ValidationError, FileNotFoundError } from '../../core/storage/errors';

export interface MemoryRepositoryOptions {
	storageEngine: StorageEngine;
	memorybankPath?: string;
}

export class MemoryRepository {
	private storageEngine: StorageEngine;
	private memorybankPath: string;

	constructor(options: MemoryRepositoryOptions) {
		this.storageEngine = options.storageEngine;
		this.memorybankPath = options.memorybankPath ?? 'memory-bank';
	}

	private buildMemoryPath(name: string): string {
		const normalized = path.normalize(name);

		if (path.isAbsolute(normalized) || normalized.startsWith('..')) {
			throw new ValidationError(
				`Invalid memory name "${name}": path traversal is not allowed`,
			);
		}

		return `${this.memorybankPath}/${normalized}.md`;
	}

	async getMemory(name: string): Promise<MemoryFile> {
		const filePath = this.buildMemoryPath(name);

		try {
			const content = await this.storageEngine.readFile(filePath);
			const parsed = parseMarkdown(content);

			const memoryFile: MemoryFile = {
				frontmatter: parsed.frontmatter,
				content: parsed.content,
			};

			const validated = MemoryFileSchema.parse(memoryFile);
			return validated;
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to load memory file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async saveMemory(name: string, data: Partial<MemoryFile>): Promise<void> {
		try {
			const frontmatter = data.frontmatter ?? {};
			const content = data.content ?? '';

			const memoryFile: MemoryFile = {
				frontmatter,
				content,
			};

			const validated = MemoryFileSchema.parse(memoryFile);
			const markdown = stringifyMarkdown(validated);
			const filePath = this.buildMemoryPath(name);

			await this.storageEngine.writeFile(filePath, markdown);
		} catch (error) {
			if (error instanceof ValidationError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to save memory file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async listMemories(): Promise<string[]> {
		try {
			const files = await this.storageEngine.listFiles(
				this.memorybankPath,
				{ recursive: true },
			);
			return files
				.filter((file) => file.endsWith('.md'))
				.map((file) => {
					const relativePath = path.relative(
						this.memorybankPath,
						file,
					);
					return relativePath.replace(/\.md$/, '');
				});
		} catch (error) {
			throw new ValidationError(
				`Failed to list memories: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}

	async deleteMemory(name: string): Promise<void> {
		try {
			const filePath = this.buildMemoryPath(name);
			await this.storageEngine.delete(filePath);
		} catch (error) {
			if (error instanceof FileNotFoundError) {
				throw error;
			}

			throw new ValidationError(
				`Failed to delete memory file "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}
}
