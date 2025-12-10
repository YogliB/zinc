<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FileTree from './FileTree.svelte';

	const { Story } = defineMeta({
		component: FileTree,
		title: 'Organisms/FileTree',
	});
</script>

<Story
	name="Default"
	args={{
		nodes: [
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
					{
						name: 'components',
						type: 'folder',
						path: '/src/components',
						children: [
							{
								name: 'Button.svelte',
								type: 'file',
								path: '/src/components/Button.svelte',
							},
						],
					},
				],
			},
			{
				name: 'package.json',
				type: 'file',
				path: '/package.json',
			},
		],
		onSelect: (path) => console.log('Selected:', path),
	}}
/>
