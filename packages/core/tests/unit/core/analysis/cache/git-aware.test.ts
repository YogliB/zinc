import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitAwareCache } from '../../../../../src/core/analysis/cache/git-aware';
import type { FileAnalysis } from '../../../../../src/core/analysis/types';
import {
	createTestProject,
	writeTestFile,
} from '../../../../setup/test-helpers';
import { sampleTypeScriptFile } from '../../../../setup/fixtures';

describe('GitAwareCache', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject();
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should cache and retrieve analysis', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		const retrieved = await cache.get(filePath);

		expect(retrieved).toBeDefined();
		expect(retrieved?.path).toBe(filePath);
	});

	it('should return undefined for non-existent entry', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const retrieved = await cache.get(filePath);
		expect(retrieved).toBeUndefined();
	});

	it('should invalidate cache when file changes', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const changed = 1;',
		);

		const retrieved = await cache.get(filePath);
		expect(retrieved).toBeUndefined();
	});

	it('should handle commit SHA in cache key', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis, 'commit-1');
		const retrieved = await cache.get(filePath, 'commit-1');
		expect(retrieved).toBeDefined();

		const retrievedWithoutSHA = await cache.get(filePath);
		expect(retrievedWithoutSHA).toBeUndefined();
	});

	it('should check if cache is stale', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		expect(await cache.isStale(filePath)).toBe(false);

		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const changed = 1;',
		);
		expect(await cache.isStale(filePath)).toBe(true);
	});

	it('should invalidate specific entry', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		cache.invalidate(filePath);

		const retrieved = await cache.get(filePath);
		expect(retrieved).toBeUndefined();
	});

	it('should invalidate all entries', async () => {
		const cache = new GitAwareCache();
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

		const analysis: FileAnalysis = {
			path: filePath1,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath1, analysis);
		await cache.set(filePath2, { ...analysis, path: filePath2 });

		cache.invalidateAll();

		expect(await cache.get(filePath1)).toBeUndefined();
		expect(await cache.get(filePath2)).toBeUndefined();
		expect(cache.getSize()).toBe(0);
	});

	it('should evict oldest entry when max size reached', async () => {
		const cache = new GitAwareCache(2);
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
		const filePath3 = await writeTestFile(
			testProject.root,
			'test3.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath1,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath1, analysis);
		await new Promise((resolve) => setTimeout(resolve, 10));
		await cache.set(filePath2, { ...analysis, path: filePath2 });
		await new Promise((resolve) => setTimeout(resolve, 10));
		await cache.set(filePath3, { ...analysis, path: filePath3 });

		expect(cache.getSize()).toBe(2);
		expect(await cache.get(filePath1)).toBeUndefined();
		expect(await cache.get(filePath2)).toBeDefined();
		expect(await cache.get(filePath3)).toBeDefined();
	});

	it('should return correct cache size', async () => {
		const cache = new GitAwareCache();
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis: FileAnalysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		expect(cache.getSize()).toBe(0);
		await cache.set(filePath, analysis);
		expect(cache.getSize()).toBe(1);
	});
});
