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

const RESULTS_FILE = '.bun-test/results.xml';
const BASELINE_FILE = '.performance-baseline.json';

function parseBunTestResults(): PerformanceMetrics | undefined {
	if (!existsSync(RESULTS_FILE)) {
		return undefined;
	}

	try {
		const content = readFileSync(RESULTS_FILE, 'utf8');

		const files = new Map<string, TestFileMetrics>();
		let totalDuration = 0;
		let totalTests = 0;

		const testcasePattern = /<testcase[^>]*>/g;
		let match;

		while ((match = testcasePattern.exec(content)) !== null) {
			const testcaseTag = match[0];

			// Extract classname attribute (Vitest uses classname for file path)
			const fileMatch = /classname="([^"]+)"/.exec(testcaseTag);
			const timeMatch = /time="([^"]+)"/.exec(testcaseTag);

			if (!fileMatch || !timeMatch) continue;

			const filename = fileMatch[1];
			const time = Number.parseFloat(timeMatch[1]) * 1000;

			if (
				!filename.endsWith('.test.ts') &&
				!filename.endsWith('.spec.ts')
			) {
				continue;
			}

			if (files.has(filename)) {
				const existing = files.get(filename)!;
				existing.duration += time;
				existing.testCount += 1;
			} else {
				files.set(filename, {
					name: filename,
					duration: time,
					testCount: 1,
				});
			}

			totalDuration += time;
			totalTests += 1;
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
		console.error('Failed to parse Bun test results:', error);
		return undefined;
	}
}

function convertFilesToMap(
	files: unknown,
): Map<string, TestFileMetrics> | unknown {
	if (!files || files instanceof Map) {
		return files;
	}

	const filesMap = new Map<string, TestFileMetrics>();
	for (const [key, value] of Object.entries(files)) {
		filesMap.set(key, value as TestFileMetrics);
	}
	return filesMap;
}

function loadBaseline(): PerformanceBaseline {
	if (existsSync(BASELINE_FILE)) {
		try {
			const parsed = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));

			parsed.baseline.files = convertFilesToMap(parsed.baseline.files);

			if (parsed.history) {
				for (const historyEntry of parsed.history) {
					historyEntry.files = convertFilesToMap(historyEntry.files);
				}
			}

			return parsed;
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
			files: new Map<string, TestFileMetrics>(),
			timestamp: new Date().toISOString(),
		},
		thresholds: {
			maxRegression: 0.2,
			maxDuration: 5000,
		},
		history: [],
	};
}

function serializeBaseline(baseline: PerformanceBaseline): string {
	const serializable = {
		...baseline,
		baseline: {
			...baseline.baseline,
			files: Object.fromEntries(baseline.baseline.files),
		},
		history: baseline.history?.map((entry) => ({
			...entry,
			files:
				entry.files instanceof Map
					? Object.fromEntries(entry.files)
					: entry.files,
		})),
	};

	return JSON.stringify(serializable, undefined, '\t');
}

function saveBaseline(baseline: PerformanceBaseline): void {
	const serialized = serializeBaseline(baseline);
	writeFileSync(BASELINE_FILE, serialized);
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

	const current = parseBunTestResults();

	if (!current) {
		console.error(
			'No Bun test results found. Run tests first: bun run test:perf',
		);
		throw new Error('Missing Bun test results');
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
		`Total Duration: ${oldBaseline.totalDuration.toFixed(2)}ms → ${current.totalDuration.toFixed(2)}ms`,
	);
	console.log(`Test Count: ${oldBaseline.testCount} → ${current.testCount}`);
	console.log(`Files: ${oldBaseline.fileCount} → ${current.fileCount}`);
	console.log(
		`\nPrevious baselines kept in history: ${currentBaseline.history?.length || 0}/10`,
	);
}

main();
