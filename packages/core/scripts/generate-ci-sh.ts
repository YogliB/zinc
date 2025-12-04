import { readFileSync, writeFileSync } from 'node:fs';
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

const parseCI = (yamlPath: string) => {
	const content = readFileSync(yamlPath, 'utf8');
	const parsed = parse(content) as { jobs: Record<string, CIJob> };

	const checks: Array<{ name: string; command: string; optional: boolean }> =
		[];

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

const generateShellScript = (checks: ReturnType<typeof parseCI>) => {
	return `#!/bin/bash
# Auto-generated from .github/workflows/ci.yml
# DO NOT EDIT MANUALLY - run: bun run generate:ci-sh

FAILED_CHECKS=()
OPTIONAL_FAILED=()
TOTAL_CHECKS=0

run_check() {
	local name="$1"
	local command="$2"
	local optional="$3"

	TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
	echo ""
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "Running: $name"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

	if eval "$command"; then
		echo "✅ $name passed"
	else
		if [ "$optional" = "true" ]; then
			echo "⚠️  $name failed (non-blocking)"
			OPTIONAL_FAILED+=("$name")
		else
			echo "❌ $name failed"
			FAILED_CHECKS+=("$name")
		fi
	fi
}

${checks.map((c) => `run_check "${c.name}" "${c.command}" "${c.optional}"`).join('\n\n')}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CI Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total checks: $TOTAL_CHECKS"

if [ \${#OPTIONAL_FAILED[@]} -gt 0 ]; then
	echo "⚠️  Optional checks failed: \${#OPTIONAL_FAILED[@]}"
	for check in "\${OPTIONAL_FAILED[@]}"; do
		echo "  - $check"
	done
fi

if [ \${#FAILED_CHECKS[@]} -eq 0 ]; then
	echo "✅ All required checks passed"
	exit 0
else
	echo "❌ Failed checks: \${#FAILED_CHECKS[@]}"
	for check in "\${FAILED_CHECKS[@]}"; do
		echo "  - $check"
	done
	exit 1
fi
`;
};

const main = () => {
	const checks = parseCI('.github/workflows/ci.yml');
	const script = generateShellScript(checks);
	writeFileSync('scripts/ci.sh', script, { mode: 0o755 });
	console.log('✅ Generated scripts/ci.sh from .github/workflows/ci.yml');
};

main();
