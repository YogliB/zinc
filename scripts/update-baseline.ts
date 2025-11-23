import { readFileSync, writeFileSync, existsSync } from 'node:fs';

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
		history: [],
	};
}

function saveBaseline(baseline: PerformanceBaseline): void {
	writeFileSync(BASELINE_FILE, JSON.stringify(baseline, undefined, '\t'));
	console.log(`✅ Baseline updated: ${BASELINE_FILE}`);
}

function main() {
	const updateFlag = process.argv.includes('--update-baseline');

	if (!updateFlag) {
		console.error(
			'Usage: bun run scripts/update-baseline.ts --update-baseline',
		);
		console.error(
			'This will overwrite the performance baseline. Use with caution.',
		);
		throw new Error('Missing --update-baseline flag');
	}

	const current = parseVitestResults();

	if (!current) {
		console.error('No Vitest results found. Run tests first with CI=1.');
		throw new Error('Missing Vitest results');
	}

	const currentBaseline = loadBaseline();
	const oldBaseline = { ...currentBaseline.baseline };

	currentBaseline.baseline = current;
	if (!currentBaseline.history) {
		currentBaseline.history = [];
	}
	currentBaseline.history.push(oldBaseline);
	if (currentBaseline.history.length > 10) {
		currentBaseline.history = currentBaseline.history.slice(-10);
	}

	saveBaseline(currentBaseline);

	console.log('\nBaseline Update Summary:');
	console.log(
		`Total Duration: ${oldBaseline.totalDuration}ms → ${current.totalDuration}ms`,
	);
	console.log(`Test Count: ${oldBaseline.testCount} → ${current.testCount}`);
	console.log(`Files: ${oldBaseline.fileCount} → ${current.fileCount}`);
	console.log(
		`\nPrevious baselines kept in history: ${currentBaseline.history?.length || 0}/10`,
	);
}

main();
