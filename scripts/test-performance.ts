import { readFileSync, existsSync } from 'node:fs';

interface TestFileMetrics {
	name: string;
	duration: number;
	testCount: number;
}

interface PerformanceMetrics {
	totalDuration: number;
	testCount: number;
	fileCount: number;
	avgPerTest: number;
	files: Map<string, TestFileMetrics>;
	timestamp: string;
}

interface PerformanceBaseline {
	baseline: PerformanceMetrics;
	thresholds: {
		maxRegression: number;
		maxDuration: number;
	};
	history?: PerformanceMetrics[];
}

const RESULTS_FILE = '.vitest/results.json';
const BASELINE_FILE = '.vitest-performance.json';

function parseVitestResults(): PerformanceMetrics | undefined {
	if (!existsSync(RESULTS_FILE)) {
		return undefined;
	}

	try {
		const content = readFileSync(RESULTS_FILE, 'utf8');
		const results = JSON.parse(content);

		const files = new Map<string, TestFileMetrics>();
		let totalDuration = 0;
		let totalTests = 0;

		if (results.testResults) {
			for (const result of results.testResults) {
				const filename = String(result.name);
				const duration =
					result.perfStats?.end - result.perfStats?.start || 0;
				const testCount =
					result.numPassingTests + (result.numFailingTests || 0);

				files.set(filename, {
					name: filename,
					duration,
					testCount,
				});

				totalDuration += duration;
				totalTests += testCount;
			}
		}

		return {
			totalDuration,
			testCount: totalTests,
			fileCount: files.size,
			avgPerTest: totalTests > 0 ? totalDuration / totalTests : 0,
			files,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error('Failed to parse Vitest results:', error);
		return undefined;
	}
}

function loadBaseline(): PerformanceBaseline {
	if (existsSync(BASELINE_FILE)) {
		try {
			return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
		} catch (error) {
			console.error('Failed to parse baseline file:', error);
		}
	}

	return {
		baseline: {
			totalDuration: 0,
			testCount: 0,
			fileCount: 0,
			avgPerTest: 0,
			files: {},
			timestamp: new Date().toISOString(),
		},
		thresholds: {
			maxRegression: 0.2,
			maxDuration: 5000,
		},
	};
}

function calculateRegression(
	current: PerformanceMetrics,
	baseline: PerformanceMetrics,
): number {
	if (baseline.totalDuration === 0) return 0;
	return (
		(current.totalDuration - baseline.totalDuration) /
		baseline.totalDuration
	);
}

function generateReport(
	current: PerformanceMetrics,
	baseline: PerformanceMetrics,
	thresholds: PerformanceBaseline['thresholds'],
): string {
	const regression = calculateRegression(current, baseline);
	const regressionPercent = (regression * 100).toFixed(2);
	const isRegression = regression > thresholds.maxRegression;
	const durationExceeded = current.totalDuration > thresholds.maxDuration;

	let report = '# Test Performance Report\n\n';

	report += '## Summary\n\n';
	report += `| Metric | Current | Baseline | Change |\n`;
	report += `|--------|---------|----------|--------|\n`;
	report += `| Total Duration | ${current.totalDuration}ms | ${baseline.totalDuration}ms | ${regressionPercent}% |\n`;
	report += `| Test Count | ${current.testCount} | ${baseline.testCount} | ${current.testCount - baseline.testCount > 0 ? '+' : ''}${current.testCount - baseline.testCount} |\n`;
	report += `| Avg per Test | ${current.avgPerTest.toFixed(2)}ms | ${baseline.avgPerTest.toFixed(2)}ms | - |\n`;
	report += `| Files | ${current.fileCount} | ${baseline.fileCount} | - |\n\n`;

	if (isRegression) {
		report += `⚠️ **Performance Regression**: ${regressionPercent}% slower than baseline (threshold: ${(thresholds.maxRegression * 100).toFixed(1)}%)\n\n`;
	} else if (regression < 0) {
		report += `✅ **Performance Improvement**: ${Math.abs(Number(regressionPercent))}% faster than baseline\n\n`;
	} else {
		report += `✅ **Performance Stable**: Within threshold\n\n`;
	}

	if (durationExceeded) {
		report += `⚠️ **Duration Warning**: Exceeds max duration (${current.totalDuration}ms > ${thresholds.maxDuration}ms)\n\n`;
	}

	report += '## Per-File Breakdown\n\n';
	report += '| File | Duration | Tests | Status |\n';
	report += '|------|----------|-------|--------|\n';

	for (const [filename, file] of current.files.entries()) {
		const baselineFile = baseline.files.get(filename);
		const fileRegression = baselineFile
			? (file.duration - baselineFile.duration) / baselineFile.duration
			: 0;
		let status: string;
		if (fileRegression > 0.1) {
			status = '⚠️ Slower';
		} else if (fileRegression < -0.1) {
			status = '✨ Faster';
		} else {
			status = '✅ Stable';
		}

		const displayName = file.name.split('/').pop() || file.name;
		report += `| ${displayName} | ${file.duration}ms | ${file.testCount} | ${status} |\n`;
	}

	return report;
}

function main() {
	const current = parseVitestResults();

	if (!current) {
		console.error(
			'No Vitest results found. Make sure CI=1 is set when running tests.',
		);
		throw new Error('Missing Vitest results');
	}

	const baseline = loadBaseline();
	const report = generateReport(
		current,
		baseline.baseline,
		baseline.thresholds,
	);

	console.log(report);

	const regression = calculateRegression(current, baseline.baseline);
	const isRegression = regression > baseline.thresholds.maxRegression;
	const durationExceeded =
		current.totalDuration > baseline.thresholds.maxDuration;

	if (isRegression || durationExceeded) {
		console.error(
			'\n❌ Performance check failed. Please investigate test performance.',
		);
		throw new Error('Performance check failed');
	}

	console.log('\n✅ Performance check passed.');
}

main();
