import { promises as fs } from 'fs';
import path from 'path';
import { PathValidationError, FileNotFoundError, WriteError } from './errors';

export interface StorageEngineOptions {
	rootPath: string;
	debug?: boolean;
}

export class StorageEngine {
	private rootPath: string;
	private debug: boolean;

	constructor(options: StorageEngineOptions) {
		this.rootPath = path.resolve(options.rootPath);
		this.debug = options.debug ?? false;
	}

	private log(level: 'debug' | 'warn' | 'error', message: string): void {
		if (this.debug || level !== 'debug') {
			console.log(`[StorageEngine:${level.toUpperCase()}] ${message}`);
		}
	}

	private validatePath(filePath: string): string {
		if (!filePath || typeof filePath !== 'string') {
			throw new PathValidationError(
				'File path must be a non-empty string',
			);
		}

		const normalized = path.normalize(filePath);

		if (normalized.startsWith('..')) {
			throw new PathValidationError(
				'Path traversal detected: path cannot start with ..',
			);
		}

		const fullPath = path.resolve(this.rootPath, normalized);

		const relative = path.relative(this.rootPath, fullPath);
		if (relative.startsWith('..') || path.isAbsolute(relative)) {
			throw new PathValidationError(
				`Path is outside root directory: ${filePath}`,
			);
		}

		return fullPath;
	}

	async readFile(filePath: string): Promise<string> {
		try {
			const validatedPath = this.validatePath(filePath);
			this.log('debug', `Reading file: ${validatedPath}`);

			const content = await fs.readFile(validatedPath, 'utf-8');
			this.log(
				'debug',
				`Successfully read file: ${validatedPath} (${content.length} bytes)`,
			);
			return content;
		} catch (error) {
			if (error instanceof PathValidationError) {
				throw error;
			}

			if (
				error instanceof Error &&
				'code' in error &&
				error.code === 'ENOENT'
			) {
				throw new FileNotFoundError(filePath);
			}

			throw error;
		}
	}

	async writeFile(filePath: string, content: string): Promise<void> {
		try {
			const validatedPath = this.validatePath(filePath);
			this.log('debug', `Writing file: ${validatedPath}`);

			const directory = path.dirname(validatedPath);

			try {
				await fs.mkdir(directory, { recursive: true });
			} catch (mkdirError) {
				throw new WriteError(
					filePath,
					`Failed to create directory: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`,
				);
			}

			await fs.writeFile(validatedPath, content, 'utf-8');
			this.log(
				'debug',
				`Successfully wrote file: ${validatedPath} (${content.length} bytes)`,
			);
		} catch (error) {
			if (
				error instanceof PathValidationError ||
				error instanceof WriteError
			) {
				throw error;
			}

			throw new WriteError(
				filePath,
				error instanceof Error ? error.message : 'Unknown error',
			);
		}
	}

	async exists(filePath: string): Promise<boolean> {
		try {
			const validatedPath = this.validatePath(filePath);
			await fs.access(validatedPath);
			return true;
		} catch {
			return false;
		}
	}

	async delete(filePath: string): Promise<void> {
		try {
			const validatedPath = this.validatePath(filePath);
			this.log('debug', `Deleting file: ${validatedPath}`);
			await fs.unlink(validatedPath);
			this.log('debug', `Successfully deleted file: ${validatedPath}`);
		} catch (error) {
			if (error instanceof PathValidationError) {
				throw error;
			}

			if (
				error instanceof Error &&
				'code' in error &&
				error.code === 'ENOENT'
			) {
				throw new FileNotFoundError(filePath);
			}

			throw error;
		}
	}

	async listFiles(
		dirPath: string = '',
		options: { recursive?: boolean } = {},
	): Promise<string[]> {
		try {
			const validatedPath = this.validatePath(dirPath || '.');
			this.log('debug', `Listing files in: ${validatedPath}`);

			const files: string[] = [];

			const readDir = async (currentPath: string): Promise<void> => {
				try {
					const entries = await fs.readdir(currentPath, {
						withFileTypes: true,
					});

					for (const entry of entries) {
						const fullPath = path.join(currentPath, entry.name);
						const relativePath = path
							.relative(this.rootPath, fullPath)
							.replace(/\\/g, '/');

						if (entry.isFile()) {
							files.push(relativePath);
						} else if (entry.isDirectory() && options.recursive) {
							await readDir(fullPath);
						}
					}
				} catch (err) {
					if (
						err instanceof Error &&
						'code' in err &&
						err.code === 'ENOENT'
					) {
						this.log(
							'debug',
							`Directory not found: ${currentPath}`,
						);
					} else {
						throw err;
					}
				}
			};

			await readDir(validatedPath);
			return files;
		} catch (error) {
			if (error instanceof PathValidationError) {
				throw error;
			}

			throw error;
		}
	}

	getRootPath(): string {
		return this.rootPath;
	}
}
