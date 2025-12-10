<script lang="ts">
	import { FolderOutline, FileOutline } from 'flowbite-svelte-icons';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import Self from './FileTree.svelte';

	// Virtualized file tree for performance with large directories

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
	let processedNodes: FileNode[] = $derived(
		nodes
			.filter((node) => node.name !== '.git')
			.sort((a, b) => (a.type === 'folder' ? -1 : 1)),
	);
</script>

<div class="file-tree" style="height: 400px;">
	<SvelteVirtualList items={processedNodes} debug>
		{#snippet renderItem(node)}
			{#if node.type === 'folder'}
				<details>
					<summary
						class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer list-none"
					>
						<FolderOutline class="w-4 h-4 text-blue-500" />
						<span class="text-sm">{node.name}</span>
					</summary>
					<div class="ml-4">
						{#if node.children && node.children.length > 0}
							<Self nodes={node.children} {onSelect} />
						{/if}
					</div>
				</details>
			{:else}
				<div
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
					<span class="text-sm">{node.name}</span>
				</div>
			{/if}
		{/snippet}
	</SvelteVirtualList>
</div>
