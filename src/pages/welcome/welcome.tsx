import { Button } from '../../components/atoms';
import { FolderOpen } from 'lucide-react';
import { Kbd } from '../../components/ui/kbd';
import { useSignal } from '@preact/signals';

import { invoke } from '@tauri-apps/api/core';
import { FileTree } from '../../components/organisms';
import { TreeNode } from '../../lib/types';

interface WelcomePageProperties {
	os: 'mac' | 'windows' | 'linux';
}

export function WelcomePage({ os }: WelcomePageProperties) {
	const folderPath = useSignal<string | undefined>();
	const treeNodes = useSignal<TreeNode[]>([]);

	const handleOpenProject = async () => {
		try {
			const selected = await invoke('open_folder');
			if (selected) {
				folderPath.value = (selected as string | null) || undefined;
				const entries: {
					name: string;
					is_dir: boolean;
					path: string;
				}[] = await invoke('list_directory', {
					path: selected as string,
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
			<div className="p-4">
				<FileTree nodes={treeNodes.value} />
			</div>
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
