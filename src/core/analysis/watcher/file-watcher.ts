import fs from 'node:fs';
import path from 'node:path';
import type { GitAwareCache } from '../cache/git-aware';

export type FileChangeCallback = (filePath: string) => void | Promise<void>;

type FSWatcher = ReturnType<typeof fs.watch>;

const boundWatch = fs.watch.bind(fs);

export class FileWatcher {
	private watchers: Map<string, FSWatcher> = new Map();
	private callbacks: Set<FileChangeCallback> = new Set();
	private debounceTime: number;
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
	private cache?: GitAwareCache;

	constructor(debounceTime = 100, cache?: GitAwareCache) {
		this.debounceTime = debounceTime;
		this.cache = cache;
	}

	watchDirectory(directoryPath: string): void {
		if (this.watchers.has(directoryPath)) {
			return;
		}

		const resolvedDirectoryPath = path.resolve(directoryPath);
		const watcher = boundWatch(
			resolvedDirectoryPath,
			{ recursive: true },
			(eventType, filename) => {
				if (!filename) {
					return;
				}

				const filePath = path.join(resolvedDirectoryPath, filename);

				const existingTimer = this.debounceTimers.get(filePath);
				if (existingTimer) {
					clearTimeout(existingTimer);
				}

				const timer = setTimeout(() => {
					this.handleFileChange(filePath);
					this.debounceTimers.delete(filePath);
				}, this.debounceTime);

				this.debounceTimers.set(filePath, timer);
			},
		);

		this.watchers.set(resolvedDirectoryPath, watcher);
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
				console.error(
					`[FileWatcher] Error in callback for ${filePath}:`,
					error,
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
