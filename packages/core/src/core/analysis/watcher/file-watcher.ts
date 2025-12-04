import fs from 'node:fs';
import path from 'node:path';
import type { GitAwareCache } from '../cache/git-aware';
import { createLogger } from '../../utils/logger';

const logger = createLogger('FileWatcher');

export type FileChangeCallback = (filePath: string) => void | Promise<void>;

type FSWatcher = ReturnType<typeof fs.watch>;

const boundWatch = fs.watch.bind(fs);

const EXCLUSION_PATTERNS = [
	'node_modules',
	'.git',
	'.cache',
	'.npm',
	'dist',
	'build',
	'.next',
	'.turbo',
	'coverage',
];

const MAX_FILE_COUNT_ESTIMATE = 10_000;
export const MAX_FILE_COUNT_THRESHOLD = 100_000;

function shouldIncludeDirectory(directoryName: string): boolean {
	return !EXCLUSION_PATTERNS.includes(directoryName);
}

async function processDirectoryEntries(
	currentDirectory: string,
	directoriesToProcess: string[],
	fileCount: number,
): Promise<number> {
	const { readdir } = await import('node:fs/promises');
	const entries = await readdir(currentDirectory, { withFileTypes: true });
	let newFileCount = fileCount;

	for (const entry of entries) {
		if (newFileCount >= MAX_FILE_COUNT_THRESHOLD) {
			break;
		}
		if (newFileCount >= MAX_FILE_COUNT_ESTIMATE) {
			break;
		}

		if (entry.isFile()) {
			newFileCount++;
			continue;
		}

		if (entry.isDirectory()) {
			const directoryName = entry.name;
			if (shouldIncludeDirectory(directoryName)) {
				const fullPath = path.join(currentDirectory, entry.name);
				directoriesToProcess.push(fullPath);
			}
		}
	}

	return newFileCount;
}

export async function estimateDirectorySize(
	directoryPath: string,
): Promise<number> {
	let fileCount = 0;
	const directoriesToProcess: string[] = [directoryPath];

	while (
		directoriesToProcess.length > 0 &&
		fileCount < MAX_FILE_COUNT_ESTIMATE
	) {
		if (fileCount >= MAX_FILE_COUNT_THRESHOLD) {
			return MAX_FILE_COUNT_THRESHOLD;
		}

		const currentDirectory = directoriesToProcess.shift()!;

		try {
			fileCount = await processDirectoryEntries(
				currentDirectory,
				directoriesToProcess,
				fileCount,
			);
			if (fileCount >= MAX_FILE_COUNT_THRESHOLD) {
				return MAX_FILE_COUNT_THRESHOLD;
			}
		} catch {
			continue;
		}
	}

	if (fileCount >= MAX_FILE_COUNT_ESTIMATE) {
		return Math.max(fileCount, MAX_FILE_COUNT_THRESHOLD);
	}

	return fileCount;
}

export class FileWatcher {
	private watchers: Map<string, FSWatcher> = new Map();
	private callbacks: Set<FileChangeCallback> = new Set();
	private debounceTime: number;
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
	private cache?: GitAwareCache;
	private readonly exclusionPatterns: string[];
	private readonly estimateSizeFn: (path: string) => Promise<number>;

	constructor(
		debounceTime = 100,
		cache?: GitAwareCache,
		estimateSizeFunction: (
			path: string,
		) => Promise<number> = estimateDirectorySize,
	) {
		this.debounceTime = debounceTime;
		this.cache = cache;
		this.exclusionPatterns = [...EXCLUSION_PATTERNS];
		this.estimateSizeFn = estimateSizeFunction;
	}

	private shouldExcludePath(filePath: string, rootPath: string): boolean {
		const relativePath = path.relative(rootPath, filePath);
		const pathParts = relativePath.split(path.sep);

		for (const part of pathParts) {
			if (this.exclusionPatterns.includes(part)) {
				return true;
			}
		}

		return false;
	}

	private getErrorMessage(error: unknown, directoryPath: string): string {
		if (error === undefined || error === null) {
			return 'Unknown error (undefined or null)';
		}
		if (error instanceof Error) {
			if ('code' in error) {
				if (error.code === 'ENOENT') {
					return `Directory not found: ${directoryPath}`;
				}
				if (error.code === 'EACCES') {
					return `Permission denied: ${directoryPath}`;
				}
			}
			return error.message || 'Unknown error';
		}
		if (typeof error === 'string') {
			return error;
		}
		return `Unknown error: ${String(error)}`;
	}

	private async verifyDirectoryAccess(
		resolvedDirectoryPath: string,
	): Promise<void> {
		const { access } = await import('node:fs/promises');
		try {
			await access(resolvedDirectoryPath);
		} catch (error) {
			const errorMessage = this.getErrorMessage(
				error,
				resolvedDirectoryPath,
			);
			throw new Error(
				`Cannot watch directory ${resolvedDirectoryPath}: ${errorMessage}`,
			);
		}
	}

