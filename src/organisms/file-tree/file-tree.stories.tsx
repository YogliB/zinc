import type { Meta, StoryObj } from '@storybook/preact-vite';
import { FileTree } from './file-tree';
import { TreeNode } from '../../lib/types';

const sampleNodes: TreeNode[] = [
	{
		name: 'src',
		type: 'folder',
		children: [
			{ name: 'main.ts', type: 'file' },
			{ name: 'utils.ts', type: 'file' },
		],
	},
	{ name: 'README.md', type: 'file' },
];

const meta: Meta<typeof FileTree> = {
	title: 'Organisms/FileTree',
	component: FileTree,
	parameters: {
		layout: 'padded',
	},
};

export default meta;
type Story = StoryObj<typeof FileTree>;

export const Default: Story = {
	args: {
		nodes: sampleNodes,
	},
};

export const Empty: Story = {
	args: {
		nodes: [],
	},
};
