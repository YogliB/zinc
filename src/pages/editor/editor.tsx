import { invoke } from '@tauri-apps/api/core';
import { TreeNode } from '../../lib/types';
import { EditorView } from '../../components/templates';
import { useDebounce } from '../../lib/hooks/use-debounce';
import { useSearch } from 'wouter-preact';

import {
	folderPath,
	treeNodes,
	editorValue,
	selectedFilePath,
	setProject,
	setActiveFile,
} from '../../lib/stores/editor-store';

export function EditorPage() {
	const search = useSearch();
	const urlParameters = new URLSearchParams(search);
	const projectPath = urlParameters.get('path');

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const loadFile = async (path: string) => {
		try {
			const content = await invoke<string>('read_file', { path });
			setActiveFile(path, content);
		} catch (error) {
			console.error('Failed to load file:', error);
		}
	};

	const handleSelect = (node: TreeNode) => {
		if (node.type === 'file' && node.path) {
			loadFile(node.path);
		}
	};

	if (projectPath && !folderPath.value) {
		const initializeProject = async () => {
			try {
				const entries: {
					name: string;
					is_dir: boolean;
					path: string;
				}[] = await invoke('list_directory', { path: projectPath });
				const children: TreeNode[] = entries.map((entry) => ({
					name: entry.name,
					type: entry.is_dir ? 'folder' : 'file',
					path: entry.path,
					children: entry.is_dir ? [] : undefined,
				}));
				setProject(projectPath, children);
			} catch (error) {
				console.error('Failed to initialize project:', error);
			}
		};
		initializeProject();
	}

	const onExpand = async (node: TreeNode) => {
		if (node.children && node.children.length > 0) return;
		try {
			const entries: {
				name: string;
				is_dir: boolean;
				path: string;
			}[] = await invoke('list_directory', { path: node.path });
			const children: TreeNode[] = entries.map((entry) => ({
				name: entry.name,
				type: entry.is_dir ? 'folder' : 'file',
				path: entry.path,
				children: entry.is_dir ? [] : undefined,
			}));
			node.children = children;
			treeNodes.value = [...treeNodes.value];
		} catch (error) {
			console.error('Failed to load folder contents:', error);
		}
	};

	const debouncedSave = useDebounce(async () => {
		if (selectedFilePath.value) {
			try {
				await invoke('write_file', {
					path: selectedFilePath.value,
					content: editorValue.value,
				});
				console.log('File auto-saved:', selectedFilePath.value);
			} catch (error) {
				console.error('Failed to auto-save file:', error);
			}
		}
	}, 1000);

	const handleEditorChange = (value: string) => {
		editorValue.value = value;
		debouncedSave();
	};

	return (
		<EditorView
			treeNodes={treeNodes.value}
			editorValue={editorValue.value}
			onExpand={onExpand}
			onSelect={handleSelect}
			onEditorChange={handleEditorChange}
		/>
	);
}
