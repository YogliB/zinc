<script lang="ts">
	import { Accordion, AccordionItem } from 'flowbite-svelte';
	import { FolderOutline, FileOutline } from 'flowbite-svelte-icons';
	import FileTree from './FileTree.svelte';

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
</script>

<div class="file-tree space-y-1">
	{#each nodes as node (node.path)}
		{#if node.type === 'folder'}
			<Accordion class="border-0">
				<AccordionItem class="border-0">
					{#snippet header()}
						<div class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
							<FolderOutline class="w-4 h-4 text-blue-500" />
							<span class="text-sm">{node.name}</span>
						</div>
					{/snippet}
					<div class="ml-4">
						{#if node.children && node.children.length > 0}
							<FileTree nodes={node.children} {onSelect} />
						{/if}
					</div>
				</AccordionItem>
			</Accordion>
		{:else}
			<div class="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded" role="button" tabindex="0" onclick={() => onSelect(node.path)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(node.path); }}>
				<FileOutline class="w-4 h-4 text-gray-500" />
				<span class="text-sm">{node.name}</span>
			</div>
		{/if}
	{/each}
</div>
