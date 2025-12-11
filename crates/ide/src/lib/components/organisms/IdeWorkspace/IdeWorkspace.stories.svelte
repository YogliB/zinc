<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IdeWorkspace from './IdeWorkspace.svelte';

	const { Story } = defineMeta({
		component: IdeWorkspace,
		title: 'Organisms/IdeWorkspace',
	});
</script>

<Story
	name="Default"
	args={{
		folderNodes: [
			{
				name: 'src',
				type: 'folder',
				path: '/src',
				children: [
					{
						name: 'main.ts',
						type: 'file',
						path: '/src/main.ts',
					},
				],
			},
			{
				name: 'README.md',
				type: 'file',
				path: '/README.md',
			},
		],
		messages: [
			{ role: 'user', content: 'Hello' },
			{ role: 'assistant', content: 'Hi there!' },
		],
		userInput: '',
		settings: { apiKey: '', model: 'anthropic/claude-3-haiku', aiEnabled: true },
		code: '// Sample code\nconsole.log("Hello, world!");',
		onSelect: (path) => console.log('File selected:', path),
		onOpenFolder: () => console.log('Open folder'),
		openFile: () => console.log('Open file'),
		saveFile: () => console.log('Save file'),
		sendMessage: () => console.log('Send message'),
		loadSettings: () => console.log('Load settings'),
		saveSettings: () => console.log('Save settings'),
	}}
/>
