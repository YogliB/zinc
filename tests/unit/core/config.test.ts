import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { detectProjectRoot } from '../../../src/core/config';
import path from 'node:path';
import { mkdir, writeFile, realpath, rm } from 'node:fs/promises';

describe('detectProjectRoot', () => {
	let originalCurrentDirectory: string;
	let originalEnvironment: string | undefined;
	let temporaryDirectory: string;

	beforeEach(async () => {
		originalCurrentDirectory = process.cwd();
		originalEnvironment = process.env.DEVFLOW_ROOT;
		const testBasePathLiteral = '.test-config';
		await mkdir(testBasePathLiteral, {
			recursive: true,
		});
		const testDirectoryName = `devflow-test-${Date.now()}`;
		temporaryDirectory = path.resolve(
			testBasePathLiteral,
			testDirectoryName,
		);
		await mkdir(temporaryDirectory, {
			recursive: true,
		});
		temporaryDirectory = await realpath(temporaryDirectory);
	});

	afterEach(async () => {
		process.chdir(originalCurrentDirectory);
		delete process.env.DEVFLOW_ROOT;
		if (originalEnvironment) {
			process.env.DEVFLOW_ROOT = originalEnvironment;
		}

		try {
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Cleanup might fail in some cases, but that's okay for tests
		}
	});

	it('should use DEVFLOW_ROOT env var when set', async () => {
		const customRootName = 'custom-root';
		const customRoot = path.resolve(temporaryDirectory, customRootName);
		await mkdir(customRoot, { recursive: true });
		const resolvedCustomRoot = await realpath(customRoot);

		process.env.DEVFLOW_ROOT = customRoot;
		process.chdir(temporaryDirectory);

		const result = await detectProjectRoot();
		expect(result).toBe(resolvedCustomRoot);
	});

	it('should find .git directory', async () => {
		const projectRootName = 'project-with-git';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should find package.json file', async () => {
		const projectRootName = 'project-with-pkg';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		await mkdir(projectRoot, { recursive: true });
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(projectRoot, packageJsonName);
		await writeFile(packageJsonPath, '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should find pyproject.toml file', async () => {
		const projectRootName = 'project-with-py';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		await mkdir(projectRoot, { recursive: true });
		const pyProjectName = 'pyproject.toml';
		const pyProjectPath = path.resolve(projectRoot, pyProjectName);
		await writeFile(pyProjectPath, '');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should traverse upward to find .git in parent directory', async () => {
		const projectRootName = 'project-root';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		const subDirectoryName = 'nested';
		const subDirectory = path.resolve(projectRoot, 'src', subDirectoryName);

		await mkdir(gitDirectory, { recursive: true });
		await mkdir(subDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(subDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should traverse upward to find package.json in parent directory', async () => {
		const projectRootName = 'project-pkg-root';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const subDirectoryName = 'nested';
		const subDirectory = path.resolve(projectRoot, 'src', subDirectoryName);

		await mkdir(subDirectory, { recursive: true });
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(projectRoot, packageJsonName);
		await writeFile(packageJsonPath, '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(subDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should prefer .git over package.json when both exist', async () => {
		const projectRootName = 'project-both';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);

		await mkdir(gitDirectory, { recursive: true });
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(projectRoot, packageJsonName);
		await writeFile(packageJsonPath, '{}');
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(projectRoot);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should fallback to cwd when no indicators found', async () => {
		const temporaryDirectory = await import('node:os').then((os) =>
			os.tmpdir(),
		);
		const isolatedTestDirectory = path.resolve(
			temporaryDirectory,
			`devflow-test-isolated-${Date.now()}`,
		);
		const emptyDirectoryName = 'empty-project';
		const emptyDirectory = path.resolve(
			isolatedTestDirectory,
			emptyDirectoryName,
		);
		await mkdir(emptyDirectory, { recursive: true });
		const resolvedEmpty = await realpath(emptyDirectory);

		process.chdir(emptyDirectory);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedEmpty);

		try {
			await rm(isolatedTestDirectory, { recursive: true, force: true });
		} catch {
			// Cleanup might fail, but that's okay
		}
	});

	it('should traverse up multiple levels to find project root', async () => {
		const projectRootName = 'deep-project';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const deepNested = path.resolve(projectRoot, 'a', 'b', 'c', 'd', 'e');
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);

		await mkdir(deepNested, { recursive: true });
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		process.chdir(deepNested);
		const result = await detectProjectRoot();

		expect(result).toBe(resolvedRoot);
	});

	it('should return absolute path', async () => {
		const projectRootName = 'absolute-test';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);

		await mkdir(gitDirectory, { recursive: true });
		process.chdir(projectRoot);

		const result = await detectProjectRoot();

		expect(path.isAbsolute(result)).toBe(true);
	});

	it('should handle DEVFLOW_ROOT with trailing slash', async () => {
		const customRootName = 'trailing-slash';
		const customRoot = path.resolve(temporaryDirectory, customRootName);
		await mkdir(customRoot, { recursive: true });
		const resolvedCustomRoot = await realpath(customRoot);

		process.env.DEVFLOW_ROOT = `${customRoot}/`;
		process.chdir(temporaryDirectory);

		const result = await detectProjectRoot();

		expect(path.isAbsolute(result)).toBe(true);
		expect(result).toBe(resolvedCustomRoot);
	});
});
