#!/usr/bin/env bash

# Check for console.* calls in staged files (excluding scripts/, tests/, and test files)
# Exit code 1 if violations found, 0 otherwise

set -e

# Get staged files (TypeScript/JavaScript only)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|js|tsx|jsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
	exit 0
fi

VIOLATIONS_FOUND=0
VIOLATION_FILES=""

# Check each staged file for console.* calls
for FILE in $STAGED_FILES; do
	# Skip if file doesn't exist (e.g., deleted)
	if [ ! -f "$FILE" ]; then
		continue
	fi

	# Skip scripts/, tests/, and test files
	if echo "$FILE" | grep -qE '^scripts/|^tests/|\.test\.(ts|js)$|\.spec\.(ts|js)$'; then
		continue
	fi

	# Search for console.* calls, excluding:
	# - Single-line comments starting with //
	# - Block comments /* ... */
	# - Multi-line comment markers (*)
	# - Import/type declarations containing 'console'
	MATCHES=$(grep -n 'console\.' "$FILE" | \
		grep -vE '^\s*[0-9]+:\s*//' | \
		grep -vE '^\s*[0-9]+:\s*\*' | \
		grep -vE '/\*.*console\..*\*/' || true)

	if [ -n "$MATCHES" ]; then
		VIOLATIONS_FOUND=1
		if [ -z "$VIOLATION_FILES" ]; then
			VIOLATION_FILES="$FILE"
		else
			VIOLATION_FILES="$VIOLATION_FILES $FILE"
		fi
		echo "❌ Found console.* call(s) in $FILE:"
		echo "$MATCHES" | while IFS= read -r line; do
			echo "   $line"
		done
		echo ""
	fi
done

if [ $VIOLATIONS_FOUND -eq 1 ]; then
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo "🚫 Pre-commit check FAILED: console.* calls detected"
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	echo ""
	echo "Please use the logger utility instead of console.*"
	echo ""
	echo "Example:"
	echo "  import { createLogger } from './core/utils/logger.js';"
	echo "  const logger = createLogger('YourModule');"
	echo "  logger.info('Your message');"
	echo ""
	echo "To bypass this check (not recommended):"
	echo "  git commit --no-verify"
	echo ""
	echo "See docs/CONTRIBUTING.md for more information."
	echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	exit 1
fi

echo "✅ No console.* calls found in staged files"
exit 0
