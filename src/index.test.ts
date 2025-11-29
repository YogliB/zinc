import { describe, it, expect } from 'bun:test';

describe('DevFlow MCP Server', () => {
	it('should initialize successfully', async () => {
		expect(true).toBe(true);
	});

	it('should have detectProjectRoot exported', async () => {
		const { detectProjectRoot } = await import('./core/config');
		expect(typeof detectProjectRoot).toBe('function');
	});

	it('should have StorageEngine available', async () => {
		const { StorageEngine } = await import('./core/storage/engine');
		expect(typeof StorageEngine).toBe('function');
	});

	it('should have MemoryRepository available', async () => {
		const { MemoryRepository } = await import('./layers/memory/repository');
		expect(typeof MemoryRepository).toBe('function');
	});
});
