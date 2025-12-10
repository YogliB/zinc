<script lang="ts">
	import SvelteCodeMirror from 'svelte-codemirror-editor';
	import { basicSetup } from '@codemirror/basic-setup';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { Button } from '$lib/components/atoms';

	interface Props {
		code: string;
		openFile: () => void;
		saveFile: () => void;
	}

	let { code = $bindable(''), openFile, saveFile }: Props = $props();

	let extensions = [basicSetup, javascript(), oneDark];
</script>

<div class="bg-white border-b p-2 flex gap-2">
	<Button onclick={openFile} class="px-4 py-2 bg-blue-500 text-white rounded"
		>Open File</Button
	>
	<Button onclick={saveFile} class="px-4 py-2 bg-gray-500 text-white rounded"
		>Save File</Button
	>
</div>
<div class="flex-1">
	<SvelteCodeMirror bind:value={code} {extensions} class="h-full" />
</div>

<style>
	:global(.cm-editor) {
		height: 100%;
	}
</style>
