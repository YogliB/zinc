<script lang="ts">
	import { onMount } from 'svelte';
	import { basicSetup } from '@codemirror/basic-setup';
	import { EditorView } from '@codemirror/view';

	let editorElement: HTMLElement;
	let code = $state(`// Welcome to Zinc IDE
console.log('Hello, world!');

function greet(name: string) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));`);

	onMount(() => {
		const view = new EditorView({
			doc: code,
			extensions: [
				basicSetup,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						code = update.state.doc.toString();
					}
				}),
			],
			parent: editorElement,
		});
	});
</script>

<div class="h-screen w-screen relative bg-gray-50">
	<div bind:this={editorElement} class="h-full"></div>
</div>

<style>
</style>
