<script lang="ts">
	import { FolderOutline, FileOutline } from 'flowbite-svelte-icons';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
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
	let openFolders = $state(new Set<string>());
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

<div style:height="100%">
	<SvelteVirtualList items={processedNodes}>
		{#snippet renderItem(node)}
			{#if node.type === 'folder'}
				<details
					data-testid={`file-tree-folder-${node.name}`}
					open={openFolders.has(node.path)}
				>
					<summary
						class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer list-none"
						onclick={(e) => {
							e.preventDefault();
							if (openFolders.has(node.path)) {
								openFolders.delete(node.path);
							} else {
								openFolders.add(node.path);
							}
						}}
					>
						<FolderOutline class="w-4 h-4 text-blue-500" />
						<span class="text-sm" data-testid="file-tree-item-name"
							>{node.name}</span
						>
					</summary>
					<div class="ml-4">
						{#if node.children && node.children.length > 0 && openFolders.has(node.path)}
							<Self nodes={node.children} {onSelect} />
						{/if}
					</div>
				</details>
			{:else}
				<div
					data-testid={`file-tree-file-${node.name}`}
					class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded"
					role="button"
					tabindex="0"
					onclick={() => onSelect(node.path)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ')
							onSelect(node.path);
					}}
				>
					<FileOutline class="w-4 h-4 text-gray-500" />
					<span class="text-sm" data-testid="file-tree-item-name"
						>{node.name}</span
					>
				</div>
			{/if}
		{/snippet}
	</SvelteVirtualList>
</div>
