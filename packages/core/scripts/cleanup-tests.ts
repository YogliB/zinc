#!/usr/bin/env bun

import { rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const TEST_DIRECTORIES = [
	'.test-storage',
	'.test-memory-repo',
	'.test-integration',
	'.test-config',
	'.test-helpers',
	'.test-typescript-plugin',
	'.test-analysis-engine-integration',
	'.bench-project',
	'.bun-test',
];

const TEST_FILES = ['.performance-baseline.json'];

console.log('🧹 Cleaning up test artifacts...\n');

let removedCount = 0;

for (const directory of TEST_DIRECTORIES) {
	const directoryPath = path.resolve(directory);
	if (existsSync(directoryPath)) {
		try {
			await rm(directoryPath, { recursive: true, force: true });
			console.log(`✓ Removed ${directory}`);
			removedCount++;
		} catch (error) {
			console.error(`✗ Failed to remove ${directory}:`, error);
		}
	}
}

for (const file of TEST_FILES) {
	const filePath = path.resolve(file);
	if (existsSync(filePath)) {
		try {
			await rm(filePath, { force: true });
			console.log(`✓ Removed ${file}`);
			removedCount++;
		} catch (error) {
			console.error(`✗ Failed to remove ${file}:`, error);
		}
	}
}

if (removedCount === 0) {
	console.log('✨ No test artifacts found - already clean!');
} else {
	console.log(`\n✨ Cleanup complete! Removed ${removedCount} item(s).`);
}
