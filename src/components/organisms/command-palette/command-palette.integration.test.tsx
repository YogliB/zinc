import { render, screen, fireEvent } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CommandPalette } from './command-palette';
import { getCommandsForContext } from '../../../lib/commands/registry';
import { appMode } from '../../../lib/stores/modes';
import { isCommandPaletteOpen } from '../../../lib/stores/command-palette';

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
	invoke: vi.fn().mockResolvedValue('/mock/path'),
}));

describe('CommandPalette Integration', () => {
	beforeEach(() => {
		appMode.value = 'welcome';
		isCommandPaletteOpen.value = false;
	});

	it('opens palette and executes command', async () => {
		const commands = getCommandsForContext('welcome');
		const mockOnClose = vi.fn();
		const mockAction = vi.fn();

		const testCommands = commands.map((cmd) => ({
			id: cmd.id,
			title: cmd.title,
			action: cmd.id === 'open-folder' ? mockAction : cmd.action,
			keywords: cmd.keywords,
			category: cmd.category,
		}));

		render(
			<CommandPalette
				isOpen={true}
				onClose={mockOnClose}
				commands={testCommands}
			/>,
		);

		// Find and click a command
		const openFolderButton = screen.getByText('Open Folder');
		fireEvent.click(openFolderButton);

		// Verify command action and onClose were called
		expect(mockAction).toHaveBeenCalled();
		expect(mockOnClose).toHaveBeenCalled();
	});

	it('filters commands based on context', () => {
		appMode.value = 'editor';
		const editorCommands = getCommandsForContext('editor');
		const welcomeCommands = getCommandsForContext('welcome');

		expect(editorCommands.length).toBeGreaterThan(welcomeCommands.length);
		expect(
			editorCommands.some((cmd) => cmd.id === 'close-active-tab'),
		).toBe(true);
		expect(
			welcomeCommands.some((cmd) => cmd.id === 'close-active-tab'),
		).toBe(false);
	});
});