	private async getDirectorySize(
		resolvedDirectoryPath: string,
	): Promise<number> {
		try {
			return await this.estimateSizeFn(resolvedDirectoryPath);
		} catch (error) {
			const errorMessage = this.getErrorMessage(
				error,
				resolvedDirectoryPath,
			);
			throw new Error(
				`Failed to estimate directory size for ${resolvedDirectoryPath}: ${errorMessage}`,
			);
		}
	}

	private validateDirectorySize(estimatedSize: number): void {
		if (estimatedSize >= MAX_FILE_COUNT_THRESHOLD) {
			throw new Error(
				`Directory too large to watch (estimated ${estimatedSize} files). ` +
					`Please set DEVFLOW_ROOT environment variable to a smaller project directory.`,
			);
		}

		if (estimatedSize > 10_000) {
			logger.warn(
				`Large directory detected (estimated ${estimatedSize} files). ` +
					`Watching may impact performance.`,
			);
		}
	}

	private createWatchCallback(
		resolvedDirectoryPath: string,
	): (eventType: string, filename: string | null) => void {
		return (eventType: string, filename: string | null) => {
			if (!filename) {
				return;
			}

			const filePath = path.join(resolvedDirectoryPath, filename);

			if (this.shouldExcludePath(filePath, resolvedDirectoryPath)) {
				return;
			}

			const existingTimer = this.debounceTimers.get(filePath);
			if (existingTimer) {
				clearTimeout(existingTimer);
			}

			const timer = setTimeout(() => {
				this.handleFileChange(filePath);
				this.debounceTimers.delete(filePath);
			}, this.debounceTime);

			this.debounceTimers.set(filePath, timer);
		};
	}

	private createFsWatcher(
		resolvedDirectoryPath: string,
		watchCallback: (eventType: string, filename: string | null) => void,
	): FSWatcher {
		if (typeof boundWatch !== 'function') {
			throw new TypeError(
				`Failed to watch directory ${resolvedDirectoryPath}: fs.watch is not available`,
			);
		}

		try {
			const watchResult = boundWatch(
				resolvedDirectoryPath,
				{ recursive: true },
				watchCallback,
			) as FSWatcher | undefined;

			if (watchResult === undefined || watchResult === null) {
				throw new Error(
					`Failed to watch directory ${resolvedDirectoryPath}: fs.watch() returned null or undefined. Recursive watching may not be supported.`,
				);
			}

			return watchResult;
		} catch (watchError) {
			if (watchError instanceof Error) {
				throw watchError;
			}
			if (watchError === undefined || watchError === null) {
				throw new Error(
					`Failed to watch directory ${resolvedDirectoryPath}: fs.watch() threw undefined/null. Recursive watching may not be supported.`,
				);
			}
			const errorMessage = this.getErrorMessage(
				watchError,
				resolvedDirectoryPath,
			);
			throw new Error(
				`Failed to watch directory ${resolvedDirectoryPath}: ${errorMessage}`,
			);
		}
	}

	async watchDirectory(directoryPath: string): Promise<void> {
		try {
			const resolvedDirectoryPath = path.resolve(directoryPath);

			if (this.watchers.has(resolvedDirectoryPath)) {
				return;
			}

			await this.verifyDirectoryAccess(resolvedDirectoryPath);
			const estimatedSize = await this.getDirectorySize(
				resolvedDirectoryPath,
			);
			this.validateDirectorySize(estimatedSize);

			const watchCallback = this.createWatchCallback(
				resolvedDirectoryPath,
			);
			const watcher = this.createFsWatcher(
				resolvedDirectoryPath,
				watchCallback,
			);

			this.watchers.set(resolvedDirectoryPath, watcher);
		} catch (error) {
			if (error === undefined || error === null) {
				throw new Error(
					`Failed to watch directory ${directoryPath}: unexpected undefined/null error`,
				);
			}
			if (error instanceof Error) {
				throw error;
			}
			throw new Error(
				`Failed to watch directory ${directoryPath}: ${String(error)}`,
			);
		}
	}

	onChange(callback: FileChangeCallback): void {
		this.callbacks.add(callback);
	}

	offChange(callback: FileChangeCallback): void {
		this.callbacks.delete(callback);
	}

	private async handleFileChange(filePath: string): Promise<void> {
		if (this.cache) {
			this.cache.invalidate(filePath);
		}

		for (const callback of this.callbacks) {
			try {
				await callback(filePath);
			} catch (error) {
				logger.error(
					`Error in callback for ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
		}
	}

	stop(): void {
		for (const watcher of this.watchers.values()) {
			watcher.close();
		}
		this.watchers.clear();

		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();
	}
}
