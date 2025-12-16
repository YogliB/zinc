import type { Meta, StoryObj } from '@storybook/preact-vite';
import { TreeItem } from './tree-item';
import { TreeNode } from '../../lib/types';

const sampleFile: TreeNode = {
	name: 'example.txt',
	type: 'file',
};

const sampleFolder: TreeNode = {
	name: 'src',
	type: 'folder',
	children: [
		{ name: 'main.ts', type: 'file' },
		{ name: 'utils.ts', type: 'file' },
	],
};

const meta: Meta<typeof TreeItem> = {
	title: 'Molecules/TreeItem',
	component: TreeItem,
	parameters: {
		layout: 'padded',
	},
};

export default meta;
type Story = StoryObj<typeof TreeItem>;

export const File: Story = {
	args: {
		node: sampleFile,
	},
};

export const Folder: Story = {
	args: {
		node: sampleFolder,
	},
};

export const Nested: Story = {
	args: {
		node: {
			name: 'root',
			type: 'folder',
			children: [sampleFolder, { name: 'README.md', type: 'file' }],
		},
	},
};
