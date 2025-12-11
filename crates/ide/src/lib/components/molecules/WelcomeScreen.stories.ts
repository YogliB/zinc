import type { Meta, StoryObj } from '@storybook/svelte';
import WelcomeScreen from './WelcomeScreen.svelte';

const meta: Meta<typeof WelcomeScreen> = {
  title: 'Molecules/WelcomeScreen',
  component: WelcomeScreen,
  argTypes: {
    onOpenFolder: { action: 'openFolder' },
    onOpenFile: { action: 'openFile' },
    version: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof WelcomeScreen>;

export const Default: Story = {
  args: {
    version: 'v0.1.0',
  },
};
