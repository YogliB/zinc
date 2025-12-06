import path from 'node:path';
import { mkdir, writeFile, rm, realpath } from 'node:fs/promises';

export interface TestProject {
	root: string;
	cleanup: () => Promise<void>;
}

export async function createTestProject(options?: {
	withGit?: boolean;
	withPackageJson?: boolean;
	withTsConfig?: boolean;
	subdirectory?: string;
}): Promise<TestProject> {
	const testRootName = `devflow-test-${Date.now()}`;
	const testRoot = path.resolve('.test-helpers', testRootName);
	const projectRoot = options?.subdirectory
		? path.resolve(testRoot, options.subdirectory)
		: testRoot;

	await mkdir(path.resolve('.test-helpers', testRootName), {
		recursive: true,
	});
	if (options?.subdirectory) {
		await mkdir(
			path.resolve(
				path.resolve('.test-helpers', testRootName),
				options.subdirectory,
			),
			{ recursive: true },
		);
	}

	if (options?.withGit !== false) {
		const gitDirectoryName = '.git';
		const gitDirectory = path.resolve(projectRoot, gitDirectoryName);
		await mkdir(gitDirectory, { recursive: true });
	}

	if (options?.withPackageJson !== false) {
		const packageJsonName = 'package.json';
		const packageJsonPath = path.resolve(projectRoot, packageJsonName);
		await writeFile(
			packageJsonPath,
			JSON.stringify({
				name: 'test-project',
				version: '1.0.0',
				type: 'module',
			}),
		);
	}

	if (options?.withTsConfig) {
		const tsConfigName = 'tsconfig.json';
		const tsConfigPath = path.resolve(projectRoot, tsConfigName);
		await writeFile(
			tsConfigPath,
			JSON.stringify({
				compilerOptions: {
					target: 'ES2020',
					module: 'ESNext',
					strict: true,
				},
			}),
		);
	}

	let resolvedRoot: string;
	try {
		resolvedRoot = await realpath(projectRoot);
	} catch {
		resolvedRoot = projectRoot;
	}

	return {
		root: resolvedRoot,
		cleanup: async () => {
			try {
				await rm(testRoot, { recursive: true, force: true });
			} catch {
				// Cleanup might fail, ignore
			}
		},
	};
}

export async function writeTestFile(
	projectRoot: string,
	filePath: string,
	content: string,
): Promise<string> {
	const fullPath = path.resolve(projectRoot, filePath);
	const directory = path.dirname(fullPath);

	await mkdir(directory, { recursive: true });
	await writeFile(fullPath, content);
	return fullPath;
}
