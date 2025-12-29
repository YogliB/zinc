import { describe, it, expect, vi, beforeEach } from 'vitest';
import { commands, getCommandsForContext } from './registry';
import { appMode } from '../stores/modes';
import { activeFilePath, openFiles } from '../stores/editor-store';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn(),
}));

describe('Command Registry', () => {
	beforeEach(() => {
		// Reset signals
		appMode.value = 'welcome';
		activeFilePath.value = undefined;
		openFiles.value = [];
	});

	it('should have at least 5 commands', () => {
		expect(commands.length).toBeGreaterThanOrEqual(5);
	});

	it('should have unique command IDs', () => {
		const ids = commands.map((cmd) => cmd.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});

	it('should categorize commands properly', () => {
		const categories = commands.map((cmd) => cmd.category);
		expect(categories).toContain('File');
		expect(categories).toContain('Editor');
		expect(categories).toContain('Navigation');
	});

	it('should filter commands by context', () => {
		const welcomeCommands = getCommandsForContext('welcome');
		const editorCommands = getCommandsForContext('editor');

		expect(welcomeCommands.some((cmd) => cmd.id === 'open-folder')).toBe(
			true,
		);
		expect(welcomeCommands.some((cmd) => cmd.id === 'go-to-editor')).toBe(
			true,
		);
		expect(
			welcomeCommands.some((cmd) => cmd.id === 'close-active-tab'),
		).toBe(false);

		expect(
			editorCommands.some((cmd) => cmd.id === 'close-active-tab'),
		).toBe(true);
		expect(editorCommands.some((cmd) => cmd.id === 'go-to-welcome')).toBe(
			true,
		);
		expect(editorCommands.some((cmd) => cmd.id === 'go-to-editor')).toBe(
			false,
		);
	});

	it('should include keywords for better searchability', () => {
		const commandWithKeywords = commands.find((cmd) => cmd.keywords);
		expect(commandWithKeywords).toBeDefined();
		expect(commandWithKeywords?.keywords).toBeInstanceOf(Array);
	});
});
