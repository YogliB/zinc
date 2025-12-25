import type { Meta, StoryObj } from '@storybook/preact-vite';

import { EditorView } from './editor-view';
import { OpenFile } from '../../../lib/types';

const meta: Meta<typeof EditorView> = {
	component: EditorView,
	title: 'Templates/EditorView',
};

export default meta;

type Story = StoryObj<typeof EditorView>;

const sampleOpenFiles: OpenFile[] = [
	{
		path: '/example/project/src/main.ts',
		name: 'main.ts',
		content: 'console.log("Hello, World!");',
	},
];

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
		openFiles: sampleOpenFiles,
		activeFilePath: '/example/project/src/main.ts',
		onExpand: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onSelect: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onTabSelect: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onTabClose: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
		onEditorChange: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	},
};
