import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitAnalyzer } from '../../../../../src/core/analysis/git/git-analyzer';
import { createTestProject } from '../../../../helpers/test-helpers';
import path from 'node:path';
import { mkdir, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('GitAnalyzer', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;
	let isolatedTestDirectory: string;

	beforeEach(async () => {
		const temporaryBase = tmpdir();
		isolatedTestDirectory = path.resolve(
			temporaryBase,
			`devflow-git-test-${Date.now()}`,
		);
		await mkdir(isolatedTestDirectory, { recursive: true });
		const isolatedProjectRoot = path.resolve(
			isolatedTestDirectory,
			'project',
		);
		await mkdir(isolatedProjectRoot, { recursive: true });
		const resolvedRoot = await realpath(isolatedProjectRoot);

		testProject = {
			root: resolvedRoot,
			cleanup: async () => {
				try {
					await rm(isolatedTestDirectory, {
						recursive: true,
						force: true,
					});
				} catch {
					// Cleanup might fail, ignore
				}
			},
		};
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should initialize with project root', () => {
		const analyzer = new GitAnalyzer(testProject.root);
		expect(analyzer).toBeDefined();
	});

	it('should return empty string for file hash when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const hash = await analyzer.getFileHash('nonexistent.ts');
		expect(hash).toBe('');
	});

	it('should return empty string for current commit SHA when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const sha = await analyzer.getCurrentCommitSHA();
		expect(sha).toBe('');
	});

	it('should return empty array for recent decisions when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const decisions = await analyzer.getRecentDecisions('1 day ago');
		expect(decisions).toEqual([]);
	});

	it('should return default change velocity when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const velocity = await analyzer.analyzeChangeVelocity(
			'test.ts',
			'1 day ago',
		);

		expect(velocity.path).toBe('test.ts');
		expect(velocity.commitCount).toBe(0);
		expect(velocity.lastModified).toBe('');
		expect(velocity.authors).toEqual([]);
	});

	it('should return empty array for commit messages when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const messages = await analyzer.getCommitMessages('1 day ago');
		expect(messages).toEqual([]);
	});
});
