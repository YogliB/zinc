import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpath } from 'node:fs/promises';

function getServerScriptDirectory(): string {
	try {
		const serverModuleUrl = import.meta.url;
		const serverFilePath = fileURLToPath(serverModuleUrl);
		return path.dirname(serverFilePath);
	} catch {
		return process.cwd();
	}
}

async function isValidDevelopmentFlowProjectRoot(
	rootPath: string,
): Promise<boolean> {
	try {
		const packageJsonPath = path.join(rootPath, 'package.json');
		const { readFile: fsReadFile } = await import('node:fs/promises');
		const content = await fsReadFile(packageJsonPath, 'utf8');
		const packageJson = JSON.parse(content);
		return (
			packageJson.name === 'devflow-mcp' ||
			(packageJson.name &&
				typeof packageJson.name === 'string' &&
				packageJson.name.includes('devflow'))
		);
	} catch {
		return false;
	}
}

async function checkDirectoryForIndicators(
	directory: string,
	indicators: string[],
): Promise<string | undefined> {
	try {
		const { readdir } = await import('node:fs/promises');
		const entries = await readdir(directory);

		for (const indicator of indicators) {
			if (entries.includes(indicator)) {
				return indicator;
			}
		}
	} catch {
		// Directory not accessible
	}
	return undefined;
}

async function isWithinDepthLimit(
	currentDirectory: string,
	startDirectory: string,
	nonValidatedResult: string | undefined,
): Promise<boolean> {
	const startPathParts = startDirectory.split(path.sep).filter(Boolean);
	const currentPathParts = currentDirectory.split(path.sep).filter(Boolean);
	const pathDepthDiff = Math.abs(
		currentPathParts.length - startPathParts.length,
	);
	return pathDepthDiff <= 2 || !nonValidatedResult;
}

async function handleValidatedRoot(
	currentDirectory: string,
	indicator: string,
	startDirectory: string,
	nonValidatedResult: string | undefined,
): Promise<string | undefined> {
	const withinDepth = await isWithinDepthLimit(
		currentDirectory,
		startDirectory,
		nonValidatedResult,
	);
	if (withinDepth) {
		console.error(
			`[DevFlow:DEBUG] Found validated project indicator (${indicator}) at: ${currentDirectory}`,
		);
		return currentDirectory;
	}
	return undefined;
}

async function handleNonValidatedRoot(
	currentDirectory: string,
	indicator: string,
): Promise<{ result: string; parent: string }> {
	console.error(
		`[DevFlow:DEBUG] Found project indicator (${indicator}) at: ${currentDirectory}`,
	);
	console.error(
		`[DevFlow:WARN] Detected root may not be a devflow project. Consider setting DEVFLOW_ROOT environment variable.`,
	);
	return {
		result: currentDirectory,
		parent: path.dirname(currentDirectory),
	};
}

async function searchCurrentDirectory(
	currentDirectory: string,
	indicators: string[],
	isPrimarySearch: boolean,
	startDirectory: string,
	nonValidatedResult: string | undefined,
): Promise<{
	validatedRoot?: string;
	nonValidatedRoot?: string;
	nonValidatedParent?: string;
}> {
	const foundIndicator = await checkDirectoryForIndicators(
		currentDirectory,
		indicators,
	);

	if (!foundIndicator) {
		return {};
	}

	const isValid = await isValidDevelopmentFlowProjectRoot(currentDirectory);

	if (isValid) {
		const validatedRoot = await handleValidatedRoot(
			currentDirectory,
			foundIndicator,
			startDirectory,
			nonValidatedResult,
		);
		if (validatedRoot) {
			return { validatedRoot };
		}
	}

	if (isPrimarySearch && !nonValidatedResult) {
		const { result, parent } = await handleNonValidatedRoot(
			currentDirectory,
			foundIndicator,
		);
		return { nonValidatedRoot: result, nonValidatedParent: parent };
	}

	return {};
}

async function searchSiblingsForValidatedRoot(
	nonValidatedResultParent: string,
	nonValidatedResult: string,
	indicators: string[],
): Promise<string | undefined> {
	try {
		const { readdir, stat } = await import('node:fs/promises');
		const parentEntries = await readdir(nonValidatedResultParent);

		for (const entry of parentEntries) {
			const siblingPath = path.join(nonValidatedResultParent, entry);

			try {
				const statResult = await stat(siblingPath);
				if (
					!statResult.isDirectory() ||
					siblingPath === nonValidatedResult
				) {
					continue;
				}

				const foundIndicator = await checkDirectoryForIndicators(
					siblingPath,
					indicators,
				);

				if (foundIndicator) {
					const isValid =
						await isValidDevelopmentFlowProjectRoot(siblingPath);
					if (isValid) {
						console.error(
							`[DevFlow:DEBUG] Found validated project indicator (${foundIndicator}) at: ${siblingPath}`,
						);
						return siblingPath;
					}
				}
			} catch {
				// Continue checking other siblings
			}
		}
	} catch {
		// If we can't read parent directory, return undefined
	}
	return undefined;
}

