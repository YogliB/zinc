#!/bin/bash
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

run_check "Run ESLint" "bun run lint" "false"

run_check "Check Prettier formatting" "bun run format:check" "false"

run_check "Run security audit" "bun audit" "false"

run_check "Type check with TypeScript" "bun run type-check" "false"

run_check "Build executable" "bun run build" "false"

run_check "Verify executable exists" "test -f ./dist/server.js" "false"

run_check "Run tests with coverage" "bun run test" "false"

run_check "Create test results directory" "mkdir -p .bun-test" "false"

run_check "Check test performance" "bun run test:perf" "false"

run_check "Validate CI sync" "bun run validate:ci-sync" "false"

run_check "Check for circular dependencies" "bun run check:circular:ci" "false"

run_check "Check for unused dependencies" "bun run knip" "false"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CI Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Total checks: $TOTAL_CHECKS"

if [ ${#OPTIONAL_FAILED[@]} -gt 0 ]; then
	echo "⚠️  Optional checks failed: ${#OPTIONAL_FAILED[@]}"
	for check in "${OPTIONAL_FAILED[@]}"; do
		echo "  - $check"
	done
fi

if [ ${#FAILED_CHECKS[@]} -eq 0 ]; then
	echo "✅ All required checks passed"
	exit 0
else
	echo "❌ Failed checks: ${#FAILED_CHECKS[@]}"
	for check in "${FAILED_CHECKS[@]}"; do
		echo "  - $check"
	done
	exit 1
fi
