import { readFileSync, existsSync } from 'node:fs';
import { expect } from 'vitest';

interface TestSpecificBaseline {
	name: string;
	duration: number;
	timestamp: string;
}

interface PerformanceBaseline {
	baseline: {
		totalDuration: number;
		testCount: number;
		fileCount: number;
		avgPerTest: number;
		files: Record<string, unknown>;
		timestamp: string;
	};
	thresholds: {
		maxRegression: number;
		maxDuration: number;
	};
	testSpecificBaselines?: Record<string, TestSpecificBaseline>;
	history?: unknown[];
}

const BASELINE_FILE = '.bun-performance.json';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const ABSOLUTE_FALLBACKS: Record<string, number> = {
	'analysis-engine-lazy-loading.preloaded-file-analysis': 500,
	'performance-benchmarks.first-file-analysis': 800,
	'performance-benchmarks.plugin-init-100': 150,
	'performance-benchmarks.plugin-init-500': 300,
	'performance-benchmarks.batch-analysis': 3000,
	'performance-benchmarks.preload-100': 7500,
	'performance-benchmarks.preloaded-analysis': 800,
	'performance-benchmarks.memory-efficiency': 75,
	'performance-benchmarks.large-file': 4500,
};

let cachedBaseline: PerformanceBaseline | undefined;

export const loadPerformanceBaseline = (): PerformanceBaseline | undefined => {
	if (cachedBaseline) {
		return cachedBaseline;
	}

	if (!existsSync(BASELINE_FILE)) {
		console.warn(
			`⚠️  Performance baseline file not found: ${BASELINE_FILE}`,
		);
		return undefined;
	}

	try {
		const content = readFileSync(BASELINE_FILE, 'utf8');
		const baseline = JSON.parse(content) as PerformanceBaseline;

		const baselineAge =
			Date.now() - new Date(baseline.baseline.timestamp).getTime();
		if (baselineAge > THIRTY_DAYS_MS) {
			console.warn(
				`⚠️  Performance baseline is stale (${Math.floor(baselineAge / (24 * 60 * 60 * 1000))} days old). Consider updating it.`,
			);
		}

		cachedBaseline = baseline;
		return baseline;
	} catch (error) {
		console.error(
			`❌ Failed to load performance baseline: ${error instanceof Error ? error.message : String(error)}`,
		);
		return undefined;
	}
};

export const getBaselineDuration = (testName: string): number | undefined => {
	const baseline = loadPerformanceBaseline();

	if (!baseline) {
		return undefined;
	}

	if (
		baseline.testSpecificBaselines &&
		// eslint-disable-next-line security/detect-object-injection
		baseline.testSpecificBaselines[testName]
	) {
		// eslint-disable-next-line security/detect-object-injection
		return baseline.testSpecificBaselines[testName].duration;
	}

	return undefined;
};

export const expectDurationWithinBaseline = (
	actual: number,
	testName: string,
	maxRegression = 0.5,
): void => {
	const baselineDuration = getBaselineDuration(testName);

	if (baselineDuration === undefined) {
		// eslint-disable-next-line security/detect-object-injection
		const fallback = ABSOLUTE_FALLBACKS[testName];

		if (fallback) {
			console.warn(
				`⚠️  No baseline for "${testName}", using fallback threshold: ${fallback}ms`,
			);
			expect(actual).toBeLessThan(fallback);
			return;
		}

		console.warn(
			`⚠️  No baseline or fallback for "${testName}", skipping performance check`,
		);
		return;
	}

	const threshold = baselineDuration * (1 + maxRegression);
	const regression =
		baselineDuration > 0
			? ((actual - baselineDuration) / baselineDuration) * 100
			: 0;

	const message = [
		`\n📊 Performance Check: ${testName}`,
		`   Actual:    ${actual.toFixed(2)}ms`,
		`   Baseline:  ${baselineDuration.toFixed(2)}ms`,
		`   Threshold: ${threshold.toFixed(2)}ms (${(maxRegression * 100).toFixed(0)}% max regression)`,
		`   Change:    ${regression >= 0 ? '+' : ''}${regression.toFixed(1)}%`,
	].join('\n');

	console.log(message);

	expect(actual, message).toBeLessThan(threshold);
};

export const resetBaselineCache = (): void => {
	cachedBaseline = undefined;
};
