import { signal } from '@preact/signals';
import { TreeNode } from '../types';

// Global signals that persist across component remounts
export const folderPath = signal<string | undefined>();
export const treeNodes = signal<TreeNode[]>([]);
export const editorValue = signal<string>('');
export const selectedFilePath = signal<string | undefined>();

// Helper functions for state management
export const resetEditorState = () => {
	folderPath.value = undefined;
	treeNodes.value = [];
	editorValue.value = '';
	selectedFilePath.value = undefined;
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
