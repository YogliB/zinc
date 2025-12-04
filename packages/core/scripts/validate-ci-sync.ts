/* eslint-disable unicorn/no-process-exit */
import { readFileSync, existsSync } from 'node:fs';
import { parse } from 'yaml';

interface CIJob {
	name: string;
	steps: Array<{
		name?: string;
		run?: string;
		'continue-on-error'?: boolean;
	}>;
	'continue-on-error'?: boolean;
}

interface Check {
	name: string;
	command: string;
	optional: boolean;
}

const parseYAMLChecks = (yamlPath: string): Check[] => {
	if (!existsSync(yamlPath)) {
		throw new Error(`YAML file not found: ${yamlPath}`);
	}

	const content = readFileSync(yamlPath, 'utf8');
	const parsed = parse(content) as { jobs: Record<string, CIJob> };

	const checks: Check[] = [];

	for (const [jobKey, job] of Object.entries(parsed.jobs)) {
		if (jobKey === 'ci-status') continue;

		const optional = job['continue-on-error'] === true;

		for (const step of job.steps) {
			if (
				step.run &&
				!step.run.includes('checkout') &&
				!step.run.includes('cache') &&
				!step.run.includes('install')
			) {
				checks.push({
					name: step.name || job.name,
					command: step.run,
					optional,
				});
			}
		}
	}

	return checks;
};

const parseShellChecks = (shellPath: string): Check[] => {
	if (!existsSync(shellPath)) {
		throw new Error(`Shell script not found: ${shellPath}`);
	}

	const content = readFileSync(shellPath, 'utf8');
	const checks: Check[] = [];

	const runCheckPattern =
		/run_check\s+"([^"]+)"\s+"([^"]+)"\s+"(true|false)"/g;
	let match;

	while ((match = runCheckPattern.exec(content)) !== null) {
		checks.push({
			name: match[1],
			command: match[2],
			optional: match[3] === 'true',
		});
	}

	return checks;
};

const compareChecks = (
	yamlChecks: Check[],
	shellChecks: Check[],
): { inSync: boolean; differences: string[] } => {
	const differences: string[] = [];

	if (yamlChecks.length !== shellChecks.length) {
		differences.push(
			`Check count mismatch: YAML has ${yamlChecks.length}, Shell has ${shellChecks.length}`,
		);
	}

	for (
		let index = 0;
		index < Math.max(yamlChecks.length, shellChecks.length);
		index++
	) {
		// eslint-disable-next-line security/detect-object-injection
		const yaml = yamlChecks[index];
		// eslint-disable-next-line security/detect-object-injection
		const shell = shellChecks[index];

		if (!yaml) {
			differences.push(
				`Extra check in shell script at position ${index + 1}: "${shell.name}"`,
			);
			continue;
		}

		if (!shell) {
			differences.push(
				`Missing check in shell script at position ${index + 1}: "${yaml.name}"`,
			);
			continue;
		}

		if (yaml.name !== shell.name) {
			differences.push(
				`Name mismatch at position ${index + 1}: YAML="${yaml.name}", Shell="${shell.name}"`,
			);
		}

		if (yaml.command !== shell.command) {
			differences.push(
				`Command mismatch for "${yaml.name}": YAML="${yaml.command}", Shell="${shell.command}"`,
			);
		}

		if (yaml.optional !== shell.optional) {
			differences.push(
				`Optional flag mismatch for "${yaml.name}": YAML=${yaml.optional}, Shell=${shell.optional}`,
			);
		}
	}

	return {
		inSync: differences.length === 0,
		differences,
	};
};

const main = () => {
	console.log('🔍 Validating CI sync between YAML and Shell script...\n');

	try {
		const yamlChecks = parseYAMLChecks('.github/workflows/ci.yml');
		const shellChecks = parseShellChecks('scripts/ci.sh');

		console.log(`📋 YAML checks: ${yamlChecks.length}`);
		console.log(`📋 Shell checks: ${shellChecks.length}\n`);

		const { inSync, differences } = compareChecks(yamlChecks, shellChecks);

		if (inSync) {
			console.log('✅ CI files are in sync!');
			process.exit(0);
		} else {
			console.error('❌ CI files are OUT OF SYNC!\n');
			console.error('Differences found:');
			for (const diff of differences) {
				console.error(`  - ${diff}`);
			}
			console.error(
				'\n💡 Fix: Run `bun run generate:ci-sh` to regenerate scripts/ci.sh',
			);
			process.exit(1);
		}
	} catch (error) {
		console.error('❌ Validation failed:', error);
		process.exit(1);
	}
};

main();
