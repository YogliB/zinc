<script lang="ts">
	import SvelteCodeMirror from 'svelte-codemirror-editor';
	import { basicSetup } from '@codemirror/basic-setup';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';

	interface Props {
		code: string;
		openFile: () => void;
		saveFile: () => void;
	}

	let { code = $bindable(''), openFile, saveFile }: Props = $props();

	let extensions = [basicSetup, javascript(), oneDark];
</script>

<SvelteCodeMirror bind:value={code} {extensions} class="h-full" />

<style>
	:global(.cm-editor) {
		height: 100%;
	}
</style>
