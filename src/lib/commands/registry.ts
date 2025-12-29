import { invoke } from '@tauri-apps/api/core';
import { appMode } from '../stores/modes';
import {
	resetEditorState,
	removeOpenFile,
	activeFilePath,
	openFiles,
	setActiveTab,
} from '../stores/editor-store';

export interface Command {
	id: string;
	title: string;
	category: string;
	action: () => void | Promise<void>;
	keywords?: string[];
	shortcut?: string;
	context?: ('welcome' | 'editor')[];
}

export const commands: Command[] = [
	{
		id: 'open-folder',
		title: 'Open Folder',
		category: 'File',
		action: async () => {
			try {
				const result = await invoke('open_folder');
				if (result) {
					appMode.value = 'editor';
				}
			} catch (error) {
				console.error('Failed to open folder:', error);
			}
		},
		keywords: ['open', 'folder', 'directory'],
		context: ['welcome', 'editor'],
	},
	{
		id: 'close-active-tab',
		title: 'Close Active Tab',
		category: 'Editor',
		action: () => {
			const active = activeFilePath.value;
			if (active) {
				removeOpenFile(active);
			}
		},
		keywords: ['close', 'tab', 'file'],
		context: ['editor'],
	},
	{
		id: 'close-all-tabs',
		title: 'Close All Tabs',
		category: 'Editor',
		action: () => {
			for (const file of openFiles.value) removeOpenFile(file.path);
		},
		keywords: ['close', 'all', 'tabs', 'files'],
		context: ['editor'],
	},
	{
		id: 'go-to-welcome',
		title: 'Go to Welcome Page',
		category: 'Navigation',
		action: () => {
			resetEditorState();
			appMode.value = 'welcome';
			globalThis.history.pushState(undefined, '', '/');
		},
		keywords: ['welcome', 'home', 'start'],
		context: ['editor'],
	},
	{
		id: 'go-to-editor',
		title: 'Go to Editor',
		category: 'Navigation',
		action: () => {
			appMode.value = 'editor';
			globalThis.history.pushState(undefined, '', '/editor');
		},
		keywords: ['editor', 'code'],
		context: ['welcome'],
	},
	{
		id: 'next-tab',
		title: 'Next Tab',
		category: 'Editor',
		action: () => {
			const files = openFiles.value;
			if (files.length < 2) return;
			const currentIndex = files.findIndex(
				(f) => f.path === activeFilePath.value,
			);
			const nextIndex = (currentIndex + 1) % files.length;
			setActiveTab(files[nextIndex].path);
		},
		keywords: ['next', 'tab'],
		context: ['editor'],
	},
	{
		id: 'previous-tab',
		title: 'Previous Tab',
		category: 'Editor',
		action: () => {
			const files = openFiles.value;
			if (files.length < 2) return;
			const currentIndex = files.findIndex(
				(f) => f.path === activeFilePath.value,
			);
			const previousIndex =
				currentIndex === 0 ? files.length - 1 : currentIndex - 1;
			setActiveTab(files[previousIndex].path);
		},
		keywords: ['previous', 'tab'],
		context: ['editor'],
	},
];

export const getCommandsForContext = (
	context: 'welcome' | 'editor',
): Command[] => {
	return commands.filter(
		(cmd) => !cmd.context || cmd.context.includes(context),
	);
};
