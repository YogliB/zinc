import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
	loadPerformanceBaseline,
	getBaselineDuration,
	expectDurationWithinBaseline,
	resetBaselineCache,
} from './performance-baseline';

vi.mock('node:fs');

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

describe('performance-baseline utilities', () => {
	beforeEach(() => {
		resetBaselineCache();
		vi.clearAllMocks();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('loadPerformanceBaseline', () => {
		it('should load valid baseline file', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'test-1': {
						name: 'test-1',
						duration: 100,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			const result = loadPerformanceBaseline();

			expect(result).toEqual(mockBaseline);
			expect(mockExistsSync).toHaveBeenCalledWith(
				'.bun-performance.json',
			);
			expect(mockReadFileSync).toHaveBeenCalledWith(
				'.bun-performance.json',
				'utf8',
			);
		});

		it('should return null when baseline file does not exist', () => {
			mockExistsSync.mockReturnValue(false);

			const result = loadPerformanceBaseline();

			expect(result).toBeUndefined();
			expect(console.warn).toHaveBeenCalledWith(
				'⚠️  Performance baseline file not found: .bun-performance.json',
			);
		});

		it('should return null when baseline file is corrupted', () => {
			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue('invalid json{');

			const result = loadPerformanceBaseline();

			expect(result).toBeUndefined();
			expect(console.error).toHaveBeenCalledWith(
				expect.stringContaining('Failed to load performance baseline'),
			);
		});

		it('should warn when baseline is stale (>30 days)', () => {
			const oldDate = new Date();
			oldDate.setDate(oldDate.getDate() - 35);

			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: oldDate.toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			loadPerformanceBaseline();

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining(
					'Performance baseline is stale (35 days old)',
				),
			);
		});

		it('should cache baseline after first load', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			loadPerformanceBaseline();
			loadPerformanceBaseline();

			expect(mockReadFileSync).toHaveBeenCalledTimes(1);
		});
	});

	describe('getBaselineDuration', () => {
		it('should return duration for test with specific baseline', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'my-test': {
						name: 'my-test',
						duration: 250,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			const duration = getBaselineDuration('my-test');

			expect(duration).toBe(250);
		});

		it('should return null when test has no specific baseline', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			const duration = getBaselineDuration('nonexistent-test');

			expect(duration).toBeUndefined();
		});

		it('should return null when baseline file does not exist', () => {
			mockExistsSync.mockReturnValue(false);

			const duration = getBaselineDuration('my-test');

			expect(duration).toBeUndefined();
		});
	});

	describe('expectDurationWithinBaseline', () => {
		it('should pass when duration is within baseline threshold', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'my-test': {
						name: 'my-test',
						duration: 200,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			expect(() => {
				expectDurationWithinBaseline(250, 'my-test', 0.5);
			}).not.toThrow();

			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Performance Check: my-test'),
			);
		});

		it('should fail when duration exceeds baseline threshold', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'my-test': {
						name: 'my-test',
						duration: 200,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			expect(() => {
				expectDurationWithinBaseline(400, 'my-test', 0.5);
			}).toThrow();
		});

		it('should use fallback threshold when no baseline exists', () => {
			mockExistsSync.mockReturnValue(false);

			expect(() => {
				expectDurationWithinBaseline(
					450,
					'analysis-engine-lazy-loading.preloaded-file-analysis',
				);
			}).not.toThrow();

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('using fallback threshold: 500ms'),
			);
		});

		it('should fail with fallback when duration exceeds fallback threshold', () => {
			mockExistsSync.mockReturnValue(false);

			expect(() => {
				expectDurationWithinBaseline(
					600,
					'analysis-engine-lazy-loading.preloaded-file-analysis',
				);
			}).toThrow();
		});

		it('should skip check when no baseline and no fallback exists', () => {
			mockExistsSync.mockReturnValue(false);

			expect(() => {
				expectDurationWithinBaseline(1000, 'unknown-test');
			}).not.toThrow();

			expect(console.warn).toHaveBeenCalledWith(
				expect.stringContaining('skipping performance check'),
			);
		});

		it('should use custom maxRegression parameter', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'my-test': {
						name: 'my-test',
						duration: 100,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			expect(() => {
				expectDurationWithinBaseline(110, 'my-test', 0.2);
			}).not.toThrow();

			expect(() => {
				expectDurationWithinBaseline(130, 'my-test', 0.2);
			}).toThrow();
		});

		it('should log performance metrics in assertion message', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
				testSpecificBaselines: {
					'my-test': {
						name: 'my-test',
						duration: 200,
						timestamp: new Date().toISOString(),
					},
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			expectDurationWithinBaseline(220, 'my-test', 0.5);

			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Actual:    220.00ms'),
			);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Baseline:  200.00ms'),
			);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Threshold: 300.00ms'),
			);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining('Change:    +10.0%'),
			);
		});
	});

	describe('resetBaselineCache', () => {
		it('should clear cached baseline', () => {
			const mockBaseline = {
				baseline: {
					totalDuration: 7226.009_132,
					testCount: 160,
					fileCount: 22,
					avgPerTest: 45.16,
					files: {},
					timestamp: new Date().toISOString(),
				},
				thresholds: {
					maxRegression: 0.2,
					maxDuration: 10_000,
				},
			};

			mockExistsSync.mockReturnValue(true);
			mockReadFileSync.mockReturnValue(JSON.stringify(mockBaseline));

			loadPerformanceBaseline();
			expect(mockReadFileSync).toHaveBeenCalledTimes(1);

			resetBaselineCache();

			loadPerformanceBaseline();
			expect(mockReadFileSync).toHaveBeenCalledTimes(2);
		});
	});
});
