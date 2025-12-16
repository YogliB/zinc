import type { Meta, StoryObj } from '@storybook/preact-vite';

import { WelcomePage } from './welcome';

const meta: Meta<typeof WelcomePage> = {
	component: WelcomePage,
	title: 'Pages/Welcome',
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

type Story = StoryObj<typeof WelcomePage>;

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
