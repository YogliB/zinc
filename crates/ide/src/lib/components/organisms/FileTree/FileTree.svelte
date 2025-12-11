<script lang="ts">
	import { FolderOutline, FileOutline } from 'flowbite-svelte-icons';
	import Self from './FileTree.svelte';

	interface FileNode {
		name: string;
		type: 'file' | 'folder';
		children?: FileNode[];
		path: string;
	}

	interface Props {
		nodes: FileNode[];
		onSelect: (path: string) => void;
	}

	let { nodes, onSelect }: Props = $props();
	let openFolders = $state<Record<string, boolean>>({});
	let processedNodes: FileNode[] = $derived(
		nodes
			?.filter((node) => node.name !== '.git')
			.sort((a, b) => {
				if (a.type !== b.type) {
					return a.type === 'folder' ? -1 : 1;
				}
				return a.name.localeCompare(b.name);
			}) || [],
	);
</script>

<div class="h-full">
	{#each processedNodes as node}
		{#if node.type === 'folder'}
			<div
				data-testid={`file-tree-folder-${node.name}`}
				class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
				role="button"
				tabindex="0"
				onclick={() => {
					openFolders[node.path] = !openFolders[node.path];
				}}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						openFolders[node.path] = !openFolders[node.path];
					}
				}}
			>
				<FolderOutline class="w-4 h-4 text-blue-500" />
				<span class="text-sm" data-testid="file-tree-item-name">{node.name}</span>
			</div>
			{#if openFolders[node.path]}
				<div class="ml-4">
					{#if node.children && node.children.length > 0}
						<Self nodes={node.children} {onSelect} />
					{/if}
				</div>
			{/if}
		{:else}
			<div
				data-testid={`file-tree-file-${node.name}`}
				class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
				role="button"
				tabindex="0"
				onclick={() => onSelect(node.path)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') onSelect(node.path);
				}}
			>
				<FileOutline class="w-4 h-4 text-gray-500" />
				<span class="text-sm" data-testid="file-tree-item-name"
					>{node.name}</span
				>
			</div>
		{/if}
	{/each}
</div>
