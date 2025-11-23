/* eslint-disable security/detect-non-literal-fs-filename */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectProjectRoot } from '../../../src/core/config';
import path from 'node:path';
import { mkdir, writeFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';

describe('detectProjectRoot', () => {
	let originalCurrentDirectory: string;
	let originalEnvironment: string | undefined;
	let temporaryDirectory: string;

	beforeEach(async () => {
		originalCurrentDirectory = process.cwd();
		originalEnvironment = process.env.DEVFLOW_ROOT;
		temporaryDirectory = path.join(tmpdir(), `devflow-test-${Date.now()}`);
		await mkdir(temporaryDirectory, { recursive: true });
		temporaryDirectory = await realpath(temporaryDirectory);
	});

	afterEach(async () => {
		process.chdir(originalCurrentDirectory);
		delete process.env.DEVFLOW_ROOT;
		if (originalEnvironment) {
			process.env.DEVFLOW_ROOT = originalEnvironment;
		}

		try {
			const { rm } = await import('node:fs/promises');
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Cleanup might fail in some cases, but that's okay for tests
		}
	});

	it('should use DEVFLOW_ROOT env var when set', async () => {
		const customRoot = path.join(temporaryDirectory, 'custom-root');
		await mkdir(customRoot, { recursive: true });
		const resolvedCustomRoot = await realpath(customRoot);

		process.env.DEVFLOW_ROOT = customRoot;
		process.chdir(temporaryDirectory);

		const result = await detectProjectRoot();
		expect(result).toBe(resolvedCustomRoot);
	});

	it('should find .git directory', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-with-git');
		const gitDirectory = path.join(projectRoot, '.git');
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should find package.json file', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-with-pkg');
		await mkdir(projectRoot, { recursive: true });
		await writeFile(path.join(projectRoot, 'package.json'), '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should find pyproject.toml file', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-with-py');
		await mkdir(projectRoot, { recursive: true });
		await writeFile(path.join(projectRoot, 'pyproject.toml'), '');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should traverse upward to find .git in parent directory', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-root');
		const gitDirectory = path.join(projectRoot, '.git');
		const subDirectory = path.join(projectRoot, 'src', 'nested');

		await mkdir(gitDirectory, { recursive: true });
		await mkdir(subDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(subDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should traverse upward to find package.json in parent directory', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-pkg-root');
		const subDirectory = path.join(projectRoot, 'src', 'nested');

		await mkdir(subDirectory, { recursive: true });
		await writeFile(path.join(projectRoot, 'package.json'), '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(subDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should prefer .git over package.json when both exist', async () => {
		const projectRoot = path.join(temporaryDirectory, 'project-both');
		const gitDirectory = path.join(projectRoot, '.git');

		await mkdir(gitDirectory, { recursive: true });
		await writeFile(path.join(projectRoot, 'package.json'), '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should fallback to cwd when no indicators found', async () => {
		const emptyDirectory = path.join(temporaryDirectory, 'empty-project');
		await mkdir(emptyDirectory, { recursive: true });
		const resolvedEmpty = await realpath(emptyDirectory);

		process.chdir(emptyDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedEmpty);
	});

	it('should traverse up multiple levels to find project root', async () => {
		const projectRoot = path.join(temporaryDirectory, 'deep-project');
		const deepNested = path.join(projectRoot, 'a', 'b', 'c', 'd', 'e');
		const gitDirectory = path.join(projectRoot, '.git');

		await mkdir(deepNested, { recursive: true });
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(deepNested);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should return absolute path', async () => {
		const projectRoot = path.join(temporaryDirectory, 'absolute-test');
		const gitDirectory = path.join(projectRoot, '.git');

		await mkdir(gitDirectory, { recursive: true });
		process.chdir(projectRoot);

		const result = await detectProjectRoot();

		expect(path.isAbsolute(result)).toBe(true);
	});

	it('should handle DEVFLOW_ROOT with trailing slash', async () => {
		const customRoot = path.join(temporaryDirectory, 'trailing-slash');
		await mkdir(customRoot, { recursive: true });
		const resolvedCustomRoot = await realpath(customRoot);

		process.env.DEVFLOW_ROOT = `${customRoot}/`;
		process.chdir(temporaryDirectory);

		const result = await detectProjectRoot();

		expect(path.isAbsolute(result)).toBe(true);
		expect(result).toBe(resolvedCustomRoot);
	});
});
