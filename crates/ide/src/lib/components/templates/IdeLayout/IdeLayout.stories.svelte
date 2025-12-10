<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IdeLayout from './IdeLayout.svelte';
	import { CodeEditor } from '../../organisms/CodeEditor';
	import { ChatPanel } from '../../organisms/ChatPanel';

	const { Story } = defineMeta({
		component: IdeLayout,
		title: 'Templates/IdeLayout',
	});
</script>

<Story name="Default Layout">
	<IdeLayout>
		{#snippet leftSidebar()}
			<div class="p-4 bg-gray-100">
				<h2>Left Sidebar</h2>
				<p>File tree here.</p>
			</div>
		{/snippet}
		{#snippet main()}
			<div class="p-4">
				<h1>Main Content</h1>
				<p>This is the main area.</p>
			</div>
		{/snippet}
		{#snippet rightSidebar()}
			<div class="p-4 bg-white">
				<h2>Right Sidebar</h2>
				<p>This is the sidebar.</p>
			</div>
		{/snippet}
	</IdeLayout>
</Story>

<Story name="With Components">
	<IdeLayout>
		{#snippet leftSidebar()}
			<div class="p-4 bg-gray-100">File Tree</div>
		{/snippet}
		{#snippet main()}
			<CodeEditor
				code="console.log('Hello');"
				openFile={() => {}}
				saveFile={() => {}}
			/>
		{/snippet}
		{#snippet rightSidebar()}
			<ChatPanel
				messages={[{ role: 'user', content: 'Hello' }]}
				userInput=""
				sendMessage={() => {}}
				aiEnabled={true}
			/>
		{/snippet}
	</IdeLayout>
</Story>
