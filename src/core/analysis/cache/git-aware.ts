import { createHash } from 'node:crypto';
import path from 'node:path';
import type { FileAnalysis } from '../types';

interface CacheEntry {
	analysis: FileAnalysis;
	fileHash: string;
	commitSHA?: string;
	timestamp: number;
}

export class GitAwareCache {
	private cache: Map<string, CacheEntry> = new Map();
	private maxSize: number;

	constructor(maxSize = 1000) {
		this.maxSize = maxSize;
	}

	private async getFileHash(filePath: string): Promise<string> {
		try {
			const resolvedPath = path.resolve(filePath);
			const { readFile } = await import('node:fs/promises');
			const content = await readFile(resolvedPath, 'utf8');
			return createHash('sha256').update(content).digest('hex');
		} catch {
			return '';
		}
	}

	private getCacheKey(filePath: string, commitSHA?: string): string {
		if (commitSHA) {
			return `${filePath}:${commitSHA}`;
		}
		return filePath;
	}

	async get(
		filePath: string,
		commitSHA?: string,
	): Promise<FileAnalysis | undefined> {
		const key = this.getCacheKey(filePath, commitSHA);
		const entry = this.cache.get(key);

		if (!entry) {
			return undefined;
		}

		const currentHash = await this.getFileHash(filePath);
		if (entry.fileHash !== currentHash) {
			this.cache.delete(key);
			return undefined;
		}

		return entry.analysis;
	}

	async set(
		filePath: string,
		analysis: FileAnalysis,
		commitSHA?: string,
	): Promise<void> {
		if (this.cache.size >= this.maxSize) {
			this.evictOldest();
		}

		const fileHash = await this.getFileHash(filePath);
		const key = this.getCacheKey(filePath, commitSHA);

		this.cache.set(key, {
			analysis,
			fileHash,
			commitSHA,
			timestamp: Date.now(),
		});
	}

	async isStale(filePath: string, commitSHA?: string): Promise<boolean> {
		const key = this.getCacheKey(filePath, commitSHA);
		const entry = this.cache.get(key);

		if (!entry) {
			return true;
		}

		const currentHash = await this.getFileHash(filePath);
		return entry.fileHash !== currentHash;
	}

	invalidate(filePath: string, commitSHA?: string): void {
		const key = this.getCacheKey(filePath, commitSHA);
		this.cache.delete(key);
	}

	invalidateAll(): void {
		this.cache.clear();
	}

	private evictOldest(): void {
		let oldestKey: string | undefined;
		let oldestTimestamp = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			if (entry.timestamp < oldestTimestamp) {
				oldestTimestamp = entry.timestamp;
				oldestKey = key;
			}
		}

		if (oldestKey) {
			this.cache.delete(oldestKey);
		}
	}

	getSize(): number {
		return this.cache.size;
	}
}
