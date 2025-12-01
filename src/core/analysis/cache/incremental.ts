import path from 'node:path';
import type { AST } from '../types';

interface FileMetadata {
	mtime: number;
	size: number;
	ast?: AST;
}

export class IncrementalCache {
	private metadata: Map<string, FileMetadata> = new Map();

	async getFileMetadata(filePath: string): Promise<FileMetadata | undefined> {
		return this.metadata.get(filePath);
	}

	async updateFileMetadata(filePath: string, ast?: AST): Promise<void> {
		try {
			const resolvedPath = path.resolve(filePath);
			const { stat } = await import('node:fs/promises');
			const stats = await stat(resolvedPath);
			this.metadata.set(filePath, {
				mtime: stats.mtimeMs,
				size: stats.size,
				ast,
			});
		} catch {
			this.metadata.delete(filePath);
		}
	}

	async hasChanged(filePath: string): Promise<boolean> {
		const cached = this.metadata.get(filePath);
		if (!cached) {
			return true;
		}

		try {
			const resolvedPath = path.resolve(filePath);
			const { stat } = await import('node:fs/promises');
			const stats = await stat(resolvedPath);
			return stats.mtimeMs !== cached.mtime || stats.size !== cached.size;
		} catch {
			return true;
		}
	}

	getAST(filePath: string): AST | undefined {
		return this.metadata.get(filePath)?.ast;
	}

	setAST(filePath: string, ast: AST): void {
		const cached = this.metadata.get(filePath);
		if (cached) {
			cached.ast = ast;
		}
	}

	invalidate(filePath: string): void {
		this.metadata.delete(filePath);
	}

	invalidateAll(): void {
		this.metadata.clear();
	}
}
