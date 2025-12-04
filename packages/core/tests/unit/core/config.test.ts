import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectProjectRoot } from '../../../src/core/config';
import path from 'node:path';
import { mkdir, writeFile, realpath, rm } from 'node:fs/promises';

describe('detectProjectRoot', () => {
	let originalEnvironment: string | undefined;
	let temporaryDirectory: string;

	beforeEach(async () => {
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

		const result = await detectProjectRoot(temporaryDirectory);
		expect(result).toBe(resolvedCustomRoot);
	});

	it('should find .git directory', async () => {
		const projectRootName = 'project-with-git';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		const result = await detectProjectRoot(projectRoot);

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

		const result = await detectProjectRoot(projectRoot);

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

		const result = await detectProjectRoot(projectRoot);

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

		const result = await detectProjectRoot(subDirectory);

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

		const result = await detectProjectRoot(subDirectory);

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

		const result = await detectProjectRoot(projectRoot);

		expect(result).toBe(resolvedRoot);
	});

	it('should fallback to cwd when no indicators found', async () => {
		const osTemporaryDirectory = await import('node:os').then((os) =>
			os.tmpdir(),
		);
		const isolatedTestDirectory = path.resolve(
			osTemporaryDirectory,
			`devflow-test-isolated-${Date.now()}`,
		);
		await mkdir(isolatedTestDirectory, { recursive: true });
		const emptyDirectoryName = 'empty-project';
		const emptyDirectory = path.resolve(
			isolatedTestDirectory,
			emptyDirectoryName,
		);
		await mkdir(emptyDirectory, { recursive: true });

		const result = await detectProjectRoot(emptyDirectory);

		// When using startFrom with no indicators, it falls back to actual process.cwd()
		// not the startFrom directory, because it searches up and doesn't find anything
		const actualCwd = await realpath('.');
		expect(result).toBe(actualCwd);

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

		const result = await detectProjectRoot(deepNested);

		expect(result).toBe(resolvedRoot);
	});

	it('should return absolute path', async () => {
		const projectRootName = 'absolute-test';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);

		await mkdir(gitDirectory, { recursive: true });

		const result = await detectProjectRoot(projectRoot);

		expect(path.isAbsolute(result)).toBe(true);
	});

	it('should handle DEVFLOW_ROOT with trailing slash', async () => {
		const customRootName = 'trailing-slash';
		const customRoot = path.resolve(temporaryDirectory, customRootName);
		await mkdir(customRoot, { recursive: true });
		const resolvedCustomRoot = await realpath(customRoot);

		process.env.DEVFLOW_ROOT = `${customRoot}/`;

		const result = await detectProjectRoot(temporaryDirectory);

		expect(path.isAbsolute(result)).toBe(true);
		expect(result).toBe(resolvedCustomRoot);
	});

	it('should accept startFrom parameter', async () => {
		const projectRootName = 'start-from-test';
		const projectRoot = path.resolve(temporaryDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
		const resolvedRoot = await realpath(projectRoot);

		const result = await detectProjectRoot(projectRoot);

		expect(result).toBe(resolvedRoot);
	});

	it('should prefer validated devflow project root', async () => {
		const testTimestamp = Date.now();
		const testBaseName = `test-config-sibling-${testTimestamp}`;
		const testBaseDirectory = path.resolve(
			temporaryDirectory,
			testBaseName,
		);
		await mkdir(testBaseDirectory, { recursive: true });

		const devflowProjectName = 'devflow-project';
		const devflowProject = path.resolve(
			testBaseDirectory,
			devflowProjectName,
		);
		const otherProjectName = 'other-project';
		const otherProject = path.resolve(testBaseDirectory, otherProjectName);

		await mkdir(devflowProject, { recursive: true });
		await mkdir(otherProject, { recursive: true });

		const devflowGitDirectory = path.resolve(devflowProject, '.git');
		const otherGitDirectory = path.resolve(otherProject, '.git');
		await mkdir(devflowGitDirectory, { recursive: true });
		await mkdir(otherGitDirectory, { recursive: true });

		const devflowPackageJson = path.resolve(devflowProject, 'package.json');
		const otherPackageJson = path.resolve(otherProject, 'package.json');
		await writeFile(
			devflowPackageJson,
			JSON.stringify({ name: 'devflow-mcp' }),
		);
		await writeFile(
			otherPackageJson,
			JSON.stringify({ name: 'other-project' }),
		);

		const resolvedDevflow = await realpath(devflowProject);

		const result = await detectProjectRoot(otherProject);

		expect(result).toBe(resolvedDevflow);

		try {
			await rm(testBaseDirectory, {
				recursive: true,
				force: true,
			});
		} catch {
			// Cleanup might fail
		}
	});

	it('should warn when detected root is not a devflow project', async () => {
		const testTimestamp = Date.now();
		const testBaseName = `test-config-warn-${testTimestamp}`;
		const testBaseDirectory = path.resolve(
			temporaryDirectory,
			testBaseName,
		);
		await mkdir(testBaseDirectory, { recursive: true });

		const projectRootName = 'non-devflow-project';
		const projectRoot = path.resolve(testBaseDirectory, projectRootName);
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(projectRoot, packageJsonName);
		await writeFile(
			packageJsonPath,
			JSON.stringify({ name: 'other-project' }),
		);
		const resolvedRoot = await realpath(projectRoot);

		const originalError = console.error;
		const errorMessages: string[] = [];
		console.error = (...arguments_: unknown[]) => {
			errorMessages.push(String(arguments_[0]));
			originalError(...arguments_);
		};

		const result = await detectProjectRoot(projectRoot);

		expect(result).toBe(resolvedRoot);
		expect(
			errorMessages.some((message) => message.includes('[Config:WARN]')),
		).toBe(true);

		console.error = originalError;

		try {
			await rm(testBaseDirectory, {
				recursive: true,
				force: true,
			});
		} catch {
			// Cleanup might fail
		}
	});
});
