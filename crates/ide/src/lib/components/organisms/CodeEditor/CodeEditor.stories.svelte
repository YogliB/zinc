<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import CodeEditor from './CodeEditor.svelte';

	const { Story } = defineMeta({
		component: CodeEditor,
		title: 'Organisms/CodeEditor',
	});
</script>

<Story
	name="Default"
	args={{
		code: 'console.log("Hello World");',
		openFile: () => {},
		saveFile: () => {},
	}}
>
	<CodeEditor
		code="console.log('Hello World');"
		openFile={() => {}}
		saveFile={() => {}}
	/>
</Story>

<Story
	name="Empty Code"
	args={{ code: '', openFile: () => {}, saveFile: () => {} }}
>
	<CodeEditor code="" openFile={() => {}} saveFile={() => {}} />
</Story>

<Story
	name="With Functions"
	args={{
		code: `function test() {
  return "test";
}`,
		openFile: () => console.log('Open file'),
		saveFile: () => console.log('Save file'),
	}}
>
	<CodeEditor
		code={`function test() {
  return "test";
}`}
		openFile={() => console.log('Open file')}
		saveFile={() => console.log('Save file')}
	/>
</Story>
