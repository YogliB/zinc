import path from 'node:path';
import { PathValidationError, FileNotFoundError, WriteError } from './errors';

export interface StorageEngineOptions {
	rootPath: string;
	debug?: boolean;
}

export interface StorageEngine {
	readFile: (filePath: string) => Promise<string>;
	writeFile: (filePath: string, content: string) => Promise<void>;
	exists: (filePath: string) => Promise<boolean>;
	delete: (filePath: string) => Promise<void>;
	listFiles: (
		directoryPath?: string,
		options?: { recursive?: boolean },
	) => Promise<string[]>;
	getRootPath: () => string;
}

export function createStorageEngine(
	options: StorageEngineOptions,
): StorageEngine {
	const rootPath = path.resolve(options.rootPath);
	const debug = options.debug ?? false;

	const log = (level: 'debug' | 'warn' | 'error', message: string): void => {
		if (debug || level !== 'debug') {
			console.log(`[StorageEngine:${level.toUpperCase()}] ${message}`);
		}
	};

	const validatePath = (filePath: string): string => {
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

		const fullPath = path.resolve(rootPath, normalized);

		const relative = path.relative(rootPath, fullPath);
		if (relative.startsWith('..') || path.isAbsolute(relative)) {
			throw new PathValidationError(
				`Path is outside root directory: ${filePath}`,
			);
		}

		return fullPath;
	};

	const readFile = async (filePath: string): Promise<string> => {
		try {
			const validatedPath = validatePath(filePath);
			log('debug', `Reading file: ${filePath}`);

			const { readFile: fsReadFile } = await import('node:fs/promises');
			const content = await fsReadFile(validatedPath, 'utf8');
			log(
				'debug',
				`Successfully read file: ${filePath} (${content.length} bytes)`,
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
	};

	const writeFile = async (
		filePath: string,
		content: string,
	): Promise<void> => {
		try {
			const validatedPath = validatePath(filePath);
			log('debug', `Writing file: ${filePath}`);

			const directory = path.dirname(validatedPath);

			try {
				const { mkdir } = await import('node:fs/promises');
				await mkdir(directory, { recursive: true });
			} catch (mkdirError) {
				throw new WriteError(
					filePath,
					`Failed to create directory: ${mkdirError instanceof Error ? mkdirError.message : 'Unknown error'}`,
				);
			}

			const { writeFile: fsWriteFile } = await import('node:fs/promises');
			await fsWriteFile(validatedPath, content, 'utf8');
			log(
				'debug',
				`Successfully wrote file: ${filePath} (${content.length} bytes)`,
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
	};

	const exists = async (filePath: string): Promise<boolean> => {
		try {
			const validatedPath = validatePath(filePath);
			const { access } = await import('node:fs/promises');
			await access(validatedPath);
			return true;
		} catch {
			return false;
		}
	};

	const deleteFile = async (filePath: string): Promise<void> => {
		try {
			const validatedPath = validatePath(filePath);
			log('debug', `Deleting file: ${filePath}`);
			const { unlink } = await import('node:fs/promises');
			await unlink(validatedPath);
			log('debug', `Successfully deleted file: ${filePath}`);
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
	};

	const listFiles = async (
		directoryPath: string = '',
		options: { recursive?: boolean } = {},
	): Promise<string[]> => {
		try {
			const safeDirectory = directoryPath || '.';
			const validatedPath = validatePath(safeDirectory);
			log('debug', `Listing files in: ${safeDirectory}`);

			const files: string[] = [];

			const readDirectory = async (
				currentValidatedPath: string,
			): Promise<void> => {
				try {
					const { readdir } = await import('node:fs/promises');
					const entries = await readdir(currentValidatedPath, {
						withFileTypes: true,
					});

					for (const entry of entries) {
						const fullPath = path.join(
							currentValidatedPath,
							entry.name,
						);
						const relativePath = path
							.relative(rootPath, fullPath)
							.replaceAll('\\', '/');

						if (entry.isFile()) {
							files.push(relativePath);
						} else if (entry.isDirectory() && options.recursive) {
							await readDirectory(fullPath);
						}
					}
				} catch (error) {
					if (
						error instanceof Error &&
						'code' in error &&
						error.code === 'ENOENT'
					) {
						log(
							'debug',
							`Directory not found: ${currentValidatedPath}`,
						);
					} else {
						throw error;
					}
				}
			};

			await readDirectory(validatedPath);
			return files;
		} catch (error) {
			if (error instanceof PathValidationError) {
				throw error;
			}

			throw error;
		}
	};

	const getRootPath = (): string => {
		return rootPath;
	};

	return {
		readFile,
		writeFile,
		exists,
		delete: deleteFile,
		listFiles,
		getRootPath,
	};
}
