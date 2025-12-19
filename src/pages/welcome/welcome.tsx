import { Button } from '../../components/atoms';
import { FolderOpen } from 'lucide-react';
import { Kbd } from '../../components/ui/kbd';
import { useSignal } from '@preact/signals';
import { useGroupRef, usePanelRef } from 'react-resizable-panels';

import { invoke } from '@tauri-apps/api/core';
import { FileTree, CodeEditor } from '../../components/organisms';
import { TreeNode } from '../../lib/types';
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from '../../components/ui/resizable';

import { useEffect } from 'preact/hooks';

interface WelcomePageProperties {
	os: 'mac' | 'windows' | 'linux';
}

export function WelcomePage({ os }: WelcomePageProperties) {
	const folderPath = useSignal<string | undefined>();
	const treeNodes = useSignal<TreeNode[]>([]);
	const editorValue = useSignal<string>('');

	const groupReference = useGroupRef();
	const fileTreeReference = usePanelRef();
	const codeEditorReference = usePanelRef();

	useEffect(() => {
		if (
			fileTreeReference.current &&
			codeEditorReference.current &&
			groupReference.current
		)
			fileTreeReference.current?.resize(50);
		codeEditorReference.current?.resize(50);
		groupReference.current?.setLayout({
			'file-tree': 50,
		});
	}, [fileTreeReference, codeEditorReference, groupReference]);

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
			<ResizablePanelGroup orientation="horizontal" className="h-screen">
				<ResizablePanel id="file-tree" defaultSize={30}>
					<div className="h-full overflow-auto p-4">
						<FileTree
							nodes={treeNodes.value}
							onExpand={onExpand}
							onSelect={handleSelect}
						/>
					</div>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel id="code-editor" defaultSize={70}>
					<div className="flex h-full">
						<CodeEditor
							value={editorValue.value}
							onChange={(value) => (editorValue.value = value)}
						/>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>
		);
	}

	return (
		<div className="bg-background flex min-h-screen flex-col items-center justify-center">
			<div className="space-y-8 text-center">
				<h1 className="text-foreground text-4xl font-bold">
					Welcome to Zinc IDE
				</h1>
				<p className="text-muted-foreground text-lg">
					Start coding with a powerful, functional IDE built for
					developers.
				</p>
				<div className="space-y-4">
					<Button
						onClick={handleOpenProject}
						size="lg"
						className="w-48"
					>
						<FolderOpen className="mr-2 h-4 w-4" />
						Open Project
					</Button>
				</div>
				<p className="text-muted-foreground text-sm">
					Tip: Press{' '}
					{os === 'mac' ? (
						<>
							<Kbd>⌘</Kbd> <Kbd>O</Kbd>
						</>
					) : (
						<>
							<Kbd>Ctrl</Kbd> <Kbd>O</Kbd>
						</>
					)}{' '}
					to open a project.
				</p>
			</div>
		</div>
	);
}
