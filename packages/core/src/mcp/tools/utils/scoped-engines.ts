import path from 'node:path';
import { access } from 'node:fs/promises';
import { createStorageEngine } from '../../../core/storage/engine';
import type { StorageEngine } from '../../../core/storage/engine';
import { AnalysisEngine } from '../../../core/analysis/engine';
import { TypeScriptPlugin } from '../../../core/analysis/plugins/typescript';
import type { GitAnalyzer } from '../../../core/analysis/git/git-analyzer';
import { GitAnalyzer as GitAnalyzerClass } from '../../../core/analysis/git/git-analyzer';

interface ScopedEngines {
	readonly storage: StorageEngine;
	readonly analysis: AnalysisEngine;
	readonly git: GitAnalyzer;
}

interface DefaultEngines {
	readonly storage: StorageEngine;
	readonly analysis: AnalysisEngine;
	readonly git: GitAnalyzer;
}

const scopedEnginesCache = new Map<string, ScopedEngines>();

const validateProjectRoot = async (projectRoot: string): Promise<string> => {
	if (!projectRoot || typeof projectRoot !== 'string') {
		throw new Error('projectRoot must be a non-empty string');
	}

	const normalizedPath = path.resolve(projectRoot);

	if (!path.isAbsolute(normalizedPath)) {
		throw new Error('projectRoot must be an absolute path');
	}

	try {
		await access(normalizedPath);
	} catch {
		throw new Error(
			`projectRoot does not exist or is not accessible: ${normalizedPath}`,
		);
	}

	return normalizedPath;
};

const createScopedEngines = async (
	projectRoot: string,
): Promise<ScopedEngines> => {
	const storage = createStorageEngine({
		rootPath: projectRoot,
		debug: false,
	});

	const analysis = new AnalysisEngine(projectRoot);
	const tsPlugin = new TypeScriptPlugin(projectRoot);
	analysis.registerPlugin(tsPlugin);

	const git = new GitAnalyzerClass(projectRoot);

	return { storage, analysis, git };
};

export const getScopedEngines = async (
	projectRoot: string | undefined,
	defaults: DefaultEngines,
): Promise<ScopedEngines> => {
	if (!projectRoot) {
		return defaults;
	}

	const validatedPath = await validateProjectRoot(projectRoot);

	const cached = scopedEnginesCache.get(validatedPath);
	if (cached) {
		return cached;
	}

	const scoped = await createScopedEngines(validatedPath);
	scopedEnginesCache.set(validatedPath, scoped);

	return scoped;
};
