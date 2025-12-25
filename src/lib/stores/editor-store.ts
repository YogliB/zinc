import { signal, computed, effect } from '@preact/signals';
import { TreeNode, OpenFile } from '../types';

// Global signals that persist across component remounts
export const folderPath = signal<string | undefined>();
export const treeNodes = signal<TreeNode[]>([]);
export const editorValue = signal<string>('');
export const selectedFilePath = signal<string | undefined>();

// Multi-file state
export const openFiles = signal<OpenFile[]>([]);
export const activeFilePath = signal<string | undefined>();
export const activeFileContent = computed(() => {
	const activePath = activeFilePath.value;
	if (!activePath) return '';
	const file = openFiles.value.find((f) => f.path === activePath);
	return file?.content || '';
});

// Helper functions for state management
export const resetEditorState = () => {
	folderPath.value = undefined;
	treeNodes.value = [];
	editorValue.value = '';
	selectedFilePath.value = undefined;
	openFiles.value = [];
	activeFilePath.value = undefined;
};

export const setProject = (path: string, nodes: TreeNode[]) => {
	folderPath.value = path;
	treeNodes.value = nodes;
	editorValue.value = '';
	selectedFilePath.value = undefined;
};

export const setActiveFile = (path: string, content: string) => {
	selectedFilePath.value = path;
	editorValue.value = content;
};

// Multi-file helper functions
export const addOpenFile = (path: string, name: string, content: string) => {
	if (openFiles.value.some((f) => f.path === path)) {
		setActiveTab(path);
		return;
	}
	openFiles.value = [...openFiles.value, { path, name, content }];
	setActiveTab(path);
	console.log(`File opened: ${name}`);
};

export const removeOpenFile = (path: string) => {
	const index = openFiles.value.findIndex((f) => f.path === path);
	if (index === -1) return;
	const wasActive = activeFilePath.value === path;
	openFiles.value = openFiles.value.filter((f) => f.path !== path);
	if (wasActive && openFiles.value.length > 0) {
		const nextIndex = Math.min(index, openFiles.value.length - 1);
		setActiveTab(openFiles.value[nextIndex].path);
	} else if (openFiles.value.length === 0) {
		activeFilePath.value = undefined;
	}
	console.log(`File closed: ${path}`);
};

export const setActiveTab = (path: string) => {
	activeFilePath.value = path;
	console.log(`Switched to tab: ${path}`);
};

// Effects to keep backward compatibility
effect(() => {
	selectedFilePath.value = activeFilePath.value;
});

effect(() => {
	editorValue.value = activeFileContent.value;
});
