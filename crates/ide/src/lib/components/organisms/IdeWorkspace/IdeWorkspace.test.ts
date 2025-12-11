import { describe, it, expect, vi } from 'vitest';
import { mount, unmount } from 'svelte';

import IdeWorkspace from './IdeWorkspace.svelte';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface FileNode {
	name: string;
	type: 'file' | 'folder';
	children?: FileNode[];
	path: string;
}

describe('IdeWorkspace', () => {
	it('renders with provided props', () => {
		const folderNodes: FileNode[] = [
			{ name: 'test.txt', type: 'file', path: '/test.txt' },
		];
		const messages: Message[] = [{ role: 'user', content: 'Hello' }];
		const userInput = 'input';
		const settings = { apiKey: 'key', model: 'model', aiEnabled: true };
		const code = 'code';
		const onSelect = vi.fn();
		const onOpenFolder = vi.fn();
		const openFile = vi.fn();
		const saveFile = vi.fn();
		const sendMessage = vi.fn();
		const loadSettings = vi.fn();
		const saveSettings = vi.fn();

		const container = document.createElement('div');
		document.body.appendChild(container);

		const component = mount(IdeWorkspace, {
			target: container,
			props: {
				folderNodes,
				messages,
				userInput,
				settings,
				code,
				onSelect,
				onOpenFolder,
				openFile,
				saveFile,
				sendMessage,
				loadSettings,
				saveSettings,
			},
		});

		// Check that the component renders
		expect(container.innerHTML).toBeTruthy();

		unmount(component);
		document.body.removeChild(container);
	});
});
