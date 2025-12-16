import type { Meta, StoryObj } from '@storybook/preact-vite';
import { Icon } from './icon';

const meta: Meta<typeof Icon> = {
	title: 'Atoms/Icon',
	component: Icon,
	parameters: {
		layout: 'centered',
	},
	argTypes: {
		type: {
			control: { type: 'select' },
			options: ['file', 'folder'],
		},
	},
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const File: Story = {
	args: {
		type: 'file',
	},
};

export const Folder: Story = {
	args: {
		type: 'folder',
	},
};

export const WithClassName: Story = {
	args: {
		type: 'folder',
		className: 'w-8 h-8 text-blue-500',
	},
};
