import type { Meta, StoryObj } from '@storybook/preact-vite';

import { Button } from './button';

const meta: Meta<typeof Button> = {
	component: Button,
	title: 'Atoms/Button',
	parameters: {
		layout: 'centered',
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
	args: {
		children: 'Click me',
	},
};

export const WithClassName: Story = {
	args: {
		children: 'Styled Button',
		className: 'bg-blue-500 text-white px-4 py-2 rounded',
	},
};
