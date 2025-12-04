import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';
import { createLogger } from '../../core/utils/logger';

const logger = createLogger('ProjectTools');

interface ProjectOnboarding {
	projectType: string;
	buildCommand?: string;
	testCommand?: string;
	mainPackages: string[];
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	description?: string;
	scripts: Record<string, string>;
}

export function registerProjectTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'getProjectOnboarding',
		description: createToolDescription({
			summary:
				'Extract project metadata: type, build/test commands, dependencies, and main packages from package.json and tsconfig.json.',
			whenToUse: {
				triggers: [
					'First time exploring a codebase',
					'Understanding tech stack and dependencies',
					'Finding available build/test scripts',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
			},
			returns:
				'Project type, build/test commands, dependencies, dev dependencies, and main packages',
			workflow: {
				before: ['Ensure package.json exists in project root'],
				after: [
					'Review scripts for available commands',
					'Check dependencies for main technologies',
					'Use build/test commands in development',
				],
			},
			example: {
				scenario: 'Initial project orientation',
				params: { projectRoot: '/path/to/monorepo/package-a' },
				next: 'Run build command to verify setup',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
		}),
		execute: async ({ projectRoot }: { projectRoot?: string }) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const onboarding: ProjectOnboarding = {
				projectType: 'unknown',
				mainPackages: [],
				dependencies: {},
				devDependencies: {},
				scripts: {},
			};

			try {
				const packageJsonContent =
					await engines.storage.readFile('package.json');
				const packageJson = JSON.parse(packageJsonContent);

				onboarding.projectType = packageJson.type || 'commonjs';
				onboarding.description = packageJson.description;
				onboarding.scripts = packageJson.scripts || {};
				onboarding.dependencies = packageJson.dependencies || {};
				onboarding.devDependencies = packageJson.devDependencies || {};

				onboarding.buildCommand = onboarding.scripts?.build;
				onboarding.testCommand = onboarding.scripts?.test;

				const mainPackages = [
					...Object.keys(onboarding.dependencies),
					...Object.keys(onboarding.devDependencies),
				].slice(0, 20);

				onboarding.mainPackages = mainPackages;
			} catch (error) {
				logger.error(
					`Error reading package.json: ${error instanceof Error ? error.message : String(error)}`,
				);
			}

			try {
				await engines.storage.readFile('tsconfig.json');
				if (onboarding.projectType === 'unknown') {
					onboarding.projectType = 'typescript';
				}
			} catch {
				// Ignore errors when reading tsconfig.json
			}

			return JSON.stringify(onboarding);
		},
	});
}