async function findProjectRootInDirectory(
	startDirectory: string,
	indicators: string[],
	isPrimarySearch: boolean,
): Promise<string | undefined> {
	let currentDirectory = startDirectory;
	let nonValidatedResult: string | undefined;
	let nonValidatedResultParent: string | undefined;

	while (true) {
		const searchResult = await searchCurrentDirectory(
			currentDirectory,
			indicators,
			isPrimarySearch,
			startDirectory,
			nonValidatedResult,
		);

		if (searchResult.validatedRoot) {
			return searchResult.validatedRoot;
		}

		if (searchResult.nonValidatedRoot) {
			nonValidatedResult = searchResult.nonValidatedRoot;
			nonValidatedResultParent = searchResult.nonValidatedParent;
		}

		if (nonValidatedResult && isPrimarySearch) {
			break;
		}

		const parentDirectory = path.dirname(currentDirectory);
		if (parentDirectory === currentDirectory) {
			break;
		}

		currentDirectory = parentDirectory;
	}

	if (nonValidatedResult && nonValidatedResultParent && isPrimarySearch) {
		const siblingResult = await searchSiblingsForValidatedRoot(
			nonValidatedResultParent,
			nonValidatedResult,
			indicators,
		);
		if (siblingResult) {
			return siblingResult;
		}
	}

	return nonValidatedResult;
}

async function buildSearchPaths(
	startFrom: string | undefined,
	cwd: string,
): Promise<Array<{ path: string; isPrimary: boolean }>> {
	const searchPaths: Array<{ path: string; isPrimary: boolean }> = [];
	if (startFrom) {
		const { realpath: fsRealpath } = await import('node:fs/promises');
		const resolvedStartFrom = await fsRealpath(startFrom);
		searchPaths.push({ path: resolvedStartFrom, isPrimary: true });
		return searchPaths;
	}

	searchPaths.push({ path: cwd, isPrimary: true });
	const serverScriptDirectory = getServerScriptDirectory();
	if (serverScriptDirectory !== cwd) {
		searchPaths.push({ path: serverScriptDirectory, isPrimary: false });
	}
	return searchPaths;
}

async function processPrimarySearchPath(
	searchPath: string,
	indicators: string[],
): Promise<{
	validatedProject?: string;
	nonValidatedProject?: string;
}> {
	const found = await findProjectRootInDirectory(
		searchPath,
		indicators,
		true,
	);

	if (!found) {
		return {};
	}

	const isValid = await isValidDevelopmentFlowProjectRoot(found);
	if (isValid) {
		return { validatedProject: found };
	}

	return { nonValidatedProject: found };
}

async function processSecondarySearchPath(
	searchPath: string,
	indicators: string[],
): Promise<string | undefined> {
	const found = await findProjectRootInDirectory(
		searchPath,
		indicators,
		false,
	);

	if (!found) {
		return undefined;
	}

	const isValid = await isValidDevelopmentFlowProjectRoot(found);
	return isValid ? found : undefined;
}

async function processSearchResults(
	searchPaths: Array<{ path: string; isPrimary: boolean }>,
	indicators: string[],
): Promise<{
	validatedDevflowProjectFromPrimary: string | undefined;
	validatedDevflowProjectFromSecondary: string | undefined;
	primarySearchResult: string | undefined;
}> {
	let validatedDevflowProjectFromPrimary: string | undefined;
	let validatedDevflowProjectFromSecondary: string | undefined;
	let primarySearchResult: string | undefined;

	for (const { path: searchPath, isPrimary } of searchPaths) {
		if (isPrimary) {
			const result = await processPrimarySearchPath(
				searchPath,
				indicators,
			);
			validatedDevflowProjectFromPrimary = result.validatedProject;
			primarySearchResult = result.nonValidatedProject;
		} else if (primarySearchResult || validatedDevflowProjectFromPrimary) {
			validatedDevflowProjectFromSecondary =
				await processSecondarySearchPath(searchPath, indicators);
		}
	}

	return {
		validatedDevflowProjectFromPrimary,
		validatedDevflowProjectFromSecondary,
		primarySearchResult,
	};
}

function selectBestResult(
	validatedDevflowProjectFromPrimary: string | undefined,
	validatedDevflowProjectFromSecondary: string | undefined,
	primarySearchResult: string | undefined,
	cwd: string,
): string {
	if (validatedDevflowProjectFromPrimary) {
		return validatedDevflowProjectFromPrimary;
	}

	if (primarySearchResult) {
		return primarySearchResult;
	}

	if (validatedDevflowProjectFromSecondary) {
		return validatedDevflowProjectFromSecondary;
	}

	console.error(
		`[DevFlow:DEBUG] No project indicator found, falling back to cwd: ${cwd}`,
	);
	return cwd;
}

export async function detectProjectRoot(startFrom?: string): Promise<string> {
	const devflowRoot = process.env.DEVFLOW_ROOT;
	if (devflowRoot) {
		console.error(
			`[DevFlow:DEBUG] Using DEVFLOW_ROOT override: ${devflowRoot}`,
		);
		return path.resolve(devflowRoot);
	}

	const indicators = ['.git', 'package.json', 'pyproject.toml'];
	const cwd = await realpath('.');
	const searchPaths = await buildSearchPaths(startFrom, cwd);
	const results = await processSearchResults(searchPaths, indicators);

	return selectBestResult(
		results.validatedDevflowProjectFromPrimary,
		results.validatedDevflowProjectFromSecondary,
		results.primarySearchResult,
		cwd,
	);
}
