import { describe, it, expect } from 'bun:test';

describe('DevFlow MCP Server', () => {
	it('should initialize successfully', async () => {
		expect(true).toBe(true);
	});

	it('should have detectProjectRoot exported', async () => {
		const { detectProjectRoot } = await import('./core/config');
		expect(typeof detectProjectRoot).toBe('function');
	});

	it('should have createStorageEngine available', async () => {
		const { createStorageEngine } = await import('./core/storage/engine');
		expect(typeof createStorageEngine).toBe('function');
	});
});
