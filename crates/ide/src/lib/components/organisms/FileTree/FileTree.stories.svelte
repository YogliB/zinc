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

<Story
	name="Complex"
	args={{
		nodes: [
			{
				name: 'src',
				type: 'folder',
				path: '/src',
				children: [
					{
						name: 'components',
						type: 'folder',
						path: '/src/components',
						children: [
							{
								name: 'ui',
								type: 'folder',
								path: '/src/components/ui',
								children: [
									{
										name: 'Button.tsx',
										type: 'file',
										path: '/src/components/ui/Button.tsx',
									},
									{
										name: 'Input.tsx',
										type: 'file',
										path: '/src/components/ui/Input.tsx',
									},
									{
										name: 'Modal.tsx',
										type: 'file',
										path: '/src/components/ui/Modal.tsx',
									},
								],
							},
							{
								name: 'pages',
								type: 'folder',
								path: '/src/components/pages',
							},
						],
					},
					{
						name: 'utils',
						type: 'folder',
						path: '/src/utils',
						children: [
							{
								name: 'helpers.js',
								type: 'file',
								path: '/src/utils/helpers.js',
							},
							{
								name: 'constants.ts',
								type: 'file',
								path: '/src/utils/constants.ts',
							},
						],
					},
					{
						name: 'index.js',
						type: 'file',
						path: '/src/index.js',
					},
				],
			},
			{
				name: 'tests',
				type: 'folder',
				path: '/tests',
				children: [
					{
						name: 'unit',
						type: 'folder',
						path: '/tests/unit',
					},
					{
						name: 'integration',
						type: 'folder',
						path: '/tests/integration',
					},
				],
			},
			{
				name: 'package.json',
				type: 'file',
				path: '/package.json',
			},
			{
				name: 'README.md',
				type: 'file',
				path: '/README.md',
			},
			{
				name: 'very-long-file-name-that-might-cause-wrapping-issues.txt',
				type: 'file',
				path: '/very-long-file-name-that-might-cause-wrapping-issues.txt',
			},
		],
		onSelect: (path) => console.log('Selected:', path),
	}}
/>
