<script lang="ts">
	import { Button } from '$lib/components/atoms';
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';

	interface Props {
		onOpenFolder: () => void;
		onOpenFile: () => void;
		version: string;
	}

	let { onOpenFolder, onOpenFile, version }: Props = $props();

	let shortcutText = $state('');

	onMount(async () => {
		const os = await invoke('get_os');
		const isMac = os === 'macos';
		if (isMac) {
			shortcutText = 'Tip: Use Cmd+O to open a folder or Cmd+Shift+O to open a file quickly.';
		} else {
			shortcutText = 'Tip: Use Ctrl+O to open a folder or Ctrl+Shift+O to open a file quickly.';
		}
	});
</script>

<div class="flex flex-col items-center justify-center h-screen">
	<div class="text-6xl mb-4">🚀</div>
	<h1 class="text-2xl mb-2">Welcome to Zinc IDE</h1>
	<p class="text-gray-600 mb-4">{version}</p>
	<div class="flex gap-4">
		<Button onclick={onOpenFolder}>Open Folder</Button>
		<Button onclick={onOpenFile}>Open File</Button>
	</div>
	<p class="text-sm text-gray-500 mt-4">{shortcutText}</p>
</div>
