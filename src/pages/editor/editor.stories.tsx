import type { Meta, StoryObj } from '@storybook/preact-vite';

import { EditorPage } from './editor';

const meta: Meta<typeof EditorPage> = {
	component: EditorPage,
	title: 'Pages/Editor',
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		os: {
			control: { type: 'select' },
			options: ['mac', 'windows', 'linux'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof EditorPage>;

export const Default: Story = {
	args: {
		os: 'mac',
	},
};

export const Windows: Story = {
	args: {
		os: 'windows',
	},
};

export const Linux: Story = {
	args: {
		os: 'linux',
	},
};
