import { useSignal } from '@preact/signals';
import { invoke } from '@tauri-apps/api/core';
import { TreeNode } from '../../lib/types';
import { WelcomeScreen, EditorView } from '../../components/templates';

interface WelcomePageProperties {
	os: 'mac' | 'windows' | 'linux';
}

export function WelcomePage({ os }: WelcomePageProperties) {
	const folderPath = useSignal<string | undefined>();
	const treeNodes = useSignal<TreeNode[]>([]);
	const editorValue = useSignal<string>('');
	const selectedFilePath = useSignal<string | undefined>();

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

	const loadFile = async (path: string) => {
		try {
			const content = await invoke<string>('read_file', { path });
			editorValue.value = content;
			selectedFilePath.value = path;
		} catch (error) {
			console.error('Failed to load file:', error);
		}
	};

	const handleSelect = (node: TreeNode) => {
		if (node.type === 'file' && node.path) {
			loadFile(node.path);
		}
	};

	const handleOpenProject = async () => {
		try {
			const selected = await invoke('open_folder');
			if (selected) {
				const selectedPath = selected as string;
				folderPath.value = selectedPath;
				const entries: {
					name: string;
					is_dir: boolean;
					path: string;
				}[] = await invoke('list_directory', {
					path: selectedPath,
				});
				const nodes: TreeNode[] = entries.map((entry) => ({
					name: entry.name,
					type: entry.is_dir ? 'folder' : 'file',
					path: entry.path,
					children: entry.is_dir ? [] : undefined,
				}));
				treeNodes.value = nodes;
			}
		} catch (error) {
			console.error('Failed to open folder:', error);
		}
	};

	if (folderPath.value) {
		return (
			<EditorView
				treeNodes={treeNodes.value}
				editorValue={editorValue.value}
				onExpand={onExpand}
				onSelect={handleSelect}
				onEditorChange={(value) => (editorValue.value = value)}
			/>
		);
	}

	return <WelcomeScreen os={os} onOpenProject={handleOpenProject} />;
}
