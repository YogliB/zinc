import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { IncrementalCache } from '../../../../../src/core/analysis/cache/incremental';
import type { AST } from '../../../../../src/core/analysis/types';
import {
	createTestProject,
	writeTestFile,
} from '../../../../helpers/test-helpers';
import { sampleTypeScriptFile } from '../../../../helpers/fixtures';

describe('IncrementalCache', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject();
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should track file metadata', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const ast: AST = { kind: 'SourceFile' };
		await cache.updateFileMetadata(filePath, ast);

		const metadata = await cache.getFileMetadata(filePath);
		expect(metadata).toBeDefined();
		expect(metadata?.ast).toBe(ast);
		expect(metadata?.mtime).toBeGreaterThan(0);
		expect(metadata?.size).toBeGreaterThan(0);
	});

	it('should detect file changes', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'src/test.ts',
			sampleTypeScriptFile,
		);

		await cache.updateFileMetadata(filePath);
		expect(await cache.hasChanged(filePath)).toBe(false);

		// Wait a bit to ensure file system timestamp difference
		await new Promise((resolve) => setTimeout(resolve, 10));

		await writeTestFile(
			testProject.root,
			'src/test.ts',
			'export const changed = 1;',
		);
		expect(await cache.hasChanged(filePath)).toBe(true);
	});

	it('should return true for non-existent files', async () => {
		const cache = new IncrementalCache();
		const filePath = path.join(testProject.root, 'nonexistent.ts');

		expect(await cache.hasChanged(filePath)).toBe(true);
	});

	it('should cache and retrieve AST', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const ast: AST = { kind: 'SourceFile' };
		await cache.updateFileMetadata(filePath, ast);

		expect(cache.getAST(filePath)).toBe(ast);
	});

	it('should set AST for existing metadata', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		await cache.updateFileMetadata(filePath);
		const ast: AST = { kind: 'SourceFile' };
		cache.setAST(filePath, ast);

		expect(cache.getAST(filePath)).toBe(ast);
	});

	it('should return undefined for AST when no metadata exists', async () => {
		const cache = new IncrementalCache();
		const filePath = path.join(testProject.root, 'nonexistent.ts');

		expect(cache.getAST(filePath)).toBeUndefined();
	});

	it('should invalidate specific file', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		await cache.updateFileMetadata(filePath);
		cache.invalidate(filePath);

		expect(await cache.getFileMetadata(filePath)).toBeUndefined();
		expect(cache.getAST(filePath)).toBeUndefined();
	});

	it('should invalidate all files', async () => {
		const cache = new IncrementalCache();
		const filePath1 = await writeTestFile(
			testProject.root,
			'test1.ts',
			sampleTypeScriptFile,
		);
		const filePath2 = await writeTestFile(
			testProject.root,
			'test2.ts',
			sampleTypeScriptFile,
		);

		await cache.updateFileMetadata(filePath1);
		await cache.updateFileMetadata(filePath2);

		cache.invalidateAll();

		expect(await cache.getFileMetadata(filePath1)).toBeUndefined();
		expect(await cache.getFileMetadata(filePath2)).toBeUndefined();
	});

	it('should handle file deletion', async () => {
		const cache = new IncrementalCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		await cache.updateFileMetadata(filePath);
		const { rm } = await import('node:fs/promises');
		await rm(filePath);

		await cache.updateFileMetadata(filePath);
		expect(await cache.getFileMetadata(filePath)).toBeUndefined();
	});
});
