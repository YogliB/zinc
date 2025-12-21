import type { Meta, StoryObj } from '@storybook/preact-vite';

import { WelcomeScreen } from './welcome-screen';

const meta: Meta<typeof WelcomeScreen> = {
	component: WelcomeScreen,
	title: 'Templates/WelcomeScreen',
};

export default meta;

type Story = StoryObj<typeof WelcomeScreen>;

export const Mac: Story = {
	args: {
		os: 'mac',
		onOpenProject() {}, // eslint-disable-line @typescript-eslint/no-empty-function
	},
};

export const Windows: Story = {
	args: {
		os: 'windows',
		onOpenProject() {}, // eslint-disable-line @typescript-eslint/no-empty-function
	},
};

export const Linux: Story = {
	args: {
		os: 'linux',
		onOpenProject() {}, // eslint-disable-line @typescript-eslint/no-empty-function
	},
};
