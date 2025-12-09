<script lang="ts">
	import SvelteCodeMirror from 'svelte-codemirror-editor';
	import { basicSetup } from '@codemirror/basic-setup';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { Button } from '../atoms';
	import { ButtonGroup } from '../molecules';

	interface Props {
		code: string;
		openFile: () => void;
		saveFile: () => void;
	}

	let { code = $bindable(''), openFile, saveFile }: Props = $props();

	let extensions = [basicSetup, javascript(), oneDark];
</script>

<div class="bg-white border-b p-2 flex gap-2">
	<Button onclick={openFile}>Open File</Button>
	<Button variant="secondary" onclick={saveFile}>Save File</Button>
</div>
<div class="flex-1">
	<SvelteCodeMirror bind:value={code} {extensions} class="h-full" />
</div>
