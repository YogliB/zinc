import type { Meta, StoryObj } from '@storybook/preact-vite';

import { EditorView } from './editor-view';

const meta: Meta<typeof EditorView> = {
	component: EditorView,
	title: 'Templates/EditorView',
};

export default meta;

type Story = StoryObj<typeof EditorView>;

export const Default: Story = {
	args: {
		treeNodes: [
			{
				name: 'src',
				type: 'folder',
				path: '/example/project/src',
				children: [
					{
						name: 'main.ts',
						type: 'file',
						path: '/example/project/src/main.ts',
					},
				],
			},
		],
		editorValue: 'console.log("Hello, World!");',
		onExpand: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onSelect: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onEditorChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	},
};
